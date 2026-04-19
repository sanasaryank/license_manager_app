/**
 * Builds a partial update payload for PUT requests.
 *
 * Rules:
 * - `requiredFields` (id, hash) are always included.
 * - All other fields are included only if they differ from `original`.
 * - Arrays are compared by JSON serialization (order matters).
 * - Returns `null` when nothing changed (caller should skip PUT).
 */
export function buildDiffPayload<T extends Record<string, unknown>>(
  original: T,
  current: T,
  requiredFields: Partial<T>,
): Partial<T> | null {
  const diff: Partial<T> = { ...requiredFields };
  let hasChanges = false;

  const requiredKeys = new Set(Object.keys(requiredFields));

  for (const key of Object.keys(current) as (keyof T)[]) {
    if (requiredKeys.has(key as string)) continue;
    if (!deepEqual(original[key], current[key])) {
      diff[key] = current[key];
      hasChanges = true;
    }
  }

  return hasChanges ? diff : null;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  // For objects and arrays, use JSON comparison (handles nested structures correctly)
  return JSON.stringify(a) === JSON.stringify(b);
}
