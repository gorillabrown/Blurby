# NARRATE-REBUILD-1 P5, row 62: why the Narrate view runs away from the narration (read-only)

Worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p5`, branch `eb/narrate-rebuild-1-p5`, HEAD `5dce982e`. Nothing in the worktree was edited.

## Verdict: cause shown (confidence HIGH)

There are three faults. Each one alone is harmless; together they produce the runaway.

1. **The Narrate view opens on the wrong section.** The view opens on the section of the CFI that Page mode hands over. A fresh profile has no saved CFI, so Page opens the book at `goToFraction(8723 / 80426 = 0.1085)`. Foliate turns a fraction into a section by **byte size**, not by word count, and 0.1085 falls in byte section 4 (0.1067–0.1317). By word count, word 8723 is in section 3 (words 5473–9423). Page's later jump to the word (`PAGE_SURFACE_LOAD_DELAY_MS`, then `jumpToWordAnchor`) races the trial's Narrate click. Narrate therefore gets a section-4 CFI (bad runs) or the cover's CFI (good runs; see Q4).
2. **When the highlight misses, Narrate always moves forward.** `onEngineCursor`, the `onWordsReextracted` pending-resume retry and the view's scroll-follow all call `renderer.next()`, whichever direction the spoken word lies in. From section 4, section 3 is never reached.
3. **The one backward navigation is silently dropped and never retried.** `syncSection` issues `goToSection(3)` about 5 ms after the cursor-miss `next()`. Foliate's paginator ignores any `goTo` while a page turn holds its lock (`paginator.js:1058`), and the lock lasts at least 100 ms. `syncSection` has already set `currentSection = 3`, so it never tries again.

## Q1: why does `surface.highlight(word)` return false for every word?

- **(a) Section-index mismatch: ruled out.** Both sides number sections by spine index. In `main/epub-word-extractor.js:219` `sectionIndex` is the spine index; in foliate `epub.js:974` the sections are `spine.map(...)`. The word counts agree exactly when the extractor is run on `resources/sample-meditations.epub`:
  - bookWords: §3 5473–9423 (3,950, "HIS FIRST BOOK"), §4 9423–11644 (**2,221**), §5 3,327, §6 5,410, §7 5,399, §8 5,571.
  - Traced view loads: §4 **2,221**, §5 3,327, §6 5,410, §7 5,399, §8 5,571.
- **(c) Span-offset error: ruled out.** `wrapWordsInSpans` uses `bookSection.startWordIdx` for the same index (`FoliateView.tsx:785-795`), and the counts above match.
- **(b) The view opened at the wrong section: confirmed.**
  - The trace has no `initial-open` nav event, so `initialCfi` was non-null (`FoliateView.tsx:993-1007`).
  - The first load was §4 at t=868 ms, before Play. The trial log shows `narrate view { spans: 2221 }`.
  - `initialCfi` is `handoff.cfi` (`persistentReadingAnchor.ts:64-71`), and the handoff `cfi` is Page's `s.cfi` (`page/ModeRuntime.ts:282`), which every relocate writes (`page/ModeRuntime.ts:426-435`).
  - Page opens a fresh book through `view.init({})`, which loads the cover. It then calls `goToFraction(position / wordCount)` (`page/FoliateView.tsx:737-748`).
  - Computed from the epub's spine item sizes (foliate `progress.js:59-70`), the byte-fraction bounds are: §3 0.0624–0.1067, **§4 0.1067–0.1317**. The fraction 8723/80426 = 0.1085 lands in §4.
  - Narrate's view therefore displays §4 while the engine speaks §3, and every highlight misses.

## Q2: why does the section-sync to 3 never load section 3?

Order of events in session 1 (session 2 is the same):

```
t=3909.0  cursor-miss   word 8724  -> ModeRuntime.ts:672-674 surface.next() -> paginator #turnPage sets #locked = true (paginator.js:1096-1097)
t=3913.6  scroll-follow word 8724  -> FoliateView.tsx:1389-1390 renderer.next() (dropped: locked)
t=3913.8  section-sync  word 8724 target 3 -> ModeRuntime.ts:565-569 currentSection = 3; goToSection(3)
          -> view.goTo(section.id) -> renderer.goTo: `if (this.#locked) return` (paginator.js:1058) -> dropped, no error
