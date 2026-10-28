# Engine Scan Artifacts

Each candidate gets its own folder:

artifacts/tts-eval/engine-scan/kokoro/
  run-manifest.json
  audio/literary-punctuation.wav
  notes/literary-punctuation.md

Repeat the same layout for `moss-tts`, `qwen3-tts`, `chatterbox-turbo`, and `melotts`.

`run-manifest.json` must list:
- `candidateId`
- `generatedAt`
- `runtime.shape`
- `runtime.device`
- `runtime.host`
- `outputs[]` with `fixtureId`, `audioFile`, `notesFile`, `wallSeconds`, and `usableWindowChars`
