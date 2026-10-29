# Art direction

The picture is a watercolor on one sheet. Judge a still against this list before handing it over. If a point fails, change the scene.

## Paper

Warm cream, a little darker in the tooth and lighter on the fibers. The grain is visible on the bare margin and through every wash, because the colour is laid over the paper rather than replacing it. Do not cover the sheet to the frame.

## Glazes

A wash is translucent. Two of them overlap by multiplying, so a blue over a yellow goes greener and darker, and the paper still shows in the thin parts. Light, wide glazes go down first (a low `layer`). Smaller, heavier glazes go on top. `load` is how much pigment is in the water: around 0.3–0.5 for a first wash, higher only for a dark accent. A load near 1 with no overlap reads as flat paint.

## Edge

The boundary blooms outward and is irregular. `bleed` is that bloom, in world units (the sheet runs from -1 to 1). A broad wash wants something near 0.05–0.08. Inside the bloom, a thin darker line is the wet rim: leave `wet` high on washes. A shape whose edge is a clean geometric stroke is not done.

## Inside the wash

Density is not even. Pigment pools in places and thins in others. In the darker passages it granulates: specks of pigment in the tooth of the paper. `gran` does that. Keep it low on a pale sky and high on a dark roof, a deep pool, or hair.

## Reserves

Some of the paper is never painted: a highlight on fruit, a cloud, the light on a cheek, the margin around the subject. Leave a gap, or lift pigment back toward the paper with `Wash.lift`. A painted white disc is not a reserve.

## Strokes and ink

A brush stroke has a direction. Use `Wash.stroke` along a curve, not a row of dots. Ink is a thin, broken, dark line of uneven width (`Wash.ink`), used for a roof, a jaw, a stem, or a reed. A few lines. A contour around every shape turns the picture back into a drawing.

## Subject

The subject should be obvious at the size of the page: three roofs, a face, a poppy, a boat on a pond. Palette changes with the subject. Do not reuse the same blue-green sheet for every scene.

## Motion

One clear motion is enough: a boat, a cloud, smoke, a stem, a figure. It is a function of `t` and it returns to the start at `duration`. A click drops one extra wet stain. That stain is extra state; the declared marks are not.
