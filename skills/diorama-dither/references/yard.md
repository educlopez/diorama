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

The axle is the parent group's local `+Z`. Yaw the parent toward the camera, about `0.74` when the camera azimuth is 45, so the cap face is the face we see.

The cap front is a cylinder turned on its side (`rotation.x = π/2`) so the round end faces `+Z`. Centre it on the hub's `y`. Its radius is the limit of the sails. A cone behind that disk, smaller than the disk, stays hidden. A cone that sticks past the disk puts the upper blade across the tiles.

`Dither.rotor(P, parent, { y, z, face, len })`:

- `y` is the centre of the cap face, not a point on the shaft.
- The disk's `z` has to clear the tower radius. A face at `z` `0.3` sits inside a shaft of radius `0.8`, and the lower blade paints the stone. Put the face near `z` `0.95` and the hub just past it (`face` `1.02`, `z` `1.12`). The hub's `x` stays `0`.
- The cloth reaches about `0.9 * len` from the hub. Keep that inside the disk radius. On a face of radius `0.88`, `len` `0.68` leaves a tile rim and the canvas still reads.
- The four spars are the same boxes, turned by `i * π/2`. Do not scale one of them.
- Spin `sails.rotation.z = q * TAU`. Braking stores `P.phase(pressedAt, duration)`.

## Rays, houses, animals

A lighthouse ray is a run of boxes in one group, each shorter in width than the last, from about `0.08` at the lamp to under `0.02` at the tip. Alternate a solid `ray` and a darker dithered tone so the length breaks into steps. `scale.z` follows `1 + sin(q * TAU) * a small amount`, and the inner end stays put, so the length breathes and the loop matches. Hide the group when the lamp is off. No glow, and no wedge of light.

A tea house needs two paper walls on the faces the camera sees, with an ink lattice, a floor of separate planks, and a soffit wider than the walls. One screen at the back of an open shed disappears under the roof. Carp swim an oval in the near water, clear of the bridge deck for the whole loop, including the still.

A mule is a body, a neck tilted toward the head, a head and a muzzle, two ears, a mane, a tail, and four legs set wider than the body so they do not stack into one post. Yaw it so the side and a little of the front both show. Sparks are boxes around `0.07` to `0.11`, half of them a pale hard tone and half ember, visible only while a wrapped phase is under about `0.18`. They fly out and die inside that window.

Smoke is three or four boxes on a loop `(q + i / n) % 1`, rising from the stack and back.

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

- **Windmill rotor.** A hub set to the side of the shaft, or an axle yawed toward the side of the frame, draws the sails edge-on. A long blade in front of a cone still crosses the roof edge. The cross has to sit inside a round face turned toward the camera, hub on the axis, every blade the same length. The downward blade may meet the top of the shaft. It must not leave the cap or paint the door.
- **Windmill people.** The near wall and the gate post cover anyone standing on the path by the opening, even when their feet are inside the yard. The open grass left of the tower, and the path in front of the plinth but short of the gate, are the spots that stay whole. A lamp post in that path does the same thing.
- **Windmill shadow.** With the sails inside the cap face, a high sun (`elevation` near 58) leaves a thin run that merges with the right-hand wall. `Dither.sun(45, 38, 16)` throws one grass silhouette to the right of the tower, short of the wall, and it still changes shape as the cross turns. The cap face has to sit in front of the shaft (`z` past the tower radius) or the lower blade paints the stone and the shadow test sees the wall instead.
- **Lighthouse.** A single box the same thickness for its whole length reads as a bar, even when it is thin. Segments that narrow, with a dithered tone on the alternate ones, read as a ray. The keeper stood behind the parapet in an earlier pass, and the crests were dark dashes. Pale foam boxes read as waves. The cast on the sea is a dark blue strip, not a column of grass, so a grass-shaped test counts it as nothing.
- **Tea house.** A roof on four posts is a shed. Two shoji walls toward the camera, a plank floor and an eave make the house. One carp was under the bridge at the still frame when the oval crossed the deck. Keep both fish in the near water. The host stood behind the near lantern in an earlier pass. The dusk sun sat high in the empty page. The light direction is fixed when the page is built, so dusk is a swap of the paper, the lantern cores and one hard disk near the roof. It is not a new sun.
- **Forge.** A mule built as one bar with a lump for a head does not read. Neck, muzzle, ears and legs wider than the body do. Sparks of a single pixel at the anvil disappear. A short burst of larger pale and ember pixels does not. The fence crossed the smith in an earlier pass. The grass shadow is a narrow run at the right, real, and thinner than the mill's.

A phone tap lands on the first pixel the search finds, which is often the hat. Aim the tap at the middle of the figure or the touch misses and the picture does not change.

## Framing

`camera.height` moves the picture up and down. `camera.scale` changes the size. A tall `height` leaves white above the roof. Lower it until the roof is close to the top of the 280-pixel frame, and leave a few pixels so the ridge is not cut. These landed there: windmill `height` `1.62`, `scale` `56`; lighthouse `1.22` and `60`; tea house `0.22` and `62`; forge `1.62` and `56`. A mass that still touches the top after that is too tall for the frame. Shorten it. Do not push `height` until the ground is cut. The sun stays the one from `Dither.sun`. A closer frame does not get a new light.

## Frame budget

360 x 280 at 12 fps allows `83.3` ms a frame, including a four-times CPU throttle. Stay near the windmill's mass: cylinders at 6 to 8 sides, one tree, a handful of people. A second copy of a whole building will miss the budget. Toggle materials by hiding a few faces, not by building the scene twice.
