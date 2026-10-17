# three-lite as a build option: results

Branch `educlopez/lite-build`, from `spike/three-lite`. Date 2026-10-16. Diorama is in beta; `--lite` is an option, three.js r128 stays the default.

## What changed

- `scripts/build.mjs`: a `--lite` flag. `assemble(figure, { lite: true })` pastes `kit/three-lite.min.js` in place of the three.js script tag. `--inline` and the cdnjs default are unchanged. `liteSource()` is exported for the other scripts.
- `kit/three-lite.min.js`: the minified copy the build pastes, written by the new `scripts/minify-lite.mjs` (terser, `ecma: 5`, resolved from the working directory or from `DIORAMA_TOOLS`; the skill itself still has no dependency). Regenerate it after any change to `kit/three-lite.js`.
- `scripts/validate.mjs`: a tenth check, `renderer`. A built page must carry exactly one renderer: the cdnjs script, three.js inlined, or three-lite inlined. A lite page that also links or inlines three.js fails with `a lite page also carries three.js: build it with --lite alone`. Lite pages pass all ten checks; three.js pages are unaffected. Checked on 39 pages (13 figures in cdn, `--inline` and `--lite`).
- `apps/site/scripts/examples.mjs`: `--lite` (or `DIORAMA_LITE=1`) builds the gallery pages on three-lite. The default prebuild is unchanged and was run again after the check, so `public/examples` holds three.js pages.
- `kit/three-lite.js`:
  - `Raycaster.intersectObjects` now tests `LineSegments` the way three's `Line.raycast` does: every segment within `params.Line.threshold` (default 1, world units, divided by the object's mean scale) is a hit, at the distance from the ray origin to the nearest point on the ray; a bounding-sphere early-out comes first. For this, `Ray` gained `copy`, `applyMatrix4`, `distanceSqToPoint`, `intersectsSphere` and a port of `distanceSqToSegment`; `BufferGeometry` gained `computeBoundingSphere`; `Vector3` gained `distanceToSquared`; `Raycaster` gained `near` and `far`.
  - `WebGLRenderer.getContext()` returns the GL context. `scripts/look.mjs` calls it to decide the page is alive, so a lite page can be looked at with the same script.
- `kit/diorama.js`: not touched. No browser bug forced a change.
- Figures: not touched.
- Docs: `SKILL.md` step 5 (Build), `README.md` (ships as, requirements, usage, how it works, ten checks), `references/react.md`, `references/look.md`, the site's docs page (scripts, installation), `lib/site.ts` (files table) and `llms.txt`. Everywhere the flag is described as an option in beta, with three.js as the default. The site's typecheck was not run: this worktree has no `node_modules` for `apps/site`, and the edits are inside string literals only.
- `spike/`: `launch.mjs` (one browser by name, desktop or phone profile), `compare.mjs` (now builds the lite page with the real `--lite` build, takes `BROWSER`, `MOBILE`, `THEME`, prints the user agent and GL renderer, records console errors of both pages, writes `spike/out/compare-<tag>.json`), `hover.mjs` (takes `THEME`). `spike/out/` is gitignored and holds the pages, the screenshots, the pairs and `matrix.log`.

Run them with:

```sh
export PLAYWRIGHT=$HOME/Developer/Personal/diorama-launch-video/node_modules/playwright/index.mjs
node spike/compare.mjs                          # Chromium, default theme
BROWSER=webkit node spike/compare.mjs           # WebKit
BROWSER=webkit MOBILE=1 node spike/compare.mjs  # WebKit, 390x844 at device scale 3
THEME=line node spike/hover.mjs town server     # the line theme's pointer
```

WebKit and Firefox were installed with `npx playwright install webkit firefox` from the launch-video project into `spike/out/browsers` (`PLAYWRIGHT_BROWSERS_PATH`, picked up by `spike/launch.mjs`). Chromium is the launch-video project's build 1234, as the spike had it.

## Sizes (gzip, level 9)

`kit/three.min.js`: 603,445 B raw, 149,563 B gzip. `kit/three-lite.min.js`: 43,719 B raw, 14,612 B gzip (13,614 B before the line raycast and the banner).

A `cdn page` is the default build (the three.js script tag, the page itself); the next column adds what the browser fetches from cdnjs. `--inline` and `--lite` are single files.

