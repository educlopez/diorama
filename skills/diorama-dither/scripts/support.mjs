#!/usr/bin/env node
/**
 * Checks supports: `node support.mjs [examples/<name>.js ...]`.
 * With no files, every `examples/*.js` is audited.
 * Each solid meets its surface within one voxel, at the still and at t = duration/4,
 * duration/2, 3*duration/4 and duration. A mesh with no support fails. A mesh tucked
 * under a seated group still fails when the nearest mesh is more than one voxel
 * away and its bottom is above the ground. The group's box is not the test.
 * A figure whose body passes through a solid that is not the ground fails as `stands inside`.
 * A figure on the ground must not stand in a water zone. Feet are [x, z].
 * When a step is seated, a ground figure must stand on meadow or earth, at least 1.2
 * inside the near wall, and 0.4 clear of a step, slab, plinth or terrace.
 * The kernel's place turns NaN into 0, so folk records the requested x,z and the check
 * reads that before trusting the placed origin. A bad coordinate fails by name.
 * Prints FAIL and the group name, and exits 1 on any miss. An expected negative prints
 * `ok negative` with the reason, and does not print FAIL. The html in /tmp is removed.
 *
 * `--negative` lifts a windmill wheel, parks an undeclared box at y = 4.5 inside the mill,
 * stands a figure in the tower, and stands figures on a step's edge and in the opening.
 * Those must fail, and the tower figure must fail only as `stands inside`. A figure in the
 * square corner of a cylinder, outside the round wall, must pass. It also checks the snow
 * report, the gate height, the cold ground family, a tall sand post, the figure sole and the hull. `--water` requires a figure in the tea-house pond to fail, a figure in the
 * lighthouse's open water to fail, and a figure on lighthouse rock to pass.
 */
