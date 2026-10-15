// DEPS-AUDIT-1 (C1): every EPUB entry read in main/ is capped, declared and inflated.
// Real EPUBs are built with adm-zip under os.tmpdir() and parsed by the real parsers.
import { describe, it, expect, beforeAll, afterAll } from "vitest";

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
