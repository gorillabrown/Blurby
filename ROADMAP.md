# Blurby — Development Roadmap

**Last updated**: 2026-05-17 — Roadmap review: TTS Architecture Complete finish line reached. All 10 conveyor sprints landed. Full phase archived. New finish line TBD.
**Current state**: v1.75.1 stable. Kokoro is the sole active local/cacheable model engine; Web Speech remains a platform fallback. MOSS-Nano and Pocket TTS are dormant/disabled; Qwen retired/disabled. Desktop v2.0 shipped.
**Finish line**: TTS Quality Confidence + Reading Experience v2 — narration UX polish + quality regression gates.
**Queue**: GREEN (depth 4). 2 full specs + 2 stubs. Next dispatch: NARR-CURSOR-2.
**Queue source of truth**: `docs/governance/sprint-queue.xlsx` is the authoritative FIFO sprint queue. Keep its Catalog and Dashboard tabs current after every dispatch/closeout.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Sprint closeout convention:** Unless a sprint explicitly says otherwise, every successful CLI sprint auto-merges: stage specific files, commit on sprint branch, merge to `main` with `--no-ff`, push, update governance docs and `docs/governance/sprint-queue.xlsx`.

---

## Completed Work Summary

| Sprint | Date | Result | Close-Out |
|--------|------|--------|-----------|
| KOKORO-DEEPEN-1 | 2026-05-11 | Kokoro readiness and preflight checks | — |
| KOKORO-DEEPEN-2 | 2026-05-11 | Natural chunk highlighting for Kokoro TTS | — |
| KOKORO-DEEPEN-3 | 2026-05-11 | Voice mixing feasibility study | — |
| TTS-REGISTRY-1 | 2026-05-12 | Provider capability truth in ttsProviderRegistry | `ROADMAP_ARCHIVE_2026-05-14.md` |
| TTS-NORMALIZE-1 | 2026-05-13 | English-first spoken-text normalization | `ROADMAP_ARCHIVE_2026-05-14.md` |
| TTS-CACHE-TIMING-1 | 2026-05-13 | Schema-versioned v2 cache identities and atomic timing sidecars | `CloseOut.TTS-CACHE-TIMING-1.2026-05-14.md` |
| TTS-SYNC-1 | 2026-05-15 | Centralized narration highlight sync policy | `CloseOut.TTS-SYNC-1.2026-05-15.md` |
| TTS-DIAG-1 | 2026-05-15 | Provider-neutral diagnostics bundle | `CloseOut.TTS-DIAG-1.2026-05-15.md` |
| ENGINE-DORMANCY-1 | 2026-05-16 | Disabled dormant sidecar engines at settings/IPC | `CloseOut.ENGINE-DORMANCY-1.2026-05-16.md` |
| TTS-INTEGRATE-1 | 2026-05-16 | Merged sync and diagnostics branches to main | `CloseOut.TTS-INTEGRATE-1.2026-05-16.md` |
| TTS-CACHE-HARDEN-1 | 2026-05-16 | Cache-hit timing parity, type harmonization, IPC validation | `CloseOut.TTS-CACHE-HARDEN-1.2026-05-16.md` |
| TTS-EVENT-SYNC-1 | 2026-05-16 | Event-driven word sync from research | `CloseOut.TTS-EVENT-SYNC-1.2026-05-16.md` |
| NORMALIZER-ENRICH-1 | 2026-05-17 | Normalizer gap fill from abogen research | `CloseOut.NORMALIZER-ENRICH-1.2026-05-17.md` |
| TTS-RENDER-MAP-1 | 2026-05-17 | Sioyek-inspired word position index | `CloseOut.TTS-RENDER-MAP-1.2026-05-17.md` |
| TTS-PIPELINE-1 | 2026-05-17 | End-to-end pipeline integration tests | `CloseOut.TTS-PIPELINE-1.2026-05-17.md` |
| TTS-ARCH-DOC-1 | 2026-05-17 | Architecture decision records for TTS | `CloseOut.TTS-ARCH-DOC-1.2026-05-17.md` |
| SK-HYG-2 | 2026-05-16 | Directory reorganization (Lane E governance) | `CloseOut.SK-HYG-2.2026-05-16.md` |
| NARR-MEDIA-1 | 2026-05-17 | MediaSession integration — OS media controls for narration | `CloseOut.NARR-MEDIA-1.2026-05-17.md` |
| NARR-PAUSE-1 | 2026-05-18 | Named-pause state machine — 7 pause reasons with auto-resume | `CloseOut.NARR-PAUSE-1.2026-05-18.md` |
| TTS-PARITY-1 | 2026-05-18 | Cache/progress/resume parity hardening — 3 OutsideAudit.9 defects | `CloseOut.TTS-PARITY-1.2026-05-18.md` |
| NARR-SPOKEN-1 | 2026-05-18 | Spoken/display word separation — punctuation-only token filtering | `CloseOut.NARR-SPOKEN-1.2026-05-18.md` |

