# Blurby — Development Roadmap

**Last updated**: 2026-04-04 — Post-TTS-6C (Kokoro native-rate buckets). 1,050 tests, 52 files. Latest tagged release: v1.14.0.
**Current branch**: `main`
**Current state**: Phase 6 in progress (TTS-6C complete). Queue GREEN (GOV-6D → EINK-6A → GOALS-6B; depth 3).
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
Phase 6: E-ink & App Polish
  ├── EINK-6A: E-ink Display Mode (queued)
  ├── GOALS-6B: Reading Goals (queued)
  └── TTS-6C: Kokoro Native-Rate Buckets ✅ (v1.14.0)
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

## Phase 2 — EPUB Content Fidelity

**Goal:** The existing EPUB converter preserves formatting, images, and structure from all source formats. EPUB becomes the true single canonical internal format with no legacy text fallback.

**Baseline:** `main/epub-converter.js` (769 lines) already converts TXT, MD, HTML, PDF, MOBI/AZW → EPUB. The import pipeline (`main/ipc/library.js`) routes all non-EPUB files through `convertToEpub()`. Foliate renders EPUBs. Legacy text fallback path (`main/legacy-parsers.js`) remains as dead-end for failed conversions.

**Gaps addressed:**
- BUG-033: Book formatting stripped too aggressively (bold, italic, lists, headings lost)
- BUG-034: Images in books stripped during import (not extracted or embedded)
- BUG-075/079: EPUB pipeline completion (DOCX support, URL→EPUB, single rendering path)

---

### Sprint EPUB-2A: Content Fidelity ✅ COMPLETED (v1.5.0, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-033/034 resolved. 18 new tests. APPROVED_WITH_CONCERNS (PDF bold/italic and image extraction limited by pdf-parse).

---

### Sprint EPUB-2B: Pipeline Completion ✅ COMPLETED (v1.5.1, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-075/079 resolved. 16 new tests. APPROVED — all SUCCESS CRITERIA met. URL→EPUB, Chrome ext→EPUB, legacy migration, single rendering path.

---

## Phase 3 — Flow Mode Redesign

**Goal:** Replace the current paginated cursor-on-pages Flow Mode with an infinite-scroll reading experience. Text flows continuously and scrolls upward at WPM speed through a reading zone in the upper third of the viewport. A shrinking underline cursor paces the reader line-by-line. Works for both plain text/HTML docs and foliate-rendered EPUBs.

**Baseline:** `FlowMode.ts` (163 lines) drives word-by-word timing via setTimeout chain. `FlowCursorController.ts` (240 lines) slides a CSS-transitioned bar across paginated lines. Both operate within PageReaderView. `FoliatePageView.tsx` hardcodes `flow="paginated"` — foliate-js supports `flow="scrolled"` natively but Blurby has never used it.

**Architecture decision:** Flow Mode gets its own scroll-based rendering path. This reverses LL-013 ("Flow belongs in Page View") — infinite scroll is fundamentally incompatible with pagination. Page Mode stays paginated. Flow Mode switches to continuous scroll. This is a clean separation: the mode vertical (`FlowMode.ts`) drives timing, a new `FlowScrollEngine` manages the scroll container and cursor rendering.

**Key design decisions:**
- **Reading zone:** Upper third of viewport. Active line ~25% from top. Upcoming text fills the bottom 75%. Already-read text scrolls off the top.
- **Shrinking underline cursor:** Full-width `var(--accent)` underline appears under the active line, contracts from left-to-right at WPM speed. When it reaches zero width → next line begins with fresh full-width underline. The cursor IS the pacer — no separate scroll speed control.
- **EPUB support via foliate scrolled mode:** `flow="scrolled"` gives us a native scrollable container. Cursor overlays on top. Narration sync deferred to FLOW-3B.
- **LL-014 still applies:** Cursor animation is imperative (class-based, not React effects). New `FlowScrollEngine` class replaces `FlowCursorController`.

---

### Sprint FLOW-3A: Flow Mode Infinite Scroll ✅ COMPLETED (v1.6.0, 2026-04-01)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. All 12 SUCCESS CRITERIA met. 35 new tests (932 total, 47 files). FlowScrollEngine replaces FlowCursorController. LL-013 reversed (see LL-067).

---

### Sprint FLOW-3B: Flow Mode Polish ✅ COMPLETED (v1.6.1, 2026-04-01)

> Dead code removal (FlowScrollView, FlowCursorController, FLOW_PAGE_TURN_PAUSE_MS). Edge case hardening (empty doc, zero-width lines, font size rebuild). BUG-091/084 confirmed resolved by FLOW-3A. Bottom bar verified visible. Truncation fix for FoliatePageView.tsx + useKeyboardShortcuts.ts. 8 new tests (940 total).

---

## Phase 4 — Blurby Readings

**Goal:** Transform the library into a curated reading experience. Richer card metadata, explicit reading queue, author normalization, metadata enrichment, and first-run onboarding.

**Phase 4 split:**
- READINGS-4A ✅ (cards + queue + new dot) — v1.7.0
- READINGS-4B ✅ (author normalization + folder picker) — v1.8.0
- READINGS-4C ✅ (metadata wizard) — v1.9.0

