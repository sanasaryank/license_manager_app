import type { AppError } from '../types/common';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

/** Thrown when a 401 is detected and already handled (session expired). */
export class SessionExpiredError extends Error {
  constructor() {
    super('session-expired');
    this.name = 'SessionExpiredError';
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof SessionExpiredError) {
    return { status: 401, title: 'sessionExpiredTitle', message: 'sessionExpiredMessage' };
  }
  if (error instanceof HttpError) {
    return mapHttpError(error.status, error.message);
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return { title: 'networkErrorTitle', message: 'networkErrorMessage' };
  }
  if (error instanceof Error) {
    return { title: 'errorTitle', message: error.message };
  }
  return { title: 'errorTitle', message: 'unknownError' };
}

function mapHttpError(status: number, rawMessage: string): AppError {
  switch (status) {
    case 400:
    case 422:
      return { status, title: 'validationErrorTitle', message: rawMessage || 'validationError' };
    case 403:
      return { status, title: 'forbiddenTitle', message: 'forbiddenMessage' };
    case 404:
      return { status, title: 'notFoundTitle', message: 'notFoundMessage' };
    case 409:
      return { status, title: 'conflictTitle', message: rawMessage || 'conflictMessage' };
    default:
      if (status >= 500) {
        return { status, title: 'serverErrorTitle', message: 'serverErrorMessage' };
      }
      return { status, title: 'errorTitle', message: rawMessage || 'unknownError' };
  }
}
