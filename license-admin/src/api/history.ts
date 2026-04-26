import { get, post } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type { HistoryListItem, HistoryDetails, HistoryFilter } from '../types/history';

/**
 * POST /history — fetch actions by date range.
 * Only dateFrom and dateTo are sent per the API contract.
 */
export async function getHistoryByDate(filter: HistoryFilter): Promise<HistoryListItem[]> {
  const result = await post<unknown>(ENDPOINTS.HISTORY, filter);
  return Array.isArray(result) ? (result as HistoryListItem[]) : [];
}

export async function getHistoryItem(id: number): Promise<HistoryDetails> {
  return get<HistoryDetails>(`${ENDPOINTS.HISTORY_ITEM}/${id}`);
}
