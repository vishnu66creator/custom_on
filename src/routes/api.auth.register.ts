import { createFileRoute } from "@tanstack/react-router";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/cors";
import { registerCustomer } from "@/lib/db/app-service";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => handleCorsPreflight(request),
      POST: async ({ request }) => {
        const corsHeaders = getCorsHeaders(request);
        try {
          const body = await request.json().catch(() => ({}));
          const { name, email, password, phone } = body || {};

          if (!name || !email || !password) {
            return new Response(
              JSON.stringify({
                success: false,
                error: "Name, email, and password are required.",
              }),
              {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          const result = await registerCustomer({
            data: {
              name: String(name).trim(),
              email: String(email).trim().toLowerCase(),
              password: String(password),
              phone: phone ? String(phone).trim() : undefined,
              role: "customer",
            },
          });

          if (!result.success) {
            return new Response(JSON.stringify(result), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify(result), {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              success: false,
              error: err?.message || "Internal server error during registration",
            }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
      },
    },
  },
});
