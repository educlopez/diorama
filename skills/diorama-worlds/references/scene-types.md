# Scene types

An acted scene is a place plus three spans on one clock: routine, interruption, consequence. The rows below are only the places the current helpers can suggest. A row is not a promise of simulation. If a behavior is not listed under "Use", the kit does not do it, even if a box can be posed to hint at it.

Shared by every row:

- Fixed orthographic camera, white surround, flat irregular ground (`terrain`, `grass`). A raised slab exists only as `terrain(..., {base:'slab'})` and only when the user asks for one.
- Props from `box`, `ball`, `cylinder`, `line`, `ring`, `group`, `surface`, `tree`, `bench`.
- Figures from `toy` or `person`, posed with `plant`, `reach` and `aim`.
- Time from `act`, `sample`, `blend`, `settle`, `phase` and `smooth`. Every posed value is a function of `t`.
- One looping duration. The consequence must return to the opening pose or the seam fails.
- Build-time `random(seed)` for scattered detail. No unseeded noise, no accumulated position, no new geometry in `tick`.
- Four finishes. `pixelInk` only changes the pixel finish, and only to the fixed eight-color snap, Bayer dither and depth contour.

| Type | What you can build | Use | Not in the kit |
| --- | --- | --- | --- |
| Workshop | Bench, tool, latch, bell, one toy | `toy`, `plant`, `reach`, `aim`, `act`, `box`, `cylinder`, `line` | No sparks, dust, motor, vise screw or finger grip. A wheel can only rotate because you set `rotation` from `t`. |
| Market | Stall, crates, produce, two toys, one loose item | `toy`, `sample` for the loose item, `act`, `ball`, `box` | No cloth awning, coins, readable signs, crowd, or collision. The second figure leans; they do not walk. |
| Port | Quay, bollard, crates, a box hull that slides | `surface` as flat water color, `box`, `cylinder`, `sample` for the hull | No waves, wake, buoyancy, reflection, transparency or spray. The hull does not sit in the water; it moves on a fixed height. |
| Pool | Deck, flat blue patch, a toy with a pole or ball | `surface` or a thin `box` for the water, `toy`, `act` | No volume, refraction, splash, wet shading or swimming stroke. A figure in the water is the same rig standing on the patch. |
| Station | Platform, desk, signal arm, stamp, hand flag | `toy`, `act`, `reach`, `box`, `cylinder` | No train, track follower, doors, wheels, timetable text or announcement. A carriage would be boxes whose position is `sample(t)`. |
| Festival | Lanterns, a rigid banner, trees, one or two toys | `ball`, `line`, `tree`, `toy`, `act` | No fireworks, particles, music, crowd or flapping cloth. A banner is a thin box you rotate. |
| Farm | Field, fence, tree, bucket, one toy | `terrain`, `grass`, `tree`, `box`, `toy`, `act` | No animal rig, gait, crop growth or weather. A hen built from `ball` and `line` can bob from `t`; it will not walk or flock. |
| Kitchen | Counter, pot, oven blocks, one toy | Same pieces as a workshop, plus a lid whose `position.y` is `sample(t)` | No steam, flame light, pouring liquid or heat haze. The scene lights stay the shared sun and sky fill. |

Sports grounds, a single craft loop and a juggler already exist as examples. They are coordinated loops, not this three-act shape. Use them when the story is the contact itself and nothing needs to interrupt it.

## Limits that apply to all of the rows

- Hands are one box. Wrists can rotate as a group. Elbows and knees are one axis each, solved by `reach` and `plant` or set by `aim`.
- `reach` clamps to the real arm length and returns the palm it achieved. A contact test has to compare that point, not the target you asked for.
- `plant` keeps both ankles on root-local supports. Translating the root slides the feet. There is no walk cycle.
- No physics, path finding, collision, particles, text, audio, decals, transparency toggle or extra lights in the helper set. `THREE` can build a custom mesh, and `own` must register it, but that mesh still has to be posed from `t` and it still counts toward the draw and triangle budgets (250 draws including shadows and the post pass, 100k triangles).
- Pale shoes on `person` are `#ded9c9` unless a caller passes another color. `toy` defaults to dark shoes. Under `pixelInk`, colors outside the eight swatches snap to the nearest swatch, so a custom purple becomes wood, clay or cloth.
- The loop cannot keep a consequence. If the orange must stay on the ground, the routine has to begin with it there too.
