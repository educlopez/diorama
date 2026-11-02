#!/usr/bin/env node
/**
 * Looks at a dither scene: `node look.mjs <scene.js> <outdir>`.
 * Builds the page, opens it in headless Chromium with the network blocked, and writes
 * still, four loop moments, hover, the frame after a tap, a 390 x 844 mobile view,
 * and 8x nearest zooms of the edge, both people, the sails and the shadow. Prints one PASS/FAIL
 * line per check and exits 1 on any failure.
 */
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "./build.mjs";
import { supportAudit, frameTimes, groundFamily, shadowOk, fnBody } from "./support.mjs";

const args = process.argv.slice(2);
const [src, outArg] = args.filter((a) => !a.startsWith("--"));
if (!src || !outArg) { console.error("usage: node look.mjs <scene.js> <outdir>"); process.exit(2); }
let chromium;
try { ({ chromium } = await import("playwright-core")); }
catch { console.error("playwright-core is missing: run `npm ci --ignore-scripts` in this skill's folder"); process.exit(2); }
const outdir = resolve(outArg); mkdirSync(outdir, { recursive: true });
const name = basename(src, ".js");
const { file, bytes } = build(src, join(outdir, `dither-${name}.html`));
const executablePath = process.env.CHROME_PATH || ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
if (!executablePath) { console.error("no Chrome or Chromium found: set CHROME_PATH"); process.exit(2); }

const browser = await chromium.launch({ executablePath, headless: true });
const report = { scene: name, html: file, bytes, errors: [], network: [], images: [], checks: [] };
const check = (label, pass, detail) => report.checks.push({ label, pass: !!pass, detail });
const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) n++; return n / (a.length / 4); };

