// main/cloud-google.js — Google Drive cloud storage implementation
// CommonJS only — Electron main process

const { net } = require("electron");
const { getAccessToken } = require("./auth");
const { GOOGLE_CHUNK_SIZE, CLOUD_MAX_RETRIES, RETRY_BASE_DELAY_MS, RETRY_MAX_DELAY_MS } = require("./constants");

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const CHUNK_SIZE = GOOGLE_CHUNK_SIZE;
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
        try {
          await getAccessToken("google");
        } catch { /* ignore */ }
        if (attempt === 0) continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// ── HTTP helpers ─────────────────────────────────────────────────────────

async function driveFetch(urlPath, options = {}) {
  const token = await getAccessToken("google");
  const url = urlPath.startsWith("http") ? urlPath : `${DRIVE_API}${urlPath}`;

  const response = await net.fetch(url, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body || undefined,
  });

  if (!response.ok) {
    const err = new Error(`Google Drive API error: ${response.status} ${response.statusText}`);
    err.status = response.status;
    try {
      err.body = await response.text();
    } catch { /* ignore */ }
    throw err;
  }

  return response;
}

// ── File ID resolution (Google Drive uses IDs, not paths) ────────────────

// Cache file name -> ID mappings for the appDataFolder space
const fileIdCache = new Map();

async function getFileId(fileName) {
  if (fileIdCache.has(fileName)) return fileIdCache.get(fileName);

  const response = await driveFetch(
    `/files?spaces=appDataFolder&q=name='${encodeURIComponent(fileName)}'&fields=files(id,name)&pageSize=1`
  );
  const data = await response.json();

  if (data.files && data.files.length > 0) {
    const id = data.files[0].id;
    fileIdCache.set(fileName, id);
    return id;
  }
  return null;
}

/**
 * Get the generation number for a file (used for conditional writes, 19G).
 * Returns null if the file doesn't exist.
 */
