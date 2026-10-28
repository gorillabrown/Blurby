# Blurby TTS No-Orphan Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` for inline execution or `superpowers:subagent-driven-development` if splitting the remediation into parallel document-editing workers. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current Blurby TTS integrated synthesis from a directionally correct but insufficiently proven artifact into a strict no-orphan report where every substantive element from [O], [A], [B], [C], and [D] is visibly preserved, source-attributed, and traceable to body or appendix evidence.

**Architecture:** Treat the current integrated synthesis as the main report, and add detail-preserving appendices instead of overloading the narrative body. Convert the child ledger from an inventory/destination map into a body-evidence proof by adding concrete evidence anchors or preserving omitted details directly in appendices.

**Tech Stack:** Markdown documents, PowerShell verification commands, source files under `C:\Users\estra\Projects\Blurby.Research`, report artifacts under `C:\Users\estra\Projects\Blurby\artifacts`.

---

## 1. Current Verdict To Remediate

The current integrated report is **not** strict no-orphan complete.

The existing `PASS: No orphaned elements detected.` is unsupported because the child ledger proves that rows were generated and destination-assigned, but it does not prove that every row appears in the report body or a detail-preserving appendix.

The remediation target is to make the report pass this stronger standard:

1. Every [O] child row appears in the report body or appendix with preserved substantive content.
2. Every unique or strongest contribution from [A], [B], [C], and [D] appears in the report body or appendix.
3. Every traceability row has an evidence anchor, not only a destination.
4. No source-confidence caveat, conflict, negative finding, avoid item, defer item, test recommendation, roadmap item, or low-priority element is silently generalized away.
5. The final audit says `PASS` only after evidence-backed verification is complete.

---

## 2. File Map

### Source Files

- Read-only source [O]: `C:\Users\estra\Projects\Blurby.Research\Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`
- Read-only source [A]: `C:\Users\estra\Projects\Blurby.Research\.Findings\Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`
- Read-only source [B]: `C:\Users\estra\Projects\Blurby.Research\.Findings\compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`
- Read-only source [C]: `C:\Users\estra\Projects\Blurby.Research\.Findings\deep-research-report.md`
- Read-only source [D]: `C:\Users\estra\Projects\Blurby.Research\.Findings\TTS_LITERATURE_REVIEW_2026-05-11.md`

### Artifacts To Modify

- Modify main report: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md`
- Modify child ledger: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Child_Element_Ledger_2026-05-11.md`

### Artifacts To Create

- Create remediation appendix: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_No_Orphan_Remediation_Appendix_2026-05-11.md`
- Create evidence ledger: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md`
- Create final audit transcript: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Final_No_Orphan_Audit_2026-05-11.md`

### Do Not Modify

- Do not edit the five source files.
- Do not rewrite the whole integrated report from scratch unless later verification proves the current report is structurally unusable.
- Do not run git operations as part of this remediation plan.

---

## 3. Remediation Strategy

Use an append-only correction pattern:

1. Downgrade the unsupported final PASS immediately.
2. Add missing technical specificity to the main report where it belongs.
3. Add a detailed project-by-project appendix so file inventories and architecture summaries are preserved without bloating the executive narrative.
4. Add a source-specific unique-contribution appendix for [A], [B], [C], and [D].
5. Regenerate or patch the child ledger so every row has an evidence anchor.
6. Re-run no-orphan verification.
7. Restore PASS only if every row has evidence-backed inclusion.

---

## 4. Phase 1 - Stop False Certification

**Objective:** Remove unsupported PASS language until body-evidence verification is complete.

**Files:**

- Modify: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md`

### Task 1.1: Downgrade Final Audit Status

- [ ] Find the final line:

```text
PASS: No orphaned elements detected.
```

- [ ] Replace it with:

```text
FAIL: Child-level traceability and project-detail preservation remain incomplete. The current child ledger is an inventory and destination map; final PASS requires body or appendix evidence for every row.
```

- [ ] In `# 6. Final No-Orphan Audit`, replace any claim that every element is incorporated with this bounded status:

```text
Current audit status: remediation in progress. The report preserves the central synthesis and major divergences, but strict no-orphan completion requires body-evidence anchors for every child-ledger row and restoration of the missing source-specific details listed in the remediation appendix.
```

### Task 1.2: Add Evidence Standard To Traceability Appendix

- [ ] In `# 5. Traceability Appendix`, insert this paragraph after the first paragraph:

```text
For strict no-orphan purposes, a destination assignment is not sufficient. A row is complete only when the final report body, a report table, or a linked appendix preserves the substantive element with source labels and enough specificity that an implementer can recover the original finding, caveat, risk, recommendation, test item, roadmap item, or negative evidence.
```

