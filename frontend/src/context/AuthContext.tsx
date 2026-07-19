import { createContext, useContext, useState, type ReactNode } from "react";
import { loginUser, registerUser } from "../api/auth";
import { setAuthToken } from "../api/client";

type AuthContextType = {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Wraps the whole app (see main.tsx) so any component can call
 * useAuth() to check login state or trigger login/logout — without
 * prop-drilling a token through every layer of components.
 *
 * Note: token lives only in memory (React state + the module-level
 * variable in api/client.ts). A page refresh clears it, by design —
 * this was chosen over localStorage to avoid exposing the token to
 * any injected/malicious script (XSS) that could read localStorage.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function login(email: string, password: string) {
    const { access_token } = await loginUser(email, password);
    setAuthToken(access_token);
    setIsAuthenticated(true);
  }

  async function register(email: string, password: string, fullName?: string) {
    await registerUser(email, password, fullName);
    // Registering doesn't log you in automatically — call login()
    // right after on the caller's side (see RegisterPage).
  }

  function logout() {
    setAuthToken(null);
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
