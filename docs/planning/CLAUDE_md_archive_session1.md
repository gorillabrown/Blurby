# CLAUDE.md Archive — Session 1 (2026-05-21)

Archived from `Current System State` section of CLAUDE.md. These are completed sprint records preserved for reference. The full spec for each sprint lives in `docs/planning/.Archive/ROADMAP_legacy.md`.

---

## Completed Sprint History (v1.29.0 → v1.76.0)

### TTS Stabilization Lane (TTS-7 series)

- **TTS-7 stabilization lane COMPLETE**: TTS-7A (v1.29.0) + TTS-7B (v1.30.0) + TTS-7C (v1.31.0) + TTS-7D (v1.32.0). All 15 TTS bugs (BUG-101–115) resolved and verified. Closeout doc in TECHNICAL_REFERENCE.md.
- **TTS-7F hotfix complete** — proactive entry cache coverage + cruise warm, plus clean launch ownership. BUG-116/118/119/120/121 resolved.
- **TTS-7G complete** — BUG-117 verified resolved (response path < 2ms). DEV instrumentation added.
- **TTS-7H complete** — BUG-122/123 resolved. Visible-word readiness, frozen launch index.
- **TTS-7I complete as a first pass** — BUG-124/125/126/127 addressed, but live testing still showed final Foliate integration issues.
- **TTS-7J complete** — BUG-128/129/130 resolved. Single narration section-sync owner, word-source dedupe, explicit user selection protection.
- **TTS-7K complete** — BUG-131/132/133 resolved. Full-book EPUB words promoted as narration source of truth, global index validation for start-word resolution, onWordsReextracted source protection, page-mode isolation from narration-only section navigation. 22 new tests. v1.33.6.
- **TTS-7L complete** — BUG-134 resolved. Exact Foliate text-selection mapping — selectionchange now resolves .page-word span with data-word-index, unified click/selection payload, first-match text fallback demoted. 15 new tests. v1.33.7.
- **TTS-7M complete** — BUG-135 resolved. Persistent resume-anchor — pause captures live cursor, reopen uses saved position, passive onLoad/onRelocate cannot downgrade. 17 new tests. v1.33.8.
- **TTS-7N complete** — BUG-136/137 resolved. Kokoro pause settings now drive word-weight scaling and sentence-boundary chunk snapping. Ctrl+K TTS links repaired to "tts" page. 19 new tests. v1.33.9.
- **TTS-7O complete** — BUG-138/139 resolved. Punctuation-safe pre-send chunk rounding (expanded outward search), real inter-chunk audible silence injection (classifyChunkBoundary → silence samples), 3-word narration window (page-word--narration-context CSS), smooth cursor via CSS transitions, periodic truth-sync every 12 words. 27 new tests. v1.34.0.
- **TTS-7P complete** — BUG-140 resolved. Rolling pause-boundary planner (`src/utils/narrationPlanner.ts`) builds local boundary plans for the active text window (next ~400 words). Planner is now the single authority for where chunks may legally end; `generationPipeline.ts` uses planner for chunk selection and silence injection; `kokoroStrategy.ts` passes `getParagraphBreaks`; `useNarration.ts` passes paragraph breaks ref. Dialogue detection included. Two new constants: `TTS_PLANNER_WINDOW_WORDS` (400), `TTS_PLANNER_MIN_CHUNK_WORDS` (10). 33 new tests. v1.36.0.
- **TTS-7Q shipped** — BUG-143/144 resolved. Canonical `AudioProgressReport` type + `getAudioProgress()` added to scheduler; `onChunkHandoff` callback wired through `kokoroStrategy.ts` and exposed on `useNarration` hook return; RAF-based glide loop in `FoliatePageView.tsx` drives the 3-word narration band from audio-time progress instead of DOM target chasing; chunk handoff is continuity-safe (visual band can never become the canonical anchor). New `src/utils/narrateDiagnostics.ts` exports diagnostic event types and `getGlideDiagSummary()`. 25 new tests (`tests/audioGlide.test.ts`). v1.36.1.
- **TTS-7R complete** — BUG-145a/b/c resolved. Separated canonical audio cursor from visual cursor (`lastConfirmedAudioWordRef`), enabled audio-progress glide (removed `SIMPLE_NARRATION_GLIDE`), fixed-size overlay band (measure-once line-height), truth-sync visual-only pathway, removed per-word context CSS. 25 new tests (`tests/calmNarrationBand.test.ts`). v1.37.0.

### TTS Architecture Pipeline (Registry → Normalize → Cache → Sync → Diagnostics → Integration)

