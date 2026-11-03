#!/usr/bin/env node
/**
 * Writes a transparent still of island, launchpad and cafe to
 * public/svg/posters/<revision>/<name>.png.
 * All three use the toy theme. The page halo (the blurred shadow under the
 * base) is removed before the capture; the kit is not changed. The opaque
 * drawing keeps the size the figure framed, placed so its box is about half
 * the cell and its base lines up with the Worlds posters. Run it by hand
 * when those pictures change: `node scripts/svg-posters.mjs`. Not part of
 * the build. Needs Chrome (CHROME_PATH or the usual paths) and playwright-core
 * from the Worlds skill.
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { assemble } from "../../../skills/diorama/scripts/build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const require = createRequire(here("../../../skills/diorama-worlds/package.json"));
const { chromium } = require("playwright-core");
const EXAMPLES = here("../../../skills/diorama/examples");
const REVISION = "v2";
const ORDER = ["island", "launchpad", "cafe"];
const THEME = "toy";
const CANVAS = { w: 560, h: 420 };
/* Worlds posters, measured on the non-white pixels: the box is 49.5–56.3% of
   the cell and the base sits 9.6–11.4% above the bottom edge. */
const AREA = 0.53;
const BOTTOM = 0.11;
const OPAQUE = 64;
const OUT = here(`../public/svg/posters/${REVISION}`);
const chrome = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/opt/google/chrome/chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));
if (!chrome) { console.error("no Chrome found: set CHROME_PATH"); process.exit(2); }

mkdirSync(OUT, { recursive: true });
const scratch = join(tmpdir(), "diorama-svg-posters");
rmSync(scratch, { recursive: true, force: true });
mkdirSync(scratch, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 980, height: 820 }, deviceScaleFactor: 1 });
  for (const name of ORDER) {
    writeFileSync(join(scratch, `${name}.html`), assemble(readFileSync(join(EXAMPLES, `${name}.js`), "utf8")));
    await page.goto(pathToFileURL(join(scratch, `${name}.html`)).href + `?embed&still&theme=${THEME}`, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => document.querySelectorAll("#stage svg path").length > 8, { timeout: 20000 });

    const fit = async (width) => {
      await page.evaluate((width) => {
        const stage = document.querySelector("#stage");
        stage.style.width = width + "px";
      }, width);
      await page.waitForFunction((width) => {
        const box = document.querySelector("#stage svg")?.getBoundingClientRect();
        return box && Math.abs(box.width - width) < 1.5 && document.querySelectorAll("#stage svg path").length > 8;
      }, width, { timeout: 10000 });
      await page.evaluate(() => {
        const svg = document.querySelector("#stage svg");
        svg.style.background = "transparent";
        document.documentElement.style.background = "transparent";
        document.body.style.background = "transparent";
        svg.querySelectorAll(".halo, filter").forEach((node) => node.remove());
      });
    };

    await fit(640);
    const probe = await page.locator("#stage svg").screenshot({ omitBackground: true, type: "png" });
    const measured = await page.evaluate(async ({ b64, opaque }) => {
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = "data:image/png;base64," + b64; });
      const src = document.createElement("canvas");
      src.width = img.width;
      src.height = img.height;
      const g = src.getContext("2d", { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const data = g.getImageData(0, 0, src.width, src.height).data;
      let minX = src.width, minY = src.height, maxX = -1, maxY = -1;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] <= opaque) continue;
        const p = i / 4;
        const x = p % src.width;
        const y = (p / src.width) | 0;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      return { width: src.width, minX, minY, bw: maxX - minX + 1, bh: maxY - minY + 1 };
    }, { b64: probe.toString("base64"), opaque: OPAQUE });
    if (measured.bw < 8) throw new Error(`${name} has no opaque drawing`);
    const wanted = Math.sqrt(AREA * CANVAS.w * CANVAS.h * (measured.bw / measured.bh));
    const stageWidth = Math.max(32, Math.round(640 * (wanted / measured.bw)));
    await fit(stageWidth);

    const shot = await page.locator("#stage svg").screenshot({ omitBackground: true, type: "png" });
    const png = await page.evaluate(async ({ b64, width, height, bottom, opaque, name }) => {
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = "data:image/png;base64," + b64; });
      const src = document.createElement("canvas");
      src.width = img.width;
      src.height = img.height;
      const sg = src.getContext("2d", { willReadFrequently: true });
      sg.imageSmoothingEnabled = false;
      sg.drawImage(img, 0, 0);
      const pixels = sg.getImageData(0, 0, src.width, src.height);
      const data = pixels.data;
      let minX = src.width, minY = src.height, maxX = -1, maxY = -1;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] <= opaque) continue;
        const p = i / 4;
        const x = p % src.width;
        const y = (p / src.width) | 0;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      const out = document.createElement("canvas");
      out.width = width;
      out.height = height;
      const og = out.getContext("2d");
      og.imageSmoothingEnabled = false;
      const destX = Math.round((width - bw) / 2);
      const destBottom = height - Math.round(height * bottom);
      const destY = destBottom - bh;
      og.drawImage(src, destX - minX, destY - minY);
      const frame = og.getImageData(0, 0, width, height);
      const px = frame.data;
      let x0 = width, y0 = height, x1 = -1, y1 = -1;
      const partial = [];
      for (let i = 0; i < px.length; i += 4) {
        const a = px[i + 3];
        const p = i / 4;
        const x = p % width;
        const y = (p / width) | 0;
        if (a > opaque) {
          if (x < x0) x0 = x;
          if (y < y0) y0 = y;
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        } else if (a > 0) partial.push(x, y);
      }
      const opaqueAt = (x, y) => x >= 0 && y >= 0 && x < width && y < height && px[((y * width) + x) * 4 + 3] > opaque;
      let stray = 0;
      let farthest = 0;
      for (let i = 0; i < partial.length; i += 2) {
        const x = partial[i], y = partial[i + 1];
        let near = false;
        for (let dy = -2; dy <= 2 && !near; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) if (opaqueAt(x + dx, y + dy)) { near = true; break; }
        }
        if (!near) {
          stray += 1;
          farthest = Math.max(farthest, 3);
        }
      }
      const boxW = x1 - x0 + 1, boxH = y1 - y0 + 1;
      const area = (boxW * boxH) / (width * height);
      const bottomGap = (height - 1 - y1) / height;
      const topGap = y0 / height;
      if (area < 0.5 || area > 0.56) throw new Error(`${name} opaque box is ${Math.round(area * 1000) / 10}%`);
      if (y0 < 2 || x0 < 2 || x1 > width - 3 || y1 > height - 3) throw new Error(`${name} drawing is clipped`);
      if (stray) throw new Error(`${name} has soft alpha ${farthest}px off the drawing`);
      return { png: out.toDataURL("image/png").split(",")[1], area, bottomGap, topGap, boxW, boxH };
    }, { b64: shot.toString("base64"), width: CANVAS.w, height: CANVAS.h, bottom: BOTTOM, opaque: OPAQUE, name });
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(png.png, "base64"));
    console.log(`${name} → public/svg/posters/${REVISION}/${name}.png box ${Math.round(png.area * 1000) / 10}% ${png.boxW}×${png.boxH} top ${Math.round(png.topGap * 1000) / 10}% bottom ${Math.round(png.bottomGap * 1000) / 10}%`);
  }
} finally {
  await browser.close();
  rmSync(scratch, { recursive: true, force: true });
}
