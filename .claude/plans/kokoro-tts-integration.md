# Kokoro TTS Integration Plan

## Goal
Replace Web Speech API with Kokoro-82M for dramatically better voice quality in Blurby's TTS. Keep Web Speech API as a fallback for instant availability while Kokoro model downloads.

## Architecture

### Current State
- `useNarration.ts` — renderer-side hook using `window.speechSynthesis` (Web Speech API)
- `ReaderContainer.tsx` — toggles TTS on/off, syncs with flow cursor
- `SpeedReadingSettings.tsx` — voice selector, rate slider, test button
- All TTS runs in renderer process, no main process involvement

### Target State
- Kokoro runs in **main process** (Node.js, `device: "cpu"`, ONNX runtime)
- Model files (~92MB q8) cached in user data directory
- Main process exposes IPC channels: `tts-generate`, `tts-stream`, `tts-stop`, `tts-voices`, `tts-download-model`
- Renderer sends text chunks via IPC, receives PCM audio buffers back
- Renderer plays audio via Web Audio API (AudioContext + AudioBufferSourceNode)
- Web Speech API remains as fallback (user toggle or while model downloads)

### Why Main Process?
- Kokoro uses `onnxruntime-node` which needs native bindings — can't run in Electron renderer
- Main process has filesystem access for model caching
- Avoids blocking renderer thread during inference

## Model Details
- **Package**: `kokoro-js` (npm)
- **Model**: `onnx-community/Kokoro-82M-v1.0-ONNX`
- **Quantization**: `q8` (92MB download, good quality/size balance)
- **Sample rate**: 24kHz PCM output
- **Voices**: 24 built-in (11 AF, 9 AM, 4 BF, 4 BM)
- **Speed control**: 0.5–2.0 multiplier

## Implementation Steps

### Step 1: Main Process — Kokoro Engine Module
**File**: `main/tts-engine.js` (new, ~200 lines)

- Lazy-load `kokoro-js` on first TTS request
- `KokoroTTS.from_pretrained()` with `device: "cpu"`, `dtype: "q8"`
- Model cached in `app.getPath('userData')/models/kokoro-82m-q8/`
- Progress callback for download status
- Methods:
  - `generate(text, voice, speed)` → PCM Float32Array + sampleRate
  - `stream(text, voice, speed)` → async generator of audio chunks
  - `listVoices()` → voice metadata array
  - `isModelReady()` → boolean
  - `downloadModel(progressCb)` → Promise

### Step 2: IPC Channels
**File**: `main/ipc-handlers.js` (add to existing)

New channels:
- `tts-kokoro-generate` — send text+voice+speed, receive PCM buffer
- `tts-kokoro-stream-start` — begin streaming, sends chunks via `tts-kokoro-chunk` events
- `tts-kokoro-stream-stop` — cancel current generation
- `tts-kokoro-voices` — list available Kokoro voices
- `tts-kokoro-model-status` — check if model is downloaded/ready
- `tts-kokoro-download` — trigger model download, sends progress events

### Step 3: Preload Bridge
**File**: `preload.js` (add to existing)

```js
kokoroGenerate: (text, voice, speed) => ipcRenderer.invoke('tts-kokoro-generate', text, voice, speed),
kokoroStreamStart: (text, voice, speed) => ipcRenderer.send('tts-kokoro-stream-start', text, voice, speed),
kokoroStreamStop: () => ipcRenderer.send('tts-kokoro-stream-stop'),
kokoroVoices: () => ipcRenderer.invoke('tts-kokoro-voices'),
kokoroModelStatus: () => ipcRenderer.invoke('tts-kokoro-model-status'),
kokoroDownload: () => ipcRenderer.invoke('tts-kokoro-download'),
onKokoroChunk: (cb) => ipcRenderer.on('tts-kokoro-chunk', (_, data) => cb(data)),
onKokoroProgress: (cb) => ipcRenderer.on('tts-kokoro-download-progress', (_, pct) => cb(pct)),
```

