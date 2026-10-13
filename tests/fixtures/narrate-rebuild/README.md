# NARRATE-REBUILD-1 Phase 0 corpus

Text fixtures for the Phase 0 Kokoro proof (ROADMAP, NARRATE-REBUILD-1; charter choice T1).

- `passage-a.txt`: Meditations Book 1 section I plus the first sentence of section II (Casaubon, Gutenberg #2680), extracted from `resources/sample-meditations.epub`.
- `passage-b.txt`: composite of four legacy fixtures (prose, dialogue, punctuation, then a section break and the section transition).
- `legacy/`: eight narration fixtures, their manifest and `engine-scan/`, copied byte for byte from base 612d03f5bdadf861a875d76c6260fd8d3a7520aa (`tests/fixtures/narration/`).
- `manifest.json`: passages, word counts, sources, voices and the rate grid (0.80 to 2.00 in 0.05 steps).

Omitted from the legacy copy (old run traces, not corpus): baseline/chapter-transition-1776382372190.summary.json, baseline/chapter-transition-1776382372190.trace.json, baseline/dialogue-switches-1776382372179.summary.json, baseline/dialogue-switches-1776382372179.trace.json, baseline/long-sentence-1776382372187.summary.json, baseline/long-sentence-1776382372187.trace.json, baseline/pause-resume-1776382372191.summary.json, baseline/pause-resume-1776382372191.trace.json, baseline/prose-basic-1776382372177.summary.json, baseline/prose-basic-1776382372177.trace.json, baseline/punctuation-dense-1776382372188.summary.json, baseline/punctuation-dense-1776382372188.trace.json, baseline/queued-handoff-1776382372190.summary.json, baseline/queued-handoff-1776382372190.trace.json, baseline/section-transition-1776382372189.summary.json, baseline/section-transition-1776382372189.trace.json, baseline/summary.json, baseline/summary.txt, matrix.manifest.json.

Audio never enters the repository. Nothing here is named `*.test.*` (LL-146).
