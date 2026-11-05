# Package verification (rule 53) — RC integration window, merge `c5bb507f`

**Scope:** the release-candidate integration merged to main as `c5bb507f` (2026-11-03), with parents `3526795a` and `70d64237`. Its tree is identical to `70d64237`, the RC branch's final tip, so the packages built from `70d64237` are the packages of `c5bb507f`.

**Status:** complete. x64 half by RodneySr and arm64 half by Blurby.Brain1, both 2026-11-03; recorded 2026-11-05.

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

## arm64 half (Rodney)

Run by Blurby.Brain1 on 2026-11-03, native arm64, in the detached worktree `.worktrees/rc-merge-20261103`. Evidence is in `C:\Projects\Blurby-artifacts\rc-merge-20261103\` on Rodney and is not committed.

**Which tree this is.** The package was built from `c5bb507f` itself, tree `761c315a`, the same tree as `70d64237`. Three things show it, and F-035's note that this folder came from a later tree does not hold:
- The worktree's reflog has it at `c5bb507f` from 12:14:32 until 19:27:00 on 2026-11-03, when `14ce3d24` was merged.
- Every file in the folder is dated in that window, from 12:15 to 12:17.
- The asar list matches x64's from `70d64237` on all 11,575 shared entries, including the content-hashed bundle names. `nas1-merge-20261103`, the later `14ce3d24` build, has different names (`App-C6zGHjar.js` against `App-BYPYVERQ.js`).

| Check | Result | Evidence |
|---|---|---|
| Build | `npm ci`, `npm run build` and `npx electron-builder --win --dir --arm64 --publish never`; the package log ends at the asar integrity update and signing | `npm-ci.log`, `build.log`, `pkg-arm64.log` |
| asar contents | 11,583 entries. Without the host-specific entries, the 11,575 left match x64 exactly: sha256 `73b71415…5ba8`, recomputed for this record (side item above) | `asar-list-arm64.txt` |
| 25 s scratch launch (LL-165) | `Blurby.exe` with `--inspect` and `--user-data-dir=<scratch>` plus `BLURBY_USER_DATA_DIR`, APPDATA and LOCALAPPDATA redirected. The inspector read-back of `app.getPath('userData')` equals the scratch path at 387 ms. Alive at 25 s; no `error.log`; no dumps; no flagged lines | `launch25-arm64.json` |
| Live profile | `%APPDATA%\blurby`, 17,396 files hashed before and after: same hash, `3f2691f6…a95c` | `launch25-arm64.json` |
| P1 to P4 | Not run on arm64. They ran on the x64 half, from the same tree | — |

One stderr line in the launch reads `Backup failed … library.json: ENOENT`. A fresh profile has no library to back up, and later clean launches log the same line.

**Rule 53 close for the RC window:** both halves pass (Blurby.Brain1, 2026-11-05).
