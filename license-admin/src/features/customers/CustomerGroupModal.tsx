import React from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../queryKeys';
import { createCustomer } from '../../api/customers';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useFormError } from '../../hooks/useFormError';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import type { CustomerTagListItem } from '../../types/customerTag';

const translationSchema = z.object({
  ARM: z.string().default(''),
  ENG: z.string().default(''),
  RUS: z.string().default(''),
});

const schema = z.object({
  name: translationSchema,
  tags: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called with the new group's id after successful creation. */
  onCreated: (id: string) => void;
  allTags: CustomerTagListItem[];
}

export function CustomerGroupModal({ open, onClose, onCreated, allTags }: Props) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: { ARM: '', ENG: '', RUS: '' }, tags: [] },
  });

  const { reset, control, handleSubmit, formState: { isSubmitting } } = methods;
  const [mutationError, setMutationError] = React.useState<unknown>(null);
  const { errorMessage } = useFormError(mutationError);

  const allTagItems = allTags.flatMap((tag) =>
    (tag.items ?? []).map((item) => ({
      value: `${tag.id}:${item.id}`,
      label: `${resolveTranslation(tag.name, lang)}: ${resolveTranslation(item.name, lang)}`,
    })),
  );

  const onSubmit = async (values: FormValues) => {
    setMutationError(null);
    try {
      const created = await createCustomer({
        name: values.name,
        legalName: '',
        TIN: '',
        responsibleId: '',
        isBlocked: false,
        description: '',
        tags: values.tags,
        licenses: [],
        type: 'group',
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all, exact: true });
      onCreated(created.id);
      reset();
    } catch (err) {
      setMutationError(err);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('customers.createGroupTitle')}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="group-form" loading={isSubmitting}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <FormProvider {...methods}>
        <form id="group-form" onSubmit={handleSubmit(onSubmit)}>
          {errorMessage && <ErrorBanner message={errorMessage} />}
          <div className="flex flex-col gap-4">
            <TranslationEditor prefix="name" label={t('customers.name')} required />
            {allTagItems.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-gray-700">{t('customers.tags')}</p>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {allTagItems.map((item) => (
                        <label
                          key={item.value}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={field.value.includes(item.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, item.value]);
                              } else {
                                field.onChange(field.value.filter((v: string) => v !== item.value));
                              }
                            }}
                          />
                          {item.label}
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
}
