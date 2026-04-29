import { fmtDateShortCz, isSameLocalDay, shouldShowHero } from './glassShared';

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
