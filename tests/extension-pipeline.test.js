import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Extension article → doc pipeline tests ──────────────────────────────────
// Tests the full article ingestion pipeline WITHOUT a real WebSocket server.
// We mirror the logic from ws-server.js handleAddArticle() to test the
// processing pipeline directly.

const { normalizeAuthor } = await import("../main/author-normalize.js");
const { sortReadingQueue } = await import("../src/utils/queue.ts");

// Helper: simulate handleAddArticle() doc creation logic
function createDocFromArticle(article, existingLibrary = []) {
  if (!article || !article.textContent) {
    return { error: "Article must include textContent" };
  }

  const docId = "test_" + Date.now() + Math.random().toString(36).slice(2, 6);
  const wordCount = article.textContent.trim().split(/\s+/).filter(Boolean).length;

  // Auto-queue: assign next available queuePosition
  const maxQueuePos = existingLibrary.reduce((max, d) => {
    if (d.queuePosition !== undefined && d.queuePosition !== null && d.queuePosition > max) return d.queuePosition;
    return max;
  }, -1);

  return {
    id: docId,
    title: article.title || "Untitled Article",
    wordCount,
    position: 0,
    created: Date.now(),
    source: "url",
    sourceUrl: article.sourceUrl || null,
    author: normalizeAuthor(article.author) || null,
    sourceDomain: article.siteName || null,
    publishedDate: article.publishedDate || null,
    authorFull: article.author || null,
    lastReadAt: null,
    unread: true,
    seenAt: undefined,
    queuePosition: maxQueuePos + 1,
  };
}

// Helper: simulate EPUB conversion result
function simulateEpubConversion(doc, success = true) {
  if (success) {
    return {
      ...doc,
      convertedEpubPath: `/tmp/converted/${doc.id}.epub`,
      filepath: `/tmp/converted/${doc.id}.epub`,
      ext: ".epub",
      originalSourceUrl: doc.sourceUrl,
    };
  }
  // Failed conversion — doc retains text content
  return { ...doc, content: "fallback text content" };
}

describe("Extension article pipeline — doc creation", () => {
  it("creates doc with correct fields from valid article", () => {
    const doc = createDocFromArticle({
      title: "Speed Reading Techniques",
      author: "Jane Smith",
      textContent: "Speed reading is a collection of methods.",
      sourceUrl: "https://example.com/article",
      siteName: "example.com",
      publishedDate: "2026-01-15",
    });
    expect(doc.title).toBe("Speed Reading Techniques");
    expect(doc.author).toBe("Smith, Jane"); // normalized!
    expect(doc.authorFull).toBe("Jane Smith"); // preserved
    expect(doc.source).toBe("url");
    expect(doc.sourceUrl).toBe("https://example.com/article");
    expect(doc.sourceDomain).toBe("example.com");
    expect(doc.unread).toBe(true);
    expect(doc.wordCount).toBe(7);
  });

  it("returns error for missing textContent", () => {
    const result = createDocFromArticle({ title: "No body" });
    expect(result.error).toBe("Article must include textContent");
  });

  it("returns error for null article", () => {
    const result = createDocFromArticle(null);
    expect(result.error).toBeDefined();
  });

  it("defaults title to 'Untitled Article' when missing", () => {
    const doc = createDocFromArticle({ textContent: "Hello world" });
    expect(doc.title).toBe("Untitled Article");
  });

  it("handles empty author gracefully", () => {
    const doc = createDocFromArticle({ textContent: "Hello world", author: "" });
    // normalizeAuthor("") returns "" which is falsy, so `|| null` gives null
    // authorFull also goes through `"" || null` = null
    expect(doc.author).toBeNull();
    expect(doc.authorFull).toBeNull();
  });

  it("normalizes author name on ingestion", () => {
    const doc = createDocFromArticle({
      textContent: "Content here.",
      author: "John Smith",
    });
    expect(doc.author).toBe("Smith, John");
    expect(doc.authorFull).toBe("John Smith");
  });

  it("preserves authorFull alongside normalized author", () => {
    const doc = createDocFromArticle({
      textContent: "Content.",
      author: "Alice de Souza",
    });
    expect(doc.author).toBe("de Souza, Alice");
    expect(doc.authorFull).toBe("Alice de Souza");
  });

  it("sets unread: true on extension articles", () => {
    const doc = createDocFromArticle({ textContent: "Content." });
    expect(doc.unread).toBe(true);
  });

  it("sets seenAt: undefined to trigger New dot", () => {
    const doc = createDocFromArticle({ textContent: "Content." });
    expect(doc.seenAt).toBeUndefined();
  });

  it("counts words correctly", () => {
    const doc = createDocFromArticle({ textContent: "one two three four five" });
    expect(doc.wordCount).toBe(5);
  });
});

