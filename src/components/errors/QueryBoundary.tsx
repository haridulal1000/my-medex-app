import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from './ErrorBoundary';

export function QueryBoundary({
  children,
  suspenseFallback,
  errorFallback,
}: {
  children: ReactNode;
  suspenseFallback: ReactNode;
  errorFallback: (error: unknown, reset: () => void) => ReactNode;
}) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallback={errorFallback}>
          <Suspense fallback={suspenseFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}