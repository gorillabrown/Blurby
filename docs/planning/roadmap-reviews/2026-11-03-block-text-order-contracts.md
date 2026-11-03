*Draft contracts for BLOCK-TEXT-ORDER-1's specification holds G-A to G-D. Read-only investigation at `origin/main` `c5bb507f`, commissioned by Blurby.Roadmap 2026-11-03. Every red case is reasoned from source, not run. Open: Brain1 TQ-B1, TQ-B2, TQ-B3 (blocking) and TQ-A1, TQ-C1, TQ-D1 (scope); owner OQ1–OQ6. Not a dispatch-ready specification.*

# BLOCK-TEXT-ORDER-1: proposed frozen contracts for holds G-A to G-D

Date: 2026-11-03. Author: Aristotle (read-only investigation for Blurby.Roadmap). Status: **proposal**. Nothing here is a Brain1 ruling, an owner answer or a runtime receipt.

Source pin: `origin/main` = `c5bb507fc2502c494bdeb87fed82647e34927d6b` (merged release candidate). `f61ae02d` is an ancestor (388 commits between them). Every `file:line` below is one-based **at c5bb507f** unless it is marked f61. Evidence was gathered with `git show origin/main:<path>`, `git grep … origin/main` and `git diff f61ae02d origin/main`. Nothing was edited, checked out, run or tested. Every "base red" below is a **source deduction**. None was executed.

Inputs read: the ROADMAP card at ROADMAP.md:973-1012 (planning branch), `docs/planning/roadmap-reviews/2026-10-27-group-source-trace.md`, `docs/governance/bug-reports/Issue.BLOCK-TEXT-ORDER-1.2026-10-27.md`, `2026-10-27-plan.md` §GROUP (lines 78-92), `2026-10-27-brain-contract-amendments.md` A2, and `2026-10-27-delivery-technical-decisions.md` §2 and the cue/run ruling (lines 15-77). I also read `2026-10-27-word-consumer-decision.md`:13 and LL-028, LL-071, LL-072, LL-081, LL-139, LL-143 and LL-170.

---

## 0. Re-trace delta, f61 to c5bb507f

| Site | Status at c5bb507f | Effect on the trace |
|---|---|---|
| All four `helpers/foliateHelpers.ts`, all four `helpers/foliateWordWrapping.ts`, `src/utils/foliateHelpers.ts`, `src/utils/naturalChunks.ts`, `main/ipc/tts.js` | **Blob-identical to f61.** Page helpers `7f939419…`, the other three `02beba13…`, all four wrappers `7149222c…` | Trace §3 lines still hold: groups `collectBlockTextNodes` 86-122, renderer body predicate 55-69, extraction 233-271, `contentAlignWords` 19-66, `useContentAlign` 98, wrap loop 100-148. The Page helper is offset by +21 lines, as the trace says. |
| All four `helpers/foliateWordOffsets.ts` | Identical across the four modes (`55bd087d…`) | `getSectionGlobalOffset` 43-51 and `resolveTrustedRenderedWordIndexToGlobal` 109-131 are unchanged in meaning |
| `main/epub-word-extractor.js` | Changed only by ZIP-READ-FOLLOWUPS-1 / ZIP-ASYNC-READ-1 (`openZip`, :168). Lines shift by -1 | Predicates are byte-equal in meaning. The trace's `isFootnoteBodyNode` :49-65 is now **:48-64**, footnote targets :81-104 are now **:80-104**, `extractBlockPlans` :107-157 is now **:106-155**, and the per-part segmentation :235-268 is now **:233-266** (cue push :236-244, sections :268-276). A failed open still returns `{words:[],sections:[],footnoteCues:[],totalWords:0}` (:170-171, :187-188). |
| Four `FoliateView.tsx`, four `ModeRuntime.ts`, Flow/Focus `surface.ts` and `useModeBindings.ts`, `ReaderContainer.tsx` | Changed by the RC (FLOW-PARA-PAUSE-INDEX-1, BLOCK-TAG-CASE-1, FLOW-PARA-KEYS-1, PAGE-SAVE-RESTAMP-2/3, RESTAMP-RERUN-RACE-1, first-text wait and others). Integration commit for FLOW/BLOCK: `f4becc3c` | Every view and runtime line cited in the trace has moved. The new lines are given in §G-C. Page now holds turns and clicks on renderer-numbered documents (`rendererNumberedDocsRef`, page FoliateView:611-616, 626-643, 671). Flow, Focus and Narrate now wait for the section map when the first section has no words (Flow ModeRuntime:718-726, Focus :543-548, Narrate :292-300). |

Card note: the card still names NATIVE-PATH-ATTESTATION-1 as a prerequisite (ROADMAP.md:977), but its own first bullet supersedes that (:975). FLOW-PARA-PAUSE-INDEX-1 and BLOCK-TAG-CASE-1 are merged in `origin/main` through `f4becc3c`. Their register status was **not** checked. Proposed baseline: c5bb507f, which contains f61. The helpers are byte-equal, so the f61 trace's algorithm analysis carries over unchanged.

---

## G-A: accepted-text equivalence

### A.1 Current behaviour (c5bb507f)

