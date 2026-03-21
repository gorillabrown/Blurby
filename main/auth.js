// main/auth.js — OAuth2 authentication layer for cloud sync
// CommonJS only — Electron main process

const { BrowserWindow, safeStorage } = require("electron");
const path = require("path");
const fsPromises = require("fs/promises");
const crypto = require("crypto");

// ── Configuration ─────────────────────────────────────────────────────────
// Replace these with your registered OAuth app credentials
const MICROSOFT_CLIENT_ID = "YOUR_AZURE_CLIENT_ID";
const MICROSOFT_REDIRECT_URI = "http://localhost:44321/auth/callback";
const MICROSOFT_AUTHORITY = "https://login.microsoftonline.com/common";
const MICROSOFT_SCOPES = ["User.Read", "Files.ReadWrite.AppFolder", "offline_access"];

const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
const GOOGLE_CLIENT_SECRET = "YOUR_GOOGLE_CLIENT_SECRET"; // For installed apps this is acceptable
const GOOGLE_REDIRECT_URI = "http://localhost:44322/auth/callback";
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/drive.appdata",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

// ── State ─────────────────────────────────────────────────────────────────
let authState = null; // { provider, email, name }
let tokensPath = null;
let authRequiredCallbacks = [];

// Lazy-loaded modules
let _msal = null;
let _msalApp = null;
let _google = null;
let _googleOAuth2Client = null;

function getMsal() {
  if (!_msal) _msal = require("@azure/msal-node");
  return _msal;
}

function getMsalApp() {
  if (!_msalApp) {
    const msal = getMsal();
    _msalApp = new msal.PublicClientApplication({
      auth: {
        clientId: MICROSOFT_CLIENT_ID,
        authority: MICROSOFT_AUTHORITY,
      },
    });
  }
  return _msalApp;
}

function getGoogleAuth() {
  if (!_google) _google = require("googleapis");
  if (!_googleOAuth2Client) {
    _googleOAuth2Client = new _google.google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );
  }
  return _googleOAuth2Client;
}

// ── Token Storage (encrypted with safeStorage) ───────────────────────────

function setTokensPath(dataPath) {
  tokensPath = path.join(dataPath, "auth-tokens.json");
}

async function loadTokens() {
  if (!tokensPath) return {};
  try {
    const raw = await fsPromises.readFile(tokensPath, "utf-8");
    const data = JSON.parse(raw);
    const result = {};
    for (const [provider, encrypted] of Object.entries(data)) {
      if (encrypted && safeStorage.isEncryptionAvailable()) {
        try {
          const buffer = Buffer.from(encrypted, "base64");
          const decrypted = safeStorage.decryptString(buffer);
          result[provider] = JSON.parse(decrypted);
        } catch {
          // Token corrupted or decryption failed
          console.log(`[auth] Failed to decrypt ${provider} tokens`);
        }
      }
    }
    return result;
  } catch {
    return {};
  }
}

async function saveTokens(tokens) {
  if (!tokensPath) return;
  const data = {};
  for (const [provider, tokenData] of Object.entries(tokens)) {
    if (tokenData && safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(JSON.stringify(tokenData));
      data[provider] = encrypted.toString("base64");
    }
  }
  const tmp = tokensPath + ".tmp";
  await fsPromises.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await fsPromises.rename(tmp, tokensPath);
}

async function clearTokens(provider) {
  const tokens = await loadTokens();
  delete tokens[provider];
  await saveTokens(tokens);
}

