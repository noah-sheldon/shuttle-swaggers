// lib/utils/dateHelpers.ts

/**
 * Returns a Date object representing today's date at 00:00:00 UTC.
 * This is the safest date baseline for cron and session generation.
 */
export function getStartOfTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );
}

/**
 * Normalizes any date (string or Date) to start-of-day UTC.
 * Use this to compare session dates and prevent duplicates.
 */
export function normalizeToUTCDate(d: Date | string): Date {
  const date = new Date(d);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

/**
 * Returns the next date that matches one of the specified weekdays.
 * days = numbers from 0 (Sun) → 6 (Sat)
 *
 * Example:
 *   getNextScheduledDay([2, 6]) = Next Tuesday or Saturday
 */
export function getNextScheduledDay(days: number[]): Date {
  const now = new Date();
  const today = now.getDay();

  let minDiff = Infinity;

  for (const day of days) {
    const diff = (day - today + 7) % 7 || 7; // next occurrence
    if (diff < minDiff) minDiff = diff;
  }

  const target = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + minDiff
    )
  );

  return target;
}

/**
 * Converts a given date into a normalized ISO string (UTC midnight).
 * Useful for storing and comparing date keys in Sets / DB.
 */
export function getISODateUTC(d: Date): string {
  return normalizeToUTCDate(d).toISOString();
}

/**
 * Adds N months to a date in UTC mode.
 * Prevents timezone drift that happens with new Date().
 */
export function addMonthsUTC(d: Date, months: number): Date {
  const date = new Date(d);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + months,
      date.getUTCDate()
    )
  );
}

/**
 * Adds N days to a date in UTC mode.
 * Safest way to generate sequential UTC dates.
 */
export function addDaysUTC(d: Date, days: number): Date {
  const date = new Date(d);
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days
    )
  );
}
