// service-worker.js — Background script for Blurby Chrome extension
// Manages WebSocket connection to desktop app and cloud sync fallback.

const WS_URL = "ws://127.0.0.1:48924/blurby";
const RECONNECT_DELAY_MS = 5000;
const MAX_RECENT_SENDS = 5;

let _ws = null;
let _connected = false;
let _authenticated = false;
let _reconnectTimer = null;
let _pendingMessages = [];
let _sessionArticleCount = 0;
let _pairCallback = null; // callback for pending pair request

// ── WebSocket connection management ──────────────────────────────────────────

function connectWebSocket() {
  if (_ws) return;

  try {
    _ws = new WebSocket(WS_URL);
  } catch {
    scheduleReconnect();
    return;
  }

  _ws.onopen = async () => {
    _connected = true;
    updateBadge();

    // Authenticate with pairing token
    const { pairingToken } = await chrome.storage.local.get("pairingToken");
    if (pairingToken) {
      _ws.send(JSON.stringify({ type: "auth", token: pairingToken }));
    }
  };

  _ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleServerMessage(msg);
    } catch { /* ignore invalid messages */ }
  };

  _ws.onclose = () => {
    _ws = null;
    _connected = false;
    _authenticated = false;
    updateBadge();
    scheduleReconnect();
  };

  _ws.onerror = () => {
    // onclose will fire after this
  };
}

function scheduleReconnect() {
  if (_reconnectTimer) return;
  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null;
    connectWebSocket();
  }, RECONNECT_DELAY_MS);
}

function handleServerMessage(msg) {
  switch (msg.type) {
    case "auth-ok":
      _authenticated = true;
      // Flush pending messages
      for (const pending of _pendingMessages) {
        _ws.send(JSON.stringify(pending));
      }
      _pendingMessages = [];
      break;

    case "auth-failed":
      _authenticated = false;
      console.warn("[blurby] Auth failed:", msg.message);
      break;

    case "pair-ok":
      _authenticated = true;
      // Store the long-lived token for future auto-reconnect
      if (msg.token) {
        chrome.storage.local.set({ pairingToken: msg.token });
      }
      updateBadge();
      if (_pairCallback) { _pairCallback({ success: true }); _pairCallback = null; }
      break;

    case "pair-failed":
      if (_pairCallback) { _pairCallback({ success: false, message: msg.message || "Invalid code" }); _pairCallback = null; }
      break;

    case "ok":
      _sessionArticleCount++;
      updateBadge();
      // Notify popup if open
      notifyPopup({ type: "send-success", docId: msg.docId });
      break;

    case "error":
      console.error("[blurby] Server error:", msg.message);
      notifyPopup({ type: "send-error", message: msg.message });
      break;

    case "pong":
      break;
  }
}

function notifyPopup(msg) {
  chrome.runtime.sendMessage(msg).catch(() => {
    // Popup not open, ignore
  });
}

function updateBadge() {
  if (_sessionArticleCount > 0) {
    chrome.action.setBadgeText({ text: String(_sessionArticleCount) });
    chrome.action.setBadgeBackgroundColor({ color: "#D04716" });
  } else {
    chrome.action.setBadgeText({ text: "" });
  }
}

// ── Send article to Blurby ───────────────────────────────────────────────────

async function sendArticle(article) {
  // Save to recent sends
  await saveRecentSend(article);

  // Try local WebSocket first
  if (_connected && _authenticated && _ws && _ws.readyState === WebSocket.OPEN) {
    _ws.send(JSON.stringify({ type: "add-article", payload: article }));
    return { method: "local", status: "sent" };
  }

  // Try cloud fallback
  const { connectionMode } = await chrome.storage.local.get("connectionMode");
  if (connectionMode === "local-only") {
    return { method: "none", status: "error", message: "Blurby desktop app is not running." };
  }

  const cloudResult = await sendViaCloud(article);
  return cloudResult;
}

async function saveRecentSend(article) {
  const { recentSends = [] } = await chrome.storage.local.get("recentSends");
  const entry = {
    title: article.title,
    siteName: article.siteName,
    wordCount: article.wordCount,
    sourceUrl: article.sourceUrl,
    sentAt: Date.now(),
  };
  recentSends.unshift(entry);
  if (recentSends.length > MAX_RECENT_SENDS) recentSends.length = MAX_RECENT_SENDS;
  await chrome.storage.local.set({ recentSends });
}

// ── Cloud sync fallback ──────────────────────────────────────────────────────

