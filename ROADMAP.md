# Blurby — Development Roadmap

**Last updated**: 2026-04-16 — TEST-COV-1 complete. Queue depth 2 (YELLOW). Next: NARR-LAYER-1A.
**Current branch**: `main`
**Current state**: v1.50.0 stable. Queue depth 2 (YELLOW). Next: NARR-LAYER-1A → NARR-LAYER-1B.
**Governing roadmap**: This file is the single source of truth. Phase overview archived from `docs/project/ROADMAP_V2_ARCHIVED.md`.

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
Phase 6: TTS Hardening & Stabilization ── COMPLETE (v1.37.1)
  ├── TTS-6C→6S + HOTFIX-11 ✅ (v1.14.0–v1.28.0)
  ├── TTS-7A→7R + EXT-5C + HOTFIX-12 ✅ (v1.29.0–v1.37.1)
  │
  │  Parked feature work (fully spec'd, not priority)
  ├── EINK-6A: E-Ink Foundation (parked)
  ├── EINK-6B: E-Ink Reading Ergonomics (parked)
  └── GOALS-6B: Reading Goal Tracking (parked)
    │
    ▼
SELECTION-1: Word Anchor Contract (BUG-151/152/153 absorbed) ✅
    │
HOTFIX-14: Import & Connection Fixes (BUG-155/156/157/158) ✅
    │
HOTFIX-15: Narration Cursor Polish (BUG-159/160/161) ✅
    │
    ├───────────────────────────────────┐
    ▼                                   ▼
Track A: Flow Infinite Reader    Track B: Chrome Extension Enrichment
  ├── FLOW-INF-A: Reading Zone ✅   ├── EXT-ENR-A: Resilient Connection ✅
  ├── FLOW-INF-B: Timer Cursor ✅  ├── EXT-ENR-B: Auto-Discovery Pairing ✅
  └── FLOW-INF-C: Cross-Book ✅     └── EXT-ENR-C: In-Browser Reader (optional)
    │                                   │
    └──────────────┬────────────────────┘
                   │
    NARR-TIMING: Real Word Timestamps ✅ (v1.44.0)
                   │
    STAB-1A: Startup & Flow Stabilization ✅ (v1.45.0)
                   │
    PERF-1: Full Performance Audit & Remediation ✅ (v1.47.0)
                   │
    REFACTOR-1A: ReaderContainer Decomposition ✅ (v1.48.0)
                   │
    REFACTOR-1B: Component & Style Cleanup ✅ (v1.49.0)
                   │
    TEST-COV-1: Critical Path Test Coverage + Security ✅ (v1.50.0)
                   │
    NARR-LAYER-1A: Narration as Flow Layer — Foundation
                   │
    NARR-LAYER-1B: Narration as Flow Layer — Consolidation
                   │
                   ▼
        Track C: Android APK
          ├── APK-0: Modularization (prerequisite)
          ├── APK-1: WebView Shell + Local Library
          ├── APK-2: All Reading Modes
          ├── APK-3: Bidirectional Sync
          └── APK-4: Mobile-Native Features
                   │
                   ▼
        Phase 7: Cloud Sync Hardening (parallel with APK-3)
                   │
                   ▼
        Phase 8: RSS/News Feeds
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

> All TTS-7E through TTS-7R, EXT-5C, and HOTFIX-12 sprint specs archived to `docs/project/ROADMAP_ARCHIVE.md`.

---

## SELECTION-1: Word Anchor Contract (BUG-151/152/153 absorbed) ✅ COMPLETED

**Goal:** Establish a single, unambiguous answer to "where is the user in the book?" that all reading modes, progress tracking, and UI elements can depend on. Add passive word tracking in page mode so there is always a visible anchor, and fix the mode-start resolution chain so every mode inherits position correctly.

**Problem:** Today, `highlightedWordIndex` is the de facto position anchor, but it only updates via fraction-based estimates on page turn (no DOM truth) and is never visually highlighted during page-mode browsing. Reading modes ask "where do I start?" and the answer depends on which code path was hit. There's no "you are here" marker when passively reading. This gap causes BUG-152 (focus mode gets wrong words), BUG-151 (narration band measurement goes stale without a stable anchor), and the broader BUG-153 (no word selection contract).

**Investigation report:** `docs/investigations/SELECTION-1-investigation.md` — full trace of all 4 word lists, per-mode start resolution, navigation events, persistence, and 6 identified gaps.

### Design Decisions

**Three selection tiers, one resolution order:**

| Tier | Variable | Set By | Visual | Persists Across Page Turn |
|------|----------|--------|--------|---------------------------|
| **Soft selection** | `softWordIndexRef` (new ref) | `findFirstVisibleWordIndex()` on every `onRelocate` + `onLoad` in page mode | `.page-word--soft-selected`: 2px left-border accent, `var(--accent-faded)` | No — auto-updates to first visible word |
| **Hard selection** | `highlightedWordIndex` (existing state) | User word click via `onWordClick` handler | `.page-word--highlighted` (existing): accent background | Yes — persists until user clicks another word or starts a mode |
| **Resume anchor** | `resumeAnchorRef` (existing ref) | Narration pause, book reopen | None (internal ref) | N/A — consumed on mode start |

**Resolution order for mode starts:**
```
resumeAnchorRef > highlightedWordIndex > softWordIndexRef > 0
```

**Key behavioral rules:**
- Soft selection is **only visible in page mode** (no reading mode active). When any mode starts, soft highlight is removed.
- Hard selection **replaces** soft selection visually (only one word highlighted at a time). `userExplicitSelectionRef = true` suppresses soft updates until next page turn.
- Soft selection updates on **every page turn** via `onRelocate`, not just on section load. This is the main new behavior.
- `onRelocate` calls `findFirstVisibleWordIndex()` only in page mode, only when no resume anchor is active, and only when no user explicit selection exists on the current page.

**BUG-151 absorbed:** Cap narration band fallback heights to 40px in FoliatePageView.tsx (3 edit sites: lines 571, 692, 860). Add `measureNarrationBandDimensions()` call on section change when narration is active.

**BUG-152 absorbed:** Fix `ReaderContainer.tsx:1362` — change `words={foliateWordStrings}` to `words={getEffectiveWords()}` so ReaderView receives the same word source the mode timer uses.

**BUG-154 deferred:** Code analysis shows layout switch already fires on click. Likely a perceived-latency issue during Foliate reflow, not a code bug. Parked for live verification.

### Baseline

Existing infrastructure (from investigation report):
- `highlightedWordIndex` state + `highlightedWordIndexRef` ref — shared position anchor (ReaderContainer.tsx:135)
- `resumeAnchorRef` — protected position ref (ReaderContainer.tsx:169)
- `userExplicitSelectionRef` — click guard (ReaderContainer.tsx:173)
- `findFirstVisibleWordIndex()` — DOM query for first visible `.page-word` span (FoliatePageView.tsx:1355-1374)
- `onWordClick` handler — already sets `userExplicitSelectionRef=true`, nulls resume anchor, updates `highlightedWordIndex` (ReaderContainer.tsx:1205-1226)
- `.page-word--highlighted` CSS class — existing click highlight (global.css:3717-3723)
- `onRelocate` handler — fraction-based `highlightedWordIndex` update with mode/anchor guards (ReaderContainer.tsx:1158-1189)
- `onLoad` handler — section-load position restore with `findFirstVisibleWordIndex()` (ReaderContainer.tsx:1227-1274)
- Mode start functions — all follow `resumeAnchorRef > highlightedWordIndex` pattern (useReaderMode.ts:177-400)
- `getEffectiveWords()` — word source resolution (ReaderContainer.tsx:236-252)
- `resolveFoliateStartWord()` — EPUB start word validation (startWordIndex.ts:45-66)

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for word index, selection, anchor entries
3. `docs/investigations/SELECTION-1-investigation.md` — full investigation report (MUST READ — contains all position flow diagrams and gap analysis)
4. `ROADMAP.md` — this section
5. `src/components/ReaderContainer.tsx` — `highlightedWordIndex` (line 135), `resumeAnchorRef` (169), `userExplicitSelectionRef` (173), `getEffectiveWords()` (236-252), book open init (254-288), onRelocate handler (1158-1189), onWordClick (1205-1226), onLoad (1227-1274), ReaderView words prop (1362)
6. `src/hooks/useReaderMode.ts` — mode start functions: startNarration (177-297), startFocus (300-333), startFlow (336-364), handlePauseToPage (367-400)
7. `src/components/FoliatePageView.tsx` — `findFirstVisibleWordIndex()` (1355-1374), click handler (1080-1112), narration band fallback heights (571, 692, 860), `highlightWordByIndex()`, `applyVisualHighlightByIndex()`
8. `src/utils/startWordIndex.ts` — `resolveFoliateStartWord()` (45-66), `getStartWordIndex()` (1-43)
9. `src/styles/global.css` — `.page-word` classes (3706-3730)

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Hephaestus (renderer-scope) | **Add `softWordIndexRef`** — New `useRef<number>(0)` in ReaderContainer, alongside existing `highlightedWordIndexRef`. No React state needed (soft selection is visual-only, no re-renders). | `src/components/ReaderContainer.tsx` | After `highlightedWordIndexRef` declaration (~line 136). Single line addition. |
| 2 | Hephaestus (renderer-scope) | **Add `.page-word--soft-selected` CSS class** — Subtle left-border indicator: `border-left: 2px solid var(--accent-faded); padding-left: 2px; border-radius: 1px;`. Must not conflict with `.page-word--highlighted` (hard selection takes visual priority). | `src/styles/global.css` | After `.page-word--highlighted` block (~line 3723). ~5 lines. |
| 3 | Hephaestus (renderer-scope) | **Wire soft selection into `onRelocate` handler** — After existing `setHighlightedWordIndex(approxWordIdx)` call, add: when `readingMode === "page"` and `!resumeAnchorRef.current` and `!userExplicitSelectionRef.current`, call `foliateApiRef.current.findFirstVisibleWordIndex()`, store in `softWordIndexRef.current`, and call `foliateApiRef.current.applySoftHighlight(softWordIndexRef.current)`. Clear previous soft highlight. | `src/components/ReaderContainer.tsx` | Inside `onRelocate` handler (lines 1158-1189), after the existing `setHighlightedWordIndex` block (~line 1180). ~12 lines. |
| 4 | Hephaestus (renderer-scope) | **Wire soft selection into `onLoad` handler** — After existing `findFirstVisibleWordIndex()` + `highlightWordByIndex()` block, also set `softWordIndexRef.current` and apply `.page-word--soft-selected` CSS. Only when `readingMode === "page"` and no explicit selection. | `src/components/ReaderContainer.tsx` | Inside `onLoad` handler (lines 1227-1274), after the `highlightWordByIndex()` call (~line 1267). ~8 lines. |
| 5 | Hephaestus (renderer-scope) | **Add `applySoftHighlight()` / `clearSoftHighlight()` to FoliatePageView API** — Two functions exposed via `foliateApiRef`: `applySoftHighlight(wordIndex)` adds `.page-word--soft-selected` to the target span (removing from previous), `clearSoftHighlight()` removes from any span. Must query inside Foliate's shadow DOM `doc.body`. Pattern: same as existing `highlightWordByIndex()` but with different CSS class. | `src/components/FoliatePageView.tsx` | Near `highlightWordByIndex()` function. Add two small functions + expose via `useImperativeHandle`. ~15 lines. |
| 6 | Hephaestus (renderer-scope) | **Clear soft highlight on mode start** — In `useReaderMode.ts`, add `foliateApiRef.current?.clearSoftHighlight()` at the top of `startFocus()`, `startFlow()`, and `startNarration()`, after `stopAllModes()`. Soft highlight is only visible in page mode. | `src/hooks/useReaderMode.ts` | After `stopAllModes()` in each of: `startFocus` (~line 302), `startFlow` (~line 338), `startNarration` (~line 179). Single line each, 3 edit sites. |
| 7 | Hephaestus (renderer-scope) | **Update mode start resolution to include `softWordIndexRef`** — In `startFocus()`, `startFlow()`, and `startNarration()`, add `softWordIndexRef.current` as final fallback before 0 in start-word resolution: `resumeAnchorRef.current ?? highlightedWordIndexRef.current ?? softWordIndexRef.current ?? 0`. Currently these functions use `highlightedWordIndexRef.current` as the fallback before `resolveFoliateStartWord()`. Add soft as an intermediate. | `src/hooks/useReaderMode.ts` | In `startFocus` (~line 308, `focusStartSource`), `startFlow` (~line 344), `startNarration` (~line 196, `startWordSource`). Modify the fallback expression at each site. |
| 8 | Hermes (renderer-scope) | **Fix BUG-152 — ReaderView word source** — Change `words={foliateWordStrings}` to `words={getEffectiveWords()}` at ReaderContainer.tsx:1362 so ReaderView receives the same word array that mode timers use. | `src/components/ReaderContainer.tsx` | Line 1362 (the `words=` prop on `<ReaderView>`). Single-line change. |
| 9 | Hermes (renderer-scope) | **Fix BUG-151 — Narration band height cap** — Cap all three fallback height paths to `Math.min(value, 40)`: (a) Line 571: `Math.max(12, from.height)` → `Math.min(Math.max(12, from.height), 40)`, (b) Line 692: `fromWindow.height` → `Math.min(fromWindow.height, 40)`, (c) Line 860: `currentWindow.height` → `Math.min(currentWindow.height, 40)`. Also: add `measureNarrationBandDimensions()` call in the `onRelocate` handler when `readingMode === "narration"`. | `src/components/FoliatePageView.tsx` | Lines 571, 692, 860 (height expressions). Plus ~2 lines in `onRelocate` handler for re-measurement call. |
| 10 | Hephaestus (renderer-scope) | **Suppress soft selection on hard click** — In the existing `onWordClick` handler, add `foliateApiRef.current?.clearSoftHighlight()` after the `userExplicitSelectionRef = true` line. When user clicks a word, the soft indicator disappears and only the hard highlight shows. Reset `userExplicitSelectionRef = false` at the top of the `onRelocate` handler when a new page turn occurs (so soft selection resumes on the next page). | `src/components/ReaderContainer.tsx` | In `onWordClick` (~line 1212, after `userExplicitSelectionRef.current = true`). In `onRelocate` (~line 1160, add reset). ~3 lines total. |
| 11 | Hippocrates | **Tests** — ≥12 new tests covering: (a) `softWordIndexRef` updates on `onRelocate` in page mode, (b) soft selection NOT updated during narration/flow, (c) soft selection cleared on mode start, (d) soft selection cleared on word click (hard selection takes over), (e) mode start resolution order: resume > hard > soft > 0, (f) `getEffectiveWords()` returns full-book words when extraction complete (BUG-152 regression), (g) narration band fallback height capped at 40px (BUG-151 regression), (h) `applySoftHighlight` adds correct CSS class, (i) `clearSoftHighlight` removes CSS class, (j) soft selection resumes after page turn following hard click. | `tests/` | New test file `tests/wordAnchor.test.ts`. |
| 12 | Hippocrates | **`npm test` + `npm run build`** | — | — |
| 13 | Solon | **Spec compliance** — Verify all 15 SUCCESS CRITERIA items met. Cross-reference investigation report gaps (6A-6D) to confirm none were worsened. | — | — |
| 14 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, sprint list), ROADMAP.md (mark SELECTION-1 complete), SPRINT_QUEUE.md (remove entry, log to completed), BUG_REPORT.md (mark BUG-151/152/153 resolved), LESSONS_LEARNED.md (if non-trivial discovery). | All 6 governing docs | — |
| 15 | Hermes | **Git: commit, merge, push** | — | Branch: `sprint/selection-1-word-anchor` |

### Execution Sequence

```
Tasks 1-2 (state + CSS)           — parallel, no dependencies
    ↓
Task 5 (FoliatePageView API)      — needs Task 2 CSS class name
    ↓
Tasks 3-4 (wire into handlers)    — needs Tasks 1 + 5
Tasks 8-9 (BUG-151/152 fixes)    — parallel with Tasks 3-4, independent
Task 6 (clear on mode start)      — needs Task 5
Task 7 (resolution chain update)  — needs Task 1
Task 10 (suppress on hard click)  — needs Task 5
    ↓
Task 11 (tests)                   — after all implementation
Task 12 (npm test + build)        — after tests written
    ↓
Task 13 (Solon spec compliance)
Task 14 (Herodotus docs)
Task 15 (Git)
```

### SUCCESS CRITERIA

1. In page mode, a soft highlight (`.page-word--soft-selected`) is visible on the first visible word after every page turn
2. Soft highlight auto-updates when the user turns pages (not just on section load)
3. Soft highlight is NOT visible during any active reading mode (Focus, Flow, Narration)
4. Soft highlight disappears when user clicks a word (hard selection takes visual priority)
5. Hard selection (`.page-word--highlighted`) persists across page turns within the same section
6. After a hard click, soft selection resumes on the NEXT page turn (not the current page)
7. Mode start resolution order is: `resumeAnchorRef > highlightedWordIndex > softWordIndex > 0`
8. Focus mode displays correct word text from `getEffectiveWords()` — no blank screen (BUG-152 resolved)
9. Narration band fallback height never exceeds 40px (BUG-151 resolved)
10. Narration band re-measures on section change during active narration
11. `softWordIndexRef` is not updated during narration or flow mode (mode callbacks own position)
12. `softWordIndexRef` is not updated when `resumeAnchorRef` is active
13. Existing word click behavior unchanged — `onWordClick` still sets `userExplicitSelectionRef`, clears `resumeAnchorRef`, updates `highlightedWordIndex`
14. ≥12 new tests in `tests/wordAnchor.test.ts`
15. `npm test` passes, `npm run build` succeeds

**BUG-154 disposition:** Parked. Code analysis shows layout switch fires on click. Needs live verification to determine if this is a perceived-latency issue. Not included in this sprint.

**Tier:** Quick | **Depends on:** None — this is the new first sprint in the queue.

---

## HOTFIX-14: Import & Connection Fixes (BUG-155/156/157/158) ✅ COMPLETED

**Goal:** Fix URL extraction fallback, false Chrome extension connection status, add disconnect/reconnect, and simplify library flap.

**Partial shipment (v1.38.1):** BUG-157 (disconnect button) and BUG-158 (library flap) shipped 2026-04-06. Remaining: BUG-155 + BUG-156.

**Investigation report:** `docs/investigations/HOTFIX-14-investigation.md` — URL test results (5/5 pass with Node fetch), full `_clients` Set state diagram, three compounding root causes for false connected status.

**Bugs:**

| ID | Description | Severity | Status |
|----|-------------|----------|--------|
| ~~BUG-157~~ | ~~No disconnect/reconnect button~~ | ~~Medium~~ | ✅ Shipped v1.38.1 |
| ~~BUG-158~~ | ~~Library flap too many categories~~ | ~~Low~~ | ✅ Shipped v1.38.1 |
| BUG-155 | URL extraction fails on WAF-protected sites — missing `fetchWithBrowser` fallback | High | **CLI-READY** |
| BUG-156 | False "Connected" status — unauth clients counted + stale detection + infrequent poll | Medium | **CLI-READY** |

### Investigation Gate — CLEARED

Both BUG-155 and BUG-156 root causes confirmed. Full investigation at `docs/investigations/HOTFIX-14-investigation.md`.

**BUG-155 root cause:** Electron's built-in `fetch()` triggers WAF rejection on sites like EBSCO (HTTP 400 — Chromium TLS fingerprint detected as bot). The `fetchWithBrowser` fallback (hidden BrowserWindow with full session) only exists in the `hasLogin` branch of `misc.js:164-173`. The `else` branch at lines 174-177 has no fallback — error propagates directly to user-facing toast.

**BUG-156 root cause (triple):** (1) `getClientCount()` at `ws-server.js:511` counts ALL clients including unauthenticated — a WebSocket that connected but never sent auth registers as "connected." (2) Dead client detection takes up to 60 seconds (two heartbeat cycles at 30s each). (3) ConnectorsSettings only polls on mount and on short-code expiry (5-minute gap) — stale state persists in UI.

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for URL extraction, WebSocket, extension entries
3. `docs/investigations/HOTFIX-14-investigation.md` — MUST READ — full root cause analysis, state diagrams, fix specs
4. `ROADMAP.md` — this section
5. `main/ipc/misc.js` — URL extraction IPC handler (lines 152-282), WS status handler (lines 377-381)
6. `main/ws-server.js` — `getClientCount()` (line 511), `_clients` lifecycle (add at 144, delete at 152/157/174/465/473)
7. `src/components/settings/ConnectorsSettings.tsx` — connection status polling (lines 27-57)
8. `main/constants.js` — `HEARTBEAT_INTERVAL_MS` (line 39)

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Hermes (electron-scope) | **Fix BUG-155 — Add `fetchWithBrowser` fallback to no-login branch.** Wrap the `else` block at `misc.js:174-177` in try/catch, add `fetchWithBrowser` fallback after catch, mirroring the `hasLogin` branch at lines 164-173. See investigation report §A Fix Spec for exact before/after code. | `main/ipc/misc.js` | Lines 174-177. Replace 3 lines with ~8 lines (try/catch + fallback). |
| 2 | Hermes (electron-scope) | **Fix BUG-156a — Filter `getClientCount()` to authenticated clients only.** Replace `return _clients.size` with a loop that counts only `client.authenticated === true`. See investigation report §B Fix 1 for exact code. | `main/ws-server.js` | Lines 511-513. Replace function body (~3 lines → ~5 lines). |
| 3 | Hermes (renderer-scope) | **Fix BUG-156b — Add periodic status polling in ConnectorsSettings.** Add a `useEffect` with a 5-second `setInterval` that calls `api.getWsShortCode()` and updates `connected` state. Clean up on unmount. See investigation report §B Fix 2 for exact code. | `src/components/settings/ConnectorsSettings.tsx` | Insert after mount useEffect (~line 35). ~8 lines. |
| 4 | Hermes (electron-scope) | **Fix BUG-156c (optional) — Reduce heartbeat interval.** Change `HEARTBEAT_INTERVAL_MS` from 30000 to 15000. Cuts dead-client detection from 60s to 30s. | `main/constants.js` | Line 39. Single value change. |
| 5 | Hippocrates | **Tests** — ≥6 new tests: (a) `getClientCount()` returns 0 when only unauthenticated clients connected, (b) `getClientCount()` returns 1 when one authenticated client connected, (c) URL extraction IPC handler falls through to `fetchWithBrowser` when `fetchWithCookies` throws, (d) URL extraction IPC handler returns result from `fetchWithBrowser` fallback, (e) ConnectorsSettings polls connection status on interval, (f) heartbeat removes dead clients. | `tests/` | New or existing test files. |
| 6 | Hippocrates | **`npm test` + `npm run build`** | — | — |
| 7 | Solon | **Spec compliance** — Verify all 10 SUCCESS CRITERIA items met. | — | — |
| 8 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, test count), ROADMAP.md (mark HOTFIX-14 complete), SPRINT_QUEUE.md (remove, log to completed), BUG_REPORT.md (mark BUG-155/156 resolved). | All 6 governing docs | — |
| 9 | Hermes | **Git: commit, merge, push** | — | Branch: `hotfix/14-import-connection` (reuse existing branch) |

### Execution Sequence

```
Tasks 1-4 (all fixes)    — parallel, independent edit sites
    ↓
Task 5 (tests)            — after all fixes
Task 6 (npm test + build) — after tests written
    ↓
Task 7 (Solon)
Task 8 (Herodotus)
Task 9 (Git)
```

### SUCCESS CRITERIA

1. URL extraction succeeds for EBSCO URL (or any WAF-protected site) via `fetchWithBrowser` fallback
2. URL extraction still succeeds for standard URLs (Wikipedia, Paul Graham, MDN) via primary `fetchWithCookies` path — no regression
3. `getClientCount()` returns 0 when no authenticated clients are connected
4. `getClientCount()` returns correct count with mix of authenticated and unauthenticated clients
5. ConnectorsSettings shows "Disconnected" within 10 seconds of extension disconnect (5s poll + 5s buffer)
6. ConnectorsSettings shows "Connected" only when an authenticated client is present
7. Heartbeat interval reduced to 15 seconds (dead-client window ≤30s)
8. ≥6 new tests
9. `npm test` passes, `npm run build` succeeds
10. BUG-157/158 remain working (no regression from partial shipment)

**Tier:** Quick | **Depends on:** None — investigation gate cleared, all fix specs CLI-ready.

---

## NARR-CURSOR-1: Collapsing Narration Cursor ✅ COMPLETED (v1.40.0)

**Goal:** Replace the fixed-width narration band with a collapsing cursor — a band anchored to the right edge of the current text line whose left edge advances rightward with narration. The band visually communicates "remaining text on this line," shrinking to zero at line end then snapping to full width on the next line.

