# LIBRARY-COMPLETION-VISIBILITY-1 — ownership and integration admission

Date: 2026-10-26. Decision authority: the owner in Blurby. Roadmap requested, “Let's clear the integration and ownership holds for LIBRARY-COMPLETION-VISIBILITY-1 so we can start the first fix.” This authorizes this item's implementation window and the serialized handoff below. It does not authorize other held changes or a production merge/release.

## Verified state

- Published planning baseline: main/origin/main `b8f2bf95520b6c41e08ece78a553685b2f654361`; fetched and synchronized. The full specification is reachable there. Application source matches the earlier reviewed pin `d8e44864`.
- Live Notion SQL readback:192 items; visibility Queued / Full Spec / Seq116, APP-TABS-1 In Flight / Seq100 / built and held. Readback evidence: `C:/Projects/Blurby-artifacts/smoke-stage8-20261026-145107/visibility-admission-register-before.json`. No completion or sequence change is made by this decision.
- APP-TABS-1 remains at `8539ec4c55c5359cdafbd3dfa146de5881f062c9` in its existing worktree. The library source files have no uncommitted edits. Its performance-results JSON is unrelated and preserved.
- The readingNow/notStarted partition, engagement threshold3, upper-wordCount exclusion and sort are identical in main and APP-TABS-1. APP-TABS changes the input to the partition through home/tab filtering and adds card actions; the visibility fix needs none of those additions.
- The current local Codex thread listing shows no other active Blurby implementation chat. This is an observation of local app state, not proof about every process or another machine. The recorded exclusive assignment below governs future work; any contrary writer observation suspends it.

## Decision — implementation window cleared

**Integration entry:** cleared for the named visibility fix, from current published main including this decision. Do not integrate APP-TABS-1 or any other held stack into this fix. The owner chose this as the first smoke repair; this is a named-item scheduling exception, with existing Seq values retained.

**Exclusive source ownership:** the implementation branch `eb/library-completion-visibility-1` owns `src/components/LibraryView.tsx` and new `tests/libraryCompletionVisibility.test.tsx` for the bounded repair until its verification/handoff. No concurrent editor of LibraryView is authorized during that window. DocCard, LibraryContainer, types, IPC, settings, progress and all mode runtimes remain outside this fix's fence.

**APP-TABS-1 handoff:** retain its branch, package, evidence and In Flight state. Its next LibraryView integration waits for the visibility result. Before its eventual merge, integrate the accepted visibility commit into its branch, preserve its home/tab filters and the new exhaustive reading groups, adapt the visibility test setup only to its actual added props/menu controls, then rerun the real component regressions. It cannot reuse its earlier package verdict for a changed shipping candidate.

**Serialization:** visibility source/test repair first; APP-TABS-1 later, after its existing release/shared-core permissions. LIBRARY-WRITE-RACE-3 and AUTO-ARCHIVE-1 keep their existing prerequisites and ownership windows. No merge train is advanced by this decision.

## Implementation and re-entry guards

Use the complete [inline specification](../../../ROADMAP.md#library-completion-visibility-1). The exact two-file source/test fence and lv1–lv6 acceptance remain unchanged. A fresh isolated execution checkout is required at kickoff; this admission reserves the named branch but is not an implementation launch.

1. Verify the branch contains this decision and the current main plan; check LibraryView and test-path ownership before editing.
2. If the expected partition is unchanged, proceed with the prescribed real-component red controls and upper-bound removal. If it differs or another writer owns the file, stop and return to the planner with the exact diff; do not overwrite or infer a new cause.
3. Prove All/Archive, grid/list, missing/0/2/3/90/91/92 positions, reopen callbacks and filter transitions using real cards. No archive/progress writes.
4. At future APP integration, prove completed book/article records stay visible in their correct Library/Newsroom home and status tab, each once in both list/grid, and that the other home's cards remain excluded. Preserve the existing APP home-move/search behavior. Run its existing `tests/appTabs.test.tsx` and the visibility regression alongside its declared targeted suite.
5. Standard full suite/typecheck/build, source/test review and exact ARM64 package acceptance still apply. A package-verifier result and the existing designated confirmation/merge go are required before source merges to main.

## Remaining gates and disposition

Specification: unchanged bounded Full Spec. Prerequisite/integration entry: owner-cleared for this repair. Repository plan: publication reachable and dedicated branch reserved; clean execution checkout, fresh source check and exclusive-window recheck occur at kickoff. External register: reconcile this decision through plan/write/readback/confirm. Execution environment and package qualification: not claimed by admission; they remain execution acceptance work.

The Stage8 release hold remains active. This authorizes implementation and verification on the branch, not code merge, terminal close-out, installer distribution or release. No user profile, shipping file, test assertion or held implementation branch is modified by this decision.

The broader [smoke gap issue](../../governance/bug-reports/Issue.SMOKE8-SPEC-GAPS.2026-10-26.md) remains OPEN for other items. Only visibility's generic “wait for integration/ownership” entry is superseded by this concrete window.
