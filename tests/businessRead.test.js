import { afterEach, describe, expect, it, vi } from "vitest";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// IC-T deliberately contains no implementation. Every case must first fail its
// own module-existence assertion on accepted W; collection must still succeed.
const require = createRequire(import.meta.url);
const modulePath = fileURLToPath(new URL("../main/business/read.js", import.meta.url));
const cjsFs = require("fs/promises");
const A = [37, 80, 68, 70, 45, 49, 46, 55, 10, 65, 66, 67];
const CHUNK = 1048576;
const FILE = String.raw`C:\business-fixture\A.bin`;
const FILE_B = String.raw`C:\business-fixture\B.bin`;
const API = ["getGeneration", "open", "read", "close", "getPath", "invalidate", "stopNewWork", "shutdown"];
const nativeError = code => Object.assign(new Error(`private native ${code}`), { code });
const branded = suffix => ({ code: `BUSINESS_${suffix}`, message: `BUSINESS_${suffix}` });
const controllers = [];
const gates = [];
const pending = [];
const expectedCleanupErrors = new Set();
let originalModuleRecord;
let moduleLoaded = false;

function observe(promise) {
  const result = Promise.resolve(promise);
  // Observe immediately, while preserving the original rejecting promise.
  pending.push(result.then(value => ({ ok: true, value }), error => ({ ok: false, error })));
  return promise;
}

function deferred() {
  let resolve;
  let reject;
  let settled = false;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  const gate = {
    promise,
    resolve(value) { if (!settled) { settled = true; resolve(value); } },
    reject(error) { if (!settled) { settled = true; reject(error); } },
  };
  gates.push(gate);
  return gate;
}

function fakeHandle(bytes = A) {
  const data = Uint8Array.from(bytes);
  const calls = [];
  const handle = {
    calls, closed: false,
    metadata: { dev: 0n, ino: 0n, size: BigInt(data.length), mtimeNs: 100n, ctimeNs: 200n },
    regular: true,
    statHook: null, readHook: null, closeHook: null,
    async stat(options) {
      calls.push({ op: "stat", options });
      if (handle.statHook) return handle.statHook(options);
      return { ...handle.metadata, isFile: () => handle.regular };
    },
    async read(out, offset, length, position) {
      calls.push({ op: "read", out, offset, length, position });
      if (handle.readHook) return handle.readHook(out, offset, length, position);
      const count = Math.min(length, data.length - position);
      out.set(data.subarray(position, position + count), offset);
      return { bytesRead: count, buffer: new Uint8Array([255]) };
    },
    async close() {
      calls.push({ op: "close" });
      if (handle.closeHook) return handle.closeHook();
      handle.closed = true;
    },
  };
  handle.snapshot = () => ({ ...handle.metadata, isFile: () => handle.regular });
  return handle;
}

function installFs(handles = [fakeHandle()]) {
  const queue = [...handles];
  const open = vi.spyOn(cjsFs, "open").mockImplementation(async (filename, flags) => {
    expect(flags).toBe("r");
    expect([path.resolve(FILE), path.resolve(FILE_B), String.raw`\\server\share\fixture.bin`]).toContain(filename);
    expect(queue.length, "unexpected unowned fs.open; never delegate to real I/O").toBeGreaterThan(0);
    const item = queue.shift();
    return typeof item === "function" ? item() : item;
  });
  const prohibited = [];
  for (const name of ["readFile", "stat", "lstat", "realpath", "access", "readdir", "writeFile", "mkdir", "unlink", "rename"]) {
    prohibited.push(vi.spyOn(cjsFs, name).mockImplementation(() => {
      throw new Error(`PROHIBITED_CONTROLLER_FILENAME_IO:${name}`);
    }));
  }
  return { open, queue, prohibited };
}

function load(id, beforeImport) {
  expect(fs.existsSync(modulePath), `IC_T_MISSING_MODULE_${id}`).toBe(true);
  beforeImport?.();
  if (!moduleLoaded) {
    originalModuleRecord = require.cache[modulePath];
    delete require.cache[modulePath];
    moduleLoaded = true;
  }
  const exports = require(modulePath);
  expect(typeof exports.createReadController).toBe("function");
  return exports;
}

function make(createReadController) {
  const controller = createReadController();
  controllers.push(controller);
  return controller;
}

function open(controller, filename = FILE) {
  return observe(controller.open(filename, controller.getGeneration()));
}

async function rejectCode(promise, suffix) {
  expect(promise).toBeInstanceOf(Promise);
  observe(promise);
  await expect(promise).rejects.toMatchObject(branded(suffix));
}

function throwCode(action, suffix) {
  let error;
  try { action(); } catch (caught) { error = caught; }
  expect(error).toMatchObject(branded(suffix));
}

function assertBytes(data, literal) {
  expect(data).toBeInstanceOf(Uint8Array);
  expect([...data]).toEqual(literal);
}
function assertExactView(data, literal) {
  assertBytes(data, literal);
  expect(data.byteOffset).toBe(0);
  expect(data.byteLength).toBe(literal.length);
  expect(data.buffer.byteLength).toBe(literal.length);
}
function assertOneActive(active) { expect(active).toBeLessThanOrEqual(1); }
function assertSamePromise(first, second) { expect(second).toBe(first); }
function assertNoDescriptor(observation) { expect(observation).toEqual({ published: false }); }
function assertFailedOwnership(observation) {
  expect(observation).toEqual({ retained: true, attempts: 1 });
}

