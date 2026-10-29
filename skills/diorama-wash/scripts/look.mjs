#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "./build.mjs";
import { openBrowser } from "./browser.mjs";

const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith("--")) flags[args[i].slice(2)] = args[++i];
const [src, outArg] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!src || !outArg) {
  console.error("usage: node look.mjs <scene.js> <outdir>");
  process.exit(2);
}

const outdir = resolve(outArg);
mkdirSync(outdir, { recursive: true });
const name = basename(src, ".js");
const { file, bytes } = build(src, join(outdir, `wash-${name}.html`));

async function probe(browser) {
  const context = await browser.newContext({ viewport: { width: 1100, height: 1200 }, deviceScaleFactor: 1 });
  await context.route(/^https?:/, (route) => route.abort());
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(pathToFileURL(file).href + "?still", { waitUntil: "load" });
  const ready = await page.waitForFunction(() => window.__wash && window.__wash.runtime, null, { timeout: 8000 }).then(() => true).catch(() => false);
  const info = ready ? await page.evaluate(() => window.__wash.runtime.glInfo()) : { webgl: false, renderer: "" };
  await context.close();
  return { ok: ready && info.webgl && errors.length === 0, info, errors };
}

let opened = await openBrowser(process.env.WASH_SWIFTSHADER === "1");
let browser = opened.browser;
let swift = process.env.WASH_SWIFTSHADER === "1";
try {
  let probed = await probe(browser);
  if (!probed.ok && !swift) {
    await browser.close();
    swift = true;
    opened = await openBrowser(true);
    browser = opened.browser;
    probed = await probe(browser);
  }
  const report = { scene: name, html: file, bytes, swift, renderer: probed.info.renderer, errors: [], network: [], checks: [] };
  const check = (label, pass, detail) => report.checks.push({ label, pass: !!pass, detail });
  const context = await browser.newContext({ viewport: { width: 1100, height: 1200 }, deviceScaleFactor: 1 });
  await context.route(/^https?:/, (route) => { report.network.push(route.request().url()); return route.abort(); });
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") report.errors.push(m.text()); });
  await page.goto(pathToFileURL(file).href + "?still");
  await page.waitForFunction(() => window.__wash?.runtime);
  const meta = await page.evaluate(() => ({ duration: window.__wash.spec.duration, still: window.__wash.spec.still || 0 }));
  const shot = async (t, label) => {
    await page.evaluate((x) => window.__wash.runtime.renderAt(x), t);
    const path = join(outdir, `${name}-${label}.png`);
    await page.locator("#stage").screenshot({ path });
    return path;
  };
  await shot(meta.still, "still");
  const sample = await page.evaluate((t) => {
    window.__wash.runtime.renderAt(t);
    const c = document.getElementById("stage");
    const gl = c.getContext("webgl2");
    const w = c.width;
    const h = c.height;
    const buf = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    let blue = 0;
    let paper = 0;
    for (let i = 0; i < buf.length; i += 16) {
      const r = buf[i];
      const g = buf[i + 1];
      const b = buf[i + 2];
      if (b > r + 8 && b > 90) blue++;
      if (r > 210 && g > 190 && b > 160 && b < 230) paper++;
    }
    const n = buf.length / 16;
    return { blue: blue / n, paper: paper / n };
  }, meta.still);
  check("fill: pond and paper both show", sample.blue > 0.08 && sample.blue < 0.62 && sample.paper > 0.08, sample);
  const frames = [];
  for (const [k, f] of [["a", 0], ["b", 0.25], ["c", 0.5], ["d", 0.75]]) {
    await shot(meta.duration * f, `t${k}`);
    frames.push(await page.evaluate((t) => {
      window.__wash.runtime.renderAt(t);
      const c = document.getElementById("stage");
      const gl = c.getContext("webgl2");
      const buf = new Uint8Array(c.width * c.height * 4);
      gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      let h = 2166136261;
      for (let i = 0; i < buf.length; i += 64) {
        h ^= buf[i] + buf[i + 1] * 3;
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }, meta.duration * f));
  }
  check("motion: the loop changes the picture", new Set(frames).size > 1, frames);
  const seam = await page.evaluate((d) => {
    function grab(t) {
      window.__wash.runtime.renderAt(t);
      const c = document.getElementById("stage");
      const gl = c.getContext("webgl2");
      const buf = new Uint8Array(c.width * c.height * 4);
      gl.readPixels(0, 0, c.width, c.height, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      return buf;
    }
    const a = grab(0);
    const b = grab(d);
    let n = 0;
    for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++;
    return n / (a.length / 4);
  }, meta.duration);
  check("seam: the loop end matches the start", seam < 0.002, +seam.toFixed(6));
  const same = await page.evaluate((t) => window.__wash.runtime.same(t), meta.still);
  report.determinism = same;
  check("determinism: the same t renders twice as the same pixels", same.identical, same);
  const clicked = await page.evaluate((t) => {
    const rt = window.__wash.runtime;
    rt.clearPokes();
    rt.renderAt(t);
    const before = rt.same(t).hash;
    const hit = rt.poke(0, 0, t);
    rt.renderAt(t + 0.45);
    const after = rt.same(t + 0.45);
    rt.clearPokes();
    rt.renderAt(t + 0.45);
    const cleared = rt.same(t + 0.45).hash;
    return { hit, before, moved: after.hash !== cleared, identicalAfter: after.identical };
  }, meta.still);
  check("click: a poke changes a later frame and that frame still repeats", clicked.hit && clicked.moved && clicked.identicalAfter, clicked);
  const reduced = await context.newPage();
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(pathToFileURL(file).href);
  await reduced.waitForFunction(() => window.__wash?.runtime);
  const held = await reduced.evaluate(async () => {
    const a = window.__wash.runtime.same(window.__wash.spec.still).hash;
    await new Promise((ok) => setTimeout(ok, 400));
    const b = window.__wash.runtime.same(window.__wash.spec.still).hash;
    return { a, b, match: a === b };
  });
  check("reduced motion: the held still frame stays put", held.match, held);
  await reduced.close();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pathToFileURL(file).href + "?still");
  await page.waitForFunction(() => window.__wash?.runtime);
  await page.screenshot({ path: join(outdir, `${name}-mobile.png`), fullPage: true });
  check("mobile: no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  check("no browser errors", report.errors.length === 0, report.errors);
  check("offline: no network request", report.network.length === 0, report.network);
  writeFileSync(join(outdir, `${name}-look.json`), JSON.stringify(report, null, 2) + "\n");
  console.log(`${name}: ${bytes} bytes, ${report.renderer || "no renderer"}${swift ? ", swiftshader" : ""}`);
  for (const c of report.checks) console.log(`${c.pass ? "PASS" : "FAIL"} ${c.label}${c.pass ? "" : " " + JSON.stringify(c.detail)}`);
  if (report.checks.some((c) => !c.pass)) process.exitCode = 1;
} finally {
  await browser.close();
}
