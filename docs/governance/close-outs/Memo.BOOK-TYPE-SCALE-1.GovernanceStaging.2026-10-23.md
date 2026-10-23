# Dispatch Close-Out Governance Staging — BOOK-TYPE-SCALE-1

Seq 6.5, in the release by owner decision on 2026-10-23.
- **Branch:** `eb/book-type-scale-1`, from `main` @ `c83c6553`. That is the BOOK-TEXT-COLOUR-1 merge, which the spec requires first.
- **Merge:** on Blurby.Roadmap's go.
- **Shared core:** none.
- **Lane:** UX polish; surface C.

## Evidence (Done-when)

1. **Re-grep on the base `c83c6553`.** `git grep -n "html, body {"` printed 4 lines, each at `:39`. The four `foliateStyles.ts` files had one SHA-256 (`475ad477…`), so the BUG-208 rule left the anchor in place.
2. **Positive control** (`107aa83e`, committed alone):
   - `describe("book type scale")` in `tests/foliateChunkHighlight.test.ts`, run on all four copies (Narrate's copy is now imported too).
   - The publisher stylesheet is the spec's.
   - On the base, all 4 copies failed, exit 1.
3. **The change** (`3599b74b`):
   - `src/constants.ts` gains `BOOK_TYPE_SCALE` and `BOOK_HEADING_LINE_HEIGHT`.
   - The spec's four rules (font family, block size, h1–h6 sizes, heading weight and line-height) follow the BUG-208 rule in each injector.
   - The test passes 76 of 76, and the four files have one hash (`bcf4dc9f…`).
   - **Fence addition** (`8c43cc91`): `readerModeBoundaries` G1 failed because a mode may import only the constants declared in `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`. The two names are added in sorted order, following NARRATE-REBUILD-1-S2's precedent. Tier 1 technical.
4. **Live check** on packaged `--dir` builds with scratch profiles and the bundled *Meditations* at INTRODUCTION, whose section opens with an `h2`. Each row is one mode at text size 60 (min), 110 (default), 150 or 200 (max).
   - **Change:** 16 of 16 rows pass.
     - `h2` = 1.3 × `p` (26 / 20 px at 110).
     - The `.page-word` span equals its paragraph's size, and `h2` is weight 700.
     - Every family is the reading font (`Georgia, serif`).
   - **Base `c83c6553`:** 0 of 16 rows pass; `h2` = 1.5 × `p` (30 / 20 px at 110).
   - Screenshots: `C:\Projects\Blurby-artifacts\book-type-scale-1\fix2-*.png` and `base1-*.png`. Script: `live.mjs`.
   - **Limit:** the sample's own stylesheet already uses Georgia and a bold `h2`, so this book cannot show the family and weight rules acting. The test in item 2 pins those rules.
5. **Narrate and Page still work** (same run):
   - Narrate: a click on word 188 "MARCUS", then Play. The first cursor was 188 "MARCUS" at 10 ms, and it advanced over 40 words. Screenshot: `fix2-narrate-playing.png`.
   - Page: Next ×3, then Previous ×3. The saved position went 355 → 572 → 798 → 572 → 355 → 187, so it updated on every turn.
6. **Suite, typecheck and build** on the final tree `8c43cc91`:
   - `npm test`: 179 files, 2444 passed / 1 skipped / 0 failed.
   - `npm run typecheck` exits 0. `npm run build` exits 0 on `3599b74b`; the only later commit is the policy JSON, which is not in the bundle.
   - Before the policy fix, the only failure was the G1 boundary test (item 3).
7. **Fence** (`origin/main...HEAD`):
   - Changed: the four `foliateStyles.ts`, `src/constants.ts`, `tests/foliateChunkHighlight.test.ts`, the boundary policy (item 3) and this memo.
   - Empty: the diff over `src/utils`, `ReaderContainer.tsx` and `src/types.ts`.
   - There is no time log.
8. **Word numbering**, under Electron 42.11.18 as Node (ICU 78.2): `extractWords(resources/sample-meditations.epub)` gives 80,493 words, with 2970 "ancient", 5480 "HIS" and 9431 "THE", on both the base and the change.
   - Control: plain Node gives 80,426 words ("cosmopolitan.", "recordeth,", "hast"), exit 1.
   - Script: `words.cjs`.
9. **Saved place survives:**
   - On the base, in Page mode at INTRODUCTION, Next ×2 saved position 680 "out", drawn in the view.
   - The same profile on the change reopened with word 680 "out" in the view. The text matched, so this passes (`place-reopen.json`, `place-reopen.png`).
   - The word now sits on the page's last line, not its first, because the smaller heading moves page breaks.
10. **Text size on top of the scale:** item 4's rows run at minimum, default and maximum (plus 150), with a screenshot per mode per size.
    - At every size, no heading overlaps a sibling or is clipped horizontally.
    - **Instrument correction:** the first run reported a 140–250 px "overlap" under Page's `h2`. The screenshot showed none. Page lays text out in CSS columns, and a paragraph that runs on into the next column reports a union box whose top is that column's top. The measure now uses line-box fragments.
    - **Positive control:** `h2 { margin-bottom: -40px }` injected live is reported as a 35 px overlap, on both builds.
11. **Contrast on the combined tree:** BOOK-TEXT-COLOUR-1's `contrast.mjs` on this build passes 8 of 8; header and body text are ≥ 14.25:1.
12. **Narrate on the combined tree:** `tests/narrate/` passes, 20 files and 125 tests. Gate (1)'s D3 and D5 rows are Blurby.Roadmap's planned re-run on the release-fix sha; they were not run here.
13. **App chrome untouched:** `git diff --name-only refs/remotes/origin/main -- src/styles src/components` prints nothing.

## Lessons

- **Applied:**
  - LL-138 / standing rule 43: the test failed on the base first. The overlap measure has a live positive control, and the base build fails the live ratio.
  - LL-142: the live check measures computed sizes in the iframe.
  - LL-161: the place check compares word text.
  - Standing rules 41, 47, 48 and 50: the pinned boundary policy was updated in scope, and the update is reported in item 3.
- **Added:** none in the register.
  - Candidate: in Page mode, measure layout with `getClientRects()`, never `getBoundingClientRect()`. A block that spans columns returns a union box.
