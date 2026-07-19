import { useAuth } from "../context/AuthContext";

/**
 * Placeholder home page — just enough to prove the auth flow works.
 * Step 7 replaces this with the real contact list / CRM views.
 */
export default function HomePage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">You're logged in 🎉</h1>
        <p className="text-slate-500 mb-6">
          This is a placeholder home page — the real contact list comes in the next step.
        </p>
        <button
          onClick={logout}
          className="bg-slate-800 text-white rounded px-4 py-2 font-medium hover:bg-slate-700"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
