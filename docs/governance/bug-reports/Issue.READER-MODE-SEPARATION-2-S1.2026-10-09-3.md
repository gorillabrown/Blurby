# Waves B–E design: nine open contradictions (OC-1..OC-9) — READER-MODE-SEPARATION-2 (session S1)

Date: 2026-10-09. Branch `eb/reader-mode-separation-2` @ `0c3b4026`. Design: `docs/planning/roadmap-reviews/reader-mode-separation-2/design/waves-b-e-design.md` §H.

## 1. tl;dr

The implementation design for Waves B–E and the speed dialog leaves nine contradictions between the spec and the code for a decision. Two of them block the speed dialog (OC-6, OC-7); the rest gate specific G4/E1/E2 checks.

## 2. Executive Summary

The design itself is executable. Its decisions DD-1..DD-7 (build beside and cut over at E1; plain-class runtimes; shell-owned TTS infrastructure; legacy files unreachable rather than deleted; fixture replay; mode-prefixed CSS; shell warm-up) are within charter autonomy. The nine OCs are places where the literal spec, the B0 fixtures or the speed amendment cannot all hold at once.

## 3. Evidence of issue

Design §H, with evidence pointers per row:
- OC-1: `flow.baseline.json` steps 7–9 (`flowPlaying: true` in Page).
- OC-2: `ReaderModeStartRequest.paragraphBreaks: Set<number>`.
- OC-3: `focusView.jumpToWord` in page/flow/narrate traces.
- OC-4: the `toggleNarrationInFlow` tests.
- OC-5: source-text suites on `ReaderContainer.tsx`.
- OC-6: shared `settings.wpm`.
- OC-7: `normalizeKokoroUiSpeed` clamps to [1.0, 1.5] in steps of 0.1.
- OC-8: Page ↑/↓ speed keys.
- OC-9: dead Focus progress timer and `useReader` tick.

## 4. Possible cause(s)

The spec predates the census and fixture recording. The speed amendment was written against the UI, not against the rate and settings domains.

## 5. Likely solution(s)

The design's recommendations, adjusted where an acceptance criterion would otherwise stay unverifiable (OC-6).

## 6. Confidence in cause and solution identification (1–10)

8. Every OC is evidenced in code or fixtures. OC-6 and OC-7 are product calls the owner delegated.

## Decision — 2026-10-09

- **Type:** 1b — Advance (Planner-Originated), owner-delegated
- **Decided:** Accept DD-1..DD-7, and rule OC-1..OC-9 as staged:
  - OC-1 stale-flag observation rule; OC-2 v1 sibling interface; OC-3 alias; OC-4 legacy-hook dead-path tests;
  - OC-5 re-point table; OC-6 additive focusWpm/flowWpm; OC-7 Kokoro UI domain 0.80–2.00 / 0.05 with buckets unchanged;
  - OC-8 Page ↑/↓ kept; OC-9 no dead-code copies.
- **Instruction:** Implement Wave B steps B1–B9 per design §C with the rulings applied.
- **Amendment:** `docs/governance/close-outs/Memo.READER-MODE-SEPARATION-2.GovernanceStaging.2026-09-23.md`, fold-in 7 (registry row 6)
- **Lessons:** No new lesson. The staged fold-in 4 covers the root pattern.
