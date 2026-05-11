"use client";

import { createContext, useContext, useMemo, useState } from "react";

type AdminContextValue = {
  query: string;
  setQuery: (query: string) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const value = useMemo(() => ({ query, setQuery }), [query]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdminSearch() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminSearch must be used inside AdminProvider");
  }
  return context;
}
