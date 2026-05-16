# Blurby TTS Architecture Detail Appendix

**Generated:** 2026-05-11  
**Purpose:** This appendix exists to satisfy the no-orphan requirement for the Integrated Blurby TTS Research Synthesis (`Blurby_TTS_Integrated_Synthesis_2026-05-11.md`). The main report summarizes architecture recommendations and generalizes interface field lists. This appendix preserves the complete field-level interface specifications from all four source documents at full specificity. Every interface block is copied verbatim from its source. No fields have been omitted.

**Source labels:**
- [A] `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md` — §6 "Recommended Blurby TTS Architecture"
- [B] `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md` — §5 "Recommended Blurby TTS Architecture"
- [C] `deep-research-report.md` — "Recommended Blurby TTS Architecture" section
- [O] `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md` — §6.1–6.14

---

## A1. TTSProvider Interface — Full Field Inventory

### A1.1 From [A] — Complete TypeScript Interface Block

Source: `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`, §6

```ts
export type TimingTruth =
  | "word-native"
  | "word-derived"
  | "sentence"
  | "segment"
  | "estimated"
  | "none";

export interface TTSProviderCapabilities {
  id: TtsEngine;
  label: string;
  offline: boolean;
  experimental: boolean;
  selectable: boolean;
  supportsStreaming: boolean;
  supportsPauseResume: boolean;
  supportsSeekWithinAudio: boolean;
  timingTruth: TimingTruth;
  boundaryEventsReliable: boolean;
  cacheable: boolean;
  requiresSidecar: boolean;
  requiresGpu: boolean | "optional";
  packagingStatus: "bundled" | "sidecar" | "external-runtime" | "not-configured";
}

export interface TTSProvider {
  readonly id: TtsEngine;
  readonly capabilities: TTSProviderCapabilities;
  getStatus(): Promise<TTSProviderStatus>;
  getVoices(): Promise<TTSVoice[]>;
  synthesize(job: NarrationJob, signal: AbortSignal): Promise<SynthesisResult>;
  preload?(request?: ProviderPreloadRequest): Promise<TTSProviderStatus>;
  stop(): void;
  pause(): void;
  resume(): void;
}
```

### A1.2 From [B] — Complete TypeScript Interface Block

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §5

```typescript
export interface Voice {
  id: string;               // engine-scoped, e.g. "af_heart"
  displayName: string;
  language: string;         // BCP-47, e.g. "en-US"
  gender?: "female" | "male" | "neutral";
  isLocal: boolean;
  isPremium: boolean;
}

export interface EngineCapabilities {
  streaming: boolean;
  wordTimings: boolean;
  phonemeTimings: boolean;
  offline: boolean;
  requiresNetwork: boolean;
  maxUtteranceChars: number;     // e.g. 32000 for safety on Web Speech
  supportsSSML: boolean;
  supportsPause: boolean;
  speedRange: { min: number; max: number };
}

export interface SynthesizeOptions {
  voiceId: string;
  speed: number;            // 0.5 .. 2.0
  language: string;
  signal: AbortSignal;      // cooperative cancellation
}

export interface TTSProvider {
  readonly id: string;                          // "kokoro" | "edge" | "webspeech" | "system" | ...
  readonly displayName: string;
  readonly capabilities: EngineCapabilities;

  initialize(): Promise<void>;                  // warm up; download models if needed
  shutdown(): Promise<void>;
  getVoices(): Promise<Voice[]>;
  synthesize(
    text: string,
    opts: SynthesizeOptions
  ): AsyncIterable<AudioChunk>;
  // Engines that support word timings emit SegmentTiming on this channel.
  // Implementations without word timings emit only the final aggregate duration.
  onTiming(handler: (t: SegmentTiming) => void): () => void;
}
```

### A1.3 From [C] — Complete TypeScript Interface Block

Source: `deep-research-report.md`, "Recommended Blurby TTS Architecture"

```ts
type ProviderCapabilities = {
  offline: boolean;
  supportsStreaming: boolean;
  supportsNativePauseResume: boolean;
  supportsSeekWithinSegment: boolean;
  providesSentenceTimings: boolean;
  providesWordTimings: boolean;
  requiresExternalRuntime: boolean;
  experimental: boolean;
};

interface TTSProvider {
  id: string;
  capabilities: ProviderCapabilities;
  init(): Promise<void>;
  listVoices(lang?: string): Promise<TTSVoice[]>;
  synthesize(
    segment: DocumentSegment,
    options: NarrationOptions,
    signal: AbortSignal
  ): Promise<SynthesisResult>;
  shutdown(): Promise<void>;
}
```

### A1.4 Consolidated Field Inventory — All TTSProvider Capability Fields Across Sources

