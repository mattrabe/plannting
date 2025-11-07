/**
 * Converts a date from the client's local timezone to UTC.
 * When a client sends a date (e.g., "2024-01-15"), it should be interpreted
 * as midnight in the client's local timezone, then converted to UTC.
 *
 * @param date - Date object or ISO string from client
 * @param clientTimezoneOffset - Timezone offset in minutes from UTC (positive for behind UTC, negative for ahead)
 * @returns Date object in UTC
 */
export function convertLocalToUTC(date: Date | string, clientTimezoneOffset?: number): Date {
  // If it's a date-only string (YYYY-MM-DD), interpret as local midnight
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number)

    // If we have the client's timezone offset, use it
    if (clientTimezoneOffset !== undefined) {
      // Create a date representing local midnight
      // clientTimezoneOffset is in minutes: positive means behind UTC, negative means ahead
      // To convert local midnight to UTC, we subtract the offset
      // Example: PST is UTC-8 (480 minutes behind), so offset would be 480
      // Local midnight 2024-01-15 00:00:00 PST = UTC 2024-01-15 08:00:00
      // So: UTC = Local - offset (in milliseconds)
      const localMidnightUTC = Date.UTC(year, month - 1, day, 0, 0, 0, 0)
      // Subtract offset to get UTC time (offset is positive for timezones behind UTC)
      return new Date(localMidnightUTC - clientTimezoneOffset * 60 * 1000)
    }

    // Without offset info, assume UTC (fallback)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  }

  // For Date objects or full ISO strings
  const dateObj = typeof date === 'string' ? new Date(date) : date

  // If we have a timezone offset, adjust the date
  if (clientTimezoneOffset !== undefined) {
    // The date represents a local time, convert to UTC
    return new Date(dateObj.getTime() - clientTimezoneOffset * 60 * 1000)
  }

  // Without offset, assume the date is already in UTC or contains timezone info
  return dateObj
}

/**
 * Ensures a date is returned as UTC ISO string.
 * All dates stored in the database should already be in UTC,
 * but this ensures consistency in API responses.
 *
 * @param date - Date object (should already be in UTC from DB)
 * @returns ISO string in UTC
 */
export function ensureUTC(date: Date | string | null | undefined): string | null {
  if (!date) return null
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString()
}

