#!/usr/bin/env node
/**
 * The look in one command, run from the working directory:
 *
 *   node <skill>/scripts/look.mjs <name>.js [--pointer x,y] [--out dir] [--theme name] [--three]
 *
 * It builds the page as build.mjs does, validates it as validate.mjs does,
 * opens it in headless Chromium with WebGL, and writes one sheet of pictures,
 * diorama-<name>-look.png:
 *
 *   rest      the still frame (what reduced motion and a thumbnail show)
 *   t+1.5s    early in the loop
 *   t+4s      mid loop
 *   t+8s      later in the loop (a loop should have moved on, not reset)
 *   pointer   the pointer at --pointer (default the centre), after settling
 *   corner    the pointer at the top-right corner (the camera tilt)
 *   press     a click or a tap at --pointer, 1.5 s later: what a visitor on a phone gets
 *   thumb     the stage at thumbnail size: 160px for a mini, 390px for the others
 *   page      the whole bench, as a visitor sees it
 *
 * Then it prints what can be measured, one line each:
 *   console   errors and warnings from the page (any error fails)
 *   webgl     whether a context was created
 *   fill      how much of the stage the scene covers (a small scene is reported)
 *   motion    the share of stage pixels that change between t+1.5s and t+4s
 *   answer    the share that changes when the pointer arrives
 *   press     the share that changes because of the press (against the same second without one);
 *             MUTE when the hint promises a tap, a click or a press and nothing changes (under 0.1%: one arm
 *             swinging in a line drawing is a few tenths of a percent)
 *   frame     milliseconds per tick+render in this headless browser (a budget hint, not a verdict)
 *   clash     moving parts that pass through other parts over the first 40 s: the pair, how deep,
 *             when first. A vehicle through a tree or two cars in one lane is a bug; forks in a rack,
 *             a flag on its hinge or an arm holding a rocket is a contact on purpose. Judge it on the sheet.
 *             Ground that things stand on (a hill, a mountain) is not tested: mark it `userData.terrain = true`.
 *
 * Exits 1 when the validator rejects the page, the console has an error, or
 * no WebGL context was made; 2 when it cannot run; 0 otherwise. Everything
 * else is for eyes, on the sheet. --three looks at the page on three.js r128
 * (the kit's copy, served in place of the cdnjs script) instead of three-lite.
 *
 * Playwright: it looks for playwright-core (or playwright) next to the working
 * directory, globally, or in a cache folder of the user's, and installs
 * playwright-core there once if none is found (DIORAMA_LOOK_CACHE moves the
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
  const cache = process.env.DIORAMA_LOOK_CACHE || join(homedir(), ".cache", "diorama-look");
  const globalRoot = spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout?.trim();
  const paths = [process.cwd(), cache, here("."), globalRoot].filter(Boolean).map((p) => join(p, "node_modules", "x.js"));
  for (const pkg of ["playwright-core", "playwright"]) {
    for (const p of paths) {
      try { const mod = await import(pathToFileURL(req.resolve(pkg, { paths: [dirname(p)] })).href); return mod.chromium ?? mod.default?.chromium; } catch {}
    }
  }
  mkdirSync(cache, { recursive: true });
  if (!existsSync(join(cache, "package.json"))) writeFileSync(join(cache, "package.json"), '{"name":"diorama-look","private":true}');
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
/* Moving parts against everything else, over the first `span` seconds: every mesh is an oriented box (its
   geometry's bounds under its world matrix); a part is "moving" when its own transform changes; two boxes
   from different movers (or a mover and a static part) that overlap by more than `tol` on every separating
   axis are a clash. The slab, the ground zones and shadowless decoration (particles, windows) are skipped. */
