import { createRequire } from "module";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import path from "path";

const require = createRequire(import.meta.url);
const Module = require("module");

const mocks = vi.hoisted(() => {
  const fileStore = new Map();
  const browserWindows = [];

  const safeStorage = {
    isEncryptionAvailable: vi.fn(() => true),
    encryptString: vi.fn((value) => Buffer.from(String(value), "utf-8")),
    decryptString: vi.fn((buffer) => Buffer.from(buffer).toString("utf-8")),
  };

  const msalApp = {
    getAuthCodeUrl: vi.fn(),
    acquireTokenByCode: vi.fn(),
    acquireTokenSilent: vi.fn(),
  };

  const msalConstructor = vi.fn(function PublicClientApplication() {
    return msalApp;
  });

  const googleUserInfoGet = vi.fn();
  const googleOauth2Service = vi.fn(() => ({
    userinfo: { get: googleUserInfoGet },
  }));

  const googleOAuthClient = {
    generateAuthUrl: vi.fn(),
    getToken: vi.fn(),
    setCredentials: vi.fn(),
    refreshAccessToken: vi.fn(),
    revokeCredentials: vi.fn(),
  };

  const googleAuthConstructor = vi.fn(function OAuth2() {
    return googleOAuthClient;
  });

  function BrowserWindowMock(options) {
    if (!(this instanceof BrowserWindowMock)) {
      return new BrowserWindowMock(options);
    }

    this.options = options;
    this.loadedUrl = null;
    this.webContentsHandlers = {};
    this.windowHandlers = {};
    this.webContents = {
      on: vi.fn((event, handler) => {
        this.webContentsHandlers[event] = handler;
      }),
    };
    this.on = vi.fn((event, handler) => {
      this.windowHandlers[event] = handler;
    });
    this.loadURL = vi.fn((url) => {
      this.loadedUrl = url;
    });
    this.close = vi.fn(() => {
      this.windowHandlers.closed?.();
    });
    browserWindows.push(this);
  }

  BrowserWindowMock.prototype.emit = function emit(event, url) {
    const handler = this.webContentsHandlers[event];
    if (!handler) throw new Error(`Missing handler for ${event}`);
    handler({ preventDefault: vi.fn() }, url);
  };

  return {
    fileStore,
    browserWindows,
    safeStorage,
    msalApp,
    msalConstructor,
    googleUserInfoGet,
    googleOauth2Service,
    googleOAuthClient,
    googleAuthConstructor,
    BrowserWindowMock,
  };
});


const fsMock = {
  readFile: vi.fn(async (filePath) => {
    if (!mocks.fileStore.has(filePath)) throw new Error("ENOENT");
    return mocks.fileStore.get(filePath);
  }),
  writeFile: vi.fn(async (filePath, contents) => {
    mocks.fileStore.set(filePath, contents);
  }),
  rename: vi.fn(async (from, to) => {
    const contents = mocks.fileStore.get(from);
    if (contents !== undefined) {
      mocks.fileStore.set(to, contents);
      mocks.fileStore.delete(from);
    }
  }),
};

let originalModuleLoad = null;

function installModuleMocks() {
  if (originalModuleLoad) return;

  originalModuleLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") {
      return {
        BrowserWindow: mocks.BrowserWindowMock,
        safeStorage: mocks.safeStorage,
      };
    }

    if (request === "@azure/msal-node") {
      return {
        PublicClientApplication: mocks.msalConstructor,
      };
    }

    if (request === "googleapis") {
      return {
        google: {
          auth: {
            OAuth2: mocks.googleAuthConstructor,
          },
          oauth2: mocks.googleOauth2Service,
        },
      };
    }

    if (request === "fs/promises") {
      return fsMock;
    }

    return originalModuleLoad.call(this, request, parent, isMain);
  };
}

function restoreModuleMocks() {
  if (!originalModuleLoad) return;
  Module._load = originalModuleLoad;
  originalModuleLoad = null;
}

