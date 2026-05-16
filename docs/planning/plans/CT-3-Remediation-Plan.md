# CT-3 Remediation Plan

**Date:** 2026-03-28
**Source:** Click-through test run `docs/testing/test-run-CT3-2026-03-28.md`
**Result:** 101 PASS / 6 FAIL / 14 SKIP out of 121 items
**Verdict:** PASS with caveats — all core features functional, issues confined to keyboard shortcuts + visual polish

---

## Triage Summary

### What Actually Broke (True Bugs) — 2 items

| ID | Issue | Severity | Fix Complexity |
|----|-------|----------|----------------|
| KB-16 | `Ctrl+,` opens Reading Queue instead of Settings | MEDIUM | Investigate handler ordering; may be Chrome conflict |
| FOCUS-FLICKER | Focus mode words flicker/bounce during word advancement | LOW | CSS animation + JS reflow changes |

### What Wasn't Tested (Automation Limitations) — 14 items

| Category | Items | Count | Root Cause |
|----------|-------|-------|------------|
| G-sequences | KB-08 through KB-15 | 8 | Browser automation key timing too slow for two-key sequences |
| Drag & Drop | DD-01, DD-02, DD-03 | 3 | Native drag events can't be simulated via MCP |
| Audio output | NAR-08, NAR-09 | 2 | Kokoro toggle not visible; audio not verifiable via screenshots |
| Stub limitation | ERR-01 | 1 | Needs stub `deleteDoc` method to test missing-doc error path |

### What Needs Alignment (Checklist Drift) — 4 items

| Issue | Details |
|-------|---------|
| KB-08 `gl` | No `G+L` shortcut exists. App uses `G+G` for "jump to top" |
| KB-12 `gr` | No `G+R` shortcut exists |
| KB-13 `gs` | App maps `G+S` to "starred/favorites", not "Stats" |
| KB-14/15 `gh`/`gc` | No `G+H` or `G+C` shortcuts exist |

---

## Remediation Workstreams

### CT-3A: Checklist Alignment (doc-keeper, sonnet)

**What:** Rewrite the Keyboard Shortcuts section (KB-01 through KB-18) of `chrome-clickthrough-checklist.md` to match the actual keybindings defined in `useKeyboardShortcuts.ts`.

**Why:** The checklist was written speculatively before shortcuts were finalized. 8 of 18 KB items reference shortcuts that either don't exist or map to different actions than expected.

**How:**
1. Read `src/hooks/useKeyboardShortcuts.ts` exhaustively
2. Map every registered handler to its shortcut key
3. Cross-reference with the keyboard shortcuts overlay (the `?` screen)
4. Rewrite KB-08 through KB-15 to use actual G-sequence mappings: `G+S` (starred), `G+A` (archive), `G+I` (inbox), `G+Q` (queue), `G+G` (top)
5. Remove phantom shortcuts (`gl`, `gr`, `gh`, `gc`)
6. Add any tested-but-unlisted shortcuts from the overlay

**Acceptance:**
- Every KB item references a shortcut that exists in `useKeyboardShortcuts.ts`
- No phantom shortcuts remain
- KB count may change (likely 12-14 items instead of 18)

**Risk:** None — documentation only, no code changes.

---

### CT-3B: Ctrl+, Shortcut Fix (ui-investigator + renderer-fixer, opus + sonnet)

**What:** Investigate and fix why `Ctrl+,` opens the Reading Queue sidebar instead of the Settings panel.

**Why:** The keyboard shortcuts overlay explicitly shows `Ctrl+,` = "Open full settings". The behavior contradicts the documented shortcut.

**Investigation path:**
1. Trace `Ctrl+,` through `useKeyboardShortcuts.ts` — find the handler
2. Check if Chrome intercepts `Ctrl+,` before it reaches the app (Chrome uses `Ctrl+,` for browser settings on some platforms)
3. Check handler ordering — does another handler (Tab / Reading Queue) accidentally fire first?
4. Check if the handler correctly calls the settings open function vs. the queue toggle

**Fix options:**
- **If app bug:** Fix the handler to call `openSettings()` instead of `toggleQueue()`
- **If Chrome conflict:** Document as known limitation, remove from checklist, suggest `Ctrl+Shift+,` as alternative or note that command palette `Ctrl+K` → "Open Settings" is the reliable path

**Acceptance:**
- `Ctrl+,` opens Settings, OR
- Known browser limitation documented and checklist updated

**Risk:** Low. Chrome may genuinely intercept this shortcut, making it unfixable in browser context. The Electron app may work fine.

---

### CT-3C: Focus Mode Visual Stability (renderer-fixer + spec-reviewer, sonnet)

**What:** Eliminate the visible flicker/bounce when words change in Focus mode (RSVP reader).

**Why:** The current animation creates a distracting upward-bounce effect that undermines the calm, focused reading experience Focus mode is designed to provide.

**Root causes identified (6):**

1. **Y-translate animation** — `focus-word-enter` keyframe moves word 8px upward on each change
   - File: `src/styles/global.css`, lines 382-410
   - Fix: Reduce to 0px (opacity-only) or 1-2px max

