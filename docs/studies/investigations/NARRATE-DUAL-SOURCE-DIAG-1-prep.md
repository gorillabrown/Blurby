# NARRATE-DUAL-SOURCE-DIAG-1 — Aristotle Wave A Enumeration Memo

**Author:** Aristotle (read-only root-cause enumeration)
**Sprint:** NARRATE-DUAL-SOURCE-DIAG-1, Wave A, Task 1
**Deliverable:** the master enumeration table + audio-decision call-site map + path-ID schema that Wave B (Hercules instrumentation) hangs on.

---

## Section 1 — State verification banner

| Field | Value |
|---|---|
| Branch | `sprint/narrate-dual-source-diag-1` (`git branch --show-current`) |
| Commit | `029a06a` (`git rev-parse --short HEAD`) |
| Date | 2026-05-29 |
| Files enumerated | `src/hooks/useNarration.ts` (2263 newlines; final line 2263, no trailing newline → some tools report 2264), `src/utils/audioScheduler.ts` (1010 lines), `src/hooks/narration/kokoroStrategy.ts` (598 lines) |

**Grep methodology note.** Every file:line claim below was produced by `grep -n` (and the Grep tool) run directly against the working-tree source on this branch at commit `029a06a`, NOT carried from the ULTRATHINK doc or the SK-N1 spec. The ULTRATHINK doc's "Second revision" table (its lines 300–316) claimed to be verified against `main` post-commit `4444276`; this branch's HEAD (`029a06a`) is described in the dispatch as "main v1.75.1 + the Standing Rule #36 governance commit," so the source region is expected to match main. **It does, with two corrections to the ULTRATHINK figures, flagged in Section 3 and Section 7.** Every line in this memo carries the stamp form *"grep-verified against sprint/narrate-dual-source-diag-1 @ 029a06a on 2026-05-29"*; to avoid repeating the full stamp on every row, the banner here establishes it for the entire document and per-row deltas are called out explicitly where the spec/ULTRATHINK numbers were wrong.

---

## Section 2 — Master enumeration table

Every line in `useNarration.ts` that READS or WRITES any of the six tracked position-state values. Declarations:
- `lastConfirmedAudioWordRef` — declared line **187** (spec said ~187 ✓)
- `nextGenWordIndexRef` — declared line **188** (spec said ~188 ✓)
- `nextKokoroExactStartRef` — declared line **199** (spec said ~199 ✓)
- `cursorWordIndex` — React reducer state field; read via `s.cursorWordIndex` / `stateRef.current.cursorWordIndex` / `state.cursorWordIndex`, written via `stateRef.current = { …, cursorWordIndex }` and `dispatch({ type: "WORD_ADVANCE" })` / `START_CURSOR_DRIVEN`.
- `getHeardFloorWordIndex()` — **DOES NOT EXIST on this branch** (Section 6). Its would-be single consumer attaches inside `speakNextChunkKokoro` at the `startIdx` seed (line 1194) and, secondarily, at the resume-seed sites (1931–1932, 1946–1947). Rows for it are marked **[ABSENT — Wave B introduces]**.
- `getPlayingSourceMaxWordIndex(...)` — primitive in `audioScheduler.ts`; rows at end of table.

All `useNarration.ts` rows verified against `sprint/narrate-dual-source-diag-1 @ 029a06a on 2026-05-29`.