| Figure | cdn page | cdn page + three.js from cdnjs | `--inline` | `--lite` | lite / inline |
|---|---:|---:|---:|---:|---:|
| cafe | 18,212 B | 167,775 B | 167,576 B | 32,556 B | 19.4% |
| desk | 17,127 B | 166,690 B | 166,491 B | 31,469 B | 18.9% |
| farm | 19,044 B | 168,607 B | 168,407 B | 33,381 B | 19.8% |
| island | 18,620 B | 168,183 B | 167,981 B | 32,960 B | 19.6% |
| launchpad | 18,433 B | 167,996 B | 167,796 B | 32,777 B | 19.5% |
| mailbox | 16,934 B | 166,497 B | 166,299 B | 31,275 B | 18.8% |
| powder | 21,834 B | 171,397 B | 171,212 B | 36,152 B | 21.1% |
| rack | 17,605 B | 167,168 B | 166,969 B | 31,946 B | 19.1% |
| seedling | 17,202 B | 166,765 B | 166,566 B | 31,547 B | 18.9% |
| server | 17,666 B | 167,229 B | 167,031 B | 32,010 B | 19.2% |
| town | 20,652 B | 170,215 B | 170,013 B | 34,975 B | 20.6% |
| turntable | 17,434 B | 166,997 B | 166,798 B | 31,776 B | 19.1% |
| warehouse | 19,508 B | 169,071 B | 168,873 B | 33,847 B | 20.0% |

Per figure a lite page is about a fifth of an inline page, and about 14 KB above the cdn page's own size, which was already the kernel plus the figure plus the bench.

## Fidelity per browser (SSIM, three.js inline against `--lite`, same browser, same second)

All 13 figures at `?embed&still&t=2`, 900 x 900 desktop viewport at device scale 1; the mobile profile is WebKit at 390 x 844, device scale 3, `isMobile`, `hasTouch`. Pair images are in `spike/out/<figure>[-line]-pair-<tag>.png`.

| Profile | User agent | GL renderer |
|---|---|---|
| Chromium | HeadlessChrome/151.0.0.0 | ANGLE (Apple, ANGLE Metal Renderer: Apple M5 Pro) |
| WebKit | Version/27.2 Safari/605.1.15 (Playwright webkit-2370) | Apple GPU |
| WebKit mobile | the same, dpr 3 | Apple GPU |
| Firefox | not measured: the Playwright Firefox builds do not start on this Mac (see below) | |

| Figure | Chromium | WebKit | WebKit mobile | Firefox | Chromium, line | WebKit, line | WebKit mobile, line |
|---|---:|---:|---:|---:|---:|---:|---:|
| cafe | 0.999592 | 0.999592 | 0.999556 | not measured | 0.999272 | 0.999272 | 0.999237 |
| desk | 0.999717 | 0.999717 | 0.999810 | not measured | 0.999717 | 0.999717 | 0.999810 |
| farm | 0.999390 | 0.999390 | 0.999441 | not measured | 0.999221 | 0.999221 | 0.999360 |
| island | 0.999805 | 0.999805 | 0.999801 | not measured | 0.997954 | 0.997954 | 0.996875 |
| launchpad | 0.998397 | 0.998397 | 0.998420 | not measured | 0.999267 | 0.999267 | 0.999280 |
| mailbox | 0.999209 | 0.999209 | 0.999119 | not measured | 0.999694 | 0.999694 | 0.999761 |
| powder | 0.999371 | 0.999371 | 0.999394 | not measured | 0.998834 | 0.998834 | 0.998952 |
| rack | 0.999677 | 0.999677 | 0.999583 | not measured | 0.999245 | 0.999245 | 0.999247 |
| seedling | 0.999124 | 0.999124 | 0.999428 | not measured | 0.999124 | 0.999124 | 0.999428 |
| server | 0.999548 | 0.999548 | 0.999595 | not measured | 0.999530 | 0.999530 | 0.999510 |
| town | 0.999120 | 0.999120 | 0.999231 | not measured | 0.999018 | 0.999018 | 0.999162 |
| turntable | 0.999647 | 0.999647 | 0.999629 | not measured | 0.999647 | 0.999647 | 0.999629 |
| warehouse | 0.999444 | 0.999444 | 0.999476 | not measured | 0.999365 | 0.999365 | 0.999457 |

Console errors and page errors, both pages, every profile: none.

On this Mac, Chromium and WebKit draw the same pixels: the three.js page in Chromium against the three.js page in WebKit gives SSIM 1.000000 (checked on cafe and on town in the line theme), so the two desktop columns agree to six places. Both go through Apple's Metal. The mobile run is a different image (1170 x 879 at device scale 3) and its numbers stand on their own; the lowest is island in the line theme at 0.996875, where hairlines are drawn at 1 device pixel by both renderers and the base's rounded edge lands on different pixels.

