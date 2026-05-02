import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '../../queryKeys';
import { getCustomerStatuses, blockCustomerStatus } from '../../api/customerStatuses';
import { useListOperations } from '../../hooks/useListOperations';
import { useBlockToggle } from '../../hooks/useBlockToggle';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { RowActions } from '../../components/ui/RowActions';
import { IconPlus } from '../../components/ui/Icons';
import { ROUTES } from '../../constants/routes';
import type { CustomerStatusListItem } from '../../types/customerStatus';
import { CustomerStatusModal } from './CustomerStatusModal';

export default function CustomerStatusesPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const navigate = useNavigate();

  const { data = [], isLoading, error } = useQuery({
    queryKey: queryKeys.customerStatuses.all,
    queryFn: getCustomerStatuses,
  });

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const listOps = useListOperations<CustomerStatusListItem>({
    data,
    searchFields: (item) => [resolveTranslation(item.name, lang)],
    externalSearch: search,
    defaultSort: { key: 'name', direction: 'asc' },
    sortFields: { name: (item) => resolveTranslation(item.name, lang) },
  });

  const blockToggle = useBlockToggle({
    blockFn: blockCustomerStatus,
    listQueryKey: queryKeys.customerStatuses.all,
  });

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (item: CustomerStatusListItem) => resolveTranslation(item.name, lang),
    },
    {
      key: 'color',
      header: t('customerStatuses.color'),
      render: (item: CustomerStatusListItem) => (
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-5 w-5 rounded-full border border-gray-200"
            style={{ backgroundColor: item.color }}
          />
          <span className="font-mono text-xs text-gray-600">{item.color}</span>
        </div>
      ),
    },
    {
      key: 'isBlocked',
      header: t('common.blocked'),
      render: (item: CustomerStatusListItem) =>
        item.isBlocked ? (
          <Badge variant="danger">{t('common.blocked')}</Badge>
        ) : (
          <Badge variant="success">{t('common.active')}</Badge>
        ),
    },
    {
      key: 'description',
      header: t('common.description'),
      render: (item: CustomerStatusListItem) => item.description || '—',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: CustomerStatusListItem) => (
        <RowActions
          actions={[
            { type: 'edit', onClick: () => { setEditId(item.id); setModalOpen(true); } },
            item.isBlocked
              ? { type: 'unblock', onClick: () => blockToggle.mutate({ id: item.id, isBlocked: false }) }
              : { type: 'block', onClick: () => blockToggle.mutate({ id: item.id, isBlocked: true }) },
            {
              type: 'history',
              onClick: () => navigate(`${ROUTES.HISTORY}?objectId=${encodeURIComponent(item.id)}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('customerStatuses.title')}</h1>
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
          keyExtractor={(item) => item.id}
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
        <CustomerStatusModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditId(null); }}
          editId={editId}
        />
      )}
    </div>
  );
}
