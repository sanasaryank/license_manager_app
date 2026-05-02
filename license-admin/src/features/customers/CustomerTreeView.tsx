import React from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { CustomerListItem, CustomerLicense } from '../../types/customer';
import type { CustomerStatusListItem } from '../../types/customerStatus';
import type { LicenseTypeListItem } from '../../types/licenseType';
import type { CustomerTagListItem } from '../../types/customerTag';
import type { SortState, LangCode } from '../../types/common';
import type { FlatTreeRow } from '../../utils/customerTree';
import { countCustomerDescendants } from '../../utils/customerTree';
import { Badge } from '../../components/ui/Badge';
import { RowActions } from '../../components/ui/RowActions';
import { Spinner } from '../../components/ui/Spinner';
import { IconChevronRight, IconChevronDown, IconFolder, IconDownload } from '../../components/ui/Icons';
import { LicenseBadge } from './LicenseBadge';
import { TagChip } from './TagChip';
import { resolveTranslation } from '../../utils/translation';
import { formatDate, formatDateTime, getCustomerMinEndDate, localTodayString } from '../../utils/timestamp';
import { ROUTES } from '../../constants/routes';

// Mirrors the SortIcon in Table.tsx for consistent look
function SortIcon({ active, direction }: { active: boolean; direction?: 'asc' | 'desc' }) {
  return (
    <span className="ml-1 inline-flex flex-col gap-0.5">
      <svg
        className={clsx('h-2.5 w-2.5', active && direction === 'asc' ? 'text-primary-600' : 'text-gray-300')}
        viewBox="0 0 10 6"
        fill="currentColor"
      >
        <path d="M5 0L10 6H0L5 0Z" />
      </svg>
      <svg
        className={clsx('h-2.5 w-2.5', active && direction === 'desc' ? 'text-primary-600' : 'text-gray-300')}
        viewBox="0 0 10 6"
        fill="currentColor"
      >
        <path d="M5 6L0 0H10L5 6Z" />
      </svg>
    </span>
  );
}

interface Props {
  rows: FlatTreeRow[];
  isLoading: boolean;
  error: unknown;
  lang: LangCode;
  sort: SortState | null;
  onSort: (key: string) => void;
  onToggleExpand: (id: string) => void;
  licenseTypes: LicenseTypeListItem[];
  allTags: CustomerTagListItem[];
  employeeMap: Map<string, string>;
  statusMap: Map<string, CustomerStatusListItem>;
  onEdit: (id: string) => void;
  onBlockToggle: (id: string, isBlocked: boolean) => void;
  onDownloadLicense: (customer: CustomerListItem) => void;
  downloadingIds: Set<string>;
}

