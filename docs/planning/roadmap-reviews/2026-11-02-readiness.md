# Roadmap review 2026-11-02 — Phase D readiness evidence

Rubric: Virtuoso `references/readiness-rubric.md` **v1.2**, U1–U10; no registry-declared extension checks. AGENTS package, placement, mode-isolation and sequential spec-compliance → quality duties remain applicable. Source review only: no application tests, builds, runtime or package checks were performed.

Provider: Notion `notion:database/3f87c96cc31e800580cfe019c89a56ca`. Phase D full SQL read confirmed **202 rows, zero changed rows** against Phase A; canonical snapshot refreshed to **2026-11-02T16:54:56Z**. Repository base `88e82ba59ccb93281c6c0b949e3ed4a826195897`, isolated review branch. Independent read-only reviewer `/root/phase_d_readiness_review` checked the five head items plus CPU/Page, source references and Phase C dependency map.

## Head-of-belt findings: five separate dimensions

| Item / Seq | Specification | Prerequisites | Repository | External register | Execution environment |
|---|---|---|---|---|---|
| Governance follow-through / GOV-SWEEP-FOLLOWTHROUGH-1 / 0 | Stub, not a new execution contract. Corrected stale no-edits prose to the reported approved commit. U2/U7 state mismatch repaired; no newly complete U3/U4/U6/U8/U9/U10 implementation contract claimed. | Existing result needs acceptance/close-out reconciliation, not another sixteen-action sweep. Commit-only boundary preserved. | Live evidence names `60d11b4285447f6b1d9496a7564c0be911848906`; published report and approved metadata confirm the result exists. No merge/push permission inferred. | Readable, Stub/In Flight unchanged; recorded 16 actions, 12 paths, 513 protected files and 64 metadata reconciliations retained. | Brief docs checks possible here; no new execution host certified. |
| Page reopen / PAGE-REOPEN-CFI-1 / 1 | Historical Full Spec in the linked October 23 archive; U9 mechanical FAIL (missing Lessons applied); U6/U10 incomplete for a fresh implementation dispatch. Do not rewrite the archive or reimplement merged code to turn a legacy label green. | Same-candidate release and owner acceptance held. | Merged code exists: `src/hooks/useLibrary.ts:158–163`, `src/hooks/useProgressTracker.ts:243–259`. Historical edit locations are not a current dispatch cut. | Readable, Full Spec/In Flight unchanged. | Exact candidate/package and owner check not run. |
| Theme text colour / BOOK-TEXT-COLOUR-1 / 2 | Historical Full Spec; new-dispatch U3 lacks exact test addressing; U6/U10 incomplete; U9 missing-section FAIL. | Release/owner acceptance held. | Merged inherit rule exists, including Page `foliateStyles.ts:50` and mode copies. No source changes made. | Readable, Full Spec/In Flight unchanged. | Exact-package contrast/owner acceptance not run. |
| Folder header / FOLDER-SWITCH-HEADER-1 / 3 | Historical Full Spec; new-dispatch U6/U10 incomplete; U9 missing-section FAIL. | Release/owner acceptance held; original source dependency integrated. | Merged optimistic update/rollback in `src/hooks/useLibrary.ts:90–99`; tests `tests/useLibrary.test.ts:223+`. | Readable, Full Spec/In Flight unchanged. | Real-folder/package acceptance not run. |
| Narrate start stack / NARRATE-START-STACK-1 / 4 | Historical specification left exact edit-site/test census to execution, so new-dispatch U2/U3/U8 incomplete; U9 missing-section FAIL; no U10 current dispatch contract. | Release acceptance held; original intermittent failure frequency not measured here. | `src/reader/modes/narrate/helpers/logStartError.ts` and `tests/narrate/narrate.startStack.test.ts` now exist; preserve logging during sentence-stack integration. | Readable, Full Spec/In Flight unchanged. | No exact-package check performed. |

The archive checks use `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md` and each item identifier. Their failure describes legacy specification structure for a new dispatch, not a regression or revoked historical acceptance. All five head items remain acceptance/held work; zero are newly dispatch-ready.

## Concrete queued candidates

### CPU profiling — NARRATE-CPU-PROFILE-1, Seq95

