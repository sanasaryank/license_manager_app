import { get, post, put, patch } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  LicenseVersionListItem,
  LicenseVersionDetail,
  LicenseVersionCreatePayload,
  LicenseVersionUpdatePayload,
} from '../types/licenseVersion';

export async function getLicenseVersions(): Promise<LicenseVersionListItem[]> {
  const result = await get<unknown>(ENDPOINTS.LICENSE_VERSIONS);
  return Array.isArray(result) ? (result as LicenseVersionListItem[]) : [];
}

export async function getLicenseVersion(id: string): Promise<LicenseVersionDetail> {
  return get<LicenseVersionDetail>(`${ENDPOINTS.LICENSE_VERSIONS}/${id}`);
}

export async function createLicenseVersion(payload: LicenseVersionCreatePayload): Promise<LicenseVersionDetail> {
  return post<LicenseVersionDetail>(ENDPOINTS.LICENSE_VERSIONS, payload);
}

export async function updateLicenseVersion(id: string, payload: LicenseVersionUpdatePayload): Promise<LicenseVersionDetail> {
  return put<LicenseVersionDetail>(`${ENDPOINTS.LICENSE_VERSIONS}/${id}`, payload);
}

export async function blockLicenseVersion(payload: { id: string; isBlocked: boolean }): Promise<void> {
  return patch<void>(ENDPOINTS.LICENSE_VERSIONS, payload);
}
