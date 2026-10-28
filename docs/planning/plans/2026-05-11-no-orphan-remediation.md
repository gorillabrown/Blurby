# No-Orphan Synthesis Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Blurby TTS Integrated Synthesis Report from FAIL to honest PASS under strict no-orphan audit standards, where every substantive element from each source is verifiably preserved in the report body or a linked appendix.

**Architecture:** Append-only corrections to the existing integrated report. Detail-preserving appendices for project-level and interface-level specifics rather than overloading the narrative body. Evidence-backed ledger conversion to replace destination-only traceability with body-text proof.

**Tech Stack:** Markdown documents only. No code changes, no builds, no tests. Source files are read-only references under `C:\Users\estra\Projects\Blurby.Research`. Report artifacts live under `C:\Users\estra\Projects\Blurby\artifacts`.

---

## File Map

### Source Files (Read-Only)

| Label | Path |
|-------|------|
| [O] | `C:\Users\estra\Projects\Blurby.Research\Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md` |
| [A] | `C:\Users\estra\Projects\Blurby.Research\.Findings\Blurby_TTS_Literature_Codebase_Review_2026-05-11.md` |
| [B] | `C:\Users\estra\Projects\Blurby.Research\.Findings\compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md` |
| [C] | `C:\Users\estra\Projects\Blurby.Research\.Findings\deep-research-report.md` |
| [D] | `C:\Users\estra\Projects\Blurby.Research\.Findings\TTS_LITERATURE_REVIEW_2026-05-11.md` |

### Artifacts To Modify

- `artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md` — main report (622 lines)
- `artifacts/Blurby_TTS_Child_Element_Ledger_2026-05-11.md` — child ledger (750 rows, ~387KB)
- `artifacts/Blurby_TTS_No_Orphan_Remediation_Plan_2026-05-11.md` — remediation plan (reference only for context)

### Artifacts To Create

- `artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md` — per-project reviewed files, features, anti-patterns
- `artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md` — full interface field lists, type definitions, pipeline stages
- `artifacts/Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md` — evidence-backed ledger (conversion of child ledger)
- `artifacts/Blurby_TTS_Final_Audit_Transcript_2026-05-11.md` — final re-audit with evidence

### Rules

- Do NOT edit the five source files.
- Do NOT rewrite the integrated report from scratch. Append and insert.
- All insertions must carry source labels ([A], [B], [C], [D], [O]).

---

## Task 1: Downgrade Unsupported PASS

**Purpose:** The current `PASS: No orphaned elements detected.` on line 622 of the integrated report is unsupported. The child ledger assigns destinations but does not prove body evidence. This task replaces it with an honest FAIL status and adds an evidence-standard statement.

**Files:**
- Modify: `artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md:602-622`

- [ ] **Step 1: Read the current §6 Final No-Orphan Audit section**

Read lines 602–622 of the integrated report. Confirm the section ends with `PASS: No orphaned elements detected.`

- [ ] **Step 2: Replace the PASS line with FAIL**

Replace line 622:
```
PASS: No orphaned elements detected.
```
with:
```
FAIL: Child-level traceability and project-detail preservation remain incomplete. The child-element ledger assigns destinations but does not demonstrate body-evidence presence for each row. A body-evidence ledger with text anchors is required before PASS can be restored.

Evidence standard for PASS restoration: Every row in the child-element ledger must cite a specific text anchor (section heading, table row, paragraph, or appendix entry) where the element's substantive content visibly appears. Destination assignment alone is insufficient.
```

- [ ] **Step 3: Add evidence-standard note to §5 Traceability Appendix header**

At line 518 (the `# 5. Traceability Appendix` heading), insert after the heading:

```markdown
> **Evidence standard (added during remediation):** A row's "Included" status requires that the element's substantive content — not merely its topic — appears at the cited destination in the report body or a linked appendix. Destination assignment without body evidence is insufficient for PASS.
```

- [ ] **Step 4: Verify the downgrade**

Run grep to confirm `PASS` no longer appears as a final verdict and `FAIL` does:
```
grep -c "^PASS:" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: 0
grep -c "^FAIL:" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: 1
```

