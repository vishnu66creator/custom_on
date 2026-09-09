import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import {
  ShieldAlert,
  CheckCircle2,
  Mail,
  ArrowLeft,
  RotateCw,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || "",
    redirect: (search.redirect as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify Your Email — CustomON" },
      {
        name: "description",
        content: "Enter the 6-digit verification code sent to your email address.",
      },
    ],
  }),
  component: VerifyEmailPage,
});

function maskEmail(emailStr: string): string {
  if (!emailStr || !emailStr.includes("@")) return emailStr;
  const [local, domain] = emailStr.split("@");
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const first = local[0];
  const stars = "*".repeat(Math.max(3, local.length - 2));
  const last = local[local.length - 1];
  return `${first}${stars}${last}@${domain}`;
}

function VerifyEmailPage() {
  const { user, verifyEmailOtp, resendEmailOtp, isLoading } = useAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const email = searchParams.email || "";
  const redirectTarget = searchParams.redirect;

  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already logged in and verified
  useEffect(() => {
    if (!isLoading && user) {
      const dest = redirectTarget || (user.role === "shop-owner" ? "/dashboard" : "/products");
      navigate({ to: dest as any });
    }
  }, [user, isLoading, navigate, redirectTarget]);

  // Focus first input box on load
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle 60s cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = "";
      setOtpDigits(updated);
      return;
    }

    if (cleaned.length > 1) {
      // Multiple characters pasted into single box
      const chars = cleaned.slice(0, 6).split("");
      const updated = [...otpDigits];
      chars.forEach((char, i) => {
        if (index + i < 6) {
          updated[index + i] = char;
        }
      });
      setOtpDigits(updated);

      const nextFocus = Math.min(index + chars.length, 5);
      inputRefs.current[nextFocus]?.focus();

      if (updated.every((d) => d !== "")) {
        submitOtp(updated.join(""));
      }
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned[0];
    setOtpDigits(updated);

    if (index < 5 && cleaned[0]) {
      inputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && cleaned[0] && updated.every((d) => d !== "")) {
      submitOtp(updated.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;

    const chars = pasteData.split("");
    const updated = ["", "", "", "", "", ""];
    chars.forEach((char, i) => {
      if (i < 6) updated[i] = char;
    });
    setOtpDigits(updated);

    const nextIndex = Math.min(chars.length, 5);
    inputRefs.current[nextIndex]?.focus();

    if (chars.length === 6) {
      submitOtp(pasteData);
    }
  };

  const submitOtp = async (otpCode: string) => {
    if (otpCode.length !== 6 || isSubmitting) return;
    if (!email) {
      setError("Email address is missing. Please return to the registration page.");
      return;
    }

    setError("");
    setResendSuccess("");
    setIsSubmitting(true);

    try {
      const res = await verifyEmailOtp(email, otpCode);
      if (!res.success) {
        setError(res.error || "That verification code is incorrect. Please try again.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        const dest = redirectTarget || "/products";
        navigate({ to: dest as any });
      }, 700);
    } catch {
      setError("That verification code is incorrect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    if (!email) {
      setError("Email address is missing. Please return to the registration page.");
      return;
    }

    setError("");
    setResendSuccess("");
    setIsSubmitting(true);

    try {
      const res = await resendEmailOtp(email);
      if (!res.success) {
        setError(res.error || "Unable to resend verification code. Please try again.");
        return;
      }

      setResendCooldown(res.resendInSeconds || 60);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendSuccess("A new verification code has been sent to your email.");
      inputRefs.current[0]?.focus();
    } catch {
      setError("Unable to resend verification code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="flex min-h-[85vh] items-center justify-center bg-zinc-950 px-4 py-16 text-zinc-100">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl transition-all duration-300">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 shadow-inner">
              <Mail className="h-7 w-7" />
            </div>
            <span className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">
              Account Security
            </span>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Verify your email
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400">
              We've sent a 6-digit verification code to
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-orange-400 break-all">
              {maskEmail(email) || "your email address"}
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="space-y-4 py-8 text-center animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wide text-white">
                Email Verified Successfully
              </h2>
              <p className="text-sm text-zinc-400">Welcome to CustomON! Taking you to the catalog...</p>
              <div className="flex items-center justify-center gap-2 text-xs text-orange-400 font-medium pt-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Redirecting...
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Error Banner */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-300 animate-fade-in">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Resend Notice */}
              {resendSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300 animate-fade-in">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {/* 6 Digit OTP Inputs */}
              <div className="space-y-3">
                <label className="block text-center text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Enter 6-Digit Code
                </label>
                <div
                  className="flex justify-center gap-2 sm:gap-2.5"
                  onPaste={handlePaste}
                >
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className={`h-12 w-11 sm:h-14 sm:w-12 rounded-xl border text-center text-xl font-bold tracking-widest outline-none transition-all duration-200 ${
                        digit
                          ? "border-orange-500 bg-orange-500/10 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                          : "border-zinc-700/80 bg-zinc-800/60 text-zinc-100 hover:border-zinc-600 focus:border-orange-500 focus:bg-zinc-800"
                      }`}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>
              </div>

              {/* Resend Section */}
              <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                <span>Didn't receive the code?</span>
                {resendCooldown > 0 ? (
                  <span className="font-mono text-zinc-500">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={isSubmitting}
                    className="flex items-center gap-1 font-bold uppercase text-orange-400 hover:text-orange-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RotateCw className="h-3 w-3" /> Resend Code
                  </button>
                )}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={() => submitOtp(otpDigits.join(""))}
                disabled={isSubmitting || otpDigits.some((d) => !d)}
                className="w-full rounded-2xl bg-orange-500 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying Email...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>

              {/* Change email link */}
              <div className="pt-2 text-center">
                <Link
                  to="/register"
                  search={redirectTarget ? { redirect: redirectTarget } : {}}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Use a different email address
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
