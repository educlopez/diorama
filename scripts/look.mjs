#!/usr/bin/env node
/**
 * The look in one command, run from the working directory:
 *
 *   node <skill>/scripts/look.mjs <name>.js [--pointer x,y] [--out dir] [--theme name]
 *
 * It builds the page as build.mjs does, validates it as validate.mjs does,
 * opens it in headless Chromium with WebGL, and writes one sheet of pictures,
 * 3d-world-<name>-look.png:
 *
 *   rest      the still frame (what reduced motion and a thumbnail show)
 *   t+1.5s    early in the loop
 *   t+4s      mid loop
 *   t+8s      later in the loop (a loop should have moved on, not reset)
 *   pointer   the pointer at --pointer (default the centre), after settling
 *   corner    the pointer at the top-right corner (the camera tilt)
 *   thumb     the stage at thumbnail size: 160px for a mini, 390px for the others
 *   page      the whole bench, as a visitor sees it
 *
 * Then it prints what can be measured, one line each:
 *   console   errors and warnings from the page (any error fails)
 *   webgl     whether a context was created
 *   fill      how much of the stage the scene covers (a small scene is reported)
 *   motion    the share of stage pixels that change between t+1.5s and t+4s
 *   answer    the share that changes when the pointer arrives
 *   frame     milliseconds per tick+render in this headless browser (a budget hint, not a verdict)
 *
 * Exits 1 when the validator rejects the page, the console has an error, or
 * no WebGL context was made; 2 when it cannot run; 0 otherwise. Everything
 * else is for eyes, on the sheet.
 *
 * Playwright: it looks for playwright-core (or playwright) next to the working
 * directory, globally, or in a cache folder of the user's, and installs
 * playwright-core there once if none is found (WORLD3D_LOOK_CACHE moves the
 * folder). It drives Playwright's Chromium, with software GL when there is no GPU.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assemble, nameOf, THREE_CDN } from "./build.mjs";
import { report, validate } from "./validate.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const SETTLE = 1.5, STEP = 1 / 60;
const VIEW = { hero: [1180, 900], card: [600, 640], mini: [480, 560] };

function arg(name, dflt) { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : dflt; }

async function playwright() {
  const req = createRequire(import.meta.url);
  const cache = process.env.WORLD3D_LOOK_CACHE || join(homedir(), ".cache", "3d-world-look");
  const globalRoot = spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout?.trim();
  const paths = [process.cwd(), cache, here("."), globalRoot].filter(Boolean).map((p) => join(p, "node_modules", "x.js"));
  for (const pkg of ["playwright-core", "playwright"]) {
    for (const p of paths) {
      try { const mod = await import(pathToFileURL(req.resolve(pkg, { paths: [dirname(p)] })).href); return mod.chromium ?? mod.default?.chromium; } catch {}
    }
  }
  mkdirSync(cache, { recursive: true });
  if (!existsSync(join(cache, "package.json"))) writeFileSync(join(cache, "package.json"), '{"name":"3d-world-look","private":true}');
  console.error(`installing playwright-core into ${cache} (once)…`);
  const r = spawnSync("npm", ["install", "playwright-core", "--no-audit", "--no-fund", "--silent"], { cwd: cache, stdio: "inherit" });
  if (r.status !== 0) throw new Error("could not install playwright-core");
  const mod = await import(pathToFileURL(req.resolve("playwright-core", { paths: [cache] })).href);
  return mod.chromium ?? mod.default?.chromium;
}

async function launch(chromium) {
  const args = ["--use-gl=angle", "--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"];
  for (const opts of [{ channel: "chrome", args }, { args }]) {
    try { return await chromium.launch(opts); } catch (e) { var err = e; }
  }
  throw new Error("no browser: install Chrome, or run `npx playwright-core install chromium`.\n" + (err?.message || ""));
}

/** Pixels of a PNG that differ from the stage's clear colour, and between two PNGs, measured inside the page. */
const MEASURE = async ([a, b]) => {
  const load = async (b64) => { const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height }), x = c.getContext("2d"); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
  const A = await load(a), B = b ? await load(b) : null, n = A.length / 4; let inked = 0, changed = 0;
  const g = [A[4 * 6], A[4 * 6 + 1], A[4 * 6 + 2], A[4 * 6 + 3]];
  for (let i = 0; i < n; i++) { const k = 4 * i;
    const d = Math.max(Math.abs(A[k] - g[0]), Math.abs(A[k + 1] - g[1]), Math.abs(A[k + 2] - g[2]), Math.abs(A[k + 3] - g[3]));
    if (d >= 18) inked++;
    if (B) { const e = Math.max(Math.abs(A[k] - B[k]), Math.abs(A[k + 1] - B[k + 1]), Math.abs(A[k + 2] - B[k + 2]), Math.abs(A[k + 3] - B[k + 3])); if (e >= 18) changed++; } }
  return { fill: inked / n, changed: changed / n };
};

