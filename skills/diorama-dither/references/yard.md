# Yard, materials, figures, rotors

Numbers for a 360 x 280 dither scene at camera azimuth 45, elevation 30. A standing figure's pixels are `h × cos(elevation) × scale`. At elevation 30 and scale 58, `h` 0.4 is about 20. A pitched pose's box is a little shorter, about 18 by 19. Change `h` with the scale if you want that height.

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

`Dither.wall` is a stone box plus a timber coping `0.08` wider and `0.07` thick. Pass `{ stone, cap, h, d }` for a rock parapet. The gate is two posts and a lintel, `1.06` wide. `Dither.gate(P, x, z, yaw, { h })` sets the post height. The default `h` is `0.66`, the posts are centred at `h / 2`, and the lintel sits at `h - 0.04`.

One earth zone for the path. Grass fringe with `Dither.fringe` at three or four spots on the rim. One tree and two bushes, off the people. A snow yard has no conifer helper: `Dither.tree` is a leaf canopy, and a pine does not fit in the 70 KB page. A fence is posts and two rails, four posts unless the run is longer. A lamp is a post and a paper box.

## Materials

Stone courses, tile courses, wood grain and grass grain come from the preset textures. Do not replace them with a flat colour on a large face. A narrow pier whose timber grain runs on X reads as a wall. A deck is `Dither.mat('timber', { grain: 'z' })` and a wide plank, about `2.2` wide, `0.1` thick and `1.1` deep.

`snow` is `#d5e6ee`, sand grain, `ground`, rough `0.4`. It is lighter than a blue-grey such as `#7f97a8`. The shared ramp still warms the lightest step. Lit snow reads pale, and the veil cools the cast toward blue.

The hard shadow does not swap in a grey. It darkens the ground pixel that is already there, a little cooler, and leaves the dither. That only reads if the lit ground and the cast ground are the same zone. Put the shadow on meadow, earth, sand, snow, rock or water, not across a texture change.

Water already carries moving highlights. Add two to four short crest boxes if the sea needs a readable wave. A pond is the `pond` preset inside an ellipse in `zone`.

## Figures

`Dither.folk(P, x, z, { h: .46, yaw, name, shirt, pants, sleeve })`.

Standing pixels are `h × cos(elevation) × scale`, because screen-up is `cos(elevation)`. At elevation 30 and scale 58, `h` 0.4 is `0.4 × cos(30°) × 58`, about 20. A pitched work pose's box is a little shorter, about 18 by 19, because the body leans. The four yards use `h` 0.38 to 0.44 at scale 56 to 62, which is about 19 to 21 standing. Below about 16 the face and the forearms merge. Above `0.55` the person outgrows the yard.

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

Smoke from a chimney is three or four boxes on a loop `(q + i / n) % 1`, rising from the stack and back, clear of the roof. Under an awning that column stays hidden. See the stall notes.

## Stall, cart, and night

A stall is four posts, beams seated on the posts, and a cloth roof seated on the front beam. Yaw the group about `0.68` so the opening faces the camera. Posts about `0.09` thick and `0.86` tall. The front beam is about `1.64` by `0.07` by `0.08`, centred at `y = 0.895` and local `z = 0.42`, so the underside is `0.86`. The cord and the lantern use that same `z`. At yaw `0.68` and camera azimuth 45, local `+Z` points toward the camera, and the beam at `z` `0.42` is the near one. The cord meets it: the gap is 0, and one voxel is about `0.017`. The beam at `z` `-0.42` is the back one, and the same cord misses it by about `0.33`. The roof is about `1.78` by `0.05` by `1.08`: thick enough to read, thin enough to be cloth.

Stripes come from the pixel material, through `Dither.mat`:

```js
awning: Dither.mat('sail', { stripe: .18, alt: '#a33b32' })
```

