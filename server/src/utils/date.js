/**
 * @param {string} yyyyMmDd - e.g. 2026-04-07
 * @returns {Date} UTC midnight for that calendar day
 */
export function parseDay(yyyyMmDd) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) {
    throw new Error('Invalid date format; use YYYY-MM-DD');
  }
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}

export function formatDay(date) {
  return date.toISOString().slice(0, 10);
}
