# Narrate Cursor / Reading-Window Sync — Problem, Evidence, Hypothesized Solution

**Status:** Diagnosis complete; fix dispatched (NARRATE-SUBSCRIBER-CURSOR-1, Wave A)
**Date:** 2026-05-31
**Owner:** Cowork (diagnosis) → Claude Code CLI (implementation)
**Primary sources:** live-QA rounds captured in `NARRATE-DUAL-SOURCE-DIAG-1-*`, `NARRATE-CURSOR-TRACKING-DIAG-1.md`, `NARRATE-DUAL-SOURCE-FIX-b1138f4-liveqa-gate-report.md`, `NARRATE-A5-RATE-RESEED-liveqa-gate-report.md` (all in this folder). Engineering rules: `LESSONS_LEARNED.md` LL-126, LL-127, SRL-070.

---

## 1. Problem

During Narrate (TTS) playback, the visual word highlight ("the cursor") and the reading window do not stay synchronized with the audio the user actually hears. Concretely, three coupled symptoms:

1. **The cursor leads the voice and the lead grows.** The highlighted word is ahead of the word being spoken, and over a long read the gap widens until the highlight is running well ahead of the audio.
2. **The reading window runs ahead too.** View-follow keeps the highlighted word on screen, so because the highlight leads, the window scrolls ahead of where the listener is.
3. **Once the user scrolls, the window stops following.** Manual scroll detaches view-follow; the highlighted word parks off-screen and the window no longer tracks narration until the user clicks "Return to reading."

The net user experience: "the cursor is way ahead of the narration," and "the reading window isn't following the narration" (Evan, live-QA 2026-05-31).

This has survived multiple fix attempts (see §4), which is why it is being closed with a **measured** verdict rather than another guess.

### What this problem is NOT (separable defects, tracked elsewhere)

- **A4 — resume jumps to the last hard-selection.** On pause→resume, narration restarted at the last clicked word rather than the pause point (reader-layer resume anchor never cleared). Tracked under NARRATE-PAUSE-RESUME-UNIFY-1 / anchor-clear. Reproduced on *The Raven*; did **not** reproduce on *Meditations* (see §3), so it is state/branch-dependent and is a distinct mechanism from the steady-state lead.
- **A5 — overlapping audio on a rate increase.** Changing speed up to **1.4x** produces overlapping ("jumbled") audio; 1.2x/1.3x are clean. A single bad Kokoro tempo bucket fails to cancel the prior bucket's queued audio. Tracked under NARRATE-APPLYRATECHANGE-COLLAPSE-1.

These are real but separate; the core sync problem is the lead/drift of the cursor and window described above.

---

## 2. The candidate signals

Narration position can be read from several signals. The investigation instrumented them (DEV-only `DIAG` flag in `useNarration.ts` and `audioScheduler.ts`, emitting `[NARR-DIAG]`/`[SCHED-DIAG]` events plus a `signal-leadlag-summary` on pause):

| Signal | Meaning | Role |
|--------|---------|------|
| `schedulerActiveWord` | word the audio scheduler currently considers active | leading edge of the schedule |
| `heardFloor` | *intended* lower bound of what has been heard | (see evidence — mislabeled) |
| `wordIndex` | last word-advance target = the visible cursor | drives the highlight |
| `nextGenWordIndex` | generation / pre-fetch frontier | far ahead; pre-renders the book |
| `resumeTarget` | resume anchor target | only set at resume |
| `subscriberCursor` | cursor published to subscribers (NARRATE-SUBSCRIBER-CURSOR-1) | not yet wired |

---

## 3. Evidence

All perceptual verdicts are Evan's ear/eye (SRL-070: scheduler-derived logs are not sync evidence on their own). Telemetry is from the live `signal-leadlag-summary`, measured as lead/lag **relative to `schedulerActiveWord` (baseline 0)**.

### 3.1 Cursor-tracking trace (Meditations, n=191 and n=716 samples)