**Problem:** The current 300px fixed-width band lerps between word positions. Despite the 350ms audio lag ceiling, it feels disconnected — it's a floating rectangle that doesn't visually communicate reading progress within a line. Multiple iterations of per-word tracking (centering, X interpolation, line-scanning) failed to produce a satisfying result.

**Third-party audit:** `docs/reviews/collapsing-cursor-review.zip` + `C:\Users\estra\Downloads\deep-research-report.md`. Audit identified 5 critical issues in the original proposal: singleton measurement fragility, internally inconsistent line-end detection, state model coupling, CSS transition conflicts, and missing clamping policy. All incorporated into this spec.

**Plan file:** `C:\Users\estra\.claude\plans\bright-dazzling-gadget.md` — full corrected architecture.

### Design

**Visual behavior:**
```
Line start:  [████████████████████████████████████████] full column width
Mid-line:                    [██████████████████████████] ~60% remaining
Near end:                                    [██████████] ~20% remaining
Line done → snap:  [████████████████████████████████████████] next line, full width
```

- **Right edge:** Always fixed at the right edge of the current text column (measured per-document from `<p>` ancestor of the current word)
- **Left edge:** Tracks the currently-spoken word's X position (smooth lerp between words via audio-progress fraction)
- **Width:** Derived every tick as `max(8, colRight - leftEdge)` — NEVER stored in state
- **Line completion:** When `width < NARRATION_BAND_MIN_WIDTH_PX` (8px) AND segment type is end-of-line, snap to next line at full width
- **Height:** One line height (existing `narrationBandLineHeightRef`, measured once at narration start)
- **Scope:** Foliate renderer only. Legacy renderer falls back to CSS word highlight.

### Architecture (audit-corrected)

**1. Column right edge: per-document, not singleton.**
Compute `colRight` inside `ensureAudioProgressGlideLoop` at word-change time, using the same `foundDoc` and `frameRect`/`containerRect` already available. Find the `<p>` ancestor of the current word span and use its `.getBoundingClientRect().right`. Store in `narrationColRightRef` (updated per word change, not globally).

**2. Line-end state machine: use `usableNextWindow` gating.**
The existing loop already computes `usableNextWindow` — when the next word is on a different line, it's null. Two segment types:
- **Mid-line** (`usableNextWindow` exists): `to.x` = next word's X. Normal lerp. Width = `colRight - leftEdge`.
- **End-of-line** (`usableNextWindow` is null): `to.x` = `colRight`. Left edge lerps toward right edge. Width collapses toward zero. When width < 8px → snap to next line.

**3. State model: width is derived, never stored.**
Remove `width` from `stableFrom`, `stableTo`, `narrationGlideFromRef`, `narrationGlideToRef`, `narrationLineRailRef`. Store `colRight` as the invariant. Each tick: `width = max(8, colRight - leftEdge)`. Remove `NARRATION_BAND_PAD_PX` constant entirely.

**4. CSS: remove transform transition, simplify gradient.**
Remove `transition: transform 80ms ease` (JS RAF handles all motion). Simplify gradient to 2-stop (`accent/30% → transparent`). Add `will-change: width`. When width < 40px, suppress `border-bottom` via JS.

### Baseline

Existing code to preserve:
- `audioScheduler.ts` — untouched. 350ms lag ceiling (`NARRATION_CURSOR_LAG_MS`) intact
- `measureNarrationWindow` — untouched. Per-word position measurement
- `narrationBandLineHeightRef` — measured once for band height
- `getAudioProgress` — polled by audio glide loop for smooth fraction-based interpolation
- `onWordAdvance` callback chain — fires per word, drives overlay updates
- `hideNarrationOverlay` — resets all animation state
- Justified text injection in `injectStyles`

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for narration band, cursor sync entries
3. `C:\Users\estra\.claude\plans\bright-dazzling-gadget.md` — full corrected architecture
4. `ROADMAP.md` — this section
5. `src/constants.ts` — `NARRATION_BAND_PAD_PX` (~line 108, to be removed), `NARRATION_CURSOR_LAG_MS` (~line 113, keep), `NARRATION_BAND_MIN_WIDTH_PX` (~line 108, already added)
6. `src/components/FoliatePageView.tsx` — Read these sections in order:
   - Refs (~line 457): `narrationBandLineHeightRef`, `narrationBandWidthRef`
   - `measureNarrationBandDimensions` (~line 490)
   - `hideNarrationOverlay` (~line 520)
   - `ensureNarrationOverlayLoop` (~line 552) — fallback estimate loop
   - `ensureAudioProgressGlideLoop` (~line 622) — **primary target for rewrite**
   - `measureNarrationWindow` (~line 824) — DO NOT MODIFY
   - `positionNarrationOverlay` (~line 873)
   - `applyVisualHighlightByIndex` narration path (~line 808)
7. `src/styles/global.css` — `.foliate-narration-highlight` (~line 3832)

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Hermes | **Remove `NARRATION_BAND_PAD_PX`** from constants. Verify `NARRATION_BAND_MIN_WIDTH_PX = 8` already exists at ~line 108. Fix all imports referencing the removed constant. | `src/constants.ts`, `src/components/FoliatePageView.tsx` (import line ~20) | Remove constant definition. Remove from import statement. |
| 2 | Hephaestus (renderer-scope) | **Add `narrationColRightRef`** — New `useRef<number>(0)` near the narration refs (~line 458). Add reset in `hideNarrationOverlay` (~line 520). | `src/components/FoliatePageView.tsx` | After `narrationBandWidthRef` (~line 458). Reset in `hideNarrationOverlay` (~line 540). |
| 3 | Hephaestus (renderer-scope) | **Rewrite `ensureAudioProgressGlideLoop`** (~line 622) — This is the primary change. On word change: (a) compute `colRight` from `<p>` ancestor of current word using `foundDoc`/`frameRect`/`containerRect` already in scope; (b) determine segment type: if `usableNextWindow !== null` → `to.x = usableNextWindow.x` (mid-line), if null → `to.x = colRight` (end-of-line); (c) remove `width` field from `stableFrom`, `stableTo`, `narrationLineRailRef` structs. Per-tick: `leftEdge = lerp(from.x, to.x, fraction)`, `width = max(NARRATION_BAND_MIN_WIDTH_PX, colRight - leftEdge)`. Set `translate3d(leftEdge, y, 0)`, `width = computed`. When width < 40px: `overlay.style.borderBottomColor = 'transparent'`; else restore. When width ≤ 8px AND end-of-line segment: force `narrationGlideWordRef.current = -1` to re-measure (snaps to next line). | `src/components/FoliatePageView.tsx` | Lines ~622-769. Full function body rewrite. |
| 4 | Hephaestus (renderer-scope) | **Update `ensureNarrationOverlayLoop`** (~line 552) — Same derived-width pattern: `width = max(8, colRight - current.x)` each tick. Remove `width` from segment from/target structs. Apply same border suppression at small widths. | `src/components/FoliatePageView.tsx` | Lines ~552-603. |
| 5 | Hephaestus (renderer-scope) | **Update `positionNarrationOverlay`** (~line 873) — On seed: compute `colRight` from anchor word's `<p>` ancestor (same pattern as Task 3). Store in `narrationColRightRef`. Set initial `width = colRight - wordX`. Pass to animation state WITHOUT storing width in structs. | `src/components/FoliatePageView.tsx` | Lines ~873-949. |
| 6 | Hermes (renderer-scope) | **Update CSS `.foliate-narration-highlight`** (~line 3832) — Replace multi-stop gradient with 2-stop: `linear-gradient(90deg, color-mix(in srgb, var(--accent) 30%, transparent) 0%, transparent 100%)`. Remove `transition: transform 80ms ease` (keep `transition: opacity 80ms ease`). Change `will-change` to `transform, width, opacity`. Remove `transform-origin`. | `src/styles/global.css` | Lines ~3832-3851. |
| 7 | Hippocrates | **Tests** — ≥8 new tests: (a) `colRight` measurement from `<p>` ancestor produces valid container-relative coordinate, (b) end-of-line segment sets `to.x = colRight` when `usableNextWindow` is null, (c) mid-line segment sets `to.x = next word X` when `usableNextWindow` exists, (d) width is derived as `colRight - leftEdge` and never stored in glide refs, (e) width clamped to ≥ NARRATION_BAND_MIN_WIDTH_PX, (f) overlay snaps to next line when width reaches min at end-of-line, (g) border-bottom suppressed when width < 40px, (h) `NARRATION_BAND_PAD_PX` constant fully removed (zero references). | `tests/` | New test file `tests/collapsingCursor.test.ts`. |
| 8 | Hippocrates | **`npm test`** — all tests pass (Quick tier, no `npm run build` needed). | — | — |
| 9 | Solon | **Spec compliance** — verify all SUCCESS CRITERIA met. | — | — |
| 10 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, sprint list), ROADMAP.md (mark complete), SPRINT_QUEUE.md (remove, log to completed), LESSONS_LEARNED.md (LL entry for "width derived not stored" pattern and "per-doc measurement" pattern). | All 6 governing docs | — |
| 11 | Hermes | **Git: commit, merge, push** | — | Branch: `sprint/narr-cursor-1-collapsing` |

### Execution Sequence

```
Task 1 (constants cleanup)                — first, unblocks compilation
    ↓
Task 2 (refs)                             — needs clean compilation
    ↓
Tasks 3-5 (loop rewrites + seed)         — sequential: audio loop → fallback loop → seed
    ↓
Task 6 (CSS)                              — parallel with tasks 3-5 (independent)
    ↓
Task 7-8 (tests)                          — after all implementation
    ↓
Task 9 (Solon spec compliance)
Task 10 (Herodotus docs)
Task 11 (Git)
```

### SUCCESS CRITERIA

1. Overlay right edge aligns to the right edge of the current text column (measured from `<p>` ancestor of the spoken word)
2. Overlay left edge advances rightward smoothly as narration progresses through a line
3. Overlay width decreases continuously during narration (derived as `colRight - leftEdge`)
4. Width is NEVER stored in animation state structs — always derived per tick
5. At end of line, overlay collapses to ≤8px then snaps to full-width on the next line
6. Line-end detection uses `usableNextWindow === null` (existing gating), not Y-position comparison
7. `colRight` is computed per-document from the `<p>` ancestor of the current word, not cached globally
8. No CSS `transition: transform` on `.foliate-narration-highlight` — JS RAF handles all motion
9. Gradient is 2-stop (`accent/30% → transparent`) — degrades gracefully at small widths
10. `border-bottom` suppressed (transparent) when width < 40px
11. `NARRATION_BAND_PAD_PX` constant fully removed (zero references in codebase)
12. `audioScheduler.ts` untouched — 350ms lag ceiling preserved
13. `measureNarrationWindow` untouched
14. Two-column layout: overlay stays within the correct column
15. ≥8 new tests in `tests/collapsingCursor.test.ts`
16. `npm test` passes

**Tier:** Quick | **Depends on:** None — fully spec'd, CLI-ready.

---

## HOTFIX-15: Narration Cursor Polish (BUG-159/160/161) ✅ COMPLETED (v1.43.1, 2026-04-07)

**Goal:** Fix three narration cursor issues discovered during extended listening: cursor stretching to full page width (BUG-159), band height too tall and not dynamically scaling (BUG-160), and cursor drifting ahead of audio between truth-syncs (BUG-161 partial mitigation).

**Problem:** After NARR-CURSOR-1 (v1.40.0) shipped the collapsing cursor, extended listening sessions revealed three issues: (1) the cursor occasionally stretches to the full page width when `closest("p")` falls through to a wide container, (2) the band height uses a fixed `+4px` padding that's visually too generous and never re-measures after narration starts, and (3) the character-count heuristic in `computeWordWeights()` causes cumulative cursor drift that becomes visible within a few sentences.

**Relationship to NARR-TIMING:** BUG-161's full fix is NARR-TIMING (real word timestamps replace the heuristic entirely). This hotfix applies a partial mitigation — halving the truth-sync interval from 12→6 words — to limit visible drift until NARR-TIMING ships.

### Baseline

From NARR-CURSOR-1 (v1.40.0):
- `narrationColRightRef` — per-word right-edge measurement from `<p>` ancestor (FoliatePageView.tsx:701, 929)
- `narrationBandLineHeightRef` — measured once at narration start: `lineHeight + 4` (FoliatePageView.tsx:518)
- `measureNarrationBandDimensions()` — called once at narration start (FoliatePageView.tsx:492-520)
- `ensureAudioProgressGlideLoop` — primary RAF loop (FoliatePageView.tsx:628-795)
- `positionNarrationOverlay` — seed function (FoliatePageView.tsx:873-970)
- `computeWordWeights()` — character-count heuristic (audioScheduler.ts:53-72)
- `TTS_CURSOR_TRUTH_SYNC_INTERVAL = 12` — re-anchor frequency (constants.ts:100)
- `.foliate-narration-highlight` — CSS gradient overlay (global.css:3867-3881)

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for narration band, cursor sync, colRight entries
3. `ROADMAP.md` — this section
4. `src/constants.ts` — `NARRATION_BAND_MIN_WIDTH_PX` (~line 108), `TTS_CURSOR_TRUTH_SYNC_INTERVAL` (line 100)
5. `src/components/FoliatePageView.tsx` — Read in order:
   - `measureNarrationBandDimensions()` (lines 492-520) — height measurement
   - `ensureAudioProgressGlideLoop` (lines 628-795) — primary RAF loop, colRight computation at 699-711
   - `positionNarrationOverlay` (lines 873-970) — seed function, colRight at 927-937
6. `src/utils/audioScheduler.ts` — `computeWordWeights()` (lines 53-72), truth-sync interval usage (line 170, 277)
7. `src/styles/global.css` — `.foliate-narration-highlight` (lines 3867-3881)

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Hephaestus (renderer-scope) | **Fix BUG-159 — Tighten `colRight` ancestor resolution.** In `ensureAudioProgressGlideLoop` (line 701) and `positionNarrationOverlay` (line 929), replace `wordEl?.closest("p") \|\| wordEl?.parentElement` with a safer resolution: `wordEl?.closest("p, blockquote, li, figcaption") \|\| wordEl?.parentElement`. Then add a width guard: if the resolved element's `getBoundingClientRect().width` exceeds the scroll container width × 0.95, fall back to the scroll container's right edge minus a 16px margin. Also add a null guard: if `wordEl` is null (word not in DOM), skip the measurement tick entirely — do not update `narrationColRightRef.current`. | `src/components/FoliatePageView.tsx` | Line 701 (glide loop): replace `closest("p")` expression + add width guard (~6 lines). Line 929 (seed): same pattern (~6 lines). Add null-guard `if (!wordEl) return;` before the pEl line at both sites. |
| 2 | Hephaestus (renderer-scope) | **Fix BUG-160a — Proportional band height.** In `measureNarrationBandDimensions()` (line 518), replace `narrationBandLineHeightRef.current = lineHeight + 4` with `narrationBandLineHeightRef.current = Math.ceil(lineHeight * 1.08)`. This scales the padding proportionally rather than fixed-pixel. | `src/components/FoliatePageView.tsx` | Line 518. Single expression change. |
| 3 | Hephaestus (renderer-scope) | **Fix BUG-160b — Dynamic height re-measurement.** In `ensureAudioProgressGlideLoop`, inside the word-change block (after colRight computation, ~line 712), add: measure the current word's computed `lineHeight` via `window.getComputedStyle(wordEl).lineHeight`. If it differs from `narrationBandLineHeightRef.current` by more than 2px, update `narrationBandLineHeightRef.current = Math.ceil(newLineHeight * 1.08)`. This handles mixed font sizes (headings, blockquotes) within the EPUB. | `src/components/FoliatePageView.tsx` | Inside `ensureAudioProgressGlideLoop`, after the colRight block (~line 712). ~6 lines insertion. |
| 4 | Hermes (renderer-scope) | **Fix BUG-161 partial — Halve truth-sync interval.** In `src/constants.ts` line 100, change `TTS_CURSOR_TRUTH_SYNC_INTERVAL = 12` to `TTS_CURSOR_TRUTH_SYNC_INTERVAL = 6`. This doubles the re-anchor frequency, limiting maximum visible drift to ~6 words instead of ~12. | `src/constants.ts` | Line 100. Single value change: `12` → `6`. |
| 5 | Hippocrates | **Tests** — ≥10 new tests: (a) colRight ancestor resolution prefers `<p>` when available, (b) colRight falls back to `<blockquote>`, `<li>`, `<figcaption>` when no `<p>` ancestor, (c) colRight width guard caps to container width when resolved element is too wide, (d) null `wordEl` skips measurement tick (colRight unchanged), (e) band height uses proportional `lineHeight * 1.08` not fixed `+4`, (f) band height re-measures on word change when line height differs by >2px, (g) band height does NOT re-measure when line height difference ≤2px (stability), (h) truth-sync interval is 6 (not 12), (i) end-of-line snap still works after colRight fix (regression), (j) seed function (`positionNarrationOverlay`) uses same tightened ancestor resolution. | `tests/` | New test file `tests/narrationCursorPolish.test.ts`. |
| 6 | Hippocrates | **`npm test`** — all tests pass. | — | — |
| 7 | Solon | **Spec compliance** — verify all 12 SUCCESS CRITERIA items met. | — | — |
| 8 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, bug count, sprint list), ROADMAP.md (mark HOTFIX-15 complete), SPRINT_QUEUE.md (remove, log to completed), BUG_REPORT.md (mark BUG-159/160/161 resolved), LESSONS_LEARNED.md (if non-trivial discovery). | All 6 governing docs | — |
| 9 | Hermes | **Git: commit, merge, push** | — | Branch: `hotfix/15-narration-cursor-polish` |

### Execution Sequence

```
Tasks 1-4 (all fixes)         — parallel, independent edit sites
    ↓
Task 5 (tests)                — after all fixes
Task 6 (npm test)             — after tests written
    ↓
Task 7 (Solon spec compliance)
Task 8 (Herodotus docs)
Task 9 (Git)
```

### SUCCESS CRITERIA

1. Narration cursor right edge never exceeds the current text column width (no full-page stretch)
2. `colRight` ancestor resolution checks `p, blockquote, li, figcaption` before falling back to `parentElement`
3. When resolved ancestor is wider than 95% of scroll container, colRight falls back to container edge minus 16px
4. Null `wordEl` (word not in DOM) skips measurement tick — no garbage values applied to `narrationColRightRef`
5. Band height uses proportional padding (`lineHeight * 1.08`) not fixed `+4px`
6. Band height re-measures on word change when the current word's line height differs by >2px
7. Band height does NOT jitter on same-size words (≤2px tolerance prevents unnecessary updates)
8. `TTS_CURSOR_TRUTH_SYNC_INTERVAL` reduced from 12 to 6 (partial BUG-161 mitigation)
9. Existing collapsing cursor behavior preserved — end-of-line snap, line rail stability, min-width clamp
10. `positionNarrationOverlay` (seed) uses the same tightened ancestor resolution as the glide loop
11. ≥10 new tests in `tests/narrationCursorPolish.test.ts`
12. `npm test` passes

**BUG-161 full fix disposition:** Deferred to NARR-TIMING. Real word-level timestamps eliminate the character-count heuristic entirely. Truth-sync interval reduction is a stopgap.

**Tier:** Quick | **Depends on:** None — investigation gate cleared, all fix specs CLI-ready.

---

## STAB-1A: Startup & Flow Stabilization (BUG-162/163/164/165) ✅ COMPLETED

**Goal:** Fix four user-facing issues discovered during extended testing: book-open freeze with no loading feedback, TTS cold-start latency, TTS chunk-boundary sentence-snap misses, and flow mode scroll/offset failure. All fixes are targeted (Approach A) — minimal refactoring, well-understood root causes.

**Problem:** (1) Opening a book freezes the UI for ~5s while `extractWordsFromView` + `wrapWordsInSpans` run synchronously on the main thread. A `.foliate-loading` div exists in JSX but has no CSS — invisible loading indicator. (2) TTS model loads lazily on first `generate()` call. An existing `tts-kokoro-preload` IPC handler exists but isn't called on book open. (3) Sentence-snap tolerance is ±15 words — too narrow for some paragraph structures, causing mid-sentence chunk boundaries. (4) Flow mode's `buildLineMap()` silently returns an empty array when DOM word spans aren't rendered yet, causing a zombie engine state where scroll, auto-advance, and initial offset all fail.

**Relationship to STAB-1B (deferred):** Ramp-up chunks bypassing the planner, silence stacking at transitions, and flow cursor unification are deferred to STAB-1B pending further investigation. Issue 5 from the original report (collapsing cursor in flow mode) moved to IDEAS.md — it's a feature, not a bug.

### Baseline

- `onSectionLoad` handler (FoliatePageView.tsx:1111-1277) — synchronous extraction + wrapping
- `extractWordsFromView` (FoliatePageView.tsx:188-205) — synchronous DOM walk of all sections
- `wrapWordsInSpans` (FoliatePageView.tsx:236-266) — synchronous DOM mutation, single pass
- `.foliate-loading` div (FoliatePageView.tsx:1883) — rendered conditionally but no CSS
- `loading` state (FoliatePageView.tsx:467) — set true on load, false at line 1547
- `tts-kokoro-preload` IPC handler (main/ipc/tts.js:59-66) — existing preload, not called on book open
- `ttsEngine.preload()` (main/tts-engine.js:270-272) — fire-and-forget model pre-warm
- `ttsEngine.ensureReady()` (main/tts-engine.js:189-229) — lazy load on first generate()
- `snapToSentenceBoundary()` (generationPipeline.ts:117-152) — ±15 word tolerance (line 114)
- `FlowScrollEngine.start()` (FlowScrollEngine.ts:78-117) — calls `buildLineMap()` synchronously
- `buildLineMap()` (FlowScrollEngine.ts:259-286) — queries `[data-word-index]`, returns [] if no spans
- `scrollToLine()` (FlowScrollEngine.ts:364-375) — initial scroll to reading zone position
- `FLOW_LINE_ADVANCE_BUFFER_MS` (constants.ts:412) — 50ms delay before first `animateLine()`

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for book loading, TTS startup, flow mode entries
3. `ROADMAP.md` — this section
4. `src/components/FoliatePageView.tsx` — Read in order:
   - `loading` state (line 467)
   - `extractWordsFromView` (lines 188-205)
   - `wrapWordsInSpans` (lines 236-266)
   - `onSectionLoad` handler (lines 1111-1277) — both Path A (active mode, line 1134) and Path B (page mode, line 1162)
   - `.foliate-loading` JSX (line 1883)
   - `setLoading(false)` (line 1547)