- **TTS-REGISTRY-1 complete** — Provider capability truth now lives in `src/types/ttsProvider.ts` and `src/utils/ttsProviderRegistry.ts` for Web Speech, Kokoro, disabled Qwen, MOSS-Nano, and Pocket TTS. Settings/status surfaces read scoped provider labels, posture, and readiness hints from the registry. Kokoro remains default/available, Qwen remains disabled/unselectable, and runtime playback behavior is unchanged. Verification passed: focused 6 files / 32 tests, broader TTS/settings/narration 9 files / 52 tests, full `npm test` 183 files / 2629 tests, `npm run typecheck`, `npm run build`, and `git diff --check`.
- **TTS-NORMALIZE-1 complete** — `src/utils/segmentNormalizer.ts` adds pure English-first spoken-text normalization with original/normalized text, locale, ordered transforms, `TTS_NORMALIZER_VERSION`, stable hashes, and pronunciation override hash. Golden fixtures cover prose, dialogue, headings/Roman numerals, line breaks, currency, dates/times, abbreviations, ordinals/cardinals, and safe footnote markers. Kokoro receives normalized spoken text while scheduler/display words remain original; cache identity includes normalizer version plus source/normalized hash pair with no destructive migration.
- **TTS-CACHE-TIMING-1 complete** — `main/tts-cache.js` now supports schema-versioned v2 structured cache identities and atomic `.timing.json` sidecars while preserving legacy v1 cache reads. V2 identity records provider, voice, rate bucket, model/version, source/normalized hashes, normalizer version, pronunciation override hash, document locator, chunk ID, sample rate, and timing truth; disk paths use safe hashes under `tts-cache/v2/`.
- **TTS-SYNC-1 landed on main** — `src/utils/timingMetadataStore.ts` and `src/utils/highlightSyncController.ts` centralize narration highlight sync policy. Trusted word-native timing can drive word-synced decisions; heuristic/missing timing downgrades to chunk/segment decisions with no invented active word.
- **TTS-DIAG-1 landed on main** — `src/utils/narrateDiagnostics.ts`, `useNarration`, `TTSSettings`, and `scripts/tts_eval_runner.mjs` add the redacted provider-neutral `tts-diagnostics-v1` bundle. The bundle captures provider, engine/voice/rate, segment/hash, cache key, timing sidecar, scheduler, highlight decision, and relevant error metadata without audio payloads or raw book text by default.
- **TTS-INTEGRATE-1 complete** — Clean integration branch merged TTS-SYNC-1 and TTS-DIAG-1 onto main. Verification passed: focused sync slice 4 files / 37 tests, focused diagnostics slice 4 files / 18 tests, `npm run typecheck`, `npm run build`, full `npm test`.
- **TTS-PARITY-1 complete** — Cache write/read now persists post-silence audio with `silenceMs` metadata round-trip, `getAudioProgress()` bypasses artificial lag for trusted word-native timing, and `pipelineResume()` caps its initial flush and drains remainder on demand via `acknowledgeChunk()` — 6 files changed, 123 focused tests passing. Three OutsideAudit.9 defects resolved. SRL-043 (backpressure drain). Merged at 67c6898.

### TTS Evaluation Harness

- **TTS-EVAL-1 complete** — quality harness baseline shipped: trace schema/types, fixture corpus, opt-in trace sink instrumentation, first-audio timing, runner + metrics summaries, lifecycle/handoff tests, reviewer template/runbook, and baseline artifacts. v1.53.0.
- **TTS-EVAL-2 complete** — matrix + soak harness expansion shipped: scenario manifest, soak profiles, deterministic artifact model, matrix/soak runner modes, p50/p95 startup + drift aggregate summaries, and runner validation suite. v1.54.0.
- **TTS-EVAL-3 complete** — Quality evaluation + CI gate: gate mode (`--mode=gate`) added to `tts_eval_runner.mjs` with `--key=value` CLI parsing, v2 baseline captured in `tts_eval_baseline_v2.json`, Kokoro-only gate thresholds in `tts_quality_gates.v2.json` (+20% headroom), `npm run test:quality` wired in `package.json`. Soak run showed no backpressure. 91 focused tests. Merged at c00034d.

### Narration Feature Sprints

