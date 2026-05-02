import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { login, getMe } from '../../api/auth';
import { useAuth } from '../../providers/AuthProvider';
import { ROUTES } from '../../constants/routes';
import { LANGUAGES } from '../../constants/languages';
import type { LangCode } from '../../types/common';
import { HttpError } from '../../api/errorNormalizer';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { IconEye, IconEyeOff } from '../../components/ui/Icons';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser, setLang, lang } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      const me = await getMe();
      setUser(me);
      navigate(ROUTES.CUSTOMERS, { replace: true });
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.status === 401
          ? t('auth.loginError')
          : `${err.status}: ${err.message}`,
        );
      } else {
        setError(t('auth.loginError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <img src="/triosoftlogo.svg" alt="Triosoft" className="mx-auto mb-4 h-10 w-auto" />
        <h1 className="mb-6 text-2xl font-bold text-gray-900 text-center">License Admin</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={t('auth.username')}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <div className="relative">
            <Input
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 focus:outline-none"
              tabIndex={-1}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>

          {error && <ErrorBanner message={error} />}

          <Button type="submit" loading={loading} className="w-full mt-1">
            {t('auth.loginButton')}
          </Button>
        </form>

        {/* Language selector */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <span>{t('common.selectLanguage')}:</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as LangCode)}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
