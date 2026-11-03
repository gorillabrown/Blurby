#### EINK-APPEARANCE-2 — E-ink is pure white and greyscale, with contrast as its only appearance control *(Seq 126; Full Spec 2026-11-03, cited against RC tip `70d64237`; UX polish; proposed P2)*

- **What:** While E-ink is on:
  - The paper is pure white (`#ffffff`), the text is black, and every surface is a neutral grey. No colour remains: the saved accent colour is not applied, and the red `--danger-muted` becomes grey.
  - The only E-ink appearance control is **Contrast**, with two levels, **Normal** and **High**. High turns dim text and borders black.
  - The theme chooser (Blurby/Dark/Light/System), the accent swatches and the font picker are hidden in Settings → Theme, and the Theme row is hidden in both Quick-settings contexts.
  - The window title bar matches: white, with black symbols.

  When E-ink is off, everything hidden comes back unchanged. Nothing is reset: the saved theme, accent and font return.
- **Out of scope:**
  - Book text colour and typography (BOOK-TEXT-COLOUR, BOOK-TYPE-SCALE-2).
  - The refresh-interval slider (EINK-VIEW-REFRESH-1 hides it).
  - Focus availability (EINK-MODE-AVAILABILITY-1).
  - A Contrast row in Quick settings. The ruling places contrast in Settings only; adding it to Quick settings would be a new owner design choice.
  - Animation-off and other non-colour E-ink rules in `themes.css` (`:40-48` and later), which stay as they are.
  - Removing the legacy `--fg`, `--text-primary` and `--surface` tokens. They are still read by Focus, Flow and onboarding CSS.
- **Why (investigation, 2026-11-03):**
  - **The beige comes from the inline palette.** ThemeProvider's `eink` map (`src/components/ThemeProvider.tsx:107-133`) is beige: paper `#e8e4d9`, raised `#dedad0`, borders `#b8b4a8`, and red `--danger-muted` at `:122`. ThemeProvider writes every map variable inline on `<html>` (`:191-193`). Inline values beat `src/styles/themes.css:22-38` (`[data-theme="eink"]`, white `--bg`), so that block is dead for every variable the map defines. The reader's foliate surfaces read the root `--bg`/`--text`, so the book page is beige too.
  - **The title bar is a third copy:** `main/window-manager.js:24-25` (`#e8e4d9` / `#b9b6ae`), applied by `updateWindowTheme` (`:198-210`).
  - **The accent leaks into E-ink.** The accent override at `ThemeProvider.tsx:203` exempts only `blurby`, so a saved accent (for example blue) recolours E-ink.
  - **Controls that do nothing in E-ink are still shown.** The theme chooser (`src/components/settings/ThemeSettings.tsx:120-133`) has no effect while E-ink is on (`appliedTheme = einkMode ? "eink" : …`, `ThemeProvider.tsx:190`). Accent and font (`:135-175`) do apply. Quick settings repeats the Theme row at `src/components/QuickSettingsPopover.tsx:195-222` (reader) and `:339-366` (library).
  - **No contrast setting exists.**
  - **The secondary text fails the readability floor.** `--text-dimmer #7a7a7a` on `#e8e4d9` is about 3.6:1, below the 4.5:1 floor BOOK-TEXT-COLOUR set for secondary text.