### Task 1.3: Verify Phase 1

Run:

```powershell
$report='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md'
[pscustomobject]@{
  PassCount=(Select-String -LiteralPath $report -Pattern 'PASS: No orphaned elements detected' -SimpleMatch).Count
  FailCount=(Select-String -LiteralPath $report -Pattern 'FAIL: Child-level traceability' -SimpleMatch).Count
  EvidenceStandard=(Select-String -LiteralPath $report -Pattern 'a destination assignment is not sufficient' -SimpleMatch).Count
}
```

Expected:

```text
PassCount        : 0
FailCount        : 1
EvidenceStandard : 1
```

**Gate:** The report no longer falsely certifies PASS.

---

## 5. Phase 2 - Restore Architecture And Interface Specificity

**Objective:** Restore precise technical fields from [O], [A], [B], [C], and [D] that were weakened into broad summaries.

**Files:**

- Modify: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md`

### Task 2.1: Expand `TTSProvider` And `ProviderCapabilities`

- [ ] In `## 4.9 Recommended Architecture`, replace the current `TTSProvider` paragraph with:

```text
`TTSProvider` should map from the current `TtsStrategy` boundary and initialize/preload/warm up, report status/health, list voices, synthesize a segment/job, optionally stream frames, emit timing metadata if supported, and stop/pause/resume only where the provider supports those operations [O][A][B][C][D].

`ProviderCapabilities` must explicitly include `id` / engine ID, label/display name, streaming support, pause/resume support, native pause/resume support, seek-within-segment/audio support, word timing support, sentence timing support, phoneme timing support, timing truth enum, boundary reliability, offline/online status, network requirement, sidecar requirement, required or optional GPU, cacheability, experimental/selectable status, supported languages, sample rate, speed/rate range, SSML support, max utterance chars, voice blending support, packaging status, and license/commercial/TOS acceptance [O][A][C][D].
```

### Task 2.2: Expand `TTSProviderRegistry`

- [ ] In `## 4.9 Recommended Architecture`, replace or extend the registry paragraph with:

```text
`TTSProviderRegistry` should register providers, get/list/filter providers, resolve the provider for a request, resolve fallback order, enforce capability requirements, hide experimental providers unless `ExperimentalModelGate` allows them, drive UI selection/status, and degrade highlighting mode based on timing truth [O][A][B][C][D]. Registry policy should encode preferred provider if healthy, secondary provider with the same language/voice if available, fallback to Web/system TTS, and final sentence/segment-only mode when timing or synthesis capability is insufficient [O][C].
```

### Task 2.3: Expand Segment Model Details

- [ ] In `## 4.9 Recommended Architecture`, add this paragraph after the `DocumentSegmenter` / `NarrationSegment` paragraph:

```text
Segment fields collected across the sources include `segmentId` / `id`, `bookId` / `docId`, `sectionId`, `sectionIndex`, ordinal, EPUB CFI or PDF text locator or flat char offsets, paragraph ID, sentence index, source/display/original/raw text, normalized/synthesis text, source character start/end, word start index/word count, word spans, structural role/kind such as heading, paragraph, sentence, dialogue, caption, footnote, table, or unknown, provider compatibility flags, normalizer version, and DOM range reference for highlighting when used [O][A][B][C][D]. Stable segment ID options from the source set include `chap0000_p0000_s0000`, `sha1(docId:cfi:sentenceIndex)`, and `docId + sectionIndex + locator + ordinal + normalization seed`; the adopted rule remains deterministic document location plus local ordinal, not queue order or plain text hash alone [O][B][C][D].
```

### Task 2.4: Expand `SegmentNormalizer` Pipeline

- [ ] In `## 4.9 Recommended Architecture`, replace or extend the `SegmentNormalizer` paragraph with:

```text
`SegmentNormalizer` should be a pure, non-destructive, versioned, provider-agnostic function with optional provider-specific final pass; it applies pronunciation overrides and returns normalized text plus trace/hash while keeping source/display text separate [O][A][B][C][D]. Pipeline candidates include pronunciation overrides first, NFKC normalization, ligature folding, smart quote folding, wrapped-line joining, abbreviation and initial expansion, spaced initial collapse, number-to-words, year-aware number conversion, currency expansion, time expansion, date expansion, ordinal/cardinal expansion, ranges, fractions, URLs, footnotes where adopted, sentence-end punctuation injection only for TTS copy with caution, citation/artifact stripping, and whitespace collapse [O][B][D]. Safeguards are golden fixtures before broad rollout, `normalizerVersion` in cache identity, a one-minor-release feature flag in [D], English-first rollout, and locale routing for future ES/FR/JP/ZH [O][D].
```

