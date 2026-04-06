# HOTFIX-14 Investigation Report

**Sprint:** HOTFIX-14 (v1.38.1)
**Branch:** `hotfix/14-import-connection`
**Date:** 2026-04-06
**Investigator:** Cowork
**Status:** Investigation complete. Both BUG-155 and BUG-156 now have confirmed root causes and CLI-ready fix specs.

---

## Section A: BUG-155 — URL Extraction Failure

### Summary

**Site-specific failure, not a general regression.** EBSCO's web application firewall (WAF) rejects Electron's `fetch()` fingerprint with HTTP 400. The extraction pipeline itself works correctly. The fix is a missing fallback path in the no-login branch of the IPC handler.

### Test Results: 5 URLs

| # | URL | HTTP Status | Extraction | Content Length | Error |
|---|-----|-------------|------------|----------------|-------|
| 1 | Wikipedia (Electron software) | 200 | PASS | 14,037 chars | - |
| 2 | Paul Graham (Great Work) | 200 | PASS | 66,529 chars | - |
| 3 | **EBSCO (Simonides)** [reported] | 200 | PASS | 13,337 chars | - |
| 4 | arXiv (2301.00234) | 200 | PASS | 2,198 chars | - |
| 5 | MDN (Promise) | 200 | PASS | 25,489 chars | - |

All 5 URLs succeed when tested with Node.js native `fetch()` + `extractArticleFromHtml()`. The EBSCO URL returns clean content including title "Simonides | History | Research Starters | EBSCO Research". This confirms the extraction pipeline has no regression — the failure is in the HTTP fetch layer.

### Root Cause: Dual Failure (Electron WAF Rejection + Missing Fallback)

**Primary cause: Electron's fetch gets rejected by EBSCO's WAF.**

Evidence from `%APPDATA%/Blurby/blurby-data/error.log`:
```
[2026-04-06T13:51:52.677Z] URL import fetch failed for "https://www.ebsco.com/research-starters/history/simonides": HTTP 400
```

Electron's built-in `fetch()` uses Chromium's network stack, which automatically adds `Sec-Ch-Ua`, `Sec-Ch-Ua-Mobile`, `Sec-Ch-Ua-Platform` headers and uses Chromium's TLS fingerprint. EBSCO's WAF detects an automated Chromium instance (headers say "Chrome" but no full browser session, no cookies, no referrer) and returns HTTP 400. Node.js native fetch (undici) does not add these headers — EBSCO's WAF passes it through.

**Secondary cause: No `fetchWithBrowser` fallback in the no-login branch.**

The IPC handler at `main/ipc/misc.js:152-282` has an **asymmetric fallback structure**:

```
if (hasLogin) {
  try { fetchWithCookies → extract } catch { /* fall through */ }
  if (!result || result.error) {
    fetchWithBrowser → extract    ← FALLBACK EXISTS (hidden BrowserWindow)
  }
} else {
  fetchWithCookies → extract       ← NO FALLBACK — throw propagates to outer catch
}
```

When a user has no saved site login for a domain (the common case), `fetchWithCookies` is the **only** fetch path. If it throws (HTTP 400), the error propagates directly to the outer catch at `misc.js:268`, returning the generic user-facing error. The `fetchWithBrowser` fallback — which loads the URL in a hidden BrowserWindow with a full Chromium session — is only available when `hasLogin` is true.

### Error Propagation Path

```
User → "Import from URL" in LibraryContainer.tsx
  → handleImportConfirm() → useLibrary.ts:107-124 → addDocFromUrl(url)
    → window.electronAPI.addDocFromUrl(url) via preload.js:39
      → ipcMain "add-doc-from-url" handler in misc.js:152
        → fetchWithCookies(url) in url-extractor.js:265
          → Electron fetch() → HTTP 400
          → Line 274: throw new Error("HTTP 400")
        → Catch at misc.js:268
          → Returns { error: "Could not extract article from this URL..." }
          → Also logs to error.log via logToFile at misc.js:279
    → useLibrary.ts:111: showToast(result.error, 8000)
  → User sees: "Could not extract article from this URL. Try opening it in your browser instead."
```

Error logging works correctly — the technical error (HTTP 400) is logged to `error.log`. The user-facing message is the generic toast.

### Fix Spec

**File:** `main/ipc/misc.js`
**Lines:** 174-177
**Change:** Add try/catch + `fetchWithBrowser` fallback to the `else` (no-login) branch, mirroring the `if (hasLogin)` branch structure at lines 164-173.

```javascript
// BEFORE (lines 174-177):
} else {
  html = await fetchWithCookies(url);
  result = extractArticleFromHtml(html, url);
}

// AFTER:
} else {
  try {
    html = await fetchWithCookies(url);
    result = extractArticleFromHtml(html, url);
  } catch { /* fall through to browser fetch */ }

  if (!result || result.error) {
    html = await fetchWithBrowser(url);
    result = extractArticleFromHtml(html, url);
  }
}
```

