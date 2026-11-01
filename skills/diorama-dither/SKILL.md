---
name: diorama-dither
description: 'Build a dithered isometric miniature on the pixel kernel with hard shadows, natural materials and a yard that fills the frame. Use it for a pixel diorama with ordered dither, a translucent ground shadow, and a tap that toggles one state. The pixel skill stays on its three default scenes; this one adds the dither finish and its examples.'
compatibility: Needs Node.js 20+ and Chrome or Chromium for the look. Do not edit the pixel kernel.
---

# Dither diorama

You are making one small place, drawn at 360 x 280 and enlarged with nearest-neighbour pixels. Surfaces use five close tones and a 4 x 4 ordered dither. The sun throws a hard shadow that darkens the ground's own colour. One or two people do one looping action. A tap toggles one state. There is no score, no audio, and no halo around a light.

The pixel kernel (`skills/diorama-pixel/kit/pixel.js`) is fixed. A change there shifts the three pixel scenes. Put new helpers in `kit-src/finish.js`, then run `node scripts/sync-dither-kit.mjs` from the repo root. Never set `glow` on a material: it forces a face up to a flat brightness and reads as a bloom. A lamp is a paper box. A beam is a thin box of hard pixels.

Write the scene as `skills/diorama-dither/examples/<name>.js`. One `Pixel.scene({ ... })`. `means` is one sentence, at most 140 characters. The scene file stays at or under 260 lines, and the built page at or under 70 KB. Both limits live in `scripts/validate.mjs`.

## 1. Decide the picture before the code

Write four lines, then stop and check them against the rules below:

- **Ground.** A yard or a shore that fills the frame. Name the zones (meadow, earth, rock, sand, water).
- **Mass.** The one structure, where its front faces, and what must stay visible in front of it (a door, a course of stone, a person).
- **People.** Who, in the open, facing the work. Standing height is `h × cos(elevation) × scale` pixels. Two or three cloth colours.
- **Life.** What loops, and the one thing a tap toggles. The loop is a function of `q` that matches at `0` and `1`.

If a person, a door or the front of the structure would sit behind a post, a wheel, a sail or a roof, move the person or the occluder now. The camera does not move.

## 2. Frame

- `width: 360, height: 280`, `fps: 12`, `duration: 8`, `still: 2`, `bayer: 4`, `shadow: 'hard'`, `rim: true`, `wind: 8`.
- Camera `{ az: 45, el: 30, scale: 54 to 62 }`. `height` recenters and does not zoom, and it is not the summit. The fit reserves the yard edge. Start near `0.6` times the tallest point and correct from the still. A band of white above the mass means it is still too high. Too low and the roof is cut.
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
| Snow | `snow` | Light blue-white ground, sand grain. `Dither.report` on `#d5e6ee` must pass |
| Lamp, ember, ray | `lantern`, `ember`, `ray` | Solid faces. `ray` has dither `0`. A second, darker dithered tone on alternate segments keeps a ray from reading as one bar |

`Dither.report(hex)` must come back with five tones, a max gap of `0.08` or less, a cool dark step and a warm light step. Do not hand-build a ramp unless a preset cannot say the hue.

## 4. Build from helpers

These live on `Dither` and do not run for a pixel scene:

- `wall(P, x, z, len, yaw, opt)` stone run plus a wider coping. `gate(P, x, z, yaw, opt)` for the opening. `opt.h` defaults to `0.66`. A yard is four runs and one gate, inside `rx` and `rz`.
- `folk(P, x, z, { h, yaw, name, shirt, pants, sleeve, hat })` a person the pointer can name. Standing pixels are `h × cos(elevation) × scale`. At elevation 30 and scale 58, `h` 0.4 is about 20. A pitched pose measures a little shorter. The yards use `h` 0.38 to 0.44 at scale 56 to 62. Shirt, pants and sleeve are the three colours. After `P.pose`, set the arms so the forearms leave the torso: a `work` or `hold` pose, elbows bent, hands out. If the hands hold something, that object has its own colour.
- `tree`, `bush`, `fringe`, `fence`, `lamp`. `lamp` is a post, a paper box and a cap. Pass `shade: 'lantern'` or `'paper'`. Never a glow.
- `cap(P, tower, { y, r, over, h })` an upright cone. `y` is the tower top, `r` is that top's radius, `over` is the overhang (about `0.1`), `h` is the slope. A cylinder with `rotation.x` of `π/2` is a lid seen from above. Do not use one for a roof.
- `rotor(P, parent, { y, z, face, len, tilt })` four equal sails on a shaft. Yaw the parent so local `+Z` points toward the camera (about `0.74` at azimuth 45). `y` and `z` are the hub on that front face. `face` is back inside the cone, so the neck meets the cap. `tilt` (about `0.3`) is `rotation.x`: the shaft drops toward the camera. The cloth stays in front of the stone. Spin `rotation.z` only. A cross drawn on the roof is the shaft left at `tilt` `0`.
- `sway(P, node, base, t, amp, phase)` for plants. `carry(q)` for a lift that rests at both ends of the loop.
- `seat(node, name, on, join)` and `afloat(node, name, reason)`. Every solid mesh declares one, or sits inside a group that does and actually meets it. See Support.

