import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  getValidator,
  createValidator,
  updateValidator,
} from '../../api/validators';
import { queryKeys } from '../../queryKeys';
import type { ValidatorItem, SchemaNode, MethodRules, HttpMethod } from '../../types/validator';
import { useCrudMutations } from '../../hooks/useCrudMutations';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { useFormError } from '../../hooks/useFormError';
import { Spinner } from '../../components/ui/Spinner';
import { Tabs } from '../../components/ui/Tabs';
import SchemaBuilder from './SchemaBuilder';
import MethodRulesEditor from './MethodRulesEditor';
import { cleanSchema, applyMethodRules } from './schemaUtils';

const formSchema = z.object({
  version:      z.string().min(1),
  endpoint:     z.string().min(1),
  schema:       z.record(z.any()),
  method_rules: z.record(z.object({
    forbid_fields:   z.array(z.string()),
    add_required:    z.array(z.string()),
    remove_required: z.array(z.string()),
  })).optional(),
});

type FormValues = z.infer<typeof formSchema>;
type PreviewMode = 'base' | HttpMethod;

const PREVIEW_OPTIONS: { value: PreviewMode; label: string }[] = [
  { value: 'base',  label: 'Base' },
  { value: 'POST',  label: 'POST' },
  { value: 'PUT',   label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
];

interface ValidatorModalProps {
  editId: string | null;
  copyFromId?: string | null;
  onClose: () => void;
}

export default function ValidatorModal({ editId, copyFromId, onClose }: ValidatorModalProps) {
  const { t } = useTranslation();
  const isEdit = editId !== null && !copyFromId;
  const sourceId = isEdit ? editId : copyFromId;
  const [previewMode, setPreviewMode] = useState<PreviewMode>('base');

  const { data: existing, isLoading: loadingItem } = useQuery({
    queryKey: queryKeys.validators.byId(sourceId ?? ''),
    queryFn: () => getValidator(sourceId!),
    enabled: !!sourceId,
  });

  const { register, handleSubmit, control, reset, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        version:      '',
        endpoint:     '',
        schema:       { kind: 'object', fields: {}, required: [], allowExtra: true } as SchemaNode,
        method_rules: {},
      },
    });

  React.useEffect(() => {
    if (existing) {
      reset({
        version:      existing.version,
        endpoint:     existing.endpoint,
        schema:       JSON.parse(JSON.stringify(existing.schema)),
        method_rules: existing.method_rules
          ? JSON.parse(JSON.stringify(existing.method_rules))
          : {},
      });
    }
  }, [existing, reset]);

  const invalidateKeys = [queryKeys.validators.all];

  // PUT sends the FULL object JSON (not a diff)
  const { submit, isPending, mutationError } = useCrudMutations<FormValues>(
    {
      createFn: (v) => createValidator({
        ...v,
        schema:       v.schema as SchemaNode,
        method_rules: v.method_rules as MethodRules,
      }),
      updateFn: (v) => updateValidator((existing as ValidatorItem).id, {
        version:      v.version,
        endpoint:     v.endpoint,
        schema:       v.schema as SchemaNode,
        method_rules: v.method_rules as MethodRules,
        hash:         (existing as ValidatorItem).hash,
      }),
      invalidateKeys,
      onClose,
    },
    isEdit,
  );

  const onSubmit = (v: FormValues) => submit(v);
  const { errorMessage, onValidationError } = useFormError(mutationError);

  const title = isEdit ? t('validators.editTitle') : t('validators.createTitle');

  const watchedSchema = watch('schema') as SchemaNode;
  const watchedRules  = watch('method_rules') as MethodRules | undefined;

  const previewJson = useMemo(() => {
    if (previewMode === 'base') {
      return JSON.stringify(cleanSchema(watchedSchema), null, 2);
    }
    const method = previewMode as HttpMethod;
    const rules    = watchedRules?.[method];
    const effective = applyMethodRules(watchedSchema, rules);
    return JSON.stringify(cleanSchema(effective), null, 2);
  }, [watchedSchema, watchedRules, previewMode]);

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="validator-form" loading={isPending}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      {(isEdit || copyFromId) && loadingItem ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <form
          id="validator-form"
          onSubmit={handleSubmit(onSubmit, onValidationError)}
          className="space-y-4"
          noValidate
        >
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                label={t('validators.version')}
                error={errors.version?.message}
                required
                {...register('version')}
              />
            </div>
            <div className="flex-1">
              <Input
                label={t('validators.endpoint')}
                error={errors.endpoint?.message}
                required
                {...register('endpoint')}
              />
            </div>
          </div>

          <fieldset className="border border-gray-200 rounded-md p-4">
            <legend className="text-sm font-medium text-gray-700 px-1">
              {t('validators.schema')}
            </legend>
            <Tabs
              defaultTab="builder"
              tabs={[
                { key: 'builder',     label: t('validators.builder') },
                { key: 'methodRules', label: t('validators.methodRules') },
                { key: 'json',        label: t('validators.jsonPreview') },
              ]}
            >
              {(activeTab) => (
                <>
                  {activeTab === 'builder' && (
                    <Controller
                      control={control}
                      name="schema"
                      render={({ field }) => (
                        <SchemaBuilder
                          value={field.value as SchemaNode}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  )}
                  {activeTab === 'methodRules' && (
                    <Controller
                      control={control}
                      name="method_rules"
                      render={({ field: rulesField }) => (
                        <Controller
                          control={control}
                          name="schema"
                          render={({ field: schemaField }) => (
                            <MethodRulesEditor
                              schema={schemaField.value as SchemaNode}
                              methodRules={(rulesField.value ?? {}) as MethodRules}
                              onChange={rulesField.onChange}
                            />
                          )}
                        />
                      )}
                    />
                  )}
                  {activeTab === 'json' && (
                    <div className="space-y-3">
                      <div className="w-48">
                        <Select
                          label={t('validators.previewMode')}
                          options={PREVIEW_OPTIONS}
                          value={previewMode}
                          onChange={(e) => setPreviewMode(e.target.value as PreviewMode)}
                        />
                      </div>
                      <pre className="bg-gray-50 border border-gray-200 rounded-md p-4 text-xs font-mono overflow-auto max-h-[60vh] whitespace-pre text-gray-800">
                        {previewJson}
                      </pre>
                    </div>
                  )}
                </>
              )}
            </Tabs>
          </fieldset>

          <ErrorBanner message={errorMessage} />
        </form>
      )}
    </Modal>
  );
}
