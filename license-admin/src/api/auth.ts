import { get, post, postWithHeaders } from './client';
import { ENDPOINTS } from '../constants/endpoints';
import type { CurrentUser } from '../types/auth';

export async function login(username: string, password: string): Promise<void> {
  const credentials = btoa(`${username}:${password}`);
  await postWithHeaders<void>(ENDPOINTS.LOGIN, {
    Authorization: `Basic ${credentials}`,
  });
}

export async function logout(): Promise<void> {
  await post<void>(ENDPOINTS.LOGOUT);
}

/** skipRedirect=true — 401 is handled silently by the caller (bootstrap). */
export async function getMe(): Promise<CurrentUser> {
  return get<CurrentUser>(ENDPOINTS.ME, true);
}
