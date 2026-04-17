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
