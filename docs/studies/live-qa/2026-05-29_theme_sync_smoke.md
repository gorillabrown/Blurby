# THEME-SYNC-1 Smoke Gate — Live QA Verdict

**Date:** 2026-05-29
**Operator:** Cowork (Claude) driving via computer-use MCP
**Skill:** `anthropic-skills:live-qa`
**Sprint under test:** THEME-SYNC-1 (commit `0fcf432` on main) — Vite circular chunk fix + BUG-182 theme-subscription probe
**Build version observed:** v1.1.2 (per Settings panel — F4 from 2026-05-27 sweep still unaddressed)
**Smoke gate verdict:** **RED — BUG-182 PERSISTS** on the Settings panel surface in **eink** theme. Reader and other themes clean. Triggers the escalation path defined in the THEME-SYNC-1 dispatch ("targeted live-debug session with DevTools CSS inspection").

---

## Executive summary

Cowork drove the BUG-182 verification smoke test against a clean post-THEME-SYNC-1 build of Blurby. Result is unambiguous: **eink theme renders the Settings panel container with no opaque background fill — library content (titles, reading counts, book covers, author text) is plainly visible bleeding through the panel.** The bug is scoped to the Settings panel surface only; reader surface in eink renders correctly with the intended paper-cream background. All other themes (light, blurby, dark, system) apply cleanly across the full Settings panel.

This means the THEME-SYNC-1 work on theme-subscription wiring did not address the underlying CSS variable / background fill missing from eink-specific styling. The next sprint should be a narrow CSS audit of the eink theme stylesheet — locate the background variable the Settings panel uses, ensure eink defines it opaquely.

---

## Checklist disposition

| ID | Scenario | Verdict | Notes |
|---|---|---|---|
| TS1 | Launch + baseline theme | **PASS** | Single window, library renders cleanly in light theme. F1 (single-instance lock) status unverified this pass — only one launch made. |
| TS2 | Access Settings panel | **PASS** | Ctrl+, → Reading Queue → gear icon → Settings root. All 8 sub-pages enumerated: Reading Layout, Speed Reading, Narration (TTS), Theme, Library Layout, Connectors, Cloud Sync, Hotkey Map. |
| TS3 | Walk all 8 sub-pages in light theme | **PASS** | Every sub-page rendered with consistent light theming. White background, dark text, blue accents on toggles/selections. No mixed states. |
| TS4 | Toggle theme → next (eink) | **FAIL** | After toggling to eink, the Settings panel container has no opaque background. Library content visible through the panel. Theme buttons, accent swatches, font selectors, sliders all themed correctly — the bug is on the panel container only. Evidence captured at 21:01 2026-05-29. |
| TS5 | Walk sub-pages in eink theme | **FAIL** (Reading Layout confirmed) | Transparency persists on Reading Layout sub-page (library bleeds through "Focus Reader: 120%" / "Flow Reader: 100%" labels). Bug is panel-container-level, not sub-page-specific. |
| TS6a | Toggle to blurby | **PASS** | Panel opaque again. Theme sub-page now shows only Theme selector row (Accent Color / Font sections hidden — likely intentional for the brand theme). |
| TS6b | Toggle to dark | **PASS** | Clean dark theme. Black panel background, light text, themed controls. Library behind also dark (top bar, tabs). Book covers retain original artwork (correct). Reading Layout in dark also clean. |
| TS6c | Toggle to system | **PASS** | Identical to dark (Windows is currently in dark mode). Clean. |
| TS7 | Rapid theme-cycle stress | **DEFERRED** | Single-direction cycle traversed (light → eink → blurby → dark → system → eink). Rapid-back-and-forth stress not performed — gate already RED on TS4, additional stress would add no information for verdict purposes. |
| TS8 | Reader surface theme check | **PASS** (sample) | Why Nations Fail opened in eink theme. Reader rendered with proper cream/paper background, dark text, themed mode buttons and play control. Eink theme works correctly on the reader surface. |
| TS9 | Library surface in eink | **INCONCLUSIVE** | Library after closing Settings in eink appeared washed against the dark Windows wallpaper, but could not definitively distinguish "intentional cream-paper rendering" from "transparent background bleed" from a single screenshot. The reader-surface PASS suggests the library is also using the same correct eink rendering as the reader; the apparent washout is likely intentional contrast against dark wallpaper. Recommend confirming during the follow-up live-debug pass. |

