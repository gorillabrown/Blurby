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
**Status:** SUPERSEDED by LL-063 — project no longer uses OneDrive for development
**Priority:** low (historical)

**Context:** Cowork's Linux VM cannot read files from OneDrive-synced folders when files are "cloud-only" (not downloaded locally). All standard file operations (cat, python open, Read tool) fail with "Invalid argument" (EINVAL).

**Root Cause:** OneDrive's on-demand sync keeps files as placeholders until accessed from Windows. The FUSE mount in the VM cannot trigger the download.

**Guardrail:** No longer applicable. Working directory moved to `C:\Users\estra\Projects\Blurby` (local, not cloud-synced) per LL-063. Cowork accesses files via the mounted local directory.

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

### [2026-03-21] LL-005: Workflow Reversal — Local-First, Git to Sync

**Area:** infrastructure, workflow
**Status:** SUPERSEDED by LL-063 — further revised to local-first + git push/pull
**Priority:** low (historical)

**Context:** Previously, Claude Code worked in its own context and pushed directly to GitHub. The user then pulled to OneDrive. This was reversed to OneDrive-first, but OneDrive + git proved incompatible (LL-063). Now fully local-first.

**Decision (current):** Working directory at `C:\Users\estra\Projects\Blurby` (local, not cloud-synced). Git push/pull to GitHub syncs between machines. Push after every sprint, pull before every session.

**Guardrail:** `C:\Users\estra\Projects\Blurby` is the source of truth on each machine. GitHub is the sync hub. See `docs/governance/DEVELOPMENT_SYNC.md` for full SOP.

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
| Cloud-synced working directory | Git / File I/O | Never develop in OneDrive/GDrive/Dropbox (LL-063). Local dir only. |
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
**Status:** SUPERSEDED by LL-067 — FLOW-3A reverses this decision for infinite scroll
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
| TTS stateRef/dispatch dual-write violation | TTS, React | Every `dispatch()` that changes status, cursor, speed, or buffer must also update `stateRef.current` — async callbacks read the ref, not reducer state |
| Pronunciation override scope confusion | TTS, Settings | Global overrides in `settings.pronunciationOverrides`, per-book in `BlurbyDoc.pronunciationOverrides`. Merge at narration time with book-level priority. |
| `-webkit-app-region: drag` on `body` cascades everywhere | CSS, Electron | Never put `drag` on body — apply only to `.library-titlebar`; `no-drag` on buttons is insufficient because intermediate divs with padding still absorb clicks |
| DOM elements created by imperative code orphaned by React | Renderer | Render element in JSX, pass ref to controller; controller styles only |
| Kokoro rate must be bucket-clamped at mode boundary | TTS, Modes | NarrateMode must resolve ttsRate to `resolveKokoroBucket()` when engine is kokoro — continuous-rate leakage causes mismatched generation/playback speed |
| Heavy DOM work during active narration causes thread stalls | Renderer, TTS | Section restamping (unwrap/wrap word spans) must be deferred via `requestIdleCallback` during active narration — narration uses word array, not DOM spans |

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

### [2026-03-31] LL-063: Never Develop in a Cloud-Synced Folder

**Area:** workflow, infrastructure, git, disaster recovery
**Priority:** CRITICAL

**Context:** On 2026-03-30, 53 commits (NAR-2 through AUDIT-FIX-1E, representing ~2 days of sprint work) were permanently lost. Root cause chain: (1) Working directory was in OneDrive. (2) CLI agent ran `git reset --hard origin/main` on C2, reverting files to v1.2.0. (3) OneDrive synced C2's reverted files to C1. (4) `.git` was excluded from OneDrive sync as a fix attempt, which deleted git objects from local disk. (5) OneDrive conflict resolution destroyed the remaining `.git` objects. (6) 53 commits had never been pushed to GitHub, so no remote backup existed.

**Root Cause:** Cloud sync services (OneDrive, Google Drive, Dropbox) and git are incompatible — both manage file state, and they conflict during branch operations, checkouts, and resets.

**Guardrail:**
- PR-106: **Working directory must be local, not cloud-synced.** Standard path: `C:\Users\estra\Projects\Blurby`. Never in OneDrive, Google Drive, or any synced folder.
- PR-107: **`git push origin main` is mandatory after every sprint.** Part of the doc-keeper pass. Sprint is not complete until push succeeds. Zero tolerance for unpushed commits.
- PR-108: **`git pull origin main` is mandatory at session start.** Step 0 of session bootstrap, before reading CLAUDE.md.
- PR-109: **Never run `git reset --hard` without first checking `git log --oneline origin/main..HEAD` for unpushed commits.** If unpushed commits exist, push first.
- Full SOP: `docs/governance/DEVELOPMENT_SYNC.md`.

---

### [2026-04-01] LL-065: MOBI Files Contain Usable HTML — Don't Strip It

**Area:** format conversion, EPUB pipeline
**Status:** active
**Priority:** medium

**Context:** During EPUB-2A, discovered that MOBI text records contain actual HTML (`<h1>`, `<b>`, `<i>`, `<ul>`, `<ol>`, `<blockquote>`) — not just plain text. The original `parseMobiContent()` extracted the HTML and then aggressively stripped all tags via regex. This destroyed useful formatting that the MOBI author embedded. Adding `parseMobiHtml()` to return the raw HTML before stripping recovered formatting fidelity.

**Guardrail:** When adding format converters, always check what structure the source format natively provides before applying text-only extraction. Stripping HTML should be a last resort, not the default.

---

### [2026-04-01] LL-066: Silent `.catch(() => {})` Is a Systemic Anti-Pattern

**Area:** error handling, data integrity
**Status:** active
**Priority:** high

**Context:** Both internal and 3rd-party audits independently flagged this pattern. It appears in TTS cache manifest saves, sync queue enqueues (5 sites), tray creation, and generation pipeline cache reads. Each instance masks a different failure mode (disk full, corruption, permission denied). All sync queue instances were fixed in AUDIT-FIX-1A, cache manifest instances in AUDIT-FIX-1B.

**Guardrail:**
- PR-112: Grep for `.catch(() => {})`, `.catch(() => { })`, `.catch(()=>{})`, and bare `catch { }` before every sprint. Zero tolerance in new code.
- PR-113: Remaining instances in cloud storage cleanup are explicitly acceptable (file may already be gone). Document the rationale inline when a bare catch is intentional.

---

### [2026-04-01] LL-067: Infinite Scroll Is Fundamentally Incompatible with Pagination

**Area:** architecture, reader, flow mode
**Status:** active
**Priority:** high

**Context:** FLOW-3A reverses LL-013 ("Flow Mode Belongs in Page View"). The original decision was correct for the word-highlight cursor that walks through paginated text. But the Phase 3 redesign requires infinite scroll with a shrinking underline cursor pacing through continuously flowing text — this is fundamentally incompatible with CSS multi-column pagination. Attempting to shoehorn infinite scroll into a paginated container would require fighting both foliate-js and the browser's column layout engine.

**Resolution:** Flow Mode now gets its own scroll-based rendering path. FoliatePageView toggles `flow="scrolled"` (foliate-js native) when `flowMode=true`. A new imperative class `FlowScrollEngine` handles cursor animation, scroll positioning, and line mapping. Page Mode stays paginated. The modes are cleanly separated.

**Guardrail:**
- PR-114: When a mode requires fundamentally different layout (scroll vs paginated), give it its own rendering path. Don't force one layout paradigm into another.
- PR-115: LL-013's guardrail ("sub-modes render within parent view") still applies to modes that share layout (e.g., Focus within Page). Only override when the layout model is incompatible.

---

### [2026-04-01] LL-068: Agent File Reconstruction Causes Silent Truncation

**Area:** process, agent safety, file integrity
**Status:** active
**Priority:** critical