- [ ] **Step 5: Commit**

```bash
git add artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
git commit -m "audit: downgrade unsupported PASS to FAIL with evidence standard"
```

---

## Task 2: Create Architecture Detail Appendix

**Purpose:** The integrated report's §4.9 (lines 322–353) generalizes interface definitions. Sources [A], [B], [C], and [D] each contribute specific capability fields, type definitions, and pipeline stages that are lost in the summary. This appendix preserves them at full specificity.

**Files:**
- Create: `artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md`
- Modify: `artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md:322-353` (add link to appendix)

- [ ] **Step 1: Read the source interface definitions**

Read the following sections from sources:
- [A] §6 "Recommended Blurby TTS Architecture" — full TS interface block (lines ~426–519)
- [B] §5 "Recommended Blurby TTS Architecture" — full TS interface block (lines ~322–572)
- [C] "Recommended Blurby TTS Architecture" — `DocumentSegment`, `SegmentLocator`, `ProviderCapabilities`, `TTSProvider` types
- [D] §6 "Recommended Architecture" — proposed component table and interfaces
- [O] §6.1–6.14 — consolidated interface fields and architecture principles

- [ ] **Step 2: Create the Architecture Detail Appendix file**

Create `artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md` with this structure. Every field and type must be copied from the source with attribution:

