"use strict";
// main/ipc/reader.js — Highlights, dictionary, notes

const { ipcMain } = require("electron");
const path = require("path");
const fsPromises = require("fs/promises");
const https = require("https");
const {
  DEFINITION_CACHE_MAX,
  DEFINITION_TIMEOUT_MS,
} = require("../constants");

// ── Highlight Formatting (pure, testable) ──────────────────────────────────

function formatHighlightEntry(text, docTitle, wordIndex, totalWords, date) {
  const pct = totalWords > 0 ? Math.round((wordIndex / totalWords) * 100) : 0;
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return (
    `---\n\n> "${text}"\n\n` +
    `— *${docTitle}*, position ${wordIndex}/${totalWords} (${pct}%)\n` +
    `Saved: ${yyyy}-${mm}-${dd} ${hh}:${min}\n\n`
  );
}

function parseDefinitionResponse(data, word) {
  if (!Array.isArray(data) || data.length === 0) {
    return { error: data?.title || "No definition found" };
  }
  const entry = data[0];
  const meaning = entry.meanings?.[0];
  const def = meaning?.definitions?.[0];
  return {
    word: entry.word || word,
    phonetic: entry.phonetic || undefined,
    partOfSpeech: meaning?.partOfSpeech || undefined,
    definition: def?.definition || undefined,
    example: def?.example || undefined,
    synonyms: (meaning?.synonyms || []).slice(0, 5),
  };
}

