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

## Current-phase worklist

<!-- Owned by the executor. Regenerate when a phase opens. -->

- [x] P1 opened 2026-10-12, gate passed and merged `7bbf6b20` 2026-10-13.
- [x] P2 opened 2026-10-13 at `7bbf6b20`: P0-3, P0-5, VERDICT.md, G1 answered (Decision #8–#13), precision addendum, gate run 10:15 (latency reruns FAIL recorded, Decision #13); merged `d81aeb4b` 2026-10-13 10:50.
- [x] P3 opened 2026-10-13 10:52 at `d81aeb4b` (branch `eb/narrate-rebuild-1-p3`, worktree `.worktrees/narrate-rebuild-1-p3`).
- [x] P3 design (2026-10-13 11:10; owner questions answered, Decision #14, #15). **Producer** in `main/narrate/` (CJS, packaged by `build.files`): `wordmap.js`, `chunker.js`, `capture.js` moved from the harness, which re-exports them (one implementation; provenance written only in `capture.synthesize`); `expose-durations.js` (Decision #4's graph edit as a function; `ensureExposedModel` with input and output hash checks and an atomic write; Decision #15); `producer-worker.js` + `producer.js` (4 intra-op threads, the exposed model, the capture seams, exact table + provenance, `NARRATE_MODELS_ROOT` override for this epic's runs); `main/ipc/narrate.js`. **Engine** in `src/reader/modes/narrate/engine/` (no React, no sibling imports): `chunkPlan.ts` (T2 bounds over book words: first chunk one sentence ≤ 15 words, packed sentences under the token estimate; the exact cap fails closed in the producer), `wordTable.ts` (verify: provenance native, integer frames, Σ frames × factor = PCM samples played, units cover the chunk's words in order; lookup by playback sample with R6 hold), `playbackClock.ts` (one `AudioContext` behind an `AudioOutput` seam; contiguous sample-accurate scheduling; leading-silence trim by a known sample count; `getOutputTimestamp` mapping for D3), `narrateEngine.ts` (epochs, prefetch of the next chunk, F4 fail-closed on any unverified chunk, R7 speed change finishing the word in progress with coalescing and a stale-job bound). **Suites named for the gate:** `tests/narrate/narrate.structural.test.ts` (D4 structural: no estimator path, provenance set in one place, no sibling-runtime import; with a planted-violation control), `tests/narrate/narrate.negativeControls.test.ts` (D4 through the full path: missing table; native-labelled table mismatching its words or its audio; fabricated weight-shaped table — each F4, each seen failing first), `tests/narrate/narrate.engine.test.ts` (D5-engine: one clock and one lookup, no overlapping voiced samples, no dropped or repeated word across pause/resume, mid-word click and speed changes, R6, R7, coalescing, stale bound), `tests/narrate/narrate.wordmap.test.js` and `tests/narrate/narrate.exposeDurations.test.js` (producer units). Producer = harness identity: `scripts/narrate-rebuild/p3-producer-check.mjs` exits 0 when the producer's table and PCM equal the P0 table for passage A chunk 0 at 1.00x.
- [ ] Producer (main process): duration-exposed model, the capture seams, the exact table with provenance from the model's output, a narrow IPC and preload surface.
- [ ] Engine (`src/reader/modes/narrate/`): one `AudioContext` clock, table-lookup cursor, F4 fail-closed paths, R6 hold, leading-silence trim and the other latency levers (Decision #13).
- [ ] D4: structural no-estimate test and the negative controls (missing table; native-labelled table that mismatches its words or audio; fabricated weight-shaped table), each seen failing first; the D5-engine suite; `npm run typecheck` exit 0; `npm test`.
- [ ] P3 gate → merge per GIT WORK.
