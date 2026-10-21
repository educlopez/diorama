#!/usr/bin/env node
/**
 * Puts a scene on the page: `node build.mjs <scene.js> [out.html]` writes one
 * self-contained HTML file (kit/page.html with the kernel and the scene in
 * their slots) and prints its path and size. Without a path the page is
 * pixel-<name>.html in the working directory. No dependency, no network.
 */
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n").trim();

export function nameOf(scene) {
  const call = [...scene.matchAll(/\bPixel\.scene\s*\(\s*\{/g)].at(-1);
  return call ? /\bname:\s*["'`]([a-z][a-z0-9-]*)["'`]/.exec(scene.slice(call.index))?.[1] ?? null : null;
}
const titleOf = (scene) => /\btitle:\s*["'`]([^"'`]+)["'`]/.exec(scene)?.[1] ?? "Pixel diorama";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function assemble(scene) {
  return read(here("../kit/page.html"))
    .replace("/*TITLE*/", () => esc(titleOf(scene)))
    .replace("/*KERNEL*/", () => read(here("../kit/pixel.js")))
    .replace("/*SCENE*/", () => scene.replace(/\r\n/g, "\n").trim()) + "\n";
}

export function build(src, out) {
  const scene = readFileSync(src, "utf8");
  const file = resolve(out ?? `pixel-${nameOf(scene) ?? "scene"}.html`);
  const html = assemble(scene);
  writeFileSync(file, html);
  return { file, bytes: Buffer.byteLength(html) };
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(here("./build.mjs"))) {
  const [src, out] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  if (!src) { console.error("usage: node build.mjs <scene.js> [out.html]"); process.exit(2); }
  const { file, bytes } = build(src, out);
  console.log(`${file} (${bytes} bytes)`);
}
