# LIBRARY-COMPLETION-VISIBILITY-1 — Package checks on the combined candidate (RodneySr job 3, 2026-10-30)

**Scope (Blurby.Brain, 2026-10-30):**
- `2d5772d3` is the combined candidate. It contains the visibility fix `0dd4d940` (tip `a8e31b73`), the observer-leak fix `51759276` and the display-lifetime fix, with `origin/main` `e29117b2`.
- Its x64 package and rule-53 result are reused from `FOLIATE-DISPLAY-LIFETIME-1.native.2026-10-30.md`: `app.asar` `c58a2b3a…` is identical for x64 and arm64.
- Only this item's own package checks run here.
- No new build. A merge of `origin/main` `80dbe938` started in `C:\Projects\lcv1-comb` was stopped by this ruling and is not evidence.

**Spec:** `ROADMAP.md`, `#### LIBRARY-COMPLETION-VISIBILITY-1`, Done-when 4, and its verification contract (x64 under standing rule 53's temporary placement). The seed's source is `Memo.LIBRARY-COMPLETION-VISIBILITY-1.GovernanceStaging.2026-10-26.md` on `a8e31b73`.

**Seed:** the item's INITIAL state.
- The supplied fixture (`refs/archive/rodneysr-inputs/foliate-display-lifetime-1`, `fixture-owned91/`) holds the later exit state. `run.mjs --seed owned91-initial` therefore restores `owned-complete` from position 90, `archived=true` to position 91/91, `archived=false`, with `archivedAt` removed.
- `owned-archive` (91/91, archived) and `owned-control` (3/91) are left as supplied.
- The three `filepath` fields are rewritten to the profile's own copy of `owned91.epub`.

Each launch had:
- a fresh scratch profile, with APPDATA and LOCALAPPDATA in scratch;
- the LL-165 proof before any input: scratch `userData`, `isPackaged` true, x64, PID matches;
- the live `library.json` and `settings.json` unchanged.

Raw data: `C:\Projects\Blurby-artifacts\library-completion-visibility-1-rodneysr\`.

## Result: PASS

| Check | Candidate `2d5772d3` | Base `36ac7466` (defect control) |
|---|---|---|
| Initial fields as seeded (read before input) | yes | yes |
| Grid All | `owned-complete`, `owned-control` | `owned-control` only |
| Grid Archive | `owned-archive` | empty |
| List All / List Archive | `owned-complete`, `owned-control` / `owned-archive` | `owned-control` / empty |
| Reader opens the 91-word body | `owned-complete` from All: 91 distinct `ownedword` tokens; reopened from Archive after return: 91 | `owned-complete` has no card. The visible `owned-control` (same EPUB) opens with 91 tokens (`-ctrlopen-5`) |
| After return | `owned-complete` once in Archive (existing exit policy: 90/91, `archived=true`) | — |
| error.log | none written: 0 ResizeObserver-loop, 0 style-null lines | 264–265 ResizeObserver-loop lines, 0 style-null |
| Crash dumps / stdout-stderr flags | none | none |

- The candidate's exit fields show the existing exit policy (90/91, `archived=true`, with an `archivedAt` stamp). AUTO-ARCHIVE-1 owns that; this item does not change it.
- The base's exit fields equal its initial fields, because its complete card was never opened.
- Spec suites on `2d5772d3`: `npx vitest run tests/libraryCompletionVisibility.test.tsx tests/folderNoticeBanner.test.tsx tests/useLibrary.test.ts tests/saveLibraryMerge.test.js` gives 4 files, 67/67 passed.
- `npm test` gives 2,523 passed, 1 skipped, 0 failed; typecheck 0; build 0 (the job 2 memo).

**Harness failures, retained:** base runs `-ctrlopen`, `-ctrlopen-2`, `-ctrlopen-3` and `-ctrlopen-4` read 0 tokens.
- The cause was `ctrlopen.mjs`'s token regex, written as `\d` inside a template literal, so the page received `/ownedwordd+/`.
- Their probe and screenshot show the body rendered: one content document of 1,082 characters, with ownedword1–75 on screen.
- Fixed to `\\d`; `-ctrlopen-5` reads 91.
- These are harness failures, not app results.
