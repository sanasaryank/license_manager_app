import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { getValidators } from '../../api/validators';
import { queryKeys } from '../../queryKeys';
import type { ValidatorListItem } from '../../types/validator';
import { useListOperations } from '../../hooks/useListOperations';
import type { FilterField } from '../../hooks/useListOperations';
import { useFilterValues } from '../../providers/FilterProvider';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { RowActions } from '../../components/ui/RowActions';
import ValidatorModal from './ValidatorModal';
import { ROUTES } from '../../constants/routes';

export default function ValidatorsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // editId: undefined = modal closed, null = create new, string = edit existing
  const [modalEditId, setModalEditId] = useState<string | null | undefined>(undefined);

  const filterValues = useFilterValues();

  const { data = [], isLoading } = useQuery({
    queryKey: queryKeys.validators.all,
    queryFn: getValidators,
  });

  const filterFields = useMemo<FilterField<ValidatorListItem>[]>(() => [
    { key: 'version',  extract: (item) => item.version },
    { key: 'endpoint', extract: (item) => item.endpoint },
  ], []);

  const sortFields = useMemo<Record<string, (item: ValidatorListItem) => string>>(() => ({
    version:  (item) => item.version,
    endpoint: (item) => item.endpoint,
  }), []);

  const listOps = useListOperations<ValidatorListItem>({
    data,
    searchFields: (item) => [item.version, item.endpoint],
    filterFields,
    externalFilters: filterValues,
    sortFields,
  });

  const columns: Column<ValidatorListItem>[] = [
    {
      key: 'version',
      header: t('validators.version'),
      sortable: true,
      render: (row: ValidatorListItem) => row.version,
    },
    {
      key: 'endpoint',
      header: t('validators.endpoint'),
      sortable: true,
      render: (row: ValidatorListItem) => (
        <span className="font-mono text-sm">{row.endpoint}</span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (row: ValidatorListItem) => (
        <RowActions
          actions={[
            {
              type: 'edit',
              onClick: () => setModalEditId(row.id),
            },
            {
              type: 'history',
              onClick: () => navigate(`${ROUTES.HISTORY}?objectId=${row.id}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('validators.title')}</h1>
        <Button onClick={() => { setModalEditId(null); }}>
          {t('common.create')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <>
          <Table
            columns={columns}
            data={listOps.items}
            keyExtractor={(row) => row.id}
            sort={listOps.sort ?? null}
            onSort={listOps.toggleSort}
            emptyText={t('common.noData')}
          />
          <Pagination
            page={listOps.pagination.page}
            totalPages={listOps.totalPages}
            totalItems={listOps.totalItems}
            pageSize={listOps.pagination.pageSize}
            onPageChange={listOps.setPage}
            onPageSizeChange={listOps.setPageSize}
          />
        </>
      )}

      {modalEditId !== undefined && (
        <ValidatorModal
          editId={modalEditId}
          onClose={() => { setModalEditId(undefined); }}
        />
      )}
    </div>
  );
}
