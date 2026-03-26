# Wave 4 — E-Ink Mode Overhaul

## Problem Statement

E-ink is currently a **theme** (visual styling) with bolted-on reading behavior (WPM ceiling, phrase grouping, ghosting prevention). This creates confusion:

1. **Theme ≠ Mode:** E-ink changes *how the app operates* (pagination in scroll view, WPM caps, touch targets), not just how it looks. That's a mode, not a theme.
2. **Incomplete integration:** Ghosting prevention only fires in ScrollReaderView, not PageReaderView. Phrase grouping only in Focus mode.
3. **Settings buried:** E-ink settings only visible when e-ink theme is selected, hidden in ThemeSettings.
4. **Theme lock-in:** Users on e-ink devices can't use dark/light themes while keeping e-ink behavior (no animations, large touch targets, ghosting prevention).

## Target Architecture

**E-ink becomes a display mode that layers on top of any theme.**

```
Current:  theme = "dark" | "light" | "eink" | "system"
                                      ↑ conflates visual + behavioral

Target:   theme = "dark" | "light" | "system"
          displayMode = "standard" | "eink"
                                      ↑ behavioral only
```

### What "E-Ink Mode" Controls (Behavioral)

| Feature | Standard | E-Ink |
|---------|----------|-------|
| Animations | CSS transitions | Disabled globally |
| WPM ceiling | None (up to 1200) | Configurable (default 250) |
| Touch targets | Default sizing | 48px minimum |
| Ghosting prevention | Off | Every N page turns |
| Phrase grouping | Off | Optional (2-3 word groups) |
| Hover effects | Enabled | Disabled |
| Shadows/gradients | Enabled | Disabled |
| Scroll behavior | Smooth scroll | Paginated snap |
| Refresh overlay | N/A | Full-screen flash every N turns |
| Progress bar | Filled | Border-based (no fill) |

### What Theme Controls (Visual)

| Feature | Dark | Light | E-Ink Light | E-Ink Dark |
|---------|------|-------|-------------|------------|
| Background | #1a1a2e | #ffffff | #ffffff | #1a1a2e |
| Text | #e0e0e0 | #111111 | #000000 | #ffffff |
| Accent | #c4a882 | #8b6f47 | #333333 | #cccccc |
| Borders | subtle | subtle | bold (2px) | bold (2px) |

**Key insight:** E-ink devices can be dark OR light. The user should pick their preferred theme AND enable e-ink mode separately.

## Implementation Plan

### Phase 1: Decouple E-Ink from Theme System

**Settings schema change:**
```typescript
// types.ts
interface BlurbySettings {
  theme: "dark" | "light" | "system";  // remove "eink" option
  einkMode: boolean;                     // NEW: e-ink display mode toggle
  // existing e-ink settings stay:
  einkWpmCeiling: number;
  einkRefreshInterval: number;
  einkPhraseGrouping: boolean;
}
```

**CSS change:**
- Move ALL behavioral e-ink styles from `[data-theme="eink"]` to `[data-eink="true"]`
- Keep visual overrides (B&W colors, no shadows) in a new `[data-eink="true"]` section that overrides the active theme
- ThemeProvider sets `data-eink="true"` on `<html>` when `settings.einkMode === true`

**Migration:**
- If `settings.theme === "eink"`, migrate to `{ theme: "light", einkMode: true }`
- Schema version bump handles this automatically

### Phase 2: Dedicated E-Ink Settings Panel

**New settings sub-page: "E-Ink Display"**

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| E-Ink Mode | toggle | false | Master enable/disable |
| WPM Ceiling | slider | 250 | Maximum WPM (100-400) |
| Refresh Interval | slider | 20 | Full refresh every N page turns (5-50) |
| Phrase Grouping | toggle | true | Group 2-3 words in Focus mode |
| Touch Mode | toggle | true | Enlarged touch targets (48px min) |
| Contrast | selector | "high" / "normal" | High = pure B&W, Normal = theme colors |

**Accessible from:**
- MenuFlap → Settings → E-Ink Display
- Ctrl+K → "E-Ink Display" / "E-Ink Mode"
- Bottom bar quick settings (if e-ink mode active)

### Phase 3: Complete Integration Across All Reader Views

**PageReaderView:**
- Add ghosting prevention on page turns (currently missing)
- Disable page transition animation when e-ink active
- Larger page turn click targets (full left/right halves already work)

**ScrollReaderView:**
- Paginated snap mode (already implemented)
- Ensure ghosting prevention fires on all page turn events

**ReaderView (Focus/RSVP):**
- Phrase grouping (already implemented)
- Disable word transition animations
- Ensure ORP highlighting uses bold/underline instead of color

**ReaderBottomBar:**
- E-ink indicator icon when mode is active
- All buttons use 48px minimum touch targets in e-ink mode
- No hover color changes (touch-friendly)

