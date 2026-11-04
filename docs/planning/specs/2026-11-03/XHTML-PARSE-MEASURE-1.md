#### XHTML-PARSE-MEASURE-1 — Measure whether parsing chapters as strict XHTML removes unverified chapters *(Seq 87.9; Full Spec 2026-11-03, traced at `origin/main` `14ce3d24` and built on BLOCK-TEXT-ORDER-1's specified checker, which is not merged yet; Reader Engine; investigation first (Blurby.Brain1 D4 ruling); Q1 ruled by Blurby.Brain1 2026-11-03; dispatch-ready once BLOCK-TEXT-ORDER-1 merges and Brain1 confirms the host's inputs; effort M; execution host RodneySr)*

- **What:** measure how many of the sections BLOCK-TEXT-ORDER-1 (BTO) cannot certify are caused by main and the reader parsing the same chapter file differently. The measurement runs over 20 named Project Gutenberg EPUBs, first as main parses today and then with a prototype that parses as XML. It ends in a memo with the numbers and a recommendation that Brain1 rules on. No product code ships from this item.
  - **Outcome:** one table that says, per book and in total, how many sections certify today, how many certify under the prototype, how many get worse, and what the remaining failures are. Plus a yes/no recommendation under the decision rule below, which is fixed before the run (Q1).
  - **Out of scope:**
    - any change to `main/epub-word-extractor.js` on a branch that merges. The prototype lives on a scratch branch that is never pushed to `main`;
    - the renumbering itself and the migration of saved positions (WORD-INDEX-UNIFY-1, if the decision rule says yes);
    - the renderer's tag-case handling (BLOCK-TAG-CASE-1);
    - adding an XML validator dependency. The memo names a candidate and its size only;
    - reading the owner's library. Only the 20 books below are read.
- **Why (root cause, rule 6c):**
  - Every word index the reader saves or starts from has to match main's word list. BTO certifies that match per section and holds a section's clicks and saves to the cfi when it fails. UNCERTIFIED-ANCHOR-HOLD-1 adds the safety net for Play. Those are safety nets. The cause of a failed section is that two programs number the same words.
  - One named cause is the parser (D4). Main parses each section with `cheerio.load(text)` (`main/epub-word-extractor.js:230`), which in cheerio 1.2 is the parse5 HTML parser. The reader parses the same file as `application/xhtml+xml`, a strict XML parse. The two disagree on real markup:
    - a self-closing anchor `<a id="x"/>` is a start tag to HTML, so the anchor swallows the text after it;
    - HTML moves stray table content out of the table (foster-parenting), and XML does not;
    - HTML named entities such as `&nbsp;` decode in HTML and are a parse error in XML without a DTD.
  - Main already parses the container and the OPF in XML mode (`:183`, `:197`), so the idiom exists. Parsing sections the same way could remove D4. But it would also renumber every book that changes, and Brain1 ruled that a renumbering must not happen twice (Brain1 ruling below). So the share has to be known first (Pike rule 1).
  - The sample book certifies 18 of 18 sections, so it cannot answer the question. The owner approved downloading 20 Gutenberg EPUBs for it (2026-11-03).
- **Origin:** Blurby.Brain1, `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.UNCERTIFIED-ANCHOR-HOLD-1.and-D4.2026-11-03.md`, section "D4: main parses section XHTML in xmlMode": "measure first", with three traps to answer and a decision rule. The owner chose the corpus through AskUserQuestion: "Download 20 Gutenberg EPUBs (Recommended)".

##### Design decisions

- **Attribution by difference, not by reading failures.** The checker's failure reasons (`invalid-canonical-word`, `canonical-exhausted-dom`, `unmatched-source-word`, `extra-source-text`, `no-canonical-slice`) say where the match broke, not why. So D4 is measured as the difference between two runs of the same checker on the same files:
  - **D4 share** = sections that are uncertified on the base run and certified on the prototype run, divided by sections uncertified on the base run;
  - **regressions** = sections certified on the base and uncertified on the prototype, counted separately and never netted silently.
  - The sections that fail on both runs are labelled mechanically from the failure detail (M2): `anchor` when the failing node is inside an `<a>` whose `href` starts with `#` (the footnote classes D1/D2); `blank` when the canonical word or node text is empty or whitespace (D3); `other` otherwise. The memo lists up to five `other` examples with book, section and snippets.
