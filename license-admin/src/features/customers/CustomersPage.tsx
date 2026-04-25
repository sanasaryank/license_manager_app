import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '../../queryKeys';
import { getCustomers, updateCustomer, downloadLicense } from '../../api/customers';
import { getLicenseTypes } from '../../api/licenseTypes';
import { getLicenseVersions } from '../../api/licenseVersions';
import { getCustomerTags } from '../../api/customerTags';
import { getEmployees } from '../../api/employees';
import { useListOperations } from '../../hooks/useListOperations';
import { useBlockToggle } from '../../hooks/useBlockToggle';
import { useAuth } from '../../providers/AuthProvider';
import { useFilterValues, useRegisterFilterOptions } from '../../providers/FilterProvider';
import { resolveTranslation } from '../../utils/translation';
import { formatDate, formatDateTime, getCustomerMinEndDate, localTodayString } from '../../utils/timestamp';
import { triggerTextDownload } from '../../utils/licenseFile';
import { handleGlobalError } from '../../api/errorHandler';
import { normalizeError } from '../../api/errorNormalizer';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { RowActions } from '../../components/ui/RowActions';
import { IconPlus, IconList, IconTree, IconDownload } from '../../components/ui/Icons';
import { ROUTES } from '../../constants/routes';
import type { CustomerListItem } from '../../types/customer';
import { buildTree, computeVisibleIds, flattenTree, makeTreeSortFn } from '../../utils/customerTree';
import { LicenseBadge } from './LicenseBadge';
import { TagChip } from './TagChip';
import { CustomerModal } from './CustomerModal';
import { CustomerTreeView } from './CustomerTreeView';
import { LicenseSelectModal } from './LicenseSelectModal';

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

  const { data: licenseVersions = [] } = useQuery({
    queryKey: queryKeys.licenseVersions.all,
    queryFn: getLicenseVersions,
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
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [downloadingHwids, setDownloadingHwids] = useState<Set<string>>(new Set());
  const [licenseSelectCustomer, setLicenseSelectCustomer] = useState<CustomerListItem | null>(null);

  const handleDownloadWithHwid = React.useCallback(async (customerId: string, hwid: string) => {
    setDownloadingIds((prev) => new Set(prev).add(customerId));
    setDownloadingHwids((prev) => new Set(prev).add(hwid));
    try {
      const content = await downloadLicense(customerId, hwid);
      triggerTextDownload(content, 'basalt.ini');
      setLicenseSelectCustomer(null);
    } catch (err) {
      handleGlobalError(normalizeError(err));
    } finally {
      setDownloadingIds((prev) => { const next = new Set(prev); next.delete(customerId); return next; });
      setDownloadingHwids((prev) => { const next = new Set(prev); next.delete(hwid); return next; });
    }
  }, []);

  const handleDownloadLicense = React.useCallback((customer: CustomerListItem) => {
    const licenses = customer.licenses ?? [];
    if (licenses.length === 0) {
      handleGlobalError({ title: t('customers.downloadLicense'), message: t('customers.downloadLicenseNoLicenses') });
      return;
    }
    if (licenses.length === 1) {
      handleDownloadWithHwid(customer.id, licenses[0].hwid);
      return;
    }
    setLicenseSelectCustomer(customer);
  }, [handleDownloadWithHwid, t]);

  // --- Tree view state ---
  const [viewMode, setViewMode] = useState<'flat' | 'tree'>('flat');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleToggleExpand = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const filterFields = React.useMemo(() => [
    { key: 'name', extract: (c: CustomerListItem) => resolveTranslation(c.name, lang), matchMode: 'contains' as const },
    { key: 'responsibleId', extract: (c: CustomerListItem) => c.responsibleId ?? '', matchMode: 'exact' as const },
    { key: 'licenseTypeId', extract: (c: CustomerListItem) => (c.licenses ?? []).map((l) => l.licenseTypeId).join(','), matchMode: 'array' as const },
    { key: 'tag', extract: (c: CustomerListItem) => (c.tags ?? []).join(','), matchMode: 'array' as const },
    { key: 'TIN', extract: (c: CustomerListItem) => c.TIN ?? '' },
    { key: 'isBlocked', extract: (c: CustomerListItem) => c.isBlocked ? 'true' : 'false', matchMode: 'exact' as const },
  ], [lang]);

  const flatCustomers = React.useMemo(
    () => customers.filter((c) => (c.type ?? 'customer') !== 'group'),
    [customers],
  );

  const listOps = useListOperations<CustomerListItem>({
    data: flatCustomers,
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

  // ─── Tree mode pipeline ──────────────────────────────────────────────────
  // Filters apply first (no text search), then tree is built, then
  // hierarchy-aware search determines visible nodes.

  const treeBaseData = React.useMemo(() => {
    if (viewMode !== 'tree') return [];
    const activeFilters = Object.entries(filterValues).filter(([, v]) => v.trim());
    if (!activeFilters.length) return customers;
    return customers.filter((c) =>
      filterFields.every(({ key, extract, matchMode }) => {
        const fv = filterValues[key];
        if (!fv?.trim()) return true;
        const extracted = extract(c);
        if (matchMode === 'exact') return extracted === fv;
        if (matchMode === 'array') return extracted.split(',').includes(fv);
        return extracted.toLowerCase().includes(fv.toLowerCase().trim());
      }),
    );
  }, [viewMode, customers, filterValues, filterFields]);

  const { roots: treeRoots, nodeMap: treeNodeMap } = React.useMemo(
    () => (viewMode === 'tree' ? buildTree(treeBaseData) : { roots: [], nodeMap: new Map() }),
    [viewMode, treeBaseData],
  );

  const treeVisibleIds = React.useMemo(
    () =>
      viewMode === 'tree'
        ? computeVisibleIds(treeNodeMap, search, (c) => resolveTranslation(c.name, lang))
        : null,
    [viewMode, treeNodeMap, search, lang],
  );

  const treeSortFn = React.useMemo(
    () =>
      makeTreeSortFn(listOps.sort, {
        name: (c) => resolveTranslation(c.name, lang),
        minEndDate: (c) => getCustomerMinEndDate(c.licenses ?? []) ?? '9999-12-31',
        lastUpdated: (c) => c.lastUpdated ?? '',
      }),
    [listOps.sort, lang],
  );

  const treeRows = React.useMemo(
    () =>
      viewMode === 'tree'
        ? flattenTree(treeRoots, expandedIds, treeVisibleIds, treeSortFn)
        : [],
    [viewMode, treeRoots, expandedIds, treeVisibleIds, treeSortFn],
  );

  // Build full group path string for each customer (flat mode column)
  const groupPathMap = React.useMemo(() => {
    const nameMap = new Map<string, string>();
    const parentMap = new Map<string, string | null>();
    for (const c of customers) {
      nameMap.set(c.id, resolveTranslation(c.name, lang));
      parentMap.set(c.id, c.parent_id ?? null);
    }
    const resolve = (id: string): string => {
      const pid = parentMap.get(id);
      if (!pid || !nameMap.has(pid)) return '';
      const parentPath = resolve(pid);
      const parentName = nameMap.get(pid)!;
      return parentPath ? `${parentPath} / ${parentName}` : parentName;
    };
    const result = new Map<string, string>();
    for (const c of customers) {
      result.set(c.id, resolve(c.id));
    }
    return result;
  }, [customers, lang]);

  const columns = [
    { key: 'name', header: t('customers.name'), sortable: true, render: (c: CustomerListItem) => resolveTranslation(c.name, lang) },
    {
      key: 'group',
      header: t('customers.parent'),
      render: (c: CustomerListItem) => {
        const path = groupPathMap.get(c.id);
        return path ? <span className="text-gray-500 text-sm">{path}</span> : <span className="text-gray-300">—</span>;
      },
    },
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
            ...(( c.type ?? 'customer') !== 'group' ? [{
              type: 'custom' as const,
              onClick: () => handleDownloadLicense(c),
              disabled: downloadingIds.has(c.id),
              label: t('customers.downloadLicense'),
              icon: <IconDownload />,
            }] : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{t('customers.title')}</h1>
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="inline-flex overflow-hidden rounded-md border border-gray-300">
            <button
              type="button"
              className={`flex items-center gap-1 px-3 py-1.5 text-sm ${
                viewMode === 'flat'
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('flat')}
            >
              <IconList className="h-4 w-4" />
              {t('customers.viewFlat')}
            </button>
            <button
              type="button"
              className={`flex items-center gap-1 border-l border-gray-300 px-3 py-1.5 text-sm ${
                viewMode === 'tree'
                  ? 'bg-primary-50 text-primary-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setViewMode('tree')}
            >
              <IconTree className="h-4 w-4" />
              {t('customers.viewTree')}
            </button>
          </div>
          <Button leftIcon={<IconPlus />} onClick={() => { setEditId(null); setModalOpen(true); }}>
            {t('common.create')}
          </Button>
        </div>
      </div>

      <Input
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <div className="rounded-lg border bg-white shadow-sm">
        {viewMode === 'flat' ? (
          <>
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
          </>
        ) : (
          <CustomerTreeView
            rows={treeRows}
            isLoading={isLoading}
            error={error}
            lang={lang}
            sort={listOps.sort}
            onSort={listOps.toggleSort}
            onToggleExpand={handleToggleExpand}
            licenseTypes={licenseTypes}
            allTags={allTags}
            employeeMap={employeeMap}
            onEdit={(id) => { setEditId(id); setModalOpen(true); }}
            onBlockToggle={(id, isBlocked) => blockToggle.mutate({ id, isBlocked })}
            onDownloadLicense={handleDownloadLicense}
            downloadingIds={downloadingIds}
          />
        )}
      </div>

      {modalOpen && (
        <CustomerModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          editId={editId}
          licenseTypes={licenseTypes}
          licenseVersions={licenseVersions}
          allTags={allTags}
        />
      )}

      {licenseSelectCustomer && (
        <LicenseSelectModal
          open={!!licenseSelectCustomer}
          onClose={() => setLicenseSelectCustomer(null)}
          licenses={licenseSelectCustomer.licenses ?? []}
          onSelect={(hwid) => handleDownloadWithHwid(licenseSelectCustomer.id, hwid)}
          loadingHwids={downloadingHwids}
        />
      )}
    </div>
  );
}
