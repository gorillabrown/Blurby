# Blurby Qwen + Kokoro Audit Packet

## Status
- Packet status: `finalized`
- Lifecycle status: `retired historical audit packet`
- Finalized on: `2026-04-18`

This folder is now a closed audit record. It should be read as the final packet state for this audit cycle, not as the active working area for ongoing prototype design.

## Purpose
This packet is a standalone third-party audit set for Blurby's proposed `Qwen + Kokoro` local TTS prototype.

The audit question is not "which open TTS model is best in general?" The question is narrower:

> Does the current evidence and prototype plan justify proceeding with a real Blurby prototype that keeps Kokoro as the default path and adds Qwen as an external-runtime-backed prototype engine?

This packet assumes no repository access and no prior chat history.

## Read Order
1. `AUDIT_BRIEF.md`
2. `IMPLEMENTATION_READINESS_SPEC.md`
3. `AUTHORITATIVE_RECORD.md`
4. `EVIDENCE_APPENDIX.md`
5. `SUPERSEDED_BACKGROUND.md`
6. `AUDITOR_PROMPT.md`
7. `RESPONSE_TEMPLATE.md`
8. `3rd Party/README.md`
9. `3rd Party/AUDITOR_REMEDIATION_RESPONSE.md`

## Packet Structure
- `AUDIT_BRIEF.md`
  Executive framing, evidence buckets, and the exact audit target.
- `IMPLEMENTATION_READINESS_SPEC.md`
  The current proposed Qwen + Kokoro prototype plan for review.
- `AUTHORITATIVE_RECORD.md`
  The current source-of-truth record distilled from the active engine-scan lane.
- `EVIDENCE_APPENDIX.md`
  Inventory of included direct evidence and context files.
- `SUPERSEDED_BACKGROUND.md`
  Why the older investigation docs are background only and not the current authority.
- `AUDITOR_PROMPT.md`
  Copy/paste prompt for the outside reviewer.
- `RESPONSE_TEMPLATE.md`
  Suggested reply structure for the reviewer.
- `sources/`
  Copied source materials from the current repo.
- `artifacts/`
  Selected empirical artifacts and manifests.
- `3rd Party/`
  External review materials for this packet, including the raw third-party response and the accepted remediation response.

## Important Framing Rules
- Do not treat this packet as proof that Kokoro is the best overall local TTS engine.
- Do treat Kokoro as the best-supported current default in the enclosed record.
- Do not treat Qwen as empirically failed.
- The raw copied superseded-background docs intentionally retain their original unresolved citation markers because that flaw is part of why they are no longer authoritative.
- Preserve the distinction between:
  - completed empirical lane
  - attempted-but-dropped lane
  - active-but-unrun or host-blocked lane
  - superseded background

## Capture Date
- Packet assembled: `2026-04-18`
- Repository root at capture time: `C:\Users\estra\Projects\Blurby`

## Closure Note
- The active next-step work should proceed from the revised packet documents in this folder, not from the older superseded investigation docs.
- The raw third-party audit response is retained for record, but only the bounded audit conclusions plus the accepted remediation response should shape v1 scope.
- The distributable archive for this retired packet lives outside this folder as:
  - `C:\Users\estra\Projects\Blurby\docs\research\third-party-audit\2026-04-18-qwen-kokoro-readiness-audit-package.zip`