```markdown
# Architecture Detail Appendix — Blurby TTS Integrated Synthesis

> This appendix preserves the full interface field lists, type definitions, and pipeline stages from sources [A], [B], [C], and [D] that are summarized in §4.9 of the main report. It exists to satisfy the no-orphan requirement for architecture specificity.

## A1. `TTSProvider` Interface — Full Field Inventory

### From [A] (lines ~426-462)

[Copy the full TTSProviderCapabilities and TTSProvider interfaces from source [A], preserving every field: id, label, offline, experimental, selectable, supportsStreaming, supportsPauseResume, supportsSeekWithinAudio, timingTruth, boundaryEventsReliable, cacheable, requiresSidecar, requiresGpu, packagingStatus. Plus the TTSProvider methods: getStatus, getVoices, synthesize, preload, stop, pause, resume.]

### From [B] (lines ~326-392)

[Copy the full AudioChunk, WordTiming, SegmentTiming, Voice, EngineCapabilities, SynthesizeOptions, and TTSProvider interfaces from source [B], including: streaming, wordTimings, phonemeTimings, offline, requiresNetwork, maxUtteranceChars, supportsSSML, supportsPause, speedRange. Plus the synthesize returning AsyncIterable<AudioChunk> and onTiming callback.]

### From [C] (type definitions)

[Copy the full ProviderCapabilities type from source [C]: offline, supportsStreaming, supportsNativePauseResume, supportsSeekWithinSegment, providesSentenceTimings, providesWordTimings, requiresExternalRuntime, experimental.]

### From [D] (§6 component table)

[Copy the full proposed component mapping table: TTSProvider, TTSProviderRegistry, DocumentSegmenter, SegmentNormalizer, NarrationJob, AudioGenerationQueue, AudioCache, PlaybackScheduler, TimingMetadataStore, HighlightSyncController, NarrationDiagnostics, ExperimentalModelGate — with existing equivalents, retain/modify/replace decisions, external evidence, and risk.]

### Consolidated Field List

[Union of all fields across sources, with source attribution per field. Fields that appear in only one source are marked with their source label.]

## A2. `SegmentLocator` Union Type — From [C]

[Copy the full SegmentLocator union from source [C]:
- epub-cfi: sectionIndex, cfiStart, cfiEnd
- pdf-text: pageIndex, nodePathStart, nodePathEnd
- flat-text: charStart, charEnd]

## A3. `DocumentSegment` / `NarrationSegment` — Full Field Inventory

### From [A]

[Copy NarrationSegment: id, bookId, sectionId, sectionIndex, ordinal, sourceStartOffset, sourceEndOffset, startWordIndex, wordCount, structuralKind, originalText, normalizedText, normalizerVersion, wordSpans.]

### From [B]

[Copy DocumentSegment: id (sha1), docId, cfi, paragraphId, sentenceIndex, rawText, normalizedText, charOffsetStart, charOffsetEnd, isHeading, isFootnote, isTableCell, domRangeRef.]

### From [C]

[Copy DocumentSegment: segmentId, docId, sectionIndex, ordinal, locator (SegmentLocator), displayText, sourceText, synthesisText, sourceCharStart, sourceCharEnd, normalizationVersion, structuralRole.]

### From [O]

[Copy the consolidated field list from O §6.4, lines 1218-1240.]

### Segment ID Schemes

- [A]: implied from document location
- [B]: `sha1(${docId}:${cfi}:${sentenceIndex})`
- [C]/[D]: `docId + sectionIndex + locator + ordinal + normalization seed`
- [O]: `chap0000_p0000_s0000` style from abogen

## A4. `SegmentNormalizer` Pipeline — Full Stage Inventory

### From [O] §6.5 (lines 1247-1274)

[Copy the full pipeline: pronunciation overrides, NFKC, ligature folding, smart quote folding, join wrapped lines, expand abbreviations/initials, spaced initial collapse, number-to-words, year-aware conversion, currency, time, date, ordinal/cardinal, ranges/fractions/URLs/footnotes, sentence-end punctuation (TTS copy only), citation/artifact stripping, whitespace collapse.]

### From [B] §3.1

[Copy the seven-stage chain from pdf-narrator: NFKC → join-wrapped-lines → abbreviation expansion → number-to-words → sentence-end punctuation injection → artifact strip → whitespace collapse. Plus the `remove_overlap(prev, curr, num_lines=20)` dedup.]

### Safeguards from [O] (lines 1269-1274)

[Copy: separate display/source text, golden fixtures before broad rollout, normalizerVersion in cache key, feature flag for one minor release, English first with locale routing.]

## A5. `AudioCache` Key Formula — Full Component List

### From [O] §6.8 (lines 1316-1328)

[Copy: docId, segmentId, providerId, providerVersion, modelId/modelVersion, voiceId/formula, rate/pitch/generationBucket, normalizationVersion, pronunciationVersion/overrideHash, audioFormatVersion, normalized text hash.]

### From [B] §3.6

[Copy: sha256({normalizedText, engineId, engineVersion, voiceId, speed}). Opus encoding at 32kbps. Size estimate: 400-page book ≈ 8h ≈ ~150MB.]

### From [C]

[Copy: segmentId:providerId:providerVersion:modelId:voiceId:rate:pitch:normalizationVersion:pronunciationVersion:audioFormatVersion.]

## A6. `TimingMetadataStore` — Full Schema

### From [O] §6.10 (lines 1355-1380)

[Copy: timing truth levels (word-native, word-derived, sentence, segment, estimated, none), required metadata fields (segment ID, provider ID, timing truth, sample rate, duration, word timestamps with confidence, drift, generated time, provider version, model version, normalizer version).]

### From [A]

[Copy TimingMetadata interface: segmentId, providerId, timingTruth, sampleRate, durationMs, wordTimestamps array (wordIndex, startMs, endMs, confidence), driftMs, generatedAt, providerVersion, modelVersion.]

### From [B]

[Copy SegmentTiming and TimingMetadataStore with findSegmentAtMs, findWordAtMs, exportSMIL.]

## A7. `HighlightSyncController` — Modes and Behavior

### From [O] §6.11 (lines 1382-1396)

[Copy: own visual following, attach/detach from scheduler/timing store, sentence/word/off modes, segment fallback, opacity/color, map timing spans to document ranges, degrade gracefully on low confidence.]

### From [B]

[Copy: setMode("sentence" | "word" | "off"), setOpacity, setColor.]

## A8. Runtime Topology Variants

### From [B] §5 — MediaSource Topology

[Copy: Renderer owns <audio> + MediaSource + SourceBuffer, highlight controller, UI. Main owns registry/cache/timing store/queue/logical scheduler. Worker owns Kokoro. Web Speech in renderer.]

### From [A]/[D] — Current Web Audio Topology

[Copy: Renderer owns UI, Web Audio scheduler, highlighting. Main owns IPC/cache/engine management. Worker/sidecars own inference.]

### Resolution from [O]

[Copy: Preserve Web Audio if stable. Consider MediaSource only if product needs continuous encoded stream and cross-platform validation passes.]
```

