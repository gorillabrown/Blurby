# NARRATE-INTENT-CURSOR-1 — Design Memo (the A4 fix)

**Author:** codex-parent (Cowork, architect) — Wave A design deliverable
**Sprint:** NARRATE-INTENT-CURSOR-1, Wave A, Task 1
**Branch / base:** `sprint/narrate-intent-cursor-1` @ `f523072` (clean `main` + DIAG-1 merged)
**Date:** 2026-05-30
**Status:** Execution-ready. This memo gates Wave B (Athena implementation).
**Authoritative inputs:** `NARRATE-DUAL-SOURCE-DIAG-1.md` (verdict), `-A4-mechanism-addendum.md` (gravity well), `-prep.md` §4 (lifecycle map — re-grep at execution time per SRL-086/SRL-087).

---

## 1. The defect, in one paragraph

A4 (pause→resume jumps back to the last hard click) is caused by a **reader-layer
`resumeAnchorRef` that is SET on the last hard-selection and never CONSUMED/CLEARED**.
DIAG-1 proved it: on resume the engine is cold (`heardFloor` null), no in-hook
`resume:*` contention branch fires, and play seeds a cold `startCursorDriven` from the
stale anchor (`startCursorDriven:*-seed startIdx=66`), with `resumeAnchor:consumed`
**never firing** across all three trials. The gravity-well addendum sharpened it: while
the anchor is non-null, `ReaderContainer.onRelocate` suppresses **both** the cursor
update **and** the progress-save (`shouldPersistRelocateProgress` is gated on
`!hasResumeAnchor`), so the persisted position is frozen at the click (66) even as audio
plays to 227 — and every pause→play / `useReaderMode:mode-change` re-seeds from that
frozen 66. The anchor stops being "start here **now**" and becomes a permanent
**gravity well**.

A1 (hard-click exact start) PASSES today **only because the anchor is *fresh* at click
time** — the same mechanism that fails A4 when the anchor is *stale* at resume. The fix
must preserve A1's fresh-anchor exact-start while killing the stale-anchor gravity well.

---

## 2. Current lifecycle (from prep §4 — Athena MUST re-grep these at execution time)

**Declaration / ownership (single owner = reader layer):**
- `useDocumentLifecycle.ts:131` — `const resumeAnchorRef = useRef<number | null>(null);`
  (interface field ~64; exposed ~255).

