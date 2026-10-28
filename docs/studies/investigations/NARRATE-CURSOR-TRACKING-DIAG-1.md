# NARRATE-CURSOR-TRACKING-DIAG-1 — Cursor Tracking Signal Diagnostics (Investigation)

**Sprint:** NARRATE-CURSOR-TRACKING-DIAG-1
**Lane:** Lane B (Evaluation Harness) + diagnostics
**Spec:** `ROADMAP.md` → "NARRATE-CURSOR-TRACKING-DIAG-1 — Cursor Tracking Signal Diagnostics (Investigation)"

## Goal

Instrument all 7 candidate cursor-tracking signals so a live narration trace can rank which signal best tracks heard audio.

## Problem

Narration cursor sometimes leads or lags the heard word. We have 7 candidate signals but no empirical data on which best matches the audio the user actually hears. We cannot pick a winner by reasoning alone — we need a live trace.

## The 7 candidate signals

1. `schedulerActiveWord` — word index the audio scheduler currently considers active
2. `chunkPlayheadWord` — word derived from the playing chunk's playhead offset
3. `decodedFrontierWord` — last word whose audio has been decoded
4. `emittedWord` — last word emitted to the renderer
5. `wordAdvanceLatest` — most recent word-advance event target
6. `heardFloor` — lower bound of what has definitely been heard
7. `resumeTarget` — the resume anchor target

## Hypothesis (UNPROVEN — requires live trace)

`schedulerActiveWord` best tracks heard audio, but lead/lag versus the other six signals is unmeasured. The live trace decides.

## Diagnostics channel to reuse

Instrumentation rides on the existing diagnostics flag. Both `src/hooks/useNarration.ts` and `src/utils/audioScheduler.ts` declare a module-local `const DIAG = false` (matching the `NARRATE-DUAL-SOURCE-DIAG-1` pattern already in these files) — there is **no** `diagFlag.ts`/`isDiagEnabled()` indirection. To trace, set **both** constants to `true`; when `false` the compiler dead-code-eliminates every guarded branch (zero hot-path cost). Extend the existing `word-advance`, `chunk-start`, and `chunk-end` diagnostic events with the 7 candidate signals plus a high-resolution timestamp, and add a new `signal-leadlag-summary` event emitted on pause/stop (backed by a buffer bounded at `MAX_LEADLAG_SAMPLES = 5000`).

## Signal map (to be filled by live trace)

| Signal | Source location | Expected behavior | Current evidence (live trace 2026-05-31, Meditations, lead/lag vs `schedulerActiveWord`) |
|--------|-----------------|-------------------|------------------|
| schedulerActiveWord | audioScheduler.ts | Tracks active playback word | **Baseline (offset 0).** Per Evan's ear, the cluster anchored here **LEADS** the heard voice and drifts further ahead over long playback ("running way ahead of narration" at ~700 samples). Not a heard-audio tracker. |
| chunkPlayheadWord | audioScheduler.ts | Derived from playhead offset | Not independently surfaced in `signal-leadlag-summary` (only `schedulerChunkBoundary` appears in `chunk-start/end`); effectively folded into `schedulerActiveWord`. |
| decodedFrontierWord | audioScheduler.ts | Last decoded word | Surfaced as **`nextGenWordIndex`**: median **+913** (cycle a, n=191) / **+1369** (cycle c, n=716), max **+2351** ahead. Pre-fetch/generation frontier, far ahead of audio. A mid-playback WPM change reseeds toward here → forward skip (cycle b). **Dangerous as an authority.** |
| emittedWord | useNarration.ts | Last word sent to renderer | Surfaced as **`wordIndex`** (the visible-cursor / word-advance target): median **−2** (a) / **−4** (c), range −11..0 vs scheduler — lags the leading edge, never leads it. **Closest signal to heard audio**, but per ear still leads the voice. |
| wordAdvanceLatest | useNarration.ts | Latest word-advance target | Same channel as `emittedWord` (`wordIndex`); lags `schedulerActiveWord` by ~2–4 words. |
| heardFloor | useNarration.ts | Lower bound of heard audio | min **0** / median **0** / max **0** vs scheduler in **both** runs → **IDENTICAL to `schedulerActiveWord`.** Mislabeled: it is NOT an independent lower bound of heard audio (it leads the ear exactly as much as the scheduler). Self-referential — do not trust as heard-audio evidence. |
| resumeTarget | useNarration.ts | Resume anchor target | **`no-data`** during steady playback (only set at the resume instant). Cycle (a) resume **held position** (continued from pause, no jump to click/anchor) — the A4 jump-back bug did NOT reproduce on this build/doc. |
| subscriberCursor *(NARRATE-SUBSCRIBER-CURSOR-1 candidate)* | useNarration.ts | Cursor published to subscribers | **`no-data`** in both runs — the subscriber-cursor channel is **not populated** during playback. Directly relevant to amending NARRATE-SUBSCRIBER-CURSOR-1 (see verdict). |

## Live trace results & verdict (2026-05-31, live-QA on Meditations, DIAG=true)

Method per SRL-070: every signal reading is paired with Evan's ear/eye — logs alone are not sync evidence. Three cycles run; `signal-leadlag-summary` captured on pause (n=191 and n=716).

### Ranked accuracy — closest to *heard audio* (best) → furthest (worst)

