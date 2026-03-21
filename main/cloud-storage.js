// main/cloud-storage.js — Unified cloud storage interface
// CommonJS only — Electron main process

const { getOneDriveStorage } = require("./cloud-onedrive");
const { getGoogleDriveStorage } = require("./cloud-google");

/**
 * Factory that returns the cloud storage implementation for a provider.
 * @param {string} provider - 'microsoft' | 'google'
 * @returns {{ readFile, writeFile, listFiles, deleteFile, getFileMetadata }}
 */
function getCloudStorage(provider) {
  if (provider === "microsoft") return getOneDriveStorage();
  if (provider === "google") return getGoogleDriveStorage();
  throw new Error(`Unknown cloud provider: ${provider}`);
}

module.exports = { getCloudStorage };