afterEach(async () => {
  const allowedCleanupErrors = new Set(expectedCleanupErrors);
  let cleanup = [];
  try {
    for (const gate of gates) gate.resolve();
    await Promise.all(pending);
    cleanup = await Promise.allSettled(
      controllers.map(controller =>
        Promise.resolve().then(() => controller.shutdown()))
    );
  } finally {
    try {
      vi.restoreAllMocks();
    } finally {
      try {
        if (moduleLoaded) {
          delete require.cache[modulePath];
          if (originalModuleRecord)
            require.cache[modulePath] = originalModuleRecord;
        }
      } finally {
        controllers.length = 0;
        gates.length = 0;
        pending.length = 0;
        expectedCleanupErrors.clear();
        moduleLoaded = false;
        originalModuleRecord = undefined;
      }
    }
  }
  for (const result of cleanup) {
    if (result.status === 'rejected')
      expect(allowedCleanupErrors.has(result.reason?.code)).toBe(true);
  }
});

// AST source DATA only: neither the original nor opposing strings are evaluated.
function assertAllocatorSource(ts, text) {
  const source = ts.createSourceFile("read.js", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  expect(source.parseDiagnostics).toHaveLength(0);
  const identifier = (node, value) => ts.isIdentifier(node) && node.text === value;
  const property = (node, owner, name) => ts.isPropertyAccessExpression(node) && identifier(node.expression, owner) && identifier(node.name, name);
  const literal = (node, value) => ts.isStringLiteral(node) && node.text === value;
  const declarations = [];
  const functions = [];
  for (const statement of source.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (identifier(decl.name, "nextDocumentId")) declarations.push({ statement, decl });
      }
    }
    if (ts.isFunctionDeclaration(statement) && identifier(statement.name, "reserveDocumentId")) functions.push(statement);
  }
  expect(declarations).toHaveLength(1);
  expect(functions).toHaveLength(1);
  const { statement, decl } = declarations[0];
  expect(statement.declarationList.flags & ts.NodeFlags.Let).toBeTruthy();
  expect(statement.declarationList.flags & ts.NodeFlags.Const).toBe(0);
  expect(ts.isNumericLiteral(decl.initializer) && Number(decl.initializer.text) === 1).toBe(true);
  expect(statement.modifiers?.length ?? 0).toBe(0);
  const allocator = functions[0];
  expect(allocator.modifiers?.length ?? 0).toBe(0);
  expect(allocator.parameters).toHaveLength(0);
  expect(allocator.body.statements).toHaveLength(2);
  const [guard, returned] = allocator.body.statements;
  expect(ts.isIfStatement(guard)).toBe(true);
  expect(guard.elseStatement).toBeUndefined();
  expect(ts.isPrefixUnaryExpression(guard.expression)).toBe(true);
  expect(guard.expression.operator).toBe(ts.SyntaxKind.ExclamationToken);
  const condition = guard.expression.operand;
  expect(ts.isCallExpression(condition) && property(condition.expression, "Number", "isSafeInteger")).toBe(true);
  expect(condition.arguments).toHaveLength(1);
  expect(identifier(condition.arguments[0], "nextDocumentId")).toBe(true);
  const thrown = ts.isBlock(guard.thenStatement) ? guard.thenStatement.statements[0] : guard.thenStatement;
  if (ts.isBlock(guard.thenStatement)) expect(guard.thenStatement.statements).toHaveLength(1);
  expect(ts.isThrowStatement(thrown)).toBe(true);
  const assigned = thrown.expression;
  expect(ts.isCallExpression(assigned) && property(assigned.expression, "Object", "assign")).toBe(true);
  expect(assigned.arguments).toHaveLength(2);
  const [error, properties] = assigned.arguments;
  expect(ts.isNewExpression(error) && identifier(error.expression, "Error")).toBe(true);
  expect(error.arguments).toHaveLength(1);
  expect(literal(error.arguments[0], "BUSINESS_ID_EXHAUSTED")).toBe(true);
  expect(ts.isObjectLiteralExpression(properties)).toBe(true);
  expect(properties.properties).toHaveLength(1);
  const code = properties.properties[0];
  expect(ts.isPropertyAssignment(code)).toBe(true);
  expect(identifier(code.name, "code") || literal(code.name, "code")).toBe(true);
  expect(literal(code.initializer, "BUSINESS_ID_EXHAUSTED")).toBe(true);
  expect(ts.isReturnStatement(returned) && ts.isPostfixUnaryExpression(returned.expression)).toBe(true);
  expect(returned.expression.operator).toBe(ts.SyntaxKind.PlusPlusToken);
  expect(identifier(returned.expression.operand, "nextDocumentId")).toBe(true);
  let counterDeclarations = 0;
  let updates = 0;
  let writes = 0;
  let reservation;
  let openFunction;
  const containsPrivate = node => {
    let found = false;
    const walk = child => { if (identifier(child, "nextDocumentId") || identifier(child, "reserveDocumentId")) found = true; ts.forEachChild(child, walk); };
    walk(node);
    return found;
  };
  const walk = node => {
    if (ts.isVariableDeclaration(node) && identifier(node.name, "nextDocumentId")) counterDeclarations++;
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && identifier(node.operand, "nextDocumentId")) {
      updates++;
      expect(node).toBe(returned.expression);
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment && containsPrivate(node.left)) writes++;
    if (ts.isExportAssignment(node) || ts.isExportDeclaration(node)) expect(containsPrivate(node)).toBe(false);
    if (ts.isBinaryExpression(node) && (ts.isPropertyAccessExpression(node.left) || ts.isElementAccessExpression(node.left)) && (property(node.left, "module", "exports") || identifier(node.left.expression, "exports") || (identifier(node.left.expression, "module") && literal(node.left.argumentExpression, "exports")))) expect(containsPrivate(node.right)).toBe(false);
    if (ts.isCallExpression(node) && identifier(node.expression, "reserveDocumentId")) {
      expect(reservation).toBeUndefined();
      reservation = node;
      let parent = node.parent;
      while (parent && !(ts.isFunctionDeclaration(parent) && identifier(parent.name, "open")) && !(ts.isVariableDeclaration(parent) && identifier(parent.name, "open"))) parent = parent.parent;
      openFunction = parent;
    }
    ts.forEachChild(node, walk);
  };
  walk(source);
  expect(counterDeclarations).toBe(1);
  expect(updates).toBe(1);
  expect(writes).toBe(0);
  expect(reservation).toBeDefined();
  expect(openFunction).toBeDefined();
  const openBody = ts.isFunctionDeclaration(openFunction) ? openFunction.body : openFunction.initializer.body;
  // bc02/bc11 prove argument/current-generation admission; this AST checks
  // allocator structure and reservation before enqueue, not admission semantics.
  const queueSites = [];
  const inspectOpen = node => {
    if (node !== openBody && (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isFunctionExpression(node))) return;
    if (ts.isCallExpression(node) && ((ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === "then") || (ts.isIdentifier(node.expression) && /enqueue/i.test(node.expression.text)))) queueSites.push(node);
    ts.forEachChild(node, inspectOpen);
  };
  inspectOpen(openBody);
  expect(queueSites.length).toBeGreaterThan(0);
  for (const site of queueSites) expect(site.pos).toBeGreaterThan(reservation.pos);
}