5. `src/styles/global.css` — verify no `.foliate-loading` CSS exists (~line 3880 area)
6. `main/tts-engine.js` — `preload()` (line 270-272), `ensureReady()` (lines 189-229), `generate()` (lines 234-246)
7. `main/ipc/tts.js` — `tts-kokoro-preload` handler (lines 59-66)
8. `src/utils/generationPipeline.ts` — `snapToSentenceBoundary()` (lines 117-152), tolerance constant (line 114)
9. `src/utils/FlowScrollEngine.ts` — `start()` (lines 78-117), `buildLineMap()` (lines 259-286), `scrollToLine()` (lines 364-375), `animateLine()` (lines 296-362)
10. `src/components/ReaderContainer.tsx` — FlowScrollEngine lifecycle effect (lines 1082-1134)
11. `src/constants.ts` — `TTS_COLD_START_CHUNK_WORDS` (line 94), `FLOW_LINE_ADVANCE_BUFFER_MS` (line 412)

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Hermes (renderer-scope) | **Fix BUG-162a — Add `.foliate-loading` CSS.** Add styling for `.foliate-loading` in global.css: centered text, semi-transparent backdrop, spinner animation or pulsing opacity, `z-index: 200` above content. Should be visible and informative during the synchronous freeze. | `src/styles/global.css` | After `.foliate-narration-highlight` block (~line 3881). ~15 lines CSS. |
| 2 | Hephaestus (renderer-scope) | **Fix BUG-162b — Chunk `wrapWordsInSpans` with `setTimeout` yields.** Refactor `wrapWordsInSpans` (FoliatePageView.tsx:236-266) to process block groups in batches, yielding to the event loop between batches via `setTimeout(resolve, 0)`. Each batch wraps N block groups (e.g., 50), then yields. The function signature changes from sync to `async` — callers in `onSectionLoad` (lines 1146, 1174) must `await` it. This breaks the single synchronous freeze into smaller chunks, allowing the loading indicator to render and the UI to remain responsive. | `src/components/FoliatePageView.tsx` | Lines 236-266 (function body rewrite to async + batched). Lines 1146, 1174 (add `await`). Line 1111 (`onSectionLoad` becomes async). |
| 3 | Hermes (electron-scope) | **Fix BUG-163 — Wire TTS preload into book open.** In the book-open IPC handler (or the renderer's book-open path), call `window.electronAPI.ttsKokoroPreload()` (or equivalent IPC) when a book is opened. This triggers the existing `ttsEngine.preload()` fire-and-forget so the model is warm by the time the user presses play. Verify the IPC channel `tts-kokoro-preload` exists in preload.js; if not, add it. | `src/components/ReaderContainer.tsx` or `src/components/LibraryContainer.tsx` | In the book-open flow — after `activeDoc` is set. Single line: `window.electronAPI.ttsKokoroPreload?.()`. Verify `preload.js` exposes the channel. |
| 4 | Hermes (renderer-scope) | **Fix BUG-164 — Widen sentence-snap tolerance to ±25 words.** In `generationPipeline.ts` line 114, change the default tolerance from 15 to 25. This gives `snapToSentenceBoundary()` a wider search window for ramp-up chunks, reducing mid-sentence chunk boundaries. | `src/utils/generationPipeline.ts` | Line 114. Single value change: `15` → `25`. |
| 5 | Hephaestus (renderer-scope) | **Fix BUG-165 — Add retry/wait on `buildLineMap()` in FlowScrollEngine.** In `FlowScrollEngine.start()` (lines 105-117), if `buildLineMap()` returns an empty array, schedule a retry after a short delay (100ms) up to 5 attempts. This handles the race condition where word spans haven't been rendered yet when the engine starts. On final failure, log a warning and remain in stopped state. Also: after successful `buildLineMap()`, ensure `scrollToLine()` uses `behavior: "instant"` for the initial scroll (not smooth) so the reading zone offset is immediate. | `src/utils/FlowScrollEngine.ts` | Lines 78-117 (`start()` method). Wrap `buildLineMap()` call in retry loop. Line 373: change initial scroll behavior to `"instant"`. ~15 lines modified. |
| 6 | Hippocrates | **Tests** — ≥12 new tests: (a) `.foliate-loading` CSS exists and has `z-index` > content, (b) `wrapWordsInSpans` yields to event loop between batches (verify async behavior), (c) `wrapWordsInSpans` produces identical DOM output to the old sync version (no word-wrapping regression), (d) TTS preload IPC is called during book open, (e) `ttsEngine.preload()` calls `ensureReady()` without blocking, (f) sentence-snap tolerance is 25 (not 15), (g) `snapToSentenceBoundary` finds boundaries within ±25 words, (h) `buildLineMap()` retry succeeds on 2nd attempt when spans appear after delay, (i) `buildLineMap()` retry gives up after 5 attempts, (j) initial scroll uses instant behavior (not smooth), (k) FlowScrollEngine enters running state after successful retry, (l) FlowScrollEngine does not enter zombie state on empty `buildLineMap()`. | `tests/` | New test file `tests/startupStabilization.test.ts`. |
| 7 | Hippocrates | **`npm test` + `npm run build`** — all tests pass, build succeeds. | — | — |
| 8 | Solon | **Spec compliance** — verify all 14 SUCCESS CRITERIA items met. | — | — |
| 9 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, bug count, sprint list), ROADMAP.md (mark STAB-1A complete), SPRINT_QUEUE.md (remove, log to completed), BUG_REPORT.md (mark BUG-162/163/164/165 resolved), LESSONS_LEARNED.md (if non-trivial discovery). Pre-composed diffs preferred. | All 6 governing docs | — |
| 10 | Hermes | **Git: commit, merge, push** | — | Branch: `sprint/stab-1a-startup-flow` |

### Execution Sequence

```
Task 1 (CSS)                      — independent, no code deps
Task 2 (wrapWordsInSpans async)   — independent, FoliatePageView only
Task 3 (TTS preload wiring)      — independent, different files
Task 4 (sentence-snap tolerance)  — independent, single constant
Task 5 (buildLineMap retry)       — independent, FlowScrollEngine only
    ↓ (all 5 parallel — zero dependencies between them)
Task 6 (tests)                    — after all implementation
Task 7 (npm test + build)         — after tests written
    ↓
Task 8 (Solon spec compliance)
Task 9 (Herodotus docs)
Task 10 (Git)
```

### SUCCESS CRITERIA

1. `.foliate-loading` has visible CSS styling (centered, semi-transparent backdrop, animated feedback)
2. `wrapWordsInSpans` is async and yields to the event loop between batches — UI remains responsive during word wrapping
3. `wrapWordsInSpans` produces identical DOM output to the previous sync version (no word index regressions)
4. Book open triggers `tts-kokoro-preload` IPC call (fire-and-forget, non-blocking)
5. `ttsEngine.preload()` begins model loading without waiting for user to press play
6. Sentence-snap tolerance widened from ±15 to ±25 words
7. `snapToSentenceBoundary()` successfully finds boundaries within the wider tolerance
8. `buildLineMap()` retries up to 5 times with 100ms delay when it returns empty array
9. FlowScrollEngine does not enter zombie state (running=true, lines=[]) — retries or stops cleanly
10. Initial flow scroll uses instant behavior (no smooth animation delay on start)
11. Flow auto-scroll works after retry succeeds (cursor depletes, lines advance, scroll follows)
12. ≥12 new tests in `tests/startupStabilization.test.ts`
13. `npm test` passes, `npm run build` succeeds
14. No regressions in narration mode (word wrapping async change must not break narration startup)

**STAB-1B disposition:** Deferred. Ramp-up planner integration needs investigation (why TTS-7P excluded it). Silence stacking needs live audio analysis. Flow cursor unification moved to IDEAS.md (feature, not bug).

**Tier:** Full | **Depends on:** None — investigation gate cleared, all fix specs CLI-ready.

---

## PERF-1: Full Performance Audit & Remediation ✅ COMPLETED (v1.47.0, 2026-04-07)

**Goal:** Investigate every performance hotspot across the entire application — main process startup, renderer rendering/re-render cycles, and data-layer I/O — then remediate confirmed findings. Two-phase sprint: Phase A establishes baselines and confirms findings via measurement; Phase B remediates prioritized issues.

**Problem:** Extended development across 44+ sprints has accumulated performance debt in three areas:
1. **Main process startup:** Window creation is blocked by sequential `loadState()` → `initAuth()` → `initSyncEngine()` calls. Folder sync blocks watcher startup (1–60s for new users). Four `require()` calls in `app.whenReady` callback delay module loading.
2. **Renderer re-render churn:** ReaderContainer.tsx has 30+ useEffect hooks and oversized dependency arrays. FoliatePageView `injectStyles` calls `getComputedStyle` 3× per section load (layout thrashing). LibraryContainer keyboard handler rebuilds on 11-dependency array. Voice sync effect fires on every Web Speech voice change (7-item dependency array). WPM input saves on every keystroke (no debounce). No code splitting — entire app in single Vite bundle.
3. **Data layer inefficiency:** EPUB chapter cache is unbounded (no LRU eviction). Settings saves have no debounce. Snoozed doc check every 60s iterates entire library. `fileHashes` in sync-engine accumulates forever. Library index rebuilt on every mutation.

**Investigation gate:** Pre-cleared. Cowork investigation identified 35 issues across 3 domains (3 critical/high in main, 10 high in renderer, 5 high in data layer). Remediation specs below are based on confirmed code-level findings.

### Baseline

**Main process:**
- `main.js` lines 433-455 — `app.whenReady` callback: `loadState()` → `initAuth()` → `initSyncEngine()` all awaited before `createWindow()`
- `main.js` line 435 — `loadState()` reads 4 JSON files sequentially (library.json, settings.json, readingStats.json, syncState.json)
- `main.js` lines 440-441 — `auth.initAuth()` + `syncEngine.initSyncEngine()` awaited sequentially
- `main.js` line 535 — folder sync completes before watcher starts
- `main.js` lines 438-452 — 4 `require()` calls in `app.whenReady` (url-extractor, ws-server, folder-watcher, cloud-storage)

**Renderer:**
- `src/components/FoliatePageView.tsx` lines 1894-1933 — `injectStyles`: 3× `getComputedStyle` per section load
- `src/components/ReaderContainer.tsx` — 1,533 lines, 30+ `useEffect` hooks
- `src/components/ReaderContainer.tsx` lines 438-447 — voice sync effect, 7-item dependency array
- `src/components/LibraryContainer.tsx` line 390 — `kbActions` useMemo with 11-item dependency array
- `src/components/LibraryContainer.tsx` lines 218-221 — WPM persistence on every keystroke, no debounce
- `vite.config.js` — no `manualChunks` or code splitting configured
- `src/styles/global.css` — 5,138 lines, single file

**Data layer:**
- `main/file-parsers.js` — EPUB chapter cache (`chapterCache` Map), no eviction
- `main/ipc/state.js` lines 20-24 — `save-settings` handler, no debounce
- `main/ipc/documents.js` line 150 — snoozed doc check every 60s, iterates full library array
- `main/sync-engine.js` line 39 — `fileHashes` Map, no cleanup/eviction
- `main.js` line 120 — `rebuildLibraryIndex()` called on every library mutation

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for performance-related entries
3. `ROADMAP.md` — this section
4. `main.js` — focus on `app.whenReady` (lines 430-460), `loadState` (line 435), folder sync/watcher (line 535), `rebuildLibraryIndex` (line 120)
5. `main/ipc/state.js` — `save-settings` handler (lines 20-24)
6. `main/ipc/documents.js` — snoozed doc timer (line 150)
7. `main/file-parsers.js` — `chapterCache` (top-level Map declaration + usage)
8. `main/sync-engine.js` — `fileHashes` (line 39), cleanup patterns
9. `src/components/FoliatePageView.tsx` — `injectStyles` (lines 1894-1933)
10. `src/components/ReaderContainer.tsx` — voice sync effect (lines 438-447), all useEffect hooks
11. `src/components/LibraryContainer.tsx` — `kbActions` (line 390), WPM persistence (lines 218-221)
12. `vite.config.js` — current build config
13. `src/constants.ts` — check for existing perf-related constants

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| **Phase A — Measure & Confirm** | | | | |
| 1 | Hephaestus (electron-scope) | **Baseline main process startup.** Add `performance.now()` markers around each step in `app.whenReady` callback: `loadState`, `initAuth`, `initSyncEngine`, `createWindow`, folder sync, watcher start. Log all timings to console. Run app and record baseline. Capture actual ms per step. | `main.js` | Lines 433-455 (wrap each `await` with timing), line 535 (sync/watcher timing). Temporary instrumentation — removed in Phase B. |
| 2 | Hephaestus (renderer-scope) | **Baseline renderer performance.** Add `console.time`/`console.timeEnd` instrumentation to: `injectStyles` (FoliatePageView), `kbActions` recomputation (LibraryContainer), voice sync effect (ReaderContainer). Count re-render frequency for ReaderContainer and LibraryContainer using a render-count ref. Log results. | `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/components/LibraryContainer.tsx` | `injectStyles` (lines 1894-1933), voice sync (lines 438-447), `kbActions` (line 390). Temporary instrumentation. |
| **Phase B — Remediate** | | | | |
| 3 | Athena (electron-scope) | **CRITICAL: Parallelize startup sequence.** Restructure `app.whenReady` to: (a) call `createWindow()` first (or concurrently with non-blocking init), (b) run `initAuth()` and `initSyncEngine()` in parallel via `Promise.all`, (c) defer folder sync to after window is visible. `loadState()` must still complete before `createWindow()` (window needs settings), but auth and sync can run in background. Target: window visible within 200ms of `app.whenReady`. | `main.js` | Lines 433-455. Reorder: `loadState()` → `createWindow()` → `Promise.all([initAuth(), initSyncEngine()])` → folder sync (non-blocking). |
| 4 | Hephaestus (electron-scope) | **Start folder watcher before sync.** Move watcher initialization to before `folderSync()` so new files are detected immediately. Sync can run in background — watcher should not wait for it. | `main.js` | Line 535 area. Swap order: `startWatcher()` before `syncFolder()`. |
| 5 | Hephaestus (renderer-scope) | **Cache root computed styles in `injectStyles`.** Call `getComputedStyle(rootEl)` once at the top of `injectStyles` and read all needed properties from that single snapshot. Eliminates 2 redundant layout thrashes per section load. | `src/components/FoliatePageView.tsx` | Lines 1894-1933. Extract single `const rootStyles = getComputedStyle(document.documentElement)` at top, replace all 3 calls. |
| 6 | Hephaestus (renderer-scope) | **Debounce settings saves.** Add 500ms debounce to `save-settings` IPC handler so rapid changes (WPM slider, toggles) batch into a single write. Use a simple `setTimeout`/`clearTimeout` pattern — no new dependencies. | `main/ipc/state.js` | Lines 20-24. Wrap handler body in debounced writer. Add `let saveTimeout = null` at module level. |
| 7 | Hephaestus (renderer-scope) | **Debounce WPM persistence.** Wrap the WPM `onChange` persistence call in LibraryContainer with a 300ms debounce so keystrokes don't trigger individual saves. | `src/components/LibraryContainer.tsx` | Lines 218-221. Add `useRef` for timeout, clear on each keystroke, save after 300ms idle. |
| 8 | Hephaestus (electron-scope) | **Add LRU eviction to EPUB chapter cache.** Convert `chapterCache` from unbounded Map to LRU with 50-entry cap. On cache set, evict oldest entry if at capacity. Simple implementation — no new dependencies. | `main/file-parsers.js` | `chapterCache` declaration (near top of file) + all `.set()` calls. Replace Map with small LRU class (~15 lines). |
| 9 | Hephaestus (electron-scope) | **Index snoozed doc check.** Replace the 60s full-library scan with a pre-built snoozed-doc index (a Set of doc IDs with active snooze timers). Update the Set on snooze/unsnooze. Timer callback checks only the Set, not the full library. | `main/ipc/documents.js` | Line 150 area. Add `snoozedDocIds` Set, populate on snooze mutation, check Set in timer callback. |
| 10 | Hephaestus (renderer-scope) | **Tighten voice sync dependency array.** The voice sync effect (ReaderContainer lines 438-447) should depend only on `selectedVoiceId` and `ttsEnabled`, not all 7 current deps. Extract the stable values into refs. | `src/components/ReaderContainer.tsx` | Lines 438-447. Move non-trigger deps to refs. Reduce dependency array to 2-3 items. |
| 11 | Hephaestus (renderer-scope) | **Add Vite code splitting.** Configure `manualChunks` in vite.config.js to split: (a) vendor libs (react, foliate-js) into a `vendor` chunk, (b) TTS-related code into a `tts` chunk (lazy-loaded), (c) settings/preferences into a `settings` chunk. | `vite.config.js` | `build.rollupOptions.output.manualChunks` — new config block. |
| 12 | Hephaestus (electron-scope) | **Debounce `rebuildLibraryIndex`.** Wrap the library index rebuild in a 100ms debounce so batch mutations (import of multiple books) trigger only one rebuild. | `main.js` | Line 120 area. Add debounce wrapper around `rebuildLibraryIndex()` calls. |
| 13 | Hermes (electron-scope) | **Remove Phase A instrumentation.** Strip all `performance.now()` markers and `console.time` calls added in Tasks 1-2. | `main.js`, `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx`, `src/components/LibraryContainer.tsx` | All locations touched in Tasks 1-2. |
| 14 | Hippocrates | **Tests** — ≥16 new tests: (a) startup sequence calls `createWindow` before or concurrent with auth/sync init, (b) `initAuth` and `initSyncEngine` run in parallel (Promise.all), (c) folder watcher starts before sync completes, (d) `injectStyles` calls `getComputedStyle` exactly once, (e) settings save is debounced (rapid calls produce single write), (f) WPM persistence is debounced, (g) chapter cache evicts oldest entry at capacity (50), (h) chapter cache size never exceeds 50, (i) snoozed doc check uses index (not full library scan), (j) snoozed doc Set updates on snooze/unsnooze, (k) voice sync effect depends on ≤3 items, (l) Vite config has `manualChunks` with vendor/tts/settings chunks, (m) `rebuildLibraryIndex` is debounced (batch mutations = single rebuild), (n) startup window appears before auth completes, (o) LRU cache returns cached value for recent entry, (p) LRU cache misses evicted entry. | `tests/` | New test file `tests/perfAudit.test.ts`. |
| 15 | Hippocrates | **`npm test` + `npm run build`** — all tests pass, build succeeds. Verify new chunks appear in build output. | — | — |
| 16 | Solon | **Spec compliance** — verify all 18 SUCCESS CRITERIA items met. | — | — |
| 17 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, sprint list, perf baseline notes), ROADMAP.md (mark PERF-1 complete), SPRINT_QUEUE.md (remove, log to completed), LESSONS_LEARNED.md (perf findings as LL entry). Pre-composed diffs preferred. | All governing docs | — |
| 18 | Hermes | **Git: commit, merge, push** | — | Branch: `sprint/perf-1-audit` |

### Execution Sequence

```
Phase A (measure):
  Task 1 (main process instrumentation)  ─┐
  Task 2 (renderer instrumentation)       ─┤ parallel
                                           ─┘
    ↓ (review measurements, confirm findings)

Phase B (remediate — main process):
  Task 3 (parallelize startup)  ─┐
  Task 4 (watcher before sync)  ─┤ sequential (Task 3 restructures the code Task 4 touches)
                                 ─┘
    ↓
Phase B (remediate — renderer):
  Task 5 (cache getComputedStyle)  ─┐
  Task 7 (debounce WPM)           ─┤
  Task 10 (voice sync deps)       ─┤ parallel (independent files/functions)
  Task 11 (Vite code splitting)   ─┤
                                   ─┘
    ↓
Phase B (remediate — data layer):
  Task 6 (debounce settings save)  ─┐
  Task 8 (LRU chapter cache)      ─┤
  Task 9 (snoozed doc index)      ─┤ parallel (independent modules)
  Task 12 (debounce index rebuild) ─┘
    ↓
Cleanup + verify:
  Task 13 (remove instrumentation)
    ↓
  Task 14 (tests)
  Task 15 (npm test + build)
    ↓
  Task 16 (Solon spec compliance)
  Task 17 (Herodotus docs)
  Task 18 (Git)
```

### SUCCESS CRITERIA

1. Window is visible before `initAuth()` and `initSyncEngine()` complete
2. `initAuth()` and `initSyncEngine()` run in parallel (not sequential)
3. Folder watcher starts before folder sync completes
4. `injectStyles` calls `getComputedStyle` exactly once per invocation (not 3×)
5. Settings saves are debounced — 10 rapid calls within 500ms produce ≤2 file writes
6. WPM input persistence is debounced — typing does not trigger per-keystroke saves
7. EPUB chapter cache has LRU eviction with 50-entry cap
8. Chapter cache size never exceeds cap (no unbounded growth)
9. Snoozed doc check uses a pre-built index — does not iterate full library
10. Voice sync useEffect dependency array has ≤3 items (down from 7)
11. Vite build produces separate chunks for vendor, TTS, and settings
12. `rebuildLibraryIndex` is debounced — batch mutations trigger single rebuild
13. No Phase A instrumentation remains in committed code
14. ≥16 new tests in `tests/perfAudit.test.ts`
15. `npm test` passes, `npm run build` succeeds
16. No regressions in narration, flow mode, or library operations
17. Build output shows multiple chunks (not single bundle)
18. Startup-to-window time measurably improved (target: window visible < 500ms after app.whenReady)

**Tier:** Full | **Depends on:** None — investigation gate cleared by Cowork analysis. All remediation targets have confirmed code-level coordinates.

---

## REFACTOR-1A: ReaderContainer Decomposition ✅ COMPLETED (2026-04-07)

**Goal:** Extract 33 useEffect hooks from ReaderContainer.tsx (1,623 lines) into 5 domain-specific custom hooks. This is the single highest-risk maintainability item identified by the post-PERF-1 technical debt audit (finding C-1). Also addresses fileHashes unbounded growth (H-3) and main.js hardcoded constants (M-2) as quick-fix ride-alongs.

**Problem:** ReaderContainer.tsx has 33 useEffect hooks, 11 useState declarations, and 27+ useRef declarations. Effect ordering is impossible to reason about. Re-render cost is high because effects trigger cascading updates. The file is the most complex single component in the codebase and the #1 maintainability risk.

**Approach:** Pure refactoring — no behavior changes. Extract effects into custom hooks by logical domain. Each hook receives props/refs and returns the state it manages. ReaderContainer becomes a thin orchestrator that composes hooks. All existing tests must continue to pass unchanged.

**Investigation gate:** Cleared. Cowork investigation mapped all 33 useEffects to 5 hook groupings with exact line numbers, state variables, and dependency arrays.

### Baseline

- `src/components/ReaderContainer.tsx` — 1,623 lines, 33 useEffects, 11 useState, 27+ useRef
- `main/sync-engine.js` line 39 — `fileHashes: {}` grows unbounded (entries only removed during weekly reconciliation)
- `main.js` lines 24-34 — 11 hardcoded constants (LIBRARY_SAVE_DEBOUNCE_MS, BROADCAST_DEBOUNCE_MS, etc.)
- `src/constants.ts` — 488 lines, well-organized by domain, ready to accept new constants
- No `main/constants.js` exists yet for main-process constants

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for ReaderContainer, useEffect, refactoring entries
3. `ROADMAP.md` — this section
4. `src/components/ReaderContainer.tsx` — read ENTIRE file, map all useEffect/useState/useRef declarations
5. `src/hooks/` — read existing custom hooks to follow project patterns
6. `main/sync-engine.js` — `fileHashes` (line 39), addition sites (lines 526, 539, 540, 578, 607, 633, 1043), removal sites (lines 707, 722-723)
7. `main.js` — hardcoded constants (lines 24-34)
8. `src/constants.ts` — existing structure for reference
9. `main/ipc/documents.js` — library delete handler (check if fileHashes entries are cleaned up)

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Athena (renderer-scope) | **Extract `useNarrationSync` hook.** Move 12 narration-to-settings sync effects (lines 441, 446, 449, 454, 468, 479, 487, 505, 510, 514, 518, 664) into `src/hooks/useNarrationSync.ts`. Hook receives `activeDoc`, `settings`, `narration`, `useFoliate`, and refs. Returns `bookWordMeta`, `setBookWordMeta`, `currentNarrationSectionRef`. Estimated ~150 lines. | `src/hooks/useNarrationSync.ts` (new), `src/components/ReaderContainer.tsx` | Remove 12 useEffects + related state from ReaderContainer. Add hook call at ~line 130 area. |
| 2 | Athena (renderer-scope) | **Extract `useNarrationCaching` hook.** Move 4 TTS caching effects (lines 368, 381, 410, 425) into `src/hooks/useNarrationCaching.ts`. Hook receives `activeDoc`, `settings`, `wordsRef`. Returns `backgroundCacherRef`. Estimated ~100 lines. | `src/hooks/useNarrationCaching.ts` (new), `src/components/ReaderContainer.tsx` | Remove 4 useEffects + backgroundCacherRef from ReaderContainer. |
| 3 | Athena (renderer-scope) | **Extract `useFlowScrollSync` hook.** Move 6 flow/cross-book effects (lines 1121, 1194, 1204, 1211, 1216, 1221) into `src/hooks/useFlowScrollSync.ts`. Hook receives `readingMode`, `effectiveWpm`, `settings`, `useFoliate`, `activeDoc`, `library`, `startFlow`. Returns `flowScrollEngineRef`, `flowPlaying`, `setFlowPlaying`, `flowProgress`, `crossBookTransition`, `setCrossBookTransition`, `pendingFlowResumeRef`. Estimated ~180 lines. | `src/hooks/useFlowScrollSync.ts` (new), `src/components/ReaderContainer.tsx` | Remove 6 useEffects + flow state from ReaderContainer. Lines 1121-1230 area. |
| 4 | Hephaestus (renderer-scope) | **Extract `useFoliateSync` hook.** Move 4 foliate sync effects (lines 347, 518, 636, 664) into `src/hooks/useFoliateSync.ts`. Hook receives `useFoliate`, `readingMode`, `highlightedWordIndex`, `bookWordMeta`, `narration`. Returns `isBrowsedAway`. Estimated ~110 lines. | `src/hooks/useFoliateSync.ts` (new), `src/components/ReaderContainer.tsx` | Remove 4 useEffects + isBrowsedAway state from ReaderContainer. |
| 5 | Hephaestus (renderer-scope) | **Extract `useDocumentLifecycle` hook.** Move 7 lifecycle/cleanup effects (lines 223, 276, 313, 656, 763, 772, 1204) into `src/hooks/useDocumentLifecycle.ts`. Hook receives `activeDoc`, `readingMode`, `settings`, `focusTextSize`, `initReader`. Returns `resumeAnchorRef`, session tracking refs. Estimated ~90 lines. | `src/hooks/useDocumentLifecycle.ts` (new), `src/components/ReaderContainer.tsx` | Remove 7 useEffects + lifecycle refs from ReaderContainer. |
| 6 | Hermes (electron-scope) | **Fix H-3: Add fileHashes cleanup on document delete.** In the library delete handler (ipc/documents.js), after removing a document from library.json, also delete its fileHashes entries: `doc:{docId}:contentHash` and `documents/{docId}.json` and its `:cloudHash` suffix. This prevents unbounded growth between weekly reconciliations. | `main/ipc/documents.js`, `main/sync-engine.js` | In delete handler: add `syncEngine.clearDocHashes(docId)`. In sync-engine.js: add exported `clearDocHashes(docId)` function (~10 lines). |
| 7 | Hermes (electron-scope) | **Fix M-2: Extract main.js constants to `main/constants.js`.** Create `main/constants.js` (CommonJS) with 11 constants from main.js lines 24-34: LIBRARY_SAVE_DEBOUNCE_MS (500), BROADCAST_DEBOUNCE_MS (200), FOLDER_SYNC_DEBOUNCE_MS (1000), FOLDER_SYNC_BATCH_SIZE (4), MAX_RECENT_FOLDERS (5), MAX_HISTORY_SESSIONS (1000), MS_PER_DAY (86400000), AUTO_UPDATE_DELAY_MS (5000), BROWSER_FETCH_TIMEOUT_MS (20000), BROWSER_CONTENT_SETTLE_MS (3000), URL_FETCH_TIMEOUT_MS (15000). Update main.js imports. | `main/constants.js` (new), `main.js` | Lines 24-34: replace inline values with `require('./main/constants')`. |
| 8 | Hippocrates | **Tests** — ≥20 new tests: (a) Each custom hook renders in isolation and produces expected return values, (b) useNarrationSync syncs all 12 settings → narration properties, (c) useNarrationCaching initializes backgroundCacher on mount, (d) useFlowScrollSync creates/destroys engine on mode change, (e) useFlowScrollSync cancels cross-book transition on Escape, (f) useFoliateSync detects browsed-away state, (g) useDocumentLifecycle initializes reader on doc change, (h) ReaderContainer still composes correctly with all hooks, (i) fileHashes entries are cleaned up on document delete, (j) clearDocHashes removes both plain and :cloudHash entries, (k) main/constants.js exports all 11 values with correct types, (l) main.js uses imported constants (not inline values). | `tests/readerDecomposition.test.ts` (new), `tests/fileHashesCleanup.test.ts` (new) | ≥20 tests across 2 new files. |
| 9 | Hippocrates | **`npm test` + `npm run build`** — all existing tests pass (no regressions from refactoring), build succeeds. | — | — |
| 10 | Solon | **Spec compliance** — verify all 16 SUCCESS CRITERIA items met. | — | — |
| 11 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, sprint list, architecture note re: custom hooks), ROADMAP.md (mark REFACTOR-1A complete), SPRINT_QUEUE.md (remove, log to completed), LESSONS_LEARNED.md (if non-trivial discovery), TECHNICAL_REFERENCE.md (update ReaderContainer architecture section). Pre-composed diffs preferred. | All governing docs | — |
| 12 | Hermes | **Git: commit, merge, push** | — | Branch: `sprint/refactor-1a-reader-decomp` |

