import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../queryKeys';
import { getLicenseType, createLicenseType, updateLicenseType } from '../../api/licenseTypes';
import { buildDiffPayload } from '../../api/diffPayload';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Textarea } from '../../components/ui/Textarea';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { IconPlus, IconTrash } from '../../components/ui/Icons';
import { useFormError } from '../../hooks/useFormError';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import type { LicenseFieldKind } from '../../types/licenseType';

const FIELD_KINDS: LicenseFieldKind[] = ['string', 'int', 'float', 'date', 'datetime', 'time', 'boolean'];

const fieldSchema = z.object({
  name: z.string().min(1, 'Required'),
  kind: z.enum(['string', 'int', 'float', 'date', 'datetime', 'time', 'boolean']),
  required: z.boolean().default(false),
  enum: z.array(z.string()).default([]),
});

const schema = z.object({
  name: z.object({ ARM: z.string().default(''), ENG: z.string().default(''), RUS: z.string().default('') }),
  description: z.string().default(''),
  isBlocked: z.boolean().default(false),
  fields: z.array(fieldSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; editId: string | null; }

export function LicenseTypeModal({ open, onClose, editId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const { data: lt, isLoading } = useQuery({
    queryKey: queryKeys.licenseTypes.byId(editId!),
    queryFn: () => getLicenseType(editId!),
    enabled: !!editId,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: { ARM: '', ENG: '', RUS: '' }, description: '', isBlocked: false, fields: [] },
  });

  const { reset, register, control, watch, handleSubmit, formState: { errors, isSubmitting } } = methods;
  const { fields, append, remove } = useFieldArray({ control, name: 'fields' });

  useEffect(() => {
    if (lt) {
      reset({
        name: lt.name,
        description: lt.description ?? '',
        isBlocked: lt.isBlocked,
        fields: lt.fields ?? [],
      });
    }
  }, [lt, reset]);

  const [mutationError, setMutationError] = React.useState<unknown>(null);
  const { errorMessage } = useFormError(mutationError);
  const confirmField = useConfirmDialog();

  const onSubmit = async (values: FormValues) => {
    setMutationError(null);
    try {
      if (isEdit && lt) {
        const diff = buildDiffPayload(
          { name: lt.name, description: lt.description ?? '', isBlocked: lt.isBlocked, fields: lt.fields },
          { name: values.name, description: values.description ?? '', isBlocked: values.isBlocked, fields: values.fields },
          {},
        );
        if (!diff) { onClose(); return; }
        await updateLicenseType(lt.id, { ...diff, id: lt.id, hash: lt.hash });
      } else {
        await createLicenseType({
          name: values.name,
          description: values.description ?? '',
          isBlocked: values.isBlocked,
          fields: values.fields,
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.licenseTypes.all, exact: true });
      if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.licenseTypes.byId(editId), exact: true });
      onClose();
    } catch (err) {
      setMutationError(err);
    }
  };

  const kindOptions = FIELD_KINDS.map((k) => ({ value: k, label: t(`LicenseTypes.fields.kind.${k}`) }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('licenseTypes.editTitle') : t('licenseTypes.createTitle')}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
          <Button type="submit" form="lt-form" loading={isSubmitting}>{t('common.save')}</Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <FormProvider {...methods}>
          <form id="lt-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TranslationEditor prefix="name" label={t('common.name')} required />
            <Textarea label={t('common.description')} {...register('description')} />
            <Checkbox label={t('common.blocked')} {...register('isBlocked')} />

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">{t('licenseTypes.fields')}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={<IconPlus />}
                  onClick={() => append({ name: '', kind: 'string', required: false, enum: [] })}
                >
                  {t('licenseTypes.addField')}
                </Button>
              </div>

              {fields.map((field, index) => {
                const watchedKind = watch(`fields.${index}.kind`);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fieldErrors = (errors.fields as any)?.[index];
                return (
                  <div key={field.id} className="relative rounded-md border p-4">
                    <button
                      type="button"
                      onClick={() =>
                        confirmField.requestConfirm(async () => remove(index))
                      }
                      className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label={t('licenseTypes.fieldName')}
                        required
                        {...register(`fields.${index}.name`)}
                        error={fieldErrors?.name?.message}
                      />
                      <Controller
                        name={`fields.${index}.kind`}
                        control={control}
                        render={({ field: f }) => (
                          <Select
                            label={t('licenseTypes.fieldKind')}
                            options={kindOptions}
                            value={f.value}
                            onChange={f.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className="mt-3">
                      <Checkbox
                        label={t('licenseTypes.fieldRequired')}
                        {...register(`fields.${index}.required`)}
                      />
                    </div>

                    {watchedKind === 'string' && (
                      <EnumEditor control={control as unknown} index={index} />
                    )}
                  </div>
                );
              })}
            </div>

            {errorMessage && <ErrorBanner message={errorMessage} />}
          </form>
        </FormProvider>
      )}
      <ConfirmDialog
        open={confirmField.isOpen}
        title={t('common.deleteTitle')}
        message={t('common.confirmDelete')}
        onConfirm={confirmField.confirm}
        onCancel={confirmField.close}
      />
    </Modal>
  );
}

function EnumEditor({ control, index }: { control: unknown; index: number }) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control: control as never, name: `fields.${index}.enum` as never });

  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-xs font-medium text-gray-600">{t('licenseTypes.fieldEnum')}</p>
      {(fields as { id: string }[]).map((f, i) => (
        <div key={f.id} className="flex gap-2 items-center">
          <Controller
            control={control as never}
            name={`fields.${index}.enum.${i}` as never}
            render={({ field }) => (
              <input
                {...field}
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            )}
          />
          <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500">
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        leftIcon={<IconPlus />}
        onClick={() => append('' as never)}
      >
        {t('licenseTypes.addEnumValue')}
      </Button>
    </div>
  );
}
