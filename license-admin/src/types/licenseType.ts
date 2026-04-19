import type { Translation } from './common';

export type LicenseFieldKind = 'string' | 'int' | 'float' | 'date' | 'datetime' | 'time' | 'boolean';

export interface LicenseTypeField {
  name: string;
  kind: LicenseFieldKind;
  required: boolean;
  enum: string[];
}

export interface LicenseTypeListItem {
  id: string;
  name: Translation;
  fields: LicenseTypeField[];
  isBlocked: boolean;
  description: string;
}

export interface LicenseTypeDetail extends LicenseTypeListItem {
  hash: string;
}

export interface LicenseTypeCreatePayload {
  name: Translation;
  fields: LicenseTypeField[];
  isBlocked: boolean;
  description: string;
}

export interface LicenseTypeUpdatePayload {
  id: string;
  hash?: string;
  name?: Translation;
  fields?: LicenseTypeField[];
  isBlocked?: boolean;
  description?: string;
}
