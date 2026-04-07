// main/ws-server.js — Local WebSocket server for Chrome extension communication
// CommonJS only — Electron main process

const http = require("http");
const crypto = require("crypto");
const { safeStorage } = require("electron");
const { WS_PORT, HEARTBEAT_INTERVAL_MS, WS_RETRY_DELAY_MS, SHORT_CODE_TTL_MS, WS_MAX_RETRY_COUNT, WS_AUTH_TIMEOUT_MS, WS_CONNECTION_ATTEMPT_CHANNEL, WS_PAIRING_SUCCESS_CHANNEL } = require("./constants");
const { normalizeAuthor } = require("./author-normalize");

// ── Constants ────────────────────────────────────────────────────────────────
const WS_PATH = "/blurby";
const WS_GUID = "258EAFA5-E914-47DA-95CA-5AB9DC508C65"; // RFC 6455 — protocol constant, not tunable

let _server = null;
let _heartbeatTimer = null;
let _clients = new Set();
let _pairingToken = null;
let _ctx = null;
let _shortCode = null;
let _shortCodeExpiry = 0;
let _retryCount = 0;

// ── WebSocket frame helpers (minimal implementation) ─────────────────────────

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
    // For simplicity, read as 32-bit (messages won't exceed 4GB)
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

  let payload = buffer.slice(offset, offset + payloadLength);
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
    header[0] = 0x80 | opcode; // FIN + opcode
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
    header.writeUInt32BE(0, 2); // high 32 bits
    header.writeUInt32BE(length, 6);
  }

  return Buffer.concat([header, payload]);
}

function sendJson(socket, obj) {
  try {
    const frame = encodeFrame(JSON.stringify(obj));
    socket.write(frame);
  } catch (err) {
    console.error("[ws-server] Send error:", err.message);
  }
}

// ── Client connection handling ───────────────────────────────────────────────

function handleConnection(socket, request) {
  // Verify localhost only
  const remoteAddr = socket.remoteAddress;
  if (remoteAddr !== "127.0.0.1" && remoteAddr !== "::1" && remoteAddr !== "::ffff:127.0.0.1") {
    console.log("[ws-server] Rejected non-localhost connection from:", remoteAddr);
    socket.destroy();
    return;
  }

  // Verify WebSocket upgrade path
  if (request.url !== WS_PATH) {
    socket.destroy();
    return;
  }

  // Perform WebSocket handshake
  const key = request.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = crypto.createHash("sha1")
    .update(key + WS_GUID)
    .digest("base64");

  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
    "Upgrade: websocket\r\n" +
    "Connection: Upgrade\r\n" +
    `Sec-WebSocket-Accept: ${acceptKey}\r\n` +
    "\r\n"
  );

  const client = {
    socket,
    authenticated: false,
    buffer: Buffer.alloc(0),
    alive: true,
  };
  _clients.add(client);

  // Push event: notify renderer of connection attempt (for auto-discovery pairing banner)
  const mw = _ctx?.getMainWindow?.();
  if (mw && !mw.isDestroyed()) {
    mw.webContents.send(WS_CONNECTION_ATTEMPT_CHANNEL, { timestamp: Date.now() });
  }

  // Auth timeout — disconnect if client doesn't authenticate within WS_AUTH_TIMEOUT_MS
  client.authTimer = setTimeout(() => {
    if (!client.authenticated) {
      console.log("[ws-server] Auth timeout — disconnecting unauthenticated client");
      client.socket.destroy();
      _clients.delete(client);
    }
  }, WS_AUTH_TIMEOUT_MS);

  socket.on("data", (data) => {
    client.buffer = Buffer.concat([client.buffer, data]);
    processFrames(client);
  });

  socket.on("close", () => {
    if (client.authTimer) { clearTimeout(client.authTimer); client.authTimer = null; }
    _clients.delete(client);
  });

  socket.on("error", (err) => {
    console.error("[ws-server] Socket error:", err.message);
    if (client.authTimer) { clearTimeout(client.authTimer); client.authTimer = null; }
    _clients.delete(client);
  });
}

