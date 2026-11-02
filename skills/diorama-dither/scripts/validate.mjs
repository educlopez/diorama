#!/usr/bin/env node
/**
 * Checks a scene source or a built page: `node validate.mjs <name>.js` or
 * `node validate.mjs dither-<name>.html`. Prints one line per check, `ok` or
 * `FAIL`, and exits 1 on any failure. No browser needed. The checks:
 *
 *  1 declaration    exactly one Pixel.scene({ ... }); name lowercase-hyphen;
 *                   title; means of at most 140 characters; build() and tick();
 *                   a positive duration and a still inside the loop.
 *  2 resolution     360 x 280, or 480 x 360 when the yard needs the larger frame.
 *  3 clock          no requestAnimationFrame, setTimeout, setInterval,
 *                   Date.now, performance.now or Math.random in the scene.
 *  4 self-contained no import, require, fetch, XMLHttpRequest, WebSocket,
 *                   <script src>, <link href> or url() in the page or the scene.
 *  5 no URLs        no http(s) address anywhere in the page or the scene.
 *  6 kernel         the kernel in a built page is kit/dither.js, byte for byte.
 *  7 size           a scene of at most 260 lines. A .js is assembled into the
 *                   page, and that page is at most 71680 bytes, same <= as look.
 *                   A pass prints how many bytes are left of 71680. If that
 *                   build throws, the report is one line and the run exits 1.
 *                   No stack.
 *  8 pointer        parts.hot is set, the scene source contains `.name =`
 *                   (comments stripped; a name: field on folk does not count),
 *                   and a hint tells a visitor what to hover and tap.
 *  9 renderer       no three.js and no WebGL: the kernel draws on a 2D canvas.
 */
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assemble } from "./build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
export const kernelSource = () => readFileSync(here("../kit/dither.js"), "utf8").replace(/\r\n/g, "\n").trim();
const LINES = 260, PAGE_BYTES = 70 * 1024;

export function partsOf(text) {
  const k = text.indexOf("var Pixel = (function ()");
  if (k < 0) return { kernel: null, scene: text, page: false };
  const kStart = text.lastIndexOf("<script>", k) + "<script>".length, kEnd = text.indexOf("</script>", k);
  const sStart = text.indexOf("<script>", kEnd) + "<script>".length, sEnd = text.indexOf("</script>", sStart);
  return { kernel: text.slice(kStart, kEnd).trim(), scene: text.slice(sStart, sEnd).trim(), page: true };
}

export function validate(text) {
  const { kernel, scene, page } = partsOf(text.replace(/\r\n/g, "\n"));
  const out = [], check = (n, label, ok, why, note) => out.push({ n, label, ok: !!ok, why: ok ? "" : why, note: note || "" });
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

  const w = num("width"), h = num("height");
  const frameOk = (w === 360 && h === 280) || (w === 480 && h === 360);
  check(2, "resolution", frameOk, `${w} x ${h}, the finish is 360 x 280 or 480 x 360`);

  const clock = /\b(requestAnimationFrame|setTimeout|setInterval|Date\.now|performance\.now|Math\.random)\b/.exec(strip);
  check(3, "clock", !clock, clock && `${clock[1]} in the scene: pose from ctx.t in tick (and P.hash for variety)`);

  const whole = page ? text : scene;
  const net = /(\bimport\s*\(|^\s*import\s|\brequire\s*\(|\bfetch\s*\(|XMLHttpRequest|WebSocket|<script[^>]*\ssrc=|<link[^>]*\shref=|url\(\s*["']?(?!data:))/m.exec(page ? whole.replace(kernel || "", "") : strip);
  check(4, "self-contained", !net, net && `${net[1]} loads something at runtime`);

  const url = /https?:\/\/[^\s"'<>)]+/.exec(whole);
  check(5, "no URLs", !url, url && url[0]);

  check(6, "kernel", !page || kernel === kernelSource(), "the page's kernel differs from kit/dither.js: rebuild with scripts/build.mjs");

  const lines = scene.split("\n").length;
  let builtPage = page ? text : "";
  if (!page) {
    try { builtPage = assemble(scene); }
    catch (err) {
      const why = String(err && err.message || err).split(/\r?\n/)[0];
      return [{ n: 7, label: "size", ok: false, why: "page build failed: " + why }];
    }
  }
  const pageBytes = Buffer.byteLength(builtPage);
  const left = PAGE_BYTES - pageBytes;
  const leftNote = `${left} bytes left of ${PAGE_BYTES}`;
  const bits = [];
  if (lines > LINES) bits.push(`${lines} lines, limit ${LINES}; ${leftNote}`);
  if (pageBytes > PAGE_BYTES) bits.push(`built page ${pageBytes} bytes, limit ${PAGE_BYTES}; ${-left} bytes over`);
  check(7, "size", !bits.length, bits.join("; "), leftNote);

  const hot = /\bhot\s*[:=]/.test(strip), named = /\.name\s*=/.test(strip);
  check(8, "pointer", hot && named && !!hint, !hot ? "set parts.hot to the groups the pointer may pick" : !named ? "the scene source needs .name = for the read-out; a name: option does not count" : "add a hint: what to hover, what to tap");

  const three = /\bTHREE\.\w+|Three\.js Authors|getContext\s*\(\s*["']webgl/.test(whole);
  check(9, "renderer", !three, "three.js or WebGL found: the kernel draws on a 2D canvas");
  return out;
}

export function report(results) {
  for (const r of results) {
    const tail = r.ok ? (r.note ? ": " + r.note : "") : ": " + r.why;
    console.log(`${r.ok ? "ok  " : "FAIL"} ${r.n} ${r.label}${tail}`);
  }
  return results.every((r) => r.ok);
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(here("./validate.mjs"))) {
  const files = process.argv.slice(2);
  if (!files.length) { console.error("usage: node validate.mjs <name.js | dither-name.html> [more files]"); process.exit(2); }
  let ok = true;
  for (const f of files) { if (files.length > 1) console.log(`# ${f}`); ok = report(validate(readFileSync(f, "utf8"))) && ok; }
  process.exit(ok ? 0 : 1);
}
