import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ShieldAlert, ArrowLeft, Mail, Loader2, KeyRound } from "lucide-react";

export function ForgotPassword() {
  const { requestAdminPasswordResetOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your registered admin email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await requestAdminPasswordResetOtp(cleanEmail);
      if (!res.success && res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      sessionStorage.setItem("admin_reset_email", cleanEmail);
      navigate({ to: "/admin/verify-otp" });
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
              <KeyRound className="h-3 w-3" /> Password Recovery
            </span>
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
            Admin Password Recovery
          </h1>
          <p className="mt-1.5 text-xs text-white/50">
            Enter your registered admin email to receive a secure 6-digit verification code.
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
              Admin Registered Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@customon.in"
                required
                className="w-full rounded-2xl border border-white/10 bg-zinc-800/80 px-4 py-3.5 pl-11 text-sm text-white placeholder-white/20 outline-none transition focus:border-brand-orange"
              />
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
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
                Sending Verification Code...
              </>
            ) : (
              "Send Verification Code"
            )}
          </button>

          <div className="pt-2 text-center">
            <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Admin Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
