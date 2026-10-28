// No transport is opened until connectOwned is explicitly called after admission.
const BODIES = Object.freeze({
  1: 'function(other){"use strict";return this===other;}',
  2: 'function(){"use strict";for(let i=0;i<arguments.length;i++){for(let j=0;j<i;j++){if(arguments[i]===arguments[j])return false;}}return true;}',
  3: 'function(){"use strict";return {userData:this.getPath("userData"),isPackaged:this.isPackaged};}',
});
const MAX_MESSAGE = 2097152;
const MAX_RECEIVED = 67108864;
const has = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const fault = code => Object.assign(new Error(code), { code });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function createTerminalState() {
  let failure = null;
  return Object.freeze({
    fail(error) { failure ??= error; },
    read() { return failure; },
    assert() { if (failure) throw failure; },
  });
}
function acknowledgeClose(state, socketCloseAck) {
  state.assert();
  if (!socketCloseAck) throw fault('CLOSE');
  return true;
}

export function selfCheckTransportState() {
  const state = createTerminalState();
  state.assert();
  const first = fault('PROTOCOL_SHAPE');
  state.fail(first); state.fail(fault('TRANSPORT'));
  let rejection = null;
  const socketCloseAck = true;
  try { acknowledgeClose(state, socketCloseAck); } catch (error) { rejection = error; }
  if (!socketCloseAck || rejection !== first || state.read() !== first) throw fault('STATIC_ASSERTION');
  return true;
}

// The identical pure function in fixture-entry is checked by source equality.
export function restoreOwnDescriptors(target, descriptors) {
  for (const key of Reflect.ownKeys(target)) if (!Object.prototype.hasOwnProperty.call(descriptors, key)) delete target[key];
  Object.defineProperties(target, descriptors);
}

export function selfCheckContextRestore() {
  const functions = [function a() {}, function b() {}, function c() {}];
  const context = { getDataPath: functions[0], getLibrary: functions[1], saveHistory: functions[2] };
  const originalIdentity = context;
  const descriptors = Object.getOwnPropertyDescriptors(context);
  let getterCalls = 0;
  context.getDataPath = function foreign() {};
  context.getLibrary = function replacement() {};
  Object.defineProperty(context, 'saveHistory', { get() { getterCalls++; throw fault('STATIC_ASSERTION'); }, configurable: true });
  context.extra = true;
  restoreOwnDescriptors(context, descriptors);
  if (context !== originalIdentity || getterCalls !== 0 || Reflect.ownKeys(context).length !== 3) throw fault('STATIC_ASSERTION');
  for (const key of Object.keys(descriptors)) {
    const actual = Object.getOwnPropertyDescriptor(context, key), expected = descriptors[key];
    for (const field of ['value', 'writable', 'enumerable', 'configurable']) if (actual[field] !== expected[field]) throw fault('STATIC_ASSERTION');
    if (Object.prototype.hasOwnProperty.call(actual, 'get') || Object.prototype.hasOwnProperty.call(actual, 'set')) throw fault('STATIC_ASSERTION');
  }
  return true;
}
function keys(value, allowed, required = []) {
  if (!record(value) || Object.keys(value).some(key => !allowed.includes(key)) || required.some(key => !has(value, key))) throw fault('PROTOCOL_SHAPE');
}

