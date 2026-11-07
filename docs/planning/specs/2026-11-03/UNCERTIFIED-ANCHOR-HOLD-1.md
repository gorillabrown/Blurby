#### UNCERTIFIED-ANCHOR-HOLD-1 — Flow, Focus and Narrate never save or start from an unverified first visible word *(Seq 87.75; Full Spec 2026-11-03, traced at `origin/main` `14ce3d24` and built on BLOCK-TEXT-ORDER-1's specified shape, which is not merged yet; Reader Engine; Blurby.Brain1 ruling Q2 on BLOCK-TEXT-ORDER-1 Wave B; one commit per mode; dispatch-ready once BLOCK-TEXT-ORDER-1 merges and Done-when 0 passes, subject to Blurby.Brain1 Q1–Q3 and owner question U1 below; effort M on the register, S by this trace)*

- **What:** in Flow, Focus and Narrate, no word index read from a span in an uncertified section reaches a start or a save. BLOCK-TEXT-ORDER-1 (BTO) holds clicks in all four modes and Page's turn and click saves. This item covers the other three modes' first-visible-word paths, which Brain1's Q2 moved here.
  - **The trace narrows the scope** (Why). At `14ce3d24` these three modes have:
    - **no soft anchor save.** The `soft-visible` anchor event is declared but never dispatched;
    - **no relocate save that reads a span.** Each relocate save writes the mode's committed anchor, not the first visible span's `data-word-index`;
    - **one span read on a start path:** Play's first-visible-word fallback.

    So the change is one choke point per mode. When Play falls back to the first visible word, and that word's document is held, Play starts from a canonical word in the book's word map instead of the span's index.
  - **Out of scope:**
    - clicks and selections, and Page's turn and click saves (BTO);
    - Page in general, including what Page hands over to the other modes. After BTO, Page's held turn reports `wordIndex: null`;
    - paragraph starts read from book-stamped documents, uncertified ones included (Brain1 Q3, below);
    - Focus's relocate highlight, `approxWordIdx` (`focus/ModeRuntime.ts:868`, `:877`). It is a fraction estimate, not a span read, and it exists whether or not the section is certified. It is a finding for Blurby.Roadmap (below);
    - the cfi contract (CFI-POSITION-CONSISTENCY-1), and saves as you go (FLOW- and NARRATE-SAVE-AS-YOU-GO-1, and CFI-POSITION-CONSISTENCY-1 Wave C for Focus);
    - restamp currency (FLOW-RESTAMP-CURRENT-1, NARRATE-RESTAMP-CURRENT-1);
    - shared core.
  - **Outcome:**
    - A reader whose saved word lies past the end of the book's word map presses Play. The page shown is in a section whose spans BTO could not certify. Flow, Focus and Narrate start at that section's first word, from the map, not at the span's index.
    - Narrate's sentence rule (owner O3) applies to that canonical word. A section's first word is its own sentence start.
    - In a certified section nothing changes. Relocate saves during playback still save the engine's canonical word with the cfi in every section.
