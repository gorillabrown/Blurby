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

function attr(node, name) {
  return node && node.attribs ? (node.attribs[name] || "") : "";
}

function containsToken(value, token) {
  return String(value || "").toLowerCase().split(/\s+/).includes(token.toLowerCase());
}

function normalizeHash(href) {
  if (!href || href[0] !== "#") return null;
  return href.slice(1).trim();
}

function isLikelyFootnoteRef(node, parent) {
  if (!node || node.type !== "tag") return false;
  const tag = (node.name || "").toLowerCase();
  const href = attr(node, "href");
  const epubType = attr(node, "epub:type");
  const role = attr(node, "role");
  const cls = `${attr(node, "class")} ${attr(node, "id")}`.toLowerCase();

  if (containsToken(epubType, "noteref") || containsToken(role, "doc-noteref")) return true;
  if (tag === "a" && href.startsWith("#") && /note|footnote|endnote|fn|ref/.test(cls)) return true;
  if (tag === "a" && href.startsWith("#") && parent && (parent.name || "").toLowerCase() === "sup") return true;
  if (tag === "sup" && /note|footnote|endnote|fn|ref/.test(cls)) return true;
  return false;
}

function isFootnoteBodyNode(node, targetIds) {
  if (!node || node.type !== "tag") return false;
  const tag = (node.name || "").toLowerCase();
  const id = attr(node, "id");
  const epubType = attr(node, "epub:type");
  const role = attr(node, "role");
  const cls = `${attr(node, "class")} ${id}`.toLowerCase();

  if (id && targetIds.has(id)) return true;
  if (containsToken(epubType, "footnote") || containsToken(epubType, "endnote") || containsToken(role, "doc-footnote") || containsToken(role, "doc-endnote")) {
    return true;
  }
  if ((tag === "aside" || tag === "section" || tag === "li" || tag === "div" || tag === "p") && /footnote|endnote|notes?\b|fn\d+/.test(cls)) {
    return true;
  }
  return false;
}

function collectTextSkippingNotes(node, targetIds, parent) {
  if (!node) return "";
  if (node.type === "text") return node.data || "";
  if (node.type !== "tag") return "";
  if (isLikelyFootnoteRef(node, parent) || isFootnoteBodyNode(node, targetIds)) return "";

  const children = node.children || [];
  let combined = "";
  for (const child of children) {
    combined += collectTextSkippingNotes(child, targetIds, node);
  }
  return combined;
}

function buildFootnoteTargetTextMap($, $root) {
  const targetIds = new Set();
  const footnoteTexts = new Map();

  $root.find("*").each((_, el) => {
    if (isLikelyFootnoteRef(el, el.parent)) {
      const hrefId = normalizeHash(attr(el, "href"));
      if (hrefId) targetIds.add(hrefId);
    }
  });

  for (const id of targetIds) {
    const target = $root.find(`#${id}`).first();
    if (!target.length) continue;
    let text = "";
    const children = target.get(0).children || [];
    for (const child of children) {
      text += collectTextSkippingNotes(child, targetIds, target.get(0));
    }
    text = text.replace(/\s+/g, " ").trim();
    if (text) footnoteTexts.set(id, text);
  }

  return { targetIds, footnoteTexts };
}

function extractBlockPlans($, $root) {
  const { targetIds, footnoteTexts } = buildFootnoteTargetTextMap($, $root);
  const plans = [];

  function walkInline(node, parent, parts) {
    if (!node) return;
    if (node.type === "text") {
      const text = node.data || "";
      if (text) parts.push({ type: "text", text });
      return;
    }
    if (node.type !== "tag") return;
    if (isFootnoteBodyNode(node, targetIds)) return;
    if (isLikelyFootnoteRef(node, parent)) {
      const hrefId = normalizeHash(attr(node, "href"));
      const text = hrefId ? footnoteTexts.get(hrefId) : "";
      if (text) parts.push({ type: "footnoteCue", text });
      return;
    }
    const children = node.children || [];
    for (const child of children) walkInline(child, node, parts);
  }

  function walk(node) {
    if (!node || node.type !== "tag") return;
    if (isFootnoteBodyNode(node, targetIds)) return;

    const tagName = (node.name || "").toLowerCase();
    if (BLOCK_TAGS.has(tagName)) {
      const parts = [];
      const children = node.children || [];
      for (const child of children) walkInline(child, node, parts);
      if (parts.some((part) => String(part.text || "").trim())) plans.push(parts);
      return;
    }

    const children = node.children || [];
    for (const child of children) {
      if (child.type === "text") {
        const text = child.data || "";
        if (text.trim()) plans.push([{ type: "text", text }]);
      } else if (child.type === "tag") {
        walk(child);
      }
    }
  }

  $root.each((_, el) => walk(el));
  return plans;
}

/**
 * Extract all words from an EPUB file, ordered by spine reading order.
 *
 * @param {string} epubPath - Absolute path to the EPUB file
 * @returns {{ words: string[], sections: Array<{ sectionIndex: number, startWordIdx: number, endWordIdx: number, wordCount: number }>, footnoteCues: Array<{ afterWordIdx: number, text: string }>, totalWords: number }}
 */
async function extractWords(epubPath) {
  const AdmZip = getAdmZip();
  const cheerio = getCheerio();

  let zip;
  try {
    zip = new AdmZip(epubPath);
  } catch (err) {
    console.error(`[epub-word-extractor] Failed to open EPUB: ${err.message}`);
    return { words: [], sections: [], footnoteCues: [], totalWords: 0 };
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
    return { words: [], sections: [], footnoteCues: [], totalWords: 0 };
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
  const footnoteCues = [];
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

    const blockPlans = extractBlockPlans($, $("body"));
    for (const blockParts of blockPlans) {
      for (const part of blockParts) {
        if (part.type === "footnoteCue") {
          const text = String(part.text || "").replace(/\s+/g, " ").trim();
          if (text) {
            footnoteCues.push({
              afterWordIdx: allWords.length - 1,
              text,
            });
          }
          continue;
        }

        const segments = Array.from(segmenter.segment(part.text));
        for (let si = 0; si < segments.length; si++) {
          const { segment, isWordLike } = segments[si];
          if (!isWordLike) continue;

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
    footnoteCues,
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
  return extractBlockPlans($, $root).map((parts) =>
    parts.filter((part) => part.type === "text").map((part) => part.text).join("")
  );
}

module.exports = {
  extractWords,
  extractBlockTexts,
  extractBlockPlans,
  isLikelyFootnoteRef,
  isFootnoteBodyNode,
};
