import {
  SNAP_MIN,
  fmtMin,
  snap,
  generateDayStrip,
  filterEventsForDay,
  collidesWith,
  clampSelection,
  appointmentMinutesOnDay,
} from './glassBookingHelpers';

describe('fmtMin', () => {
  it('formats minutes from midnight as HH:MM with zero padding', () => {
    expect(fmtMin(0)).toBe('00:00');
    expect(fmtMin(9 * 60 + 5)).toBe('09:05');
    expect(fmtMin(13 * 60 + 30)).toBe('13:30');
    expect(fmtMin(23 * 60 + 59)).toBe('23:59');
  });
});

describe('snap', () => {
  it('rounds to nearest SNAP_MIN (15) boundary', () => {
    expect(SNAP_MIN).toBe(15);
    expect(snap(0)).toBe(0);
    expect(snap(7)).toBe(0);
    expect(snap(8)).toBe(15);
    expect(snap(22)).toBe(15);
    expect(snap(23)).toBe(30);
    expect(snap(60)).toBe(60);
  });
});

describe('generateDayStrip', () => {
  it('returns 7 consecutive days starting at startOffset, with metadata', () => {
    const today = new Date(2026, 3, 29); // 2026-04-29 (month 3 = April)
    const days = generateDayStrip(today, 0, 10);
    expect(days).toHaveLength(7);
    expect(days[0].offset).toBe(0);
    expect(days[0].isToday).toBe(true);
    expect(days[0].isPast).toBe(false);
    expect(days[0].isAllowed).toBe(true);
    expect(days[6].offset).toBe(6);
    expect(days[6].isToday).toBe(false);
  });

  it('marks days beyond maxAhead as not allowed', () => {
    const today = new Date(2026, 3, 29);
    const days = generateDayStrip(today, 7, 10); // offsets 7..13, max 10
    expect(days[0].offset).toBe(7);
    expect(days[3].offset).toBe(10);
    expect(days[3].isAllowed).toBe(false); // offset == maxAhead is exclusive
    expect(days[6].isAllowed).toBe(false);
  });
});

describe('filterEventsForDay', () => {
  const ev = (startISO, endISO, subject = 'X', organizer = 'O') => ({
    Start: String(new Date(startISO).getTime()),
    End: String(new Date(endISO).getTime()),
    Subject: subject,
    Organizer: organizer,
  });

  it('returns events that overlap the given day in minutes-from-midnight form', () => {
    const day = new Date(2026, 3, 29);
    const events = [
      ev('2026-04-28T10:00:00', '2026-04-28T11:00:00'),
      ev('2026-04-29T09:00:00', '2026-04-29T10:00:00'),
      ev('2026-04-29T13:30:00', '2026-04-29T14:30:00'),
      ev('2026-04-30T08:00:00', '2026-04-30T09:00:00'),
    ];
    const filtered = filterEventsForDay(events, day);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].startMin).toBe(9 * 60);
    expect(filtered[0].endMin).toBe(10 * 60);
    expect(filtered[1].startMin).toBe(13 * 60 + 30);
    expect(filtered[1].endMin).toBe(14 * 60 + 30);
  });

  it('clips events that span across midnight at the day boundaries', () => {
    const day = new Date(2026, 3, 29);
    const events = [
      ev('2026-04-28T22:00:00', '2026-04-29T01:00:00'),
      ev('2026-04-29T22:00:00', '2026-04-30T02:00:00'),
    ];
    const filtered = filterEventsForDay(events, day);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].startMin).toBe(0);
    expect(filtered[0].endMin).toBe(60);
    expect(filtered[1].startMin).toBe(22 * 60);
    expect(filtered[1].endMin).toBe(24 * 60);
  });
});

describe('collidesWith', () => {
  const events = [
    { startMin: 9 * 60, endMin: 9 * 60 + 30 },
    { startMin: 11 * 60, endMin: 12 * 60 },
  ];

  it('returns true when window overlaps an event', () => {
    expect(collidesWith(9 * 60, 9 * 60 + 30, events)).toBe(true);
    expect(collidesWith(9 * 60 + 15, 9 * 60 + 45, events)).toBe(true);
    expect(collidesWith(11 * 60 + 30, 12 * 60 + 30, events)).toBe(true);
  });

  it('returns false when window is entirely between events', () => {
    expect(collidesWith(10 * 60, 10 * 60 + 30, events)).toBe(false);
    expect(collidesWith(8 * 60, 8 * 60 + 30, events)).toBe(false);
    expect(collidesWith(13 * 60, 13 * 60 + 30, events)).toBe(false);
  });

  it('treats touching boundaries as non-overlap', () => {
    expect(collidesWith(8 * 60, 9 * 60, events)).toBe(false);
    expect(collidesWith(9 * 60 + 30, 10 * 60, events)).toBe(false);
    expect(collidesWith(12 * 60, 13 * 60, events)).toBe(false);
  });
});

describe('clampSelection', () => {
  const events = [
    { startMin: 11 * 60, endMin: 12 * 60 },
  ];
  const dayStart = 7 * 60;
  const dayEnd = 21 * 60;

  it('shortens end to next event start when overlap would occur', () => {
    const r = clampSelection(10 * 60, 11 * 60 + 30, events, dayStart, dayEnd);
    expect(r.startMin).toBe(10 * 60);
    expect(r.endMin).toBe(11 * 60);
  });

  it('clamps start up to previous event end when overlap would occur on top', () => {
    const r = clampSelection(11 * 60 + 30, 13 * 60, events, dayStart, dayEnd);
    expect(r.startMin).toBe(12 * 60);
    expect(r.endMin).toBe(13 * 60);
  });

  it('clamps to working-hour window', () => {
    const r1 = clampSelection(6 * 60, 8 * 60, [], dayStart, dayEnd);
    expect(r1.startMin).toBe(dayStart);
    const r2 = clampSelection(20 * 60, 22 * 60, [], dayStart, dayEnd);
    expect(r2.endMin).toBe(dayEnd);
  });
});

describe('appointmentMinutesOnDay', () => {
  it('returns minutes since day start for times inside the day', () => {
    const day = new Date(2026, 3, 29);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    expect(appointmentMinutesOnDay(dayStart, day)).toBe(0);

    const midday = new Date(dayStart);
    midday.setHours(12, 30, 0, 0);
    expect(appointmentMinutesOnDay(midday, day)).toBe(12 * 60 + 30);

    const lateInDay = new Date(dayStart);
    lateInDay.setHours(23, 59, 0, 0);
    expect(appointmentMinutesOnDay(lateInDay, day)).toBe(23 * 60 + 59);
  });

  it('returns null for times outside the given day', () => {
    const day = new Date(2026, 3, 29);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const beforeDay = new Date(dayStart.getTime() - 1000);
    expect(appointmentMinutesOnDay(beforeDay, day)).toBe(null);

    const nextMidnight = new Date(dayStart);
    nextMidnight.setDate(dayStart.getDate() + 1);
    expect(appointmentMinutesOnDay(nextMidnight, day)).toBe(null);
  });
});
