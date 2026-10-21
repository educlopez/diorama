# Public Diorama release surfaces

## Home
- Present two independent skills under one identity: SVG and Worlds. Real renderer-generated artwork, distinct install commands and guide links.
- No WebGL runtime on the home. The SVG live example remains, clearly labelled SVG. No invented product screenshots, metrics or testimonials.
- Reuse existing neutral palette, typography and spacing. Static surrounding UI; scene motion stays inside previews. At 320px, navigation wraps rather than clipping.

## Worlds
- Four original scene choices, four live finishes, pause and optional playback speed. Finish switches preserve time/pose; one active GPU world, no hidden mounts.
- Default terrain is a flat irregular cutout, never an automatic soil plinth.
- Real revisioned posters for gallery and fallback; do not use query-string image sources or weaken the site's image policy.
- Definitive direct-subdirectory installation command, invocation and link to `/docs/worlds`. No unpublished/local-prototype claims.

## Guides and discovery
- `/docs` clearly covers SVG and routes Worlds users to `/docs/worlds`.
- Worlds guide covers installation, one-time dependencies, slash/plain-language invocation, four finishes, real output checks, embedding, host pause controls and explicit bundle/WebGL tradeoffs.
- Metadata, footer, README, llms.txt, sitemap and robots cover both skills consistently.

## Release gates
- Consistent 1.1.0 versions, changelog, MIT notices, clean isolated CLI installation and build of both skills.
- Real offline browser checks across seven worlds and all four finishes; legacy SVG validation and unchanged renderer/API.
- Production build/typecheck, exact copied commands, mobile layouts, cache/readiness, iframe origin/source validation, reduced motion, fallback and clean assets.
- Publish through existing GitHub/Vercel flow only after verification. No permission expansion to repair blocked automation.