describe.sequential("Business inert read-controller — frozen IC-T controls", () => {
  it("bc01 import/factory are inert and exports closed", () => {
    let io;
    let timeout;
    let interval;
    const loadedBefore = new Set(Object.keys(require.cache));
    const exports = load("bc01", () => {
      io = installFs();
      timeout = vi.spyOn(globalThis, "setTimeout");
      interval = vi.spyOn(globalThis, "setInterval");
    });
    const controller = make(exports.createReadController);
    expect(Object.keys(exports)).toEqual(["createReadController"]);
    expect(Object.keys(controller).sort()).toEqual([...API].sort());
    const token = controller.getGeneration();
    expect(Object.isFrozen(token)).toBe(true);
    expect(Object.keys(token)).toEqual([]);
    expect(controller.getGeneration()).toBe(token);
    expect(io.open).not.toHaveBeenCalled();
    for (const spy of io.prohibited) expect(spy).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
    expect(interval).not.toHaveBeenCalled();
    const addedModules = Object.keys(require.cache).filter(filename => !loadedBefore.has(filename));
    expect(addedModules.some(filename => /(?:^|[\\/])(?:electron|main\.js|window\.js|window-manager\.js)(?:[\\/]|$)/.test(filename))).toBe(false);
  });

  it("bc02 strict path/token refusal precedes I/O", async () => {
    const { createReadController } = load("bc02");
    const io = installFs([fakeHandle(), fakeHandle()]);
    const c = make(createReadController);
    for (const input of [undefined, 1, "", "a\0b", "relative", String.raw`C:relative`, String.raw`\root-relative`, String.raw`\\?\C:\device`, String.raw`\\.\C:\device`]) await rejectCode(c.open(input, c.getGeneration()), "INVALID_REQUEST");
    for (const token of [undefined, 1, "token", null, () => {}]) await rejectCode(c.open(FILE, token), "INVALID_REQUEST");
    const touched = vi.fn(() => { throw new Error("token inspected"); });
    const foreign = new Proxy({}, { ownKeys: touched, getPrototypeOf: touched, get: touched });
    for (const token of [{}, [], foreign]) await rejectCode(c.open(FILE, token), "DOCUMENT_STALE");
    const old = c.getGeneration();
    await c.invalidate();
    await rejectCode(c.open(FILE, old), "DOCUMENT_STALE");
    expect(touched).not.toHaveBeenCalled();
    expect(io.open).not.toHaveBeenCalled();
    await open(c);
    await open(c, String.raw`\\server\share\fixture.bin`);
    c.stopNewWork();
    await rejectCode(c.open(null, null), "SHUTTING_DOWN");
    await rejectCode(c.read(null, null, null), "SHUTTING_DOWN");
    throwCode(() => c.getPath(null), "SHUTTING_DOWN");
    await c.close(999999);
    await c.invalidate();
  });

  it("bc03 strict IDs/ranges and unknown leases", async () => {
    const { createReadController } = load("bc03");
    const handle = fakeHandle(); installFs([handle]);
    const c = make(createReadController);
    for (const id of [0, -1, 1.5, "1", NaN, Infinity]) {
      await rejectCode(c.read(id, 0, 1), "INVALID_REQUEST");
      await rejectCode(c.close(id), "INVALID_REQUEST");
      throwCode(() => c.getPath(id), "INVALID_REQUEST");
    }
    await expect(c.close(999999)).resolves.toBeUndefined();
    await rejectCode(c.read(999999, 0, 1), "DOCUMENT_CLOSED");
    throwCode(() => c.getPath(999999), "DOCUMENT_CLOSED");
    const d = await open(c); const before = handle.calls.length;
    for (const [begin, end] of [[-1, 1], [1, 1], [2, 1], [0, 13], [0.5, 2], [0, 1.5], ["0", 1], [0, "1"], [NaN, 2], [0, Infinity]]) await rejectCode(c.read(d.id, begin, end), "INVALID_REQUEST");
    expect(handle.calls).toHaveLength(before);
  });

  it("bc04 owned one-open descriptor and exact initial bytes", async () => {
    const { createReadController } = load("bc04");
    const handle = fakeHandle(); const io = installFs([handle]);
    const c = make(createReadController); const d = await open(c);
    expect(Object.keys(d).sort()).toEqual(["id", "path", "length", "initialData"].sort());
    expect(Number.isSafeInteger(d.id) && d.id > 0).toBe(true);
    expect(d.path).toBe(path.resolve(FILE)); expect(d.length).toBe(12);
    assertExactView(d.initialData, A);
    expect(io.open).toHaveBeenCalledExactlyOnceWith(path.resolve(FILE), "r");
    for (const call of handle.calls.filter(x => x.op === "stat")) expect(call.options).toEqual({ bigint: true });
    for (const spy of io.prohibited) expect(spy).not.toHaveBeenCalled();
  });

  it("bc05 partial positional reads fill an exact view", async () => {
    const { createReadController } = load("bc05");
    const handle = fakeHandle(); installFs([handle]); const c = make(createReadController); const d = await open(c);
    let part = 0;
    handle.readHook = async (out, offset, length, position) => {
      const bytes = part++ === 0 ? [65] : [66, 67]; out.set(bytes, offset);
      return { bytesRead: bytes.length, buffer: new Uint8Array([0]) };
    };
    handle.calls.length = 0;
    const result = await c.read(d.id, 9, 12);
    expect(Object.keys(result).sort()).toEqual(["begin", "data"]);
    expect(result.begin).toBe(9); assertExactView(result.data, [65, 66, 67]);
    expect(handle.calls.filter(x => x.op === "read").map(({ offset, length, position }) => ({ offset, length, position }))).toEqual([{ offset: 0, length: 3, position: 9 }, { offset: 1, length: 2, position: 10 }]);
    expect(() => assertExactView(new Uint8Array([66, 66, 67]), [65, 66, 67])).toThrow();
    expect(() => assertExactView(new Uint8Array(new ArrayBuffer(8), 0, 3), [0, 0, 0])).toThrow();
  });

  it("bc06 one-MiB edge and oversize are distinct", async () => {
    const { createReadController } = load("bc06");
    const handle = fakeHandle(new Uint8Array(1048577).fill(0xA5)); installFs([handle]); const c = make(createReadController); const d = await open(c);
    expect(d.length).toBe(1048577); expect(d.initialData.length).toBe(CHUNK);
    for (const byte of d.initialData) expect(byte).toBe(0xA5);
    const full = await c.read(d.id, 0, CHUNK); expect(full.data.length).toBe(CHUNK);
    for (const byte of full.data) expect(byte).toBe(0xA5);
    const calls = handle.calls.length;
    await rejectCode(c.read(d.id, 0, 1048577), "INVALID_REQUEST"); expect(handle.calls).toHaveLength(calls);
    assertExactView((await c.read(d.id, 1048576, 1048577)).data, [0xA5]);
    expect(handle.calls.filter(x => x.op === "read").every(x => x.out.length <= CHUNK)).toBe(true);
  });

  it("bc07 stat validation rejects bad files safely", async () => {
    const { createReadController } = load("bc07");
    const bad = [h => { h.regular = false; }, h => { h.metadata.size = 0n; }, h => { h.metadata.size = 9007199254740992n; }];
    for (const key of ["dev", "ino", "size", "mtimeNs", "ctimeNs"]) {
      bad.push(h => { delete h.metadata[key]; }); bad.push(h => { h.metadata[key] = 1; });
    }
    const handles = bad.map(change => { const h = fakeHandle(); change(h); return h; });
    const good = fakeHandle(); good.metadata.mtimeNs = -1n; good.metadata.ctimeNs = -2n;
    installFs([...handles, good]); const c = make(createReadController);
    for (const handle of handles) { await rejectCode(open(c), "FILE_INVALID"); expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1); }
    expect((await open(c)).length).toBe(12);
  });

  it("bc08 every metadata field detects mutation", async () => {
    const { createReadController } = load("bc08"); const io = installFs([]); const c = make(createReadController);
    for (const phase of ["initial-before", "initial-after", "range-before", "range-after"]) {
      for (const key of ["dev", "ino", "size", "mtimeNs", "ctimeNs"]) {
        const handle = fakeHandle(); io.queue.push(handle); let d;
        if (phase.startsWith("range")) d = await open(c);
        let statCount = 0;
        handle.statHook = async () => {
          const snapshot = handle.snapshot(); statCount++;
          const mutateAt = phase === "initial-before" ? 2 : phase === "initial-after" ? 3 : phase === "range-before" ? 1 : 2;
          if (statCount >= mutateAt) snapshot[key] += 1n;
          return snapshot;
        };
        await rejectCode(d ? c.read(d.id, 9, 12) : open(c), "FILE_CHANGED");
        expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1);
        if (d) throwCode(() => c.getPath(d.id), "DOCUMENT_CLOSED");
      }
    }
    io.queue.push(fakeHandle()); assertBytes((await open(c)).initialData, A);
  });

  it("bc09 EOF and native errors are branded", async () => {
    const { createReadController } = load("bc09"); const io = installFs([]); const c = make(createReadController);
    for (const [value, expected] of [[0, "FILE_EOF"], [undefined, "FILE_IO"], [0.5, "FILE_IO"], [-1, "FILE_IO"], [13, "FILE_IO"]]) {
      const handle = fakeHandle(); handle.readHook = async () => ({ bytesRead: value }); io.queue.push(handle); await rejectCode(open(c), expected);
    }
    for (const phase of ["open", "stat", "read", "close"]) {
      for (const [code, expected] of [["ENOENT", "FILE_NOT_FOUND"], ["EACCES", "FILE_ACCESS_DENIED"], ["EPERM", "FILE_ACCESS_DENIED"], ["EIO", "FILE_IO"]]) {
        const handle = fakeHandle();
        if (phase === "open") io.queue.push(() => { throw nativeError(code); });
        else io.queue.push(handle);
        if (phase === "stat") handle.statHook = async () => { throw nativeError(code); };
        if (phase === "read") handle.readHook = async () => { throw nativeError(code); };
        if (phase === "close") {
          const d = await open(c); handle.closeHook = async () => { throw nativeError(code); };
          expectedCleanupErrors.add(`BUSINESS_${expected}`); await rejectCode(c.close(d.id), expected);
        } else await rejectCode(open(c), expected);
      }
    }
  });

  it("bc10 global queue spans two controllers", async () => {
    const { createReadController } = load("bc10");
    const hA = fakeHandle(); const hB = fakeHandle(); const entered = deferred(); const release = deferred();
    const io = installFs([async () => { entered.resolve(); await release.promise; return hA; }, hB]);
    const a = make(createReadController); const b = make(createReadController);
    const pa = open(a); await entered.promise; const pb = open(b, FILE_B);
    await Promise.resolve(); await Promise.resolve(); expect(io.open).toHaveBeenCalledTimes(1);
    expect(hB.calls).toHaveLength(0); release.resolve(); await pa; await pb;
    for (const phase of ["stat", "read"]) {
      const inFlight = deferred(); const proceed = deferred(); let active = 0;
      const OriginalUint8Array = globalThis.Uint8Array;
      const allocations = [];
      const allocationSpy = vi.spyOn(globalThis, "Uint8Array").mockImplementation(function (...args) {
        if (args[0] === 3) allocations.push(3);
        return Reflect.construct(OriginalUint8Array, args);
      });
      const original = hA[phase];
      hA[phase] = async (...args) => { active++; assertOneActive(active); inFlight.resolve(); await proceed.promise; const value = await original(...args); active--; return value; };
      // IDs come from the actual descriptors, never a private counter guess.
      const descriptorA = await pa; const descriptorB = await pb;
      const first = observe(a.read(descriptorA.id, 9, 12)); await inFlight.promise;
      const allocationsBeforeB = allocations.length;
      const before = hB.calls.length; const second = observe(b.read(descriptorB.id, 9, 12));
      await Promise.resolve(); await Promise.resolve(); expect(hB.calls).toHaveLength(before);
      expect(allocations).toHaveLength(allocationsBeforeB);
      proceed.resolve(); await first; await second;
      expect(allocations).toHaveLength(2);
      allocationSpy.mockRestore(); hA[phase] = original;
    }
    expect(() => assertOneActive(2)).toThrow();
  });

  it("bc11 IDs are module-global and never reused", async () => {
    const { createReadController } = load("bc11"); const io = installFs([]); const a = make(createReadController); const b = make(createReadController);
    io.queue.push(fakeHandle()); const first = await open(a); await a.close(first.id);
    let last = first.id;
    for (const phase of ["open", "stat", "read"]) {
      const bad = fakeHandle();
      if (phase === "open") io.queue.push(() => { throw nativeError("EIO"); });
      else { bad[`${phase}Hook`] = async () => { throw nativeError("EIO"); }; io.queue.push(bad); }
      await rejectCode(open(a), "FILE_IO"); io.queue.push(fakeHandle()); const next = await open(b); expect(next.id).toBeGreaterThan(last + 1); last = next.id;
    }
    await rejectCode(a.open('relative', a.getGeneration()), 'INVALID_REQUEST');
    io.queue.push(fakeHandle());
    let next = await open(a);
    expect(next.id).toBe(last + 1);
    last = next.id;
    const old = a.getGeneration();
    await a.invalidate();
    for (const token of [old, b.getGeneration(), {}]) {
      const opensBefore = io.open.mock.calls.length;
      await rejectCode(a.open(FILE, token), 'DOCUMENT_STALE');
      expect(io.open).toHaveBeenCalledTimes(opensBefore);
      io.queue.push(fakeHandle());
      next = await open(a);
      expect(next.id).toBe(last + 1);
      last = next.id;
    }
  });

  it("bc12 private allocator exhaustion guard is semantic STATIC evidence", async () => {
    load("bc12");
    const ts = await import("typescript");
    const text = fs.readFileSync(modulePath, "utf8");
    assertAllocatorSource(ts, text);
    const prefix = "let nextDocumentId = 1;\n";
    const guard = "if (!Number.isSafeInteger(nextDocumentId)) throw Object.assign(new Error('BUSINESS_ID_EXHAUSTED'), { code: 'BUSINESS_ID_EXHAUSTED' });";
    const suffix = "\nfunction open(path,generation) { validate(path,generation); const id=reserveDocumentId(); return enqueue(() => id); }\nmodule.exports={createReadController};";
    const fixture = body => `${prefix}function reserveDocumentId(){${body}}${suffix}`;
    const wrong = [fixture("return nextDocumentId++;"), fixture(guard.replace("!Number", "Number") + "return nextDocumentId++;"), fixture("nextDocumentId++;" + guard + "return nextDocumentId;"), fixture(guard + "return nextDocumentId++;") + "\nnextDocumentId = 1;", fixture(guard.replace("code: 'BUSINESS_ID_EXHAUSTED'", "code: 'WRONG'") + "return nextDocumentId++;")];
    assertAllocatorSource(ts, fixture(guard + "return nextDocumentId++;"));
    assertAllocatorSource(ts, fixture(guard.replaceAll("'", '"') + "/* harmless */ return nextDocumentId ++;"));
    for (const variant of wrong) expect(() => assertAllocatorSource(ts, variant)).toThrow();
  });

  it("bc13 pending open then normal close stays owned", async () => {
    const { createReadController } = load("bc13"); const late = fakeHandle(); const entered = deferred(); const release = deferred();
    installFs([fakeHandle(), async () => { entered.resolve(); await release.promise; return late; }]); const c = make(createReadController);
    const seed = await open(c); const predicted = seed.id + 1;
    const opening = open(c); const rejection = rejectCode(opening, "DOCUMENT_CLOSED"); await entered.promise;
    const first = observe(c.close(predicted)); assertSamePromise(first, c.close(predicted));
    release.resolve(); await rejection; await first; expect(late.calls.filter(x => x.op === "close")).toHaveLength(1);
    expect(() => assertSamePromise(Promise.resolve(), Promise.resolve())).toThrow();
  });

  it("bc14 pending open then invalidate discards descriptor", async () => {
    const { createReadController } = load("bc14"); const handle = fakeHandle(); const entered = deferred(); const release = deferred();
    installFs([async () => { entered.resolve(); await release.promise; return handle; }]); const c = make(createReadController); const token = c.getGeneration();
    const result = open(c); let published = false; observe(result.then(() => { published = true; })); const refused = rejectCode(result, "DOCUMENT_STALE"); await entered.promise;
    let drained = false; const invalidation = observe(c.invalidate().then(() => { drained = true; })); expect(c.getGeneration()).not.toBe(token);
    await Promise.resolve(); expect(drained).toBe(false); release.resolve(); await refused; await invalidation;
    assertNoDescriptor({ published }); expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1);
    expect(() => assertNoDescriptor({ published: true })).toThrow();
  });

  it("bc15 pending open then shutdown drains once", async () => {
    const { createReadController } = load("bc15"); const handle = fakeHandle(); const entered = deferred(); const release = deferred();
    installFs([async () => { entered.resolve(); await release.promise; return handle; }]); const c = make(createReadController); const token = c.getGeneration();
    const result = open(c); const refused = rejectCode(result, "DOCUMENT_STALE"); await entered.promise;
    const shutdown = observe(c.shutdown()); assertSamePromise(shutdown, c.shutdown()); expect(c.getGeneration()).not.toBe(token);
    await rejectCode(c.open(FILE, token), "SHUTTING_DOWN"); await rejectCode(c.read(1, 0, 1), "SHUTTING_DOWN"); throwCode(() => c.getPath(1), "SHUTTING_DOWN");
    release.resolve(); await refused; await shutdown; expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1);
  });

  it("bc16 active read may finish before normal close", async () => {
    const { createReadController } = load("bc16"); const handle = fakeHandle(); installFs([handle]); const c = make(createReadController); const d = await open(c);
    const entered = deferred(); const release = deferred(); handle.readHook = async out => { entered.resolve(); await release.promise; out.set([65, 66, 67]); return { bytesRead: 3 }; };
    const reading = observe(c.read(d.id, 9, 12)); await entered.promise; const closing = observe(c.close(d.id)); assertSamePromise(closing, c.close(d.id)); throwCode(() => c.getPath(d.id), "DOCUMENT_CLOSED");
    expect(handle.calls.filter(x => x.op === "close")).toHaveLength(0); release.resolve(); assertExactView((await reading).data, [65, 66, 67]); await closing; expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1);
  });

  it("bc17 active read is stale after invalidation", async () => {
    const { createReadController } = load("bc17"); const handle = fakeHandle(); const io = installFs([handle]); const c = make(createReadController); const d = await open(c);
    const entered = deferred(); const release = deferred(); handle.readHook = async out => { entered.resolve(); await release.promise; out.set([65, 66, 67]); return { bytesRead: 3 }; };
    const reading = observe(c.read(d.id, 9, 12)); const refused = rejectCode(reading, "DOCUMENT_STALE"); await entered.promise; const invalidation = observe(c.invalidate()); release.resolve(); await refused; await invalidation;
    expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1); io.queue.push(fakeHandle()); assertBytes((await open(c)).initialData, A);
  });

  it("bc18 queued unstarted read rejects after close", async () => {
    const { createReadController } = load("bc18"); const handle = fakeHandle(); installFs([handle]); const c = make(createReadController); const d = await open(c);
    const entered = deferred(); const release = deferred(); handle.readHook = async out => { entered.resolve(); await release.promise; out.set([65, 66, 67]); return { bytesRead: 3 }; };
    const active = observe(c.read(d.id, 9, 12)); await entered.promise; const before = handle.calls.filter(x => x.op === "read").length;
    const queued = observe(c.read(d.id, 9, 12)); const refused = rejectCode(queued, "DOCUMENT_CLOSED"); const closed = observe(c.close(d.id)); release.resolve(); await active; await refused; await closed;
    expect(handle.calls.filter(x => x.op === "read")).toHaveLength(before);
  });

  it("bc19 closing one tab preserves other lease", async () => {
    const { createReadController } = load("bc19"); installFs([fakeHandle(), fakeHandle()]); const c = make(createReadController); const first = await open(c); const second = await open(c, FILE_B); const token = c.getGeneration();
    await c.close(first.id); expect(c.getGeneration()).toBe(token); expect(c.getPath(second.id)).toBe(path.resolve(FILE_B)); assertExactView((await c.read(second.id, 9, 12)).data, [65, 66, 67]);
  });

  it("bc20 successful close removes without tombstones", async () => {
    const { createReadController } = load("bc20"); const handle = fakeHandle(); installFs([handle, fakeHandle()]); const c = make(createReadController); const d = await open(c); await c.close(d.id); const count = handle.calls.length;
    await expect(c.close(d.id)).resolves.toBeUndefined(); expect(handle.calls).toHaveLength(count); await rejectCode(c.read(d.id, 9, 12), "DOCUMENT_CLOSED"); throwCode(() => c.getPath(d.id), "DOCUMENT_CLOSED"); expect((await open(c)).id).toBeGreaterThan(d.id);
  });

  it("bc21 failed close retains rejected identity and ownership", async () => {
    const { createReadController } = load("bc21"); const handle = fakeHandle(); installFs([handle]); const c = make(createReadController); const d = await open(c); handle.closeHook = async () => { throw nativeError("EIO"); }; expectedCleanupErrors.add("BUSINESS_FILE_IO");
    const first = observe(c.close(d.id)); await rejectCode(first, "FILE_IO"); assertSamePromise(first, c.close(d.id)); throwCode(() => c.getPath(d.id), "DOCUMENT_CLOSED"); await rejectCode(c.read(d.id, 9, 12), "DOCUMENT_CLOSED");
    await rejectCode(c.invalidate(), "FILE_IO"); await rejectCode(c.shutdown(), "FILE_IO"); assertSamePromise(first, c.close(d.id));
    assertFailedOwnership({ retained: c.close(d.id) === first, attempts: handle.calls.filter(x => x.op === "close").length }); expect(() => assertFailedOwnership({ retained: false, attempts: 1 })).toThrow();
  });

  it("bc22 primary failure survives secondary release failure", async () => {
    const { createReadController } = load("bc22"); const io = installFs([]);
    for (const primary of ["FILE_CHANGED", "FILE_NOT_FOUND"]) {
      const handle = fakeHandle(); io.queue.push(handle); const c = make(createReadController); const d = await open(c); handle.closeHook = async () => { throw nativeError("EACCES"); }; expectedCleanupErrors.add("BUSINESS_FILE_ACCESS_DENIED");
      if (primary === "FILE_CHANGED") handle.metadata.ctimeNs++;
      else handle.readHook = async () => { throw nativeError("ENOENT"); };
      await rejectCode(c.read(d.id, 9, 12), primary); const close = observe(c.close(d.id)); await rejectCode(close, "FILE_ACCESS_DENIED"); assertSamePromise(close, c.close(d.id)); expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1);
    }
  });

  it("bc23 all owned releases attempted before first failure", async () => {
    const { createReadController } = load("bc23"); const io = installFs([]);
    for (const method of ["invalidate", "shutdown"]) {
      const first = fakeHandle(); const second = fakeHandle(); const third = fakeHandle(); io.queue.push(first, second, third); const c = make(createReadController); const d1 = await open(c); const d2 = await open(c); await open(c);
      expect(d1.id).toBeLessThan(d2.id); const entered = deferred(); const release = deferred();
      first.closeHook = async () => { entered.resolve(); await release.promise; throw nativeError("EACCES"); };
      second.closeHook = async () => { throw nativeError("EIO"); };
      expectedCleanupErrors.add("BUSINESS_FILE_ACCESS_DENIED"); let settled = false; const result = observe(c[method]()); const refused = rejectCode(result, "FILE_ACCESS_DENIED"); observe(result.then(() => { settled = true; }, () => { settled = true; }));
      await entered.promise; await Promise.resolve(); expect(settled).toBe(false); release.resolve(); await refused;
      for (const handle of [first, second, third]) expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1);
      await rejectCode(c.shutdown(), "FILE_ACCESS_DENIED"); for (const handle of [first, second, third]) expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1);
    }
  });

  it("bc24 repeated shutdown remains identical on failure", async () => {
    const { createReadController } = load("bc24"); const handle = fakeHandle(); installFs([handle]); const c = make(createReadController); const d = await open(c); const entered = deferred(); const release = deferred();
    handle.closeHook = async () => { entered.resolve(); await release.promise; throw nativeError("EIO"); }; expectedCleanupErrors.add("BUSINESS_FILE_IO"); const shutdown = observe(c.shutdown()); const refused = rejectCode(shutdown, "FILE_IO"); assertSamePromise(shutdown, c.shutdown()); await entered.promise; release.resolve(); await refused; assertSamePromise(shutdown, c.shutdown());
    await rejectCode(c.close(d.id), "FILE_IO"); await rejectCode(c.invalidate(), "FILE_IO"); expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1);
  });

  it("bc25 own shutdown ignores unrelated future global tail", async () => {
    const { createReadController } = load("bc25"); const first = fakeHandle(); const second = fakeHandle(); const aEntered = deferred(); const aRelease = deferred(); const bEntered = deferred(); const bRelease = deferred();
    installFs([async () => { aEntered.resolve(); await aRelease.promise; return first; }, async () => { bEntered.resolve(); await bRelease.promise; return second; }]); const a = make(createReadController); const b = make(createReadController);
    const opening = open(a); const refused = rejectCode(opening, "DOCUMENT_STALE"); await aEntered.promise; const stopped = observe(a.shutdown()); const unrelated = open(b, FILE_B); aRelease.resolve();
    await refused; await stopped; expect(first.calls.filter(x => x.op === "close")).toHaveLength(1); await bEntered.promise; expect(second.calls).toHaveLength(0); bRelease.resolve(); await unrelated;
  });

  it("bc26 internal failure release cannot await its own queue", async () => {
    const { createReadController } = load("bc26"); const io = installFs([]);
    for (const phase of ["initial", "range"]) {
      const handle = fakeHandle(); io.queue.push(handle); const c = make(createReadController); let d;
      if (phase === "range") d = await open(c);
      const entered = deferred(); const release = deferred(); handle.readHook = async () => { throw nativeError("EIO"); }; handle.closeHook = async () => { entered.resolve(); await release.promise; handle.closed = true; };
      const result = d ? observe(c.read(d.id, 9, 12)) : open(c); const refused = rejectCode(result, "FILE_IO"); await entered.promise;
      expect(handle.calls.at(-1).op).toBe("close"); release.resolve(); await refused; expect(handle.closed).toBe(true); io.queue.push(fakeHandle()); await open(c);
    }
  });

  it("bc27 late generation responses never publish", async () => {
    const { createReadController } = load("bc27"); const io = installFs([]);
    for (const phase of ["initial", "range"]) {
      const handle = fakeHandle(); io.queue.push(handle); const c = make(createReadController); let d;
      if (phase === "range") d = await open(c);
      const entered = deferred(); const release = deferred(); let read = false;
      handle.readHook = async out => { out.set(phase === "range" ? [65, 66, 67] : A); read = true; return { bytesRead: out.length }; };
      handle.statHook = async () => { if (read) { entered.resolve(); await release.promise; } return handle.snapshot(); };
      const result = d ? observe(c.read(d.id, 9, 12)) : open(c); const refused = rejectCode(result, "DOCUMENT_STALE"); await entered.promise; const invalidated = observe(c.invalidate()); release.resolve(); await refused; await invalidated;
      expect(handle.calls.filter(x => x.op === "close")).toHaveLength(1); io.queue.push(fakeHandle()); assertBytes((await open(c)).initialData, A);
    }
  });

  it("bc28 no prohibited filesystem path is used", async () => {
    const { createReadController } = load("bc28"); const handle = fakeHandle(); const io = installFs([handle]); const c = make(createReadController); const d = await open(c); await c.read(d.id, 9, 12); await c.close(d.id);
    expect(io.open).toHaveBeenCalledExactlyOnceWith(path.resolve(FILE), "r"); for (const spy of io.prohibited) expect(spy).not.toHaveBeenCalled();
    for (const call of handle.calls.filter(x => x.op === "read")) { expect(call.out).toBeInstanceOf(Uint8Array); expect(call.out.byteLength).toBe(call.out.buffer.byteLength); }
    expect(handle.closed).toBe(true);
  });
});