export function CustomerTreeView({
  rows,
  isLoading,
  error,
  lang,
  sort,
  onSort,
  onToggleExpand,
  licenseTypes,
  allTags,
  employeeMap,
  statusMap,
  onEdit,
  onBlockToggle,
  onDownloadLicense,
  downloadingIds,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const headers: { key: string; label: string; sortable?: boolean }[] = [
    { key: 'name', label: t('customers.name'), sortable: true },
    { key: 'type', label: t('customers.type') },
    { key: 'childrenCount', label: t('customers.childrenCount') },
    { key: 'responsible', label: t('customers.responsible'), sortable: true },
    { key: 'licenses', label: t('customers.licenses') },
    { key: 'tags', label: t('customers.tags') },
    { key: 'status', label: t('customers.status') },
    { key: 'isBlocked', label: t('common.blocked') },
    { key: 'lastUpdated', label: t('customers.lastChangeDate'), sortable: true },
    { key: 'minEndDate', label: t('customers.minEndDate'), sortable: true },
    { key: 'actions', label: t('common.actions') },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="py-8 text-center text-sm text-red-500">{String(error)}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            {headers.map((h) => (
              <th
                key={h.key}
                className={clsx(
                  'px-4 py-3 font-medium text-gray-600',
                  h.sortable && 'cursor-pointer select-none hover:text-gray-900',
                )}
                onClick={h.sortable ? () => onSort(h.key) : undefined}
              >
                <span className="inline-flex items-center">
                  {h.label}
                  {h.sortable && (
                    <SortIcon
                      active={sort?.key === h.key}
                      direction={sort?.key === h.key ? sort.direction : undefined}
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-gray-400">
                {t('common.noData')}
              </td>
            </tr>
          ) : (
            rows.map(({ node, isExpanded, hasChildren }) => {
              const c = node.item;
              const isGroup = (c.type ?? 'customer') === 'group';

              const minEndDate = isGroup ? null : getCustomerMinEndDate(c.licenses ?? []);
              const today = localTodayString();
              const soon = localTodayString(7);
              const endDateColor = minEndDate
                ? minEndDate < today
                  ? 'text-red-900 font-semibold'
                  : minEndDate < soon
                  ? 'text-red-500'
                  : ''
                : '';

              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  {/* Name — indent by depth, collapse/expand toggle, group icon */}
                  <td className="px-4 py-3 text-gray-900">
                    <span
                      className="inline-flex items-center gap-1"
                      style={{ paddingLeft: `${node.depth * 20}px` }}
                    >
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => onToggleExpand(c.id)}
                          className="flex-shrink-0 rounded text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? (
                            <IconChevronDown className="h-4 w-4" />
                          ) : (
                            <IconChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <span className="w-4 flex-shrink-0" />
                      )}
                      {isGroup && (
                        <IconFolder className="h-4 w-4 flex-shrink-0 text-amber-500" />
                      )}
                      <span className={clsx(isGroup && 'font-medium')}>
                        {resolveTranslation(c.name, lang)}
                      </span>
                    </span>
                  </td>

                  {/* Type badge */}
                  <td className="px-4 py-3">
                    {isGroup ? (
                      <Badge variant="warning">{t('customers.typeGroup')}</Badge>
                    ) : (
                      <span className="text-xs text-gray-400">{t('customers.typeCustomer')}</span>
                    )}
                  </td>

                  {/* Customer descendants count (groups only) */}
                  <td className="px-4 py-3 text-gray-700">
                    {isGroup ? (countCustomerDescendants(node) || '—') : '—'}
                  </td>

                  {/* Responsible (customers only) */}
                  <td className="px-4 py-3 text-gray-700">
                    {isGroup
                      ? '—'
                      : c.responsibleName ||
                        employeeMap.get(c.responsibleId) ||
                        c.responsibleId ||
                        '—'}
                  </td>

                  {/* Licenses (customers only) */}
                  <td className="px-4 py-3">
                    {!isGroup && (
                      <div className="flex flex-wrap gap-1">
                        {(c.licenses ?? []).map((l, i) => (
                          <LicenseBadge
                            key={i}
                            licenseTypeId={l.licenseTypeId}
                            licenseTypes={licenseTypes}
                          />
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Tags */}
                  <td className="px-4 py-3">
                    <TagChip tagIds={c.tags ?? []} allTags={allTags} />
                  </td>

                  {/* Customer Status */}
                  <td className="px-4 py-3">
                    {c.statusId ? (() => {
                      const s = statusMap.get(c.statusId);
                      return s ? (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                          style={{ backgroundColor: s.color }}
                        >
                          {resolveTranslation(s.name, lang)}
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-gray-400">{c.statusId}</span>
                      );
                    })() : <span className="text-gray-300">—</span>}
                  </td>

                  {/* Blocked */}
                  <td className="px-4 py-3">
                    {c.isBlocked ? (
                      <Badge variant="danger">{t('common.blocked')}</Badge>
                    ) : (
                      <Badge variant="success">{t('common.active')}</Badge>
                    )}
                  </td>

                  {/* Last updated */}
                  <td className="px-4 py-3 text-gray-700">
                    {c.lastUpdated ? formatDateTime(c.lastUpdated) : '—'}
                  </td>

                  {/* Min end date (customers only) */}
                  <td className="px-4 py-3">
                    {isGroup ? (
                      <span>—</span>
                    ) : minEndDate ? (
                      <span className={endDateColor}>{formatDate(minEndDate)}</span>
                    ) : (
                      <span>—</span>
                    )}
                  </td>

                  {/* Row actions */}
                  <td className="px-4 py-3">
                    <RowActions
                      actions={[
                        { type: 'edit', onClick: () => onEdit(c.id) },
                        c.isBlocked
                          ? ({ type: 'unblock' as const, onClick: () => onBlockToggle(c.id, false) })
                          : ({ type: 'block' as const, onClick: () => onBlockToggle(c.id, true) }),
                        {
                          type: 'history' as const,
                          onClick: () =>
                            navigate(
                              `${ROUTES.HISTORY}?objectId=${encodeURIComponent(c.id)}`,
                            ),
                        },
                        ...(!isGroup ? [{
                          type: 'custom' as const,
                          onClick: () => onDownloadLicense(c),
                          disabled: downloadingIds.has(c.id),
                          label: t('customers.downloadLicense'),
                          icon: <IconDownload />,
                        }] : []),
                      ]}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