- **One checker, one runtime (LL-152, LL-160).** The measurement reuses BTO's Electron ICU checker (B5) under the same packaged Electron for both runs. The base and the prototype differ only in the one parse call.
- **Scratch prototype, never merged.** The prototype is one commit on `eb/xhtml-parse-measure-1-proto`, branched from the item branch. It changes `:230` to `cheerio.load(readEntry(entry).toString("utf-8"), { xmlMode: true })`, the idiom of `:183` and `:197`. Nothing else changes, so the traps show in the numbers instead of being fixed in advance. The branch is pushed for the record and never merged.
- **Decision rule fixed before the run (Q1, ruled).** The threshold for "meaningful" was set by Brain1 before any number exists, so it cannot be fitted to the result. `summarize.mjs` computes the verdict.
- **Text in the output.** The corpus is public domain, so `-detail` snippets are allowed in the checker's output. They are capped at 40 characters, and `-detail` is off by default. The checker never runs `-detail` on a book outside the corpus manifest.

##### Corpus (owner approved 2026-11-03)

Twenty Project Gutenberg EPUBs, chosen for markup variety: plain prose, letters and diaries, poetry, a play, heavy footnotes, tables and very long books. Each is fetched from `https://www.gutenberg.org/ebooks/<n>.epub3.images`.

| # | Ebook | Expected title (match key) | Why it is in the set |
|---|---|---|---|
| 1 | 1342 | Pride and Prejudice | plain prose baseline |
| 2 | 84 | Frankenstein | letters nested in a narrative |
| 3 | 2701 | Moby Dick | extracts, epigraphs, long chapters |
| 4 | 11 | Alice's Adventures in Wonderland | verse inside prose, images |
| 5 | 1661 | The Adventures of Sherlock Holmes | short stories, dialogue |
| 6 | 345 | Dracula | diary and letter headings |
| 7 | 98 | A Tale of Two Cities | books and chapters nested |
| 8 | 1400 | Great Expectations | long prose |
| 9 | 174 | The Picture of Dorian Gray | preface and epigrams |
| 10 | 76 | Adventures of Huckleberry Finn | notices, dialect |
| 11 | 1260 | Jane Eyre | prose with a preface |
| 12 | 1524 | Hamlet | a play: speakers and stage directions |
| 13 | 1322 | Leaves of Grass | poetry lines and indents |
| 14 | 1228 | On the Origin of Species | tables and an index |
| 15 | 4300 | Ulysses | unusual typography |
| 16 | 1404 | The Federalist Papers | footnotes |
| 17 | 2600 | War and Peace | very long; footnotes with French |
| 18 | 996 | Don Quixote | many translator's notes |
| 19 | 8800 | The Divine Comedy | verse with heavy notes |
| 20 | 3207 | Leviathan | marginal notes |

