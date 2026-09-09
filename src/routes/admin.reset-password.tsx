import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { ShieldAlert, Eye, EyeOff, Lock, CheckCircle2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Admin Password — Custom On" },
      {
        name: "description",
        content: "Reset administrator password page.",
      },
    ],
  }),
  component: AdminResetPasswordPage,
});

function AdminResetPasswordPage() {
  const { resetAdminPasswordWithToken } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("admin_reset_email");
    const savedToken = sessionStorage.getItem("admin_reset_token");

    if (!savedEmail || !savedToken) {
      navigate({ to: "/admin/forgot-password" });
      return;
    }
    setEmail(savedEmail);
    setResetToken(savedToken);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || newPassword.length < 8) {
      setError("Admin password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await resetAdminPasswordWithToken(
        email,
        resetToken,
        newPassword,
        confirmPassword,
      );

      if (!res.success) {
        setError(res.error || "Unable to reset password. Please try again.");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      sessionStorage.removeItem("admin_reset_email");
      sessionStorage.removeItem("admin_reset_token");

      setTimeout(() => {
        navigate({ to: "/admin/login" });
      }, 1500);
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
                <Lock className="h-3 w-3" /> Reset Credentials
              </span>
            </div>
            <h1 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-white">
              Reset Password
            </h1>
            <p className="mt-1.5 text-xs text-white/50">
              Create a new secure password for admin account <span className="font-semibold text-white/80">{email}</span>.
            </p>
          </div>

          {success ? (
            <div className="space-y-4 py-8 text-center animate-fade-in">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold uppercase text-white">Password Updated!</h2>
              <p className="text-xs text-white/60">Your password has been reset successfully. Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2.5 rounded-2xl bg-red-950/70 border border-red-800/50 p-3.5 text-xs font-medium text-red-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-2">
                <label
                  htmlFor="new-admin-password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-white/70"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-admin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-zinc-800/80 px-4 py-3.5 pr-11 text-sm text-white placeholder-white/20 outline-none transition focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label
                  htmlFor="confirm-admin-password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-white/70"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-zinc-800/80 px-4 py-3.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                />
              </div>

              {/* Requirements hint */}
              <div className="rounded-xl bg-white/5 p-3 text-[11px] text-white/50 space-y-1">
                <p className={newPassword.length >= 8 ? "text-emerald-400" : ""}>
                  ✓ Minimum 8 characters long
                </p>
                <p className={newPassword && newPassword === confirmPassword ? "text-emerald-400" : ""}>
                  ✓ Passwords match
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-orange py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-brand transition hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Reset Admin Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
  );
}