| Rank | Signal | Position vs scheduler | Position vs heard audio (ear) | Verdict |
|------|--------|-----------------------|-------------------------------|---------|
| 1 | `wordIndex` (emittedWord / wordAdvanceLatest = visible cursor) | −2 to −4 (lags edge) | Still **leads** the voice; drifts further ahead over long playback | Closest available, but **not** an accurate heard tracker |
| 2 | `schedulerActiveWord` ≡ `heardFloor` | 0 (baseline / identical) | **Leads** the ear more than the cursor; drift grows | Leading edge, not heard audio |
| 3 | `nextGenWordIndex` (decodedFrontierWord) | +913 / +1369 (max +2351) | Hundreds–thousands of words ahead | Pre-fetch frontier; **never** a position authority |
| — | `resumeTarget` | no-data in steady state | n/a (resume instant only) | Resume held position this run |
| — | `subscriberCursor` | no-data | n/a | Channel not populated |

### Hypothesis verdict — REFUTED

The hypothesis *"`schedulerActiveWord` best tracks heard audio"* is **refuted**. By ear, the visible cursor (and therefore `schedulerActiveWord`, which sits ~2–4 words *ahead* of the cursor) **leads** the spoken word, and the lead **grows** over a long run (Evan: "running way ahead of narration" at n≈700). No instrumented signal sits *at or behind* the heard word — the true heard position is **behind every captured signal**. `heardFloor` is the sharpest trap: it reads identical to `schedulerActiveWord` (0 offset in both runs), so despite its name it is **not** a lower bound of heard audio and must not be used as sync ground truth. This is a textbook self-referential-telemetry cluster (the signals agree with each other while all disagreeing with the ear).

### Authority verdict

- **Visible-cursor owner:** `wordIndex` (word-advance / emittedWord). It is the closest proxy to heard audio but leads by a growing margin — a **lag-compensated** cursor (e.g. `wordIndex` minus the ~350ms WASAPI pipeline lag, `TTS_TRUSTED_CURSOR_LAG_MS`) is required to actually sit on the heard word. Raw `schedulerActiveWord`/`heardFloor` are too far ahead.
- **Resume seed:** behaved correctly this run — resume continued from the pause point (no jump to click position or book start). `resumeTarget` is `no-data` in steady state, so resume authority could not be ranked against the other signals here; the A4 jump-back did not reproduce on Meditations.
- **Persistent anchor:** not exercised as a position authority this run (no resume jump observed); not the steady-state cursor owner.
- **View-follow owner:** the **view layer** follows the cursor only while attached. Manual scroll **detaches** view-follow (cursor stays coupled to audio, parked off-screen; "Return to reading" re-attaches). View-follow does **not** pull the cursor ahead — confirmed by ear/eye (cycle c). It is a passive follower, never a position authority.
- **Rate-change defect (cycle b):** a single mid-playback WPM change **breaks cursor tracking and skips the position forward** toward `nextGenWordIndex` (the pre-fetch frontier), running through chapters with no `word-advance` events. Confirms `nextGenWordIndex` must never seed position, and that the rate-change path needs the same heard-position seeding as resume.

### Recommendation for NARRATE-SUBSCRIBER-CURSOR-1

Publish a **lag-compensated heard cursor** to subscribers — `wordIndex` corrected by the known output-pipeline lag — NOT `schedulerActiveWord`/`heardFloor` (both lead the ear) and NOT `nextGenWordIndex` (frontier). The `subscriberCursor` channel was `no-data` this run, so the subscriber-cursor must be wired to that lag-compensated value and re-traced.

## WHERE (read order)

1. `src/utils/audioScheduler.ts` — `const DIAG = false` + `schedDiag()` emissions for chunk-start/chunk-end
2. `src/hooks/useNarration.ts` — `const DIAG = false` + `diag()` emissions for word-advance; lead/lag buffer + summary
3. `tests/narrationCursorTrackingDiag.test.ts` — new test file (31 tests)

## Success criteria

- All 7 signals captured in extended diag payloads
- `signal-leadlag-summary` event emitted on pause/stop
- Zero hot-path cost when DIAG disabled
- Full suite green + new tests
- Investigation doc updated with instrumentation status

## Status & deferred items (as of 2026-05-31)

- Instrumentation merged behind the module-local `DIAG = false` flag (one per file): extended `word-advance`, `chunk-start`, `chunk-end` payloads with all 7 candidate signals + `t: performance.now()`; new `signal-leadlag-summary` event on pause/stop with per-signal min/median/max vs `schedulerActiveWord`; lead/lag buffer bounded at `MAX_LEADLAG_SAMPLES = 5000`.
- Verification: full suite 3096 passing / 133 skipped (+31 new tests in `tests/narrationCursorTrackingDiag.test.ts`); `npm run build` and `npm run typecheck` green; Solon APPROVED (diagnostics-only scope); Plato READY after the buffer-bound fix (zero hot-path cost when DIAG off).
- DONE (live QA 2026-05-31): captured a live narration trace with DIAG enabled on Meditations; populated the signal-map "Current evidence" column, the ranked accuracy table, and the hypothesis + authority verdicts above. Hypothesis **refuted** — `schedulerActiveWord` (≡ `heardFloor`) leads the heard voice; `wordIndex` (visible cursor) is closest but still leads and drifts; `nextGenWordIndex` is the pre-fetch frontier; `resumeTarget`/`subscriberCursor` were `no-data`. DIAG flags reverted to `false` in both source files after the trace.
- DONE (governance, this close-out): sprint marked complete in ROADMAP.md and `docs/governance/sprint-queue.xlsx`; LESSONS_LEARNED winning-signal entry added; NARRATE-SUBSCRIBER-CURSOR-1 amended to publish a lag-compensated heard cursor.