---

### Sprint READINGS-4B: Author Normalization + First-Run Folder Picker ✅ COMPLETED (v1.8.0, 2026-04-02)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-074/076 resolved. 16 new tests (973 total, 49 files). Author normalization on all imports, batch normalize IPC, "Normalize Authors" button in settings, folder picker step in onboarding. APPROVED.

---

### Sprint READINGS-4C: Metadata Wizard ✅ COMPLETED (v1.9.0, 2026-04-02)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. BUG-077 resolved. 16 new tests (989 total, 50 files). Metadata scan IPC, filename parser, batch update IPC, MetadataWizard modal, Ctrl+Shift+M shortcut. APPROVED.

---

## Phase 5 — Read Later + Chrome Extension

**Goal:** Harden the Chrome extension → desktop pipeline with automated E2E tests. Integrate extension-sourced articles with the reading queue (READINGS-4A). Articles sent from the extension auto-join the queue and display with clear "web" source attribution.

**Baseline:** Chrome extension (7 files, ~1,700 lines) already sends articles via WebSocket to `main/ws-server.js` (441 lines). Articles are extracted via Readability.js, converted to EPUB, and added to library with `source: "url"`, `unread: true`. Existing WS test file (`tests/ws-server.test.js`, 317 lines) covers frame encoding and message shapes but has no integration tests. `handleAddArticle()` (ws-server.js line 226) does NOT set `queuePosition` — articles land in library but not in the reading queue.

---

### Sprint EXT-5A: Chrome Extension E2E Tests + Queue Integration ✅ COMPLETED (v1.10.0, 2026-04-02)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. 33 new tests (1,022 total, 51 files). Auto-queue extension articles (queuePosition), source domain badge, E2E pipeline tests, WS protocol tests. APPROVED.

---

### Sprint EXT-5B: Extension Pairing UX Hardening ✅ COMPLETED (v1.11.0, 2026-04-02)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. 10 new tests (1,032 total, 51 files). 6-digit short code pairing, WS `pair` protocol, ConnectorsSettings Chrome Extension section, popup pairing flow, options.html paired/unpair UI. Phase 5 complete. APPROVED.

### Post-Phase 5 Implementation Note: TTS Smoothness Stabilization ✅ IMPLEMENTED ON `main` (2026-04-04, unreleased)

> Kokoro narration path upgraded in-place on `main`. 6 new tests (1,038 total, 51 files). This was implementation work rather than a queued release sprint, so it is recorded here as an engineering milestone rather than a tagged version.

**Delivered:**
- Predictive first-chunk priming for warm-model starts
- Cache `wordCount` metadata with lazy migration for legacy entries
- Scheduler-owned `playbackRate` for Kokoro speed changes (no restart churn)
- Boundary-aware chunk planning with schedule-time punctuation pauses
- Reading Now background cache wiring
- TTS/preload/runtime type surface restored to green (`npm run typecheck`)

**Queued follow-up:** `TTS-6C` replaces the unreleased Kokoro `playbackRate` speed path with native `1.0x` / `1.2x` / `1.5x` generation buckets before release. Smoothness remains the startup/cache/chunking foundation; `TTS-6C` owns Kokoro rate control.

**Baseline:**
- `main/ws-server.js` (450 lines) — `handleMessage()` at line 184 handles `auth` type. `generatePairingToken()` at line 320 generates 32-char hex. `_pairingToken` module var stores the long-lived token.
- `main/ipc/misc.js` — `get-ws-pairing-token` and `regenerate-ws-pairing-token` IPC handlers (lines 305-312).
- `src/components/settings/ConnectorsSettings.tsx` (85 lines) — Site logins only. No extension pairing UI.
- `chrome-extension/service-worker.js` (561 lines) — WS auth at connect time, reads `pairingToken` from `chrome.storage.local`.
- `chrome-extension/popup.js` (185 lines) — Connection status badge, no pairing UI.
- `chrome-extension/options.html` (216 lines) — Manual pairing token text input field.

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `main/ws-server.js` — `handleMessage()` (line 184), `generatePairingToken()` (line 320), `startServer()` (line 324)
5. `main/ipc/misc.js` — `get-ws-pairing-token`, `regenerate-ws-pairing-token` (lines 305-312)
6. `src/components/settings/ConnectorsSettings.tsx` — current site logins UI (85 lines)
7. `src/components/SettingsMenu.tsx` — ConnectorsSettings wiring
8. `chrome-extension/service-worker.js` — WS connect + auth flow
9. `chrome-extension/popup.html` + `popup.js` — popup UI + connection status
10. `chrome-extension/options.html` + `options.js` — manual token input

#### Tasks

