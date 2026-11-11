#!/usr/bin/env node
// sync.mjs - copy markdown from the train/ tree into public/content/ and
// generate viewer inputs (manifest.json, README.md index, _sidebar.md).
//
// Usage: node scripts/sync.mjs [src-dir]   (default: ../train)

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = resolve(process.argv[2] ?? join(root, "../train"));
const out = join(root, "public/content");

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

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const doc of docs) {
  const rel = relative(src, doc);
  const dest = join(out, rel);
  mkdirSync(resolve(dest, ".."), { recursive: true });
  cpSync(doc, dest);
}

const titleOf = (p) => {
  const head = readFileSync(p, "utf8").split("\n").find((l) => l.startsWith("# "));
  return head ? head.slice(2).trim() : basename(p, ".md");
};

const entries = docs.map((p) => {
  const rel = relative(src, p).split("\\").join("/");
  return { path: rel, title: titleOf(p) };
});

writeFileSync(
  join(out, "manifest.json"),
  JSON.stringify({ generated: new Date().toISOString(), docs: entries }, null, 2) + "\n",
);

// Generic index page (docsify homepage; usable by any viewer).
writeFileSync(
  join(out, "README.md"),
  ["# train", "", ...entries.map((e) => `- [${e.title}](${e.path})`), ""].join("\n"),
);

// docsify sidebar convention.
writeFileSync(
  join(out, "_sidebar.md"),
  entries.map((e) => `- [${e.title}](${e.path})`).join("\n") + "\n",
);

console.log(`sync: ${entries.length} doc(s) from ${src} -> ${out}`);
for (const e of entries) console.log(`  ${e.path}`);