`stripe` is the band width along the grain. On the top face, grain `x` (the sail default) runs the bands across X. `grain: 'z'` runs them the other way. Odd bands use `alt`: a hex, a ramp name, or an array of hexes. `Dither.mat` copies those keys onto the material, and the kernel alternates `ramp` and `alt`. Three short valance boxes, seated on the roof, hang at the front lip. Alternate `sail` and the stripe colour.

A hung lantern is not `Dither.lamp`. That helper is a post on the ground. A cord thinner than one voxel (`P.px`, about `0.017` at scale 60) either misses the raster or leaves a gap wider than a voxel, and support fails. Use a cord at least `0.04` thick. Seat it on the beam, and seat the lantern on the cord, faces touching:

```js
var beam = Dither.seat(P.box(1.64, .07, .08, 'beam', 0, .895, .42, stall), 'beam', post);
var cord = Dither.seat(P.box(.04, .16, .04, 'beam', x, .78, .42, stall), 'cord', beam);
Dither.seat(P.box(.18, .18, .14, 'lantern', x, .61, .42, stall), 'lantern', cord);
```

The cord runs from the beam's underside (`y` about `0.86`) to the lantern's top (`y` about `0.70`). An `ember` box on the camera face, seated on the lantern, is the flame. Toggle it with `.visible`. A lantern seated straight on the beam is a yellow square stuck to the wood. Never set `glow`.

`look` calls the loop's change `motion`. It is the largest step between the frames at a quarter, a half and three quarters, and it has to be over `0.002` of the picture. At 360 by 280 that is more than about 202 pixels. A step of `0.0003` or `0.0011` fails. One core of `0.09` by `0.10` by `0.03` never got there: a travel of `u * 0.8` measured `0.0010`, and turning the core on for a quarter of the loop measured `0.0005`. A core twice that on each side, `0.18` by `0.20` by `0.06`, travelling out by `u * 0.35`, measured `0.0022` and passed. Other motion in the frame can clear `0.002` without the core. The core cannot be the only change unless it is that large.

A pot sits on the counter. Eight sides, body about `0.14` across and `0.16` tall, a wider rim about `0.035` tall seated on the body, a lid seated on the rim. Hide the lid when the pot is open. `iron` is `#5c636c`, a blue-grey. A warmer pot is another hex passed to `Dither.mat`, still a plain face.

Steam under the awning is three boxes, `Dither.afloat(g, 'smoke', 'steam')`, phase `i / 3`. Use `sail`. The `smoke` preset is a grey that disappears on timber. The boxes that cleared the motion check were about `0.28` by `0.14` by `0.22`, then `0.04` narrower and `0.03` shallower. Start each puff at the lip, past the valance (local `z` about `0.56` on the roof above), and carry it further out by `u * 0.35` where `u` is `(q + phase) % 1`. That run, under the awning, measured `0.0021`. In the open, `u * 0.20` measured `0.0018` and failed, and `u * 0.22` measured `0.00202` and passed. A shorter run does not. A sway of `0.03` with `u * 0.12` up and `u * 0.08` out measured `0.0007` under the cloth and `0.0018` in the open. A rise that climbs back into the cloth hides the run: the same `u * 0.35` plus `u * 0.12` of rise measured `0.0017` under the awning and failed. `0.0003` and `0.0011` fail the same check. If the puffs are the only motion, take them out by `u * 0.35` and do not lift them back under the cloth. The chimney recipe above the roof is the other case.

A cart with one axle shows one wheel on this side. The far wheel sits behind the box. Two axles, one near each end, put a near wheel at both ends. Yaw about `0.85` so the long side faces the camera. This is the mill's cart in `examples/windmill.js`:

