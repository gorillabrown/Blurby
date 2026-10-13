---
epic: narrate-rebuild
charter: charter.md
---

# Phase Plan — Rebuild Narrate with the cursor attached to the playing word

<!-- The route, not the contract. The executor may reshape phases as reality teaches —
     log the replan in state.md → Decision log and journal.md. Exit gates may tighten,
     never loosen. Plan at phase altitude: intents and gates here; steps live inside the
     run. At every exit gate: re-read charter.md before opening the next phase. -->

Every phase runs on its own branch `eb/narrate-rebuild-1-p<n>` cut from `origin/main` when it opens, and lands through one `--no-ff` merge when its gate passes (charter → Constraints, launch.md → GIT WORK). Phase 0 of the ROADMAP entry is P1 + P2 here; its ~2-working-day limit spans both.

## Phases

### P1 — Producer and harness (ROADMAP Phase 0: P0-1, P0-2, P0-4)
- **Intent:** verify assumptions A1–A3; copy the pinned model into `C:\Projects\Blurby-artifacts\narrate-rebuild-1\models\` and expose its predicted-duration tensor there; build the offline Node harness under `scripts/narrate-rebuild/`; recover the Phase 0 corpus (T1 passage A from *Meditations* Book 1, passage B composite of the old fixtures, from `612d03f5…:tests/fixtures/narration/`) into `tests/fixtures/narrate-rebuild/`; prove token identity and the units law (frames × 600 = PCM samples) for every chunk at all 25 rates on af_bella and bf_emma; write the mapping policy (merged words, no proportional split). Every check script is first shown to record a failure (LL-151). Baseline the DoD commands in the phase worktree.
- **Exit gate:** `node scripts/narrate-rebuild/<p0 summary script>` (named in state.md when written) exits 0 and reports P0-1, P0-2 and P0-4 PASS for both voices, the hashes match the OutsideAudit.10 record, and a deliberately broken table makes the same script exit non-zero. Merged to `main` per GIT WORK.
- **Rough size:** 2–3 sessions.

### P2 — Acoustic check, latency and the verdict (P0-3, P0-5) → owner gate G1
- **Intent:** resolve anchors independently of the table (T3 onset detector, T4 pause-mark association, T5 ≥10 anchors per passage per rate, rates 0.80/1.00/1.40/2.00) with the 40 ms negative control; run the P0-5 latency harness on Bella (T6 voiced threshold, T7 trials); write `docs/studies/narrate-rebuild-1/phase0/VERDICT.md` in its three parts with each failure classified (R2). Then stop at **G1** with a BLOCKER(USER): continue on Kokoro or bake-off; merged-word display; the mode id.
- **Exit gate:** VERDICT.md exists with all three parts, the 40 ms control is detected, the harness summary exits 0 on PASS (or the failure classification is recorded), and the owner's G1 answers are adopted into state.md's Decision log. Merged to `main`.
- **Rough size:** 2–3 sessions plus the owner's G1 wait.

### P3 — Core engine (exact table, provenance, fail-closed, one sample clock)
- **Intent:** the new runtime's engine under `src/reader/modes/<id>/` and its main-process producer: generation per chunk with provenance from the model's actual output, the exact word table, no stretching, fresh audio only (R10), raw PCM scheduled on one `AudioContext` clock, cursor = table lookup at the current playback sample; F4 fail-closed paths; the structural no-estimate test and negative controls (D4); R6 silence hold. Opens only after G1 and, before any durable write, SETTINGS-WRITE-DURABLE-1 on `main` (A5).
- **Exit gate:** the named D4 and D5-engine suites exit 0, each negative control seen failing first; `npm run typecheck` exits 0. Merged to `main`.
- **Rough size:** 3–4 sessions.

### P4 — The mode (router, bottom bar, preload surface, F4/F5 UI, settings)
- **Intent:** register the fourth runtime behind the thin router (A5), the bottom bar entry, the minimal preload surface, the voice-loading state (F5) and pause notice (F4); retire or keep `normalizeReaderModes` per G1's mode id and rewrite (never delete) NARRATE-REMOVE-1's absence gates (D8, D9). Import census and selector census before moving or deleting anything (LL-139, LL-150).
- **Exit gate:** D7's tests, D8's boundary suites with the three baselines byte-identical, D9's rewritten settings tests, and `npm test` / `npm run build` exit 0 in the phase worktree. Merged to `main`.
- **Rough size:** 2–3 sessions.

### P5 — Speed, crossings, latency end to end, recorded output
- **Intent:** speed 0.80–2.00 in 0.05 steps generated at speed (R7: finish the word, new speed at the next word, coalescing, stated stale-job bound); section and chapter crossings (F2's Introduction → "HIS FIRST BOOK"); the in-app recorded-output log and its check script (D3); the end-to-end latency script (D6); D5's overlap/drop/repeat analysis.
- **Exit gate:** D3, D5 and D6 scripts exit 0 on the owner's machine over the stated sessions; the D10 grep exits 1. Merged to `main`.
- **Rough size:** 2–3 sessions.

### P6 — Owner gate G2 and completion
- **Intent:** production build for the owner; stop at **G2** for the listening sign-off (D12) and the owner-observed rows (D2, D7 F5); then re-run every DoD row fresh in one session and execute launch.md → Completion protocol.
- **Exit gate:** all D1–D13 pass with fresh evidence in state.md; done.md written and merged as the docs-only record.
- **Rough size:** 1–2 sessions plus the owner's G2 wait.

## Gate log

| Date | Gate | Evidence |
|------|------|----------|
| 2026-10-13 | P1 — Producer and harness | `p0-summary.mjs` exit 0: P0-1, P0-2, P0-4 PASS on both voices (514/514, 500 chunks, factor 600); `--break` exit 1; `p1-gate.ps1` 11/11 with `-SelfTest` recording a FAIL; typecheck 0; `npm test` 1,955 passed / 1 skipped / 0 failed; merge `7bbf6b20` pushed, ancestor check exit 0 (state.md → Evidence) |
| 2026-10-13 | P2 — Acoustic check, latency and the verdict | VERDICT.md parts (i)–(iii), P0-5 and the precision addendum present; `p0-acoustic.mjs` exit 1 with the classification recorded (5 FAIL / 11 INCONCLUSIVE, 40 ms control caught); `p0-latency.mjs --threads 4`: T7 measurement exit 0 (worst warm 1,940 ms on a quiet host), the two gate reruns exit 1 under ordinary desktop load (2,297 / 2,451 ms) recorded, not waived (Decision #13); the owner's G1 answers adopted (Decision #8–#13); merge `d81aeb4b` pushed, ancestor check exit 0 (state.md → Evidence) |
| 2026-10-13 | P3 — Core engine | Fresh at `f4971196`: `npx vitest run tests/narrate/narrate.structural.test.ts tests/narrate/narrate.negativeControls.test.ts tests/narrate/narrate.engine.test.ts` exit 0 (19 tests; the planted-violation and gate-bypass positive controls inside); `npm run typecheck` exit 0; `npm test` 139 files, 1,984 passed / 1 skipped / 0 failed; `p3-producer-check.mjs` exit 0 and `--break` exit 1; merge `ef245815` pushed, ancestor check exit 0 (state.md → Evidence) |

## Current-phase worklist

<!-- Owned by the executor. Regenerate when a phase opens. -->

- [x] P1 opened 2026-10-12, gate passed and merged `7bbf6b20` 2026-10-13.
- [x] P2 opened 2026-10-13 at `7bbf6b20`: P0-3, P0-5, VERDICT.md, G1 answered (Decision #8–#13), precision addendum, gate run 10:15 (latency reruns FAIL recorded, Decision #13); merged `d81aeb4b` 2026-10-13 10:50.
- [x] P3 opened 2026-10-13 10:52 at `d81aeb4b`; built and gate-passed 11:35; merged `ef245815` 2026-10-13 11:36. Its design record, kept for the next phases:
- [x] P3 design (2026-10-13 11:10; owner questions answered, Decision #14, #15). **Producer** in `main/narrate/` (CJS, packaged by `build.files`): `wordmap.js`, `chunker.js`, `capture.js` moved from the harness, which re-exports them (one implementation; provenance written only in `capture.synthesize`); `expose-durations.js` (Decision #4's graph edit as a function; `ensureExposedModel` with input and output hash checks and an atomic write; Decision #15); `producer-worker.js` + `producer.js` (4 intra-op threads, the exposed model, the capture seams, exact table + provenance, `NARRATE_MODELS_ROOT` override for this epic's runs); `main/ipc/narrate.js`. **Engine** in `src/reader/modes/narrate/engine/` (no React, no sibling imports): `chunkPlan.ts` (T2 bounds over book words: first chunk one sentence ≤ 15 words, packed sentences under the token estimate; the exact cap fails closed in the producer), `wordTable.ts` (verify: provenance native, integer frames, Σ frames × factor = PCM samples played, units cover the chunk's words in order; lookup by playback sample with R6 hold), `playbackClock.ts` (one `AudioContext` behind an `AudioOutput` seam; contiguous sample-accurate scheduling; leading-silence trim by a known sample count; `getOutputTimestamp` mapping for D3), `narrateEngine.ts` (epochs, prefetch of the next chunk, F4 fail-closed on any unverified chunk, R7 speed change finishing the word in progress with coalescing and a stale-job bound). **Suites named for the gate:** `tests/narrate/narrate.structural.test.ts` (D4 structural: no estimator path, provenance set in one place, no sibling-runtime import; with a planted-violation control), `tests/narrate/narrate.negativeControls.test.ts` (D4 through the full path: missing table; native-labelled table mismatching its words or its audio; fabricated weight-shaped table — each F4, each seen failing first), `tests/narrate/narrate.engine.test.ts` (D5-engine: one clock and one lookup, no overlapping voiced samples, no dropped or repeated word across pause/resume, mid-word click and speed changes, R6, R7, coalescing, stale bound), `tests/narrate/narrate.wordmap.test.js` and `tests/narrate/narrate.exposeDurations.test.js` (producer units). Producer = harness identity: `scripts/narrate-rebuild/p3-producer-check.mjs` exits 0 when the producer's table and PCM equal the P0 table for passage A chunk 0 at 1.00x.
- [x] Producer (main process, 2026-10-13 11:50): `main/narrate/{constants,capture,wordmap,chunker,expose-durations,producer-worker,producer}.js`, `main/ipc/narrate.js` (`narrate-generate`, `narrate-preload`, `narrate-status`; registered in `ipc-handlers.js`); the harness re-exports the shared code. `p3-producer-check.mjs` exit 0: at onnxruntime's default threads the table and the PCM sha256 equal Phase 0's; at Decision #7's 4 threads the table is identical, the first voiced sample and the T3 detector's onsets are the same to the millisecond, and the waveform differs only by rounding amplified through the decoder's harmonic phase (1 ms envelope within 3.7 % of peak); `--break` exit 1.
- [x] Engine (`src/reader/modes/narrate/engine/`, 2026-10-13 11:40): `chunkPlan.ts`, `wordTable.ts` (verify + lookup, R6), `playbackClock.ts` (AudioOutput seam, WebAudioOutput, T6 trim), `narrateEngine.ts` (epochs, prefetch, F4 fail-closed, R7 with coalescing and the stale-job bound). The preload surface, the runtime shell and the view are P4.
- [x] D4 and D5-engine suites (2026-10-13 11:45): `tests/narrate/narrate.structural.test.ts` (planted-violation control inside), `narrate.negativeControls.test.ts` (each control fails closed; the gate-bypass positive control shows the control would otherwise play), `narrate.engine.test.ts` (8 D5 cases), `narrate.wordmap.test.js`, `narrate.exposeDurations.test.js`: 29 passed; `npm run typecheck` exit 0; `npm test` 139 files, 1,984 passed / 1 skipped / 0 failed.
- [x] P3 gate 2026-10-13 11:35 (Gate log) → merged `ef245815`.
- [x] P4 opened 2026-10-13 11:36 at `ef245815` (branch `eb/narrate-rebuild-1-p4`, worktree `.worktrees/narrate-rebuild-1-p4`).
- [ ] P4 census before any move or deletion (LL-139, LL-150): importers of the mode registry (`useReaderModeOrchestrator.ts` `READER_MODE_MODULES`), the bottom bar and keyboard routes, `preload.js` and the `ElectronAPI` type, `src/types.ts` `ReaderMode`/`ReaderLastMode`, the three `normalizeReaderModes` call sites and their tests, NARRATE-REMOVE-1's absence assertions (registry keys, three bar buttons, no `Narrat` text, KeyN, palette and settings), the `"narrate"` leftovers; name the D7, D8 and D9 suites here before building.
- [ ] Runtime shell `src/reader/modes/narrate/`: `index.ts` (module), `ModeRuntime.ts` + `ModeState.ts` over the P3 engine (ReaderModeRuntime v1 — select, start, pause, resume, stop, jumpToWord, exportHandoff; speed `{ kind: "rate" }`; `narrating` true while playing; `clockOwner: "audio-truth"` re-added with tests), `surface.ts`, `FoliateView.tsx` + `ModeView.tsx` (own Foliate element; the highlight follows the engine's cursor), `useModeBindings.ts` (the requestAnimationFrame tick; the D3 log hook point), the producer port over `window.electronAPI.narrate*`; F4 notice ("this passage couldn't be timed") and F5 voice-loading state.
- [ ] Preload surface (`narrateGenerate`, `narratePreload`, `narrateStatus`) + `ElectronAPI` types; router registration (fourth module); bottom-bar Narrate entry and KeyN; voice and speed read from `ttsVoiceName`/`ttsRate` and written only through the existing fire-and-forget `saveSettings` (BUG-185: no acceptance criterion treats that as persistence until SETTINGS-WRITE-DURABLE-1).
- [ ] Mode id `"narrate"` (Decision #10): restore `"narrate"` in `ReaderMode`/`ReaderLastMode`/`ReaderModeId`; retire the three `normalizeReaderModes` runtime calls (`loadSettingsData`, `applyCloudSettings`, the `save-settings` handler) behind a settings-schema step so a saved `narrate` survives; migration v13 and its tests stay; rewrite, never delete, NARRATE-REMOVE-1's absence assertions (D8, D9).
- [ ] P4 gate: D7's tests, D8's boundary suites with the three G4 baselines byte-identical, D9's rewritten settings tests, `npm test`, `npm run typecheck`, `npm run build` exit 0 in this worktree → merge per GIT WORK → Gate log and Evidence on the P5 branch.
