---
name: diorama-dither
description: 'Build a dithered isometric miniature on the pixel kernel with hard shadows, natural materials and a yard that fills the frame. Use it for a pixel diorama with ordered dither, a translucent ground shadow, and a tap that toggles one state. The pixel skill stays on its three default scenes; this one adds the dither finish and its examples.'
compatibility: Needs Node.js 20+ and Chrome or Chromium for the look. Do not edit the pixel kernel.
---

# Dither diorama

You are making one small place, drawn at 360 x 280 and enlarged with nearest-neighbour pixels. Surfaces use five close tones and a 4 x 4 ordered dither. The sun throws a hard shadow that darkens the ground's own colour. One or two people, about 14 to 16 pixels tall, do one looping action. A tap toggles one state. There is no score, no audio, and no halo around a light.

The pixel kernel (`skills/diorama-pixel/kit/pixel.js`) is fixed. A change there shifts the three pixel scenes. Put new helpers in `kit-src/finish.js`, then run `node scripts/sync-dither-kit.mjs` from the repo root. Never set `glow` on a material: it forces a face up to a flat brightness and reads as a bloom. A lamp is a paper box. A beam is a thin box of hard pixels.

Write the scene as `skills/diorama-dither/examples/<name>.js`. One `Pixel.scene({ ... })`. `means` is one sentence, at most 140 characters. The scene file stays at or under 260 lines.

## 1. Decide the picture before the code

Write four lines, then stop and check them against the rules below:

- **Ground.** A yard or a shore that fills the frame. Name the zones (meadow, earth, rock, sand, water).
- **Mass.** The one structure, where its front faces, and what must stay visible in front of it (a door, a course of stone, a person).
- **People.** Who, in the open, facing the work. Height `0.44` to `0.48`. Two or three cloth colours.
- **Life.** What loops, and the one thing a tap toggles. The loop is a function of `q` that matches at `0` and `1`.

If a person, a door or the front of the structure would sit behind a post, a wheel, a sail or a roof, move the person or the occluder now. The camera does not move.

## 2. Frame

- `width: 360, height: 280`, `fps: 12`, `duration: 8`, `still: 2`, `bayer: 4`, `shadow: 'hard'`, `rim: true`, `wind: 8`.
- Camera `{ az: 45, el: 30, scale: 54 to 62 }`. `height` recenters and does not zoom: it is the top of the fitted box. Set it near the top of the tallest mass. A band of white above that mass means `height` is too high; lower it until the mass sits close to the top. Too low and the roof is cut. Stop while a few pixels of sky remain.
- Ground `rx` about `3.4` to `4.2`, `rz` about `2.6` to `3.2`, `wobble` `0.3` to `0.4`, `fade` `0.3` to `0.36`. Use `rect: true` for a walled yard. The coloured ground should cover roughly a third to four fifths of the frame. A wide white margin means the yard is too small or the scale is too low.
- `sun: Dither.sun(45, elevation, turn)`. Elevation `36` to `58` degrees. `turn` of `14` to `20` degrees spreads a rotor's shadow so the blades do not stack into one bar. Shadows fall to screen-right. Leave lit ground past the shadow, short of the right-hand wall.

## 3. Materials

Call `Dither.mat(name)` and put the result on `materials`. The names already carry the right texture:

| Surface | Name | Why |
| --- | --- | --- |
| Grass yard | `meadow` | Grass grain, plus a fringe of `moss` blades at the edge so the rim is not a hard oval |
| Path, forge floor | `earth` | A zone, not a second slab |
| Courses of wall | `stone` or `rock` | The texture cuts joints. A wall is `Dither.wall`, which adds a coping |
| Roof | `tile` | Horizontal courses |
| Planks, posts, cart | `timber`, `beam`, `cart` | Grain along the long axis |
| Sail, sack, paper screen | `sail`, `sack`, `paper` | Cloth, flat, no dither extreme |
| Sea, pond | `water`, `pond` | The texture already moves and sparks. A crest is a short box, not a soft band |
| Lamp, ember, ray | `lantern`, `ember`, `ray` | Solid faces. `ray` has dither `0`. A second, darker dithered tone on alternate segments keeps a ray from reading as one bar |

`Dither.report(hex)` must come back with five tones, a max gap of `0.08` or less, a cool dark step and a warm light step. Do not hand-build a ramp unless a preset cannot say the hue.

## 4. Build from helpers

These live on `Dither` and do not run for a pixel scene:

