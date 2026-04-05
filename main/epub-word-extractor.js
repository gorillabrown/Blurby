// main/epub-word-extractor.js — Extract words from EPUB spine sections
// CommonJS only — Electron main process
//
// Opens the EPUB via AdmZip, reads the OPF spine for section order,
// parses each section's XHTML with cheerio, and tokenizes with
// Intl.Segmenter. Produces the same word array that foliate's
// extractWordsFromSection would, but without navigating the visible view.

"use strict";

// ── Lazy-loaded heavy modules ─────────────────────────────────────────────
let _cheerio, _admZip;
function getCheerio() { if (!_cheerio) { _cheerio = require("cheerio"); } return _cheerio; }
function getAdmZip() { if (!_admZip) { _admZip = require("adm-zip"); } return _admZip; }

/** Trailing punctuation regex — must match FoliatePageView.tsx line 72 exactly */
const TRAILING_PUNCT_RE = /^[.!?,;:'"»)\]\u201D\u2019\u2026]+$/;
const BLOCK_TAGS = new Set(["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "li", "td", "section", "article"]);

/**
 * Extract all words from an EPUB file, ordered by spine reading order.
 *
 * @param {string} epubPath - Absolute path to the EPUB file
 * @returns {{ words: string[], sections: Array<{ sectionIndex: number, startWordIdx: number, endWordIdx: number, wordCount: number }>, totalWords: number }}
 */
async function extractWords(epubPath) {
  const AdmZip = getAdmZip();
  const cheerio = getCheerio();

  let zip;
  try {
    zip = new AdmZip(epubPath);
  } catch (err) {
    console.error(`[epub-word-extractor] Failed to open EPUB: ${err.message}`);
    return { words: [], sections: [], totalWords: 0 };
  }

  const entries = zip.getEntries();

  // ── Find OPF path via container.xml ────────────────────────────────────
  const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
  let opfPath = "";
  if (containerEntry) {
    const $ = cheerio.load(containerEntry.getData().toString("utf-8"), { xmlMode: true });
    opfPath = $("rootfile").attr("full-path") || "";
  }

  const opfEntry = entries.find((e) => e.entryName === opfPath);
  if (!opfEntry) {
    console.error(`[epub-word-extractor] Missing OPF: ${opfPath}`);
    return { words: [], sections: [], totalWords: 0 };
  }

  // ── Read spine order + manifest map ────────────────────────────────────
  const spineIds = [];
  const manifestMap = new Map();
  const opfDir = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
  const $opf = cheerio.load(opfEntry.getData().toString("utf-8"), { xmlMode: true });

  $opf("manifest item").each((_, el) => {
    const id = $opf(el).attr("id");
    const href = $opf(el).attr("href");
    if (id && href) {
      manifestMap.set(id, opfDir + href);
    }
  });

  $opf("spine itemref").each((_, el) => {
    const idref = $opf(el).attr("idref");
    if (idref) spineIds.push(idref);
  });

  // ── Intl.Segmenter — same constructor as FoliatePageView line 27 ──────
  const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });

  // ── Extract words from each spine section ──────────────────────────────
  const allWords = [];
  const sections = [];
  const processedPaths = new Set();

  for (let sectionIndex = 0; sectionIndex < spineIds.length; sectionIndex++) {
    const href = manifestMap.get(spineIds[sectionIndex]);
    if (!href) continue;
    if (processedPaths.has(href)) continue;
    processedPaths.add(href);

    const entry = entries.find((e) => e.entryName === href);
    if (!entry) continue;

    const $ = cheerio.load(entry.getData().toString("utf-8"));
    $("script, style").remove();

    const startWordIdx = allWords.length;

    // Walk text by block so inline drop-caps like <span>W</span>hat's preserve
    // adjacency while paragraph-level word boundaries still remain stable.
    const blocks = extractBlockTexts($, $("body"));
    for (const blockText of blocks) {
      const segments = Array.from(segmenter.segment(blockText));
      for (let si = 0; si < segments.length; si++) {
        const { segment, isWordLike } = segments[si];
        if (!isWordLike) continue;

        // Include trailing punctuation — matches FoliatePageView lines 66-78
        let wordWithPunct = segment;
        for (let pi = si + 1; pi < segments.length; pi++) {
          const next = segments[pi];
          if (next.isWordLike) break;
          if (TRAILING_PUNCT_RE.test(next.segment)) {
            wordWithPunct += next.segment;
          } else {
            break;
          }
        }

        allWords.push(wordWithPunct);
      }
    }

    const endWordIdx = allWords.length;
    if (endWordIdx > startWordIdx) {
      sections.push({
        sectionIndex,
        startWordIdx,
        endWordIdx,
        wordCount: endWordIdx - startWordIdx,
      });
    }
  }

  return {
    words: allWords,
    sections,
    totalWords: allWords.length,
  };
}

/**
 * Extract text block-by-block from a cheerio element. Inline text nodes within
 * the same block are concatenated without injected spaces so split drop-caps
 * like `<span>W</span>hat's` remain one lexical word. Distinct block elements
 * become distinct strings so paragraph boundaries still separate naturally.
 */
function extractBlockTexts($, $root) {
  const texts = [];

  function collectText(node) {
    if (!node) return "";
    if (node.type === "text") return node.data || "";
    if (node.type !== "tag") return "";

    const children = node.children || [];
    let combined = "";
    for (const child of children) {
      combined += collectText(child);
    }
    return combined;
  }

  function walk(node) {
    if (!node || node.type !== "tag") return;
    const tagName = (node.name || "").toLowerCase();

    if (BLOCK_TAGS.has(tagName)) {
      const text = collectText(node);
      if (text.trim()) texts.push(text);
      return;
    }

    const children = node.children || [];
    for (const child of children) {
      if (child.type === "text") {
        const text = child.data || "";
        if (text.trim()) texts.push(text);
      } else if (child.type === "tag") {
        walk(child);
      }
    }
  }

  $root.each((_, el) => walk(el));
  return texts;
}

module.exports = { extractWords, extractBlockTexts };
