#!/usr/bin/env node
/**
 * Checks supports: `node support.mjs examples/<name>.js [more]`.
 * Each solid meets its surface within one voxel, at the still and at t = duration/4,
 * duration/2, 3*duration/4 and duration. A mesh with no support fails. A mesh tucked
 * under a seated group still fails when it floats clear of that group and above the ground.
 * A figure on the ground must not stand in a water zone. Feet are [x, z].
 * The kernel's place turns NaN into 0, so folk records the requested x,z and the check
 * reads that before trusting the placed origin. A bad coordinate fails by name.
 * Prints FAIL and the group name, and exits 1 on any miss. An expected negative prints
 * `ok negative` with the reason, and does not print FAIL. The html in /tmp is removed.
 *
 * `--negative` lifts a windmill wheel, and parks an undeclared box at y = 4.5 inside the mill.
 * Both must fail. `--water` requires a figure in the tea-house pond to fail, a figure in the
 * lighthouse's open water to fail, and a figure on lighthouse rock to pass.
 */
import { existsSync, rmSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const args = process.argv.slice(2);
const negative = args.includes("--negative");
const water = args.includes("--water");
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
    var min = [1e9, 1e9, 1e9], max = [-1e9, -1e9, -1e9], n = 0, bad = false;
    function walk(cur) {
      if (!cur || cur === skip) return;
      var v, i, p;
      if (cur.geo && cur.geo.v) {
        v = cur.geo.v;
        for (i = 0; i < v.length; i += 3) {
          p = cur.worldPoint(v[i], v[i + 1], v[i + 2]);
          if (!finite(p[0]) || !finite(p[1]) || !finite(p[2])) { bad = true; n++; continue; }
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
    return n ? { min: min, max: max, bad: bad } : null;
  }
  function sep(a, b) {
    if (!a || !b) return 1e9;
    var sx = Math.max(0, a.min[0] - b.max[0], b.min[0] - a.max[0]);
    var sy = Math.max(0, a.min[1] - b.max[1], b.min[1] - a.max[1]);
    var sz = Math.max(0, a.min[2] - b.max[2], b.min[2] - a.max[2]);
    return Math.max(sx, sy, sz);
  }
  function finite(n) { return typeof n === "number" && n === n && n !== Infinity && n !== -Infinity; }
  function wet(x, z) {
    var zone = spec.ground && spec.ground.zone, name, m;
    if (!finite(x) || !finite(z) || !zone) return false;
    name = zone(x, z, P);
    m = spec.materials && spec.materials[name];
    return !!(m && m.water);
  }
  function feet(node, box) {
    var accX = 0, accZ = 0, n = 0, bad = false, limit = box.min[1] + px;
    function walk(cur) {
      if (!cur || !cur.geo) { var ch0 = (cur && cur.children) || [], k0; for (k0 = 0; k0 < ch0.length; k0++) walk(ch0[k0]); return; }
      var v = cur.geo.v, i, p;
      for (i = 0; i < v.length; i += 3) {
        p = cur.worldPoint(v[i], v[i + 1], v[i + 2]);
        if (!finite(p[0]) || !finite(p[1]) || !finite(p[2])) { bad = true; continue; }
        if (p[1] <= limit) { accX += p[0]; accZ += p[2]; n++; }
      }
      var ch = cur.children || [], k;
      for (k = 0; k < ch.length; k++) walk(ch[k]);
    }
    walk(node);
    if (bad || box.bad) return [NaN, NaN];
    return n ? [accX / n, accZ / n] : [(box.min[0] + box.max[0]) / 2, (box.min[2] + box.max[2]) / 2];
  }
  function place(node, box, name) {
    var f = feet(node, box);
    if (!f || !finite(f[0]) || !finite(f[1])) {
      fails.push({ name: name, why: name + " has no place to stand" });
      return null;
    }
    return f;
  }
  function who(node) {
    if (!node) return "root";
    if (node.name) return node.name;
    if (node.support && node.support.name && node.support.name !== "piece") return node.support.name;
    var p = node.parent, idx = 0;
    if (p && p.children) { var at = p.children.indexOf(node); idx = at < 0 ? 0 : at; }
    var host = p;
    while (host && !host.name && !(host.support && host.support.name && host.support.name !== "piece")) host = host.parent;
    var pname = host ? (host.name || host.support.name) : "root";
    return pname + " child " + idx;
  }
  function label(node) {
    var s = node && node.support;
    if (s && s.name && s.name !== "piece") return s.name;
    return who(node);
  }
  var seen = [];
  function covered(node) {
    var p = node;
    while (p) { if (p.support) return true; p = p.parent; }
    return false;
  }
  function walkAll(cur) {
    if (!cur || seen.indexOf(cur) >= 0) return;
    seen.push(cur);
    if (cur.geo && !covered(cur)) fails.push({ name: who(cur), why: who(cur) + " has no support" });
    else if (cur.geo && !cur.support) {
      var a = cur.parent;
      while (a && !a.support) a = a.parent;
      if (a && a.support.float == null) {
        var bc = bounds(cur), g = sep(bc, bounds(a, cur));
        if (g > px && bc && bc.min[1] > px) {
          var nm = cur.name || who(cur);
          fails.push({ name: nm, why: nm + " floats " + g.toFixed(3) + " apart from " + label(a) });
        }
      }
    }
    if (cur.support) check(cur);
    var ch = cur.children || [], i;
    for (i = 0; i < ch.length; i++) walkAll(ch[i]);
  }
  function check(node) {
    var s = node.support, name = (s.name && s.name !== "piece") ? s.name : who(node), box, gap, f, before;
    if (node.figure && node.stand && (!finite(node.stand[0]) || !finite(node.stand[1]))) {
      fails.push({ name: name, why: name + " has no place to stand" });
      return;
    }
    if (s.float != null) {
      if (!String(s.float).trim()) fails.push({ name: name, why: name + " floats without a reason" });
      return;
    }
    box = bounds(node);
    if (!box) { fails.push({ name: name, why: name + " has no solid to support" }); return; }
    if (box.bad || !finite(box.min[1]) || !finite(box.max[1])) {
      fails.push({ name: name, why: name + " has no place to stand" });
      return;
    }
    if (node.figure && (s.on === "water" || s.on === "surface")) fails.push({ name: name, why: name + " stands on water" });
    before = fails.length;
    if (s.on === "ground" || s.on == null) {
      if (!finite(box.min[1])) fails.push({ name: name, why: name + " has no place to stand" });
      else if (box.min[1] > px) fails.push({ name: name, why: name + " floats " + (box.min[1]).toFixed(3) + " above the ground (1 voxel is " + px.toFixed(3) + ")" });
      if (node.figure) {
        f = place(node, box, name);
        if (f && wet(f[0], f[1])) fails.push({ name: name, why: name + " stands on water" });
      }
    } else if (s.on === "water") {
      if (!(finite(box.min[1]) && finite(box.max[1]) && box.min[1] < -px && box.max[1] > px)) fails.push({ name: name, why: name + " is not in the water (bottom " + (finite(box.min[1]) ? box.min[1].toFixed(3) : "NaN") + ", top " + (finite(box.max[1]) ? box.max[1].toFixed(3) : "NaN") + ")" });
    } else if (s.on === "surface") {
      if (!finite(box.min[1]) || box.min[1] > px || box.min[1] < -px) fails.push({ name: name, why: name + " misses the water surface (bottom " + (finite(box.min[1]) ? box.min[1].toFixed(3) : "NaN") + ")" });
      f = place(node, box, name);
      if (f && !wet(f[0], f[1])) fails.push({ name: name, why: name + " is not on water" });
    } else if (s.on && typeof s.on === "object") {
      gap = sep(box, bounds(s.on, node));
      if (gap > px) fails.push({ name: name, why: name + " misses " + label(s.on) + " by " + gap.toFixed(3) + " (1 voxel is " + px.toFixed(3) + ")" });
    } else fails.push({ name: name, why: name + " has no support surface" });
    if (s.join && fails.length === before) {
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
  const file = join("/tmp", `dither-support-${process.pid}-${name}.html`);
  build(src, file);
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(file).href + "?still");
    await page.waitForFunction(() => window.__dither && window.__dither.runtime);
    return { browser, page, name, file };
  } catch (err) {
    await browser.close();
    rmSync(file, { force: true });
    throw err;
  }
}

async function close(opened) {
  await opened.browser.close();
  rmSync(opened.file, { force: true });
}

function unique(fails) {
  const out = [], seen = new Set();
  for (const fail of fails) {
    const key = fail.name + "\n" + fail.why;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(fail);
  }
  return out;
}

/** Still, and the quarter, half, three-quarter and end of the loop. For these yards that is t = 2, 4, 6 and 8. */
export function frameTimes(spec) {
  const still = spec.still || 0, dur = spec.duration || 8;
  const out = [];
  for (const t of [still, dur / 4, dur / 2, (dur * 3) / 4, dur]) {
    const time = t < 0 ? 0 : t > dur ? dur : t;
    if (!out.some((u) => Math.abs(u - time) < 1e-6)) out.push(time);
  }
  return out;
}

/** Identical misses across those frames are reported once. */
export async function auditPage(page) {
  const spec = await page.evaluate(() => ({ still: window.__dither.spec.still || 0, duration: window.__dither.spec.duration || 8 }));
  const times = frameTimes(spec);
  const fails = [];
  let px = 0;
  for (const t of times) {
    await page.evaluate((time) => window.__dither.runtime.renderAt(time), t);
    const report = await page.evaluate(supportAudit);
    px = report.px;
    for (const fail of report.fails) fails.push(fail);
  }
  return { px, fails: unique(fails), times };
}

export async function auditFile(src) {
  const opened = await open(src);
  try {
    const report = await auditPage(opened.page);
    return { name: opened.name, ...report };
  } finally { await close(opened); }
}

function printFails(fails) {
  fails.forEach((fail) => console.log("FAIL " + fail.why));
}

function okBecause(kind, label, fails) {
  console.log("ok " + kind + ": " + label + " (" + fails.map((f) => f.why).join("; ") + ")");
}

async function runNegative() {
  const opened = await open(join(here(".."), "examples", "windmill.js"));
  try {
    const before = await auditPage(opened.page);
    if (before.fails.length) {
      console.log("FAIL negative: the windmill already misses a support, so the lift is not a clean test");
      printFails(before.fails);
      process.exitCode = 1; return;
    }
    const lifted = await opened.page.evaluate(() => {
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
    if (!lifted.found) { console.log("FAIL negative: no cart-wheel to lift"); process.exitCode = 1; return; }
    const after = await opened.page.evaluate(supportAudit);
    const named = unique(after.fails.filter((f) => f.name === "cart-wheel"));
    if (!named.length) {
      console.log("FAIL negative: a lifted cart-wheel did not fail");
      printFails(after.fails);
      process.exitCode = 1; return;
    }
    okBecause("negative", "cart-wheel", named);
  } finally { await close(opened); }
}

async function runChild() {
  const opened = await open(join(here(".."), "examples", "windmill.js"));
  try {
    const before = await auditPage(opened.page);
    if (before.fails.length) {
      console.log("FAIL negative: the windmill already misses a support, so the floating child is not a clean test");
      printFails(before.fails);
      process.exitCode = 1; return;
    }
    const planted = await opened.page.evaluate(() => {
      var rt = window.__dither.runtime, root = rt.parts.hot[0], mill = null;
      while (root.parent) root = root.parent;
      (function walk(cur) {
        if (mill || !cur) return;
        if (cur.support && cur.support.name === "mill") mill = cur;
        (cur.children || []).forEach(walk);
      })(root);
      if (!mill) return "";
      var box = rt.P.box(.2, .2, .2, "stone", 0, 4.5, 0, mill);
      box.name = "childfloat";
      return box.name;
    });
    if (!planted) { console.log("FAIL negative: no mill to hang a child on"); process.exitCode = 1; return; }
    const after = await opened.page.evaluate(supportAudit);
    const named = unique(after.fails.filter((f) => f.name === "childfloat" && f.why.indexOf("apart from") >= 0));
    if (!named.length) {
      console.log("FAIL negative: a child of the mill at y=4.5 did not fail");
      printFails(after.fails);
      process.exitCode = 1; return;
    }
    okBecause("negative", "childfloat", named);
  } finally { await close(opened); }
}

async function runUnnamed() {
  const opened = await open(join(here(".."), "examples", "windmill.js"));
  try {
    const planted = await opened.page.evaluate(() => {
      var rt = window.__dither.runtime, root = rt.parts.hot[0], mill = null;
      while (root.parent) root = root.parent;
      (function walk(cur) {
        if (mill || !cur) return;
        if (cur.support && cur.support.name === "mill") mill = cur;
        (cur.children || []).forEach(walk);
      })(root);
      if (!mill) return false;
      rt.P.box(.2, .2, .2, "stone", 0, 4.5, 0, mill);
      return true;
    });
    if (!planted) { console.log("FAIL negative: no mill for an unnamed child"); process.exitCode = 1; return; }
    const after = await opened.page.evaluate(supportAudit);
    const unnamed = unique(after.fails.filter((f) => f.why.indexOf("mill child ") === 0 && f.why.indexOf("apart from mill") >= 0));
    if (!unnamed.length) {
      console.log("FAIL negative: an unnamed child was not named from its parent");
      printFails(after.fails);
      process.exitCode = 1; return;
    }
    okBecause("negative", "unnamed child", unnamed);
  } finally { await close(opened); }
}

async function expectWater(src, place, label) {
  const opened = await open(join(here(".."), "examples", src));
  try {
    const before = await auditPage(opened.page);
    if (before.fails.length) {
      console.log("FAIL water: " + label + " is not a clean scene, so the probe is not a fair test");
      printFails(before.fails);
      process.exitCode = 1;
      return;
    }
    const planted = await opened.page.evaluate(place);
    if (!planted) { console.log("FAIL water: could not place the figure for " + label); process.exitCode = 1; return; }
    const after = await opened.page.evaluate(supportAudit);
    const hit = unique(after.fails.filter((f) => f.why.indexOf("stands on water") >= 0 && f.name === planted));
    if (!hit.length) {
      console.log("FAIL water: " + label + " did not fail");
      printFails(after.fails);
      process.exitCode = 1;
      return;
    }
    okBecause("water", label, hit);
  } finally { await close(opened); }
}

async function runWater() {
  await expectWater("tea-house.js", () => {
    var who = window.__dither.runtime.parts.host && window.__dither.runtime.parts.host.root;
    if (!who) return "";
    who.position.set(.05, 0, .05);
    return who.support && who.support.name;
  }, "tea-house pond");
  await expectWater("lighthouse.js", () => {
    var who = Dither.folk(window.__dither.runtime.P, 2.8, 2.2, { h: .4, name: "wader" });
    return who.root.support && who.root.support.name;
  }, "lighthouse open water");
  const dry = await open(join(here(".."), "examples", "lighthouse.js"));
  try {
    const before = await auditPage(dry.page);
    if (before.fails.length) {
      console.log("FAIL water: lighthouse rock is not a clean scene");
      printFails(before.fails);
      process.exitCode = 1;
    } else {
      const planted = await dry.page.evaluate(() => {
        var who = Dither.folk(window.__dither.runtime.P, -.3, .05, { h: .4, name: "dry" });
        return who.root.support && who.root.support.name;
      });
      const after = await dry.page.evaluate(supportAudit);
      const own = after.fails.filter((f) => f.name === planted);
      if (own.length || after.fails.length) {
        console.log("FAIL water: a dry figure on lighthouse rock failed");
        printFails(after.fails);
        process.exitCode = 1;
      } else console.log("ok water: lighthouse rock");
      const bad = await dry.page.evaluate(() => {
        var P = window.__dither.runtime.P;
        function lost(name, x) {
          var n = P.group(0, 0, 0);
          n.figure = true;
          n.geo = { v: [x, 0, 0] };
          Dither.seat(n, name);
          return name;
        }
        return [lost("nan-feet", NaN), lost("missing-feet", undefined)];
      });
      const coords = await dry.page.evaluate(supportAudit);
      const wanted = new Set(bad);
      const found = unique(coords.fails.filter((f) => wanted.has(f.name) && f.why.indexOf("no place to stand") >= 0));
      if (found.length !== bad.length) {
        console.log("FAIL water: a NaN or undefined foot did not fail");
        printFails(coords.fails);
        process.exitCode = 1;
      } else okBecause("water", "bad coordinates", found);
      const extraNames = await dry.page.evaluate(() => {
        var P = window.__dither.runtime.P;
        var bare = P.box(.2, .2, .2, "rock", 3, 1, 3);
        bare.name = "bare";
        var mark = P.box(.1, .1, .1, "iron", 3, 2, 3);
        Dither.afloat(mark, "mark", "  ");
        return { bare: bare.name, mark: mark.support && mark.support.name };
      });
      const extra = await dry.page.evaluate(supportAudit);
      const bareHit = unique(extra.fails.filter((f) => f.name === extraNames.bare && f.why.indexOf("has no support") >= 0));
      const markHit = unique(extra.fails.filter((f) => f.name === extraNames.mark && f.why.indexOf("floats without a reason") >= 0));
      if (!bareHit.length) {
        console.log("FAIL support: a mesh with no support did not fail");
        printFails(extra.fails);
        process.exitCode = 1;
      } else okBecause("negative", "undeclared mesh", bareHit);
      if (!markHit.length) {
        console.log("FAIL support: a blank float reason did not fail");
        printFails(extra.fails);
        process.exitCode = 1;
      } else okBecause("negative", "blank reason", markHit);
      const folkNames = await dry.page.evaluate(() => {
        var P = window.__dither.runtime.P;
        var nan = Dither.folk(P, NaN, .2, { h: .4, name: "folk-nan" });
        var missing = Dither.folk(P, undefined, .2, { h: .4, name: "folk-missing" });
        return [nan.root.support.name, missing.root.support.name];
      });
      const folkReport = await dry.page.evaluate(supportAudit);
      const folkHit = unique(folkReport.fails.filter((f) => folkNames.indexOf(f.name) >= 0 && f.why.indexOf("no place to stand") >= 0));
      if (folkHit.length !== folkNames.length) {
        console.log("FAIL support: folk with NaN or undefined did not fail");
        printFails(folkReport.fails);
        process.exitCode = 1;
      } else okBecause("negative", "folk coordinates", folkHit);
    }
  } finally { await close(dry); }
  if (process.exitCode) process.exit(process.exitCode);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(here("./support.mjs"))) {
  if (negative) {
    await runNegative();
    if (process.exitCode) process.exit(process.exitCode);
    await runChild();
    if (process.exitCode) process.exit(process.exitCode);
    await runUnnamed();
    if (process.exitCode) process.exit(process.exitCode);
  }
  else if (water) await runWater();
  else {
    if (!files.length) { console.error("usage: node support.mjs examples/<name>.js [more] | --negative | --water"); process.exit(2); }
    let ok = true;
    for (const f of files) {
      const report = await auditFile(resolve(f));
      if (!report.fails.length) console.log("ok " + report.name + " (1 voxel " + report.px.toFixed(3) + ", frames " + report.times.map((t) => t.toFixed(2)).join(" ") + ")");
      else {
        ok = false;
        printFails(report.fails);
      }
    }
    process.exit(ok ? 0 : 1);
  }
}
