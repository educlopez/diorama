# Yard, materials, figures, rotors

Numbers for a 360 x 280 dither scene at camera azimuth 45, elevation 30, scale 48. Change scale and these sizes together: a person at scale 52 needs a slightly smaller `h` if you still want 16 pixels.

## Yard

Rectangular ground: `rx: 3.5`, `rz: 2.65`, `wobble: 0.36`, `fade: 0.32`, `rect: true`.

Walls sit inside that rectangle, about `0.6` short of the edge so the coping does not clip the fade.

```js
var ix = 2.75, iz = 2.05;
Dither.wall(P, 0, -iz, ix * 2, 0);
Dither.wall(P, -ix, 0, iz * 2, Math.PI / 2);
Dither.wall(P, ix, 0, iz * 2, Math.PI / 2);
Dither.wall(P, -1.35, iz, 2.8, 0);
Dither.wall(P, 1.92, iz, 1.65, 0);
Dither.gate(P, .55, iz, 0);
```

`Dither.wall` is a stone box plus a timber coping `0.08` wider and `0.07` thick. Pass `{ stone, cap, h, d }` for a rock parapet. The gate is two posts and a lintel, `1.06` wide, so the opening reads.

One earth zone for the path. Grass fringe with `Dither.fringe` at three or four spots on the rim. One tree and two bushes, off the people. A fence is posts and two rails, four posts unless the run is longer. A lamp is a post and a paper box.

## Materials

Stone courses, tile courses, wood grain and grass grain come from the preset textures. Do not replace them with a flat colour on a large face.

The hard shadow does not swap in a grey. It darkens the ground pixel that is already there, a little cooler, and leaves the dither. That only reads if the lit ground and the cast ground are the same zone. Put the shadow on meadow, earth, sand or water, not across a texture change.

Water already carries moving highlights. Add two to four short crest boxes if the sea needs a readable wave. A pond is the `pond` preset inside an ellipse in `zone`.

## Figures

`Dither.folk(P, x, z, { h: .46, yaw, name, shirt, pants, sleeve })`.

At scale 48, `h` `0.44` is about 14 pixels and `h` `0.48` is about 16, including the hat. Below `0.4` the face and the forearms merge. Above `0.55` the person outgrows the yard.

Three colours: shirt, pants, sleeve. Hat and hair may repeat pants. Skin stays the default. The name is the read-out.

Pose after `P.pose(person, 'work')` or `'hold'`:

- body pitched toward the work (`rotation.x` around `0.3` to `1.1`)
- elbows bent so the forearms are not inside the torso
- an object in the hand (sack, hammer, oar) in a fourth colour

Two people need open ground between them. A cart wheel, a bush or a sail across a torso hides the action even when the pixels are technically in front.

## Rotors

The shaft is the parent group's local `+Z`. Yaw the parent toward the camera, about `0.74` when the camera azimuth is 45, so the cap's front is the face we see. A sail wants that face. A tube does not: local `+Z` toward the camera shows the end, and the tube reads as a point. Yaw a tube about `0.9` to `1.2` radians off `0.74` so the length shows. If an opening has to read, lift one hatch. Two boxes split on local `X` close into a wall.

`Dither.cap(P, tower, { y, r, over, h })` is an upright cone. `y` is the top of the tower, `r` is that top's radius, `over` is about `0.1`, and `h` is long enough that the slope reads. A thin beam ring marks the eave. A cylinder with `rotation.x` of `π/2` is a lid seen from above, wider than the tower and with no slope. That is not a cap.

`Dither.rotor(P, parent, { y, z, face, len, tilt })`:

- `y` and `z` place the hub on the front of the cone, on the axis (`x` stays `0`). `face` is further back, inside the cone, so the neck meets the cap.
- `tilt` is `rotation.x`, about `0.3`. Positive tilt drops the outer end of the shaft toward the camera. The lower sail stays in front of the stone. A tilt of `0` lays the cross on the roof.
- On this mill the tower runs from radius `0.62` at the plinth to `0.40` at the top. The cone overhangs by `0.10` and is `0.46` tall. The hub is `y` about `1.84`, `z` `0.78`, `face` `0`, `len` `0.72`, `tilt` `0.32`. The neck runs back into the cone.
- The four spars are the same boxes, turned by `i * π/2`. Do not scale one of them. The cloth sits on the spar, in front of the hub.
- Spin `sails.rotation.z = q * TAU`. Braking stores `P.phase(pressedAt, duration)`. Do not write `rotation.x` again in the tick or the shaft stands up.
- A person stands on the ground at the door, or in the doorway. The sack is in the hand. A sack on a world arc at the still frame hangs on the wall.

A dome is `P.ball`, centred on the top of the drum, with a radius about `0.7` of the drum's top radius. The equator then sits inside the lip. A ball the full radius of the drum leaves the equator proud of the cap.