- [ ] **Step 3: Link the appendix from §4.9 of the main report**

At the end of §4.9 (around line 353, before §4.10), insert:

```markdown
> **Full interface definitions:** The complete field-level interface specifications from all four sources, including `SegmentLocator` union, normalizer pipeline stages, cache key formula, and runtime topology variants, are preserved in the [Architecture Detail Appendix](Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md).
```

- [ ] **Step 4: Verify key terms now appear in the appendix**

Grep the new appendix for critical terms identified as missing by the adversarial review:
```
grep -c "phonemeTimings\|phoneme timing" artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "SegmentLocator" artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md
# Expected: >= 3
grep -c "maxUtteranceChars" artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "speedRange" artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "remove_overlap" artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md
# Expected: >= 1
```

- [ ] **Step 5: Commit**

```bash
git add artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
git commit -m "audit: create architecture detail appendix with full interface field lists"
```

---

## Task 3: Create Project Detail Appendix

**Purpose:** The main report's §4.8 (lines 308–321) uses a 9-row summary table for project lessons. Sources contain extensive per-project reviewed-file lists, specific features, specific line references, and specific weaknesses that are lost in consolidation. This appendix preserves them.

**Files:**
- Create: `artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md`
- Modify: `artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md:308-321` (add link)

- [ ] **Step 1: Read project-by-project sections from all sources**

Read these sections:
- [O] §5.1–5.9 (lines 741–1141) — all 9 project outlines with reviewed files, strengths, weaknesses, patterns, avoid items, roadmap impact
- [A] §5 (all project sections) — reviewed files, architecture summaries, strengths, weaknesses, reusable patterns, patterns to avoid, integration implications
- [B] §4.1–4.9 — each project with specific files reviewed, architecture, strengths, weaknesses
- [C] project analysis sections — each project
- [D] §4.1–4.9 — each project with file paths and specific technical details (CUDA graph warmup, sentinel speaker embedding, monolithic QThread, etc.)

- [ ] **Step 2: Create the Project Detail Appendix file**

Create `artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md` with one section per project. Each section must include the **reviewed files list** from each source, the **specific features** discovered, the **specific anti-patterns** with technical detail, and the **roadmap impact**. Structure:

