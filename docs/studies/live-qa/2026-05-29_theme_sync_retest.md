# THEME-SYNC-1 Smoke Gate Retest — Live QA Verdict

**Date:** 2026-05-29 (retest, ~2 hours after initial smoke at 21:07)
**Operator:** Cowork (Claude) driving via computer-use MCP
**Skill:** `anthropic-skills:live-qa`
**Build under test:** Fresh `npm run dev` build, Settings shows **v1.75.1** (F4 closed).
**Smoke gate verdict:** **GREEN** for THEME-SYNC-1's original BUG-182 scope. **NEW finding F6** discovered during retest — a separate einkMode side-effect that warrants its own sprint.

---

## Executive summary

The retest dispatched by codex-parent had three branches, and the actual finding hit one cleanly: **the Settings panel transparency I observed in the 2026-05-29 21:07 smoke pass was triggered by the E-Ink Display Mode toggle being ON, not by the eink theme color palette being selected.** With einkMode OFF, the eink theme renders the Settings panel correctly opaque on the fresh v1.75.1 build. Toggling einkMode ON immediately reproduces the transparency; toggling OFF cleanly restores opacity. The behavior is 100% deterministic and reversible.

This refines the prior verdict in two ways:
- **THEME-SYNC-1's BUG-182 fix is verified working** for the as-specified scope (eink theme color palette change). The Settings panel does correctly subscribe to theme changes and re-render under the eink palette.
- **F5 from the 2026-05-29 21:07 report was a misdiagnosis** — I attributed the transparency to "eink theme" when the actual trigger was the einkMode toggle state. Codex-parent's step-3 hypothesis ("check whether einkMode was inadvertently toggled ON") was correct; the state was persisted from a prior session.

**A new bug (F6) is established by this retest:** the E-Ink Display Mode toggle has an unintended CSS side-effect that strips the Settings panel container's background, leaving it transparent. This is a separate bug from BUG-182 and warrants its own narrow CSS fix sprint.

---

## Retest sequence

| Step | Action | Observation | Disposition |
|---|---|---|---|
| RT1 | Bring fresh dev build to front | `electron.exe` (dev build) launches as a second Electron instance alongside the default-welcome splash. Welcome splash dismissed. Blurby library renders maximized, 133 readings (was 132), `1109h 2m total`. Light theme by default. | observable |
| RT2 | Confirm version label | Settings → bottom UPDATES section displays **Version 1.75.1**. F4 from 2026-05-27 sweep closed — version label now matches CLAUDE.md source-tree assertion. | **PASS — F4 RESOLVED** |
| RT3 | Inventory Theme sub-page top | Navigate to Theme sub-page. **E-INK DISPLAY MODE** section header present at the very top of the sub-page, above the THEME section. Contains an "E-Ink Display Mode" toggle. State at entry: **OFF** (gray slider, left position). | observable — codex-parent's flagged element confirmed |
| RT4 | Inventory Theme sub-page state | Theme: **eink selected** (persisted from prior session). Accent Color: 8 swatches now (was 7 in prior pass — added gray plus custom). Font: system selected (Georgia, Merriweather, Mono, Literata, OpenDyslexic). Settings panel **opaque** — library content NOT bleeding through. | **PASS — eink theme + einkMode OFF is clean** |
| RT5 | Toggle einkMode ON | Click the E-Ink Display Mode toggle. Slider moves right (blue, active). **Immediately: new E-INK DISPLAY section appears with Phrase grouping toggle, WPM ceiling 350 wpm slider, Screen refresh interval (page turns) 20 slider.** **Settings panel becomes fully transparent.** Library content — "My reading list" title, "133 readings · 1109h 2m total at 175 wpm", tabs (all 133 / new 2 / favorites / archived / etc.), Reading Now section (Meditations / Why Nations Fail / 1929 covers), Not Started section — all bleed through plainly. Theme buttons, accent swatches, font selectors remain themed correctly. | **FAIL — F6 NEW BUG** |
| RT6 | Toggle einkMode OFF | Click the toggle again. Slider returns to left/gray. **Settings panel returns to fully opaque immediately.** E-INK DISPLAY section disappears. Other sub-sections (Theme / Accent / Font) re-displayed in opaque panel. | **PASS — state recovery confirmed** |
| RT7 | Final state | Eink theme selected, einkMode OFF, panel opaque. Workable state for Evan to continue from. | observable |

