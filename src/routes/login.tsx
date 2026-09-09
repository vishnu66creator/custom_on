import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/lib/auth";
import {
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ArrowRight,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    verify: (search.verify as string) || undefined,
    email: (search.email as string) || undefined,
    redirect: (search.redirect as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign In — CustomON" },
      {
        name: "description",
        content: "Sign in to CustomON with your email address or Google account.",
      },
    ],
  }),
  component: LoginPage,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Global declaration for Google Identity Services SDK
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: string;
          }) => void;
          prompt: (notification?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
              locale?: string;
            },
          ) => void;
          cancel: () => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: {
              access_token?: string;
              error?: string;
              error_description?: string;
            }) => void;
            error_callback?: (error: { type: string; message: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

function LoginPage() {
  const { user, loginWithEmail, loginWithGoogle, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const redirectTarget = searchParams.redirect;

  // Form State
  const [email, setEmail] = useState(searchParams.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [error, setError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const tokenClientRef = useRef<any>(null);

  // Navigate after authentication
  const handleAuthSuccess = useCallback(
    (msg: string) => {
      setSuccessMessage(msg);
      setSuccess(true);
      setTimeout(() => {
        const dest = redirectTarget || (user?.role === "shop-owner" ? "/dashboard" : "/products");
        navigate({ to: dest as any });
      }, 500);
    },
    [navigate, redirectTarget, user?.role],
  );

  // Redirect if already logged in
  useEffect(() => {
    if (!isAuthLoading && user) {
      const dest = redirectTarget || (user.role === "shop-owner" ? "/dashboard" : "/products");
      navigate({ to: dest as any });
    }
  }, [user, isAuthLoading, navigate, redirectTarget]);

  // Handle Google Credential Response (ID Token)
  const handleGoogleCredentialResponse = useCallback(
    async (response: { credential?: string }) => {
      if (!response?.credential) {
        setError("Google authentication failed. Please try again.");
        setIsGoogleLoading(false);
        return;
      }
      setIsGoogleLoading(true);
      setError("");
      setUnverifiedEmail(null);
      try {
        const res = await loginWithGoogle({ credential: response.credential });
        if (!res.success) {
          setError(res.error || "Unable to complete Google Sign-In. Please try again.");
          setIsGoogleLoading(false);
          return;
        }
        handleAuthSuccess("Signed in successfully with Google!");
      } catch (err: any) {
        console.error("Google credential login error:", err);
        setError("Unable to complete Google Sign-In. Please try again.");
        setIsGoogleLoading(false);
      }
    },
    [loginWithGoogle, handleAuthSuccess],
  );

  // Handle Google Access Token Response (OAuth2 popup)
  const handleGoogleTokenResponse = useCallback(
    async (tokenResponse: {
      access_token?: string;
      error?: string;
      error_description?: string;
    }) => {
      if (tokenResponse.error) {
        setIsGoogleLoading(false);
        if (
          tokenResponse.error === "popup_closed_by_user" ||
          tokenResponse.error === "access_denied"
        ) {
          setError("Google Sign-In was cancelled.");
        } else if (tokenResponse.error === "popup_blocked_by_browser") {
          setError(
            "Google Sign-In was blocked by your browser. Please allow popups for CustomON and try again.",
          );
        } else {
          setError(
            tokenResponse.error_description ||
              "Unable to complete Google Sign-In. Please try again.",
          );
        }
        return;
      }

      if (!tokenResponse.access_token) {
        setError("Google authentication failed. Please try again.");
        setIsGoogleLoading(false);
        return;
      }

      setIsGoogleLoading(true);
      setError("");
      setUnverifiedEmail(null);
      try {
        const res = await loginWithGoogle({ accessToken: tokenResponse.access_token });
        if (!res.success) {
          setError(res.error || "Unable to complete Google Sign-In. Please try again.");
          setIsGoogleLoading(false);
          return;
        }
        handleAuthSuccess("Signed in successfully with Google!");
      } catch (err: any) {
        console.error("Google access token login error:", err);
        setError("Unable to complete Google Sign-In. Please try again.");
        setIsGoogleLoading(false);
      }
    },
    [loginWithGoogle, handleAuthSuccess],
  );

  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services
  useEffect(() => {
    if (typeof window === "undefined") return;

    const clientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      (import.meta as any).env?.GOOGLE_CLIENT_ID ||
      "";

    if (!clientId) return;

    let isMounted = true;

    const initGis = () => {
      if (!isMounted) return false;
      const google = window.google;
      if (google?.accounts?.id) {
        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            context: "signin",
          });

          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = "";
            google.accounts.id.renderButton(googleBtnRef.current, {
              type: "standard",
              theme: "filled_black",
              size: "large",
              text: "continue_with",
              shape: "pill",
              width: 360,
              logo_alignment: "left",
            });
          }

          if (google.accounts.oauth2) {
            tokenClientRef.current = google.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope: "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
              callback: handleGoogleTokenResponse,
              error_callback: (err: any) => {
                setIsGoogleLoading(false);
                if (err?.type === "popup_closed") {
                  setError("Google Sign-In was cancelled.");
                } else if (err?.type === "popup_blocked") {
                  setError(
                    "Google Sign-In was blocked by your browser. Please allow popups for CustomON and try again.",
                  );
                } else {
                  setError(
                    "Unable to connect to Google. Please check your connection and try again.",
                  );
                }
              },
            });
          }

          setIsGoogleReady(true);
          return true;
        } catch (err) {
          console.warn("Google Identity Services initialization:", err);
        }
      }
      return false;
    };

    if (!initGis()) {
      const interval = setInterval(() => {
        if (initGis()) clearInterval(interval);
      }, 250);

      const timer = setTimeout(() => {
        clearInterval(interval);
      }, 8000);

      return () => {
        isMounted = false;
        clearInterval(interval);
        clearTimeout(timer);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [handleGoogleCredentialResponse, handleGoogleTokenResponse]);

  // Google Click Trigger
  const handleGoogleClick = () => {
    setError("");
    setUnverifiedEmail(null);

    const clientId =
      (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
      (import.meta as any).env?.GOOGLE_CLIENT_ID;

    if (!clientId) {
      setError("Google Sign-In is not configured in this environment.");
      return;
    }

    if (tokenClientRef.current) {
      setIsGoogleLoading(true);
      try {
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      } catch (err) {
        console.error("Token client error:", err);
        setIsGoogleLoading(false);
        setError("Google Sign-In couldn't be started. Please try again.");
      }
    } else if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setIsGoogleLoading(true);
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsGoogleLoading(false);
            const reason = notification.getNotDisplayedReason() || "";
            if (reason.includes("opt_out") || reason.includes("suppress")) {
              setError("Google Sign-In was cancelled or suppressed. Please try again.");
            }
          }
        });
      } catch {
        setIsGoogleLoading(false);
        setError("Google Sign-In couldn't be started. Please try again.");
      }
    } else {
      setError("Google Sign-In is loading. Please wait a moment and try again.");
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !EMAIL_REGEX.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithEmail(normalizedEmail, password);
      if (!res.success) {
        if (res.requireVerification && res.unverifiedEmail) {
          setUnverifiedEmail(res.unverifiedEmail);
          setError("Please verify your email before signing in.");
        } else {
          setError(res.error || "Invalid email or password.");
        }
        return;
      }

      handleAuthSuccess("Welcome back! Signing in...");
    } catch {
      setError("Unable to connect to the account service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="flex min-h-[85vh] items-center justify-center bg-zinc-950 px-4 py-16 text-zinc-100">
        <div className="w-full max-w-[420px] overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-7 sm:p-9 shadow-2xl backdrop-blur-xl transition-all duration-300">
          {/* Header Section */}
          <div className="mb-7 text-center">
            <span className="inline-block rounded-full bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-orange-400">
              Customer Account
            </span>
            <h1 className="mt-3 font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Sign in to your CustomON account
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">
              Enter your email and password to access your account
            </p>
          </div>

          {/* Success State */}
          {success ? (
            <div className="space-y-4 py-10 text-center animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shadow-inner">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2 className="text-xl font-bold uppercase tracking-wide text-white">
                Authenticated
              </h2>
              <p className="text-sm text-zinc-400">{successMessage}</p>
              <div className="flex items-center justify-center gap-2 text-xs text-orange-400 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Redirecting to CustomON...
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Error Banner */}
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-medium text-red-300 animate-fade-in space-y-2">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                    <span className="leading-relaxed">{error}</span>
                  </div>
                  {unverifiedEmail && (
                    <div className="pt-1">
                      <Link
                        to="/verify-email"
                        search={{ email: unverifiedEmail, redirect: redirectTarget }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500/20 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/30 transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5" /> Verify Email Now <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="loginEmail"
                    className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                  >
                    Email address
                  </label>
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-2xl border border-zinc-700 bg-zinc-800/80 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="loginPassword"
                      className="block text-xs font-bold uppercase tracking-wider text-zinc-400"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      search={{ email: email || undefined }}
                      className="text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors cursor-pointer"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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

                <button
                  type="submit"
                  disabled={isSubmitting || !email || !password}
                  className="w-full rounded-2xl bg-orange-500 py-3.5 text-center text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <span className="relative bg-zinc-900 px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  or
                </span>
              </div>

              {/* Continue with Google */}
              <div className="flex flex-col items-center justify-center w-full min-h-[44px]">
                <div
                  ref={googleBtnRef}
                  className="w-full flex justify-center [&>div]:!w-full [&_iframe]:!w-full [&_iframe]:!rounded-2xl overflow-hidden"
                />
                {!isGoogleReady && (
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    disabled={isGoogleLoading || isSubmitting}
                    className="relative flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-800/70 py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:border-zinc-500 hover:bg-zinc-800 active:scale-[0.99] cursor-pointer disabled:opacity-60"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
                    ) : (
                      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>
                      {isGoogleLoading
                        ? "Signing in with Google..."
                        : "Continue with Google"}
                    </span>
                  </button>
                )}
              </div>

              {/* Create Account Link */}
              <div className="mt-6 border-t border-zinc-800/80 pt-5 text-center">
                <p className="text-xs text-zinc-400 mb-2">Don't have an account?</p>
                <Link
                  to="/register"
                  search={redirectTarget ? { redirect: redirectTarget } : {}}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/10 py-3 text-xs font-bold uppercase tracking-wider text-orange-400 hover:bg-orange-500/20 transition-all cursor-pointer"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