| # | Agent | Task | Files |
|---|-------|------|-------|
| 1 | electron-fixer | **Short-code generation** — New `generateShortCode()` in ws-server.js: 6-digit numeric (`Math.floor(100000 + Math.random() * 900000)`). New module vars `_shortCode`, `_shortCodeExpiry`. Auto-rotates every 5 min (`SHORT_CODE_TTL_MS` in constants.js). `getShortCode()` export: returns `{code, expiresAt}`, regenerates if expired. | `main/ws-server.js`, `main/constants.js` |
| 2 | electron-fixer | **WS `pair` message handler** — In `handleMessage()`, before the auth-required gate: accept `{type:"pair", code}` from unauthenticated clients. Validate `msg.code` against `_shortCode` (string comparison). On match: generate long-lived token via `generatePairingToken()`, encrypt+persist to settings (reuse existing pattern), set `client.authenticated = true`, send `{type:"pair-ok", token}`. On mismatch: send `{type:"pair-failed", message:"Invalid code"}`. On expired code: regenerate before comparing. | `main/ws-server.js` |
| 3 | electron-fixer | **Short-code IPC** — New `get-ws-short-code` IPC handler: returns `{code, expiresAt, connected}` where `connected` = `_clients.size > 0 && [..._clients].some(c => c.authenticated)`. New `regenerate-ws-short-code` handler: force-rotates code, returns new `{code, expiresAt}`. Add to preload.js. | `main/ipc/misc.js`, `preload.js` |
| 4 | renderer-fixer | **ConnectorsSettings: Chrome Extension section** — Add section above "Logged-in Sites": heading "Chrome Extension", connection status indicator (green dot + "Connected" / red dot + "Not connected"), 6-digit code in large monospace (`font-size: 2rem; letter-spacing: 0.5em`), "Refreshes in X:XX" countdown (useEffect interval), "New Code" button calls `regenerate-ws-short-code`. Hide code when connected. Use `get-ws-short-code` IPC to fetch. | `src/components/settings/ConnectorsSettings.tsx`, `src/styles/global.css` |
| 5 | renderer-fixer | **Extension popup: pairing flow** — When `connectionStatus !== "connected"`: replace article preview area with pairing UI. Show "Enter the 6-digit code from Blurby desktop" label, 6-digit input (numeric, maxlength 6, large centered), "Pair" button. On submit: send `{type:"request-pair", code}` message to service worker. Service worker sends `{type:"pair", code}` over WS. On `pair-ok`: store received token in `chrome.storage.local` as `pairingToken`, update connection badge to green, switch to normal UI. On `pair-failed`: show inline error "Invalid code — check Blurby desktop". | `chrome-extension/popup.html`, `chrome-extension/popup.js`, `chrome-extension/service-worker.js` |
| 6 | renderer-fixer | **Extension options: replace manual token field** — Remove the raw pairing token text input. Replace with: connection status display, "Paired" with green check when token exists, "Unpair" button (clears `pairingToken` from storage, disconnects WS). Keep existing cloud sync and connection mode settings. | `chrome-extension/options.html`, `chrome-extension/options.js` |
| 7 | test-runner | **Tests** — (a) `generateShortCode()` returns 6-digit string, (b) short code rotates after TTL, (c) `pair` message with valid code → `pair-ok` with token, (d) `pair` message with invalid code → `pair-failed`, (e) `pair` message after expiry → new code generated + compared, (f) successful pair marks client authenticated, (g) IPC `get-ws-short-code` returns code + expiry, (h) IPC `regenerate-ws-short-code` returns new code. ≥10 new tests. | `tests/ws-server.test.js` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-reviewer | **Spec compliance** | — |
| 10 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 11 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. 6-digit numeric code displayed in Settings > Connectors under "Chrome Extension" section
2. Code auto-rotates every 5 minutes with visible countdown
3. "New Code" button regenerates immediately
4. Extension popup shows pairing input when not connected
5. Entering correct code in extension popup → `pair-ok` → token stored → auto-connected
6. Entering wrong code → inline error message, no crash
7. Extension reconnects automatically on restart using stored token (existing `auth` flow unchanged)
8. ConnectorsSettings shows green "Connected" status when extension is paired
9. Extension options.html no longer has raw token input field
10. ≥10 new tests covering short code generation, pair protocol, IPC handlers
11. `npm test` passes (≥1,032 tests)
12. `npm run build` succeeds
13. Existing WS tests and extension pipeline tests pass — no regressions

---

## Phase 5 Exit Gate

Phase 5A ✅ complete. Phase 5B = extension pairing UX (not RSS/News — that moved to Phase 8 backlog).

Phase 5 is complete when:
1. ✅ Extension articles auto-enter reading queue (5A)
2. ✅ E2E test coverage exists for the full article ingestion pipeline (5A)
3. Extension pairing is one-step (6-digit code, no manual token copy) (5B)
4. All existing extension functionality preserved — no regressions

---

## Cross-Cut Governance

### Sprint GOV-6D: Claude CLI Agent Staging Alignment

**Goal:** Align Blurby's living governance docs and project subagent files with the real Claude Code subagent model so the next queued sprints can be dispatched without agent-name drift or staging ambiguity.

**Problem:** The project already has valid project-level subagents in `.claude/agents/`, but the living docs are split across two models. `CLAUDE.md` correctly treats `electron-fixer`, `renderer-fixer`, and `format-parser` as scope labels, while `ROADMAP.md` upcoming work still assigns them like spawnable agents and still uses stale verification names like `spec-reviewer`. Upcoming queued work is therefore not cleanly dispatchable under the real Claude CLI subagent model.

