#!/usr/bin/env node
/**
 * Writes a transparent still of island, launchpad and cafe to
 * public/svg/posters/<revision>/<name>.png.
 * All three use the toy theme. The stage background is cleared, and the
 * drawing is centred on a 560×420 canvas so its visible area is about 60%
 * of the cell. Run it by hand when those pictures change:
 * `node scripts/svg-posters.mjs`. Not part of the build. Needs Chrome
 * (CHROME_PATH or the usual paths) and playwright-core from the Worlds skill.
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
const REVISION = "v1";
const ORDER = ["island", "launchpad", "cafe"];
const THEME = "toy";
const CANVAS = { w: 560, h: 420 };
const TARGET = 0.6;
const ALPHA_CUT = 8;
const OUT = here(`../public/svg/posters/${REVISION}`);
const chrome = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/opt/google/chrome/chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));
if (!chrome) { console.error("no Chrome found: set CHROME_PATH"); process.exit(2); }

mkdirSync(OUT, { recursive: true });
const scratch = join(tmpdir(), "diorama-svg-posters");
rmSync(scratch, { recursive: true, force: true });
mkdirSync(scratch, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 760 }, deviceScaleFactor: 2 });
  for (const name of ORDER) {
    writeFileSync(join(scratch, `${name}.html`), assemble(readFileSync(join(EXAMPLES, `${name}.js`), "utf8")));
    await page.goto(pathToFileURL(join(scratch, `${name}.html`)).href + `?embed&still&theme=${THEME}`, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => {
      const svg = document.querySelector("#stage svg");
      const box = svg && svg.getBoundingClientRect();
      return box && box.width > 400 && svg.querySelectorAll("path").length > 8;
    }, { timeout: 20000 });
    await page.evaluate(() => {
      const svg = document.querySelector("#stage svg");
      svg.style.background = "transparent";
      document.documentElement.style.background = "transparent";
      document.body.style.background = "transparent";
    });
    const shot = await page.locator("#stage svg").screenshot({ omitBackground: true, type: "png" });
    const png = await page.evaluate(async ({ b64, width, height, target, alphaCut, name }) => {
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = "data:image/png;base64," + b64; });
      const src = document.createElement("canvas");
      src.width = img.width;
      src.height = img.height;
      const sg = src.getContext("2d", { willReadFrequently: true });
      sg.drawImage(img, 0, 0);
      const pixels = sg.getImageData(0, 0, src.width, src.height);
      const data = pixels.data;
      let minX = src.width, minY = src.height, maxX = -1, maxY = -1;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] <= alphaCut) data[i + 3] = 0;
        else {
          const p = i / 4;
          const x = p % src.width;
          const y = (p / src.width) | 0;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
      if (maxX < 0) throw new Error("the still has no visible pixels");
      sg.putImageData(pixels, 0, 0);
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      const out = document.createElement("canvas");
      out.width = width;
      out.height = height;
      const og = out.getContext("2d", { willReadFrequently: true });
      const bounds = () => {
        const frame = og.getImageData(0, 0, width, height);
        const px = frame.data;
        let x0 = width, y0 = height, x1 = -1, y1 = -1, count = 0;
        for (let i = 0; i < px.length; i += 4) {
          if (px[i + 3] <= alphaCut) px[i + 3] = 0;
          else {
            count += 1;
            const p = i / 4;
            const x = p % width;
            const y = (p / width) | 0;
            if (x < x0) x0 = x;
            if (y < y0) y0 = y;
            if (x > x1) x1 = x;
            if (y > y1) y1 = y;
          }
        }
        og.putImageData(frame, 0, 0);
        return { count, area: x1 < 0 ? 0 : ((x1 - x0 + 1) * (y1 - y0 + 1)) / (width * height), edge: x0 === 0 || y0 === 0 || x1 === width - 1 || y1 === height - 1 };
      };
      let lo = 0.15;
      let hi = Math.min(width / bw, height / bh);
      for (let step = 0; step < 14; step += 1) {
        const k = (lo + hi) / 2;
        const ow = Math.max(1, Math.round(bw * k));
        const oh = Math.max(1, Math.round(bh * k));
        og.clearRect(0, 0, width, height);
        og.drawImage(src, minX, minY, bw, bh, Math.round((width - ow) / 2), Math.round((height - oh) / 2), ow, oh);
        const box = bounds();
        if (box.area < target) lo = k;
        else hi = k;
      }
      const k = (lo + hi) / 2;
      const ow = Math.max(1, Math.round(bw * k));
      const oh = Math.max(1, Math.round(bh * k));
      og.clearRect(0, 0, width, height);
      og.drawImage(src, minX, minY, bw, bh, Math.round((width - ow) / 2), Math.round((height - oh) / 2), ow, oh);
      const box = bounds();
      if (box.area < 0.55 || box.area > 0.65 || box.edge) throw new Error(`${name} poster is ${Math.round(box.area * 1000) / 10}% and edge ${box.edge}`);
      return { png: out.toDataURL("image/png").split(",")[1], area: box.area, count: box.count };
    }, { b64: shot.toString("base64"), width: CANVAS.w, height: CANVAS.h, target: TARGET, alphaCut: ALPHA_CUT, name });
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(png.png, "base64"));
    console.log(`${name} → public/svg/posters/${REVISION}/${name}.png (${Math.round(png.area * 1000) / 10}% of the cell)`);
  }
} finally {
  await browser.close();
  rmSync(scratch, { recursive: true, force: true });
}