### Execution Sequence

```
Wave A (implement):
  Task 1 (useNarrationSync)      ─┐
  Task 2 (useNarrationCaching)   ─┤
  Task 4 (useFoliateSync)        ─┤ parallel hooks — all extract from different line ranges
  Task 5 (useDocumentLifecycle)  ─┘
      ↓
  Task 3 (useFlowScrollSync)      ← after Tasks 4-5 (shares some state with lifecycle)
      ↓
  Task 6 (fileHashes cleanup)    ─┐
  Task 7 (constants extraction)  ─┘ parallel — independent modules
      ↓
  Task 8 (tests)
  Task 9 (npm test + build)

Wave B (verify + docs):
  Task 10 (Solon spec compliance)
  Task 11 (Herodotus docs)
  Task 12 (Git)
```

### SUCCESS CRITERIA

1. ReaderContainer.tsx reduced to <700 lines (from 1,623)
2. 5 new custom hooks created in `src/hooks/`: useNarrationSync, useNarrationCaching, useFlowScrollSync, useFoliateSync, useDocumentLifecycle
3. All 33 useEffect hooks moved from ReaderContainer to custom hooks — zero useEffects remain in ReaderContainer except hook composition
4. Each custom hook has a clear single-domain responsibility
5. ReaderContainer composes all 5 hooks and passes their returns to child components
6. All existing tests pass unchanged (pure refactoring, no behavior change)
7. fileHashes entries are cleaned up immediately when a document is deleted (not deferred to weekly reconciliation)
8. `clearDocHashes(docId)` exported from sync-engine.js removes both `doc:{docId}:contentHash` and `documents/{docId}.json` entries (plus `:cloudHash` suffixes)
9. `main/constants.js` exists with all 11 constants from main.js lines 24-34
10. main.js imports from `main/constants.js` (no inline magic numbers)
11. Narration mode works identically before and after refactoring (no regression in word tracking, TTS sync, section navigation)
12. Flow mode works identically (cross-book transitions, engine lifecycle, WPM sync)
13. Page mode works identically (foliate sync, progress saving, keyboard navigation)
14. ≥20 new tests across hook isolation + integration + fileHashes + constants
15. `npm test` passes, `npm run build` succeeds
16. No files accidentally truncated (git diff --stat check)

**Tier:** Full | **Depends on:** None — investigation gate cleared. All 33 useEffects mapped to hook groupings with exact line numbers.

---

## REFACTOR-1B: Component & Style Cleanup ✅ COMPLETED

**Goal:** Address three interrelated style/component debt items from the technical debt audit: FoliatePageView helper extraction (H-2, 1,947 lines), inline style → CSS migration starting with TTSSettings (H-1, 179 inline styles across the codebase, 66 in TTSSettings alone), and global.css domain splitting (M-1, 5,220 lines in a single file). Also split TTSSettings.tsx into sub-components (M-4, 874 lines).

**Problem:** (1) FoliatePageView.tsx at 1,947 lines mixes rendering, word extraction, style injection, and event handling — second-biggest complexity risk after ReaderContainer. (2) 179 inline styles violate PR-7 (CSS custom properties for theming), with TTSSettings alone accounting for 66. (3) global.css at 5,220 lines is a single monolithic file with 40+ logical sections — impossible to navigate and prone to conflicts.

**Approach:** Pure refactoring — no behavior changes. Extract pure functions from FoliatePageView to helpers. Move inline styles to CSS classes. Split global.css along domain boundaries. All existing tests must continue to pass unchanged.

**Investigation gate:** Cleared. Cowork investigation mapped FoliatePageView sections (word extraction lines 36-220, style injection lines 1908-1947), all 66 TTSSettings inline style line numbers, and global.css into 10 domain-based sections with line ranges.

### Baseline

- `src/components/FoliatePageView.tsx` — 1,947 lines. Word extraction (lines 36-220, ~185 lines of pure utilities), style injection (lines 1908-1947, ~40 lines). Main component (lines 376-1907).
- `src/components/settings/TTSSettings.tsx` — 874 lines, 66 inline styles. Sub-component candidates: KokoroStatus (lines 241-390), VoiceSelection (lines 250-340), RateControls (lines 436-469), PauseSettings (lines 471-544), CacheSizeDisplay (lines 675-710), PronunciationOverridesEditor (lines 711-874).
- `src/styles/global.css` — 5,220 lines. Major domains: CSS variables (1-43), reader (296-742), library (744-1062), doc-grid (1910-2667), themes (1231-1792), keyboard (3062-3600), page-reader (3602-4130), onboarding (4540-4803).
- Inline style counts by file: TTSSettings (66), LibraryView (17), SpeedReadingSettings (8), LayoutSettings (7), BugReportModal (7), ReaderView (6), HelpSettings (6) = top 7 files account for 117/179.

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture (especially PR-7: CSS custom properties for theming, no inline styles)
2. `docs/governance/LESSONS_LEARNED.md` — scan for CSS, style, refactoring entries
3. `ROADMAP.md` — this section
4. `src/components/FoliatePageView.tsx` — focus on:
   - Footnote helpers (lines 36-78)
   - DOM utilities (lines 80-111)
   - Word extraction (lines 114-220)
   - `injectStyles()` (lines 1908-1947)
   - Import statements (line 1-34) — what's used where
5. `src/components/settings/TTSSettings.tsx` — full read, identify sub-component boundaries
6. `src/styles/global.css` — scan section headers/comments for domain boundaries
7. `vite.config.js` — verify CSS import handling (code splitting may affect CSS)

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Hephaestus (renderer-scope) | **Extract `foliateHelpers.ts`.** Move pure utility functions from FoliatePageView to `src/utils/foliateHelpers.ts`: `hasToken()` (line 36), `isFootnoteRefElement()` (line 42), `isFootnoteBodyElement()` (line 55), `isSuppressedNarrationTextNode()` (line 68), `getBlockParent()` (line 80), `collectBlockTextNodes()` (line 94), `locateTextOffset()` (line 114), `buildWordsFromTextNodes()` (line 131), `buildWrappedFragmentForNode()` (line 163), `extractWordsFromView()` (line 188), `extractWordsFromSection()` (line 206). ~185 lines. Update FoliatePageView imports. | `src/utils/foliateHelpers.ts` (new), `src/components/FoliatePageView.tsx` | Lines 36-220 → new file. Replace with imports. Also move BLOCK_TAGS constant (line 34). |
| 2 | Hephaestus (renderer-scope) | **Extract `foliateStyles.ts`.** Move `injectStyles()` function from FoliatePageView to `src/utils/foliateStyles.ts`. ~40 lines. Update FoliatePageView imports. | `src/utils/foliateStyles.ts` (new), `src/components/FoliatePageView.tsx` | Lines 1908-1947 → new file. |
| 3 | Hephaestus (renderer-scope) | **Split TTSSettings into sub-components.** Extract from TTSSettings.tsx: (a) `KokoroStatusSection` (lines 241-390) → `src/components/settings/KokoroStatusSection.tsx`, (b) `PauseSettingsSection` (lines 471-544) → `src/components/settings/PauseSettingsSection.tsx`, (c) `PronunciationOverridesEditor` (lines 711-874) → `src/components/settings/PronunciationOverridesEditor.tsx`. TTSSettings becomes a thin layout wrapper (~300 lines). | `src/components/settings/KokoroStatusSection.tsx` (new), `src/components/settings/PauseSettingsSection.tsx` (new), `src/components/settings/PronunciationOverridesEditor.tsx` (new), `src/components/settings/TTSSettings.tsx` | Extract 3 sub-components, replace inline with imports. |
| 4 | Hephaestus (renderer-scope) | **Migrate TTSSettings inline styles to CSS.** Convert all 66 inline `style={{}}` blocks in TTSSettings (and its new sub-components) to CSS classes in a new `src/styles/tts-settings.css`. Use semantic class names (`.tts-voice-select`, `.tts-rate-slider`, `.tts-pause-control`, etc.). Import the CSS file in TTSSettings. | `src/styles/tts-settings.css` (new), `src/components/settings/TTSSettings.tsx`, sub-components | All 66 `style={{` locations. Replace each with `className=`. |
| 5 | Hephaestus (renderer-scope) | **Migrate top-7 component inline styles to CSS.** Convert inline styles in: LibraryView (17), SpeedReadingSettings (8), LayoutSettings (7), BugReportModal (7), ReaderView (6), HelpSettings (6). Add classes to global.css or component-scoped CSS files. Target: reduce remaining inline styles from 179 to <30. | `src/components/LibraryView.tsx`, `src/components/settings/SpeedReadingSettings.tsx`, `src/components/settings/LayoutSettings.tsx`, `src/components/BugReportModal.tsx`, `src/components/ReaderView.tsx`, `src/components/settings/HelpSettings.tsx`, `src/styles/global.css` or new CSS files | All `style={{` locations in these 6 files. |
| 6 | Athena (renderer-scope) | **Split global.css into domain files.** Break global.css (5,220 lines) into 8 domain files: (a) `base.css` (lines 1-150 — variables, reset, scrollbar, buttons, badges, progress), (b) `reader.css` (lines 296-742 — reader view, highlights, definitions, ruler, pause), (c) `library.css` (lines 744-1062 + 1235-1289 + 1910-2667 — library, cards, grid, tabs), (d) `flow.css` (lines 1486-1506 + 5162-5220 — flow mode, cross-book), (e) `themes.css` (lines 1231-1233 + 1541-1792 + 1794-1847 — light/dark/eink/blurby themes), (f) `keyboard.css` (lines 3062-3600 — keyboard UX focus rings), (g) `page-reader.css` (lines 3602-4130 + 3978-4130 — page reader + bottom bar), (h) `onboarding.css` (lines 4540-4803 + 4880-5220 — onboarding, metadata, extension, pairing, cross-book). Create `src/styles/index.css` that imports all 8 + tts-settings.css in correct order. Update `main.tsx` (or equivalent entry) to import `index.css` instead of `global.css`. | `src/styles/base.css` (new), `src/styles/reader.css` (new), `src/styles/library.css` (new), `src/styles/flow.css` (new), `src/styles/themes.css` (new), `src/styles/keyboard.css` (new), `src/styles/page-reader.css` (new), `src/styles/onboarding.css` (new), `src/styles/index.css` (new), `src/styles/global.css` (deleted or emptied) | Split all 5,220 lines across 8 files. |
| 7 | Hermes (renderer-scope) | **Fix M-7: Add descriptive comments to 6 empty catch blocks.** In FoliatePageView.tsx, find the 6 `catch { /* */ }` blocks and add brief comments explaining why the error is intentionally swallowed (e.g., "// Foliate may throw on unmounted view — safe to ignore"). | `src/components/FoliatePageView.tsx` | Grep for `catch.*\/\*` — 6 locations. |
| 8 | Hippocrates | **Tests** — ≥15 new tests: (a) foliateHelpers.ts functions produce identical output to pre-extraction (extractWordsFromView, wrapWordsInSpans, footnote detection), (b) foliateStyles.ts injectStyles applies all expected CSS properties, (c) TTSSettings renders with all sub-components composed, (d) KokoroStatusSection renders model status correctly, (e) PauseSettingsSection renders all pause sliders, (f) PronunciationOverridesEditor renders override table, (g) CSS domain files load without errors (no broken imports), (h) index.css imports all domain files in correct order, (i) inline style count in codebase < 30 (down from 179), (j) FoliatePageView imports from foliateHelpers (not inline), (k) build produces CSS with all domain styles merged. | `tests/componentStyleCleanup.test.ts` (new) | ≥15 tests. |
| 9 | Hippocrates | **`npm test` + `npm run build`** — all tests pass, build succeeds. Verify CSS is correctly bundled (no missing styles in build output). | — | — |
| 10 | Solon | **Spec compliance** — verify all 18 SUCCESS CRITERIA items met. | — | — |
| 11 | Herodotus | **Documentation pass** — Update CLAUDE.md, ROADMAP.md, SPRINT_QUEUE.md, LESSONS_LEARNED.md, TECHNICAL_REFERENCE.md (update file structure). Pre-composed diffs preferred. | All governing docs | — |
| 12 | Hermes | **Git: commit, merge, push** | — | Branch: `sprint/refactor-1b-style-cleanup` |

### Execution Sequence

```
Wave A (implement):
  Task 1 (foliateHelpers extraction)   ─┐
  Task 2 (foliateStyles extraction)    ─┤ parallel — different line ranges of same file
  Task 7 (empty catch comments)        ─┘
      ↓
  Task 3 (TTSSettings sub-components)    ← after FoliatePageView done (avoid merge conflicts)
  Task 4 (TTSSettings inline → CSS)      ← after sub-components extracted
      ↓
  Task 5 (other component inline → CSS)  ← after TTSSettings pattern established
  Task 6 (global.css split)              ← after all CSS migrations done (clean split)
      ↓
  Task 8 (tests)
  Task 9 (npm test + build)

Wave B (verify + docs):
  Task 10 (Solon spec compliance)
  Task 11 (Herodotus docs)
  Task 12 (Git)
```

### SUCCESS CRITERIA

1. FoliatePageView.tsx reduced to <1,750 lines (from 1,947) — helpers and styles extracted
2. `src/utils/foliateHelpers.ts` exists with all word extraction + footnote detection functions (~185 lines)
3. `src/utils/foliateStyles.ts` exists with `injectStyles()` function (~40 lines)
4. TTSSettings.tsx reduced to <350 lines (from 874) — 3 sub-components extracted
5. `KokoroStatusSection.tsx`, `PauseSettingsSection.tsx`, `PronunciationOverridesEditor.tsx` exist in `src/components/settings/`
6. Inline style count across entire `src/components/` directory < 30 (from 179)
7. TTSSettings has 0 inline styles (from 66)
8. `src/styles/tts-settings.css` exists with all TTSSettings styles as CSS classes
9. `global.css` is replaced by 8 domain-specific CSS files imported via `src/styles/index.css`
10. No missing styles in built application — all visual elements render identically to pre-refactoring
11. CSS specificity order preserved (import order in index.css matches original declaration order in global.css)
12. All 6 empty catch blocks in FoliatePageView have descriptive comments
13. ≥15 new tests in `tests/componentStyleCleanup.test.ts`
14. `npm test` passes, `npm run build` succeeds
15. No files accidentally truncated (git diff --stat check)
16. Build output CSS is correctly bundled (single or chunked CSS, no missing imports)
17. All reading modes render identically (page, focus, flow, narration) — no visual regressions
18. Theme switching (light/dark/eink/blurby) works correctly with split CSS files

**Tier:** Full | **Depends on:** REFACTOR-1A (ReaderContainer must be decomposed first — avoids merge conflicts in shared files). Investigation gate cleared.

---

## TEST-COV-1: Critical Path Test Coverage + Security Hardening ✅ COMPLETED (v1.50.0, 2026-04-16)

**Goal:** Add test coverage for the most critical untested paths in the codebase (auth, cloud sync, foliateWordOffsets, ErrorBoundary, queue utilities) and harden URL validation against dangerous schemes. Also fix 401 retry paths so Google and Microsoft cloud requests force a token refresh instead of reusing cached tokens. Addresses audit findings H-4, H-5, H-6 (partial), M-5, and M-6.

**Problem:** (1) Auth module (424 lines) and cloud storage modules (478 + 431 lines) have zero tests — these are the most complex untested paths handling token refresh, OAuth flows, retry logic, and conditional writes. (2) foliateWordOffsets.ts (104 lines) has no dedicated tests despite being critical to narration cursor accuracy. (3) ErrorBoundary.tsx and queue.ts have no tests. (4) `addDocFromUrl` IPC handler accepts unvalidated URLs — file://, javascript:, and data: schemes pass through to fetch without rejection. (5) 401 retries in the Google and Microsoft cloud paths can replay a still-cached token unless the refresh path is explicit.

**Investigation gate:** Cleared. Cowork investigation mapped all exported functions, critical paths, edge cases, and the exact security gap (misc.js line 159 — no scheme validation before fetch).

### Baseline

- `main/auth.js` — 424 lines, 6 exports, 0 tests. Token refresh (lines 186-216, 273-297), PKCE (lines 301-349), encryption (lines 75-111).
- `main/cloud-google.js` — 478 lines. `withRetry()` (line 15), `driveFetch()` (line 42), `getFileId()` (line 72), `readFile()` (line 110), `writeFileConditional()` (line >150).
- `main/cloud-onedrive.js` — 431 lines. `withRetry()` (line 15), `graphFetch()` (line 45), `readFile()` (line 72), `writeFileConditional()` (line 104, 412 conflict detection at line 127).
- `src/utils/foliateWordOffsets.ts` — 104 lines, 3 exports: `getSectionGlobalOffset` (line 30), `resolveRenderedWordIndexToGlobal` (line 47), `resolveGlobalWordIndexToRendered` (line 84).
- `src/components/ErrorBoundary.tsx` — 54 lines. Class component with getDerivedStateFromError + componentDidCatch.
- `src/utils/queue.ts` — 56 lines, 3 exports: `bubbleCount` (line 10), `sortReadingQueue` (line 14), `getNextQueuedBook` (line 43).
- `main/ipc/misc.js` — `addDocFromUrl` handler at line 152. First URL use at line 159 (`getSiteKey(url)`) with no scheme validation. `open-url-in-browser` (line 291) correctly validates http/https at line 295-296.
- Existing sync test coverage: `sync-hardening.test.js` (merge logic), `sync-queue.test.js` (operation queue) — auth/cloud mocked, not tested.

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for auth, cloud, security entries
3. `ROADMAP.md` — this section
4. `main/auth.js` — full read (424 lines)
5. `main/cloud-google.js` — focus on `withRetry()` (line 15), `writeFileConditional()` (line >150)
6. `main/cloud-onedrive.js` — focus on `withRetry()` (line 15), `writeFileConditional()` (line 104)
7. `main/cloud-storage.js` — factory pattern (30 lines)
8. `src/utils/foliateWordOffsets.ts` — full read (104 lines)
9. `src/components/ErrorBoundary.tsx` — full read (54 lines)
10. `src/utils/queue.ts` — full read (56 lines)
11. `main/ipc/misc.js` — `addDocFromUrl` (line 152), `siteLogin` (line 340), `open-url-in-browser` (line 291)
12. `tests/sync-hardening.test.js` — understand existing mock patterns for auth/cloud
13. `main/url-extractor.js` — check if siteLogin path validates URLs

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Hephaestus (electron-scope) | **Fix M-6: Add URL scheme validation to `addDocFromUrl`.** Before line 159, validate that the URL scheme is http or https. Reject file://, javascript:, data:, and other non-http schemes with a descriptive error. Apply the same pattern used in `open-url-in-browser` (line 295-296). Also check `siteLogin` handler (line 340) — add validation if missing. | `main/ipc/misc.js` | Line 152-159 area: add scheme check before `getSiteKey(url)`. Line 340 area: add scheme check before `openSiteLogin(url, ...)`. ~10 lines each. |
| 2 | Hephaestus (electron-scope) | **Write auth.js tests.** Test the 6 exported functions via mocked dependencies. Mock `@azure/msal-node`, `googleapis`, `electron.safeStorage`, `fs.promises`. Cover: (a) `initAuth` restores state from encrypted file, (b) `initAuth` handles missing/corrupted token file, (c) `signIn` routes to correct provider, (d) `signOut` clears tokens and state, (e) `getAccessToken` returns cached token when valid, (f) `getAccessToken` refreshes expired token (Microsoft silent acquire), (g) `getAccessToken` refreshes expired token (Google rotation), (h) `getAccessToken` fires authRequired callback on refresh failure, (i) `getAuthState` returns provider/email/name, (j) token encryption/decryption roundtrip. | `tests/auth.test.js` (new) | ≥10 tests. Mock external deps at module level. |
| 3 | Hephaestus (electron-scope) | **Write cloud-google.js tests.** Mock `driveFetch` internals. Cover: (a) `withRetry` retries on 429/503/504, (b) `withRetry` refreshes token on 401 then retries, (c) `withRetry` throws immediately on non-retryable 4xx, (d) `withRetry` respects max retry count, (e) `readFile` returns buffer, (f) `writeFile` routes to large upload above threshold, (g) `writeFileConditional` includes generation header, (h) `getFileId` caches result for same filename. | `tests/cloudGoogle.test.js` (new) | ≥8 tests. |
| 4 | Hephaestus (electron-scope) | **Write cloud-onedrive.js tests.** Mock `graphFetch` internals. Cover: (a) `withRetry` retries on 429/503/504, (b) `withRetry` refreshes token on 401, (c) `readFile` fetches from approot, (d) `writeFile` routes to large upload above threshold, (e) `writeFileConditional` sets If-Match header when etag provided, (f) `writeFileConditional` returns `{ ok: false, conflict: true }` on 412, (g) `writeFileConditional` falls back to unconditional for large files. | `tests/cloudOnedrive.test.js` (new) | ≥7 tests. |
| 5 | Hephaestus (renderer-scope) | **Write foliateWordOffsets.ts tests.** Cover: (a) `getSectionGlobalOffset` returns correct offset with bookWordSections, (b) `getSectionGlobalOffset` falls back when bookWordSections missing, (c) `resolveRenderedWordIndexToGlobal` maps local→global correctly, (d) `resolveRenderedWordIndexToGlobal` falls back without bookWordSections, (e) `resolveGlobalWordIndexToRendered` maps global→local correctly, (f) boundary: empty loadedWords array, (g) boundary: sectionIndex beyond range, (h) boundary: renderedWordIndex at section boundary, (i) off-by-one: first word of section, (j) off-by-one: last word of section. | `tests/foliateWordOffsets.test.ts` (new) | ≥10 tests. Import functions directly. |
| 6 | Hephaestus (renderer-scope) | **Write ErrorBoundary.tsx tests.** Cover: (a) renders children when no error, (b) catches child error and shows error UI, (c) calls componentDidCatch with error info, (d) calls window.electronAPI.logError if available, (e) handles missing window.electronAPI gracefully, (f) reset button clears error and re-renders children, (g) fires onReset callback on reset. | `tests/errorBoundary.test.tsx` (new) | ≥7 tests. Render with React Testing Library. |
| 7 | Hephaestus (renderer-scope) | **Write queue.ts tests.** Cover: (a) `bubbleCount` returns floor(percent/10), (b) `sortReadingQueue` filters completed docs, (c) `sortReadingQueue` sorts queued by queuePosition, (d) `sortReadingQueue` sorts inProgress by lastReadAt desc, (e) `getNextQueuedBook` returns next in queue excluding current, (f) `getNextQueuedBook` returns null when queue empty, (g) `getNextQueuedBook` skips completed books, (h) boundary: empty docs array, (i) boundary: null queuePosition values, (j) boundary: all docs completed. | `tests/queue.test.ts` (new) | ≥10 tests. |
| 8 | Hippocrates | **`npm test` + `npm run build`** — all tests pass, build succeeds. | — | — |
| 9 | Solon | **Spec compliance** — verify all 16 SUCCESS CRITERIA items met. | — | — |
| 10 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, test counts, security note), ROADMAP.md (mark TEST-COV-1 complete), SPRINT_QUEUE.md (remove, log to completed), LESSONS_LEARNED.md (URL validation pattern), BUG_REPORT.md (if M-6 warrants a bug entry). Pre-composed diffs preferred. | All governing docs | — |
| 11 | Hermes | **Git: commit, merge, push** | — | Branch: `sprint/test-cov-1-critical-paths` |

