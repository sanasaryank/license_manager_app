export const ROUTES = {
  LOGIN: '/login',
  CUSTOMERS: '/customers',
  DICTIONARIES_EMPLOYEES: '/dictionaries/employees',
  DICTIONARIES_CUSTOMER_TAGS: '/dictionaries/customertags',
  DICTIONARIES_LICENSE_TYPES: '/dictionaries/licensetypes',
  DICTIONARIES_LICENSE_VERSIONS: '/dictionaries/licenseversions',
  DICTIONARIES_CUSTOMER_STATUSES: '/dictionaries/customerstatuses',
  /** Actions sub-page (old History). All existing navigate() calls use this. */
  HISTORY: '/history/actions',
  HISTORY_LICENSES: '/history/licenses',
  DICTIONARIES_VALIDATORS: '/dictionaries/validators',
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