**Design decisions:**
- **Quick-tier governance sprint:** This is execution-critical process work, but it does not change app/runtime behavior. Validation is agent-load + grep audit, not `npm test` / `npm run build`, unless implementation unexpectedly touches app code.
- **Canonical callable roster stays at five project subagents:** `blurby-lead`, `spec-compliance-reviewer`, `quality-reviewer`, `doc-keeper`, and `test-runner`.
- **Legacy code labels remain useful:** `electron-fixer`, `renderer-fixer`, and `format-parser` stay allowed in scope/reference tables, but not in living task tables as if they were callable subagents.
- **Tier-aware review policy:** Full-tier sprints explicitly stage `test-runner` → `spec-compliance-reviewer` → `quality-reviewer` → `doc-keeper` → `blurby-lead`. Quick-tier sprints use `blurby-lead` self-review and escalate to `quality-reviewer` only if concerns are found.
- **Living docs only:** Normalize `.claude/agents/`, `CLAUDE.md`, `ROADMAP.md`, and `SPRINT_QUEUE.md`. Historical dispatch docs and archives stay historical unless a note is needed to prevent current-state confusion.

**Baseline:**
- `.claude/agents/*.md` already exists with valid YAML frontmatter and the correct project-level location for Claude Code subagents.
- `blurby-lead.md` still describes nonexistent spawnable code agents in its body even though its frontmatter allowlist names only the real review/doc/test subagents.
- `CLAUDE.md` correctly documents scope labels, but its live operational tables/checklists still use `spec-reviewer` and `code-reviewer`.
- `ROADMAP.md` upcoming specs still mix old task-table agent labels with the newer `Primary CLI (... scope)` style and omit the `quality-reviewer` step from Full-tier upcoming work.
- `SPRINT_QUEUE.md` is stale relative to `ROADMAP.md`: it still listed `TTS-6C` even though that sprint is already complete, and it does not yet queue the governance alignment work needed before the next product sprints.

#### WHERE (Read Order)

1. `https://code.claude.com/docs/en/sub-agents` — official subagent file format, callable-agent rules, supported frontmatter
2. `CLAUDE.md` — agent definitions, scope labels, tier policy, checklist
3. `.claude/agents/blurby-lead.md`
4. `.claude/agents/spec-compliance-reviewer.md`
5. `.claude/agents/quality-reviewer.md`
6. `.claude/agents/doc-keeper.md`
7. `.claude/agents/test-runner.md`
8. `ROADMAP.md` — this section plus `EINK-6A` and `GOALS-6B`
9. `docs/governance/SPRINT_QUEUE.md`

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (agent-config scope) | **Normalize `blurby-lead` to the real subagent model** — Keep the frontmatter allowlist pointed only at real project subagents. Rewrite the body so spawned agents are only `spec-compliance-reviewer`, `quality-reviewer`, `doc-keeper`, and `test-runner`, while `electron-fixer` / `renderer-fixer` / `format-parser` are explicitly documented as scope labels. | `.claude/agents/blurby-lead.md` |
| 2 | Primary CLI (agent-config scope) | **Align specialist agent wording** — Update any specialist agent body text that conflicts with the current model, especially the tier-aware use of `quality-reviewer` and the canonical `spec-compliance-reviewer` naming. Preserve valid YAML frontmatter. | `.claude/agents/spec-compliance-reviewer.md`, `.claude/agents/quality-reviewer.md`, `.claude/agents/doc-keeper.md`, `.claude/agents/test-runner.md` |
| 3 | Primary CLI (governance-doc scope) | **Fix `CLAUDE.md` operational terminology** — Preserve the scope-label reference table, but rename stale live references (`spec-reviewer`, `code-reviewer`) to the real agent names, update the post-completion checklist, and codify the Quick-tier vs Full-tier review policy in one place. | `CLAUDE.md` |
| 4 | Primary CLI (governance-doc scope) | **Normalize all live forward-looking specs** — Update this sprint plus `EINK-6A` and `GOALS-6B` so code work uses `Primary CLI (... scope)`, verification uses real subagent names, and all Full-tier specs include `quality-reviewer` after `spec-compliance-reviewer`. | `ROADMAP.md` |
| 5 | Primary CLI (governance-doc scope) | **Queue alignment** — Add `GOV-6D` to the top of the queue, bump downstream queued versions, and clarify the queue's agent-staging expectations plus queued-vs-drafted wording. | `docs/governance/SPRINT_QUEUE.md` |
| 6 | Primary CLI (validation scope) | **Validate callable agents + living-doc terminology** — Run `claude agents` to confirm the project subagents load without parse errors. Run a grep audit over living docs to confirm legacy labels appear only in allowed scope-reference tables or historical/archive docs. | `.claude/agents/`, `CLAUDE.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md` |
| 7 | spec-compliance-reviewer | **Spec compliance** — Verify every success criterion below against the edited agent files and living docs. | — |
| 8 | doc-keeper | **Documentation sanity pass** — Final cross-check of roadmap header/current state, queue depth, queue ordering, and any lingering cross-reference drift. | `CLAUDE.md`, `ROADMAP.md`, `docs/governance/SPRINT_QUEUE.md` |
| 9 | blurby-lead | **Git: commit, merge, push** | — |