function processFrames(client) {
  while (true) {
    const frame = decodeFrame(client.buffer);
    if (!frame) break;

    client.buffer = client.buffer.slice(frame.totalLength);

    switch (frame.opcode) {
      case 0x01: // Text frame
        handleMessage(client, frame.payload.toString("utf-8"));
        break;
      case 0x08: // Close
        client.socket.end(encodeFrame(Buffer.alloc(0), 0x08));
        _clients.delete(client);
        return;
      case 0x09: // Ping
        client.socket.write(encodeFrame(frame.payload, 0x0A)); // Pong
        break;
      case 0x0A: // Pong
        client.alive = true;
        break;
    }
  }
}

// ── Short pairing code ──────────────────────────────────────────────────────

function generateShortCode() {
  _shortCode = String(Math.floor(100000 + Math.random() * 900000));
  _shortCodeExpiry = Date.now() + SHORT_CODE_TTL_MS;
  return _shortCode;
}

function getShortCode() {
  if (!_shortCode || Date.now() >= _shortCodeExpiry) {
    generateShortCode();
  }
  return { code: _shortCode, expiresAt: _shortCodeExpiry };
}

async function handleMessage(client, text) {
  let msg;
  try {
    msg = JSON.parse(text);
  } catch {
    sendJson(client.socket, { type: "error", message: "Invalid JSON" });
    return;
  }

  // Short-code pairing flow (pre-auth)
  if (msg.type === "pair") {
    const current = getShortCode();
    if (msg.code && String(msg.code) === current.code) {
      // Valid code — generate long-lived token
      _pairingToken = generatePairingToken();
      if (_ctx && safeStorage.isEncryptionAvailable()) {
        try {
          const encrypted = safeStorage.encryptString(_pairingToken).toString("base64");
          const settings = _ctx.getSettings();
          settings._wsPairingToken = encrypted;
          _ctx.saveSettings();
        } catch { /* best-effort persist */ }
      }
      client.authenticated = true;
      if (client.authTimer) { clearTimeout(client.authTimer); client.authTimer = null; }
      sendJson(client.socket, { type: "pair-ok", token: _pairingToken });
      // Push event: notify renderer of successful pairing
      const mw = _ctx?.getMainWindow?.();
      if (mw && !mw.isDestroyed()) {
        mw.webContents.send(WS_PAIRING_SUCCESS_CHANNEL, { timestamp: Date.now() });
      }
    } else {
      sendJson(client.socket, { type: "pair-failed", message: "Invalid code" });
    }
    return;
  }

  // Authentication flow
  if (msg.type === "auth") {
    if (!_pairingToken) {
      sendJson(client.socket, { type: "error", message: "No pairing token configured" });
      return;
    }
    if (msg.token === _pairingToken) {
      client.authenticated = true;
      if (client.authTimer) { clearTimeout(client.authTimer); client.authTimer = null; }
      sendJson(client.socket, { type: "auth-ok" });
      // Push event: notify renderer of successful auth
      const mw2 = _ctx?.getMainWindow?.();
      if (mw2 && !mw2.isDestroyed()) {
        mw2.webContents.send(WS_PAIRING_SUCCESS_CHANNEL, { timestamp: Date.now() });
      }
    } else {
      sendJson(client.socket, { type: "auth-failed", message: "Invalid pairing token" });
    }
    return;
  }

  // All other messages require authentication
  if (!client.authenticated) {
    sendJson(client.socket, { type: "error", message: "Not authenticated. Send {type: 'auth', token: '...'} first." });
    return;
  }

  if (msg.type === "ping") {
    sendJson(client.socket, { type: "pong" });
    return;
  }

  if (msg.type === "add-article") {
    await handleAddArticle(client, msg.payload, msg.messageId);
    return;
  }

  sendJson(client.socket, { type: "error", message: `Unknown message type: ${msg.type}` });
}

