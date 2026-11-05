#### BLOCK-TEXT-ORDER-1 — Keep block text in DOM order in every reading mode *(Seq 87.5; Full Spec 2026-11-03, cited against `origin/main` `c5bb507f`; Reader Engine; contracts G-A to G-D frozen, owner answers OQ1–OQ6 and Blurby.Brain1 rulings TQ-A1 to TQ-D1, OQ4, Q1–Q4 and R-Q5 applied; two waves; build-and-hold; both waves dispatch-ready subject to the stated prerequisites)*

- **What:** text inside nested blocks reads in true document order in Page, Focus, Flow and Narrate. Today, text that comes after a nested block is read before that block. Word spans are also stamped only where the renderer's text provably matches main's word list (a "certified" section). Where it doesn't match, clicks and saves fall back to the cfi only, instead of risking the wrong word.
  - **Wave A** (tests red, then the certifier): ordered runs (G-D), one shared acceptance rule (G-A), and the fail-closed certifier with its certified stamping branch (G-B). The edits are in the four helper copies, the four wrapper copies and one dormant main helper. No view or runtime edits.
  - **Wave B** (the OQ4 hold): the hold of clicks in uncertified sections in all four modes, plus Page's turn and click saves (G-C as widened by OQ4, Q1–Q3); the Electron ICU checker (TQ-B2); the full gates; and the standing rule 53 package pair.
  - **OQ4 is delivered in two steps (Blurby.Brain1 Q2).** This item delivers it for clicks in every mode and for Page's turn and click saves. In Flow, Focus and Narrate, the first-visible-word paths (soft and relocate anchor saves, and Play from the first visible word) are delivered by the follow-up **UNCERTIFIED-ANCHOR-HOLD-1**. That item is Reader Engine, one commit per mode, sequenced directly after this item inside each mode's ownership window.
  - **Out of scope:**
    - Flow, Focus and Narrate's first-visible-word paths in an uncertified section (UNCERTIFIED-ANCHOR-HOLD-1, Q2);
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
    - In a section whose spans cannot be certified:
      - a click paints no highlight and commits no word in any mode;
      - Page, Flow and Focus save the cfi only, and Narrate ignores the click;
      - a Page turn saves the cfi only.

      None of these saves a wrong word (OQ4). The first-visible-word paths of Flow, Focus and Narrate follow in UNCERTIFIED-ANCHOR-HOLD-1.