#### Execution Sequence

```
[1-3] SEQUENTIAL:
    [1] blurby-lead orchestrator file
    [2] specialist agent wording
    [3] CLAUDE.md terminology + tier policy
    ↓
[4-5] SEQUENTIAL:
    [4] ROADMAP.md live sprint normalization
    [5] SPRINT_QUEUE.md reorder + version bump
    ↓
[6] Validation:
    `claude agents` + living-doc grep audit
    ↓
[7] spec-compliance-reviewer
    ↓
[8] doc-keeper
    ↓
[9] blurby-lead git/report
```

#### SUCCESS CRITERIA

1. `.claude/agents/` still exposes exactly the five callable project subagents: `blurby-lead`, `spec-compliance-reviewer`, `quality-reviewer`, `doc-keeper`, and `test-runner`
2. All edited subagent files keep valid YAML frontmatter and remain loadable by Claude Code
3. `blurby-lead.md` documents only real spawned subagents as callable agents
4. `electron-fixer`, `renderer-fixer`, and `format-parser` remain allowed only as scope/reference labels, not as spawnable subagents in living task tables
5. `CLAUDE.md` preserves the scope-label table but removes stale live operational labels like `spec-reviewer` and `code-reviewer`
6. `ROADMAP.md` live forward-looking specs (`GOV-6D`, `EINK-6A`, `GOALS-6B`) use `Primary CLI (... scope)` for code tasks and real subagent names for review/docs/git
7. Full-tier upcoming specs explicitly stage `quality-reviewer` after `spec-compliance-reviewer`
8. `SPRINT_QUEUE.md` lists `GOV-6D` first and keeps a queue depth of 3
9. Queued version numbers are sequential: `GOV-6D` v1.12.0, `EINK-6A` v1.13.0, `GOALS-6B` v1.14.0
10. `claude agents` loads the project subagents without parse errors
11. Living-doc grep audit shows legacy labels only in allowed scope-reference contexts or historical/archive docs
12. No app/runtime source files outside governance docs and `.claude/agents/` are changed by this sprint

---

## Phase 6 — E-ink & App Polish

**Goal:** Decouple e-ink display behavior from the visual theme system. Users can combine any color theme (dark, light, blurby) with e-ink display optimizations (no animations, phrase grouping, ghosting prevention, WPM ceiling). Then layer on user-facing reading goals.

---

### Sprint EINK-6A: E-ink as Independent Display Mode

**Goal:** E-ink behavior (no animations, phrase grouping, WPM ceiling, ghosting refresh) becomes a toggle independent of the visual theme. Currently `theme: "eink"` is a theme — you lose dark/light theming to get e-ink behavior. After this sprint, any theme + e-ink mode works.

**Problem:** E-ink is bundled as `theme: "eink"` in the theme selector. All e-ink CSS is under `[data-theme="eink"]`. The `useEinkController` hook checks `settings.theme === "eink"`. Users with actual e-ink displays want the behavioral optimizations (no CSS transitions, large touch targets, periodic refresh, phrase grouping, WPM ceiling) but also want to pick their preferred color scheme.

**Design decisions:**
- **New boolean setting `einkMode`** — Independent of `theme`. When true, activates all e-ink behavioral optimizations regardless of theme.
- **CSS attribute `[data-eink="true"]`** — Applied to root alongside `[data-theme]`. E-ink behavioral styles (no transitions, large targets) move from `[data-theme="eink"]` to `[data-eink="true"]`. E-ink color palette stays as `[data-theme="eink"]` for users who want the visual look.
- **Theme "eink" becomes "eink" color scheme only** — Sets e-ink colors (warm gray background). Automatically enables `einkMode` for backward compatibility. Other themes don't set einkMode by default.
- **useEinkController** checks `settings.einkMode` instead of `settings.theme === "eink"`.
- **Settings UI** — E-ink toggle in Theme settings, below theme selector. "E-ink Display Mode" on/off. When on, shows sub-settings (phrase grouping, WPM ceiling, refresh interval) regardless of theme. Moving these out of theme-conditional rendering.