| file:line | function | action | ref / value | value flows to / used for |
|---|---|---|---|---|
| useNarration.ts:187 | (top-of-hook) | write (decl init 0) | lastConfirmedAudioWordRef | declaration, initial value 0 |
| useNarration.ts:188 | (top-of-hook) | write (decl init 0) | nextGenWordIndexRef | declaration, initial value 0 |
| useNarration.ts:199 | (top-of-hook) | write (decl init null) | nextKokoroExactStartRef | declaration, initial value null |
| useNarration.ts:441 | captureDiagSnapshot | read | s.cursorWordIndex | diagnostics snapshot payload only (no scheduling) |
| useNarration.ts:461 | syncNarrationCursor | write | lastConfirmedAudioWordRef = wordIndex | re-anchor audio cursor when `syncConfirmedAudioAnchor` true |
| useNarration.ts:463 | syncNarrationCursor | write | cursorWordIndex (via dispatch WORD_ADVANCE) | reducer cursor render |
| useNarration.ts:466 | syncNarrationCursor | write | cursorWordIndex (stateRef manual) | synchronous stateRef cursor update |
| useNarration.ts:631 | kokoroStrategy.onChunkProduced | write | nextGenWordIndexRef = endIdx | "next word pipeline will generate" — seeds speakNextChunkKokoro |
| useNarration.ts:797 | kokoroReady auto-start effect | read | s.cursorWordIndex | DEV log of auto-start word |
| useNarration.ts:798 | kokoroReady auto-start effect | read | s.cursorWordIndex | dispatch START_CURSOR_DRIVEN startIdx (warming→speaking) |
| useNarration.ts:808 | qwenReady auto-start effect | read | s.cursorWordIndex | dispatch START_CURSOR_DRIVEN startIdx (warming→speaking) |
| useNarration.ts:940 | speakNextChunkWeb | read | s.cursorWordIndex | Web startIdx (audio-decision: chunk start) |
| useNarration.ts:972 | speakNextChunkWeb word cb | write | cursorWordIndex (dispatch WORD_ADVANCE globalIdx) | reducer cursor render |
| useNarration.ts:977 | speakNextChunkWeb done cb | write | cursorWordIndex (stateRef = endIdx) | advance cursor to chunk end |
| useNarration.ts:995 | speakNextChunkNano | read | s.cursorWordIndex | Nano startIdx (audio-decision: chunk start) |
| useNarration.ts:1072 | speakNextChunkNano word cb | write | lastConfirmedAudioWordRef = wordIndex | canonical audio position (Nano) |
| useNarration.ts:1073 | speakNextChunkNano word cb | write | cursorWordIndex (dispatch WORD_ADVANCE) | reducer cursor render |
| useNarration.ts:1085 | speakNextChunkNano finishChunk | write | cursorWordIndex (stateRef = endIdx) | advance cursor to chunk end |
| useNarration.ts:1086 | speakNextChunkNano finishChunk | write | lastConfirmedAudioWordRef = endIdx | canonical audio at chunk end |
| useNarration.ts:1118 | speakNextChunkPocket | read | s.cursorWordIndex | Pocket startIdx (audio-decision: chunk start) |
| useNarration.ts:1157 | speakNextChunkPocket word cb | write | lastConfirmedAudioWordRef = wordIndex | canonical audio position (Pocket) |
| useNarration.ts:1158 | speakNextChunkPocket word cb | write | cursorWordIndex (dispatch WORD_ADVANCE) | reducer cursor render |
| useNarration.ts:1164 | speakNextChunkPocket done cb | write | cursorWordIndex (stateRef = endIdx) | advance cursor to chunk end |
| useNarration.ts:1165 | speakNextChunkPocket done cb | write | lastConfirmedAudioWordRef = endIdx | canonical audio at chunk end |
| useNarration.ts:1194 | **speakNextChunkKokoro** | **read** | **nextGenWordIndexRef → startIdx** | **PRIMARY Kokoro chunk-start seed (audio-decision)** |
| useNarration.ts:1204 | speakNextChunkKokoro | read | nextKokoroExactStartRef === startIdx | sets requireExactFirstBoundary gate |
| useNarration.ts:1205 | speakNextChunkKokoro | write | nextKokoroExactStartRef = null | consume exact-start (lifecycle CONSUME) |
| useNarration.ts:1244 | speakNextChunkKokoro word cb | write | lastConfirmedAudioWordRef = wordIndex | canonical audio position (Kokoro steady-state) |
| useNarration.ts:1245 | speakNextChunkKokoro word cb | write | cursorWordIndex (stateRef = wordIndex) | synchronous cursor sync |
| useNarration.ts:1246 | speakNextChunkKokoro word cb | write | cursorWordIndex (dispatch WORD_ADVANCE) | reducer cursor render |
| useNarration.ts:1249 | speakNextChunkKokoro word cb | read | stateRef.current.cursorWordIndex → visualIdx | DEV divergence log only |
| useNarration.ts:1287 | speakNextChunkQwen | read | lastConfirmedAudioWordRef → startIdx | Qwen chunk-start seed (audio-decision) |
| useNarration.ts:1304 | speakNextChunkQwen word cb | write | lastConfirmedAudioWordRef = wordIndex | canonical audio position (Qwen) |
| useNarration.ts:1305 | speakNextChunkQwen word cb | write | cursorWordIndex (dispatch WORD_ADVANCE) | reducer cursor render |
| useNarration.ts:1325 | speakNextChunk (dispatcher) | read | s.cursorWordIndex | DEV log only |
| useNarration.ts:1457 | startCursorDriven (qwen err) | write | cursorWordIndex (stateRef = startWordIndex) | error-state cursor set |
| useNarration.ts:1478 | startCursorDriven (qwen warming) | write | cursorWordIndex (stateRef = startWordIndex) | warming-state cursor set |
| useNarration.ts:1483 | startCursorDriven (qwen warming) | write | lastConfirmedAudioWordRef = startWordIndex | seed canonical audio for warming auto-start |
| useNarration.ts:1484 | startCursorDriven (qwen warming) | write | nextGenWordIndexRef = startWordIndex | seed pipeline read-head for warming auto-start |
| useNarration.ts:1495 | startCursorDriven (qwen preload err) | write | cursorWordIndex (stateRef = startWordIndex) | error-state cursor set |
| useNarration.ts:1513 | startCursorDriven (qwen catch) | write | cursorWordIndex (stateRef = startWordIndex) | error-state cursor set |
| useNarration.ts:1534 | startCursorDriven (kokoro warming) | write | cursorWordIndex (stateRef = startWordIndex) | warming-state cursor set |
| useNarration.ts:1542 | startCursorDriven (kokoro warming) | write | lastConfirmedAudioWordRef = startWordIndex | seed canonical audio (BUG-145c) for auto-start |
| useNarration.ts:1543 | startCursorDriven (kokoro warming) | write | nextGenWordIndexRef = startWordIndex | seed pipeline read-head (BUG-145c) |
| useNarration.ts:1560 | startCursorDriven (nano disabled) | write | cursorWordIndex (stateRef = startWordIndex) | error-state cursor set |
| useNarration.ts:1592 | startCursorDriven (speaking) | write | cursorWordIndex (stateRef = startWordIndex) | cold-start cursor set (audio-decision precursor) |
| useNarration.ts:1601 | startCursorDriven (speaking) | write | lastConfirmedAudioWordRef = startWordIndex | seed canonical audio for first chunk (BUG-145c) |
| useNarration.ts:1602 | startCursorDriven (speaking) | write | nextGenWordIndexRef = startWordIndex | seed pipeline read-head for first chunk |
| useNarration.ts:1634 | resyncToCursor | write | nextKokoroExactStartRef = wordIndex | exact-start target for click-to-narrate restart |
| useNarration.ts:1635 | resyncToCursor | write | nextGenWordIndexRef = wordIndex | seed pipeline read-head at clicked word |
| useNarration.ts:1636 | resyncToCursor | write | cursorWordIndex + lastConfirmedAudioWordRef (via syncNarrationCursor, syncConfirmedAudioAnchor:true) | re-anchor both at clicked word |
| useNarration.ts:1663 | updateWords | read | stateRef.current.cursorWordIndex | default globalStartIdx when not numeric |
| useNarration.ts:1669 | updateWords | write | cursorWordIndex (+ lastConfirmedAudioWordRef if handoff) via syncNarrationCursor | handoff re-anchor |
| useNarration.ts:1671 | updateWords (handoff) | write | nextGenWordIndexRef = globalStartIdx | seed pipeline read-head at handoff anchor |
| useNarration.ts:1696 | updateWords microtask | read | current.cursorWordIndex === globalStartIdx | guard before handoff restart |
| useNarration.ts:1697 | updateWords microtask | read | lastConfirmedAudioWordRef === globalStartIdx | guard before handoff restart |
| useNarration.ts:1888 | pause | read | s.cursorWordIndex | eval-trace pause wordIndex (no scheduling) |
| useNarration.ts:1892 | pause | read | s.cursorWordIndex | diag-event pause record |
| useNarration.ts:1901 | **resume (cursor-mismatch branch)** | **read** | **s.cursorWordIndex vs currentWordIndex** | **branch selector: mismatch → restart at currentWordIndex** |
| useNarration.ts:1918 | resume (cursor-mismatch) | write | cursorWordIndex (stateRef = currentWordIndex) | reseed cursor to new position |
| useNarration.ts:1923 | resume (cursor-mismatch) | read | s.cursorWordIndex | diag log "was X" |
| useNarration.ts:1931 | resume (cursor-mismatch) | write | lastConfirmedAudioWordRef = currentWordIndex | reseed canonical audio before restart |
| useNarration.ts:1932 | resume (cursor-mismatch) | write | nextGenWordIndexRef = currentWordIndex | reseed pipeline read-head before restart |
| useNarration.ts:1946 | **resume (handoff-pending branch)** | **write** | **lastConfirmedAudioWordRef = s.cursorWordIndex** | **reseed canonical audio from cursor (NOTE: heardFloor capture is ABSENT on this branch — see §6)** |
| useNarration.ts:1947 | resume (handoff-pending) | write | nextGenWordIndexRef = s.cursorWordIndex | reseed pipeline read-head from cursor |
| useNarration.ts:1953 | resume (handoff-pending) | read | s.cursorWordIndex | eval-trace resume wordIndex |
| useNarration.ts:1956 | resume (handoff-pending) | read | s.cursorWordIndex | diag-event resume record |
| useNarration.ts:1980 | **resume (bare-resume branch)** | **read** | **s.cursorWordIndex** | **eval-trace only; bare resume does NOT reseed refs (see §3c)** |
| useNarration.ts:1984 | resume (bare-resume) | read | s.cursorWordIndex | diag-event resume record |
| useNarration.ts:1994 | stop | read | stateRef.current.cursorWordIndex | diag-event stop record |
| useNarration.ts:1999 | stop | read | stateRef.current.cursorWordIndex | eval-trace stop wordIndex |
| useNarration.ts:2020 | seekToWordIndex | read | current.cursorWordIndex | no-op guard (target == cursor) |
| useNarration.ts:2024 | seekToWordIndex | read | current.cursorWordIndex | derive forward/backward-seek reason |
| useNarration.ts:2051 | nextSentence | read | stateRef.current.cursorWordIndex | findNextSentenceStart base |
| useNarration.ts:2058 | prevSentence | read | stateRef.current.cursorWordIndex | findPreviousSentenceStart base |
| useNarration.ts:2150 | hook return value | read | state.cursorWordIndex | exposed to ReaderContainer (UI) |
| **[ABSENT]** getHeardFloorWordIndex() | — | — | **NOT ON BRANCH** | Wave B re-introduces; sole intended audio-decision consumer = speakNextChunkKokoro:1194 seed + resume seeds 1931/1932, 1946/1947 |
| audioScheduler.ts:521 | getPlayingSourceMaxWordIndex (decl) | — | function definition | the primitive Wave B wraps as getHeardFloorWordIndex |
| audioScheduler.ts:580 | startWordTimer.tick | read | getPlayingSourceMaxWordIndex(now) → maxPlayingWord | clamp cursor advance: `if (currentBoundary.wordIndex > maxPlayingWord) break` (line 590) |
| audioScheduler.ts:982 | (getAudioProgress region) | read | getPlayingSourceMaxWordIndex(audioCtx.currentTime) → maxPlayingWord | clamp reported audio progress to heard max |

