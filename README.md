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

## Commands

```bash
pnpm install
pnpm run dev       # sync + wrangler dev
pnpm run deploy    # sync + wrangler deploy
pnpm run typecheck
```

## Security

- `public/content/**` is git-crypt encrypted. Unlock on a new clone:
  `git-crypt unlock <key-path>/train-docs.git-crypt.key` (key in workspace
  store `config/projects/train-docs/secrets/`).
- `train.devartslab.com` sits behind a Cloudflare Access self-hosted app
  (policy: Cloudflare account members).

## License

MIT. See [LICENSE](LICENSE).

## Credits

Built by [DevArts Lab](https://github.com/DevArtsLab).
