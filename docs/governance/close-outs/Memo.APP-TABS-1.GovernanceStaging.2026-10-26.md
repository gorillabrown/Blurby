# APP-TABS-1 — staging memo (built and held, Stage 8 freeze)

- **Item:** APP-TABS-1, Notion Seq 100, spec `docs/planning/specs/2026-10-23-5/APP-TABS-1.md` on `origin/main` @ `b00287d7`. Owner rulings 1, 3 and 4 are the build defaults, as the spec states.
- **Branch:** `eb/app-tabs-1`, cut from `origin/main`. Pushed with `git push origin HEAD:refs/heads/eb/app-tabs-1`. **Not merged.**
- **`$BASE`:** `b00287d7`. Pre-checks: `.git/index.lock` absent; the branch absent on origin; the spec on HEAD; `npm ci` exit 0.
- **Worktree:** this session's `C:\Projects\Blurby\.claude\worktrees\kind-visvesvaraya-77bbf5`, not the spec's `.worktrees\app-tabs-1`. Nothing else differs.
- **Artifacts:** `C:\Projects\Blurby-artifacts\app-tabs-1\` (logs, `live2.json`, `launch25.json`, the package copy `pkg\`).
- **Shared-core touch (declared):** `src/types.ts`, three additive lines. Not merged; it waits for the shared-core window after the Stage 8 release.

## Commits
| sha | what |
|---|---|
| `0456e566` | Wave A red |
| `54c0348c` | Wave A |
| `e0d75ef1` | Wave B red |
| `83aaa7a8` | Wave B |
| `86580450` | merge of `origin/main` (docs only) |
| `48da10c8`, `c75f73af` | Escape closes the filter menu from anywhere; live-check driver |
| (this memo's commit) | memo and time log |

## Wave A
1. **Red first.** `0456e566` adds only the five test files, the fixture and the one `TYPE_KEYS` key. `npx vitest run` on the four files exits 1: 17 failed (every one by assertion, the missing module through the guarded dynamic import) and 5 passed (the controls h5, s3, s4, a8, t5). `npm run typecheck` exits 2 on that commit (`libraryTab` is not in `BlurbySettings`). Output: `waveA-red.log`, `waveA-red-typecheck.log`.
2. **Wave A change** makes the 12-file targeted run pass: 229/229 (`waveA-dw6.log`).
3. **Pinned edits:** `tests/settingsKeyTrustKeys.test.ts:24`, `tests/helpSurfaces.test.tsx:69` (83 → 84), and one the spec did not name (below).
4. **Source gates** (each dry-run on the base): `libraryTab: undefined` in `main/migrations.js` 1; `"libraryTab"` 1; `home?: "library" | "newsroom"` in `src/types.ts` 1; `schemaVersion` count in `main/migrations.js` 24 (unchanged: no schema or migration added).
5. **Gates:** `npm test` green on the final tree; typecheck 0; build 0.

### Standing rule 50 miss in the spec (ruled by Blurby.Brain)
`tests/settingsKeyTrust.test.js:375` (u) pins the count of `SETTINGS_DEFAULTS` keys minus `schemaVersion` at 57. The spec's own `libraryTab: undefined` makes it 58. The spec's fence and its list of pinned edits missed it. **Red before:** with Wave A in place and the test unedited, `npm test` failed one test: (u) "expected 58 to be 57" (`waveA-npmtest-pre.log`). **Green after:** edited to 58; the suite passes. Blurby.Brain ruled the edit on 2026-10-26: `libraryTab` is a plain user setting, and the pin exists to force this review. The file is added to the fence.

### Two small deviations from the spec text (no user-visible choice)
- `ElectronAPI.setDocHome` is declared optional (`setDocHome?:`), not required. `src/test-harness/electron-api-stub.ts` is outside the fence and builds an `ElectronAPI` object; a required member made typecheck fail (exit 2). Call sites use `api.setDocHome?.(...)`.
- Theme test (t1) allows the element-set properties `--menu-x` and `--menu-y`. The spec's Wave B card-menu instruction requires them, and (t1) as worded would reject them. They are not colours and appear in no theme map.

## Wave B
1. **Red first.** `e0d75ef1` adds only `tests/appTabsMove.test.js` and the Wave B rows. On it, `npx vitest run tests/appTabsMove.test.js tests/appTabs.test.tsx` exits 1: 15 failed, all by assertion (missing handler, missing elements, missing text), and 13 passed, among them the controls (m4)–(m7) and (b13) (`waveB-red.log`).
2. **Wave B change** makes the 15-file targeted run pass: 292/292 (`dw12-package.log`).
3. **Source gates:** `ipcMain.handle("set-doc-home"` in `main/ipc/documents.js` 1; `ipcRenderer.invoke("set-doc-home"` in `preload.js` 1; `className="library-tabs-row"` in `LibraryView.tsx` exit 1; `aria-label="Search library"` count 1; the `RENDERER_FIELDS` line unchanged at `main/ipc/library.js:49`.
4. **Final checks** on the final tree: `npm test` 2,493 passed, 2 skipped, 0 failed in 186 files; `npm run typecheck` exit 0; `npm run build` exit 0.
5. **Added after the first package check:** Escape now closes a hover- or click-opened filter menu when focus is not inside it (the menu's own Escape handler covers the keyboard-opened case). Needed for (L5) "Escape closes". Covered by (b5) and (L5).

## Package verification (standing rule 53)
- **(a)** `npx electron-builder --win --dir --arm64` from the final source (`48da10c8`, with `origin/main` merged in at `86580450`), exit 0 (`pkg-build2.log`). Output `release\win-arm64-unpacked\`, copied to `pkg\`. `c75f73af` changes only `scripts/app-tabs/live-check.mjs`, which is outside `build.files`, so the package is unchanged from `48da10c8`.
- **(b)** The built `main.js` has `BLURBY_USER_DATA_DIR` (2 matches). `pkg\Blurby.exe` ran natively on this ARM64 machine for 25 s on a fresh scratch profile (`launch25.json`, made by `launch25.mjs`).
  - `app.getPath('userData')`, read over the main-process inspector, equals the scratch profile at 109 ms.
  - Alive at 25 s. No `error.log`, no `.dmp`.
  - The output: one `[ws-server] Listening on ws://127.0.0.1:48924/blurby`, the inspector's own attach lines, and the known noise `Backup failed for …library.json: ENOENT` on a fresh profile's first launch (BUG-217). No `EADDRINUSE`, no error, no unhandled rejection.
- **(c)** `npx asar list` shows `\main\ipc\documents.js`, `\main\migrations.js` and `\preload.js`. The extracted copies are byte-identical (`cmp`) to the worktree's. The extracted `dist\` equals the worktree's `dist\` (`diff -r`, no output). The bundle contains "Coming soon".
- **(d)** The automatable Done-when checks re-run on the packaged exe: the live frames below (Done-when 16). The targeted run of Done-when 12 passes on the same tree (`dw12-package.log`).
- **(e)** Sent to Blurby.Brain with the package path, commit and logs.

## Live frames on the packaged exe (Done-when 16)
Driver `scripts/app-tabs/live-check.mjs`; results `live2.json`. The profile preflight (LL-165) proved the scratch profile before the first input; the live `library.json` and `settings.json` hashes are the same before and after (`d4b884bd…`, `2e1d5245…`). Verdicts read state (LL-166).

| row | frame | result |
|---|---|---|
| L1 | 1 | pass: Library selected at launch with `f-pdf` and the sample listed; Newsroom shows `m-text`, `u-art`; no `[role=tablist]` in the reader; Escape returns to Newsroom |
| L2 | 2 | pass: Move to Newsroom saved `home: "newsroom"` to `library.json` within 4 s; `position` 40, `revision` 4 and `cfi` unchanged; still `newsroom` after the header rescan and after a relaunch |
| L3 | last-used tab | pass: Newsroom after the relaunch; `settings.json` `libraryTab: "newsroom"`; `f-pdf` listed on Newsroom, not on the Library |
| L4 | 3 | pass: search `meditations` shows labels Library and Newsroom; the Newsroom result opens the reader, and the exit returns to Newsroom |
| L5 | 4 | pass: a real pointer hover opens All / New / Favorites / Archived; Escape closes it; with E-ink on, a click opens it; E-ink turned off again |
| L6 | themes | pass: in blurby, dark, light and system, E-ink off and on, the bar's computed background equals `--bg`; positive control: dark `rgb(15, 15, 15)` vs light `rgb(245, 243, 239)`; selected tab `font-weight` 700 with E-ink on (400 off) |
| L7 | 5 | pass: Ctrl+3 Podcasts with "No podcasts yet"; Ctrl+4 Marketplace with "Coming soon"; Ctrl+1 Library |
| L8 | 6 | pass: counts only. Copy of the owner's library: 134 records; after load the saved `library.json` has the same ids in the same order, none twice, and 0 of 134 records differ. Across Library and Newsroom with filters All and Archived, the union of ids equals the 134 non-deleted ids (133 on the Library, 1 on Newsroom), with none on both. `sourceFolder` was cleared in the copy (LL-158). |

Notes: the seeded profile has `blurby-data\covers` created by the driver, because it imports nothing and main never makes it; the preflight's proof is the main process's own `userData` path plus the unmoved live hashes. The first drive of L5 with the first package failed on Escape, which led to the Wave B addition 5 above; the rows then passed on the rebuilt package.

## Fence
`git diff --name-status b00287d7 HEAD` lists the spec's fence, plus: `M tests/settingsKeyTrust.test.js` (the ruled pin edit), this memo and `Timing.APP-TABS-1.jsonl`, and five files that came in only through the merge of `origin/main` (`.claude/agents/zeus.md`, `CLAUDE.md`, `Virtuoso.Governance.Readme.md`, `Virtuoso/workspace-layout.json`, `docs/governance/readme.md`). No commit of this item touches those five. Nothing in `ReaderContainer.tsx`, `FlowScrollEngine.ts`, `main/ipc/library.js`, `main/sync-engine.js`, `main/folder-sync.js`, `ThemeProvider.tsx` or any reading mode. `tests/perf-baseline-results.json` is left unstaged.

## Owner checks (add to release gate (2)'s list)
- The filter menu opening on a real mouse hover, and staying open as the pointer moves into it. (The driver moved the pointer with CDP events; a human hand is the check.)
- A tap on an E-ink display opening it.
- The tab bar looking right in each theme.
- Newsroom's header is the same as the Library's (question 2's build default).

## Lessons
- **Applied:** standing rules 36 (re-grep at base), 41 (time log in the fence), 43 (red first, both waves), 44 (gates dry-run), 47, 48, 50 (one miss found, above), 52 (the fixture is `.json`), 53; LL-152, LL-158, LL-165 (preflight), LL-166 (state-reading verdicts with a positive control).
- **Added:** none.
- **Spec findings:** the standing rule 50 miss above; `setDocHome` must be optional or the stub in `src/test-harness/` joins the fence; (t1) and the card-menu instruction conflict over `--menu-x/--menu-y`.
