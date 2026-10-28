# Chunk-Synchronized Reading for Flow and Narrate

**Date:** 2026-05-10
**Status:** Approved design, pending implementation plan
**Scope:** Define the shared chunk-based visual reading model for `Flow` and `Narrate`.

---

## Problem

Blurby currently treats `Flow` and `Narrate` as adjacent but visually different reading experiences. That has created ambiguity around what the user should be looking at while text is being consumed:

- `Flow` has historically focused on a moving cursor/timer model.
- `Narrate` has historically depended on engine and scheduler behavior, sometimes making the cursor feel disconnected from spoken audio.
- When narration lacks trustworthy word timing, a word cursor can imply precision the system does not actually have.

The new direction is to make both modes share the same visible reading model:

> The active natural-language chunk tells the reader what thought is active. The active word tells the reader where attention is right now.

The difference between modes is the clock:

- `Flow` advances the active word by selected WPM.
- `Narrate` advances the active word only from speech timing truth.

---

## Approved Product Decisions

- `Flow` and `Narrate` use the same natural chunk model.
- The whole active chunk is lightly highlighted in both modes.
- The active word is strongly highlighted in both modes only when that mode has a truthful word driver.
- `Flow` uses selected WPM as its word driver.
- `Narrate` uses actual speech timing as its word driver.
- `Narrate` must not use Flow WPM, estimated timers, or generic scheduler pacing to fake spoken-word sync.
- If trustworthy narration word timing does not exist, `Narrate` falls back to chunk-only highlighting.
- `Qwen` is retired for now and is not the implementation target for this design. This design applies to the supported narration engines and future engines that satisfy the timing contract.

---

## Visual Contract

Both modes should render two possible visual layers:

1. **Active chunk layer**
   - The entire current natural-language chunk receives a light highlight.
   - The highlight should span wrapped lines cleanly.
   - It should read as context, not as selected text.

2. **Active word layer**
   - The current word receives the strongest treatment.
   - The preferred treatment is bold/strong inline emphasis, with additional styling only if needed for contrast.
   - Active word styling overrides chunk styling.

Mode differences:

| Mode | Active chunk | Active word |
|---|---|---|
| `Flow` | Natural chunk containing the paced word | Selected WPM clock |
| `Narrate` with timing | Natural chunk containing the spoken word | TTS word or character timing |
| `Narrate` without timing | Current spoken chunk | None |

---

## Natural Chunk Model

Chunks must come from the text's natural structure first. Word counts are guardrails, not the primary splitter.

### Delimiter priority

1. Heading or header block
2. Paragraph boundary
3. Source line break after punctuation
4. Sentence group inside a paragraph
5. Single sentence
6. Clause or phrase fallback for unusually long sentences

### Heading rule

Any detected heading or header block is a standalone chunk, even without terminal punctuation.

Examples:

```text
Working assumptions
Chapter 7
The First Book
Sanity check on the alternate hypothesis
```

### Line-break rule

A source line break immediately after any punctuation mark is a hard chunk delimiter.

This includes:

- `.`
- `!`
- `?`
- `;`
- `:`
- `,`
- closing quotes or brackets after punctuation

Browser viewport wrapping does not count as a source line break.

### Word-count guardrails

Suggested initial guardrails:

- Target range: `20-60` words
- Soft max: `80` words
- Hard max: `120` words

The chunker may split smaller for lists, headings, dense arguments, quotations, long clauses, or semicolon-heavy prose.

---

## Timing Contract

`Narrate` has two synchronization tiers.

### Word-synced Narrate

Use this tier when the active engine provides one of:

- trustworthy word timestamps
- trustworthy character timestamps that can be mapped to words
- a reliable alignment layer that produces word timings from generated audio

Rendering:

- light highlight on the active chunk
- bold highlight on the actively spoken word

### Chunk-synced Narrate

Use this tier when the active engine does not provide trustworthy word timing.

Rendering:

- light highlight on the active chunk
- no bold word highlight

Governing rule:

> If trustworthy word timing does not exist, `Narrate` must not fake word-level sync.

Flow is different because Flow is itself the reading clock. Flow may synthesize word progression from WPM. Narrate cannot synthesize spoken-word truth because the voice is the source of truth.

---

## Chunk And Timing Interaction

### Flow

- The active chunk is selected from natural boundaries.
- The active word advances by selected WPM.
- When the paced word crosses into the next natural chunk, the chunk highlight advances.
- The infinite scroll engine keeps the active chunk in the reading window.

### Narrate with word timing

