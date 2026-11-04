// @vitest-environment jsdom
// BLOCK-TEXT-ORDER-1 Wave A (red first, standing rule 43). Rows are contract A.3, B.3, C.4 and D.3
// (docs/planning/roadmap-reviews/2026-11-03-block-text-order-contracts.md at a057f5d7), with (b5), (b6), (b9) and (b11)
// split into -dom and -certified, (b11) per TQ-A1 and (b12) per TQ-B3/Q4. Every -dom and control golden below is the
// literal output of the base c5bb507f (blob-identical helpers in all four copies), captured before any source edit and
// never regenerated. New helper functions are reached through namespace imports, so on the base a missing function
// makes its row red as "not a function" while the controls still run.
import { beforeAll, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import * as pageHelpers from "../../src/reader/modes/page/helpers/foliateHelpers";
import * as focusHelpers from "../../src/reader/modes/focus/helpers/foliateHelpers";
import * as flowHelpers from "../../src/reader/modes/flow/helpers/foliateHelpers";
import * as narrateHelpers from "../../src/reader/modes/narrate/helpers/foliateHelpers";
import * as pageWrap from "../../src/reader/modes/page/helpers/foliateWordWrapping";
import * as focusWrap from "../../src/reader/modes/focus/helpers/foliateWordWrapping";
import * as flowWrap from "../../src/reader/modes/flow/helpers/foliateWordWrapping";
import * as narrateWrap from "../../src/reader/modes/narrate/helpers/foliateWordWrapping";
import * as flowStarts from "../../src/reader/modes/flow/helpers/foliateParagraphStarts";
import * as focusStarts from "../../src/reader/modes/focus/helpers/foliateParagraphStarts";
import { buildNaturalChunks } from "../../src/utils/naturalChunks";

const require = createRequire(import.meta.url);
const extractor = require("../../main/epub-word-extractor.js");
const cheerio = require("cheerio");

const XHTML = (body: string) =>
  `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>t</title></head><body>${body}</body></html>`;
const parse = (body: string): Document => new DOMParser().parseFromString(XHTML(body), "application/xhtml+xml");

// The modules are typed loosely on purpose: on the base the new exports do not exist (A1 namespace-import rule).
const COPIES: Array<[string, any, any]> = [
  ["page", pageHelpers, pageWrap],
  ["focus", focusHelpers, focusWrap],
  ["flow", flowHelpers, flowWrap],
  ["narrate", narrateHelpers, narrateWrap],
];

/**
 * Main's extractWords over a three-file EPUB (container.xml, OPF, one XHTML) written with adm-zip to a mkdtemp folder.
 * It runs in a child Node process: under the jsdom environment adm-zip cannot read a Buffer (it sees no entries), so
 * main would return an empty book in-process.
 */
function mainExtractWords(xhtml: string): { words: string[]; footnoteCues: unknown[] } {
  const script = `
const fs=require("fs"),os=require("os"),path=require("path");
const AdmZip=require("adm-zip");const ex=require("./main/epub-word-extractor.js");
const xhtml=fs.readFileSync(0,"utf8");const dir=fs.mkdtempSync(path.join(os.tmpdir(),"bto-"));
const zip=new AdmZip();
zip.addFile("META-INF/container.xml",Buffer.from('<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>'));
zip.addFile("OEBPS/content.opf",Buffer.from('<?xml version="1.0"?><package xmlns="http://www.idpf.org/2007/opf" version="3.0"><manifest><item id="s1" href="s1.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="s1"/></spine></package>'));
zip.addFile("OEBPS/s1.xhtml",Buffer.from(xhtml));
const file=path.join(dir,"fixture.epub");zip.writeZip(file);
ex.extractWords(file).then((r)=>{fs.rmSync(dir,{recursive:true,force:true});process.stdout.write(JSON.stringify(r));});`;
  return JSON.parse(execFileSync(process.execPath, ["-e", script], { input: xhtml, cwd: process.cwd(), encoding: "utf8" }));
}

type SpanInfo = { text: string | null; index: number };
const spansIn = (root: ParentNode): SpanInfo[] =>
  Array.from(root.querySelectorAll("[data-word-index]")).map((el) => ({
    text: el.textContent,
    index: Number(el.getAttribute("data-word-index")),
  }));
const textBefore = (body: HTMLElement, el: Element): number => {
  const range = body.ownerDocument.createRange();
  range.setStart(body, 0);
  range.setEndBefore(el);
  return range.toString().length;
};
const runsOf = (H: any, body: HTMLElement, acceptance?: string) =>
  H.collectBlockTextNodes(body, 0, acceptance).map((r: any) => ({
    blockTag: r.blockTag,
    text: r.nodes.map((n: Text) => n.data).join(""),
    runOrdinal: r.runOrdinal,
    runId: r.runId,
    blockOrdinal: r.blockOrdinal,
    blockId: r.blockId,
  }));
const mainRunTexts = (body: string): string[] => {
  const $ = cheerio.load(XHTML(body));
  return extractor.extractOrderedRuns($, $("body")).runs.map((r: any) => r.text);
};
const viewOf = (doc: Document) => ({ renderer: { getContents: () => [{ doc, index: 0 }] } });
const chunkKinds = (H: any, body: string): Array<[string, string]> => {
  const words = H.extractWordsFromSection(parse(body), 0).map((w: any, i: number) => ({
    word: w.word,
    globalWordIndex: i,
    sectionIndex: w.sectionIndex,
    tokenId: w.tokenId,
    blockId: w.blockId,
    blockTag: w.blockTag,
    blockOrdinal: w.blockOrdinal,
    sourceLineBreakAfter: w.sourceLineBreakAfter,
    paragraphBreakAfter: w.paragraphBreakAfter,
  }));
  return buildNaturalChunks(words).map((c: any) => [c.kind, words.slice(c.startWordIndex, c.endWordIndex).map((w: any) => w.word).join(" ")]);
};

// ── Fixtures ────────────────────────────────────────────────────────────────
const A1 = `<div id="x1">alpha beta</div><p>alpha<a epub:type="noteref" href="#x1">1</a> beta</p>`;
const A2 = `<p>alpha<a epub:type="noteref" href="#x1">1</a> beta</p><div id="x1">alpha beta</div>`;
const A3 = `Lead <a epub:type="noteref" href="#n">1</a> tail`;
const A4 = `<p>x</p><aside epub:type="footnote" id="fn">Note.</aside>`;
const A5 = `<aside>Side text.</aside><p>x</p>`;
const A6 = `\n<p>x</p>\n`;
const B1 = `<div>before <p>inside</p> after</div>`;
const B3 = `<div id="x1">beta</div><p>alpha<a epub:type="noteref" href="#x1">1</a> beta</p>`;
const B6 = `<p><span>W</span>hat's up</p>`;
const B11 = `<p>alpha<a epub:type="noteref" href="#t1">1</a> beta</p><p><a id="t1"/>gamma delta</p>`;

// ── Base goldens (c5bb507f, all four copies identical; never regenerated) ───
const GOLDEN = {
  b4control:
    "<p xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"100\" data-token-id=\"0:0\" data-token-part=\"0\" data-word-full=\"alpha\">alpha</span> <span class=\"page-word\" data-word-index=\"102\" data-token-id=\"0:2\" data-token-part=\"0\" data-word-full=\"gamma\">gamma</span></p>",
  b5dom:
    "<p xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"100\" data-token-id=\"0:0\" data-token-part=\"0\" data-word-full=\"the\">the</span> <span class=\"page-word\" data-word-index=\"101\" data-token-id=\"0:1\" data-token-part=\"0\" data-word-full=\"cat\">cat</span> <span class=\"page-word\" data-word-index=\"102\" data-token-id=\"0:2\" data-token-part=\"0\" data-word-full=\"sat\">sat</span> <span class=\"page-word\" data-word-index=\"103\" data-token-id=\"0:3\" data-token-part=\"0\" data-word-full=\"on\">on</span> <span class=\"page-word\" data-word-index=\"104\" data-token-id=\"0:4\" data-token-part=\"0\" data-word-full=\"the\">the</span> <span class=\"page-word\" data-word-index=\"105\" data-token-id=\"0:5\" data-token-part=\"0\" data-word-full=\"mat\">mat</span></p>",
  b6dom:
    "<p xmlns=\"http://www.w3.org/1999/xhtml\"><span><span class=\"page-word\" data-word-index=\"100\" data-token-id=\"0:0\" data-token-part=\"0\" data-word-full=\"W\">W</span></span><span class=\"page-word\" data-word-index=\"101\" data-token-id=\"0:1\" data-token-part=\"0\" data-word-full=\"hat's\">hat's</span> <span class=\"page-word\" data-word-index=\"102\" data-token-id=\"0:2\" data-token-part=\"0\" data-word-full=\"up\">up</span></p>",
  b7dom:
    "<p xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"100\" data-token-id=\"0:0\" data-token-part=\"0\" data-word-full=\"alpha\">alpha</span> beta</p>",
  b9dom:
    "<p xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"100\" data-token-id=\"0:0\" data-token-part=\"0\" data-word-full=\"One\">One</span> <span class=\"page-word\" data-word-index=\"101\" data-token-id=\"0:1\" data-token-part=\"0\" data-word-full=\"two.\">two.</span></p><h2 xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"102\" data-token-id=\"0:2\" data-token-part=\"0\" data-word-full=\"Three\">Three</span></h2><li xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"103\" data-token-id=\"0:3\" data-token-part=\"0\" data-word-full=\"Four\">Four</span></li>",
  b11dom:
    "<p xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"100\" data-token-id=\"0:0\" data-token-part=\"0\" data-word-full=\"alpha\">alpha</span><a xmlns:ns1=\"http://www.idpf.org/2007/ops\" ns1:type=\"noteref\" href=\"#t1\">1</a> <span class=\"page-word\" data-word-index=\"101\" data-token-id=\"0:1\" data-token-part=\"0\" data-word-full=\"beta\">beta</span></p><p xmlns=\"http://www.w3.org/1999/xhtml\"><a id=\"t1\"></a>gamma delta</p>",
  c1:
    "<p xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"0\" data-token-id=\"0:0\" data-token-part=\"0\" data-word-full=\"a\">a</span> <span class=\"page-word\" data-word-index=\"1\" data-token-id=\"0:1\" data-token-part=\"0\" data-word-full=\"b\">b</span></p><p xmlns=\"http://www.w3.org/1999/xhtml\"><span class=\"page-word\" data-word-index=\"2\" data-token-id=\"0:2\" data-token-part=\"0\" data-word-full=\"c\">c</span></p>",
  c2dom:
    "<p xmlns=\"http://www.w3.org/1999/xhtml\">a b</p>",
  b11Canonical: ["alpha", "beta"],
  d6control: [["one", false, "0:0:p", "0:0"], ["two", true, "0:0:p", "0:1"], ["three", true, "0:1:p", "0:2"]],
  d8control: [["heading", "Part Two"], ["paragraph", "One"]],
};

let b10Words: string[] = [];
let b11Words: string[] = [];
beforeAll(() => {
  b10Words = mainExtractWords(XHTML(B1 + A1 + B6)).words;
  b11Words = mainExtractWords(XHTML(B11)).words;
});

describe.each(COPIES)("BLOCK-TEXT-ORDER-1 — %s copy", (_mode, H, W) => {
  // ── G-A: accepted-text equivalence (A.3) ──────────────────────────────────
  it("(a1) referenced plain-ID target is not main-accepted", () => {
    const doc = parse(A1);
    expect(H.collectMainAcceptedTextNodes(doc.body).map((n: Text) => n.data)).toEqual(["alpha", " beta"]);
  });

  it("(a1-control) legacy fallback still accepts it", () => {
    const doc = parse(A1);
    const groups = H.collectBlockTextNodes(doc.body);
    const text = groups.map((g: any) => g.nodes.map((n: Text) => n.data).join("")).join("|");
    expect(text).toContain("alpha beta");
    expect(groups[0].block.getAttribute("id")).toBe("x1");
  });

  it("(a2) target after the body text", () => {
    const doc = parse(A2);
    expect(H.collectMainAcceptedTextNodes(doc.body).map((n: Text) => n.data)).toEqual(["alpha", " beta"]);
  });

  it("(a3) root-level noteref marker is main-accepted (D2)", () => {
    const doc = parse(A3);
    expect(H.collectMainAcceptedTextNodes(doc.body).map((n: Text) => n.data)).toEqual(["Lead ", "1", " tail"]);
  });

  it("(a3-control) legacy fallback rejects the marker", () => {
    const doc = parse(A3);
    expect(H.extractWordsFromSection(doc, 0).map((w: any) => w.word)).toEqual(["Lead", "tail"]);
  });

  it("(a4) semantic footnote unchanged", () => {
    const doc = parse(A4);
    const legacy = H.collectBlockTextNodes(doc.body).map((g: any) => g.nodes.map((n: Text) => n.data).join(""));
    expect(legacy).toEqual(["x"]);
    expect(H.collectMainAcceptedTextNodes(doc.body).map((n: Text) => n.data)).toEqual(["x"]);
  });

  it("(a5) no CSS/aside broadening", () => {
    const doc = parse(A5);
    expect(H.collectMainAcceptedTextNodes(doc.body).map((n: Text) => n.data)).toEqual(["Side text.", "x"]);
  });

  it("(a6) blank root text dropped", () => {
    const doc = parse(A6);
    // Control first: the legacy predicate keeps the blank root text nodes.
    const legacyNodes: string[] = [];
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!H.isSuppressedNarrationTextNode(n) && (n as Text).data) legacyNodes.push((n as Text).data);
    }
    expect(legacyNodes).toEqual(["\n", "x", "\n"]);
    expect(H.collectMainAcceptedTextNodes(doc.body).map((n: Text) => n.data)).toEqual(["x"]);
  });

  it("(p1) main/renderer accepted-text parity", () => {
    const expected: Array<[string, string[]]> = [
      [A1, ["alpha beta"]],
      [A2, ["alpha beta"]],
      [A3, ["Lead 1 tail"]],
      [A4, ["x"]],
      [A5, ["Side text.", "x"]],
      [A6, ["x"]],
    ];
    for (const [body, runs] of expected) {
      const mainJoin = mainRunTexts(body).join("\u0001");
      const rendererJoin = runsOf(H, parse(body).body, "main").map((r: any) => r.text).join("\u0001");
      expect(mainJoin).toBe(runs.join("\u0001"));
      expect(rendererJoin).toBe(mainJoin);
    }
  });

  // ── G-B: source-aware, non-lossy canonical stamping (B.3) ─────────────────
  it("(b1) nested before/inside/after is stamped in DOM order", async () => {
    const doc = parse(B1);
    await W.wrapWordsInSpans(doc, 0, 100, [], ["before", "inside", "after"]);
    expect(spansIn(doc.body)).toEqual([
      { text: "before", index: 100 },
      { text: "inside", index: 101 },
      { text: "after", index: 102 },
    ]);
  });

  it("(b2) duplicate text under a plain-ID target", async () => {
    const doc = parse(A1);
    await W.wrapWordsInSpans(doc, 0, 100, [], ["alpha", "beta"]);
    expect(spansIn(doc.getElementById("x1")!)).toEqual([]);
    expect(spansIn(doc.querySelector("p")!)).toEqual([
      { text: "alpha", index: 100 },
      { text: "beta", index: 101 },
    ]);
  });

  it("(b3) missing word is not consumed", async () => {
    const doc = parse(B3);
    await W.wrapWordsInSpans(doc, 0, 100, [], ["alpha", "beta"]);
    expect(spansIn(doc.getElementById("x1")!)).toEqual([]);
    expect(spansIn(doc.querySelector("p")!)).toEqual([
      { text: "alpha", index: 100 },
      { text: "beta", index: 101 },
    ]);
  });

  it("(b4) certifier fails closed instead of skipping", () => {
    const doc = parse("<p>alpha gamma</p>");
    const node = doc.querySelector("p")!.firstChild as Text;
    expect(W.certifyCanonicalAlignment([node], ["alpha", "MISSING", "gamma"])).toEqual({
      ok: false,
      reason: "unmatched-source-word",
      canonicalIndex: 1,
      nodeIndex: 0,
    });
  });

  it("(b4-control) uncertified section keeps legacy stamping exactly", async () => {
    const doc = parse("<p>alpha gamma</p>");
    await W.wrapWordsInSpans(doc, 0, 100, [], ["alpha", "MISSING", "gamma"]);
    expect(doc.body.innerHTML).toBe(GOLDEN.b4control);
  });

  it("(b5-dom) repeated words in order: DOM equals the base", async () => {
    const doc = parse("<p>the cat sat on the mat</p>");
    await W.wrapWordsInSpans(doc, 0, 100, [], ["the", "cat", "sat", "on", "the", "mat"]);
    expect(doc.body.innerHTML).toBe(GOLDEN.b5dom);
  });

  it("(b5-certified) repeated words in order are certified", async () => {
    const doc = parse("<p>the cat sat on the mat</p>");
    const reports: unknown[] = [];
    await W.wrapWordsInSpans(doc, 0, 100, [], ["the", "cat", "sat", "on", "the", "mat"], (r: unknown) => reports.push(r));
    expect(reports).toEqual([{ ok: true }]);
    const second = doc.querySelector('[data-word-index="104"]')!;
    expect(second.textContent).toBe("the");
    expect(textBefore(doc.body, second)).toBe(15);
  });

  it("(b6-dom) drop cap across nodes: DOM equals the base", async () => {
    const doc = parse(B6);
    await W.wrapWordsInSpans(doc, 0, 100, [], ["W", "hat's", "up"]);
    expect(doc.body.innerHTML).toBe(GOLDEN.b6dom);
  });

  it("(b6-certified) drop cap across nodes is certified", async () => {
    const doc = parse(B6);
    const reports: unknown[] = [];
    await W.wrapWordsInSpans(doc, 0, 100, [], ["W", "hat's", "up"], (r: unknown) => reports.push(r));
    expect(reports).toEqual([{ ok: true }]);
    expect(spansIn(doc.body)).toEqual([
      { text: "W", index: 100 },
      { text: "hat's", index: 101 },
      { text: "up", index: 102 },
    ]);
    const w = doc.querySelector('[data-word-index="100"]')!;
    expect(w.parentElement!.localName).toBe("span");
    expect(w.parentElement!.hasAttribute("data-word-index")).toBe(false);
  });

  it("(b7) extra renderer text", async () => {
    const doc = parse("<p>alpha beta</p>");
    expect(W.certifyCanonicalAlignment(Array.from(doc.querySelector("p")!.childNodes), ["alpha"])).toMatchObject({
      ok: false,
      reason: "extra-source-text",
    });
    const reports: any[] = [];
    await W.wrapWordsInSpans(doc, 0, 100, [], ["alpha"], (r: unknown) => reports.push(r));
    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({ ok: false, reason: "extra-source-text" });
    expect(doc.body.innerHTML).toBe(GOLDEN.b7dom);
  });

  it("(b8) D2 marker is stamped, not skipped", async () => {
    const doc = parse(A3);
    const reports: unknown[] = [];
    await W.wrapWordsInSpans(doc, 0, 100, [], ["Lead", "1", "tail"], (r: unknown) => reports.push(r));
    expect(reports).toEqual([{ ok: true }]);
    expect(spansIn(doc.body)).toEqual([
      { text: "Lead", index: 100 },
      { text: "1", index: 101 },
      { text: "tail", index: 102 },
    ]);
  });

  it("(b9-dom) flat-section byte identity: DOM equals the base", async () => {
    const doc = parse("<p>One two.</p><h2>Three</h2><li>Four</li>");
    await W.wrapWordsInSpans(doc, 0, 100, [], ["One", "two.", "Three", "Four"]);
    expect(doc.body.innerHTML).toBe(GOLDEN.b9dom);
  });

  it("(b9-certified) flat section is certified", async () => {
    const doc = parse("<p>One two.</p><h2>Three</h2><li>Four</li>");
    const reports: unknown[] = [];
    await W.wrapWordsInSpans(doc, 0, 100, [], ["One", "two.", "Three", "Four"], (r: unknown) => reports.push(r));
    expect(reports).toEqual([{ ok: true }]);
  });

  it("(b10) canonical parity with real main output", () => {
    expect(b10Words).toEqual(["before", "inside", "after", "alpha", "beta", "W", "hat's", "up"]);
    const doc = parse(B1 + A1 + B6);
    const nodes: Text[] = H.collectMainAcceptedTextNodes(doc.body);
    const result = W.certifyCanonicalAlignment(nodes, b10Words);
    expect(result.ok).toBe(true);
    expect(result.placements.map((p: any) => p.i)).toEqual(b10Words.map((_w, i) => i));
    expect(result.placements.map((p: any) => nodes[p.node].data.slice(p.start, p.end))).toEqual(b10Words);
  });

  it("(b11-dom) D4 parser divergence: DOM equals the base", async () => {
    expect(b11Words).toEqual(GOLDEN.b11Canonical);
    const doc = parse(B11);
    await W.wrapWordsInSpans(doc, 0, 100, [], b11Words);
    expect(doc.body.innerHTML).toBe(GOLDEN.b11dom);
  });

  it("(b11-certified) D4 parser divergence fails closed", async () => {
    const doc = parse(B11);
    const reports: any[] = [];
    await W.wrapWordsInSpans(doc, 0, 100, [], b11Words, (r: unknown) => reports.push(r));
    expect(reports).toHaveLength(1);
    expect(reports[0].ok).toBe(false);
    expect(["extra-source-text", "unmatched-source-word"]).toContain(reports[0].reason);
  });

  it("(b12) dom-changed stops stamping with no span at a stale offset", async () => {
    const doc = parse("<p>alpha beta</p><p>gamma</p>");
    const canonical = ["alpha", "beta", "gamma"];
    const nodeB = doc.querySelectorAll("p")[1].firstChild as Text;
    expect(nodeB.data).toBe("gamma");
    const reports: unknown[] = [];
    await W.wrapWordsInSpans(doc, 0, 100, [], canonical, (r: unknown) => reports.push(r), {
      __testBetweenNodes: (k: number) => {
        if (k === 0) nodeB.data = "gamma changed";
      },
    });
    expect(reports).toEqual([{ ok: true }, { ok: false, reason: "dom-changed" }]);
    expect(nodeB.data).toBe("gamma changed");
    expect(spansIn(doc.querySelectorAll("p")[1])).toEqual([]);
    const stamped = spansIn(doc.body);
    expect(stamped.length).toBeGreaterThan(0);
    for (const span of stamped) expect(span.text).toBe(canonical[span.index - 100]);
  });

  // ── G-C: canonical authority and hydration (C.4) ──────────────────────────
  it("(c1) empty canonical slice gives today's fallback numbering", async () => {
    for (const canonical of [[], undefined]) {
      const doc = parse("<p>a b</p><p>c</p>");
      const words = H.extractWordsFromSection(doc, 0);
      await W.wrapWordsInSpans(doc, 0, 0, words, canonical);
      expect(doc.body.innerHTML).toBe(GOLDEN.c1);
      expect(spansIn(doc.body).map((s) => s.index)).toEqual([0, 1, 2]);
    }
  });

  it("(c2) mismatched canonical gives the legacy path", async () => {
    const doc = parse("<p>a b</p>");
    const reports: any[] = [];
    await W.wrapWordsInSpans(doc, 0, 100, [], ["x", "y"], (r: unknown) => reports.push(r));
    expect(reports).toHaveLength(1);
    expect(reports[0].ok).toBe(false);
    expect(doc.body.innerHTML).toBe(GOLDEN.c2dom);
  });

  it("(c3) nested fallback numbering follows DOM order", () => {
    const words = H.extractWordsFromSection(parse(B1), 0);
    expect(words.map((w: any) => w.word)).toEqual(["before", "inside", "after"]);
    expect(words.map((w: any) => w.tokenId)).toEqual(["0:0", "0:1", "0:2"]);
  });

  // ── G-D: paragraph and run semantics (D.3) ────────────────────────────────
  it("(d1) runs split on nested entry and exit", () => {
    expect(runsOf(H, parse(B1).body)).toEqual([
      { blockTag: "div", text: "before ", runOrdinal: 0, runId: "0:r0", blockOrdinal: 0, blockId: "0:0:div" },
      { blockTag: "p", text: "inside", runOrdinal: 1, runId: "0:r1", blockOrdinal: 1, blockId: "0:1:p" },
      { blockTag: "div", text: " after", runOrdinal: 2, runId: "0:r2", blockOrdinal: 0, blockId: "0:0:div" },
    ]);
  });

  it("(d2) touching text, no whitespace inserted", () => {
    expect(runsOf(H, parse("<div>before<p>inside</p>after</div>").body).map((r: any) => [r.text, r.runOrdinal])).toEqual([
      ["before", 0],
      ["inside", 1],
      ["after", 2],
    ]);
  });

  it("(d3) empty and suppressed nested blocks split runs", () => {
    expect(runsOf(H, parse("<div>a<p></p>b</div>").body).map((r: any) => [r.text, r.runOrdinal, r.blockOrdinal])).toEqual([
      ["a", 0, 0],
      ["b", 1, 0],
    ]);
    expect(runsOf(H, parse(`<div>red<div epub:type="footnote">x</div>blue</div>`).body).map((r: any) => [r.text, r.runOrdinal])).toEqual([
      ["red", 0],
      ["blue", 1],
    ]);
  });

  it("(d4) suppressed inline does not split", () => {
    const body = `<p>red<a epub:type="noteref" href="#fn">1</a>blue</p><aside id="fn" epub:type="footnote">Note.</aside>`;
    expect(runsOf(H, parse(body).body).map((r: any) => [r.blockTag, r.text, r.runOrdinal, r.runId])).toEqual([["p", "redblue", 0, "0:r0"]]);
  });

  it("(d5) orphan root text keeps its DOM position", () => {
    expect(runsOf(H, parse("lead<p>mid</p>tail").body).map((r: any) => [r.blockTag, r.text, r.runOrdinal, r.blockOrdinal])).toEqual([
      ["body", "lead", 0, 0],
      ["p", "mid", 1, 1],
      ["body", "tail", 2, 0],
    ]);
  });

  it("(d6) continuation adds no paragraph break", () => {
    const words = H.extractWordsFromSection(parse(B1), 0);
    expect(words.map((w: any) => [w.word, !!w.paragraphBreakAfter])).toEqual([
      ["before", true],
      ["inside", false],
      ["after", true],
    ]);
    const { words: viewWords, paragraphBreaks } = H.extractWordsFromView(viewOf(parse(B1)));
    expect(viewWords.map((w: any) => w.word)).toEqual(["before", "inside", "after"]);
    expect([...paragraphBreaks].sort((a: number, b: number) => a - b)).toEqual([0, 2]);
  });

  it("(d6-control) flat paragraphs unchanged", () => {
    const words = H.extractWordsFromSection(parse("<p>one two</p><p>three</p>"), 0);
    expect(words.map((w: any) => [w.word, !!w.paragraphBreakAfter, w.blockId, w.tokenId])).toEqual(GOLDEN.d6control);
    const { paragraphBreaks } = H.extractWordsFromView(viewOf(parse("<p>one two</p><p>three</p>")));
    expect([...paragraphBreaks].sort((a: number, b: number) => a - b)).toEqual([1, 2]);
  });

  it("(d8) heading split by a nested block", () => {
    // Control first: a non-nested heading chunks exactly as on the base.
    expect(chunkKinds(H, "<h2>Part Two</h2><p>One</p>")).toEqual(GOLDEN.d8control);
    expect(chunkKinds(H, "<h2>Part<div>One</div>Two</h2>")).toEqual([
      ["heading", "Part"],
      ["sentence", "One"],
      ["heading", "Two"],
    ]);
  });
});

describe.each([
  ["flow", flowHelpers, flowWrap, flowStarts],
  ["focus", focusHelpers, focusWrap, focusStarts],
] as Array<[string, any, any, any]>)("BLOCK-TEXT-ORDER-1 — %s paragraph-start collector", (_mode, H, W, S) => {
  it("(d7) fallback flags equal canonical collector breaks", async () => {
    const stamped = parse(B1);
    await W.wrapWordsInSpans(stamped, 0, 0, [], ["before", "inside", "after"]);
    const starts = S.collectParagraphStartWordIndexes([{ doc: stamped, index: 0 }], () => true);
    const canonicalBreaks = [...S.bookParagraphBreaks(starts, [0], 2)].sort((a: number, b: number) => a - b);
    const fallbackBreaks = [...H.extractWordsFromView(viewOf(parse(B1))).paragraphBreaks].sort((a: number, b: number) => a - b);
    expect(canonicalBreaks).toEqual([0, 2]);
    expect(fallbackBreaks).toEqual(canonicalBreaks);
  });
});
