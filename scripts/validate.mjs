#!/usr/bin/env node
/**
 * Checks a built page, or a figure source: `node validate.mjs diorama-<name>.html`
 * or `node validate.mjs <name>.js`. Prints one line per check, `ok` or
 * `FAIL`, and exits 1 on any failure. The checks, each a rule a figure is
 * rejected for breaking:
 *
 *  1 declaration   exactly one Diorama.figure({ … }); name lowercase-hyphen;
 *                  size one of hero, card, mini; means a sentence of ≤140 chars;
 *                  build() and tick() both present (a diorama moves).
 *  2 length        the figure stays one idea: ≤ 420 lines for a hero,
 *                  ≤ 240 for a card, ≤ 150 for a mini.
 *  3 clock         no requestAnimationFrame, setTimeout, setInterval or
 *                  CSS animation in the figure: all motion runs in tick(ctx).
 *  4 self-contained no import, fetch, XMLHttpRequest, WebSocket or extra
 *                  <script src> beyond three.js; nothing loads at runtime.
 *  5 kernel        the kernel in the page is the kit's, byte for byte.
 *  6 words         D.label calls: none in a mini or a card, at most one in a
 *                  hero, and only when the product asked for its mark. Words
 *                  belong under the stage, not inside the scene.
 *  7 colours       distinct hex colours written into the figure: ≤ 6 in a
 *                  mini, ≤ 10 in a card, ≤ 14 in a hero. The palette carries
 *                  the rest (pal.cobalt, pal.safety, …).
 *  8 base          the scene stands on a D.slab (the diorama base) so the
 *                  shadows have somewhere to land.
 *  9 pointer       a hero or card answers the pointer somewhere: it reads
 *                  ctx.pointer, ctx.hover, ctx.pressed or ctx.active, or sets
 *                  parts.hot. A mini may rely on the camera tilt alone.
 * 10 renderer      a built page carries one renderer: three-lite (the default),
 *                  or three.js r128 (the cdnjs script with --three, or inlined
 *                  with --inline), never both and never neither. A lite page
 *                  has no script src.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { kernelSource, THREE_CDN } from "./build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const LINES = { hero: 420, card: 240, mini: 150 };
const LABELS = { hero: 1, card: 0, mini: 0 };
const COLOURS = { hero: 14, card: 10, mini: 6 };

/** Splits a built page into its kernel and figure, or takes a figure source as it is. */
/** The kernel's body: from its `var Diorama` to its closing `})();`, comment and module line left out. */
export function kernelBody(text) {
  const a = text.indexOf("var Diorama = (function ()"), b = text.lastIndexOf("})();");
  return a < 0 || b < 0 ? null : text.slice(a, b + 5);
}

export function partsOf(text) {
  const k = text.indexOf("var Diorama = (function ()");
  if (k < 0) return { kernel: null, figure: text, page: false };
  const kEnd = text.indexOf("</script>", k);
  const kernel = kernelBody(text.slice(k, kEnd));
  const fStart = text.indexOf("<script>", kEnd) + "<script>".length;
  const fEnd = text.indexOf("</script>", fStart);
  return { kernel, figure: text.slice(fStart, fEnd).trim(), page: true, text };
}

