import data from "./dither.json";

export type DitherScene = { name: string; title: string; means: string; hint: string; duration: number; bytes: number; lines: number };

/** The dither skill's examples, written by scripts/dither.mjs at prebuild. */
export const DITHER = data as DitherScene[];
/** Built-page cap in skills/diorama-dither/scripts/validate.mjs (70 * 1024). */
export const DITHER_PAGE_BYTES = 71680;
/** Scene source cap in that same validator. */
export const DITHER_LINE_CAP = 260;
// Bump when the committed poster pixels change so caches cannot serve old artwork.
export const DITHER_POSTER_REVISION = "v1";
export const ditherPoster = (name: string) => `/dither/posters/${DITHER_POSTER_REVISION}/${name}.png`;
export const ditherPage = (name: string, embed = true) => `/dither/${name}.html${embed ? "?embed" : ""}`;
