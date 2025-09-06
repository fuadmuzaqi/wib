// Deno Deploy server: static + API WIB-only
// Endpoint: GET /api/time -> { epoch_ms, served_at_iso, server_tz }
// Sumber waktu: jam server (UTC epoch), tidak pernah memakai waktu klien.

import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

function jsonResponse(obj: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(obj), {
    headers: { "content-type": "application/json; charset=utf-8" },
    ...init,
  });
}

Deno.serve((req: Request) => {
  const { pathname } = new URL(req.url);

  if (pathname === "/api/time") {
    const epoch_ms = Date.now();
    const server_tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
    return jsonResponse({
      epoch_ms,
      server_tz,
      served_at_iso: new Date(epoch_ms).toISOString(),
    });
  }

  return serveDir(req, {
    fsRoot: "public",
    quiet: true,
  });
});
