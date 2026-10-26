// APP-TABS-1: the library window's four tabs, and which of the two document tabs each library item lives in.
// The home is derived from the item's type and stored only when the user moves the item, so loading a library
// rewrites no record.
import type { BlurbyDoc } from "../types";

export const APP_TABS = ["library", "newsroom", "podcasts", "marketplace"] as const;
export type AppTab = (typeof APP_TABS)[number];
export type DocHome = "library" | "newsroom";

export const APP_TAB_LABELS: Record<AppTab, string> = {
  library: "Library",
  newsroom: "Newsroom",
  podcasts: "Podcasts",
  marketplace: "Marketplace",
};

export function isAppTab(x: unknown): x is AppTab {
  return typeof x === "string" && (APP_TABS as readonly string[]).includes(x);
}

function isDocHome(x: unknown): x is DocHome {
  return x === "library" || x === "newsroom";
}

type HomeFields = Pick<BlurbyDoc, "source" | "ext"> & { home?: unknown };

/** Articles and pasted text go to Newsroom; books, PDFs, dropped files (manual with an ext) and the sample to the Library. */
export function defaultHome(doc: HomeFields): DocHome {
  if (doc.source === "url" || (doc.source === "manual" && !doc.ext)) return "newsroom";
  return "library";
}

export function homeOf(doc: HomeFields): DocHome {
  return isDocHome(doc.home) ? doc.home : defaultHome(doc);
}

/** The ids of the non-deleted docs in each home, in input order. */
export function partitionByHome(docs: Array<HomeFields & { id: string; deleted?: boolean }>): Record<DocHome, string[]> {
  const out: Record<DocHome, string[]> = { library: [], newsroom: [] };
  for (const doc of docs) {
    if (!doc || doc.deleted) continue;
    out[homeOf(doc)].push(doc.id);
  }
  return out;
}
