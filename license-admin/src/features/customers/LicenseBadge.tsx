import React, { useMemo } from 'react';
import { buildAbbreviationsMap, getLicenseTypeColor } from '../../utils/licenseTypeBadge';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import type { LicenseTypeListItem } from '../../types/licenseType';

interface LicenseBadgeProps {
  licenseTypeId: string;
  licenseTypes: LicenseTypeListItem[];
}

export function LicenseBadge({ licenseTypeId, licenseTypes }: LicenseBadgeProps) {
  const { lang } = useAuth();

  // Compute abbreviations for the full list so uniqueness is resolved across all types
  // together, deterministically (sorted by id). Recomputes only when the list or lang changes.
  const abbrsMap = useMemo(
    () => buildAbbreviationsMap(licenseTypes.map((lt) => ({ id: lt.id, name: resolveTranslation(lt.name, lang) }))),
    [licenseTypes, lang],
  );

  const lt = licenseTypes.find((t) => t.id === licenseTypeId);
  // If the license type data hasn't loaded yet, show nothing — avoid caching a bad abbreviation
  if (!lt) return null;

  const name = resolveTranslation(lt.name, lang);
  const abbr = abbrsMap.get(licenseTypeId) ?? name.slice(0, 3).toUpperCase();
  const color = getLicenseTypeColor(licenseTypeId);

  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold text-white"
      style={{ backgroundColor: color }}
      title={name}
    >
      {abbr}
    </span>
  );
}
