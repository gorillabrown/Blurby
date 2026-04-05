// tests/rich-article-capture.test.mjs — EXT-5C regression tests
//
// Covers: collectArticleAssets, isJunkImageUrl, rankHeroImage,
//         detectImageExt, isImageTooSmall, sanitizeHtmlForEpub,
//         and extractArticleFromHtml (articleImages field only).
//
// CommonJS modules are loaded via createRequire; no Electron runtime needed
// for these pure-logic / cheerio-backed functions.

import { describe, it, expect } from "vitest";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { collectArticleAssets, isJunkImageUrl, rankHeroImage, extractArticleFromHtml } = require("../main/url-extractor");
const { detectImageExt, isImageTooSmall } = require("../main/ipc/misc");
const { sanitizeHtmlForEpub, imageMediaType } = require("../main/epub-converter");

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal PNG buffer with IHDR width/height at the canonical offsets.
 *  PNG layout: 8-byte signature, then IHDR chunk:
 *    4 bytes length, 4 bytes "IHDR", 4 bytes width (BE), 4 bytes height (BE), ...
 *  Width starts at offset 16, height at offset 20.
 */
function buildPngBuffer(width, height) {
  const buf = Buffer.alloc(32);
  // PNG signature
  buf[0] = 0x89; buf[1] = 0x50; buf[2] = 0x4e; buf[3] = 0x47;
  buf[4] = 0x0d; buf[5] = 0x0a; buf[6] = 0x1a; buf[7] = 0x0a;
  // IHDR length (13) + chunk type
  buf.writeUInt32BE(13, 8);
  buf[12] = 0x49; buf[13] = 0x48; buf[14] = 0x44; buf[15] = 0x52; // "IHDR"
  // Width and height
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

/** Build a minimal JPEG buffer — just the SOI marker bytes. */
function buildJpegBuffer() {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
}

/** Build a GIF buffer with the GIF87a/GIF89a magic bytes. */
function buildGifBuffer() {
  return Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
}

/** Build a WebP buffer — RIFF header + WEBP marker. */
function buildWebpBuffer() {
  const buf = Buffer.alloc(12);
  buf[0] = 0x52; buf[1] = 0x49; buf[2] = 0x46; buf[3] = 0x46; // "RIFF"
  buf[4] = 0x00; buf[5] = 0x00; buf[6] = 0x00; buf[7] = 0x00; // file size (unused)
  buf[8] = 0x57; buf[9] = 0x45; buf[10] = 0x42; buf[11] = 0x50; // "WEBP"
  return buf;
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe("Rich Article Capture (EXT-5C)", () => {

  // ── collectArticleAssets ──────────────────────────────────────────────────

  describe("collectArticleAssets", () => {
    it("extracts inline images from article HTML with resolved URLs", () => {
      const html = `<p>Text</p><img src="/images/photo.jpg" alt="A photo">`;
      const { images } = collectArticleAssets(html, "https://example.com");
      expect(images).toHaveLength(1);
      expect(images[0].src).toBe("/images/photo.jpg");
      expect(images[0].alt).toBe("A photo");
      expect(images[0].resolvedUrl).toBe("https://example.com/images/photo.jpg");
    });

    it("deduplicates repeated image URLs", () => {
      const html = `
        <img src="https://example.com/photo.jpg" alt="first">
        <img src="https://example.com/photo.jpg" alt="second">
        <img src="https://example.com/other.jpg" alt="other">
      `;
      const { images } = collectArticleAssets(html, "https://example.com");
      const urls = images.map((i) => i.resolvedUrl);
      const unique = new Set(urls);
      expect(unique.size).toBe(urls.length);
      expect(images).toHaveLength(2);
    });

    it("associates figcaption text with parent figure images", () => {
      const html = `
        <figure>
          <img src="https://example.com/diagram.png" alt="Diagram">
          <figcaption>Figure 1: System diagram</figcaption>
        </figure>
      `;
      const { images } = collectArticleAssets(html, "https://example.com");
      expect(images).toHaveLength(1);
      expect(images[0].caption).toBe("Figure 1: System diagram");
    });

    it("limits results to ARTICLE_MAX_INLINE_IMAGES (20)", () => {
      const imgs = Array.from({ length: 30 }, (_, i) =>
        `<img src="https://example.com/img${i}.jpg" alt="img${i}">`
      ).join("");
      const html = `<article>${imgs}</article>`;
      const { images } = collectArticleAssets(html, "https://example.com");
      expect(images.length).toBeLessThanOrEqual(20);
    });

    it("returns empty array for null/empty HTML", () => {
      expect(collectArticleAssets(null, "https://example.com").images).toEqual([]);
      expect(collectArticleAssets("", "https://example.com").images).toEqual([]);
    });
  });

  // ── isJunkImageUrl ────────────────────────────────────────────────────────

  describe("isJunkImageUrl", () => {
    it("rejects URLs containing junk patterns (logo, avatar, icon, tracking, pixel)", () => {
      const junkUrls = [
        "https://example.com/images/logo.png",
        "https://example.com/users/avatar-123.jpg",
        "https://example.com/assets/icon-close.svg",
        "https://tracking.example.com/pixel.gif",
        "https://example.com/sprites/sprite-sheet.png",
        "https://example.com/ads/badge.png",
        "https://example.com/ui/button-play.png",
        "https://example.com/blank.gif",
        "https://example.com/spacer.gif",
        "https://example.com/1x1.gif",
      ];
      for (const url of junkUrls) {
        expect(isJunkImageUrl(url), `expected junk: ${url}`).toBe(true);
      }
    });

    it("accepts normal article image URLs", () => {
      const validUrls = [
        "https://example.com/articles/hero-photo.jpg",
        "https://cdn.example.com/media/2024/report-cover.png",
        "https://images.example.com/gallery/landscape.webp",
        "https://example.com/content/diagram.png",
      ];
      for (const url of validUrls) {
        expect(isJunkImageUrl(url), `expected valid: ${url}`).toBe(false);
      }
    });
  });

  // ── rankHeroImage ─────────────────────────────────────────────────────────

  describe("rankHeroImage", () => {
    const mockDoc = { querySelector: () => null };

    it("prefers metadata image that also appears in article body", () => {
      const metaUrl = "https://example.com/hero.jpg";
      const articleImages = [
        { resolvedUrl: "https://example.com/hero.jpg" },
        { resolvedUrl: "https://example.com/other.jpg" },
      ];
      const result = rankHeroImage(metaUrl, articleImages, mockDoc, "https://example.com");
      expect(result).toBe(metaUrl);
    });

    it("falls back to first non-junk article image when metadata missing", () => {
      const articleImages = [
        { resolvedUrl: "https://example.com/article-photo.jpg" },
        { resolvedUrl: "https://example.com/sidebar.jpg" },
      ];
      const result = rankHeroImage(null, articleImages, mockDoc, "https://example.com");
      expect(result).toBe("https://example.com/article-photo.jpg");
    });

    it("rejects junk URLs and falls back to next candidate", () => {
      const articleImages = [
        { resolvedUrl: "https://example.com/logo.png" },       // junk
        { resolvedUrl: "https://example.com/icon-share.png" }, // junk
        { resolvedUrl: "https://example.com/story-photo.jpg" }, // valid
      ];
      const result = rankHeroImage(null, articleImages, mockDoc, "https://example.com");
      expect(result).toBe("https://example.com/story-photo.jpg");
    });

    it("returns null when no valid candidates exist", () => {
      const articleImages = [
        { resolvedUrl: "https://example.com/logo.png" },
        { resolvedUrl: "https://example.com/pixel.gif" },
      ];
      const result = rankHeroImage(null, articleImages, mockDoc, "https://example.com");
      expect(result).toBeNull();
    });
  });

  // ── detectImageExt / isImageTooSmall ──────────────────────────────────────

  describe("detectImageExt / isImageTooSmall", () => {
    it("detects JPEG from magic bytes", () => {
      expect(detectImageExt(buildJpegBuffer())).toBe(".jpg");
    });

    it("detects PNG from magic bytes", () => {
      expect(detectImageExt(buildPngBuffer(800, 600))).toBe(".png");
    });

    it("detects GIF from magic bytes", () => {
      expect(detectImageExt(buildGifBuffer())).toBe(".gif");
    });

    it("detects WebP from magic bytes", () => {
      expect(detectImageExt(buildWebpBuffer())).toBe(".webp");
    });

    it("rejects HTML error pages masquerading as images", () => {
      const htmlBuf = Buffer.from("<!DOCTYPE html><html><body>404 Not Found</body></html>");
      expect(detectImageExt(htmlBuf)).toBeNull();
    });

    it("flags small PNG images as too small (100x100)", () => {
      // ARTICLE_IMAGE_MIN_SIZE is 200, so 100x100 should be rejected
      const smallPng = buildPngBuffer(100, 100);
      expect(isImageTooSmall(smallPng, ".png")).toBe(true);
    });

    it("does not flag large PNG images as too small", () => {
      const largePng = buildPngBuffer(800, 600);
      expect(isImageTooSmall(largePng, ".png")).toBe(false);
    });

    it("returns null for buffers with unrecognized format", () => {
      const unknown = Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]);
      expect(detectImageExt(unknown)).toBeNull();
    });
  });

  // ── sanitizeHtmlForEpub ───────────────────────────────────────────────────

  describe("sanitizeHtmlForEpub", () => {
    it("preserves figure, figcaption, and img tags", () => {
      const html = `
        <article>
          <p>Intro paragraph.</p>
          <figure>
            <img src="https://example.com/photo.jpg" alt="A photo">
            <figcaption>Caption text here</figcaption>
          </figure>
          <p>More content.</p>
        </article>
      `;
      const { html: sanitized } = sanitizeHtmlForEpub(html);
      expect(sanitized).toContain("<figure>");
      expect(sanitized).toContain("<figcaption>");
      expect(sanitized).toContain("<img");
      expect(sanitized).toContain('src="https://example.com/photo.jpg"');
      expect(sanitized).toContain('alt="A photo"');
    });

    it("strips disallowed tags (script, style, iframe) but preserves content structure", () => {
      const html = `<p>Safe text</p><script>alert("xss")</script><p>More text</p>`;
      const { html: sanitized } = sanitizeHtmlForEpub(html);
      expect(sanitized).not.toContain("<script");
      expect(sanitized).toContain("Safe text");
      expect(sanitized).toContain("More text");
    });

    it("returns images array listing referenced img srcs", () => {
      const html = `
        <p>Text</p>
        <img src="https://example.com/a.jpg" alt="A">
        <img src="https://example.com/b.png" alt="B">
      `;
      const { images } = sanitizeHtmlForEpub(html);
      expect(images).toHaveLength(2);
      expect(images.map((i) => i.src)).toContain("https://example.com/a.jpg");
      expect(images.map((i) => i.src)).toContain("https://example.com/b.png");
    });
  });

  // ── extractArticleFromHtml ────────────────────────────────────────────────

  describe("extractArticleFromHtml", () => {
    it("returns articleImages array in extraction result", () => {
      const html = `
        <html>
          <head><title>Test Article</title></head>
          <body>
            <article>
              <p>Test article content with enough words to pass extraction.</p>
              <figure>
                <img src="https://example.com/photo.jpg" alt="Photo">
                <figcaption>A photo</figcaption>
              </figure>
            </article>
          </body>
        </html>
      `;
      const result = extractArticleFromHtml(html, "https://example.com/article");
      expect(result).toHaveProperty("articleImages");
      expect(Array.isArray(result.articleImages)).toBe(true);
    });

    it("includes image entries with expected shape when article contains images", () => {
      const html = `
        <html>
          <head><title>Photo Essay</title></head>
          <body>
            <article>
              <p>This article has a photograph worth examining in detail.</p>
              <figure>
                <img src="https://example.com/main-photo.jpg" alt="Main photo">
                <figcaption>The main photograph</figcaption>
              </figure>
              <p>The image above shows the subject clearly.</p>
            </article>
          </body>
        </html>
      `;
      const result = extractArticleFromHtml(html, "https://example.com/essay");
      expect(Array.isArray(result.articleImages)).toBe(true);
      if (result.articleImages.length > 0) {
        const img = result.articleImages[0];
        expect(img).toHaveProperty("src");
        expect(img).toHaveProperty("resolvedUrl");
        expect(img).toHaveProperty("alt");
      }
    });
  });

});
