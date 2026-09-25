import { createFileRoute } from "@tanstack/react-router";
import { getCorsHeaders, handleCorsPreflight } from "@/lib/cors";
import { getAdminCustomers } from "@/lib/db/app-service";

export const Route = createFileRoute("/api/admin/customers")({
  server: {
    handlers: {
      OPTIONS: async ({ request }) => handleCorsPreflight(request),
      GET: async ({ request }) => {
        const corsHeaders = getCorsHeaders(request);
        try {
          const result = await getAdminCustomers();

          if (!result.success) {
            return new Response(JSON.stringify(result), {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }

          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              success: false,
              error: err?.message || "Internal server error fetching customers",
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
