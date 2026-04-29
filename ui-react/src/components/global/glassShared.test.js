import { fmtDateShortCz, isSameLocalDay } from './glassShared';

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
