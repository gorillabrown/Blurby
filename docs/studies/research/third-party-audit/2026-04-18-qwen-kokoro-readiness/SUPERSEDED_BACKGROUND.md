# Superseded Background

## Purpose
This packet includes two older investigation documents for historical context:

- `sources/investigations/TTS Model Evaluation for Blurby App.md`
- `sources/investigations/deep-research-report.md`

They are included so an outside reviewer can see what the earlier research looked like and why the current packet uses a narrower, more auditable frame.

They are not the current decision record.
The copied files retain their original unresolved citation markers on purpose so the reviewer can see the auditability problem directly.

## Why They Are Not Authoritative
The earlier documents were reviewed and found to have material reasoning and auditability problems. The most important findings were:

1. The hard-gate screen in the older evaluation memo was internally inconsistent.
2. The older evaluation memo understated Blurby's current Kokoro baseline by saying Kokoro required an external forced aligner for timing metadata, even though the current Blurby Kokoro IPC path already returns `wordTimestamps`.
3. The older evaluation memo recommended Qwen3-TTS too strongly relative to its evidence base.
4. The older deep-research report was not independently auditable because it relied on unresolved chat-session placeholder citations rather than standalone citations.
5. The older deep-research report compressed tested and untested lanes into one recommendation, making the ranking look more evidence-complete than it was.

## How To Use These Background Files
- Use them to understand the evolution of the research.
- Do not use them as the primary basis for a go or no-go decision.
- If they conflict with `AUTHORITATIVE_RECORD.md`, the authoritative record wins.
- If they recommend a stronger conclusion than the current packet supports, treat that stronger conclusion as superseded.

## Plain-Language Bottom Line
The packet keeps these files because deleting them would hide the research history.

But the current audit should be based on:
- the active engine-scan artifacts
- the current source-verified dossiers
- the current Kokoro code evidence
- the enclosed implementation-readiness spec
