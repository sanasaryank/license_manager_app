import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { Spinner } from '../components/ui/Spinner';
import { RouteErrorBoundary } from './RouteErrorBoundary';

const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const CustomersPage = lazy(() => import('../features/customers/CustomersPage'));
const EmployeesPage = lazy(() => import('../features/employees/EmployeesPage'));
const CustomerTagsPage = lazy(() => import('../features/customerTags/CustomerTagsPage'));
const LicenseTypesPage = lazy(() => import('../features/licenseTypes/LicenseTypesPage'));
const LicenseVersionsPage = lazy(() => import('../features/licenseVersions/LicenseVersionsPage'));
const CustomerStatusesPage = lazy(() => import('../features/customerStatuses/CustomerStatusesPage'));
const ValidatorsPage = lazy(() => import('../features/validators/ValidatorsPage'));
const HistoryPage = lazy(() => import('../features/history/actions/ActionsPage'));
const LicenseHistoryPage = lazy(() => import('../features/history/licenses/LicensesPage'));

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense
    fallback={
      <div className="flex flex-1 items-center justify-center p-12">
        <Spinner size="lg" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to={ROUTES.CUSTOMERS} replace /> },
      {
        path: ROUTES.CUSTOMERS,
        element: (
          <SuspenseWrapper>
            <CustomersPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: ROUTES.DICTIONARIES_EMPLOYEES,
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuspenseWrapper>
              <EmployeesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DICTIONARIES_CUSTOMER_TAGS,
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuspenseWrapper>
              <CustomerTagsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DICTIONARIES_LICENSE_TYPES,
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuspenseWrapper>
              <LicenseTypesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DICTIONARIES_LICENSE_VERSIONS,
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuspenseWrapper>
              <LicenseVersionsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DICTIONARIES_CUSTOMER_STATUSES,
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuspenseWrapper>
              <CustomerStatusesPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.DICTIONARIES_VALIDATORS,
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuspenseWrapper>
              <ValidatorsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.HISTORY,
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuspenseWrapper>
              <HistoryPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: ROUTES.HISTORY_LICENSES,
        element: (
          <ProtectedRoute requireSuperAdmin>
            <SuspenseWrapper>
              <LicenseHistoryPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      // Redirect legacy /history → /history/actions
      {
        path: '/history',
        element: <Navigate to={ROUTES.HISTORY} replace />,
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.CUSTOMERS} replace /> },
]);

export function AppRouter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <RouterProvider router={router} future={{ v7_startTransition: true } as any} />;
}
