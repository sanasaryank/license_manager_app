import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '../../queryKeys';
import { getLicenseVersions, updateLicenseVersion } from '../../api/licenseVersions';
import { useListOperations } from '../../hooks/useListOperations';
import { useBlockToggle } from '../../hooks/useBlockToggle';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { RowActions } from '../../components/ui/RowActions';
import { IconPlus } from '../../components/ui/Icons';
import { ROUTES } from '../../constants/routes';
import type { LicenseVersionListItem } from '../../types/licenseVersion';
import { LicenseVersionModal } from './LicenseVersionModal';

export default function LicenseVersionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data = [], isLoading, error } = useQuery({
    queryKey: queryKeys.licenseVersions.all,
    queryFn: getLicenseVersions,
  });

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const listOps = useListOperations<LicenseVersionListItem>({
    data,
    searchFields: (item) => [item.name],
    externalSearch: search,
    defaultSort: { key: 'name', direction: 'asc' },
    sortFields: { name: (item) => item.name },
  });

  const blockToggle = useBlockToggle({
    updateFn: (id, payload) => updateLicenseVersion(id, payload),
    listQueryKey: queryKeys.licenseVersions.all,
  });

  const columns = [
    {
      key: 'name',
      header: t('common.name'),
      sortable: true,
      render: (item: LicenseVersionListItem) => item.name,
    },
    {
      key: 'isBlocked',
      header: t('common.status'),
      render: (item: LicenseVersionListItem) =>
        item.isBlocked ? (
          <Badge variant="danger">{t('common.blocked')}</Badge>
        ) : (
          <Badge variant="success">{t('common.active')}</Badge>
        ),
    },
    {
      key: 'description',
      header: t('common.description'),
      render: (item: LicenseVersionListItem) => item.description || '—',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: LicenseVersionListItem) => (
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
        <h1 className="text-xl font-semibold text-gray-900">{t('licenseVersions.title')}</h1>
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
        <LicenseVersionModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditId(null); }}
          editId={editId}
        />
      )}
    </div>
  );
}
