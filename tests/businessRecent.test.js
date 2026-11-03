import { describe, it, expect, vi, afterEach, afterAll } from "vitest";
import path from "node:path";
import { createRequire } from "node:module";

const cjsRequire = createRequire(import.meta.url);
const fs = cjsRequire("node:fs/promises");
const jsonStore = cjsRequire("../main/json-store.js");
const modulePath = path.resolve(import.meta.dirname, "../main/business/recent.js");
const parent = process.env.BUSINESS_RECENT_TEST_ROOT;
if (!parent || !path.isAbsolute(parent)) throw new Error("BUSINESS_RECENT_TEST_ROOT must be an owned absolute data root");
const real = Object.fromEntries(["readFile", "writeFile", "mkdir", "stat"].map(name => [name, fs[name].bind(fs)]));
const retained = [];
const stores = [];
let caseNumber = 0;

async function factory() {
  const loaded = Promise.resolve().then(() => cjsRequire(modulePath));
  await expect(loaded.then(module => module.createRecentStore)).resolves.toEqual(expect.any(Function));
  return (await loaded).createRecentStore;
}

async function fixture(label) {
  const root = path.resolve(parent, `${String(++caseNumber).padStart(3, "0")}-${label}`);
  await real.mkdir(root);
  retained.push(root);
  return { root, directory: path.join(root, "business"), target: path.join(root, "business", "recent.json"), A: path.join(root, "A.pdf"), B: path.join(root, "B.pdf"), C: path.join(root, "C.pdf") };
}

function openStore(create, root) {
  const store = create({ getDataPath: () => root });
  stores.push(store);
  return store;
}

async function seed(f, value) {
  await real.mkdir(f.directory);
  await real.writeFile(f.target, typeof value === "string" ? value : JSON.stringify(value), "utf8");
}

const disk = async f => JSON.parse(await real.readFile(f.target, "utf8"));
const bytes = f => real.readFile(f.target);

function observe() {
  const calls = [];
  for (const name of ["readFile", "mkdir", "writeFile", "rename", "stat", "lstat", "realpath"]) {
    const original = fs[name];
    vi.spyOn(fs, name).mockImplementation(function (...args) {
      calls.push({ name, args });
      return original.apply(fs, args);
    });
  }
  const original = jsonStore.writeJSON;
  vi.spyOn(jsonStore, "writeJSON").mockImplementation(function (...args) {
    calls.push({ name: "writeJSON", args });
    return original.apply(jsonStore, args);
  });
  return calls;
}

function assertOwnedIO(calls, f) {
  for (const call of calls) {
    const allowed = call.name === "mkdir" ? [f.directory] : call.name === "rename" ? [f.target + ".tmp", f.target] : [f.target, f.target + ".tmp"];
    expect(allowed).toContain(call.args[0]);
    if (call.name === "rename") expect(call.args[1]).toBe(f.target);
    expect(["stat", "lstat", "realpath"]).not.toContain(call.name);
  }
}

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function holdRead(f) {
  const entered = deferred();
  const release = deferred();
  const original = real.readFile;
  let count = 0;
  vi.spyOn(fs, "readFile").mockImplementation(async (...args) => {
    if (args[0] === f.target && ++count === 1) {
      entered.resolve();
      await release.promise;
    }
    return original.apply(fs, args);
  });
  return { entered: entered.promise, release: release.resolve, count: () => count };
}

const invalidPortableInputs = [undefined, 7, '', '\0', 'relative.pdf'];
const invalidWindowsInputs = [
  String.raw`C:relative.pdf`,
  String.raw`\relative.pdf`,
  String.raw`\\?\C:\example.pdf`,
  String.raw`\\.\example`,
];

afterEach(async () => {
  await Promise.all(stores.splice(0).map(store => store.close()));
  await jsonStore.whenWritesSettled();
  vi.restoreAllMocks();
});

afterAll(() => {
  console.log("BUSINESS_RECENT_RETAINED_CASES", JSON.stringify(retained));
});

