---
name: diorama-wash
description: 'Paint a watercolor on warm paper: translucent washes, soft bleeding edges, a darker wet rim, granulation in the darks, paper grain and unpainted reserves. The subject can be anything. Describe it with discs, polygons, brush strokes and ink, or hand in a picture drawn in code and have each region painted as a wash. One self-contained HTML file using WebGL 2 and no external images. A frame is a function of time t. Use it when someone asks for a watercolor, gouache, or ink-wash picture of any subject. For isometric SVG illustrations use diorama; for narrative 3D miniatures use diorama-worlds; for dithered pixel art use diorama-pixel.'
license: MIT
compatibility: Written for agents that read skills. Needs Node.js 20+ for the build and checks, and Chrome or Chromium with WebGL 2 for the look.
metadata:
  opencode/slash: "true"
---

# Diorama Wash: a watercolor of any subject

You are painting one picture on warm, cold-pressed paper. The paper grain shows everywhere. Colour is thin glaze: each wash multiplies over the paper and over the glazes under it, so overlaps mix and the sheet stays visible. Edges bleed, a darker line sits in the wet rim, pigment granulates where the wash is heavy, and some of the paper is left bare on purpose. Nothing is a hard vector shape with noise sprinkled on it.

The subject is whatever was asked for. A pond is one example, not the only one. The scenes in `examples/` are the bar, and they are the format you will write: a pond, a landscape, a row of houses, a portrait, a still life, a flower, and a picture turned into washes.

This skill is separate from the others in this repository. `diorama` draws SVG illustrations. `diorama-worlds` renders narrative miniatures. `diorama-pixel` draws dithered pixel art without WebGL. Use this one for a watercolor.

You write one thing: the scene, a `.js` file. The kernel (`kit/wash.js`) and the page (`kit/page.html`) are fixed. Never edit them to make a scene work, and never paste a changed copy.

Every file named below is in this skill's folder. Write the scene and the built page in the person's working directory, and run the scripts from there by their path in this folder.

## 1. Concept

Write the concept in one line before any code:

> **Name.** What is painted, in what palette. What moves. What a click does.

Pick a subject with a clear silhouette at a glance: a field, a house, a face, a bowl of fruit, a flower, an animal, a pond. Then the parts, in three lines: **washes** (the broad glazes, light ones first), **drawing** (strokes and ink, few of them), **life** (one thing that moves). A scene runs to about 15–30 marks. If the list is a pile of ellipses, the picture will look like one.

Offer two or three concepts when there is someone to ask, and wait. If there is nobody to ask, take the one with the strongest still frame and say which.

## 2. Build

1. Read `references/art-direction.md`: paper, glazes, the wet edge, granulation, reserves, strokes and ink.
2. Read `references/scene-api.md`: the declaration, the mark helpers, a picture turned into washes, and the rule that a frame is a function of `t`.
3. Read the nearest example: `examples/pond.js`, `examples/landscape.js`, `examples/town.js`, `examples/portrait.js`, `examples/still.js`, `examples/poppy.js`, or `examples/imprint.js` (a picture drawn in code, then `Wash.plate`).
4. Write `<name>.js`: one `Wash.scene({ ... })` with `name`, `title`, `means` (at most 140 characters), `hint`, `duration`, `still`, and `paint(ctx)` returning `{ marks, read }`. Use `prepare()` only when the scene starts from a picture.
5. Build: `node <skill>/scripts/build.mjs <name>.js` writes `wash-<name>.html`.

Pose every value from `ctx.t`. A position is `sin` or `cos` of `t`, not `x += speed`. Periods divide `duration`, so the frame at `t` and the frame at `t + duration` match. Leave a margin of bare paper around the subject.

## 3. Check

1. `node <skill>/scripts/validate.mjs <name>.js wash-<name>.html`. Fix every `FAIL`.
2. `npm ci --ignore-scripts --prefix <skill>` once, then `node <skill>/scripts/look.mjs <name>.js <outdir>`. It opens the page in headless Chromium with the network blocked, writes the still, four moments, and a narrow view, and checks that pigment and paper both show, that the loop moves, that the loop closes, that the same `t` rendered twice is the same pixels, a click, reduced motion, and that nothing was requested over the network. `CHROME_PATH` selects a browser. `WASH_SWIFTSHADER=1` forces a software GL implementation.
3. **Open the PNGs and look.** A passing check is not a picture. Ask of the still, using `references/art-direction.md`: does the paper grain show in the bare sheet and through the colour? Do overlaps mix instead of sitting as flat stickers? Does each wash bleed, with a darker wet rim? Do the darks granulate? Is some paper left unpainted where a light should be? Do strokes and ink have direction and a broken width? Would you still know the subject if you glanced at it? Then fix the scene, not the kernel, and look again.

Do not hand over a page the validator rejects. Do not claim the look is done if you did not open the images. Without a browser, say so and hand the page over with the look unverified.

`node <skill>/scripts/render.mjs <name>.js <outdir> --frames 0,2.5 --clip` writes those frames and a short mp4. The clip is for a person who asked for one. It is not a substitute for the stills.

## 4. Hand over

Give `wash-<name>.html` the way the person asked. Then, one line each: the concept; the still second and why; that the page is one file and needs WebGL 2; how to embed it (`references/scene-api.md`); anything you could not verify.

## 5. Adjust

When the person asks for a change, edit only `<name>.js`, build, validate, and look again.

## What goes wrong

| If you catch yourself | Do this instead |
| --- | --- |
| writing `x += speed` or storing a position from the previous frame | a position from `ctx.t`, so `renderAt(t)` does not depend on earlier frames |
| using `Math.random`, `Date.now`, or `requestAnimationFrame` in the scene | `ctx.t` |
| a perfect oval with a hard outline as the whole subject | a few overlapping glazes, `bleed` large enough to scallop the edge, ink only where a line is needed |
| flat colour with grain laid on top | lower `load` so the paper shows through, and a second darker glaze where the form turns |
| painting the whole sheet edge to edge | a margin of bare paper; the grain is the ground |
| a white sticker for a highlight | `Wash.lift`, or leave that patch with no mark |
| a stroke that is a straight ruler | more points along a curve, a modest `width`, and let the kernel break it |
| adding an image file, a font, or a mesh | shapes in `paint`, or pixels you draw in `prepare` and pass to `Wash.plate` |
| editing `kit/wash.js` so one scene looks right | the scene is wrong; change the scene |
| a loop that jumps at the seam | periods that divide `duration` |

## References

- `references/scene-api.md`: the declaration, marks, plates, the runtime, embedding, the checks.
- `references/art-direction.md`: paper, glazes, wet edges, granulation, reserves, strokes and ink.