const DATA_ROOT = "C:/blurby-auth-tests";

function tokenPathFor(dataPath) {
  return path.join(dataPath, "auth-tokens.json");
}

function flush() {
  return new Promise((resolve) => setImmediate(resolve));
}

function resetMocks() {
  mocks.fileStore.clear();
  mocks.browserWindows.length = 0;

  mocks.safeStorage.isEncryptionAvailable.mockReturnValue(true);
  mocks.safeStorage.encryptString.mockImplementation((value) => Buffer.from(String(value), "utf-8"));
  mocks.safeStorage.decryptString.mockImplementation((buffer) => Buffer.from(buffer).toString("utf-8"));

  mocks.msalConstructor.mockClear();
  mocks.msalApp.getAuthCodeUrl.mockReset();
  mocks.msalApp.acquireTokenByCode.mockReset();
  mocks.msalApp.acquireTokenSilent.mockReset();

  mocks.googleAuthConstructor.mockClear();
  mocks.googleUserInfoGet.mockReset();
  mocks.googleOauth2Service.mockClear();
  mocks.googleOAuthClient.generateAuthUrl.mockReset();
  mocks.googleOAuthClient.getToken.mockReset();
  mocks.googleOAuthClient.setCredentials.mockReset();
  mocks.googleOAuthClient.refreshAccessToken.mockReset();
  mocks.googleOAuthClient.revokeCredentials.mockReset();
}

