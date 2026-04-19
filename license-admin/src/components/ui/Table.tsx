import React from 'react';
import clsx from 'clsx';
import { Spinner } from './Spinner';

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  error?: string | null;
  emptyText?: string;
  sort?: SortState | null;
  onSort?: (key: string) => void;
  keyExtractor: (item: T) => string;
}

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

export function Table<T>({
  columns,
  data,
  isLoading,
  error,
  emptyText = 'No data',
  sort,
  onSort,
  keyExtractor,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }
  if (error) {
    return <div className="py-8 text-center text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 font-medium text-gray-600',
                  col.sortable && 'cursor-pointer select-none hover:text-gray-900',
                  col.className,
                )}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center">
                  {col.header}
                  {col.sortable && (
                    <SortIcon
                      active={sort?.key === col.key}
                      direction={sort?.key === col.key ? sort.direction : undefined}
                    />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-10 text-center text-gray-400"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={clsx('px-4 py-3 text-gray-900', col.className)}
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
