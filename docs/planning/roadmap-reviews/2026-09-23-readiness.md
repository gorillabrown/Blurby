# Blurby — Phase D readiness review
Date: 2026-09-23.
Rubric: Virtuoso readiness-rubric v1.0 (U1–U8); policy declares no extensions.
Authoritative specification: [ROADMAP.md — mode separation](../../../ROADMAP.md#reader-mode-separation-2).
Owner approval: Phase C five-wave plan approved in this task on 2026-09-23.

## Source and inspection provenance
Code: main @ cd384b78cd5325e96429fe867c8b080ce1b39bb8; package version 1.75.1. The [source evidence](2026-09-23-source-evidence.json) records hashes for 57 source files and 27 existing test files; all exist and src had no local diff. No new source/test files named by the specification exist yet: they are clearly labelled implementation targets.

Work register: Virtuoso external provider, connector+snapshot, monday:board/18432450217. Pre-write inspection is [phase-d-before.json](2026-09-23-phase-d-before.json), observed 2026-09-23T19:19:24Z. Final status/provenance is in [the phase brief](2026-09-23-phase-brief.md) and final connector receipt, which supersede this pre-write snapshot.

## Rubric walk — READER-MODE-SEPARATION-2
| Check | Result | Evidence / scope |
|---|---|---|
| U1 Scope | PASS | One observable outcome; P0 isolation, measurable targets, current behavior preservation and explicit exclusions |
| U2 Edit sites | PASS | Existing source inventory verified; new four-mode layout, contract/port targets and source→owner table named; extra existing edits require amendment |
| U3 Tests | PASS | New test paths/names/assertions; six explicit old→new harness expectations; retained audio assertions quoted; tests are planned, not claimed passed |
| U4 Acceptance criteria | PASS | G0–G6 commands, graph/effect/count checks, trace equality and explicit live observations; separate final evidence validator |
| U5 Prerequisites | PASS | ISO-1A/B/C/D/E resolve to Completed; wave waits explicit; stale baseline/source gate prevents blind execution |
| U6 Failure handling | PASS | Failure branches, one extraction retry per unchanged session, two correction attempts per gate, per-wave revert/patch rollback |
| U7 Source evidence | PASS | Source hashes, current constant values, close-out/lesson anchors, known-defect evidence and recorded owner decisions; no unresolved design placeholders |
| U8 Repository plan | PASS (plan) | Named eb/ branch from verified main, isolated clean checkout, exact expanded manifest, index check, scoped commits and no automatic network/merge/cleanup |
| Project extensions | None | policy.rubric.extensions=[] |

## Enrichment record
Two enrichment passes were used, with no unresolved structural decision:
1. Added mode CSS/DOM ownership and transitive graph checking, complete mutable-resource census, exact assertion migrations, and deep copy semantics (a frozen Set does not make its entries immutable). Separated the future live-evidence validator from ordinary test discovery so it cannot make the baseline suite impossible to execute.
2. Added settings/snapshot purity and local failed-start coverage; normalized private session IDs for parity comparisons; corrected source links and enumerated existing source/test files. Documented final source-commit versus later evidence-commit identity.

Static checks performed in this review are document/path/identity/readback checks. The specification's implementation tests, build, UI/audio gates and candidate evidence validator were not run.

## Five independent findings
| Finding | Current result |
|---|---|
| Specification readiness | PASS for the head; U1–U4/U6/U7 and no extensions. Four successors remain blocked stubs |
| Prerequisite readiness | PASS for the head's five completed register prerequisites. Four successors are blocked on unfinished separation; SUBSCRIBER has additional item/verdict gates |
| Repository readiness | Plan passes U8. Primary tree contains unrelated changes. A dedicated clean implementation worktree is required and has not been created. No cleanup is needed to retain those unrelated changes |
| External-register readiness | Readable/writable connector, canonical snapshot and plan→write→readback→confirm support verified. Final recovery must be empty; see final verification receipt |
| Execution-environment readiness | Node v24.14.0 and npm 11.9.0 available; local vitest, tsc and Electron binaries present. Dependency/build/test health and a live screen/audio observation path are not certified; G0/G6 explicitly gate those conditions |

The head is a rubric-ready specification, not a completed implementation or an unconditional runtime go-ahead. The first implementation action is baseline/admission in an isolated checkout. The existing app has not been claimed to pass tests or mode isolation.

## Buffer disposition
Policy target: 5. One specification passes the rubric. The first hard blocker is the unfinished mode separation required by the next item; the skill's D.2 rule stops eager authoring there. Four downstream placeholders remain visible and blocked; inventing exact future edit sites would make those specifications misleading. KOKORO-EXPORT is deferred and outside the five-item sequence.

The review can finish with this explicit buffer gap. The next implementation is mode separation; the next specification refresh follows its validated close-out.

