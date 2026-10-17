# The look

`scripts/look.mjs` writes one sheet, `diorama-<name>-look.png`, with eight pictures, and prints the measurements. Read the sheet as the owner would, then answer each question. A "no" is a fix, then another look.

## The eight pictures

1. **rest** · the still frame at `still` seconds. Is every loop in a telling place? Is the subject visible and front-left? Would this hold up alone as the only thing a visitor with reduced motion sees?
2. **t+1.5s**, 3. **t+4s**, 4. **t+8s** · three moments of the loop. Does something differ between each pair? Is any object in two places at once, inside another, or off the base? Has a vehicle turned its wheels and its nose? Does a stop have a cause?
5. **pointer** · the pointer near the centre after a settle. Is there an answer (a lift, a light, a move), and is it one answer? Is anything popping rather than easing?
6. **corner** · the pointer at the top-right. The camera has tilted a few degrees. Is the scene still inside the frame? Does nothing clip the edge?
7. **thumb** · the stage at 160px (mini) or 390px (hero, card). Can you tell what the place is and what is missing? Do the objects still read, or have they become a grid of dots?
8. **page** · the whole bench. Do the title and the `means` say what the scene cannot? Is the stage the right size for where it will live?

## Another theme

`node <skill>/scripts/look.mjs <name>.js --theme line` keeps the figure's own `accent` and swaps everything else, and writes `diorama-<name>-line-look.png`. Look at a figure in `mono` or `line` once even when it ships in `toy`: with the colour gone, do the shapes still say what the place is? Is the accent on the right thing? In `line`, does any cylinder show seams (too few segments), does any ground marking draw an edge (it forgot `{ shadow: false }`)?

## The measurements

- **console:** any error fails. A warning about a shadow map or a deprecated call is a fix too.
- **webgl:** no context fails. (In the sandbox, software GL is slow but works.)
- **fill:** the share of the stage inside the scene's silhouette (row by row, from its first to its last pixel that is not background, so the white faces of a line drawing count). Under 22% reads small. A mini with a tall subject may sit at 15–20% and be right; a hero under 30% wants a wider base or a lower azimuth.
- **motion:** the share of pixels that change between t+1.5s and t+4s. Under 0.3% the scene is effectively still: the loops are too slow, too small, or not there.
- **answer:** the share that changes when the pointer arrives. Under 0.3% the pointer does nothing visible (a mini may rely on the tilt alone, which shows as a few percent).
- **frame:** milliseconds per tick and render in software GL. Hundreds of parts cost a few ms here and under one on a GPU; above 15 ms, cut primitives or shrink the shadow map by choosing a smaller size.

Mark ground that other things stand on (a hill, a mountain, a dune) with `group.userData.terrain = true`; the check skips it, so its slope does not flood the list. `clash` lists every moving part that passes through another part in the first 40 seconds, with the depth in world units and the second it starts. Read it with the sheet: a vehicle through a tree, two cars in one lane or a tractor inside a barn is a bug in the lane, the schedule or the furniture; forks in a rack, a flag on its hinge or a gantry arm against a rocket is a contact on purpose. Fix the bugs, keep the contacts.

## The rules, on the sheet

Go down `craft.md`'s ten rules with the pictures: base whole and uncut (01); camera isometric, subject front-left (02); pale world, two or three accents (03); matte, no textures (04); every object recognisable by its giveaways (05); soft shadows under everything (06); no visible snap between moments (07, 08); different tempos, something rare (09); no words in the scene (10).

## A closer look

The sheet's tiles are small for a hero. Open the built page at any second, still, in a browser: `diorama-<name>.html?still&t=14` draws second 14 and stops; add `&theme=line` for another theme. Screenshot it at full width to judge people, chairs and wheels.

## Without a browser

Run `node <skill>/scripts/validate.mjs diorama-<name>.html` after each build: it checks the declaration, the length, the clock, self-containment, the kernel, the words, the colours, the base, the pointer and the renderer. Then answer the eight questions above from the code, honestly: walk the loop at 1.5, 4 and 8 seconds by hand and say where each part is. Tell the person the look was not seen, and ask them to open the page and press "Still frame" to judge the rest pose.
