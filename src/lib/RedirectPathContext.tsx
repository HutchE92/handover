'use client';

import { createContext, useContext, ReactNode } from 'react';

const RedirectPathContext = createContext<string | null>(null);

export function RedirectPathProvider({
  path,
  children
}: {
  path: string | null;
  children: ReactNode;
}) {
  return (
    <RedirectPathContext.Provider value={path}>
      {children}
    </RedirectPathContext.Provider>
  );
}

export function useRedirectPath(): string | null {
  return useContext(RedirectPathContext);
}