---

## Finding F5 — BUG-182 persists on Settings panel surface in eink theme

**Severity:** HIGH / P1 (gates THEME-SYNC-1)
**Surface affected:** Settings panel container (all 8 sub-pages)
**Themes affected:** eink only. Light, blurby, dark, system all clean.
**Surfaces NOT affected:** Reader (renders eink correctly with cream-paper background). Library likely also unaffected (inconclusive — see TS9).

**Symptom (confirmed by two independent screenshots):**
- Theme sub-page in eink: panel transparent, library "My reading list" title, "132 readings · 1108h 57m", Meditations cover, Why Nations Fail cover, "Marcus Aurelius" author text all visible through the Settings panel.
- Reading Layout sub-page in eink: same transparency — library header, tabs (all 132 / new 1 / favorites 0 / archived 1 / etc.), READING NOW section, all three book covers (Meditations, Why Nations Fail, 1929) and NOT STARTED section all visible through the panel; "Focus Reader: 120%" and slider visible on top of the bled-through library.

**Diagnosis hypothesis:**
The Settings panel uses a CSS variable (likely `--bg`, `--bg-raised`, `--surface`, or similar) for its background fill. The eink theme either:
- Sets that variable to `transparent` (most likely),
- Sets it to a value with low alpha,
- Or does not define it, causing it to fall through to a transparent default.

The fact that themed controls inside the panel (theme buttons, accent swatches, font selectors) render correctly suggests the theme is applying — it's just the panel container background that's missing. The fact that the reader works correctly in eink suggests the reader uses a different (correctly-defined) variable for its background, OR the eink theme defines the reader's variable but not the Settings panel's variable.

**Probable root cause class:**
Variable-scope mismatch between the eink theme stylesheet and the Settings panel CSS. Either the panel uses a variable eink doesn't define, or eink overrides the variable to transparent.

**Fix path (recommended for next sprint):**
1. **Aristotle (read-only)** — Open `src/styles/global.css` and any eink-specific theme stylesheet. Identify all `--bg*` / `--surface*` / `--panel*` CSS custom properties. List which ones eink defines.
2. **Inspect Settings panel** — Find the Settings panel container in `src/components/` (likely `SettingsPanel.tsx` or `Settings/index.tsx`). Identify which background variable it uses.
3. **Compare** — Determine which variable is unset/transparent under eink.
4. **Fix** — Either (a) add the missing variable definition to the eink theme block, or (b) point the Settings panel at a variable that all themes define. Prefer (a) so eink can choose its own background tint.
5. **Smoke** — Re-run TS3 + TS5 in eink only; both must PASS.

**Why this wasn't caught by THEME-SYNC-1:**
The THEME-SYNC-1 work was scoped to theme-SUBSCRIPTION wiring (do sub-pages get notified when the theme changes?). That's a JavaScript / React state question. The actual root cause of BUG-182 is a CSS-variable issue — sub-pages were correctly notified and did re-render, but the re-render under eink produces a transparent panel because the CSS variable resolves to nothing useful. The probe sprint (task #5 in the dispatch) was on the right track but didn't drill into the CSS layer.

---

## Other findings (carried over from 2026-05-27 sweep, status this pass)

**F1 — Single-instance lock missing.** Not exercised this pass (only one Blurby launch). Status: unchanged from prior pass.

**F2 — Meditations reader crash.** Not exercised this pass — used Why Nations Fail per skill discipline. Status: presumed still broken pending MEDITATIONS-FIX-1 sprint.

