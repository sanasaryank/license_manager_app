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
  const { customerId, ...body } = filter;
  const query = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
  const result = await post<unknown>(`${ENDPOINTS.LICENSES}${query}`, body);
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