describe("Business recent store retained contract", () => {
  it("r01 factory and import are inert", async () => {
    const f = await fixture("r01-inert");
    const calls = observe();
    const create = await factory();
    let returnedRoot = f.root;
    const getter = vi.fn(() => returnedRoot);
    const store = create({ getDataPath: getter });
    stores.push(store);
    expect(getter).toHaveBeenCalledTimes(1);
    expect(calls).toEqual([]);
    returnedRoot = path.join(f.root, "later-root");
    await expect(store.addRecent(f.A)).resolves.toEqual([f.A]);
    expect(getter).toHaveBeenCalledTimes(1);
    expect(await disk(f)).toEqual([f.A]);
    expect(calls.some(call => call.name === "writeJSON")).toBe(true);
    assertOwnedIO(calls, f);
  });

  it("r02 factory rejects invalid context/root synchronously", async () => {
    const create = await factory();
    for (const context of [undefined, null, {}, { getDataPath: 7 }]) {
      let error;
      try { create(context); } catch (caught) { error = caught; }
      expect(error).toBeInstanceOf(TypeError);
      expect(error.message).toBe("BUSINESS_RECENT_CONTEXT");
    }
    const invalidRoots = ["", "\0", "relative", ...(process.platform === "win32" ? [String.raw`C:relative.pdf`, String.raw`\relative.pdf`] : [])];
    for (const root of invalidRoots) {
      let error;
      try { create({ getDataPath: () => root }); } catch (caught) { error = caught; }
      expect(error).toBeInstanceOf(TypeError);
      expect(error.message).toBe("BUSINESS_RECENT_DATA_PATH");
    }
    const f = await fixture("r02-valid");
    const calls = observe();
    expect(openStore(create, f.root)).toHaveProperty("getRecent", expect.any(Function));
    expect(calls).toEqual([]);
  });

  it("r03 missing read and remove do not create", async () => {
    const create = await factory();
    const f = await fixture("r03-missing");
    const store = openStore(create, f.root);
    const calls = observe();
    await expect(store.getRecent()).resolves.toEqual([]);
    await expect(store.removeRecent(f.A)).resolves.toEqual([]);
    expect(calls.map(call => call.name)).toEqual(["readFile", "readFile"]);
    assertOwnedIO(calls, f);
    await expect(real.stat(f.directory)).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("r04 add/re-add/removal preserve order", async () => {
    const create = await factory();
    const f = await fixture("r04-order");
    const store = openStore(create, f.root);
    const calls = observe();
    for (const [method, value, expected] of [["addRecent", f.A, [f.A]], ["addRecent", f.B, [f.B, f.A]], ["addRecent", f.A, [f.A, f.B]], ["removeRecent", f.B, [f.A]]]) {
      await expect(store[method](value)).resolves.toEqual(expected);
      expect(await disk(f)).toEqual(expected);
    }
    const writes = calls.filter(call => call.name === "writeJSON").length;
    const mkdirs = calls.filter(call => call.name === "mkdir").length;
    await expect(store.removeRecent(f.C)).resolves.toEqual([f.A]);
    expect(calls.filter(call => call.name === "writeJSON")).toHaveLength(writes);
    expect(calls.filter(call => call.name === "mkdir")).toHaveLength(mkdirs);
    expect(writes).toBe(4);
    assertOwnedIO(calls, f);
  });

  it("r05 Windows comparison retains latest spelling", async () => {
    const create = await factory();
    const f = await fixture("r05-case");
    const store = openStore(create, f.root);
    const variant = path.join(f.root, "a.PDF");
    const calls = observe();
    await store.addRecent(f.A);
    await expect(store.addRecent(variant)).resolves.toEqual(process.platform === "win32" ? [variant] : [variant, f.A]);
    if (process.platform === "win32") {
      const unc = String.raw`\\server\share\A.pdf`;
      await expect(store.addRecent(unc)).resolves.toEqual([path.resolve(unc), variant]);
      expect(await disk(f)).toEqual([path.resolve(unc), variant]);
    } else expect(await disk(f)).toEqual([variant, f.A]);
    assertOwnedIO(calls, f);
  });

  it("r06 cap exactly20", async () => {
    const create = await factory();
    const f = await fixture("r06-cap");
    const store = openStore(create, f.root);
    const entries = Array.from({ length: 21 }, (_, index) => path.join(f.root, `p${String(index).padStart(2, "0")}.pdf`));
    let result;
    for (const entry of entries) result = await store.addRecent(entry);
    const expected = entries.slice(1).reverse();
    expect(result).toEqual(expected);
    expect(result).toHaveLength(20);
    expect(result).not.toContain(entries[0]);
    expect(await disk(f)).toEqual(expected);
    const invalid = await fixture("r06-stored21");
    await seed(invalid, entries);
    const prior = await bytes(invalid);
    const invalidStore = openStore(create, invalid.root);
    const calls = observe();
    await expect(invalidStore.getRecent()).rejects.toMatchObject({ code: "BUSINESS_RECENT_INVALID_DATA", message: "BUSINESS_RECENT_INVALID_DATA" });
    expect(await bytes(invalid)).toEqual(prior);
    expect(calls.map(call => call.name)).toEqual(["readFile"]);
  });

  it("r07 strict corruption refusal", async () => {
    const create = await factory();
    const anchor = path.resolve(parent, "A.pdf");
    const invalid = ["{", "{}", "null", JSON.stringify([7]), JSON.stringify(["\0"]), JSON.stringify(["relative.pdf"]), JSON.stringify([path.dirname(anchor) + path.sep + "." + path.sep + "A.pdf"]), JSON.stringify([anchor, anchor]), JSON.stringify(Array.from({ length: 21 }, (_, index) => path.resolve(parent, `p${index}.pdf`)))];
    if (process.platform === "win32") invalid.push(JSON.stringify([anchor, anchor.toUpperCase()]));
    for (const [index, content] of invalid.entries()) {
      const f = await fixture(`r07-corrupt-${index}`);
      await seed(f, content);
      const prior = await bytes(f);
      const store = openStore(create, f.root);
      const calls = observe();
      for (const operation of [() => store.getRecent(), () => store.addRecent(f.B), () => store.removeRecent(f.A)]) {
        await expect(operation()).rejects.toMatchObject({ code: "BUSINESS_RECENT_INVALID_DATA", message: "BUSINESS_RECENT_INVALID_DATA" });
      }
      expect(calls.map(call => call.name)).toEqual(["readFile", "readFile", "readFile"]);
      expect(await bytes(f)).toEqual(prior);
      await store.close();
      vi.restoreAllMocks();
    }
    const valid = await fixture("r07-valid-empty");
    await seed(valid, []);
    await expect(openStore(create, valid.root).getRecent()).resolves.toEqual([]);
  });

  it("r08 native read error is observable", async () => {
    const create = await factory();
    const f = await fixture("r08-read-error");
    const store = openStore(create, f.root);
    const failure = Object.assign(new Error("owned read denied"), { code: "EACCES" });
    const calls = observe();
    const original = real.readFile;
    vi.spyOn(fs, "readFile").mockImplementation((...args) => args[0] === f.target ? Promise.reject(failure) : original.apply(fs, args));
    await expect(store.getRecent()).rejects.toBe(failure);
    expect(calls.some(call => call.name === "mkdir" || call.name === "writeJSON")).toBe(false);
    vi.restoreAllMocks();
    await expect(store.getRecent()).resolves.toEqual([]);
  });

  it("r09 lexical input only", async () => {
    const create = await factory();
    const f = await fixture("r09-inputs");
    await seed(f, [f.A]);
    const store = openStore(create, f.root);
    const invalid = [...invalidPortableInputs, ...(process.platform === "win32" ? invalidWindowsInputs : [])];
    for (const method of ["addRecent", "removeRecent"]) {
      for (const value of invalid) {
        const prior = await bytes(f);
        const calls = observe();
        let result;
        expect(() => { result = store[method](value); }).not.toThrow();
        expect(result).toBeInstanceOf(Promise);
        await expect(result).rejects.toBeInstanceOf(Error);
        expect(calls).toEqual([]);
        expect(await bytes(f)).toEqual(prior);
        vi.restoreAllMocks();
      }
    }
    const calls = observe();
    const nonPdf = path.resolve(f.root, "absent", "..", "missing.txt");
    await expect(store.addRecent(nonPdf)).resolves.toEqual([nonPdf, f.A]);
    await expect(store.removeRecent(nonPdf)).resolves.toEqual([f.A]);
    if (process.platform === "win32") {
      const unc = path.resolve(String.raw`\\server\share\A.pdf`);
      await expect(store.addRecent(unc)).resolves.toEqual([unc, f.A]);
      await expect(store.removeRecent(unc)).resolves.toEqual([f.A]);
    }
    expect(await disk(f)).toEqual([f.A]);
    assertOwnedIO(calls, f);
  });

  it("r10 entire transactions and reads ordered", async () => {
    const create = await factory();
    const f = await fixture("r10-queue");
    const store = openStore(create, f.root);
    const calls = observe();
    const gate = holdRead(f);
    const operations = [store.addRecent(f.A), store.addRecent(f.B), store.removeRecent(f.A), store.getRecent()];
    try {
      await gate.entered;
      expect(gate.count()).toBe(1);
      expect(calls).toEqual([]);
    } finally { gate.release(); }
    await expect(Promise.all(operations)).resolves.toEqual([[f.A], [f.B, f.A], [f.B], [f.B]]);
    expect(await disk(f)).toEqual([f.B]);
    assertOwnedIO(calls, f);
  });

  it("r11 failed write does not publish success", async () => {
    const create = await factory();
    const f = await fixture("r11-write-failure");
    const store = openStore(create, f.root);
    const failure = Object.assign(new Error("owned write failed"), { code: "EIO" });
    const original = jsonStore.writeJSON;
    let failed = false;
    vi.spyOn(jsonStore, "writeJSON").mockImplementation((...args) => {
      if (args[0] === f.target && !failed) { failed = true; return Promise.reject(failure); }
      return original.apply(jsonStore, args);
    });
    await expect(store.addRecent(f.A)).rejects.toBe(failure);
    await expect(store.addRecent(f.B)).resolves.toEqual([f.B]);
    expect(await disk(f)).toEqual([f.B]);
  });

  it("r12 failed mkdir is observable and recoverable", async () => {
    const create = await factory();
    const f = await fixture("r12-mkdir-failure");
    const store = openStore(create, f.root);
    const failure = Object.assign(new Error("owned mkdir failed"), { code: "EACCES" });
    const original = fs.mkdir;
    let failed = false;
    vi.spyOn(fs, "mkdir").mockImplementation((...args) => {
      if (args[0] === f.directory && !failed) { failed = true; return Promise.reject(failure); }
      return original.apply(fs, args);
    });
    await expect(store.addRecent(f.A)).rejects.toBe(failure);
    await expect(store.addRecent(f.B)).resolves.toEqual([f.B]);
    expect(await disk(f)).toEqual([f.B]);
  });

  it("r13 returns are defensive and disk is authoritative", async () => {
    const create = await factory();
    const f = await fixture("r13-defensive");
    const store = openStore(create, f.root);
    const added = await store.addRecent(f.A);
    added.push(f.B);
    const read = await store.getRecent();
    expect(read).toEqual([f.A]);
    read.splice(0);
    const removed = await store.removeRecent(f.B);
    expect(removed).toEqual([f.A]);
    removed[0] = f.C;
    await expect(store.getRecent()).resolves.toEqual([f.A]);
    await real.writeFile(f.target, JSON.stringify([f.C]), "utf8");
    await expect(store.getRecent()).resolves.toEqual([f.C]);
    expect(await disk(f)).toEqual([f.C]);
  });

  it("r14 close drains accepted calls", async () => {
    const create = await factory();
    const f = await fixture("r14-close");
    const store = openStore(create, f.root);
    const calls = observe();
    const gate = holdRead(f);
    const accepted = [store.addRecent(f.A), store.addRecent(f.B), store.getRecent()];
    await gate.entered;
    const closing = store.close();
    expect(store.close()).toBe(closing);
    try {
      const before = calls.length;
      for (const operation of [() => store.getRecent(), () => store.addRecent(f.C), () => store.removeRecent(f.A)]) {
        const result = operation();
        expect(result).toBeInstanceOf(Promise);
        await expect(result).rejects.toMatchObject({ code: "BUSINESS_RECENT_CLOSED", message: "BUSINESS_RECENT_CLOSED" });
      }
      expect(calls).toHaveLength(before);
      expect(gate.count()).toBe(1);
    } finally { gate.release(); }
    await expect(Promise.all(accepted)).resolves.toEqual([[f.A], [f.B, f.A], [f.B, f.A]]);
    await expect(closing).resolves.toBeUndefined();
    expect(store.close()).toBe(closing);
    expect(await disk(f)).toEqual([f.B, f.A]);
    assertOwnedIO(calls, f);
  });

  it("r15 close settles failures without hiding them", async () => {
    const create = await factory();
    const f = await fixture("r15-close-failure");
    const store = openStore(create, f.root);
    const failure = Object.assign(new Error("owned write rejected"), { code: "EIO" });
    const original = jsonStore.writeJSON;
    vi.spyOn(jsonStore, "writeJSON").mockImplementation((...args) => args[0] === f.target ? Promise.reject(failure) : original.apply(jsonStore, args));
    const accepted = store.addRecent(f.A);
    const rejection = expect(accepted).rejects.toBe(failure);
    const closing = store.close();
    expect(store.close()).toBe(closing);
    await rejection;
    await expect(closing).resolves.toBeUndefined();
    expect(store.close()).toBe(closing);
    await expect(real.stat(f.target)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
