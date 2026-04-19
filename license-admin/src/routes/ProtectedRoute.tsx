import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import { ROUTES } from '../constants/routes';
import { Spinner } from '../components/ui/Spinner';

interface Props {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ children, requireSuperAdmin = false }: Props) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // admin role can only see customers page
  if (user?.role === 'admin' && pathname !== ROUTES.CUSTOMERS) {
    return <Navigate to={ROUTES.CUSTOMERS} replace />;
  }

  // superadmin-only routes
  if (requireSuperAdmin && user?.role !== 'superadmin') {
    return <Navigate to={ROUTES.CUSTOMERS} replace />;
  }

  return <>{children}</>;
}
