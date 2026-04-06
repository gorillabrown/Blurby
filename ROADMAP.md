# Blurby — Development Roadmap

**Last updated**: 2026-04-05 — TTS-7R complete (v1.37.0). BUG-145a/b/c resolved. HOTFIX-12 next. 1,529 tests, 85 files. Latest tagged release: v1.37.0.
**Current branch**: `main`
**Current state**: Phase 6 feature work active. TTS-7R resolved the three remaining narration band problems: resize jitter, band outruns audio, and chunk restart from visual position. Canonical audio cursor separated from visual cursor. HOTFIX-12 is next. Queue depth 1 — RED. EINK/GOALS parked.
**Governing roadmap**: `docs/project/ROADMAP_V2.md` (7-phase product roadmap)

> **Navigation:** Forward-looking sprint specs below. Completed sprint full specs archived in `docs/project/ROADMAP_ARCHIVE.md`. Phase 1 fix specs in `docs/audit/AUDIT 1/AUDIT 1. STEP 2 TEAM RESPONSE.md`.

---

## Execution Order

```
Phase 1: Stabilization (AUDIT-FIX 1A–1F) ── COMPLETE (v1.4.14)
    │
    ▼
Phase 2: EPUB Content Fidelity ── COMPLETE (v1.5.1)
    │
    ▼
Phase 3: Flow Mode Redesign ── COMPLETE (v1.6.1)
    │
    ▼
Phase 4: Blurby Readings ── COMPLETE (v1.9.0)
    │
    ▼
Phase 5: Read Later + Chrome Extension
  ├── 5A ✅ E2E + Queue (v1.10.0)
  └── 5B → EXT-5B: Pairing UX ✅
    │
    ▼
Phase 6: TTS Hardening & Stabilization
  ├── TTS-6C: Kokoro Native-Rate Buckets ✅ (v1.14.0)
  ├── TTS-6D: Kokoro Startup & Recovery Hardening ✅ (v1.15.0)
  ├── TTS-6E: Pronunciation Overrides Foundation ✅ (v1.16.0)
  ├── TTS-6F: Word Alignment & Narration Telemetry ✅ (v1.17.0)
  ├── TTS-6G: Narration Controls & Accessibility Polish ✅ (v1.18.0)
  ├── TTS-6I: Per-Book Pronunciation Profiles ✅ (v1.19.0)
  ├── TTS-6J: Voice Selection & Persona Consistency ✅ (v1.20.0)
  ├── TTS-6K: Narration Personalization & Quality Sweep ✅ (v1.21.0)
  ├── TTS-6L: Narration Profiles & Sharing Foundations ✅ (v1.22.0)
  ├── TTS-6M: Narration Portability & Reset Safety ✅ (v1.23.0)
  ├── TTS-6N: Narration Runtime Stability & Extraction Sync ✅ (v1.24.0)
  ├── TTS-6O: Narration Performance Budgets & Background Work Isolation ✅ (v1.25.0)
  ├── TTS-6P: Session Continuity & Recovery ✅ (v1.26.0)
  ├── TTS-6Q: Narration Diagnostics & Regression Shields ✅ (v1.27.0)
  ├── TTS-6S: Cursor Sync, Pause Shaping & Backlog Fill Hotfix ✅ (v1.28.0)
  ├── HOTFIX-11: Bug Reporter Narration Diagnostics & Console Capture ✅ (v1.27.1)
  │
  │  TTS Stabilization (audit-driven) ── COMPLETE (v1.32.0)
  ├── TTS-7A: Cache Correctness ✅ (v1.29.0)
  ├── TTS-7B: Cursor Contract ✅ (v1.30.0)
  ├── TTS-7C: Throughput & Dead Code ✅ (v1.31.0)
  ├── TTS-7D: Integration Verification ✅ (v1.32.0)
  │
  │  TTS hotfix follow-up
  ├── TTS-7E: Cold-Start Narration Fix (partial attempt; reopened)
  ├── TTS-7F: Proactive Entry Cache Coverage & Cruise Warm ✅ (v1.33.1)
  ├── TTS-7G: First-Chunk IPC Verification ✅ (v1.33.2) — BUG-117 verified resolved
  ├── TTS-7H: Visible-Word Readiness & Stable Launch Index ✅ (v1.33.3; partial, follow-up required)
  ├── TTS-7I: Foliate Follow-Scroll Unification & Exact Miss Recovery ✅ (v1.33.4; follow-up required)
  ├── TTS-7J: Foliate Section-Sync Ownership, Word-Source Dedupe & Initial Selection Protection ✅ (v1.33.5)
  ├── TTS-7K: EPUB Global Word-Source Promotion & Page-Mode Isolation ✅ (v1.33.6)
  ├── TTS-7L: Exact Foliate Text-Selection Mapping ✅ (v1.33.7)
  ├── TTS-7M: Persistent Resume Anchor & Reopen Authority ✅ (v1.33.8)
  ├── TTS-7N: Kokoro Pause Semantics & Settings Link Repair ✅ (v1.33.9)
  ├── TTS-7O: Audible Pause Injection & Smooth Narration Cursor ✅ (v1.34.0)
  ├── EXT-5C: Rich Article Capture & Hero Image Cards ✅ (v1.35.0)
  ├── TTS-7P: Rolling Pause-Boundary Planner ✅ (v1.36.0)
  ├── TTS-7Q: True Glide & Audio-Aligned Narration Cursor ✅ (v1.36.1)
  ├── TTS-7R: Calm Narration Band & Cursor Ownership Fix ✅ (v1.37.0)
  │
  │  Feature work
  ├── EINK-6A: E-Ink Foundation & Greyscale Runtime (queued after TTS-7Q)
  ├── EINK-6B: E-Ink Reading Ergonomics & Mode Strategy (queued)
  └── GOALS-6B: Reading Goal Tracking (queued, parallel with EINK-6B)
    │
    ├────────────────────────┐
    ▼                        ▼
Phase 7:                  Phase 8:
Cloud Sync Hardening      RSS/News Feeds
    │                        │
    └────────────┬───────────┘
                 ▼
Phase 9: APK Wrapper (+2 modularization sprints)
```