- **Match rule.** Lowercase both titles and keep only letters and digits. The OPF `dc:title` must contain the expected title under that rule. A mismatch is a STOP to Blurby.Roadmap with the OPF title. The implementer never substitutes a book.
- **Where the files live.** `C:\Projects\Blurby-artifacts\xhtml-parse-measure-1\corpus\` on RodneySr, outside the repository. The EPUBs are never committed.
- **Polite fetch.** One request at a time, 5 s apart, with the User-Agent `Blurby-measurement/1 (single run, 20 files)`. A file whose SHA-256 already matches the manifest is not fetched again.
- **Known limit.** All 20 books come from one generator (Gutenberg's ebookmaker), so they may be cleaner than publisher or converted EPUBs. The memo says so. A negligible D4 share on this corpus is "rejected for now", and the memo says whether a second corpus is worth asking the owner for.

##### Blurby.Brain1 ruling on Q1, the "meaningful" threshold (2026-11-03, binding; fixed before any corpus number exists)

Source: `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.XHTML-PARSE-MEASURE-1.Q1.2026-11-03.md`.

- **Counted section:** a section with at least one word on the main side or the renderer side in either run. A section with no words on either side in both runs (a cover image, for example) is left out of every count. The memo states how many were left out.
- **B** = counted sections uncertified on base. **Up** = counted sections uncertified on base and certified on xml. **Down** = counted sections certified on base and uncertified on xml, including sections that lose their slice under the prototype.
- **D4 is meaningful** when either holds:
  1. `Up − Down ≥ 3` and `(Up − Down) / B ≥ 0.10`;
  2. one book with at least 3 base-uncertified sections has every one of them certified on xml, with `Down = 0` in that book.
- **D4 is negligible** otherwise, including when `B = 0`. With `B = 0`, the memo records that BTO's shared acceptance rule (G-A) already removed the failures on this corpus.
- **Every down flip is root-caused (rule 6c).** The memo names each with its cause (entity, lost slice, parse error or other) and the evidence. A "yes" carries each cause as a requirement on the shipped parse change in WORD-INDEX-UNIFY-1. The prototype is never shipped as is while any down flip has no fix.
- **Renumbering reach (memo only, not part of the threshold).** Per book, the number of sections that certify on both runs but whose canonical word count differs between base and xml. They would be renumbered with no certification gain, so the count sizes WORD-INDEX-UNIFY-1's migration.

The planner's earlier recommendation (1 in 10 net, or one whole book) is superseded by this ruling.

##### Execution host (rule 6b)

- **Host:** RodneySr (the quiet machine).
- **Repository:** a worktree of `eb/xhtml-parse-measure-1`, branched from `origin/main` after BTO's merge, at `<clone>\.worktrees\xhtml-parse-measure-1`.
- **Prerequisites:** BTO merged; network access to `www.gutenberg.org`; about 200 MB free under `C:\Projects\Blurby-artifacts`; one `--dir --x64` package of the item branch's base, for the checker's runtime proof (BTO B5 step 1).
- **Brain1 confirms** the host's inputs and access before launch.

##### WHERE (read order)

1. `CLAUDE.md` rules 6a–6c and standing rules 53 and 55.
2. `docs/governance/LESSONS_LEARNED.md`: LL-142, LL-143, LL-152, LL-160.
3. Brain1's D4 ruling (path above).
4. `docs/planning/specs/2026-11-03/BLOCK-TEXT-ORDER-1.md`, B5 (the checker) and contract B.2 (the certifier and its reasons).
5. `main/epub-word-extractor.js`: `:19` (`BLOCK_TAGS`), `:130-140` (`walk`, which lowercases tag names), `:183` and `:197` (the XML-mode idiom), `:228-232` (the section parse).
6. `scripts/block-text-order/icu-certify/main.js` and `run.ps1` (after BTO merges).

##### Tasks

- **M1. Corpus fetch.** New `scripts/xhtml-parse-measure/fetch-corpus.ps1`. It downloads the 20 books in the table to the corpus folder and writes `corpus.manifest.json` beside them, with one entry per book: `{ebook, expectedTitle, url, bytes, sha256, opfTitle}`. It applies the match rule and exits 2 on a mismatch, naming the book and its OPF title. It exits 0 when all 20 are present and match. A copy of the manifest, without the EPUBs, is committed as `scripts/xhtml-parse-measure/corpus.manifest.json`.
- **M2. Checker corpus mode.** Two additions to BTO's checker (`scripts/block-text-order/icu-certify/main.js` and `run.ps1`). Both are off by default, so a run without them is unchanged:
  - `-epub <path>`: the book to check. The default stays `resources/sample-meditations.epub`.
  - `-detail`: each section entry carries `mainWords` (the section's canonical word count) and `rendererWords` (the number of text words the renderer side found), so the summary can apply the counted-section rule and the renumbering reach. Each failure also carries `canonicalWord`, `nodeSnippet` (the failing node's text, at most 40 characters), `inFragmentAnchor` (the failing node is inside an `<a>` whose `href` starts with `#`) and `rendererParseError` (the section's XHTML parse produced a `parsererror` element). Each section entry also carries `namedEntities`: the count of entity references in the raw section source other than `amp`, `lt`, `gt`, `quot`, `apos` and numeric ones.
  - `-detail` is refused (exit 6) unless `-epub` names a file whose SHA-256 is in `scripts/xhtml-parse-measure/corpus.manifest.json`.
- **M3. Runner.** New `scripts/xhtml-parse-measure/run-corpus.ps1 -variant base|xml -packaged <exe>`. For each manifest book it runs the checker with `-epub` and `-detail` and writes `C:\Projects\Blurby-artifacts\xhtml-parse-measure-1\results\<variant>\<ebook>.json`. It records each run's exit code. Exit 1 (uncertified sections) is an expected result here, not a failure. Exits 3, 4, 5 and 6 stop the runner.
- **M4. Prototype.** On `eb/xhtml-parse-measure-1-proto` (branched from the item branch after M3), one commit changes `main/epub-word-extractor.js:230` as in Design decisions and nothing else. Run M3 with `-variant xml` from that branch, using the same packaged exe. Push the branch with `git push origin HEAD:refs/heads/eb/xhtml-parse-measure-1-proto`, and never merge it.
- **M5. Summary.** New `scripts/xhtml-parse-measure/summarize.mjs <resultsDir>`. It prints and writes `summary.json` and `summary.md` beside the results:
  - per book: sections, counted sections, sections with a slice, certified on base, certified on xml, Up, Down, sections with `rendererParseError`, sections with `namedEntities > 0`, and the renumbering reach (certified on both runs, `mainWords` differs between them);
  - totals: excluded sections, B, Up, Down, `Up − Down`, `(Up − Down) / B`, and which clause of the Q1 rule holds, if any (the verdict `meaningful` or `negligible`, computed, never typed by hand);
  - every down flip listed with book, section, reason and the trap columns, for the memo's root cause;
  - base-uncertified sections by label: `d4` (flipped up), `anchor`, `blank`, `other`;
  - a check that the four mode copies report the same failures for every section. A disagreement is printed and exits 1.