2. **Forced browser reflow** — `void container.offsetWidth` called every word to re-trigger animation
   - File: `src/components/ReaderView.tsx`, lines 102-107
   - Fix: Use `requestAnimationFrame` or CSS animation class toggle with `animation-name: none` → restore

3. **ORP marker snapping** — Focus marks (above/below guides) jump horizontally with no transition
   - File: `src/components/ReaderView.tsx`, lines 145-147
   - Fix: Add `transition: left 30ms ease` to `.focus-mark` CSS

4. **Font weight shift** — ORP character is 600 weight vs. 300 for others, causing width change
   - File: `src/styles/global.css`, `.reader-word-focus` selector
   - Fix: Use 400-500 weight instead of 600, or use `font-variation-settings` if variable font available

5. **Variable min-width** — `min-width: 40%` on before/after spans recalculates per word
   - File: `src/styles/global.css`, `.reader-word-before` and `.reader-word-after`
   - Fix: Consider fixed percentage or character-count-based width

6. **Viewport-dependent font size** — `clamp(38px, 6vw, 72px)` shifts during resize
   - File: `src/styles/global.css`
   - Fix: Low priority — only affects active resize, not normal reading

**Priority order:** Fix items 1, 2, 3 first (highest visual impact). Items 4-5 are refinements. Item 6 is cosmetic.

**Acceptance:**
- No visible Y-translate bounce at 300 WPM
- ORP markers transition smoothly
- No `void container.offsetWidth` in rendering path
- Verified at both 300 and 600+ WPM

**Risk:** Medium. Animation changes could affect perceived speed or readability. Test at multiple WPMs before committing. The animation disable threshold at 500 WPM (`ANIMATION_DISABLE_WPM` in constants.ts) may need lowering.

---

### CT-3D: Stub Coverage Improvements (renderer-fixer, sonnet)

**What:** Extend the test harness stub to enable testing of drag-and-drop and the missing-doc error state.

**Why:** 4 checklist items (DD-01/02/03 + ERR-01) are permanently SKIP because the stub doesn't support these code paths.

**Tasks:**

1. **Drag-drop zone** — Add `dragover`/`drop` event listeners to the app root div that intercept file drops and route to `window.electronAPI.importDroppedFiles()`. The stub handler should:
   - Accept `.txt`, `.md`, `.epub`, `.pdf`, `.html` files
   - Reject unsupported formats (`.jpg`, `.exe`, etc.) with toast
   - Add accepted files to the library as stub documents
   - Log to console: `[stub] importDroppedFiles → imported: [...] rejected: [...]`

2. **ERR-01 path** — Add `deleteDoc(id)` to `window.__blurbyStub`. When a deleted doc is opened via `loadDocContent`, return an error. Verify the reader shows an error state (not a crash).

**Acceptance:**
- DD-01/02/03 can be tested in next click-through run (browser automation may still need native drag simulation)
- ERR-01 can be tested via `__blurbyStub.deleteDoc("meditations") + click Meditations`
- No regressions in existing stub behavior

**Risk:** Low. Additive changes to the stub only.

---

## Execution Timeline

```
DAY 1 — PARALLEL LAUNCH:
    ├─ CT-3A: Checklist alignment (doc-keeper) .............. ~30 min
    ├─ CT-3B.1: Ctrl+, investigation (ui-investigator) ..... ~15 min
    └─ CT-3C.1: Focus stability fix (renderer-fixer) ....... ~45 min
        ↓ (CT-3B.1 done)
    CT-3B.2: Ctrl+, fix implementation (renderer-fixer) .... ~15 min
        ↓ (CT-3C.1 done)
    CT-3C.2: Focus mode verification (spec-reviewer) ....... ~15 min

DAY 1 — AFTER FIXES:
    ├─ CT-3D: Stub improvements (renderer-fixer) ........... ~30 min
    └─ CT-3E: npm test + npm run build (test-runner) ....... ~5 min
        ↓
    CT-3F: Documentation updates (doc-keeper) ............... ~15 min
        ↓
    CT-3G: Git commit + merge (blurby-lead) ................ ~5 min
```

**Total estimated time:** ~3 hours agent work (parallelized to ~1.5 hours wall clock)

---

## Post-CT-3 Gate

After CT-3 merges AND Sprint 24 audit completes:

1. **If Sprint 24 finds zero CRITICALs** → Tag v1.0.0
2. **If Sprint 24 finds CRITICALs that overlap CT-3 fixes** → Already resolved
3. **If Sprint 24 finds NEW CRITICALs** → Remediation micro-sprint before v1.0.0 tag

---

## Items NOT in CT-3 Scope (Deferred)

| Item | Reason | When |
|------|--------|------|
| G-sequence manual verification | Need Electron app, not browser stub | Post-v1.0.0 or manual smoke test |
| NAR-08/09 Kokoro verification | Need real audio hardware | Electron manual test |
| MODE-06 position preservation | Needs exact word counting automation | Could add as unit test |
| Focus mode `font-size: clamp()` resize issue | Cosmetic, only during active resize | Someday backlog |
| Focus mode font-weight optimization | Refinement, not blocking | Someday backlog |
