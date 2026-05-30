# NARRATE-DUAL-SOURCE-DIAG-1 — Mid-Dispatch Decisions

This file is the durable record of decisions taken mid-sprint. At close-out,
MarcusAurelius folds each entry into the close-out memo §Mid-Dispatch Decisions.

---

## Decision 4a — 2026-05-29 — Expand Wave B instrumentation to full cross-layer scope

**Decision Type:** Scope expansion (instrumentation surface).

**Context (what Wave A surfaced):** Aristotle's Wave A enumeration memo
(`NARRATE-DUAL-SOURCE-DIAG-1-prep.md`, §4) found that the `resume anchor` /
`onRelocate` / `[TTS-7M]` mechanism from the Live-QA prior-art evidence is **not
present in `useNarration.ts` or `audioScheduler.ts`** — the two files the dispatch
declared as DIAG-1's "Shared-Core Touches." The mechanism lives one layer up, in the
reader-container layer: `resumeAnchorRef` declared at `useDocumentLifecycle.ts:131`,
the literal Live-QA log at `ReaderContainer.tsx:1259`, and its **only clear-to-null at
`ReaderContainer.tsx:1353`** (nothing clears it on resume, pause, or first
word-advance). Aristotle flagged this as a credible **single-root-cause candidate for
A4 that is materially different** from the in-hook `cursorWordIndex` ⟷
`lastConfirmedAudioWordRef` dual-source race that the 2026-05-29 ULTRATHINK and
Sprints 2-5 are built around. He correctly did NOT amend any spec (per dispatch
instruction), and flagged it for codex-parent.

**Decision:** Expand DIAG-1 Wave B instrumentation to the **full 36-path-ID schema**
from prep.md §5, **including the cross-layer resume-anchor lifecycle** —
`resumeAnchor:set` (`useDocumentLifecycle.ts:165`, `usePersistentReadingAnchor.ts:69`,
`useReaderMode.ts:246`, `useReaderModeOrchestrator.ts:128`, `ReaderContainer.tsx:1343`),
`resumeAnchor:active-skip` (`ReaderContainer.tsx:1259`, `:1382`), and
`resumeAnchor:consumed` (`ReaderContainer.tsx:1353`). All instrumentation is
log-only, gated by `localStorage.BLURBY_DUAL_SOURCE_DIAG === '1'`, zero semantic
change. No production consumers of the oracle are wired (those belong to SK-N2…N5).

**Rationale:** DIAG-1's entire purpose is to validate A4's true root cause before
committing 4 implementation sprints. Instrumenting only the in-hook layer would tell
us "the resume seed was 0" but not "because the reader-layer anchor never cleared" —
a PARTIAL verdict for the wrong reason. The smoking gun for the reader-anchor
hypothesis is the **absence of a `resumeAnchor:consumed` event** in the A4 trace,
which only cross-layer instrumentation can detect. A single A4 replay can then
discriminate the two competing hypotheses instead of confirming one blindly.
`ReaderContainer.tsx` is already in the shared-core freeze set that DIAG-1 owns alone
for this window, so no lane policy is violated; the only net-new instrumented files
are reader-layer hooks, all log-only.

**Decided by:** Evan (ratified codex-parent's recommendation), 2026-05-29.

**Downstream implication to carry into Wave C verdict + closeout:** If the A4 trace
shows the anchor pinned at 0 with no `consumed` event AND the resume seed arriving as
0 from the reader layer, then **Sprint 3 (PAUSE-RESUME-UNIFY-1) scope must expand** to
own (or coordinate a new sprint owning) the cross-layer resume-anchor clear lifecycle
— an in-hook seed-priority chain alone will not fix an A4 whose bad input originates
one layer up. Aristotle's Wave C analysis report must state this explicitly in the
verdict's "what dispatches / what gets respec'd" section.
