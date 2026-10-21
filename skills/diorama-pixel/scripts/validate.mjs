#!/usr/bin/env node
/**
 * Checks a scene source or a built page: `node validate.mjs <name>.js` or
 * `node validate.mjs pixel-<name>.html`. Prints one line per check, `ok` or
 * `FAIL`, and exits 1 on any failure. No browser needed. The checks:
 *
 *  1 declaration    exactly one Pixel.scene({ ... }); name lowercase-hyphen;
 *                   title; means of at most 140 characters; build() and tick();
 *                   a positive duration and a still inside the loop.
 *  2 resolution     width at most 480 and height at most 360: the look is
 *                   pixels, and the frame cost grows with every one.
 *  3 clock          no requestAnimationFrame, setTimeout, setInterval,
 *                   Date.now, performance.now or Math.random in the scene: all
 *                   motion is posed from ctx.t / ctx.q in tick, so any second can
 *                   be drawn again exactly (the still frame, the loop seam).
 *  4 self-contained no import, require, fetch, XMLHttpRequest, WebSocket,
 *                   <script src>, <link href> or url() in the page or the scene.
 *  5 no URLs        no http(s) address anywhere in the page or the scene.
 *  6 kernel         the kernel in a built page is kit/pixel.js, byte for byte.
 *  7 size           a scene of at most 260 lines; a built page of at most 120 KB.
 *  8 pointer        parts.hot is set, each hot group has a .name, and a hint
 *                   tells a visitor what to hover and tap.
 *  9 renderer       no three.js and no WebGL: the kernel draws on a 2D canvas.
 */
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
export const kernelSource = () => readFileSync(here("../kit/pixel.js"), "utf8").replace(/\r\n/g, "\n").trim();
const LINES = 260, PAGE_BYTES = 120 * 1024;

/** Splits a built page into its kernel and scene, or takes a scene source as it is. */
export function partsOf(text) {
  const k = text.indexOf("var Pixel = (function ()");
  if (k < 0) return { kernel: null, scene: text, page: false };
  const kStart = text.lastIndexOf("<script>", k) + "<script>".length, kEnd = text.indexOf("</script>", k);
  const sStart = text.indexOf("<script>", kEnd) + "<script>".length, sEnd = text.indexOf("</script>", sStart);
  return { kernel: text.slice(kStart, kEnd).trim(), scene: text.slice(sStart, sEnd).trim(), page: true };
}

export function validate(text) {
  const { kernel, scene, page } = partsOf(text.replace(/\r\n/g, "\n"));
  const out = [], check = (n, label, ok, why) => out.push({ n, label, ok: !!ok, why: ok ? "" : why });
  const strip = scene.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/[^\n]*/g, "$1");

  const calls = [...strip.matchAll(/\bPixel\.scene\s*\(\s*\{/g)];
  const decl = calls.length === 1 ? strip.slice(calls[0].index) : "";
  const str = (key) => new RegExp(`\\b${key}:\\s*(["'\`])((?:\\\\.|(?!\\1).)*)\\1`).exec(decl)?.[2];
  const num = (key) => { const m = new RegExp(`\\b${key}:\\s*([0-9.]+)`).exec(decl); return m ? Number(m[1]) : null; };
  const name = str("name"), title = str("title"), means = str("means"), hint = str("hint");
  const duration = num("duration"), still = num("still");
  const why1 = calls.length !== 1 ? `${calls.length} Pixel.scene calls` : !name || !/^[a-z][a-z0-9-]*$/.test(name) ? `name "${name}" is not lowercase-hyphen`
    : !title ? "no title" : !means ? "no means" : means.length > 140 ? `means is ${means.length} chars` : !/\bbuild\s*(\(|:)/.test(decl) ? "no build()"
    : !/\btick\s*(\(|:)/.test(decl) ? "no tick()" : !(duration > 0) ? "no positive duration" : still != null && !(still >= 0 && still < duration) ? `still ${still} is outside the ${duration} s loop` : "";
  check(1, "declaration", !why1, why1);

  const w = num("width") ?? 320, h = num("height") ?? 240;
  check(2, "resolution", w <= 480 && h <= 360, `${w} x ${h}, limit 480 x 360`);

  const clock = /\b(requestAnimationFrame|setTimeout|setInterval|Date\.now|performance\.now|Math\.random)\b/.exec(strip);
  check(3, "clock", !clock, clock && `${clock[1]} in the scene: pose from ctx.t in tick (and P.hash for variety)`);

  const whole = page ? text : scene;
  const net = /(\bimport\s*\(|^\s*import\s|\brequire\s*\(|\bfetch\s*\(|XMLHttpRequest|WebSocket|<script[^>]*\ssrc=|<link[^>]*\shref=|url\(\s*["']?(?!data:))/m.exec(page ? whole.replace(kernel || "", "") : strip);
  check(4, "self-contained", !net, net && `${net[1]} loads something at runtime`);

  const url = /https?:\/\/[^\s"'<>)]+/.exec(whole);
  check(5, "no URLs", !url, url && url[0]);

  check(6, "kernel", !page || kernel === kernelSource(), "the page's kernel differs from kit/pixel.js: rebuild with scripts/build.mjs");

  const lines = scene.split("\n").length, bytes = Buffer.byteLength(text);
  check(7, "size", lines <= LINES && (!page || bytes <= PAGE_BYTES), lines > LINES ? `${lines} lines, limit ${LINES}` : `${bytes} bytes, limit ${PAGE_BYTES}`);

  const hot = /\bhot\s*[:=]/.test(strip), named = /\.name\s*=/.test(strip);
  check(8, "pointer", hot && named && !!hint, !hot ? "set parts.hot to the groups the pointer may pick" : !named ? "give each hot group a .name for the read-out" : "add a hint: what to hover, what to tap");

  const three = /\bTHREE\.\w+|Three\.js Authors|getContext\s*\(\s*["']webgl/.test(whole);
  check(9, "renderer", !three, "three.js or WebGL found: the kernel draws on a 2D canvas");
  return out;
}

export function report(results) {
  for (const r of results) console.log(`${r.ok ? "ok  " : "FAIL"} ${r.n} ${r.label}${r.ok ? "" : ": " + r.why}`);
  return results.every((r) => r.ok);
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(here("./validate.mjs"))) {
  const files = process.argv.slice(2);
  if (!files.length) { console.error("usage: node validate.mjs <name.js | pixel-name.html> [more files]"); process.exit(2); }
  let ok = true;
  for (const f of files) { if (files.length > 1) console.log(`# ${f}`); ok = report(validate(readFileSync(f, "utf8"))) && ok; }
  process.exit(ok ? 0 : 1);
}
