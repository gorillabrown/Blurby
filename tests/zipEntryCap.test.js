// DEPS-AUDIT-1 (C1): every EPUB entry read in main/ is capped, declared and inflated.
// Real EPUBs are built with adm-zip under os.tmpdir() and parsed by the real parsers.
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

const os = require("os");
const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");
const constants = require("../main/constants");
const { extractContent, extractEpubCover, extractEpubMetadata, countWords } = require("../main/file-parsers.js");
const { extractWords } = require("../main/epub-word-extractor.js");
const { validateEpub } = require("../main/epub-converter.js");

const USER_ERROR = "Could not read this file — it may be corrupted or in an unsupported format.";
const LOW_CAP = 4096;

let tmp;
let savedCap;

beforeAll(() => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), "zip-entry-cap-"));
  savedCap = constants.ZIP_ENTRY_MAX_BYTES;
});

afterAll(() => {
  constants.ZIP_ENTRY_MAX_BYTES = savedCap;
  fs.rmSync(tmp, { recursive: true, force: true });
});

let fileCounter = 0;
function buildEpub({ chapterBytes = 1024, coverBytes = 1024, opfPadBytes = 0 } = {}) {
  const zip = new AdmZip();
  zip.addFile("mimetype", Buffer.from("application/epub+zip"));
  zip.getEntry("mimetype").header.method = 0; // STORED, as buildEpubZip does
  zip.addFile("META-INF/container.xml", Buffer.from(
    `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">` +
    `<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`));
  const pad = opfPadBytes > 0 ? `<!--${"x".repeat(opfPadBytes)}-->` : "";
  zip.addFile("OEBPS/content.opf", Buffer.from(
    `<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0">` +
    `<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>Bomb</dc:title><dc:creator>Tester</dc:creator></metadata>` +
    `<manifest><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/>` +
    `<item id="cover" href="cover.jpg" media-type="image/jpeg"/></manifest>` +
    `<spine><itemref idref="c1"/></spine>${pad}</package>`));
  const words = "word ".repeat(Math.ceil(chapterBytes / 5));
  zip.addFile("OEBPS/c1.xhtml", Buffer.from(
    `<html xmlns="http://www.w3.org/1999/xhtml"><body><p>${words}</p></body></html>`));
  zip.addFile("OEBPS/cover.jpg", Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(coverBytes)]));
  const file = path.join(tmp, `book-${fileCounter++}.epub`);
  zip.writeZip(file);
  return file;
}

describe("EPUB entry caps (cap lowered to 4096)", () => {
  beforeAll(() => { constants.ZIP_ENTRY_MAX_BYTES = LOW_CAP; });
  afterAll(() => { constants.ZIP_ENTRY_MAX_BYTES = savedCap; });

  it("(a) extractWords rejects an over-cap spine document", async () => {
    await expect(extractWords(buildEpub({ chapterBytes: 8192 }))).rejects.toThrow(/too large/);
  });

  it("(b) extractContent returns the existing user error for an over-cap spine document", async () => {
    expect(await extractContent(buildEpub({ chapterBytes: 8192 }))).toEqual({ userError: USER_ERROR });
  });

  it("(c) extractEpubCover returns null and writes nothing for an over-cap cover", async () => {
    const dataPath = fs.mkdtempSync(path.join(tmp, "cover-c-"));
    expect(await extractEpubCover(buildEpub({ coverBytes: 8192 }), "doc1", dataPath)).toBeNull();
    const coversDir = path.join(dataPath, "covers");
    expect(fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : []).toEqual([]);
  });

  it("(d) extractEpubMetadata returns nulls for an over-cap OPF", async () => {
    expect(await extractEpubMetadata(buildEpub({ opfPadBytes: 8192 }))).toEqual({ title: null, author: null });
  });

  it("(e) validateEpub is invalid for an over-cap OPF", async () => {
    const r = await validateEpub(buildEpub({ opfPadBytes: 8192 }));
    expect(r.valid).toBe(false);
    expect(r.errors.join("\n")).toMatch(/too large/);
  });

  it("(f) control: entries under the same cap read as today", async () => {
    const file = buildEpub({ chapterBytes: 1024, coverBytes: 1024 });
    const w = await extractWords(file);
    expect(w.totalWords).toBeGreaterThan(0);
    const text = await extractContent(file);
    expect(typeof text).toBe("string");
    expect(text).toContain("word");
    const dataPath = fs.mkdtempSync(path.join(tmp, "cover-f-"));
    const cover = await extractEpubCover(file, "doc1", dataPath);
    expect(fs.statSync(cover).size).toBe(1028);
    expect((await extractEpubMetadata(file)).title).toBe("Bomb");
    expect(await validateEpub(file)).toEqual({ valid: true, errors: [] });
  });
});