The following table lists every capability field mentioned in any of the four source documents, with source attribution. This is the complete union.

| Field | [A] | [B] | [C] | [O] §6.2 |
|---|---|---|---|---|
| `id` / engine ID | `id: TtsEngine` | `id: string` | `id: string` | yes |
| `label` / `displayName` | `label: string` | `displayName: string` | — | yes |
| `streaming` / `supportsStreaming` | `supportsStreaming: boolean` | `streaming: boolean` | `supportsStreaming: boolean` | yes |
| `supportsPauseResume` / `supportsPause` | `supportsPauseResume: boolean` | `supportsPause: boolean` | `supportsNativePauseResume: boolean` | both |
| `supportsSeekWithinAudio` / `supportsSeekWithinSegment` | `supportsSeekWithinAudio: boolean` | — | `supportsSeekWithinSegment: boolean` | yes |
| `wordTimings` / `providesWordTimings` | via `timingTruth` | `wordTimings: boolean` | `providesWordTimings: boolean` | yes |
| `phonemeTimings` | — | `phonemeTimings: boolean` | — | yes |
| `providesSentenceTimings` | via `timingTruth` | — | `providesSentenceTimings: boolean` | yes |
| `timingTruth` (enum) | `timingTruth: TimingTruth` | — | — | yes |
| `boundaryEventsReliable` | `boundaryEventsReliable: boolean` | — | — | yes |
| `offline` | `offline: boolean` | `offline: boolean` | `offline: boolean` | yes |
| `requiresNetwork` | — | `requiresNetwork: boolean` | — | yes |
| `requiresSidecar` | `requiresSidecar: boolean` | — | `requiresExternalRuntime: boolean` | yes |
| `requiresGpu` | `requiresGpu: boolean \| "optional"` | — | — | yes |
| `cacheable` | `cacheable: boolean` | — | — | yes |
| `experimental` / `selectable` | `experimental: boolean`, `selectable: boolean` | — | `experimental: boolean` | yes |
| `maxUtteranceChars` | — | `maxUtteranceChars: number` | — | yes |
| `supportsSSML` | — | `supportsSSML: boolean` | — | yes |
| `speedRange` | — | `speedRange: { min: number; max: number }` | — | yes |
| `packagingStatus` | `packagingStatus: "bundled" \| "sidecar" \| "external-runtime" \| "not-configured"` | — | — | yes |
| Voice blending support | — | — | — | yes |
| License / commercial / TOS acceptance | — | — | — | yes |
| Supported languages | — | — | — | yes |
| Sample rate | — | — | — | yes |

---

## A2. SegmentLocator Union Type — From [C]

Source: `deep-research-report.md`, "Recommended Blurby TTS Architecture — Core component model"

This union type appears only in [C] and represents the full locator contract for EPUB, PDF, and flat-text documents. It is the mechanism by which [C] achieves location-independent segment identity.

```ts
type SegmentLocator =
  | { kind: 'epub-cfi'; sectionIndex: number; cfiStart: string; cfiEnd: string }
  | { kind: 'pdf-text'; pageIndex: number; nodePathStart: string; nodePathEnd: string }
  | { kind: 'flat-text'; charStart: number; charEnd: number };
```

**Field-level breakdown:**

| Variant | Fields | Notes |
|---|---|---|
| `epub-cfi` | `kind`, `sectionIndex`, `cfiStart`, `cfiEnd` | EPUB CFI-based stable book position |
| `pdf-text` | `kind`, `pageIndex`, `nodePathStart`, `nodePathEnd` | PDF text-layer node path addressing |
| `flat-text` | `kind`, `charStart`, `charEnd` | Character offsets for plain/flat text |

[O] §7.4 and §6.4 confirm this three-way locator split and elaborates: EPUB uses CFI + section index + paragraph ID + sentence/segment ordinal; PDF uses page index + text-layer node path + char offsets (plus possibly line rectangles/coordinate spaces); flat text uses character offsets.

---

## A3. DocumentSegment / NarrationSegment — Full Field Inventory

### A3.1 From [A] — NarrationSegment Interface

Source: `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`, §6

```ts
export interface NarrationSegment {
  id: string;
  bookId: string;
  sectionId: string;
  sectionIndex: number;
  ordinal: number;
  sourceStartOffset: number;
  sourceEndOffset: number;
  startWordIndex: number;
  wordCount: number;
  structuralKind: "heading" | "paragraph" | "sentence" | "dialogue" | "footnote" | "table" | "unknown";
  originalText: string;
  normalizedText: string;
  normalizerVersion: string;
  wordSpans: Array<{ word: string; start: number; end: number }>;
}
```

### A3.2 From [B] — DocumentSegment Interface

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §5.3

