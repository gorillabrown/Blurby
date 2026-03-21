// main/cloud-google.js — Google Drive cloud storage implementation
// CommonJS only — Electron main process

const { net } = require("electron");
const { getAccessToken } = require("./auth");

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
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
    let query = "trashed=false";
    // In appDataFolder, "folder" isn't really a path — all files are at root
    // We just list all files
    const response = await driveFetch(
      `/files?spaces=appDataFolder&q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime,size)&pageSize=100`
    );
    const data = await response.json();

    return (data.files || []).map((item) => ({
      name: item.name,
      modified: item.modifiedTime ? new Date(item.modifiedTime).getTime() : 0,
      size: parseInt(item.size || "0", 10),
      isFolder: false,
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

    const response = await driveFetch(`/files/${fileId}?fields=modifiedTime,size,md5Checksum`);
    const data = await response.json();

    return {
      modified: data.modifiedTime ? new Date(data.modifiedTime).getTime() : 0,
      size: parseInt(data.size || "0", 10),
      hash: data.md5Checksum || null,
    };
  });
}

function getGoogleDriveStorage() {
  return { readFile, writeFile, listFiles, deleteFile, getFileMetadata };
}

module.exports = { getGoogleDriveStorage };
