import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../queryKeys';
import { getMe } from '../api/auth';
import { registerClearSession } from '../api/errorHandler';
import type { CurrentUser } from '../types/auth';
import type { LangCode } from '../types/common';
import { DEFAULT_LANG } from '../constants/languages';
import i18n from '../i18n';
import { LANG_TO_I18N } from '../constants/languages';

const LANG_STORAGE_KEY = 'license_admin_lang';

interface AuthContextValue {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  lang: LangCode;
  setLang: (lang: LangCode) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  // initialized stays false until the bootstrap /me query settles (success or error).
  // This prevents ProtectedRoute from checking auth while user state is still syncing
  // from the query result — avoiding a spurious redirect to /login on page refresh.
  const [initialized, setInitialized] = useState(false);
  const [lang, setLangState] = useState<LangCode>(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as LangCode | null;
    return stored ?? DEFAULT_LANG;
  });

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    retry: false,
    staleTime: Infinity,
    meta: { silent: true },
  });

  // Single effect: once the query settles (isLoading→false), sync user and mark initialized.
  // Both setUser and setInitialized are batched into one re-render by React 18.
  useEffect(() => {
    if (!isLoading) {
      setUser(data ?? null);
      setInitialized(true);
    }
  }, [isLoading, data]);

  // Register clear session callback (e.g. on 401 from any request)
  useEffect(() => {
    registerClearSession(() => setUser(null));
  }, []);;

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
    i18n.changeLanguage(LANG_TO_I18N[newLang]);
  }, []);

  // Sync i18n on init
  useEffect(() => {
    i18n.changeLanguage(LANG_TO_I18N[lang]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({ user, setUser, isAuthenticated: !!user, isLoading: !initialized, lang, setLang }),
    [user, initialized, lang, setLang],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
