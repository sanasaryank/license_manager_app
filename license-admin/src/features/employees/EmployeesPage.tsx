import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '../../queryKeys';
import { getEmployees, blockEmployee } from '../../api/employees';
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
import type { EmployeeListItem } from '../../types/employee';
import { EmployeeModal } from './EmployeeModal';

export default function EmployeesPage() {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const navigate = useNavigate();

  const { data = [], isLoading, error } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const listOps = useListOperations<EmployeeListItem>({
    data,
    searchFields: (e) => [
      resolveTranslation(e.name, lang),
      e.username,
    ],
    externalSearch: search,
    defaultSort: { key: 'username', direction: 'asc' },
    sortFields: {
      name: (e) => resolveTranslation(e.name, lang),
    },
  });

  const blockToggle = useBlockToggle({
    blockFn: blockEmployee,
    listQueryKey: queryKeys.employees.all,
  });

  const openCreate = () => { setEditId(null); setModalOpen(true); };
  const openEdit = (id: string) => { setEditId(id); setModalOpen(true); };

  const columns = [
    {
      key: 'name',
      header: t('employees.name'),
      sortable: true,
      render: (e: EmployeeListItem) => resolveTranslation(e.name, lang),
    },
    { key: 'username', header: t('employees.username'), sortable: true },
    {
      key: 'role',
      header: t('employees.role'),
      render: (e: EmployeeListItem) => t(`Employees.role.${e.role}`),
    },
    {
      key: 'isBlocked',
      header: t('common.blocked'),
      render: (e: EmployeeListItem) =>
        e.isBlocked ? (
          <Badge variant="danger">{t('common.blocked')}</Badge>
        ) : (
          <Badge variant="success">{t('common.active')}</Badge>
        ),
    },
    {
      key: 'description',
      header: t('common.description'),
      render: (e: EmployeeListItem) => e.description || '—',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (e: EmployeeListItem) => (
        <RowActions
          actions={[
            { type: 'edit', onClick: () => openEdit(e.id) },
            e.isBlocked
              ? { type: 'unblock', onClick: () => blockToggle.mutate({ id: e.id, isBlocked: false }) }
              : { type: 'block', onClick: () => blockToggle.mutate({ id: e.id, isBlocked: true }) },
            {
              type: 'history',
              onClick: () => navigate(`${ROUTES.HISTORY}?objectId=${encodeURIComponent(e.id)}`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('employees.title')}</h1>
        <Button leftIcon={<IconPlus />} onClick={openCreate}>
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
          keyExtractor={(e) => e.id}
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
        <EmployeeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editId={editId}
        />
      )}
    </div>
  );
}
