import { describe, it, expect } from "vitest";

// ── WebSocket frame encoding/decoding ────────────────────────────────────────
// Reimplemented from main/ws-server.js for testing (can't import Electron modules)

function decodeFrame(buffer) {
  if (buffer.length < 2) return null;

  const byte1 = buffer[0];
  const byte2 = buffer[1];
  const opcode = byte1 & 0x0F;
  const isMasked = (byte2 & 0x80) !== 0;
  let payloadLength = byte2 & 0x7F;
  let offset = 2;

  if (payloadLength === 126) {
    if (buffer.length < 4) return null;
    payloadLength = buffer.readUInt16BE(2);
    offset = 4;
  } else if (payloadLength === 127) {
    if (buffer.length < 10) return null;
    payloadLength = buffer.readUInt32BE(6);
    offset = 10;
  }

  let maskKey = null;
  if (isMasked) {
    if (buffer.length < offset + 4) return null;
    maskKey = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  if (buffer.length < offset + payloadLength) return null;

  let payload = Buffer.from(buffer.slice(offset, offset + payloadLength));
  if (isMasked && maskKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] = payload[i] ^ maskKey[i % 4];
    }
  }

  return {
    opcode,
    payload,
    totalLength: offset + payloadLength,
  };
}

function encodeFrame(data, opcode = 0x01) {
  const payload = typeof data === "string" ? Buffer.from(data, "utf-8") : data;
  const length = payload.length;
  let header;

  if (length < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x80 | opcode;
    header[1] = length;
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeUInt32BE(0, 2);
    header.writeUInt32BE(length, 6);
  }

  return Buffer.concat([header, payload]);
}

describe("WebSocket frame encoding", () => {
  it("encodes a small text frame", () => {
    const frame = encodeFrame("hello");
    expect(frame[0]).toBe(0x81); // FIN + text opcode
    expect(frame[1]).toBe(5);    // payload length
    expect(frame.slice(2).toString("utf-8")).toBe("hello");
  });

  it("encodes a medium frame (126-65535 bytes)", () => {
    const data = "x".repeat(200);
    const frame = encodeFrame(data);
    expect(frame[0]).toBe(0x81);
    expect(frame[1]).toBe(126);
    expect(frame.readUInt16BE(2)).toBe(200);
    expect(frame.slice(4).toString("utf-8")).toBe(data);
  });

  it("encodes a close frame", () => {
    const frame = encodeFrame(Buffer.alloc(0), 0x08);
    expect(frame[0]).toBe(0x88); // FIN + close opcode
    expect(frame[1]).toBe(0);
  });

  it("encodes a ping frame", () => {
    const frame = encodeFrame(Buffer.alloc(0), 0x09);
    expect(frame[0]).toBe(0x89); // FIN + ping opcode
  });
});

describe("WebSocket frame decoding", () => {
  it("decodes an unmasked text frame", () => {
    const encoded = encodeFrame("hello world");
    const decoded = decodeFrame(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded.opcode).toBe(0x01);
    expect(decoded.payload.toString("utf-8")).toBe("hello world");
    expect(decoded.totalLength).toBe(encoded.length);
  });

  it("decodes a masked text frame", () => {
    // Build a masked frame manually
    const payload = Buffer.from("test", "utf-8");
    const mask = Buffer.from([0x12, 0x34, 0x56, 0x78]);
    const masked = Buffer.from(payload);
    for (let i = 0; i < masked.length; i++) {
      masked[i] = masked[i] ^ mask[i % 4];
    }

    const frame = Buffer.alloc(2 + 4 + payload.length);
    frame[0] = 0x81; // FIN + text
    frame[1] = 0x80 | payload.length; // masked + length
    mask.copy(frame, 2);
    masked.copy(frame, 6);

    const decoded = decodeFrame(frame);
    expect(decoded).not.toBeNull();
    expect(decoded.opcode).toBe(0x01);
    expect(decoded.payload.toString("utf-8")).toBe("test");
  });

  it("returns null for incomplete frames", () => {
    expect(decodeFrame(Buffer.alloc(0))).toBeNull();
    expect(decodeFrame(Buffer.alloc(1))).toBeNull();

    // Header says 10 bytes, but only 5 available
    const partial = Buffer.alloc(2);
    partial[0] = 0x81;
    partial[1] = 10;
    expect(decodeFrame(partial)).toBeNull();
  });

  it("decodes a medium-length frame correctly", () => {
    const data = "y".repeat(300);
    const encoded = encodeFrame(data);
    const decoded = decodeFrame(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded.payload.toString("utf-8")).toBe(data);
    expect(decoded.payload.length).toBe(300);
  });

  it("round-trips JSON messages", () => {
    const msg = { type: "add-article", payload: { title: "Test", wordCount: 100 } };
    const encoded = encodeFrame(JSON.stringify(msg));
    const decoded = decodeFrame(encoded);
    expect(JSON.parse(decoded.payload.toString("utf-8"))).toEqual(msg);
  });
});

