# Diorama Worlds: release validation

## Scope

Diorama Worlds is a separate skill inside the Diorama repository, not a replacement for its dependency-free SVG renderer. Four original showcase scenes (florist, pottery studio, bakery, observatory) and three additional regression subjects share an adult human rig and four live finishes. Ground is a flat irregular cutout by default; an extruded slab is explicit opt-in.

## Reproduce

```sh
npm ci --ignore-scripts --prefix skills/diorama-worlds
npm ci --ignore-scripts --prefix apps/site
node scripts/release-check.mjs
node scripts/check-yaml.mjs
for source in skills/diorama/examples/*.js; do node skills/diorama/scripts/validate.mjs "$source"; done
WORLDS_TEST_OUTPUT=work/worlds-tests npm test --prefix skills/diorama-worlds
npm run build --prefix apps/site
npm run typecheck --prefix apps/site
# Run the production site on localhost:4180, then:
node skills/diorama-worlds/scripts/site-check.mjs work/worlds-site
# Tests the committed distribution, not uncommitted files or global skills:
node scripts/install-smoke.mjs work/install-smoke
```

The Quality workflow runs these on a clean checkout and retains visual reports. Open screenshots: numeric checks do not establish artistic quality, anatomy or reference fidelity.

## Measured renderer contracts

- Fourteen renderer tests: deterministic clocks/detail, dropped-frame pacing, definition validation, adult mesh proportions, grounded knees/feet, opt-in slab geometry, juggling contacts and seven actual offline browser outputs.
- Each original scene has 57 browser checks spanning all four finishes, multiple phases and mobile layouts, real hand/prop contacts, loop seam, deterministic seeking, visible geometry/framing, white negative space, resolution policy, invalid finishes, pose-preserving switches and no per-frame GPU allocations.
- Play/pause, real-time speed, reduced-motion stills, hidden/offscreen sleep, dispose/remount and readable missing-WebGL fallback are exercised.
- Standalone files bundle Three.js, generated textures and its MIT notice. Build dependencies are pinned; generated HTML needs no runtime network connection.

## Public-site contracts

- Home presents SVG and Worlds with their exact independent install commands. Clipboard behavior is exercised, not only visible labels.
- Production `/worlds` covers warm iframe readiness, four real scene/poster choices, four finishes, pose continuity, keyboard activation, real 1.5× rate, forged-message rejection, touch height and no horizontal overflow.
- SVG routes and both guides respond without fetching Worlds HTML. The home uses a real static Worlds poster, not an extra WebGL mount.
- Mobile widths include 320, 390, 768 and 1024; desktop captures use 1440. Site checks also cover both guides, sitemap, robots, initial reduced motion, WebGL poster fallback and failed local assets.
- Both gallery and fallback use the same poster revision directory. This fixes stale optimized images while keeping the site's restrictive local-image query policy.

## Visual review and non-obvious corrections

Actual stills, alternate poses and mobile screenshots were opened for all original subjects and the new finishes. Adult silhouettes use approximately seven head-heights, tapered limbs and independent hips/chest/head. Knees preserve planted feet; wrists follow task anchors rather than arbitrary waves. Unreachable florist/pottery/bakery/telescope poses were corrected by adjusting actor/task placement, not stretching arms or relaxing contact thresholds. The telescope objective points upward.

The original generic helper always extruded a brown platform, contrary to the chosen pixel direction. Its default now uses a flat ShapeGeometry and sparse coplanar fringe. A dedicated unit test prevents silently restoring the plinth. The SVG renderer and original figure source files remain unchanged.

The clock no longer drops elapsed time on slow frames. Cached iframe readiness is recovered through a subscribe-then-handshake protocol. Finish changes reuse one scene, while halftone/blueprint use depth to preserve white surroundings. These fixes have regression coverage.

## Honest limits

Stylized adults and repeatable gestures are not biomechanical simulation. Pottery spins without actual clay deformation; bakery dough is a simple posed shape. Halftone and blueprint are screen-space treatments, not physical ink or CAD. Small face/foliage details merge on mobile, especially in blueprint. No physical-phone FPS/battery certification or exact reference-fidelity claim. Standalone Worlds files are about 0.77 MB uncompressed; SVG figures are around 30–35 KB gzip, a different measure.

See `docs/releasing.md` for publication, version consistency, installer verification and the existing manual fallback when repository settings block release-please from opening PRs.

Pre-release review additionally tested batched IntersectionObserver notifications: the most recent visibility state wins, preventing a scene remaining asleep after a fast offscreen/onscreen round trip. The installed skill ignores its own default test-output directory, and its license refers to the actually bundled Three.js version notice rather than an obsolete vendored file.