const CLASH = ({ span, dt, tol }) => {
  const c = window.__diorama, T = window.THREE; c.stop(); const world = c.world;
  const objs = []; world.traverse((o) => { if (o !== world) objs.push(o); });
  const meshes = objs.filter((o) => o.isMesh && !o.userData.stroke);
  meshes.forEach((m) => { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); });
  const sig = (o) => [o.position.x, o.position.y, o.position.z, o.rotation.x, o.rotation.y, o.rotation.z, o.scale.x, o.scale.y, o.scale.z, o.visible ? 1 : 0].map((v) => +v.toFixed(4)).join(",");
  const frames = Math.round(span / dt), base = new Map(), animated = new Set();
  c.t = 0; c.step(0); world.updateMatrixWorld(true); objs.forEach((o) => base.set(o, sig(o)));
  for (let f = 1; f <= frames; f++) { c.step(dt); objs.forEach((o) => { if (!animated.has(o) && sig(o) !== base.get(o)) animated.add(o); }); }
  const rootOf = (m) => { let r = null; for (let o = m; o && o !== world; o = o.parent) if (animated.has(o)) r = o; return r; };
  const roots = new Map(); meshes.forEach((m) => roots.set(m, rootOf(m)));
  world.updateMatrixWorld(true); const wb = new T.Box3().setFromObject(world); const area = (wb.max.x - wb.min.x) * (wb.max.z - wb.min.z);
  const skip = new Set(); meshes.forEach((m) => { const b = new T.Box3().setFromObject(m); const a = (b.max.x - b.min.x) * (b.max.z - b.min.z); let terrain = false; for (let o = m; o && o !== world; o = o.parent) if (o.userData.terrain) terrain = true;
    if (terrain || b.max.y <= 0.15 || a > 0.3 * area || !m.castShadow) skip.add(m); });
  const wp = new T.Vector3();
  const label = (o) => o.name || (o.geometry ? o.geometry.type.replace("Geometry", "") : o.type) + "@" + (o.getWorldPosition(wp), [wp.x, wp.z].map((q) => +q.toFixed(1)).join(","));
  c.t = 0; c.step(0); world.updateMatrixWorld(true); const LAB = new Map(); objs.forEach((o) => LAB.set(o, label(o)));
  const rootLabel = (m) => { const r = roots.get(m); return r ? LAB.get(r) : "static " + LAB.get(m); };
  const boxOf = (m) => { const bb = m.geometry.boundingBox, M = m.matrixWorld.elements;
    const ctr = new T.Vector3().addVectors(bb.min, bb.max).multiplyScalar(0.5).applyMatrix4(m.matrixWorld);
    const ax = [new T.Vector3(M[0], M[1], M[2]), new T.Vector3(M[4], M[5], M[6]), new T.Vector3(M[8], M[9], M[10])];
    const e = [(bb.max.x - bb.min.x) / 2 * ax[0].length(), (bb.max.y - bb.min.y) / 2 * ax[1].length(), (bb.max.z - bb.min.z) / 2 * ax[2].length()];
    ax.forEach((a) => a.normalize()); return { c: ctr, ax, e }; };
  const d = new T.Vector3(), L = new T.Vector3();
  const overlap = (A, B) => { let best = Infinity; d.subVectors(B.c, A.c);
    const test = (v) => { const l = v.length(); if (l < 1e-6) return; v.multiplyScalar(1 / l); let ra = 0, rb = 0;
      for (let k = 0; k < 3; k++) { ra += A.e[k] * Math.abs(A.ax[k].dot(v)); rb += B.e[k] * Math.abs(B.ax[k].dot(v)); }
      const o = ra + rb - Math.abs(d.dot(v)); if (o < best) best = o; };
    for (let k = 0; k < 3; k++) { test(L.copy(A.ax[k])); test(L.copy(B.ax[k])); }
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) test(L.crossVectors(A.ax[i], B.ax[j]));
    return best; };
  const visible = (m) => { for (let o = m; o && o !== world; o = o.parent) if (!o.visible) return false; return true; };
  const movers = meshes.filter((m) => roots.get(m) && !skip.has(m)), others = meshes.filter((m) => !skip.has(m)), pairs = new Map();
  for (let f = 0; f <= frames; f++) { if (f) c.step(dt); world.updateMatrixWorld(true);
    const bx = new Map(); others.forEach((m) => { if (visible(m)) bx.set(m, boxOf(m)); });
    for (const a of movers) { const A = bx.get(a); if (!A) continue; const ra = roots.get(a);
      for (const o of others) { if (o === a || roots.get(o) === ra) continue; if (roots.get(o) && o.id < a.id) continue; const B = bx.get(o); if (!B) continue;
        const depth = overlap(A, B); if (depth <= tol) continue;
        const key = rootLabel(a) + " × " + rootLabel(o); const e = pairs.get(key) || { n: 0, max: 0, first: c.t }; e.n++; e.max = Math.max(e.max, depth); pairs.set(key, e); } } }
  return [...pairs].map(([pair, e]) => ({ pair, frames: e.n, depth: +e.max.toFixed(2), first: +e.first.toFixed(1) })).sort((x, y) => y.depth - x.depth);
};