---

## Phases 2–5 — COMPLETE

> All Phase 2–5 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`. Summary below.

| Phase | Sprints | Final Version | Key Deliverables |
|-------|---------|---------------|------------------|
| 2: EPUB Fidelity | EPUB-2A, EPUB-2B | v1.5.1 | Format preservation, image extraction, DOCX/URL→EPUB, single rendering path |
| 3: Flow Mode | FLOW-3A, FLOW-3B | v1.6.1 | Infinite scroll, FlowScrollEngine, dead code removal |
| 4: Readings | READINGS-4A, 4B, 4C | v1.9.0 | Card metadata, queue, author normalization, metadata wizard |
| 5: Chrome Extension | EXT-5A, EXT-5B + TTS Smoothness | v1.11.0 | E2E pipeline tests, 6-digit pairing, background cache wiring |

---

## Phase 6 — TTS Hardening & Stabilization + Follow-On Hotfixes

> All TTS-6 and TTS-7 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`. Summary below.

| Lane | Sprints | Versions | Key Deliverables |
|------|---------|----------|------------------|
| TTS-6 | TTS-6C→6S + HOTFIX-11 | v1.14.0–v1.28.0 | Native-rate buckets, startup hardening, pronunciation overrides, word alignment, accessibility, profiles, portability, runtime stability, performance budgets, session continuity, diagnostics, cursor sync |
| TTS-7 (stabilization + hotfix) | TTS-7A→7L | v1.29.0–v1.33.7 | Cache correctness, cursor contract (dual ownership), throughput/backpressure, integration verification, proactive entry-cache coverage + cruise warm, clean Foliate DOM probing, first-chunk IPC verification, visible-word/startup fixes, Foliate follow-scroll unification + exact miss recovery, final Foliate section-sync / word-source dedupe / initial-selection protection, EPUB global word-source promotion, and exact text-selection mapping. TTS hotfix lane CLOSED at v1.33.7. |

**Architecture post-stabilization:** Narration state machine, cache identity contract (voice + override hash + word count), cursor ownership (playing = TTS owns, paused = user owns), pipeline pause/resume (emission gating), backpressure (TTS_QUEUE_DEPTH), narration start <50ms per microtask. Documented in TECHNICAL_REFERENCE.md § "Narrate Mode Architecture."

**Closeout note:** Live testing on 2026-04-04 showed that cold-start narration on freshly opened EPUBs still had page-jump and ramp-up continuity regressions after `TTS-7E`. `TTS-7F` closed the reactive-cache side of that gap, and `TTS-7G` verified that `BUG-117` (910ms first-chunk IPC handler) was already resolved by prior work. `TTS-7H` fixed the frozen-start-index and section-fallback pieces, `TTS-7I` unified follow-scroll ownership and exact miss recovery, `TTS-7J` resolved section-sync blink, word-source duplication, and initial-selection overwrite, `TTS-7K` promoted full-book EPUB words as the active source of truth, and `TTS-7L` closed the final selection-path gap by preserving exact word identity across click and native text selection. Phase 6 TTS is now fully stabilized and closed at `v1.33.7`.

---

### Sprint TTS-7E: Cold-Start Narration Fix (Hotfix) — archived to ROADMAP_ARCHIVE.md

> SUPERSEDED by TTS-7F. First cold-start repair attempt; did not fully solve launch ownership or ramp continuity. Preserved for traceability.

---

### Sprint TTS-7F: Proactive Entry Cache Coverage & Cruise Warm ✅ (v1.33.1) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7G: First-Chunk IPC Verification ✅ (v1.33.2) — archived to ROADMAP_ARCHIVE.md

> BUG-117 verified resolved — response path < 2ms. 6 new tests (1,279 total). TTS stabilization lane CLOSED.

---