- **NARR-MEDIA-1 complete** — MediaSession integration shipped: `src/utils/mediaSessionBridge.ts`, `useNarration.ts`, `useNarrationSync.ts`. OS media controls (lock screen, Bluetooth headphones, media keyboards) now control narration play/pause/next/previous. Sentence-level track navigation via narrationPlanner. 52 tests across 5 files. v1.75.1.
- **NARR-PAUSE-1 complete** — Named-pause state machine shipped: 7 pause reasons (`user-stop`, `rate-change`, `voice-change`, `forward-seek`, `backward-seek`, `mode-switch`, `book-end`) with auto-resume for rate/voice changes, seek-to-position resume, MediaSession awareness.
- **NARR-SPOKEN-1 complete** — New `spokenWordFilter.ts` separates spoken words from display words so Kokoro only receives pronounceable tokens. `kokoroStrategy.ts` sends filtered spoken words to Kokoro and remaps timestamps back to display indices via `spokenToDisplayMap`. 72 focused tests across 4 files. Merged at bb3c69a.
- **NARR-CURSOR-1 complete** — Collapsing narration cursor: overlay right-edge anchored to `<p>` ancestor, left edge advances rightward with narration, width derived per tick as `colRight - leftEdge`. CSS simplified (2-stop gradient, no transform transition). 16 new tests. v1.40.0.
- **NARR-CURSOR-2 complete** — Silence-aware cursor hold: new `silenceAwareCursor.ts` decision module, `audioScheduler.ts` exposes gap metadata (`silenceGapMs`, `isInSilenceGap`), FoliatePageView glide loop holds cursor during silence gaps (>=30ms) and freezes during system-initiated pauses. 92 focused tests across 3 files. Merged at 4838340.
- **NARR-TIMING complete** — Real word-level timestamps from Kokoro TTS. kokoro-js fork surfaces duration tensor via patch-package. 4-layer validation: token-count check, fail-closed token walk, waveform drift (split accumulator), scheduler acceptance (monotonicity, bounds, scaled tolerance). `computeWordBoundaries` prefers real timestamps, falls back to `computeWordWeights` heuristic. 18 new tests. v1.44.0.
- **NARR-LAYER-1A complete** — narration-as-flow foundation shipped (`isNarrating`, follower mode, flow+narration handoff). v1.51.0.
- **NARR-LAYER-1B complete** — narration mode removed from core contracts, settings migration to flow-layer narration, overlay removal and consolidation. v1.52.0.

### Reader Four-Mode Foundation

- **READER-4M-1 complete** — explicit four-mode reader foundation shipped at v1.63.0. `FoliatePageView` exposes rendered-word roots directly to `FlowScrollEngine`, Flow boot/rebuild waits on `waitForSectionReady()` plus `foliateRenderVersion`, shared `ReaderMode` / persisted last-mode fields now include `narrate`.
- **READER-4M-2 complete** — Standalone Narrate mode + four-button bottom-bar controls. N key is now universal Narrate entry from any mode. T narration toggle removed. Pause/resume verified in-mode. 14 new tests. v1.69.0.
- **READER-4M-3 complete** — Canonical global word anchor + spoken-truth Narrate continuity shipped at v1.72.0. Page/focus/flow/narrate now resolve through one mode-aware anchor contract, Flow↔Narrate preserve the same shared-surface position.

### Flow Reading

- **FLOW-INF-A complete** — CSS mask-image reading zone with configurable position/size. FlowScrollEngine computes dynamic zone position from CSS custom properties. ReaderBottomBar exposes zone controls. 27 new tests. v1.41.0.
- **FLOW-INF-B complete** — Timer bar cursor (5px/6px e-ink, accent glow, line-completion flash). FlowProgress computation with chapter/book percentage + estimated time remaining. 18 new tests. v1.42.0.
- **FLOW-INF-C complete** — Cross-book continuous reading. Finishing a book in flow mode with a non-empty queue shows transition overlay (2.5s countdown), then auto-opens next book and resumes flow. 21 new tests. v1.46.0.
- **FLOW-ZONE-AUTO complete** — Descending auto-advancing reading zone replaces fixed-position scroll. Zone starts at 15% from viewport top, walks downward as words advance, instant page-jump-scroll when zone bottom crosses 67%, resets to top. 14 new tests + 1 regression test. v1.76.0.

### Qwen Streaming (deferred — ITERATE)

- **QWEN-STREAM-1 complete** — Streaming Qwen sidecar foundation. Binary-framed PCM protocol, JS engine manager, IPC handlers, preload bridge, streaming types. 18 new tests. v1.71.0.
- **QWEN-STREAM-2 complete** — StreamAccumulator + streaming Qwen strategy + live playback wired. 21 new tests. v1.73.0.
- **QWEN-STREAM-3 complete** — Streaming hardening: stall detection, crash recovery, warmup gate, cancellation guards. 16 new tests. v1.74.0.
- **QWEN-STREAM-4 complete** — Streaming eval harness executed, Kokoro baseline captured, decision gate document populated with ITERATE recommendation. v1.75.0.

