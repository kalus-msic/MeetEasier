# MeetEasier

Web app that visualizes meeting room availability for Microsoft 365 / Exchange Online. This is a customized fork that **uses Microsoft Graph API + OAuth** instead of the legacy EWS basic-auth flow used by the upstream project.

![Mockup](mockups/mockup-1.png)

This fork is based on [Collie147/MeetEasier](https://github.com/Collie147/MeetEasier), which itself forks [danxfisher/MeetEasier](https://github.com/danxfisher/MeetEasier).

## Highlights of this fork

- **Microsoft Graph API** as primary backend (`app/msgraph/`) with EWS retained as legacy fallback
- **OAuth 2.0 client credentials** flow via `@azure/msal-node` — no shared mailbox passwords
- All credentials loaded from `.env` (no hardcoded fallbacks)
- Extra UI components: back button, room search, booking modal, single-room display variants
- Cleaned up `.gitignore` so secrets, MSAL token cache, and editor backups never leave your machine

## Known limitations

- **Booking from the single-room display is currently disabled.** The original UI offered "book / extend / end meeting" buttons that called EWS endpoints. Those endpoints no longer work reliably with modern Microsoft 365 tenants, and the booking flow has not yet been ported to Microsoft Graph. The relevant controls are therefore hidden in the single-room layout. Re-enabling them would require implementing a Graph-based booking handler in `app/msgraph/roombooking.js` and re-exposing the modal in `ui-react/src/components/single-room/`.

## Tech stack

- **Backend:** Node.js (≥ 18, tested on 20 LTS), Express, Socket.IO
- **Auth:** `@azure/msal-node` (Graph) or `ews-javascript-api` (legacy)
- **Frontend:** React (Create React App)
- **Process manager:** PM2 (recommended) or systemd

## Prerequisites

- Microsoft 365 tenant with conference-room mailboxes organized in **room lists**
- An [Azure AD app registration](https://learn.microsoft.com/en-us/graph/auth-register-app-v2) with application permissions:
  - `Place.Read.All`
  - `Calendars.Read`
- A web server with Node.js installed
- Reverse proxy with TLS (nginx / Caddy / IIS) is strongly recommended for production

## Installation

```bash
git clone https://github.com/kalus-msic/MeetEasier.git
cd MeetEasier
cp .env.template .env
$EDITOR .env                          # fill in OAUTH_* and DOMAIN
npm ci
cd ui-react && npm ci && npm run build && cd ..
```

## Running

### Development
```bash
npm start                             # backend on PORT
npm run start-ui-dev                  # CRA dev server with hot reload
```

### Production with PM2
```bash
pm2 start server.js --name meeteasier
pm2 save
pm2 startup                           # follow the printed sudo command
```

## Configuration

### Environment variables (`.env`)

| Variable | Description |
|---|---|
| `OAUTH_CLIENT_ID` | Azure AD app registration client ID |
| `OAUTH_AUTHORITY` | `https://login.microsoftonline.com/<tenant-id>` |
| `OAUTH_CLIENT_SECRET` | Client secret **value** (not the secret ID) |
| `DOMAIN` | Mail domain used for room mailboxes (e.g. `contoso.com`) |
| `SEARCH_USE_GRAPHAPI` | `true` (recommended) — set `false` to fall back to EWS |
| `SEARCH_MAXROOMLISTS` | Max number of room lists to fetch (default `10`) |
| `SEARCH_MAXDAYS` | Max number of days to look ahead (default `10`) |
| `SEARCH_MAXITEMS` | Max meetings per room (default `6`) |
| `PORT` | HTTP port (default `8080`) |
| `EWS_USERNAME`, `EWS_PASSWORD`, `EWS_URI` | Only needed when `SEARCH_USE_GRAPHAPI=false` (legacy) |
| `REACT_APP_ROOMLIST` | Show the room-list dropdown in the UI (`true`/`false`) — must be present in `ui-react/.env` at build time |

### Room blacklist

Exclude specific rooms from the display in `config/room-blacklist.js`:

```js
module.exports = {
  roomEmails: ['boardroom@contoso.com']
};
```

### UI customization

- App title, status labels, filter labels: `ui-react/src/config/flightboard.config.js`
- Single-room display labels: `ui-react/src/config/singleRoom.config.js`
- Logo: replace `static/img/logo.png`

## Folder structure

```
app/
  ews/         legacy Exchange Web Services routes
  msgraph/     Microsoft Graph routes (default)
  routes.js    chooses Graph or EWS based on SEARCH_USE_GRAPHAPI
  socket-controller.js
config/
  config.js          MSAL + EWS settings, all values from .env
  room-blacklist.js
data/
  cache.json         MSAL token cache (gitignored)
mockups/
scss/                global SCSS sources
static/              public assets
ui-react/
  src/components/
    flightboard/   meeting-list ("flightboard") layout
    single-room/   single-room display
    global/        shared
  src/config/      runtime configuration
  src/layouts/
server.js
```

## Layouts

### Flightboard

![Flightboard](mockups/mockup-3.png)

### Single Room

![Single Room](mockups/mockup-2.png)

## Updating

```bash
cd /opt/MeetEasier
git pull origin master
npm ci
cd ui-react && npm ci && npm run build && cd ..
pm2 restart meeteasier
```

## License

Released under [GPL 3.0](https://github.com/danxfisher/MeetEasier/blob/master/LICENSE), inherited from the upstream project.

## Credits

- Original project: [danxfisher/MeetEasier](https://github.com/danxfisher/MeetEasier)
- Intermediate fork: [Collie147/MeetEasier](https://github.com/Collie147/MeetEasier)
- Graph API references: [`@microsoft/microsoft-graph-client`](https://github.com/microsoftgraph/msgraph-sdk-javascript), [`@azure/msal-node`](https://github.com/AzureAD/microsoft-authentication-library-for-js)
