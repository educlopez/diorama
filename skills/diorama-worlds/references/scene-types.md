# Scene types

An acted scene is a place plus three spans on one clock: routine, interruption, consequence. The rows below are only the places the current helpers can suggest. A row is not a promise of simulation. If a behavior is not listed under "Use", the kit does not do it, even if a box can be posed to hint at it.

Shared by every row:

- Fixed orthographic camera, white surround, flat irregular ground (`terrain`, `grass`). A raised soil slab exists only as `terrain(..., {base:'slab'})` and only when the user asks for one. A thick display block is `plinth`, with its own side and cap colors, and only when the scene asks for that block.
- Props from `box`, `ball`, `cylinder`, `line`, `ring`, `group`, `surface`, `tree`, `bench`.
- Figures from `toy` or `person`, posed with `plant`, `reach`, `aim`, `stride`, `paddle` and `cue`. `trail` supplies a closed route.
- Time from `act`, `sample`, `blend`, `settle`, `phase` and `smooth`. Every posed value is a function of `t`.
- One looping duration. The consequence must return to the opening pose or the seam fails.
- Build-time `random(seed)` for scattered detail. No unseeded noise, no accumulated position, no new geometry in `tick`.
- Four finishes. `pixelInk` only changes the pixel finish, and only to the fixed eight-color snap, Bayer dither and depth contour.

| Type | What you can build | Use | Not in the kit |
| --- | --- | --- | --- |
| Workshop | Bench, tool, latch, bell, several toys on routes | `toy`, `plant`, `reach`, `stride`, `trail`, `cue`, `aim`, `act`, `plinth`, `box`, `cylinder`, `line` | No sparks, dust or motor. A wheel can only rotate because you set `rotation` from `t`. Fingers stay one box. |
| Market | Stalls, crates, produce, several toys, one loose item | `toy`, `sample` for the loose item, `stride`, `trail`, `cue`, `act`, `plinth`, `ball`, `box` | No coins, readable words, or collision. An awning is a thin box, not cloth. |
| Creel dock | Quay, bollards, creels, a box hull, flat water, a swimmer and walkers | `plinth`, `surface` or a thin `box` for flat water, `trail`, `stride`, `paddle`, `toy`, `sample` for the hull | No waves, wake, buoyancy, reflection, transparency or spray. The hull and the swimmer stay on a fixed height. |
| Scaffold pit | Pit walls, scaffold frames, a mixer, planks, walkers and a hauler | `plinth`, `box`, `cylinder`, `line`, `trail`, `stride`, `cue`, `toy` | No dust, poured slurry, or a crane that lifts on its own. Motion is `sample` and `stride`. |
| Station | Platform, desk, signal arm, stamp, hand flag, walkers | `toy`, `act`, `reach`, `stride`, `trail`, `box`, `cylinder` | No train, doors, timetable text or announcement. A carriage is boxes whose position is `sample(t)`. |
| Festival | Lanterns, a rigid banner, trees, several toys | `ball`, `line`, `tree`, `toy`, `stride`, `trail`, `act`, `plinth` | No fireworks, particles, music or flapping cloth. A banner is a thin box you rotate. |
| Farm | Field, fence, tree, bucket, walkers | `terrain`, `grass`, `tree`, `box`, `toy`, `stride`, `act`, `plinth` | No animal rig, crop growth or weather. A hen built from `ball` and `line` can bob from `t`. |
| Kitchen | Counter, pot, oven blocks, one toy | Same pieces as a workshop, plus a lid whose `position.y` is `sample(t)` | No steam, flame light, pouring liquid or heat haze. The scene lights stay the shared sun and sky fill. |

Sports grounds, a single craft loop and a juggler already exist as examples. They are coordinated loops, not this three-act shape. Use them when the story is the contact itself and nothing needs to interrupt it.

## Limits that apply to all of the rows

- Hands are one box. Wrists can rotate as a group. Elbows and knees are one axis each, solved by `reach` and `plant` or set by `aim`.
- `reach` clamps to the real arm length and returns the palm it achieved. A contact test has to compare that point, not the target you asked for.
- `plant` keeps both ankles on root-local supports. Translating a planted root slides the feet. `stride` is the walk and the run: opposite feet, opposite arms, hip bob and chest sway. `paddle` is the swim and does not plant the feet. `trail` is a closed route. A route needs an integer cycle count across `duration`.
- `plinth` is a thick block under the cutout, wider than the ground, with its own side and cap. It is not the terrain slab.
- No physics, path finding, collision, particles, text, audio, decals, transparency toggle or extra lights in the helper set. `THREE` can build a custom mesh, and `own` must register it, but that mesh still has to be posed from `t` and it still counts toward the draw and triangle budgets (250 draws including shadows and the post pass, 100k triangles).
- Pale shoes on `person` are `#ded9c9` unless a caller passes another color. `toy` defaults to dark shoes. Under `pixelInk`, colors outside the eight swatches snap to the nearest swatch, so a custom purple becomes wood, clay or cloth.
- The loop cannot keep a consequence. If a loose piece must finish on the ground, the routine has to begin with it there too.