async function handleAddArticle(client, article, messageId) {
  if (!article || !article.textContent) {
    sendJson(client.socket, { type: "error", message: "Article must include textContent" });
    return;
  }

  try {
    const fsPromises = require("fs/promises");
    const path = require("path");
    const os = require("os");
    const { downloadArticleImages } = require("./ipc/misc");
    const { collectArticleAssets } = require("./url-extractor");
    const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
    const wordCount = article.textContent.trim().split(/\s+/).filter(Boolean).length;

    // Auto-queue: assign next available queuePosition
    const library = _ctx.getLibrary();
    const maxQueuePos = library.reduce((max, d) => {
      if (d.queuePosition !== undefined && d.queuePosition !== null && d.queuePosition > max) return d.queuePosition;
      return max;
    }, -1);

    // Use HTML content if available, otherwise wrap plain text in paragraphs
    let articleHtml = article.htmlContent || article.textContent.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join("\n");

    // ── Download article images (shared path with URL import) ────────────
    let coverPath = null;
    let coverImageBuffer = null;
    let preDownloadedImages = [];

    try {
      const baseUrl = article.sourceUrl || "";
      const articleAssets = collectArticleAssets(articleHtml, baseUrl);
      const heroImageUrl = article.heroImageUrl || (articleAssets.images.length > 0 ? articleAssets.images[0].resolvedUrl : null);

      const downloaded = await downloadArticleImages({
        contentHtml: articleHtml,
        articleImages: articleAssets.images,
        heroImageUrl,
      });
      preDownloadedImages = downloaded.images;
      articleHtml = downloaded.contentHtml;

      // Save hero image as cover
      if (downloaded.heroBuffer && downloaded.heroExt) {
        coverImageBuffer = downloaded.heroBuffer;
        const coversDir = path.join(_ctx.getDataPath(), "covers");
        await fsPromises.mkdir(coversDir, { recursive: true });
        coverPath = path.join(coversDir, `${docId}${downloaded.heroExt}`);
        await fsPromises.writeFile(coverPath, downloaded.heroBuffer);
      }
    } catch (err) {
      console.log("[ws-server] Article image download failed (non-fatal):", err.message);
    }

    const doc = {
      id: docId,
      title: article.title || "Untitled Article",
      wordCount: wordCount,
      position: 0,
      created: Date.now(),
      source: "url",
      sourceUrl: article.sourceUrl || null,
      author: normalizeAuthor(article.author) || null,
      sourceDomain: article.siteName || null,
      publishedDate: article.publishedDate || null,
      authorFull: article.author || null,
      lastReadAt: null,
      unread: true,
      seenAt: undefined,
      queuePosition: maxQueuePos + 1,
      coverPath,
    };

    _ctx.addDocToLibrary(doc);
    _ctx.saveLibrary();

    // Convert article to EPUB
    try {
      const { htmlToEpub } = require("./epub-converter");
      const { EPUB_CONVERTED_DIR } = require("./constants");

      const tempHtmlPath = path.join(os.tmpdir(), `blurby-ext-${docId}.html`);
      await fsPromises.writeFile(
        tempHtmlPath,
        `<html><head><title>${(doc.title || "").replace(/</g, "&lt;")}</title></head><body>${articleHtml}</body></html>`,
        "utf-8"
      );

      const convertedDir = path.join(_ctx.getDataPath(), EPUB_CONVERTED_DIR);
      await fsPromises.mkdir(convertedDir, { recursive: true });
      const epubOutputPath = path.join(convertedDir, `${docId}.epub`);
      const convResult = await htmlToEpub(tempHtmlPath, epubOutputPath, {
        title: doc.title,
        author: article.author || "Unknown",
        date: article.publishedDate || undefined,
        source: article.sourceUrl || undefined,
        coverImage: coverImageBuffer || undefined,
        preDownloadedImages,
      });
      await fsPromises.unlink(tempHtmlPath).catch(() => {});

      doc.convertedEpubPath = convResult.epubPath;
      doc.filepath = convResult.epubPath;
      doc.ext = ".epub";
      doc.originalSourceUrl = article.sourceUrl || null;

      // Update doc in library
      const docs = _ctx.getLibrary();
      _ctx.setLibrary(docs.map((d) => (d.id === doc.id ? doc : d)));
      _ctx.saveLibrary();
    } catch (convErr) {
      console.error("[ws-server] EPUB conversion failed:", convErr.message);
      // Keep doc without EPUB — will be converted on-demand by load-doc-content
      doc.content = article.textContent;
      _ctx.saveLibrary();
    }

    _ctx.broadcastLibrary();

    sendJson(client.socket, { type: "article-ack", docId: docId, messageId: messageId || null });
    console.log(`[ws-server] Added article: "${doc.title}" (${wordCount} words)`);
  } catch (err) {
    sendJson(client.socket, { type: "error", message: "Failed to add article: " + err.message });
  }
}

