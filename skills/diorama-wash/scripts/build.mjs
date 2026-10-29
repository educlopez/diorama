#!/usr/bin/env node
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n").trim();

export function nameOf(scene) {
  const call = [...scene.matchAll(/\bWash\.scene\s*\(\s*\{/g)].at(-1);
  return call ? /\bname:\s*["'`]([a-z][a-z0-9-]*)["'`]/.exec(scene.slice(call.index))?.[1] ?? null : null;
}

export function titleOf(scene) {
  const call = [...scene.matchAll(/\bWash\.scene\s*\(\s*\{/g)].at(-1);
  const m = call ? /\btitle:\s*(["'`])((?:\\.|(?!\1).)*)\1/.exec(scene.slice(call.index)) : null;
  return m ? m[2].replace(/\\(["'`\\])/g, "$1") : "Wash";
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function assemble(scene) {
  return read(here("../kit/page.html"))
    .replace("/*TITLE*/", () => esc(titleOf(scene)))
    .replace("/*KERNEL*/", () => read(here("../kit/wash.js")))
    .replace("/*SCENE*/", () => scene.replace(/\r\n/g, "\n").trim()) + "\n";
}

export function build(src, out) {
  const scene = readFileSync(src, "utf8");
  const file = resolve(out ?? `wash-${nameOf(scene) ?? "scene"}.html`);
  const html = assemble(scene);
  writeFileSync(file, html);
  return { file, bytes: Buffer.byteLength(html) };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(here("./build.mjs"))) {
  const [src, out] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!src) {
    console.error("usage: node build.mjs <scene.js> [out.html]");
    process.exit(2);
  }
  const { file, bytes } = build(src, out);
  console.log(`${file} (${bytes} bytes)`);
}