- **Design (owner rulings recorded; engineering settled):**
  - **Owner ruling 2026-11-03, design batch #7:** the paper is pure white.
  - **Owner ruling 2026-11-03, design batch #8:** contrast has two levels, normal and high.
  - **Owner ruling 2026-11-03, design batch #9:** the font picker is hidden in E-ink, along with the theme chooser.
  - **Stub direction (`ROADMAP.md:1882-1883`):** greyscale with white dominant, no theme chooser in E-ink, contrast as the sole E-ink appearance option, and ordinary themes outside E-ink. The accent swatches are an appearance control, so they are hidden with the theme chooser.
  - **One palette source.** ThemeProvider's map is authoritative. The `themes.css` block keeps its non-map tokens (`--fg`, `--text-primary`, `--surface`, fonts), and its values for map variables are set equal to the map's Normal values. Test (ap9) pins them together, so the block can never drift again. Deleting the CSS duplicates instead would break `tests/einkFoundation.test.ts:75-86`, which pins `--bg #ffffff` and `--accent #000000` there. Mirroring keeps that test green.
  - **The Normal palette.** Every value is R = G = B:

    | Variable | Value |
    |---|---|
    | `--bg`, `--reader-bg` | `#ffffff` |
    | `--bg-raised` | `#f2f2f2` |
    | `--bg-hover`, `--placeholder-bg` | `#e6e6e6` |
    | `--bg-secondary` | `#ebebeb` |
    | `--border` | `#8c8c8c` |
    | `--border-light` | `#cccccc` |
    | `--text` | `#000000` |
    | `--text-dim` | `#333333` |
    | `--text-dimmer` | `#595959` (7.0:1 on white, 6.4:1 on `#f2f2f2`) |
    | `--text-muted` | `#666666` (5.7:1 / 5.2:1) |
    | `--accent` | `#000000` |
    | `--accent-glow` | `rgba(0,0,0,0.2)` |
    | `--accent-faded` | `rgba(0,0,0,0.12)` |
    | `--accent-highlighted` | `rgba(0,0,0,0.3)` |
    | `--danger-muted` | `rgba(0,0,0,0.15)` |
    | `--overlay-light`, `--overlay-medium`, `--overlay-heavy` | unchanged (already neutral) |
    | `--overlay-backdrop` | `rgba(255,255,255,0.92)` |
    | `--overlay-gradient` | `rgba(255,255,255,0.7)` |
    | `--placeholder-banner` | `#999999` |
    | `--placeholder-text` | `#333333` |
    | `--badge-on-color` | `#ffffff` |

  - **High contrast** is an overlay map merged over Normal. It sets `--text-dim`, `--text-dimmer`, `--text-muted`, `--border` and `--border-light` to `#000000`; everything else is as in Normal.
  - **The contrast key is `einkContrast?: "normal" | "high"`.** An absent key means normal. The key is device-local like every other E-ink key (LL-158; EINK-DEVICE-SETTINGS-1), and needs no migration or schema bump.
  - **The accent guard.** E-ink is exempt like Blurby, and the saved accent returns when E-ink is off.
  - **The title bar** is `{ bg: "#ffffff", titleBar: "#ffffff", titleText: "#000000" }` for both contrast levels. A contrast change therefore needs no `updateWindowTheme` call, and `main/ipc/state.js:38` is unchanged.
  - **The saved font in E-ink.** Hiding the font picker does not stop a previously saved font from applying. This follows the existing precedent: the Blurby theme hides the picker (`ThemeSettings.tsx:135`) yet `ThemeProvider.tsx:214-218` still applies the saved font. It also keeps a reader's accessibility font (OpenDyslexic) in E-ink. This is the one point left for Brain1 (see below); the spec is written to the recommendation.
- **Technical question for Blurby.Brain1 (one, non-blocking for the red tests):**
  - **TQ1. Should a saved `fontFamily` still apply while E-ink hides the font picker?**
  - **Recommendation: yes; picker hidden, value kept and applied.** The alternative would add `&& !einkMode` at `ThemeProvider.tsx:214`, so E-ink always uses `themes.css:37`'s Georgia. That would silently drop a reader's chosen accessibility font with no way to restore it in E-ink.
  - Row (ap11) asserts the recommendation. If Brain1 rules the alternative, (ap11) inverts and the one guard is added; nothing else changes.
- **Prerequisites:**
  - The RC integration window merged to `main` (`git merge-base --is-ancestor 70d64237 origin/main` exits 0).
  - EINK-DEVICE-SETTINGS-1 merged. It owns `DEVICE_LOCAL_SETTINGS` and the (n) device-local list in `tests/settingsKeyTrust.test.js`, which this item extends.
  - EINK-MODE-AVAILABILITY-1 merged. It edits `QuickSettingsPopover.tsx:228-262`; this item edits the Theme rows on either side.
  - **Shared core:** this item edits `src/types.ts`. No other sprint touching the shared-core set may be active while it runs (see Merge order).