async function getFileGeneration(fileName) {
  try {
    const fileId = await getFileId(fileName);
    if (!fileId) return null;

    const response = await driveFetch(
      `/files/${fileId}?fields=generation`
    );
    const data = await response.json();
    return data.generation ? String(data.generation) : null;
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}

// ── Google Drive Storage Implementation ──────────────────────────────────

async function readFile(filePath) {
  return await withRetry(async () => {
    const fileId = await getFileId(filePath);
    if (!fileId) {
      const err = new Error(`File not found: ${filePath}`);
      err.status = 404;
      throw err;
    }

    const response = await driveFetch(`/files/${fileId}?alt=media`);
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
    const existingId = await getFileId(filePath);
    const token = await getAccessToken("google");

    if (existingId) {
      // Update existing file
      const boundary = "blurby_boundary_" + Date.now();
      const metadata = JSON.stringify({ name: filePath });

      const bodyParts = [
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
        `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`,
      ];
      const bodyPrefix = Buffer.from(bodyParts[0]);
      const bodyMid = Buffer.from(bodyParts[1]);
      const bodySuffix = Buffer.from(`\r\n--${boundary}--`);
      const body = Buffer.concat([bodyPrefix, bodyMid, buffer, bodySuffix]);

      const response = await net.fetch(
        `${UPLOAD_API}/files/${existingId}?uploadType=multipart`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const err = new Error(`Google Drive upload error: ${response.status}`);
        err.status = response.status;
        throw err;
      }
    } else {
      // Create new file
      const boundary = "blurby_boundary_" + Date.now();
      const metadata = JSON.stringify({
        name: filePath,
        parents: ["appDataFolder"],
      });

      const bodyParts = [
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
        `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`,
      ];
      const bodyPrefix = Buffer.from(bodyParts[0]);
      const bodyMid = Buffer.from(bodyParts[1]);
      const bodySuffix = Buffer.from(`\r\n--${boundary}--`);
      const body = Buffer.concat([bodyPrefix, bodyMid, buffer, bodySuffix]);

      const response = await net.fetch(
        `${UPLOAD_API}/files?uploadType=multipart`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body,
        }
      );

      if (!response.ok) {
        const err = new Error(`Google Drive create error: ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const result = await response.json();
      fileIdCache.set(filePath, result.id);
    }
  });
}

/**
 * Conditional write using generation number to prevent simultaneous sync conflicts (19G).
 * Uses ifGenerationMatch parameter on the upload URL.
 * @param {string} filePath
 * @param {Buffer|string} data
 * @param {string|null} generation - Current generation from getFileGeneration(); null = create only
 * @returns {{ ok: boolean, conflict: boolean, newGeneration: string|null }}
 */
async function writeFileConditional(filePath, data, generation) {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);

  if (buffer.length > CHUNK_SIZE) {
    // Large files: conditional write not supported via resumable upload
    // Fall back to normal write (staging protects against races for large files)
    await writeFileLarge(filePath, buffer);
    return { ok: true, conflict: false, newGeneration: null };
  }

  try {
    const existingId = await getFileId(filePath);
    const token = await getAccessToken("google");

    const boundary = "blurby_boundary_" + Date.now();
    const metadata = JSON.stringify({ name: filePath });
    const bodyParts = [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`,
      `--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`,
    ];
    const bodyPrefix = Buffer.from(bodyParts[0]);
    const bodyMid = Buffer.from(bodyParts[1]);
    const bodySuffix = Buffer.from(`\r\n--${boundary}--`);
    const body = Buffer.concat([bodyPrefix, bodyMid, buffer, bodySuffix]);

    let url;
    let method;
    if (existingId) {
      // Update with generation check
      const genParam = generation ? `&ifGenerationMatch=${encodeURIComponent(generation)}` : "";
      url = `${UPLOAD_API}/files/${existingId}?uploadType=multipart${genParam}`;
      method = "PATCH";
    } else {
      // Create new (ifGenerationMatch=0 means "only create if not exists")
      const genParam = generation ? `&ifGenerationMatch=${encodeURIComponent(generation)}` : "&ifGenerationMatch=0";
      url = `${UPLOAD_API}/files?uploadType=multipart${genParam}`;
      method = "POST";
    }

    const response = await net.fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    });

    // 412 Precondition Failed = generation mismatch
    if (response.status === 412) {
      return { ok: false, conflict: true, newGeneration: null };
    }

    if (!response.ok) {
      const err = new Error(`Google Drive conditional write error: ${response.status}`);
      err.status = response.status;
      throw err;
    }

    let newGeneration = null;
    try {
      const result = await response.json();
      if (result.id && !existingId) fileIdCache.set(filePath, result.id);
      newGeneration = result.generation ? String(result.generation) : null;
    } catch { /* ignore */ }

    return { ok: true, conflict: false, newGeneration };
  } catch (err) {
    if (err.status === 412) {
      return { ok: false, conflict: true, newGeneration: null };
    }
    throw err;
  }
}

async function writeFileLarge(filePath, buffer) {
  const token = await getAccessToken("google");
  const existingId = await getFileId(filePath);

  // Create resumable upload session
  const url = existingId
    ? `${UPLOAD_API}/files/${existingId}?uploadType=resumable`
    : `${UPLOAD_API}/files?uploadType=resumable`;

  const metadata = existingId
    ? { name: filePath }
    : { name: filePath, parents: ["appDataFolder"] };

  const sessionResponse = await net.fetch(url, {
    method: existingId ? "PATCH" : "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": String(buffer.length),
      "X-Upload-Content-Type": "application/octet-stream",
    },
    body: JSON.stringify(metadata),
  });

  if (!sessionResponse.ok) {
    throw new Error(`Failed to create upload session: ${sessionResponse.status}`);
  }

  const uploadUrl = sessionResponse.headers.get("Location");
  if (!uploadUrl) throw new Error("No upload URL in session response");

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

      // 200/201 = done, 308 = resume incomplete (more chunks needed)
      if (!chunkResponse.ok && chunkResponse.status !== 308) {
        const err = new Error(`Chunk upload failed: ${chunkResponse.status}`);
        err.status = chunkResponse.status;
        throw err;
      }

      // If final chunk, cache the file ID
      if (chunkResponse.ok && !existingId) {
        try {
          const result = await chunkResponse.json();
          if (result.id) fileIdCache.set(filePath, result.id);
        } catch { /* ignore */ }
      }
    });
  }
}

