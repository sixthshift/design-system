import type { ReactNode } from "react";

type EmptyBoundaryProps = {
  isEmpty: boolean;
  fallback: ReactNode;
  children: ReactNode;
};

export const EmptyBoundary = ({ isEmpty, fallback, children }: EmptyBoundaryProps) => {
  if (isEmpty) return <>{fallback}</>;
  return <>{children}</>;
};
