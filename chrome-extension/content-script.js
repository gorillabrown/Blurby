// content-script.js — Injected into pages to extract readable content via Readability.js
// Communicates with service-worker.js via chrome.runtime messaging.

(function () {
  "use strict";

  // Readability is loaded as a separate content script (readability.js) before this one.
  // It exposes `Readability` on the global scope.

  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function extractPrimaryImage() {
    // Try og:image first
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && ogImage.content) return ogImage.content;

    // Try twitter:image
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage && twitterImage.content) return twitterImage.content;

    // Try first large image in article
    const article = document.querySelector("article") || document.body;
    const images = article.querySelectorAll("img");
    for (const img of images) {
      const w = img.naturalWidth || parseInt(img.getAttribute("width") || "0", 10);
      const h = img.naturalHeight || parseInt(img.getAttribute("height") || "0", 10);
      if ((w >= 300 && h >= 200) || (!w && !h && img.src)) {
        return img.src;
      }
    }
    return null;
  }

  function extractPublicationDate() {
    // Try structured data
    const selectors = [
      'meta[property="article:published_time"]',
      'meta[name="date"]',
      'meta[name="publish-date"]',
      'meta[name="DC.date.issued"]',
      'time[datetime]',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const val = el.content || el.getAttribute("datetime") || el.textContent;
        if (val) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) return d.toISOString();
        }
      }
    }
    return null;
  }

  function extractSiteName() {
    const ogSite = document.querySelector('meta[property="og:site_name"]');
    if (ogSite && ogSite.content) return ogSite.content;
    return new URL(window.location.href).hostname.replace(/^www\./, "");
  }

  function cleanHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Remove scripts, iframes, tracking pixels, ads
    const removeSelectors = [
      "script", "iframe", "noscript", "style",
      'img[width="1"]', 'img[height="1"]',
      '[class*="ad-"]', '[class*="advertisement"]',
      '[id*="ad-"]', '[data-ad]',
    ];
    for (const sel of removeSelectors) {
      doc.querySelectorAll(sel).forEach((el) => el.remove());
    }

    // Remove event handler attributes
    doc.querySelectorAll("*").forEach((el) => {
      for (const attr of [...el.attributes]) {
        if (attr.name.startsWith("on")) {
          el.removeAttribute(attr.name);
        }
      }
    });

    return doc.body ? doc.body.innerHTML : html;
  }

  function extractArticle() {
    try {
      // Clone the document so Readability doesn't mutate the live DOM
      const clone = document.cloneNode(true);
      const reader = new Readability(clone, {
        charThreshold: 50,
      });
      const article = reader.parse();

      if (!article || !article.textContent) {
        return { error: "Could not extract readable content from this page." };
      }

      const cleanContent = cleanHtml(article.content);
      const textContent = article.textContent;
      const wordCount = countWords(textContent);

      return {
        title: article.title || document.title,
        author: article.byline || null,
        content: cleanContent,
        textContent: textContent,
        wordCount: wordCount,
        publishedDate: extractPublicationDate(),
        siteName: extractSiteName(),
        imageUrl: extractPrimaryImage(),
        sourceUrl: window.location.href,
        excerpt: article.excerpt || textContent.slice(0, 200),
      };
    } catch (err) {
      return { error: "Extraction failed: " + err.message };
    }
  }

  // Listen for extraction requests from the service worker
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "extract-article") {
      const result = extractArticle();
      sendResponse(result);
    }
    return true; // Keep message channel open for async response
  });
})();