- **Why:**
  - **Origin.** Brain1's ruling Q2 on BTO Wave B (`C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.held-items-TQ.2026-11-03.md`, section "BLOCK-TEXT-ORDER-1 Wave B: Q1–Q4", Q2) names three paths: the soft and relocate anchor saves, and Play from the first visible word. They become this item: Reader Engine, one commit per mode, sequenced directly after BTO inside each mode's ownership window.
    - The same file's "technical shape of the owner's OQ4" says that in an uncertified document every word index *derived from a span* is untrusted, including "the first visible word used for a save, a page turn, or Play from the first visible word". Indices from the canonical word table "are unaffected. The hold never touches them."
  - **The owner's OQ4, exact wording.**
    - BTO spec, Design decisions: "**OQ4, change.** In a section whose stamping cannot be certified, clicks and saves hold to the cfi only, as Page does before the words arrive."
    - Contracts doc, "Owner answers": "In a section whose stamping cannot be certified, clicks and saves hold to the cfi only, as Page does before words arrive, instead of risking a wrong word."
    - Neither wording mentions starts. A start has no cfi-only form, so where Play starts is owner question U1.
  - **Path 1, the soft anchor save: none in these modes.**
    - The event type `{ type: "soft-visible" }` is declared in each mode's `helpers/persistentReadingAnchor.ts` (`:11`, `:43`). Nothing in `src/reader/modes/{flow,focus,narrate}` dispatches it.
      - `git grep -n "soft-visible" -- src` finds only those helper lines, the legacy `src/utils/persistentReadingAnchor.ts` and the unused `src/reader/anchors/useCurrentWordAnchor.ts`.
    - `softWordIndex` is written only by the anchor helper's `writeRefs`, which mirrors the committed word (`helpers/usePersistentReadingAnchor.ts:62` in each mode), and by the handover (`ModeState.ts`: Flow `:52`, Focus `:49`, Narrate `:51`).
    - Mode entry calls `syncVisualToPersistentWord` (Flow `ModeRuntime.ts:684`, Focus `:510`, Narrate `:271`). That rewrites the soft, highlight and resume fields to the canonical word (`usePersistentReadingAnchor.ts:107-110`).
  - **Path 2, the relocate save: it reads no span.**
    - Flow `onRelocate` (`flow/ModeRuntime.ts:1042-1079`), Focus (`focus/ModeRuntime.ts:863-904`) and Narrate (`narrate/ModeRuntime.ts:527-546`) save `resolveCanonicalWordAnchor({ resumeAnchor, highlightedWordIndex, softWordIndex, … })` (Flow `:1071-1078`, Focus `:895-903`, Narrate `:539-545`). The order of preference is `helpers/startWordIndex.ts:36-67`.
    - The view's relocate detail is `{ cfi, fraction }` only (Flow `FoliateView.tsx:284`; Focus `:260`; Narrate `:281`). There is no `reportFirstWordOnPage` equivalent: Page's is in Page's view only.
    - So a relocate save carries a span index only at second hand, through a word that a span-derived start committed or highlighted. Fixing the start fixes it.
    - Making the relocate save cfi-only in a held document would discard canonical engine words. That contradicts Brain1's rule that canonical-table indices are never held, and BTO's row (o6). It would also need a port change (Q1).
  - **Path 3, Play from the first visible word.** It is the only span read on a start path. The view's `findFirstVisibleWordIndex` returns the first visible span's `data-word-index`:
    - Flow `FoliateView.tsx:1234-1260` (indexed path `:1235-1236`; fallback walk `:1240-1258`, converted with `resolveRenderedWordIndexToGlobal` at `:1253`);
    - Focus `:1127-1153` (`:1146`);
    - Narrate `:1129-1155` (`:1148`).

    Each mode reaches it through its surface (Flow `surface.ts:30`, `:58`; Focus `:28`, `:55`; Narrate `:31`, `:55`) at two sites in `start()`:
    - **The `resolveFoliateStartWord` callback:** Flow `ModeRuntime.ts:739-744` (callback `:742`), Focus `:564-569` (`:567`), Narrate `:323-325` (`:324`). `resolveFoliateStartWord` (`helpers/startWordIndex.ts:103-125`, blob `159f29c5` in all three) calls it only when the start anchor is at or past `max(effectiveWords.length, bookWords.totalWords)` (`:113-117`).
    - **The explicit fallback block:** Flow `:746-750`, Focus `:571-575`, Narrate `:326-330`. Narrate's sentence rewind follows it at `:332`. The block is entered only when `startWord >= effectiveWords.length` and not `startWord < bookWords.totalWords`.
  - **When it is reachable in a held section.** A held document needs the map, because BTO defines "uncertified" as needing non-empty `sections`.
    - With the map, `effectiveWords()` is `bookWords.words` (Flow `:1559-1566`, Focus `:1167-1174`, Narrate `:876-883`). So the explicit block is not reachable, and the callback runs only when the start anchor is at or past `bookWords.totalWords`.
    - That happens when the stored position lies past the map's last word. A cold open builds its handover with `total = doc.bookWords?.totalWords || doc.wordCount` (`src/reader/useReaderModeOrchestrator.ts:339`). The map is never present at a cold open (CFI-POSITION-CONSISTENCY-1, Why), so the clamp uses the library's word count (`ReaderDocumentSnapshot.ts:152-167`).
    - A library word count larger than the extractor's total, or a position saved under an older extraction, passes through. A mode entered before the map arrives keeps that anchor, because `syncVisualToPersistentWord` clamps with `totalWordCount()`, which is the library count until the map exists (Flow `:1554-1556`).
    - It is rare, and nothing there is worse than today, as Brain1's Q2 says. It is still reachable, so it is guarded.
  - **Why the span index is wrong there.** In an uncertified section, BTO keeps today's `contentAlignWords` stamping. Its spans carry numbers in the canonical range on possibly the wrong source text (BTO, Why; LL-170). An in-range index is not a certificate.
- **Design decision:** technical. Brain1 confirms the scope (Q1) and the target (Q2), and the owner rules where Play visibly starts (U1).
  - **One choke point per mode.** Each runtime gets a private `firstVisibleStartWord()`. Both first-visible reads in `start()` go through it, including the block that the map makes unreachable, so no span read on a start path bypasses the hold.
  - **The canonical start** is the book word map's `startWordIdx` for the held section, from `bookWords.sections`:
    - if that section has no slice, which BTO reports as `no-canonical-slice`, use the first later section with words. That is PLAY-FIRST-TEXT-1's rule, as `startAtFirstText` applies it (Flow `:1490`);
    - with neither, keep the committed canonical word and do not move: `this.state.canonicalWordIndex`, clamped to the map's last word (`bookWords.totalWords - 1`). It is never word 0, because jumping to the book's first word from a late chapter would surprise the reader (Brain1 Q2 ruling).

    No cfi-to-word map exists, so a finer target would be new design. This item invents none.
  - **The view reports, and the runtime decides.**
    - The view knows the held set (`uncertifiedDocsRef`, per BTO Wave B steps 6–8). It reports the held section of the first visible word through a new, optional view API member.
    - The runtime owns the map and picks the word.
    - `findFirstVisibleWordIndex` keeps its meaning. A function named "first visible" never returns a section start, which is Brain1's Q3 objection to overloading a call by convention.
  - **Fake views degrade to today.** The surface calls the new member with optional chaining. Fake view APIs in existing tests lack it (`tests/readerModes/harness/zeroWordBook.ts:64`, `harness/fixtureReplay.tsx:132`), so they report "not held" and behave exactly as on base (standing rule 50).
  - **Saves are unchanged.** This item adds no save and changes none.
    - A cfi-only save keeps today's shape: Flow's and Focus's `onHeldWordClick`, per BTO Wave B steps 6–7, sends `updateDocProgress(docId, -1, cfi)`.
    - Main treats it as cfi-only (`main/ipc/documents.js:22-24` at `14ce3d24`). `hasPosition` is false for -1, so the position is kept, `if (cfi) doc.cfi = cfi` sets the cfi, and no progress is queued for sync (`:31`).
    - Under CFI-POSITION-CONSISTENCY-1's contract (Seq 97.5, after this item), `undefined` keeps the stored cfi, `null` clears it unless the position is unchanged, a string sets it, and position -1 ignores `null`. A cfi-only save with a string cfi therefore behaves the same before and after that item.
  - **Mode isolation.** Three copies, written separately: no sibling import, no shared helper, no shared mutable store, and no shared-core edit.
