// Spike: render each figure with three.js r128 and with kit/three-lite.js at the same second, side by side,
// and report SSIM per figure. Usage: node spike/compare.mjs [names…]  (needs playwright and ffmpeg)
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { assemble } from '../scripts/build.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'spike/out'); mkdirSync(OUT, { recursive: true });
const { chromium } = await import(process.env.PLAYWRIGHT || 'playwright');
const CH = process.env.CHROME_PATH || `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
const three = readFileSync(join(ROOT, 'kit/three.min.js'), 'utf8');
const lite = readFileSync(join(ROOT, 'kit/three-lite.js'), 'utf8');
const names = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(join(ROOT, 'examples')).filter(f => f.endsWith('.js')).map(f => f.slice(0, -3));
const theme = process.env.THEME || '';
const b = await chromium.launch({ executablePath: CH, args: ['--use-angle=metal', '--enable-gpu'] });
const rows = [];
for (const n of names) {
  const src = readFileSync(join(ROOT, 'examples', n + '.js'), 'utf8');
  for (const [kind, lib] of [['three', three], ['lite', lite]]) {
    const page = assemble(src).replace(/<script src="[^"]*three[^"]*"><\/script>/, () => `<script>\n${lib}\n</script>`);
    writeFileSync(join(OUT, `${n}-${kind}.html`), page);
  }
  const shots = {};
  for (const kind of ['three', 'lite']) {
    const p = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
    const errors = []; p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await p.goto(`file://${join(OUT, `${n}-${kind}.html`)}?embed&still&t=${process.env.T || 2}${theme ? '&theme=' + theme : ''}`);
    try { await p.waitForFunction(() => window.__diorama, null, { timeout: 8000 }); } catch { errors.push('no __diorama'); }
    await p.waitForTimeout(300);
    const file = join(OUT, `${n}${theme ? '-' + theme : ''}-${kind}.png`);
    const stage = await p.$('#stage');
    if (stage) await stage.screenshot({ path: file, omitBackground: true });
    shots[kind] = { file, errors };
    await p.close();
  }
  const r = spawnSync('ffmpeg', ['-hide_banner', '-i', shots.three.file, '-i', shots.lite.file, '-lavfi', 'ssim', '-f', 'null', '-'], { encoding: 'utf8' });
  const m = /All:([0-9.]+)/.exec(r.stderr || ''); const ssim = m ? m[1] : 'err';
  spawnSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', shots.three.file, '-i', shots.lite.file, '-filter_complex', '[0][1]hstack', join(OUT, `${n}${theme ? '-' + theme : ''}-pair.png`)]);
  rows.push({ n, ssim, errors: shots.lite.errors.slice(0, 2) });
  console.log(`${n}${theme ? ' [' + theme + ']' : ''}: ssim=${ssim}${shots.lite.errors.length ? ' lite errors: ' + shots.lite.errors.slice(0, 2).join(' | ') : ''}`);
}
await b.close();
