import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { attachToken } from "./api";
import {jwtDecode}from "jwt-decode";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem("token");
    return t ? parseJwtSafe(t) : null;
  });

  function parseJwtSafe(t) {
    try { return jwtDecode(t); } catch { return null; }
  }

  function login(token, role, name) {
    localStorage.setItem("token", token);
    setToken(token);
    setUser({ ...parseJwtSafe(token), role, name });
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    attachToken(() => token, logout);
  }, [token]);

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}

export function Protected({ roles, children }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  if (roles?.length && !roles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}
