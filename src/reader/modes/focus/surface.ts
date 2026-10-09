// Focus surface controller (READER-MODE-SEPARATION-2 design §B.0, §D.4): the subset of this mode's
// own FoliateView API that the Focus runtime calls. Method names are the G4 channel names
// (surface.next, surface.goToSection, surface.clearSoftHighlight, surface.clearUserBrowsing,
// content.extractWords …), so the behavior test replaces this module with a recording fake. Every
// call is a no-op (or a neutral value) while no view is mounted.
import type { MutableRefObject } from "react";
import type { FocusFoliateViewAPI } from "./FoliateView";
import { jumpFoliateToWordAnchor } from "./helpers/foliateAnchorNavigation";

export interface FocusSurface {
  /** A view is mounted and its API is populated. */
  isReady(): boolean;
  /** Loaded-slice word strings, or null while no view is mounted (legacy getEffectiveWords fallback). */
  getWords(): readonly string[] | null;
  /** Legacy extractFoliateWords: refresh this view's word cache. */
  extractWords(): void;
  /** Legacy getEffectiveParagraphBreaks (foliate branch) as a sorted array; [] while no view is mounted. */
  getParagraphBreaks(): readonly number[];
  /** Legacy foliateApiRef.current.next() (empty-words retry). */
  next(): void;
  goToSection(sectionIndex: number): void;
  findFirstVisibleWordIndex(): number;
  isUserBrowsing(): boolean;
  clearUserBrowsing(): void;
  clearSoftHighlight(): void;
  /** TOC jump (legacy foliateApiRef.current.goTo(href)). */
  goTo(href: string): void;
  /** Legacy jumpFoliateToWordAnchor over this view. */
  jumpToWordAnchor(wordIndex: number): Promise<boolean>;
}

export function createFocusSurface(viewApiRef: MutableRefObject<FocusFoliateViewAPI | null>): FocusSurface {
  const api = () => viewApiRef.current;
  return {
    isReady: () => api() !== null,
    getWords: () => api()?.getWords().map((w) => w.word) ?? null,
    extractWords: () => { api()?.getWords(); },
    getParagraphBreaks: () => {
      const breaks = api()?.getParagraphBreaks();
      return breaks ? [...breaks].sort((a, b) => a - b) : [];
    },
    next: () => api()?.next(),
    goToSection: (sectionIndex) => { api()?.goToSection(sectionIndex).catch(() => {}); },
    findFirstVisibleWordIndex: () => api()?.findFirstVisibleWordIndex() ?? -1,
    isUserBrowsing: () => api()?.isUserBrowsing() ?? false,
    clearUserBrowsing: () => api()?.clearUserBrowsing(),
    clearSoftHighlight: () => api()?.clearSoftHighlight(),
    goTo: (href) => { void api()?.goTo(href); },
    jumpToWordAnchor: (wordIndex) => jumpFoliateToWordAnchor(api(), wordIndex),
  };
}
