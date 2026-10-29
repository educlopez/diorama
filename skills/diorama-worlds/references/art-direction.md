# The miniature, not a pile of props

## Shared composition

A cut piece of a place, seen from above at a fixed diagonal. Default to a flat ground cutout with a broken, irregular fringe dissolving into white space. Do not add a soil wall. A thick display block is `plinth`, and only when the scene asks for one: its side has to read, and its colors are not the ground. Use a strong silhouette, foreground, middle and background, and enough small props that the place is not a figure on an empty pad. Background remains white; camera does not orbit or lean toward the mouse. Leave breathing room around the tallest prop and the extreme motion.

A character needs a body, shoulders, elbows, hips and knees. Pose shoulders and elbows for the task. Feet stay on the ground unless jumping, throwing weight or stepping. Use skin and clothes with enough value separation to remain legible at mobile scale. Long thin poles and unreadable scoreboard text are not substitutes for character detail.

Write a short action timeline before coding. For example: prepare, release, flight, contact, recovery. Inspect contact times separately from pretty mid-flight frames. For juggling or other handoffs, define one shared contact schedule for hands and props, then check their positions numerically; independent ball and arm clocks can look plausible midair while missing every catch. One common loop duration lets all actors return to their initial state; independent periods must divide it. At the seam, positions, rotations and visible props should agree; a wrapped clock alone does not make a loop seamless.

## Miniature

Use grass mottling, board seams, pavement wear and clustered leaves sparingly. Break up large uniform planes, but don't make every surface equally noisy. Shadow contact anchors feet and props. Keep a main warm sun and soft sky fill; do not add bloom, fog or depth of field to hide weak geometry. White uniforms must remain separate from a beige pitch; a white ball on white ground needs careful contrast or a suitable color.

## Pixel

Begin with the same composition. Pixelated output is not automatically pixel art. Make silhouettes more readable, keep small props at least a few logical pixels wide and preserve color groups. The kernel uses a 3 CSS px logical pixel on desktop and 2 CSS px below 600px stage width and ordered Bayer dithering with channel quantization, not a curated 16-color palette. Say so when that distinction matters. `pixelInk` is the opt-in exception: eight fixed colors, the same Bayer dither, and a depth contour. It is still a pixel finish on the 3D scene, not voxel geometry and not a hand-authored sprite. Do not claim voxel geometry.

Dithering belongs in tonal transitions; too much noise on flat faces destroys material readability. Avoid antialiasing that smears the pixel grid. The current prototype uses a CSS nearest-neighbour enlargement; noninteger container dimensions can produce slightly uneven pixel widths. A production upgrade could quantize stage dimensions to integer logical pixels.

## Visual review questions

- Can someone name the action without reading the title?
- Do hands, props and contact points actually meet? Does the action recover plausibly?
- Does the whole ground read as one coherent place rather than separate asset demos?
- Are feet planted and trees rooted? Does the net hang from the ring?
- Is the background clean and the base fully framed at 390px and 1100px?
- Can the pixel silhouette still be read at 390px? Are important objects reduced to isolated flickering pixels?
- At 0, the event moment and just before the loop seam, does the composition still work?
- Is the new output genuinely close enough to the user's references? If not, identify the visible gap rather than calling it finished.

## Acted loops
Write the three spans down before choosing props. The routine should be recognizable on its own, and its marked frame must not repeat the opening: another pose, another place on the route, another prop state. The interruption should change one readable thing: a bell, a loose object, a tipped creel. The consequence is the figure's answer, held long enough to name, then eased back so the first and last poses match. A permanent outcome cannot survive the loop. Put the still on that held answer, not on the first frame and not in the settle. Plant the feet of anyone who is not walking, running or swimming. Walkers use `stride` on a `trail`. A swimmer uses `paddle` and stays off the planted contacts. If a hand leaves a tool, the contact list leaves that tool too, and picks up the new target only while the palm is there.

Toy pins are small brass spheres on the existing joints. They do not add fingers, a jaw or a separate wrist axis. At 390px the pins may merge into the limb; the silhouette of the task has to carry the story without them.

## Tempo
Use short, legible event durations rather than spreading every movement across the whole loop. The basketball example has a 4.2-second cycle, a .6-second set and .8-second shot; its predecessor’s 8-second cycle and 2.24-second flight looked like slow motion. A render-rate cap is not a simulation-rate cap: never drop elapsed time to make frames look smoother. Optional speed controls supplement, not replace, a convincing 1× default.

## Adult characters and grounded work
The default person is roughly seven head heights, with tapered torso/limbs, small hands, separate hips/chest/head and joint pivots. Use `plant` for modest task-linked crouch, chest lean and twist; knees compensate while feet remain flat. Then call `reach` toward actual prop anchors. Turn the head toward the work. Avoid moving the whole body up/down as a generic substitute for action. Inspect the person close-up as well as in the complete miniature; a table can hide proportion and leg problems. The reference’s visual language is transferable to new settings: do not default to more cricket, basketball or juggling.

## Halftone and blueprint
Halftone should read as a warm printed illustration: diagonal dots, ivory paper inside the silhouette, blue-grey shadow ink and burnt-sienna warm ink. Blueprint should preserve the scene as pale edges and graded blue planes, not turn the whole page dark. Both treatments are deterministic screen-space shaders using the same scene depth, animation and clock. Their patterns stay tied to the screen; they are not surface-attached physical materials. Fine foliage can become busy and small facial details disappear. Review desktop AND mobile rather than increasing edge strength or adding dots everywhere. White surroundings remain untouched, even when the subject uses white clothing.
