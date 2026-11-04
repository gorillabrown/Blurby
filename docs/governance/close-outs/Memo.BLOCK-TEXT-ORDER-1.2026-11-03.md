# Memo — BLOCK-TEXT-ORDER-1, Wave A (2026-11-03)

Dispatch: Wave A only (Done-when A1–A6). Wave B was not started.

| Field | Value |
|---|---|
| Spec | `4ead858a` (copy: `C:\Projects\Blurby-artifacts\block-text-order-1\spec-4ead858a.md`) |
| Contracts | `a057f5d7` (copy: `C:\Projects\Blurby-artifacts\block-text-order-1\contracts-a057f5d7.md`) |
| Branch / worktree | `eb/block-text-order-1` at `C:\Users\estra\Projects\Blurby\.worktrees\block-text-order-1` (RodneySr, x64) |
| Base | `14ce3d24` (first parent `c5bb507f`, the spec's base; second parent brings NARRATE-ARRIVAL-SYNC-1) |
| A1 red commit | `19e065d0` (the two test files alone) |
| Implementation commit | `e870ef67` |
| Host | RodneySr; Node v24.14.1; Vitest 4.1.11; `npm ci` exit 0; `node node_modules/electron/install.js` exit 0 (`path.txt` = `electron.exe`) |
| Shell | PowerShell 7 (`pwsh -NoProfile`) for every gate below |
| Pushed | No (dispatch said do not push) |

## Gates

| Gate | Command (pwsh 7, worktree root) | Exit | Result |
|---|---|---|---|
| A1 | `git diff --name-status 14ce3d24 19e065d0` | 0 | `A tests/epubOrderedBlockRuns.test.js`, `A tests/readerModes/blockTextOrder.test.ts`, nothing else |
| A2 | `npx vitest run tests/readerModes/blockTextOrder.test.ts tests/epubOrderedBlockRuns.test.js` on `19e065d0` | **1** (required 1) | 121 failed / 37 passed (158). The red and pass row sets equal the A2 lists exactly (below). No STOP. |
| A3 | same command on `e870ef67` | **0** | 158 passed (158) |
| A4 | `npx vitest run <the 15 A4 paths>` | **0** | 15 files, 155 passed |
| A4 | `git diff --exit-code c5bb507f -- <the 15 A4 paths>` | **0** | unedited |
| A5 | `git diff c5bb507f -- main/epub-word-extractor.js` | 0 | 0 removed lines, 116 added (the `extractOrderedRuns` definition and its export entry) |
| A5 | (m7) | pass | legacy plans and texts deep-equal the base literals |
| A5 | `git grep -n "extractOrderedRuns" -- main src preload.js` | 0 | exactly two lines: `main/epub-word-extractor.js:169:function extractOrderedRuns($, $root) {` and `main/epub-word-extractor.js:424:  extractOrderedRuns,` |
| A6 | `git grep -nE "modes/(page\|focus\|flow\|narrate)/" -- "src/reader/modes/*/helpers/*.ts"` at the tip | **1** | no line printed |
| A6 dry-run, base | same pattern on `c5bb507f` | 1 | no line |
| A6 dry-run, pathspec control | `git grep -c "foliateHelpers" -- "src/reader/modes/*/helpers/*.ts"` | 0 | 14 files: the pathspec matches |
| A6 dry-run, wrong variant 1 | tip plus `import … from "../../../../reader/modes/page/helpers/foliateHelpers";` appended to flow `foliateWordWrapping.ts` | 0 | the line is printed (the gate fails, as it must) |
| A6 dry-run, wrong variant 2 | tip plus `import … from "../../page/helpers/foliateHelpers";` appended instead | **1** | **not caught** (see deviation 4) |
| A6 supplementary | `git grep -nP "from \x22\.\./\.\./(page\|focus\|flow\|narrate)/" -- "src/reader/modes/*/helpers/*.ts"` | 1 at tip, 1 on base, **0** on wrong variant 2 | catches the relative sibling spelling |
| Census | `readerModeBoundaries` and `readerModeOwnership` (in A4) | 0 | pass mechanically; `boundary-policy.json` not edited |
| Typecheck | `npm run typecheck` | **0** | after the type-only change in deviation 2 |
| Suite | `npm test` | **1** | 3,203 passed / 3 failed / 1 skipped (3,207) in 234 files (233 passed, 1 failed). Base: 3,048 passed / 1 skipped; +158 new rows. **The 3 failures are inherited Page rows (rr1)–(rr3); see deviation 1.** |

Each wrong variant was restored by copying the saved file back; `git hash-object` matched the pre-edit blob.

`npm test` rewrote `tests/perf-baseline-results.json`. Its output was copied to `C:\Projects\Blurby-artifacts\block-text-order-1\perf-baseline-results.waveA.json`, and the file was restored with `git show HEAD:tests/perf-baseline-results.json > tests/perf-baseline-results.json` (clean afterwards).

Saved outputs, all in `C:\Projects\Blurby-artifacts\block-text-order-1\`:
- `A2-base-reds-19e065d0.txt` (A2 verbose);
- `A3-green.txt`;
- `A4-inherited.txt`;
- `npm-test-waveA.txt`;
- `base-goldens-capture-c5bb507f.json` (the base goldens, captured before any source edit).

## A2 output (on `19e065d0`, no source change)

Summary: `Test Files 2 failed (2)`, `Tests 121 failed | 37 passed (158)`, exit 1.

Failure reasons:
- The (m) rows, (p1), (b4), (b10) and every row that calls a new function fail as "not a function": `extractor.extractOrderedRuns`, `H.collectMainAcceptedTextNodes` or `W.certifyCanonicalAlignment`.
- (m8) fails because `git grep` exits 1, with no match on the base.
- The rest fail on their assertions:
  - DOM order and spans: (b1)–(b3);
  - an empty `onCertification` report list: the `-certified` rows, (b7), (b8), (b12), (c2);
  - legacy order: (c3), (d6), (d8);
  - missing `runOrdinal`/`runId`: (d1)–(d5);
  - breaks: (d7).

Row status (each TS row runs once per mode copy; (d7) runs for Flow and Focus):

- **Red, exactly the A2 list:** (a1), (a2), (a3), (a4), (a5), (a6), (p1), (b1), (b2), (b3), (b4), (b5-certified), (b6-certified), (b7), (b8), (b9-certified), (b10), (b11-certified), (b12), (c2), (c3), (d1)–(d8), (m1)–(m6), (m8).
- **Pass, exactly the A2 list:** (a1-control), (a3-control), (b4-control), (b5-dom), (b6-dom), (b9-dom), (b11-dom), (c1), (d6-control), (m7).
- No row was mixed across modes, and no row was unlisted.

Verbatim result lines (timings stripped; `BTO` = `tests/readerModes/blockTextOrder.test.ts > BLOCK-TEXT-ORDER-1 —`, `ORDERED-RUNS` = `tests/epubOrderedBlockRuns.test.js > … main extractOrderedRuns >`):

```
× ORDERED-RUNS (m1) runs split on nested entry and exit
× ORDERED-RUNS (m2) touching text, no whitespace inserted
× ORDERED-RUNS (m3) empty and suppressed nested blocks split runs
× ORDERED-RUNS (m4) suppressed inline does not split
× ORDERED-RUNS (m5) orphan root text keeps its DOM position (blank root text dropped)
× ORDERED-RUNS (m6) cue offset
✓ ORDERED-RUNS (m7) legacy plans byte-equivalent
× ORDERED-RUNS (m8) extractWords is not routed through the helper
× BTO page copy > (a1) referenced plain-ID target is not main-accepted
✓ BTO page copy > (a1-control) legacy fallback still accepts it
× BTO page copy > (a2) target after the body text
× BTO page copy > (a3) root-level noteref marker is main-accepted (D2)
✓ BTO page copy > (a3-control) legacy fallback rejects the marker
× BTO page copy > (a4) semantic footnote unchanged
× BTO page copy > (a5) no CSS/aside broadening
× BTO page copy > (a6) blank root text dropped
× BTO page copy > (p1) main/renderer accepted-text parity
× BTO page copy > (b1) nested before/inside/after is stamped in DOM order
× BTO page copy > (b2) duplicate text under a plain-ID target
× BTO page copy > (b3) missing word is not consumed
× BTO page copy > (b4) certifier fails closed instead of skipping
✓ BTO page copy > (b4-control) uncertified section keeps legacy stamping exactly
✓ BTO page copy > (b5-dom) repeated words in order: DOM equals the base
× BTO page copy > (b5-certified) repeated words in order are certified
✓ BTO page copy > (b6-dom) drop cap across nodes: DOM equals the base
× BTO page copy > (b6-certified) drop cap across nodes is certified
× BTO page copy > (b7) extra renderer text
× BTO page copy > (b8) D2 marker is stamped, not skipped
✓ BTO page copy > (b9-dom) flat-section byte identity: DOM equals the base
× BTO page copy > (b9-certified) flat section is certified
× BTO page copy > (b10) canonical parity with real main output
✓ BTO page copy > (b11-dom) D4 parser divergence: DOM equals the base
× BTO page copy > (b11-certified) D4 parser divergence fails closed
× BTO page copy > (b12) dom-changed stops stamping with no span at a stale offset
✓ BTO page copy > (c1) empty canonical slice gives today's fallback numbering
× BTO page copy > (c2) mismatched canonical gives the legacy path
× BTO page copy > (c3) nested fallback numbering follows DOM order
× BTO page copy > (d1) runs split on nested entry and exit
× BTO page copy > (d2) touching text, no whitespace inserted
× BTO page copy > (d3) empty and suppressed nested blocks split runs
× BTO page copy > (d4) suppressed inline does not split
× BTO page copy > (d5) orphan root text keeps its DOM position
× BTO page copy > (d6) continuation adds no paragraph break
✓ BTO page copy > (d6-control) flat paragraphs unchanged
× BTO page copy > (d8) heading split by a nested block
× BTO focus copy > (a1) referenced plain-ID target is not main-accepted
✓ BTO focus copy > (a1-control) legacy fallback still accepts it
× BTO focus copy > (a2) target after the body text
× BTO focus copy > (a3) root-level noteref marker is main-accepted (D2)
✓ BTO focus copy > (a3-control) legacy fallback rejects the marker
× BTO focus copy > (a4) semantic footnote unchanged
× BTO focus copy > (a5) no CSS/aside broadening
× BTO focus copy > (a6) blank root text dropped
× BTO focus copy > (p1) main/renderer accepted-text parity
× BTO focus copy > (b1) nested before/inside/after is stamped in DOM order
× BTO focus copy > (b2) duplicate text under a plain-ID target
× BTO focus copy > (b3) missing word is not consumed
× BTO focus copy > (b4) certifier fails closed instead of skipping
✓ BTO focus copy > (b4-control) uncertified section keeps legacy stamping exactly
✓ BTO focus copy > (b5-dom) repeated words in order: DOM equals the base
× BTO focus copy > (b5-certified) repeated words in order are certified
✓ BTO focus copy > (b6-dom) drop cap across nodes: DOM equals the base
× BTO focus copy > (b6-certified) drop cap across nodes is certified
× BTO focus copy > (b7) extra renderer text
× BTO focus copy > (b8) D2 marker is stamped, not skipped
✓ BTO focus copy > (b9-dom) flat-section byte identity: DOM equals the base
× BTO focus copy > (b9-certified) flat section is certified
× BTO focus copy > (b10) canonical parity with real main output
✓ BTO focus copy > (b11-dom) D4 parser divergence: DOM equals the base
× BTO focus copy > (b11-certified) D4 parser divergence fails closed
× BTO focus copy > (b12) dom-changed stops stamping with no span at a stale offset
✓ BTO focus copy > (c1) empty canonical slice gives today's fallback numbering
× BTO focus copy > (c2) mismatched canonical gives the legacy path
× BTO focus copy > (c3) nested fallback numbering follows DOM order
× BTO focus copy > (d1) runs split on nested entry and exit
× BTO focus copy > (d2) touching text, no whitespace inserted
× BTO focus copy > (d3) empty and suppressed nested blocks split runs
× BTO focus copy > (d4) suppressed inline does not split
× BTO focus copy > (d5) orphan root text keeps its DOM position
× BTO focus copy > (d6) continuation adds no paragraph break
✓ BTO focus copy > (d6-control) flat paragraphs unchanged
× BTO focus copy > (d8) heading split by a nested block
× BTO flow copy > (a1) referenced plain-ID target is not main-accepted
✓ BTO flow copy > (a1-control) legacy fallback still accepts it
× BTO flow copy > (a2) target after the body text
× BTO flow copy > (a3) root-level noteref marker is main-accepted (D2)
✓ BTO flow copy > (a3-control) legacy fallback rejects the marker
× BTO flow copy > (a4) semantic footnote unchanged
× BTO flow copy > (a5) no CSS/aside broadening
× BTO flow copy > (a6) blank root text dropped
× BTO flow copy > (p1) main/renderer accepted-text parity
× BTO flow copy > (b1) nested before/inside/after is stamped in DOM order
× BTO flow copy > (b2) duplicate text under a plain-ID target
× BTO flow copy > (b3) missing word is not consumed
× BTO flow copy > (b4) certifier fails closed instead of skipping
✓ BTO flow copy > (b4-control) uncertified section keeps legacy stamping exactly
✓ BTO flow copy > (b5-dom) repeated words in order: DOM equals the base
× BTO flow copy > (b5-certified) repeated words in order are certified
✓ BTO flow copy > (b6-dom) drop cap across nodes: DOM equals the base
× BTO flow copy > (b6-certified) drop cap across nodes is certified
× BTO flow copy > (b7) extra renderer text
× BTO flow copy > (b8) D2 marker is stamped, not skipped
✓ BTO flow copy > (b9-dom) flat-section byte identity: DOM equals the base
× BTO flow copy > (b9-certified) flat section is certified
× BTO flow copy > (b10) canonical parity with real main output
✓ BTO flow copy > (b11-dom) D4 parser divergence: DOM equals the base
× BTO flow copy > (b11-certified) D4 parser divergence fails closed
× BTO flow copy > (b12) dom-changed stops stamping with no span at a stale offset
✓ BTO flow copy > (c1) empty canonical slice gives today's fallback numbering
× BTO flow copy > (c2) mismatched canonical gives the legacy path
× BTO flow copy > (c3) nested fallback numbering follows DOM order
× BTO flow copy > (d1) runs split on nested entry and exit
× BTO flow copy > (d2) touching text, no whitespace inserted
× BTO flow copy > (d3) empty and suppressed nested blocks split runs
× BTO flow copy > (d4) suppressed inline does not split
× BTO flow copy > (d5) orphan root text keeps its DOM position
× BTO flow copy > (d6) continuation adds no paragraph break
✓ BTO flow copy > (d6-control) flat paragraphs unchanged
× BTO flow copy > (d8) heading split by a nested block
× BTO narrate copy > (a1) referenced plain-ID target is not main-accepted
✓ BTO narrate copy > (a1-control) legacy fallback still accepts it
× BTO narrate copy > (a2) target after the body text
× BTO narrate copy > (a3) root-level noteref marker is main-accepted (D2)
✓ BTO narrate copy > (a3-control) legacy fallback rejects the marker
× BTO narrate copy > (a4) semantic footnote unchanged
× BTO narrate copy > (a5) no CSS/aside broadening
× BTO narrate copy > (a6) blank root text dropped
× BTO narrate copy > (p1) main/renderer accepted-text parity
× BTO narrate copy > (b1) nested before/inside/after is stamped in DOM order
× BTO narrate copy > (b2) duplicate text under a plain-ID target
× BTO narrate copy > (b3) missing word is not consumed
× BTO narrate copy > (b4) certifier fails closed instead of skipping
✓ BTO narrate copy > (b4-control) uncertified section keeps legacy stamping exactly
✓ BTO narrate copy > (b5-dom) repeated words in order: DOM equals the base
× BTO narrate copy > (b5-certified) repeated words in order are certified
✓ BTO narrate copy > (b6-dom) drop cap across nodes: DOM equals the base
× BTO narrate copy > (b6-certified) drop cap across nodes is certified
× BTO narrate copy > (b7) extra renderer text
× BTO narrate copy > (b8) D2 marker is stamped, not skipped
✓ BTO narrate copy > (b9-dom) flat-section byte identity: DOM equals the base
× BTO narrate copy > (b9-certified) flat section is certified
× BTO narrate copy > (b10) canonical parity with real main output
✓ BTO narrate copy > (b11-dom) D4 parser divergence: DOM equals the base
× BTO narrate copy > (b11-certified) D4 parser divergence fails closed
× BTO narrate copy > (b12) dom-changed stops stamping with no span at a stale offset
✓ BTO narrate copy > (c1) empty canonical slice gives today's fallback numbering
× BTO narrate copy > (c2) mismatched canonical gives the legacy path
× BTO narrate copy > (c3) nested fallback numbering follows DOM order
× BTO narrate copy > (d1) runs split on nested entry and exit
× BTO narrate copy > (d2) touching text, no whitespace inserted
× BTO narrate copy > (d3) empty and suppressed nested blocks split runs
× BTO narrate copy > (d4) suppressed inline does not split
× BTO narrate copy > (d5) orphan root text keeps its DOM position
× BTO narrate copy > (d6) continuation adds no paragraph break
✓ BTO narrate copy > (d6-control) flat paragraphs unchanged
× BTO narrate copy > (d8) heading split by a nested block
× BTO flow paragraph-start collector > (d7) fallback flags equal canonical collector breaks
× BTO focus paragraph-start collector > (d7) fallback flags equal canonical collector breaks
```

## What changed (fence: `git diff --name-status 14ce3d24..HEAD` before this memo)

```
M	main/epub-word-extractor.js
M	src/reader/modes/flow/helpers/foliateHelpers.ts
M	src/reader/modes/flow/helpers/foliateWordWrapping.ts
M	src/reader/modes/focus/helpers/foliateHelpers.ts
M	src/reader/modes/focus/helpers/foliateWordWrapping.ts
M	src/reader/modes/narrate/helpers/foliateHelpers.ts
M	src/reader/modes/narrate/helpers/foliateWordWrapping.ts
M	src/reader/modes/page/helpers/foliateHelpers.ts
M	src/reader/modes/page/helpers/foliateWordWrapping.ts
A	tests/epubOrderedBlockRuns.test.js
A	tests/readerModes/blockTextOrder.test.ts
```

These are the first nine `M` lines of B9 plus the two Wave A test files: the Wave A fence. This memo and the time log are the only other additions.

`c5bb507f..HEAD` also lists the six NARRATE-ARRIVAL-SYNC-1 files that `14ce3d24` merged in. The fence is therefore checked against `14ce3d24`, as the dispatch directs.

**Item 1, main.** `extractOrderedRuns($, $root)` is added after `extractBlockPlans`.
- It returns `{ runs: [{runOrdinal, blockTag, text, start}], cues: [{runOrdinal, offset, text}] }`.
- It mirrors `walk`/`walkInline` acceptance and reuses `isFootnoteBodyNode`, `isLikelyFootnoteRef`, `buildFootnoteTargetTextMap`, `normalizeHash` and `attr`.
- A run ends on the entry or exit of any BLOCK_TAGS element, including a skipped subtree that contains one.
- It is exported. It has no caller.

**Item 2, four helpers.**
- New: `collectFootnoteTargetIds`, `collectMainAcceptedTextNodes`, and a private `isMainAcceptedTextNode` (MAIN_ACCEPT A-1, rules 1–4).
- `collectBlockTextNodes(root, sectionIndex = 0, acceptance = "fallback")` now returns raw runs in DOM order (D-1), with `runOrdinal`/`runId`. The `"main"` value is used only by (p1).
- The fallback acceptance is the legacy predicate, unchanged (A-3, OQ1).
- `FoliateWord` gains `runOrdinal?`/`runId?` (D-6).
- `extractWordsFromView`/`extractWordsFromSection` apply D-3 through a private `buildSectionWords`.
- The BLOCK_TAGS line is text-identical.
- Flow, Focus and Narrate are one blob (`a5c22bbd`). Page equals them plus its own 21 lines (`textOffsetBefore`, `findWordSpanInTextRange`).
- No sibling import.

**Item 3, four wrappers** (one blob in all four copies).
- `certifyCanonicalAlignment` (B.2, no lookahead, no skip) with a private `wordFree`. The `Intl.Segmenter` is built inside `wordFree`, with an early `true` for an empty or whitespace-only gap (no word-like segment is possible there).
- `wrapWordsInSpans(..., onCertification?, options = {})`:
  - it reports once, synchronously, before any await;
  - the certified branch stamps synchronously through `buildWrappedFragmentForNode` (`nodeStart = 0`, `globalOffset + i`, `makeFoliateTokenId(sectionIndex, i)`);
  - before each node it re-checks `isConnected && data === capturedText[k]`, and stops with a second `{ok:false, reason:"dom-changed"}` on a mismatch;
  - it calls `__testBetweenNodes(k)` between certified nodes;
  - it returns `globalOffset + canonical.length`.
- The uncertified path is today's code, unchanged. The only removed line in each wrapper diff is the closing line of the function's doc comment, which was extended. `contentAlignWords` and the census-anchored yield line are text-identical (`git grep -c -F` = 1 per copy).

## Deviations and findings

1. **Inherited Page rows (rr1)–(rr3) fail on the Wave A tip: for Blurby.Brain1 before Wave B.**
   - **The rows.** `tests/readerModes/pagePositionSave.test.tsx`, RESTAMP-RERUN-RACE-1 (rr1), (rr2) and (rr3), assert the precondition `k1: run 1 is parked at its first yield` (`spansOf(doc).length === 50`, from 160 one-word paragraphs, `WRAP_BATCH_SIZE` 50).
   - **The conflict.** Their fixture certifies, and TQ-B3/Q4 rule that the certified branch never yields. Run 1 therefore stamps all 160 spans before the second identity arrives, and k1 reads 160.
   - **Evidence that only the precondition fails.** On an uncommitted scratch copy with k1 made soft (deleted afterwards), the only failing checks were k1 and the rows' own `expect(window).toBe(50)`. The numbering (o1–o4), (o6), "run 2 ran on the document" and (rr3)'s single save with no `page-turn-lost` all passed.
   - **What was not done.** The inherited file was not edited (standing rule 50), and the certified branch was not given a yield (TQ-B3).
   - **Scope.** `pagePositionSave.test.tsx` is outside A4's list but inside B3's and B4's. So `npm test` exits 1 at this tip, and B3/B4 cannot pass as written.
   - **The question.** It needs a ruling, for example: drive (rr1)–(rr3) through an uncertified section, so the legacy path still yields; or amend their k1 precondition. Both edit an inherited row.
2. **Type-only change for an inherited typecheck.**
   - `tests/readerModes/blockTagCase.test.ts` types all five copies as `typeof focusCollect`, including the unchanged legacy `src/utils/foliateHelpers.ts`. With required `runOrdinal`/`runId` in the return type, `npm run typecheck` exited 2 (TS2345 at :39, :44, :51).
   - The four copies now return `BlockTextRun[]`. Its `runOrdinal?`/`runId?` are typed optional and always set at runtime.
   - Typecheck then exits 0. Behaviour and every row are unchanged.
3. **(m5) test correction after A2.**
   - (m5)'s second assertion was beyond the contract, and it was wrong: it expected `"\nlead"` to be trimmed, but a non-blank root text node is accepted whole, by main and by MAIN_ACCEPT alike.
   - It was replaced in `e870ef67` with `"\n<p>mid</p>\n"` giving one run, `"mid"`.
   - On the base the row was red for "not a function" before reaching that line, so the A2 status is unchanged. No golden was touched.
4. **The A6 pattern misses the relative sibling spelling.**
   - `modes/(page|focus|flow|narrate)/` catches only an import spelled through `modes/`. A sibling import written `"../../page/helpers/…"` (wrong variant 2) exits 1, the same as a pass.
   - The supplementary `-P` gate above catches it and finds nothing at the tip or on the base.
   - Recommend that Wave B's B6 add it.
5. **Main extraction in a child Node process.**
   - Under Vitest's jsdom environment, adm-zip reads no entries from a Buffer, so main `extractWords` returned an empty book in-process.
   - (b10) and (b11) therefore run main's `extractWords` in a child `node` process. It writes the three-file EPUB (container.xml, OPF, XHTML) with adm-zip to `os.tmpdir()`/`mkdtemp` and returns the JSON.
   - The child is plain Node (ICU of Node 24), not Electron (LL-160). The fixtures are ASCII, so B5 remains the ICU proof.
6. **blockOrdinal over blank runs.**
   - D-2 says both "first-encounter order across emitted runs" and "equals today's value". These differ only when a block's first accepted text is whitespace, as with body-level newlines between paragraphs.
   - Ordinals are assigned on the first accepted text node, which is today's rule. `blockId` values in real books are therefore byte-identical to today.
7. **Cue placement in `extractOrderedRuns`** (dormant; only (m6) tests it).
   - A cue inside a run that is not emitted (all whitespace) is placed at the end of the previous emitted run, or at offset 0 of the next one when none came before.
   - With no emitted run at all, its `runOrdinal` is -1.
8. **(m1)–(m5) compare with literals.** They use the D.3 renderer expectations as literals. The live main/renderer comparison is (p1), over (a1)–(a6), in all four copies.

No STOP was triggered: A2's base status matched exactly. Deviation 1 is reported for a ruling, not resolved here.

## Test counts

| Run | Passed | Failed | Skipped | Files |
|---|---|---|---|---|
| Base (spec) | 3,048 | 0 | 1 | — |
| Wave A tip `npm test` | 3,203 | 3 ((rr1)–(rr3)) | 1 | 234 (1 failed) |
| A3 | 158 | 0 | 0 | 2 |
| A4 | 155 | 0 | 0 | 15 |
