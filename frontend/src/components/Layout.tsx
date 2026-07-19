import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FunnelMark from "./FunnelMark";

export default function Layout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const location = useLocation();

  const navLinkClass = (path: string) =>
    `px-3 py-1.5 rounded-md text-sm font-medium font-display tracking-wide transition-colors ${
      location.pathname === path
        ? "bg-white/10 text-gold-300"
        : "text-ink-200 hover:text-white hover:bg-white/5"
    }`;

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="bg-ink-950 border-b-2 border-gold-500/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <FunnelMark className="w-6 h-6 text-gold-400" />
              <span className="font-display font-bold text-white text-lg tracking-tight">
                SupportIQ
              </span>
            </div>
            <nav className="flex items-center gap-1">
              <Link to="/" className={navLinkClass("/")}>
                Contacts
              </Link>
              <Link to="/pipeline" className={navLinkClass("/pipeline")}>
                Pipeline
              </Link>
            </nav>
          </div>

          <button
            onClick={logout}
            className="text-sm font-medium text-ink-300 hover:text-gold-300 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
