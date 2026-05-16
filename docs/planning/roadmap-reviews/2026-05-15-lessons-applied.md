# Lessons Applied — 2026-05-15

## Lessons Reviewed
Scanned all 115 entries in LESSONS_LEARNED.md. 14 TTS-related entries are active and relevant to the current conveyor.

## Standing Rules Validation
All 10 Standing Rules in the TTS Architecture Completion section verified current. No new rules needed from TTS-SYNC-1 or TTS-DIAG-1 completions — their patterns (timing metadata fail-closed, diagnostics redaction) are already covered by LL-114 (spoken normalization ≠ display truth) and LL-115 (cache identity = data first).

## Spec Compliance Check
Spot-checked active sprint specs against relevant lessons:
- **ENGINE-DORMANCY-1** — compliant with LL-112 (isolated surfaces for opt-in engines), LL-099 (readiness from authoritative snapshot). Dormancy follows the Qwen-disable pattern from POSTV2-ENGINE-1.
- **TTS-INTEGRATE-1** — compliant with LL-114 (normalization ≠ display), LL-115 (cache identity = data). Integration merge preserves all existing contracts.
- **TTS-EVENT-SYNC-1** — compliant with LL-022 (TTS owns highlighting when active), LL-031 (generation ID guard for stale results). Event-driven sync strengthens the LL-022 pattern by replacing polling with push.
- **NORMALIZER-ENRICH-1** — compliant with LL-114 (normalizer output → engine input only; display/highlight words unchanged).
- **TTS-RENDER-MAP-1** — no conflicting lessons. New pattern (render-time position table) is additive.
- **TTS-PIPELINE-1** — compliant with LL-115 (cache identity tests use structured data).
- **TTS-ARCH-DOC-1** — documentation sprint; captures lessons as governance.

## New Lessons from This Review
None required — the dissolved sprint rationale and research provenance are captured in the plan and audit artifacts rather than as engineering lessons.

## Eager-Spec Buffer
- Before: 6 full specs + 1 stub (TTS-ARCH-DOC-1)
- After: 7 full specs + 0 stubs
- **Buffer status: FULL (7/7)**
