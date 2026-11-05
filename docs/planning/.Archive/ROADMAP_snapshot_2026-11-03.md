# Roadmap archive — length-ceiling trim, roadmap review 2026-11-03

Source: ROADMAP.md at 71d776f3de589bd9f179ec00cfa206bf3ccd703a. Both sections below are byte-identical to the lines removed (ROADMAP.md was 2,006 lines against `policy.roadmap.lengthCeilingLines` 2,000).

<a id="band-align-2"></a>

## BAND-ALIGN-2 — full specification body

Built and held; carried by the 2026-11-03 RC integration window (wave C). Section SHA256: 6cb3439255810b2e88f6d6616eb822f87039db6ccf204cd5aac520be735077be; lines: 48

- **R7a — Flow hands off to the next section under one clock (fixes BUG-235; dispatch-ready; RodneySr job 7):**
  - Cause (bisected): first bad commit `860ad3ca`. Under wordClock, the next-section hand-off fires only inside `syncToWord`, which is never called for a word past the rendered end.
  - Fix: call it for that word, and hold the word timer (`handoffHold`, distinct from a user pause) until the next section is stamped.
  - Red tests h1–h6, plus a packaged check on RodneySr that it crosses into section 2 by sample 15 like the release.
  - Base `eb/band-align-2-r7-work` @ `f3f254f3`; fast-forwards `eb/band-align-2`. Merges before R8, and lifts BUG-235's merge block once Brain confirms the package.
  - Spec: [docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7a.md](docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7a.md).
- **R8 PACKAGE-VERIFIED (x64, RodneySr) 2026-10-30 (Blurby.Brain1):** `eb/band-align-2` @ `e8e6de06`, fast-forwarded through R7a.
  - L1: the title band is one line, 91 px (R7: 278–560 px). L2: each front-matter block gets its own band. L3: a long paragraph is clipped, with the cursor within 0.32 px of the anchor. L4: one-sentence paragraphs get an exact band. L5: the cover has no band.
  - L6: the Off switch persists across a relaunch. L7: migration maps `flowZoneLines` 0 → off and 7 → on.
  - L8: Flow playback 30/30 ×3, edge error 0 px. It first failed 27/30: the band argument was dropped at two forwarding hops, fixed in fence with a red test (LL-174).
  - Suite 2,599/1/0; x64/arm64 asar identical (`A45CDEE5…`). Arm64 launch at merge.
  - PLAY-FIRST-TEXT-1 (job 9) builds on `e8e6de06`.
