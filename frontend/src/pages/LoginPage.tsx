import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import FunnelMark from "../components/FunnelMark";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel: brand + pipeline visual — the signature moment */}
      <div className="hidden lg:flex flex-col justify-between bg-ink-950 px-12 py-10 relative overflow-hidden">
        <div className="flex items-center gap-2 relative z-10">
          <FunnelMark className="w-6 h-6 text-gold-400" />
          <span className="font-display font-bold text-white text-lg tracking-tight">
            SupportIQ
          </span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display font-bold text-4xl text-white leading-tight tracking-tight">
            Every deal starts
            <br />
            as a conversation.
          </h1>
          <p className="text-ink-300 mt-4 max-w-sm">
            Track contacts, move deals through your pipeline, and never lose
            track of a relationship again.
          </p>
        </div>

        {/* Abstract funnel graphic — oversized, faint, decorative echo of the mark above */}
        <FunnelMark className="absolute -bottom-24 -right-24 w-96 h-96 text-white/[0.04] rotate-12" />

        <p className="text-ink-500 text-xs relative z-10">SupportIQ CRM — built for the pipeline.</p>
      </div>

      {/* Right panel: the actual form */}
      <div className="flex items-center justify-center px-4 py-12 bg-white">
        <div className="max-w-sm w-full">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <FunnelMark className="w-6 h-6 text-ink-900" />
            <span className="font-display font-bold text-ink-900 text-lg tracking-tight">
              SupportIQ
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl text-ink-900 mb-1">Welcome back</h2>
          <p className="text-ink-400 text-sm mb-8">Log in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-ink-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-shadow"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-ink-900 text-white rounded-lg py-2.5 font-display font-semibold text-sm hover:bg-ink-800 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className="text-sm text-ink-400 mt-6 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-gold-600 font-medium hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
