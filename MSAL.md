# Azure AD app registration & room mailbox setup

End-to-end checklist for configuring the Microsoft 365 side of MeetEasier so the Graph API path works.

## 1. Register the application

1. Go to <https://aad.portal.azure.com> → **App registrations** → **New registration**
2. Choose any name (e.g. `MeetEasier`), **Single tenant**, redirect URL `http://localhost:8888/redirect`
3. Click **Register**

## 2. Create a client secret

1. Open the newly created app
2. **Certificates & secrets** → **New client secret**
3. Add a description and expiration period
4. Copy the **secret value** immediately (not the secret ID — the value is shown only once) and put it into `.env` as `OAUTH_CLIENT_SECRET`

Also copy the **Application (client) ID** and **Directory (tenant) ID** from the app's *Overview* page into `OAUTH_CLIENT_ID` and `OAUTH_AUTHORITY` (`https://login.microsoftonline.com/<tenant-id>`).

## 3. Grant API permissions

**API permissions** → **Add a permission** → **Microsoft Graph** → **Application permissions**:

- `Calendars.Read`
- `Place.Read.All`
- `Calendars.ReadWrite` *(only if booking from the single-room display is enabled)*

Click **Grant admin consent** for the tenant after adding them.

## 4. Create rooms and a room list

In <https://admin.microsoft.com> go to **Resources** → **Rooms & equipment** and add each meeting room (display name + email).

Then group them into a *room list* via PowerShell:

```powershell
Connect-ExchangeOnline

New-DistributionGroup -Name "Headquarters" -RoomList

Add-DistributionGroupMember -Identity "Headquarters" -Member person1@example.com
Add-DistributionGroupMember -Identity "Headquarters" -Member person2@example.com
```

## 5. Make subjects and organizers visible

By default, room mailboxes strip the original meeting subject and organizer. Restore them so MeetEasier can show "Booked by …" and the actual subject:

```powershell
Set-CalendarProcessing -Identity person1@example.com `
    -DeleteSubject $False `
    -AddOrganizerToSubject $False `
    -RemovePrivateProperty $false

Set-CalendarProcessing -Identity person2@example.com `
    -DeleteSubject $False `
    -AddOrganizerToSubject $False `
    -RemovePrivateProperty $false
```

## Verifying the configuration

```powershell
# List room mailboxes and their calendar processing settings
Get-Mailbox -ResultSize unlimited -Filter "RecipientTypeDetails -eq 'RoomMailbox'" |
    Get-CalendarProcessing |
    Format-List Identity,ScheduleOnlyDuringWorkHours,MaximumDurationInMinutes

# Inspect a single room
Get-CalendarProcessing -Identity person1@example.com | Format-List
```

> **Heads up:** Microsoft Graph propagation can take **several hours**. A freshly created room list will not appear in the API immediately — give it time before assuming the configuration is wrong.

## Removing a room list

```powershell
Remove-DistributionGroup -Identity "Headquarters"
```

Then delete the resources in <https://admin.microsoft.com>.

## References

- Microsoft docs: [Calendar shows organizer's name instead of meeting subject](https://learn.microsoft.com/en-us/exchange/troubleshoot/client-connectivity/calendar-shows-organizer-name)
- Microsoft docs: [Register an app with the Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2)
