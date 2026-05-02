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
  IconDocumentText,
  IconUsers,
  IconUser,
  IconTag,
  IconClipboard,
  IconLayers,
  IconShield,
  IconFolder,
  IconChevronLeft,
  IconChevronRight,
  LogoMark,
} from '../ui/Icons';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavItem({
  to,
  label,
  icon,
  collapsed,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  collapsed?: boolean;
}) {
  return (
    <NavLink
      to={to}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        clsx(
          'flex items-center rounded-md py-2 text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-2' : 'gap-2 px-3',
          isActive
            ? 'bg-primary-700 text-white'
            : 'text-primary-100 hover:bg-primary-700 hover:text-white',
        )
      }
    >
      <span className="h-4 w-4 flex-shrink-0">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={clsx('h-4 w-4 flex-shrink-0 transition-transform', open && 'rotate-90')}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
  </svg>
);

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
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
    <aside className={clsx(
      'flex h-full flex-shrink-0 flex-col bg-primary-800 text-white transition-all duration-200',
      collapsed ? 'w-14' : 'w-56',
    )}>
      {/* Logo / title + toggle */}
      <div className={clsx(
        'flex items-center border-b border-primary-700',
        collapsed ? 'flex-col gap-2 px-2 py-3' : 'justify-between px-4 py-4',
      )}>
        <div className="flex min-w-0 items-center gap-2">
          <LogoMark className="h-7 w-7 flex-shrink-0" />
          {!collapsed && (
            <span className="truncate text-base font-bold tracking-wide">License Admin</span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
          className="flex-shrink-0 rounded p-1 text-primary-300 hover:bg-primary-700 hover:text-white"
        >
          {collapsed
            ? <IconChevronRight className="h-4 w-4" />
            : <IconChevronLeft className="h-4 w-4" />
          }
        </button>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        <NavItem to={ROUTES.CUSTOMERS} label={t('nav.customers')} icon={<IconUsers />} collapsed={collapsed} />

        {isSuperAdmin && (
          <>
            {/* Dictionaries group */}
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setDictOpen((o) => !o)}
                disabled={collapsed}
                title={collapsed ? t('nav.dictionaries') : undefined}
                className={clsx(
                  'flex w-full items-center rounded-md py-2 text-sm font-medium',
                  collapsed
                    ? 'cursor-default justify-center px-2 text-primary-500'
                    : 'justify-between px-3 text-primary-200 hover:bg-primary-700 hover:text-white',
                )}
              >
                {collapsed ? (
                  <span className="h-4 w-4 flex-shrink-0"><IconFolder /></span>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 flex-shrink-0"><IconFolder /></span>
                      {t('nav.dictionaries')}
                    </span>
                    <ChevronIcon open={dictOpen} />
                  </>
                )}
              </button>
              {(dictOpen || collapsed) && (
                <div className={clsx('mt-1 flex flex-col gap-1', !collapsed && 'ml-3')}>
                  <NavItem to={ROUTES.DICTIONARIES_EMPLOYEES} label={t('nav.employees')} icon={<IconUser />} collapsed={collapsed} />
                  <NavItem to={ROUTES.DICTIONARIES_CUSTOMER_TAGS} label={t('nav.customerTags')} icon={<IconTag />} collapsed={collapsed} />
                  <NavItem to={ROUTES.DICTIONARIES_LICENSE_TYPES} label={t('nav.licenseTypes')} icon={<IconClipboard />} collapsed={collapsed} />
                  <NavItem to={ROUTES.DICTIONARIES_LICENSE_VERSIONS} label={t('nav.licenseVersions')} icon={<IconLayers />} collapsed={collapsed} />
                  <NavItem to={ROUTES.DICTIONARIES_CUSTOMER_STATUSES} label={t('nav.customerStatuses')} icon={<IconDocumentText />} collapsed={collapsed} />
                  <NavItem to={ROUTES.DICTIONARIES_VALIDATORS} label={t('nav.validators')} icon={<IconShield />} collapsed={collapsed} />
                </div>
              )}
            </div>

            {/* History group */}
            <div className="mt-1">
              <button
                type="button"
                onClick={() => setHistoryOpen((o) => !o)}
                disabled={collapsed}
                title={collapsed ? t('nav.history') : undefined}
                className={clsx(
                  'flex w-full items-center rounded-md py-2 text-sm font-medium',
                  collapsed
                    ? 'cursor-default justify-center px-2 text-primary-500'
                    : 'justify-between px-3 text-primary-200 hover:bg-primary-700 hover:text-white',
                )}
              >
                {collapsed ? (
                  <span className="h-4 w-4 flex-shrink-0"><IconHistory /></span>
                ) : (
                  <>
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 flex-shrink-0"><IconHistory /></span>
                      {t('nav.history')}
                    </span>
                    <ChevronIcon open={historyOpen} />
                  </>
                )}
              </button>
              {(historyOpen || collapsed) && (
                <div className={clsx('mt-1 flex flex-col gap-1', !collapsed && 'ml-3')}>
                  <NavItem to={ROUTES.HISTORY} label={t('nav.historyActions')} icon={<IconHistory />} collapsed={collapsed} />
                  <NavItem to={ROUTES.HISTORY_LICENSES} label={t('nav.historyLicenses')} icon={<IconDocumentText />} collapsed={collapsed} />
                </div>
              )}
            </div>
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="border-t border-primary-700 p-2">
        <button
          onClick={handleLogout}
          title={collapsed ? t('nav.logout') : undefined}
          className={clsx(
            'flex w-full items-center rounded-md py-2 text-sm font-medium text-primary-200 hover:bg-primary-700 hover:text-white',
            collapsed ? 'justify-center px-2' : 'gap-2 px-3',
          )}
        >
          <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h7a1 1 0 100-2H4V5h6a1 1 0 100-2H3zm11.707 4.293a1 1 0 010 1.414L13.414 10l1.293 1.293a1 1 0 01-1.414 1.414l-2-2a1 1 0 010-1.414l2-2a1 1 0 011.414 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M13 10a1 1 0 011-1h5a1 1 0 110 2h-5a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          {!collapsed && t('nav.logout')}
        </button>
      </div>
    </aside>
  );
}

