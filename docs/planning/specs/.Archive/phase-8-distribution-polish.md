# Phase 8 — Distribution & Polish

## 8.1 App Icons & Branding

### Goal
Create professional icons for all platforms so the app looks polished in installers, taskbars, and system trays.

### Technical Design

**Required Assets:**
- `assets/icon.ico` — Windows: 16×16, 32×32, 48×48, 64×64, 128×128, 256×256 embedded in single .ico
- `assets/icon.icns` — macOS: 16, 32, 64, 128, 256, 512, 1024px sizes
- `assets/icon.png` — Linux/general: 512×512 or 1024×1024 PNG
- `assets/tray-icon.png` — System tray: 16×16 (Windows), 22×22 (Linux), template image for macOS (white on transparent)
- `assets/tray-icon@2x.png` — HiDPI tray icon: 32×32

**Design Direction:**
- Blurby brand: speed reading app → visual metaphor of a focused eye, a word bubble, or a book with motion lines
- Must be legible at 16×16 for system tray
- Should work on both dark and light backgrounds

**Build Configuration:**
- `electron-builder` already configured in package.json for `icon` field
- Verify icon paths in build config point to new assets
- macOS: requires `.icns` format (can convert from PNG using `iconutil` or `png2icns`)
- Windows: requires `.ico` (can convert using `png-to-ico` or ImageMagick)

**Files to Modify:**
- `assets/` — Replace placeholder icons with final artwork
- `package.json` — Verify `build.icon` paths
- `main.js` — Verify tray icon path in system tray creation

### Acceptance Criteria
- [ ] Icons render correctly in Windows installer, taskbar, system tray, desktop shortcut
- [ ] Icons render correctly in macOS Dock, menu bar, DMG
- [ ] Icons render correctly in Linux desktop launcher
- [ ] Icons are sharp on both standard and HiDPI displays

---

## 8.2 Clean VM Testing

### Goal
Verify the app installs and runs correctly on fresh OS installations with no development tools.

### Test Matrix

**Windows:**
- [ ] Install NSIS installer on clean Windows 10 VM
- [ ] Install NSIS installer on clean Windows 11 VM
- [ ] Verify app launches without "VCRUNTIME" or other DLL errors
- [ ] Verify folder selection, document import, reader playback
- [ ] Verify auto-updater check (should gracefully handle no updates available)
- [ ] Verify system tray icon and context menu
- [ ] Test with Windows Defender active (no false positive malware warnings)

**macOS:**
- [ ] Install DMG on clean macOS (Monterey or later)
- [ ] Verify app opens without "unidentified developer" warning (or with expected unsigned warning)
- [ ] Verify all IPC channels work (file I/O, folder watching)
- [ ] Verify title bar styling (hiddenInset)

**Linux:**
- [ ] Run AppImage on clean Ubuntu 22.04
- [ ] Verify all features work (some Linux distros need `--no-sandbox` flag)
- [ ] Test Wayland and X11 display servers

**Cross-Platform Checks:**
- [ ] Settings persist after quit and relaunch
- [ ] Library survives app update (user data directory preserved)
- [ ] Drag-and-drop works
- [ ] URL import works (network access)
- [ ] Reading statistics accumulate correctly

---

## 8.3 E-ink Theme

### Goal
Add a theme optimized for e-ink displays (high contrast, no animations, minimal repaints).

### Technical Design

**CSS Custom Properties for E-ink:**
```css
[data-theme="eink"] {
  --bg: #ffffff;
  --fg: #000000;
  --text-primary: #000000;
  --text-dim: #333333;
  --text-dimmer: #555555;
  --accent: #000000;
  --border: #000000;
  --surface: #f5f5f5;
  /* No gradients, shadows, or transparency */
}
```

**Animation Suppression:**
- E-ink theme should force `prefers-reduced-motion: reduce` behavior regardless of OS setting
- Disable all CSS transitions and animations
- Menu flap opens instantly (no slide animation)
- Progress bar updates without smooth transitions

**Reader Optimizations:**
- Larger default font size for e-ink readability
- Higher contrast ORP highlighting (bold instead of color)
- No focus marks animation
- Reading ruler: thicker (3px) solid black line

**Files to Modify:**
- `src/styles/global.css` — Add `[data-theme="eink"]` variable overrides
- `src/components/ThemeProvider.tsx` — Ensure "eink" theme applies data-theme attribute
- `src/components/settings/ThemeSettings.tsx` — E-ink option already exists in theme selector

### Acceptance Criteria
- [ ] E-ink theme selectable in Settings > Theme
- [ ] High contrast, no color, no gradients
- [ ] All animations disabled
- [ ] Reader is readable and functional in e-ink mode
- [ ] Focus marks visible as bold/underline instead of colored triangles

---

## 8.4 Narration / TTS Integration

### Goal
Add text-to-speech narration that reads content aloud, synced with the visual reader.

### Technical Design

**Web Speech API (Phase 1 — Browser-native):**
- Use `window.speechSynthesis` API available in Electron's Chromium renderer
- List available system voices via `speechSynthesis.getVoices()`
- Create `SpeechSynthesisUtterance` for each sentence or paragraph
- Sync word highlighting with speech events (`onboundary` event fires at each word)

**Architecture:**
```
useNarration hook:
  - voices: SpeechSynthesisVoice[]
  - speaking: boolean
  - start(text, fromWord): begin narration from word position
  - pause(): pause speech
  - resume(): resume speech
  - stop(): cancel narration
  - onWordBoundary(callback): fires with word index during speech
```

**Integration with Reader:**
- New "narration" mode alongside focus/flow/scroll
- Or: narration as an overlay that works in any mode
- When narration active: advance word highlight based on `onboundary` events instead of WPM timer
- WPM slider adjusts speech rate (map 100-1200 WPM to 0.5-3.0 speech rate)

**Settings:**
- Voice selection dropdown (system voices)
- Speech rate slider (separate from WPM or linked)
- Toggle: `T` keyboard shortcut to start/stop narration

**Files to Create/Modify:**
- Create `src/hooks/useNarration.ts` — TTS hook
- Modify `src/components/ReaderView.tsx` — Narration button, sync with word display
- Modify `src/components/ScrollReaderView.tsx` — Narration in flow mode
- Modify `src/components/settings/SpeedReadingSettings.tsx` — Voice selection, narration toggle
- Modify `src/types.ts` — Add narration settings (voice, rate, enabled)

**Limitations:**
- Web Speech API quality varies by OS (macOS has better voices than Windows/Linux)
- No offline voice download — depends on system voices
- `onboundary` event is not reliable in all Chromium versions — may need fallback to estimated timing

### Acceptance Criteria
- [ ] TTS reads document content aloud with system voice
- [ ] Word highlighting synced with speech (or close approximation)
- [ ] Voice and rate selectable in settings
- [ ] `T` keyboard shortcut toggles narration
- [ ] Narration pauses when reader pauses
- [ ] Works on Windows, macOS, and Linux (with available system voices)
