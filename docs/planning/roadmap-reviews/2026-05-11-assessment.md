# 2026-05-11 Roadmap Review Assessment

## Bottom Line

Blurby is aligned around the right TTS center of gravity: preserve Kokoro plus the Web Audio scheduler, then make the implicit architecture explicit. The next work should be deliberately unglamorous: provider capability truth, deterministic text normalization, cache/timing metadata, highlight sync policy, and diagnostics.

## Status

| Area | Assessment | Decision |
|---|---|---|
| Kokoro default/timing baseline | Green | Preserve. Do not reopen default-engine churn. |
| Qwen | Closed/disabled | Do not reactivate. |
| MOSS-Nano | Recommended opt-in | Keep as opt-in; no default promotion. |
| Pocket TTS | Available opt-in | Keep as opt-in; no voice-cloning UX expansion in this lane. |
| Voice mixing | Non-viable on current Kokoro runtime | Defer; no public UX. |
| Cache/timing metadata | Weakest architecture gap | Promote to near-term sprint. |
| Export | Valuable but premature | Defer behind architecture buffer. |

## Scope Discipline

The synthesis report could tempt another engine or export sprint. The review rejects that. The approved work strengthens the current Kokoro path rather than expanding model scope.

## Queue Health

The queue is healthy only after `KOKORO-DEEPEN-3` is durably closed. Until then, the next pointer is prepared but gated. Once closed, the buffer has five dispatch-ready architecture sprints.

## Risk

The largest risk is cache/timing migration. `TTS-CACHE-TIMING-1` must be non-destructive and treat legacy cache entries as safe misses unless compatibility is proven.
