#### BLOCK-TEXT-ORDER-1 — Keep block text in DOM order in every reading mode *(Seq 87.5; Full Spec 2026-11-03, cited against `origin/main` `c5bb507f`; Reader Engine; contracts G-A to G-D frozen, owner answers OQ1–OQ6 and Blurby.Brain1 rulings TQ-A1 to TQ-D1 and OQ4 applied; two waves; build-and-hold; four open questions for Blurby.Brain1 listed at the end, which must be ruled before Wave B is dispatched)*

- **What:** text inside nested blocks reads in true document order in Page, Focus, Flow and Narrate. Today, text that comes after a nested block is read before that block. Word spans are also stamped only where the renderer's text provably matches main's word list (a "certified" section). Where it doesn't match, clicks and saves fall back to the cfi only, instead of risking the wrong word.
  - **Wave A** (tests red, then the certifier): ordered runs (G-D), one shared acceptance rule (G-A), and the fail-closed certifier with its certified stamping branch (G-B). The edits are in the four helper copies, the four wrapper copies and one dormant main helper. No view or runtime edits.
  - **Wave B** (the OQ4 hold): per-mode hold of clicks and saves in uncertified sections (G-C as widened by OQ4), the Electron ICU checker (TQ-B2), the full gates, and the standing rule 53 package pair.
  - **Out of scope:**
    - main's word numbering and footnote cues. `extractWords`, `extractBlockPlans`, `extractBlockTexts`, `isLikelyFootnoteRef`, `isFootnoteBodyNode` and `buildFootnoteTargetTextMap` stay byte-unchanged. The new main helper stays dormant until WORD-INDEX-UNIFY-1.
    - fallback footnote handling before the book's words arrive (owner OQ1: keep today);
    - an internal extractor failure that looks like an empty book (owner OQ3: keep today; filed as BUG-239, "an extractor failure gives an empty book in Flow, Focus and Narrate");
    - `onWordsReextracted` timing (Blurby.Brain1 TQ-D1: no);
    - restamp currency in Flow and Narrate. That goes to its own items, FLOW-RESTAMP-CURRENT-1 and NARRATE-RESTAMP-CURRENT-1 (TQ-B3, second half);
    - parser divergence D4 itself (WORD). This item only proves that it fails closed (TQ-A1);
    - reading footnotes aloud (FOOTNOTE-INLINE-READ-1);
    - `src/utils/foliateHelpers.ts` and `src/utils/foliateWordWrapping.ts` (legacy, not live in any mode);
    - shared core.
  - **Outcome:**
    - `<div>Intro <blockquote>Quoted.</blockquote> and the continuation.</div>` reads "Intro", "Quoted.", "and the continuation." in every mode, with no extra pause before "and" (OQ5).
    - Before the book's words arrive, Narrate speaks that order, and "Play from the first visible word" starts on the true first word (OQ6).
    - A section whose spans cannot be certified saves the cfi only (Page, Flow, Focus) or ignores the click (Narrate). It never saves a wrong word (OQ4).
- **Why:**
  - **The bug.** Each mode's `collectBlockTextNodes` groups text nodes by their nearest block element and emits the groups in first-encounter order. For `<div>before <p>inside</p> after</div>` the groups are `div: "before  after"` and then `p: "inside"`. So the fallback words, their numbering, the paragraph flags and Narrate's pre-arrival speech all come out as "before after inside". Sources:
    - flow/focus/narrate `helpers/foliateHelpers.ts:86-122`; Page `:107-143`;
    - the 2026-10-27 trace (`docs/planning/roadmap-reviews/2026-10-27-group-source-trace.md`);
    - the issue `docs/governance/bug-reports/Issue.BLOCK-TEXT-ORDER-1.2026-10-27.md`.
  - **Canonical stamping can also land on the wrong source text.** `contentAlignWords` (`helpers/foliateWordWrapping.ts:19-66`) uses `indexOf` within each group. With `MAX_PEEK_AHEAD = 8` (`:13`, `:49-61`), it consumes a missing word without stamping a span. Duplicate text inside a plain-ID footnote target can then take another word's index.
    - Clicks trust any in-range index (`foliateWordOffsets.ts:109-131`). A count is not a certificate (LL-170).
  - **The contracts.** The frozen contracts are `docs/planning/roadmap-reviews/2026-11-03-block-text-order-contracts.md` (G-A to G-D, with the owner answers at the end). The Blurby.Brain1 rulings are in `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.held-items-TQ.2026-11-03.md`, in the sections "BLOCK-TEXT-ORDER-1 (Seq 87.5)" and "technical shape of the owner's OQ4".