describe("EPUB reads at the default caps", () => {
  it("(f2) control: the bundled sample reads exactly as characterized", async () => {
    const sample = path.join(__dirname, "..", "resources", "sample-meditations.epub");
    const text = await extractContent(sample);
    expect(typeof text).toBe("string");
    expect(text.length).toBe(486874);
    expect(countWords(text)).toBe(80479);
    const w = await extractWords(sample);
    expect(w.totalWords).toBe(80426);
    expect(w.sections.length).toBe(18);
    expect(await extractEpubMetadata(sample)).toEqual({ title: "Meditations", author: "Emperor of Rome Marcus Aurelius" });
    expect(await validateEpub(sample)).toEqual({ valid: true, errors: [] });
  });

  it("(f3) control: a large but legitimate EPUB still reads", async () => {
    const file = buildEpub({ chapterBytes: 8 * 1024 * 1024, coverBytes: 40 * 1024 * 1024 });
    const w = await extractWords(file);
    expect(w.totalWords).toBeGreaterThan(1_600_000);
    const text = await extractContent(file);
    expect(typeof text).toBe("string");
    const dataPath = fs.mkdtempSync(path.join(tmp, "cover-f3-"));
    const cover = await extractEpubCover(file, "doc1", dataPath);
    expect(fs.statSync(cover).size).toBe(41943044);
    expect(await validateEpub(file)).toEqual({ valid: true, errors: [] });
  }, 60_000);
});

// ZIP-READ-FOLLOWUPS-1 (N3): the per-operation cap, at parser level. extractWords reads container.xml, the OPF
// and the spine (not the cover), so the OPF is padded: every entry is under the entry cap, together they are over.
describe("operation cap, parser level", () => {
  let savedOpCap;
  beforeAll(() => { savedOpCap = constants.ZIP_OPERATION_MAX_BYTES; });
  afterAll(() => { constants.ZIP_OPERATION_MAX_BYTES = savedOpCap; });

  it("(q) extractWords rejects when its entries together pass the operation cap", async () => {
    const file = buildEpub({ chapterBytes: 4096, opfPadBytes: 2048 });
    expect(constants.ZIP_ENTRY_MAX_BYTES).toBe(savedCap);
    constants.ZIP_OPERATION_MAX_BYTES = 6144;
    try {
      await expect(extractWords(file)).rejects.toThrow(/too large/);
    } finally {
      constants.ZIP_OPERATION_MAX_BYTES = savedOpCap;
    }
    expect((await extractWords(file)).totalWords).toBeGreaterThan(0); // control: the default cap reads it
  });
});