```js
var r = .16, axle = null;
cart.rotation.y = .85;
Dither.seat(cart, 'cart');
[-.32, .3].forEach(function (x) {
  axle = P.box(.08, .06, .84, 'timber', x, r, 0, cart);
  [-.34, .34].forEach(function (z) {
    var w = P.cyl(r, r, .08, 'iron', x, r, z, cart, 10);
    w.rotation.x = Math.PI / 2;
    Dither.seat(w, 'cart-wheel', 'ground', axle);
  });
});
Dither.seat(P.box(1.02, .08, .52, 'cart', 0, r + .07, 0, cart), 'cart-bed', axle);
```

The wheel centre is the radius, so one vertex of the 10-sided cylinder meets the ground. The bed sits on an axle. The far pair does not stay hidden. On the mill's cart, side boards included, hiding those two wheels removed 53 pixels that show past the box, up by the rail, above the near wheels. The near pair is the one that reads. A third axle does not cover that sliver.

`look` writes `zoom-figure.png` from the first name in `folkZoom` and `zoom-carter.png` from the second. The default is `['miller', 'carter']`, matched to `parts.hot` by exact `.name`, and only when the hover hits that person. A cook named `cook` gets `zoom-cook.png` from the hot-group pass and does not get `zoom-figure.png`. Set `folkZoom: ['cook', 'customer']` on the scene to fill the two fixed files from those groups. A person the hover never hits writes no zoom, including one listed in `folkZoom` who stands behind the stall. `look` still requires `pointer` (every hot group can be picked) and `figures` (a zoom for every hot group), so a hidden hot person fails both.

Night keeps `Dither.sun`. The sun does not move, and `glow` is never set. What reads as evening is dark cloth, the striped awning, `lantern` panels and the `ember` cores you show and hide. The ground and the page stay the day palette. A black sky and a pool of light are outside this finish. The tea house dusk is the same limit: it swaps the paper, the lantern cores and one hard disk. It does not add a light.

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

`folk` seats the person. A standing figure keeps the bind-pose sole about `0.01 × h` under the origin. Pass `on: deck` to put that sole exactly on a mesh: the helper reads the mesh's highest point, including a yawed parent, and seats the figure there. Setting `root.position.y` afterwards replaces it. `hull(P, x, z, { h, y, amp })` is a timber box cut by the water. `h` is the height, `y` the centre (default `0.04 - h / 2`), and `amp` is stored on the group for the tick. `yaw`, `len`, `beam`, `mat` and `name` are optional. The mesh is `group.hull`. Helpers for walls, gates, fences, lamps, trees, bushes and grass seat themselves. A lamp shade sits on the post. The cap sits on the shade.

Wheels use 10 sides and `rotation.x = π/2`, with the centre at `y = radius`, so one vertex is on `y = 0`. One axle hides its far wheel behind the box. Two axles, yawed about `0.85`, show a near wheel at each end, and the far wheels of that pair still peek over the box. The mill's cart in `examples/windmill.js` is that pattern, and the stall notes above spell it out. The bed sits on an axle. Feet and hooves meet a solid: meadow, earth, sand, rock, a deck, or the floor of a boat. A bridge's piles stand on the banks, not in the pond. Posts reach `y = 0`.

Checklist:

- Every solid mesh declares `seat` or `afloat`, or sits in a group that does and meets the nearest mesh. A child inside the box but clear of every mesh still fails.
- Wheels, legs and feet contact. The axle contacts the box.
- The hull is partly under the water. Foam sits on the surface.
- Nothing floats without a named reason. The check covers a mesh with declared support, or a group that meets the nearest mesh. It does not cover a chain of loose pieces that only touch each other.