- **Done when** (PowerShell 7, from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/einkAppearance.test.tsx` alone. On the base, `npx vitest run tests/einkAppearance.test.tsx` exits 1: (ap1)–(ap6), (ap8)-red, (ap9) and (ap10) fail by assertion, and the controls (ap7), (ap8)-control, (ap11) and (ap12) pass. Record the output in the staging memo.
  2. After the change, `npx vitest run tests/einkAppearance.test.tsx tests/einkControls.test.tsx tests/einkFoundation.test.ts tests/ThemeSettings.test.tsx tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts tests/appTabsTheme.test.ts tests/overlayThemeSweep.test.tsx` exits 0.
  3. `npm test` (0 failed), `npm run typecheck` and `npm run build` each exit 0 (standing rule 48).
  4. **Fence:** `git diff --name-status <base>..HEAD -- . ':!docs'` lists exactly:
     - `M src/components/ThemeProvider.tsx`, `M src/styles/themes.css`, `M main/window-manager.js`;
     - `M src/components/settings/ThemeSettings.tsx`, `M src/components/QuickSettingsPopover.tsx`;
     - `M src/types.ts`, `M main/migrations.js`;
     - `M tests/settingsKeyTrust.test.js`, `M tests/settingsKeyTrustKeys.test.ts`, `M tests/einkControls.test.tsx`;
     - `A tests/einkAppearance.test.tsx`.
  5. **Rule 53 package check, live, on a proven scratch profile (LL-165; state read over the inspector, LL-166).** Seed the scratch `settings.json` with `{ "einkMode": true, "theme": "dark", "accentColor": "#2F8FD8", "fontFamily": "Georgia, serif" }`. In the packaged x64 exe:
     - `getComputedStyle(document.documentElement)` gives `--bg` `#ffffff`, `--accent` `#000000` and `--text-dimmer` `#595959`.
     - Settings → Theme has no element with `aria-label="dark theme"`, no `Accent color:` button and no `.font-preset`, and it has `Normal contrast` and `High contrast` buttons.
     - A real CDP click on **High contrast** makes `--text-dimmer` `#000000`, and the scratch `settings.json` then holds `"einkContrast": "high"`.
     - **Detector control (standing rule 55):** the same reads on the base package give `--bg` `#e8e4d9` and `--accent` `#2F8FD8`.
     - **Off control:** turning the E-ink switch off gives `--bg` `#000000` (dark) and `--accent` `#2F8FD8`, and the theme chooser returns.
  6. **Owner-visible check, batched to gate (2)** (owner smoke batched at end). On the arm64 package at merge, E-ink reads as white paper with black text and grey panels, with no colour. High contrast visibly darkens dim text and borders, and turning E-ink off restores the previous theme, accent and font. The package verifier captures one screenshot each of Normal, High and E-ink off into the close-out. This row is evidence for the owner, not a mechanical gate.
- **Effort:** M.
- **Owners:** planner; implementation agent (bounded, renderer-scope plus one main-process line); spec-compliance then quality reviewer; repository operator; package verifier on RodneySr; Brain1 (TQ1, package confirmation); Blurby.Roadmap (merge go); owner at gate (2) for row 6.
- **Source:**
  - `ROADMAP.md:1882-1883` (stub).
  - Owner design batch 2026-11-03 #7–#9 (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md:13-15`).
  - The smoke triage (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md`), E-ink appearance rows.
  - Code at `70d64237`.
- **Path:** dispatch.

##### Implementation detail

- **Edit sites (rc-read @ `70d64237`; re-grep at the cut, standing rule 36):**
  - **`src/components/ThemeProvider.tsx`:**
    - `:3-12` (`ThemeContextType`): add `einkContrast: "normal" | "high";` and `setEinkContrast: (c: "normal" | "high") => void;`. In the default context (`:14-23`), add `einkContrast: "normal", setEinkContrast: () => {},`.
    - `:107-133`: replace the `eink` map's values with the Normal palette above, keeping the same variable set and order.
    - After the `themes` object (`:134`): add `const einkHighContrast: Record<string, string> = { "--text-dim": "#000000", "--text-dimmer": "#000000", "--text-muted": "#000000", "--border": "#000000", "--border-light": "#000000" }; // EINK-APPEARANCE-2: owner ruling 2026-11-03 #8`.
    - `:160`: add `const [einkContrast, setEinkContrast] = useState<"normal" | "high">("normal");`.
    - `:171` (`getState` load): add `setEinkContrast(state.settings.einkContrast === "high" ? "high" : "normal");`.
    - `:191`: `const vars = appliedTheme === "eink" && einkContrast === "high" ? { ...themes.eink, ...einkHighContrast } : (themes[appliedTheme] || themes.blurby);`. Every High key is also a Normal key, so switching back to Normal rewrites it.
    - `:203`: `if (accentColor && appliedTheme !== "blurby" && appliedTheme !== "eink") {`, with the comment "blocked for blurby (brand palette) and eink (greyscale, EINK-APPEARANCE-2)".
    - `:214-218` (font): unchanged (TQ1 recommendation).
    - `:219` deps: add `einkContrast`. `:222` provider value: add `einkContrast, setEinkContrast`.
  - **`src/styles/themes.css:22-38`:** set `--text-dim: #333333; --text-dimmer: #595959; --text-muted: #666666; --border: #8c8c8c;`. `--bg`, `--accent` and `--reader-bg` already equal the Normal values. Every other line is unchanged. Change the comment at `:23` to "Mirrors ThemeProvider's eink map (the inline source); (ap9) keeps them equal".
  - **`main/window-manager.js:24-25`:** `case "eink": return { bg: "#ffffff", titleBar: "#ffffff", titleText: "#000000" };`.
  - **`src/components/settings/ThemeSettings.tsx`:**
    - `:29`: also destructure `setEinkContrast`.
    - `:33-39`: add `if (updates.einkContrast !== undefined) setEinkContrast(updates.einkContrast);`.
    - After the refresh slider (`:116`, still inside the E-ink fragment that closes at `:117`), add a "Contrast" block:
      - `<div className="settings-section-label">Contrast</div>`;
      - a `settings-mode-toggle` with two `settings-mode-btn` buttons, values `"normal"` and `"high"`, labels "Normal" and "High";
      - each button has `aria-pressed={(settings.einkContrast ?? "normal") === v}`, `aria-label={\`${label} contrast\`}` and `onClick={() => handleSettingsChange({ einkContrast: v })}`.

      Reuse existing classes only; no new CSS.
    - `:120-175`: wrap the Theme label, the chooser and the accent/font fragment in `{!settings.einkMode && ( <> … </> )}`. The inner `settings.theme !== "blurby"` condition stays.
  - **`src/components/QuickSettingsPopover.tsx`:** wrap the reader Theme row (`:195-222`) and the library Theme row (`:339-366`) each in `{settings.einkMode !== true && ( … )}`. The prop type's index signature (`:14`) already admits `einkMode`; both callers pass the full settings (`src/components/LibraryContainer.tsx:626`, `:763`).
  - **`src/types.ts`:** after `einkPhraseGrouping: boolean;` (`:178`), add `einkContrast?: "normal" | "high"; // EINK-APPEARANCE-2: absent = normal; device-local`.
  - **`main/migrations.js`:**
    - In `SETTINGS_DEFAULTS`' "Absent until set" list (`:331-339`), add `einkContrast: undefined`.
    - Add `"einkContrast"` to `DEVICE_LOCAL_SETTINGS` (`:347`, as EINK-DEVICE-SETTINGS-1 extended it).
  - **Tests to update (named pinned tests, standing rule 50):**
    - `tests/settingsKeyTrustKeys.test.ts:18`: add `einkContrast: true` to `TYPE_KEYS`. The compiler forces this. `PRE_ITEM_MAIN_DEFAULTS` is unchanged, because an undefined default is dropped by JSON, so (t4) stays byte-identical.
    - `tests/settingsKeyTrust.test.js`:
      - `UI_WRITES` (`:124-135`): add `einkContrast: "high"`.
      - (m)'s count (`:330`): raise it by 1 from its value at the cut (38 at `70d64237`).
      - EINK-DEVICE-SETTINGS-1's (n) `DEVICE_LOCAL` list: add `"einkContrast"`.
    - `tests/einkControls.test.tsx:106`: (e1) expects `"#e8e4d9"`, which encodes the beige that owner ruling #7 replaces. Change it to `"#ffffff"`. (e6) is unchanged (the dark-plus-E-ink and plain-E-ink title bars stay equal).
- **New tests:** `tests/einkAppearance.test.tsx`, jsdom. ThemeProvider uses the `renderProvider` pattern of `tests/einkControls.test.tsx`; the title bar uses its `loadWindowManager` electron mock (`:80-99`); the provider rows use a variant of its `renderProvider` (`:39`) whose mocked `getState` also carries `accentColor`, `fontFamily` and `einkContrast`.
  - **(ap1)** `{ theme: "dark", einkMode: true }` gives root `--bg` and `--reader-bg` equal to `#ffffff`. *Red.*
  - **(ap2)** Every variable ThemeProvider sets in E-ink is neutral. Parse each hex as R = G = B and each `rgba(r,g,b,a)` as r = g = b. *Red (beige, red `--danger-muted`).*
  - **(ap3)** WCAG contrast is at least 4.5:1, computed in the test from relative luminance, for `--text-dim`, `--text-dimmer` and `--text-muted` against both `--bg` and `--bg-raised`, at Normal and at High. *Red (`#7a7a7a` on `#e8e4d9`).*
  - **(ap4)** With `accentColor: "#2F8FD8"` and `einkMode: true`, `--accent` is `#000000` and `--accent-glow` contains no `47,143,216`. *Red.*
  - **(ap5)** With `einkContrast: "high"`, `--text-dimmer`, `--text-muted` and `--border` are `#000000`. Re-rendering with `"normal"` restores `--text-dimmer` `#595959`. *Red.*
  - **(ap6)** `ThemeSettings` with `einkMode: true` has no `[aria-label$=" theme"]` button, no `[aria-label^="Accent color"]` and no `.font-preset`. It has the `Normal contrast` and `High contrast` buttons, with Normal `aria-pressed="true"`. Clicking High calls `onSettingsChange({ einkContrast: "high" })`. *Red.*
  - **(ap7) control:** `ThemeSettings` with `einkMode: false, theme: "dark"` shows the chooser, the accent swatches and `.font-preset`, and no contrast buttons. Passes on base.
  - **(ap8)** `QuickSettingsPopover` in `"library"` and `"reader"` contexts:
    - with `{ theme: "dark", einkMode: true }`, there is no `#qs-theme-label` or `#qs-lib-theme-label` (*red*);
    - control: with `einkMode` absent, the labels are present (passes).
  - **(ap9)** For every variable that both the `[data-theme="eink"]` block of `themes.css` (use `extractCssBlock` as in `tests/einkFoundation.test.ts`) and the ThemeProvider `eink` map define, the values are equal, compared case-insensitively. *Red (`--text-dim` `#000000` vs `#4a4a4a`).*
  - **(ap10)** `getThemeColors({ theme: "dark", einkMode: true })` deep-equals `{ bg: "#ffffff", titleBar: "#ffffff", titleText: "#000000" }`. *Red.*
  - **(ap11) control (TQ1):** with `einkMode: true, fontFamily: "Georgia, serif"`, root `--reader-font` is `Georgia, serif`. Passes on base.
  - **(ap12) control:** after rendering `einkMode: true` then `false` with `accentColor: "#2F8FD8"` and theme dark, `--accent` is `#2F8FD8`. Passes on base.
- **Constants:** none. The palette lives in ThemeProvider's theme maps, as every theme's does (CSS-variable theming exemption).
- **Branch:** `eb/eink-appearance-2` from `origin/main` after the prerequisites. Push with `git push origin HEAD:refs/heads/eb/eink-appearance-2` (LL-181).
- **Staging plan (explicit paths; `git status --porcelain` checked before each commit, LL-172):**
  - Red commit: `tests/einkAppearance.test.tsx`.
  - Change commit: the ten fence paths of Done-when 4.
  - Close-out: `docs/governance/close-outs/CloseOut.EINK-APPEARANCE-2.<date>.md`.
- **Failure handling:**
  - **A contrast row (ap3) fails at a planned value.** Darken that value in steps of `#0d0d0d` until it passes, and record it in the close-out. Never lighten the floor.
  - **(e1) or an `einkFoundation` row fails for a reason other than the planned `#ffffff`.** STOP and return to Brain1; do not edit those tests further.
  - **`settingsKeyTrust` (m)'s count does not match the cut + 1.** Re-grep `UI_WRITES` for a concurrent change before editing. STOP if another item changed it in the same window.
  - **The package shows beige anywhere.** That means an inline or CSS copy was missed; grep `e8e4d9|dedad0|d4d0c6|b8b4a8` across `src` and `main`. At most two repair passes.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\eink-appearance-2` (`git -C C:/Users/estra/Projects/Blurby worktree add -b eb/eink-appearance-2 .worktrees/eink-appearance-2 origin/main`). The build and suite run there.
- **Package verification:** standing rule 53 with the RodneySr placement.
  - Build `--dir --x64` and `--dir --arm64` from the final commit with `origin/main` merged.
  - Run the 25 s x64 scratch launch with LL-165 profile proof and the live-profile hash check.
  - `npx asar list` must show the changed `main/window-manager.js` and `main/migrations.js` and the rebuilt renderer bundle.
  - Re-run Done-when 5 on the package.
  - The arm64 native launch (25 s, no error or crash) and row 6 run on Rodney at merge.
  - Brain1 confirms before the merge go.
- **Lane ownership:** UX polish; execution surfaces C (theme surfaces) and D (two main-process lines).
- **Forbidden during parallel run:** `src/components/ReaderContainer.tsx`, `src/reader/**`, `src/hooks/**`, `src/components/ReaderBottomBar.tsx`, `src/components/settings/SpeedReadingSettings.tsx`, `main/ipc/**`, `preload.js`.
- **Shared-core touches:** `src/types.ts` (one optional key).
- **Merge order:**
  - After EINK-DEVICE-SETTINGS-1 and EINK-MODE-AVAILABILITY-1.
  - **Proposed reorder, not applied here:** this means EINK-APPEARANCE-2 (Seq 126) runs after EINK-MODE-AVAILABILITY-1 (Seq 127). The roadmap review applies that, under Brain1.
  - Before EINK-VIEW-REFRESH-1, which edits `ThemeSettings.tsx:103-116` beside this item's contrast block.
  - The other `src/types.ts` editors are LIBRARY-WRITE-RACE-3 (89), FURTHEST-PERSIST-1 (114) and NARRATE-BAND-SPACE-1 (141). NARRATE-BAND-SPACE-1 also edits `tests/settingsKeyTrustKeys.test.ts` (`DEPRECATED_TYPE_KEYS`, `flowZoneLines`).
  - Under Brain1's 2026-11-03 serialization ruling, items run one at a time in Seq order on RodneySr. Whichever lands second rebases; the additions are append-only.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red appearance tests show beige, colour leaks, failing contrast, no contrast control and visible theme controls in E-ink; controls green | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | White greyscale E-ink palette as one source, High overlay, accent guard and white title bar | calculable | ui-fix | bounded | medium | 20m | — | — |
| 3 | Contrast key end to end (type, defaults, device-local, key-trust rows) and the hidden theme/accent/font controls | calculable | settings-key | bounded | medium | 20m | — | — |
| 4 | Named suites, full suite, typecheck, build and exact fence | calculable | verify | mechanical | low | 12m | — | — |
| 5 | Both reviews, rule 53 package with the live CDP rows, base detector, off control and the three screenshots | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 68m · sum 68m. Rows 1 and 5 are calibrated from the kind medians; rows 2–4 are this author's estimates (a palette rewrite with one overlay; a five-site key addition with three test edits; one suite plus gates).

##### Lessons applied

- **Standing rule 36:** every line is cited at `70d64237` and re-grepped at the cut. Prerequisite merges shift `migrations.js`, `QuickSettingsPopover.tsx` and `settingsKeyTrust.test.js`.
- **Standing rule 43 (LL-138):** red first, with controls (ap7), (ap8)-control, (ap11) and (ap12).
- **Standing rule 44 (LL-143):** dry-run receipts are owed before dispatch.
- **Standing rule 45 (LL-141):** colours, contrast levels and hidden controls are the owner's (batch #7–#9). Storage, palette source and wiring are engineering. The one open technical point (TQ1) goes to Brain1.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **Standing rule 50 (LL-156):** the pinned `(e1)` beige expectation and the key-trust counts are named and amended by intent, not silently.
- **Standing rule 53 (LL-167) and LL-165:** package check on a proven scratch profile, and the arm64 launch at merge. Inline-versus-CSS precedence is exactly what isolated tests can miss.
- **Standing rule 55 (LL-151/LL-166):** the base package must show beige and blue under the same reads before the fixed package's white counts.
- **LL-120:** no mode file is touched. The modes already read the root variables.
- **LL-158:** the new persisted key gets a sync row and a device-local row.
- **LL-172, LL-181:** explicit staging, worktree placement and the push refspec.
- **Not applicable:** the Narrate/word-index lessons (LL-142, 160–162, 170, 173), registry/Notion (LL-154, 155, 163, 171), quit/flush (LL-157, 159) and evidence encoding (LL-175–180).
