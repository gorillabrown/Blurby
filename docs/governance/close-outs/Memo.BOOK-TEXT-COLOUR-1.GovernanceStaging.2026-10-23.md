# Dispatch Close-Out Governance Staging — BOOK-TEXT-COLOUR-1

This is a release fix for BUG-208 (Seq 6.3).
- **Branch:** `eb/book-text-colour-1`, from `refs/remotes/origin/main` @ `67678dbb`.
- **Merge:** on Blurby.Roadmap's go. The freeze admits the release fix.
- **Rule choice:** the general rule, by owner decision on 2026-10-23 (via Blurby.Brain).
- **Shared core:** none.
- **Stacked on this branch:** BOOK-TYPE-SCALE-1.

## Evidence

- **Re-grep:** the four `src/reader/modes/*/helpers/foliateStyles.ts` files are identical through the theme block. The `html, body` rule is at `:39-47` and `a { color: ${accent} !important; }` at `:54`.
  - The only other `color` the injected styles set is `.page-word--chunk-active { color: ${fg}; }`, the same value the new rule passes down.
  - No script sets an inline colour on book words: `git grep "style.color|setProperty(\"color\""` under `src/reader/modes` matches only host `cssText` positioning.
- **Done-when 2 (positive control):** `tests/readerModes/bookTextColour.test.ts` was committed alone as `ab6ad963` and exited 1 on the base. All 4 modes failed with `<mode> injects no inherit rule for book descendants`.
  - The test pins three things in each mode's injected style: the rule is present, it comes after `html, body`, and the `a` accent rule is kept.
  - jsdom resolves neither `initial` nor `inherit` to a colour: a probe returned `initial`. So the contrast itself is measured in the packaged app, in Done-when 1.
- **The change** (`6786b997`): `body *:not(a) { color: inherit !important; }` goes after the `html, body` rule in all four modes, with a comment. Each mode's helper changes in its own runtime, and no shared import is added.
- **Done-when 1** is Blurby.Brain's acceptance test.
  - **Setup:** packaged `--dir` builds, scratch profiles, and the bundled *Meditations*. The test reads the computed colours inside the foliate iframe on the `#pg-header` page, under light, dark, blurby and system, each with E-ink off and on.
  - **What is measured:** the worst-contrast text element in the header, excluding links; body text; and a `<span>` placed inside an `<a>`.
  - **Script:** `C:\Projects\Blurby-artifacts\book-text-colour-1\contrast.mjs`. The results are in `contrast-base3.json` and `contrast-fix2.json`.

  | Theme (E-ink off / on) | Base `47ae6e1f`: book text in the header | Fix `6786b997`: book text in the header |
  |---|---|---|
  | light | rgb(26,26,26) on rgb(245,243,239), **15.7:1** | 15.7:1 |
  | dark | rgb(0,0,0) on rgb(15,15,15), **1.1:1** (fail) | rgb(232,228,222), **15.14:1** |
  | blurby | rgb(0,0,0) on rgb(26,42,74), **1.47:1** (fail) | rgb(255,255,255), **14.25:1** |
  | system (resolved to dark on this machine) | 1.1:1 (fail) | 15.14:1 |

  - **Totals:** the base passes 2 of 8 (red, as required) and the fix passes 8 of 8. Body text is 14.25 to 15.7:1 in every case.
  - **Brain's extra check:** a `<span>` inside an `<a>` computes to the link's accent in all 16 cases, never to the body text colour.
  - **Instrument correction:** the first version of the script sampled the header's first leaf, a heading span that was already white. It passed on the base, so it was blind. A probe of the subtree showed that the black text is the licence `div` and its word spans. The measure now takes the worst text element.
- **Finding for Blurby.Roadmap, out of scope here:** in the light theme, the link accent `rgb(139,111,71)` (`#8B6F47`) on `rgb(245,243,239)` measures **4.25:1**, below 4.5:1, on both base and fix.
  - Links keep their colour by the owner's decision, so this item does not change it.
  - The theme accent is a design call (tier 3).
- **Done-when 3** (owner's machine, tree `6786b997`):
  - `npm test` exited 0, with `Test Files 178 passed (178)` and `Tests 2434 passed | 1 skipped (2435)`. Nothing failed, so nothing was re-run.
  - `npm run typecheck` exited 0. `npm run build` exited 0.
- **Fence (`origin/main...HEAD`):** the four `foliateStyles.ts` files, `A tests/readerModes/bookTextColour.test.ts`, `M docs/governance/BUG_REPORT.md` (BUG-208 `RESOLVED in source (BOOK-TEXT-COLOUR-1)`, with no sha), and this memo.

## Lessons

- **Applied:**
  - LL-142: the cause and the fix are measured live, and the instrument was corrected when its first version passed on the base.
  - Standing rules 43, 47, 48 and 49.
  - Mode isolation.
- **Added:** none in the register.
  - jsdom's computed `color` does not resolve `initial` or `inherit`, so a contrast test needs a real Chromium.
