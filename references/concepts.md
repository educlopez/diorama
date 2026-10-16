# From an idea to a place

A diorama concept is four things: **a place**, **what is in it**, **what moves on its own**, and **what the pointer does**. It fits on one line. If it does not, it is not ready to build.

## Finding it

1. **Find the place.** Somewhere you could stand: a yard, a street corner, a kitchen, a harbour, a desk, a server room, a rooftop. Not a diagram. A "deployment pipeline" is not boxes and arrows; it might be a loading dock with three bays.
2. **Find what gives it away.** For each kind of object, name the two or three features that make it what it is. A truck: a cab lower than its trailer, a stripe, wheels in pairs. A lamp: a post, a head, a glow. A tree: a trunk and a crown of two balls. An object with none of them is a box, and a row of boxes is nothing in particular. Keep the list; you build from it, and the look checks the picture against it.
3. **Find the loops.** A diorama is alive because two or three things keep their own time: a vehicle on a lap, a door that opens when it arrives, a worker walking back and forth, a flag in the wind, a light that blinks. Give each a period, and make them different (24 s, 12 s, 16 s, 2 s), so the scene never repeats as a whole.
4. **Give the pointer something.** The kernel tilts the camera toward it already. On a hero or a card, add one answer: the object under the pointer lifts, a shelf lights up, the forks go to the level you point at. One answer, not a menu.
5. **Design the still frame.** Reduced motion, thumbnails and the first paint show one second of the loop. Pick the second where the story is visible (truck at the dock, forks raised, flag out) and set `still` to it.
6. **Choose the words.** They go around the stage, not in it: a `title` and a `means` for a hero or card, an `empty` heading, body and button for a mini.
7. **Choose the theme from the page.** `toy` on a warm product page, `soft` on cream, `mono` beside dense text or inside a UI with its own accent, `line` on a minimal or technical page, `night` on a dark one. Then the one accent: the thing the eye should find.

## Three sizes, three jobs

| Size | What it is for | What it must do |
| --- | --- | --- |
| **hero** | the first thing on a landing page or a README | hold attention for ten seconds: several loops, a lap long enough to be watched, a pointer answer |
| **card** | a figure beside text | show one process in a place, readable at 500px, with one pointer answer |
| **mini** | an empty state | read at 160px as a thumbnail, say "nothing here" without a word, move once in a while |

## An empty state

Asked for an empty state (no results, nothing here yet, no messages, nothing in stock, not found), draw the absence, not a sad face.

- **The subject is absence.** Pick the thing that would hold or bring what is missing, and show it holding none: an empty rack with a forklift waiting, a letterbox with its door open, a bare conveyor, a harbour with no boat at the pier, a desk with a lamp and no papers.
- **Rest is the whole figure.** An empty state sits small above a heading and a button, and most people never bring the pointer to it. Judge the still frame first, at 160px.
- **Empty is not blank.** The object is all there and composed; what is missing is what it would hold. One accent colour says where to look.
- **One quiet motion.** A flag that lifts now and then, a beacon that blinks, forks that rise and settle, a door that sways. Not a vehicle doing laps.
- **The words count to zero.** `empty.title` says what is missing ("No messages yet"), `empty.body` says what will fill it, `empty.action` is the one thing to do.

## A scene from a product

Asked to draw a product's world (a logistics app, a CRM, a CI service), take the idea from what the product does, and the colours from what it uses.

- **The place is the product's metaphor made literal.** Shipments become a yard with trucks; a queue becomes a conveyor; a database becomes a rack of drawers; a release becomes a launch pad.
- **One brand colour as the `accent`** in `mono` or `line`; two at most through `palette: { cobalt: '#…', safety: '#…' }` in `toy`, `soft` or `night`. The rest stays the theme's.
- **A mark on a building is allowed in a hero** (one `D.label`), never in a mini. Ask whether the mark is theirs to use.

## A weak concept

Drop it, or fix it before building, when:

- **It is dead at rest.** Nothing to look at until something moves.
- **It needs words.** Without the title nobody would know what it is.
- **It is one object on a plate.** A diorama is a place; even a mini has ground, one or two neighbours (a bush, a stone, a fence) and a base.
- **It is a diagram.** Boxes with lines between them are not a place.
- **Everything moves.** Then nothing does; two or three loops, the rest still.
- **It will not read at its size.** A hero with parts smaller than a wheel; a mini with more than forty.

## Examples

For "an illustration for our shipping product's landing page":

> **Northgate DC.** A distribution centre on a base: the building with three docks, racks beside it, a yard road around. A truck does a lap and docks for five seconds; a forklift carries a pallet from the dock to the rack and comes back empty; a worker walks the aisle; the roof flag stirs. The pointer tilts the camera and lifts whatever it rests on.

For "an empty state for the inbox":

> **Mailbox.** A letterbox on a post in a patch of grass, door open, nothing inside. The flag rests down and lifts every seven seconds as if to check, then settles.

For "no items in stock":

> **Rack.** A three-level pallet rack with every slot bare, and a forklift waiting in front, forks down. The forks rise and settle every nine seconds. The pointer picks a level; its beams light and the forks go there. Mono, with the beams' safety yellow as the accent.