async function listFiles(folder) {
  return await withRetry(async () => {
    // Google Drive appDataFolder doesn't support true folder hierarchy in the same
    // way — files are identified by name. We emulate folders via name prefixes.
    let query = "trashed=false";
    if (folder) {
      // Filter by name prefix to simulate folder listing
      query += ` and name contains '${folder}/'`;
    }

    const response = await driveFetch(
      `/files?spaces=appDataFolder&q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,size,generation)&pageSize=100`
    );
    const data = await response.json();

    return (data.files || []).map((item) => ({
      name: item.name,
      modified: item.modifiedTime ? new Date(item.modifiedTime).getTime() : 0,
      size: parseInt(item.size || "0", 10),
      isFolder: false,
      generation: item.generation ? String(item.generation) : null,
    }));
  });
}

async function deleteFile(filePath) {
  return await withRetry(async () => {
    const fileId = await getFileId(filePath);
    if (!fileId) return; // Already gone

    const token = await getAccessToken("google");
    const response = await net.fetch(`${DRIVE_API}/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok && response.status !== 404) {
      const err = new Error(`Google Drive delete error: ${response.status}`);
      err.status = response.status;
      throw err;
    }

    fileIdCache.delete(filePath);
  });
}

async function getFileMetadata(filePath) {
  return await withRetry(async () => {
    const fileId = await getFileId(filePath);
    if (!fileId) {
      const err = new Error(`File not found: ${filePath}`);
      err.status = 404;
      throw err;
    }

    const response = await driveFetch(`/files/${fileId}?fields=modifiedTime,size,md5Checksum,generation`);
    const data = await response.json();

    return {
      modified: data.modifiedTime ? new Date(data.modifiedTime).getTime() : 0,
      size: parseInt(data.size || "0", 10),
      hash: data.md5Checksum || null,
      generation: data.generation ? String(data.generation) : null,
    };
  });
}

/**
 * Create a "folder" in Google Drive appDataFolder (19C).
 * Since appDataFolder is flat, we track folders via a naming convention
 * and create a sentinel file to mark the folder as existing.
 */
async function createFolder(folderPath) {
  // In Google Drive appDataFolder, we can't create real folders.
  // We simulate folders by using path-prefix names. No-op here,
  // but we return success so callers don't error.
  // Files created with names like "staging/library.json" are sufficient.
  return true;
}

/**
 * Check whether a "folder" exists in Google Drive appDataFolder (19C).
 * We check for any file with the folder path as a prefix.
 */
async function folderExists(folderPath) {
  try {
    const files = await listFiles(folderPath);
    return files.length > 0;
  } catch {
    return false;
  }
}

/**
 * Move/rename a file in Google Drive appDataFolder (19C).
 * Since we use flat name-based storage, this is a copy + delete.
 */
async function moveFile(srcPath, destPath) {
  return await withRetry(async () => {
    const buffer = await readFile(srcPath);
    await writeFile(destPath, buffer);
    await deleteFile(srcPath);
  });
}

function getGoogleDriveStorage() {
  return {
    readFile,
    writeFile,
    writeFileConditional,
    listFiles,
    deleteFile,
    getFileMetadata,
    getFileGeneration,
    // For uniform interface with OneDrive, alias getFileEtag → getFileGeneration
    getFileEtag: getFileGeneration,
    createFolder,
    folderExists,
    moveFile,
  };
}

module.exports = { getGoogleDriveStorage };