```typescript
export interface DocumentSegment {
  id: string;                       // deterministic; sha1(`${docId}:${cfi}:${index}`)
  docId: string;
  cfi?: string;                     // EPUB CFI for stable book position
  paragraphId: string;
  sentenceIndex: number;
  rawText: string;                  // exactly as in source
  normalizedText: string;           // TTS-input copy after SegmentNormalizer
  charOffsetStart: number;          // within paragraph rawText
  charOffsetEnd: number;
  isHeading: boolean;
  isFootnote: boolean;
  isTableCell: boolean;
  domRangeRef?: SerializableDomRange; // for highlighting
}

export interface DocumentSegmenter {
  // Wraps foliate-js packages/foliate-js/tts.js for EPUB; uses pdf.js + Intl.Segmenter for PDF.
  segmentDocument(docId: string): AsyncIterable<DocumentSegment>;
  segmentRange(docId: string, fromCfi: string, toCfi?: string): AsyncIterable<DocumentSegment>;
}
```

### A3.3 From [C] — DocumentSegment Type

Source: `deep-research-report.md`, "Recommended Blurby TTS Architecture — Core component model"

```ts
type DocumentSegment = {
  segmentId: SegmentId;
  docId: string;
  sectionIndex: number;
  ordinal: number;
  locator: SegmentLocator;
  displayText: string;
  sourceText: string;
  synthesisText: string;
  sourceCharStart: number;
  sourceCharEnd: number;
  normalizationVersion: string;
  structuralRole: 'heading' | 'paragraph' | 'sentence' | 'caption' | 'footnote' | 'table';
};
```

### A3.4 From [O] — Complete Field Inventory

Source: `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`, §6.4

[O] §6.4 consolidates the full field list from all sources:

- `segmentId` / `id`
- `bookId` / `docId`
- `sectionId`, `sectionIndex`, ordinal
- EPUB CFI or PDF text locator or flat char offsets
- paragraph ID
- sentence index
- source/display/original/raw text
- normalized/synthesis text
- source character start/end
- word start index/word count
- word spans
- structural role/kind: heading, paragraph, sentence, dialogue, caption, footnote, table, unknown
- provider compatibility flags
- normalizer version
- DOM range reference for highlighting if used

### A3.5 Stable Segment ID Schemes — Across Sources

| Source | ID scheme |
|---|---|
| abogen (referenced in [A][B][C][O]) | `chap0000_p0000_s0000` style — chapter/paragraph/sentence indices |
| [B] | `sha1(${docId}:${cfi}:${sentenceIndex})` — deterministic across runs, survives cache hits, embeds in SMIL |
| [C]/[O] | `docId + sectionIndex + canonical locator + segment ordinal within section + normalization version seed` |
| [A] | Stable ID from document location and structural position, not queue order or text hash alone |

### A3.6 Consolidated Field Comparison Across Sources

| Field | [A] NarrationSegment | [B] DocumentSegment | [C] DocumentSegment | [O] §6.4 |
|---|---|---|---|---|
| Primary ID field | `id: string` | `id: string` | `segmentId: SegmentId` | yes |
| Book/doc ID | `bookId: string` | `docId: string` | `docId: string` | yes |
| Section ID | `sectionId: string` | — | — | yes |
| Section index | `sectionIndex: number` | — | `sectionIndex: number` | yes |
| Ordinal | `ordinal: number` | `sentenceIndex: number` | `ordinal: number` | yes |
| EPUB CFI | — | `cfi?: string` | via `locator` | yes |
| Paragraph ID | — | `paragraphId: string` | — | yes |
| Locator union | — | — | `locator: SegmentLocator` | yes |
| Source/raw text | `originalText: string` | `rawText: string` | `sourceText: string` | yes |
| Display text | — | — | `displayText: string` | yes |
| Normalized/synthesis text | `normalizedText: string` | `normalizedText: string` | `synthesisText: string` | yes |
| Source char start | `sourceStartOffset: number` | `charOffsetStart: number` | `sourceCharStart: number` | yes |
| Source char end | `sourceEndOffset: number` | `charOffsetEnd: number` | `sourceCharEnd: number` | yes |
| Word start index | `startWordIndex: number` | — | — | yes |
| Word count | `wordCount: number` | — | — | yes |
| Word spans | `wordSpans: Array<{ word: string; start: number; end: number }>` | — | — | yes |
| Structural kind/role | `structuralKind: "heading" \| "paragraph" \| "sentence" \| "dialogue" \| "footnote" \| "table" \| "unknown"` | `isHeading: boolean`, `isFootnote: boolean`, `isTableCell: boolean` | `structuralRole: 'heading' \| 'paragraph' \| 'sentence' \| 'caption' \| 'footnote' \| 'table'` | yes |
| Normalizer version | `normalizerVersion: string` | — | `normalizationVersion: string` | yes |
| DOM range reference | — | `domRangeRef?: SerializableDomRange` | — | yes |