**Dissolved sprints:**
- `TEST-HARNESS-1` — Nano probes irrelevant after Kokoro-only pivot (2026-05-15)
- `TTS-CANARY-1` — Sidecar engines dormant, canary probes unnecessary (2026-05-15)
- `TTS-REGISTRY-DISPATCH-1` — Single active engine, registry dispatch unnecessary (2026-05-15)

---

## Active & Remaining Sprint Skeletons

### Standing Rules All Skeletons Inherit

1. **PR-2 / PR-3 / POSTV2 type gate:** After any code change run `npm run typecheck` and `npm test`; after any UI/dependency change run `npm run build`.
2. **PR-7:** CSS custom properties for all theming — no inline styles.
3. **PR-10:** All JSON writes must be atomic (write-tmp + rename).
4. **PR-12:** Context for cross-cutting concerns (settings, toasts, theme); props for direct parent-child data.
5. **PR-17:** Never drive imperative DOM animations from React useEffect — use a plain class.
6. **PR-26:** Settings that control a runtime engine must have explicit sync bridges.
7. **SRL-012:** For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible.
8. **Queue depth >=3:** If queue drops below 3 after completion, stop and backfill before next dispatch.
9. **Spec-compliance before quality:** Each task gets Solon check (does it match spec?) before Plato check (is it well-built?).
10. **Dispatch sizing:** 40 tool-use ceiling per wave. Sprints with 5+ implementation tasks must be pre-split into waves.

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`ROADMAP_SPECS.md`](ROADMAP_SPECS.md).

---

### Phase: Reading Experience v2

#### Stage 1a — Narration UX (serial)

#### NARR-CURSOR-2 — Silence-Aware Cursor Hold

- **What:** Use word-level `endTime` from Kokoro timestamps to detect inter-word silence gaps. Hold the narration cursor visually still during gaps (between `word[i].endTime` and `word[i+1].startTime`) instead of interpolating through silence. During `pauseReason: "rate-change"` or `"voice-change"`, cursor freezes at last confirmed position rather than drifting.
- **Why:** The current glide interpolation smoothly advances through silence, creating a visual disconnect — the cursor moves but no audio plays. With real word timestamps (NARR-TIMING shipped), we have precise silence gap data. Research finding H6. Depends on NARR-PAUSE-1 for pause-reason awareness.
- **Prerequisites:** NARR-PAUSE-1 (pause-reason field). TTS-PARITY-1 (cache silence parity + trusted progress fix). NARR-SPOKEN-1 (clean word timing from spoken/display separation). NARR-TIMING complete (word endTime available).
- **Done when:**
    1. Glide loop in FoliatePageView detects when audio progress falls within a silence gap (between word[i].endTime and word[i+1].startTime)
    2. During detected silence gaps, cursor position holds at word[i]'s right edge rather than interpolating toward word[i+1]
    3. During system-initiated pauses (rate-change, voice-change), cursor freezes at lastConfirmedAudioWordRef position
    4. During user-stop pauses, cursor remains at last confirmed position (existing behavior, now explicit)
    5. Silence threshold: gaps < 30ms are ignored (interpolation continues); gaps >= 30ms trigger hold
    6. No regression in smooth cursor motion during voiced segments
    7. 16+ focused tests covering silence detection, hold behavior, pause-reason branching
- **Effort:** M (2-3 days). Modifies glide interpolation logic + adds silence-gap detection.
- **Roster:** Zeus • Hephaestus (renderer-scope) • Hippocrates • Solon • Plato
- **Source:** IDEAS.md H6, audioScheduler.ts line 101-103 comment (designed for this), NARR-TIMING close-out

