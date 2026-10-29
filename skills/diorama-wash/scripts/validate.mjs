#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
export const kernelSource = () => readFileSync(here("../kit/wash.js"), "utf8").replace(/\r\n/g, "\n").trim();
const LINES = 360;
const PAGE_BYTES = 280 * 1024;

export function partsOf(text) {
  const k = text.indexOf("var Wash = (function () {");
  if (k < 0) return { kernel: null, scene: text, page: false };
  const kStart = text.lastIndexOf("<script>", k) + "<script>".length;
  const kEnd = text.indexOf("</script>", k);
  const sStart = text.indexOf("<script>", kEnd) + "<script>".length;
  const sEnd = text.indexOf("</script>", sStart);
  return { kernel: text.slice(kStart, kEnd).trim(), scene: text.slice(sStart, sEnd).trim(), page: true };
}

export function validate(text) {
  const { kernel, scene, page } = partsOf(text.replace(/\r\n/g, "\n"));
  const out = [];
  const check = (n, label, ok, why) => out.push({ n, label, ok: !!ok, why: ok ? "" : why });
  const strip = scene.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\])\/\/[^\n]*/g, "$1");
  const calls = [...strip.matchAll(/\bWash\.scene\s*\(\s*\{/g)];
  const decl = calls.length === 1 ? strip.slice(calls[0].index) : "";
  const str = (key) => new RegExp(`\\b${key}:\\s*(["'\`])((?:\\\\.|(?!\\1).)*)\\1`).exec(decl)?.[2];
  const num = (key) => {
    const m = new RegExp(`\\b${key}:\\s*([0-9.]+)`).exec(decl);
    return m ? Number(m[1]) : null;
  };
  const name = str("name");
  const title = str("title");
  const means = str("means");
  const hint = str("hint");
  const duration = num("duration");
  const still = num("still");
  const why1 = calls.length !== 1 ? `${calls.length} Wash.scene calls`
    : !name || !/^[a-z][a-z0-9-]*$/.test(name) ? `name "${name}" is not lowercase-hyphen`
    : !title ? "no title"
    : !means ? "no means"
    : means.length > 140 ? `means is ${means.length} characters`
    : !/\bpaint\s*(\(|:)/.test(decl) ? "no paint()"
    : !(duration > 0) ? "no positive duration"
    : !(still >= 0 && still < duration) ? `still ${still} is outside the ${duration}s loop`
    : "";
  check(1, "declaration", !why1, why1);
  const clock = /\b(requestAnimationFrame|setTimeout|setInterval|Date\.now|performance\.now|Math\.random)\b/.exec(strip);
  check(2, "clock", !clock, clock && `${clock[1]} in the scene: pose from ctx.t`);
  const whole = page ? text : scene;
  const net = /(\bimport\s*\(|^\s*import\s|\brequire\s*\(|\bfetch\s*\(|XMLHttpRequest|WebSocket|<script[^>]*\ssrc=|<link[^>]*\shref=|url\(\s*["']?(?!data:))/m.exec(page ? whole.replace(kernel || "", "") : strip);
  check(3, "self-contained", !net, net && `${net[1]} loads something at runtime`);
  const url = /https?:\/\/[^\s"'<>)]+/.exec(whole);
  check(4, "no URLs", !url, url && url[0]);
  check(5, "kernel", !page || kernel === kernelSource(), "the page kernel differs from kit/wash.js");
  const lines = scene.split("\n").length;
  const bytes = Buffer.byteLength(text);
  check(6, "size", lines <= LINES && (!page || bytes <= PAGE_BYTES), lines > LINES ? `${lines} lines, limit ${LINES}` : `${bytes} bytes, limit ${PAGE_BYTES}`);
  check(7, "marks", /\bmarks\s*:/.test(strip) || /\bWash\.plate\s*\(/.test(strip), "paint() should return marks, or prepare() a plate");
  check(8, "hint", !!hint && /\bclick\b/i.test(hint), "hint should say what a click does");
  return out;
}

export function report(results) {
  for (const r of results) console.log(`${r.ok ? "ok  " : "FAIL"} ${r.n} ${r.label}${r.ok ? "" : ": " + r.why}`);
  return results.every((r) => r.ok);
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(here("./validate.mjs"))) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error("usage: node validate.mjs <scene.js | wash-name.html> [more]");
    process.exit(2);
  }
  let ok = true;
  for (const f of files) {
    if (files.length > 1) console.log(`# ${f}`);
    ok = report(validate(readFileSync(f, "utf8"))) && ok;
  }
  process.exit(ok ? 0 : 1);
}
