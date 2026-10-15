// main/zip-read.js — bounded reads of entries from untrusted ZIP archives (EPUB).
// CommonJS only — Electron main process
"use strict";
const zlib = require("zlib");
const constants = require("./constants"); // read at call time so tests can lower the caps

// Reads around adm-zip's getData(): adm-zip <=0.6.0 sizes its output from the entry's declared
// size (GHSA-xcpc-8h2w-3j85, GHSA-7q85-xj36-vmfc, GHSA-rcw4-f5rp-g42v). The caps here are ours.
// One reader per operation (one parser call); the operation cap spans every entry it reads.
function createEntryReader() {
  const maxEntry = constants.ZIP_ENTRY_MAX_BYTES;
  let left = constants.ZIP_OPERATION_MAX_BYTES;
  return function readEntry(entry) {
    if (entry.isDirectory) return Buffer.alloc(0);
    const name = entry.entryName;
    const tooLarge = () => Object.assign(new Error(`ZIP entry too large: ${name}`), { code: "ZIP_ENTRY_TOO_LARGE" });
    if (entry.header.encrypted) throw new Error(`ZIP entry is encrypted: ${name}`);
    const cap = Math.min(maxEntry, left);
    if (entry.header.size > cap) throw tooLarge(); // declared size, checked before anything is read or inflated
    const raw = entry.getCompressedData();
    let data;
    if (entry.header.method === 0) {
      if (raw.length > cap) throw tooLarge();
      data = raw;
    } else if (entry.header.method === 8) {
      // actual size: zlib stops at the cap even when the header lies (a declared 0 is no bypass)
      try { data = zlib.inflateRawSync(raw, { maxOutputLength: Math.max(cap, 1) }); }
      catch (err) { if (err.code === "ERR_BUFFER_TOO_LARGE") throw tooLarge(); throw err; }
    } else {
      throw new Error(`Unsupported ZIP method ${entry.header.method}: ${name}`);
    }
    if ((zlib.crc32(data) >>> 0) !== (entry.header.crc >>> 0)) throw new Error(`ZIP entry CRC mismatch: ${name}`);
    left -= data.length;
    return data;
  };
}

module.exports = { createEntryReader };