function seedEncryptedTokens(dataPath, tokensByProvider) {
  const filePath = tokenPathFor(dataPath);
  const payload = {};

  for (const [provider, tokenData] of Object.entries(tokensByProvider)) {
    const encrypted = mocks.safeStorage.encryptString(JSON.stringify(tokenData));
    payload[provider] = encrypted.toString("base64");
  }

  mocks.fileStore.set(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

async function loadAuthModule() {
  delete require.cache[require.resolve("../main/auth.js")];
  return require("../main/auth.js");
}

function latestWindow() {
  const win = mocks.browserWindows[mocks.browserWindows.length - 1];
  if (!win) throw new Error("No auth BrowserWindow was created");
  return win;
}

beforeEach(() => {
  resetMocks();
  installModuleMocks();
});

afterEach(() => {
  restoreModuleMocks();
});

describe("auth module", () => {
  it("signIn routes Microsoft auth through MSAL and persists encrypted tokens", async () => {
    const dataPath = `${DATA_ROOT}/microsoft-signin`;
    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    mocks.msalApp.getAuthCodeUrl.mockImplementation(async (options) => {
      return `https://login.microsoftonline.com/auth?state=${options.state}`;
    });
    mocks.msalApp.acquireTokenByCode.mockResolvedValue({
      accessToken: "ms-access-1",
      refreshToken: "ms-refresh-1",
      expiresOn: new Date(Date.now() + 60_000),
      account: { username: "ms@example.com", name: "Microsoft User" },
    });

    const signInPromise = auth.signIn("microsoft");
    await flush();

    const window = latestWindow();
    const authUrl = window.loadURL.mock.calls[0][0];
    const state = new URL(authUrl).searchParams.get("state");

    window.emit("will-redirect", `http://localhost:44321/auth/callback?code=ms-code-1&state=${state}`);

    await expect(signInPromise).resolves.toEqual({
      email: "ms@example.com",
      name: "Microsoft User",
      provider: "microsoft",
    });

    expect(auth.getAuthState()).toEqual({
      email: "ms@example.com",
      name: "Microsoft User",
      provider: "microsoft",
    });

    const stored = JSON.parse(mocks.fileStore.get(tokenPathFor(dataPath)));
    expect(stored.microsoft).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it("signIn routes Google auth through OAuth2 and persists encrypted tokens", async () => {
    const dataPath = `${DATA_ROOT}/google-signin`;
    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    mocks.googleOAuthClient.generateAuthUrl.mockImplementation((options) => {
      return `https://accounts.google.com/o/oauth2/auth?state=${options.state}`;
    });
    mocks.googleOAuthClient.getToken.mockResolvedValue({
      tokens: {
        access_token: "google-access-1",
        refresh_token: "google-refresh-1",
        expiry_date: Date.now() + 120_000,
      },
    });
    mocks.googleUserInfoGet.mockResolvedValue({
      data: { email: "google@example.com", name: "Google User" },
    });

    const signInPromise = auth.signIn("google");
    await flush();

    const window = latestWindow();
    const authUrl = window.loadURL.mock.calls[0][0];
    const state = new URL(authUrl).searchParams.get("state");

    window.emit("will-redirect", `http://localhost:44322/auth/callback?code=google-code-1&state=${state}`);

    await expect(signInPromise).resolves.toEqual({
      email: "google@example.com",
      name: "Google User",
      provider: "google",
    });

    expect(mocks.googleOAuthClient.setCredentials).toHaveBeenCalledWith({
      access_token: "google-access-1",
      refresh_token: "google-refresh-1",
      expiry_date: expect.any(Number),
    });

    const stored = JSON.parse(mocks.fileStore.get(tokenPathFor(dataPath)));
    expect(stored.google).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it("initAuth restores Microsoft auth state and prefers Microsoft when both providers are present", async () => {
    const dataPath = `${DATA_ROOT}/restore-precedence`;
    seedEncryptedTokens(dataPath, {
      microsoft: {
        accessToken: "ms-access",
        refreshToken: "ms-refresh",
        expiresOn: Date.now() + 60_000,
        account: { username: "ms@example.com", name: "Microsoft User" },
        userInfo: { email: "ms@example.com", name: "Microsoft User", provider: "microsoft" },
      },
      google: {
        accessToken: "google-access",
        refreshToken: "google-refresh",
        expiresOn: Date.now() + 60_000,
        userInfo: { email: "google@example.com", name: "Google User", provider: "google" },
      },
    });

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    expect(auth.getAuthState()).toEqual({
      email: "ms@example.com",
      name: "Microsoft User",
      provider: "microsoft",
    });
  });

  it("initAuth falls back to Google auth state when Microsoft tokens are absent", async () => {
    const dataPath = `${DATA_ROOT}/restore-google`;
    seedEncryptedTokens(dataPath, {
      google: {
        accessToken: "google-access",
        refreshToken: "google-refresh",
        expiresOn: Date.now() + 60_000,
        userInfo: { email: "google@example.com", name: "Google User", provider: "google" },
      },
    });

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    expect(auth.getAuthState()).toEqual({
      email: "google@example.com",
      name: "Google User",
      provider: "google",
    });
  });

  it("getAuthState returns null after initAuth sees no stored tokens", async () => {
    const auth = await loadAuthModule();
    await auth.initAuth(`${DATA_ROOT}/empty`);

    expect(auth.getAuthState()).toBeNull();
  });

  it("getAccessToken returns a cached Microsoft token without refreshing", async () => {
    const dataPath = `${DATA_ROOT}/cached-microsoft`;
    seedEncryptedTokens(dataPath, {
      microsoft: {
        accessToken: "cached-ms-access",
        refreshToken: "cached-ms-refresh",
        expiresOn: Date.now() + 30 * 60_000,
        account: { username: "ms@example.com", name: "Microsoft User" },
        userInfo: { email: "ms@example.com", name: "Microsoft User", provider: "microsoft" },
      },
    });

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    await expect(auth.getAccessToken("microsoft")).resolves.toBe("cached-ms-access");
    expect(mocks.msalApp.acquireTokenSilent).not.toHaveBeenCalled();
  });

  it("getAccessToken bypasses a cached Microsoft token when forceRefresh is requested", async () => {
    const dataPath = `${DATA_ROOT}/force-refresh-microsoft`;
    seedEncryptedTokens(dataPath, {
      microsoft: {
        accessToken: "cached-ms-access",
        refreshToken: "ms-refresh",
        expiresOn: Date.now() + 30 * 60_000,
        account: { username: "ms@example.com", name: "Microsoft User" },
        userInfo: { email: "ms@example.com", name: "Microsoft User", provider: "microsoft" },
      },
    });

    mocks.msalApp.acquireTokenSilent.mockResolvedValue({
      accessToken: "forced-ms-access",
      expiresOn: new Date(Date.now() + 90_000),
    });

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    await expect(auth.getAccessToken("microsoft", { forceRefresh: true })).resolves.toBe("forced-ms-access");
    expect(mocks.msalApp.acquireTokenSilent).toHaveBeenCalledWith(
      expect.objectContaining({
        forceRefresh: true,
      })
    );
  });

  it("getAccessToken refreshes Microsoft tokens when expired", async () => {
    const dataPath = `${DATA_ROOT}/refresh-microsoft`;
    seedEncryptedTokens(dataPath, {
      microsoft: {
        accessToken: "stale-ms-access",
        refreshToken: "ms-refresh",
        expiresOn: Date.now() - 60_000,
        account: { username: "ms@example.com", name: "Microsoft User" },
        userInfo: { email: "ms@example.com", name: "Microsoft User", provider: "microsoft" },
      },
    });

    mocks.msalApp.acquireTokenSilent.mockResolvedValue({
      accessToken: "fresh-ms-access",
      expiresOn: new Date(Date.now() + 90_000),
    });

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    await expect(auth.getAccessToken("microsoft")).resolves.toBe("fresh-ms-access");
    expect(mocks.msalApp.acquireTokenSilent).toHaveBeenCalledWith(
      expect.objectContaining({
        forceRefresh: true,
        scopes: expect.arrayContaining(["User.Read", "Files.ReadWrite.AppFolder", "offline_access"]),
      })
    );

    const stored = JSON.parse(mocks.fileStore.get(tokenPathFor(dataPath)));
    const decrypted = JSON.parse(mocks.safeStorage.decryptString(Buffer.from(stored.microsoft, "base64")));
    expect(decrypted.accessToken).toBe("fresh-ms-access");
  });

  it("getAccessToken refreshes Google tokens when expired", async () => {
    const dataPath = `${DATA_ROOT}/refresh-google`;
    seedEncryptedTokens(dataPath, {
      google: {
        accessToken: "stale-google-access",
        refreshToken: "google-refresh",
        expiresOn: Date.now() - 60_000,
        userInfo: { email: "google@example.com", name: "Google User", provider: "google" },
      },
    });

    mocks.googleOAuthClient.refreshAccessToken.mockResolvedValue({
      credentials: {
        access_token: "fresh-google-access",
        expiry_date: Date.now() + 90_000,
      },
    });

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    await expect(auth.getAccessToken("google")).resolves.toBe("fresh-google-access");
    expect(mocks.googleOAuthClient.setCredentials).toHaveBeenCalledWith({
      refresh_token: "google-refresh",
    });

    const stored = JSON.parse(mocks.fileStore.get(tokenPathFor(dataPath)));
    const decrypted = JSON.parse(mocks.safeStorage.decryptString(Buffer.from(stored.google, "base64")));
    expect(decrypted.accessToken).toBe("fresh-google-access");
  });

  it("getAccessToken bypasses a cached Google token when forceRefresh is requested", async () => {
    const dataPath = `${DATA_ROOT}/force-refresh-google`;
    seedEncryptedTokens(dataPath, {
      google: {
        accessToken: "cached-google-access",
        refreshToken: "google-refresh",
        expiresOn: Date.now() + 30 * 60_000,
        userInfo: { email: "google@example.com", name: "Google User", provider: "google" },
      },
    });

    mocks.googleOAuthClient.refreshAccessToken.mockResolvedValue({
      credentials: {
        access_token: "forced-google-access",
        expiry_date: Date.now() + 90_000,
      },
    });

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    await expect(auth.getAccessToken("google", { forceRefresh: true })).resolves.toBe("forced-google-access");
    expect(mocks.googleOAuthClient.refreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it("refresh failure triggers authRequired callbacks and rethrows", async () => {
    const dataPath = `${DATA_ROOT}/refresh-failure`;
    seedEncryptedTokens(dataPath, {
      microsoft: {
        accessToken: "stale-ms-access",
        refreshToken: "ms-refresh",
        expiresOn: Date.now() - 60_000,
        account: { username: "ms@example.com", name: "Microsoft User" },
        userInfo: { email: "ms@example.com", name: "Microsoft User", provider: "microsoft" },
      },
    });

    mocks.msalApp.acquireTokenSilent.mockRejectedValue(new Error("refresh failed"));

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    const onAuthRequired = vi.fn();
    auth.onAuthRequired(onAuthRequired);

    await expect(auth.getAccessToken("microsoft")).rejects.toThrow("refresh failed");
    expect(onAuthRequired).toHaveBeenCalledWith("microsoft");
  });

  it("signOut clears the active Google auth state and revokes credentials", async () => {
    const dataPath = `${DATA_ROOT}/signout-google`;
    seedEncryptedTokens(dataPath, {
      google: {
        accessToken: "google-access",
        refreshToken: "google-refresh",
        expiresOn: Date.now() + 60_000,
        userInfo: { email: "google@example.com", name: "Google User", provider: "google" },
      },
    });

    mocks.googleOAuthClient.revokeCredentials.mockResolvedValue(undefined);

    const auth = await loadAuthModule();
    await auth.initAuth(dataPath);

    expect(auth.getAuthState()).toEqual({
      email: "google@example.com",
      name: "Google User",
      provider: "google",
    });

    await auth.signOut("google");

    expect(auth.getAuthState()).toBeNull();
    expect(mocks.googleOAuthClient.revokeCredentials).toHaveBeenCalledTimes(1);

    const stored = JSON.parse(mocks.fileStore.get(tokenPathFor(dataPath)));
    expect(stored).toEqual({});
  });

  it("encrypted token storage survives a reload and restores auth state", async () => {
    const dataPath = `${DATA_ROOT}/roundtrip`;
    const firstAuth = await loadAuthModule();
    await firstAuth.initAuth(dataPath);

    mocks.msalApp.getAuthCodeUrl.mockImplementation(async (options) => {
      return `https://login.microsoftonline.com/auth?state=${options.state}`;
    });
    mocks.msalApp.acquireTokenByCode.mockResolvedValue({
      accessToken: "roundtrip-access",
      refreshToken: "roundtrip-refresh",
      expiresOn: new Date(Date.now() + 60_000),
      account: { username: "roundtrip@example.com", name: "Round Trip User" },
    });

    const signInPromise = firstAuth.signIn("microsoft");
    await flush();

    const window = latestWindow();
    const authUrl = window.loadURL.mock.calls[0][0];
    const state = new URL(authUrl).searchParams.get("state");
    window.emit("will-redirect", `http://localhost:44321/auth/callback?code=roundtrip-code&state=${state}`);

    await expect(signInPromise).resolves.toEqual({
      email: "roundtrip@example.com",
      name: "Round Trip User",
      provider: "microsoft",
    });

    const stored = JSON.parse(mocks.fileStore.get(tokenPathFor(dataPath)));
    expect(stored.microsoft).toMatch(/^[A-Za-z0-9+/=]+$/);

    const reloadedAuth = await loadAuthModule();
    await reloadedAuth.initAuth(dataPath);

    expect(reloadedAuth.getAuthState()).toEqual({
      email: "roundtrip@example.com",
      name: "Round Trip User",
      provider: "microsoft",
    });
  });
});