- **Why:**
  - **The bug.** Each mode's `collectBlockTextNodes` groups text nodes by their nearest block element and emits the groups in first-encounter order. For `<div>before <p>inside</p> after</div>` the groups are `div: "before  after"` and then `p: "inside"`. So the fallback words, their numbering, the paragraph flags and Narrate's pre-arrival speech all come out as "before after inside". Sources:
    - flow/focus/narrate `helpers/foliateHelpers.ts:86-122`; Page `:107-143`;
    - the 2026-10-27 trace (`docs/planning/roadmap-reviews/2026-10-27-group-source-trace.md`);
    - the issue `docs/governance/bug-reports/Issue.BLOCK-TEXT-ORDER-1.2026-10-27.md`.
  - **Canonical stamping can also land on the wrong source text.** `contentAlignWords` (`helpers/foliateWordWrapping.ts:19-66`) uses `indexOf` within each group. With `MAX_PEEK_AHEAD = 8` (`:13`, `:49-61`), it consumes a missing word without stamping a span. Duplicate text inside a plain-ID footnote target can then take another word's index.
    - Clicks trust any in-range index (`foliateWordOffsets.ts:109-131`). A count is not a certificate (LL-170).
  - **The contracts.** The frozen contracts are `docs/planning/roadmap-reviews/2026-11-03-block-text-order-contracts.md` (G-A to G-D, with the owner answers at the end). The Blurby.Brain1 rulings are in `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.held-items-TQ.2026-11-03.md`, in the sections "BLOCK-TEXT-ORDER-1 (Seq 87.5)", "technical shape of the owner's OQ4" and "BLOCK-TEXT-ORDER-1 Wave B: Q1–Q4 (spec at `c0f0bbed`)".
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
      - no yield between `certifyCanonicalAlignment` and the last wrap of that section *(superseded 2026-11-05 by [amendment 1](../2026-11-05/BLOCK-TEXT-ORDER-1.amendment-1.md))*;
      - record the stamping time of the sample's largest section in the memo;
      - re-check `node.isConnected && node.data === capturedText[k]` before each node is wrapped. On a mismatch, stop stamping that section and report `reason: "dom-changed"`. Per Q4, this re-check is **always present**, whatever the measured time;
      - add row (b12), driven through the test-only hook `__testBetweenNodes` (Q4).

      The second half (restamp currency) is FLOW-RESTAMP-CURRENT-1 and NARRATE-RESTAMP-CURRENT-1.
    - **TQ-A1.** The D4 opposing fixture, row (b11), belongs in this item. It is test-only.
    - **TQ-C1.** Superseded by the OQ4 gate. A section with no canonical slice, while `sections` is non-empty, is reported as `{ok:false, reason:"no-canonical-slice"}` and held. This fixes the defect where a slice-local index is saved as a global one in Page, Flow and Focus.
    - **TQ-D1.** `onWordsReextracted` timing is unchanged.
    - **OQ4 shape:**
      - **What the hold covers.** In an uncertified document, every word index derived from a span is untrusted. Indices from the canonical word table (Narrate's engine cursor, and the saves it makes during playback) are never held.
        - In this item (Q2): clicks and selections in all four modes, and Page's turn and click saves.
        - The first-visible-word paths of Flow, Focus and Narrate go to UNCERTIFIED-ANCHOR-HOLD-1.
      - **When a document is uncertified.** `bookWords` has non-empty `sections`, and either this section's report is `ok:false` or it has no canonical slice. The "missing", "empty" and "load failure" rows keep today's behaviour.
      - **All four modes** own a mode-local `uncertifiedDocsRef: WeakSet<Document>`. This is Q1 for Page, which revises the earlier "reuse `rendererNumberedDocsRef`" shape.
        - Page never adds an uncertified document to `rendererNumberedDocsRef`, and `FoliateView.tsx:671` stays unchanged.
        - A held click paints no highlight and commits no word in any mode (Q3).
        - Page, Flow and Focus save the cfi only. Narrate ignores the click.
      - **Lifecycle.** A later restamp's result replaces the hold. A report from a superseded wrap is discarded.
      - **Fence.** The four helpers, the four wrappers, the main helper, the four `FoliateView.tsx`, the Page, Flow and Focus `ModeRuntime.ts` and the Page, Flow and Focus `useModeBindings.ts` (Q3, R-Q5), plus the tests. Never shared core.
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
         - **Per-node re-check, always present (Q4).** Capture `capturedText[k] = nodes[k].data` at certification. Before each node is wrapped, check `node.isConnected && node.data === capturedText[k]`. On a mismatch, stop stamping that section, leave no span at a stale offset, and report `{ok:false, reason:"dom-changed"}` through the same `onCertification`. This is a second report, after the earlier `{ok:true}`, and the view's latest-report rule applies it.
         - **Test-only hook (Q4).** An optional `__testBetweenNodes?: (k: number) => void` is invoked between nodes. It sits in an options position after `onCertification`, and production call sites never pass it.
       - **Not certified:** report the failure, then run the legacy `contentAlignWords` path. `contentAlignWords` (`:19-66`) stays byte-unchanged.
   - Keep the yield statement `await new Promise<void>((resolve) => setTimeout(resolve, 0));` (`:144`) text-identical in the legacy path. The census anchors it (`boundary-policy.json:783` and siblings).
   - *Superseded 2026-11-05: the certified stamp yields on a time budget ([amendment 1](../2026-11-05/BLOCK-TEXT-ORDER-1.amendment-1.md)).* The certified branch never yields. B5 records the certified stamping time (`stampMs`) for the memo (TQ-B3, Pike rule 1). The time changes no code shape (Q4).

**Wave B: the OQ4 hold (views, plus the Page, Flow and Focus runtimes and bindings)**

4. **Report handling, the same shape in each view.**
   - Each view keeps a mode-local `wrapGenerationRef: WeakMap<Document, number>`.
   - Each `wrapWordsInSpans` call site bumps the document's generation and passes an `onCertification` closure. The closure applies its report only if the generation is still the latest and, in a restamp effect, `!cancelled`. Otherwise it is discarded (the OQ4 lifecycle; row o4).
   - "Uncertified" means `report.ok === false && (liveSections()?.length ?? 0) > 0`, read when the report arrives. A certified report clears the hold.
   - Every hop of the new callback is widened (LL-174).
5. **Page** (`src/reader/modes/page/FoliateView.tsx`; Q1):
   - **New set.** Add `uncertifiedDocsRef: WeakSet<Document>` beside `rendererNumberedDocsRef` (`:313`). The pre-arrival hold keeps exactly today's meaning. The new set means "the words have arrived, and this document is untrusted".
   - **`:671` stays unchanged.** An uncertified document is never added to `rendererNumberedDocsRef`. The load wrap's `onCertification` (call at `:672`) adds the document to `uncertifiedDocsRef` when it is uncertified, and removes it when the wrap is certified. The report is synchronous, so the document is marked before the wrap first yields.
   - **Report at once, cfi only.** `reportFirstWordOnPage` (`:579-581`) reports `wordIndex: null` when the document is in either set. With that, a document in `uncertifiedDocsRef` reports at once and is never held:
     - in `reportTurn` (`:604-620`): the held branch at `:611` tests `rendererNumberedDocsRef` only, so the turn falls through to the immediate `reportFirstWordOnPage`, which now gives `wordIndex: null`;
     - in `holdWordClick` (`:626-637`): a held click never reaches it for an uncertified document, because the click handlers return first and save through `onHeldWordClick` (R-Q5). Its code is unchanged, so it never puts an uncertified document in `pendingTurnRef`;
     - at the section load (`:680`): a pending turn on an uncertified document reports at once with `wordIndex: null`.
   - **Click handlers** (click `:692-741`, selectionchange `:745-795`; `holdSave` at `:729` and `:782`). In an uncertified document, return before the highlight is painted (`:700-707` and `:759-…`), before `onWordClickRef` is called (`:730`) and before `holdWordClick` (`:739`). Then call `onHeldWordClickRef.current?.(cfi)`, where `cfi` is `v.getCFI(match.index, range)` of the clicked span (Q3: no highlight, no word).
   - **New prop (R-Q5, ruling (b)).**
     - `onHeldWordClick?: (cfi: string) => void` on the Page `FoliateView` props interface, beside `onHeldClickSave?` (`:261`). Destructure it beside `onHeldClickSave` (`:286`), and hold it in a ref beside `onHeldClickSaveRef` (`:338-339`).
     - It is not routed through `onPageTurned`, `onHeldClickSave` or `holdWordClick`.
   - `src/reader/modes/page/useModeBindings.ts`: bind `onHeldWordClick: runtime.onHeldWordClick` beside `onHeldClickSave` (`:34`).
   - `src/reader/modes/page/ModeRuntime.ts`: a public `onHeldWordClick = (cfi: string): void => …` beside `onHeldClickSave` (`:611`).
     - If `!this.alive`, it returns.
     - Otherwise it calls `this.ports.persistence.recordCfi(cfi)`, then `this.ports.persistence.updateDocProgress(this.document.documentId, KEEP_STORED_POSITION, cfi)`. This is the same call shape as the held-turn save in `onPageTurned` (`:588-590`), with the existing `KEEP_STORED_POSITION` (`:117`).
     - It commits no word. It does not touch `heldClickAnchor` (`:145`), `userExplicitSelection`, `explicitSelectionAnchor` or `resumeAnchor`. It calls neither `hardSelect` (`:305`) nor `onPageTurned` (`:579`).
   - **Restamp** (effect `:1102-1137`, lines `:1127-1128`):
     - **Certified:** remove the document from both sets, then `reportHeldTurnRef.current(doc)`, which releases a held save with its word, as today.
     - **Uncertified:** move the document from `rendererNumberedDocsRef` into `uncertifiedDocsRef`, then `reportHeldTurnRef.current(doc)`, which releases a held save as cfi-only.

     Making the delete at `:1127` conditional is confirmed by Brain1 (Q1).
   - `checkBookWords`, `bookWordsFailedRef` and `bookStampedDocsRef` are unchanged.
6. **Flow** (`src/reader/modes/flow/FoliateView.tsx`):
   - Add `uncertifiedDocsRef: WeakSet<Document>` beside `bookStampedDocsRef` (`:343`).
   - Wire `onCertification` at the incremental load wrap (`:905`), the first-load wrap (`:933`) and the restamp wrap (`:1368`).
   - In the click handler (`:944-990`) and the selectionchange handler (`:993-1040`), a held document commits no word (Q3).
     - Return before any highlight is painted or `onWordClickRef` is called (the shape of the link return at `:947`). The existing highlight and cursor stay where they were.
     - Then call the new prop `onHeldWordClick(cfi)` through its ref, where `cfi` is `v.getCFI(match.index, range)` of the clicked span.
   - **New prop (Q3).** `onHeldWordClick?: (cfi: string) => void` on the Flow `FoliateView` props interface (`:286` area), held in a ref like `onWordClickRef` (`:354-355`). Do not overload `onWordClick`.
   - `src/reader/modes/flow/useModeBindings.ts`: bind `onHeldWordClick: runtime.onHeldWordClick` beside `onWordClick` (`:156`).
   - `src/reader/modes/flow/ModeRuntime.ts`: a public `onHeldWordClick = (cfi: string): void => …` beside `onWordClick` (`:1154`). If `!this.alive` it returns. Otherwise it calls `this.ports.persistence.recordCfi(cfi)` and then `this.ports.persistence.updateDocProgress(this.document.documentId, KEEP_STORED_POSITION, cfi)`.
     - It uses a Flow-local `const KEEP_STORED_POSITION = -1`, mirroring `page/ModeRuntime.ts:117` with no import from Page.
     - This path is reachable with no IPC or port change. `ReaderPorts.ts:20` takes any number; `main/ipc/documents.js:22` treats a negative position as cfi-only; `useLibrary.ts:161-167` keeps the stored position.
     - It commits no anchor and changes no state other than the recorded cfi. It does not call `hardSelect`.
7. **Focus:** the same as Flow.
   - `src/reader/modes/focus/FoliateView.tsx`: `bookStampedDocsRef` `:315`, load wrap `:824`, restamp wrap `:1256`, click `:834-880`, selectionchange `:883-930`, link return `:837`, `onWordClickRef` `:326-327`; the new `onHeldWordClick` prop and ref.
   - `src/reader/modes/focus/useModeBindings.ts`: bind `onHeldWordClick: runtime.onHeldWordClick` beside `onWordClick` (`:44`).
   - `src/reader/modes/focus/ModeRuntime.ts`: the Focus-local `onHeldWordClick` and `KEEP_STORED_POSITION`, beside `onWordClick` (`:948`).
8. **Narrate** (`src/reader/modes/narrate/FoliateView.tsx`):
   - add `uncertifiedDocsRef`;
   - wire the load wraps (`:799` incremental, `:826` first load) and the restamp wrap (`:1257`);
   - in the click (`:839-885`) and selectionchange (`:888-935`) handlers, a held document returns at once, before any highlight is painted, as the link return at `:842` does. Nothing is saved, and no prop is added (Q3).
   - `src/reader/modes/narrate/ModeRuntime.ts` and `useModeBindings.ts` are not edited: engine-cursor saves use the canonical table (row o6).
   - *Drift:* the contract's Narrate ":795" is the `sectionStart` line; the wrap call is at `:799`.
9. **Unchanged:**
   - `bookStampedDocsRef` marking;
   - `pendingFirstText`;
   - `checkBookWords`;
   - every start path, every soft and relocate anchor save, and every `onWordsReextracted` call (Q2: UNCERTIFIED-ANCHOR-HOLD-1);
   - `foliateParagraphStarts.ts`, `bookParagraphBreaks`, `src/utils/naturalChunks.ts`, `createChunkSourceWords` and Narrate `chunkBreaks` (D-4);
   - `foliateWordOffsets.ts`, Narrate's `ModeRuntime.ts` and `useModeBindings.ts`, `surface.ts`, `ReaderContainer.tsx`, `src/types.ts` and both `FlowScrollEngine.ts`.

- **Prerequisites:**
  - **FLOW-PARA-PAUSE-INDEX-1 and BLOCK-TAG-CASE-1** (In Flight, merged and held in the RC) are on `origin/main`: integration `f4becc3c`, "Integrate FLOW-PARA-PAUSE-INDEX-1, BLOCK-TAG-CASE-1 (RC window)", plus `2715c867`. Both are ancestors of `c5bb507f`. The base is therefore `c5bb507f` or later.
  - **NATIVE-PATH-ATTESTATION-1 no longer gates this item** (2026-10-30, R-2026-10-30-1). Native runs use the RodneySr substitute: scratch userData proved per LL-165, APPDATA and LOCALAPPDATA redirected, owned fixtures and public-domain books only.
  - Blurby.Brain1 has ruled Q1–Q4 (see the rulings section below). Wave A is dispatch-ready now.
  - Blurby.Brain1 has also ruled R-Q5, the Page held-click save route: (b), a Page-local `onHeldWordClick`. Nothing in either wave waits on a ruling.
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
  - (b12) per TQ-B3 and Q4, `(b12) dom-changed stops stamping with no span at a stale offset`. Body `<p>alpha beta</p><p>gamma</p>`, canonical `["alpha","beta","gamma"]`.
    - Call `wrapWordsInSpans(doc, 0, 100, words, canonical, onCertification, { __testBetweenNodes: (k) => { if (k === 0) nodeB.data = "gamma changed"; } })`. Here `nodeB` is the `"gamma"` text node, captured before the call.
    - Expected: the reports are `{ok:true}` and then `{ok:false, reason:"dom-changed"}`; `"gamma changed"` holds no `[data-word-index]` span; and no span's text differs from the canonical word at its index.
    - Red on base: the hook and the re-check do not exist.

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
  - **(o1)** A click in an uncertified document, after the book's words have arrived, paints no highlight and commits no word (Q3). The highlight and cursor classes on the document are unchanged, and no anchor, resume anchor or explicit selection changes. Red on base in every mode. Per mode:
    - **Page (R-Q5):** the click makes exactly one cfi-only save, `updateDocProgress(docId, -1, cfi)` with the clicked span's cfi, through `onHeldWordClick`. In addition:
      - the highlight classes are unchanged;
      - `explicitSelectionAnchor`, `userExplicitSelection` and `heldClickAnchor` are unchanged;
      - `onWordClick`, `onHeldClickSave` and `onPageTurned` are not called.
    - **Page turn:** a turn onto that document also saves cfi-only, once (`updateDocProgress(docId, -1, cfi)`), with nothing left in `pendingTurnRef`.
    - **Page failure rule:** a lost save fails the row (Q1). That covers no save, a held save, or a `page-turn-lost` diagnostic.
    - **Flow and Focus:** `onHeldWordClick` saves cfi-only, once, as `updateDocProgress(docId, -1, cfi)`; `onWordClick` is not called.
    - **Narrate:** no persistence call is made, and `onWordClick` is not called.
  - **(o2)** A click in a certified document behaves as on base. This is a control and is green on base.
  - **(o3)** A restamp that certifies lifts the hold. A click before the restamp commits nothing, and a click after it commits the canonical index. Red on base, from the pre-restamp assertion.
    - **Page adds (Q1):** a turn held before the words arrive is released with its word by a certified restamp, and as cfi-only by an uncertified restamp, which also moves the document into `uncertifiedDocsRef`.
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
  - Record `stampMs` in the memo. It is recorded, not gated: the re-check is always present (Q4).
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
  - `M src/reader/modes/flow/useModeBindings.ts`
  - `M src/reader/modes/focus/useModeBindings.ts`
  - `M src/reader/modes/page/ModeRuntime.ts`
  - `M src/reader/modes/page/useModeBindings.ts`
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
  - `M docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`, only if A4's `readerModeBoundaries`/`readerModeOwnership` tests fail mechanically. Record the failure first.

  `narrate/ModeRuntime.ts` and `narrate/useModeBindings.ts` must not appear. Any path outside this list, the conditional entries and the two close-out files is a fence failure.

  The Wave A fence is the first nine `M` lines plus the two Wave A test files, the memo and the time log. Check it with `git diff --name-status c5bb507f..HEAD` at the Wave A tip.
- **Owner checks:** the OQ2, OQ5 and OQ6 items are added to release gate (2)'s list. No separate smoke run is offered.

- **Effort:** L. Technical effort: high.
- **Owners:**
  - planner (spec; registering UNCERTIFIED-ANCHOR-HOLD-1);
  - Blurby.Brain1 (Q1–Q4 and R-Q5 rulings given; STOPs; the rule 53 confirmation);
  - RodneySr implementation agents: cross-cutting for the Wave A certifier and runs; bounded for each Wave B view;
  - spec-compliance review, then quality review;
  - package verifier;
  - Blurby.Roadmap (merge go and close-out).
- **Merge order:**
  - Build-and-hold, opting out of the rule 5b auto-merge (card: "Build-and-hold; opt out of auto-main merge").
  - UNCERTIFIED-ANCHOR-HOLD-1 (Reader Engine, one commit per mode) follows directly after this item, inside each mode's ownership window (Q2).
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
  - any other item editing the four `FoliateView.tsx` files, or the Page, Flow or Focus `ModeRuntime.ts` or `useModeBindings.ts`.
- **Shared-core touches:** none.
- **Staging plan:**
  - only the exact B9 paths, staged by name;
  - no esbuild bundle, checker output, scratch profile or EPUB copy;
  - the checker's JSON and the base-red output go into the memo as text.
- **Failure handling:**
  - A2 or B1 base status differs from the lists: STOP to Brain1 before any source edit.
  - B5 shows any `ok:false` or exits 3: STOP to Brain1.
  - The live profile hash changes: STOP (LL-165).
  - A Page (o1) save is lost (no save, a held save, or `page-turn-lost`): the row fails (Q1). There is no workaround.
  - Each failing gate gets at most one retry, and only for a harness fault.

##### Blurby.Brain1 rulings Q1–Q4 (2026-11-03)

Source: `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.held-items-TQ.2026-11-03.md`, section "BLOCK-TEXT-ORDER-1 Wave B: Q1–Q4 (spec at `c0f0bbed`)". These rulings are binding, and they are applied throughout The change, Done when, the fence and the Task list.

- **Q1: Page gets a set of its own (candidate a). This revises the earlier Page mechanism.**
  - Page owns `uncertifiedDocsRef: WeakSet<Document>`, as the other modes do. It never adds an uncertified document to `rendererNumberedDocsRef`, and `:671` stays unchanged.
  - In `reportTurn`, `holdWordClick` and the section load at `:680`, a document in the set reports at once with `wordIndex: null` (cfi only). It is never held.
  - **Restamp at `:1127-1128`:**
    - a certified restamp removes the document from both sets and releases any held save with its word;
    - an uncertified restamp moves it from `rendererNumberedDocsRef` into `uncertifiedDocsRef` and releases any held save as cfi-only.

    The conditional delete is confirmed.
  - Page (o1) asserts that the cfi-only save happens. A lost save fails it.
- **Q2: the first-visible-word paths are out of this item and form a named follow-up.**
  - This item covers clicks in all four modes, plus Page's turn and click saves.
  - Flow, Focus and Narrate's soft and relocate anchor saves, and Play from the first visible word, become **UNCERTIFIED-ANCHOR-HOLD-1**: Reader Engine, one commit per mode, sequenced directly after this item inside each mode's ownership window.
  - OQ4 is delivered here for clicks and Page, and for anchors in the follow-up. The owner is told so.
- **Q3: an explicit prop (candidate a).**
  - `onHeldWordClick(cfi)` is bound in Flow's and Focus's `useModeBindings.ts`. The fence grows by those two mode-local files.
  - `onWordClick` is not overloaded. Narrate needs no prop.
  - A held click paints no highlight and commits no word; the highlight and cursor stay where they were. This is asserted in (o1) for every mode.
- **Q4: the re-check is always present (candidate a).**
  - The per-node `isConnected && data` re-check runs whatever the measured time.
  - Row (b12) drives it through the optional test-only hook `__testBetweenNodes`, which production call sites never pass. (b12) is in Wave A's red commit (A1).
  - B5 still records `stampMs`.
- **Noted as acceptable:**
  - the ICU checker approach (`node_modules/electron`, version-proved against the packaged exe, with a positive control that must exit 1);
  - census anchors that stay text-identical;
  - whichever Focus-window or restamp-currency item lands second re-greps.

**R-Q5: the Page held-click save gets its own prop (ruling (b), 2026-11-03).** Source: the same file, section "BLOCK-TEXT-ORDER-1 R-Q5 (Page held-click save)".
- **The conflict it settles.** Q1 sent a held Page click through `holdWordClick` to `onHeldClickSaveRef` (`FoliateView.tsx:577-581`). But `page/ModeRuntime.ts` `onHeldClickSave` (`:611-614`) returns at once when `heldClickAnchor` is null, and only `hardSelect` with `holdSave` sets that anchor (`:326-329`). Q3's "commits no word" therefore left no save.
- **Ruling.** Page gets its own `onHeldWordClick(cfi)` prop, bound in `page/useModeBindings.ts` and handled in `page/ModeRuntime.ts`. The fence grows by those two mode-local files.
  - The handler saves the cfi only (word index null), through the same persistence call shape as Page's held-turn save.
  - It commits no word, paints no highlight, and leaves the explicit selection and `heldClickAnchor` untouched.
- **Not (a):** routing the click through `onPageTurned` overloads the turn path and clears the selection.
- **Not (c):** it contradicts Q3.
- **Page row (o1)** asserts exactly one cfi-only save, no highlight change, and the explicit selection unchanged.
- **Noted:** UNCERTIFIED-ANCHOR-HOLD-1 sits at Seq 87.75, directly after this item, and depends on its `onCertification` gate.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | A1 red-first test files with base goldens; A2 base reds recorded | calculable | positive-control | cross-cutting | high | 45m | 60m | A |
| 2 | Main dormant `extractOrderedRuns`; four helper copies (MAIN_ACCEPT, runs, D-3) | calculable | implementation | cross-cutting | high | 40m | — | A |
| 3 | Four wrapper copies: certifier, certified branch, `onCertification`; A3–A6 | calculable | implementation | cross-cutting | high | 35m | — | A |
| 4 | B1 four runtime test files red | calculable | positive-control | bounded | medium | 40m | — | B |
| 5 | Flow, Focus and Narrate hold (`uncertifiedDocsRef`, `onHeldWordClick` prop and bindings, Q3); Page `uncertifiedDocsRef`, report-at-once and restamp move (Q1), and Page `onHeldWordClick` prop, binding and runtime handler (R-Q5); B2–B4, B6 | calculable | implementation | bounded | high | 65m | — | B |
| 6 | ICU checker with positive control and timing (B5) | calculable | verify | cross-cutting | medium | 35m | 50m | B |
| 7 | Rule 53 package pair, asar, B5 on package; arm64 launch on Rodney (B7–B8) | calculable | packaging-verify | bounded | low | 30m | — | B |
| 8 | Fence, memo and time log; push; Brain1 confirmation (B9) | calculable | docs | bounded | low | 15m | — | B |

**Total:** chain 5h00m · sum 5h00m; 0 of 8 estimated tasks calibrated (planner estimates). These are planning prices, not execution allowances.

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
