---
name: diorama-wash
description: 'Paint a top-down watercolor pond or lake on warm paper: cerulean and indigo washes, a soft bleeding shore, earth-green stains, paper grain and granulation. The water is a flat surface whose pigment shifts with time, and wakes are drawn into a displacement map. Painted boats with rowers, and creatures that rise out of the blue, can move on it. One self-contained HTML file using WebGL 2 and no external images. Use it when someone asks for a watercolor, gouache, or ink-wash illustration of a pond, a lake, a pool, or anything floating on flat water. For isometric SVG illustrations use diorama; for narrative 3D miniatures use diorama-worlds; for dithered pixel art use diorama-pixel.'
license: MIT
compatibility: Written for agents that read skills. Needs Node.js 20+ for the build and checks, and Chrome or Chromium with WebGL 2 for the look.
metadata:
  opencode/slash: "true"
---

# Diorama Wash: a pond painted on paper

You are making one sheet of water, seen straight down, isolated on warm paper. The shore bleeds, the blues run from cerulean to indigo, the darks granulate, and the surface moves because the time `t` shifts the wash and a render target of rings and wakes displaces it. Boats and creatures are painted marks on that sheet. The three scenes in `examples/` are the bar, and they are the format you will write.

This skill is separate from the others in this repository. `diorama` draws SVG illustrations. `diorama-worlds` renders narrative miniatures. `diorama-pixel` draws dithered pixel art without WebGL. Use this one for a watercolor pond, lake, or pool.

You write one thing: the scene, a `.js` file. The kernel (`kit/wash.js`) and the page (`kit/page.html`) are fixed. Never edit them to make a scene work, and never paste a changed copy.

Every file named below is in this skill's folder. Write the scene and the built page in the person's working directory, and run the scripts from there by their path in this folder.

## 1. Concept

Write the concept in one line before any code:

> **Name.** The water and what is on it. What moves. What a click does.

Pick one sheet of water: a pond with one boat, a lake with a few boats and their wakes, or a pool with something living under it. Then the parts, in three lines: **water** (how wide, how still), **marks** (boats, creatures, lilies), **life** (who crosses, who surfaces). A scene runs to one to four actors. If the list reads crowded, the sheet will too.

Offer two or three concepts when there is someone to ask, and wait. If there is nobody to ask, take the one with the strongest still frame and say which.

## 2. Build

1. Read `references/art-direction.md`: paper, the bleeding shore, the washes, what a wake is, and how a submerged mark differs from one on the surface.
2. Read `references/scene-api.md`: the declaration, the actor fields, and the rule that a frame is a function of `t`.
3. Read the nearest example: `examples/pond.js` (one boat), `examples/lake.js` (three boats, wakes, collisions), or `examples/creatures.js` (fish and a frog that surface, one moored boat).
4. Write `<name>.js`: one `Wash.scene({ ... })` with `name`, `title`, `means` (at most 140 characters), `hint`, `duration`, `still`, optional `pond`, optional `collide`, `build` returning `actors`, and `tick(ctx)` posing every actor from `ctx.t`.
5. Build: `node <skill>/scripts/build.mjs <name>.js` writes `wash-<name>.html`.

Pose every value from `ctx.t`. A position is `sin` or `cos` of `t`, not `x += speed`. Periods divide `duration`, so the frame at `t` and the frame at `t + duration` match. `phase`, `sub`, and `splash` follow the same rule. `speed` greater than a small threshold gives a boat a wake. `splash` near 1 at a moment in the past gives a creature a ring.

## 3. Check

1. `node <skill>/scripts/validate.mjs <name>.js wash-<name>.html`. Fix every `FAIL`.
2. `npm ci --ignore-scripts --prefix <skill>` once, then `node <skill>/scripts/look.mjs <name>.js <outdir>`. It opens the page in headless Chromium with the network blocked, writes the still, four moments, and a narrow view, and checks fill, motion, the loop seam, that the same `t` rendered twice is the same pixels, a click, reduced motion, and that nothing was requested over the network. `CHROME_PATH` selects a browser. `WASH_SWIFTSHADER=1` forces a software GL implementation.
3. **Open the PNGs and look.** A passing check is not a picture. Ask of the still: is the pond isolated on the paper? Does the shore bleed, with a darker wet edge? Do the blues deepen toward the middle, and do the darks granulate? Does a boat read as a boat with a rower, and a creature under the water read as soft and blue? Do the wakes sit behind the moving boats? Then fix the scene, not the kernel, and look again.

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
| using `Math.random`, `Date.now`, or `requestAnimationFrame` in the scene | `ctx.t`, and `hash` is already in the kernel |
| a shore that is a perfect oval with a hard stroke | `pond.rx`, `pond.ry`, and `pond.seed`; the kernel bleeds the edge |
| a boat with no wake, or a wake with no boat | set `speed` from the derivative of the path; a moored boat stays at speed 0 |
| a creature that is only a surface sprite | drive `sub` from 1 to 0 and pulse `splash` as it crosses |
| adding an image, a font file, or a mesh | the kernel paints with shaders; actors are `boat`, `fish`, and `frog` |
| editing `kit/wash.js` so one scene looks right | the scene is wrong; change the scene |
| a loop that jumps at the seam | periods that divide `duration`, and `phase` in whole turns of that duration |

## References

- `references/scene-api.md`: the declaration, actors, the runtime, embedding, the checks.
- `references/art-direction.md`: paper, shore, washes, wakes, boats, and creatures.