// JSON.parse's reviver cannot detect duplicate keys after they were overwritten.
export function parseClosedJson(input) {
  let source;
  try { source = typeof input === 'string' ? input : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(input); }
  catch { throw fault('PROTOCOL_SHAPE'); }
  if (new TextEncoder().encode(source).length > MAX_MESSAGE) throw fault('CAP_OVERFLOW');
  if (source.charCodeAt(0) === 0xfeff) throw fault('PROTOCOL_SHAPE');
  let index = 0;
  const whitespace = () => { while (/[\u0020\t\r\n]/.test(source[index] ?? 'x')) index++; };
  function string() {
    const start = index++;
    while (index < source.length) {
      const ch = source[index++];
      if (ch === '"') return JSON.parse(source.slice(start, index));
      if (ch === '\\') index++;
      else if (ch.charCodeAt(0) < 32) throw fault('PROTOCOL_SHAPE');
    }
    throw fault('PROTOCOL_SHAPE');
  }
  function value(depth) {
    if (depth > 64) throw fault('CAP_OVERFLOW');
    whitespace();
    const ch = source[index];
    if (ch === '"') return string();
    if (ch === '{') {
      index++; whitespace();
      const out = Object.create(null);
      if (source[index] === '}') { index++; return out; }
      while (true) {
        whitespace(); if (source[index] !== '"') throw fault('PROTOCOL_SHAPE');
        const name = string();
        if (has(out, name)) throw fault('PROTOCOL_SHAPE');
        whitespace(); if (source[index++] !== ':') throw fault('PROTOCOL_SHAPE');
        out[name] = value(depth + 1); whitespace();
        const next = source[index++];
        if (next === '}') return out;
        if (next !== ',') throw fault('PROTOCOL_SHAPE');
      }
    }
    if (ch === '[') {
      index++; whitespace(); const out = [];
      if (source[index] === ']') { index++; return out; }
      while (true) {
        out.push(value(depth + 1)); whitespace(); const next = source[index++];
        if (next === ']') return out;
        if (next !== ',') throw fault('PROTOCOL_SHAPE');
      }
    }
    const match = /^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(source.slice(index));
    if (!match) throw fault('PROTOCOL_SHAPE');
    index += match[0].length;
    const parsed = JSON.parse(match[0]);
    if (typeof parsed === 'number' && !Number.isFinite(parsed)) throw fault('PROTOCOL_SHAPE');
    return parsed;
  }
  const parsed = value(0); whitespace();
  if (index !== source.length) throw fault('PROTOCOL_SHAPE');
  return parsed;
}