| Signal | Lead/lag vs scheduler (median; range) | Interpretation |
|--------|----------------------------------------|----------------|
| `heardFloor` | **0 / 0 / 0** (both runs) | **Identical to `schedulerActiveWord`.** Despite the name, NOT a lower bound of heard audio. |
| `wordIndex` (visible cursor) | **−2** (n=191), **−4** (n=716); range −11..0 | Lags the leading edge, **never leads it**. Closest signal to the ear. |
| `nextGenWordIndex` | **+913** / **+1369** (max +2351) | Pre-fetch frontier, far ahead of audio. |
| `resumeTarget` | `no-data` in steady state | Only set at the resume instant. |
| `subscriberCursor` | `no-data` | Channel not populated during playback. |

**Perceptual anchor (the decisive measurement):** with the highlight visibly tracking, Evan reported the **highlight is ahead of the voice** ("the word highlights before I hear it"), worsening to **"running way ahead of narration"** by ~700 samples. Because `wordIndex` (the highlight) already leads the ear, and `schedulerActiveWord` ≡ `heardFloor` sit *further* ahead of `wordIndex`, **every instrumented signal leads the heard audio, and the lead grows over time.** The true heard position is behind all of them.

**Hypothesis result:** the standing hypothesis that `schedulerActiveWord` best tracks heard audio is **REFUTED**. It is a self-referential cluster — the signals agree with each other (tight lead/lag) while all disagreeing with the ear (LL-127).

### 3.2 View-follow behavior (Meditations, cycle c)

Scrolling away during playback **detached** view-follow: the cursor stayed coupled to the audio (parked off-screen) and a "Return to reading" affordance appeared. View-follow did **not** pull the cursor ahead — it is a passive follower of the cursor, re-attached manually. So symptom #3 (window stops following after scroll) is the designed detach behavior; symptom #2 (window runs ahead) is a consequence of the window following the ahead-running cursor, not an independent view-follow bug.

### 3.3 Rate-change interaction (cycle b, and A5 round)

A mid-playback WPM change **broke cursor tracking and skipped the position forward** toward `nextGenWordIndex` (the frontier), advancing through chapters with no word-advance events. The later A5 round confirmed the position-seed was fixed (reseed from heard position → no skip/silence, 3-of-3), leaving only the 1.4x-bucket overlap. This is evidence that **`nextGenWordIndex` must never be a position authority** and that reseed/seed paths must use the heard position.

### 3.4 Existing lag constant

`audioScheduler.ts` already defines `TTS_TRUSTED_CURSOR_LAG_MS = 350` ("the real Electron/WASAPI pipeline latency is ~350ms"). Yet the visible cursor still leads (§3.1). Conclusion: the compensation is applied to audio scheduling truth but the **visible-cursor / view-follow path consumes an uncompensated leading signal** (`wordIndex` derived from the scheduler boundary, or `schedulerActiveWord` directly).

---

## 4. Why prior fixes failed (context)

- **`fcea6a8`** swapped the cursor source to `highlightedWordIndex`/anchor state without proving that signal updates on every narration boundary → the cursor **froze** (stopped responding). Reverted at `ff70793`.
- **`b1138f4`** added a `resumeAnchor:consumed` clear, but it fires reactively *after* audio has already passed the clicked word — too late to prevent the A4 jump. (Relevant to A4, not the steady-state lead.)
- **Standing theory** blamed React state batching (`WORD_ADVANCE → reducer → render`) for the lead. The trace shows that lead is **real but second-order** — it is dominated by the ~350ms audio-pipeline lead. Removing React alone would not put the cursor on the heard word.

Each attempt guessed the signal/mechanism. The DIAG trace replaced the guess with a measurement.

---

## 5. Root cause

**Every position signal in the pipeline sits ahead of the sound leaving the speakers, by approximately the audio-output latency (~350ms WASAPI), and the lead accumulates over a long read.** The visible highlight is driven by one of those ahead-running signals with **no lag compensation applied to the visual path**, and the reading window follows the highlight — so both run ahead of the heard word. `heardFloor` is mislabeled (equals `schedulerActiveWord`) and cannot serve as the heard-position reference; `nextGenWordIndex` is the prefetch frontier and is far worse.