import { existsSync, readdirSync, rmSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "./build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));

/* 1 grass, 2 earth, 3 water, 4 neutral or cold. The first three stay as they were.
   Family 4 is what they miss: not white, chroma at most 36, luminance 68 to 248,
   and blue within 22 of red, so a warm light stays earth or nothing. */
export function groundFamily(r, g, b) {
  if (r > 250 && g > 250 && b > 250) return 0;
  if (g + 4 >= r && g > b + 8 && g > 38 && r < 200 && b < 165) return 1;
  if (r > g + 6 && g > b + 2 && r < 210 && g > 36 && r - g < 78 && b < 155) return 2;
  if (b > r + 2 && b + 12 >= g && b > 8 && r < 190 && g > 6 && g < 200) return 3;
  const hi = Math.max(r, g, b), lo = Math.min(r, g, b), L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (hi - lo <= 36 && L >= 68 && L <= 248 && b + 22 >= r && g + 18 >= r) return 4;
  return 0;
}

export function fnBody(fn) {
  const s = fn.toString();
  return s.slice(s.indexOf("{") + 1, s.lastIndexOf("}"));
}

/* A hard cast passes on a grass silhouette, or on earth, water, grass or cold
   ground at the sharp threshold. A post on sand #d2c09a leaves a tall narrow
   earth stain: the two lightest ramp steps are outside that family, and the
   trace can be under 10 pixels wide. It passes when it is at least 28 pixels
   tall and at least three times as tall as it is wide. Snow's lit pixels are
   cold and the veil moves the cast into water, where the spread is about 3.
   That wider allowance applies only when a ground material is named snow, and
   the cast has to be at least 36 pixels wide. Rock uses family 4 and the sharp
   threshold. */
export function shadowOk(shadow, width, part, snow) {
  if (shadow !== "hard" || !part) return "";
  const arm = (m) => m && m.n >= 1400 && m.n <= 5500 && m.contrast >= 24 && m.std >= 4 && m.w >= 36 && m.w <= 120 && m.x1 > width * .52 && m.x1 < width * .84 && m.beyond >= 200;
  if (arm(part.at0) && arm(part.at8) && arm(part.at4) && part.shape >= 100) return "silhouette";
  const sharp = (m) => m && m.n >= 160 && m.contrast >= 24 && m.std >= 4 && m.w >= 10 && m.w < width * .85;
  if (sharp(part.earth) || sharp(part.water) || sharp(part.at0) || sharp(part.cold)) return "sharp";
  const post = (m) => m && m.n >= 160 && m.contrast >= 24 && m.std >= 4 && m.h >= 28 && m.w >= 2 && m.w < 10 && m.h >= m.w * 3;
  if (post(part.earth)) return "post";
  const veil = (m) => m && m.n >= 160 && m.contrast >= 24 && m.std >= 3 && m.w >= 36 && m.w < width * .85;
  if (snow && veil(part.water)) return "snow";
  return "";
}
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
  function bounds(node, skip, own) {
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
      if (own) return;
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
  var seen = [], sceneRoot = null, hasStep = false;
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
        var bc = bounds(cur, null, true);
        if (bc && !bc.bad && bc.min[1] > px) {
          var best = 1e9, hit = null;
          (function scan(n) {
            if (!n || n === cur) return;
            if (n.geo && n.geo.v) {
              var ob = bounds(n, null, true), g = sep(bc, ob);
              if (ob && !ob.bad && g < best) { best = g; hit = n; }
            }
            var ch = n.children || [], i;
            for (i = 0; i < ch.length; i++) scan(ch[i]);
          })(a);
          if (hit && best > px) {
            var nm = cur.name || who(cur);
            fails.push({ name: nm, why: nm + " floats " + best.toFixed(3) + " apart from " + label(hit) });
          }
        }
      }
    }
    if (cur.support) check(cur);
    var ch = cur.children || [], i;
    for (i = 0; i < ch.length; i++) walkAll(ch[i]);
  }
  function localOf(node, x, y, z) {
    var m = node.m, dx = x - m[3], dy = y - m[7], dz = z - m[11];
    var a = m[0], b = m[1], c = m[2], d = m[4], e = m[5], f = m[6], g = m[8], h = m[9], k = m[10];
    var det = a * (e * k - f * h) - b * (d * k - f * g) + c * (d * h - e * g);
    if (!det) return null;
    var i = 1 / det;
    return [
      i * ((e * k - f * h) * dx + (c * h - b * k) * dy + (b * f - c * e) * dz),
      i * ((f * g - d * k) * dx + (a * k - c * g) * dy + (c * d - a * f) * dz),
      i * ((d * h - e * g) * dx + (b * g - a * h) * dy + (a * e - b * d) * dz)
    ];
  }
  function holds(node, x, y, z) {
    var p = localOf(node, x, y, z), v, i, min, max, pad = .02;
    if (!p || !node.geo || !node.geo.v) return false;
    v = node.geo.v; min = [1e9, 1e9, 1e9]; max = [-1e9, -1e9, -1e9];
    for (i = 0; i < v.length; i += 3) {
      if (v[i] < min[0]) min[0] = v[i]; if (v[i] > max[0]) max[0] = v[i];
      if (v[i + 1] < min[1]) min[1] = v[i + 1]; if (v[i + 1] > max[1]) max[1] = v[i + 1];
      if (v[i + 2] < min[2]) min[2] = v[i + 2]; if (v[i + 2] > max[2]) max[2] = v[i + 2];
    }
    if (!(p[0] > min[0] + pad && p[0] < max[0] - pad && p[1] > min[1] + pad && p[1] < max[1] - pad && p[2] > min[2] + pad && p[2] < max[2] - pad)) return false;
    var cx = (min[0] + max[0]) / 2, cz = (min[2] + max[2]) / 2, lo = 0, hi = 0, round = true, r;
    for (i = 0; i < v.length && round; i += 3) {
      r = Math.hypot(v[i] - cx, v[i + 2] - cz);
      if (r < 1e-6) continue;
      if (v[i + 1] <= min[1] + 1e-6) { if (lo && Math.abs(r - lo) > lo * .03) round = false; lo = lo || r; }
      else if (v[i + 1] >= max[1] - 1e-6) { if (hi && Math.abs(r - hi) > hi * .03) round = false; hi = hi || r; }
      else round = false;
    }
    if (!round || v.length < 36) return true;
    var u = (p[1] - min[1]) / (max[1] - min[1]);
    return Math.hypot(p[0] - cx, p[2] - cz) < lo + (hi - lo) * u - pad;
  }
  function bodyPoints(node, full) {
    var cut = full.min[1] + .42 * (full.max[1] - full.min[1]);
    var acc = [0, 0, 0], n = 0, pts = [];
    function walk(cur, af) {
      if (!cur) return;
      var skip = af || (cur !== node && cur.support && cur.support.float != null);
      if (!skip && cur.geo && cur.geo.v) {
        var v = cur.geo.v, i, p;
        for (i = 0; i < v.length; i += 3) {
          p = cur.worldPoint(v[i], v[i + 1], v[i + 2]);
          if (!finite(p[0]) || !finite(p[1]) || !finite(p[2]) || p[1] <= cut) continue;
          acc[0] += p[0]; acc[1] += p[1]; acc[2] += p[2]; n++;
        }
      }
      var ch = cur.children || [], k;
      for (k = 0; k < ch.length; k++) walk(ch[k], skip);
    }
    walk(node, false);
    if (n) pts.push([acc[0] / n, acc[1] / n, acc[2] / n]);
    var f = feet(node, full);
    if (f && finite(f[0]) && finite(f[1])) pts.push([f[0], full.min[1] + .08, f[1]]);
    return pts;
  }
  function under(node, fig) {
    var p = node;
    while (p) { if (p === fig) return true; p = p.parent; }
    return false;
  }
  function adrift(node) {
    var p = node;
    while (p) { if (p.support && p.support.float != null) return true; p = p.parent; }
    return false;
  }
  function bury(fig, box, name) {
    var pts = bodyPoints(fig, box), hit = null, pi;
    if (!pts.length || !sceneRoot) return;
    (function scan(n) {
      if (!n || hit || under(n, fig) || adrift(n)) return;
      if (n.geo && n.geo.v) {
        for (pi = 0; pi < pts.length; pi++) if (holds(n, pts[pi][0], pts[pi][1], pts[pi][2])) { hit = n; break; }
      }
      if (hit) return;
      var ch = n.children || [], i;
      for (i = 0; i < ch.length; i++) scan(ch[i]);
    })(sceneRoot);
    if (hit) fails.push({ name: name, why: name + " stands inside " + label(hit) });
  }
  function xzGap(x, z, box) {
    var dx = Math.max(box.min[0] - x, x - box.max[0], 0);
    var dz = Math.max(box.min[2] - z, z - box.max[2], 0);
    return Math.sqrt(dx * dx + dz * dz);
  }
  function facingInside(x, z) {
    var az = spec.camera && spec.camera.az != null ? spec.camera.az : 45;
    var rad = az * Math.PI / 180, vx = Math.sin(rad), vz = Math.cos(rad), best = 1e9;
    (function scan(n) {
      if (!n) return;
      if (n.support && n.support.name === "wall") {
        var yaw = (n.rotation && n.rotation.y) || 0, nx = Math.sin(yaw), nz = Math.cos(yaw);
        if (nx * vx + nz * vz > .3) {
          var inside = ((n.position.x || 0) - x) * nx + ((n.position.z || 0) - z) * nz;
          if (inside > 0 && inside < best) best = inside;
        }
      }
      var ch = n.children || [], i;
      for (i = 0; i < ch.length; i++) scan(ch[i]);
    })(sceneRoot);
    return best;
  }
  function footRule(f, name) {
    var zone = spec.ground && spec.ground.zone, zn = zone ? zone(f[0], f[1], P) : "", hit = null, gap = 1e9;
    if (zn !== "meadow" && zn !== "earth") fails.push({ name: name, why: name + " stands off the path" });
    if (facingInside(f[0], f[1]) < 1.2) fails.push({ name: name, why: name + " stands in the opening" });
    (function scan(n) {
      if (!n) return;
      var sn = n.support && n.support.name;
      if (sn && /^(step|slab|plinth|terrace)/.test(sn)) {
        var ob = bounds(n), g = ob && !ob.bad ? xzGap(f[0], f[1], ob) : 1e9;
        if (g < gap) { gap = g; hit = n; }
      }
      var ch = n.children || [], i;
      for (i = 0; i < ch.length; i++) scan(ch[i]);
    })(sceneRoot);
    if (hit && gap < .4) fails.push({ name: name, why: name + " stands against " + label(hit) });
  }
  function seekStep(n) {
    if (!n) return;
    if (n.support && typeof n.support.name === "string" && n.support.name.indexOf("step") === 0) hasStep = true;
    var ch = n.children || [], i;
    for (i = 0; i < ch.length; i++) seekStep(ch[i]);
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
        if (f && hasStep && (s.on === "ground" || s.on == null)) footRule(f, name);
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
    if (node.figure) bury(node, box, name);
  }
  var start = (rt.parts.hot && rt.parts.hot[0]) || null;
  if (!start) { var keys = Object.keys(rt.parts || {}); for (var ki = 0; ki < keys.length && !start; ki++) { var v = rt.parts[keys[ki]]; if (v && v.parent) start = v; if (v && v.root) start = v.root; } }
  var root = start;
  while (root && root.parent) root = root.parent;
  sceneRoot = root;
  if (root) { seekStep(root); walkAll(root); }
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
    const unnamed = unique(after.fails.filter((f) => f.why.indexOf("mill child ") === 0 && f.why.indexOf("apart from") >= 0));
    if (!unnamed.length) {
      console.log("FAIL negative: an unnamed child was not named from its parent");
      printFails(after.fails);
      process.exitCode = 1; return;
    }
    okBecause("negative", "unnamed child", unnamed);
  } finally { await close(opened); }
}

