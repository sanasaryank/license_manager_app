import { get, post, put, patch } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  CustomerTagListItem,
  CustomerTagDetail,
  CustomerTagCreatePayload,
  CustomerTagUpdatePayload,
} from '../types/customerTag';

export async function getCustomerTags(): Promise<CustomerTagListItem[]> {
  const result = await get<unknown>(ENDPOINTS.CUSTOMER_TAGS);
  return Array.isArray(result) ? (result as CustomerTagListItem[]) : [];
}

export async function getCustomerTag(id: string): Promise<CustomerTagDetail> {
  return get<CustomerTagDetail>(`${ENDPOINTS.CUSTOMER_TAGS}/${id}`);
}

export async function createCustomerTag(payload: CustomerTagCreatePayload): Promise<CustomerTagDetail> {
  return post<CustomerTagDetail>(ENDPOINTS.CUSTOMER_TAGS, payload);
}

export async function updateCustomerTag(id: string, payload: CustomerTagUpdatePayload): Promise<CustomerTagDetail> {
  return put<CustomerTagDetail>(`${ENDPOINTS.CUSTOMER_TAGS}/${id}`, payload);
}

export async function blockCustomerTag(payload: { id: string; isBlocked: boolean }): Promise<void> {
  return patch<void>(ENDPOINTS.CUSTOMER_TAGS, payload);
}