async function main() {
  const src = process.argv.slice(2).find((a) => !a.startsWith("--") && a.endsWith(".js"));
  if (!src) { console.error("usage: node look.mjs <name>.js [--pointer x,y] [--out dir] [--theme name]"); process.exit(2); }
  const figure = readFileSync(src, "utf8");
  const name = nameOf(figure) ?? basename(src, ".js");
  const outDir = resolve(arg("--out", "."));
  mkdirSync(outDir, { recursive: true });
  const html = assemble(figure);
  const pageFile = join(outDir, `3d-world-${name}.html`);
  writeFileSync(pageFile, html);
  console.log(pageFile);
  const valid = report(validate(html));
  const size = /\bsize:\s*["'`](hero|card|mini)["'`]/.exec(figure)?.[1] ?? "card";
  const [vw, vh] = VIEW[size];
  const pointer = (arg("--pointer", "0.1,0.1")).split(",").map(Number);
  const themeName = arg("--theme", null);

  const chromium = await playwright();
  const browser = await launch(chromium);
  const three = readFileSync(here("../kit/three.min.js"), "utf8");
  const context = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
  await context.route(THREE_CDN, (r) => r.fulfill({ body: three, contentType: "application/javascript" }));
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ body: "", contentType: "text/css" }));
  const page = await context.newPage();
  const logs = [];
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => logs.push(`error: ${e.message}`));
  await page.goto(pathToFileURL(pageFile).href + (themeName ? "?theme=" + encodeURIComponent(themeName) : ""));
  await page.waitForTimeout(400);

  const ok = await page.evaluate(() => !!(window.__world3d && window.__world3d.renderer && window.__world3d.renderer.getContext()));
  const stage = page.locator("#stage");
  const shots = {};
  const stageShot = async () => (await stage.screenshot({ omitBackground: false })).toString("base64");

  const goto = async (t, pt) => {
    await page.evaluate(([t, pt, STEP]) => {
      const c = window.__world3d; c.stop();
      if (pt) { c.pointer.inside = true; c.pointer.x = pt[0]; c.pointer.y = pt[1]; } else { c.pointer.inside = false; }
      while (c.t < t - 1e-9) c.step(Math.min(STEP, t - c.t));
      c.render();
    }, [t, pt, STEP]);
  };
  const fresh = async () => { await page.evaluate(() => { const c = window.__world3d; c.destroy(); window.__world3d = World3D.mount(c.fig, { el: document.getElementById("stage"), reduced: false, theme: new URLSearchParams(location.search).get("theme") || undefined }); window.__world3d.stop(); window.__world3d.t = 0; }); await page.waitForTimeout(50); };

  await page.evaluate(() => { const c = window.__world3d; c.stop(); c.stillFrame(); });
  shots.rest = await stageShot();
  await fresh(); await goto(1.5); shots["t+1.5s"] = await stageShot();
  await goto(4); shots["t+4s"] = await stageShot();
  await goto(8); shots["t+8s"] = await stageShot();
  await fresh(); await goto(4); const before = await stageShot();
  await goto(4 + SETTLE, pointer); shots.pointer = await stageShot();
  await goto(4 + 2 * SETTLE, [0.95, 0.95]); shots.corner = await stageShot();
  const frameMs = await page.evaluate(() => { const c = window.__world3d; const t0 = performance.now(); for (let i = 0; i < 20; i++) { c.step(1 / 60); c.render(); } return (performance.now() - t0) / 20; });
  await fresh(); await goto(2); shots.page = (await page.screenshot({ fullPage: true })).toString("base64");

  const thumbW = size === "mini" ? 160 : 390;
  await page.evaluate((w) => { const s = document.getElementById("stage"); s.style.width = w + "px"; s.style.height = ""; delete s.dataset.world3dHeight; }, thumbW);
  await page.waitForTimeout(80);
  await goto(2.5); shots.thumb = await stageShot();

  const m = {};
  m.fill = await page.evaluate(MEASURE, [shots.rest, null]);
  m.motion = await page.evaluate(MEASURE, [shots["t+1.5s"], shots["t+4s"]]);
  m.answer = await page.evaluate(MEASURE, [before, shots.pointer]);

  const order = ["rest", "t+1.5s", "t+4s", "t+8s", "pointer", "corner", "thumb", "page"];
  const sheet = await page.evaluate(async ([shots, order, name]) => {
    const imgs = {};
    for (const k of order) { const img = new Image(); img.src = "data:image/png;base64," + shots[k]; await img.decode(); imgs[k] = img; }
    const cell = 420, pad = 16, label = 26, cols = 4, rows = Math.ceil(order.length / cols);
    const c = Object.assign(document.createElement("canvas"), { width: cols * (cell + pad) + pad, height: rows * (cell + label + pad) + pad + 30 });
    const x = c.getContext("2d"); x.fillStyle = "#f3f5fa"; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "#1b2638"; x.font = "700 16px system-ui, sans-serif"; x.fillText("3d-world · " + name + (new URLSearchParams(location.search).get("theme") ? "" : ""), pad, 22);
    order.forEach((k, i) => {
      const img = imgs[k], col = i % cols, row = Math.floor(i / cols), ox = pad + col * (cell + pad), oy = 30 + pad + row * (cell + label + pad);
      x.fillStyle = "#56667f"; x.font = "600 13px system-ui, sans-serif"; x.fillText(k, ox, oy + 16);
      const s = Math.min(cell / img.width, cell / img.height), w = img.width * s, h = img.height * s;
      x.fillStyle = "#ffffff"; x.fillRect(ox, oy + label, cell, cell); x.strokeStyle = "rgba(28,44,74,.12)"; x.strokeRect(ox + .5, oy + label + .5, cell - 1, cell - 1);
      x.drawImage(img, ox + (cell - w) / 2, oy + label + (cell - h) / 2, w, h);
    });
    document.body.innerHTML = ""; document.body.style.margin = "0"; document.body.appendChild(c);
    return [c.width, c.height];
  }, [shots, order, name + (themeName ? " · " + themeName : "")]);
  await page.setViewportSize({ width: sheet[0], height: sheet[1] });
  const sheetFile = join(outDir, `3d-world-${name}${themeName ? "-" + themeName : ""}-look.png`);
  await page.locator("canvas").first().screenshot({ path: sheetFile });
  await browser.close();

  const pct = (v) => (v * 100).toFixed(1) + "%";
  let fail = !valid;
  console.log(sheetFile);
  console.log(`${logs.length ? "FAIL" : "ok  "} console: ${logs.length ? logs.join(" | ") : "clean"}`);
  console.log(`${ok ? "ok  " : "FAIL"} webgl: ${ok ? "context created" : "no context"}`);
  console.log(`${m.fill.fill < 0.22 ? "SMALL" : "ok  "} fill: ${pct(m.fill.fill)} of the stage is scene (under 22% reads small)`);
  console.log(`${m.motion.changed < 0.003 ? "STILL" : "ok  "} motion: ${pct(m.motion.changed)} of the stage changes between t+1.5s and t+4s`);
  console.log(`${m.answer.changed < 0.003 ? "FAINT" : "ok  "} answer: ${pct(m.answer.changed)} of the stage changes when the pointer arrives`);
  console.log(`info frame: ${frameMs.toFixed(1)} ms per tick+render here (software GL; a real GPU is far faster)`);
  if (logs.some((l) => l.startsWith("error")) || !ok) fail = true;
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e.message || e); process.exit(2); });
