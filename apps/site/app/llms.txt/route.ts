import { FIGURES } from "@/lib/figures";
import { INSTALL, REPO, THEME_ROWS } from "@/lib/site";

export const dynamic = "force-static";

/** A plain-text summary for agents and crawlers, in the llms.txt convention. */
export function GET() {
  const text = `# Diorama

> A Claude Code skill that builds small animated isometric 3D scenes for the web: a hero for a landing page, a card for docs, a mini figure for any small spot (an empty state, a feature list, a 404). One self-contained HTML file on three.js r128 (or on three-lite, a 44 KB subset, with the --lite build option, in beta). Five themes (${THEME_ROWS.map((t) => t.name).join(", ")}), every field overridable.

Install: ${INSTALL}
Repository: ${REPO}
Skill: ${REPO}/blob/main/SKILL.md

## Examples
${FIGURES.map((f) => `- ${f.name} (${f.size}, ${f.theme.base}): ${f.means}`).join("\n")}

## Pages
- /figures: the examples, live, in every theme
- /docs: install, prompts, sizes, themes, the figure file, scripts, embedding
`;
  return new Response(text, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