**Completeness note for Hercules:** the audio-decision READS that actually seed a chunk start are: 940 (Web), 995 (Nano), 1118 (Pocket), **1194 (Kokoro — the one that matters for A4/A5)**, 1287 (Qwen). The reseed WRITES that determine what those reads return at restart are: 461/463/466 (syncNarrationCursor), 631 (onChunkProduced), 1483/1484, 1542/1543, 1601/1602 (startCursorDriven seeds), 1634/1635/1636 (resyncToCursor), 1671 (updateWords handoff), 1931/1932 (resume cursor-mismatch), 1946/1947 (resume handoff-pending). Bare-resume (1962–1985) writes NONE of these refs — it delegates to `kokoroStrategy.resume()` (line 1969).

---

## Section 3 — Audio-decision call sites (current line numbers, re-grepped)

All verified against `sprint/narrate-dual-source-diag-1 @ 029a06a on 2026-05-29`.

### pause()
- Definition: **line 1868**. (ULTRATHINK "main" table said 1868 ✓.)
- Reads `s.cursorWordIndex` at 1888 (eval-trace) and 1892 (diag) only — no audio-position write. Delegates to engine `.pause()` (kokoro at 1877). Does NOT capture a resume target ref. This is the "no explicit resume target captured" gap the ULTRATHINK doc flagged (its Stage 4).

