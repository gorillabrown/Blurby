# Blurby Android App — Design Spec

**Date:** 2026-03-27
**Status:** Approved
**Approach:** React Native (Expo with dev client)
**Distribution:** Google Play Store + direct APK download

---

## 1. Overview

A full-featured Android port of Blurby built with React Native and Expo. Not a wrapper or PWA — a native rewrite that shares business logic with the desktop Electron app via a monorepo structure. Feature parity with desktop from day one: four reading modes, Kokoro TTS, cloud sync, highlights, notes, and stats.

---

## 2. Architecture

### 2.1 Monorepo Structure

```
blurby/
├── desktop/              # Existing Electron app (moved from root)
│   ├── main.js
│   ├── main/
│   ├── src/              # React DOM renderer
│   └── package.json
├── mobile/               # React Native (Expo with dev client)
│   ├── app/              # Screens (Expo Router file-based routing)
│   ├── components/       # RN components (rebuilt from scratch)
│   ├── hooks/            # Adapted hooks for mobile
│   ├── native/           # Native modules (ONNX Runtime)
│   ├── assets/           # Splash screen, icons, fonts
│   ├── app.json          # Expo config
│   └── package.json
├── shared/               # Shared between desktop and mobile
│   ├── types.ts          # BlurbyDoc, BlurbySettings, ReadingSession, etc.
│   ├── sync/             # Cloud sync protocol (merge, revisions, tombstones)
│   ├── rhythm.ts         # Rhythm pause calculations
│   ├── text.ts           # Word segmentation, ORP calculation
│   ├── modes/            # Reading mode timing logic
│   └── constants.ts      # Shared constants (WPM defaults, chunk sizes)
└── package.json          # Workspace root
```

### 2.2 What's Shared vs. Rewritten

**Shared (identical logic, both platforms):**
- `BlurbyDoc`, `BlurbySettings`, `ReadingSession` type definitions
- Cloud sync engine: revision counters, merge logic, tombstones, conflict resolution, two-phase staging
- Text processing: word segmentation (`Intl.Segmenter`), ORP calculation, rhythm pauses
- Reading mode timing: FocusMode, FlowMode, NarrateMode advancement logic
- Constants: WPM defaults, TTS chunk sizes, cache limits

**Rewritten (platform-specific):**
- All UI components (React Native primitives, not React DOM)
- Navigation (Expo Router, not React state-based routing)
- Storage (SQLite + AsyncStorage, not JSON flat files)
- File I/O (`expo-file-system`, not Node.js `fs`)
- TTS engine (ONNX Runtime React Native, not Node.js worker thread)
- OAuth (`expo-auth-session`, not MSAL Node / googleapis)

---

## 3. Data & Storage

### 3.1 Local Storage

| Data | Storage | Location |
|------|---------|----------|
| Library metadata | SQLite (`expo-sqlite`) | `documentDirectory/blurby.db` |
| Settings | AsyncStorage | Key-value store |
| Reading history | SQLite (same DB) | `documentDirectory/blurby.db` |
| EPUB files | File system (`expo-file-system`) | `documentDirectory/books/` |
| Cover images | File system | `documentDirectory/covers/` |
| Kokoro model | File system | `documentDirectory/models/` |

**Why SQLite:** Progress updates happen every few seconds during reading. SQLite gives atomic writes, indexed queries, and avoids full-file rewrites. The sync layer serializes to/from JSON for cloud communication.

### 3.2 EPUB Storage Strategy (Three-Tier)

**Tier 1 — Metadata always local:** Library catalog (titles, authors, progress, covers) lives in SQLite permanently. ~1KB per book. This is what the library grid renders from.

**Tier 2 — Content on-demand:** EPUB files are downloaded from cloud when the user opens a book. Cached locally after first download.

**Tier 3 — User-controlled pinning:** Users can pin books for guaranteed offline access. Unpinned books are evicted LRU when cache exceeds threshold (default 500MB, user-configurable in Settings > Storage).

| Action | Behavior |
|--------|----------|
| Open library | Renders from SQLite metadata + cached covers (always local) |
| Tap a book (cached) | Opens instantly |
| Tap a book (not cached) | Downloads EPUB from cloud, shows progress spinner, then opens |
| "Pin for offline" (long-press menu) | Downloads EPUB, marks as pinned. Never auto-evicted. |
| Storage cleanup | Settings > Storage shows cache size. "Clear unpinned books" frees space. |
| Cloud sync | Syncs metadata + progress bidirectionally. Does NOT bulk-download EPUBs. |

**Eviction rules:**
- Unpinned books evicted LRU when cache exceeds threshold
- Currently-reading books (position > 0, not completed) are never auto-evicted even if unpinned
- Cover thumbnails are small and never evicted
- Kokoro model is never evicted (see Section 5)

### 3.3 Schema Migrations

Same versioned migration framework as desktop, adapted for SQLite. Migrations run on app launch before rendering.