`npm run support` audits every `examples/*.js` at `t = 2, 4, 6` and `8`, then `--negative` and `--water`. One scene is `node scripts/support.mjs examples/<name>.js`. A real miss exits 1 and names the group. An expected miss prints `ok negative` or `ok water` with the reason, and does not print `FAIL`. `--negative` lifts one `cart-wheel` by `0.25` and must fail once on that name, without a second axle line. It also parks an undeclared box named `childfloat` at `y = 4.5` inside the mill, and that must fail as floating apart from the nearest mesh. An unnamed box in the same place must fail as `mill child` apart from that mesh. A figure stood in the tower must fail as `stands inside`. A figure against a seated step must fail as `stands against`, and one inside `1.2` of the near wall must fail as `stands in the opening`. A figure on sand, once a step is seated, must fail as `stands off the path`. `--water` plants a host in the tea pond and a figure in the lighthouse's open water, and both must fail as `stands on water`. A figure on the lighthouse rock must pass. A mesh vertex of `NaN` must fail as `has no place to stand`. `folk(NaN)` and `folk(undefined)` must fail the same way: the kernel would have placed them at `0`, and the helper does not let that pass. A mesh with no support must fail, and a blank float reason must fail as `floats without a reason`. The look runs the same frames. `shadow: 'soft'` or `none` fails. A declared hard cast that reads as a grass silhouette takes that check, including the change of shape. A hard cast on earth, water, or a cold ground has to clear the sharp threshold. The scene name is not what chooses it. `--negative` also checks the snow report, a default gate against `{ h: 0.4 }`, and the cold family: grass, earth and water stay put, rock grey and lit snow are cold, a blue snow shadow stays water, and a spread of 3 passes only for snow and only when the cast is at least 36 pixels wide. A tall narrow earth stain from a post on sand passes when it is at least 28 pixels tall and at least three times as tall as it is wide; a shorter speck does not. The same run checks that a standing figure's bind-pose sole sits about `0.01 × h` under the origin, that `on` puts the sole exactly on a yawed deck, and that `hull` stores height, centre and amplitude with the box cut by the water.

A figure fails as `stands inside` when the centre of the body, or a point just above the feet, lies inside another mesh. A shared face does not count. Carried pieces are `afloat` and are not the body and not the solid. The `1.2` and `0.4` rules run only when some support name starts with `step`. The four yards have no step, and the miller stands closer than `1.2` to the near wall, so those yards are not moved to satisfy a rule they do not use. To stand on a plinth, raise the root to the top face and call `Dither.seat(root, name, plinth)` again. A root left on the ground, with the shins in the plinth, fails as `stands inside`.

## Shadow check

`Dither.sun(45, elevation, turn)` aims the light so the cast falls to screen-right of the usual camera. Families 1 to 3 are grass, earth and water, unchanged. Family 4 is the neutral or cold ground they miss: not white, chroma at most 36, luminance from 68 to 248, blue within 22 of red, and `g + 18 >= r`. The miniature skips only families 1 to 3, so on a snow scene the snow counts as structure. A warm earth light stays family 2. Pure white is still no family. A hard cast passes on family 4 with the same sharp threshold as earth (count, contrast, spread of 4, width at least 10). Sand `#d2c09a` sits on the earth boundary: its two lightest ramp steps are not earth, because red is not under 210. A post on that sand leaves a tall narrow earth stain. A `0.09` post measured 6 pixels wide and 38 tall. The check accepts that stain when the count, contrast and spread clear the sharp bar, the stain is at least 28 pixels tall, and it is at least three times as tall as it is wide. A shorter speck does not count. Width of 10 or more still uses the sharp test. Snow is the exception: the lit ground is family 4 and the veil moves the cast into water, where the spread is about 3. That allowance runs only when a ground material is named `snow`, and the cast must be at least 36 pixels wide. The grass silhouette test is unchanged.

A readable cast:

- starts at the object and stops before the right edge and before a yard wall
- is wider than a post and narrower than half the frame
- keeps the grass or water texture, so a dark dither speckle is not the whole shadow
- changes shape when something large turns (sails). A still tower does not need a moving shadow

## Tap

`hint` contains `tap the <name>`. `parts.hot[i].name` starts with that name.

Validate check 8 reads the scene source, comments stripped, and requires the text `.name =`. A `name:` field passed to `folk` sets the name at runtime and does not satisfy the check. One `.name =` in the file is enough for the check. Each hot group still needs its own name for the read-out.