- **Specification:** NOT READY. U1 and the measurement decision rule are explicit. U2 thread constant is now `main/narrate/constants.js:18` rather than the old `:17`; verify the harness-tip sites at the actual cut. U3 tests d1–d4 and U4 commands are explicit, but no controls were executed here. U6 has retries/rollback; their counts are not newly admitted. U7 current F-009 scope and exact runtime wave boundaries need Brain1 disposition. U9 helper exits0 with warnings: LL-151 and LL-166 are promoted to standing rule55; warnings are not silently treated as full rubric compliance. U10 has six rows summing **265 minutes**, no Total line, and one 90-minute measurement row. Missing Total is a closable formatting gap; the actual launch blockers are wave sizing/admission, prerequisites and custody.
- **Prerequisite:** the full specification explicitly waits for NARRATE-HARNESS-COLDCLICK-1; the register lists only terminal NARRATE-REBUILD-1. Harness remains In Flight Seq94. U5's explicit wait is preserved; the automatic selector's eligibility is insufficient. No prerequisite mutation is made by this approved no-sequence/status-change plan.
- **Repository:** awaited harness ref exists at `c90d9e08acfc356ca76941df063a0941ab488a94`. CPU branch and moved-main cut/custody not accepted here. Required source/test/report fence is in the current full spec.
- **External register:** fresh readable Full Spec row; missing harness prerequisite remains a recorded drift requiring the normal mutation handshake after the authoritative dependency disposition. No raw write performed.
- **Environment:** the prescribed roughly 90-minute quiet slot cannot be a single ≤60-minute dispatch. Brain1 must resolve bounded authoring/measurement waves and exact runtime admissions without this review extending a budget. Change old owner-machine full-gate placement to RodneySr at the next admitted specification amendment. Spec-compliance must precede quality; the old “in parallel” phrase is superseded by AGENTS. Access/input receipt remains unverified.

The active card now prominently links this hold; the historical full plan remains visible for the required amendment. This review does not secretly split the task into newly admitted jobs.

### Early Page keyboard entry — PAGE-ENTRY-KEYS-1, Seq119

- **Specification:** substantial U1–U4/U6/U7 detail exists; current sites match: Page `onSectionLoad:638`, wrap await `:664`, key registration `:784`; `WRAP_BATCH_SIZE=50` at `helpers/foliateWordWrapping.ts:11`. Existing test `(u)` at `tests/readerModes/pagePositionSave.test.tsx:449` uses 60 block groups. U9 mechanical PASS. U10 table/Total present; its timing-helper execution is withheld as explained below. No new behavior or source change proposed.
- **Prerequisite:** explicit integration/serialization wait for held Page save/key edits. An empty provider prerequisite field does not waive that written wait.
- **Repository:** named branch/base and exact fence are specified; the final source cut must follow the admitted integrated Page stack. Not certified ready now.
- **External register:** Full Spec/Queued; older Stub wording in Notes is historical and overridden by the actual field/newer Deliverable. No status/sequence change necessary.
- **Environment:** sustained checks/implementation on RodneySr, transferred baseline and package inputs with receipt; not verified here. Owner's brief exact-package input check remains required later.

## Existing specification lesson checks

Actual helper results are saved in `2026-11-02-lesson-checks.json`. U9 PASS: CPU profiling, Page entry keys, NARRATE-ARROW-PAUSE-1, PAGE-PAGES-READ-1, LIBRARY-WRITE-RACE-3, NARRATE-PAUSED-CLICK-1, FOCUS-WORD-ONLY-1 and POSITION-PROMPT-COPY-1. Uncited-live lists are informational prompts for semantic review; they are not automatic proof that every lesson applies. Promoted-ID warnings remain explicitly reported where present.

No newly authored application specification passes the full rubric in this review. The first structural/admission gap stops buffer replenishment at the held head. Existing full specifications are not downgraded to Stub merely because they await integration, and no built work is re-dispatched.

## U10 safety exception and buffer issue

The prescribed `timing --rows-from-spec` command is **not run**: F-011/LL-172 proves that it can mutate unrelated time logs and the change ledger. Manual table inspection is not reported as a mechanical U10 PASS. Missing/old tables are closable gaps, but a known helper side effect cannot be authorized by a reporting requirement. Qualification/repair of that helper remains a separate bounded technical follow-up.

See the routed [buffer issue](../../governance/bug-reports/Issue.ROADMAP-DISPATCH-BUFFER.2026-11-02.md) and [release-order issue](../../governance/bug-reports/Issue.ROADMAP-RELEASE-ORDER.2026-11-02.md). Buffer: **0 newly verified dispatch-ready / target5**. This is an explicit shortfall, not a completed readiness claim or an implementation launch.
