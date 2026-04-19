export interface CustomerLicense {
  OrgName: string;
  MaxConnCount: number;
  hwid: string;
  licenseTypeId: string;
  track: boolean;
  values: Record<string, unknown>;
  isBlocked: boolean;
  description: string;
}

export interface CustomerListItem {
  id: string;
  name: string;
  legalName: string;
  TIN: string;
  responsibleId: string;
  responsibleName: string;
  tags: string[];
  licenses: CustomerLicense[];
  isBlocked: boolean;
  description: string;
}

export interface CustomerDetail extends CustomerListItem {
  hash: string;
}

export interface CustomerCreatePayload {
  id: string;
  name: string;
  legalName: string;
  TIN: string;
  responsibleId: string;
  tags: string[];
  licenses: CustomerLicense[];
  isBlocked: boolean;
  description: string;
}

export interface CustomerUpdatePayload {
  id: string;
  hash?: string;
  name?: string;
  legalName?: string;
  TIN?: string;
  responsibleId?: string;
  tags?: string[];
  licenses?: CustomerLicense[];
  isBlocked?: boolean;
  description?: string;
}
