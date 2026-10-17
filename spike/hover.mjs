// Spike: the part under the pointer on a grid, with three.js and with three-lite; reports how many grid points agree.
// Usage: node spike/hover.mjs <names…>   env: THEME (for the line theme's edge picking), BROWSER, PLAYWRIGHT. Pages come from compare.mjs.
import { join } from 'node:path';
import { OUT, launch, contextOptions } from './launch.mjs';
const theme = process.env.THEME || '';
const b = await launch();
const ctx = await b.newContext(contextOptions());
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
for (const n of process.argv.slice(2)) {
  const res = {};
  for (const kind of ['three', 'lite']) {
    const p = await ctx.newPage();
    await p.goto(`file://${join(OUT, `${n}-${kind}.html`)}?embed${theme ? '&theme=' + theme : ''}`);
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
  const diff = {}; for (let i = 0; i < a.length; i++) if (a[i] !== l[i]) { const k = a[i] + ' -> ' + l[i]; diff[k] = (diff[k] || 0) + 1; }
  console.log(`${n}${theme ? ' [' + theme + ']' : ''}: ${same}/${a.length} grid points agree (${hot} on a part with three)${Object.keys(diff).length ? ' ' + JSON.stringify(diff) : ''}`);
}
await ctx.close(); await b.close();
