# TTS Evaluation Matrix + Soak Runbook

## Purpose

Run repeatable matrix and soak evaluations for flow/narration quality and compare results across branches without digging through raw traces.

## Inputs

- Fixture manifest: `tests/fixtures/narration/manifest.json`
- Matrix manifest: `tests/fixtures/narration/matrix.manifest.json`
- Runner: `scripts/tts_eval_runner.mjs`

## Smoke Matrix Run

```bash
npm run tts:eval:matrix -- --run-id smoke --tag smoke --out artifacts/tts-eval/matrix-smoke
```

Expected:

- Per-run artifacts in `traces/` and `summaries/`
- Rollups:
  - `summary.json`
  - `summary.txt`
  - `aggregate-summary.json`

## Matrix Run With Quality Gates

```bash
npm run tts:eval:matrix:gated -- --run-id release-candidate --out artifacts/tts-eval/release-candidate
```

Expected additional artifacts:

- `gate-report.json`
- `gate-report.txt`

Behavior:

- Exit code `0` when hard-fail gates pass
- Exit code `2` when one or more hard-fail gates are breached

## TTS-RATE-1 Release Pattern

For Kokoro rate validation after `TTS-RATE-1`, treat the matrix as a six-rate release gate, not a spot check. The current matrix manifest covers the full supported UI ladder:

- `1.0x` — `smoke-prose-default`
- `1.1x` — `smoke-dialogue-fast`
- `1.2x` — `punctuation-heavy-mid`
- `1.3x` — `long-form-stability`
- `1.4x` — `handoff-queue`
- `1.5x` — `chapter-transition`

Release expectation:

- All six runs complete and produce `aggregate-summary.json`, `summary.txt`, `gate-report.json`, and `gate-report.txt`
- Exact-speed UI behavior remains aligned to the requested rate even when generation uses the backing `1.0` / `1.2` / `1.5` Kokoro buckets
- In-bucket speed edits stay restart-free; any regression here should show up as continuity drift or failure-class movement in the gated matrix outputs

Reference PASS evidence from `TTS-RATE-1` closeout:

- Artifact set: `artifacts/tts-eval/final-gate-22`
- Aggregate runs: `6`
- Startup latency p50/p95: `433.5 / 501.75 ms`
- Drift p50/p95/max: `2 / 2 / 2`
- Pause/resume failures: `0`
- Handoff failures: `0`
- Gate result: `PASS` (`0/5` hard failures, `0/2` warnings)

## TTS-START-1 Startup-Parity Pattern

Use a dedicated startup-parity slice to compare cached and uncached starts directly:

```bash
npm run tts:eval:matrix -- --run-id start1-startup-parity --tag startup-parity --out artifacts/tts-eval/start1-startup-parity
```

Expected:

- Two startup scenarios in the output: `startup-parity-uncached` and `startup-parity-cached`
- Per-run summaries include:
  - `startupCacheMode`
  - `openingChunkWordCounts`
- Aggregate artifacts report:
  - `startupParity.cachedStartLatencyMs`
  - `startupParity.uncachedStartLatencyMs`
  - `startupParity.deltaMs`
  - `startupParity.openingRampMatches`

Release expectation after `TTS-START-1`:

- The gated release matrix still passes as a single release artifact set
- The startup-parity pair produces a real cached-vs-uncached startup delta while preserving the same opening ramp shape
- `summary.txt` reports `Opening ramp parity: match`

Reference PASS evidence from `TTS-START-1` closeout:

- Dedicated startup-parity artifact set: `artifacts/tts-eval/start1-startup-parity`
- Release artifact set: `artifacts/tts-eval/start1-release`
- Startup parity cached/uncached: `370 / 508 ms (delta 138 ms)`
- Opening ramp parity: `match`
- Gated release runs: `9`
- Gate result: `PASS`

## MOSS-NANO-11 Product Gate Pattern

Use the Nano product-gate slice only when explicitly validating selected-Nano productization readiness:

```bash
npm run tts:eval:matrix -- --run-id moss-nano-11-product-gate-shape --tag moss-nano-11 --out artifacts/tts-eval/moss-nano-11-product-gate-shape
```

Expected:

