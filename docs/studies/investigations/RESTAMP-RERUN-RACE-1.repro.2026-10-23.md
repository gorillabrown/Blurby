# RESTAMP-RERUN-RACE-1 — reproduction evidence (2026-10-23)

**Verdict: branch (A), fixed.** The deterministic harness opened the interleave window: k1 held in every interleave case, and a probe proves run 2 ran on the document. On the base, rr1 (W1, same data), rr3 (held turn) and rr5 (StrictMode) are green. rr2 (different data) and rr4 (W2, a section missing from the set) are red. The census shows that a rendered section with words can be missing from `bookWordSections` (a duplicate-href spine), so the decision rule's rr4 clause selects (A). The red tests were committed alone first. The spec's four edits to the effect turn rr2 and rr4 green, and every existing test stays green and unedited.

- **Base:** `eb/restamp-rerun-race-1` @ `ec914abf` = `origin/eb/jump-landing-save-1` @ `8a7c9db6` with `origin/main` @ `28ec48e2` merged in (clean).
- **Effect under test:** `src/reader/modes/page/FoliateView.tsx:1102-1130` on the base. Lines re-grepped on `ec914abf` (rule 36): `sectionWrapsRef` `:318`, the load's registered wrap `:671-673`, `sectionStart` `:1111`, the wait `:1113`, unwrap `:1114`, `sectionWords` `:1115`, the unregistered wrap `:1117`, the delete `:1119`, the held-turn report `:1120`, dependencies `:1130`. `WRAP_BATCH_SIZE` = 50 at `foliateWordWrapping.ts:11`, yield at `:143-144`, the skip of a detached node at `:133`. All as the spec cites.
- **Harness:** `tests/readerModes/pagePositionSave.test.tsx`, `describe("RESTAMP-RERUN-RACE-1")`. `mount` takes an optional `{ strict?: boolean }`. Run: `npx vitest run tests/readerModes/pagePositionSave.test.tsx -t "RESTAMP-RERUN-RACE-1"`.

## 1. Identity census (rc0, measured; LL-142)

rc0 drives the real Page runtime and its document port (`createReaderPorts` over the fake infrastructure; `runtime.select` subscribes `adoptDocument`) through `usePageModeBindings` in a host component. The host records each distinct non-empty `bookWordSections` identity the view receives while the paginator has contents.

