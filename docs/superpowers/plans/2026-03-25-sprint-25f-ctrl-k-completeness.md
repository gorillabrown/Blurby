# Sprint 25F — Ctrl+K Completeness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every app setting and action discoverable via Ctrl+K, wire hotkey coaching toasts into all clickable UI, fix the hotkey map layout, and clean up Help settings.

**Architecture:** Five independent changes to the renderer layer. No main process, IPC, or data model changes. CommandPalette gets ~30 new entries in its static registry. HotkeyCoach moves from LibraryContainer to App.tsx for global coverage, with 8 new reader-specific hints wired into ReaderBottomBar click handlers. HelpSettings loses its redundant shortcuts section. CSS fix for hotkey grid uses `display: contents`.

**Tech Stack:** React 19, TypeScript, CSS custom properties, Vitest

**Spec:** `docs/superpowers/specs/2026-03-25-sprint-25f-ctrl-k-completeness-design.md`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/components/CommandPalette.tsx` | Modify | Add ~30 new palette entries, remove duplicate |
| `src/components/HotkeyCoach.tsx` | Modify | Add 8 new reader coaching hints to COACH_HINTS map |
| `src/App.tsx` | Modify | Import and render `<HotkeyCoach />` globally |
| `src/components/LibraryContainer.tsx` | Modify | Remove `<HotkeyCoach />` import and render |
| `src/components/ReaderBottomBar.tsx` | Modify | Import `triggerCoachHint`, add calls in click handlers |
| `src/components/MenuFlap.tsx` | Modify | Add `triggerCoachHint("settings")` to settings button |
| `src/components/settings/HelpSettings.tsx` | Modify | Remove Keyboard Shortcuts section and unused imports |
| `src/styles/global.css` | Modify | Add `.hotkey-row`, `.hotkey-settings`, `.hotkey-section-title` rules |
| `tests/notes-reading-log.test.js` | Modify | Update COACH_HINTS test data with new reader entries |

---

## Task 1: CSS Fix — Hotkey Map Grid Layout

**Files:**
- Modify: `src/styles/global.css:2516-2539` (hotkey grid section)

- [ ] **Step 1: Add hotkey-row, hotkey-settings, hotkey-section-title CSS rules**

After the existing `.hotkey-key.planned` rule (around line 2539), add:

```css
.hotkey-row {
  display: contents;
}

.hotkey-settings {
  padding: 0;
}

.hotkey-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin: 16px 0 8px;
}

.hotkey-section-title:first-child {
  margin-top: 0;
}
```

- [ ] **Step 2: Run build to verify**

Run: `npm run build`
Expected: Build succeeds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "fix: hotkey map grid layout — display:contents on .hotkey-row"
```

---

## Task 2: BUG-060 — Remove Keyboard Shortcuts from Help Settings

**Files:**
- Modify: `src/components/settings/HelpSettings.tsx`

- [ ] **Step 1: Remove unused imports**

In `HelpSettings.tsx` line 2, change:

```typescript
import { REWIND_WORDS, WPM_STEP } from "../../constants";
```

Remove this line entirely. These constants are only used in the keyboard shortcuts section being removed.

- [ ] **Step 2: Remove the Keyboard Shortcuts section**

Remove lines 34-50 (the `<div className="settings-section-label">Keyboard Shortcuts</div>` and the entire `<div className="hotkey-grid">...</div>` block that follows it, ending just before the "Adding Content" section label).

The component should now start its return JSX with:

```tsx
return (
  <div>
    <div className="settings-section-label">Adding Content</div>
    <div style={{ fontSize: 12, color: "var(--text-dim)", lineHeight: 1.6, marginBottom: 20 }}>
      ...
```

- [ ] **Step 3: Run build to verify**

