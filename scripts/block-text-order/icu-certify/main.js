// BLOCK-TEXT-ORDER-1 B5 (TQ-B2, LL-160): certify every section of resources/sample-meditations.epub that has a canonical
// slice, under the app's own Electron. Main's extractWords numbers the book in this Electron main; each mode's
// renderer helpers (bundled with esbuild into the scratch folder, never committed) run in a hidden BrowserWindow, parse
// each spine section as application/xhtml+xml, and run collectMainAcceptedTextNodes and certifyCanonicalAlignment on
// it. Run it through run.ps1, which first proves the packaged exe's Electron and ICU (step 1).
// Env: BTO_OUT (scratch folder), BTO_CONTROL=1 (positive control: drop the last canonical word of the largest section),
// BTO_PACKAGED_VERSIONS (JSON {electron, icu} from the packaged exe).
// Exit: 0 when every copy certifies every section with a slice; 1 when any does not; 3 when the versions differ;
// 2 on a checker error. Prints one JSON object on stdout.
const fs = require("fs");
const path = require("path");
const { app, BrowserWindow } = require("electron");

const REPO = path.resolve(__dirname, "..", "..", "..");
const EPUB = path.join(REPO, "resources", "sample-meditations.epub");
const MODES = ["page", "focus", "flow", "narrate"];
const OUT = process.env.BTO_OUT || path.join(require("os").tmpdir(), "bto-icu-certify");
const CONTROL = process.env.BTO_CONTROL === "1";

fs.mkdirSync(OUT, { recursive: true });
// A throwaway profile, never the app's.
app.setPath("userData", path.join(OUT, "profile"));

const emit = (obj, code) => {
  const text = JSON.stringify(obj, null, 1) + "\n";
  fs.writeFileSync(path.join(OUT, "result.json"), text);
  process.stdout.write(text, () => app.exit(code));
};

/** Each spine section's XHTML, keyed by the sectionIndex extractWords gives it (same spine walk, same skips). */
async function readSpineSections() {
  const cheerio = require("cheerio");
  const { createEntryReader, openZip } = require(path.join(REPO, "main", "zip-read"));
  const zip = await openZip(EPUB);
  const entries = zip.getEntries();
  const readEntry = createEntryReader();
  const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
  const opfPath = cheerio.load(readEntry(containerEntry).toString("utf-8"), { xmlMode: true })("rootfile").attr("full-path") || "";
  const opfEntry = entries.find((e) => e.entryName === opfPath);
  const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
  const $opf = cheerio.load(readEntry(opfEntry).toString("utf-8"), { xmlMode: true });
  const manifest = new Map();
  $opf("manifest item").each((_, el) => { const id = $opf(el).attr("id"); const href = $opf(el).attr("href"); if (id && href) manifest.set(id, opfDir + href); });
  const spine = [];
  $opf("spine itemref").each((_, el) => { const idref = $opf(el).attr("idref"); if (idref) spine.push(idref); });
  const out = new Map();
  const seen = new Set();
  spine.forEach((idref, sectionIndex) => {
    const href = manifest.get(idref);
    if (!href || seen.has(href)) return;
    seen.add(href);
    const entry = entries.find((e) => e.entryName === href);
    if (entry) out.set(sectionIndex, readEntry(entry).toString("utf-8"));
  });
  return { spineLength: spine.length, xhtml: out };
}

function bundleMode(mode) {
  const esbuild = require("esbuild");
  const dir = path.join(REPO, "src", "reader", "modes", mode, "helpers").replace(/\\/g, "/");
  const entry = path.join(OUT, `entry-${mode}.ts`);
  fs.writeFileSync(entry, [
    `export { certifyCanonicalAlignment, wrapWordsInSpans } from "${dir}/foliateWordWrapping.ts";`,
    `export { collectMainAcceptedTextNodes } from "${dir}/foliateHelpers.ts";`,
  ].join("\n"));
  const outfile = path.join(OUT, `bundle-${mode}.js`);
  esbuild.buildSync({
    entryPoints: [entry], bundle: true, format: "iife", globalName: `BTO_${mode}`, platform: "browser",
    target: "es2022", outfile, define: { "import.meta.env.DEV": "false", "import.meta.env": "{}" }, logLevel: "silent",
  });
  return fs.readFileSync(outfile, "utf-8");
}