### Task 2.5: Expand Cache, Timing, And Highlight Fields

- [ ] Replace or extend the `AudioCache`, `TimingMetadataStore`, and `HighlightSyncController` paragraphs with:

```text
`AudioCache` should store audio file/blob, timing JSON sidecar, metadata JSON, checksum/hash of synthesis text, and structured key components: `docId`, `segmentId`, `providerId`, `providerVersion`, `modelId` / `modelVersion`, `voiceId` or voice formula, `rate`, `pitch`, generation/rate bucket, `normalizationVersion`, `pronunciationVersion` / override hash, `audioFormatVersion`, and normalized text hash [O][A][C][D]. Enhancements include structured/encoded keys, schema version/migration, secondary content-addressed index, clear-cache-per-book UI, and cache growth controls [O][A][C][D].

`TimingMetadataStore` should put/get timings by segment, find segment/word at absolute ms, store sentence and word timings separately, store provider provenance, confidence/timing truth, drift and post-processing validity, and export SMIL if audiobook export is added [O][A][B][C][D]. Required metadata includes segment ID, provider ID, timing truth, sample rate, duration, word timestamps with confidence, drift, generated time, provider version, model version, and normalizer version [O][A][C][D].

`HighlightSyncController` should own visual following, attach/detach from scheduler and timing store, support sentence/word/off modes, segment fallback, opacity/color settings, mapping timing spans to document ranges via locators/offsets, and graceful degradation when timing confidence is low [O][A][B][C][D].
```

### Task 2.6: Verify Phase 2

Run:

```powershell
$report='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md'
$terms=@(
  'phoneme timing support',
  'label/display name',
  'secondary provider with the same language/voice',
  'chap0000_p0000_s0000',
  'sha1(docId:cfi:sentenceIndex)',
  'provider compatibility flags',
  'DOM range reference',
  'spaced initial collapse',
  'year-aware number conversion',
  'audioFormatVersion',
  'clear-cache-per-book UI',
  'generated time',
  'opacity/color settings',
  'ES/FR/JP/ZH'
)
foreach ($term in $terms) {
  [pscustomobject]@{ Term=$term; Count=(Select-String -LiteralPath $report -Pattern $term -SimpleMatch).Count }
}
```

Expected: every `Count` is at least `1`.

**Gate:** The report preserves exact architecture/interface fields rather than vague architecture summaries.

---

## 6. Phase 3 - Add Project Detail Appendix

**Objective:** Preserve each reviewed project’s purpose, reviewed files/features, architecture summary, strengths, weaknesses, reusable patterns, avoid items, and roadmap impact.

**Files:**

- Create: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_No_Orphan_Remediation_Appendix_2026-05-11.md`
- Modify: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md`

### Task 3.1: Create Appendix Header

- [ ] Create the appendix with this header:

```markdown
# Blurby TTS No-Orphan Remediation Appendix

This appendix preserves child-level details that are too granular for the integrated report narrative but are required by the no-orphan standard. It is source-traceable to [O], [A], [B], [C], and [D] and should be treated as part of the final integrated research report.

## A. Project-by-Project Detail Preservation
```

### Task 3.2: Add Abogen Detail

- [ ] Add:

```markdown
### A.1 Abogen [O][A][B][C][D]

Purpose: batch audiobook/document-to-audio generator using Kokoro and structured metadata; generates audio, subtitles, chapter markers, and export artifacts.

Reviewed files/features: `chunking.py`, `kokoro_text_normalization.py`, `book_parser.py`, `subtitle_utils.py`, `conversion_runner.py` / `conversion.py`, `voice_cache.py`, `pronunciation_store.py`, `heteronym_overrides.py`, `word_substitution.py`, `voice_formulas.py`, `voice_formula_gui.py`, `epub3/exporter.py`, EPUB3/SMIL direction, FFmetadata chapter mux, and ASS karaoke `\kf` subtitle timing.

Architecture summary: extraction produces chapters/book text; chunking creates deterministic paragraph/sentence chunks; normalization and pronunciation overrides feed Kokoro/SuperTonic; audio, subtitle, and metadata artifacts are generated as batch outputs; voice assets are prefetched from Hugging Face with local-files-first behavior.

Strengths: deterministic chunk IDs; separate `original_text`, `display_text`, and `normalized_text`; rich Kokoro-specific normalization; pronunciation store; heteronym overrides; voice formulas and weighted tensor blending; chapter markers; M4B/SRT/ASS/export feature surface; idempotent voice asset caching.

Weaknesses and avoid items: batch/offline generation is not live Electron playback; regex/abbreviation sentence splitting is weaker than Blurby planner; full-chapter or whole-text processing can be memory-heavy; monolithic QThread conversion appears in [D]; hardcoded `device="cpu"` in voice blending path appears in [D]; broad normalization can regress word offsets if copied wholesale. Avoid replacing Blurby’s live planner with regex splitting, batch generation as live narration core, multi-speaker/export complexity before product need, and hardcoded CPU fallback for blended voices.

Reusable patterns and roadmap impact: segment/chunk ID scheme, text-layer separation, normalizer versioning, pronunciation override persistence, voice formula parser, voice asset cache/prefetch, chapter marker model, EPUB3/SMIL/M4B/SRT/ASS export as future product features. P1: segment metadata, normalizer, pronunciation UI. P2: voice blending. P3/future: export features and voice prefetch polish.
```

