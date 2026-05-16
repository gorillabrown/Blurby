# Phase 10 — Android App (APK)

## 10.1 Mobile Framework

### Goal
Port Blurby's core reading experience to Android as a standalone app.

### Framework Evaluation

**Option A: Capacitor + Existing React Code (Recommended)**

Pros:
- Reuses existing React 19 components and hooks
- `useReader.ts`, `text.ts`, `rhythm.ts` work as-is (pure TypeScript)
- Shared codebase with desktop Electron app
- Capacitor provides native Android shell with WebView rendering
- File system access via `@capacitor/filesystem`
- Share intent via `capacitor-share-target` plugin

Cons:
- WebView performance slightly lower than native for animation-heavy UI
- 60fps RAF loop may have occasional jank on low-end devices
- Platform-specific styling needed (no native Android widgets)

**Option B: React Native**

Pros:
- True native rendering (better performance for animations)
- Platform-native UI components
- Better gesture handling

Cons:
- Cannot reuse React DOM components (ReaderView, ScrollReaderView, etc.)
- Would require rewriting all UI from scratch
- Different styling system (StyleSheet vs CSS)
- Core utilities (text.ts, rhythm.ts) can still be shared

**Recommendation: Capacitor** — Maximizes code reuse. The RSVP reader is the core feature, and the RAF-based word display works well in WebView. Only platform-specific code needed is file I/O, share intents, and navigation chrome.

### Project Structure
```
blurby-mobile/
├── android/                    # Native Android project (Capacitor-generated)
├── src/                        # Shared React source (symlinked or copied)
│   ├── components/             # Mobile-adapted ReaderView, ScrollReaderView
│   ├── hooks/                  # useReader.ts, useLibrary-mobile.ts
│   ├── utils/                  # text.ts, rhythm.ts (shared unchanged)
│   └── App.mobile.tsx          # Mobile entry point
├── capacitor.config.ts         # Capacitor configuration
├── package.json
└── vite.config.mobile.ts       # Mobile build config
```

### Shared Code Strategy
- `src/utils/text.ts`, `src/utils/rhythm.ts`, `src/utils/queue.ts` — Shared unchanged
- `src/hooks/useReader.ts` — Shared unchanged (RAF works in WebView)
- `src/types.ts` — Shared (remove ElectronAPI, add MobileAPI)
- `src/components/ReaderView.tsx` — Fork with touch adaptations
- `src/components/ScrollReaderView.tsx` — Fork with native scrolling
- `src/styles/global.css` — Fork with mobile-specific overrides

### Acceptance Criteria
- [ ] Capacitor project builds and runs on Android emulator
- [ ] Core RSVP engine runs at 60fps in WebView
- [ ] Shared utilities (text.ts, rhythm.ts) imported without modification

---

## 10.2 Mobile Features

### Goal
Adapt the reading experience for touch-based mobile interaction.

### Touch Controls

**Focus Mode (RSVP):**
- **Tap center**: Play/pause (replaces Space key)
- **Tap left half**: Rewind 5 words (replaces Left arrow)
- **Tap right half**: Forward 5 words (replaces Right arrow)
- **Swipe up**: Increase WPM by 25 (replaces Up arrow)
- **Swipe down**: Decrease WPM by 25 (replaces Down arrow)
- **Pinch zoom**: Adjust font size (replaces +/- keys)
- **Long press**: Open settings overlay
- **Swipe left from edge**: Open menu (replaces Tab)
- **Android back button / swipe back**: Exit reader (with confirmation if playing)

**Flow Mode:**
- **Tap**: Start/stop flow playback (replaces Shift+Space)
- **Scroll**: Manual scroll when flow paused
- **Tap word**: Jump to word and start flow from there

**Scroll Mode:**
- Natural Android scrolling (no custom gestures needed)
- Floating action button: switch to focus mode

### Document Import

**File Picker:**
- Use `@capacitor/filesystem` or Android's Storage Access Framework
- Support: `.txt`, `.md`, `.epub`, `.pdf`, `.mobi`, `.html`
- Open file picker via FAB (floating action button) or toolbar

**Share Intent:**
- Register as handler for text/plain, text/html, application/epub+zip, application/pdf
- When user shares a file or URL to Blurby: import and open in reader
- For URLs: use same Readability-based extraction as desktop

**Content Provider Access:**
- Access documents from Google Drive, Dropbox via Android's document provider interface
- No special integration needed — file picker handles this automatically

### Mobile UI Adaptations

