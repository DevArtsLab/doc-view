// train-docs: serve synced markdown under a pluggable viewer shell.
//
//   /                       -> /viewers/<VIEWER>/index.html
//   /<clean-path> (no ext)  -> viewer shell (history-API viewers)
//   /<path-with-ext>        -> static asset passthrough (/content/**, /viewers/**)
//
// Add a viewer by dropping a directory into public/viewers/<name>/ and
// setting VIEWER=<name> in wrangler.jsonc vars (or --var VIEWER=<name>).

export interface Env {
  ASSETS: Fetcher;
  DOCS_HOSTNAME: string;
  VIEWER: string;
}

const FILE_EXT = /\.[a-z0-9]+$/i;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("method not allowed", { status: 405 });
    }

    const url = new URL(request.url);
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