```markdown
# Project Detail Appendix — Blurby TTS Integrated Synthesis

> This appendix preserves per-project reviewed file lists, specific feature findings, and detailed anti-pattern documentation from sources [A], [B], [C], and [D] that are summarized in §4.8 of the main report. It satisfies the no-orphan requirement for project-level specificity.

## P1. Abogen (denizsafak/abogen)

### Reviewed Files
- [A]: `abogen/chunking.py`, `abogen/kokoro_text_normalization.py`, `abogen/book_parser.py`, `abogen/subtitle_utils.py`, `abogen/webui/conversion_runner.py`, `abogen/voice_cache.py`, `abogen/pronunciation_store.py`
- [B]: `abogen/gui.py` (~2400 LOC), `abogen/conversion.py` (~1100 LOC), `abogen/utils.py`, `abogen/constants.py`, `abogen/voice_formula.py`, `abogen/web/`
- [C]: `abogen/chunking.py`, `abogen/voice_cache.py`, `abogen/tts_supertonic.py`, `abogen/webui/conversion_runner.py`, tests
- [D]: all of above plus `heteronym_overrides.py`, `word_substitution.py`, `voice_formulas.py`, `voice_formula_gui.py`, `epub3/exporter.py`
- [O]: consolidated union

### Specific Features Documented
[For each: the feature, which source documents it, specific file/line references]
- Deterministic chunk IDs (`chap0000_p0000_s0000`): [A][B][C][D][O]
- `_attach_display_text()` maps back to source spans: [A][C]
- Voice formula weighted tensor blending: [B][D][O]
- FFmetadata chapter mux for M4B: [O]
- ASS karaoke `\kf` subtitle timing: [O]
- EPUB3/SMIL export: [B][O]
- HF voice prefetch with local-files-first: [O]
- `pronunciation_store.py` and `heteronym_overrides.py`: [D][O]
- `voice_cache.py` idempotent asset caching: [C][O]

### Specific Anti-Patterns
- Hardcoded `device="cpu"` in voice blending path: [D][O]
- Monolithic QThread `convert` method: [D]
- Full chapter buffered in RAM: [B]
- Regex/abbreviation sentence splitting weaker than Blurby planner: [A][O]

### Roadmap Impact
P1: segment metadata + normalizer + pronunciation UI. P2: voice blending. P3/future: export and voice prefetch polish. [O]

## P2. RealtimeTTS (KoljaB/RealtimeTTS)

### Reviewed Files
- [A]: `text_to_stream.py`, `stream_player.py`, `engines/base_engine.py`, `engines/kokoro_engine.py`, `engines/coqui_engine.py`, `engines/system_engine.py`
- [B]: same plus `engines/moss_tts_engine.py`, `engines/faster_qwen_engine.py`, `threadsafe_generators.py`, `safepipe.py`, lazy engine imports, `__init__.py`
- [C]: `text_to_stream.py`, `stream_player.py`, `engines/base_engine.py`, `engines/kokoro_engine.py`, `engines/coqui_engine.py`, `engines/system_engine.py`
- [D]: all of above plus specific findings

### Specific Features Documented
- CUDA graph warmup in Kokoro engine: [D][O]
- Sentinel speaker embedding cache: [D][O]
- `SafePipe` subprocess IPC isolation: [B]
- `AccumulatingThreadSafeGenerator`: [B]
- Voice blend formula: `KokoroEngine._parse_mixed_voice_formula`: [D][O]
- `buffer_threshold_seconds` prefetch: [A][B][C][O]
- `fast_sentence_fragment` + `minimum_first_fragment_length`: [B][O]

### Specific Anti-Patterns
- Busy-wait pause loops: [D][O]
- In-place timing-list mutation (timing pushed before silence trim): [C][D][O]
- Recursive re-entry to drain late-fed text: [D]
- Global `set_start_method` import side-effect: [D]
- NLTK/Stanza tokenizer weight: [B][O]
- Engine matrix breaks with upstream dep changes: [B]

### Roadmap Impact
P1 provider registry. P2 buffered-seconds backpressure + voice blending. [O]

## P3. Readest (readest/readest)

[Continue same structure with TTSController.ts, EdgeTTSClient.ts, WebSpeechClient.ts, NativeTTSClient.ts, TTSUtils.ts, ssml.ts, useTTSControl.ts, useTTSMediaSession.ts, ttsMetadata.ts, ttsTime.ts, foliate-js/tts.js, Android plugin. Issues #1777, #964, #2847, #258, #172. PR fixes #3396, #3406, #3764.]

## P4. Coqui TTS

[Continue with TTS/api.py, TTS/utils/synthesizer.py, TTS/utils/manage.py, TTS/server/server.py, cleaners.py, .models.json. XTTS-v2 CPML non-commercial. God-object Synthesizer anti-pattern.]

## P5. Sioyek

[Continue with main_widget.cpp, utils.cpp, document.cpp, coordinates.h, TextToSpeechService.java, scripts/tts/manager_server.py, generator2.ps1. Restart-line-on-resume. Shell-heavy dependency chain.]

## P6. PDF Narrator

[Continue with main.py, ui.py, extract.py, generate_audiobook_kokoro.py. Fixed 50-pixel thresholds. Column-blind extraction. concat-then-write. remove_overlap. clean_pipeline stages. Scanned-PDF heuristic.]

## P7. ttsreader

[Continue with helpers/ttsEngine.js, helpers/serverTts.js, helpers/serverVoices.js. Runtime method-rewriting state model. onboundary unreliability. Global singleton. Content-hash prefetch.]

## P8. Ultimate TTS Reader

[Continue with tts.py, main.py, gui.py. Process re-exec stop. pyttsx3 started-word event data point. Fire-and-forget entire text.]

## P9. Markor

[Continue with Issue #768 / Select-to-Speak. No substantive TTS implementation in local artifact. Feature request ≠ code evidence.]
```

