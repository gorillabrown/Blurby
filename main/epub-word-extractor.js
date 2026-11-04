// main/epub-word-extractor.js — Extract words from EPUB spine sections
// CommonJS only — Electron main process
//
// Opens the EPUB via openZip (main/zip-read.js), reads the OPF spine for section order,
// parses each section's XHTML with cheerio, and tokenizes with
// Intl.Segmenter. Produces the same word array that foliate's
// extractWordsFromSection would, but without navigating the visible view.

"use strict";

// ── Lazy-loaded heavy modules ─────────────────────────────────────────────
let _cheerio;
function getCheerio() { if (!_cheerio) { _cheerio = require("cheerio"); } return _cheerio; }
const { createEntryReader, openZip } = require("./zip-read");

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
 * BLOCK-TEXT-ORDER-1 (contracts D-1 and A-1, MAIN_ACCEPT): the section's accepted text as raw runs in DOM order.
 * Acceptance is exactly extractBlockPlans' (walk above the outermost block, walkInline below it, the same footnote
 * predicates), but a run ends at the entry or exit of any BLOCK_TAGS element, including an empty or suppressed one;
 * a suppressed inline element does not end a run. Runs whose text is all whitespace are not emitted. Each run is
 * { runOrdinal, blockTag, text, start }: text is the exact concatenation of its text nodes and start is its stream
 * offset (the sum of the earlier runs' lengths). Each cue is { runOrdinal, offset, text }, offset being the UTF-16
 * offset within that run where the skipped reference stood; a cue met in a run that is not emitted goes to the end
 * of the previous emitted run, or to the start of the next one when none came before (runOrdinal -1 when the
 * section emits no run at all). script and style are skipped.
 * Dormant: production never calls it (WORD-INDEX-UNIFY-1 may).
 */
function extractOrderedRuns($, $root) {
  const { targetIds, footnoteTexts } = buildFootnoteTargetTextMap($, $root);
  const runs = [];
  const cues = [];
  let parts = [];
  let runCues = [];
  let carriedCues = [];
  let runBlockTag = "";
  let streamOffset = 0;
  const blockTags = [];

  const tagOf = (node) => (node.name || "").toLowerCase();
  const isBlock = (node) => node && node.type === "tag" && BLOCK_TAGS.has(tagOf(node));
  const containsBlock = (node) => isBlock(node) || (node && node.type === "tag" && (node.children || []).some(containsBlock));
  const isScriptOrStyle = (node) => tagOf(node) === "script" || tagOf(node) === "style";

  function closeRun() {
    const text = parts.join("");
    if (text.trim()) {
      const runOrdinal = runs.length;
      runs.push({ runOrdinal, blockTag: runBlockTag, text, start: streamOffset });
      streamOffset += text.length;
      for (const cue of carriedCues) cues.push({ runOrdinal, offset: 0, text: cue.text });
      for (const cue of runCues) cues.push({ runOrdinal, offset: cue.offset, text: cue.text });
      carriedCues = [];
    } else if (runs.length > 0) {
      const last = runs[runs.length - 1];
      for (const cue of runCues) cues.push({ runOrdinal: last.runOrdinal, offset: last.text.length, text: cue.text });
    } else {
      carriedCues.push(...runCues);
    }
    parts = [];
    runCues = [];
  }

  function acceptText(text) {
    if (parts.length === 0) runBlockTag = blockTags[blockTags.length - 1];
    parts.push(text);
  }

  function skip(node) {
    if (containsBlock(node)) closeRun();
  }

  function enterBlock(node, visitChildren) {
    closeRun();
    blockTags.push(tagOf(node));
    visitChildren();
    blockTags.pop();
    closeRun();
  }

  function walkInline(node, parent) {
    if (!node) return;
    if (node.type === "text") {
      const text = node.data || "";
      if (text) acceptText(text);
      return;
    }
    if (node.type !== "tag") return;
    if (isScriptOrStyle(node) || isFootnoteBodyNode(node, targetIds)) return skip(node);
    if (isLikelyFootnoteRef(node, parent)) {
      const hrefId = normalizeHash(attr(node, "href"));
      const text = hrefId ? footnoteTexts.get(hrefId) : "";
      if (text) runCues.push({ offset: parts.join("").length, text });
      return skip(node);
    }
    const visitChildren = () => {
      for (const child of node.children || []) walkInline(child, node);
    };
    if (isBlock(node)) enterBlock(node, visitChildren);
    else visitChildren();
  }

  function walk(node) {
    if (!node || node.type !== "tag") return;
    if (isScriptOrStyle(node) || isFootnoteBodyNode(node, targetIds)) return skip(node);
    if (isBlock(node)) {
      enterBlock(node, () => {
        for (const child of node.children || []) walkInline(child, node);
      });
      return;
    }
    for (const child of node.children || []) {
      if (child.type === "text") {
        const text = child.data || "";
        if (text.trim()) acceptText(text);
      } else if (child.type === "tag") {
        walk(child);
      }
    }
  }

  $root.each((_, el) => {
    blockTags.length = 0;
    blockTags.push(tagOf(el));
    walk(el);
    closeRun();
  });
  for (const cue of carriedCues) cues.push({ runOrdinal: -1, offset: 0, text: cue.text });
  return { runs, cues };
}

/**
 * Extract all words from an EPUB file, ordered by spine reading order.
 *
 * @param {string} epubPath - Absolute path to the EPUB file
 * @returns {{ words: string[], sections: Array<{ sectionIndex: number, startWordIdx: number, endWordIdx: number, wordCount: number }>, footnoteCues: Array<{ afterWordIdx: number, text: string }>, totalWords: number }}
 */
async function extractWords(epubPath) {
  const cheerio = getCheerio();

  let zip;
  try {
    zip = await openZip(epubPath);
  } catch (err) {
    console.error(`[epub-word-extractor] Failed to open EPUB: ${err.message}`);
    return { words: [], sections: [], footnoteCues: [], totalWords: 0 };
  }

  const entries = zip.getEntries();
  const readEntry = createEntryReader();

  // ── Find OPF path via container.xml ────────────────────────────────────
  const containerEntry = entries.find((e) => e.entryName.endsWith("container.xml"));
  let opfPath = "";
  if (containerEntry) {
    const $ = cheerio.load(readEntry(containerEntry).toString("utf-8"), { xmlMode: true });
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
  const $opf = cheerio.load(readEntry(opfEntry).toString("utf-8"), { xmlMode: true });

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

    const $ = cheerio.load(readEntry(entry).toString("utf-8"));
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

    // BUG-149: Yield between sections so the main-process event loop stays responsive.
    // setImmediate lets pending IPC callbacks run before the next section is processed.
    if (sectionIndex < spineIds.length - 1) {
      await new Promise((resolve) => setImmediate(resolve));
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
  extractOrderedRuns,
  isLikelyFootnoteRef,
  isFootnoteBodyNode,
};
