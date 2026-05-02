import { get, post, put, patch } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  LicenseTypeListItem,
  LicenseTypeDetail,
  LicenseTypeCreatePayload,
  LicenseTypeUpdatePayload,
} from '../types/licenseType';

export async function getLicenseTypes(): Promise<LicenseTypeListItem[]> {
  const result = await get<unknown>(ENDPOINTS.LICENSE_TYPES);
  return Array.isArray(result) ? (result as LicenseTypeListItem[]) : [];
}

export async function getLicenseType(id: string): Promise<LicenseTypeDetail> {
  return get<LicenseTypeDetail>(`${ENDPOINTS.LICENSE_TYPES}/${id}`);
}

export async function createLicenseType(payload: LicenseTypeCreatePayload): Promise<LicenseTypeDetail> {
  return post<LicenseTypeDetail>(ENDPOINTS.LICENSE_TYPES, payload);
}

export async function updateLicenseType(id: string, payload: LicenseTypeUpdatePayload): Promise<LicenseTypeDetail> {
  return put<LicenseTypeDetail>(`${ENDPOINTS.LICENSE_TYPES}/${id}`, payload);
}

export async function blockLicenseType(payload: { id: string; isBlocked: boolean }): Promise<void> {
  return patch<void>(ENDPOINTS.LICENSE_TYPES, payload);
}
