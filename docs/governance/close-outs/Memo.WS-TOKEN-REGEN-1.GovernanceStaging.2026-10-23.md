# Dispatch Close-Out Governance Staging — WS-TOKEN-REGEN-1

Worktree-resident dispatch, built during the Stage 8 code/lockfile freeze. It merges only after the freeze lifts, on Blurby.Roadmap's go.
- **Branch:** `eb/ws-token-regen-1` from `refs/remotes/origin/main` @ `47ae6e1f`.
- **Shared core:** one line of `src/types.ts`. Blurby.Roadmap confirmed that no other active item touches the shared-core set.

## Re-grep at dispatch (standing rule 36)

On `47ae6e1f`, every site matches the specification:
- **`main/ipc/misc.js`:** the regenerate handler's plaintext write `settings._wsPairingToken = token;` is at `:418`.
- **`main/ws-server.js`:**
  - `startServer` restores the token at `:444-452`.
  - The two write branches are at `:456-460` and `:465-469`.
  - The pair-flow `encryptString(_pairingToken)` is at `:240`.
  - `module.exports` sits at the end of the file.
- **`src/types.ts:140`:** `schemaVersion: number;`. Its other readers are `src/constants.ts:295` and `src/test-harness/electron-api-stub.ts:42`.
- **`tests/settingsKeyTrust.test.js`:** the `../ws-server` fake is at `:74-80`, and test (o) is at `:339-343`.
- **`SETTINGS_DEFAULTS`:** exported by `main/migrations.js`.

## Evidence

- **Done-when 1** (C1 `0cb517a7`, tests alone, base source): `npx vitest run tests/settingsKeyTrust.test.js tests/wsTokenRegen.test.js` exited 1 with `Tests 4 failed | 74 passed (78)`.
  - (o) failed with `expected 'new-token' to be 'enc:new-token'`, so the base stores the raw token.
  - (a) and (b) failed with `TypeError: wsServer.encodePairingToken is not a function`.
  - (c) failed with `expected 'undefined' to be 'function'`.
    - (c) was tightened before C1. Its first draft passed on the base, because calling the missing `decodePairingToken` throws a TypeError, which satisfied `toThrow()`.
    - It now requires the function to exist and the throw to match `/decrypt/`.
- **The parity test and its control passed on the base,** as they should: they pin an invariant that already holds.
  - The base has 58 = 58 keys.
  - The control plants `plantedKey: string;` into a copy of the interface text and checks that the parser reports exactly `["plantedKey"]`.
- **The fix** (`a68f69ed`):
  - `encodePairingToken` and `decodePairingToken` are added to `main/ws-server.js` and exported.
  - `startServer`'s restore uses `decodePairingToken`, and both write branches use `encodePairingToken`.
  - `misc.js` uses `wsServer.encodePairingToken(token)`.
  - `src/types.ts:140` now reads `schemaVersion?: number;`.
- **Done-when 2:** `Tests 78 passed (78)`, exit 0.
- **Done-when 3:**
  - `git grep -n -F '_wsPairingToken = token' -- main/ipc/misc.js` exited 1, empty.
  - `git grep -c -F 'encodePairingToken' -- main/ipc/misc.js` printed `main/ipc/misc.js:1`.
- **Done-when 4:** `git grep -n -F 'encryptString(_pairingToken)' -- main/ws-server.js` printed only the pair-flow line `:240`.
  - The specification expected a second line, from inside the helper. Its own Implementation detail gives the helper a `token` parameter (`encryptString(token)`, `:439`), so that line cannot match.
  - The intent holds: `startServer` has no direct encrypt call left, and the one encode path is the helper.
