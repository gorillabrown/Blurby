# BLOCK-TEXT-ORDER-1 — frozen source trace and technical hold

Date: 2026-10-27. Author: Blurby.Brain, thread 01a179e8-7a40-75c0-93f4-d3045ad99027.

Scope: Phase D READ-ONLY source/specification analysis. Source baseline is exactly f61ae02ddf16a023314369685d4dbfcab1ac9a36. References below are repository-relative paths and one-based lines AT THAT COMMIT, not the moving checkout. Supplied/current AGENTS instructions governed this analysis; AGENTS.md and the Codex protocol files are absent from the old source commit. Two independent read-only source explorers covered Flow/Focus and Page/Narrate wiring; Brain traced main, suppression and canonical alignment. This file is the only requested artifact mutation. No application edit, prospective implementation/diff, dependency installation, test, fixture creation, experiment, process launch or owner-library access occurred.

## Decision

HOLD: the originally proposed four-renderer-helper-only grouping change cannot be certified to preserve canonical global stamping or all fallback behavior. Keeping main's word array unchanged preserves that array's numbering; it does not establish that a DOM word receives the right index, that a provisional index cannot be persisted, or that fallback speech uses the same words.

The source establishes three separate blockers: (1) main and renderer accept different footnote-target text; (2) canonical alignment may consume a missing word or match the wrong duplicate, with no completeness/source-correspondence certificate; (3) canonical-unavailable paths can use renderer grouping for playback, selection and persistence. These are technical source findings, not new measured bug reproductions. No Ready/source-entry decision follows from this report.

Recommendation: keep GROUP's raw-run objective and old main tokenization/cues, but finish an explicitly widened correctness specification for accepted-text equivalence, verifiable canonical alignment and provisional/hydration authority. Do not quietly add WORD joining/migration or promise that helper changes alone protect saved positions. Parent owns any governing specification/fence/register amendment.

## 1. Immutable source inventory

| Source | Git blob at f61 |
|---|---|
| main/epub-word-extractor.js | 2213c28846f9a8d4af9bd14f4e08a52c3aed605f |
| main/zip-read.js | 22c44a42f153e91f24c5e2a4295ff18d540e4c56 |
| main/constants.js | d9c663f2562795855e1d05dbd274697e074fa31a |
| Page helpers/foliateHelpers.ts | 7f93941937c6657814e3427314603e33857de8bc |
| Focus/Flow/Narrate helpers/foliateHelpers.ts (each) | 02beba13ec11dc5bc4c057a1ed03074ac0a211f0 |
| All four helpers/foliateWordWrapping.ts (each) | 7149222c7cb4c0270470422441f2e6862f0147d2 |
| Legacy src/utils/foliateHelpers.ts | 282b7b740ee357ca3f69f5bf705d51aba545eeba |
| src/components/ReaderContainer.tsx | 823e7246f510c368d5da547e7f93c2a8dfc7d337 |
| main/ipc/tts.js | 8754a7f96833830cb85d9443bd106356d5d65419 |
| src/utils/naturalChunks.ts | 3c0c568db494bc1da1467ce2adb6d783c031fa67 |
| Separation census boundary-policy.json | 588656c0c1c3a83ec3749588b102abf3b3e24d98 |

The four independent wrapper files are byte-identical at this pin. This supports one algorithm analysis applied to four actual copies; it does not authorize a shared mutable store or sibling-runtime import. The legacy utils helper has test consumers in the checked reference census; leave it outside the production edit fence unless a completed trace finds a live production edge.

## 2. Main and shared document authority

Main's extractBlockPlans at main/epub-word-extractor.js:107-157 recursively appends each Text node as its own text part inside a block. walkInline does not split a nested recognized block into a separate plan. extractWords:235-268 segments EACH text part separately; it appends punctuation locally and never runs the renderer's touching-word join across parts. The section offsets are cumulative indices in that main word array (:271-278). GROUP must preserve these existing output words, sections, totals and cues; its proposed pure ordered-run helper is separate and must not activate new numbering.

Footnote targets are discovered from reference hrefs (:81-104). isFootnoteBodyNode:49-65 suppresses any element whose id is in that target-ID set, in addition to semantic attributes/classes. Inline references produce a cue part only for a resolvable target with nonempty existing-policy text (:120-125). Cues are normalized and get afterWordIdx = allWords.length - 1 at their legacy part boundary (:237-246).

