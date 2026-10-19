#!/usr/bin/env node
/**
 * The prebuild: every figure in ../../examples becomes a page in
 * public/examples/<name>.html (the skill's own build: the SVG kernel, the
 * figure and the bench, nothing to load), and lib/figures.json lists them with
 * what the site needs to show: name, size, theme, title, means, hint and the
 * line count.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assemble, nameOf } from "../../../scripts/build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const EXAMPLES = here("../../../examples");
const OUT = here("../public/examples");
const ORDER = ["town", "powder", "island", "farm", "warehouse", "cafe", "launchpad", "server", "rack", "mailbox", "seedling", "desk", "turntable"];

const field = (src, key) => new RegExp(`\\b${key}:\\s*["'\`]([^"'\`]*)["'\`]`).exec(src)?.[1] ?? null;
const themeOf = (src) => {
  const m = /\btheme:\s*(\{[^}]*\}|["'`][a-z]+["'`])/.exec(src);
  if (!m) return { base: "toy", accent: null };
  const t = m[1];
  if (t.startsWith("{")) return { base: field(t, "base") ?? "toy", accent: field(t, "accent") };
  return { base: t.slice(1, -1), accent: null };
};

mkdirSync(OUT, { recursive: true });
const figures = [];
for (const file of readdirSync(EXAMPLES).filter((f) => f.endsWith(".js"))) {
  const src = readFileSync(join(EXAMPLES, file), "utf8");
  const name = nameOf(src) ?? file.replace(/\.js$/, "");
  writeFileSync(join(OUT, `${name}.html`), assemble(src));
  const head = src.slice(0, src.indexOf("build:"));
  figures.push({
    name, size: field(head, "size") ?? "card", title: field(head, "title"), means: field(head, "means"), hint: field(head, "hint"), theme: themeOf(head),
    lines: src.split("\n").length, blurb: (/^\/\*\s*[a-z-]+\s*·\s*([\s\S]*?)\*\//.exec(src)?.[1] ?? "").replace(/\s+/g, " ").trim(),
  });
}
figures.sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name));
writeFileSync(here("../lib/figures.json"), JSON.stringify(figures, null, 2) + "\n");
console.log(`${figures.length} figures → public/examples, lib/figures.json`);
