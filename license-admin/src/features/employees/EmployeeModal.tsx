import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { queryKeys } from '../../queryKeys';
import { getEmployee, createEmployee, updateEmployee } from '../../api/employees';
import { buildDiffPayload } from '../../api/diffPayload';
import { TranslationEditor } from '../../components/form/TranslationEditor';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { Textarea } from '../../components/ui/Textarea';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { useFormError } from '../../hooks/useFormError';
import type { EmployeeCreatePayload } from '../../types/employee';

const translationSchema = z.object({
  ARM: z.string().default(''),
  ENG: z.string().default(''),
  RUS: z.string().default(''),
});

const schema = z.object({
  username: z.string().min(1, 'Required'),
  password: z.string().optional(),
  name: translationSchema,
  role: z.enum(['admin', 'superadmin']),
  isBlocked: z.boolean().default(false),
  description: z.string().default(''),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  editId: string | null;
}

export function EmployeeModal({ open, onClose, editId }: Props) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const { data: employee, isLoading: loadingEmployee } = useQuery({
    queryKey: queryKeys.employees.byId(editId!),
    queryFn: () => getEmployee(editId!),
    enabled: !!editId,
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
      name: { ARM: '', ENG: '', RUS: '' },
      role: 'admin',
      isBlocked: false,
      description: '',
    },
  });

  const { reset, register, handleSubmit, formState: { errors, isSubmitting } } = methods;

  useEffect(() => {
    if (employee) {
      reset({
        username: employee.username,
        password: '',
        name: employee.name,
        role: employee.role,
        isBlocked: employee.isBlocked,
        description: employee.description ?? '',
      });
    }
  }, [employee, reset]);

  const [mutationError, setMutationError] = React.useState<unknown>(null);
  const { errorMessage } = useFormError(mutationError);

  const onSubmit = async (values: FormValues) => {
    setMutationError(null);
    try {
      if (isEdit && employee) {
        const payload: Partial<EmployeeCreatePayload> & { id: string; hash: string } = {
          id: employee.id,
          hash: employee.hash,
        };

        const diff = buildDiffPayload(
          { username: employee.username, name: employee.name, role: employee.role, isBlocked: employee.isBlocked, description: employee.description ?? '' },
          { username: values.username, name: values.name, role: values.role, isBlocked: values.isBlocked, description: values.description ?? '' },
          {},
        );

        if (!diff && !values.password) {
          onClose();
          return;
        }

        Object.assign(payload, diff ?? {});
        if (values.password) payload.password = values.password;

        await updateEmployee(employee.id, payload);
      } else {
        const payload: EmployeeCreatePayload = {
          username: values.username,
          password: values.password ?? '',
          name: values.name,
          role: values.role,
          isBlocked: values.isBlocked,
          description: values.description ?? '',
        };
        await createEmployee(payload);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.employees.all, exact: true });
      if (editId) queryClient.invalidateQueries({ queryKey: queryKeys.employees.byId(editId), exact: true });
      onClose();
    } catch (err) {
      setMutationError(err);
    }
  };

  const roleOptions = [
    { value: 'admin', label: t('Employees.role.admin') },
    { value: 'superadmin', label: t('Employees.role.superadmin') },
  ];

  const title = isEdit ? t('employees.editTitle') : t('employees.createTitle');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="employee-form" loading={isSubmitting}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      {loadingEmployee ? (
        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
      ) : (
        <FormProvider {...methods}>
          <form
            id="employee-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Input
              label={t('employees.username')}
              required
              {...register('username')}
              error={errors.username?.message}
            />
            <Input
              label={t('employees.password')}
              type="password"
              hint={isEdit ? t('employees.passwordHint') : undefined}
              required={!isEdit}
              {...register('password')}
              error={errors.password?.message}
            />
            <TranslationEditor prefix="name" label={t('employees.name')} />
            <Select
              label={t('employees.role')}
              options={roleOptions}
              required
              {...register('role')}
              error={errors.role?.message}
            />
            <Checkbox label={t('employees.isBlocked')} {...register('isBlocked')} />
            <Textarea label={t('common.description')} {...register('description')} />

            {errorMessage && <ErrorBanner message={errorMessage} />}
          </form>
        </FormProvider>
      )}
    </Modal>
  );
}