**Baseline:**
- `src/types.ts` — `theme: "dark" | "light" | "blurby" | "eink" | "system"`, plus `einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping`
- `src/hooks/useEinkController.ts` (42 lines) — Checks `settings.theme === "eink"`
- `src/styles/global.css` — `[data-theme="eink"]` rules (~50 selectors)
- `src/components/settings/ThemeSettings.tsx` — E-ink sub-settings only visible when theme="eink"
- `main/window-manager.js` — `getThemeColors()` has eink case

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — BlurbySettings interface (theme, eink* fields)
5. `src/hooks/useEinkController.ts` — current eink check (42 lines)
6. `src/styles/global.css` — `[data-theme="eink"]` selectors
7. `src/components/settings/ThemeSettings.tsx` — theme selector, eink sub-settings
8. `src/constants.ts` — DEFAULT_SETTINGS (eink defaults)
9. `main/window-manager.js` — `getThemeColors()`, `updateWindowTheme()`
10. `src/components/App.tsx` — `data-theme` attribute application

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Add `einkMode` setting** — New boolean field in BlurbySettings. Default: `false`. Add to DEFAULT_SETTINGS. Migration: if `theme === "eink"`, set `einkMode: true` on load. | `src/types.ts`, `src/constants.ts` |
| 2 | Primary CLI (renderer-fixer scope) | **Split CSS: behavioral vs visual** — Audit all `[data-theme="eink"]` selectors in global.css. Move behavioral rules (no transitions, no animations, large touch targets, ghosting overlay) to `[data-eink="true"]`. Keep visual rules (colors, backgrounds, borders) under `[data-theme="eink"]`. | `src/styles/global.css` |
| 3 | Primary CLI (renderer-fixer scope) | **Apply `data-eink` attribute** — In App.tsx (or wherever `data-theme` is set on the root), also set `data-eink={settings.einkMode ? "true" : "false"}`. | `src/components/App.tsx` |
| 4 | Primary CLI (renderer-fixer scope) | **Update useEinkController** — Check `settings.einkMode` instead of `settings.theme === "eink"`. | `src/hooks/useEinkController.ts` |
| 5 | Primary CLI (renderer-fixer scope) | **ThemeSettings: e-ink toggle** — Add "E-ink Display Mode" toggle below theme selector. Always visible regardless of theme. When toggled on, show sub-settings (phrase grouping, WPM ceiling, refresh interval). Remove conditional rendering that hid these when theme !== "eink". | `src/components/settings/ThemeSettings.tsx` |
| 6 | Primary CLI (renderer-fixer scope) | **Backward compat: theme="eink" auto-enables** — When user selects "eink" theme, auto-set `einkMode: true`. When switching away from "eink" theme, keep `einkMode` as-is (user may want to keep it). | `src/components/settings/ThemeSettings.tsx` |
| 7 | Primary CLI (electron-fixer scope) | **Window manager: einkMode awareness** — `updateWindowTheme()` should apply e-ink behavioral optimizations (disable hardware acceleration hints if applicable) based on `einkMode`, not theme. Color-only theming still uses `getThemeColors()`. | `main/window-manager.js` |
| 8 | test-runner | **Tests** — (a) `einkMode: true` + `theme: "dark"` applies both dark colors AND eink behaviors, (b) `einkMode: false` + `theme: "eink"` auto-sets einkMode on migration, (c) useEinkController responds to `einkMode` not theme, (d) CSS `[data-eink="true"]` selectors exist in output, (e) ThemeSettings shows eink sub-settings regardless of theme when einkMode=true. ≥10 new tests. | `tests/` |
| 9 | test-runner | **`npm test` + `npm run build`** | — |
| 10 | spec-compliance-reviewer | **Spec compliance** | — |
| 11 | quality-reviewer | **Architecture + code quality review** | — |
| 12 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 13 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. New `einkMode` boolean setting, default false
2. `data-eink="true"` attribute on root element when einkMode enabled
3. E-ink behavioral CSS (no transitions, large targets, refresh overlay) applies via `[data-eink="true"]`, not `[data-theme="eink"]`
4. E-ink color CSS remains under `[data-theme="eink"]`
5. User can select `theme: "dark"` + `einkMode: true` and get dark colors with e-ink behaviors
6. useEinkController checks einkMode, not theme
7. ThemeSettings shows e-ink toggle and sub-settings regardless of selected theme
8. Selecting "eink" theme auto-enables einkMode (backward compat)
9. Migration: existing `theme: "eink"` users get `einkMode: true` on upgrade
10. ≥10 new tests
11. `npm test` passes (≥1,042 tests)
12. `npm run build` succeeds
13. No regressions to any reading mode or theme

---

### Sprint GOALS-6B: Reading Goal Tracking

**Goal:** Let users set daily and weekly reading goals (minutes or pages) with visual progress indicators in the library view. Build on existing reading stats infrastructure.

**Problem:** Blurby tracks reading history (sessions, duration, pages) but doesn't surface this as goals or streaks. Users have no way to set a daily reading target or see how they're progressing toward it. Reading habit formation is one of the highest-impact features for a reading app.

**Design decisions:**
- **Two goal types:** Daily minutes and weekly books/chapters. Minutes is the primary metric because it works across all content types and reading modes.
- **Goal progress widget** in LibraryContainer header area. Circular progress ring showing today's minutes vs goal. Secondary line: "3 of 5 days this week". Compact, non-intrusive.
- **Settings page** — New "Reading Goals" section in a dedicated settings sub-page. Daily target (15/30/45/60/90 min, custom), weekly target (optional), notifications (optional — toast on goal hit).
- **Stats from existing history.json** — Reading sessions already log start/end time and word counts. Derive minutes from session data. No new tracking infrastructure needed.
- **IPC for goal progress** — `get-goal-progress` returns `{todayMinutes, dailyGoal, weekDays, weeklyGoal, streakDays}`. Computed from history.json on each call.

**Baseline:**
- `main/ipc/misc.js` — Stats IPC handlers (reading history queries)
- `src/components/LibraryContainer.tsx` — Library header area
- `src/types.ts` — BlurbySettings (no goal fields yet)
- `src/constants.ts` — DEFAULT_SETTINGS
- History data in `history.json` with session entries

#### WHERE (Read Order)