### Task 3.3: Add RealtimeTTS Detail

- [ ] Add:

```markdown
### A.2 RealtimeTTS [O][A][B][C][D]

Purpose: streaming TTS orchestration library across many engines.

Reviewed files/features: `text_to_stream.py`, `stream_player.py`, `engines/base_engine.py`, `engines/kokoro_engine.py`, `engines/moss_tts_engine.py`, `engines/coqui_engine.py`, `engines/faster_qwen_engine.py`, `threadsafe_generators.py`, `safepipe.py`, and lazy engine imports.

Architecture summary: `TextToAudioStream` consumes text/fragments; pluggable engines synthesize and push PCM to a queue; timing information is pushed on a parallel queue/list; `StreamPlayer` consumes audio and fires callbacks; engine lists and fallback are supported.

Strengths: clean provider abstraction; fallback engine list; timing event shape; sentence-fragment-first synthesis; buffer-threshold prefetch/backpressure; callback-rich lifecycle; subprocess/worker isolation for heavy engines; voice blend formula in Kokoro engine; CUDA graph warmup and sentinel speaker embedding cache in [D].

Weaknesses and avoid items: Python, PyAudio, mpv, optional dependency sprawl; playback stack unsuitable for Electron; heavy NLTK/Stanza tokenizers; timing may drift when trimming/post-processing is not accounted for; busy-wait pause loops and in-place timing mutation in [D]; engine matrix can break with upstream dependencies. Avoid embedding the Python runtime, PyAudio/mpv playback, threading model and busy-waits, and letting streaming fragments define canonical document segment identity.

Reusable patterns and roadmap impact: `TTSProvider` / `BaseEngine`-style contract, audio and timing queues, buffered-seconds accounting, fallback events, voice formula parsing, lazy optional engine loading. P1 provider registry, P2 buffered-seconds backpressure, P2 voice blending.
```

### Task 3.4: Add Readest Detail

- [ ] Add:

```markdown
### A.3 Readest [O][A][B][C][D]

Purpose: cross-platform ebook reader with integrated TTS; most strategically similar to Blurby in [B]/[D].

Reviewed files/features: `TTSController.ts`, `TTSClient.ts`, `WebSpeechClient.ts`, `EdgeTTSClient.ts`, `NativeTTSClient.ts`, `TTSUtils.ts`, `utils/ssml.ts`, `useTTSControl.ts`, `useTTSMediaSession.ts`, `ttsMetadata.ts`, `ttsTime.ts`, Foliate viewer and `foliate-js/tts.js`, and Android native TTS plugin.

Architecture summary: document-aware controller above multiple clients; SSML/mark-based segmentation and highlight dispatch; provider clients speak SSML and emit boundary/mark events; controller handles state transitions, section initialization, prefetch, mark dispatch, and highlighting.

Strengths: clean TypeScript provider/client interface; Foliate-aware traversal and reject filters; SSML mark bridge to highlighting; preload race discipline; persistent TTS bar/settings UX; MediaSession integration; named pause-reason states; per-engine-per-language voice memory; tests for PDF/XHTML/document quirks.

Weaknesses and avoid items: sentence granularity only; HTML `<audio>` scheduling weaker than Blurby Web Audio; Edge TTS remote/auth/ToS risks; native Android pause/resume is not true resume; Tauri plugin architecture is not directly reusable in Electron; potential audio element churn and audible gaps in [B]. Avoid Edge as core offline path, synthetic `<audio>` scheduling, hard-coded reverse-engineered Edge auth token, and assuming sentence-only forever.

Reusable patterns and roadmap impact: controller/client abstraction, Foliate section traversal, reject filters for `rt`, `canvas`, `br`, annotation layers, footnotes, and decorative nodes, state machine and expected abort handling, back-to-current/media/session UX, voice preference keying by engine/language, TTS time estimation. P2/P3 selected UX controls; investigate Foliate `tts.js` / `textWalker` without replacing current internals by assumption.
```

