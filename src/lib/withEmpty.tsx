import type { ComponentType, ReactNode } from "react";

export function withEmpty<P extends object>(Component: ComponentType<P>, isEmpty: (props: P) => boolean, fallback: ReactNode) {
  function WithEmpty(props: P) {
    if (isEmpty(props)) {
      return <>{fallback}</>;
    }
    return <Component {...props} />;
  }

  WithEmpty.displayName = `withEmpty(${Component.displayName || Component.name || "Component"})`;

  return WithEmpty;
}
