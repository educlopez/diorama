// Spike: render each figure with three.js r128 (inlined) and with three-lite (build.mjs --lite) at the same second,
// in one browser, and report SSIM per figure with the console errors of both pages.
// Usage: node spike/compare.mjs [names…]   env: BROWSER, MOBILE, THEME, T, PLAYWRIGHT (see launch.mjs); needs ffmpeg.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { assemble } from '../scripts/build.mjs';
import { ROOT, OUT, TAG, launch, contextOptions } from './launch.mjs';

mkdirSync(OUT, { recursive: true });
const names = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(join(ROOT, 'examples')).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3));
const theme = process.env.THEME || '', suffix = theme ? '-' + theme : '';
const b = await launch();
const ctx = await b.newContext(contextOptions());
await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({ body: '', contentType: 'text/css' }));
const rows = [];
for (const n of names) {
  const src = readFileSync(join(ROOT, 'examples', n + '.js'), 'utf8');
  writeFileSync(join(OUT, `${n}-three.html`), assemble(src, { inline: true }));
  writeFileSync(join(OUT, `${n}-lite.html`), assemble(src, { lite: true }));
  const shots = {};
  for (const kind of ['three', 'lite']) {
    const p = await ctx.newPage();
    const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto(`file://${join(OUT, `${n}-${kind}.html`)}?embed&still&t=${process.env.T || 2}${theme ? '&theme=' + theme : ''}`);
    try { await p.waitForFunction(() => window.__diorama && window.__diorama.renderer && window.__diorama.renderer.getContext(), null, { timeout: 15000 }); } catch { errors.push('no WebGL context'); }
    await p.waitForTimeout(400);
    if (!rows.length && kind === 'lite') console.log(await p.evaluate(() => { const gl = window.__diorama.renderer.getContext(), d = gl.getExtension('WEBGL_debug_renderer_info'); return navigator.userAgent + ' · ' + (d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)) + ' · dpr ' + devicePixelRatio; }));
    const file = join(OUT, `${n}${suffix}-${kind}-${TAG}.png`);
    const stage = await p.$('#stage');
    if (stage) await stage.screenshot({ path: file, omitBackground: true });
    shots[kind] = { file, errors };
    await p.close();
  }
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', shots.three.file, '-i', shots.lite.file, '-lavfi', 'ssim', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /All:([0-9.]+)/.exec(r.stderr || ''); const ssim = m ? m[1] : 'err';
  spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', shots.three.file, '-i', shots.lite.file, '-filter_complex', '[0][1]hstack', join(OUT, `${n}${suffix}-pair-${TAG}.png`)]);
  rows.push({ name: n, ssim, three: shots.three.errors.slice(0, 3), lite: shots.lite.errors.slice(0, 3) });
  const err = (k, e) => e.length ? ` ${k} errors: ${e.join(' | ')}` : '';
  console.log(`${TAG} ${n}${theme ? ' [' + theme + ']' : ''}: ssim=${ssim}${err('three', shots.three.errors)}${err('lite', shots.lite.errors)}`);
}
await ctx.close(); await b.close();
writeFileSync(join(OUT, `compare-${TAG}${suffix}.json`), JSON.stringify(rows, null, 2) + '\n');
