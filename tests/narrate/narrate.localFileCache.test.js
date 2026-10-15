// NARRATE-REBUILD-1 P5 (Decision #19) — the producer worker's transformers.js custom cache: a local file is served by
// one read (transformers 3.8.1's own path streamed the whole model into an unread ReadableStream, 291 MB of garbage
// per worker whose freeing froze the workers); a URL, a missing path or a directory is a miss, so local-only loading
// and its errors are unchanged.
import { createRequire } from "module";
import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { localFileCache } = require("../../main/narrate/local-file-cache.js");

describe("narrate local-file cache (Decision #19)", () => {
  it("serves an existing file's exact bytes through arrayBuffer()", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "narrate-cache-"));
    const file = path.join(dir, "model.onnx");
    const bytes = Buffer.from(Array.from({ length: 70000 }, (_, i) => i % 251));
    fs.writeFileSync(file, bytes);
    try {
      const hit = await localFileCache().match(file);
      expect(hit).toBeTruthy();
      expect(hit.status).toBe(200);
      const ab = await hit.arrayBuffer();
      expect(ab).toBeInstanceOf(ArrayBuffer);
      expect(Buffer.from(ab).equals(bytes)).toBe(true);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  });

  it("misses a URL, a missing path, a directory and a non-string key", async () => {
    const cache = localFileCache();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "narrate-cache-"));
    try {
      expect(await cache.match("https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/config.json")).toBeUndefined();
      expect(await cache.match(path.join(dir, "absent.onnx"))).toBeUndefined();
      expect(await cache.match(dir)).toBeUndefined();
      expect(await cache.match(undefined)).toBeUndefined();
      await expect(cache.put("x", {})).resolves.toBeUndefined();
    } finally {
      fs.rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
    }
  });

  it("is what the producer worker hands transformers.js", () => {
    const src = fs.readFileSync(path.join(__dirname, "../../main/narrate/producer-worker.js"), "utf8");
    expect(src).toMatch(/useCustomCache:\s*true,\s*customCache:\s*localFileCache\(\)/);
  });
});
