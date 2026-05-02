import React, { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../queryKeys';
import { getLicenseVersion, createLicenseVersion, updateLicenseVersion } from '../../api/licenseVersions';
import { buildDiffPayload } from '../../api/diffPayload';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Textarea } from '../../components/ui/Textarea';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { useFormError } from '../../hooks/useFormError';

const schema = z.object({
  name: z.string().regex(/^\d+\.\d+\.\d+$/, 'Format: 0.0.0 (e.g. 10.3700.1158)'),
  description: z.string().default(''),
  isBlocked: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editId: string | null;
}

export function LicenseVersionModal({ open, onClose, editId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const { data: lv, isLoading } = useQuery({
    queryKey: queryKeys.licenseVersions.byId(editId!),
    queryFn: () => getLicenseVersion(editId!),
    enabled: !!editId,
  });

  const { reset, register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', isBlocked: false },
  });

  // Segment state
  const [segs, setSegs] = React.useState(['', '', '']);
  const seg0Ref = useRef<HTMLInputElement>(null);
  const seg1Ref = useRef<HTMLInputElement>(null);
  const seg2Ref = useRef<HTMLInputElement>(null);
  const segRefs = [seg0Ref, seg1Ref, seg2Ref];

  useEffect(() => {
    if (lv) {
      const parts = lv.name.split('.');
      const s: [string, string, string] = [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
      setSegs(s);
      reset({ name: lv.name, description: lv.description ?? '', isBlocked: lv.isBlocked });
    }
  }, [lv, reset]);

  // Sync segment values into form whenever they change
  useEffect(() => {
    setValue('name', segs.join('.'), { shouldValidate: segs[2] !== '' });
  }, [segs, setValue]);

  const [mutationError, setMutationError] = React.useState<unknown>(null);
  const { errorMessage } = useFormError(mutationError);

  const onSubmit = async (values: FormValues) => {
    setMutationError(null);
    try {
      if (isEdit && lv) {
        const diff = buildDiffPayload(
          { name: lv.name, description: lv.description ?? '', isBlocked: lv.isBlocked },
          { name: values.name, description: values.description ?? '', isBlocked: values.isBlocked },
          {},
        );
        if (!diff) { onClose(); return; }
        await updateLicenseVersion(lv.id, { ...diff, id: lv.id, hash: lv.hash });
      } else {
        await createLicenseVersion({
          name: values.name,
          description: values.description ?? '',
          isBlocked: values.isBlocked,
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.licenseVersions.all, exact: true });
      if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.licenseVersions.byId(editId), exact: true });
      onClose();
    } catch (err) {
      setMutationError(err);
    }
  };

  const handleSegKeyDown = (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '.') {
      e.preventDefault();
      if (i < 2) segRefs[i + 1].current?.focus();
    } else if (e.key === 'Backspace' && segs[i] === '' && i > 0) {
      e.preventDefault();
      segRefs[i - 1].current?.focus();
    } else if (
      e.key.length === 1 &&
      !/\d/.test(e.key) &&
      !e.ctrlKey && !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handleSegChange = (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setSegs(prev => {
      const next = [...prev] as [string, string, string];
      next[i] = digits;
      return next;
    });
  };

  const segInputClass = (hasError: boolean) => [
    'min-w-0 bg-transparent text-center font-mono text-sm text-gray-900 outline-none',
    'placeholder:text-gray-400',
    hasError ? '' : '',
  ].join(' ');

  const wrapperClass = errors.name
    ? 'flex items-center gap-0 rounded-md border border-red-500 px-3 py-2 focus-within:ring-1 focus-within:ring-red-500'
    : 'flex items-center gap-0 rounded-md border border-gray-300 px-3 py-2 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('licenseVersions.editTitle') : t('licenseVersions.createTitle')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
          <Button type="submit" form="lv-form" loading={isSubmitting}>{t('common.save')}</Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <form id="lv-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              {t('common.name')}<span className="ml-1 text-red-500">*</span>
            </label>
            <div className={wrapperClass}>
              <input
                ref={seg0Ref}
                value={segs[0]}
                onChange={handleSegChange(0)}
                onKeyDown={handleSegKeyDown(0)}
                placeholder="0"
                inputMode="numeric"
                autoComplete="off"
                size={6}
                className={segInputClass(!!errors.name)}
                style={{ width: `${Math.max(segs[0].length, 1) + 1}ch` }}
              />
              <span className="select-none font-mono text-sm text-gray-400">.</span>
              <input
                ref={seg1Ref}
                value={segs[1]}
                onChange={handleSegChange(1)}
                onKeyDown={handleSegKeyDown(1)}
                placeholder="0"
                inputMode="numeric"
                autoComplete="off"
                size={6}
                className={segInputClass(!!errors.name)}
                style={{ width: `${Math.max(segs[1].length, 1) + 1}ch` }}
              />
              <span className="select-none font-mono text-sm text-gray-400">.</span>
              <input
                ref={seg2Ref}
                value={segs[2]}
                onChange={handleSegChange(2)}
                onKeyDown={handleSegKeyDown(2)}
                placeholder="0"
                inputMode="numeric"
                autoComplete="off"
                size={6}
                className={segInputClass(!!errors.name)}
                style={{ width: `${Math.max(segs[2].length, 1) + 1}ch` }}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <Checkbox label={t('common.blocked')} {...register('isBlocked')} />
          <Textarea label={t('common.description')} {...register('description')} />
          {errorMessage && <ErrorBanner message={errorMessage} />}
        </form>
      )}
    </Modal>
  );
}

