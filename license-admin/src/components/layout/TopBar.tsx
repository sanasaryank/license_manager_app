import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import { LANGUAGES } from '../../constants/languages';
import type { LangCode } from '../../types/common';
import { IconChevronRight } from '../ui/Icons';

interface TopBarProps {
  showFilterToggle?: boolean;
  filterOpen?: boolean;
  onFilterToggle?: () => void;
}

export function TopBar({ showFilterToggle, filterOpen, onFilterToggle }: TopBarProps) {
  const { t } = useTranslation();
  const { user, lang, setLang } = useAuth();

  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm">
      {/* Left: empty or breadcrumb placeholder */}
      <div />

      {/* Right: filter toggle + lang selector + user */}
      <div className="flex items-center gap-4">
        {showFilterToggle && (
          <button
            type="button"
            onClick={onFilterToggle}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            title={t('common.filters')}
          >
            <span>{t('common.filters')}</span>
            <IconChevronRight
              className={`h-4 w-4 text-gray-400 transition-transform duration-150 ${
                filterOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{t('common.selectLanguage')}:</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {user && (
          <span className="text-sm font-medium text-gray-700">
            {resolveTranslation(user.name, lang)}
          </span>
        )}
      </div>
    </header>
  );
}