`lantern` seen face-on reads as a light even when glow is off. Brass on a fitting is a thin ring, the thin axis toward the camera, not a face.

## Rays, houses, animals

A lighthouse ray is a run of boxes in one group, each shorter in width than the last, from about `0.08` at the lamp to under `0.02` at the tip. Alternate a solid `ray` and a darker dithered tone so the length breaks into steps. `scale.z` follows `1 + sin(q * TAU) * a small amount`, and the inner end stays put, so the length breathes and the loop matches. Hide the group when the lamp is off. No glow, and no wedge of light.

A tea house needs two paper walls on the faces the camera sees, with an ink lattice, a floor of separate planks, and a soffit wider than the walls. One screen at the back of an open shed disappears under the roof. Carp swim an oval in the near water, clear of the bridge deck for the whole loop, including the still.

A mule is a body, a neck tilted toward the head, a head and a muzzle, two ears, a mane, a tail, and four legs. The body is deep enough to meet the legs. Each hoof sits on the ground and meets its leg. Yaw it so the side and a little of the front both show. Sparks are boxes around `0.07` to `0.11`, half of them a pale hard tone and half ember, visible only while a wrapped phase is under about `0.18`. They fly out and die inside that window.

Smoke is three or four boxes on a loop `(q + i / n) % 1`, rising from the stack and back.

## Support

Every solid mesh sets `support` through `Dither.seat` or `Dither.afloat`, or sits inside a group that does and meets the nearest mesh. A mesh with neither fails. A child whose bottom is above the ground fails when the nearest mesh, not the group's box, is more than one voxel away. A bottom within one voxel of the ground can pass. Two meshes that only meet each other still pass. The check allows one voxel (`P.px`, `1 / camera.scale`). An unnamed mesh is named from its parent and its child index.

```js
Dither.seat(plinth, 'plinth');
Dither.seat(tower, 'tower', plinth);
Dither.seat(wheel, 'cart-wheel', 'ground', axle);
Dither.seat(hull, 'boat', 'water');
Dither.seat(crest, 'crest', 'surface');
Dither.afloat(sack, 'sack', 'carried');
```

- `seat(node, name)` — bottom on the ground. A figure here must not fall in a water zone. `folk` rejects a non-finite `x` or `z` before the kernel turns it into `0`.
- `seat(node, name, other)` — the two bounds meet. Pass an axle, a cap, a floor, a post.
- `seat(node, name, 'ground', other)` — on the ground and against that solid. Wheels.
- `seat(node, name, 'water')` — the plane cuts the body. A hull stays cut even when the bob is at its highest.
- `seat(node, name, 'surface')` — bottom on the water, and the spot is water.
- `afloat(node, name, reason)` — the only float. A blank reason fails as `floats without a reason`.

`folk` seats the person. Helpers for walls, gates, fences, lamps, trees, bushes and grass seat themselves. A lamp shade sits on the post. The cap sits on the shade.

Wheels use 10 sides and `rotation.x = π/2`, with the centre at `y = radius`, so one vertex is on `y = 0`. The axle runs through the hub and the bed sits on the axle. Feet and hooves meet a solid: meadow, earth, sand, rock, a deck, or the floor of a boat. A bridge's piles stand on the banks, not in the pond. Posts reach `y = 0`.

Checklist:

- Every solid mesh declares `seat` or `afloat`, or sits in a group that does and meets the nearest mesh. A child inside the box but clear of every mesh still fails.
- Wheels, legs and feet contact. The axle contacts the box.
- The hull is partly under the water. Foam sits on the surface.
- Nothing floats without a named reason.

`npm run support` audits every `examples/*.js` at `t = 2, 4, 6` and `8`, then `--negative` and `--water`. One scene is `node scripts/support.mjs examples/<name>.js`. A real miss exits 1 and names the group. An expected miss prints `ok negative` or `ok water` with the reason, and does not print `FAIL`. `--negative` lifts one `cart-wheel` by `0.25` and must fail once on that name, without a second axle line. It also parks an undeclared box named `childfloat` at `y = 4.5` inside the mill, and that must fail as floating apart from the nearest mesh. An unnamed box in the same place must fail as `mill child` apart from that mesh. A figure stood in the tower must fail as `stands inside`. A figure against a seated step must fail as `stands against`, and one inside `1.2` of the near wall must fail as `stands in the opening`. A figure on sand, once a step is seated, must fail as `stands off the path`. `--water` plants a host in the tea pond and a figure in the lighthouse's open water, and both must fail as `stands on water`. A figure on the lighthouse rock must pass. A mesh vertex of `NaN` must fail as `has no place to stand`. `folk(NaN)` and `folk(undefined)` must fail the same way: the kernel would have placed them at `0`, and the helper does not let that pass. A mesh with no support must fail, and a blank float reason must fail as `floats without a reason`. The look runs the same frames. `shadow: 'soft'` or `none` fails. A declared hard cast that reads as a grass silhouette takes that check, including the change of shape. A hard cast on earth or water has to clear the sharp threshold. The scene name is not what chooses it.

