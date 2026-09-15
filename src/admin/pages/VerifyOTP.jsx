import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { ShieldAlert, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

export function VerifyOTP() {
  const { verifyAdminPasswordResetOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_reset_email");
    if (!saved) {
      navigate({ to: "/admin/forgot-password" });
      return;
    }
    setEmail(saved);
  }, [navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the 6-digit numeric OTP.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await verifyAdminPasswordResetOtp(email, cleanOtp);
      if (!res.success && res.error) {
        setError(res.error);
        setSubmitting(false);
        return;
      }
      if (res.resetToken) {
        sessionStorage.setItem("admin_reset_token", res.resetToken);
      }
      navigate({ to: "/admin/reset-password" });
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
              <ShieldCheck className="h-3 w-3" /> Security Code
            </span>
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
            Verify OTP
          </h1>
          <p className="mt-1.5 text-xs text-white/50">
            Enter the 6-digit code sent to <span className="text-white/80 font-semibold">{email}</span>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-red-950/70 border border-red-800/50 p-3.5 text-xs font-medium text-red-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/70 text-center">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              required
              className="w-full text-center tracking-[0.5em] font-mono text-xl py-3.5 rounded-2xl border border-white/10 bg-zinc-800/80 text-white outline-none focus:border-brand-orange"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-brand hover:bg-orange-600 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify Code & Continue"
            )}
          </button>

          <div className="pt-2 text-center">
            <Link to="/admin/forgot-password" className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition">
              <ArrowLeft className="h-3.5 w-3.5" />
              Change Email
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
