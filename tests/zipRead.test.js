// DEPS-AUDIT-1 (C2): unit tests of main/zip-read.js (new code, not positive controls).
import { describe, it, expect, afterEach, vi } from "vitest";

const zlib = require("zlib");
const AdmZip = require("adm-zip");
const constants = require("../main/constants");
const { createEntryReader } = require("../main/zip-read.js");

const savedEntry = constants.ZIP_ENTRY_MAX_BYTES;
const savedOp = constants.ZIP_OPERATION_MAX_BYTES;

afterEach(() => {
  constants.ZIP_ENTRY_MAX_BYTES = savedEntry;
  constants.ZIP_OPERATION_MAX_BYTES = savedOp;
  vi.restoreAllMocks();
});

/** Zip buffer of { name: Buffer | { data, stored } }; `declared` rewrites the size fields (lying header). */
function buildZip(files, declared) {
  const zip = new AdmZip();
  for (const [name, spec] of Object.entries(files)) {
    const data = Buffer.isBuffer(spec) ? spec : spec.data;
    zip.addFile(name, data);
    if (spec.stored) zip.getEntry(name).header.method = 0;
  }
  const buf = zip.toBuffer();
  if (declared !== undefined) {
    for (let i = 0; i + 4 <= buf.length; i++) {
      if (buf[i] !== 0x50 || buf[i + 1] !== 0x4b) continue;
      if (buf[i + 2] === 1 && buf[i + 3] === 2) buf.writeUInt32LE(declared, i + 24); // central header
      if (buf[i + 2] === 3 && buf[i + 3] === 4) buf.writeUInt32LE(declared, i + 22); // local header
    }
  }
  return buf;
}

function spies(entry) {
  return {
    getData: vi.spyOn(entry, "getData"),
    compressed: vi.spyOn(entry, "getCompressedData"),
    inflate: vi.spyOn(zlib, "inflateRawSync"),
  };
}

const eightK = () => Buffer.alloc(8192, 0x61);

describe("createEntryReader", () => {
  it("(g) declared size over the per-entry cap is rejected without allocating", () => {
    const entry = new AdmZip(buildZip({ "a.txt": eightK() }, 0xfffffff0)).getEntry("a.txt");
    const s = spies(entry);
    let err;
    try { createEntryReader()(entry); } catch (e) { err = e; }
    expect(err && err.code).toBe("ZIP_ENTRY_TOO_LARGE");
    expect(s.getData).toHaveBeenCalledTimes(0);
    expect(s.compressed).toHaveBeenCalledTimes(0);
    expect(s.inflate).toHaveBeenCalledTimes(0);
  });

  it("(h) declared size over the per-operation cap is rejected without allocating", () => {
    constants.ZIP_OPERATION_MAX_BYTES = 4096;
    const zip = new AdmZip(buildZip({ "a.txt": Buffer.alloc(3072, 0x61), "b.txt": Buffer.alloc(3072, 0x62) }));
    const a = zip.getEntry("a.txt");
    const b = zip.getEntry("b.txt");
    const sa = spies(a);
    const sb = spies(b);
    const readEntry = createEntryReader();
    expect(readEntry(a).length).toBe(3072);
    let err;
    try { readEntry(b); } catch (e) { err = e; }
    expect(err && err.code).toBe("ZIP_ENTRY_TOO_LARGE");
    expect(sa.getData).toHaveBeenCalledTimes(0);
    expect(sb.getData).toHaveBeenCalledTimes(0);
    expect(sa.compressed.mock.calls.length + sb.compressed.mock.calls.length).toBe(1);
    expect(sb.compressed).toHaveBeenCalledTimes(0);
    expect(sa.inflate).toHaveBeenCalledTimes(1); // spies share zlib.inflateRawSync: one call, for the first entry
  });

  it("(i) actual size over the cap is rejected when the header lies small", () => {
    constants.ZIP_ENTRY_MAX_BYTES = 4096;
    const entry = new AdmZip(buildZip({ "a.txt": eightK() }, 0)).getEntry("a.txt");
    const s = spies(entry);
    let err;
    try { createEntryReader()(entry); } catch (e) { err = e; }
    expect(err && err.code).toBe("ZIP_ENTRY_TOO_LARGE");
    expect(s.inflate).toHaveBeenCalledTimes(1);
    expect(s.inflate.mock.calls[0][1]).toEqual({ maxOutputLength: 4096 });
  });

  it("(j) a small lying header under the cap still reads correctly", () => {
    const entry = new AdmZip(buildZip({ "a.txt": eightK() }, 0)).getEntry("a.txt");
    const out = createEntryReader()(entry);
    expect(out.length).toBe(8192);
    expect(out.equals(eightK())).toBe(true);
  });

  it("(k) a stored entry over the cap is rejected before its bytes are taken", () => {
    constants.ZIP_ENTRY_MAX_BYTES = 4096;
    const entry = new AdmZip(buildZip({ "a.txt": { data: eightK(), stored: true } })).getEntry("a.txt");
    expect(entry.header.method).toBe(0);
    const s = spies(entry);
    let err;
    try { createEntryReader()(entry); } catch (e) { err = e; }
    expect(err && err.code).toBe("ZIP_ENTRY_TOO_LARGE");
    expect(s.compressed).toHaveBeenCalledTimes(0);
  });

  it("(n) a stored entry whose header lies small is rejected on its real size, without getData", () => {
    constants.ZIP_ENTRY_MAX_BYTES = 4096;
    const entry = new AdmZip(buildZip({ "a.txt": { data: eightK(), stored: true } }, 16)).getEntry("a.txt");
    expect(entry.header.method).toBe(0);
    expect(entry.header.size).toBe(16);
    const s = spies(entry);
    let err;
    try { createEntryReader()(entry); } catch (e) { err = e; }
    expect(err && err.code).toBe("ZIP_ENTRY_TOO_LARGE");
    expect(s.compressed).toHaveBeenCalledTimes(1);
    expect(s.getData).toHaveBeenCalledTimes(0);
  });

  it("(l) a corrupted stored entry fails the CRC check", () => {
    const buf = buildZip({ "a.txt": { data: Buffer.from("hello world"), stored: true } });
    const at = buf.indexOf(Buffer.from("hello world"));
    expect(at).toBeGreaterThan(0);
    buf[at] ^= 0xff;
    const entry = new AdmZip(buf).getEntry("a.txt");
    expect(() => createEntryReader()(entry)).toThrow(/CRC mismatch/);
  });

  it("(m) a directory entry reads as an empty buffer", () => {
    const zip = new AdmZip();
    zip.addFile("dir/", Buffer.alloc(0));
    const entry = new AdmZip(zip.toBuffer()).getEntries().find((e) => e.isDirectory);
    expect(entry).toBeTruthy();
    expect(createEntryReader()(entry).length).toBe(0);
  });
});