**Library View:**
- Grid view default (better use of mobile screen)
- Pull-to-refresh to rescan
- Swipe-to-archive on document cards
- Bottom navigation bar: Library | Queue | Settings
- No system tray (mobile doesn't have one)

**Reader View:**
- Full screen (hide status bar and navigation bar)
- Gesture zones visualized on first use (overlay tutorial)
- WPM and progress shown as minimal overlay (auto-hide after 3 seconds)
- Immersive mode via Android `WindowInsetsController`

**Settings:**
- Bottom sheet instead of side flap (standard Android pattern)
- Same settings categories but adapted for touch (larger tap targets)
- System font picker uses Android font list

### Files to Create
- `src/App.mobile.tsx` — Mobile app entry with bottom nav
- `src/components/MobileReaderView.tsx` — Touch gesture layer wrapping ReaderView
- `src/components/MobileLibraryView.tsx` — Grid-first mobile library
- `src/hooks/useGestures.ts` — Touch gesture detection (tap zones, swipe, pinch)
- `src/hooks/useLibraryMobile.ts` — Mobile file I/O via Capacitor filesystem
- `capacitor.config.ts` — Android configuration

### Acceptance Criteria
- [ ] Tap-to-play/pause works in focus mode
- [ ] Swipe gestures adjust WPM
- [ ] Pinch zoom adjusts font size
- [ ] File picker imports documents
- [ ] Share intent receives files and URLs
- [ ] Full-screen immersive reading mode

---

## 10.3 Cloud Sync (Optional)

### Goal
Sync reading progress, library, and settings between desktop and mobile.

### Technical Design

**Sync Backend Options:**

**Option A: Firebase Realtime Database / Firestore (Simplest)**
- Free tier: 1GB storage, 50k reads/day
- Auth via Google Sign-In (natural for Android)
- Real-time sync with conflict resolution
- SDK available for both web (Electron/Capacitor) and native Android

**Option B: Custom backend with SQLite + S3**
- More control, no vendor lock-in
- More development effort
- Needs hosting

**Recommendation: Firebase** — Fastest to implement, generous free tier, works on both platforms.

**Data Model:**
```
users/{userId}/
  settings: BlurbySettings (merged on sync)
  library/
    {docId}: {
      title, author, wordCount, position, lastReadAt,
      favorite, archived, source, sourceUrl
    }
  // Content NOT synced (too large) — only metadata and progress
```

**Conflict Resolution:**
- Last-write-wins for settings (latest timestamp)
- Per-doc merge for library: highest `position` wins (you never lose progress)
- `lastReadAt`: latest timestamp wins
- `favorite`/`archived`: latest timestamp wins

**Offline-First Architecture:**
- Local storage is source of truth
- Sync runs on app launch and periodically (every 5 minutes)
- Queue changes when offline, replay on reconnect
- Visual indicator: "Synced" / "Syncing..." / "Offline (changes will sync)"

**Auth Flow:**
- Google Sign-In button in Settings > Connectors
- After auth, automatic background sync begins
- Optional: sign out to disable sync
- Desktop: Google Sign-In via Electron OAuth flow
- Mobile: Native Google Sign-In via Capacitor plugin

**Files to Create:**
- `src/services/sync.ts` — Sync engine (push/pull/merge)
- `src/services/firebase.ts` — Firebase initialization and auth
- `src/hooks/useSyncStatus.ts` — Sync state for UI indicators
- `src/components/settings/SyncSettings.tsx` — Sign in/out, sync status

### Acceptance Criteria
- [ ] Google Sign-In works on both desktop and mobile
- [ ] Reading progress syncs within 5 seconds of change
- [ ] Offline changes queue and sync on reconnect
- [ ] Conflicts resolved without data loss (highest progress wins)
- [ ] Content files NOT synced (only metadata)
- [ ] Sign out clears cloud association but keeps local data

---

## 10.4 Distribution

### Goal
Publish Blurby on Google Play Store.

### Requirements

**Google Play Developer Account:**
- [ ] Register ($25 one-time fee)
- [ ] Create app listing: name, short/long description, feature graphic (1024×500), screenshots (phone + tablet)
- [ ] Privacy policy URL (required)
- [ ] Content rating questionnaire
- [ ] Target API level ≥ 34 (Android 14)

**Build Pipeline:**
- [ ] Capacitor `npx cap sync android` to copy web assets
- [ ] Android Studio build → signed APK / AAB (Android App Bundle)
- [ ] Generate signing key (`keytool -genkey -v -keystore blurby.keystore`)
- [ ] Configure `build.gradle` with signing config

**Testing:**
- [ ] Internal testing track (invite up to 100 testers)
- [ ] Closed beta track (broader testing with opt-in link)
- [ ] Production release

**Ongoing:**
- [ ] Version bump: update `package.json`, `capacitor.config.ts`, `build.gradle`
- [ ] Play Store listing updates
- [ ] Crash reporting via Firebase Crashlytics
- [ ] User review monitoring

### Acceptance Criteria
- [ ] Signed AAB uploads to Play Console without errors
- [ ] App passes Google Play pre-launch report (automated testing)
- [ ] App installs and runs on Pixel 6+ emulator (API 34)
- [ ] App installs and runs on Samsung Galaxy S21+ (real device)
- [ ] App available on Google Play Store
