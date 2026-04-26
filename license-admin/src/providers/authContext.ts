/**
 * Separated from AuthProvider.tsx so that Vite HMR re-evaluations of AuthProvider
 * do not recreate the context object. When AuthProvider.tsx is hot-updated, it
 * re-imports AuthContext from this file — which remains stable — instead of
 * creating a new context. This prevents the "useAuth must be used within
 * AuthProvider" error caused by HMR context-identity mismatch.
 */
import { createContext } from 'react';
import type { CurrentUser } from '../types/auth';
import type { LangCode } from '../types/common';

export interface AuthContextValue {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  lang: LangCode;
  setLang: (lang: LangCode) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