---

## A4. SegmentNormalizer Pipeline — Full Stage Inventory

### A4.1 From [O] §6.5 — Complete Pipeline Stage List

Source: `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`, §6.5

[O] consolidates the normalizer pipeline stages from abogen, Coqui, and pdf-narrator across all four source reviews:

1. **Pronunciation overrides first** — apply user-defined substitutions before any other transformation
2. **NFKC normalization** — Unicode canonical decomposition + recomposition
3. **Ligature folding** — expand ligatures (e.g., `ﬁ` → `fi`)
4. **Smart quote folding** — collapse curly/typographic quotes to ASCII equivalents
5. **Join wrapped lines** — remove hard-wrapped newlines within paragraphs
6. **Expand abbreviations and initials** — expand Dr., Mr., e.g., i.e., St., Mt., spaced initials (e.g., `J. R. R.`)
7. **Spaced initial collapse** — collapse letter-period-space sequences
8. **Number-to-words** — convert cardinal numbers to spoken form
9. **Year-aware number conversion** — distinguish years (1984 → "nineteen eighty-four") from cardinals
10. **Currency expansion** — `$5.99` → "five dollars and ninety-nine cents"
11. **Time expansion** — `3:45 PM` → "three forty-five PM"
12. **Date expansion** — `05/11/2026` → "May eleventh twenty twenty-six"
13. **Ordinal/cardinal expansion** — `1st`, `2nd`, `3rd`
14. **Ranges/fractions/URLs/footnotes** — if adopting abogen breadth; URL pronunciation; footnote reference stripping
15. **Sentence-end punctuation injection** — only for TTS input copy, with caution (not for display text)
16. **Citation/artifact stripping** — remove `[12]`, `^\s*\d+\s*$` page numbers, Roman numeral-only lines
17. **Whitespace collapse** — normalize multiple spaces/tabs/newlines to single space

### A4.2 Safeguards from [O] §6.5

- Keep display/source text separate; the normalizer operates on a TTS-input copy only
- Golden fixtures required before broad rollout
- `normalizerVersion` must appear in the cache key so any normalization change triggers cache invalidation
- Feature flag for one minor release (from [D])
- English first; locale routing for future ES/FR/JP/ZH

### A4.3 From [B] — Seven-Stage Chain from pdf-narrator

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §3.1

[B] specifically recommends porting pdf-narrator's `clean_pipeline` verbatim to TypeScript. The seven-stage chain in order:

1. **NFKC** — `normalize_text`: Unicode NFKC normalization
2. **Join wrapped lines** — `join_wrapped_lines`: removes hard line breaks within paragraphs
3. **Abbreviation expansion** — `expand_abbreviations_and_initials`: static abbreviation table + initials handling
4. **Number-to-words** — `convert_numbers`: cardinal/ordinal number conversion
5. **Sentence-end punctuation injection** — `handle_sentence_ends_and_pauses`: injects periods after `[.!?:]`-terminated fragments (TTS only — [B] notes this is an anti-pattern if it mutates displayed text)
6. **Artifact strip** — `remove_artifacts`: removes page numbers, headers/footers, scanning artifacts
7. **Whitespace collapse** — final whitespace normalization

[B] also recommends porting `remove_overlap(prev, curr, num_lines=20)` — suffix/prefix line-equality deduplication between PDF TOC-derived chapters (~20 LOC in Python, portable to TypeScript).

### A4.4 From [A] — Blurby vs External Normalizer Patterns

Source: `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`, §4.1

[A] compares the external patterns to current Blurby:

- Abogen's `kokoro_text_normalization.py` covers contractions, possessives, dates, times, ranges, currency, fractions, URLs, footnotes, and abbreviations.
- Coqui's `TTS\tts\utils\text\cleaners.py` includes `english_cleaners`, `expand_abbreviations`, `en_normalize_numbers`, and language-specific cleaners.
- pdf-narrator's `extract.py` contains `clean_pipeline`, `normalize_text`, `expand_abbreviations_and_initials`, `convert_numbers`, and `handle_sentence_ends_and_pauses`.
- Blurby currently applies pronunciation overrides and scoped punctuation/abbreviation handling but lacks a general versioned normalizer, with `original` vs `normalized` text not persisted per segment.

---

## A5. AudioCache Key Formula — Full Component List

### A5.1 From [O] §6.8 — Complete Key Component List

Source: `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`, §6.8

[O] consolidates the recommended key from all sources:

- `docId`
- `segmentId`
- `providerId`
- `providerVersion`
- `modelId` / `modelVersion`
- `voiceId` or voice formula
- `rate`, `pitch`, generation/rate bucket
- `normalizationVersion`
- `pronunciationVersion` / override hash
- `audioFormatVersion`
- normalized text hash

### A5.2 From [B] — SHA-256 Formula, Opus Encoding, and Size Estimate

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §3.6

[B] provides the most specific cache key formula:

```
sha256({ normalizedText, engineId, engineVersion, voiceId, speed }) → audio/{firstByte}/{hash}.opus
```

Additional specifications from [B]:
- Encode in Opus at 32 kbps for compactness
- A 400-page book ≈ 8 hours ≈ approximately 150 MB at 32 kbps Opus
- Adopt abogen's editable-intermediate-text idea but in JSON: a `manifest.json` per book containing `{ segments[], chapterMarkers[], voice, speed, audioMap, timingMap }`
- `{firstByte}` prefix for filesystem sharding

[B] `AudioCacheKey` interface:

```typescript
export interface AudioCacheKey {
  textHash: string;          // sha256 of normalizedText
  engineId: string;
  engineVersion: string;     // important for invalidation
  voiceId: string;
  speed: number;             // bucketed to 2 decimal places
}

export interface AudioCache {
  has(key: AudioCacheKey): Promise<boolean>;
  get(key: AudioCacheKey): Promise<{ audioPath: string; timing: SegmentTiming } | null>;
  put(key: AudioCacheKey, audio: Buffer, timing: SegmentTiming): Promise<string>;
  evictBook(docId: string): Promise<void>;
  evictAll(): Promise<void>;
  totalSizeBytes(): Promise<number>;
  setMaxSizeBytes(n: number): void;     // LRU cap
}
```

### A5.3 From [C] — Full Key String

Source: `deep-research-report.md`, "Recommended Blurby TTS Architecture — AudioCache"

[C] provides the full key string formula:

```
{docId}:{segmentId}:{providerId}:{providerVersion}:{modelId}:{voiceId}:{rate}:{pitch}:{normalizationVersion}:{pronunciationVersion}:{audioFormatVersion}
```

[C] recommended cache contents:
- audio file
- timing JSON sidecar
- metadata JSON
- checksum of synthesis text for corruption detection

### A5.4 From [A] — Cache Key Risk: Slash-Splitting

Source: `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`, §4.6

[A] identifies the current weakness in Blurby's cache keys: `main\tts-cache.js` keys cache entries as `${bookId}/${voiceId}` and splits them using `/`, while renderer voice IDs may encode voice/rate/override identity using slashes. This can corrupt eviction or cleanup if IDs contain slashes. The remedy is structured/encoded keys rather than slash-joined strings.

---

## A6. TimingMetadataStore — Full Schema

### A6.1 Timing Truth Levels — From [O] §6.10 and [A]

Source: `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`, §6.10; `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`, §6

The `TimingTruth` enum from [A]:

```ts
export type TimingTruth =
  | "word-native"     // provider emits native per-token word timestamps
  | "word-derived"    // word timestamps derived/aligned post-synthesis
  | "sentence"        // sentence-level timing only
  | "segment"         // segment-level timing only
  | "estimated"       // heuristic / duration-proportional allocation
  | "none";           // no timing available
```

### A6.2 TimingMetadata Interface — From [A]

Source: `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`, §6

```ts
export interface TimingMetadata {
  segmentId: string;
  providerId: TtsEngine;
  timingTruth: TimingTruth;
  sampleRate: number;
  durationMs: number;
  wordTimestamps?: Array<{ wordIndex: number; startMs: number; endMs: number; confidence: number }>;
  driftMs?: number;
  generatedAt: string;
  providerVersion: string;
  modelVersion: string;
}
```

### A6.3 SegmentTiming Interface and Store Methods — From [B]

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §5

```typescript
export interface WordTiming {
  text: string;
  startMs: number;          // offset within this segment's audio
  endMs: number;
  charOffsetStart?: number; // optional, relative to segment text
  charOffsetEnd?: number;
}

export interface SegmentTiming {
  segmentId: string;
  audioDurationMs: number;
  words?: WordTiming[];     // null when engine.capabilities.wordTimings === false
}

export interface TimingMetadataStore {
  put(segmentId: string, timing: SegmentTiming): void;
  get(segmentId: string): SegmentTiming | undefined;
  findSegmentAtMs(absoluteMs: number): { segmentId: string; offsetMs: number } | null;
  findWordAtMs(absoluteMs: number): { segmentId: string; wordIndex: number } | null;
  // Export to EPUB3 Media Overlay SMIL (adopt abogen pattern)
  exportSMIL(docId: string): string;
}
```

