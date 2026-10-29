# Art direction

A wash is a top-down sheet of water on warm paper. The pond sits in the middle and the paper stays empty around it. Nothing in the frame is a model on a plinth, and nothing is drawn with perspective.

## Paper

The ground is a warm cream, the colour of cold-pressed paper. Grain is procedural: a fine tooth, a slightly coarser speckle, and long fibers. It shows through thin pigment and gathers in the darks.

## The pond

The shore is an irregular stain, not an ellipse with a stroke. Pigment bleeds past the mask, a thin darker line sits on the wet edge, and the interior runs from a pale cerulean shelf to indigo in the middle. Lay the colour in broad washes, then a tighter wash, then granulation: dark pigment breaks into specks where the paper tooth is low. A few dry-brush marks can sit on the shore. They are short, broken, and darker than the wash.

Earth-green stains belong on the margin, in patches, not as a hedge around the whole pond. A lily is a flat green disc with a notch, only when the scene asks for one.

## Water that moves

The surface is the same 2D sheet. Motion is a shift of the wash coordinates plus a height field drawn into a render target and read back as a displacement. Rings and wakes are pale and dark strokes in the pigment. They are not foam, spray, or a mesh.

A wake belongs behind a boat that is moving. A creature that breaks the surface leaves a ring. A click on the water leaves a ring whose age is `t - tClick`. All of those are samples of the scene at earlier values of `t`, so a frame does not depend on the frames drawn before it.

## What floats, what is under

Boats, rowers and creatures are painted marks: a hull with a wet edge, a torso and head, two oars that swing from `phase`. A soft shadow sits under a mark that is on the surface. Under the wash, the same mark is softer and pulled toward blue, and it still has a silhouette. When it surfaces, the local colour comes back and the ring starts.

Keep the cast small. One boat is a pond. Three boats are a lake. Two fish and a frog are enough life under the water.

## Still frame

`still` is the second a reduced-motion viewer and a thumbnail see. Put the boat where the oars read, or a creature where it has just broken the surface. Do not leave everyone in the middle of the pond on top of each other unless that overlap is the point of the frame.
