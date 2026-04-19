import { get } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type { HistoryListItem, HistoryDetails } from '../types/history';

export async function getAllHistory(): Promise<HistoryListItem[]> {
  const result = await get<unknown>(ENDPOINTS.HISTORY);
  return Array.isArray(result) ? (result as HistoryListItem[]) : [];
}

export async function getHistoryByObject(objectId: string): Promise<HistoryListItem[]> {
  const result = await get<unknown>(`${ENDPOINTS.HISTORY}?objectId=${encodeURIComponent(objectId)}`);
  return Array.isArray(result) ? (result as HistoryListItem[]) : [];
}

export async function getHistoryItem(id: number): Promise<HistoryDetails> {
  return get<HistoryDetails>(`${ENDPOINTS.HISTORY_ITEM}/${id}`);
}
