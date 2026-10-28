# SK-HYG-2: Directory Reorganization (Option B) — DISPATCH

- **Sprint ID:** `SK-HYG-2`
- **Sprint type:** Governance hygiene (docs reorganization)
- **Authored:** 2026-05-04 PM (Cowork)
- **Lane Ownership:** Lane E (Governance/Planning). Parallel-safe with any active sprint.
- **Forbidden During Parallel Run:** No edits to `src/`, `main/`, `scripts/`, `tests/`, `chrome-extension/`, `node_modules/`, `dist/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.js`. Sprint touches `docs/`, `.gitignore`, and explicitly listed root clutter paths only. If an audit finding would require moving content into a forbidden path, leave it in place and record a follow-up instead.
- **Shared-Core Touches:** None.
- **Merge Order:** Standalone parallel hotfix lane. Can land alongside the active TTS Architecture conveyor and does not displace the FIFO queue head.

## Resolved Decisions

- **Conveyor positioning:** `SK-HYG-2` is a standalone parallel Lane E hotfix. It can dispatch whenever governance capacity is available and must not reorder the TTS FIFO conveyor.
- **Artifacts policy:** Option B is approved. Bulk `artifacts/` and `tmp/` are ignored; canonical decision evidence is copied into tracked `docs/evidence/` with provenance.
- **Parallel-safety clarification:** A16 and B8/B9 are verification-first. If a discovered reference or root clutter item requires edits to `tests/`, `scripts/`, `dist/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.js`, or any code path, do not make that edit in this sprint. Record it as a follow-up so Lane E remains isolated.

## Goal

Reorganize the Blurby repo's documentation tree and remove unnecessary tracked bloat, without touching any code, build paths, or active sprint files. After the sprint:

1. `docs/` has 6–7 top-level subfolders (down from 11), each with a clear single purpose.
2. Archive convention is uniform across the tree (`.Archive/` subfolders only — no `_ARCHIVE.md` / `_ARCHIVED.md` filename suffixes).
3. `artifacts/` (1.6 GB) and `tmp/` (51,427 files) are no longer tracked in git. Canonical decision evidence is curated into a new tracked `docs/evidence/` folder.
4. Six `tmp_brandcheck*` duplicate folders are collapsed.
5. Cross-references in `ROADMAP.md`, `SPRINT_QUEUE.md`, `CLAUDE.md`, `README.md`, and active governance docs all point to new paths.

## Why

Per Cowork survey 2026-05-04 PM:

- 11 top-level `docs/` subfolders with overlapping concerns make it impossible for a new contributor to guess where new docs go.
- Three coexisting archive-naming conventions (`.Archive/`, `_ARCHIVE.md`, `_ARCHIVED.md`, `_V2_ARCHIVED.md`) create version drift.
- `artifacts/` has grown to 1.6 GB / 5,200+ files with no archival discipline — a fresh clone pays 1.6 GB to get the latest experiment runs that are mostly irrelevant to ongoing work.
- `tmp/` contains 51,427 tracked files, almost certainly an accidental commit.
- Six near-identical `tmp_brandcheck*` folders from 2026-04-21 should be one or none.
- `Close-Outs` is the lone PascalKebab outlier in an otherwise kebab-case docs tree.

This is hygiene, not feature work. It does not affect Desktop v2.0's finish-line deliverables.

## Lane Ownership

| Lane | Owned? | Why |
|------|--------|-----|
| A: Runtime Core | No | No `src/hooks/useNarration.ts`, `src/utils/FlowScrollEngine.ts`, etc. |
| B: Evaluation Harness | No | No `tests/`, `scripts/tts_eval_runner.mjs` |
| C: UI Surfaces | No | No `src/components/`, `src/styles/` |
| D: Platform/Main | No | No `main/`, `preload.js`, `main.js` |
| **E: Governance/Planning** | **Yes** | Owns all `docs/` moves + `.gitignore` updates |

## Baseline (pre-sprint state)

