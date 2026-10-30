# PDF app feature matrix: Blurby Business vs KillerPDF, PDFCraft, Stirling-PDF

*2026-10-30. Competitor marks are from each project's own documentation and code (not run): KillerPDF 1.9.0 CHANGELOG/README/help/`Controls/`; PDFCraft `parity/acrobat-features.toml` (its self-assessed Acrobat checklist); Stirling-PDF tool registry, endpoint docs and controllers. Blurby Business marks are the approved epic plan (held entry `docs/planning/holding/2026-10-30-blurby-business-tier1.md`): `HB-n` marks the written Phase 1 items, `P1`–`P8` the epic phase that delivers the row — planned, not built.*

**Key** — ✅ present (for Blurby Business: planned in Tier 1, item noted) · ◐ partial or unclear · — absent / not planned

| App | Platform & delivery | License | Maturity |
|---|---|---|---|
| **Blurby Business** | Windows (x64, ARM64), a walled-off window inside Blurby (Electron; pdf.js, pdf-lib, @signpdf, qpdf, tesseract.js) | Blurby (private); permissive dependencies only | Epic planned (8 phases, 121 in-scope rows); not built |
| **KillerPDF** | Windows only, C#/WPF on .NET 10, own engine; installer, portable, Store, Chocolatey, WinGet, CLI | GPLv3 | 1.9.0, released 2026-10-29 |
| **PDFCraft** | Rust/egui; macOS, Windows, Linux, FreeBSD, WASM in browser; CLI and MCP server | MIT / Apache-2.0 | Alpha (~50% of Acrobat by its own count); borrowed renderer |
| **Stirling-PDF** | Java server + React UI; Docker/K8s/JAR self-host, cloud, Tauri desktop; REST API | Open core (MIT + proprietary folders) | Mature; some features need paid tiers or external tools |

## Matrix

