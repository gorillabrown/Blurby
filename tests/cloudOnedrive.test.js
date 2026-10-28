import { createRequire } from "module";
import { describe, it, expect, vi, beforeEach } from "vitest";

const require = createRequire(import.meta.url);

const { mockFetch, mockGetAccessToken } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockGetAccessToken: vi.fn(),
}));

function installCommonJsMock(modulePath, exports) {
  require.cache[modulePath] = {
    id: modulePath,
    filename: modulePath,
    loaded: true,
    exports,
  };
}

function installModuleMocks() {
  installCommonJsMock(require.resolve("electron"), {
    net: {
      fetch: mockFetch,
    },
  });
  installCommonJsMock(require.resolve("../main/auth.js"), {
    getAccessToken: mockGetAccessToken,
  });
  installCommonJsMock(require.resolve("../main/constants.js"), {
    ONEDRIVE_CHUNK_SIZE: 4,
    CLOUD_MAX_RETRIES: 3,
    RETRY_BASE_DELAY_MS: 1,
    RETRY_MAX_DELAY_MS: 4,
  });
}

function makeResponse({
  ok = true,
  status = 200,
  statusText = "OK",
  jsonData,
  textData = "",
  arrayBufferData = new Uint8Array().buffer,
} = {}) {
  return {
    ok,
    status,
    statusText,
    json: jsonData === undefined ? async () => ({}) : async () => jsonData,
    text: async () => textData,
    arrayBuffer: async () => arrayBufferData,
  };
}

function makeStorage() {
  return loadStorage();
}

async function loadStorage() {
  const { getOneDriveStorage } = await import("../main/cloud-onedrive.js");
  return getOneDriveStorage();
}

beforeEach(() => {
  vi.resetModules();
  mockFetch.mockReset();
  mockGetAccessToken.mockReset();
  mockGetAccessToken.mockResolvedValue("access-token");
  installModuleMocks();
});

describe("cloud-onedrive", () => {
  it.each([429, 503, 504])("retries readFile on %i", async (status) => {
    const storage = await makeStorage();
    const payload = Buffer.from("ok");

    mockFetch
      .mockResolvedValueOnce(makeResponse({
        ok: false,
        status,
        statusText: "retry me",
        textData: `retry-${status}`,
      }))
      .mockResolvedValueOnce(makeResponse({
        ok: true,
        status: 200,
        arrayBufferData: payload,
      }));

    await expect(storage.readFile("docs/settings.json")).resolves.toEqual(payload);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://graph.microsoft.com/v1.0/me/drive/special/approot:/docs/settings.json:/content",
    );
  });

  it("refreshes the Microsoft token after a 401 and retries readFile", async () => {
    const storage = await makeStorage();
    const payload = Buffer.from("fresh");

    mockFetch
      .mockResolvedValueOnce(makeResponse({
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        textData: "expired",
      }))
      .mockResolvedValueOnce(makeResponse({
        ok: true,
        status: 200,
        arrayBufferData: payload,
      }));

    await expect(storage.readFile("docs/token.txt")).resolves.toEqual(payload);
    expect(mockGetAccessToken).toHaveBeenCalledWith("microsoft");
    expect(mockGetAccessToken.mock.calls.filter(([scope]) => scope === "microsoft")).toHaveLength(3);
    expect(mockGetAccessToken.mock.calls[1]).toEqual(["microsoft", { forceRefresh: true }]);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("readFile fetches from the approot content path", async () => {
    const storage = await makeStorage();
    const payload = Buffer.from("content");

    mockFetch.mockResolvedValueOnce(makeResponse({
      ok: true,
      status: 200,
      arrayBufferData: payload,
    }));

    await expect(storage.readFile("nested/file.txt")).resolves.toEqual(payload);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://graph.microsoft.com/v1.0/me/drive/special/approot:/nested/file.txt:/content",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      }),
    );
  });

  it("routes large writes through the upload session flow", async () => {
    const storage = await makeStorage();
    const data = Buffer.from("abcdef");

    mockFetch
      .mockResolvedValueOnce(makeResponse({
        ok: true,
        status: 200,
        jsonData: { uploadUrl: "https://upload.example/session" },
      }))
      .mockResolvedValueOnce(makeResponse({
        ok: true,
        status: 202,
      }))
      .mockResolvedValueOnce(makeResponse({
        ok: true,
        status: 201,
      }));

    await expect(storage.writeFile("big.bin", data)).resolves.toBeUndefined();
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://graph.microsoft.com/v1.0/me/drive/special/approot:/big.bin:/createUploadSession",
    );
    expect(mockFetch.mock.calls[1][0]).toBe("https://upload.example/session");
    expect(mockFetch.mock.calls[1][1]).toMatchObject({
      method: "PUT",
      headers: {
        "Content-Length": "4",
        "Content-Range": "bytes 0-3/6",
      },
    });
    expect(mockFetch.mock.calls[2][1]).toMatchObject({
      method: "PUT",
      headers: {
        "Content-Length": "2",
        "Content-Range": "bytes 4-5/6",
      },
    });
  });

  it("sends If-Match when writeFileConditional receives an etag", async () => {
    const storage = await makeStorage();

    mockFetch.mockResolvedValueOnce(makeResponse({
      ok: true,
      status: 200,
      jsonData: { eTag: '"etag-2"' },
    }));

    await expect(storage.writeFileConditional("notes.txt", "abc", '"etag-1"')).resolves.toEqual({
      ok: true,
      conflict: false,
      newEtag: '"etag-2"',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://graph.microsoft.com/v1.0/me/drive/special/approot:/notes.txt:/content",
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
          "Content-Type": "application/octet-stream",
          "If-Match": '"etag-1"',
        }),
        body: Buffer.from("abc"),
      }),
    );
  });

  it("returns a conflict result when writeFileConditional gets a 412 response", async () => {
    const storage = await makeStorage();

    mockFetch.mockResolvedValueOnce(makeResponse({
      ok: false,
      status: 412,
      statusText: "Precondition Failed",
      textData: "etag mismatch",
    }));

    await expect(storage.writeFileConditional("notes.txt", "abc", '"etag-1"')).resolves.toEqual({
      ok: false,
      conflict: true,
      newEtag: null,
    });
  });

  it("falls back to the large-file upload flow for conditional writes", async () => {
    const storage = await makeStorage();
    const data = Buffer.from("abcdef");

    mockFetch
      .mockResolvedValueOnce(makeResponse({
        ok: true,
        status: 200,
        jsonData: { uploadUrl: "https://upload.example/session" },
      }))
      .mockResolvedValueOnce(makeResponse({
        ok: true,
        status: 202,
      }))
      .mockResolvedValueOnce(makeResponse({
        ok: true,
        status: 201,
      }));

    await expect(storage.writeFileConditional("large.txt", data, '"etag-1"')).resolves.toEqual({
      ok: true,
      conflict: false,
      newEtag: null,
    });
    expect(mockFetch.mock.calls[0][0]).toBe(
      "https://graph.microsoft.com/v1.0/me/drive/special/approot:/large.txt:/createUploadSession",
    );
    expect(mockFetch.mock.calls[1][0]).toBe("https://upload.example/session");
    expect(mockFetch.mock.calls[1][1]).toMatchObject({
      method: "PUT",
      headers: expect.not.objectContaining({
        "If-Match": expect.any(String),
      }),
    });
  });
});