### Firefox: not measured

Playwright's Firefox does not start on this machine (macOS, Darwin 27.0.0). Two builds were tried, installed into `spike/out/browsers`:

- firefox-1555 (Firefox Nightly 157.0, the build Playwright 1.64.1 wants). Every launch exits at once with `Could not find profile folder.`, through Playwright and by hand (`firefox -no-remote -headless -profile <dir>`), with the profile in the scratchpad, in `/tmp`, under `~/.cache`, with `HOME`, `TMPDIR` and `XRE_PROFILE_PATH` overridden, with `--allow-downgrade`, with `MOZ_LEGACY_PROFILES=1`, and even `-CreateProfile` fails the same way. The outcome is the same outside the shell sandbox.
- firefox-1482 (Firefox 137.0, Playwright 1.52.0, installed in a scratch folder). It prints `sandbox_extension_issue_file_to_process failed for …/plugin-container.app: 1 (Operation not permitted)` and `Can't find profile directory`, then never answers Playwright: the first attempt hung at 99 percent CPU for about seven hours and had to be killed by hand, with its shell. A last attempt with a 60 s launch timeout and a 300 s watchdog that kills the process was made on firefox-1555 and failed at once with the same `Could not find profile folder.`

The cause is the browser's start-up on this OS, before any page loads: the Firefox builds cannot issue a sandbox extension for their own bundle or reach a profile directory. No Diorama page, three.js or lite, was ever opened in Firefox, so the column is not measured rather than failed. A machine where Playwright's Firefox runs can fill it with `BROWSER=firefox node spike/compare.mjs` (and `THEME=line`); the script, the profile and the error capture are in place.

## Hover on LineSegments

`spike/hover.mjs` samples a 36 x 36 grid of pointer positions at `t = 0` and compares the part under the pointer with three.js and with three-lite. Default theme (meshes only), the new lite:

| Figure | Points on a part (three.js) | Agree | Left over |
|---|---:|---:|---|
| cafe | 117 | 1296 |  |
| desk | 0 | 1296 |  |
| farm | 75 | 1295 | {"- -> tractor":1} |
| island | 49 | 1295 | {"- -> lighthouse":1} |
| launchpad | 75 | 1295 | {"rocket -> -":1} |
| mailbox | 0 | 1296 |  |
| powder | 131 | 1296 |  |
| rack | 146 | 1296 |  |
| seedling | 0 | 1296 |  |
| server | 223 | 1296 |  |
| town | 232 | 1295 | {"- -> bus":1} |
| turntable | 0 | 1296 |  |
| warehouse | 216 | 1296 |  |

Line theme, where every solid carries an `EdgesGeometry` in a `LineSegments` and three.js picks those with a threshold of 1 world unit, before (the lite from `spike/three-lite`, which ignored lines) and after:

| Figure | Points on a part (three.js) | Agree before | Agree after | Left over |
|---|---:|---:|---:|---|
| cafe | 319 | 1081 | 1296 |  |
| desk | 0 | 1296 | 1296 |  |
| farm | 150 | 1222 | 1296 |  |
| island | 116 | 1229 | 1294 | {"lighthouse -> -":2} |
| launchpad | 193 | 1145 | 1295 | {"- -> rocket":1} |
| mailbox | 0 | 1296 | 1296 |  |
| powder | 210 | 1201 | 1296 |  |
| rack | 364 | 994 | 1296 |  |
| seedling | 0 | 1296 | 1296 |  |
| server | 531 | 928 | 1296 |  |
| town | 393 | 1114 | 1296 |  |
| turntable | 0 | 1296 | 1296 |  |
| warehouse | 302 | 1210 | 1296 |  |

The left-over points are single grid cells on a silhouette (the lighthouse's edge, the rocket's tip, a bus corner) where the two implementations differ in the last bits of a triangle or segment test; the default theme has the same kind of single-cell differences, as the spike reported.

## What failed

- Firefox: not measured. Playwright's Firefox builds (1555 and 1482) do not start on this Mac; see the Firefox section. One attempt hung for about seven hours and was killed by hand; the last attempt ran under a 300 s watchdog and failed at launch.
- The site's `tsc --noEmit` was not run (no `node_modules` in this worktree; installing them is about 1 GB).
- Nothing else. No figure, no kernel change, no console error in any profile.
