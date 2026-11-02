#!/usr/bin/env node
/**
 * Writes the still frame of each official dither scene to
 * public/dither/posters/<revision>/<name>.png, at the canvas's own pixels.
 * Run it by hand when those pictures change: `node scripts/dither-posters.mjs`.
 * Not part of the build. Needs Chrome (CHROME_PATH or the usual paths) and
 * playwright-core from the dither skill (npm ci --ignore-scripts there).
 */
import { createRequire } from "node:module";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { build } from "../../../skills/diorama-dither/scripts/build.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const require = createRequire(here("../../../skills/diorama-dither/package.json"));
const { chromium } = require("playwright-core");
const EXAMPLES = here("../../../skills/diorama-dither/examples");
const REVISION = "v1";
const ORDER = ["forge", "lighthouse", "tea-house", "windmill"];
const OUT = here(`../public/dither/posters/${REVISION}`);
const chrome = [process.env.CHROME_PATH, "/usr/bin/google-chrome", "/usr/local/bin/google-chrome", "/opt/google/chrome/chrome", "/usr/bin/chromium"].find((p) => p && existsSync(p));
if (!chrome) { console.error("no Chrome found: set CHROME_PATH"); process.exit(2); }

mkdirSync(OUT, { recursive: true });
const scratch = join(tmpdir(), "diorama-dither-posters");
rmSync(scratch, { recursive: true, force: true });
mkdirSync(scratch, { recursive: true });
const browser = await chromium.launch({ executablePath: chrome, headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 800, height: 700 }, deviceScaleFactor: 1 });
  for (const name of ORDER) {
    const { file } = build(join(EXAMPLES, `${name}.js`), join(scratch, `${name}.html`));
    await page.goto(pathToFileURL(file).href + "?still");
    await page.waitForFunction(() => window.__dither && window.__dither.runtime);
    const png = await page.evaluate(() => {
      const rt = window.__dither.runtime;
      rt.renderAt(window.__dither.spec.still || 0);
      return document.getElementById("stage").toDataURL("image/png").split(",")[1];
    });
    writeFileSync(join(OUT, `${name}.png`), Buffer.from(png, "base64"));
    console.log(`${name} → public/dither/posters/${REVISION}/${name}.png`);
  }
} finally {
  await browser.close();
  rmSync(scratch, { recursive: true, force: true });
}
