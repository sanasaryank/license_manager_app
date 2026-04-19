import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { queryKeys } from '../../queryKeys';
import { getAllHistory, getHistoryByObject } from '../../api/history';
import { ROUTES } from '../../constants/routes';
import { useListOperations } from '../../hooks/useListOperations';
import { useFilterValues, useRegisterFilterOptions } from '../../providers/FilterProvider';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const objectIdParam = searchParams.get('objectId') ?? undefined;

  const { data: allData = [], isLoading, error } = useQuery({
    queryKey: objectIdParam
      ? queryKeys.history.byObjectId(objectIdParam)
      : queryKeys.history.all,
    queryFn: objectIdParam
      ? () => getHistoryByObject(objectIdParam)
      : getAllHistory,
  });

  const filterValues = useFilterValues();
  const registerFilterOptions = useRegisterFilterOptions();

  // Register user options for filter
  React.useEffect(() => {
    const users = Array.from(new Set(allData.map((h) => h.userName))).map((u) => ({
      value: u,
      label: u,
    }));
    registerFilterOptions('userName', users);
  }, [allData, registerFilterOptions]);

  // Date range filtering on top of useListOperations
  const dateFiltered = React.useMemo(
    () => filterByDateRange(allData, filterValues),
    [allData, filterValues],
  );

  const filterFields = [
    { key: 'userName', extract: (h: HistoryListItem) => h.userName, matchMode: 'exact' as const },
    { key: 'objectType', extract: (h: HistoryListItem) => h.objectType },
    { key: 'objectId', extract: (h: HistoryListItem) => String(h.objectId) },
    { key: 'actionType', extract: (h: HistoryListItem) => h.actionType, matchMode: 'exact' as const },
  ];

  const listOps = useListOperations<HistoryListItem>({
    data: dateFiltered,
    searchFields: (h) => [h.userName, h.objectType, String(h.objectId)],
    filterFields,
    externalFilters: filterValues,
    defaultSort: { key: 'date', direction: 'desc' },
  });

  const [detailId, setDetailId] = useState<number | null>(null);

  const columns = [
    { key: 'date', header: t('history.date'), sortable: true },
    { key: 'userName', header: t('history.user'), sortable: true },
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
        {objectIdParam && (
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
