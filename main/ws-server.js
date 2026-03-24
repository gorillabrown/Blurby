// main/ws-server.js — Local WebSocket server for Chrome extension communication
// CommonJS only — Electron main process

const http = require("http");
const crypto = require("crypto");
const { WS_PORT, HEARTBEAT_INTERVAL_MS, WS_RETRY_DELAY_MS } = require("./constants");

// ── Constants ────────────────────────────────────────────────────────────────
const WS_PATH = "/blurby";
const WS_GUID = "258EAFA5-E914-47DA-95CA-5AB9DC508C65"; // RFC 6455 — protocol constant, not tunable

let _server = null;
let _heartbeatTimer = null;
let _clients = new Set();
let _pairingToken = null;
let _ctx = null;

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

  socket.on("data", (data) => {
    client.buffer = Buffer.concat([client.buffer, data]);
    processFrames(client);
  });

  socket.on("close", () => {
    _clients.delete(client);
  });

  socket.on("error", (err) => {
    console.error("[ws-server] Socket error:", err.message);
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

async function handleMessage(client, text) {
  let msg;
  try {
    msg = JSON.parse(text);
  } catch {
    sendJson(client.socket, { type: "error", message: "Invalid JSON" });
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
      sendJson(client.socket, { type: "auth-ok" });
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
    await handleAddArticle(client, msg.payload);
    return;
  }

  sendJson(client.socket, { type: "error", message: `Unknown message type: ${msg.type}` });
}

async function handleAddArticle(client, article) {
  if (!article || !article.textContent) {
    sendJson(client.socket, { type: "error", message: "Article must include textContent" });
    return;
  }

  try {
    const docId = Date.now().toString() + Math.random().toString(36).slice(2, 8);
    const wordCount = article.textContent.trim().split(/\s+/).filter(Boolean).length;

    const doc = {
      id: docId,
      title: article.title || "Untitled Article",
      content: article.textContent,
      wordCount: wordCount,
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

    _ctx.addDocToLibrary(doc);
    _ctx.saveLibrary();
    _ctx.broadcastLibrary();

    // Save content to file if folder-based storage is configured
    const settings = _ctx.getSettings();
    if (settings.sourceFolder) {
      const fsPromises = require("fs/promises");
      const path = require("path");
      const savedDir = path.join(settings.sourceFolder, "Saved Articles");
      try {
        await fsPromises.mkdir(savedDir, { recursive: true });
        const safeTitle = (article.title || "untitled")
          .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
          .replace(/-{2,}/g, "-")
          .slice(0, 80);
        const filepath = path.join(savedDir, `${safeTitle}.txt`);
        const tmp = filepath + ".tmp";
        await fsPromises.writeFile(tmp, article.textContent, "utf-8");
        await fsPromises.rename(tmp, filepath);

        // Update doc with filepath
        doc.filepath = filepath;
        doc.filename = `${safeTitle}.txt`;
        doc.ext = ".txt";
        _ctx.saveLibrary();
      } catch (err) {
        console.error("[ws-server] Failed to save article file:", err.message);
      }
    }

    sendJson(client.socket, { type: "ok", docId: docId });
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

  // Generate or restore pairing token
  const settings = ctx.getSettings();
  if (settings._wsPairingToken) {
    _pairingToken = settings._wsPairingToken;
  } else {
    _pairingToken = generatePairingToken();
    settings._wsPairingToken = _pairingToken;
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
    console.log(`[ws-server] Listening on ws://127.0.0.1:${WS_PORT}${WS_PATH}`);
  });

  _server.on("error", (err) => {
    console.error("[ws-server] Server error:", err.message);
    if (err.code === "EADDRINUSE") {
      console.error(`[ws-server] Port ${WS_PORT} is in use. Will retry in ${WS_RETRY_DELAY_MS}ms.`);
      setTimeout(() => {
        _server = null;
        startServer(ctx);
      }, WS_RETRY_DELAY_MS);
    }
  });

  // Heartbeat to detect stale connections
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
  return _clients.size;
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
};
