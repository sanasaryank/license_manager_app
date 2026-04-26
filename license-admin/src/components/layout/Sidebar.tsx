import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../providers/AuthProvider';
import { logout } from '../../api/auth';
import { queryClient } from '../../providers/QueryProvider';
import { queryKeys } from '../../queryKeys';
import {
  IconHistory,
} from '../ui/Icons';
import { useState } from 'react';

function NavItem({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary-700 text-white'
            : 'text-primary-100 hover:bg-primary-700 hover:text-white',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [dictOpen, setDictOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);

  const isSuperAdmin = user?.role === 'superadmin';

  const handleLogout = async () => {
    try { await logout(); } catch { /* ignore */ }
    setUser(null);
    queryClient.clear();
    queryClient.setQueryData(queryKeys.me, null);
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="flex h-full w-56 flex-shrink-0 flex-col bg-primary-800 text-white">
      {/* Logo / title */}
      <div className="px-4 py-5 border-b border-primary-700">
        <span className="text-lg font-bold tracking-wide">License Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
        <NavItem to={ROUTES.CUSTOMERS} label={t('nav.customers')} />

        {isSuperAdmin && (
          <>
            {/* Dictionaries group */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setDictOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-primary-200 hover:bg-primary-700 hover:text-white"
              >
                <span>{t('nav.dictionaries')}</span>
                <svg
                  className={clsx('h-4 w-4 transition-transform', dictOpen && 'rotate-90')}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {dictOpen && (
                <div className="ml-3 mt-1 flex flex-col gap-1">
                  <NavItem to={ROUTES.DICTIONARIES_EMPLOYEES} label={t('nav.employees')} />
                  <NavItem to={ROUTES.DICTIONARIES_CUSTOMER_TAGS} label={t('nav.customerTags')} />
                  <NavItem to={ROUTES.DICTIONARIES_LICENSE_TYPES} label={t('nav.licenseTypes')} />
                  <NavItem to={ROUTES.DICTIONARIES_LICENSE_VERSIONS} label={t('nav.licenseVersions')} />
                  <NavItem to={ROUTES.DICTIONARIES_VALIDATORS} label={t('nav.validators')} />
                </div>
              )}
            </div>

            {/* History group */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setHistoryOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-primary-200 hover:bg-primary-700 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <IconHistory className="h-4 w-4" />
                  {t('nav.history')}
                </span>
                <svg
                  className={clsx('h-4 w-4 transition-transform', historyOpen && 'rotate-90')}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              {historyOpen && (
                <div className="ml-3 mt-1 flex flex-col gap-1">
                  <NavItem to={ROUTES.HISTORY} label={t('nav.historyActions')} />
                  <NavItem to={ROUTES.HISTORY_LICENSES} label={t('nav.historyLicenses')} />
                </div>
              )}
            </div>

          </>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-primary-700 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary-200 hover:bg-primary-700 hover:text-white"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm11.707 4.293a1 1 0 010 1.414L13.414 10l1.293 1.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M13 10a1 1 0 011-1h5a1 1 0 110 2h-5a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          {t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}
