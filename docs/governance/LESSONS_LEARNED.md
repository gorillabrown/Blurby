# Lessons Learned — Blurby Speed Reader

**Document type:** First-class engineering artifact
**Created:** 2026-03-21 (Session 1)
**Scope:** All sessions — architecture, features, performance, UX, distribution
**Maintained by:** Updated every session with new discoveries

---

## How to Use This Document

This document captures hard-won knowledge from Blurby development. Every entry records what happened, why it mattered, and what rule it established going forward.

**For new sessions:** Read the Persistent Rules section before starting work. Check Known Traps before implementing anything in the relevant area.

**For Claude Code agents:** Before implementing any roadmap item, scan entries tagged with the relevant area for constraints and gotchas.

---

## Chronological Log

### [2026-03-21] LL-001: OneDrive Mount Read Failures in Cowork VM

**Area:** infrastructure, file access
**Status:** active
**Priority:** high

**Context:** Cowork's Linux VM cannot read files from OneDrive-synced folders when files are "cloud-only" (not downloaded locally). All standard file operations (cat, python open, Read tool) fail with "Invalid argument" (EINVAL).

**Root Cause:** OneDrive's on-demand sync keeps files as placeholders until accessed from Windows. The FUSE mount in the VM cannot trigger the download.

**Guardrail:** When working with Blurby files in Cowork, either (a) ensure files are synced locally in OneDrive before mounting, or (b) access via GitHub browser when file reads fail. For Claude Code CLI running natively on Windows, this is not an issue.

---

### [2026-03-21] LL-002: PR #1 Is Massive — 102 Commits, 80 Files

**Area:** process, git hygiene
**Status:** active
**Priority:** moderate

