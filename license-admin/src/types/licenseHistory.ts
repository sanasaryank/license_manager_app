export interface LicenseHistoryItem {
  id: number;
  date?: string;
  customerId: string;
  customerName: string | null;
  licenseId: string;
  licenseOrgName: string;
  licenseFound: boolean;
  requestAddress: string;
  userId: string;
}

export interface LicenseHistoryFilter {
  /** DD:MM:YYYY */
  dateFrom: string;
  /** DD:MM:YYYY */
  dateTo: string;
  /** When set, appended as ?customerId= query parameter */
  customerId?: string;
}

export type LicenseDataResponse = unknown;
