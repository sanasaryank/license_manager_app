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
  const [lang, setLangState] = useState<LangCode>(() => {
    const stored = localStorage.getItem(LANG_STORAGE_KEY) as LangCode | null;
    return stored ?? DEFAULT_LANG;
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    retry: false,
    staleTime: Infinity,
    meta: { silent: true },
  });

  useEffect(() => {
    if (data) setUser(data);
  }, [data]);

  useEffect(() => {
    if (isError) setUser(null);
  }, [isError]);

  // Register clear session callback (e.g. on 401)
  useEffect(() => {
    registerClearSession(() => setUser(null));
  }, []);

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
    () => ({ user, setUser, isAuthenticated: !!user, isLoading, lang, setLang }),
    [user, isLoading, lang, setLang],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
