import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '../../queryKeys';
import { getCustomers, updateCustomer } from '../../api/customers';
import { getLicenseTypes } from '../../api/licenseTypes';
import { getCustomerTags } from '../../api/customerTags';
import { getEmployees } from '../../api/employees';
import { useListOperations } from '../../hooks/useListOperations';
import { useBlockToggle } from '../../hooks/useBlockToggle';
import { useAuth } from '../../providers/AuthProvider';
import { useFilterValues, useRegisterFilterOptions } from '../../providers/FilterProvider';
import { resolveTranslation } from '../../utils/translation';
import { formatDate, formatDateTime, getCustomerMinEndDate, localTodayString } from '../../utils/timestamp';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { RowActions } from '../../components/ui/RowActions';
import { IconPlus } from '../../components/ui/Icons';
import { ROUTES } from '../../constants/routes';
import type { CustomerListItem } from '../../types/customer';
import { LicenseBadge } from './LicenseBadge';
import { TagChip } from './TagChip';
import { CustomerModal } from './CustomerModal';

export default function CustomersPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const navigate = useNavigate();

  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
  });

  const { data: licenseTypes = [] } = useQuery({
    queryKey: queryKeys.licenseTypes.all,
    queryFn: getLicenseTypes,
  });

  const { data: allTags = [] } = useQuery({
    queryKey: queryKeys.customerTags.all,
    queryFn: getCustomerTags,
  });

  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  // Build employeeId → display name map
  const employeeMap = React.useMemo(
    () => new Map(employees.map((e) => [e.id, resolveTranslation(e.name, lang)])),
    [employees, lang],
  );

  const resolveResponsible = (c: CustomerListItem) =>
    c.responsibleName || employeeMap.get(c.responsibleId) || c.responsibleId || '—';

  const registerFilterOptions = useRegisterFilterOptions();
  const filterValues = useFilterValues();

  // Register license type options for filter panel
  React.useEffect(() => {
    registerFilterOptions(
      'licenseTypeId',
      licenseTypes.map((lt) => ({ value: lt.id, label: resolveTranslation(lt.name, lang) })),
    );
  }, [licenseTypes, lang, registerFilterOptions]);

  // Register responsible (employee) options for filter panel
  React.useEffect(() => {
    registerFilterOptions(
      'responsibleId',
      employees.map((e) => ({ value: e.id, label: resolveTranslation(e.name, lang) })),
    );
  }, [employees, lang, registerFilterOptions]);

  // Register tag item options
  React.useEffect(() => {
    const opts = allTags.flatMap((tag) =>
      (tag.items ?? []).map((item) => ({
        value: `${tag.id}:${item.id}`,
        label: `${resolveTranslation(tag.name, lang)}: ${resolveTranslation(item.name, lang)}`,
      })),
    );
    registerFilterOptions('tag', opts);
  }, [allTags, lang, registerFilterOptions]);

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const filterFields = [
    { key: 'name', extract: (c: CustomerListItem) => resolveTranslation(c.name, lang), matchMode: 'contains' as const },
    { key: 'responsibleId', extract: (c: CustomerListItem) => c.responsibleId ?? '', matchMode: 'exact' as const },
    { key: 'licenseTypeId', extract: (c: CustomerListItem) => (c.licenses ?? []).map((l) => l.licenseTypeId).join(','), matchMode: 'array' as const },
    { key: 'tag', extract: (c: CustomerListItem) => (c.tags ?? []).join(','), matchMode: 'array' as const },
    { key: 'TIN', extract: (c: CustomerListItem) => c.TIN ?? '' },
    { key: 'isBlocked', extract: (c: CustomerListItem) => c.isBlocked ? 'true' : 'false', matchMode: 'exact' as const },
  ];

  const listOps = useListOperations<CustomerListItem>({
    data: customers,
    searchFields: (c) => [resolveTranslation(c.name, lang), c.legalName ?? '', c.TIN ?? ''],
    externalSearch: search,
    filterFields,
    externalFilters: filterValues,
    defaultSort: { key: 'name', direction: 'asc' },
    sortFields: {
      name: (c) => resolveTranslation(c.name, lang),
      minEndDate: (c) => getCustomerMinEndDate(c.licenses ?? []) ?? '9999-12-31',
      lastUpdated: (c) => c.lastUpdated ?? '',
    },
  });

  const blockToggle = useBlockToggle({
    updateFn: (id, payload) => updateCustomer(id, payload),
    listQueryKey: queryKeys.customers.all,
  });

  const columns = [
    { key: 'name', header: t('customers.name'), sortable: true, render: (c: CustomerListItem) => resolveTranslation(c.name, lang) },
    {
      key: 'responsible',
      header: t('customers.responsible'),
      sortable: true,
      render: (c: CustomerListItem) => resolveResponsible(c),
    },
    {
      key: 'licenses',
      header: t('customers.licenses'),
      render: (c: CustomerListItem) => (
        <div className="flex flex-wrap gap-1">
          {(c.licenses ?? []).map((l, i) => (
            <LicenseBadge key={i} licenseTypeId={l.licenseTypeId} licenseTypes={licenseTypes} />
          ))}
        </div>
      ),
    },
    {
      key: 'tags',
      header: t('customers.tags'),
      render: (c: CustomerListItem) => <TagChip tagIds={c.tags ?? []} allTags={allTags} />,
    },
    {
      key: 'isBlocked',
      header: t('common.status'),
      render: (c: CustomerListItem) =>
        c.isBlocked ? (
          <Badge variant="danger">{t('common.blocked')}</Badge>
        ) : (
          <Badge variant="success">{t('common.active')}</Badge>
        ),
    },
    {
      key: 'lastUpdated',
      header: t('customers.lastChangeDate'),
      sortable: true,
      render: (c: CustomerListItem) => c.lastUpdated ? formatDateTime(c.lastUpdated) : '—',
    },
    {
      key: 'minEndDate',
      header: t('customers.minEndDate'),
      sortable: true,
      render: (c: CustomerListItem) => {
        const d = getCustomerMinEndDate(c.licenses ?? []);
        if (!d) return <span>—</span>;
        const today = localTodayString();
        const soon = localTodayString(7);
        const color = d < today
          ? 'text-red-900 font-semibold'
          : d < soon
          ? 'text-red-500'
          : '';
        return <span className={color}>{formatDate(d)}</span>;
      },
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (c: CustomerListItem) => (
        <RowActions
          actions={[
            { type: 'edit', onClick: () => { setEditId(c.id); setModalOpen(true); } },
            c.isBlocked
              ? { type: 'unblock', onClick: () => blockToggle.mutate({ id: c.id, isBlocked: false }) }
              : { type: 'block', onClick: () => blockToggle.mutate({ id: c.id, isBlocked: true }) },
            {
              type: 'history',
              onClick: () => navigate(`${ROUTES.HISTORY}?objectId=${encodeURIComponent(c.id)}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('customers.title')}</h1>
        <Button leftIcon={<IconPlus />} onClick={() => { setEditId(null); setModalOpen(true); }}>
          {t('common.create')}
        </Button>
      </div>

      <Input
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="rounded-lg border bg-white shadow-sm">
        <Table
          columns={columns}
          data={listOps.items}
          isLoading={isLoading}
          error={error ? String(error) : null}
          sort={listOps.sort}
          onSort={listOps.toggleSort}
          keyExtractor={(c) => c.id}
          emptyText={t('common.noData')}
        />
        <Pagination
          page={listOps.pagination.page}
          pageSize={listOps.pagination.pageSize}
          totalItems={listOps.totalItems}
          totalPages={listOps.totalPages}
          onPageChange={listOps.setPage}
          onPageSizeChange={listOps.setPageSize}
        />
      </div>

      {modalOpen && (
        <CustomerModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editId={editId}
          licenseTypes={licenseTypes}
          allTags={allTags}
        />
      )}
    </div>
  );
}
