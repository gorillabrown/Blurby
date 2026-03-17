# Blurby

A desktop RSVP (Rapid Serial Visual Presentation) speed reading app built with Electron + React. Point it at a folder of reading material, pick a source, and read word-by-word at your chosen pace.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode
npm run dev
```

This starts Vite (hot-reload dev server) and launches Electron pointing at it.

## Features

- **Folder sync** — Pick a local folder; all `.txt` and `.md` files are imported automatically. The folder is watched for changes — add, edit, or remove files and the library updates in real time.
- **Manual sources** — Paste text directly into the app.
- **RSVP reader** — Full-screen, black background, white text with an optimal recognition point (ORP) highlighted in gold. Designed for zero distraction.
- **Progress tracking** — Your position in every source is saved automatically when you exit the reader.
- **Adjustable speed** — 100–1200 WPM in 25 WPM steps, adjustable live during reading.
- **Search / filter** — Filter your library when it grows past a few items.
- **Custom library name** — Click the title to rename your collection.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Rewind / Forward 5 words |
| `↑` / `↓` | Increase / Decrease speed by 25 WPM |
| `Esc` | Exit reader (saves position) |
| `Alt+V` (Win) / `⌥+V` (Mac) | Quick-read selected text |

## Building for distribution

```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux
```

Outputs go to the `release/` directory.

## Project structure

```
blurby/
├── main.js          # Electron main process — file I/O, folder watching, IPC
├── preload.js       # Context bridge — secure API between main ↔ renderer
├── index.html       # Entry HTML with custom scrollbar + drag regions
├── vite.config.js   # Vite config for React dev server
├── src/
│   ├── main.jsx     # React entry point
│   └── App.jsx      # Full application UI — library view + RSVP reader
├── assets/
│   ├── icon.png     # App icon (replace with your own)
│   └── tray-icon.png# System tray icon
└── package.json
```

## Data storage

All data is stored in your OS user data directory:

- **Windows**: `%APPDATA%/blurby/blurby-data/`
- **macOS**: `~/Library/Application Support/blurby/blurby-data/`
- **Linux**: `~/.config/blurby/blurby-data/`

Two JSON files:
- `settings.json` — WPM, source folder path, library name
- `library.json` — All documents with reading positions

## Replacing the app icon

Replace `assets/icon.png` with a 512×512 or 1024×1024 PNG before building. For macOS, you can also provide an `.icns` file.

## Supported file types

Currently: `.txt`, `.md`, `.markdown`, `.text`, `.rst`

To add more formats (like `.epub` or `.pdf`), extend `SUPPORTED_EXT` in `main.js` and add a parser.
