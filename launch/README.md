# Launch assets

Two figures the skill made from new briefs, by agents that read only `SKILL.md`. They are not part of the shipped examples; they are here for the launch video and posts.

| File | Brief | Size · theme |
| --- | --- | --- |
| `powder.js` | "An animated hero for Powder, an app to book ski lessons: a snowy mountain village with a chairlift, skiers coming down, chalets with warm windows, pine trees." | hero · toy |
| `turntable.js` | "A small figure for a music app's playlists screen, hairline style on white, brand colour #7c5cff as the only accent, something moving gently." | mini · line, accent `#7c5cff` |

Build either one into a page:

```sh
node scripts/build.mjs launch/powder.js      # writes diorama-powder.html
node scripts/look.mjs launch/turntable.js    # build, validate and the look sheet
```

Open a built page at an exact second, still: `diorama-powder.html?still&t=14`. Add `&theme=night` (or soft, mono, line) for another look, `&embed` for the bare transparent stage.
