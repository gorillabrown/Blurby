// ── foliate-js type definitions ───────────────────────────────────────────────
// These types model the foliate-js custom element API used in FoliatePageView.
// foliate-js has no published @types package — these are hand-authored from
// observed usage in FoliatePageView.tsx and the foliate-js source.

export interface FoliateTocItem {
  label: string;
  href: string;
  subitems?: FoliateTocItem[];
}

export interface FoliateBook {
  sections: Array<{ id: string; href: string; linear: boolean }>;
  toc: FoliateTocItem[];
  metadata: { title?: string; creator?: string; language?: string };
}

export interface RelocateDetail {
  cfi: string;
  fraction: number;
  tocItem?: FoliateTocItem;
  pageItem?: { current: number; total: number };
}

export interface FoliateRenderer {
  getContents(): Array<{ doc: Document; index: number }>;
  next(): void;
  prev(): void;
  setAttribute(key: string, value: string): void;
  element?: { shadowRoot?: ShadowRoot };
}

export interface FoliateViewElement extends HTMLElement {
  open(file: File): Promise<void>;
  init(options?: { lastLocation?: string }): Promise<void>;
  goTo(target: string): Promise<unknown>;
  goToFraction(frac: number): Promise<void>;
  getCFI(sectionIndex: number, range: Range): string;
  book: FoliateBook;
  renderer: FoliateRenderer;
  close?(): void;
}
