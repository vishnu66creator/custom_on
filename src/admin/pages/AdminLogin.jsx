import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ShieldAlert, Eye, EyeOff, Lock, ArrowRight, Loader2 } from "lucide-react";

export function AdminLogin() {
  const { loginAdminWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your admin email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginAdminWithEmail(cleanEmail, password);
      if (!res.success) {
        setError(res.error || "Invalid email or password.");
        setSubmitting(false);
        return;
      }
      navigate({ to: "/admin/dashboard" });
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0b0b0d] px-4 py-12 text-white">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight hover:opacity-80 transition mb-4">
            <img src="/logo.png" alt="Custom On Logo" className="h-10 w-10 shrink-0 object-contain drop-shadow-xs" />
            <span>CUSTOM<span className="text-brand-orange">ON</span></span>
          </Link>
          <div className="mt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-orange border border-brand-orange/20">
              <Lock className="h-3 w-3" /> Admin Portal
            </span>
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
            Administrator Sign In
          </h1>
          <p className="mt-1.5 text-xs text-white/50">
            Sign in with your administrator credentials to access store controls.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-red-950/70 border border-red-800/50 p-3.5 text-xs font-medium text-red-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70">
              Admin Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@customon.in"
              required
              className="w-full rounded-2xl border border-white/10 bg-zinc-800/80 px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-brand-orange"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70">
                Password
              </label>
              <Link to="/admin/forgot-password" className="text-[11px] font-semibold text-brand-orange hover:underline transition">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/80 px-4 py-3.5 pr-11 text-sm text-white placeholder-white/20 outline-none transition focus:border-brand-orange"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In to Admin Portal
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