// ── PKCE Helpers ──────────────────────────────────────────────────────────

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier) {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

// ── Microsoft Auth (MSAL + PKCE) ─────────────────────────────────────────

async function signInMicrosoft() {
  const msal = getMsal();
  const msalApp = getMsalApp();

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  // Generate auth URL
  const authCodeUrlParams = {
    scopes: MICROSOFT_SCOPES,
    redirectUri: MICROSOFT_REDIRECT_URI,
    codeChallenge,
    codeChallengeMethod: "S256",
  };

  const authUrl = await msalApp.getAuthCodeUrl(authCodeUrlParams);

  // Open auth window
  const authCode = await openAuthWindow(authUrl, MICROSOFT_REDIRECT_URI);
  if (!authCode) throw new Error("Authentication was cancelled");

  // Exchange code for tokens
  const tokenResponse = await msalApp.acquireTokenByCode({
    code: authCode,
    scopes: MICROSOFT_SCOPES,
    redirectUri: MICROSOFT_REDIRECT_URI,
    codeVerifier,
  });

  // Extract user info
  const account = tokenResponse.account;
  const userInfo = {
    email: account?.username || "unknown@microsoft.com",
    name: account?.name || "Microsoft User",
    provider: "microsoft",
  };

  // Store tokens
  const tokens = await loadTokens();
  tokens.microsoft = {
    accessToken: tokenResponse.accessToken,
    refreshToken: tokenResponse.refreshToken || null,
    expiresOn: tokenResponse.expiresOn ? tokenResponse.expiresOn.getTime() : Date.now() + 3600000,
    account: account ? JSON.parse(JSON.stringify(account)) : null,
    userInfo,
  };
  await saveTokens(tokens);

  authState = userInfo;
  return userInfo;
}

async function refreshMicrosoftToken() {
  const tokens = await loadTokens();
  const msData = tokens.microsoft;
  if (!msData || !msData.account) throw new Error("No Microsoft token to refresh");

  const msalApp = getMsalApp();

  try {
    const silentRequest = {
      account: msData.account,
      scopes: MICROSOFT_SCOPES,
      forceRefresh: true,
    };

    const tokenResponse = await msalApp.acquireTokenSilent(silentRequest);

    tokens.microsoft = {
      ...msData,
      accessToken: tokenResponse.accessToken,
      expiresOn: tokenResponse.expiresOn ? tokenResponse.expiresOn.getTime() : Date.now() + 3600000,
    };
    await saveTokens(tokens);

    return tokenResponse.accessToken;
  } catch (err) {
    console.log("[auth] Microsoft token refresh failed:", err.message);
    // Emit auth-required
    for (const cb of authRequiredCallbacks) cb("microsoft");
    throw err;
  }
}

// ── Google Auth (OAuth2 + PKCE) ──────────────────────────────────────────

async function signInGoogle() {
  const oauth2Client = getGoogleAuth();

  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: GOOGLE_SCOPES,
    prompt: "consent",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  // Open auth window
  const authCode = await openAuthWindow(authUrl, GOOGLE_REDIRECT_URI);
  if (!authCode) throw new Error("Authentication was cancelled");

  // Exchange code for tokens
  const { tokens: googleTokens } = await oauth2Client.getToken({
    code: authCode,
    codeVerifier,
  });

  oauth2Client.setCredentials(googleTokens);

  // Get user info
  const { google } = require("googleapis");
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const userInfoResponse = await oauth2.userinfo.get();
  const userInfo = {
    email: userInfoResponse.data.email || "unknown@google.com",
    name: userInfoResponse.data.name || "Google User",
    provider: "google",
  };

  // Store tokens
  const tokens = await loadTokens();
  tokens.google = {
    accessToken: googleTokens.access_token,
    refreshToken: googleTokens.refresh_token || null,
    expiresOn: googleTokens.expiry_date || Date.now() + 3600000,
    userInfo,
  };
  await saveTokens(tokens);

  authState = userInfo;
  return userInfo;
}

async function refreshGoogleToken() {
  const tokens = await loadTokens();
  const gData = tokens.google;
  if (!gData || !gData.refreshToken) throw new Error("No Google refresh token");

  const oauth2Client = getGoogleAuth();
  oauth2Client.setCredentials({ refresh_token: gData.refreshToken });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    tokens.google = {
      ...gData,
      accessToken: credentials.access_token,
      expiresOn: credentials.expiry_date || Date.now() + 3600000,
    };
    await saveTokens(tokens);

    return credentials.access_token;
  } catch (err) {
    console.log("[auth] Google token refresh failed:", err.message);
    for (const cb of authRequiredCallbacks) cb("google");
    throw err;
  }
}

// ── Auth Window ──────────────────────────────────────────────────────────

function openAuthWindow(authUrl, redirectUri) {
  return new Promise((resolve, reject) => {
    const win = new BrowserWindow({
      width: 600,
      height: 750,
      title: "Sign in",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    let resolved = false;

    // Listen for redirect
    win.webContents.on("will-redirect", (event, url) => {
      if (url.startsWith(redirectUri)) {
        event.preventDefault();
        resolved = true;
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get("code");
        const error = urlObj.searchParams.get("error");
        win.close();
        if (error) {
          reject(new Error(`Auth error: ${error}`));
        } else {
          resolve(code);
        }
      }
    });

    // Also check navigation (some providers navigate instead of redirect)
    win.webContents.on("will-navigate", (event, url) => {
      if (url.startsWith(redirectUri) && !resolved) {
        event.preventDefault();
        resolved = true;
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get("code");
        const error = urlObj.searchParams.get("error");
        win.close();
        if (error) {
          reject(new Error(`Auth error: ${error}`));
        } else {
          resolve(code);
        }
      }
    });

    win.on("closed", () => {
      if (!resolved) resolve(null); // User closed window
    });

    win.loadURL(authUrl);
  });
}

// ── Public API ────────────────────────────────────────────────────────────

async function signIn(provider) {
  if (provider === "microsoft") return await signInMicrosoft();
  if (provider === "google") return await signInGoogle();
  throw new Error(`Unknown provider: ${provider}`);
}

async function signOut(provider) {
  await clearTokens(provider);
  if (authState && authState.provider === provider) {
    authState = null;
  }

  // Try to revoke token for Google
  if (provider === "google") {
    try {
      const oauth2Client = getGoogleAuth();
      await oauth2Client.revokeCredentials();
    } catch {
      // Best effort revocation
    }
  }
}

async function getAccessToken(provider) {
  const tokens = await loadTokens();
  const data = tokens[provider];
  if (!data) throw new Error(`Not signed in to ${provider}`);

  // Check if token is still valid (with 5 minute buffer)
  const bufferMs = 5 * 60 * 1000;
  if (data.accessToken && data.expiresOn && Date.now() < data.expiresOn - bufferMs) {
    return data.accessToken;
  }

  // Token expired, refresh
  if (provider === "microsoft") return await refreshMicrosoftToken();
  if (provider === "google") return await refreshGoogleToken();
  throw new Error(`Cannot refresh token for ${provider}`);
}

function getAuthState() {
  return authState;
}

function onAuthRequired(cb) {
  authRequiredCallbacks.push(cb);
}

/**
 * Initialize auth module — call once during app startup.
 * Restores auth state from encrypted token storage.
 */
async function initAuth(dataPath) {
  setTokensPath(dataPath);
  const tokens = await loadTokens();

  // Restore auth state from stored tokens
  if (tokens.microsoft && tokens.microsoft.userInfo) {
    authState = tokens.microsoft.userInfo;
  } else if (tokens.google && tokens.google.userInfo) {
    authState = tokens.google.userInfo;
  }
}

module.exports = {
  signIn,
  signOut,
  getAccessToken,
  getAuthState,
  onAuthRequired,
  initAuth,
};
