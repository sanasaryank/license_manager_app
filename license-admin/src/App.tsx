import React from 'react';
import { QueryProvider } from './providers/QueryProvider';
import { AuthProvider } from './providers/AuthProvider';
import { ErrorModalProvider } from './providers/ErrorModalProvider';
import { GlobalErrorModal } from './components/GlobalErrorModal';
import { AppRouter } from './routes';
import './i18n';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <ErrorModalProvider>
          <GlobalErrorModal />
          <AppRouter />
        </ErrorModalProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
