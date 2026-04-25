import type { Translation } from './common';

export type CustomerNodeType = 'customer' | 'group';

export interface CustomerLicense {
  licenseId?: string;
  OrgName: string;
  MaxConnCount: number;
  hwid: string;
  licenseTypeId: string;
  versionId?: string;
  track: boolean;
  values: Record<string, unknown>;
  isBlocked: boolean;
  description: string;
  endDate?: string;
}

export interface CustomerListItem {
  id: string;
  name: Translation;
  legalName: string;
  TIN: string;
  responsibleId: string;
  responsibleName?: string;
  tags: string[];
  licenses: CustomerLicense[];
  isBlocked: boolean;
  description: string;
  lastUpdated?: string;
  /** Hierarchy: null/undefined = root node */
  parent_id?: string | null;
  /** 'group' nodes have no licenses/responsible/TIN */
  type?: CustomerNodeType;
}

export interface CustomerDetail extends CustomerListItem {
  hash: string;
}

export interface CustomerCreatePayload {
  id?: string;
  name: Translation;
  legalName: string;
  TIN: string;
  responsibleId: string;
  tags: string[];
  licenses: CustomerLicense[];
  isBlocked: boolean;
  description: string;
  parent_id?: string | null;
  type?: CustomerNodeType;
}

export interface CustomerUpdatePayload {
  id: string;
  hash?: string;
  name?: Translation;
  legalName?: string;
  TIN?: string;
  responsibleId?: string;
  tags?: string[];
  licenses?: CustomerLicense[];
  isBlocked?: boolean;
  description?: string;
  parent_id?: string | null;
}
