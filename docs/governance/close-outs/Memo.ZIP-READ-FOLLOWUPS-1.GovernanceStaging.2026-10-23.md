# Dispatch Close-Out Governance Staging — ZIP-READ-FOLLOWUPS-1

Branch `eb/zip-read-followups-1` from `refs/remotes/origin/main` @ `dcafc800`, in worktree `C:\Projects\Blurby\.worktrees\zip-read-followups-1`. Build only: the merge is held for the Stage 8 freeze and needs Blurby.Roadmap's go. The run wrote nothing to the register (standing rule 46).

## Rulings during the run

- **Archive cap value (Blurby.Brain, tier 1, 2026-10-23): (b), `ZIP_FILE_MAX_BYTES = 2 GiB − 1`.**
  - The specification's 512 MiB rested on "an archive larger than the operation cap cannot be read within that cap once its entries are read". That holds only if a parser reads every entry, and none does:
    - `extractWords`: container.xml, the OPF and the spine documents;
    - `extractContent`: those, plus nav and ncx;
    - the cover path: one image;
    - `validateEpub`: the mimetype and the OPF.
  - So a 700 MiB EPUB of mostly unread media, with every entry under 64 MiB, imports today, and a 512 MiB cap would have refused it.
  - 2 GiB − 1 is where Node's whole-file read already fails, so the cap only turns that throw into an early, clean refusal.
  - The memory bounds against decompression bombs stay as they were: `ZIP_ENTRY_MAX_BYTES` (64 MiB) and `ZIP_OPERATION_MAX_BYTES` (512 MiB inflated).
- **Follow-up to file, from Blurby.Brain:** ZIP-ASYNC-READ-1 (S, Library & Content, not a gate).
  - adm-zip's path constructor reads the file synchronously (`fs.readFileSync`), which breaks the standing rule that main-process file I/O is async.
  - Its job: in `openZip`, `fsPromises.readFile`, then hand the buffer to adm-zip, with the cap checked on the stat. That also closes the stat-to-read gap.

## Evidence by Done-when

| # | Result | Evidence |
|---|---|---|
| 1 | Met | `b046684c` commits only the archive-cap tests ((o), (p)) and the time log. `npx vitest run tests/zipEntryCap.test.js -t "archive size cap"` on the base exits 1: (o) fails at its first assertion ("expected { …(4) } to deeply equal { words: [], sections: [], …(2) }", because `extractWords` read the whole file); the size precondition and control (p) pass. |
| 2 | Met | `git grep -n -E 'new (AdmZip|Zip)\([A-Za-z]' -- main` prints one line, `main/zip-read.js:18: return new AdmZip(filePath);`, exit 0. On the base it printed the five sites: `epub-converter.js:1054`, `epub-word-extractor.js:170`, `file-parsers.js:361`, `:551`, `:629`. |
| 3 | Met | `describe("archive size cap")`: (o) lowers `ZIP_FILE_MAX_BYTES` to 1024 on a `buildEpub()` file over 1 KB. All five callers take their open-failure paths exactly as specified: `extractWords` an empty table; `extractContent` "Could not open this EPUB — the file may be corrupted."; `extractEpubCover` null with no cover file; `extractEpubMetadata` nulls; `validateEpub` invalid with `/too large/`. A `fs.readFileSync` spy shows the file is never read (review N2). (p) is the control with the cap restored. |
| 4 | Met, with a recorded deviation | (q) keeps `ZIP_ENTRY_MAX_BYTES` at default and lowers `ZIP_OPERATION_MAX_BYTES` to 6144: `extractWords` rejects `/too large/`, and reads the file again with the default cap. **Deviation:** the specification's recipe (chapter and cover 4096 bytes each) cannot trip the cap, because `extractWords` never reads the cover. Measured: it resolves with 820 words; container 221 + OPF 394 + chapter 4170 = 4785 bytes. (q) uses `chapterBytes: 4096, opfPadBytes: 2048` (221 + 2449 + 4170 = 6840 bytes). Every entry is under the entry cap and only the operation total trips. The reviewer judged this intent-preserving. |
| 5 | Met | (n) sets `ZIP_ENTRY_MAX_BYTES = 4096` on `buildZip({ "a.txt": { data: eightK(), stored: true } }, 16)` (header size 16, method 0). It throws `ZIP_ENTRY_TOO_LARGE`, with `getCompressedData` called once and `getData` never. **Mutation control:** with `if (raw.length > cap) throw tooLarge();` deleted, (n) fails ("expected undefined to be 'ZIP_ENTRY_TOO_LARGE'"). The line was restored, and `git diff -- main/zip-read.js` then showed only this item's `openZip`. |
| 6 | Met | `npx vitest run tests/zipRead.test.js tests/zipEntryCap.test.js`: 21 of 21, exit 0. |
| 7 | Met under the closed-list rule | See "Gates" below. |
| 8 | Met (three-dot) | `git diff --name-status refs/remotes/origin/main...HEAD` lists exactly the seven files (`main/zip-read.js`, `main/constants.js`, `main/epub-converter.js`, `main/epub-word-extractor.js`, `main/file-parsers.js`, `tests/zipRead.test.js`, `tests/zipEntryCap.test.js`) plus this memo and the time log. The two-dot form also lists `main`'s later commits, because the branch base is `dcafc800`. |

### Gates

