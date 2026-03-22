import { describe, it, expect } from "vitest";

// image-validation.test.js — Sprint 19I
//
// Tests pure image validation logic: magic-byte detection, dimension reading,
// and minimum-size enforcement.  No external dependencies beyond vitest.
//
// The validation functions are replicated here from their source (security
// hardening in main/ipc-handlers.js / Sprint 9) because that module requires
// the full Electron runtime.  We test the pure logic in isolation, matching the
// patterns used elsewhere in this project (features.test.js, migrations.test.js).

// ── Magic-byte validation ─────────────────────────────────────────────────

/**
 * Returns the detected MIME type for a raw image buffer, or null if unrecognised.
 * Mirrors the logic from the ipc-handlers.js `validateImageBuffer` helper.
 */
function detectImageType(buffer) {
  if (!buffer || buffer.length < 4) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47 &&
    buffer[4] === 0x0d && buffer[5] === 0x0a && buffer[6] === 0x1a && buffer[7] === 0x0a
  ) return "image/png";

  // WebP: RIFF????WEBP
  if (
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
  ) return "image/webp";

  return null;
}

/**
 * Returns true when the buffer looks like an HTML error page rather than an image.
 */
function isHtmlErrorPage(buffer) {
  if (!buffer || buffer.length < 5) return false;
  const prefix = buffer.slice(0, 15).toString("ascii").toLowerCase();
  return prefix.startsWith("<!doctype") || prefix.startsWith("<html");
}

/**
 * Reads pixel dimensions from a JPEG buffer by scanning for SOF markers.
 * Returns { width, height } or null if not found.
 */
function readJpegDimensions(buffer) {
  // Scan for SOF0-SOF3, SOF5-SOF7, SOF9-SOF11, SOF13-SOF15 markers
  const SOF_MARKERS = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
    0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
  ]);
  let i = 2; // Skip initial FF D8
  while (i < buffer.length - 8) {
    if (buffer[i] !== 0xff) { i++; continue; }
    const marker = buffer[i + 1];
    if (SOF_MARKERS.has(marker)) {
      // SOF structure: FF Cx LL LL P HH HH WW WW
      const height = (buffer[i + 5] << 8) | buffer[i + 6];
      const width = (buffer[i + 7] << 8) | buffer[i + 8];
      return { width, height };
    }
    // Skip to next marker: length is stored at i+2 (big-endian, includes length bytes)
    if (i + 3 < buffer.length) {
      const segLen = (buffer[i + 2] << 8) | buffer[i + 3];
      i += 2 + segLen;
    } else {
      break;
    }
  }
  return null;
}

/**
 * Reads pixel dimensions from a PNG buffer via the IHDR chunk.
 * Returns { width, height } or null if not a valid PNG.
 */
function readPngDimensions(buffer) {
  // PNG signature is 8 bytes; IHDR starts at byte 8.
  // IHDR: 4-byte length, "IHDR", 4-byte width, 4-byte height
  if (!buffer || buffer.length < 24) return null;
  // Verify PNG signature
  if (!(buffer[0] === 0x89 && buffer[1] === 0x50)) return null;
  // Width at bytes 16-19, height at bytes 20-23
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

const MIN_DIMENSION = 200;

function isTooSmall(dims) {
  if (!dims) return true;
  return dims.width < MIN_DIMENSION || dims.height < MIN_DIMENSION;
}

// ── Magic-byte tests ───────────────────────────────────────────────────────

describe("image magic bytes — JPEG accepted", () => {
  it("detects JPEG magic bytes FF D8 FF", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(detectImageType(buf)).toBe("image/jpeg");
  });

  it("detects JPEG with APP1 marker (FF D8 FF E1)", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10]);
    expect(detectImageType(buf)).toBe("image/jpeg");
  });
});

describe("image magic bytes — PNG accepted", () => {
  it("detects PNG signature 89 50 4E 47 0D 0A 1A 0A", () => {
    const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
    expect(detectImageType(buf)).toBe("image/png");
  });
});

describe("image magic bytes — WebP accepted", () => {
  it("detects WebP (RIFF....WEBP header)", () => {
    // RIFF + 4 size bytes + WEBP
    const buf = Buffer.alloc(12);
    buf.write("RIFF", 0, "ascii");
    buf.writeUInt32LE(100, 4);
    buf.write("WEBP", 8, "ascii");
    expect(detectImageType(buf)).toBe("image/webp");
  });
});

describe("image magic bytes — HTML error page rejected", () => {
  it("rejects buffer starting with '<!DOCTYPE html'", () => {
    const buf = Buffer.from("<!DOCTYPE html><html><body>Error 403</body></html>", "ascii");
    expect(isHtmlErrorPage(buf)).toBe(true);
    expect(detectImageType(buf)).toBeNull();
  });

  it("rejects buffer starting with '<html>'", () => {
    const buf = Buffer.from("<html><body>Not Found</body></html>", "ascii");
    expect(isHtmlErrorPage(buf)).toBe(true);
  });

  it("does not flag a real image as HTML", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    expect(isHtmlErrorPage(buf)).toBe(false);
  });
});

