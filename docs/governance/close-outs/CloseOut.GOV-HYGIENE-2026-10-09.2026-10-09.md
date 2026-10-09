---
sprint: GOV-HYGIENE-2026-10-09
date: 2026-10-09
runtime: not recorded (CLI sessions; no duration captured)
tokens: not recorded
status: has-discoveries
---

# Pointer Close-Out: GOV-HYGIENE-2026-10-09

Covers the governance package produced by the 2026-10-08 roadmap review: GOV-HYGIENE-2026-10-09 (CLI block, merged `56c97e44`) and its follow-up GOV-EPICS-2026-10-09 (merged `fdfb658a`). It is ad hoc governance work with no work-register item, so this close-out appends no terminal record and makes no register change (see F7).

## Sprint Brief

**Goal:** Land the 2026-10-08 roadmap review on `main`, register the Rule 5b git policy, make the lessons file parser-readable, and register the `epics` role with the READER-MODE-SEPARATION-2 epic packet.
**Result:** Merge `56c97e44` (`--no-ff` of `cd384b78` and `6c8c747f`, pushed) landed `policy.git` = push/allow, `policy.lessons.idPrefix` = `LL` and a canonical lesson index (920 lines added, 0 deleted since `cd384b78`). The parser reads 92 live / 8 closed, and U9 exits 0 for all four active specs. Merge `fdfb658a` registered `epics` → `docs/planning/epics` and landed the five packet files byte-identical. The owner's follow-up `fae71ebb` corrected main refs in the packet.
**Learned:** LL-129 — Bulk transforms of hand-written docs must census label variants before dispatch. LL-130 — virtuoso mutation-plan opens a recovery record; it is not a dry run.
**Recommend:** Launch the mode-separation epic from its kickoff prompt; dispatch the cloud-retry cleanup in parallel.
**Bottom line:** Governance state is committed, pushed and machine-readable; the one loss is a single untracked pre-repair registry backup.

## Findings

| # | Finding | Metric | Target | Actual | Pass/Fail | Delta from Prior | Severity |
|---|---------|--------|--------|--------|-----------|------------------|----------|
| F1 | Governance merge published | `main` = `origin/main`; `56c97e44^2` = docs tip | equal | equal (`6c8c747f`) | Pass | review was uncommitted on 2026-10-08 | — |
| F1a | Registry policy | `policy.git`; `lessons.idPrefix` | push/allow; LL | push/allow; LL | Pass | was unregistered (plugin defaults); prefix SRL | — |
| F1b | Lessons append-only | `git diff --numstat cd384b78 56c97e44 -- LESSONS_LEARNED.md` | 0 deleted | 920 / 0 (904 this run + 16 from `1e5485c6`) | Pass | — | — |
| F1c | Parser reads lessons; U9 | `lessons --open`; `lessons --check` ×4 | > 0; exit 0 ×4 | 92 live / 8 closed; exit 0 ×4 | Pass | 0 live; U9 waived | — |
| F2 | Epics role and packet | `resolve epics`; packet hashes vs `main` | resolves; equal | `docs/planning/epics`; 5/5 equal | Pass | role absent | — |
| F3 | Untracked backup custody | `Virtuoso/.backups/20260923T182425Z-approved-roadmap-review-repair` | present | **absent** — no copy in any worktree, `C:\tmp` or Recycle Bin | Fail | present at review start 2026-10-08 | Low |
| F4 | Legacy-parser spec cites superseded LL-001 | U9 warning | none | warning (range text "LL-001–LL-127") | Fixed here | — | Cosmetic |
| F5 | Index quality | LL-082 Verdict; LL-128 item | sentence; REFACTOR-1B | code snippet; REFACTOR-1A | Open | — | Low |
| F6 | Duplicate rule label PR-092 | in LL-092 and LL-128 entries | unique | duplicated | Open (pre-existing) | — | Low |
| F7 | Terminal record / register | register item | — | none exists | N/A | — | — |

