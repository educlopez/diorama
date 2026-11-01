#!/usr/bin/env node
/**
 * Records one exact loop from renderAt(t): `node record.mjs <scene.js> <outdir>`.
 * Writes a poster (the still frame) plus webm and mp4. Frames are the canvas
 * pixels, then enlarged 4x with nearest-neighbour so each scene pixel is a
 * 4 x 4 block. No audio.
 */
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { build } from "./build.mjs";

const [src, outArg] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!src || !outArg) { console.error("usage: node record.mjs <scene.js> <outdir>"); process.exit(2); }
let chromium;
try { ({ chromium } = await import("playwright-core")); }
catch { console.error("playwright-core is missing: run `npm ci --ignore-scripts` in this skill's folder"); process.exit(2); }
const outdir = resolve(outArg); mkdirSync(outdir, { recursive: true });
const name = basename(src, ".js");
const { file } = build(src, join(outdir, `dither-${name}.html`));
const executablePath = process.env.CHROME_PATH || ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].find(existsSync);
if (!executablePath) { console.error("no Chrome or Chromium found: set CHROME_PATH"); process.exit(2); }
const frames = join(outdir, `${name}-frames`);
rmSync(frames, { recursive: true, force: true }); mkdirSync(frames);

const browser = await chromium.launch({ executablePath, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 700 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href + "?still");
  await page.waitForFunction(() => window.__dither?.runtime);
  const meta = await page.evaluate(() => ({ duration: window.__dither.spec.duration, still: window.__dither.spec.still || 0, fps: window.__dither.spec.fps == null ? 12 : window.__dither.spec.fps }));
  const n = Math.round(meta.duration * meta.fps);
  const save = async (t, path) => {
    const b64 = await page.evaluate((t) => {
      window.__dither.runtime.renderAt(t);
      const c = document.getElementById("stage");
      return c.toDataURL("image/png").split(",")[1];
    }, t);
    writeFileSync(path, Buffer.from(b64, "base64"));
  };
  await save(meta.still, join(outdir, `${name}-poster.png`));
  for (let i = 0; i < n; i++) await save(i / meta.fps, join(frames, `f${String(i).padStart(4, "0")}.png`));
  const seam = await page.evaluate((dur) => {
    const rt = window.__dither.runtime, c = document.getElementById("stage");
    const shot = (t) => { rt.renderAt(t); return Array.from(c.getContext("2d").getImageData(0, 0, c.width, c.height).data); };
    const a = shot(0), b = shot(dur);
    let diff = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1] || a[i + 2] !== b[i + 2]) diff++;
    return diff;
  }, meta.duration);
  console.log(`frames ${n}, seam pixels ${seam}`);
  if (seam !== 0) process.exitCode = 1;
  const scale = "scale=1440:1120:flags=neighbor";
  const webm = join(outdir, `${name}.webm`);
  const mp4 = join(outdir, `${name}.mp4`);
  const enc = (out, extra) => spawnSync("ffmpeg", ["-y", "-framerate", String(meta.fps), "-i", join(frames, "f%04d.png"), "-vf", scale, "-an", ...extra, out], { stdio: "inherit" });
  const v = enc(webm, ["-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p", "-b:v", "0", "-crf", "36"]);
  const m = enc(mp4, ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "26", "-movflags", "+faststart"]);
  if (v.status !== 0 || m.status !== 0) process.exitCode = 1;
  console.log(webm, mp4, join(outdir, `${name}-poster.png`));
} finally {
  await browser.close();
  rmSync(frames, { recursive: true, force: true });
}
