import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import {
  ShieldAlert,
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    email: (search.email as string) || undefined,
    redirect: (search.redirect as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Create Your Account — CustomON" },
      {
        name: "description",
        content: "Register a new customer account on CustomON.",
      },
    ],
  }),
  component: RegisterPage,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const { user, registerWithEmail, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const redirectTarget = searchParams.redirect;

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.email || "");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!isAuthLoading && user) {
      const dest = redirectTarget || (user.role === "shop-owner" ? "/dashboard" : "/products");
      navigate({ to: dest as any });
    }
  }, [user, isAuthLoading, navigate, redirectTarget]);

  // Password requirements calculation
  const hasMinLength = password.length >= 6;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasSymbol = /[^A-Za-z0-9\s]/.test(password);
  const isPasswordValid = hasMinLength && hasLetter && hasSymbol;
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isPasswordValid) {
      setError(
        "Password must be at least 6 characters and include a letter and a special character.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerWithEmail(
        trimmedName,
        normalizedEmail,
        password,
        confirmPassword,
        phone.trim() || undefined,
      );

      if (!res.success) {
        setError(res.error || "Unable to complete registration. Please try again.");
        return;
      }

      // Navigate to email OTP verification page
      navigate({
        to: "/verify-email",
        search: { email: normalizedEmail, redirect: redirectTarget },
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="flex min-h-[85vh] items-center justify-center bg-zinc-950 px-4 py-16 text-zinc-100">
        <div className="w-full max-w-[440px] overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl transition-all duration-300">
          {/* Header Section */}
          <div className="mb-7 text-center">
            <span className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">
              Join CustomON
            </span>
            <h1 className="mt-3 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Create your CustomON account
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">
              Start designing and ordering premium custom apparel
            </p>
          </div>

          <div className="space-y-5">
            {/* Error Banner */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-300 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                >
                  Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="First and last name"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="phone"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                  >
                    Phone number
                  </label>
                  <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                    Optional
                  </span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210 (optional for delivery updates)"
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                >
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 pl-4 pr-11 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                >
                  Confirm password
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
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

              {/* Password Requirements Live Checklist */}
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
                  !name.trim() ||
                  !email ||
                  !isPasswordValid ||
                  password !== confirmPassword
                }
                className="w-full rounded-2xl bg-orange-500 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Already have an account */}
            <div className="mt-6 border-t border-zinc-800/80 pt-5 text-center">
              <p className="text-xs text-zinc-400 mb-2">Already have an account?</p>
              <Link
                to="/login"
                search={redirectTarget ? { redirect: redirectTarget } : {}}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-700/80 bg-zinc-800/60 py-3 text-xs font-bold uppercase tracking-wider text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
