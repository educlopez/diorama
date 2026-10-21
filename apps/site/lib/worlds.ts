// Bump when generated poster pixels change so Next/browser caches cannot serve old artwork.
export const WORLD_POSTER_REVISION = "flat-ground-1";
export const WORLDS = [
  { name: "florist", title: "A bouquet before closing", place: "The flower stall", description: "A florist gathers and turns a bouquet while a customer waits. A little care, made visible.", duration: "4.8 seconds" },
  { name: "pottery-studio", title: "The patient wheel", place: "The pottery studio", description: "A wheel turns. The potter shifts their weight and follows the clay with both hands.", duration: "6 seconds" },
  { name: "bakery", title: "Before the first loaf", place: "The morning bakery", description: "Flour on the bench. Both hands on the rolling pin. Bread cooling beside the brick oven.", duration: "4.4 seconds" },
  { name: "observatory", title: "One more degree", place: "The hilltop observatory", description: "A small adjustment, a patient observer. Brass optics and a star chart on a quiet hilltop.", duration: "5.6 seconds" },
] as const;
export type WorldName = (typeof WORLDS)[number]["name"];
