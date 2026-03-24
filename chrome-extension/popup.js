// popup.js — Blurby Chrome extension popup logic

let _article = null;
let _selectedMode = "library";

// ── DOM refs ─────────────────────────────────────────────────────────────────
const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");
const previewLoading = document.getElementById("previewLoading");
const previewContent = document.getElementById("previewContent");
const previewError = document.getElementById("previewError");
const previewTitle = document.getElementById("previewTitle");
const previewAuthor = document.getElementById("previewAuthor");
const previewWords = document.getElementById("previewWords");
const previewTime = document.getElementById("previewTime");
const sendBtn = document.getElementById("sendBtn");
const sendStatus = document.getElementById("sendStatus");
const recentList = document.getElementById("recentList");
const settingsLink = document.getElementById("settingsLink");

// ── Mode selector ────────────────────────────────────────────────────────────
document.querySelectorAll(".mode-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".mode-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    _selectedMode = btn.dataset.mode;
  });
});

// ── Settings link ────────────────────────────────────────────────────────────
settingsLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// ── Connection status ────────────────────────────────────────────────────────
function updateConnectionStatus() {
  chrome.runtime.sendMessage({ type: "get-connection-status" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      statusBadge.className = "status-badge disconnected";
      statusText.textContent = "Offline";
      return;
    }
    if (response.connected && response.authenticated) {
      statusBadge.className = "status-badge connected";
      statusText.textContent = "Connected";
    } else {
      statusBadge.className = "status-badge disconnected";
      statusText.textContent = "Not running";
    }
  });
}

// ── Preview extraction ───────────────────────────────────────────────────────
function loadPreview() {
  previewLoading.style.display = "";
  previewContent.style.display = "none";
  previewError.style.display = "none";

  chrome.runtime.sendMessage({ type: "preview-current-tab" }, (response) => {
    previewLoading.style.display = "none";

    if (chrome.runtime.lastError) {
      showPreviewError("Could not access this page.");
      return;
    }
    if (!response || response.error) {
      showPreviewError(response?.error || "Could not extract content.");
      return;
    }

    _article = response;
    previewContent.style.display = "";
    previewTitle.textContent = response.title || "Untitled";

    if (response.author) {
      previewAuthor.textContent = response.author;
    }
    if (response.wordCount) {
      previewWords.textContent = `${response.wordCount.toLocaleString()} words`;
      const minutes = Math.ceil(response.wordCount / 250);
      previewTime.textContent = `~${minutes} min`;
    }

    sendBtn.disabled = false;
    sendBtn.textContent = "Send to Blurby";
  });
}

function showPreviewError(msg) {
  previewError.style.display = "";
  previewError.textContent = msg;
  sendBtn.disabled = true;
}

// ── Send ─────────────────────────────────────────────────────────────────────
sendBtn.addEventListener("click", async () => {
  if (!_article || sendBtn.disabled) return;

  sendBtn.disabled = true;
  sendBtn.textContent = "Sending...";
  sendStatus.textContent = "";

  chrome.runtime.sendMessage({ type: "send-current-tab" }, (response) => {
    if (chrome.runtime.lastError) {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send to Blurby";
      sendStatus.textContent = "Failed to send.";
      return;
    }

    if (response && (response.status === "sent" || response.method === "local")) {
      sendBtn.classList.add("success");
      sendBtn.textContent = "Sent!";
      if (response.method === "cloud") {
        sendStatus.textContent = response.message || "Saved to cloud.";
      } else {
        sendStatus.textContent = "Added to Blurby library.";
      }
      loadRecentSends();
      setTimeout(() => {
        sendBtn.classList.remove("success");
        sendBtn.disabled = false;
        sendBtn.textContent = "Send to Blurby";
      }, 2000);
    } else {
      sendBtn.disabled = false;
      sendBtn.textContent = "Send to Blurby";
      sendStatus.textContent = response?.message || "Failed to send.";
    }
  });
});

// ── Recent sends ─────────────────────────────────────────────────────────────
function loadRecentSends() {
  chrome.storage.local.get("recentSends", ({ recentSends = [] }) => {
    if (recentSends.length === 0) {
      recentList.innerHTML = '<div class="recent-empty">No articles sent yet</div>';
      return;
    }

    recentList.innerHTML = recentSends
      .map((item) => {
        const ago = formatTimeAgo(item.sentAt);
        return `<div class="recent-item">
          <span class="recent-item-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</span>
          <span class="recent-item-meta">${ago}</span>
        </div>`;
      })
      .join("");
  });
}

function formatTimeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ── Listen for service worker messages ───────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "send-success") {
    loadRecentSends();
  }
  if (message.type === "send-error") {
    sendStatus.textContent = message.message || "Send failed.";
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────
updateConnectionStatus();
loadPreview();
loadRecentSends();