- `docs/` subfolder count: **11** (audit, brand, bug-reports, Close-Outs, governance, investigations, project, research, reviews, superpowers, testing)
- `docs/` total `.md` files: **176**
- `artifacts/` total disk: **1.6 GB** / **5,200+** files
- `tmp/` total files: **51,427**
- `tmp_brandcheck*` folder count: **6** (`tmp_brandcheck`, `tmp_brandcheck_clean`, `tmp_brandcheck_final`, `tmp_brandcheck_last`, `tmp_brandcheck_last2`, `tmp_brandcheck_last3`)
- Active `_ARCHIVE*.md` / `_ARCHIVED.md` filename-suffix files in docs/: at least 5 (`docs/planning/.Archive/ROADMAP_legacy.md`, `ROADMAP_ARCHIVE_2026-05-02.md`, `ROADMAP_ARCHIVE_2026-05-14.md`, `ROADMAP_ARCHIVE_DEFERRED_2026-05-15.md`, `ROADMAP_V2_ARCHIVED.md`)
- Repo HEAD: `76308c0` ("docs: preserve moss nano 13d live evidence") — note 13d implementation files are still dirty in working tree (this sprint should NOT stage those; see Wave A task 14).

## Target structure (post-sprint)

```
docs/
├── governance/              # State of the project (operational)
│   ├── BUG_REPORT.md
│   ├── DEVELOPMENT_SYNC.md
│   ├── IDEAS.md
│   ├── LESSONS_LEARNED.md
│   ├── QWEN_SUPPORTED_HOST_POLICY.md
│   ├── SPRINT_QUEUE.md
│   ├── TECHNICAL_REFERENCE.md
│   ├── TTS_EVAL_*.md (template + runbook)
│   ├── close-outs/          # (formerly docs/governance/close-outs/)
│   │   ├── CloseOut.NARR-LAYER-1A.2026-04-16.md
│   │   ├── ... (17 files)
│   │   └── SpecRetro.Lessons_Learned.md
│   ├── bug-reports/         # (formerly docs/governance/bug-reports/)
│   │   └── .Archive/
│   └── .Archive/            # (historical governance docs)
├── planning/                # Forward-looking sprint specs and reviews
│   ├── (formerly docs/planning/* and docs/planning/plans|specs/*)
│   ├── roadmap-reviews/
│   ├── plans/               # (formerly docs/planning/plans/)
│   │   └── .Archive/
│   ├── specs/               # (formerly docs/planning/specs/)
│   │   └── .Archive/
│   └── .Archive/            # (formerly ROADMAP_ARCHIVE*.md files, renamed)
├── studies/                 # Evidence-of-thinking artifacts
│   ├── audit/               # (formerly docs/studies/audit/)
│   ├── investigations/      # (formerly docs/studies/investigations/)
│   ├── reviews/             # (formerly docs/studies/reviews/)
│   └── research/            # (formerly docs/studies/research/)
├── testing/                 # Test plans, matrices, coverage tracking (unchanged)
├── extension/               # (NEW) Chrome extension docs, install instructions, protocol contract
├── evidence/                # (NEW) Curated canonical decision artifacts (from artifacts/)
│   ├── moss-nano-13d-live-evidence.json
│   ├── moss-nano-6f-promotion-confirmation.json
│   ├── tts-eval-baseline-summary.json
│   └── ... (~30 files)
└── brand/                   # (kept only if non-empty; else deleted)
```

```
artifacts/                   # NOW IN .gitignore (untracked locally, ignored remotely)
tmp/                         # NOW IN .gitignore
tmp_brandcheck*              # DELETED (all 6 folders)
docs/evidence/example-book/                # Move only to docs/evidence/example-book/ if demo/provenance content; leave if test fixture
patches/                     # Leave if package-managed; delete only if proven obsolete; do not move into scripts/
public/                      # Verify Vite needs it; leave if needed or uncertain; delete only if proven stray
resources/                   # Relocate only to allowed docs/evidence path; leave + follow-up if code/build destination needed
```

```
(repo root)
├── ROADMAP.md               # UNCHANGED (still root)
├── ROADMAP_SPECS.md         # UNCHANGED (still root)
├── CLAUDE.md                # UNCHANGED (still root)
├── README.md                # UNCHANGED (still root)
└── .gitignore               # UPDATED (adds artifacts/, tmp/, tmp_brandcheck*)
```

## WHERE (Read Order)

