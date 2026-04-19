import type { AppError } from '../types/common';

type ErrorHandlerCallback = (error: AppError) => void;
type ClearSessionCallback = () => void;

let _errorHandler: ErrorHandlerCallback | null = null;
let _clearSession: ClearSessionCallback | null = null;

export function registerGlobalErrorHandler(cb: ErrorHandlerCallback): void {
  _errorHandler = cb;
}

export function registerClearSession(cb: ClearSessionCallback): void {
  _clearSession = cb;
}

/** Push an error into the global error modal queue. */
export function handleGlobalError(error: AppError): void {
  if (_errorHandler) _errorHandler(error);
}

/** Handle 401: show session-expired modal, clear auth state, redirect to login. */
export function handleSessionExpired(): void {
  const error: AppError = {
    status: 401,
    title: 'sessionExpiredTitle',
    message: 'sessionExpiredMessage',
  };
  if (_errorHandler) _errorHandler(error);
  if (_clearSession) _clearSession();
  setTimeout(() => {
    window.location.href = '/login';
  }, 150);
}
