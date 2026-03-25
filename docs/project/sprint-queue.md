# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top sprint, paste into CLI, execute. After completion, remove it, log it, backfill to ≥3.

**Format:** CLI Evergreen Template (`.workflow/docs/sprint-dispatch-template.md`). FIFO — top sprint executes next.

**Queue rules:** See `.workflow/docs/sprint-queue.md` for full operational rules.

---

```
SPRINT QUEUE STATUS:
Queue depth: 4
Next sprint: HOTFIX-1 — Grid Interaction Bugs
Health: OK
Action needed: Dispatch HOTFIX-1, then resume Sprint 23
```

---

## Queue

---

## HOTFIX-1 — Grid Interaction Bugs (Checkbox Bleed + Drag-Region Scroll Block)

### KEY CONTEXT
App is post-Sprint 23B merge (v1.0.2 tag pushed). Two UI bugs visible in production: a stray checkbox renders in the top-left window corner, and empty grid gaps between book cards swallow click and scroll events. Both are regressions from Sprint 20/23 code (selection checkboxes + body drag region).

### PROBLEM
1. **Stray checkbox**: Every `DocGridCard` renders a selection checkbox (`doc-grid-checkbox`) because the guard condition `onToggleSelect && selected !== undefined` is always true — `selected` is passed as `false` (not `undefined`) from LibraryContainer line 563/577. The checkbox at `position: absolute; top: 8px; left: 8px; z-index: 2` appears on every card, with the top-left one bleeding into the window corner.
2. **Grid gaps block interaction**: The `body` element has `-webkit-app-region: drag` (global.css line 52). Grid gaps between cards inherit this, making them window-drag zones that swallow clicks and scroll events. Cards themselves work because their interactive children (`button`, `input`, `[role="button"]`) get the `no-drag` rule (line 54), but the empty space between cards has no such override.

### EVIDENCE OF PROBLEM
- Screenshot: checked checkbox visible at ~(10, 10) window coordinates, above the hamburger menu
- Screenshot: user cannot scroll library when cursor is positioned over blank grid gap; scroll works when cursor is over a card
- Code: `DocGridCard.tsx` line 63: `{onToggleSelect && selected !== undefined && (` — `selected` is `boolean`, never `undefined`
- Code: `global.css` line 51-52: `overflow: hidden; -webkit-app-region: drag;` on `body`

### HYPOTHESIZED SOLUTION
**Bug 1 fix**: Change the checkbox guard in `DocGridCard.tsx` to only show when selection mode is active. Replace condition with `{onToggleSelect && selected && (` — checkboxes only appear on cards that are actually selected. Alternatively, add a `selectionMode` prop that LibraryContainer sets to `true` only when `selectedIds.size > 0`.
**Bug 2 fix**: Add `-webkit-app-region: no-drag` to `.doc-grid` in `global.css`. This ensures grid gaps don't act as drag regions. The titlebar area (`.library-titlebar`) already has its own drag region.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Fix checkbox guard in `DocGridCard.tsx` — only render when `selected === true` | `renderer-fixer` | sonnet |
| 2 | Add `-webkit-app-region: no-drag` to `.doc-grid` and `.library-content` in `global.css` | `renderer-fixer` | sonnet |
| 3 | Run `npm test` — all 512 tests must pass | `test-runner` | haiku |
| 4 | Run `npm run build` — must compile clean, zero TS errors | `test-runner` | haiku |
| 5 | Commit on branch `hotfix/grid-interaction`, merge to main with `--no-ff` | `blurby-lead` | — |
| 6 | Print terminal summary of changes | `blurby-lead` | — |

### WHERE (Read in This Order)

