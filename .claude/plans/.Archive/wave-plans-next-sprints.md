# Wave Plans — Next Sprints

**Source:** All incomplete bugs from `docs/project/BUG_REPORT.md` as of 2026-03-25.
**Total incomplete:** 22 bugs across 6 categories.

---

## Wave 5 — Reader Mode Polish (Sprint 25A)
**Theme:** Fix remaining reader mode behavior issues. These are the highest-priority UX bugs that affect daily reading.
**Effort:** 4-6 hours | **Priority:** P0

| Bug | Issue | Effort |
|-----|-------|--------|
| **BUG-031** | Bottom bar not visible/accessible in Focus/Flow mode | Small — z-index layering between `.reader-container` and `.reader-bottom-bar` needs final tuning |
| **BUG-040** | Focus overlay covers bottom bar (clickable but visually blocked) | Small — same root cause as 031 |
| **BUG-051** | Mode buttons auto-start instead of selecting | Medium — refactor `handleEnterFocus/Flow/Tts` to only set `lastReadingMode`, Space dispatches |
| **BUG-052** | NM speed changes don't apply immediately | Small — cancel current audio + restart chunk at new rate |
| **BUG-053** | Up/Down arrows should adjust TTS rate in NM | Small — add narration-mode branch in keyboard handler |
| **BUG-054** | Small click areas in menu flap | Small — audit flap button padding, ensure full-area clickability |
| **BUG-060** | Remove "[Sample]" from onboarding book | Trivial — find and update title string |

**Execution order:**
```
[1] BUG-051 (mode select vs auto-start) — architectural, do first
    ↓
[2-3] PARALLEL:
    ├─ BUG-031/040 (bottom bar in Focus/Flow)
    └─ BUG-052/053 (NM speed controls)
    ↓
[4-5] PARALLEL:
    ├─ BUG-054 (flap click areas)
    └─ BUG-060 (sample book title)
    ↓
[6] Test + build
```

---

## Wave 5B — Branding (Sprint 25A, can parallel with Wave 5)
**Theme:** Apply Blurby brand identity to the app chrome.
**Effort:** 3-4 hours | **Priority:** P1