### Task 3.5: Add Remaining Project Details

- [ ] Add equivalent subsections for Coqui TTS, Sioyek, PDF Narrator, ttsreader, Ultimate TTS Reader, and Markor using [O] §5.4-§5.9 as the controlling text.
- [ ] Ensure the following specific terms appear in the appendix:

```text
God-object `Synthesizer`
XTTS-v2 CPML/non-commercial
PowerShell/SoX/Aeneas/pygame/Flask/local paths
coordinate-space discipline
column-blind PDF extraction
hardcoded thresholds
peak-normalizing audio chunks
runtime method rewriting
process re-exec
issue #768/Select-to-Speak
```

### Task 3.6: Link Appendix From Main Report

- [ ] In `## 4.8 Project-by-Project Lessons`, add:

```text
The compact table below is the narrative synthesis. The full child-level project inventory, including reviewed files/features, architecture summaries, strengths, weaknesses, reusable patterns, avoid items, and roadmap impacts for every reviewed project, is preserved in `artifacts/Blurby_TTS_No_Orphan_Remediation_Appendix_2026-05-11.md` [O][A][B][C][D].
```

### Task 3.7: Verify Phase 3

Run:

```powershell
$appendix='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_No_Orphan_Remediation_Appendix_2026-05-11.md'
$terms=@(
  'voice_cache.py',
  'subtitle_utils.py',
  'FFmetadata',
  'ASS karaoke',
  'CUDA graph warmup',
  'sentinel speaker embedding cache',
  'TTSController.ts',
  'useTTSMediaSession.ts',
  'foliate-js/tts.js',
  'God-object `Synthesizer`',
  'PowerShell/SoX/Aeneas/pygame/Flask/local paths',
  'column-blind PDF extraction',
  'peak-normalizing audio chunks',
  'runtime method rewriting',
  'process re-exec',
  'issue #768/Select-to-Speak'
)
foreach ($term in $terms) {
  [pscustomobject]@{ Term=$term; Count=(Select-String -LiteralPath $appendix -Pattern $term -SimpleMatch).Count }
}
```

Expected: every `Count` is at least `1`.

**Gate:** Each reviewed project has child-level detail preserved outside the compact table.

---

## 7. Phase 4 - Restore Source-Specific Unique Contributions

**Objective:** Preserve source-specific nuance that is still missing or underdeveloped.

**Files:**

- Modify: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md`
- Modify: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_No_Orphan_Remediation_Appendix_2026-05-11.md`

### Task 4.1: Add [B] Foliate `tts.js` Claim

- [ ] In `### Text Segmentation and Normalization` or `## 4.17 Source-Specific Unique Contributions`, add:

```text
[B] specifically claims Readest/Foliate `tts.js` traversal could eliminate much of the segmentation work for ebook reading. The synthesis treats that as a high-value investigation target, not as authority to replace Blurby’s existing planner without validation, because [A]/[D] describe the current planner as already strong [B][A][D][O].
```

### Task 4.2: Add [C] Fallback Chain

- [ ] In `## 4.9 Recommended Architecture` or `## 4.17 Source-Specific Unique Contributions`, add:

```text
[C] frames fallback as a provider-independent chain: preferred provider, then secondary provider, then browser/system TTS, then segment-only following when timing or synthesis capability is insufficient. This chain should be encoded as registry policy and surfaced in diagnostics so fallback is explainable rather than hidden [C][O].
```

### Task 4.3: Add [D] No-P0 / Production-Ready Claim

- [ ] In `## 4.12 Gap Matrix` and `## 4.17 Source-Specific Unique Contributions`, add:

```text
[D] reports no P0 gaps and treats Blurby as production-ready today for the current Kokoro/Web Audio live narration path. The remaining items are P1/P2/P3 improvements and provider-expansion gates, not evidence that the existing architecture needs a rewrite [D][O].
```

### Task 4.4: Add [B] One-Day Audit Gate And Runtime Validation Concerns

- [ ] In `## 4.3 Source Set and Methodology`, `## 4.13 Roadmap`, or the appendix, add:

```text
[B] includes a one-day audit gate before acting on assumed-Blurby conclusions: confirm current source state, run the present TTS tests, and verify whether Readest/Foliate, MediaSource, Kokoro-ONNX, Edge/cloud providers, and EPUB3 export ideas are compatible with Blurby’s actual Desktop v2 path. [B]'s runtime validation concerns include Kokoro-ONNX drift, non-English timing, Web Speech boundary matrices, MediaSource stability, Edge TOS, and sidecar code-signing [B][O].
```

