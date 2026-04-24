export interface LicenseVersionListItem {
  id: string;
  name: string;
  isBlocked: boolean;
  description: string;
}

export interface LicenseVersionDetail extends LicenseVersionListItem {
  hash: string;
}

export interface LicenseVersionCreatePayload {
  name: string;
  isBlocked: boolean;
  description: string;
}

export interface LicenseVersionUpdatePayload {
  id: string;
  hash?: string;
  name?: string;
  isBlocked?: boolean;
  description?: string;
}
