# Narration Dual-Source ULTRATHINK — Architectural Analysis

**Date:** 2026-05-29
**Trigger:** Live-QA gate against NARRATE-CLOSED-LOOP-CURSOR (branch `sprint/narrate-closed-loop-cursor`, commit `0f1b2c8`) returned **A4 FAIL** (play→pause→play restarts from book beginning) and **A2 PARTIAL** (minor skip-ahead, much tighter than before — growing-vs-constant clarifier pending). Evan asked: *"Why can't we tie the anchor word to narration and have the cursor be a simple, shallow aesthetic and nothing more? Why do we have two mechanisms driving narration progress here?"*
**Protocol:** ULTRATHINK (deep reasoning, first-principles, exhaustive depth, full validation architecture).
**Disposition:** **Hypothesized** dual-source race (pending DIAG-1 empirical validation); full unification spec'd as 5 sprints (NARRATE-DUAL-SOURCE-DIAG-1 → INTENT-CURSOR-1 → PAUSE-RESUME-UNIFY-1 → APPLYRATECHANGE-COLLAPSE-1 → SUBSCRIBER-CURSOR-1). NARRATE-CLOSED-LOOP-CURSOR superseded.

**Revision note (2026-05-29, post adversarial review):** The original draft of this document used "Confirmed" in the disposition above. An adversarial review of the dispatch package (2026-05-29) correctly observed that the dual-source diagnosis is an architectural inference, not a measurement — no instrumented log has yet shown "at the moment of failure, code path X read ref Y with value Z." DIAG-1 exists precisely to convert the inference to measurement. Disposition softened to "Hypothesized." See §"Revisions from adversarial review" at the end of this document for the full list of corrections.

---

## Executive verdict

The narration subsystem maintains **two independently-updated representations of "where narration is"** — a React-state `cursorWordIndex` (drives UI, batched ~16–50ms) and a closure-scope `lastConfirmedAudioWordRef` (drives audio scheduling, audio-clock-aligned ~50ms) — and reconciles them with a calibration constant (`TTS_TRUSTED_CURSOR_LAG_MS = 450ms`). Every live-QA failure observed to date (A2 lead, A3 omission, A4 reset-to-start, A5 rate-change skip) is *consistent with* this dual-source coupling — but the mechanism has not been measured per code path. The unification primitive (`getHeardPositionWordIndex` / `getHeardFloorWordIndex` at `audioScheduler.ts:521,1036`) was introduced by NARRATE-CLOSED-LOOP-CURSOR and is consumed in **2 call sites on main as of 2026-05-29** (line 1202 inside `speakNextChunkKokoro` for the re-entry seed AND line 1950 inside `resume`'s handoff-pending branch for the handoff-resume seed) — partially deployed, not fully wired. Three more call-site categories still seed audio decisions from `cursorWordIndex`, `nextGenWordIndexRef`, or `nextKokoroExactStartRef` — pause/resume (the bare-resume branch and the cursor-mismatch branch), rate change (**6 per-engine/debounce branches** in `applyRateChange`, grep-verified — the prior "14" figure in this document was an over-count propagated from codex-parent's dispatch summary), and click-to-narrate's separate-anchor mechanism. The fix is structural: route every audio-decision read through the heard-position oracle and demote the cursor from "scheduling participant" to "visual + intent representation."

Evan refined the framing during the analysis: **two cursor types** with explicit authority semantics — a **subscriber cursor** (pure pipeline mirror, single-writer = audio scheduler callback) and an **intent cursor** (user-override with lifecycle SET → ACTIVE → CONSUMED → CLEARED). The intent cursor supersedes the subscriber when active, then yields back. This eliminates the "which write was authoritative?" ambiguity that's currently spread across `WORD_ADVANCE` dispatch + `nextKokoroExactStartRef` + `resyncToCursor`.

---

