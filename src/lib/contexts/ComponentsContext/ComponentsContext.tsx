"use client";

import { createContext, type PropsWithChildren, type ReactNode, useContext } from "react";

type LinkProps = {
  href: string;
  className?: string;
  title?: string;
  children: ReactNode;
};

type LinkComponent = React.ComponentType<LinkProps>;

type Components = {
  Link: LinkComponent;
};

const DefaultLink = ({ href, children, ...props }: LinkProps) => (
  <a href={href} {...props}>
    {children}
  </a>
);

const defaultComponents: Components = { Link: DefaultLink };

const ComponentsContext = createContext<Components>(defaultComponents);

export type ComponentsProviderProps = PropsWithChildren<{
  components: Partial<Components>;
}>;

export const ComponentsProvider = ({ components, children }: ComponentsProviderProps) => (
  <ComponentsContext.Provider value={{ ...defaultComponents, ...components }}>{children}</ComponentsContext.Provider>
);

export const useComponents = () => useContext(ComponentsContext);
