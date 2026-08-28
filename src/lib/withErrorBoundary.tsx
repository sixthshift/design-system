"use client";

import type { ComponentType, ReactNode } from "react";
import { ErrorBoundary, type ErrorFallbackProps } from "./ErrorBoundary";

export function withErrorBoundary<P extends object>(Component: ComponentType<P>, fallback: ReactNode | ((props: ErrorFallbackProps) => ReactNode)) {
  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;

  return WithErrorBoundary;
}
