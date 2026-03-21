// main/cloud-onedrive.js — OneDrive (Microsoft Graph) cloud storage implementation
// CommonJS only — Electron main process

const { net } = require("electron");
const { getAccessToken } = require("./auth");

const GRAPH_BASE = "https://graph.microsoft.com/v1.0/me/drive/special/approot:";
const GRAPH_ROOT = "https://graph.microsoft.com/v1.0/me/drive/special/approot";
const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB
const MAX_RETRIES = 5;

// ── Retry with exponential backoff ───────────────────────────────────────

async function withRetry(fn, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err.status || err.statusCode;
      if (status === 429 || status === 503 || status === 504) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 60000);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      if (status === 401) {
        // Force token refresh on next getAccessToken call
        try {
          await getAccessToken("microsoft");
        } catch {
          // If refresh fails, throw original error
        }
        if (attempt === 0) continue; // Retry once after refresh
      }
      throw err;
    }
  }
  throw lastError;
}

// ── HTTP helpers using Electron net ──────────────────────────────────────

async function graphFetch(urlPath, options = {}) {
  const token = await getAccessToken("microsoft");
  const url = urlPath.startsWith("http") ? urlPath : `${GRAPH_BASE}${urlPath}`;

  const response = await net.fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body || undefined,
  });

  if (!response.ok) {
    const err = new Error(`OneDrive API error: ${response.status} ${response.statusText}`);
    err.status = response.status;
    try {
      err.body = await response.text();
    } catch { /* ignore */ }
    throw err;
  }

  return response;
}

// ── OneDrive Storage Implementation ──────────────────────────────────────

async function readFile(filePath) {
  return await withRetry(async () => {
    const response = await graphFetch(`/${filePath}:/content`);
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  });
}

async function writeFile(filePath, data) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

  if (buffer.length > CHUNK_SIZE) {
    return await writeFileLarge(filePath, buffer);
  }

  return await withRetry(async () => {
    await graphFetch(`/${filePath}:/content`, {
      method: "PUT",
      headers: { "Content-Type": "application/octet-stream" },
      body: buffer,
    });
  });
}

async function writeFileLarge(filePath, buffer) {
  // Create upload session
  const token = await getAccessToken("microsoft");
  const sessionUrl = `${GRAPH_BASE}/${filePath}:/createUploadSession`;

  const sessionResponse = await net.fetch(sessionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item: { "@microsoft.graph.conflictBehavior": "replace" },
    }),
  });

  if (!sessionResponse.ok) {
    throw new Error(`Failed to create upload session: ${sessionResponse.status}`);
  }

  const sessionData = await sessionResponse.json();
  const uploadUrl = sessionData.uploadUrl;

  // Upload chunks
  const totalSize = buffer.length;
  for (let offset = 0; offset < totalSize; offset += CHUNK_SIZE) {
    const end = Math.min(offset + CHUNK_SIZE, totalSize);
    const chunk = buffer.slice(offset, end);

    await withRetry(async () => {
      const chunkResponse = await net.fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Length": String(chunk.length),
          "Content-Range": `bytes ${offset}-${end - 1}/${totalSize}`,
        },
        body: chunk,
      });

      // 200/201 = final chunk done, 202 = more chunks expected
      if (!chunkResponse.ok && chunkResponse.status !== 202) {
        const err = new Error(`Chunk upload failed: ${chunkResponse.status}`);
        err.status = chunkResponse.status;
        throw err;
      }
    });
  }
}

async function listFiles(folder) {
  return await withRetry(async () => {
    let url;
    if (folder) {
      url = `${GRAPH_BASE}/${folder}:/children`;
    } else {
      url = `${GRAPH_ROOT}/children`;
    }

    const response = await graphFetch(url);
    const data = await response.json();

    return (data.value || []).map((item) => ({
      name: item.name,
      modified: item.lastModifiedDateTime ? new Date(item.lastModifiedDateTime).getTime() : 0,
      size: item.size || 0,
      isFolder: !!item.folder,
    }));
  });
}

async function deleteFile(filePath) {
  return await withRetry(async () => {
    const token = await getAccessToken("microsoft");
    const url = `${GRAPH_BASE}/${filePath}`;

    const response = await net.fetch(url, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    // 204 = success, 404 = already gone (both OK)
    if (!response.ok && response.status !== 404) {
      const err = new Error(`OneDrive delete error: ${response.status}`);
      err.status = response.status;
      throw err;
    }
  });
}

async function getFileMetadata(filePath) {
  return await withRetry(async () => {
    const response = await graphFetch(`/${filePath}`);
    const data = await response.json();

    return {
      modified: data.lastModifiedDateTime ? new Date(data.lastModifiedDateTime).getTime() : 0,
      size: data.size || 0,
      hash: data.file?.hashes?.sha256Hash || data.file?.hashes?.sha1Hash || null,
    };
  });
}

function getOneDriveStorage() {
  return { readFile, writeFile, listFiles, deleteFile, getFileMetadata };
}

module.exports = { getOneDriveStorage };
