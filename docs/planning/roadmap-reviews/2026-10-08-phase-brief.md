# Phase Brief — Reader Runtime Solidification, with parallel main-process cleanup — 2026-10-08

## Provenance

| Figure | Source | As of |
|---|---|---|
| Register state | monday:board/18432450217 via provider `external`; snapshot refreshed by `snapshot --import` | 2026-10-09T03:40:00Z (connector readback of the 5 written items; all other rows proven unchanged by `updated_at` ≤ 2026-09-24T04:51:53Z) |
| Deadline | `policy.roadmap.deadlines.mode-separation` | set 2026-10-08 |
| Code facts | three read-only investigations of main @ `cd384b78` | 2026-10-08 |

## Goal

Get the reading-mode separation moving again: recover admission, falling back to manual G0. Meanwhile, use the idle implementation capacity on three self-contained main-process cleanups that cannot collide with it.

## The buffer, in sequence

| # | Item | State | Path |
|---|---|---|---|
| 1 | **Separate the four reading modes' runtimes** (READER-MODE-SEPARATION-2) | Queued, Full Spec | **epic**, excluded from the dispatch buffer and routed to `/epic` |
| 6 | **Share cloud retry with provider token refresh** (CLOUD-RETRY-SHARED-1) | Queued, Full Spec, dispatch-ready | dispatch, S |
| 7 | **Share the MOSS/Pocket sidecar adapter** (TTS-SIDECAR-SHARED-1) | Queued, Full Spec, dispatch-ready | dispatch, M (2 serial tasks) |
| 9 | **Remove the unused legacy parser module** (CLEANUP-LEGACY-PARSERS-1) | Queued, Full Spec, dispatch-ready | dispatch, XS |

**Buffer: 3 dispatch-ready of the policy target of 5** (default; `dispatchBuffer` undeclared). Queue depth is 4, which clears CLAUDE.md Rule 5a without the bounded exception.

## Implementation highlights

- **Mode separation:** A1-R recovery runs in at most 8 calls, using a fresh isolated profile, a hidden launch with stdout/stderr redirected, and one 10 s capture. On any harness failure, stop automating: the planner writes `g0-manual-checklist.md` and the owner records `live-baseline-manual.json`. The speed-slider amendment runs only after G0–G6 structural parity.
- **Cloud retry:** new stateless `main/cloud-retry.js`. The providers keep thin wrappers that pass their own constants and refresh function, because test stubs depend on it. Seven new helper tests; existing tests stay unmodified.
- **Sidecar:** Task 1 adds 11 characterization tests against the *current* adapters and is committed first. Task 2 extracts `main/python-sidecar-adapter.js`, parameterized by label, env var and an argument builder. Fakes must have no `pid`, or a real `taskkill` runs on Windows.
- **Legacy parsers:** `git rm` after a re-census, plus two doc-line corrections.

## Rubric result per item (five findings)

| Item | Specification | Prerequisite | Repository | External register | Execution environment |
|---|---|---|---|---|---|
| CLOUD-RETRY-SHARED-1 | PASS (U1–U4, U6, U7). U9 substantive PASS; mechanical **waived** | PASS (none) | PASS: branch and base named, exact-path staging. policy.git = push (Rule 5b, registered 2026-10-09) | PASS: Queued; snapshot fresh 2026-10-09 | PASS: Node/Vitest; no network or hardware needs |
| TTS-SIDECAR-SHARED-1 | PASS. U9 as above | PASS (none) | PASS | PASS | PASS on Windows only with no-`pid` fakes (encoded) |
| CLEANUP-LEGACY-PARSERS-1 | PASS. U9 as above | PASS (none) | PASS. Rebase if the governance landing changes `CLAUDE.md` first | PASS | PASS (`npm run build` required) |
| READER-MODE-SEPARATION-2 (epic) | Charter gate, not the dispatch rubric. Spec U1–U8 passed 2026-09-23; amendments folded in | PASS (ISO-1A–1E Completed) | **Attention:** pinned base and evidence live on `eb/reader-mode-separation-2`; governance not yet landed on `main` | PASS | **Gap:** automated live capture unproven. The manual fallback is defined |

## Prerequisites into and out of the buffer

- Out: TTS-SIDECAR-SHARED-1 → TTS-ENGINE-SHARED-1. Mode separation → HEARD-CURSOR, COLLAPSE, SUBSCRIBER, UX-POLISH, MODE-BARREL.
- In: none. All four buffer items have terminal or no prerequisites.

## Exit criteria and duration

- The buffer exits when the three cleanups close out (each item's *Done when*, then `/pointer-closeout`). They can run in parallel, so roughly one to two working sessions in total. This is an effort judgement, not a calibrated figure: effort-calibration is not computable.
- Mode separation is dated **2026-11-30** in policy. Its pace verdict is not computable until the terminal ledger holds completions.

## Top risks

1. **The admission route fails again.** Mitigation: the manual fallback is pre-approved, so a failure costs one checklist rather than another planning cycle.
2. **Governance loss or divergence.** The 2026-09-23 governance work and this review's output are uncommitted on `main`, and a different copy lives on the execution branch. Mitigation: land it on `eb/roadmap-review-2026-10-08` at the end of this review (owner-approved).

## Buffer gaps

| Item | Blocking check | Why |
|---|---|---|
| TTS-ENGINE-SHARED-1 | U2, U3, U5 | Engine files only partly investigated; its edit sites depend on the sidecar result; prerequisite not yet terminal |
| NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1, UX-POLISH-1 | U2, U5 | Edit sites exist only after mode separation (owner priority) |
| CLEANUP-MODE-BARREL-1 | U2, U5 | `src/modes/index.ts` is in separation's edit-site table |

## Lessons applied

See [2026-10-08-lessons-applied.md](2026-10-08-lessons-applied.md): LL-095 (cloud), LL-112, LL-088 and standing rule 37 (sidecar), and standing rule 36 (legacy re-census). The U9 mechanical check is waived (systemic lessons-format mismatch).
