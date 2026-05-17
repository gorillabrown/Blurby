# Phase Brief — 2026-05-17

## Phase: TTS Quality Confidence + Reading Experience v2

### Goal

Ship narration UX polish that users can feel (OS media controls, smarter pause/resume, smoother cursor) alongside quality regression infrastructure that prevents future regressions. The finish line is reached when narration feels professional-grade AND quality gates run in CI.

### Conveyor Belt (7 sprints, 2 tracks)

| Seq | Sprint | Title | LOE | Lane | Track |
|-----|--------|-------|-----|------|-------|
| 1 | NARR-MEDIA-1 | MediaSession Integration | S | A | Narration UX |
| 2 | NARR-PAUSE-1 | Named-Pause State Machine | M | A | Narration UX |
| 3 | NARR-CURSOR-2 | Silence-Aware Cursor Hold | S | A | Narration UX |
| 4 | TTS-EVAL-3 | Quality Evaluation + CI Gate | M | B | Quality |
| 5 | NARR-SPOKEN-1 | Spoken/Display Word Separation | M | A | Narration UX |
| 6 | UX-POLISH-1 | Library Cards + Command Palette + Space-Bar Mode | L | C | Reading Exp |
| 7 | TTS-QUAL-CI-1 | CI Regression Gate Wiring | S | B | Quality |

**Total LOE:** 15 points (3S + 3M + 1L = 3 + 9 + 8 - adjusted: S=1, M=3, L=8 → 3+9+8 = 20... using standard: S=1×3 + M=3×3 + L=8×1 = 3+9+8 = 20 points)

### Parallel Opportunities

- **NARR-MEDIA-1 ∥ TTS-EVAL-3** — Lane A and Lane B are independent; can dispatch simultaneously.
- **NARR-PAUSE-1 ∥ TTS-EVAL-3** — Same lane independence holds through Seq 1-4.
- **UX-POLISH-1 ∥ TTS-QUAL-CI-1** — Lane C and Lane B are independent at Stage 2.

### Dependencies

```
NARR-MEDIA-1 ──→ NARR-CURSOR-2 ──→ NARR-SPOKEN-1
                                          │
TTS-EVAL-3 ─────────────────────→ TTS-QUAL-CI-1
                                          │
UX-POLISH-1 (independent) ───────────────┘ (no hard dep)
```

### Buffer Health

- **Full specs:** 5 of 5 (NARR-MEDIA-1 through NARR-SPOKEN-1) — buffer HEALTHY
- **Stubs:** 2 (UX-POLISH-1, TTS-QUAL-CI-1) — will be promoted to full spec when buffer depletes
- **Queue depth:** GREEN (7)

### Key Risks

1. **MediaSession Electron support** — `navigator.mediaSession` works in Electron's Chromium layer but needs verification that metadata updates propagate to OS (Windows/macOS/Linux). NARR-MEDIA-1 spec includes a fallback path.
2. **Silence-aware cursor** — Depends on real word timestamps from Kokoro. If timestamp quality degrades for certain voices, cursor may jitter. NARR-CURSOR-2 spec includes a tolerance threshold.
3. **CI gate flakiness** — TTS-QUAL-CI-1 wires quality gates into GitHub Actions. Flaky timing-dependent tests could block PRs. Spec mandates p95 thresholds with 3-run averaging.

### Deferred Work (Not in This Phase)

- KOKORO-EXPORT-1 (long-form audio export) — worktree preserved, blocked until phase completes
- Registry-driven strategy dispatch — single-engine, unnecessary complexity
- Backpressure monitoring — deferred to post-v2.0
- Normalizer alignment map — deferred to post-v2.0
- M4B/SRT export formats — deferred to KOKORO-EXPORT-1

### Next Dispatch

**NARR-MEDIA-1** is ready for immediate dispatch. Branch: `sprint/narr-media-1-mediasession`. Can run in parallel with TTS-EVAL-3 (Lane B).

### Exit Criteria for This Phase

The finish line is reached when ALL of the following are true:
1. OS media controls work for narration (play/pause/skip via keyboard media keys and OS UI)
2. Pause/resume behavior is context-aware (named reasons, smart resume policy)
3. Cursor holds steady during natural speech silences (no jitter between words)
4. Punctuation-only display tokens don't produce phoneme alignment artifacts
5. Quality evaluation scores are computed and gates are enforced in CI
6. Reading experience UX improvements are shipped (library cards, command palette, space-bar mode)
