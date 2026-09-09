import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import {
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  Lock,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/reset-password/")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || "",
    token: (search.token as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Reset Password — CustomON" },
      {
        name: "description",
        content: "Create a new password for your CustomON account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { resetPasswordWithToken } = useAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const email = searchParams.email || "";
  const resetToken = searchParams.token || "";

  // Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Password requirements calculation
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[A-Za-z]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9\s]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasLetter && hasSymbol;
  const doPasswordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !resetToken) {
      setError("Your password reset session has expired. Please start again.");
      return;
    }

    if (!isPasswordValid) {
      setError(
        "Password must be at least 6 characters and include a letter and a special character.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPasswordWithToken(email, resetToken, newPassword, confirmPassword);
      if (!res.success) {
        setError(res.error || "Unable to reset password. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Unable to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="flex min-h-[85vh] items-center justify-center bg-zinc-950 px-4 py-16 text-zinc-100">
        <div className="w-full max-w-[420px] overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl transition-all duration-300">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3.5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 shadow-inner">
              <Lock className="h-7 w-7" />
            </div>
            <span className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">
              Security
            </span>
            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              Create new password
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-400">
              Choose a strong password for your CustomON account
            </p>
          </div>

          {/* Missing Token Alert */}
          {!resetToken && !success && (
            <div className="space-y-4 text-center py-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-medium text-red-300 space-y-2">
                <ShieldAlert className="h-5 w-5 text-red-400 mx-auto" />
                <p>Your password reset session has expired or is invalid.</p>
              </div>
              <Link
                to="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-orange-600 transition-colors"
              >
                Start Password Reset
              </Link>
            </div>
          )}

          {/* Success State */}
          {success ? (
            <div className="space-y-5 py-6 text-center animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wide text-white">
                Password Reset Complete
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <div className="pt-2">
                <Link
                  to="/login"
                  search={{ email }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 cursor-pointer"
                >
                  Sign In to CustomON <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : resetToken ? (
            <div className="space-y-5">
              {/* Error Banner */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-300 animate-fade-in">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="newPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                  >
                    New password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 pl-4 pr-11 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer p-1"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmNewPassword"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                  >
                    Confirm new password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 pl-4 pr-11 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer p-1"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements Checklist */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-800/40 p-3 text-xs space-y-1.5">
                  <p className="font-bold text-zinc-300 uppercase text-[10px] tracking-wider">
                    Password requirements:
                  </p>
                  <div className="grid grid-cols-1 gap-1 text-zinc-400">
                    <div
                      className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400 font-medium" : ""}`}
                    >
                      {hasMinLength ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 ml-1 mr-1" />
                      )}
                      <span>At least 6 characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${hasLetter ? "text-emerald-400 font-medium" : ""}`}
                    >
                      {hasLetter ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 ml-1 mr-1" />
                      )}
                      <span>At least one letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${hasSymbol ? "text-emerald-400 font-medium" : ""}`}
                    >
                      {hasSymbol ? (
                        <Check className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-600 ml-1 mr-1" />
                      )}
                      <span>At least one special character</span>
                    </div>
                    {confirmPassword && (
                      <div
                        className={`flex items-center gap-1.5 ${doPasswordsMatch ? "text-emerald-400 font-medium" : "text-red-400"}`}
                      >
                        {doPasswordsMatch ? (
                          <Check className="h-3.5 w-3.5 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span>Passwords match</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !isPasswordValid ||
                    newPassword !== confirmPassword
                  }
                  className="w-full rounded-2xl bg-orange-500 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
