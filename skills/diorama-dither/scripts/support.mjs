#!/usr/bin/env node
/**
 * Checks declared supports: `node support.mjs examples/<name>.js [more]`.
 * Each node with .support must meet its surface within one voxel (1 / camera scale).
 * A figure on 'ground' must not stand in a water zone. Prints FAIL and the group
 * name, and exits 1 on any miss.
 *
 * `node support.mjs --negative` lifts a windmill wheel and exits 0 only when the
 * check names cart-wheel and fails.
 */
import { existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const args = process.argv.slice(2);
const negative = args.includes("--negative");
const files = args.filter((a) => !a.startsWith("--"));

let chromium;
try { ({ chromium } = await import("playwright-core")); }
catch { console.error("playwright-core is missing: run `npm ci --ignore-scripts` in this skill's folder"); process.exit(2); }
const executablePath = process.env.CHROME_PATH || ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
if (!executablePath) { console.error("no Chrome or Chromium found: set CHROME_PATH"); process.exit(2); }

/** Runs inside the page. Returns { px, fails: [{ name, why }] }. */
export function supportAudit() {
  var rt = window.__dither.runtime, spec = window.__dither.spec, P = rt.P;
  P.update();
  var px = P.px || 0.02, fails = [];
  function bounds(node, skip) {
    var min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9], n = 0;
    function walk(cur) {
      if (!cur || cur === skip) return;
      var v, i, p;
      if (cur.geo && cur.geo.v) {
        v = cur.geo.v;
        for (i = 0; i < v.length; i += 3) {
          p = cur.worldPoint(v[i], v[i + 1], v[i + 2]);
          if (p[0] < min[0]) min[0] = p[0]; if (p[0] > max[0]) max[0] = p[0];
          if (p[1] < min[1]) min[1] = p[1]; if (p[1] > max[1]) max[1] = p[1];
          if (p[2] < min[2]) min[2] = p[2]; if (p[2] > max[2]) max[2] = p[2];
          n++;
        }
      }
      var ch = cur.children || [], k;
      for (k = 0; k < ch.length; k++) walk(ch[k]);
    }
    walk(node);
    return n ? { min: min, max: max } : null;
  }
  function sep(a, b) {
    if (!a || !b) return 1e9;
    var sx = Math.max(0, a.min[0] - b.max[0], b.min[0] - a.max[0]);
    var sy = Math.max(0, a.min[1] - b.max[1], b.min[1] - a.max[1]);
    var sz = Math.max(0, a.min[2] - b.max[2], b.min[2] - a.max[2]);
    return Math.max(sx, sy, sz);
  }
  function wet(x, z) {
    var zone = spec.ground && spec.ground.zone, name, m;
    if (!zone) return false;
    name = zone(x, z, P);
    m = spec.materials && spec.materials[name];
    return !!(m && m.water);
  }
  function feet(node, box) {
    var accX = 0, accZ = 0, n = 0, limit = box.min[1] + px;
    function walk(cur) {
      if (!cur || !cur.geo) { var ch0 = (cur && cur.children) || [], k0; for (k0 = 0; k0 < ch0.length; k0++) walk(ch0[k0]); return; }
      var v = cur.geo.v, i, p;
      for (i = 0; i < v.length; i += 3) {
        p = cur.worldPoint(v[i], v[i + 1], v[i + 2]);
        if (p[1] <= limit) { accX += p[0]; accZ += p[2]; n++; }
      }
      var ch = cur.children || [], k;
      for (k = 0; k < ch.length; k++) walk(ch[k]);
    }
    walk(node);
    return n ? [accX / n, accZ / n] : [(box.min[0] + box.max[0]) / 2, (box.min[2] + box.max[2]) / 2];
  }
  function label(node) {
    var s = node && node.support;
    return (s && s.name) || (node && node.name) || "piece";
  }
  var seen = [];
  function walkAll(cur) {
    if (!cur || seen.indexOf(cur) >= 0) return;
    seen.push(cur);
    if (cur.support) check(cur);
    var ch = cur.children || [], i;
    for (i = 0; i < ch.length; i++) walkAll(ch[i]);
  }
  function check(node) {
    var s = node.support, name = s.name || "piece", box, other, gap, f;
    if (s.float) {
      if (!String(s.float).trim()) fails.push({ name: name, why: name + " floats without a reason" });
      return;
    }
    box = bounds(node);
    if (!box) { fails.push({ name: name, why: name + " has no solid to support" }); return; }
    if (node.figure && (s.on === "water" || s.on === "surface")) fails.push({ name: name, why: name + " stands on water" });
    if (s.on === "ground" || s.on == null) {
      if (box.min[1] > px) fails.push({ name: name, why: name + " floats " + (box.min[1]).toFixed(3) + " above the ground (1 voxel is " + px.toFixed(3) + ")" });
      if (node.figure) {
        f = feet(node, box);
        if (wet(f[0], f[2])) fails.push({ name: name, why: name + " stands on water" });
      }
    } else if (s.on === "water") {
      if (!(box.min[1] < -px && box.max[1] > px)) fails.push({ name: name, why: name + " is not in the water (bottom " + box.min[1].toFixed(3) + ", top " + box.max[1].toFixed(3) + ")" });
    } else if (s.on === "surface") {
      if (box.min[1] > px || box.min[1] < -px) fails.push({ name: name, why: name + " misses the water surface (bottom " + box.min[1].toFixed(3) + ")" });
      f = feet(node, box);
      if (!wet(f[0], f[2])) fails.push({ name: name, why: name + " is not on water" });
    } else if (s.on && typeof s.on === "object") {
      gap = sep(box, bounds(s.on, node));
      if (gap > px) fails.push({ name: name, why: name + " misses " + label(s.on) + " by " + gap.toFixed(3) + " (1 voxel is " + px.toFixed(3) + ")" });
    } else fails.push({ name: name, why: name + " has no support surface" });
    if (s.join) {
      gap = sep(box, bounds(s.join, node));
      if (gap > px) fails.push({ name: name, why: name + " misses " + label(s.join) + " by " + gap.toFixed(3) + " (1 voxel is " + px.toFixed(3) + ")" });
    }
  }
  var start = (rt.parts.hot && rt.parts.hot[0]) || null;
  if (!start) { var keys = Object.keys(rt.parts || {}); for (var ki = 0; ki < keys.length && !start; ki++) { var v = rt.parts[keys[ki]]; if (v && v.parent) start = v; if (v && v.root) start = v.root; } }
  var root = start;
  while (root && root.parent) root = root.parent;
  if (root) walkAll(root);
  return { px: px, fails: fails };
}

