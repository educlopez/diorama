import data from "./figures.json";

export type Figure = {
  name: string;
  size: "hero" | "card" | "mini";
  title: string | null;
  means: string | null;
  theme: { base: string; accent: string | null };
  empty: { title: string | null; body: string | null; action: string | null } | null;
  lines: number;
  blurb: string;
};

export const FIGURES = data as Figure[];
export const byName = (name: string) => FIGURES.find((f) => f.name === name)!;
export const ASPECT: Record<Figure["size"], string> = { hero: "3 / 2", card: "4 / 3", mini: "1 / 1" };
export const pageOf = (name: string, theme?: string | null) => `/examples/${name}.html?embed${theme ? `&theme=${theme}` : ""}`;
