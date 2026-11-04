# Memo — BLOCK-TEXT-ORDER-1, Waves A and B (2026-11-03)

Dispatch: Wave A (Done-when A1–A6), then Wave B (B1–B9). B8 (the native arm64 launch on Rodney) is not part of this run. Wave B is recorded from "Wave B" below.

| Field | Value |
|---|---|
| Spec | `4ead858a` (copy: `C:\Projects\Blurby-artifacts\block-text-order-1\spec-4ead858a.md`) |
| Contracts | `a057f5d7` (copy: `C:\Projects\Blurby-artifacts\block-text-order-1\contracts-a057f5d7.md`) |
| Branch / worktree | `eb/block-text-order-1` at `C:\Users\estra\Projects\Blurby\.worktrees\block-text-order-1` (RodneySr, x64) |
| Base | `14ce3d24` (first parent `c5bb507f`, the spec's base; second parent brings NARRATE-ARRIVAL-SYNC-1) |
| A1 red commit | `19e065d0` (the two test files alone) |
| Implementation commit | `e870ef67` |
| Ruling commit | `bc4b40ca`, the commit that added this row: Blurby.Brain1's ruling on deviation 1, option (a), a named rule-50 exception (fixture only), plus the (rr-c) control and the B6 supplementary gate. It touches `tests/readerModes/pagePositionSave.test.tsx` and this memo only. |
| Wave B commits | `dcfb18ae` (B1, the four `blockTextOrderHold.*` test files alone); `81bef438` (items 4–8); `19771a47` ((rr3), named rule-50 exception); `4a0b2e28` (B5 checker, committed by the coordinator); `1a1c3845` (records: Wave B, B5, B7 tip, fence); then the commit that adds the B7 main half |
| Host | RodneySr; Node v24.14.1; Vitest 4.1.11; `npm ci` exit 0; `node node_modules/electron/install.js` exit 0 (`path.txt` = `electron.exe`) |
| Shell | PowerShell 7 (`pwsh -NoProfile`) for every gate below |
| Pushed | No (the coordinator pushes) |

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
| A6 supplementary (first form) | `git grep -nP "from \x22\.\./\.\./(page\|focus\|flow\|narrate)/" -- "src/reader/modes/*/helpers/*.ts"` | 1 at tip, 1 on base, **0** on wrong variant 2 | catches the relative sibling spelling (double quotes only); superseded by the B6 gate below |
| **B6 supplementary gate** (named, per the ruling) | `git grep -nP "from [\x22\x27]\.\./\.\./(page\|focus\|flow\|narrate)/" -- "src/reader/modes/*/helpers/*.ts"` | **1** at tip, **1** on `c5bb507f`, **0** on each plant | see "B6 supplementary gate" below; plants removed, blob identical |
| Census | `readerModeBoundaries` and `readerModeOwnership` (in A4) | 0 | pass mechanically; `boundary-policy.json` not edited |
| Typecheck (Wave A) | `npm run typecheck` | **0** | after the type-only change in deviation 2 |
| Suite (Wave A, before the ruling) | `npm test` | **1** | 3,203 passed / 3 failed / 1 skipped (3,207) in 234 files (233 passed, 1 failed). Base: 3,048 passed / 1 skipped; +158 new rows. The 3 failures were inherited Page rows (rr1)–(rr3); see deviation 1. |
| **Typecheck (ruling)** | `npm run typecheck` | **0** | on the ruling tree |
| **Suite (ruling)** | `npm test` | **0** | **3,207 passed / 1 skipped (3,208) in 234 files (234 passed)**: (rr1)–(rr3) pass again, plus the new (rr-c) row |

Each wrong variant was restored by copying the saved file back; `git hash-object` matched the pre-edit blob.

`npm test` rewrote `tests/perf-baseline-results.json`. Its output was copied to `C:\Projects\Blurby-artifacts\block-text-order-1\perf-baseline-results.waveA.json`, and the file was restored with `git show HEAD:tests/perf-baseline-results.json > tests/perf-baseline-results.json` (clean afterwards).

Saved outputs, all in `C:\Projects\Blurby-artifacts\block-text-order-1\`:
- `A2-base-reds-19e065d0.txt` (A2 verbose);
- `A3-green.txt`;
- `A4-inherited.txt`;
- `npm-test-waveA.txt`;
- `base-goldens-capture-c5bb507f.json` (the base goldens, captured before any source edit);
- ruling: `npm-test-waveA-rr-ruling.txt`, `typecheck-waveA-rr-ruling.txt`, `perf-baseline-results.waveA-rr-ruling.json` (the perf file was restored from HEAD afterwards; clean), `B6-supplementary-gate-dryrun.txt`, and `rr-certifier-reason-probe.test.ts` with its output `rr-certifier-reason-probe.txt` (the probe ran once as an uncommitted scratch test and was then deleted from the worktree).

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

1. **Inherited Page rows (rr1)–(rr3) failed on the Wave A tip. Resolved by Blurby.Brain1's ruling, option (a); see "Rule-50 exception (rr1)–(rr3)" below.**
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
   - Per the ruling it is now the named B6 supplementary gate (below), widened to single quotes as well.
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

No STOP was triggered: A2's base status matched exactly. Deviation 1 was reported for a ruling and is resolved by the ruling commit.

## Rule-50 exception (rr1)–(rr3) (Blurby.Brain1 ruling, option (a), fixture only)

**The exception.** Standing rule 50 (inherited rows run unedited) is waived for one line in `tests/readerModes/pagePositionSave.test.tsx`, RESTAMP-RERUN-RACE-1: the (rr) fixture's canonical words. The rows' actions and assertions, (rr1)–(rr3) and the shared `rerun` helper, are byte-identical. `git diff -U0` shows one removed line, and that line is the fixture.

**Before** (`14ce3d24`, line 893):

```ts
    const getCanonicalSectionWords = (i: number) => (i === 3 ? longWords : undefined);
```

**After:**

```ts
    // BLOCK-TEXT-ORDER-1 (Brain1 ruling, rule-50 exception, fixture only): main's slice carries one word the section's
    // DOM lacks (contract A.1 D2: main emits a noteref's "1" that the renderer does not render), so the certifier
    // fails closed with canonical-exhausted-dom and these rows keep exercising the legacy wrap, which yields.
    const getCanonicalSectionWords = (i: number) => (i === 3 ? [...longWords, "1"] : undefined);
    const certifyingSectionWords = (i: number) => (i === 3 ? longWords : undefined);
```

(`certifyingSectionWords` is the old fixture under a new name. Only the new (rr-c) row uses it.)

**The certifier's reason: `canonical-exhausted-dom`.** The probe ran `wrapWordsInSpans(doc, 3, 20, [], canonical, report)` on the rows' DOM (160 `<p>Word{i}</p>`). It reported:
- (rr) fixture: `[{"ok":false,"reason":"canonical-exhausted-dom","canonicalIndex":160,"nodeIndex":160}]`, then the legacy wrap stamped 160 spans, indices 20…179, return 180;
- (rr-c) fixture: `[{"ok":true}]`, 160 spans, 20…179, return 180.

**Why this class, and not D1 or `extra-source-text`.** The ruling preferred D1 or an extra-source-text case, but neither can be reached by changing the canonical words alone, with the assertions unchanged.
- Both need a slice that lacks text the DOM has. For example, D1 is a plain-ID footnote target that main suppresses.
- The DOM is fixed at 160 one-word paragraphs. Legacy `contentAlignWords` numbers each span `globalOffset + canonicalCursor`, and it stamps nothing for DOM text it cannot match.
- So a word missing from the slice either drops a span or shifts every later index. Either way, o1 (160 spans) or o3 (`[start + i, Word{i}]`) fails.
- Any word inserted before position 160 shifts the indices too. So the only slice that keeps o1–o4 and fails certification adds words after `Word159`. The certifier reports exactly that case as `canonical-exhausted-dom`.
- The added word `"1"` is a real divergence: D2 in contract A.1. Main's `walk()` emits a noteref's digit (`Lead <a epub:type="noteref" …>1</a> tail` gives the word `1`) that the section's DOM does not carry as an accepted word.
- The legacy return value (`globalOffset + canonicalCursor` = 180) is the same as before. Page's `FoliateView` does not read it; it awaits the wrap only.

**Other users of the fixture.**
- (rr4) asks only for section 1, so it gets `undefined` and is unaffected.
- (rr5) now takes the legacy wrap for section 3. That is the path every Page load took on the base, and the row passes unchanged (`expectBookNumbering(doc, 20)`).

**The (rr-c) control** (new row, same file): `(rr-c) control: on a certifying slice the rerun during the wrap stamps each run's 160 spans once, in turn, and saves once`.
- The sequence is the same as `rerun(structuredClone(S1), true)`:
  1. mount, load section 3 and settle (renderer numbering 0, 1, 2);
  2. hold a turn on span 2 and click "Next page" (no save);
  3. fake the timeouts and render S1, then set the probe and render `structuredClone(S1)`;
  4. drain, and check the probe is gone ("run 2 ran on the document").
- It passes `certifyingSectionWords` explicitly. It has no k1 check: it asserts that run 1 is not parked (`spansOf(doc).length === 160` right after the first render), because the certified wrap makes no yield.
- A `MutationObserver` on `body` records every `span.page-word` added after the load. It must equal `[20…179, 20…179]`: each run stamps its 160 spans exactly once, in order, and the two runs do not interleave.
- Then it checks `expectBookNumbering(doc, 20)` (o1–o4), `expectNoIndexDuplicates` (o6), exactly one save `[["doc-1", 22, "cfi:3:Word2"]]`, and no `page-turn-lost`.
- **Sensitivity.** With (rr-c) temporarily pointed at the uncertified fixture, it failed on `expected 50 to be 160`, as it must. The file was restored, and its SHA-256 was unchanged (`b28fd347…`).

## B6 supplementary gate (named; recorded now for Wave B)

```
git grep -nP "from [\x22\x27]\.\./\.\./(page|focus|flow|narrate)/" -- "src/reader/modes/*/helpers/*.ts"
```

It runs beside B6's `modes/(page|focus|flow|narrate)/` pattern and catches the relative sibling spelling `"../../<mode>/"` or `'../../<mode>/'`, which that pattern misses (deviation 4). Exit 1 with no line is a pass.

Dry runs (pwsh 7, `git grep` from the worktree root; script output in `B6-supplementary-gate-dryrun.txt`):

| Run | Exit | Lines |
|---|---|---|
| Tip (working tree) | 1 | none |
| Base `c5bb507f` | 1 | none |
| Plant: `import { BLOCK_TAGS as PAGE_BLOCK_TAGS } from "../../page/helpers/foliateHelpers";` appended to `src/reader/modes/flow/helpers/foliateWordWrapping.ts` | **0** | `src/reader/modes/flow/helpers/foliateWordWrapping.ts:283:import { BLOCK_TAGS as PAGE_BLOCK_TAGS } from "../../page/helpers/foliateHelpers";` |
| Plant: the same import with single quotes | **0** | `…foliateWordWrapping.ts:283:import { BLOCK_TAGS as PAGE_BLOCK_TAGS } from '../../page/helpers/foliateHelpers';` |
| Tip after the plant was removed | 1 | none |

The plant was removed by writing the saved bytes back. `git hash-object` gave `543482dd7f82f950f498dfac4731b7818ce3f229` before and after, and `git status --short` showed only the ruling's test edit.

## Test counts

| Run | Passed | Failed | Skipped | Files |
|---|---|---|---|---|
| Base (spec) | 3,048 | 0 | 1 | — |
| Wave A tip `npm test` | 3,203 | 3 ((rr1)–(rr3)) | 1 | 234 (1 failed) |
| Ruling tree `npm test` | 3,207 | 0 | 1 | 234 (0 failed) |
| RESTAMP-RERUN-RACE-1 block alone (ruling tree) | 7 ((rc0), (rr1)–(rr3), (rr-c), (rr4), (rr5)) | 0 | — | 1 |
| A3 | 158 | 0 | 0 | 2 |
| A4 | 155 | 0 | 0 | 15 |

## Wave B

Host and shell as for Wave A (RodneySr x64, `pwsh -NoProfile`). Saved outputs are in `C:\Projects\Blurby-artifacts\block-text-order-1\`.

### B1 base reds (on `dcfb18ae`, the four test files alone)

`npx vitest run` on the four `tests/readerModes/blockTextOrderHold.*.test.tsx` files exits **1**: 18 failed, 5 passed (23). Output: `B1-base-reds.txt`.

| Row | Page | Flow | Focus | Narrate |
|---|---|---|---|---|
| (o1) click | red | red | red | red |
| (o1) turn | red | — | — | — |
| (o2) certified control | green | green | green | green |
| (o3) restamp lifts the hold | red | red | red | red |
| (o3) turn | red | — | — | — |
| (o4) late superseded report | red | red | red | red |
| (o5) no slice | red | red | red | red (observed) |
| (o6) engine-cursor save | — | — | — | green |

This matches the spec's list. In the Page (o3) turn row, the certified half is green on the base and the uncertified half is red. No STOP.

### Implementation (`81bef438`, items 4–8)

The four `FoliateView.tsx` views, the Page, Flow and Focus `ModeRuntime.ts`, and the Page, Flow and Focus `useModeBindings.ts`. Narrate's `ModeRuntime.ts` and `useModeBindings.ts` are not edited: no commit of this item touches them, and `narrate/ModeRuntime.ts` appears in `c5bb507f..HEAD` only through the `14ce3d24` merge.

### (rr3) under the named rule-50 exception (`19771a47`)

With the hold in place, (rr3) failed only on its saved word index, which became -1 (a cfi-only save), as anticipated. No other (rr) row failed. Only the expected value changed:

- before: `[["doc-1", 22, "cfi:3:Word2"]]`
- after: `[["doc-1", -1, "cfi:3:Word2"]]`

The row's title still says "with its re-stamped index", because only the value could change.

### Gates

| Gate | Command (pwsh 7, worktree root) | Exit | Result |
|---|---|---|---|
| B1 | the four hold files on `dcfb18ae` | **1** (required 1) | 18 failed / 5 passed (23), exactly the list above |
| B2 | the same command on the tip | **0** | 23 passed (`B2-green.txt`) |
| B3 tests | the eight B3 paths | **0** | 8 files, 150 passed |
| B3 diff | `git diff --exit-code c5bb507f -- <B3 paths>` | **1** | only `tests/readerModes/pagePositionSave.test.tsx` differs, from the two named rule-50 exceptions ((rr) fixture, (rr3) value) and the (rr-c) row; each of the other seven paths exits 0 (`B3-diff.txt`) |
| A4 again | the 15 A4 paths | **0** | 155 passed; its `git diff --exit-code` exits 0 |
| B4 | `npm test` | **0** | 3,230 passed / 1 skipped in 238 files (base 3,048) (`npm-test-waveB.txt`) |
| B4 | `npm run typecheck` | **0** | `typecheck-waveB.txt` |
| B4 | `npm run build` | **0** | `build-waveB.txt` |
| B6 | A6 pattern | **1** | no line (pass) |
| B6 | supplementary `-P` gate | **1** | no line (pass) |
| B6 | shared-core `git diff --exit-code c5bb507f -- <B6 paths>` | **0** | unedited |

Every cited line was re-grepped on `c5bb507f` and matched. `npm test` rewrote `tests/perf-baseline-results.json`; its output was saved as `perf-baseline-results.waveB.json`, and the file was restored from HEAD.

### Wave B deviations

1. **The fixture slice.** The (c2) body `<p>a b</p>` with its own slice `["x","y"]` stamps no spans, so there is nothing to click. The rows use the (c2) body with the slice `["a","x","b"]` instead. It fails certification as `unmatched-source-word`, and the legacy wrap still stamps "b" as 22, the wrong index.
2. **(o4).** Certification reports arrive synchronously, so a superseded wrap cannot report late on its own. The rows capture each `onCertification` callback through a pass-through `vi.mock` of the mode's wrapper, then call the stale one late.
3. **(o6).** It drives the Narrate runtime with the play-first-text fake view API, because playback cannot run in jsdom with the real view. The real view is mounted for (o1)–(o5).
4. **Binding check.** Each binding's `onHeldWordClick` is checked inside (o1) with a stub runtime, so no row the spec does not list was added.

## B5. Electron ICU checker

Command: `pwsh -NoProfile -File scripts/block-text-order/icu-certify/run.ps1 -packaged <exe> [-control] -out <scratch>`, against the rebuilt tip package `release\win-unpacked\Blurby.exe` (see "Package verification"). APPDATA and LOCALAPPDATA pointed into the scratch folder for every launch, and the checker sets its own `userData` there too. Free space on C: was checked before each launch (2.82 GB).

**Control first** (standing rule 55): exit **1**. Section 17 (the largest; the control drops its last canonical word) fails with `extra-source-text` in all four copies (`B5-control-run3.json`):

```json
{"electron":"42.11.18","icu":"78.2","control":true,"controlSection":17,
 "packaged":{"electron":"42.11.18","icu":"78.2"},"renderer":{"electron":"42.11.18","icu":"78.2"},
 "mainLocale":"en-US","rendererLocale":"en-US","sections":19,"withSlice":18,
 "certified":{"page":17,"focus":17,"flow":17,"narrate":17},
 "failures":[{"mode":"page","sectionIndex":17,"reason":"extra-source-text","canonicalIndex":7170,"nodeIndex":2004},
             {"mode":"focus","sectionIndex":17,"reason":"extra-source-text","canonicalIndex":7170,"nodeIndex":2004},
             {"mode":"flow","sectionIndex":17,"reason":"extra-source-text","canonicalIndex":7170,"nodeIndex":2004},
             {"mode":"narrate","sectionIndex":17,"reason":"extra-source-text","canonicalIndex":7170,"nodeIndex":2004}],
 "largest":{"sectionIndex":17,"words":7170,"stampMs":{"page":32.7,"focus":32.7,"flow":28.4,"narrate":29.4},
            "stampedSpans":{"page":747,"focus":747,"flow":747,"narrate":747}}}
```

**Live run:** exit **0** (`B5-live-run3.json`). Every copy certifies all 18 sections that have a slice. There is no `ok:false` and no exit 3:

```json
{"electron":"42.11.18","icu":"78.2","control":false,
 "packaged":{"electron":"42.11.18","icu":"78.2"},"renderer":{"electron":"42.11.18","icu":"78.2"},
 "mainLocale":"en-US","rendererLocale":"en-US","sections":19,"withSlice":18,
 "certified":{"page":18,"focus":18,"flow":18,"narrate":18},"failures":[],
 "largest":{"sectionIndex":17,"words":7171,"stampMs":{"page":48.9,"focus":47.7,"flow":46.9,"narrate":44.7},
            "stampedSpans":{"page":7171,"focus":7171,"flow":7171,"narrate":7171}}}
```

**stampMs** (a certified `wrapWordsInSpans` of section 17, 7,171 words; recorded, not gated): Page 48.9, Focus 47.7, Flow 46.9, Narrate 44.7 ms. Each copy reports `[{"ok":true}]` and stamps 7,171 spans.

Observation (control): the uncertified wrap of section 17 still stamps 747 spans in each copy. That is the legacy path the hold covers. It is recorded here, not judged.

Earlier runs, for the record:
- The first control and live runs, before the coordinator freed space, failed to write their output on ENOSPC. No verdict was taken from them (`B5-control.txt`, `B5-live.txt`).
- A second pair ran against the first tip package before it was found incomplete (below). Control exited 1 with the same four `extra-source-text` failures; live exited 0 with 18 of 18 in each copy, stampMs Page 49, Focus 92.8, Flow 49.7, Narrate 58.4 (`B5-control-run2.*`, `B5-live-run2.*`). Step 1 there read the stock `electron.exe`, which has the same versions. The gate is the run against the rebuilt package above.

**Live profile.** `%APPDATA%\blurby` (4,088 files) was hashed with SHA-256 before the first launch (`live-profile-hash-before.txt`). The re-hash after each B5 pair is identical (`live-profile-hash-after-B5.txt`), and the B7 launch left the live `library.json` and `settings.json` hashes unchanged.

## Package verification (standing rule 53, B7)

### Tip, x64

- **Package.** The first `--dir --x64` package, built at `19771a47` as the disk filled, was incomplete. Its exe was still `electron.exe`, it had no `resources\resources\` (the `extraResources`), and its log stops before "updating asar integrity" and signing. Its earlier "exit 0" did not mean a complete package. A 25 s launch of it failed the profile proof (exit 4; `B7\tip\launch25-electronexe-incomplete.*`).
- **Rebuild.** It was rebuilt in place at `4a0b2e28`. The source is identical to `19771a47`: `4a0b2e28` adds only the checker under `scripts/`, outside `build.files`. `npm run build` exited 0, then `npx electron-builder --win --dir --x64 --publish never` exited **0** (`B7\tip\package-x64-build.txt`). The log now ends with the asar integrity update and signtool. The output is `release\win-unpacked\Blurby.exe`, with `resources\app.asar`, `app.asar.unpacked` and `resources\resources\` (`sample-meditations.epub`, `Reading_Log_Blurby_Template.xlsx`). `origin/main` (`14ce3d24`) is already an ancestor of the tip, so nothing needed merging in.
- **25 s launch** (`B7\launch25.mjs`, copied from narrate-quit-linger-1's rule 53 driver with APPDATA and LOCALAPPDATA redirected; result `B7\tip\launch25-x64.json`):
  - `app.getPath('userData')`, read over the main-process inspector before any input, equals the scratch profile (LL-165);
  - the app is alive at 25 s, with no `error.log`, no crash dump and no flagged output line;
  - the output is the inspector's own lines, `[ws-server] Listening on ws://127.0.0.1:48924/blurby`, and the known first-launch `Backup failed for …library.json: ENOENT` (BUG-217);
  - the live `library.json` and `settings.json` hashes are unchanged.
- **asar.** `npx asar list` exits 0 with 11,587 entries (`B7\tip\asar-list.txt`):
  - It lists `\main\epub-word-extractor.js`, `\main.js`, `\preload.js`, `\dist\index.html` and all 19 `\dist\assets\` files.
  - Vite bundles the renderer helpers, wrappers and views into `\dist\assets\App-K-A4gbIe.js`. It carries each copy's reason strings (`extra-source-text`, `canonical-exhausted-dom`, `dom-changed` and `unmatched-source-word`, 4 each) and `onHeldWordClick` (12).
  - The extracted asar's `dist\` equals the worktree's `dist\` (`diff -r`, no output). Its `main\` directory, `main.js` and `preload.js` are byte-identical to the worktree's, and its `epub-word-extractor.js` contains `extractOrderedRuns`.
- **B5 on the package:** above (control exit 1, live exit 0).

### origin/main `14ce3d24`, x64

Built in `C:\Users\estra\Projects\Blurby\.worktrees\gate1-run6-20261103` (detached at `14ce3d24`, clean, no `node_modules` or `dist` at the start), with the tip's recipe. It ran after Blurby.Brain1's go for option (c): the floor was 0.3 GB for the build steps only, and the normal 1 GB floor applied to every launch. Outputs are in `B7\main\` (`build-steps.txt` holds the step lines below).

| Step | Exit | Free on C: after |
|---|---|---|
| (start) | — | 2.74 GB |
| `npm ci` | 0 | 1.79 GB |
| `node node_modules/electron/install.js` (needed: no `path.txt` yet) | 0 | 1.44 GB |
| `npm run build` | 0 | 1.44 GB |
| `npx electron-builder --win --dir --x64 --publish never` | 0 | 0.47 GB |

`git status --short` in gate1-run6 was empty before and after, and stayed empty through the launches. No tracked file changed, so nothing needed restoring.

**Completeness, checked before any launch** (`B7\main\completeness.txt`); every check passed:
- `release\win-unpacked\Blurby.exe`, `resources\app.asar`, `resources\app.asar.unpacked` and `resources\resources\sample-meditations.epub` exist.
- `npx asar list` exits 0 with 11,587 entries, the same count as the tip (`B7\main\asar-list.txt`).
- The sorted lists differ in exactly four entries, the content-hashed Vite bundles: `App` (`K-A4gbIe` at the tip, `C6zGHjar` on main), `epub` (`CEMTiQAD`, `C_nIHu2Z`), `index` (`DE94z9ko`, `CpEHdBJw`) and `view` (`Cfh8NArt`, `CW5RmoLH`). The BTO files are content changes at the same paths (`main\epub-word-extractor.js`; the mode code inside `App-*.js`), so they add no list entry. The script's hash-normalization step did not rewrite these names, so the comparison recorded is the raw sorted diff.
- `ENOSPC` and "no space left" occur 0 times in the electron-builder output. Its log ends with the asar integrity update and signtool, as the tip's does.

**Space.** gate1-run6's `node_modules` was then deleted, as authorized: 0.50 GB free before, 1.80 GB after. That cleared the normal 1 GB floor for the launches.

**25 s launch** (same `B7\launch25.mjs`; result `B7\main\launch25-x64.json`):
- `app.getPath('userData')`, read over the main-process inspector before any input, equals the scratch profile (LL-165);
- the app is alive at 25 s, with no `error.log`, no crash dump and no flagged output line;
- the output is the inspector's own lines, `[ws-server] Listening on ws://127.0.0.1:48924/blurby`, and the first-launch `Backup failed … ENOENT` (BUG-217), the same as the tip;
- the live `library.json` and `settings.json` hashes are unchanged.

**B5 step 1 runtime proof** (LL-152: one recipe on the base and the tip). The command is the one `run.ps1` step 1 runs (`ELECTRON_RUN_AS_NODE=1`, `-p` of `process.versions`), with APPDATA and LOCALAPPDATA redirected (`B7\step1.ps1`). Each exe was checked at 1.79 GB free:

| Package | Exit | Versions |
|---|---|---|
| origin/main `14ce3d24` (`B7\main\b5-step1.txt`) | 0 | `{"electron":"42.11.18","icu":"78.2"}` |
| tip `4a0b2e28` (`B7\tip\b5-step1.txt`) | 0 | `{"electron":"42.11.18","icu":"78.2"}` |

They are the same.

**Live profile.** The full `%APPDATA%\blurby` hash (4,088 files) taken before the main-half launches (`B7\main\live-profile-hash-before-main.txt`) and after them (`…-after-main.txt`) equals the baseline `live-profile-hash-before.txt`.

### Evidence kept and scratch deleted (Blurby.Brain1 go, options (a) and (c))

Kept in `C:\Projects\Blurby-artifacts\block-text-order-1\` before any deletion:
- the B5 gate JSONs `B5-{control,live}-run{2,3}.json`, each checked with `cmp` against its scratch `result.json`;
- the logs `B5-{control,live}-run{2,3}.txt`;
- the stampMs record `B5-stampMs.json`;
- `B7\tip\asar-list.txt`;
- `B7\tip\asar-compare.txt`. It holds the byte-identity comparison: `diff -r` of `dist\` and `main\`, plus `cmp` of `main.js`, `preload.js` and `epub-word-extractor.js`, each exit 0, with the bundle string counts.

Deleted, and nothing else:
- the B5 scratch folders `bto-b5`, `bto-b5-run2` and `bto-b5-run3` under the session scratchpad, about 9 MB;
- the asar extraction `scratchpad\b7\asar-tip`, 618 MB (2.15 GB free before these, 2.77 GB after);
- `gate1-run6-20261103\node_modules`, about 1.3 GB, after the completeness check.

The mechanics dry-run scratch (`bto-dry`), the worktrees, gate1-run6's `release\` and `dist\`, and every artifact were kept. At the end, C: has 1.79 GB free.

### B9 fence

`git diff --name-status 14ce3d24..HEAD` (exit 0) lists 31 paths:
- exactly the 28 B9 paths;
- `M tests/readerModes/pagePositionSave.test.tsx` (the ruled rule-50 exceptions);
- this memo and the time log.

The fence was re-run at the records commits and still matches; the second records commit touches only this memo and the time log. `narrate/ModeRuntime.ts` and `narrate/useModeBindings.ts` are absent. `c5bb507f..HEAD` adds exactly the six files `14ce3d24` merged in, which equal `git diff --name-status c5bb507f 14ce3d24`. There is no conditional addition: `boundary-policy.json` is not edited.

### Wave B test counts

| Run | Passed | Failed | Skipped | Files |
|---|---|---|---|---|
| B1 on `dcfb18ae` | 5 | 18 | 0 | 4 |
| B2 tip | 23 | 0 | 0 | 4 |
| B3 | 150 | 0 | 0 | 8 |
| B4 `npm test` tip | 3,230 | 0 | 1 | 238 |
