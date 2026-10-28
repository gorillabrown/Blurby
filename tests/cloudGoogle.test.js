import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRequire } from "module";

const { fetchMock, getAccessTokenMock } = vi.hoisted(() => ({
  fetchMock: vi.fn(),
  getAccessTokenMock: vi.fn(),
}));

const require = createRequire(import.meta.url);
const Module = require("module");
const originalLoad = Module._load;

function toArrayBuffer(text) {
  const bytes = Buffer.from(text, "utf8");
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

function makeResponse({
  status = 200,
  statusText = "OK",
  jsonData = {},
  textData = "",
  arrayBufferData = toArrayBuffer(""),
  headers = {},
} = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => jsonData,
    text: async () => textData,
    arrayBuffer: async () => arrayBufferData,
    headers: {
      get: (name) => headers[name] ?? headers[name?.toLowerCase()] ?? null,
    },
  };
}

async function loadStorage() {
  const { getGoogleDriveStorage } = await import("../main/cloud-google.js");
  return getGoogleDriveStorage();
}

function setupDefaults() {
  fetchMock.mockReset();
  getAccessTokenMock.mockReset();
  getAccessTokenMock.mockResolvedValue("google-token");
  vi.spyOn(globalThis, "setTimeout").mockImplementation((fn) => {
    fn();
    return 0;
  });
}

function installModuleStubs() {
  Module._load = function patchedLoad(request, parent, isMain) {
    if (request === "electron") {
      return {
        net: {
          fetch: fetchMock,
        },
      };
    }
    if (request === "./auth") {
      return {
        getAccessToken: getAccessTokenMock,
      };
    }
    if (request === "./constants") {
      return {
        GOOGLE_CHUNK_SIZE: 4,
        CLOUD_MAX_RETRIES: 5,
        RETRY_BASE_DELAY_MS: 1,
        RETRY_MAX_DELAY_MS: 8,
      };
    }
    return originalLoad.apply(this, arguments);
  };
}

function searchResponse(fileId = "file-1", fileName = "docs/test.txt") {
  return makeResponse({
    jsonData: {
      files: [{ id: fileId, name: fileName }],
    },
  });
}

function missingSearchResponse() {
  return makeResponse({
    jsonData: { files: [] },
  });
}

function mediaResponse(text, status = 200) {
  return makeResponse({
    status,
    statusText: status === 200 ? "OK" : "Error",
    arrayBufferData: toArrayBuffer(text),
  });
}

afterEach(() => {
  Module._load = originalLoad;
  vi.restoreAllMocks();
});

