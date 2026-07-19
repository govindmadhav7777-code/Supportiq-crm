import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

/**
 * Wraps any page that requires login. If there's no valid token in
 * memory, redirect to /login instead of rendering the protected page
 * — this is the frontend's half of auth; the backend independently
 * rejects unauthenticated API calls too (defense in depth).
 */
export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