- `wall(P, x, z, len, yaw, opt)` stone run plus a wider coping. `gate` for the opening. A yard is four runs and one gate, inside `rx` and `rz`.
- `folk(P, x, z, { h, yaw, name, shirt, pants, sleeve, hat })` a person the pointer can name. `h` is `0.44` to `0.48` at scale `48`, which lands near 14 to 16 pixels. At scale `56` to `62`, drop `h` toward `0.38` to `0.42` so the figure stays that tall. Shirt, pants and sleeve are the three colours. After `P.pose`, set the arms so the forearms leave the torso: a `work` or `hold` pose, elbows bent, hands out. If the hands hold something, that object has its own colour.
- `tree`, `bush`, `fringe`, `fence`, `lamp`. `lamp` is a post, a paper box and a cap. Pass `shade: 'lantern'` or `'paper'`. Never a glow.
- `rotor(P, parent, { y, z, face, len })` four equal sails. Yaw the parent so local `+Z` points toward the camera (about `0.7` at azimuth 45). The cap front is a disk in that plane: a cylinder with `rotation.x` of `π/2`, centred on the same `y`, radius larger than the sails. `face` is that disk's front along `Z`. `z` sits just past it, and `x` stays `0`, so the hub is on the axis. The cloth reaches about `0.9 * len` from the hub, so `len` stays inside the disk or a blade leaves the cap and crosses the roof. Spin `rotation.z` only.
- `sway(P, node, base, t, amp, phase)` for plants. `carry(q)` for a lift that rests at both ends of the loop.

Every hot group has a `.name`. `parts.hot` lists them. The `hint` says what to hover and names the tap target with the words `tap the <name>`.

## 5. Motion and the tap

Pose from `c.t` and `c.q` only. A loop closes: `Math.sin(q * TAU)`, a full turn `q * TAU`, or `(q + phase) % 1`. Do not add speed each frame.

`c.active === root` is the toggled state. The still frame starts with `active` clear, so the first state is the one you want at `still`. The second state must change the picture by more than a few pixels at `still + 0.5` seconds: a hidden beam, a swapped screen, a forge mouth, a pose. A joint that moves a couple of pixels will not read and will fail the press check.

Reduced motion and `?still` hold the clock. Do not start your own timer.

## 6. Check, then look

From `skills/diorama-dither`:

1. `node scripts/validate.mjs examples/<name>.js`
2. `node scripts/look.mjs examples/<name>.js <outdir>`
3. Open the still, one moving frame, the hover, the press, the mobile shot and the figure zooms.

The look checks fill, the loop seam, picking, hover, the tap, reduced motion, a hidden tab, off-screen pause, and a median frame at or under `83.3` ms, including CPU throttle 4. A pass is not a picture. Judge the still yourself: the action, the materials, the shadow, and whether the front of the structure is still readable.

`node scripts/record.mjs examples/<name>.js <outdir>` writes a silent loop.

`node scripts/sync-dither-kit.mjs --check` must pass after every helper change. Re-hash the three pixel scenes (`pier`, `flower-stall`, `allotment`) at their still frame if the pixel kernel was touched. If it was not, those hashes stay put because a pixel page never loads this finish.

## Before the first render

Walk this list. Each line is a failure that already shipped once:

- A rotor whose hub is beside the shaft, or a blade that crosses the tile edge. Hub on the cap axis, the whole cross inside the front disk.
- A sail, cart, bush, lamp or gate post crossing the person. People stand on open ground, at least `0.8` inside the near wall. The coping is closer to the camera than the path and it covers anyone standing in the opening.
- A shadow that is a flat grey bar, or that runs through the right-hand wall. Hard veil, one sun, lit ground beyond. Do not add a second light for a lamp, a ray or dusk.
- A figure under about 14 pixels, or one colour, so the pose does not read. Scale `h` with the camera so the figure stays near 16 pixels. Two or three colours, forearms out.
- A yard that leaves a wide white band above the roof. Lower `height` until the mass nearly touches the top. Stop before the roof is cut.
- A lamp or a beam with `glow`, or one thick box that reads as a bar. A ray is several segments, thinner toward the tip, one of them a darker dithered tone. Paper and ember stay flat.
- A tap whose only change is one joint. Hide or swap a mass the size of a door, a screen or a ray.
- A dusk or a lamp that tries to move the sun. The light is fixed when the page is built. Swap faces, hide a hard box, or show a hard disk. Never a halo.

## References

- `references/yard.md`: sizes, the yard recipe, rotor numbers, and the shadow and figure checks in one place.
- `skills/diorama-pixel/references/scene-api.md`: primitives, the tick context, the pointer. Read that for `P.box` and `P.pose`. Do not copy its soft shadow or its 320 x 240 frame into a dither scene.