A figure fails as `stands inside` when the centre of the body, or a point just above the feet, lies inside another mesh. A shared face does not count. Carried pieces are `afloat` and are not the body and not the solid. The `1.2` and `0.4` rules run only when some support name starts with `step`. The four yards have no step, and the miller stands closer than `1.2` to the near wall, so those yards are not moved to satisfy a rule they do not use. To stand on a plinth, raise the root to the top face and call `Dither.seat(root, name, plinth)` again. A root left on the ground, with the shins in the plinth, fails as `stands inside`.

## Shadow check

`Dither.sun(45, elevation, turn)` aims the light so the cast falls to screen-right of the usual camera. A readable cast:

- starts at the object and stops before the right edge and before a yard wall
- is wider than a post and narrower than half the frame
- keeps the grass or water texture, so a dark dither speckle is not the whole shadow
- changes shape when something large turns (sails). A still tower does not need a moving shadow

## Tap

`hint` contains `tap the <name>`. `parts.hot[i].name` starts with that name.

The toggled state is `c.active === thatRoot`. At `still + 0.5` seconds the two states must differ by a mass you can see at a glance: the ray, the dusk screens and lantern cores, the forge mouth and the hammer. Set `c.read` to a short status. Hover still shows the group's name, which is what the pointer check expects.

## What the first picture got wrong

These are the misses from the first render of each place, after the yard rules above were already written. A later pass fixed the picture. The check did not catch all of them.

- **Windmill rotor.** A flat disk wider than the tower, turned face-on, reads as a lid, and the sails drawn in that plane read as a cross on the roof. The cap is a cone with a small overhang and a slope. The hub is on the front, the shaft points at the camera and down a little, and the four blades are the same length. The lower blade stays in front of the stone. It must not paint the door. A hub set to the side of the shaft draws the sails edge-on.
- **Windmill people.** The near wall and the gate post cover anyone standing on the path by the opening, even when their feet are inside the yard. The open grass in front of the door, short of the gate, is the spot that stays whole. A sack carried on a world arc sits on the wall at the still. Put it in the hand. A cart tucked behind the tower shows one wheel. Both wheels sit on the ground, in front of the door or beside the path, and the box sits on the axle.
- **Windmill shadow.** A high sun (`elevation` near 58) leaves a thin run that merges with the right-hand wall. `Dither.sun(45, 38, 16)` throws one grass silhouette to the right of the tower, short of the wall, and it still changes shape as the cross turns. The cone's base meets the tower top. If the lower blade is buried in the taper, it paints the stone and the shadow test sees the wall.
- **Lighthouse.** A single box the same thickness for its whole length reads as a bar, even when it is thin. Segments that narrow, with a dithered tone on the alternate ones, read as a ray. The keeper stood behind the parapet in an earlier pass, and the crests were dark dashes. Pale foam boxes read as waves. The cast on the sea is a dark blue strip, not a column of grass, so a grass-shaped test counts it as nothing.
- **Tea house.** A roof on four posts is a shed. Two shoji walls toward the camera, a plank floor and an eave make the house. One carp was under the bridge at the still frame when the oval crossed the deck. Keep both fish in the near water. The host stood behind the near lantern in an earlier pass. The dusk sun sat high in the empty page. The light direction is fixed when the page is built, so dusk is a swap of the paper, the lantern cores and one hard disk near the roof. It is not a new sun.
- **Forge.** A mule built as one bar with a lump for a head does not read. Neck, muzzle, ears and legs wider than the body do. Sparks of a single pixel at the anvil disappear. A short burst of larger pale and ember pixels does not. The fence crossed the smith in an earlier pass. The grass shadow is a narrow run at the right, real, and thinner than the mill's.

A phone tap lands on the first pixel the search finds, which is often the hat. Aim the tap at the middle of the figure or the touch misses and the picture does not change.

## Framing

`camera.height` moves the picture up and down. `camera.scale` changes the size. `height` is not the summit. The fit reserves the yard edge, so a height set to the roof crops the near wall or leaves the mass low. Start near `0.6` times the tallest point and correct from the still. A tall `height` leaves white above the roof. These landed there: windmill `height` `1.08`, `scale` `56`; lighthouse `1.22` and `60`; tea house `0.22` and `62`; forge `1.62` and `56`. A mass that still touches the top after that is too tall for the frame. Shorten it. Do not push `height` until the ground is cut. The sun stays the one from `Dither.sun`. A closer frame does not get a new light.

## Frame budget

360 x 280 at 12 fps allows `83.3` ms a frame, including a four-times CPU throttle. Stay near the windmill's mass: cylinders at 6 to 8 sides, one tree, a handful of people. A second copy of a whole building will miss the budget. Toggle materials by hiding a few faces, not by building the scene twice.
