# GET-STATE-SECRET-1 — governance staging memo (2026-10-15)

Branch `eb/get-state-secret-1` from `refs/remotes/origin/main` @ `181da234`, worktree `C:\Projects\Blurby\.worktrees\get-state-secret-1`. `npm ci` exit 0. Every command below ran in pwsh 7.6.0 from the worktree root, in a local session on the owner's machine.

## Commits

| Commit | What |
|---|---|
| `721f1453` | C1, first spec: test edits only |
| `eddcc441` | merge of `refs/remotes/origin/main` @ `68d95d5a` (the amended spec; governance only) |
| `c3e931c3` | C1b, amended spec: `library.js` registration, `dialog` fake, short-code fakes, (v5), (y), (z) |
| `5268bfd8` | C2: the eight non-test files |
| `6bec518f` | merge of `refs/remotes/origin/main` @ `f41ca75a` (LARGE-FOLDER-SYNC-2 governance only; in this spec it changes one Merge Order sentence) |

## Anchor check (standing rule 36)

`git diff --quiet 051d004c 181da234 -- main/ipc/state.js main/ipc/misc.js main/sync-engine.js preload.js src tests/settingsKeyTrust.test.js main/ws-server.js main/migrations.js` exits 0. `git diff --quiet 181da234 HEAD -- main src preload.js tests docs/governance/TECHNICAL_REFERENCE.md ':!tests/settingsKeyTrust.test.js'` exits 0 after the `68d95d5a` merge. `main/ipc/library.js:14` and `:524-577`, `main/ipc/misc.js:403-409` and the three `ws-server.js` push lines (`:150`, `:254`, `:277`) match the spec. No content drift.

## Done-when 1: positive control

**First spec, C1 (`721f1453`):** exit 1, 8 failed / 62 passed (70).

**Amended spec, C1b (`c3e931c3`):** `npx vitest run tests/settingsKeyTrust.test.js` exits 1, 9 failed / 64 passed (73).

| Test | Failure |
|---|---|
| (p) encrypted, (p) plaintext | `expected [ '_wsPairingToken', '_future' ] to deeply equal []` |
| (q) | `expected { schemaVersion: 13, …(5) } not to be { schemaVersion: 13, …(5) } // Object.is equality` |
| (v) start-ws-server, get-ws-status, regenerate-ws-pairing-token | `expected true to be false` (`Object.hasOwn(result, "token")`) |
| (v4) | `expected true to be false` (the channel is registered) |
| (x) | `expected 99 to be 13` |
| (y) | `expected { schemaVersion: 13, …(5) } to deeply equal { wpm: 300, launchAtLogin: false }` |

(u), (v5), (w), (z) and the 60 existing cases pass.

## Done-when 2: mutation controls

Each control ran as the spec's block: `[Environment]::CurrentDirectory = (Get-Location).Path`, then `git diff --quiet` (exit 0), then the `Replace`, with `$a` occurring once and `$b` zero times. The numstat check came next, then the case run, the reverse, and `git diff --quiet` (exit 0). No control was void.

| Control | When | numstat | Case run | Failure |
|---|---|---|---|---|
| (a) outer merge filter | after C1b | `1	1	main/sync-engine.js` | exit 1, (w) failed, 72 skipped | received `["_wsPairingToken", "sourceFolder", "recentFolders", "launchAtLogin"]` |
| (c) banner code | after C1b | `1	1	main/ipc/misc.js` | exit 1, (v5) failed | `- "code": "123456"` missing from the result |
| (d) import sets settings | after C1b | `1	1	main/ipc/library.js` | exit 1, (z) failed | `_wsPairingToken: "backup-token"`, the backup's `sourceFolder`, `recentFolders`, `schemaVersion: 1`, `wpm: 999` |
| (b) folder keys | after C2 | `1	1	main/ipc/state.js` | exit 1, (u) failed | `expected undefined to deeply equal 'C:\Users\estra\AppData\Local\Temp\blu…'` (`sourceFolder`) |

Control (a) also ran once at C1 on the first spec, with the same result.

## Done-when 3–12 (after C2, and again after the `f41ca75a` merge)

- **3:** the 12 listed files exit 0, 238 passed (12 files). `tests/settingsKeyTrust.test.js` alone: 73 passed.
- **4–10:** all 29 gates pass on exact exit codes. Every "prints nothing" gate exits 1 with empty output. The lines found:
  - `state.js:21`, `state.js:3`;
  - `misc.js:2`, `:397`, `:418`;
  - `types.ts:343`;
  - `sync-engine.js:815`, `:377`, `:5`;
  - `library.js:537`, `library.js:2`;
  - in the test file: `:5`, `:412`, `:76`, `:114`, `:52`;
  - `TECHNICAL_REFERENCE.md:1`.
- **11:** `npm test` exits 0: 167 files, 2,303 passed / 1 skipped (2,304), 17.4 s, with no load-timing failures. `npm run typecheck` exits 0. `npm run build` exits 0.
- **12:** `git diff --name-status refs/remotes/origin/main` lists exactly the nine `M` files. Numstat matches every row: `2 0`, `3 1`, `7 8`, `9 4`, `1 3`, `0 1`, `3 4`, `3 4`, `123 5`. The `preload.js` diff removes only the `getWsPairingToken` line. The `library.js` diff touches only the require after `:14` and the export's `settings` line. `tests/perf-baseline-results.json` was rewritten by the suite and is left unstaged.

## Done-when 13

Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

## Execution notes

- **Exact diffs applied directly.** The implementation agent applied the spec's exact before/after text itself, without delegating to Hermes as zeus.md's routing describes, because every edit was fully prescribed. Each edit was checked by its gate (Done-when 4–12) and by numstat.
- **[IO.File] and the working directory (lesson candidate).** `[IO.File]` resolves a relative path against the process's current directory, not pwsh's `Set-Location`. On the first C1 run of control (a), the shell's process directory was another worktree (`C:\Projects\Blurby\.worktrees\gov-gss`). The `Replace` read and wrote that checkout's `main/sync-engine.js`, the `-t "\(w\)"` run passed with nothing mutated (1 passed), and the reverse `Replace` restored the other file. That checkout was verified clean (`git status` empty, `git diff --quiet` exit 0). The amended spec's block now sets `[Environment]::CurrentDirectory` and voids any control whose numstat is not the expected row. Every recorded control above passed that check. Recommendation for LESSONS_LEARNED: a mutation control must prove the mutation landed (numstat) before its test result counts.