### A6.4 TimingSpan Type — From [C]

Source: `deep-research-report.md`, "Recommended Blurby TTS Architecture — Core component model"

```ts
type TimingSpan = {
  level: 'sentence' | 'word' | 'phoneme';
  token: string;
  startMs: number;
  endMs: number;
  sourceCharStart?: number;
  sourceCharEnd?: number;
};

type SynthesisResult = {
  providerId: string;
  modelId: string;
  voiceId: string;
  audioPath: string;
  durationMs: number;
  sampleRate: number;
  timings?: TimingSpan[];
  generatedAt: number;
  cacheKey: string;
};
```

### A6.5 Complete Required Metadata — From [O] §6.10

Source: `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`, §6.10

[O] consolidates the required metadata fields for the timing store:

- segment ID
- provider ID
- timing truth (the `TimingTruth` enum from [A])
- sample rate
- duration (ms)
- word timestamps with confidence
- drift (ms)
- generated time
- provider version
- model version
- normalizer version

[O] also specifies that sentence timings and word timings should be stored **separately**, and that the store should record:
- provenance (provider-supplied, aligned, estimated)
- confidence level
- whether timings survived post-processing unchanged

---

## A7. HighlightSyncController — Modes and Behavior

### A7.1 From [B] — Interface Definition

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §5.10

```typescript
export interface HighlightSyncController {
  attach(scheduler: PlaybackScheduler, store: TimingMetadataStore): void;
  detach(): void;
  setMode(mode: "sentence" | "word" | "off"): void;     // word mode requires engine.capabilities.wordTimings
  setOpacity(o: number): void;
  setColor(c: string): void;
}
```

### A7.2 From [O] §6.11 — Responsibilities and Modes

Source: `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`, §6.11

Responsibilities:
- Own all visual following
- Attach/detach from scheduler and timing store
- Support sentence/word/off modes and segment fallback
- Configure opacity/color settings
- Map timing spans back to document ranges using the segment locator and source offsets
- Degrade gracefully if timing is low-confidence

Modes:
- **Word mode**: only when provider timing passes validation; requires `capabilities.wordTimings === true` or equivalent
- **Sentence/segment mode**: when word timing is absent or low-confidence
- **Off mode**: user-selectable; some users find highlighting distracting

### A7.3 Three-Tier Model — From [B] §6

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §6

[B] defines the three-tier model for highlighting:

| Tier | Description | Engine requirements | Acceptance |
|---|---|---|---|
| **Current acceptable (MVP)** | Sentence-level highlight only; drift corrected by `timeupdate` reconciliation; per-sentence audio cache. | Any engine. | <300ms perceived sync error on 90% of sentences. |
| **Minimum production** | Sentence-level + word-level when engine supports it; cache + resume; deterministic segment IDs; SMIL export. | Kokoro (English) or Edge TTS for word level; any engine for sentence level. | <100ms word-sync error on Kokoro English; sentence-only on others. |
| **Preferred future** | Universal word-level via forced alignment for engines without native timing; phoneme-level for karaoke modes; pre-rendered cache prefetched in background. | Kokoro + Whisper alignment WASM. | <60ms word-sync error universally. |

### A7.4 Drift Correction Behavior — From [B] §6

[B] specifies: use `<audio>.currentTime` as the source of truth — never extrapolate from sentence-start + elapsed ms. On every `timeupdate` event (~250ms tick), call `TimingMetadataStore.findSegmentAtMs(audio.currentTime * 1000)` and reconcile `currentSegmentId` if drifted. This handles speed changes and MediaSource buffer hiccups cleanly.

[C] specifies two layers:
- **Intra-segment**: if native word timings exist, highlight from those timings relative to the segment audio clock
- **Inter-segment**: at every segment boundary, snap the text cursor to the next segment's start rather than extrapolating prior timing drift forward

---

## A8. Runtime Topology Variants

### A8.1 From [B] — MediaSource Topology

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §5 (runtime topology)

[B] proposes:
- **Renderer process**: owns `<audio>` + `MediaSource` + `SourceBuffer` per active job, `HighlightSyncController`, UI surface. Never runs neural inference.
- **Main process**: owns `TTSProviderRegistry`, `AudioCache`, `TimingMetadataStore`, `AudioGenerationQueue`, `PlaybackScheduler` (logical FSM only — actual audio sink is in renderer via IPC stream).
- **Worker process (sidecar or Node worker)**: owns the Kokoro inference loop. Communicates with main process via stdio JSON-RPC (sidecar) or `worker_threads` message channel (ONNX).
- **Web Speech provider**: lives entirely in the renderer — no out-of-process component.

