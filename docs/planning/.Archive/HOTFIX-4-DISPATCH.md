## HOTFIX-4 v1.1.3 — Library, Progress, TTS & Sort Fixes

### KEY CONTEXT

Blurby v1.1.2 shipped with the EPUB column fix. Six user-reported issues remain across library categorization, progress tracking, TTS pause timing, and narration resume latency. These are all regressions or gaps from UX-1 and NAR-1 sprints. 841 tests / 41 files. Branch: `main`.

### PROBLEM

1. **Narration pause/resume latency** — Every Space→pause→Space→resume has perceptible delay. The rolling audio queue (TTS_QUEUE_DEPTH=3) should provide instant resume, but the consumer may be waiting for a new chunk to generate at the resume boundary. The initial narration entry also loads all 3 chunks before starting playback.
2. **Reset progress doesn't clear CFI** — `reset-progress` IPC sets `doc.position = 0` but leaves `doc.cfi` intact. On reopen, FoliatePageView sees the old CFI and navigates to the previous location.
3. **1% progress on first page** — DocCard forces any 0–1% progress to display as 1% via `rawPct > 0 && rawPct < 1 ? 1 : Math.round(rawPct)`. Combined with `(d.position || 0) > 0` for "READING NOW" categorization, opening an EPUB fires onRelocate with fraction ≈ 0.001, saving a tiny position that immediately moves the book out of "NOT STARTED".
4. **No word highlighted on reopen** — After FoliatePageView navigates via `goToFraction()` (lossy word-index→fraction conversion), the `onLoad` callback overwrites `highlightedWordIndex` with `findFirstVisibleWordIndex()` instead of the saved position.
5. **TTS pause sliders disconnected** — `pauseDetection.ts` imports hardcoded constants (`TTS_PAUSE_COMMA_MS`, etc.) instead of reading runtime settings. Sliders update settings but the pause logic never reads them. Also: no parenthetical `(...)` or colon pause type — colons lumped with commas. User wants: "Clause pause" (colon + parenthetical) and "Comma pause" as separate categories.
6. **Sort tied to wrong collection** — Single global sort controls both "Reading Now" and "Not Started". User wants: Reading Now ALWAYS sorted by closest-to-finished (no dropdown). Sort dropdown moves to the "Not Started" section header, defaulting to "A-Z by Author".

### EVIDENCE OF PROBLEM

- Bug 2: `main/ipc/documents.js` line 31 — `doc.position = 0;` with no `delete doc.cfi`.
- Bug 3: `src/components/DocCard.tsx` line 79 — `rawPct > 0 && rawPct < 1 ? 1 : Math.round(rawPct)`.
- Bug 3: `src/components/LibraryView.tsx` line 239 — `(d.position || 0) > 0` threshold for "READING NOW".
- Bug 4: `src/components/ReaderContainer.tsx` lines 690-692 — `setHighlightedWordIndex(firstVisible)` overwrites saved position.
- Bug 5: `src/utils/pauseDetection.ts` lines 7-11 — imports constants, not settings. Lines 68, 107, 111 use those constants.
- Bug 6: `src/components/LibraryView.tsx` lines 503-517 — single sort dropdown in tabs row, applies to entire filtered library.

### HYPOTHESIZED SOLUTION

See task table. Each bug has a mechanically obvious fix.

### WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Fix reset-progress: add `delete doc.cfi` in `main/ipc/documents.js` line 31 | renderer-fixer | sonnet |
| 2 | Fix 1% display: change DocCard.tsx progress formula to `Math.round(rawPct)`. Add engagement gate to EPUB onRelocate: don't save position until `hasEngagedRef.current` is true for ALL modes (currently only gates `page` mode on line 629). Also add a minimum-position threshold in LibraryView categorization: treat `position < 3` as "NOT STARTED" to handle tiny rounding artifacts. | renderer-fixer | sonnet |
| 3 | Fix highlight on reopen: in ReaderContainer.tsx `onLoad` callback (line 688-694), only overwrite `highlightedWordIndex` if no saved position exists (i.e., `activeDoc.position === 0` or `activeDoc.position === undefined`). If a saved position exists, use it. Also: after FoliatePageView `goToFraction` completes, call `highlightWordByIndex(activeDoc.position)` to visually highlight the correct word. | renderer-fixer | sonnet |
| 4 | Fix TTS pause settings disconnection: refactor `pauseDetection.ts` to accept pause durations as parameters instead of importing constants. Signature becomes `getChunkBoundaryPauseMs(lastWord, nextWord, isParagraphBreak, sentenceCount, pauseConfig: { commaMs, clauseMs, sentenceMs, paragraphMs, dialogueThreshold })`. Update callers (`audioQueue.ts` line 269, `rhythm.ts` line 77) to pass settings values from their config/context. Add new setting fields: `ttsPauseClauseMs` (default 150ms) for colons and parenthetical closings `)`. Rename existing comma pause to only match `,` and `;`. Add parenthetical detection: if `lastWord` ends with `)` (after quote-stripping), use clause pause. If ends with `:`, use clause pause. | renderer-fixer | sonnet |
| 5 | Update TTSSettings.tsx: rename "Comma pause" → "Comma pause" (keep, for `,` `;`). Add "Clause pause" slider (for `:` and `)`) with range 0–500ms, step 25, default 150ms. Keep sentence and paragraph sliders. Keep dialogue threshold. | renderer-fixer | sonnet |
| 6 | Fix narration resume latency: in `audioQueue.ts`, start playback as soon as the FIRST chunk is ready (don't wait for all TTS_QUEUE_DEPTH chunks). Producer continues filling the queue in the background. On resume after pause: if `AudioContext` is suspended, just `ctx.resume()` (already implemented correctly). Investigate and fix any code path where resume triggers a new `generate()` call instead of resuming the suspended context — the user reports lag on every pause/resume, not just cold start. Check `kokoroStrategy` pause/resume in `src/hooks/narration/` for any state reset that would cause re-generation. | renderer-fixer | sonnet |
| 7 | Fix library sort: Remove sort dropdown from tabs row (line 503-517). "Reading Now" always sorted by closest-to-finished — apply `progress` sort to `readingNow` array directly in the `useMemo` at line 238. Move sort dropdown to "Not Started" section label line (inline with the "Not Started" text). Sort only applies to `notStarted` array. Default sort for "Not Started" changes to `"author"`. Update `settings.defaultSort` default from `"progress"` to `"author"`. Remove "closest to done" from sort options (it's now implicit for Reading Now). | renderer-fixer | sonnet |
| 8 | Update constants.ts: add `TTS_PAUSE_CLAUSE_MS = 150`. Add `FOLIATE_MIN_ENGAGEMENT_POSITION = 3` (minimum word position to count as "started"). | renderer-fixer | sonnet |
| 9 | Update types.ts: add `ttsPauseClauseMs?: number` to BlurbySettings. Add to DEFAULT_SETTINGS in constants.ts. | renderer-fixer | sonnet |
| 10 | Run `npm test` — all 841+ tests must pass | test-runner | haiku |
| 11 | Run `npm run build` — must succeed | test-runner | haiku |
| 12 | Update LESSONS_LEARNED.md: add entry about pauseDetection reading constants vs settings (settings-constants disconnect anti-pattern) | doc-keeper | sonnet |
| 13 | Bump package.json version to 1.1.3 | renderer-fixer | sonnet |
| 14 | Git: commit on `sprint/hotfix-4`, merge to main with `--no-ff` | renderer-fixer | sonnet |
| 15 | Print terminal summary of all changes | blurby-lead | — |

### WHERE (Read in This Order)

1. `CLAUDE.md` — project rules, agent config, standing rules
2. `docs/governance/LESSONS_LEARNED.md` — anti-patterns to avoid
3. `main/ipc/documents.js` lines 28-42 — reset-progress handler (Bug 2)
4. `src/components/DocCard.tsx` lines 76-80 — progress percentage (Bug 3)
5. `src/components/LibraryView.tsx` lines 238-241, 503-517, 634-721 — categorization + sort + rendering (Bugs 3, 6)
6. `src/components/ReaderContainer.tsx` lines 612-637, 678-697 — onRelocate + onLoad (Bugs 3, 4)
7. `src/utils/pauseDetection.ts` — entire file (Bug 5)
8. `src/utils/audioQueue.ts` lines 255-283 — pause consumption (Bugs 5, 1)
9. `src/utils/rhythm.ts` line 77 — getChunkBoundaryPauseMs caller (Bug 5)
10. `src/hooks/narration/kokoroStrategy.ts` — pause/resume implementation (Bug 1)
11. `src/components/settings/TTSSettings.tsx` lines 268-332 — pause sliders (Bug 5)
12. `src/constants.ts` — TTS defaults, engagement threshold (Bugs 5, 3)
13. `src/types.ts` — BlurbySettings type (Bug 5)
14. `src/components/FoliatePageView.tsx` lines 469-485 — position restoration (Bug 4)

### HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| renderer-fixer | sonnet | All code changes: IPC handler, components, utils, constants, types. Steps 1-9, 13-14. |
| test-runner | haiku | Steps 10-11: `npm test` and `npm run build` |
| doc-keeper | sonnet | Step 12: LESSONS_LEARNED update |
| blurby-lead | opus | Step 15: terminal summary |

### WHEN (Execution Order)

```
[1-3] SEQUENTIAL (shared files: ReaderContainer, LibraryView):
    [1] reset-progress CFI fix
    ↓
    [2] 1% progress + engagement gate
    ↓
    [3] highlight on reopen fix
    ↓
[4-5] SEQUENTIAL (shared files: pauseDetection, TTSSettings):
    [4] TTS pause settings refactor + clause pause type
    ↓
    [5] TTSSettings UI update
    ↓
[6] narration resume latency (audioQueue.ts, kokoroStrategy)
    ↓
[7] library sort restructure (LibraryView.tsx)
    ↓
[8-9] PARALLEL:
    ├─ [8] constants.ts updates
    └─ [9] types.ts updates
    ↓ (both complete)
[10-11] PARALLEL:
    ├─ [10] npm test
    └─ [11] npm run build
    ↓ (both complete)
[12] LESSONS_LEARNED update
    ↓
[13-14] SEQUENTIAL: version bump → git commit/merge
    ↓
[15] terminal summary
```

### ADDITIONAL GUIDANCE

- **Bug 1 (narration latency):** The architecture investigation shows pause/resume is AudioContext suspend/resume — should be instant. The user reports lag on EVERY resume. Investigate whether `kokoroStrategy.resume()` does anything beyond `audioQueue.resume()`. Check if there's a React re-render or state update between pause→resume that causes the component to remount and re-initialize. Check if the `onLoad` callback (FoliatePageView section extraction) fires during resume and triggers word array rebuilding. If the root cause cannot be identified in the code, add a `console.time`/`console.timeEnd` instrumentation to measure each step in the resume path and document findings for manual debugging.
- **Bug 5 (pause settings):** The `getChunkBoundaryPauseMs` function is pure — make it accept a config object so callers can pass runtime settings. Don't use React context inside utils — pass values from the caller.
- **Bug 6 (sort):** The sort dropdown should render inline with the "Not Started" section label, on the right side. Use the same `sort-select` CSS class. The sort dropdown should appear in BOTH grid and list view modes — it renders next to the "Not Started" label, not in the tabs row.
- **Bug 3 (engagement gate):** The guard `if (!hasEngagedRef.current && mode === "page") return;` on line 629 means non-page modes (focus, flow, narration) always save progress. This is correct for those modes since the user explicitly started them. But for page mode, opening a book fires relocate immediately. The fix is to also not update `doc.position` or the library's in-memory position for the initial relocate. Keep the engagement gate for page mode only but also ensure the tiny position from initial relocate doesn't persist.
- **CSS custom properties rule:** All new styles via CSS custom properties in `global.css`. No inline styles except where existing patterns use them (TTSSettings sliders already use inline styles for dim text).
- **Constants separation rule:** All new numeric values in `constants.ts`.

### SUCCESS CRITERIA

1. Reset progress then reopen book → book starts at beginning (position 0, no CFI)
2. Open an EPUB cold (never opened before) → shows 0% in library, categorized as "NOT STARTED"
3. Open a previously-read EPUB → correct word is highlighted, page shows last reading position
4. TTS pause sliders: changing sentence pause from 400ms to 1000ms produces noticeably longer pauses between sentences
5. Comma slider (for `,` `;`): changing value changes pause duration at comma boundaries
6. Clause slider (for `:` `)`): changing value changes pause duration at colon/parenthetical boundaries
7. "Reading Now" always sorted closest-to-finished, no sort dropdown visible
8. "Not Started" has sort dropdown defaulting to "A-Z by Author"
9. Narration pause→resume: investigate and document root cause; if fixable, resume is perceptibly faster
10. All 841+ tests pass, build succeeds
11. `package.json` version = 1.1.3
12. LESSONS_LEARNED updated with settings-constants disconnect anti-pattern
13. Branch `sprint/hotfix-4` merged to main with `--no-ff`
