import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "./build.mjs";
import { openBrowser } from "./browser.mjs";

const scenes = ["pond", "landscape", "town", "portrait", "still", "poppy", "imprint"];

async function withPage(scene, fn) {
  const dir = mkdtempSync(join(tmpdir(), "wash-"));
  const { file } = build(fileURLToPath(new URL(`../examples/${scene}.js`, import.meta.url)), join(dir, `${scene}.html`));
  let swift = process.env.WASH_SWIFTSHADER === "1";
  let opened = await openBrowser(swift);
  let browser = opened.browser;
  try {
    const context = await browser.newContext({ viewport: { width: 1040, height: 1200 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(pathToFileURL(file).href + "?still");
    const ready = await page.waitForFunction(() => window.__wash?.runtime, null, { timeout: 8000 }).then(() => true).catch(() => false);
    if (!ready && !swift) {
      await browser.close();
      swift = true;
      opened = await openBrowser(true);
      browser = opened.browser;
      const context2 = await browser.newContext({ viewport: { width: 1040, height: 1200 }, deviceScaleFactor: 1 });
      const page2 = await context2.newPage();
      page2.on("pageerror", (e) => errors.push(e.message));
      await page2.goto(pathToFileURL(file).href + "?still");
      await page2.waitForFunction(() => window.__wash?.runtime);
      assert.deepEqual(errors, []);
      await fn(page2);
      return;
    }
    assert.equal(ready, true);
    assert.deepEqual(errors, []);
    await fn(page);
  } finally {
    await browser.close();
  }
}

for (const scene of scenes) {
  test(`${scene} renders the same pixels for the same t`, async () => {
    await withPage(scene, async (page) => {
      const result = await page.evaluate(() => {
        const t = window.__wash.spec.still;
        return window.__wash.runtime.same(t);
      });
      assert.equal(result.identical, true, JSON.stringify(result));
      assert.equal(result.mismatches, 0);
    });
  });
}
