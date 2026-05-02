import type { Translation } from './common';

export interface CustomerStatusListItem {
  id: string;
  name: Translation;
  isBlocked: boolean;
  description: string;
  color: string;
}

export interface CustomerStatusDetail extends CustomerStatusListItem {
  hash: string;
}

export interface CustomerStatusCreatePayload {
  name: Translation;
  isBlocked: boolean;
  description: string;
  color: string;
}

export interface CustomerStatusUpdatePayload {
  id: string;
  hash?: string;
  name?: Translation;
  isBlocked?: boolean;
  description?: string;
  color?: string;
}
