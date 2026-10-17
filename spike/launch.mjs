// Spike helper: one Playwright browser by name, and the context options for a desktop or a phone profile.
// BROWSER=chromium (default) | webkit | firefox; MOBILE=1 for an iPhone-sized WebKit viewport at device scale 3.
// PLAYWRIGHT points at playwright's index.mjs; the WebKit and Firefox builds live in spike/out/browsers.
import { existsSync } from 'node:fs';
import { join } from 'node:path';
export const ROOT = new URL('..', import.meta.url).pathname, OUT = join(ROOT, 'spike/out');
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && existsSync(join(OUT, 'browsers'))) process.env.PLAYWRIGHT_BROWSERS_PATH = join(OUT, 'browsers');
export const BROWSER = process.env.BROWSER || 'chromium', MOBILE = process.env.MOBILE === '1';
export const TAG = MOBILE ? 'mobile' : BROWSER;
const CH = process.env.CHROME_PATH || `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
export async function launch() {
  const pw = await import(process.env.PLAYWRIGHT || 'playwright');
  if (BROWSER === 'chromium') return pw.chromium.launch({ executablePath: existsSync(CH) ? CH : undefined, args: ['--use-angle=metal', '--enable-gpu'] });
  if (BROWSER === 'firefox') return pw.firefox.launch({ timeout: 60000, firefoxUserPrefs: { 'webgl.force-enabled': true, 'webgl.disabled': false } });
  return pw.webkit.launch();
}
export function contextOptions() {
  return MOBILE
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
    : { viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 };
}