[B] further specifies the persistent `<audio>` + MediaSource pattern as the fix for Readest's audio-element-churn bug (Readest Issue #1777), which recreates `HTMLAudioElement` each sentence causing audible gaps and memory pressure.

[B] pairs this topology with:
- SHA-256 content keys
- Opus encoding via `fluent-ffmpeg` sidecar
- Seek-to-segment implemented by computing SourceBuffer offsets or starting a new MediaSource session for cached segments

### A8.2 From [A] and [D] — Web Audio Topology

Source: `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`, §3.11 and component table

The current Blurby topology (per [A] and [D]):
- **Renderer**: owns Web Audio API scheduler (`AudioContext`, `AudioBufferSourceNode`), highlighting, UI
- **Main process**: owns IPC, cache, engine lifecycle management
- **Worker thread** (within main process): owns Kokoro inference loop via `main/tts-worker.js`
- **Python sidecars** (optional): MOSS Nano, Pocket TTS, Qwen streaming

Specific current scheduler features per [A]/[D]:
- `AudioContext.currentTime` is the source of truth for timing
- Pre-schedules chunks for gapless playback
- 8 ms crossfade at chunk boundaries
- RAF (requestAnimationFrame) word timer
- Sliding-window boundary prune
- Tempo stretch for non-bucket speeds
- Future chunks can be rebuilt on rate change without restarting playback
- Scheduler epoch token protects stale `onended` callbacks

[A] component mapping table (Proposed Component → Existing Equivalent):

| Proposed Component | Existing Equivalent | Retain/Modify/Replace | External Evidence | Implementation Risk |
|---|---|---|---|---|
| `TTSProvider` | `TtsStrategy` in `src\types\narration.ts:186` | Modify/wrap | RealtimeTTS `BaseEngine`; Readest `TTSClient.ts` | Medium |
| `TTSProviderRegistry` | Manual strategy selection in `src\hooks\useNarration.ts` | Add | RealtimeTTS lazy engines; Readest client selection | Low-medium |
| `DocumentSegmenter` | `segmentWords`, `pauseDetection`, `narrationPlanner`, `generationPipeline` | Retain and wrap | Abogen chunk metadata; Readest Foliate traversal | Medium |
| `SegmentNormalizer` | Pronunciation overrides and ad hoc provider prep | Add | Abogen `kokoro_text_normalization.py`; Coqui cleaners | Medium |
| `NarrationJob` | Implicit chunk request in generation pipeline | Add | RealtimeTTS queues; Abogen conversion jobs | Low-medium |
| `AudioGenerationQueue` | `createGenerationPipeline` | Retain/evolve | RealtimeTTS streaming queue | Medium |
| `AudioCache` | `main\tts-cache.js`, `src\utils\ttsCache.ts` | Retain and harden | ttsreader hash cache; Sioyek digest cache | Medium |
| `PlaybackScheduler` | `src\utils\audioScheduler.ts` | Retain | Reviewed alternatives weaker | Low |
| `TimingMetadataStore` | Inline `wordTimestamps` on chunks | Add | RealtimeTTS timing queue; Abogen metadata | Medium |
| `HighlightSyncController` | Foliate highlight utils and `useNarration` cursor refs | Modify | Readest CFI/highlight control; Sioyek line rects | Medium |
| `NarrationDiagnostics` | `narrateDiagnostics`, `ttsEvalTrace` | Retain/evolve | Realtime callbacks; Abogen job metadata | Low |
| `ExperimentalModelGate` | Constants, settings hooks, decision docs | Add formal API | Blurby's own MOSS/Qwen gates are strongest evidence | Low-medium |

### A8.3 From [O] §6.14 — Conflict Resolution

Source: `Blurby_TTS_Master_Exhaustive_Outline_2026-05-11.md`, §6.14

[O] presents all three topology variants and resolves the conflict as follows:

1. **[A]/[D] current topology**: Renderer owns UI and Web Audio scheduler and highlighting; Main process owns IPC/cache/engine management; Worker/sidecars own inference.
2. **[B] proposed topology**: Renderer owns `<audio>` + MediaSource + SourceBuffer, highlight controller, UI; Main owns registry/cache/timing store/queue/logical scheduler; Worker/sidecar owns Kokoro; Web Speech provider lives in renderer.
3. **Resolution**: Preserve existing Web Audio scheduler if already stable. Consider MediaSource only if product needs a continuous encoded stream architecture and cross-platform validation passes. Do not replace Web Audio without evidence.

The integrated report adopts [O]'s resolution: [B]'s MediaSource topology is preserved as a validation-gated alternative but the current Web Audio scheduler is the maintained default.

---

## A9. Supporting Interface Blocks — From [B]

Source: `compass_artifact_wf-255c72a1-1de8-4397-b428-f463db0a63ab_text_markdown.md`, §5

