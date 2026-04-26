import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { queryKeys } from '../../../queryKeys';
import { getHistoryByDate } from '../../../api/history';
import { getEmployees } from '../../../api/employees';
import { ROUTES } from '../../../constants/routes';
import { useListOperations } from '../../../hooks/useListOperations';
import { useAuth } from '../../../providers/AuthProvider';
import { useFilterValues, useSetFilterValue, useRegisterFilterOptions } from '../../../providers/FilterProvider';
import { resolveTranslation } from '../../../utils/translation';
import { localTodayString, formatApiDate } from '../../../utils/timestamp';
import { Table } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { RowActions } from '../../../components/ui/RowActions';
import type { HistoryListItem } from '../../../types/history';
import { ActionDetailModal } from './ActionDetailModal';

const ACTION_BADGE: Record<string, 'success' | 'info' | 'danger'> = {
  create: 'success',
  edit: 'info',
  delete: 'danger',
};

export default function ActionsPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlObjectId = searchParams.get('objectId') ?? undefined;

  const filterValues = useFilterValues();
  const setFilterValue = useSetFilterValue();
  const registerFilterOptions = useRegisterFilterOptions();

  // ── Default date filters (only on first visit) ──
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    if (!filterValues['dateFrom']) setFilterValue('dateFrom', localTodayString(-1));
    if (!filterValues['dateTo'])   setFilterValue('dateTo',   localTodayString(0));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync objectId URL param into filter panel ──
  useEffect(() => {
    setFilterValue('objectId', urlObjectId ?? '');
  }, [urlObjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── API query — only dateFrom and dateTo are sent per contract ──
  const dateFrom    = filterValues['dateFrom'] ?? '';
  const dateTo      = filterValues['dateTo']   ?? '';
  const apiDateFrom = formatApiDate(dateFrom);
  const apiDateTo   = formatApiDate(dateTo);

  const { data: allData = [], isLoading, error } = useQuery({
    queryKey: queryKeys.history.byDateRange(apiDateFrom, apiDateTo),
    queryFn: () => getHistoryByDate({ dateFrom: apiDateFrom, dateTo: apiDateTo }),
    enabled: Boolean(apiDateFrom) && Boolean(apiDateTo),
  });

  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  const userMap = React.useMemo(
    () => new Map(employees.map((e) => [e.id, resolveTranslation(e.name, lang)])),
    [employees, lang],
  );

  const resolveUser = (h: HistoryListItem) => userMap.get(h.userId) ?? h.userId;

  useEffect(() => {
    const map = new Map(employees.map((e) => [e.id, resolveTranslation(e.name, lang)]));
    const users = Array.from(
      new Map(allData.map((h) => [h.userId, map.get(h.userId) ?? h.userId])).entries(),
    ).map(([value, label]) => ({ value, label }));
    registerFilterOptions('userName', users);
  }, [allData, employees, lang, registerFilterOptions]);

  // ── Client-side filters: userName, objectType, objectId, actionType ──
  const filterFields = [
    { key: 'userName',   extract: (h: HistoryListItem) => h.userId,        matchMode: 'exact' as const },
    { key: 'objectType', extract: (h: HistoryListItem) => h.objectType },
    { key: 'objectId',   extract: (h: HistoryListItem) => String(h.objectId) },
    { key: 'actionType', extract: (h: HistoryListItem) => h.actionType,    matchMode: 'exact' as const },
  ];

  const listOps = useListOperations<HistoryListItem>({
    data: allData,
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
        {urlObjectId && (
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
        <ActionDetailModal
          open
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  );
}
