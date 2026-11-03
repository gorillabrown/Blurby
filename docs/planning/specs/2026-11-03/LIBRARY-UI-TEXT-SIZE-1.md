#### LIBRARY-UI-TEXT-SIZE-1 — Library, side-menu and dialog text is 2 px larger, never below 12 px *(Seq 132; Full Spec 2026-11-03, cited against RC tip `70d64237`; owner ruling 2026-11-03, design batch #2–4; UX polish; proposed P2)*

- **What:**
  - Every interface text size below 16 px in the library, the side menu (menu flap) and the library's dialogs grows by 2 px, with a 12 px minimum. That gives 8/9/10 → 12, 11 → 13, 12 → 14, 13 → 15, 14 → 16 and 15 → 17 px. Sizes of 16 px and above are unchanged.
  - The folder banner becomes 13 px, and its Retry button 12 px.
  - The size is fixed. It is built on one CSS custom property, `--ui-text-boost` (2px in scope, 0px elsewhere), so a later setting or key only changes that one value.
- **Out of scope:**
  - Reader chrome: top bar, bottom bar (ReaderBottomBar), chapter list and the reader's popovers. Also book text, Focus/Flow text size (`focusTextSize`, `flowTextSize`) and book typography (BOOK-TYPE-SCALE-2).
  - The keyboard overlays shared by library and reader: command palette, shortcuts, highlights and quick settings. They render outside the library container and keep their sizes. A later item can opt them in by adding one selector to the scope rule.
  - First-run onboarding and the extension pairing banner.
  - An adjustable size or a setting, and BUG-213 (Ctrl+= / Ctrl+− / Ctrl+0 in the library). The owner ruled "fixed" (#3), so BUG-213's open question stays open and unchanged.
  - E-ink appearance (EINK-APPEARANCE-2 owns `themes.css`). E-ink inherits this scale unchanged.
  - Any TSX change. The scope is set entirely in CSS.
- **Why (investigation at `70d64237`):**
  - Every interface size is a hard-coded px value. There is no type-scale token or interface-scale setting; `:root` (`src/styles/base.css:2-43`) holds colours, radii, shadows and transitions only.
  - The owner's screenshot case is the folder banner: 11 px monospace (`base.css:388-399`), with a 10 px Retry button (`.update-banner-restart-btn`, `library.css:1858-1861`).
  - Census of px `font-size` declarations below 16 px, by file:

    | File | Below 16 px | Note |
    |---|---|---|
    | `base.css` | 20 | |
    | `library.css` | 95 | including the responsive block at `:1424`, `:1427` |
    | `app-tabs.css` | 4 | |
    | `keyboard.css` | 19 | |
    | `reading-goals.css` | 4 | |
    | `onboarding.css` | 10 | in-scope `.bug-report-*` (`:231`, `:244`, `:264`) and `.metadata-wizard-*` (`:341`, `:348`, `:379`, `:395`, `:410`, `:423`, `:439`) |

    That is 152 in the rewrite set. `reader.css` (27), `flow.css` (5), `page-reader.css` (26) and `themes.css` (2) style reader surfaces and are not in the set.
  - Several rewritten selectors are shared with the reader (`.btn`, `.btn-fill`, `.badge`, `.toast`, `.esc-confirm`), and `library.css` also holds the flap's Settings pages (`settings-*`, `cloud-*`, `hotkey-*`, `queue-*`). A per-file rewrite therefore cannot by itself set the reach. The reach has to come from where the text sits in the DOM.
  - The DOM roots of the owner's scope:
    - `.library-container` (`LibraryView.tsx:422`) holds the header, the tab bar with its filter menu, search, cards and list rows, stats, the goal widget, the toast (`:451`), the folder banner (`:468`) and the add/edit panel (`:657`).
    - The menu flap is portalled to `document.body` (`MenuFlap.tsx:126-137`, `.menu-flap`). It holds the reading queue and every Settings page (`MenuFlap.tsx:11-21`), and it is also used by the reader (`ReaderContainer.tsx:727`).
    - The dialogs render as siblings of the library, outside `.library-container`:
      - `.import-confirm-overlay` (`ImportConfirmDialog.tsx:19`);
      - `.metadata-wizard-backdrop` (`MetadataWizard.tsx:123`);
      - `.bug-report-overlay` (`BugReportModal.tsx:93`).
    - The library-only overlays and badges also render outside it (`LibraryContainer.tsx:729`, `:768-786`, `:788`):
      - `.snooze-picker-overlay` (`SnoozePickerOverlay.tsx:131`);
      - `.tag-picker-overlay` (`TagPickerOverlay.tsx:114`);
      - `.goto-indicator` (`GoToIndicator.tsx:51`);
      - `.filter-pill`;
      - `.offline-badge`.
  - No test pins a library font size. The CSS-reading tests (`appTabsTheme`, `componentStyleCleanup`, `helpSurfaces`, `overlayThemeSweep`, `readerModeBoundaries`) assert borders, weights and selectors only.
- **Design (owner ruling 2026-11-03, design batch #2, #3 and #4; settled):**
  - **#2, how much larger:** +2 px for any text below 16 px, with a 12 px minimum.
  - **#3, fixed or adjustable:** fixed, built on one scale value that could later become a setting.
  - **#4, how far it reaches:** the library, plus the side menu and its dialogs. Applied as the roots listed above. The bug report and metadata wizard dialogs keep the larger size even when opened from the reader, because they are the same dialogs.
  - **Mechanism (engineering; TQ1 approved by Blurby.Brain1 2026-11-03, with two conditions below):**
    - `:root` gains `--ui-text-boost: 0px; --ui-text-min: 0px;`.
    - One scope rule sets `--ui-text-boost: 2px; --ui-text-min: 12px;` on the ten roots above.
    - Every px declaration below 16 px in the rewrite set becomes `font-size: max(var(--ui-text-min, 0px), calc(<N>px + var(--ui-text-boost, 0px)));`.
    - **Condition 1 (Blurby.Brain1): every `var()` carries the `0px` fallback, as written above.** Menus, tooltips and dialogs that render through a portal into `document.body` sit outside every scope root. With the fallbacks, anything outside a scope computes exactly as it does today. The memo lists each portaled surface and whether it is meant to be in scope. If it is, the tokens are set on its portal container.
    - **Condition 2 (Blurby.Brain1): rewrite px declarations only.** Declarations in `em`, `rem` or `%` stay unchanged and are listed in the memo. Any of them that computes below 12 px is reported, not converted.
    - Custom properties inherit, so the new size applies only under a scope root. Outside one, the same declaration computes to `max(0px, <N>px)`, which is unchanged. Shared selectors therefore need no splitting, the reader is untouched, and the boost is the single value a later setting would change.
    - CSS custom properties are exempt from the constants-file rule, and no inline style is used.
  - Elements sized in `em` under a scope root (`.settings-note--kokoro` `0.85em`, `library.css:1935`) follow their scaled parent; the packaged diff's ±0.5 px tolerance covers them.
- **Prerequisites:**
  - RC integration window merged to `main` (cut from that merge).
  - FOLDER-RETRY-FEEDBACK-1 (Seq 131) merged, so its new status line, which inherits `.update-banner`, is covered.
- **Done when** (PowerShell 7, from the worktree root):
  1. **Red first (standing rule 43).** Commit `tests/libraryUiTextSize.test.ts` alone. On the base, `npx vitest run tests/libraryUiTextSize.test.ts` exits 1: (ts1)–(ts3) fail and (ts4)–(ts5) pass. Record the output.
  2. `npx vitest run tests/libraryUiTextSize.test.ts` exits 0 after the change.
  3. `npm test`, `npm run typecheck` and `npm run build` exit 0 (standing rule 48).
  4. **Packaged size diff (rule 53 package; standing rule 55).**
     - **Probe:** a CDP probe on the packaged x64 exe and on the base package (`origin/main` at the cut). Both run on the same proven scratch profile (LL-165), seeded with three owned books and a `sourceFolder` at an owned missing path (`C:\blurby-scratch\missing-folder`), with the window at 1000×720.
     - **States S1–S9:**
       - (S1) library grid with the folder banner and the stats panel open (`LibraryView.tsx:526`);
       - (S2) list view (`:512`);
       - (S3) the filter menu open;
       - (S4) the add/edit panel open;
       - (S5) the menu flap on Reading Queue, then each Settings page in `MenuFlap.tsx:11-21`, plus "Startup & Backup" if LIBRARY-FOOTER-REMOVE-1 has landed;
       - (S6) metadata wizard (Ctrl+Shift+M);
       - (S7) bug report (Ctrl+Shift+B);
       - (S8) import confirm (`Set-Clipboard "https://example.com/a"`, then Alt+V);
       - (S9) snooze picker (H) and tag picker (L) on a focused card.
     - **Recording:** in each state, for every rendered element under a scope root that has a direct non-blank text node, record its key (class path plus first 30 characters of text) and `getComputedStyle().fontSize`.
     - **Rule** for every key present in both packages:
       - a base size below 16 px must become `max(12, base + 2)` ±0.5 px;
       - a base size of 16 px or more must be unchanged.
     - **Control states (unchanged ±0; Blurby.Brain1's negative control for "the reader is untouched"):**
       - (R1) a book open in Page mode, covering the top bar, the bottom bar **and the reading surface's own text** (the foliate view's body text and the reader overlays). It shows zero computed-size change;
       - (R2) the command palette (Ctrl+K) over the library.
     - **Pass:** zero violations, and the banner text at 13 px with Retry at 12 px.
     - **Detector control:** the probe run base-against-base reports zero violations. The same run with one in-scope element's size changed by 1 px through CDP reports exactly that element.
  5. **Packaged clipping diff.**
     - **Setup:** in S1, S2, S5 (Settings and Library Layout) and S7, at 1000×720 and at the 600×500 minimum (`main/constants.js:192-195`), each at `deviceScaleFactor` 1, 1.25 and 1.5, which is 100 %, 125 % and 150 % Windows display scaling (`Emulation.setDeviceMetricsOverride`; Blurby.Brain1 TQ2 addition).
     - **Clipped element:** an in-scope text element is clipped when its computed `overflow` is not `visible` and `scrollWidth > clientWidth + 1` or `scrollHeight > clientHeight + 1`. Elements with `text-overflow: ellipsis` or `-webkit-line-clamp` are excluded; they truncate by design.
     - **Pass:** every element clipped on the new package is also clipped on the base.
     - **Detector control:** on the base, a probe-injected `div` of 10 px height with `overflow: hidden` and 14 px text inside `.library-container` is reported.
  6. **Owner-visible check, batched to gate (2)** (memory: owner smoke batched at end). The arm64 package at merge shows the library with the folder banner, and the Settings page, at 100% and 150% display scaling. The close-out captures before/after screenshots of each. This is evidence for the owner, not a mechanical gate.
- **Effort:** M (one wave: a mechanical rewrite of 152 declarations plus a two-package probe).
- **Owners:** planner; Brain1 (TQ1 and TQ2 ruled 2026-11-03; package confirmation); implementation agent (bounded, renderer-scope); spec-compliance then quality reviewer; repository operator; package verifier on RodneySr; owner at gate (2) for row 6.
- **Source:** SMOKE-R13 (`docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:58`, `:214-222`); ROADMAP.md stub (`:1896-1897` on the planning branch at `9932b8ed`); owner design batch (`docs/planning/roadmap-reviews/2026-11-03-owner-design-batch.md`, #2–4); code at `70d64237`.
- **Path:** dispatch.

##### Blurby.Brain1 rulings (2026-11-03, `C:\Projects\Blurby-artifactsrain1-rulings\Brain1.held-items-TQ.2026-11-03.md`)

- **TQ1 (mechanism): approved.** Scoped additive custom properties, with two conditions: a `0px` fallback in every `var()`, and px-only rewrites. Both are written into Design above.
- **TQ2 (gate): sufficient, with two additions.**
  - The reading-surface zero-change control, row (R1).
  - The clipping diff at 100 %, 125 % and 150 % scaling.

  Both are written into Done-when 4–5. The owner's before/after screenshots stay a gate (2) check.

##### Implementation detail

- **Edit sites (re-census at the cut; counts are at `70d64237`):**
  - `src/styles/base.css`:
    - In `:root`, before its closing brace at `:43`, add `--ui-text-boost: 0px;` and `--ui-text-min: 0px;`, with the comment "library interface text scale (LIBRARY-UI-TEXT-SIZE-1); set on the scope roots below".
    - After the Base Reset block (`:45-53`), add the section "Interface text scale". It holds the single rule `.library-container, .menu-flap, .import-confirm-overlay, .metadata-wizard-backdrop, .bug-report-overlay, .snooze-picker-overlay, .tag-picker-overlay, .goto-indicator, .filter-pill, .offline-badge { --ui-text-boost: 2px; --ui-text-min: 12px; }`, with the comment "owner ruling 2026-11-03 #2–4: +2 px below 16 px, 12 px minimum; the boost is the one value a later setting changes".
    - Rewrite its 20 px declarations below 16 px.
  - `src/styles/library.css` (95), `src/styles/app-tabs.css` (4), `src/styles/keyboard.css` (19) and `src/styles/reading-goals.css` (4): rewrite every px `font-size` below 16 px, including those inside `@media` blocks.
  - `src/styles/onboarding.css`: rewrite only the 10 declarations in `.bug-report-*` and `.metadata-wizard-*` blocks (lines listed under Why). `.onboarding-*`, `.ext-pairing-*` and `.pairing-banner*` are untouched.
  - The rewrite rule is the same everywhere: `font-size: <N>px;` (N < 16) becomes `font-size: max(var(--ui-text-min), calc(<N>px + var(--ui-text-boost)));`. The implementer may apply it with a one-off regex over the listed files and blocks. The script is not committed. Every other property, and every declaration of 16 px or more, `em` or `rem`, is left byte-identical.
  - **Fallback edit, only if Done-when 4 flags an in-scope element:** an element under a scope root may take its size from a file outside the set (for example `page-reader.css`). Rewrite that one declaration the same way, which leaves it unchanged outside scope, and list it in the close-out.
  - **Fallback edit, only if Done-when 5 flags new clipping:** change that element's fixed `height`/`max-height`/`line-height` in px to `calc(<old>px + var(--ui-text-boost))`, which also leaves it unchanged outside scope. List it in the close-out.
  - No TSX, `main/`, `preload.js` or `src/types.ts` change.
- **Tests:** new `tests/libraryUiTextSize.test.ts` (node environment; reads CSS with `fs.readFileSync` relative to the repo root, as `tests/appTabsTheme.test.ts` does).
  - **(ts1)** In `base.css`, `library.css`, `app-tabs.css`, `keyboard.css` and `reading-goals.css`, and in `onboarding.css` blocks whose selector starts with `.bug-report` or `.metadata-wizard`, no declaration matches `/font-size:\s*(\d+(?:\.\d+)?)px\s*;/` with a value below 16. *Fails on the base: 152 matches.*
  - **(ts2)** Sample selectors carry the formula with their original N:
    - `.update-banner` 11 (`base.css`);
    - `.update-banner-restart-btn` 10, `.settings-menu-item` 12 (`:1154`) and `.queue-section-label` 9 (`:1044`) (`library.css`);
    - `.app-tab` 12 (`app-tabs.css`);
    - `.badge` 10 (`base.css`);
    - `.bug-report-state` 10 and `.metadata-wizard-input` 12 (`onboarding.css`);
    - `.reading-goals-empty` 11 (`reading-goals.css`).

    Each block contains `max(var(--ui-text-min), calc(<N>px + var(--ui-text-boost)))`. *Fails on the base.*
  - **(ts3)** `base.css`'s `:root` block contains `--ui-text-boost: 0px` and `--ui-text-min: 0px`. Exactly one rule sets `--ui-text-boost: 2px` and `--ui-text-min: 12px`, and its selector list is exactly the ten scope roots. *Fails on the base.*
  - **(ts4) control:** `reader.css`, `flow.css`, `page-reader.css` and `themes.css` contain no `--ui-text-`. Passes on both, and guards the reader exclusion.
  - **(ts5) control:** sample declarations of 16 px or more are unchanged: `.add-edit-title` 17px and `.doc-card-title` 20px (`base.css`), `.doc-grid-monogram` 48px (`keyboard.css`), `.metadata-wizard-title` 16px (`onboarding.css`). Passes on both.
- **Constants:** `--ui-text-boost` and `--ui-text-min` in `base.css` (CSS custom properties; exempt from the constants file).
- **Branch:** `eb/library-ui-text-size-1` from `main` after the RC merge and FOLDER-RETRY-FEEDBACK-1; push `git push origin HEAD:refs/heads/eb/library-ui-text-size-1`.
- **Staging plan (explicit paths):**
  - Code: `src/styles/base.css`, `src/styles/library.css`, `src/styles/app-tabs.css`, `src/styles/keyboard.css`, `src/styles/reading-goals.css`, `src/styles/onboarding.css`, and any fallback-edit file named in the close-out; `tests/libraryUiTextSize.test.ts`.
  - At close-out: `docs/governance/close-outs/CloseOut.LIBRARY-UI-TEXT-SIZE-1.<date>.md`, with the probe JSON for rows 4–5 and the row 6 screenshots under its evidence folder.
- **Failure handling:**
  - If (ts4) or a control state (R1, R2) changes, STOP. Something leaked outside scope; do not widen the scope rule.
  - If Done-when 5 still shows new clipping after the fallback edit, STOP and return to Brain1 with the element list and screenshots.
  - If an existing test fails on a CSS assertion, STOP; never change its expectation.
  - At most two repair passes.
  - Rollback: `git revert -m 1 <merge>`.
- **Execution host:** RodneySr, clone `C:\Users\estra\Projects\Blurby`, worktree `.worktrees\library-ui-text-size-1` (rewrite, suite, build, both packages and the probe). The arm64 native launch and row 6 are on Rodney at merge (standing rule 53).
- **Package verification:** standing rule 53 with the RodneySr placement.
  - Build `--dir --x64` and `--dir --arm64` from the final commit with `origin/main` merged, and the base `--dir --x64` from `origin/main` for rows 4–5.
  - Run the 25 s x64 scratch launch with LL-165 profile proof and the live-profile hash check.
  - In `npx asar list`, only the renderer CSS bundle may change.
  - Re-run Done-when 4–5 on the packages.
  - Brain1 confirms before the merge go.
- **Lane ownership:** UX polish; execution surface C (UI surfaces).
- **Forbidden during parallel run:** `src/components/`, `src/hooks/`, `main/`, `main.js`, `preload.js`, `src/types.ts`, `src/styles/reader.css`, `src/styles/flow.css`, `src/styles/page-reader.css`, `src/styles/themes.css`.
- **Shared-core touches:** none.
- **Merge order:**
  - After FOLDER-RETRY-FEEDBACK-1 (Seq 131).
  - In Seq order before LIBRARY-FOOTER-REMOVE-1 (Seq 136), which deletes rules in `library.css` and `base.css:422-427` and adds no CSS. Whichever lands second rebases and re-greps. If the footer item lands first, re-take the census; (ts1)–(ts3) do not pin counts.
  - Any later item that adds a sub-16 px `font-size` to the rewrite set fails (ts1) and must use the formula.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red source-scan rows show raw sub-16 px sizes and no scale properties on the base, with reader and large-size controls green | repeat | positive-control | bounded | low | 4m (median of 20 runs) | — | — |
| 2 | Scale properties, ten-root scope rule and the mechanical rewrite of 152 declarations | calculable | ui-fix | bounded | medium | 25m | — | — |
| 3 | Suite, typecheck, build and the exact file fence | calculable | verify | mechanical | low | 12m | — | — |
| 4 | Both reviews, rule 53 package pair plus base package, computed-size and clipping probes with detector controls, screenshots | calculable | packaging-verify | bounded | medium | 45m | 90m | — |

**Total:** chain 86m · sum 86m. Row 1 is calibrated from the kind median; rows 2–4 are planner estimates (a regex rewrite over six files with a scan; one suite plus gates; a two-package, nine-state CDP probe at four viewport/scale points).

##### Lessons applied

- **Standing rule 43 (was LL-138):** (ts1)–(ts3) are red first; (ts4)–(ts5) are controls.
- **Standing rule 48 (LL-149):** typecheck and build are in Done-when 3.
- **LL-150 (selector census):** the census above, by file and by scope root, is why the reach is set by DOM position rather than by file. Shared selectors (`.btn`, `.toast`, `.badge`) are proven unchanged outside scope by (R1)–(R2).
- **Standing rule 53 (was LL-167) and LL-165:** package pair on a proven scratch profile with an owned missing folder; the arm64 launch at merge.
- **Standing rule 55 (LL-151/LL-166):** both probes are shown to flag a planted defect, and the size probe reports zero on base-against-base, before their results count.
- **LL-181:** worktree placement and the push refspec.
- **Not applicable:** the remaining live lessons (Narrate/word-index LL-142, 160–162, 170, 173; registry/Notion LL-154, 155, 163, 171, 172; quit/flush LL-157, 159; evidence encoding LL-175–180) were read and do not apply.
