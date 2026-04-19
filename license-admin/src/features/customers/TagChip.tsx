import React from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import type { CustomerTagListItem } from '../../types/customerTag';

const MAX_VISIBLE = 3;

interface TagChipProps {
  tagIds: string[];
  allTags: CustomerTagListItem[];
}

/** tagIds is like ["tagId:tagItemId", ...] */
export function TagChip({ tagIds, allTags }: TagChipProps) {
  const { lang } = useAuth();
  const visible = tagIds.slice(0, MAX_VISIBLE);
  const rest = tagIds.length - MAX_VISIBLE;

  const resolve = (tagId: string) => {
    const [parentId, itemId] = tagId.split(':');
    const parent = allTags.find((t) => t.id === parentId);
    const item = parent?.items?.find((i) => i.id === itemId);
    const parentLabel = parent ? resolveTranslation(parent.name, lang) : parentId;
    const itemLabel = item ? resolveTranslation(item.name, lang) : itemId;
    return `${parentLabel}: ${itemLabel}`;
  };

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((id) => (
        <span
          key={id}
          className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs text-primary-800"
          title={resolve(id)}
        >
          {resolve(id)}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-xs text-gray-400">+{rest}</span>
      )}
    </div>
  );
}
