import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { queryKeys } from '../../queryKeys';
import { getAllHistory, getHistoryByObject } from '../../api/history';
import { getEmployees } from '../../api/employees';
import { ROUTES } from '../../constants/routes';
import { useListOperations } from '../../hooks/useListOperations';
import { useAuth } from '../../providers/AuthProvider';
import { useFilterValues, useSetFilterValue, useRegisterFilterOptions } from '../../providers/FilterProvider';
import { resolveTranslation } from '../../utils/translation';
import { filterByDateRange } from '../../utils/timestamp';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RowActions } from '../../components/ui/RowActions';
import type { HistoryListItem } from '../../types/history';
import { HistoryDetailModal } from './HistoryDetailModal';

const ACTION_BADGE: Record<string, 'success' | 'info' | 'danger'> = {
  create: 'success',
  edit: 'info',
  delete: 'danger',
};

export default function HistoryPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlObjectId = searchParams.get('objectId') ?? undefined;

  // FilterProvider state — must be before useQuery so effectiveObjectId is stable
  const filterValues = useFilterValues();
  const setFilterValue = useSetFilterValue();
  const registerFilterOptions = useRegisterFilterOptions();

  // Keep filter panel in sync with the URL param:
  // • When navigating here from another page (?objectId=x), the panel shows x and the API fetches for x.
  // • When the URL param is absent, the panel value drives the API (user can type directly).
  // • Navigating away clears the panel value so stale filters don't shadow future visits.
  React.useEffect(() => {
    setFilterValue('objectId', urlObjectId ?? '');
  }, [urlObjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL param takes precedence on the very first render (before the sync effect fires).
  const effectiveObjectId = urlObjectId ?? (filterValues['objectId']?.trim() || undefined);

  const { data: allData = [], isLoading, error } = useQuery({
    queryKey: effectiveObjectId
      ? queryKeys.history.byObjectId(effectiveObjectId)
      : queryKeys.history.all,
    queryFn: effectiveObjectId
      ? () => getHistoryByObject(effectiveObjectId)
      : getAllHistory,
  });

  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  // Build userId → display name map for fast lookup
  const userMap = React.useMemo(
    () => new Map(employees.map((e) => [e.id, resolveTranslation(e.name, lang)])),
    [employees, lang],
  );

  const resolveUser = (h: import('../../types/history').HistoryListItem) =>
    userMap.get(h.userId) ?? h.userId;

  // Register user options for filter — runs whenever history data or employee list changes
  React.useEffect(() => {
    const map = new Map(employees.map((e) => [e.id, resolveTranslation(e.name, lang)]));
    const users = Array.from(
      new Map(allData.map((h) => [h.userId, map.get(h.userId) ?? h.userId])).entries(),
    ).map(([value, label]) => ({ value, label }));
    registerFilterOptions('userName', users);
  }, [allData, employees, lang, registerFilterOptions]);

  // Date range filtering on top of useListOperations
  const dateFiltered = React.useMemo(
    () => filterByDateRange(allData, filterValues),
    [allData, filterValues],
  );

  const filterFields = [
    { key: 'userName', extract: (h: HistoryListItem) => h.userId, matchMode: 'exact' as const },
    { key: 'objectType', extract: (h: HistoryListItem) => h.objectType },
    // objectId is handled at API level via effectiveObjectId — no client-side duplicate
    { key: 'actionType', extract: (h: HistoryListItem) => h.actionType, matchMode: 'exact' as const },
  ];

  const listOps = useListOperations<HistoryListItem>({
    data: dateFiltered,
    searchFields: (h) => [resolveUser(h), h.objectType, String(h.objectId)],
    filterFields,
    externalFilters: filterValues,
    defaultSort: { key: 'date', direction: 'desc' },
  });

  const [detailId, setDetailId] = useState<number | null>(null);

  const columns = [
    { key: 'date', header: t('history.date'), sortable: true },
    { key: 'userName', header: t('history.user'), sortable: true, render: (h: HistoryListItem) => resolveUser(h) },
    { key: 'objectType', header: t('history.objectType'), sortable: true },
    { key: 'objectId', header: t('history.objectId') },
    {
      key: 'actionType',
      header: t('history.actionType'),
      sortable: true,
      render: (h: HistoryListItem) => (
        <Badge variant={ACTION_BADGE[h.actionType] ?? 'default'}>
          {t(`History.actionType.${h.actionType}`)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (h: HistoryListItem) => (
        <RowActions
          actions={[{ type: 'view', onClick: () => setDetailId(h.id) }]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('history.title')}</h1>
        {effectiveObjectId && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.HISTORY, { replace: true })}
          >
            {t('history.showAll')}
          </Button>
        )}
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <Table
          columns={columns}
          data={listOps.items}
          isLoading={isLoading}
          error={error ? String(error) : null}
          sort={listOps.sort}
          onSort={listOps.toggleSort}
          keyExtractor={(h) => String(h.id)}
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

      {detailId !== null && (
        <HistoryDetailModal
          open
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
