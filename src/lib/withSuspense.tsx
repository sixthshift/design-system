import type { ComponentType, ReactNode } from "react";
import { Suspense } from "react";

export function withSuspense<P extends object>(Component: ComponentType<P>, fallback: ReactNode) {
  function WithSuspense(props: P) {
    return (
      <Suspense fallback={fallback}>
        <Component {...props} />
      </Suspense>
    );
  }

  WithSuspense.displayName = `withSuspense(${Component.displayName || Component.name || "Component"})`;

  return WithSuspense;
}
