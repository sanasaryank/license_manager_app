import React from 'react';
import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = 'Unexpected Error';
  let message = 'Something went wrong. Please try again.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    message = typeof error.data === 'string' ? error.data : message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-8 text-center">
      <div className="max-w-md">
        <p className="text-5xl font-bold text-red-400">✕</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-800">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">{message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Go back
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}