main/ipc/tts.js:162-174 forwards the extraction result unchanged through extract-epub-words. preload.js:165 exposes the extraction call. ReaderContainer:274-299 deduplicates extraction and freezes copied words, sections and cues, binding the result to the document ID; :196-197 only exposes a matching document's bookWords. ReaderDocumentSnapshot:27-51 declares the data read-only; :104-113 and :169-170 copy/freeze plain values. A grouping edit cannot mutate this frozen main result, but mode/view state can still apply it incorrectly.

The checked main/src/preload references for footnoteCues and afterWordIdx reach producer, transport, immutable retention and type definitions. They do not establish an active reader-mode footnote scheduling consumer. Preserve the data contract; do not claim current immediate-read audio behavior from a historical test title.

## 3. Actual grouping and canonical alignment

Page foliateHelpers:107-142 and other mode copies:86-121 group all accepted Text nodes by nearest block Element in a Map and emit block groups in first-encounter order. A parent encountered again after a nested child reuses its original Map entry. buildWordsFromTextNodes (Page:173-204; others:152-183) concatenates that group's text without inserted separators, calls unchanged segmentWordSpans and attaches token/block/line metadata.

All four foliateWordWrapping.ts:19-66 use indexOf to find each canonical word in the concatenated group text. If it is absent, :49-63 peek ahead by up to eight canonical words; finding a later word causes the absent word to be consumed without a span. Text equality is not source-occurrence identity. :98 selects canonical alignment only for a NONEMPTY canonical slice. :100-148 carries its canonical cursor across groups; the fallback independently segments grouped text and assigns consecutive indices. The returned numeric next index is not a proof of exact alignment.

### Source-derived examples, not executed fixtures

1. Nested interleaving: an outer div containing text before, then an inner p containing inside, then outer text after. With explicit spaces, old main's per-part order is before / inside / after. The renderer Map combines before+after in the outer group, then emits inside. The canonical wrapper can stamp before at index 0, skip the absent inside because after is found ahead, stamp after at index 2, and leave the later inside group unwrapped. A contiguous-run traversal can correct this particular ordering, but that example alone is not a general compatibility proof.

2. Suppression/duplicate counterexample: body begins with a div id x1 whose text is alpha beta, followed by a p whose text is alpha, a semantic noteref anchor href #x1 containing marker 1, then a space and beta. Main's target set suppresses the first div; its canonical words come from the real p and are alpha / beta. Renderer isFootnoteBodyElement (Page:76-89; others:55-68) has no target-ID-set check; x1 has no semantic note attribute or matching note-class/id spelling, so its text is accepted. The first div can therefore receive canonical indices 0 and 1, while the actual p receives none. This variant needs NO skip-ahead: all canonical words are consumed successfully in the wrong source occurrence. Correcting group order alone does not fix it; a consumed-count check alone does not fix it either.

3. Missing-word variant: use beta alone in the first x1 target div. Main remains alpha / beta from the p. The wrapper can skip alpha through its lookahead, stamp beta at global index 1 in the target, and consume both canonical positions. This isolates the lossy skip branch independently of the duplicate-match case.

These deductions follow directly from the frozen predicates, traversal and alignment loop. They are not runtime failures, test receipts, actual book incidence counts or an assertion about the owner's library.

## 4. Four independent view/runtime routes

