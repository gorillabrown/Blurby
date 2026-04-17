# TTS Evaluation Release Checklist

Use this checklist in sprint closeouts that touch narration or flow quality.

## Run Metadata

- Sprint / branch:
- Commit SHA:
- Reviewer:
- Date:
- Matrix command used:
- Artifact directory:

## Gate Status

- `gate-report.json` generated
- `gate-report.txt` generated
- Gate result: PASS / FAIL
- Hard-fail breaches reviewed
- Warn-only breaches acknowledged

## Aggregate Metrics Snapshot

- Startup latency p50:
- Startup latency p95:
- Drift p50:
- Drift p95:
- Drift max:
- Pause/resume failures:
- Handoff failures:

## Baseline Review

- Compared against `docs/testing/tts_eval_baseline_v1.json`
- Manifest hashes match expected fixture + matrix manifests
- Threshold config version used:
- Baseline refresh required: yes/no

## Subjective Quality Review (1-5)

- Voice naturalness:
- Pronunciation consistency:
- Cursor/audio sync quality:
- Transition/handoff smoothness:
- Overall release confidence:

## Release Decision

- Ready to release: yes/no
- Blocking issues:
- Follow-up owner + ETA:
