import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { AppError } from '../types/common';
import { registerGlobalErrorHandler } from '../api/errorHandler';

interface ErrorModalContextValue {
  errors: AppError[];
  pushError: (error: AppError) => void;
  dismissCurrent: () => void;
}

const ErrorModalContext = createContext<ErrorModalContextValue | null>(null);

export function useErrorModal(): ErrorModalContextValue {
  const ctx = useContext(ErrorModalContext);
  if (!ctx) throw new Error('useErrorModal must be used within ErrorModalProvider');
  return ctx;
}

export function ErrorModalProvider({ children }: { children: React.ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const pushError = useCallback((error: AppError) => {
    setErrors((prev) => [...prev, error]);
  }, []);

  const dismissCurrent = useCallback(() => {
    setErrors((prev) => prev.slice(1));
  }, []);

  // Register with the module-level callback so client.ts can push errors
  React.useEffect(() => {
    registerGlobalErrorHandler(pushError);
  }, [pushError]);

  const value = useMemo(() => ({ errors, pushError, dismissCurrent }), [errors, pushError, dismissCurrent]);

  return (
    <ErrorModalContext.Provider value={value}>
      {children}
    </ErrorModalContext.Provider>
  );
}