// ZIP-READ-FOLLOWUPS-1 (N1): an archive over ZIP_FILE_MAX_BYTES is refused before adm-zip reads the whole file.
describe("archive size cap", () => {
  const OPEN_ERROR = "Could not open this EPUB — the file may be corrupted.";
  let savedFileCap;
  beforeAll(() => { savedFileCap = constants.ZIP_FILE_MAX_BYTES; });
  afterAll(() => { constants.ZIP_FILE_MAX_BYTES = savedFileCap; });

  it("(o) every EPUB open refuses an archive over the cap and takes its open-failure path", async () => {
    const file = buildEpub();
    expect(fs.statSync(file).size).toBeGreaterThan(1024);
    constants.ZIP_FILE_MAX_BYTES = 1024;
    const reads = vi.spyOn(fs, "readFileSync"); // adm-zip's whole-file read: the cap must refuse before it
    try {
      expect(await extractWords(file)).toEqual({ words: [], sections: [], footnoteCues: [], totalWords: 0 });
      expect(await extractContent(file)).toEqual({ userError: OPEN_ERROR });
      const dataPath = fs.mkdtempSync(path.join(tmp, "cover-o-"));
      expect(await extractEpubCover(file, "doc1", dataPath)).toBeNull();
      const coversDir = path.join(dataPath, "covers");
      expect(fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : []).toEqual([]);
      expect(await extractEpubMetadata(file)).toEqual({ title: null, author: null });
      const r = await validateEpub(file);
      expect(r.valid).toBe(false);
      expect(r.errors.join("\n")).toMatch(/too large/);
      expect(reads.mock.calls.filter(([p]) => p === file)).toEqual([]);
    } finally {
      reads.mockRestore();
      constants.ZIP_FILE_MAX_BYTES = savedFileCap;
    }
  });

  it("(r) a large archive whose entries are small and unread is not refused (cap admits 700 MiB)", async () => {
    // A 700 MiB EPUB of mostly unread media reads today, since only container, OPF and spine are read; the archive
    // cap must not refuse it. Its on-disk size is stubbed; adm-zip reads the real (small) file.
    const fsp = require("fs/promises");
    const file = buildEpub();
    const realStat = fsp.stat;
    const stat = vi.spyOn(fsp, "stat").mockImplementation(async (p, ...rest) => {
      const s = await realStat(p, ...rest);
      return p === file ? Object.assign(s, { size: 700 * 1024 * 1024 }) : s;
    });
    try {
      expect((await extractWords(file)).totalWords).toBeGreaterThan(0);
      expect(stat).toHaveBeenCalledWith(file);
      stat.mockImplementation(async () => ({ size: constants.ZIP_FILE_MAX_BYTES + 1 })); // control: just over the cap
      expect(await extractWords(file)).toEqual({ words: [], sections: [], footnoteCues: [], totalWords: 0 });
    } finally {
      stat.mockRestore();
    }
  });

  it("(s) a path stat cannot see keeps its existing open error", async () => {
    // Before this item adm-zip reported a missing file as "ADM-ZIP: Invalid filename", which extractContent maps
    // to its ZIP wording; a stat failure must reach the same path, not a new message.
    // Outside tmp: its "zip-entry-cap-" name would put "zip" into any error text and hide a changed message.
    const missing = path.join(os.tmpdir(), `blurby-missing-book-${process.pid}.epub`);
    expect(missing.toLowerCase()).not.toMatch(/zip|invalid/);
    expect(await extractContent(missing)).toEqual({ userError: "Could not open this EPUB — the file appears to be a corrupted ZIP archive." });
    expect(await extractWords(missing)).toEqual({ words: [], sections: [], footnoteCues: [], totalWords: 0 });
  });

  it("(p) control: with the cap restored, the same file reads as (f) does", async () => {
    const file = buildEpub();
    expect((await extractWords(file)).totalWords).toBeGreaterThan(0);
    const text = await extractContent(file);
    expect(typeof text).toBe("string");
    expect(text).toContain("word");
    const dataPath = fs.mkdtempSync(path.join(tmp, "cover-p-"));
    expect(fs.statSync(await extractEpubCover(file, "doc1", dataPath)).size).toBe(1028);
    expect((await extractEpubMetadata(file)).title).toBe("Bomb");
    expect(await validateEpub(file)).toEqual({ valid: true, errors: [] });
  });
});
