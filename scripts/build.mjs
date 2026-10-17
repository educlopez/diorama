#!/usr/bin/env node
/**
 * Puts a figure on the bench: `node build.mjs <figure.js> [out.html] [--inline | --lite]`
 * writes one page, bench.html with the kernel and the figure in their slots,
 * and prints where it is. Without a path the page is diorama-<name>.html in
 * the working directory. three.js r128 comes from cdnjs by default; `--inline`
 * pastes the copy in kit/three.min.js instead, for a page with no network at all
 * (about 600 KB more). `--lite` (an option, in beta) pastes kit/three-lite.min.js
 * instead of three.js: the part of three.js the kernel uses, written without a
 * dependency, about 44 KB; the page needs no network either.
 */
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
export const THREE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

export function kernelSource() {
  return readFileSync(here("../kit/diorama.js"), "utf8").replace(/\r\n/g, "\n").trimEnd();
}

/** The minified three-lite, as build.mjs --lite pastes it (scripts/minify-lite.mjs writes it from kit/three-lite.js). */
export function liteSource() {
  return readFileSync(here("../kit/three-lite.min.js"), "utf8").replace(/\r\n/g, "\n").trimEnd();
}

/** The page for a figure's source. The replacements are functions so `$&` in the kernel or the figure is pasted as it is. */
export function assemble(figure, { inline = false, lite = false } = {}) {
  const three = lite
    ? `<script>\n${liteSource()}\n</script>`
    : inline
      ? `<script>\n${readFileSync(here("../kit/three.min.js"), "utf8").trimEnd()}\n</script>`
      : `<script src="${THREE_CDN}"></script>`;
  return readFileSync(here("../bench.html"), "utf8").replace(/\r\n/g, "\n")
    .replace("<!--THREE-->", () => three)
    .replace("/*KERNEL*/", () => `\n${kernelSource()}\n`)
    .replace("/*FIGURE*/", () => `\n${figure.replace(/\r\n/g, "\n").trim()}\n`);
}

/** The figure's name, read from its declaration: the last Diorama.figure({ … }) call. */
export function nameOf(figure) {
  const call = [...figure.matchAll(/\bDiorama\.figure\s*\(\s*\{/g)].at(-1);
  return call ? /\bname:\s*["'`]([a-z][a-z0-9-]*)["'`]/.exec(figure.slice(call.index))?.[1] ?? null : null;
}

export const same = (a, b, platform = process.platform) => platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;

if (process.argv[1] && same(realpathSync(process.argv[1]), realpathSync(here("./build.mjs")))) {
  const args = process.argv.slice(2);
  const inline = args.includes("--inline"), lite = args.includes("--lite");
  const [src, out] = args.filter((a) => !a.startsWith("--"));
  if (!src) {
    console.error("usage: node build.mjs <figure.js> [out.html] [--inline | --lite]");
    process.exit(2);
  }
  const figure = readFileSync(src, "utf8");
  const file = resolve(out ?? `diorama-${nameOf(figure) ?? "figure"}.html`);
  writeFileSync(file, assemble(figure, { inline, lite }));
  console.log(file);
}
