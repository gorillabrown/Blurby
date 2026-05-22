export type FoliateAnchorStyleHint = "flow" | "narrate" | undefined;

export interface FoliateAnchorNavigationApi {
  clearUserBrowsing?: () => void;
  highlightWordByIndex?: (
    wordIndex: number,
    styleHint?: "flow" | "narrate",
    options?: { allowMotion?: boolean },
  ) => boolean;
  getSectionForWordIndex?: (wordIndex: number) => number | null;
  goToSection?: (sectionIndex: number) => Promise<void> | void;
  waitForSectionReady?: (sectionIndex?: number | null, timeoutMs?: number) => Promise<number | null>;
}

export async function jumpFoliateToWordAnchor(
  api: FoliateAnchorNavigationApi | null | undefined,
  wordIndex: number,
  styleHint?: FoliateAnchorStyleHint,
): Promise<boolean> {
  if (!api) return false;
  if (typeof wordIndex !== "number" || !Number.isFinite(wordIndex) || wordIndex < 0) return false;

  api.clearUserBrowsing?.();

  const hit = api.highlightWordByIndex?.(wordIndex, styleHint, { allowMotion: true }) ?? false;
  if (hit) return true;

  const sectionIndex = api.getSectionForWordIndex?.(wordIndex) ?? null;
  if (sectionIndex == null) return false;

  await Promise.resolve(api.goToSection?.(sectionIndex));
  await api.waitForSectionReady?.(sectionIndex);

  return api.highlightWordByIndex?.(wordIndex, styleHint, { allowMotion: true }) ?? false;
}