**Main acceptance** (`main/epub-word-extractor.js`). `$("script, style").remove()` runs first (:229). Then `walk(body)` (:129-151, :153):
- `walk(E)`: if `isFootnoteBodyNode(E, targetIds)`, the subtree is skipped (:131). If E is in BLOCK_TAGS, every child goes through `walkInline` (:134-139). Otherwise each direct text child is accepted **only if it is not blank** (`text.trim()`, :144-146), and each tag child goes back through `walk` (:147-148). **`walk` never tests `isLikelyFootnoteRef`.**
- `walkInline(N, parent)`: text is accepted, blanks included (:112-115). A footnote body is skipped (:118). A ref (`isLikelyFootnoteRef(N, parent)`) is skipped and leaves a cue only when its target text resolves (:119-123). Otherwise it recurses (:125-126).
- `isFootnoteBodyNode` (:48-64) matches when `id && targetIds.has(id)` (:56), **or** when `epub:type`/`role` is footnote or endnote (:57-59), **or** when the tag is aside/section/li/div/p and class+id matches `/footnote|endnote|notes?\b|fn\d+/` (:60-62).
- `targetIds` (:80-89) holds `href.slice(1).trim()` for every **body-descendant** element (`$root.find("*")`) that satisfies `isLikelyFootnoteRef(el, el.parent)` and has an `href` starting with `#`. Cross-file hrefs (`notes.xhtml#n1`) never enter the set (`normalizeHash`, :28-31).
- Section XHTML is parsed with `cheerio.load(xhtml)` (:228), which is parse5's **HTML** mode. The container and OPF use `xmlMode` (:181, :195). cheerio is `^1.2.0` (package.json:106).

**Renderer acceptance**, identical in all four copies (flow/focus/narrate `foliateHelpers.ts`; Page is +21). `collectBlockTextNodes` :86-98 rejects a text node whose **direct parent** is script or style, rejects an empty node, and rejects a node with any **ancestor element, up to and including `<body>` and `<html>`**, that satisfies `isFootnoteRefElement` (:40-53) or `isFootnoteBodyElement` (:55-69) (`isSuppressedNarrationTextNode` :71-78). `isFootnoteBodyElement` is main's predicate **without** the `targetIds` clause.

**Divergence classes** (static enumeration, complete for these predicates):
- **D1, referenced plain-ID target.** Main suppresses an element whose `id` is a same-document `#href` target of a ref. The renderer accepts it unless the semantic or class patterns also match. This is trace counterexample 2/3.
- **D2, a ref element reached through main's `walk()` rather than `walkInline()`.** Main **accepts** text that the renderer rejects in three placements: a ref with no BLOCK ancestor (for example `<body>Lead <a epub:type="noteref" href="#n">1</a> tail</body>`, where main emits the word `1`), the outermost block element when that element itself satisfies the ref predicate (for example `<p role="doc-noteref">`), and a ref on `<body>`/`<html>`. This class is new; the trace does not mention it.
- **D3, blank text outside any block.** Main drops it (:144-146) and the renderer keeps it. This yields no words but shifts raw-run UTF-16 offsets.
- **D4, parser divergence** (parse5 HTML compared with the Foliate XHTML DOM). A self-closing non-void element such as `<a id="t"/>` becomes an open element that swallows the text after it, and text inside tables can be foster-parented. Both change ancestry or order before either predicate runs. This is not a predicate difference, so it can only be detected, not mirrored.
- script/style: main removes all `script, style` elements and the renderer rejects text directly under them. For text nodes the two are equivalent. **No divergence.**

### A.2 Proposed frozen contract

- **A-1 One shared rule, MAIN_ACCEPT.** A text node T in section body B is main-accepted iff all of the following hold:
  1. No element on the path B…parent(T) satisfies `isFootnoteBodyNode(·, targetIds(B))`.
  2. No element **strictly below the outermost BLOCK_TAGS ancestor of T** satisfies the ref predicate (with its own parent as the parent argument).
  3. T is not inside script or style.
  4. If T has no BLOCK_TAGS ancestor below B, T is not blank (`T.data.trim() !== ""`).

  `targetIds(B)` is exactly main's set: the `#`-href targets of every element below B that satisfies the ref predicate. BLOCK_TAGS stays unchanged (13 lowercase tags, `localName.toLowerCase()`). No CSS display test, no `aside`/`nav` blanket rule and no new class pattern is added.
- **A-2 Who uses MAIN_ACCEPT.** Three users only: (a) main's new dormant pure helper `extractOrderedRuns($, $root)`, which reuses main's own predicates; (b) a new renderer function `collectMainAcceptedTextNodes(body)` plus `collectFootnoteTargetIds(body)`, written once in each of the four mode-local `foliateHelpers.ts` copies with no sibling import; and (c) the canonical certification in G-B.
- **A-3 Fallback acceptance is unchanged.** The renderer's existing legacy predicate (`isSuppressedNarrationTextNode`) stays the acceptance rule for the **fallback** path (`extractWordsFromView`, `extractWordsFromSection`, and wrapping with no canonical slice). D1 and D2 therefore remain visible in pre-canonical fallback words, exactly as today. Whether fallback should also adopt D1 is owner question OQ1.
- **A-4 Parity claim.** "Main and renderer accept the same text" is claimed **only for MAIN_ACCEPT** against main, and only on the fixture set in A.3. D4 is not claimed. It is handled by G-B's fail-closed certificate. **No universal claim is made.**

### A.3 Tests (literal)

