# train-docs

> Markdown docs viewer for `train/` content on train.devartslab.com, behind Cloudflare Access.

## Architecture

Workers Static Assets. The Worker (`src/index.ts`) routes `/` and any
extensionless path to the active viewer shell; everything else passes through
to assets.

```text
/                       -> site/viewers/<VIEWER>/index.html
/content/**             -> synced markdown from ../documents/
/content/foundation/**  -> live proxy of DevArtsLab/foundation (GitHub raw)
/viewers/<name>/**      -> viewer shells (static)
```

## Plug-and-play viewers

| Viewer    | Path                | Engine                             |
| --------- | ------------------- | ---------------------------------- |
| `docsify` | `/viewers/docsify/` | docsify 4 + emoji plugin (CDN)     |
| `lite`    | `/viewers/lite/`    | marked + github-markdown-css (CDN) |

Add one: drop `site/viewers/<name>/index.html`, set `VIEWER=<name>` in
`wrangler.jsonc` vars (or `--var VIEWER=<name>` at deploy). Contract per
viewer: docs under `/content/`, index at `/content/manifest.json`,
`/content/README.md`, `/content/_sidebar.md`.

## Content

`pnpm run sync` copies `../train/**/*.md` into `site/content/` and
regenerates `manifest.json`, `README.md`, `_sidebar.md`. `dev` and `deploy`
run sync first.

Remote sources (see `REMOTE_SOURCES` in `scripts/sync.mjs`) are **never
copied**: sync lists them via the GitHub API for indexes only, and the
Worker proxies `raw.githubusercontent.com` at request time, edge-cached
5 min. `foundation/` docs marked `visibility: private` are served via
`/content/private/foundation/` behind the same JWT gate.

## Public vs private

Docs are **public by default**. Opt a doc into the private zone with
frontmatter:

```markdown
---
visibility: private
---
```

| Zone    | Emitted to              | Served at                 | Access                          |
| ------- | ----------------------- | ------------------------- | ------------------------------- |
| public  | `site/content/<path>`   | `/content/<path>`         | anyone                          |
| private | `site/content/private/` | `/content/private/<path>` | Cloudflare Access JWT, else 403 |

Enforcement is Worker-side (`run_worker_first`), so private files 403 even
if the Access app is missing or misconfigured. `ACCESS_AUD` (wrangler var)
must equal the Access app's AUD tag for private requests to verify; unset
means the private zone is closed to everyone.

`/content/private/` (directory) redirects to `/#/private/` in the viewer.
Viewers list private docs in the nav only after Access auth (they probe the
gated `private/manifest.json`); anonymous users see a "Private zone" entry
that starts the login flow.

`site/content/private/` is **never committed** - it is a gitignored build
artifact populated by sync for the deploy bundle and removed after
`pnpm deploy`. Private source docs live in the git-crypt-encrypted
`DevArtsLab/documents` repo (ciphertext on GitHub; filenames still
visible, so keep them non-sensitive). Public index files
(`manifest.json`, `README.md`, `_sidebar.md`) list public docs only; the
private zone keeps its own index inside `private/` (generated at sync
time, Access-gated on the site).

## Commands

```bash
pnpm install
pnpm run dev       # sync + wrangler dev -> http://localhost:8787
pnpm run deploy    # sync + wrangler deploy
pnpm run typecheck
```

Local dev opens the private zone on loopback (`cf-connecting-ip` is
`127.0.0.1`/`::1`); production always verifies the JWT.

## Security

- Private source docs live in `DevArtsLab/documents` (public repo,
  git-crypt encrypted). Unlock on a new machine:
  `git-crypt unlock <key-path>/documents.git-crypt.key` (key in
  workspace store `config/projects/documents/secrets/`).
- Nothing private is committed to this repo: `site/content/private/` is
  gitignored and populated only at sync/deploy time.
- Access app `train-docs` (self-hosted) covers
  `train.devartslab.com/content/private` only; policy: Cloudflare account
  members. Worker independently verifies the JWT (`ACCESS_AUD`), so the
  private zone fails closed if the app is removed.

## License

MIT. See [LICENSE](LICENSE).

## Credits

Built by [DevArts Lab](https://github.com/DevArtsLab).
