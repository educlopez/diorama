# World scene API

```js
import { defineWorld } from '@diorama/worlds';
export default defineWorld({
  name: 'my-place', title: 'A telling moment',
  description: 'Describe the place and what moves for a nonvisual reader.',
  duration: 8, still: 2,
  bounds: [[-7, -.5, -5], [7, 5, 5]],
  build(W) {
    W.terrain(14, 10); W.grass(14, 10);
    const actor = W.person(0, 0, '#dcb35a', '#34433b', .9);
    return { actor };
  },
  tick({t, parts, W}) {
    parts.actor.rightArm.rotation.x = -.3 - .2 * Math.sin(W.phase(t, 8) * Math.PI * 2);
  }
});
```

Units: x/z form ground plane, y points up. Person faces local +z. Object primitives take centre coordinates; terrain surface is near y=0. People take foot-ground coordinates. Containers default to scene content.

- `group(x=0,y=0,z=0,parent?)` returns a Three.js Group.
- `box(width,height,depth,color,x=0,y=0,z=0,parent?)`.
- `ball(radius,color,x=0,y=0,z=0,parent?)` uses a faceted sphere. Its scale stores radius; put accessories under a separate unscaled group rather than under the ball mesh.
- `cylinder(radius,height,color,x=0,y=0,z=0,parent?,segments=8)`.
- `line([[x,y,z],...],color,radius=.035,parent?)` makes thin cylindrical segments.
- `ring(radius,color,x,y,z,parent?,tube=.028,arc=2π)` lies flat on ground by default; adjust rotation for vertical rings.
- `surface(width,depth,color,x=0,y=.03,z=0,seed=12,variation=.13)` makes a textured matte ground patch with deterministic fine wear, not a new texture per frame.
- `reach(actor,side,targetWorldXYZ)` poses a person’s fixed-length two-link arm toward an endpoint; `side=-1` is left and `+1` right. It returns the actual palm endpoint. Targets outside reach are clamped; compare returned endpoint in contact tests rather than assuming success.
- `terrain(width,depth,color='#718c42',seed=42,{base='none'}={})` adds flat textured ground with a broken coplanar fringe. No soil wall or platform by default. Only use `{base:'slab'}` when a raised soil base is explicitly requested.
- `plinth(width,depth,height=.5,side='#6a4a34',cap='#d7b57a')` adds a thick display block whose top sits at y=0 and whose side hangs below it. Make it larger than the ground so the side reads. It does not replace `terrain`.
- `grass(width,depth,count=1400,seed=7)` adds instanced blade fringe, not turf across the centre.
- `tree(x,z,scale=1,seed=3)`; `bench(x,z,rotation=0)`.
- `plant(actor,{crouch=0,lean=0,twist=0})` flexes knees to preserve ground contact while the chest leans/turns independently. Use modest values (crouch .02–.08, lean .05–.16) tied to the task, not generic bobbing. Call it before `reach`.
- `person(x,z,shirt,pants,scale=1,skin?,shoes='#ded9c9')` returns `root`, `body` (hips), `chest`, `head`, `face`, `leftHand`, `rightHand`, `leftFoot`, `rightFoot`, `leftArm`, `rightArm`, `leftForearm`, `rightForearm`, `leftLeg`, `rightLeg`, `leftShin`, `rightShin`. Limb rotations are about their proximal joint, with local -y at rest. Feet are at ground level; body pivot is above hips. The shoe color defaults to the original pale leather so existing scenes stay put.
- `toy(x,z,shirt='#456185',pants='#2c2824',scale=.9,skin?,shoes='#1f1c19',bulk=1)` builds that same rig and adds a pin on each shoulder, elbow, wrist, hip and knee. Scale is root scale: bone lengths in joint space do not change, so `plant` and `reach` still apply. World distances shrink with the scale. `bulk` thickens the torso and limbs without moving the pivots. Default scale is 0.9.
- `aim(actor,{head:[x,y,z],...})` assigns finite euler triples on existing joints. It does not solve reach or knees. Call it after `plant` for the head, or instead of `reach` when the pose is authored as angles.
- `stride(actor,{phase=0,reach=.16,lift=.07,rush=0})` poses one walk cycle. `phase` 0 and 1 match. Feet alternate, arms oppose the feet, the hips bob and the chest sways. `rush` lengthens the step, the lift and the forward lean for a run. Call it instead of `plant` for that figure, and do not `reach` the same arms in that frame.
- `paddle(actor,{phase=0})` pitches the body over the hips and alternates the arms and the kick. It does not plant the feet. The caller sets the root on the water.
- `cue(actor,'carry'|'sweep'|'wave',amount=0)` sets the arms after `stride`. `amount` drives the sweep and the wave.
- `trail(u,points,{curve=false})` returns `{x,z,heading}` on a closed route. `u` wraps. Pass the same point array every frame. `curve: true` rounds the corners. Heading matches at `u` 0 and 1.
- `act(t,acts)` splits time into `routine`, `interruption` and `consequence`. Each span must be positive and finite. The return is `{name,index,local,span,u,enter,total}`. `u` is 0 at the start of the span and 1 at the end. The next span starts exactly when `local` reaches the current span, and time wraps inside the sum. `enter` eases from 0 to 1 across the first 0.16 seconds, or across the first quarter of a shorter span.
- `blend(from,to,u)` interpolates a number or equal-length nested arrays. `settle(u,tail=.22)` stays 0 until the last `tail` fraction of a span, then eases to 1. Use it to return the consequence to the routine's opening pose. `sample(t,frames)` reads `{t,value}` keys with strictly increasing times, clamps outside the track and eases inside each segment. It does not wrap. A looping prop needs its first and last values equal, with the last key at `duration`.
- `random()` seeded build-time noise, `phase(t,period)` returns [0,1), `smooth(x)` clamped smoothstep.
- `THREE` for custom subject geometry; `own(resource)` registers a disposable geometry, material or texture. Add custom meshes under a W group or `mesh` parent, and set castShadow/receiveShadow deliberately. Opaque primitive meshes get auto-instanced after build; keep references for posing but do not toggle original `.visible` or assign new materials after mounting. Vary transforms instead. Transparency and per-object visibility need a separate, explicitly managed implementation.

