import { describe, it, expect } from "vitest";

const { extractBlockTexts } = require("../main/epub-word-extractor.js");
const { segmentWords } = require("../src/utils/segmentWords.ts");
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
});
