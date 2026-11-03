const fsPromises = require("fs/promises");
const path = require("node:path");
const { BUSINESS_READ_CHUNK_BYTES } = require("../constants");

let nextDocumentId = 1;
function reserveDocumentId() {
  if (!Number.isSafeInteger(nextDocumentId)) throw Object.assign(new Error('BUSINESS_ID_EXHAUSTED'), { code: 'BUSINESS_ID_EXHAUSTED' });
  return nextDocumentId++;
}

// Only the sequencing tail absorbs failures; every caller retains its result.
let ioTail = Promise.resolve();
function enqueue(operation) {
  const result = ioTail.then(operation);
  ioTail = result.then(() => undefined, () => undefined);
  return result;
}

const brandedErrors = new WeakSet();
function failure(suffix) {
  const code = `BUSINESS_${suffix}`;
  const error = Object.assign(new Error(code), { code });
  brandedErrors.add(error);
  return error;
}

function nativeFailure(error) {
  if (error?.code === "ENOENT") return failure("FILE_NOT_FOUND");
  if (error?.code === "EACCES" || error?.code === "EPERM") return failure("FILE_ACCESS_DENIED");
  return failure("FILE_IO");
}

function validId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

function normalizePath(value) {
  if (typeof value !== "string" || !value.length || value.includes("\0") || !path.isAbsolute(value)) throw failure("INVALID_REQUEST");
  if (process.platform === "win32") {
    if (/^[\\/]{2}[?.][\\/]/.test(value)) throw failure("INVALID_REQUEST");
    if (!/^[A-Za-z]:[\\/]/.test(value) && !/^[\\/]{2}[^\\/]+[\\/][^\\/]+(?:[\\/]|$)/.test(value)) throw failure("INVALID_REQUEST");
  }
  return path.resolve(value);
}

function metadata(stat) {
  const keys = ["dev", "ino", "size", "mtimeNs", "ctimeNs"];
  if (!stat || typeof stat.isFile !== "function" || !stat.isFile() || keys.some(key => typeof stat[key] !== "bigint") || stat.size <= 0n || stat.size > BigInt(Number.MAX_SAFE_INTEGER)) throw failure("FILE_INVALID");
  return keys.map(key => stat[key]);
}