- **The change.** Lines are at `14ce3d24`. BTO moves the four views and the Flow and Focus runtimes, so re-grep every cited line on BTO's merge (Done-when 0; standing rule 36). BTO symbols are named by the BTO step that adds them.
  1. **Each view, the same shape** (`src/reader/modes/{flow,focus,narrate}/FoliateView.tsx`):
     - **One private reader of the first visible span.** Lift the body of `findFirstVisibleWordIndex` (Flow `:1234-1260`, Focus `:1127-1153`, Narrate `:1129-1155`) into a private `firstVisibleSpan(record: boolean): { wordIndex: number; doc: Document; sectionIndex: number | null } | null`:
       - **Indexed path:** take `idx = wordPositionIndexRef.current.findFirstVisibleWordIndex()`. When `idx >= 0`, use `entry = wordPositionIndexRef.current.get(idx)` (`helpers/wordPositionIndex.ts:121-123`; the entry carries `doc` and `sectionIndex`, `:12-18`). Return `{ wordIndex: idx, doc: entry.doc, sectionIndex: entry.sectionIndex }`.
       - **Fallback walk:** unchanged. It returns `{ wordIndex: resolveRenderedWordIndexToGlobal(…), doc: d, sectionIndex: index }`.
       - **Diagnostic:** `recordDiagnosticRef.current("word-position-index-miss", …)` (Flow `:1239`) is recorded only when `record` is true.
     - **`findFirstVisibleWordIndex`** becomes `() => firstVisibleSpan(true)?.wordIndex ?? -1`. Its value and its diagnostic are unchanged for every input.
     - **New API member `getHeldFirstVisibleSection?: () => { sectionIndex: number | null } | null`.**
       - Declare it on the view API interface beside `findFirstVisibleWordIndex`: Flow `:261`, Focus `:242`, Narrate `:260`.
       - Implement it as `() => { const span = firstVisibleSpan(false); return span && uncertifiedDocsRef.current.has(span.doc) ? { sectionIndex: span.sectionIndex } : null; }`. `uncertifiedDocsRef` comes from BTO Wave B step 6 (Flow), step 7 (Focus) and step 8 (Narrate).
       - It reads the set when it is called. A certified restamp has already removed the document, and a superseded wrap's report was never applied (BTO Wave B step 4; LL-169).
       - It records no diagnostic.
  2. **Each surface** (`src/reader/modes/{flow,focus,narrate}/surface.ts`):
     - add `getHeldFirstVisibleSection(): { sectionIndex: number | null } | null` to the interface, beside `findFirstVisibleWordIndex` (Flow `:30`, Focus `:28`, Narrate `:31`);
     - implement it as `() => api()?.getHeldFirstVisibleSection?.() ?? null`, beside `:58`, `:55` and `:55`.
  3. **Each runtime** (`src/reader/modes/{flow,focus,narrate}/ModeRuntime.ts`):
     - **A private `firstVisibleStartWord(): number`:**
       ```ts
       // UNCERTIFIED-ANCHOR-HOLD-1 (Brain1 Q2 on BTO Wave B; owner OQ4, U1): a span in an uncertified section is
       // not trusted, so a first-visible start uses the book word map's word for that section (LL-170).
       const held = this.surface.getHeldFirstVisibleSection();
       if (held == null) return this.surface.findFirstVisibleWordIndex();
       const sections = this.document.bookWords?.sections ?? [];
       const own = held.sectionIndex == null ? undefined : sections.find((s) => s.sectionIndex === held.sectionIndex);
       const later = own ?? (held.sectionIndex == null ? undefined : sections.find((s) => s.sectionIndex > held.sectionIndex!));
       const total = this.document.bookWords?.totalWords ?? 0;
       const word = later ? later.startWordIdx : Math.max(0, Math.min(this.state.canonicalWordIndex, total - 1));
       this.ports.diagnostics.record("uncertified-anchor-hold", `first visible word in section ${held.sectionIndex} is held: start ${word}`);
       return word;
       ```
       The `sections.find(... > held)` mirrors `startAtFirstText` (Flow `:1490`, Focus `:1087`, Narrate `:788`, to be re-grepped). It is written in each file, with no import.
     - **Replace both reads in `start()`** with `this.firstVisibleStartWord()`:
       - Flow: the callback at `:742` becomes `() => this.firstVisibleStartWord()`, and `:748` becomes `const firstVisible = this.firstVisibleStartWord();`.
       - Focus: `:567` and `:573` in the same way.
       - Narrate: `:324` and `:328` in the same way.
     - Nothing else in `start()` changes: `consumeModeStartAnchor`, `publishHighlight`, `jumpDisplayToWord`, Narrate's `sentenceStartAt` (`:332`), Focus's delayed `startEngine`, and Flow's `startEngine`.
  4. **Unchanged:**
     - `onRelocate` and every save;
     - `startAtFirstText` and `pendingFirstText`;
     - Narrate's arrival sync (`settleArrivalSync`, `narrate/ModeRuntime.ts:850-863`, from NARRATE-ARRIVAL-SYNC-1 in `14ce3d24`). It reads the canonical word through `getSectionForWordIndex` and never reads a span;
     - `helpers/startWordIndex.ts`, `helpers/wordPositionIndex.ts` and the anchor helpers;
     - BTO's `onCertification` wiring (BTO Wave A step 3, Wave B step 4) and `onHeldWordClick` (BTO Wave B steps 6–7);
     - `useModeBindings.ts`. The view API travels through `viewApiRef`, not through props;
     - Page, `ReaderContainer.tsx`, `src/types.ts`, both `FlowScrollEngine.ts`, `preload.js` and `main/`.