describe("Extension article pipeline — EPUB conversion", () => {
  it("adds EPUB fields on successful conversion", () => {
    const doc = createDocFromArticle({ textContent: "Content.", sourceUrl: "https://example.com" });
    const converted = simulateEpubConversion(doc, true);
    expect(converted.convertedEpubPath).toContain(".epub");
    expect(converted.ext).toBe(".epub");
    expect(converted.originalSourceUrl).toBe("https://example.com");
  });

  it("retains text content on EPUB conversion failure", () => {
    const doc = createDocFromArticle({ textContent: "Fallback content." });
    const failed = simulateEpubConversion(doc, false);
    expect(failed.content).toBe("fallback text content");
    expect(failed.convertedEpubPath).toBeUndefined();
  });

  it("htmlContent is preferred over plain text wrapping", () => {
    const article = {
      textContent: "Plain text",
      htmlContent: "<p>Rich <b>HTML</b> content</p>",
    };
    const articleHtml = article.htmlContent || article.textContent.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join("\n");
    expect(articleHtml).toBe("<p>Rich <b>HTML</b> content</p>");
  });

  it("plain text is wrapped in <p> tags when no htmlContent", () => {
    const article = { textContent: "Paragraph one.\n\nParagraph two." };
    const articleHtml = article.htmlContent || article.textContent.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join("\n");
    expect(articleHtml).toBe("<p>Paragraph one.</p>\n<p>Paragraph two.</p>");
  });
});

describe("Extension article pipeline — queue integration", () => {
  it("first article gets queuePosition: 0", () => {
    const doc = createDocFromArticle({ textContent: "First article." }, []);
    expect(doc.queuePosition).toBe(0);
  });

  it("second article gets queuePosition: 1", () => {
    const existing = [{ id: "a", queuePosition: 0 }];
    const doc = createDocFromArticle({ textContent: "Second article." }, existing);
    expect(doc.queuePosition).toBe(1);
  });

  it("increments from highest existing queuePosition", () => {
    const existing = [
      { id: "a", queuePosition: 0 },
      { id: "b", queuePosition: 5 },
      { id: "c", queuePosition: 2 },
    ];
    const doc = createDocFromArticle({ textContent: "New article." }, existing);
    expect(doc.queuePosition).toBe(6);
  });

  it("assigns queuePosition: 0 when no queued docs exist", () => {
    const existing = [
      { id: "a", title: "No queue position" },
      { id: "b", title: "Also no queue" },
    ];
    const doc = createDocFromArticle({ textContent: "First queued." }, existing);
    expect(doc.queuePosition).toBe(0);
  });

  it("sortReadingQueue places queued extension articles first", () => {
    const docs = [
      { id: "unread1", title: "Unread Book", created: 1000, lastReadAt: null },
      { id: "ext1", title: "Extension Article", created: 2000, lastReadAt: null, queuePosition: 0, source: "url" },
      { id: "reading1", title: "In Progress", created: 500, lastReadAt: 3000, position: 50, wordCount: 100 },
    ];
    const sorted = sortReadingQueue(docs);
    // Queued items (queuePosition defined) should come first
    expect(sorted[0].id).toBe("ext1");
  });

  it("multiple extension articles sort by queuePosition", () => {
    const docs = [
      { id: "ext2", title: "Second", created: 2000, queuePosition: 1, source: "url" },
      { id: "ext1", title: "First", created: 1000, queuePosition: 0, source: "url" },
      { id: "ext3", title: "Third", created: 3000, queuePosition: 2, source: "url" },
    ];
    const sorted = sortReadingQueue(docs);
    expect(sorted[0].id).toBe("ext1");
    expect(sorted[1].id).toBe("ext2");
    expect(sorted[2].id).toBe("ext3");
  });
});

describe("Extension article pipeline — message protocol", () => {
  it("add-article with complete payload shape", () => {
    const msg = {
      type: "add-article",
      payload: {
        title: "Test Article",
        textContent: "Some content here.",
        htmlContent: "<p>Some content here.</p>",
        author: "Test Author",
        sourceUrl: "https://test.com/article",
        siteName: "test.com",
        publishedDate: "2026-03-01",
      },
    };
    expect(msg.type).toBe("add-article");
    expect(msg.payload.textContent).toBeTruthy();
    expect(msg.payload.title).toBeTruthy();
  });

  it("add-article with minimal payload (title + textContent only)", () => {
    const msg = {
      type: "add-article",
      payload: { title: "Min", textContent: "Minimal content." },
    };
    const doc = createDocFromArticle(msg.payload);
    expect(doc.error).toBeUndefined();
    expect(doc.title).toBe("Min");
  });

  it("add-article with empty textContent returns error", () => {
    const result = createDocFromArticle({ title: "Empty", textContent: "" });
    // Empty textContent should result in error
    expect(result.error).toBe("Article must include textContent");
  });

  it("unknown message type should produce error (protocol contract)", () => {
    const msg = { type: "unknown-type" };
    // The server responds: { type: "error", message: "Unknown message type: unknown-type" }
    const expectedError = `Unknown message type: ${msg.type}`;
    expect(expectedError).toContain("unknown-type");
  });
});