function createReadController() {
  let generation = Object.freeze({});
  let stopping = false;
  let shutdownPromise;
  const leases = new Map();
  const operations = new Set();

  function track(promise) {
    operations.add(promise);
    promise.then(() => operations.delete(promise), () => operations.delete(promise));
    return promise;
  }

  function checkCurrent(lease, allowClosing = false) {
    if (lease.generation !== generation) throw failure("DOCUMENT_STALE");
    if (!allowClosing && lease.closing) throw failure("DOCUMENT_CLOSED");
  }

  function prepareRelease(lease) {
    lease.closing = true;
    if (!lease.closePromise) {
      lease.closePromise = new Promise((resolve, reject) => {
        lease.resolveClose = resolve;
        lease.rejectClose = reject;
      });
      // Observe even an inline release that the caller only sees as secondary.
      lease.closePromise.catch(() => undefined);
    }
    return lease.closePromise;
  }

  // Called only inside an I/O turn, including failure cleanup in that same turn.
  async function releaseOwned(lease) {
    const result = prepareRelease(lease);
    if (lease.releaseStarted) return result;
    lease.releaseStarted = true;
    try {
      if (lease.handle) await lease.handle.close();
      lease.handle = undefined;
      leases.delete(lease.id);
      lease.resolveClose();
    } catch (error) {
      lease.nativeCloseError = error;
      lease.releaseError = nativeFailure(error);
      lease.rejectClose(lease.releaseError);
    }
    return result;
  }

  function requestRelease(lease) {
    const existing = lease.closePromise;
    const result = prepareRelease(lease);
    if (!existing) track(enqueue(() => releaseOwned(lease)));
    return result;
  }

  async function failedOperation(lease, error) {
    lease.nativeOperationError = error;
    const primary = brandedErrors.has(error) ? error : nativeFailure(error);
    lease.primaryError = primary;
    try {
      await releaseOwned(lease);
    } catch (secondary) {
      lease.releaseError = secondary;
    }
    throw primary;
  }

  async function checkMetadata(lease, allowClosing) {
    const current = metadata(await lease.handle.stat({ bigint: true }));
    checkCurrent(lease, allowClosing);
    if (current.some((value, index) => value !== lease.metadata[index])) throw failure("FILE_CHANGED");
  }

  async function readChunk(lease, begin, end, allowClosing) {
    await checkMetadata(lease, allowClosing);
    const data = new Uint8Array(end - begin);
    let filled = 0;
    while (filled < data.length) {
      checkCurrent(lease, allowClosing);
      const remaining = data.length - filled;
      const result = await lease.handle.read(data, filled, remaining, begin + filled);
      checkCurrent(lease, allowClosing);
      const count = result?.bytesRead;
      if (!Number.isInteger(count) || count < 0 || count > remaining) throw failure("FILE_IO");
      if (count === 0) throw failure("FILE_EOF");
      filled += count;
    }
    await checkMetadata(lease, allowClosing);
    checkCurrent(lease, allowClosing);
    return data;
  }

  function getGeneration() {
    return generation;
  }

  function open(value, token) {
    let normalized;
    let id;
    try {
      if (stopping) throw failure("SHUTTING_DOWN");
      normalized = normalizePath(value);
      if (token === null || typeof token !== "object") throw failure("INVALID_REQUEST");
      if (token !== generation) throw failure("DOCUMENT_STALE");
      id = reserveDocumentId();
    } catch (error) {
      return Promise.reject(error);
    }
    const lease = { id, path: normalized, generation: token, closing: false, ready: false, handle: undefined, closePromise: undefined, releaseStarted: false };
    leases.set(id, lease);
    return track(enqueue(async () => {
      try {
        checkCurrent(lease);
        lease.handle = await fsPromises.open(normalized, "r");
        checkCurrent(lease);
        lease.metadata = metadata(await lease.handle.stat({ bigint: true }));
        checkCurrent(lease);
        lease.length = Number(lease.metadata[2]);
        const initialData = await readChunk(lease, 0, Math.min(lease.length, BUSINESS_READ_CHUNK_BYTES), false);
        checkCurrent(lease);
        lease.ready = true;
        return { id, path: normalized, length: lease.length, initialData };
      } catch (error) {
        return failedOperation(lease, error);
      }
    }));
  }

  function read(id, begin, end) {
    let lease;
    try {
      if (stopping) throw failure("SHUTTING_DOWN");
      if (!validId(id) || !Number.isSafeInteger(begin) || !Number.isSafeInteger(end) || begin < 0 || begin >= end || end - begin > BUSINESS_READ_CHUNK_BYTES) throw failure("INVALID_REQUEST");
      lease = leases.get(id);
      if (!lease || !lease.ready) throw failure("DOCUMENT_CLOSED");
      if (end > lease.length) throw failure("INVALID_REQUEST");
      checkCurrent(lease);
    } catch (error) {
      return Promise.reject(error);
    }
    return track(enqueue(async () => {
      // A normal close cancels an unstarted read, but not an active one.
      checkCurrent(lease);
      try {
        const data = await readChunk(lease, begin, end, true);
        return { begin, data };
      } catch (error) {
        return failedOperation(lease, error);
      }
    }));
  }

  function close(id) {
    if (!validId(id)) return Promise.reject(failure("INVALID_REQUEST"));
    const lease = leases.get(id);
    return lease ? requestRelease(lease) : Promise.resolve();
  }

  function getPath(id) {
    if (stopping) throw failure("SHUTTING_DOWN");
    if (!validId(id)) throw failure("INVALID_REQUEST");
    const lease = leases.get(id);
    if (!lease || !lease.ready) throw failure("DOCUMENT_CLOSED");
    checkCurrent(lease);
    return lease.path;
  }

  function invalidate() {
    generation = Object.freeze({});
    const snapshot = [...leases.values()].sort((a, b) => a.id - b.id);
    const ownedOperations = [...operations];
    const releases = snapshot.map(lease => requestRelease(lease));
    return Promise.allSettled([...ownedOperations, ...releases]).then(() => {
      for (const lease of snapshot) {
        if (lease.releaseError) throw lease.releaseError;
      }
    });
  }

  function stopNewWork() {
    stopping = true;
  }

  function shutdown() {
    if (!shutdownPromise) {
      stopNewWork();
      shutdownPromise = invalidate();
    }
    return shutdownPromise;
  }

  return { getGeneration, open, read, close, getPath, invalidate, stopNewWork, shutdown };
}

module.exports = { createReadController };
