// Pure helpers for the Glass booking modal. No React, no DOM, no side effects.

export const SNAP_MIN = 15;

export function fmtMin(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return (
    String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0')
  );
}

export function snap(min) {
  return Math.round(min / SNAP_MIN) * SNAP_MIN;
}

// Returns array of 7 day descriptors starting at `startOffset` from `today`.
// Each descriptor has: { date, offset, isToday, isPast, isAllowed }.
// `maxAhead` is exclusive: offsets 0..maxAhead-1 are bookable.
export function generateDayStrip(today, startOffset, maxAhead) {
  const result = [];
  const base = new Date(today);
  base.setHours(0, 0, 0, 0);
  for (let i = 0; i < 7; i++) {
    const offset = startOffset + i;
    const d = new Date(base);
    d.setDate(base.getDate() + offset);
    result.push({
      date: d,
      offset: offset,
      isToday: offset === 0,
      isPast: offset < 0,
      isAllowed: offset >= 0 && offset < maxAhead,
    });
  }
  return result;
}

// Convert raw socket appointments (Start/End as epoch-ms strings) into
// per-day events with startMin/endMin in minutes-from-midnight, clipped
// to [0, 1440) when the event spans across the day boundary.
export function filterEventsForDay(appointments, day) {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 1);

  const result = [];
  for (let i = 0; i < appointments.length; i++) {
    const a = appointments[i];
    const s = new Date(parseInt(a.Start, 10));
    const e = new Date(parseInt(a.End, 10));
    if (e <= dayStart || s >= dayEnd) continue;
    const startClipped = s < dayStart ? dayStart : s;
    const endClipped = e > dayEnd ? dayEnd : e;
    const startMin =
      (startClipped - dayStart) / 60000 | 0;
    const endMin =
      (endClipped - dayStart) / 60000 | 0;
    result.push({
      startMin: startMin,
      endMin: endMin,
      subject: a.Subject || '',
      organizer: a.Organizer || '',
      raw: a,
    });
  }
  return result.sort(function (a, b) { return a.startMin - b.startMin; });
}

// Strict overlap (touching boundaries do NOT count as collision).
export function collidesWith(startMin, endMin, events) {
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (startMin < ev.endMin && endMin > ev.startMin) return true;
  }
  return false;
}

// Given a desired { startMin, endMin } selection, day events, and working-
// hour bounds, push the selection back inside legal space:
//  - if it overlaps an event from the bottom, shrink endMin to ev.startMin
//  - if it overlaps an event from the top, push startMin up to ev.endMin
//  - clamp to [dayStart, dayEnd]
// Caller is responsible for ensuring final duration >= SNAP_MIN.
export function clampSelection(startMin, endMin, events, dayStart, dayEnd) {
  let s = Math.max(dayStart, startMin);
  let e = Math.min(dayEnd, endMin);
  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    // overlap from bottom
    if (s < ev.startMin && e > ev.startMin && s < ev.endMin) {
      e = ev.startMin;
    }
    // overlap from top
    if (s < ev.endMin && s >= ev.startMin && e > ev.startMin) {
      s = ev.endMin;
    }
  }
  if (e < s) e = s;
  return { startMin: s, endMin: e };
}

// Returns minutes-since-day-start for "now" relative to a given day.
// Returns null if "now" is not inside that day.
export function appointmentMinutesOnDay(now, day) {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 1);
  if (now < dayStart || now >= dayEnd) return null;
  return (now - dayStart) / 60000 | 0;
}