async function runInside() {
  const opened = await open(join(here(".."), "examples", "windmill.js"));
  try {
    const before = await auditPage(opened.page);
    if (before.fails.length) {
      console.log("FAIL negative: the windmill already misses a support, so a figure in the tower is not a clean test");
      printFails(before.fails);
      process.exitCode = 1; return;
    }
    const planted = await opened.page.evaluate(() => {
      var P = window.__dither.runtime.P, root = window.__dither.runtime.parts.hot[0], tower = null;
      while (root && root.parent) root = root.parent;
      (function walk(cur) {
        if (tower || !cur) return;
        if (cur.support && cur.support.name === "tower") tower = cur;
        (cur.children || []).forEach(walk);
      })(root);
      var who = Dither.folk(P, -1.2, .48, { h: .4, name: "intruder" });
      if (!tower) return "";
      who.root.position.y = .2;
      Dither.seat(who.root, "intruder", tower);
      return who.root.support && who.root.support.name;
    });
    if (planted !== "intruder") { console.log("FAIL negative: could not stand a figure in the tower"); process.exitCode = 1; return; }
    const after = await opened.page.evaluate(supportAudit);
    const named = unique(after.fails.filter((f) => f.name === "intruder"));
    if (named.length !== 1 || named[0].why.indexOf("stands inside tower") < 0) {
      console.log("FAIL negative: a figure in the tower did not fail only as stands inside");
      printFails(named.length ? named : after.fails);
      process.exitCode = 1; return;
    }
    okBecause("negative", "stands inside", named);
  } finally { await close(opened); }
}

