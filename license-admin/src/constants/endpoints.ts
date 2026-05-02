export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const ENDPOINTS = {
  LOGIN:            '/login',
  LOGOUT:           '/logout',
  ME:               '/me',
  EMPLOYEES:        '/employees',
  CUSTOMER_TAGS:    '/dictionary/customerTags',
  LICENSE_TYPES:    '/dictionary/licenseTypes',
  CUSTOMERS:        '/customers',
  GET_LICENSE: '/getLicense',
  LICENSE_VERSIONS: '/dictionary/licenseVersions',
  CUSTOMER_STATUSES: '/dictionary/customerStatuses',
  HISTORY:          '/history',
  HISTORY_ITEM:     '/historyItem',
  VALIDATORS:       '/validators',
  LICENSES:         '/licenses',
  LICENSES_REQUEST: '/licenses/request',
  LICENSES_LICENSE: '/licenses/license',
} as const;
