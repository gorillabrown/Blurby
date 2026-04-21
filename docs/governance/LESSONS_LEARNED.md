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

**Guardrail (PR-091):** Any sprint with 5+ implementation tasks (not counting tests, verification, docs, git) MUST be pre-split into waves at dispatch time. Standard split: Wave A = all implementation tasks + test writing + npm test/build. Wave B = spec compliance (Solon) + docs (Herodotus) + git (Hermes). This is a planning-time decision, not a runtime recovery. The dispatch prompt should explicitly name the wave.

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
