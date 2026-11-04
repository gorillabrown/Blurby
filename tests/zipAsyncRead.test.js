// ZIP-ASYNC-READ-1: openZip reads the archive with fs.promises and hands adm-zip the buffer; adm-zip never reads the
// file synchronously, and the cap holds on the bytes actually read.
import { describe, it, expect, afterAll, vi } from "vitest";

const os = require("os");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const AdmZip = require("adm-zip");
const constants = require("../main/constants");
const { openZip } = require("../main/zip-read.js");
const { extractWords } = require("../main/epub-word-extractor.js");
const { extractContent } = require("../main/file-parsers.js");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "zip-async-read-"));
afterAll(() => fs.rmSync(tmp, { recursive: true, force: true }));

let n = 0;
function buildEpub() {
  const zip = new AdmZip();
  zip.addFile("mimetype", Buffer.from("application/epub+zip"));
  zip.addFile("META-INF/container.xml", Buffer.from('<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'));
  zip.addFile("OEBPS/content.opf", Buffer.from('<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>T</dc:title></metadata><manifest><item id="c1" href="c1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="c1"/></spine></package>'));
  zip.addFile("OEBPS/c1.xhtml", Buffer.from(`<html xmlns="http://www.w3.org/1999/xhtml"><body><p>${"word ".repeat(400)}</p></body></html>`));
  const file = path.join(tmp, `book-${n++}.epub`);
  zip.writeZip(file);
  return file;
}

describe("ZIP-ASYNC-READ-1 async archive read", () => {
  it("(za1) opening an EPUB never reads it with fs.readFileSync, and reads it once through fs.promises.readFile", async () => {
    const file = buildEpub();
    const syncReads = vi.spyOn(fs, "readFileSync");
    const asyncReads = vi.spyOn(fsp, "readFile");
    try {
      const zip = await openZip(file);
      expect(zip.getEntries().map((e) => e.entryName)).toContain("OEBPS/c1.xhtml");
      expect(syncReads.mock.calls.filter(([p]) => p === file)).toEqual([]);
      expect(asyncReads.mock.calls.filter(([p]) => p === file)).toHaveLength(1);
    } finally {
      syncReads.mockRestore();
      asyncReads.mockRestore();
    }
  });

  it("(za2) the cap holds on the bytes read: a file that grew past the cap after its stat is refused", async () => {
    const file = buildEpub();
    const saved = constants.ZIP_FILE_MAX_BYTES;
    constants.ZIP_FILE_MAX_BYTES = 256;
    expect(fs.statSync(file).size).toBeGreaterThan(256);
    const stat = vi.spyOn(fsp, "stat").mockImplementation(async () => ({ size: 10 })); // stat saw it small
    try {
      await expect(openZip(file)).rejects.toMatchObject({ code: "ZIP_FILE_TOO_LARGE" });
    } finally {
      stat.mockRestore();
      constants.ZIP_FILE_MAX_BYTES = saved;
    }
  });

  it("(za3) control: the parsers still read the archive", async () => {
    const file = buildEpub();
    expect((await extractWords(file)).totalWords).toBe(400);
    expect(await extractContent(file)).toContain("word");
  });
});