1. `CLAUDE.md` — Standing Rules, especially Rule 10 (no destructive cleanup unless user requests deletion explicitly), Rule 6 (parallelize lanes), Rule 6a (CLI executes, doesn't investigate)
2. `docs/governance/LESSONS_LEARNED.md` — scan for any prior doc-reorg lessons
3. `docs/governance/DEVELOPMENT_SYNC.md` — local-first git SOP; relevant for the cross-reference sweep
4. This file (`docs/planning/SK-HYG-2-DISPATCH.md`) — the full spec
5. `ROADMAP.md` — to find every path reference that needs updating (Wave B task 16)
6. `docs/governance/SPRINT_QUEUE.md` — same (Wave B task 17)

## Wave A — Doc Moves & Folder Restructure (Hephaestus + Hermes)

> **CRITICAL CONSTRAINT:** The 13d implementation files are currently dirty in the working tree (`src/hooks/narration/mossNanoStrategy.ts`, `src/hooks/useNarration.ts`, etc.). This sprint MUST NOT stage those files. Use `git mv` for every move and confirm `git status` shows only the intended moves before committing each batch.

| # | Task | Source → Destination | Owner |
|---|------|---------------------|-------|
| A1 | Create target folder structure | `mkdir -p docs/planning docs/studies docs/extension docs/evidence docs/governance/close-outs docs/governance/bug-reports` | Hermes |
| A2 | Move `docs/planning/` → `docs/planning/` (recursive, preserves subfolder structure) | `git mv docs/planning/* docs/planning/` | Hermes |
| A3 | Move `docs/planning/plans/*` → `docs/planning/plans/` | `git mv docs/planning/plans/* docs/planning/plans/` | Hermes |
| A4 | Move `docs/planning/specs/*` → `docs/planning/specs/` | `git mv docs/planning/specs/* docs/planning/specs/` | Hermes |
| A5 | Remove now-empty `docs/planning/` shell | `rmdir docs/planning/plans docs/planning/specs docs/planning` | Hermes |
| A6 | Move `docs/studies/audit/` → `docs/studies/audit/` | `git mv docs/studies/audit docs/studies/audit` | Hermes |
| A7 | Move `docs/studies/investigations/` → `docs/studies/investigations/` | `git mv docs/studies/investigations docs/studies/investigations` | Hermes |
| A8 | Move `docs/studies/reviews/` → `docs/studies/reviews/` | `git mv docs/studies/reviews docs/studies/reviews` | Hermes |
| A9 | Move `docs/studies/research/` → `docs/studies/research/` | `git mv docs/studies/research docs/studies/research` | Hermes |
| A10 | Move `docs/governance/close-outs/` → `docs/governance/close-outs/` (rename to kebab-case) | `git mv docs/governance/close-outs docs/governance/close-outs` | Hermes |
| A11 | Move `docs/governance/bug-reports/.Archive/` → `docs/governance/bug-reports/.Archive/` | `git mv docs/governance/bug-reports/.Archive docs/governance/bug-reports/.Archive` then `rmdir docs/governance/bug-reports` | Hermes |
| A12 | Verify `docs/brand/` is truly empty; if non-empty, leave as `docs/brand/`; if empty, delete | `[ -z "$(ls docs/brand)" ] && rmdir docs/brand` | Hermes |
| A13 | Standardize archive naming: move filename-suffix archives into `.Archive/` subfolders | See "Archive moves" table below | Hephaestus (renderer-scope analog: file ops with judgment) |
| A14 | Identify canonical decision artifacts in `artifacts/` and copy to `docs/evidence/` | See "Evidence curation" table below | Hephaestus (judgment on which to keep) |
| A15 | Delete `tmp_brandcheck*` duplicates (verify with diff first — if any single folder has unique content, keep that one and delete the other 5) | `diff -r tmp_brandcheck tmp_brandcheck_clean` etc.; `rm -rf` confirmed-duplicates | Hephaestus |
| A16 | Audit `docs/evidence/example-book/`, `patches/`, `public/`, `resources/` — keep, relocate, or delete per content (see "Single-file dir audit" table below) | Per-file decisions | Hephaestus |
| A17 | Update `.gitignore` — add `artifacts/`, `tmp/`, `tmp_brandcheck*`, and document the curated `docs/evidence/` exception inline | Edit `.gitignore` | Hermes |
| A18 | Verify working tree: `git status` should show ONLY the moves planned in this Wave plus the .gitignore update. The 13d dirty files must NOT be staged. | `git status` review | Solon (spec compliance gate) |

### Archive moves (Task A13 detail)

| Source | Destination |
|--------|-------------|
| `docs/planning/.Archive/ROADMAP_legacy.md` | `docs/planning/.Archive/ROADMAP_legacy.md` (rename — the "legacy" archive covering Phases 1–6) |
| `docs/planning/.Archive/ROADMAP_2026-05-02.md` | `docs/planning/.Archive/ROADMAP_2026-05-02.md` |
| `docs/planning/.Archive/ROADMAP_2026-05-14.md` | `docs/planning/.Archive/ROADMAP_2026-05-14.md` |
| `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` | `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` |
| `docs/planning/.Archive/ROADMAP_v2.md` | `docs/planning/.Archive/ROADMAP_v2.md` |
| `docs/planning/.Archive/ROADMAP_v2_archived.md` | DELETE if redundant with `ROADMAP_v2.md`; else `docs/planning/.Archive/ROADMAP_v2_archived.md` |

After this task, the only ROADMAP-related markdown files outside `.Archive/` are: `ROADMAP.md` and `ROADMAP_SPECS.md` at the repo root.

### Evidence curation (Task A14 detail)

Goal: curate 20–40 canonical files from `artifacts/` into `docs/evidence/` so the audit trail survives gitignoring the rest. Criteria for inclusion:

- **Promotion-confirmation artifacts** — files cited in `docs/testing/MOSS_DECISION_LOG.md` as the basis for a `PROMOTE_*` or `KEEP_PAUSED_*` decision
- **Gate-pass artifacts** — files cited in audit response §7 as evidence supporting `RECOMMENDED_OPT_IN` or `EXPERIMENTAL_ONLY` decisions
- **Baseline summaries** — files named `summary.json` from the canonical TTS-EVAL baseline runs (Kokoro 9/9 pass baseline; streaming Qwen baseline)
- **Live-evidence v2 artifacts** — the MOSS-NANO-13d capture artifact

Concrete first-pass list (Hephaestus should grep MOSS_DECISION_LOG and the audit responses for the actual filenames):

| Likely-canonical artifact | Source path |
|---------------------------|-------------|
| MOSS-NANO-13d live evidence | `artifacts/tts-eval/moss-nano-13d-live-capture/moss-nano-13d-live-evidence.json` |
| MOSS-NANO-13d gate output | `artifacts/tts-eval/moss-nano-13d-live-capture/gate/*` |
| MOSS-NANO-6F promotion-confirmation | `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json` |
| MOSS-NANO-12 live-four-mode evidence | `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json` |
| TTS-EVAL Kokoro baseline | `artifacts/tts-eval/aggregate-summary.json` and `summary.json` |
| QWEN-STREAM-4 streaming baseline | (whichever artifact represents the ITERATE decision) |

Hephaestus uses `cp -r` (not `git mv`) to preserve the originals during this task — the originals will be untracked after `.gitignore` update.

### Single-file dir audit (Task A16 detail)

| Folder | Content | Recommended action |
|--------|---------|--------------------|
| `docs/evidence/example-book/` (3 files) | Demo book content | Confirm no tests reference the current path. In this Lane E sprint, do not move into `tests/`. If it is only demo/provenance content, move to `docs/evidence/example-book/`; if tests depend on it, leave it and record follow-up. |
| `patches/` (1 file) | Likely a patch-package patch | If `package.json` references it via `postinstall` or similar, leave it. If it is obsolete, delete only after confirming no package reference. Do not move into `scripts/` in this sprint; record follow-up if a script-lane destination is desired. |
| `public/` (1 file) | Likely a Vite-required directory | Check `vite.config.js` by read-only grep. If Vite needs `public/` or the result is uncertain, leave it. Delete only if the file is proven stray and unused. |
| `resources/` (2 files) | Unknown | Inspect contents. Relocate only if the destination is an allowed docs/evidence path. If the right destination would be `dist/`, `scripts/`, `tests/`, `src/`, or another forbidden path, leave it and record follow-up. |
| `docs/brand/` (empty) | Empty | Delete after confirming empty. |

## Wave B — Cross-Reference Sweep & Verification (Hephaestus + Solon + Herodotus + Hermes)

| # | Task | Files | Owner |
|---|------|-------|-------|
| B1 | Grep `ROADMAP.md` for paths matching `docs/planning/`, `docs/studies/audit/`, `docs/studies/investigations/`, `docs/studies/reviews/`, `docs/studies/research/`, `docs/governance/close-outs/`, `docs/planning/`, `docs/governance/bug-reports/`, `docs/brand/`. Update each to the new path. | `ROADMAP.md` | Hephaestus |
| B2 | Same grep on `docs/governance/SPRINT_QUEUE.md`. Update each. | `SPRINT_QUEUE.md` | Hephaestus |
| B3 | Same grep on `CLAUDE.md`. Update each (this is critical — CLAUDE.md is read by every CLI session). | `CLAUDE.md` | Hephaestus |
| B4 | Same grep on `README.md`. Update each. | `README.md` | Hephaestus |
| B5 | Same grep on `ROADMAP_SPECS.md`. Update each. | `ROADMAP_SPECS.md` | Hephaestus |
| B6 | Grep all of `docs/governance/` for old paths. Update each. | `docs/governance/**/*.md` | Hephaestus |
| B7 | Grep all of `docs/planning/` for old paths (especially within the moved-just-now `roadmap-reviews/` artifacts). Update each. | `docs/planning/**/*.md` | Hephaestus |
| B8 | Grep `package.json` `scripts` and `files` fields for any reference to a moved path. Do not edit `package.json` in this parallel sprint; if a reference is found, stop and record a follow-up or seek an explicit amendment. | `package.json` | Hephaestus |
| B9 | Grep `tsconfig.json`, `vite.config.js`, `.github/workflows/*` for any reference to a moved path. Do not edit forbidden config/build files in this parallel sprint; if a reference is found, stop and record a follow-up or seek an explicit amendment. | configs | Hephaestus |
| B10 | Run `npm test` — sanity check. Must pass with same count as pre-sprint (no test count change expected; no test files moved). | — | Hippocrates |
| B11 | Run `npm run build` — sanity check. Must succeed with same warnings as pre-sprint. | — | Hippocrates |
| B12 | `git diff --stat` — verify nothing in `src/`, `main/`, `scripts/`, `tests/`, `chrome-extension/` was modified. Verify dirty 13d files were NOT staged. | — | Solon |
| B13 | Spec-compliance check: every SUCCESS CRITERIA item below must verify against the final state. | This file | Solon |
| B14 | Quality + known-trap review: any orphaned references? Any `.Archive/` subfolders missing intended content? Any cross-reference link broken? | — | Plato |
| B15 | Herodotus pass: update `TECHNICAL_REFERENCE.md` if any architecture diagrams reference old paths. Update `LESSONS_LEARNED.md` with a new lesson if any non-trivial discovery was made during the move (e.g., "Always use git mv, not mv + add"). Update `ROADMAP.md` header (the "Last updated" line) and `SPRINT_QUEUE.md` Completed Sprints table. | docs | Herodotus |
| B16 | Hermes git: stage the moves in logical commits (suggested 4 commits — A1–A12 as "docs: collapse docs/ to 7 top-level subfolders"; A13 as "docs: standardize archive naming under .Archive/"; A14 as "docs: curate canonical evidence artifacts"; A15–A17 as "chore: clean up tmp_brandcheck duplicates + gitignore artifacts and tmp"). Merge to `main` with `--no-ff`. Push. | — | Hermes |

> **Wave-split rule (Standing Rule 10):** This sprint has 18 + 16 = 34 tasks. Both waves exceed the 40-tool-use ceiling individually only at the upper bound; pre-split as drawn (A vs B) keeps each under ceiling. Hermes should split B16's commits into the four logical commits noted to keep each commit reviewable.

## SUCCESS CRITERIA

1. `docs/` has 6 top-level subfolders if `brand/` was deleted, else 7. Exact set: `governance/`, `planning/`, `studies/`, `testing/`, `extension/`, `evidence/`, and optionally `brand/`.
2. Zero filename-suffix archives (no `_ARCHIVE.md`, `_ARCHIVED.md`, `_V2_ARCHIVED.md`) exist outside of `.Archive/` subfolders.
3. `docs/governance/close-outs/` no longer exists (renamed to `docs/governance/close-outs/`).
4. `docs/planning/`, `docs/planning/`, `docs/studies/audit/`, `docs/studies/investigations/`, `docs/studies/reviews/`, `docs/studies/research/`, `docs/governance/bug-reports/` no longer exist at the top level (all merged into the 6–7 target subfolders).
5. `artifacts/` and `tmp/` are in `.gitignore`. A fresh clone after the merge produces ~30 MB of `docs/evidence/`, not 1.6 GB of `artifacts/`.
6. `tmp_brandcheck*` is one folder maximum (if a unique-content variant survives) or zero.
7. `docs/evidence/` contains 20–40 canonical decision artifacts cited by `MOSS_DECISION_LOG.md`, audit responses, or TTS-EVAL baselines. Each file has a sibling `INDEX.md` or filename comment explaining provenance.
8. `ROADMAP.md`, `SPRINT_QUEUE.md`, `CLAUDE.md`, `README.md`, and `ROADMAP_SPECS.md` cross-references all point to new paths. `grep -r "docs/planning/" .` outside `.git/`, `node_modules/`, `dist/`, `tmp/`, `artifacts/` returns zero hits (same for `docs/governance/close-outs/`, `docs/studies/audit/`, etc.).
9. `npm test` passes with the same test count as pre-sprint (target: ≥2,518 tests, no test file moves expected).
10. `npm run build` succeeds with the same circular-chunk warning as pre-sprint (no new warnings).
11. `git diff --stat` shows ZERO modifications to `src/`, `main/`, `scripts/`, `tests/`, `chrome-extension/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.js`.
12. The 13d dirty implementation files (`src/hooks/narration/mossNanoStrategy.ts`, `src/hooks/useNarration.ts`, etc.) are NOT staged by this sprint's commits.
13. `git log --oneline` for the sprint branch shows 4 logical commits, each individually reviewable.
14. Standing Rules section in `ROADMAP.md` and the queue rule in `SPRINT_QUEUE.md` are unchanged in substance (only path references updated).

## Tier: Full | Effort: M (~3 LOE) | Depends on: nothing

## Roster

- **Hephaestus** (renderer-scope analog — file-system judgment): Wave A archive standardization (A13), evidence curation (A14), tmp_brandcheck dedup (A15), single-file dir audit (A16). Wave B cross-reference sweep (B1–B9).
- **Hermes** (mechanical execution): Wave A `mkdir` + `git mv` (A1–A12), `.gitignore` update (A17), final commit/merge/push (B16).
- **Hippocrates** (test execution): B10 (`npm test`), B11 (`npm run build`).
- **Solon** (spec compliance): A18 (working-tree verification), B12 (git diff verification), B13 (SUCCESS CRITERIA check).
- **Plato** (quality + known-trap review): B14.
- **Herodotus** (governance + docs): B15.

## Source

- Cowork survey 2026-05-04 PM (this conversation)
- CLAUDE.md Rule 10 ("Do not wipe the workspace") — sprint is reorganization, not deletion; the only deletions are explicitly user-approved tmp_brandcheck duplicates and the empty `docs/brand/`
- CLAUDE.md Rule 6a ("CLI executes, it does not investigate") — this dispatch has explicit source → destination paths for every move; CLI does not need to make discovery decisions

#### Mid-Dispatch Amendment — 2026-05-16

**Pause point:** Verification found stale old-path references in files outside the original Lane E edit surface, including one test failure and runtime/script path constants.
**Decision:** Type 3 — Pivot Advance
**Rationale:** The sprint cannot merge with a failing hygiene test or known broken path constants created by the documented moves. The remaining work is limited to mechanical old-path-to-new-path replacements required for correctness, not feature expansion.
**Scope change:** Add task B15a before B16: update only stale literal path references in `tests/artifactHygienePolicy.test.ts`, `scripts/tts_engine_scan_index.mjs`, `scripts/qwen_streaming_sidecar.py`, and `main/ipc/stats.js` when the new destination exists and the edit is an exact path replacement. Do not edit `.idea/` metadata, binary zip contents, package/build config, or unrelated runtime logic. After B15a, rerun `npm test`, stale-reference/spec-compliance checks, and B16.
**Follow-up items:** Binary audit-package matches and IDE metadata stale references are deferred unless future tooling requires them. If any listed path repair requires logic changes instead of a literal replacement, stop and request a new decision.
**Close-Out Preservation:** Migrate this amendment verbatim into the SK-HYG-2 close-out memo under §Mid-Dispatch Decisions before collapsing the inline spec to a completed-summary row. If skipped, downstream readers will not know why the original Lane E fence was narrowly widened to include test/script/runtime path-string repairs while still excluding IDE metadata and binary archive contents.