- **M6. Traps (from Brain1's ruling), each answered from the corpus:**
  - **Leniency.** How many sections have a renderer `parsererror` while main's XML-mode parse produced words anyway. That count shows whether "fall back when the XML parse fails" could ever trigger in main. Name one strict validator candidate and its unpacked size from `npm view <name> dist.unpackedSize`. Add no dependency.
  - **Entities.** How many sections carry named entities, and how many of the flips down coincide with them.
  - **Tag case.** How many sections lose their slice under the prototype (for example `$("body")` matching nothing). `walk` already lowercases tag names (`:134`), so `BLOCK_TAGS` itself is not exposed. Say so with that line.
  - **`<a id/>` swallow and table foster-parenting.** One real example of each from the corpus (book, section, a source snippet of at most 40 characters, and the base and xml word counts for that section), or "none found", with the search used.
- **M7. Memo.** `docs/governance/close-outs/Memo.XHTML-PARSE-MEASURE-1.<date>.md` with the summary table, the D4 share, the regressions, the labelled remainder, the four trap answers, the corpus limit and the recommendation under the Q1 rule. Brain1 rules on it. A "yes" opens the parse change as part of WORD-INDEX-UNIFY-1's renumbering event, specified by Blurby.Roadmap. A "no" closes D4 with the numbers.

##### Execution Sequence

1. M1 (fetch), then M2 (checker flags), then M3 with `-variant base`.
2. M4 (prototype branch and the xml run).
3. M5 (summary) and M6 (traps), which can run in parallel. Both are read-only over the results.
4. M7 (memo), then the close-out.

##### Done when

- **x1.** `fetch-corpus.ps1` exits 0. The manifest has 20 entries, each with a SHA-256 and an OPF title that passes the match rule.
- **x2 (no regression in the checker, standing rule 55).** On the item branch, `run.ps1 -packaged <exe>` with no new flags prints the same JSON that BTO's close-out recorded for the sample book, apart from timing (`stampMs`), and exits 0. `run.ps1 -packaged <exe> -control` still exits 1. `run.ps1 -packaged <exe> -epub resources/sample-meditations.epub -detail` exits 6.
- **x3.** `results/base/` and `results/xml/` each hold 20 files, and no run exited 3, 4, 5 or 6.
- **x4.** `summarize.mjs` exits 0. Every per-book row is present, and the four mode copies agree on every section.
- **x5.** The memo answers all four traps, each with a count or an example and the search used.
- **x6.** The memo states B, Up, Down, the computed Q1 verdict and the renumbering reach, and names every down flip with its cause and evidence. Brain1's ruling is recorded under it.
- **x7 (fence).** `git diff --name-status origin/main...eb/xhtml-parse-measure-1` lists only:
  - `A scripts/xhtml-parse-measure/fetch-corpus.ps1`
  - `A scripts/xhtml-parse-measure/run-corpus.ps1`
  - `A scripts/xhtml-parse-measure/summarize.mjs`
  - `A scripts/xhtml-parse-measure/corpus.manifest.json`
  - `M scripts/block-text-order/icu-certify/main.js`
  - `M scripts/block-text-order/icu-certify/run.ps1`
  - `A docs/governance/close-outs/Memo.XHTML-PARSE-MEASURE-1.<date>.md`
  - the close-out and its register and roadmap updates.

  No path under `main/`, `src/`, `preload.js` or `tests/` is listed. `eb/xhtml-parse-measure-1-proto` is not an ancestor of the item branch.
- **x8.** `npm test` exits 0 with at least the base count, and `npm run typecheck` exits 0.
- **x9 (standing rule 53).** Nothing under `build.files` changes, so the close-out records "package unchanged" with the x7 diff.

##### Lane and parallel fences

- **Lane ownership:** Reader Engine (product). Execution surface B (evaluation harness): `scripts/xhtml-parse-measure/`, plus the two checker files.
- **Forbidden during a parallel run:** `main/`, `src/`, `preload.js`, `tests/`, and the prototype branch's edit reaching any other branch.
- **Shared-core touches:** none.
- **Merge order:** after BTO. Independent of UNCERTIFIED-ANCHOR-HOLD-1 and of CFI-POSITION-CONSISTENCY-1. If WORD-INDEX-UNIFY-1 is specified before this closes, it waits for the memo.

##### Lessons applied

- **LL-142:** the numbering claim is measured by running main's real extractor and the renderer's real certifier on real files, not argued from the parsers' documentation.
- **LL-143:** x2 dry-runs the checker change against the base behaviour, the control and a refused flag before any corpus number counts.
- **LL-152:** one checker, one packaged runtime for both variants.
- **LL-160:** segmentation depends on the runtime's ICU, so both runs use the checker's Electron runtime proof.
- **Standing rule 55:** the positive control exits 1 before the live run counts.
- **Rule 6c:** this item exists because the hold is a safety net; it measures the cause.