async function sendViaCloud(article) {
  const { cloudProvider, cloudToken } = await chrome.storage.local.get(["cloudProvider", "cloudToken"]);

  if (!cloudProvider || !cloudToken) {
    return { method: "cloud", status: "error", message: "Cloud sync not configured. Open extension options to sign in." };
  }

  const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);

  const doc = {
    id: docId,
    title: article.title || "Untitled Article",
    wordCount: article.wordCount || 0,
    position: 0,
    created: Date.now(),
    source: "url",
    sourceUrl: article.sourceUrl || null,
    author: article.author || null,
    sourceDomain: article.siteName || null,
    publishedDate: article.publishedDate || null,
    authorFull: article.author || null,
    lastReadAt: null,
    unread: true,
    syncContent: true,
    content: article.textContent,
  };

  try {
    if (cloudProvider === "google") {
      await uploadToGoogleDrive(cloudToken, docId, doc);
    } else if (cloudProvider === "microsoft") {
      await uploadToOneDrive(cloudToken, docId, doc);
    }

    _sessionArticleCount++;
    updateBadge();
    return { method: "cloud", status: "sent", message: "Saved to cloud — will appear in Blurby on next sync." };
  } catch (err) {
    return { method: "cloud", status: "error", message: "Cloud upload failed: " + err.message };
  }
}

async function uploadToGoogleDrive(token, docId, doc) {
  // Find or create Blurby app data folder
  const folderResponse = await fetch(
    "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='library.json'&fields=files(id,name)",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!folderResponse.ok) throw new Error("Failed to access Google Drive");

  const { files } = await folderResponse.json();

  // Upload document content
  const docContent = JSON.stringify(doc, null, 2);
  const metadata = {
    name: `${docId}.json`,
    parents: ["appDataFolder"],
    mimeType: "application/json",
  };

  const boundary = "blurby_boundary_" + Date.now();
  const body =
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/json\r\n\r\n${docContent}\r\n` +
    `--${boundary}--`;

  const uploadResponse = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  if (!uploadResponse.ok) throw new Error("Failed to upload document to Google Drive");

  // Update library.json
  await updateCloudLibrary(token, "google", doc, files);
}

async function uploadToOneDrive(token, docId, doc) {
  const basePath = "https://graph.microsoft.com/v1.0/me/drive/special/approot:/Blurby";

  // Upload document content
  const docContent = JSON.stringify(doc, null, 2);
  const uploadResponse = await fetch(
    `${basePath}/documents/${docId}.json:/content`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: docContent,
    }
  );
  if (!uploadResponse.ok) throw new Error("Failed to upload document to OneDrive");

  // Update library.json
  await updateCloudLibrary(token, "microsoft", doc, null);
}

async function updateCloudLibrary(token, provider, doc, existingFiles) {
  let library = { schemaVersion: 2, docs: [] };

  try {
    // Fetch current library.json
    let libraryContent;
    if (provider === "google") {
      let fileId;
      if (existingFiles && existingFiles.length > 0) {
        fileId = existingFiles[0].id;
      } else {
        const searchResponse = await fetch(
          "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='library.json'&fields=files(id)",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { files } = await searchResponse.json();
        if (files && files.length > 0) fileId = files[0].id;
      }
      if (fileId) {
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.ok) libraryContent = await response.text();
      }
    } else {
      const response = await fetch(
        "https://graph.microsoft.com/v1.0/me/drive/special/approot:/Blurby/library.json:/content",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) libraryContent = await response.text();
    }

    if (libraryContent) {
      library = JSON.parse(libraryContent);
    }
  } catch { /* Start with empty library */ }

  // Add new doc (without content — content stored separately)
  const libDoc = { ...doc };
  delete libDoc.content;
  library.docs.unshift(libDoc);

  // Upload updated library.json
  const updatedLibrary = JSON.stringify(library, null, 2);

  if (provider === "google") {
    const searchResponse = await fetch(
      "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='library.json'&fields=files(id)",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { files } = await searchResponse.json();

    if (files && files.length > 0) {
      // Update existing
      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${files[0].id}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: updatedLibrary,
        }
      );
    } else {
      // Create new
      const metadata = { name: "library.json", parents: ["appDataFolder"], mimeType: "application/json" };
      const boundary = "blurby_lib_" + Date.now();
      const body =
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${updatedLibrary}\r\n` +
        `--${boundary}--`;
      await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );
    }
  } else {
    await fetch(
      "https://graph.microsoft.com/v1.0/me/drive/special/approot:/Blurby/library.json:/content",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: updatedLibrary,
      }
    );
  }
}

// ── Cloud OAuth helpers ──────────────────────────────────────────────────────

