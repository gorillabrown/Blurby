"use strict";
// main/narrate/local-file-cache.js — a transformers.js custom cache that serves local files with one fs read
// (NARRATE-REBUILD-1 P5, Decision #19). transformers 3.8.1's own local-file path (FileResponse) streams the whole
// file into a ReadableStream that nothing reads, then reads it again: for the 291 MB model that left 4,658 chunks of
// garbage per producer worker, and freeing them in Electron froze the workers for 4-16 s (D7: never a silent hang).
// A cache hit makes getModelFile call arrayBuffer() and never build a FileResponse. URLs and missing files are a miss,
// so local-only loading and its errors are unchanged.

const fsp = require("fs/promises");

function localFileCache() {
  return {
    async match(key) {
      if (typeof key !== "string" || /^[a-z][a-z0-9+.-]*:\/\//i.test(key)) return undefined;
      try { if (!(await fsp.stat(key)).isFile()) return undefined; } catch { return undefined; }
      return {
        status: 200,
        headers: new Headers(),
        async arrayBuffer() {
          const b = await fsp.readFile(key);
          return b.byteOffset === 0 && b.byteLength === b.buffer.byteLength ? b.buffer : b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
        },
      };
    },
    async put() {},
  };
}

module.exports = { localFileCache };
