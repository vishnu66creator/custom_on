// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const port = Number(process.env.VITE_PORT || process.env.PORT) || 5173;

function printConnectedUrlsPlugin() {
  return {
    name: "print-connected-urls",
    configureServer(server: any) {
      const originalPrint = server.printUrls;
      server.printUrls = () => {
        if (originalPrint) originalPrint.call(server);
        console.log("\n  \x1b[36m\x1b[1m🚀 CUSTOM ON — Connected Web Applications:\x1b[0m");
        console.log("  \x1b[32m\x1b[1m➜  Customer Web Page:\x1b[0m \x1b[36mhttp://localhost:5173/\x1b[0m");
        console.log("  \x1b[35m\x1b[1m➜  Admin Web Page:   \x1b[0m \x1b[35mhttp://localhost:5174/admin/login\x1b[0m\n");
      };
    },
  };
}

export default defineConfig({
  vite: {
    plugins: [printConnectedUrlsPlugin()],
    server: {
      port,
      strictPort: false,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
