# Release Diorama

Diorama is one repository with two independently selectable skills. Versions follow SemVer; Worlds is included in repository release 1.1.0. Neither renderer is published as an npm package: `npx skills add` installs instructions and local resources from GitHub. The private package files describe pinned build tools.

## Before a release

1. Keep the SVG renderer and existing figure API compatible. Test both skill paths, not just the website.
2. Run `node scripts/release-check.mjs`, the YAML/frontmatter parser, SVG validation, `npm test --prefix skills/diorama-worlds`, and the site production build.
3. Run the production-site browser suite. Inspect actual desktop/mobile output, the home’s two commands, both guides, all Worlds finishes, reduced motion, fallback and legacy routes. An assertion count does not establish art quality or physical-device performance.
4. Install the candidate skill in an isolated project with the real skills CLI, then install its pinned dependencies and build/check an example from the installed copy. Do not overwrite a maintainer’s global skills to test packaging.
5. Update `CHANGELOG.md`, `version.txt`, `.release-please-manifest.json`, both package files and both lockfile root versions consistently. `scripts/release-check.mjs` enforces agreement. Release-please’s extra files maintain these for later automated release PRs.
6. When poster pixels change, use a new `WORLD_POSTER_REVISION` directory and real regenerated images. The site rejects local image query strings; do not weaken that policy for cache busting.
7. Never commit `node_modules`, generated standalone HTML, `.next`, local test artifacts, credentials or machine-specific output paths. Keep the MIT licenses with the installed Worlds skill and the bundled Three.js notice in generated HTML.

## Publish

Feature PR titles use Conventional Commits (`feat:` for a minor release). The normal release-please flow opens a release PR; merging it publishes a tag and GitHub release. Keep the personal Git identity required by `CLAUDE.md`.

The repository currently disallows GitHub Actions creating PRs. That setting can block release-please even with its declared workflow permissions. Do not silently expand permissions. For an explicitly authorized release, the existing **Release by hand** workflow accepts a version and optional exact target commit; it validates that the version has a changelog section, then creates the tag and release from those notes. Use it after the release-ready PR has passed checks and merged. Do not duplicate an existing release or tag; inspect first.

Vercel is linked to this repository with Root Directory `apps/site`. A main-branch merge may deploy production. Verify the deployment status, production `/`, `/worlds`, both guides and the public GitHub install source. A successful local build is not proof of a live deployment.
