# diorama-pixel spike: results

Question: can we get the "pixel-art miniature" look (low internal resolution, Bayer dithering on every surface, procedural textures per material, a ground that dissolves into the page, soft cast shadows, tiny animated people) without three.js or WebGL, and how close does it come?

Short answer: yes, and closer than expected. A 37 KB software rasterizer on a 2D canvas renders both example scenes in about 4 ms a frame. Side by side, the result holds up against the Worlds `pixel` finish, and on texture and ground edge it is closer to the target.

## What was built

- `kit/pixel.js`: the kernel, one global `Pixel`, no dependency.
- `kit/page.html`: the page template. White page, canvas enlarged by a whole number with `image-rendering: pixelated`.
- `scripts/build.mjs`: puts a scene `.js` into one self-contained HTML file.
- `scripts/look.mjs`: captures and measurements. It borrows Playwright from `../diorama-worlds/node_modules`, so this skill has no dependency of its own.
- `examples/flower-stall.js`: a florist ties a bouquet under a striped awning while a customer waits. The valance flaps and a pennant sway.
- `examples/pier.js`: someone fishes off the end of a pier. The float bobs and ripple rings spread, a rowboat rocks on its rope, and a flag over a thatched shed and the reeds sway.

Build a scene with `node scripts/build.mjs examples/pier.js out.html`. Run a look with `node scripts/look.mjs examples/pier.js work/`.

## How it renders

1. **Scene graph.** Groups, convex solids (box, cylinder, cone, ball, gable wedge) and 1 px polylines. A small person rig has a hips/body/head/arm/leg hierarchy. `tick` poses everything from absolute time, and `P.update()` lets a tick read world positions (the rod tip feeds the fishing line).
2. **Triangles into a z-buffer** at 320 x 240. I chose a z-buffer over painter's sorting: at this resolution it costs almost nothing, it never mis-sorts, and it gives a world position per pixel. Procedural textures and shadow lookups need that position.
3. **Shadow map.** The scene is rasterized again from the sun into a 512² depth map, sampled with 2 x 2 PCF. The partial values then go through the dither, which gives soft shadow edges for free.
4. **Contact shadows.** A top-down height map of the solids' undersides (160²) darkens the ground under and around things that stand close to it. This is the darkening under the pier, the crates and the pots.
5. **Ground.** The ground is the analytic plane y = 0, not a mesh. For each screen pixel, the kernel computes once where the ray meets the plane, which zone it falls in (a scene function returns `grass`, `paving`, `water`, `shallow`, `sand` or `dirt`), and whether it survives the outline. The outline is an ellipse warped by fbm noise, and its edge alpha is thresholded with the Bayer matrix, so it dissolves into the page in a dither pattern. There is no slab and no plinth. Posts go below y = 0 and the water hides them.
6. **Shading.** Each pixel gets lambert + shadow + contact + a small sky term. A per-material procedural texture is then added: plank lines with grain and per-plank tone, thatch streaks in rows, running-bond paving with grout, coursed stone, leaf clumps, cloth folds, and stippled grass with 2 px blade marks. Water gets animated blotches, a lighter shallow band and time-stepped sparkles. Textures use the face's planar coordinates and the material's grain axis.
7. **Quantization.** The tone maps onto the material's ramp of 5 to 6 colours with an 8 x 8 Bayer matrix. The scene's ramps are hand-picked muted naturals. Arbitrary hex colours get an automatic ramp, hue-shifted toward cool violet in the shadows and warm cream in the lights, the way pixel artists shift them. Flat materials dither with a narrower spread (`dither: .55`), so clothes do not turn into a checkerboard.
8. **Outline.** A solid pixel whose neighbour is far behind it, or is the page, steps one shade darker. This gives the crisp pixel-art silhouette.
9. **Clock.** Time is absolute and frames are capped at 24 fps by default (pixel art moves in steps). The loop sleeps offscreen (IntersectionObserver) and while the tab is hidden. Under `prefers-reduced-motion` the page shows the `still` frame, and it follows changes to that setting live. `?still` freezes the page for captures.

Reuse of the SVG kernel: I checked it and decided against it. `Diorama.toolkit`, `Group`, `Mesh` and the maths are exported and could be called without editing `skills/diorama/kit/diorama.js`. But that file is 94 KB, which would triple the bundle. Its materials carry SVG theme toning, its geometry is parametric (I would still have to tessellate it), and `toolkit` is not part of its documented index. The new kernel keeps the same API shape instead (`P.group`, `P.box(w, h, d, mat, x, y, z, parent)`, `P.wave`/`P.phase`/`P.pulse`), so a figure author will find it familiar.

## Numbers

