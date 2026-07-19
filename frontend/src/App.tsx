import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
};

/**
 * Temporary connectivity check.
 *
 * Why this exists: before building any real CRM UI, we want proof
 * that the frontend can actually reach the FastAPI backend through
 * Vite's dev proxy. If this shows "connected," every future fetch()
 * call to /api/v1/... will work the same way. This component gets
 * replaced once we build real auth/contact pages in later steps.
 */
function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/health")
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data: HealthResponse) => setHealth(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">SupportIQ CRM</h1>
        <p className="text-slate-500 mb-6">Frontend ↔ Backend connectivity check</p>

        {health && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-green-700 font-medium">✅ Connected</p>
            <p className="text-sm text-green-600 mt-1">
              {health.service} — status: {health.status}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-700 font-medium">❌ Connection failed</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <p className="text-xs text-red-500 mt-2">
              Is the FastAPI backend running on port 8000?
            </p>
          </div>
        )}

        {!health && !error && <p className="text-slate-400">Checking connection...</p>}
      </div>
    </div>
  );
}

export default App;
