# Blurby — Claude Code Configuration

## Project Overview

Blurby is a desktop RSVP (Rapid Serial Visual Presentation) speed reading app built with Electron + React 19 + Vite. Users point the app at a folder of reading material, paste text, or import from URLs, then read at their chosen speed (100-1200 WPM) with ORP (Optimal Recognition Point) highlighting.

## Architecture

- **Main process** (`main.js`): Electron, IPC handlers, file I/O (async), folder watching (Chokidar), data persistence, URL article extraction
- **Preload** (`preload.js`): Context bridge exposing `window.electronAPI`
- **Renderer** (`src/`): React 19 SPA with component architecture
  - `src/components/` — 26 UI components (ReaderView, LibraryView, MenuFlap, ReadingQueue, SettingsMenu, and 7 settings sub-pages in `settings/` subdirectory)
  - `src/hooks/` — useReader, useLibrary, useKeyboardShortcuts
  - `src/utils/text.js` — tokenize, formatTime, focusChar (pure functions)
  - `src/styles/global.css` — All styles with CSS custom properties
- **Tests** (`tests/`): Vitest — text utilities, migrations, WPM math
- **Data**: JSON files in user data dir (settings.json, library.json) with schema versioning + migration framework

## Key Commands

- `npm run dev` — Start Vite dev server + Electron with hot reload
- `npm run build` — Build React with Vite → `dist/`
- `npm test` — Run all tests (Vitest)
- `npm run package:win` — Build Windows NSIS installer
- `npm run package:mac` — Build macOS DMG
- `npm run package:linux` — Build Linux AppImage

## Document Sources

Documents can come from three sources:
- `"manual"` — User-pasted text, content stored in library.json
- `"folder"` — Files from watched folder, content loaded on-demand from disk
- `"url"` — Extracted from web articles using @mozilla/readability, content stored in library.json

## IPC Pattern

All renderer↔main communication goes through preload.js context bridge:
1. Add handler in `main.js` → `ipcMain.handle("channel-name", ...)`
2. Expose in `preload.js` → `contextBridge.exposeInMainWorld("electronAPI", { ... })`
3. Call in renderer → `window.electronAPI.channelName(...)`

## Data Schema

Both `settings.json` and `library.json` have `schemaVersion` fields. Migrations run automatically on app startup. To add a migration:
1. Increment `CURRENT_*_SCHEMA` in `main.js`
2. Add migration function to `settingsMigrations` or `libraryMigrations` array
3. Add test in `tests/migrations.test.js`

## Code Style

- TypeScript — `.tsx`/`.ts` files in renderer (`src/`), CommonJS `.js` in main process
- CSS classes in `src/styles/global.css`, not inline styles
- CSS custom properties defined in `:root` for theming
- Pure functions go in `src/utils/`, React hooks in `src/hooks/`
- Electron main process uses CommonJS (require), renderer uses ES modules (import)
- Tests use Vitest with no Electron dependency — test pure functions only

## Important Constraints

- Never import Node.js modules in renderer code — all system access goes through IPC
- Folder-sourced docs don't store content in library.json — loaded on-demand via `load-doc-content` IPC
- Keep `preload.js` minimal — it's the security boundary
- All file I/O in main.js should use `fs.promises` (async), not `fs.readFileSync`
