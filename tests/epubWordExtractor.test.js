import { describe, it, expect } from "vitest";

const { extractBlockTexts, extractBlockPlans } = require("../main/epub-word-extractor.js");
import { segmentWords } from "../src/utils/segmentWords";
const cheerio = require("cheerio");

describe("epub-word-extractor block text extraction", () => {
  it("preserves inline adjacency for drop-cap opening words", () => {
    const $ = cheerio.load(`<body><p><span class="dropcap">W</span>hat's two plus two?</p></body>`);
    const blocks = extractBlockTexts($, $("body"));

    expect(blocks).toEqual([`What's two plus two?`]);
    expect(segmentWords(blocks[0])).toEqual(["What's", "two", "plus", "two?"]);
  });

  it("keeps paragraph blocks separate without injecting inline split spaces", () => {
    const $ = cheerio.load(`<body><p><span>A</span>las.</p><p><span>B</span>ravo.</p></body>`);
    const blocks = extractBlockTexts($, $("body"));

    expect(blocks).toEqual(["Alas.", "Bravo."]);
  });

  it("skips footnote markers and footnote bodies from the base narration text", () => {
    const $ = cheerio.load(`
      <body>
        <p>The title of Metaphysic<a epub:type="noteref" href="#fn1"><sup>[1]</sup></a> grows richer.</p>
        <aside id="fn1" epub:type="footnote">[1] In contradistinction to the Metaphysic of Ethics.</aside>
      </body>
    `);

    const blocks = extractBlockTexts($, $("body"));
    expect(blocks).toEqual(["The title of Metaphysic grows richer."]);
    expect(segmentWords(blocks[0])).toEqual(["The", "title", "of", "Metaphysic", "grows", "richer."]);
  });

  it("emits a footnote cue at the reference point for immediate-read mode", () => {
    const $ = cheerio.load(`
      <body>
        <p>The title of Metaphysic<a epub:type="noteref" href="#fn1"><sup>[1]</sup></a> grows richer.</p>
        <aside id="fn1" epub:type="footnote">[1] In contradistinction to the Metaphysic of Ethics.</aside>
      </body>
    `);

    const plans = extractBlockPlans($, $("body"));
    expect(plans).toHaveLength(1);
    expect(plans[0]).toEqual([
      { type: "text", text: "The title of Metaphysic" },
      { type: "footnoteCue", text: "[1] In contradistinction to the Metaphysic of Ethics." },
      { type: "text", text: " grows richer." },
    ]);
  });
});