| Action | New identities | Running total |
|---|---|---|
| Section loads, no book words yet | 0 | 0 |
| Book words arrive: the view's request resolves, then the shell's port emits the new snapshot | 1 | 1 |
| Settings change (`runtime.applySettings`) | 0 | 1 |
| Page turn (Next page; saves `["doc-1", 22, "cfi:3:gamma"]`) | 0 | 1 |
| `renderVersion` bump (`onWordsReextracted`; version rose) | 0 | 1 |
| Second port emission with the same book words (the shell's cached snapshot) | 0 | 1 |

**Measured count: 1.** rc0 asserts it.

| Identity source | File:line on `ec914abf` | Measured / finding |
|---|---|---|
| Book words set once per document id (dedupe) | `src/components/ReaderContainer.tsx:291` | One value per document. |
| `setBookWordsState`, the only writer | `ReaderContainer.tsx:293` (state declared `:196`; no other writer in `src/`) | — |
| Shell emits only when book words change | `ReaderContainer.tsx:519-523` (deps `[bookWords, getDocument]`, `getDocument` is a `useCallback` with `[]` at `:211`) | — |
| Snapshot deep copy and freeze | `src/reader/document/ReaderDocumentSnapshot.ts:112`, `:169-170` | A newly built snapshot is a new identity. |
| **New:** the shell's snapshot cache | `ReaderContainer.tsx:216` | A rebuild happens only when an input changes; a re-emission with the same inputs is the same object. |
| Page adopts only an emitted snapshot | `src/reader/modes/page/ModeRuntime.ts:215-223` | — |
| **New:** the runtime keeps a frozen snapshot as-is | `ModeRuntime.ts:120-122` (`own`), `:220` (`next === this.documentSnapshot` returns) | Re-emitting the same snapshot gives 0 new identities (rc0, last row). |
| **New:** the port passes the snapshot through | `src/reader/ports/createReaderPorts.ts:120-127` | The callback is wrapped for liveness only; no copy. |
| The view reads `document.bookWords?.sections` | `src/reader/modes/page/useModeBindings.ts:36` | — |
| StrictMode double run | `src/main.tsx:22` | At mount only, with no contents (rr5 proves it: `readBookBytes` called twice, `getContents()` is `[]`). |
| W2's only path: a rendered section missing from the set | `src/reader/modes/page/helpers/foliateWordOffsets.ts:48-49`; extractor `main/epub-word-extractor.js:223-228` (no href, duplicate href, no zip entry), `:271` (no words) | A duplicate-href spine (malformed EPUB) can render a section with words that the set omits. So a missing section is possible. |
| **New:** what `getContents()` can hold | `node_modules/foliate-js/paginator.js:1127-1133` (one section); `:1006-1012` (each load makes a new view); `fixed-layout.js:308-312` (iframes, no `index`) | W2 needs a second indexed section in the contents during the wait. The reflowable paginator never holds two. Fixed layout has no `index`, so every page takes the loaded-slice start for `undefined`, which is 0 before and after the wait. |

**Conclusion of the census:** within a mount the section data never changes, so rr2's trigger is not reachable. A rendered section can be missing from the set, but its loaded-slice start cannot move during the wait, so W2's stale `sectionStart` always equals the fresh one.

## 2. Reproduction harness on the base (no code change)

Fixture: section 3, 160 `<p>Word{i}</p>` blocks (3 yields), canonical `Word0..Word159`, S1 = `[{ sectionIndex: 3, startWordIdx: 20, endWordIdx: 180, wordCount: 160 }]`. Fake timers fake `setTimeout`/`clearTimeout` only.

**k1 (window check):** `span.page-word` count is 50 after S1 arrives, so run 1 is parked at its first yield. It held on the first attempt in rr1, rr2 and rr3, and in rr4 for section 1's load wrap. No fallback (setTimeout spy) was needed. **Run 2 ran:** in rr1–rr3, run 1's first span is tagged `data-rr-probe` at k1. Only another run's unwrap removes it, and after the drain it is gone. (Quality review finding 4.)

| Case | k1 | o1 | o2 | o3 | o4 | o5 | o6 | o7 | Base `ec914abf` | Fix |
|---|---|---|---|---|---|---|---|---|---|---|
| rr1 W1, same data, new identity | 50 ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | **green** | green |
| rr2 sensitivity, `startWordIdx: 40` | 50 ✓ | ✓ | ✓ | ✗ | ✗ | — | ✗ | — | **red** | green |
| rr3 held turn | 50 ✓ | — | — | — | — | ✓ | ✓ | — | **green** (saved once `["doc-1", 22, "cfi:3:Word2"]`, no `page-turn-lost`) | green |
| rr4 W2, section 0 loads beside section 1 during the wait | 50 ✓ | — | — | — | — | — | — | ✗ | **red** | green |
| rr5 StrictMode, S1 at mount | — | ✓ | ✓ | ✓ | ✓ | — | ✓ | — | **green** (open effect ran twice; contents empty during the double run) | green |

### Failing output on the base, verbatim

rr2 (`base-run1`, before rr2 was removed from the file):

```
FAIL  … > RESTAMP-RERUN-RACE-1 > (rr2) sensitivity control: a new identity with different data during run 1's wrap
AssertionError: o3 numbering: expected [ [ 40, 'Word0' ], …(159) ] to deeply equal [ [ 40, 'Word0' ], …(159) ]
-     90,
+     70,
      "Word50",
  … 110 entries differ: Word50..Word159 carry run 1's 20-based numbers (70..179), Word0..Word49 run 2's (40..89)
AssertionError: o4 duplicate indices: expected 140 to be 160 // Object.is equality
AssertionError: o6 index build: expected 'reason=section-restamp words=140 dupl…' to contain ' duplicates=0 '
Expected: " duplicates=0 "
Received: "reason=section-restamp words=140 duplicates=20 buildMs=1.27"
```

The interleave runs as the review described: run 1 (cancelled) resumes first at each yield and wraps the next 50 groups, and run 2 skips the nodes run 1 already replaced (`foliateWordWrapping.ts:133`). With the same data (rr1) the two runs stamp the same numbers, so they converge.

rr4, spec fixture (`renderer.contents = [{ doc: doc0, index: 0 }, { doc: doc1, index: 1 }]` during the wait):

```
FAIL  … > RESTAMP-RERUN-RACE-1 > (rr4) W2: a section missing from the set is stamped from the words present when it wraps
AssertionError: o7 section 1 start: expected +0 to be 5 // Object.is equality
AssertionError: o7 no overlap with section 0: expected false to be true // Object.is equality
```

W2 is real in this fixture: `sectionStart` (0) was read before the wait, and the words at wrap time put section 1 at 5. Foliate's reflowable paginator holds one section at a time (`paginator.js:1127-1133`; each load makes a new view, `:1006-1012`), so two indexed sections in the contents is the fixture's shape, not the reflowable reader's. The rule does not ask for that check, and the fix costs four lines, so it is recorded here as context, not as a reason to skip the fix. A reachable-shape variant (section 0 replaces section 1) was also run, green on the base. It was not committed: the quality review (finding 3) showed it cannot prove that the re-stamp parked.

### Harness note (rr5)

Under StrictMode, the second open effect imports `foliate-js/view.js` while the first import is pending. That import misses `vi.mock` and evaluates the real `view.js`, whose `customElements.define("foliate-view")` throws "This name has already been registered" (stack: `view.js:582` ← `FoliateView.tsx:547`). Warming the import from the test did not help. rr5 stubs `customElements.define` for the mount only, so the fake element stays. This is a test-environment artifact: the app defines `foliate-view` once.

## 3. Decision

**Branch (A).** The rule takes (A) "if rr4 is red and the census shows that a rendered section with words can be missing from `bookWordSections`". Both hold:

- rr4 is red on the base (above).
- The extractor skips a spine item whose href it has already processed (`epub-word-extractor.js:224`), and foliate renders every spine item. So a duplicate-href spine renders a section with words that the set omits.

rr2 is red too. It does not decide anything (rc0 measures one identity per document), but it shows W1 directly. The first build of this item took (B), arguing that rr4's shape is unreachable. The spec-compliance review (Solon) ruled that the rule is mechanical and forbids a verdict by argument (LL-142), and the item was rebuilt as (A).

- **Red first** (`dd0b8524`, rule 43): rc0 and rr1–rr5 on the base. rr2 and rr4 fail with the output above; the other 59 tests in the file pass.
- **Fix**, only in the effect (`FoliateView.tsx:1102-1130` on the base):
  - `if (cancelled) return;` after the wait.
  - `sectionStart` is read after the wait (W2), keeping its `< 0` skip.
  - The re-stamp's own wrap is registered: `const rewrap = wrapWordsInSpans(…); sectionWrapsRef.current.set(doc, rewrap); await rewrap;`.
  - `if (cancelled) return;` after that await, before `rendererNumberedDocsRef.current.delete(doc)`. The held-turn report's own `!cancelled` check became redundant and was dropped.
- **After the fix:** the file passes 61/61, three runs in a row. A second run now waits on the first run's registered wrap instead of interleaving, and a cancelled run stops before it clears the renderer-numbered mark or reports a held turn.
- **The spec's failure-handling case:** a cancelled run returns without renumbering when the next dependency set is empty. The effect returns early on an empty set (`:1103`). Within a mount the set is never emptied: rc0 measures one identity, and the data is fixed per document. Emptying it needs a document switch, which remounts the view (dependencies `[doc0.filepath, doc0.documentId]`). No test covers this; this is the stop reason. A cancelled run followed by a non-empty set is covered by rr1–rr3.

## Out-of-scope observation

In fixed layout (`pre-paginated`), `getContents()` returns every iframe without an `index` (`fixed-layout.js:308-312`). The re-stamp then numbers every page in a spread from the loaded-slice start for `undefined`, which is 0, so two pages in a spread would carry overlapping `data-word-index` values. Not measured here, because no fixed-layout fixture exists in this file. Noted as a follow-up candidate.