---

## 6. Hypothesized solution

**Publish a single lag-compensated "heard cursor" and drive both the visible highlight and the reading-window follow from it.**

1. **Compute the heard cursor** = the actually-playing audio position pulled back by the output-pipeline latency (`TTS_TRUSTED_CURSOR_LAG_MS` ≈ 350ms, tunable). It must be derived from the playing source's current sample offset, not from `schedulerActiveWord`/`heardFloor` (which lead) and not from `nextGenWordIndex` (frontier).
2. **Single source of truth for visuals.** Both consumers read this one cursor:
   - the visible highlight, and
   - the reading-window follow (`FlowScrollEngine.followWord`).
   The window therefore tracks the heard word, not the ahead-running scheduler.
3. **Lag compensation is the primary fix.** Retiring `WORD_ADVANCE`/React state (the original NARRATE-SUBSCRIBER-CURSOR-1 thrust) removes the smaller, second-order batching lead and is a worthwhile cleanup, but it is **not sufficient on its own** and is sequenced as a follow-on, not the headline fix.
4. **Tune by ear.** After wiring, re-run the cursor-tracking gate; if the cursor still leads slightly, adjust the lag constant. This is a convergent knob, not an open-ended search.

### Implementation plan (NARRATE-SUBSCRIBER-CURSOR-1, amended)

- **Wave A — Aristotle, read-only design memo (dispatched):** enumerate every remaining `cursorWordIndex` *audio* reader (file:line); specify the lag-compensated heard-cursor value and how the 350ms is applied; specify both consumers (highlight + `FlowScrollEngine.followWord`); recommend the wave split; address the imperative-DOM-mutation reconciliation hazard.
- **Wave B — lag-compensated visual cursor + view-follow (ships first):** point the highlight and the window-follow at the heard cursor. Does **not** require touching reducer state, so it can land independently and is the change that actually resolves the user-visible desync.
- **Wave C — `WORD_ADVANCE`/reducer removal (gated):** only after Wave A confirms no audio path still reads `cursorWordIndex`; otherwise gate on NARRATE-APPLYRATECHANGE-COLLAPSE-1 (which removes the last audio readers).

### Verification

Re-run the cursor-tracking live-QA gate on a long prose doc: highlight sits on the heard word with no growing lead (Evan's ear), and the reading window keeps the heard word on screen without running ahead. PASS closes the cursor/window sync line.

---

## 7. Related work / sequencing

| Item | Sprint | Relationship |
|------|--------|--------------|
| Cursor lead + window follow (this doc) | NARRATE-SUBSCRIBER-CURSOR-1 (Seq 1, Wave A dispatched) | **The fix.** |
| A4 resume → last hard-selection | NARRATE-PAUSE-RESUME-UNIFY-1 (anchor-clear) | Separate; preventive reader-anchor clear. |
| A5 1.4x overlap on rate-up | NARRATE-APPLYRATECHANGE-COLLAPSE-1 | Separate; cancel prior-tempo queued sources on rate increase. Also removes last `cursorWordIndex` audio readers (unblocks Wave C). |

---

## 8. One-paragraph summary

Narration's highlight and reading window run ahead of the heard audio and drift further over time because every position signal the visuals can read (`schedulerActiveWord`, the mislabeled `heardFloor`, and the visible `wordIndex`) sits ahead of the speaker output by ~the 350ms audio pipeline latency, and the visual path applies no lag compensation; the window simply follows the ahead-running highlight. The fix is to publish one lag-compensated heard cursor (playing-audio position minus ~350ms) and drive both the highlight and the window-follow from it, ship that ahead of the larger `WORD_ADVANCE`/reducer cleanup, and tune the lag by ear. Two adjacent defects — resume jumping to the last hard-selection (A4) and overlapping audio when speeding up to 1.4x (A5) — are real but separate and are tracked in their own sprints.
