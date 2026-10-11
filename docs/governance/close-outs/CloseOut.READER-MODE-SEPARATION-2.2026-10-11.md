# Separate Page, Focus, Flow and Narrate runtimes Close-Out  *(READER-MODE-SEPARATION-2)*

**Goal:** Give each reading mode its own runtime behind a thin router, make the old shared behaviour unreachable, keep every mode's baseline, and add the approved speed dialog.
**Result:** Merged to `main` (merge `d96d2f3f` onto `41ef49de`, then packet commit `ce740582`). D1–D9 pass. D1, D7 and D8 pass as amended by owner ruling #32: the Narrate listening checks were dropped, not passed. D6 passes under owner ruling #33 (KF-3: three full-suite timeouts ruled environmental).
**Learned:** LL-139 — cut mode-separation specs from an import-graph census, not a file inventory. LL-140 — hear the baseline before automating parity for it. LL-141 — automated control of the Electron app can't reach some live behaviour, so keep an owner-observed checklist route and a throttle check.
**Recommend:** Remove Narrate in the next sprint (owner ruling #31). Then run the roadmap review that retires the old narration items, sets a new finish line and updates CLAUDE.md's priorities.
**Bottom line:** Page, Focus and Flow now run independently and match their baselines. Narrate's audio was never heard on the final build, and Narrate is being removed.
**Yes, but:** the full suite still fails three tests by timeout on this machine whenever every test runs together (KF-3). That is a follow-up, not a pass.

- **Item:** READER-MODE-SEPARATION-2 (monday item 13119306772), run as epic packet `docs/planning/epics/2026-10-09-reader-mode-separation-2/`
- **Identities:**
  - B0 `1e5485c6`;
  - I `92dda255`;
  - S `d0c58af4`;
  - F `c9d73ddd` (archive `C:\Projects\Blurby-artifacts\rms2-candidate-c9d73dddc57a`);
  - V `6891fbfd`;
  - merge `d96d2f3f`;
  - M `ce740582`.
- **Specification:** ROADMAP.md § READER-MODE-SEPARATION-2 at `ce740582`, archived by this close-out to `docs/planning/.Archive/ROADMAP_legacy.md`, together with staging fold-ins 1–11.
- **runtime:** not measured (no time log; the registry refused `virtuoso` a time log in `closeOuts`).

## Findings

All checked by the planner on 2026-10-11.

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | `done.md` on the default branch | PASS | `sprint_guards artifacts-exist --ref refs/remotes/origin/main …/done.md` → 1/1 |
| 2 | Packet commit scope | PASS | `git diff --name-only ce740582^1 ce740582 -- . ':(exclude)<packet>'` prints nothing. M changes only `charter.md`, `done.md`, `journal.md` and `state.md`. |
| 3 | Merge | PASS | `d96d2f3f`, `--no-ff`, parents `41ef49de` + `6891fbfd`, 335 files |
| 4 | Typecheck on the merged commit | PASS | `npm run typecheck` exit 0 (planner run, worktree `rms2-integration-1` @ `ce740582`) |
| 5 | Full suite on the merged commit | PASS under KF-3 (#33) | Planner run: 3,394 passed, 133 skipped, 3 failed. The three failures are exactly the KF-3 node IDs: `updateInstallGating` ×2 and the G1 graph test. All three are `Test timed out in 10000ms`. Run alone: 2 files, 10/10 passed. The executor's F2 run recorded 3,397 passed / 0 failed (journal S1m-F4); its raw log `finalization-log.md` no longer exists. |
| 6 | D1–D9 | PASS (D1, D7, D8 amended by #32; D6 by #33) | `verified.md`; `state.md` → Evidence → F1 |
| 7 | Mid-dispatch decisions settled | PASS | 6 of 7 issue files carry Decision blocks. `Issue.READER-MODE-SEPARATION-2.2026-09-23.md` is a next-pointer admission hold, not a decision; the later decisions and the passed G0 admission resolved it. |
| 8 | Register before crossing | PASS | Live read: In Flight, Seq 1, unchanged since 2026-10-10T20:05:50Z. No recovery records outstanding. |

**Population naming:**
- **Passed:** the automated G1–G6 cases on B0 and F, the speed checks (89 Focus/Flow values, 25 Narrate values, no Page action, keyboard), the owner's V1, S1 and S2, and S4 by automation (owner-accepted).
- **Dropped by owner ruling #32, never heard or passed:**
  - H7, H8, V2 and V3 on B0;
  - H1–H8, V2, V3, S3 and C1–C3 on F;
  - the 26 Narrate audio cases' heard-audio halves;
  - F17.
- **Excluded by ruling #33:** the three KF-3 timeouts in full-suite runs.
- **Open:** the intermittent Flow band lag seen once by the owner (did not reproduce), and the follow-ups below.

## Mid-Dispatch Decisions

The full text is in the staging memo, archived verbatim under this item in `docs/planning/.Archive/ROADMAP_legacy.md`, and in the packet's `state.md`.

| # | Date | Decision | Disposition |
|---|---|---|---|
| 1 | 2026-09-23 | Type 1b: Wave A hit its 40-action ceiling | Owner approved the A1/A2/A3 re-slice (20/20/35 actions). G0 requirements unchanged. |
| 2 | 2026-09-23 | Type 3: speed dialog added | Focus/Flow 0.40–4.80x at 250 WPM per 1.00x (12.5 WPM steps); Narrate 0.80–2.00x; Page has none. Built after structural parity and verified separately. |
| 3 | 2026-10-09 | Type 1b: Q-A..Q-G scope rules before Wave B | Rules for dead views, the standalone reader window, runtime code in narration types, shared constants, per-mode ownership, cross-owner comparison and baseline anomalies. No gate loosened. |
| 4 | 2026-10-09 | Type 1b: KF-1 decision table | The suite gate stays exit-0. A recurrence of the Qwen timer-leak flake gets one scoped test-hygiene fix, never retry-until-green. |
| 5 | 2026-10-09 | Type 3: owner gate re-sequenced (Decision #13) | Code waves started on automated baseline evidence; one combined owner session before final verification. |
| 6 | 2026-10-09 | Type 1b: nine design contradictions (OC-1..OC-9) | All nine ruled: per-mode speed keys, a widened narration speed domain, Page keys kept, dead code not copied, and others. |
| 7 | 2026-10-10 | Type 2: OS-1 stopped; Narrate to be rebuilt (Decisions #31, #32) | The epic lands first. Narrate listening checks are recorded as dropped. R6 accepts `droppedBy: owner-ruling-2026-10-10`. The owner ran V1, S1 and S2 on F. |
| 8 | 2026-10-11 | Type 1b: KF-3 (Decision #33) | Three named full-suite timeouts ruled environmental; each must pass alone; any other failure is real. |

Decisions #17–#24 and #28–#30 (Wave D/E and G6 rulings, the scheduler-underrun fix #28a, the Flow chunk-cache rule #28b, and the baseline substitution #30) are recorded in `state.md` and in staging fold-in 8.

## Lessons

New (appended to `docs/governance/LESSONS_LEARNED.md`):
- **LL-139** — Mode-separation specs must be cut from an import-graph census, not a file inventory (staging fold-in 4).
- **LL-140** — Hear the baseline before automating parity for it (staging fold-in 10).
- **LL-141** — Automated control of the Electron app cannot reach some live behaviour; keep an owner-observed route and a throttle check (the charter's candidate, which held).

Status record: **LL-136** recurred a third time. This time the registry refused `virtuoso` the time log; it was not an exact-path fence. It is a promotion candidate for the next roadmap review.

Lessons the charter applied:
- **LL-108** (exact-zero anchors): held. Word-0 handoffs are DoD cases and passed (G2–G4).
- **LL-109** (stop() race): held. G3 stale-owner rejection exits 0.
- **LL-112** (isolate before sharing): held. Mirrored, independent runtimes; no shared behaviour base.
- **LL-120, LL-121, LL-125** (single ownership; Narrate stays audio-owned): held. G1 boundaries 16/16.
- **LL-124, LL-126, LL-127 + SRL-070** (heard-audio ground truth): held. No audio claim was made without the owner. Narrate audio is recorded as dropped, never as passed.
- **LL-130** (mutation-plan only to execute): held. No orphaned plans; no recovery records outstanding.
- **SRL-053, SRL-055, SRL-058** (live QA per mode): held as amended by #32.
- **SRL-089 / rule 37** (serialize dependent work): held. Waves were serial; the parallel items were file-disjoint.
- **LL-129:** considered; not applicable.

## Retrospective

- **Effort calibration:** sized XL. The executor work took about one session plus the owner gates (as LL-134 predicted). The binding constraint was owner time. Not measured.
- **Dispatch precision:** the spec was cut from a file inventory and needed seven scope rulings before the first edit (LL-139).
- **Scope:** the biggest cost was proving parity for Narrate, a behaviour the owner then ruled out (LL-140).
- **Discovery yield:** high. KD-CURSOR-LEAD and KD-RATE-1.4-OVERLAP were confirmed; the scheduler underrun was found and fixed (#28a); the machine-wide test slowdown surfaced (KF-3).

## Follow-ups (from `done.md`; routed to the roadmap review)

1. Narrate removal, as the first sprint after this merge (#31). The rebuild is scoped separately (storyboard on hold; owner's first answer: "core done right").
2. Retire or replace NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1 and KOKORO-EXPORT-1. UX-POLISH-1 needs a fallback for a saved `narrate` mode. CLEANUP-MODE-BARREL-1 is unblocked.
3. KF-3: an explicit timeout for the G1 graph test (about 6.5 s of a 10 s budget alone); the `updateInstallGating` timeout; the machine-wide suite slowdown.
4. KF-2: a Windows-safe rename retry in `main/sync-queue.js` (lane D).
5. The intermittent Flow band lag (owner, 2026-10-10): triage as a bug report.
6. Registry: allow `virtuoso` to write the time log in `closeOuts`.

## Files Created

- The merged code, tests and evidence: 335 files in `d96d2f3f`, registered in `paths.json` (319/319 changed paths).
  - The evidence includes about 5.4 MB of `.wav` loopback recordings of the bundled public-domain sample book. These are test evidence, not user content.
- The packet `journal.md` S1m-F4 history entry: committed by this close-out.
- `tests/perf-baseline-results.json`: dirtied by test runs in the `reader-mode-separation-2` and `rms2-integration-1` worktrees. It is noise and was never staged.
- `Virtuoso/.recovery/` receipts in the run worktree: left untracked, by owner choice. None is outstanding.
- Worktrees `reader-mode-separation-2` and `rms2-integration-1`, and branch `eb/rms2-integration-1`: kept; removal is maintenance.
- The staging memo `Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`: removed once every fold-in landed. Its content is archived verbatim.
