#!/usr/bin/env node
/**
 * Looks at a scene: `node look.mjs <scene.js> <outdir> [--press x,y] [--throttle N]` builds the
 * page, opens it in headless Chromium with the network blocked and writes:
 *
 *   <name>-still.png      the still frame, enlarged as the page shows it
 *   <name>-ta..td.png     four moments of the loop (0, 1/4, 1/2, 3/4)
 *   <name>-hover.png      the pointer on the first hot group
 *   <name>-press.png      half a second after a press on the last hot group
 *   <name>-mobile.png     the whole page at 390 px wide
 *
 * It writes <name>-look.json (the full report) and prints one PASS/FAIL line per
 * check (errors, offline, fill, motion, seam, picking, hover, press, reduced
 * motion, mobile overflow, frame cost), and exits 1 on any FAIL.
 *
 * Frame cost is judged against the scene's own frame budget, 1000 / fps ms (41.7
 * at the default 24 fps): a frame that does not fit its slot drops. Over 12 ms
 * prints a SLOW note, not a failure: it depends on the machine (a CI runner or
 * `--throttle 4` is several times slower than a laptop). PIXEL_LOOK_BUDGET_MS
 * overrides the budget. Playwright comes from this skill's devDependency
 * (`npm ci --ignore-scripts`); the browser is CHROME_PATH or an installed
 * Chrome/Chromium. The page itself needs nothing.
 */
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "./build.mjs";

const args = process.argv.slice(2), flags = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith("--")) flags[args[i].slice(2)] = args[++i];
const [src, outArg] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!src || !outArg) { console.error("usage: node look.mjs <scene.js> <outdir> [--press x,y]"); process.exit(2); }
let chromium;
try { ({ chromium } = await import("playwright-core")); }
catch { console.error("playwright-core is missing: run `npm ci --ignore-scripts` in this skill's folder"); process.exit(2); }
const outdir = resolve(outArg); mkdirSync(outdir, { recursive: true });
const name = basename(src, ".js");
const { file, bytes } = build(src, join(outdir, `pixel-${name}.html`));
const executablePath = process.env.CHROME_PATH || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
if (!executablePath) { console.error("no Chrome or Chromium found: set CHROME_PATH"); process.exit(2); }