New file `tests/readerModes/blockTextOrder.test.ts` (`// @vitest-environment jsdom`, `describe.each` over the four mode copies, using the XHTML builder pattern of `tests/readerModes/blockTagCase.test.ts`:21-24, parsed as `application/xhtml+xml`):
- `(a1) referenced plain-ID target is not main-accepted`. Body: `<div id="x1">alpha beta</div><p>alpha<a epub:type="noteref" href="#x1">1</a> beta</p>`. `collectMainAcceptedTextNodes(body).map(n=>n.data)` equals `["alpha", " beta"]`. Red on base: the function does not exist (ReferenceError or import failure; a real red must still be captured).
- `(a1-control) legacy fallback still accepts it`. Same body. The text of `collectBlockTextNodes(body)` contains `"alpha beta"` from x1, unchanged from base. This must pass on base and on the fix.
- `(a2) target after the body text`. Same as (a1) with the `<div id="x1">` placed last. Expected `["alpha", " beta"]`.
- `(a3) root-level noteref marker is main-accepted (D2)`. Body: `Lead <a epub:type="noteref" href="#n">1</a> tail` with no block. Expected `["Lead ", "1", " tail"]`.
- `(a3-control) legacy fallback rejects the marker`. The `extractWordsFromSection(doc,0)` words equal `["Lead","tail"]` on base and fix.
- `(a4) semantic footnote unchanged`. `<p>x</p><aside epub:type="footnote" id="fn">Note.</aside>` with no ref. Both predicates give `["x"]`.
- `(a5) no CSS/aside broadening`. `<aside>Side text.</aside><p>x</p>`, an aside with no note class, type or target. MAIN_ACCEPT gives `["Side text.", "x"]`, which is exactly what main accepts.
- `(a6) blank root text dropped`. Body: `\n<p>x</p>\n`. MAIN_ACCEPT gives `["x"]`. The legacy predicate keeps the blanks (control).
- `(p1) main/renderer accepted-text parity`. For each fixture in (a1)-(a6), main's `extractOrderedRuns(cheerio.load(html), $("body")).runs.map(r=>r.text).join("\u0001")` equals the run join over the renderer's MAIN_ACCEPT runs. The test imports main through `createRequire` (the `tests/epubWordExtractor.test.js`:3-4 pattern).

### A.4 Minimal source fence
Four `src/reader/modes/{page,focus,flow,narrate}/helpers/foliateHelpers.ts`: add `collectFootnoteTargetIds` and `collectMainAcceptedTextNodes`. In `main/epub-word-extractor.js`, add the exported `extractOrderedRuns`, which **production never calls**. `isFootnoteBodyNode`, `isLikelyFootnoteRef`, `extractBlockPlans`, `extractWords` and `extractBlockTexts` must stay byte-unchanged.

### A.5 Not settled from source
- **TQ-A1 (Brain1):** D4 parse divergence. Should GROUP add an explicit opposing fixture, for example `<a id="t1"/>` used as a ref target followed by body text, that proves certification fails closed? Or is D4 out of scope for GROUP and owned by WORD?
- **OQ1 (owner):** Before full-book words arrive, should Narrate speech and the Flow/Focus fallback words also skip plain-ID footnote targets (D1), so that pre- and post-arrival text is the same? Recommendation: **not in this item**. Keep today's fallback text; only the order changes.

---

## G-B: source-aware, non-lossy canonical stamping

### B.1 Current behaviour
In each `foliateWordWrapping.ts`, `wrapWordsInSpans` (:91-149) groups nodes with `collectBlockTextNodes(doc.body)` (:100). It uses content alignment only when the canonical slice is **nonempty** (:98), and it carries `canonicalCursor` across groups (:103, :111-114). `contentAlignWords` (:19-66) runs `indexOf` from `textPos` in the group text (:32). When a word is missing it peeks up to `MAX_PEEK_AHEAD = 8` (:13, :49-54) and, if a later word is found, **consumes the absent word without a span** (:55-61). The return value `globalOffset + canonicalCursor` (:148) is a count, not a certificate. The views mark `bookStampedDocsRef` from section presence alone (Flow :906, :934, :1369; Focus :825, :1257). Clicks use only a range check (`resolveTrustedRenderedWordIndexToGlobal`, foliateWordOffsets.ts:109-131) and persist (Flow ModeRuntime:1573-1600 with `persist: true`).

One key property comes from main (:233-266). **Each canonical word is a substring of exactly one accepted text part, which is one source text node**, because segmentation runs per part and never joins across parts. Main's word order is also DOM pre-order, since `walkInline` flattens nested blocks in order (:110-127). The disorder is introduced only by the renderer's `Map` grouping (helpers :102-110).

Legacy tests `tests/foliateContentAlign.test.ts`:116-148 assert the skip behaviour on the **legacy** `src/utils/foliateWordWrapping.ts`. That file stays unchanged and those tests stay green. They are not inherited controls for the mode copies.

### B.2 Proposed frozen algorithm: `certifyCanonicalAlignment(nodes, canonical)`
This is a pure function added to each mode-local `foliateWordWrapping.ts`.

Inputs: `nodes = collectMainAcceptedTextNodes(doc.body)`, in DOM order, computed on the same `doc` before any span is inserted (or right after `unwrapWordSpans` during a restamp); and `canonical`, the nonempty slice for this section.

Define `wordFree(s)` as `Array.from(new Intl.Segmenter(undefined,{granularity:"word"}).segment(s)).every(g => !g.isWordLike)`.

```
k = 0; pos = 0; placements = []
for i in 0..canonical.length-1:
  w = canonical[i]; if w === "": return FAIL("invalid-canonical-word", i, k)
  loop:
    if k >= nodes.length: return FAIL("canonical-exhausted-dom", i, k)
    t = nodes[k].data; j = t.indexOf(w, pos)
    if j >= 0 && wordFree(t.slice(pos, j)): placements.push({i, node:k, start:j, end:j+w.length}); pos = j+w.length; break
    if !wordFree(t.slice(pos)): return FAIL("unmatched-source-word", i, k)
    k++; pos = 0
for rest of nodes[k] from pos, and every later node: if !wordFree(rest) return FAIL("extra-source-text", canonical.length, k)
return OK(placements)
```

There is no lookahead, no skip and no search past a word. A duplicate later in the text can be matched only if every word-like character before it was matched first.

**Completion predicates. The result is certified iff all of the following hold:**
- C1: the canonical slice comes from the `sections` entry whose `sectionIndex === index`, and its length is greater than 0.
- C2: `placements.length === canonical.length`, and for every i, `placements[i].i === i` and `node.data.slice(start,end) === canonical[i]`.
- C3: placements strictly increase in `(node, start)`.
- C4: every gap, before, between and after placements and across all nodes, is `wordFree`.
- C5: no placement crosses a node, which holds by construction.

