import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/reveal-secrets")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("x-admin-key");
        if (!auth || auth !== process.env.ADMIN_API_KEY) {
          return new Response("Unauthorized", { status: 401 });
        }
        return Response.json({
          SUPABASE_URL: process.env.SUPABASE_URL ?? null,
          SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY ?? null,
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? null,
          SUPABASE_DB_URL: process.env.SUPABASE_DB_URL ?? null,
          LOVABLE_API_KEY: process.env.LOVABLE_API_KEY ?? null,
          N8N_OPS_WEBHOOK_URL: process.env.N8N_OPS_WEBHOOK_URL ?? null,
        });
      },
    },
  },
});