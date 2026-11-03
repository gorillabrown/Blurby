import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "module";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// WS-TOKEN-REGEN-1: the extension-pairing token has one stored form, written and read through ws-server's
// encodePairingToken / decodePairingToken (safeStorage ciphertext when encryption is available, plaintext when not).
// The real main/ws-server.js is loaded with electron patched through Module._load, as tests/auth.test.js does.

const require = createRequire(import.meta.url);
const Module = require("module");
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const fakeSafeStorage = {
  available: true,
  isEncryptionAvailable() { return this.available; },
  encryptString(s) { return Buffer.from(`ENC:${s}`, "utf8"); },
  decryptString(buf) {
    const s = buf.toString("utf8");
    if (!s.startsWith("ENC:")) throw new Error("Error while decrypting the ciphertext provided to safeStorage.decryptString.");
    return s.slice(4);
  },
};

let wsServer;
let originalLoad;
const wsServerPath = require.resolve("../main/ws-server.js");

beforeAll(() => {
  originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") return { safeStorage: fakeSafeStorage };
    return originalLoad.call(this, request, parent, isMain);
  };
  delete require.cache[wsServerPath];
  wsServer = require(wsServerPath);
});

afterAll(() => {
  Module._load = originalLoad;
  delete require.cache[wsServerPath];
});

describe("pairing token stored form (WS-TOKEN-REGEN-1)", () => {
  it("(a) with encryption available, the stored form is not the token and decodes back to it", () => {
    fakeSafeStorage.available = true;
    const stored = wsServer.encodePairingToken("tok");
    expect(stored).not.toBe("tok");
    expect(wsServer.decodePairingToken(stored)).toBe("tok");
  });

  it("(b) with encryption unavailable, there is no stored form: encode returns null (amendment: never plaintext)", () => {
    fakeSafeStorage.available = false;
    try {
      expect(wsServer.encodePairingToken("tok")).toBeNull();
    } finally {
      fakeSafeStorage.available = true;
    }
  });

  it("(c) decoding a plaintext token throws when encryption is available (the failure the old regenerate hit)", () => {
    fakeSafeStorage.available = true;
    expect(typeof wsServer.decodePairingToken).toBe("function"); // so the throw below is the decrypt failure, not a TypeError
    expect(() => wsServer.decodePairingToken("tok")).toThrow(/decrypt/);
  });
});

// Amendment 2026-10-22 (Blurby.Brain): never write a credential in plaintext, anywhere.
describe("pairing token is never stored in plaintext (WS-TOKEN-REGEN-1 amendment)", () => {
  const LEGACY = "0123456789abcdef0123456789abcdef"; // the 32-hex form generatePairingToken returns
  const ctxWith = (stored) => {
    const settings = stored === undefined ? {} : { _wsPairingToken: stored };
    return { settings, ctx: { getSettings: () => settings, saveSettings: vi.fn() } };
  };

  it("(r1) with safeStorage, a legacy plaintext token is re-encrypted in place and stays the session token", () => {
    fakeSafeStorage.available = true;
    const { settings, ctx } = ctxWith(LEGACY);
    const token = wsServer.loadPairingToken(ctx);
    expect(token).toBe(LEGACY); // the existing pairing still works
    expect(settings._wsPairingToken).not.toBe(LEGACY);
    expect(wsServer.decodePairingToken(settings._wsPairingToken)).toBe(LEGACY);
    expect(ctx.saveSettings).toHaveBeenCalled();
  });

  it("(r2) without safeStorage, a stored legacy token is deleted and kept in memory only", () => {
    fakeSafeStorage.available = false;
    try {
      const { settings, ctx } = ctxWith(LEGACY);
      const token = wsServer.loadPairingToken(ctx);
      expect(token).toBe(LEGACY);
      expect("_wsPairingToken" in settings).toBe(false);
      expect(ctx.saveSettings).toHaveBeenCalled();
    } finally {
      fakeSafeStorage.available = true;
    }
  });

  it("(r3) after a launch without safeStorage, settings has no _wsPairingToken key", () => {
    fakeSafeStorage.available = false;
    try {
      const { settings, ctx } = ctxWith(undefined);
      const token = wsServer.loadPairingToken(ctx);
      expect(token).toMatch(/^[0-9a-f]{32}$/);
      expect("_wsPairingToken" in settings).toBe(false);
    } finally {
      fakeSafeStorage.available = true;
    }
  });
});

// The renderer's BlurbySettings type and main's SETTINGS_DEFAULTS name the same top-level keys.
function interfaceKeys(source, name) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((l) => l.startsWith(`export interface ${name} {`));
  if (start < 0) throw new Error(`interface ${name} not found`);
  const keys = [];
  let depth = 0;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    if (i > start && depth === 1) {
      const m = /^\s*([A-Za-z_$][\w$]*)\??\s*:/.exec(line);
      if (m) keys.push(m[1]);
    }
    for (const ch of line) {
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
    }
    if (i > start && depth === 0) break;
  }
  return keys;
}

describe("settings keys parity (WS-TOKEN-REGEN-1 fold-in)", () => {
  const typesSource = fs.readFileSync(path.join(ROOT, "src", "types.ts"), "utf8");
  const { SETTINGS_DEFAULTS } = require("../main/migrations.js");

  it("every top-level BlurbySettings key is in SETTINGS_DEFAULTS, and every default is typed", () => {
    const typed = interfaceKeys(typesSource, "BlurbySettings");
    const defaults = Object.keys(SETTINGS_DEFAULTS);
    expect(typed.length).toBeGreaterThan(0);
    expect(typed.filter((k) => !defaults.includes(k))).toEqual([]);
    expect(defaults.filter((k) => !typed.includes(k))).toEqual([]);
  });

  it("control: a planted extra interface key is reported", () => {
    const planted = typesSource.replace("export interface BlurbySettings {", "export interface BlurbySettings {\n  plantedKey: string;");
    const typed = interfaceKeys(planted, "BlurbySettings");
    expect(typed.filter((k) => !Object.keys(SETTINGS_DEFAULTS).includes(k))).toEqual(["plantedKey"]);
  });
});