async function runRound() {
  const opened = await open(join(here(".."), "examples", "windmill.js"));
  try {
    const before = await auditPage(opened.page);
    if (before.fails.length) {
      console.log("FAIL negative: the windmill already misses a support, so the cylinder is not a clean test");
      printFails(before.fails);
      process.exitCode = 1; return;
    }
    const planted = await opened.page.evaluate(() => {
      var P = window.__dither.runtime.P;
      var drum = P.cyl(.5, .5, 1.2, "stone", 4.2, .6, 4.2);
      Dither.seat(drum, "drum");
      var corner = Dither.folk(P, 4.65, 4.65, { h: .4, name: "T" });
      var core = Dither.folk(P, 4.2, 4.2, { h: .4, name: "cored" });
      var crate = P.box(1, 1.2, 1, "timber", -4.2, .6, 4.2);
      Dither.seat(crate, "crate");
      var packed = Dither.folk(P, -4.2, 4.2, { h: .4, name: "packed" });
      var aside = Dither.folk(P, -3.65, 4.2, { h: .4, name: "aside" });
      return {
        T: corner.root.support && corner.root.support.name,
        cored: core.root.support && core.root.support.name,
        packed: packed.root.support && packed.root.support.name,
        aside: aside.root.support && aside.root.support.name
      };
    });
    if (planted.T !== "T" || planted.cored !== "cored" || planted.packed !== "packed" || planted.aside !== "aside") {
      console.log("FAIL negative: could not place the cylinder and the crate");
      process.exitCode = 1; return;
    }
    const after = await opened.page.evaluate(supportAudit);
    const of = (name) => unique(after.fails.filter((f) => f.name === name));
    const corner = of("T"), core = of("cored"), packed = of("packed"), aside = of("aside");
    if (corner.length) {
      console.log("FAIL negative: a figure in the square corner of a cylinder failed");
      printFails(corner);
      process.exitCode = 1; return;
    }
    if (aside.length) {
      console.log("FAIL negative: a figure 0.55 from a crate failed");
      printFails(aside);
      process.exitCode = 1; return;
    }
    if (packed.length !== 1 || packed[0].why.indexOf("stands inside crate") < 0) {
      console.log("FAIL negative: a figure inside a crate did not fail only as stands inside");
      printFails(packed);
      process.exitCode = 1; return;
    }
    if (core.length !== 1 || core[0].why.indexOf("stands inside drum") < 0) {
      console.log("FAIL negative: a figure inside a cylinder did not fail only as stands inside");
      printFails(core);
      process.exitCode = 1; return;
    }
    console.log("ok negative: diagonal drum");
    console.log("ok negative: crate at 0.55");
    okBecause("negative", "inside crate", packed);
    okBecause("negative", "inside drum", core);
  } finally { await close(opened); }
}

