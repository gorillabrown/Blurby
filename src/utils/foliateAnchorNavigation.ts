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
  if (hit) {
    // In paginated mode (CSS columns), scrollToAnchor may not take effect
    // synchronously. Yield a frame to let the layout settle, then re-apply
    // the highlight+scroll so the page reliably navigates to the word.
    await new Promise((r) => setTimeout(r, 60));
    api.clearUserBrowsing?.();
    api.highlightWordByIndex?.(wordIndex, styleHint, { allowMotion: true });
    return true;
  }

  const sectionIndex = api.getSectionForWordIndex?.(wordIndex) ?? null;
  if (sectionIndex == null) return false;

  await Promise.resolve(api.goToSection?.(sectionIndex));
  await api.waitForSectionReady?.(sectionIndex);

  return api.highlightWordByIndex?.(wordIndex, styleHint, { allowMotion: true }) ?? false;
}
