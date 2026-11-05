# Package verification (rule 53) — RC integration window, merge `c5bb507f`

**Scope:** the release-candidate integration merged to main as `c5bb507f` (2026-11-03), with parents `3526795a` and `70d64237`. Its tree is identical to `70d64237`, the RC branch's final tip, so the packages built from `70d64237` are the packages of `c5bb507f`.

**Status:** x64 half complete (RodneySr, 2026-11-03). The arm64 half is below, left for Blurby.Brain1 to fill in.

Drafted by Blurby.RodneySR Executor for Blurby.Brain1, 2026-11-05. Evidence is in `.worktrees/rc-evidence-20261103/rule53/` on RodneySr (`SUMMARY.md` is the run record) and in `C:\Projects\Blurby-artifacts\rc-gate1-run5-20261103\` for the asar side item. Neither is committed.

## x64 half (RodneySr)

| Check | Result | Evidence |
|---|---|---|
| Builds | `npx electron-builder --win --dir --x64` and `--arm64`, `--publish never`, from the same commit `70d64237`; both exit 0 | `rule53-build-*.log` |
| Pair | app.asar sha256 `54cd2361…0393` in both builds. Asar lists identical, 11,587 entries each; the diff is empty | `asar-x64.txt`, `asar-arm64.txt`, `asar-pair.diff` |
| asar contents | All 24 `main/` files changed since origin/main are present. The asar's `dist/` matches the worktree's `dist/` (`diff -rq` clean). `BLURBY_USER_DATA_DIR` is in the packaged `main.js` (2 hits) | `asar-main-changed.txt` |
| 25 s scratch launch (LL-165) | x64 `Blurby.exe` with `--inspect` and `--user-data-dir=<scratch>` plus `BLURBY_USER_DATA_DIR`, APPDATA/LOCALAPPDATA redirected to scratch. The inspector read-back of `app.getPath('userData')` equals the scratch path (`proofOk: true`). Alive at 25 s; no error, unhandled, crash or exception lines; no `.dmp`; scratch covers created | `launch-result.json`, `launch-stdout.log` |
| Live profile | `%APPDATA%\blurby`, 4,088 files hashed before and after: diff empty, no restore needed | `launch-result.json` (`liveFiles`, `liveDiff`) |
| P1 Narrate sentence resume | Part A PASS: paused at 151 "THE"; resume request, first commit and first voiced are all 91 = `sentenceStartAt(151)`. Part B: paused on the sentence start 199 "His"; resume request 199, first voiced 199, schedule `chunkStart` 199, cursor held at 199. The first commit is 200, because the engine commits only on a cursor change. Brain1 ruled part B accepted (2026-11-03), so P1 PASS | `p1-result.json`, `p1-*.png` |
| P2 settings migration v15 | PASS. A v13 `{theme eink, flowZoneLines 0}` reads back schemaVersion 15, `flowBandEnabled false`, theme light, `einkMode true`, with no `flowZoneLines` | `p2-result.json`, `p2-migration.png` |
| P3 APP-TABS-1 homing | PASS. Library shows [folder-epub]; Newsroom shows [pasted-doc]; Library's Filter menu is [All, New, Favorites, Archived, All types, Books, PDFs] | `p3-result.json`, `p3-*.png` |
| P4 foliate stack | PASS. 10 ArrowRight turns in Page (2 %) and 10 PageDown in Flow (4 %). No `error.log` was created: 0 ResizeObserver-loop and 0 style-null lines | `p4-result.json`, `p4-*.png` |

**Isolation, every run:** scratch userData proved through the inspector; APPDATA and LOCALAPPDATA redirected; the live profile's 4,088 files diffed, empty after each run. Fixtures: the bundled sample book and synthetic documents only. Narrate's models were a scratch copy (`NARRATE_MODELS_ROOT`).

### Cross-host asar side item (closed 2026-11-03)

| | RodneySr x64 (`70d64237`) | Rodney arm64 (`c5bb507f`, Brain1's figures) |
|---|---|---|
| Entries | 11,587 | 11,583 |
| `node_modules\@img\sharp-win32*` (host-installed optional) | 8 (`sharp-win32-x64`) | 8 (`sharp-win32-arm64`) |
| `node_modules\@napi-rs\canvas-win32-x64-msvc` | 4 | 0 (no arm64 variant in the lockfile) |
| Remaining, CR stripped and sorted | 11,575; sha256 `73b714156e22d8d75a7c2e43e3c4bbf42bb30cde4206c675c3c66724003a5ba8` | 11,575; sha256 `73b714156e22d8d75a7c2e43e3c4bbf42bb30cde4206c675c3c66724003a5ba8` |

The four x64-only entries are:
- `\node_modules\@napi-rs\canvas-win32-x64-msvc`
- `\node_modules\@napi-rs\canvas-win32-x64-msvc\icudtl.dat`
- `\node_modules\@napi-rs\canvas-win32-x64-msvc\package.json`
- `\node_modules\@napi-rs\canvas-win32-x64-msvc\skia.win32-x64-msvc.node`

`build.files` packs `node_modules/@napi-rs/**`, and `main/pdf-text.js` loads canvas optionally, with polyfills as the fallback. That behaviour predates the RC. Lists: `C:\Projects\Blurby-artifacts\rc-gate1-run5-20261103\asar-70d64237-x64-list.txt` and `asar-70d64237-x64-packages.txt`.

## arm64 half (Rodney) — FOR BRAIN1

<!-- BRAIN1: fill in. The arm64 launch ran at merge time on Rodney. Rows to match the x64 half: build, 25 s scratch launch with LL-165 proof, live profile, and any probes run. -->

| Check | Result | Evidence |
|---|---|---|
| | | |
