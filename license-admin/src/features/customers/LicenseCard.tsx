import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { IconTrash, IconChevronDown, IconChevronRight, IconCopy } from '../../components/ui/Icons';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import type { LicenseTypeListItem } from '../../types/licenseType';
import type { LicenseVersionListItem } from '../../types/licenseVersion';

interface LicenseCardProps {
  index: number;
  onRemove: () => void;
  licenseTypes: LicenseTypeListItem[];
  licenseVersions: LicenseVersionListItem[];
}

export function LicenseCard({ index, onRemove, licenseTypes, licenseVersions }: LicenseCardProps) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const { register, control, watch } = useFormContext();
  const [expanded, setExpanded] = useState(true);
  const confirmRemove = useConfirmDialog();

  const watchedTypeId = watch(`licenses.${index}.licenseTypeId`);
  const watchedOrgName = watch(`licenses.${index}.OrgName`);
  const watchedBlocked = watch(`licenses.${index}.isBlocked`);

  const selectedLt = licenseTypes.find((lt) => lt.id === watchedTypeId);
  const ltName = selectedLt ? resolveTranslation(selectedLt.name, lang) : t('customers.licenseHeader');

  const ltOptions = licenseTypes.map((lt) => ({
    value: lt.id,
    label: resolveTranslation(lt.name, lang),
  }));

  const versionOptions = licenseVersions.map((lv) => ({
    value: lv.id,
    label: lv.name,
  }));

  return (
    <div className="rounded-md border shadow-sm">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between rounded-t-md bg-gray-50 px-4 py-2"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <IconChevronDown className="h-4 w-4" /> : <IconChevronRight className="h-4 w-4" />}
          <span className="text-sm font-medium text-gray-700">
            {ltName}{watchedOrgName ? ` – ${watchedOrgName}` : ''}
          </span>
          {watchedBlocked && <Badge variant="danger">{t('common.blocked')}</Badge>}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); confirmRemove.requestConfirm(async () => onRemove()); }}
          className="text-gray-400 hover:text-red-500"
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </div>

      {expanded && (
        <div className="flex flex-col gap-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label={t('customers.orgName')} {...register(`licenses.${index}.OrgName`)} />
            <Controller
              name={`licenses.${index}.licenseTypeId`}
              control={control}
              render={({ field }) => (
                <Select
                  label={t('customers.licenseType')}
                  options={ltOptions}
                  placeholder={t('common.all')}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Input label={t('customers.maxConnCount')} type="number" {...register(`licenses.${index}.MaxConnCount`, { valueAsNumber: true })} />
            <Controller
              name={`licenses.${index}.versionId`}
              control={control}
              render={({ field }) => (
                <Select
                  label={t('customers.licenseVersion')}
                  options={versionOptions}
                  placeholder={t('common.all')}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700">{t('customers.licenseId')}</span>
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="flex-1 font-mono text-sm text-gray-600">
                  {watch(`licenses.${index}.licenseId`) || '—'}
                </span>
                {watch(`licenses.${index}.licenseId`) && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(watch(`licenses.${index}.licenseId`) ?? '')}
                    className="shrink-0 text-gray-400 hover:text-gray-600"
                    title={t('common.copy')}
                  >
                    <IconCopy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <Input label={t('customers.hwid')} {...register(`licenses.${index}.hwid`)} />
          </div>

          <Checkbox label={t('customers.track')} {...register(`licenses.${index}.track`)} />
          <Checkbox label={t('common.blocked')} {...register(`licenses.${index}.isBlocked`)} />
          <Input label={t('customers.endDate')} type="date" {...register(`licenses.${index}.endDate`)} />
          <Textarea label={t('common.description')} {...register(`licenses.${index}.description`)} />

          {/* Dynamic values based on license type fields */}
          {selectedLt && selectedLt.fields && selectedLt.fields.length > 0 && (
            <DynamicValuesEditor index={index} licenseType={selectedLt} />
          )}
        </div>
      )}
      <ConfirmDialog
        open={confirmRemove.isOpen}
        title={t('customers.removeLicense')}
        message={t('common.confirmDelete')}
        onConfirm={confirmRemove.confirm}
        onCancel={confirmRemove.close}
      />
    </div>
  );
}

function DynamicValuesEditor({
  index,
  licenseType,
}: {
  index: number;
  licenseType: LicenseTypeListItem;
}) {
  const { t } = useTranslation();
  const { register, control } = useFormContext();

  return (
    <div className="flex flex-col gap-3 border-t pt-3">
      <p className="text-xs font-semibold uppercase text-gray-500">{t('customers.values')}</p>
      <div className="grid grid-cols-2 gap-3">
        {licenseType.fields.map((field) => {
          const fieldPath = `licenses.${index}.values.${field.name}`;
          if (field.kind === 'boolean') {
            return (
              <Checkbox key={field.name} label={field.name} {...register(fieldPath)} />
            );
          }
          if (field.enum && field.enum.length > 0) {
            return (
              <Controller
                key={field.name}
                name={fieldPath}
                control={control}
                render={({ field: f }) => (
                  <Select
                    label={field.name}
                    options={field.enum.map((v) => ({ value: v, label: v }))}
                    placeholder=""
                    value={String(f.value ?? '')}
                    onChange={f.onChange}
                    required={field.required}
                  />
                )}
              />
            );
          }
          const inputType =
            field.kind === 'int' || field.kind === 'float'
              ? 'number'
              : field.kind === 'date'
              ? 'date'
              : field.kind === 'datetime'
              ? 'datetime-local'
              : field.kind === 'time'
              ? 'time'
              : 'text';
          return (
            <Input
              key={field.name}
              label={field.name}
              type={inputType}
              required={field.required}
              {...register(fieldPath)}
            />
          );
        })}
      </div>
    </div>
  );
}
