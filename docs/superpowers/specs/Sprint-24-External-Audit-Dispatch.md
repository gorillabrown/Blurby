# Sprint 24 — External Audit Dispatch Package

**Status:** READY TO DISPATCH (after click-through gate)
**Created:** 2026-03-28
**Branch:** `sprint/24-external-audit`
**Tier:** None (read-only audit — no production code changes)
**Parallel with:** Sprint CT-3 (click-through repair). No file conflicts — audit writes only to `docs/project/AGENT_FINDINGS.md`.

---

## Sprint 24 — External Audit (Quality Gate for v1.0.0)

### KEY CONTEXT

Blurby is a desktop speed-reading/audiobook app (Electron 41 + React 19 + TypeScript 5.9). All core development is complete through Sprint CT-2: 776 tests across 38 files, 4 reading modes, foliate-js EPUB rendering, Kokoro TTS (28 voices), cloud sync (OneDrive + Google Drive), Chrome extension, keyboard-first UX (30+ shortcuts), WCAG 2.1 AA accessibility, Windows installer (x64+ARM64). The browser-based test harness is fully operational (CT-2). A manual click-through has been performed post-CT-2 and any bug fixes are being handled in CT-3 (running in parallel with this audit). This audit is the quality gate before v1.0.0 release. CRITICALs block release.

### PROBLEM

No independent systematic review has been performed on the codebase. After 23+ sprints of rapid development, we need verification that:
1. Standing engineering rules (CLAUDE.md) are consistently followed across ~36k LOC
2. Test coverage maps to all feature areas without blind spots
3. Architecture has no circular dependencies, security gaps, or bloated bundles
4. Documentation (CLAUDE.md, ROADMAP.md, LESSONS_LEARNED.md) accurately reflects current reality

### EVIDENCE OF PROBLEM

- 36,144 total LOC across src/ (16,659), main/ (7,326), preload (173), tests/ (10,036), styles (4,660)
- 26 main-process modules — no dependency graph analysis has been performed
- 173 IPC channels exposed through preload.js — no security surface audit since Sprint 9
- LESSONS_LEARNED.md contains 44+ entries — no regression check against current codebase
- Test count grew from 0 → 776 across 20+ sprints — no coverage map exists

### HYPOTHESIZED SOLUTION

Four parallel audit workstreams producing findings in a single `AGENT_FINDINGS.md`, followed by consolidation. Each workstream is independent and read-only. Severity ratings: CRITICAL (blocks v1.0.0), WARNING (should fix before v1.0.0), NOTE (improvement opportunity, non-blocking).

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | **24A: Code quality audit** — lint pass (dead code, unused imports, naming inconsistencies, type safety gaps), standing rule compliance (CLAUDE.md rules), known-trap regression (LESSONS_LEARNED.md entries) | `code-reviewer` | sonnet |
| 2 | **24B: Test coverage audit** — map every test file to feature areas, identify features with zero coverage, priority gaps (IPC handlers, sync engine edge cases, TTS sync, onboarding, mode switching, Chrome extension), recommend specific tests to add | `code-reviewer` | sonnet |
| 3 | **24C: Architecture review** — module dependency graph, circular dependency check, bundle size analysis (flag >100KB lazy-loadable), security surface (IPC channels, CSP headers, token storage, WebSocket auth), cloud sync audit (revision counters, tombstone cleanup, merge correctness) | `ui-investigator` | opus |
| 4 | **24D: Documentation alignment** — verify CLAUDE.md file paths and feature statuses match reality, verify ROADMAP.md acceptance criteria match implementations, verify LESSONS_LEARNED.md has entries for recent sprints, check TECHNICAL_REFERENCE.md accuracy | `doc-keeper` | sonnet |
| 5 | **Findings consolidation** — merge all 4 workstream outputs into single AGENT_FINDINGS.md, deduplicate, assign final severity, sort by severity (CRITICAL first), add summary statistics | `blurby-lead` | opus |
| 6 | Print terminal summary: total findings by severity, any CRITICALs with one-line description, pass/block recommendation for v1.0.0 | `blurby-lead` | — |

### WHERE (Read in This Order)

**All agents read first:**
1. `CLAUDE.md` — Standing rules, architecture overview, agent config, current system state
2. `docs/governance/LESSONS_LEARNED.md` — 44+ engineering discoveries, known traps, anti-patterns