Keep `bounds` around the entire motion, including tallest pose. Wider bounds reduce scene fill; do not add arbitrary padding to hide clipping. Camera fitting already adds 12% breathing room.

## Runtime and embedding

`kit/world.js` exports `mountWorld(definition,{el,finish:'miniature'|'pixel'|'halftone'|'blueprint',paused:false,pixelInk})`. It returns `setFinish`, `setPaused`, `setSpeed(0.25..3)`, `seek(seconds)`, `contacts()`, `stats`, `snapshot` and `dispose`, or null on WebGL creation failure. `stats().pixelInk` reports the resolved flag. The generated page includes controls and fallback text; a custom integration must expose equivalent pause and finish controls where needed.

To integrate in an existing application: install the pinned Three.js dependency, copy/import `kit/world.js` and import the scene with your bundler's `@diorama/worlds` alias pointing at that module. Mount into a container with explicit height or aspect-ratio. In React, mount inside `useEffect`, dispose in its cleanup. Never import/mount a browser world while rendering on the server. Do not copy the diorama skill's SVG runtime into this world.

Mounts own GPU resources. `dispose()` stops loop, observers and listeners and releases geometry, materials, textures, render target, shadow map and WebGL context. A new mount starts cleanly. Reduced motion renders the declared still. Offscreen and hidden-tab states suspend rendering without advancing the world clock. WebGL context loss stops the loop; context restoration redraws current pose.

Generated HTML is self-contained, not dependency-free: the renderer is bundled in the file. Current examples are around 0.76 MB uncompressed. Parent pages with restrictive CSP must permit their bundled script; prefer a same-origin iframe if that is easier to control. For strict nonce-based CSP, integrate the module in the application's normal build rather than weakening the policy.

For deterministic inspection, add `?inspect&still` to the built URL. Only inspect mode exposes `window.__world.runtime` and the definition. Do not use inspect mode in public marketing embeds.

## Timing and contact inspection
The animation clock uses absolute elapsed wall time, not accumulated clamped frame deltas. Rendering is capped near 30fps, but action speed stays the same after skipped frames. Pause/offscreen/hidden states preserve time; resume starts a new clock anchor. `setSpeed` adjusts playback without changing the authored duration. Use `contactTimes:[seconds,...]` and `contacts({t,parts,W})` returning actual `{label,a:[x,y,z],b:[x,y,z]}` endpoints for automated contact checks.

Built pages accept `?embed` to show only the stage. Their message bridge accepts known finish, paused and playback-rate values only from the same-origin direct parent; `diorama-world` replies report readiness, fallback and runtime state. No wildcard origins or arbitrary execution. Mobile pixel rendering uses a 2 CSS px logical pixel; desktop uses 3 CSS px.

The standard person now has a ~seven-head adult silhouette, tapered torso/limbs and separate hip/chest/head motion. Hand endpoints are at the wrists, with small hand meshes attached. Add aprons/hair/props under the appropriate group rather than rebuilding an inconsistent human. `reach` works in chest coordinates so a leaning torso does not detach arms. Do not scale limbs to reach a prop; move the task, actor or stance.

A world may set `acts` to `{routine, interruption, consequence}`. The three spans must sum to `duration` within 1e-6. It may set `marks` to `{opening, routine, interruption, consequence}`, four distinct finite times inside the loop. Those four frames are compared as poses and as pictures. It may set `pixelInk: true`. Anything else in those fields is rejected. `tick` still receives only `{t, parts, W}` and must not keep its own clock.

## Four live finishes
`FINISHES` exports the supported identifiers. Finish switches preserve scene objects, time and pose; only the post-process and render-buffer size change. Miniature/halftone/blueprint use the full stage resolution (DPR capped at 1.5); pixel uses the lower logical grid. Halftone uses deterministic diagonal dots and warm/cool ink selection. Blueprint combines tonal blue with screen-space colour/depth edges and a faint grid. Both new finishes sample the scene depth texture to keep white negative space pristine, including around pale geometry. No extra geometry or GPU resources are allocated per frame or finish switch. All four work through standalone `?finish=...`, the selector and the validated same-origin iframe bridge.

`pixelInk` is not a fifth finish. On the pixel finish only, it snaps visible pixels to a fixed palette, adds ordered Bayer noise before the snap, and draws a dark contour where depth changes sharply against a neighbour. The palette, as display-side color, is paper `#f5eddb`, ink `#1f1c1a`, wood `#8c5c38`, leaf `#577545`, skin `#c78f66`, cloth `#456185`, sand `#bda86b` and clay `#9e4d3d`. Flat white around the scene stays white. Miniature, halftone and blueprint ignore the flag. Pass `pixelInk` to `mountWorld` to override the world; the built page treats `?ink` as on and `?ink=0` as off. Contours are one low-resolution pixel and follow the screen, not the mesh. Grass blades and wires can pick up extra specks. There is no per-scene palette.
