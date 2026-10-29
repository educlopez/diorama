#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "./build.mjs";
import { openBrowser } from "./browser.mjs";

const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) if (args[i].startsWith("--")) flags[args[i].slice(2)] = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "1";
const [src, outArg] = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (!src || !outArg) {
  console.error("usage: node render.mjs <scene.js> <outdir> [--frames 0,1,2] [--clip] [--fps 12] [--seconds 6]");
  process.exit(2);
}

const outdir = resolve(outArg);
mkdirSync(outdir, { recursive: true });
const name = basename(src, ".js");
const { file } = build(src, join(outdir, `wash-${name}.html`));
const swift = flags.swift === "1" || process.env.WASH_SWIFTSHADER === "1";
const { browser } = await openBrowser(swift);
try {
  const context = await browser.newContext({ viewport: { width: 1040, height: 1280 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(pathToFileURL(file).href + "?still");
  await page.waitForFunction(() => window.__wash?.runtime);
  await page.evaluate(() => {
    const canvas = document.getElementById("stage");
    canvas.style.width = canvas.width + "px";
    canvas.style.height = canvas.height + "px";
  });
  if (errors.length) throw new Error(errors.join("\n"));
  const meta = await page.evaluate(() => ({ duration: window.__wash.spec.duration, still: window.__wash.spec.still || 0, width: window.__wash.spec.width || 960, height: window.__wash.spec.height || 960 }));
  const times = (flags.frames ? flags.frames.split(",") : [0, meta.still, meta.duration * 0.5]).map(Number);
  for (const t of times) {
    await page.evaluate((x) => window.__wash.runtime.renderAt(x), t);
    const label = String(t).replace(".", "p");
    const path = join(outdir, `${name}-t${label}.png`);
    await page.locator("#stage").screenshot({ path });
    console.log(path);
  }
  const same = await page.evaluate((t) => window.__wash.runtime.same(t), meta.still);
  console.log(JSON.stringify({ determinism: same, renderer: await page.evaluate(() => window.__wash.runtime.glInfo()) }));
  if (!same.identical) process.exitCode = 1;
  if (flags.clip) {
    const fps = Number(flags.fps || 12);
    const seconds = Number(flags.seconds || 6);
    const n = Math.round(fps * seconds);
    const dir = join(outdir, `${name}-frames`);
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < n; i++) {
      const t = (i / fps) % meta.duration;
      await page.evaluate((x) => window.__wash.runtime.renderAt(x), t);
      const path = join(dir, `frame-${String(i).padStart(3, "0")}.png`);
      await page.locator("#stage").screenshot({ path });
    }
    const mp4 = join(outdir, `${name}.mp4`);
    await new Promise((ok, fail) => {
      const child = spawn("ffmpeg", [
        "-y", "-framerate", String(fps), "-i", join(dir, "frame-%03d.png"),
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4
      ], { stdio: "inherit" });
      child.on("exit", (code) => code === 0 ? ok() : fail(new Error("ffmpeg " + code)));
    });
    console.log(mp4);
  }
} finally {
  await browser.close();
}