---

## 4. EPUB Rendering

### 4.1 Approach: WebView + foliate-js

The reader screen embeds a `react-native-webview` that loads foliate-js — the same EPUB rendering engine as desktop. This is the standard pattern for mobile EPUB readers.

```
ReaderScreen (React Native)
├── WebView (foliate-js EPUB renderer)
│   ├── Loads local HTML shell from app assets
│   ├── Receives EPUB file path via postMessage
│   ├── Renders pages, handles touch/swipe gestures
│   └── Sends events back: page turn, word tap, position update
├── Native overlay: Bottom bar (WPM, mode buttons, chapter nav)
└── Native overlay: Progress bar
```

**Communication:** WebView and React Native talk via `postMessage` / `onMessage` — same pattern as desktop's Electron IPC, different transport.

### 4.2 Reading Modes

| Mode | Implementation | Touch Controls |
|------|---------------|----------------|
| Page | Default. foliate-js pagination in WebView. | Swipe left/right to turn. Tap word for define/highlight. |
| Focus | Native RN view. Centered `<Text>` with timer from `shared/rhythm.ts`. | Tap to pause/resume. Swipe up/down for speed. |
| Flow | Scrolling text with cursor in WebView. | Tap to pause/resume. |
| Narration | Kokoro TTS + word highlight in WebView. | Tap to pause/resume. Swipe for speed. |

### 4.3 Reader Gestures

- Swipe left/right: page turn
- Tap center: toggle bottom bar visibility
- Tap word: define/highlight popup
- Swipe up from bottom: chapter list
- Back button/swipe from edge: return to library

---

## 5. Kokoro TTS

**Kokoro is core infrastructure, not optional. Same status as the EPUB renderer.**

### 5.1 Architecture

```
App Launch
├── Onboarding screens (user is busy)
└── Background: download Kokoro model → documentDirectory/models/
    └── Silent, no UI, no user action needed

User taps Narrate
├── KokoroService loads model from documentDirectory (instant)
├── ONNX Runtime React Native runs inference natively
├── expo-av plays PCM audio buffers
└── WebView highlights words via postMessage
```

### 5.2 Model Management

- **First launch:** Auto-downloads from HuggingFace (~92MB) silently in background during onboarding. No progress bar, no user action.
- **Storage:** Permanent in `documentDirectory/models/`. NOT in `cacheDirectory`. Android cannot reclaim this. Same permanence as the database.
- **No settings UI for model storage.** No pin/unpin. No "manage model" option. It exists, it works, the user never thinks about it.
- **Same 28 voices** as desktop. Voice map from `shared/constants.ts`.
- **Model:** `onnx-community/Kokoro-82M-v1.0-ONNX`, q4 quantization.

### 5.3 Edge Cases

| Scenario | Behavior |
|----------|----------|
| Download not finished when user tries narration | Inline message: "Setting up voices..." with spinner. Completes in seconds. |
| Airplane mode on first launch | Onboarding completes without Kokoro. Download retries automatically when connection returns. |
| User tries narration before model ready | Temporary fallback to Android native TTS (`expo-speech`). Subtle note: "High-quality voices loading..." |
| ONNX Runtime fails (old device) | Permanent fallback to `expo-speech`. Same strategy pattern as desktop. |

### 5.4 Word Sync

Same approach as desktop: estimate word boundaries from chunk duration and word count. KokoroService sends word index updates to ReaderScreen, which forwards to WebView for highlight positioning via postMessage.

---

## 6. Cloud Sync & OAuth

### 6.1 Shared Protocol

The sync protocol is shared code in `shared/sync/`. Identical on both platforms: revision counters, operation log, tombstones, two-phase staging, conflict resolution. Only the transport layer differs.

### 6.2 OAuth

| Provider | Desktop | Mobile |
|----------|---------|--------|
| Microsoft | MSAL Node, PKCE, system browser popup | `expo-auth-session` + MSAL endpoints, system browser redirect |
| Google | googleapis Node SDK, OAuth2 | `expo-auth-session` + Google OAuth endpoints, system browser redirect |

`expo-auth-session` opens the system browser for consent, captures the redirect URI, returns the auth code. Token exchange and refresh from `shared/sync/`.

### 6.3 Sync Triggers

| Trigger | Action |
|---------|--------|
| App foreground | Sync immediately (metadata + progress) |
| Background fetch | Sync every 30 min (Android WorkManager via `expo-task-manager`) |
| Open uncached book | Download EPUB from cloud on demand |
| Pull-to-refresh on library | Manual sync |
| Internet restored | Flush queued changes (progress, highlights, notes) |

### 6.4 What Syncs

- Library metadata (titles, progress, positions, favorites, archives) — always
- Reading history/stats — always
- Settings — always
- EPUB content files — on demand only (when user opens a book)

### 6.5 Conflict Resolution