Every hot group has a `.name`. `parts.hot` lists them. The `hint` says what to hover and names the tap target with the words `tap the <name>`.

## Support

A piece either meets a surface or names why it does not. `npm run support` and the look both check the still and the frames at a quarter, a half, three quarters and the end of the loop, and exit 1 with the group's name. A mesh with no support fails as `has no support`. A mesh inside a seated group fails when the nearest mesh is more than one voxel away and the mesh's own bottom is above the ground. Sitting inside the group's box is not enough. A bottom within one voxel of the ground can pass, which is how a tuft or a crest stays. Two meshes that only meet each other still pass. An unnamed mesh is reported as its parent's name plus its child index.

- `Dither.seat(node, name)` rests on the ground. The bottom face is within one voxel of `y = 0` (`P.px`). Sitting slightly in the ground passes. Floating above it fails. `folk`, `wall`, `gate`, `fence`, `lamp`, `tree`, `bush` and `fringe` already do this.
- `Dither.seat(node, name, otherNode)` — the two solids meet within one voxel. A bed on an axle, a sail on the cap, a leg into the body, a screen on the floor, a shade on its post.
- The fourth argument is a second solid. A wheel uses both: `Dither.seat(wheel, 'cart-wheel', 'ground', axle)`. If the wheel already fails the ground, the axle line is not repeated.
- `Dither.seat(node, name, 'water')` — the water plane cuts the body (hull, fish). The bottom stays under `y = 0` at the highest point of a bob.
- `Dither.seat(node, name, 'surface')` — foam whose bottom sits on the water, in a water zone.
- `Dither.afloat(node, name, reason)` is the only leave-the-ground. The reason is a non-empty string: a carried sack, a ray, a spark, smoke, an hour mark. A blank reason fails as `floats without a reason`.

A figure whose body passes through a solid that is not the ground fails as `stands inside`. To stand on a plinth, raise the root to the top face and call `Dither.seat(root, name, plinth)` again.

A figure on the ground must not stand in a water zone. Feet are the figure's `x` and `z`. The kernel's `place` turns a missing or `NaN` coordinate into `0`, so `Dither.folk` checks `x` and `z` before that call and the support check reads the requested pair. A non-finite foot fails as `has no place to stand`. It does not stand at the origin and pass. Feet go on meadow, earth, sand, snow, rock, a pier deck, or inside a boat. Never on open water. A wheel is a cylinder with `rotation.x` of `π/2` and 10 sides, so a vertex sits at the bottom. Its centre `y` equals the radius, the axle passes through that hub, and the bed sits on the axle.

Checklist before the first render:

- Every solid mesh has `seat` or `afloat`, or sits in a group that does and meets the nearest mesh. A child parked in the air still fails when that mesh is more than one voxel away, even inside the group's box. A bottom within one voxel of the ground can pass.
- Wheels, legs and feet touch. The axle touches the box. Hooves and shoes touch a solid surface.
- A boat's hull is partly under the water. A bridge's piles stand on the banks. Posts reach the ground.
- Nothing floats unless `afloat` names the reason. The check covers a mesh with declared support, or a group that meets the nearest mesh. It does not cover a chain of loose pieces that only touch each other.

## 5. Motion and the tap

Pose from `c.t` and `c.q` only. A loop closes: `Math.sin(q * TAU)`, a full turn `q * TAU`, or `(q + phase) % 1`. Do not add speed each frame.