async function open(src) {
  const name = basename(src, ".js");
  const { file } = build(src, join("/tmp", `dither-support-${name}.html`));
  const browser = await chromium.launch({ executablePath, headless: true });
  const page = await browser.newPage();
  await page.goto(pathToFileURL(file).href + "?still");
  await page.waitForFunction(() => window.__dither && window.__dither.runtime);
  const still = await page.evaluate(() => window.__dither.spec.still || 0);
  await page.evaluate((t) => window.__dither.runtime.renderAt(t), still);
  return { browser, page, name };
}

export async function auditFile(src) {
  const { browser, page, name } = await open(src);
  try {
    const report = await page.evaluate(supportAudit);
    return { name, ...report };
  } finally { await browser.close(); }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(here("./support.mjs"))) {
  if (negative) {
    const src = join(here(".."), "examples", "windmill.js");
    const { browser: b, page } = await open(src);
    try {
      const before = await page.evaluate(supportAudit);
      if (before.fails.length) {
        console.log("FAIL negative: the windmill already misses a support, so the lift is not a clean test");
        before.fails.forEach((f) => console.log("FAIL " + f.why));
        process.exit(1);
      }
      const lifted = await page.evaluate(() => {
        var rt = window.__dither.runtime, n = rt.parts.hot[0], root = n, hit = null;
        while (root.parent) root = root.parent;
        (function walk(cur) {
          if (hit || !cur) return;
          if (cur.support && cur.support.name === "cart-wheel") hit = cur;
          (cur.children || []).forEach(walk);
        })(root);
        if (!hit) return { found: false };
        hit.position.y += .25;
        return { found: true };
      });
      if (!lifted.found) { console.log("FAIL negative: no cart-wheel to lift"); process.exit(1); }
      const after = await page.evaluate(supportAudit);
      const named = after.fails.filter((f) => f.name === "cart-wheel");
      if (!named.length) {
        console.log("FAIL negative: a lifted cart-wheel did not fail");
        after.fails.forEach((f) => console.log("FAIL " + f.why));
        process.exit(1);
      }
      named.forEach((f) => console.log("FAIL " + f.why));
      console.log("ok negative: cart-wheel");
    } finally { await b.close(); }
  } else {
    if (!files.length) { console.error("usage: node support.mjs examples/<name>.js [more] | --negative"); process.exit(2); }
    let ok = true;
    for (const f of files) {
      const report = await auditFile(resolve(f));
      if (!report.fails.length) console.log("ok " + report.name + " (1 voxel " + report.px.toFixed(3) + ")");
      else {
        ok = false;
        report.fails.forEach((fail) => console.log("FAIL " + fail.why));
      }
    }
    process.exit(ok ? 0 : 1);
  }
}