## Architecture map (per Explore agent reading)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ReaderContainer (React)                     │
│  - highlightedWordIndex (visual cursor in Flow/Narrate)            │
│  - isNarrating (mode flag)                                          │
│  - applyNarrationActiveWord (callback: sets visual state)          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    useNarration Hook (React)                        │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ Core Narration State (React reducer)                          │   │
│ │  - cursorWordIndex: UI anchor (highlighted to user) ← STATE   │   │
│ │  - status: idle | speaking | paused | warming | error         │   │
│ │  - speed, engine, generation IDs                              │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│ ┌──────────────────────────────────────────────────────────────┐   │
│ │ Audio Authority Refs (closure refs, no React batching)        │   │
│ │                                                                │   │
│ │  ╔═ AUDIO SOURCE OF TRUTH (line 187) ═══════════════════════╗ │   │
│ │  ║ lastConfirmedAudioWordRef: number                          ║ │   │
│ │  ║   - Updated ONLY by scheduler onWordAdvance callbacks      ║ │   │
│ │  ║   - "What the audio is currently speaking or has spoken"   ║ │   │
│ │  ╚════════════════════════════════════════════════════════════╝ │   │
│ │                                                                │   │
│ │  nextGenWordIndexRef: number (line 188)                       │   │
│ │    - "Next word the pipeline will generate"                   │   │
│ │    - Used to seed speakNextChunkKokoro() — STALE during play  │   │
│ │                                                                │   │
│ │  nextKokoroExactStartRef: number (line 199)                   │   │
│ │    - "Secret cursor" for click-to-narrate exact-start         │   │
│ │    - Only set by resyncToCursor()                             │   │
│ │    - Lifecycle: set → consumed by first boundary → cleared     │   │
│ │                                                                │   │
│ │  kokoroBoundaryGateRef (line 191-197)                         │   │
│ │    - Stale boundary rejection gate                            │   │
│ └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ▼ AudioScheduler closure (audioScheduler.ts ~1074 lines)           │
│                                                                     │
│  getHeardPositionWordIndex() / getHeardFloorWordIndex (line 1036)   │
│    - THE UNIFICATION PRIMITIVE — already exists, only used once     │
│    - Returns audible position derived from chunk metadata + clock   │
│    - Lag (450ms) consumed here; no need to propagate elsewhere      │
└─────────────────────────────────────────────────────────────────────┘
```

### Source-of-truth table

| Concept | Variable | Storage | Writer | Reader | Cadence |
|---|---|---|---|---|---|
| User-visible position | `cursorWordIndex` (React state) | Reducer | dispatch({WORD_ADVANCE}) | UI render, ReaderContainer | React-batched ~16–50ms |
| Audio-confirmed position | `lastConfirmedAudioWordRef.current` | Closure ref | scheduler onWordAdvance | speakNextChunkKokoro | Audio-clock ~50–100ms |
| Pipeline production marker | `nextGenWordIndexRef.current` | Closure ref | pipeline onChunkProduced | speakNextChunkKokoro | Sporadic (chunk gen) |
| Heard position floor | `scheduler.getHeardFloorWordIndex()` | Computed | n/a (oracle) | One re-entry site only | Continuous query |
| Click-to-narrate target | `nextKokoroExactStartRef.current` | Closure ref | resyncToCursor | speakNextChunkKokoro boundary gate | User interaction |
| Scroll position (EPUB) | `foliateFractionRef.current` | Closure ref | foliate callbacks | Progress save | Per-scroll event |

---

## Lifecycle enumeration — current vs two-cursor model

For each narration lifecycle stage: what fires now, where the dual-source race lives, how the two-cursor model resolves it.

### Stage 1 — Cold start (idle → narrating from saved position)

- **Current:** Press Play → `play()` → reducer RESUME → `speakNextChunkKokoro(startIdx = cursorWordIndex)`. `cursorWordIndex` hydrates at mount from persistent anchor (`cfi` → globalWordIndex).
- **Races:** Hydration race (play before cursor hydrates → seed 0 → restart from book start). Stale-cursor race (last `WORD_ADVANCE` may have been batched out at last session end).
- **Two-cursor:** Hydration sets intent cursor. `getNextChunkSeed()` reads `intent ?? resumeTarget ?? subscriber ?? 0`. First onWordAdvance consumes intent. Hydration race eliminated.

### Stage 2 — Steady-state (chunk → chunk within section)

- **Current:** onWordAdvance writes `lastConfirmedAudioWordRef` AND dispatches `WORD_ADVANCE` → cursor render. onChunkBoundary → speakNextChunkKokoro reads `heardFloor ?? nextGenWordIndexRef`.
- **Races:** Cursor lag race (A2 — React-batched render trails audio clock). Pre-fetch gap (pipeline 30–130 words ahead of audible).
- **Two-cursor:** onWordAdvance writes ONLY to `subscriberCursorRef`. Visual highlight subscribes via direct callback (bypasses React batching). Lag compensation consumed once inside heard-floor computation; doesn't propagate.

### Stage 3 — Section/stanza handoff

- **Current:** Handoff trigger may fire on produced position (or accelerated position). If pipeline at 600 but audible at 480 mid-tail, handoff cuts tail. A3 critical area.
- **Races:** Handoff fires on wrong position axis.
- **Two-cursor:** Handoff reads from subscriber only. `subscriber >= sectionEndWordIndex` is the only valid trigger condition. Codex-parent's separate handoff-trigger sprint becomes mechanical once the only public position read is subscriber.

### Stage 4 — Pause

- **Current:** `pause()` halts RAF tick. `lastConfirmedAudioWordRef` holds last word. **No explicit resume target captured.** `cursorWordIndex` may be 1–3 words stale from late `WORD_ADVANCE`.
- **Races:** Resume seed ambiguity. Persistent-anchor save race.
- **Two-cursor:** Pause captures `getHeardFloorWordIndex()` into `resumeTargetRef`. Single resume-truth.

### Stage 5 — Resume (after pause, no user action)

- **Current (corrected 2026-05-29 post adversarial review):** `resume()` has THREE structurally distinct branches at lines 1910 / 1946 / 1976 in `useNarration.ts`:
  - **(a) Cursor-mismatch branch (~1910):** if caller passes a `currentWordIndex` different from `s.cursorWordIndex`, the function stops all strategies, reseeds `lastConfirmedAudioWordRef` and `nextGenWordIndexRef` to the new index, and calls `speakNextChunkRef.current()` to restart generation.
  - **(b) Handoff-pending branch (~1946):** if `handoffPendingRef.current === true`, the function captures `getHeardFloorWordIndex()` BEFORE stopping (the NARRATE-CLOSED-LOOP-CURSOR work), reseeds from `max(handoffHeardFloor, cursor)`, and calls `speakNextChunkRef.current()`.
  - **(c) Bare-resume branch (~1976):** the default pause-point resume path. Does NOT call `speakNextChunkKokoro` at all. Calls `kokoroStrategy.resume()` (line 1983) directly — un-suspends the AudioContext and re-snaps the cursor from existing scheduler state.
- **Races and likely-A4-mechanisms (now branch-specific):**
  - In branches (a) and (b): A4 *could* fire via the same dual-source race as elsewhere — the reseed reads from cursor/nextGen-style refs which may be stale or null-fallback to 0.
  - In branch (c): A4 cannot fire through "stale seed" since no reseed happens. If A4 fires through bare resume, it's a DIFFERENT mechanism — likely either `kokoroStrategy.resume()` itself failing to find the suspended AudioContext's playback position (audioCtx lifecycle issue?) OR scheduler state having been cleared during pause such that resume restarts from chunk 0.
- **Two-cursor target:** Resume reads from `resumeTargetRef` (captured at pause, Stage 4). Single source. **But if A4 fires through branch (c)'s mechanism, the two-cursor `resumeTargetRef` capture alone may not fix it** — branch (c) doesn't currently call `speakNextChunkKokoro`, so the seed-priority chain doesn't get a chance to apply. PAUSE-RESUME-UNIFY-1's design needs to confirm whether the right fix is "make bare-resume also go through restartGeneration(reason='resume')" (which would unify the 3 branches into one) or "leave bare-resume as-is and trust AudioContext.resume() — only fix branches (a) and (b)." DIAG-1 must distinguish which branch A4 actually fires through so PAUSE-RESUME-UNIFY-1 can address the correct mechanism.

### Stage 6 — Click-to-narrate while paused

- **Current:** Click → `commitSharedWordAnchor` → `resyncToCursor` → sets `nextKokoroExactStartRef`. Pipeline restarts at clicked word on next play.
- **Races:** Two-step write (cursor + secret cursor) can diverge if mid-batch.
- **Two-cursor:** Click writes intent. Visual highlight updates immediately (intent has visual priority when set). Play → pipeline seeds from intent → first advance consumes intent → subscriber takes over.

### Stage 7 — Click-to-narrate while playing

- **Current:** `resyncToCursor` mid-play. Stop → restart. RAF tick race between stop and restart.
- **Races:** Late onWordAdvance from old chunk may update `lastConfirmedAudioWordRef` past intended click position.
- **Two-cursor:** Click writes intent. Pipeline gracefully stops at current chunk end, restarts at intent. During the restart window: subscriber stays at last audible (truthful), intent shows where audio is going (truthful and explicit). No race with the in-flight chunk's remaining word advances.

### Stage 8 — Rate change while playing

- **Current:** 14 paths in `applyRateChange` (`useNarration.ts:1722-1871`). Each engine + debounce variant duplicates stop-and-reseed. Kokoro path uses heard-floor seed (correct); some non-Kokoro paths reseed from `cursorWordIndex`.
- **Races:** Multi-path duplication. Stop-and-reseed window. A5 evidence.
- **Two-cursor:** Single `restartGeneration(reason)` helper. Always seeds from subscriber. Non-Kokoro paths deleted per Kokoro-only constraint. 14 → 1.

### Stage 9 — Rate change while paused

- **Current:** Update rate; defer restart to next resume. Carries Stage 5 ambiguity.
- **Two-cursor:** Stash new rate; on resume, `resumeTargetRef` is the seed. Clean.

### Stage 10 — Voice change

- **Current:** Same multi-path pattern as Stage 8.
- **Two-cursor:** Same `restartGeneration(reason)` helper with voice parameter to Kokoro.

### Stage 11 — End-of-document

- **Current:** Last chunk → END_OF_BOOK. Cursor stays at last word. Clean.
- **Two-cursor:** Identical. Subscriber at last word, intent cleared, persistent anchor saved from subscriber.

---

## Cross-stage conflict map

| Race | Stages | Root cause | Two-cursor fix |
|---|---|---|---|
| Stale cursor read at restart | 4,5,6,7,8,10 | React batching + cursor as scheduling input | Intent / subscriber / resumeTarget, each single-writer single-purpose |
| Multi-source seed resolution | 5,6,8 | Five competing refs, no canonical priority | One priority chain `intent → resumeTarget → subscriber` |
| `heardFloor` returns null at restart | 5,8,10 | Scheduler closure cleared on pause | `resumeTargetRef` captures heardFloor BEFORE pause clears state |
| Produced-vs-audible gap reads | 2,3 | `nextGenWordIndexRef` exposed as fallback | Retire `nextGenWordIndexRef` from any public read |
| Stop-and-reseed race window | 7,8,10 | Late RAF tick after stop() but before reseed | Drain onWordAdvance into transient holding ref during stop; commit only when new chunk's first advance fires |
| `nextKokoroExactStartRef` left stale | 5,6,7 | Mutated by click-to-narrate, not always cleared | Retired; intent cursor's CONSUME lifecycle handles it |

---

## Two-cursor structural target (pseudocode)

```typescript
// === REFS (closure-scope, no React state) ===