##### Implementation detail
- **Edit sites:** `src/components/reader/FoliatePageView.tsx` (glide loop — detect silence window from scheduled chunk's wordTimestamps, hold cursor.x during gap); `src/utils/audioScheduler.ts` (expose `getWordTimestampsForProgress(audioTime): {startTime, endTime, wordIndex}[]` helper or equivalent lookup); `src/hooks/useNarration.ts` (pass pauseReason to glide context so cursor knows to freeze during system pauses)
- **Tests:** New `tests/silenceAwareCursor.test.ts`; extend `tests/calmNarrationBand.test.ts`
- **Constants:** `TTS_SILENCE_HOLD_THRESHOLD_MS = 30` in `src/constants.ts`
- **Branch:** `sprint/narr-cursor-2` from clean main
- **Commit hygiene:** explicit-stage; no destructive flags

---

#### Stage 1b — Quality Track (parallel-safe with Stage 1a)

#### TTS-EVAL-3 — Quality Evaluation + CI Gate

- **What:** Execute the existing TTS evaluation harness (TTS-EVAL-1/2) against the full fixture corpus with Kokoro on current main, capture production-grade baseline metrics, update quality gate thresholds to reflect actual performance, and wire the gate runner into `npm run test:quality` so it can be invoked pre-merge.
- **Why:** The harness infrastructure exists (runner, metrics, profiles, gates, baseline) but has only been exercised in a controlled evaluation run (QWEN-STREAM-4). The Kokoro baseline from that run (p50=465ms, p95=503ms first-audio) needs validation against current main after 10 TTS architecture sprints shipped. Quality gates need to reflect Kokoro-only reality (remove MOSS Nano gates, tighten Kokoro thresholds). Research-recommended backpressure evaluation happens here too — if buffer pressure is observed during soak runs, flag for a future sprint.
- **Prerequisites:** None. Harness exists on main.
- **Done when:**
    1. Full matrix run (all fixture scenarios) executed against current main with Kokoro
    2. Soak run (5-minute continuous narration) executed and metrics captured
    3. `docs/testing/tts_eval_baseline_v2.json` written with updated aggregate metrics
    4. `docs/testing/tts_quality_gates.v2.json` written — Kokoro-only gates, MOSS Nano gates removed, thresholds based on observed v2 baseline + 20% headroom
    5. `npm run test:quality` script added to package.json running `node scripts/tts_eval_runner.mjs --mode=gate --baseline=docs/testing/tts_eval_baseline_v2.json --gates=docs/testing/tts_quality_gates.v2.json`
    6. Gate runner exits non-zero on threshold breach (already implemented in tts_eval_gate.mjs)
    7. Backpressure observation: if soak run shows >5s of buffered-but-unplayed audio, flag in close-out as future work
    8. 8+ focused tests validating gate evaluation logic with mock baselines
- **Effort:** M (2-3 days). Execution + threshold calibration + script wiring.
- **Roster:** Zeus • Athena (cross-system: scripts + docs + package.json) • Hippocrates • Solon • Plato
- **Source:** TTS-EVAL-1/2 close-outs, existing `scripts/tts_eval_runner.mjs`, `docs/testing/tts_quality_gates.v1.json`

##### Implementation detail
- **Edit sites:** `docs/testing/tts_eval_baseline_v2.json` (new — captured from run); `docs/testing/tts_quality_gates.v2.json` (new — Kokoro-only thresholds); `package.json` (add `test:quality` script); `scripts/tts_eval_runner.mjs` (verify --mode=gate path works end-to-end, fix any regressions from TTS architecture changes)
- **Tests:** Extend `tests/ttsEvalHarness.test.ts` with gate-mode integration tests
- **Constants:** Gate thresholds in `tts_quality_gates.v2.json` (derived from baseline + 20% headroom)
- **Branch:** `sprint/tts-eval-3-quality-gate` from clean main
- **Commit hygiene:** explicit-stage; no destructive flags

---

#### Stage 2 — UX Polish

#### UX-POLISH-1 — Library Cards + Command Palette + Space-Bar Mode *(stub)*

Library card 3-line format (title/author/data), "New" dot auto-clear via IntersectionObserver, Ctrl+K command palette entries for all settings pages, Space bar starts last-used reading mode. Bundle of small high-touch UX wins.

---

#### TTS-QUAL-CI-1 — CI Regression Gate Wiring *(stub)*

Wire `npm run test:quality` into GitHub Actions CI matrix. PRs touching TTS files (`src/hooks/narration/`, `src/utils/audio*`, `src/utils/narrat*`, `src/utils/tts*`) auto-run quality gates. Failure blocks merge. Depends on TTS-EVAL-3 baseline.

---

## Deferred Lanes

- **KOKORO-EXPORT-1** — Long-form audio export (M4B/SRT/ASS). Optional future after Reading Experience v2.
- **Normalizer alignment map** — `normalizedToOriginalMap` transform contract. Revisit when word-position rendering needs original-text cross-reference.
- **Registry-driven strategy dispatch** — Wire `createStrategy?` seam in `ttsProviderRegistry.ts`. Premature while non-Kokoro engines are dormant.
- **Playback-buffered-seconds backpressure** — `scheduler.getBufferedSeconds()` throttle. Revisit if TTS-EVAL-3 soak run reveals buffer pressure.
- **Track B** — Chrome Extension (EXT-ENR-C and beyond)
- **Track C** — Android APK (APK-0 through APK-4)
- **Phase 7** — Cloud Sync
- **Phase 8** — RSS/News
- **Idea Themes A-K** — See `docs/governance/IDEAS.md`

See `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` for full deferred specs.

---

## Notes

- TTS Architecture Complete finish line reached 2026-05-17. All decisions documented in `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`.
- Desktop v2.0 shipped.
- New finish line established: TTS Quality Confidence + Reading Experience v2 (2026-05-17).
- SSML as internal format explicitly **rejected** per research consensus — structured text + normalizer trace is cleaner than SSML payload. (2026-05-17)

<!-- Frontmatter:
loe_unit: t-shirt
last_review: 2026-05-17
finish_line: "TTS Quality Confidence + Reading Experience v2"
roadmap_doc: ROADMAP.md
sprint_queue_doc: docs/governance/sprint-queue.xlsx
-->