- **Design decisions:**
  - **Owner rulings (2026-11-03, to Blurby.Roadmap):**
    - **OQ1, keep today.** Fallback words before arrival keep today's footnote handling. Only their order changes.
    - **OQ2, accept.** In canonical mode, a plain-ID footnote target has no word spans. It cannot be clicked or highlighted, as with semantic footnotes.
    - **OQ3, keep today.** An internal extractor failure still looks like an empty book (BUG-239).
    - **OQ4, change.** In a section whose stamping cannot be certified, clicks and saves hold to the cfi only, as Page does before the words arrive.
    - **OQ5, no pause.** Text that continues after a nested block carries on without a paragraph pause.
    - **OQ6, true order.** Narrate's pre-arrival speech and "Play from the first visible word" follow DOM order.
  - **Technical rulings (Blurby.Brain1, 2026-11-03):**
    - **TQ-B1.** The `Intl.Segmenter` `isWordLike` gap test is verify-only, not a new tokenizer. It is constructed as `new Intl.Segmenter(undefined, { granularity: "word" })`, exactly as main does (`main/epub-word-extractor.js:211`). It is private to each `foliateWordWrapping.ts` copy, beside `certifyCanonicalAlignment`, and never exported. A future caller that numbers words from it needs a new ruling.
    - **TQ-B2.** Silent at runtime: no diagnostic, and no fence change for it. Before close, the Electron ICU checker below must certify every section of `resources/sample-meditations.epub` that has a canonical slice. Any `ok:false` is a STOP to Brain1, with the reasons.
    - **TQ-B3 (inside this item):**
      - no yield between `certifyCanonicalAlignment` and the last wrap of that section;
      - record the stamping time of the sample's largest section in the memo;
      - if it is over 16 ms and yielding is needed, re-check `node.isConnected && node.data === capturedText[k]` before each node is wrapped. On a mismatch, stop stamping that section and report `reason: "dom-changed"`;
      - add row (b12).

      The second half (restamp currency) is FLOW-RESTAMP-CURRENT-1 and NARRATE-RESTAMP-CURRENT-1.
    - **TQ-A1.** The D4 opposing fixture, row (b11), belongs in this item. It is test-only.
    - **TQ-C1.** Superseded by the OQ4 gate. A section with no canonical slice, while `sections` is non-empty, is reported as `{ok:false, reason:"no-canonical-slice"}` and held. This fixes the defect where a slice-local index is saved as a global one in Page, Flow and Focus.
    - **TQ-D1.** `onWordsReextracted` timing is unchanged.
    - **OQ4 shape:**
      - **What the hold covers.** In an uncertified document, every word index derived from a span is untrusted. Indices from the canonical word table (Narrate's engine cursor, and the saves it makes during playback) are never held.
      - **When a document is uncertified.** `bookWords` has non-empty `sections`, and either this section's report is `ok:false` or it has no canonical slice. The "missing", "empty" and "load failure" rows keep today's behaviour.
      - **Page** reuses `rendererNumberedDocsRef`, with the condition at `FoliateView.tsx:671` widened.
      - **Flow, Focus and Narrate** each own an `uncertifiedDocsRef: WeakSet<Document>`. Flow and Focus save the cfi only; Narrate ignores the click.
      - **Lifecycle.** A later restamp's result replaces the hold. A report from a superseded wrap is discarded.
      - **Fence.** The four helpers, the four wrappers, the main helper, the four `FoliateView.tsx` and the four `ModeRuntime.ts`, plus the tests. Never shared core.
      - **Runtime rows** (o1)–(o6) are mandatory per mode.

##### The change

Every line below was re-grepped on `origin/main` `c5bb507f` on 2026-11-03. The contracts were written at the same commit, so their lines still hold apart from the notes marked *drift*. Re-grep at the cut (standing rule 36).

**Wave A: G-A, G-B, G-D (no view or runtime file)**

1. **Main dormant helper** (`main/epub-word-extractor.js`):
   - Add `extractOrderedRuns($, $root)` beside `extractBlockPlans` (`:106-155`). It reuses `isFootnoteBodyNode` (`:48-64`), `isLikelyFootnoteRef` (`:33`) and `buildFootnoteTargetTextMap` (`:80-103`), applies MAIN_ACCEPT (A-1) and returns `{ runs, cues }` per D-1, with cue offsets as in (m6).
   - Add it to `module.exports` (`:305-311`).
   - No production caller. `extractWords` (`:163`), the per-part segmentation (`:233-266`) and every listed legacy function stay byte-unchanged.
2. **Four `helpers/foliateHelpers.ts` copies** (flow, focus and narrate are blob `02beba13`; Page `7f939419` is offset by +21 lines). Each copy is written in place, with no sibling import:
   - `collectFootnoteTargetIds(body)` and `collectMainAcceptedTextNodes(body)`, implementing MAIN_ACCEPT (A-1). BLOCK_TAGS is unchanged. The census anchors this line (`boundary-policy.json:780-782` and the Page line), so keep it text-identical.
   - `collectBlockTextNodes` (flow/focus/narrate `:86-122`; Page `:107-143`) now emits **raw runs** in DOM order per D-1. It keeps today's `block`/`blockTag`/`blockOrdinal`/`blockId` formula per D-2 and adds `runOrdinal` and `runId`. Fallback runs keep the legacy predicate `isSuppressedNarrationTextNode` (`:71-78`; Page `:92-99`), per A-3 and OQ1.
   - `FoliateWord` (`:8-18`) gains optional `runOrdinal?` and `runId?` (D-6).
   - `extractWordsFromView` and `extractWordsFromSection` (`:233`, `:257`; Page `:254`, `:278`) apply D-3. `paragraphBreakAfter(w)` holds iff the next word in the section is a paragraph start, or w is the section's last word. A continuation run adds no break (OQ5).
3. **Four `helpers/foliateWordWrapping.ts` copies** (all blob `7149222c`):
   - **New exported pure `certifyCanonicalAlignment(nodes, canonical)`**, exactly the algorithm and completion predicates C1–C5 of contract B.2. No lookahead, no skip.
     - It returns `{ok:true, placements}` or `{ok:false, reason, canonicalIndex, nodeIndex}`. The reason is one of `invalid-canonical-word`, `canonical-exhausted-dom`, `unmatched-source-word` or `extra-source-text`.
     - `wordFree` is a private function in the same file (TQ-B1). The `Intl.Segmenter` is created inside the function, not at module level, so no new module singleton enters the census.
   - **`wrapWordsInSpans`** (`:91-149`) gains an optional last parameter, `onCertification?: (r: CertificationResult) => void`. It is called **exactly once per call, synchronously, before the function's first `await`**:
     - When `canonicalWords` is undefined or empty: `{ok:false, reason:"no-canonical-slice"}`, then today's fallback path runs unchanged.
     - Otherwise, compute `nodes = collectMainAcceptedTextNodes(doc.body)` and certify.
       - **Certified:** report `{ok:true}`. Wrap every placement synchronously, with no yield (TQ-B3), using `buildWrappedFragmentForNode` (`nodeStart = 0`, `globalIndex = globalOffset + i`, `tokenId = makeFoliateTokenId(sectionIndex, i)`). Return `globalOffset + canonical.length`.
       - **Not certified:** report the failure, then run the legacy `contentAlignWords` path. `contentAlignWords` (`:19-66`) stays byte-unchanged.
   - Keep the yield statement `await new Promise<void>((resolve) => setTimeout(resolve, 0));` (`:144`) text-identical in the legacy path. The census anchors it (`boundary-policy.json:783` and siblings).
   - Record the certified stamping time (see Done-when B5). If it is over 16 ms, apply TQ-B3's per-node re-check and `dom-changed` exactly as ruled. The implementer does not choose between these; see open question Q4.

**Wave B: the OQ4 hold (views, plus the Flow and Focus runtimes)**

4. **Report handling, the same shape in each view.**
   - Each view keeps a mode-local `wrapGenerationRef: WeakMap<Document, number>`.
   - Each `wrapWordsInSpans` call site bumps the document's generation and passes an `onCertification` closure. The closure applies its report only if the generation is still the latest and, in a restamp effect, `!cancelled`. Otherwise it is discarded (the OQ4 lifecycle; row o4).
   - "Uncertified" means `report.ok === false && (liveSections()?.length ?? 0) > 0`, read when the report arrives. A certified report clears the hold.
   - Every hop of the new callback is widened (LL-174).
5. **Page** (`src/reader/modes/page/FoliateView.tsx`):
   - `:671`: the add widens. Today the document is added when `!liveSections()?.length`. Now it is also added from the load wrap's `onCertification` when the document is uncertified. That runs synchronously inside the `wrapWordsInSpans` call at `:672`, so the document is marked before the wrap first yields, as today.
   - Restamp effect `:1102-1137`: the unconditional `rendererNumberedDocsRef.current.delete(doc)` (`:1127`) runs only when that rewrap's report was certified. `reportHeldTurnRef.current(doc)` (`:1128`) still runs. A held turn on a document that stays uncertified then saves its cfi through `reportFirstWordOnPage` with `wordIndex: null` (`:579-581`).
   - The held turn and click paths (`:586-643`, `:680`, `:729`, `:782`), `checkBookWords` and `bookStampedDocsRef` are otherwise unchanged. **But see Q1:** a turn or click on an uncertified document after the words have arrived is held with nothing to release it.
6. **Flow** (`src/reader/modes/flow/FoliateView.tsx`):
   - Add `uncertifiedDocsRef: WeakSet<Document>` beside `bookStampedDocsRef` (`:343`).
   - Wire `onCertification` at the incremental load wrap (`:905`), the first-load wrap (`:933`) and the restamp wrap (`:1368`).
   - In the click handler (`:944-990`) and the selectionchange handler (`:993-1040`), a held document commits no word: return before any highlight is painted or `onWordClickRef` is called (the shape of the link return at `:947`), and make the cfi-only save. The cfi is `v.getCFI(match.index, range)` of the clicked span. How that save reaches the runtime is Q3.
   - `src/reader/modes/flow/ModeRuntime.ts`: a cfi-only save through the existing port, `this.ports.persistence.updateDocProgress(this.document.documentId, KEEP_STORED_POSITION, cfi)`, plus `recordCfi(cfi)`. It uses a Flow-local `const KEEP_STORED_POSITION = -1`, mirroring `page/ModeRuntime.ts:117` with no import from Page.
     - This path is reachable with no IPC or port change. `ReaderPorts.ts:20` takes any number; `main/ipc/documents.js:22` treats a negative position as cfi-only; `useLibrary.ts:161-167` keeps the stored position.
     - No anchor is committed.
7. **Focus:** the same as Flow.
   - `src/reader/modes/focus/FoliateView.tsx`: `bookStampedDocsRef` `:315`, load wrap `:824`, restamp wrap `:1256`, click `:834-880`, selectionchange `:883-930`, link return `:837`.
   - `src/reader/modes/focus/ModeRuntime.ts`: the Focus-local cfi-only save.
8. **Narrate** (`src/reader/modes/narrate/FoliateView.tsx`):
   - add `uncertifiedDocsRef`;
   - wire the load wraps (`:799` incremental, `:826` first load) and the restamp wrap (`:1257`);
   - in the click (`:839-885`) and selectionchange (`:888-935`) handlers, a held document returns at once, as the link return at `:842` does. Nothing is saved.
   - `src/reader/modes/narrate/ModeRuntime.ts` is not edited: engine-cursor saves use the canonical table (row o6).
   - *Drift:* the contract's Narrate ":795" is the `sectionStart` line; the wrap call is at `:799`.
9. **Unchanged:**
   - `bookStampedDocsRef` marking;
   - `pendingFirstText`;
   - `checkBookWords`;
   - every start path and `onWordsReextracted` call;
   - `foliateParagraphStarts.ts`, `bookParagraphBreaks`, `src/utils/naturalChunks.ts`, `createChunkSourceWords` and Narrate `chunkBreaks` (D-4);
   - `foliateWordOffsets.ts`, `useModeBindings.ts` (unless Q3 rules otherwise), `surface.ts`, `ReaderContainer.tsx`, `src/types.ts` and both `FlowScrollEngine.ts`.

- **Prerequisites:**
  - **FLOW-PARA-PAUSE-INDEX-1 and BLOCK-TAG-CASE-1** (In Flight, merged and held in the RC) are on `origin/main`: integration `f4becc3c`, "Integrate FLOW-PARA-PAUSE-INDEX-1, BLOCK-TAG-CASE-1 (RC window)", plus `2715c867`. Both are ancestors of `c5bb507f`. The base is therefore `c5bb507f` or later.
  - **NATIVE-PATH-ATTESTATION-1 no longer gates this item** (2026-10-30, R-2026-10-30-1). Native runs use the RodneySr substitute: scratch userData proved per LL-165, APPDATA and LOCALAPPDATA redirected, owned fixtures and public-domain books only.
  - Blurby.Brain1 rules Q1–Q4 below before Wave B is dispatched. Wave A depends only on Q4, and only for (b12).
- **Execution host:**
  - RodneySr (x64), clone `C:\Users\estra\Projects\Blurby`, runs both waves: implementation, tests, the ICU checker, `npm test`/`typecheck`/`build`, and the `--dir --x64` packages.
  - Rodney (arm64) runs only the standing rule 53 native-arm64 25 s launch, at the merge go.
  - **Host prerequisites:** `npm ci`; `node node_modules/electron/install.js` succeeds; `resources/sample-meditations.epub` present (blob `ffa27199`); a free scratch profile root.
- **Branch:** `eb/block-text-order-1` at `C:\Users\estra\Projects\Blurby\.worktrees\block-text-order-1` on RodneySr.
  - Create it with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/block-text-order-1 .worktrees/block-text-order-1 origin/main`.
  - Push with `git push origin HEAD:refs/heads/eb/block-text-order-1` (LL-181).
  - Both waves use the same branch. Wave A pushes and stops; Wave B continues from its tip.
- **Waves:** sized by the plugin's criteria, at most 40 tool uses and 60 minutes each. Wave A covers Done-when A1–A6; Wave B covers B1–B9. If Wave B nears its ceiling before B7, the package pair (B7–B8) splits off as Wave B2 with no other change.

##### Done when

PowerShell 7, run from the worktree root. A gate passes only on the exact exit code stated. Before Ready, every gate is dry-run against the base, against the fix and against one wrong variant (LL-143).

**Wave A**

- **A1. Red first (standing rule 43).** Commit alone:
  - `tests/readerModes/blockTextOrder.test.ts` (`// @vitest-environment jsdom`, `describe.each` over the four mode copies);
  - `tests/epubOrderedBlockRuns.test.js` (`createRequire` pattern, as in `tests/epubWordExtractor.test.js:3-4`).

  The rows are exactly those of contract A.3, B.3, C.4 and D.3, with these changes:
  - (b5), (b6), (b9) and (b11) are each split into `…-dom` and `…-certified`;
  - (b11) per TQ-A1: the body is `<p>alpha<a epub:type="noteref" href="#t1">1</a> beta</p><p><a id="t1"/>gamma delta</p>`. It is written into the (b10) three-file EPUB and run through main `extractWords`, and the renderer parses the same XHTML as `application/xhtml+xml`. `(b11-certified)` expects `ok:false` with reason `extra-source-text` or `unmatched-source-word`. `(b11-dom)` expects `body.innerHTML` equal to the base golden;
  - (b12) per TQ-B3, in the form Blurby.Brain1 sets under Q4.

  How the files are written:
  - New helper functions are reached through namespace imports (`import * as flowWrap from …`), so the controls still run on the base.
  - A missing function makes its row red as "not a function". That is the stated reason, and it is recorded.
  - Every `…-dom` and control golden is the literal base output, captured on `c5bb507f` before any source edit and never regenerated afterwards.
- **A2. Base reds recorded.** `npx vitest run tests/readerModes/blockTextOrder.test.ts tests/epubOrderedBlockRuns.test.js` is run on the A1 commit, with no source change, and exits 1.
  - The failing rows are exactly: (a1), (a2), (a3), (a4), (a5), (a6), (p1), (b1), (b2), (b3), (b4), (b5-certified), (b6-certified), (b7), (b8), (b9-certified), (b10), (b11-certified), (b12), (c2), (c3), (d1)–(d8), (m1)–(m6) and (m8).
  - The passing rows are exactly: (a1-control), (a3-control), (b4-control), (b5-dom), (b6-dom), (b9-dom), (b11-dom), (c1), (d6-control) and (m7).
  - The output is saved in the memo. Any row whose base status differs is recorded as observed and goes to Blurby.Brain1 before any source edit.
  - (a4) is added to the contract's red list, because it calls `collectMainAcceptedTextNodes`.
- **A3. Green.** The same command exits 0 on the Wave A tip.
- **A4. Inherited rows, unedited (standing rule 50).** This command exits 0:

  `npx vitest run tests/foliateContentAlign.test.ts tests/foliateTokenStitching.test.ts tests/foliateDropcapAndChapters.test.ts tests/startupStabilization.test.ts tests/epubWordExtractor.test.js tests/readerModes/blockTagCase.test.ts tests/readerModes/flowParagraphStarts.test.ts tests/readerModes/focusParagraphStarts.test.ts tests/readerModes/bookParagraphBreaks.test.ts tests/bookParagraphStart.test.ts tests/naturalChunks.test.ts tests/naturalChunksBoundaryScan.test.ts tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts`

  `git diff --exit-code c5bb507f -- <those paths>` also exits 0.
- **A5. Legacy main unchanged.** `git diff c5bb507f -- main/epub-word-extractor.js` shows only added lines: the `extractOrderedRuns` definition and its export entry.
  - (m7) passes.
  - `git grep -n "extractOrderedRuns" -- main src preload.js` prints exactly two lines, the definition and the export.
- **A6. No sibling import.** `git grep -nE "modes/(page|focus|flow|narrate)/" -- "src/reader/modes/*/helpers/*.ts"` prints no line that names another mode's folder. Dry-run this on the base and on one wrong variant first (LL-143).

**Wave B**

- **B1. Red first (standing rule 43).** Commit alone four runtime test files, each mounting the real `FoliateView` with `foliate-js/view.js` mocked:
  - `tests/readerModes/blockTextOrderHold.page.test.tsx` (harness pattern: `tests/readerModes/pagePositionSave.test.tsx`);
  - `tests/readerModes/blockTextOrderHold.flow.test.tsx` (`tests/readerModes/bandAlign2R7.test.tsx`);
  - `tests/readerModes/blockTextOrderHold.focus.test.tsx` (`tests/readerModes/bandAlign2.test.tsx`);
  - `tests/readerModes/blockTextOrderHold.narrate.test.tsx` (`tests/narrate/narrate.playFirstText.test.ts`).

  An uncertified document is made with a mismatched canonical slice (the (c2) body), which exists on the base too. The rows are:
  - **(o1)** A click in an uncertified document commits no word. Page saves per Q1. Flow and Focus call `updateDocProgress(docId, -1, cfi)` once and commit no anchor. Narrate makes no persistence call. Red on base in every mode.
  - **(o2)** A click in a certified document behaves as on base. This is a control and is green on base.
  - **(o3)** A restamp that certifies lifts the hold. A click before the restamp commits nothing, and a click after it commits the canonical index. Red on base, from the pre-restamp assertion.
  - **(o4)** The latest wrap is uncertified, and a superseded wrap's certified report arrives after it. A click still commits nothing. Red on base.
  - **(o5)** A section with no canonical slice while `sections` is non-empty is held. Red on base for Page, Flow and Focus (the TQ-C1 defect). Narrate's base status is recorded as observed.
  - **(o6)** Narrate only: engine-cursor saves during playback through an uncertified section still save the canonical index. Green on base.

  Run `npx vitest run tests/readerModes/blockTextOrderHold.page.test.tsx tests/readerModes/blockTextOrderHold.flow.test.tsx tests/readerModes/blockTextOrderHold.focus.test.tsx tests/readerModes/blockTextOrderHold.narrate.test.tsx` on the B1 commit. It exits 1, with exactly the reds listed above. Save the output.
- **B2. Green.** The B1 command exits 0 on the tip.
- **B3. Inherited runtime rows, unedited (standing rule 50).** This command exits 0:

  `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/readerModes/flowPlayFirstText.test.ts tests/readerModes/focusPlayFirstText.test.ts tests/narrate/narrate.playFirstText.test.ts tests/tts7k-global-word-source.test.ts tests/readerModes/flow.behavior.test.tsx tests/readerModes/focus.behavior.test.tsx tests/narrateIntentCursor.test.ts`

  This includes Page rows (r)–(hf2), (WC1)–(WC4) and (FR1)–(FR4). The A4 command also exits 0 again. `git diff --exit-code c5bb507f -- <every path in both commands>` exits 0.
- **B4. Suite.** `npm test` exits 0, with 0 failures and at least the base count. `npm run typecheck` exits 0, and `npm run build` exits 0 (standing rules 47 and 48). Record the counts.
- **B5. Electron ICU checker (TQ-B2, LL-160).** New files:
  - `scripts/block-text-order/icu-certify/main.js` (Electron main);
  - `scripts/block-text-order/icu-certify/package.json` (`{"main":"main.js"}`);
  - `scripts/block-text-order/icu-certify/run.ps1`, which follows the launcher pattern of `scripts/narrate-rebuild/exit-crash-repro/run.ps1` and `scripts/narrate-rebuild/app-node.ps1`. It pipes output so that `$LASTEXITCODE` is set. Exit 4 means the binary is missing; exit 5 means it never ran.

  `run.ps1 -packaged <path to the x64 --dir Blurby.exe>` does the following:
  1. **Runtime proof.** Read `process.versions.electron` and `process.versions.icu` from the packaged exe under `ELECTRON_RUN_AS_NODE=1`, using `-p`; the build sets no fuses. Exit 3 unless they equal the versions the checker's own Electron (`node_modules/electron`) reports in both the main process and the renderer.
  2. **Main side.** In Electron main, run main `extractWords` on `resources/sample-meditations.epub`.
  3. **Renderer side.** Bundle each mode's `helpers/foliateWordWrapping.ts` and `helpers/foliateHelpers.ts` with esbuild into the scratch output folder; the bundle is never committed. In a hidden `BrowserWindow`, parse each spine section as `application/xhtml+xml` and run `collectMainAcceptedTextNodes` and `certifyCanonicalAlignment` against that section's canonical slice, for each of the four copies.
  4. **Timing.** For the largest section, time a certified `wrapWordsInSpans` on a clone with `performance.now()`.
  5. **Output.** Print JSON: `{electron, icu, mainLocale, rendererLocale, sections, withSlice, certified, failures:[{mode, sectionIndex, reason, canonicalIndex, nodeIndex}], largest:{sectionIndex, words, stampMs}}`. Exit 0 iff `certified === withSlice` for all four copies, and 1 otherwise.

  Gates:
  - **Positive control first (standing rule 55):** `run.ps1 -packaged <exe> -control` drops the last canonical word of one named section. It must print that section with `extra-source-text` and exit 1.
  - **Live run:** then the run without `-control` exits 0.
  - **Any `ok:false` in the live run is a STOP** to Blurby.Brain1, with the failures JSON.
  - Record `stampMs` in the memo. Over 16 ms, apply Q4's ruling.
- **B6. Sibling and shared-core gates.** A6 re-runs and passes. `git diff --exit-code c5bb507f -- src/components/ReaderContainer.tsx src/types.ts src/utils/FlowScrollEngine.ts src/reader/modes/flow/helpers/FlowScrollEngine.ts src/utils/foliateHelpers.ts src/utils/foliateWordWrapping.ts src/utils/naturalChunks.ts preload.js main/ipc` exits 0.
- **B7. Standing rule 53 package pair, on RodneySr.**
  - `--dir --x64` packages of the tip with `origin/main` merged in, and of `origin/main`;
  - a 25 s scratch-profile launch with no error, with the profile proved before the first input (LL-165) and APPDATA and LOCALAPPDATA redirected;
  - `npx asar list` shows the changed helper, wrapper and view files in the bundle;
  - B5 re-run against the tip package exits 0;
  - on `origin/main`'s package, B5's step 1 prints the same Electron and ICU (LL-152: one recipe on base and tip);
  - a "Package verification" section in the close-out.
- **B8. Native arm64 launch on Rodney** at the merge go: a 25 s scratch-profile launch of the `--dir --arm64` package, with no error or crash. Blurby.Brain1 confirms before the merge go.
- **B9. Fence (standing rule 41).** `git diff --name-status c5bb507f..HEAD` lists exactly the following, plus `docs/governance/close-outs/Memo.BLOCK-TEXT-ORDER-1.<date>.md` and `docs/governance/close-outs/Timing.BLOCK-TEXT-ORDER-1.jsonl`:
  - `M main/epub-word-extractor.js`
  - `M src/reader/modes/page/helpers/foliateHelpers.ts`
  - `M src/reader/modes/focus/helpers/foliateHelpers.ts`
  - `M src/reader/modes/flow/helpers/foliateHelpers.ts`
  - `M src/reader/modes/narrate/helpers/foliateHelpers.ts`
  - `M src/reader/modes/page/helpers/foliateWordWrapping.ts`
  - `M src/reader/modes/focus/helpers/foliateWordWrapping.ts`
  - `M src/reader/modes/flow/helpers/foliateWordWrapping.ts`
  - `M src/reader/modes/narrate/helpers/foliateWordWrapping.ts`
  - `M src/reader/modes/page/FoliateView.tsx`
  - `M src/reader/modes/focus/FoliateView.tsx`
  - `M src/reader/modes/flow/FoliateView.tsx`
  - `M src/reader/modes/narrate/FoliateView.tsx`
  - `M src/reader/modes/flow/ModeRuntime.ts`
  - `M src/reader/modes/focus/ModeRuntime.ts`
  - `A tests/readerModes/blockTextOrder.test.ts`
  - `A tests/epubOrderedBlockRuns.test.js`
  - `A tests/readerModes/blockTextOrderHold.page.test.tsx`
  - `A tests/readerModes/blockTextOrderHold.flow.test.tsx`
  - `A tests/readerModes/blockTextOrderHold.focus.test.tsx`
  - `A tests/readerModes/blockTextOrderHold.narrate.test.tsx`
  - `A scripts/block-text-order/icu-certify/main.js`
  - `A scripts/block-text-order/icu-certify/package.json`
  - `A scripts/block-text-order/icu-certify/run.ps1`

  Conditional additions, each recorded in the memo:
  - `M src/reader/modes/flow/useModeBindings.ts` and `M src/reader/modes/focus/useModeBindings.ts`, only if Q3 rules the binding route;
  - `M docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`, only if A4's `readerModeBoundaries`/`readerModeOwnership` tests fail mechanically. Record the failure first.

  The ruling allows `page/ModeRuntime.ts` and `narrate/ModeRuntime.ts`, but neither is expected to change. Either one appearing is a fence failure unless Blurby.Brain1 approves it first.
- **Owner checks:** the OQ2, OQ5 and OQ6 items are added to release gate (2)'s list. No separate smoke run is offered.

- **Effort:** L. Technical effort: high.
- **Owners:**
  - planner (spec; Wave B amendment if Q1–Q4 change the shape);
  - Blurby.Brain1 (Q1–Q4 rulings, STOPs, the rule 53 confirmation);
  - RodneySr implementation agents: cross-cutting for the Wave A certifier and runs; bounded for each Wave B view;
  - spec-compliance review, then quality review;
  - package verifier;
  - Blurby.Roadmap (merge go and close-out).
- **Merge order:**
  - Build-and-hold, opting out of the rule 5b auto-merge (card: "Build-and-hold; opt out of auto-main merge").
  - WORD-INDEX-UNIFY-1 (Seq 88) waits on this item. FOOTNOTE-INLINE-READ-1 comes after it, and its specification goes back to Brain1, because OQ2 leaves note targets without spans.
  - FLOW-RESTAMP-CURRENT-1 and NARRATE-RESTAMP-CURRENT-1 edit the same restamp effects (Flow `:1352-1380`, Narrate `:1243-1266`). Whichever lands second re-greps (standing rule 36).
  - `modes/focus/FoliateView.tsx` is in the Focus ownership window of FOCUS-WORD-ONLY-1 and FOCUS-PAUSED-HANDOFF-1 Wave B. Wave B's Focus edit is sequenced by the planner against that window.
- **Path:** dispatch (two waves).

##### Implementation detail

- **Lane ownership:** Reader Engine. Execution surfaces A (runtime, views) and D (one dormant main helper).
- **Forbidden during parallel run:**
  - shared core;
  - `src/reader/modes/*/surface.ts`;
  - `src/reader/modes/*/helpers/foliateWordOffsets.ts`;
  - `src/reader/modes/*/helpers/foliateParagraphStarts.ts`;
  - `src/utils/`;
  - `preload.js`, `main/ipc/`;
  - any other item editing the four `FoliateView.tsx` files.
- **Shared-core touches:** none.
- **Staging plan:**
  - only the exact B9 paths, staged by name;
  - no esbuild bundle, checker output, scratch profile or EPUB copy;
  - the checker's JSON and the base-red output go into the memo as text.
- **Failure handling:**
  - A2 or B1 base status differs from the lists: STOP to Brain1 before any source edit.
  - B5 shows any `ok:false` or exits 3: STOP to Brain1.
  - The live profile hash changes: STOP (LL-165).
  - A Q1–Q4 ruling changes the edit sites: the planner amends this spec before Wave B continues.
  - Each failing gate gets at most one retry, and only for a harness fault.

##### Open questions for Blurby.Brain1 (pre-dispatch for Wave B; Q4 also gates A1's (b12))

These are places where the ruling's text and the current source disagree. None is decided here.

- **Q1. Page's reused hold has no release once the words have arrived.**
  - The ruling says Page's held turn and click paths "apply unchanged".
  - At `c5bb507f`, a turn on a `rendererNumberedDocsRef` document is held when `!bookWordsFailedRef.current` (`:611-616`), and so is a click (`:627-636`, via `holdSave` `:729`/`:782`).
  - The hold is released only by `fail()` (when `ensureBookWords` gives no sections, `:601`), by a restamp (`:1128`), or by that document's own section load (`:680`, which also requires the document to be absent from the set).
  - For an uncertified document whose section map has already arrived, none of these fires again. The save is lost; it is not made cfi-only. This affects rows (o1) and (o5) for Page.
  - **Candidates for Brain1:**
    - (a) treat an uncertified document like `bookWordsFailedRef` in `reportTurn`, `holdWordClick` and `:680`, so it reports at once with `wordIndex: null`. This needs a way to tell an uncertified document from a pre-arrival one: a second Page-local set, or the `liveSections()` test, which would mis-handle the window between arrival and restamp;
    - (b) another shape Brain1 prefers.
- **Q2. Scope of "the first visible word".**
  - The ruling's "what the hold covers" includes "the first visible word used for a save, a page turn, or Play from the first visible word".
  - Its mechanism, its rows (o1)–(o6) and its fence ("the start paths stay unchanged") cover only clicks for Flow, Focus and Narrate.
  - Are Flow, Focus and Narrate's Play-from-first-visible-word and their soft and relocate anchors inside this item? If they are, the start paths and new rows enter the fence.
- **Q3. Wiring the Flow and Focus cfi-only save.**
  - The port is reachable: `updateDocProgress(docId, -1, cfi)`, so there is no IPC or port change and no STOP under the ruling.
  - But the view reaches its runtime only through props bound in each mode's `useModeBindings.ts` (Flow `:156`, Focus `:44`). That file is outside the ruling's fence.
  - **Candidates:**
    - (a) a new view prop, for example `onHeldWordClick(cfi)`, bound in the two `useModeBindings.ts` files (fence +2);
    - (b) reuse `onWordClick` with the section offset and global index left undefined, so that `resolveClickedGlobalWordIndex` returns null (Flow `:1573`, Focus `:1181`) and `hardSelect` makes the cfi-only save on that branch. That overloads a parameter convention.
  - Also confirm that a held click paints no highlight.
- **Q4. Row (b12) assumes a yield exists.**
  - (b12) "stubs the yield" between certify and stamp. If the measured stamping time is 16 ms or less, the certified branch has no yield to stub.
  - **Candidates:**
    - (a) the per-node `isConnected && data` re-check is always present, and (b12) drives it through a test-only seam (for example, an optional hook parameter invoked between nodes);
    - (b) the re-check and (b12) apply only if B5's `stampMs` exceeds 16 ms, and otherwise (b12) is recorded as NOT RUN.
  - The timing is measured in Wave B (B5), but the code shape is set in Wave A.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | A1 red-first test files with base goldens; A2 base reds recorded | calculable | positive-control | cross-cutting | high | 45m | 60m | A |
| 2 | Main dormant `extractOrderedRuns`; four helper copies (MAIN_ACCEPT, runs, D-3) | calculable | implementation | cross-cutting | high | 40m | — | A |
| 3 | Four wrapper copies: certifier, certified branch, `onCertification`; A3–A6 | calculable | implementation | cross-cutting | high | 35m | — | A |
| 4 | B1 four runtime test files red | calculable | positive-control | bounded | medium | 40m | — | B |
| 5 | Page, Flow, Focus and Narrate hold per the Q1–Q3 rulings; B2–B4, B6 | calculable | implementation | bounded | high | 50m | — | B |
| 6 | ICU checker with positive control and timing (B5) | calculable | verify | cross-cutting | medium | 35m | 50m | B |
| 7 | Rule 53 package pair, asar, B5 on package; arm64 launch on Rodney (B7–B8) | calculable | packaging-verify | bounded | low | 30m | — | B |
| 8 | Fence, memo and time log; push; Brain1 confirmation (B9) | calculable | docs | bounded | low | 15m | — | B |

**Total:** chain 4h45m · sum 4h45m; 0 of 8 estimated tasks calibrated (planner estimates). These are planning prices, not execution allowances.

##### Lessons applied

- **LL-142:** a numbering claim is proved by running the producer and the installed artifact. B5 runs main and the renderer under the shipped Electron, not a declared parity.
- **LL-143:** every gate is dry-run against the base, the fix and one wrong variant before Ready. The shell is named, and a gate passes only on an exact exit code (A2, A6, B1, B5's control).
- **LL-152:** one recipe on the base and on the tip, for the package pair and B5's runtime proof.
- **LL-160:** word segmentation depends on the runtime's ICU. B5 runs under the app's Electron and asserts its versions.
- **LL-161:** rows that name a word check its text as well as its index (b-rows, B5 placements).
- **LL-165:** the scratch profile is proved before the first input; APPDATA and LOCALAPPDATA are redirected.
- **LL-170:** an in-range index, a consumed count or `bookStamped` is not a certificate. Only C1–C5 certify.
- **LL-028, LL-071, LL-081:** the book's word table stays the only numbering authority. The renderer gap test numbers nothing (TQ-B1).
- **LL-029, LL-169:** currency and resource guards. Reports from superseded wraps are discarded here. The restamp-currency fix itself is FLOW-RESTAMP-CURRENT-1 and NARRATE-RESTAMP-CURRENT-1.
- **LL-139:** the fence was cut from the real consumer graph, including the census anchors.
- **LL-174:** the new `onCertification` callback is widened at every hop, from the wrap to each view's set.
- **LL-181:** worktree placement and the push refspec.
- **Standing rule 43:** red-first commits A1 and B1.
- **Standing rule 50:** inherited rows run unedited (A4, B3).
- **Standing rule 41:** the exact fence exempts the time log.
- **Standing rule 36:** every cited line is re-grepped at the cut.
- **Standing rule 55 (promoted from LL-166):** B5's positive control must exit 1 before its pass counts.
- **Standing rule 53 (promoted from LL-167):** the package pair, asar check, B5 on the package, the arm64 launch and Brain1's confirmation.