Run: `npm run build`
Expected: Build succeeds. No TypeScript errors about unused imports.

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/HelpSettings.tsx
git commit -m "fix: remove redundant keyboard shortcuts from Help settings (BUG-060)"
```

---

## Task 3: BUG-058 + BUG-059 — Complete Command Palette Registry

**Files:**
- Modify: `src/components/CommandPalette.tsx:78-161` (buildActions function)

- [ ] **Step 1: Remove duplicate "Settings: Toggle Theme" entry**

In `CommandPalette.tsx`, remove line 84:

```typescript
{ type: "setting", label: "Settings: Toggle Theme", sublabel: "Dark, light, e-ink themes", onSelect: act(() => onOpenSettings("theme")) },
```

This duplicates the "Settings: Theme" entry on line 99.

- [ ] **Step 2: Add Library Layout entries (BUG-058)**

After the existing "Settings: Cloud Sync" entry (line 106), add:

```typescript
// Library Layout
{ type: "setting", label: "Settings: Library Layout", sublabel: "Sort, grid/list, card size, spacing", onSelect: act(() => onOpenSettings("library-layout")) },
{ type: "setting", label: "Default Sort Order", sublabel: "Closest to done, A-Z, newest, oldest", onSelect: act(() => onOpenSettings("library-layout")) },
{ type: "setting", label: "Library View Mode", sublabel: "Grid or list view", onSelect: act(() => onOpenSettings("library-layout")) },
{ type: "setting", label: "Card Size", sublabel: "Small, medium, large cards", onSelect: act(() => onOpenSettings("library-layout")) },
{ type: "setting", label: "Card Spacing", sublabel: "Compact, cozy, roomy", onSelect: act(() => onOpenSettings("library-layout")) },
```

- [ ] **Step 3: Add Layout text size entries (BUG-058)**

After the existing "Word Spacing" entry (line 119), add:

```typescript
{ type: "setting", label: "Focus Text Size", sublabel: "Adjust focus reader text size", onSelect: act(() => onOpenSettings("layout")) },
{ type: "setting", label: "Flow Text Size", sublabel: "Adjust flow reader text size", onSelect: act(() => onOpenSettings("layout")) },
```

- [ ] **Step 4: Add ThemeSettings sub-entries (BUG-059)**

After the existing "Font" entry (around line 115), add:

```typescript
{ type: "setting", label: "Theme Mode", sublabel: "Blurby, dark, light, e-ink, system", onSelect: act(() => onOpenSettings("theme")) },
{ type: "setting", label: "E-Ink Phrase Grouping", sublabel: "2-3 words per tick on e-ink displays", onSelect: act(() => onOpenSettings("theme")) },
{ type: "setting", label: "E-Ink WPM Ceiling", sublabel: "Max reading speed for e-ink", onSelect: act(() => onOpenSettings("theme")) },
{ type: "setting", label: "E-Ink Screen Refresh", sublabel: "Refresh interval for e-ink ghosting", onSelect: act(() => onOpenSettings("theme")) },
```

- [ ] **Step 5: Add SpeedReadingSettings sub-entries (BUG-059)**

After the existing "Narration (TTS)" entry (around line 112), add:

```typescript
{ type: "setting", label: "Focus Marks", sublabel: "Toggle ORP focus marks", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Reading Ruler", sublabel: "Toggle reading ruler line", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Focus Span", sublabel: "Adjust focus area width", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Words Per Highlight", sublabel: "Flow mode highlight word count", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Flow Cursor Style", sublabel: "Underline or highlight cursor", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Comma Pauses", sublabel: "Pause on commas, colons, semicolons", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Sentence Pauses", sublabel: "Pause at sentence endings", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Paragraph Pauses", sublabel: "Pause at paragraph breaks", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Number Pauses", sublabel: "Pause on numbers", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Long Word Pauses", sublabel: "Pause on words longer than 8 chars", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Enable TTS", sublabel: "Turn text-to-speech on/off", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Voice Engine", sublabel: "System or Kokoro AI voices", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "TTS Voice", sublabel: "Choose narration voice", onSelect: act(() => onOpenSettings("speed-reading")) },
{ type: "setting", label: "Speech Rate", sublabel: "Adjust TTS playback speed", onSelect: act(() => onOpenSettings("speed-reading")) },
```

- [ ] **Step 6: Add CloudSyncSettings, Connectors, Help sub-entries (BUG-059)**

After the Cloud Sync and Library Layout entries, add:

```typescript
// Cloud Sync sub-settings
{ type: "setting", label: "Sync Interval", sublabel: "How often to sync (1/5/15/30 min, manual)", onSelect: act(() => onOpenSettings("cloud-sync")) },
{ type: "setting", label: "Microsoft Account", sublabel: "Connect OneDrive for sync", onSelect: act(() => onOpenSettings("cloud-sync")) },
{ type: "setting", label: "Google Account", sublabel: "Connect Google Drive for sync", onSelect: act(() => onOpenSettings("cloud-sync")) },
// Connectors
{ type: "setting", label: "Site Login", sublabel: "Add authenticated site for article import", onSelect: act(() => onOpenSettings("connectors")) },
// Help
{ type: "setting", label: "Check for Updates", sublabel: "Check if a newer version is available", onSelect: act(() => onOpenSettings("help")) },
```

- [ ] **Step 7: Run build to verify**

Run: `npm run build`
Expected: Build succeeds. No TypeScript errors.

- [ ] **Step 8: Commit**

```bash
git add src/components/CommandPalette.tsx
git commit -m "feat: complete command palette — all settings searchable (BUG-058, BUG-059)"
```

---

## Task 4: BUG-038 — Expand HotkeyCoach and Move to App.tsx

**Files:**
- Modify: `src/components/HotkeyCoach.tsx:12-20` (COACH_HINTS map)
- Modify: `src/App.tsx:1-152`
- Modify: `src/components/LibraryContainer.tsx:19,604`
- Modify: `tests/notes-reading-log.test.js:58-65`

- [ ] **Step 1: Add 8 new reader entries to COACH_HINTS map**

In `HotkeyCoach.tsx`, expand the `COACH_HINTS` record (line 12) to include reader bottom bar actions:

```typescript
const COACH_HINTS: Record<string, CoachHint> = {
  // Library hints (existing)
  archive: { action: "archive", hotkey: "E" },
  favorite: { action: "favorite", hotkey: "S" },
  star: { action: "star", hotkey: "S" },
  search: { action: "search", hotkey: "/" },
  delete: { action: "delete", hotkey: "#" },
  queue: { action: "queue", hotkey: "Q" },
  settings: { action: "open settings", hotkey: "Ctrl+," },
  // Reader hints (new)
  play: { action: "play/pause", hotkey: "Space" },
  enterFocus: { action: "enter Focus mode", hotkey: "Shift+Space" },
  enterFlow: { action: "enter Flow mode", hotkey: "Space" },
  narration: { action: "toggle narration", hotkey: "N" },
  fontSize: { action: "adjust font size", hotkey: "Ctrl+=/−" },
  prevChapter: { action: "go to previous chapter", hotkey: "[" },
  nextChapter: { action: "go to next chapter", hotkey: "]" },
  menu: { action: "toggle menu", hotkey: "Tab" },
};
```

Note: The existing `settings` entry had action "settings" — update to "open settings" for clearer toast text. The existing `menu` entry (if present with hotkey "M") should be updated to hotkey "Tab" since Tab is the universal menu toggle.

- [ ] **Step 2: Update test data to match new COACH_HINTS**

In `tests/notes-reading-log.test.js`, update the `COACH_HINTS` object (line 58) and the test assertions (line 229+) to include the new entries:

```javascript
const COACH_HINTS = {
  archive: { action: "archive", hotkey: "E" },
  favorite: { action: "favorite", hotkey: "S" },
  search: { action: "search", hotkey: "/" },
  queue: { action: "queue", hotkey: "Q" },
  settings: { action: "open settings", hotkey: "Ctrl+," },
  play: { action: "play/pause", hotkey: "Space" },
  enterFocus: { action: "enter Focus mode", hotkey: "Shift+Space" },
  enterFlow: { action: "enter Flow mode", hotkey: "Space" },
  narration: { action: "toggle narration", hotkey: "N" },
  fontSize: { action: "adjust font size", hotkey: "Ctrl+=/−" },
  prevChapter: { action: "go to previous chapter", hotkey: "[" },
  nextChapter: { action: "go to next chapter", hotkey: "]" },
  menu: { action: "toggle menu", hotkey: "Tab" },
};
```

Remove the `openReader` entry (not in the actual component). Update existing test assertions for `menu` (new hotkey "Tab" instead of "M") and `settings` (new action text "open settings"). Add new test assertions for `play`, `narration`, `enterFocus`:

```javascript
it("returns reader coaching hints", () => {
  expect(getCoachHint("play")).toEqual({ action: "play/pause", hotkey: "Space" });
  expect(getCoachHint("narration")).toEqual({ action: "toggle narration", hotkey: "N" });
  expect(getCoachHint("enterFocus")).toEqual({ action: "enter Focus mode", hotkey: "Shift+Space" });
});
```

- [ ] **Step 3: Run tests to verify**

Run: `npm test`
Expected: All tests pass including updated HotkeyCoach tests.

- [ ] **Step 4: Move HotkeyCoach from LibraryContainer to App.tsx**

In `src/App.tsx`, add the import at the top (after existing imports around line 10):

```typescript
import HotkeyCoach from "./components/HotkeyCoach";
```

In the `App()` component return (line 144), add `<HotkeyCoach />` inside the ThemeProvider, after the main content div:

```tsx
return (
  <ThemeProvider initialTheme="dark">
    <a href="#main-content" className="skip-to-content">Skip to content</a>
    <div id="main-content">
      {isStandaloneReader ? <StandaloneReader /> : <LibraryContainer />}
    </div>
    <HotkeyCoach />
  </ThemeProvider>
);
```

- [ ] **Step 5: Remove HotkeyCoach from LibraryContainer**

In `src/components/LibraryContainer.tsx`:

1. Remove the import on line 19: `import HotkeyCoach from "./HotkeyCoach";`
2. Remove the render on line 604: `<HotkeyCoach />`

- [ ] **Step 6: Run build to verify**

Run: `npm run build`
Expected: Build succeeds. No unused import warnings.

- [ ] **Step 7: Commit**

```bash
git add src/components/HotkeyCoach.tsx src/App.tsx src/components/LibraryContainer.tsx tests/notes-reading-log.test.js
git commit -m "feat: expand HotkeyCoach with reader hints, move to App.tsx (BUG-038)"
```

---

## Task 5: BUG-038 — Wire triggerCoachHint into Reader Bottom Bar

**Files:**
- Modify: `src/components/ReaderBottomBar.tsx:1-320`
- Modify: `src/components/MenuFlap.tsx`

- [ ] **Step 1: Import triggerCoachHint in ReaderBottomBar**

At the top of `ReaderBottomBar.tsx`, add the import:

```typescript
import { triggerCoachHint } from "./HotkeyCoach";
```

- [ ] **Step 2: Wire coaching into font size buttons**

In `ReaderBottomBar.tsx`, find the font size buttons (lines 193 and 201). Change each `onClick` to also call `triggerCoachHint("fontSize")`:

```tsx
<button
  className="rbb-font-btn"
  onClick={() => { triggerCoachHint("fontSize"); onAdjustFocusTextSize(-FOCUS_TEXT_SIZE_STEP); }}
  aria-label="Decrease font size"
>
```

```tsx
<button
  className="rbb-font-btn"
  onClick={() => { triggerCoachHint("fontSize"); onAdjustFocusTextSize(FOCUS_TEXT_SIZE_STEP); }}
  aria-label="Increase font size"
>
```

- [ ] **Step 3: Wire coaching into play/pause button**

Find the play/pause button (line 212). Change `onClick`:

```tsx
<button
  className={`rbb-play-btn ${playing ? "rbb-play-btn--active" : ""}`}
  onClick={() => { triggerCoachHint("play"); onTogglePlay(); }}
  aria-label={playing ? "Pause" : "Play"}
  title={playing ? "Pause (Space)" : "Play (Space)"}
>
```

Note: `onTogglePlay` is currently passed directly. Wrap it in an arrow function to add the coaching call.

- [ ] **Step 4: Wire coaching into Focus and Flow mode buttons**

Find the Focus button (line 224) and Flow button (line 231). Change each `onClick`:

```tsx
<button
  className={`rbb-mode-btn ${readingMode === "focus" ? "rbb-mode-btn--active" : ""}${readingMode === "page" && lastReadingMode === "focus" ? " rbb-mode-btn--last" : ""}`}
  onClick={() => { triggerCoachHint("enterFocus"); onEnterFocus(); }}
  aria-label="Focus mode"
  aria-pressed={readingMode === "focus"}
>
```

```tsx
<button
  className={`rbb-mode-btn ${readingMode === "flow" ? "rbb-mode-btn--active" : ""}${readingMode === "page" && lastReadingMode === "flow" ? " rbb-mode-btn--last" : ""}`}
  onClick={() => { triggerCoachHint("enterFlow"); onEnterFlow(); }}
  aria-label="Flow mode"
  aria-pressed={readingMode === "flow"}
>
```

- [ ] **Step 5: Wire coaching into TTS toggle button**

Find the TTS/Narrate button (line 241). Change `onClick`:

```tsx
<button
  className={`rbb-mode-btn ${readingMode === "narration" ? "rbb-mode-btn--active" : ""}${readingMode === "page" && lastReadingMode === "narration" ? " rbb-mode-btn--last" : ""}`}
  onClick={() => { triggerCoachHint("narration"); onToggleTts(); }}
  aria-label={readingMode === "narration" ? "Stop narration" : "Start narration"}
  aria-pressed={readingMode === "narration"}
  title="Narration (N)"
>
```

- [ ] **Step 6: Wire coaching into chapter navigation buttons**

Find prev chapter button (line 256) and next chapter button (line 271). Change each `onClick`:

```tsx
<button
  className="rbb-chapter-arrow"
  onClick={() => { triggerCoachHint("prevChapter"); onPrevChapter(); }}
  disabled={curChapterIdx <= 0}
  aria-label="Previous chapter"
>
```

```tsx
<button
  className="rbb-chapter-arrow"
  onClick={() => { triggerCoachHint("nextChapter"); onNextChapter(); }}
  disabled={curChapterIdx >= chapterList.length - 1}
  aria-label="Next chapter"
>
```

Note: `onPrevChapter` and `onNextChapter` are currently passed directly as `onClick` handlers. Wrap them in arrow functions.

- [ ] **Step 7: Wire coaching into MenuFlap settings button**

In `src/components/MenuFlap.tsx`, find the settings button (around line 169, the `onClick={handleGoToSettings}` handler). Add coaching:

First, import at the top:

```typescript
import { triggerCoachHint } from "./HotkeyCoach";
```

Then change the settings button onClick:

```tsx
<button
  className="menu-flap-settings-btn"
  onClick={() => { triggerCoachHint("settings"); handleGoToSettings(); }}
  aria-label="Go to settings"
  title="Settings"
>
```

- [ ] **Step 8: Run tests and build**

Run: `npm test && npm run build`
Expected: All tests pass, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/components/ReaderBottomBar.tsx src/components/MenuFlap.tsx
git commit -m "feat: wire coaching toasts into reader bottom bar and menu flap (BUG-038)"
```

---

## Task 6: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds without errors or warnings.

- [ ] **Step 3: Manual smoke test checklist**

Run: `npm run dev`

Verify in the running app:
1. Ctrl+K → type "library layout" → sees Library Layout entry → selecting opens Library Layout settings
2. Ctrl+K → type "comma" → sees "Comma Pauses" entry → selecting opens Speed Reading settings
3. Ctrl+K → type "sync interval" → sees entry → selecting opens Cloud Sync settings
4. Ctrl+K → type "check for updates" → sees entry → selecting opens Help settings
5. Ctrl+K → no duplicate "Settings: Toggle Theme" entry
6. Settings → Help → only shows "Adding Content" and "Updates" (no shortcuts)
7. Settings → Hotkey Map → two-column layout, action left / key right, no text running together
8. In library, click archive on a doc → sees coaching toast "Next time try E to archive faster"
9. Open a doc in reader → click Play → sees coaching toast "Next time try Space..."
10. Click Narrate button → sees coaching toast "Next time try N..."
11. Same button click a second time → no toast (show-once behavior)

- [ ] **Step 4: Final commit (if any smoke test fixes needed)**

```bash
git add -A
git commit -m "fix: smoke test corrections for Sprint 25F"
```
