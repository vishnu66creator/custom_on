import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider } from "../lib/auth";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-brand-orange px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:-translate-y-0.5"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center bg-brand-orange px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center border-2 border-brand-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-brand-black hover:text-white"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Custom On — Wear Your Creativity" },
      {
        name: "description",
        content:
          "Custom On is a premium custom apparel printing studio. Design your own T-shirts, hoodies, and polos in our studio and have them printed and shipped fast.",
      },
      { property: "og:title", content: "Custom On — Wear Your Creativity" },
      {
        property: "og:description",
        content:
          "Premium custom apparel printing. Upload your art, design in our studio, and we'll print and ship.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Alex+Brush&family=Allura&family=Bebas+Neue&family=Bungee&family=Caveat:wght@600;700&family=Cinzel:wght@700;900&family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Inter:wght@400;500;600;700&family=Kaushan+Script&family=Monoton&family=Orbitron:wght@700;900&family=Pacifico&family=Permanent+Marker&family=Pirata+One&family=Playfair+Display:ital,wght@1,700&family=Plus+Jakarta+Sans:wght@500;700;800&family=Press+Start+2P&family=Righteous&family=Rubik+Glitch&family=Russo+One&family=Sacramento&family=Satisfy&family=Syne:wght@700;800&family=UnifrakturMaguntia&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => { try { const dark = window.matchMedia("(prefers-color-scheme: dark)").matches; document.documentElement.classList.toggle("dark", dark); } catch (_) {} })();`,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
