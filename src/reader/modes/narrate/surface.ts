// Narrate surface controller (READER-MODE-SEPARATION-2 design §B.0, §D.4): the subset of this mode's
// own FoliateView API that the Narrate runtime calls. Method names are the G4 channel names
// (surface.highlight, surface.next, surface.goToSection, surface.clearSoftHighlight,
// surface.clearUserBrowsing, content.extractWords …), so the behavior test replaces this module with
// a recording fake. Every call is a no-op (or a neutral value) while no view is mounted.
import type { MutableRefObject } from "react";
import type { NarrateFoliateHighlightOptions, NarrateFoliateViewAPI } from "./FoliateView";
import type { FoliateWord } from "./helpers/foliateHelpers";
import { jumpFoliateToWordAnchor } from "./helpers/foliateAnchorNavigation";

export interface NarrateSurface {
  /** A view is mounted and its API is populated (legacy `foliateApiRef.current` truthy). */
  isReady(): boolean;
  /** Loaded-slice word strings, or null while no view is mounted (legacy getEffectiveWords fallback). */
  getWords(): readonly string[] | null;
  /** Loaded-slice words with their block metadata (natural-chunk source), or null while no view is mounted. */
  getFoliateWords(): readonly FoliateWord[] | null;
  /** Section index of the first loaded word (legacy HOTFIX-6 `getWords()?.[0]?.sectionIndex`), or null. */
  getFirstLoadedSectionIndex(): number | null;
  /** Legacy extractFoliateWords: refresh this view's word cache. */
  extractWords(): void;
  /** Legacy foliateApiRef.current.highlightWordByIndex; false while no view is mounted. */
  highlight(wordIndex: number, kind?: "flow" | "narrate", options?: NarrateFoliateHighlightOptions): boolean;
  /** Legacy foliateApiRef.current.next() (empty-words retry, section-end fallback). */
  next(): void;
  getSectionForWordIndex(wordIndex: number): number | null;
  goToSection(sectionIndex: number): Promise<void>;
  waitForSectionReady(sectionIndex?: number | null): Promise<number | null>;
  findFirstVisibleWordIndex(): number;
  isUserBrowsing(): boolean;
  clearUserBrowsing(): void;
  clearSoftHighlight(): void;
  /** TOC jump (legacy foliateApiRef.current.goTo(href)). */
  goTo(href: string): void;
  /** Legacy jumpFoliateToWordAnchor over this view, narrate style hint. */
  jumpToWordAnchor(wordIndex: number): Promise<boolean>;
}

export function createNarrateSurface(viewApiRef: MutableRefObject<NarrateFoliateViewAPI | null>): NarrateSurface {
  const api = () => viewApiRef.current;
  return {
    isReady: () => api() !== null,
    getWords: () => api()?.getWords().map((w) => w.word) ?? null,
    getFoliateWords: () => api()?.getWords() ?? null,
    getFirstLoadedSectionIndex: () => api()?.getWords()?.[0]?.sectionIndex ?? null,
    extractWords: () => { api()?.getWords(); },
    highlight: (wordIndex, kind, options) => api()?.highlightWordByIndex(wordIndex, kind, options) ?? false,
    next: () => api()?.next(),
    getSectionForWordIndex: (wordIndex) => api()?.getSectionForWordIndex(wordIndex) ?? null,
    goToSection: (sectionIndex) => Promise.resolve(api()?.goToSection(sectionIndex)),
    waitForSectionReady: (sectionIndex) => Promise.resolve(api()?.waitForSectionReady(sectionIndex) ?? null),
    findFirstVisibleWordIndex: () => api()?.findFirstVisibleWordIndex() ?? -1,
    isUserBrowsing: () => api()?.isUserBrowsing() ?? false,
    clearUserBrowsing: () => api()?.clearUserBrowsing(),
    clearSoftHighlight: () => api()?.clearSoftHighlight(),
    goTo: (href) => { void api()?.goTo(href); },
    jumpToWordAnchor: (wordIndex) => jumpFoliateToWordAnchor(api(), wordIndex, "narrate"),
  };
}