**Context:** FLOW-3B discovered that the second blurby-lead agent (ff96d26) silently truncated three files: `FoliatePageView.tsx` (1012→934 lines, missing entire JSX return block), `useKeyboardShortcuts.ts` (642→610 lines, missing `useSmartImport` export), and `LESSONS_LEARNED.md` (686→670 lines, cut mid-sentence). The truncation passed `npm test` (tests don't import FoliatePageView directly) but failed `npm run build`. The files were committed and merged to main in this broken state.

**Root cause:** The agent attempted to reconstruct files by reading line ranges and writing new content, but ran out of tool-use budget mid-reconstruction. The partial write was committed without build verification.

**Guardrail:**
- PR-116: After EVERY agent run that modifies files, run `npm run build` before committing. Tests alone are insufficient — they don't catch missing exports or truncated JSX.
- PR-117: After any file write by an agent, verify file integrity with `git diff --stat` — any unexpected size DECREASE is a truncation signal. Check those files explicitly.
- PR-118: Never reconstruct a file by concatenating line ranges. Use targeted `Edit` (old_string → new_string) for modifications. If the file needs major restructuring, restore from git and re-apply specific edits.

---

### [2026-04-04] LL-069: Normalize `load-doc-content` Results at the Renderer Boundary

**Area:** renderer, IPC contracts, reader startup
**Status:** active
**Priority:** high

**Context:** Opening a book in `npm run dev` could produce a blank screen immediately after the library-to-reader transition. The renderer log showed `Uncaught TypeError: text.split is not a function` from `src/utils/text.ts`, while the devtools also showed an unrelated `[Violation] 'click' handler took ... ms` warning. The warning was noise; the real crash was a data-shape mismatch.

**Root Cause:** `main/ipc/library.js` returns three different `load-doc-content` payload shapes:
- raw string content for inline/manual docs
- `{ filepath, ext }` for EPUB-backed docs
- `{ userError }` for user-facing failures

The renderer open path treated any non-error result like raw text and wrote it into `activeDoc.content`. For EPUB-backed docs that meant `content` became an object, and the crash did not happen until `tokenize()` / `tokenizeWithMeta()` later called `.split(...)` on that object. The failure surfaced far away from the IPC boundary, which made the blank screen look like a rendering bug instead of a contract bug.

**Fix:** Add one normalization step at the renderer boundary that converts `load-doc-content` results into a safe `activeDoc` shape before reader state is set. File-backed payloads must update `filepath` / `ext` (and `convertedEpubPath` when applicable) while keeping `content` a string. User errors must short-circuit before the reader mounts.

**Guardrail:**
- PR-119: Any IPC handler that returns a union of payload shapes must have a single renderer-side normalization function. Do not spread ad hoc shape checks across multiple components.
- PR-120: Reader entry points (`LibraryContainer`, standalone reader windows, future deep-link readers) must validate/normalize load results before assigning `activeDoc`.
- PR-121: Text utilities that may receive runtime-loaded content should fail safe on non-string input. This is a backstop, not a substitute for boundary normalization.
- PR-122: Performance warnings like slow click handlers or ResizeObserver noise are not root-cause evidence by themselves. Check the app error log / uncaught exception first when a blank screen follows a state transition.

### [2026-04-04] LL-070: Single Ownership for Section Navigation During Narration

**Area:** renderer, foliate bridge, narration
**Status:** active
**Priority:** high

**Context:** TTS-7I added exact miss-recovery (`goToSection()` from `useReadingModeInstance`) to handle narration words not yet in the DOM. But the older section-boundary effect in `ReaderContainer` (which also called `goToSection()` when `highlightedWordIndex` crossed a section boundary) was still active during narration. Both paths fired independently, causing visible page blinks and cursor destabilization on narration startup.

Separately, `FoliatePageView`'s active-mode `onSectionLoad` handler appended section words to `foliateWordsRef.current` without checking if that `sectionIndex` already existed, so section reload/recovery doubled the word array (e.g., 8770 → 17540).

**Root Cause:** Two independent owners for the same operation (section navigation during narration), and no identity check on word-source accumulation.

**Fix:** (1) Guard the ReaderContainer section-boundary effect to skip during `readingMode === "narration"`. Miss-recovery is the sole section-sync owner during narration. (2) Filter out existing words by `sectionIndex` before appending in `onSectionLoad` (dedupe by identity, not blind append).

**Guardrail:**
- PR-123: During narration, exactly ONE path may call `goToSection()`. If a new section-navigation mechanism is added, disable or remove the old one. Never allow two independent section-sync owners.
- PR-124: When accumulating EPUB section words into a shared array, always deduplicate by `sectionIndex`. Filter-then-append, not blind append. Log total word count before and after to detect unexpected growth.

### [2026-04-05] LL-071: EPUB Modes Must Use Global Word Source, Not DOM Viewport

**Area:** renderer, foliate bridge, narration, EPUB modes
**Status:** active
**Priority:** critical

**Context:** TTS-7J fixed section-sync ownership and word-source dedupe, but narration still started from tiny DOM-slice word counts (14, 674, 293) instead of the full-book extraction (69160 words). The root cause was deeper: `getEffectiveWords()` always returned DOM-loaded words even when full-book extraction was complete. Additionally, `extractFoliateWords()` and `onWordsReextracted` unconditionally replaced `wordsRef.current` with the small DOM slice, clobbering the global word array. Start-word resolution also validated against the DOM-slice length, so a valid global index like 1603 was discarded because the slice had only 14 words. Finally, the section-boundary `goToSection()` effect fired in page mode, interfering with manual page turning.

**Root Cause:** The Foliate DOM-loaded words were treated as THE word source for all modes. In reality, they are a rendering viewport — the full-book extraction is the source of truth for word scheduling, cursor tracking, and chunk boundaries once available.

**Fix:** (1) `getEffectiveWords()` returns `bookWordsRef.current.words` when complete. (2) `extractFoliateWords()` and `onWordsReextracted` skip `wordsRef` replacement when full-book source exists. (3) `resolveFoliateStartWord` accepts optional `globalWordsLength` for validation. (4) `getSectionForWordIndex` uses `bookWordSections` for global lookup. (5) Section-boundary effect only fires for focus/flow modes.

**Guardrail:**
- PR-125: For EPUB modes, the Foliate DOM-loaded words are a VIEWPORT, not the source of truth. Once `bookWordsRef.current.complete` is true, all word-array consumers (mode startup, cursor tracking, chunk scheduling) must use the global array. DOM words are only for rendering/highlighting/navigation.
- PR-126: Any function that validates word indices must accept a global word count parameter when the index may be global. Never validate a global index against a DOM-slice length.
- PR-127: Page-mode navigation must not depend on or be blocked by mode-specific section/source machinery. Section-boundary effects should be gated to only the modes that need them.

### [2026-04-05] LL-072: All User Selection Paths Must Preserve Exact Word Identity

**Area:** renderer, foliate bridge, selection mapping
**Status:** active
**Priority:** high

**Context:** TTS-7K fixed the global word-source and click-to-play, but text selection (double-click/drag) still lost the exact word identity. The `selectionchange` handler in FoliatePageView sent only `(cfi, word)` — no `globalWordIndex`. ReaderContainer then fell back to scanning for the first normalized text match, which picked the wrong occurrence for common words like "the".

**Root Cause:** The `selectionchange` handler was written before word spans had `data-word-index` attributes. It was never updated when click handling gained exact-index support.

**Fix:** `selectionchange` now resolves the `.page-word[data-word-index]` span via `anchorNode.parentElement.closest("[data-word-index]")` and sends the full payload matching click. First-match text fallback demoted to diagnostic-only.

**Guardrail:**
- PR-128: Every user selection path (click, double-click, drag-select, keyboard-select) must resolve to an exact `data-word-index` when available. Never fall back to text-based word matching as the normal path — that discards occurrence identity.
- PR-129: When adding a new selection mechanism, verify it sends the same payload shape as click: `(cfi, word, sectionIndex, wordOffsetInSection, globalWordIndex)`. The parent must never need to guess.

### [2026-04-05] LL-073: Resume Anchor Must Be Persistent, Not Time-Limited

**Area:** renderer, reader state, narration, progress tracking
**Status:** active
**Priority:** high

**Context:** After TTS-7L fixed exact selection mapping, pause→play and close→reopen still jumped to the first visible word. A time-limited `preservePlaybackAnchorUntilRef` was added as a stopgap, but it expired after ~1 second and passive Foliate `onLoad`/`onRelocate` events would then overwrite `highlightedWordIndex` with an approximate fraction-based word or first-visible fallback.

**Root Cause:** Time-limited anchor suppression is fundamentally wrong for pause→play (user may wait minutes before replaying) and impossible for close→reopen (the window expires before the book is even reopened). The anchor must be persistent until explicitly consumed or replaced.

**Fix:** Replaced `preservePlaybackAnchorUntilRef` (timestamp) with `resumeAnchorRef` (nullable number). Set from: narration cursor on pause, saved position on reopen. Consumed on mode start, cleared on explicit user selection. Passive `onLoad`/`onRelocate` check `resumeAnchorRef != null` and skip state mutation when active.

**Guardrail:**
- PR-130: Resume-anchor ownership must be explicit and persistent. Never use time-limited suppression for state that must survive until the next user action. The anchor is cleared ONLY by: mode start (consumed) or explicit user selection (replaced).
- PR-131: Passive page events (`onLoad`, `onRelocate`, first-visible) are VISUAL-ONLY when an authoritative anchor exists. They may update DOM highlights but must not mutate `highlightedWordIndex` or trigger progress saves.

### [2026-04-05] LL-074: UI Controls Must Materially Affect the Engine Path They Claim to Control

**Area:** TTS settings, Kokoro narration, UI truthfulness
**Status:** active
**Priority:** high

**Context:** TTS settings showed 5 pause sliders (comma, clause, sentence, paragraph, dialogue threshold) that implied deep control over Kokoro narration prosody. In reality, `pauseConfigRef` was stored in `useNarration.ts` but **never read** by any Kokoro code path. The generation pipeline used fixed chunk sizes. The audio scheduler used hardcoded punctuation weights. All 5 controls were placebo.

**Root Cause:** The pause pipeline was originally built for Web Speech / Focus/Flow modes (`rhythm.ts` → `pauseDetection.ts`). When Kokoro was added, it got its own generation path (`generationPipeline.ts` → `audioScheduler.ts`) that bypassed the pause system entirely. The UI was never updated to reflect this disconnect.

**Fix:** (1) `generationPipeline` now snaps chunk boundaries to sentence endings via `snapToSentenceBoundary`. (2) `audioScheduler.computeWordWeights` accepts `WordWeightConfig` with configurable factors. (3) `useNarration` derives weight factors from `pauseConfigRef` and passes through the Kokoro strategy chain.

**Guardrail:**
- PR-132: Every UI control must have a traceable code path to a behavioral effect in the engine it claims to control. If a setting is stored but never read by the active engine, it is a placebo — either wire it or remove/relabel it.
- PR-133: When adding a new TTS engine, audit ALL existing TTS settings against the new engine's code path. Settings that worked for the old engine are not automatically honored by the new one.
- PR-131: Passive page events (`onLoad`, `onRelocate`, first-visible) are VISUAL-ONLY when an authoritative anchor exists. They may update DOM highlights but must not mutate `highlightedWordIndex` or trigger progress saves.

### [2026-04-05] LL-075: A Silky Narration Cursor Requires Canonical Audio Progress, Not More Visual Easing

**Area:** renderer, narration, audio scheduling, cursor UX
**Status:** active
**Priority:** high

**Context:** After `TTS-7O`, a long series of live cursor fixes improved narration substantially: the 3-word band moves, the old left-right twitch is largely gone, pause leaves a visible anchor, and replay resumes from that anchor instead of the first page. But the cursor still felt stepped, laggy, and chunk-boundary-sensitive. Multiple renderer-side attempts helped a little — CSS transitions, requestAnimationFrame follower loops, line guards, aggressive follow rates, throttled React updates, and reduced DOM work — yet all hit the same ceiling. The narration audio stayed smooth while the visual band still behaved like a follower chasing delayed word targets.

**Root Cause:** The visual band is still inferred from coarse word/window updates after scheduling rather than being driven by a canonical audio-progress model. As long as the renderer is trying to animate toward intermittently updated DOM targets, it will feel stepped or laggy no matter how much easing is applied. This also risks chunk handoff ambiguity, where the next chunk appears to continue from a stale visual position instead of the last audio-confirmed narration word.

**Fix direction:** Lock in the current stable cursor behavior as “good enough to ship,” then treat the remaining work as a distinct architecture sprint. `TTS-7Q` introduces explicit separation between canonical audio cursor authority and the visual narration band, with chunk handoff continuity and audio-time-driven glide as first-class requirements.

**Guardrail:**
- PR-134: Narration has two different cursor concepts: the canonical audio cursor and the visual band. Start, pause, resume, save, reopen, and chunk carry-over must read/write the canonical audio cursor only. The visual band must never become the anchor.
- PR-135: Once the cursor is “stable but stepped,” stop iterating with CSS-only or renderer-only smoothing. Open a dedicated architecture sprint for audio-aligned progress instead of piling more UI easing onto a timing-model problem.
- PR-136: Truth-sync remains a guardrail, not a movement engine. Periodic resync may correct drift, but if users can perceive it as the main source of motion, the system is architecturally wrong.

---

### [2026-04-05] LL-076: Rolling Planner Must Own All Chunk-Boundary Decisions

**Area:** TTS, narration, generationPipeline, narrationPlanner
**Status:** active
**Priority:** high

**Context:** TTS-7O added audible silence injection and sentence-boundary snapping, but each concern (chunk splitting, silence sizing, resume targeting, dialogue detection) still made decisions independently in the moment. This meant that a chunk ending made by the pipeline could produce a silence value from the scheduler that didn't match the boundary class, and dialogue runs could get split mid-speech.

**Root Cause:** Without a shared plan structure, chunk-selection code and silence-injection code could see different boundary classifications for the same word offset. Each call had its own local heuristics and could drift from each other.

**Fix:** Introduced `src/utils/narrationPlanner.ts` with `buildNarrationPlan` that classifies all boundary types (sentence, clause, paragraph, dialogue) across the active forward text window once. The resulting `NarrationPlan` is passed to both chunk selection and silence injection. `planNeedsRebuild` guards against unnecessary recomputes.

**Guardrail:**
- PR-137: The rolling planner must be the single source of truth for where a chunk may legally end. Code that selects chunk boundaries and code that computes silence for those boundaries must both read from the same plan — never recompute boundary classification independently.
- PR-138: Planner scope is local and cheap — only the active forward window (~400 words), not the full book. If a planner scope ever becomes whole-book, re-evaluate for memory and latency budget before shipping.

---

### [2026-04-05] LL-077: RAF Glide Loop Must Read From a Single Canonical Progress Source

**Area:** renderer, narration, audioScheduler, FoliatePageView, cursor UX
**Status:** active
**Priority:** high

**Context:** TTS-7Q introduced a RAF-based glide loop in `FoliatePageView.tsx` that drives the 3-word narration band from `getAudioProgress()` rather than DOM target chasing. The key architectural step was adding `AudioProgressReport` (position fraction within the current chunk, current chunk word range, and estimated audio clock) to `audioScheduler.ts` and wiring `onChunkHandoff` through `kokoroStrategy.ts` → `useNarration.ts` → `FoliatePageView.tsx`. This separated the visual follower from the canonical anchor.

**Root Cause (of prior stepped motion):** The glide loop was indirectly reading visual cursor state to decide where to move next, which meant chunk handoffs could carry forward stale visual positions instead of audio-confirmed positions. Once the loop read from `getAudioProgress()` (owned entirely by the scheduler), the visual band became a pure follower with no authority over resume or handoff.

**Fix:** `AudioProgressReport` is the sole input to the glide loop. The canonical audio cursor (last confirmed word, chunk start index) is owned by the scheduler and written only by audio playback events. `onChunkHandoff` fires on every chunk boundary to synchronize the scheduler's chunk context before the next RAF frame. The visual band is derived from this report and has no write path to any anchor.

**Guardrail:**
- PR-139: The RAF glide loop in `FoliatePageView.tsx` must read cursor position exclusively from `getAudioProgress()`. It must not read from any React state, ref, or DOM element that is also used as a resume anchor or handoff carry-over value.
- PR-140: `onChunkHandoff` must fire on every chunk transition so the scheduler's `AudioProgressReport` reflects the new chunk before the next animation frame. A stale chunk context in `AudioProgressReport` will cause the visual band to jump on chunk boundaries.
- PR-141: `narrateDiagnostics.ts` provides `getGlideDiagSummary()` — use it during debugging, not as a performance-path data source. Diagnostic capture must be conditional on a debug flag and excluded from production-path RAF callbacks.

---

### [2026-04-05] LL-078: A Visually Calm Narration Cursor Beats a Theoretically Precise One

**Area:** renderer, cursor UX, FoliatePageView, narration
**Status:** active
**Priority:** high

**Context:** After `TTS-7Q`, the architecture was largely correct: canonical audio progress came from `audioScheduler.ts`, pause/replay anchors were preserved, and chunk handoffs no longer allowed the visual band to become the resume authority. But live testing still described the cursor as laggy, jumpy, and distracting. The problem was not that the system lacked more timing data; it was that the visual follower kept trying to reacquire exact word/window geometry. Multiple post-ship experiments improved stability without making the band feel calm: live-visual segment handoff, fixed-size overlay passes, same-line guards, smoothed rail steps, and fallback from audio-progress mode toward simpler word-to-word glide.

**Root Cause:** The visual band was still over-correcting. Even when canonical audio progress is available, a renderer that keeps nudging toward freshly measured DOM boxes can feel worse than a simpler approximation. Human perception prefers a calm, line-stable motion over a mathematically “more exact” cursor that is always arriving slightly late.

**Fix direction:** Keep the canonical audio cursor and resume/handoff ownership exactly as they are, but reduce the visual follower’s ambition. The visible band should be low-authority, line-stable, fixed-shape where possible, and only corrected on meaningful events (line change, truth-sync, chunk boundary, explicit retarget). If a visual cursor becomes distracting, simplify it rather than adding more geometry work.

**Guardrail:**
- PR-142: The visual narration band is a readability aid, not an exact alignment instrument. Prefer calm motion over hyper-precise box chasing.
- PR-143: Do not spend additional render-frame work to reacquire tiny per-word geometry changes unless the user can clearly perceive a benefit. If the correction is subtle but the jitter is noticeable, the correction is not worth it.
- PR-144: When the visual follower and canonical audio progress disagree on what feels best, canonical progress keeps ownership of pause/resume/save state, but the visible follower may intentionally simplify presentation for legibility.

---

### [2026-04-05] LL-079: Separate the Canonical Cursor Ref from Reducer State to Break Visual Contamination

**Area:** renderer, narration, useNarration, cursor ownership
**Status:** active
**Priority:** high

**Context:** `TTS-7R` identified a cursor-contamination loop that persisted through TTS-7Q: the visual advance callback dispatched `WORD_ADVANCE` to the narration reducer, which updated `cursorWordIndex`. `speakNextChunkKokoro` then read `cursorWordIndex` to determine the chunk start position. If the visual band had drifted ahead of actual audio, the next chunk would start from the wrong word.

**Root Cause:** There was no separation between "where audio confirmed it last played" and "where the visual band currently is." Both wrote to the same reducer field (`cursorWordIndex`), making it impossible to use visual cursor position for display while keeping chunk generation anchored to confirmed audio events.

**Fix:** Introduce `lastConfirmedAudioWordRef = useRef(0)` alongside the reducer. This ref is updated **only** by the audio scheduler's `onWordAdvance` callback — which fires on confirmed audio boundary crossings, not visual advances. `speakNextChunkKokoro` reads from `lastConfirmedAudioWordRef.current`; `cursorWordIndex` in the reducer continues to serve UI purposes (highlight, scroll-follow). Truth-sync corrects the visual overlay position only — it does not write to `lastConfirmedAudioWordRef` or `cursorWordIndex`.

**Guardrail:**
- PR-145: `lastConfirmedAudioWordRef` must be written ONLY by audio scheduler confirmed boundary events. No visual advance callback, truth-sync, or reducer dispatch should update it.
- PR-146: `speakNextChunkKokoro` (and any future chunk-generation entry point) must read chunk start from `lastConfirmedAudioWordRef`, never from `cursorWordIndex` or any field that the visual follower can write.
- PR-147: Truth-sync is a visual correction guardrail only. If truth-sync needs to snap the overlay to a different line, it updates the overlay element's transform directly — it must not write any state that the chunk-generation pipeline could read.

---

### [2026-04-05] LL-080: Global Keyboard Guard Must Check Input Target, Not Modal State

**Area:** renderer, keyboard, useKeyboardShortcuts, accessibility
**Status:** active
**Priority:** moderate

**Context:** `HOTFIX-12` found that the global `window` keydown handler in `useKeyboardShortcuts.ts` was stealing Ctrl+Left/Right from the bug reporter textarea, and would do the same to any future modal or inline input. The initial spec considered two approaches: (a) check for a modal-open flag or CSS class in the DOM, or (b) check `e.target` element type directly.

**Root Cause:** Approach (a) couples the keyboard guard to specific modal state — it must be updated whenever a new modal is added. Approach (b) is a universal rule: inputs deserve their native shortcuts everywhere, unconditionally.

**Fix:** Early-return at the top of the keydown handler if `e.target` is a `<textarea>`, `<input>`, or has a `contenteditable` attribute. No `preventDefault`. This single guard protects all current and future text inputs app-wide.

**Guardrail:** The global keyboard handler in `useKeyboardShortcuts.ts` must always have an early-return guard that checks `e.target` for `<textarea>`, `<input>`, or `contenteditable` before processing any shortcut. Never gate this check on modal-specific state — that approach doesn't scale and will regress as new modals are added.

---

### [2026-04-06] LL-081: Full-Book Words and DOM-Slice Words Are Two Different Data Sources — Never Mix Indices

**Area:** renderer, narration, focus mode, FoliatePageView, ReaderContainer, data integrity
**Status:** active
**Priority:** critical

**Context:** BUG-152 (focus mode blank screen) and BUG-151 (page-tall narration band) both stem from the same architectural pattern: the app has two word sources that use different index spaces, and components that mix them produce silent failures.

**Two word sources in Blurby:**
1. **Full-book words** (`bookWordsRef.current.words`) — 173,727 words extracted from the entire EPUB spine via `epub-word-extractor.js`. Global indices: 0–173,726. Used by `getEffectiveWords()` when `bookWordsRef.current?.complete === true`.
2. **DOM-slice words** (`foliateWordStrings` / `foliateApiRef.current.getWords()`) — ~1,000 words from the currently visible Foliate section. Indices are section-local but map to global indices via `data-word-index` attributes in the DOM.

**The bug pattern:** A component receives DOM-slice words (short array) but indexes into it using a full-book global index (large number). `words[5114]` is `undefined` when the array only has 1,000 entries. The component renders blank instead of crashing, making the failure silent.

**Where this bit us:**
- `ReaderContainer.tsx:1362` — `ReaderView` received `words={foliateWordStrings}` (DOM-slice) but `wordIndex` came from the full-book timer. Fix: pass `bookWordsRef.current.words` when available.
- `FoliatePageView.tsx:860` — Narration overlay fallback used `currentWindow.height` from `measureNarrationWindow()` which measures DOM positions of words that may not exist in the current section, producing page-tall bands. Fix: cap fallback height.

**Root Cause:** TTS-7K (v1.33.6) promoted full-book words as the narration source of truth (`getEffectiveWords` returns global words when available), but display components (`ReaderView`, `positionNarrationOverlay`) were never updated to use the same source. The index spaces diverged silently.

**Guardrail:** Any component that uses `wordIndex` (the global reading position) MUST receive words from the same source that `getEffectiveWords()` returns. When `bookWordsRef.current?.complete`, the word source is the full-book array — not the DOM-slice `foliateWordStrings`. Grep for `words={foliateWordStrings}` and verify each consumer is index-compatible. When adding new word-consuming components, always check: "Which index space does my `wordIndex` come from, and does my `words` array match?"

---

### [2026-04-06] LL-082: Fallback Values Must Be Capped to Prevent Proportional Blowup

**Area:** renderer, narration, CSS, visual safety
**Status:** active
**Priority:** moderate

**Context:** BUG-151's page-tall narration band was caused by an uncapped fallback in the band height calculation. The code pattern `ref > 0 ? ref : measuredValue` is safe when `measuredValue` is always reasonable. But when `measuredValue` comes from DOM measurement of a multi-line span or a cross-section word window, it can be hundreds of pixels — producing a band that covers the entire page.

**The pattern that fails:**
```typescript
const fixedHeight = narrationBandLineHeightRef.current > 0
  ? narrationBandLineHeightRef.current
  : currentWindow.height; // ← UNCAPPED — can be 800px
```

**The safe pattern:**
```typescript
const fixedHeight = narrationBandLineHeightRef.current > 0
  ? narrationBandLineHeightRef.current
  : Math.min(currentWindow.height, MAX_FALLBACK_HEIGHT); // ← CAPPED
```

---

### [2026-04-06] LL-083: Soft Selection Uses Refs + Direct Shadow DOM Mutation, Not State

**Area:** renderer, page mode, word selection, FoliatePageView
**Status:** active
**Priority:** high

**Context:** SELECTION-1 added a passive "soft selection" indicator — a `.page-word--soft-selected` CSS class on the first visible word on every page turn. The design decision was to use a ref (`softWordIndexRef`) and direct DOM class mutation via `renderer.getContents()` rather than React state.

**Why not state:** Setting React state on every page turn (every `onRelocate` / `onLoad` event) would trigger a re-render of the entire reader component tree. At 60fps page-turn animations this causes visible jank. The soft indicator is purely visual — no downstream logic depends on it being in the render cycle.

**The established pattern for all Foliate visual indicators:**
1. Store the value in a `useRef` (never `useState`) to avoid re-renders.
2. Apply the CSS class directly in shadow DOM via `renderer.getContents()` iteration:
   ```typescript
   view.renderer.getContents().forEach(({ doc }) => {
     doc.querySelector(`[data-word-index="${idx}"]`)?.classList.add('page-word--soft-selected');
   });
   ```
3. Clear the previous indicator explicitly before applying the new one (store the previous index in a ref).
4. Hard selections and mode-active states always visually override soft selection (higher-specificity CSS or explicit clear before mode start).

**Guardrail:** Never use `useState` for visual-only word indicators in FoliatePageView or ReaderContainer. Use refs + shadow DOM class manipulation. This is the same pattern used for narration band position, highlighted word overlay, and flow cursor. Mixing state-driven and ref-driven visual indicators on the same DOM element causes flicker and ordering bugs.

**Guardrail:** Every fallback value derived from DOM measurement must have a reasonable upper bound. For visual elements with expected line-height dimensions, cap to ~2x expected size (e.g., 40px for a line-height band). Never pass raw `getBoundingClientRect()` results directly into visual sizing without a ceiling. This applies to width as well — `bodyRect.width` is safe for single-column but may be wrong for two-column layouts.

---

### [2026-04-06] LL-084: Electron fetch() Is Rejected by WAF-Protected Sites — Always Provide fetchWithBrowser Fallback

**Area:** main process, URL extraction, url-extractor.js, misc.js
**Status:** active
**Priority:** high

**Context:** BUG-155 — HOTFIX-14. URL extraction for EBSCO and Cloudflare-protected sites returned HTTP 400 silently, causing a user-facing "Could not extract article" error. The `fetchWithBrowser` fallback (hidden BrowserWindow with full Chromium session) existed in the `hasLogin` branch of `misc.js` but was absent from the `else` (no-login) branch.

**Root cause:** Electron's built-in `fetch()` uses Chromium's network stack with identifiable TLS fingerprints and `Sec-Ch-Ua` headers that WAF systems (EBSCO, Cloudflare) detect as a bot/automated client and reject with HTTP 400 or 403. A hidden `BrowserWindow` with a real session bypasses this because it presents as a normal browser navigation.

**Guardrail:** The no-login branch of URL extraction (`misc.js` — the `else` branch after the `hasLogin` check) must always include `fetchWithBrowser` as a fallback when the primary Node `fetch()` returns a 4xx status. Never assume Node fetch is sufficient for all sites. The pattern: try Node fetch → if status 4xx → retry with `fetchWithBrowser` hidden window → surface error only if both fail.

---

### [2026-04-06] LL-085: Derive Layout Values Per-Tick — Never Store Width in Animation Ref Structs

**Area:** renderer, FoliatePageView.tsx, narration overlay, animation loops
**Status:** active
**Priority:** high

**Context:** NARR-CURSOR-1 — Collapsing narration cursor. The fixed-width narration band (TTS-7R) stored a `width` field in the animation ref struct. When `colRight` (the paragraph right edge) was updated independently — e.g., on column layout recalculation — the stored `width` became stale and the overlay drifted visually.

**Root cause:** Intermediate values that can be computed from invariants (e.g., `width = colRight - leftEdge`) should never be stored alongside those invariants. If the invariant updates but the derived field does not, the struct silently diverges and produces wrong layout. The drift is invisible at the call site.

**Pattern:** When an animation state struct drives per-frame rendering, compute derived values fresh each tick from the invariants that are already in scope. For the narration cursor: `colRight` is the invariant (set once per anchor), `leftEdge` advances each tick, and `width` is always `colRight - leftEdge` — never stored.

**Guardrail (PR-145):** Never store derived layout values (width, height, offset) in animation ref structs when the source invariant (`colRight`, `lineHeight`) is available at render time. Compute fresh each tick. This applies to any RAF loop in `FoliatePageView.tsx` or similar DOM-driven animation.

---

### [2026-04-06] LL-086: In Foliate, Always Measure Geometry from `foundDoc` — Not `contents[0]`

**Area:** renderer, FoliatePageView.tsx, Foliate multi-document architecture
**Status:** active
**Priority:** high

**Context:** NARR-CURSOR-1 — Collapsing narration cursor. The `positionNarrationOverlay` function seeded `colRight` from `contents[0]` — the first section's document. For multi-section EPUBs, each section is a separate `Document` rendered in its own iframe. When narration advanced into section 2+, `contents[0]` produced the geometry of section 1, placing the overlay at the wrong horizontal position.

**Root cause:** Foliate's `renderer.getContents()` returns an array of `{ doc, ... }` objects — one per loaded section. The word-finding loop already identifies `foundDoc` (the document containing the current word). Seeding geometry from any document other than `foundDoc` produces wrong results for all sections after the first.

**Pattern:** Measure all geometry (bounding rects, column right edges, line heights) from the `foundDoc` already located by the word-finding loop. Pass `foundDoc` into `positionNarrationOverlay` as the measurement document. Never reuse a cached reference to `contents[0]` for geometry.

**Guardrail (PR-146):** In any Foliate geometry measurement — whether for narration overlay, cursor positioning, or scroll anchoring — always derive the measurement document from `foundDoc` (the doc containing the target word). Never use `contents[0]` or any cached singleton document reference. This applies to `FoliatePageView.tsx` and any future Foliate integration code.

---

### [2026-04-06] LL-087: Module-Scope Constants Must Be Declared Before Use — TDZ Is Silent in Test Environments

**Area:** renderer, constants.ts, test setup, TypeScript module scope
**Status:** active
**Priority:** high

**Context:** FLOW-INF-A — Reading Zone & Visual Pacing. New flow zone constants (`FLOW_ZONE_DEFAULT_POSITION`, `FLOW_ZONE_DEFAULT_SIZE`) were appended to the bottom of `src/utils/constants.ts`. The `DEFAULT_SETTINGS` object at the top of the same file referenced these constants directly in its initializer. This caused a Temporal Dead Zone (TDZ) error at module load time: `DEFAULT_SETTINGS` was evaluated before the zone constants were defined.

**Root cause:** JavaScript/TypeScript `const` declarations are hoisted but not initialized — they exist in a "temporal dead zone" from the start of the enclosing scope until the declaration is reached. In the same module, reading a `const` before its declaration line throws `ReferenceError: Cannot access 'X' before initialization`. The TDZ error surfaced in the test suite (`flowReadingZone.test.ts`) as a module initialization failure, not as a clear "constant not found" message.

**Pattern:** In any constants file, always declare leaf constants (primitives with no dependencies) before composite constants or objects that reference them. The correct order is: (1) primitive constants, (2) derived constants, (3) composite objects (like `DEFAULT_SETTINGS`). Never append new constants after a composite object that already references them.

**Guardrail (PR-147):** When adding constants to `src/utils/constants.ts` or any module that exports a composite object (e.g., `DEFAULT_SETTINGS`), place new primitive constants above the first composite that will reference them. Run `npm test` after adding constants — a TDZ error will surface immediately as a module initialization failure in any test that imports the affected module.

---

### [2026-04-06] LL-088: Parallel Doer Agents Can Produce Duplicate Exports — Verify Unique Identifiers Before Dispatch

**Area:** renderer, constants.ts, multi-agent sprints, parallel task execution
**Status:** active
**Priority:** medium

**Context:** FLOW-INF-B — Timer Cursor & Pacing Feedback. Two parallel doer tasks (Task #2: timer bar constants, Task #4: line-completion flash) both added constants to `src/utils/constants.ts`. Task #4's agent independently added `FLOW_LINE_COMPLETE_FLASH_MS` — a constant that Task #2's agent had already exported. The result was a duplicate `export const FLOW_LINE_COMPLETE_FLASH_MS` in the same file, causing a TypeScript compile error.

**Root cause:** When Zeus dispatches parallel implementation tasks that touch the same shared file, each doer reads the file at dispatch time but neither sees the other's in-flight writes. If both task specs describe adding an export with the same name, both agents add it. The duplicate is invisible until TypeScript or a bundler rejects the file.

**Pattern:** Before dispatching two or more parallel tasks to the same file, Zeus (or the sprint spec) must explicitly enumerate which exports belong to which task. If both tasks legitimately need the same constant, assign ownership to exactly one task and mark the other as a consumer. Alternatively, sequence tasks that share a file — the performance loss is usually smaller than the cost of diagnosing a duplicate-export collision after the fact.

**Guardrail (PR-148):** For any sprint with parallel doer tasks that write to the same file: (1) diff the export names in each task's spec — flag any overlap before dispatch, (2) assign each new export to exactly one task, (3) if a second task needs the export, it reads it as an existing value rather than redeclaring it. Zeus must enforce this at plan time, not at merge time.

---

### [2026-04-07] LL-089: patch-package Fork Maintenance Pattern for Node Dependencies

**Area:** TTS, dependencies, fork maintenance
**Status:** active
**Priority:** moderate

**Context:** NARR-TIMING required forking kokoro-js to surface the duration tensor that the library discards. The fork targets built `dist/` artifacts (both CJS and ESM) rather than source files, because the Electron packaged app loads `dist/kokoro.cjs` directly and dev mode loads `dist/kokoro.js`.

**Decision:** Use `patch-package` to create a persistent patch file (`patches/kokoro-js+1.2.1.patch`) applied automatically on `npm install`. The patch is version-pinned — updating kokoro-js requires regenerating the patch.

**Guardrail (PR-089):** When updating kokoro-js (or any patch-package-managed dependency), the patch must be regenerated and both CJS/ESM parity verified. The fork includes 4-layer runtime validation that detects semantic changes — if upstream changes duration tensor behavior, the validation fails closed and the heuristic fallback activates. But structural changes (renamed methods, changed class hierarchy) will cause patch application to fail at `npm install` time.

**Pattern — CJS/ESM dual-target patching:** kokoro-js ships both `dist/kokoro.cjs` (CommonJS, used in packaged Electron) and `dist/kokoro.js` (ESM, used in Vite dev). Both files must be patched identically. After applying changes to `node_modules/kokoro-js/dist/`, run `npx patch-package kokoro-js` to generate/update `patches/kokoro-js+VERSION.patch`. The patch file covers both files in one diff.

**Related:** NARR-TIMING sprint, `patches/kokoro-js+1.2.1.patch`, LL-057 (kokoro-js import path split)

### [2026-04-07] LL-090: Verify Bug Reports Against Current Codebase Before Filing

**Area:** bug triage, investigation gate, sprint planning
**Status:** active
**Priority:** moderate

**Context:** STAB-1A included BUG-163 (TTS cold-start latency — model loads on play, not on book open). During implementation, Zeus discovered the fix was already in place: `ReaderContainer.tsx:283-284` already calls `ttsKokoroPreload()` on book open. The bug report was filed from a code analysis that missed the existing wiring. Zeus correctly wrote a confirmation test instead of duplicate code, but the sprint still carried the unnecessary task overhead.

**Guardrail (PR-090):** Before filing a bug or including a fix task in a sprint spec, verify the current state of the code at the exact location. Read the actual source file — don't rely on descriptions of behavior that may be outdated. For IPC wiring specifically: trace the full chain (renderer call → preload.js → IPC handler → main process function) to confirm whether it's actually wired or truly missing.

**Pattern — false positive avoidance:** When investigating "feature X isn't wired up" bugs, grep for the IPC channel name across the codebase before filing. If the channel exists in both `preload.js` and at least one renderer call site, it's wired — the bug is elsewhere (or doesn't exist).

**Related:** STAB-1A sprint, BUG-163

### [2026-04-07] LL-091: Pre-Split Sprints With 5+ Implementation Tasks Into Waves

**Area:** dispatch sizing, agent orchestration, tool budget
**Status:** active
**Priority:** high

**Context:** STAB-1A had 5 implementation tasks + tests + docs + git = 10 total tasks. Zeus hit the 40-tool ceiling twice, requiring 3 separate dispatches (~121 total tool calls). The runtime ceiling hits waste context and cause mid-task interruptions. The wave pattern was already documented but treated as a fallback — sprints were dispatched as single units and split only when the ceiling was hit during execution.

**Guardrail (PR-091):** Any sprint with 5+ implementation tasks (not counting tests, verification, docs, git) MUST be pre-split into waves at dispatch time. Standard split: Wave A = all implementation tasks + test writing + npm test/build. Wave B = spec compliance (Solon) + docs (MarcusAurelius) + git (Hermes). This is a planning-time decision, not a runtime recovery. The dispatch prompt should explicitly name the wave.

**Pattern — tool budget estimation:** Implementation tasks average 8-12 tool calls each (read files + edit + verify). Tests average 10-15 (read existing patterns + write + run). Docs average 10-15 (read 6 files + edit 4-6). Git averages 5. A 5-task sprint therefore needs ~70-100 tool calls — well above the 40-tool single-dispatch budget.

**Related:** STAB-1A closeout, CLAUDE.md dispatch sizing rule

### [2026-04-07] LL-092: Sprint Specs Must Verify Target File Existence Before "Create" Tasks

**Area:** sprint planning, spec quality, investigation gate
**Status:** active
**Priority:** high

**Context:** REFACTOR-1A Task 7 said "Create `main/constants.js`" but the file already existed (created in PERF-1 sprint). The agent overwrote the existing file, destroying PERF-1's constants. A fix cycle was needed to restore the lost content and merge both sets of constants.

**Guardrail (PR-092):** Every "Create [file]" task in a sprint spec must include a pre-check: does the file already exist? If it might, the task description must say "Create or extend" and include instructions to read the existing file first. The investigation phase should grep for the filename to confirm whether it's new or existing.

**Pattern — safe constant extraction:** When extracting hardcoded values into a constants file, always: (a) read the target file first, (b) append new constants rather than overwriting, (c) verify no naming collisions with existing exports.

**Related:** REFACTOR-1A closeout, PERF-1 (created main/constants.js)

### [2026-04-07] LL-093: Effect Extraction Reduces useEffect Count but Not Total Line Count

**Area:** refactoring, sprint planning, success criteria
**Status:** active
**Priority:** moderate

**Context:** REFACTOR-1A spec targeted ReaderContainer.tsx < 700 lines (from 1,623) by extracting 33 useEffects into custom hooks. Result: 1,167 lines. The remaining lines are callbacks, JSX, imports, hook composition, and ref declarations — none of which were targeted by the extraction. The <700 target was aspirational and based on the assumption that useEffects constituted most of the file's bulk.

**Guardrail (PR-093):** When estimating post-refactoring line counts, account for: (a) the code that stays (callbacks, JSX, types, imports), (b) the new code added (hook imports, hook calls, prop destructuring), and (c) the code that moves (only the useEffect bodies + their local variables). A realistic formula: `remaining = total - (effect_lines × 0.85)` where the 0.85 factor accounts for shared state/refs that stay in the parent.

**Related:** REFACTOR-1A closeout, SC-1 partial pass

---

### [2026-04-07] LL-092: Performance Remediation Patterns for Electron + React

**Area:** performance, startup, renderer, data layer, build
**Status:** active
**Priority:** high

**Context:** PERF-1 audited 44+ sprints of accumulated performance debt across main process startup, renderer re-render churn, and data-layer I/O. All 10 remediations shipped successfully (18 success criteria, 32 new tests). Key patterns emerged that apply broadly to the codebase going forward.

**Pattern 1 — Startup parallelization:** Electron startup should follow: `loadState()` (blocking — window needs settings) → `createWindow()` (as early as possible) → `Promise.all([initAuth(), initSyncEngine()])` (parallel background) → deferred folder sync. Auth and sync never need to block the window. Any sequential `await` in `app.whenReady` that doesn't feed the next step is a candidate for parallelization.

**Pattern 2 — Debounce-everywhere for I/O:** Any UI handler that can fire repeatedly (keystrokes, sliders, toggles) must debounce its persistence write. 300–500ms is the right range for user-input-triggered saves. Use `setTimeout`/`clearTimeout` at module or hook level — no new dependencies needed. File writes triggered by UI events should NEVER be unbounced.

**Pattern 3 — LRU-by-default for caches:** Any `Map` used as a cache must have an eviction policy. Unbounded maps grow forever in long sessions (library with hundreds of EPUBs). 50-entry LRU is the right default for EPUB chapter caches. Implement as a small class (~15 lines) — no external LRU library needed. The pattern: track insertion order, evict oldest entry when `size > cap` on every `.set()`.

**Pattern 4 — Index hot-path lookups:** If a timer or frequent callback scans a full array to find matching items, replace it with a pre-built Set or Map index. Update the index on mutations. For snoozed docs: a `snoozedDocIds` Set replaces a full `library.json` scan every 60 seconds.

**Pattern 5 — useRef escape-hatch for stable dependencies:** When a `useEffect` depends on values that change frequently but the effect should only re-run on one or two of them, move the non-trigger values to refs (`useRef`). The effect only lists the trigger deps. This reduced the voice sync effect from 7 deps to 2 (only `selectedVoiceId` and `ttsEnabled` should trigger re-sync).

**Pattern 6 — Vite `manualChunks` for Electron renderers:** Single-bundle Vite output loads everything synchronously on startup. Splitting into vendor/tts/settings chunks reduces initial parse time and enables lazy-loading of heavy modules (Kokoro TTS, settings sub-pages). The `manualChunks` config in `vite.config.js` is the right hook — no dynamic `import()` refactoring needed for build-time splitting. The build went from 1 chunk to 16 JS chunks.

**Pattern 7 — Batch `getComputedStyle` calls:** `getComputedStyle()` forces a style recalculation. Multiple calls in the same function (e.g., 3× in `injectStyles`) all trigger layout. Collect all needed properties from a single `const rootStyles = getComputedStyle(el)` call at the top of the function. This is one of the cheapest renderer optimizations available.

**Guardrail (PR-092):** Before adding any new cache (Map), persistence handler, or useEffect with >3 deps, check: (a) Does the cache need eviction? (b) Is the save handler debounced? (c) Can the effect deps be reduced with refs? Answer these before writing the code, not after.

**Related:** PERF-1 sprint, `tests/perfAudit.test.ts`, `main.js` startup sequence, `main/ipc/state.js`, `main/file-parsers.js`, `src/components/ReaderContainer.tsx`, `vite.config.js`

---

### [2026-04-07] LL-094: Component Decomposition Removes ~30–40% of Lines, Not 60%

**Area:** refactoring, sprint planning, success criteria
**Status:** active
**Priority:** moderate

**Context:** REFACTOR-1B targeted TTSSettings.tsx < 350 lines (from 874) and had an implicit goal of FoliatePageView < 700 lines (from 1,947). Actual results: TTSSettings 583 lines, FoliatePageView 1,724 lines — reductions of ~33% and ~11% respectively. Extracting sub-components and helper utilities moves the extracted code out of the file, but the remaining parent retains all the glue: prop declarations, imports of the new components, hook calls, prop threading to child components, conditional logic, and container JSX. None of that moves.

**Root cause:** Sprint specs set aspirational targets based on the volume of code being extracted, without accounting for (a) the new code that replaces it (imports, prop passing, composition), (b) the structural code that stays (container JSX, top-level state, event handlers), and (c) the fact that sub-component extraction typically removes only the render body, not the orchestration layer.

**Guardrail (PR-094):** When setting post-refactoring line count targets for component decomposition, use 60% of original as the floor, not the aspirational minimum. For a 874-line file, a realistic target after splitting 3 sub-components is ~525 lines (60%), not <350 (40%). If the goal is true size reduction, plan for additional passes (dead code removal, logic consolidation) after the structural extraction. Do not treat extraction and slimming as the same operation.

**Related:** REFACTOR-1B closeout, REFACTOR-1A closeout, LL-093 (effect extraction line count reality)

---

### [2026-04-16] LL-095: Centralize URL Scheme Validation and Force Refresh on 401

**Area:** main process, security, auth, cloud sync, URL handling
**Status:** active
**Priority:** high

**Context:** TEST-COV-1 hardened the main-process URL entry points and the cloud retry path at the same time. `addDocFromUrl`, `site-login`, and `open-url-in-browser` now share a single HTTP/HTTPS-only validation helper, so dangerous schemes are rejected before any URL-dependent work. The Google and Microsoft cloud paths also learned a separate lesson: a plain `getAccessToken()` call after a 401 can hand back the same cached token, so retries must explicitly force refresh.

**Guardrail:** Use one shared `validateHttpHttpsUrl()`-style helper for every user-supplied URL before domain parsing or network access. On 401 retry paths, call the explicit refresh form (`forceRefresh: true` or equivalent) before retrying once. Never assume a cached-token lookup will refresh itself after an auth rejection.

**Related:** TEST-COV-1 sprint, `main/ipc/misc.js`, `main/auth.js`, `main/cloud-google.js`, `main/cloud-onedrive.js`

---

### [2026-04-16] LL-096: Evaluation Tracing Must Be Explicitly Opt-In and Sink-Driven

**Area:** renderer, narration, flow sync, tooling, observability
**Status:** active
**Priority:** high

**Context:** TTS-EVAL-1 introduced durable trace capture for narration/flow quality analysis. Direct inline logging would have polluted runtime behavior and made traces non-deterministic across sessions. The reliable approach was to route events through an optional trace sink and keep the entire path disabled by default.

**Guardrail:** Evaluation instrumentation should be sink-driven (`record(event)`) and off unless an explicit harness flag enables it. Runtime hooks can emit lifecycle/word/flow/transition events only through that sink; no inline console logging or always-on tracing in production paths.

**Related:** TTS-EVAL-1 sprint, `src/utils/ttsEvalTrace.ts`, `src/hooks/useNarration.ts`, `src/hooks/useFlowScrollSync.ts`, `src/components/ReaderContainer.tsx`

---

### [2026-04-16] LL-097: Evaluation Artifact Names Must Be Deterministic for Cross-Branch Diffs

**Area:** tooling, evaluation harness, release workflow
**Status:** active
**Priority:** high

**Context:** In TTS-EVAL-2, timestamp-based artifact names made matrix/soak comparisons noisy and hard to diff across branches. Even when behavior matched, output paths changed every run, forcing manual matching.

**Guardrail:** Harness artifact names should be deterministic from run metadata (`run-id`, `scenario id`, `iteration`) and written atomically. Use checkpoints for long runs and treat interruption as a first-class state so partial runs remain reviewable.

**Related:** TTS-EVAL-2 sprint, `scripts/tts_eval_runner.mjs`, `scripts/tts_eval_metrics.mjs`, `tests/ttsEvalMatrixRunner.test.ts`

---

### [2026-04-16] LL-098: Quality Gates Must Fail Fast but Still Persist Review Artifacts

**Area:** tooling, release quality, evaluation governance
**Status:** active
**Priority:** high

**Context:** TTS-EVAL-3 introduced enforceable pass/fail quality gates on matrix aggregates. A key reliability requirement emerged: gate checks must be strict enough to block release on hard failures, but they must still write complete gate artifacts (`gate-report.json` and `.txt`) before exiting non-zero so reviewers can diagnose quickly.

**Guardrail:** Any release gate command must follow this order: compute aggregate → evaluate gates → write structured + human-readable reports atomically → return exit code (`0` pass, non-zero fail). Never short-circuit before artifacts are written; failed runs must remain reviewable.

**Related:** TTS-EVAL-3 sprint, `scripts/tts_eval_gate.mjs`, `scripts/tts_eval_runner.mjs`, `docs/testing/TTS_EVAL_BASELINE_POLICY.md`

---

### [2026-04-16] LL-099: Kokoro Readiness Must Come from an Authoritative Status Snapshot

**Area:** TTS, Kokoro, renderer truth, worker lifecycle
**Status:** active
**Priority:** high

**Context:** TTS-HARDEN-1 started as an engine bootstrap/recovery fix, but the real failure mode was contract drift between layers. The main process could correctly report "not ready" or "retrying" while renderer consumers still inferred readiness from download progress, loading booleans, or late legacy error events. That created a half-hardened system: engine truth existed, but the UI could still claim Kokoro was ready when it was not.

**Guardrail:** Readiness, loading, retryability, and terminal reason must come from one normalized status snapshot (`status`, `detail`, `reason`, `ready`, `loading`, `recoverable`). Progress events are supplemental only; they must never flip readiness on their own. Legacy error channels may fill missing detail, but they must not overwrite an already-structured terminal snapshot. When worker retries or shutdowns are possible, retry timers and pending/loading promises must be owned by the worker/lifecycle that created them so stale callbacks cannot reintroduce false state later.

**Related:** TTS-HARDEN-1 sprint, `main/tts-engine.js`, `main/tts-engine-marathon.js`, `main/ipc/tts.js`, `src/utils/kokoroStatus.ts`, `src/hooks/useNarration.ts`, `src/components/settings/TTSSettings.tsx`

---

### [2026-04-17] LL-100: Fallback Ownership Cleanup Must Key Off React-Visible Extraction State

**Area:** TTS, foliate fallback, React lifecycle, callback ownership
**Status:** active
**Priority:** high

**Context:** TTS-HARDEN-2 exposed a subtle ownership bug in the fallback section-end path. The foliate fallback callback needed to stop owning section continuation as soon as full-book EPUB metadata/extraction became available, but that completion was being tracked only through mutable refs. The refs were truthful when read imperatively, yet the callback lifecycle itself never re-ran at the right time, so stale fallback ownership could survive longer than intended.

**Guardrail:** When an async milestone must add, remove, or re-scope a registered callback (`setOnSectionEnd`, listener wiring, ownership guards), the milestone must be reflected in React-visible state or an effect dependency that actually re-runs lifecycle cleanup. Mutable refs are fine for hot-path reads inside the callback, but refs alone are not sufficient to retire or replace callback ownership after extraction/full-book promotion completes.

**Related:** TTS-HARDEN-2 sprint, `src/hooks/useFoliateSync.ts`, `src/hooks/useNarrationCaching.ts`, `src/hooks/useFlowScrollSync.ts`

---

### [2026-04-17] LL-101: Exact-Speed UX Can Sit Above Fixed Kokoro Generation Buckets

**Area:** TTS, Kokoro, audio scheduling, release verification
**Status:** active
**Priority:** high

**Context:** TTS-RATE-1 needed to improve Kokoro speed control without reintroducing chipmunking or restart churn. The shipped design kept synthesis/cache generation on a small fixed bucket set (`1.0`, `1.2`, `1.5`) while exposing exact user-facing speeds in `0.1x` steps from `1.0x` to `1.5x`.

**Guardrail:** Treat the selected UI speed and the generation bucket as separate truths. The UI, preview, and persisted selection must stay aligned to the exact chosen speed, while the runtime resolves the nearest generation bucket and applies a pitch-preserving pre-playback tempo stage to close the gap. If the user changes speed within the same bucket, retime buffered audio and boundary timing live; do not restart generation just to reflect the new exact speed.

**Pattern:** Verification for bucketed-speed systems must prove both layers at once: unit coverage for the full UI-speed ladder, continuity coverage for in-bucket live edits, and a gated release matrix that exercises every supported UI rate (`1.0`, `1.1`, `1.2`, `1.3`, `1.4`, `1.5`). For TTS-RATE-1, the gated six-rate matrix (`artifacts/tts-eval/final-gate-22`) confirmed PASS with zero pause/resume failures, zero handoff failures, and drift held at the baseline ceiling.

**Related:** TTS-RATE-1 sprint, `src/utils/kokoroRatePlan.ts`, `src/utils/audioScheduler.ts`, `src/hooks/useNarration.ts`, `docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md`

---

### [2026-04-17] LL-102: Contiguous Styled Fragments Must Collapse to One Logical Word

**Area:** EPUB extraction, renderer, selection mapping, narration
**Status:** active
**Priority:** high

**Context:** EPUB drop caps and inline emphasis can split one lexical word across multiple DOM nodes without any intervening whitespace. If extraction assigns one index per fragment, the same word acquires multiple identities and downstream consumers disagree about where the user is in the book.

**Guardrail:** Treat no-whitespace contiguous fragments as one logical token at extraction time. Preserve one stable token id and global word index across node boundaries, emit token-part metadata for rendering, and collapse click/selection/narration starts back to the stitched token's shared index before any consumer reads it. Only real whitespace should create a new word identity.

**Related:** EPUB-TOKEN-1 sprint, `src/utils/segmentWords.ts`, `src/utils/foliateHelpers.ts`, `src/components/FoliatePageView.tsx`, `src/utils/foliateWordOffsets.ts`

---

### [2026-04-17] LL-103: Startup Cache Warmup Must Share the Live Opening-Ramp Contract

**Area:** TTS, cache warmup, startup latency, evaluation
**Status:** active
**Priority:** high

**Context:** Cached starts felt different from uncached starts because background entry coverage jumped straight to cruise-sized chunks while live playback still ramped through `13 -> 26 -> 52 -> 104 -> 148`. The renderer cache helper also depended on a hidden caller contract: nonzero-start replay only stayed correct because the caller passed a tail-sliced word array.

**Guardrail:** Treat startup chunk shape as a shared contract, not two heuristics. Live generation and cache warmup must consume the same opening-ramp planner from the real start index, and cache replay helpers must accept full-word context plus explicit `startIdx` so exact nonzero-start reconstruction is self-defending.

**Pattern:** Verify startup parity at three layers: planner/unit coverage for the ramp sequence, cache tests for exact nonzero-start replay, and eval artifacts that record cached vs uncached start mode plus `openingChunkWordCounts`. Release evidence should show a real cached/uncached startup delta alongside `startupParity.openingRampMatches: true`.

**Related:** TTS-START-1 sprint, `src/utils/generationPipeline.ts`, `src/utils/backgroundCacher.ts`, `src/utils/ttsCache.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/hooks/useNarrationCaching.ts`, `docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md`

---

### [2026-04-18] LL-104: Flow-Surface Mode Guards Must Treat `narrate` and `flow` as the Same Foliate Load Surface

**Area:** reader modes, Foliate load lifecycle, compatibility boundaries
**Status:** active
**Priority:** high

**Context:** READER-4M-1 restored `narrate` to the shared `ReaderMode` / persisted mode contracts and moved the architecture toward a truthful four-mode model. The sprint initially left one stale branch in `ReaderContainer` Foliate `onLoad` handling: `mode !== "flow"` still sent `narrate` through the passive extraction/restore path, which reintroduced the same mid-load word-array/highlight churn the shared flow surface was supposed to avoid.

**Guardrail:** Once `narrate` is promoted into the shared mode contract, any Foliate or Flow lifecycle guard that distinguishes “flow-surface” vs “page/focus” behavior must branch on the surface semantics, not on the legacy literal `mode === "flow"` check. Use an explicit helper/boolean such as `isFlowSurfaceMode = mode === "flow" || mode === "narrate"` at the boundary, and keep old three-mode compatibility only at intentional handoff points.

**Pattern:** Add at least one regression whenever a hidden compatibility alias is removed or narrowed. The regression should lock the architectural seam that changed so future refactors cannot silently reintroduce a literal three-mode guard in a four-mode path.

**Related:** READER-4M-1 sprint, `src/components/ReaderContainer.tsx`, `src/hooks/useFlowScrollSync.ts`, `src/hooks/useReaderMode.ts`, `tests/narrationIntegration.test.ts`

---

### [2026-04-20] LL-105: Universal Mode Shortcuts Must Bypass Surface-Gated Keyboard Blocks

**Area:** reader modes, keyboard shortcuts, narrate
**Status:** active
**Priority:** medium

**Context:** READER-4M-2 remapped `N` to "enter Narrate paused from any mode." The keyboard handler in `useKeyboardShortcuts.ts` has per-surface gates (`if (isPage)`, `if (isFlow)`) that control which shortcuts fire. The universal N handler must be placed *above* these gates (in the unconditional section) so it fires from page, focus, flow, and narrate modes alike. Placing it inside the `if (isFlow)` block would silently drop it in page and focus modes.

**Guardrail:** Shortcuts that apply universally across all modes must live in the unconditional section of the keyboard handler, before any `if (isPage)` or `if (isFlow)` gates. The `isFlow` variable is `keyboardSurface === "flow"`, which is `true` for both "flow" and "narrate" modes — so it's not a reliable gate for "all modes."

**Related:** READER-4M-2 sprint, `src/hooks/useKeyboardShortcuts.ts`, `getReaderKeyboardModeSurface()`

---

### [2026-04-20] LL-106: Binary-Framed IPC Protocols Require a Three-Way Contract Between Main, Preload, and Types

**Area:** Platform/Main Process, IPC, preload bridge, TypeScript types
**Status:** active
**Priority:** high

**Context:** QWEN-STREAM-1 introduced a binary-framed PCM streaming protocol over `webContents.send("tts-qwen-stream-audio", streamId, chunk)`. The main process sends two positional args after the channel name. The preload wrapper must destructure both: `(_event, streamId, chunk) => callback(streamId, chunk)`. The TypeScript declaration must reflect what the renderer callback receives (not the raw ipcRendererEvent). All three layers were written separately and developed a three-way mismatch: main sent 2 args, preload forwarded 1, types promised 3.

**Guardrail:** When adding a new `ipcRenderer.on` / `webContents.send` channel, verify the contract at all three layers before merging: (1) how many positional args does `webContents.send` emit? (2) does the preload wrapper forward all of them (minus `_event`)? (3) does the TS declaration on `ElectronAPI` match what the renderer callback actually receives? Write this as a three-line check in the PR description.

**Related:** QWEN-STREAM-1 sprint, `main/ipc/tts.js:162`, `preload.js:186–190`, `src/types.ts` `onQwenStreamAudio` declaration.

---

### [2026-04-20] LL-107: Stdin Command Protocol Must Use Consistent Key Name Across Language Boundary

**Area:** Platform/Main Process, Python sidecar, IPC
**Status:** active
**Priority:** high

**Context:** QWEN-STREAM-1's JS engine manager sent commands as `{ id, command: "..." }` while the Python sidecar read `msg.get("cmd")`. Commands would silently not dispatch on a live sidecar. The mismatch was invisible in tests because tests mock the subprocess and assert stdin payloads with whatever key the JS code used.

**Guardrail:** When writing a cross-language IPC protocol, define the canonical field names in one place (a comment block or a small schema file) and reference it in both language implementations. For stdin/stdout sidecar protocols: always smoke-test the round-trip with a real subprocess before merging, even if mocked unit tests pass.

**Related:** QWEN-STREAM-1 sprint, `main/qwen-streaming-engine.js` (`dispatchCommand`), `scripts/qwen_streaming_sidecar.py` (`handle_command`).

---

### [2026-04-20] LL-108: Canonical Reader Anchors Must Be Mode-Aware, Preserve Zero, and Keep Spoken Truth Separate From Visual Drift

**Area:** reader modes, progress persistence, Foliate shared surface, narration truth
**Status:** active
**Priority:** high

**Context:** READER-4M-3 unified save/resume/mode switching around one canonical global word anchor. Two regressions were waiting behind the old per-mode shortcuts: explicit anchor `0` could be discarded because `highlightedWordIndex || softWordIndex` treated zero as falsy, and shared-surface rebuild/follower paths could re-anchor Narrate from visual state instead of the spoken cursor. That combination quietly breaks “restart at the first word” and lets the visible underline drift away from the audio truth.

**Guardrail:** Resolve anchors through one explicit mode-aware helper. `page` and `flow` may use the visible highlight anchor, `focus` must prefer the active focus cursor, and `narrate` must prefer the authoritative narration cursor. `0` is a valid explicit anchor and must never fall through to soft selection. Progress save, finish-reading, backtrack checks, and shared-surface section jumps should all consume the same canonical resolver instead of re-deriving mode-local positions.

**Pattern:** On the shared Foliate flow/narrate surface, keep spoken truth and visual fallback as separate channels. Narrate follow/highlight should consume `narration.cursorWordIndex`, while passive page/flow events remain visual-only. When dispatching section jumps from shared-surface truth callbacks, normalize navigation through `Promise.resolve(goToSection?.(...))` so real async Foliate APIs and sync test stubs share one safe path.

**Related:** READER-4M-3 sprint, `src/utils/startWordIndex.ts`, `src/components/ReaderContainer.tsx`, `src/hooks/useProgressTracker.ts`, `src/hooks/useReaderMode.ts`, `src/hooks/useFlowScrollSync.ts`

---

### [2026-04-20] LL-109: Streaming Strategy Must Guard async IIFE Against stop() Race

**Area:** TTS strategy, streaming, async IPC
**Status:** active
**Priority:** moderate

**Context:** QWEN-STREAM-2's `qwenStreamingStrategy.ts` implements `speakChunk()` as a `void` interface method that needs to call an async IPC. The pattern used is a self-invoking async IIFE. The unsubscribe handle returned by the frame-listener subscription is assigned inside the async block, after the IPC round-trip. If `stop()` fires during the IPC await, it executes before the handle is assigned and cannot unsubscribe the listener — creating a brief listener leak window.

**Guardrail:** When a TTS strategy's `speakChunk()` uses an async IIFE (to call async IPC from a void interface method), guard by checking a "stopped" sentinel boolean at the top of the async IIFE, immediately after the await, before assigning any listeners or side-effecting state. This is distinct from double-stop protection (handled by optional-chain guards on the unsubscribe handle itself). The sentinel must be set synchronously in `stop()` before any async cleanup.

**Pattern:**
```ts
let stopped = false;
stop() { stopped = true; unsubscribe?.(); }
speakChunk() {
  (async () => {
    await ipcCall();
    if (stopped) return; // guard here
    unsubscribe = subscribe(...);
  })();
}
```

**Related:** QWEN-STREAM-2 sprint, `src/hooks/narration/qwenStreamingStrategy.ts`. Flagged for hardening in QWEN-STREAM-3.

---

### [2026-04-20] LL-110: Stream-Finished Flush Wire Is Mandatory for Streaming TTS Strategies

**Area:** TTS strategy, streaming, IPC, narration pipeline
**Status:** active
**Priority:** high

**Context:** QWEN-STREAM-2 built the StreamAccumulator + streaming strategy but omitted the mechanism to call acc.flush() when the sidecar finishes generating audio. The omission meant onStreamEnd() never fired, scheduler.markPipelineDone() was never called, and narration completion never triggered. Every streaming session hung at chapter end.

**Rule PR-110:** Any TTS strategy using a StreamAccumulator MUST wire a "stream finished" signal from the main process to the renderer and call acc.flush() on receipt. The signal must be engine-specific and stream-ID-guarded.

**Pattern:** Main process emits tts-[engine]-stream-finished → preload bridges as onQwenStreamFinished → strategy subscribes alongside onQwenStreamAudio → calls acc.flush() on matching streamId → flush() triggers onStreamEnd → markPipelineDone() → onEnd.

**Fixed in:** QWEN-STREAM-3 (v1.74.0). Found by Plato review.

---

### [2026-04-21] LL-111: Eval Runner Manifest Must Gate Streaming Scenarios from Non-Streaming Paths

**Area:** TTS eval runner, scenario manifest, streaming
**Status:** active
**Priority:** medium

**Context:** QWEN-STREAM-4 discovered that streaming scenarios in the eval manifest use inline `text` instead of `fixtureId`. Any code path that calls `executeMatrix()` without pre-filtering streaming scenarios will crash when it tries to look up a fixture file using an undefined `fixtureId`.

**Rule PR-111:** Any call to `executeMatrix()` (or any matrix-mode eval path) MUST pre-filter streaming scenarios before passing the scenario list. Streaming scenarios are identifiable by `engine === "qwen-streaming"` or by the absence of a `fixtureId` field.

**Pattern:** `scenarios.filter(s => s.engine !== "qwen-streaming" && s.fixtureId != null)` — apply this guard at the entry point of any non-streaming matrix execution path.

**Fixed in:** QWEN-STREAM-4 (v1.75.0) — `scripts/tts_eval_runner.mjs` now filters streaming scenarios out of the `--matrix` (non-streaming) path.

---

### [2026-05-04] LL-112: Opt-In TTS Engines Need Isolated Surfaces Until a Shared Contract Proves Itself

**Area:** TTS, sidecars, IPC, settings UX, product governance
**Status:** active
**Priority:** high

**Context:** POCKET-TTS-1 added Pocket TTS after Kokoro and MOSS-Nano with strict guardrails: no comparative gate, no MOSS-Nano productization changes, no Kokoro default change, no Qwen reactivation, and no public v2.0 voice-cloning UX. The safest path was to mirror Nano's sidecar/engine/strategy shape while keeping Pocket on engine-specific IPC and settings surfaces. Extracting a generalized adapter at the same time would have mixed product posture work with architecture work.

**Guardrail:** When adding a new opt-in TTS engine, isolate the sidecar, engine wrapper, IPC/preload channels, renderer strategy, and settings status component first. Only extract shared abstractions after two real engine paths prove identical behavior and regression tests define the shared boundary. Product-posture regressions must be tested alongside feature tests: default engine, recommended opt-in labels, disabled engines, and no silent fallback.

**Related:** POCKET-TTS-1 sprint, `main/pocket-tts-engine.js`, `main/pocket-tts-sidecar.js`, `scripts/pocket_tts_sidecar.py`, `src/hooks/narration/pocketTtsStrategy.ts`, `src/components/settings/TtsEngineSelector.tsx`, `tests/ttsSettingsPocketTts.test.tsx`.

---

### [2026-05-12] LL-113: Test Discovery Must Ignore Scratch External Source Trees

**Area:** Tests, repository hygiene, external audits
**Status:** active
**Priority:** medium

**Context:** During TTS-REGISTRY-1 closeout, plain `npm test` failed before reaching project tests because Vitest discovered copied external review sources under `.tmp/tts-review-sources-20260511/readest-main/`. Those sources had their own TypeScript/Vitest assumptions and missing dependencies, so project verification was polluted by scratch audit material.

**Guardrail:** Scratch and external-source mirrors belong under `.tmp/`, and `.tmp/**` must be excluded from test discovery. Do not place third-party audit sources, cloned candidates, or large review mirrors in paths that Vitest can walk as project tests. If a sprint needs fixture copies from outside the repo, promote only the minimal fixture files into a named `tests/fixtures/` folder.

**Related:** TTS-REGISTRY-1 closeout, `.gitignore`, `vite.config.js`, `.tmp/tts-review-sources-20260511/`.

---

### [2026-05-13] LL-114: Spoken Normalization Must Not Become Display Truth

**Area:** TTS, segment normalization, cache identity, highlight mapping
**Status:** active
**Priority:** high

**Context:** TTS-NORMALIZE-1 made Kokoro consume normalized spoken text (`src/utils/segmentNormalizer.ts`) while the narration scheduler and display/highlight layers still consume original chunk words. The same sprint also made cache identity chunk-local by including normalizer version plus source/normalized text hash pair.

**Guardrail:** Treat normalized text as engine input only. Do not replace scheduler/display word arrays, Foliate word anchors, or highlight mapping with normalized text. When normalization changes spoken text, cache identity must include normalizer version and source/normalized hashes so changed rules miss lazily rather than triggering a destructive global cache wipe.

**Related:** TTS-NORMALIZE-1, `src/utils/segmentNormalizer.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/utils/generationPipeline.ts`, `tests/segmentNormalizer.test.ts`, `tests/kokoroStrategy.test.ts`.

---

### [2026-05-13] LL-115: Cache Identity Must Be Data, Not a Path

**Area:** TTS, disk cache, timing metadata, storage migration
**Status:** active
**Priority:** high

**Context:** TTS-CACHE-TIMING-1 replaced slash-composed Kokoro cache identity strings with schema-versioned v2 identity objects. The old path-shaped identity was easy to extend but unsafe: provider, normalization, rate, and timing truth became implicit directory fragments instead of durable data.

**Guardrail:** TTS cache identity must be structured data first and path material second. Keep all semantic fields in the manifest identity, derive disk directories from safe hashes, and invalidate by schema/normalizer/content fields through lazy misses rather than destructive global cleanup. Timing sidecars must be written atomically and may only return word timestamps when the timing classification is trusted.

**Related:** TTS-CACHE-TIMING-1, `main/tts-cache.js`, `src/types/ttsCache.ts`, `src/utils/ttsCache.ts`, `tests/ttsCacheStructuredKeys.test.js`, `tests/ttsTimingSidecars.test.js`.

### [2026-05-15] LL-116: Audit Packaging Must Include Complete Canonical Files

**Area:** governance, audit process, documentation
**Status:** active
**Priority:** medium

**Context:** OutsideAudit.1 (2026-05-15) — the full TTS Architecture roadmap audit. `ROADMAP.md` at 60KB exceeded the auditor's ingestion limit and was truncated mid-sprint in the delivered zip. The auditor had to reconstruct later sprint specs from secondary documents (close-outs, sprint queue), which introduced reconstruction artifacts and reduced audit precision for sprints 5-8.

**Guardrail:** When assembling audit packages, verify that every file claimed as "full spec" in the orientation document is actually complete in the delivered zip. For files >50KB: either split across batches with continuation markers, or use the GitHub repo / single-directory ingestion path. This is a governance discipline issue, not a technical one — the file was complete on disk; the packaging step failed to verify delivery integrity.

**Related:** OutsideAudit.1.2026-05-15, `docs/studies/audit/OutsideAudit.1.2026-05-15/`, 3rd-party-audit skill §Upload & File Constraints.

---

### [2026-05-16] LL-117: Directory Reorgs Need a Forbidden-Scope Reference Decision Up Front

**Area:** governance, repository hygiene, verification
**Status:** active
**Priority:** medium

**Context:** SK-HYG-2 reorganized documentation paths without runtime/test/script edits. The docs surface could be normalized cleanly, but final verification exposed stale old-path references in forbidden-scope files (`tests/artifactHygienePolicy.test.ts`, `scripts/qwen_streaming_sidecar.py`, `scripts/tts_engine_scan_index.mjs`, and IDE metadata) plus binary audit packages. The test suite reached 2,640 passing tests but failed one suite because a test fixture still opened the old release-checklist path.

**Guardrail:** Any future directory-reorganization sprint must decide before dispatch whether references in tests, scripts, IDE metadata, and binary packages are in scope. If they are out of scope, the success criteria must explicitly exempt them and define a follow-up. If they are in scope, include those file families in the allowed edit surface and verification plan.

**Related:** SK-HYG-2, `docs/planning/SK-HYG-2-DISPATCH.md`, `tests/artifactHygienePolicy.test.ts`, `scripts/qwen_streaming_sidecar.py`, `scripts/tts_engine_scan_index.mjs`.

---

### [2026-05-17] LL-118: Audit Packages Must Trace Imports Bottom-Up, Not Just Features Top-Down

**Area:** governance, audit process, TTS pipeline
**Status:** active
**Priority:** medium

**Context:** OutsideAudit.9 (2026-05-17) scored 7/10 partly because `wordPositionIndex.ts` and `main/constants.js` were omitted from the audit package. The inventory was built top-down from feature areas ("narration hooks," "pipeline utilities") rather than bottom-up from import graphs. Files that are imported by included source but don't live in the obvious feature directory get missed.

**Guardrail:** Before finalizing any audit package, run an import-trace pass: for every included `.ts`/`.js` source file, verify that its direct imports (excluding node_modules) are also included in the package. Missing imports are packaging errors that cost free audit points. This takes ~5 minutes and should be a checklist item in the 3rd-party-audit skill's Step 1.

**Related:** OutsideAudit.9, `AuditDecisions.9.2026-05-17.md`, `src/utils/wordPositionIndex.ts`, `main/constants.js`.

---

### [2026-05-19] LL-119: Non-Memoized Hook Return Objects Create Unstable Function Identities That Cause Render Loops

**Area:** React hooks, performance, narration
**Status:** active
**Priority:** high

**Context:** `useNarration` returns a plain object literal (`return { ... }`) with inline function definitions. Every render produces new function identities. When `useNarrationSync`'s MediaSession effect listed `narration.setMediaSessionBook` as a dependency, the unstable identity caused the effect to re-run every render, its `setMediaSessionBookState(newObject)` triggered another render, and an infinite loop ensued (300+/sec "Maximum update depth exceeded"). The bug was latent until NARR-MEDIA-1 added the MediaSession effect.

**Root Cause:** Inline functions in non-memoized return objects have unstable identity. Any downstream `useEffect` or `useCallback` that depends on them will re-fire every render. If that re-fire triggers state, infinite loop.

**Fix:** Wrap `setMediaSessionBook` in `useCallback([], [])` before the return statement. The function identity is now stable across re-renders.

**Guardrail:** When adding a function to a hook's return object that will be consumed by a `useEffect` dependency array, wrap it in `useCallback`. If the hook returns a non-memoized object literal (like `useNarration`), every function inside it is unstable unless individually memoized. Prefer `useCallback` over `useMemo` for function-shaped values.

**Related:** `src/hooks/useNarration.ts`, `src/hooks/useNarrationSync.ts`, NARR-MEDIA-1, FLOW-ZONE-AUTO, `tests/useNarrationMount.test.tsx`.

---

### [2026-05-21] LL-120: Shared Foliate Surfaces Need Explicit Visual Ownership per Mode

**Area:** reader modes, shared surface, visual sync
**Status:** active
**Priority:** high

**Context:** Flow and Narrate run on the same Foliate-rendered surface. Reusing one cursor class and one chunk-visual gate caused cross-mode bleed: hidden/ghost cursors, stale highlights, and mode switching regressions where fixing one mode broke the other.

**Guardrail:** On shared surfaces, every mode gets explicit visual ownership contracts: separate cursor classes, separate visual-state gates, and mode-specific highlight policy. Do not treat "shared surface" as "shared style classes."

**Pattern:** Keep explicit style lanes (example: `page-word--flow-cursor` vs `page-word--narrate-cursor`) and gate expensive mode visuals (`chunk-visual`) by mode, not by "any visual state present."

**Related:** `src/components/FoliatePageView.tsx`, `src/utils/foliateWordHighlight.ts`, `src/utils/foliateStyles.ts`, `tests/foliateWordHighlight.test.ts`, `tests/foliate-bridge.test.ts`.

---

### [2026-05-21] LL-121: Compatibility Mode Aliases Are Hazardous in Runtime Hooks

**Area:** reader modes, hook contracts, regressions
**Status:** active
**Priority:** high

**Context:** A compatibility mapping (`narrate -> flow`) in runtime hooks masked mode boundaries and created accidental coupling. Flow-only control loops ran during Narrate and vice versa, making regressions hard to isolate.

**Guardrail:** Use true runtime mode (`readingMode`) for behavior hooks. Restrict compatibility aliases to intentionally narrow integration points (legacy UI state, migration layers), never control loops.

**Pattern:** If a hook drives mode-specific behavior (scroll engine, cursor motion, auto-follow), pass canonical mode values and branch explicitly.

**Related:** `src/components/ReaderContainer.tsx`, `src/hooks/useFlowScrollSync.ts`, `src/hooks/useReaderMode.ts`, `src/hooks/useReadingModeInstance.ts`.

---

### [2026-05-21] LL-122: "No Mid-Sentence Breaks" Must Be Enforced in Chunk Planner, Not UI Settings

**Area:** prosody, chunk planning, narration pipeline
**Status:** active
**Priority:** high

**Context:** Prosody quality degraded when planner fallback paths still split on comma/soft-max/hard-max boundaries mid-sentence. UI toggles cannot reliably enforce semantic sentence boundaries because break decisions are made in planner internals.

**Guardrail:** Sentence-end policy must live in chunk planning logic. If no sentence boundary exists inside the target window, extend search (within safety limits) before falling back; never silently reintroduce comma-first or soft-max split heuristics for narration mode.

**Pattern:** Preserve "hard break at sentence end" as a pipeline invariant and lock it with tests that fail on comma-only splits.

**Related:** `src/hooks/useNarration.ts`, `src/utils/naturalChunks.ts`, `tests/naturalChunks.test.ts`.

---

### [2026-05-21] LL-123: Prosody Normalization Rules Must Respect Semantic Domains

**Area:** TTS normalization, text semantics, cache identity
**Status:** active
**Priority:** high

**Context:** Adding vernacular year reading improved narration ("1989" -> "nineteen eighty nine"), but applying year-like expansion uniformly produced domain errors in currency (`$1,250` read as "twelve fifty"). Similar risk exists across dates, times, ranges, and finance tokens.

**Guardrail:** Normalization transforms must be domain-aware and ordered deliberately. Year-style cardinal behavior should not leak into currency expansion. Every new transform needs a negative test for adjacent semantic domains.

**Pattern:** Add focused fixtures for grouped numbers, decades, compact times, and grouped currency in the same suite to catch cross-domain regressions early.

**Related:** `src/utils/segmentNormalizer.ts`, `tests/segmentNormalizer.test.ts`, `src/constants.ts` (`TTS_NORMALIZER_VERSION`).

---

### [2026-05-21] LL-124: Audio/Visual Sync Calibration Must Use End-to-End Output Reality, Not API Partials

**Area:** narration timing, scheduler, audio output latency
**Status:** active
**Priority:** high

**Context:** `getOutputTimestamp().contextTime` underreported practical output delay on Windows/Electron relative to what users actually hear. Cursor timing looked mathematically "on time" but perceptually ran ahead over long playback because Chromium/WASAPI/DAC buffering exceeded reported values.

**Guardrail:** Treat sync lag as an end-to-end calibration problem. Instrument boundary drift and validate against audible output over long passages before trusting low-level timing APIs as complete truth.

**Pattern:** Use conservative trusted lag defaults plus diagnostics, then tune via real playback evidence. Optimize with equal-power crossfades and segment-duration tuning to reduce seam artifacts without sacrificing correction responsiveness.

**Related:** `src/utils/audioScheduler.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/constants.ts`, `tests/kokoroStrategyRateContinuity.test.ts`.

---

### [2026-05-21] LL-125: Narrate Must Stay Audio-Owned Even When Flow Shares Its Surface

**Area:** reader modes, narration ownership, Foliate surface
**Status:** active
**Priority:** critical

**Context:** SRL-047 correctly made Foliate Flow a single-pacer mode, but the shared `startFlow(...)` helper also carried Narrate startup options. A delayed Foliate word-extraction retry could drop `{ targetMode: "narrate", resumeNarration: true }` and restart with Flow defaults, making Narrate appear to regress even though the Flow change was nominally scoped.

**Guardrail:** Treat "shared Foliate surface" and "shared runtime owner" as different concepts. Flow may own `FlowScrollEngine`; Narrate must remain owned by TTS/audio truth-sync. Any retry, section handoff, mode switch, or delayed extraction path must preserve Narrate intent and exact selected-word startup.

**Pattern:** When a shared helper accepts mode-specific options, retry by passing the original options through unchanged. Lock this with tests that start Narrate after delayed Foliate extraction, hard-select a nonzero word, and assert `narration.startCursorDriven(words, selectedWord, ...)`.

**Related:** `src/hooks/useReaderMode.ts`, `src/hooks/useFlowScrollSync.ts`, `src/components/ReaderContainer.tsx`, `tests/useReaderMode.test.ts`, `docs/governance/TECHNICAL_REFERENCE.md`.

---

### [2026-05-24] LL-126: Narrate Synthesis Continuity Must Use Produced-Content Truth, Not the Cursor Twin

**Area:** narration, audio scheduler, cursor sync
**Status:** active
**Priority:** critical

**Context:** At Narrate chunk re-entry (section handoff, stall, pause/resume), `speakNextChunkKokoro` seeded the next chunk from `lastConfirmedAudioWordRef`. Despite its name and the TTS-7R/BUG-145c intent ("decouple synthesis from `cursorWordIndex`"), that ref is written in the same boundary callback that advances the visual cursor — so it is the cursor's twin, not independent audio truth. When the cursor leads the heard audio (the open-loop schedule drift, Bug 1), synthesis restarts from the led position and the words between the previous chunk's real audio end and the cursor are never spoken. Step 3.6 (`816bff7`) introduced `nextGenWordIndexRef` (produced-end) and seeded continuation from it, which made *generation* contiguous — but manual QA FAILED: the audio still skipped a line, because the pipeline prefetches the whole book (`drift ≈ −227s`) so the produced-end is also AHEAD of the heard audio. This proved Bug 2 (content omission) is not separable from Bug 1 (cursor lead): every available reference is ahead-of-heard. The durable fix is deferred post-isolation (`NARRATE-CLOSED-LOOP-CURSOR`): seed from the real playing-source heard position, not the cursor, the boundary-twin, or the produced-end.

**Guardrail (corrected after Step 3.6 QA):** There are FOUR distinct quantities and only ONE may seed audible playback continuation: (i) the **visual cursor** (`cursorWordIndex`, boundary-driven, ahead-of-heard); (ii) `lastConfirmedAudioWordRef` (a boundary-driven twin, ahead-of-heard); (iii) `nextGenWordIndexRef` (**produced-end**, ahead-of-heard because the book is prefetched); (iv) the **real playing-source heard position** (derivable from `getPlayingSourceMaxWordIndex` / the active source whose `startTime ≤ now < endTime`). (i), (ii), and (iii) are ALL ahead of what the listener has heard, so seeding playback re-entry from any of them drops content. **Only (iv) may seed re-entry/continuation, and (iv) must also drive the visual cursor.** A "decouple from the cursor" change is only real if the replacement signal is the actually-heard position — not the cursor, its boundary-twin, or the generation/prefetch frontier.

**PROMOTED STANDING RULE (from SRL-070, second occurrence with SRL-060):** Narrate / cursor-audio sync QA gates require an **audio-independent ground truth** — Evan's ear, or a non-self-referential instrument such as the `scheduleChunk` schedule-vs-wallclock drift log (`ctx.currentTime − chunkStartTime`). Scheduler-derived metrics (boundary drift, `scroll-follow` word, handoff `lastConfirmedWordIndex`) are computed from the same predicted timeline and CANNOT detect a schedule-vs-audio offset; they are not sync evidence. The ~9ms boundary-drift reading masked S13 across four repair rounds (3.2–3.5).

**Related:** `src/hooks/useNarration.ts` (`speakNextChunkKokoro`, boundary callback, `resyncToCursor`, `updateWords`), `src/utils/generationPipeline.ts` (`nextProduceIdx`, `onChunkProduced`), `src/utils/audioScheduler.ts` (`scheduleChunk` drift log), `tests/narrationPipelineIntegration.test.ts`, `tests/narrationContinuity.test.ts`. Post-isolation follow-up: `NARRATE-CLOSED-LOOP-CURSOR` (Bug 1, the open-loop cursor lead itself).

---

### [2026-05-31] LL-127: No Instrumented Cursor Signal Sits On the Heard Word — `heardFloor` Is a Mislabeled Twin of `schedulerActiveWord`

**Area:** narration, cursor sync, diagnostics
**Status:** active
**Priority:** critical

**Context:** NARRATE-CURSOR-TRACKING-DIAG-1 ran a live-QA trace (Meditations, `DIAG=true` in `useNarration.ts` + `audioScheduler.ts`, n=191 and n=716 `signal-leadlag-summary` samples, each paired with Evan's ear per SRL-070). Measured lead/lag vs `schedulerActiveWord` (baseline 0): **`heardFloor` = min 0 / median 0 / max 0 in BOTH runs** — i.e. it is *identical* to `schedulerActiveWord`. `wordIndex` (the visible word-advance cursor) = median −2 to −4 (range −11..0), always behind the leading edge, never ahead. `nextGenWordIndex` (generation/pre-fetch frontier) = median +913 to +1369, max +2351. `resumeTarget` and `subscriberCursor` were **`no-data`** during steady playback. Crucially, Evan's ear placed the heard word **behind even `wordIndex`** ("highlight ahead of voice", worsening to "running way ahead" by n≈700) — so the *entire* instrumented cluster leads the heard audio, and the lead grows.

**Guardrail:** `heardFloor`, despite its name, is **NOT** a lower bound of heard audio — in this build it reads identically to `schedulerActiveWord` and leads the ear exactly as much. Do not use `heardFloor` (or `schedulerActiveWord`) as heard-audio ground truth or as a cursor/seed authority. The only signal close to the heard word is `wordIndex`, and it must be **lag-compensated** by the output-pipeline latency (`TTS_TRUSTED_CURSOR_LAG_MS` ≈ 350ms WASAPI) before it sits on the heard word; raw it still leads. `nextGenWordIndex` is the prefetch frontier and must NEVER seed position — a single mid-playback WPM change reseeds toward it and skips the narration forward through chapters with no `word-advance` events (confirms the A5/APPLYRATECHANGE reseed-from-frontier defect). View-follow is a passive follower: manual scroll detaches it (cursor stays coupled to audio, parked off-screen; "Return to reading" re-attaches) and it does not pull the cursor ahead. This is the live, cross-signal confirmation of LL-126's "every available reference is ahead-of-heard" — extended with the ranked evidence and the specific `heardFloor`-is-a-twin finding.

**Applied to:** NARRATE-SUBSCRIBER-CURSOR-1 amended to publish a lag-compensated heard cursor (not `schedulerActiveWord`/`heardFloor`/`nextGenWordIndex`) and to re-trace the `subscriberCursor` channel after wiring (it was `no-data`). Feeds NARRATE-A5-RATE-RESEED-1 and NARRATE-APPLYRATECHANGE-COLLAPSE-1 (frontier-reseed skip).

**Related:** `docs/studies/investigations/NARRATE-CURSOR-TRACKING-DIAG-1.md` (signal map + ranked accuracy + authority verdict), `src/hooks/useNarration.ts` (`DIAG`/`diag()`, word-advance payload), `src/utils/audioScheduler.ts` (`DIAG`/`schedDiag()`, `getPlayingSourceMaxWordIndex`), LL-126, SRL-070.

---

## Spec Retrospective Lessons (SRL Series)

> **Merged here from `docs/governance/close-outs/SpecRetro.Lessons_Learned.md` on 2026-07-02** as part of a governance-hygiene consolidation (single source of truth). This section is the canonical home of the SRL (Spec Retrospective Lessons) series; new SRL entries are added here. The LL-series entries above and this SRL series cross-reference each other freely.

Running log of workflow and dispatch-spec lessons from phase close-outs. When the same pattern appears twice, promote it to a standing rule in the appropriate governance document (typically ROADMAP.md “Standing Rules All Skeletons Inherit”).

### SRL-001 — Quality review pays for itself in coverage sprints (TEST-COV-1, 2026-04-16)
**Verdict:** The quality-review layer materially improved the final sprint outcome. This was not redundant verification; it surfaced the most important defect discovered during the sprint.
**Evidence:** `plato` found the missing forced-refresh handling on 401 across Google and OneDrive paths, plus missing URL-scheme regression coverage, after implementation and first compliance review had already passed.
**Recommendation:** Keep a dedicated quality-review pass mandatory for Full-tier coverage/security sprints, even when the implementation is already test-heavy.
**Applies to:** Full-tier coverage, security, and hardening sprints
**Status:** Observation

### SRL-002 — Re-verification prompts need tighter fences after follow-up fixes (TEST-COV-1, 2026-04-16)
**Verdict:** The sprint spec was precise overall, but the first re-verification pass drifted when the prompt was not narrowly bounded to the changed surfaces.
**Evidence:** The first Solon rerun wandered into an unrelated roadmap section and had to be discarded, then rerun with a tighter prompt focused on the follow-up fixes.
**Recommendation:** After review-driven follow-up fixes, explicitly fence compliance reruns to the touched files, changed behaviors, and affected success criteria instead of restating the full sprint.
**Applies to:** Any sprint with follow-up fixes between first verification and final closeout
**Status:** Observation

### SRL-003 — Layered verification is high-yield for critical-path sprinting (TEST-COV-1, 2026-04-16)
**Verdict:** This sprint had strong discovery yield because implementation, compliance, and quality review each exposed different classes of issues.
**Evidence:** The sprint finished with 75 new tests and a green suite/build, but still surfaced a real auth/cloud defect only during the quality-review layer. The resulting fix and regression tests materially improved the final state.
**Recommendation:** Preserve implementation -> verification -> quality-review sequencing for high-risk critical-path sprints rather than collapsing review into a single validation pass.
**Applies to:** Critical-path hardening, auth/cloud, and regression-coverage sprints
**Status:** Observation

### SRL-004 — Non-blocking build warnings should be dispositioned explicitly at closeout (TEST-COV-1, 2026-04-16)
**Verdict:** Leaving a known warning unnamed at closeout creates ambiguity about whether it is accepted debt or a missed defect.
**Evidence:** The `settings -> tts -> settings` circular chunk warning remained present after a green build. It was not a blocker, but it still required an explicit `Defer` call to avoid closeout ambiguity.
**Recommendation:** Require closeout reports to classify lingering build warnings explicitly as `Defer`, `Fix Now`, or `Log` so they do not become background noise.
**Applies to:** Build-producing sprints with non-blocking warnings
**Status:** Observation

### SRL-005 — Architectural pivot sprints benefit from explicit foundation/consolidation splitting (NARR-LAYER-1A, 2026-04-16)
**Verdict:** Splitting the narration-layer migration into a foundation sprint before the cleanup sprint appears to have reduced implementation risk without stalling progress.
**Evidence:** `NARR-LAYER-1A` landed follower mode, state plumbing, UI integration, and overlay suppression while keeping backward compatibility intact. The summary indicates `NARR-LAYER-1B` can now focus on deletion and consolidation rather than simultaneous foundation work.
**Recommendation:** For major runtime architecture pivots, prefer a two-step sequence of foundation first and removal second instead of combining both in one sprint.
**Applies to:** Architectural migration sprints that replace a legacy runtime path
**Status:** Observation

### SRL-006 — Focused engine-plus-integration coverage is the right shape for UI architecture sprints (NARR-LAYER-1A, 2026-04-16)
**Verdict:** The sprint summary suggests the new test mix was well targeted: low-level engine behavior, state plumbing, and UI integration were all covered without requiring a giant end-to-end harness.
**Evidence:** The new `tests/narrationLayer.test.ts` covered FlowScrollEngine follower mode, flow-sync wiring, ReaderContainer state plumbing, bottom-bar behavior, overlay suppression, and keyboard handling, while the full suite and build remained green.
**Recommendation:** For UI/runtime architecture sprints, default to one focused cross-layer regression file that combines engine assertions, state wiring checks, and visible control-surface behavior instead of scattering all new coverage into isolated micro-suites.
**Applies to:** UI architecture and state-machine migration sprints
**Status:** Observation

### SRL-007 — Dirty worktree constraints should be surfaced as execution setup, not hidden branch drift (NARR-LAYER-1A, 2026-04-16)
**Verdict:** The sprint itself stayed on-plan, but execution had to diverge from the nominal sprint branch because the repo already contained unrelated local changes.
**Evidence:** The run was blocked on repo state rather than the code plan, and the chosen safe path was to execute on the current branch while leaving unrelated local changes untouched and unstaged.
**Recommendation:** When a sprint spec targets a dedicated branch but the worktree is already dirty, force an explicit execution-choice checkpoint up front: stay on current branch, stop for cleanup, or confirm safe branch switch.
**Applies to:** Any sprint executed in a dirty repo state
**Status:** Observation

### SRL-008 — Deletion-heavy consolidation sprints need dedicated migration + contract tests (NARR-LAYER-1B, 2026-04-16)
**Verdict:** The consolidation was stable because migration and contract coverage were treated as first-class work, not post-cleanup extras.
**Evidence:** `NARR-LAYER-1B` removed narration mode surfaces and `NarrateMode.ts`, added a schema migration (`7 -> 8`) for narration-mode settings, and introduced `tests/narrLayer1bConsolidation.test.ts` with 25 targeted checks while preserving green full-suite/build verification.
**Recommendation:** For deletion-heavy architecture consolidations, require an explicit migration task and a dedicated contract/regression test file in the same sprint.
**Applies to:** Runtime consolidation sprints that remove mode values, branches, or legacy classes
**Status:** Observation

### SRL-009 — Keep mode-removal work and evaluation harness work sequenced, not fully concurrent (NARR-LAYER-1B, 2026-04-16)
**Verdict:** Consolidating the mode architecture first reduces measurement noise for later evaluation work.
**Evidence:** `NARR-LAYER-1B` removed the standalone narration path and normalized runtime ownership before `TTS-EVAL-1` instrumentation begins, reducing the chance that harness data is polluted by dual-path behavior.
**Recommendation:** When a sprint removes legacy runtime paths and the next sprint adds evaluation instrumentation, sequence consolidation first and run harness integration after merge; parallelize only fixture/docs/scaffolding.
**Applies to:** Back-to-back runtime consolidation + evaluation-harness sprint pairs
**Status:** Observation

### SRL-010 — Sprints exceeding 40 tool calls should be pre-split into waves at spec time (READER-4M-2, 2026-04-20)
**Verdict:** Tool-count policy violation. The sprint used 152 tool calls against a 40-use ceiling, but completed cleanly because task complexity was individually low.
**Evidence:** 9 tasks across implement/test/verify/docs/git consumed 152 tool calls total. Wave A (implement + test: tasks 1-5) would have been ~60 calls; Wave B (verify + docs + git: tasks 6-9) ~90 calls.
**Recommendation:** Add a `Budget` section to sprint specs with estimated tool uses and token budget. When estimated total exceeds 80 (2x the 40-ceiling), pre-split into waves at spec time.
**Applies to:** All sprints with ≥5 tasks
**Second occurrence:** QWEN-STREAM-1 (2026-04-20) — 216 tool calls, ~838k tokens, 14 tasks (including 2 unplanned). See SRL-014.
**Status:** Promoted → CLAUDE.md "Dispatch sizing" standing rule.

### SRL-011 — Verify/fix tasks with low fix probability should start at sonnet, not opus (READER-4M-2, 2026-04-20)
**Verdict:** Over-effort. A read-only opus pass confirmed no change was needed — a sonnet check would have produced the same result at ~40% of the token cost.
**Evidence:** Task 3 (pause/resume verification) used 19 opus-tier Athena tool calls and ~68k tokens to confirm that pause-stays-in-mode already worked from prior sprints.
**Recommendation:** When a task says "verify X works, fix if not" and prior sprints already implemented X, dispatch a sonnet-tier read-only check first.
**Applies to:** Any verify/fix task where the fix probability is low based on prior sprint history
**Status:** Observation

### SRL-012 — Parallelize read-only verification tasks (Solon + Plato) in sprint specs (READER-4M-2, 2026-04-20)
**Verdict:** Missed parallelization opportunity. Spec compliance and quality review are both read-only passes; running them sequentially added ~90s with zero benefit.
**Evidence:** Tasks 6 (Solon, 13 calls, ~65k) and 7 (Plato, 13 calls, ~79k) ran sequentially. Neither writes files.
**Recommendation:** In sprint task tables, mark Solon and Plato as parallel-eligible. Default: `Tasks N, N+1 (Solon + Plato) — parallel, both read-only`.
**Applies to:** All Full-tier sprints with both spec-compliance and quality-review tasks
**Second occurrence:** QWEN-STREAM-2 (2026-04-20) — spec marked Solon + Plato as parallel, CLI executed them in parallel, saved ~65s. Validates the recommendation.
**Status:** Promoted → CLAUDE.md "Spec-compliance review before quality review" standing rule. Addition: "For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible in the execution sequence. Both are read-only — sequential execution wastes time with zero benefit."

### SRL-013 — Cross-language IPC sprints need a Contract Concordance table (QWEN-STREAM-1, 2026-04-20)
**Verdict:** All three discovered integration bugs were key-name or payload-shape mismatches across the Python↔JS↔TypeScript boundary that a single concordance table would have caught at spec time.
**Evidence:** Python sidecar used "cmd" but JS expected "command." Preload bridge payload shape disagreed with TypeScript interface. Both caught by quality review post-implementation, costing 59 tool calls and ~179k tokens in discovery+fix.
**Recommendation:** For sprints creating new IPC channels spanning Python, JS, and TypeScript, add a "Contract Concordance" section to the spec.
**Applies to:** All cross-language protocol/IPC sprints
**Status:** Observation

### SRL-014 — Cross-language protocol sprints need aggressive wave-splitting and fix-up task budgets (QWEN-STREAM-1, 2026-04-20)
**Verdict:** Second occurrence of tool-count ceiling violation. Cross-language sprints compound the issue because unplanned fix-up tasks from contract mismatches add 40-60 tool calls beyond the original plan.
**Evidence:** QWEN-STREAM-1 planned 12 tasks but executed 14 (2 unplanned fix-ups from cross-language defects). 216 total tool calls. A 3-wave split would have stayed within ceiling per wave.
**Recommendation:** Cross-language protocol sprints should (a) pre-split into 3 waves at spec time, (b) budget one fix-up task slot, and (c) include the Contract Concordance table (SRL-013).
**Applies to:** All sprints creating new cross-language IPC/protocol channels
**Status:** Observation (but SRL-010, the parent pattern, is now promoted)

### SRL-015 — Prescribe app-access patterns for IPC handler tasks dispatched to Hermes (QWEN-STREAM-1, 2026-04-20)
**Verdict:** Hermes spent 2.5x expected tool calls discovering the context-object/app-access pattern at runtime.
**Evidence:** Task 4 (IPC handlers, haiku) used 25 tool calls vs. expected ~10. Fix required an additional opus-tier unplanned task (9b, 14 calls).
**Recommendation:** When dispatching Hermes to write new IPC handlers, include the exact module access pattern as a prescribed code snippet.
**Applies to:** Any Hermes-tier IPC handler task in Electron main process
**Status:** Observation

### SRL-016 — Sprint specs should use imperative git language to prevent CLI from skipping close-out (READER-4M-3, 2026-04-20)
**Verdict:** Ambiguous git instructions led CLI to leave the worktree uncommitted/unmerged.
**Evidence:** READER-4M-3 completed all implementation and verification tasks but left the repo with uncommitted changes.
**Recommendation:** Git close-out tasks in sprint specs should use imperative language: "Stage these files. Commit with this message. Merge to main with --no-ff. Push."
**Applies to:** All sprint specs with git close-out tasks
**Status:** Observation

### SRL-017 — Require detailed utilization reporting in CLI close-out summaries (READER-4M-3, 2026-04-20)
**Verdict:** Compact summary format made retrospective analysis shallow — no token counts, no per-task tool-call breakdown, no runtime.
**Evidence:** READER-4M-3 close-out used a compact format that omitted runtime, token usage, and per-agent utilization. Prior close-outs provided full agent utilization tables.
**Recommendation:** Sprint specs should mandate the full close-out format (runtime, token count, per-task tool calls, agent utilization table) in the reporting task.
**Applies to:** All sprint close-out / reporting tasks
**Status:** Observation

### SRL-018 — Tool-call budgets should account for investigative reads, not just file creates (QWEN-STREAM-2, 2026-04-20)
**Verdict:** Budget underestimate. Spec estimated ~65 tool calls; actual was ~185. Sprint completed cleanly in 20 minutes (operationally harmless), but the budget formula was wrong.
**Evidence:** The CLAUDE.md formula "1 tool use per file read, 1-2 per file write" doesn't capture that agents read 5-7 context files before each write. Task 6 used 19 tools for ~15 lines of edits (investigating insertion point in useNarration.ts). Task 7 used 32 tools for 21 tests (7 context reads before writing).
**Recommendation:** Replace the per-file formula with: `(new_files × 8) + (edited_files × 12) + (test_files × 15) + (verification_tasks × 10) + (docs_git × 10)`. For QWEN-STREAM-2: 3×8 + 2×12 + 1×15 + 2×10 + 2×10 = 103 — still under actual but 60% more accurate than the 65 estimate.
**Applies to:** All sprint Budget sections
**Status:** Observation

### SRL-019 — Uncommitted governance edits are at risk during git pull (QWEN-STREAM-2, 2026-04-20)
**Verdict:** Process gap. Cowork's governance doc edits (ROADMAP specs, SPRINT_QUEUE entries, close-out files) were wiped when CLI ran git pull to sync local checkout before the sprint.
**Evidence:** All three sprint specs, queue entries, CLAUDE.md state updates, retro entries, and close-out files from the READER-4M-2/QWEN-STREAM-1/READER-4M-3 close-outs had to be re-created. The CLI recovered the QWEN-STREAM-2 spec from git stash, but queue state was lost.
**Recommendation:** Before any CLI dispatch that will run git pull, either (a) commit governance doc updates as a standalone docs-only commit, or (b) include the spec inline in the dispatch pointer rather than relying on uncommitted file state. Option (a) is preferred — it's one extra commit and makes the spec durable.
**Applies to:** All dispatch sequences where Cowork writes specs to working-directory files before CLI syncs
**Status:** Observation

### SRL-020 — Streaming strategy sprints should audit end-of-stream signal delivery as an explicit task (QWEN-STREAM-3, 2026-04-20)
**Verdict:** The spec covered error paths (stall, crash, cancel) but missed the happy-path completion signal. Stream-finished needed a full IPC wire that wasn't in the spec.
**Evidence:** Plato found `acc.flush()` was never called on normal stream end. Fix required adding `tts-qwen-stream-finished` through 4 layers (engine→IPC→preload→renderer→acc.flush()→onEnd). The effort note recommends future streaming tasks annotate `{high}` for end-of-stream plumbing review.
**Recommendation:** For streaming strategy sprints, add an explicit "end-of-stream signal audit" sub-task that verifies every lifecycle event (start, data, finish, error, cancel) has a complete transport chain from producer to consumer. This is the streaming-specific instantiation of SRL-013's concordance table pattern.
**Applies to:** All sprints that add or modify streaming IPC channels
**Status:** Observation

### SRL-021 — Plato BLOCKER discovery validates full-tier investment for cross-system streaming work (QWEN-STREAM-3, 2026-04-20)
**Verdict:** Third validated occurrence of quality review catching a production-critical defect invisible to spec compliance (SRL-001 pattern).
**Evidence:** Solon passed 14/14 criteria. The missing flush was not a spec violation (the spec didn't require it explicitly), but it would have caused silent data loss in every streamed narration. Only Plato's architectural review caught the gap.
**Recommendation:** SRL-001 now has three occurrences (TEST-COV-1, QWEN-STREAM-1, QWEN-STREAM-3). Consider promoting to a stronger standing rule: "Plato is mandatory for any sprint touching IPC or cross-layer data flow, regardless of tier."
**Applies to:** All sprints with cross-layer signal flow (IPC, preload bridge, event chains)
**Status:** Observation (third occurrence of SRL-001 pattern — promotion candidate)

### SRL-022 — Herodotus pre-composed diffs: second consecutive miss (QWEN-STREAM-4, 2026-04-20)
**Verdict:** The Herodotus efficiency rule (pre-compose old_string/new_string diffs in the dispatch to cut tool calls by ~50%) was not applied in QWEN-STREAM-3 or QWEN-STREAM-4. Both sprints saw 24+ tool calls for docs-only updates.
**Evidence:** QWEN-STREAM-3 Herodotus used ~24 tool calls. QWEN-STREAM-4 Herodotus used exactly 24 tool calls. The standing rule in CLAUDE.md already says "Zeus SHOULD pre-compose exact old_string/new_string edit diffs for doc updates." It's not being enforced at dispatch time because Zeus doesn't compose them unless prompted.
**Recommendation:** Add a mandatory line to the Herodotus task in sprint specs: `Pre-composed diffs: [yes/no]. If yes, include diffs inline.` When "no," note why (e.g., complex multi-section updates). This makes the decision explicit rather than silently defaulting to the expensive path.
**Applies to:** All sprint Herodotus/documentation tasks
**Status:** Second occurrence — promotion candidate. First: QWEN-STREAM-3 (close-out mismatch note). Second: QWEN-STREAM-4.

### SRL-023 — Release-polish specs must preserve product posture as an explicit invariant (POLISH-1, 2026-05-04)
**Verdict:** POLISH-1 succeeded because it treated engine posture as a release invariant, not incidental settings copy.
**Evidence:** The sprint touched settings labels, ARIA state, empty states, and switch accessibility while preserving Kokoro default/available, MOSS-Nano recommended opt-in, Pocket TTS available opt-in, and Qwen disabled.
**Recommendation:** Late-stage polish specs should list non-negotiable product posture invariants directly in the task and test criteria, especially when copy/status/accessibility edits could accidentally imply a product decision change.
**Applies to:** Release-polish and settings/product-copy sprints
**Status:** Observation

### SRL-025 — Post-release audit remediation should be sequenced by dependency order, not severity alone (POSTV2-AUDIT-REMEDIATION, 2026-05-04)
**Verdict:** The remediation worked because release/package truth landed before engine/type cleanup, and engine/type cleanup landed before Narrate/security/artifact hygiene.
**Evidence:** POSTV2-REL-1 established package/version/update truth first; POSTV2-ENGINE-1 then made typecheck green and enforced engine posture across IPC/preload/persistence; POSTV2-NARR-1 finally tightened Narrate behavior, URL safety, artifact policy, and debt mapping.
**Recommendation:** For future post-release audits, split remediation into dependency-ordered lanes: release truth first, contract/posture enforcement second, behavior/security/artifact cleanup third.
**Applies to:** Post-release audits, stabilization bundles, and multi-lane remediation specs
**Status:** Observation

### SRL-026 — Storage migrations should pair structured identity with timing-truth sidecars (TTS-CACHE-TIMING-1, 2026-05-14)
**Verdict:** The cache migration stayed safe because it versioned identity fields explicitly, preserved legacy reads, and persisted timing truth as adjacent metadata instead of inferring it later.
**Evidence:** TTS-CACHE-TIMING-1 added v2 structured cache identities, atomic `.timing.json` sidecars, trusted/heuristic timing classification, corrupt-sidecar fallback, and v1 compatibility without a destructive global cache wipe.
**Recommendation:** Future cache or timing changes should version structured identity fields and treat missing or corrupt metadata as safe misses rather than cleanup triggers. Timing truth should travel with cached audio whenever possible.
**Applies to:** Cache migrations, timing metadata work, export preparation, and provider-neutral narration diagnostics
**Status:** Observation

### SRL-027 — Reconcile branch governance against canonical main before fold-in (TTS-SYNC-1, 2026-05-15)
**Verdict:** The sprint implementation was clean, but branch-local governance files lagged behind the canonical 2026-05-14 roadmap review and would have regressed queue state if copied wholesale.
**Evidence:** TTS-SYNC-1 completed and pushed on `sprint/tts-sync-1-highlight-controller`, but its branch `ROADMAP.md`, `SPRINT_QUEUE.md`, and `CLAUDE.md` still described older Desktop v2.0 / queue-RED framing while canonical main already had the TTS Architecture Completion conveyor with additional backfilled specs.
**Recommendation:** During phase closeout for worktree-resident sprints, treat branch governance edits as candidate fold-ins only. Compare against canonical main, preserve newer roadmap/queue state, and apply only net-new sprint facts unless a governance staging file explicitly records fold-in instructions.
**Applies to:** Worktree-resident sprint closeouts, branch-to-main governance reconciliation, roadmap and queue updates
**Status:** Observation

### SRL-028 — Diagnostic/export specs need producer and validator redaction gates (TTS-DIAG-1, 2026-05-15)
**Verdict:** The diagnostics bundle was safe to expose through settings because redaction was treated as a schema contract, not just a UI promise.
**Evidence:** TTS-DIAG-1 added `tts-diagnostics-v1` bundle production, eval-runner validation, and settings export while recursively stripping/rejecting raw text fields (`rawText`, `originalText`, `normalizedText`) and audio-shaped payloads from caller-supplied metadata.
**Recommendation:** Any future diagnostic, export, or evidence-artifact sprint that can touch user content should define redaction requirements in the producer, validator, tests, and UI affordance before the export action is considered complete.
**Applies to:** Diagnostics bundles, eval artifacts, export tooling, evidence runbooks, and settings/dev-only export controls
**Status:** Observation

### SRL-029 — Known broad-suite flakes become integration blockers when they are required gates (TTS-INTEGRATE-1, 2026-05-15)
**Verdict:** The integration itself was clean, but the sprint correctly stopped because a required broad-suite gate failed in a known resource-sensitive lane.
**Evidence:** TTS-INTEGRATE-1 merged TTS-SYNC-1 first and stacked TTS-DIAG-1 second, then passed focused sync verification, focused diagnostics verification, typecheck, and build. Full `npm test` failed in `tests/mossNanoProbe.test.js` with 3 performance-class failures, so the integration branch was left uncommitted/unpushed.
**Recommendation:** If a known resource-sensitive test lane is required by an integration sprint, the spec should name the unblock path up front: waive by explicit governance decision, stabilize first, or run the stabilization sprint on the integration branch.
**Applies to:** Integration sprints, broad verification gates, resource-sensitive probes, and test-harness debt
**Status:** Observation

### SRL-030 — Host-sensitive performance probes should be opt-in when contract coverage can remain deterministic (TEST-HARNESS-1, 2026-05-15)
**Verdict:** The MOSS Nano probe lane became stable when live Python performance checks were separated from deterministic default-suite contract coverage.
**Evidence:** TEST-HARNESS-1 kept direct Python MOSS Nano performance probes behind `BLURBY_RUN_MOSS_NANO_PERF_TESTS=1`, while default verification retained mocked/readiness/performance-contract coverage and passed full `npm test`, serialized `npm test -- --maxWorkers=1`, typecheck, build, and diff checks.
**Recommendation:** Future probe specs should split deterministic contract checks from host-sensitive live performance checks, and document the opt-in environment variable or command that runs the live lane.
**Applies to:** Performance probes, hardware/runtime-sensitive tests, broad verification gates, and integration unblockers
**Status:** Observation

### SRL-031 — Engine dormancy should be dual-gated at settings load and IPC entry (ENGINE-DORMANCY-1, 2026-05-16)
**Verdict:** The dormancy posture is safer when stale persisted settings and direct runtime channels are both handled explicitly.
**Evidence:** ENGINE-DORMANCY-1 migrated stale Nano, Pocket, and Qwen profile selections to Kokoro on settings load, while `tts-nano-*` and `tts-pocket-*` IPC entry points fail closed with `reason: "engine-dormant"`. This prevents dormant engines from re-entering through either user settings or direct channel calls.
**Recommendation:** Future engine-disable or engine-dormancy specs should require both gates: persisted-selection normalization and IPC/runtime fail-closed guards. Tests should cover both paths.
**Applies to:** Engine posture changes, provider retirement/dormancy work, settings migrations, and IPC runtime gating
**Status:** Observation

### SRL-032 — Stacked integration sprints should preserve merge order and rerun focused plus broad gates (TTS-INTEGRATE-1, 2026-05-16)
**Verdict:** The integration succeeded because it treated branch order as part of the contract, not incidental git mechanics.
**Evidence:** TTS-INTEGRATE-1 merged `TTS-SYNC-1` before `TTS-DIAG-1`, then ran focused sync tests, focused diagnostics tests, typecheck, build, full test, and diff-check before the final `main` merge.
**Recommendation:** Future stacked integration specs should name the required merge order, run focused suites for each source branch, then run the broad gate before governance advances.
**Applies to:** Multi-branch integration sprints, stacked feature branches, architecture fold-ins, and branch-to-main governance reconciliation
**Status:** Observation

### SRL-033 — Branch-complete closeouts must not imply main-landed queue advancement (TTS-CACHE-HARDEN-1, 2026-05-16)
**Verdict:** The implementation was successful, but the handoff summary mixed completion language with a still-unmerged branch state.
**Evidence:** At the first closeout pass, TTS-CACHE-HARDEN-1 was pushed at `53c7862` on `origin/sprint/tts-cache-harden-1-cache-pipeline-parity`, while canonical `main` still remained at `f1d5b4f`; the supplied PR link was a PR creation URL, not a landed merge. The branch later landed via merge commit `c54dd0f`.
**Recommendation:** Future closeout summaries should explicitly label status as `branch-complete`, `PR-open`, `merged-to-main`, or `pushed-to-main`, and roadmap advancement should require the final state.
**Applies to:** Sprint closeouts, branch-to-main governance reconciliation, next-pointer readiness checks
**Status:** Observation; related to SRL-027 and worth promoting if this recurs.

### SRL-034 — Word-boundary sync contracts should carry both source and resolved indexes with trust metadata (TTS-EVENT-SYNC-1, 2026-05-16)
**Verdict:** Event-driven highlight sync is robust when boundary callbacks carry mapping provenance rather than only a final index.
**Evidence:** TTS-EVENT-SYNC-1 landed provider-level boundary capability flags plus callback payloads containing `sourceWordIndex`, `resolvedWordIndex`, `isTrustedWordTiming`, `alignmentCorrected`, and `timingTruth`; this preserved LL-079 ownership boundaries while letting diagnostics and fallback logic reason about normalized→original remaps explicitly.
**Recommendation:** Future timing/event contracts should always include both raw/source coordinates and resolved/display coordinates, plus trust/correction flags, so scheduler fallback and diagnostics remain auditable across normalization and cache-hit paths.
**Applies to:** Event-driven narration sync, timing sidecar consumers, normalized-text remap logic, and future provider boundary integrations
**Status:** Observation

### SRL-035 — Enrichment transforms need conservative guards to preserve legacy normalization behavior (NORMALIZER-ENRICH-1, 2026-05-17)
**Verdict:** Gap-filling transforms can regress stable paths unless each new rule explicitly excludes known legacy patterns.
**Evidence:** NORMALIZER-ENRICH-1 required tightening dotted-acronym and terminal-punctuation behavior so existing fixtures remained unchanged (for example preserving `p.m.` time parsing and heading-style strings without forced terminal periods), while still adding nine new transforms and 25 new fixtures.
**Recommendation:** For future normalizer enrichment sprints, require one positive case plus one guard/no-op case per transform family, and validate transform ordering with explicit tests before broad-suite runs.
**Applies to:** Normalizer enrichments, transform ordering work, fixture expansion sprints, and alignment-map stability checks
**Status:** Observation

### SRL-036 — Keep one authoritative sprint queue, not mirrored queue files (SPRINT-QUEUE-PARITY, 2026-05-17)
**Verdict:** The queue drift risk dropped once the legacy Markdown sprint queue was retired and `docs/governance/sprint-queue.xlsx` became the only operational FIFO queue source.
**Evidence:** Recent closeouts had to reconcile roadmap text, a Markdown queue, and the workbook independently. The 2026-05-17 parity pass deleted the legacy Markdown queue, updated CLAUDE/ROADMAP/DEVELOPMENT_SYNC guidance, and repaired current TTS Architecture closeout references so future dispatches read the workbook Catalog/Dashboard.
**Recommendation:** Future governance updates should change `ROADMAP.md` for full specs and `docs/governance/sprint-queue.xlsx` for queue order/status. Do not recreate a Markdown queue mirror; if a human-readable queue view is needed, generate it from the workbook.
**Applies to:** Sprint closeout, next-pointer generation, roadmap review, phase closeout, and queue backfill
**Status:** Observation

### SRL-037 — Render-time position indexes should be fail-open with explicit miss telemetry (TTS-RENDER-MAP-1, 2026-05-17)
**Verdict:** The O(1) lookup win is safest when index misses degrade transparently to live DOM lookup during transient reflow/reload windows.
**Evidence:** TTS-RENDER-MAP-1 introduced a pre-built `WordPositionIndex` plus rebuild triggers across section load, render-version changes, and resize/layout events; highlight resolution now tries indexed entries first and logs structured miss reasons (`stale-index-entry`, `direct-fallback-hit`, `section-fallback-hit`, `not-found`) before using fallback lookup paths.
**Recommendation:** Future render-map or precomputed-layout sprints should require three things together: explicit invalidation triggers, miss-reason diagnostics, and a continuity-preserving fallback path instead of hard-failing on stale/missing cache entries.
**Applies to:** Event-driven highlight sync, DOM pre-index caches, resize/reflow-sensitive UI mapping, and diagnostics-driven performance hardening
**Status:** Observation

### SRL-038 — Integration tests should call production identity helpers, not duplicate private construction logic (TTS-PIPELINE-1, 2026-05-17)
**Verdict:** Cross-module pipeline tests are more trustworthy when the identity-building seam is a small production helper shared by runtime code and tests.
**Evidence:** TTS-PIPELINE-1 extracted `buildKokoroCacheIdentity()` from the Kokoro strategy/background cache paths, then used that helper in the integration test that chains planner, normalizer, cache identity, timing sidecar, word-boundary sync, and word-position lookup.
**Recommendation:** When a sprint needs to test a private production contract end-to-end, prefer extracting a pure helper that production also consumes over reconstructing the same object shape in test-only code.
**Applies to:** Cache identity, normalized segment identity, timing sidecar construction, diagnostics bundle construction, and future export pipeline tests
**Status:** Observation

### SRL-039 — Canonical architecture decision records prevent stale review artifacts from driving sprint routing (TTS-ARCH-DOC-1, 2026-05-17)
**Verdict:** The TTS architecture became easier to audit once engine posture, invariants, research dispositions, and P1/P2 finding outcomes moved into one standing governance document.
**Evidence:** TTS-ARCH-DOC-1 created `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`, linked it from `TECHNICAL_REFERENCE.md`, and marked it as the canonical home in `ROADMAP_SPECS.md` so future sessions no longer need to infer current decisions from scattered roadmap specs, review artifacts, and closeouts.
**Recommendation:** Future architecture completion phases should end with one canonical decision record that distinguishes adopted, rejected, deferred, and reactivation conditions before new optional lanes are dispatched.
**Applies to:** Architecture finish-line sprints, roadmap reviews, engine posture decisions, future export planning, and audit handoffs
**Status:** Observation

### SRL-040 — Worktree-isolated deferred sprints should include a rebase-readiness checklist in the spec (KOKORO-EXPORT-1, 2026-05-17)
**Verdict:** The worktree pattern worked well for building ahead without blocking the active conveyor, but the spec didn't anticipate how many files on main would diverge during the deferral window.
**Evidence:** KOKORO-EXPORT-1 touches `main/tts-cache.js`, `src/types.ts`, and `preload.js`. All three were edited by 5+ subsequent sprints (TTS-CACHE-HARDEN-1, TTS-EVENT-SYNC-1, NORMALIZER-ENRICH-1, TTS-RENDER-MAP-1, TTS-PIPELINE-1) after the worktree branched. A rebase will require conflict resolution in at minimum those three files.
**Recommendation:** When a sprint is spec'd as "implement now, merge later," include a `## Rebase Readiness` section listing the files touched and a threshold: if >3 subsequent sprints edit the same files, schedule a dedicated rebase-and-verify mini-sprint rather than attempting a cold rebase at merge time.
**Applies to:** Any sprint using worktree isolation with a planned deferral window of >2 sprints.
**Status:** Observation

### SRL-041 — Pre-validated branch pattern needs explicit dispatch guidance (NARR-MEDIA-1, 2026-05-17)
**Verdict:** Effort calibration was accurate (S-tier, 1 day), but the dispatch didn't anticipate that the implementation was already complete on-branch. CLI spent its time validating rather than building, which was the right outcome but wasn't signaled in the spec.
**Evidence:** All 8 done-when criteria were already met before CLI started. CLI's 5-task plan was entirely validation and close-out — no implementation tasks. 52 tests already passing.
**Recommendation:** When a sprint's implementation is known to already exist on a branch (e.g., from a prior session or parallel work), add a `## Pre-existing Implementation` note to the spec stating: "Implementation exists on `branch-name` at `commit`. Dispatch scope is validation-only: spec compliance, test verification, and merge." This sets correct CLI expectations and avoids wasted planning overhead.
**Applies to:** Any sprint where the code predates the dispatch.
**Status:** Observation

### SRL-042 — Edit-site lists should include stop/teardown paths, not just happy-path wiring (NARR-PAUSE-1, 2026-05-18)
**Verdict:** Effort calibration was accurate (M-tier, delivered in spec window), but the edit-site list missed two files that needed changes — `useReaderMode.ts` and `useFlowScrollSync.ts` — because the spec focused on narration start/pause/resume paths and didn't trace stop-reason threading through mode-switch and book-end teardown.
**Evidence:** The spec listed 3 edit sites (`narration.ts`, `useNarration.ts`, `mediaSessionBridge.ts`). CLI touched 5 files total, adding `useReaderMode.ts` and `useFlowScrollSync.ts` for stop-reason wiring. Both were necessary for `mode-switch` and `book-end` pause reasons to actually fire.
**Recommendation:** When speccing a new state discriminant (like `pauseReason`), trace not just where the value is produced and consumed but also where the absence of it would leave a code path using the old undiscriminated behavior. Stop/teardown/cleanup paths are the most common miss.
**Applies to:** Any sprint adding a new state field that replaces implicit behavior with explicit discrimination.
**Status:** Observation

### SRL-043 — Pipeline backpressure requires both resume-cap AND demand-driven drain (TTS-PARITY-1, 2026-05-18)
**Verdict:** The spec correctly identified that `pipelineResume()` needed backpressure gating (emit at most `queueDepth - pendingChunks` chunks). But the implementation discovered that capping the initial flush is only half the contract — the remaining buffered chunks must drain on-demand via `acknowledgeChunk()`, not sit in the pause buffer indefinitely. Without the drain hook, paused chunks beyond the initial cap are never delivered.
**Evidence:** The resume-cap gating alone left buffered chunks stranded. Adding a follow-on drain path in `acknowledgeChunk()` — pull one buffered chunk per acknowledgment — completed the demand-driven pipeline contract.
**Recommendation:** When speccing backpressure or flow-control changes, trace the full lifecycle: initial flush (cap), ongoing delivery (demand pull), and buffer exhaustion (cleanup). A cap without a drain is a deadlock waiting to happen.
**Applies to:** Any sprint modifying pipeline buffer/queue/backpressure behavior.
**Status:** Observation

### SRL-044 — Pure-function decision modules for animation logic (NARR-CURSOR-2, 2026-05-18)
**Verdict:** Extracting cursor-hold decisions into a shared pure-function module (`silenceAwareCursor.ts`) rather than inlining them in the FoliatePageView glide loop produced cleaner separation of concerns and significantly better testability — 20 focused tests on the decision logic alone, independent of RAF timing or DOM state.
**Evidence:** The spec predicted 3 edit sites; CLI touched 8 files but the core decision logic was cleanly isolated in one new module. The glide loop calls the decision function and acts on the result, keeping animation mechanics and hold/resume policy separate.
**Recommendation:** When an animation loop needs branching logic based on external state (silence gaps, pause reasons, playback mode), extract the decision into a pure function that the loop calls. Test the decision exhaustively; test the animation integration lightly.
**Applies to:** Any sprint adding conditional behavior to RAF-based animation loops.
**Status:** Observation

### SRL-045 — Evaluation/infrastructure sprints are naturally well-bounded when the harness pre-exists (TTS-EVAL-3, 2026-05-18)
**Verdict:** The spec's 8 done-when criteria mapped 1:1 to implementation tasks with no scope expansion, no surprise edit sites, and no mid-sprint amendments. When a sprint's job is to run an existing tool, capture its output, and wire a script, the spec can be precise because the moving parts are already built.
**Evidence:** 91 tests passed on first attempt. No additional files beyond what the spec predicted were needed. Matrix run, soak run, and gate run all produced artifacts cleanly. Contrast with runtime-code sprints (NARR-CURSOR-2, NARR-PAUSE-1) where edit-site discovery is common.
**Recommendation:** For sprints that exercise existing infrastructure rather than building new runtime code, the spec can be tighter and the effort estimate more reliable. Flag these as "infrastructure execution" in the spec so reviewers calibrate expectations correctly.
**Applies to:** Any sprint whose primary work is running tooling, capturing baselines, or wiring existing scripts into CI.
**Status:** Observation

### SRL-046 — Isolation sprints need preflight stabilization gates before extraction (READER-MODE-ISOLATION-1-PHASE-0, 2026-05-21)
**Verdict:** Adapter isolation is safer when known shared-surface guardrails are fixed before extraction begins.
**Evidence:** Phase 0 closed word-0 recentering and stale browse-away reset before moving Flow/Narrate ownership into adapters, and locked those seams with 10 regression tests plus code-search gates.
**Recommendation:** For cross-mode refactors, require a Phase 0 gate that locks exact-anchor, visual-follow, and mode-switch invariants before restructuring.
**Applies to:** Reader modes, shared-surface refactors, adapter extraction sprints.
**Status:** Observation

### SRL-047 — Mode lifecycle must reset local visual refs, not only runtime owners (READER-MODE-ISOLATION-1-PHASE-0, 2026-05-21)
**Verdict:** Runtime ownership contracts are incomplete if local view refs can survive mode switches and block the new owner.
**Evidence:** `userBrowsingRef` and `lastScrollFollowPosRef` could carry stale Flow/Narrate state into the next mode until a reading-mode reset effect was added.
**Recommendation:** Adapter `select()` / `start()` contracts should include visual-state reset guarantees for local refs, browse-away state, cursor baselines, and recenter affordances.
**Applies to:** Flow/Narrate adapters, Foliate surface bridge, mode lifecycle specs.
**Status:** Observation

### SRL-048 — Baseline-sync closeouts must advance the queue before next-pointer (BASELINE-SYNC-1, 2026-05-22)
**Verdict:** A baseline-sync sprint is not fully closed just because the intended commits are pushed; the workbook queue must also mark the completed head and expose the next real sprint.
**Evidence:** `BASELINE-SYNC-1` landed as three pushed commits on `main` with `main...origin/main = 0/0`, but `/next-pointer` still saw `BASELINE-SYNC-1` as Seq 1 because `docs/governance/sprint-queue.xlsx` had not advanced.
**Recommendation:** Closeout for any queue-management or baseline-sync sprint should update `ROADMAP.md` and `docs/governance/sprint-queue.xlsx` before running `/next-pointer`.
**Applies to:** Baseline sync, roadmap review, phase closeout, sprint closeout, and next-pointer dispatch readiness.
**Status:** Observation

### SRL-049 — Shared constants and behavioral gates require full-suite verification (TEST-GREEN-1, 2026-05-22)
**Verdict:** Targeted tests are insufficient when a sprint changes shared constants or adds a behavioral gate, because stale expectations can survive outside the focused scope.
**Evidence:** Seven of twelve TEST-GREEN-1 failures traced to constant-change or gate-change drift: `TTS_TRUSTED_CURSOR_LAG_MS`, `TTS_NORMALIZER_VERSION`, and the `followerMode` gate.
**Recommendation:** Any sprint changing shared constants, cache/version constants, timing constants, or broad behavioral gates should run the full suite before closeout or explicitly record why it cannot.
**Applies to:** Runtime constants, narration timing, normalizer/cache identity, reader-mode gates, and CI gating.
**Status:** Observation

### SRL-050 — Foliate recovery actions need renderer-level movement, not only shared reader state (READER-PERSISTENT-ANCHOR Step 2, 2026-05-22)
**Verdict:** A persistent anchor is not user-visible unless the active Foliate surface is explicitly navigated to it.
**Evidence:** READER-PERSISTENT-ANCHOR Step 2 needed `jumpFoliateToWordAnchor` because Page jump-back could show and clear the button without moving the Foliate viewport.
**Recommendation:** Any Foliate-visible action like jump-back, mode start, or recenter must call a surface API that can highlight, scroll, and section-recover the target word.
**Applies to:** Foliate Page/Focus/Flow/Narrate surfaces, jump-back, mode-start anchoring, section recovery.
**Status:** Observation

### SRL-051 — Render-path getters must be side-effect free (READER-PERSISTENT-ANCHOR Step 2, 2026-05-22)
**Verdict:** A function called like a getter becomes dangerous when it logs or records diagnostics on every render.
**Evidence:** `getEffectiveWords` spammed the console and diagnostics during Focus startup until the effective word source was stabilized.
**Recommendation:** Split source resolution into pure memoized values for render and explicit one-shot diagnostics for source transitions.
**Applies to:** React render paths, word-source selection, diagnostics, performance-sensitive reader hooks.
**Status:** Observation

### SRL-052 — Mode playing state must follow runtime start, not precede it (READER-PERSISTENT-ANCHOR Step 2, 2026-05-22)
**Verdict:** UI "playing" state should not flip before the mode runtime has actually started.
**Evidence:** Focus could render a blank active overlay when `focusPlaying=true` preceded delayed `startMode("focus", ...)`.
**Recommendation:** For Focus/Flow/Narrate, resolve anchor and start the runtime before publishing active playback state, or expose a distinct "starting" state.
**Applies to:** Reader mode start flows, async Foliate readiness, overlay rendering, Play/Space handlers.
**Status:** Observation

### SRL-053 — Manual screen QA is mandatory for Foliate reader-mode runtime changes (READER-PERSISTENT-ANCHOR Step 2, 2026-05-22)
**Verdict:** Automated tests are necessary but not sufficient for reader-mode runtime changes that move the Foliate surface.
**Evidence:** READER-PERSISTENT-ANCHOR Step 2 reported 2794 passing tests and clean TypeScript, but the live 18-scenario manual QA gate found 10 failures, including Page jump-back, Focus blank overlay, Flow non-follow, Narrate wrong start, and hard-click retarget failures.
**Recommendation:** Any sprint touching Foliate surface movement, mode start, jump-back, playback visual follow, or hard-selection anchoring should require screen-interaction manual QA before merge or roadmap advancement.
**Applies to:** Page/Focus/Flow/Narrate runtime changes, Foliate surface bridge, jump-back, active playback follow, mode handoff.
**Status:** Observation

### SRL-054 — Specs must distinguish hard-selected anchor from last-read/progress anchor (READER-PERSISTENT-ANCHOR Step 2, 2026-05-22)
**Verdict:** A "current word" contract is ambiguous unless it names the difference between hard selection, live playback cursor, durable progress, and browse-away visible position.
**Evidence:** Manual QA showed hard clicks moved the visible highlight box, but playback resumed from a prior "persistent last-read word" or section start. Narrate's Jump back tooltip also exposed the implementation mismatch by targeting "persistent last-read word" rather than the hard-selected playback anchor.
**Recommendation:** Future reader-anchor specs should define separate owners and precedence for hard-selected anchor, last-read progress, live playback cursor, and temporary browse-away position, then test Play, Space, Jump back, active retarget, and reopen against that precedence.
**Applies to:** Reader anchor service, mode start, progress persistence, CFI restore, active retarget, cross-mode handoff.
**Status:** Observation

### SRL-055 — Shared Foliate surfaces need live UI gates, not only structural/unit tests (READER-PERSISTENT-ANCHOR Step 2, 2026-05-22)
**Verdict:** Structural gates can confirm the right helpers exist while the live renderer still fails to move, render, or follow.
**Evidence:** Step 2 added Foliate jump-back helpers, Flow follow fixes, Focus startup changes, and targeted tests, yet manual QA found Page jump-back hiding without returning, Focus rendering a blank overlay, Flow cursor advancing outside the reading window, and Flow browse-away failing to pause or show Jump back.
**Recommendation:** Add at least one live UI gate, manual or automated, for each shared Foliate surface behavior that depends on real layout: Page jump-back motion, Focus first-word render, Flow cursor follow, Narrate exact start, and cross-mode hard-click retarget.
**Applies to:** FoliatePageView, reader mode adapters, FlowScrollEngine integration, Focus overlay, Narrate cursor sync, persistent-anchor repairs.
**Status:** Observation

### SRL-056 — Hard-selection anchors need cause-aware clearing (READER-PERSISTENT-ANCHOR Step 3, 2026-05-22)
**Verdict:** A hard-selected anchor must not be cleared by generic progress or visual-ref writes before mode start consumes it.
**Evidence:** `explicitSelectionAnchorRef` was cleared by `writeRefs` calls with non-hard-selection causes, including jump-back from `syncVisualToPersistentWord`, which caused Narrate and Flow starts to ignore the newly selected word.
**Recommendation:** Anchor state mutation APIs should use explicit causes and only clear hard-selection anchors on lifecycle events that truly invalidate them, such as book-open or explicit replacement.
**Applies to:** Reader persistent anchors, mode start, jump-back, active retargeting, resume/progress writes, cross-mode handoff.
**Status:** Observation

### SRL-057 — Same-section and cross-section Foliate movement are separate acceptance cases (READER-PERSISTENT-ANCHOR Step 3 QA, 2026-05-22)
**Verdict:** A Jump Back or anchor recovery path that works across chapter or section boundaries does not prove same-section movement works.
**Evidence:** Step 3 Page Jump Back returned correctly when the target anchor was in another section, but dismissed without moving when the anchor was in the same chapter.
**Recommendation:** Any Foliate anchor navigation helper must test both same-section and cross-section return paths before being accepted.
**Applies to:** Page Jump Back, reopen restore, section recovery, mode-switch recentering, persistent-anchor navigation.
**Status:** Observation

### SRL-058 — Each reading mode needs its own active-render QA gate (READER-PERSISTENT-ANCHOR Step 3 QA, 2026-05-22)
**Verdict:** Shared anchor plumbing can pass while a specific mode's playback renderer remains broken.
**Evidence:** Step 3 fixed Flow playback and Narrate exact start, but Focus still rendered a blank active overlay and did not expose paused Jump Back.
**Recommendation:** Manual QA and dispatch specs must verify active render output per mode, not infer mode health from shared anchor or surface state.
**Applies to:** Focus, Flow, Narrate, Page-mode restore, adapter extraction.
**Status:** Observation

### SRL-059 — CSS-column word-position indexes need live rect validation before same-section movement decisions (READER-PERSISTENT-ANCHOR Step 3.1, 2026-05-22)
**Verdict:** Cached word-position rects can go stale after Foliate page turns in CSS-column paginated mode.
**Evidence:** Step 3.1 found that `FoliatePageView`'s word position index stores `getBoundingClientRect()` snapshots; same-section Jump Back could trust stale `visible` state and dismiss without moving.
**Recommendation:** Same-section Foliate navigation should either force motion for recovery actions or validate target rects live before deciding the word is already visible.
**Applies to:** Page Jump Back, reopen restore, same-section anchor recovery, mode-switch recentering, Foliate word-position indexes.
**Status:** Observation

### SRL-060 — Narrate sync gates must verify heard audio, not only visual cursor position (READER-PERSISTENT-ANCHOR Step 3.1 QA, 2026-05-22)
**Verdict:** Narrate can visually start at the right word while the spoken audio lags behind or skips at chunk boundaries.
**Evidence:** Step 3.1 manual QA showed S12/S13 failing after the cursor started at the hard-clicked anchor but then outran the heard audio; at chunk boundaries the audio skipped ahead to the cursor location.
**Recommendation:** Future Narrate specs and manual QA gates should explicitly verify cursor lead/lag against heard audio and include chunk-boundary transition checks, not only visual start position.
**Applies to:** Narrate playback, audio scheduler changes, cursor sync, chunk-boundary handoff, TTS progress sources.
**Status:** Observation

### SRL-061 — Cross-surface cursor visuals need one declared owner per mode (READER-PERSISTENT-ANCHOR Step 3.1 QA, 2026-05-22)
**Verdict:** Flow cursor regressions can appear when multiple surfaces render cursor affordances for the same active word.
**Evidence:** Step 3.1 manual QA found S8 failing because both the parent-document `.flow-shrink-cursor` overlay and the iframe `.page-word--flow-cursor` underline rendered at once.
**Recommendation:** Mode specs should declare the single visual cursor owner for each mode and include an acceptance check that duplicate cursor affordances are suppressed.
**Applies to:** Flow cursor rendering, Foliate iframe highlights, parent overlay cursors, reader mode adapter isolation.
**Status:** Observation

### SRL-062 — Narrate timing repairs should be sized as investigation-heavy (READER-PERSISTENT-ANCHOR Step 3.2, 2026-05-22)
**Verdict:** Narrate cursor fixes can require high-effort root-cause tracing even when the final patch is small.
**Evidence:** Step 3.2's final Narrate change was a one-line cursor-lag constant update, but the work required tracing audio scheduler progress, word boundaries, output latency, tempo stretch, and chunk-boundary behavior.
**Recommendation:** Future Narrate timing dispatches should pre-flag investigation effort separately from implementation effort so expectations match the real diagnostic burden.
**Applies to:** Narrate timing, audio scheduler work, TTS cursor sync, chunk-boundary repairs, manual audio QA.
**Status:** Observation

### SRL-063 — Fixed cursor-lag constants are provisional when audio output latency is hardware-dependent (READER-PERSISTENT-ANCHOR Step 3.2, 2026-05-22)
**Verdict:** A fixed trusted cursor lag can be a useful repair lever, but repeated tuning signals the need for a measured or adaptive model.
**Evidence:** `TTS_TRUSTED_CURSOR_LAG_MS` has moved `120→220→350→450ms` as real Electron/Chromium/WASAPI output latency exceeded timestamp-derived expectations.
**Recommendation:** Plan a future hardening sprint for adaptive lag calibration or measured output delay rather than continuing to hand-tune a fixed cursor-lag constant.
**Applies to:** Narrate cursor sync, audio scheduler calibration, hardware-dependent playback latency, TTS UX polish.
**Status:** Observation

### SRL-064 — Narrate exact-start and continuous sync are separate acceptance gates (READER-PERSISTENT-ANCHOR Step 3.2 QA, 2026-05-22)
**Verdict:** Narrate can improve chunk-boundary continuity while still failing exact selected-word audio start.
**Evidence:** Step 3.2 manual QA showed S8 fixed and chunk-boundary skip-ahead improved, but selecting "At" in "At this point" started audio from "Cusco" in the prior sentence.
**Recommendation:** Future Narrate sync specs should separately test selected-word audio start, cursor/audio lead-lag during playback, and chunk-boundary transition behavior.
**Applies to:** Narrate playback start, audio scheduler chunk mapping, cursor sync, hard-click retargeting, manual audio QA.
**Status:** Observation

### SRL-065 — Active retarget paths must have a single resync owner (READER-PERSISTENT-ANCHOR Step 3.3, 2026-05-22)
**Verdict:** Active playback retargeting becomes race-prone when more than one path can stop and restart the audio pipeline for the same click.
**Evidence:** Step 3.3 found that `onWordClick` could trigger `narration.resyncToCursor` twice during active Narrate: once from `commitSharedWordAnchor` and again from `retargetActiveModeToWord`, causing two rapid pipeline stop/start cycles per click.
**Recommendation:** For active Focus, Flow, and Narrate retargeting, assign one resync owner per click path and make secondary anchor updates explicitly skip runtime resync.
**Applies to:** Active word-click retargeting, Narrate resync, audio pipeline restarts, Flow/Focus adapter ownership.
**Status:** Observation

### SRL-066 — Downstream chunk dispatch must use resolved plan boundaries, not raw targets (READER-PERSISTENT-ANCHOR Step 3.3, 2026-05-22)
**Verdict:** Chunk-planning refinements can invalidate downstream assumptions that raw target sizes equal resolved chunk boundaries.
**Evidence:** Step 3.3 sentence-boundary snapping extended cold-start chunk 0 beyond the raw `firstSize` target, exposing a parallel ramp overlap because chunk 1 started from raw `firstSize` instead of `openingRampPlan[0].endIdx`.
**Recommendation:** Any sprint that changes chunk sizing, snapping, ramping, or natural-boundary logic should audit all downstream dispatch math and require consumers to use resolved plan boundaries.
**Applies to:** TTS chunk planning, Kokoro pipeline ramping, sentence-boundary snapping, parallel chunk dispatch.
**Status:** Observation

### SRL-067 — Visual and audio pipelines must not share raw word indexes unless they share tokenization (READER-PERSISTENT-ANCHOR Step 3.3 QA, 2026-05-22)
**Verdict:** A numeric word index is not a stable cross-subsystem contract when Foliate/click resolution and TTS chunking tokenize text differently.
**Evidence:** Step 3.3 DevTools diagnostics showed `globalWordIndex: 3370` meant `Medicare` to `onWordClick`, but the same `startIdx=3370` meant `Many` to `speakNextChunkKokoro` and `produceChunk`; the TTS chunk also rendered `sixty-five` as `sixty five`, indicating tokenization drift.
**Recommendation:** Narrate exact-start work should use one canonical word/token index source across click resolution, highlighting, and TTS chunking, or explicitly translate indexes at subsystem boundaries before audio scheduling.
**Applies to:** Narrate exact-start, TTS chunking, Foliate word indexes, click retargeting, cursor/audio sync, tokenizer normalization.
**Status:** Observation

### SRL-068 — Prefer canonical content alignment over tokenizer unification across renderer/source boundaries (READER-PERSISTENT-ANCHOR Step 3.4, 2026-05-23)
**Verdict:** When the renderer and source extractor see the same book through different DOM/XHTML views, making one canonical index source and aligning rendered content to it is safer than trying to force tokenizer parity.
**Evidence:** Step 3.4 repaired the click/TTS index mismatch by stamping Foliate DOM spans from canonical extractor words in `wrapWordsInSpans`, instead of trying to make renderer `segmentWordSpans` and main-process `epub-word-extractor` tokenize identically across stitching, punctuation-gap, footnote, and block-selection differences.
**Recommendation:** For reader surfaces that bridge rendered DOM and source extraction, choose one canonical word/index source, align content to it, and make unmatched content warn/recover instead of silently drifting by position.
**Applies to:** Foliate word wrapping, TTS word indexes, rendered/source text alignment, Narrate exact-start, click retargeting, adapter extraction.
**Status:** Observation

### SRL-069 — Prefetched audio boundaries must be source-owned before driving heard-audio cursors (READER-PERSISTENT-ANCHOR Step 3.5, 2026-05-24)
**Verdict:** A flat boundary timeline can advance visual cursor state beyond the currently audible source when chunks are prefetched.
**Evidence:** NARRATE-CURSOR-SYNC-4 fixed S13 by clamping `tick()` and `getAudioProgress()` to the active source window, so prefetched future boundaries cannot drive Narrate cursor progress before their source starts playing.
**Recommendation:** Any TTS cursor driven by prefetched chunk boundaries must gate emitted progress by the currently-playing source, not just by `audioCtx.currentTime` minus lag.
**Applies to:** `audioScheduler`, Narrate cursor sync, chunk prefetch, streaming TTS, source handoff.
**Status:** Observation

### SRL-070 — Self-referential telemetry cannot gate a sync fix; verify with audio-independent ground truth (READER-PERSISTENT-ANCHOR Step 3.5/3.6 QA, 2026-05-24)
**Verdict:** The boundary-drift metric (~9ms) measured cursor-vs-schedule, not cursor-vs-heard-audio, so it reported "tight" while the cursor actually led the audio — masking S13 across four repair rounds (3.2–3.5).
**Evidence:** In The Raven, every chunk logged `WORD-NATIVE` timing with ~9ms boundary drift, yet Evan's ear confirmed the cursor led and narration omitted content at re-entry. Every scheduler-derived number is computed from the same predicted timeline, so none can detect a schedule-vs-audio offset. Step 3.6 added the first non-self-referential instrument (`ctx.currentTime − chunkStartTime`).
**Recommendation:** PROMOTED TO STANDING RULE — Narrate/sync QA gates require an audio-independent ground truth (Evan's ear, or a non-self-referential instrument such as schedule-vs-wallclock drift); scheduler-derived metrics (boundary drift, scroll-follow, handoff index) are NOT sync evidence. Recorded in `docs/governance/LESSONS_LEARNED.md`.
**Applies to:** Narrate cursor/audio sync gates, TTS QA, any open-loop-vs-closed-loop verification.
**Status:** Promoted to standing rule (second occurrence with SRL-060).

### SRL-071 — Cowork pre-dispatch root-cause investigation shrinks investigation-heavy repairs to read-and-run sprints (READER-PERSISTENT-ANCHOR Step 3.6, 2026-05-24)
**Verdict:** Pinning the exact seam before dispatch turned a Narrate-timing repair (which SRL-062 sized as investigation-heavy) into a small, clean implementation sprint.
**Evidence:** Step 3.6 dispatched a single core change (`nextGenWordIndexRef`) plus tests with file:line targets and reset conditions; CLI landed it green on the first pass (2,821 tests, tsc clean) at M effort with no investigation tasks.
**Recommendation:** For investigation-heavy subsystem repairs, have Cowork complete live root-cause tracing and identify the exact seam (refs, file:line, reset conditions) before authoring the dispatch; the CLI sprint then sizes as a normal read-and-run implementation.
**Applies to:** Narrate/TTS timing repairs, tangled-subsystem bug fixes, the investigate-then-dispatch workflow.
**Status:** Observation (refines SRL-062).

### SRL-072 — Don't iterate fixes on "ahead-of-heard" references; audible continuity needs a real heard-position signal (READER-PERSISTENT-ANCHOR Step 3.6 QA, 2026-05-24)
**Verdict:** Six pre-isolation rounds (3.1–3.6) each partially worked then skipped because every reference the code could seed playback from — `cursorWordIndex`, `lastConfirmedAudioWordRef`, and finally `nextGenWordIndexRef` (produced-end) — is AHEAD of what the listener has actually heard. Step 3.6 made generation contiguous yet the audio still dropped a line, proving the content-omission (Bug 2) and the cursor-lead (Bug 1) are one defect that cannot be fixed without a "what was actually spoken" signal.
**Evidence:** Step 3.6 console showed `produceChunk 0→…→1111` (contiguous generation) and `scheduleChunk drift ≈ −227s` (whole book prefetched); Evan did not hear "This it is and nothing more." — playback continued from the ahead-of-heard frontier. Each prior fix swapped one ahead-of-heard ref for another.
**Recommendation:** When an audio/playback sync defect recurs across multiple targeted fixes, stop substituting predicted/generation references and first establish the real playback-position signal (closed-loop). Prefer doing the closed-loop rework once — ideally after the owning module is isolated — over repeated open-loop patches that each add scheduler risk. Tie acceptance to an audio-independent ground truth (ear or a non-self-referential instrument), per SRL-070.
**Applies to:** TTS cursor/audio sync, streaming playback continuation, any open-loop "predict then display/seed" subsystem; pre- vs post-isolation sequencing of high-risk fixes.
**Status:** Observation (third in the Narrate-sync arc with SRL-060 and SRL-070; promotion candidate — "audio sync fixes require a real heard-position signal, not predicted references").

### SRL-073 — Stateful adapter services need before/after cleanup tests for mode transitions (READER-ISO-1A, 2026-05-24)
**Verdict:** State services can pass happy-path precedence tests while cleanup paths are dead if the implementation overwrites owner state before comparing old and new ownership.
**Evidence:** READER-ISO-1A initially had a `setActiveMode` assignment-before-comparison bug that made stale mode-advance cleanup unreachable; parent review caught and fixed it before merge.
**Recommendation:** Adapter and anchor-service specs that mutate active owner state should include explicit transition tests proving cleanup happens when ownership changes, plus no-op tests proving same-owner selection does not clear valid state.
**Applies to:** Reader mode adapters, current-word anchor services, active runtime ownership, stale-mode cleanup, future orchestrator extraction.
**Status:** Observation.

### SRL-074 — Orchestrators should consume building blocks, not closure-owned internals (READER-ISO-1B, 2026-05-25)
**Verdict:** A clean orchestrator boundary should route public lifecycle actions while closure-heavy implementation functions remain in the owning hook or module until their adapter owns the relevant refs.
**Evidence:** READER-ISO-1B could not cleanly extract `handleStopTts` because it depends on internal refs such as `narrationCursorRafRef` and `narrateTruthRafRef`; keeping it in `useReaderMode` and exporting it as a building block preserved encapsulation.
**Recommendation:** Future adapter extraction specs should classify functions as routeable shell actions versus implementation-owned building blocks before moving code. Do not force ref-heavy teardown/truth-sync functions across a boundary just to make the extraction look complete.
**Applies to:** Reader mode orchestrator, Focus/Flow/Narrate adapter extraction, lifecycle routing, stop/teardown paths, truth-sync ownership.
**Status:** Observation.

### SRL-075 — Concrete adapters can be proven as pure classes before React wiring (READER-ISO-1C, 2026-05-26)
**Verdict:** Adapter contracts are easier to validate when the first concrete adapter is implemented and tested as a standalone class before routing live React hooks through it.
**Evidence:** READER-ISO-1C added `FocusModeAdapter` wrapping `FocusMode` with lifecycle ownership, anchor-gated `onWordAdvance`, clock reporting, and SRL-073 transition/no-op coverage without needing `renderHook` or runtime wiring.
**Recommendation:** Future adapter migrations should first prove adapter lifecycle, ownership, and contract behavior in pure-class tests, then perform orchestrator/hook wiring as a separate step.
**Applies to:** Focus, Flow, Narrate adapters; reader-mode lifecycle ownership; passive surface command migration; future hook wiring.
**Status:** Observation.

### SRL-076 — Adapters can own pure decisions before owning DOM execution lifecycle (READER-ISO-1D, 2026-05-26)
**Verdict:** Adapter extraction can safely advance by moving pure decision logic first while leaving ref-heavy DOM execution in the existing hook until a later wiring sprint.
**Evidence:** READER-ISO-1D added `FlowModeAdapter.resolveCompletion()` as pure data logic for section-handoff decisions, plus browse-away state and surface command emission, while keeping `FlowScrollEngine` DOM lifecycle in `useFlowScrollSync` per SRL-074.
**Recommendation:** Future adapter migrations should separate pure decision ownership from execution ownership: extract and test decision services first, then wire hooks and DOM/ref lifecycles in a later sprint with transition coverage.
**Applies to:** Flow/Narrate adapter extraction, section handoff, browse-away handling, DOM-coupled runtime migration, reader-mode lifecycle ownership.
**Status:** Observation.

### SRL-077 — Hook-backed modes can use typed bridges before React wiring (READER-ISO-1E, 2026-05-27)
**Verdict:** A hook-backed mode can gain a concrete adapter boundary before the full React hook tree is routed through that adapter, as long as the adapter consumes typed bridge callbacks instead of reaching into closure-owned refs.
**Evidence:** READER-ISO-1E added `NarrateModeAdapter` around the narration hook bridge, owning truth-sync install/clear lifecycle, browse-away state, surface command emission, and `audio-truth` clock reporting while leaving ref-heavy truth-sync RAF callbacks in `useReaderMode` per SRL-074.
**Recommendation:** Future adapter migrations should introduce typed bridges for hook-owned operations first, prove lifecycle and cleanup behavior with pure adapter tests, and move React/ref wiring only after ownership seams are explicit.
**Applies to:** Narrate adapter wiring, audio truth-sync ownership, hook-backed mode bridges, reader-mode lifecycle ownership, closed-loop cursor preparation.
**Status:** Observation.

### SRL-078 — Agent-rename propagation must include workflow docs and project-local skills (GOV-HUMAN-REVIEW-1, 2026-05-27)
**Verdict:** Standing Rule #14 (agent-rename grep-and-replace across governing docs) is necessary but not sufficient if its scope is read narrowly. Workflow docs (`.claude/WORKFLOW_REFERENCE.md`) and project-local skills (`.claude/skills/*/SKILL.md`) can carry agent-role names that drift from the canonical CLAUDE.md roster without being noticed.
**Evidence:** The MarcusAurelius stub agent existed in `.claude/agents/` as an uncustomized doc-keeper template while `.claude/agents/herodotus.md` was the actual customized doc-keeper file — two competing names for the same role. CLAUDE.md's canonical roster referenced Herodotus; `WORKFLOW_REFERENCE.md` (3 spots) and the project-local Virtuoso `SKILL.md` (7 spots) referenced MarcusAurelius. GOV-HUMAN-REVIEW-1 resolved this by renaming the doc-keeper agent to MarcusAurelius across all surfaces (deleting `herodotus.md`, creating `marcusaurelius.md` with the customized content, and propagating to CLAUDE.md, agents/readme.md, zeus.md, hercules.md, athena.md, simonides.md, ROADMAP.md, LESSONS_LEARNED.md, WORKFLOW_REFERENCE.md, and SKILL.md). A first-pass resolution that simply removed the MarcusAurelius file would have completed the GOV item but kept the workflow-doc drift intact and the canonical-roster reference broken; the broader grep was what made the resolution correct.
**Recommendation:** Extend Standing Rule #14 explicitly: any agent rename or removal must grep `.claude/` recursively (not just `agents/`) and check `WORKFLOW_REFERENCE.md` and every installed-in-project skill. When two competing names point at the same role, treat it as a rename, not a removal — the workflow docs are signaling the intended canonical name.
**Applies to:** Agent additions, renames, removals; workflow doc consistency; skill maintenance; governance hygiene sweeps.
**Status:** Observation. Promotion candidate if a second occurrence appears.

### SRL-079 — Source-fix verification needs rebuild gate (BUG-181 retroactive, 2026-05-28)
**Verdict:** Any bug whose disposition is "RESOLVED in source — production build needs rebuild" stays OPEN until `npm run build` + a smoke-test pass against the bug's original reproducer confirms the rebuilt binary embodies the diff. The fix is not closed when the source diff lands; it is closed when the binary the user is actually running embodies the change. Catch-up entry — promoted to Standing Rule #35 in ROADMAP.md on 2026-05-28 at /next-pointer time; this SpecRetro entry exists to keep the canonical lessons log in sync with the active Standing Rules.
**Evidence:** Five consecutive bugs drifted past close-out with the fix landed in source but the running binary stale: BUG-176 (Flow→Page mode drop), BUG-178 (mode-switch position loss), BUG-179 (Focus blank zone), BUG-180 (chunk active-word color-on-color), and BUG-181 (Production build `tokenizeWithMeta` `r.split is not a function`). Each carried the same "Verification blocked by stale production build" tag in BUG_REPORT.md. The 2026-05-27 live-QA discovery sweep re-found BUG-181 as "F2" and produced a YELLOW gate verdict — entirely based on a stale-build observation that rebuild then eliminated 24 hours later. Without a rebuild-verification gate the discovery loop would have continued; with it, the rebuild step is forced into the close-out before the fix is considered shipped.
**Recommendation:** Adopt rebuild+smoke as the explicit final acceptance step for source-fix-only sprints. Any sprint with "verification blocked by stale production build" in its close-out remains OPEN. MarcusAurelius's docs-pass step in sprints with renderer changes should include an explicit "rebuild + smoke" task before the sprint is marked Completed.
**Applies to:** All bug-fix sprints; verification gates; source-vs-binary drift; live-QA discovery passes.
**Status:** **Promoted to Standing Rule #35** (ROADMAP.md, 2026-05-28).

### SRL-080 — openpyxl writes erase Excel formula machinery (TTS-QUAL-CI-1, 2026-05-28)
**Verdict:** openpyxl can silently strip Excel formula expressions when writing an `.xlsx` file, converting formula cells to their last-cached static values. Once stripped, formula-driven KPIs become inert — any downstream consumer expecting computed values gets a frozen snapshot of whatever the last cached display value was at strip-time. This happens whether or not `data_only=True` was used on the load — the formula's expression text and the cached value travel separately, and a default openpyxl save can ratchet a formula-bearing sheet toward static even without explicit intent. The damage is asymmetric: once a sheet has been stripped, no openpyxl operation will restore it; restoration requires Excel itself (rebuilding the formulas by hand) plus a guardrail to prevent future strips.
**Evidence:** `scripts/recalc.py` was authored under the assumption that `sprint-queue.xlsx`'s Dashboard tab (B12 category counts, B20 sprints-remaining, B24 % complete by LOE, B29 full-specs-queued, B32 buffer-health flag) was formula-driven. Hermes's smoke-run discovered the formula-cell scan returned zero results — meaning prior openpyxl operations across 2026-05-22 → 2026-05-28 had silently converted every Dashboard formula to a static value. The recalc script's intended primary purpose (refresh formula-driven KPIs) is therefore moot for the current file; its remaining value is the `calcMode = auto` flip and a clean re-save.
**Recommendation:** Disposition (Evan, 2026-05-28): **restore formulas in Excel, then quarantine the Dashboard tab from openpyxl.** Concretely: (a) rebuild the Dashboard formulas manually in Excel using the cell-reference layout the original template specified (see C:\Users\estra\Projects\Blurby\docs\governance\sprint-queue.xlsx Dashboard section per the /roadmap-review skill's "Sprint queue spreadsheet structure" doc); (b) extend `scripts/recalc.py` with a guardrail: refuse to operate on any cell whose worksheet name matches `Dashboard`, with `--allow-dashboard` as an explicit opt-out; (c) document the convention in `CLAUDE.md` or a new `docs/governance/SPREADSHEET_CONVENTIONS.md`: openpyxl edits the Catalog tab; Excel computes Dashboard from Catalog. Future hygiene work is captured in `HYG-XLSX-DASHBOARD-RESTORE` (Catalog Seq=6 stub).
**Applies to:** Any project that uses Excel files for KPI rollup and edits them via openpyxl; spreadsheet automation; governance-tooling design; Blurby's sprint-queue.xlsx specifically.
**Status:** Observation. Promotion candidate if a second occurrence appears or if a third-party openpyxl-driven xlsx tool hits the same fragility in another Blurby surface.

### SRL-081 — Mid-spec fold-in absorbs small adjacent hygiene cleanly (TTS-QUAL-CI-1, 2026-05-28)
**Verdict:** When a sprint discovers small adjacent tooling debt during its planning or /next-pointer phase, folding the items into the active spec (as labeled tasks with their own success criteria) is preferable to spinning up dedicated micro-sprints, provided the fold-in stays under ~20% of total sprint LOE and reuses the same dispatch wave. The "spin up a dedicated micro-sprint" alternative pays full queue-management overhead (Catalog row, Seq renumber, separate branch, separate commit, separate close-out) for work that can be a 3-line task table entry instead.
**Evidence:** TTS-QUAL-CI-1's spec was amended on 2026-05-28 to absorb two adjacent items surfaced by the xlsx Catalog mirror operation: `scripts/recalc.py` (governance tooling, ~37 LOC) and the LOE-XS dropdown extension (Catalog data validation + SINGLE-INSTANCE-LOCK-1 row update). Hermes executed both inside the original sprint scope as Tasks 4–5 in the amended spec, Hippocrates smoke-tested the recalc script as Task 9, and MarcusAurelius rolled all three concerns into one docs pass. Net effect: two tooling items shipped with zero queue-management overhead and no separate sprint dispatch. The original "Effort: S" sizing held — the fold-in didn't blow scope. CLI reports "All tasks matched their annotated effort/model tiers" — no effort mismatch flagged.
**Recommendation:** When small hygiene items surface during sprint planning, prefer fold-in over spin-off if (a) the work touches an overlapping surface or roster (here: same Lane D + Lane E, same Hermes + MarcusAurelius), (b) it's < ~20% of the host sprint's LOE, and (c) it can reuse the host's dispatch wave. Document the fold-in explicitly in the spec (don't slip it in silently) — the audit trail in TTS-QUAL-CI-1's "Effort note flagged the marginal scope expansion on 2026-05-28 with traceable rationale" sentence is the model.
**Applies to:** Sprint scoping; governance tooling; small hygiene work; spec amendments; queue-management overhead reduction.
**Status:** Observation. "What worked" lesson. Promotion candidate if the pattern recurs in a second sprint without scope creep.

### SRL-082 — Electron/CommonJS tests should prefer direct seams over brittle module-cache mocks (EXT-PAIR-1, 2026-05-29)
**Verdict:** Electron-facing CommonJS modules are hard to isolate reliably with broad `vi.mock("electron", ...)` assumptions once another test has already cached a `require("electron")` path.
**Evidence:** EXT-PAIR-1's WebSocket auth tests needed reliable access to connection/message handlers and safe behavior when `safeStorage` was unavailable. Rather than leaning on a fragile Electron mock that may not intercept cached CommonJS imports consistently, the sprint added direct test exports for `handleConnection`/`handleMessage` state seams and made production `safeStorage` access defensive with optional chaining.
**Recommendation:** For Electron CommonJS modules, expose narrow test seams for state-machine logic and guard runtime-dependent Electron APIs defensively. Use global Electron mocks only as a last resort, and do not rely on them as the sole proof for module-cache-sensitive behavior.
**Applies to:** Electron main-process tests, CommonJS modules, WebSocket server tests, runtime-dependent Electron APIs such as `safeStorage`.
**Status:** Observation. Promotion candidate if another Electron/CJS test seam hits the same module-cache fragility.

### SRL-083 — Electron lifecycle handlers belong inside the single-instance owner branch (SINGLE-INSTANCE-LOCK-1, 2026-05-29)
**Verdict:** Once an Electron app adopts `app.requestSingleInstanceLock()`, lifecycle handlers that create, restore, focus, or tear down windows should be registered only by the primary lock owner.
**Evidence:** SINGLE-INSTANCE-LOCK-1 wrapped `whenReady`, `window-all-closed`, `will-quit`, and `activate` behavior inside the lock-owner branch. The second process exits after failing the lock and never registers duplicate lifecycle handlers.
**Recommendation:** Future main-process lifecycle additions should go inside the primary-instance `else` branch unless they are intentionally needed before the lock check. Treat pre-lock handlers as exceptional and document the reason inline.
**Applies to:** Electron main-process lifecycle, single-instance lock, `BrowserWindow` creation/focus, app activation handlers.
**Status:** Observation.

### SRL-084 — Vite circular-chunk diagnosis requires build-API instrumentation, not grep-based import tracing (THEME-SYNC-1, 2026-05-29)
**Verdict:** Grep-based import tracing is insufficient for diagnosing Vite/Rollup circular chunk warnings — it misses edges created by Rollup's automatic module placement.
**Evidence:** THEME-SYNC-1's initial agent-based grep found only 1 of 2 cycle edges in `settings↔tts`. The `tempoStretch` edge was visible in source imports, but the `kokoroStatus`/`qwenStatus` edge was invisible — Rollup assigned those modules to the settings chunk because their only importers were settings-panel hooks, then `useNarration.ts` (TTS chunk) imported them, creating the reverse edge. Three iterative build-test cycles were needed. The programmatic build API (`chunk.imports` + `chunk.modules` from `vite.build()` with `write: false`) revealed all edges in one pass.
**Recommendation:** For any sprint diagnosing a Vite/Rollup circular chunk warning, start with the programmatic build API to dump chunk membership and inter-chunk imports. Reserve grep for confirming specific edges after the chunk map is known.
**Applies to:** Vite build config, `manualChunks`, Rollup chunk diagnostics.
**Status:** Observation.

### SRL-085 — Smoke tests must verify build version before issuing verdicts (THEME-SYNC-1, 2026-05-29)
**Verdict:** A smoke test verdict is only valid when the binary under test contains the fix being verified.
**Evidence:** The first THEME-SYNC-1 smoke ran against an old installed Blurby.exe (v1.1.2) instead of the post-fix dev build (v1.75.1). The RED verdict was moot — the circular chunk fix wasn't in the binary being tested. A retest on `npm run dev` (v1.75.1) produced the correct GREEN verdict. The version label check was buried at TS2 instead of being a blocking TS0 gate.
**Recommendation:** Every smoke checklist should include a TS0 step: verify the displayed version label matches the expected commit/version before any functional assertions. If the version doesn't match, stop and rebuild — don't issue a verdict on the wrong binary.
**Applies to:** All sprints with manual smoke gates, especially source-fix-only sprints where the running binary may be stale.
**Status:** Observation. Candidate for promotion to standing rule if a future smoke test repeats the stale-binary pattern.

### SRL-086 — Prose synthesis is not a substitute for grep on quantitative claims (NARRATE-DUAL-SOURCE-ULTRATHINK adversarial review, 2026-05-29)
**Verdict:** Any quantitative claim about the codebase that an architectural conclusion rests on — call-site counts, dispatch counts, reference counts, branch counts, edit-site enumerations — must be grep-verified against source before publishing. Prose summaries from upstream agents (Explore-agent reports, codex-parent dispatch summaries, prior close-outs) are inputs to be cross-checked, not citations to be propagated.
**Evidence:** The 2026-05-29 ULTRATHINK on narration dual-source architecture published five quantitative claims later caught as wrong by an adversarial review that ground-truthed file:line references against `useNarration.ts`:
1. "`applyRateChange` has 14 reseed paths" → grep-verified count is **6** (lines 1759, 1802, 1821, 1839, 1853, 1869). The "14" was propagated from codex-parent's dispatch-summary phrase "~14 speakNextChunk call sites I noted but didn't fully trace" without independent count.
2. "`getHeardFloorWordIndex` consumed in exactly one call site (line 1202)" → grep-verified **2 sites** (1202 re-entry seed + 1950 handoff-resume seed). The Explore agent's prose summary said "only used in ONE place"; I keyed off the prose rather than the agent's own enumeration table elsewhere in the same report.
3. "Sprint 5 enumerates 5 WORD_ADVANCE dispatch sites: lines 463, 972, 1073, 1159, 1313" → grep-verified **6 sites**: 463, 972, 1073, 1158, 1255, 1314. Line 1255 missed entirely; 3 of 5 line numbers off by ±1.
4. Stage 5 lifecycle ("resume → speakNextChunkKokoro reads from {…}" implying one path) → actual code has **three structurally distinct resume branches** at lines 1910, 1946, 1976; the bare-resume branch (1976) calls `kokoroStrategy.resume()` directly and does NOT route through `speakNextChunkKokoro` at all. The architectural conclusion that PAUSE-RESUME-UNIFY-1's `resumeTargetRef` fix is sufficient assumed all resume paths went through a seed-priority chain. Branch (c) doesn't — so the spec may need adjustment depending on which branch A4 actually fires through.
5. A4 reproducibility-on-main was implicitly assumed, but A4 was observed on `sprint/narrate-closed-loop-cursor` commit `0f1b2c8` (a branch that explicitly modified resume paths — see comment at `useNarration.ts:1947`). The dispatched 5-sprint sequence is built against clean main, where A4 may or may not reproduce.

The adversarial reviewer caught (1)–(5) by reading code at file:line precision. I had read the Explore agent's prose synthesis. Imprecisions (1)–(3) are mechanical; (4) is structural — it changes which mechanism Sprint 3 needs to fix; (5) is procedural — it changes the urgency framing of the entire sequence.
**Recommendation:** For any ULTRATHINK or sprint-spec authoring that involves quantitative architectural claims, the workflow is:
1. Dispatch the prose-synthesis pass (Explore agent or equivalent) for architecture mapping.
2. Independently grep / Read the source for every quantitative claim that any conclusion in the synthesis or spec depends on. Specifically: any count of "N call sites," "M branches," "exactly one consumer," "every path does X."
3. Cite the grep / Read line range in the spec; the prose summary is a footnote, not a citation.
4. When a quantitative claim is wrong, fix the spec inline AND update the source artifact (the ULTRATHINK document or the agent report) with a revision note preserving original-vs-corrected distinction. Don't silently overwrite — history matters for retrospective audit.

**Forward defense:** When invoking /roadmap-review or /write-spec to produce dispatch-ready specs, pre-pend an explicit "grep-verify every numerical claim before publishing" step to the workflow. Aristotle's enumeration memos in the per-sprint waves are the second line of defense, but they fire AFTER dispatch — they catch what the spec missed, not what the spec was silently confident about.
**Applies to:** ULTRATHINK protocol output; /roadmap-review skill output; /write-spec output; any architectural conclusion that rests on counts; any spec that anchors agent investigation scope on a numerical claim.
**Status:** **PROMOTED jointly with SRL-087 to Standing Rule #36** (ROADMAP.md, 2026-05-29) after the second-occurrence case (SRL-087) materialized within ~1 hour and validated the promotion-on-first-occurrence argument. Cost asymmetry confirmed in real time: the wrong-branch grep required a third commit (`cb6e894`) to reconcile spec line numbers against main. The two SRLs are siblings under the umbrella formulation; see Standing Rule #36 for the consolidated rule.
**Related:** SRL-070 (audio-independent gate evidence — same flavor of "don't trust the system to verify itself"); SRL-079 (rebuild gate — same flavor of "the artifact is not the verification"); `docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md` §"Revisions from adversarial review" (full corrections table); ROADMAP.md SK-N1 NARRATE-DUAL-SOURCE-DIAG-1 (now contains grep-verified counts and three-branch resume instrumentation).

### SRL-087 — Verify environment state (branch, cwd, build) before edits that depend on it (roadmap-review wrong-branch incident, 2026-05-29 — second occurrence in <1 hour after SRL-086)
**Verdict:** Editing governance files, running grep that informs governance, or otherwise producing dispatch-ready artifacts without first verifying current git branch, working directory, and build version produces work that may be correct in content but wrong in placement or grounded in the wrong source state. Sibling rule to SRL-086 (verify quantitative claims by grep). Together they instantiate the umbrella principle: *"Do not act on accumulated context as if it were verified state."*
**Evidence:** Within one hour of authoring SRL-086, Cowork executed the `/roadmap-review` skill end-to-end against `C:\Users\estra\Projects\Blurby` while the working directory was on `sprint/narrate-closed-loop-cursor` (the very branch the roadmap-review pass was dissolving) — without ever running `git status` or `git branch --show-current` at the start of the workflow. Compound consequences:
1. All governance edits (ROADMAP.md, SpecRetro.Lessons_Learned.md, sprint-queue.xlsx, plus two new files) sat as uncommitted changes on the dissolved branch. Recovery required a git-handoff packet: stash governance files → `git checkout main` → `git pull --ff-only` → `git stash pop` → stage + commit + push. Stash popped cleanly because main's pre-edit state for those three governance files was identical to dissolved's pre-edit state. Recovery cost: ~5 minutes Evan time.
2. The grep verification that SRL-086's fold-in performed (in response to the adversarial review) was executed against the dissolved branch's `useNarration.ts`. The dissolved branch added the `getHeardFloorWordIndex` wrapper and its 2 consumers — both of which DO NOT EXIST on main, because the supersede pulled them. The "consumed in 2 sites" correction I confidently published in SRL-086 was true for the dissolved branch but wrong for main (where it's 0 sites). Cascading correction required a second amendment commit on main with updated line numbers for `WORD_ADVANCE` (1246/1305 not 1255/1314), `applyRateChange` branches (1750-1860 not 1759-1869), `pause()` (1868 not 1877), `resume()` branches (1901/1937/1962 not 1910/1946/1976), and an expanded SK-N1 DIAG-1 Task 2 step ("Step 2a: re-introduce the heard-floor oracle on main as a clean addition") because the oracle the instrumentation was supposed to wrap does not exist on the baseline.

The grep was only as reliable as the codebase grep'd. Verifying claims-against-codebase (SRL-086) without first verifying codebase-state (this rule) was insufficient. Both verifications are required.

**Recommendation:** Before any Cowork workflow that edits governance files, edits the codebase, runs grep whose results feed into a governance/spec conclusion, or asks the user to act on environment-dependent state:
1. **Run `git status`** to confirm the working directory is in a known state. Note any uncommitted changes; decide explicitly whether they're in-scope for the current task.
2. **Verify the current branch** matches the intended dispatch target via `git branch --show-current`. If the workflow's output is meant to land on `main`, the branch must already be `main` (or there must be an explicit plan to migrate via stash + checkout).
3. **For build-version-dependent verdicts** (live-QA gates, smoke tests), verify the displayed version per SRL-085 BEFORE the first functional assertion.
4. **For grep-verified architectural claims** in any spec or artifact, cite the branch + commit hash + grep date in the spec, not just the line number. Example format: `WORD_ADVANCE sites: lines 463, 972, 1073, 1158, 1246, 1305 (grep-verified against main @ 4444276 on 2026-05-29)`. This makes future re-verification mechanical and makes branch-drift visible.

**For the `/roadmap-review` skill specifically:** Phase 0 ("Initiate") should add an explicit "verify git branch is the intended dispatch target" step before Phase A reads any document.

**Forward defense — paired rules:**
- SRL-085: verify build version before smoke verdict
- SRL-086: verify quantitative claims by grep before publishing
- SRL-087: verify environment state (branch, cwd) before consequential edits
- SRL-079: verify rebuild lands in binary before closing bug
- All four instantiate the same umbrella: *do not act on accumulated context as if it were verified state.*

**Status:** **PROMOTED jointly with SRL-086 to Standing Rule #36** (ROADMAP.md, 2026-05-29). The two occurrences across two different verification axes within ~1 hour proved decisive. Standing Rule wording: *"Accumulated context is not verified state; trust must be earned by an explicit verification step at the moment of consequence."* See Standing Rule #36 for the consolidated formulation, application rules (mandatory `git status` + `git branch --show-current` at workflow start, build-version verify where verdicts depend on it, branch+commit+date stamps on line-number-dependent spec citations), and the four-rule family (SRL-079, SRL-085, SRL-086, SRL-087) the umbrella consolidates.

**Applies to:** `/roadmap-review`, `/write-spec`, `/next-pointer` (when it cites code locations), `/live-qa` (when it triggers state-dependent edits), Cowork's adversarial-review fold-ins, any spec amendment that propagates line numbers or counts.

**Related:** SRL-070 (gate evidence independence), SRL-079 (rebuild gate), SRL-085 (smoke version gate), SRL-086 (grep-verify quantitative claims), ROADMAP.md SK-N1 DIAG-1 Task 2 (now contains Step 2a oracle re-introduction because of this incident), `docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md` §"Second revision — post-checkout-to-main re-verification" (full main-vs-dissolved diff table).

### SRL-088 — Instrumented gate replay is cheap insurance before a multi-sprint refactor (NARRATE-DUAL-SOURCE-DIAG-1, 2026-05-30)
**Verdict:** When a multi-sprint refactor sequence depends on a single architectural hypothesis, dispatching a flag-gated instrumentation sprint first to disambiguate the hypothesis is dramatically cheaper than committing the sequence and re-doing it if wrong. A 1-day instrumented diagnostic (DIAG-1) REFUTED the ULTRATHINK's central A4 thesis (an in-hook dual-source race) and identified the true cause (a never-cleared reader-layer resume anchor) BEFORE 4 implementation sprints committed to the wrong fix.
**Evidence:** NARRATE-DUAL-SOURCE-DIAG-1 was an XS-effort instrumentation sprint that added telemetry events to A1/A4/A5 paths under a localStorage flag. Its live-QA gate REFUTED the in-hook dual-source race as the cause of A4 and CONFIRMED the reader-layer never-cleared `resumeAnchor` as the actual root cause. The decisive enabler was instrumenting BOTH candidate layers (in-hook AND reader-layer) so a single live-QA replay could discriminate competing hypotheses — the smoking gun was the ABSENCE of a `resumeAnchor:consumed` event, detectable only by cross-layer instrumentation. Corollary catch: `heardFloor` was null (cold engine) at A4 resume, so there was no live in-hook source to "lose a race" to — itself a disproof of the race thesis. Without DIAG-1 the 4-sprint unification sequence would have committed against the wrong root cause (~10–15 days); the diagnostic cost 1 day.
**Recommendation:** When a buffer of 3+ sprints depends on a single root-cause hypothesis, make the queue head a flag-gated instrumentation sprint that can REFUTE or CONFIRM that hypothesis from live evidence before the heavy work commits. Instrument EVERY competing-hypothesis layer, not just the leading one — the value of the gate is discrimination, not confirmation — and reuse the instrumentation as a verification harness for the downstream sprints.
**Applies to:** Multi-sprint refactors; architectural-hypothesis-driven roadmaps; ULTRATHINK-to-execution handoffs; any sequence where a single bad assumption invalidates several queued sprints.
**Related:** SRL-070 (audio-independent gate evidence); SRL-086/SRL-087 (verify state before consequential action); `docs/studies/investigations/NARRATE-DUAL-SOURCE-DIAG-1.md` (the verdict).
**Status:** Observation. Strong promotion candidate (the value of the pattern is already clear from one occurrence); re-evaluate at the next /roadmap-review. (Numbered SRL-088 because SRL-080 was already taken by the openpyxl/Excel-formula-machinery lesson; the dispatch requested "SRL-080" but the next free number was SRL-088.)

### SRL-089 — Don't parallel-launch work that depends on an in-flight agent's output (NARRATE-DUAL-SOURCE-DIAG-1, 2026-05-30; recurrence in NARRATE-INTENT-CURSOR-1, 2026-05-31)
**Verdict:** Worker agents dispatched in parallel onto a shared worktree must declare write-disjoint surfaces. Dependent workers — where worker B's correctness depends on worker A's output — must NEVER be dispatched in parallel onto the same tree; they must be serialized OR each operate in its own git worktree (`git worktree add`). Parallelism is only safe across independent tasks; a dependent task launched in parallel reads a pre-condition that does not yet hold, producing a confidently-wrong result that is more expensive to disambiguate than to sequence.
**Evidence:** Two occurrences in two consecutive sprints. (1) DIAG-1 Wave B: the implementer (Hercules), verifier (Hippocrates), and Wave-B git commit were launched in one parallel batch, but verify and commit both depend on the implementer finishing — Hippocrates ran against the pre-implementation tree and returned a spurious RED ("instrumentation not present"), and the commit failed on a stale pathspec; both were re-run sequentially after the implementer completed. (2) NARRATE-INTENT-CURSOR-1 Task 3: same pattern, same tree-isolation gap. ~90 min wasted compute per occurrence (3 hours total). Both caught at close-out; both required a clean redo from a serialized dispatch.
**Recommendation:** Zeus (and any orchestrator) must include a dependency-and-tree-isolation check before parallelizing worker dispatches. Two safe patterns: (a) serialize workers when surfaces overlap or outputs feed each other; (b) `git worktree add` per worker when parallelism is required for latency reasons. Treat "verify before commit" as a hard sequential gate, never a parallel sibling of the thing it verifies. Sprint Task tables that mark dependent tasks `parallel-eligible` are spec defects and must be caught at Plan-tier review. Cost asymmetry: serialize/isolate is seconds of dispatch overhead; parallel-mis-dispatch is ~90 min per occurrence.
**Applies to:** All Zeus orchestration; multi-agent dispatch planning; sub-agent fan-out patterns; sprint Task 3-style "implement + verify in parallel" wave designs; `superpowers:dispatching-parallel-agents`; any workflow that batches implement + test + commit.
**Related:** SRL-086/SRL-087 (verify state at the moment of consequence — a parallel verifier verifies the wrong state); Virtuoso "three-call rule" / sequential narration.
**Status:** **Promoted to Standing Rule #37** (ROADMAP.md, 2026-05-31 — after the 2nd occurrence in NARRATE-INTENT-CURSOR-1, per SRL-012's two-validated-occurrences promotion convention).

### SRL-090 — Verify a structured data file's real schema before any programmatic write, and assert target-row identity in the write script (NARRATE-DUAL-SOURCE-DIAG-1 closeout, 2026-05-30)
**Verdict:** Any script that writes to a structured data file (xlsx, json, csv with header conventions) must first verify the file's actual schema (column names, row identity, header layout) and assert target-row identity at write time. Schema assumptions propagated from prior context — even recently-correct context — can drift and produce silent writes to the wrong cell. A structured-file write is a consequential edit (SRL-086 family); an xlsx/json/csv has no compiler or test to catch a wrong row/column index, so the only guard is reading the real schema first and asserting identity at the write site.
**Evidence:** DIAG-1's `sprint-queue.xlsx` Catalog reshape was written (openpyxl) against an *assumed* layout (col2=Seq, active rows 5–8) when the real Catalog is 15 columns with col1=Seq and the active queue at rows 46–51. The script overwrote historical completed-sprint rows (TTS-REGISTRY-1, TTS-NORMALIZE-1, TTS-CACHE-TIMING-1, TTS-SYNC-1, TTS-INTEGRATE-1) and never touched the real queue — and the corrupted file was committed and pushed before detection. Recovery: `git checkout <good-rev> -- file`, then a redo whose write script first `assert`ed the sprint code at each target row before mutating; the corrected redo was clean on the first try.
**Recommendation:** Before any programmatic mutation of a structured data file: (a) dump the real header + target region and confirm the column map and row positions, asserting against a known-good column-name set; (b) locate target rows by *value* match (e.g., `Sprint Code == "..."`) not by index, and `assert` the identity of each target cell before writing so a wrong assumption aborts instead of corrupting; (c) emit a pre-write "about to write to row N: <Sprint Code value>" log line; (d) re-read after write and dump the result to verify *before* committing — never commit a structured-file write on the strength of the write call alone. openpyxl gotcha: `ws.cell(r,c, None)` is a no-op; clear a cell with `ws.cell(r,c).value = None`. The Catalog tab in particular has been modified by hand several times in 2026-05 and column indices have drifted.
**Applies to:** all `scripts/recalc.py`-adjacent xlsx edits; any openpyxl/csv/json programmatic write to a governance or data file; `/phase-closeout` and `/roadmap-review` queue edits; any script that mutates structured user data.
**Related:** SRL-086 (grep-verify quantitative claims before publishing — this is its structured-file specialization); SRL-080 (openpyxl erases Excel formula machinery); HYG-XLSX-DASHBOARD-RESTORE (openpyxl/Dashboard quarantine).
**Status:** Observation. Promotion candidate if a 2nd occurrence appears in another openpyxl-driven write surface.

### SRL-091 — Reactive write-site cleanup is not equivalent to preventive read-site priority, when stale state can be re-populated faster than the cleanup fires (NARRATE-INTENT-CURSOR-1, 2026-05-31)
**Verdict:** When a piece of state X gates a downstream read site R that runs on a cold-start / re-entry path, adding reactive cleanup to clear X *after* its use is necessary but not sufficient — the read site R can fire BEFORE any cleanup-triggering event reaches it, in which case R still reads stale X. The decisive fix is a preventive read-site priority chain: R should prefer fresh sources (heard-position, explicit resume target) over the stale gate state, not just rely on the gate being cleared.
**Evidence:** NARRATE-INTENT-CURSOR-1 added a `shouldConsumeResumeAnchorOnAdvance` predicate + two per-word handlers that fire `resumeAnchor:consumed` and null the anchor on first word-advance strictly past it. The new `resumeAnchor:consumed` event correctly appeared in live-QA traces (first-ever sighting), confirming the consume code path executes. But A4 still failed 0-of-3: the consume fires at `approxWordIdx:67` AFTER the cold-start resume seed has already read `startIdx:66` from the still-stale anchor — the seed read happens BEFORE any audio advance can fire the consume. Additionally, the persistent hard-selection re-populates the anchor after each consume, restoring the trap. The reactive-cleanup architecture is correct as in-flight scaffolding (it breaks the gravity well once narration restarts) but cannot fix cold-start by construction; PAUSE-RESUME-UNIFY-1's seed priority chain (`heardFloor` / `resumeTarget` over the stale anchor at the read site) is the decisive control point.
**Recommendation:** When designing a state-mutation lifecycle for a value that downstream reads gate on, distinguish two control points up front: (a) the *write-site* lifecycle (set, consume, clear) and (b) the *read-site* priority chain (which source wins on cold-start / re-entry). If the value can be stale at any cold-start read, the read-site priority chain is the *decisive* control point; the write-site lifecycle is *scaffolding* that hardens the in-flight case. Sprint specs that claim to "fix" a cold-start failure with a write-site lifecycle alone should be re-scoped to include the read-site priority chain in the same sprint, or explicitly bisected with a dependent sprint named as the completion (INTENT-CURSOR-1 + PAUSE-RESUME-UNIFY-1 is the bisected pattern that emerged here).
**Applies to:** State-lifecycle design (anchors, cursors, refs, snapshots); cold-start / re-entry paths; resume / restart code; any sprint that aims to fix a position-preservation failure via a refcount-style or consume-style lifecycle alone.
**Status:** Observation. Promotion candidate if a 2nd occurrence appears in another state-lifecycle sprint (e.g., a future subscriber-cursor or seed-chain refactor).