### Step 4: Renderer — Audio Playback Service
**File**: `src/utils/audioPlayer.ts` (new, ~100 lines)

- Creates AudioContext (24kHz sample rate)
- `playBuffer(pcmFloat32, sampleRate)` → schedules AudioBufferSourceNode
- `playStream()` — queues streaming chunks with seamless crossfade
- `stop()` — cancel all scheduled buffers
- `pause()` / `resume()` — suspend/resume AudioContext
- Word timing estimation: `wordDuration = text.split(' ').length / (speed * WPM_BASELINE)`

### Step 5: Update useNarration Hook
**File**: `src/hooks/useNarration.ts` (modify)

- Add `ttsEngine` state: `"web"` | `"kokoro"`
- Add `kokoroReady` state (model downloaded?)
- When engine is `"kokoro"`:
  - `startCursorDriven()` sends sentence chunks to main process via IPC
  - Word boundary tracking: estimate word timing from chunk duration (Kokoro doesn't provide word-level boundaries like Web Speech API)
  - Chunk chaining: on audio playback end, fire next chunk
- When engine is `"web"`: existing behavior unchanged
- Voice list merges both sources (Kokoro voices + system voices)

### Step 6: Settings UI Updates
**File**: `src/components/settings/SpeedReadingSettings.tsx` (modify)

- Add "TTS Engine" toggle: Kokoro / System Voice
- Show model download button + progress bar if Kokoro not yet downloaded
- Voice dropdown filtered by active engine
- Kokoro voices show friendly names (e.g., "Bella (American Female)" instead of "af_bella")
- "Test voice" works with both engines

### Step 7: Types & Constants
**File**: `src/types.ts` — add `ttsEngine: "web" | "kokoro"` to BlurbySettings
**File**: `src/constants.ts` — add `KOKORO_MODEL_ID`, `KOKORO_DTYPE`, `KOKORO_SAMPLE_RATE`

## Word Boundary Sync Challenge

Web Speech API fires `onboundary` events at each word. Kokoro generates full audio without word boundaries. Options:

**Option A (Recommended): Time-based estimation**
- Calculate `msPerWord = chunkDuration / wordCount`
- Fire synthetic `onWordAdvance` events at regular intervals during playback
- Simple, no extra dependencies, good enough for cursor sync

**Option B: Forced alignment**
- Use a separate library to align generated audio with text
- More accurate but adds complexity and another dependency

**Option C: Chunk-per-sentence with word counting**
- Generate one sentence at a time
- Count words per sentence, distribute timing evenly
- Hybrid: smaller chunks = better timing accuracy, but more IPC overhead

→ Start with **Option A**, upgrade to C if sync feels off.

## Dependency Changes
- `npm install kokoro-js` — the main package (pulls in onnxruntime-node, transformers.js)
- Bundle size impact: ~15MB for onnxruntime-node native bindings (main process only, not in renderer bundle)
- Model files: ~92MB downloaded on first use (not bundled with installer)

## Fallback Strategy
1. First install: Web Speech API active, Kokoro shows "Download voice model (92MB)" button
2. User clicks download → progress bar → model cached in userData
3. Once downloaded: Kokoro is default, Web Speech API available as "System Voice" option
4. If Kokoro inference fails: auto-fallback to Web Speech API with toast notification

## Risk Mitigation
- **Model download size**: 92MB is acceptable for a one-time download; show clear progress
- **CPU inference speed**: q8 model on modern CPU should generate faster than real-time; if not, fall back to Web Speech API
- **ONNX native bindings**: Must be rebuilt for Electron's Node.js version — may need `electron-rebuild`
- **Memory**: Model loads ~200MB into RAM; unload after 5 min idle to free memory

## Test Plan
- Unit tests for audioPlayer.ts (mock AudioContext)
- Integration test for tts-engine.js (mock kokoro-js)
- Settings UI tests for new toggle/download button
- Manual: compare Kokoro vs Web Speech API quality on same passage
