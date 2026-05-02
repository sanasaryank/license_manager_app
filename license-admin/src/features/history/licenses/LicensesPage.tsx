import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { queryKeys } from '../../../queryKeys';
import { getLicenseHistory } from '../../../api/licenseHistory';
import { getCustomers } from '../../../api/customers';
import { getEmployees } from '../../../api/employees';
import { useAuth } from '../../../providers/AuthProvider';
import { useFilterValues, useSetFilterValue, useRegisterFilterOptions } from '../../../providers/FilterProvider';
import { useListOperations } from '../../../hooks/useListOperations';
import { resolveTranslation } from '../../../utils/translation';
import { localTodayString, formatApiDate } from '../../../utils/timestamp';
import { Table } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { RowActions } from '../../../components/ui/RowActions';
import { IconView, IconDocumentText } from '../../../components/ui/Icons';
import type { Column } from '../../../components/ui/Table';
import type { LicenseHistoryItem } from '../../../types/licenseHistory';
import { LicenseViewModal } from './LicenseViewModal';

export default function LicensesPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const filterValues = useFilterValues();
  const setFilterValue = useSetFilterValue();
  const registerFilterOptions = useRegisterFilterOptions();

  // ── Apply customerId URL param to customer filter once, then remove it from URL ──
  useEffect(() => {
    const urlCustomerId = searchParams.get('customerId');
    if (!urlCustomerId) return;
    setFilterValue('customer', urlCustomerId);
    // Show full history for this customer from the beginning
    setFilterValue('dateFrom', '2000-01-01');
    setFilterValue('dateTo', localTodayString(0));
    // Mark initialized so the default-date effect below does not overwrite
    initialized.current = true;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('customerId');
      return next;
    }, { replace: true });
  }, [searchParams.get('customerId')]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Default date filters (only on first visit; FilterProvider preserves state on return) ──
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!filterValues['dateFrom']) setFilterValue('dateFrom', localTodayString(-1));
    if (!filterValues['dateTo'])   setFilterValue('dateTo',   localTodayString(0));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mutual exclusion: Customer dropdown ↔ CustomerID text ──
  const customerIdValue = filterValues['customerId'] ?? '';
  const customerValue   = filterValues['customer']   ?? '';

  useEffect(() => {
    if (customerIdValue.trim()) setFilterValue('customer', '');
  }, [customerIdValue]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (customerValue.trim()) setFilterValue('customerId', '');
  }, [customerValue]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Customers list for the dropdown ──
  const { data: customers = [] } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
  });

  useEffect(() => {
    const opts = customers
      .filter((c) => c.type !== 'group')
      .map((c) => ({
        value: c.id,
        label: resolveTranslation(c.name, lang) || c.id,
      }));
    registerFilterOptions('customer', opts);
  }, [customers, lang, registerFilterOptions]);

  // ── Employees for user name resolution ──
  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  const userMap = React.useMemo(
    () => new Map(employees.map((e) => [e.id, resolveTranslation(e.name, lang)])),
    [employees, lang],
  );

  // ── API query — dateFrom/dateTo in body; customerId as query param when set ──
  const dateFrom    = filterValues['dateFrom'] ?? '';
  const dateTo      = filterValues['dateTo']   ?? '';
  const apiDateFrom = formatApiDate(dateFrom);
  const apiDateTo   = formatApiDate(dateTo);
  const apiCustomerId = (customerValue || customerIdValue).trim() || undefined;

  const { data: allData = [], isLoading, error } = useQuery({
    queryKey: queryKeys.licenseHistory.list(apiDateFrom, apiDateTo, apiCustomerId),
    queryFn: () => getLicenseHistory({ dateFrom: apiDateFrom, dateTo: apiDateTo, customerId: apiCustomerId }),
    enabled: Boolean(apiDateFrom) && Boolean(apiDateTo),
  });

  // ── Client-side filtering for Customer, CustomerID, LicenseID (HWID: no matching field in response) ──
  const filterFields = [
    {
      key: 'customer',
      extract: (item: LicenseHistoryItem) => item.customerId,
      matchMode: 'exact' as const,
    },
    {
      key: 'customerId',
      extract: (item: LicenseHistoryItem) => item.customerId,
    },
    {
      key: 'licenseId',
      extract: (item: LicenseHistoryItem) => item.licenseId,
    },
    {
      key: 'remoteAddress',
      extract: (item: LicenseHistoryItem) => item.requestAddress,
    },
    // 'hwid' is intentionally omitted — not present in API response yet
  ];

  const listOps = useListOperations<LicenseHistoryItem>({
    data: allData,
    searchFields: (item) => [
      item.customerId,
      (() => { const c = customers.find((x) => x.id === item.customerId); return c ? resolveTranslation(c.name, lang) : (item.customerName ?? ''); })(),
      item.licenseId,
      item.licenseOrgName ?? '',
      item.requestAddress,
      userMap.get(item.userId) ?? item.userId,
    ],
    filterFields,
    externalFilters: filterValues,
    defaultSort: { key: 'date', direction: 'desc' },
  });

  // ── Modal state ──
  const [requestId, setRequestId] = useState<number | null>(null);
  const [grantedId, setGrantedId] = useState<number | null>(null);

  // ── Table columns ──
  const columns: Column<LicenseHistoryItem>[] = [
    {
      key: 'date',
      header: t('licenseHistory.date'),
      sortable: true,
      render: (item) => item.date ?? '—',
    },
    {
      key: 'customerName',
      header: t('licenseHistory.customer'),
      sortable: true,
      render: (item) => {
        const cust = customers.find((c) => c.id === item.customerId);
        return (cust ? resolveTranslation(cust.name, lang) : item.customerName) || item.customerId;
      },
    },
    {
      key: 'licenseOrgName',
      header: t('licenseHistory.license'),
      sortable: true,
      render: (item) => item.licenseOrgName || item.licenseId,
    },
    {
      key: 'requestAddress',
      header: t('licenseHistory.requestIp'),
      sortable: true,
    },
    {
      key: 'userId',
      header: t('licenseHistory.user'),
      sortable: true,
      render: (item) => userMap.get(item.userId) ?? item.userId,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item) => (
        <RowActions
          actions={[
            {
              type: 'custom',
              icon: <IconView />,
              label: t('licenseHistory.viewRequest'),
              onClick: () => setRequestId(item.id),
            },
            ...(item.licenseFound !== false
              ? [
                  {
                    type: 'custom' as const,
                    icon: <IconDocumentText />,
                    label: t('licenseHistory.viewGranted'),
                    onClick: () => setGrantedId(item.id),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-900">{t('licenseHistory.title')}</h1>

      <div className="rounded-lg border bg-white shadow-sm">
        <Table
          columns={columns}
          data={listOps.items}
          isLoading={isLoading}
          error={error ? String(error) : null}
          sort={listOps.sort}
          onSort={listOps.toggleSort}
          keyExtractor={(item) => String(item.id)}
          emptyText={t('common.noData')}
          rowClassName={(item) =>
            item.licenseFound === false ? 'bg-red-50 hover:bg-red-100' : undefined
          }
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

      {requestId !== null && (
        <LicenseViewModal
          open
          id={requestId}
          mode="request"
          onClose={() => setRequestId(null)}
        />
      )}

      {grantedId !== null && (
        <LicenseViewModal
          open
          id={grantedId}
          mode="granted"
          onClose={() => setGrantedId(null)}
        />
      )}
    </div>
  );
}
