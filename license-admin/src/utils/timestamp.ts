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