- [ ] **Step 3: Fill in each project section by reading sources**

For each project (P1–P9), read the corresponding sections from [O], [A], [B], [C], [D] and copy the specific file lists, features, and anti-patterns. Do NOT summarize — preserve the specific references.

- [ ] **Step 4: Link the appendix from §4.8 of the main report**

At the end of §4.8 (around line 321, before §4.9), insert:

```markdown
> **Full project details:** Per-project reviewed file lists, specific features, anti-patterns with technical detail, and roadmap impact are preserved in the [Project Detail Appendix](Blurby_TTS_Project_Detail_Appendix_2026-05-11.md).
```

- [ ] **Step 5: Verify key terms**

```
grep -c "voice_cache.py" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "FFmetadata" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "CUDA graph" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "pronunciation_store" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "TTSController.ts" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "#1777\|#964\|#2847" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "re-exec\|os.execl" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "method.rewriting\|method rewriting" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
grep -c "768\|Select-to-Speak" artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md
# Expected: >= 1
```

- [ ] **Step 6: Commit**

```bash
git add artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
git commit -m "audit: create project detail appendix with per-project file lists and anti-patterns"
```

---

## Task 4: Restore Source-Unique Contributions

**Purpose:** The adversarial review found that several source-unique contributions are missing or weakened in the report body (§4.17, lines 500–511, and other sections). This task adds them.

**Files:**
- Modify: `artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md`

- [ ] **Step 1: Read §4.17 and the source-unique sections**

Read lines 500–511 of the integrated report (§4.17). Then read:
- [O] §14.1–14.4 (source-specific unique contribution index)
- [B] lines 10–21 (scope caveat, Foliate tts.js claim)
- [C] architecture section (SegmentLocator, five hard requirements, four-tier fallback)
- [D] §8 gap matrix header (no P0 items)

- [ ] **Step 2: Add [B]'s Foliate `tts.js` claim to §4.7 or §4.17**

In the Cross-Codebase Findings (§4.7) or Source-Unique Contributions (§4.17), insert:

```markdown
[B] uniquely claims that foliate-js's `tts.js` module, which emits SSML with `<mark>` boundaries from `Intl.Segmenter`-walked DOM ranges, "eliminates ~80% of the segmentation work" for EPUB documents and provides cross-iframe sentence walking. [A]/[D] recommend investigating Foliate `tts.js`/`textWalker` but do not necessarily advocate replacing current Blurby internals. This claim remains unvalidated against current Blurby source [B].
```

- [ ] **Step 3: Add [C]'s four-tier fallback chain to §4.9 or §4.17**

Insert the numbered chain:

```markdown
[C] proposes an explicit four-tier fallback chain for provider resolution:
1. Preferred provider if healthy
2. Secondary provider with same language/voice if available
3. System/browser TTS with sentence-level follow only
4. Segment-only highlight without precise timing if needed

Fallback must preserve the same `DocumentSegment` sequence and generation ID semantics [C].
```

- [ ] **Step 4: Add [D]'s "No P0; production-ready today" to §4.12**

In the Gap Matrix section (§4.12, around line 399), insert:

```markdown
[D] specifically notes that the gap matrix contains **no P0 (critical/blocking) items**. Blurby's TTS is assessed as production-ready today; all recommendations are P1 (high priority) or lower. This framing indicates that the work is evolutionary enhancement, not critical remediation [D].
```

- [ ] **Step 5: Add [B]'s one-day audit gate specifics to §4.13**

In the Roadmap section (§4.13, Phase 0), insert or ensure:

```markdown
[B] requires a one-day code audit of the actual Blurby repository as a prerequisite before any architecture work, because [B]'s current-Blurby claims are [Blurby-assumed] and must be replaced with verified ones. This audit must precede commitment to the Phase 1–5 timeline [B].
```

- [ ] **Step 6: Add [B]'s packaging size estimates to §4.15**

In the Risk Register (§4.15), insert:

