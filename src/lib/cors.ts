const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin") || "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "http://localhost:5173";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
  };
}

export function handleCorsPreflight(request: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}
