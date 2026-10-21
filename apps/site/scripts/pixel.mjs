#!/usr/bin/env node
/**
 * The prebuild for the pixel skill: every scene in ../../skills/diorama-pixel/examples
 * becomes public/pixel/<name>.html (the skill's own build: the kernel, the scene and
 * the page, nothing to load), and lib/pixel.json lists them with what the site shows.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assemble, nameOf } from "../../../skills/diorama-pixel/scripts/build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const EXAMPLES = here("../../../skills/diorama-pixel/examples");
const OUT = here("../public/pixel");
const ORDER = ["flower-stall", "pier", "allotment"];
const field = (src, key) => new RegExp(`\\b${key}:\\s*(["'\`])((?:\\\\.|(?!\\1).)*)\\1`).exec(src)?.[2] ?? null;
const num = (src, key) => Number(new RegExp(`\\b${key}:\\s*([0-9.]+)`).exec(src)?.[1] ?? 0);

mkdirSync(OUT, { recursive: true });
const scenes = [];
for (const file of readdirSync(EXAMPLES).filter((f) => f.endsWith(".js"))) {
  const src = readFileSync(join(EXAMPLES, file), "utf8");
  const name = nameOf(src) ?? file.replace(/\.js$/, "");
  const html = assemble(src);
  writeFileSync(join(OUT, `${name}.html`), html);
  const head = src.slice(0, src.indexOf("build:"));
  scenes.push({ name, title: field(head, "title"), means: field(head, "means"), hint: field(head, "hint"), duration: num(head, "duration"), bytes: Buffer.byteLength(html), lines: src.split("\n").length });
}
const rank = (n) => { const i = ORDER.indexOf(n); return i < 0 ? ORDER.length : i; };
scenes.sort((a, b) => rank(a.name) - rank(b.name));
writeFileSync(here("../lib/pixel.json"), JSON.stringify(scenes, null, 2) + "\n");
console.log(`${scenes.length} pixel scenes → public/pixel, lib/pixel.json`);