### Extension & Platform

- **EXT-5C complete** — BUG-141/142 resolved. Rich article HTML formatting preserved, inline images downloaded and embedded into EPUB. 24 new tests. v1.35.0.
- **EXT-ENR-A complete** — Resilient extension connection: exponential backoff with jitter, pending article persistence, article-ack delivery confirmation, three-state connection indicator. 18 new tests. v1.39.0.
- **EXT-ENR-B complete** — Push event system for Chrome extension auto-discovery. `PairingBanner` component appears in library screen. 29 new tests. v1.43.0.
- **EINK-6A complete** — E-ink display behavior independent from theme via `einkMode`; settings schema v9/defaults/migrations added. v1.56.0 area.
- **EINK-6B complete** — E-ink reading ergonomics: Flow instant stepped chunks, Focus 2-3 word phrase bursts, adaptive ghosting refresh. v1.57.0 area.
- **GOALS-6B complete** — Reading Goal Tracking: optional local-first daily pages, daily minutes, weekly books goals; settings, library widget, streak display. v1.58.0 area.
- **MOSS-NANO-13B complete** — Real MOSS Nano app audio bridge: ONNX runtime validation, real WAV/PCM metadata through IPC. Synthetic tone output is mock-only.
- **POCKET-TTS-1 complete** — Pocket TTS isolated third opt-in engine path with sidecar/engine wrapper, IPC, preload bridge, renderer strategy, settings wiring. 30 focused tests.

### Hotfixes

- **HOTFIX-12 complete** — BUG-146/147/148/149/150 resolved. Chapter dropdown tracks narration cursor, floating return-to-narration button, position restore toast, chunked EPUB extraction, keyboard guard refined. 17 new tests. v1.37.1.
- **SELECTION-1 complete** — Word anchor contract: soft/hard selection tiers, mode start resolution chain, BUG-151/152/153 resolved. 17 new tests. v1.38.0.
- **HOTFIX-14 complete** — BUG-155/156/157/158 resolved. URL extraction fetchWithBrowser fallback, authenticated-only client count + polling + heartbeat. 12 new tests. v1.38.2.
- **HOTFIX-15 complete** — BUG-159/160/161 resolved. colRight ancestor tightened, proportional band height, truth-sync interval halved. 16 new tests. v1.43.1.
- **STAB-1A complete** — BUG-162/163/164/165 resolved. `.foliate-loading` CSS, async `wrapWordsInSpans`, sentence-snap tolerance, FlowScrollEngine retry + instant scroll. 19 new tests. v1.45.0.

### Infrastructure & Refactoring

- **PERF-1 complete** — Full performance audit & remediation. Startup parallelized, caching, debouncing, LRU eviction, Vite code splitting. 32 new tests. v1.47.0.
- **REFACTOR-1A complete** — ReaderContainer decomposition: 33 useEffects extracted into 5 custom hooks. 74 new tests. v1.48.0.
- **REFACTOR-1B complete** — FoliatePageView helpers extracted, TTSSettings split into 3 sub-components, global.css split into 8 domain files. 32 new tests. v1.49.0.
- **TEST-COV-1 complete** — Critical path coverage + security hardening: URL scheme validation, 401 retry token refresh. 75 new tests. v1.50.0.

### Governance & Hygiene

- **SK-HYG-1 complete** — Roadmap hygiene & queue recovery. Archive-forward discipline enforced, queue restructured, Standing Rules section added.
- **BRAND-HYG-1 shelved/no-op** — Expected dirty brand/theme edits were not present in this checkout.
- **POSTV2-ENGINE-1 update** — Qwen disabled at selectable settings/profile boundary and at IPC runtime entry points.
- **Roadmap review (2026-05-02):** Full 4-phase ceremony completed. Verdict: AT RISK. Finish line established: Desktop v2.0. ROADMAP.md reduced from 5,347→754 lines. 60 specs archived.
- ROADMAP_V2.md archived (2026-04-06). Single source of truth: ROADMAP.md.
- IDEAS.md reorganized into 11 themed groups (A through K) with roadmap alignment.

### Guardrails (still active — preserved in CLAUDE.md)

- **Diagnostics export guardrail** — Diagnostics exports are evidence artifacts, not user-content artifacts. Do not commit generated local user diagnostics unless an explicit test fixture creates them; raw text and audio-shaped fields must remain redacted/rejected in both producers and validators.