**SET sites (5):**
- `useDocumentLifecycle.ts:165` — doc restore → persisted reading position.
- `usePersistentReadingAnchor.ts:69` — persistent-anchor write.
- `useReaderMode.ts:246` — mode-change pause-to-page (reads anchor at ~238 to compute `startAnchor`).
- `useReaderModeOrchestrator.ts:128` — `pageStart`.
- `ReaderContainer.tsx:1343` — click-to-narrate → clicked word (**this is A1's SET**).

**ACTIVE-skip / suppressor sites:**
- `ReaderContainer.tsx:1255` — `const hasResumeAnchor = resumeAnchorRef.current != null;`
- `:1256`, `:1264`, `:1270` — relocate / page-mode cursor-write gates (skip while anchor active).
- `:1259` — `[TTS-7M] onRelocate: resume anchor active … skipping approx …`.
- `:1276–1282` — `shouldPersistRelocateProgress` fed `hasResumeAnchor`; `if (!shouldPersistRelocate) return;`
  → **progress-save suppressed while anchor active** (the gravity-well coupling).
- `:1380` / `:1382` — onLoad path skips restore while anchor active.

**CONSUMED / CLEARED sites:**
- `ReaderContainer.tsx:1353` — `resumeAnchorRef.current = null;` (explicit-selection-with-no-index).
  **This is the ONLY clear-to-null. It does not fire during normal play → the bug.**

---

## 3. The fix — two named lifecycle steps, one of which is nearly free

The intent-cursor lifecycle is `SET → ACTIVE → CONSUMED → CLEARED`. SET and ACTIVE
already exist and A1 depends on them — **do not touch them**. Add the two missing steps.

### Key architectural insight (collapses two requirements into one action)

The addendum lists **two** required behaviors — (1) clear the anchor's seed role and
(2) restore progress persistence. **Both are satisfied by a single action: nulling the
anchor at the right time.** Progress-save suppression is gated on `hasResumeAnchor`
(= `resumeAnchorRef.current != null`); the moment the anchor is nulled, the existing
`!hasResumeAnchor` gate at `:1276–1282` *automatically* re-enables progress-save, and
the relocate cursor-write gate re-enables too. **So the implementer does not add a
separate "un-gate progress-save" branch — nulling the anchor IS the un-gate**, provided
the null happens early (first advance past the anchor) so the bulk of playback persists.
Verify this coupling holds at execution time; if any suppressor reads a *captured* copy
of `hasResumeAnchor` rather than re-reading `resumeAnchorRef.current`, that capture must
be made live.

### Step CONSUME — null the anchor on first word-advance PAST it

- **Trigger:** the live audio word index advances **strictly greater than** the anchor
  value: `audioWordIndex > resumeAnchorRef.current`. **Strict `>`, not `>=`** — the anchor
  word itself is the intended start (A1: first spoken word = 66); consume must fire only
  once audio moves to the *next* word (A1 trace: 66 → 77 → consume at 77). Using `>=`
  would consume before the clicked word is honored and break A1.
- **Where the signal originates:** the audio/narration word-advance in `useNarration.ts`
  (the per-word callback / the `onWordAdvance` plumbing registered at ~1404/1428, invoked
  per engine at the word callbacks). `useNarration` knows the live word index; it does
  **not** own the anchor.
- **Where the CLEAR executes:** the **reader layer** (ReaderContainer / useDocumentLifecycle),
  which owns the ref. This preserves single-writer discipline (one owner mutates the ref).
- **Wiring decision (Athena confirms by reading the code):**
  - **Preferred:** if `ReaderContainer` already supplies an `onWordAdvance` handler to
    `useNarration` (check the hook's props / the registration at 1404/1428), put the
    consume check **inside that existing handler** — it already fires per word with the
    live index. No new prop. The handler does:
    `if (resumeAnchorRef.current != null && wordIndex > resumeAnchorRef.current) { resumeAnchorRef.current = null; logConsumed('advance-past', wordIndex); }`
  - **Fallback:** if no such handler is threaded, add a minimal callback prop
    (e.g. `onNarrationWordAdvance(wordIndex)`) that `useNarration` invokes on each
    advance and `ReaderContainer` implements with the consume check above. Do **not**
    pass the anchor *into* `useNarration` — keep the comparison on the owner's side.
- **Idempotent & one-shot:** the `!= null` guard makes it fire exactly once; subsequent
  advances see null and no-op.
- **Emit `resumeAnchor:consumed`** (structured, via the DIAG instrumentation already in
  the tree, flag-gated) at the clear so the gate and tests can observe it. Its presence
  on resume is the success signal mirroring DIAG-1's "absence = bug."

### Step CLEAR-on-fresh-start — defensive backstop

- **Trigger:** a fresh narration start that is **not** the immediate consequence of the
  current anchor-setting click (i.e., play begins from live/persisted progress, not from
  a just-clicked word).
- **Action:** null any surviving `resumeAnchorRef` before the cold seed reads it, so a
  stale anchor from a prior cycle can never seed a fresh start.
- **Why it is a backstop, not the primary fix:** if CONSUME works, the anchor is already
  null by the time a new fresh start happens (it was consumed during the prior playback).
  CLEAR-on-fresh-start guards the residual cases: app start with a persisted anchor that
  playback never advanced past; a start after a pause where consume didn't reach.
- **Must NOT clobber A1:** the click→play path SETs the anchor (1343) and immediately
  starts at it. CLEAR-on-fresh-start must distinguish "anchor set by the current click
  that is driving THIS start" (keep) from "stale anchor from a prior start" (clear).
  Mechanism options for Athena to choose (document the choice): (a) only run the
  fresh-start clear on the play paths that are *not* click-initiated; (b) tag the SET
  with a one-shot "armed for next start" flag that the start path consumes; (c) sequence
  the clear *before* the click SET so a click always re-arms a clean anchor. Option (a)
  or (c) is preferred — both keep A1's SET authoritative for the click-driven start.

---

## 4. Edge cases (enumerated — tests must cover)

1. **Anchor set while no narration active** (e.g., click while paused/stopped): consume
   must NOT fire until audio actually advances past it during playback. Guard: consume
   rides on the audio word-advance, which doesn't tick when stopped.
2. **Anchor set then immediately superseded by a new selection:** the new SET overwrites
   the value; consume keys off the *current* anchor value, so the superseded value is
   gone and never wrongly consumed. No special handling — but assert it.
3. **Anchor consumed mid stop-and-reseed (rate change) window:** consume is idempotent
   (null check). A rate-change reseed that happens after consume sees a null anchor and
   uses live progress — correct. A rate change *before* the anchor is consumed should not
   pre-empt the anchor's start role; in normal forward play the anchor is consumed at the
   first advance, which precedes any user rate change. Assert idempotency.
4. **`heardFloor` null at resume (cold engine):** out of scope for the *clear* logic, but
   relevant to whether A4 fully passes — the cold-start seed path is PAUSE-RESUME-UNIFY-1's
   territory. INTENT-CURSOR-1's job is to ensure the anchor is null by then; if it is, the
   cold seed falls through to live/persisted progress instead of the stale click.
5. **A1 exact-start preserved:** anchor fresh at click → first chunk starts at the clicked
   word → consume fires only on advance to the next word. Assert A1 regression (start at
   clicked word, then anchor null after advance).

---

## 5. Success criteria mapping (for Solon/Plato/Live-QA)

| Spec criterion | How this design satisfies it |
|---|---|
| A1 still PASS | SET + ACTIVE-skip untouched; CONSUME uses strict `>` so the clicked word is honored before consume. |
| `resumeAnchor` CONSUMED on first advance past it | New consume check in the reader-owned word-advance path, `> anchor`, nulls + logs `resumeAnchor:consumed`. |
| Progress persistence restored on consume | Nulling the anchor flips `hasResumeAnchor` false → existing `:1276–1282` gate re-enables progress-save. (No separate branch — verify the gate re-reads the ref live.) |
| A4 measured | Live-QA: pause→resume 3× returns to heard position, not the click. Reports 3-of-3 or partial → sizes PAUSE-RESUME-UNIFY-1. |
| Single-writer / SRL-073 | CLEAR executes only in the reader-layer owner; consume is idempotent; transition tests prove clear-on-advance + no-op when already null. |

---

## 6. Scope boundaries (what Athena must NOT do)

- Do **not** modify the cold-start seed priority chain in `useNarration` — that is
  PAUSE-RESUME-UNIFY-1 (position 2). INTENT-CURSOR-1 only makes the anchor null at the
  right time so that sprint's seed sees a clean state.
- Do **not** touch `applyRateChange` seeding — that is A5-RATE-RESEED-1 (position 3).
- Do **not** add new anchor SET sites or new uncontrolled writers.
- Do **not** delete the existing `:1353` explicit-clear — it stays as a distinct path.
- Keep the DIAG instrumentation flag-gated (off in production); reuse `dualSourceDiag`
  helpers for the `resumeAnchor:consumed` emit.

---

## 7. Edit-site summary (re-grep all line numbers at execution per SRL-086/SRL-087)

- `src/hooks/useNarration.ts` — emit/route the per-word advance signal the reader layer
  consumes (preferred: reuse existing `onWordAdvance` plumbing; fallback: add a callback prop).
- `src/components/ReaderContainer.tsx` — execute the CONSUME clear (strict `> anchor`) in
  the word-advance handler; add the CLEAR-on-fresh-start backstop; keep `:1353`, `:1259`,
  `:1382`, `:1276–1282` behavior intact (consume just flips the gate input).
- `src/hooks/useDocumentLifecycle.ts` — if the clear executes here, expose a consume/clear
  path; otherwise declaration/SET participate unchanged.
- `tests/narrateIntentCursor.test.ts` (new) — CONSUME fires on first advance past anchor;
  anchor null after consume; A1 regression (start at clicked word); pause→resume no longer
  re-seeds from a stale anchor; idempotency; superseded-anchor; consume-while-stopped no-op.
```
