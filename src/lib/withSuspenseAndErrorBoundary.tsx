import type { ComponentType, ReactNode } from "react";
import { Suspense } from "react";
import { ErrorBoundary, type ErrorFallbackProps } from "./ErrorBoundary";

type Options = {
  fallback: ReactNode;
  errorFallback: ReactNode | ((props: ErrorFallbackProps) => ReactNode);
};

export function withSuspenseAndErrorBoundary<P extends object>(Component: ComponentType<P>, options: Options) {
  const { fallback, errorFallback } = options;

  function WithSuspenseAndErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>
          <Component {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  WithSuspenseAndErrorBoundary.displayName = `withSuspenseAndErrorBoundary(${Component.displayName || Component.name || "Component"})`;

  return WithSuspenseAndErrorBoundary;
}
