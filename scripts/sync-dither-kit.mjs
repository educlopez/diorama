#!/usr/bin/env node
/**
 * Writes skills/diorama-dither/kit/dither.js from the pixel kernel and the
 * dither finish. The file starts with "GENERATED, do not edit" and the
 * SHA-256 of each source. `--check` compares that result to the file on disk
 * and exits 1 when they differ, without writing.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pixelPath = join(root, "skills/diorama-pixel/kit/pixel.js");
const finishPath = join(root, "skills/diorama-dither/kit-src/finish.js");
const outPath = join(root, "skills/diorama-dither/kit/dither.js");
const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n").trim();
const sha = (s) => createHash("sha256").update(s).digest("hex");

export function generate() {
  if (!existsSync(pixelPath)) {
    console.error("FAIL skills/diorama-pixel/kit/pixel.js is missing.");
    process.exit(1);
  }
  if (!existsSync(finishPath)) {
    console.error("FAIL skills/diorama-dither/kit-src/finish.js is missing.");
    process.exit(1);
  }
  const pixel = read(pixelPath), finish = read(finishPath);
  const header = [
    "/* GENERATED, do not edit.",
    "   sources:",
    `   skills/diorama-pixel/kit/pixel.js ${sha(pixel)}`,
    `   skills/diorama-dither/kit-src/finish.js ${sha(finish)}`,
    "*/",
  ].join("\n");
  return `${header}\n${pixel}\n${finish}\n`;
}

const next = generate();
if (process.argv.includes("--check")) {
  const have = existsSync(outPath) ? readFileSync(outPath, "utf8").replace(/\r\n/g, "\n") : "";
  if (have !== next) {
    console.error("FAIL kit/dither.js is out of date. Run: node scripts/sync-dither-kit.mjs");
    process.exit(1);
  }
  console.log("ok kit/dither.js matches pixel.js + finish.js");
} else {
  writeFileSync(outPath, next);
  console.log(`${outPath} (${Buffer.byteLength(next)} bytes)`);
}
