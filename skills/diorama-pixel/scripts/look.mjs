#!/usr/bin/env node
/**
 * Looks at a scene: `node look.mjs <scene.js> <outdir>` builds the page, opens it
 * in headless Chromium, writes <name>-still.png and four moments of the loop,
 * measures the render cost and the frame rate, and prints them as JSON.
 * Playwright is borrowed from a sibling install (PLAYWRIGHT_FROM, default the
 * diorama-worlds skill's node_modules); the page itself needs nothing.
 */
import { mkdirSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve, basename } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "./build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const [src, outArg] = process.argv.slice(2);
if (!src || !outArg) { console.error("usage: node look.mjs <scene.js> <outdir>"); process.exit(2); }
const outdir = resolve(outArg); mkdirSync(outdir, { recursive: true });
const name = basename(src, ".js");
const { file, bytes } = build(src, join(outdir, `pixel-${name}.html`));

const from = process.env.PLAYWRIGHT_FROM || here("../../diorama-worlds/package.json");
const { chromium } = createRequire(from)("playwright");
const executablePath = process.env.CHROME_PATH || ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(existsSync);
const browser = await chromium.launch({ executablePath, headless: true });
const report = { scene: name, html: file, bytes, errors: [], network: [], images: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await context.route(/^https?:/, (r) => { report.network.push(r.request().url()); return r.abort(); });
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") report.errors.push(m.text()); });
  await page.goto(pathToFileURL(file).href + "?still");
  await page.waitForFunction(() => window.__pixel?.runtime);
  const meta = await page.evaluate(() => ({ duration: window.__pixel.spec.duration || 6, still: window.__pixel.spec.still || 0 }));
  const shot = async (t, label) => {
    await page.evaluate((x) => window.__pixel.runtime.renderAt(x), t);
    const path = join(outdir, `${name}-${label}.png`);
    await page.locator("#stage").screenshot({ path });
    report.images.push(path);
  };
  await shot(meta.still, "still");
  for (const [k, f] of [["a", 0], ["b", .25], ["c", .5], ["d", .75]]) await shot(meta.duration * f, `t${k}`);
  /* render cost: the whole frame (tick, transform, shadow map, raster, shade, putImageData), synchronous */
  report.render = await page.evaluate(() => {
    const rt = window.__pixel.runtime, n = 120, ts = [];
    for (let i = 0; i < n; i++) { const a = performance.now(); rt.renderAt(i / 30); ts.push(performance.now() - a); }
    ts.sort((a, b) => a - b);
    return { frames: n, medianMs: +ts[n >> 1].toFixed(2), p95Ms: +ts[Math.floor(n * .95)].toFixed(2), tris: rt.stats().tris, size: [rt.stats().width, rt.stats().height] };
  });
  /* frame rate through requestAnimationFrame: uncapped, then at the default cap */
  for (const cap of [0, 24]) {
    report[`fps_cap${cap}`] = await page.evaluate(async (c) => {
      const rt = window.__pixel.runtime; rt.setCap(c); rt.start();
      await new Promise((r) => setTimeout(r, 300));
      const f0 = rt.stats().frames, t0 = performance.now();
      await new Promise((r) => setTimeout(r, 3000));
      const fps = (rt.stats().frames - f0) / ((performance.now() - t0) / 1000); rt.stop();
      return +fps.toFixed(1);
    }, cap);
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify(report, null, 2));
if (report.errors.length || report.network.length) process.exitCode = 1;
