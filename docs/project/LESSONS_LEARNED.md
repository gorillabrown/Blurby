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
**Status:** resolved (Sprint 3)
**Priority:** high

**Context:** The Electron main process file (main.js) handles everything: IPC, file I/O, folder watching, data persistence, URL extraction, PDF export, format parsing, migrations, window management. At 93KB it's the single largest file and a maintenance hazard.

**Resolution:** Sprint 3 modularized main.js into 7 files: main.js (993-line orchestrator) + 6 focused modules in `main/` (ipc-handlers, file-parsers, url-extractor, window-manager, migrations, folder-watcher). Uses a context object pattern for shared state.

**Guardrail:** Keep each module under ~1000 lines. New main-process functionality goes into the appropriate module, not main.js.

---

### [2026-03-21] LL-004: GitHub Repo is Private — No CI/CD

**Area:** infrastructure, quality
**Status:** resolved (Sprint 8)
**Priority:** moderate

**Context:** The repo (`gorillabrown/Blurby`) has no GitHub Actions, no automated test runs on PR, no build verification. Tests and builds only run manually.

**Resolution:** Sprint 8 added `.github/workflows/ci.yml` (test + typecheck + build on push/PR, win+linux matrix) and `.github/workflows/release.yml` (NSIS installer on v* tags, uploaded to GitHub Releases).

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

### [2026-03-21] LL-006: Cherry-Pick Conflicts When Parallel Agents Modify the Same Monolith

**Area:** process, parallel execution, git
**Status:** resolved
**Priority:** high

**Context:** During Sprints 2 and 3, parallel agents (renderer-fixer and electron-fixer) worked on separate concerns but both touched main.js before it was modularized. When cherry-picking their changes into the main worktree, merge conflicts were frequent and painful because both agents had modified overlapping regions of the 2,375-line monolith.

**Root Cause:** A monolithic file is an implicit dependency between all agents that touch it. Parallel work on a monolith defeats the purpose of parallelization — the merge cost erases the time savings.

**Guardrail:** Always modularize before parallelizing. Sprint 3 (main.js modularization) should have been sequenced before Sprint 2, or at minimum Sprint 2 should have been limited to renderer-only files. When a monolith exists, either (a) modularize it first as a blocking prerequisite, or (b) serialize all work that touches it.

---

### [2026-03-21] LL-007: Lazy-Loading Heavy Node Modules in Electron

**Area:** performance, electron, startup
**Status:** active
**Priority:** high

**Context:** Sprint 4 lazy-loaded 5 heavy modules (chokidar, cheerio, adm-zip, pdf-parse, @napi-rs/canvas) that were previously `require()`-d at startup. These modules total ~13MB of heap and add measurable seconds to app launch time, even though most users won't need all of them in a given session.

**Technique:** Move `require()` calls from the top of the file into the functions that actually use them. In the modularized structure, this is clean — `main/file-parsers.js` lazily requires adm-zip and pdf-parse only when parsing those formats, `main/folder-watcher.js` lazily requires chokidar only when a folder is actually watched.

**Guardrail:** Any new heavy dependency added to the main process should be lazy-loaded by default. Only `require()` at module scope if the module is needed on every single app launch (e.g., electron, fs, path).

---

### [2026-03-21] LL-008: Ref-Based DOM Updates for High-Frequency UI

**Area:** performance, react, reader
**Status:** active
**Priority:** high

**Context:** Sprint 5 converted both RSVP and flow reader modes from React state-driven updates to ref-based direct DOM manipulation during active playback. Previously, `setWordIndex()` fired on every requestAnimationFrame tick, causing a full React re-render for every word displayed — at 300+ WPM, that is 5+ renders per second with the entire component tree re-evaluating.

**Technique:** During playback, store the current word index in a ref and update the DOM element directly (textContent for RSVP, classList swap for flow mode). Only sync back to React state periodically (every 5 seconds or 50 words) for progress tracking. On pause/stop, sync the final position to React state so the UI is consistent.

**Trade-off:** This breaks React's declarative model — the DOM and React state are temporarily out of sync during playback. This is acceptable because (a) the user cannot interact with other UI elements during active playback, and (b) state is reconciled on every pause/stop.

**Guardrail:** Only use ref-based DOM updates for high-frequency visual updates where React's render cycle is the bottleneck. Always reconcile back to React state when the high-frequency operation ends. Document the sync boundary clearly in code comments.

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
| PR-10 | Modularize monoliths before parallelizing agent work on them | LL-006 |
| PR-11 | Lazy-load heavy Node modules by default in main process | LL-007 |
| PR-12 | Use ref-based DOM updates for high-frequency UI; reconcile on pause/stop | LL-008 |

---

## Known Traps

| Trap | Area | Mitigation |
|------|------|------------|
| OneDrive cloud-only files | Cowork VM | Check for EINVAL errors; fall back to GitHub browser |
| Synchronous fs in main process | Electron | Audit and convert all remaining sync calls (Sprint 4 addressed) |
| React re-renders during playback | Reader | Use ref-based DOM updates during active play (Sprint 5 resolved) |
| Parallel agents on monolithic files | Git/Process | Modularize first, then parallelize (LL-006) |
| Heavy require() at startup | Electron | Lazy-load inside functions; only top-level require for always-needed modules |
| IPC channel name typos | Full stack | Channel names must match across main.js, preload.js, renderer |
| EPUB with NCX-only TOC | Format parsing | Handle both NCX and nav TOC extraction paths |
| PDF multi-column text order | Format parsing | Document as known limitation |
| DRM-protected ebooks | Format parsing | Detect and message — never bypass |