- The active chunk is selected from natural boundaries.
- The active word comes from actual speech timing.
- When the spoken word crosses into the next natural chunk, the chunk highlight advances.
- Chunk changes follow the spoken word, not the pre-generated text position.
- If audio pauses, the active chunk and active word remain visible.
- If audio buffers, the last confirmed spoken word remains highlighted until new timing truth arrives.
- If audio stops, the active word clears; the current chunk may remain as the resume anchor.

### Narrate without word timing

- The active chunk advances when the engine begins speaking that chunk.
- No active word is shown.
- While that chunk's audio is playing, the chunk remains lightly highlighted.
- When the next chunk's audio begins, the chunk highlight advances.
- If audio buffers, the current chunk remains highlighted.
- If audio stops, the chunk may remain as the resume anchor.

---

## Infinite Scroll Behavior

`Flow` and `Narrate` both use the infinite scroll surface.

The shared scroll behavior should keep the active chunk in the reading window, not chase every word with constant micro-scroll.

Initial rule:

> On chunk change, scroll the chunk start into the reading window. During the chunk, keep the active word visible, but avoid micro-scroll unless it is about to leave the comfortable viewing zone.

Mode distinction:

- `Flow` follows a paced reading word.
- `Narrate` follows spoken chunk and spoken word truth.

---

## Architecture

### Natural Chunk Model

A shared module owns chunk extraction.

```ts
type ReadingChunk = {
  id: string;
  startWordIndex: number;
  endWordIndex: number;
  kind: "heading" | "paragraph" | "line" | "sentenceGroup" | "sentence" | "clause";
};
```

The chunk model consumes the rendered/global word stream and returns stable chunk ranges.

### Flow Driver

Flow owns a WPM clock.

It consumes:

- chunks
- current word index
- selected WPM
- pause settings

It emits:

- active chunk id
- active word index
- scroll target

### Narrate Driver

Narrate owns speech truth.

It consumes:

- chunks
- TTS playback events
- word or character timestamps when available
- chunk playback start/end events when word timing is unavailable

It emits either:

- `word-synced`: active chunk id plus active spoken word index
- `chunk-synced`: active chunk id plus no active word index

Narrate must never use Flow's WPM clock to fake word sync.

### Shared Rendering Layer

The renderer consumes visual state:

```ts
type ChunkReadingVisualState = {
  mode: "flow" | "narrate";
  activeChunkId: string | null;
  activeWordIndex: number | null;
  syncLevel: "wpm" | "word-synced" | "chunk-synced";
};
```

Rendering rules:

- apply light highlight to all words in the active chunk
- apply strong word highlight only if `activeWordIndex !== null`
- use the active chunk as the primary scroll anchor
- do not invent timing in the renderer

---

## Non-Goals

This design does not:

- re-enable Qwen
- choose a new TTS engine
- require every engine to support word timings before it can produce audio
- allow fake word-level Narrate sync when timings are missing
- replace Kokoro-specific runtime work
- define final visual styling values
- define the implementation plan or sprint breakdown

---

## Acceptance Criteria

### Flow

- Flow uses the infinite scroll surface.
- Flow extracts natural chunks from headings, paragraphs, source line breaks after punctuation, sentence groups, sentences, and clause fallback.
- Flow lightly highlights the full active chunk.
- Flow bold-highlights the active word based on selected WPM.
- Flow keeps the active chunk in the reading window.
- Flow does not use audio or TTS timing.

### Narrate

- Narrate uses the same infinite scroll surface.
- Narrate uses the same natural chunk model as Flow.
- Narrate lightly highlights the full active chunk.
- Narrate bold-highlights the active word only when trustworthy word or character timing exists.
- Narrate's bold word is directly locked to spoken-word timing.
- Narrate does not use WPM, estimated timers, or Flow pacing to fake spoken-word sync.
- If timing is unavailable, Narrate falls back to chunk-only highlighting.
- When audio buffers or pauses, Narrate holds the last truthful chunk/word state instead of advancing speculatively.

### Chunking

- Headings are standalone chunks even without punctuation.
- Paragraph boundaries split chunks.
- Source line breaks after punctuation are hard chunk delimiters.
- Browser viewport wraps do not count as line breaks.
- Word-count targets are guardrails, not the primary chunking rule.
- Long sentences can split by punctuation or clause fallback.

### Architecture

- There is one shared natural chunk model.
- There is one shared rendering layer for chunk and word highlights.
- Flow and Narrate have separate drivers.
- Flow driver emits `chunk + WPM word`.
- Narrate driver emits `chunk + spoken word` or `chunk only`.
- The renderer only renders state; it does not invent timing.

---

## Core Thesis

Flow and Narrate share the same chunk-based visual reading model. Flow advances the active word by WPM. Narrate advances the active word only from speech timing truth; without that truth, Narrate shows chunk context only.