**24A (code quality) additionally reads:**
3. `main.js` — Orchestrator, app lifecycle (verify async patterns, error handling)
4. `main/ipc-handlers.js` → `main/ipc/*.js` — All 8 IPC domain files (naming, patterns, error handling)
5. `main/sync-engine.js` + `main/sync-queue.js` — Most complex main-process modules
6. `src/hooks/useReaderMode.ts` + `src/hooks/useNarration.ts` — Most complex renderer hooks
7. `src/modes/*.ts` — Mode verticals (verify interface compliance)
8. `src/constants.ts` + `main/constants.js` — Verify constants extraction (no hardcoded values in source)

**24B (test coverage) additionally reads:**
3. `tests/` — All 38 test files (scan for feature area mapping)
4. `src/components/` — All component files (cross-reference against test coverage)
5. `src/hooks/` — All hook files (cross-reference against test coverage)
6. `main/` — All main-process modules (cross-reference against test coverage)
7. `docs/governance/TECHNICAL_REFERENCE.md` — Feature inventory (checklist for coverage gaps)

**24C (architecture) additionally reads:**
3. `package.json` — Dependencies, build config, scripts
4. `preload.js` — Security boundary, all exposed IPC channels
5. `main/auth.js` — OAuth2 implementation, token storage
6. `main/ws-server.js` — WebSocket server, pairing token auth
7. `main/cloud-google.js` + `main/cloud-onedrive.js` — Cloud provider implementations
8. `main/sync-engine.js` — Revision counters, merge logic, tombstones
9. `vite.config.js` — Build config, chunking, tree-shaking
10. `.github/workflows/` — CI/CD pipeline config

**24D (docs alignment) additionally reads:**
3. `ROADMAP.md` — Current sprint specs, acceptance criteria
4. `docs/governance/TECHNICAL_REFERENCE.md` — Architecture description, feature inventory
5. `docs/governance/BUG_REPORT.md` — Active bugs (verify none are secretly fixed)
6. `docs/governance/SPRINT_QUEUE.md` — Queue accuracy
7. Cross-reference: walk actual file paths in CLAUDE.md against filesystem

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| `code-reviewer` | sonnet | 24A + 24B. Two sequential passes. First: code quality scan (dead code, lint, rule compliance, known-trap regression). Second: test coverage mapping (feature→test matrix, gap identification). Output: findings to AGENT_FINDINGS.md sections A and B. |
| `ui-investigator` | opus | 24C. Deep architecture analysis. Build dependency graph (imports in main/ and src/). Analyze bundle (vite build output). Audit security surface (preload channels, CSP, token encryption, WS auth). Audit sync engine correctness. Output: findings to AGENT_FINDINGS.md section C. |
| `doc-keeper` | sonnet | 24D. Documentation accuracy pass. Walk every file path reference in CLAUDE.md and TECHNICAL_REFERENCE.md — flag any that don't exist. Verify feature status claims. Verify LESSONS_LEARNED completeness. Output: findings to AGENT_FINDINGS.md section D. |
| `blurby-lead` | opus | Step 5-6. Consolidation only — merge 4 section outputs, deduplicate, finalize severity, produce summary. No original audit work. |

**Execution mode notes:**
- All agents are READ-ONLY. No code changes, no file modifications except writing to `docs/project/AGENT_FINDINGS.md`.
- `ui-investigator` should run `npm run build` once to get actual bundle size output, and may run dependency analysis commands (e.g., `npx madge --circular src/`).
- `code-reviewer` may run `npx tsc --noEmit` for type checking and `npm test` for test inventory.
- No agent should modify any source file, test file, config file, or documentation file other than AGENT_FINDINGS.md.

### WHEN (Execution Order)

```
[1-4] PARALLEL (fully independent, no shared output files):
    ├─ [1] 24A: Code quality audit (code-reviewer, sonnet)
    │       → writes AGENT_FINDINGS.md §24A
    ├─ [2] 24B: Test coverage audit (code-reviewer, sonnet)
    │       → writes AGENT_FINDINGS.md §24B
    ├─ [3] 24C: Architecture review (ui-investigator, opus)
    │       → writes AGENT_FINDINGS.md §24C
    └─ [4] 24D: Docs alignment (doc-keeper, sonnet)
            → writes AGENT_FINDINGS.md §24D
    ↓ (all 4 complete)
[5] Findings consolidation (blurby-lead, opus)
    → merges sections, deduplicates, assigns final severity
    → writes AGENT_FINDINGS.md §Summary
    ↓
[6] Terminal summary (blurby-lead)
    → prints: total findings, CRITICALs, pass/block recommendation
```