// ── Dimension parsing — JPEG SOF marker ───────────────────────────────────

describe("JPEG dimensions from SOF marker", () => {
  /**
   * Build a minimal JPEG-like buffer containing a SOF0 segment at a known offset.
   * Real JPEG: FF D8, then (optionally) APP markers, then SOF0.
   * We inject APP0 (FF E0) with a length of 16, then SOF0.
   */
  function makeMinimalJpegWithDimensions(width, height) {
    const buf = Buffer.alloc(30);
    // SOI
    buf[0] = 0xff; buf[1] = 0xd8;
    // APP0: FF E0, length 0x00 0x10 (16 bytes including length field)
    buf[2] = 0xff; buf[3] = 0xe0;
    buf[4] = 0x00; buf[5] = 0x10;
    // 14 bytes of APP0 data (skipped by dimension reader)
    // After APP0: i = 2 + 2 + 16 = 20 → but our scanner starts at i=2
    // i=2: marker E0 → not SOF, segLen = 0x0010 = 16 → i = 2 + 2 + 16 = 20
    // SOF0 at offset 20
    buf[20] = 0xff; buf[21] = 0xc0;
    buf[22] = 0x00; buf[23] = 0x11; // length = 17
    buf[24] = 0x08;                  // precision
    buf[25] = (height >> 8) & 0xff;
    buf[26] = height & 0xff;
    buf[27] = (width >> 8) & 0xff;
    buf[28] = width & 0xff;
    return buf;
  }

  it("reads width and height from SOF0 marker", () => {
    const buf = makeMinimalJpegWithDimensions(1920, 1080);
    const dims = readJpegDimensions(buf);
    expect(dims).not.toBeNull();
    expect(dims.width).toBe(1920);
    expect(dims.height).toBe(1080);
  });

  it("returns null for a buffer with no SOF marker", () => {
    const buf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x02]);
    // Length 2 means zero additional bytes → scanner exits after one iteration
    const dims = readJpegDimensions(buf);
    expect(dims).toBeNull();
  });
});

// ── Dimension parsing — PNG IHDR chunk ────────────────────────────────────

describe("PNG dimensions from IHDR chunk", () => {
  function makeMinimalPng(width, height) {
    // 8-byte signature + 4-byte chunk length + "IHDR" + 4 width + 4 height + rest
    const buf = Buffer.alloc(26);
    // PNG signature
    buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4e; buf[3] = 0x47;
    buf[4] = 0x0d; buf[5] = 0x0a; buf[6] = 0x1a; buf[7] = 0x0a;
    // IHDR chunk: length = 13 (4 bytes big-endian)
    buf.writeUInt32BE(13, 8);
    // Chunk type "IHDR"
    buf[12] = 0x49; buf[13] = 0x48; buf[14] = 0x44; buf[15] = 0x52;
    // Width and height
    buf.writeUInt32BE(width, 16);
    buf.writeUInt32BE(height, 20);
    return buf;
  }

  it("reads width and height from IHDR chunk", () => {
    const buf = makeMinimalPng(800, 600);
    const dims = readPngDimensions(buf);
    expect(dims).not.toBeNull();
    expect(dims.width).toBe(800);
    expect(dims.height).toBe(600);
  });

  it("returns null for a buffer that is too short", () => {
    const buf = Buffer.alloc(10);
    expect(readPngDimensions(buf)).toBeNull();
  });

  it("returns null when PNG signature is missing", () => {
    const buf = Buffer.alloc(26); // all zeros — no signature
    expect(readPngDimensions(buf)).toBeNull();
  });
});

// ── Minimum size enforcement ───────────────────────────────────────────────

describe("images below 200x200 detected as too small", () => {
  it("100x100 is too small", () => {
    expect(isTooSmall({ width: 100, height: 100 })).toBe(true);
  });

  it("199x500 is too small (width below threshold)", () => {
    expect(isTooSmall({ width: 199, height: 500 })).toBe(true);
  });

  it("500x199 is too small (height below threshold)", () => {
    expect(isTooSmall({ width: 500, height: 199 })).toBe(true);
  });

  it("200x200 is exactly at threshold — not too small", () => {
    expect(isTooSmall({ width: 200, height: 200 })).toBe(false);
  });

  it("1920x1080 is not too small", () => {
    expect(isTooSmall({ width: 1920, height: 1080 })).toBe(false);
  });

  it("null dimensions count as too small", () => {
    expect(isTooSmall(null)).toBe(true);
  });
});