export function validate(text) {
  const { kernel, figure, page } = partsOf(text);
  const out = [];
  const check = (n, label, ok, why) => out.push({ n, label, ok, why });
  const strip = figure.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/[^\n]*/g, "$1");

  const calls = [...strip.matchAll(/\bDiorama\.figure\s*\(\s*\{/g)];
  const decl = calls.length === 1 ? strip.slice(calls[0].index) : "";
  const name = /\bname:\s*["'`]([^"'`]*)["'`]/.exec(decl)?.[1];
  const size = /\bsize:\s*["'`]([^"'`]*)["'`]/.exec(decl)?.[1];
  const means = /\bmeans:\s*["'`]([^"'`]*)["'`]/.exec(decl)?.[1];
  const hasBuild = /\bbuild\s*(\(|:)/.test(decl), hasTick = /\btick\s*(\(|:)/.test(decl);
  const declOk = calls.length === 1 && !!name && /^[a-z][a-z0-9-]*$/.test(name) && ["hero", "card", "mini"].includes(size) && !!means && means.length <= 140 && hasBuild && hasTick;
  check(1, "declaration", declOk, calls.length !== 1 ? `${calls.length} Diorama.figure calls` : !name ? "no name" : !/^[a-z][a-z0-9-]*$/.test(name) ? `name "${name}" is not lowercase-hyphen` : !["hero", "card", "mini"].includes(size) ? `size "${size}"` : !means ? "no means" : means.length > 140 ? `means is ${means.length} chars` : !hasBuild ? "no build()" : !hasTick ? "no tick()" : "");
  const s = ["hero", "card", "mini"].includes(size) ? size : "card";

  const lines = figure.split("\n").length;
  check(2, "length", lines <= LINES[s], `${lines} lines, limit ${LINES[s]} for a ${s}`);

  const clock = /\b(requestAnimationFrame|setTimeout|setInterval|@keyframes)\b/.exec(strip);
  check(3, "clock", !clock, clock ? `${clock[1]} in the figure` : "");

  const net = /\b(import\s*\(|^\s*import\s|fetch\s*\(|XMLHttpRequest|WebSocket|document\.createElement\s*\(\s*["']script)/m.exec(strip);
  let extra = null;
  if (page) { const srcs = [...text.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/g)].map((m) => m[1]).filter((u) => u !== THREE_CDN); extra = srcs[0] || null; }
  check(4, "self-contained", !net && !extra, net ? `${net[1] || net[0]} in the figure` : extra ? `<script src="${extra}">` : "");

  if (page) check(5, "kernel", kernel === kernelBody(kernelSource()), "the page's kernel differs from kit/diorama.js");
  else check(5, "kernel", true, "");

  const labels = (strip.match(/\bD\.label\s*\(/g) || []).length;
  check(6, "words", labels <= LABELS[s], `${labels} D.label calls, limit ${LABELS[s]} for a ${s}`);

  const hexes = new Set((strip.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) || []).map((h) => h.toLowerCase()));
  check(7, "colours", hexes.size <= COLOURS[s], `${hexes.size} hex colours in the figure, limit ${COLOURS[s]} for a ${s}`);

  check(8, "base", /\bD\.slab\s*\(/.test(strip), "no D.slab: the scene needs a base");

  const answers = /\bctx\.(pointer|hover|pressed|active)\b|\bhot\s*[:=]/.test(strip);
  const named = !/\bhot\s*[:=]/.test(strip) || /\.name\s*=/.test(strip);
  check(9, "pointer", s === "mini" || (answers && named), !answers ? "a hero or card should read ctx.pointer / ctx.hover or set parts.hot" : "hot groups need a .name for the read-out");

  if (page) {
    const r = renderersOf(text), n = r.cdn + r.three + r.lite;
    check(10, "renderer", n === 1, n === 0 ? "no three.js and no three-lite in the page" : r.lite && (r.cdn || r.three) ? "a lite page also carries three.js: build it without --three or --inline" : r.cdn && r.three ? "three.js is both linked from cdnjs and inlined" : "more than one renderer in the page");
  } else check(10, "renderer", true, "");

  return out;
}

/** How many times each renderer is in a built page: the cdnjs script, three.js inlined, three-lite inlined. */
export function renderersOf(text) {
  return {
    cdn: [...text.matchAll(/<script[^>]*\ssrc=["']([^"']+)["']/g)].filter((m) => m[1] === THREE_CDN).length,
    three: [...text.matchAll(/Copyright 2010-20\d\d Three\.js Authors/g)].length,
    lite: [...text.matchAll(/\bREVISION:\s*["']128-lite["']/g)].length,
  };
}

export function report(results) {
  for (const r of results) console.log(`${r.ok ? "ok  " : "FAIL"} ${r.n} ${r.label}${r.ok || !r.why ? "" : ": " + r.why}`);
  return results.every((r) => r.ok);
}

if (process.argv[1] && fileURLToPath(new URL(process.argv[1], "file://")) === here("./validate.mjs") || process.argv[1]?.endsWith("validate.mjs")) {
  const [src] = process.argv.slice(2);
  if (!src) { console.error("usage: node validate.mjs <diorama-name.html | name.js>"); process.exit(2); }
  process.exit(report(validate(readFileSync(src, "utf8"))) ? 0 : 1);
}
