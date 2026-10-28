// main/cloud-storage.js — Unified cloud storage interface
// CommonJS only — Electron main process
//
// All implementations expose:
//   readFile(path) → Buffer
//   writeFile(path, Buffer) → void
//   writeFileConditional(path, Buffer, etag/generation) → { ok, conflict, newEtag/newGeneration }
//   listFiles(folder?) → [{ name, modified, size, isFolder, etag? }]
//   deleteFile(path) → void
//   getFileMetadata(path) → { modified, size, hash, etag? }
//   getFileEtag(path) → string|null    (etag for OneDrive, generation for Google)
//   createFolder(path) → void
//   folderExists(path) → boolean
//   moveFile(srcPath, destPath) → void

const { getOneDriveStorage } = require("./cloud-onedrive");
const { getGoogleDriveStorage } = require("./cloud-google");

/**
 * Factory that returns the cloud storage implementation for a provider.
 * @param {string} provider - 'microsoft' | 'google'
 * @returns {CloudStorage}
 */
function getCloudStorage(provider) {
  if (provider === "microsoft") return getOneDriveStorage();
  if (provider === "google") return getGoogleDriveStorage();
  throw new Error(`Unknown cloud provider: ${provider}`);
}

module.exports = { getCloudStorage };
