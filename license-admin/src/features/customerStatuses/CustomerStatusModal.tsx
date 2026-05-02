import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../queryKeys';
import { getCustomerStatus, createCustomerStatus, updateCustomerStatus } from '../../api/customerStatuses';
import { buildDiffPayload } from '../../api/diffPayload';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { useFormError } from '../../hooks/useFormError';

const translationSchema = z.object({
  ARM: z.string().min(1, 'Required'),
  ENG: z.string().min(1, 'Required'),
  RUS: z.string().min(1, 'Required'),
});

const schema = z.object({
  name: translationSchema,
  description: z.string().default(''),
  isBlocked: z.boolean().default(false),
  color: z.string().default('#6366f1'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editId: string | null;
}

export function CustomerStatusModal({ open, onClose, editId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const { data: status, isLoading } = useQuery({
    queryKey: queryKeys.customerStatuses.byId(editId!),
    queryFn: () => getCustomerStatus(editId!),
    enabled: !!editId,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: { ARM: '', ENG: '', RUS: '' },
      description: '',
      isBlocked: false,
      color: '#6366f1',
    },
  });

  const { reset, register, control, handleSubmit, formState: { errors: _errors, isSubmitting } } = methods;

  useEffect(() => {
    if (status) {
      reset({
        name: status.name,
        description: status.description ?? '',
        isBlocked: status.isBlocked,
        color: status.color ?? '#6366f1',
      });
    }
  }, [status, reset]);

  const [mutationError, setMutationError] = React.useState<unknown>(null);
  const { errorMessage } = useFormError(mutationError);

  const onSubmit = async (values: FormValues) => {
    setMutationError(null);
    try {
      if (isEdit && status) {
        const diff = buildDiffPayload(
          { name: status.name, description: status.description ?? '', isBlocked: status.isBlocked, color: status.color ?? '#6366f1' },
          { name: values.name, description: values.description ?? '', isBlocked: values.isBlocked, color: values.color },
          {},
        );
        if (!diff) { onClose(); return; }
        await updateCustomerStatus(status.id, { ...diff, id: status.id, hash: status.hash });
      } else {
        await createCustomerStatus({
          name: values.name,
          description: values.description ?? '',
          isBlocked: values.isBlocked,
          color: values.color,
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.customerStatuses.all, exact: true });
      if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.customerStatuses.byId(editId), exact: true });
      onClose();
    } catch (err) {
      setMutationError(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('customerStatuses.editTitle') : t('customerStatuses.createTitle')}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
          <Button type="submit" form="customer-status-form" loading={isSubmitting}>{t('common.save')}</Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <FormProvider {...methods}>
          <form id="customer-status-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TranslationEditor prefix="name" label={t('common.name')} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{t('customerStatuses.color')}</label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={field.value}
                      onChange={field.onChange}
                      className="h-9 w-16 cursor-pointer rounded-md border border-gray-300 p-1"
                    />
                    <Input
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="#6366f1"
                      className="max-w-[120px] font-mono"
                    />
                  </div>
                )}
              />
            </div>
            <Checkbox label={t('common.blocked')} {...register('isBlocked')} />
            <Textarea label={t('common.description')} {...register('description')} />
            {errorMessage && <ErrorBanner message={errorMessage} />}
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