async function runStep() {
  const opened = await open(join(here(".."), "examples", "windmill.js"));
  try {
    const before = await auditPage(opened.page);
    if (before.fails.length) {
      console.log("FAIL negative: the windmill already misses a support, so the step is not a clean test");
      printFails(before.fails);
      process.exitCode = 1; return;
    }
    const planted = await opened.page.evaluate(() => {
      var P = window.__dither.runtime.P;
      var step = P.box(.5, .12, .4, "stone", .2, .06, -1.2);
      Dither.seat(step, "step");
      var climber = Dither.folk(P, .2, -.7, { h: .4, name: "climber" });
      var crowder = Dither.folk(P, .55, 1.7, { h: .4, name: "crowder" });
      return { climber: climber.root.support && climber.root.support.name, crowder: crowder.root.support && crowder.root.support.name };
    });
    if (planted.climber !== "climber" || planted.crowder !== "crowder") {
      console.log("FAIL negative: could not stand the step figures");
      process.exitCode = 1; return;
    }
    const after = await opened.page.evaluate(supportAudit);
    const climb = unique(after.fails.filter((f) => f.name === "climber" && f.why.indexOf("stands against") >= 0));
    const crowd = unique(after.fails.filter((f) => f.name === "crowder" && f.why.indexOf("stands in the opening") >= 0));
    if (!climb.length) {
      console.log("FAIL negative: a figure against a step did not fail");
      printFails(after.fails.filter((f) => f.name === "climber"));
      process.exitCode = 1; return;
    }
    if (!crowd.length) {
      console.log("FAIL negative: a figure in the opening did not fail");
      printFails(after.fails.filter((f) => f.name === "crowder"));
      process.exitCode = 1; return;
    }
    okBecause("negative", "step clearance", climb.concat(crowd));
  } finally { await close(opened); }
}