/** Runs in the hidden window: certify each section with each copy, and time a certified wrap of the largest section. */
function rendererCheck(input) {
  const out = {
    versions: { electron: process.versions.electron, icu: process.versions.icu },
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    certified: {}, failures: [], stampMs: {}, stampedSpans: {}, stampReports: {},
  };
  const parse = (xhtml) => new DOMParser().parseFromString(xhtml, "application/xhtml+xml");
  for (const mode of input.modes) {
    const lib = window[`BTO_${mode}`];
    let certified = 0;
    for (const s of input.sections) {
      const doc = parse(s.xhtml);
      if (doc.getElementsByTagName("parsererror").length || !doc.body) {
        out.failures.push({ mode, sectionIndex: s.sectionIndex, reason: "parse-error", canonicalIndex: -1, nodeIndex: -1 });
        continue;
      }
      const r = lib.certifyCanonicalAlignment(lib.collectMainAcceptedTextNodes(doc.body), s.slice);
      if (r.ok) certified++;
      else out.failures.push({ mode, sectionIndex: s.sectionIndex, reason: r.reason, canonicalIndex: r.canonicalIndex, nodeIndex: r.nodeIndex });
    }
    out.certified[mode] = certified;
    const largest = input.sections.find((s) => s.sectionIndex === input.largest);
    const doc = parse(largest.xhtml);
    const reports = [];
    const t0 = performance.now();
    lib.wrapWordsInSpans(doc, largest.sectionIndex, largest.start, [], largest.slice, (r) => reports.push(r));
    out.stampMs[mode] = Number((performance.now() - t0).toFixed(3));
    out.stampedSpans[mode] = doc.querySelectorAll("[data-word-index]").length;
    out.stampReports[mode] = reports;
  }
  return out;
}

app.whenReady().then(async () => {
  const result = { electron: process.versions.electron, icu: process.versions.icu, control: CONTROL };
  try {
    const packaged = process.env.BTO_PACKAGED_VERSIONS ? JSON.parse(process.env.BTO_PACKAGED_VERSIONS) : null;
    const { extractWords } = require(path.join(REPO, "main", "epub-word-extractor"));
    const book = await extractWords(EPUB);
    const spine = await readSpineSections();
    const sections = book.sections.map((s) => ({
      sectionIndex: s.sectionIndex,
      start: s.startWordIdx,
      slice: book.words.slice(s.startWordIdx, s.endWordIdx),
      xhtml: spine.xhtml.get(s.sectionIndex),
    }));
    const largest = sections.reduce((a, b) => (b.slice.length > a.slice.length ? b : a));
    if (CONTROL) {
      largest.slice = largest.slice.slice(0, -1);
      result.controlSection = largest.sectionIndex;
    }
    const html = path.join(OUT, "index.html");
    fs.writeFileSync(html, "<!doctype html><meta charset=utf-8><title>bto</title>");
    const win = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: true, contextIsolation: false, sandbox: false } });
    await win.loadFile(html);
    for (const mode of MODES) await win.webContents.executeJavaScript(bundleMode(mode));
    const input = { modes: MODES, sections, largest: largest.sectionIndex };
    const r = await win.webContents.executeJavaScript(`(${rendererCheck.toString()})(${JSON.stringify(input)})`);
    win.destroy();
    Object.assign(result, {
      packaged,
      renderer: r.versions,
      mainLocale: Intl.DateTimeFormat().resolvedOptions().locale,
      rendererLocale: r.locale,
      sections: spine.spineLength,
      withSlice: sections.length,
      certified: r.certified,
      failures: r.failures,
      largest: { sectionIndex: largest.sectionIndex, words: largest.slice.length, stampMs: r.stampMs, stampedSpans: r.stampedSpans, reports: r.stampReports },
    });
    const same = (v) => v && v.electron === result.electron && v.icu === result.icu;
    if (!same(packaged) || !same(r.versions)) return emit({ ...result, versionMismatch: true }, 3);
    // BLOCK-TEXT-ORDER-1 amendment 1 (addendum 4): every copy must also stamp the largest section in full and report
    // exactly [{ok:true}] for it.
    const fullStamp = (m) => r.stampedSpans[m] === largest.slice.length
      && JSON.stringify(r.stampReports[m]) === JSON.stringify([{ ok: true }]);
    const ok = MODES.every((m) => r.certified[m] === sections.length && fullStamp(m));
    emit(result, ok ? 0 : 1);
  } catch (err) {
    emit({ ...result, error: String((err && err.stack) || err) }, 2);
  }
});
app.on("window-all-closed", () => {});