const MEASURE = async ([a, b]) => {
  /* fill: the scene's silhouette, row by row from the first to the last pixel that differs from the
     background, so a line drawing counts its white faces; changed: pixels that differ between a and b */
  const load = async (b64) => { const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
    const c = Object.assign(document.createElement("canvas"), { width: img.width, height: img.height }), x = c.getContext("2d"); x.drawImage(img, 0, 0); return { d: x.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height }; };
  const IA = await load(a), IB = b ? await load(b) : null, A = IA.d, B = IB && IB.d, w = IA.w, h = IA.h, n = w * h;
  /* the background is read two pixels in from the corner, and the outermost pixel ring is left out, so a border or an antialiased edge is not counted as scene */
  const g0 = 4 * (2 * w + 2), g = [A[g0], A[g0 + 1], A[g0 + 2], A[g0 + 3]];
  const diff = (P, k, Q, l) => Math.max(Math.abs(P[k] - Q[l]), Math.abs(P[k + 1] - Q[l + 1]), Math.abs(P[k + 2] - Q[l + 2]), Math.abs(P[k + 3] - Q[l + 3]));
  let filled = 0, changed = 0;
  for (let y = 1; y < h - 1; y++) { let first = -1, last = -1;
    for (let x = 1; x < w - 1; x++) { const k = 4 * (y * w + x);
      if (diff(A, k, g, 0) >= 18) { if (first < 0) first = x; last = x; }
      if (B && diff(A, k, B, k) >= 18) changed++; }
    if (first >= 0) filled += last - first + 1; }
  return { fill: filled / n, changed: changed / n };
};