### Execution Sequence

```
Wave A (implement + test):
  Task 1 (URL scheme validation)        ← security fix first
      ↓
  Task 2 (auth tests)                  ─┐
  Task 3 (cloud-google tests)          ─┤
  Task 4 (cloud-onedrive tests)        ─┤ parallel — all independent test files
  Task 5 (foliateWordOffsets tests)    ─┤
  Task 6 (ErrorBoundary tests)         ─┤
  Task 7 (queue tests)                 ─┘
      ↓
  Task 8 (npm test + build)

Wave B (verify + docs):
  Task 9 (Solon spec compliance)
  Task 10 (Herodotus docs)
  Task 11 (Git)
```

### SUCCESS CRITERIA

1. `addDocFromUrl` rejects file://, javascript:, data:, and other non-http(s) schemes with descriptive error
2. `siteLogin` validates URL scheme before processing (http/https only)
3. ≥10 auth.js tests covering all 6 exported functions + token refresh + encryption
4. ≥8 cloud-google.js tests covering retry logic + conditional writes + file ID caching
5. ≥7 cloud-onedrive.js tests covering retry logic + 412 conflict + If-Match header
6. ≥10 foliateWordOffsets.ts tests covering all 3 exports + boundary conditions + off-by-one
7. ≥7 ErrorBoundary.tsx tests covering error catching + reset + logging
8. ≥10 queue.ts tests covering all 3 exports + edge cases
9. Total new test count ≥52 across 6 new test files
10. All existing tests pass (no regressions)
11. `npm test` passes, `npm run build` succeeds
12. Auth mock patterns are reusable for future cloud/sync tests
13. URL scheme validation follows same pattern as `open-url-in-browser` (consistency)
14. No files accidentally truncated (git diff --stat check)
15. Test files follow existing project test patterns (vitest, describe/it blocks)
16. Security fix is backward-compatible — valid http/https URLs continue to work

**Completion note:** Completed on 2026-04-16. The new tests landed in `tests/auth.test.js` (13), `tests/cloudGoogle.test.js` (10), `tests/cloudOnedrive.test.js` (9), `tests/foliateWordOffsets.test.ts` (15), `tests/errorBoundary.test.tsx` (7), `tests/queue.test.ts` (15), and `tests/url-scheme-validation.test.ts` (6), for 75 new tests total. The suite now reports 1,967 tests across 108 files. Verification passed with `npm test` and `npm run build`; the existing Vite warning `Circular chunk: settings -> tts -> settings` remains.

**Tier:** Full | **Depends on:** None — all targets are independent modules with no shared state. Can run in parallel with REFACTOR-1A/1B. Investigation gate cleared.

---

## NARR-LAYER-1A: Narration as Flow Layer — Foundation

**Goal:** Make narration a layer within flow mode rather than a separate reading mode. When the user activates narration while in flow mode, TTS audio drives word advancement and FlowScrollEngine follows — scrolling and animating the flow timer cursor based on audio progress. The narration band overlay is suppressed; only the flow cursor is visible. This is the MVP: narration is available only in flow mode.

**Problem:** Narration and flow are currently separate, mutually exclusive reading modes. The narration word engine and flow word engine are disconnected — switching from flow to narration loses flow's scroll context, and narration's collapsing cursor overlay (NARR-CURSOR-1) has persistent bugs (BUG-159/160/161 mitigated but not eliminated). The user wants narration to feel like an enhancement to flow mode, not a mode switch.

**Design decisions (from user, 2026-04-07):**
- **MVP scope:** Narration available ONLY in flow mode. Page and focus modes cannot narrate.
- **Keep flow cursor, drop narration band.** The flow timer bar cursor provides visual pacing; the collapsing narration overlay is removed.
- **Scale narration to flow WPM.** Narration's implicit WPM (from TTS rate × ~150 base) can inform flow's scroll pacing.
- **Core insight:** "The issue is the continual disconnect between the word engine and narrate engine, where they're largely disconnected. We have to improve this experience overall."

**Architecture:**

```
BEFORE (v1.49.0):                    AFTER (NARR-LAYER-1A):
                                     
readingMode = "narration"            readingMode = "flow" + isNarrating = true
  ↓                                    ↓
NarrateMode.ts owns word timing      useNarration hook owns word timing (audio)
Narration overlay (collapsing band)      ↓
  ↓                                  onWordAdvance(idx) → FlowScrollEngine.followWord(idx)
Separate scroll system                   ↓
                                     FlowScrollEngine owns scroll + cursor (follower mode)
                                     Timer bar cursor reflects narration's line position
```

**Key integration seam:** FlowScrollEngine already has `jumpToWord(wordIndex)` (line 204). Narration already delegates scroll via callbacks. Both systems operate on the same global word index space. The change: when narrating, narration's `onWordAdvance` calls a new `followWord()` method on FlowScrollEngine that scrolls and animates the cursor without restarting the internal timer.

**Investigation gate:** ✅ CLEARED. Three parallel investigations mapped: (1) FlowScrollEngine's complete API and lifecycle (427 lines, pure TypeScript), (2) useNarration's pipeline (audio → scheduler → word boundaries → onWordAdvance), (3) all 50+ readingMode branch points across the codebase. The seam is clean — narration doesn't own scroll, flow doesn't own audio.

### Baseline

- `src/utils/FlowScrollEngine.ts` — 427 lines. `jumpToWord()` (line 204), `pause()` (line 177), `resume()` (line 189), `animateLine()` (line 321), private fields (lines 56-72). No follower mode concept yet.
- `src/hooks/useFlowScrollSync.ts` — 5 effects. Lifecycle effect creates/destroys engine based on `readingMode === "flow"` and `flowPlaying`. Cross-book transition logic in `onComplete` callback.
- `src/hooks/useNarration.ts` — Narration hook. `startCursorDriven(words, startIdx, wpm, onWordAdvance)`, `pause()`, `resume()`, `stop()`, `getAudioProgress()`. Fires `onWordAdvance(wordIndex)` per word.
- `src/hooks/useNarrationSync.ts` — 10 effects syncing settings → narration.
- `src/hooks/useReaderMode.ts` — `startNarration()` (line 180), `startFlow()` (line 341), `handleSelectMode()` (line 409). Mode cycling at line 465.
- `src/hooks/useReadingModeInstance.ts` — Factory. `case "narration"` at line 166.
- `src/components/ReaderContainer.tsx` — `readingMode` state (line 121). `ttsActive` derived (line 286). Word advance batching differs for narration (lines 380-396).
- `src/components/FoliatePageView.tsx` — Narration overlay: `narrationBandLineHeightRef` (line 294), `narrationColRightRef` (line 296), `hideNarrationOverlay` (line 358), `ensureAudioProgressGlideLoop` (line 464), `positionNarrationOverlay` (line 753).
- `src/components/ReaderBottomBar.tsx` — `isNarrationSelected` flag (line 137), TTS rate vs WPM controls.
- `src/types.ts` — `readingMode: "focus" | "flow" | "narration" | "page"` (line 123).

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for narration, flow, cursor entries
3. `ROADMAP.md` — this section
4. `src/utils/FlowScrollEngine.ts` — FULL READ (427 lines). Key: class definition (line 55), private fields (56-72), `start()` (78-146), `pause()` (177), `resume()` (189), `jumpToWord()` (204-213), `animateLine()` (321-387), `findLineForWord()` (313-318), `scrollToLine()` (389-401)
5. `src/hooks/useFlowScrollSync.ts` — FULL READ. Effect 1 (lifecycle), Effects 3-5 (WPM/zone/lineMap sync)
6. `src/hooks/useNarration.ts` — FULL READ. Focus on: `startCursorDriven`, `onWordAdvance` callback chain, `getAudioProgress()`, `pause()`/`resume()`/`stop()`
7. `src/hooks/useReaderMode.ts` — `startNarration()` (line 180-300), `startFlow()` (line 341-370), `handleSelectMode()` (line 409-420), `handleCycleMode()` (line 465-492)
8. `src/hooks/useReadingModeInstance.ts` — `case "narration"` (line 166-211)
9. `src/components/ReaderContainer.tsx` — `readingMode` state (line 121), `ttsActive` (line 286), word advance batching (lines 380-396), cross-book transition (lines 480-512)
10. `src/components/FoliatePageView.tsx` — narration overlay: `hideNarrationOverlay` (line 358), `ensureAudioProgressGlideLoop` (line 464), `positionNarrationOverlay` (line 753)
11. `src/components/ReaderBottomBar.tsx` — `isNarrationSelected` (line 137), mode-specific controls
12. `src/constants.ts` — flow constants (FLOW_* prefix), narration constants (TTS_* prefix)
13. `src/types.ts` — `readingMode` type (line 123), `lastReadingMode` (line 156)

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Hephaestus (renderer-scope) | **Add `followerMode` to FlowScrollEngine.** Add private field `private followerMode = false` (after line 67). Add `setFollowerMode(enabled: boolean)`: when enabled, pause internal timer (`clearTimers()`), set `this.followerMode = true`; when disabled, set `this.followerMode = false`, resume `animateLine()` if running. Add `followWord(wordIndex: number)`: if not running or not followerMode, return. Find line for word, scroll to it. Compute fractional position within line: `fraction = (wordIndex - line.firstWord) / Math.max(1, line.lastWord - line.firstWord)`. Set cursor width = `Math.max(1, lineWidth * (1 - fraction))` with no transition (instant). Fire `onWordAdvance(wordIndex)`. Update `this.wordIndex` and `this.lineIdx`. | `src/utils/FlowScrollEngine.ts` | Add field after line 67. Add `setFollowerMode()` method after `setWpm()` (line 202). Add `followWord()` method after `jumpToWord()` (line 213). ~30 lines total. |
| 2 | Hephaestus (renderer-scope) | **Export `FlowScrollEngineState.followerMode`.** Add `followerMode: boolean` to `FlowScrollEngineState` interface (line 31-37). Update `getState()` to include it. | `src/utils/FlowScrollEngine.ts` | Line 36 (add field to interface), and inside `getState()` method. 2 single-line additions. |
| 3 | Hephaestus (renderer-scope) | **Add `isNarrating` state to ReaderContainer.** Add `const [isNarrating, setIsNarrating] = useState(false)` after the `readingMode` state (line 121). Add `const isNarratingRef = useRef(false)` and keep synced. Pass to child hooks and components. | `src/components/ReaderContainer.tsx` | After line 121. ~3 lines. Also pass as prop to useFlowScrollSync, useReaderMode, ReaderBottomBar. |
| 4 | Athena (renderer-scope) | **Wire narration→flow in useFlowScrollSync.** Add a 6th effect: when `isNarrating && readingMode === "flow" && flowPlaying`, put engine in follower mode (`engine.setFollowerMode(true)`). Register `narration.onWordAdvance` to call `engine.followWord(idx)`. On cleanup or when `!isNarrating`: take engine out of follower mode, unregister narration callback. Also suppress the engine's own `onComplete` callback during narration — narration's `onSectionEnd` handles section transitions. | `src/hooks/useFlowScrollSync.ts` | New Effect 6 after existing effects. Hook must receive `isNarrating`, `narration` as additional params. ~35 lines. |
| 5 | Hephaestus (renderer-scope) | **Add narration toggle in useReaderMode.** Add `toggleNarrationInFlow()` function: if `readingMode !== "flow"`, ignore. If `!isNarrating`: set `isNarrating(true)`, call `narration.startCursorDriven(words, currentWordIndex, effectiveWpm, onWordAdvance)` using the same word source and start position as flow. If `isNarrating`: set `isNarrating(false)`, call `narration.stop()`. Wire to keyboard handler: `N` key in flow mode triggers `toggleNarrationInFlow()`. Also update `handlePauseToPage()` to stop narration if `isNarrating` before pausing flow. | `src/hooks/useReaderMode.ts` | New function after `startFlow()` (~line 370). Wire into keyboard map. Update `handlePauseToPage()` (~line 373). ~30 lines. |
| 6 | Hephaestus (renderer-scope) | **Suppress narration band overlay when flow+narrating.** In FoliatePageView, modify `applyVisualHighlightByIndex` (the narration branch, ~line 879): if `readingMode === "flow"`, call `hideNarrationOverlay()` instead of `positionNarrationOverlay()`. The flow cursor handles visual feedback. Also: in `ensureAudioProgressGlideLoop` (line 464) and `ensureNarrationOverlayLoop`, add early return if `readingMode === "flow"` — prevent overlay from activating during flow+narrating. | `src/components/FoliatePageView.tsx` | Line 879 area: add `readingMode === "flow"` guard. Line 464 area: add early return. ~6 lines added across 3 sites. |
| 7 | Hephaestus (renderer-scope) | **Update ReaderBottomBar for flow+narrating.** When `readingMode === "flow" && isNarrating`, show TTS rate controls (same as current narration mode) instead of WPM slider. Show a combined status: "Narrating · X% · ~Nmin left". Add a small narration indicator icon or label to the flow controls area. | `src/components/ReaderBottomBar.tsx` | Modify `isNarrationSelected` logic (line 137): `readingMode === "narration" || (readingMode === "flow" && isNarrating)`. Update flow controls section (~lines 384-418) to conditionally show TTS rate. ~15 lines. |
| 8 | Hephaestus (renderer-scope) | **Handle pause/resume for flow+narrating.** In `useReaderMode.handlePauseToPage()` (line 373-405): when `isNarrating`, stop narration AND flow engine. On `handleTogglePlay()` (line 433-444): if `lastReadingMode` restores to flow and narration was active, resume both. Store `wasNarrating` in a ref alongside `lastReadingMode` for resume. | `src/hooks/useReaderMode.ts` | Line 373-405 area (handlePauseToPage). Line 433-444 area (handleTogglePlay). ~15 lines modified. |
| 9 | Hephaestus (renderer-scope) | **Handle cross-book transition for flow+narrating.** In `useFlowScrollSync`, the `onComplete` callback currently handles cross-book transitions. When `isNarrating`, narration's `onSectionEnd` fires instead of the engine's timer completing. Wire `narration.setOnSectionEnd()` to: advance to next section (existing foliate sync behavior), call `narration.updateWords()` with new section's words, let narration continue driving flow. At book end, delegate to the existing cross-book overlay mechanism but also stop narration, then restart on new book. | `src/hooks/useFlowScrollSync.ts` | Inside Effect 6 (from Task 4), wire `narration.setOnSectionEnd`. In cross-book callback (existing `onComplete`), add narration stop/restart. ~20 lines. |
| 10 | Hippocrates | **Tests** — ≥18 new tests: (a) `setFollowerMode(true)` pauses internal timer, (b) `setFollowerMode(false)` resumes timer, (c) `followWord(idx)` scrolls to correct line, (d) `followWord(idx)` sets cursor width based on word fraction within line, (e) `followWord` does nothing when not in follower mode, (f) `isNarrating` state toggles with N key in flow mode, (g) N key ignored outside flow mode, (h) narration starts at current flow word index when toggled on, (i) narration stops and flow resumes own timer when toggled off, (j) narration band overlay suppressed during flow+narrating, (k) flow cursor visible during flow+narrating, (l) bottom bar shows TTS rate controls when flow+narrating, (m) pause/resume affects both narration and flow, (n) cross-book transition works with narration active, (o) `FlowScrollEngineState.followerMode` returns correct value, (p) `followWord` calls `onWordAdvance` callback, (q) `followWord` updates `getState().wordIndex`, (r) follower mode cursor width is `(1-fraction) * lineWidth`. | `tests/narrationLayer.test.ts` (new) | ≥18 tests. |
| 11 | Hippocrates | **`npm test` + `npm run build`** — all tests pass, build succeeds. | — | — |

### Execution Sequence

```
Wave A (implement):
  Task 1-2 (FlowScrollEngine follower mode)  ← foundation, no deps
      ↓
  Task 3 (isNarrating state)                  ← needs Task 1-2 API
      ↓
  Task 4 (wire narration→flow)     ─┐
  Task 5 (toggle + keyboard)       ─┤ parallel — different hooks
  Task 6 (suppress overlay)        ─┘
      ↓
  Task 7 (bottom bar UI)          ─┐
  Task 8 (pause/resume)           ─┤ parallel — different files
  Task 9 (cross-book transition)  ─┘
      ↓
  Task 10-11 (tests + verify)

Wave B (verify + docs + git):
  Solon spec compliance
  Herodotus documentation pass
  Git: commit, merge, push
```

### SUCCESS CRITERIA

1. FlowScrollEngine has `setFollowerMode(enabled)` — when true, internal WPM timer pauses
2. FlowScrollEngine has `followWord(wordIndex)` — scrolls to word's line and sets cursor width to reflect position within line
3. `followWord` cursor width formula: `(1 - fraction) * lineWidth` where `fraction = (wordIndex - firstWord) / (lastWord - firstWord)`
4. `isNarrating` boolean state added to ReaderContainer, toggled via N key in flow mode
5. N key activates narration (TTS) within flow mode — audio plays, flow cursor tracks narration's word position
6. N key deactivates narration — audio stops, flow resumes its own WPM-driven timer
7. N key is ignored when not in flow mode
8. Narration band overlay (collapsing cursor from NARR-CURSOR-1) is NOT visible during flow+narrating
9. Flow timer bar cursor IS visible and reflects narration's line position during flow+narrating
10. Bottom bar shows TTS rate controls (not WPM slider) when flow+narrating
11. Space bar pauses BOTH narration and flow; resuming restores both
12. Cross-book continuous reading works with narration active (transition → new book → narration restarts)
13. All existing flow-only behavior unchanged (no isNarrating = same as before)
14. All existing narration-only behavior unchanged (starting narration from page mode still works — for backward compat, kept until NARR-LAYER-1B removes it)
15. ≥18 new tests in `tests/narrationLayer.test.ts`
16. `npm test` passes, `npm run build` succeeds
17. No regressions in flow mode, narration mode, or page mode

**Tier:** Full | **Depends on:** TEST-COV-1 (test coverage improves confidence for this architectural change). Investigation gate cleared.

---

## NARR-LAYER-1B: Narration as Flow Layer — Consolidation

**Goal:** Remove "narration" as a standalone reading mode now that NARR-LAYER-1A makes narration a layer within flow mode. Eliminate the mode value, the NarrateMode class, the narration overlay code, and all branch points that check `readingMode === "narration"`. Reduce the reading mode type from 4 values to 3: `"page" | "focus" | "flow"`.

**Problem:** After NARR-LAYER-1A, two parallel narration paths exist: the new flow+narrating path AND the legacy standalone narration mode. This duplication increases maintenance burden, testing surface, and user confusion (two ways to do the same thing). NARR-LAYER-1B removes the legacy path and consolidates all narration into the flow layer.

**Key change:** `readingMode` type goes from `"focus" | "flow" | "narration" | "page"` to `"focus" | "flow" | "page"`. Every location that checks for `"narration"` must be updated. The mode cycling changes from `flow → narration → focus → flow` to `flow → focus → flow` (2-mode cycle, page is always the base state).

**Investigation gate:** ✅ CLEARED. Mode branch map identified 50+ locations across ~15 files that reference `"narration"` as a mode value.

### Baseline

Post-NARR-LAYER-1A state:
- `src/types.ts` — `readingMode: "focus" | "flow" | "narration" | "page"` (line 123), `lastReadingMode: "focus" | "flow" | "narration"` (line 156)
- `src/hooks/useReaderMode.ts` — `startNarration()` (line 180-300), `handleSelectMode` takes `"narration"` (line 409), cycle includes narration (line 465-492)
- `src/hooks/useReadingModeInstance.ts` — `case "narration"` factory (line 166-211)
- `src/modes/NarrateMode.ts` — Standalone narration mode class
- `src/components/FoliatePageView.tsx` — Narration overlay code: `narrationBandLineHeightRef` (line 294), `narrationColRightRef` (line 296), `hideNarrationOverlay` (line 358), `ensureAudioProgressGlideLoop` (line 464), `positionNarrationOverlay` (line 753), `ensureNarrationOverlayLoop` (~line 390)
- 50+ branch points across ReaderContainer, ReaderBottomBar, useFlowScrollSync, useFoliateSync, useDocumentLifecycle, useNarrationCaching, useProgressTracker, keyboard hooks

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for narration mode entries
3. `ROADMAP.md` — this section
4. `src/types.ts` — `readingMode` (line 123), `lastReadingMode` (line 156)
5. `src/hooks/useReaderMode.ts` — `startNarration` (line 180), `handleSelectMode` (line 409), `handleCycleMode` (line 465), `handleToggleTts` (line 422)
6. `src/hooks/useReadingModeInstance.ts` — `case "narration"` (line 166-211), `pendingResumeRef` type (line 56, 87)
7. `src/modes/NarrateMode.ts` — FULL READ, then delete
8. `src/modes/ModeInterface.ts` — `ModeType` includes `"narration"` (line 18)
9. `src/components/ReaderContainer.tsx` — grep for `"narration"` and `ttsActive` — every hit is a branch to update
10. `src/components/FoliatePageView.tsx` — grep for `narration` — overlay code to remove, `applyVisualHighlightByIndex` narration branch
11. `src/components/ReaderBottomBar.tsx` — `isNarrationSelected` (line 137), hotkey hints, mode-specific UI
12. `src/hooks/useFoliateSync.ts` — `readingMode !== "narration"` guard
13. `src/hooks/useDocumentLifecycle.ts` — `readingMode === "narration"` guard
14. `src/hooks/useNarrationCaching.ts` — `readingMode !== "narration"` guard
15. `src/hooks/useProgressTracker.ts` — mode logging
16. `src/styles/global.css` (or domain files) — `.foliate-narration-highlight` CSS

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Athena (renderer-scope) | **Remove "narration" from type system.** Change `readingMode` type from `"focus" \| "flow" \| "narration" \| "page"` to `"focus" \| "flow" \| "page"` (types.ts:123). Change `lastReadingMode` to `"focus" \| "flow"` (types.ts:156). Update `ModeType` in ModeInterface.ts (line 18). Update `handleSelectMode` parameter type (useReaderMode.ts:409). Add `isNarrating` to `BlurbySettings` (types.ts) for persistence. | `src/types.ts`, `src/modes/ModeInterface.ts`, `src/hooks/useReaderMode.ts` | types.ts:123, types.ts:156, ModeInterface.ts:18, useReaderMode.ts:409, types.ts (add `isNarrating: boolean` to BlurbySettings). ~8 lines changed. |
| 2 | Athena (renderer-scope) | **Remove `startNarration()` and narration from mode routing.** Delete `startNarration` function body (useReaderMode.ts:180-300). Remove from `handleSelectMode` (line 417). Remove from `handleTogglePlay` restore (line 437). Update `handleCycleMode` to 2-mode cycle: `flow → focus → flow` (line 465-492). Remove `handleToggleTts` (line 422). Remove from exports and dependency arrays. | `src/hooks/useReaderMode.ts` | Lines 180-300 (delete), 409-420 (remove narration branch), 422 (delete), 436-438 (remove narration branch), 465-492 (simplify cycle). |
| 3 | Hephaestus (renderer-scope) | **Remove `case "narration"` from mode instance factory.** Delete the narration case block (useReadingModeInstance.ts:166-211). Update `pendingResumeRef` type to remove `"narration"` (lines 56, 87). Remove truth-sync cleanup guard (line 132). | `src/hooks/useReadingModeInstance.ts` | Lines 166-211 (delete case), 56 (update type), 87 (update type), 132 (remove guard). |
| 4 | Hermes (renderer-scope) | **Delete NarrateMode.ts.** Remove the file entirely. Remove its import from useReadingModeInstance.ts. | `src/modes/NarrateMode.ts` (delete), `src/hooks/useReadingModeInstance.ts` | Delete file. Remove import line. |
| 5 | Athena (renderer-scope) | **Update all ReaderContainer narration branches.** Grep for `"narration"` and `ttsActive` in ReaderContainer.tsx. For each: (a) `ttsActive` (line 286): change to `isNarrating` (already available from state), (b) word advance batching (line 380): condition on `isNarrating` not `readingMode === "narration"`, (c) `isActivelyReading` (line 188): replace `readingMode === "narration"` with `isNarrating`, (d) legacy mode map (line 192): remove narration entry, (e) all other `"narration"` checks: replace with `isNarrating` or remove. ~15 edit sites. | `src/components/ReaderContainer.tsx` | Lines 188, 192, 286, 380, 396, 499, 623, 751, 800, 823, 883, 979, 1126, 1130. Each: replace `readingMode === "narration"` with `isNarrating` or equivalent. |
| 6 | Hephaestus (renderer-scope) | **Remove narration overlay code from FoliatePageView.** Delete: `narrationBandLineHeightRef` (line 294), `narrationColRightRef` (line 296), `hideNarrationOverlay` function (line 358+), `ensureNarrationOverlayLoop` (~line 390), `ensureAudioProgressGlideLoop` (line 464+), `positionNarrationOverlay` (line 753+), `measureNarrationBandDimensions` (~line 340). Remove all narration-specific branches in `applyVisualHighlightByIndex`. Remove calls to `hideNarrationOverlay` throughout (lines 1214, 1613, etc.). ~250 lines of overlay code removed. | `src/components/FoliatePageView.tsx` | Lines 294-296 (refs), 340-370 (measure+hide), 390-470 (fallback loop), 464-650 (glide loop), 753-850 (position overlay). Remove all. |
| 7 | Hephaestus (renderer-scope) | **Update auxiliary hooks.** (a) `useFoliateSync.ts`: change `readingMode !== "narration"` guard to `!isNarrating`. (b) `useDocumentLifecycle.ts`: change `readingMode === "narration"` guard to `isNarrating`. (c) `useNarrationCaching.ts`: change `readingMode !== "narration"` guard to `!isNarrating`. (d) `useProgressTracker.ts`: log `isNarrating` flag instead of mode string. Each hook must receive `isNarrating` as parameter. | `src/hooks/useFoliateSync.ts`, `src/hooks/useDocumentLifecycle.ts`, `src/hooks/useNarrationCaching.ts`, `src/hooks/useProgressTracker.ts` | One guard expression change per file + parameter addition. ~4 lines each. |
| 8 | Hephaestus (renderer-scope) | **Update ReaderBottomBar.** Remove narration-specific hotkey hints (line 59: `"narration"` case). Update `isNarrationSelected` to use only `isNarrating` (remove `readingMode === "narration"` check). Remove narration-specific UI sections that duplicate flow+narrating UI. Mode selector buttons: remove narration button, keep flow and focus. | `src/components/ReaderBottomBar.tsx` | Lines 57-62 (hotkey hints), 137 (isNarrationSelected), mode buttons section. ~15 lines changed. |
| 9 | Hermes (renderer-scope) | **Remove `.foliate-narration-highlight` CSS.** Delete the CSS class and all narration overlay styling from the domain CSS files. Also remove any narration-band-specific CSS custom properties. | `src/styles/reader.css` or appropriate domain file | Grep for `narration-highlight` — delete the block (~20 lines). |
| 10 | Hephaestus (renderer-scope) | **Settings migration.** On app startup, if `settings.readingMode === "narration"`, migrate to `"flow"` with `isNarrating: true`. If `settings.lastReadingMode === "narration"`, migrate to `"flow"`. Add migration in the settings load path. | `main/ipc/state.js` or settings initialization | In settings load handler, after reading JSON. ~10 lines. |
| 11 | Hippocrates | **Tests** — ≥20 new tests: (a) `readingMode` type no longer accepts `"narration"`, (b) mode cycling is flow→focus→flow (no narration), (c) N key in flow mode toggles narration (preserved from 1A), (d) `startNarration()` no longer exists on useReaderMode, (e) NarrateMode.ts file does not exist, (f) FoliatePageView has no narration overlay refs, (g) `ensureAudioProgressGlideLoop` does not exist, (h) `positionNarrationOverlay` does not exist, (i) `.foliate-narration-highlight` CSS class does not exist, (j) settings with `readingMode: "narration"` migrate to `"flow"` + `isNarrating: true`, (k) `isNarrating` is persisted to settings, (l) `ttsActive` replaced by `isNarrating` in ReaderContainer, (m) useFoliateSync uses `isNarrating` guard, (n) useDocumentLifecycle uses `isNarrating` guard, (o) useNarrationCaching uses `isNarrating` guard, (p) bottom bar mode selector has no narration button, (q) bottom bar shows TTS controls when `isNarrating`, (r) existing flow tests pass unchanged, (s) existing focus tests pass unchanged, (t) keyboard shortcut map has no narration-mode-specific entries. | `tests/narrationLayerConsolidation.test.ts` (new) | ≥20 tests. |
| 12 | Hippocrates | **`npm test` + `npm run build`** — all tests pass, build succeeds. | — | — |

### Execution Sequence

```
Wave A (type system + mode routing):
  Task 1 (remove from type system)          ← must be first, everything depends on types
      ↓
  Task 2 (remove startNarration + routing)  ─┐
  Task 3 (remove mode instance case)        ─┤ parallel — different files
  Task 4 (delete NarrateMode.ts)            ─┘
      ↓
Wave B (branch cleanup):
  Task 5 (ReaderContainer branches)          ← biggest change, ~15 sites
  Task 6 (FoliatePageView overlay removal)   ← largest deletion (~250 lines)
  Task 7 (auxiliary hooks)                   ─┐
  Task 8 (bottom bar)                        ─┤ parallel — different files
  Task 9 (CSS removal)                       ─┤
  Task 10 (settings migration)              ─┘
      ↓
Wave C (verify):
  Task 11-12 (tests + build)
      ↓
  Solon spec compliance
  Herodotus documentation pass
  Git: commit, merge, push
```

### SUCCESS CRITERIA

1. `readingMode` type is `"focus" | "flow" | "page"` — no `"narration"` value
2. `lastReadingMode` type is `"focus" | "flow"` — no `"narration"` value
3. `NarrateMode.ts` file deleted
4. `startNarration()` function removed from `useReaderMode`
5. Mode cycling is `flow → focus → flow` (2-mode cycle)
6. Zero references to `readingMode === "narration"` in codebase (grep returns 0 hits)
7. Zero references to `"narration"` as a mode string in `src/` (except comments/docs)
8. FoliatePageView has no narration overlay code (no `ensureAudioProgressGlideLoop`, `positionNarrationOverlay`, `hideNarrationOverlay`, `narrationColRightRef`, `narrationBandLineHeightRef`)
9. `.foliate-narration-highlight` CSS class removed
10. Settings migration: existing users with `readingMode: "narration"` auto-migrate to `"flow"` + `isNarrating: true`
11. `isNarrating` flag persists in settings and restores on app restart
12. All reading modes work: page (browse), focus (RSVP), flow (auto-scroll), flow+narrating (TTS-driven scroll)
13. No narration overlay visible in any mode (flow cursor only)
14. FoliatePageView reduced by ~250 lines (overlay code removed)
15. ≥20 new tests in `tests/narrationLayerConsolidation.test.ts`
16. `npm test` passes, `npm run build` succeeds
17. No regressions in flow mode, focus mode, or page mode

**Tier:** Full | **Depends on:** NARR-LAYER-1A (foundation must ship first — backward compat path needed for migration).

---

## Track A: Flow Infinite Reader (FLOW-INF)

> **Vision:** Flow mode evolves from "auto-scrolling EPUB reader" into a true infinite reading experience — a visually distinct reading zone guides the eye, a timer-bar cursor shows pacing, and finishing one book seamlessly loads the next from the reading queue.

### Current State (v1.37.1)

Flow mode today:
- **FlowMode.ts** — Timing-only class. `setTimeout` chain at WPM, emits `onWordAdvance`. Supports pause/resume, rhythm pauses (half of Focus mode duration).
- **FlowScrollEngine.ts** — Imperative class. Builds `LineInfo[]` from DOM word spans. Animates per-line: underline cursor shrinks from full width to 0px. Scrolls target line to 25% of viewport (`FLOW_READING_ZONE_POSITION`). Manual scroll detection pauses auto-advance for 2s.
- **CSS** — `.foliate-flow-cursor`: 3px accent-colored underline, `transition: transform 0.08s linear, width 0.08s linear`. No reading zone band. No de-emphasis. No timer bar.
- **Foliate integration** — `flow="scrolled"` disables pagination, single-column layout, scroll container exposed to engine.

### What's Missing

| Feature | Current | Target |
|---------|---------|--------|
| Reading zone band | Implicit (scroll position only) | Visually distinct 3-5 line band, content above/below de-emphasized |
| Timer/depletion cursor | Line width shrinks (internal) | Visible timer bar depleting left→right per line, user-facing progress |
| Cross-book reading | Stops at book end | Auto-loads next from queue, seamless transition |
| Zone position | Hardcoded 25% | User-configurable (top third, center, bottom third) |
| Progress feedback | None during flow | Persistent progress indicator (% through book, chapter) |

### Investigation Gate — Track A: ✅ CLEARED

All three investigation areas resolved by Cowork (2026-04-06):
- **Overlay approach:** CSS `mask-image` gradient on `.foliate-page-view--flow`. Applies to the scroll container's visual output — content outside the reading zone becomes semi-transparent. Zero extra DOM elements, no Foliate shadow DOM access, no pointer-events issues. Chromium 131+ (Electron 41) fully supports unprefixed `mask-image`. GPU-composited — one gradient mask on a single element, no per-frame repaints.
- **De-emphasis rendering:** `mask-image` with alpha gradient. `rgba(0,0,0,0.35)` outside zone = 35% visible (gentle de-emphasis). `rgba(0,0,0,1.0)` inside zone = fully visible. Soft 2% transition band at edges prevents hard cutoff. No DOM manipulation inside shadow DOM needed.
- **Settings integration:** Zone position and zone size settings added to `flowSettings` in BlurbySettings. Exposed in ReaderBottomBar as flow-mode-only controls (quick access during reading). No new settings sub-page needed.

### Sprint FLOW-INF-A: Reading Zone & Visual Pacing ✅ COMPLETED

**Goal:** Add a visually distinct reading zone to flow mode — a 3-5 line band where the active text lives, with de-emphasized content above and below. Users should feel like they're reading through a focused window.

**Version:** v1.41.0 | **Branch:** `sprint/flow-inf-a-reading-zone` | **Tier:** Full

**Baseline (post-NARR-CURSOR-1):** Flow mode uses `FlowScrollEngine.ts` (345 lines) — `LineInfo[]` built from DOM, cursor shrinks per line, reading zone at 25% viewport via `FLOW_READING_ZONE_POSITION`. No visual zone overlay, no de-emphasis, no configurable zone position. Container div at FoliatePageView.tsx:1779 becomes scroll container in flow mode (`overflow: auto`).

**Design:**
```
┌──────────────────────────────────┐
│  De-emphasized (35% visible)     │  ← mask-image alpha = 0.35
│  ...previous text...             │
│                                  │
│══════════════════════════════════│  ← soft edge (2% gradient transition)
│  READING ZONE (fully visible)    │  ← mask-image alpha = 1.0
│  Active text — current line      │
│  here, cursor shrinks below      │
│══════════════════════════════════│  ← soft edge
│                                  │
│  De-emphasized (35% visible)     │  ← mask-image alpha = 0.35
│  ...upcoming text...             │
└──────────────────────────────────┘
```

CSS `mask-image` gradient on `.foliate-page-view--flow` with dynamic CSS custom properties:
- `--flow-zone-top`: percentage from top of container to zone start (default: 20%)
- `--flow-zone-bottom`: percentage from top of container to zone end (default: 45%)
- Computed from: `zonePosition × 100%` for top, `(zonePosition + zoneHeight) × 100%` for bottom
- `zoneHeight` = (lineHeight × zoneLines) / containerHeight

**WHERE (read order):**
1. `src/utils/FlowScrollEngine.ts` — full engine (345 lines). Key: `scrollToLine()` at line 307, `LineInfo` interface at line 18, `FLOW_READING_ZONE_POSITION` usage at line 311
2. `src/components/FoliatePageView.tsx` — flow mode sections: container div at line 1779, flow cursor at line 1812, flow activation effect at line 1552-1584, scroll container ref setup at line 1567-1583
3. `src/constants.ts` — `FLOW_READING_ZONE_POSITION = 0.25` at line 450, `FLOW_CURSOR_HEIGHT_PX = 3` at line 452
4. `src/styles/global.css` — `.foliate-flow-cursor` class, `.foliate-page-view--flow` class
5. `src/components/ReaderBottomBar.tsx` — bottom bar controls, existing mode-specific sections
6. `src/types/types.ts` — `BlurbySettings` interface, `flowSettings` sub-object (if exists, else add)

**Tasks:**

| # | Task | Agent | Scope | Edit Site |
|---|------|-------|-------|-----------|
| 1 | **Add flow zone constants** — `FLOW_ZONE_LINES_DEFAULT = 5`, `FLOW_ZONE_LINES_MIN = 3`, `FLOW_ZONE_LINES_MAX = 8`, `FLOW_ZONE_OPACITY = 0.35` (de-emphasis level), `FLOW_ZONE_EDGE_PCT = 2` (soft edge transition width in %). Remove or deprecate `FLOW_READING_ZONE_POSITION` constant (now user-configurable). | Hermes | `src/constants.ts` | After line 458 (after `FLOW_LINE_ADVANCE_BUFFER_MS`). Also update `DEFAULT_SETTINGS` if `flowSettings` sub-object is added. |
| 2 | **Add flow zone settings to BlurbySettings** — Add `flowZonePosition: number` (0.15 \| 0.35 \| 0.55, default 0.25) and `flowZoneLines: number` (3-8, default 5) to BlurbySettings type. Wire through settings load/save. | Hephaestus | `src/types/types.ts`, `src/constants.ts` | In `BlurbySettings` interface — add fields. In `DEFAULT_SETTINGS` — add defaults. |
| 3 | **Add CSS mask-image to `.foliate-page-view--flow`** — When flow zone is active, apply `mask-image: linear-gradient(to bottom, rgba(0,0,0,OPACITY) 0%, rgba(0,0,0,OPACITY) calc(var(--flow-zone-top) - EDGE%), rgba(0,0,0,1) var(--flow-zone-top), rgba(0,0,0,1) var(--flow-zone-bottom), rgba(0,0,0,OPACITY) calc(var(--flow-zone-bottom) + EDGE%), rgba(0,0,0,OPACITY) 100%)`. Use both `-webkit-mask-image` and `mask-image` for safety. Add CSS custom properties `--flow-zone-top` and `--flow-zone-bottom` with default values. | Hephaestus | `src/styles/global.css` | Find `.foliate-page-view--flow` class. Add mask-image rule. If class doesn't exist, create it. |
| 4 | **Compute zone CSS custom properties in FoliatePageView** — In the flow mode activation effect (line 1552-1584), after scroll container is set up: compute `--flow-zone-top` and `--flow-zone-bottom` from `settings.flowZonePosition`, `settings.flowZoneLines`, and measured line height. Set via `containerRef.current.style.setProperty()`. Re-compute on container resize (add ResizeObserver). | Hephaestus | `src/components/FoliatePageView.tsx` | Lines 1552-1584 (flow mode useEffect). Add computation after line 1583 (after scroll container ref is set). Add ResizeObserver for the container to recompute on resize. |
| 5 | **Update FlowScrollEngine to accept dynamic zone position** — Replace hardcoded `FLOW_READING_ZONE_POSITION` in `scrollToLine()` (line 311) with a `zonePosition` property set via a new `setZonePosition(pos: number)` method. Constructor or `start()` accepts initial value from settings. | Hephaestus | `src/utils/FlowScrollEngine.ts` | Line 311: replace `FLOW_READING_ZONE_POSITION` with `this.zonePosition`. Add property (line ~42) and setter method. Update `start()` (line 62) to accept `zonePosition` param. |
| 6 | **Add zone controls to ReaderBottomBar** — Flow-mode-only controls: zone position dropdown (Top / Center / Bottom, maps to 0.15/0.35/0.55) and zone lines slider (3-8). Only visible when `readingMode === "flow"`. Update settings on change. | Hephaestus | `src/components/ReaderBottomBar.tsx` | Find the flow-mode section of the bottom bar. Add controls after existing flow-specific UI elements. Wire to settings via `onSettingsChange` prop. |
| 7 | **Wire zone position to FlowScrollEngine on settings change** — In FoliatePageView, when `settings.flowZonePosition` or `settings.flowZoneLines` changes, call `engine.setZonePosition()` and recompute CSS custom properties. | Hephaestus | `src/components/FoliatePageView.tsx` | In the flow mode useEffect (lines 1552-1584) or a new useEffect that depends on `[settings.flowZonePosition, settings.flowZoneLines]`. |
| 8 | **Tests** — ≥10 new tests: (a) mask-image CSS applied when flow mode active, (b) mask-image removed when flow mode deactivated, (c) `--flow-zone-top` and `--flow-zone-bottom` computed correctly from settings, (d) zone position values map correctly (0.15/0.35/0.55), (e) zone lines clamped to 3-8 range, (f) FlowScrollEngine.setZonePosition updates scroll target, (g) ResizeObserver triggers zone recomputation, (h) default settings applied on fresh start, (i) settings round-trip (save/load), (j) CSS custom properties update on settings change. | Hippocrates | `tests/` | New test file: `tests/flowReadingZone.test.ts` |
| 9 | **`npm test` + `npm run build`** — Full tier. | Hippocrates | — | — |
| 10 | **Solon** — Spec compliance. | Solon | — | — |
| 11 | **Herodotus** — Doc updates. | Herodotus | All 6 governing docs | — |
| 12 | **Git** | Hermes | — | Branch: `sprint/flow-inf-a-reading-zone` |

**Execution Sequence:**
1. Read phase — all WHERE files
2. Task 1 (constants) + Task 2 (types) — parallel, unblock compilation
3. Task 3 (CSS mask) — after constants exist
4. Task 5 (FlowScrollEngine update) — after constants exist
5. Task 4 (zone computation in FoliatePageView) — after CSS + engine updates
6. Task 6 (bottom bar controls) — after settings types exist
7. Task 7 (wiring) — after all above
8. Tasks 8-9 (tests + build) — after all implementation
9. Task 10-12 (verify + docs + git)

**SUCCESS CRITERIA:**
1. Flow mode applies CSS `mask-image` gradient — content outside reading zone visually de-emphasized (35% visible)
2. Reading zone is a fully-visible band spanning `flowZoneLines` lines (default 5)
3. Soft gradient edges (2% transition) — no hard cutoff
4. Zone position configurable: Top (0.15), Center (0.35), Bottom (0.55) via ReaderBottomBar dropdown
5. Zone lines configurable: 3-8 via ReaderBottomBar slider
6. `FlowScrollEngine.scrollToLine()` uses dynamic zone position from settings, not hardcoded constant
7. Zone recomputes on container resize (ResizeObserver)
8. Mask removed when exiting flow mode (no visual artifacts)
9. All existing tests pass, `npm run build` succeeds
10. ≥10 new tests in `tests/flowReadingZone.test.ts`

**Tier:** Full | **Depends on:** NARR-CURSOR-1

---

### Sprint FLOW-INF-B: Timer Cursor & Pacing Feedback ✅ COMPLETED

**Goal:** Replace the barely-visible shrinking underline with a prominent timer bar that depletes left-to-right as each line is read. Add reading progress overlay so users always know where they are.

**Version:** v1.42.0 | **Branch:** `sprint/flow-inf-b-timer-cursor` | **Tier:** Full

**Baseline (post-FLOW-INF-A):** Flow mode has CSS mask reading zone, configurable zone position/size, FlowScrollEngine with dynamic zone position. Cursor is `.flow-shrink-cursor` — a 3px accent underline that shrinks from full line width to 0px via CSS transition (`width {duration}ms linear`). Duration = `(wordCount / wpm) × 60000 ms`. Cursor positioned absolutely at `line.left, line.bottom` in FlowScrollEngine `animateLine()` (line 268-286). Manual scroll pauses animation for 2s.

**Design:**
```
Reading Zone:
  ...previous lines (de-emphasized)...

  The quick brown fox jumps over the      ← active line
  [████████████░░░░░░░░░░░░░░░░░░░░]      ← timer bar (40% depleted)

  ...upcoming lines (de-emphasized)...

Bottom Bar:
  ◀ ▶  |  Flow  |  287 WPM  |  Ch 3 · 34% · ~12 min left  |  ⚙
```

Timer bar: 4-6px accent-colored bar below active line. Depletes left → right (width shrinks). Subtle glow at leading edge. On line completion: brief accent flash (100ms pulse), then snap to next line at full width.

Progress overlay: Persistent display in ReaderBottomBar showing: current chapter name, book percentage, estimated time remaining (from word count and WPM).

**WHERE (read order):**
1. `src/utils/FlowScrollEngine.ts` — `animateLine()` lines 252-305 (cursor positioning and shrink), `start()` line 62 (initialization), cursor styling lines 81-85
2. `src/components/FoliatePageView.tsx` — flow cursor JSX at line 1812, flow cursor ref at line 313-316
3. `src/styles/global.css` — `.flow-shrink-cursor` class, `.foliate-page-view--flow`
4. `src/components/ReaderBottomBar.tsx` — existing bottom bar structure, mode-specific sections
5. `src/constants.ts` — `FLOW_CURSOR_HEIGHT_PX = 3` at line 452, `FLOW_CURSOR_EINK_HEIGHT_PX = 4` at line 454

**Tasks:**