The toggled state is `c.active === thatRoot`. At `still + 0.5` seconds the two states must differ by a mass you can see at a glance: the ray, the dusk screens and lantern cores, the forge mouth and the hammer. Set `c.read` to a short status. Hover still shows the group's name, which is what the pointer check expects.

## What the first picture got wrong

These are the misses from the first render of each place, after the yard rules above were already written. A later pass fixed the picture. The check did not catch all of them.

- **Windmill rotor.** A flat disk wider than the tower, turned face-on, reads as a lid, and the sails drawn in that plane read as a cross on the roof. The cap is a cone with a small overhang and a slope. The hub is on the front, the shaft points at the camera and down a little, and the four blades are the same length. The lower blade stays in front of the stone. It must not paint the door. A hub set to the side of the shaft draws the sails edge-on.
- **Windmill people.** The near wall and the gate post cover anyone standing on the path by the opening, even when their feet are inside the yard. The open grass in front of the door, short of the gate, is the spot that stays whole. A sack carried on a world arc sits on the wall at the still. Put it in the hand. A cart with one axle, or one tucked behind the tower, shows one wheel. Two axles in front of the door, yawed so the long side faces the camera, show both near wheels, and the box sits on an axle.
- **Windmill shadow.** A high sun (`elevation` near 58) leaves a thin run that merges with the right-hand wall. `Dither.sun(45, 38, 16)` throws one grass silhouette to the right of the tower, short of the wall, and it still changes shape as the cross turns. The cone's base meets the tower top. If the lower blade is buried in the taper, it paints the stone and the shadow test sees the wall.
- **Lighthouse.** A single box the same thickness for its whole length reads as a bar, even when it is thin. Segments that narrow, with a dithered tone on the alternate ones, read as a ray. The keeper stood behind the parapet in an earlier pass, and the crests were dark dashes. Pale foam boxes read as waves. The cast on the sea is a dark blue strip, not a column of grass, so a grass-shaped test counts it as nothing.
- **Tea house.** A roof on four posts is a shed. Two shoji walls toward the camera, a plank floor and an eave make the house. One carp was under the bridge at the still frame when the oval crossed the deck. Keep both fish in the near water. The host stood behind the near lantern in an earlier pass. The dusk sun sat high in the empty page. The light direction is fixed when the page is built, so dusk is a swap of the paper, the lantern cores and one hard disk near the roof. It is not a new sun.
- **Forge.** A mule built as one bar with a lump for a head does not read. Neck, muzzle, ears and legs wider than the body do. Sparks of a single pixel at the anvil disappear. A short burst of larger pale and ember pixels does not. The fence crossed the smith in an earlier pass. The grass shadow is a narrow run at the right, real, and thinner than the mill's.

A phone tap lands on the first pixel the search finds, which is often the hat. Aim the tap at the middle of the figure or the touch misses and the picture does not change.

## Framing

`camera.height` moves the picture up and down. `camera.scale` changes the size. `height` is not the summit. The fit reserves the yard edge, so a height set to the roof crops the near wall or leaves the mass low. Start near `0.6` times the tallest point and correct from the still. A tall `height` leaves white above the roof. These landed there: windmill `height` `1.08`, `scale` `56`; lighthouse `1.22` and `60`; tea house `0.22` and `62`; forge `1.62` and `56`. A mass that still touches the top after that is too tall for the frame. Shorten it. Do not push `height` until the ground is cut. The sun stays the one from `Dither.sun`. A closer frame does not get a new light.

## Frame budget

360 x 280 at 12 fps allows `83.3` ms a frame, including a four-times CPU throttle. Stay near the windmill's mass: cylinders at 6 to 8 sides, one tree, a handful of people. A second copy of a whole building will miss the budget. Toggle materials by hiding a few faces, not by building the scene twice.