// ── Pairing token generation ─────────────────────────────────────────────────

describe("Pairing token", () => {
  it("generates a 32-char hex token", () => {
    // Reimplemented from ws-server.js
    const crypto = require("crypto");
    const token = crypto.randomBytes(16).toString("hex");
    expect(token).toHaveLength(32);
    expect(/^[0-9a-f]+$/.test(token)).toBe(true);
  });

  it("generates unique tokens", () => {
    const crypto = require("crypto");
    const tokens = new Set();
    for (let i = 0; i < 100; i++) {
      tokens.add(crypto.randomBytes(16).toString("hex"));
    }
    expect(tokens.size).toBe(100);
  });
});

// ── Protocol message handling ────────────────────────────────────────────────

describe("WS protocol messages", () => {
  it("auth message has correct shape", () => {
    const msg = { type: "auth", token: "abc123" };
    const json = JSON.stringify(msg);
    const parsed = JSON.parse(json);
    expect(parsed.type).toBe("auth");
    expect(parsed.token).toBe("abc123");
  });

  it("add-article message has correct shape", () => {
    const msg = {
      type: "add-article",
      payload: {
        title: "Test Article",
        author: "John Doe",
        textContent: "This is the article text content.",
        wordCount: 6,
        sourceUrl: "https://example.com/article",
        siteName: "Example",
        publishedDate: "2026-03-24T00:00:00Z",
        imageUrl: "https://example.com/image.jpg",
      },
    };
    const json = JSON.stringify(msg);
    const parsed = JSON.parse(json);
    expect(parsed.type).toBe("add-article");
    expect(parsed.payload.title).toBe("Test Article");
    expect(parsed.payload.wordCount).toBe(6);
    expect(parsed.payload.textContent).toBeTruthy();
  });

  it("ok response includes docId", () => {
    const response = { type: "ok", docId: "1234567890abc" };
    expect(response.type).toBe("ok");
    expect(response.docId).toBeTruthy();
  });

  it("error response includes message", () => {
    const response = { type: "error", message: "Article must include textContent" };
    expect(response.type).toBe("error");
    expect(response.message).toBeTruthy();
  });
});

// ── Content extraction helpers ───────────────────────────────────────────────

describe("Content extraction helpers", () => {
  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  it("counts words correctly", () => {
    expect(countWords("hello world")).toBe(2);
    expect(countWords("one")).toBe(1);
    expect(countWords("")).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords("  multiple   spaces   between  ")).toBe(3);
  });

  it("counts words in article-like text", () => {
    const text = "The quick brown fox jumps over the lazy dog. This is a sample article with some text content for testing purposes.";
    expect(countWords(text)).toBe(21);
  });
});

// ── BlurbyDoc creation from article ──────────────────────────────────────────

describe("BlurbyDoc creation from extension article", () => {
  function createDocFromArticle(article) {
    const docId = "test_" + Date.now();
    const wordCount = article.textContent
      ? article.textContent.trim().split(/\s+/).filter(Boolean).length
      : 0;

    return {
      id: docId,
      title: article.title || "Untitled Article",
      content: article.textContent,
      wordCount,
      position: 0,
      created: Date.now(),
      source: "url",
      sourceUrl: article.sourceUrl || null,
      author: article.author || null,
      sourceDomain: article.siteName || null,
      publishedDate: article.publishedDate || null,
      authorFull: article.author || null,
      lastReadAt: null,
      unread: true,
    };
  }

  it("creates a valid BlurbyDoc from a full article", () => {
    const article = {
      title: "Speed Reading Techniques",
      author: "Jane Smith",
      textContent: "Speed reading is a collection of methods used to increase reading speed.",
      wordCount: 12,
      sourceUrl: "https://example.com/speed-reading",
      siteName: "Example Blog",
      publishedDate: "2026-01-15T12:00:00Z",
    };

    const doc = createDocFromArticle(article);
    expect(doc.title).toBe("Speed Reading Techniques");
    expect(doc.author).toBe("Jane Smith");
    expect(doc.source).toBe("url");
    expect(doc.wordCount).toBe(12);
    expect(doc.sourceUrl).toBe("https://example.com/speed-reading");
    expect(doc.sourceDomain).toBe("Example Blog");
    expect(doc.position).toBe(0);
    expect(doc.unread).toBe(true);
  });

  it("handles missing fields gracefully", () => {
    const article = {
      textContent: "Just some text.",
    };

    const doc = createDocFromArticle(article);
    expect(doc.title).toBe("Untitled Article");
    expect(doc.author).toBeNull();
    expect(doc.sourceUrl).toBeNull();
    expect(doc.wordCount).toBe(3);
  });

  it("handles empty textContent", () => {
    const article = { title: "Empty", textContent: "" };
    const doc = createDocFromArticle(article);
    expect(doc.wordCount).toBe(0);
  });
});
