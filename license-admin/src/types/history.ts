export type HistoryActionType = 'create' | 'edit' | 'delete';

export interface HistoryListItem {
  id: number;
  date: string; // "YYYY-MM-DD"
  userId: string;
  actionType: HistoryActionType;
  objectType: string;
  objectId: string;
}

export type HistoryDiffLeaf = {
  old: unknown;
  new: unknown;
};

export type HistoryDetails = {
  [key: string]: HistoryDiffLeaf | HistoryDetails;
};

// Type guards for diff nodes
export function isLeafDiffNode(node: unknown): node is HistoryDiffLeaf {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return false;
  const obj = node as Record<string, unknown>;
  return Object.prototype.hasOwnProperty.call(obj, 'old') &&
         Object.prototype.hasOwnProperty.call(obj, 'new');
}

export function isNestedDiffNode(node: unknown): node is HistoryDetails {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return false;
  if (isLeafDiffNode(node)) return false;
  return Object.keys(node as object).length > 0;
}
