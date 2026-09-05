import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { setUnauthorizedHandler } from "@/services/api-client";
import { getCurrentUser } from "@/services/auth-api";
import { getAccessToken, removeAccessToken } from "@/services/auth-storage";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    async function loadAuthState() {
      const token = await getAccessToken();

      if (token === null) {
        setIsLoading(false);
        return;
      }

      try {
        await refreshUser();
        setIsAuthenticated(true);
      } catch {
        await removeAccessToken();
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuthState();
  }, []);

  const signIn = async () => {
    await refreshUser();
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await removeAccessToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    setUnauthorizedHandler(signOut);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, signIn, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
