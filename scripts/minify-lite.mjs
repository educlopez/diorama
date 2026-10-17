#!/usr/bin/env node
/**
 * Regenerates kit/three-lite.min.js from kit/three-lite.js: `node minify-lite.mjs`.
 * build.mjs pastes the minified copy into every page, so run this after
 * any change to kit/three-lite.js and commit both files. It needs terser, which
 * the skill does not depend on: it is resolved from the working directory, or
 * from the folder in DIORAMA_TOOLS (any project with terser in node_modules).
 */
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const SRC = here("../kit/three-lite.js"), OUT = here("../kit/three-lite.min.js");

async function terser() {
  for (const dir of [process.env.DIORAMA_TOOLS, process.cwd(), here("..")].filter(Boolean)) {
    try { return await import(pathToFileURL(createRequire(join(dir, "package.json")).resolve("terser")).href); } catch {}
  }
  throw new Error("terser not found: run from a project that has it, or set DIORAMA_TOOLS to one");
}

export async function minifyLite() {
  const src = readFileSync(SRC, "utf8");
  const banner = /^\/\*[\s\S]*?\*\//.exec(src)?.[0] ?? "";
  const { minify } = await terser();
  const r = await minify(src, { ecma: 5, compress: { passes: 2 }, mangle: true, format: { comments: false } });
  if (r.error) throw r.error;
  return `${banner}\n${r.code.trim()}\n`;
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(here("./minify-lite.mjs"))) {
  const out = await minifyLite();
  writeFileSync(OUT, out);
  console.log(`${OUT}: ${out.length} B, ${gzipSync(out, { level: 9 }).length} B gzip`);
}
