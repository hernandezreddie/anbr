"use client";

import { createContext, useContext } from "react";

const PainelPrimaryContext = createContext<string>("#059669");

export function PainelPrimaryProvider({
  primary,
  children,
}: {
  primary: string;
  children: React.ReactNode;
}) {
  return (
    <PainelPrimaryContext.Provider value={primary}>
      {children}
    </PainelPrimaryContext.Provider>
  );
}

export function usePainelPrimary() {
  return useContext(PainelPrimaryContext);
}