Same as desktop: last-write-wins on metadata fields, revision counters for ordering, tombstones for deletes. Position sync uses the higher value (furthest read).

---

## 7. Navigation & Screens

### 7.1 Screen Map (Expo Router)

```
mobile/app/
├── _layout.tsx              # Root layout (auth, theme, sync providers)
├── (onboarding)/            # First-run flow
│   ├── welcome.tsx          # Welcome, cloud sign-in
│   └── setup.tsx            # Reading preferences (WPM, theme)
├── (tabs)/                  # Main app (tab navigator)
│   ├── _layout.tsx          # Tab bar config
│   ├── library.tsx          # Library grid (default tab)
│   ├── stats.tsx            # Reading statistics
│   └── settings.tsx         # Settings
├── reader/[id].tsx          # Reader (WebView + native overlays)
└── search.tsx               # Library search (modal)
```

### 7.2 Screen Breakdown

| Screen | Function | Desktop Equivalent |
|--------|----------|-------------------|
| Library | Grid of covers, pull-to-refresh, tap to open, long-press for actions | LibraryView + DocGridCard |
| Reader | WebView (foliate-js), bottom bar, mode buttons, swipe navigation | ReaderContainer + FoliatePageView |
| Stats | Streaks, WPM trends, session history | StatsPanel |
| Settings | Theme, speed, TTS voice, cloud account, storage | Settings sub-pages (condensed) |
| Onboarding | Welcome, cloud sign-in, preferences. Kokoro downloads silently. | OnboardingOverlay |
| Search | Title/author search across library | CommandPalette (library subset) |

### 7.3 No Command Palette

Desktop's Ctrl+K is replaced by direct navigation: tab bar for sections, search icon for library search, settings gear in tab bar. Mobile users expect tap targets, not keyboard shortcuts.

---

## 8. Offline Behavior

**Offline-first, same as desktop.**

| Scenario | Behavior |
|----------|----------|
| No internet on first launch | Onboarding completes, cloud sign-in skipped. Kokoro retries on reconnect. |
| Opening a cached book offline | Full functionality: all reading modes, TTS, highlights, notes. |
| Opening an uncached book offline | Message: "This book hasn't been downloaded yet. Connect to sync." |
| Internet returns | Background sync fires. Queued changes upload. |
| Airplane mode mid-read | Reading uninterrupted. Progress saved locally, syncs when online. |

---

## 9. Distribution

### 9.1 Build Pipeline

EAS Build (Expo Application Services):
- `eas build --platform android` for APK/AAB
- CI via GitHub Actions: build on push to `mobile/main`, upload artifacts
- Separate workflow from desktop release

### 9.2 Channels

| Channel | Format | How |
|---------|--------|-----|
| Google Play Store | AAB (Android App Bundle) | EAS Submit, $25 one-time dev account |
| Direct download | APK | GitHub Releases (same repo as desktop), linked from website |

### 9.3 Versioning

Mobile uses independent semver starting at `1.0.0`. Both share the same Git repo but different `package.json` versions. Tags: `v2.x.x` for desktop, `mobile-v1.x.x` for Android.

---

## 10. Testing Strategy

| Layer | Tool | Scope |
|-------|------|-------|
| Unit | Jest (Expo default) | Shared logic: sync merge, rhythm pauses, text processing |
| Component | React Native Testing Library | Screen rendering, navigation, state management |
| Integration | Detox or Maestro | Full flows: onboarding, open book, read, sync |
| E2E | EAS Build + Play Store Internal Track | Real device testing before public release |

**Shared logic tests run on both platforms** — `shared/` tests execute in Node.js (desktop CI) and Jest (mobile CI).

---

## 11. Dependencies (Key)

| Package | Purpose |
|---------|---------|
| `expo` | Framework, managed services |
| `expo-router` | File-based navigation |
| `expo-sqlite` | Local database |
| `expo-file-system` | EPUB/model/cover storage |
| `expo-auth-session` | OAuth (Microsoft, Google) |
| `expo-av` | Audio playback (Kokoro PCM) |
| `expo-speech` | Android native TTS fallback |
| `expo-task-manager` | Background sync (WorkManager) |
| `react-native-webview` | EPUB rendering (foliate-js) |
| `onnxruntime-react-native` | Kokoro TTS inference |

---

## 12. Scope Boundaries

**In scope:**
- Library browsing (grid view)
- Four reading modes (Page, Focus, Flow, Narrate)
- Kokoro TTS (28 voices, auto-download, permanent storage)
- Cloud sync (Microsoft + Google, bidirectional)
- Highlights, notes, definitions
- Reading statistics
- Offline reading
- Play Store + APK distribution

**Out of scope (future):**
- Folder watching (no local folder concept on mobile)
- Chrome extension bridge (desktop only)
- URL article import (could add later via Android share sheet)
- WebSocket server (desktop only)
- Multi-window reader (mobile is single-window)
- Local file import beyond share sheet / file picker