**F3 — Reader column doesn't scale.** **REPRODUCED** in eink reader (Why Nations Fail mid-word breaks: "200,00 / o were", "murde / red", "Guate / mala", "betwee / n 1962", "Genera / l Efrain"). Confirms F3 is theme-agnostic — affects all themes. Status: unchanged.

**F4 — Version label stale.** **REPRODUCED** — Settings still shows v1.1.2 despite THEME-SYNC-1 landing at `0fcf432` on main. Either the label hasn't been updated since v1.1.2 or Evan is running a build that doesn't include THEME-SYNC-1. If the latter, this entire pass needs to be re-run against the actual current build. **HIGH PRIORITY to resolve** — without it, neither F5 nor any future smoke gate verdict is trustworthy.

---

## Recommended next sprint

**SPRINT-D — EINK-PANEL-BG-1 (P1)**

- **Goal:** Settings panel renders with opaque background in eink theme.
- **LOE:** XS (likely 1–3 CSS lines).
- **Lane:** Lane C (UI surfaces).
- **Branch:** `sprint/eink-panel-bg-1` from clean main.
- **Investigation gate (Aristotle):** Locate the CSS variable used by the Settings panel container background; locate the eink theme block in the relevant stylesheet; identify the mismatch.
- **Task table:**
  1. Aristotle — Read `src/styles/global.css` and any eink-specific stylesheet. Identify the variable mismatch.
  2. Hercules (renderer-scope) — Apply the fix (define the variable, or point the panel at a guaranteed-opaque variable).
  3. Hippocrates — `npm test` + `npm run build`.
  4. Live-QA follow-up — Re-run TS3 in eink only; must PASS.
- **Success criteria:** All 8 Settings sub-pages in eink theme render with an opaque background; no library content bleeds through. Other themes unaffected. No regression on reader surface in eink.

**Dependency / sequencing:**
- F4 (version label / build provenance) is BLOCKING for trusting any verdict, including this one. Resolve F4 FIRST (verify Evan is on the post-THEME-SYNC-1 build).
- If F4 resolves to "build IS post-THEME-SYNC-1 but version label stale," dispatch EINK-PANEL-BG-1 immediately and bundle a 1-line version-label bump.
- If F4 resolves to "build is pre-THEME-SYNC-1," re-run this entire smoke test against the post-THEME-SYNC-1 build before dispatching anything.

---

## Caveats

1. **F4 (version label / build provenance) is unresolved.** Settings shows v1.1.2 despite source-tree being post-THEME-SYNC-1. This pass's verdict assumes Evan is running the current build. If he isn't, the verdict is moot.
2. **TS9 (library in eink) is inconclusive.** The apparent washout could not be distinguished from intentional cream-paper rendering with a single screenshot. Reader surface working in eink suggests the library is also fine. Confirm in the follow-up debug pass.
3. **F3 (column width) reproduces in eink reader** — confirmed orthogonal to theme.
4. **Audio behavior not exercised** — out of scope for this gate.
5. **TS7 (rapid-cycle stress) was deferred** — gate already RED on TS4; rapid stress adds no information for verdict purposes. Should be run as part of the EINK-PANEL-BG-1 smoke verification.

---

## Appendix — Evidence captured

- Light theme baseline screenshots: library, Settings root, all 8 sub-pages — all clean.
- Eink theme on Theme sub-page (21:01): full transparency, library bleeds through. Zoom captured.
- Eink theme on Reading Layout (21:05): same transparency, library bleeds through.
- Blurby theme on Settings root + Reading Layout: opaque, looks identical to light.
- Dark theme on Theme sub-page + Reading Layout (21:04): clean dark, themed controls.
- System theme on Theme sub-page (21:04): clean dark (Windows in dark mode), themed controls.
- Eink theme on reader (21:06): cream-paper background, dark text, themed controls, themed bottom bar — CLEAN. F3 reproduces here.

---

*End of smoke gate report. THEME-SYNC-1 BUG-182 fix verification: **RED**. Awaiting EINK-PANEL-BG-1 dispatch decision (gated on F4 resolution).*
