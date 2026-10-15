# NARRATE-REBUILD-1 Phase 0 corpus

Text fixtures for the Phase 0 Kokoro proof (ROADMAP, NARRATE-REBUILD-1; charter choice T1).

- `passage-a.txt`: Meditations Book 1 section I plus the first sentence of section II (Casaubon, Gutenberg #2680), extracted from `resources/sample-meditations.epub`.
- `passage-b.txt`: composite of four legacy fixtures (prose, dialogue, punctuation, then a section break and the section transition).
- `legacy/`: eight narration fixtures, their manifest and `engine-scan/`, copied byte for byte from base 612d03f5bdadf861a875d76c6260fd8d3a7520aa (`tests/fixtures/narration/`).
- `manifest.json`: passages, word counts, sources, voices and the rate grid (0.80 to 2.00 in 0.05 steps).
- `kokoro-tokenizer/` (P6b): `tokenizer.json` (3,497 bytes, sha256 `77a02c8e164413299b4b4c403b14f8e0e1c1b727db4d46a09d6327b861060a34`) and `tokenizer_config.json` (113 bytes, sha256 `be1cb066d6ef6b074b3f15e6a6dd21ac88ff3cdaedf325f0aaed686c70f75d20`), unmodified from onnx-community/Kokoro-82M-v1.0-ONNX (Hugging Face) under the Apache License 2.0 (`LICENSE`, `NOTICE.md`), byte copies of the artifacts copy. Pinned by `tests/narrate/narrate.fixtures.test.js` and `scripts/narrate-rebuild/reconcile-sweep.mjs --check-tokenizer`; the sweep's real tokenizer.
- `raven-1845.txt` (P6b): Edgar Allan Poe, "The Raven" (first published 1845; public domain), all 18 stanzas written out from the standard text, one blank line between stanzas, no title or apparatus (1,067 whitespace words, sha256 `9d211de99d67095930e88bac1920577aaad1cc65e75be4738c762e997df0f97d`). Not downloaded and not the owner's library copy. The sweep's `.txt` loader treats each stanza as a paragraph.

Omitted from the legacy copy (old run traces, not corpus): baseline/chapter-transition-1776382372190.summary.json, baseline/chapter-transition-1776382372190.trace.json, baseline/dialogue-switches-1776382372179.summary.json, baseline/dialogue-switches-1776382372179.trace.json, baseline/long-sentence-1776382372187.summary.json, baseline/long-sentence-1776382372187.trace.json, baseline/pause-resume-1776382372191.summary.json, baseline/pause-resume-1776382372191.trace.json, baseline/prose-basic-1776382372177.summary.json, baseline/prose-basic-1776382372177.trace.json, baseline/punctuation-dense-1776382372188.summary.json, baseline/punctuation-dense-1776382372188.trace.json, baseline/queued-handoff-1776382372190.summary.json, baseline/queued-handoff-1776382372190.trace.json, baseline/section-transition-1776382372189.summary.json, baseline/section-transition-1776382372189.trace.json, baseline/summary.json, baseline/summary.txt, matrix.manifest.json.

Audio never enters the repository. Nothing here is named `*.test.*` (LL-146).
