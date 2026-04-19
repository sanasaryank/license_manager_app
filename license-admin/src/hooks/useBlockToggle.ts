import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseBlockToggleOptions {
  updateFn: (id: string, payload: { id: string; isBlocked: boolean }) => Promise<unknown>;
  listQueryKey: readonly unknown[];
}

/** Simple block/unblock: sends only id + isBlocked (no hash fetch per project decision). */
export function useBlockToggle(options: UseBlockToggleOptions) {
  const { updateFn, listQueryKey } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      updateFn(id, { id, isBlocked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listQueryKey, exact: true }),
  });
}