- **R8 — paragraph band (owner design ruling 2026-10-30; dispatch-ready; supersedes R7's band-extent rows):**
  - The band covers exactly the paragraph block that contains the selected word, whatever its size. A heading is its own block. With no selected word on the page there is no band.
  - The 3/5/7 line count and its control are removed. A single **Band** on/off switch replaces "Lines 3 5 7 Off" (owner: "Keep an Off switch"). Turning it off also removes the dimming.
  - `flowZoneLines` → `flowBandEnabled` via a v13 → v14 migration; a band that was off stays off.
  - Anchors and R7's leading and trailing spaces stay, with geometry fixed at `FLOW_ZONE_LINES_DEFAULT` (5).
  - Base: `eb/band-align-2` at R7a's tip (re-based 2026-10-30). It launches only after Brain confirms R7a's package (RodneySr job 8).
  - Shared core: `src/types.ts` (keeps a deprecated `flowZoneLines?`) and `ReaderContainer.tsx`, both inside this item's integration window. Narrate is untouched.
  - Queues on RodneySr after the BUG-235 fix.
  - Full amendment: [docs/planning/specs/2026-10-30/BAND-ALIGN-2-R8.md](docs/planning/specs/2026-10-30/BAND-ALIGN-2-R8.md).
- **BUG-235 merge block LIFTED (2026-10-30):** R7a is package-verified (x64, RodneySr; Blurby.Brain1).
  - `eb/band-align-2` @ `3977540e`, package from `20b3d5f8`, fast-forwarded from `a5273704`.
  - Red h1 failed as `{goToSection: [], next: 1}`, which confirms the diagnosis. After the fix: 7/7 new; npm test 2,581/1/0.
  - Live L2 crosses into section 2 at sample 13 in both runs, with no sample missing a cursor; the release crosses at 15, with 2 missing.
  - x64/arm64 asar identical (`e4a5405d…`). Arm64 launch at merge.
  - R8 is unblocked on `3977540e`. RodneySr order: NARRATE-GAP-PAUSE-1 → R8 → PLAY-FIRST-TEXT-1.
  - Earlier record: MERGE BLOCKED by BUG-235 (2026-10-30):** Flow playback stops at a section's end on the held stack but not on release `36ac7466`. The cause is between `36ac7466` and `85e32777`: prime suspect `860ad3ca`, then R6 `eabd0c07`. A bisect is RodneySr job 6, before R8. BAND-ALIGN-2 merges only after the fix.
- **R7 — add space, band fixed (owner design ruling 2026-10-30; dispatch-ready, RodneySr job 4):** the band never moves. Each band mode in Flow and Focus gets a leading space equal to the band anchor's offset, and a matching trailing space, so the cursor and band reach a section's first and last lines, headings included (a few px of shift is acceptable). Zero-word sections get no leading space, and R6 (no band on a zero-word page) is kept. Narrate's band is [NARRATE-BAND-SPACE-1](#narrate-band-space-1). R7 lands before FOCUS-WORD-ONLY-1 and merges after BAND-ALIGN-1. Build base: origin/main merged into tip `85e32777` first (T2). Full amendment: [docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7.md](docs/planning/specs/2026-10-30/BAND-ALIGN-2-R7.md).
- Accepted outside the fence: `src/reader/modes/flow/useModeBindings.ts` (writes the engine's band edges), `docs/.../census/boundary-policy.json` (declares the new constants) and `tests/readerModes/zoneLineStep.test.ts` b1d (pinned test; it now checks the band height and the anchor).
- Accepted: e-ink steps early when the next line would fall below the view (it landed at line 18, not 20), so the cursor stays on screen. Added to the owner's smoke list.

**Ruled by the owner 2026-10-23 (roadmap review 2026-10-23-4):** the chapter's first word becomes the reading word, in [FOCUS-TOC-JUMP-WORD-1](#focus-toc-jump-word-1). Originally open: in Focus, after a contents jump, no cursor is painted in the new section (on the base too). Which word becomes the reading word is a behaviour question, so Done-when 7's "after a contents jump" check cannot pass until it is ruled. It goes to the next review. FLOW-PAUSED-LINE-1's citation of `advanceZone` is now stale (next review). **Merge order:** JUMP-LANDING-SAVE-1 also edits `ReaderContainer.tsx`, so it merges first. `git merge-tree` of the two branches is clean. Then BAND-ALIGN-1 → FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 / FLOW-PARA-KEYS-1 → this branch, in the `ReaderContainer.tsx` integration window. Memo: `docs/governance/close-outs/Memo.BAND-ALIGN-2.GovernanceStaging.2026-10-23.md` on the branch. Position 70 — Full Spec; authored 2026-10-23 by blurby-f0 on main @ `b99d9c06`, edit sites re-grepped on the stacked base below; BUG-188 Part B; owner decision 2026-10-23 "keep band fixed" (tier 3), **amended by the owner 2026-10-23: band on line edges, cursor centred, band follows the reading location, anchor setting Top / Top third / Center (see the Owner amendment below)**; **after the Stage 8 release**; after BAND-ALIGN-1, FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1; shared-core touch: `ReaderContainer.tsx`, two props)*

- **R6 built and held 2026-10-23 at `8de4536e` (code `df80e5dc`) on `eb/band-align-2`:** the cover is image-only (0 stamped words), so no title-page ruling is needed; red `2f44528f`; live on the packaged tip, no band on the cover in Focus or Flow, and the band returns on the cursor line in the first text section; pinned b1d updated under Blurby.Roadmap's ruling (rule 50, `89862a91`). **Rule 53 package verification passed (Blurby.Brain, 2026-10-23):** asar byte-identical to the commit, Done-when re-checked by probe. Held for the Stage 8 release; merges in the keys and band order.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#band-align-2) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.
- **Owner amendment R6, 2026-10-23 (tier 3): "we can't have the horizontal highlight on the cover page".**
  - **What the owner saw:** in Flow, on *Meditations*' cover, an image section with no reading words, the band dims the page from the top-third anchor down.
  - **Rule:**
    - The band and its dimming appear only while the cursor word is on screen.
    - A section with no reading words shows no band: the cover, other image-only pages, and any section where the cursor has no line.
    - This holds in Focus and Flow, at every Lines setting.
    - It matches Lines Off: no mask, nothing dimmed.
  - **Built-and-held fix before merge** (BAND-ALIGN-2 Wave 2 on `eb/band-align-2`, from `508be445`):
    - **Red test first:** a section document with no stamped words leaves `--flow-zone-top` and `--flow-zone-bottom` unset, and sets no band mask, in both modes.
    - **Control:** a text section keeps the band.
    - **Live:** open *Meditations* at its cover in Focus and Flow. Read the mask state (LL-166): no band. Then step to the first text section: the band is back on the cursor line.
    - **To verify before any edit:** whether the cover is image-only, or its title is real text. Settle this by reading the section's stamped words through the probe. If the title is stamped words, stop and report to Blurby.Roadmap: the rule then needs the owner's line on title pages.

<a id="terminal-entries"></a>

## Terminal entries removed from the active section

The active section is uncompleted-only. These three entries were already superseded or dissolved; their register rows are terminal. Section SHA256: 798752b2100d90d7679849eb07dd82f51be53cb8324bc8c6a6f7446171851e21; lines: 3

- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(superseded by BLURBY-SERVER-1, roadmap review 2026-10-23-3; was an open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. **Owner decision, 2026-10-23: no limit on the local import, and no subfolder picker.** Blurby is moving to a server-hosted model (storyboard opened 2026-10-23), and limits will come from future plan tiers (free and paid), not from the desktop import. So the design half is closed with no work item. Residual technical risk, for the server model to remove: `broadcastLibrary` sends the whole library on every save, which a very large local library makes slow. The owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(dissolved, roadmap review 2026-10-23-3)*. The owner approved dissolving it: BLURBY-SERVER-1 retires the watched source folder in its Phase 2 (ruling Q2), so the banner it polished goes away. FOLDER-UNREACHABLE-GUARD-1 and FOLDER-NOTICE-1 are merged and still ship.
- <a id="narrate-exit-crash-1"></a>**NARRATE-EXIT-CRASH-1 — SUPERSEDED (roadmap review 2026-10-23-4, owner-approved): ELECTRON-42-UPGRADE-1 replaced its fix, and release gate (1) passed on Electron 42 with 0 of 51 launches crashing. The terminal record goes through /dispatch-closeout. Original stub follows.** A native crash on Narrate producer teardown under Electron** *(position 55 — stub; RELEASE GATE (11) since 2026-10-15)*. From NARRATE-REBUILD-1 P6b wave A (Blurby.Brain ruling 2026-10-15): `scripts/narrate-rebuild/p3-producer-check.mjs` prints `pass:true` under the app's Electron, then exits 0x40000015 at shutdown (twice; `--break` still exits 1). A native crash on producer teardown is close to the 0xC0000409 risk QUIT-FLUSH-1 guards. Check whether the real app crashes on quit while Narrate is playing and while it is paused (crash dialog, crash dump under the profile's Crashpad folder), find the teardown order that crashes, and fix it. **Confirmed 2026-10-15 (release gate (1) on the quiet machine, main `1da81be2`):** 57 of 121 launches exited 0x80000003 (STATUS_BREAKPOINT), all of them cold-trial launches, each after the measurement and after `flushed {ok:true}` (no data lost); the last log line in every crashed log and in no clean one is `PostQueuedCompletionStatus: (6) The handle is invalid.` Evidence in the owner's Drive, `Blurby-transfer\release-final-main\final-main-d3d6\`. Read-only diagnosis in progress (Blurby.Roadmap); the fix keeps QUIT-FLUSH-1's awaited producer shutdown; gate: 0 crashed launches on the quiet machine's full launcher run. Lane: TTS / Narration Engine. **Roadmap review 2026-10-22:** ELECTRON-42-UPGRADE-1 carries the fix (release gate (11)). When its Done-when 12 shows 0 crashed launches on the quiet machine, the next review retires this stub as superseded by ELECTRON-42-UPGRADE-1, with that run as the evidence. Until then it stays queued as the record of the defect.
