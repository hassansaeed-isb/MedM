"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { User, UserRole } from "@/types";
import { mockUsers } from "@/data/mock";

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, role: UserRole) => {
    const found = mockUsers.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );
    if (found) setUser(found);
    else {
      // Demo: create a temporary user for any email when role matches
      const firstForRole = mockUsers.find((u) => u.role === role);
      if (firstForRole)
        setUser({
          ...firstForRole,
          email,
          name: email.split("@")[0],
        });
    }
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const switchRole = useCallback((role: UserRole) => {
    const firstForRole = mockUsers.find((u) => u.role === role);
    if (firstForRole) setUser({ ...firstForRole });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
