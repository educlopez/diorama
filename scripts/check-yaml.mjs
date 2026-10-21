#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { lstatSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const skip = new Set([".git", "node_modules", ".next", "work"]);

function loadParse() {
  const dir = mkdtempSync(join(tmpdir(), "diorama-yaml-"));
  const install = spawnSync("npm", ["install", "--silent", "--prefix", dir, "yaml@2.9.1"], {
    stdio: ["ignore", "pipe", "inherit"],
  });
  if (install.status !== 0) process.exit(install.status ?? 1);
  return createRequire(join(dir, "package.json"))("yaml").parse;
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    if (skip.has(name)) continue;
    const path = join(dir, name);
    const st = lstatSync(path);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) walk(path, out);
    else out.push(path);
  }
  return out;
}

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : null;
}

const parse = loadParse();
const files = walk(root);
let failed = 0;

for (const path of files) {
  const rel = relative(root, path);
  const text = readFileSync(path, "utf8");
  let body = null;
  let kind = null;
  if (/\.ya?ml$/.test(path)) {
    kind = "yaml";
    body = text;
  } else if (path.endsWith(".md")) {
    body = frontmatter(text);
    if (body == null) continue;
    kind = "frontmatter";
  } else {
    continue;
  }
  try {
    const data = parse(body);
    if (rel === "SKILL.md" || rel.endsWith("/SKILL.md")) {
      if (!data || typeof data !== "object") throw new Error("frontmatter is not a mapping");
      if (typeof data.name !== "string" || typeof data.description !== "string") {
        throw new Error(`name and description must be strings (got ${typeof data.name} and ${typeof data.description})`);
      }
    }
    console.log(`ok  ${kind.padEnd(11)} ${rel}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL ${kind.padEnd(11)} ${rel}: ${err.message}`);
  }
}

if (failed) process.exit(1);
