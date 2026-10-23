# Dispatch Close-Out Governance Staging — WS-PAIR-LOG-1

This dispatch was built in a worktree during the Stage 8 code/lockfile freeze. It merges only after the freeze lifts, right after WS-TOKEN-REGEN-1, and only on Blurby.Roadmap's go.

- **Branch:** `eb/ws-pair-log-1`, stacked on `eb/ws-token-regen-1` @ `48c311f6`.
- **Shared core:** none.

## Evidence

- **Re-grep (rule 36):** the pair-flow save is in `main/ws-server.js` `handleMessage`, at `:236-245` on `48c311f6`. It ended in `catch { /* best-effort persist */ }` and had no `else`.
  - The DW4 grep on the base exited 1.
- **Done-when 1, positive control.** The tests were committed alone in `318e19c8` and run against the parent's source: exit 1, with 2 failed and 1 passed.
  - "Encryption unavailable" and "the encrypted save throws" both failed with `expected [] to deeply equal [ Array(1) ]`, because the base logs nothing.
  - The available control passed. That is expected, since it pins the existing ciphertext save.
- **The change** (`d91d6310`):
  - The catch logs `[ws-server] pairing not saved: <message>`.
  - A new `else if (_ctx)` branch logs `[ws-server] pairing not saved: OS encryption unavailable`.
  - Pairing still completes for the session, and nothing is written in plaintext (Blurby.Brain, 2026-10-22).
- **DW3:** `npx vitest run tests/wsPairLog.test.js tests/wsServerAuth.test.js tests/ws-server.test.js` gave `Test Files 3 passed (3)`, `Tests 50 passed (50)`, exit 0.
- **DW4:** `git grep -c -F 'pairing not saved:' -- main/ws-server.js` printed `main/ws-server.js:2`.
- **DW5** (owner's machine, tree `d91d6310`):
  - `npm test` exited 0 with `Test Files 179 passed (179)`, `Tests 2442 passed | 1 skipped (2443)`.
  - `npm run typecheck` exited 0. `npm run build` exited 0.
  - Nothing failed, so nothing was re-run.
- **DW6, fence:**
  - Against the parent (`eb/ws-token-regen-1...HEAD`): exactly `M main/ws-server.js` and `A tests/wsPairLog.test.js`, plus this memo.
  - Against `origin/main...HEAD`: those paths plus the parent's five paths and its memo.
  - Not touched: `startServer`, `main/ipc/misc.js`, the renderer and `preload.js`.
  - `tests/perf-baseline-results.json`, dirtied by the suite, is not staged.
- **Review** (self-review, quick tier): the diff is 7 lines, inside the pair branch only.
  - The log carries only the error message, never the token.
  - The `_ctx` guard matches the existing save guard, so a server without a ctx stays silent, as before.

## Lessons

- **Applied:** rule 43 (positive control first) and rule 36 (re-grep).
- **Added:** none.