### resume() — THREE structurally distinct branches
Definition: **line 1896** (`const resume = useCallback((currentWordIndex?: number)`). ULTRATHINK "main" table said 1896 ✓.

**(a) Cursor-mismatch branch — entry line 1901** (`if (currentWordIndex != null && currentWordIndex !== s.cursorWordIndex)`).
- Seeds from: the caller-supplied `currentWordIndex`. Writes `cursorWordIndex` (1918), `lastConfirmedAudioWordRef` (1931), `nextGenWordIndexRef` (1932), dispatches `START_CURSOR_DRIVEN` (1913), then calls `speakNextChunkRef.current()` (1933) → dispatcher → speakNextChunkKokoro reads `nextGenWordIndexRef` (1194).
- **A4 path in THIS branch:** if `currentWordIndex` arrives as 0 / stale (e.g. caller passes a fraction-derived 0, or cursor never advanced past 0 — see §4 resume-anchor hypothesis), all three refs are reseeded to 0 and speakNextChunkKokoro starts at word 0 → "Once" → book restart. Root cause = bad `currentWordIndex` argument OR cursor pinned at 0.

**(b) Handoff-pending branch — entry line 1937** (`if (handoffPendingRef.current)`).
- Seeds from: `s.cursorWordIndex` directly — writes `lastConfirmedAudioWordRef = s.cursorWordIndex` (1946), `nextGenWordIndexRef = s.cursorWordIndex` (1947), dispatches RESUME (1948), calls `speakNextChunkRef.current()` (1958) → speakNextChunkKokoro reads nextGenWordIndexRef (1194). **The `getHeardFloorWordIndex()` capture that the dissolved branch placed here is ABSENT on this branch** (confirmed §6); seed is the raw cursor.
- **A4 path in THIS branch:** if `s.cursorWordIndex` is stale-at-0 (React batching left it behind, or it was never advanced), both refs seed to 0 → restart at book start. Root cause = stale `cursorWordIndex`.

