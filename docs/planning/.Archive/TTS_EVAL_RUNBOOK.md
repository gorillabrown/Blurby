# TTS Evaluation Harness Runbook

## Goal

Generate reproducible trace artifacts for narration quality checks across fixtures.

## Command

```bash
npm run tts:eval -- --out artifacts/tts-eval
```

Optional:

```bash
npm run tts:eval -- --fixtures prose-basic,pause-resume --mode flow --rate 1.1 --out artifacts/tts-eval
```

## Inputs

- Fixture manifest: `tests/fixtures/narration/manifest.json`
- Fixture texts: `tests/fixtures/narration/*.txt`

## Outputs

- Per run trace: `artifacts/tts-eval/<runId>.trace.json`
- Per run summary: `artifacts/tts-eval/<runId>.summary.json`
- Rollup summary: `artifacts/tts-eval/summary.json`
- Human summary: `artifacts/tts-eval/summary.txt`

## Review Workflow

1. Run the harness for baseline fixtures.
2. Open `summary.txt` for quick failure-class scan.
3. For each flagged fixture, inspect the matching `.trace.json`.
4. Fill `docs/governance/TTS_EVAL_REVIEW_TEMPLATE.md`.
5. Compare branch outputs against baseline rollup.

## Required Baseline Checks

- Start latency is captured per fixture.
- Word + flow-position events are both present.
- Pause/resume lifecycle events are balanced when expected.
- Section/chapter/book/handoff events are present for transition fixtures.
- Failure classes are understandable without hidden internal context.

