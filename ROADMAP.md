# Blurby — Development Roadmap

**Last updated**: 2026-03-28 — TTS-1 + TTS-2 merged. 796 tests, 39 files. v1.0.0 shipped. All TTS audit work complete.
**Current branch**: `main`
**Current state**: All sprints through TTS-2 complete. 796 tests, 39 files. Version: v1.0.0+.

> **Navigation:** Forward-looking sprints below. Completed sprint full specs archived in `docs/project/ROADMAP_ARCHIVE.md`.

---

## Sprint Status

| Sprint | Version | Status | Summary |
|--------|---------|--------|---------|
| **TH-1: Narration Test Hardening** | — | ✅ DONE | 88 new tests (6 files + modes.test.ts expansion). 776 tests / 38 files total. |
| **CT-2: Test Harness Hardening** | — | ✅ DONE | Fixed 33 SKIPs + 5 FAILs. Rich seed data, sessionStorage, 5 bug fixes. |
| **Click-through re-run** | — | ✅ DONE | 121-item test: 101 PASS / 6 FAIL / 14 SKIP. Report: `docs/testing/test-run-CT3-2026-03-28.md` |
| **CT-3: Click-through Repair** | — | ✅ DONE | KB checklist aligned (124 items), Ctrl+, documented as browser limitation, Focus stability (opacity-only animation, no forced reflow), deleteDoc stub. |
| **Sprint 24: External Audit** | — | ✅ DONE | 58 findings (3C/24H/21M/10L). Findings: `docs/project/AGENT_FINDINGS.md`. |
| **Sprint 24R: CRIT Remediation** | v0.9.1 | ✅ DONE | CRIT-1 fixed (path validation on read-file-buffer). CRIT-2/3 dismissed. |
| **Sprint KB-1: Keyboard Navigation Remap** | v0.10.0 | ✅ DONE | Ctrl=word/sentence, Shift=paragraph/chapter. 15 new tests. 791 total. |
| **Sprint TTS-1: Narration Correctness** | v1.0.9 | ✅ DONE | 15 TTS fixes: dual-write rule, worker recovery, audioPlayer guards. 796 tests. |
| **v1.0.0 RELEASE** | v1.0.0 | ✅ DONE | Tagged + shipped. CI release pipeline active. |
| **Sprint TTS-2: TTS Documentation** | — | ✅ DONE | Privacy data-flow, SSML stance, safety posture, TTS glossary. ~560 words in TECHNICAL_REFERENCE.md. |
| **Sprint 25: RSS Library** | v1.1.0 | 📋 POST-V1 | Feed aggregation from authenticated sites, RSS Library UI, cloud sync. |
| **Sprint 18C: Android APK** | v1.2.0 | 📋 POST-V1 | React Native port with cloud sync. |

**Legend:** 🔶 = fully spec'd, ready for dispatch | 📋 = spec'd, needs agent assignments | ⬜ = gate/milestone

---

## Feature Backlog

Items migrated from BUG_REPORT.md — feature requests, enhancements, and architecture changes (not bugs). Grouped by sprint/theme.

### Content Pipeline & Format (Sprints 27, 29)

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-035 | Chapter detection for non-EPUB | 29 | Heuristic pattern matching for chapter headings in PDF, MOBI, TXT, HTML. Currently only EPUB NCX/nav TOC works. |
| BUG-036 | Auto-generated TOC | 29 | Generate a TOC page at book start when no embedded TOC exists or when chapters are detected heuristically. |
| BUG-033/034 | Rich content preservation | 27 | Related: formatting and images stripped during import. EPUB pipeline would preserve structure. |
| BUG-075 | Intake pipeline + EPUB normalization | 27 | Normalize all incoming formats to EPUB as internal canonical format. Preserves formatting, chapters, metadata, images. |
| BUG-079 | Universal EPUB Pipeline | 27 | Convert HTML/PDF/MOBI/DOCX/TXT/MD/RTF/FB2/KFX/PDB/DjVu to EPUB on intake. Single rendering path via foliate-js. |

### Metadata & Library (Sprint 29)

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-074 | Author name normalization | 29 | Standardize all author names to "Last, First" format during import. Handle multi-word names, multiple authors. |
| BUG-077 | Metadata Wizard | 29 | Batch scan library to auto-derive Author, Title, Year from file metadata, filename parsing, and optional API enrichment. |
| BUG-078 | Reading Queue | 29 | Ordered reading list separate from library sort. Right-click "Add to Queue". Already stubbed in context menu. |
| BUG-076 | First-run library folder picker | 29 | Mandatory onboarding step where user selects library storage folder. Default suggestion, validation, migration for existing users. |

### Settings & Command Palette UX

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-055 | Combine settings into "Reading Layout" | Backlog | Merge Text Size + Layout into single "Reading Layout" settings page. |
| BUG-056 | New "Library Layout" settings page | Backlog | Default sort, default view mode, card/list size (S/M/L), spacing (compact/cozy/roomy), list columns. |
| BUG-057 | Library Layout CSS implementation | Backlog | CSS grid rules for card sizes, spacing values, default sort/layout application on load. |
| BUG-058 | Settings pages in Ctrl+K | Backlog | Add Library Layout and Reading Layout entries plus sub-entries to command palette. |
| BUG-059 | All individual settings in Ctrl+K | Backlog | Every toggle, slider, dropdown across all settings pages searchable in command palette. |

### Library & Reader UX

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-050 | 3-line library cards | Backlog | Cards show Title, Author, and Book Data line (progress %, pages, time read/remaining). |
| BUG-067 | "New" dot auto-clear | Backlog | New-item dot clears after card scrolls into viewport and user navigates away. IntersectionObserver + seenAt timestamp. |
| BUG-038 | Hotkey coaching in reader | Backlog | Expand HotkeyCoach to show keyboard shortcut suggestions when users click reader buttons with the mouse. |
| BUG-069 | Paragraph jump shortcuts | Backlog | Shift+Left/Right jumps to paragraph boundaries in all reading modes. Requires paragraph detection in words array. |
| BUG-070 | Scroll wheel word advance | Backlog | Mouse scroll wheel advances/retreats one word at a time in reading modes instead of page scrolling. |