1. `src/components/DocGridCard.tsx` — lines 62-67, checkbox rendering guard
2. `src/styles/global.css` — line 51-52 (body drag region), line 1860-1865 (`.doc-grid`), line 2856-2869 (checkbox styles)
3. `src/components/LibraryContainer.tsx` — lines 494-500 (selectedIds/onToggleSelect props passed to LibraryView)

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | Both CSS and component fixes — small scope, same domain |
| `test-runner` | haiku | Verify tests + build |
| `blurby-lead` | — | Orchestrate, commit, merge |

### WHEN (Execution Order)

```
[1-2] PARALLEL:
    ├─ [1] Fix checkbox guard (renderer-fixer)
    └─ [2] Add no-drag to grid (renderer-fixer)
    ↓ (both complete)
[3-4] PARALLEL:
    ├─ [3] npm test (test-runner)
    └─ [4] npm run build (test-runner)
    ↓ (both pass)
[5] Commit + merge (blurby-lead)
[6] Print summary (blurby-lead)
```

### ADDITIONAL GUIDANCE
- **Do NOT add `pointer-events: none` to overlays** — those are conditionally rendered and only visible when active. They're not the cause.
- The `onToggleSelect` prop is always passed (it's a function from LibraryContainer). The fix must key off selection *state*, not prop presence.
- After merge, a new `v1.0.3` tag + release build will be needed to push the fix to users via auto-update.

### SUCCESS CRITERIA

1. No checkbox visible on any card when no cards are selected (`selectedIds.size === 0`)
2. Scrolling works everywhere in the library grid — over cards AND between cards
3. Clicking blank grid space closes the menu flap (if open)
4. Window dragging still works from the title bar area
5. `npm test`: 512 pass, 0 fail
6. `npm run build`: 0 TypeScript errors
7. Branch `hotfix/grid-interaction` merged to main

---

## Sprint 23 — V1 Hardening

### KEY CONTEXT
Sprints 1-22 delivered a feature-rich reading app, but it hasn't been polished for first-time users or tested against edge-case failures. No performance baselines exist. Constants are scattered across source files. The 11 new Sprint 20/21 components haven't been audited for WCAG 2.1 AA. The auto-update pipeline has never been tested end-to-end. This sprint is the final polish pass before the external audit gate.

### PROBLEM
Six gaps between current state and v1 readiness:
1. No first-run experience — new users see an empty library with no guidance
2. Error recovery is inconsistent — some failures show technical messages, some show nothing
3. ~15 behavioral constants hardcoded across source files instead of in dedicated constants files
4. 11 components added after Sprint 15 a11y pass haven't been audited for WCAG 2.1 AA
5. No performance baselines (startup time, memory, word advance latency, FPS)
6. Auto-update never tested end-to-end (only unchecked item on Track A)

### EVIDENCE OF PROBLEM
1. `settings.json` has no `firstRunCompleted` flag — no detection mechanism exists
2. Error messages in `file-parsers.js` and `sync-engine.js` are developer-oriented (stack traces, error codes)
3. Constants scattered: `MIN_WPM`/`MAX_WPM` in `src/utils/text.ts`, pause values in `src/utils/rhythm.ts`, LRU sizes in main process modules — no `src/constants.ts` or `main/constants.js` exists
4. Sprint 20 added: CommandPalette, ShortcutsOverlay, GoToIndicator, SnoozePickerOverlay, TagPickerOverlay, HighlightsOverlay, QuickSettingsPopover, NotePopover. Sprint 21 added: HotkeyCoach, ReaderBottomBar, PageReaderView. None have ARIA audit records.
5. No `tests/perf-baseline.js` or `npm run perf` script exists
6. ROADMAP Track A acceptance criteria: `[ ] End-to-end auto-update test: tag v1.0.0 → install → tag v1.0.1 → verify update (manual)`

### HYPOTHESIZED SOLUTION
Six parallel workstreams: (A) OnboardingOverlay component with public-domain sample doc, (B) error message audit across all catch blocks, (C) create `src/constants.ts` + `main/constants.js` and update all imports, (D) WCAG 2.1 AA audit on 11 components, (E) perf benchmark script, (F) auto-update E2E test doc.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Build first-run onboarding (23A) | `renderer-fixer` | sonnet |
| 2 | Error recovery UX audit + fixes (23B) | `renderer-fixer` + `electron-fixer` | sonnet |
| 3 | Constants extraction (23C) — create files, update all imports | `renderer-fixer` + `electron-fixer` | sonnet |
| 4 | Accessibility audit on 11 Sprint 20/21 components (23D) | `renderer-fixer` | sonnet |
| 5 | Performance baseline script (23E) | `perf-auditor` | sonnet |
| 6 | Auto-update E2E test procedure doc (23F) | `doc-keeper` | sonnet |
| 7 | Verify spec compliance | `spec-reviewer` | sonnet |
| 8 | Run full test suite + build | `test-runner` | haiku |
| 9 | Update docs | `doc-keeper` | sonnet |
| 10 | Git commit + merge | `blurby-lead` | — |

### WHERE (Read in This Order)
1. `CLAUDE.md` — System state, constants separation rule, standing rules
2. `.workflow/session-bootstrap.md` — Skill Gate, anti-rationalization
3. `docs/project/LESSONS_LEARNED.md` — Guardrails
4. `ROADMAP.md` §Sprint 23 — Full spec (23A–23F), acceptance criteria
5. `docs/project/AGENT_FINDINGS.md` — AF-001 (constants extraction) details
6. `src/utils/text.ts` — Current constant locations (MIN_WPM, MAX_WPM, etc.)
7. `src/utils/rhythm.ts` — Pause calculation constants
8. `src/components/CommandPalette.tsx` — First of 11 audit targets
9. `src/styles/global.css` — Existing a11y patterns to follow

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `renderer-fixer` | sonnet | Onboarding (23A), error recovery in renderer (23B partial), constants extraction in `src/` (23C partial), a11y audit fixes (23D) |
| `electron-fixer` | sonnet | Error recovery in main process (23B partial), constants extraction in `main/` (23C partial) |
| `perf-auditor` | sonnet | Performance baseline script (23E) |
| `doc-keeper` | sonnet | Auto-update E2E doc (23F), post-sprint doc updates |
| `spec-reviewer` | sonnet | Verify all acceptance criteria |
| `test-runner` | haiku | Full test + build |

### WHEN (Execution Order)

```
[1–3, 5–6] PARALLEL:
    ├─ [1] Onboarding (renderer-fixer)
    ├─ [2] Error recovery (renderer-fixer + electron-fixer)
    ├─ [3] Constants extraction (renderer-fixer + electron-fixer)
    ├─ [5] Perf baseline script (perf-auditor)
    └─ [6] Auto-update E2E doc (doc-keeper)
    ↓ (1 complete)
[4] A11y audit (renderer-fixer) — depends on 1 (new OnboardingOverlay needs audit too)
    ↓ (all complete)
[7] Spec compliance review (spec-reviewer)
    ↓
[8] Test suite + build (test-runner)
    ↓
[9] Documentation update (doc-keeper)
    ↓
[10] Git commit + merge (blurby-lead)
```

### ADDITIONAL GUIDANCE
- **Sample document**: Use a public-domain classic — opening of *A Tale of Two Cities* or Thoreau's *Walking*. Confirm no copyright concern. Pre-load into library as "[Sample] ..."
- **Constants extraction**: CSS custom properties in `global.css` are exempt. Only extract JS/TS constants.
- **A11y audit**: Follow Sprint 15 patterns. Every overlay needs: ARIA role, Escape to close, focus trapping, reduced motion respect.
- **Perf baselines**: Startup test may need Electron-specific instrumentation. If impractical in Vitest, document as a manual procedure alongside the auto-update E2E.
- **Branch**: `sprint/23-v1-hardening`

### SUCCESS CRITERIA
1. First launch shows welcome screen with branding and "Get Started"
2. Sample public-domain document pre-loaded in library on first run
3. 3-step tooltip tour points to library, document card, mode buttons
4. Tour can be skipped; `firstRunCompleted` flag prevents re-showing
5. PDF parse failure shows user-friendly toast with retry/remove
6. URL import failure shows "Open in browser" fallback
7. Network failure shows "Sync paused — will retry when online"
8. All caught errors logged to `error.log`
9. `src/constants.ts` contains all renderer constants — no inline magic numbers remain
10. `main/constants.js` contains all main process constants
11. All source files import from constants files
12. All 11 Sprint 20/21 components pass WCAG 2.1 AA audit
13. Keyboard navigation works in all overlays/dialogs
14. Screen reader announcements verified for state changes
15. `prefers-reduced-motion` respected in all new components
16. `npm run perf` produces baseline results with all 6 metrics
17. Startup to interactive < 3s (cold start)
18. Word advance latency < 2ms (p99)
19. Auto-update E2E test procedure documented
20. `npm test` passes, `npm run build` succeeds
21. Branch `sprint/23-v1-hardening` merged to main with `--no-ff`

---

## Sprint 24 — External Audit

### KEY CONTEXT
Sprints 1-23 are complete. The app is feature-rich, hardened, and benchmarked. Before tagging v1.0.0, we run the full external audit pipeline — an independent, systematic review of the entire codebase covering everything since the last a11y pass (Sprint 15) through Sprint 23.

### PROBLEM
No independent quality review has been performed on the codebase since Sprint 15. Eight sprints of feature work (16-23) have accumulated without a comprehensive code quality, architecture compliance, or test coverage audit.

### EVIDENCE OF PROBLEM
Per CLAUDE.md External Audit Cadence: "Run at any major phase boundary (e.g., before v1.0.0 release)." v1 release is the most critical audit point in the project lifecycle.

### HYPOTHESIZED SOLUTION
Four parallel audit workstreams per `.workflow/skills/external-audit/SKILL.md`: code quality, test coverage, architecture review, documentation alignment. All findings logged to `AGENT_FINDINGS.md` for triage.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Code quality audit — lint, dead code, naming, type safety, known-trap regression (24A) | `code-reviewer` | sonnet |
| 2 | Test coverage audit — feature-to-test mapping, coverage gaps (24B) | `code-reviewer` | sonnet |
| 3 | Architecture review — dependencies, bundle size, security surface, sync correctness (24C) | `ui-investigator` | opus |
| 4 | Documentation alignment — CLAUDE.md, ROADMAP.md, LESSONS_LEARNED accuracy (24D) | `doc-keeper` | sonnet |
| 5 | Consolidate all findings | `blurby-lead` | — |
| 6 | Print audit summary in terminal | `blurby-lead` | — |

### WHERE (Read in This Order)
1. `.workflow/skills/external-audit/SKILL.md` — Full audit protocol
2. `CLAUDE.md` — Standing rules to verify against
3. `docs/project/LESSONS_LEARNED.md` — Known traps to check for regression
4. `ROADMAP.md` — Acceptance criteria to verify implementations against
5. `src/types.ts` — Type definitions for correctness checks
6. `package.json` — Dependencies for bundle/security review
7. `preload.js` — Security boundary review

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `code-reviewer` | sonnet | Code quality (24A) + test coverage (24B). Follow `.workflow/agents/quality-reviewer.md` protocol. Output: READY/MINOR_FIXES/MAJOR_REVISION per area. |
| `ui-investigator` | opus | Architecture review (24C). Read-only deep analysis. |
| `doc-keeper` | sonnet | Documentation alignment (24D). Follow `.workflow/agents/doc-keeper.md` protocol. |

### WHEN (Execution Order)

```
[1–4] FULLY PARALLEL:
    ├─ [1] Code quality audit (code-reviewer)
    ├─ [2] Test coverage audit (code-reviewer)
    ├─ [3] Architecture review (ui-investigator)
    └─ [4] Documentation alignment (doc-keeper)
    ↓ (all four complete)
[5] Findings consolidation (blurby-lead)
    ↓
[6] Print audit summary (blurby-lead)
```

### ADDITIONAL GUIDANCE
- **This is a READ-ONLY audit.** Do not fix anything. All issues go to `AGENT_FINDINGS.md` with severity (CRITICAL/WARNING/NOTE) and recommended fix.
- **If CRITICAL findings emerge:** Escalate to Cowork before proceeding to v1 tag. CRITICALs block release.
- **Branch**: No branch needed — audit is read-only. If minor doc fixes are needed, use `sprint/24-external-audit`.

### SUCCESS CRITERIA
1. Zero known-trap regressions from LESSONS_LEARNED.md
2. All standing rules from CLAUDE.md verified compliant
3. Dead code and unused imports flagged in findings
4. Every feature set has at least one test file mapped
5. Coverage gaps logged with recommended test additions
6. No circular dependencies
7. Bundle analysis completed — largest modules identified
8. Security surface reviewed (IPC channels, CSP, token storage)
9. CLAUDE.md file paths and feature statuses match codebase
10. ROADMAP.md acceptance criteria match implementations
11. All findings consolidated in `docs/project/AGENT_FINDINGS.md` with severity ratings

---

## Sprint 25 — RSS Library + Paywall Site Integration

### KEY CONTEXT
v1.0.0 is released. Sprint 21L added paywall detection and login persistence for URL imports. Users who subscribe to paywalled publications currently have to manually paste each article URL. This sprint extends the paywall login into a full feed aggregation system with a dedicated RSS Library UI.

### PROBLEM
Users with paywall subscriptions (NYT, WSJ, The Atlantic, etc.) have no way to browse available articles from those sources within Blurby. They must find articles on each site separately, copy URLs, and paste them one by one. This is friction that reduces the utility of Blurby's URL import for habitual readers of subscription content.

### EVIDENCE OF PROBLEM
Sprint 21L's paywall login proves users authenticate to these sites through Blurby. The infrastructure for authenticated fetching exists. What's missing is the discovery layer — a way to see what's available without leaving the app.

### HYPOTHESIZED SOLUTION
New data model (`Feed`, `FeedItem`), feed parser (RSS 2.0/Atom 1.0/JSON Feed), RSS Library UI (separate from main Library), and cloud sync for feed subscriptions. Articles stay in the RSS Library as lightweight items until the user explicitly imports one into their Blurby Library via the existing Readability pipeline.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Feed discovery + management engine (25A) — data model, IPC channels, `feeds.json` | `electron-fixer` | sonnet |
| 2 | Feed item fetching + caching (25B) — RSS/Atom/JSON parser, authenticated fetch, dedup | `format-parser` | sonnet |
| 3 | RSS Library UI (25C) — FeedLibrary component, FeedItemCard, keyboard shortcuts | `renderer-fixer` | sonnet |
| 4 | Cloud sync for feeds (25D) — feed list + read states sync | `electron-fixer` | sonnet |
| 5 | Verify spec compliance | `spec-reviewer` | sonnet |
| 6 | Run full test suite + build | `test-runner` | haiku |
| 7 | Update docs | `doc-keeper` | sonnet |
| 8 | Git commit + merge | `blurby-lead` | — |

### WHERE (Read in This Order)
1. `CLAUDE.md` — System state, sync architecture
2. `ROADMAP.md` §Sprint 25 — Full spec (25A–25D), acceptance criteria
3. `main/sync-engine.js` — Existing sync entity model (add feeds alongside library/settings/history)
4. `main/file-parsers.js` — Existing format parser patterns
5. `main/url-extractor.js` — Existing Readability pipeline (reused for "Add to Blurby")
6. `src/components/MenuFlap.tsx` — Where "Feeds" nav item goes
7. `src/hooks/useKeyboardShortcuts.ts` — Existing shortcut patterns for G-sequences

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `electron-fixer` | sonnet | Feed engine (25A), cloud sync integration (25D) |
| `format-parser` | sonnet | RSS/Atom/JSON Feed parsing (25B) |
| `renderer-fixer` | sonnet | RSS Library UI (25C) — components, keyboard shortcuts |
| `spec-reviewer` | sonnet | Verify all acceptance criteria |
| `test-runner` | haiku | Full test + build |
| `doc-keeper` | sonnet | Post-sprint doc updates |

### WHEN (Execution Order)

```
[1] Feed engine (electron-fixer)
    ↓
[2] Feed parser (format-parser) — depends on 1
    ↓
[3–4] PARALLEL:
    ├─ [3] RSS Library UI (renderer-fixer) — depends on 2
    └─ [4] Feed cloud sync (electron-fixer) — depends on 1-2
    ↓ (both complete)
[5] Spec compliance review (spec-reviewer)
    ↓
[6] Test suite + build (test-runner)
    ↓
[7] Documentation update (doc-keeper)
    ↓
[8] Git commit + merge (blurby-lead)
```

### ADDITIONAL GUIDANCE
- **New dependency**: XML parser for RSS/Atom. Prefer lightweight — `fast-xml-parser` (~35KB) over `xml2js` (~80KB). Lazy-load.
- **Feed retention**: Max 200 items per feed. Prune oldest on each fetch cycle.
- **Auth reuse**: Cookies/sessions from Sprint 21L paywall login must be forwarded to feed fetch requests for authenticated feeds.
- **"Add to Blurby" pipeline**: Reuse existing `url-extractor.js` Readability flow. Don't duplicate extraction logic.
- **Branch**: `sprint/25-rss-library`

### SUCCESS CRITERIA
1. Feeds can be added by URL (manual) and auto-discovered from site URLs
2. Feed CRUD operations work (add, remove, rename, change interval)
3. `feeds.json` persists feed list in user data directory
4. RSS 2.0, Atom 1.0, and JSON Feed formats parse correctly
5. Authenticated feeds use stored cookies from paywall login
6. Items deduplicated by URL across feeds
7. Old items pruned (max 200 per feed)
8. "Feeds" navigation item visible in menu flap sidebar
9. Feed items display title, author, date, excerpt, thumbnail
10. "Add to Blurby" imports article into main library via Readability pipeline
11. "Open in Browser" opens original URL
12. `G F` navigates to Feeds view; `J/K` navigates items; `A` imports; `O` opens; `M` marks read
13. Feed list syncs across devices (set-union merge)
14. Read/imported states sync (latest-wins)
15. `npm test` passes, `npm run build` succeeds
16. Branch `sprint/25-rss-library` merged to main with `--no-ff`

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| Sprint 22 | 2026-03-24 | ✅ PASS | Reading animation + TTS sync — GPU-accelerated Flow highlight, Focus fade/slide, cursor-driven TTS engine, WPM cap at 400, 512 tests |
| Sprint 18B | 2026-03-24 | ✅ PASS | Chrome extension "Send to Blurby" — Manifest V3, Readability, WebSocket + cloud fallback, 20 new tests (512 total) |
| Sprint 21 | 2026-03-21 | ✅ PASS | UX polish + reading intelligence — 17 items delivered |
| Sprint 20 | 2026-03-20 | ✅ PASS | Keyboard-first UX + three-mode reader — 30+ shortcuts, Page→Focus→Flow |
| Sprint 19 | 2026-03-19 | ✅ PASS | Sync hardening + provenance — revision counters, tombstones, APA metadata |
| Sprint 18A | 2026-03-18 | ✅ PASS | Windows .exe production — NSIS x64+ARM64, delta updates, auto-updater |