### Task 4.5: Verify Phase 4

Run:

```powershell
$report='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md'
$terms=@(
  'Foliate `tts.js` traversal could eliminate much of the segmentation work',
  'preferred provider, then secondary provider, then browser/system TTS',
  'no P0 gaps',
  'production-ready today',
  'one-day audit gate',
  'Kokoro-ONNX drift',
  'sidecar code-signing'
)
foreach ($term in $terms) {
  [pscustomobject]@{ Term=$term; Count=(Select-String -LiteralPath $report -Pattern $term -SimpleMatch).Count }
}
```

Expected: every `Count` is at least `1`.

**Gate:** The strongest remaining unique contributions from [B], [C], and [D] are visible and source-attributed.

---

## 8. Phase 5 - Convert Child Ledger Into Evidence Ledger

**Objective:** Prove inclusion row-by-row with evidence anchors.

**Files:**

- Modify: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Child_Element_Ledger_2026-05-11.md`
- Create: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md`

### Task 5.1: Create Evidence Ledger Columns

- [ ] Create `Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md` with these columns:

```markdown
| Element ID | Sources | Original location | Element description | Body or appendix evidence anchor | Evidence text/paraphrase | Adequacy decision | Inclusion status | Notes |
|---|---|---|---|---|---|---|---|---|
```

### Task 5.2: Evidence Anchor Rules

- [ ] Use these adequacy decisions:

```text
Exact: the body or appendix preserves the exact term/detail.
Adequate paraphrase: the body or appendix preserves the substance with enough implementation detail.
Consolidated with explicit child preservation: the item is grouped with related items, but the child detail remains visible in the evidence text.
Appendix-preserved: the detail is preserved in the remediation appendix rather than main narrative.
Flagged for correction: the row lacks sufficient evidence and must not be counted as included.
```

- [ ] Do not use `Included` for any row whose detail cannot be found in the report body or appendix.
- [ ] Do not count a section title alone as evidence for a child bullet.
- [ ] Do not count a generic phrase like “provider capabilities” as evidence for a specific omitted capability field such as phoneme timing support.

### Task 5.3: Script Candidate Evidence

- [ ] Use a PowerShell helper to seed candidate anchors by searching exact or distinctive terms from each row description in the integrated report and remediation appendix.

```powershell
$ledger='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Child_Element_Ledger_2026-05-11.md'
$report='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md'
$appendix='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_No_Orphan_Remediation_Appendix_2026-05-11.md'
$evidence='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md'

$reportText = Get-Content -LiteralPath $report -Raw
$appendixText = if (Test-Path -LiteralPath $appendix) { Get-Content -LiteralPath $appendix -Raw } else { '' }
$allText = $reportText + "`n" + $appendixText

$rows = Get-Content -LiteralPath $ledger | Where-Object { $_ -match '^\| (O-CH|X-[ABCD])-' }
$out = New-Object System.Collections.Generic.List[string]
$out.Add('# Blurby TTS Body Evidence Ledger')
$out.Add('')
$out.Add('| Element ID | Sources | Original location | Element description | Body or appendix evidence anchor | Evidence text/paraphrase | Adequacy decision | Inclusion status | Notes |')
$out.Add('|---|---|---|---|---|---|---|---|---|')

foreach ($row in $rows) {
  $parts = $row -split '\|'
  $id = $parts[1].Trim()
  $sources = $parts[2].Trim()
  $location = $parts[3].Trim()
  $desc = $parts[4].Trim()
  $plain = ($desc -replace '`','' -replace '\*\*','' -replace '[^A-Za-z0-9_./:+ -]',' ').Trim()
  $tokens = $plain -split '\s+' | Where-Object { $_.Length -ge 6 } | Select-Object -First 4
  $hits = 0
  foreach ($token in $tokens) {
    if ($allText -like "*$token*") { $hits++ }
  }
  if ($hits -ge 2) {
    $adequacy = 'Candidate adequate paraphrase - manual review required'
    $status = 'Candidate'
    $anchor = 'Report or appendix contains multiple distinctive tokens'
  } else {
    $adequacy = 'Flagged for correction'
    $status = 'Flagged for Review'
    $anchor = 'No sufficient automatic evidence found'
  }
  $safe = @($id,$sources,$location,$desc,$anchor,$plain,$adequacy,$status,'') | ForEach-Object { ($_ -replace '\|','\|') }
  $out.Add('| ' + ($safe -join ' | ') + ' |')
}