async function main() {
  const src = process.argv.slice(2).find((a) => !a.startsWith("--") && a.endsWith(".js"));
  if (!src) { console.error("usage: node look.mjs <name>.js [--pointer x,y] [--out dir] [--theme name]"); process.exit(2); }
  const figure = readFileSync(src, "utf8");
  const name = nameOf(figure) ?? basename(src, ".js");
  const outDir = resolve(arg("--out", "."));
  mkdirSync(outDir, { recursive: true });
  const onThree = process.argv.includes("--three");
  const html = assemble(figure, { three: onThree });
  const pageFile = join(outDir, `diorama-${name}${onThree ? "-three" : ""}.html`);
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

  const ok = await page.evaluate(() => !!(window.__diorama && window.__diorama.renderer && window.__diorama.renderer.getContext()));
  const stage = page.locator("#stage");
  const shots = {};
  const stageShot = async () => (await stage.screenshot({ omitBackground: false })).toString("base64");

  const goto = async (t, pt) => {
    await page.evaluate(([t, pt, STEP]) => {
      const c = window.__diorama; c.stop();
      if (pt) { c.pointer.inside = true; c.pointer.x = pt[0]; c.pointer.y = pt[1]; } else { c.pointer.inside = false; }
      while (c.t < t - 1e-9) c.step(Math.min(STEP, t - c.t));
      c.render();
    }, [t, pt, STEP]);
  };
  const fresh = async () => { await page.evaluate(() => { const c = window.__diorama; c.destroy(); window.__diorama = Diorama.mount(c.fig, { el: document.getElementById("stage"), reduced: false, theme: new URLSearchParams(location.search).get("theme") || undefined }); window.__diorama.stop(); window.__diorama.t = 0; }); await page.waitForTimeout(50); };

  await page.evaluate(() => { const c = window.__diorama; c.stop(); c.stillFrame(); });
  shots.rest = await stageShot();
  await fresh(); await goto(1.5); shots["t+1.5s"] = await stageShot();
  await goto(4); shots["t+4s"] = await stageShot();
  await goto(8); shots["t+8s"] = await stageShot();
  await fresh(); await goto(4); const before = await stageShot();
  await goto(4 + SETTLE, pointer); shots.pointer = await stageShot();
  await goto(4 + 2 * SETTLE, [0.95, 0.95]); shots.corner = await stageShot();
  /* the press: on the hot group --press names (or x,y), else on the one the hint names after "tap", "click" or
     "press", else at the pointer; the same second with and without it, so motion does not count as an answer */
  const pressArg = arg("--press", null);
  const hintText = /\bhint:\s*["'`]([^"'`]*)["'`]/.exec(figure)?.[1] ?? "";
  const TARGET = ([pressArg, hint, cur]) => {
    const c = window.__diorama, hot = (c.parts && c.parts.hot) || [], h = hint.toLowerCase();
    const ndcOf = (g) => { const v = new THREE.Vector3(); g.getWorldPosition(v); v.y += 0.4; v.applyMatrix4(c.cam.matrixWorldInverse).applyMatrix4(c.cam.projectionMatrix); return [v.x, v.y]; };
    if (pressArg && /^-?[\d.]+,-?[\d.]+$/.test(pressArg)) return { at: pressArg.split(",").map(Number), name: "" };
    let g = null;
    if (pressArg) g = hot.find((o) => (o.name || "").toLowerCase() === pressArg.toLowerCase()) || null;
    else { const m = /\b(tap|click|press)/.exec(h), from = m ? m.index : -1;
      g = hot.filter((o) => o.name && h.indexOf(o.name.toLowerCase()) > from).sort((a, b) => h.indexOf(a.name.toLowerCase()) - h.indexOf(b.name.toLowerCase()))[0] || null; }
    return g ? { at: ndcOf(g), name: g.name } : { at: cur, name: "" };
  };
  await fresh(); await goto(2);
  const target = await page.evaluate(TARGET, [pressArg, hintText, pointer]);
  await fresh(); await goto(4 + 3 * SETTLE, target.at); const unpressed = await stageShot();
  await fresh(); await goto(4 + 2 * SETTLE, target.at);
  const pressedName = await page.evaluate(([T, args, named]) => { const c = window.__diorama, at = named ? eval("(" + T + ")")(args).at : args[2]; const g = c.tap(at[0], at[1]); return g ? g.name || "something" : ""; }, [TARGET.toString(), [pressArg, hintText, target.at], !!target.name]);
  await goto(4 + 3 * SETTLE, target.at); shots.press = await stageShot();
  const frameMs = await page.evaluate(() => { const c = window.__diorama; const t0 = performance.now(); for (let i = 0; i < 20; i++) { c.step(1 / 60); c.render(); } return (performance.now() - t0) / 20; });
  await fresh(); await goto(2); shots.page = (await page.screenshot({ fullPage: true })).toString("base64");

  const thumbW = size === "mini" ? 160 : 390;
  await page.evaluate((w) => { const s = document.getElementById("stage"); s.style.width = w + "px"; s.style.height = ""; delete s.dataset.dioramaHeight; }, thumbW);
  await page.waitForTimeout(80);
  await goto(2.5); shots.thumb = await stageShot();

  await fresh();
  const clashes = await page.evaluate(CLASH, { span: 40, dt: 0.1, tol: 0.2 });

  const m = {};
  m.fill = await page.evaluate(MEASURE, [shots.rest, null]);
  m.motion = await page.evaluate(MEASURE, [shots["t+1.5s"], shots["t+4s"]]);
  m.answer = await page.evaluate(MEASURE, [before, shots.pointer]);
  m.press = await page.evaluate(MEASURE, [unpressed, shots.press]);

  const order = ["rest", "t+1.5s", "t+4s", "t+8s", "pointer", "corner", "press", "thumb", "page"];
  const sheet = await page.evaluate(async ([shots, order, name]) => {
    const imgs = {};
    for (const k of order) { const img = new Image(); img.src = "data:image/png;base64," + shots[k]; await img.decode(); imgs[k] = img; }
    const cell = 420, pad = 16, label = 26, cols = 3, rows = Math.ceil(order.length / cols);
    const c = Object.assign(document.createElement("canvas"), { width: cols * (cell + pad) + pad, height: rows * (cell + label + pad) + pad + 30 });
    const x = c.getContext("2d"); x.fillStyle = "#f3f5fa"; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = "#1b2638"; x.font = "700 16px system-ui, sans-serif"; x.fillText("diorama · " + name + (new URLSearchParams(location.search).get("theme") ? "" : ""), pad, 22);
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
  const sheetFile = join(outDir, `diorama-${name}${themeName ? "-" + themeName : ""}${onThree ? "-three" : ""}-look.png`);
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
  const hint = /\bhint:\s*["'`]([^"'`]*)["'`]/.exec(figure)?.[1] ?? "";
  const promisesPress = /\b(tap|click|press)/i.test(hint);
  console.log(`${promisesPress && m.press.changed < 0.001 ? "MUTE" : promisesPress ? "ok  " : "info"} press: ${pct(m.press.changed)} of the stage changes after a press${pressedName ? ` on ${pressedName}` : " on nothing"}${promisesPress ? "" : " (the hint promises none)"}`);
  console.log(`info frame: ${frameMs.toFixed(1)} ms per tick+render here (software GL; a real GPU is far faster)`);
  if (clashes.length) { console.log(`CLASH clash: ${clashes.length} pair${clashes.length > 1 ? "s" : ""} pass through each other (depth in world units; look at the sheet at that second)`); for (const c of clashes.slice(0, 8)) console.log(`      ${c.pair}  depth ${c.depth}  from ${c.first}s  ${c.frames} frames`); }
  else console.log("ok   clash: nothing moving passes through anything else");
  if (logs.some((l) => l.startsWith("error")) || !ok) fail = true;
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(e.message || e); process.exit(2); });