### E-Ink (Sprint 30)

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-037 | E-ink as display mode | 30 | Decouple e-ink from theme system. Users can use dark/light themes while keeping e-ink behavior (no animations, large touch targets, ghosting prevention). |

### Branding

| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| BUG-060 | Remove "[Sample]" prefix | Backlog | Onboarding book title should be "Meditations" not "[Sample] Meditations — Marcus Aurelius". |
| BUG-061 | Blurby icon replaces hamburger | Backlog | Replace hamburger menu icon with Blurby brand icon (~24px, theme-aware). |
| BUG-062 | Blurby brand theme | Backlog | New theme: white background, Highlight Blue (#CAE4FE) chrome, Accent Red (#E63946), Core Blue (#2E73FF) dividers. |

---

## Sprint 24R [v0.9.1]: CRIT Remediation

**Goal:** Fix the 1 actionable CRITICAL from Sprint 24 audit. CRIT-2 (OAuth placeholder creds) deferred to v1.1.0. CRIT-3 dismissed — `.Workflow/` exists on Windows host, invisible to Linux VM audit agents.

**Branch:** `sprint/24r-crit-remediation` | **Tier:** Quick

### KEY CONTEXT
Sprint 24 external audit found 3 CRITICALs. CRIT-1 is a real security hole (arbitrary file read via IPC). CRIT-2 (placeholder OAuth creds) deferred to v1.1.0 — app ships local-only first. CRIT-3 is a false positive — `.Workflow/` exists at `C:\Users\estra\OneDrive\Projects\Blurby\.Workflow` on the Windows host; audit agents running in Linux VM couldn't see it.

### PROBLEM
**CRIT-1:** `read-file-buffer` IPC handler at `main/ipc/library.js:135-143` accepts arbitrary filesystem paths from the renderer with no validation. A compromised renderer could read `~/.ssh/id_rsa`, auth tokens, etc.

### EVIDENCE OF PROBLEM
- `docs/project/AGENT_FINDINGS.md` §CRIT-1 — Full finding with file path and line numbers

### HYPOTHESIZED SOLUTION
Add path allowlist validation to `read-file-buffer`. Resolve the requested path, verify it starts with either `ctx.getDataPath()` or `settings.sourceFolder`. Return null for disallowed paths. Also audit other file-read IPC handlers (`load-doc-content`, `read-file`) for the same pattern.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Audit all file-read IPC handlers for path validation gaps | code-reviewer | sonnet |
| 2 | Add path allowlist to `read-file-buffer` + any other unvalidated handlers found in step 1 | electron-fixer | sonnet |
| 3 | Write tests for path validation (allowed paths pass, disallowed paths return null, path traversal blocked) | electron-fixer | sonnet |
| 4 | Run `npm test` — all tests pass | test-runner | haiku |
| 5 | Run `npm run build` — clean build | test-runner | haiku |
| 6 | Git: commit on branch, merge to main with `--no-ff` | blurby-lead | opus |
| 7 | Print terminal summary: CRITs addressed, test count, what's deferred | blurby-lead | opus |

### WHERE (Read in This Order)

1. `CLAUDE.md` — Agent rules, standing rules
2. `ROADMAP.md` §Sprint 24R — This spec
3. `docs/project/AGENT_FINDINGS.md` — Full audit findings (CRIT-1 details)
4. `main/ipc/library.js` — `read-file-buffer` handler (CRIT-1 target)
5. `main/ipc/` — All 8 IPC handler files (audit for same pattern)
6. `docs/governance/LESSONS_LEARNED.md` — Anti-patterns

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| blurby-lead | opus | Read spec, dispatch, verify, git merge, summary |
| code-reviewer | sonnet | Audit all IPC handlers for path validation gaps (step 1 only, read-only) |
| electron-fixer | sonnet | Implement path validation + tests (steps 2-3) |
| test-runner | haiku | Run tests + build (steps 4-5) |

### WHEN (Execution Order)

```
[1] Audit IPC handlers (code-reviewer, read-only)
    ↓
[2-3] SEQUENTIAL:
    [2] Add path validation (electron-fixer)
    [3] Write path validation tests (electron-fixer)
    ↓
[4-5] SEQUENTIAL:
    [4] npm test (test-runner)
    [5] npm run build (test-runner)
    ↓
[6] Git commit + merge (blurby-lead)
    ↓
[7] Terminal summary (blurby-lead)
```

### ADDITIONAL GUIDANCE

- **Path validation must cover traversal attacks.** `../../etc/passwd` resolved against an allowed root should still fail. Use `path.resolve()` then `startsWith()` on the resolved path vs resolved root.
- **CRIT-2 and CRIT-3 are explicitly OUT OF SCOPE.** CRIT-2: don't touch `main/auth.js` OAuth credentials (deferred v1.1.0). CRIT-3: `.Workflow/` exists on Windows host — false positive, no action needed.
- **Branch:** `sprint/24r-crit-remediation`. Merge to main with `--no-ff`. Delete branch after merge.

### SUCCESS CRITERIA

1. `read-file-buffer` rejects paths outside app data dir and source folder
2. Path traversal attacks (e.g., `../../etc/passwd`) return null
3. All other file-read IPC handlers validated (or confirmed already safe)
4. `package.json` version bumped to `0.9.1`
5. All 776+ tests pass, 0 failures
6. Clean `npm run build`
7. Branch merged to main with `--no-ff`

---

## Sprint KB-1 [v0.10.0]: Keyboard Navigation Remap

**Goal:** Swap Ctrl+Arrow and Shift+Arrow bindings to match OS-native conventions. Ctrl = fine-grained word/sentence navigation. Shift = coarse structural paragraph/chapter jumps. All modes.

**Branch:** `sprint/kb1-keyboard-nav` | **Tier:** Quick (single-component change + tests)

### KEY CONTEXT
Pre-v1.0.0 polish. Current keyboard bindings use Shift+Arrow for word-level movement (Page mode only) and Ctrl+Arrow for paragraph/document jumps. This is backwards from OS-native conventions (Word, Notepad, VS Code) where Ctrl+Arrow = word jump. Swapping to native conventions reduces learning curve for every new user. Also extends word-level navigation to Focus and Flow modes (currently Page-only) and adds sentence boundary navigation.

### PROBLEM
1. **Ctrl+Arrow is non-native.** Ctrl+Left/Right = paragraph jump, Ctrl+Up/Down = doc start/end. In every OS text editor, Ctrl+Arrow = word-level movement.
2. **Shift+Arrow is Page-mode only.** Focus and Flow modes have no single-word seek binding.
3. **No sentence navigation exists.** `hasPunctuation()` detects sentence boundaries but nothing uses it for navigation.
4. **Shift+Up/Down coarse WPM (±50) is dropped.** Up/Down ±25 WPM is sufficient.

### EVIDENCE OF PROBLEM
- `src/hooks/useKeyboardShortcuts.ts` lines 189-212: Current Ctrl+Arrow and Shift+Arrow handlers
- `src/hooks/useKeyboardShortcuts.ts` lines 229-246: Mode-specific arrow handling (Shift+Up/Down = ±50 WPM in Focus/Flow)
- `src/components/ReaderContainer.tsx` lines 440-445: `handleMoveWordSelection` only called from Page mode path

### HYPOTHESIZED SOLUTION
Remap all arrow modifier bindings in `useKeyboardShortcuts.ts` and extend to all modes:

**New Ctrl+Arrow (fine-grained, all modes):**
- `Ctrl+Left`: Seek -1 word (`seekWords(-1)`)
- `Ctrl+Right`: Seek +1 word (`seekWords(1)`)
- `Ctrl+Up`: Seek to previous sentence start (scan backward for `hasPunctuation()`, jump to word after previous sentence-ending word)
- `Ctrl+Down`: Seek to next sentence start (scan forward for `hasPunctuation()`, jump to word after next sentence-ending word)

**New Shift+Arrow (coarse structural, all modes):**
- `Shift+Left`: Paragraph prev (`paragraphPrev()`)
- `Shift+Right`: Paragraph next (`paragraphNext()`)
- `Shift+Up`: Chapter prev (`handlePrevChapter()`)
- `Shift+Down`: Chapter next (`handleNextChapter()`)

**Removed:**
- Shift+Up/Down coarse WPM adjustment (±50) — dropped entirely

**New utility needed:** `findSentenceBoundary(words, currentIndex, direction)` in `src/utils/text.ts` — scans words array using existing `hasPunctuation()` to find sentence starts.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Add `findSentenceBoundary(words, currentIndex, direction)` to `src/utils/text.ts` | renderer-fixer | sonnet |
| 2 | Remap Ctrl+Arrow handlers in `useKeyboardShortcuts.ts`: Ctrl+Left/Right → seekWords(±1), Ctrl+Up/Down → sentence nav callbacks | renderer-fixer | sonnet |
| 3 | Remap Shift+Arrow handlers in `useKeyboardShortcuts.ts`: Shift+Left/Right → paragraphPrev/Next (all modes), Shift+Up/Down → chapter prev/next (all modes) | renderer-fixer | sonnet |
| 4 | Remove Shift+Up/Down coarse WPM (±50) from Focus/Flow mode handler | renderer-fixer | sonnet |
| 5 | Wire `handleSentencePrev`/`handleSentenceNext` callbacks in `ReaderContainer.tsx`, pass to `useReaderKeys()` | renderer-fixer | sonnet |
| 6 | Extend paragraph nav to Focus/Flow modes (currently Page-only gated) | renderer-fixer | sonnet |
| 7 | Update shortcuts overlay data (help text) to reflect new bindings | renderer-fixer | sonnet |
| 8 | Update `electron-api-stub.ts` keyboard shortcut help data if applicable | renderer-fixer | sonnet |
| 9 | Write tests: sentence boundary scanning (edge cases: start of doc, end of doc, consecutive punctuation, no punctuation) | renderer-fixer | sonnet |
| 10 | Run `npm test` — all 776+ tests pass | test-runner | haiku |
| 11 | Run `npm run build` — clean build | test-runner | haiku |
| 12 | Update `docs/governance/LESSONS_LEARNED.md` if any non-obvious discoveries | doc-keeper | sonnet |
| 13 | Git: commit on branch `sprint/kb1-keyboard-nav`, merge to main with `--no-ff` | blurby-lead | opus |
| 14 | Print terminal summary: old bindings → new bindings table, test count, build status | blurby-lead | opus |

### WHERE (Read in This Order)

1. `CLAUDE.md` — Agent rules, standing rules, test policy
2. `ROADMAP.md` §Sprint KB-1 — This spec
3. `src/hooks/useKeyboardShortcuts.ts` — Current key handlers (the main file being changed)
4. `src/components/ReaderContainer.tsx` — Callback wiring, `handleMoveWordSelection`, paragraph nav handlers
5. `src/utils/text.ts` — `hasPunctuation()`, `tokenizeWithMeta()`, paragraph breaks
6. `src/modes/` — Mode interface, FocusMode, FlowMode, PageMode (understand `jumpTo()` and `seekWords()`)
7. `src/utils/FlowCursorController.ts` — Line map, `prevLine()`/`nextLine()` (understand current Flow nav)
8. `docs/governance/LESSONS_LEARNED.md` — Anti-patterns to avoid

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| blurby-lead | opus | Read spec, dispatch renderer-fixer, verify results, git merge, terminal summary |
| renderer-fixer | sonnet | All implementation: text.ts utility, useKeyboardShortcuts remap, ReaderContainer wiring, shortcuts overlay, tests |
| test-runner | haiku | Run `npm test` + `npm run build` after implementation |
| doc-keeper | sonnet | Update LESSONS_LEARNED if applicable |

### WHEN (Execution Order)

```
[1] Add findSentenceBoundary to text.ts (renderer-fixer)
    ↓
[2-4] SEQUENTIAL (same file — useKeyboardShortcuts.ts):
    [2] Remap Ctrl+Arrow handlers
    [3] Remap Shift+Arrow handlers
    [4] Remove coarse WPM
    ↓
[5-6] SEQUENTIAL (ReaderContainer.tsx):
    [5] Wire sentence nav callbacks
    [6] Extend paragraph nav to all modes
    ↓
[7-8] PARALLEL:
    ├─ [7] Update shortcuts overlay (renderer-fixer)
    └─ [8] Update stub help data (renderer-fixer)
    ↓ (both complete)
[9] Write sentence boundary tests (renderer-fixer)
    ↓
[10-11] SEQUENTIAL:
    [10] npm test (test-runner)
    [11] npm run build (test-runner)
    ↓
[12] Update LESSONS_LEARNED (doc-keeper)
    ↓
[13] Git commit + merge (blurby-lead)
    ↓
[14] Terminal summary (blurby-lead)
```

### ADDITIONAL GUIDANCE

- **Sentence boundary edge cases:** First word of document has no "previous sentence." Last word of document has no "next sentence." Handle both by clamping to 0 / words.length-1. Consecutive punctuation words (e.g., `"...`) should be treated as one boundary — skip to the actual sentence start.
- **Paragraph nav in Focus/Flow:** Currently gated behind `mode === "page"` in useKeyboardShortcuts. Remove the gate so Shift+Left/Right triggers `paragraphPrev()`/`paragraphNext()` regardless of mode. The underlying `setHighlightedWordIndex` / `seekWords` should work for all modes — verify by testing.
- **Chapter nav already exists:** `handlePrevChapter` and `handleNextChapter` are already wired. Just map Shift+Up/Down to call them.
- **Ctrl+Up/Down doc start/end is removed.** These bindings are not being relocated. Home/End could be added later but are not in scope.
- **Do NOT change plain Arrow behavior.** Left/Right arrows (no modifier) in Focus/Flow modes keep their existing ±5 word rewind / line jump behavior. Up/Down arrows (no modifier) keep WPM ±25.
- **Branch:** `sprint/kb1-keyboard-nav`. Merge to main with `--no-ff`. Delete branch after merge.

### SUCCESS CRITERIA

1. `Ctrl+Left`/`Ctrl+Right` seeks ±1 word in Page, Focus, and Flow modes
2. `Ctrl+Up`/`Ctrl+Down` seeks to previous/next sentence start in all modes
3. `Shift+Left`/`Shift+Right` jumps to paragraph boundaries in all modes
4. `Shift+Up`/`Shift+Down` jumps to prev/next chapter in all modes
5. Shift+Up/Down no longer adjusts WPM in any mode
6. Plain arrow keys unchanged (Left/Right = page/rewind/line, Up/Down = WPM ±25)
7. `findSentenceBoundary()` handles edge cases: doc start, doc end, consecutive punctuation, no punctuation in text
8. Shortcuts overlay/help text reflects new bindings
9. All 776+ tests pass, 0 failures
10. Clean `npm run build`
11. `package.json` version bumped to `0.10.0`
12. Branch `sprint/kb1-keyboard-nav` merged to main with `--no-ff`

---

## Sprint CT-2: Test Harness Hardening + Bug Fixes

**Goal:** Fix the 33 SKIPs and 5 of the 6 FAILs from the CT-1 click-through test run. Rich seed data, stub persistence, and 3 app bugs.

**Branch:** `sprint/ct2-harness-hardening` | **Tier:** Full (modifies stub + production code)

### KEY CONTEXT
Sprint CT-1 delivered a working browser-based test harness. On 2026-03-28, a full click-through test run produced 82 PASS, 6 FAIL, 33 SKIP. The test report is at `docs/testing/test-run-2026-03-28.md`. The 33 SKIPs are dominated by a single root cause: the stub's Meditations seed data is only ~100 words across 3 tiny chapters, all fitting on one page. A secondary limitation is that stub state doesn't survive page reloads. Five bugs were also discovered.

### PROBLEM
Three gaps prevent the test harness from being useful for ongoing QA:

1. **Short stub content (~100 words):** Blocks 15+ checklist items: page advance/back, chapter jump, extended playback in Focus/Flow, Narrate tracking, WPM adjustment verification, position preservation across mode switches.
2. **No state persistence across reloads:** `electron-api-stub.ts` initializes fresh state on every page load. Any "change → reload → verify" test is impossible.
3. **Five app bugs:**
   - KB-01: `?` opens search palette instead of shortcuts overlay
   - ERR-04: `update-available` event produces no visible notification
   - ERR-05: `cloud-auth-required` event produces no visible response
   - MODE-04: Shift+Space doesn't cycle Narrate → Focus (one-way cycle)
   - Single seed doc prevents multi-doc testing (J/K nav, search filtering, delete-one)

### EVIDENCE OF PROBLEM
- `docs/testing/test-run-2026-03-28.md` — Full 121-item test report: 82 PASS, 6 FAIL, 33 SKIP
- OB-05 FAIL: `setFirstRunCompleted(true)` + `location.reload()` → onboarding reappeared
- READ-03/04 SKIP: "content fits on 1 page — stub data limitation"
- MODE-04 FAIL: Shift+Space in Narrate mode → remained in Narrate
- KB-01 FAIL: `?` key → search palette instead of ShortcutsOverlay

### HYPOTHESIZED SOLUTION
Five workstreams:
- **CT-2A:** Rich seed data — expand Meditations to ~2,000 words / 12 chapters (original placeholder prose — philosophical reflections matching chapter titles, NOT verbatim public domain text, to avoid content filter blocks). Add second seed doc ("sample-article", ~500 words, also original).
- **CT-2B:** sessionStorage persistence — hydrate stub state from sessionStorage on init, persist on every mutation. Add `clearPersistence()` method.
- **CT-2C:** `?` shortcut fix — opens ShortcutsOverlay instead of search palette.
- **CT-2D:** Event notification handlers — `update-available` and `cloud-auth-required` produce visible toasts.
- **CT-2E:** Mode cycling fix — Shift+Space cycles Narrate → Focus, completing the circular cycle.

### Workstreams

| ID | Task | Agent | Model |
|----|------|-------|-------|
| CT-2A.1 | Expand Meditations seed content to ~2,000 words / 12 chapters in `electron-api-stub.ts` | `renderer-fixer` | sonnet |
| CT-2A.2 | Add second seed document ("sample-article", ~500 words) to stub library | `renderer-fixer` | sonnet |
| CT-2B | Implement sessionStorage persistence in `electron-api-stub.ts` | `renderer-fixer` | sonnet |
| CT-2C | Fix `?` shortcut to open ShortcutsOverlay instead of search | `renderer-fixer` | sonnet |
| CT-2D.1 | Add `update-available` toast handler in renderer | `renderer-fixer` | sonnet |
| CT-2D.2 | Add `cloud-auth-required` toast handler in renderer | `renderer-fixer` | sonnet |
| CT-2E | Fix Shift+Space mode cycling from Narrate → Focus | `ui-investigator` + `renderer-fixer` | opus + sonnet |

### Agent Assignments

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | All stub improvements (CT-2A, CT-2B), shortcut fix (CT-2C), event handlers (CT-2D), mode cycling fix implementation (CT-2E) |
| `ui-investigator` | opus | Root-cause analysis for MODE-04 (Shift+Space in Narrate). Read-only investigation of key event flow through useReaderMode → NarrateMode → useKeyboardShortcuts. Output: exact diagnosis + fix spec. |
| `test-runner` | haiku | Full test + build verification |
| `doc-keeper` | sonnet | Post-sprint documentation updates |

### Execution Order

```
[1–3] PARALLEL (independent stub modifications):
    ├─ [1-2] Rich seed data — expand Meditations + add second doc (renderer-fixer)
    └─ [3] sessionStorage persistence (renderer-fixer)
    ↓ (all complete)
[4–6] PARALLEL (independent bug fixes, no shared files):
    ├─ [4] ? shortcut fix (renderer-fixer)
    ├─ [5-6] Event notification handlers (renderer-fixer)
    └─ [7a] Mode cycling investigation (ui-investigator) — read-only
    ↓ (7a complete)
[7b] Mode cycling fix implementation (renderer-fixer) — depends on 7a diagnosis
    ↓ (all complete)
[8] Test suite + build (test-runner)
    ↓
[9] Documentation update (doc-keeper)
    ↓
[10] Git commit + merge (blurby-lead)
```

### Read Order
1. `CLAUDE.md` — System state, standing rules, test harness section
2. `docs/testing/test-run-2026-03-28.md` — Full test report with all FAIL/SKIP details
3. `docs/governance/LESSONS_LEARNED.md` — LL-042/043/044 for narration mode context
4. `src/test-harness/electron-api-stub.ts` — Current stub (expand content, add persistence)
5. `src/hooks/useKeyboardShortcuts.ts` — `?` key handler (CT-2C fix target)
6. `src/components/ShortcutsOverlay.tsx` — Verify component exists and how it's triggered
7. `src/hooks/useReaderMode.ts` — Mode cycling logic, Shift+Space handler (CT-2E target)
8. `src/modes/NarrateMode.ts` — Narrate mode key handling (may intercept Shift+Space)
9. `src/App.tsx` — IPC event listener wiring (CT-2D target)
10. `src/contexts/ToastContext.tsx` — Toast API for event notifications

### Additional Guidance
- **Meditations text source:** DO NOT use verbatim public domain text (triggers API content filter on large outputs). Instead, write ORIGINAL placeholder prose — philosophical reflections that match the chapter titles ("Book One: Debts and Lessons", "Book Two: On the River Gran", etc.). Keep the philosophical tone of Meditations but use entirely original sentences. Books 1-12, ~150-200 words/chapter, ~2,000 total. Generate content in 2-3 chunks if needed to stay under output limits.
- **Second seed doc:** Original short essay (~500 words, NOT copied from any source). Set `type: "article"`, `source: "sample"`, `id: "sample-article"`. Enables multi-doc J/K nav, search, delete-one, and "articles" type filter.
- **Content filter workaround:** The API blocks large outputs of verbatim public domain text. All seed content must be ORIGINAL prose. If a single generation triggers the filter, split into smaller chunks (3-4 chapters at a time) and concatenate.
- **sessionStorage key:** `'blurbyStubState'`. Serialize as JSON. Only persist 4 mutable stores: `settings`, `library`, `highlights`, `readingStats`.
- **`clearPersistence()` method:** Add to `window.__blurbyStub` alongside `reset()`, `emit()`, etc. Calls `sessionStorage.removeItem('blurbyStubState')` + `reset()`.
- **Mode cycling fix:** Key question: does `Shift+Space` in Narrate mode get intercepted by narration key handler (Space as pause) BEFORE reaching the cycle handler (Shift+Space as cycle)? If so, fix: check for Shift modifier in narration handler and let Shift+Space pass through.
- **Event handlers:** Minimal — toast notification with optional action button. Don't build elaborate update management or re-auth UI.

### Acceptance Criteria
1. `SAMPLE_CONTENT` in `electron-api-stub.ts` contains ≥2,000 words across ≥10 chapters
2. `MEDITATIONS_CHAPTERS` array has ≥10 entries with correct character offsets
3. `sampleMeditationsDoc.wordCount` matches actual `SAMPLE_CONTENT` word count
4. A second seed document ("sample-article") appears in the stub library on init
5. `sessionStorage.getItem('blurbyStubState')` is populated after any mutating stub call
6. Page reload preserves settings changes (theme switch survives reload)
7. Page reload preserves library mutations (favorite toggle survives reload)
8. `window.__blurbyStub.clearPersistence()` removes sessionStorage and resets to defaults
9. Pressing `?` in library view opens ShortcutsOverlay (not search palette)
10. `window.__blurbyStub.emit("update-available", "2.0.0")` produces a visible toast
11. `window.__blurbyStub.emit("cloud-auth-required", "microsoft")` produces a visible toast
12. Shift+Space in Narrate mode cycles to Focus mode (circular cycle complete)
13. Shift+Space in Focus mode cycles to Flow mode (no regression)
14. Shift+Space in Flow mode cycles to Narrate mode (no regression)
15. `npm test` passes (all existing + no regressions), `npm run build` succeeds
16. Branch `sprint/ct2-harness-hardening` merged to main with `--no-ff`

---

## Sprint CT-3: Click-Through Repair

**Goal:** Fix all actionable bugs found during the post-CT-2 click-through re-run, align the checklist with the actual codebase, and address the Focus mode visual stability issue. This is the final code-change sprint before v1.0.0.

**Prerequisite:** CT-2 complete + click-through re-run filed as `docs/testing/test-run-CT3-2026-03-28.md` (101 PASS / 6 FAIL / 14 SKIP).

**Branch:** `sprint/ct3-click-repair` | **Tier:** Quick (targeted bug fixes + checklist update)

### KEY CONTEXT

Sprint CT-2 delivered a hardened test harness (rich seed data, sessionStorage persistence, 5 bug fixes). On 2026-03-28, a full 121-item click-through test was executed via Chrome automation (Cowork + Claude in Chrome MCP). Result: 101 PASS / 6 FAIL / 14 SKIP. All failures are in the Keyboard Shortcuts section. Additionally, a visual stability issue was identified in Focus mode (word flicker/bounce), and the checklist itself has drifted from the actual keyboard shortcut mappings.

### PROBLEM

Four categories of issues emerged from the test run:

1. **Keyboard shortcut checklist drift (5 items):** The checklist maps G-sequences to `gf`=favorites, `gs`=stats, `gr`=recent, `gh`=snoozed, `gc`=collections. The actual app maps `G+S`=starred/favorites, `G+A`=archive, `G+I`=inbox, `G+Q`=queue, `G+G`=top. Several checklist items reference shortcuts that don't exist in the implementation.
2. **Ctrl+, shortcut conflict (1 item):** KB-16 — `Ctrl+,` opens Reading Queue sidebar instead of settings. The keyboard overlay says `Ctrl+,` = "Open full settings" but the actual behavior differs.
3. **Focus mode visual instability (observed):** Words flicker/bounce when advancing in Focus mode. Root cause: 8px Y-translate animation, forced reflow via `offsetWidth`, ORP marker position snapping, font-weight shift between normal and bold for the focus character.
4. **Untestable items (14 SKIPs):** G-sequences (8 — automation timing), drag-and-drop (3 — native events), Kokoro audio (2 — hardware verification), ERR-01 (1 — stub manipulation).

### EVIDENCE OF PROBLEM

- `docs/testing/test-run-CT3-2026-03-28.md` — Full 121-item test report
- KB-08/10/13: G-sequence shortcuts did not fire via browser automation. The hotkey overlay confirms mappings differ from checklist.
- KB-16: `Ctrl+,` opened Reading Queue, not Settings. Screenshotted during test run.
- Focus mode screenshots show word display with visible Y-translate animation and ORP marker jumping.
- `src/styles/global.css` lines 382-410: `focus-word-enter` animation with `transform: translate3d(0, 8px, 0)`.
- `src/components/ReaderView.tsx` lines 102-107: `void container.offsetWidth` forced reflow on every word.

### HYPOTHESIZED SOLUTION

Four workstreams:

- **CT-3A: Checklist alignment** — Rewrite KB section of `chrome-clickthrough-checklist.md` to match actual `useKeyboardShortcuts.ts` mappings. Remove phantom shortcuts, add real ones.
- **CT-3B: Ctrl+, shortcut fix** — Investigate why `Ctrl+,` doesn't open settings. Likely a handler ordering issue or Chrome browser-level interception. Fix in `useKeyboardShortcuts.ts`.
- **CT-3C: Focus mode visual stability** — Reduce `focus-word-enter` Y-translate from 8px to 0-2px. Add CSS transition to focus marks. Consider `requestAnimationFrame` instead of forced reflow. Test at 300 WPM and 500+ WPM.
- **CT-3D: Improve DD/ERR coverage** — Add file drop zone stub support to enable DD-01/02/03 testing. Add ERR-01 (delete doc + try to open) test path.

### Workstreams

| ID | Task | Agent | Model |
|----|------|-------|-------|
| CT-3A | Rewrite KB section of `chrome-clickthrough-checklist.md` to match actual keybindings from `useKeyboardShortcuts.ts` | `doc-keeper` | sonnet |
| CT-3B.1 | Investigate Ctrl+, handler — trace key event from `useKeyboardShortcuts.ts` through to handler registration. Identify why it opens Reading Queue instead of Settings. | `ui-investigator` | opus |
| CT-3B.2 | Fix Ctrl+, to open settings (based on CT-3B.1 diagnosis) | `renderer-fixer` | sonnet |
| CT-3C.1 | Reduce Focus mode word animation: change Y-translate from 8px to 0-2px in `global.css`, add CSS transition to `.focus-mark` position, replace `void container.offsetWidth` with `requestAnimationFrame` in `ReaderView.tsx` | `renderer-fixer` | sonnet |
| CT-3C.2 | Verify Focus mode at 300 and 600 WPM — words stable, no visible flicker | `spec-reviewer` | sonnet |
| CT-3D.1 | Add `importDroppedFiles` handler to `electron-api-stub.ts` with drag-drop zone support | `renderer-fixer` | sonnet |
| CT-3D.2 | Add ERR-01 test path: `deleteDoc` in stub, verify reader handles missing doc gracefully | `renderer-fixer` | sonnet |
| CT-3E | `npm test` + `npm run build` | `test-runner` | haiku |
| CT-3F | Update CLAUDE.md, ROADMAP.md, LESSONS_LEARNED.md | `doc-keeper` | sonnet |
| CT-3G | Git commit + merge to main | `blurby-lead` | opus |

### Agent Assignments

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `ui-investigator` | opus | Ctrl+, root-cause analysis (read-only). Output: exact diagnosis + fix location. |
| `renderer-fixer` | sonnet | Ctrl+, fix (CT-3B.2), Focus stability (CT-3C.1), stub improvements (CT-3D) |
| `spec-reviewer` | sonnet | Verify Focus mode visual stability at multiple WPMs (CT-3C.2) |
| `doc-keeper` | sonnet | Checklist rewrite (CT-3A), post-sprint docs (CT-3F) |
| `test-runner` | haiku | Full test + build verification (CT-3E) |
| `blurby-lead` | opus | Git operations (CT-3G) |

### Execution Order

```
[1-3] PARALLEL (independent workstreams):
    ├─ [1] Checklist alignment (doc-keeper) — no code changes
    ├─ [2] Ctrl+, investigation (ui-investigator) — read-only
    └─ [3] Focus stability CSS + JS fix (renderer-fixer) — global.css + ReaderView.tsx
    ↓ (2 complete)
[4] Ctrl+, fix implementation (renderer-fixer) — depends on investigation
    ↓ (3 complete)
[5] Focus mode verification at 300/600 WPM (spec-reviewer) — depends on CSS fix
    ↓ (1, 4, 5 complete)
[6-7] PARALLEL:
    ├─ [6] Stub improvements — drag-drop + ERR-01 (renderer-fixer)
    └─ [7] Tests + build (test-runner)
    ↓ (all complete)
[8] Documentation update (doc-keeper)
    ↓
[9] Git commit + merge (blurby-lead)
```

### Read Order

1. `docs/testing/test-run-CT3-2026-03-28.md` — Full test report (this is the evidence)
2. `docs/testing/chrome-clickthrough-checklist.md` — Current checklist (to be rewritten KB section)
3. `src/hooks/useKeyboardShortcuts.ts` — Actual keybinding definitions (source of truth for CT-3A + CT-3B)
4. `src/styles/global.css` — Focus animation keyframes (CT-3C target, lines 382-439)
5. `src/components/ReaderView.tsx` — Focus word rendering, forced reflow (CT-3C target, lines 95-147)
6. `src/test-harness/electron-api-stub.ts` — Stub to extend for CT-3D
7. `CLAUDE.md` — Standing rules, system state
8. `docs/governance/LESSONS_LEARNED.md` — Any relevant prior discoveries

### Additional Guidance

- **Checklist alignment (CT-3A):** Read `useKeyboardShortcuts.ts` exhaustively. Map every registered handler to its shortcut key. Remove any checklist items that reference shortcuts not in the code. Add items for shortcuts that exist but aren't tested. Keep the same checklist format (table with ID, Action, Expected, Screenshot, Console).
- **Ctrl+, (CT-3B):** Chrome intercepts `Ctrl+,` to open its own settings. The app handler may be getting swallowed. If this is an unresolvable browser conflict, document it as a known limitation and skip KB-16 in the checklist. The keyboard overlay should be updated to remove `Ctrl+,` if it can't work in browser context.
- **Focus stability (CT-3C):** The goal is calm, stable word presentation with no perceived motion. Preferred approach: opacity-only animation (no Y-translate), smooth focus mark transitions, no forced reflow. Test with both short words ("a", "the") and long words ("understanding", "philosophical") since width shifts are more visible on short words.
- **Stub improvements (CT-3D):** For drag-drop, implement a `handleDrop` event listener on the app root that intercepts `dragover`/`drop` events and routes to `importDroppedFiles`. For ERR-01, add a `deleteDoc(id)` method to `window.__blurbyStub` and verify the reader shows an error state when the doc is opened.
- **Do NOT change the G-sequence implementation.** The G-sequences appear to work correctly — the automation timing was the issue. The checklist needs to be updated to match the actual mappings, not the other way around.

### Acceptance Criteria

1. `chrome-clickthrough-checklist.md` KB section matches actual `useKeyboardShortcuts.ts` keybindings exactly
2. No phantom shortcuts in checklist (every listed shortcut has a corresponding handler in code)
3. `Ctrl+,` either (a) opens settings panel or (b) is documented as browser-conflict limitation and removed from checklist
4. Focus mode word display has no visible Y-translate bounce at 300 WPM
5. Focus mode ORP markers transition smoothly (no position snapping)
6. No forced reflow (`void container.offsetWidth`) in Focus word rendering path
7. `electron-api-stub.ts` handles `importDroppedFiles` calls and `deleteDoc` + reader error state
8. `npm test` passes (776+ tests, 0 failures), `npm run build` succeeds
9. No regressions — all 101 previously-passing click-through items still PASS
10. Branch `sprint/ct3-click-repair` merged to main with `--no-ff`

> **Note:** CT-3 and Sprint 24 run in PARALLEL. CT-3 fixes bugs (code changes). Sprint 24 audits the codebase (read-only). No file conflicts — Sprint 24 only writes to `docs/project/AGENT_FINDINGS.md`. If the audit surfaces CRITICALs that overlap with CT-3 bugs, they're already being fixed. New CRITICALs from the audit get addressed in a remediation pass after both complete.

---

## Sprint 24: External Audit

**Goal:** Run the full external audit pipeline per `.workflow/skills/external-audit/SKILL.md` before declaring v1. This is the quality gate — an independent, systematic review of the entire codebase.

**Prerequisite:** Sprint CT-2 complete. Runs in PARALLEL with CT-3 (no file conflicts — audit writes only to `docs/project/AGENT_FINDINGS.md`).

**Branch:** `sprint/24-external-audit` (read-only unless CRITICALs found) | **Tier:** None (audit only)

### Spec

**24A. Code quality audit**
- Lint pass: identify dead code, unused imports, inconsistent naming, type safety gaps
- Architecture compliance: verify all standing rules from CLAUDE.md
- Known-trap regression: check for re-introduced patterns from LESSONS_LEARNED.md
- Output: findings to `docs/project/AGENT_FINDINGS.md`

**24B. Test coverage audit**
- Map test files to features: identify any feature with zero test coverage
- Priority gaps: IPC handler coverage, sync engine edge cases, TTS sync logic, onboarding
- Recommend specific tests to add (log as findings, don't write in this sprint)

**24C. Architecture review**
- Module dependency graph: verify no circular dependencies
- Bundle size analysis: flag anything > 100KB that could be lazy-loaded
- Security surface: review all IPC channels, CSP headers, token storage
- Cloud sync audit: verify revision counter logic, tombstone cleanup, merge correctness

**24D. Documentation alignment**
- CLAUDE.md accuracy: verify all file paths, feature statuses match reality
- ROADMAP.md accuracy: verify acceptance criteria match implementations
- LESSONS_LEARNED.md completeness: verify recent sprints have entries

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Code quality audit (24A) | `code-reviewer` | — |
| 2 | Test coverage audit (24B) | `code-reviewer` | — |
| 3 | Architecture review (24C) | `ui-investigator` | — |
| 4 | Documentation alignment (24D) | `doc-keeper` | — |
| 5 | Findings consolidation | `blurby-lead` | Steps 1-4 |

> Steps 1-4 are FULLY PARALLELIZABLE. Step 5 consolidates.

### Acceptance Criteria
- Zero known-trap regressions from LESSONS_LEARNED.md
- All standing rules verified compliant
- Dead code and unused imports flagged
- Every feature set has at least one test file mapped
- Coverage gaps logged with recommended test additions
- No circular dependencies
- Bundle analysis completed, largest modules identified
- Security surface reviewed (IPC, CSP, tokens)
- CLAUDE.md and ROADMAP.md accuracy verified
- All findings in `docs/project/AGENT_FINDINGS.md` with severity ratings
- **CRITICALs block v1.0.0 release**

---

## Sprint 25: RSS Library + Paywall Site Integration

**Goal:** Post-v1 feature. Feed aggregation from authenticated paywall sites, RSS Library UI, "Add to Blurby" import pipeline.

**Prerequisite:** v1.0.0 released (Sprint 24 audit passed).

**Branch:** `sprint/25-rss-library` | **Tier:** Full (new feature)

### Spec

**25A. Feed discovery and management** — Data model (`Feed` object), auto-discover from URL imports, manual add, auto-detect RSS from site URLs, `feeds.json` persistence, CRUD operations. New `main/feed-manager.js` + IPC channels.

**25B. Feed item fetching and caching** — RSS 2.0/Atom 1.0/JSON Feed parsing, authenticated fetch via stored cookies, dedup by URL, 200-item retention cap, `feed-items.json` cache. New `main/feed-parser.js`.

**25C. RSS Library UI** — "Feeds" nav in menu flap, left sidebar with feed list + unread counts, feed item cards (title, author, date, excerpt, thumbnail), "Add to Blurby" (→ Readability import), "Open in Browser", "Mark Read". Keyboard: `G F`, `J/K`, `A`, `O`, `M`.

**25D. Cloud sync for feeds** — Feed list syncs (set-union merge), read/imported states sync (latest-wins), items re-fetched per device.

### Agent Assignments

| Step | What | Agent | Depends On |
|------|------|-------|------------|
| 1 | Feed engine (25A) | `electron-fixer` | — |
| 2 | Feed parser (25B) | `format-parser` | Step 1 |
| 3 | RSS Library UI (25C) | `renderer-fixer` | Step 2 |
| 4 | Feed cloud sync (25D) | `electron-fixer` | Steps 1-2 |
| 5 | Spec compliance review | `spec-reviewer` | Steps 1-4 |
| 6 | Test suite + build | `test-runner` | Step 5 |

### Acceptance Criteria
- Feeds addable by URL (manual) and auto-discovered from site URLs
- RSS 2.0, Atom 1.0, JSON Feed parse correctly
- Authenticated feeds use stored cookies
- Items deduped by URL, max 200/feed
- "Feeds" nav in menu flap, full keyboard support
- "Add to Blurby" imports via Readability pipeline
- Feed list syncs across devices (set-union), read states sync (latest-wins)
- `npm test` passes, `npm run build` succeeds

---

## Execution Order

```
Sprints 1-23 + 25S + TD-1/2 + CT-1 + TH-1 ── COMPLETED
    │
    │   776 tests, 38 files. Core app complete.
    │
    ▼
Sprint CT-2:                               ◄── NEXT
Test Harness Hardening
(rich seed data, persistence, 5 bug fixes)
    │
    ▼
Click-through re-run ────────────── GATE (manual)
    │
    ├──────────────────────────────────┐
    ▼                                  ▼
Sprint CT-3:                       Sprint 24:
Click-through Repair               External Audit
(fix all FAILs)                    (read-only quality gate)
    │                                  │
    └──────────────┬───────────────────┘
                   ▼
         v1.0.0 RELEASE ────────── GATE
                   │
    ├──────────────┴──────────────────┐
    ▼                                  ▼
Sprint 25:                         Sprint 18C:
RSS Library +                      Android APK
Paywall Integration                (React Native)
(POST-V1)                          (POST-V1)
```

---

## Someday Backlog

- Code signing certificate for Windows SmartScreen trust
- Multi-window support (multiple reader windows simultaneously)
- Import/export (backup library, stats to CSV)
- Symlink path traversal protection in folder scanner
- requestAnimationFrame migration for all remaining setInterval timers
- Streaming ZIP parsing for large EPUBs (replace AdmZip full-memory load)
- Time-window stats archival (keep last year, archive older sessions)
- Toast queue system (replace setTimeout-based toast dismissal)
- Reading queue sort by remaining words (prioritize closest to completion)
- Version-pin critical dependencies (pdf-parse, adm-zip, readability)
- Unload lazy-loaded modules after use if memory pressure detected
- iOS app (port Track C to iOS via React Native — same codebase)
- Firefox extension (port Track B to Firefox Manifest V3)
- Safari extension (port Track B via Safari Web Extensions API)
