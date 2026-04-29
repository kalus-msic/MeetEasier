import { fmtDateShortCz } from './glassShared';

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