**Parallelism note:** Steps 1-4 write to DIFFERENT sections of AGENT_FINDINGS.md. To avoid file conflicts, each agent should write its section to a SEPARATE temp file (`agent-findings-24a.md`, `agent-findings-24b.md`, etc.), and `blurby-lead` merges them in Step 5.

### ADDITIONAL GUIDANCE

**Finding format (every finding must follow this):**
```
### [SECTION]-[NNN]: [Title]
**Severity:** CRITICAL / WARNING / NOTE
**Domain:** Code Quality / Test Coverage / Architecture / Documentation
**File(s):** [path(s)]

**Evidence:** [What was examined, what was found — be specific]
**Impact:** [Why this matters, what could go wrong]
**Recommendation:** [How the project team should respond]
```

**Severity definitions:**
- **CRITICAL:** Blocks v1.0.0 release. Security vulnerability, data loss risk, architectural violation that affects correctness. Must be fixed before release.
- **WARNING:** Should fix before v1.0.0. Code quality issue, missing test coverage for a critical path, documentation inaccuracy that could mislead. Strong recommendation to fix.
- **NOTE:** Improvement opportunity. Non-blocking. Good engineering practice but won't cause user-facing issues if deferred.

**Standing rules to verify (from CLAUDE.md):**
- Electron main process stays CommonJS; renderer stays ESM/TypeScript
- All file I/O in main process must be async (fs.promises) — no synchronous reads/writes
- preload.js is minimal — all system access through IPC
- CSS custom properties for theming — no inline styles
- Never import Node.js modules in renderer code
- Constants extracted to constants files (not hardcoded in source)
- Branch-per-sprint, never commit directly to main

**Known traps to regression-check (from LESSONS_LEARNED.md):**
- Agent must read ALL entries in LESSONS_LEARNED.md and verify each "Prevention" or "Rule" item is still being followed in the current codebase
- Pay special attention to: LL-001 through LL-044+ — each has specific code patterns to check

**Bundle analysis approach:**
- Run `npm run build` and examine `dist/` output sizes
- Flag any chunk >100KB that could be lazy-loaded
- Check `vite.config.js` for code-splitting configuration
- Verify `asarUnpack` entries in package.json match actual needs

**Security checklist:**
- Enumerate all IPC channels in preload.js — verify each has validation
- Check CSP headers in index.html and BrowserWindow config
- Verify token storage uses safeStorage encryption (main/auth.js)
- Verify WebSocket server requires pairing token (main/ws-server.js)
- Check for any `nodeIntegration: true` or `contextIsolation: false`

**Anti-patterns:**
- Do NOT fix anything. This is read-only. Log findings only.
- Do NOT write tests. Recommend them in findings.
- Do NOT modify CLAUDE.md, ROADMAP.md, or LESSONS_LEARNED.md.
- Do NOT create branches or make commits (except the initial branch creation and the final findings commit).
- Each agent writes its own temp file — do NOT have multiple agents write to the same file simultaneously.

**Git workflow:**
- Create branch `sprint/24-external-audit` from main at start
- Only file created: `docs/project/AGENT_FINDINGS.md` (assembled from temp files)
- Single commit after consolidation: `"Sprint 24: external audit findings"`
- Merge to main with `--no-ff` after user review

### SUCCESS CRITERIA

1. `docs/project/AGENT_FINDINGS.md` exists with all 4 sections (24A-24D) + Summary
2. Every finding follows the required format (Section-NNN, Severity, Domain, Evidence, Impact, Recommendation)
3. Every standing rule from CLAUDE.md has a compliance finding (PASS or finding with severity)
4. Every entry in LESSONS_LEARNED.md has a regression check result
5. Feature-to-test coverage matrix produced (every feature area from TECHNICAL_REFERENCE.md mapped to test files, gaps identified)
6. Dependency graph produced — circular dependencies identified (if any)
7. Bundle size analysis completed — largest chunks identified with lazy-load recommendations
8. Security surface enumerated — all IPC channels, CSP, token storage, WS auth reviewed
9. CLAUDE.md and TECHNICAL_REFERENCE.md file path accuracy verified (every path checked against filesystem)
10. All findings have severity ratings — CRITICAL count determines v1.0.0 pass/block
11. Terminal summary printed with: total findings, breakdown by severity, pass/block recommendation
12. Branch `sprint/24-external-audit` merged to main with `--no-ff`
