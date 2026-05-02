export const queryKeys = {
  me: ['me'] as const,

  employees: {
    all: ['employees'] as const,
    byId: (id: string) => ['employee', id] as const,
  },

  customerTags: {
    all: ['customerTags'] as const,
    byId: (id: string) => ['customerTag', id] as const,
  },

  licenseTypes: {
    all: ['licenseTypes'] as const,
    byId: (id: string) => ['licenseType', id] as const,
  },

  licenseVersions: {
    all: ['licenseVersions'] as const,
    byId: (id: string) => ['licenseVersion', id] as const,
  },

  customerStatuses: {
    all: ['customerStatuses'] as const,
    byId: (id: string) => ['customerStatus', id] as const,
  },

  customers: {
    all: ['customers'] as const,
    byId: (id: string) => ['customer', id] as const,
  },

  history: {
    byDateRange: (dateFrom: string, dateTo: string, objectId?: string) =>
      ['history', dateFrom, dateTo, objectId ?? ''] as const,
    item: (id: number) => ['historyItem', id] as const,
  },

  validators: {
    all: ['validators'] as const,
    byId: (id: string) => ['validators', id] as const,
  },

  licenseHistory: {
    list: (dateFrom: string, dateTo: string, customerId?: string) =>
      ['licenseHistory', dateFrom, dateTo, customerId ?? ''] as const,
    request: (licenseId: string) => ['licenseRequest', licenseId] as const,
    granted: (licenseId: string) => ['licenseGranted', licenseId] as const,
  },
} as const;