describe("cloud-google storage", () => {
  beforeEach(() => {
    vi.resetModules();
    setupDefaults();
    installModuleStubs();
  });

  it("retries 429 responses and eventually returns the file buffer", async () => {
    const storage = await loadStorage();
    fetchMock
      .mockImplementationOnce(async () => searchResponse())
      .mockImplementationOnce(async () => makeResponse({ status: 429, statusText: "Too Many Requests" }))
      .mockImplementationOnce(async () => mediaResponse("retry-ok"));

    const result = await storage.readFile("docs/test.txt");

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString("utf8")).toBe("retry-ok");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessTokenMock).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  it("retries 503 responses and eventually returns the file buffer", async () => {
    const storage = await loadStorage();
    fetchMock
      .mockImplementationOnce(async () => searchResponse())
      .mockImplementationOnce(async () => makeResponse({ status: 503, statusText: "Service Unavailable" }))
      .mockImplementationOnce(async () => mediaResponse("service-ok"));

    const result = await storage.readFile("docs/test.txt");

    expect(result.toString("utf8")).toBe("service-ok");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessTokenMock).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  it("retries 504 responses and eventually returns the file buffer", async () => {
    const storage = await loadStorage();
    fetchMock
      .mockImplementationOnce(async () => searchResponse())
      .mockImplementationOnce(async () => makeResponse({ status: 504, statusText: "Gateway Timeout" }))
      .mockImplementationOnce(async () => mediaResponse("timeout-ok"));

    const result = await storage.readFile("docs/test.txt");

    expect(result.toString("utf8")).toBe("timeout-ok");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessTokenMock).toHaveBeenCalledTimes(3);
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  it("refreshes the Google token after a 401 and retries once", async () => {
    const storage = await loadStorage();
    fetchMock
      .mockImplementationOnce(async () => searchResponse())
      .mockImplementationOnce(async () => makeResponse({ status: 401, statusText: "Unauthorized" }))
      .mockImplementationOnce(async () => mediaResponse("refreshed-ok"));

    const result = await storage.readFile("docs/test.txt");

    expect(result.toString("utf8")).toBe("refreshed-ok");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessTokenMock).toHaveBeenCalledTimes(4);
    expect(getAccessTokenMock.mock.calls[2]).toEqual(["google", { forceRefresh: true }]);
    expect(setTimeout).not.toHaveBeenCalled();
  });

  it("throws immediately on a non-retryable 4xx response", async () => {
    const storage = await loadStorage();
    fetchMock
      .mockImplementationOnce(async () => searchResponse())
      .mockImplementationOnce(async () => makeResponse({ status: 400, statusText: "Bad Request", textData: "nope" }));

    await expect(storage.readFile("docs/test.txt")).rejects.toThrow("Google Drive API error: 400 Bad Request");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAccessTokenMock).toHaveBeenCalledTimes(2);
    expect(setTimeout).not.toHaveBeenCalled();
  });

  it("stops after the configured max retry count on persistent 503 failures", async () => {
    const storage = await loadStorage();
    fetchMock
      .mockImplementationOnce(async () => searchResponse())
      .mockImplementation(async () => makeResponse({ status: 503, statusText: "Service Unavailable" }));

    await expect(storage.readFile("docs/test.txt")).rejects.toThrow("Google Drive API error: 503 Service Unavailable");

    const mediaCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes("alt=media"));
    expect(mediaCalls).toHaveLength(5);
    expect(fetchMock).toHaveBeenCalledTimes(6);
    expect(getAccessTokenMock).toHaveBeenCalledTimes(6);
    expect(setTimeout.mock.calls.map(([, delay]) => delay)).toEqual([1, 2, 4, 8, 8]);
  });

  it("returns a Buffer from readFile", async () => {
    const storage = await loadStorage();
    fetchMock
      .mockImplementationOnce(async () => searchResponse())
      .mockImplementationOnce(async () => mediaResponse("buffer-output"));

    const result = await storage.readFile("docs/test.txt");

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.equals(Buffer.from("buffer-output"))).toBe(true);
  });

  it("routes oversized writes through resumable upload", async () => {
    const storage = await loadStorage();
    const uploadUrl = "https://upload.example.com/session-1";

    fetchMock
      .mockImplementationOnce(async () => missingSearchResponse())
      .mockImplementationOnce(async () => makeResponse({
        headers: { Location: uploadUrl },
      }))
      .mockImplementationOnce(async () => makeResponse({ status: 308, statusText: "Resume Incomplete" }))
      .mockImplementationOnce(async () => makeResponse({
        jsonData: { id: "large-file-id" },
      }));

    await storage.writeFile("docs/large.bin", Buffer.alloc(5, 0x61));

    expect(fetchMock.mock.calls[1][0]).toContain("uploadType=resumable");
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
    expect(fetchMock.mock.calls[2][0]).toBe(uploadUrl);
    expect(fetchMock.mock.calls[3][0]).toBe(uploadUrl);
    expect(fetchMock.mock.calls.some(([url]) => String(url).includes("uploadType=multipart"))).toBe(false);
  });

  it("adds ifGenerationMatch to conditional writes", async () => {
    const storage = await loadStorage();

    fetchMock
      .mockImplementationOnce(async () => searchResponse("file-9"))
      .mockImplementationOnce(async (url, options) => {
        expect(String(url)).toContain("/files/file-9?uploadType=multipart&ifGenerationMatch=7");
        expect(options.method).toBe("PATCH");
        return makeResponse({
          jsonData: { id: "file-9", generation: 12 },
        });
      });

    const result = await storage.writeFileConditional("docs/test.txt", Buffer.from("abc"), "7");

    expect(result).toEqual({ ok: true, conflict: false, newGeneration: "12" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("caches getFileId results between reads", async () => {
    const storage = await loadStorage();
    fetchMock
      .mockImplementationOnce(async () => searchResponse("file-1", "docs/test.txt"))
      .mockImplementationOnce(async () => mediaResponse("first-pass"))
      .mockImplementationOnce(async () => mediaResponse("second-pass"));

    const first = await storage.readFile("docs/test.txt");
    const second = await storage.readFile("docs/test.txt");

    expect(first.toString("utf8")).toBe("first-pass");
    expect(second.toString("utf8")).toBe("second-pass");
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes("spaces=appDataFolder"))).toHaveLength(1);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes("alt=media"))).toHaveLength(2);
  });
});
