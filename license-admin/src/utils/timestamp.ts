import type { CustomerLicense } from '../types/customer';

/**
 * Format a "YYYY-MM-DD" or ISO date string for display.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    const date = new Date(year!, (month ?? 1) - 1, day);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format an ISO datetime string for display, including time (HH:MM).
 */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Compute the minimum end-date across all licenses of a customer.
 *
 * Sources (per license):
 *  1. `license.endDate` — the direct EndDate field
 *  2. `license.values[k]` for any key `k` whose name contains "enddate" (case-insensitive),
 *     e.g. "TrioEndDate", matching custom license-type fields like those
 *
 * Returns a YYYY-MM-DD string, or null if no end dates are present.
 */
/**
 * Returns the current local date (+ optional offset in days) as a YYYY-MM-DD string.
 * Uses local timezone — no UTC conversion.
 */
export function localTodayString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}

export function getCustomerMinEndDate(licenses: CustomerLicense[]): string | null {
  let min: string | null = null;

  const compare = (dateStr: unknown) => {
    if (typeof dateStr !== 'string' || !dateStr) return;
    // Normalise to YYYY-MM-DD (handles ISO timestamps too)
    const d = dateStr.substring(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return;
    if (min === null || d < min) min = d;
  };

  for (const license of licenses) {
    compare(license.endDate);
    for (const [key, val] of Object.entries(license.values ?? {})) {
      if (key.toLowerCase().includes('enddate')) {
        compare(val);
      }
    }
  }

  return min;
}

/**
 * Filter an array of items by a date range.
 * `filterValues` should contain `dateFrom` and/or `dateTo` as YYYY-MM-DD strings.
 * Date comparison uses string lexicographic order (valid for ISO dates).
 */
export function filterByDateRange<T extends { date: string }>(
  data: T[],
  filterValues: Record<string, string | undefined>,
): T[] {
  const fromStr = filterValues['dateFrom']?.trim() ?? '';
  const toStr   = filterValues['dateTo']?.trim() ?? '';
  if (!fromStr && !toStr) return data;
  return data.filter((item) => {
    const d = item.date.substring(0, 10); // normalize to YYYY-MM-DD
    if (fromStr && d < fromStr) return false;
    if (toStr   && d > toStr)   return false;
    return true;
  });
}