```markdown
[B] provides comparative packaging size estimates: Python sidecar (PyInstaller-frozen) adds ~200–400 MB; `kokoro-onnx` + `onnxruntime-node` adds ~150–300 MB (CPU build); base Electron install is ~80–100 MB before models. A 1 GB+ Electron app "feels wrong; users expect <200 MB" [B].
```

- [ ] **Step 7: Add [D]'s rate-change gap target to §4.14**

In the Test Strategy (§4.14), insert:

```markdown
[D] proposes a specific integration test criterion: mid-stream rate changes must produce no >100 ms audible gap [D].
```

- [ ] **Step 8: Verify insertions**

```
grep -c "eliminates.*80%" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: >= 1
grep -c "no P0\|No P0" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: >= 1
grep -c "one-day.*audit\|one.day code audit" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: >= 1
grep -c "200.*400 MB\|150.*300 MB" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: >= 1
grep -c "100 ms.*gap\|100 ms audible" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: >= 1
grep -c "Preferred provider.*healthy" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: >= 1
```

- [ ] **Step 9: Commit**

```bash
git add artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
git commit -m "audit: restore source-unique contributions ([B] Foliate/packaging, [C] fallback chain, [D] no-P0)"
```

---

## Task 5: Convert Child Ledger to Evidence Ledger

**Purpose:** The existing child ledger (750 rows) assigns destinations but does not prove body evidence. This task creates a body-evidence ledger that adds a text-anchor column demonstrating where each element's substance actually appears.

**Files:**
- Read: `artifacts/Blurby_TTS_Child_Element_Ledger_2026-05-11.md` (750 rows)
- Read: `artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md` (main report, now with appendix links)
- Read: `artifacts/Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md` (from Task 2)
- Read: `artifacts/Blurby_TTS_Project_Detail_Appendix_2026-05-11.md` (from Task 3)
- Create: `artifacts/Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md`

- [ ] **Step 1: Define the evidence ledger schema**

The evidence ledger adds one column to the child ledger schema:

| Column | Description |
|--------|-------------|
| Element ID | Same as child ledger |
| Sources | Same |
| Element description | Same |
| Body-evidence anchor | NEW: specific text excerpt or section:paragraph reference proving the element's substance appears in the report or an appendix |
| Evidence adequacy | NEW: "Exact" (verbatim), "Adequate paraphrase" (substance preserved), "Appendix-preserved" (moved to detail appendix), "Flagged" (insufficient evidence) |
| Status | "Included" only if evidence is Exact/Adequate/Appendix-preserved |

- [ ] **Step 2: Process the ledger in sections**

Work through the child ledger section by section. For each row:
1. Read the element description
2. Search the main report body AND both appendices for the element's substantive content
3. If found: record the text anchor and mark "Included" with evidence type
4. If not found: mark "Flagged" — this will prevent PASS

Strategy for the ~750 rows:
- Structural headings (type "structural heading"): verify the section exists in the report outline
- Numbered elements with specific technical content: grep for distinctive terms
- Bullet elements with general concepts: verify the concept appears in the appropriate section
- Source-only remediation rows (X-* prefix): check the appendices

- [ ] **Step 3: Create the evidence ledger file**

Create `artifacts/Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md` with the processed rows. The header should state:

```markdown
# Body-Evidence Ledger — Blurby TTS Integrated Synthesis

> This ledger converts the child-element destination map into evidence-backed traceability. Every row includes a body-evidence anchor demonstrating where the element's substantive content appears in the main report or a linked appendix. Rows without adequate evidence are marked "Flagged."

Total rows: [N]
Included (with evidence): [N]
Flagged (insufficient evidence): [N]

Evidence is verified against:
- Main report: `Blurby_TTS_Integrated_Synthesis_2026-05-11.md`
- Architecture appendix: `Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md`
- Project appendix: `Blurby_TTS_Project_Detail_Appendix_2026-05-11.md`
```

- [ ] **Step 4: Verify zero flagged rows remain**

After processing all rows, check:
```
grep -c "Flagged" artifacts/Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md
# Target: 0. If > 0, those elements need remediation before PASS.
```

If any rows are flagged, add the missing content to the appropriate appendix or report section before marking them Included.

