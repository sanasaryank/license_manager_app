import { get, post, put, patch } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  CustomerStatusListItem,
  CustomerStatusDetail,
  CustomerStatusCreatePayload,
  CustomerStatusUpdatePayload,
} from '../types/customerStatus';

export async function getCustomerStatuses(): Promise<CustomerStatusListItem[]> {
  const result = await get<unknown>(ENDPOINTS.CUSTOMER_STATUSES);
  return Array.isArray(result) ? (result as CustomerStatusListItem[]) : [];
}

export async function getCustomerStatus(id: string): Promise<CustomerStatusDetail> {
  return get<CustomerStatusDetail>(`${ENDPOINTS.CUSTOMER_STATUSES}/${id}`);
}

export async function createCustomerStatus(payload: CustomerStatusCreatePayload): Promise<CustomerStatusDetail> {
  return post<CustomerStatusDetail>(ENDPOINTS.CUSTOMER_STATUSES, payload);
}

export async function updateCustomerStatus(id: string, payload: CustomerStatusUpdatePayload): Promise<CustomerStatusDetail> {
  return put<CustomerStatusDetail>(`${ENDPOINTS.CUSTOMER_STATUSES}/${id}`, payload);
}

export async function blockCustomerStatus(payload: { id: string; isBlocked: boolean }): Promise<void> {
  return patch<void>(ENDPOINTS.CUSTOMER_STATUSES, payload);
}