| # | Task | Agent | Scope | Edit Site |
|---|------|-------|-------|-----------|
| 1 | **Add timer bar constants** — `FLOW_TIMER_BAR_HEIGHT_PX = 5`, `FLOW_TIMER_BAR_EINK_HEIGHT_PX = 6`, `FLOW_TIMER_GLOW_PX = 2` (glow spread), `FLOW_LINE_COMPLETE_FLASH_MS = 100` (completion pulse duration). Keep existing `FLOW_CURSOR_HEIGHT_PX` for backward compat but mark deprecated. | Hermes | `src/constants.ts` | After existing flow constants (~line 458). |
| 2 | **Restyle `.flow-shrink-cursor` as timer bar** — Height from 3px to `FLOW_TIMER_BAR_HEIGHT_PX`. Add `border-radius: 2px`. Background: accent color with subtle left-edge glow via `box-shadow: 0 0 GLOW_PX 0 var(--accent)`. Add `transition: opacity 100ms ease` for completion flash. Remove any `border-bottom` styling. | Hephaestus | `src/styles/global.css`, `src/utils/FlowScrollEngine.ts` | CSS: find `.flow-shrink-cursor` rules. FlowScrollEngine: lines 81-85 (inline cursor styling in `start()`). Update height assignment to use new constant. |
| 3 | **Add line-completion flash animation** — In FlowScrollEngine `animateLine()`, when line timer expires (line 288-304): (a) set cursor opacity to 0.4 (flash), (b) after `FLOW_LINE_COMPLETE_FLASH_MS` delay, reset opacity to 1.0 and advance to next line with full width. The flash provides visual rhythm feedback. | Hephaestus | `src/utils/FlowScrollEngine.ts` | Lines 288-304 (the setTimeout that fires after line duration completes). Insert flash sequence before the `this.animateLine()` recursive call. |
| 4 | **Add progress computation to FlowScrollEngine** — New `getProgress()` method returning `{ lineIndex, totalLines, wordIndex, totalWords, chapterPct, bookPct, estimatedMinutesLeft }`. `chapterPct` = wordIndex / totalWordsInChapter. `bookPct` = provided externally via `setBookProgress(pct)`. `estimatedMinutesLeft` = (totalWords - wordIndex) / wpm. Expose via `onLineChange` callback enhancement. | Hephaestus | `src/utils/FlowScrollEngine.ts` | After `getWordIndex()` (line 204). New method + expand `FlowScrollEngineCallbacks` interface (line 29) to include `onProgressUpdate?: (progress) => void`. Fire on every line change in `animateLine()`. |
| 5 | **Add progress display to ReaderBottomBar** — Flow-mode section shows: current WPM (from settings), chapter name (from reader props), book percentage (from progress), estimated time remaining. Format: `"Ch 3 · 34% · ~12 min left"`. Update on every `onProgressUpdate` callback. | Hephaestus | `src/components/ReaderBottomBar.tsx` | Find flow-mode section (added in FLOW-INF-A Task 6). Add progress display elements. Wire to progress state passed down from ReaderContainer. |
| 6 | **Wire progress from FlowScrollEngine to ReaderBottomBar** — In FoliatePageView or ReaderContainer, subscribe to `onProgressUpdate` from FlowScrollEngine. Pass progress state up via callback prop or context. Connect to ReaderBottomBar's new progress display. | Hephaestus | `src/components/FoliatePageView.tsx`, `src/components/ReaderContainer.tsx` | FoliatePageView: where FlowScrollEngine callbacks are wired (near line 1605). Add `onProgressUpdate` handler that sets state. ReaderContainer: pass progress to ReaderBottomBar props. |
| 7 | **E-ink mode: instant transitions** — When `isEink`, skip the CSS shrink transition (already handled) and skip the flash animation. Timer bar height uses `FLOW_TIMER_BAR_EINK_HEIGHT_PX`. Ensure no CSS transitions applied in e-ink mode. | Hermes | `src/utils/FlowScrollEngine.ts` | Lines 278-282 (e-ink transition conditional). Update height assignment (line 83). Add conditional around flash in Task 3 code. |
| 8 | **Tests** — ≥8 new tests: (a) timer bar height matches constant, (b) line completion flash fires (opacity change), (c) flash duration matches constant, (d) `getProgress()` returns correct percentages, (e) estimated time remaining calculation correct, (f) progress callback fires on line change, (g) e-ink mode skips flash, (h) e-ink timer bar uses taller height. | Hippocrates | `tests/` | New test file: `tests/flowTimerCursor.test.ts` |
| 9 | **`npm test` + `npm run build`** — Full tier. | Hippocrates | — | — |
| 10 | **Solon** — Spec compliance. | Solon | — | — |
| 11 | **Herodotus** — Doc updates. | Herodotus | All 6 governing docs | — |
| 12 | **Git** | Hermes | — | Branch: `sprint/flow-inf-b-timer-cursor` |

**Execution Sequence:**
1. Read phase — all WHERE files
2. Task 1 (constants) — unblocks compilation
3. Task 2 (restyle cursor) — after constants
4. Task 3 (flash animation) — after restyle
5. Task 4 (progress computation) — parallel with Tasks 2-3
6. Task 5 (bottom bar progress) + Task 6 (wiring) — after Task 4
7. Task 7 (e-ink) — after Tasks 2-3
8. Tasks 8-9 (tests + build)
9. Tasks 10-12 (verify + docs + git)

**SUCCESS CRITERIA:**
1. Timer bar is 5px tall (6px e-ink) with accent color and border-radius — visually prominent, not a thin underline
2. Timer bar depletes left → right linearly over line duration (wordCount / wpm × 60s)
3. Line completion triggers a 100ms opacity flash before snapping to next line
4. `getProgress()` returns accurate chapter percentage and estimated time remaining
5. ReaderBottomBar shows WPM, chapter progress, and estimated time remaining during flow mode
6. Progress updates on every line change (not just word advance)
7. E-ink mode: no CSS transitions, no flash, uses taller bar height
8. Manual scroll pause (2s) still works — timer bar freezes at current width
9. All existing tests pass, `npm run build` succeeds
10. ≥8 new tests in `tests/flowTimerCursor.test.ts`

**Tier:** Full | **Depends on:** FLOW-INF-A

---

## Track B: Chrome Extension Enrichment (EXT-ENR)

> **Vision:** The Chrome extension connection becomes effortless and resilient. No manual code entry on reconnect, no dropped connections on sleep/wake, and the app actively invites pairing when it senses an incoming connection attempt.

### Current State (v1.38.2)

- **WebSocket server** (`main/ws-server.js`, 529 lines) — localhost port 48924, custom RFC 6455, pairing token auth via `safeStorage`. HOTFIX-14: auth-filtered `getClientCount()`, 15s heartbeat, 5s UI polling.
- **Chrome extension** (`chrome-extension/`, in-repo) — service-worker.js (592 lines), popup.js (238 lines), popup.html, manifest.json. Flat 5s reconnect, fire-and-forget article send, no pending persistence.
- **Pairing flow** — 6-digit short code with 5min TTL, long-lived token stored in safeStorage (server) + chrome.storage.local (extension). Token survives app restart.
- **Article import** — `add-article` message type, HTML→EPUB conversion, hero image extraction, auto-queue. No delivery confirmation.
- **Known pain points (post-HOTFIX-14):** Flat 5s reconnect (no backoff), pending articles lost on service worker kill, no delivery confirmation, unbounded EADDRINUSE retry, no auth timeout, binary connected/disconnected UI.

### Investigation Gate — Track B: ✅ CLEARED

All three investigation areas resolved:
- **WebSocket lifecycle:** Fully traced. `_clients` Set: add at line 144 (pre-auth), delete on socket close (152), error (157), WS close frame (174), heartbeat fail (466), heartbeat error (473). `getClientCount()` now auth-filtered (HOTFIX-14).
- **Extension source code:** Located at `chrome-extension/` in-repo. Full reconnect logic, state vars, message flow traced.
- **IPC event emission:** Renderer polled via `get-ws-short-code` IPC every 15s (ConnectorsSettings). Push events `ws-connection-attempt` / `ws-pairing-success` now emitted by server (EXT-ENR-B, v1.43.0) — renderer subscribes via `onWsConnectionAttempt` / `onWsPairingSuccess` preload listeners.

### Sprint EXT-ENR-A: Resilient Extension Connection ✅ COMPLETED

**Goal:** The WebSocket connection survives sleep/wake, network changes, and Chrome service worker restarts without re-pairing. Articles sent while disconnected are delivered when connection resumes.

**Version:** v1.39.0 | **Branch:** `sprint/ext-enr-a-resilient` | **Tier:** Quick | **Status:** COMPLETED 2026-04-06

**Baseline (v1.38.2):** HOTFIX-14 shipped auth-filtered `getClientCount()`, 5s UI polling, 15s heartbeat, disconnect button, and fetchWithBrowser fallback. Token persistence already works (safeStorage encrypt on pair, `chrome.storage.local` on extension side). Remaining gaps: flat 5s reconnect (no backoff), no message delivery confirmation, no chrome.storage.local persistence for pending article queue, unbounded EADDRINUSE retry, no auth timeout on server, no three-state connection indicator.

**WHERE (read order):**
1. `chrome-extension/service-worker.js` (592 lines) — WebSocket client, reconnect logic, pending message queue, article send
2. `main/ws-server.js` (529 lines) — WebSocket server, client lifecycle, heartbeat, EADDRINUSE retry
3. `main/constants.js` — WS constants (lines 35-43)
4. `src/components/settings/ConnectorsSettings.tsx` — Connection status UI, polling
5. `main/ipc/misc.js` (lines 362-400) — WS IPC handlers (`get-ws-short-code`, `get-ws-status`)
6. `preload.js` — electronAPI bridge (verify WS-related entries)

**Tasks:**

| # | Task | Agent | Scope | Edit Site |
|---|------|-------|-------|-----------|
| 1 | **Exponential backoff reconnect** — Replace flat 5s `RECONNECT_DELAY_MS` with exponential backoff: 1s → 2s → 4s → 8s → 16s → cap at 30s. Add jitter (±20%). Reset delay to 1s on successful auth. | Hephaestus | `chrome-extension/service-worker.js` | `scheduleReconnect()` at lines 59-65. Replace `RECONNECT_DELAY_MS` constant (line 5) with `RECONNECT_BASE_MS = 1000` and `RECONNECT_MAX_MS = 30000`. Add `_reconnectDelay` state var near line 11. In `scheduleReconnect()`: use `_reconnectDelay` with jitter, double after each call, cap at MAX. In `handleServerMessage` case `"auth-ok"` (line 70): reset `_reconnectDelay = RECONNECT_BASE_MS`. |
| 2 | **Pending article persistence** — Persist `_pendingMessages` to `chrome.storage.local` so articles survive service worker termination. On startup, load from storage. On auth-ok flush, clear storage. | Hephaestus | `chrome-extension/service-worker.js` | `_pendingMessages` declared at line 12 (currently `[]`). Three edit sites: (a) Add `loadPendingMessages()` async function that reads from `chrome.storage.local.get("pendingMessages")` and populates `_pendingMessages`. Call it at module top-level (after line 14). (b) In `sendArticle()` at line 137: after pushing to `_pendingMessages`, also write to `chrome.storage.local.set({ pendingMessages: _pendingMessages })`. (c) In `handleServerMessage` case `"auth-ok"` (lines 70-75): after flushing, `chrome.storage.local.remove("pendingMessages")`. |
| 3 | **Article delivery confirmation (article-ack)** — Server sends `{type: "article-ack", docId}` after successful EPUB conversion + library insert. Extension waits for ack before removing from pending queue. Timeout after 30s → keep in pending for next session. | Hephaestus | `main/ws-server.js` + `chrome-extension/service-worker.js` | Server side: In `handleAddArticle()` (called from `handleMessage` at line 258), after the article is processed and added to library, `sendJson(client.socket, { type: "article-ack", docId: <generated-id> })`. Extension side: In `handleServerMessage()` at line 67, add case `"article-ack"`: remove the matching message from `_pendingMessages` by docId, update `chrome.storage.local`. In `sendArticle()` (line 136): instead of fire-and-forget `_ws.send()`, push to pending first, then send, let ack remove it. |
| 4 | **Cap EADDRINUSE retries** — Add `WS_MAX_RETRY_COUNT = 10` to constants. Track retry count. After 10 failures, stop retrying and log error. Reset count on successful listen. | Hermes | `main/ws-server.js` + `main/constants.js` | constants.js: Add `WS_MAX_RETRY_COUNT = 10` after line 41. ws-server.js: Add `let _retryCount = 0;` near line 20. In EADDRINUSE handler (lines 451-457): increment `_retryCount`, check `if (_retryCount >= WS_MAX_RETRY_COUNT)` → log and return without retry. In `_server.listen` callback (line 445): reset `_retryCount = 0`. |
| 5 | **Server-side auth timeout** — If a client connects but doesn't authenticate within 5s, disconnect it. Prevents unauthenticated clients from accumulating in `_clients`. | Hermes | `main/ws-server.js` + `main/constants.js` | constants.js: Add `WS_AUTH_TIMEOUT_MS = 5000` after the new MAX_RETRY_COUNT. ws-server.js: In `handleConnection()` after `_clients.add(client)` (line 144), add `client.authTimer = setTimeout(() => { if (!client.authenticated) { client.socket.destroy(); _clients.delete(client); } }, WS_AUTH_TIMEOUT_MS)`. In `handleMessage()` where `client.authenticated = true` is set (lines 224 and 239): add `if (client.authTimer) { clearTimeout(client.authTimer); client.authTimer = null; }`. Also clear in socket close/error handlers (lines 151-158). |
| 6 | **Three-state connection indicator** — Replace boolean `connected` in ConnectorsSettings with three states: "Connected", "Connecting" (server running, no auth client), "Disconnected" (server not running). Update IPC to return `{ status: "connected" | "connecting" | "disconnected" }`. | Hephaestus | `main/ipc/misc.js` + `src/components/settings/ConnectorsSettings.tsx` | IPC: In `get-ws-short-code` handler (misc.js lines 384-388): replace `connected: hasAuth` with `status: hasAuth ? "connected" : wsServer.getStatus().running ? "connecting" : "disconnected"`. Renderer: ConnectorsSettings.tsx line 22: change `const [connected, setConnected] = useState(false)` → `const [connectionStatus, setConnectionStatus] = useState<"connected" \| "connecting" \| "disconnected">("disconnected")`. Update all `result.connected` references (lines 32, 41, 58) to use `result.status`. Update JSX to show three-state indicator with distinct colors/labels. |
| 7 | **Service worker lifecycle resilience** — Add `chrome.runtime.onStartup` and `chrome.runtime.onInstalled` listeners to call `connectWebSocket()`. Ensure connection attempt on every service worker wake. | Hermes | `chrome-extension/service-worker.js` | After the existing `connectWebSocket()` call at end of file (find the initial invocation). Add: `chrome.runtime.onStartup.addListener(() => { connectWebSocket(); });` and `chrome.runtime.onInstalled.addListener(() => { connectWebSocket(); });`. These ensure the WebSocket reconnects after Chrome restarts or extension updates. |
| 8 | **Tests** — Add tests for: exponential backoff logic, article-ack flow, EADDRINUSE retry cap, auth timeout cleanup, three-state status derivation. Target: 10+ new tests. | Hippocrates | `tests/` | New test file: `tests/extensionResilience.test.ts`. Test backoff calculation (1→2→4→8→16→30 cap, jitter bounds, reset on auth). Test EADDRINUSE retry count (stops at 10). Test auth timeout (client removed after 5s without auth). Test three-state derivation logic (connected/connecting/disconnected). Test article-ack removes from pending queue. |

**Execution Sequence:**
1. **Read phase** — Read all WHERE files in order
2. **Implement Tasks 4, 5, 7** (Hermes, parallel) — mechanical, prescribed diffs
3. **Implement Task 1** (Hephaestus) — backoff logic, depends on nothing
4. **Implement Task 2** (Hephaestus) — pending persistence, depends on nothing
5. **Implement Task 3** (Hephaestus) — article-ack, touches both server + extension
6. **Implement Task 6** (Hephaestus) — three-state UI, depends on server changes from Tasks 4/5
7. **Test (Task 8)** (Hippocrates) — after all implementation
8. **Solon** — spec compliance (all 10 criteria)
9. **Herodotus** — doc updates (ROADMAP, SPRINT_QUEUE, CLAUDE.md, LESSONS_LEARNED if needed)
10. **Git** — commit, merge to main, push

**SUCCESS CRITERIA:**
1. Extension reconnects with exponential backoff (1s base, 30s cap, ±20% jitter) — no more flat 5s delay
2. Backoff resets to 1s on successful authentication
3. Pending articles persist in `chrome.storage.local` and survive service worker termination
4. Server sends `article-ack` after successful article processing; extension removes from pending only on ack
5. EADDRINUSE retry stops after 10 attempts with clear error log
6. Unauthenticated clients are disconnected after 5s
7. ConnectorsSettings shows three states: Connected (green), Connecting (amber), Disconnected (gray)
8. `chrome.runtime.onStartup` and `chrome.runtime.onInstalled` both trigger `connectWebSocket()`
9. All existing tests pass (`npm test`, 1,575+ tests, 0 failures)
10. 10+ new tests covering backoff, ack, retry cap, auth timeout, and three-state logic

---

### Sprint EXT-ENR-B: Auto-Discovery Pairing ✅ COMPLETED

**Goal:** When the extension tries to connect, Blurby surfaces the pairing code in the library screen — no need to navigate to Settings. The pairing experience should feel like AirDrop: the app notices the extension and invites pairing.

**Version:** v1.43.0 | **Branch:** `sprint/ext-enr-b-auto-discovery` | **Tier:** Full | **Status:** COMPLETED 2026-04-07

**Baseline (post-EXT-ENR-A, v1.39.0):** WebSocket server has auth timeout (5s), three-state connection indicator, exponential backoff reconnect, article-ack delivery confirmation. Server emits no push events to renderer — status is polled every 5s via `get-ws-short-code` IPC. Pairing code is only visible in Settings > Connectors. Established push event pattern exists in `ipc/cloud.js` (lines 91-96: `mainWindow.webContents.send()`) and `preload.js` (lines 178-217: `onXxx` listener pattern with cleanup).

**Design:**
```
Library Screen (normal):
┌────────────────────────────────────────┐
│  📚 My Library                    ⚙    │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Book 1│ │Book 2│ │Book 3│           │
│  └──────┘ └──────┘ └──────┘           │

Library Screen (extension detected):
┌────────────────────────────────────────┐
│  📚 My Library                    ⚙    │
│ ┌────────────────────────────────────┐ │
│ │ 🔗 Chrome Extension wants to      │ │
│ │    connect. Enter code: 847291     │ │
│ │    [Expires in 4:32]    [Dismiss]  │ │
│ └────────────────────────────────────┘ │
│  ┌──────┐ ┌──────┐ ┌──────┐           │
│  │Book 1│ │Book 2│ │Book 3│           │
│  └──────┘ └──────┘ └──────┘           │
```

**WHERE (read order):**
1. `main/ws-server.js` — `handleConnection()` lines 105-159 (client connect, pre-auth). `_ctx` at line 18, assigned at line 416. `handleMessage()` for auth/pair flows at lines 201-259.
2. `main/ipc/cloud.js` — Push event pattern at lines 91-96 (`mainWindow.webContents.send`). Follow this exact pattern.
3. `preload.js` — WS-related entries at lines 113-120. Push event listener pattern at lines 178-217 (`onSyncProgress`, `onLibraryUpdated`, `onCloudSyncStatusChanged`). New listener goes after line 217.
4. `src/hooks/useLibrary.ts` — Push event subscription pattern at lines 17-28 (`onLibraryUpdated` with cleanup). Follow this pattern.
5. `src/components/LibraryContainer.tsx` — Library screen layout, where pairing banner will be injected.
6. `src/components/settings/ConnectorsSettings.tsx` — Existing pairing UI (lines 106-153), three-state status. Code display at lines 126-137.
7. `main/constants.js` — WS constants. Add new constants here.

**Tasks:**