Consumed counts, `bookStamped` and an in-range index are **not** certificates (LL-170).

**Stamping disposition:**
- **Certified:** each placement is wrapped in its node using the existing `buildWrappedFragmentForNode` with `nodeStart = 0`, `globalIndex = globalOffset + i` and `tokenId = makeFoliateTokenId(sectionIndex, i)`. This keeps today's tokenId formula and today's span attributes. The function returns `globalOffset + canonical.length`.
- **Not certified:** the **legacy `contentAlignWords` path runs unchanged**, byte-identical to today, and the failure is reported through an optional `onCertification?(result)` parameter. The parameter is defaulted, so no call site has to change.
- **No canonical slice:** today's fallback path runs, using G-D runs.

`bookStampedDocsRef` marking and click and save authority are **unchanged** in this item (see G-C, OQ4).

What this proves: for a certified section, every stamped index i lies on the source occurrence that corresponds to main's word i in the MAIN_ACCEPT node stream. It does not prove parser-object identity (D4 residual: identical text arriving in identical order through a different node). That limit is stated, not hidden.

### B.3 Tests (literal; `tests/readerModes/blockTextOrder.test.ts`, four copies)
Unless a case says otherwise, call `await wrapWordsInSpans(doc, 0, 100, words, canonical)` and read `[data-word-index]` as `{text, index, inBlockOfId?}`.
- `(b1) nested before/inside/after is stamped in DOM order`. Body `<div>before <p>inside</p> after</div>`, canonical `["before","inside","after"]`. Expected: before=100, inside=101, after=102, and each index stamped exactly once. Base red (deduction from trace example 1): before=100, after=102, and "inside" has no span.
- `(b2) duplicate text under a plain-ID target`. The (a1) body with canonical `["alpha","beta"]`. Expected: x1 has 0 spans, and the p's alpha=100 and beta=101. Base red (deduction): x1 alpha=100 and beta=101, and the p has 0 spans.
- `(b3) missing word is not consumed`. Body `<div id="x1">beta</div><p>alpha<a epub:type="noteref" href="#x1">1</a> beta</p>`, canonical `["alpha","beta"]`. Expected: the p's alpha=100 and beta=101, and x1 has 0 spans. Base red: x1 beta=101, and alpha has no span.
- `(b4) certifier fails closed instead of skipping`. `certifyCanonicalAlignment([text("alpha gamma")], ["alpha","MISSING","gamma"])` returns `{ok:false, reason:"unmatched-source-word", canonicalIndex:1, nodeIndex:0}`.
- `(b4-control) uncertified section keeps legacy stamping exactly`. Body `<p>alpha gamma</p>` with that canonical. `doc.body.innerHTML` equals the base output byte for byte (alpha index 100, gamma index 102). This control asserts only DOM equality, so it passes on base. The `onCertification` `ok:false` report is asserted separately in (c2).
- `(b5) repeated words in order`. `<p>the cat sat on the mat</p>` with the six-word canonical. Certified, and the second "the" span is at text offset 15, the same as legacy test `foliateContentAlign.test.ts`:95-102.
- `(b6) drop cap across nodes`. `<p><span>W</span>hat's up</p>` with canonical `["W","hat's","up"]`, which is main's per-part output. Certified; W=100 inside the `<span>`, hat's=101, up=102. The DOM is identical to the base output (control).
- `(b7) extra renderer text`. `<p>alpha beta</p>` with canonical `["alpha"]` gives `reason:"extra-source-text"`, and the legacy DOM is unchanged.
- `(b8) D2 marker is stamped, not skipped`. The (a3) body with canonical `["Lead","1","tail"]` is certified: Lead=100, 1=101, tail=102. Base red: Lead=100, tail=102, and "1" has no span (it is rejected by the legacy predicate and skipped by peek).
- `(b9) flat-section byte identity`. `<p>One two.</p><h2>Three</h2><li>Four</li>` with canonical `["One","two.","Three","Four"]`. Certified, and `body.innerHTML` equals the base output byte for byte (the opposing control: the fix changes nothing where nothing was wrong).
- `(b10) canonical parity with real main output`. The test writes a three-file EPUB with `adm-zip` to `os.tmpdir()`/`mkdtemp` (container.xml, OPF, one XHTML holding the (b1), (b2) and (b6) bodies concatenated) and calls main `extractWords(path)`. For the same XHTML parsed as `application/xhtml+xml`, `certifyCanonicalAlignment(collectMainAcceptedTextNodes(body), result.words)` is `ok:true`, and `placements.map(p=>text.slice(...))` equals `result.words`. This is the only test that binds the certificate to real main words.

### B.4 Minimal source fence
Four `helpers/foliateWordWrapping.ts`: add `certifyCanonicalAlignment`; add the certified branch and the `onCertification?` parameter to `wrapWordsInSpans`; leave `contentAlignWords` byte-unchanged. These files depend on the A.4 helper functions. No FoliateView, ModeRuntime, offsets, paragraph or ReaderContainer edit is required.

### B.5 Not settled from source
- **TQ-B1 (Brain1):** Does a renderer-side `Intl.Segmenter` `isWordLike` gap predicate count as a "new tokenizer" under the GROUP fence? It assigns no numbers; it only verifies.
- **TQ-B2 (Brain1):** Main-process and renderer default locale and ICU for `Intl.Segmenter(undefined, …)` (main :211, the renderer gap predicate). A disagreement fails closed into the legacy path, which is safe but silent. Is that acceptable, or should the failure reason be required in a diagnostic, which would widen the fence to the four FoliateViews?
- **TQ-B3 (Brain1):** Post-await identity. The wrap yields every 50 groups (:143-145). Flow and Narrate restamps neither await an in-flight load wrap nor check `cancelled` inside the loop (Flow FoliateView:1359-1370, Narrate :1250-1258). Page does both (:1112-1125). Does certification need a doc-still-current gate (LL-029/169) inside GROUP, or is that a separate item?