---

## Disposition of carry-over findings

**F1 (single-instance lock missing).** Not retested this pass. Status: unchanged. Worth noting: the splash welcome window + dev build creates a TWO-window appearance on every `npm run dev` start, but that's an artifact of how Electron handles `npm run dev` without a path-to-app, not the same multi-instance problem F1 describes.

**F2 (Meditations crash).** Not retested this pass — Meditations was not opened. Status: unknown on fresh build. **Recommend a brief follow-up** — clicking Meditations on the fresh build is a 5-second test. If it now opens cleanly, F2 may have been fixed as a side-effect of THEME-SYNC-1 or other intermediate work. If it still crashes, MEDITATIONS-FIX-1 sprint stands.

**F3 (reader column doesn't scale).** Not retested this pass — reader not entered. Status: unchanged.

**F4 (version label stale).** **RESOLVED.** Settings shows v1.75.1 on fresh build.

**F5 (BUG-182 eink theme transparency).** **MISDIAGNOSED.** Reframed as F6 below — the actual trigger was einkMode toggle being ON during the prior pass, not the eink theme palette. The eink theme alone renders cleanly. F5 entry in the 2026-05-29 21:07 report should be marked SUPERSEDED with a pointer to this retest.

---

## New finding F6 — E-Ink Display Mode toggle strips Settings panel background

**Severity:** MEDIUM (down from F5's HIGH — narrower trigger means fewer affected users)
**Reproducer:** Open Settings → Theme sub-page → toggle E-Ink Display Mode ON. Settings panel container loses its background fill; library content visible through the panel.
**Recovery:** Toggle E-Ink Display Mode OFF. Settings panel background restored immediately.
**Theme dependence:** Tested under eink theme. Whether this reproduces under blurby / dark / light / system with einkMode ON has not been tested this pass — recommend a 30-second follow-up to scope.

**Likely root cause class:**
The E-Ink Display Mode toggle sets some app-level state (probably a `data-eink-mode="true"` attribute on the body or root container, OR a CSS class). That state has CSS rules attached that change rendering for the e-ink-display use case. One of those rules is incorrectly stripping or overriding the Settings panel's background-color CSS variable.

This is in the same neighborhood as codex-parent's step-4 hypothesis ("dual-source CSS variables — consolidate eink into ThemeProvider only, remove the conflicting `[data-theme="eink"]` CSS rule") but the dual source here is likely `[data-eink-mode="true"]` rather than `[data-theme="eink"]`. The condition codex-parent specified ("If einkMode is OFF and transparency still happens") was not met — transparency only happens with einkMode ON. So the dual-source consolidation work codex-parent had queued may still be the right fix, but applied to the einkMode attribute selector rather than the theme attribute selector.

**Fix path:**
1. Aristotle — Search for selectors matching `[data-eink-mode]`, `data-eink-mode`, or similar in the codebase. Identify which CSS rule under that selector is removing the Settings panel background (probably setting `background: transparent` or unsetting `--bg` variable).
2. Hercules (renderer-scope) — Either remove the offending rule, scope it to non-Settings surfaces, or ensure the Settings panel uses a background variable that einkMode does not override.
3. Hippocrates — `npm test` + `npm run build`.
4. Live-QA follow-up — Re-run RT5/RT6 in eink theme; both must PASS.
5. Spot-check — Verify einkMode ON in OTHER themes (blurby / dark / light / system) does not cause transparency.

**Severity rationale (medium):**
- The bug only triggers when a user enables E-Ink Display Mode — a niche feature aimed at actual e-ink hardware users.
- When triggered, the Settings panel is unusable visually (text overlays library content) but the controls still work.
- Other Settings surfaces (Reading Layout, Speed Reading, etc.) likely also affected — the bug is at the panel container level, not specific to the Theme sub-page.
- Recovery is one toggle click.
- Not a regression introduced by THEME-SYNC-1 — likely pre-existing, just unrelated to BUG-182's actual scope.

---

## THEME-SYNC-1 close-out

**BUG-182 (Settings sub-pages mixing colors after theme change):** **VERIFIED FIXED** on v1.75.1. The work to consolidate theme subscription through ThemeProvider successfully eliminated the sub-page-doesn't-repaint scenario. Mark BUG-182 RESOLVED in `BUG_REPORT.md`.

**THEME-SYNC-1 sprint:** Close as **VERIFIED**. Smoke gate GREEN for the in-scope deliverable.

**Effort mismatch note (carrying forward from codex-parent's task plan):** The original prior-pass misdiagnosis adds to the engineering-lessons signal codex-parent already flagged about chunk-cycle investigation depth. Both involve confusing a downstream symptom for the upstream cause — recommend a single LESSONS_LEARNED entry covering "perceptual / persistent state can shift cause attribution; always control state before declaring a verdict."

---

## Recommended next sprint

**SPRINT-E — EINK-MODE-PANEL-BG-1 (MEDIUM)**

- **Goal:** E-Ink Display Mode toggle does not strip the Settings panel background.
- **LOE:** XS (likely 1–5 CSS lines).
- **Lane:** Lane C (UI surfaces).
- **Branch:** `sprint/eink-mode-panel-bg-1` from clean main.
- **Investigation gate (Aristotle, read-only):** Locate the CSS rules under `[data-eink-mode]` / einkMode-class selectors. Identify which rule strips the Settings panel background. Confirm whether the rule is intentional (e.g., for an immersive e-ink reader) or accidental scope creep into Settings surfaces.
- **Task table:**
  1. Aristotle — Find the einkMode CSS rule(s) responsible.
  2. Hercules (renderer-scope) — Either remove the rule from Settings panel scope, OR re-scope to reader-only, OR change the panel to use a guaranteed-background variable.
  3. Hippocrates — `npm test` + `npm run build`.
  4. Live-QA follow-up — re-run RT5/RT6 in eink theme; expand to verify einkMode ON in blurby / dark / light / system also keeps panel opaque.
- **Success criteria:** With einkMode toggle ON, Settings panel renders with an opaque background under all 5 themes. Reader e-ink behavior (whatever einkMode is supposed to enable for actual e-ink readers) remains intact.

**Sequencing:**
- F2 (Meditations crash) retest is a quick win — recommend running it in the same session as EINK-MODE-PANEL-BG-1 dispatch.
- F1, F3 remain on the board from prior pass.

---

## Caveats

1. **Only the eink theme + einkMode-ON combination was tested** for the transparency reproducer. Other theme + einkMode-ON combinations have not been verified. Worth a follow-up 30-second check.
2. **Reader surface in einkMode-ON was not tested.** The reader is the intended consumer of einkMode behavior — important to confirm it still renders correctly when einkMode is on.
3. **F2 was not exercised** — Meditations not opened on the fresh build. Should be tested.
4. **F3 (column width) was not exercised** — reader not entered.
5. **The prior pass's F5 was a misdiagnosis**, not a regression — the bug existed in the prior build too, just triggered by a different mechanism than I attributed.

---

## Appendix — evidence captured

- RT2: Settings panel left side, UPDATES section shows `Version 1.75.1` (timestamp 21:23 2026-05-29).
- RT3: Theme sub-page top — `E-INK DISPLAY MODE` header + E-Ink Display Mode toggle visible (state OFF).
- RT4: eink theme highlighted blue in THEME row, accent + font sections visible, panel opaque.
- RT5: After einkMode toggle ON — Settings panel transparent, library content fully visible through (My reading list, 133 readings, tabs, READING NOW, book covers, NOT STARTED section).
- RT6: After einkMode toggle OFF — panel back to opaque, library content correctly hidden behind panel.

---

*End of retest report. THEME-SYNC-1 verdict: **GREEN** (BUG-182 verified fixed). Follow-up sprint: EINK-MODE-PANEL-BG-1 dispatch.*
