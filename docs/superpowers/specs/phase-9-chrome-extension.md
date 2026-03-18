# Phase 9 — Chrome Extension

## 9.1 Extension Core

### Goal
Build a Chrome extension that extracts readable article text from any webpage and sends it to Blurby for speed reading.

### Technical Design

**Manifest V3 Structure:**
```
blurby-extension/
├── manifest.json          # Extension manifest (MV3)
├── popup/
│   ├── popup.html         # Browser action popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic (RSVP reader + controls)
├── content/
│   └── content.js         # Content script (article extraction)
├── background/
│   └── service-worker.js  # Background service worker (bridge, storage)
├── lib/
│   └── readability.js     # Mozilla Readability (bundled)
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── options/
    └── options.html       # Extension settings page
```

**manifest.json:**
```json
{
  "manifest_version": 3,
  "name": "Blurby Speed Reader",
  "version": "1.0.0",
  "description": "Speed read any article with RSVP focus reading",
  "permissions": ["activeTab", "storage", "contextMenus"],
  "host_permissions": ["http://localhost:19847/*"],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": { "16": "icons/icon-16.png", "48": "icons/icon-48.png", "128": "icons/icon-128.png" }
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["lib/readability.js", "content/content.js"],
    "run_at": "document_idle"
  }],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "options_page": "options/options.html"
}
```

**Content Script (`content.js`):**
1. On page load, check if page has article-like content (heuristic: `<article>`, `.post-content`, word count > 200)
2. Inject a small floating "Read in Blurby" button (bottom-right corner) if article detected
3. On click: run Readability on `document.cloneNode(true)`, extract `{ title, content, textContent, excerpt, byline, siteName }`
4. Send extracted content to service worker via `chrome.runtime.sendMessage()`

**Context Menu (`service-worker.js`):**
- Register "Speed Read Selection" context menu on text selection
- On click: capture `selectionText` and open popup with selected text
- Register "Speed Read This Page" context menu on pages
- On click: trigger content script extraction

**Article Detection Heuristics:**
- Has `<article>` tag, or `[role="article"]`, or `.post-content`, `.article-body`, `[itemprop="articleBody"]`
- Body text > 200 words (exclude nav, footer, sidebar)
- Not a search results page, login page, or homepage (check URL patterns)

### Acceptance Criteria
- [ ] Extension installs in Chrome/Edge/Brave
- [ ] Floating button appears on article pages
- [ ] Context menu "Speed Read" options available
- [ ] Article text extracted accurately via Readability
- [ ] Selected text captured for quick reading

---

## 9.2 Desktop Integration

### Goal
Send extracted articles from the Chrome extension to the desktop Blurby app.

### Technical Design

**Option A: Local HTTP Bridge (Preferred)**

Desktop Blurby runs a lightweight HTTP server on `localhost:19847`:

```javascript
// In main.js
const http = require("http");
const BRIDGE_PORT = 19847;

const bridge = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "chrome-extension://*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  if (req.method === "POST" && req.url === "/import") {
    let body = "";
    req.on("data", (chunk) => body += chunk);
    req.on("end", async () => {
      const { title, content, url } = JSON.parse(body);
      // Add as manual doc or URL doc
      const doc = await addDocToLibrary(title, content, url);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, docId: doc.id }));
    });
  }
});

bridge.listen(BRIDGE_PORT);
```

Extension service worker sends:
```javascript
fetch("http://localhost:19847/import", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title, content, url: tab.url })
});
```

**Option B: Clipboard + Deep Link (Fallback)**

If bridge not available (Blurby not running):
1. Copy content to clipboard with metadata header: `BLURBY_IMPORT:{"title":"...","url":"..."}\n\n<content>`
2. Open `blurby://import` deep link (requires protocol handler registration)
3. Blurby reads clipboard on focus, detects `BLURBY_IMPORT:` prefix, imports

**Desktop-Side Changes:**
- `main.js` — Add HTTP bridge server, start on app launch, stop on quit
- `main.js` — Register `blurby://` protocol handler via `app.setAsDefaultProtocolClient("blurby")`
- `preload.js` — Expose bridge status check

**Connection Status:**
- Extension popup shows "Connected to Blurby" / "Blurby not running" indicator
- Periodic health check: `GET http://localhost:19847/ping` → `{ status: "ok", version: "1.0.0" }`

### Acceptance Criteria
- [ ] Articles sent from extension appear in Blurby library within 2 seconds
- [ ] Works when Blurby is running (HTTP bridge)
- [ ] Graceful fallback when Blurby is not running (clipboard or "open Blurby" prompt)
- [ ] CORS headers allow extension origin
- [ ] No security vulnerabilities (validate input, localhost only)

---

## 9.3 Standalone In-Browser Reader

### Goal
Read articles directly in the browser extension popup without needing the desktop app.

### Technical Design

**Popup UI (`popup.html` / `popup.js`):**
- Minimal RSVP reader: single word display with ORP highlighting
- Reuse `focusChar()` logic from `src/utils/text.ts` (bundle into extension)
- Controls: play/pause button, WPM slider (100-1200), progress bar
- Dimensions: 400×500px popup window

**Reader State:**
- Words array from extracted article
- Current word index
- Playing state
- WPM setting (persisted in `chrome.storage.local`)

**Playback Engine:**
- Simplified version of `useReader.ts` tick loop
- `setInterval`-based (no RAF needed in popup — simpler, popup is always visible when open)
- Punctuation pause using `hasPunctuation()` logic

**Reading Queue:**
- Store extracted articles in `chrome.storage.local` (up to 50 articles, 5MB limit)
- Queue list in popup: tap to read, swipe to delete
- Sync with desktop Blurby when bridge available

**Popup Layout:**
```
┌─────────────────────────────┐
│ ☰ Blurby          300 wpm  │  Header
├─────────────────────────────┤
│                             │
│       ex·traor·dinary       │  RSVP word display
│         ▼                   │
│                             │
├─────────────────────────────┤
│ ▶  ═══════════●══  42%     │  Controls
├─────────────────────────────┤
│ ▸ Israel Keeps Killing...   │  Queue
│ ▸ How to Avoid a Climate... │
│ ▸ The Future of AI...       │
└─────────────────────────────┘
```

**Files to Create:**
- `blurby-extension/popup/popup.html` — Popup markup
- `blurby-extension/popup/popup.js` — RSVP engine + queue management
- `blurby-extension/popup/popup.css` — Styles (dark theme matching Blurby desktop)

### Acceptance Criteria
- [ ] RSVP reader works in popup with play/pause/speed controls
- [ ] ORP highlighting matches desktop behavior
- [ ] Punctuation pauses work
- [ ] Reading queue persists across popup opens
- [ ] WPM setting persists
- [ ] Queue syncs with desktop when connected

---

## 9.4 Distribution

### Goal
Publish the extension to Chrome Web Store.

### Requirements
- [ ] Chrome Web Store developer account ($5 one-time fee)
- [ ] Store listing: name, description, screenshots (1280×800), icon (128×128)
- [ ] Privacy policy (required for `activeTab` permission)
- [ ] Extension review (typically 1-3 business days)

### Ongoing
- [ ] Auto-update via Chrome Web Store (automatic for published extensions)
- [ ] Version bump workflow: update `manifest.json` version, zip, upload to dashboard
- [ ] User feedback monitoring via Chrome Web Store reviews