- [ ] **Step 5: Commit**

```bash
git add artifacts/Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md
git commit -m "audit: create body-evidence ledger with text anchors for all 750 rows"
```

---

## Task 6: Final Re-Audit and PASS Restoration

**Purpose:** After all corrections, run the 15-point no-orphan audit verification and restore PASS only if all conditions are met.

**Files:**
- Create: `artifacts/Blurby_TTS_Final_Audit_Transcript_2026-05-11.md`
- Modify: `artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md:602+` (§6 final audit)

- [ ] **Step 1: Create the final audit transcript**

Create `artifacts/Blurby_TTS_Final_Audit_Transcript_2026-05-11.md` and answer all 15 audit questions with evidence:

```markdown
# Final No-Orphan Audit Transcript

Date: 2026-05-11 (remediation pass)

## Pre-Conditions

- [ ] Body-evidence ledger exists with [N] rows, [N] Included, 0 Flagged
- [ ] Architecture Detail Appendix exists and is linked from §4.9
- [ ] Project Detail Appendix exists and is linked from §4.8
- [ ] Source-unique contributions restored ([B] Foliate, [C] fallback chain, [D] no-P0, etc.)
- [ ] All five source files were readable during verification

## Audit Questions

[Answer each of the 15 questions from the original §6 with specific evidence references]

## Verdict

[PASS or FAIL with justification]
```

- [ ] **Step 2: Answer each audit question with evidence**

For each of the 15 questions, provide a specific evidence citation (body section, appendix section, or ledger row range). Do not answer with "Yes" alone — cite the evidence.

- [ ] **Step 3: If all questions pass, update §6 in the main report**

Replace the FAIL status in §6 with:

```markdown
PASS: No orphaned elements detected. This PASS is based on the integrated report body, Architecture Detail Appendix, Project Detail Appendix, body-evidence ledger (750 rows, 0 flagged), and the final audit transcript. The previous PASS was downgraded during remediation because it lacked body-evidence verification; this PASS is evidence-backed.
```

- [ ] **Step 4: Link the audit transcript from §6**

Add at the end of §6:

```markdown
> **Audit evidence chain:**
> - [Architecture Detail Appendix](Blurby_TTS_Architecture_Detail_Appendix_2026-05-11.md)
> - [Project Detail Appendix](Blurby_TTS_Project_Detail_Appendix_2026-05-11.md)
> - [Body-Evidence Ledger](Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md)
> - [Final Audit Transcript](Blurby_TTS_Final_Audit_Transcript_2026-05-11.md)
```

- [ ] **Step 5: Final verification**

```
grep -c "^PASS:" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: 1 (and only 1)
grep -c "^FAIL:" artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
# Expected: 0
grep -c "Flagged" artifacts/Blurby_TTS_Body_Evidence_Ledger_2026-05-11.md
# Expected: 0
```

- [ ] **Step 6: Commit**

```bash
git add artifacts/Blurby_TTS_Final_Audit_Transcript_2026-05-11.md artifacts/Blurby_TTS_Integrated_Synthesis_2026-05-11.md
git commit -m "audit: final re-audit PASS with evidence-backed verification"
```

---

## Execution Notes

**Task dependencies:** Tasks 1→2→3→4→5→6 must execute sequentially. Task 1 (PASS downgrade) establishes honest status. Tasks 2–4 create the content that Task 5 needs to verify. Task 6 can only run after Task 5 confirms zero flagged rows.

**Effort estimates:**
- Task 1: ~10 minutes
- Task 2: ~2–3 hours (reading 4 source interface sections, copying fields)
- Task 3: ~3–4 hours (reading 9 projects across 4 sources, copying file lists)
- Task 4: ~1 hour (targeted insertions with grep verification)
- Task 5: ~4–8 hours (processing 750 rows against report + appendices)
- Task 6: ~1 hour (answering 15 questions with evidence)
- **Total: ~12–18 hours**

**Critical risk:** Task 5 may surface rows that require additional content additions to the report or appendices. If this happens, loop back to add the content before marking the row as Included. The ledger processing IS the quality gate.
