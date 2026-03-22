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