- **Done-when 5:** `src/types.ts:140:  schemaVersion?: number;`, exit 0. `npm run typecheck` exited 0 with no reader broken.
- **Existing ws-server tests:** `tests/ws-server.test.js` and `tests/wsServer.test.js`, 39/39.
- **Done-when 6** (owner's machine, tree `a68f69ed`):
  - `npm test` exited 0: `Test Files 178 passed (178)`, `Tests 2435 passed | 1 skipped (2436)`.
  - `npm run typecheck` exited 0, and `npm run build` exited 0.
  - No failure occurred, so no re-run was needed.
- **Done-when 7:** the merge-base diff (`refs/remotes/origin/main...HEAD`) lists exactly `M main/ws-server.js`, `M main/ipc/misc.js`, `M src/types.ts`, `M tests/settingsKeyTrust.test.js` and `A tests/wsTokenRegen.test.js`, plus this memo. No time log was kept. `tests/perf-baseline-results.json`, dirtied by the suite, is unstaged.
- **Review** (independent, read-only, `a68f69ed`): Done-when 2, 3, 4 (in intent), 5 and 7 met, with no blocking findings.
  - The GET-STATE-SECRET-1 tests (`:346` describe) are untouched and pass.
  - No plaintext `_wsPairingToken` write remains while safeStorage is available. A legacy plaintext value heals on the next start, because decode throws and the catch re-stores the token encoded.
  - Regenerate's order (encode, save, stop, start, decode) returns the same token, by code reading plus tests (a) and (o). There is no end-to-end test through the real server; that is low.
  - Test (c) is not vacuous.
  - **Note for follow-up, outside this item's fence:** the pair flow (`ws-server.js:237-245`) does not persist the token when encryption is unavailable, so a paired token is lost on restart there. Switching it to `encodePairingToken` would start writing plaintext in that case. That is a behaviour change, correctly left out of scope.
  - The parity parser suits today's interface: no nested braces and no braces in comments.

## Mid-dispatch amendment — no plaintext token anywhere (Blurby.Brain, 2026-10-22, tier 1)

Recorded in ROADMAP.md after this item's specification. Done on the existing branch before merge, in three commits so each new test is red against the pre-amendment behaviour:

1. **`ea9c0032`, pure refactor:** the restore logic moves into an exported `loadPairingToken(ctx, { token })`, which `startServer(ctx, options)` calls. 117/117 ws tests stay green.
2. **`cc028528`, tests alone, red on step 1's tree:**
   - (r1): `expected '7d2d0bca…' to be '0123456789abcdef0123456789abcdef'`; the legacy token was replaced, so the pairing was lost.
   - (r2), (r3): `expected true to be false`; a `_wsPairingToken` key was present.
   - (r4): the key was present after regenerate.
   - (b), updated: it pinned the forbidden plaintext form, and failed with `expected 'tok' to be null`.
3. **`a38cc994`, the change:**
   - `encodePairingToken` returns `null` without safeStorage.
   - `decodePairingToken` always decrypts.
   - **`loadPairingToken`:**
     - Without safeStorage, it deletes any stored value and keeps the token in memory: the legacy 32-hex value if present, else a new token.
     - With safeStorage, a stored value that fails to decrypt and has the 32-hex `generatePairingToken` shape is re-encrypted in place (the pairing survives). A value that fails to decrypt without that shape is regenerated, as before.
   - The regenerate handler stores only a non-null form, deletes the key otherwise, and passes `{ token }` to `startServer`.
   - The `EADDRINUSE` retry passes the session token through.

`274a2270` corrects (r4) to assert the passed token rather than the harness's `ctx` object. (r4) is still red against the pre-amendment handler.

- **Legacy detection:** stored ciphertext has no `enc:` prefix (`enc:` is only the test fake's form), so a legacy plaintext token is recognised by decrypt failure plus the 32-hex shape. Today's ciphertext format is unchanged.
- **Every remaining `_wsPairingToken` write stores ciphertext only:** `misc.js:420`, `ws-server.js:242` (pair flow, already guarded), `:475`, `:484`.
- **Consequence of session-only tokens, by design of the ruling:** without safeStorage, a manual server stop/start or an app restart issues a new token, and the extension must pair again.
- **Gates on `274a2270`:**
  - `tests/wsTokenRegen.test.js` and `tests/settingsKeyTrust.test.js`: 82/82.
  - `npm test`: `Test Files 178 passed (178)`, `Tests 2439 passed | 1 skipped (2440)`, exit 0.
  - Typecheck and build: exit 0.
  - Done-when 3–5 unchanged: the `_wsPairingToken = token` grep exits 1; `encodePairingToken` appears once in `misc.js`; `encryptString(_pairingToken)` appears only at `ws-server.js:240`; `schemaVersion?: number;` is at `src/types.ts:140`.
- **Fence:** unchanged. The same 5 paths plus this memo.
