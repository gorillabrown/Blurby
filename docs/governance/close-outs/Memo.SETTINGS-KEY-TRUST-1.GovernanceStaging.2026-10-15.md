# Sprint Close-Out Governance Staging — SETTINGS-KEY-TRUST-1

Worktree-resident run (`eb/settings-key-trust-1`, `C:\Projects\Blurby\.worktrees\settings-key-trust-1`, from
`refs/remotes/origin/main` @ `efb446db`). Nothing is written to the register (standing rule 46). Not merged to `main`;
the `--no-ff` merge waits for Blurby.Roadmap's merge go.

## Gate evidence

### Setup (2026-10-15)
- `git fetch origin`; `refs/remotes/origin/main` = `efb446db`, which contains IPC-PATH-TRUST-1 (`9b68ce38`) and
  SAVE-LIBRARY-MERGE-1 (`682676b1`). `npm ci` exited 0.
- Standing rule 36 re-grep on `efb446db`. Every edit site's content is byte-identical to the spec's "Before" blocks.
  These anchors moved or stayed as follows:
  - `main.js:10-11` (import) and `:89-102` (the literal, now `:89` to `:102`): unchanged lines.
  - `main/migrations.js`: `loadSettingsData` `:292-294`, `module.exports` `:296`: unchanged.
  - `main/ipc/state.js:6-8` and `save-settings` `:23-31`: unchanged.
  - `main/sync-engine.js:19`, `applyCloudSettings` `:391-393`, `startSync` settings step `:807-815`, `forceSync("upload")`
    `:1038-1046`: unchanged.
  - `main/ipc/misc.js:150`, `:156` (the `.some` line) and `:420` (`settings._wsPairingToken = token;`): unchanged.
    The "typeof guard on held coverPath" site is still `isAllowedCoverPath` in `misc.js`; SAVE-LIBRARY-MERGE-1 did not
    move it into `mergeRendererEdits` or `apply-metadata-updates`.
  - `src/types.ts:201` (`libraryCardSpacing?:`): unchanged.
  - `tests/einkFoundation.test.ts:33-37` and `tests/settingsNarrateNormalization.test.js:107-127`: unchanged.
- `forceSync`'s download branch already declares its own `const cloudSettings` (`main/sync-engine.js:1060` on the base, `:1065` after C2); it is in
  the `else if` block, so the upload branch's new `cloudSettings` does not clash.

### Done-when 1 — positive control at C1 (`563820c1`)
`npx vitest run tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts` (pwsh, worktree root): **exit 1**;
`Tests 23 failed | 41 passed (64)`. Each failure, with its observed reason:
- (a) `expected 'attacker' to be 'main-secret'`.
- (b) `Object.hasOwn(settings, "_future")`: `expected true to be false`.
- (c) the prototype is `{ polluted: true }`, not `Object.prototype`.
- (d) `constructor` is an own key: `expected true to be false`.
- (e) `expected +0 to be 13`.
- (f) `expected [ 'notASetting', '0', '1' ] to deeply equal []`.
- (g1) `sourceFolder` and (g2) `recentFolders` take the forged `<tmp>/secret` values; (g3) `expected 'cloud-token' to
  deeply equal 'main-secret'`; (g4) `expected true to deeply equal false`; (g5) `expected 99 to deeply equal 13`.
- (h) the prototype is `{ polluted: true }`.
- (i) `sourceFolder` is `<tmp>/secret`, not `<tmp>/books`.
- (r1) `results.settings` is `"merged"` (passes), then the cloud copy carries `_wsPairingToken` and four more forbidden
  keys (`expected [ '_wsPairingToken', …(4) ] to deeply equal []`): this device's `main-secret` and `<tmp>/books`.
- (r2) `results.settings` is `"uploaded"` (passes), then the same five forbidden keys.
- (r3) `results.settings` is `"uploaded"`, then the same five forbidden keys.
- (s) the same five forbidden keys.
- (j) and (k): `promise rejected "TypeError: The "paths[0]" argument must b…" instead of resolving` (`path.resolve(42)`).
- (t1)–(t3): `TypeError: Cannot convert undefined or null to object` (`Object.keys(undefined)`).
- (t4): `expected undefined to be '{"schemaVersion":13,"wpm":300,"focusT…'`. Wording note: the spec says (t1)–(t4) fail
  with a `TypeError` or `SyntaxError`; (t4) fails as an assertion instead, because `JSON.stringify(undefined)` returns
  `undefined` without throwing. Same cause (`SETTINGS_DEFAULTS` not exported); the test is as specified.

Controls (l) (38 cases), (m), (n) and (o) pass. `npm run typecheck` at C1 (C1 form of the keys test): **exit 0**.

Test-file notes (within the spec's description): the (g) table holds thunks (`() => secret`) because the temp paths
exist only after `beforeEach`; `initSync()` switches to real timers, writes the `sync-state.json` fixture and runs
`initSyncEngine`; the cover-guard `describe` sets the four-entry library in its own `beforeEach`.

### Done-when 2 — after C2 (`a085e226`)
The eleven-file `npx vitest run …` (pwsh): **exit 0**; `Test Files 11 passed (11)`, `Tests 221 passed (221)`.

### Done-when 3–9 (pwsh, `git grep`, worktree root, C2 tree; empty stderr on every gate)
- 3: exit 1 (no output); exit 1 (no output); `main/ipc/state.js:28`, exit 0.
- 4: exit 1; `main/sync-engine.js:395`, exit 0; exit 1; exit 1; exit 1; `main/sync-engine.js:816` and `:1043`, exit 0.
- 5: `main/ipc/state.js:2`, `main/migrations.js:2`, `main/sync-engine.js:5`, exit 0.
- 6: `main/ipc/state.js:1`, `main/sync-engine.js:1`, exit 0.
- 7: `main/migrations.js:300`, exit 0; `main.js:90`, exit 0.
- 8: exit 1; `main/ipc/misc.js:156`, exit 0; `main/ipc/misc.js:420`, exit 0.
- 9: exit 1; exit 1; `src/types.ts:203`, exit 0.

### Done-when 10 (pwsh, worktree root, this machine)
- `npm test`: **exit 0**; `Test Files 166 passed (166)`, `Tests 2268 passed | 1 skipped (2269)`. No failures, so the
  Stage 8 closed-list rule was not needed.
- `npm run typecheck`: **exit 0**. `npm run build`: **exit 0**.
- `tests/perf-baseline-results.json`, rewritten by the suite, is left unstaged.

### Done-when 11 — fence
`git diff --name-status refs/remotes/origin/main...HEAD` lists exactly the spec's ten paths (plus this memo and the time
log). `git diff --stat`: the only size drop is `main.js` (3 added, 15 removed, net −12; spec "about 13").
`git diff refs/remotes/origin/main -- src/types.ts` adds exactly the comment and `sortBy?: string;`, and removes nothing.
`refs/remotes/origin/main` was re-fetched after C2 and is still `efb446db`, so no merge of main into the branch was needed.

### Done-when 12
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

## For Blurby.Roadmap (from the spec, not acted on here)
- File the Low bug "The quick-settings Sort by does not change the library order" (spec "Bug to file").
- Candidate stub: `get-state` returns `_wsPairingToken` to the renderer (`main/ipc/state.js:15-18`).
- Add SETTINGS-KEY-TRUST-1 to the Stage 8 batched owner smoke list (Done-when 12).

## Remaining
- Spec-compliance and code-quality reviews, and the `--no-ff` merge to `main` on Blurby.Roadmap's go.
- Done-when 12: the Stage 8 batched owner smoke.
