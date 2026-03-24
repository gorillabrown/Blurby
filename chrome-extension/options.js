// options.js — Blurby Chrome extension options page logic

const connectionModeEl = document.getElementById("connectionMode");
const pairingTokenEl = document.getElementById("pairingToken");
const copyTokenBtn = document.getElementById("copyToken");
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
      pairingTokenEl.value = data.pairingToken || "";
      defaultModeEl.value = data.defaultMode || "library";

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

pairingTokenEl.addEventListener("input", () => {
  chrome.storage.local.set({ pairingToken: pairingTokenEl.value.trim() });
});

defaultModeEl.addEventListener("change", () => {
  chrome.storage.local.set({ defaultMode: defaultModeEl.value });
});

// ── Copy token ───────────────────────────────────────────────────────────────

copyTokenBtn.addEventListener("click", () => {
  pairingTokenEl.select();
  navigator.clipboard.writeText(pairingTokenEl.value).then(() => {
    copyTokenBtn.textContent = "Copied!";
    setTimeout(() => { copyTokenBtn.textContent = "Copy"; }, 1500);
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