Set-Content -LiteralPath $evidence -Value $out -Encoding UTF8
```

### Task 5.4: Manual Adjudication

- [ ] Review every `Flagged for Review` row.
- [ ] If the element is missing, add it to the main report or remediation appendix.
- [ ] If the element is present but the automatic search missed it, update the evidence ledger row to:

```text
Adequacy decision: Exact / Adequate paraphrase / Consolidated with explicit child preservation / Appendix-preserved
Inclusion status: Included
Notes: Short reason why the evidence is sufficient.
```

### Task 5.5: Verify Phase 5

Run:

```powershell
$evidence='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md'
[pscustomobject]@{
  TotalRows=(Select-String -LiteralPath $evidence -Pattern '^\| (O-CH|X-[ABCD])-' ).Count
  Flagged=(Select-String -LiteralPath $evidence -Pattern 'Flagged for Review' -SimpleMatch).Count
  Candidate=(Select-String -LiteralPath $evidence -Pattern '| Candidate |' -SimpleMatch).Count
  Included=(Select-String -LiteralPath $evidence -Pattern '| Included |' -SimpleMatch).Count
}
```

Expected before final PASS:

```text
TotalRows : 750
Flagged   : 0
Candidate : 0
Included  : 750
```

**Gate:** Every child-ledger row has body or appendix evidence and no row remains candidate-only or flagged.

---

## 9. Phase 6 - Re-Run Final No-Orphan Audit

**Objective:** Produce a final audit transcript and restore PASS only if the evidence ledger proves coverage.

**Files:**

- Modify: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md`
- Create: `C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Final_No_Orphan_Audit_2026-05-11.md`

### Task 6.1: Audit Checklist

- [ ] Create the final audit transcript with this checklist:

```markdown
# Blurby TTS Final No-Orphan Audit

## Inputs Reviewed

- [O] Master exhaustive source-aware outline
- [A] Direct static/codebase review
- [B] Compass / assumed-Blurby review
- [C] Deep research report
- [D] Cowork/direct v1.75.1 review
- Integrated report
- Child-element ledger
- Body-evidence ledger
- Remediation appendix

## Audit Questions

1. Has every element from [O] been incorporated with body or appendix evidence?
2. Has every unique contribution from [A], [B], [C], and [D] been incorporated?
3. Have all known disagreements been preserved?
4. Have all source-confidence differences been preserved?
5. Have all avoid and defer items been preserved?
6. Have all roadmap items been preserved?
7. Have all test items been preserved?
8. Have all risks been preserved?
9. Have all negative findings been preserved?
10. Have all low-priority items been preserved?
11. Are any elements flagged for review rather than silently omitted?
12. Does every item in the traceability matrix have a destination and evidence anchor?
13. Is any report disproportionately underrepresented?
14. Were any precise technical recommendations weakened into vague summaries?
15. Were any unsupported additions introduced?
```

### Task 6.2: PASS Criteria

- [ ] The final audit may say PASS only if all are true:

```text
Body-evidence ledger has 750 rows.
Body-evidence ledger has 0 Flagged for Review rows.
Body-evidence ledger has 0 Candidate rows.
Integrated report links to the remediation appendix.
Integrated report links to the body-evidence ledger.
Integrated report has no unsupported PASS language that predates the evidence ledger.
All five source files were readable during final verification.
```

### Task 6.3: Restore PASS If Criteria Are Met

- [ ] If the PASS criteria are met, replace the final audit status in the integrated report with:

```text
PASS: No orphaned elements detected. This PASS is based on the integrated report, remediation appendix, child-element ledger, and body-evidence ledger. Every child-ledger row has an evidence anchor and no row remains flagged for review.
```

- [ ] If the criteria are not met, leave the report as FAIL and list the remaining flagged rows in the final audit transcript.

### Task 6.4: Verify Phase 6

Run:

```powershell
$report='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Integrated_Synthesis_2026-05-11.md'
$evidence='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md'
$appendix='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_No_Orphan_Remediation_Appendix_2026-05-11.md'
$audit='C:\Users\estra\Projects\Blurby\artifacts\Blurby_TTS_Final_No_Orphan_Audit_2026-05-11.md'
[pscustomobject]@{
  ReportPass=(Select-String -LiteralPath $report -Pattern 'PASS: No orphaned elements detected' -SimpleMatch).Count
  ReportFail=(Select-String -LiteralPath $report -Pattern 'FAIL:' -SimpleMatch).Count
  EvidenceRows=(Select-String -LiteralPath $evidence -Pattern '^\| (O-CH|X-[ABCD])-' ).Count
  EvidenceFlagged=(Select-String -LiteralPath $evidence -Pattern 'Flagged for Review' -SimpleMatch).Count
  EvidenceCandidate=(Select-String -LiteralPath $evidence -Pattern '| Candidate |' -SimpleMatch).Count
  AppendixExists=(Test-Path -LiteralPath $appendix)
  AuditExists=(Test-Path -LiteralPath $audit)
}
```