function register(ctx) {
  const definitionCache = new Map();

  ipcMain.handle("save-highlight", async (_, { docTitle, text, wordIndex, totalWords }) => {
    try {
      const settings = ctx.getSettings();
      const highlightPath = settings.sourceFolder
        ? path.join(settings.sourceFolder, "Blurby Highlights.md")
        : path.join(ctx.getDataPath(), "highlights.md");

      try {
        await fsPromises.access(highlightPath);
      } catch {
        await fsPromises.writeFile(highlightPath, "# Blurby Highlights\n\n");
      }

      const entry = formatHighlightEntry(text, docTitle, wordIndex, totalWords, new Date());
      await fsPromises.appendFile(highlightPath, entry);
      return { ok: true };
    } catch (err) {
      console.error("[reader] save-highlight failed:", err.message);
      return { error: "Could not save highlight — check file permissions." };
    }
  });

  ipcMain.handle("define-word", async (_, word) => {
    const key = word.toLowerCase().trim();
    if (definitionCache.has(key)) return definitionCache.get(key);

    try {
      const data = await new Promise((resolve, reject) => {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`;
        const req = https.get(url, (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch (e) {
              reject(new Error("Invalid JSON response"));
            }
          });
        });
        req.on("error", reject);
        req.setTimeout(DEFINITION_TIMEOUT_MS, () => {
          req.destroy();
          reject(new Error("Request timed out"));
        });
      });

      const result = parseDefinitionResponse(data, word);
      if (result.error) return result;

      if (definitionCache.size >= DEFINITION_CACHE_MAX) {
        const oldest = definitionCache.keys().next().value;
        definitionCache.delete(oldest);
      }
      definitionCache.set(key, result);

      return result;
    } catch (err) {
      console.error("[reader] define-word failed:", err.message);
      const isNetwork = err.message && (
        err.message.includes("ENOTFOUND") || err.message.includes("ECONNREFUSED") ||
        err.message.includes("ETIMEDOUT") || err.message.includes("timed out")
      );
      return { error: isNetwork ? "Could not look up definition — check your connection." : "Definition lookup failed." };
    }
  });

  ipcMain.handle("get-all-highlights", async () => {
    const settings = ctx.getSettings();
    const highlightPath = settings.sourceFolder
      ? path.join(settings.sourceFolder, "Blurby Highlights.md")
      : path.join(ctx.getDataPath(), "highlights.md");

    try {
      const content = await fsPromises.readFile(highlightPath, "utf-8");
      const highlights = [];
      const blocks = content.split("---\n\n");

      for (const block of blocks) {
        const quoteMatch = block.match(/> "(.+?)"/s);
        const metaMatch = block.match(/— \*(.+?)\*, position (\d+)\/(\d+)/);
        const dateMatch = block.match(/Saved: (.+)/);

        if (quoteMatch && metaMatch) {
          highlights.push({
            text: quoteMatch[1],
            docTitle: metaMatch[1],
            docId: "",
            wordIndex: parseInt(metaMatch[2], 10),
            totalWords: parseInt(metaMatch[3], 10),
            date: dateMatch ? dateMatch[1].trim() : "",
          });
        }
      }

      // Try to resolve docIds from library
      const library = ctx.getLibrary();
      for (const h of highlights) {
        const doc = library.find((d) => d.title === h.docTitle);
        if (doc) h.docId = doc.id;
      }

      return highlights;
    } catch {
      return [];
    }
  });

  ipcMain.handle("save-reading-note", async (_, { docId, highlight, note, citation }) => {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, TableOfContents } = require("docx");
    const doc = ctx.getDocById(docId);
    if (!doc) return { error: "Document not found" };

    const safeName = doc.title.replace(/[<>:"/\\|?*]/g, "-").slice(0, 80);
    const settings = ctx.getSettings();
    const outputDir = settings.sourceFolder || ctx.getDataPath();
    const docxPath = path.join(outputDir, `${safeName} — Reading Notes.docx`);
    const jsonPath = path.join(ctx.getDataPath(), `notes-${docId}.json`);

    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });

    try {
      // Load existing notes from JSON sidecar
      let allNotes = [];
      try {
        const raw = await fsPromises.readFile(jsonPath, "utf-8");
        allNotes = JSON.parse(raw);
      } catch { /* no existing notes */ }

      // Append new note
      allNotes.push({ highlight, note, citation, timestamp, docTitle: doc.title });

      // Save JSON sidecar (atomic)
      const jsonTmp = jsonPath + ".tmp";
      await fsPromises.writeFile(jsonTmp, JSON.stringify(allNotes, null, 2), "utf-8");
      await fsPromises.rename(jsonTmp, jsonPath);

      // Regenerate .docx from all notes with Table of Contents
      const paragraphs = [
        new Paragraph({
          children: [new TextRun({ text: "Reading Notes", bold: true, size: 32 })],
          heading: HeadingLevel.TITLE,
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-2",
        }),
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "FF5B7F" } },
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun({ text: doc.title, bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({ spacing: { after: 200 } }),
      ];

      for (const n of allNotes) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: `"${n.highlight}"`, italics: true, size: 22 })],
            spacing: { before: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: n.citation || "", size: 20, color: "666666" })],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: n.note, size: 22 })],
            spacing: { before: 150 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `— ${n.timestamp}`, size: 20, color: "999999" })],
            spacing: { before: 100, after: 200 },
          }),
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
            spacing: { after: 200 },
          })
        );
      }

      const newDoc = new Document({
        title: `${doc.title} — Reading Notes`,
        features: { updateFields: true }, // auto-update TOC on open
        sections: [{ children: paragraphs }],
      });

      const buffer = await Packer.toBuffer(newDoc);
      const tmp = docxPath + ".tmp";
      await fsPromises.writeFile(tmp, buffer);
      await fsPromises.rename(tmp, docxPath);
      return { ok: true, path: docxPath, count: allNotes.length };
    } catch (err) {
      console.error("[reader] save-reading-note failed:", err.message);
      return { error: "Could not save note — check file permissions." };
    }
  });

  ipcMain.handle("open-reading-notes", async (_, docId) => {
    const { shell } = require("electron");
    const settings = ctx.getSettings();
    const outputDir = settings.sourceFolder || ctx.getDataPath();

    if (docId) {
      // Open notes for a specific document
      const doc = ctx.getDocById(docId);
      if (doc) {
        const safeName = doc.title.replace(/[<>:"/\\|?*]/g, "-").slice(0, 80);
        const docxPath = path.join(outputDir, `${safeName} — Reading Notes.docx`);
        try {
          await fsPromises.access(docxPath);
          await shell.openPath(docxPath);
          return { ok: true };
        } catch {
          return { error: "No notes yet for this document." };
        }
      }
    }

    // Fallback: find any notes .docx in the output dir
    try {
      const files = await fsPromises.readdir(outputDir);
      const notesFile = files.find((f) => f.endsWith("— Reading Notes.docx"));
      if (notesFile) {
        await shell.openPath(path.join(outputDir, notesFile));
        return { ok: true };
      }
    } catch { /* ignore */ }
    return { error: "No reading notes found. Highlight a word and press Shift+N to create a note." };
  });
}

module.exports = { register, formatHighlightEntry, parseDefinitionResponse };
