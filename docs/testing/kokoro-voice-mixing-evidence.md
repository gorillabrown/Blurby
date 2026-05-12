# KOKORO-DEEPEN-3 Voice Mixing Evidence (2026-05-11)

## Decision

`KOKORO-DEEPEN-3` concludes **NON-VIABLE on current runtime** for weighted voice formulas in Blurby's existing `kokoro-js` / ONNX path.

No public voice-mixing UX should be exposed on this runtime path.

## Evidence Artifact

- Probe script: `scripts/kokoro_voice_mix_probe.mjs`
- Probe run: `artifacts/kokoro/voice-mix-probe/kokoro-deepen-3-evidence/summary.json`
- Human-readable summary: `artifacts/kokoro/voice-mix-probe/kokoro-deepen-3-evidence/summary.txt`

The probe loads `KokoroTTS` from `onnx-community/Kokoro-82M-v1.0-ONNX` (`q4`), enumerates voices, and calls runtime voice validation on:

1. Baseline valid single voice (`af_bella`)
2. Weighted formula string (`af_bella:0.7+af_heart:0.3`)
3. Zero-weight formula (`af_bella:1+af_heart:0`)
4. Negative-weight formula (`af_bella:1+af_heart:-0.2`)
5. Formula containing an unknown voice (`af_bella:0.5+zz_missing:0.5`)

## Findings

1. **Single valid voice passes** runtime validation.
2. **Weighted formula strings are rejected** as unknown voice IDs by runtime validation (`Voice "<formula>" not found`).
3. For a syntactically valid weighted formula, **component voices can each be valid**, but the combined weighted formula string is still rejected by runtime.
4. Formula parser checks also reject **zero/negative weights** as invalid formula inputs.
5. Unknown voice IDs are rejected both as standalone voices and inside formula components.

## Scope Implications

- Keep current behavior: one discrete Kokoro voice ID per generation call.
- Do not alter defaults, migration, or profile semantics in user-facing settings for this sprint.
- If weighted mixing is desired later, treat it as a **separate runtime lane investigation** (for example PyTorch/KPipeline-style blending), not an incremental extension of current ONNX string voice selection.