- **Base, tree `44a914ad`:** vitest 2,428 passed, 1 skipped, 2 failed, while about 31 node processes ran (other sessions' builds).
  - The failures: `epub-2b-pipeline.test.js` "extractArticleFromHtml returns contentHtml…" (a timeout), and the `folderWatcher.test.js` BUG-193 guard (77 ms against its 50 ms budget).
  - Both files pass alone, twice (27 of 27).
  - This is the pre-existing load list.
- **Change, tree `1dba114f`:** vitest 2,433 passed, 1 skipped, 1 failed (the `folderWatcher` BUG-193 guard only, in the pre-existing list); typecheck 0; build 0. The +5 passing tests are this item's new tests at that commit.
- **After the review fixes, tree `64a66fd9`:** vitest 2,436 passed, 1 skipped, 0 failed in 727 files (exit 0); typecheck 0; build 0. That is +8 passing over the base's 2,428: this item's six new tests ((o), (p), (q), (n), (r), (s)), plus the base's two load failures passing this run.

## Review (one combined spec-compliance and quality pass)

The review found no blockers, and every Done-when it could check read-only was met.
- **S1, the cap value.** Ruled by Brain as above.
- **S2, error text for a missing path.** `stat` turned a missing path's open error from `ADM-ZIP: Invalid filename` ("…appears to be a corrupted ZIP archive.") into `ENOENT…` ("…may be corrupted."). That is user-visible text the specification did not authorize. **Fixed:** a stat failure now falls through to adm-zip (`stat(...).then((s) => s.size, () => 0)`), and test (s) pins the base's message.
  - (s)'s first version was vacuous, because the missing path sat in the test's `zip-entry-cap-` folder, so even the raw `ENOENT` text contained "zip".
  - It now uses a path without "zip" or "invalid", and asserts that. It passes on the code and fails on the mutant without the fallback.
- **N1 (applied):** the dead `const AdmZip = getAdmZip();` in `extractContent` (dead on the base too), and so `file-parsers.js`'s `getAdmZip` and `_admZip`. `epub-word-extractor.js`'s helper went in the first commit. `epub-converter.js` keeps its helper, because `buildEpubZip` needs it. The stale comment "Opens the EPUB via AdmZip" now names `openZip`.
- **N2 (applied):** (o)'s `readFileSync` spy. A mutant that opens before checking fails it.
- **N3 (applied):** (q) drops the `coverBytes` argument, which had no effect.
- **N4:** recorded below.
- **Test (r), per Brain:** a 700 MiB archive, its size stubbed through `fs/promises.stat`, is admitted and reads; a size of cap + 1 is refused. With the cap back at 512 MiB, (r) fails.

## Lessons

- **Applied:** standing rule 43 (LL-138), Done-when 1 red on the base; standing rule 44 (LL-143), Done-when 2 re-grepped on the base; LL-151, every new assertion seen failing (four mutants: STORED size check, cap value, stat fallback, read order); LL-142, the no-regression claim tested by reading the parsers rather than accepted from the specification, which found S1; standing rules 41, 46, 47, 48 and 50.
- **Proposed (provisional label; reassign at fold-in):**
  - *LL-new — A size-based no-regression argument must use what the code reads, not what the file contains.* "Larger than the read cap, so it cannot be read today" assumed every entry is read. Each parser reads a few entries, so large archives with unread media pass today.
  - *LL-new-b — A test of error text must keep the input out of the text it matches.* The first missing-path test used a temp folder named `zip-entry-cap-…`, so an error message containing the path matched "zip", and the test passed on the broken code.

## Target: ROADMAP.md

### Fold-in 1 — Correct the cap reasoning and value
Section: §ZIP-READ-FOLLOWUPS-1, "The cap's value is a no-regression bound"
Action: Replace
Old: the three lines beginning `- **The cap's value is a no-regression bound:** \`ZIP_FILE_MAX_BYTES = 512 MiB\``
New: `- **The cap's value is a no-regression bound (Blurby.Brain, 2026-10-23):** \`ZIP_FILE_MAX_BYTES = 2 GiB − 1\`, where Node's whole-file read already fails, so the cap only turns that throw into an early, clean refusal. No parser reads every entry (extractWords reads the container, OPF and spine), so an archive above the 512 MiB operation cap can read today; the memory bounds are the 64 MiB entry cap and the 512 MiB operation cap.`

### Fold-in 2 — Done-when 4 recipe
Section: §ZIP-READ-FOLLOWUPS-1, Done-when 4
Action: Replace
Old: `It builds an EPUB whose chapter and cover are each 4096 bytes. Each entry is under the entry cap, and together they are over the operation cap.`
New: `It builds an EPUB with a 4096-byte chapter and a 2048-byte OPF pad (extractWords reads the container, OPF and spine, not the cover). Each entry is under the entry cap, and together they are over the operation cap.`

### Fold-in 3 — Line reference
Section: §ZIP-READ-FOLLOWUPS-1, Done-when 5
Action: Replace
Old: `` (`main/zip-read.js:22`) ``
New: `` (`main/zip-read.js`, `createEntryReader`, the method-0 branch) ``

## Target: docs/governance/LESSONS_LEARNED.md

### Fold-in 1 — LL-new, LL-new-b
Section: end of file
Action: Append row
Content: the two proposed entries under "Lessons", numbered at fold-in.

## Open items for the close-out

- Register ZIP-ASYNC-READ-1 (Brain's follow-up above).
- Merge after the freeze lifts, on Blurby.Roadmap's go: `origin/main` is taken in first, and the gates are re-run on the combined tree.
