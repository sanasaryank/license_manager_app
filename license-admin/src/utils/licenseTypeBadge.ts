// Deterministic color palette for license type badges
const BADGE_PALETTE = [
  '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#d97706',
  '#059669', '#0891b2', '#0284c7', '#6366f1', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f59e0b', '#10b981', '#3b82f6',
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** Return consonant letters of a word (excluding the first letter which is already used). */
function consonants(word: string): string[] {
  return word.slice(1).split('').filter((c) => /[bcdfghjklmnpqrstvwxyz]/i.test(c));
}

/**
 * Build candidate abbreviations for a name.
 * The first candidate uses the standard first-letters rule.
 * Additional candidates try swapping the 2nd (and 3rd) word's first letter
 * for each consonant in that word.
 */
function buildCandidates(name: string): string[] {
  const clean = name.trim();
  if (!clean) return ['??'];
  const words = clean.split(/\s+/);

  const base = (words.length >= 2
    ? words.slice(0, 3).map((w) => w[0] ?? '').join('').toUpperCase().slice(0, 3)
    : clean.slice(0, 3).toUpperCase());

  const candidates: string[] = [base];

  if (words.length >= 2) {
    const prefix = (words[0]?.[0] ?? '').toUpperCase();
    // Vary second word letter
    for (const c of consonants(words[1] ?? '')) {
      const suffix = words.length >= 3 ? (words[2]?.[0] ?? '').toUpperCase() : '';
      candidates.push((prefix + c.toUpperCase() + suffix).slice(0, 3));
    }
    // If three+ words, also vary third word letter
    if (words.length >= 3) {
      for (const c of consonants(words[2] ?? '')) {
        candidates.push((prefix + (words[1]?.[0] ?? '').toUpperCase() + c.toUpperCase()).slice(0, 3));
      }
    }
  }

  // Deduplicate while preserving order
  return [...new Set(candidates)];
}

/** Deterministic badge color for a license type ID. Pure — no side effects. */
export function getLicenseTypeColor(licenseTypeId: string): string {
  return BADGE_PALETTE[hashCode(licenseTypeId) % BADGE_PALETTE.length]!;
}

/**
 * Build an id → abbreviation map for a full list of license types.
 * Processes types sorted by id for deterministic, refresh-stable uniqueness.
 * Pure function — no module-level state.
 */
export function buildAbbreviationsMap(
  licenseTypes: Array<{ id: string; name: string }>,
): Map<string, string> {
  // Sort by id so the same set always produces the same assignments regardless of render order
  const sorted = [...licenseTypes].sort((a, b) => a.id.localeCompare(b.id));
  const usedAbbrs = new Set<string>();
  const result = new Map<string, string>();

  for (const lt of sorted) {
    const candidates = buildCandidates(lt.name);
    let abbr = candidates[0]!;
    for (const c of candidates) {
      if (!usedAbbrs.has(c)) {
        abbr = c;
        break;
      }
    }
    usedAbbrs.add(abbr);
    result.set(lt.id, abbr);
  }

  return result;
}
