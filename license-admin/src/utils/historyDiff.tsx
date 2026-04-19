import React from 'react';
import type { JsonValue } from '../types/common';
import { isLeafDiffNode, isNestedDiffNode } from '../types/history';
import type { HistoryDiffLeaf, HistoryDetails } from '../types/history';

const MISSING_SENTINEL = '<missing>';
const ARRAY_ITEM_LABEL_RE = /^(new:|old:|best_match#|id=|#\d)/;

function renderDiffValue(value: JsonValue): React.ReactNode {
  if (value === null) return <span className="text-gray-400 italic">null</span>;
  if (typeof value === 'string') {
    if (value === MISSING_SENTINEL)
      return (
        <span className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-400 italic">
          &lt;missing&gt;
        </span>
      );
    return <span>{value || '—'}</span>;
  }
  if (typeof value === 'boolean') return <span>{value ? 'true' : 'false'}</span>;
  if (typeof value === 'number')  return <span>{String(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 italic font-mono">[]</span>;
    return (
      <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return (
    <pre className="bg-gray-50 border border-gray-200 rounded p-2 text-xs overflow-x-auto whitespace-pre-wrap">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function SectionLabel({ label }: { label: string }) {
  const isArrayItem = ARRAY_ITEM_LABEL_RE.test(label);
  return (
    <div
      className={
        isArrayItem
          ? 'px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border-b border-indigo-100'
          : 'px-3 py-1.5 text-xs font-mono font-semibold text-gray-600 bg-gray-100 border-b border-gray-200'
      }
    >
      {label}
    </div>
  );
}

function LeafDiffRow({ label, node, t }: { label?: string; node: HistoryDiffLeaf; t: (key: string) => string }) {
  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      {label !== undefined && (
        <div className="bg-gray-50 px-3 py-2 text-xs font-mono font-semibold text-gray-700 border-b border-gray-200">
          {label}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <div className="p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">{t('history.oldValue')}</p>
          <div className="text-sm text-gray-800">{renderDiffValue(node.old as JsonValue)}</div>
        </div>
        <div className="p-3 bg-green-50/30">
          <p className="text-xs font-medium text-gray-500 mb-1">{t('history.newValue')}</p>
          <div className="text-sm text-gray-800">{renderDiffValue(node.new as JsonValue)}</div>
        </div>
      </div>
    </div>
  );
}

export interface DiffNodeRendererProps {
  label?: string;
  node: HistoryDiffLeaf | HistoryDetails;
  t: (key: string) => string;
}

export function DiffNodeRenderer({ label, node, t }: DiffNodeRendererProps): React.ReactElement | null {
  if (isLeafDiffNode(node)) {
    return <LeafDiffRow label={label} node={node} t={t} />;
  }

  if (!isNestedDiffNode(node)) return null;

  const entries = Object.entries(node as HistoryDetails).filter(
    ([, child]) => isLeafDiffNode(child) || isNestedDiffNode(child),
  );
  if (entries.length === 0) return null;

  const children = entries.map(([key, child]) => (
    <DiffNodeRenderer
      key={key}
      label={key}
      node={child as HistoryDiffLeaf | HistoryDetails}
      t={t}
    />
  ));

  if (label === undefined) {
    return <div className="space-y-3">{children}</div>;
  }

  return (
    <div className="rounded-md border border-gray-200 overflow-hidden">
      <SectionLabel label={label} />
      <div className="p-2 space-y-2">{children}</div>
    </div>
  );
}