| # | Task | Agent | Scope | Edit Site |
|---|------|-------|-------|-----------|
| 1 | **Add push event constants** — `WS_CONNECTION_ATTEMPT_CHANNEL = "ws-connection-attempt"`, `WS_PAIRING_SUCCESS_CHANNEL = "ws-pairing-success"`. | Hermes | `main/constants.js` | After existing WS constants (line ~43). |
| 2 | **Server emits connection-attempt event** — In `handleConnection()`, after `_clients.add(client)` (line 145), emit push event: `const mw = _ctx?.getMainWindow?.(); if (mw && !mw.isDestroyed()) mw.webContents.send("ws-connection-attempt", { timestamp: Date.now() })`. Only emit if client is NOT already authenticated (which it never is at this point — `authenticated: false` is set at line 141). | Hermes | `main/ws-server.js` | After line 145 (`_clients.add(client)`). Import constants if needed. |
| 3 | **Server emits pairing-success event** — In `handleMessage()`, after successful pairing (line 224-225, where `client.authenticated = true` and `pair-ok` is sent) AND after successful auth (line 239, where `client.authenticated = true` and `auth-ok` is sent): emit `mw.webContents.send("ws-pairing-success", { timestamp: Date.now() })`. | Hermes | `main/ws-server.js` | Lines 224-225 (pair success) and line 239-240 (auth success). Same mainWindow pattern as Task 2. |
| 4 | **Expose push listeners in preload** — Add `onWsConnectionAttempt` and `onWsPairingSuccess` listeners following the exact pattern at lines 178-217 (ipcRenderer.on with cleanup return). | Hermes | `preload.js` | After line 217 (after last `onXxx` listener). Two new entries in the contextBridge `electronAPI` object. |
| 5 | **Create PairingBanner component** — New component `src/components/PairingBanner.tsx`. Shows when connection attempt detected, displays pairing code with countdown timer, dismiss button. Auto-dismisses on pairing success or code expiry. Props: `visible: boolean`, `code: string`, `expiresAt: number`, `onDismiss: () => void`. Styled as a floating card with accent border, positioned at top of parent with margin. | Hephaestus | `src/components/PairingBanner.tsx` (new file) | New component. CSS in `src/styles/global.css` — add `.pairing-banner` class with styles. |
| 6 | **Wire push events in LibraryContainer** — Subscribe to `onWsConnectionAttempt` and `onWsPairingSuccess` via `window.electronAPI`. On connection-attempt: fetch short code via `getWsShortCode()`, show PairingBanner with code + expiry. On pairing-success: hide banner. On dismiss: hide banner, set 60s cooldown (don't show again for the same session within 60s). Follow the useEffect cleanup pattern from `useLibrary.ts` lines 17-28. | Hephaestus | `src/components/LibraryContainer.tsx` | Near existing useEffect hooks. Add state for `showPairingBanner`, `pairingCode`, `pairingExpiresAt`. Render `<PairingBanner>` at top of library content area. |
| 7 | **Suppress banner when already paired** — Before showing banner on connection-attempt, check current connection status via `getWsShortCode()`. If `status === "connected"`, suppress (this is a re-auth, not a new pairing). Only show banner when status is `"disconnected"` or `"connecting"`. | Hermes | `src/components/LibraryContainer.tsx` | Inside the `onWsConnectionAttempt` handler from Task 6. Add status check before `setShowPairingBanner(true)`. |
| 8 | **Reduce polling in ConnectorsSettings** — With push events available, the 5s polling in ConnectorsSettings (lines 37-45) can be supplemented: subscribe to `onWsPairingSuccess` to instantly update status on pairing, reducing reliance on polling. Keep polling as fallback but increase interval to 15s. | Hermes | `src/components/settings/ConnectorsSettings.tsx` | Lines 37-45: change `5000` to `15000`. Add `onWsPairingSuccess` subscription that calls `setConnectionStatus("connected")` immediately. |
| 9 | **CSS for PairingBanner** — `.pairing-banner`: background `var(--surface)`, `border: 2px solid var(--accent)`, `border-radius: 8px`, `padding: 16px`, `margin: 12px`, `display: flex`, `align-items: center`, `gap: 12px`. Code display: `font-family: monospace`, `font-size: 1.4em`, `letter-spacing: 0.15em`, `color: var(--accent)`. Dismiss button: ghost style. Countdown: `color: var(--text-secondary)`. Entrance animation: `translateY(-8px) → 0` with `opacity: 0 → 1`, 200ms ease. | Hermes | `src/styles/global.css` | Add after existing `.connectors-` styles or at end of components section. |
| 10 | **Tests** — ≥10 new tests: (a) connection-attempt event emitted when unauthenticated client connects, (b) pairing-success event emitted on pair-ok, (c) pairing-success event emitted on auth-ok, (d) banner shows on connection-attempt when status is disconnected, (e) banner suppressed when already connected, (f) banner dismisses on pairing-success, (g) banner dismisses on user click, (h) 60s cooldown suppresses repeat banner, (i) preload listeners return cleanup functions, (j) polling interval is 15s not 5s. | Hippocrates | `tests/` | New test file: `tests/autoDiscoveryPairing.test.ts` |
| 11 | **`npm test` + `npm run build`** — Full tier. | Hippocrates | — | — |
| 12 | **Solon** — Spec compliance. | Solon | — | — |
| 13 | **Herodotus** — Doc updates. | Herodotus | All 6 governing docs | — |
| 14 | **Git** | Hermes | — | Branch: `sprint/ext-enr-b-auto-discovery` |

**Execution Sequence:**
1. Read phase — all WHERE files
2. Tasks 1-4 (constants, server events, preload) — sequential (each builds on prior)
3. Task 5 (PairingBanner component) + Task 9 (CSS) — parallel with Tasks 2-4
4. Task 6 (LibraryContainer wiring) — after Tasks 4 + 5
5. Task 7 (suppress when paired) — after Task 6
6. Task 8 (reduce polling) — after Task 4
7. Tasks 10-11 (tests + build)
8. Tasks 12-14 (verify + docs + git)

**SUCCESS CRITERIA:**
1. Server emits `"ws-connection-attempt"` event when unauthenticated client connects
2. Server emits `"ws-pairing-success"` event on successful pair or auth
3. Preload exposes `onWsConnectionAttempt` and `onWsPairingSuccess` with cleanup returns
4. PairingBanner appears in library screen when extension connection detected
5. Banner shows current pairing code with countdown timer
6. Banner auto-dismisses on successful pairing
7. Banner suppressed when already connected (no false prompts on re-auth)
8. 60s cooldown prevents banner re-appearing immediately after dismiss
9. ConnectorsSettings polling reduced to 15s (push events handle instant updates)
10. Entrance animation on banner (slide down + fade in, 200ms)
11. All existing tests pass, `npm run build` succeeds
12. ≥10 new tests in `tests/autoDiscoveryPairing.test.ts`

**Tier:** Full | **Depends on:** EXT-ENR-A

---

## NARR-TIMING: Real Word-Level Timestamps from Kokoro TTS ✅ COMPLETED

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. **Result:** All 16 success criteria met, 1,717 tests passing (18 new in `tests/narrTiming.test.ts`), build succeeds. v1.44.0. 2026-04-07.

**Goal:** Replace the character-count heuristic (`computeWordWeights`) with real per-word timestamps derived from Kokoro's duration tensor. The narration cursor consistently runs ahead of the audio because the heuristic treats word duration as proportional to character count. Kokoro's ONNX text encoder already computes per-phoneme durations during inference — the kokoro-js wrapper just discards them. A ~60-line fork surfaces this data, aligns it to words, and feeds validated timestamps into the audio scheduler.

**Version:** v1.44.0 | **Branch:** `sprint/narr-timing` | **Tier:** Full (npm test + npm run build — touches scheduler, pipeline, and worker)

**Problem:** `computeWordWeights` distributes chunk duration across words proportionally to character length (clamped 2–20, with 1.12x sentence-end and 1.05x clause-end multipliers). Short function words get over-allocated, long content words get under-allocated, and the error accumulates across every chunk. The heuristic also has zero knowledge of Kokoro's natural inter-word silence — the cursor advances through pauses that should be visible holds.

**Plan document:** `NARR-TIMING-PLAN/NARR-TIMING_Plan.md` — comprehensive technical plan with explicit code for all changes, revised through two independent audit rounds (15 findings, all incorporated). **CLI MUST read this plan before implementation.** The plan contains the exact fork code, validation logic, and edge case handling.

### Design Decisions (from plan + 2 audit rounds)

1. **RawAudio return type preserved** — Fork attaches `_durations` (on `generate_from_ids`) and `wordTimestamps` (on `generate`) as non-enumerable properties via `Object.defineProperty`. No API breakage for `stream()` or existing callers.
2. **4-layer validation** — Layer 1: token count check (gross phonemization divergence). Layer 2: waveform drift with split accumulator (EOS/tail included). Layer 2b: fail-closed token walk (throws on underrun). Layer 3: scheduler acceptance (monotonicity, bounds, word correspondence, scaled tolerance).
3. **Split accumulator** — `sampleOffset` tracks word timestamps (stops at last aligned word). `totalPredictedSamples` walks all remaining tokens including EOS for drift validation. Resolves the "endTime excludes trailing pause" vs "predicted duration should match waveform" contradiction.
4. **Fail-closed token walk** — Token accumulation and separator consumption throw immediately when the tensor can't provide expected tokens, instead of silently clipping.
5. **Scaled tolerances** — `min(40ms, 5% of speech duration)` instead of fixed 100ms. Short chunks get strict validation.
6. **Graceful fallback** — Any alignment failure (fork error, validation failure, edge case) falls back to existing `computeWordWeights` heuristic. Narration never breaks.
7. **patch-package fork** — Targets built `dist/` artifacts (both CJS `dist/kokoro.cjs` and ESM `dist/kokoro.js`). Must cover both packaged-app and dev-mode import paths.
8. **`endTime` contract** — End of voiced portion, excluding trailing inter-word pause. Gap between `word[i].endTime` and `word[i+1].startTime` is silence. Currently only `startTime` is used for scheduling; `endTime` preserved for future silence-aware cursor hold (IDEAS.md H6).

### Baseline

Existing infrastructure:
- `computeWordWeights()` in `audioScheduler.ts` (lines 53-72) — the heuristic being replaced (retained as fallback)
- `computeWordBoundaries()` in `audioScheduler.ts` (lines 211-239) — distributes timing using heuristic weights
- `ScheduledChunk` interface in `audioScheduler.ts` (lines 76-88) — chunk data structure (gains `wordTimestamps` field)
- `generate()` in `main/tts-worker.js` (lines 106-124) — TTS worker function
- Message handler in `main/tts-worker.js` (lines 140-156) — dispatches to `generate()`
- `PipelineConfig.generateFn` in `generationPipeline.ts` (lines 29-34) — IPC wrapper type
- `produceChunk()` in `generationPipeline.ts` (line 292) — builds chunks and calls `generateFn`
- `generateFn` call site in `generationPipeline.ts` (line 330) — `config.generateFn(text, voiceId, speed)`
- kokoro-js `generate_from_ids()` — discards durations at `const { waveform: o } = await this.model(inputs)`
- kokoro-js `generate()` — calls `generate_from_ids`, returns `RawAudio` with no timestamps
- `@huggingface/transformers` `generate_speech()` — already returns `{ waveform, durations }` (no change needed)

### WHERE (Read Order)

1. `CLAUDE.md` — rules and architecture
2. `docs/governance/LESSONS_LEARNED.md` — scan for TTS, narration, timestamp, scheduler entries
3. **`NARR-TIMING-PLAN/NARR-TIMING_Plan.md`** — **MUST READ IN FULL** — contains all fork code, alignment logic, validation functions, edge case handling, and audit resolutions. This is the authoritative implementation reference.
4. `ROADMAP.md` — this section
5. `main/tts-worker.js` — `generate()` function (lines 106-124), message handler (lines 140-156), `loadModel()` CJS/ESM import paths (lines 21-54)
6. `src/utils/audioScheduler.ts` — `computeWordWeights()` (lines 53-72), `ScheduledChunk` interface (lines 76-88), `computeWordBoundaries()` (lines 211-239)
7. `src/utils/generationPipeline.ts` — `PipelineConfig` interface (lines 27-63), `produceChunk()` (lines 292-390), `generateFn` call (line 330)
8. `node_modules/kokoro-js/dist/kokoro.cjs` — locate `generate_from_ids` and `generate` methods (the discard point)
9. `node_modules/kokoro-js/dist/kokoro.js` — ESM variant of the same
10. `NARR-TIMING-PLAN/reference/transformers_generate_speech.js` — shows that `@huggingface/transformers` already returns `{ waveform, durations }`
11. `NARR-TIMING-PLAN/reference/kokoro_js_discard_point.js` — shows the exact discard: `const { waveform: o } = await this.model(inputs)`

### Tasks

| # | Owner | Task | Files | Edit-Site Coordinates |
|---|-------|------|-------|-----------------------|
| 1 | Athena (electron-scope + format-scope) | **Fork kokoro-js: Surface duration tensor.** Apply the fork diff from plan §4.2. Three changes to kokoro-js source: (a) `generate_from_ids` — destructure both `waveform` and `durations` from `this.model()`, attach `_durations` as non-enumerable property on `RawAudio`. (b) `generate` — accept optional `words` param, call `_alignWordsToTimestamps()` when words + durations available, attach `wordTimestamps` as non-enumerable property on `RawAudio`. (c) Add `_alignWordsToTimestamps()` method and `computeWordTimestamps()` function — the full alignment + validation logic from plan §4.2. **Must patch both `dist/kokoro.cjs` AND `dist/kokoro.js`.** Use `patch-package` to create persistent patch. See plan §4.5 for CJS/ESM procedure. | `node_modules/kokoro-js/dist/kokoro.cjs`, `node_modules/kokoro-js/dist/kokoro.js`, `patches/kokoro-js+VERSION.patch` (new) | In both dist files: find `generate_from_ids` method (search for `{ waveform: o }` or `waveform:o`), find `generate` method (search for `async generate(text`). Add `computeWordTimestamps` and `_alignWordsToTimestamps` as new functions/methods. |
| 2 | Hermes (electron-scope) | **Update tts-worker.js: Pass words, relay timestamps.** (a) Add `words` parameter to `generate()` function signature (line 106). (b) Pass `words` to `ttsInstance.generate()` call (line 112): change to `ttsInstance.generate(text, { voice, speed, words: words \|\| null })`. (c) Add `wordTimestamps: result.wordTimestamps \|\| null` to the result message (line 119). (d) Update message handler case `"generate"` (line 150) to pass `msg.words`. See plan §5.1 for exact code. | `main/tts-worker.js` | Line 106: add `words` param. Line 112: add `words` to options. Line 119: add `wordTimestamps` to msg. Line 150: add `msg.words`. |
| 3 | Hephaestus (renderer-scope) | **Update generationPipeline.ts: Pass words into TTS call.** (a) Add `words?: string[]` parameter to `PipelineConfig.generateFn` type (line 29). (b) Add `wordTimestamps` to the generateFn return type (line 30-34). (c) In `produceChunk()` at line 330, change `config.generateFn(text, config.getVoiceId(), config.getSpeed())` to also pass `chunkWords`. (d) Add `wordTimestamps: result.wordTimestamps \|\| null` to the `ScheduledChunk` construction (~line 360). See plan §5.2 for exact code. | `src/utils/generationPipeline.ts` | Lines 29-34: update `generateFn` type signature + return type. Line 330: add `chunkWords` argument. ~Line 360: add `wordTimestamps` to chunk object. |
| 4 | Hephaestus (renderer-scope) | **Update audioScheduler.ts: Accept real timestamps, bypass heuristic.** (a) Add `wordTimestamps?: { word: string; startTime: number; endTime: number }[] \| null` to `ScheduledChunk` interface (after line 87). (b) Add `validateWordTimestamps()` function — exact code in plan §5.3. Checks: length match, finite/non-negative, endTime >= startTime, monotone startTimes, word correspondence, scaled overshoot tolerance, zero-duration count. (c) Rewrite `computeWordBoundaries()` (lines 211-239): check `chunk.wordTimestamps` first → validate → use real timestamps for boundaries if valid → fall through to existing heuristic on failure. Include silenceMs-aware speech duration calculation. Update dev telemetry to record `timestampSource` and `realTimestamps`. See plan §5.3 for exact code. | `src/utils/audioScheduler.ts` | Line 87: add `wordTimestamps` to `ScheduledChunk`. Before line 211: add `validateWordTimestamps()` (~35 lines). Lines 211-239: rewrite `computeWordBoundaries()` body (~75 lines replacing ~28 lines). |
| 5 | Hephaestus (renderer-scope) | **Wire generateFn caller to pass words.** In `src/hooks/useNarration.ts` (or wherever `generateFn` is constructed as an IPC wrapper), ensure the `words` parameter is forwarded through the IPC `generate` message to the worker. The IPC call site that posts `{ type: "generate", id, text, voice, speed }` must add `words` to the message. Find this by tracing from `PipelineConfig.generateFn` back to the IPC call. | `src/hooks/useNarration.ts` or `src/utils/kokoroStrategy.ts` | Trace from `generateFn` in pipeline config. Find the IPC `postMessage` or `invoke` call. Add `words` field. |
| 6 | Hermes | **Install patch-package** (if not already present). Add `"postinstall": "patch-package"` to `package.json` scripts. Verify `patches/` directory is tracked by git. | `package.json` | Scripts section. |
| 7 | Hippocrates | **Tests** — ≥15 new tests covering: (a) `computeWordTimestamps` produces correct timestamps for a known duration tensor, (b) token walk throws on underrun (fail-closed), (c) drift check throws when predicted vs actual exceeds scaled tolerance, (d) monotonicity check throws on non-monotone timestamps, (e) zero-token punctuation words get zero-duration entries, (f) `validateWordTimestamps` accepts valid timestamps, (g) `validateWordTimestamps` rejects length mismatch, (h) `validateWordTimestamps` rejects non-monotone startTimes, (i) `validateWordTimestamps` rejects word string mismatch, (j) `validateWordTimestamps` rejects overshoot beyond scaled tolerance, (k) `computeWordBoundaries` uses real timestamps when valid, (l) `computeWordBoundaries` falls back to heuristic when timestamps null, (m) `computeWordBoundaries` falls back when validation fails, (n) silenceMs correctly excluded from speech duration in validation, (o) existing `computeWordWeights` heuristic unchanged (regression). | `tests/` | New test file: `tests/narrTiming.test.ts` |
| 8 | Hippocrates | **CJS/ESM parity check** — Verify both import paths resolve to patched code. Create a minimal test script that `require()`s the CJS path and dynamically `import()`s the ESM path, calls `generate()` with `words`, and asserts `wordTimestamps` exists on the result. This can be a test or a standalone verification script. | `tests/` or `scripts/` | New file. |
| 9 | Hippocrates | **`npm test` + `npm run build`** — Full tier. All 1,609+ tests pass, build succeeds. | — | — |
| 10 | Solon | **Spec compliance** — Verify all 16 SUCCESS CRITERIA items. Cross-reference plan §11 (audit findings table) to confirm all 15 audit resolutions are implemented. | — | — |
| 11 | Herodotus | **Documentation pass** — Update CLAUDE.md (version, sprint list, architecture note re: real timestamps), ROADMAP.md (mark NARR-TIMING complete), SPRINT_QUEUE.md (remove entry, log to completed), LESSONS_LEARNED.md (LL entry for fork maintenance pattern and patch-package workflow). Update TECHNICAL_REFERENCE.md § "Narrate Mode Architecture" to document real-timestamp pipeline. | All 6 governing docs + TECHNICAL_REFERENCE.md | — |
| 12 | Hermes | **Git: commit, merge, push** | — | Branch: `sprint/narr-timing` |

### Execution Sequence

```
READ PHASE (mandatory):
  Read all WHERE files in order. NARR-TIMING_Plan.md is the primary reference.
    ↓
Task 6 (patch-package setup)         — prerequisite for fork
    ↓
Task 1 (kokoro-js fork)              — Athena (cross-system: fork + patch both CJS/ESM)
    ↓
Task 2 (tts-worker.js)               — Hermes (mechanical: add param, relay field)
    ↓
Task 5 (wire IPC caller)             — Hephaestus (trace generateFn to IPC call)
Task 3 (generationPipeline.ts)       — Hephaestus (parallel with Task 5 if different files)
    ↓
Task 4 (audioScheduler.ts)           — Hephaestus (depends on Task 3 types)
    ↓
Tasks 7-8 (tests + parity check)    — after all implementation
Task 9 (npm test + build)            — after tests written
    ↓
Task 10 (Solon spec compliance)
Task 11 (Herodotus docs)
Task 12 (Git)
```

### SUCCESS CRITERIA

1. kokoro-js fork captures `durations` from `this.model()` return (no longer discarded)
2. `generate_from_ids` returns `RawAudio` with `_durations` attached as non-enumerable property
3. `generate` returns `RawAudio` with `wordTimestamps` attached as non-enumerable property (when `words` provided)
4. `stream()` and all other kokoro-js internal callers continue to work unchanged (RawAudio type preserved)
5. `tts-worker.js` accepts `words` in generate message and relays `wordTimestamps` in result
6. `generationPipeline.ts` passes chunk words through to `generateFn` and attaches `wordTimestamps` to `ScheduledChunk`
7. `audioScheduler.ts` uses real timestamps when present and valid; falls back to `computeWordWeights` heuristic otherwise
8. `validateWordTimestamps` checks: length, finite/non-negative, endTime >= startTime, monotone startTimes, word correspondence, scaled overshoot tolerance (`min(40ms, 5% of speech duration)`), zero-duration count
9. Token walk is fail-closed — throws on tensor underrun (not silent clip)
10. Drift validation uses split accumulator (`totalPredictedSamples` includes EOS/tail; `sampleOffset` does not)
11. Durations are rounded and clamped per-token before accumulation (mirrors model's `round().clamp_()`)
12. `silenceMs` correctly excluded from speech duration in scheduler validation (timestamps validated against speech portion only)
13. `patch-package` patch file exists in `patches/` and is applied on `npm install`
14. Both CJS and ESM import paths resolve to patched kokoro-js code (parity check passes)
15. ≥15 new tests in `tests/narrTiming.test.ts`
16. `npm test` passes (1,609+ tests), `npm run build` succeeds

**Tier:** Full | **Depends on:** None — independent of FLOW-INF and EXT-ENR tracks. Can run in parallel with Track A/B.

---

### Sprint EXT-ENR-C: In-Browser Reader (Optional/Future)

**Goal:** Standalone RSVP speed-reader in the Chrome extension popup — read articles without Blurby app running.

**Deliverables:**
1. Popup RSVP view (400x500px) — play/pause, WPM slider (100-1200), progress bar
2. Readability extraction in extension — extract article text from current tab
3. Reading queue in extension — `chrome.storage.local`, 50 articles max, 5MB limit
4. Sync with desktop — when Blurby is running, sync queue bidirectionally

**Note:** This is a lower priority enhancement. EXT-ENR-A and EXT-ENR-B address the core pain points. This sprint is documented for completeness but can be deferred.

**Key files:** Chrome extension source (separate repo/directory)

**Tier:** Full | **Depends on:** EXT-ENR-B

---

## Track C: Android APK (APK)

> **Vision:** Blurby on Android — sideloaded APK first, Play Store later. All readings available, reading position synced bidirectionally, new readings addable from mobile, all four reading modes working.

### Prerequisites & Architecture Decision

**Framework decision needed:** Two specs exist:
- `docs/superpowers/specs/.Archive/2026-03-27-android-app-design.md` — React Native + Expo monorepo (better native feel, larger effort)
- `docs/superpowers/specs/.Archive/phase-10-android-app.md` — Capacitor wrapper (max code reuse, faster to ship)

**Recommendation:** Capacitor for sideload MVP. Reasons: (1) reuses existing React code directly, (2) foliate-js already runs in WebView, (3) faster path to testable APK, (4) can always migrate to React Native later if WebView performance is insufficient.

**Mandatory prerequisite:** Modularization — extract platform-independent core from Electron coupling. See APK-0 below.

### Investigation Gate — Track C (Cowork — before any APK dispatch)

| Area | What We Know | What We Don't Know | Investigation Action |
|------|-------------|-------------------|---------------------|
| Framework decision | Two specs exist (RN vs Capacitor). Recommendation: Capacitor. | **User hasn't confirmed.** Also: has Capacitor been tested with foliate-js in a WebView? Does the EPUB rendering actually work? | **Cowork: Decision + POC.** Get user confirmation on Capacitor. Then scaffold minimal Capacitor project, load foliate-js in WebView, open an EPUB. If it works → proceed. If not → re-evaluate. |
| Coupling audit | 5 problem areas identified at high level (TTS worker, auth, sync, file I/O, IPC). | **Exact coupling depth.** How many `require('electron')` calls exist? How many `fs.` calls? Which renderer code accidentally imports Node modules? What's the true scope of modularization? | **Cowork: Deep audit.** Grep for all Electron-specific imports across the codebase. Map every coupling point with file:line. Estimate LOC per abstraction layer. Produce a scoped modularization plan that CLI can execute module-by-module. |
| Mobile TTS | Kokoro uses Node worker with ONNX. Model is ~80MB. | **Does ONNX Runtime work in Capacitor WebView?** Can we use WebAssembly ONNX runtime instead of Node? What's the performance on ARM? | **Cowork: Research.** Check ONNX Runtime Web (WASM) compatibility. Test if Kokoro model loads in browser context. If not, TTS on mobile may need a different approach (Web Speech API fallback, or native ONNX via Capacitor plugin). |
| Cloud sync on mobile | Sync engine is `main/sync-engine.js`, main-process-driven with `fs.promises`. | **Can the sync protocol run in a WebView?** The transport (OneDrive/Google Drive HTTP APIs) could work from browser context, but the file storage layer assumes Node `fs`. | **Cowork: Map sync dependencies.** Identify which sync-engine functions are pure logic (portable) vs platform-bound (Node fs). Estimate extraction effort. |

**Dispatch readiness:** NOT READY. Framework POC, coupling audit, and TTS feasibility all needed before APK-0 can be spec'd to CLI-ready detail.

### Sprint APK-0: Modularization (Prerequisite)

**Goal:** Extract a platform-independent core from the Electron-coupled codebase.

**Responsibility:** Cowork audits and specs each abstraction layer → CLI executes module-by-module extraction.

**Problem areas identified by 3rd-party audit:**
1. **Kokoro TTS worker** (`main/tts-worker.js` L5-L37) — Node-specific module resolution hacks
2. **Auth** (`main/auth.js` L294-L304) — depends on Electron `BrowserWindow` for OAuth popup
3. **Sync engine** (`main/sync-engine.js`) — main-process-driven, uses `fs.promises` directly
4. **File I/O** — all via Node `fs`, no abstraction layer
5. **IPC** — tight coupling between `preload.js` bridge and main-process handlers

**Deliverables (pending investigation gate):**
1. Storage abstraction — interface for file read/write/list/delete
2. Auth abstraction — interface for OAuth flows
3. TTS abstraction — interface for Kokoro model loading and inference
4. Sync transport abstraction — decouple sync logic from Node fs
5. Shared types and constants — extract to `shared/` directory

**Estimated effort:** 2-3 sprints (each sub-module is a separate CLI dispatch)

**Tier:** Full | **Depends on:** Investigation gate cleared

---

### Sprint APK-1: WebView Shell + Local Library

**Goal:** Sideloadable APK that opens Blurby's React UI in a WebView.

**Responsibility:** Cowork specs (after APK-0 modularization lands) → CLI executes scaffolding and integration.

**Investigation gate:** Blocked on APK-0 completion + Capacitor POC from Track C investigation gate.

**Deliverables:**
1. Capacitor project scaffolding — Android project, WebView configuration, build pipeline
2. Local library storage — SQLite or JSON file via Capacitor Filesystem
3. EPUB rendering — foliate-js in WebView (validated by POC)
4. File import — Android file picker + share sheet
5. APK build — signed debug APK for sideloading

**Tier:** Full | **Depends on:** APK-0

---

### Sprint APK-2: All Reading Modes

**Responsibility:** Cowork specs (after APK-1, with mobile gesture design) → CLI executes.

**Investigation gate:** Blocked on APK-1. Touch gesture mapping needs design decisions after seeing the WebView shell.

**Deliverables:**
1. Touch gesture mapping — swipe for page turn, tap zones for mode controls
2. Focus mode — RSVP display adapted for mobile viewport
3. Flow mode — infinite scroll with touch scroll detection
4. Narrate mode — Kokoro TTS via approach determined in investigation gate
5. Bottom bar adaptation — mobile-friendly control layout

**Tier:** Full | **Depends on:** APK-1

---

### Sprint APK-3: Bidirectional Sync

**Responsibility:** Cowork specs (sync protocol design, informed by Phase 7 if available) → CLI executes.

**Investigation gate:** Blocked on APK-2. Sync protocol depends on modularization outcome from APK-0.

**Deliverables:**
1. Cloud sync integration — OneDrive/Google Drive via Capacitor HTTP + OAuth
2. Bidirectional position sync — CFI-based with last-write-wins timestamps
3. Library sync — three-tier storage (metadata local, content on-demand, user-pinned)
4. Settings sync — theme, WPM, voice preferences
5. Conflict resolution — per-field last-write-wins

**Tier:** Full | **Depends on:** APK-2

---

### Sprint APK-4: Mobile-Native Features

**Responsibility:** Cowork specs → CLI executes.

**Investigation gate:** Blocked on APK-3. Native features depend on what the platform supports after integration.

**Deliverables:**
1. Share sheet integration — "Share to Blurby" from Chrome, other apps
2. Notification for reading goals/streaks (if GOALS-6B is implemented)
3. Background TTS playback — audio continues when backgrounded
4. Deep links — `blurby://open/{docId}`
5. Offline-first — graceful degradation when no network

**Tier:** Full | **Depends on:** APK-3

---

## Idea Themes (Roadmap Placeholders)

> Ideas grouped by theme in `docs/governance/IDEAS.md`. Each theme maps to potential future sprints. Not yet spec'd — reviewed at phase pauses.

| Theme | Key Ideas | Roadmap Alignment |
|-------|-----------|-------------------|
| **A: Infinite Reader** | Reading zone, cross-book flow, paragraph jumps | → Track A (FLOW-INF) above |
| **B: Chrome Extension** | Auto-discovery, resilient connection, in-browser reader, RSS | → Track B (EXT-ENR) above |
| **C: Android & Mobile** | APK wrapper, position sync, share sheet, Chromecast | → Track C (APK) above |
| **D: Reading Intelligence** | Goals, streaks, analytics, AI recommendations | GOALS-6B parked; rest backlog |
| **E: Content & Formats** | Chapter detection, auto TOC, OCR PDFs | Backlog (Phase 10+) |
| **F: Library & UX Polish** | 3-line cards, auto-clear dots, vocab builder, annotation export | Backlog (fold into any sprint) |
| **G: Settings & Ctrl+K** | Combine settings pages, all settings searchable | Backlog (small wins) |
| **H: Reading Tweaks** | Space bar mode, arrow speed, voice cloning, AI summaries | Backlog (bundleable) |
| **I: Branding** | Remove [Sample], Blurby icon, brand theme, window controls | Backlog (cosmetic, anytime) |
| **J: Social** | Reading clubs, shared lists, group discussions | Someday (needs server) |
| **K: E-Ink** | Display mode decoupling, e-ink reading ergonomics | Parked (EINK-6A/6B spec'd) |

---

## Phase 6 Continued — E-Ink & Goals (PARKED)

> EINK-6A, EINK-6B, and GOALS-6B are fully spec'd but parked. Specs remain valid — resume after TTS/hotfix lane concludes.

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
11. Wi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
