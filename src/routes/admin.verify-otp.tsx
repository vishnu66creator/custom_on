import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { ShieldAlert, ArrowLeft, ShieldCheck, Loader2, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/verify-otp")({
  head: () => ({
    meta: [
      { title: "Verify Admin OTP — Custom On" },
      {
        name: "description",
        content: "Admin verification code verification page.",
      },
    ],
  }),
  component: AdminVerifyOtpPage,
});

function AdminVerifyOtpPage() {
  const { verifyAdminPasswordResetOtp, resendAdminPasswordResetOtp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(60);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("admin_reset_email");
    if (!savedEmail) {
      navigate({ to: "/admin/forgot-password" });
      return;
    }
    setEmail(savedEmail);

    // Start 60s cooldown timer
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      setError("Please enter the complete 6-digit numeric code.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await verifyAdminPasswordResetOtp(email, cleanOtp);
      if (!res.success || !res.resetToken) {
        setError(res.error || "Invalid or expired verification code.");
        setSubmitting(false);
        return;
      }

      // Store reset token securely in sessionStorage for reset password screen
      sessionStorage.setItem("admin_reset_token", res.resetToken);
      navigate({ to: "/admin/reset-password" });
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError("");
    setResendMessage("");
    setResending(true);

    try {
      const res = await resendAdminPasswordResetOtp(email);
      setResending(false);

      if (!res.success && res.error) {
        setError(res.error);
        return;
      }

      setResendMessage("A new verification code has been sent to your email.");
      setCooldown(res.resendInSeconds || 60);

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setResending(false);
      setError("Unable to resend verification code. Please try again.");
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
            <p className="mt-1.5 text-xs text-white/50 leading-relaxed">
              We sent a 6-digit verification code to <span className="font-semibold text-white/80">{email || "your registered email"}</span>.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 rounded-2xl bg-red-950/70 border border-red-800/50 p-3.5 text-xs font-medium text-red-300">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {resendMessage && (
              <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800/50 p-3.5 text-xs font-medium text-emerald-300 text-center">
                {resendMessage}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="admin-otp"
                className="block text-center text-[11px] font-bold uppercase tracking-wider text-white/70"
              >
                Enter 6-Digit OTP
              </label>
              <input
                id="admin-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                required
                className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold rounded-2xl border border-white/10 bg-zinc-800/80 px-4 py-4 text-brand-orange placeholder-white/20 outline-none transition focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Code...
                </>
              ) : (
                "Verify OTP & Continue"
              )}
            </button>

            <div className="flex items-center justify-between pt-2">
              <Link
                to="/admin/forgot-password"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Link>

              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resending}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:underline disabled:text-white/30 disabled:no-underline cursor-pointer"
              >
                {resending ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    Resend Code
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
