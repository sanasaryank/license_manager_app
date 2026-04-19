import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from '@tanstack/react-query';
import { handleGlobalError } from '../api/errorHandler';
import { normalizeError, SessionExpiredError } from '../api/errorNormalizer';

function shouldHandle(error: unknown): boolean {
  return !(error instanceof SessionExpiredError);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent) return;
      if (shouldHandle(error)) {
        handleGlobalError(normalizeError(error));
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (shouldHandle(error)) {
        handleGlobalError(normalizeError(error));
      }
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
