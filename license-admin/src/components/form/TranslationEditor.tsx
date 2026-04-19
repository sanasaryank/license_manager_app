import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { IconChevronDown, IconChevronRight } from '../ui/Icons';
import { useState } from 'react';

interface TranslationEditorProps {
  /** Dot-path prefix, e.g. "name" → registers name.ARM, name.ENG, name.RUS */
  prefix: string;
  label?: string;
  required?: boolean;
}

export function TranslationEditor({ prefix, label, required }: TranslationEditorProps) {
  const { t } = useTranslation();
  const { control, formState: { errors } } = useFormContext();
  const [expanded, setExpanded] = useState(true);

  const getError = (lang: string) => {
    const parts = prefix.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = errors;
    for (const p of parts) node = node?.[p];
    return node?.[lang]?.message as string | undefined;
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center justify-between px-3 py-2 bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        <span>
          {label ?? t('common.name')}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
        {expanded ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-3">
          {(['ENG', 'ARM', 'RUS'] as const).map((lang) => (
            <Controller
              key={lang}
              name={`${prefix}.${lang}`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label={t(`translation.${lang.toLowerCase()}`)}
                  error={getError(lang)}
                />
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