| Category | Feature | Blurby Business | KillerPDF | PDFCraft | Stirling-PDF |
|---|---|---|---|---|---|
| Viewing | Open/render PDFs | ✅ HB-6 | ✅ | ◐ | ✅ |
| Viewing | Repair/open damaged PDFs | ✅ P1 | ✅ | ✅ | ✅ |
| Viewing | Document tabs | ✅ HB-6 | ✅ | ✅ | ◐ |
| Viewing | Split pane (two docs side by side) | ✅ P1 | ✅ | — | — |
| Viewing | Single/continuous/two-page layouts | ✅ HB-7 | ✅ | ✅ | ✅ |
| Viewing | Page grid view | ✅ P1 | ✅ | ✅ | ✅ |
| Viewing | Zoom presets / fit width or page | ✅ HB-7 | ✅ | ✅ | ✅ |
| Viewing | Rotate view (not file) | ✅ P1 | ◐ | ✅ | ◐ |
| Viewing | Full screen / read mode | ✅ P1 | ✅ | ✅ | ◐ |
| Viewing | Text search | ✅ HB-7 | ✅ | ✅ | ✅ |
| Viewing | Text select/copy | ✅ HB-7 (native), HB-9 (OCR) | ✅ | ✅ | ✅ |
| Viewing | Thumbnails panel | ✅ HB-7 | ✅ | ✅ | ✅ |
| Viewing | Bookmarks/outline panel | ✅ HB-7 | ✅ | ✅ | ✅ |
| Viewing | Follow links | ✅ HB-7 | ✅ | ✅ | ✅ |
| Viewing | Attachments panel | ✅ HB-7 | ✅ | ✅ | ✅ |
| Viewing | Layers panel | ✅ HB-7 | ✅ | ✅ | ✅ |
| Viewing | Comments panel | ✅ P2 | ✅ | ✅ | ✅ |
| Viewing | Signatures panel | ✅ P5 | ✅ | ◐ | — |
| Viewing | Back/forward view history | ✅ P1 | ✅ | ✅ | — |
| Viewing | Page labels display | ✅ HB-7 | ✅ | ✅ | — |
| Viewing | Night mode / invert page colours | ✅ P1 | ✅ | ✅ | — |
| Viewing | Touch pan / pinch zoom | ✅ P1 | ✅ | ✅ | ◐ |
| Viewing | Snapshot (region as image) | ✅ P1 | — | ✅ | — |
| Viewing | View earlier revision | ✅ P1 | ◐ | ✅ | — |
| Annotation | Highlight text | ✅ P2 | ✅ | ✅ | ✅ |
| Annotation | Underline / strikeout / squiggly | ✅ P2 | ◐ | ✅ | ◐ |
| Annotation | Freehand ink | ✅ P2 | ✅ | ✅ | ✅ |
| Annotation | Shapes (line, arrow, rect, ellipse, polygon) | ✅ P2 | ✅ | ✅ | ✅ |
| Annotation | Callout / cloud | ✅ P2 | — | ✅ | — |
| Annotation | Text box / typewriter | ✅ P2 | ✅ | ✅ | ✅ |
| Annotation | Sticky notes / comments | ✅ P2 | ✅ | ✅ | ✅ |
| Annotation | Comment replies / review status | ✅ P2 | ✅ | ✅ | ◐ |
| Annotation | Stamps | ✅ P2 | ✅ | ✅ | ✅ |
| Annotation | Insert image | ✅ P2 | ✅ | ✅ | ✅ |
| Annotation | Attach file as comment | ✅ P2 | ◐ | ✅ | — |
| Annotation | Import/export comments (FDF/XFDF) | ✅ P2 | ✅ | ✅ | — |
| Annotation | Comment summary | ✅ P2 | — | ◐ | — |
| Annotation | Flatten annotations | ✅ P2 | ✅ | ✅ | ✅ |
| Annotation | Remove annotations | ✅ P2 | ◐ | ✅ | ✅ |
| Annotation | Measurement (distance, perimeter, area) | ✅ P2 | ✅ | ✅ | ✅ |
| Editing | Edit existing text in place | ◐ P4 (partial, D19) | ✅ | ◐ | ✅ |
| Editing | Find & replace in page text | ✅ P4 | ✅ | — | — |
| Editing | Edit existing images | ✅ P4 | — | ✅ | — |
| Editing | Remove images | ✅ P4 | — | — | ✅ |
| Editing | Watermark | ✅ P4 | ✅ | ✅ | ✅ |
| Editing | Header/footer | ✅ P4 | ✅ | ✅ | ◐ |
| Editing | Page numbers | ✅ P4 | ✅ | ✅ | ✅ |
| Editing | Bates numbering | ✅ P4 | ✅ | ◐ | — |
| Editing | Page background | ✅ P4 | — | ✅ | — |
| Editing | Create/edit links | ✅ P4 | ◐ | ✅ | — |
| Editing | Rasterize region | ✅ P4 | ✅ | — | — |
| Editing | Adjust colour/contrast/levels | ✅ P4 | ✅ | — | ✅ |
| Editing | Grayscale / replace / invert colours (file) | ✅ P4 | ✅ | — | ✅ |
| Editing | Overlay one PDF onto another | ✅ P4 | — | ◐ | ✅ |
| Page organisation | Reorder pages | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Rotate pages | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Delete pages | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Insert blank page | ✅ P3 | ✅ | ✅ | ◐ |
| Page organisation | Insert pages from file | ✅ P3 | ✅ | ✅ | ◐ |
| Page organisation | Duplicate pages | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Reverse / duplex / odd-even sort | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Copy pages between open docs | ✅ P3 | ✅ | — | ◐ |
| Page organisation | Crop | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Resize / scale page size | ✅ P3 | ✅ | — | ✅ |
| Page organisation | Remove blank pages | ✅ P3 | — | — | ✅ |
| Page organisation | Auto-rotate / fix orientation | ✅ P3 | ✅ | — | ✅ |
| Page organisation | Deskew scans | ◐ P3 (partial, D19) | ✅ | — | — |
| Page organisation | Perspective correction | ◐ P3 (partial, D19) | ✅ | ◐ | — |
| Page organisation | Divide scanned spreads | ◐ P3 (partial, D19) | ✅ | — | ◐ |
| Page organisation | Split multiple scanned photos | ✅ P3 | — | — | ✅ |
| Page organisation | Edit page labels | ✅ P3 | ✅ | ✅ | — |
| Page organisation | Page boxes (trim/bleed/art) | ✅ P3 | ◐ | ✅ | — |
| Page organisation | Edit bookmarks / TOC | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Auto-generate bookmarks | ✅ P3 | ✅ | ✅ | ◐ |
| Page organisation | N-up layout | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Booklet imposition | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | Poster / tiling | ✅ P3 | ✅ | ✅ | ✅ |
| Page organisation | PDF to single long page | ✅ P3 | — | — | ✅ |
| Merge/split | Merge PDFs | ✅ P3 | ✅ | ✅ | ✅ |
| Merge/split | Merge with bookmark per file | — | ◐ | ✅ | ◐ |
| Merge/split | Merge folder/zip of PDFs and images | — | ✅ | ✅ | ✅ |
| Merge/split | Extract pages | ✅ P3 | ✅ | ✅ | ✅ |
| Merge/split | Split by page / every N | ✅ P3 | ✅ | ✅ | ✅ |
| Merge/split | Split by file size | — | ◐ | ✅ | ✅ |
| Merge/split | Split by bookmarks/chapters | — | ◐ | ✅ | ✅ |
| Merge/split | Split pages into grid sections | — | ◐ | — | ✅ |
| Merge/split | Auto-split on separator pages | — | — | — | ✅ |
| OCR | OCR scanned pages | ◐ HB-9: searchable and selectable in the viewer; no saved searchable PDF | ✅ | ✅ | ✅ |
| OCR | Multiple OCR languages | — (English only) | ✅ | ◐ | ✅ |
| OCR | Works fully offline | ✅ HB-9 (model bundled) | ◐ (models downloaded in app) | ✅ | ✅ (self-hosted) |
| OCR | OCR region to clipboard/text | — | ✅ | — | — |
| OCR | OCR to editable text | — | ✅ | ◐ | ◐ |
| OCR | Review uncertain OCR words | — | ✅ | — | — |
| OCR | Field-guided OCR for forms | — | ✅ | — | — |
| OCR | Batch OCR | — | ✅ | ✅ | ✅ |
| OCR | Scan cleanup (despeckle, background) | — | ✅ | ◐ | ✅ |
| OCR | Acquire from scanner (TWAIN) | — | ✅ | — | — |
| OCR | Phone-camera upload | — | — | — | ✅ |
| OCR | "Looks scanned" effect | — | ✅ | — | ✅ |
| Conversion | PDF → Word | — | ✅ | ◐ | ✅ |
| Conversion | PDF → Excel | — | ✅ | — | ✅ |
| Conversion | PDF tables → CSV | — | ✅ | — | ✅ |
| Conversion | PDF → PowerPoint | — | ✅ | ◐ | ✅ |
| Conversion | PDF → HTML | — | ✅ | ◐ | ✅ |
| Conversion | PDF → Markdown | — | ✅ | ◐ | ✅ |
| Conversion | PDF → plain text | — | ✅ | ✅ | ✅ |
| Conversion | PDF → RTF | — | — | ✅ | ✅ |
| Conversion | PDF → JSON | — | ✅ | ◐ | ✅ |
| Conversion | PDF → XML | — | — | — | ✅ |
| Conversion | PDF → images | — | ✅ | ✅ | ✅ |
| Conversion | Extract embedded images | — | ◐ | ✅ | ✅ |
| Conversion | PDF → EPUB | ◐ HB-10: into the Blurby library only, not as a file | — | — | ✅ |
| Conversion | PDF → CBZ/CBR | — | — | — | ✅ |
| Conversion | PDF → vector (PS/EPS/SVG) | — | — | — | ✅ |
| Conversion | PDF → video | — | — | — | ✅ |
| Conversion | PDF → PDF/A | — | — | ◐ | ✅ |
| Conversion | PDF → PDF/X | — | — | — | ✅ |
| Conversion | PDF → PDF/UA | — | — | — | ✅ |
| Conversion | Images → PDF | — | ✅ | ✅ | ✅ |
| Conversion | Word/Excel → PDF | — | ✅ | — | ✅ |
| Conversion | PowerPoint/ODF → PDF | — | — | — | ✅ |
| Conversion | HTML / URL → PDF | — | — | — | ✅ |
| Conversion | Markdown → PDF | — | — | — | ✅ |
| Conversion | Text → PDF | — | ◐ | ✅ | ✅ |
| Conversion | Email (EML/MSG) → PDF | — | — | — | ✅ |
| Conversion | eBook → PDF | — | — | — | ✅ |
| Conversion | CBZ/CBR → PDF | — | — | — | ✅ |
| Conversion | SVG → PDF | — | — | — | ✅ |
| Conversion | Clipboard → PDF | — | ◐ | ✅ | — |
| Conversion | New blank PDF | — | ✅ | ✅ | — |
| Forms | Fill AcroForms | ✅ P2 | ✅ | ✅ | ✅ |
| Forms | Create/edit form fields | ✅ P6 | ✅ | ✅ | ✅ |
| Forms | Auto-detect form fields | ✅ P6 | ✅ | ◐ | ✅ |
| Forms | Flatten forms | ✅ P6 | ✅ | ✅ | ✅ |
| Forms | Import/export form data (FDF/XFDF) | ✅ P6 | ✅ | ✅ | ◐ |
| Forms | Form calculations/formatting | ✅ P6 | ✅ | ✅ | — |
| Forms | Form JavaScript engine | ◐ P6 (partial, D19) | — | ◐ | — |
| Forms | XFA forms | ◐ P6 (partial, D19) | ◐ | ◐ | — |
| Forms | Fill & Sign marks on flat forms | ✅ P2 | ◐ | ✅ | ✅ |
| Forms | Unlock read-only form fields | ✅ P6 | — | — | ✅ |
| Forms | Data merge (CSV/JSON/XLSX → documents) | ✅ P6 | ✅ | — | — |
| Forms | Merge form data into a spreadsheet | ✅ P6 | — | ✅ | — |
| Security | Open password-protected PDFs | ✅ HB-8 (session-only, never on disk) | ✅ | ✅ | ✅ |
| Security | Add password (AES-256) | — | ✅ | ✅ | ✅ |
| Security | Set permissions | — | ✅ | ✅ | ✅ |
| Security | Remove password/security | — | ✅ | ✅ | ✅ |
| Security | Certificate encryption | — | ✅ | — | — |
| Security | Manual (area) redaction | — | ✅ | ✅ | ✅ |
| Security | Search/pattern auto-redaction | — | ✅ | ✅ | ✅ |
| Security | Redaction verification | — | ✅ | ✅ | — |
| Security | Sanitize (scripts, metadata, hidden data) | — | ✅ | ✅ | ✅ |
| Security | Show embedded JavaScript | — | — | ◐ | ✅ |
| Security | Microsoft Purview labels | — | — | — | ✅ |
| Security | Never modifies the opened file | ✅ HB-6 (read-only viewer, proven by hash) | — | — | — |
| Signatures | Visual signature (draw/type/image) | ✅ P5 | ✅ | ✅ | ✅ |
| Signatures | Certificate digital signing | ✅ P5 | ✅ | ✅ | ✅ |
| Signatures | USB token / smart card / cloud certificate | ◐ P5 (partial, D19) | ✅ | ◐ | ◐ |
| Signatures | RFC 3161 timestamp | ✅ P5 | ✅ | ◐ | ✅ |
| Signatures | Validate signatures | ✅ P5 | ✅ | ✅ | ✅ |
| Signatures | LTV / OCSP / CRL | ◐ P5 (partial, D19) | ◐ | ◐ | ◐ |
| Signatures | Certify document (DocMDP) | ✅ P5 | ◐ | ✅ | ◐ |
| Signatures | Remove signatures | ✅ P5 | — | — | ✅ |
| Signatures | Certificate trust management | ✅ P5 | ✅ | ✅ | ◐ |
| Signatures | Multi-party signing workflow | ✅ P5 | — | — | ✅ |
| Comparison | Visual side-by-side compare | — | ✅ | ✅ | ✅ |
| Comparison | Text compare | — | ◐ | ✅ | ✅ |
| Comparison | Compare report | — | ✅ | ✅ | ◐ |
| Optimisation | Reduce file size | ✅ P8 | ✅ | ✅ | ✅ |
| Optimisation | Advanced optimiser | ◐ P8 (partial, D19) | ◐ | ◐ | ◐ |
| Optimisation | Decompress PDF | ✅ P8 | — | — | ✅ |
| Optimisation | Preflight checks/fixes | ✅ P8 | ✅ | — | — |
| Optimisation | PDF/A / standards validation | ✅ P8 | — | ◐ | ✅ |
| Optimisation | Print-production report / separations | ◐ P8 (partial, D19) | ✅ | — | — |
| Metadata | Edit title/author/subject/keywords | ✅ P4 | ✅ | ✅ | ✅ |
| Metadata | Custom metadata fields | ✅ P4 | ◐ | ◐ | ◐ |
| Metadata | Full document info/report | ✅ P4 | ✅ | ✅ | ✅ |
| Metadata | Initial view settings | ✅ P4 | ✅ | ✅ | — |
| Metadata | Document language | ✅ P4 | ✅ | ✅ | — |
| Metadata | Manage attachments | ✅ P4 | ✅ | ✅ | ✅ |
| Metadata | PDF portfolios | ✅ P4 | ✅ | — | ✅ |
| Metadata | Auto-rename file from content | ✅ P4 | — | — | ✅ |
| Automation | Command-line interface | — | ✅ | ✅ | — |
| Automation | REST API | — | — | — | ✅ |
| Automation | MCP server for AI agents | — | ◐ | ✅ | ✅ |
| Automation | Macros / no-code pipelines | — | ✅ | ✅ | ✅ |
| Automation | Guided tasks | — | ✅ | ✅ | — |
| Automation | Watched folders | — | ✅ | — | ✅ |
| Automation | Batch over files/folders | — | ✅ | ◐ | ✅ |
| Automation | Conditional filters | — | — | — | ✅ |
| Automation | Scriptable UI control channel | — | — | ✅ | — |
| Automation | AI assistant / classify / agents | — | — | — | ✅ |
| Accessibility | Accessibility checker/report | — | ✅ | ✅ | ✅ |
| Accessibility | Accessibility fixes (title, language, alt text) | — | ✅ | ✅ | — |
| Accessibility | Autotag / reading-order editing | — | ◐ | ◐ | ◐ |
| Accessibility | App keyboard / screen-reader support | — | ✅ | ◐ | ◐ |
| Accessibility | High-contrast theme / UI scaling | — | ✅ | ◐ | ◐ |
| Accessibility | Read aloud | ◐ HB-10: Send to Blurby, then Narrate (neural TTS) | — | — | — |
| Printing | Print with preview | ✅ P7 | ✅ | ✅ | ✅ |
| Printing | Duplex / odd-even / n-up / scale | ✅ P7 | ✅ | ✅ | ◐ |
| Printing | Print markups only / as image / grayscale | ✅ P7 | ◐ | ✅ | — |
| UI/platform | Themes | ✅ follows Blurby's themes | ✅ (13) | ✅ (light/dark/system) | ✅ (light/dark) |
| UI/platform | Interface languages | — (English) | ✅ (20) | ✅ (23) | ✅ (40+) |
| UI/platform | Customisable shortcuts | — | ✅ | — | ◐ |
| UI/platform | Command palette / tool search | ◐ Blurby's palette opens Business | ✅ | ✅ | ✅ |
| UI/platform | Customise toolbar | — | ✅ | — | — |
| UI/platform | Undo/redo | ✅ P2 (A10) | ✅ | ✅ | ◐ |
| UI/platform | Autosave / crash recovery | — | ✅ | ✅ | — |
| UI/platform | Recent documents list | ✅ HB-6 | ◐ | ◐ | ◐ |
| UI/platform | Default PDF handler (double-click from Explorer) | ✅ HB-11 | ✅ | ✅ | — |
| UI/platform | Explorer preview / context menu | — | ✅ | ✅ | — |
| UI/platform | Portable build | — | ✅ | ✅ | — |
| UI/platform | Browser/web delivery | — | — | ◐ | ✅ |
| UI/platform | Self-hosted multi-user server | — | — | — | ✅ |
| UI/platform | Auto-update | ✅ (Blurby's updater) | ✅ | ◐ | ✅ |
| UI/platform | System tray | ✅ (Blurby's tray) | ✅ | — | — |
| UI/platform | File sharing / cloud storage | — | — | — | ✅ |
| Blurby-only | Send to a speed-reading library (Page, Focus, Flow, Narrate) | ✅ HB-10 | — | — | — |
| Blurby-only | Neural TTS narration with word-exact cursor | ◐ HB-10, via the Library | — | — | — |
| Other | Word/character count | — | — | ✅ | — |

## Counts (219 rows)

| | Blurby Business | KillerPDF | PDFCraft | Stirling-PDF |
|---|---|---|---|---|
| ✅ | 120 | 143 | 123 | 136 |
| ◐ | 15 | 26 | 33 | 29 |

*Counts are over this table's rows and mix depth of support; treat them as coverage, not quality.*

## Caveats

- **Stirling-PDF:** several marked features live in proprietary-licensed folders (auto form detection, accessibility report, MCP server, AI tools, Purview labels, signing sessions). Pipelines and AI tools draw on a monthly processing allowance except on Enterprise. Many tools need external programs (LibreOffice, Calibre, Ghostscript, OCRmyPDF/Tesseract, veraPDF) and are disabled without them.
- **PDFCraft:** marks are its own checklist, which its tooling backs with tests; the project is alpha, renders with a borrowed renderer, OCRs Latin script only, and has no Office-to-PDF.
- **KillerPDF:** documentation only, not run; text editing is limited to supported layouts and fonts.
- **Stirling viewer rows** rest on component names, not exercised behaviour.
- **Blurby Business:** text select and copy for text PDFs was added to HB-7 (Done when 5). Phases: P1 viewer, P2 annotation, form fill and save, P3 page organisation and merge, P4 editing and metadata, P5 signatures, P6 form authoring, P7 printing, P8 optimisation. ◐ rows are expected partials under the permissive engine stack (D19).
