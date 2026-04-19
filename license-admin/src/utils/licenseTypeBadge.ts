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

/** Build a 2-3 letter abbreviation from a name string. */
function buildAbbreviation(name: string): string {
  const clean = name.trim();
  if (!clean) return '??';
  const words = clean.split(/\s+/);
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 3);
  }
  return clean.slice(0, 3).toUpperCase();
}

const _cache = new Map<string, { abbr: string; color: string }>();

export function getLicenseTypeBadge(
  licenseTypeId: string,
  licenseTypeName: string,
): { abbr: string; color: string } {
  if (_cache.has(licenseTypeId)) return _cache.get(licenseTypeId)!;
  const abbr = buildAbbreviation(licenseTypeName);
  const color = BADGE_PALETTE[hashCode(licenseTypeId) % BADGE_PALETTE.length]!;
  const result = { abbr, color };
  _cache.set(licenseTypeId, result);
  return result;
}
