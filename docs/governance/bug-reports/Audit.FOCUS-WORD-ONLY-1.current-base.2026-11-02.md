# FOCUS-WORD-ONLY-1 — current-base source and detector investigation

Date2026-11-02. READ-ONLY INVESTIGATION / NOT READY / NO SOURCE ADMISSION. Only this new audit is written. Plain Git object/history reads and source/test inspection were used; **no merge-tree, write-tree, checkout, worktree/index/ref mutation, tests, app/probes, helper/provider or executor communication**. Brain alone coordinates execution. Prepared117→123→119 is scheduling, **not a new requirement that117 merge or be accepted before123**. Owner resume/Brain coordination does not replace this item's fresh admission/custody.

## Recommendation and actual current-base result

Use the primary held PLAY-FIRST-TEXT input **ebea731111f82b162690f5a1306e9ed50c54cc9f** plus the named governing-main input **ac19ea60b6cd8b4fff3e5413b111925b7ef78485**, after Brain fixes actual source construction/custody and final tests. Do not select the historical e8e6-only fallback as an executor/planner convenience. This audit does not construct an integration tree or certify actual merge conflict resolution.

Read current AGENTS, current live lessons/statuses through LL-175, current canonical draft, ROADMAP123 card and historical FOCUS-WORD-ONLY-1.amendment.md. F-Q1 keep unused Focus helpers/pure tests; F-Q2 no Focus leading/trailing space with shared anchor and natural edge clamp; F-Q3 remove Focus band-off class are already closed. They need no new owner answer. Flow source/behavior stays unchanged.

Independent plain-object findings:

- `merge-base(ebea,ac19)` is **07e8e19b427b43ea8f5655c092b08a988487baab**.
- Comparing each side's changed-path set against that common ancestor gives **only docs/governance/BUG_REPORT.md** as an overlapping changed path. This is path-overlap evidence, not an executed merge result or permission to resolve whole documents by taking one side.
- ac19's three intended production files are **byte-identical to their common-ancestor blobs**; the held branch carries the Focus band changes. Thus ac19 supplies no independently competing change at those production paths in this named comparison.
- `88e82ba5..ac19` changes only ROADMAP, the2026-10-31 handoff and the three historical reader amendments. No application or band-test source changed on that interval.
- The four editable band tests and bandAlign2Forward.test.tsx exist on ebea, and were absent at the common ancestor/current ac19 source surface. Comparing ebea directly to ac19 therefore shows those tests as deleted; **that is not a deletion instruction or proof of a merge deletion**. Preserve them when constructing the approved held-source base.
- focusPlayFirstText.test.ts, focusKeys.test.tsx and all four band files exist on primary ebea. The new focusWordOnly.test.tsx is not a tracked file there.

Current recipe can therefore be narrowed to actual custody + named inputs + the docs overlap; no new technical application-source conflict is evidenced by these read-only comparisons. A merge/tree/parent still must be actually built and qualified only under the appropriate separate admission. Do not claim the historical resolved tree is current or create one in this audit.

## Held source raw identity witnesses

Raw SHA256 below was calculated over exact Git blob bytes, not shell-encoded display output. All rows refer to ebea.

| Path | Git blob | Lines | Raw SHA256 |
|---|---|---:|---|
| src/reader/modes/focus/FoliateView.tsx |ce7f19f782a900e87b57ffdfa6317493de3c4513|1406|1460b38fb5574570bd23fcb97ed649018311e31103ab4b655c41cf7e1bc38fb6|
| src/reader/modes/focus/mode.css |507b4f741e8aaad2102d93c839659b2dd796cd1e|383|789c1915b47fc1f5467a07e721ecae3ed611fcc8e09cd69a0784ab8c3f55dba4|
| src/components/ReaderBottomBar.tsx |1d5efa1be660e3e14ef8ac8913ee58ecb3b52ac2|482|4f01cdbdfadeb3eb9755801292503d1a6e41fa8cfa3762c2eef96a74dbd14ccb|
| tests/readerModes/bandAlign2R7.test.tsx |155bbb087ec1a1770335694ea827aa3417d935f4|314|f62a145d37b2904d873173b41249600d25dc1c2752fd9e5058a56afc9a7bf857|
| tests/readerModes/bandAlign2R8.test.tsx |57ba91e596a8391fceaffdbc3d989b3ac6eb27c4|377|3f01820db628abf72e3b3ccbebb3064ce9b4991d7b227144ef06ffe653fa7904|
| tests/readerModes/bandAlign2.test.tsx |146863de818cf33f1ec3800383d770453126d884|436|5b8b38a2bc9ac72ad1bab58c9008f2c4e31f20dfa9c8f5f124eac49233ea5986|
| tests/readerModes/bandAlign2Cover.test.tsx |5dd4d51c55b72ad61b500901a696c56c3379d8ed|187|b5e6b2d3c36128d726e129f5495ba2550ed96b11fb7d954da5d3f2d6b6ca60bb|
| tests/readerModes/bandAlign2Forward.test.tsx |3fd3f135f61ba82b879c7e591b43345dfb45d206|69|5c394b6700172476d52e7bb34a725ea953b1a890301f1f73f062648d61ba1dc1|

