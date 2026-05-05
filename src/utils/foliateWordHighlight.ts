export type FoliateWordHighlightClass = "page-word--flow-cursor" | "page-word--highlighted";

export function resolveFoliateWordHighlightClass(
  readingMode: string | undefined,
  styleHint?: "flow",
): FoliateWordHighlightClass {
  return styleHint === "flow" || readingMode === "flow" || readingMode === "narrate"
    ? "page-word--flow-cursor"
    : "page-word--highlighted";
}
