import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UseBlockToggleOptions {
  blockFn: (payload: { id: string; isBlocked: boolean }) => Promise<unknown>;
  listQueryKey: readonly unknown[];
}

/** Block/unblock: sends { id, isBlocked } via PATCH to the base endpoint. */
export function useBlockToggle(options: UseBlockToggleOptions) {
  const { blockFn, listQueryKey } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      blockFn({ id, isBlocked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listQueryKey, exact: true }),
  });
}
