"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

export type ErrorFallbackProps = {
  error: Error;
  reset: () => void;
};

type Props = {
  fallback: ReactNode | ((props: ErrorFallbackProps) => ReactNode);
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  reset = () => {
    this.setState({ error: null });
  };

  override render() {
    const { error } = this.state;
    const { fallback, children } = this.props;

    if (error) {
      if (typeof fallback === "function") {
        return fallback({ error, reset: this.reset });
      }
      return fallback;
    }

    return children;
  }
}
