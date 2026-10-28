# TTS Evaluation Baseline Policy

## Purpose

Define how TTS quality baselines are maintained so release gates stay objective and reproducible.

## Baseline Artifacts

- Threshold config: `docs/testing/tts_quality_gates.v1.json`
- Baseline snapshot: `docs/testing/tts_eval_baseline_v1.json`
- Source manifests:
  - `tests/fixtures/narration/manifest.json`
  - `tests/fixtures/narration/matrix.manifest.json`

## Ownership

- Primary owner: release engineer on the active TTS sprint.
- Required reviewers:
  - One quality reviewer (voice/narration behavior)
  - One tooling reviewer (harness + gate script behavior)

## Update Protocol

1. Run matrix evaluation on current branch with gates enabled.
2. Confirm `gate-report.json` and `gate-report.txt` are produced.
3. Compare branch aggregate with current baseline snapshot.
4. If thresholds are changed, update `tts_quality_gates.v1.json` in the same PR and justify every change.
5. Refresh baseline snapshot metadata (commit, date, manifest hashes, aggregate metrics).
6. Record rationale in sprint closeout and release checklist.

## Approval Rules

- Baseline snapshot refresh requires both required reviewers.
- Threshold relaxations are allowed only with written rationale and reviewer sign-off.
- Threshold tightenings are preferred when quality has improved and remains stable across at least one matrix run.

## Review Checklist

- Matrix run used committed fixture + matrix manifests.
- Manifest hashes in snapshot match current repository files.
- Gate evaluator result is reproducible from clean checkout.
- Hard-fail breaches block release; warn-only breaches are acknowledged in reviewer notes.