// ── Server lifecycle ─────────────────────────────────────────────────────────

function generatePairingToken() {
  return crypto.randomBytes(16).toString("hex");
}

function startServer(ctx) {
  if (_server) return { port: WS_PORT, token: _pairingToken };

  _ctx = ctx;

  // Generate or restore pairing token (encrypted via safeStorage)
  const settings = ctx.getSettings();
  if (settings._wsPairingToken) {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const buffer = Buffer.from(settings._wsPairingToken, "base64");
        _pairingToken = safeStorage.decryptString(buffer);
      } else {
        _pairingToken = settings._wsPairingToken;
      }
    } catch {
      // Decryption failed (corrupted or was stored in plaintext) — regenerate
      console.warn("[ws-server] Pairing token decryption failed — regenerating");
      _pairingToken = generatePairingToken();
      if (safeStorage.isEncryptionAvailable()) {
        settings._wsPairingToken = safeStorage.encryptString(_pairingToken).toString("base64");
      } else {
        settings._wsPairingToken = _pairingToken;
      }
      ctx.saveSettings();
    }
  } else {
    _pairingToken = generatePairingToken();
    if (safeStorage.isEncryptionAvailable()) {
      settings._wsPairingToken = safeStorage.encryptString(_pairingToken).toString("base64");
    } else {
      settings._wsPairingToken = _pairingToken;
    }
    ctx.saveSettings();
  }

  _server = http.createServer((_req, res) => {
    // Reject non-WebSocket HTTP requests
    res.writeHead(426, { "Content-Type": "text/plain" });
    res.end("WebSocket connections only.");
  });

  _server.on("upgrade", (request, socket, head) => {
    handleConnection(socket, request);
  });

  _server.listen(WS_PORT, "127.0.0.1", () => {
    _retryCount = 0;
    console.log(`[ws-server] Listening on ws://127.0.0.1:${WS_PORT}${WS_PATH}`);
  });

  _server.on("error", (err) => {
    console.error("[ws-server] Server error:", err.message);
    if (err.code === "EADDRINUSE") {
      _retryCount++;
      if (_retryCount >= WS_MAX_RETRY_COUNT) {
        console.error(`[ws-server] Port ${WS_PORT} still in use after ${WS_MAX_RETRY_COUNT} retries — giving up.`);
        _server = null;
        return;
      }
      console.error(`[ws-server] Port ${WS_PORT} is in use. Retry ${_retryCount}/${WS_MAX_RETRY_COUNT} in ${WS_RETRY_DELAY_MS}ms.`);
      setTimeout(() => {
        _server = null;
        startServer(ctx);
      }, WS_RETRY_DELAY_MS);
    }
  });

  // Heartbeat to detect stale connections — clear any prior timer to prevent stacking
  if (_heartbeatTimer) clearInterval(_heartbeatTimer);
  _heartbeatTimer = setInterval(() => {
    for (const client of _clients) {
      if (!client.alive) {
        client.socket.destroy();
        _clients.delete(client);
        continue;
      }
      client.alive = false;
      try {
        client.socket.write(encodeFrame(Buffer.alloc(0), 0x09)); // Ping
      } catch {
        _clients.delete(client);
      }
    }
  }, HEARTBEAT_INTERVAL_MS);

  return { port: WS_PORT, token: _pairingToken };
}

function stopServer() {
  if (_heartbeatTimer) {
    clearInterval(_heartbeatTimer);
    _heartbeatTimer = null;
  }

  for (const client of _clients) {
    try {
      client.socket.end(encodeFrame(Buffer.alloc(0), 0x08));
    } catch { /* ignore */ }
  }
  _clients.clear();

  if (_server) {
    _server.close();
    _server = null;
  }

  console.log("[ws-server] Stopped");
}

function getStatus() {
  return {
    running: !!_server,
    port: WS_PORT,
    clients: _clients.size,
    token: _pairingToken,
  };
}

function getClientCount() {
  let count = 0;
  for (const client of _clients) {
    if (client.authenticated) count++;
  }
  return count;
}

module.exports = {
  startServer,
  stopServer,
  getStatus,
  getClientCount,
  WS_PORT,
  WS_PATH,
  // Exported for testing
  decodeFrame,
  encodeFrame,
  generatePairingToken,
  generateShortCode,
  getShortCode,
};