---

## G-C: canonical authority and hydration, per mode

### C.1 Common transport (unchanged, read-only)
- `ensureBookWords` (ReaderContainer.tsx:274-300) returns **null** when `!result.words || !result.sections` (:284), which covers IPC `{error}` (tts.js:162-174). **A failure inside the extractor returns empty arrays** (:170-171, :187-188), so it becomes a **non-null `bookWords` with `words: []` and `sections: []`.**
- Background pre-extraction runs after 1000 or 2000 ms (:600-610).
- Per-mode `getCanonicalSectionWords` returns `undefined` when a section is absent (Page :627, Flow :1202-1206, Focus :996, Narrate :648-652).
- `getSectionGlobalOffset` falls back to the **loaded-slice start** when the section is absent (foliateWordOffsets.ts:48-50).

### C.2 Current disposition table (source deductions)

| Case | Page | Flow | Focus | Narrate |
|---|---|---|---|---|
| **Missing** (bookWords null, not yet arrived) | Wraps with renderer numbering. The doc is marked `rendererNumbered` only when `!liveSections()?.length` (FoliateView:671). Turns and clicks are held (:611-616, :626-636) and save with `wordIndex:null` (:579-581). | Words come from `surface.getWords()` (ModeRuntime:1559-1566). A click persists `wordOffsetInSection = renderedWordIndex` (FoliateView:977-980) as a global index via `clamp(wordOffsetInSection)` (:1587-1588, :1594-1600, `persist:true`). | Same rule (ModeRuntime:1167-1174, :1181-1199). The click persists (:722-733). | Start plays the **fallback words first, then** calls `ensureBookWords` (ModeRuntime:291, :330-331). The click resolver is the same (:837-847). |
| **Empty** (sections `[]`, which includes an internal extractor failure) | `checkBookWords` treats `!value.sections.length` as a failure (:601). The held turn saves its cfi only (:588-600). Tests (w) and (x) cover this. | `effectiveWords` is `[]` because bookWords is non-null. Start goes to next() plus a retry timer and never uses fallback words (:717-734). The restamp effect returns early (:1353). | Same (:542-556). | Same (:291-309). |
| **Mismatched or absent section** (sections nonempty, this index absent) | `sectionStart` is the loaded-slice start (:664) and the doc is **not** marked rendererNumbered (:671). The save uses `resolveRenderedWordIndexToGlobal`, which returns the rendered index unchanged when there is no bookSection (offsets :71-72), so a **slice index is persisted as global.** | Incremental load: `sectionStart = existingEnd` (:900) and the doc is not bookStamped (:906). The click persists the slice index as in "missing". | Same as Flow's first load (:817-825). | Stamps the slice index (:795). The click path is the same. |
| **Load failure** (IPC error or rejection) | Rejection or null leads to `fail()`, `bookWordsFailedRef`, and saves with null index (:588-601). Test (v) covers this. | `bookWords` stays null, so fallback continues indefinitely. | Same. | `.catch(()=>{})` (:331): fallback speech continues. |
| **Later hydration** | Restamp awaits the load wrap (:1114), unwraps and rewraps (:1119-1124), then saves the held turn (:1127-1128). Tests (r), (t), (u), (z) and (q) cover this. | Restamp (:1352-1380) with no wait for the load wrap. Paragraph breaks are **not** refreshed in the engine (see G-D). The chunk cache rekeys on bookWords (:1434-1448). | Restamp (:1241-1268). Same notes as Flow. | Restamp (:1243-1266). **A running engine keeps its fallback word array**: `adoptDocument` (:242-255) only restarts a pending first-text. `engineFor` (:655-682) changes only on the next start. |

### C.3 Proposed frozen contract
- **C-1 Preserve every row.** BLOCK-TEXT-ORDER-1 changes **no** row of C.2 except two value-level effects, both intended. (i) Fallback words, numbers and paragraph flags follow DOM run order (G-D) wherever nested blocks interleave. Flat content is byte-identical. (ii) Sections that pass certification are stamped on the certified source occurrences (G-B). Uncertified, empty, missing and mismatched sections take exactly today's code paths.
- **C-2 Authority sources stay where they are.** The book-words snapshot remains the only canonical authority (LL-071/081). No new waiting, start gating, save gating, fallback suppression or Narrate engine swap is introduced. `rendererNumberedDocsRef`, `bookStampedDocsRef`, `pendingFirstText`, `checkBookWords` and the four restamp effects stay byte-unchanged.
- **C-3 Fail-closed output only.** An uncertified section is reported through `onCertification`. Using that report to gate selection, saves or start is **out of scope** and needs OQ4.

### C.4 Tests
- `(c1) empty canonical slice gives today's fallback numbering`. Call `wrapWordsInSpans(doc,0,0,words,[])` and `(…,undefined)` on `<p>a b</p><p>c</p>`. The indices 0, 1, 2 equal the base output (opposing control; must pass on base).
- `(c2) mismatched canonical gives the legacy path`. Canonical `["x","y"]` against `<p>a b</p>`. `onCertification` reports `ok:false`, and the DOM equals the base output.
- `(c3) nested fallback numbering follows DOM order`. `extractWordsFromSection` on the (b1) body gives `["before","inside","after"]` with tokenIds `0:0`, `0:1`, `0:2`. Base red: `["before","after","inside"]`.
- **Inherited runtime controls, run unchanged and never weakened:** `tests/readerModes/pagePositionSave.test.tsx` (r), (s), (t), (u), (v), (w), (x), (z), (q), (hf1); `tests/readerModes/flowPlayFirstText.test.ts`; `tests/readerModes/focusPlayFirstText.test.ts`; `tests/narrate/narrate.playFirstText.test.ts`; `tests/tts7k-global-word-source.test.ts`; `tests/readerModeIsolation.test.ts`. These already characterize the missing, empty, failure and hydration rows. No new runtime harness is needed **if** C-2 holds. If Brain or the owner choose any change under OQ3 or OQ4, new four-mode runtime tests become mandatory before Ready.

