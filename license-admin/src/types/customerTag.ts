import type { Translation } from './common';

export interface CustomerTagItem {
  id: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
}

export interface CustomerTagListItem {
  id: string;
  name: Translation;
  description: string;
  isBlocked: boolean;
  items: CustomerTagItem[];
  itemsCount: number;
}

export interface CustomerTagDetail extends CustomerTagListItem {
  hash: string;
}

export interface CustomerTagCreatePayload {
  name: Translation;
  description: string;
  isBlocked: boolean;
  items: CustomerTagItem[];
}

export interface CustomerTagUpdatePayload {
  id: string;
  hash?: string;
  name?: Translation;
  description?: string;
  isBlocked?: boolean;
  items?: CustomerTagItem[];
}
