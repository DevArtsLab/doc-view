#!/usr/bin/env node
// sync.mjs - copy markdown from the train/ tree into public/content/ and
// generate viewer inputs (manifest.json, README.md index, _sidebar.md).
//
// Privacy model: files are private by default. Opt a doc into the public
// zone with frontmatter:  ---\nvisibility: public\n---  Everything else is
// emitted under content/private/ (Access-gated at the edge and in the
// Worker) and git-crypt encrypted in this repo.
//
// Usage: node scripts/sync.mjs [src-dir]   (default: ../train)

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = resolve(process.argv[2] ?? join(root, "../train"));
const out = join(root, "public/content");
const PRIVATE = "private";

if (!existsSync(src)) {
  console.error(`sync: source dir missing: ${src}`);
  process.exit(1);
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

const entries = docs.map((p) => {
  const rel = relative(src, p).split("\\").join("/");
  const { attrs, body } = frontmatter(readFileSync(p, "utf8"));
  const visibility = attrs.visibility === "public" ? "public" : "private";
  const relOut = visibility === "private" ? `${PRIVATE}/${rel}` : rel;
  const dest = join(out, relOut);
  mkdirSync(resolve(dest, ".."), { recursive: true });
  writeFileSync(dest, body);
  return { path: relOut, srcPath: rel, title: titleOf(body, p), visibility };
});

const pub = entries.filter((e) => e.visibility === "public");
const priv = entries.filter((e) => e.visibility === "private");

writeFileSync(
  join(out, "manifest.json"),
  JSON.stringify({ generated: new Date().toISOString(), docs: entries }, null, 2) +
    "\n",
);

writeFileSync(
  join(out, "README.md"),
  [
    "# train",
    "",
    ...pub.map((e) => `- [${e.title}](${e.path})`),
    ...priv.map((e) => `- [${e.title}](${e.path}) :lock:`),
    "",
  ].join("\n"),
);

// docsify sidebar convention: public zone lists everything (private marked),
// private zone lists only private docs.
writeFileSync(
  join(out, "_sidebar.md"),
  [
    ...pub.map((e) => `- [${e.title}](${e.path})`),
    ...priv.map((e) => `- [${e.title}](${e.path}) :lock:`),
  ].join("\n") + "\n",
);
if (priv.length) {
  writeFileSync(
    join(out, PRIVATE, "_sidebar.md"),
    priv.map((e) => `- [${e.title}](${e.srcPath})`).join("\n") + "\n",
  );
  writeFileSync(
    join(out, PRIVATE, "manifest.json"),
    JSON.stringify({ generated: new Date().toISOString(), docs: priv }, null, 2) + "\n",
  );
}

console.log(`sync: ${pub.length} public, ${priv.length} private doc(s) from ${src}`);
for (const e of entries) console.log(`  [${e.visibility}] ${e.srcPath}`);