| Mode | Canonical plumbing and view traversal | Relevant runtime/persistence consequence |
|---|---|---|
| Page | ModeView:4-13 -> own FoliateView; surface:29-34 returns view-derived words. ModeRuntime:623-626 slices matching main section; useModeBindings:36-38 supplies section metadata/getter. FoliateView:647-664 fully extracts loaded contents on every section load and wraps the arriving section. :1085-1112 unwraps/restamps when metadata arrives. | ModeRuntime:640-646 selects main words if present, else surface/token words. FoliateView:566-634 holds provisional page saves, but :663 tests overall section-list presence rather than a complete matching canonical slice. ModeRuntime:305-335 can set provisional selection/resume state while holdSave suppresses immediate persistence; :606-619 handles the later restamped held save. |
| Focus | useModeBindings:42-54 -> own surface/view; ModeRuntime:966-971 canonical section slice. FoliateView:689-706 fully re-extracts all loaded words/breaks for each incoming section and wraps it; :1119-1146 restamps visible sections on hydration. Surface:40-46 exposes loaded words/paragraph starts. | ModeRuntime:1092-1099 chooses main, then surface, then token words; :904-915 updates fallback engine words on re-extraction or canonical paragraph breaks after main arrival. Click path FoliateView:713-757 -> runtime:1107-1134 -> persistent anchor. |
| Flow | useModeBindings:139-151 -> own surface/view; ModeRuntime:1158-1163 canonical slice. First load FoliateView:769-784 fully extracts loaded words and break set; subsequent load :740-767 replaces only the arriving section, uses remaining-cache length as fallback offset and does not refresh the cached break set there. :1199-1226 restamps after metadata arrives. | ModeRuntime:1450-1457 chooses main/surface/token words; :1079-1091 handles re-extraction. Click FoliateView:792-836 -> runtime:1465-1492 -> persistent anchor. Loaded-cache order and fallback offsets need distinct first/incremental/hydration controls. |
| Narrate | ModeView:6-15 -> own FoliateView; surface:41-48 returns view strings. ModeRuntime:610-613 canonical slice; useModeBindings:68-70 forwards it. First load FoliateView:808-824 fully extracts; later load :780-807 replaces one section after remaining cached sections. :1238-1262 restamps on metadata arrival. | ModeRuntime:265-302 copies effectiveWords and starts the engine BEFORE requesting missing bookWords. :735-741 prefers main, else surface, else tokens. Snapshot adoption :231-238 does not replace an already running engine. Click FoliateView:860-876 -> runtime:749-760 can persist/retarget speech without Page's held-save parameter. |

All helper/view/runtime paths above are real mode-local files under src/reader/modes/<mode>/. The thin router/mode isolation remains unchanged.

### Book-stamped and range-checked are weaker than content-proved

Flow marks bookStampedDocsRef after wrapping when a section boundary exists (FoliateView:744-756 / :781-784); Focus does so at :698-706. This does not prove the canonical slice was nonempty, that content alignment was selected, or that every canonical occurrence mapped correctly. Page's provisional marker similarly checks overall section metadata, while getCanonicalSectionWords can return undefined for this particular section. A resolved numeric index in bounds is not a source-correspondence certificate.

Flow/Focus foliateWordOffsets:43-50 prefer matching full-book section start, otherwise loaded-slice start; :109-130 trusts a resolved in-range number. Runtime click resolution prefers supplied global indices, then section-start+offset, then a section-local fallback. Hard selection reaches usePersistentReadingAnchor:78-102, which calls updateDocProgress/updateProgress. Thus a grouping-induced DOM stamp can reach newly saved state even with main's existing word array unchanged.

## 5. Paragraph, run identity and chunk consumers

Every emitted group is currently treated as a paragraph: Flow/Focus/Narrate helpers:233-250 and :257-268; Page:254-274 and :278-291. The last word of each nonempty group gets paragraphBreakAfter, and loaded extraction records that group's ending index. blockOrdinal is current group order and blockId is sectionIndex:blockOrdinal:blockTag. Splitting a repeated parent into several runs therefore changes more than DOM painting. Freeze the distinction between a contiguous source run, semantic block identity and paragraph ending before changing these values.

Flow/Focus foliateParagraphStarts:8-44 separately scan actual body/block elements, find each block's first own stamped word and return sorted unique global indices only for documents marked book-stamped. bookParagraphBreaks:52-62 converts starts into start-1 and adds the last book index. ModeRuntime consumes these for engine pauses (Flow:961-971; Focus:785-795) and paragraph keys (Flow:974-987; Focus:798-811). A resumed parent run's new metadata is not automatically represented by this DOM-element-first-word collector.

Flow ModeRuntime:488-511 copies Foliate block/token/line/paragraph metadata into chunk-source words when arrays have the same LENGTH, without checking equal content/order. :1370-1387 only supplies that metadata when full-book words are absent. Its canonical path omits Foliate metadata and caches across render bumps (:1375-1377). naturalChunks:42-62 consumes global indices/chunk IDs; :77-86 and :189-201 consume heading tag and contiguous blockId; :89-93 and :204-207 use paragraph/source-line flags as hard delimiters. Focus has no production buildNaturalChunks import in the frozen reference census.

Narrate stores renderer paragraph breaks in its view (FoliateView:812, :1113-1116), but its surface does not forward that break set. Runtime chunkBreaks:646-659 uses canonical section ends when words equal main's book array, otherwise document tokenized paragraph breaks. Do not infer Narrate paragraph timing changes merely from the view's stored break set. The direct Narrate risk is renderer fallback WORD SOURCE/order before main is available.

