# Qwen vs Kokoro Listening Review

## Status

This artifact is now live, but the required paired live-app review is still **not complete**.

- Sprint owner: `QWEN-HARDEN-1`
- Review status: `BLOCKED`
- Blocking requirement: two human listeners on a supported Qwen host
- Retirement impact: the `Narration quality` gate in `docs/testing/KOKORO_RETIREMENT_SCORECARD.md` must stay blocked until this review is completed

## Operational Evidence Collected In This Sprint

- Automated matrix summary: `artifacts/tts-eval/summary.txt`
- Aggregate metrics: `artifacts/tts-eval/aggregate-summary.json`
- Gate report: `artifacts/tts-eval/gate-report.json`
- Human-readable gate summary: `artifacts/tts-eval/gate-report.txt`

These artifacts confirm the operational side of the lane:

- Warm preview latency `p50/p95`: `1120 / 1156 ms`
- Warm first-audio latency `p50/p95`: `465 / 507.6 ms`
- Startup spikes above `3000 ms`: `0`
- Automated matrix result: `PASS`

## Fixture Slate For The Paired Review

Use the current matrix scenarios as the minimum listening set:

- `smoke-prose-default`
- `smoke-dialogue-fast`
- `punctuation-heavy-mid`
- `handoff-queue`
- `chapter-transition`
- `rate-edit-live-response`

## Listener Worksheet

Complete this section when the paired live-app review happens.

| Listener | Host | Fixture | Engine | Result | Notes |
|---|---|---|---|---|---|
| Pending | Pending supported Qwen host | `smoke-prose-default` | Qwen vs Kokoro | Pending | No live review captured in this CLI sprint. |
| Pending | Pending supported Qwen host | `smoke-dialogue-fast` | Qwen vs Kokoro | Pending | No live review captured in this CLI sprint. |
| Pending | Pending supported Qwen host | `punctuation-heavy-mid` | Qwen vs Kokoro | Pending | No live review captured in this CLI sprint. |
| Pending | Pending supported Qwen host | `handoff-queue` | Qwen vs Kokoro | Pending | No live review captured in this CLI sprint. |
| Pending | Pending supported Qwen host | `chapter-transition` | Qwen vs Kokoro | Pending | No live review captured in this CLI sprint. |
| Pending | Pending supported Qwen host | `rate-edit-live-response` | Qwen vs Kokoro | Pending | No live review captured in this CLI sprint. |

## Honest Outcome

`QWEN-HARDEN-1` now provides the automation and scorecard evidence needed to judge the lane operationally, but it does **not** settle the human listening comparison on its own. Kokoro retirement must continue to treat narration quality as blocked until this document is filled with real listener outcomes.