try {
  const context = await browser.newContext({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 1 });
  await context.route(/^https?:/, (r) => { report.network.push(r.request().url()); return r.abort(); });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  page.on("pageerror", (e) => report.errors.push(String(e.message)));
  page.on("console", (m) => { if (m.type() === "error") report.errors.push(m.text()); });
  const url = pathToFileURL(file).href;
  await page.goto(url + "?still");
  await page.waitForFunction(() => window.__dither?.runtime);
  check("?still: the clock stays paused", await page.evaluate(() => window.__dither.runtime.stats().running === false));
  const meta = await page.evaluate(() => ({
    duration: window.__dither.spec.duration, still: window.__dither.spec.still || 0,
    scene: window.__dither.spec.name || "",
    shadow: window.__dither.spec.shadow || "none",
    snow: !!(window.__dither.spec.materials && window.__dither.spec.materials.snow && window.__dither.spec.materials.snow.ground),
    hint: window.__dither.spec.hint || "", fps: window.__dither.spec.fps == null ? 12 : window.__dither.spec.fps,
    w: document.getElementById("stage").width, h: document.getElementById("stage").height
  }));
  const pixels = () => page.evaluate(() => { const c = document.getElementById("stage"); return Array.from(c.getContext("2d").getImageData(0, 0, c.width, c.height).data); });
  const shot = async (label, locator) => {
    const path = join(outdir, `${name}-${label}.png`);
    await (locator || page.locator("#stage")).screenshot({ path });
    report.images.push(path);
  };
  const supportFails = [];
  const supportSeen = new Set();
  for (const t of frameTimes(meta)) {
    await page.evaluate((time) => window.__dither.runtime.renderAt(time), t);
    const report = await page.evaluate(supportAudit);
    for (const fail of report.fails) {
      if (supportSeen.has(fail.why)) continue;
      supportSeen.add(fail.why);
      supportFails.push(fail.why);
    }
  }
  await page.evaluate((t) => window.__dither.runtime.renderAt(t), meta.still);
  check("support: every declared piece meets its surface", supportFails.length === 0, supportFails);
  await shot("still");
  const still = await pixels();
  const fill = still.reduce((n, v, i) => (i % 4 === 0 && Math.min(v, still[i + 1], still[i + 2]) < 245 ? n + 1 : n), 0) / (still.length / 4);
  check("fill: the scene covers enough of the frame", fill > .25 && fill < .9, +fill.toFixed(3));
  const frameOk = (meta.w === 360 && meta.h === 280) || (meta.w === 480 && meta.h === 360);
  check("frame: internal resolution is 360 x 280 or 480 x 360", frameOk, [meta.w, meta.h]);

  const frames = [];
  for (const [k, f] of [["a", 0], ["b", .25], ["c", .5], ["d", .75]]) {
    await page.evaluate((t) => window.__dither.runtime.renderAt(t), meta.duration * f);
    await shot(`t${k}`);
    frames.push(await pixels());
  }
  const steps = [diff(frames[0], frames[1]), diff(frames[1], frames[2]), diff(frames[2], frames[3])];
  const motion = Math.max(...steps);
  check("motion: the loop changes the picture", motion > .002, steps.map((v) => +v.toFixed(4)));
  const end = await page.evaluate((t) => { window.__dither.runtime.renderAt(t); const c = document.getElementById("stage"); return Array.from(c.getContext("2d").getImageData(0, 0, c.width, c.height).data); }, meta.duration);
  const seam = diff(frames[0], end);
  check("seam: the loop seam is no larger than a step between frames", seam <= Math.min(...steps) + 1e-9, { seam: +seam.toFixed(6), steps: steps.map((v) => +v.toFixed(6)) });

  await page.evaluate((t) => window.__dither.runtime.renderAt(t), meta.still);
  const once = await pixels();
  await page.evaluate((t) => window.__dither.runtime.renderAt(t), meta.still);
  check("determinism: the same time draws the same pixels", diff(once, await pixels()) === 0);

  const hotPoints = await page.evaluate(() => {
    const rt = window.__dither.runtime, hot = rt.parts.hot || [], found = hot.map(() => null);
    for (let y = .98; y > -1 && found.includes(null); y -= .015) for (let x = -.98; x < 1; x += .015) {
      const g = rt.hoverAt(x, y), i = hot.indexOf(g);
      if (i >= 0 && !found[i]) found[i] = [x, y];
    }
    rt.hoverAt(5, 5);
    return { names: hot.map((g) => g.name || ""), found };
  });
  check("pointer: every hot group can be picked", hotPoints.found.every(Boolean), hotPoints.names);

  await page.evaluate((t) => window.__dither.runtime.renderAt(t), meta.still);
  const base = await pixels();
  if (hotPoints.found[0]) {
    const [x, y] = hotPoints.found[0];
    const box = await page.locator("#stage").boundingBox();
    await page.mouse.move(box.x + (x + 1) / 2 * box.width, box.y + (y + 1) / 2 * box.height);
    await shot("hover", page.locator("main"));
    const read = await page.locator("#read").textContent();
    const cursor = await page.evaluate(() => getComputedStyle(document.getElementById("stage")).cursor);
    check("hover: the group lights one tone, the cursor is a pointer and the read-out names it", diff(base, await pixels()) > .0003 && read === hotPoints.names[0] && cursor === "pointer", { read, cursor });
    await page.mouse.move(0, 0);
  }

  const named = /\b(?:tap|press|click)\s+(?:on\s+)?(?:the\s+|a\s+)?([a-z-]+)/i.exec(meta.hint)?.[1]?.toLowerCase();
  const pressIdx = named ? hotPoints.names.findIndex((n) => n.toLowerCase().startsWith(named)) : 0;
  const target = hotPoints.found[pressIdx >= 0 ? pressIdx : 0];
  if (target) {
    const t0 = meta.still;
    await page.evaluate((t) => { const rt = window.__dither.runtime; rt.hoverAt(5, 5); rt.renderAt(t); }, t0 + .5);
    const free = await pixels();
    await page.evaluate(([x, y, t]) => { const rt = window.__dither.runtime; rt.renderAt(t); rt.tap(x, y); rt.hoverAt(5, 5); rt.renderAt(t + .5); }, [...target, t0]);
    await shot("press", page.locator("main"));
    const held = await pixels();
    await page.evaluate(([x, y, t]) => { const rt = window.__dither.runtime; rt.tap(x, y); rt.hoverAt(5, 5); rt.renderAt(t + .5); }, [...target, t0]);
    const released = await pixels();
    check("press: a tap brakes the scene and the next tap lets it go", diff(held, free) > .0005 && diff(released, free) < diff(held, free) * .25, { held: +diff(held, free).toFixed(4), released: +diff(released, free).toFixed(4) });
  }

  const inks = await page.evaluate(() => ["#6f8f3c", "#c45c38", "#d9c7a4", "#b5523a"].map((h) => ({ h, ...Dither.report(h) })));
  report.inks = inks;
  check("tones: five close natural inks, a cool dark step and a warm light step", inks.every((r) => r.tones === 5 && r.maxGap <= .08 && r.shadowViolet < 36 && r.lightYellow > 0), inks);

  const scaleOf = () => page.evaluate(() => {
    const c = document.getElementById("stage");
    const w = parseFloat(c.style.width), h = parseFloat(c.style.height);
    return { w, h, rw: w / c.width, rh: h / c.height, touch: getComputedStyle(c).touchAction };
  });
  const scale = await scaleOf();
  check("scale: the canvas enlarges by a whole number of pixels", scale.rw >= 1 && Math.abs(scale.rw - Math.round(scale.rw)) < 1e-6 && Math.abs(scale.rh - Math.round(scale.rh)) < 1e-6, scale);
  check("touch-action: manipulation", scale.touch === "manipulation", scale.touch);

  const zooms = await page.evaluate(({ stillT, familyBody }) => {
    const rt = window.__dither.runtime, c = document.getElementById("stage");
    const W = c.width, H = c.height, g = c.getContext("2d");
    const grab = (t) => { rt.renderAt(t); return g.getImageData(0, 0, W, H).data; };
    const white = (d, p) => d[p] > 250 && d[p + 1] > 250 && d[p + 2] > 250;
    rt.hoverAt(5, 5);
    const now = grab(stillT);
    const lum = (d, p) => 0.2126 * d[p] + 0.7152 * d[p + 1] + 0.0722 * d[p + 2];
    /* Grass, earth, water, then a low-chroma cold ground. The white page stays out. */
    const familyOf = new Function("r", "g", "b", familyBody);
    const family = (d, p) => familyOf(d[p], d[p + 1], d[p + 2]);
    const meadow = (d, p) => family(d, p) === 1;
    const ground = (d, p) => family(d, p) > 0;
    const warmGround = (d, p) => { const f = family(d, p); return f > 0 && f < 4; };
    let edge = null;
    for (let y = Math.floor(H * .5); y <= H - 64; y += 4) for (let x = 0; x <= W - 64; x += 4) {
      let n = 0, w = 0, gr = 0, colored = 0;
      for (let j = 0; j < 64; j += 2) for (let i = 0; i < 64; i += 2) {
        n++;
        const p = ((y + j) * W + x + i) * 4;
        if (white(now, p)) w++;
        else { colored++; if (meadow(now, p)) gr++; }
      }
      const f = w / n;
      if (f < .18 || f > .55 || colored < 8) continue;
      if (gr / colored < .7) continue;
      const score = gr - Math.abs(f - .42) * n;
      if (!edge || score > edge.score) edge = { x, y, score };
    }
    function folkBox(name) {
      const hot = rt.parts.hot || [], idx = hot.findIndex((h) => (h.name || "") === name);
      if (idx < 0) return null;
      let hit = null;
      for (let y = .9; y > -.9 && !hit; y -= .02) for (let x = -.9; x < .9; x += .02) if (rt.hoverAt(x, y) === hot[idx]) hit = [x, y];
      rt.hoverAt(5, 5);
      if (!hit) return null;
      return { x: Math.round((hit[0] + 1) / 2 * W - 32), y: Math.round((hit[1] + 1) / 2 * H - 46) };
    }
    const fig = folkBox("miller"), carterBox = folkBox("carter");
    const linen = (d, p) => {
      const r = d[p], g = d[p + 1], b = d[p + 2];
      return r > 155 && g > 135 && b > 105 && r < 230 && Math.abs(r - g) < 36 && g > b + 8 && r > b + 16;
    };
    let sail = { x: 40, y: 8 }, sailTop = H;
    for (let y = 0; y < Math.floor(H * .5); y++) for (let x = 0; x < W; x++) {
      if (!linen(now, (y * W + x) * 4) || y >= sailTop) continue;
      sailTop = y; sail = { x: x - 28, y: y - 6 };
    }
    /* The cast is the long run of grass that is much darker than the lit yard.
       A speck of dark dither does not extend it, and lit grass must remain past its right edge. */
    function measure(d, fam, drop, abs) {
      fam = fam || 1;
      drop = drop == null ? 42 : drop;
      const bucket = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < Math.floor(W * .42); x++) {
        const p = (y * W + x) * 4;
        if (family(d, p) === fam) bucket.push(lum(d, p));
      }
      bucket.sort((p, q) => p - q);
      const ref = bucket.length ? bucket[Math.min(bucket.length - 1, Math.floor(bucket.length * .7))] : 130;
      const darkC = new Int32Array(W), grassC = new Int32Array(W), dark = new Uint8Array(W * H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x, p = i * 4;
        if (family(d, p) !== fam) continue;
        grassC[x]++;
        if (lum(d, p) < ref - drop) { darkC[x]++; dark[i] = 1; }
      }
      const cast = new Uint8Array(W);
      for (let x = 4; x < W - 4; x++) {
        let gs = 0, k = 0;
        for (let i = -4; i <= 4; i++) { gs += grassC[x + i]; k += darkC[x + i]; }
        if (abs ? k >= abs : gs >= 80 && k / gs >= .5) cast[x] = 1;
      }
      let best = null, run = null;
      for (let x = 0; x <= W; x++) {
        if (x < W && cast[x]) { if (!run) run = { x0: x, x1: x }; else run.x1 = x; }
        else if (run) { if (!best || run.x1 - run.x0 > best.x1 - best.x0) best = run; run = null; }
      }
      const ink = new Uint8Array(W * H);
      let n = 0, sx = 0, sy = 0, gap = 0, sl = 0, sl2 = 0, y0 = H, y1 = 0, beyond = 0;
      const x0 = best ? best.x0 : 0, x1 = best ? best.x1 : 0;
      if (best) {
        for (let y = 0; y < H; y++) for (let x = x0; x <= x1; x++) {
          const i = y * W + x;
          if (!dark[i]) continue;
          ink[i] = 1; n++; sx += x; sy += y;
          const L = lum(d, i * 4);
          gap += ref - L; sl += L; sl2 += L * L;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        for (let y = 0; y < H; y++) for (let x = x1 + 8; x < Math.min(W, x1 + 56); x++) {
          const p = (y * W + x) * 4;
          if (family(d, p) === fam && lum(d, p) > ref - 18) beyond++;
        }
      }
      const mean = n ? sl / n : 0;
      const variance = n ? Math.max(0, sl2 / n - mean * mean) : 0;
      return {
        n, cx: n ? sx / n : 0, lum: mean, lit: ref, beyond,
        contrast: n ? gap / n : 0, std: Math.sqrt(variance),
        w: best ? x1 - x0 + 1 : 0, h: n ? y1 - y0 + 1 : 0, x1, ink
      };
    }
    const dur = window.__dither.spec.duration;
    const at0 = measure(grab(0)), at8 = measure(grab(dur / 8)), at4 = measure(grab(dur / 4));
    const water0 = measure(grab(0), 3, 20, 10);
    const soft0 = measure(grab(0), 1, 22);
    const earth0 = measure(grab(0), 2);
    const waterHard = measure(grab(0), 3);
    const cold0 = measure(grab(0), 4);
    let shape = 0;
    for (let i = 0; i < at0.ink.length; i++) if (at0.ink[i] !== at8.ink[i]) shape++;
    let shadow = null, best = -1;
    const mark = at4.ink;
    for (let y = 0; y <= H - 64; y += 4) for (let x = Math.floor(W * .3); x <= W - 64; x += 4) {
      let inkN = 0, openN = 0;
      for (let j = 0; j < 64; j += 2) for (let i = 0; i < 64; i += 2) {
        if (mark[(y + j) * W + (x + i)]) inkN++; else openN++;
      }
      if (inkN < 30 || openN < 40) continue;
      const score = inkN + x * .05;
      if (score > best) { best = score; shadow = { x, y, inkN }; }
    }
    rt.renderAt(stillT);
    function zoom(box) {
      if (!box) return null;
      const S = 64, Z = 8;
      const x = Math.max(0, Math.min(W - S, box.x | 0)), y = Math.max(0, Math.min(H - S, box.y | 0));
      const src = g.getImageData(x, y, S, S);
      const tmp = document.createElement("canvas"); tmp.width = S; tmp.height = S;
      tmp.getContext("2d").putImageData(src, 0, 0);
      const out = document.createElement("canvas"); out.width = S * Z; out.height = S * Z;
      const o = out.getContext("2d"); o.imageSmoothingEnabled = false; o.drawImage(tmp, 0, 0, S * Z, S * Z);
      return out.toDataURL("image/png");
    }
    const mini = () => {
      const col = [];
      for (let x = 0; x < W; x++) col.push({ minY: H, maxY: -1 });
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const p = (y * W + x) * 4;
        if (white(now, p) || warmGround(now, p)) continue;
        if (y < col[x].minY) col[x].minY = y;
        if (y > col[x].maxY) col[x].maxY = y;
      }
      let peak = 0, peakH = -1;
      for (let x = 0; x < W; x++) {
        const h = col[x].maxY - col[x].minY;
        if (h > peakH) { peakH = h; peak = x; }
      }
      const top = col[peak].minY, bot = col[peak].maxY, band = top + (bot - top) * .45;
      let x0 = peak, x1 = peak;
      const hitsBand = (x) => {
        for (let y = col[x].minY; y <= Math.min(col[x].maxY, band); y++) {
          const p = (y * W + x) * 4;
          if (!white(now, p) && !warmGround(now, p)) return true;
        }
        return false;
      };
      while (x0 > 0 && hitsBand(x0 - 1)) x0--;
      while (x1 < W - 1 && hitsBand(x1 + 1)) x1++;
      let minX = x0, maxX = x1, minY = H, maxY = 0;
      for (let x = x0; x <= x1; x++) {
        if (col[x].maxY < 0) continue;
        if (col[x].minY < minY) minY = col[x].minY;
        if (col[x].maxY > maxY) maxY = col[x].maxY;
      }
      const bw = maxX - minX + 1, bh = maxY - minY + 1, th = 20, tw = Math.max(1, Math.round(bw * th / bh));
      const src = g.getImageData(minX, minY, bw, bh);
      const tiny = document.createElement("canvas"); tiny.width = tw; tiny.height = th;
      const tg = tiny.getContext("2d"), img = tg.createImageData(tw, th);
      for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
        const sx = Math.min(bw - 1, Math.floor(x * bw / tw)), sy = Math.min(bh - 1, Math.floor(y * bh / th));
        const s = (sy * bw + sx) * 4, d = (y * tw + x) * 4;
        img.data[d] = src.data[s]; img.data[d + 1] = src.data[s + 1]; img.data[d + 2] = src.data[s + 2]; img.data[d + 3] = 255;
      }
      tg.putImageData(img, 0, 0);
      const big = document.createElement("canvas"); big.width = tw * 8; big.height = th * 8;
      const bg = big.getContext("2d"); bg.imageSmoothingEnabled = false; bg.drawImage(tiny, 0, 0, tw * 8, th * 8);
      return { w: tw, h: th, url: big.toDataURL("image/png") };
    };
    const brief = (m) => ({ n: m.n, contrast: +m.contrast.toFixed(1), std: +m.std.toFixed(2), lit: +m.lit.toFixed(1), w: m.w, h: m.h, cx: +m.cx.toFixed(1), x1: m.x1, beyond: m.beyond });
    return {
      edge: zoom(edge || { x: 0, y: 0 }), figure: zoom(fig), carter: zoom(carterBox), sail: zoom(sail || { x: 40, y: 20 }),
      shadow: zoom(shadow || { x: W - 80, y: H - 80 }), mini: mini(),
      shadowReport: { at0: brief(at0), at8: brief(at8), at4: brief(at4), shape },
      water0: brief(water0),
      soft0: brief(soft0),
      earth0: brief(earth0),
      waterHard: brief(waterHard),
      cold0: brief(cold0)
    };
  }, { stillT: meta.still, familyBody: fnBody(groundFamily) });
  for (const [label, url] of [["zoom-edge", zooms.edge], ["zoom-figure", zooms.figure], ["zoom-carter", zooms.carter], ["zoom-sail", zooms.sail], ["zoom-shadow", zooms.shadow], ["mini", zooms.mini.url]]) {
    if (!url) continue;
    const path = join(outdir, `${name}-${label}.png`);
    writeFileSync(path, Buffer.from(url.split(",")[1], "base64"));
    report.images.push(path);
  }
  const sh = zooms.shadowReport;
  const kind = shadowOk(meta.shadow, meta.w, {
    at0: sh && sh.at0, at8: sh && sh.at8, at4: sh && sh.at4, shape: sh && sh.shape,
    earth: zooms.earth0, water: zooms.waterHard, cold: zooms.cold0
  }, meta.snow);
  if (meta.shadow !== "hard") {
    check("shadow: a hard cast is declared", false, meta.shadow);
  } else if (kind === "silhouette") {
    check("shadow: a textured grass silhouette to the right, short of the wall, and it changes shape", true, sh);
  } else {
    check("shadow: a hard cast on the ground, textured and short of the edge", !!kind, { kind, earth: zooms.earth0, water: zooms.waterHard, cold: zooms.cold0, grass: sh && sh.at0 });
  }

  const folks = await page.evaluate(([stillT, found, names]) => {
    const rt = window.__dither.runtime, c = document.getElementById("stage");
    const W = c.width, H = c.height, g = c.getContext("2d");
    rt.hoverAt(5, 5);
    rt.renderAt(stillT);
    function zoomAt(hit) {
      const S = 64, Z = 8;
      const x = Math.max(0, Math.min(W - S, Math.round((hit[0] + 1) / 2 * W - 32)));
      const y = Math.max(0, Math.min(H - S, Math.round((hit[1] + 1) / 2 * H - 48)));
      const src = g.getImageData(x, y, S, S);
      const tmp = document.createElement("canvas"); tmp.width = S; tmp.height = S;
      tmp.getContext("2d").putImageData(src, 0, 0);
      const out = document.createElement("canvas"); out.width = S * Z; out.height = S * Z;
      const o = out.getContext("2d"); o.imageSmoothingEnabled = false; o.drawImage(tmp, 0, 0, S * Z, S * Z);
      return out.toDataURL("image/png");
    }
    return names.map((nm, i) => {
      if (!found[i]) return null;
      const slug = (nm || "hot").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return { name: slug, url: zoomAt(found[i]) };
    }).filter(Boolean);
  }, [meta.still, hotPoints.found, hotPoints.names]);
  for (const shot of folks) {
    const path = join(outdir, `${name}-zoom-${shot.name}.png`);
    writeFileSync(path, Buffer.from(shot.url.split(",")[1], "base64"));
    report.images.push(path);
  }
  check("figures: a zoom for every hot group", folks.length === hotPoints.names.length, { zooms: folks.map((s) => s.name), hot: hotPoints.names });

  const joins = await page.evaluate((stillT) => {
    const rt = window.__dither.runtime, spec = window.__dither.spec, P = rt.P, c = document.getElementById("stage");
    const W = c.width, H = c.height, g = c.getContext("2d");
    rt.renderAt(stillT);
    P.update();
    const DEG = Math.PI / 180, TAU = Math.PI * 2, cam = spec.camera || {};
    const az = (cam.az == null ? 45 : cam.az) * DEG, el = (cam.el == null ? 30 : cam.el) * DEG;
    const R = [Math.cos(az), 0, -Math.sin(az)], U = [-Math.sin(az) * Math.sin(el), Math.cos(el), -Math.cos(az) * Math.sin(el)];
    const gr = spec.ground || {}, RX = gr.rx || 4, RZ = gr.rz || 3, TOP = cam.height || 3, corners = [];
    for (let ca = 0; ca < 48; ca++) {
      const an = ca / 48 * TAU;
      corners.push([Math.cos(an) * RX, 0, Math.sin(an) * RZ], [Math.cos(an) * RX * .8, TOP, Math.sin(an) * RZ * .8]);
    }
    if (gr.rect) for (let csx = -1; csx <= 1; csx += 2) for (let csz = -1; csz <= 1; csz += 2) corners.push([csx * RX, 0, csz * RZ], [csx * RX * .92, TOP * .35, csz * RZ * .92]);
    const dot = (a, x, y, z) => a[0] * x + a[1] * y + a[2] * z;
    let minA = 1e9, maxA = -1e9, minB = 1e9, maxB = -1e9;
    corners.forEach((p) => { const a = dot(R, p[0], p[1], p[2]), b = dot(U, p[0], p[1], p[2]); minA = Math.min(minA, a); maxA = Math.max(maxA, a); minB = Math.min(minB, b); maxB = Math.max(maxB, b); });
    const S = cam.scale || Math.min((W - 10) / (maxA - minA), (H - 10) / (maxB - minB));
    const T = cam.target, OA = T ? dot(R, T[0], T[1], T[2]) : (minA + maxA) / 2, OB = T ? dot(U, T[0], T[1], T[2]) : (minB + maxB) / 2;
    const scr = (x, y, z) => [(dot(R, x, y, z) - OA) * S + W / 2, (OB - dot(U, x, y, z)) * S + H / 2];
    const want = ["cart-wheel", "cart-bed", "keeper", "boat", "mule", "hoof"];
    let root = rt.parts.hot && rt.parts.hot[0];
    while (root && root.parent) root = root.parent;
    const found = {};
    function add(box, node) {
      (function walk(cur) {
        if (!cur) return;
        if (cur.geo && cur.geo.v) {
          const v = cur.geo.v;
          for (let i = 0; i < v.length; i += 3) {
            const p = cur.worldPoint(v[i], v[i + 1], v[i + 2]), s = scr(p[0], p[1], p[2]);
            box.minX = Math.min(box.minX, s[0]); box.maxX = Math.max(box.maxX, s[0]);
            box.minY = Math.min(box.minY, s[1]); box.maxY = Math.max(box.maxY, s[1]);
          }
        }
        (cur.children || []).forEach(walk);
      })(node);
    }
    (function walk(n) {
      if (!n) return;
      const nm = n.support && n.support.name;
      if (want.includes(nm)) add(found[nm] || (found[nm] = { minX: 1e9, minY: 1e9, maxX: -1e9, maxY: -1e9 }), n);
      (n.children || []).forEach(walk);
    })(root);
    function crop(box) {
      const pad = 8;
      const x0 = Math.max(0, Math.floor(box.minX) - pad), y0 = Math.max(0, Math.floor(box.minY) - pad);
      const x1 = Math.min(W, Math.ceil(box.maxX) + pad), y1 = Math.min(H, Math.ceil(box.maxY) + pad);
      const sw = Math.max(1, x1 - x0), sh = Math.max(1, y1 - y0), Z = 6;
      const src = g.getImageData(x0, y0, sw, sh);
      const tmp = document.createElement("canvas"); tmp.width = sw; tmp.height = sh;
      tmp.getContext("2d").putImageData(src, 0, 0);
      const out = document.createElement("canvas"); out.width = sw * Z; out.height = sh * Z;
      const o = out.getContext("2d"); o.imageSmoothingEnabled = false; o.drawImage(tmp, 0, 0, sw * Z, sh * Z);
      return out.toDataURL("image/png");
    }
    return Object.keys(found).filter((nm) => found[nm].maxX > found[nm].minX).map((nm) => ({ name: nm, url: crop(found[nm]) }));
  }, meta.still);
  for (const shot of joins || []) {
    const path = join(outdir, `${name}-join-${shot.name}.png`);
    writeFileSync(path, Buffer.from(shot.url.split(",")[1], "base64"));
    report.images.push(path);
  }

  const bench = async () => page.evaluate(() => {
    const rt = window.__dither.runtime, ts = [];
    for (let i = 0; i < 36; i++) { const a = performance.now(); rt.renderAt(i / 12); ts.push(performance.now() - a); }
    ts.sort((a, b) => a - b);
    return { medianMs: +ts[18].toFixed(2), p95Ms: +ts[34].toFixed(2) };
  });
  report.render = await bench();
  const budget = 1000 / (meta.fps || 12);
  report.render.budgetMs = +budget.toFixed(1);
  check(`frame cost: median within the ${report.render.budgetMs} ms budget`, report.render.medianMs <= budget, report.render);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  report.renderThrottle4 = await bench();
  report.renderThrottle4.budgetMs = report.render.budgetMs;
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  check(`frame cost: median within the budget at CPU throttle 4`, report.renderThrottle4.medianMs <= budget, report.renderThrottle4);

  const reduced = await context.newPage();
  await reduced.emulateMedia({ reducedMotion: "reduce" });
  await reduced.goto(url);
  await reduced.waitForFunction(() => window.__dither?.runtime);
  const r = await reduced.evaluate(async () => {
    const a = window.__dither.runtime.stats().frames;
    await new Promise((ok) => setTimeout(ok, 500));
    const s = window.__dither.runtime.stats();
    return { running: s.running, frames: s.frames - a };
  });
  check("reduced motion: the page holds the still frame", !r.running && r.frames === 0, r);
  const qred = await context.newPage();
  await qred.goto(url + "?reduced");
  await qred.waitForFunction(() => window.__dither?.runtime);
  const sameStill = await qred.evaluate((stillPx) => {
    const c = document.getElementById("stage"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] !== stillPx[i] || d[i + 1] !== stillPx[i + 1] || d[i + 2] !== stillPx[i + 2]) n++;
    return { running: window.__dither.runtime.stats().running, diff: n };
  }, still);
  check("?reduced and ?still hold the still picture", sameStill.running === false && sameStill.diff === 0, sameStill);

  const live = await context.newPage();
  await live.goto(url);
  await live.waitForFunction(() => window.__dither?.runtime?.stats().running);
  const hidden = await live.evaluate(() => new Promise((ok) => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
    setTimeout(() => ok(window.__dither.runtime.stats().running), 80);
  }));
  check("hidden tab: the clock pauses", hidden === false, { running: hidden });
  const parked = await context.newPage();
  await parked.goto(url);
  await parked.waitForFunction(() => window.__dither?.runtime?.stats().running);
  await parked.evaluate(() => { const m = document.querySelector("main"); m.style.minHeight = "0"; m.style.marginTop = "4000px"; });
  await parked.waitForTimeout(400);
  const off = await parked.evaluate(() => window.__dither.runtime.stats().running);
  check("off-screen: the clock pauses", off === false, { running: off });

  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  await phone.route(/^https?:/, (r) => r.abort());
  const mobile = await phone.newPage();
  await mobile.goto(url + "?still");
  await mobile.waitForFunction(() => window.__dither?.runtime);
  const mpath = join(outdir, `${name}-mobile.png`);
  await mobile.screenshot({ path: mpath, fullPage: true });
  report.images.push(mpath);
  const overflow = await mobile.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: innerWidth, scale: parseFloat(getComputedStyle(document.getElementById("stage")).width) / document.getElementById("stage").width }));
  check("mobile: no horizontal overflow", overflow.scroll <= overflow.inner + 1, overflow);
  check("mobile: integer scale", Math.abs(overflow.scale - Math.round(overflow.scale)) < 1e-6 && overflow.scale >= 1, overflow.scale);
  const tapName = (named || hotPoints.names[0] || "").toLowerCase();
  const tapped = await mobile.evaluate(([t, tapName]) => {
    const rt = window.__dither.runtime, hot = rt.parts.hot || [];
    const idx = hot.findIndex((h) => (h.name || "").toLowerCase().startsWith(tapName));
    rt.renderAt(t);
    let hit = null;
    if (idx >= 0) for (let y = .9; y > -.9 && !hit; y -= .015) for (let x = -.9; x < .9 && !hit; x += .015) if (rt.hoverAt(x, y) === hot[idx]) hit = [x, y];
    if (hit) {
      const cluster = [];
      for (let dy = -.06; dy <= .06; dy += .012) for (let dx = -.06; dx <= .06; dx += .012) {
        if (rt.hoverAt(hit[0] + dx, hit[1] + dy) === hot[idx]) cluster.push([hit[0] + dx, hit[1] + dy]);
      }
      if (cluster.length) hit = cluster[Math.floor(cluster.length / 2)];
    }
    rt.hoverAt(5, 5);
    rt.renderAt(t + .5);
    const c = document.getElementById("stage"), before = Array.from(c.getContext("2d").getImageData(0, 0, c.width, c.height).data);
    rt.renderAt(t);
    return { hit, before, idx };
  }, [meta.still, tapName]);
  if (tapped.hit) {
    const box = await mobile.locator("#stage").boundingBox();
    const [x, y] = tapped.hit;
    await mobile.touchscreen.tap(box.x + (x + 1) / 2 * box.width, box.y + (y + 1) / 2 * box.height);
    const after = await mobile.evaluate((t) => { const rt = window.__dither.runtime; rt.hoverAt(5, 5); rt.renderAt(t + .5); const c = document.getElementById("stage"); return Array.from(c.getContext("2d").getImageData(0, 0, c.width, c.height).data); }, meta.still);
    check("mobile: one tap reaches the brake", diff(tapped.before, after) > .0005, +diff(tapped.before, after).toFixed(4));
  } else check("mobile: one tap reaches the brake", false, tapName || "no target");
  await phone.close();
} catch (err) {
  report.errors.push(String((err && err.message) || err));
} finally {
  await browser.close();
}
check("size: built page under 70 KB", bytes < 70 * 1024, bytes);
check("no browser errors", report.errors.length === 0, report.errors);
check("offline: no network request", report.network.length === 0, report.network);
writeFileSync(join(outdir, `${name}-look.json`), JSON.stringify(report, null, 2) + "\n");
console.log(`${name}: ${bytes} bytes, median ${report.render?.medianMs} ms, p95 ${report.render?.p95Ms} ms, throttle4 ${report.renderThrottle4?.medianMs} ms, throttle4 p95 ${report.renderThrottle4?.p95Ms} ms, budget ${report.render?.budgetMs} ms`);
for (const c of report.checks) console.log(`${c.pass ? "PASS" : "FAIL"} ${c.label}${c.pass ? "" : " (" + JSON.stringify(c.detail) + ")"}`);
console.log(`report: ${join(outdir, `${name}-look.json`)}`);
if (report.checks.some((c) => !c.pass)) process.exitCode = 1;
