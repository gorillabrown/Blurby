# Roadmap Review 2026-10-23 — Phase B Assessment

**Provenance:** `kpis --json` on the snapshot of `notion:database/3f87c96cc31e800580cfe019c89a56ca` taken 2026-10-23T17:12:10Z (not stale), before this review's 16 confirmed writes; those writes changed no status counts except FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1 and ERROR-LOG-CAP-1 (Queued → In Flight) and one new item, FLOW-PARA-KEYS-1. Terminal ledger `docs/governance/terminal-ledger.jsonl` to TR-080; trailing window 2026-09-26 to 2026-10-23.

## B.1 Work remaining

| Measure | Value |
|---|---|
| Items | 151 (152 with FLOW-PARA-KEYS-1) |
| Queued | 25 → 23 after this review's status fixes, plus FLOW-PARA-KEYS-1 = 24 |
| In Flight | 46 → 49 |
| Blocked | 0 |
| Completed / dissolved / superseded | 68 / 8 / 4 |
| Complete by count | 53.0% |
| Complete by effort | **not computable**: no effort on FLOW-ZONE-AUTO, GOVERNANCE-SWEEP, READER-MODE-ISOLATION-1-PHASE-0 and SK-HYG-2, and the effort scale has no entries for the legacy sizes 1, 2, 3 and 8 |

**What In Flight means here.** 49 items are In Flight, but they are in three different states:

- **27 merged, waiting on the release gate.** These are the 17 Stage 8 items, PDF-IMPORT-DIAG-1, ELECTRON-42-UPGRADE-1, PAGE-POSITION-SAVE-2, RELEASE-RUNBOOK-1 and the six release-fix items. Their close-outs wait for gate (1) on `36ac7466` (quiet machine) and the smoke re-check (installers built at 09:08).
- **19 built, waiting on the freeze** (unmerged branches): see the audit, A.2.
- **3 merged, not closed out:** UI-SWEEP-1, UI-SWEEP-TRIAGE-1 and SMOKE8-DIAG-1. Their close-outs are running in this review.

## B.2 Pace

- **Declared deadline:** `mode-separation` (2026-11-30) is **met**: nothing in its scope remains (READER-MODE-SEPARATION-2, TR-057).
- **The current finish line, the Stage 8 release, has no dated deadline** (owner, 2026-10-22). Pace against it is not computable, because no date is declared.
- **Trailing rate:** 6.0 items and 18.5 points a week (24 completions in 4 weeks; 3 superseded and 2 dissolved excluded). The 46 items held behind the gate and the freeze are not in that rate. When the gate passes, about 27 close-outs land at once, and 19 merges follow.

## B.3 Scope discipline (since 2026-10-22)

| Item | Class | Signal |
|---|---|---|
| CI-AUDIT-ALLOWLIST-1 (TR-079) | forward | its merge is the freeze point and gate (1)'s original target; its lockfile ships in the release (judgement) |
| SMOKE8-DIAG-1 (closing now) | forward | release blocker for gate (2); produced the release fix |
| JSONSTORE-TIMEOUT-1 (TR-078) | sideways | hardening; sequenced before the freeze, but not a gate condition |
| RENAME-RETRY-1 (TR-076) | sideways | defect hardening |
| KF2-WAIVER-RETIRE-1 (TR-077) | sideways | governance |
| READER-VISUAL-DIAG-1 (TR-080) | sideways | diagnosis; produced BAND-ALIGN-1, FOLIATE-OBSERVER-LEAK-1 and ERROR-LOG-CAP-1 |
| UI-SWEEP-1 (closing now) | sideways | measurement tooling, at the owner's request |
| UI-SWEEP-TRIAGE-1 (closing now) | sideways | measurement; produced FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1 |

- **Score:** 2 forward, 6 sideways, 0 backward, giving **0.25**. That is the same as the previous review.
- **Reading:** the release work itself (the six release-fix items) is merged but not terminal, so it is not scored yet. The sideways share comes from the freeze. Diagnosis and specification ran ahead while merges could not land.
- **Added scope (not scored):**
  - post-release, all sideways: the release fix's sibling specs (PAGE-SAVE-RESTAMP-3, JUMP-LANDING-SAVE-1, ZIP-ASYNC-READ-1); the read-only diagnosis follow-ups (BAND-ALIGN-1, BAND-ALIGN-2, FOLIATE-OBSERVER-LEAK-1, ERROR-LOG-CAP-1); and the keys fixes (FOCUS-KEYS-FIX-1, FLOW-KEYS-FIX-1, FLOW-PARA-KEYS-1);
  - eleven items built during the freeze, all specified 2026-10-23;
  - NARRATE-QUIT-LINGER-1 (stub).
- **Backlog pressure:** 19 built branches are waiting on one freeze lift. Each one's merge order is written in its spec. The first post-release hour is a merge train: several branches share files (`main/ws-server.js`, `chunkPlan.ts`, Flow's runtime), and each takes `origin/main` in and re-greps before it merges.
- **Held entries:** none open, none absorbed, none withdrawn.
- **Open findings:** no `findings` role is registered.
- **Board comments:** none (the comments file is absent).

## Previous cycle's carry-over

The 2026-10-22 review's buffer was ELECTRON-42-UPGRADE-1, PDF-IMPORT-DIAG-1, READER-VISUAL-DIAG-1, PAGE-POSITION-SAVE-2 and KF2-WAIVER-RETIRE-1. All five ran:

- three merged, held for the release gate;
- READER-VISUAL-DIAG-1 and KF2-WAIVER-RETIRE-1 closed (TR-080, TR-077).

Undecided candidates from its lessons-applied are taken up in D.4.

## Risks

1. **The gate chain is the critical path.** Gate (1) on `36ac7466` needs the quiet machine (Blurby.Brain), and the smoke re-check needs the owner. Nothing else moves the finish line.
2. **The merge train after the freeze.** 19 branches with interleaved merge orders. A rushed train risks a bad merge on shared files; one branch at a time, each re-tested, costs about a working day.
3. **Snapshot tooling:** decimal Seq values collapse on import (audit D5). That is fixed by renumbering here; it is worth reporting upstream to the plugin.
