import { get, post, put, getRaw } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  CustomerListItem,
  CustomerDetail,
  CustomerCreatePayload,
  CustomerUpdatePayload,
} from '../types/customer';

export interface DownloadLicenseResponse {
  additionalFields?: Array<{ name: string; value: unknown; addName: boolean }>;
  general?: Record<string, unknown>;
  custom?: Record<string, unknown>;
}

export async function getCustomers(): Promise<CustomerListItem[]> {
  const result = await get<unknown>(ENDPOINTS.CUSTOMERS);
  return Array.isArray(result) ? (result as CustomerListItem[]) : [];
}

export async function getCustomer(id: string): Promise<CustomerDetail> {
  return get<CustomerDetail>(`${ENDPOINTS.CUSTOMERS}/${id}`);
}

export async function createCustomer(payload: CustomerCreatePayload): Promise<CustomerDetail> {
  return post<CustomerDetail>(ENDPOINTS.CUSTOMERS, payload);
}

export async function updateCustomer(id: string, payload: CustomerUpdatePayload): Promise<CustomerDetail> {
  return put<CustomerDetail>(`${ENDPOINTS.CUSTOMERS}/${id}`, payload);
}

export async function downloadLicense(customerId: string, hwid: string): Promise<string> {
  const html = await getRaw(`${ENDPOINTS.DOWNLOAD_LICENSE}/${customerId}/${encodeURIComponent(hwid)}`);
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const base64 = (match ? match[1] : html).trim();
  return atob(base64);
}