## Interpretation

- F1/F2: verified from primary evidence in this session (git identities, registry reads, parser output), not from the CLI summary. All four U9 checks were re-run here and pass.
- F3: the folder held the only copy of `Virtuoso/workspace-layout.json` from before the first 2026-09-23 repair. Git first tracked that file in `1e5485c6`, after the repair, and the earliest surviving backup is the 18:29Z pre-migration copy, which is post-repair. Cause undetermined. The CLI reports deleting exactly 77 untracked and resetting 3 tracked paths, all from the branch's 80-path list, and this folder was not among them. It vanished between the start of the review and GOV-EPICS. Classified as a custody gap with no functional impact: the lost state is the abandoned pre-Virtuoso layout, and nothing reads it.
- F4: caused by the reviewer's own phrasing, which the parser reads as citations. Reworded to "Read every live lesson by title;" so the text does not go stale as lessons are added.

## Proposed Dispositions

- F1, F2: accepted.
- F3: accepted as a recorded loss (owner-confirmed 2026-10-09). Follow-up: the next governance sweep keeps a hash inventory of `Virtuoso/.backups/` so a disappearance is detectable.
- F4: fixed in this crossing (`ROADMAP.md`, CLEANUP-LEGACY-PARSERS-1 Lessons applied).
- F5, F6: next governance sweep, through appended correction entries. Never edit the index in place.
- F7: none required.

## Mid-Dispatch Decisions

- **2026-10-08 — STEP 3b duplicate LL-092 (Type 1b — Advance, owner-chosen option 1).** LL-092 stays with PERF-1 (line 1153). The REFACTOR-1B entry (line 1125) is indexed as LL-128 in the appended index only, and no existing line is edited. Label matching moved to prefix-based with defined fallbacks. Full record: `docs/governance/bug-reports/Issue.GOV-HYGIENE-2026-10-09.2026-10-08.md`.
- **2026-10-09 — GOV-EPICS-2026-10-09.** The `epics` role was registered after GOV-HYGIENE rather than inside it: the CLI had already passed the original addendum's insertion point. It was run as a separate follow-up block.

## Lessons

- **New:** LL-129 — Bulk transforms of hand-written docs must census label variants before dispatch.
- **New:** LL-130 — virtuoso mutation-plan opens a recovery record; it is not a dry run.
- **Applied:** none. The GOV-HYGIENE block was not written in the D.5.2 format and carried no Lessons applied section. That gap is the evidence behind LL-129.

## Files Created

- **Removed (temporary):** none
- **Committed:** `docs/governance/LESSONS_LEARNED.md` (2 entries appended), `ROADMAP.md` (1 line), this report
- **Ignored:** none
- **Left for a decision:** branches and worktrees `eb/roadmap-review-2026-10-08`, `eb/gov-epics-2026-10-09`, `eb/closeout-gov-hygiene-2026-10-09` (maintenance; never automatic deletion)
- **Guard:** not run. There is no implementation base: governance-only, and every created file is committed above.

## Governance Updates

- `LESSONS_LEARNED.md`: LL-129, LL-130 appended (Observation).
- `ROADMAP.md`: CLEANUP-LEGACY-PARSERS-1 Lessons applied wording (F4).

## Roadmap & Queue Movement

- **Retired:** none (no register item).
- **Elevated:** none. The head stays READER-MODE-SEPARATION-2 (Path: epic, packet registered and launch-ready).

## Next Work Pointer

Epic kickoff for READER-MODE-SEPARATION-2 from `docs/planning/epics/2026-10-09-reader-mode-separation-2/launch.md`. In parallel, `/next-pointer` for CLOUD-RETRY-SHARED-1.

## Gates

No audit or release gate is triggered by governance-only work.

## Git Hand-Off

- [x] Committed on `eb/closeout-gov-hygiene-2026-10-09`, merged `--no-ff` to `main` and pushed under `policy.git` = push (Rule 5b).