Measured in headless Chrome 155 on an Apple Silicon Mac (arm64), at 320 x 240 internal resolution.

| | pixel flower-stall | pixel pier | Worlds florist (all four finishes) |
| --- | --- | --- | --- |
| Built HTML | 46,120 B | 46,248 B | 770,213 B |
| gzip | ~15.6 KB | 15,582 B | 201,780 B |
| Kernel | 37,296 B (`pixel.js`, unminified) | same | three.js + world.js, bundled |
| Triangles drawn (front-facing) | 2,229 | 815 | n/a |
| Frame cost, median / p95 | 3.5 / 4.3 ms | 3.7 / 4.4 ms | not measured |
| fps, uncapped rAF | 60 (vsync-bound) | 60 | not measured |
| fps, default cap | 24.0 | 24.0 | n/a |

The frame cost covers the whole frame: tick, transforms, the shadow map, the height map, raster, shade and `putImageData`, in plain JS on one thread. At about 4 ms a frame the budget has more than 4x headroom at 60 fps. The pixel builds are about 6% of the Worlds build, the Worlds build carries four finishes, not just pixel, and the pixel pages need no WebGL.

## How close to the target look

My estimate is **about 75-80% of the target**. Item by item:

- **Low internal resolution, enlarged crisp:** done. 320 x 240, enlarged by a whole number with nearest-neighbour.
- **Ordered dithering everywhere:** done. Every surface goes through the Bayer quantizer.
- **Per-material textures:** good. Planks with gaps and grain (deck, counter, shed walls, bench), streaky thatch in rows, paving stones with grout, stippled grass with blade marks, leaf clumps, and dithered water blotches with light patches and a shallow band.
- **Ground edge dissolving into white:** done, and the clearest win over the Worlds pixel finish, whose ground has a fairly straight edge.
- **Muted palette, warm light from one side:** yes. Shadow colours are cool-shifted and lights warm-shifted.
- **Soft cast shadows:** real shadows from a shadow map, plus contact darkening. They are visible but on the light side; a heavier ambient-to-sun contrast would make them read more.
- **Tiny people with looping motion:** they work, but they are the weakest part. At about 30 px tall, the box rig reads as a person, but arms and hands are hard to read. The florist's tying motion shows as a bouquet turning more than as hands working. The Worlds `W.person`/`W.reach` rig with contact checks is clearly better here.
- **Loops:** water shimmer (texture time and sparkles), swaying awning flaps, pennant, flag and reeds, a rocking boat, a bobbing float with ripple rings, and a fisher whose arm lifts on a nibble.

## What is missing or weak

- **Figures.** There is no IK, no hand contact checks and no anatomy beyond boxes. The "sitting and moving an arm" loop works but reads coarsely. A real skill would need a better rig and perhaps hand-drawn 1-2 px details on heads (eyes, hair outline).
- **Organic shapes are faceted.** Trees and bushes are low-poly balls. They read as stylised blobs, not as pixel-art foliage clusters with lit tops and dark undersides. A per-material "clump" normal perturbation would help.
- **No reflections in the water.** Posts and the boat do not reflect, and there is no edge foam where posts meet the water.
- **Grass blades are subtle.** There are no tufts at the edge like the Worlds version has, and the edge of grass is a dissolve rather than a fringe.
- **Textures are world-space.** Moving objects would make their texture swim. That is not visible now because people use plain materials, but a textured moving object would show it. Local-space coordinates are a small change.
- **Thin geometry can drop pixels.** There is no conservative rasterization, so a 0.04-unit pole can break up at some angles. The 1 px line primitive covers ropes and rods.
- **Fixed camera, no pointer interaction, no hover read-out, no validation script.** The SVG skill has all of those. Only the look/measure script exists.
- **Packaging.** `look.mjs` borrows Playwright from the Worlds skill. A standalone skill needs its own devDependency or a shared tool.

## Verdict

It is worth a third skill. What it can do that the others cannot: the look is achievable without three.js or WebGL, at about 46 KB per page (about 15 KB gzipped), cheap to render, and it already beats the Worlds pixel finish on the two things the reference is most about, textured surfaces and a dissolving ground. The work left is mostly content and tooling, not renderer risk: a better person rig, foliage clumps, water reflections, then the checks the other skills have (validate, look sheet, reduced motion, offline). If the team does not want a third skill, the cheaper path is to offer this kernel as the `pixel` finish's renderer for figures that do not need the Worlds rig.

Captures are in `work/` (gitignored): `flower-stall-still.png`, `pier-still.png`, four loop moments each (`*-ta..td.png`), `worlds/florist-pixel-still.png`, and `side-by-side.png` (Worlds pixel florist, pixel flower stall, pixel pier).