async function signInGoogle() {
  // Use chrome.identity.launchWebAuthFlow for Google OAuth
  const clientId = await getGoogleClientId();
  if (!clientId) throw new Error("Google client ID not configured");

  const redirectUrl = chrome.identity.getRedirectURL();
  const scopes = encodeURIComponent("https://www.googleapis.com/auth/drive.appdata");
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
    `&response_type=token&scope=${scopes}`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (responseUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      const url = new URL(responseUrl);
      const token = new URLSearchParams(url.hash.slice(1)).get("access_token");
      if (token) {
        chrome.storage.local.set({ cloudProvider: "google", cloudToken: token });
        resolve(token);
      } else {
        reject(new Error("No access token in response"));
      }
    });
  });
}

async function signInMicrosoft() {
  const clientId = await getMicrosoftClientId();
  if (!clientId) throw new Error("Microsoft client ID not configured");

  const redirectUrl = chrome.identity.getRedirectURL();
  const scopes = encodeURIComponent("Files.ReadWrite.AppFolder offline_access");
  const authUrl =
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
    `&response_type=token&scope=${scopes}`;

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url: authUrl, interactive: true }, (responseUrl) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      const url = new URL(responseUrl);
      const token = new URLSearchParams(url.hash.slice(1)).get("access_token");
      if (token) {
        chrome.storage.local.set({ cloudProvider: "microsoft", cloudToken: token });
        resolve(token);
      } else {
        reject(new Error("No access token in response"));
      }
    });
  });
}

async function getGoogleClientId() {
  const { googleClientId } = await chrome.storage.local.get("googleClientId");
  return googleClientId || null;
}

async function getMicrosoftClientId() {
  const { microsoftClientId } = await chrome.storage.local.get("microsoftClientId");
  return microsoftClientId || null;
}

async function cloudSignOut() {
  await chrome.storage.local.remove(["cloudProvider", "cloudToken"]);
}

// ── Content script injection & extraction ────────────────────────────────────

async function extractFromTab(tabId) {
  // Inject readability.js and content-script.js into the active tab
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["readability.js", "content-script.js"],
  });

  // Request extraction
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, { type: "extract-article" }, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ error: "Failed to extract content: " + chrome.runtime.lastError.message });
      } else {
        resolve(response || { error: "No response from content script" });
      }
    });
  });
}

// ── Context menu ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "send-to-blurby",
    title: "Send to Blurby",
    contexts: ["page", "selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "send-to-blurby" && tab && tab.id) {
    const article = await extractFromTab(tab.id);
    if (article.error) {
      notifyPopup({ type: "send-error", message: article.error });
      return;
    }
    const result = await sendArticle(article);
    notifyPopup({ type: "send-result", result });
  }
});

// ── Keyboard shortcut ────────────────────────────────────────────────────────

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "send-to-blurby") {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;

    const article = await extractFromTab(tab.id);
    if (article.error) {
      notifyPopup({ type: "send-error", message: article.error });
      return;
    }
    const result = await sendArticle(article);
    notifyPopup({ type: "send-result", result });
  }
});

// ── Message handling from popup/options ──────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "send-current-tab") {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        sendResponse({ error: "No active tab" });
        return;
      }
      const article = await extractFromTab(tab.id);
      if (article.error) {
        sendResponse(article);
        return;
      }
      const result = await sendArticle(article);
      sendResponse(result);
    })();
    return true; // Async response
  }

  if (message.type === "request-pair") {
    if (!_ws || _ws.readyState !== WebSocket.OPEN) {
      sendResponse({ success: false, message: "Not connected to Blurby desktop" });
      return;
    }
    _pairCallback = sendResponse;
    _ws.send(JSON.stringify({ type: "pair", code: message.code }));
    // Timeout after 10 seconds
    setTimeout(() => {
      if (_pairCallback === sendResponse) {
        _pairCallback({ success: false, message: "Pairing timed out" });
        _pairCallback = null;
      }
    }, 10000);
    return true; // Async response
  }

  if (message.type === "get-connection-status") {
    sendResponse({
      connected: _connected,
      authenticated: _authenticated,
      articleCount: _sessionArticleCount,
    });
    return;
  }

  if (message.type === "cloud-sign-in") {
    (async () => {
      try {
        if (message.provider === "google") {
          await signInGoogle();
        } else if (message.provider === "microsoft") {
          await signInMicrosoft();
        }
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    })();
    return true;
  }

  if (message.type === "cloud-sign-out") {
    cloudSignOut().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === "preview-current-tab") {
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        sendResponse({ error: "No active tab" });
        return;
      }
      const article = await extractFromTab(tab.id);
      sendResponse(article);
    })();
    return true;
  }
});

// ── Startup ──────────────────────────────────────────────────────────────────

connectWebSocket();
