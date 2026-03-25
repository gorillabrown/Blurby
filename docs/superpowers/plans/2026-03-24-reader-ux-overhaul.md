# Reader UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul reader keyboard shortcuts, command palette routing, TTS architecture, flow mode animation, and page view readability.

**Architecture:** 8 changes organized by dependency order — keyboard layer first, then command palette, then page readability, then flow mode mechanics, then TTS. Each task is independently testable.

**Tech Stack:** React 19, TypeScript, CSS custom properties, Web Speech API

**Spec:** `docs/superpowers/specs/2026-03-24-reader-ux-overhaul-design.md`

---

### Task 1: Tab → Menu Flap Toggle + F6 Focus Zones

**Files:**
- Modify: `src/hooks/useKeyboardShortcuts.ts` (lines 148-149, 412-422)

- [ ] **Step 1: Update Tab handler in useReaderKeys**

In `useKeyboardShortcuts.ts` ~line 148-149, replace:
```typescript
if (e.key === "Tab" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.switchMode?.(); return; }
```
with:
```typescript
if (e.key === "Tab" && !e.ctrlKey && !e.metaKey) { e.preventDefault(); s.toggleFlap?.(); return; }
```

- [ ] **Step 2: Update Tab handler in useLibraryKeyboard, add F6 for focus zones**

