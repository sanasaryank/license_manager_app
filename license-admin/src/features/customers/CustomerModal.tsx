import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../queryKeys';
import { getCustomer, createCustomer, updateCustomer, getCustomers } from '../../api/customers';
import { getEmployees } from '../../api/employees';
import { buildDiffPayload } from '../../api/diffPayload';
import { buildTree, getDescendantIds } from '../../utils/customerTree';
import { TranslationEditor } from '../../components/form/TranslationEditor';
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
import type { LicenseVersionListItem } from '../../types/licenseVersion';
import type { CustomerTagListItem } from '../../types/customerTag';
import { LicenseCard } from './LicenseCard';
import { CustomerGroupModal } from './CustomerGroupModal';

const translationSchema = z.object({
  ARM: z.string().default(''),
  ENG: z.string().default(''),
  RUS: z.string().default(''),
});

const licenseSchema = z.object({
  licenseId: z.string().optional().default(''),
  licenseTypeId: z.string().optional().default(''),
  versionId: z.string().optional().default(''),
  OrgName: z.string().optional().default(''),
  MaxConnCount: z.number().optional(),
  hwid: z.string().optional().default(''),
  track: z.boolean().default(false),
  isBlocked: z.boolean().default(false),
  description: z.string().optional().default(''),
  values: z.record(z.unknown()).default({}),
  endDate: z.string().optional().default(''),
});

const schema = z.object({
  id: z.string().min(1, 'Required'),
  name: translationSchema,
  legalName: z.string().optional().default(''),
  TIN: z.string().optional().default(''),
  responsibleId: z.string().optional().default(''),
  isBlocked: z.boolean().default(false),
  description: z.string().optional().default(''),
  tags: z.array(z.string()).default([]),
  licenses: z.array(licenseSchema).default([]),
  parent_id: z.string().optional().default(''),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editId: string | null;
  licenseTypes: LicenseTypeListItem[];
  licenseVersions: LicenseVersionListItem[];
  allTags: CustomerTagListItem[];
}

export function CustomerModal({ open, onClose, editId, licenseTypes, licenseVersions, allTags }: Props) {
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

  // All customers — for parent selection (deduplicated by TanStack Query)
  const { data: allCustomers = [] } = useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: getCustomers,
  });

  // Parent selector local state
  const [groupModalOpen, setGroupModalOpen] = React.useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: '',
      name: { ARM: '', ENG: '', RUS: '' },
      legalName: '',
      TIN: '',
      responsibleId: '',
      isBlocked: false,
      description: '',
      tags: [],
      licenses: [],
      parent_id: '',
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
          licenseId: (l as CustomerLicense & { licenseId?: string }).licenseId ?? '',
          values: (l.values as Record<string, unknown>) ?? {},
        })),
        parent_id: customer.parent_id ?? '',
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
            parent_id: customer.parent_id ?? '',
          },
          {
            name: values.name,
            legalName: values.legalName,
            TIN: values.TIN,
            responsibleId: values.responsibleId,
            isBlocked: values.isBlocked,
            description: values.description,
            tags: values.tags,
            licenses: values.licenses.map(({ licenseId: _lid, ...l }) => l) as unknown[],
            parent_id: values.parent_id ?? '',
          },
          {},
        );
        if (!diff) { onClose(); return; }
        await updateCustomer(customer.id, {
          ...(diff as Record<string, unknown>),
          id: customer.id,
          hash: customer.hash,
          // Ensure parent_id null is sent when cleared
          ...(values.parent_id !== undefined && { parent_id: values.parent_id || null }),
        } as CustomerUpdatePayload);
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
          licenses: values.licenses.map(({ licenseId: _lid, ...l }) => l) as never,
          parent_id: values.parent_id || undefined,
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

  // Build parent options: exclude self and all descendants to prevent cycles
  const parentOptions = React.useMemo(() => {
    const { nodeMap } = buildTree(allCustomers);
    const excludedIds = editId ? getDescendantIds(nodeMap, editId) : new Set<string>();
    if (editId) excludedIds.add(editId);
    return allCustomers
      .filter((c) => (c.type ?? 'customer') === 'group')
      .filter((c) => !excludedIds.has(c.id))
      .map((c) => ({
        value: c.id,
        label: resolveTranslation(c.name, lang),
      }));
  }, [allCustomers, editId, lang]);

  // Flatten tag items for multi-select
  const allTagItems = allTags.flatMap((tag) =>
    (tag.items ?? []).map((item) => ({
      value: `${tag.id}:${item.id}`,
      label: `${resolveTranslation(tag.name, lang)}: ${resolveTranslation(item.name, lang)}`,
    })),
  );

  const isGroup = customer?.type === 'group';

  const tabs = [
    { key: 'general', label: t('common.name') },
    { key: 'tags', label: t('customers.tags') },
    ...(!isGroup ? [{ key: 'licenses', label: t('customers.licenses') }] : []),
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
                      <TranslationEditor prefix="name" label={t('customers.name')} required />
                      {!isGroup && <Input label={t('customers.legalName')} {...register('legalName')} />}
                      {!isGroup && <Input label={t('customers.tin')} {...register('TIN')} />}
                      {!isGroup && (
                        <Select
                          label={t('customers.responsible')}
                          options={responsibleOptions}
                          placeholder={t('common.all')}
                          {...register('responsibleId')}
                        />
                      )}
                      {/* Parent selector */}
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700">
                          {t('customers.parent')}
                        </label>
                        <select
                          className="form-select block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          {...register('parent_id')}
                        >
                          <option value="">{t('customers.noParent')}</option>
                          {parentOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          leftIcon={<IconPlus />}
                          onClick={() => setGroupModalOpen(true)}
                          className="mt-1 self-start"
                        >
                          {t('customers.createGroupTitle')}
                        </Button>
                      </div>
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
                          licenseVersions={licenseVersions}
                        />
                      ))}
                      <Button
                        type="button"
                        variant="secondary"
                        leftIcon={<IconPlus />}
                        onClick={() =>
                          appendLicense({
                            licenseId: '',
                            licenseTypeId: '',
                            versionId: '',
                            OrgName: '',
                            MaxConnCount: undefined,
                            hwid: '',
                            track: false,
                            isBlocked: false,
                            description: '',
                            values: {},
                            endDate: '',
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
      {/* Inline group creation — nested portal modal */}
      {groupModalOpen && (
        <CustomerGroupModal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          onCreated={(id) => {
            methods.setValue('parent_id', id);
            setGroupModalOpen(false);
          }}
          allTags={allTags}
        />
      )}
    </Modal>
  );
}
