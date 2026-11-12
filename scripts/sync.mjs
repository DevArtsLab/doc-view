#!/usr/bin/env node
// sync.mjs - copy markdown from local source trees into site/content/ and
// generate viewer inputs (manifest.json, README.md index, _sidebar.md).
// REMOTE_SOURCES are listed (never copied): the Worker proxies them live.
//
// Privacy model: files are public by default. Opt a doc into the private
// zone with frontmatter:  ---\nvisibility: private\n---  Private docs are
// emitted under content/private/ (Access-gated at the edge and in the
// Worker) and git-crypt encrypted in this repo.
//
// Usage: node scripts/sync.mjs   (sources are the SOURCES list below)

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = join(root, "site/content");
const PRIVATE = "private";

// Source trees: dir (relative to repo root) -> prefix prepended to emitted
// paths. Order controls sidebar grouping.
const SOURCES = [{ dir: "../documents", prefix: "" }];

// Remote sources are never copied: the Worker proxies GitHub raw at
// request time (edge-cached). Sync reads the file list + frontmatter
// only so indexes can list the docs. Keep repo/branch in sync with
// FOUNDATION_RAW_BASE in wrangler.jsonc.
const REMOTE_SOURCES = [
  { repo: "DevArtsLab/foundation", branch: "v1", prefix: "foundation/" },
];

const FM_RE = /^---\n([\s\S]*?)\n---\n?/;
const frontmatter = (text) => {
  const m = FM_RE.exec(text);
  if (!m) return { attrs: {}, body: text };
  const attrs = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) attrs[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { attrs, body: text.slice(m[0].length) };
};

const titleOf = (body, p) => {
  const head = body.split("\n").find((l) => l.startsWith("# "));
  return head ? head.slice(2).trim() : basename(p, ".md");
};

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const entries = [];
for (const source of SOURCES) {
  const src = resolve(root, source.dir);
  if (!existsSync(src)) {
    console.log(`sync: skipping missing source ${src}`);
    continue;
  }
  const docs = [];
  (function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (entry.endsWith(".md")) docs.push(p);
    }
  })(src);
  docs.sort();

  for (const p of docs) {
    const rel = source.prefix + relative(src, p).split("\\").join("/");
    const { attrs, body } = frontmatter(readFileSync(p, "utf8"));
    const visibility = attrs.visibility === "private" ? "private" : "public";
    const relOut = visibility === "private" ? `${PRIVATE}/${rel}` : rel;
    const dest = join(out, relOut);
    mkdirSync(resolve(dest, ".."), { recursive: true });
    writeFileSync(dest, body);
    entries.push({
      path: relOut,
      srcPath: rel,
      title: titleOf(body, p),
      visibility,
      group: source.prefix.replace(/\/$/, "") || "train",
    });
  }
}

for (const source of REMOTE_SOURCES) {
  const api = `https://api.github.com/repos/${source.repo}/git/trees/${source.branch}?recursive=1`;
  const res = await fetch(api, { headers: { "user-agent": "train-docs-sync" } });
  if (!res.ok) {
    console.log(`sync: skipping ${source.repo} (${res.status} ${api})`);
    continue;
  }
  const tree = await res.json();
  if (tree.truncated) console.log(`sync: warning ${source.repo} tree truncated`);
  const paths = tree.tree
    .filter((t) => t.type === "blob" && t.path.endsWith(".md"))
    .map((t) => t.path)
    .sort();
  const docs = await Promise.all(
    paths.map(async (p) => ({
      rel: source.prefix + p,
      text: await (
        await fetch(
          `https://raw.githubusercontent.com/${source.repo}/${source.branch}/${p}`,
        )
      ).text(),
    })),
  );
  for (const doc of docs) {
    const { attrs, body } = frontmatter(doc.text);
    const visibility = attrs.visibility === "private" ? "private" : "public";
    entries.push({
      path: visibility === "private" ? `${PRIVATE}/${doc.rel}` : doc.rel,
      srcPath: doc.rel,
      title: titleOf(body, doc.rel),
      visibility,
      group: source.prefix.replace(/\/$/, "") || "train",
    });
  }
}

const pub = entries.filter((e) => e.visibility === "public");
const priv = entries.filter((e) => e.visibility === "private");
const generated = new Date().toISOString();

const groupIndex = (list, tmpl) => {
  const groups = [...new Set(list.map((e) => e.group))];
  return groups
    .map(
      (g) =>
        `## ${g}\n\n` +
        list
          .filter((e) => e.group === g)
          .map((e) => tmpl(e))
          .join("\n"),
    )
    .join("\n\n");
};

// Public indexes list public docs only: private titles/paths must not leak
// into plaintext files (repo is public; /content/manifest.json is served open).
writeFileSync(
  join(out, "manifest.json"),
  JSON.stringify({ generated, docs: pub }, null, 2) + "\n",
);
writeFileSync(
  join(out, "README.md"),
  ["# train", "", groupIndex(pub, (e) => `- [${e.title}](${e.path})`), ""].join("\n"),
);
writeFileSync(
  join(out, "_sidebar.md"),
  groupIndex(pub, (e) => `- [${e.title}](${e.path})`) + "\n",
);

if (priv.length) {
  // Private indexes live inside the gated zone; paths are relative to it.
  writeFileSync(
    join(out, PRIVATE, "manifest.json"),
    JSON.stringify(
      { generated, docs: priv.map((e) => ({ ...e, path: e.srcPath })) },
      null,
      2,
    ) + "\n",
  );
  writeFileSync(
    join(out, PRIVATE, "README.md"),
    [
      "# train (private)",
      "",
      groupIndex(priv, (e) => `- [${e.title}](${e.srcPath})`),
      "",
    ].join("\n"),
  );
  writeFileSync(
    join(out, PRIVATE, "_sidebar.md"),
    groupIndex(priv, (e) => `- [${e.title}](${e.srcPath})`) + "\n",
  );
}

console.log(`sync: ${pub.length} public, ${priv.length} private doc(s)`);
for (const e of entries) console.log(`  [${e.visibility}] ${e.srcPath}`);
