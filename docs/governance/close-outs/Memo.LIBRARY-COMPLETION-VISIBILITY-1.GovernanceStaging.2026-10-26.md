# LIBRARY-COMPLETION-VISIBILITY-1 — built and held

**Disposition:** source/regression implementation complete; package gate FAILED on a proven pre-existing ResizeObserver error. No main merge, terminal completion, installation or release. Parent review and designated package confirmation remain.

## Baseline and scope

- Base: main/origin/main `d8a65cb41f4095a93eb7a198bd91939833c5ea0d`, containing the approved specification, visibility ownership admission and governance follow-through. Production source matches the reviewed source pin.
- Isolated worktree: `C:/Projects/Blurby/.worktrees/library-completion-visibility-1`, branch `eb/library-completion-visibility-1`. Native managed tool returned "Not a git repository" from the stale chat root; Git fallback used the verified ignored `.worktrees/` directory. Reserved branch was fast-forwarded without resetting history.
- Source fence: `src/components/LibraryView.tsx` and new `tests/libraryCompletionVisibility.test.tsx`. Production change is one line: remove only the upper-wordCount predicate from `readingNow`. Engagement threshold3, sorting, upstream status/type/search filters, callbacks and persistence remain unchanged.
- Shared-core touches: none. No other mode, Card, LibraryContainer, IPC, type/schema or progress edit. APP-TABS-1 stays held and later integrates this accepted source result per the admission.

## Commits

| Commit | Content |
|---|---|
| `4e86673544fd3ed8d68fd3f5d619efc84e59b23f` | Red real-LibraryView tests; no filter/card mocks. |
| `183dd247af783ce2a737b6132673bb09d9ef39f7` | Test harness opens the actual Search control before typing; final detector committed on original production source. |
| `0dd4d94026f2574f735031b2b1569aee09d17120` | One-line production fix; this exact source candidate was packaged. |

## Verification evidence

Artifacts: `C:/Projects/Blurby-artifacts/library-completion-visibility-1-20261026/`. No personal books or audio are included.

| Command / control | Result | Evidence |
|---|---|---|
| `npm ci` | exit0; native Node arm64 v24.14.0 | npm-ci.log |
| Base `npm test`, before first edit |181 files,2451 passed,2 skipped,0 failed |base-suite.log|
| Final test file against original source |12 missing-card assertion failures,6 positive controls pass; no harness exceptions |red-final-detector.log, red-failure-nodes.json|
| Final test file against fixed source |18/18 pass|green-final-detector.log|
| Targeted four-file command from specification |67/67 pass|green-targeted.log|
| Candidate `npm test` |182 files,2469 passed,2 skipped,0 failed|candidate-suite.log|
| `npm run typecheck` |exit0|typecheck.log|
| `npm run build` |exit0|build.log|
| `npx electron-builder --win --arm64 --dir --publish never` |exit0|package-build.log|

All lv1–lv6 cases execute the real library component and actual list/grid cards (`data-doc-id`). lv0 and unknown-wordCount cases are the six base-green controls. The final detector was deliberately rerun against the original source after the Search helper correction, then restored candidate-green. No production scope change was needed.

### Exact base-red node set

- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv1) 91/91 remains once in All with unchanged data and no persistence callback (grid)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv1) 91/91 remains once in All with unchanged data and no persistence callback (list)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv2) completed archive record appears once in Archive and not All (grid)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv2) completed archive record appears once in Archive and not All (list)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv3) complete and over-complete cards reopen through their existing callback (grid)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv3) complete and over-complete cards reopen through their existing callback (list)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv4) all boundary positions have one actual card; wordCount=91 (grid)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv4) all boundary positions have one actual card; wordCount=91 (list)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv5) New/Favorites/type/search filters retain inclusion and exclusion (grid)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv5) New/Favorites/type/search filters retain inclusion and exclusion (list)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv6) progress and archive/unarchive transitions never lose or double a card (grid)`
- `tests/libraryCompletionVisibility.test.tsx > completed reads remain visible (LIBRARY-COMPLETION-VISIBILITY-1) > (lv6) progress and archive/unarchive transitions never lose or double a card (list)`

## Package verification — not a PASS

- Exact candidate: `0dd4d94026f2574f735031b2b1569aee09d17120`, current approved origin/main already in its ancestry. Later memo/timing commits change no shipping file; compare `git diff --name-only 0dd4d940..HEAD -- main.js preload.js main dist assets package.json package-lock.json` before any merge.
- Package: `C:/Projects/Blurby/.worktrees/library-completion-visibility-1/release/win-arm64-unpacked/Blurby.exe`. PE machine ARM64 `0xaa64`.
- Executable SHA256: `5e9cae9911e0eafcba67581c9833a9b7af07eb9a0c70410f48d0dafd7b73d608`.
- app.asar SHA256: `36882f3894b9008e798e6473094031b78c633c55952ead626ed22a5b09090a5e`.
- All 21 files in local dist match app.asar byte-for-byte; packaged main.js matches source and contains BLURBY_USER_DATA_DIR. Receipt: asar-parity.json. Windows-native archive entry separators are required by the installed asar API.

### Profile identity and actual acceptance

Every launch used both BLURBY_USER_DATA_DIR and --user-data-dir to a fresh owned profile. Before first input/IPC mutation the main inspector read back exact userData, executable, PID, arm64 and isPackaged=true; normal-profile hashes were checked. Profiles and fixture originals are retained.

- Baseline36ac7466, PID 17608: survived 26,013ms; native packaged instance; All showed only owned-control, Archive showed no completed card. Its visible incomplete control opened the same 91-word EPUB body.
- Candidate PID 52628: survived 26,007ms; native packaged instance. Grid All contains owned-complete/control; Archive contains owned-archive, and real list view also shows it. Initial rendering preserves every seeded position/wordCount/archive field.
- Actual complete-card click opens the owned EPUB; Foliate renderer.getContents reads exactly 91 distinct ownedword1–ownedword91 tokens. Return to library leaves the record findable exactly once in Archive, and clicking it reopens the same 91 tokens. Screenshots: candidate-v3-grid-all.png, -grid-archive.png, -list-archive.png, -reader.png, -after-return.png, -reader-reopen.png. The reader screenshot was visually inspected.
- Existing exit behavior is retained: the 91/91 seed becomes position 90, archived=true after exit. The visibility fix does not implement confirmation-first completion or redefine progress; AUTO-ARCHIVE-1 owns that separate change. The initial display-only checks and all unit callback checks prove this fix itself makes no persistence call.
- Both package runs have zero renderer exceptions and no crash dump. Both owned main processes were stopped; no installed app was killed. Desktop window was released to the parent.

### Non-waived package blocker

Candidate has 1,465 error.log entries; unchanged baseline has 1,471. Every entry in both runs has the exact family `Unhandled: ResizeObserver loop completed with undelivered notifications.` This is the existing BUG-187 family and is not standing-rule 53 permitted noise. The standard no-error package criterion therefore FAILS despite successful visibility behavior and survival. No log suppression, waiver, unrelated fix or source merge was performed. Parent routes the issue and retains In Flight/build-and-hold.
- Exact receipts: candidate-v3-package-result.json, baseline-v2-package-result.json and their full error.log files under each scratch profile. The full logs remain local, not pasted into governance files.
- Earlier harness attempts remain: candidate-profile used an obsolete manual-TXT fixture and reached the existing re-import fallback; candidate-v2 used a valid EPUB but its open shadow-DOM traversal could not inspect Foliate closed content. The final control uses the same actual renderer.getContents API as production. These failures are not app regressions or package passes.

### Normal-profile preservation

- `%APPDATA%/blurby/blurby-data/library.json`: `1921551191807bb646f3567ffef07a0bec4487aecfdb6bc224ece9fb70573d1f`; unchanged after all owned candidate/baseline launches.
- `%APPDATA%/blurby/blurby-data/settings.json`: `64483188e030adf062b7516389f69f5c0835649fc6f12bcf48c1b20042badfec`; unchanged after all owned candidate/baseline launches.

## Review and handoff

Applicable lessons LL-090 (actual source), LL-030 (engagement/persistence boundaries), LL-165 (actual profile proof) and standing-rule 53/LL-167 (package errors hold completion) were followed. No new architectural lesson is claimed; the known error family reinforces the existing guardrail.
The parent owns spec/quality review, live register changes, BUG_REPORT and terminal close-out. This branch is a reviewable built-and-held result. A green source suite does not authorize its main merge, release, terminal completion or the package-verifier confirmation. Unrelated generated tests/perf-baseline-results.json remains unstaged in this worktree.
