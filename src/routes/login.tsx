import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/page-shell";
import { useAuth, type Role } from "@/lib/auth";
import { User as UserIcon, Store as StoreIcon, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search.mode as string | undefined,
    signup: search.signup as string | undefined,
  }),
  head: () => ({
    meta: [
      { title: "Log In — Custom On" },
      {
        name: "description",
        content: "Access your Custom On account as a Customer or Shop Owner.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user, login, registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const [isRegistering, setIsRegistering] = useState(
    searchParams.mode === "signup" || searchParams.signup === "true"
  );
  const [role, setRole] = useState<Role>("customer");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect to correct landing page once session loading completes
  useEffect(() => {
    if (!isLoading && user) {
      navigate({ to: user.role === "shop-owner" ? "/dashboard" : "/products" });
    }
  }, [user, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError(role === "customer" ? "Please enter your phone number." : "Username is required.");
      return;
    }

    if (role === "customer") {
      // Validate phone number (accepting optional +91 or 0 prefix, and 10 digits starting with 6-9)
      const cleanPhone = trimmedUsername.replace(/[\s\-()]/g, "");
      const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
      if (!phoneRegex.test(cleanPhone)) {
        setError("Please enter a valid phone number.");
        return;
      }
    } else {
      if (trimmedUsername.length < 3) {
        setError("Username must be at least 3 characters.");
        return;
      }
    }

    if (isRegistering) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError("Please enter your name.");
        return;
      }
      if (!password) {
        setError("Password is required for registration.");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }

      // Perform registration
      const regRes = await registerUser(trimmedUsername, role, password, trimmedName);
      if (!regRes.success) {
        setError(regRes.error || "Registration failed.");
        return;
      }
    } else {
      // Perform login
      const loginRes = await login(trimmedUsername, role, password);
      if (!loginRes.success) {
        setError(loginRes.error || "Login failed.");
        return;
      }
    }

    setSuccess(true);

    // Redirect after a short delay for smooth visual feedback
    setTimeout(() => {
      navigate({ to: role === "shop-owner" ? "/dashboard" : "/products" });
    }, 800);
  };

  return (
    <PageShell>
      <div className="flex min-h-[80vh] items-center justify-center bg-brand-gray px-4 py-16">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-brand-black/5 bg-white p-8 shadow-2xl transition-all duration-300 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
          <div className="mb-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-orange">
              {isRegistering ? "Join Custom On" : "Welcome to Custom On"}
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-brand-black">
              {isRegistering ? "Create Account" : "Account Login"}
            </h1>
            <p className="mt-2 text-sm text-brand-black/50">
              {isRegistering
                ? "Sign up to start designing and managing products."
                : "Sign in to manage your orders or products catalog."}
            </p>
          </div>

          {/* Customer Login Badge */}
          <div className="mb-6 flex items-center justify-center gap-2 rounded-xl bg-brand-orange/10 py-3 text-xs font-bold uppercase tracking-wider text-brand-orange">
            <UserIcon className="h-4 w-4" /> Customer Login
          </div>

          {success ? (
            <div className="space-y-4 py-8 text-center animate-fade-in">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                ✓
              </div>
              <h2 className="text-xl font-bold uppercase">
                {isRegistering ? "Registered!" : "Success!"}
              </h2>
              <p className="text-sm text-brand-black/60">
                {isRegistering
                  ? `Creating account and logging you in as ${username}...`
                  : `Logging you in as ${username}...`}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {isRegistering && (
                <div className="space-y-2 animate-fade-in">
                  <label
                    htmlFor="name"
                    className="block text-xs font-bold uppercase tracking-wider text-brand-black/60"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full rounded-xl border border-brand-black/10 px-4 py-3 text-sm outline-none transition focus:border-brand-orange"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-xs font-bold uppercase tracking-wider text-brand-black/60"
                >
                  {role === "customer" ? "Phone Number" : "Username / ID"}
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "shop-owner" ? "owner_jdoe" : "e.g. 7090637746"}
                  className="w-full rounded-xl border border-brand-black/10 px-4 py-3 text-sm outline-none transition focus:border-brand-orange"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold uppercase tracking-wider text-brand-black/60"
                  >
                    Password
                  </label>
                  <span className="text-[10px] text-brand-black/40 italic">
                    {isRegistering ? "Required" : "Optional for demo"}
                  </span>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-brand-black/10 px-4 py-3 text-sm outline-none transition focus:border-brand-orange"
                />
              </div>

              <button
                type="submit"
                className={`mt-6 w-full py-4 text-center text-xs font-bold uppercase tracking-widest text-white transition-all ${
                  role === "shop-owner"
                    ? "bg-brand-orange hover:bg-brand-black shadow-brand"
                    : "bg-brand-black hover:bg-brand-orange"
                }`}
              >
                {isRegistering
                  ? `Register as ${role === "shop-owner" ? "Shop Owner" : "Customer"}`
                  : `Log In as ${role === "shop-owner" ? "Shop Owner" : "Customer"}`}
              </button>

              <div className="mt-6 border-t border-brand-black/5 pt-4 text-center space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError("");
                    setName("");
                  }}
                  className="text-xs font-bold uppercase tracking-wider text-brand-orange hover:text-brand-black transition-colors"
                >
                  {isRegistering
                    ? "Already have an account? Log In"
                    : "Don't have an account? Register"}
                </button>

                <p className="text-[10px] leading-relaxed text-brand-black/40">
                  {role === "shop-owner"
                    ? "Shop Owner accounts can access internal catalog administration to list new blanks, customize inventory, and update categories."
                    : "Customer accounts can browse items, customize apparel in the design studio, and save creations to their profile."}
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
}
