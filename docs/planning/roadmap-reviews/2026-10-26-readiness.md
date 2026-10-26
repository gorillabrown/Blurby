# Roadmap review readiness — 2026-10-26

Phase C was approved by the owner. This records the Phase D specification review under the shared **Dispatch Readiness Rubric v1.2 (U1–U10)**. Five full specifications are present; none is authorized for execution by this report. The Stage 8 release hold, integration ownership, prerequisite waits and exact-package/manual acceptance gates remain.

## Evidence and scope

- Specification store: [ROADMAP.md](../../../ROADMAP.md#verification-contract-for-the-five-smoke-fix-specifications), source baseline `d8e44864708d40e2a472f3e6436d936e9ee96bfa` and the explicitly named held stacks. The approved priorities and design choices are in the [Phase C plan](2026-10-26-plan.md).
- Live register: `notion:database/3f87c96cc31e800580cfe019c89a56ca`, data source `collection://3f87c96c-c31e-80bd-b6f0-000bdc2d7c2c`. Final connector readback contains **192 items**; canonical cache timestamp is **2026-10-26T20:03:03Z**. Provider evidence is `C:/Projects/Blurby-artifacts/smoke-stage8-20261026-145107/review-D-register-integer-final.json`; the cache is not a second authority.
- Mutation reconciliation: `review-D-confirmed-mutations.json` records 27 resolved plans, including the explicitly superseded partial operation. The review's own unresolved mutation count is zero. Final named fields were reconciled with connector readback before confirmation.
- Mechanical checks: `review-spec-mechanical-final.json` in the same evidence directory records exit 0 for both U9 and U10 on each of the five specifications. No project-specific rubric extensions are declared in the current registry.
- Source review covers the real library partition/cards, Narrate runtime and engine request path, Page section key forwarding and wrapping, Focus mask/held bottom-bar controls, and the real backtrack prompt. Diagnostic evidence is not a substitute for packaged or heard-audio acceptance.

## Five separate findings

### 1. Specification readiness

**PASS for the five bounded specifications below.** Their scope, concrete edit sites, tests/assertions, verification commands, failure handling, evidence, lessons and task rows are supplied. The source pin identifies the reviewed code; each specification requires a fresh read at its final integrated cut. Full Spec means specified, not implemented, qualified or completed.

| Planning rank | Item | Live Seq | Scope accepted for specification |
|---|---|---|---|
| 1 | [LIBRARY-COMPLETION-VISIBILITY-1](../../../ROADMAP.md#library-completion-visibility-1) | 116 | Make the library's existing groups exhaustive; preserve filters, progress and archive state. |
| 2 | [NARRATE-PAUSED-CLICK-1](../../../ROADMAP.md#narrate-paused-click-1) | 117 | Honor the explicit word selected while paused; preserve ordinary sentence-resume policy. F7/F8 are excluded. |
| 3 | [PAGE-ENTRY-KEYS-1](../../../ROADMAP.md#page-entry-keys-1) | 119 | Install Page's native section forwarder before asynchronous word wrapping, with deduplication and cleanup. |
| 4 | [FOCUS-WORD-ONLY-1](../../../ROADMAP.md#focus-word-only-1) | 123 | Remove Focus's mask and band-only controls; retain its word cursor and private geometry. |
| 5 | [POSITION-PROMPT-COPY-1](../../../ROADMAP.md#position-prompt-copy-1) | 134 | Put Keep Previous Position before Move Position; retain handlers, focus and page calculations. |

#### Universal-check review

| Check | Finding for the five specifications | Evidence / limit |
|---|---|---|
| U1 Scope | PASS | Each What states an observable bounded outcome. Mode, data, schema and related-diagnosis exclusions are explicit. |
| U2 Edit sites | PASS | Existing file/symbol sites match the reviewed source or the named held stack. New test paths are identified as new. Changed integrated sites require re-anchoring before implementation. |
| U3 Tests | PASS | Named test files, case IDs and assertions are concrete. Library tests render real cards; Narrate tests assert engine requests and clock advancement; Page tests hold the first-wrap yield; Focus tests use actual styles/controls with packaged computed-style proof; prompt tests exercise real callbacks/focus. |
| U4 Acceptance | PASS | Targeted commands, suite/typecheck/build, exact-package checks and fixture-state assertions are written. Actual execution and owner observations remain future evidence. |
| U5 Prerequisites | WAIT ENCODED | Identifiers resolve in the live register and waits are stated; nonterminal dependencies have not been treated as complete. See prerequisite readiness below. |
| U6 Failure handling | PASS | Known mismatches stop for diagnosis/fence correction. At most two bounded repair passes; rollback reverts only the item's own implementation commits and never resets user data. |
| U7 Source evidence | PASS | Smoke IDs, source pin, held tips and diagnostic controls are cited. Approved choices govern these bounded fixes; unresolved symptoms remain separate stubs rather than deferred decisions inside the implementation fence. |
| U8 Repository plan | PLAN PASS; ACTUAL HOLD | Branch, baseline, exact source/test/docs staging and commit/push expectations are named. The actual integration/custody and reachable-plan conditions remain separate repository holds. |
| U9 Lessons applied | PASS | The final mechanical evidence records exit 0 for every item. Applicable lessons and standing rules are named; considered non-applicable live lessons are documented by the review. |
| U10 Task list | PASS | The final mechanical evidence records exit 0 for every item, with outcome rows and separate chain/sum totals. Estimates are not execution observations. |

The Narrate detector was shown both outcomes on production runtime code with fake infrastructure: pause 8, select 20, toggle Play requests 8 and next commits 9; using the existing start path requests 20 and next commits 21. The immediate resumed snapshot can misleadingly remain 20, so it is not the decisive assertion. See [diagnostic summary](2026-10-26-narrate-selection-evidence.json). This is neither a code fix nor heard-audio proof.

### 2. Prerequisite readiness

**HELD.** Every item waits for an approved integration window and the release/merge authority named in its specification. The following additional waits remain:

| Item | Unwaived wait |
|---|---|
| LIBRARY-COMPLETION-VISIBILITY-1 | Exclusive LibraryView ownership. APP-TABS-1 is In Flight and owns overlapping library surfaces; reconcile its current tab/home filtering at the cut. AUTO-ARCHIVE-1 is related, not a hard prerequisite. |
| NARRATE-PAUSED-CLICK-1 | NARRATE-SENTENCE-RESUME-1 is In Flight, Seq 40; integrate its approved stack first and retain the explicit-click exception and main's error logging. No prerequisite on stopped CHAPTER-STEP-CFI-1. |
| PAGE-ENTRY-KEYS-1 | Serialize with the held Page input/save/jump stack. Reconcile arrow guards, held turns, restamping, landing saves and listener lifetimes on the final base. |
| FOCUS-WORD-ONLY-1 | BAND-ALIGN-2 is In Flight, Seq 83. Its held Focus/Flow controls and measured layout must be integrated/re-read before the follow-up removes only Focus's visual band. |
| POSITION-PROMPT-COPY-1 | KEEP-FURTHEST-FIX-1 is In Flight, Seq 6, although merged. Respect its existing close-out gate and the approved integration window; preserve its anchor contract. |

No terminal status, integration permission or release gate is inferred from the presence of a Full Spec.

### 3. Repository readiness

**HELD / execution base not yet admitted.** The reviewed checkout is main at `d8e44864708d40e2a472f3e6436d936e9ee96bfa`. Planning edits and unrelated local changes coexist. This report does not stage, commit, stash, reset, clean, merge, push or create an implementation branch.

Before kickoff, the repository operator must preserve unrelated work, publish the authorized planning changes through exact-path policy, prove that the final plan is reachable from the execution base, reconcile the explicitly awaited stack, and assign exclusive surface ownership. All five items run serially in their approved integration windows. No sibling-runtime imports or shared mutable mode store are permitted.

The source/test fences and rollback plans are specified; their existence does not prove that an implementation checkout or merge window is available.

### 4. External-register readiness

**VERIFIED for the planning update.** The configured live Notion provider can list/read status, sequence, prerequisites and effort, create items, store spec references and perform the planned status/sequence updates. It uses durable `mutation-plan → connector → readback → mutation-confirm` recovery.

The final 192-item live readback and confirmed operations reconcile these five rows as Queued / Full Spec at Seq **116, 117, 119, 123 and 134**, with the matching inline ROADMAP anchors. The residual parent NARRATE-SELECTION-START-1 remains Queued / Stub at Seq 124. Existing release/held items retain their prior sequence slots. AUTO-ARCHIVE-1 remains a re-specification stub; its historical automatic-exit design is not restored by this review.

The canonical snapshot at `2026-10-26T20:03:03Z` is a derived cache. Register writability and successful planning reconciliation do not authorize dispatch or change a release hold.

### 5. Execution-environment readiness

**HELD / exact-package and manual acceptance access must be resolved at kickoff.** This review did not run implementation tests, build an implementation package, exercise native desktop controls or hear audio. Source-backed probes and U9/U10 checks do not satisfy those gates.

The specifications require local suite/typecheck/build, a native ARM64 `--dir` package from the final integrated commit, before-input proof of actual userData/data path/PID/executable, unchanged normal-profile library/settings hashes, and standing-rule-53 package verification. Perceptual tests require an available owner or an approved execution environment with the actual desktop/audio capability. Narrate's first heard word cannot be certified from a runtime snapshot or fake audio clock.

A missing capability, unavailable owner, unsupported computed-style instrument, package error or wrong profile is an explicit execution hold. It is not a PASS or a reason to weaken an assertion.

## Buffer depth and unresolved higher-priority work

The registry leaves dispatchBuffer unspecified, so this review uses the skill default **5**. Five bounded Full Specs have been authored: **specification-depth target 5/5**. That is not a five-item dispatch-ready buffer: all five retain the holds above. Lower-priority visual/copy specifications do not leapfrog higher-priority investigative work merely because they are easier to specify.

| Gap | Required planning evidence before a prescribed implementation |
|---|---|
| FOCUS-PAUSED-HANDOFF-1, Seq 118 | Real-view re-stamp/arrival trace distinguishing stale painted highlight from stale canonical position. Keep it separate from Focus mask removal and chapter-jump work. |
| FOLDER-SWITCH-CONTENT-1, Seq 120 | Approved explicit loading/old-card presentation plus timestamped run/phase diagnosis of cancellation, recursive scanning, extraction and save/broadcast batching. A captured 30-second cancellation warning does not attribute the entire approximately 93-second observation gap. |
| PROFILE-QUEUE-ISOLATION-1, Seq 121 | Identify the writer of the changed normal sync queue. Inspected queue initialization uses configured getDataPath; no hardcoded normal-profile queue path was found. Preserve the queue; no attribution or data-loss claim without evidence. |
| NARRATE-SELECTION-START-1, Seq 124 | F7/F8 paused-band/viewport trace. Owner-approved regular-display policy preserves an already-visible word's viewport; determine the actual competing scroll writer before prescribing the correction. F9 is the separate child specification. |
| AUTO-ARCHIVE-1 | Amend confirmation-first behavior and tests before returning it to Full Spec. Visibility repair does not implement confirmation, completion detection or history/goal effects. |
| SMOKE8-COVERAGE-RECHECK-1, Seq 139 | Exact missing scenarios on one approved integrated candidate: checks 31–33/35 and earlier input/handoff partials. No partial becomes PASS through planning. |

These gaps and their routing are recorded in [Issue.SMOKE8-SPEC-GAPS.2026-10-26](../../governance/bug-reports/Issue.SMOKE8-SPEC-GAPS.2026-10-26.md). The original smoke remains RED. This is a completed specification/readiness assessment, not an implementation, dispatch, package qualification, epic completion or release decision.

## Follow-up owner decision — visibility implementation window

The owner subsequently requested clearing integration and ownership for LIBRARY-COMPLETION-VISIBILITY-1. The [admission decision](2026-10-26-library-visibility-admission.md) grants that item the first exclusive LibraryView/new-test implementation/build-and-hold window. APP-TABS-1 remains built/held and integrates the accepted visibility result later. The general visibility entry-hold statements above are superseded only to that extent. No other item, package qualification, code-merge go or Stage8 release gate is cleared. No implementation is launched by this amendment.