const subscriberCursorRef = useRef<number | null>(null);
//   Single-writer: audioScheduler.onWordAdvance callback
//   Single-purpose: "what word is currently audible right now"
//   Single-reader contract: visual highlight + any subscriber

const intentCursorRef = useRef<number | null>(null);
//   Single-writer: user action handlers (click, scroll-and-select, keyboard nav)
//   Single-purpose: "user wants narration here next"
//   Lifecycle: SET → ACTIVE → CONSUMED (first chunk's first advance) → null

const resumeTargetRef = useRef<number | null>(null);
//   Single-writer: pause() callback (captures heardFloor at pause time)
//   Single-purpose: "where to resume from after pause"
//   Lifecycle: SET on pause → consumed on resume → null

// === RETIRED ===
//   cursorWordIndex (React state) — POSITION removed; status/wpm/voice remain
//   lastConfirmedAudioWordRef — subsumed by subscriberCursorRef (renamed)
//   nextGenWordIndexRef (as public read) — internal to pipeline only
//   nextKokoroExactStartRef — subsumed by intentCursorRef
//   WORD_ADVANCE reducer action — removed (subscriber updates via direct callback)

// === SEED PRIORITY ===
function getNextChunkSeed(): number {
  return intentCursorRef.current
      ?? resumeTargetRef.current
      ?? subscriberCursorRef.current
      ?? 0;
}