### C.5 Owner design questions (functionality the owner would perceive; none decided here)
- **OQ2:** In canonical mode, text in a plain-ID footnote target (for example a `<div id="n1">` that a noteref points at) will have **no word spans**. It cannot be clicked or highlighted, which is how semantic footnotes already behave. Today it is clickable but selects a wrong word. Accept? Recommendation: yes.
- **OQ3:** When the full-book extraction fails internally, it currently looks like an empty book. Flow, Focus and Narrate then cannot start and never fall back to the visible words. Keep this behaviour in this item? Recommendation: **keep it** and file it separately. Changing it alters start and speech.
- **OQ4:** For a section whose stamping cannot be certified (rare: parser divergence or unusual markup), keep today's clicks and saves (possibly a wrong word) or hold saves to the cfi only, as Page does before words arrive? Recommendation: keep today's behaviour here and decide in WORD-INDEX-UNIFY-1.
- **OQ6:** Before full-book words arrive, Narrate speaks the loaded words. With nested blocks, the spoken order changes from "intro … continuation, then nested quote" to true reading order, and the start word for "Play from first visible word" moves accordingly. Confirm that the plan's "DOM order in every mode" approval covers this speech-order change. Recommendation: confirm. It is the item's purpose.

Technical: **TQ-C1 (Brain1):** The mismatched-section path (C.2 row 3) persists a loaded-slice index as global in Page, Flow and Focus. This predates the item. Is it GROUP scope? Recommendation: no. Record it as a finding and keep C-1.

---

## G-D: paragraph and run semantics

### D.1 Current behaviour
- **Group identity:** each nearest-block Element is one group, emitted in first-encounter order (helpers :102-121). `blockOrdinal` is the group order and `blockId = sectionIndex:blockOrdinal:blockTag` (:112-120).
- **Fallback paragraph flags:** the last word of every nonempty group gets `paragraphBreakAfter`, and its loaded index enters `paragraphBreaks` (:243-250, :262-268).
- **Canonical paragraph starts** (Flow and Focus `foliateParagraphStarts.ts`:8-45; the copies differ only in blob): for each block Element in book-stamped docs, the **first own stamped word**, meaning the nearest block ancestor is that Element. Body counts as a block. `bookParagraphBreaks` (:52-63) adds start-1 for each start and section start, plus the last index. Consumers: Flow ModeRuntime:998-1004 (engine) and :1012-1020 (keys); Focus :819-825 and its keys.
- **Chunks:** Flow `createChunkSourceWords` (:489-513) copies Foliate `blockId`/`blockTag`/`paragraphBreakAfter` only when `foliateWords.length === words.length` (:496), with no content check. `naturalChunks` uses `blockTag` for headings (:77-79, :191-201), contiguous `blockId` for heading-block ends (:81-87), and `paragraphBreakAfter`/`sourceLineBreakAfter` as hard delimiters (:89-93, :204-207). Focus and Narrate do not import `buildNaturalChunks`. Narrate chunk breaks are canonical section ends or `document.paragraphBreaks` (ModeRuntime:688-697). Narrate's surface does not forward the view's paragraph breaks.
- **Engine refresh timing:** `onWordsReextracted` refreshes paragraph breaks when bookWords exist (Flow :1111-1123, Focus :933-946). It fires **before** the wrap and before book-stamped marking on Focus section load (FoliateView:814 then :824-825) and on Flow first load (:923 then :933-934). It fires **after** on Flow incremental load (:905-906 then :917). No restamp effect calls it (Flow :1352-1380, Focus :1241-1268). The other refresh point is engine start (Flow :757, Focus :580). Static consequence: a newly loaded Focus section's paragraph starts may not reach a running engine until the next load or start. This was not run.

### D.2 Proposed frozen contract
- **D-1 Raw run.** A maximal sequence of accepted text nodes, in DOM order, not separated by the entry or exit of any BLOCK_TAGS element. This includes an empty block or one whose text is entirely suppressed. A suppressed inline (non-block) element is not a separator. Runs whose text is all whitespace are not emitted. `runOrdinal` is 0-based per section, increases strictly and is unique. `runId = ${sectionIndex}:r${runOrdinal}`. Run text is the exact concatenation of node data (no inserted whitespace). Offsets are UTF-16 within the run, and the stream offset is the sum of the previous runs' lengths. Fallback runs use the legacy predicate (A-3); oracle and certification runs use MAIN_ACCEPT.
- **D-2 Semantic block identity, unchanged formula.** `blockElement` is the nearest BLOCK_TAGS ancestor, or body. `blockOrdinal` is the first-encounter order of `blockElement` across emitted runs, which equals today's value. `blockId` and `blockTag` keep today's formula. A resumed parent run **shares** its parent's `blockId`. For non-interleaved markup every field is byte-identical to today.
- **D-3 One paragraph-start rule for both paths.** Word w is a paragraph start iff it is the first accepted word in DOM order whose `blockElement` is some Element E. This is exactly the existing `firstOwnWordIndex` rule. In fallback extraction, `paragraphBreakAfter(w)` iff the next word in the same section is a paragraph start, or w is the section's last word. **A continuation run of an already-started block creates no new paragraph start and no extra pause.** For flat markup this is identical to today's group-end rule.
- **D-4 No consumer edits.** `foliateParagraphStarts.ts` (both copies), `bookParagraphBreaks`, `naturalChunks.ts`, `createChunkSourceWords`, Narrate `chunkBreaks` and every `onWordsReextracted` call site and order stay unchanged. D-3 already matches the collector, so no edit is needed there.
- **D-5 Engine refresh timing is unchanged.** The before-wrap ordering in D.1 is recorded as a finding and not fixed here (TQ-D1).
- **D-6 Interface.** The mode-local `FoliateWord` (helpers :8-18) gains optional `runOrdinal?`/`runId?`. The shared `ChunkSourceWord` (`src/types/chunkReading`) and `src/types.ts` are not touched.