`c.active === root` is the toggled state. The still frame starts with `active` clear, so the first state is the one you want at `still`. The second state must change the picture by more than a few pixels at `still + 0.5` seconds: a hidden beam, a swapped screen, a forge mouth, a pose. A joint that moves a couple of pixels will not read and will fail the press check.

Reduced motion and `?still` hold the clock. Do not start your own timer.

## 6. Check, then look

From `skills/diorama-dither`:

1. `node scripts/validate.mjs examples/<name>.js`
2. `npm run support` audits every file in `examples/`. One scene: `node scripts/support.mjs examples/<name>.js`. Then a lifted `cart-wheel`, a box at `y = 4.5` inside the mill, and a figure standing in the tower. Each must fail. The line is `ok negative` and the reason. It does not print `FAIL` for a miss that was required. Then the water cases. A host in the tea pond must fail. A figure in the lighthouse's open water must fail. A figure on the lighthouse rock must pass. A bad foot coordinate must fail. `folk(NaN)` and `folk(undefined)` must fail. A mesh with no support must fail. A blank float reason must fail. The same run checks the snow report, the gate height and the cold family.
3. `node scripts/look.mjs examples/<name>.js <outdir>` — the look runs the same support check on those frames. `shadow` must be `hard`. `soft` or `none` fails. A grass silhouette takes the strong cast check. A hard cast on earth, water, or a cold ground takes the sharp threshold. The scene name does not choose it.
4. Open the still, one moving frame, the hover, the press, the mobile shot and the figure zooms. Look at the wheels, the feet and anything that should meet a neighbour.

The look checks fill, the loop seam, picking, hover, the tap, reduced motion, a hidden tab, off-screen pause, and a median frame at or under `83.3` ms, including CPU throttle 4. A pass is not a picture. Judge the still yourself: the action, the materials, the shadow, and whether the front of the structure is still readable.

`node scripts/record.mjs examples/<name>.js <outdir>` writes a silent loop.

`node scripts/sync-dither-kit.mjs --check` must pass after every helper change. Re-hash the three pixel scenes (`pier`, `flower-stall`, `allotment`) at their still frame if the pixel kernel was touched. If it was not, those hashes stay put because a pixel page never loads this finish.

## Before the first render

Walk this list. Each line is a failure that already shipped once:

- A rotor drawn on the roof, or a flat disk wider than the tower. The cap is a cone with a small overhang and a visible slope. The shaft and the four sails sit on the front face, tilted down toward the camera, and a person stands on the ground at the door with the sack in the hand.
- A wheel, a hoof, a foot or a post with daylight under it. The axle meets the box. A person stands on ground, rock, a pier or in a boat, never on open water. A hull sits in the water, not on it. Anything else that leaves the ground has `afloat` and a reason.
- A sail, cart, bush, lamp or gate post crossing the person. With a step in the yard, feet go on meadow or earth, at least `1.2` inside the near wall and `0.4` clear of a step or a slab. The coping covers anyone standing in the opening.
- A shadow that is a flat grey bar, or that runs through the right-hand wall. Hard veil, one sun, lit ground beyond. Do not add a second light for a lamp, a ray or dusk.
- A standing figure under about 16 pixels (`h × cos(elevation) × scale`), or one colour, so the pose does not read. The yards land near 20. Two or three colours, forearms out.
- A yard that leaves a wide white band above the roof. `height` is not the summit: start near `0.6` times the tallest point and correct from the still.
- A lamp or a beam with `glow`, or one thick box that reads as a bar. A ray is several segments, thinner toward the tip, one of them a darker dithered tone. Paper and ember stay flat.
- A tap whose only change is one joint. Hide or swap a mass the size of a door, a screen or a ray.
- A dusk or a lamp that tries to move the sun. The light is fixed when the page is built. Swap faces, hide a hard box, or show a hard disk. Never a halo.

## References

- `references/yard.md`: sizes, the yard recipe, rotor numbers, and the shadow and figure checks in one place.
- `skills/diorama-pixel/references/scene-api.md`: primitives, the tick context, the pointer. Read that for `P.box` and `P.pose`. Do not copy its soft shadow or its 320 x 240 frame into a dither scene.