**Context:** The entire development history from initial skeleton to full-featured app lives in a single PR (#1) with 102 commits. This is unreviewable in a traditional code review sense.

**Decision:** Merge PR #1 as a baseline. Going forward, use smaller PRs per sprint (1-5 commits each). Never let a branch accumulate more than ~20 commits before merging.

**Guardrail:** Each sprint should produce a mergeable PR. Branch naming: `sprint/[N]-[short-name]`.

---

### [2026-03-21] LL-003: main.js Is 93KB and Growing

**Area:** architecture, maintainability
**Status:** active
**Priority:** high

**Context:** The Electron main process file (main.js) handles everything: IPC, file I/O, folder watching, data persistence, URL extraction, PDF export, format parsing, migrations, window management. At 93KB it's the single largest file and a maintenance hazard.

**Guardrail:** The Performance Sprint should include modularizing main.js into focused modules (e.g., `main/ipc-handlers.js`, `main/file-parsers.js`, `main/migrations.js`, `main/window-manager.js`). Each module exports handlers that main.js registers.

---

### [2026-03-21] LL-004: GitHub Repo is Private — No CI/CD

**Area:** infrastructure, quality
**Status:** active
**Priority:** moderate

**Context:** The repo (`gorillabrown/Blurby`) has no GitHub Actions, no automated test runs on PR, no build verification. Tests and builds only run manually.

**Guardrail:** Distribution Sprint should add a basic CI workflow: `npm test` + `npm run build` on every push/PR to main.

---

### [2026-03-21] LL-005: Workflow Reversal — OneDrive-First, Git to Publish

**Area:** infrastructure, workflow
**Status:** active
**Priority:** high

**Context:** Previously, Claude Code worked in its own context and pushed directly to GitHub. The user then pulled to OneDrive. This created a disconnected workflow where the working directory and the publication target were inverted.

**Decision:** Reverse the flow. OneDrive is the working directory (needed for cross-machine access). Claude Code CLI runs directly against the OneDrive path. Git push to GitHub happens when sprints or phases complete — GitHub is the publication/backup target, not the working source.

**Key distinction:** Cowork's Linux VM still can't read OneDrive files (LL-001), but Claude Code CLI runs natively on Windows and has no issues with OneDrive paths. Cowork accesses code via GitHub browser when needed.

**Guardrail:** OneDrive is the source of truth for active work. GitHub reflects completed milestones. Don't push incomplete sprint work to GitHub — commit locally as you go, push when a sprint's acceptance criteria are met.

---

### [2026-03-21] LL-006: Atomic JSON Writes Prevent Data Corruption

**Area:** data integrity, file I/O
**Status:** active
**Priority:** high

**Context:** Direct `writeFile()` calls risk partial writes on disk full or power loss, leaving JSON files corrupted with no recovery path. Discovered during Sprint 9 security hardening.

**Fix:** All JSON writes now use the write-to-temp-then-rename pattern: `writeFile(path + ".tmp", data)` followed by `rename(path + ".tmp", path)`. The rename is atomic on all supported operating systems.

**Guardrail:** Never use direct `writeFile()` for persistent data. Always write to a `.tmp` file first, then rename. This applies to library.json, settings.json, history.json, and any future data files.

---

### [2026-03-21] LL-007: Content Security Policy in Electron

**Area:** security, Electron
**Status:** active
**Priority:** high

**Context:** Without CSP, URL-fetched content processed by Readability could execute arbitrary scripts in the app's context. Sprint 9 added CSP via `onHeadersReceived` session handler rather than a meta tag, because Electron's `webRequest` API allows enforcing CSP on all responses including dynamically loaded content.

**Guardrail:** CSP is enforced at the session level via `onHeadersReceived`. Any new BrowserWindow or webview must use the same session or have its own CSP. Never disable CSP for debugging and forget to re-enable it.

---

### [2026-03-21] LL-008: React Context vs Prop Drilling — When to Switch

**Area:** React architecture, renderer
**Status:** active
**Priority:** moderate

**Context:** Sprint 11 refactored App.tsx from 548 lines to 115 by extracting ReaderContainer and LibraryContainer, and replacing 18+ prop chains with SettingsContext and ToastContext. The decision criteria that worked: if a prop passes through 2+ intermediate components unchanged, it belongs in context. If a prop is consumed directly by the receiving component, keep it as a prop.

**Guardrail:** Use context for cross-cutting concerns (settings, toasts, theme). Use props for parent-child data that the child directly consumes. Never put frequently-changing values (word index, playback state) in context — that defeats memoization.

---

## Persistent Rules and Guardrails

| ID | Rule | Source |
|----|------|--------|
| PR-1 | Roadmap is the single source of truth for implementation plans | Constitution Art. IV |
| PR-2 | After any code change, run `npm test` before proceeding | Standing Rules |
| PR-3 | After any UI/dependency change, run `npm run build` | Standing Rules |
| PR-4 | All file I/O in main.js must use fs.promises (async) | AP-3 |
| PR-5 | Never import Node.js modules in renderer code | AP-1 |
| PR-6 | preload.js is the security boundary — keep it minimal | AP-2 |
| PR-7 | CSS custom properties for all theming — no inline styles | AP-5 |
| PR-8 | Schema migrations backup before applying | AP-6 |
| PR-9 | Smaller PRs per sprint — never >20 commits before merge | LL-002 |
| PR-10 | All JSON writes must be atomic (write-tmp + rename) | LL-006 |
| PR-11 | CSP enforced at session level via onHeadersReceived | LL-007 |
| PR-12 | Context for cross-cutting concerns; props for direct parent-child data | LL-008 |

---

## Known Traps

| Trap | Area | Mitigation |
|------|------|------------|
| OneDrive cloud-only files | Cowork VM | Check for EINVAL errors; fall back to GitHub browser |
| Synchronous fs in main.js | Electron | Audit and convert all remaining sync calls |
| React re-renders during playback | Reader | Use refs for word index during active playback |
| IPC channel name typos | Full stack | Channel names must match across main.js, preload.js, renderer |
| EPUB with NCX-only TOC | Format parsing | Handle both NCX and nav TOC extraction paths |
| PDF multi-column text order | Format parsing | Document as known limitation |
| DRM-protected ebooks | Format parsing | Detect and message — never bypass |
| Direct writeFile for JSON data | Data integrity | Always use atomic write (tmp + rename) |
| Frequently-changing values in React context | Renderer perf | Defeats memoization — use refs for hot-path values |
| Missing CSP on new windows | Security | Every BrowserWindow needs CSP via session handler |
| Dead code masked by syntax errors | main.js | Syntax errors stop parsing — duplicate functions/broken code after the error point are invisible until packaged |
| Asar packaging finds bugs dev mode hides | Distribution | Always run `node -c main.js` before releasing — dev mode may lazy-parse and never hit broken paths |

---

### [2026-03-22] LL-009: Corrupted main.js Masked by Syntax Error Position

**Area:** main process, distribution, code quality
**Status:** resolved
**Priority:** critical

**Context:** When packaging the app for the first time via electron-builder (Sprint 18A), the installed .exe crashed on launch with `SyntaxError: Missing catch or finally after try` at main.js:944. Investigation revealed TWO pre-existing bugs:

1. **Missing catch blocks** — two `try` blocks in the `add-doc-from-url` IPC handler had no `catch` or `finally`. This was introduced in a prior sprint and never caught because `node -c main.js` was never run and dev mode didn't hit this code path at module load time.

2. **Corrupted function merge** — `startWatcherFn()` had its `onChange` callback body truncated mid-line, merging directly into `createWindow()` code. Below the corruption, three functions (`createWindow`, `createTray`, `setupAutoUpdater`) and three more (`getSystemTheme`, `broadcastSystemTheme`, `updateWindowTheme`) existed as dead duplicates of functions already properly implemented in `main/window-manager.js`. These duplicates were never reached because Node stopped parsing at the first syntax error.

**Root Cause:** The syntax error at line 944 acted as a firewall — Node never parsed past it, so the duplicate function declarations and corrupted code below were invisible. The app worked in dev because Electron loaded modules lazily and the broken paths were never exercised during startup. Packaging into an asar forces a full parse.

**Fix:** Added missing catch blocks, restored the truncated `startWatcherFn` body, removed 6 dead duplicate functions (97 lines of dead code).

**Guardrail:** Add `node -c main.js` as a syntax check step before packaging. Consider adding it to the CI pipeline. Always run the packaged build (not just dev mode) before releasing.

---

### [2026-03-22] LL-010: React Word Spans Need Explicit Whitespace

**Area:** renderer, text rendering
**Status:** resolved
**Priority:** critical

**Context:** PageReaderView rendered each word as a separate `<span>` element. React does not insert whitespace between adjacent inline elements, causing all words to run together into an unreadable block. The text appeared as "Hello.world.this.is.a.test" instead of "Hello. world. this is a test."

**Fix:** Added `{" "}` inside each word span after the word text: `<span>{word}{" "}</span>`. Alternatively could use CSS `word-spacing`, but explicit text nodes are more reliable across browsers.

**Guardrail:** When rendering tokenized words as individual spans/elements, always include a whitespace text node or CSS spacing. This applies to PageReaderView, FlowText, and any future per-word rendering.

---

### [2026-03-22] LL-011: Pagination Off-by-One Causes Word Duplication

**Area:** renderer, PageReaderView
**Status:** resolved
**Priority:** high

**Context:** The pagination algorithm set `pageStart = i` when breaking to a new page, but the word at index `i` was already included as the `end` of the previous page. This caused the last word of every page to appear as the first word of the next page. Similarly, paragraph break detection used `paragraphBreaks.has(globalIdx + 1)` but the tokenizer marks the LAST word of each paragraph, not the first word of the next.

**Fix:** Changed `pageStart = i` to `pageStart = i + 1`, and `paragraphBreaks.has(globalIdx + 1)` to `paragraphBreaks.has(globalIdx)`.

**Guardrail:** When implementing pagination with start/end ranges, verify that boundary words are not counted in both the current and next page. Write a test with known word counts and verify page word counts sum to the total.

---

### [2026-03-22] LL-012: Keyboard Mode Gate Must Be Per-Mode, Not Universal

**Area:** renderer, keyboard shortcuts
**Status:** resolved
**Priority:** critical

**Context:** The keyboard shortcut handler had a `if (s.readerMode !== "speed") return;` gate that blocked Space, arrow keys, and Escape from working in non-Focus modes. When the three-mode reader was introduced (Page/Focus/Flow), this gate prevented all keyboard interaction in Page view — arrow keys couldn't flip pages, Space couldn't enter Focus, etc.

The fix was more nuanced than just removing the gate: different modes need DIFFERENT key behaviors. ← → should flip pages in Page mode but seek words in Focus mode. Shift+arrows should select words in Page mode but adjust coarse WPM in Focus/Flow.

**Fix:** Restructured the handler into three sections: universal keys (M, Tab, Escape, Ctrl combos), Page-specific keys (page flip, word selection, define, note), and Focus/Flow-specific keys (seek, WPM).

**Guardrail:** When adding a new reader mode, audit EVERY key handler for mode-specific behavior. Create a keyboard behavior matrix (key × mode → action) and verify each cell is implemented.

---

### [2026-03-22] LL-013: Flow Mode Belongs in Page View, Not a Separate Component

**Area:** architecture, reader
**Status:** resolved
**Priority:** high

**Context:** The original spec described Flow mode as a "scrollable view with word-level highlight." The initial implementation used ScrollReaderView as a completely separate view for Flow mode, which was jarring — the user lost their paginated reading context when entering Flow. User clarification revealed the intent: Flow mode should advance the word highlight within the same paginated Page view, like a karaoke cursor walking through the text.

**Fix:** Integrated Flow mode directly into PageReaderView as a `flowPlaying` prop. When active, a requestAnimationFrame loop advances `highlightedWordIndex` at WPM speed, auto-flipping pages as the highlight crosses page boundaries. This reduced bundle size by ~14KB and provided a smoother experience.

**Guardrail:** When a "mode" is described as running "within" or "from" a parent view, implement it as behavior within that view, not as a separate component. Ask the user to clarify before building separate views.

---

## Persistent Rules and Guardrails (Updated Sprint 21)

| ID | Rule | Source |
|----|------|--------|
| PR-13 | Always include whitespace between per-word spans | LL-010 |
| PR-14 | Pagination boundary: `pageStart = end + 1`, not `end` | LL-011 |
| PR-15 | Keyboard handlers must be structured per-mode, not gated | LL-012 |
| PR-16 | Sub-modes render within parent view, not as separate components | LL-013 |

### [2026-03-24] LL-014: React Effects Cannot Drive Imperative DOM Animation

**Area:** rendering, animation, flow cursor
**Status:** active
**Priority:** high

**Context:** Sprint 24 attempted to build a flow reading cursor (a bar sliding across text lines at WPM speed) using React useEffect + refs + CSS transitions. After 10+ iterations of fixes, the approach proved fundamentally unworkable.

**Root causes:**
1. **Ref-vs-state timing:** React's render cycle runs the component body (updating refs from props) BEFORE effect cleanup runs. Any ref synced from props in the body gets overwritten before cleanup can read the "during animation" value.
2. **Effect dependency cascades:** Callbacks in dependency arrays cause effects to re-run on re-renders, restarting animations. Stabilizing with refs creates a maze of indirection.
3. **State updates during animation:** Any call to setState during a CSS transition triggers a re-render, which can orphan DOM elements the animation is manipulating, restart effects, or overwrite refs.

**Resolution:** Extracted animation into a standalone imperative TypeScript class (`FlowCursorController`) that owns its own DOM element, timers, and state. React only calls `start()` and `stop()` — no effects, no refs, no dependency arrays during playback.

**Rule:** PR-17: Never use React useEffect to drive imperative DOM animations that need continuous state (position, timers). Extract into a plain class and let React only trigger start/stop.

---

### [2026-03-24] LL-015: Forced Reflow for CSS Transition Sequencing

**Area:** animation, CSS
**Status:** active
**Priority:** medium

**Context:** When setting `transition: none` followed by a new `transition: Xms linear` on the same element, the browser may batch both changes and skip the "instant" positioning. Using `requestAnimationFrame` (even double-rAF) added visible delays.

**Resolution:** Reading `element.offsetWidth` between the two style assignments forces the browser to commit the "no transition" position synchronously before starting the new transition. This is the standard technique and eliminates the need for rAF delays.

**Rule:** PR-18: Use forced reflow (read offsetWidth/offsetHeight) between transition:none and new transition, not requestAnimationFrame.

---

| PR-17 | Never drive imperative DOM animations from React useEffect — use a plain class | LL-014 |
| PR-18 | Use forced reflow (offsetWidth) for CSS transition sequencing, not rAF | LL-015 |
| PR-29 | Never put `-webkit-app-region: drag` on body — only on the specific title bar element | LL-026 |

## Known Traps (Updated Sprint 24)

| Trap | Area | Mitigation |
|------|------|------------|
| Node v24 spawn UNKNOWN with Electron | Development | Use `.\node_modules\electron\dist\electron.exe .` directly, or downgrade to Node v22 LTS |
| ARM64 Electron binary on x64 Windows | Development | `npm install electron --arch=x64` to force correct architecture |
| CSS class name mismatch between component and stylesheet | CSS | Grep for the class name in both `.tsx` and `.css` before shipping |
| React state batching breaks effect cleanup→re-run flows | Renderer | Use refs to pass values between effect cleanup and next run |
| Closures in imperative controllers capture stale state | Renderer | Pass `() => ref.current` instead of `() => stateVar` |
| Flow mode rendering all words causes DOM explosion | Reader | Flow cursor must operate on paginated word set, not infinite scroll |
| Pagination first-line off-by-one | Reader | Start `usedHeight` at `lineHeight`, not 0 |
| Paragraph margin ≠ lineHeight in pagination | Reader | Use `fontSize` (1em) for paragraph breaks, not `lineHeight` (1.8em) |
| Small TTS chunk size causes choppy speech | TTS | Use ~40 words with sentence-boundary detection, not 4-word chunks |
| TTS and flow cursor fight over word position | Reader, TTS | When TTS active, disable cursor controller; let TTS drive via onboundary |
| TTS settings disconnected from narration engine | Settings, TTS | Bridge settings state to useNarration via useEffect syncs |
| `-webkit-app-region: drag` on `body` cascades everywhere | CSS, Electron | Never put `drag` on body — apply only to `.library-titlebar`; `no-drag` on buttons is insufficient because intermediate divs with padding still absorb clicks |
| DOM elements created by imperative code orphaned by React | Renderer | Render element in JSX, pass ref to controller; controller styles only |

---

### [2026-03-24] LL-016: React State Batching Breaks Pause/Resume Flows

**Area:** renderer, React state, effects
**Status:** active
**Priority:** high

**Context:** When an effect cleanup sets state (e.g., saving a stop position) and a new effect run immediately reads that state, React's batching means the new value hasn't propagated yet. The effect re-run sees the OLD state value, causing incorrect behavior in pause/resume flows where the stop position must carry forward.

**Fix:** Use a ref (`flowStopPosRef`) to pass values between cleanup and re-run of the same effect. Refs update synchronously and bypass React's batching.

**Rule:** PR-19: Use refs (not state) to pass values between effect cleanup and the next effect run — React batching delays state propagation.

---

### [2026-03-24] LL-017: Closures in Imperative Controllers Capture Stale React State

**Area:** renderer, imperative code, closures
**Status:** active
**Priority:** high

**Context:** When passing callbacks like `getCurrentPageIdx: () => currentPage` to an imperative class, the closure captures the render-time value of `currentPage`. After state updates, the closure still returns the stale value from when it was created, causing the controller to operate on outdated page indices.

**Fix:** Use a ref (`currentPageRef.current = currentPage` updated on every render) and pass `() => currentPageRef.current` instead. The ref always holds the latest value regardless of when the closure executes.

**Rule:** PR-20: When passing state-reading callbacks to imperative code, always read from a ref, never close over state directly.

---

### [2026-03-24] LL-018: Flow Mode Must Stay Paginated, Not Infinite-Scroll

**Area:** reader, flow mode, performance
**Status:** active
**Priority:** high

**Context:** An early approach rendered all words when flow was playing (`flowPlaying ? 0 : page.start`), making the DOM enormous. This caused `buildLineMap()` to find thousands of lines, and the cursor controller raced through content at impossible speed.

**Fix:** Flow cursor operates on the same paginated word set as page mode. The controller handles page turns at end-of-page, keeping the DOM small and the line map manageable.

**Rule:** PR-21: Flow cursor must operate on paginated word sets — never render the full document to DOM for animation purposes.

---

### [2026-03-24] LL-019: Pagination Estimation — Count the First Line

**Area:** renderer, pagination
**Status:** active
**Priority:** medium

**Context:** When tracking `usedHeight` in pixels for pagination, starting at 0 means the first line is never counted toward the height budget. Each page silently gets one extra line of words, causing overflow past the container bottom.

**Fix:** Initialize `usedHeight` at `lineHeight` (the first line exists from the start), not 0.

**Rule:** PR-22: Start pagination height tracking at `lineHeight`, not 0 — the first line occupies space immediately.

---

### [2026-03-24] LL-020: Paragraph Margin Is Not Equal to lineHeight

**Area:** renderer, pagination, CSS
**Status:** active
**Priority:** medium

**Context:** Paragraph breaks in pagination were adding a full `lineHeight` (fontSize x 1.8) to the height budget, but CSS `margin-bottom: 1em` only adds `fontSize`. Counting paragraph breaks as full lines made pages ~30% too conservative — far fewer words per page than the container could hold.

**Fix:** Add `fontSize` for paragraph breaks, not `lineHeight`.

**Rule:** PR-23: Paragraph break height in pagination must match CSS margin (1em = fontSize), not lineHeight.

---

### [2026-03-24] LL-021: TTS Chunk Size Dramatically Affects Speech Quality

**Area:** TTS, narration
**Status:** active
**Priority:** high

**Context:** `SpeechSynthesisUtterance` has per-utterance startup overhead. At 4 words per chunk, the gaps between utterances cause severe choppiness that makes the speech unusable. Increasing chunk size smooths this out dramatically.

**Fix:** Use ~40 words per chunk with sentence-boundary detection. This gives smooth, natural-sounding speech with minimal inter-utterance gaps.

**Rule:** PR-24: TTS chunks should be ~40 words with sentence-boundary splitting — small chunks cause unacceptable choppiness.

---

### [2026-03-24] LL-022: TTS and Flow Cursor Are Independent Systems That Conflict

**Area:** reader, TTS, flow cursor
**Status:** active
**Priority:** high

**Context:** When both TTS and the flow cursor run simultaneously, TTS advances `highlightedWordIndex` via `onboundary` events (triggering page turns), while the cursor controller independently slides through its own line map on potentially a different page. The two systems fight over word position, causing visual chaos.

**Fix:** When TTS is active, disable the cursor controller entirely. Let TTS drive word position via `onboundary` events. The cursor visual follows TTS, not the other way around.

**Rule:** PR-25: TTS and flow cursor cannot both drive word position — when TTS is active, it owns highlighting; cursor controller must be disabled.

---

### [2026-03-24] LL-023: TTS Settings Were Disconnected From Narration Engine

**Area:** settings, TTS, narration
**Status:** active
**Priority:** medium

**Context:** The settings panel wrote `ttsVoiceName` and `ttsRate` to settings state, but `useNarration()` maintained its own independent voice and rate values. Changing TTS voice or rate in settings had no effect on actual speech output.

**Fix:** Added `useEffect` syncs in ReaderContainer to bridge settings state to the narration engine, so changes in the settings panel propagate to active narration.

**Rule:** PR-26: Any settings that control a runtime engine must have explicit sync bridges — settings state and engine state are separate systems.

---

### [2026-03-24] LL-024: `-webkit-app-region: drag` on Body Inherits Into Grid Gaps

**Area:** CSS, Electron, window management
**Status:** active
**Priority:** high

**Context:** Setting `-webkit-app-region: drag` on the body element makes the whole window draggable, but grid gaps between cards inherit this property. Cards themselves work because interactive children get `no-drag`, but the gaps between them swallow click and scroll events — users can't scroll the library by dragging in empty space.

**Fix:** Add `-webkit-app-region: no-drag` to the grid container. This stops the drag region from capturing events in gaps while keeping the intended drag areas (title bar, etc.) functional.

**Rule:** PR-27: Grid containers need explicit `-webkit-app-region: no-drag` to prevent gap areas from inheriting drag behavior.

---

### [2026-03-24] LL-025: DOM Elements Created by Imperative Code Get Orphaned by React

**Area:** renderer, imperative code, React reconciliation
**Status:** active
**Priority:** high

**Context:** When an imperative controller creates a DOM element (e.g., a cursor div) and appends it to a React-managed container, React reconciliation can destroy the element on re-render because React doesn't know about it. The controller then references a detached node, causing silent failures.

**Fix:** Render the element in JSX so React owns its lifecycle. Pass a ref to the imperative controller, and have the controller only style the element (position, opacity, transform) — never create or remove it.

**Rule:** PR-28: Imperative controllers must never create DOM elements in React-managed containers — render in JSX, pass ref, controller styles only.

---

### [2026-03-24] LL-026: Never Put `-webkit-app-region: drag` on `body`

**Area:** CSS, Electron, window management
**Status:** active
**Priority:** critical

**Context:** Applying `-webkit-app-region: drag` to the `body` element makes the entire window a drag region. The obvious countermeasure — adding `no-drag` to `button, input, [role="button"]` — is insufficient because intermediate `div` elements with padding still inherit `drag` from body and absorb clicks in their padding areas. This cascades into dozens of bugs: grid gaps block scrolling, settings buttons have tiny click areas (only the text inside responds, not the button padding), flap toggles don't respond, empty space in lists swallows events, and any element not explicitly marked `no-drag` becomes a dead zone for mouse interaction.

**Root Cause:** `-webkit-app-region` inherits through the entire DOM tree. Opting out individual interactive elements is a whack-a-mole approach that can never be complete — every `div`, `section`, `nav`, `li`, `label`, and layout container with any padding or margin becomes a drag surface that eats mouse events in its non-content areas.

**Fix:** Remove `-webkit-app-region: drag` from `body` entirely. Apply `drag` ONLY to the specific title bar element (e.g., `.library-titlebar`) that should be draggable. If you need drag behavior on a narrow area, use a dedicated wrapper element — never the body or any high-level container.

**Rule:** PR-29: Never apply `-webkit-app-region: drag` to `body` or any high-level container. Apply it only to the specific title bar element. The `no-drag` countermeasure on interactive elements is insufficient because intermediate elements with padding still inherit drag and absorb clicks.

---

## Sprint 25S Stabilization Discoveries

### [2026-03-26] LL-027: Foliate EPUB DOM Is Not Your DOM — Use Overlays

**Area:** EPUB rendering, foliate-js, React integration
**Status:** active
**Priority:** high

**Context:** Three independent bugs (Flow cursor invisible, Focus mode offset, narration highlight stuck) all had the same root cause: trying to manipulate or query DOM elements inside foliate's rendering context. Foliate uses shadow DOM / iframes and re-renders sections on navigation, destroying any injected elements. The `<mark>` injection approach for narration highlights broke on every page turn.

**Root Cause:** Foliate's DOM lifecycle is opaque and uncontrollable from React. Any DOM injection (`surroundContents`, attribute injection, element insertion) is temporary and gets wiped on section changes. `getBoundingClientRect()` on Ranges inside foliate may require coordinate transforms depending on whether the content is in shadow DOM vs iframe.

**Fix:** All EPUB visual feedback (cursors, highlights, word overlays) must use absolutely-positioned overlay divs above the foliate container, positioned via `Range.getBoundingClientRect()` from extracted word Ranges. Never inject into foliate's DOM. Extract a shared `getOverlayPosition(range, containerEl)` utility that handles both shadow DOM (viewport-relative coords, no offset) and iframe (needs `iframe.getBoundingClientRect()` offset) cases.

**Rule:** PR-30: Never inject DOM elements into foliate's rendered content. Use positioned overlay divs above the foliate container. All visual feedback for EPUBs uses the overlay pattern: extract Range → `getBoundingClientRect()` → position overlay div via `translate3d()`.

### [2026-03-26] LL-028: Word Tokenization Must Be Unified Across All Paths

**Area:** Text processing, EPUB word extraction, click handling
**Status:** active
**Priority:** high

**Context:** Word click position mapping in EPUBs was broken because two code paths counted words differently. The word extractor used `Intl.Segmenter` (Unicode-aware, handles contractions and punctuation-attached words correctly), while the click handler's text-node walker used `split(/\s+/)` (loses count on edge cases). A click on "the" in paragraph 5 mapped to "the" in paragraph 1.

**Root Cause:** When multiple code paths need to agree on word positions, they must use identical tokenization. Different splitting strategies produce different counts for the same text, especially with punctuation, contractions ("don't"), hyphenated words, and Unicode.

**Fix:** Extract a shared `segmentWords(text)` utility using `Intl.Segmenter` with `granularity: "word"` and `isWordLike` filtering. Use it in both word extraction and click position mapping.

**Rule:** PR-31: All word-counting and word-splitting code must use the same tokenization function. If two paths produce `(sectionIndex, wordOffset)` tuples, they must agree on what a "word" is. Prefer `Intl.Segmenter` over regex splitting for Unicode correctness.

### [2026-03-26] LL-029: Stale Ranges Are Silent Killers — Guard Every Access

**Area:** DOM, EPUB, Range API
**Status:** active
**Priority:** high

**Context:** Foliate unloads DOM nodes when navigating between sections. Any stored Range objects pointing to those nodes become "detached" — they still exist as JavaScript objects but their `startContainer` and `endContainer` are no longer in the document. Calling `getBoundingClientRect()` on a detached Range returns zeroes. Calling `surroundContents()` throws. These failures are silent (no exceptions for getBoundingClientRect) or inconsistent, making them hard to debug.

**Fix:** Before any Range operation, check `range.startContainer.isConnected`. If false, skip the operation and wait for re-extraction. The word array must preserve word strings even when Ranges are nulled (so Focus mode can still display words as text), and re-populate Ranges when sections are loaded again.

**Rule:** PR-32: Always guard Range access with `range.startContainer.isConnected` before any DOM operation. Treat Ranges as ephemeral cache — the word strings are the source of truth, Ranges are just a rendering convenience that must be re-extracted on section changes.

### [2026-03-26] LL-030: Engagement Gating Prevents Ghost Progress

**Area:** State management, progress tracking, EPUB
**Status:** active
**Priority:** high

**Context:** Opening an EPUB triggers foliate's `onRelocate` event immediately, even before the user has done anything. Because word extraction starts at the first text word (past cover images), the word index is already >0, and `onRelocate` persists this as progress. The book appears "started" just by being opened.

**Root Cause:** Progress save was ungated — any `onRelocate` event wrote to the library. The engagement concept (has the user actually interacted?) was missing from the save path.

**Fix:** Add `hasEngagedRef` that starts false on each doc open (resets on `activeDoc.id` change). Set true only on deliberate engagement: mode start, word click, or manual page turn. `onRelocate` checks `hasEngagedRef.current` before persisting.

**Rule:** PR-33: Always gate progress persistence behind explicit user engagement. Never save progress from automatic navigation events (initial load, auto-page-turn from modes, auto-scroll). The engagement ref must reset per document to prevent carry-over from previous books.

### [2026-03-26] LL-031: Generation ID Pattern for Stale Async Results

**Area:** TTS, async IPC, state management
**Status:** active
**Priority:** medium

**Context:** Kokoro TTS generates audio via IPC calls that take 500ms-2s. If the user changes TTS rate during generation, the result arrives at the old rate and plays — noticeably wrong speed for 1-2 sentences before the next chunk corrects.

**Fix:** Monotonic `generationIdRef` counter. Increment on rate change. Capture before IPC call, compare after. Discard if stale. No `AbortController` needed — the guard is lightweight and works with any async pattern (IPC, fetch, promises).

**Rule:** PR-34: For async operations where input parameters can change mid-flight (rate, position, config), use a generation ID guard. Increment a counter when parameters change; capture before the async call; compare after completion; discard stale results. Cheaper than abort mechanisms and works universally.

### [2026-03-26] LL-032: Foliate Shadow DOM Blocks querySelectorAll

**Area:** DOM, foliate-js, Electron, shadow DOM
**Status:** active
**Priority:** critical

**Context:** After injecting `<span data-word-index>` into foliate's EPUB sections, attempts to find those spans via `document.querySelector(".foliate-page-view").querySelectorAll("iframe")` returned 0 results. The iframes exist but are inside `<foliate-view>`'s shadow DOM, which blocks traversal from the light DOM.

**Root Cause:** Custom elements with shadow DOM encapsulate their internal structure. `querySelectorAll` on a parent element cannot see into shadow children. The iframes holding EPUB section documents are invisible to the parent document's DOM queries.

**Fix:** Use `view.renderer.getContents()` — foliate's internal API that provides direct access to the section document objects (`{ doc, index }` pairs). This bypasses the shadow DOM entirely. Applied to narration highlight (`highlightWordByIndex` API method) and Flow cursor positioning.

**Rule:** PR-35: Never query foliate's internal iframes via `querySelectorAll("iframe")`. Always use `view.renderer.getContents()` which provides direct `{ doc, index }` pairs. This applies to ALL DOM operations that need to reach inside EPUB section documents — word highlighting, click handling, span injection, style injection.

### [2026-03-26] LL-033: adjustRate Before startCursorDriven, Never After

**Area:** TTS, Kokoro, async IPC, state management
**Status:** active
**Priority:** high

**Context:** Kokoro narration silently failed — audio generated successfully but was discarded. The `startCursorDriven` function fires `speakNextChunk()` which sends an IPC call to Kokoro. Immediately after, `adjustRate(settings.ttsRate)` was called, which increments `generationIdRef`. By the time the Kokoro audio returned (~1-2s later), the generation ID no longer matched, so the result was discarded as "stale."

**Fix:** Move `adjustRate()` BEFORE `startCursorDriven()`. The rate is set first, then the IPC call uses the correct rate with a stable generation ID.

**Rule:** PR-36: Any call that increments `generationIdRef` (adjustRate, updateWpm) must happen BEFORE `startCursorDriven` or `speakNextChunk`, never after. The generation ID must be stable during the entire IPC round-trip.

### [2026-03-26] LL-034: TTS Chunks Must Be One Sentence for Natural Pauses

**Area:** TTS, Kokoro, audio UX
**Status:** active
**Priority:** high

**Context:** Rhythm pauses (sentence: 800ms, paragraph: 1500ms, clause: 500ms) only fire BETWEEN Kokoro audio chunks, not within them. With 40-word chunks containing 2-3 sentences, the listener heard continuous speech with no breaks between sentences, making it difficult to follow.

**Root Cause:** Kokoro generates one continuous audio buffer per chunk. There's no way to insert silence into the middle of a generated buffer. Pauses can only exist between buffers.

**Fix:** Changed `findSentenceBoundary` to scan from the first word (not word 5), producing one sentence per chunk. Each chunk ends at a sentence boundary (`.!?`). The pre-buffer generates the next sentence during the pause, keeping playback smooth. Trade-off: more IPC calls (one per sentence vs one per 40 words), but Kokoro generation is fast enough (~100-300ms per sentence) that pre-buffering covers the gap.

**Tuned pause values (TTS-specific):**
- Commas, colons, semicolons: **250ms**
- Sentence endings (. ! ?): **400ms**
- Paragraph breaks: **750ms**

These are significantly shorter than Focus mode's visual pauses (1000/1500/2000ms) because Kokoro's neural prosody already adds natural micro-pauses within the audio. The between-chunk gaps only need to fill the transition, not the full rhythm.

**Rule:** PR-37: Kokoro TTS chunks must end at sentence boundaries. Pause values from constants.ts (TTS_PAUSE_COMMA_MS=250, TTS_PAUSE_SENTENCE_MS=400, TTS_PAUSE_PARAGRAPH_MS=750). The `hasPreBuffer` guard is critical — if next chunk isn't ready, generation time IS the pause. If pre-buffer IS ready, add the delay. Never add rhythm pauses AND generation wait — "double pause" anti-pattern. Also: `Intl.Segmenter` strips punctuation from words — must append trailing punctuation in extractWordsFromView for sentence boundary detection.

### [2026-03-26] LL-035: EPUB Page Auto-Advance During Narration — SOLVED

**Area:** foliate-js, CSS columns, TTS narration, page navigation, React Strict Mode
**Status:** resolved
**Priority:** high

**Context:** During Kokoro TTS narration on EPUBs, the page needs to auto-advance when the narrated word moves past visible content. This took 6 failed approaches and 8 commits to solve. The problem was NOT visibility detection — it was 5 stacked root causes creating a feedback loop.

**Root causes (all 5 had to be fixed):**

1. **Stale `readingMode` closure in `onRelocate`** — The `onRelocate` callback was captured at render time with `readingMode = "page"`. During narration, every foliate `relocate` event called `setHighlightedWordIndex(approxFraction * totalWords)`, overwriting the narration's precise word index with an approximate value. This caused the highlight to jump to wrong words.
   - **Fix:** Use `readingModeRef.current` (always current) instead of the closure-captured `readingMode`.

2. **Word array rebuilds during active narration** — Foliate pre-loads adjacent sections. Each section load triggered `extractFoliateWords()` which rebuilt the entire word array and renumbered all `data-word-index` DOM attributes. The narration engine was using indices from before the rebuild.
   - **Fix:** Skip `extractFoliateWords()` during narration/flow modes (uses `readingModeRef.current`).

3. **Fraction-based page advance with mismatched denominators** — A `useEffect` watched `narrationWordIndex` and called `renderer.next()` when `narrationWordIndex / totalBookWords > viewFraction + threshold`. But `narrationWordIndex` was relative to extracted words (visible sections only), not the full book. This produced wildly wrong fractions.
   - **Fix:** Removed entirely. Page advance handled by `scrollToAnchor` instead.

4. **React Strict Mode double-mounting foliate view** — React 19 mounts, unmounts, remounts components in dev mode. Each mount called `loadBook()` → `view.goTo(initialCfi)`, creating two competing foliate views that fought over page position.
   - **Fix:** Guard at effect start: if `viewRef.current` already exists, skip `loadBook()`.

5. **Double audio stream from double `startNarration`** — Same Strict Mode issue. `startNarration()` called twice, each starting Kokoro generation. First IPC result played alongside the second.
   - **Fix:** Call `narration.stop()` explicitly before `stopAllModes()` in `startNarration`.

**Working solution for page advance:**
`view.renderer.scrollToAnchor(range)` — Readest's approach. On each `highlightWordByIndex` call, create a Range around the highlighted `<span>`, pass it to foliate's `scrollToAnchor`. This is a **no-op when the word is already visible** (foliate checks internally). It only scrolls when the word is in a different CSS column. Foliate handles all the column math, scroll position, and RTL/vertical mode transforms internally.

**Approaches that FAILED (for reference):**
1. `d.defaultView.innerWidth` — iframe reports full column layout width (7200px), not visible width
2. Host container `clientWidth` + iframe rect transform — mismatched coordinate spaces, constant jumping
3. `querySelectorAll("iframe")` — returns 0 due to shadow DOM barrier
4. Span-not-found detection — all words have DOM spans even when off-screen (CSS columns)
5. `renderer.next()` rapid-fire — cascades without debounce
6. Fraction-based comparison — wrong denominators (extracted words vs total book words)
7. `getBoundingClientRect` inside iframe — coordinates relative to full column layout, not viewport
8. Parent-space rect transform — still mismatched when columns scroll

**Key insight:** The page jumping was never a visibility detection problem. It was a state management problem — 5 independent bugs creating feedback loops. Once all 5 were fixed, the simplest possible approach (`scrollToAnchor` on every word) worked perfectly.

**Rule:** PR-38: When integrating imperative libraries (foliate-js) with React:
- ALL callback props that read React state must use refs, not closure values
- Never rebuild DOM state (word arrays, attributes) during active modes
- Guard useEffects against React Strict Mode double-invocation with ref checks
- Use the library's own scroll/navigation APIs instead of manual coordinate math
- Fix ALL root causes before re-attempting the feature — stacked bugs create deceptive symptoms

**Rule:** PR-38: EPUB narration page auto-advance requires knowing which CSS column is visible. Simple DOM queries cannot determine this.

---

### [2026-03-27] LL-036: Mode Instance Wiring — Timer Ownership and FlowCursorController Granularity Mismatch

**Area:** architecture, reading modes, React hooks
**Status:** active
**Priority:** medium

**Context:** Sprint TD-2 wired the four mode classes (PageMode, FocusMode, FlowMode, NarrateMode) into the app via `useReadingModeInstance`. Key architectural decisions emerged from attempting to replace inline timer logic with mode instance calls.

**Discoveries:**

1. **FocusMode can replace useReader's rAF timer.** FocusMode's setTimeout chain drives word advancement; its `onWordAdvance` callback calls `reader.jumpToWord(idx)` to sync useReader's `wordIndex` for ReaderView display. `reader.togglePlay()` is no longer called — FocusMode is the sole timer. `playing` prop to ReaderView is derived from `readingMode === "focus"` instead of useReader's internal flag.

2. **FlowCursorController and FlowMode have incompatible granularities.** FlowMode advances word-by-word with setTimeout. FlowCursorController slides a CSS-animated cursor across visual lines — one transition per line, not per word. The smooth line-slide animation is a core UX feature. Replacing FlowCursorController with word-by-word updates would regress the visual experience. **Resolution:** Non-EPUB Flow delegates to FlowCursorController via `flowPlaying` state. EPUB Flow uses FlowMode's timer + CSS class underline on word spans.

3. **Words must be passed at start time, not as hook params.** EPUB words come from `extractFoliateWords()` called just before mode start. React state hasn't re-rendered yet, so hook params would be stale. `startMode(wordIdx, words, paragraphBreaks)` accepts words directly.

4. **Section-load retry pattern must be applied to ALL EPUB modes, not just Narration.** Focus and Flow on EPUBs can start on cover pages with zero extractable words. The same `renderer.next()` → wait → retry pattern from `startNarration` must be duplicated in `startFocus` and `startFlow`.

**Rule:** PR-39: When bridging imperative class instances to React state: hold the instance in a `useRef` (not `useState` — instances are mutable); use stable callback refs for all callbacks the instance receives; and pass dynamic data (words, config) at call time, not at hook initialization.

---

### [2026-03-27] LL-037: Foliate Dynamic DOM vs. Static-Array Mode Classes

**Area:** foliate, reading modes, architecture
**Status:** active
**Priority:** high

**Context:** TD-2's mode class refactor broke Flow, Narration, and Focus resume on foliate-rendered EPUBs. Mode classes (FocusMode, FlowMode, NarrateMode) operate on a static word array with simple index-based timers. Foliate loads EPUB sections dynamically — words are extracted from the DOM, and when the reader advances past the loaded section, word spans don't exist yet.

**Root Causes:**

1. **`highlightWordByIndex` had a side effect** — when a word span wasn't found, it called `view.renderer.next()` (page turn) AND returned false. Any bridge code that also turned the page on miss would cause double page-turns.

2. **Stale closure in Focus resume** — `startFocus` captured `highlightedWordIndex` (React state) in its useCallback closure. When `handlePauseToPage` set the state and the user immediately resumed, the closure still held the old value (0). Fix: `useRef` that's written synchronously in both `handlePauseToPage` and `handleExitReader`.

3. **Global index into section-relative array** — `startNarration` used `highlightedWordIndex` (a global document position) as an index into `effectiveWords` (words from the current loaded section). On section boundaries, the index exceeded the array length. Fix: same ref-based approach.

4. **Silent failure on miss** — Flow and Narration `onWordAdvance` callbacks called `highlightWordByIndex` but ignored the false return. The highlight silently disappeared at section boundaries.

**Solution (HOTFIX-2B):**

- Made `highlightWordByIndex` pure — returns boolean, no page-turn side effect
- Added `highlightedWordIndexRef` — always-current ref replaces state in all start functions
- Pause-on-miss bridge for Flow: pause mode on highlight miss → turn page → `onWordsReextracted` resumes after DOM settles
- Page-turn-on-miss bridge for Narration: TTS keeps speaking (no pause — avoids audible stutter), page turns to load new sections, `onWordsReextracted` re-applies highlight
- Symbol-guarded `setTimeout` in `startFocus` prevents orphan timers during rapid mode switches

**Rules:**
- PR-40: Functions that query the DOM (highlight, scroll, find) must be pure — return success/failure, never trigger navigation side effects. Let the caller decide what to do on failure.
- PR-41: When React state is read inside `useCallback` closures that survive across async gaps (setTimeout, rAF, event handlers), always use a `useRef` mirror. Write the ref synchronously at the mutation site. Never add the state variable back to the dependency array — that reintroduces the stale closure.
- PR-42: When bridging static-array mode classes to a dynamic-DOM renderer (foliate), the bridge must handle miss detection (word not in DOM), navigation (page turn to load new content), and resume (re-highlight after DOM updates). Mode classes must stay dumb — no DOM awareness.

### [2026-03-27] LL-038: Constants Extraction Coverage — TD-1 Was Not Complete

**Area:** code quality, constants, architecture
**Status:** resolved
**Priority:** medium

**Context:** TD-1 created `src/constants.ts` and `main/constants.js` and extracted many hardcoded values. Sprint 23 audit found 33 additional hardcoded constants across 16 source files that TD-1 missed — cloud provider chunk sizes, auth window dimensions, retry delays, UI timing values, watcher stability thresholds, and more.

**Root Cause:** TD-1 focused on the most obvious constants (WPM, timing, TTS) but didn't systematically grep every source file for numeric literals. Constants that "looked like implementation details" (chunk sizes, retry delays, window dimensions) were left inline.

**Rules:**
- PR-43: When extracting constants, grep every source file for numeric literals > 1 and string literals that configure behavior. Don't rely on "obvious" extraction — the non-obvious ones (retry delays, chunk sizes, cache limits) are just as important to centralize.
- PR-44: After any constants extraction pass, a second audit pass should verify completeness. First pass typically catches 60-70% of scattered constants.

### [2026-03-27] LL-039: Sprint 15 A11y Pass Didn't Cover Post-Sprint-15 Components

**Area:** accessibility, process
**Status:** resolved
**Priority:** medium

**Context:** Sprint 23 audited 12 components added after Sprint 15's WCAG 2.1 AA pass. 7 of 12 were already compliant (developers followed Sprint 15 patterns), but 5 needed fixes: missing combobox role, missing slider valuetext, missing ARIA on button groups, and a non-keyboard-accessible link.

**Rules:**
- PR-45: Every new overlay/dialog component must include `role="dialog"`, `aria-modal="true"`, `aria-label`, `useFocusTrap`, and Escape-to-close. These are table stakes, not optional enhancements.
- PR-46: Every range input (slider) needs `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` with human-readable text (e.g., "300 words per minute" not just "300").

### [2026-03-27] LL-040: Test Coverage on Glue Code Prevents Repeated Breakage

**Area:** testing, architecture, process
**Status:** active
**Priority:** high

**Context:** The reading mode system broke 3 times in 3 sprints (TD-2, HOTFIX-2, HOTFIX-2B). Mode classes themselves had 420 lines of tests and never broke. All breakages occurred in the untested bridge layer — `useReadingModeInstance` (callback wiring, pause-on-miss) and `useReaderMode` (ref sync, stale closures, Symbol guards). Every failure shipped with all tests green because the tests covered the wrong layer.

**Root Cause:** Mode classes are pure, testable objects. The bridge hooks that wire them to React state and foliate's dynamic DOM were treated as "just glue" and left untested. But glue code is where integration bugs live — stale closures, double page turns, orphan timers, wrong callback targets.

**Solution (Sprint MH):** 44 new tests across 4 files targeting specifically the code that kept breaking:
- `useReadingModeInstance.test.ts` (15 tests) — callback wiring, pause-on-miss bridge, pendingResumeRef
- `useReaderMode.test.ts` (14 tests) — ref sync, Symbol guard, mode memory, WPM cap
- `foliate-bridge.test.ts` (9 tests) — MockFoliateAPI integration, section boundary crossing, multi-page recovery
- `modes.test.ts` (+6 tests) — updateWords contract across all mode classes

Plus defensive guards: bounds checks in scheduleNext, Object.freeze on callbacks, debug logging on highlight miss.

**Rules:**
- PR-47: When a subsystem breaks repeatedly, add tests to the *integration layer* (hooks, bridges, wiring), not just the isolated units. The units are probably fine — the breakage is in how they connect.
- PR-48: `updateWords` is now a required method on ModeInterface (not optional). All modes must implement it. This prevents future refactors from silently dropping dynamic word support.
- PR-49: `Object.freeze(config.callbacks)` after mode creation prevents accidental callback mutation. If a future developer tries to overwrite a callback after mode instantiation, they'll get a TypeError instead of a silent bug.
- PR-50: Bounds guards in `scheduleNext` should clamp (not throw). A negative word index clamps to 0. The timer chain must never crash — silent degradation beats a white screen.

### [2026-03-27] LL-041: Legacy useEffect Chains vs. Mode Instance Callbacks — Pick One

**Area:** architecture, rendering, modes
**Status:** resolved
**Priority:** critical

**Context:** After HOTFIX-2B added `onWordAdvance` callbacks in `useReadingModeInstance` to drive word highlighting via the bridge pattern, the original `useEffect` chains in ReaderContainer.tsx were left in place as "safety nets." Both systems drove `highlightedWordIndex` and called `highlightWordByIndex`, creating a circular cascade: mode fires onWordAdvance → sets state → useEffect fires → calls highlightWordByIndex → triggers re-render → state changes → loop. Result: React "Maximum update depth exceeded" error, Narration completely blocked, Flow console-spamming.

**Root Cause:** Two independent word-driving systems running simultaneously. The legacy `useEffect` watching `highlightedWordIndex` (L570-576) duplicated what the bridge's `onWordAdvance` callback already did. The legacy `setInterval` for Flow (L579-596) duplicated what `FlowMode.scheduleNext()` already did. Neither system was aware of the other.

**Solution (Sprint Mode Verticals):** Deleted both legacy `useEffect` blocks entirely. The HOTFIX-2B bridge (`useReadingModeInstance`) is the sole owner of word advancement and highlighting. No legacy fallback, no dual paths.

**Rules:**
- PR-51: When a new system replaces a legacy system, DELETE the legacy code in the same PR. Leaving it as a "safety net" creates dual-driver bugs that are worse than having no fallback.
- PR-52: There must be exactly ONE system driving word position for each mode. If two code paths can both call `setHighlightedWordIndex`, one of them is wrong. Audit for dual drivers after any refactor that adds a new highlighting path.
- PR-53: `useEffect` chains that watch derived state and call imperative APIs are an anti-pattern for real-time word advancement. The correct pattern is: mode class timer → onWordAdvance callback → imperative highlight call. Effects watching state for highlighting create circular cascades.

### [2026-03-28] LL-042: handleSelectMode Must Start Modes, Not Just Select

**Area:** UX, modes, keyboard
**Status:** resolved
**Priority:** high

**Context:** Mode Verticals refactor changed mode buttons (Focus, Flow, Narrate) to use `handleSelectMode` which only updated `lastReadingMode` in settings. Starting the mode required a separate Space key press. Users clicking "Narrate" expected narration to start immediately but got silence — `startNarration()` was never called.

**Solution:** Changed `handleSelectMode` to both select AND start the mode. If already in the mode, clicking toggles it off. Each `startFocus`/`startNarration`/`startFlow` handles `stopAllModes` internally, so the transition is clean.

**Rules:**
- PR-54: Mode buttons must start the mode on click. Two-step "select then activate" UX is confusing. If a button says "Start narration," clicking it must start narration.

### [2026-03-28] LL-043: useEffect Cleanup Races with Shared Hook State (NarrateMode.destroy)

**Area:** architecture, React lifecycle, narration, race conditions
**Status:** resolved
**Priority:** critical

**Context:** Clicking Narrate started the pipeline correctly — Kokoro generated audio (165k samples, ~7 seconds) — but by the time the IPC result returned (~200ms), `stateRef.current.status` had reverted to `"idle"` and the audio was discarded. No audio, no cursor movement, no error.

**Root Cause:** Classic React effect cleanup race. When `startNarration` sets `readingMode` from "page" to "narration", React re-renders. During re-render, `useReadingModeInstance`'s `useEffect` cleanup fires, destroying the OLD mode instance. `NarrateMode.destroy()` called `this.narration.stop()` on the SHARED narration hook, dispatching STOP. This triggered a second re-render where `stateRef.current = state` (line 61 of useNarration) overwrote the manually-set `"speaking"` status with `"idle"` from the reducer. When the Kokoro IPC returned, it found status = "idle" and discarded valid audio.

**Sequence:**
1. Event handler: dispatch START_CURSOR_DRIVEN, manually set stateRef.status = "speaking"
2. Async Kokoro IPC starts (~200ms)
3. React re-render #1: reducer state = "speaking", stateRef = "speaking" ✓
4. useEffect cleanup fires: old NarrateMode.destroy() → narration.stop() → dispatch STOP
5. React re-render #2: reducer state = "idle", stateRef = "idle" ✗
6. Kokoro IPC returns → status = "idle" → audio discarded

**Solution:** Removed `this.narration.stop()` from `NarrateMode.destroy()`. The shared narration object is already stopped by `stopAllModes()` in `startNarration` before the new mode starts. The redundant stop in `destroy()` was the only code racing with the new mode's startup.

**Rules:**
- PR-55: Mode class `destroy()` must NOT call stop on shared hooks/singletons. The effect cleanup fires AFTER the new instance has started. Use `stopAllModes()` in the start sequence instead.
- PR-56: When `stateRef.current = state` mirrors reducer state into a ref on every render, any dispatch between "manual ref set" and "IPC return" can corrupt the ref. Audit all async flows in hooks that use this pattern.
- PR-57: Add permanent `console.debug` instrumentation to async TTS pipelines. These race conditions are invisible without telemetry — no errors, no warnings, just silent drops.

### [2026-03-28] LL-044: Kokoro inFlight Guard Blocks Re-dispatch After Speed Change

**Area:** narration, TTS, speed control
**Status:** resolved
**Priority:** medium

**Context:** Changing narration speed (arrow up/down) during playback caused narration to stall permanently. Audio stopped, cursor froze, no error.

**Root Cause:** Speed change increments `generationId` and triggers `speakNextChunk`. The current Kokoro IPC returns with a stale `genId`, triggering `onStaleGeneration()` which calls `speakNextChunk`. But `inFlight` was still `true` (the `finally` block hadn't executed yet), so the re-dispatch hit the guard `if (deps.getInFlight()) return` and silently dropped. The `finally` block then cleared `inFlight` — but nobody called `speakNextChunk` again.

**Solution:** Call `deps.setInFlight(false)` BEFORE `deps.onStaleGeneration()` in the stale genId branch. The `finally` block still runs (harmless double-clear).

**Rules:**
- PR-58: When an async guard (`inFlight`) protects a resource, any code path that re-dispatches within the same async context must clear the guard first. The `finally` block runs too late for synchronous re-dispatch.

### [2026-03-28] LL-045: Module-Scope `window.electronAPI` Capture Races with Async Stub Injection

**Area:** test harness, module evaluation, Vite
**Status:** resolved
**Priority:** high

**Context:** Sprint CT-1 built a browser-based test harness that injects a stub `window.electronAPI` before React mounts. The stub was installed via `await import("./test-harness/stub-loader")` in `main.tsx`'s async `boot()` function, which ran before `ReactDOM.createRoot`. But the app crashed with `Cannot read properties of undefined (reading 'getSiteLogins')`.

**Root Cause:** `LibraryContainer.tsx` (and other components) capture `window.electronAPI` at **module scope**: `const api = window.electronAPI` (line 23). Vite evaluates the entire static import tree when it processes `main.tsx` — so `import App from "./App"` at the top of `main.tsx` causes every component module to evaluate BEFORE `boot()` runs. The module-scope `const api` captured `undefined` because the stub hadn't been installed yet.

**Solution:** Changed `import App from "./App"` (static, top-level) to `const { default: App } = await import("./App")` (dynamic, inside `boot()` after stub installation). This defers the entire component tree's module evaluation until after the stub is on `window`.

**Rules:**
- PR-59: Any module that captures `window.*` at module scope (outside a function) will evaluate at import-graph resolution time, NOT at the point where it's "used." Static imports are eagerly evaluated by bundlers.
- PR-60: When injecting globals that must exist before component modules evaluate, use dynamic `import()` for the app entry point. Static imports at the top of the entry file defeat async initialization sequences.

---

### PR-61: Electron asar/unpacked boundary breaks Node.js module resolution

**Date:** 2026-03-28 | **Severity:** Critical | **Category:** Distribution/Packaging

**Problem:** Kokoro TTS model download worked in dev mode but stalled silently at 0% in the packaged .exe. No error was shown to the user — the download appeared to hang forever.

**Root cause:** Three layered module resolution failures when a worker thread inside `app.asar` tries to `require()` modules from `app.asar.unpacked`:

1. **ESM exports map** — `kokoro-js` and `@huggingface/transformers` are `"type": "module"` packages with no `"main"` field. They define entry points via the `"exports"` map. Node's `require()` across the asar/unpacked boundary cannot resolve this map. Fix: require the explicit CJS paths (`kokoro-js/dist/kokoro.cjs`, `@huggingface/transformers/dist/transformers.node.cjs`).

2. **Peer dependency isolation** — `onnxruntime-node` (in asarUnpack) requires `onnxruntime-common`, which was in the asar but not unpacked. Unpacked modules can't resolve deps from inside the asar. Fix: add `onnxruntime-common` to `asarUnpack`.

3. **Optional dependency hard-requires** — CJS bundles of transformers do `require('sharp')` at module load time (not behind try/catch). Sharp is truly optional (image processing, not needed for TTS). Fix: monkey-patch `Module._resolveFilename` to stub `MODULE_NOT_FOUND` with an empty module.

4. **Required dependency misclassified as optional** — `phonemizer` is a *required* dependency of kokoro-js (text→phonemes before synthesis), but it's also an ESM-first package that can't be resolved by bare `require()` across the asar boundary. The initial catch-all `MODULE_NOT_FOUND` → stub approach masked this, causing `a.phonemize is not a function` at inference time. Fix: explicitly redirect `require("phonemizer")` to `phonemizer/dist/phonemizer.cjs` in the `Module._resolveFilename` hook, and add `phonemizer` to `asarUnpack`.

**Why this was hard to find:** The original hypothesis (CSP `connect-src 'self'` blocking fetch) was plausible because dev mode strips CSP entirely. But worker threads use Node.js networking, not Chromium's — CSP never applied. The real error was swallowed because the worker's `load-error` wasn't forwarded to the renderer (fixed in HOTFIX-2), so the UI just showed 0% forever. The phonemizer issue was doubly hidden: model loading succeeded (28 voices), but inference failed — and the warm-up catch block silently swallowed the error.

**Rules:**
- PR-61a: When unpacking ESM-first packages (`"type": "module"`) for use in Electron worker threads, always require the explicit `.cjs` entry point by full path. Never rely on bare `require("package-name")` across asar boundaries.
- PR-61b: If a package in `asarUnpack` has peer dependencies, those peers must ALSO be in `asarUnpack`. Unpacked modules cannot resolve deps from inside the asar.
- PR-61c: **Do NOT use a catch-all `MODULE_NOT_FOUND` → stub approach.** Distinguish required deps (redirect to CJS path) from truly optional deps (stub). A catch-all masks real failures — phonemizer was silently stubbed, causing inference to fail with a cryptic `a.phonemize is not a function`.
- PR-61d: Always forward worker thread errors to the renderer. Silent failures in background workers are invisible to users and extremely hard to debug.
- PR-61e: Never silently swallow errors in warm-up/init code. A `catch {}` (empty) hides the exact error that would identify the root cause. Always log, even if the error is "non-fatal".

---

### [2026-03-28] LL-046: Dual-Write Rule for useReducer + stateRef in Async Callbacks

**Area:** narration, React state, async patterns
**Status:** active
**Priority:** critical

**Context:** Sprint TTS-1 found that narration playback had jumpy pauses, stale audio after speed changes, and inconsistent rhythm timing. All 8 "MUST FIX" items traced to one root cause: React's `useReducer` dispatch is async (batched), but `stateRef.current` (used by TTS callbacks firing between renders) must reflect the latest state immediately.

**Root Cause:** `pause()`, `resume()`, `stop()`, `updateWpm()`, `adjustRate()`, `resyncToCursor()`, and `CHUNK_COMPLETE` handlers dispatched reducer actions but did NOT update `stateRef.current`. Async callbacks (audio `onEnd`, pre-buffer completion, Kokoro IPC results) read `stateRef.current` before React could commit the dispatch. They saw stale `status`, `cursorWordIndex`, and `speed` values.

Additionally, `preBufferRef.current` (the authoritative pre-buffer, bypassing React render cycle) was not cleared during speed changes, rate adjustments, resync, or stop. Stale audio at the wrong speed/position would play on the next chunk.

**Solution:** Established the **dual-write rule**: every `dispatch()` that changes `status`, `cursorWordIndex`, `speed`, or `nextChunkBuffer` must ALSO:
1. Update `stateRef.current = { ...stateRef.current, [changed fields] }` on the same line
2. Clear `preBufferRef.current = null` if the change invalidates buffered audio (speed/rate/position changes)
3. Dispatch `CLEAR_PRE_BUFFER` to keep the reducer's `nextChunkBuffer` in sync

**Rules:**
- PR-62: **Dual-write rule.** Every dispatch in useNarration that mutates `status`, `cursorWordIndex`, `speed`, or `nextChunkBuffer` must also update `stateRef.current` immediately. The dispatch updates React; the stateRef update is for async callbacks that fire before the next render.
- PR-63: **preBufferRef is authoritative.** The reducer's `nextChunkBuffer` is kept for React consumers (UI indicators). The ref is what TTS strategies read. Both must be cleared together when speed, position, or generation changes.
- PR-64: **computeChunkPauseMs must read preBufferRef, not reducer state.** Rhythm pauses should only fire when the pre-buffer is actually ready (ref), not when the reducer last recorded a buffer (may be stale).

---

### [2026-03-29] LL-047: Rolling Audio Queue Replaces Pre-Buffer Bolt-On

**Area:** TTS architecture, audio pipeline
**Status:** active
**Priority:** high

**Context:** The v1.0.9 Kokoro narration pipeline used a generate-one, play-one, pre-buffer-next-one approach. This caused `pre-buffer MISS (no buffer)` on every chunk because short first chunks (~7 words / 4.2s playback) didn't give Kokoro enough generation time (~3-8s). The cascade of on-demand generation created silence gaps between every chunk.

**Fix:** Replaced with a producer-consumer rolling audio queue (`src/utils/audioQueue.ts`). The producer continuously generates into a 3-chunk buffer (`TTS_QUEUE_DEPTH`). The consumer plays from the queue head and inserts manual silence pauses at chunk boundaries. Playback starts when the first chunk is ready. By the time it finishes, subsequent chunks are already buffered.

**Guardrail:** TTS audio pipeline should always use the producer-consumer queue pattern. The old pre-buffer approach (single look-ahead chunk) is insufficient when generation time exceeds playback time. The rolling queue decouples production from consumption entirely.

**Supersedes:** PR-62 (dual-write for nextChunkBuffer), PR-63 (preBufferRef authoritative), PR-64 (computeChunkPauseMs reads preBufferRef). These rules no longer apply — the pre-buffer, preBufferRef, and nextChunkBuffer state have been removed. The audioQueue owns all buffering internally.

---

### [2026-03-29] LL-048: Smart Pause Heuristics — Abbreviation + Dialogue Detection

**Area:** TTS, text analysis
**Status:** active
**Priority:** moderate

**Context:** The naive regex `/[.!?]["'»)\]]*$/` for sentence-end detection triggered false pauses on abbreviations (Dr., Mr., etc.), acronyms (J.P., N.A.S.A., U.S.A.), and short dialogue paragraphs got full paragraph pauses that broke conversational flow.

**Fix:** New `src/utils/pauseDetection.ts` module with a multi-step pipeline:
1. Internal-period check (`/\.\w/`) catches all dotted acronyms
2. Known abbreviation set (22 entries) catches common titles and Latin abbreviations
3. Next-word-lowercase check catches remaining cases (e.g., `end. but`)
4. `!` and `?` always trigger sentence pause (no false-positive risk)
5. Sentence-count heuristic for paragraph breaks: ≤2 sentences = dialogue (0ms pause), >2 = exposition (800ms)

**Guardrail:** When detecting sentence boundaries in TTS context, always use `isSentenceEnd()` from pauseDetection.ts. Never rely on a simple period-end regex alone.

---

### [2026-03-29] LL-049: Dialogue Sentence-Count Threshold

**Area:** TTS, UX
**Status:** active
**Priority:** moderate

**Context:** In narration of dialogue-heavy fiction, paragraph breaks between short exchanges (e.g., `"Danny said, '...'"` / `"Debbie replied, '...'"`) got full paragraph pauses that broke conversational flow. The sentence-count heuristic (≤2 sentences = dialogue, >2 = exposition) naturally distinguishes dialogue from expository paragraphs without parsing quote marks or speech tags.

**Guardrail:** The threshold is stored as `TTS_DIALOGUE_SENTENCE_THRESHOLD = 2` in constants.ts. If users report dialogue pauses feeling wrong, this is the constant to tune.

---

### [2026-03-29] LL-050: nsis-web + oneClick + Split CI = Correct Installer Behavior

**Area:** distribution, CI/CD, packaging
**Status:** active
**Priority:** high

**Context:** v1.0.9 shipped a 235MB fat NSIS installer. Three problems: (1) ARM64 installer shipped x64-only ONNX native binaries because CI ran `npm ci` on an x64 runner. (2) Full app payload bundled inside the `.exe`. (3) Updates popped an external NSIS wizard window.

**Fix:** Three coordinated changes:
1. **`nsis-web` target:** Creates a ~1MB stub installer that downloads the 234MB `.7z` payload from GitHub Releases on first install. Delta updates via blockmap still work.
2. **`oneClick: true`:** Enables silent background installs during auto-update — no wizard window. `quitAndInstall(true, true)` for silent + forceRunAfter.
3. **Split CI jobs:** Each architecture (x64, arm64) gets its own CI job running `npm ci` with the correct `npm_config_arch`, ensuring native binaries (onnxruntime-node) match the target platform.

**Guardrail:**
- PR-65: **Never revert to plain `nsis` target.** The `nsis-web` target is required for stub installer + silent updates.
- PR-66: **Never set `oneClick: false`.** This breaks silent auto-updates and shows the NSIS wizard to users.
- PR-67: **Each architecture must have its own CI job.** Cross-compiling JS works, but native `.node` binaries must be resolved by `npm ci` on the target arch. A single-job approach with `--x64 --arm64` produces wrong native modules for one arch.