### D.3 Tests (`tests/readerModes/blockTextOrder.test.ts`, four copies)
- `(d1) runs split on nested entry and exit`. `<div>before <p>inside</p> after</div>`: `collectBlockTextNodes` gives `[{div,"before ",run0,ord0},{p,"inside",run1,ord1},{div," after",run2,ord0}]`. Base red: `[{div,"before  after"},{p,"inside"}]`.
- `(d2) touching text, no whitespace inserted`. `<div>before<p>inside</p>after</div>` gives run texts `["before","inside","after"]`.
- `(d3) empty and suppressed nested blocks split runs`. `<div>a<p></p>b</div>` gives `["a","b"]`, both with blockOrdinal 0. `<div>red<div epub:type="footnote">x</div>blue</div>` gives `["red","blue"]`.
- `(d4) suppressed inline does not split`. `<p>red<a epub:type="noteref" href="#fn">1</a>blue</p><aside id="fn" epub:type="footnote">Note.</aside>` gives one run `"redblue"`.
- `(d5) orphan root text keeps its DOM position`. `lead<p>mid</p>tail` gives `["lead","mid","tail"]`, with blockTags `body`, `p`, `body`.
- `(d6) continuation adds no paragraph break`. Section (b1): `paragraphBreakAfter` is `[true,false,true]` and `paragraphBreaks` is `{0,2}`. Base: words in the other order, flags `[false,true,true]`.
- `(d6-control) flat paragraphs unchanged`. `<p>one two</p><p>three</p>`: flags `[false,true,true]`, blockIds `["0:0:p","0:0:p","0:1:p"]`, tokenIds `0:0`, `0:1`, `0:2`. Must equal base.
- `(d7) fallback flags equal canonical collector breaks`. After a certified wrap of (b1) at offset 0 with the doc book-stamped, `bookParagraphBreaks(collectParagraphStartWordIndexes(...), [0], 2)` equals the fallback `paragraphBreaks` `{0,2}` (Flow and Focus copies).
- `(d8) heading split by a nested block`. `<h2>Part<div>One</div>Two</h2>`: `buildNaturalChunks` over the fallback chunk words gives chunk kinds `heading("Part")`, `sentence("One")`, `heading("Two")`. This records the intended changed chunking. A non-nested heading control equals base.
- **Inherited controls, unchanged:** `tests/readerModes/blockTagCase.test.ts` (t1)-(t3); `flowParagraphStarts`, `focusParagraphStarts` and `bookParagraphBreaks` tests; `tests/bookParagraphStart.test.ts`; both naturalChunks tests; `tests/epubWordExtractor.test.js`.

Main pure helper, new file `tests/epubOrderedBlockRuns.test.js`:
- `(m1)`-`(m5)`: the (d1)-(d5) bodies through `extractOrderedRuns(cheerio.load(html), $("body"))` give the same run texts and boundaries as the renderer under MAIN_ACCEPT. (d5) is run with blank root text dropped.
- `(m6) cue offset`. The (d4) body gives runs `["redblue"]` and cues `[{runOrdinal:0, offset:3, text:"Note."}]`. Without the aside: cues `[]`.
- `(m7) legacy plans byte-equivalent`. For every (m) fixture, `extractBlockPlans` and `extractBlockTexts` deep-equal frozen literals recorded from the base. Example for (d1): `[[{type:"text",text:"before "},{type:"text",text:"inside"},{type:"text",text:" after"}]]`. For (d4): `[[text "red", cue "Note.", text "blue"]]`. Legacy `footnoteCues.afterWordIdx` is unchanged (Brain cue ruling, delivery decisions :48-77).
- `(m8) extractWords is not routed through the helper`. `git grep -n 'extractOrderedRuns' -- main src preload.js` must list only its definition and the export line.

### D.4 Not settled
- **TQ-D1 (Brain1):** Should this item move `onWordsReextracted` after the wrap on Focus load and Flow first load, and add a refresh after each restamp? Doing so would **add** paragraph pauses that are missing today in a just-loaded or just-hydrated section, which is a perceivable change. If yes, it becomes owner question OQ5b.
- **OQ5 (owner):** For `<div>Intro <blockquote>Quoted.</blockquote> and the continuation.</div>`, the default is **no pause** before "and the continuation". It continues the quote's paragraph, as the canonical paragraph keys already behave today. Accept? Recommendation: accept. It satisfies "no extra pause by default".

---

## Proposed Done-when (draft; every gate needs an LL-143 dry-run against base, fix and one wrong variant before Ready)

Shell: pwsh 7. Pass only on the exact exit code.