In `useKeyboardShortcuts.ts` ~lines 412-422, replace the Tab focus-zone cycling block:
```typescript
if (e.key === "Tab") {
  e.preventDefault();
  const zones: Array<"search" | "grid" | "sidebar"> = ["search", "grid", "sidebar"];
  const currentIdx = zones.indexOf(focusZone);
  const nextIdx = e.shiftKey
    ? (currentIdx - 1 + zones.length) % zones.length
    : (currentIdx + 1) % zones.length;
  setFocusZone(zones[nextIdx]);
  return;
}
```
with:
```typescript
// Tab toggles menu flap
if (e.key === "Tab" && !e.ctrlKey && !e.metaKey) {
  e.preventDefault();
  s.toggleFlap?.();
  return;
}
// F6 cycles focus zones (a11y replacement for Tab)
if (e.key === "F6") {
  e.preventDefault();
  const zones: Array<"search" | "grid" | "sidebar"> = ["search", "grid", "sidebar"];
  const currentIdx = zones.indexOf(focusZone);
  const nextIdx = e.shiftKey
    ? (currentIdx - 1 + zones.length) % zones.length
    : (currentIdx + 1) % zones.length;
  setFocusZone(zones[nextIdx]);
  return;
}
```

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: All 512 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useKeyboardShortcuts.ts
git commit -m "feat: Tab toggles menu flap everywhere, F6 for focus zones"
```

---

### Task 2: Space → Flow, Shift+Space → Focus

**Files:**
- Modify: `src/components/ReaderContainer.tsx` (lines 312-326, 337-342)
- Modify: `src/components/ReaderBottomBar.tsx` (line 30)

- [ ] **Step 1: Update handleTogglePlay in ReaderContainer**

At ~lines 312-326, replace:
```typescript
const handleTogglePlay = useCallback(() => {
  if (readingMode === "page") {
    // Space in Page → enter Focus
    handleEnterFocus();
  } else if (readingMode === "flow") {
```
with:
```typescript
const handleTogglePlay = useCallback(() => {
  if (readingMode === "page") {
    // Space in Page → enter Flow
    handleEnterFlow();
  } else if (readingMode === "flow") {
```

- [ ] **Step 2: Add Shift+Space → Focus in useReaderKeys**

In `useKeyboardShortcuts.ts` ~lines 171-174, the existing code is:
```typescript
if (e.code === "Space" && !e.shiftKey) { e.preventDefault(); s.togglePlay(); return; }
if (e.code === "Space" && e.shiftKey) { e.preventDefault(); s.enterFlow?.(); return; }
```
Change to:
```typescript
if (e.code === "Space" && !e.shiftKey) { e.preventDefault(); s.togglePlay(); return; }
if (e.code === "Space" && e.shiftKey) { e.preventDefault(); s.enterFocus?.(); return; }
```

Note: `enterFocus` needs to be added to the `ReaderKeysState` interface (~line 46-67) and passed from ReaderContainer. Add `enterFocus?: () => void;` to the interface. Pass `handleEnterFocus` at the useReaderKeys call site (~line 411).

- [ ] **Step 3: Remove handleSwitchMode from ReaderContainer**

Delete `handleSwitchMode` (~lines 337-342) and remove `switchMode` from the useReaderKeys call site (~line 411). Also remove `switchMode` from the `ReaderKeysState` interface.

- [ ] **Step 4: Update hint text in ReaderBottomBar**

At ~line 30, change:
```typescript
page: "← → page  ↑ ↓ speed  space focus  ⇧space flow  M menu",
```
to:
```typescript
page: "← → page  ↑ ↓ speed  space flow  ⇧space focus  tab menu",
```

- [ ] **Step 5: Run tests + build**

Run: `npm test && npm run build`
Expected: All tests pass, zero TS errors

- [ ] **Step 6: Commit**

```bash
git add src/components/ReaderContainer.tsx src/hooks/useKeyboardShortcuts.ts src/components/ReaderBottomBar.tsx
git commit -m "feat: Space enters Flow, Shift+Space enters Focus, remove mode cycling"
```

---

### Task 3: Command Palette → Direct Settings Navigation

**Files:**
- Modify: `src/components/CommandPalette.tsx` (lines 13-21, 78-191)
- Modify: `src/components/MenuFlap.tsx` (lines 21-32, 48-53)
- Modify: `src/components/LibraryContainer.tsx` (lines 151-153, 453-465)

- [ ] **Step 1: Update onOpenSettings signature in CommandPalette**

Change `CommandPaletteProps.onOpenSettings` from `() => void` to `(page?: string) => void`.

- [ ] **Step 2: Add all 8 settings sub-pages to action registry**

Replace the existing 2 settings actions (~lines 136-149) with 8:
```typescript
{ type: "setting", label: "Settings: Theme", sublabel: "Dark, light, e-ink, system themes", onSelect: () => { onAction(() => onOpenSettings("theme")); onClose(); } },
{ type: "setting", label: "Settings: Layout", sublabel: "Page layout and spacing", onSelect: () => { onAction(() => onOpenSettings("layout")); onClose(); } },
{ type: "setting", label: "Settings: Speed Reading", sublabel: "WPM, pauses, flow word span", onSelect: () => { onAction(() => onOpenSettings("speed-reading")); onClose(); } },
{ type: "setting", label: "Settings: Hotkeys", sublabel: "Keyboard shortcut reference", onSelect: () => { onAction(() => onOpenSettings("hotkeys")); onClose(); } },
{ type: "setting", label: "Settings: Connectors", sublabel: "Site logins and integrations", onSelect: () => { onAction(() => onOpenSettings("connectors")); onClose(); } },
{ type: "setting", label: "Settings: Help", sublabel: "About, updates, support", onSelect: () => { onAction(() => onOpenSettings("help")); onClose(); } },
{ type: "setting", label: "Settings: Text Size", sublabel: "Adjust reading text size", onSelect: () => { onAction(() => onOpenSettings("text-size")); onClose(); } },
{ type: "setting", label: "Settings: Cloud Sync", sublabel: "OneDrive / Google Drive sync", onSelect: () => { onAction(() => onOpenSettings("cloud-sync")); onClose(); } },
```

- [ ] **Step 3: Add targetView prop to MenuFlap**

Add `targetView?: string | null` to `MenuFlapProps` (~line 21-32).

Guard the view-reset useEffect (~lines 48-53):
```typescript
useEffect(() => {
  if (open) {
    setView(targetView || "queue");
  }
}, [open, targetView]);
```

- [ ] **Step 4: Update LibraryContainer to thread settings page**

Add state: `const [settingsPage, setSettingsPage] = useState<string | null>(null);`

Update `handleOpenSettings`:
```typescript
const handleOpenSettings = useCallback((page?: string) => {
  setSettingsPage(page || null);
  setMenuFlapOpen(true);
}, []);
```

Pass `targetView={settingsPage}` to MenuFlap. Clear `settingsPage` when flap closes:
```typescript
onClose={() => { setMenuFlapOpen(false); setSettingsPage(null); }}
```

Update `onOpenSettings` type in all CommandPalette render sites.

- [ ] **Step 5: Run tests + build**

Run: `npm test && npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/components/CommandPalette.tsx src/components/MenuFlap.tsx src/components/LibraryContainer.tsx
git commit -m "feat: command palette routes to specific settings sub-pages"
```

---

### Task 4: Page View Readability — Text Size, Margins, Two-Column

**Files:**
- Modify: `src/constants.ts` (line 24)
- Modify: `src/styles/global.css` (lines 3371-3376, 3419-3435)

- [ ] **Step 1: Update default text size**

In `constants.ts` line 24, change:
```typescript
export const DEFAULT_FOCUS_TEXT_SIZE = 100;
```
to:
```typescript
export const DEFAULT_FOCUS_TEXT_SIZE = 110;
```

- [ ] **Step 2: Double side margins on page reader**

In `global.css` ~line 3376, change:
```css
padding: 40px 60px 20px;
```
to:
```css
padding: 40px 120px 20px;
```

- [ ] **Step 3: Add two-column layout above 1280px**

After the `.page-reader-content` styles (~line 3435), add:
```css
@media (min-width: 1280px) {
  .page-reader-content {
    column-count: 2;
    column-gap: 48px;
  }
  .page-reader-content p,
  .page-reader-content .page-word-line {
    break-inside: avoid;
  }
}
```

- [ ] **Step 4: Run tests + build**

Run: `npm test && npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/constants.ts src/styles/global.css
git commit -m "feat: page view readability — 110% text, double margins, two-column"
```

---

### Task 5: Flow Sliding Window (Min 3, Default 3, Max 5)

**Files:**
- Modify: `src/constants.ts` (line 102)
- Modify: `src/components/PageReaderView.tsx` (lines 277, 299-315, 489-491)
- Modify: `src/components/settings/SpeedReadingSettings.tsx` (lines 106-122)

- [ ] **Step 1: Update default and constant**

In `constants.ts` line 102, change:
```typescript
export const DEFAULT_FLOW_WORD_SPAN = 1;
```
to:
```typescript
export const DEFAULT_FLOW_WORD_SPAN = 3;
```

- [ ] **Step 2: Clamp flowWordSpan at runtime**

In `PageReaderView.tsx` ~line 277, change:
```typescript
const wordSpan = settings?.flowWordSpan || 1;
```
to:
```typescript
const wordSpan = Math.max(3, settings?.flowWordSpan || 3);
```

- [ ] **Step 3: Change RAF loop to 1-word advance**

In the RAF loop (~lines 299-315), change:
```typescript
const baseInterval = 60000 / flowWpmRef.current;
const interval = baseInterval * wordSpan;
```
to:
```typescript
const baseInterval = 60000 / flowWpmRef.current;
const interval = baseInterval; // 1 word per tick (sliding window)
```

And change the advance step (~line 315):
```typescript
const next = flowHighlightRef.current + wordSpan;
```
to:
```typescript
const next = flowHighlightRef.current + 1; // slide by 1 word
```

- [ ] **Step 4: Update settings slider**

In `SpeedReadingSettings.tsx` ~lines 110-119, change `min={1}` to `min={3}`. Update the fallback displays from `|| 1` to `|| 3`.

- [ ] **Step 5: Run tests + build**

Run: `npm test && npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/constants.ts src/components/PageReaderView.tsx src/components/settings/SpeedReadingSettings.tsx
git commit -m "feat: flow mode sliding window — min 3, max 5, 1-word advance"
```

---

### Task 6: Flow Cursor → Bold Underline

**Files:**
- Modify: `src/styles/global.css` (lines 3461-3472)
- Modify: `src/components/PageReaderView.tsx` (lines 224-252)

- [ ] **Step 1: Update CSS**

Replace `.flow-highlight-cursor` styles (~lines 3461-3472):
```css
.flow-highlight-cursor {
  position: absolute;
  background: var(--color-primary, #D04716);
  opacity: 0.25;
  border-radius: 3px;
  pointer-events: none;
  z-index: 1;
  transition: transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1),
              width 0.1s cubic-bezier(0.25, 0.1, 0.25, 1);
  z-index: 1;
}
```
with:
```css
.flow-highlight-cursor {
  position: absolute;
  background: var(--color-primary, #D04716);
  opacity: 1;
  height: var(--flow-cursor-height, 3px);
  border-radius: 1.5px;
  pointer-events: none;
  z-index: 1;
  transition: transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1),
              width 0.1s cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

- [ ] **Step 2: Update positionFlowCursor to span multiple words + underline position**

In `positionFlowCursor` (~lines 224-252), update to calculate position spanning from first to last highlighted word, positioned at bottom:

```typescript
const positionFlowCursor = useCallback((wordIdx: number) => {
  const cursor = flowCursorRef.current;
  if (!cursor) return;
  // First word in window
  const firstEl = document.querySelector(`[data-word-index="${wordIdx}"]`) as HTMLElement;
  if (!firstEl) return;
  const container = firstEl.closest(".page-reader-content") as HTMLElement;
  if (!container) return;
  const cRect = container.getBoundingClientRect();
  const firstRect = firstEl.getBoundingClientRect();

  // Last word in window
  const lastIdx = Math.min(wordIdx + wordSpan - 1, (flowWordsRef.current?.length || 1) - 1);
  const lastEl = document.querySelector(`[data-word-index="${lastIdx}"]`) as HTMLElement;
  const lastRect = lastEl ? lastEl.getBoundingClientRect() : firstRect;

  // Column break detection: if last word is left of first word, clamp to first word's column
  const clampedLastRect = (lastRect.left < firstRect.left) ? firstRect : lastRect;

  const x = firstRect.left - cRect.left + container.scrollLeft;
  const y = firstRect.bottom - cRect.top + container.scrollTop - 3; // underline at bottom
  const w = clampedLastRect.right - firstRect.left;

  const isLineWrap = Math.abs(y - flowCursorLastY.current) > 20;
  flowCursorLastY.current = y;

  const fast = wpm > ANIMATION_DISABLE_WPM;
  cursor.className = "flow-highlight-cursor"
    + (isLineWrap ? " flow-highlight-cursor--line-wrap" : "")
    + (fast ? " flow-highlight-cursor--fast" : "");

  cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  cursor.style.width = `${w}px`;
  cursor.style.height = "3px";
  cursor.style.display = "";
}, [wpm, wordSpan]);
```

Note: `wordSpan` needs to be in scope. It's already defined at line 277. Add it to the dependency array.

- [ ] **Step 3: Run tests + build**

Run: `npm test && npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css src/components/PageReaderView.tsx
git commit -m "feat: flow cursor as bold underline sliding under text"
```

---

### Task 7: Pagination-Aware Flow

**Files:**
- Modify: `src/constants.ts`
- Modify: `src/components/PageReaderView.tsx` (lines 279-350)

- [ ] **Step 1: Add FLOW_PAGE_TURN_PAUSE_MS constant**

In `constants.ts`, add:
```typescript
/** Pause duration at end of page before auto-turning in Flow mode (ms) */
export const FLOW_PAGE_TURN_PAUSE_MS = 600;
```

- [ ] **Step 2: Update RAF loop to pause at page boundaries**

In the RAF loop (~lines 279-350), after the advance step, replace the page-flip logic with a pause-and-turn approach:

When `next` exceeds the current page's `end` word index:
1. Set a `flowPagePausingRef` flag
2. Pause for `FLOW_PAGE_TURN_PAUSE_MS`
3. Call `nextPage()` (which handles `PAGE_TRANSITION_MS` animation)
4. After both delays, resume from first word of new page
5. If `next >= words.length`, stop flow entirely

Also: if user manually turns page while flow is active, stop flow (`setFlowPlaying(false)`).

- [ ] **Step 3: Run tests + build**

Run: `npm test && npm run build`

- [ ] **Step 4: Commit**

```bash
git add src/constants.ts src/components/PageReaderView.tsx
git commit -m "feat: flow mode pauses and auto-turns at page boundaries"
```

---

### Task 8: TTS Leads the Cursor

**Files:**
- Modify: `src/hooks/useNarration.ts` (lines 86-142)
- Modify: `src/components/ReaderContainer.tsx` (lines 288-299)
- Modify: `src/components/PageReaderView.tsx`

- [ ] **Step 1: Add hold/resume to useNarration**

Add a `holdRef = useRef(false)` to the hook. In `speakNextChunk`'s `utterance.onend` handler (~line 129), check `holdRef.current` before calling `speakNextChunk()`:

```typescript
utterance.onend = () => {
  utteranceRef.current = null;
  cursorWordIndexRef.current = endIdx;
  if (onWordAdvanceRef.current) {
    onWordAdvanceRef.current(endIdx);
  }
  // Only auto-chain if not held (page boundary pause)
  if (isCursorDrivenRef.current && !holdRef.current) {
    speakNextChunk();
  }
};
```

Add `hold()` and `resumeChaining()` methods:
```typescript
const hold = useCallback(() => { holdRef.current = true; }, []);
const resumeChaining = useCallback(() => {
  holdRef.current = false;
  if (isCursorDrivenRef.current) speakNextChunk();
}, [speakNextChunk]);
```

Add both to the hook's return value.

- [ ] **Step 2: Disable RAF loop when TTS is active**

In `PageReaderView.tsx` RAF loop, add a guard at the top of `tick()`:
```typescript
// When TTS drives the cursor, skip RAF-based advancement
if (ttsActiveRef.current) {
  flowRafRef.current = requestAnimationFrame(tick);
  return;
}
```

Pass `ttsActive` as a prop to PageReaderView and store in a ref.

- [ ] **Step 3: Wire hold/resume into page boundary logic**

In the page-boundary pause logic (Task 7), when TTS is active:
- Call `narration.hold()` before the page turn pause
- Call `narration.resumeChaining()` after the page turn completes

- [ ] **Step 4: Handle document end**

When TTS reaches `words.length`, call `narration.stop()` and `setFlowPlaying(false)`.

- [ ] **Step 5: Run tests + build**

Run: `npm test && npm run build`

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useNarration.ts src/components/ReaderContainer.tsx src/components/PageReaderView.tsx
git commit -m "feat: TTS leads cursor with hold/resume at page boundaries"
```

---

## Dependency Order

```
[Task 1] Tab → menu flap (no deps)
    ↓
[Task 2] Space → Flow (depends on Task 1 removing switchMode)
    ↓
[Task 3] Command palette routing (depends on menu flap changes)
    ↓
[Task 4] Page readability (CSS, independent)
    ↓
[Task 5] Flow sliding window (constants + RAF)
    ↓
[Task 6] Flow underline cursor (depends on Task 5's wordSpan)
    ↓
[Task 7] Pagination-aware flow (depends on Tasks 5+6)
    ↓
[Task 8] TTS leads cursor (depends on Task 7's page boundaries)
```
