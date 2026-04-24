export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const ENDPOINTS = {
  LOGIN:            '/login',
  LOGOUT:           '/logout',
  ME:               '/me',
  EMPLOYEES:        '/employees',
  CUSTOMER_TAGS:    '/dictionary/customerTags',
  LICENSE_TYPES:    '/dictionary/licenseTypes',
  CUSTOMERS:        '/customers',
  DOWNLOAD_LICENSE: '/downloadLicense',
  LICENSE_VERSIONS: '/dictionary/licenseVersions',
  HISTORY:          '/history',
  HISTORY_ITEM:     '/historyItem',
  VALIDATORS:       '/validators',
} as const;
