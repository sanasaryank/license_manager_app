import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../queryKeys';
import { getCustomerTag, createCustomerTag, updateCustomerTag } from '../../api/customerTags';
import { buildDiffPayload } from '../../api/diffPayload';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { TagItemsEditor } from '../../components/form/TagItemsEditor';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { Textarea } from '../../components/ui/Textarea';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { useFormError } from '../../hooks/useFormError';

const translationSchema = z.object({
  ARM: z.string().default(''),
  ENG: z.string().default(''),
  RUS: z.string().default(''),
});

const itemSchema = z.object({
  id: z.string().min(1, 'Required'),
  name: translationSchema,
  description: z.string().default(''),
  isBlocked: z.boolean().default(false),
});

const schema = z.object({
  name: translationSchema,
  description: z.string().default(''),
  isBlocked: z.boolean().default(false),
  items: z.array(itemSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; editId: string | null; }

export function CustomerTagModal({ open, onClose, editId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const { data: tag, isLoading } = useQuery({
    queryKey: queryKeys.customerTags.byId(editId!),
    queryFn: () => getCustomerTag(editId!),
    enabled: !!editId,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: { ARM: '', ENG: '', RUS: '' }, description: '', isBlocked: false, items: [] },
  });

  const { reset, register, handleSubmit, formState: { errors, isSubmitting } } = methods;

  useEffect(() => {
    if (tag) {
      reset({
        name: tag.name,
        description: tag.description ?? '',
        isBlocked: tag.isBlocked,
        items: tag.items ?? [],
      });
    }
  }, [tag, reset]);

  const [mutationError, setMutationError] = React.useState<unknown>(null);
  const { errorMessage } = useFormError(mutationError);

  const onSubmit = async (values: FormValues) => {
    setMutationError(null);
    try {
      if (isEdit && tag) {
        const diff = buildDiffPayload(
          { name: tag.name, description: tag.description ?? '', isBlocked: tag.isBlocked, items: tag.items ?? [] },
          { name: values.name, description: values.description ?? '', isBlocked: values.isBlocked, items: values.items },
          {},
        );
        if (!diff) { onClose(); return; }
        await updateCustomerTag(tag.id, { ...diff, id: tag.id, hash: tag.hash });
      } else {
        await createCustomerTag({
          name: values.name,
          description: values.description ?? '',
          isBlocked: values.isBlocked,
          items: values.items.map((item) => ({ ...item, description: item.description ?? '' })),
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.customerTags.all, exact: true });
      if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.customerTags.byId(editId), exact: true });
      onClose();
    } catch (err) {
      setMutationError(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('customerTags.editTitle') : t('customerTags.createTitle')}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
          <Button type="submit" form="tag-form" loading={isSubmitting}>{t('common.save')}</Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <FormProvider {...methods}>
          <form id="tag-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TranslationEditor prefix="name" label={t('common.name')} required />
            <Textarea label={t('common.description')} {...register('description')} />
            <Checkbox label={t('common.blocked')} {...register('isBlocked')} />

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">{t('customerTags.items')}</p>
              <TagItemsEditor />
            </div>

            {errorMessage && <ErrorBanner message={errorMessage} />}
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