export async function connectOwned(endpoint, identity, deadline) {
  const match = /^ws:\/\/127\.0\.0\.1:([1-9]\d{0,4})\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/.exec(endpoint);
  if (!match || +match[1] > 65535 || /^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(match[2]) || !record(identity) || identity.endpointUUID !== match[2] || !Number.isSafeInteger(identity.childPID) || identity.childPID < 1 || !/^[0-9a-f]{32}$/.test(identity.runNonce) || !/^[0-9a-f]{64}$/.test(identity.exeSHA256) || !record(identity.spawnBracket)) throw fault('ENDPOINT');
  if (!Number.isFinite(deadline) || deadline <= performance.now()) throw fault('DEADLINE');
  const cap = identity.mode === 'node-fixture-core' ? 1266 : 1268;
  const socket = new WebSocket(endpoint);
  const pending = new Map();
  const groups = new Map();
  const handles = new WeakMap();
  let nextId = 1, rpcSent = 0, maxInFlight = 0, receivedBytes = 0;
  const terminal = createTerminalState();
  let groupsAttempted = 0, groupsAcked = 0, socketCloseAck = false, closeSent = false;
  const remaining = limit => Math.max(0, Math.min(limit, deadline - performance.now()));
  function fail(error) {
    terminal.fail(error);
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(error); }
    pending.clear();
  }
  function remote(value, group) {
    keys(value, ['type', 'subtype', 'className', 'value', 'unserializableValue', 'description', 'objectId', 'deepSerializedValue', 'preview', 'customPreview'], ['type']);
    if (has(value, 'preview') || has(value, 'customPreview') || has(value, 'deepSerializedValue')) throw fault('PROTOCOL_SHAPE');
    if (!['object', 'function', 'undefined', 'string', 'number', 'boolean', 'symbol', 'bigint'].includes(value.type)) throw fault('PROTOCOL_SHAPE');
    const out = { ...value };
    if (has(value, 'objectId')) {
      if (typeof value.objectId !== 'string' || !value.objectId.length || value.objectId.length > 8192) throw fault('CAP_OVERFLOW');
      const state = groups.get(group);
      if (!state || state.released) throw fault('PROTOCOL_SHAPE');
      let token = state.tokens.get(value.objectId);
      if (!token) { token = Object.freeze(Object.create(null)); state.tokens.set(value.objectId, token); handles.set(token, { id: value.objectId, group }); }
      out.objectId = token;
    }
    return Object.freeze(out);
  }
  function handle(value) {
    if (!record(value) || value.subtype === 'proxy') throw fault('PROTOCOL_SHAPE');
    const info = record(value.objectId) ? handles.get(value.objectId) : null;
    if (!info || groups.get(info.group)?.released) throw fault('PROTOCOL_SHAPE');
    return info;
  }
  socket.addEventListener('message', event => {
    try {
      if (typeof event.data !== 'string') throw fault('PROTOCOL_SHAPE');
      const bytes = new TextEncoder().encode(event.data).length;
      receivedBytes += bytes;
      if (bytes > MAX_MESSAGE || receivedBytes > MAX_RECEIVED) throw fault('CAP_OVERFLOW');
      const message = parseClosedJson(event.data);
      if (!record(message)) throw fault('PROTOCOL_SHAPE');
      if (!has(message, 'id')) {
        keys(message, ['method', 'params'], ['method']);
        if (typeof message.method !== 'string') throw fault('PROTOCOL_SHAPE');
        return; // Unrequested events are neither retained nor projected.
      }
      keys(message, ['id', 'result', 'error'], ['id']);
      if (!Number.isSafeInteger(message.id) || message.id < 1 || has(message, 'result') === has(message, 'error')) throw fault('PROTOCOL_SHAPE');
      const request = pending.get(message.id);
      if (!request) throw fault('PROTOCOL_SHAPE');
      clearTimeout(request.timer); pending.delete(message.id);
      if (has(message, 'error')) { request.reject(fault('TRANSPORT')); return; }
      request.resolve(message.result);
    } catch (error) { fail(error.code ? error : fault('PROTOCOL_SHAPE')); }
  });
  socket.addEventListener('error', () => fail(fault('TRANSPORT')));
  socket.addEventListener('close', event => {
    if (closeSent && event.wasClean && event.code === 1000) socketCloseAck = true;
    if (!closeSent || pending.size) fail(fault('TRANSPORT'));
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { socket.close(); reject(fault('DEADLINE')); }, remaining(1000));
    socket.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    socket.addEventListener('error', () => { clearTimeout(timer); reject(fault('TRANSPORT')); }, { once: true });
    socket.addEventListener('close', () => { clearTimeout(timer); reject(fault('TRANSPORT')); }, { once: true });
  });
  async function request(method, params, cleanup = false) {
    if (!cleanup) terminal.assert();
    if (socket.readyState !== WebSocket.OPEN) throw fault('TRANSPORT');
    if (pending.size >= 8 || rpcSent >= cap) throw fault('CAP_OVERFLOW');
    const wait = remaining(2000);
    if (!wait && !cleanup) throw fault('DEADLINE');
    const id = nextId++; rpcSent++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(id); reject(fault('DEADLINE')); }, cleanup && wait === 0 ? 1 : wait);
      pending.set(id, { resolve, reject, timer }); maxInFlight = Math.max(maxInFlight, pending.size);
      try { socket.send(JSON.stringify({ id, method, params })); }
      catch { clearTimeout(timer); pending.delete(id); reject(fault('TRANSPORT')); }
    });
  }
  const client = {
    async evaluateProcess(group) {
      if (typeof group !== 'string' || !/^[A-Za-z0-9_.:-]{1,128}$/.test(group) || groups.get(group)?.released || (!groups.has(group) && groups.size >= 3)) throw fault('PROTOCOL_SHAPE');
      if (!groups.has(group)) groups.set(group, { tokens: new Map(), released: false, releaseSent: false });
      const answer = await request('Runtime.evaluate', { expression: 'process', objectGroup: group, returnByValue: false, generatePreview: false, silent: false, awaitPromise: false, includeCommandLineAPI: false });
      keys(answer, ['result', 'exceptionDetails'], ['result']);
      if (has(answer, 'exceptionDetails')) throw fault('EXCEPTION');
      const result = remote(answer.result, group);
      if (result.type !== 'object' || result.subtype === 'null' || result.subtype === 'proxy' || !has(result, 'objectId')) throw fault('PROTOCOL_SHAPE');
      return result;
    },
    async getOwnProperties(receiver) {
      const info = handle(receiver);
      const answer = await request('Runtime.getProperties', { objectId: info.id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false, nonIndexedPropertiesOnly: false });
      keys(answer, ['result', 'internalProperties', 'privateProperties', 'exceptionDetails'], ['result']);
      if (has(answer, 'exceptionDetails')) throw fault('EXCEPTION');
      if (!Array.isArray(answer.result) || answer.result.length > 512 || has(answer, 'privateProperties')) throw fault('CAP_OVERFLOW');
      const result = answer.result.map(item => {
        keys(item, ['name', 'value', 'writable', 'get', 'set', 'configurable', 'enumerable', 'wasThrown', 'isOwn', 'symbol'], ['name']);
        if (typeof item.name !== 'string' || item.name.length > 128 || item.wasThrown === true) throw fault('PROTOCOL_SHAPE');
        const descriptor = { ...item };
        for (const field of ['value', 'get', 'set', 'symbol']) if (has(item, field)) descriptor[field] = remote(item[field], info.group);
        return Object.freeze(descriptor);
      });
      const internals = answer.internalProperties ?? [];
      if (!Array.isArray(internals) || internals.length > 32) throw fault('CAP_OVERFLOW');
      const internalProperties = internals.map(item => {
        keys(item, ['name', 'value'], ['name']);
        if (typeof item.name !== 'string' || item.name.length > 128) throw fault('PROTOCOL_SHAPE');
        return Object.freeze({ name: item.name, ...(has(item, 'value') ? { value: remote(item.value, info.group) } : {}) });
      });
      return Object.freeze({ result: Object.freeze(result), internalProperties: Object.freeze(internalProperties) });
    },
    async callAllowed(bodyId, receiver, args, group) {
      if (!Number.isInteger(bodyId) || !has(BODIES, bodyId) || !Array.isArray(args) || args.length > 128 || Object.keys(args).length !== args.length || (bodyId === 1 && args.length !== 1) || (bodyId === 3 && args.length !== 0)) throw fault('PROTOCOL_SHAPE');
      const owner = handle(receiver);
      if (owner.group !== group || !groups.has(group) || groups.get(group).released) throw fault('PROTOCOL_SHAPE');
      const argumentsList = args.map(argument => ({ objectId: handle(argument).id }));
      const answer = await request('Runtime.callFunctionOn', { functionDeclaration: BODIES[bodyId], objectId: owner.id, arguments: argumentsList, objectGroup: group, returnByValue: true, awaitPromise: false, generatePreview: false, silent: false });
      keys(answer, ['result', 'exceptionDetails'], ['result']);
      if (has(answer, 'exceptionDetails')) throw fault('EXCEPTION');
      const result = answer.result;
      if (bodyId === 3) {
        keys(result, ['type', 'value'], ['type', 'value']);
        keys(result.value, ['userData', 'isPackaged'], ['userData', 'isPackaged']);
        if (result.type !== 'object' || typeof result.value.userData !== 'string' || result.value.userData.length > 4096 || typeof result.value.isPackaged !== 'boolean') throw fault('PROTOCOL_SHAPE');
        return Object.freeze({ ...result.value });
      }
      keys(result, ['type', 'value'], ['type', 'value']);
      if (result.type !== 'boolean' || typeof result.value !== 'boolean') throw fault('PROTOCOL_SHAPE');
      return result.value;
    },
    async releaseGroup(group) {
      const state = groups.get(group);
      if (!state || state.releaseSent) throw fault('RELEASE');
      state.releaseSent = true; groupsAttempted++;
      try {
        const answer = await request('Runtime.releaseObjectGroup', { objectGroup: group }, true);
        keys(answer, []); state.released = true; state.tokens.clear(); groupsAcked++; return true;
      } catch { state.released = true; state.tokens.clear(); throw fault('RELEASE'); }
    },
    async close() {
      if (closeSent) throw fault('CLOSE');
      closeSent = true;
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(terminal.read() ?? fault('CLOSE')), Math.max(1, remaining(1000)));
        socket.addEventListener('close', () => {
          clearTimeout(timer);
          try { resolve(acknowledgeClose(terminal, socketCloseAck)); }
          catch (error) { reject(error); }
        }, { once: true });
        if (socket.readyState !== WebSocket.OPEN) { clearTimeout(timer); reject(terminal.read() ?? fault('CLOSE')); return; }
        socket.close(1000);
      });
    },
    stats() { return Object.freeze({ rpcSent, maxInFlight, receivedBytes, groupsAttempted, groupsAcked, socketCloseAck, terminalFailure: terminal.read()?.code ?? null }); },
  };
  return Object.freeze(client);
}