### Sprint TTS-7H: Visible-Word Readiness & Stable Launch Index ✅ (v1.33.3) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7I: Foliate Follow-Scroll Unification & Exact Miss Recovery ✅ (v1.33.4) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7J: Foliate Section-Sync Ownership, Word-Source Dedupe & Initial Selection Protection ✅ (v1.33.5) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7K: EPUB Global Word-Source Promotion & Page-Mode Isolation ✅ (v1.33.6) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7L: Exact Foliate Text-Selection Mapping ✅ (v1.33.7) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7M: Persistent Resume Anchor & Reopen Authority ✅ (v1.33.8) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7N: Kokoro Pause Semantics & Settings Link Repair ✅ (v1.33.9) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7O: Audible Pause Injection & Smooth Narration Cursor ✅ (v1.34.0) — archived to ROADMAP_ARCHIVE.md

---

### Sprint EXT-5C: Rich Article Capture & Hero Image Cards ✅ (v1.35.0) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7P: Rolling Pause-Boundary Planner ✅ (v1.36.0) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7Q: True Glide & Audio-Aligned Narration Cursor ✅ (v1.36.1) — archived to ROADMAP_ARCHIVE.md

---

### Sprint TTS-7R: Calm Narration Band & Cursor Ownership Fix ✅ (v1.37.0) — archived to ROADMAP_ARCHIVE.md

> BUG-145a/b/c resolved. Separated canonical audio cursor (`lastConfirmedAudioWordRef`) from visual cursor, enabled audio-progress glide (removed `SIMPLE_NARRATION_GLIDE`), fixed-size overlay band (measure-once line-height), truth-sync visual-only pathway, removed per-word context CSS. 25 new tests (`tests/calmNarrationBand.test.ts`). v1.37.0.

---

### Sprint HOTFIX-12: Bug Report Triage Fixes (BUG-146–150)

**Goal:** Fix five bugs surfaced during the April 5 bug report review session. These are a mix of UX gaps, keyboard handling, and performance issues — none require deep narration engine changes. Quick-tier sprint: targeted fixes, no new features.

**Problem:** Bug report review of 12 user-filed reports (April 4–5) identified 5 new issues outside the TTS-7R narration band scope:
1. Chapter dropdown doesn't update during narration (BUG-146)
2. No "return to narration" button when user pages away (BUG-147)
3. No visual feedback on position restore after reopen (BUG-148)
4. Large EPUB extraction blocks UI on book open (BUG-149)
5. Bug reporter modal swallows keyboard shortcuts (BUG-150)

**Design decisions:**

- **BUG-146 (chapter dropdown):** When narration is active, derive the chapter dropdown label from the narration cursor word index instead of the reading `wordIndex`. Add a `narrationWordIndex` prop to ReaderBottomBar, sourced from `cursorWordIndex` in narration state. Use it as input to `currentChapterIndex()` when `narrationStatus === "speaking"`.

- **BUG-147 (return to narration):** Add a floating "Return to narration" pill button that appears when the visible page range does not contain the narration cursor word index. On click, navigate to the narration position. Auto-dismiss when the narration range becomes visible again. Render inside FoliatePageView, above the overlay. Only visible when narration is active + user has paged away.

- **BUG-148 (position restore feedback):** Show a brief toast ("Restored to your last position") on book open when the resume anchor system navigates to a saved position. Trigger from the `onLoad` callback in FoliatePageView when the position is > 0 and was restored from persistence. Toast auto-dismisses after 2 seconds.

- **BUG-149 (extraction blocks UI):** Chunk the main-process EPUB word extraction in `main/epub-word-extractor.js` so it yields between chapters/sections using `setImmediate()`. This keeps the main-process event loop responsive during extraction without requiring a worker thread. Additionally, increase the renderer delay from 1s to 2s for books > 100k words to give Foliate more time to settle.

- **BUG-150 (bug reporter keyboard):** Two changes: (a) In the global keyboard handler (`useKeyboardShortcuts.ts`), early-return if `e.target` is a `<textarea>`, `<input>`, or `[contenteditable]` element. This is a universal fix that also helps future modals/dialogs. (b) In `BugReportModal.tsx`, add a `keydown` handler that calls `handleSave()` on Ctrl+Enter.

**Tier:** Quick (targeted bug fixes, no new features)