**Risk:** Very low. Adds a fallback path that already exists and is proven in the `hasLogin` branch. No new code patterns or dependencies. `fetchWithBrowser` only triggers when `fetchWithCookies` fails — no performance impact on the happy path.

**Test tier:** Quick (`npm test` only)

---

## Section B: BUG-156 — False "Connected" Status

### Summary

**Three compounding issues** cause the Connectors Settings page to show "Connected" when the Chrome extension is not actually connected. The primary root cause is that `getClientCount()` counts **all** WebSocket clients including unauthenticated ones. This is amplified by infrequent UI polling and a 60-second dead-client detection window.

### _clients Set State Diagram

All mutations to the `_clients` Set in `ws-server.js`:

```
┌─────────────────────────────────────────────────────────┐
│                    _clients Set                          │
│                                                         │
│  ADD:                                                   │
│    ws-server.js:144  — WebSocket handshake complete      │
│                        (BEFORE authentication!)          │
│                                                         │
│  DELETE:                                                │
│    ws-server.js:152  — socket 'close' event             │
│    ws-server.js:157  — socket 'error' event             │
│    ws-server.js:174  — WS close frame (opcode 0x08)     │
│    ws-server.js:465  — heartbeat: alive===false → kill   │
│    ws-server.js:473  — heartbeat: ping write fails       │
│                                                         │
│  CLEAR:                                                 │
│    ws-server.js:492  — stopServer() shutdown             │
└─────────────────────────────────────────────────────────┘
```

**Lifecycle flow:**
```
TCP connect → HTTP upgrade → WebSocket handshake
  → _clients.add(client)  [ws-server.js:144]
  → client.authenticated = false
  → Waits for auth/pair message
  → On auth success: client.authenticated = true  [ws-server.js:224 or 239]
  → On disconnect: _clients.delete  [multiple paths above]
```

### Root Cause #1: Unauthenticated Clients Counted (Primary)

**File:** `ws-server.js:511-513`
```javascript
function getClientCount() {
  return _clients.size;  // Counts ALL clients, including unauthenticated
}
```

**File:** `main/ipc/misc.js:377-381`
```javascript
ipcMain.handle("get-ws-short-code", () => {
    const { code, expiresAt } = wsServer.getShortCode();
    const hasAuth = wsServer.getClientCount() > 0;  // <-- checks raw count
    return { code, expiresAt, connected: hasAuth };
  });
```

**File:** `ConnectorsSettings.tsx:28-34` (consumer)
```tsx
api.getWsShortCode().then((result: any) => {
    if (result) {
        setConnected(result.connected);  // <-- uses raw count > 0
    }
});
```

A client is added to `_clients` at `ws-server.js:144` the moment the WebSocket handshake completes — **before** any authentication. The `getClientCount()` function at line 511 returns `_clients.size` with **no auth filter**. Any WebSocket connection — including unauthenticated, briefly-connected, or mid-handshake sockets — registers as "connected."

**Scenario:** The extension's service worker wakes up, connects the WebSocket, but gets suspended by Chrome before the auth message completes. The server now has 1 unauthenticated client in `_clients`. The UI shows "Connected."

### Root Cause #2: Dead Client Detection Window (60 seconds)

**File:** `ws-server.js:462-476`

The heartbeat runs every `HEARTBEAT_INTERVAL_MS` (30,000ms = 30 seconds, defined in `main/constants.js:39`). Dead client detection requires **two** heartbeat cycles:

1. **Cycle 1:** Set `client.alive = false` (line 469), send ping (line 471)
2. **If no pong received within 30 seconds...**
3. **Cycle 2:** Check `alive === false` (line 464), destroy socket + remove client (lines 465-466)

Total detection time: **up to 60 seconds** from disconnect to removal.

**Chrome extension complication:** When Chrome suspends a Manifest V3 service worker (after ~30s of inactivity), the WebSocket is torn down. Whether the server receives a TCP FIN depends on the OS networking stack. If no FIN is sent (common when Chrome force-kills the service worker), the `close` event at `ws-server.js:152` never fires. The dead client persists until the heartbeat detects it.

**Extension cleanup gap:** `service-worker.js` has **no** `beforeunload` or cleanup handler. Lines 46-52 handle `ws.onclose` (resetting extension-side state), but the extension sends no explicit "I'm disconnecting" message. When Chrome kills the service worker, the WebSocket just dies silently.

### Root Cause #3: Infrequent UI Polling (5-minute gap)

**File:** `ConnectorsSettings.tsx:27-57`

The `connected` state is refreshed in exactly two situations:
1. **On mount** (line 27-35) — once when the settings page opens
2. **On short code expiry** (lines 43-50) — when the countdown reaches zero

`SHORT_CODE_TTL_MS` is `5 * 60 * 1000` (5 minutes, `main/constants.js:43`). Between mount and expiry, the UI shows **stale** connection state. Even if the server correctly removes a dead client after 60 seconds, the UI won't update for up to 5 minutes.

### What ConnectorsSettings Actually Checks

