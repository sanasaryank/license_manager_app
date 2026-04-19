import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FILTER_CONFIGS } from '../../constants/filterConfigs';
import { useFilterValues, useSetFilterValue, useResetFilters, useFilterOptions } from '../../providers/FilterProvider';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';

export function FilterPanel() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const config = FILTER_CONFIGS[pathname];
  const filterValues = useFilterValues();
  const setFilterValue = useSetFilterValue();
  const resetFilters = useResetFilters();
  const filterOptions = useFilterOptions();

  if (!config || config.length === 0) return null;

  return (
    <aside className="w-60 flex-shrink-0 border-l bg-gray-50 p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{t('common.filters')}</span>
        <button
          type="button"
          onClick={resetFilters}
          className="text-xs text-primary-600 hover:underline"
        >
          {t('common.resetFilters')}
        </button>
      </div>

      {config.map((field) => {
        const value = filterValues[field.key] ?? '';

        if (field.type === 'text' || field.type === 'date') {
          return (
            <Input
              key={field.key}
              label={t(field.labelKey)}
              type={field.type}
              value={value}
              onChange={(e) => setFilterValue(field.key, e.target.value)}
            />
          );
        }

        if (field.type === 'select') {
          const opts = field.staticOptions
            ? field.staticOptions.map((o) => ({ value: o.value, label: t(o.labelKey) }))
            : (filterOptions[field.key] ?? []);

          return (
            <Select
              key={field.key}
              label={t(field.labelKey)}
              value={value}
              onChange={(e) => setFilterValue(field.key, e.target.value)}
              options={opts}
              placeholder={t('common.all')}
            />
          );
        }

        if (field.type === 'switch') {
          return (
            <Checkbox
              key={field.key}
              label={t(field.labelKey)}
              checked={value === 'true'}
              onChange={(e) => setFilterValue(field.key, e.target.checked ? 'true' : '')}
            />
          );
        }

        return null;
      })}
    </aside>
  );
}
