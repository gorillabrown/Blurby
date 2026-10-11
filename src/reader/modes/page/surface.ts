// Page surface controller (READER-MODE-SEPARATION-2 design §B.0, §D.4): the subset of this mode's
// own FoliateView API that the Page runtime calls. Method names are the G4 channel names
// (surface.highlight, surface.clearSoftHighlight, surface.clearUserBrowsing, content.extractWords …),
// so the behavior test replaces this module with a recording fake. Every call is a no-op (or a
// neutral value) while no view is mounted.
import type { MutableRefObject } from "react";
import type { PageFoliateHighlightOptions, PageFoliateViewAPI } from "./FoliateView";
import { jumpFoliateToWordAnchor } from "./helpers/foliateAnchorNavigation";

export interface PageSurface {
  /** A view is mounted and its API is populated. */
  isReady(): boolean;
  /** Loaded-slice word strings, or null while no view is mounted (legacy getEffectiveWords fallback). */
  getWords(): readonly string[] | null;
  /** Legacy extractFoliateWords: refresh this view's word cache. */
  extractWords(): void;
  highlight(wordIndex: number, kind?: "flow" | "narrate", options?: PageFoliateHighlightOptions): boolean;
  findFirstVisibleWordIndex(): number;
  isUserBrowsing(): boolean;
  clearUserBrowsing(): void;
  applySoftHighlight(wordIndex: number): boolean;
  clearSoftHighlight(): void;
  /** TOC jump (legacy foliateApiRef.current.goTo(href)). */
  goTo(href: string): void;
  /** Legacy jumpFoliateToWordAnchor over this view. */
  jumpToWordAnchor(wordIndex: number): Promise<boolean>;
}

export function createPageSurface(viewApiRef: MutableRefObject<PageFoliateViewAPI | null>): PageSurface {
  const api = () => viewApiRef.current;
  return {
    isReady: () => api() !== null,
    getWords: () => api()?.getWords().map((w) => w.word) ?? null,
    extractWords: () => { api()?.getWords(); },
    highlight: (wordIndex, kind, options) => api()?.highlightWordByIndex(wordIndex, kind, options) ?? false,
    findFirstVisibleWordIndex: () => api()?.findFirstVisibleWordIndex() ?? -1,
    isUserBrowsing: () => api()?.isUserBrowsing() ?? false,
    clearUserBrowsing: () => api()?.clearUserBrowsing(),
    applySoftHighlight: (wordIndex) => api()?.applySoftHighlight(wordIndex) ?? false,
    clearSoftHighlight: () => api()?.clearSoftHighlight(),
    goTo: (href) => { void api()?.goTo(href); },
    jumpToWordAnchor: (wordIndex) => jumpFoliateToWordAnchor(api(), wordIndex),
  };
}
