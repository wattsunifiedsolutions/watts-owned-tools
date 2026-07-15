const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
} as const;

const MAX_BODY_BYTES = 64 * 1024;
const MAX_SUBMISSIONS_PER_HOUR = 10;

function json(body: unknown, status = 200, extraHeaders: HeadersInit = {}): Response {
  return Response.json(body, {
    status,
    headers: { ...JSON_HEADERS, ...Object.fromEntries(new Headers(extraHeaders)) },
  });
}

function normalizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, maxLength);
}

function validEmail(value: string): boolean {
  return value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validPhone(value: string): boolean {
  return value === "" || /^[0-9+().\-\s]{7,24}$/.test(value);
}

function isAllowedOrigin(origin: string, env: Env): boolean {
  if (!origin) return false;
  const configured = env.ALLOWED_ORIGINS.split(",").map((value) => value.trim());
  if (configured.includes(origin)) return true;
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && url.hostname.endsWith(".pages.dev");
  } catch {
    return false;
  }
}

function corsHeaders(origin: string, env: Env): HeadersInit {
  if (!isAllowedOrigin(origin, env)) return {};
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function enforceRateLimit(request: Request, env: Env): Promise<boolean> {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const now = Math.floor(Date.now() / 1000);
  const hour = Math.floor(now / 3600);
  const bucket = await sha256Hex(`${ip}:${hour}`);
  const current = await env.DB.prepare(
    "SELECT count, expires_at FROM rate_limits WHERE bucket = ?",
  ).bind(bucket).first<{ count: number; expires_at: number }>();

  if (current && current.expires_at > now && current.count >= MAX_SUBMISSIONS_PER_HOUR) {
    return false;
  }

  if (!current || current.expires_at <= now) {
    await env.DB.prepare(
      "INSERT INTO rate_limits (bucket, count, expires_at) VALUES (?, 1, ?) " +
        "ON CONFLICT(bucket) DO UPDATE SET count = 1, expires_at = excluded.expires_at",
    ).bind(bucket, now + 3600).run();
  } else {
    await env.DB.prepare("UPDATE rate_limits SET count = count + 1 WHERE bucket = ?")
      .bind(bucket)
      .run();
  }

  return true;
}

async function handleSubmission(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const origin = request.headers.get("origin") ?? "";
  const cors = corsHeaders(origin, env);
  if (!isAllowedOrigin(origin, env)) return json({ ok: false, error: "origin_not_allowed" }, 403);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413, cors);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "json_required" }, 415, cors);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json<Record<string, unknown>>();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, cors);
  }

  if (normalizeText(body.company, 100)) return json({ ok: true }, 202, cors);
  if (!(await enforceRateLimit(request, env))) {
    return json({ ok: false, error: "rate_limited" }, 429, { ...cors, "retry-after": "3600" });
  }

  const tool = normalizeText(body.tool, 80);
  const name = normalizeText(body.name, 120);
  const email = normalizeText(body.email, 254).toLowerCase();
  const phone = normalizeText(body.phone, 24);
  const data = body.data && typeof body.data === "object" ? body.data : {};

  if (!tool || (!name && !email && !phone)) {
    return json({ ok: false, error: "missing_required_fields" }, 400, cors);
  }
  if (!validEmail(email) || !validPhone(phone)) {
    return json({ ok: false, error: "invalid_contact_information" }, 400, cors);
  }

  const payload = JSON.stringify(data);
  if (new TextEncoder().encode(payload).byteLength > 48 * 1024) {
    return json({ ok: false, error: "payload_too_large" }, 413, cors);
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const sourceHost = normalizeText(new URL(origin).hostname, 253);
  const ipHash = await sha256Hex(request.headers.get("cf-connecting-ip") ?? "unknown");
  const userAgent = normalizeText(request.headers.get("user-agent"), 500);

  await env.DB.prepare(
    "INSERT INTO submissions (id, created_at, tool, source_host, name, email, phone, payload, ip_hash, user_agent) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(id, createdAt, tool, sourceHost, name, email, phone, payload, ipHash, userAgent).run();

  ctx.waitUntil(
    env.DB.prepare("DELETE FROM rate_limits WHERE expires_at < ?")
      .bind(Math.floor(Date.now() / 1000) - 86400)
      .run()
      .then(() => undefined),
  );

  console.log({ event: "submission_created", id, tool, sourceHost });
  return json({ ok: true, id }, 201, cors);
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin") ?? "";

    try {
      if (request.method === "GET" && url.pathname === "/health") {
        return json({ ok: true, service: "watts-unified-tools-api" });
      }
      if (request.method === "OPTIONS" && url.pathname === "/api/submissions") {
        if (!isAllowedOrigin(origin, env)) return new Response(null, { status: 403 });
        return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
      }
      if (request.method === "POST" && url.pathname === "/api/submissions") {
        return await handleSubmission(request, env, ctx);
      }
      return json({ ok: false, error: "not_found" }, 404);
    } catch (error) {
      console.error({ event: "request_failed", path: url.pathname, error: String(error) });
      return json({ ok: false, error: "internal_error" }, 500, corsHeaders(origin, env));
    }
  },
} satisfies ExportedHandler<Env>;
