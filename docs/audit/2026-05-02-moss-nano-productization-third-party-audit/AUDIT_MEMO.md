# MOSS Nano Productization Audit Memo

Creation date: 2026-05-02
Source branch: main
Source commit: 2fe74ba386ebf260dfb524af43d249f40aa6d207
Package: blurby-moss-nano-productization-audit-package.zip

## Executive Summary

Blurby has spent the last TTS cycle trying to escape the quality and continuity limits of the current Kokoro path without regressing local-first operation, reader-mode stability, or timing truth. The most important current fact is conservative: MOSS Nano is now integrated far enough to be selectable in settings as an experimental, readiness-gated engine, but it is not recommended opt-in, not default, and not a Kokoro retirement candidate.

The next audit question is whether the proposed MOSS-NANO-13 work is the right way to decide if Nano deserves recommended opt-in status. MOSS-NANO-13 should capture real selected-Nano observations across Page, Focus, Flow, and Narrate and feed them into the existing `--nano-live-evidence` gate. Simulated matrix output is intentionally not enough to promote Nano.

## Where We Have Been

Kokoro is operationally valuable because it is already local, integrated, and supported by the current playback architecture. But it has repeatedly shown product-facing weaknesses: choppy long-form playback, short context behavior, load/start delays, and prosody that can feel weak around punctuation. Those problems pushed the project to investigate alternatives.

The project first pursued flagship MOSS because the quality ambition was high. That path was deliberately tested instead of dismissed prematurely. The evidence showed that flagship MOSS was too slow and unstable on this CPU-only host in the available runtime shapes. The team attempted Windows x64, WSL ARM64, runtime root-cause diagnostics, stage timing, and host-shape rescue. The conclusion was not "MOSS is bad"; it was narrower: flagship MOSS was not a practical Blurby runtime path on this host.

MOSS Nano then became the practical local candidate. Early subprocess probes were too slow. Resident runtime work changed that result materially. The Nano lane progressed through resident reuse, first-audio truth, bounded lifecycle, shutdown/restart proof, 1800-second soak evidence, sidecar IPC, narration strategy, cache/prefetch continuity, settings UX, and productization gates.

The key promotion chain:

- MOSS-NANO-6F promoted Nano to app-prototype candidate with bounded lifecycle evidence.
- MOSS-NANO-7 added an experimental sidecar and IPC contract.
- MOSS-NANO-8 added an experimental narration strategy with segment-following timing truth.
- MOSS-NANO-9 added bounded segment cache/prefetch and continuity handoffs.
- MOSS-NANO-10 exposed settings-only Nano selection with readiness-gated preview.
- MOSS-NANO-11 kept Nano experimental-only because live product evidence was missing.
- MOSS-NANO-12 added the live four-mode evidence gate, but still kept Nano experimental-only because no live observation artifact was supplied.

PR #11 preserved and merged the Nano 6F-12 continuation state into main. Its CI was repaired and passed on both Ubuntu and Windows before merge.

## What We Are Trying To Do

We are not trying to make Nano default in the next step. We are trying to decide whether Nano is ready to move from "experimental-only" to "recommended opt-in" for users who have a local Nano runtime available.

The product thesis under review is:

1. Nano may offer a better long-form listening experience than Kokoro for some users.
2. Nano should remain segment-following unless real word-level timing exists.
3. Segment-following can be acceptable only if progress, anchors, pause/resume, and mode switches stay understandable.
4. Fallback must be explicit. The app must never silently pretend Kokoro output is Nano output.
5. Kokoro should remain available and unchanged until a separate retirement lane is justified by live evidence.

## Upcoming Work To Accomplish

The next proposed sprint is:

`MOSS-NANO-13 - Live Selected-Nano Observation Capture`

Its job is to produce a real live-evidence artifact for selected Nano across all four reader modes:

- Page
- Focus
- Flow
- Narrate

The artifact should be passed to `scripts/tts_eval_runner.mjs` through `--nano-live-evidence`. The gate should then classify Nano as one of:

- `NANO_RECOMMENDED_OPT_IN`
- `NANO_EXPERIMENTAL_ONLY`
- `PAUSE_NANO_PRODUCTIZATION`

Required live observations should cover:

- Nano selected and startable.
- Settings preview readiness is truthful.
- Segment-following progress is understandable.
- No fake word timing or underline race is introduced.
- Cache and prefetch do not stale-play.
- Pause and resume stay in the same reader mode.
- Mode switches preserve the global word or segment anchor.
- Fallback is explicit and never silent.
- Sidecar lifecycle remains stable.
- Packaging/runtime readiness remains clear.

## Main Risks For Review

- Timing truth: Nano currently uses segment-following truth, not word timestamps. Reviewers should decide if that is acceptable for Blurby's UX.
- Progress UX: Segment-level progress may be less precise than Kokoro word timing and could feel confusing in Narrate or Focus.
- Stale playback: Cache/prefetch must not admit audio from an old request, section, book, voice, rate, or text.
- Sidecar lifecycle: Shutdown, restart, cancellation, and readiness semantics must remain truthful under real use.
- Fallback behavior: Nano failure must be visible and explicit, not silently masked by another engine.
- Packaging burden: Experimental runtime readiness must be obvious before users can rely on Nano.
- Default drift: Recommended opt-in evidence should not accidentally become a default-engine or Kokoro-retirement decision.

## Reviewer Decision Requested

Please decide whether MOSS-NANO-13 is the right next sprint and whether its evidence plan is strong enough to support a future recommended-opt-in decision.

The strongest acceptable answer may still be "keep Nano experimental." That is a valid outcome if live evidence is missing, confusing, or not product-grade.
