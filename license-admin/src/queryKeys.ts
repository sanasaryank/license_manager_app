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

  customers: {
    all: ['customers'] as const,
    byId: (id: string) => ['customer', id] as const,
  },

  history: {
    all: ['history'] as const,
    byObjectId: (objectId: string) => ['history', objectId] as const,
    item: (id: number) => ['historyItem', id] as const,
  },

  validators: {
    all: ['validators'] as const,
    byId: (id: string) => ['validators', id] as const,
  },
} as const;
