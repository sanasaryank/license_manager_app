import { ROUTES } from './routes';

export interface FilterOption {
  value: string;
  label?: string;
  labelKey: string;
}

export type FilterFieldType = 'text' | 'date' | 'switch' | 'select';

export interface FilterFieldConfig {
  key: string;
  labelKey: string;
  type?: FilterFieldType;
  staticOptions?: FilterOption[];
  /** If this returns true, the field is rendered as disabled. */
  disabledWhen?: (filters: Record<string, string>) => boolean;
}

const STATUS_SWITCH: FilterFieldConfig = {
  key: 'isBlocked',
  labelKey: 'common.status',
  type: 'switch',
};

export const FILTER_CONFIGS: Record<string, FilterFieldConfig[]> = {
  [ROUTES.CUSTOMERS]: [
    { key: 'name',          labelKey: 'common.name',           type: 'text' },
    { key: 'responsibleId', labelKey: 'customers.responsible', type: 'select' },
    { key: 'licenseTypeId', labelKey: 'customers.licenseType', type: 'select' },
    { key: 'tag',           labelKey: 'customers.tags',        type: 'select' },
    { key: 'TIN',           labelKey: 'customers.tin',         type: 'text' },
    STATUS_SWITCH,
  ],
  [ROUTES.HISTORY]: [
    { key: 'dateFrom',   labelKey: 'history.dateFrom',   type: 'date' },
    { key: 'dateTo',     labelKey: 'history.dateTo',     type: 'date' },
    { key: 'userName',   labelKey: 'history.user',       type: 'select' },
    { key: 'objectType', labelKey: 'history.objectType', type: 'text' },
    { key: 'objectId',   labelKey: 'history.objectId',   type: 'text' },
    {
      key: 'actionType', labelKey: 'history.actionType', type: 'select',
      staticOptions: [
        { value: 'create', labelKey: 'History.actionType.create' },
        { value: 'edit',   labelKey: 'History.actionType.edit' },
        { value: 'delete', labelKey: 'History.actionType.delete' },
      ],
    },
  ],
  [ROUTES.HISTORY_LICENSES]: [
    { key: 'dateFrom',   labelKey: 'licenseHistory.dateFrom', type: 'date' },
    { key: 'dateTo',     labelKey: 'licenseHistory.dateTo',   type: 'date' },
    {
      key: 'customer',
      labelKey: 'licenseHistory.customer',
      type: 'select',
      disabledWhen: (f) => Boolean(f['customerId']?.trim()),
    },
    {
      key: 'customerId',
      labelKey: 'licenseHistory.customerId',
      type: 'text',
      disabledWhen: (f) => Boolean(f['customer']?.trim()),
    },
    { key: 'licenseId',     labelKey: 'licenseHistory.licenseId',     type: 'text' },
    { key: 'hwid',          labelKey: 'licenseHistory.hwid',          type: 'text' },
    { key: 'remoteAddress', labelKey: 'licenseHistory.remoteAddress',  type: 'text' },
  ],
};
