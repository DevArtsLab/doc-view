// doc-view: serve synced markdown under a pluggable viewer shell.
//
//   /content/private/**     -> Access-JWT-gated (403 without a valid token)
//   /                       -> /viewers/<VIEWER>/index.html
//   /<clean-path> (no ext)  -> viewer shell (history-API viewers)
//   /<path-with-ext>        -> static asset passthrough (/content/**, /viewers/**)
//
// Add a viewer by dropping a directory into site/viewers/<name>/ and
// setting VIEWER=<name> in wrangler.jsonc vars (or --var VIEWER=<name>).
//
// Private-zone enforcement is Worker-side and fails closed: without
// ACCESS_AUD set, /content/private/** always 403s. The Cloudflare Access
// self-hosted app scoped to train.devartslab.com/content/private supplies
// the login UX; this Worker verifies the issued JWT (RS256 against the
// team certs, exp + aud checked).

export interface Env {
  ASSETS: Fetcher;
  DOCS_HOSTNAME: string;
  VIEWER: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  FOUNDATION_RAW_BASE: string;
}

const FILE_EXT = /\.[a-z0-9]+$/i;
const PRIVATE_PREFIX = "/content/private/";
const CERTS_TTL_MS = 10 * 60 * 1000;

let certsCache: { keys: (JsonWebKey & { kid?: string })[]; at: number } | null = null;

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("method not allowed", { status: 405 });
    }

    const url = new URL(request.url);

    if (
      url.pathname === "/content/private" ||
      url.pathname.startsWith(PRIVATE_PREFIX)
    ) {
      // Local dev: wrangler dev rewrites request.url and host to the route
      // hostname, but cf-connecting-ip stays loopback. No real client IP can
      // be loopback, so production always verifies.
      const email = ["127.0.0.1", "::1"].includes(
        request.headers.get("cf-connecting-ip") ?? "",
      )
        ? "local-dev"
        : await verifyAccessJwt(request, env).catch(() => null);
      if (!email) return new Response("forbidden", { status: 403 });
      // The private root is a directory, not a file: land in the viewer at
      // the private index route instead of 404ing on missing index.html.
      if (url.pathname === "/content/private" || url.pathname === PRIVATE_PREFIX) {
        return Response.redirect(`${url.origin}/#/private/`, 302);
      }
      // Remote docs marked `visibility: private` gate the same way.
      if (url.pathname.startsWith(`${PRIVATE_PREFIX}foundation/`)) {
        return proxyFoundation(url, env, ctx);
      }
      return env.ASSETS.fetch(request);
    }

    // Remote source: fetched live from GitHub raw, edge-cached, never copied.
    if (url.pathname.startsWith("/content/foundation/")) {
      return proxyFoundation(url, env, ctx);
    }

    if (url.pathname === "/" || !FILE_EXT.test(url.pathname)) {
      // Request the directory, not index.html: assets canonicalizes
      // index.html to a trailing-slash redirect, which would loop here.
      const shell = new URL(`/viewers/${env.VIEWER}/`, url);
      const res = await env.ASSETS.fetch(new Request(shell, request));
      if (res.status !== 404) return res;
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

// foundation/ lives in the public DevArtsLab/foundation repo - proxied
// live and edge-cached 5 min so the docs are never stale-copied here.
async function proxyFoundation(
  url: URL,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const rel = url.pathname.replace(/^\/content\/(private\/)?foundation\//, "");
  const cacheKey = new Request(url.toString());
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;
  const res = await fetch(`${env.FOUNDATION_RAW_BASE}/${rel}`);
  if (!res.ok) return res;
  const out = new Response(res.body, res);
  out.headers.set("Cache-Control", "public, max-age=300");
  ctx.waitUntil(caches.default.put(cacheKey, out.clone()));
  return out;
}

function b64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function accessToken(request: Request): string | null {
  const jwt = request.headers.get("Cf-Access-Jwt-Assertion");
  if (jwt) return jwt;
  const cookie = request.headers.get("Cookie") ?? "";
  return /(?:^|;\s*)CF_Authorization=([^;]+)/.exec(cookie)?.[1] ?? null;
}

async function accessKeys(env: Env): Promise<(JsonWebKey & { kid?: string })[]> {
  if (!certsCache || Date.now() - certsCache.at > CERTS_TTL_MS) {
    const res = await fetch(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`);
    if (!res.ok) throw new Error(`access certs: ${res.status}`);
    const body = (await res.json()) as { keys?: (JsonWebKey & { kid?: string })[] };
    certsCache = { keys: body.keys ?? [], at: Date.now() };
  }
  return certsCache.keys;
}

async function verifyAccessJwt(request: Request, env: Env): Promise<string | null> {
  if (!env.ACCESS_AUD || !env.ACCESS_TEAM_DOMAIN) return null;
  const token = accessToken(request);
  if (!token) return null;
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return null;

  const header = JSON.parse(new TextDecoder().decode(b64url(h))) as { kid?: string };
  const payload = JSON.parse(new TextDecoder().decode(b64url(p))) as {
    aud?: string | string[];
    exp?: number;
    email?: string;
  };
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(env.ACCESS_AUD)) return null;
  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;

  const jwk = (await accessKeys(env)).find((k) => k.kid === header.kid);
  if (!jwk) return null;
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64url(s).buffer as ArrayBuffer,
    new TextEncoder().encode(`${h}.${p}`).buffer as ArrayBuffer,
  );
  return ok ? (payload.email ?? "authenticated") : null;
}
