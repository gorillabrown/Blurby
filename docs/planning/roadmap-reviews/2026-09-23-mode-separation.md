# Blurby — reading-mode separation, owner-directed first stage
Date: 2026-09-23.
Planning status: Phase C approved and Phase D specification complete. The authoritative full specification is [inline in ROADMAP.md](../../../ROADMAP.md#reader-mode-separation-2); implementation remains pending.
Work item: [READER-MODE-SEPARATION-2](https://estrattbrown.monday.com/boards/18432450217/pulses/13119306772).
Primary lane: Reader Engine. Supporting boundary: TTS / Narration Engine.
Owner direction: “Completely pulling these modes apart should be step 1.” Modes should have limited to no crossover, mirror one another structurally, and retain the ability to merge in the future.

## Provenance
Current source inspected on main @ cd384b78cd5325e96429fe867c8b080ce1b39bb8.
Register provider: monday.com connector through Virtuoso external provider.
Source: monday:board/18432450217. Priority readback: 2026-09-23T19:05:52Z.
This is a plan and source audit. No mode implementation, tests, or live QA were executed.

## What the previous isolation actually achieved
READER-ISO-1A through 1E established contracts, adapters, and routing boundaries. Their completed historical dispositions stay intact. Their close-outs explicitly left the most coupled runtime behind:
- CloseOut.READER-ISO-1D.2026-05-26.md:32 leaves FlowScrollEngine and Foliate DOM lifecycle in the shared hook.
- CloseOut.READER-ISO-1E.2026-05-27.md:33 leaves truth-sync RAF callbacks and fragile audio timing refs in the hook.
- src/reader/useReaderModeOrchestrator.ts:6 maps Narrate to Flow for compatibility and delegates to useReaderMode(params).
- src/hooks/useReaderMode.ts owns references and setters for multiple modes, with startFlow accepting targetMode flow or narrate.
- src/components/ReaderContainer.tsx owns shared highlight/anchor state, multiple playback flags, narration callbacks, and the Flow scroll hook.
- src/hooks/useFlowScrollSync.ts consumes narration.cursorWordIndex and installs narration section-end callbacks.

Adapters alone therefore do not establish runtime isolation. The new stage finishes the separation at the actual state, lifecycle, and rendering boundaries.

## Required architecture
Each of Page, Focus, Flow, and Narrate owns:
1. Its runtime instance and mutable state: selected/playing state, live cursor, temporary selection/resume anchors, browse-away state, and pending work.
2. Its lifecycle: enter/select, start, pause/resume where supported, seek/navigation, stop, exit, and disposal.
3. Its timers, RAF callbacks, event subscriptions, asynchronous work, and cancellation.
4. Its mode-specific rendering and highlight/scroll controller, DOM refs, and event bindings.
5. Its mode behavior tests, fixtures, and regression baseline.

Use a mirrored module layout per mode: runtime, state, view/controller, bindings, and tests. The final file-level mapping is part of detailed specification; these are ownership requirements, not existing files.

Matching public contracts and conformance cases provide a common shape. Implementations remain independent. Temporary duplication of mode behavior is an accepted cost. Do not replace the separation with a shared behavioral base class, one hook with four branches, sibling-mode imports, or generic helpers that quietly reintroduce shared mutable ownership.

## Deliberately narrow shared boundary
- A thin router owns only the selected mode, factory/port selection, and the explicit handoff transaction.
- Shared types and immutable document inputs may cross the boundary. Mode runtime instances, refs, callbacks, or mutable state containers may not.
- Infrastructure services such as document loading, storage, and the TTS provider are accessed through narrow ports. Mutable playback/rendering handles are scoped to the active mode session.
- Switching modes exports a value snapshot, disposes the old mode's resources, and initializes the new mode from copied input. An old mode cannot keep a live pointer to the new mode's state.
- Persistence commits use an explicit owner/session identity. Late callbacks from an old session must be rejected even if cancellation races.
- Narrate owns its own reading surface/controller and audio bridge. It must not execute through Flow's private runtime or a Narrate-to-Flow compatibility alias.
- Existing user commands may request a mode transition through the router. A Flow-to-Narrate command becomes an explicit handoff, preserving the user's action while keeping runtime ownership separate.

## Behavior and future consolidation
Preserve each mode's existing user behavior during extraction. Page stays a static reader; Focus retains its own pacing; Flow retains its scrolling behavior; Narrate retains audio-led behavior. The mirrored structure does not erase those differences.

Maintain a single documented contract version and run the same contract suite independently against each implementation. Keep mode-specific fixtures as well. Future consolidation is a separate decision after all isolation and behavior baselines pass; matching contracts make it possible without sharing behavior now.

This stage is not evidence that the existing cursor-lead or rate-overlap defects are fixed. Preserve their recorded baselines and re-evaluate them afterward. The old narration fixes must be rebased against the separated code before implementation.

## Planned delivery waves within step 1
| Wave | Deliverable | Exit evidence |
|---|---|---|
| A — Baseline and boundary map | Current ownership/import/callback map; behavior baseline per mode; explicit permitted shared ports; contract and module layout | All current owners named; baseline observations and known defects recorded; no unexplained shared mutable owner |
| B — Page and Focus extraction | Independent Page and Focus runtime, controller, bindings, state, and tests | Neither mode imports or mutates a sibling implementation; existing behavior preserved |
| C — Flow extraction | Flow owns its scroll engine, section transitions, browse-away, cursor, and surface lifetime | Flow runtime works with narration absent and cannot change other modes' state |
| D — Narrate extraction | Narrate owns its audio bridge, visual/follow runtime, anchor lifecycle, and subscriptions | No Narrate-to-Flow compatibility route or Flow-runtime dependency; audio/cursor regression baselines preserved |
| E — Remove legacy behavioral routing and prove isolation | Thin router wired to four independent modes; obsolete shared mode glue removed only after parity evidence | Import boundary checks, independent mode tests, full transition/cancellation matrix, and live behavior evidence pass |

Run overlapping extraction waves sequentially in isolated implementation worktrees. The existing shared-core freeze remains in force until the ownership migration is complete. Wave completion is not the same as the parent item's completion.

## Acceptance gates to make concrete in Phase D
- Zero sibling runtime imports or direct sibling-state writes.
- Every mutable runtime value, subscription, timer, and render controller has exactly one mode owner.
- Operations in one mode leave the other three modes' observable runtime state unchanged, except for explicit router handoff.
- After stop/exit/destroy, stale callbacks cannot move a cursor, scroll a view, write persistence, or resume audio.
- All 12 directed transitions between distinct modes pass; the four same-mode selections have explicit no-op or documented local behavior.
- At most one selected runtime owns live document position and active playback/scroll work at a time.
- Word zero, delayed extraction, pause/resume, section boundaries, browse-away/return, document switches, and repeated enter/exit preserve their mode-specific baseline.
- Each mode passes the common contract tests in isolation, plus its own behavior suite.
- Typecheck, required tests, build, and per-mode live UI gates are recorded against the candidate commit before close-out.

These are planning gates. Exact test files/assertions, commands, per-wave staging paths, and rollback boundaries are now defined in the inline specification; none has been executed by this review.

## Failure and scope rules
If one mode's extraction changes another mode's baseline, stop that wave, isolate the shared dependency, and revert only the affected extraction change if needed. Do not compensate by changing the other mode's behavior. Preserve unrelated work and known prior defects.

Do not add new reader features, retune TTS latency, remove the narration reducer, restore dormant engines, or consolidate the copies during this stage. Those changes belong to later separately validated work. Existing downstream items are blocked on this parent and must be re-specified after its completion.

## Decision and implementation status
The owner has decided the priority and architectural intent. This plan records that decision. Phase C was explicitly approved, and Phase D completed the specification/readiness review. No application code changed during this review.