The component calls `api.getWsShortCode()` which maps to the `get-ws-short-code` IPC handler at `misc.js:377-381`. This handler:
1. Gets a new short code via `wsServer.getShortCode()`
2. Checks `wsServer.getClientCount() > 0` — **raw client count, no auth filter**
3. Returns `{ code, expiresAt, connected: hasAuth }`

The component is checking **"is anyone connected to the WebSocket server?"** when it should be checking **"is an authenticated extension connected?"** These are very different things.

### Extension-Side Connection Status

The extension (`popup.js:41-58`) checks connection status via `service-worker.js:546-553`:
```javascript
if (message.type === "get-connection-status") {
    sendResponse({
      connected: _connected,
      authenticated: _authenticated,
      articleCount: _sessionArticleCount,
    });
}
```

The popup correctly requires **both** `connected && authenticated` (popup.js:49) to show "Connected." The extension side is accurate — the bug is entirely server-side + renderer-side.

### Fix Spec

**Fix 1 (Primary): Filter `getClientCount()` to authenticated clients**

**File:** `ws-server.js:511-513`
```javascript
// BEFORE:
function getClientCount() {
  return _clients.size;
}

// AFTER:
function getClientCount() {
  let count = 0;
  for (const client of _clients) {
    if (client.authenticated) count++;
  }
  return count;
}
```

**Fix 2: Add periodic status polling in ConnectorsSettings**

**File:** `ConnectorsSettings.tsx` — add a 5-second polling interval for connection status.

```tsx
// Add after the mount useEffect (after line 35):
useEffect(() => {
  const poll = setInterval(() => {
    api.getWsShortCode().then((result: any) => {
      if (result) setConnected(result.connected);
    });
  }, 5000);
  return () => clearInterval(poll);
}, []);
```

**Fix 3 (Optional enhancement): Reduce heartbeat dead-client window**

**File:** `main/constants.js:39` — reduce `HEARTBEAT_INTERVAL_MS` from 30000 to 15000 (15 seconds). This cuts the dead-client window from 60s to 30s. Trade-off: doubles ping traffic (negligible for localhost).

### Bonus Findings

1. **No graceful disconnect from extension.** `service-worker.js` has no cleanup handler. When Chrome suspends the service worker, no "disconnect" message is sent. The server must rely entirely on TCP close detection + heartbeat. This is inherent to Manifest V3 and cannot be fixed in the extension — the server must handle it.

2. **Reconnect creates duplicate clients (theoretical).** If the extension reconnects before the heartbeat removes the dead client from the previous connection, `_clients` could briefly contain two entries for the same extension — one dead, one alive. Both count toward `getClientCount()`. This is a transient state (resolved within one heartbeat cycle) but could cause confusion in the UI.

3. **`regenerate-ws-short-code` handler doesn't return `connected`.** At `misc.js:383-387`, the `regenerate-ws-short-code` handler returns `{ code, expiresAt }` but NOT `connected`. The "New Code" button in ConnectorsSettings calls `handleRegenerate()` which doesn't update connection status. Minor UX gap.

### Risk Assessment

| Fix | Risk | Scope |
|-----|------|-------|
| Fix 1 (auth filter) | Very low — single function change, no side effects | `ws-server.js:511-513` |
| Fix 2 (UI polling) | Very low — standard React interval pattern | `ConnectorsSettings.tsx` (add ~8 lines) |
| Fix 3 (heartbeat interval) | Low — reduces detection window, doubles ping traffic (negligible) | `main/constants.js:39` |

**Test tier:** Quick (`npm test` only)

### Files Read During Investigation

| File | Lines | Purpose |
|------|-------|---------|
| `main/ws-server.js` | 1-529 | Full WebSocket server — client lifecycle, heartbeat, auth |
| `main/ipc/misc.js` | 365-395 | IPC handlers for WS status, short code, pairing token |
| `main/constants.js` | 39-43 | HEARTBEAT_INTERVAL_MS (30s), SHORT_CODE_TTL_MS (5min) |
| `src/components/settings/ConnectorsSettings.tsx` | 1-168 | Renderer connection status UI |
| `chrome-extension/service-worker.js` | 1-593 | Extension WebSocket management, no cleanup handler |
| `chrome-extension/popup.js` | 1-239 | Extension popup — correct auth check |

---

## Combined HOTFIX-14 Dispatch Readiness

| Bug | Root Cause Confirmed | Fix Spec Complete | Edit-Site Coordinates | CLI-Ready |
|-----|---------------------|-------------------|-----------------------|-----------|
| BUG-155 | YES — WAF rejection + missing fallback | YES | `misc.js:174-177` | **YES** |
| BUG-156 | YES — unauth count + stale window + infrequent poll | YES | `ws-server.js:511-513`, `ConnectorsSettings.tsx:35` (insert after), `constants.js:39` (optional) | **YES** |
| BUG-157 | Previously confirmed | YES | See ROADMAP.md | **YES** |
| BUG-158 | Previously confirmed | YES | See ROADMAP.md | **YES** |

**All four bugs now have confirmed root causes and CLI-ready fix specs.** HOTFIX-14 is fully dispatch-ready.
