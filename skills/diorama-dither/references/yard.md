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

## Rotors and other spinning parts

The axle is the parent group's local `+Z`. Yaw the parent so that axis points out of the front of the cap, not along the wall.

`Dither.rotor(P, parent, { y, z, face, len })`:

- `y` on the cap. For a tower whose shaft ends near `2.35` and whose cone is centred near `2.86`, use `y` `2.6` to `2.75`.
- `face` is the cap radius at that height.
- `z` is `face + 0.4` or more. The helper draws the neck. A hub with `z` near the shaft radius leaves a blade on the stone.
- `len` `0.85` to `1.0`. The downward tip is `y - len`. Keep that tip in the upper third of the shaft so the door and the lower courses stay clear. The disk still reads because it sits in front of the cap, not because it is huge.
- Spin `sails.rotation.z = q * TAU`. Braking stores `P.phase(pressedAt, duration)`.

A lighthouse ray is not a rotor. It is a box about `0.11` by `0.1` by `3`, material `ray`, in a group whose `rotation.y` is `base + q * TAU`. Hide the group when the lamp is off. Do not scale it up into a wedge of light.

Smoke is three or four boxes on a loop `(q + i / n) % 1`, rising from the stack and back. Sparks are boxes of size `0.04`, visible only near the hit. Both match at the loop seam because the phase wraps.

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

- **Windmill rotor.** A hub set to the side of the shaft, or an axle yawed toward the side of the frame, draws the sails edge-on. The tower stays clear and the picture still looks wrong: the cross has no face. Yaw the cap so the axle comes toward the camera by about 50 degrees, with the hub on the axis and `z` past the cone. The downward blade may cross the eave. It must not paint the door.
- **Windmill people.** The near wall and the gate post cover anyone standing on the path by the opening, even when their feet are inside the yard. The open grass left of the tower, and the path in front of the plinth but short of the gate, are the spots that stay whole. A lamp post in that path does the same thing.
- **Windmill shadow.** A low sun makes the sail shadow thrash and the grass run breaks. The higher sun (`elevation` near 58, `turn` near 18) keeps one silhouette to the right of the tower and still changes it as the sails turn. A change of about a hundred pixels is the sail. Do not ask for the wide swing the long blades used to throw.
- **Lighthouse.** The first tower, ray, boat and islet were the right picture. The keeper stood behind the parapet, and the crests were dark dashes. Pale foam boxes read as waves. The cast on the sea is a dark blue strip, not a column of grass, so a grass-shaped test counts it as nothing.
- **Tea house.** The host stood behind the near lantern. One carp was under the bridge at the still frame. The dusk sun sat high in the empty page. The light direction is fixed when the page is built, so dusk is a swap of the paper, the lantern cores and one hard disk near the roof. It is not a new sun.
- **Forge.** The mouth, the smoke, the mule and the cart read on the first try. The fence crossed the smith. The grass shadow is a narrow run at the right, real, and thinner than the mill's.

A phone tap lands on the first pixel the search finds, which is often the hat. Aim the tap at the middle of the figure or the touch misses and the picture does not change.

## Frame budget

360 x 280 at 12 fps allows `83.3` ms a frame, including a four-times CPU throttle. Stay near the windmill's mass: cylinders at 6 to 8 sides, one tree, a handful of people. A second copy of a whole building will miss the budget. Toggle materials by hiding a few faces, not by building the scene twice.
