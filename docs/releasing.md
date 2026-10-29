# Release Diorama

Diorama is one repository with independently selectable skills, each in its own folder under `skills/<name>/` (today `skills/diorama`, `skills/diorama-worlds`, `skills/diorama-pixel` and `skills/diorama-wash`). Never put a `SKILL.md` at the repository root: the skills CLI stops there and hides everything under `skills/`; `scripts/release-check.mjs` fails if one appears. A new skill only needs its own folder with a `SKILL.md`. Versions follow SemVer and cover the whole repository. Neither renderer is published as an npm package: `npx skills add` installs instructions and local resources from GitHub. The private package files describe pinned build tools.

## Before a release

1. Keep the SVG renderer and existing figure API compatible. Test both skill paths, not just the website.
2. Run `node scripts/release-check.mjs`, the YAML/frontmatter parser, SVG validation (`node skills/diorama/scripts/validate.mjs` on each of `skills/diorama/examples/*.js`), `npm test --prefix skills/diorama-worlds`, Pixel validation and look (`npm ci --ignore-scripts --prefix skills/diorama-pixel` once, then `node skills/diorama-pixel/scripts/validate.mjs` and `look.mjs` on each of `skills/diorama-pixel/examples/*.js`), Wash validation and look (`npm ci --ignore-scripts --prefix skills/diorama-wash` once, then `node skills/diorama-wash/scripts/validate.mjs` and `look.mjs` on each of `skills/diorama-wash/examples/*.js`), and the site production build.
3. Run the production-site browser suite. Inspect actual desktop/mobile output, the home’s three commands, the three guides, all Worlds finishes, the live Pixel scenes, reduced motion, fallback and legacy routes. An assertion count does not establish art quality or physical-device performance.
4. Install the candidate skill in an isolated project with the real skills CLI, then install its pinned dependencies and build/check an example from the installed copy. Do not overwrite a maintainer’s global skills to test packaging.
5. Update `CHANGELOG.md`, `version.txt`, `.release-please-manifest.json`, the package files (`apps/site`, `skills/diorama-worlds`, `skills/diorama-pixel`, `skills/diorama-wash`) and the version and root package version in each of their lockfiles consistently. `scripts/release-check.mjs` enforces agreement. Release-please’s extra files maintain these for later automated release PRs.
6. When poster pixels change, use a new `WORLD_POSTER_REVISION` (Worlds) or `PIXEL_POSTER_REVISION` (Pixel) directory and real regenerated images. The site rejects local image query strings; do not weaken that policy for cache busting.
7. Never commit `node_modules`, generated standalone HTML, `.next`, local test artifacts, credentials or machine-specific output paths. Keep the MIT licenses with the installed Worlds skill and the bundled Three.js notice in generated HTML.

## Publish

Feature PR titles use Conventional Commits (`feat:` for a minor release). Pull requests are squash-merged with the PR title as the commit title, the only merge method the repository allows, so each PR is one entry in the changelog. The normal release-please flow opens a release PR; merging it publishes a tag and a GitHub release titled `Diorama vX.Y.Z`. Keep the personal Git identity required by `CLAUDE.md`.

Release-please needs the repository setting that lets GitHub Actions create pull requests (enabled 2026-10-21). If it is ever turned off, release-please fails with "GitHub Actions is not permitted to create or approve pull requests". For an explicitly authorized release outside that flow, the existing **Release by hand** workflow accepts a version and optional exact target commit; it validates that the version has a changelog section, then creates the tag and release from those notes. Use it after the release-ready PR has passed checks and merged. Do not duplicate an existing release or tag; inspect first.

Vercel is linked to this repository with Root Directory `apps/site`. A main-branch merge may deploy production. Verify the deployment status, production `/`, `/worlds`, both guides and the public GitHub install source. A successful local build is not proof of a live deployment.
