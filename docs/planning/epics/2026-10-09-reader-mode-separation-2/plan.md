---
epic: reader-mode-separation-2
charter: charter.md
---

# Phase Plan — Separate Page, Focus, Flow, and Narrate runtimes

<!-- The route, not the contract. The executor may reshape phases as reality teaches —
     log the replan in state.md → Decision log and journal.md. Exit gates may tighten,
     never loosen. Plan at phase altitude: intents and gates here; steps live inside the
     run. At every exit gate: re-read charter.md before opening the next phase. -->

Waves follow `ROADMAP.md` § READER-MODE-SEPARATION-2 → *Waves and verification gates*, with all four amendments. The order is fixed: bootstrap → A1-R → A2 → A3 (or manual G0) → G0 → B → C → D → E (S) → speed (F) → verification → finalization. Identities B0, I, S and F are defined in charter.md.

## Phases

### P1 — Bootstrap, rebuild B0, prepare and run A1-R
- **Intent:**
  - Session-1 bootstrap per launch.md: verify `main`, repair the worktree, inventory uncommitted evidence (A4), merge `origin/main` → record **I**, push. Switch to the authoritative packet in the run worktree.
  - Register this packet's files and `verified.md` in `E/paths.json`.
  - Rebuild **B0** under the 2026-10-09 rebuild policy at `C:\Projects\Blurby-artifacts\rms2-baseline-build\`, writing `admission/baseline-build-rebuild.json`.
  - Update the harness guards (A7): worktree path and B0 manifest in `isolated-launch.cjs` and `capture.mjs`, keeping their pinned-source checks; commit them as test-only.
  - Re-read the live lessons (`lessons --open`).
  - Then run A1-R (≤ 8 parent tool calls).
- **Exit gate:** I recorded and pushed; B0 rebuilt and validated (typecheck/test/build exit 0, inputs match `1e5485c6`); harness guards accept the current worktree. Then **either** A1 exit criteria PASS (`admission/isolation.json` PASS; three live-profile hashes unchanged) **or** the manual route is open: `g0-manual-checklist.md` committed and the owner-gate BLOCKER(USER) raised.
- **Rough size:** 1–2 sessions.

### P2 — Complete Wave A / G0 admission (no `src/` changes)
- **Intent:** On the automated route: A2 (Flow reproduction and classification, ≤ 20) and A3 (independent G0 matrix vs B0, ≤ 35). On the manual route: the owner runs the checklist while the executor does non-gated Wave A work. Either way, produce the dependency/ownership census (`ownership.json`, `dependencies.json`, exact-path `paths.json`) and the evidence fixtures. After D1 passes, transition the Monday item to In Flight (handshake; readback confirmed).
- **Exit gate:** charter **D1** passes; Monday shows In Flight.
- **Rough size:** 2–3 sessions, plus owner time for the checklist.

### P3 — Wave B: contracts and ports, then Page and Focus
- **Intent:** First the contract/port types (`ReaderModeAdapter.ts` extension, `ReaderDocumentSnapshot.ts`, `ReaderPorts.ts`) and the broker (`createReaderPorts.ts`), with the G1/G3 test scaffolding. Then the Page and Focus directories in the mirrored layout, moving their behavior out of the shared hooks and views, wired through the thin router (`useReaderModeOrchestrator.ts`). Legacy entry points may forward temporarily.
- **Exit gate:** G1 and G2 pass for Page and Focus; the Page and Focus behavior tests pass against B0 fixtures; Flow and Narrate traces unchanged.
- **Rough size:** 2–3 sessions.

### P4 — Wave C: Flow runtime
- **Intent:** Flow owns its timer, scroll and surface paths, runs with a throwing or unavailable audio port, and has no audio dependency.
- **Exit gate:** G1–G3 pass for Flow, including "Flow works when audio access throws"; Page, Focus and Narrate traces unchanged.
- **Rough size:** 2 sessions.

### P5 — Wave D: Narrate runtime
- **Intent:** Narrate owns its surface, anchors and TTS bridge port with no Flow alias or import. Exact start and pause/resume semantics are preserved. Known cursor-lead and 1.4x defects stay labelled, not repaired.
- **Exit gate:** G1–G4 pass for Narrate (the four named Narrate tests); the other three traces unchanged.
- **Rough size:** 2–3 sessions.

### P6 — Wave E: remove shared behavior, record S
- **Intent:** Delete obsolete shared behavior and legacy routing, finish the boundary coverage, create `scripts/check_reader_mode_evidence.mjs`, build a fresh candidate, and get G6 live QA vs B0 (an owner gate). Record **S** and preserve its G1–G6 evidence in `verification.json`.
- **Exit gate:** G1–G6 pass on S; `verification.json` → `structuralCandidate` = S with evidence pointers.
- **Rough size:** 2 sessions, plus owner time for G6.

### P7 — Speed dialog, verification, staged finalization
- **Intent:** Declare exact slider implementation and test paths (bounded serial task, in `paths.json` and the Decision log), implement the approved values, and run the acceptance checklist, including the owner's live check. The commit that completes it is **F**. Re-run every DoD row on F (F1), then finalize through stages F2–F5 exactly as launch.md → *Completion and finalization* defines them.
- **Exit gate:** D1–D9 pass in one session on F and `verified.md` is committed and pushed (F1). Then `origin/main` carries the published integration merge (F3/F4), and `done.md` exists in the authoritative packet (F5).
- **Rough size:** 1–2 sessions, plus owner time.

## Gate log

| Date | Gate | Evidence |
|------|------|----------|
| S1 | P1 exit: I recorded and pushed; B0 rebuilt and validated; guards accept W; A1-R PASS | `92dda255`; `admission/baseline-build-rebuild.json`; `admission/isolation.json` (5f0608b6) |
| S1 | A2 PASS (Flow reproduction/classification) | `admission/flow-reproduction.json` (2529a921) |
| S1 | A3 automated half recorded; G0 owner half pending (B1) | `admission/g0-matrix.json` (277967b3); census 63b10115; G4 fixtures c61bca67 |
| S1 | **Wave B gate B9 PASS** on 5a34f6e1: typecheck/test/build 0; 217/3089/133 skipped (= B0); recorder 5/5; G4 page+focus byte-identical after Q-F; OBS-A3-2 fixed (mutation-proven) | `verification.json → waveGates[0]` |

## Current-phase worklist

- [x] P1 — closed S1
- [ ] P2 — census integration; A3 (non-EPUB converted fixture, Kokoro seed, matrix runner); heard-audio owner gate; D1
