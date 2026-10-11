// Flow surface controller (READER-MODE-SEPARATION-2 design §B.0, §D.4): the subset of this mode's
// own FoliateView API that the Flow runtime calls. Method names are the G4 channel names
// (surface.highlight, surface.next, surface.goToSection, surface.clearSoftHighlight,
// surface.clearUserBrowsing, content.extractWords …), so the behavior test replaces this module with
// a recording fake. Every call is a no-op (or a neutral value) while no view is mounted.
import type { MutableRefObject } from "react";
import type { FlowFoliateViewAPI } from "./FoliateView";
import type { FoliateWord } from "./helpers/foliateHelpers";
import { jumpFoliateToWordAnchor } from "./helpers/foliateAnchorNavigation";

export interface FlowSurface {
  /** A view is mounted and its API is populated (legacy `foliateApiRef.current` truthy). */
  isReady(): boolean;
  /** Loaded-slice word strings, or null while no view is mounted (legacy getEffectiveWords fallback). */
  getWords(): readonly string[] | null;
  /** Loaded-slice words with their block metadata (natural-chunk source), or null while no view is mounted. */
  getFoliateWords(): readonly FoliateWord[] | null;
  /** Legacy extractFoliateWords: refresh this view's word cache. */
  extractWords(): void;
  /** Legacy getEffectiveParagraphBreaks (foliate branch) as a sorted array; [] while no view is mounted. */
  getParagraphBreaks(): readonly number[];
  /** Legacy foliateApiRef.current.highlightWordByIndex; false while no view is mounted. */
  highlight(wordIndex: number, kind?: "flow" | "narrate", options?: { allowMotion?: boolean; forceMotion?: boolean }): boolean;
  /** Legacy foliateApiRef.current.next() (empty-words retry, pause-on-miss page turn). */
  next(): void;
  goToSection(sectionIndex: number): Promise<void>;
  waitForSectionReady(sectionIndex?: number | null): Promise<number | null>;
  findFirstVisibleWordIndex(): number;
  isUserBrowsing(): boolean;
  clearUserBrowsing(): void;
  clearSoftHighlight(): void;
  /** TOC jump (legacy foliateApiRef.current.goTo(href)). */
  goTo(href: string): void;
  /** Legacy jumpFoliateToWordAnchor over this view, flow style hint. */
  jumpToWordAnchor(wordIndex: number): Promise<boolean>;
}

export function createFlowSurface(viewApiRef: MutableRefObject<FlowFoliateViewAPI | null>): FlowSurface {
  const api = () => viewApiRef.current;
  return {
    isReady: () => api() !== null,
    getWords: () => api()?.getWords().map((w) => w.word) ?? null,
    getFoliateWords: () => api()?.getWords() ?? null,
    extractWords: () => { api()?.getWords(); },
    getParagraphBreaks: () => {
      const breaks = api()?.getParagraphBreaks();
      return breaks ? [...breaks].sort((a, b) => a - b) : [];
    },
    highlight: (wordIndex, kind, options) => api()?.highlightWordByIndex(wordIndex, kind, options) ?? false,
    next: () => api()?.next(),
    goToSection: (sectionIndex) => Promise.resolve(api()?.goToSection(sectionIndex)),
    waitForSectionReady: (sectionIndex) => Promise.resolve(api()?.waitForSectionReady(sectionIndex) ?? null),
    findFirstVisibleWordIndex: () => api()?.findFirstVisibleWordIndex() ?? -1,
    isUserBrowsing: () => api()?.isUserBrowsing() ?? false,
    clearUserBrowsing: () => api()?.clearUserBrowsing(),
    clearSoftHighlight: () => api()?.clearSoftHighlight(),
    goTo: (href) => { void api()?.goTo(href); },
    jumpToWordAnchor: (wordIndex) => jumpFoliateToWordAnchor(api(), wordIndex, "flow"),
  };
}