async function runOffPath() {
  const opened = await open(join(here(".."), "examples", "lighthouse.js"));
  try {
    const before = await auditPage(opened.page);
    if (before.fails.length) {
      console.log("FAIL negative: the lighthouse already misses a support, so the path is not a clean test");
      printFails(before.fails);
      process.exitCode = 1; return;
    }
    const planted = await opened.page.evaluate(() => {
      var P = window.__dither.runtime.P;
      Dither.seat(P.box(.4, .12, .3, "stone", -2.4, .06, 2.2), "step");
      var who = Dither.folk(P, .85, .05, { h: .4, name: "offpath" });
      return who.root.support && who.root.support.name;
    });
    if (planted !== "offpath") { console.log("FAIL negative: could not stand a figure off the path"); process.exitCode = 1; return; }
    const after = await opened.page.evaluate(supportAudit);
    const named = unique(after.fails.filter((f) => f.name === "offpath" && f.why.indexOf("stands off the path") >= 0));
    if (!named.length) {
      console.log("FAIL negative: a figure off meadow and earth did not fail");
      printFails(after.fails.filter((f) => f.name === "offpath"));
      process.exitCode = 1; return;
    }
    okBecause("negative", "off the path", named);
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
        var P = window.__dither.runtime.P, root = window.__dither.runtime.parts.hot[0], islet = null;
        while (root && root.parent) root = root.parent;
        (function walk(cur) {
          if (islet || !cur) return;
          if (cur.support && cur.support.name === "islet") islet = cur;
          (cur.children || []).forEach(walk);
        })(root);
        var who = Dither.folk(P, .5, -.1, { h: .4, name: "dry" });
        if (islet) { who.root.position.y = .34; Dither.seat(who.root, "dry", islet); }
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

async function runKit() {
  const samples = [
    [111, 143, 60, 1, "grass"],
    [166, 124, 74, 2, "earth"],
    [78, 134, 160, 3, "water"],
    [141, 137, 130, 4, "rock"],
    [194, 197, 187, 4, "snow lit"],
    [117, 119, 129, 3, "snow shadow"],
    [175, 189, 196, 3, "snow blue"],
    [161, 149, 129, 2, "rock light"],
    [255, 255, 255, 0, "white"]
  ];
  for (const [r, g, b, want, label] of samples) {
    const got = groundFamily(r, g, b);
    if (got !== want) {
      console.log("FAIL negative: " + label + " is family " + got + ", wanted " + want);
      process.exitCode = 1;
      return;
    }
  }
  const sharp = { n: 400, contrast: 50, std: 7, w: 40 };
  const snowVeil = { n: 3000, contrast: 60, std: 3.2, w: 90 };
  const thin = { n: 400, contrast: 50, std: 3.2, w: 13 };
  const cold = { n: 2000, contrast: 50, std: 7, w: 51 };
  const miss = (why) => { console.log("FAIL negative: " + why); process.exitCode = 1; };
  if (shadowOk("hard", 360, { earth: sharp }) !== "sharp") return miss("an earth cast did not pass");
  if (shadowOk("hard", 360, { water: snowVeil }, false)) return miss("a spread of 3 passed without snow");
  if (shadowOk("hard", 360, { water: snowVeil }, true) !== "snow") return miss("a snow veil did not pass");
  if (shadowOk("hard", 360, { water: thin }, true)) return miss("a thin snow cast passed");
  if (shadowOk("hard", 360, { cold: cold }) !== "sharp") return miss("a rock cast did not pass");
  if (shadowOk("soft", 360, { earth: sharp })) return miss("a soft shadow passed");
  const sandPost = { n: 222, contrast: 93, std: 17.2, w: 6, h: 38 };
  const sandSpeck = { n: 73, contrast: 105, std: 12, w: 2, h: 37 };
  const sandShort = { n: 200, contrast: 40, std: 8, w: 8, h: 12 };
  if (shadowOk("hard", 360, { earth: sandPost }) !== "post") return miss("a tall sand post did not pass");
  if (shadowOk("hard", 360, { earth: sandSpeck })) return miss("a short sand speck passed");
  if (shadowOk("hard", 360, { earth: sandShort })) return miss("a short narrow earth stain passed");
  console.log("ok negative: cold ground");
  console.log("ok negative: sand post");

  const opened = await open(join(here(".."), "examples", "windmill.js"));
  try {
    const kit = await opened.page.evaluate(() => {
      function lum(hex) {
        var n = parseInt(String(hex).slice(1), 16);
        return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255;
      }
      function boxH(node) {
        var v = node.geo && node.geo.v, i, lo = 1e9, hi = -1e9;
        if (!v) return 0;
        for (i = 1; i < v.length; i += 3) { if (v[i] < lo) lo = v[i]; if (v[i] > hi) hi = v[i]; }
        return hi - lo;
      }
      var snow = Dither.mat("snow");
      var rep = Dither.report("#d5e6ee");
      var ramp = Dither.ramp("#d5e6ee");
      var grey = Dither.ramp("#7f97a8");
      var P = window.__dither.runtime.P;
      var tall = Dither.gate(P, 8, 8, 0);
      var low = Dither.gate(P, -8, 8, 0, { h: .4 });
      function posts(g) { return g.children.map(boxH).filter(function (h) { return h > .2; }); }
      function lintel(g) {
        return g.children.map(function (n) { return { y: n.position.y, h: boxH(n) }; }).filter(function (n) { return n.h < .2; })[0];
      }
      return {
        ground: !!snow.ground, tex: snow.tex,
        tones: rep.tones, maxGap: rep.maxGap, shadowViolet: rep.shadowViolet, lightYellow: rep.lightYellow,
        same: snow.ramp.join() === ramp.join(),
        lighter: lum(snow.ramp[2]) > lum(grey[2]),
        tall: posts(tall), low: posts(low),
        tallLintel: lintel(tall), lowLintel: lintel(low),
        sole: (function () {
          function span(node) {
            var lo = 1e9, hi = -1e9;
            (function walk(cur) {
              var v = cur.geo && cur.geo.v, i, p, ch, k;
              if (v) for (i = 0; i < v.length; i += 3) {
                p = cur.worldPoint(v[i], v[i + 1], v[i + 2]);
                if (p[1] < lo) lo = p[1];
                if (p[1] > hi) hi = p[1];
              }
              ch = cur.children || [];
              for (k = 0; k < ch.length; k++) walk(ch[k]);
            })(node);
            return [lo, hi];
          }
          var pier = P.group(4, 0, 4);
          pier.rotation.y = Math.PI * .75;
          var deck = P.box(2.2, .1, 1.12, "timber", 0, .13, 0, pier);
          var fisher = Dither.folk(P, 4, 4, { h: .42, on: deck, name: "fisher" });
          var stander = Dither.folk(P, 5, 5, { h: .4, name: "stander" });
          var boat = Dither.hull(P, 6, 6, { h: .32, y: -.01, amp: .024, yaw: -.4 });
          var plain = Dither.hull(P, 7, 7, { h: .3 });
          P.update();
          var hullBox = span(boat.hull), plainBox = span(plain.hull);
          return {
            ground: span(stander.root)[0],
            feet: span(fisher.root)[0],
            deck: span(deck)[1],
            onDeck: fisher.root.support.on === deck,
            amp: boat.amp, center: boat.hull.position.y, lo: hullBox[0], hi: hullBox[1], yaw: boat.rotation.y,
            plainAmp: plain.amp, plainY: plain.hull.position.y, plainLo: plainBox[0], plainHi: plainBox[1]
          };
        })()
      };
    });
    const repOk = kit.ground && kit.tex === "sand" && kit.tones === 5 && kit.maxGap <= .08 && kit.shadowViolet < 36 && kit.lightYellow > 0 && kit.same && kit.lighter;
    if (!repOk) {
      console.log("FAIL negative: snow report");
      console.log(JSON.stringify(kit));
      process.exitCode = 1;
      return;
    }
    console.log("ok negative: snow report");
    const near = (a, b) => Math.abs(a - b) < 1e-9;
    const postsOk = kit.tall.length === 2 && kit.tall.every((h) => near(h, .66)) && kit.low.length === 2 && kit.low.every((h) => near(h, .4));
    const lintelOk = kit.tallLintel && near(kit.tallLintel.y, .62) && near(kit.tallLintel.h, .07) && kit.lowLintel && near(kit.lowLintel.y, .36) && near(kit.lowLintel.h, .07);
    if (!postsOk || !lintelOk) {
      console.log("FAIL negative: gate height");
      console.log(JSON.stringify(kit));
      process.exitCode = 1;
      return;
    }
    console.log("ok negative: gate height");
    const sole = kit.sole;
    const soleOk = sole && Math.abs(sole.ground) < 1e-6 && Math.abs(sole.feet - sole.deck) < 1e-6 && sole.onDeck;
    if (!soleOk) {
      console.log("FAIL negative: figure sole");
      console.log(JSON.stringify(sole));
      process.exitCode = 1;
      return;
    }
    console.log("ok negative: figure sole");
    const hullOk = sole && near(sole.amp, .024) && near(sole.center, -.01) && sole.lo < -.02 && sole.hi > .02 && near(sole.yaw, -.4)
      && near(sole.plainAmp, .024) && near(sole.plainY, .04 - .3 / 2) && sole.plainLo < -.02 && sole.plainHi > .02;
    if (!hullOk) {
      console.log("FAIL negative: hull");
      console.log(JSON.stringify(sole));
      process.exitCode = 1;
      return;
    }
    console.log("ok negative: hull");
  } finally { await close(opened); }
}

function exampleFiles() {
  const dir = join(here(".."), "examples");
  return readdirSync(dir).filter((n) => n.endsWith(".js")).sort().map((n) => join(dir, n));
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(here("./support.mjs"))) {
  if (negative) {
    await runKit();
    if (process.exitCode) process.exit(process.exitCode);
    await runNegative();
    if (process.exitCode) process.exit(process.exitCode);
    await runChild();
    if (process.exitCode) process.exit(process.exitCode);
    await runUnnamed();
    if (process.exitCode) process.exit(process.exitCode);
    await runInside();
    if (process.exitCode) process.exit(process.exitCode);
    await runRound();
    if (process.exitCode) process.exit(process.exitCode);
    await runStep();
    if (process.exitCode) process.exit(process.exitCode);
    await runOffPath();
    if (process.exitCode) process.exit(process.exitCode);
  }
  else if (water) await runWater();
  else {
    const list = files.length ? files.map((f) => resolve(f)) : exampleFiles();
    let ok = true;
    for (const f of list) {
      const report = await auditFile(f);
      if (!report.fails.length) console.log("ok " + report.name + " (1 voxel " + report.px.toFixed(3) + ", frames " + report.times.map((t) => t.toFixed(2)).join(" ") + ")");
      else {
        ok = false;
        printFails(report.fails);
      }
    }
    process.exit(ok ? 0 : 1);
  }
}