Expected for final PASS:

```text
ReportPass       : 1
ReportFail       : 0
EvidenceRows     : 750
EvidenceFlagged  : 0
EvidenceCandidate: 0
AppendixExists   : True
AuditExists      : True
```

**Gate:** PASS is restored only after evidence-backed verification.

---

## 10. Known Deficiency Register

| Deficiency ID | Source | Missing or weakened element | Required destination |
|---|---|---|---|
| DEF-001 | [O] | Destination assignment is not proof of inclusion. | §5 Traceability Appendix; §6 Final No-Orphan Audit |
| DEF-002 | [O][A][C][D] | Full provider capability schema including phoneme timing, label/display, timing support fields, boundary reliability, network/sidecar/GPU fields. | §4.9 Recommended Architecture |
| DEF-003 | [O][C] | Fallback chain: preferred provider, secondary, browser/system, segment-only. | §4.9 Recommended Architecture; §4.17 Source-Specific Unique Contributions |
| DEF-004 | [O][B][C][D] | Segment ID examples and segment fields, including `chap0000_p0000_s0000`, `sha1(docId:cfi:sentenceIndex)`, provider compatibility flags, DOM range reference. | §4.9 Recommended Architecture |
| DEF-005 | [O][B][D] | Detailed SegmentNormalizer pipeline and safeguards. | §4.9 Recommended Architecture; §4.6 Current Baseline |
| DEF-006 | [O][A][C][D] | AudioCache and TimingMetadata exact fields, including `audioFormatVersion`, generated time, clear-cache-per-book UI. | §4.9 Recommended Architecture |
| DEF-007 | [O] | HighlightSyncController opacity/color settings and mode details. | §4.9 Recommended Architecture |
| DEF-008 | [O][A][B][C][D] | Project-by-project reviewed file/features and architecture summaries. | Remediation appendix; §4.8 link |
| DEF-009 | [O][B] | Foliate `tts.js` segmentation claim. | §4.7; §4.17 |
| DEF-010 | [O][D] | “No P0 items; Blurby production-ready today.” | §4.12; §4.17 |
| DEF-011 | [O][B][D] | PDF Narrator column-blind extraction, hardcoded thresholds, peak-normalizing chunks. | §4.8; §4.16; appendix |
| DEF-012 | [O][D] | RealtimeTTS CUDA graph warmup and sentinel speaker embedding cache. | §4.8; appendix |
| DEF-013 | [O][B] | Markor issue #768 / Select-to-Speak caveat. | §4.8; appendix |
| DEF-014 | Report | Unsupported final PASS. | §6 Final No-Orphan Audit |

---

## 11. Execution Order

1. Phase 1: Stop false certification.
2. Phase 2: Restore architecture/interface specificity.
3. Phase 3: Add project detail appendix.
4. Phase 4: Restore source-specific unique contributions.
5. Phase 5: Convert child ledger into evidence ledger.
6. Phase 6: Re-run final audit and restore PASS only if criteria are met.

Do not skip Phase 1. A known-false PASS is the highest-risk governance issue because it can cause future readers to treat the synthesis as complete before evidence proof exists.

---

## 12. Completion Definition

This remediation is complete only when:

1. The integrated report contains no unsupported PASS claim.
2. The integrated report links to the remediation appendix and body-evidence ledger.
3. The remediation appendix preserves all project-by-project child details that were previously compressed away.
4. The body-evidence ledger has 750 rows.
5. The body-evidence ledger has zero `Flagged for Review` rows.
6. The body-evidence ledger has zero `Candidate` rows.
7. Every known deficiency DEF-001 through DEF-014 is resolved.
8. The final no-orphan audit transcript exists.
9. The final audit transcript explicitly answers all 15 audit questions.
10. The final report ends with `PASS: No orphaned elements detected.` only if the evidence ledger supports it.

---

## 13. Recommended Execution Mode

Use inline execution if one editor will own consistency across the main report, appendix, and ledgers.

Use subagent-driven execution only if work is split by disjoint write sets:

1. Worker A: Phase 2 architecture/interface specificity in the main report.
2. Worker B: Phase 3 project detail appendix.
3. Worker C: Phase 4 source-specific unique contributions.
4. Parent agent: Phase 5 evidence-ledger generation and Phase 6 final audit integration.

If using multiple workers, each worker must be told not to edit another worker’s files and not to restore PASS.

