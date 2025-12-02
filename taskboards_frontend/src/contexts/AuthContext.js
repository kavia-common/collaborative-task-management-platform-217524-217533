import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides auth state (user, token) and actions (login, logout).
   * Note: Replace the login logic with real backend integration.
   */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const t = localStorage.getItem("tb_token");
    const u = localStorage.getItem("tb_user");
    if (t) setToken(t);
    if (u) {
      try { setUser(JSON.parse(u)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    // TODO integrate with backend auth
    // For now, simulate successful login
    const fakeToken = "dev-token";
    const fakeUser = { id: "u1", name: "Demo User", email };
    localStorage.setItem("tb_token", fakeToken);
    localStorage.setItem("tb_user", JSON.stringify(fakeUser));
    setToken(fakeToken);
    setUser(fakeUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("tb_token");
    localStorage.removeItem("tb_user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    token, user, loading, login, logout, isAuthenticated: !!token
  }), [token, user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
