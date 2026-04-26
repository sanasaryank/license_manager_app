import { get, post } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  LicenseHistoryItem,
  LicenseHistoryFilter,
  LicenseDataResponse,
} from '../types/licenseHistory';

export async function getLicenseHistory(
  filter: LicenseHistoryFilter,
): Promise<LicenseHistoryItem[]> {
  const result = await post<unknown>(ENDPOINTS.LICENSES, filter);
  return Array.isArray(result) ? (result as LicenseHistoryItem[]) : [];
}

export async function getLicenseRequest(licenseId: string): Promise<LicenseDataResponse> {
  return get<LicenseDataResponse>(
    `${ENDPOINTS.LICENSES_REQUEST}/${encodeURIComponent(licenseId)}`,
  );
}

export async function getLicenseGranted(licenseId: string): Promise<LicenseDataResponse> {
  return get<LicenseDataResponse>(
    `${ENDPOINTS.LICENSES_LICENSE}/${encodeURIComponent(licenseId)}`,
  );
}
