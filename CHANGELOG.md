# Changelog

All notable changes to Diorama are listed here. The versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and every version is a [release on GitHub](https://github.com/educlopez/diorama/releases) with the same notes. From 1.0.0 on, [release-please](https://github.com/googleapis/release-please) writes each new section from the pull requests merged since the last version (`feat:` under Added, `fix:` under Fixed, `perf:` and `refactor:` under Changed, `docs:` under Documentation) and opens the release pull request that publishes it.

## [1.1.0](https://github.com/educlopez/diorama/compare/v1.0.0...v1.1.0) (2026-10-21)

### Added

- **Diorama Worlds**, a separate installable skill in the same repository. Detailed miniature stories, shared adult human rig, coordinated hand/prop contacts and flat irregular ground by default.
- Four original scenes: flower stall, pottery studio, morning bakery and hilltop observatory. Cricket, basketball and juggling remain additional regression subjects.
- Four live finishes: miniature, pixel, halftone and blueprint, sharing scene geometry and animation time.
- Offline HTML builder bundling Three.js and generated textures, with pause, playback speed, reduced-motion stills, offscreen sleep and WebGL fallback.
- Browser checks for all finishes, actual contacts, loop seams, real-time pacing, mobile framing, lifecycle and disposal; isolated installation smoke tests and release quality gates.
- A shared home presenting both SVG and Worlds, separate definitive install commands, `/worlds` playground, `/docs/worlds` guide, sitemap and agent-readable documentation.

### Fixed

- Slow-motion drift caused by dropping elapsed frame time; animation now follows an absolute wall-clock anchor.
- Cached iframe readiness race, preserving scene state across finish changes and warm reloads.
- Stale generated poster caches through revisioned asset paths.
- Missing static thumbnails for five existing SVG gallery entries.

### Compatibility

- The original SVG renderer, figure API, six themes and eighteen examples remain unchanged. SVG routes do not load the Worlds WebGL runtime.
- Worlds requires WebGL 2 and its own pinned build dependencies. Built files are about 0.77 MB uncompressed; SVG files are about 30–35 KB gzip. No claim of equal physical-device performance or realistic material/biomechanical simulation.

## [1.0.1](https://github.com/educlopez/diorama/compare/v1.0.0...v1.0.1) (2026-10-20)


### Fixed

* quote SKILL.md description so npx skills add can parse it ([#14](https://github.com/educlopez/diorama/issues/14)) ([e0793b2](https://github.com/educlopez/diorama/commit/e0793b20089f21b10c3c050322788c3bfb8f49e0))

## [1.0.0] - 2026-10-19

### Added

- A renderer of the kernel's own: the figures draw as SVG, with no three.js, no WebGL and nothing to load. A small scene graph (groups, meshes, materials, vectors, matrices), an orthographic isometric camera fitted to the scene, one flat tone per face from the sun, the fill and the sky, a disc and a crescent for a sphere, a gradient across the side of a cylinder or a cone, shadows thrown along the sun onto the slabs, a soft halo under the base, and ink edges that can be drawn by hand (`wobble`).
- A `print` theme: flat tones per face and ink lines, a printed illustration.
- A press: `ctx.pressed`, `ctx.active` and `ctx.tap(x, y)`, so a tap on a phone answers like a hover does; a read-out line (`ctx.read`) the bench and the host can show; `D.apart` for things that come apart under the pointer; an aria label on the mount.
- `{ on: wall }` on a primitive paints it right after what it is set into (a window in a wall, a door on a cabinet).
- Five examples: `harbour` (hero), `kitchen` (card), `assembly` (card, mono), `observatory` (mini, line, hand-drawn) and `vending` (mini, print); eighteen in all.
- The look script's sheet of nine pictures (rest, three seconds of the loop, the pointer, the corner, a press, the thumbnail, the page), with measurements of fill, motion, the pointer's answer and the press, and a clash check that finds moving parts passing through others.
- The bench's accent swatches, `?theme=&accent=` and a live read-out.

### Changed

- The painter's order: pieces sort far-first by depth, then every pair that overlaps on the page and has an axis plane between them paints in the order the plane says, so a counter stays in front of a tall wall and a window stays on it.
- The hand-drawn ink bows a whole stroke slowly instead of sawing each short piece, so rings and domes waver like a pen line.
- Every example paints its subject with `pal.accent`, the colour a brand hex replaces; `launchpad` comes apart on hover and launches on a tap with a countdown read-out.
- The docs: `SKILL.md`, `references/craft.md` (insides are built as shells, never buried in a solid), `references/look.md`, `references/motion.md`, `references/react.md`, the README gallery and the site, for eighteen figures and six themes.

### Removed

- `kit/three.min.js`, the three-lite build and its minifier, and the `--lite` flag of the build.

### Fixed

- The mailbox's door opened into its body instead of hanging down.
- The forklift's driver sat inside the body of the truck.
- The launchpad's gantry arm went through the rocket and through a leg of the gantry.
- Shallow clashes in `powder`: the skier stepping off the chair against the top platform, a chair rider against the skier waiting to board.

## [0.1.0] - 2026-10-17

### Added

- The skill: `SKILL.md` with the size and concept, build, check, hand over and adjust steps, and the table of what goes wrong; `references/` for the craft rules, the concepts, the motion helpers, the look and the React drop-in.
- The kernel on three.js with the isometric camera, the primitives, the props, the clock helpers, the pointer, six themes (`toy`, `soft`, `mono`, `line`, `night`, and a `print` in the making) and the rounded base.
- Thirteen examples across three sizes: `town`, `island`, `farm`, `warehouse`, `powder` (hero), `cafe`, `launchpad`, `server`, `rack` (card), `mailbox`, `seedling`, `desk`, `turntable` (mini).
- `bench.html` and the scripts: `build.mjs`, `validate.mjs` with ten checks, `look.mjs` in headless Chromium; the three-lite build.
- The site at diorama.educalvolopez.com with the gallery, the docs, `llms.txt` and the launch videos; the identity check on every commit.

[1.0.0]: https://github.com/educlopez/diorama/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/educlopez/diorama/releases/tag/v0.1.0
