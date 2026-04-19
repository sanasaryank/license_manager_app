import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../queryKeys';
import { getCustomer, createCustomer, updateCustomer } from '../../api/customers';
import { getEmployees } from '../../api/employees';
import { buildDiffPayload } from '../../api/diffPayload';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Textarea } from '../../components/ui/Textarea';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs } from '../../components/ui/Tabs';
import { IconPlus } from '../../components/ui/Icons';
import { useFormError } from '../../hooks/useFormError';
import { useAuth } from '../../providers/AuthProvider';
import { resolveTranslation } from '../../utils/translation';
import type { CustomerUpdatePayload, CustomerLicense } from '../../types/customer';
import type { LicenseTypeListItem } from '../../types/licenseType';
import type { CustomerTagListItem } from '../../types/customerTag';
import { LicenseCard } from './LicenseCard';

const licenseSchema = z.object({
  licenseTypeId: z.string().optional().default(''),
  OrgName: z.string().optional().default(''),
  MaxConnCount: z.number().optional(),
  hwid: z.string().optional().default(''),
  track: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
  description: z.string().optional().default(''),
  values: z.record(z.unknown()).default({}),
});

const schema = z.object({
  id: z.string().min(1, 'Required'),
  name: z.string().min(1, 'Required'),
  legalName: z.string().optional().default(''),
  TIN: z.string().optional().default(''),
  responsibleId: z.string().optional().default(''),
  isBlocked: z.boolean().default(false),
  description: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
  licenses: z.array(licenseSchema).default([]),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editId: string | null;
  licenseTypes: LicenseTypeListItem[];
  allTags: CustomerTagListItem[];
}

export function CustomerModal({ open, onClose, editId, licenseTypes, allTags }: Props) {
  const { t } = useTranslation();
  const { lang } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const { data: customer, isLoading } = useQuery({
    queryKey: queryKeys.customers.byId(editId!),
    queryFn: () => getCustomer(editId!),
    enabled: !!editId,
  });

  const { data: employees = [] } = useQuery({
    queryKey: queryKeys.employees.all,
    queryFn: getEmployees,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: '',
      name: '',
      legalName: '',
      TIN: '',
      responsibleId: '',
      isBlocked: false,
      description: '',
      tags: [],
      licenses: [],
    },
  });

  const { reset, register, control, handleSubmit, formState: { errors, isSubmitting } } = methods;
  const { fields: licenseFields, append: appendLicense, remove: removeLicense } = useFieldArray({ control, name: 'licenses' });

  useEffect(() => {
    if (customer) {
      reset({
        id: customer.id,
        name: customer.name,
        legalName: customer.legalName ?? '',
        TIN: customer.TIN ?? '',
        responsibleId: customer.responsibleId ?? '',
        isBlocked: customer.isBlocked,
        description: customer.description ?? '',
        tags: customer.tags ?? [],
        licenses: (customer.licenses ?? []).map((l) => ({
          ...l,
          values: (l.values as Record<string, unknown>) ?? {},
        })),
      });
    }
  }, [customer, reset]);

  const [mutationError, setMutationError] = React.useState<unknown>(null);
  const { errorMessage } = useFormError(mutationError);

  const onSubmit = async (values: FormValues) => {
    setMutationError(null);
    try {
      if (isEdit && customer) {
        const diff = buildDiffPayload(
          {
            name: customer.name,
            legalName: customer.legalName ?? '',
            TIN: customer.TIN ?? '',
            responsibleId: customer.responsibleId ?? '',
            isBlocked: customer.isBlocked,
            description: customer.description ?? '',
            tags: customer.tags ?? [],
            licenses: customer.licenses ?? [],
          },
          {
            name: values.name,
            legalName: values.legalName,
            TIN: values.TIN,
            responsibleId: values.responsibleId,
            isBlocked: values.isBlocked,
            description: values.description,
            tags: values.tags,
            licenses: values.licenses as unknown[],
          },
          {},
        );
        if (!diff) { onClose(); return; }
        await updateCustomer(customer.id, { ...(diff as Record<string, unknown>), id: customer.id, hash: customer.hash } as CustomerUpdatePayload);
      } else {
        await createCustomer({
          id: values.id,
          name: values.name,
          legalName: values.legalName,
          TIN: values.TIN,
          responsibleId: values.responsibleId,
          isBlocked: values.isBlocked,
          description: values.description,
          tags: values.tags,
          licenses: values.licenses as never,
        });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all, exact: true });
      if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.customers.byId(editId), exact: true });
      onClose();
    } catch (err) {
      setMutationError(err);
    }
  };

  const responsibleOptions = employees.map((e) => ({
    value: e.id,
    label: resolveTranslation(e.name, lang),
  }));

  // Flatten tag items for multi-select
  const allTagItems = allTags.flatMap((tag) =>
    (tag.items ?? []).map((item) => ({
      value: `${tag.id}:${item.id}`,
      label: `${resolveTranslation(tag.name, lang)}: ${resolveTranslation(item.name, lang)}`,
    })),
  );

  const tabs = [
    { key: 'general', label: t('common.name') },
    { key: 'tags', label: t('customers.tags') },
    { key: 'licenses', label: t('customers.licenses') },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? t('customers.editTitle') : t('customers.createTitle')}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>{t('common.cancel')}</Button>
          <Button type="submit" form="customer-form" loading={isSubmitting}>{t('common.save')}</Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <FormProvider {...methods}>
          <form id="customer-form" onSubmit={handleSubmit(onSubmit)}>
            <Tabs tabs={tabs}>
              {(active) => (
                <>
                  {active === 'general' && (
                    <div className="flex flex-col gap-4">
                      <Input
                        label={t('customers.id')}
                        required
                        disabled={isEdit}
                        {...register('id')}
                        error={errors.id?.message}
                      />
                      <Input
                        label={t('customers.name')}
                        required
                        {...register('name')}
                        error={errors.name?.message}
                      />
                      <Input label={t('customers.legalName')} {...register('legalName')} />
                      <Input label={t('customers.tin')} {...register('TIN')} />
                      <Select
                        label={t('customers.responsible')}
                        options={responsibleOptions}
                        placeholder={t('common.all')}
                        {...register('responsibleId')}
                      />
                      <Checkbox label={t('common.blocked')} {...register('isBlocked')} />
                      <Textarea label={t('common.description')} {...register('description')} />
                    </div>
                  )}

                  {active === 'tags' && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-gray-500">{t('customers.tags')}</p>
                      <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                            {allTagItems.map((item) => (
                              <label key={item.value} className="flex items-center gap-2 text-sm cursor-pointer">
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

                  {active === 'licenses' && (
                    <div className="flex flex-col gap-4">
                      {licenseFields.map((f, i) => (
                        <LicenseCard
                          key={f.id}
                          index={i}
                          onRemove={() => removeLicense(i)}
                          licenseTypes={licenseTypes}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="secondary"
                        leftIcon={<IconPlus />}
                        onClick={() =>
                          appendLicense({
                            licenseTypeId: '',
                            OrgName: '',
                            MaxConnCount: undefined,
                            hwid: '',
                            track: false,
                            isBlocked: false,
                            description: '',
                            values: {},
                          })
                        }
                      >
                        {t('customers.addLicense')}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Tabs>
            {errorMessage && <ErrorBanner message={errorMessage} />}
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
