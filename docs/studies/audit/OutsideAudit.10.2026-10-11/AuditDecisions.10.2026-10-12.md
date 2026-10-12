# OutsideAudit.10 — Final decisions (D5)

**Status:** closed on 2026-10-12. These decisions are definitive, and the audit loop is closed.

## The loop

| Step | Artifact | Outcome |
|---|---|---|
| D1 | `AuditPackage.10.2026-10-11.zip`, built from `8ee49de3` | A targeted package covering the Narrate removal (NARRATE-REMOVE-1) and the rebuild plan (NARRATE-REBUILD-1) |
| D2 | `AuditReport.10.2026-10-11.md` | "Partially flawed", calculated at 5.2/10, milestone not authorized. Its coordinator had project history, so it is not independent (D2 §A) |
| D3 | `AuditRemediationPlan.10.2026-10-11.md` | Every finding verified; none rejected. Owner rulings R1–R12 were approved on 2026-10-11. The proposed diff is on `eb/outside-audit-10-remediation` |
| D4 | `AuditReviewResponse.10.2026-10-11.md` (fresh, package-only) | Direction authorized. The removal spec and the overall milestone were not authorized as packaged. Seven corrections were required (D4-01…D4-07) |
| — | D3 §9: corrections round 1, then round 2 (pre-review hardening) | All seven corrections were applied. The replays were re-run on the final text: ROADMAP.md sha256 `06a14e71…` |
| D4b | `AuditReviewResponse.10.2026-10-12.md` (fresh, package-only), which reviewed package `dcb98968…` built from `77c36fb3` | All 21 requested dispositions are closed, and no new defect was found |
| D5 | this record | Decisions recorded, the branch merged to `main`, and the audit added to the history |

## Verdicts (D4b)

| Subject | Verdict |
|---|---|
| Removal-then-rebuild direction | **Authorized** |
| Removal dispatch specification (NARRATE-REMOVE-1, revision 4) | **Authorized**. The dispatch still has to pass its live prerequisites, and acceptance still needs its own tests, build, Page/Focus/Flow preservation, reviews and the owner smoke |
| Phase 0 as an experiment specification | **Authorized with conditions** for chartering. The conditions are the declared charter obligations and the later owner gate on merged words. It is not an executed engine proof |
| Overall design milestone | **Authorized with conditions**: the same charter and owner-gate conditions. There is no release authorization |

## Owner decisions

- **R1–R12** are recorded verbatim in D3 §5, as approved on 2026-10-11.
- **The scope of R1 was confirmed on 2026-10-12 (owner).** There is one waiver of a single queue-depth gate, which is written in two places: CLAUDE.md Rule 5a and ROADMAP standing rule 8. It applies to the NARRATE-REMOVE-1 dispatch only, and it is re-armed at that item's close-out, where `/roadmap-review` backfills the queue. It creates no second waiver and no new backfill prerequisite.

## Changes to the roadmap (merged with this record)

1. **NARRATE-REMOVE-1, specification revision 4** (scope unchanged: the same Delete list, kept files, waves and 16 Done-when rows):
   - **Settings IPC normalization (F4).** `save-settings` (`main/ipc/state.js`) is the third seam, with a positive control and an omission control.
   - **Executable gates (F5a, F5b).**
     - Shell rule: PowerShell 7, exact exit codes, and `git grep -P` with quote-free patterns.
     - Wiring counts are pinned with `-cwF` and adjacency.
     - Every gate has a positive control on the base.
   - **Shift+Space (F5c).** Page's select-only Shift+Space is kept, and the smoke is corrected.
   - **Resume recipe (F6, D4-01, D4-02, D4-03).**
     - The base comes from C1's trailer.
     - Publication is authenticated, and an interrupted merge is reused only after authentication.
     - Post-C4 corrections can be resumed.
     - The n = 0 base is measured clean.
     - The branch-worktree identity is checked.
     - The push location is fixed, and a post-push check runs on the recorded merge sha.
     - Smoke results go into the memo in a fixed one-line format.
   - **Integration tree (G6, D4-04).** A differing integration tree gets the full checks, the build, and a renewed smoke when code changed.
   - **Durability (F7).** "Submits", not "persists", throughout. A durability boundary is added, and D13 is qualified.
   - **Gate order and fences (GOV).**
     - Prerequisites are read before the item moves In Flight, and the R1 waiver is applied.
     - The removal owns lanes A–D.
     - The forbidden list is explicit.
     - The closure check is now v3.
   - **D16.** The kept kokoro-js patch is inert, and it is not evidence of exact timing.