const browser = await chromium.launch({ executablePath, headless: true });
const report = { scene: name, html: file, bytes, errors: [], network: [], images: [], checks: [] };
const check = (label, pass, detail) => report.checks.push({ label, pass: !!pass, detail });
try {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await context.route(/^https?:/, (r) => { report.network.push(r.request().url()); return r.abort(); });
  const page = await context.newPage();
  /* --throttle N slows the CPU N times through the DevTools protocol, to look the way a slow CI runner or phone would */
  const throttle = Number(flags.throttle || process.env.PIXEL_LOOK_THROTTLE || 1);
  if (throttle > 1) { const cdp = await context.newCDPSession(page); await cdp.send("Emulation.setCPUThrottlingRate", { rate: throttle }); report.throttle = throttle; }
  page.on("pageerror", (e) => report.errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") report.errors.push(m.text()); });
  await page.goto(pathToFileURL(file).href + "?still");
  await page.waitForFunction(() => window.__pixel?.runtime);
  const meta = await page.evaluate(() => ({ duration: window.__pixel.spec.duration || 6, still: window.__pixel.spec.still || 0, hint: window.__pixel.spec.hint || "", fps: window.__pixel.spec.fps == null ? 24 : window.__pixel.spec.fps }));
  const pixels = () => page.evaluate(() => { const c = document.getElementById("stage"); return Array.from(c.getContext("2d").getImageData(0, 0, c.width, c.height).data); });
  const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++; return n / (a.length / 4); };
  const shot = async (t, label) => {
    if (t != null) await page.evaluate((x) => window.__pixel.runtime.renderAt(x), t);
    const path = join(outdir, `${name}-${label}.png`);
    await page.locator("#stage").screenshot({ path }); report.images.push(path); return path;
  };
  await shot(meta.still, "still");
  const still = await pixels();
  const fill = still.reduce((n, v, i) => (i % 4 === 0 && Math.min(v, still[i + 1], still[i + 2]) < 245 ? n + 1 : n), 0) / (still.length / 4);
  check("fill: the scene covers enough of the frame", fill > .25 && fill < .9, +fill.toFixed(3));
  const frames = [];
  for (const [k, f] of [["a", 0], ["b", .25], ["c", .5], ["d", .75]]) { await shot(meta.duration * f, `t${k}`); frames.push(await pixels()); }
  const motion = Math.max(diff(frames[0], frames[1]), diff(frames[1], frames[2]), diff(frames[2], frames[3]));
  check("motion: the loop changes the picture", motion > .002, +motion.toFixed(4));
  const seam = diff(frames[0], (await page.evaluate((x) => window.__pixel.runtime.renderAt(x), meta.duration), await pixels()));
  check("seam: the loop's end matches its start", seam < .01, +seam.toFixed(4));
  /* the pointer: find a pixel of each hot group, hover the first, press the last */
  const hotPoints = await page.evaluate(() => {
    const rt = window.__pixel.runtime, hot = rt.parts.hot || [], found = hot.map(() => null), c = document.getElementById("stage");
    for (let y = .98; y > -1 && found.includes(null); y -= .02) for (let x = -.98; x < 1; x += .02) { const g = rt.hoverAt(x, y); const i = hot.indexOf(g); if (i >= 0 && !found[i]) found[i] = [x, y]; }
    rt.hoverAt(5, 5); return { names: hot.map((g) => g.name || ""), found };
  });
  check("pointer: every hot group can be picked", hotPoints.found.every(Boolean), hotPoints.names);
  await page.evaluate((x) => window.__pixel.runtime.renderAt(x), meta.still);
  const base = await pixels();
  if (hotPoints.found[0]) {
    const [x, y] = hotPoints.found[0];
    const box = await page.locator("#stage").boundingBox();
    await page.mouse.move(box.x + (x + 1) / 2 * box.width, box.y + (y + 1) / 2 * box.height);
    await shot(null, "hover");
    const h = diff(base, await pixels()), read = await page.locator("#read").textContent();
    check("hover: the hovered group lights up and the read-out names it", h > .0005 && read === hotPoints.names[0], { changed: +h.toFixed(4), read });
    await page.mouse.move(0, 0);
  }
  const named = /\b(?:tap|press|click)\s+(?:on\s+)?(?:the\s+|a\s+)?([a-z-]+)/i.exec(meta.hint)?.[1]?.toLowerCase();
  const pressIdx = named ? hotPoints.names.findIndex((n) => n.toLowerCase().startsWith(named)) : -1;
  const target = flags.press ? flags.press.split(",").map(Number) : hotPoints.found[pressIdx >= 0 ? pressIdx : hotPoints.found.length - 1];
  if (target && /\b(tap|press|click)\b/i.test(meta.hint)) {
    const t0 = meta.still;
    await page.evaluate(([x, y, t]) => { const rt = window.__pixel.runtime; rt.renderAt(t); rt.tap(x, y); rt.hoverAt(5, 5); rt.renderAt(t + .5); }, [...target, t0]);
    await shot(null, "press");
    const after = await pixels();
    await page.evaluate((t) => { const rt = window.__pixel.runtime; rt.ctx.pressed = null; rt.renderAt(t + .5); }, t0);
    const p = diff(after, await pixels());
    check("press: a tap changes the scene (the hint promises one)", p > .0005, +p.toFixed(4));
  }
  /* reduced motion: the still frame and no loop */
  const reduced = await context.newPage();
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(pathToFileURL(file).href);
  await reduced.waitForFunction(() => window.__pixel?.runtime);
  const r = await reduced.evaluate(async () => { const a = window.__pixel.runtime.stats().frames; await new Promise((ok) => setTimeout(ok, 600)); const s = window.__pixel.runtime.stats(); return { running: s.running, frames: s.frames - a }; });
  check("reduced motion: the page holds the still frame", !r.running && r.frames === 0, r);
  await reduced.close();
  /* frame cost and rate */
  report.render = await page.evaluate(() => {
    const rt = window.__pixel.runtime, n = 120, ts = [];
    for (let i = 0; i < n; i++) { const a = performance.now(); rt.renderAt(i / 30); ts.push(performance.now() - a); }
    ts.sort((a, b) => a - b);
    return { frames: n, medianMs: +ts[n >> 1].toFixed(2), p95Ms: +ts[Math.floor(n * .95)].toFixed(2), tris: rt.stats().tris, size: [rt.stats().width, rt.stats().height] };
  });
  const budget = Number(process.env.PIXEL_LOOK_BUDGET_MS) || 1000 / (meta.fps || 24);
  report.render.budgetMs = +budget.toFixed(1);
  check(`frame cost: median within the ${report.render.budgetMs} ms frame budget`, report.render.medianMs <= budget, report.render);
  if (report.render.medianMs > 12) report.notes = [`SLOW median frame ${report.render.medianMs} ms (over 12 ms on this machine${report.throttle ? `, CPU throttled ${report.throttle}x` : ""})`];
  report.fps = await page.evaluate(async () => {
    const rt = window.__pixel.runtime; rt.start();
    await new Promise((ok) => setTimeout(ok, 300));
    const f0 = rt.stats().frames, t0 = performance.now();
    await new Promise((ok) => setTimeout(ok, 2000));
    const fps = (rt.stats().frames - f0) / ((performance.now() - t0) / 1000); rt.stop();
    return +fps.toFixed(1);
  });
  /* mobile */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(pathToFileURL(file).href + "?still");
  await page.waitForFunction(() => window.__pixel?.runtime);
  const path = join(outdir, `${name}-mobile.png`); await page.screenshot({ path, fullPage: true }); report.images.push(path);
  check("mobile: no horizontal overflow", await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
} finally {
  await browser.close();
}
check("no browser errors", report.errors.length === 0, report.errors);
check("offline: no network request", report.network.length === 0, report.network);
writeFileSync(join(outdir, `${name}-look.json`), JSON.stringify(report, null, 2) + "\n");
console.log(`${name}: ${report.bytes} bytes, median frame ${report.render?.medianMs} ms (p95 ${report.render?.p95Ms}), ${report.fps} fps${report.throttle ? `, CPU ${report.throttle}x slower` : ""}`);
for (const n of report.notes || []) console.log(n);
for (const c of report.checks) console.log(`${c.pass ? "PASS" : "FAIL"} ${c.label}${c.pass ? "" : ` (${JSON.stringify(c.detail)})`}`);
console.log(`report: ${join(outdir, `${name}-look.json`)}`);
if (report.checks.some((c) => !c.pass)) process.exitCode = 1;
