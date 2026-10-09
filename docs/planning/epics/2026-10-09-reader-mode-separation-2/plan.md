---
epic: reader-mode-separation-2
charter: charter.md
---

# Phase Plan — Separate Page, Focus, Flow, and Narrate runtimes

<!-- The route, not the contract. The executor may reshape phases as reality teaches —
     log the replan in state.md → Decision log and journal.md. Exit gates may tighten,
     never loosen. Plan at phase altitude: intents and gates here; steps live inside the
     run. At every exit gate: re-read charter.md before opening the next phase. -->

Waves follow `ROADMAP.md` § READER-MODE-SEPARATION-2 → *Waves and verification gates*, with the 2026-09-23 and 2026-10-08 amendments. The order is fixed by the spec's serial dependency: A1 → A2 → A3 → G0 → B → C → D → E → speed amendment.

## Phases

### P1 — Reconcile the run, verify assumptions, recover admission (A1-R)
- **Intent:** Repair the worktree link (A3), inventory uncommitted evidence (A4), confirm GOV-HYGIENE landed (A1), and merge `main` into the run branch with `--no-ff`. Verify the archived baseline build (A2) and the lessons parser (A7). Baseline the canonical commands on the pinned base. Then run the A1-R recovery slice: at most 8 parent tool calls, as the 2026-10-08 amendment specifies.
- **Exit gate:** charter A1–A4 and A7 verified and recorded in state.md → Working set. Then **either** A1 exit criteria PASS (`admission/isolation.json` outcome PASS; three live-profile hashes unchanged) **or** A1-R failed and the manual route is open: `g0-manual-checklist.md` written and committed, with an owner-gate BLOCKER(USER) raised.
- **Rough size:** 1–2 sessions.

### P2 — Complete Wave A / G0 admission
- **Intent:** On the automated route: A2 (Flow reproduction and classification, ≤20 actions), then A3 (independent G0 matrix, ≤35). On the manual route: the owner runs the checklist while the executor does non-gated Wave A work. In both routes: contract and port types (`ReaderModeAdapter.ts` extension, `ReaderDocumentSnapshot.ts`, `ReaderPorts.ts`, `createReaderPorts.ts`), the dependency/ownership census (`ownership.json`, `dependencies.json`, exact-path `paths.json`), and fixtures and harness for G1–G4. Transition the Monday item to In Flight only after D1 passes.
- **Exit gate:** charter **D1** passes. Monday shows In Flight (readback confirmed).
- **Rough size:** 2–3 sessions, plus owner time for the checklist.

### P3 — Wave B: Page and Focus runtimes
- **Intent:** Build the Page and Focus directories in the mirrored layout and move their behavior out of the shared hooks and views. Wire them through the thin router (`useReaderModeOrchestrator.ts`); legacy entry points may forward temporarily.
- **Exit gate:** D2 and D3 pass for Page and Focus; the Page and Focus behavior tests pass; Flow and Narrate traces unchanged against their G0 fixtures.
- **Rough size:** 2 sessions.

### P4 — Wave C: Flow runtime
- **Intent:** Flow owns its timer, scroll and surface paths, runs with a throwing or unavailable audio port, and has no audio dependency.
- **Exit gate:** D2–D4 pass for Flow, including "Flow works when audio access throws"; Page, Focus and Narrate traces unchanged.
- **Rough size:** 2 sessions.

### P5 — Wave D: Narrate runtime
- **Intent:** Narrate owns its surface, anchors and TTS bridge port with no Flow alias or import. Exact start and pause/resume semantics are preserved. Known cursor-lead and 1.4x defects stay labelled, not repaired.
- **Exit gate:** D2–D5 pass for Narrate (the four named Narrate tests); the other three traces unchanged.
- **Rough size:** 2–3 sessions.

### P6 — Wave E: remove shared behavior and prove isolation on one candidate
- **Intent:** Delete obsolete shared behavior and legacy routing, finish the boundary coverage, create `scripts/check_reader_mode_evidence.mjs`, build the fresh candidate, and get G6 live QA. G6 is an owner gate: write the G6 checklist, raise a BLOCKER(USER), and keep working on non-gated items.
- **Exit gate:** D2–D7 pass on one candidate SHA recorded in `verification.json`.
- **Rough size:** 2 sessions, plus owner time for G6.

### P7 — Speed-dialog amendment, final verification, completion
- **Intent:** Declare exact implementation and test paths for the slider (bounded serial task, recorded in `paths.json` and the Decision log). Implement the approved values and run its acceptance checklist, including the owner's live check. Re-run the affected regression gates. Then run the full charter DoD fresh and follow launch.md → Completion protocol.
- **Exit gate:** D1–D9 pass in one session; `done.md` written.
- **Rough size:** 1–2 sessions, plus owner time.

## Gate log

| Date | Gate | Evidence |
|------|------|----------|

## Current-phase worklist

- [ ] P1 — open per state.md → Next actions
