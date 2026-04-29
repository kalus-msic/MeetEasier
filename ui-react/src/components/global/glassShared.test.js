import { fmtDateShortCz, isSameLocalDay, shouldShowHero, fmtDurationHm } from './glassShared';

describe('fmtDateShortCz', () => {
  it('formats 30 April as "30. 4."', () => {
    // Months are 0-indexed in Date: April = 3
    expect(fmtDateShortCz(new Date(2026, 3, 30))).toBe('30. 4.');
  });

  it('formats 1 May as "1. 5." (no leading zeros)', () => {
    expect(fmtDateShortCz(new Date(2026, 4, 1))).toBe('1. 5.');
  });

  it('formats 5 January as "5. 1."', () => {
    expect(fmtDateShortCz(new Date(2026, 0, 5))).toBe('5. 1.');
  });

  it('formats 31 December as "31. 12."', () => {
    expect(fmtDateShortCz(new Date(2026, 11, 31))).toBe('31. 12.');
  });
});

describe('isSameLocalDay', () => {
  it('returns true for the same instant', () => {
    const a = new Date(2026, 3, 29, 14, 0);
    const b = new Date(2026, 3, 29, 14, 0);
    expect(isSameLocalDay(a, b)).toBe(true);
  });

  it('returns true for different times on the same calendar day', () => {
    const a = new Date(2026, 3, 29, 0, 0);
    const b = new Date(2026, 3, 29, 23, 59);
    expect(isSameLocalDay(a, b)).toBe(true);
  });

  it('returns false across a midnight boundary', () => {
    const a = new Date(2026, 3, 29, 23, 59);
    const b = new Date(2026, 3, 30, 0, 0);
    expect(isSameLocalDay(a, b)).toBe(false);
  });

  it('returns false across a month boundary', () => {
    const a = new Date(2026, 3, 30, 23, 59);
    const b = new Date(2026, 4, 1, 0, 0);
    expect(isSameLocalDay(a, b)).toBe(false);
  });

  it('returns false across a year boundary', () => {
    const a = new Date(2026, 11, 31, 23, 59);
    const b = new Date(2027, 0, 1, 0, 0);
    expect(isSameLocalDay(a, b)).toBe(false);
  });
});

describe('shouldShowHero', () => {
  const now = new Date(2026, 3, 29, 14, 0);
  const todayLater = { Start: String(new Date(2026, 3, 29, 16, 0).getTime()) };
  const tomorrow = { Start: String(new Date(2026, 3, 30, 11, 0).getTime()) };
  const nextWeek = { Start: String(new Date(2026, 4, 6, 9, 0).getTime()) };

  it('returns true for occupied regardless of featured event', () => {
    expect(shouldShowHero('occupied', todayLater, now)).toBe(true);
    expect(shouldShowHero('occupied', null, now)).toBe(true);
  });

  it('returns true for soon when featured event is present', () => {
    expect(shouldShowHero('soon', todayLater, now)).toBe(true);
  });

  it('returns false for soon when featured event is missing', () => {
    expect(shouldShowHero('soon', null, now)).toBe(false);
  });

  it('returns true for free when featured event is later today', () => {
    expect(shouldShowHero('free', todayLater, now)).toBe(true);
  });

  it('returns false for free when featured event is tomorrow', () => {
    expect(shouldShowHero('free', tomorrow, now)).toBe(false);
  });

  it('returns false for free when featured event is next week', () => {
    expect(shouldShowHero('free', nextWeek, now)).toBe(false);
  });

  it('returns false for free when there is no featured event', () => {
    expect(shouldShowHero('free', null, now)).toBe(false);
  });

  it('returns false for unknown state', () => {
    expect(shouldShowHero('whatever', todayLater, now)).toBe(false);
  });
});

describe('fmtDurationHm', () => {
  it('returns exact minutes below 90', () => {
    expect(fmtDurationHm(0)).toBe('0 min');
    expect(fmtDurationHm(5)).toBe('5 min');
    expect(fmtDurationHm(60)).toBe('60 min');
    expect(fmtDurationHm(89)).toBe('89 min');
  });

  it('rounds to half-hour from 90 min to under 24 h', () => {
    expect(fmtDurationHm(90)).toBe('1,5 h');     // 1h30 boundary
    expect(fmtDurationHm(120)).toBe('2 h');       // exact
    expect(fmtDurationHm(134)).toBe('2 h');       // 2h14 → floor (rem < 15)
    expect(fmtDurationHm(135)).toBe('2,5 h');     // 2h15 → half (rem >= 15)
    expect(fmtDurationHm(150)).toBe('2,5 h');     // 2h30 → half
    expect(fmtDurationHm(164)).toBe('2,5 h');     // 2h44 → half
    expect(fmtDurationHm(165)).toBe('3 h');       // 2h45 → ceil (rem >= 45)
    expect(fmtDurationHm(691)).toBe('11,5 h');    // 11h31 — the screenshot case
    expect(fmtDurationHm(720)).toBe('12 h');
    expect(fmtDurationHm(60 * 23)).toBe('23 h');
  });

  it('rounds to half-day at and above 24 h', () => {
    expect(fmtDurationHm(60 * 24)).toBe('1 d');                  // exact day
    expect(fmtDurationHm(60 * 24 + 60)).toBe('1 d');             // 1d 1h → floor (rem < 6h)
    expect(fmtDurationHm(60 * 24 + 360)).toBe('1,5 d');          // 1d 6h → half
    expect(fmtDurationHm(60 * 24 + 720)).toBe('1,5 d');          // 1d 12h → half
    expect(fmtDurationHm(60 * 24 + 1079)).toBe('1,5 d');         // 1d 17h59 → half
    expect(fmtDurationHm(60 * 24 + 1080)).toBe('2 d');           // 1d 18h → ceil (rem >= 18h)
    expect(fmtDurationHm(60 * 48)).toBe('2 d');
    expect(fmtDurationHm(60 * 24 * 4 + 60 * 11)).toBe('4,5 d');  // 4d 11h — the screenshot case
  });

  it('honours custom suffixes when provided', () => {
    expect(fmtDurationHm(45, { minute: 'minut', hour: 'hodin', day: 'dní' })).toBe('45 minut');
    expect(fmtDurationHm(150, { minute: 'minut', hour: 'hodin', day: 'dní' })).toBe('2,5 hodin');
    expect(fmtDurationHm(60 * 24 + 360, { minute: 'minut', hour: 'hodin', day: 'dní' })).toBe('1,5 dní');
  });
});