1. `npx vitest run tests/readerModes/blockTextOrder.test.ts tests/epubOrderedBlockRuns.test.js` exits 0 on the branch. On the frozen base with the new test files copied in, it exits 1, and the failing test names include exactly (a1), (a2), (a3), (a5), (a6), (p1), (b1), (b2), (b3), (b4), (b7), (b8), (b10), (c2), (c3), (d1)-(d6), (d7), (d8), (m1)-(m6), (m8). (b7) and (c2) are red on base only because the certifier and `onCertification` do not exist there. Every `-control` test plus (c1) and (d6-control) passes on both base and branch. (b5), (b6) and (b9) must each be split into a `…-dom` test (DOM equality, which passes on both) and a `…-certified` test (red on base). Any test whose base status differs from this list is recorded as observed and reviewed before Ready. **The real base reds must be captured and saved. The deductions in this file are not a substitute.**
2. `npx vitest run tests/foliateContentAlign.test.ts tests/foliateTokenStitching.test.ts tests/foliateDropcapAndChapters.test.ts tests/startupStabilization.test.ts tests/epubWordExtractor.test.js tests/readerModes/blockTagCase.test.ts tests/readerModes/flowParagraphStarts.test.ts tests/readerModes/focusParagraphStarts.test.ts tests/readerModes/bookParagraphBreaks.test.ts tests/bookParagraphStart.test.ts tests/naturalChunks.test.ts tests/naturalChunksBoundaryScan.test.ts tests/readerModes/pagePositionSave.test.tsx tests/readerModes/flowPlayFirstText.test.ts tests/readerModes/focusPlayFirstText.test.ts tests/narrate/narrate.playFirstText.test.ts tests/tts7k-global-word-source.test.ts tests/readerModeIsolation.test.ts` exits 0 with no test file modified (`git diff --exit-code <base> -- <those paths>` exits 0).
3. `git diff --name-only <base>..HEAD` equals exactly the fence list below, plus the item memo and time log.
4. `git diff --exit-code <base> -- src/utils/foliateHelpers.ts src/utils/foliateWordWrapping.ts src/components/ReaderContainer.tsx src/types.ts src/utils/naturalChunks.ts 'src/reader/modes/*/ModeRuntime.ts' 'src/reader/modes/*/FoliateView.tsx' 'src/reader/modes/*/helpers/foliateParagraphStarts.ts' 'src/reader/modes/*/helpers/foliateWordOffsets.ts' main/ipc/tts.js preload.js` exits 0.
5. The legacy main functions are byte-unchanged, with a reviewed hash recipe over `isLikelyFootnoteRef`, `isFootnoteBodyNode`, `buildFootnoteTargetTextMap`, `extractBlockPlans`, `extractWords` and `extractBlockTexts`. Alternatively, (m7) plus a whole-book `extractWords` equality on the two public EPUBs, base against branch, run on the quiet machine (rule 6b).
6. No sibling import: `git grep -nP "modes/(page|focus|flow|narrate)/" -- 'src/reader/modes/*/helpers/*.ts'` returns only same-mode paths (the exact gate must be written and dry-run).
7. `npm test` passes with 0 failures and at least the baseline count, `npm run typecheck` exits 0, and `npm run build` exits 0.
8. Package verification per standing rule 53 and LL-167: the `--dir --arm64` package launches, the asar contains the changed helpers, and the automatable Done-when items are re-run against the packaged build. Blurby.Brain1 confirms before the merge go. **Build-and-hold; no auto-merge** (card :1003).
9. Native and owner checks use owned public fixtures only (card :975). Add owner smoke items for OQ2, OQ5 and OQ6 to release gate (2)'s list rather than running a separate smoke.

**Minimal source fence (proposed, 9 source files and 2 tests):**
- `src/reader/modes/{page,focus,flow,narrate}/helpers/foliateHelpers.ts`: runs, MAIN_ACCEPT and the paragraph-flag rule.
- `src/reader/modes/{page,focus,flow,narrate}/helpers/foliateWordWrapping.ts`: the certifier and the certified branch.
- `main/epub-word-extractor.js`: dormant `extractOrderedRuns` and its export only.
- Tests: `tests/readerModes/blockTextOrder.test.ts` and `tests/epubOrderedBlockRuns.test.js`.
- The separation census `boundary-policy.json` entries are touched only if the census mechanically requires it (trace §1; not re-checked here).

**Shared-core touches: none.** `src/components/ReaderContainer.tsx`, `src/types.ts` and `src/utils/FlowScrollEngine.ts` are not needed by any of the four contracts. Flow's live engine is `src/reader/modes/flow/helpers/FlowScrollEngine.ts`, which is also untouched. Adopting TQ-B2's diagnostic, TQ-B3's identity gate, TQ-C1, TQ-D1, OQ3 or OQ4 would widen the fence to the FoliateView and ModeRuntime files, not to shared core.

---

## Verdict

The four contracts are **substantively complete as proposals**:
- The shared acceptance rule and its divergence classes are enumerated against the code.
- The stamping algorithm is exact, with completion predicates and opposing tests.
- A per-mode, per-case disposition table is anchored at c5bb507f, with a "preserve everything" contract.
- Run identity is defined separately from paragraph and chunk semantics, with a single paragraph-start rule that matches the shipped collector.
- Test names, inputs, expected outputs, a fence and draft gates now exist. That addresses most of rubric U3 and U4.

They are **not yet dispatch-ready** (U7 still fails):
- **Blocking Brain1 rulings:** TQ-B1 (verification predicate compared with "no new tokenizer"), TQ-B2 (fail-closed silently or with a diagnostic) and TQ-B3 (post-await identity). TQ-A1, TQ-C1 and TQ-D1 are scope rulings.
- **Blocking owner answers:** OQ2, OQ5 and OQ6. OQ1, OQ3 and OQ4 have recommended "keep today" defaults that the owner should confirm.
- **Independent review:** none of this has been reviewed independently (card task 3).
- **Base reds:** every base red above is a static deduction. The real base reds (Done-when 1) and the LL-143 gate dry-runs have not been run.

D2 (root-level ref markers) and the "empty extraction looks like success" behaviour are **new findings beyond the f61 trace**. The engine refresh ordering, and the persistence of a slice index on a mismatched section, are pre-existing static findings. All four are source deductions, not runtime receipts.
