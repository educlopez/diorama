// Spike: the part under the pointer on a grid, with three.js and with three-lite; reports how many grid points agree.
import { join } from 'node:path';
const ROOT = new URL('..', import.meta.url).pathname, OUT = join(ROOT, 'spike/out');
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const CH = `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const b = await chromium.launch({ executablePath: CH, args: ['--use-angle=metal'] });
for (const n of process.argv.slice(2)) {
  const res = {};
  for (const kind of ['three', 'lite']) {
    const p = await b.newPage({ viewport: { width: 900, height: 900 } });
    await p.goto(`file://${join(OUT, `${n}-${kind}.html`)}?embed`);
    await p.waitForFunction(() => window.__diorama);
    res[kind] = await p.evaluate(() => {
      const c = window.__diorama; c.stop(); c.t = 0; c.step(0); const out = [];
      for (let y = -0.9; y <= 0.9; y += 0.05) for (let x = -0.9; x <= 0.9; x += 0.05) { c.pointer.inside = true; c.pointer.x = x; c.pointer.y = y; c.step(0); out.push(c.hover ? c.hover.name || '?' : '-'); }
      for (let i = 0; i < 90; i++) c.step(1 / 30);
      return { out, t: c.t };
    });
    await p.close();
  }
  const a = res.three.out, l = res.lite.out; let same = 0, hot = 0;
  for (let i = 0; i < a.length; i++) { if (a[i] === l[i]) same++; if (a[i] !== '-') hot++; }
  const diff = {}; for (let i = 0; i < a.length; i++) if (a[i] !== l[i]) { const k = a[i] + ' -> ' + l[i]; diff[k] = (diff[k] || 0) + 1; } console.log(JSON.stringify(diff));
  console.log(`${n}: ${same}/${a.length} grid points agree (${hot} on a part with three)`);
}
await b.close();
