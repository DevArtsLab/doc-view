# train-docs

> Markdown docs viewer for `train/` content on train.devartslab.com, behind Cloudflare Access.

DevArts Lab project. Agent conventions: [AGENTS.md](AGENTS.md).

## Architecture

Workers Static Assets. The Worker (`src/index.ts`) routes `/` and any
extensionless path to the active viewer shell; everything else passes through
to assets.

```text
/                       -> public/viewers/<VIEWER>/index.html
/content/**             -> synced markdown from ../train/
/viewers/<name>/**      -> viewer shells (static)
```

## Plug-and-play viewers

| Viewer    | Path                | Engine                             |
| --------- | ------------------- | ---------------------------------- |
| `docsify` | `/viewers/docsify/` | docsify 4 + emoji plugin (CDN)     |
| `lite`    | `/viewers/lite/`    | marked + github-markdown-css (CDN) |

Add one: drop `public/viewers/<name>/index.html`, set `VIEWER=<name>` in
`wrangler.jsonc` vars (or `--var VIEWER=<name>` at deploy). Contract per
viewer: docs under `/content/`, index at `/content/manifest.json`,
`/content/README.md`, `/content/_sidebar.md`.

## Content

`pnpm run sync` copies `../train/**/*.md` into `public/content/` and
regenerates `manifest.json`, `README.md`, `_sidebar.md`. `dev` and `deploy`
run sync first.

## Public vs private

Docs are **private by default**. Opt a doc into the public zone with
frontmatter:

```markdown
---
visibility: public
---
```

| Zone    | Emitted to                | Served at                 | Access                          |
| ------- | ------------------------- | ------------------------- | ------------------------------- |
| public  | `public/content/<path>`   | `/content/<path>`         | anyone                          |
| private | `public/content/private/` | `/content/private/<path>` | Cloudflare Access JWT, else 403 |

Enforcement is Worker-side (`run_worker_first`), so private files 403 even
if the Access app is missing or misconfigured. `ACCESS_AUD` (wrangler var)
must equal the Access app's AUD tag for private requests to verify; unset
means the private zone is closed to everyone.

`public/content/private/**` is git-crypt encrypted on commit. Public index
files (`manifest.json`, `README.md`, `_sidebar.md`) list public docs only;
the private zone keeps its own index inside `private/` (encrypted in git,
Access-gated on the site). Note: git-crypt never hides filenames - keep
doc filenames non-sensitive.

## Commands

```bash
pnpm install
pnpm run dev       # sync + wrangler dev
pnpm run deploy    # sync + wrangler deploy
pnpm run typecheck
```

## Security

- `public/content/private/**` is git-crypt encrypted. Unlock on a new clone:
  `git-crypt unlock <key-path>/train-docs.git-crypt.key` (key in workspace
  store `config/projects/train-docs/secrets/`).
- Access app `train-docs` (self-hosted) covers
  `train.devartslab.com/content/private` only; policy: Cloudflare account
  members. Worker independently verifies the JWT (`ACCESS_AUD`), so the
  private zone fails closed if the app is removed.

## License

MIT. See [LICENSE](LICENSE).

## Credits

Built by [DevArts Lab](https://github.com/DevArtsLab).
