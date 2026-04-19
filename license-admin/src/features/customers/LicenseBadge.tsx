import React from 'react';
import { getLicenseTypeBadge } from '../../utils/licenseTypeBadge';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import type { LicenseTypeListItem } from '../../types/licenseType';

interface LicenseBadgeProps {
  licenseTypeId: string;
  licenseTypes: LicenseTypeListItem[];
}

export function LicenseBadge({ licenseTypeId, licenseTypes }: LicenseBadgeProps) {
  const { lang } = useAuth();
  const lt = licenseTypes.find((t) => t.id === licenseTypeId);
  const name = lt ? resolveTranslation(lt.name, lang) : licenseTypeId;
  const { abbr, color } = getLicenseTypeBadge(licenseTypeId, name);

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
