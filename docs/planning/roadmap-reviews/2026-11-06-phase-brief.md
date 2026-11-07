# Roadmap review 2026-11-06: Phase brief

*Provenance.* Register `notion:database/3f87c96cc31e800580cfe019c89a56ca`, connector and snapshot, taken this review (fingerprint matched the rows at each refresh). Repository read at `origin/main` `83ed8c4d` before this review's merge.

**Pause.** Nothing in this brief is dispatched. The owner stopped the RodneySr dispatch on 2026-11-05, and only the owner resumes it.

## Goal

Land the desktop release set on RodneySr, then pass gate (1) and the owner's gate (2).

## The buffer

The first five Queued items, by rubric read. The helper's `dispatch-buffer-ready` reads 0 of 5, but it judges the first five active rows, and those are all In Flight and merged, so it says nothing about this list.

| Seq | Item | Specification | Prerequisites | Repository | Register | Environment |
|---|---|---|---|---|---|---|
| 87.4 | A frame measurement counts only when the display was on (NARRATE-FRAME-GATE-1) | PASS | PASS | GAP: built at `ce438f30`; merge `origin/main` before it closes (no script differs) | PASS | BLOCKED |
| 87.6 | Refresh the dependency advisories before the final test pass (DEPS-REFRESH-1) | PASS | Pending for its merge only: block text order. Its spec starts it now and holds it | PASS | PASS | BLOCKED |
| 87.75 | Flow, Focus and Narrate never save or start from an unverified first visible word (UNCERTIFIED-ANCHOR-HOLD-1) | **GAP: owner question U1** | Pending: block text order | PASS | PASS | BLOCKED |
| 87.9 | Measure whether parsing chapters as strict XHTML removes unverified chapters (XHTML-PARSE-MEASURE-1) | PASS | Pending: block text order | PASS | PASS | BLOCKED |
| 88 | One word numbering in every runtime (WORD-INDEX-UNIFY-1) | **GAP: its card reads "NOT dispatch-ready"** | Pending: block text order | GAP: its base is a tip that no longer applies | PASS | BLOCKED |

## Implementation highlights

- A blank-window probe surrounds every frame-sensitive session, and a dark panel makes a session invalid rather than failed.
- The advisory refresh takes only fixes that need no force flag.
- The anchor hold saves the cfi alone in a section Blurby could not certify.

## Lessons applied

Each specification's own section stands. All five pass U9. See `2026-11-06-lessons-applied.md`.

## Into and out of the buffer

Into: block text order (BLOCK-TEXT-ORDER-1, In Flight on `eb/block-text-order-1` at `cb6382c0`) gates four of the five. Out: the release merge set, then gate (1) rerun.

## Exit criteria

NARRATE-FRAME-GATE-1 merged, F-036 resolved, block text order merged, and gate (1) rerun on the final tip with the display on.

Estimated duration: not computable. No deadline is declared, and row error of 0.89 makes the row estimates unusable.

## Top risks

1. RodneySr is the one host, and the cause of its HTTP 409 is undiagnosed.
2. Each gate run has added items, so the rerun will likely add more.

## Buffer gaps

- **UNCERTIFIED-ANCHOR-HOLD-1:** U1 is the owner's. The recommendation is the chapter's first word.
- **WORD-INDEX-UNIFY-1:** the register says Full Spec and its card says not dispatch-ready. Its card cuts the branch from an integrated tip that predates the block text order specification, so the card needs re-cutting once that merges.
- **14 later specifications** lack a task list (U10). This does not block them.
