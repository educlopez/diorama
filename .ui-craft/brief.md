# Diorama Worlds: first visual proof

## Purpose
A second, independently invocable skill inside the existing Diorama repository. Narrative miniature worlds for the web, not a replacement for the SVG illustration skill.

## Visual direction
User references: a raised cricket ground with turf stripes, fencing, trees and animated players; pixelated basketball and juggling vignettes. Fixed orthographic camera; white negative space; irregular ground detail; articulated people with an actual action, not universal idle bobbing. Four finishes, miniature, pixel, halftone and blueprint, share scene geometry and clock.

## Scope
First prove scenes and reusable kit, then integrate a dedicated landing into the existing site. No separate repository or brand. No changes to the SVG kernel or existing generated figures. No publication in this pass.

## Acceptance
Open generated HTML offline. Render all four finishes at desktop and mobile widths. Inspect screenshots, not just console results. Check a full cycle and its seam, deterministic stills, reduced motion, pause/resume, background/offscreen suspension, cleanup and missing-WebGL fallback. Run legacy build/validation too.

## Learned constraints
- Keep the new objective as another skill within Diorama (Edu, 2026-10-21).
- Test the skill's actual generated output, not just its instructions (Edu, 2026-10-21).
- Video appearance does not establish which renderer produced the original. Treat it as art direction, not verified Three.js provenance.

## Follow-up approved (2026-10-21)
Edu requested completing the remaining visual refinement and shared-site Worlds section. Basketball currently feels too slow: natural, readable activity takes priority over contemplative slow motion. Fix event timing and any frame-rate-dependent slowdown; expose optional playback rate without relying on it to repair defaults. Preserve white/near-black identity, existing fonts and SVG routes. Add /worlds as a product-forward live-scene page, not a second brand. No deployment or push requested.

Craft Read: product-forward, restrained neutral palette, existing typography, medium composition variance. Signature: switch miniature/pixel while preserving the action and clock. Scene motion supplies the expressive movement; surrounding UI stays still.

## Human refinement (2026-10-21)
Edu wants original examples, not more recreations of supplied sports/juggling references. Humans must be closer to those references: slimmer adult proportions and purposeful, coordinated movement. New default showcase subjects: florist workbench and ceramics studio. Use smaller heads, tapered bodies/limbs, shoulder/elbow/knee articulation, planted feet, torso weight shifts and actual hand/prop contact. Inspect close views as well as whole scenes. Do not claim video fidelity from tests alone.

## Expanded collection and finishes (2026-10-21)
Edu approved the adult humans and original craft scenes, and requested more examples and attractive effects. Extend the same shared scene runtime with bakery and hilltop observatory subjects, plus halftone print and blueprint finishes. Keep a white stage outside the scene, accessible controls, paused-pose continuity and natural 1× timing. Finish effects must remain live, deterministic and reusable by the skill, not baked screenshots. Preserve existing site typography, tokens and SVG routes.

## Ground silhouette correction (2026-10-21)
Edu explicitly rejected the always-extruded platform: the chosen pixel references have a flat irregular edge, not a brown vertical display slab. Default terrain must be a flat cutout, with a sparse broken fringe dissolving into white. Do not substitute a thin continuous border or generic floating island. Keep genuine local floor/terrace details when narratively justified; thick enclosing soil walls require explicit user request. Update the shared helper and skill instructions, not only individual renders.

## Public release (2026-10-21)
Edu authorized preparing and publishing Diorama with both skills. Home must present both, not describe only SVG; each skill needs a definitive install command, clear invocation, setup and guide. Preserve the existing identity and SVG API. Home uses real SVG and Worlds artwork without loading the WebGL runtime. Existing prototype/unpublished copy is superseded. Follow repository personal Git identity and release workflow; do not expand GitHub Actions permissions to repair a blocked bot.
Craft Read: same restrained neutral site, existing typography, variance 5. Signature is two real visual paths (SVG / Worlds) leading to their own renderer and installation, not generic feature cards. CRAFT=7, MOTION=3 for surrounding UI. Existing scene motion remains inside previews only.