| Bug | Issue | Effort |
|-----|-------|--------|
| **BUG-061** | Replace hamburger with Blurby icon | Small — swap ☰ for `Blurby.icon.png` (~24px), all themes |
| **BUG-062** | New "Blurby" default brand theme | Medium — new theme in ThemeProvider with brand colors: white bg, Highlight Blue (#CAE4FE) chrome, Accent Red (#E63946), Core Blue (#2E73FF) dividers |

**Brand palette:**
| Token | Hex | Use |
|-------|-----|-----|
| Background | #FFFFFF | Content areas |
| Highlight Blue | #CAE4FE | Menu flap, bottom bar, raised surfaces |
| Core Blue | #2E73FF | Dividers, borders, tab indicators |
| Accent Red | #E63946 | Active buttons, progress, highlights |
| Text | #1A1A1A | Primary text |
| Text Dim | #666666 | Secondary text |

**Assets:** `Blurby Brand/Blurby.icon.png`, `Blurby Brand/Blurby.tray-icon.png`

---

## Wave 6 — Library UX Overhaul (Sprint 25B)
**Theme:** Library layout customization and card information density.
**Effort:** 8-10 hours | **Priority:** P1

| Bug | Issue | Effort |
|-----|-------|--------|
| **BUG-050** | Library cards: 3 lines (Title, Author, Book Data with pages/time) | Medium — update DocGridCard and DocCard rendering, calculate page count from word count |
| **BUG-055** | Combine Text Size + Layout → "Reading Layout" settings page | Small — merge two existing pages, rename nav item |
| **BUG-056** | New "Library Layout" settings page (sort, view, size, spacing, columns) | Medium — new component, new settings fields |
| **BUG-057** | CSS rules for library layout options (card sizes, spacing presets) | Medium — CSS classes for small/medium/large, compact/cozy/roomy |
| **BUG-058** | Library Layout + Reading Layout in Ctrl+K | Small — add entries |
| **BUG-049** | Window control buttons match theme | Small — `titleBarOverlay` color config |

**New settings fields needed:**
```typescript
// BlurbySettings additions
defaultSort: "progress" | "alpha" | "author" | "newest" | "oldest";
defaultViewMode: "grid" | "list";  // rename existing viewMode
cardSize: "small" | "medium" | "large";
cardSpacing: "compact" | "cozy" | "roomy";
listColumns: 1 | 2;
```

**Execution order:**
```
[1] BUG-055 (merge settings pages)
    ↓
[2] BUG-056 + BUG-057 (new Library Layout page + CSS rules)
    ↓
[3] BUG-050 (card 3-line layout)
    ↓
[4-5] PARALLEL:
    ├─ BUG-058 + BUG-059 (Ctrl+K comprehensive entries)
    └─ BUG-049 (window controls theme)
    ↓
[6] Test + build
```

---

## Wave 7 — Ctrl+K Completeness (Sprint 25B or 25C)
**Theme:** Every setting searchable from the command palette.
**Effort:** 3-4 hours | **Priority:** P1

| Bug | Issue | Effort |
|-----|-------|--------|
| **BUG-059** | Every individual setting searchable in Ctrl+K | Medium — comprehensive audit of all settings pages, generate palette entries for each toggle/slider/dropdown |

**Approach:**
1. Audit every settings page and list all individual controls
2. Generate `PaletteItem` entries for each, grouped by settings page
3. Each entry opens the correct settings page (scrolling to the relevant section if possible)
4. Estimated ~40-60 individual entries across Theme, Reading Layout, Speed Reading, Library Layout, Hotkeys, Connectors, Cloud Sync, Help

Can be combined with Wave 6 since both touch CommandPalette.tsx.

---

## Wave 8 — Content Pipeline (Sprint 26)
**Theme:** Preserve book formatting, images, and structure. Previously spec'd as "Wave 3."
**Effort:** 18-22 hours (2-3 sprints) | **Priority:** P2

| Bug | Issue | Effort |
|-----|-------|--------|
| **BUG-033** | Formatting stripped (lists, headers, bold/italic) | Large — EPUB/MOBI/HTML parsers → Markdown output |
| **BUG-034** | Images stripped from books | Large — EPUB image extraction, local storage, renderer display |
| **BUG-035** | No chapter detection for non-EPUB | Medium — heuristic pattern matching |
| **BUG-036** | No auto-generated TOC | Medium — build from detected chapters, render as first page |
| **BUG-038** | Hotkey coaching in reader views | Medium — expand HotkeyCoach, 10+ new hints |

**Full spec:** `.claude/plans/wave3-content-pipeline.md`

**Execution order:**
```
Sprint 26A: BUG-033 + BUG-034 (content pipeline + images)
Sprint 26B: BUG-035 + BUG-036 (chapters + TOC)
Sprint 26C: BUG-038 (hotkey coaching — independent, can run any time)
```

---

## Wave 9 — E-Ink Mode Overhaul (Sprint 27)
**Theme:** Decouple e-ink from theme system, make it a display mode.
**Effort:** 15-22 hours (2-3 sprints) | **Priority:** P2

| Bug | Issue | Effort |
|-----|-------|--------|
| **BUG-037** | E-ink is a theme instead of a display mode | Large — schema change, CSS split, settings panel, integration across all views |

**Full spec:** `.claude/plans/wave4-eink-mode-overhaul.md`

---

## Wave 10 — Kokoro Polish (Sprint 25A, low priority)
**Theme:** Remaining Kokoro TTS edge cases.
**Effort:** 2-3 hours | **Priority:** P1 (can run in parallel with Wave 5)

| Bug | Issue | Effort |
|-----|-------|--------|
| **BUG-032** | Kokoro "Not Responding" flash on first use | Small — better loading UX, possible eager preload on app startup |
| **BUG-039** | Space bar last-used mode (partially done) | Already fixed — verify working |

---

## Summary — Sprint Queue

| Sprint | Wave | Scope | Bugs | Hours |
|--------|------|-------|------|-------|
| **25A** | Wave 5 + 5B + 10 | Reader polish + Branding + Kokoro | 031, 032, 039, 040, 051-054, 060, 061, 062 | 9-12h |
| **25B** | Wave 6 + 7 | Library UX + Ctrl+K | 049, 050, 055-059 | 12-14h |
| **26** | Wave 8 | Content pipeline | 033-036, 038 | 18-22h |
| **27** | Wave 9 | E-ink overhaul | 037 | 15-22h |

**Total remaining:** ~54-70 hours across 4-5 sprints.
