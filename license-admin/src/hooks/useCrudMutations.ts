import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseCrudMutationsOptions<TFormValues> {
  createFn: (values: TFormValues) => Promise<unknown>;
  updateFn: (values: TFormValues) => Promise<unknown>;
  invalidateKeys: readonly (readonly unknown[])[];
  onClose: () => void;
}

export function useCrudMutations<TFormValues>(
  options: UseCrudMutationsOptions<TFormValues>,
  isEdit: boolean,
) {
  const { createFn, updateFn, invalidateKeys, onClose } = options;
  const queryClient = useQueryClient();

  const onSuccess = () => {
    for (const key of invalidateKeys) {
      queryClient.invalidateQueries({ queryKey: key, exact: true });
    }
    onClose();
  };

  const createMutation = useMutation({ mutationFn: createFn, onSuccess, meta: { suppressGlobalError: true } });
  const updateMutation = useMutation({ mutationFn: updateFn, onSuccess, meta: { suppressGlobalError: true } });

  const submit = (values: TFormValues) => {
    // Prevent duplicate requests while one is already in flight.
    if (createMutation.isPending || updateMutation.isPending) return;
    if (isEdit) updateMutation.mutate(values);
    else createMutation.mutate(values);
  };

  return {
    submit,
    isPending: createMutation.isPending || updateMutation.isPending,
    mutationError: createMutation.error || updateMutation.error,
  };
}