The following interfaces from [B] were not reproduced elsewhere and are included here for completeness.

### A9.1 AudioChunk

```typescript
export interface AudioChunk {
  pcm: Uint8Array;          // raw 16-bit signed little-endian PCM
  sampleRate: number;       // e.g. 24000 (Kokoro), 22050 (Edge), 16000 (system)
  channels: number;         // 1 or 2
  segmentId: string;        // back-reference to source segment
  isFinal: boolean;         // last chunk of this segment
}
```

### A9.2 TTSProviderRegistry

```typescript
export interface TTSProviderRegistry {
  register(p: TTSProvider): void;
  get(id: string): TTSProvider | undefined;
  list(): TTSProvider[];
  selectChain(preferredIds: string[]): TTSProvider[];   // returns ordered fallback list
}
```

### A9.3 SegmentNormalizer — From [B]

```typescript
export interface SegmentNormalizer {
  // Pure function; does not mutate the source text.
  // Pipeline: NFKC → joinWrappedLines → expandAbbreviations →
  //           convertNumbers → injectSentenceEnds (TTS-only) →
  //           removeArtifacts → collapseWhitespace
  normalize(rawText: string, opts?: NormalizerOptions): string;
}

export interface NormalizerOptions {
  language: string;
  preserveDisplayedText: true;      // always true; flagged to forbid mutation paths
  abbreviationsTable?: Record<string, string>;
  numberAsYearRange?: [number, number]; // default [1500, 2100]
}
```

### A9.4 NarrationJob — From [B]

```typescript
export interface NarrationJob {
  id: string;
  docId: string;
  fromCfi: string;
  toCfi?: string;
  voiceId: string;
  providerId: string;
  speed: number;
  status: "queued" | "preparing" | "playing" | "paused" | "completed" | "error" | "cancelled";
  currentSegmentId?: string;
}
```

### A9.5 AudioGenerationQueue — From [B]

```typescript
export interface AudioGenerationQueue {
  enqueue(segment: DocumentSegment, provider: TTSProvider, opts: SynthesizeOptions): Promise<void>;
  cancel(segmentId: string): void;
  cancelAll(): void;
  // Look-ahead prefetch: when bufferedAhead.durationMs < threshold, synthesize next N segments.
  setPrefetchPolicy(policy: { bufferedAheadThresholdMs: number; maxConcurrent: number }): void;
}
```

### A9.6 PlaybackScheduler — From [B]

```typescript
export type PlaybackState =
  | "idle" | "loading" | "playing" | "paused" | "buffering" | "stopped" | "error";

export interface PlaybackScheduler {
  state: PlaybackState;
  currentSegmentId?: string;
  currentPositionMs: number;

  start(job: NarrationJob): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  prevSentence(): void;
  nextSentence(): void;
  seekToSegment(segmentId: string): Promise<void>;
  seekToMs(absoluteMs: number): Promise<void>;
  setSpeed(s: number): void;

  on(event: "stateChange" | "segmentChange" | "wordBoundary" | "error",
     handler: (payload: unknown) => void): () => void;
}
```

### A9.7 NarrationDiagnostics — From [B]

```typescript
export interface NarrationDiagnostics {
  log(namespace: string, level: "debug" | "info" | "warn" | "error", msg: string, ctx?: object): void;
  startSpan(name: string): { end: (ctx?: object) => void };
  exportRedactedReport(): Promise<string>;
}
```

### A9.8 ExperimentalModelGate — From [B]

```typescript
export interface ExperimentalModelGate {
  isEnabled(providerId: string): boolean;
  enable(providerId: string): void;
  disable(providerId: string): void;
  // Hides experimental providers from non-developer UI unless flag is on.
  visibleProviders(allProviders: TTSProvider[]): TTSProvider[];
}
```

---

## A10. NarrationJob — From [A]

Source: `Blurby_TTS_Literature_Codebase_Review_2026-05-11.md`, §6

```ts
export interface NarrationJob {
  id: string;
  segment: NarrationSegment;
  providerId: TtsEngine;
  voiceId: string;
  rate: number;
  generationBucket?: number;
  pronunciationOverrideHash: string;
  cacheKey: string;
}
```

Note: [A]'s `NarrationJob` takes a `NarrationSegment` object directly (the full segment), while [B]'s `NarrationJob` takes CFI range references (`fromCfi`, `toCfi`). [C] and [O] specify that `NarrationJob` should also carry a `generationId` distinct from the `id`, where every stop/seek/rate/voice/provider change creates a new generation ID so stale synthesis results can be discarded safely.

---

*End of Architecture Detail Appendix. All interface blocks above are copied verbatim from their respective source documents. No fields have been omitted.*
