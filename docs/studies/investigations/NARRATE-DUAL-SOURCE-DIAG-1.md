# NARRATE-DUAL-SOURCE-DIAG-1 — Canonical Verdict

**Investigation:** Dual-source narration cursor diagnosis
**Sprint:** NARRATE-DUAL-SOURCE-DIAG-1 (Wave C, Task 9)
**Branch / HEAD:** `sprint/narrate-dual-source-diag-1` @ `efbf925`
**Author:** Aristotle (read-only analysis)
**Date:** 2026-05-30
**Status:** FINAL — this is the one canonical verdict for the live-QA gate
**Primary evidence:** `NARRATE-DUAL-SOURCE-DIAG-1-logs.txt` (raw A1/A4×3/A5 console capture)
**Supporting evidence:** `-liveqa-gate-report.md` (Evan's gate), `-prep.md` (Wave A enumeration / 36 path-IDs / §4 resume-anchor hypothesis), `-decisions.md` (Decision 4a — cross-layer instrumentation rationale)

---

## Executive Verdict

The ULTRATHINK's central thesis — that A4 (paused→resume jumps to the last hard selection) is caused by an **in-hook dual-source race** where the narration hook reads `cursorWordIndex`/`nextGenWordIndexRef` while `getHeardFloorWordIndex()` held the right answer — is **REFUTED** by the gate. The cross-layer instrumentation added under Decision 4a shows the opposite: on resume the engine is **cold**, so `heardFloor` is `null` and there is no competing in-hook value to lose to. The hook's seed is correct *relative to its inputs*; it faithfully reads a stale `resumeAnchor=66` ("December") that the **reader layer** (`useReaderMode:mode-change`) supplied and **never cleared** (`resumeAnchor:consumed` never fires across all three A4 trials). Thus A4's root cause is a reader-layer anchor-lifecycle defect, exactly as the Decision-4a hypothesis predicted — that hypothesis is **CONFIRMED**. Separately, A5 (rate change → silence) **is** a genuine in-hook wrong-seed-source defect: `applyRateChange:kokoro-bucket` seeds from `nextGenWordIndexRef` (the pre-fetch head, 1111 / end-of-doc) instead of `heardFloor` (565), so the dual-source framing is **partially vindicated for rate-change seeding only**. A1 (click-to-narrate exact start) **PASSES** cleanly. Net: the dual-source story survives for A5, is dead for A4, and A4's real fix moves up-layer into resume-anchor lifecycle ownership.

---

## 1. Test-by-test findings (grounded in the captured log markers)

### A1 — Hard-click "December;" (word 66) → PASS

- Click on word 66 emits `resumeAnchor:set` at index 66 (source: hard click).
- The active path pins via `resumeAnchor:active-skip` at 66 — the anchor is honored as the start point.
- Audio starts on the clicked word; cursor advances naturally **66 → 77 → 78 …** (continuous forward progression in the trace).
- `resumeAnchor:consumed` does **not** fire — and is **not required** for A1, because the anchor is being actively used as the live start seed, not handed off and cleared.

**Conclusion:** Click-to-narrate-exact-start works today. This is the behavioral payoff INTENT-CURSOR-1 was meant to deliver — and it is already present.

### A4 — Pause, then Resume (×3) → FAIL, 0-of-3

Every one of the three resume trials reproduces identically: **resume jumps to word 66 "December"** (the last hard selection from A1), not to the paused position.

Decisive trace sequence on each resume:

1. The paused engine has gone **cold** — `heardFloor` is `null` at resume time (no live audio position to anchor to).
2. Resume does **NOT** take any of the dual-source contention branches: there is **no** `resume:cursor-mismatch`, **no** `resume:handoff-pending`, **no** `resume:bare`. Those branches are simply not entered.
3. Instead, play fires `startCursorDriven` — specifically `startCursorDriven:kokoro-warming-seed` then `startCursorDriven:speaking-seed`, both with **startIdx 66**.
4. The startIdx is seeded by the **reader-layer** `resumeAnchor`, whose source is logged as `useReaderMode:mode-change` — i.e., the anchor set during A1 was never cleared.
5. `speakNextChunkKokoro:seed` then reads **startIdx 66 "December"** and generates from there.
6. `resumeAnchor:consumed` **NEVER fires** across all three trials — the anchor is read but its consume/clear step never executes.

**Conclusion:** A4 is a stale, never-cleared **reader-layer** `resumeAnchor`. The narration hook is an innocent downstream reader of a value the reader layer should have nulled on pause/resume.

### A5 — Rate change 1.0x → 1.4x at word ~562 "Nothing" → FAIL (silence)

- At the moment of rate change, the live heard position is `heardFloor = 565`.
- `applyRateChange:kokoro-bucket` reseeds the bucket from `nextGenWordIndexRef = 1111` — the **pre-fetch generation head**, which on this document is at/near **end-of-doc**.
- The reseed **ignores `heardFloor` (565)** entirely. Seeding at 1111 points past the meaningful content → no audio is produced → **stall / silence**.
- Severity note (document-length artifact): on this short doc the symptom is *silence* because 1111 is end-of-doc. On a **longer** document the identical defect would manifest as a large **FORWARD skip** (jump ahead to wherever the pre-fetch head sits), not silence. The defect is the same; only the surface symptom is document-length-dependent.

**Conclusion:** A5 is a true in-hook wrong-seed-source bug — it reads the wrong ref (`nextGenWordIndexRef`) where it should read `heardFloor`.

---

## 2. Task-5 questions — answered explicitly

### (a) Did A4 correlate with a code path reading `cursorWordIndex` / `nextGenWordIndexRef` when `getHeardFloorWordIndex()` would have had the right answer?

**NO — not in the way the ULTRATHINK predicted.** The ULTRATHINK expected an in-hook race where the hook picks a cursor/pre-fetch value over a correct `heardFloor`. The trace refutes this on two counts:

1. `heardFloor` did **not** have the right answer — it was **`null`** because the engine was cold at resume. There was no correct competing value for the hook to ignore.
2. The hook's seed was **faithful to its input**: `startCursorDriven:*-seed` and `speakNextChunkKokoro:seed` both used **startIdx 66**, and that 66 was supplied by the **reader layer** `resumeAnchor` (source `useReaderMode:mode-change`), not chosen by the hook from a menu of competing in-hook sources. The dual-source-contention branches (`resume:cursor-mismatch` / `:handoff-pending` / `:bare`) were never entered, and `resumeAnchor:consumed` never fired.

So A4 is **not** an in-hook `cursorWordIndex`/`nextGenWordIndexRef` mis-read. It is a reader-layer stale-anchor defect.

### (b) Same question for A5

**YES.** A5 **is** an in-hook wrong-seed-source defect of exactly the predicted flavor. `applyRateChange:kokoro-bucket` reads `nextGenWordIndexRef` (1111) instead of `heardFloor` (565). Here `heardFloor` **did** hold the right answer (565, the live position) and the code seeded from the wrong ref anyway. This is a dual-source bug — but it is the **rate-change** seeding path, distinct from the resume path that A4 exercises.

### (c) Verdict (explicit)

- **A4 — in-hook dual-source-race hypothesis: REFUTED.** The hook did not lose a race between in-hook sources; it correctly consumed a stale reader-layer anchor.
- **A4 — Decision-4a reader-layer never-cleared-`resumeAnchor` hypothesis: CONFIRMED.** `resumeAnchor:consumed` never fires; the anchor set in A1 (source `useReaderMode:mode-change`, index 66) persists and seeds every resume.
- **A5 — distinct in-hook wrong-seed-source defect: CONFIRMED.** `applyRateChange:kokoro-bucket` seeds from `nextGenWordIndexRef` (1111) rather than `heardFloor` (565).

**Overall disposition:** The ULTRATHINK's central A4 thesis is **refuted and replaced** with a measured root cause (reader-layer anchor lifecycle). The dual-source framing is **partially vindicated — for rate-change seeding (A5) only**. The cross-layer instrumentation (Decision 4a) is what made this distinction visible; without the layer-tagged `resumeAnchor` source and the `heardFloor`-null observation, A4 would have been misdiagnosed as an in-hook race.

---

## 3. Dispatch reshape implications (recommendations — final call is codex-parent / Evan)

### Sprint 3 — PAUSE-RESUME-UNIFY-1 → **EXPAND (becomes THE A4 fix)**

**Recommendation: EXPAND its scope to own the cross-layer resume-anchor clear lifecycle.** This sprint must now define **WHERE the `resumeAnchor` clears**, because the gate proved the anchor is never cleared on the resume path (`resumeAnchor:consumed` never fires). The only current clear-to-null lives at `ReaderContainer.tsx:1353`, which is plainly insufficient. The sprint spec must enumerate the clear points:

- **On pause** — clear (or invalidate) any hard-selection anchor so a subsequent resume cannot re-use it.
- **On resume-consume** — fire `resumeAnchor:consumed` and null the anchor once it has seeded one start.
- **On first word-advance after start** — defensive clear so a stale anchor cannot survive into the next pause/resume cycle.

**Gate:** A4 must pass **3-of-3** (resume returns to paused position, no jump to last hard selection) before this sprint closes. This is the highest-value reshape outcome of the whole investigation.

### New A5 sprint (reseed rate-change from `heardFloor`) → **STANDALONE, dispatch SOON**

**Recommendation: STANDALONE sprint, not folded into APPLYRATECHANGE-COLLAPSE-1.** Reasoning:

- The fix is **small, surgical, and high-confidence**: change `applyRateChange:kokoro-bucket` to seed from `heardFloor` (with a `nextGenWordIndexRef` fallback only when `heardFloor` is null), not from `nextGenWordIndexRef`.
- It is **user-facing severe** (silence on short docs, forward-skip on long docs) and **independent** of the A4/Sprint-3 lifecycle work — coupling it to a larger collapse refactor would delay a cheap, clear win and entangle a one-line-class fix with structural change.
- It does interact with APPLYRATECHANGE-COLLAPSE-1 (same code region) — see Sprint 4 note. The clean sequence is: land the standalone A5 seed fix first, then let APPLYRATECHANGE-COLLAPSE-1 refactor on top of corrected behavior. Folding risks regressing the fix inside the refactor.

### Sprint 2 — INTENT-CURSOR-1 → **DEFER (lean toward cut)**

**Recommendation: DEFER, with a strong lean to CUT.** A1 **PASSES** — click-to-narrate starts audio on the exact clicked word with natural advance (`resumeAnchor:set`/`:active-skip` at 66, continuous 66→77→78). The user-facing payoff INTENT-CURSOR-1 was justified by is **already shipped**. Its dual-source justification is further weakened by the A4 refutation (the in-hook race it partly leaned on does not exist on the click path). Keep it parked only if a *specific* unmet click-intent scenario is identified that A1 did not cover; otherwise cut and reclaim the slot. Do not dispatch on the current justification.

### Sprint 5 — SUBSCRIBER-CURSOR-1 → **GATE-ON-A2-RETEST (keep, but blocked)**

**Recommendation: KEEP but GATE on an A2 retest.** A2 (cursor lead / subscriber behavior) was **not exercised** in this gate, so the dual-source framing SUBSCRIBER-CURSOR-1 rests on is **weakened (by the general A4 refutation) but not disproven for A2 specifically**. Do not cut it on inference — but do not dispatch it on the pre-gate dual-source justification either. Add an **A2 live-QA retest** as the entry gate; if A2 shows a real cursor-lead/subscriber divergence, keep and spec to the measured cause; if A2 is clean (like A1), cut it.

### Sprint 4 — APPLYRATECHANGE-COLLAPSE-1 → **NOTE INTERACTION with A5 fix**

**Note (not a reshape):** This sprint touches the same `applyRateChange` region as the new A5 fix. **Sequence the A5 standalone fix FIRST**, then have APPLYRATECHANGE-COLLAPSE-1 build on the corrected `heardFloor`-based seed. The collapse refactor must **preserve** the `heardFloor`-primary / `nextGenWordIndexRef`-fallback seeding contract established by the A5 fix and should include a regression assertion that rate-change never seeds past `heardFloor`. If the parent prefers a single touch of this region, the alternative is to fold A5 in as the **first task** of APPLYRATECHANGE-COLLAPSE-1 — but the standalone-first ordering is recommended to de-risk the cheap fix.

---

## 4. Evidence nuances the parent should weigh

1. **`heardFloor` was `null` on A4 because the engine went cold** — this is the single observation that overturns the ULTRATHINK. Any future A4 work must treat "cold engine, no live floor" as the resume baseline; a fix that only arbitrates *between live in-hook sources* would not have fixed A4 because there was no live source to arbitrate.
2. **A5's symptom is document-length-dependent.** On this short doc, seeding at `nextGenWordIndexRef=1111` (end-of-doc) yields *silence*; on a longer doc the same wrong-seed yields a *forward skip*. Reviewers should not dismiss A5 as "stall-only" — the underlying defect is a wrong-ref seed, and a regression test should use a doc long enough to make the forward-skip visible.
3. **The A4 fix surface is wider than one hook.** The only existing clear-to-null is `ReaderContainer.tsx:1353`; the anchor is set by `useReaderMode:mode-change`. The lifecycle fix is genuinely cross-layer (reader ↔ narration), which is why it belongs in PAUSE-RESUME-UNIFY-1 (a lane that already owns resume) rather than in a narrow narration-hook sprint.
4. **The instrumentation paid for itself.** Decision-4a's layer-tagged `resumeAnchor` source and the explicit `consumed`/branch-selection markers are what let us distinguish "hook lost a race" from "hook faithfully read a stale up-layer value." Recommend keeping this instrumentation (behind a debug flag) through the Sprint-3 fix and the A4 3-of-3 gate, then removing it.