- Four selected-Nano scenarios run: Page, Focus, Flow, and Narrate.
- The scenarios are excluded from untagged matrix runs so normal release matrix evidence does not drift.
- `summary.json.mossNanoProductGate.maxDecision` remains `NANO_EXPERIMENTAL_ONLY` unless separate live evidence proves every productization requirement.

Promotion rules:

- If any selected-Nano live-book mode is missing, the decision cannot exceed `NANO_EXPERIMENTAL_ONLY`.
- `NANO_DEFAULT_CANDIDATE` requires full live-book matrix evidence, settings preview truth, selected-sidecar lifecycle evidence, cache/prefetch continuity, segment-following progress truth, explicit fallback behavior, package/runtime readiness, and Kokoro availability.
- `OPEN_KOKORO_RETIREMENT_LANE` requires a later approved retirement lane even after default-candidate-grade Nano evidence.

MOSS-NANO-11 closeout evidence:

- Gate-shape artifact: `artifacts/tts-eval/moss-nano-11-product-gate-shape`
- Result: four scenario shapes exercised by the eval runner, but live product evidence was not supplied to the gate.
- Decision cap: `NANO_EXPERIMENTAL_ONLY`; keep the current default unchanged and keep Kokoro available.

## MOSS-NANO-12 Live Four-Mode Evidence Pattern

Use this slice when validating whether Nano can become a recommended opt-in engine:

```bash
npm run tts:eval:matrix -- --run-id moss-nano-12-live-four-mode-evidence --tag moss-nano-12 --out artifacts/tts-eval/moss-nano-12-live-four-mode-evidence
```

To promote beyond experimental-only, supply a live observation artifact:

```bash
npm run tts:eval:matrix -- --run-id moss-nano-12-live-four-mode-evidence --tag moss-nano-12 --nano-live-evidence artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/live-evidence.json --out artifacts/tts-eval/moss-nano-12-live-four-mode-evidence
```

Live evidence must cover Page, Focus, Flow, and Narrate. Each mode must prove:

- Nano selected and startable
- segment-following progress is understandable to the user
- no fake word timing or underline race
- cache/prefetch continuity without stale playback
- pause/resume remains in the same mode
- mode switching preserves the global word/segment anchor
- fallback behavior is explicit
- sidecar lifecycle remains stable

Decision rules:

- Missing any mode or missing live observation evidence => `NANO_EXPERIMENTAL_ONLY`.
- Any unclear segment-following progress, stale playback, unsafe fallback, underline race, or lifecycle instability => `PAUSE_NANO_PRODUCTIZATION`.
- Only complete passing live evidence across all four modes can record `NANO_RECOMMENDED_OPT_IN`.

MOSS-NANO-12 closeout evidence:

- Artifact: `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence`
- Result: four selected-Nano evidence slots were exercised by the eval runner, but no live observation artifact was supplied.
- Decision: `NANO_EXPERIMENTAL_ONLY`; no default change and no Kokoro retirement.

## Short Soak Run

```bash
npm run tts:eval -- --soak-profile short --run-id soak-short --out artifacts/tts-eval/soak-short
```

Expected:

- Same rollups as matrix runs
- Checkpoint files in `checkpoints/` every profile interval or `--checkpoint-every` override

## Standard / Overnight Profiles

```bash
npm run tts:eval -- --soak-profile standard --run-id soak-standard --out artifacts/tts-eval/soak-standard
npm run tts:eval -- --soak-profile overnight --run-id soak-overnight --out artifacts/tts-eval/soak-overnight
```

## Interpretation Rules

- Startup regression: compare `aggregate-summary.json.startupLatency.p50/p95`
- Drift regression: compare `aggregate-summary.json.drift.p95/max`
- Stability regression:
  - `failureCounts.pauseResumeFailures`
  - `failureCounts.handoffFailures`
- Scenario-level diagnosis: inspect corresponding files in `summaries/` then `traces/`

## Reproducibility Notes

- Artifact names are deterministic for identical `run-id`, scenario ordering, and profile settings.
- Use a stable `--run-id` when comparing branches.
- Avoid mixing runs into the same output folder unless intentional.

## Related Governance Docs

- Baseline policy: `docs/testing/TTS_EVAL_BASELINE_POLICY.md`
- Baseline snapshot: `docs/testing/tts_eval_baseline_v1.json`
- Release closeout checklist: `docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md`