// === UNIFIED RESTART (replaces 14 applyRateChange paths) ===
function restartGeneration(reason: 'rate-change'|'voice-change'|'click'|'resume'): void {
  kokoroStrategy.stop();
  const seed = getNextChunkSeed();
  speakNextChunkKokoro({ startIdx: seed, reason });
}

// === PAUSE / RESUME ===
function pause(): void {
  resumeTargetRef.current = audioScheduler.getHeardFloorWordIndex();
  kokoroStrategy.pause();
  reducer.dispatch({ type: 'PAUSE' }); // status only, not position
}

function resume(): void {
  reducer.dispatch({ type: 'RESUME' });
  restartGeneration('resume');
  resumeTargetRef.current = null;
}

// === CLICK-TO-NARRATE ===
function commitClickIntent(globalWordIndex: number): void {
  intentCursorRef.current = globalWordIndex;
  visualHighlight.set(globalWordIndex); // intent has visual priority when set
  if (status === 'speaking') restartGeneration('click');
}

// === STEADY-STATE WORD ADVANCE (callback from audioScheduler) ===
function onWordAdvance(wordIdx: number): void {
  if (intentCursorRef.current !== null && wordIdx < intentCursorRef.current) return; // stale from old chunk
  subscriberCursorRef.current = wordIdx;
  visualHighlight.set(wordIdx);
  if (intentCursorRef.current !== null && wordIdx === intentCursorRef.current) {
    intentCursorRef.current = null;
  }
}
```

---

## Validation architecture

### Minimal testable proposition
> *If every audio-decision call site is routed through `getHeardFloorWordIndex()` (subscriber chain), then A4 and A5 disappear without regressing A1 or A6.*

### Test design (NARRATE-DUAL-SOURCE-DIAG-1)
1. Instrument every audio-decision read with structured logging capturing all six candidate refs + path identifier.
2. Re-run live-QA gate (A1, A4, A5 at minimum) against instrumented build.
3. Read logs. Confirm failure cases correspond to code paths reading `cursorWordIndex` or `nextGenWordIndexRef` when `getHeardFloorWordIndex()` had the correct answer.
4. If confirmed → dispatch N2–N5 as spec'd. If refuted → respec.

### Cost-benefit
- Cost of test: 1 day (Aristotle + Hercules + Hippocrates + Evan live-QA + Aristotle analysis)
- Cost of acting without test: 4 sprints committed to a fix that may not match the actual bug
- Cost of NOT acting (Option A calibration trajectory): indefinite tuning of `TTS_TRUSTED_CURSOR_LAG_MS`; A4 unfixable by calibration

The test is decisive. Run it first.

---

## Lessons surfaced (candidates for SRL-080+)

1. **Half-step refactors leave residual coupling.** NARRATE-CLOSED-LOOP-CURSOR introduced `getHeardPositionWordIndex` but consumed it in only one call site. The architecture is "aware of the unification problem but never finished migrating." Future refactors should declare the complete consumer set up front, not just the first call site.
2. **Dual sources hidden behind compensation constants.** `TTS_TRUSTED_CURSOR_LAG_MS = 450ms` is genuine physics (hardware output latency), but its propagation through `WORD_ADVANCE → reducer → render` was the bandaid sustaining the dual-source race. Compensation should be consumed once at the data source, not propagated through every downstream consumer.
3. **`*-AnchorRef` / `*-StartRef` proliferation is a code smell.** When you have `lastConfirmedAudioWordRef`, `nextGenWordIndexRef`, `nextKokoroExactStartRef`, and `cursorWordIndex` all claiming to represent "where we are," the system has lost its single-source discipline. Audit refs of similar shape periodically.
4. **Authority encoded in writer identity beats authority encoded in convention.** The two-cursor model works because *which cursor you wrote to* tells the reader who asserted the position. The old model required readers to interpret writes through context.
5. **Live-QA evidence trumps console metrics.** A2 looked fine in the boundary-drift telemetry; Evan's ear caught the lead. A4 produced healthy-looking scheduler logs while audio restarted at book start. SRL-070 vindicated.
6. **Prose synthesis is not a substitute for grep on quantitative claims (added 2026-05-29 post adversarial review).** The original draft of this document stated "14 reseed paths in applyRateChange" — a number propagated from codex-parent's dispatch summary ("~14 speakNextChunk call sites I noted but didn't fully trace") without independent grep. The actual count is 6. Similarly stated "consumed in exactly one call site" for the heard-floor oracle — actual is 2. An adversarial reviewer ground-truthed the file:line references and caught both. **Forward rule:** for any quantitative claim about the codebase that an architectural conclusion rests on (call-site counts, dispatch counts, reference counts), grep the source before publishing. Prose summaries from upstream agents are inputs; they're not citations.

---

## Revisions from adversarial review (2026-05-29)

An adversarial review of the dispatch package surfaced the following corrections, which have been folded into this document and the SK-N1 through SK-N5 specs in `ROADMAP.md`:

| Item | Original (in draft) | Corrected (post-review) | Source of truth |
|---|---|---|---|
| Disposition | "Confirmed dual-source race" | "Hypothesized dual-source race (pending DIAG-1 empirical validation)" | The diagnosis is an inference, not a measurement. DIAG-1 exists to make the measurement. |
| `getHeardFloorWordIndex` consumer count | "consumed in exactly one call site (line 1202)" | "consumed in 2 sites on main: line 1202 (re-entry seed) AND line 1950 (handoff-resume seed in `resume`'s handoff-pending branch)" | grep useNarration.ts |
| `applyRateChange` reseed branch count | "14 paths" | "6 per-engine/debounce branches" at lines 1759 (Kokoro bucket change), 1802 (Qwen), 1821 (Pocket), 1839 (Nano), 1853 (Web no-debounce), 1869 (Web debounced). A 7th Kokoro same-bucket-segmented branch does not call speakNextChunk. | grep + Read useNarration.ts:1722-1871 |
| Stage 5 lifecycle (resume mechanism) | "resume → speakNextChunkKokoro reads from {...}" — implied all resume paths go through speakNextChunkKokoro | Three structurally distinct branches: cursor-mismatch (~1910), handoff-pending (~1946) both call speakNextChunkRef.current(); BARE RESUME (~1976) calls `kokoroStrategy.resume()` DIRECTLY, does NOT go through speakNextChunkKokoro. A4 may fire through any of the three with different mechanisms. | Read useNarration.ts:1905-2000 |
| WORD_ADVANCE dispatch sites | "5 sites: ~lines 463, 972, 1073, 1159, 1313" | 6 sites: lines 463, 972, 1073, 1158, 1255, 1314 (line 1255 was missed; line numbers were off-by-one in 3 of 5 cited) | grep useNarration.ts |
| A4 baseline reproducibility | Implicit assumption: A4 reproduces on main | UNVERIFIED. A4 was observed only on the dissolved branch `sprint/narrate-closed-loop-cursor` commit `0f1b2c8`, which modified resume paths. May or may not reproduce on clean main v1.75.1. Recommended: 5-min repro check before DIAG-1 dispatch. | NARRATE-CLOSED-LOOP-CURSOR branch diff |
| Sprint 5 (SUBSCRIBER-CURSOR-1) direct-DOM approach | "Recommend (i) imperative DOM mutation" without addressing React reconciliation hazard | Aristotle's memo MUST address React-reconciliation hazard: imperative DOM mutations on React-controlled attributes can be reset by unrelated React re-renders. Choice of (i) vs (ii)/(iii) hinges on which DOM nodes/attrs are outside React's reconciliation surface. | Adversarial review §3 + §G5 |

**The reviewer's bottom-line disposition was "dispatch-ready after the Phase 1 spec-tightening pass."** That tightening pass is now folded in. The dispatch package is stronger for the review.

---

## References

- Live-QA records: `docs/studies/live-qa/2026-05-27_discovery_sweep.md`, `docs/studies/live-qa/2026-05-29_theme_sync_smoke.md`, `docs/studies/live-qa/2026-05-29_theme_sync_retest.md`. 2026-05-29 NARRATE-CLOSED-LOOP-CURSOR gate verdict captured inline in dispatch thread (A1 PASS, A4 FAIL, A2 PARTIAL).
- Existing architecture: `src/hooks/useNarration.ts` (~2278 lines), `src/utils/audioScheduler.ts` (~1074 lines), `src/utils/generationPipeline.ts`, `src/hooks/narration/kokoroStrategy.ts`, `src/constants.ts` (`TTS_TRUSTED_CURSOR_LAG_MS = 450`, `NARRATION_CURSOR_LAG_MS = 350`).
- Dissolved upstream: `sprint/narrate-closed-loop-cursor` commit `0f1b2c8` (preserved; superseded by this analysis's 5-sprint sequence).
- Standing rules invoked: SRL-060, SRL-068, SRL-069, SRL-070, SRL-072, SRL-073, SRL-074, SRL-079.
