# Aristotle Diagnosis — EXT-PAIR-1: Chrome Extension Pairing Auth Timeout

**Date:** 2026-05-29
**Method:** Code-reading trace (no live instrumentation needed — root cause clear from source)
**Verdict:** Hypothesis A confirmed. Hypotheses B and C eliminated.

## Captured Exchange (Reconstructed from Code)

### First-Time Pairing Path (the broken case)

1. Extension service-worker.js line 634: `connectWebSocket()` fires at startup
2. `new WebSocket("ws://127.0.0.1:48924/blurby")` opens successfully
3. `onopen` (line 40-48): checks `chrome.storage.local.get("pairingToken")` — **none exists** for first-time pair → sends NOTHING
4. Desktop ws-server.js `handleConnection` (line 154): starts `setTimeout` at `WS_AUTH_TIMEOUT_MS = 5000`
5. **5 seconds of silence** — user is still looking at the popup, typing the 6-digit code
6. Timer fires (line 155-159): `console.log("[ws-server] Auth timeout — disconnecting unauthenticated client")` → `socket.destroy()` → `_clients.delete(client)`
7. Extension `onclose` (line 58-63): `_connected = false`, `_authenticated = false` → `scheduleReconnect()`
8. Reconnect after 1s (exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s cap, ±20% jitter)
9. Cycle repeats → terminal floods with `Auth timeout` at decreasing frequency

### Post-Paired Auth Path (working correctly)

1. Extension reconnects → `onopen` → finds stored `pairingToken` → immediately sends `{type: "auth", token: "..."}`
2. Server receives auth within milliseconds → timer cleared at line 264 → `client.authenticated = true`
3. No timeout occurs — this path is already fast enough for the 5s window

### User Clicks "Pair" (race condition)

1. User opens popup → `updateConnectionStatus()` (popup.js line 236) → asks service worker for status
2. If WS is alive (within a 5s window), status = `{connected: true, authenticated: false}` → shows pairing UI
3. User types 6 digits (takes 5-15 seconds)
4. User clicks Pair → popup sends `{type: "request-pair", code: "340780"}` to service worker
5. Service worker (line 571-577): checks `_ws.readyState === WebSocket.OPEN`
6. **If WS is alive:** sends `{type: "pair", code: "340780"}` to server → server processes correctly (line 229-254) → pair succeeds
7. **If WS was killed during typing:** `sendResponse({success: false, message: "Not connected to Blurby desktop"})` → user sees error

## Hypothesis Disposition

| Hypothesis | Status | Evidence |
|-----------|--------|----------|
| A: Timeout too short for user paste-and-click | **CONFIRMED** | `WS_AUTH_TIMEOUT_MS = 5000` (5s) at constants.js:47; first-time pair sends no message on connect (service-worker.js:45-48 conditional on stored token); user needs 5-15s to type code |
| B: Extension never sends pair message | **ELIMINATED** | popup.js:86 sends `{type: "request-pair", code}` → service-worker.js:577 sends `{type: "pair", code}` — correct shape, matches server expectation at ws-server.js:229 |
| C: Extension sends pair with wrong field shape | **ELIMINATED** | `{type: "pair", code: "<6 digits>"}` matches exactly what `handleMessage` expects — `msg.type === "pair"` at line 229, `msg.code` compared at line 231 |

## Recommended Fix

**Primary approach (spec Task 2, first option):**

Add `WS_PAIRING_TIMEOUT_MS = 5 * 60 * 1000` in `main/constants.js` (matches `SHORT_CODE_TTL_MS`). In `handleConnection` line 154, use `WS_PAIRING_TIMEOUT_MS` instead of `WS_AUTH_TIMEOUT_MS` for the initial timer. Keep `WS_AUTH_TIMEOUT_MS = 5000` for documentation/future use.

**Why not the alternative (reset-on-first-message)?** The primary approach is simpler and equally safe because:
- Server is localhost-only (ws-server.js:108 rejects non-localhost)
- Post-paired auth sends immediately on connect — timer clears within milliseconds regardless of window size
- The 5-minute window matches the short code TTL (codes expire anyway)
- The timer IS still cleared on successful auth/pair (lines 243, 264)

**Additional fix:** Replace the silent `console.log` on timeout with a structured log including `client.remoteAddress`, elapsed-ms, and `client.buffer.length`. Add info-level logs on successful pair-ok and auth-ok.