**FlowCursorController:**
- Disable CSS transition sliding (instant position jumps)
- Use bold/underline instead of translucent overlay

### Phase 4: E-Ink Specific UX

**Page turn gesture zones:**
- Left 40% of screen: previous page
- Right 40% of screen: next page
- Center 20%: toggle bottom bar visibility

**Swipe gestures (if touch device detected):**
- Swipe left: next page
- Swipe right: previous page
- Swipe down: open menu/settings
- Long press: word selection for notes/define

**Screen refresh strategy:**
- Partial refresh: normal reading (fast, may ghost)
- Full refresh: every N page turns (slow, clears ghosting)
- Force refresh: Ctrl+R or dedicated button in bottom bar

## Files to Change

### Phase 1 (Decouple)
| File | Change |
|------|--------|
| `src/types.ts` | Add `einkMode: boolean`, remove `"eink"` from theme union |
| `src/constants.ts` | Add `einkMode: false` to DEFAULT_SETTINGS |
| `src/components/ThemeProvider.tsx` | Set `data-eink` attribute, remove "eink" from themes map |
| `src/styles/global.css` | Move `[data-theme="eink"]` styles to `[data-eink="true"]` |
| `main/migrations.js` | Add migration: `theme: "eink"` → `{ theme: "light", einkMode: true }` |
| `src/components/ReaderContainer.tsx` | Change `isEink` from `theme === "eink"` to `settings.einkMode` |

### Phase 2 (Settings)
| File | Change |
|------|--------|
| `src/components/settings/EinkSettings.tsx` | NEW — dedicated e-ink settings panel |
| `src/components/MenuFlap.tsx` | Add "E-Ink Display" nav item |
| `src/components/CommandPalette.tsx` | Add e-ink settings entries |

### Phase 3 (Integration)
| File | Change |
|------|--------|
| `src/components/PageReaderView.tsx` | Add ghosting prevention on page turns |
| `src/components/ReaderBottomBar.tsx` | E-ink indicator, touch targets |
| `src/utils/FlowCursorController.ts` | Disable transitions in e-ink |
| `src/styles/global.css` | Touch target enlargement rules |

### Phase 4 (UX)
| File | Change |
|------|--------|
| `src/components/PageReaderView.tsx` | Gesture zones, swipe detection |
| `src/components/ReaderBottomBar.tsx` | Force refresh button |

## Acceptance Criteria

### Phase 1
1. E-ink mode is a boolean toggle, not a theme selection
2. Users can use dark/light theme WITH e-ink mode enabled
3. Migration automatically converts `theme: "eink"` to `{ theme: "light", einkMode: true }`
4. All existing e-ink behavior preserved (WPM cap, ghosting prevention, etc.)

### Phase 2
5. Dedicated "E-Ink Display" settings page with all e-ink controls
6. Accessible from Ctrl+K and MenuFlap
7. E-ink settings visible regardless of current theme

### Phase 3
8. Ghosting prevention works in PageReaderView (not just ScrollReaderView)
9. All animations disabled when e-ink mode active
10. Touch targets ≥ 48px in all reader views
11. Flow cursor uses instant positioning (no CSS transitions)
12. Focus word uses bold/underline (no color highlights)

### Phase 4
13. Page turn gesture zones work (left/right/center)
14. Force refresh button available in bottom bar
15. Swipe gestures detected on touch-enabled devices

## Effort Estimate

| Phase | Scope | Hours |
|-------|-------|-------|
| Phase 1: Decouple | Schema, migration, CSS split, ThemeProvider | 4-6 |
| Phase 2: Settings | New panel, MenuFlap nav, Ctrl+K entries | 2-3 |
| Phase 3: Integration | Reader views, bottom bar, flow cursor | 4-6 |
| Phase 4: UX | Gestures, refresh button, touch detection | 3-4 |
| Testing | All phases, cross-theme/mode combinations | 2-3 |
| **Total** | | **15-22 hours (2-3 sprints)** |

## Sprint Breakdown

```
Sprint E1: Phase 1 + 2 (decouple + settings)
    ↓
Sprint E2: Phase 3 (integration across all views)
    ↓
Sprint E3: Phase 4 (touch/gesture UX) — can be deferred post-v1
```

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| CSS selector migration breaks existing e-ink styles | High | Test with actual e-ink device (or emulator) after migration |
| Schema migration loses e-ink settings | High | Migration creates backup before conversion |
| Touch gesture conflicts with existing click handlers | Medium | Use threshold-based detection (swipe > 50px travel) |
| E-ink mode + dark theme = poor contrast | Medium | Add contrast setting (high/normal) that forces B&W in high mode |
| Performance regression from dual attribute checks | Low | CSS `[data-eink]` is fast; no runtime overhead |