t=4025.6  cursor-miss   word 8725 sectionIndex 3 target 3   (the runtime now believes section 3 is shown)
```

- **The drop is deterministic.** The lock is set synchronously inside `onEngineCursor`. It is held for the scroll plus `wait(100)` (`paginator.js:1103`), or for a whole section load. The sync runs in a passive effect about 5 ms later (`useModeBindings.ts:29-31`; the child view's effects run first).
- **The first sync is always the one that loses.** At mount `bookWords` is absent, so `syncSection` returns at line 557. Its effect re-runs only when `highlightedWordIndex` changes (`useModeBindings.ts:31`), and word 8723 is already published by `start()`. The first sync is therefore always at word 8724, right after that word's miss `next()`.
- **There is no retry.** `goToSection` reports no failure: `surface.ts:50` and foliate's `goTo` resolve `undefined`. `syncSection` also returns early from then on because `sec.sectionIndex === s.currentSection` (`ModeRuntime.ts:561`).
- **The same drop happens at the forward crossing.** At word 9431 the `section-sync` to 4 (t=262,842 / 144,458) produced no load in either traced session.

## Q3: why does the miss path page forward when word 3 is behind the displayed section?

Every miss handler is direction-blind by design. Each one assumes a miss means the next section:

- `ModeRuntime.onEngineCursor` (lines 671-675): `if (!highlight) { pendingResume = word; surface.next(); }`
- `ModeRuntime.onWordsReextracted` (lines 518-526): if the pending word misses after any section load, it calls `surface.next()` again. This is the 14 `pending-resume` events, one after each load.
- `FoliateView` scroll-follow (lines 1384-1395): "Word is not in the current section's DOM — advance to the next section", then `renderer.next()`. This accounts for 465 and 638 events.

The trial driver says the same thing (`main/narrate/trial.js:189-190`): "Play steps the view to the section that holds the start word (the runtime's pending-resume path)". That only works when the view starts before the word's section. Each `next()` scrolls one viewport, and at the end of a section it loads the following one. That is why loads came every 3–10 s, from §4 forward to §18, the last section.

## Q4: why is it intermittent?

The section Narrate opens on decides the outcome. I matched each `paginator` iframe-warning line in the logs to the spoken word, using the producer's epoch stamps and the trace's commit `ts`. Script: `scratchpad/runaway/loads.mjs`.

| run | loads before Play | after Play |
|---|---|---|
| freeze launch 1 (18:52), launch 2 (18:57), p5 session-2 (17:08), p5 session-1 (18:17) | **2** | 3 loads in the first ~12 s (words 8725–8779), then one load at word ~9431 (the real §4 crossing, when reached) |
| freeze launch 3 (19:00), final 19:29/19:34, traced 20:27/20:32 | **3** | 14 loads, one every 3–10 s, to §18 |

The code predicts both rows. Launches 1–3 ran the same tree, so this is not a code change.

- **Bad runs (3 pre-play loads):** Page loads the cover, then §4 by fraction, and Narrate is clicked before Page's delayed word jump. Narrate inherits the §4 CFI and opens §4. From there, forward paging can never reach §3, so the view runs to §18.
- **Good runs (2 pre-play loads):** Narrate is clicked after Page's cover load but before its fraction move. Narrate inherits the cover CFI and opens §0. The forward paging then loads §1, §2 and §3 (the 3 early loads), lands on the word's section, and the highlights hit from then on. The later crossing load is the ordinary forward `next()` at the end of §3.
- **Totals check out:** 2 + 3 = 5 (1.00x, 3.5 min, no crossing reached) and 2 + 3 + 1 = 6 (2.00x, crossing reached). These match "5 and 5–6".

**Decided:**
- Bad outcome = Narrate opened past the word's section; good = opened before it. This follows from the pre-play load counts in all 9 runs and the traced sections in 2.
- The drop and the forward-only paging are deterministic in code.

**Not decided:**
- Which CFI Page actually handed over in the untraced runs. Neither the handoff record nor the trace carries the CFI, so "cover" in the good runs is inferred from the counts, not recorded.
- Why Page reached its fraction move before the click in some launches. The code predicts a timing race: the trial clicks Narrate as soon as the bar appears (`trial.js:166-170`), while Page's open is asynchronous (cover load, fraction move, then `PAGE_SURFACE_LOAD_DELAY_MS`, then the jump). The resize at 2.8–3.5 s happens after the first load in both traced sessions, so it is not the trigger.

**What would close it:** one `narrate-view-open` trace record with `initialCfi`'s section index. The fix below does not need it, because it works whatever section the view opens on.

## Fix spec (ONE fix, Hercules, `src/reader/modes/narrate/**` + tests)

**Name:** a highlight miss navigates to the spoken word's own section, one navigation at a time. It never pages blindly.

### 1. `src/reader/modes/narrate/FoliateView.tsx`

- Add `getDisplayedSectionIndex: () => number | null` to `NarrateFoliateViewAPI` (lines 250-266).
- Implement it in the `viewApiRef.current = {…}` block (about line 1112) as `() => lastLoadedSectionIndexRef.current`. This is the section foliate last loaded and wrapped. The paginator shows one section at a time.
- Scroll-follow effect (lines 1384-1395): when the word is not found, do nothing. Replace the `!state.found && !cooldown` branch body (the `scroll-follow` trace, `view.renderer.next()` and the cooldown timer) with `if (!state.found) return;`.
- Delete the now-dead `NARRATE_PAGE_TURN_COOLDOWN_MS` (line 67), `narratePageTurnCooldownRef` and `narratePageTurnCooldownTimerRef` (lines 387-388), and their cleanup (line 1216).

### 2. `src/reader/modes/narrate/surface.ts`

Add `getDisplayedSectionIndex(): number | null`, implemented as `api()?.getDisplayedSectionIndex?.() ?? null`. Optional chaining keeps older fakes working.

### 3. `src/reader/modes/narrate/ModeRuntime.ts`

Add one private helper and route the three callers through it:

```ts
/** A miss goes to the spoken word's own section, one navigation at a time; it never pages blindly (BUG-191 runaway). */
private followSpokenSection(word: number, caller: string): void {
  const s = this.state;
  const target = this.surface.getSectionForWordIndex(word);
  if (target == null) { this.traceSectionNav(caller, word); this.surface.next(); return; } // no section map: legacy forward step
  const shown = this.surface.getDisplayedSectionIndex();
  if (target === shown || s.sectionNavInFlight != null) return;
  s.sectionNavInFlight = target;
  s.currentSection = target;
  this.ports.diagnostics.trace({ kind: "transition", transition: "section", from: shown ?? -1, to: target, context: `word ${word}` });
  this.traceSectionNav(caller, word, target, shown ?? -1);
  // foliate drops a goTo while a page turn holds its lock and resolves anyway: clearing in-flight lets the next cursor retry.
  this.surface.goToSection(target).catch(() => {}).finally(() => { if (this.state.sectionNavInFlight === target) this.state.sectionNavInFlight = null; });
}
```

- **`onEngineCursor`** (lines 671-675): on a miss, `s.pendingResume = word; this.followSpokenSection(word, "cursor-miss");`. Remove `surface.next()` from this path.
- **`onWordsReextracted`** (lines 520-525): on a miss, `s.pendingResume = pending; this.followSpokenSection(pending, "pending-resume");`. Remove `surface.next()` from this path.
- **`syncSection`** (lines 556-570): keep the `alive` / `useFoliate` / `bookWords` early return. The body becomes `this.followSpokenSection(this.state.publishedHighlightedWordIndex, "section-sync")`.
  - Drop the `currentSection` comparison, the throttle and `NARRATE_SECTION_SYNC_THROTTLE_MS`.
  - Remove `lastGoToSectionTime` if nothing else reads it (grep first).
- **`traceSectionNav`** (line 589): `displayed` defaults to `displayed ?? this.surface.getDisplayedSectionIndex() ?? this.state.currentSection`.
- **`stop()`**: also reset `sectionNavInFlight = null`.

### 4. `src/reader/modes/narrate/ModeState.ts`

Add `sectionNavInFlight: number | null = null`.

### Behaviour after the fix

- The view shows the spoken word's section: one `goToSection` to §3, about 0.4 s after Play in the bad case.
- A miss never pages away from the word.
- A true forward crossing (word 9423 while §3 is shown) becomes `goToSection(4)` from the cursor-miss.
- A dropped `goTo` is retried by the next cursor update once the dropped call has resolved.
- There is never more than one section navigation in flight, so the miss path and `section-sync` cannot double-load a section.

### FAILING-FIRST test: new file `tests/narrate/narrate.runaway.test.ts`

Use the `narrate.crossings.test.ts` harness (fake document with `bookWords` sections, `FakeProducer`, `FakeAudioOutput`, manual `tick`, and `syncSection` on each cursor change).

**Fake view:**
- 6 sections. `loaded = 4` at start.
- `getDisplayedSectionIndex: () => loaded`.
- `highlightWordByIndex` returns true only inside `SECTIONS[loaded]`.
- `next()` pushes `"next"`, advances `loaded`, and sets `locked = true` until a `setTimeout(0)`. This models `paginator.js:1058/1096`.
- `goToSection(i)` pushes `goToSection:i`. It is a **no-op while `locked`**; otherwise it sets `loaded = i`.
- Every change of `loaded` is followed by `runtime.onWordsReextracted()` and one frame.

**Script:** `select` and `start` at word `S4.start - 3`, which is in §3 while the view shows §4. Tick through about 6 words so the cursor crosses into §4.

**Assertions:**
- `calls` never contains `"next"`.
- The sequence of displayed sections is exactly `[4, 3, 4]`.
- Every committed word from the first word after the §3 load is highlighted (`highlight:w` returns true).
- `loaded` never exceeds 4.
- The diagnostics port records `transition section` 4→3 and then 3→4.

**First seen failing:** before any source change, run `npx vitest run tests/narrate/narrate.runaway.test.ts`. On the current tree the first miss calls `next()` (loaded 5) and the `goToSection(3)` from `syncSection` is dropped by the fake lock. Both the "no next" and the `[4,3,4]` assertions fail. Record that output, then implement.

**Existing tests to update in the same change** (their old assertions encode the forward-only design):
- `tests/narrate/narrate.crossings.test.ts` lines 118-123: `calls[firstMiss + 1]` becomes `"goToSection:1"`, and `calls` does not contain `"next"`. Add `getDisplayedSectionIndex: () => loaded` to its fake view.
- `tests/narrate/narrate.sectionNav.test.ts`: give the fake API `getDisplayedSectionIndex: () => 1` and `goToSection: vi.fn(async () => {})`. The cursor-miss and pending-resume cases then expect `goToSection(2)` and no `next`, with the trace event emitted before the call.
  - The pending-resume case: the first navigation is still in flight, so expect `cursor-miss` only, or resolve it before re-extracting and expect both callers.
  - The no-sink case expects the same calls and no events.

**Gate:** the targeted narrate suites, then the full suite, typecheck and build, under the epic's quiet-window rules.

### What the fix does NOT do

- No latency lever: no chunking, prefetch, threads, workers or generation changes.
- No change to Page, Focus or Flow, and none to the shared-core files `src/types.ts`, `src/components/ReaderContainer.tsx` and `src/utils/FlowScrollEngine.ts`.
- It does not change which section the Narrate view opens on before Play. The handoff CFI and Page's byte-fraction open are untouched, so before Play the view can still show §4 or the cover. If that should change, it is a separate item.
- It does not touch `start()`'s `empty-words-retry` `next()` (line 276), which runs only when no words exist, or `jumpBack`.
- No new constants.

## Risks

- **Section crossings (R-crossing suite).**
  - The forward crossing moves from `next()` to `goToSection(target)`. In foliate, `goTo(section.id)` opens the section at its top (anchor 0), which is what `next()` did at a section end.
  - The crossings test must be updated as listed. Its order and no-drop assertions stay.
  - The engine's chunk breaks are unaffected.
- **Click.**
  - A click while playing restarts at a word in the displayed section, so the highlight hits and nothing navigates.
  - A click arriving while a navigation is in flight: the next cursor re-evaluates after it resolves.
- **Resume.** The same as Play, since `pendingResume` is kept. If `jumpBack` or `jumpToWordAnchor` is dropped by a lock, it now hits one less often, because the miss path no longer locks the paginator.
- **D3 lateness.**
  - The bad case goes from 15 loads in 5 minutes to 1 (§3, 3,950 words; wrap about 40–70 ms) in the first second of Play.
  - The traced sessions show each load ends in a 130–253 ms renderer frame, so one such frame may land on an early commit.
  - The §17 load (1.15 s frame) disappears from these sessions.
  - BUG-191's long-frame cost per load is not fixed here.
- **The scroll-follow effect.**
  - Removing its `next()` means a word that is in the displayed section but not yet indexed no longer pages away. It also no longer gets a page turn; it waits for the word-position index rebuild and the next cursor.
  - In scrolled flow the in-section path (`scrollToAnchor`) is unchanged.
  - User browse-away detection is unchanged.
- **Books without `bookWords` sections.** `getSectionForWordIndex` falls back to `foliateWords`. When it returns null, the helper keeps the legacy `next()`, so loaded-slice books behave as before.

## For the planner: can D3/D5 see this?

No. The in-app D3/D5 check reads only `narrate-commit` (engine) records; it never sees whether the highlight was painted, so a session with 100 % highlight misses passes D5.

A cheap rule using the new trace records:
- `narrate-section-nav` events with caller `cursor-miss` ≤ 1 + the number of section crossings among the committed words.
- `narrate-section-load` count ≤ the distinct sections of committed words + 1.
- Every load's `sectionIndex` is one of those sections.

The traced sessions fail all three: 802 misses, 15 loads, sections 4–18 against 3–4.

## Files read

- `src/reader/modes/narrate/ModeRuntime.ts`, `surface.ts`, `useModeBindings.ts`, `FoliateView.tsx` (lines 240-480, 740-1180, 1205-1220, 1340-1410); `helpers/persistentReadingAnchor.ts` (60-80)
- `src/reader/modes/page/ModeRuntime.ts` (270-300, 420-440, 485-530), `page/helpers/foliateAnchorNavigation.ts`; `src/reader/useReaderModeOrchestrator.ts` (270-340)
- `node_modules/foliate-js/view.js` (295-330, 430-470), `paginator.js` (1000-1125, `#locked` grep), `epub.js` (1040-1060, section construction grep), `progress.js` (SectionProgress)
- `main/epub-word-extractor.js` (155-190, section grep); `main/narrate/trial.js` (1-230); `scripts/narrate-rebuild/p5-latency-e2e.mjs` (grep)
- `tests/narrate/narrate.sectionNav.test.ts`, `narrate.crossings.test.ts` (60-161)
- `docs/studies/narrate-rebuild-1/phase5/section-trace.trace-1.md`; `p5-trace` traces and logs; logs and traces for `p5`, `p5-final` and `p5-freeze/launch-{1,2,3}`; grep of `freeze-fix.launches.md`, `journal.md` and `state.md`

## Commands run (all read-only; nothing written outside `scratchpad/runaway/`)

- `pwd`; `git --no-optional-locks branch --show-current`; `git --no-optional-locks log … -- <narrate/page paths, launcher>` (with `GIT_OPTIONAL_LOCKS=0`)
- `node scratchpad/runaway/early.mjs <session-1 trace> 0 6000` (early event dump)
- `node -e` running `main/epub-word-extractor.extractWords(resources/sample-meditations.epub)` (section bounds)
- `node -e` reading the epub spine and sizes with adm-zip and cheerio (foliate byte fractions)
- `node scratchpad/runaway/loads.mjs <log> <trace>` for the p5, p5-final, p5-trace and p5-freeze launches (load-to-word mapping)
- grep, sed, ls and stat over sources, logs and artifacts

No app runs, no `npm test` or build, no vitest.
