// options.js — Blurby Chrome extension options page logic

const connectionModeEl = document.getElementById("connectionMode");
const pairingStatusText = document.getElementById("pairingStatusText");
const unpairBtn = document.getElementById("unpairBtn");
const defaultModeEl = document.getElementById("defaultMode");
const cloudSignedIn = document.getElementById("cloudSignedIn");
const cloudSignedOut = document.getElementById("cloudSignedOut");
const cloudEmailEl = document.getElementById("cloudEmail");
const cloudProviderEl = document.getElementById("cloudProvider");
const cloudSignOutBtn = document.getElementById("cloudSignOutBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const msSignInBtn = document.getElementById("msSignInBtn");

// ── Load saved settings ──────────────────────────────────────────────────────

function loadSettings() {
  chrome.storage.local.get(
    ["connectionMode", "pairingToken", "defaultMode", "cloudProvider", "cloudToken", "cloudEmail"],
    (data) => {
      connectionModeEl.value = data.connectionMode || "auto";
      defaultModeEl.value = data.defaultMode || "library";

      // Update pairing status
      if (data.pairingToken) {
        pairingStatusText.textContent = "✓ Paired";
        pairingStatusText.style.color = "#2d7d2d";
        unpairBtn.style.display = "";
      } else {
        pairingStatusText.textContent = "Not paired — use the 6-digit code in the popup";
        pairingStatusText.style.color = "#666";
        unpairBtn.style.display = "none";
      }

      if (data.cloudProvider && data.cloudToken) {
        cloudSignedIn.style.display = "";
        cloudSignedOut.style.display = "none";
        cloudEmailEl.textContent = data.cloudEmail || "Signed in";
        cloudProviderEl.textContent = data.cloudProvider === "google" ? "Google" : "Microsoft";
      } else {
        cloudSignedIn.style.display = "none";
        cloudSignedOut.style.display = "";
      }
    }
  );
}

// ── Auto-save on change ──────────────────────────────────────────────────────

connectionModeEl.addEventListener("change", () => {
  chrome.storage.local.set({ connectionMode: connectionModeEl.value });
});

// (pairing token is now managed by the popup pairing flow, not manually entered)

defaultModeEl.addEventListener("change", () => {
  chrome.storage.local.set({ defaultMode: defaultModeEl.value });
});

// ── Unpair ──────────────────────────────────────────────────────────────────

unpairBtn.addEventListener("click", () => {
  chrome.storage.local.remove("pairingToken", () => {
    pairingStatusText.textContent = "Not paired — use the 6-digit code in the popup";
    pairingStatusText.style.color = "#666";
    unpairBtn.style.display = "none";
  });
});

// ── Cloud sign in/out ────────────────────────────────────────────────────────

googleSignInBtn.addEventListener("click", () => {
  googleSignInBtn.disabled = true;
  googleSignInBtn.textContent = "Signing in...";
  chrome.runtime.sendMessage({ type: "cloud-sign-in", provider: "google" }, (response) => {
    googleSignInBtn.disabled = false;
    googleSignInBtn.textContent = "Sign in with Google";
    if (response && response.success) {
      loadSettings();
    } else {
      alert("Sign-in failed: " + (response?.error || "Unknown error"));
    }
  });
});

msSignInBtn.addEventListener("click", () => {
  msSignInBtn.disabled = true;
  msSignInBtn.textContent = "Signing in...";
  chrome.runtime.sendMessage({ type: "cloud-sign-in", provider: "microsoft" }, (response) => {
    msSignInBtn.disabled = false;
    msSignInBtn.textContent = "Sign in with Microsoft";
    if (response && response.success) {
      loadSettings();
    } else {
      alert("Sign-in failed: " + (response?.error || "Unknown error"));
    }
  });
});

cloudSignOutBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "cloud-sign-out" }, () => {
    loadSettings();
  });
});

// ── Init ─────────────────────────────────────────────────────────────────────
loadSettings();
