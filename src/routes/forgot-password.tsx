import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import { ShieldAlert, ArrowLeft, Loader2, KeyRound } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Forgot Password — CustomON" },
      {
        name: "description",
        content: "Reset your CustomON password via email verification code.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage() {
  const { requestPasswordResetOtp } = useAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  const [email, setEmail] = useState(searchParams.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordResetOtp(normalizedEmail);
      if (!res.success) {
        setError(res.error || "Unable to process password reset. Please try again.");
        return;
      }

      // Navigate to OTP verification page
      navigate({
        to: "/reset-password/verify",
        search: { email: normalizedEmail },
      });
    } catch {
      setError("Unable to process password reset. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="flex min-h-[85vh] items-center justify-center bg-zinc-950 px-4 py-16 text-zinc-100">
        <div className="w-full max-w-[420px] overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl transition-all duration-300">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 shadow-inner">
              <KeyRound className="h-7 w-7" />
            </div>
            <span className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">
              Password Recovery
            </span>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Forgot password?
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Enter the email address you registered with your CustomON account to receive a verification code.
            </p>
          </div>

          <div className="space-y-5">
            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-300 animate-fade-in">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="resetEmail"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                >
                  Email address
                </label>
                <input
                  id="resetEmail"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full rounded-2xl bg-orange-500 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>

            {/* Back to Sign In Link */}
            <div className="border-t border-zinc-800/80 pt-5 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
