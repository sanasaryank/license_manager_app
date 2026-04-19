import { get, post, put } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  CustomerListItem,
  CustomerDetail,
  CustomerCreatePayload,
  CustomerUpdatePayload,
} from '../types/customer';

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
