# Motion

Everything moves from `ctx.t` inside `tick(ctx)`. The kernel runs the loop, sleeps it offscreen, stops it when the tab is hidden, and under reduced motion draws one still frame at `still` seconds. A figure poses its parts; it never schedules anything.

## The helpers

| Call | Gives | Use for |
| --- | --- | --- |
| `D.phase(t, period, offset)` | 0..1, sawtooth | where in a lap, a cycle, a blink |
| `D.wave(t, period, offset)` | −1..1, sine | sway, bob, flutter |
| `D.pulse(t, period, width)` | 0..1 bump once per period, lasting `width · period` | something that happens now and then |
| `D.smooth(u)` `D.out(u)` `D.inOut(u)` | eased 0..1 | the shape of a move; `inOut` for vehicles, `smooth` for doors and lifts |
| `D.lerp(a, b, u)` `D.clamp(v, a, b)` | | |
| `D.path(points, closed)` | `{ length, at(dist) → { x, z, yaw } }` | roads, aisles, walks |
| `D.place(group, path, dist)` | puts the group on the path, nose (+x) along it | vehicles, walkers |
| `D.spin(wheels, dist, r)` | turns wheels by distance travelled | any `D.wheel` |
| `D.spring(k, c)` | `{ x, t, step(dt), set(x) }` | the pointer's answer, a lift that settles |
| `D.stagger(i, from, step)` | `|i − from| · step` | a row that reacts outward from a point |

## A lap with stops

Turn the cycle's time into a distance leg by leg. Each leg is a range of seconds; inside it, ease from one distance to the next; between legs, hold.

```js
var T = D.phase(t, 24) * 24, L = p.loop.length, dock = 14.7, dist;
if (T < 9) dist = D.inOut(T / 9) * dock;                       // drive to the dock
else if (T < 14) dist = dock;                                  // wait five seconds
else dist = dock + D.inOut((T - 14) / 10) * (L - dock);        // drive the rest of the lap
D.place(p.truck, p.loop, dist); D.spin(p.tw, dist, .46);
```

Give the stop a cause in the same clock: the dock door opens as the truck arrives and closes as it leaves.

```js
var open = D.smooth((T - 8.4) / 1.2) * (1 - D.smooth((T - 13.6) / 1.2));
door.scale.y = 1 - .85 * open; door.position.y = 1.55 - 1.3 * open;
```

A closed path (`D.path(points, true)`) loops seamlessly. An open path needs a return: drive out, turn (add π to `rotation.y`), drive back.

## A shuttle

Out loaded, lift, set down, lower, back empty, reload: six legs of one 12 s cycle. Visibility and scale sell the hand-off: the load on the carriage shrinks to nothing as the one on the shelf grows.

```js
var F = D.phase(t, 12) * 12, R = p.run.length, d, up, loaded;
if (F < 4)        { d = D.inOut(F / 4) * R; up = 0; loaded = 1; }
else if (F < 5.2) { d = R; up = D.smooth((F - 4) / 1.2); loaded = 1; }
else if (F < 6.4) { d = R; up = 1; loaded = 1 - D.smooth((F - 5.2) / 1.2); }
else if (F < 7.6) { d = R; up = 1 - D.smooth((F - 6.4) / 1.2); loaded = 0; }
else if (F < 11.6){ d = (1 - D.inOut((F - 7.6) / 4)) * R; up = 0; loaded = 0; }
else              { d = 0; up = 0; loaded = D.smooth((F - 11.6) / .4); }
```

## Ambient motion

- **A flag:** `cloth.rotation.y = .25 * D.wave(t, 2.1) + .1 * D.wave(t, .7)`: two sines of unrelated periods so it never repeats visibly.
- **A beacon:** `material.emissiveIntensity = .2 + .8 * (D.phase(t, .8) < .5 ? 1 : 0)`.
- **A walker:** a path, `wd` going out for half the cycle and back for the other, `rotation.y += Math.PI` on the way back, `position.y = .05 * Math.abs(D.wave(t, .5))` for the step.
- **Something rare:** `var check = D.smooth(D.pulse(t, 7, .36))` then `flag.rotation.z = D.lerp(.2, 1.45, check)`: still for most of the period, a move in the middle.
- **A door that sways:** `door.rotation.z = -1.25 + .06 * D.wave(t, 3.2)`.

In a mini, one of these is enough. In a hero, three or four with different periods, so the whole never repeats.

## The pointer

The kernel gives three things without a line of code: `ctx.pointer` (`x`, `y` in −1..1, `inside`, `world` on the ground plane), `ctx.hover` (the group under the pointer among `parts.hot`), and the camera tilt (a few degrees toward the pointer, sprung). On a hero or card add one answer:

- **Lift what is under the pointer.** A spring per hot group, target .35 when hovered, 0 otherwise; `group.position.y = s.x`.
- **Light a level.** Swap the beams' material to a `D.mat(pal.safety, { emissive: pal.safety, emissiveIntensity: .55 })` while hovered; swap back after. Materials are cached, so make the two once in `build`.
- **Send something there.** The forks' spring target becomes the hovered level's height; with no hover it goes back to the ambient value.
- **Look at it.** A driver's head turns toward `ctx.pointer.world`.

Springs make the answer and the return calm; never set a pose directly from the pointer. Test the pick against what is at rest (`parts.hot` are groups; a lifted group is still picked where it stands).

## The still frame

Reduced motion, a thumbnail, and the look's `rest` picture all draw the loop at `still` seconds, once. Choose the second where every loop is in a telling place: the truck at the dock with the door open, the forklift with the forks up, the walker mid-aisle, the flag out. Check it on the sheet.

## Cost

`tick` runs sixty times a second. Keep it to arithmetic and property sets: no `new THREE.*`, no array allocations, no `scene.traverse`, no material creation. Make every material in `build` and swap references in `tick`. A hero of 400 primitives at 1.5 device pixels renders in a few milliseconds on a laptop; the look prints the time in software GL as a hint.