- **Interplay:**
  - **CFI-POSITION-CONSISTENCY-1 (Seq 97.5, after this item).** No dependency in either direction. This item makes no save, so the cfi contract does not reach it. CPC-1 Wave C edits the same three `ModeRuntime.ts` files (`exportHandoff`, and Focus's saves). It lands second and re-greps.
    - After a held start, the engine advances on `bookWords.words`, so the `canonicalWordIndex` that CPC-1's O6 hands to Page is a canonical index.
  - **Owner O3 (Narrate restarts at the saved word's sentence start).** Unchanged. `sentenceStartAt` (`narrate/ModeRuntime.ts:332`) runs on the canonical word. A section's first word follows a canonical section end in `chunkBreaks`, so the start stays on it.
  - **NARRATE-ARRIVAL-SYNC-1 (merged in `14ce3d24`).**
    - With a stale anchor past the map, `getSectionForWordIndex` finds no section, so the sync stays owed and moves nothing (`:855-856`).
    - Play then clears it (`clearArrivalSync("start")`, `:319`) and reaches the held start.
    - Row (u6) pins this, and NAS-1's rows run unedited.
  - **FLOW- and NARRATE-SAVE-AS-YOU-GO-1.** Their "book index space only" rule (Q3) holds. A held start still starts the engine on the map's words.
  - **Mode isolation.** Each mode's edit stays inside its own folder. No shared-core need was found. If BTO's merged shape needs one, that is a STOP (Done-when 0).
- **Prerequisites:**
  - **BLOCK-TEXT-ORDER-1 merged** (Seq 87.5), with `uncertifiedDocsRef: WeakSet<Document>` in the Flow, Focus and Narrate views, written only from their own wraps' `onCertification` (BTO Wave B steps 4, 6, 7 and 8).
  - Blurby.Brain1 Q1–Q3 and owner question U1 answered.
- **Execution host:**
  - RodneySr (x64), clone `C:\Users\estra\Projects\Blurby`, for the implementation, the tests, `npm test`/`typecheck`/`build` and the `--dir --x64` package pair.
  - Rodney (arm64) only for the rule 53 native-arm64 25 s launch.
  - **Host prerequisites:** `npm ci`; `node node_modules/electron/install.js` succeeds; a free scratch profile root. Verify these before launch (rule 6b).
- **Branch:** `eb/uncertified-anchor-hold-1` at `C:\Users\estra\Projects\Blurby\.worktrees\uncertified-anchor-hold-1` on RodneySr. Cut it after BTO merges, with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/uncertified-anchor-hold-1 .worktrees/uncertified-anchor-hold-1 origin/main`. Push with `git push origin HEAD:refs/heads/eb/uncertified-anchor-hold-1` (LL-181).

##### Done when

PowerShell 7, run from the worktree root. A gate passes only on its stated exit code. `<base>` is the `origin/main` sha at the cut, which contains BTO's merge.

0. **Re-grep on BTO's merge (standing rule 36), before any edit.** Record each output in the memo.

   ```
   git grep -n -E "uncertifiedDocsRef|wrapGenerationRef|onCertification|onHeldWordClick" -- src/reader/modes/flow src/reader/modes/focus src/reader/modes/narrate
   git grep -n -E "findFirstVisibleWordIndex|getDisplayedSectionIndex|const liveSections|wordPositionIndexRef = " -- src/reader/modes/flow src/reader/modes/focus src/reader/modes/narrate
   git grep -n -E "resolveFoliateStartWord\(|const firstVisible = |sentenceStartAt\(|private startAtFirstText|private effectiveWords|private totalWordCount|scheduleRelocateSave\(|private settleArrivalSync" -- src/reader/modes/flow/ModeRuntime.ts src/reader/modes/focus/ModeRuntime.ts src/reader/modes/narrate/ModeRuntime.ts
   git grep -n "soft-visible" -- src
   git grep -n -E "hasPosition|if \(cfi\) doc\.cfi" -- main/ipc/documents.js
   ```

   **STOP to Blurby.Brain1** with the output if BTO's merged shape differs from the spec in any of these ways:
   - any of the three views lacks `uncertifiedDocsRef` as a `WeakSet<Document>`;
   - the set is written outside its wraps' `onCertification` closures;
   - the latest-report and superseded-wrap rule is missing (BTO Wave B step 4);
   - a soft or relocate save now reads a span;
   - the first-visible reads in `start()` are no longer exactly the two sites per mode named above.
1. **Red first, per mode (standing rule 43).** For each mode in the order Flow, Focus, Narrate, commit its test file alone, before that mode's source commit. Every row uses a deterministic harness, as in `tests/readerModes`.
   - **Runtime rows** (`u`) follow the `tests/readerModes/flowPlayFirstText.test.ts` pattern: `createFakeInfrastructure`, `createReaderPorts`, `create<Mode>Runtime`, and a fake view API on `runtime.viewApiRef`.
     - Narrate's runtime rows add `FakeProducer` and `FakeAudioOutput` from `tests/narrate/harness/`, as in `tests/narrate/narrate.playSavedPosition.test.ts`.
     - The fake view is built in the test file from the `zeroWordBook` shape, plus `getHeldFirstVisibleSection`. The shared harness file is not edited.
   - **View rows** (`v`) mount the real `FoliateView`, with `foliate-js/view.js` mocked, by BTO's harness for that mode's hold rows: `tests/readerModes/blockTextOrderHold.<mode>.test.tsx`.

   The files are:
   - `tests/readerModes/uncertifiedAnchorHold.flow.test.tsx`
   - `tests/readerModes/uncertifiedAnchorHold.focus.test.tsx`
   - `tests/readerModes/uncertifiedAnchorHold.narrate.test.tsx`

   **Fixture.** A document with `wordCount: 30` and `position: 25`, with `bookWords` = `zeroWordBook`'s `BOOK` (`totalWords: 20`; section 1 holds words 0–9 and section 3 holds 10–19). The handover is `createInitialHandoff(document, 30)`, so the anchor is 25, past the map. The view shows section 3, and the fake view's `findFirstVisibleWordIndex()` returns 13, a mid-section span.
   - **Narrate only:** word 12 of the fixture's words is `"s3w2."`, so word 13 starts a sentence. That keeps base's start at 13 after the sentence rewind. With `BOOK`'s words, base would also land on 10, and the row would not be red.

   Rows, in each file:
   - **(u1) held start, canonical word.** `getHeldFirstVisibleSection()` returns `{ sectionIndex: 3 }`. Play starts at word 10, not 13.
     - Flow: the first `highlightWordByIndex` call with `allowMotion: true` is for 10, and the engine word (`exportHandoff("capture-current").highlightedWordIndex`) is 10.
     - Focus: after `FOCUS_MODE_START_DELAY_MS`, the engine's first word is 10.
     - Narrate: the first word that `FakeProducer.generate` is asked for is 10.
     - One `uncertified-anchor-hold` diagnostic is recorded. Red on base (starts at 13).
   - **(u2) certified control.** `getHeldFirstVisibleSection()` returns `null`. Play starts at 13 (Narrate: 13, the sentence start), and no `uncertified-anchor-hold` diagnostic is recorded. Green on base and tip.
   - **(u3) held section with no canonical slice.** `getHeldFirstVisibleSection()` returns `{ sectionIndex: 2 }` (absent from the map, which is non-empty), and the view shows section 3. Play starts at 10, the first later section with words (Q2). Red on base.
   - **(u4) fake view without the member.** The fake API has no `getHeldFirstVisibleSection`. Play starts at 13, exactly as base. Green on base and tip; this guards standing rule 50 for the existing fakes.
   - **(u5) relocate saves are untouched (pin; Q1).** In a held document, after Play and once the resume anchor is consumed, drive `onRelocate({ cfi, fraction })`.
     - `scheduleRelocateSave` receives `{ wordIndex: <the engine's current canonical word>, cfi }`, and nothing makes a cfi-only save.
     - Narrate's row is BTO's (o6) shape.
     - Green on base and tip.
   - **(u6) Narrate only, arrival sync.** Arrive from Page (`arrival: "select"`, handover `source` Page) before the map exists. The map arrives (`adoptDocument`) with the stale anchor 25, so the arrival sync stays owed and makes no `goTo`. Then Play with the first visible word held in section 3.
     - The start is 10.
     - `arrivalSync:cleared` is recorded with `start`.
     - The engine starts exactly once.

     Red on base, from the start word.
   - **(v1) the view reports the held section.** In an uncertified document (BTO's (c2) body, after the map has arrived):
     - `getHeldFirstVisibleSection()` returns that document's section index;
     - `findFirstVisibleWordIndex()` returns the same value as on base;
     - calling `getHeldFirstVisibleSection()` adds no `word-position-index-miss` diagnostic.

     Red on base: "not a function", which is the recorded reason.
   - **(v2) certified control in the view.** A certified document returns `null`. Red on base for the same reason, which is recorded.
   - **(v3) a certifying restamp lifts it** (BTO's (o3) path). `getHeldFirstVisibleSection()` returns `null` after the restamp. Red on base for the same reason, which is recorded.

   Run `npx vitest run tests/readerModes/uncertifiedAnchorHold.<mode>.test.tsx` on each red commit. It exits 1, with exactly these reds:
   - Flow and Focus: (u1), (u3), (v1), (v2), (v3);
   - Narrate: (u1), (u3), (u6), (v1), (v2), (v3).

   (u2), (u4) and (u5) pass. Save the output in the memo. A row whose base status differs is a STOP to Blurby.Brain1 before that mode's source edit.
2. **One source commit per mode**, each right after its red commit:
   - Flow: `flow/FoliateView.tsx`, `flow/surface.ts`, `flow/ModeRuntime.ts`;
   - Focus: the same three files in `focus/`;
   - Narrate: the same three files in `narrate/`.

   A commit touches no other mode's folder. After each one, that mode's command from step 1 exits 0.
3. **Inherited rows, unedited (standing rule 50).** This command exits 0:

   `npx vitest run tests/readerModes/blockTextOrderHold.flow.test.tsx tests/readerModes/blockTextOrderHold.focus.test.tsx tests/readerModes/blockTextOrderHold.narrate.test.tsx tests/readerModes/flowPlayFirstText.test.ts tests/readerModes/focusPlayFirstText.test.ts tests/narrate/narrate.playFirstText.test.ts tests/narrate/narrate.playSavedPosition.test.ts tests/readerModes/flow.arrivalSavedPosition.test.ts tests/readerModes/focus.arrivalSavedPosition.test.ts tests/readerModes/arrivalCursor.test.ts tests/startWordIndex.test.ts tests/wordPositionIndex.test.ts tests/tts7k-global-word-source.test.ts tests/readerModes/flow.behavior.test.tsx tests/readerModes/focus.behavior.test.tsx tests/readerModeIsolation.test.ts tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts`

   `git diff --exit-code <base> -- <every path in that command>` also exits 0.
4. **Suite.** `npm test` exits 0, with 0 failures and at least the base count. `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rules 47 and 48). Record the counts.
5. **Isolation and shared core.**
   - `git grep -nE "modes/(page|focus|flow|narrate)/" -- "src/reader/modes/flow/*.ts*" "src/reader/modes/focus/*.ts*" "src/reader/modes/narrate/*.ts*"` prints no line that names another mode's folder. Dry-run it on `<base>` and on one wrong variant first (LL-143).
   - `git diff --exit-code <base> -- src/components/ReaderContainer.tsx src/types.ts src/utils/FlowScrollEngine.ts src/reader/modes/flow/helpers src/reader/modes/focus/helpers src/reader/modes/narrate/helpers src/reader/modes/page preload.js main` exits 0.
6. **Standing rule 53 package pair, on RodneySr:**
   - `--dir --x64` packages of the tip with `origin/main` merged in, and of `origin/main`, with one recipe (LL-152);
   - a 25 s scratch-profile launch of each, with no error or crash. The profile is proved before the first input (LL-165), with APPDATA and LOCALAPPDATA redirected;
   - `npx asar list` on the tip package shows the three modes' `FoliateView`, `surface` and `ModeRuntime` in the renderer bundle, and an `asar extract-file` of the renderer bundle, run in the scratchpad, contains `getHeldFirstVisibleSection` and `uncertified-anchor-hold`;
   - a "Package verification" section in the close-out.
7. **Native arm64 launch on Rodney** at the merge go: a 25 s scratch-profile launch of the `--dir --arm64` package, with no error or crash. Blurby.Brain1 confirms the package before the merge go.
8. **No packaged probe (standing rule 55).** Reaching the path in the app needs two things at once:
   - a section BTO cannot certify. No shipped fixture has one: BTO's B5 checker certifies every section of `resources/sample-meditations.epub`;
   - a saved word past the map's last word, which needs a seeded library word count larger than the extractor's total.

   Building that crafted EPUB and seeded library is a new harness for a rare edge. The verdict comes from the state the rows read (start word, engine word, generated word, save arguments), not from screenshots.
9. **Fence (standing rule 41).** `git diff --name-status <base>..HEAD` lists exactly the following, plus `docs/governance/close-outs/Memo.UNCERTIFIED-ANCHOR-HOLD-1.<date>.md` and the time log:
   - `M src/reader/modes/flow/FoliateView.tsx`
   - `M src/reader/modes/flow/surface.ts`
   - `M src/reader/modes/flow/ModeRuntime.ts`
   - `M src/reader/modes/focus/FoliateView.tsx`
   - `M src/reader/modes/focus/surface.ts`
   - `M src/reader/modes/focus/ModeRuntime.ts`
   - `M src/reader/modes/narrate/FoliateView.tsx`
   - `M src/reader/modes/narrate/surface.ts`
   - `M src/reader/modes/narrate/ModeRuntime.ts`
   - `A tests/readerModes/uncertifiedAnchorHold.flow.test.tsx`
   - `A tests/readerModes/uncertifiedAnchorHold.focus.test.tsx`
   - `A tests/readerModes/uncertifiedAnchorHold.narrate.test.tsx`

   **Conditional, recorded in the memo:** `M docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`, only if step 3's `readerModeBoundaries` or `readerModeOwnership` row fails mechanically on the new surface member. Record the failure first.

   Any other path is a fence failure. `git log --oneline <base>..HEAD` shows six commits (red and source for each mode, in Flow, Focus, Narrate order) plus the memo commit.
10. **Owner check.** U1's item ("Play in a chapter Blurby couldn't verify starts at the chapter's first word") is added to release gate (2)'s list. No separate smoke run is offered.

- **Effort:** M on the register. This trace supports S: three small, parallel edits and one test file per mode. Blurby.Roadmap re-sizes it at the next review. Technical effort: medium.
- **Owners:**
  - Blurby.Brain1 coordinates, rules Q1–Q3, takes the STOPs and confirms the rule 53 package;
  - RodneySr implements (bounded, one mode per commit pair);
  - spec-compliance review, then quality review;
  - Blurby.Roadmap gives the merge go and closes it out.
- **Merge order:**
  - Directly after BLOCK-TEXT-ORDER-1 (Q2), inside each mode's ownership window.
    - The Flow and Narrate commits follow BTO with no other item between.
    - The Focus commit is sequenced by the planner against the Focus window (FOCUS-WORD-ONLY-1, FOCUS-PAUSED-HANDOFF-1 Wave B, CPC-1 Wave C).
  - FLOW-RESTAMP-CURRENT-1 and NARRATE-RESTAMP-CURRENT-1 edit the same views' restamp effects, and CFI-POSITION-CONSISTENCY-1 Wave C, FLOW-SAVE-AS-YOU-GO-1 and NARRATE-SAVE-AS-YOU-GO-1 edit the same runtimes. Whichever lands second re-greps (standing rule 36).
  - No automatic merge: the merge waits for Blurby.Roadmap's go, after Brain1's rule 53 confirmation.
- **Path:** dispatch (one wave, about 35 tool uses).

##### Implementation detail

- **Lane ownership:** Reader Engine. Execution surface A (the three views and runtimes).
- **Forbidden during parallel run:**
  - shared core;
  - Page;
  - each mode's `helpers/`;
  - `useModeBindings.ts`;
  - `src/utils/`, `preload.js` and `main/`;
  - any other item editing the three views, surfaces or runtimes.
- **Shared-core touches:** none.
- **Staging plan:** only the step 9 paths, staged by name, one mode per commit pair.
- **Failure handling:**
  - Done-when 0 differs: STOP to Blurby.Brain1.
  - A step 1 base status differs: STOP before that mode's source edit.
  - The live profile hash changes: STOP (LL-165).
  - Each failing gate gets at most one retry, and only for a harness fault.

##### Blurby.Brain1 rulings on Q1–Q3 (2026-11-03, binding)
Source: `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.UNCERTIFIED-ANCHOR-HOLD-1.and-D4.2026-11-03.md`.
- **Q1: yes.** The scope is Play from the first visible word only, at the six sites (Flow `:742/:748`, Focus `:567/:573`, Narrate `:324/:328`). Relocate saves stay unchanged, because they already save the committed word.
- **Q2: yes, with one change to the last fallback.** The order is:
  1. the map's first word of the held section;
  2. otherwise the first later section with words;
  3. otherwise keep the committed canonical word (no move), never 0.

  Design step 3 is updated. The planner clamps that word to the map's last word, because this path is reached exactly when the start anchor lies past it. This is the technical default under owner question U1; if the owner answers U1 differently, the shape follows the owner.
- **Q3: a finding** (Findings F-025), as recommended.
- **Root cause (CLAUDE.md rule 6c).** This item is a stated safety net, not the cause fix. A section fails certification because Blurby numbers words twice: main's extractor and the page's span stamping. Their known divergences are fixed by:
  - BLOCK-TEXT-ORDER-1: nested-block order, and footnote acceptance D1 and D2;
  - WORD-INDEX-UNIFY-1: segmentation;
  - XHTML-PARSE-MEASURE-1, registered 2026-11-03 for D4 parser divergence (Brain1: measure first).

  This item's start path is reached only when the stored position lies past the map's end, a library-count versus extractor-total mismatch that WORD-INDEX-UNIFY-1 owns.

##### Questions for Blurby.Brain1 (ruled 2026-11-03; kept as the record)

- **Q1. Narrow the scope to the start path.**
  - At `14ce3d24`, Flow, Focus and Narrate have no soft anchor save (`soft-visible` is never dispatched), and their relocate saves write the committed anchor, not a span's index (Why, paths 1 and 2). The only span read is Play's first-visible fallback.
  - Confirm that the item covers that path only, with relocate saves unchanged and pinned by (u5).
  - **The alternative** is to make relocate saves cfi-only whenever the shown document is held. That would discard canonical engine words, against your rule that canonical-table indices are never held and against BTO's (o6). It would also need either a port change or a bypass:
    - `scheduleRelocateSave({ wordIndex: number, … })` (`src/reader/ports/ReaderPorts.ts:29`) is bridged in `ReaderContainer.tsx`, which is shared core;
    - BTO's `updateDocProgress(-1, cfi)` shape skips the shell's high-water marks.
  - **Recommendation: confirm.**
- **Q2. The canonical start word.** The order is:
  1. the held section's `startWordIdx` from `bookWords.sections`;
  2. if that section has no slice, the first later section with words (PLAY-FIRST-TEXT-1's rule);
  3. otherwise -1, which is today's last resort, word 0. *(Ruled: keep the committed canonical word instead; see the rulings above.)*

  No cfi-to-word mapping exists, so anything finer, such as counting words up to the visible span, would be new design and would repeat the certifier's failed job. **Recommendation: confirm.** The owner rules the visible part (U1).
- **Q3. Paragraph starts in held documents are a finding, not this item.**
  - Flow's and Focus's paragraph starts come from book-stamped documents' spans (Flow `FoliateView.tsx:1225`, Focus `:1115`). Under BTO a held document stays book-stamped.
  - Their indices drive the paragraph keys, which set the explicit start anchor (`flow/ModeRuntime.ts:1012-1035`; Focus `:840`), and the engine's paragraph pauses (Flow `:1003`, Focus `:824`). So span-derived indices can reach a start in a held section.
  - It is not a first-visible path, and excluding held documents would remove that section's paragraph pauses, which the owner would notice (as in TQ-D1).
  - **Recommendation:** keep it out of this item. Blurby.Roadmap records it in `docs/governance/Findings.md` for WORD-INDEX-UNIFY-1, or for its own Reader Engine item per mode.

##### Questions for the owner

- **U1. Where Play starts in a chapter Blurby couldn't verify.** Rarely, Blurby can't verify which word is which in a chapter. In that chapter, if your saved place can't be used, Play would start at the chapter's first word rather than the first word on your page. That can be a few pages earlier.
  - It only happens when both are true: the chapter is one Blurby couldn't verify, and your saved place lies past the end of the book's word list.
  - **The alternative** is to start where it starts today, at the page's first word as Blurby numbered it, which may be the wrong word.
  - **Recommendation: the chapter's first word.** It is never a wrong word, it matches your OQ4 choice of "instead of risking a wrong word", and the case is rare.

##### Findings for Blurby.Roadmap (not changed here)

- **Focus's relocate highlight is a fraction estimate.** With no resume anchor, `onRelocate` publishes `approxWordIdx = floor(fraction × wordCount)` (`focus/ModeRuntime.ts:868`, `:877`). Its relocate save then writes `resolveCanonicalWordAnchor(…)` (`:895-903`), whose order puts `focusWordIndex` (`s.displayWordIndex`) before the highlight. The estimate is not a span read and does not depend on certification. Record whether a passive relocate can save it.
- **Unused `soft-visible` event.** It is declared in the three modes' `helpers/persistentReadingAnchor.ts` and never dispatched. That is a dead-code candidate for a later sweep.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Done-when 0 re-grep on BLOCK-TEXT-ORDER-1's merge, with each output in the memo | calculable | verify | bounded | low | 10m | — | — |
| 2 | Flow holds its unverified first-visible-word saves and start, red first | calculable | implementation | bounded | medium | 30m | — | A |
| 3 | Focus holds its unverified first-visible-word saves and start, red first | calculable | implementation | bounded | medium | 30m | — | A |
| 4 | Narrate holds its unverified first-visible-word saves and start, red first | calculable | implementation | bounded | medium | 30m | — | A |
| 5 | Suite, typecheck, inherited rows and the package pair with Blurby.Brain1's confirmation | calculable | verify | bounded | medium | 40m | — | — |
| 6 | Memo, time log and push | calculable | docs | bounded | low | 10m | — | — |

**Total:** chain 9m · sum 15m; 6 of 6 estimated tasks calibrated

##### Lessons applied

- **LL-170:** an in-range index, a count or `bookStamped` is not a certificate. A held span's index never reaches a start.
- **LL-028, LL-071, LL-081:** the book's word map is the only numbering authority. The canonical start is the map's `startWordIdx`, and no word is numbered from the DOM.
- **LL-142:** Narrate's engine cursor and its saves stay on the exact word table. The hold never touches them (u5; Brain1's OQ4 shape).
- **LL-030:** engagement gating is unchanged. This item adds no save.
- **LL-029, LL-169:** the hold is read when it is used, from the view's current set. Superseded wraps' reports are already discarded by BTO's generation rule.
- **LL-174:** the new view member is carried through every hop: the view API, the surface and the runtime.
- **LL-143:** every row and gate is dry-run against the base, with controls (u2), (u4) and (u5) and one wrong variant for the isolation gate.
- **LL-152:** one package recipe on the base and the tip.
- **LL-165:** the scratch profile is proved before the first input.
- **LL-181:** worktree placement and the push refspec.
- **Standing rule 36:** every cited line is re-grepped on BTO's merge (Done-when 0).
- **Standing rule 41:** the exact fence.
- **Standing rule 43:** a red-first commit per mode.
- **Standing rule 50:** inherited rows run unedited (Done-when 3), and the existing fakes keep base behaviour (u4).
- **Standing rule 53:** the package pair, asar check, arm64 launch and Brain1's confirmation.
- **Standing rule 55:** verdicts come from state, and the packaged probe is not drivable (Done-when 8).