1. `CLAUDE.md` — rules, agents, current state
2. `docs/governance/LESSONS_LEARNED.md`
3. `ROADMAP.md` — this section
4. `src/types.ts` — BlurbySettings, BlurbyDoc
5. `main/ipc/misc.js` — existing stats/history IPC
6. `src/components/LibraryContainer.tsx` — library header, layout
7. `src/components/settings/` — existing settings sub-pages (pattern reference)
8. `src/styles/global.css` — component styling patterns
9. `src/constants.ts` — DEFAULT_SETTINGS

#### Tasks

| # | Owner | Task | Files |
|---|-------|------|-------|
| 1 | Primary CLI (renderer-fixer scope) | **Goal settings in BlurbySettings** — New fields: `dailyGoalMinutes: number` (default 30), `weeklyGoalDays: number` (default 5), `goalsEnabled: boolean` (default false). Add to types and DEFAULT_SETTINGS. | `src/types.ts`, `src/constants.ts` |
| 2 | Primary CLI (electron-fixer scope) | **Goal progress IPC** — New `get-goal-progress` handler. Reads history.json, computes: `todayMinutes` (sum of session durations for today), `weekMinutes` (per-day array for current week), `streakDays` (consecutive days meeting goal, counting backward from yesterday), `dailyGoal` and `weeklyGoalDays` from settings. Returns `GoalProgress` object. | `main/ipc/misc.js`, `preload.js` |
| 3 | Primary CLI (renderer-fixer scope) | **GoalProgressWidget component** — Compact widget for library header. Circular SVG progress ring (today's progress as fraction of daily goal). Text: "12 / 30 min today". Below: dots for week days (filled = goal met). Muted when goals disabled. Accessible: aria-valuenow, aria-valuemax. | `src/components/GoalProgressWidget.tsx`, `src/styles/global.css` |
| 4 | Primary CLI (renderer-fixer scope) | **Wire widget to LibraryContainer** — Fetch goal progress on mount and on window focus (user may have been reading). Display in library header between title and sort controls. Only show when `settings.goalsEnabled`. | `src/components/LibraryContainer.tsx` |
| 5 | Primary CLI (renderer-fixer scope) | **Reading Goals settings page** — New settings sub-page "Reading Goals": enable/disable toggle, daily minutes slider (15/30/45/60/90/custom), weekly days target (1-7), reset button. Add to SettingsMenu and CommandPalette. | `src/components/settings/ReadingGoalSettings.tsx`, `src/components/SettingsMenu.tsx`, `src/components/CommandPalette.tsx`, `src/components/MenuFlap.tsx` |
| 6 | Primary CLI (renderer-fixer scope) | **Goal-met toast** — When reading session ends and today's total crosses the daily goal threshold, show a congratulatory toast. Check via `get-goal-progress` after session end. | `src/components/ReaderContainer.tsx` |
| 7 | test-runner | **Tests** — (a) `get-goal-progress` returns correct todayMinutes from history data, (b) streak calculation counts consecutive goal-meeting days, (c) weekly dots array reflects correct days, (d) GoalProgressWidget renders ring and dots, (e) settings page toggles/sliders work, (f) goal-met toast fires at threshold, (g) goals disabled = widget hidden. ≥12 new tests. | `tests/` |
| 8 | test-runner | **`npm test` + `npm run build`** | — |
| 9 | spec-compliance-reviewer | **Spec compliance** | — |
| 10 | quality-reviewer | **Architecture + code quality review** | — |
| 11 | doc-keeper | **Documentation pass** | All 6 governing docs |
| 12 | blurby-lead | **Git: commit, merge, push** | — |

#### SUCCESS CRITERIA

1. `goalsEnabled`, `dailyGoalMinutes`, `weeklyGoalDays` in BlurbySettings with defaults
2. `get-goal-progress` IPC returns accurate progress from history.json
3. GoalProgressWidget shows circular progress ring in library header
4. Weekly dots show which days met the goal
5. Streak counter tracks consecutive days
6. Reading Goals settings page with enable toggle and minutes slider
7. Goal-met toast fires once per day when threshold crossed
8. Widget hidden when goals disabled
9. Accessible: progress ring has aria attributes
10. ≥12 new tests
11. `npm test` passes (≥1,052 tests)
12. `npm run build` succeeds
13. No regressions to library, reading modes, or existing stats

---

### Sprint TTS-6C: Kokoro Native-Rate Buckets ✅ COMPLETED (v1.14.0, 2026-04-04)

> Full spec archived to `docs/project/ROADMAP_ARCHIVE.md`. 18 new tests (1,050 total, 52 files). Kokoro rate control replaced with 3 native buckets (1.0x/1.2x/1.5x). Cache identity includes `rateBucket`. Immediate stop/restart on Kokoro rate change. Background cacher warms active bucket only. TTSSettings shows 3-button bucket selector for Kokoro; Web Speech keeps continuous slider. All 13 SUCCESS CRITERIA met. APPROVED.

---

## Phase 2 Exit Gate

Phase 2 is complete when:
1. Import any supported format → EPUB generated → opens in foliate with formatting intact
2. URL articles → EPUB (not PDF)
3. Narration extracts words correctly from converted EPUBs
4. All 4 reading modes work on converted content
5. No legacy text rendering path remains
6. `npm test` passes, `npm run build` succeeds
7. Sprint Queue depth ≥3 with Phase 3 spec'd

---

## Sprint Status

| Sprint | Version | Status | Summary |
|--------|---------|--------|---------|
| TTS-6C | v1.14.0 | ✅ DONE | Kokoro native-rate buckets (1.0x/1.2x/1.5x). rateBucket cache identity, immediate restart on rate change, active-bucket warming. 18 new tests. |
| EXT-5A | v1.10.0 | ✅ DONE | Chrome extension E2E + queue integration. 33 new tests. Phase 5A complete. |
| READINGS-4C | v1.9.0 | ✅ DONE | Metadata Wizard — scan, filename parser, batch update, modal, Ctrl+Shift+M. 16 new tests. |
| READINGS-4B | v1.8.0 | ✅ DONE | Author normalization + first-run folder picker. BUG-074/076 resolved. 16 new tests. |
| HOTFIX-ARM | v1.7.0+ | ✅ DONE | ONNX ARM64 fix — onnxruntime-node 1.24.3 override, cpuinfo suppression. |
| READINGS-4A | v1.7.0 | ✅ DONE | Library cards, reading queue, "New" dot auto-clear. 17 new tests. |
| FLOW-3B | v1.6.1 | ✅ DONE | Flow Mode polish. Dead code removal, edge cases, truncation fix. 8 new tests. |
| FLOW-3A | v1.6.0 | ✅ DONE | Flow Mode infinite scroll. FlowScrollEngine, shrinking underline cursor, reading zone. 35 new tests. |
| EPUB-2B | v1.5.1 | ✅ DONE | URL→EPUB, Chrome ext→EPUB, legacy migration, single rendering path. 16 new tests. |
| EPUB-2A | v1.5.0 | ✅ DONE | Content fidelity — formatting, images, DOCX support. 18 new tests. |
| Phase 1 (AUDIT-FIX 1A-1F) | v1.4.9–v1.4.14 | ✅ DONE | 42 audit findings addressed. 7 CRITICAL, 8+ MAJOR, 6 MODERATE fixed. 9 MODERATE deferred. |
| HOTFIX-11 | v1.4.8 | ✅ DONE | ONNX worker thread crash patch. 863 tests / 44 files. |
| NAR-5 + prior | v1.4.7 | ✅ DONE | Narration pipeline complete. See `docs/project/ROADMAP_ARCHIVE.md`. |

**Full sprint history:** `docs/project/ROADMAP_ARCHIVE.md`

---

## Feature Backlog

Items migrated from BUG_REPORT.md — feature requests, enhancements, and architecture changes (not bugs). Grouped by phase alignment per ROADMAP_V2.

### Phase 3: Flow Mode Redesign
| ID | Feature | Description |
|----|---------|-------------|
| ~~BUG-069~~ | ~~Paragraph jump shortcuts~~ | ✅ RESOLVED (FLOW-3A) — Shift+↑/↓ jumps paragraphs in Flow Mode |
| BUG-070 | Scroll wheel word advance | Partially resolved (FLOW-3A) — mouse wheel pauses auto-scroll, resumes after 2s. Full word-advance deferred. |

### Phase 4: Blurby Readings
| ID | Feature | Sprint | Description |
|----|---------|--------|-------------|
| ~~BUG-078~~ | ~~Reading Queue~~ | ✅ 4A | Ordered reading list, drag-to-reorder |
| ~~BUG-050~~ | ~~3-line library cards~~ | ✅ 4A | Title, Author, Book Data (progress %, pages, time) |
| ~~BUG-067~~ | ~~"New" dot auto-clear~~ | ✅ 4A | IntersectionObserver + seenAt timestamp |
| ~~BUG-074~~ | ~~Author name normalization~~ | ✅ 4B | Standardize to "Last, First" format |
| ~~BUG-076~~ | ~~First-run library folder picker~~ | ✅ 4B | Mandatory onboarding step |
| ~~BUG-077~~ | ~~Metadata Wizard~~ | ✅ 4C | Batch metadata enrichment (local-only, no API) |

### Phase 5: Read Later + Blurby News
| ID | Feature | Description |
|----|---------|-------------|
| BUG-055–059 | Settings/command palette UX | Combined settings pages, Ctrl+K searchable settings |

### Backlog (Unphased)
| ID | Feature | Description |
|----|---------|-------------|
| ~~BUG-037~~ | ~~E-ink as display mode~~ | ✅ Queued as EINK-6A |
| BUG-060–062 | Branding | Icon, theme, sample prefix |
| BUG-070 | Scroll wheel word advance | Mouse wheel = word advance in reading modes |
| BUG-038 | Hotkey coaching in reader | Keyboard shortcut suggestions on mouse click |

---

## Someday Backlog

- Code signing certificate for Windows SmartScreen trust
- Multi-window support
- Import/export (backup library, stats to CSV)
- Streaming ZIP parsing for large EPUBs
- Time-window stats archival
- Toast queue system
- Version-pin critical dependencies
- iOS app, Firefox extension, Safari extension
