# Close-Out: EXT-PAIR-1 — Chrome Extension Pairing Auth Timeout Repair

**Date:** 2026-05-29
**Branch:** `sprint/ext-pair-1`
**Baseline:** clean main at v1.75.1
**Result:** Complete

## Summary

Repaired the Chrome extension pairing flow by widening the initial WebSocket auth timeout from 5 seconds to 5 minutes. The 5s window was designed for the post-paired auto-auth path (stored token sent immediately on connect) but was applied uniformly to all connections, killing first-time pairing attempts before the user could type a 6-digit code. Added structured logging and 8 new tests. BUG-183 closed.

## Root Cause (Aristotle Diagnosis)

Hypothesis A confirmed — timeout too short for human interaction. The extension's service-worker auto-connects on startup but sends no message for first-time pair (only sends `{type: "auth", token: ...}` when a stored token exists). The 5s `WS_AUTH_TIMEOUT_MS` fires before the user types the code. The extension's reconnect loop (1s → 2s → 4s → 30s cap) creates the terminal flood.

Hypotheses B (extension never sends pair message) and C (wrong message shape) were eliminated by code-reading trace: `popup.js:86` → `service-worker.js:577` sends `{type: "pair", code: "..."}` — the correct shape.

Full diagnosis: `docs/governance/close-outs/Aristotle.EXT-PAIR-1.2026-05-29.md`

## Deliverables

1. **`main/constants.js`** — Added `WS_PAIRING_TIMEOUT_MS = 5 * 60 * 1000` (matches `SHORT_CODE_TTL_MS`). `WS_AUTH_TIMEOUT_MS = 5000` retained for documentation.

2. **`main/ws-server.js`** — Four changes:
   - `handleConnection` auth timer now uses `WS_PAIRING_TIMEOUT_MS` instead of `WS_AUTH_TIMEOUT_MS`
   - Auth timeout log includes `remote`, `elapsed`, `buffered` for structured debugging
   - Pair-ok and auth-ok now log elapsed time at info level
   - `safeStorage` usage made defensive with optional chaining (prevents crash if safeStorage unavailable)
   - Test exports added: `handleConnection`, `handleMessage`, `_testSetState`, `_testGetClients`

3. **`tests/wsServerAuth.test.js`** — 8 new tests covering the auth timeout state machine:
   - (a) valid pair within timeout → succeeds, timer cleared
   - (b) no message within timeout → socket destroyed
   - (c) valid auth (post-paired) → succeeds, timer cleared
   - (d) invalid pair code → pair-failed, connection stays until timeout
   - Reject non-localhost connections
   - Reject wrong WebSocket path
   - Constant value assertions

## Validation

- `npm test` green: 3,014 tests pass (8 new)
- Fake-timer tests verify timeout behavior at exact boundaries
- Manual smoke test deferred to Evan post-merge (SUCCESS CRITERIA #1)

## Files Changed

- `main/constants.js` — added `WS_PAIRING_TIMEOUT_MS`, exported
- `main/ws-server.js` — auth timer, structured logging, defensive safeStorage, test exports
- `tests/wsServerAuth.test.js` — new file (8 tests)
- `docs/governance/close-outs/Aristotle.EXT-PAIR-1.2026-05-29.md` — new file (diagnosis)
- `docs/governance/BUG_REPORT.md` — BUG-183 marked RESOLVED
- `CLAUDE.md` — queue depth, open bugs, most recent sprint, test count
- `ROADMAP.md` — header, completed table, spec archived, positions renumbered
- `docs/planning/.Archive/ROADMAP_legacy.md` — archived EXT-PAIR-1 spec
