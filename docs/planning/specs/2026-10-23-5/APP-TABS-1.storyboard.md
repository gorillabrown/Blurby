# APP-TABS-1 — Storyboard (alignment record)

**Item:** APP-TABS-1, "Four tabs: Library, Newsroom, Podcasts, Marketplace". Seq 100, already on the master roadmap, so this record is attached to its card rather than held in the holding bay.
**Run by:** Blurby.Roadmap with the owner, 2026-10-23 (`/virtuoso:storyboard APP-TABS-1`).
**Verdict:** Aligned — 2026-10-23. The owner approved the draft stub: "advance".

## Outcome
Blurby opens to a tab bar at the top: Library · Newsroom · Podcasts · Marketplace.
- Books and PDFs live in the Library, and articles live in Newsroom. Any item can be moved between the two by hand.
- At the right end of the tab bar sit three icons: filter, then search, then settings.
  - Filter opens a dropdown of the tab's filters, on hover or on click or Enter.
  - Search covers every tab, and each result is labelled with its tab.
- Podcasts is built now. Until PODCAST-SOURCE-1 lands it shows an empty state. Marketplace shows a "Coming soon" banner.

## You said (owner, 2026-10-23)
- "Marketplace is coming soon. Podcast is built now."
- Tab bar placement: (a) top, under the title bar.
- What moves: (a) articles only, "though, one can override and manually send something to a different place".
- Search: (b) everything, with results labelled by tab.
- Settings and search: (a) on the tab bar's right end.
- Filters: (a) each tab keeps its own filters, "but it's a drop down when you hover over a filter icon, furthest to the left icon right aligned".
- Hover-only concern: (a) hover opens it, and click or Enter also opens it.
- Write-back: "yes". Frames: "yes". Draft stub: "advance".

## Assumptions (all confirmed by the owner's "yes" to the write-back)
1. The reader stays full-screen with the tab bar hidden, and closing it returns to the tab it was opened from.
2. The app opens on the last-used tab, and on the Library the first time.
3. The Podcasts tab shows "No podcasts yet" until PODCAST-SOURCE-1 lands, not "Coming soon".
4. Ctrl+1 to Ctrl+4 switch tabs.
5. Every theme, E-ink included, styles the tab bar.

## Must never happen
- Moving an item between the Library and Newsroom loses its reading position, highlights, notes or sync state.
- Existing items vanish or are duplicated when this ships.

## Out of scope
RSS feeds (RSS-AGGREGATOR-1), podcast sources (PODCAST-SOURCE-1), the Marketplace itself, and sign-in or plan limits (BLURBY-SERVER-1).

## Frames (all confirmed)
1. **Main path.** Launch opens the Library tab, showing books and PDFs. Clicking Newsroom shows the saved articles. Opening an article reads it full-screen, and closing it lands back on Newsroom.
2. **Manual move.** Right-clicking a PDF and choosing "Move to Newsroom" moves it there with the same position and highlights. It is still in Newsroom after a restart and a folder rescan.
3. **Search everywhere.** On the Library tab, searching "stoic" lists *Meditations* (Library) and an article (Newsroom), each labelled. Clicking the article switches to Newsroom and opens it.
4. **Filters.** Hovering the filter icon on Newsroom opens All / New / Favorites / Archived. On E-ink, a tap opens the same dropdown.
5. **Unbuilt tabs.** Podcasts shows "No podcasts yet" and Marketplace shows "Coming soon". Neither breaks search, filters or Ctrl+1–4.
6. **Upgrade (what does not change).** After updating, every existing book, PDF and article appears exactly once. Articles now sit in Newsroom with their positions, highlights, notes and sync intact.

## Approach (the one reasonable option)
Each library item gets a home field (`library` or `newsroom`). It defaults from the item's type (articles go to Newsroom). A manual move sets it explicitly, and a rescan never overrides that. There is still one library file, so nothing is copied, positions, highlights and sync are untouched, and the upgrade cannot lose or duplicate an item. The tabs filter the one library by home.

## Draft stub (approved)
- **What:**
  - A top tab bar: Library · Newsroom · Podcasts · Marketplace.
  - Filter, search and settings icons on its right end. Filter opens on hover, click or Enter. Search covers every tab, with results labelled.
  - A per-item home field. Articles default to Newsroom, and books and PDFs to the Library. "Move to Newsroom / Library" sets the home explicitly, and the choice survives a rescan.
  - An empty state on Podcasts, and a "Coming soon" banner on Marketplace.
  - The reader stays full-screen and returns to its tab. The app opens on the last-used tab. Ctrl+1–4 switch tabs.
- **Why:** books, articles and podcasts each get a home, ahead of RSS, Podcasts and the extension, which build on these tabs.
- **Done when (draft):** frames 1–6; the tab bar themed in every theme, E-ink included; a settings and library migration for the home field, with a test that no item is lost or duplicated.
- **Edit sites (expected):**
  - `src/components/LibraryView.tsx`: the filter row `:58`, the type filter `:97`, search `:81-96` and `:231`;
  - `src/components/LibraryContainer.tsx` and the app shell around it;
  - `src/types.ts`, for the home field. This is a shared-core touch;
  - the `main/` library save and migration;
  - `src/styles/`.
- **Prerequisites:** none on the roadmap. Because of the `src/types.ts` touch, it merges in a shared-core window after the Stage 8 release.
- **Effort:** high, probably in two waves: (A) the home field, migration and tab shell; (B) search, the filter dropdown and manual moves.
- **Placement:** Seq 100, unchanged, ahead of RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1.
- **Impact actions:** RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1 must be specified against this tab shell. EINK-CONTROLS-1, built and held, is unaffected.
