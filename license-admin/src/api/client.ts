import { API_BASE } from '../constants/endpoints';
import { ROUTES } from '../constants/routes';
import { HttpError, SessionExpiredError } from './errorNormalizer';
import { handleSessionExpired } from './errorHandler';

const HTTP_STATUS_DESCRIPTIONS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

async function handleResponse<T>(res: Response, skipRedirect = false): Promise<T> {
  if (res.status === 401) {
    if (!skipRedirect) {
      handleSessionExpired();
      throw new SessionExpiredError();
    }
    // Bootstrap /me — propagate 401 so caller can handle silently
    throw new HttpError(401, 'Unauthorized');
  }

  if (!res.ok) {
    const fallback =
      res.statusText ||
      HTTP_STATUS_DESCRIPTIONS[res.status] ||
      `HTTP ${res.status}`;
    let message = fallback;
    try {
      const body = await res.json();
      if (typeof body?.message === 'string' && body.message) {
        message = body.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new HttpError(res.status, message);
  }

  // 204 or empty body
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const originHeaders: HeadersInit = isLocalhost
  ? { 'X-Origin': new URL(API_BASE).hostname }
  : {};

const defaultHeaders: HeadersInit = {
  'Content-Type': 'application/json',
  ...originHeaders,
};

export async function get<T>(path: string, skipRedirect = false): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: defaultHeaders,
  });
  return handleResponse<T>(res, skipRedirect);
}

export async function postWithHeaders<T>(
  path: string,
  headers: Record<string, string>,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { ...originHeaders, ...headers },
  });
  return handleResponse<T>(res);
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: defaultHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(res);
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    credentials: 'include',
    headers: defaultHeaders,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(res);
}

export async function del(path: string): Promise<void> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: defaultHeaders,
  });
  return handleResponse<void>(res);
}
