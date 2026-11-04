// BLOCK-TEXT-ORDER-1 Wave A (red first, standing rule 43): main's dormant pure helper extractOrderedRuns (contract
// D-1, (m1)-(m8)). Its run texts and boundaries are those the renderer gives under MAIN_ACCEPT for the (d1)-(d5)
// bodies (blockTextOrder.test.ts), with blank root text dropped. (m7) holds the legacy plans to literals recorded on
// the base c5bb507f, never regenerated.
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";

const require = createRequire(import.meta.url);
const extractor = require("../main/epub-word-extractor.js");
const cheerio = require("cheerio");

const XHTML = (body) =>
  `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>t</title></head><body>${body}</body></html>`;
const load = (body) => {
  const $ = cheerio.load(XHTML(body));
  return { $, $root: $("body") };
};
const orderedRuns = (body) => {
  const { $, $root } = load(body);
  return extractor.extractOrderedRuns($, $root);
};
const runShape = (body) => orderedRuns(body).runs.map((r) => ({ runOrdinal: r.runOrdinal, blockTag: r.blockTag, text: r.text, start: r.start }));

const FIXTURES = {
  d1: "<div>before <p>inside</p> after</div>",
  d2: "<div>before<p>inside</p>after</div>",
  d3a: "<div>a<p></p>b</div>",
  d3b: `<div>red<div epub:type="footnote">x</div>blue</div>`,
  d4: `<p>red<a epub:type="noteref" href="#fn">1</a>blue</p><aside id="fn" epub:type="footnote">Note.</aside>`,
  d4NoAside: `<p>red<a epub:type="noteref" href="#fn">1</a>blue</p>`,
  d5: "lead<p>mid</p>tail",
};

describe("BLOCK-TEXT-ORDER-1 — main extractOrderedRuns", () => {
  it("(m1) runs split on nested entry and exit", () => {
    expect(runShape(FIXTURES.d1)).toEqual([
      { runOrdinal: 0, blockTag: "div", text: "before ", start: 0 },
      { runOrdinal: 1, blockTag: "p", text: "inside", start: 7 },
      { runOrdinal: 2, blockTag: "div", text: " after", start: 13 },
    ]);
  });

  it("(m2) touching text, no whitespace inserted", () => {
    expect(runShape(FIXTURES.d2)).toEqual([
      { runOrdinal: 0, blockTag: "div", text: "before", start: 0 },
      { runOrdinal: 1, blockTag: "p", text: "inside", start: 6 },
      { runOrdinal: 2, blockTag: "div", text: "after", start: 12 },
    ]);
  });

  it("(m3) empty and suppressed nested blocks split runs", () => {
    expect(runShape(FIXTURES.d3a)).toEqual([
      { runOrdinal: 0, blockTag: "div", text: "a", start: 0 },
      { runOrdinal: 1, blockTag: "div", text: "b", start: 1 },
    ]);
    expect(runShape(FIXTURES.d3b)).toEqual([
      { runOrdinal: 0, blockTag: "div", text: "red", start: 0 },
      { runOrdinal: 1, blockTag: "div", text: "blue", start: 3 },
    ]);
  });

  it("(m4) suppressed inline does not split", () => {
    expect(runShape(FIXTURES.d4)).toEqual([{ runOrdinal: 0, blockTag: "p", text: "redblue", start: 0 }]);
  });

  it("(m5) orphan root text keeps its DOM position (blank root text dropped)", () => {
    expect(runShape(FIXTURES.d5)).toEqual([
      { runOrdinal: 0, blockTag: "body", text: "lead", start: 0 },
      { runOrdinal: 1, blockTag: "p", text: "mid", start: 4 },
      { runOrdinal: 2, blockTag: "body", text: "tail", start: 7 },
    ]);
    expect(runShape(`\n${FIXTURES.d5}\n`).map((r) => r.text)).toEqual(["lead", "mid", "tail"]);
  });

  it("(m6) cue offset", () => {
    const withAside = orderedRuns(FIXTURES.d4);
    expect(withAside.runs.map((r) => r.text)).toEqual(["redblue"]);
    expect(withAside.cues).toEqual([{ runOrdinal: 0, offset: 3, text: "Note." }]);
    const withoutAside = orderedRuns(FIXTURES.d4NoAside);
    expect(withoutAside.runs.map((r) => r.text)).toEqual(["redblue"]);
    expect(withoutAside.cues).toEqual([]);
  });

  it("(m7) legacy plans byte-equivalent", () => {
    const text = (t) => ({ type: "text", text: t });
    const BASE = {
      d1: { plans: [[text("before "), text("inside"), text(" after")]], texts: ["before inside after"] },
      d2: { plans: [[text("before"), text("inside"), text("after")]], texts: ["beforeinsideafter"] },
      d3a: { plans: [[text("a"), text("b")]], texts: ["ab"] },
      d3b: { plans: [[text("red"), text("blue")]], texts: ["redblue"] },
      d4: { plans: [[text("red"), { type: "footnoteCue", text: "Note." }, text("blue")]], texts: ["redblue"] },
      d4NoAside: { plans: [[text("red"), text("blue")]], texts: ["redblue"] },
      d5: { plans: [[text("lead")], [text("mid")], [text("tail")]], texts: ["lead", "mid", "tail"] },
    };
    for (const [name, body] of Object.entries(FIXTURES)) {
      const { $, $root } = load(body);
      expect({ plans: extractor.extractBlockPlans($, $root), texts: extractor.extractBlockTexts($, $root) }, name).toEqual(BASE[name]);
    }
  });

  it("(m8) extractWords is not routed through the helper", () => {
    const out = execFileSync("git", ["grep", "-n", "extractOrderedRuns", "--", "main", "src", "preload.js"], {
      cwd: process.cwd(),
      encoding: "utf8",
    });
    const lines = out.trim().split(/\r?\n/);
    expect(lines).toHaveLength(2);
    expect(lines[0]).toMatch(/^main\/epub-word-extractor\.js:\d+:function extractOrderedRuns\(\$, \$root\) \{$/);
    expect(lines[1]).toMatch(/^main\/epub-word-extractor\.js:\d+: {2}extractOrderedRuns,$/);
  });
});