2. **NARRATE-REBUILD-1 stub** (charter inputs for `/epic`):
   - **Phase 0, gates P0-1…P0-5.** It first exposes the predicted durations, by a local hash-checked edit, under R2.
   - **Unit law and identity.** Duration frames × 600 must equal the PCM length on every chunk. Words map from the exact `input_ids`, through one phonemization pass, with no proportional split.
   - **The verdict reports three things separately:** construction, acoustic error at independently associated anchors, and the interior boundaries left unresolved (D4-06). A repair is not a bake-off trigger.
   - **Core acceptance.** This takes over the former P0-6 and P0-7. It now covers:
     - one clock;
     - speed-change commitment (R7) and silence (R6);
     - no overlap, drop or repeat;
     - failure states.
   - **One end-to-end latency budget:** 2 s when the voice is warm, 8 s when it is not ready (D4-07, R3).
   - **Provenance and cache.** Provenance is recorded from the model's actual output. The old cache is never played (R10).
   - **Corrected charter inputs:**
     - no fixed lag;
     - no time-stretch;
     - no overlapping joins;
     - raw PCM first;
     - one clock.
   - **The Why line** separates the present estimated-table path from an inferred history (A10).
3. **Standing rule 38** gains a clause: it is superseded for the rebuild by "no fixed lag".
4. **UX-POLISH-1** gains a re-authoring note: Shift+Space routes, stale help text and replica tests.
5. Already on `main` through `/next-pointer` (`98333a98`): TEST-TIMEOUT-HEADROOM-1 Done-when 1 uses `git grep -F` instead of `rg`.

## Other governance changes

- **LESSONS_LEARNED:**
  - **LL-142:** a timing label is a declaration, not evidence.
  - **LL-143:** dry-run every gate.
  - **LL-144:** take a resume base from the first commit's trailer.
  - **LL-145:** this audit cycle.
  - LL-089 gets a correction line.
- **BUG_REPORT:**
  - BUG-161 gets a correction.
  - **BUG-185** (new): settings writes are fire-and-forget and share one `.tmp` path. Low priority, Platform & Maintenance, unscheduled.
- **TECHNICAL_REFERENCE:** a correction note above the NARR-TIMING section, and a parenthetical at line 349.
- **Storyboard** (`docs/planning/holding/2026-10-11-narrate-rebuild.md`):
  - the A8 row is corrected;
  - the R3 scope is added;
  - the merged-word owner gate is added;
  - pointers to ROADMAP, which governs.
- **CLAUDE.md:**
  - External Audit Outcomes row 10;
  - the owner-priority note on Phase 0;
  - the queue note;
  - open bugs: 3.

## Deferred, with placement

| Item | Placement |
|---|---|
| BUG-185, the settings-writer durability fix | Platform & Maintenance, unscheduled. It is needed before any rebuild state must reach disk (charter input) |
| Stale Page help text and replica tests | UX-POLISH-1, when it is re-authored |
| Merged-word display: split or one unit | Owner gate at the Phase 0 verdict, before Core implementation |
| Phase 0 charter obligations: passages, chunk bounds, anchor association, reference uncertainty, minimum coverage, mapping policy, voiced threshold, trial texts and counts | `/epic` charter for NARRATE-REBUILD-1, fixed before measurement |
| Per-device output delay | Out of scope (R5). Revisited only if the listening sign-off hears the cursor lead |
| A future audio cache | Allowed only with a stored sample count, a pre-skip trim and a check of decoded PCM against the table (R10) |

## Rejected

None. The audit report's own errors were corrected in D3 §2 (C1–C11) rather than rejected as findings, and both fresh reviews accepted those corrections.

## Work register

D5 writes nothing to the register. The 3rd-party-audit ceremony is not listed in `workRegister.allowedWriters`, so it cannot write there. Nothing needs to change in any case: NARRATE-REMOVE-1 reads Queued, at Seq 8, with Full Spec status, and its spec link points to ROADMAP.md on `main`, which now holds revision 4 (live board read, 2026-10-12). `/next-pointer` records "spec revision 4 (OutsideAudit.10)" in the item's notes when it dispatches it.

## Next

1. TEST-TIMEOUT-HEADROOM-1 (5) and EINK-HOVER-FIX-1 (6) are in flight. Their close-outs number new lessons from **LL-146**. After them comes the LIBRARY-SETTINGS-FIX-1 close-out (7).
2. NARRATE-REMOVE-1 (8) is dispatched by `/next-pointer` once 5–7 read Completed. The R1 waiver applies.
3. NARRATE-REBUILD-1 (9): `/epic` may write the charter while the removal runs. Phase 0 code starts after the removal merges.