**(c) Bare-resume branch — entry line 1962** (comment `// Bare resume from pause point`; first executable engine dispatch at 1964, Kokoro call `kokoroStrategy.resume()` at **line 1969**).
- Seeds from: NOTHING in useNarration — it does not write `lastConfirmedAudioWordRef`, `nextGenWordIndexRef`, or `cursorWordIndex`. It calls `kokoroStrategy.resume()` (1969), dispatches RESUME (1975), and only reads `s.cursorWordIndex` for eval-trace (1980) / diag (1984).
- **A4 path in THIS branch is DIFFERENT:** there is no stale-seed mechanism because no reseed happens. If A4 fires here, the cause lives inside `kokoroStrategy.resume()` / `audioScheduler` — e.g. the suspended AudioContext's scheduled sources were cleared on pause so resume restarts the pipeline from chunk 0, or `kokoroStrategy.resume()` cannot find the prior playback position. **Conflated instrumentation here forces a PARTIAL verdict** — branch (c) needs its own path ID distinct from (a) and (b), and Wave B must ALSO instrument inside `kokoroStrategy.resume()` / the scheduler resume path, not only useNarration.

ULTRATHINK "main"-table line numbers for resume branches were 1901 / 1937 / 1962 → **all three confirmed exact on this branch.** (Note: the ULTRATHINK doc's *first* revision cited 1910/1946/1976 against the dissolved branch; those are superseded — use 1901/1937/1962.)

### applyRateChange() — speakNextChunk-calling branches
Definition: **line 1713**. ULTRATHINK "main" table said 1713 ✓.
Verified count of branches that call `speakNextChunk()` (or the debounced variant): **SIX** — confirms the corrected "6 not 14" figure. Lines (all `speakNextChunk()` call sites inside applyRateChange):

| # | branch | speakNextChunk() line | notes |
|---|---|---|---|
| 1 | Kokoro bucket change (`restartKokoroGeneration`) | **1750** | only fires when `kokoroBucketChanged`; the same-bucket path (1766–1776) calls `refreshBufferedTempo()` and does NOT call speakNextChunk |
| 2 | Qwen | **1793** | |
| 3 | Pocket (pocketActiveRef) | **1812** | |
| 4 | Nano (nanoActiveRef) | **1830** | |
| 5 | Web no-debounce (`!options.debounceWeb`) | **1844** | |
| 6 | Web debounced (setTimeout) | **1860** | inside `rateDebounceRef` timeout |

ULTRATHINK "main" table predicted 1750, 1793, 1812, 1830, 1844, 1860 → **all six confirmed exact.** Count = 6 ✓ (the "14" in the doc's body prose at its line 138 is the stale over-count; the corrected table at its line 286/305 is right).

**Important for A5 (rate-change skip):** the Kokoro live-rate same-bucket branch (1766–1776, ending `kokoroStrategy.refreshBufferedTempo(); return;`) is a 7th Kokoro path that does NOT restart generation and reads no position ref. Only branch #1 (1750) reseeds via speakNextChunk → 1194. For Kokoro-only posture, A5 can only originate from branch #1 (bucket change) or from the tempo-refresh path mis-handling buffered audio.

### speakNextChunkKokoro()
- Definition: **line 1187**. Spec said ~1187 ✓ (unchanged).
- The seed read is line **1194** (`const startIdx = nextGenWordIndexRef.current;`). This is THE primary audio-decision read for Kokoro.

### resyncToCursor()
- Definition: **line 1617**. Spec said ~1617 ✓ (unchanged).
- Writes nextKokoroExactStartRef (1634), nextGenWordIndexRef (1635), cursor+lastConfirmedAudioWordRef via syncNarrationCursor (1636), then speakNextChunk (1649).

### onWordAdvance callback registration sites
`onWordAdvanceRef.current = onWordAdvance` assigned at **1404** (dedupe early-return path) and **1428** (normal startCursorDriven path). The ref is the registration target; the callback is INVOKED (`onWordAdvanceRef.current?.(…)`) at: 621 (kokoro onTruthSync fallback), 973 & 978 (Web), 1074 & 1087 (Nano), 1159 & 1166 (Pocket), 1306 (Qwen). Kokoro's primary word callback (1227–1261) does NOT call onWordAdvanceRef directly — it relies on the onTruthSync path at 621 when no truth-sync callback is installed.

### WORD_ADVANCE reducer dispatch sites — SIX
`dispatch({ type: "WORD_ADVANCE" … })` at: **463** (syncNarrationCursor), **972** (Web), **1073** (Nano), **1158** (Pocket), **1246** (Kokoro), **1305** (Qwen).
ULTRATHINK "main"-table predicted 463, 972, 1073, 1158, 1246, 1305 → **all six confirmed exact.** Count = 6 ✓. (The doc's *first* revision list 463/972/1073/1158/1255/1314 was the dissolved branch — superseded.)

---

## Section 4 — The resume-anchor mechanism (Live-QA prior-art)

**Literal-string search result.** `resume anchor` / `resumeAnchor` / `onRelocate` / `TTS-7M` are **NOT present in `useNarration.ts` or `audioScheduler.ts`.** The resume-anchor mechanism lives entirely in the **reader-container / document-lifecycle layer**, not in the narration hook. This is a material finding: the Live-QA console line `[TTS-7M] onRelocate: resume anchor active at 0 — skipping approx X` is emitted by `ReaderContainer.tsx`, and the anchor it refers to (`resumeAnchorRef`) is owned by `useDocumentLifecycle.ts`, threaded through `useReaderMode.ts` / `usePersistentReadingAnchor.ts` / `useReaderModeOrchestrator.ts`. All lines below verified against `sprint/narrate-dual-source-diag-1 @ 029a06a on 2026-05-29`.

### resumeAnchorRef — full lifecycle trace

**Declaration / ownership**
- `useDocumentLifecycle.ts:131` — `const resumeAnchorRef = useRef<number | null>(null);` (TTS-7M / BUG-135, comment at 130). Exposed at 255 (interface field at 64).

**SET sites**
- `useDocumentLifecycle.ts:165` — `resumeAnchorRef.current = restoredWordIndex;` (on document restore — sets anchor to the persisted reading position at load).
- `usePersistentReadingAnchor.ts:69` — `resumeAnchorRef.current = wordIndex;` (persistent-anchor write).
- `useReaderMode.ts:246` — `resumeAnchorRef.current = startAnchor;` (mode-change pause-to-page; reads resumeAnchorRef.current at 238 to compute startAnchor).
- `useReaderModeOrchestrator.ts:128` — `resumeAnchorRef.current = pageStart;`
- `ReaderContainer.tsx:1343` — `resumeAnchorRef.current = resolvedClickWordIndex;` (click-to-narrate sets anchor to clicked word).

**ACTIVE-skip sites (the suppressors)**
- `ReaderContainer.tsx:1255` — `const hasResumeAnchor = resumeAnchorRef.current != null;`
- `ReaderContainer.tsx:1256` — `if (mode !== "flow" && mode !== "narrate" && !hasResumeAnchor) { … }` (gates approx-word write).
- `ReaderContainer.tsx:1259` — the literal Live-QA log: `console.debug("[TTS-7M] onRelocate: resume anchor active at", resumeAnchorRef.current, "— skipping approx", approxWordIdx);`
- `ReaderContainer.tsx:1264` & `1270` — `mode === "page" && !hasResumeAnchor …` page-mode cursor-set gates (skipped while anchor active).
- `ReaderContainer.tsx:1282` — `if (!shouldPersistRelocate) return;` (with `hasResumeAnchor` fed into `shouldPersistRelocateProgress` at 1276–1279) — suppresses progress save while anchor active.
- `ReaderContainer.tsx:1380` / `1382` — onLoad path: `if (resumeAnchorRef.current != null) { … "[TTS-7M] onLoad: resume anchor active … skipping restore" }`.

**CONSUMED / CLEARED sites**
- `ReaderContainer.tsx:1353` — `resumeAnchorRef.current = null; // TTS-7M: explicit selection with no index clears stale anchors`. **This is the ONLY explicit clear-to-null site found.**
- No clear is performed by the narration hook, by `resume()`, by `pause()`, or on first word-advance. The anchor is cleared only on an explicit-selection-with-no-index event in ReaderContainer.

### Hypothesis assessment (Live-QA)
The Live-QA hypothesis — *"a resume anchor stays pinned at 0 and is never cleared, suppressing onRelocate, so cursorWordIndex never advances past 0, and on resume the seed is 0 → book restart"* — is **structurally plausible and consistent with the code**, with this precise mechanism:

1. `resumeAnchorRef` is SET to a restored/persisted value (lifecycle:165) or click value (1343). If that value is 0 (fresh book, or fraction→0 rounding), the anchor pins at 0.
2. While `resumeAnchorRef.current != null`, ReaderContainer's `onRelocate` (1255–1259) and `onLoad` (1380–1382) paths SKIP updating the approximate word index and SKIP progress save. **But note:** these skips suppress the *foliate-relocate-derived* cursor writes, not the *audio-boundary-derived* cursor writes (which flow through `onWordAdvanceRef` → the narration cursor). So the anchor suppresses one cursor-update channel (scroll/relocate) but not the audio channel.
3. The danger is specifically at **resume seeding**: resume branch (a) reads a caller-supplied `currentWordIndex`, and resume branch (b) reads `s.cursorWordIndex`. If the upstream caller derives `currentWordIndex` from a resume-anchor that is pinned at 0 (e.g. ReaderContainer passes `resumeAnchorRef.current` or a relocate-suppressed cursor into `resume(currentWordIndex)`), then resume reseeds all refs to 0 → speakNextChunkKokoro at 1194 reads 0 → book restart. **The cross-layer coupling (ReaderContainer's anchor → useNarration's resume seed) is the suspected A4 conduit.**

**FLAG — single-root-cause candidacy.** This resume-anchor-pinned-at-0 mechanism IS a credible single-root-cause candidate for A4, and it is materially DIFFERENT from the "dual-source race inside useNarration" framing the ULTRATHINK doc centers on. If DIAG-1 logs show the anchor pinned at 0 across steady-state AND the resume seed arriving as 0 from the ReaderContainer caller, then A4's root cause is the never-cleared resume anchor in the reader layer, NOT (primarily) the cursorWordIndex/lastConfirmedAudioWordRef dual-source race in the hook. **This would change the scope of Sprint 3 (PAUSE-RESUME-UNIFY-1):** unifying the in-hook seed priority chain would not fix an A4 whose bad input originates one layer up. PAUSE-RESUME-UNIFY-1 may need to additionally own (or coordinate with a new sprint owning) the resume-anchor clear lifecycle in ReaderContainer/useDocumentLifecycle. **Per instructions I am flagging this for codex-parent and NOT amending any spec.** The decisive disambiguator is in the path-ID schema below: instrument both the anchor SET/ACTIVE-skip/CONSUMED events AND the value that arrives at `resume()`'s seed.

---

## Section 5 — Proposed path-ID schema for Wave B instrumentation

Flat contract. Each `pathId` = exactly one structured-log insertion point. Hercules emits, at minimum, `{ pathId, cursorWordIndex, lastConfirmedAudioWordRef, nextGenWordIndexRef, nextKokoroExactStartRef, heardFloor (post-Step-2a), playingSourceMax, resumeAnchor (from ReaderContainer if reachable), startIdx, word }` at each.

Chunk-start (audio-decision reads):
- `speakNextChunkKokoro:seed` (useNarration.ts:1194) — THE primary read
- `speakNextChunkKokoro:exact-start-gate` (1204–1205)
- `speakNextChunkWeb:seed` (940)
- `speakNextChunkNano:seed` (995)
- `speakNextChunkPocket:seed` (1118)
- `speakNextChunkQwen:seed` (1287)

Pause / resume (each resume branch DISTINCT — required to avoid PARTIAL verdict):
- `pause:entry` (1868; capture cursor + heardFloor + playingSourceMax)
- `resume:cursor-mismatch` (1901; capture incoming currentWordIndex + all refs pre-reseed)
- `resume:cursor-mismatch:reseed` (1931–1932; capture post-reseed ref values)
- `resume:handoff-pending` (1937; capture s.cursorWordIndex + handoffPendingRef)
- `resume:handoff-pending:reseed` (1946–1947)
- `resume:bare` (1962/1969; capture cursor + that NO ref reseed happens; mark engine-delegated)
- `resume:bare:kokoro-engine` (inside kokoroStrategy.resume() — Hercules adds a log there + in audioScheduler resume path)

Rate change (one per speakNextChunk branch):
- `applyRateChange:kokoro-bucket` (1750)
- `applyRateChange:kokoro-same-bucket-tempo` (1775; no restart — logs that it took the no-reseed path)
- `applyRateChange:qwen` (1793)
- `applyRateChange:pocket` (1812)
- `applyRateChange:nano` (1830)
- `applyRateChange:web-nodebounce` (1844)
- `applyRateChange:web-debounced` (1860)

Cursor seeds / handoffs:
- `startCursorDriven:speaking-seed` (1601–1602)
- `startCursorDriven:kokoro-warming-seed` (1542–1543)
- `startCursorDriven:qwen-warming-seed` (1483–1484)
- `resyncToCursor:entry` (1617) and `resyncToCursor:seed` (1634–1636)
- `updateWords:handoff-seed` (1671) and `updateWords:handoff-restart` (1698 microtask)
- `syncNarrationCursor:write` (461–466)

Word advance (steady-state writers):
- `wordAdvance:kokoro` (1244–1246)
- `wordAdvance:web` (972)
- `wordAdvance:nano` (1073)
- `wordAdvance:pocket` (1158)
- `wordAdvance:qwen` (1305)
- `wordAdvance:syncCursor` (463)

Resume-anchor lifecycle (cross-layer — ReaderContainer/useDocumentLifecycle):
- `resumeAnchor:set` (useDocumentLifecycle.ts:165, usePersistentReadingAnchor.ts:69, useReaderMode.ts:246, useReaderModeOrchestrator.ts:128, ReaderContainer.tsx:1343 — emit with the source label)
- `resumeAnchor:active-skip` (ReaderContainer.tsx:1259 relocate, 1382 onLoad — the suppressor events; ALREADY logs in DEV, Hercules upgrades to structured)
- `resumeAnchor:consumed` (ReaderContainer.tsx:1353 — the only clear-to-null; **expected to fire on healthy resume, and its ABSENCE in the A4 trace is the smoking gun**)

Scheduler primitive (Step 2a oracle):
- `getPlayingSourceMaxWordIndex:query` (audioScheduler.ts:521 — the new getHeardFloorWordIndex wrapper logs each call)

**Total path-ID count: 36.**

---

## Section 6 — Step 2a oracle plan (confirm/correct)

**Confirmed.** `getHeardFloorWordIndex` **DOES NOT EXIST** anywhere in `src/` on this branch (grep across `src/` returned only `getPlayingSourceMaxWordIndex`; the `getHeardFloorWordIndex|getPlayingSourceMaxWordIndex` search matched only the three `getPlayingSourceMaxWordIndex` sites). This matches the ULTRATHINK "Second revision" (its line 302): the dissolved branch introduced both the wrapper and its consumers; the supersede pulled both.

**The primitive to wrap:** `getPlayingSourceMaxWordIndex(now: number): number | null` at **`src/utils/audioScheduler.ts:521`** (verified against `sprint/narrate-dual-source-diag-1 @ 029a06a on 2026-05-29`). It is a closure-scope function inside `createAudioScheduler`, currently consumed internally at lines 580 (tick clamp) and 982 (progress clamp). It returns the wordIndex of the last boundary of the latest-started active source, or `null` if no source is playing / no boundaries.

**Recommended wrapper placement.** Add `getHeardFloorWordIndex` as a **public method on the AudioScheduler object returned by `createAudioScheduler`** (same closure, so it can call `getPlayingSourceMaxWordIndex(audioCtx.currentTime)` directly), with null-handling that returns a stable floor (e.g. `getPlayingSourceMaxWordIndex(now) ?? <last-known-floor or current cursor>`). It should be exposed through `kokoroStrategy` so `useNarration` can reach it the way the dissolved branch did. This keeps the lag-compensation/clamp logic at the single data source (audioScheduler), per SRL-072's guardrail (declare the full consumer set up front) and the ULTRATHINK "consume compensation once at the source" lesson. ~20 lines, XS, a clean addition on top of an unchanged primitive. **Wave B must add ONLY the oracle + its instrumentation for DIAG-1 — NOT the naive consumers** (those belong to SK-N2…N5 with the priority chain).

---

## Section 7 — Spec/ULTRATHINK line-number discrepancies

Compared against the ULTRATHINK doc's "Second revision … verified against main post commit `4444276`" table (its lines 300–316) and the SK-N1 spec citations.

| Item | Spec/ULTRATHINK cited | Verified on this branch @ 029a06a | Delta |
|---|---|---|---|
| `getPlayingSourceMaxWordIndex` | audioScheduler.ts:521 | 521 | ✓ exact |
| `getHeardFloorWordIndex` exists? | "DOES NOT EXIST" | DOES NOT EXIST | ✓ confirmed |
| speakNextChunkKokoro def | 1187 | 1187 | ✓ exact |
| speakNextChunkKokoro seed read | (1202 cited in older drafts) | **1194** | seed read is 1194 on this branch; 1202 is the `callbackGeneration` line, NOT the seed |
| resyncToCursor def | 1617 | 1617 | ✓ exact |
| applyRateChange def | 1713 | 1713 | ✓ exact |
| applyRateChange branch count | 6 | 6 | ✓ confirmed (body prose "14" is stale) |
| applyRateChange branch lines | 1750,1793,1812,1830,1844,1860 | identical | ✓ exact |
| pause def | 1868 | 1868 | ✓ exact |
| resume def | 1896 | 1896 | ✓ exact |
| resume branch (a) cursor-mismatch | 1901 | 1901 | ✓ exact |
| resume branch (b) handoff-pending | 1937 | 1937 | ✓ exact |
| resume branch (c) bare-resume | 1962 | 1962 | ✓ exact |
| kokoroStrategy.resume() call in (c) | 1969 | 1969 | ✓ exact |
| WORD_ADVANCE dispatch sites | 463,972,1073,1158,1246,1305 | identical | ✓ exact (count 6) |
| handoff-pending resume seeds from | `s.cursorWordIndex` (heardFloor capture gone) | `s.cursorWordIndex` (1946–1947), NO heardFloor | ✓ confirmed absent |
| top-of-file refs | 187/188/199 | 187/188/199 | ✓ exact |

**Net:** the ULTRATHINK "main"-verified table is accurate on this branch; the one number worth flagging is the speakNextChunkKokoro **seed read at 1194** (some older draft references to "1202" point at the wrong line — 1202 is `callbackGeneration`, the seed is 1194). The SK-N1 spec's "~line 521" for the primitive and "~1187/~1617" for the function defs are exact. Body-prose "14 paths" remains the only substantive stale figure; the corrected count is 6.

**New structural finding not in the spec:** the resume-anchor mechanism (`resumeAnchorRef`) is entirely in the reader-container layer (ReaderContainer.tsx / useDocumentLifecycle.ts), with its only clear-to-null at ReaderContainer.tsx:1353. This is a cross-layer A4 candidate the in-hook dual-source framing does not capture. Flagged in §4 for codex-parent; Sprint 3 scope may need adjustment.