## 6. Cue and boundary contract retained

GROUP preserves production main per-part tokenization and legacy afterWordIdx output, normalization and event order. Its pure prospective run plan can retain source cue events without activating a new numbering path. Recognized BLOCK_TAGS entry/exit remains a boundary even with empty/suppressed text; suppressed non-block inline nodes introduce neither text nor a separator. Do not broaden block classification to CSS display or all aside elements.

For red + inline resolvable noteref + blue without whitespace, the prospective accepted run text is redblue; a missing target produces no cue under the existing main policy. WORD, later, applies its separately specified source-offset mapping: prior-run word count + number of canonical spans whose start is before cue offset - 1. A cue inside redblue maps after the whole canonical word; no within-word timing, injected separator or new playback behavior. This report adds no cue activation or WORD implementation.

## 7. Required specification correction before GROUP source readiness

1. Keep raw contiguous-run order/offset/cue parity as GROUP DoD and preserve old tokenizer sources. Full canonical word-array joining/parity belongs to WORD. However, raw parity must use the same ACCEPTED text on both sides; freeze a referenced-target suppression equivalence contract or explicitly retain HOLD for unsupported cases. Merely preserving two differing old suppression predicates cannot satisfy this universal assertion.
2. Specify source-aware, non-lossy canonical correspondence before treating a wrap as book-stamped or allowing a renderer-derived global index to persist. The existing lookahead/substring matcher and return count are insufficient certificates. Any implementation proposal must name all four mode-local wrappers as potential edits, plus actual view completion/marking/restamp call sites; the original helpers-only fence is insufficient. Do not fix this by changing main's word array or bypassing WORD migration.
3. Specify canonical-missing, empty, missing-section, load-failure, loaded-section refresh and hydration behavior explicitly. Preserve the legacy fallback extraction/numbering path until new canonical correspondence is available, or separately specify/gate changes to mode start/selection authority. Narrate's pre-canonical speech source and Flow/Focus immediate persistent selections make a blanket no-impact claim false. Any changed wait/start/speech behavior that requires an owner functionality choice must be presented as such; do not infer it from raw grouping approval.
4. Name the real call-site fence if the selected correction needs it: four foliateWordWrapping.ts, four FoliateView.tsx/useModeBindings.ts/surface.ts paths and affected ModeRuntime.ts/paragraph collectors/naturalChunks. These are INVESTIGATION/POTENTIAL CORRECTION sites, not blanket edit permission. Only freeze the final minimal subset after the exact rule/consumer tests are independently reviewed. ReaderContainer/types/shared core remain read-only unless a distinct evidenced amendment names them.
5. Decide run identity versus semantic paragraph identity explicitly; changing every group to a new paragraph by default is not justified. Preserve Flow's canonical paragraph/keys behavior and state the exact intended fallback differences. Trace first-load, Flow incremental, Focus full extraction and restamp ordering separately, including when engine refresh occurs relative to successful stamping.
6. Required future causal/opposing assertions include nested before/child/after, empty block, root orphan, inline touching text, referenced plain-ID note target before/after body, repeated canonical words, missing/empty/mismatched section metadata, partial/mismatched alignment, all four modes' click/save/start authority, hydration/restamping, Flow fallback chunk metadata and paragraph keys. Preserve actual base receipts; a static deduction is not a red test. No test/fixture or prospective diff was created here.
7. Before prospective WORD measurements, freeze the independently reviewed GROUP algorithm/accepted-text/metadata/canonical-authority diff as an explicit artifact input. If these gates remain unresolved, keep GROUP and the original prospective pilot NOT READY; do not manufacture a numerical table from an adapter that silently repairs the missing rules.

## Evidence limit and current disposition

This report proves source reachability and exposes source-derived counterexamples to the unconditional preservation claim. It does not prove incidence in the two public EPUBs, runtime behavior, package correctness, saved-position compatibility or audio acceptance. No normal profile or fixture was opened. The baseline/source references and ordinary Git/read commands were the evidence inputs.

Final disposition: GROUP specification NOT READY under the narrow helper-only premise. Complete the named correctness/authority/semantic contracts and obtain independent review before source or pilot admission. Existing source freeze, canonical prerequisite statuses, separate historical-provenance hold, native-observer qualification and release/package/owner gates remain unchanged. Parent should carry the non-trivial suppression/alignment/fallback discoveries into the governing issue and lessons through its owned documentation flow; this artifact makes no project-document or provider mutation.