**Baseline:**
- `src/components/ReaderBottomBar.tsx` (~420 lines) — chapter dropdown at lines 140–144, `currentChapterIndex` computed from `wordIndex`
- `src/components/ReaderContainer.tsx` (~1,400 lines) — narration state available, book word extraction at lines 472–500
- `src/components/FoliatePageView.tsx` (~1,750 lines) — overlay rendering, narration position
- `src/components/BugReportModal.tsx` (~170 lines) — Escape handler at line 47, no Ctrl+Enter
- `src/hooks/useKeyboardShortcuts.ts` (~450 lines) — global Ctrl+Left/Right at lines 196–197, no input element guard
- `main/epub-word-extractor.js` — synchronous full-book extraction
- `src/styles/global.css` — bug report and narration overlay styles

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `docs/governance/BUG_REPORT.md` — BUG-146 through BUG-150
4. `ROADMAP.md` — this section
5. `src/components/ReaderBottomBar.tsx` — chapter dropdown (lines 140–144)
6. `src/components/ReaderContainer.tsx` — narration state, word extraction (lines 472–500)
7. `src/components/FoliatePageView.tsx` — overlay rendering, position callbacks
8. `src/components/BugReportModal.tsx` — keyboard handling, save action
9. `src/hooks/useKeyboardShortcuts.ts` — global handler (lines 196–197)
10. `main/epub-word-extractor.js` — extraction pipeline

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hermes (renderer-scope) | **BUG-150: Bug reporter keyboard fix** — (a) In `useKeyboardShortcuts.ts`, add early-return guard at the top of the keydown handler: if `e.target` is a `<textarea>`, `<input>`, or has `contenteditable`, return immediately (don't `preventDefault`). (b) In `BugReportModal.tsx`, add a `keydown` listener (or onKeyDown on the dialog div) that calls `handleSave()` when `e.ctrlKey && e.key === "Enter"`. | `src/hooks/useKeyboardShortcuts.ts`, `src/components/BugReportModal.tsx` |
| 2 | Hephaestus (renderer-scope) | **BUG-146: Chapter dropdown tracks narration cursor** — Add `narrationWordIndex` prop (number \| null) to ReaderBottomBar. In ReaderContainer, pass `narrationStatus === "speaking" ? cursorWordIndex : null`. In ReaderBottomBar, change `currentChapterIndex(chapterList, wordIndex)` (line 141) to use `narrationWordIndex ?? wordIndex` as the position input. | `src/components/ReaderBottomBar.tsx`, `src/components/ReaderContainer.tsx` |
| 3 | Hephaestus (renderer-scope) | **BUG-147: "Return to narration" floating button** — In FoliatePageView (or ReaderContainer, depending on where the visible word range is easiest to check), add a conditionally-rendered pill button: visible when narration is active AND the narration `cursorWordIndex` is outside the currently-visible word range. On click, navigate the reader (via Foliate API or wordIndex prop update) to the narration cursor position. Style: small floating pill, bottom-right above bottom bar, z-index above reader but below modals. Auto-hide when narration range comes back into view or narration stops. | `src/components/FoliatePageView.tsx` or `src/components/ReaderContainer.tsx`, `src/styles/global.css` |
| 4 | Hephaestus (renderer-scope) | **BUG-148: Position restore toast** — In the book-open / `onLoad` callback path (FoliatePageView or ReaderContainer), detect when the resume anchor system restores a position > 0. Show a brief toast via `showToast()`: "Restored to your last position". Auto-dismiss 2 seconds. Only trigger on initial load, not on every `onRelocate` event. Gate with a `hasShownRestoreToast` ref to prevent re-showing. | `src/components/ReaderContainer.tsx` or `src/components/FoliatePageView.tsx` |
| 5 | Hephaestus (electron-scope) | **BUG-149: Chunked EPUB extraction** — In `main/epub-word-extractor.js`, refactor the extraction loop to yield between sections/chapters using `await new Promise(r => setImmediate(r))`. Process one section at a time, accumulate results, yield. This keeps the main-process event loop responsive. Also: in `ReaderContainer.tsx` line 497, increase the extraction delay from 1000ms to 2000ms for books with `wordCount > 100000`. | `main/epub-word-extractor.js`, `src/components/ReaderContainer.tsx` |
| 6 | Hippocrates | **Tests** — (a) BUG-150: keyboard shortcuts don't fire when a textarea/input is focused. (b) BUG-150: Ctrl+Enter in bug reporter triggers save. (c) BUG-146: chapter dropdown reflects narrationWordIndex when narration is active. (d) BUG-149: extraction yields between sections (check that setImmediate is called). ≥8 new tests. | `tests/` |
| 7 | Hippocrates | **`npm test` + `npm run build`** | — |
| 8 | Solon | **Spec compliance** | — |
| 9 | Herodotus | **Documentation pass** — Update BUG-146–150 status in BUG_REPORT.md. Update CLAUDE.md. Update sprint queue. Add LESSONS_LEARNED entry if non-trivial discovery. | All governing docs |
| 10 | Hermes | **Git: commit, merge, push** | — |

#### Execution Sequence

```
1. Hermes: Task 1 (BUG-150 keyboard fix — simplest, unblocks future modal testing)
2. Hephaestus: Task 2 (BUG-146 chapter dropdown — small prop threading)
3. Hephaestus: Task 3 (BUG-147 return-to-narration button — new UI element)
4. Hephaestus: Task 4 (BUG-148 position restore toast — small, independent)
5. Hephaestus: Task 5 (BUG-149 chunked extraction — main process, independent)
    ↓
6. Hippocrates: Task 6
7. Hippocrates: Task 7
8. Solon: Task 8
9. Herodotus: Task 9
10. Hermes: Task 10
```

#### SUCCESS CRITERIA

1. Ctrl+Left/Right, Ctrl+Backspace, and other standard text-editing shortcuts work inside the bug reporter textarea (BUG-150)
2. Ctrl+Enter submits the bug report from the modal (BUG-150)
3. Global keyboard shortcuts still work when no text input is focused (no regression)
4. Chapter dropdown label updates to reflect the narration cursor position during active narration (BUG-146)
5. Chapter dropdown falls back to reading `wordIndex` when narration is not active (no regression)
6. "Return to narration" button appears when user pages away from narration position (BUG-147)
7. "Return to narration" button navigates to narration cursor on click (BUG-147)
8. "Return to narration" button auto-hides when narration range becomes visible or narration stops (BUG-147)
9. Brief toast appears on book reopen when position is restored (BUG-148)
10. Toast does not appear on first open (position = 0) or on every page turn (BUG-148)
11. UI remains responsive (selectable, clickable) during background extraction of large EPUBs (BUG-149)
12. ≥8 new tests
13. `npm test` passes
14. `npm run build` succeeds

**Depends on:** Independent of TTS-7R (can run before, after, or in parallel)

---

## Phase 6 Continued — E-Ink & Goals (PARKED)

> EINK-6A, EINK-6B, and GOALS-6B are fully spec'd but parked while TTS cursor polish completes. Specs remain valid — resume after TTS-7R.

---

### Sprint EINK-6A: E-Ink Foundation & Greyscale Runtime

**Goal:** Decouple e-ink display behavior from the theme system so users can pair e-ink optimizations (no animations, large targets, refresh timing) with any color theme. Currently, e-ink is a theme — selecting it forces greyscale colors. After this sprint, e-ink is an independent display mode toggle that layers on top of any theme.

**Problem:** E-ink support exists as a `[data-theme="eink"]` CSS block (200+ lines in global.css) with dedicated settings (`einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping`). But it's coupled to the theme selector in ThemeSettings.tsx — you can't use dark theme with e-ink optimizations, or light theme with e-ink refresh overlay. This forces users with e-ink devices to accept the greyscale palette even when their device supports limited color (Kaleido e-ink screens). It also means non-e-ink users can't benefit from e-ink ergonomic features (reduced animation, larger targets) without losing their preferred theme.

**Design decisions:**
- **New `einkMode: boolean` setting.** Independent of `theme`. When true, applies e-ink behavioral CSS overrides (no transitions, larger targets, no hover) on top of the active theme. The existing `[data-theme="eink"]` color palette becomes an optional "E-Ink Greyscale" theme choice that users can select or skip.
- **Refactor CSS into two layers.** Split the current `[data-theme="eink"]` block into: (a) `[data-eink="true"]` — behavioral overrides (transition:none, no hover, larger targets), applied when einkMode is on regardless of theme, and (b) `[data-theme="eink"]` — color palette only (pure black/white/grey), optional theme choice. This is a CSS-only refactor with no JS behavior changes.
- **ThemeSettings restructure.** Move e-ink from theme grid to a separate toggle section: "E-Ink Display Mode" toggle above the theme selector. When on, show the existing e-ink sub-settings (WPM ceiling, refresh interval, phrase grouping). Theme selector remains independent below.
- **EinkRefreshOverlay remains as-is.** The existing `useEinkController` hook and `EinkRefreshOverlay` component work correctly — they just need to check `einkMode` instead of `theme === 'eink'`.

**Baseline:**
- `src/types.ts` — settings schema: `einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping` (lines 136–139). No `einkMode` field yet.
- `src/components/settings/ThemeSettings.tsx` (150 lines) — e-ink as theme option (line 30), e-ink sub-settings panel (lines 100–147)
- `src/styles/global.css` — `[data-theme="eink"]` block (~200 lines, starts ~line 1543)
- `src/hooks/useEinkController.ts` (47 lines) — page-turn counter, refresh overlay trigger
- `src/components/EinkRefreshOverlay.tsx` (24 lines) — black/white flash overlay
- `src/components/ReaderContainer.tsx` — e-ink integration: WPM cap (line 144), eink controller (line 92), overlay render
- `src/constants.ts` — `DEFAULT_EINK_WPM_CEILING`, `DEFAULT_EINK_REFRESH_INTERVAL`, `EINK_REFRESH_FLASH_MS`, etc.

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — settings schema, eink fields
5. `src/components/settings/ThemeSettings.tsx` — current e-ink theme coupling
6. `src/styles/global.css` — `[data-theme="eink"]` block (find boundaries)
7. `src/hooks/useEinkController.ts` — refresh controller logic
8. `src/components/EinkRefreshOverlay.tsx` — overlay component
9. `src/components/ReaderContainer.tsx` — e-ink integration points
10. `src/constants.ts` — e-ink constants

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **Add `einkMode` setting** — Add `einkMode: boolean` (default false) to settings schema in types.ts. Add default to constants.ts. Wire through SettingsContext. | `src/types.ts`, `src/constants.ts`, `src/contexts/SettingsContext.tsx` |
| 2 | Hephaestus (renderer-scope) | **Split CSS into behavioral and color layers** — Extract all non-color properties from `[data-theme="eink"]` into new `[data-eink="true"]` selector. Leave only color properties (`--bg`, `--fg`, `--accent`, etc.) in `[data-theme="eink"]`. Verify no visual regression when both are applied simultaneously. | `src/styles/global.css` |
| 3 | Hephaestus (renderer-scope) | **Apply `data-eink` attribute** — In the root element (App.tsx or equivalent), set `data-eink="true"` when `settings.einkMode === true`, independent of `data-theme`. | `src/App.tsx` or equivalent root |
| 4 | Hephaestus (renderer-scope) | **Restructure ThemeSettings** — Move e-ink out of theme grid. Add "E-Ink Display Mode" toggle above themes. When toggled on, show WPM ceiling / refresh interval / phrase grouping sliders. Theme grid remains below, all themes selectable regardless of einkMode. | `src/components/settings/ThemeSettings.tsx` |
| 5 | Hephaestus (renderer-scope) | **Update eink controller** — Change `useEinkController.ts` to check `settings.einkMode` instead of `theme === 'eink'`. Update ReaderContainer.tsx integration points (WPM cap, overlay render) to use `einkMode`. | `src/hooks/useEinkController.ts`, `src/components/ReaderContainer.tsx` |
| 6 | Hippocrates | **Tests** — (a) `einkMode` toggle applies `data-eink` attribute. (b) `data-eink="true"` + `data-theme="dark"` doesn't conflict. (c) E-ink behavioral CSS (transition:none) applies independently of theme. (d) WPM cap respects `einkMode`, not theme. (e) Refresh overlay fires when `einkMode` is on regardless of theme. ≥8 new tests. | `tests/` |
| 7 | Hippocrates | **`npm test` + `npm run build`** | — |
| 8 | Solon | **Spec compliance** | — |
| 9 | Herodotus | **Documentation pass** | All 6 governing docs |
| 10 | Hermes | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. `einkMode` setting exists, persists, and toggles independently of theme
2. `data-eink="true"` attribute applied to root when einkMode is on
3. E-ink behavioral CSS (no transitions, larger targets, no hover) applies on any theme when einkMode is on
4. E-ink greyscale color palette applies only when `data-theme="eink"` is selected
5. WPM ceiling enforced by einkMode, not by theme
6. Refresh overlay fires based on einkMode, not theme
7. ThemeSettings shows independent einkMode toggle with sub-settings
8. ≥8 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Tier:** Full | **Depends on:** TTS-7D (TTS stabilization complete)

---

### Sprint EINK-6B: E-Ink Reading Ergonomics & Mode Strategy

**Goal:** Add e-ink-aware reading mode variants that respect the physical constraints of e-ink displays: slow refresh (120–450ms), coarse pixel density, touch-only input, and ghosting artifacts. Stepped flow (chunk-based page advance) and burst focus (multi-word grouping with tuned timing) give e-ink users reading modes that feel native to their hardware instead of fighting it.

**Problem:** All four reading modes (Page, Focus, Flow, Narration) assume a fast LCD/OLED display. Flow mode's smooth per-line scroll causes severe ghosting on e-ink. Focus mode's rapid single-word RSVP flashes cause incomplete refresh cycles. Page mode works acceptably but page turns are slow. Users on e-ink devices get a degraded experience in every mode except Page, and even Page could be better with larger paragraph-level navigation.

**Design decisions:**
- **Stepped Flow mode.** When `einkMode` is on and Flow mode is active, replace per-line smooth scroll with chunk-based page advance: display N lines (configurable, default `EINK_LINES_PER_PAGE = 20`), pause for reading time based on WPM, then full-page advance to next N lines. No animation — instant replace. Cursor behavior: shrinking underline still paces within the visible chunk, but page transitions are instant.
- **Burst Focus mode.** When `einkMode` is on and Focus mode is active, group words into 2–3 word phrases (using existing `einkPhraseGrouping` setting). Display each group for the duration that single words would take at current WPM. This reduces the number of screen redraws per minute by 2–3x, making focus mode usable on e-ink.
- **Adaptive refresh heuristic.** Replace the fixed-interval refresh counter with a content-change-aware heuristic: track cumulative pixel change area across page turns (estimate from word count delta). Trigger refresh when estimated ghosting exceeds a threshold. Keep manual interval as fallback/override. New constants: `EINK_GHOSTING_THRESHOLD`, `EINK_ADAPTIVE_REFRESH_ENABLED`.
- **No changes to Narration or Page modes.** Narration is audio-driven (e-ink display updates are sparse). Page mode already works well with the behavioral CSS from EINK-6A.

**Baseline:**
- `src/modes/FlowMode.ts` — word-by-word timing, `FlowScrollEngine` integration
- `src/modes/FocusMode.ts` — single-word RSVP timing
- `src/hooks/useEinkController.ts` — fixed-interval refresh counter (from EINK-6A: now einkMode-aware)
- `src/utils/FlowScrollEngine.ts` — scroll container, cursor rendering
- `src/constants.ts` — `EINK_LINES_PER_PAGE = 20`, phrase grouping defaults

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section + EINK-6A spec
4. `src/modes/FlowMode.ts` — current word-by-word advance logic
5. `src/modes/FocusMode.ts` — current RSVP logic
6. `src/utils/FlowScrollEngine.ts` — scroll engine internals
7. `src/hooks/useEinkController.ts` — refresh controller (post-EINK-6A)
8. `src/constants.ts` — e-ink constants

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **Stepped Flow mode** — In FlowMode.ts: when `einkMode` is on, switch from per-line scroll to chunk-based advance. Display `EINK_LINES_PER_PAGE` lines, pause for calculated reading time, then instant-replace with next chunk. Cursor behavior: shrinking underline paces within visible chunk. Page transitions have no animation (`transition: none` already in eink behavioral CSS). | `src/modes/FlowMode.ts`, `src/utils/FlowScrollEngine.ts` |
| 2 | Hephaestus (renderer-scope) | **Burst Focus mode** — In FocusMode.ts: when `einkMode` is on and `einkPhraseGrouping` is true, group words into 2–3 word phrases. Display each phrase for the combined word duration at current WPM. Use the existing segmentation (whitespace-based) with configurable max group size (new constant `EINK_BURST_GROUP_SIZE = 3`). | `src/modes/FocusMode.ts`, `src/constants.ts` |
| 3 | Hephaestus (renderer-scope) | **Adaptive refresh heuristic** — Extend `useEinkController.ts`: track cumulative word count across page turns since last refresh. When cumulative words exceed `EINK_GHOSTING_THRESHOLD` (new constant, default 500), trigger refresh. Existing manual interval remains as override (refresh at whichever threshold triggers first). Add `EINK_ADAPTIVE_REFRESH_ENABLED` constant (default true). | `src/hooks/useEinkController.ts`, `src/constants.ts` |
| 4 | Hippocrates | **Tests** — (a) Stepped flow: einkMode on → chunk-based advance with correct timing. (b) Stepped flow: einkMode off → normal per-line scroll (no regression). (c) Burst focus: 2–3 word grouping with combined timing. (d) Burst focus: single-word fallback when phrase grouping off. (e) Adaptive refresh: triggers at word threshold. (f) Adaptive refresh: manual interval still works as override. ≥10 new tests. | `tests/` |
| 5 | Hippocrates | **`npm test` + `npm run build`** | — |
| 6 | Solon | **Spec compliance** | — |
| 7 | Herodotus | **Documentation pass** | All 6 governing docs |
| 8 | Hermes | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Flow mode in einkMode uses chunk-based page advance (no smooth scroll)
2. Chunk size configurable via `EINK_LINES_PER_PAGE`
3. Focus mode in einkMode groups words into 2–3 word phrases when phrase grouping is on
4. Phrase display timing equals combined single-word duration at current WPM
5. Adaptive refresh triggers based on cumulative word count, not just fixed interval
6. Manual refresh interval still works as override
7. Non-eink behavior in Flow and Focus modes unchanged (no regression)
8. ≥10 new tests
9. `npm test` passes
10. `npm run build` succeeds

**Tier:** Full | **Depends on:** EINK-6A

---

### Sprint GOALS-6B: Reading Goal Tracking

**Goal:** Add a lightweight reading goal system — set daily/weekly/monthly targets, track progress, and see visual feedback. Goals are optional, local-first, and non-intrusive. They surface progress without blocking reading.

**Problem:** Blurby tracks reading activity implicitly (time spent, pages turned, books in library) but gives users no way to set targets or see whether they're meeting them. Users who want to build a reading habit have no feedback loop. The reading queue (READINGS-4A) tells you what to read next; goals tell you how much to read.

**Design decisions:**
- **Three goal types.** Daily pages, daily minutes, weekly books. Each is independently configurable. Users can set zero, one, or all three. Stored in settings as a `goals` array of `ReadingGoal` objects.
- **Progress tracking via existing signals.** Pages: increment on page turn or word advance (1 page = `WORDS_PER_PAGE` words, consistent with existing pagination). Minutes: increment via `requestAnimationFrame` tick while any reading mode is active (Page, Focus, Flow, or Narration). Books: increment on book completion (existing `markComplete` action). No new data collection — we derive everything from existing events.
- **Library widget.** Compact progress bar(s) below the library header showing today's/this week's progress. Clicking opens the Goals detail view. Optionally collapsed to just an icon when goals are met.
- **Settings sub-page.** New `ReadingGoalsSettings.tsx` under Settings. Create/edit/delete goals. See current streaks. Reset daily at midnight local time; reset weekly on Monday.
- **Streak counter.** Track consecutive days meeting daily goal (or consecutive weeks meeting weekly goal). Display in settings and optionally on library widget. Stored as `currentStreak: number` and `lastStreakDate: string` in goal object.
- **No notifications in v1.** Gentle progress display only — no push notifications, no toasts, no modals. Keep it pull-based (user checks when they want to).
- **Local-first.** Goal data stored in settings JSON alongside other preferences. No cloud sync in this sprint (Phase 7 can add sync later). No IPC needed — goals are renderer-side state, computed from existing reading events.

**Baseline:**
- `src/types.ts` — settings schema (no goals fields yet)
- `src/contexts/SettingsContext.tsx` — settings propagation
- `src/components/LibraryContainer.tsx` — library header area where widget would live
- `src/components/settings/` — existing settings sub-pages (model for new GoalsSettings)
- `src/hooks/useReader.ts` — reading activity events (page turns, word advance)
- `src/components/ReaderContainer.tsx` — reading mode lifecycle

#### WHERE (Read Order)

1. `CLAUDE.md`
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — settings schema (where ReadingGoal type will live)
5. `src/contexts/SettingsContext.tsx` — settings context pattern
6. `src/components/LibraryContainer.tsx` — library header for widget placement
7. `src/components/settings/SpeedReadingSettings.tsx` — model settings sub-page structure
8. `src/hooks/useReader.ts` — reading activity events
9. `src/components/ReaderContainer.tsx` — reading mode lifecycle

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Hephaestus (renderer-scope) | **ReadingGoal type + settings schema** — Add `ReadingGoal` interface to types.ts: `{ id: string, type: 'daily-pages' | 'daily-minutes' | 'weekly-books', target: number, currentStreak: number, lastStreakDate: string }`. Add `goals: ReadingGoal[]` to settings (default empty array). Add `goalProgress: { todayPages: number, todayMinutes: number, weekBooks: number, lastResetDate: string }` to settings for tracking state. | `src/types.ts`, `src/constants.ts` |
| 2 | Hephaestus (renderer-scope) | **useReadingGoals hook** — New hook that: reads goals + progress from settings, provides `incrementPages(count)`, `incrementMinutes(delta)`, `incrementBooks()` methods, auto-resets daily counters at midnight (check `lastResetDate` on each read), auto-resets weekly counters on Monday, updates streak on daily reset (met yesterday's goal → streak+1, else reset to 0). | `src/hooks/useReadingGoals.ts` (new) |
| 3 | Hephaestus (renderer-scope) | **Wire progress tracking** — In ReaderContainer.tsx: call `incrementPages` on page turn events, call `incrementMinutes` from a 1-minute interval while any reading mode is active, call `incrementBooks` when book is marked complete. All calls go through the `useReadingGoals` hook. | `src/components/ReaderContainer.tsx` |
| 4 | Hephaestus (renderer-scope) | **GoalProgressWidget** — Compact component for library header: one progress bar per active goal (thin, accent color, percentage fill). Show "3/10 pages today" or "45/60 min today" labels. When all goals met, collapse to checkmark icon. Click navigates to goals settings. | `src/components/GoalProgressWidget.tsx` (new), `src/styles/global.css` |
| 5 | Hephaestus (renderer-scope) | **ReadingGoalsSettings** — New settings sub-page. List active goals with edit/delete. "Add Goal" button → inline form (type selector, target number). Show current streak per goal. | `src/components/settings/ReadingGoalsSettings.tsx` (new), `src/components/SettingsMenu.tsx` |
| 6 | Hephaestus (renderer-scope) | **Wire widget into library** — Add `GoalProgressWidget` to LibraryContainer header area. Only render when `settings.goals.length > 0`. | `src/components/LibraryContainer.tsx` |
| 7 | Hippocrates | **Tests** — (a) Goal creation persists to settings. (b) Daily reset clears page/minute counters at midnight. (c) Weekly reset clears book counter on Monday. (d) Streak increments when daily goal met before reset. (e) Streak resets when daily goal not met. (f) Progress widget renders correct fill percentage. (g) Widget hidden when no goals set. (h) incrementPages/incrementMinutes/incrementBooks update correctly. ≥10 new tests. | `tests/` |
| 8 | Hippocrates | **`npm test` + `npm run build`** | — |
| 9 | Solon | **Spec compliance** | — |
| 10 | Herodotus | **Documentation pass** | All 6 governing docs |
| 11 | Hermes | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. Users can create daily-pages, daily-minutes, and weekly-books goals in settings
2. Goals persist in settings and survive app restart
3. Page turns during any reading mode increment today's page count
4. Active reading time (any mode) increments today's minutes count
5. Book completion increments weekly book count
6. Daily counters reset at midnight local time
7. Weekly counters reset on Monday
8. Streak tracks consecutive days meeting daily goal
9. GoalProgressWidget shows in library header when goals exist
10. Widget shows correct progress bars with labels
11. Widget collapses to checkmark when all goals met
12. No goals → no widget (clean library header)
13. ≥10 new tests
14. `npm test` passes
15. `npm run build` succeeds

**Tier:** Full | **Depends on:** TTS-7D (independent of EINK-6A/6B — can run in parallel)
