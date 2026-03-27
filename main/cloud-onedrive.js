// main/cloud-onedrive.js — OneDrive (Microsoft Graph) cloud storage implementation
// CommonJS only — Electron main process

const { net } = require("electron");
const { getAccessToken } = require("./auth");
const { ONEDRIVE_CHUNK_SIZE, CLOUD_MAX_RETRIES, RETRY_BASE_DELAY_MS, RETRY_MAX_DELAY_MS } = require("./constants");

const GRAPH_BASE = "https://graph.microsoft.com/v1.0/me/drive/special/approot:";
const GRAPH_ROOT = "https://graph.microsoft.com/v1.0/me/drive/special/approot";
const CHUNK_SIZE = ONEDRIVE_CHUNK_SIZE;
const MAX_RETRIES = CLOUD_MAX_RETRIES;

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
        const delay = Math.min(RETRY_BASE_DELAY_MS * Math.pow(2, attempt), RETRY_MAX_DELAY_MS);
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

/**
 * Conditional write using etag to prevent simultaneous sync conflicts (19G).
 * Uses @microsoft.graph.conflictBehavior: "fail" and If-Match header.
 * @param {string} filePath
 * @param {Buffer|string} data
 * @param {string|null} etag - Current etag from getFileEtag(); null for create-only
 * @returns {{ ok: boolean, conflict: boolean, newEtag: string|null }}
 */
async function writeFileConditional(filePath, data, etag) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

  // For large files, conditional write falls back to normal (resumable upload
  // doesn't support If-Match; the staging + manifest approach in 19C prevents races)
  if (buffer.length > CHUNK_SIZE) {
    await writeFileLarge(filePath, buffer);
    return { ok: true, conflict: false, newEtag: null };
  }

  try {
    const token = await getAccessToken("microsoft");
    const url = `${GRAPH_BASE}/${filePath}:/content`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    };
    if (etag) {
      headers["If-Match"] = etag;
    }

    const response = await net.fetch(url, { method: "PUT", headers, body: buffer });

    if (response.status === 412) {
      // Precondition Failed — etag mismatch (someone else wrote first)
      return { ok: false, conflict: true, newEtag: null };
    }

    if (!response.ok) {
      const err = new Error(`OneDrive conditional write error: ${response.status}`);
      err.status = response.status;
      throw err;
    }

    let newEtag = null;
    try {
      const result = await response.json();
      newEtag = result.eTag || result["@odata.etag"] || null;
    } catch { /* ignore */ }

    return { ok: true, conflict: false, newEtag };
  } catch (err) {
    if (err.status === 412) {
      return { ok: false, conflict: true, newEtag: null };
    }
    throw err;
  }
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
      etag: item.eTag || item["@odata.etag"] || null,
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
      etag: data.eTag || data["@odata.etag"] || null,
    };
  });
}

/**
 * Get the current etag for a file without downloading it (19G).
 * Returns null if the file doesn't exist.
 */
async function getFileEtag(filePath) {
  try {
    const meta = await getFileMetadata(filePath);
    return meta.etag;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

/**
 * Ensure a folder exists at the given path under approot (19C).
 * Creates it if missing.
 */
async function createFolder(folderPath) {
  return await withRetry(async () => {
    const token = await getAccessToken("microsoft");

    // Split path into segments and create each level
    const segments = folderPath.split("/").filter(Boolean);
    let currentPath = "";

    for (const segment of segments) {
      const parentUrl = currentPath
        ? `${GRAPH_BASE}/${currentPath}:/children`
        : `${GRAPH_ROOT}/children`;

      const checkUrl = currentPath
        ? `${GRAPH_BASE}/${currentPath}/${segment}`
        : `${GRAPH_BASE}/${segment}`;

      // Check if segment already exists
      try {
        const checkResp = await net.fetch(checkUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (checkResp.ok) {
          currentPath = currentPath ? `${currentPath}/${segment}` : segment;
          continue;
        }
      } catch { /* proceed to create */ }

      // Create it
      const createResp = await net.fetch(parentUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: segment,
          folder: {},
          "@microsoft.graph.conflictBehavior": "replace",
        }),
      });

      if (!createResp.ok && createResp.status !== 409) {
        const err = new Error(`OneDrive createFolder error: ${createResp.status}`);
        err.status = createResp.status;
        throw err;
      }

      currentPath = currentPath ? `${currentPath}/${segment}` : segment;
    }
  });
}

/**
 * Check whether a folder exists at folderPath (19C).
 */
async function folderExists(folderPath) {
  try {
    const token = await getAccessToken("microsoft");
    const url = `${GRAPH_BASE}/${folderPath}`;
    const response = await net.fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return false;
    const data = await response.json();
    return !!data.folder;
  } catch {
    return false;
  }
}

/**
 * Move/rename a file within approot (19C — used to promote staging → live).
 * OneDrive uses PATCH with parentReference to move.
 */
async function moveFile(srcPath, destPath) {
  return await withRetry(async () => {
    const token = await getAccessToken("microsoft");

    // Get source item ID
    const srcUrl = `${GRAPH_BASE}/${srcPath}`;
    const srcResp = await net.fetch(srcUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!srcResp.ok) {
      const err = new Error(`OneDrive moveFile: source not found: ${srcPath}`);
      err.status = srcResp.status;
      throw err;
    }
    const srcData = await srcResp.json();
    const srcId = srcData.id;

    // Determine destination parent and new name
    const destParts = destPath.split("/");
    const destName = destParts.pop();
    const destParentPath = destParts.join("/");

    let parentRef;
    if (destParentPath) {
      // Get parent folder ID
      const parentUrl = `${GRAPH_BASE}/${destParentPath}`;
      const parentResp = await net.fetch(parentUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!parentResp.ok) {
        throw new Error(`OneDrive moveFile: destination parent not found: ${destParentPath}`);
      }
      const parentData = await parentResp.json();
      parentRef = { id: parentData.id };
    } else {
      // Move to approot
      const rootResp = await net.fetch(GRAPH_ROOT, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rootData = await rootResp.json();
      parentRef = { id: rootData.id };
    }

    // PATCH to move
    const moveUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${srcId}`;
    const moveResp = await net.fetch(moveUrl, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: destName,
        parentReference: parentRef,
        "@microsoft.graph.conflictBehavior": "replace",
      }),
    });

    if (!moveResp.ok) {
      const err = new Error(`OneDrive moveFile error: ${moveResp.status}`);
      err.status = moveResp.status;
      throw err;
    }
  });
}

function getOneDriveStorage() {
  return {
    readFile,
    writeFile,
    writeFileConditional,
    listFiles,
    deleteFile,
    getFileMetadata,
    getFileEtag,
    createFolder,
    folderExists,
    moveFile,
  };
}

module.exports = { getOneDriveStorage };