## Exact production WHERE and retained geometry

The existing draft's production sites are supported by the actual ebea object; they are not current ac19 band sites. Re-cite them at the eventual constructed base before source entry.

| ebea Focus view site | Exact current state / prescribed narrow consequence |
|---|---|
| imports36ff;473–487;500–516 | Actual inset setters/getters and imported paragraph/inset helper functions exist. Remove the view's unused imports/callbacks/callers; keep helper implementations and all pure helper tests per F-Q1. |
|491–518 | bandLayout contains `{anchor,on}` and appliedBandLayoutRef has type `{anchor:number;on:boolean}|null`. Reduce both live/comparison shapes to anchor-only, not just the JSX or runtime value. |
|524–556 | hideBand removes --flow-zone-* and adds band-off; placeBandAroundSpan paints paragraph edges and reads on. Both are removed in Focus only. |
|559–610 | getScrollPosition prefers renderer.containerPosition/size/viewSize, otherwise actual scroll element. alignSpanToBand keeps computeAnchorScrollTop and the >0.5px write threshold; delete only paint call609/dependency. Do not replace it with scrollIntoView. |
|702–732;734–750 | Highlight paints page-word--highlighted before optional motion/painting. Motion=true keeps align; false no longer paints band. Click/selection centres through centerResolvedTokenInReadingWindow and its ref; its scroll remains. |
|800–803;1283–1298 | Real load and settings reinjection each call injectStyles with dynamic inset getters. Both must pass explicit0 values and remove getter dependencies. Retained foliateStyles defaults are already0; it is not an edit site. |
|1309–1356 | Zone effect sets inset values, compares anchor/on, paints/hides, handles ResizeObserver and cleans up. Keep observer, invalidateWordPositionIndex and `scheduleWordPositionIndexRebuild("flow-zone-resize")`; remove only band/inset work and deleted dependencies. An anchor change still aligns an existing cursor. |
|1390 | Actual conditional root class adds band-off when on=false; becomes plain rm-focus-view. |
| mode.css33–61 | Two mask gradients plus custom-property defaults and band-off override exist. Replace with explicit prefixed/unprefixed none under the existing `.rm-focus-root .rm-focus-view` selector. |
| ReaderBottomBar368–384ff | Actual guard is focus||flow, with role groups `Band position` and `Band`, Band button and Top/Top third/**Center** labels. Narrow guard to flow; preserve real callback values/aria behavior. Test label spelling is Center, although prose sometimes says Centre. |

**Top anchor is not cursor y=0.** Actual retained helper `focus/helpers/foliateLayout.ts:86` returns bandHeight/2 for Top. `alignSpanToBand` uses readZoneLineStepPx×FLOW_ZONE_LINES_DEFAULT (R8's fixed geometry), even after mask removal. With existing fixture viewport630, line step27, default5 lines, literal cursor anchors are **67.5,210,315px** for Top/Top third/Center. Existing helper r4 already asserts this. Changing Top to0, removing the fixed line-height contribution or changing shared Flow anchor math would violate the retained contract.

For the R7 text fixture's no-inset natural boxes (`top=2.5+27*floor(i/5)`, height22), first word centre is13.5px. With no inset the first-word scroll clamps0 rather than manufacturing padding to put it at67.5/210/315. The first natural line remains at its existing2.5px fixture top; “starts at top/no leading space” must not be misasserted as a0px glyph bounding box. Midsection word100 centre553.5 gives literal unclamped scroll **486,343.5,238.5** respectively. These are independent arithmetic for the stated synthetic fixture, not measured Chromium geometry.

## Exact editable versus retained test fence

There are **three production files, four existing editable test files, and one new test file** (five changed test paths total). bandAlign2Forward is a fifth **existing read-only regression**, not an authorized fifth existing-test edit. If “five existing editable tests” is intended anywhere, correct that count to the actual historical amendment's four; no new fence expansion is required.

| Existing test | Exact editable Focus entries | Retained rows/source |
|---|---|---|
| bandAlign2R7.test.tsx | MODES159–160: remove Focus so w1(233),w2(245),w3(253),w4(268),w5(279),c1(291),c2(302) are Flow-only | LAYOUTS41 and pure a2/a4/b1 remain for Focus+Flow. Actual pure expectations include leadingTop[40.5,67.5,94.5], third210,center315; these test retained unused helpers, not active Focus padding. |
| bandAlign2R8.test.tsx | MODES178–179 removal affects w6(264),z1(277),w8(284). u1 loop349 becomes flow-only | LAYOUTS40/p1–p7 stay. **w9 at300 is already explicitly Flow-only and stays unedited**. k1 at372 (keyboard source contains no band setting writes) stays. |
| bandAlign2.test.tsx | r5 loop274 becomes flow-only; r6 at425 is replaced by new fw6 no-band-toggle-effect coverage | Pure helper loop217 (m1/r3/r4) remains. **m2 at405** and **p2 at415** remain unedited. |
| bandAlign2Cover.test.tsx | MODES79–80 Focus removal affects c6(152),c7(162),c8(174); new fw7 covers Focus zero-word/missing-cursor hops | All Flow case bodies remain unchanged. |
| bandAlign2Forward.test.tsx | NONE | f1 at48 uses actual Flow useModeBindings/runtime seam; checks paragraph band reaches placeBandAtCursor and no five-line fallback. Preserve file byte-for-byte. |

Actual m2 title/assertion: word7 centre411 at Top-third210 writes first scrollTop201, no scrollIntoView. Actual p2 uses renderer.containerPosition, size630/viewSize5000 and expects first renderer write201. Their source creates fixed fake rectangles; these prove the retained **code's scroll-port/math routing**, not native pagination or real computed CSS. Keep both, rather than replacing them with a source grep.

## Detector investigation — concrete fw1–fw7 mechanisms and boundaries

Existing band tests use jsdom and mock foliate-js/view.js. Their HTMLElement FakeFoliateView/fake paginator supplies contents, initial load, getCFI and scroll state. They install fake DOM rectangles/clientHeight and wait through mocked/real scheduled arrival work. **They do not load the actual Focus stylesheet.** Their ResizeObserver fake has no-op observe/unobserve/disconnect and does not retain/invoke callbacks. Copying these harnesses without changes would not exercise fw7 resize or prove fw1 computed masks.

| New row | Finite actual detector mechanism needed | Base/opposing evidence and qualification scope |
|---|---|---|
| fw1 paused/playing mask | Insert actual Focus mode.css into the test document under a real `.rm-focus-root` ancestor; use unmodified getComputedStyle on actual `.rm-focus-view`. Existing harness host alone lacks the ancestor. Exercise actual selected Focus paused/playing state without mocking the asserted mask property. | Base gradient must be observed, prescribed none; a wrong selector/retained mask must fail the same computed-style assertion. jsdom support has **not** been executed/qualified here. If unsupported/empty, do not turn empty into none or call CSS-source text a pass; retain native packaged check and obtain phase-scope disposition before relying on a substitute. |
| fw2 cursor/canonical/CFI | View fixture can check actual stamped word7's text/class/resolveWordState; it cannot alone prove runtime canonical/CFI preservation. Read-only runtime construction pattern exists in focusPlayFirstText.test.ts: createReaderPorts + createFocusRuntime + fake infrastructure; real useFocusModeBindings forwards actual snapshot and view callback paths. A new-test wrapper can mount the actual view with those props and inspect runtime.getSnapshot/exportHandoff plus fake persistence effects. | Freeze exact handoff/selected word/CFI input and expected port effects before source entry. focus.behavior.test.tsx uses a **stub FoliateView**, so its replay is retained broad regression, not the requested new actual-view bridge proof. No new runtime source edit is justified. |
| fw3 Focus controls absent | Use real ReaderBottomBar props/provider and role group selectors from actual r5/u1 harness; assert both named groups/Band button absent in Focus and no band callbacks fired. | Base has groups and button. Deliberately wrong Focus-mode selector/guard observation must fail absence detector. No source-string-only guard check. |
| fw4 Flow unchanged | Same real bar: click Top/Top third/Center, expect exact[0,1/3,0.5], Band on→false/off→true. Preserve existing Flow w6/w8/w9/f1 and mask source/native checks. | Actual retained r5/u1 controls provide positive callback evidence; unchanged source hash alone does not qualify native Flow mask. Narrate/Page source and existing regression suites remain intact. |
| fw5 zero insets/edge clamp | Reuse R7's text fixture live inset-derived rectangles but assert custom properties both0px for every rendered doc at each anchor, first-word scroll0 and natural first-line top2.5. Use literal anchors/scroll arithmetic above, not implementation helper to manufacture expected values. | Base has nonzero leading/trailing values at all anchors; wrong retained reinjection/inset hop must be detected. Fake rectangle results are synthetic code-path tests only. |
| fw6 cursor anchoring/toggle immunity | Preserve m2/p2; add the three-anchor mid-word literal values and anchor rerender. Capture reading word/CFI before/after reanchor. Snapshot all scroll/class/zone values; changing only flowBandEnabled must change none. | Base band toggle/paint/layout branch supplies opposing effect. Preserve `userBrowsingRef`/allowMotion behavior; this is no new follow policy. Real clamping/resize/native metrics remain packaged acceptance. |
| fw7 every outer hop | New harness must record and deliberately invoke the actual ResizeObserver callback(s), identifying the container-zone callback while retaining the separate resize observer. Trigger load, settings reinjection, both highlightWordByIndex motion choices, anchor change and cover; assert no zone properties/band-off and both insets0px after each. Rerender props/set content through the actual view's API rather than calling private helpers. | Existing no-op observer is insufficient. A test-local old-style zone/inset/class observation must fail the same predicate; an admitted dropped-hop source variant must fail the appropriate real path. Restore observers/prototypes/timers and unmount after each case; don't leave fixture state that makes later absence vacuous. |

The existing `focus/helpers/foliateStyles.ts:31–32` already defaults/rounds both inset options to0. Both actual callers passing0 plus a preserved zone observer are sufficient source directions; no helper deletion/default change is needed. The new harness's CSS wrapper/observer capture/runtime bridge belong inside the already allowed new focusWordOnly.test.tsx, not five new support files or production-only test hooks.

## Source construction and next pointer — finite technical gaps

No new owner-design choice is evidenced. Remaining work for Root→Brain before a usable phase pointer is finite:

1. **Actual source-cut/custody:** name immutable ebea+ac19 integration parent/tree, exact docs-only resolution and actual host branch/worktree/local checkpoint owner. Named-path overlap does not create a tree or certify actual host. Do not silently include117's repair branch or choose e8e6 fallback. Main update/variant selection is Brain's technical responsibility.
2. **Synthetic/native phase boundary:** explicitly separate actual-view/style-supported source assertions from computed-style/geometry rows that require real packaged Chromium. Qualify jsdom capabilities rather than assuming support or waiving native gates. Exact new-test setup/real stylesheet load must be frozen; phase Ready cannot mean those unbuilt tests already ran, while source checkpoint acceptance must have its required controls per SR44.
3. **fw2 exact ownership oracle:** freeze the actual-view/Focus-runtime bridge fixture, selected text/index/CFI and before/after handoff/port assertions. Existing replay stubs are insufficient to certify this row; no production callback/schema change is needed from inspected source.
4. **fw7 / opposing bytes:** freeze observer capture/trigger sequence and exact same-detector base/prescribed/wrong controls, including load/settings/cleanup/class/inset paths, within the new test only. Test-local contrary observations alone must not be sold as executed source-counterexample evidence.
5. **Bounded cuts and qualified inputs:** source/regression, full suite/type/build and package/probe need separately sized≤60m/40-call admissions with actual Node/dependencies/host/resource/evidence-root/consumption receipts. Exact external package-probe bytes/commands/full URL/profile controls remain to specify; the old path label is not custody.

Root can now replace stale generalized WHERE/base questions with these exact facts. There is **no observed reason to delete helpers, change Top geometry, widen the source fence, remove an observer/census anchor, modify Flow or add a117 merge prerequisite**. Final source specification remains held pending the above input/control facts and independent review; no actual test/qualifying run was performed.

## Preserved gates and lesson effects

F-Q1–3/current card and historical amendment remain controlling. Preserve three production/five changed test paths, unchanged Flow bodies/helper math/w9/f1/m2/p2, exact item-doc scope and full suite/typecheck/build. Rule53 paired x64/ARM64 build parity/raw ASAR identities, x64 initialized scratch25s/probe checks, ARM64 launch at merge, owner gate2 and Brain package confirmation→Roadmap merge go all remain. No actual Business/Native work or default settings change follows from this investigation.

Current lessons applied in this inspection: LL-090 actual source before prescription; LL-087 bandLayout/ref type/init details; LL-139 actual retained imports/census; LL-174 outer callbacks/observer forwarding; LL-120/121/125 independent mode ownership; LL-142 synthetic/native evidence boundary; LL-165 scratch proof deferred; LL-172 no timing-helper write; LL-175 unrelated PDF bytes untouched. Current rule44 annotation plus rules43/55 require sensitive actual causal detectors, not text-only or empty-property null verdicts. No lesson promotion/retirement or full U9 mechanical claim is made by this narrow audit.
