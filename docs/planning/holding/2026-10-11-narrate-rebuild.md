# Held Plan — Narrate rip-out and rebuild

<!-- virtuoso-held-plan v1 -->
<!-- One file per piece of ad hoc work, saved in the registered holdingBay role as
     <yyyy-mm-dd>-<slug>.md. The Trail changes only through
     `virtuoso_registry holding --record`; never edit or delete a row. Nothing in this
     file is on the roadmap until roadmap-review absorbs it. -->

- **Entry:** 2026-10-11-narrate-rebuild
- **Size:** item set (2): one single item (the removal) and one epic-scale item (the rebuild). The rebuild is placed by `/roadmap-review` as `Path: epic`; `/write-plan` plans only the removal.
- **Origin:** storyboard 2026-10-11. This could not wait for the next roadmap review, for three reasons:
  - owner ruling #31 (READER-MODE-SEPARATION-2, 2026-10-10) makes the removal the next sprint;
  - the rebuild supersedes four queued narration items;
  - the review needs an aligned scope to place both items.

## Trail

| Date | State | By | Note |
|---|---|---|---|
| 2026-10-11 | storyboarded | storyboard | aligned; 2 items (removal single item + rebuild epic-scale) |
| 2026-10-11 | planned | write-plan | HB-1 (Narrate removal) planned; rubric v1.2 PASS (U9, U10 mechanical); prerequisites pending: LIBRARY-SETTINGS-FIX-1, EINK-HOVER-FIX-1; rebuild epic-scale, held for review |

## Storyboard

### Alignment record

**Outcome:** Blurby has narration that works. A new Narrate is built from scratch as its own reading mode, after the old narration is removed. Its cursor is literally attached to the word being played.

**Why now:** On the baseline build (OS-1, 2026-10-10) the owner heard and saw:
- the cursor running ahead of the voice;
- the highlight freezing after an audio gap;
- 15–35 s waits at speed changes and section starts;
- distorted speed changes;
- double highlights and a shifting bottom bar.

The four queued patch items (heard cursor, rate-change collapse, subscriber cursor, export) would only nibble at it. Mode separation is complete, so Narrate can now be replaced without touching Page, Focus or Flow.

**Done looks like:** on day one ("core done right"):
- click a word and speech starts on it;
- pause and resume;
- change speed;
- cross sections and chapters cleanly;
- one voice engine;
- the cursor is the word at the current playback sample, from an exact word table, with nothing estimated and nothing else moving it.

**Must never happen:**
- the cursor shows a word that is not playing;
- any estimated or guessed timing;
- two voices overlapping;
- Narrate code reaching into Page, Focus or Flow;
- user data deleted.

**Out of scope (day one; each returns later as its own item):** pronunciation overrides, narration profiles, audio export, media keys, named pauses and footnote modes, voice preview, MOSS-Nano, Pocket and Qwen, next-book continuation, and modelling Bluetooth or device output delay.

**You said:**
- "stop, rip out narration, and rebuild it from the ground up, disconnected from the other reading modes."
- Engine scope: "Everything, incl. TTS engine." Interim: "Remove it now". Separation: "Land it first".
- Day one: "Core done right."
- Removal depth: "All but the Kokoro engine."
- Placement: "Right after those two" (the e-ink and command-palette fixes).
- "The cursor should literally not move from the word being spoken. It should be completely tied to it. We need to know exactly what word is being said at any given moment and the cursor should be highlighting that word. There should be no guessing. It should be literally attached."
- "Why can't we base this on math instead a heuristic triangulation?"
- "This doesn't matter. We're not trying to predict it in this way. What word is playing at any given point, do we have a deterministic way to know this?"
- On the requirement as written back: "Yes, that's it."
- Approach: "Prove Kokoro, then build."

**Assumed — each one confirmed, corrected, or accepted with a guard before the verdict:**

| Assumption | Resolution |
|---|---|
| A1 Speech starts within 2 s of Play or a word click. A speed change takes effect within 2 s. No audible stall at chunk, section or chapter boundaries | confirmed (owner, 2026-10-11) |
| A2 Speed range stays 0.80–2.00x in 0.05 steps. Audio is generated at the chosen speed and never stretched afterwards, because stretching breaks the exact word table | confirmed |
| A3 The removal deletes no user data. Saved voice, speed, overrides and profiles stay in settings. The audio cache (up to 2 GB) and the Kokoro model stay on disk. A book saved in Narrate mode opens in Flow | confirmed |
| A4 The removal also retires the old TTS quality-gate CI job and its eval scripts; the rebuild brings its own checks | confirmed |
| A5 The new Narrate plugs into the mode framework from READER-MODE-SEPARATION-2. Page, Focus and Flow change only at registration and in the bottom bar | confirmed |
| A6 One voice to start (current default af_bella); the voice picker returns later | confirmed |
| A7 No hard deadline; the next roadmap review places a new finish line | confirmed |
| A8 Kokoro's word table is exact for the audio it generates, because its predicted durations drive the synthesis | accepted. Guard: Rebuild Phase 0 verifies it on real passages before any build. A failure sends the engine choice to a bake-off |

**Decisions:**

| Decision | Chosen | Decided by | Date |
|---|---|---|---|
| Fate of mode separation | Land it first (done 2026-10-11) | the owner | 2026-10-10 |
| Interim narration | None: remove Narrate, don't keep the old one running | the owner | 2026-10-10 |
| Rebuild scope | Everything, including the TTS engine | the owner | 2026-10-10 |
| Day-one bar | Core done right | the owner | 2026-10-10 |
| Removal depth | All but the Kokoro engine (kept dormant, no UI path) | the owner | 2026-10-11 |
| Removal placement | Right after EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1 | the owner | 2026-10-11 |
| Sync requirement | The cursor is the word at the current playback sample, from an exact word table; nothing estimated; no device-delay modelling | the owner | 2026-10-11 |
| Engine approach | Prove Kokoro (Phase 0), then build; bake-off only on failure | the owner | 2026-10-11 |

**Impact map:**

| Direction | Item / artifact | Relationship | Effect | Source |
|---|---|---|---|---|
| Upstream | Reading-mode separation (READER-MODE-SEPARATION-2) | prerequisite | Done 2026-10-11; supplies the mode contract (module, runtime, ports, router) | close-out `CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md`; `src/reader/modes/ReaderModeAdapter.ts` |
| Upstream | E-ink hover fix (EINK-HOVER-FIX-1), command-palette settings fix (LIBRARY-SETTINGS-FIX-1) | precede the removal | The removal edits `CommandPalette.tsx` and `SettingsMenu.tsx` after them. LIBRARY-SETTINGS-FIX-1 has merged (8c41095e) | register via provider, 2026-10-11 |
| Downstream | Heard cursor (NARRATE-HEARD-CURSOR-1), rate-change collapse (NARRATE-APPLYRATECHANGE-COLLAPSE-1), subscriber cursor (NARRATE-SUBSCRIBER-CURSOR-1), long-form export (KOKORO-EXPORT-1) | superseded | Retire or supersede at review | register; ROADMAP §Stage 3 |
| Downstream | Space resumes last mode (UX-POLISH-1) | cites Narrate | Needs the saved-`narrate` fallback (A3); drop its Narrate references | ROADMAP §Stage 3 |
| Downstream | Mode-barrel cleanup (CLEANUP-MODE-BARREL-1) | same edit sites | May fold into the removal (`src/modes/index.ts`, "no legacy NarrateMode" test assertions) | ROADMAP §Stage 4 |
| Downstream | BUG-168 (ramp chunk boundaries), BUG-169 (update-depth loop in Narrate/Flow relocation) | cite removed code | Re-triage. BUG-169's Flow half may survive | `docs/governance/BUG_REPORT.md` |
| Downstream | CLAUDE.md engine posture and "isolate reading modes first"; `TECHNICAL_REFERENCE.md`; v2 release notes (MOSS/Pocket opt-ins); CI `quality-gate` job | describe removed behaviour | Update at review and close-out | CLAUDE.md; `.github/workflows/ci.yml`; `docs/planning/desktop-v2.0-release-notes.md` |
| Sideways | Intermittent Flow band lag (owner, 2026-10-10) | Flow, not Narrate | Separate triage; not part of this entry | `os1-owner-observations.json` S2 |
| External | none | — | No services, accounts or data owners outside the repo. Kokoro model already on disk | investigation 2026-10-10 |
| Deadline | mode-separation (2026-11-30) | out of scope (met) | No current deadline covers this entry. A7: the review sets a new finish line | `kpis` pace block |

### Frames

1. **F1 After the removal.** Given the removal has merged, when you open any book, then:
   - the bottom bar shows only Page, Focus and Flow: no Narrate button, no N shortcut, no narration settings screens;
   - a book saved in Narrate opens in Flow at the same word;
   - your saved voice and speed are still in your settings, and nothing on disk is deleted.

   *(confirmed)*
2. **F2 Main success.** Given the rebuilt Narrate on *Meditations*, when you click "ancient" mid-paragraph and press Play, then:
   - "ancient" is the first word heard, within 2 s;
   - the highlight sits on each word exactly while it is spoken, and recorded output shows every cursor change on the word change;
   - it reads from the Introduction into "HIS FIRST BOOK" with no stall, and the highlight comes along.

   *(confirmed)*
3. **F3 Speed change.** Given narration at 1.00x, when you switch to 1.40x, then within 2 s the voice continues at 1.40x from the next word. There is no overlap, distortion or sentence restart, and the cursor stays attached. *(confirmed)*
4. **F4 Exact timing missing.** Given the engine returns a chunk whose word table is missing or does not match its audio, when that chunk would play, then:
   - narration pauses on the last exactly-timed word;
   - a short notice says the passage couldn't be timed, and a diagnostic is logged;
   - the chunk is never played with a guessed cursor.

   *(confirmed)*
5. **F5 Voice not ready.** Given the Kokoro model is still loading, when you press Play, then you see a clear "voice loading" state, and speech starts on your word once it is ready. It never hangs silently. *(confirmed)*
6. **F6 What does not change.** Given narration is playing, when you switch to Flow, Page or Focus, then:
   - narration stops cleanly, and that mode opens at the word that was playing;
   - Page, Focus and Flow behave exactly as today, and the separation's boundary and behaviour tests pass unchanged;
   - none of them imports Narrate code.

   *(confirmed)*

### Approach

**Prove Kokoro, then build.** The removal clears every narration path but leaves the Kokoro engine dormant in the main process, with no UI or preload path. The rebuild's Phase 0 measures the two unknowns on the owner's machine:
- whether Kokoro's word table is exact against its own audio;
- whether speech can start, and a speed change (generated at the new speed) can apply, within 2 s.

On a pass, the new Narrate is built on Kokoro. On a failure, a bake-off against the shortlisted engines (`docs/studies/research/tts-engine-scan/SHORTLIST.md`) comes before any building. This also satisfies standing rule 38 (measure before perceptual rewrites). Prior studies already rank Kokoro the best CPU fit.

The core is deterministic: an exact word table per chunk plus the audio playback clock. The cursor is the word at the current playback sample. There is no estimated-timing path, no time-stretching and no device-delay modelling.

Considered and set aside:
- **A full bake-off first:** slowest, and likely re-confirms Kokoro.
- **Building on Kokoro without Phase 0:** a failure in table exactness or regeneration speed would surface mid-build.
- **Removing Kokoro too:** leaves nothing to benchmark, and risks re-adding it.
- **Removing only the mode's entry points:** 26k lines of old narration would linger.
- **Calibrating per-device delay:** rejected by the owner; the cursor is tied to the audio stream itself.

### Draft stub

#### Narrate removal (single item; ID assigned by review)

- **What:** Delete the Narrate mode and all narration logic, which includes:
  - the scheduler, generation and chunk planning, word timing, caching and cursor code;
  - the narration hooks and strategies;
  - the TTS settings screens, plus the Narrate bottom-bar, shortcut and command-palette entries;
  - the dormant MOSS-Nano, Pocket and Qwen engines with their sidecars and scripts;
  - the TTS eval harness and the CI `quality-gate` job.

  Keep the Kokoro engine (main-process engine, worker, model handling) with **no renderer or preload path** to it. Add a settings migration so a saved `narrate` reading mode becomes Flow. Keep the `extract-epub-words` channel that every mode uses.
- **Why:** Owner ruling #31; a clean slate for the rebuild.
- **Done when (draft):**
  1. Frame F1 holds.
  2. Typecheck, the full test suite and the build pass.
  3. The separation's Page, Focus and Flow boundary, contract and behaviour tests pass with no rebaselining. The Narrate cases leave the registry and router.
  4. Word extraction works in every mode.
  5. No user file is modified or deleted. Settings keys survive, and the cache and model stay on disk.
  6. The Kokoro engine module remains, and nothing under `src/` or `preload.js` can reach it.
- **Out of scope:**
  - deleting user data, the audio cache or the model;
  - removing Kokoro;
  - any new narration behaviour;
  - Flow band triage.
- **Edit sites (expected):** from the 2026-10-10 code map; `/write-plan` verifies anchors.
  - **Narrate mode and runtime:** `src/reader/modes/narrate/**`, `src/reader/modes/NarrateModeAdapter.ts`.
  - **Hooks and strategies:** `src/hooks/useNarration.ts`, `src/hooks/narration/*`, `useNarrationCaching`, `useNarrationSync`, `useQwenPrototypeStatus`.
  - **Narration-only utilities:** `audioScheduler`, `generationPipeline`, `segmentNormalizer`, `narrationPlanner`, `backgroundCacher`, `audio/*`, `ttsEvalTrace`, `streamAccumulator`, `ttsProviderRegistry` and the rest of the list in the code map.
  - **Types and constants:** narration types (moving `SectionBoundary` to a shared type); the narration blocks in `src/types.ts` and `src/constants.ts`.
  - **Settings UI:** the TTS settings components and `styles/tts-settings.css`.
  - **Shared edits:**
    - `ReaderBottomBar` and `ReaderSpeedDialog` (the Narrate range);
    - `ReaderContainer.tsx` (shared-core freeze set);
    - `useReaderModeOrchestrator` registration;
    - `ReaderPorts`/`createReaderPorts` (the audio group);
    - Page's `adjustSpeed` narrate branch;
    - the Focus/Flow `tts*` config fields and the `TTS_PAUSE_*` defaults (keep or rename);
    - `useKeyboardShortcuts`, `CommandPalette`, `SettingsMenu`, `HotkeyMapSettings`, `HotkeyCoach`, `SpeedReadingSettings`;
    - the diagnostics export (`LibraryContainer`, `bugReportState`, `BugReportModal`).
  - **Main process and packaging:**
    - `main/`: `moss-nano-*`, `pocket-tts-*`, `qwen-*`, `sidecar-paths`, `python-sidecar-*`, and the non-Kokoro channels in `ipc/tts.js`;
    - `main.js` eval-trace hooks;
    - the TTS surface in `preload.js` (keep `extractEpubWords`);
    - `main/migrations.js` (v13);
    - the sidecar entries in `package.json`.
  - **Scripts and tests:**
    - `scripts/` TTS eval, MOSS, Qwen and Pocket tools;
    - about 95 narration test files;
    - the dead legacy hooks and views that still import narration (`useReaderMode`, `useFlowScrollSync`, `useFoliateSync`, `useDocumentLifecycle`, `useReadingModeInstance`, `FoliatePageView`).
- **Prerequisites:** reading-mode separation (done); e-ink hover fix (EINK-HOVER-FIX-1); command-palette settings fix (LIBRARY-SETTINGS-FIX-1, merged).
- **Effort:** high. It crosses modules, touches the shared-core freeze set, and is likely split into waves.
- **Interfaces:**
  - Produces:
    - an app with no Narrate mode, router entry or audio port;
    - Kokoro dormant in the main process;
    - the saved `ttsVoiceName`/`ttsRate` settings;
    - the saved-mode fallback.
  - Consumes: the separation's mode registry and ports.

#### Narrate rebuild (epic-scale; placed by review as `Path: epic`)

- **What:** A new Narrate, built from scratch on the separation's mode contract.
  - **Phase 0 proves Kokoro:**
    - the word table matches its own audio on real passages;
    - start within 2 s;
    - a speed change, generated at the new speed, within 2 s.

    Pass → build on Kokoro. Fail → bake-off on the shortlist first.
  - **Core:**
    - a per-chunk exact word table plus the audio playback clock, so cursor = word at the current playback sample;
    - no estimated-timing path;
    - no post-generation stretching.
  - **Then:**
    - the Narrate mode and its bottom-bar entry;
    - speed;
    - section and chapter crossing;
    - the failure states (F4, F5).
- **Why:** The owner's "literally attached" requirement, and reliability.
- **Done when (draft):**
  1. Frames F2–F6 hold.
  2. A1 latency and A2 speed hold.
  3. Recorded output shows every cursor change on the word change, within the measurement's precision (about 30 ms).
  4. A structural test proves no estimated-timing code exists.
  5. The Phase 0 verdict is recorded.
  6. The owner listens and signs off.
- **Out of scope:** the day-one exclusions above.
- **Edit sites (expected):**
  - a fresh `src/reader/modes/narrate/**`;
  - a new word-table and playback-clock module;
  - a narrow new preload/IPC path to the Kokoro engine;
  - a Narrate audio port;
  - router registration and the bottom-bar entry;
  - minimal voice and speed settings.
- **Prerequisites:** Narrate removal.
- **Effort:** max (new architecture; owner gates).
- **Interfaces:**
  - Consumes: the mode contract (module, runtime, ports, router), the dormant Kokoro engine, and the saved voice and speed.
  - Produces: the Narrate mode.

**Placement recommendation (for `/roadmap-review`):**
- Narrate removal immediately after EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1.
- Narrate rebuild next, as `Path: epic`.
- A new finish line, "Narration rebuilt", replacing the narration part of "TTS Quality Confidence + Reading Experience v2". The owner sets its date.

**Impact actions (for `/roadmap-review`; not edited here):**
- Retire or supersede NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1 and KOKORO-EXPORT-1.
- UX-POLISH-1: drop its Narrate references and rely on the saved-mode fallback.
- Decide whether CLEANUP-MODE-BARREL-1 folds into the removal.
- Re-triage BUG-168 and BUG-169.
- Update CLAUDE.md (engine posture; "isolate reading modes first"), `TECHNICAL_REFERENCE.md` and the v2 release notes.

### Alignment verdict

Aligned — 2026-10-11. The user approved: "(a) Approve (Recommended)".

## Plan

Written by `/write-plan` on 2026-10-11 against `main` @ `45d45473`. It plans **HB-1, the Narrate removal**, only. The Narrate rebuild is epic-scale: it gets no HB number here, and the next `/roadmap-review` places it as `Path: epic`.

### Readiness

| Finding | Result |
|---|---|
| **Specification** | Rubric v1.2 U1–U4, U6, U7, U9 and U10: see *Rubric walk* under HB-1. No project extensions are declared. |
| **Prerequisites** | **Pending, with the wait encoded.** Reading-mode separation (READER-MODE-SEPARATION-2) is `completed`. The command-palette settings fix (LIBRARY-SETTINGS-FIX-1) has its code merged on `main` (`8c41095e`), but the register still reads `queued` until its close-out runs. The e-ink hover fix (EINK-HOVER-FIX-1) is `queued`; it is an ordering point only, because it is file-disjoint from HB-1. |
| **Repository** | `origin/main` = `45d45473` carries this held plan (`2d0fe82b`). No worktree or branch is in flight on HB-1's edit sites (`git worktree list`, 2026-10-11). |
| **External register** | Readable: monday board 18432450217 via its snapshot of 2026-10-11T03:44:14Z, read-only. Nothing is written to it by this plan. |
| **Execution environment** | Windows host with Node and npm; `npm ci`, `npm run typecheck`, `npm test` and `npm run build` all ran on this machine on 2026-10-11. No credentials or network services are needed. The owner is needed for the live smoke check (Done-when 15). |

**Not executable now:** the command-palette settings fix (LIBRARY-SETTINGS-FIX-1) must read `completed` in the register first. The roadmap order also puts the e-ink hover fix (EINK-HOVER-FIX-1) ahead of HB-1, by the owner's placement decision.

### Roadmap placement

`Placement: after Stop the e-ink hover rule wiping overlay backgrounds (EINK-HOVER-FIX-1) and Fix command-palette settings routing and live New-dot clearing (LIBRARY-SETTINGS-FIX-1), before the Narrate rebuild (epic, this entry) and Remove the unused mode barrel and update structural tests (CLEANUP-MODE-BARREL-1) — Reader Engine lane (primary), TTS / Narration Engine (secondary); no declared deadline (mode-separation is met); placed by the owner 2026-10-11: removal right after the two small fixes.`

It runs ahead of nothing. CLEANUP-MODE-BARREL-1 follows it because HB-1 deletes `src/hooks/useReadingModeInstance.ts`, the barrel's only importer, so the barrel item becomes simpler. The four narration items (NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1 and KOKORO-EXPORT-1) are superseded; retiring them is the review's call.

### Pointer

```
Narrate removal (keep Kokoro dormant)  (HB-1)
Origin: held plan — 2026-10-11-narrate-rebuild (HB-1), not yet on the roadmap
Placement: after EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1, before the Narrate rebuild epic and CLEANUP-MODE-BARREL-1 — for the review to apply
Effort: high (3 waves)
Branch: eb/hb-1 from main @ 45d45473 (carries the held plan)
Specification: docs/planning/holding/2026-10-11-narrate-rebuild.md#hb-1--narrate-removal-keep-kokoro-dormant
Status: planned — held | Prerequisites: READER-MODE-SEPARATION-2 met; LIBRARY-SETTINGS-FIX-1 pending close-out; EINK-HOVER-FIX-1 (ordering) pending
Readiness: specification ✓ · prerequisites ✗ (wait encoded) · repository ✓ · register ✓ · environment ✓
```

### Repository reconciliation — run this FIRST

For the `virtuoso` skill. `policy.git` = `push`, network operations allowed, remote `origin`, default branch `main`, and the template `eb/{item-id}`. Every command runs from `C:\Projects\Blurby`.

1. `git fetch origin --prune`
2. **STOP unless** both of these read `completed` in the register: the command-palette settings fix (LIBRARY-SETTINGS-FIX-1) and the e-ink hover fix (EINK-HOVER-FIX-1). Check with `& "$HOME/.virtuoso/bin/virtuoso.ps1" virtuoso_registry --root . items --all --json` (the prerequisite wait).
3. **STOP if** `git worktree list` shows a worktree for `eb/hb-1`, or `git branch -a --list "*hb-1*"` is non-empty. In that case another run holds it.
4. `git worktree add C:\Projects\Blurby\.worktrees\hb-1 -b eb/hb-1 refs/remotes/origin/main`. Write refs in full, because a `main/` directory exists.
5. Then, in `C:\Projects\Blurby\.worktrees\hb-1`:
   1. `git status --porcelain` must be empty.
   2. Run `npm ci`.
   3. **Base measurement** (red-base rule): `npm run typecheck`, `npm test` and `npm run build`. Record the exit codes and any failing node IDs before the first edit. A red base goes to an issue file, not into this sprint.

### Specifications

#### HB-1 — Narrate removal (keep Kokoro dormant)

- **What:** Remove the Narrate reading mode and all narration logic from Blurby:
  - Narrate's mode, view and helpers, and every narration hook, strategy and utility;
  - the narration types and constants, the TTS settings screens and CSS;
  - the Narrate button, shortcut, palette and settings entries;
  - the dormant MOSS-Nano, Pocket and Qwen engines, their IPC, sidecars and scripts;
  - the TTS evaluation scripts and the CI `quality-gate` job;
  - the legacy dead cluster that imports narration.

  Keep the Kokoro engine in the main process (`tts-engine`, `tts-worker`, the marathon worker, the cache and opus modules, and their IPC handlers), **unreachable**: there is no preload method and no `ElectronAPI` member, and it does not start at app launch. Add settings migration v13 so a saved `narrate` reading mode becomes `flow`. Keep every user settings key and every file on disk.
- **Why:** Owner ruling #31 (`docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md`), and the aligned storyboard above. It clears the ground for the rebuild epic without touching Page, Focus or Flow.
- **Out of scope:**
  - Any change to Page, Focus or Flow behaviour, and their committed G4 baselines.
  - Deleting user data (`settings.json` keys, `userData/tts-cache`, `userData/models`).
  - Removing Kokoro or its packaging (`kokoro-js`, the onnxruntime overrides and unpack entries, `patches/kokoro-js+1.2.1.patch`, `scripts/patch-onnxruntime.js`).
  - New narration; renaming `narrateDiagnostics`.
  - `src/modes/*` (CLEANUP-MODE-BARREL-1); the `vite.config.js` `tts` manual chunk.
  - The Speed Reading settings' Kokoro note and Rhythm Pauses visibility.
  - Docs other than this sprint's staging fold-ins; BUG-168 and BUG-169 re-triage; the Flow band triage.
- **Prerequisites:**
  - Reading-mode separation (READER-MODE-SEPARATION-2): completed.
  - Command-palette settings fix (LIBRARY-SETTINGS-FIX-1): code on `main` (`8c41095e`); must read `completed` in the register.
  - E-ink hover fix (EINK-HOVER-FIX-1): ordering only (owner placement); must read `completed`.

  The wait is encoded in reconciliation step 2.
- **Done when:** run every command from the HB-1 worktree root.
    1. **F1, deleted paths absent:** `git ls-files src/reader/modes/narrate src/reader/modes/NarrateModeAdapter.ts src/hooks/useNarration.ts src/hooks/narration src/components/settings/TTSSettings.tsx src/styles/tts-settings.css src/components/FoliatePageView.tsx src/hooks/useReaderMode.ts main/qwen-engine.js main/python-sidecar-engine.js scripts/tts_eval_runner.mjs` prints nothing.
    2. **F1, registry is three modes:** `npm test -- tests/readerModeIsolation.test.ts` exits 0. Its registry test asserts `Object.keys(READER_MODE_MODULES).sort()` equals `["flow","focus","page"]`.
    3. **F1, bottom bar:** `npm test -- tests/readerBottomBarControls.test.tsx tests/readerModeControls.test.tsx` exits 0, with these new assertions:
       - the bar renders exactly the mode buttons Page, Focus and Flow;
       - no element's text contains `Narrat`;
       - rendering with `lastReadingMode={"narrate" as never}` throws nothing and gives no button the class `rbb-mode-btn--last`.
    4. **F1, shortcuts:** `npm test -- tests/useKeyboardShortcuts.test.ts tests/readerKeyboard.test.tsx` exits 0. The mirror's KeyN rule is gone, and pressing `n` in Flow resolves to no action.
    5. **F1, settings and palette:** `npm test -- tests/commandPaletteRoutes.test.ts` exits 0, and `rg -n "\"tts\"|Narration \(TTS\)" src/components/SettingsMenu.tsx src/components/CommandPalette.tsx src/components/MenuFlap.tsx` prints nothing.
    6. **F1, saved Narrate becomes Flow** (positive control, LL-138): the new `tests/settingsMigrationV13.test.js` requires `../main/migrations.js` and asserts:
       - `readingMode: "narrate"` → `"flow"`, `lastReadingMode: "narrate"` → `"flow"`, `schemaVersion` → `13`;
       - `readingMode: "page"` and `lastReadingMode: "focus"` are unchanged;
       - `isNarrating`, `ttsEngine`, `ttsVoiceName`, `ttsRate`, `pronunciationOverrides` and `narrationProfiles` are deep-equal before and after.

       It fails on the base (recorded in the close-out), and `npm test -- tests/settingsMigrationV13.test.js` exits 0 after.
    7. **F1, user data untouched:** `rg -n "runKokoroWarmup|ttsCache\.init|scheduleCleanupOrphans|runCacheCleanup" main.js` prints nothing, and `git diff --name-only refs/remotes/origin/main -- main/tts-cache.js main/tts-engine.js main/tts-worker.js main/tts-engine-marathon.js main/tts-opus.js` prints nothing.
    8. **Kokoro dormant and unreachable:**
       - `rg -n "kokoro|tts-kokoro|tts-cache|ttsCache|tts-qwen|tts-nano|tts-pocket" preload.js` prints nothing;
       - `rg -n "kokoroPreload|kokoroGenerate|ttsCache[A-Z]" src` prints nothing;
       - `npm test -- tests/tts-engine.test.js tests/tts-worker.test.js` exits 0, so the engine still loads and works in isolation.
    9. **Dormant engines gone from main:** `rg -n "moss-nano|pocket-tts|qwen-engine|qwen-streaming|python-sidecar|sidecar-paths|tts-nano-|tts-pocket-|tts-qwen-" main main.js package.json` prints nothing, and `git ls-files main | rg "moss|pocket|qwen|sidecar"` prints nothing.
    10. **CI and scripts:** `rg -n "quality-gate|test:quality|tts:eval|tts:scan|moss:" .github/workflows/ci.yml package.json` prints nothing.
    11. **F6, Page, Focus and Flow unchanged:**
        - `npm test -- tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/readerModes/` exits 0;
        - `git diff --exit-code refs/remotes/origin/main -- docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/page.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/focus.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/flow.baseline.json` exits 0 (no rebaselining);
        - `git diff --name-only refs/remotes/origin/main -- src/reader/modes/page src/reader/modes/focus src/reader/modes/flow` prints exactly `src/reader/modes/focus/ModeRuntime.ts`, `src/reader/modes/flow/ModeRuntime.ts` and `src/reader/modes/page/ModeRuntime.ts` (each changed only at its *Edit sites* anchors).
    12. **No dangling references** (LL-131): `npm run typecheck` exits 0 (`tsconfig` includes `src` and `tests`). Then `rg -l "useNarration|audioScheduler|generationPipeline|narrationPlanner|segmentNormalizer|ttsProviderRegistry|kokoroStrategy|NarrateModeAdapter|narrate/index" src tests main scripts preload.js main.js` prints only files in *Kept on purpose* (expected: none).
    13. **Gate:** `npm test` exits 0, `npm run build` exits 0, and `git diff --check refs/remotes/origin/main` exits 0. `tests/perf-baseline-results.json` is never staged.
    14. **Diff fence:** every path in `git diff --name-status refs/remotes/origin/main...HEAD` is one of these:
        - a `D` of a path in *Delete list*;
        - an `M` of a path in *Edit sites*;
        - an `A` of `tests/settingsMigrationV13.test.js`;
        - the sprint's staging memo or `docs/governance/close-outs/Timing.HB-1.jsonl` (LL-136 exemption).

        The close-out lists any exception with its reason.
    15. **Owner smoke** (SRL-053, SRL-058, LL-141): after `npm run build`, the owner starts the built app and records pass or fail per check in the close-out:
        - (a) the bottom bar shows Page, Focus and Flow only;
        - (b) N does nothing in any mode;
        - (c) Settings has no Narration page, and Ctrl+K has no narration entries;
        - (d) Page, Focus and Flow open, play and switch as before on *Meditations*;
        - (e) for a profile whose saved last mode was Narrate, Flow is marked as the last mode, and Play enters Flow at the saved word.
- **Effort:** high (cross-cutting; shared-core freeze set; about 30k source lines and 100 test files removed). Pre-split into 3 waves (LL-091, standing rule 10).
- **Owners:**
  - implementation agent;
  - reviewer for spec compliance and code quality, run in parallel (standing rule 7, SRL-012);
  - repository operator, who merges;
  - owner for Done-when 15.
- **Source:**
  - The held entry's alignment record: frames F1 and F6, assumptions A3–A5, and decisions "Removal depth" and "Removal placement".
  - The read-only import-graph census of `main` @ `45d45473` (2026-10-11).
  - Code read directly: `src/reader/useReaderModeOrchestrator.ts` `getNextSelectableMode`/`handleCycleAndStart` (lines 91–161); `main/sync-engine.js` `Object.assign(settings, …)` (lines 814, 1059); `src/components/settings/SpeedReadingSettings.tsx` "TTS-7C" ternary (129–135); `src/components/LibraryContainer.tsx` `updateSettings({ readingMode: "page" })` (255); `tests/readerModeBoundaries.test.ts` negative control (224–251); `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` `legacy`.
  - Line numbers are grep-verified against `main` @ `45d45473` on 2026-10-11 (standing rule 36). Re-verify at execution; anchors govern.
- **Path:** dispatch (3 waves).
- **Origin:** held plan — 2026-10-11-narrate-rebuild (HB-1), not yet on the roadmap.
- **Review focus:**
  1. **A stale `"narrate"` arriving through cloud sync**, which applies remote settings without migrations (`main/sync-engine.js` lines 814, 1059). This is covered by Done-when 3, and by construction: `getNextSelectableMode` sends any unknown value to `"focus"`, and no caller passes `lastReadingMode` to the router.
  2. **G4 baseline byte stability.** `fixtureReplay.tsx` must keep emitting the same `isNarrating`/`audio` observation fields. Covered by Done-when 11.
  3. **A leftover renderer path to Kokoro**: preload, `ElectronAPI`, or the test stub. Covered by Done-when 8.
  4. **Startup disk side effects**: cache cleanup at launch. Covered by Done-when 7.
  5. **The Flow surface guard after removing `narrate`** (LL-104). Covered by Done-when 11 (`flow.behavior`) and the updated `foliate-bridge` assertion.

##### Design decisions (planner, 2026-10-11; closable gaps resolved from the alignment record)

- **D1 — `src/utils/narrateDiagnostics.ts` stays, unchanged, along with the bug-report wiring** (`LibraryContainer`, `bugReportState`, `BugReportModal`). Page, Focus and Flow write to it through `ports.diagnostics.record` (F6). Its narration snapshot simply stays empty. Renaming it is the rebuild's call.
- **D2 — The in-app eval-trace plumbing stays.** That covers `src/types/eval.ts`, `diagnostics.trace` in the ports, `main.js` `setupTtsEvalTraceCapture`, and the `preload.js` bridge at lines 3–31. It is opt-in (LL-096) and is used by Flow and by the G6 live harness. A4 retires only the TTS eval *scripts* and the CI job.
- **D3 — "Dormant" means not started.** Remove `runKokoroWarmup` and the startup `ttsCache.init` and cleanup scheduling from `main.js`, so nothing loads the model or touches `userData` (A3). The Kokoro, marathon and cache IPC handlers stay registered in `main/ipc/tts.js`. They are unreachable, and `tests/tts-engine.test.js` stays unchanged.
- **D4 — The legacy dead cluster is deleted, not patched.** It has no production importer, and it imports deleted modules:
  - `src/components/FoliatePageView.tsx`;
  - `src/hooks/useReaderMode.ts`, `useFlowScrollSync.ts`, `useFoliateSync.ts`, `useReadingModeInstance.ts`, `useDocumentLifecycle.ts`.

  Their path strings **stay** in `boundary-policy.json` → `legacy`. That list holds forbidden targets, and the G1 negative control (line 238) reads `src/hooks/useReaderMode.ts` from it. `src/modes/*` stays for CLEANUP-MODE-BARREL-1.
- **D5 — Every settings key and type stays.** That covers `tts*`, `isNarrating`, `narrationProfiles`, `pronunciationOverrides`, `PronunciationOverride`, `TtsEngine`, `NarrationProfile`, and `DEFAULT_SETTINGS` (A3). Focus and Flow keep `isNarrating: false` in their `settings.update` patches, so the G4 baselines stay byte-identical.
- **D6 — Drop `"narrate"` from the types.** It goes from `ReaderMode`, `ReaderLastMode` and `ReaderModeId`. Migration v13 maps saved values. A stale synced value falls through safely (Review focus 1). The alias is never handled in a runtime hook (LL-121).
- **D7 — `ReaderPortAccessError` and `infrastructureResources` stay.** The ownership negative control stays unchanged.
- **D8 — `useReaderKeys` loses its `toggleNarration` and `enterNarrate` parameters.** Both callers are updated: `ReaderContainer.tsx` `useReaderKeys(` and `tests/readerKeyboard.test.tsx`. No unused positional parameter is left.
- **D9 — `extract-epub-words` stays in `main/ipc/tts.js`.** Moving it is not in scope.
- **D10 — F6 read precisely.** "Tests pass unchanged" means:
  - Page, Focus and Flow assertions are unchanged;
  - the three committed baselines are unchanged;
  - Narrate rows, Narrate cases and the Narrate share of counts are removed.

  For example, `readerModeIsolation` `crossings` becomes `toBeGreaterThanOrEqual(3)` if the router-to-index edges drop to 3.
- **D11 — F1's "opens in Flow" read precisely.** Every book opens in Page (`LibraryContainer.tsx:255`). A saved Narrate preference becomes Flow: Flow is marked as the last mode, and Play/Space enters Flow at the saved word.

##### Implementation detail

- **Edit sites:**
  - **Delete list** (a `git rm` of exact paths):
    - **Renderer Narrate:** `src/reader/modes/narrate/` (all 19 files, including `mode.css`, `index.ts` and `helpers/*`), `src/reader/modes/NarrateModeAdapter.ts`.
    - **Renderer hooks:** `src/hooks/useNarration.ts`, `src/hooks/narration/` (6 strategies), `src/hooks/useNarrationCaching.ts`, `src/hooks/useNarrationSync.ts`, `src/hooks/useQwenPrototypeStatus.ts`.
    - **Renderer utils:**
      - `audioScheduler`, `generationPipeline`, `segmentNormalizer`, `narrationPlanner`, `backgroundCacher`;
      - `ttsEvalTrace`, `streamAccumulator`, `ttsCache`, `timingMetadataStore`, `spokenWordFilter`, `voiceSelection`, `narratePerf`, `narrationContinuity`, `ttsCacheIdentity`, `qwenStatus`;
      - `ttsProviderRegistry`, `narrationPortability`, `audioPlayer`, `kokoroStatus`, `mediaSessionBridge`, `highlightSyncController`, `kokoroRatePlan`, `pronunciationOverrides`, `silenceAwareCursor`;
      - `audio/segmentKokoroChunk`, `audio/tempoStretch`.

      All are under `src/utils/`.
    - **Settings UI:** `src/components/settings/` `TTSSettings`, `CacheSizeDisplay`, `KokoroStatusSection`, `MossNanoStatusSection`, `NarrationDataSection`, `PauseSettingsSection`, `PocketTtsStatusSection`, `PronunciationOverridesEditor`, `QwenRuntimeSetupSection`, `QwenStatusSection`, `TtsEngineSelector`, `qwenStatusPresentation`, `ttsPreview`, `useKokoroSettingsStatus`, `useMossNanoSettingsStatus`, `usePocketTtsSettingsStatus`; and `src/styles/tts-settings.css`.
    - **Types and harness:** `src/types/qwenStreaming.ts`, `src/types/ttsCache.ts`, `src/types/ttsProvider.ts`, `src/test-harness/mock-kokoro.ts`.
    - **Legacy cluster (D4):** `src/components/FoliatePageView.tsx`, `src/hooks/useReaderMode.ts`, `src/hooks/useFlowScrollSync.ts`, `src/hooks/useFoliateSync.ts`, `src/hooks/useReadingModeInstance.ts`, `src/hooks/useDocumentLifecycle.ts`.
    - **Main:** `main/moss-nano-engine.js`, `moss-nano-sidecar.js`, `pocket-tts-engine.js`, `pocket-tts-sidecar.js`, `python-sidecar-adapter.js`, `python-sidecar-engine.js`, `sidecar-paths.js`, `qwen-engine.js`, `qwen-streaming-engine.js`.
    - **Scripts:**
      - `scripts/moss_nano_app_sidecar.py`, `moss_nano_electron_live_driver.mjs`, `moss_nano_live_capture.mjs`, `moss_nano_probe.mjs`, `moss_nano_probe.py`, `moss_nano_resident_probe.py`, `moss_preflight.mjs`, `moss_runtime_shape_probe.mjs`;
      - `pocket_tts_sidecar.py`, `qwen_preflight.mjs`, `qwen_streaming_sidecar.py`;
      - `tts_engine_scan_index.mjs`, `tts_eval_gate.mjs`, `tts_eval_metrics.mjs`, `tts_eval_profiles.mjs`, `tts_eval_runner.mjs`.
    - **Fixtures:** `tests/fixtures/narration/` (35 files), `tests/fixtures/tts-normalization/`.
    - **Tests (narration-only):**
      - **Audio and Kokoro:** audioGlide, audioPlayer, audioScheduler, audioSchedulerTempo, audioSchedulerUnderrun, calmNarrationBand, collapsingCursor, cursorNarrationSync, cursorSyncPauseBacklog, generationPipeline, heteronymDisambiguation, highlightSyncController, kokoroRateBuckets, kokoroRatePlan, kokoroStartupRecovery, kokoroStrategy, kokoroStrategyRateContinuity, mediaSessionBridge.
      - **MOSS:** mossNanoElectronLiveDriver, mossNanoEngine, mossNanoIpc, mossNanoLiveCapture, mossNanoProbe, mossNanoStrategy, mossProvisioning, mossRuntimeShapeProbe.
      - **Narrate and narration:** namedPause, narrTiming, narrateA5RateReseed, narrateDiagnostics, narrateModeAdapter, narratePauseResumeUnify, narratePerf, narrateRuntime, narrationContinuity, narrationControlsPolish, narrationCursorPolish, narrationCursorTrackingDiag, narrationIntegration, narrationPipelineIntegration, narrationPlanner, narrationPortability, narrationProfiles, narrationReducer, narrLayer1bConsolidation, perBookOverrides.
      - **Pocket and sidecars:** pocketTtsEngine, pocketTtsIpc, pocketTtsStrategy, pronunciationOverrides, pythonSidecarAdapter, pythonSidecarEngine.
      - **Qwen:** qwenDefaultSettings, qwenEngine, qwenPlaybackReliability, qwenProvisioning, qwenRuntimeHardening, qwenStatusUi, qwenStrategy, qwenStreaming, qwenStreamingHardening, qwenStreamingStrategy, qwenStreamingTypeContract.
      - **Segments and cursor:** segmentKokoroChunk, segmentNormalizer, silenceAwareCursor, spokenWordFilter.
      - **TTS sprints:** tts-integration, tts7a, tts7b, tts7c, tts7e, tts7f, tts7n, tts7o.
      - **TTS eval and settings:** ttsContinuityReadiness, ttsDiagnosticsBundle, ttsEngineScanCorpus, ttsEngineScanIndex, ttsEvalDiagnosticsBundle, ttsEvalGate, ttsEvalLifecycle, ttsEvalMatrixRunner, ttsEvalTrace, ttsParity, ttsPreviewTruth, ttsProviderRegistry, ttsSettingsDiagnosticsExport, ttsSettingsKokoroTruth, ttsSettingsMossNano, ttsSettingsPocketTts, ttsSettingsQwenPrototype.
      - **useNarration:** useNarration, useNarrationCaching, useNarrationMossNano, useNarrationMount, useNarrationQwen, useNarrationRateUpdate, webSpeechStrategy, wordTimingHeuristic.
      - **Legacy:** readerDecomposition, useReaderMode.
      - **Reader modes:** `tests/readerModes/narrate.behavior.test.tsx`, `narrate.contract.test.ts`, `narrateChunkCache.test.ts`.

      Each is the existing `tests/<name>.test.{ts,tsx,js}` file; the implementer resolves the extension with `git ls-files tests | rg "/<name>\.test\."`.
    - **CI:** the `quality-gate:` job in `.github/workflows/ci.yml`.
  - **Edit sites** (anchors from the census of `45d45473`):
    - **`src/reader/useReaderModeOrchestrator.ts`:**
      - drop `import { narrateMode }` and `narrate: narrateMode` from `READER_MODE_MODULES`;
      - narrow the unions in `getNextSelectableMode` (the cycle becomes focus → flow → focus), `handleSelectMode` and `ReaderModeRouter.select`;
      - delete `handleEnterNarrate` and `handleToggleNarration`, and remove them from the returned object.
    - **`src/reader/modes/ReaderModeAdapter.ts`:** `ReaderModeId` drops `"narrate"`; the `{ kind: "rate" }` member of the speed union (`// Narrate`) is removed.
    - **`src/reader/ports/ReaderPorts.ts`:** remove the audio imports and the `ReaderAudioStartResult`, `ReaderAudioState`, `ReaderAudioConfig` and `ReaderAudioPort` types, and remove `readonly audio: ReaderAudioPort;`. Keep `diagnostics.trace` (D2).
    - **`src/reader/ports/createReaderPorts.ts`:**
      - remove the audio entries of `READER_PORT_RELEASE_CALLS`, `PORT_METHODS.audio`, the audio keys in `CALLBACK_ARG`, `"audio.readState"` in `CACHED_READS`, the `audio.*` branches in `call()`, `throwingAudioPort`, the `key.mode === "narrate"` read-state seed, and the `audio:` group;
      - keep `ReaderPortAccessError` (D7) and the `"trace"` method (D2);
      - keep `"settings.update{isNarrating}"` only if a remaining caller needs it, else remove it.
    - **`src/components/ReaderContainer.tsx`** (shared-core freeze set):
      - remove the imports of `useNarration`, `createBackgroundCacher`, `resolveKokoroRatePlan`, `mergeOverrides`/`overrideHash` and `ReaderAudioConfig`;
      - remove the "TTS infrastructure (DD-3)" block (`readingModeRef`, `narration`, `narrationRef`, `backgroundCacherRef`), `mediaSessionRequestRef`, and the infrastructure `audio: { … }` group;
      - remove `handleEnterNarrate`/`handleToggleNarration` from the destructure and from the `useReaderKeys(` call (D8), the `isNarrating` local, and `|| readingMode === "narrate"` in `isScrolledSurfaceMode`;
      - `modePlaying` becomes `toolbar?.playing ?? false`;
      - remove the `kokoroPreload` delayed prewarm in the document-change effect, along with its `clearTimeout(prewarmTimer)`; the whole "TTS infrastructure (useNarrationCaching effects 1–4)" region; the `kokoro-loading-toast` JSX; the bottom-bar props `isNarrating=`, `onToggleNarration=`, `ttsRate=` and `narrationWordIndex=`; and `!narration.speaking` in the `ReturnToReadingPill` condition;
      - keep `recordDiagEvent` (D1), `createWindowEvalTraceSink`, `evalTraceSink` and `evalTrace:` (D2), the "TTS-6O pre-extraction" effect, and every e-ink line `tests/einkFoundation.test.ts` reads.
    - **`src/reader/modes/page/ModeRuntime.ts`:** remove the `KOKORO_UI_RATE_*`/`TTS_*_RATE` imports, `function stepKokoroUiSpeed`, the `if (settings.lastReadingMode === "narrate") { … }` branch in `adjustSpeed`, and `ttsRate`/`ttsEngine`/`ttsVoiceName` in `buildEngineConfig`.
    - **`src/reader/modes/focus/ModeRuntime.ts` and `src/reader/modes/flow/ModeRuntime.ts`:** remove `ttsRate:`/`ttsEngine:`/`ttsVoiceName:` in `startEngine`'s `ModeConfig`. Nothing else changes; `isNarrating: false` patches stay (D5).
    - **`src/modes/ModeInterface.ts`:** remove the `ttsRate?`/`ttsEngine?`/`ttsVoiceName?` fields.
    - **`src/components/ReaderBottomBar.tsx`:**
      - remove the `TTS_RATE_BASELINE_WPM` import; the props `isNarrating`, `onToggleNarration`, `ttsRate` and `narrationWordIndex`; and `"narrate"` from the `lastReadingMode` union;
      - remove `"N narrate"` from the flow key hint;
      - `surfaceMode` uses `readingMode` directly;
      - remove `isNarrationSelected`/`effectiveWpm` narration branches, so `narrationWordIndex ?? wordIndex` becomes `wordIndex`;
      - remove the Narrate `<button>`, the `Narrating` span and the `"Narrating · "` prefix.
    - **`src/components/ReaderSpeedDialog.tsx`:** remove the `NARRATE_SPEED_*` imports, `"narrate"` from `SpeedDialogMode`, the rate branch of `range()`/`speedAt`/`speedHundredths`/`formatSpeedValueText`, and `MODE_LABEL.narrate`.
    - **`src/hooks/useKeyboardShortcuts.ts`:** remove `toggleNarration?`/`enterNarrate?` from the interface, `case "narrate":` in `getReaderKeyboardModeSurface`, both parameters and their `stateRef` copies (D8), the KeyN `enterNarrate` binding, and the `readerMode === "narrate"` block.
    - **Settings and palette:**
      - `src/components/CommandPalette.tsx`: remove the `"Narration (TTS)"` entry and the four `onOpenSettings("tts")` entries after the `TTS-7N (BUG-137)` comment.
      - `src/components/SettingsMenu.tsx`: remove `import { TTSSettings }`, the `{ id: "tts", … }` item and the `activeSubPage === "tts"` block.
      - `src/components/MenuFlap.tsx`: remove `tts: "Narration (TTS)",` in `TITLES`.
      - `src/components/settings/HotkeyMapSettings.tsx`: remove the `"Toggle narration"` rows.
      - `src/components/HotkeyCoach.tsx`: remove the `narration:` entry.
    - **`src/styles/index.css`:** remove `@import "./tts-settings.css";`. Also remove `.kokoro-loading-toast` in `src/styles/page-reader.css`, now orphaned.
    - **`src/types.ts`:**
      - delete the Kokoro/Qwen/MossNano/PocketTts status, preflight and response types (the block starting `export type KokoroEngineStatus`, through the `PocketTts*` types);
      - delete the imports from `./types/qwenStreaming` and `./types/ttsCache`, and the `ElectronAPI` members from `kokoroPreload` through `ttsCacheInfo`; keep `extractEpubWords?`;
      - drop `"narrate"` from `ReaderMode` and `ReaderLastMode`;
      - keep every settings field and type (D5).
    - **`src/constants.ts`:**
      - **Keep:** `TTS_PAUSE_*`, `TTS_DIALOGUE_SENTENCE_THRESHOLD`, `TTS_FOOTNOTE_MODE`, `TTS_DEFAULT_ENGINE`, `TTS_DEFAULT_VOICE_NAME`.
      - **Delete:**
        - `NARRATE_SPEED_*`;
        - `TTS_CHUNK_SIZE`, `TTS_MAX_RATE`, `TTS_MIN_RATE`, `TTS_RATE_BASELINE_WPM`, `TTS_WPM_CAP`, `TTS_RATE_STEP`, `TTS_QUEUE_DEPTH`, `ENTRY_COVERAGE_TARGET_MS`, `TTS_COLD_START_CHUNK_WORDS`, `TTS_CRUISE_CHUNK_WORDS`, `TTS_CROSSFADE_MS`, `TTS_CURSOR_TRUTH_SYNC_INTERVAL`, `TTS_FORWARD_WORDS`, `TTS_PLANNER_*`;
        - `NARRATION_BAND_MIN_WIDTH_PX`, `NARRATION_CURSOR_LAG_MS`, `TTS_TRUSTED_CURSOR_LAG_MS`, `TTS_SILENCE_HOLD_THRESHOLD_MS`;
        - `QWEN_*`, `TTS_STREAM_*`, `NARRATE_*_BUDGET_MS`, `NARRATE_BG_EXTRACT_DELAY_MS`, `MAX_PRONUNCIATION_OVERRIDES`, `TTS_NORMALIZER_VERSION`, `TTS_CACHE_SCHEMA_VERSION`, `TTS_TIMING_SIDECAR_EXTENSION`, `MAX_NARRATION_PROFILES`;
        - `normalizeSelectableTtsEngine`, `createDefaultNarrationProfile`, `profileFromSettings`, `resolveNarrationProfile`;
        - `KOKORO_UI_RATE_*`, `KOKORO_RATE_BUCKETS`, `KokoroRateBucket`, `KOKORO_DEFAULT_RATE_BUCKET`, `KOKORO_LIVE_RATE_*`, `resolveKokoroBucket`, `stepKokoroBucket`, `KOKORO_MODEL_ID`, `KOKORO_MODEL_DTYPE`, `KOKORO_DEFAULT_VOICE`, `KOKORO_SAMPLE_RATE`, `KOKORO_VOICE_NAMES`;
        - `NARRATION_RENDER_WAIT_MS`, `TTS_RATE_RESTART_DEBOUNCE_MS`, `TTS_RATE_CONFIRMING_MS`, `TTS_RATE_SET_DISPLAY_MS`.

        Delete a constant only when `rg -n "<NAME>" src tests` shows no remaining reader; otherwise keep it and list it in the close-out.
    - **`src/types/narration.ts`:** keep `SectionBoundary` only. Delete `findSectionForWord`, `globalToLocal`, `BookWordArray`, the narration state machine, `TtsStrategy` and the `Kokoro*` types.
    - **`src/test-harness/electron-api-stub.ts`:** remove the `mock-kokoro` import, `stubTtsCache`, the Kokoro, Qwen and TTS-cache sections, and the `onKokoro*`/`onQwen*` listeners, in step with `ElectronAPI`.
    - **`main.js`:** remove the `runKokoroWarmup` call and definition from `scheduleBackgroundStartupTasks`, `runCacheCleanup`/`scheduleCleanupOrphans`, and the startup `ttsCache.init(…)` (D3). Keep the eval-trace capture (D2).
    - **`preload.js`:** delete everything from `// Kokoro TTS` through `ttsCacheOpeningCoverage`. Keep `extractEpubWords` and the eval-trace bridge at lines 3–31 (D2).
    - **`main/ipc/tts.js`:** delete `QWEN_DISABLED_*`, `ENGINE_DORMANT_REASON`, `NANO_DORMANT_DETAIL`, `POCKET_DORMANT_DETAIL`, `qwenDisabled*`, `dormantStatus`/`dormantError`, `toNanoErrorResponse`/`toPocketErrorResponse`, and the `tts-nano-*`, `tts-pocket-*` and `tts-qwen-*` handlers. Keep the Kokoro, marathon, `tts-cache-*` and `extract-epub-words` handlers (D3, D9).
    - **`main/migrations.js`:** `CURRENT_SETTINGS_SCHEMA` goes from `12` to `13`. Append after the `// v11 → v12` entry: `// v12 → v13: Narrate removed (HB-1) — a saved narrate mode becomes flow` with `(data) => { if (data.readingMode === "narrate") data.readingMode = "flow"; if (data.lastReadingMode === "narrate") data.lastReadingMode = "flow"; data.schemaVersion = 13; return data; }`. `isNarrating` is untouched. The write path stays the existing atomic writer (LL-006, PR-10).
    - **`package.json`:**
      - remove `scripts/moss_nano_app_sidecar.py` and `scripts/pocket_tts_sidecar.py` from `build.files` and `build.asarUnpack`;
      - remove the scripts `moss:preflight`, `moss:nano:resident`, `tts:eval`, `tts:eval:matrix`, `tts:eval:matrix:gated`, `test:quality`, `tts:eval:soak:short`, `tts:eval:gates`, `tts:scan:index`, `tts:scan:validate`;
      - change no dependency.
    - **Census (`docs/planning/roadmap-reviews/reader-mode-separation-2/census/`):**
      - `boundary-policy.json`:
        - remove `"narrate"` from `modes`;
        - remove every `privateCopyMap` entry with `"mode": "narrate"`;
        - remove `src/reader/modes/narrate/helpers/foliateHelpers.ts` from `allowedModuleSingletons` and `src/reader/modes/NarrateModeAdapter.ts` from `legacyRetainedFiles`;
        - remove deleted files from `shellInfrastructure`;
        - keep `legacy` unchanged (D4).
      - `ownership.json`: drop `"narrate"` from `privateCopiesFor`.
    - **Tests (mixed):** edit only the Narrate parts.
      - **Reader-mode suites:** `readerModeIsolation`, `readerModeOwnership`, `readerModes/harness/fixtureReplay.tsx` (observation output byte-stable, Review focus 2), `readerModes/harness/fakePorts.ts`, `readerModes/harness/contractAssertions.ts`, `readerModes/flow.behavior`, `readerModes/chunkVisualParity`, `readerModes/foliateViewTeardown`, `readerModes/arrivalCursor`, `readerModeAdapterContract`.
      - **Foliate helpers:** `foliateAnchorNavigation`, `foliateChunkHighlight`, `foliateWordHighlight`, `persistentReadingAnchor`.
      - **Controls and shortcuts:** `readerSpeedDialog`, `readerBottomBarControls`, `readerModeControls`, `useKeyboardShortcuts`, `readerKeyboard`, `wordAnchor`.
      - **Source-text and structural suites:** `foliate-bridge` (drop the top-level `FoliatePageView` read; the `isScrolledSurfaceMode` assertion becomes Flow-only), `phase0Stabilization`, `componentStyleCleanup`, `perfAudit` (the "keeps Kokoro warm-up" test becomes an absence assertion; the "voice sync useEffect" describe goes; `manualChunks` tests unchanged), `startupStabilization`, `packageReleaseTruth`, `perf-baseline`.
      - **Diagnostics and legacy:** `bugReportDiag` (keep the D1 parts), `tts7j`, `tts7k`, `tts7l`, `tts7m` (drop the Narrate diagnostics describes), `documentLifecycleModeRestore`, `useReadingModeInstance` (drop the legacy describe), `currentWordAnchor` (drop `setActiveMode("narrate")`), `electronApiStubGoals` (drop the Qwen compatibility test).
  - **Kept on purpose:**
    - `main/tts-engine.js`, `tts-worker.js`, `sharp-stub.js`, `tts-engine-marathon.js`, `tts-cache.js`, `tts-opus.js`, and the Kokoro constants in `main/constants.js`;
    - `scripts/kokoro_voice_mix_probe.mjs` and its test (a Kokoro probe for the rebuild's Phase 0);
    - `scripts/check_reader_mode_evidence.mjs` and `fixtures/narrate.baseline.json` (separation evidence);
    - `vite.config.js`;
    - `src/utils/narrateDiagnostics.ts`, `src/utils/dualSourceDiag.ts`, `src/types/eval.ts`, `src/utils/pauseDetection.ts`, `src/utils/naturalChunks.ts`;
    - `docs/testing/tts_*.json`.
- **Tests:**
  - **New:** `tests/settingsMigrationV13.test.js` (Done-when 6), using the `require("../main/migrations.js")` pattern of `tests/ttsEngineDeactivation.test.js`.
  - **New assertions** in `tests/readerBottomBarControls.test.tsx` (Done-when 3) and in the registry test of `tests/readerModeIsolation.test.ts` (Done-when 2).
  - **Modified:**
    - `tests/perfAudit.test.ts`: the "keeps Kokoro warm-up" test's assertion that `main.js` contains `runKokoroWarmup` becomes `expect(mainSource).not.toContain("runKokoroWarmup")`.
    - `tests/foliate-bridge.test.ts`: line 94's expected `isScrolledSurfaceMode` string drops `|| readingMode === "narrate"`.
- **Constants:** none added. `CURRENT_SETTINGS_SCHEMA` goes from 12 to 13.
- **Branch:** `eb/hb-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\hb-1`. Write refs in full.
- **Staging plan:** exact paths only. Use `git rm <path>` for deletions and `git add <path>` for edits; never `git add -A`. Never stage `tests/perf-baseline-results.json`.
  - **Wave A:**
    - C1: `tests/settingsMigrationV13.test.js` (positive control, failing).
    - C2: the renderer Narrate, hooks, utils, settings UI, CSS, types and constants deletions and edits, plus the router, ports, container, bottom bar, speed dialog, shortcuts and palette edits. `npm run typecheck` must be green, or red only in `tests/`, at commit time.
  - **Wave B:**
    - C3: the legacy cluster and the census JSON.
    - C4: main, preload, migration, `package.json`, CI and scripts.
    - C5: the test deletions and edits.
  - **Wave C:** C6 for the staging-memo fold-ins. Then merge to `main` with `--no-ff` from a clean integration worktree and push (Rule 5b).
- **Failure handling:**
  - **A typecheck or test error in a file outside *Edit sites* that only references a deleted module:** remove the reference and list the file in the close-out. If the error is in Page, Focus or Flow runtime logic beyond the named lines, **stop**: open an issue and use `/mid-dispatch-decision`.
  - **Any byte change to `page`, `focus` or `flow.baseline.json`, or a G4 replay diff:** **stop**, never rebaseline. The harness must keep its observation output identical.
  - **A full-suite failure:** if it is only a 10 s timeout in the known-flaky node IDs (KF-1, KF-2 and KF-3, as named in the separation close-out) and the test passes alone, re-run once on a quiet machine. If it persists, raise a BLOCKER(USER) with the evidence. No self-waiver.
  - **Build failure from a dangling CSS `@import` or dynamic import:** fix that reference only.
  - **Retry ceiling:** two corrections per task, then BLOCKER(USER).
  - **Rollback:** `git revert -m 1 <merge sha>` restores everything, because no user data is touched.
- **Lane ownership (parallel run):**
  - **Owned surfaces:** A, C and D (renderer runtime, UI and main process).
  - **Shared-core freeze set:** this sprint owns it for its duration. It edits `src/components/ReaderContainer.tsx` and `src/types.ts`, and deletes `src/hooks/useNarration.ts` and `useFlowScrollSync.ts`.
  - **Forbidden during a parallel run:** nothing else may edit the freeze set or `src/reader/**`. The e-ink hover fix (`src/styles/themes.css`) is file-disjoint and may run in parallel.
  - **Merge order:** after the e-ink hover fix and the command-palette settings fix.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Base measured; v13 migration positive-control test committed and failing | calculable | positive control | mechanical | low | 30m (npm ci + base gate + one test file) | — | — |
| 2 | Renderer free of Narrate: mode, hooks, utils, types, constants, settings UI and CSS removed; router, ports, container, bottom bar, speed dialog, shortcuts and palette updated (Wave A) | calculable | renderer removal | cross-cutting | high | 3h (about 22k lines deleted, 20 files edited) | — | — |
| 3 | Legacy dead cluster removed and separation census updated | calculable | legacy removal | bounded | medium | 45m (6 deletions, 2 JSON edits) | — | — |
| 4 | Main process, preload and packaging cleaned; Kokoro dormant; v13 migration green | calculable | main-process removal | bounded | medium | 1h30m (9 deletions, 5 edits, 16 scripts) | — | — |
| 5 | Tests reconciled: narration-only tests deleted, mixed tests edited, G1–G4 green with baselines byte-identical | calculable | test reconciliation | cross-cutting | high | 3h (about 103 deletions, 30 edits) | — | — |
| 6 | Full gate and reference census green (typecheck, test, build, diff fence) | calculable | verify gate | mechanical | low | 45m (3 full runs plus the rg census) | — | — |
| 7 | Spec compliance and code quality reviewed | calculable | review | bounded | medium | 40m (two read-only reviews in parallel) | — | R |
| 8 | Owner smoke on the rebuilt app recorded | calculable | owner smoke | mechanical | low | 15m (5 live checks) | — | R |
| 9 | Staging fold-ins written; merged to main and pushed | calculable | merge and docs | mechanical | low | 40m (fold-ins plus one --no-ff merge) | — | — |

**Total:** chain 10h50m · sum 11h05m; 0 of 9 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **LL-131** — the reference census, not identifier matching, decides deletions. Done-when 12 runs typecheck plus an `rg` over references; the delete list comes from a resolved import graph.
- **LL-139** — the delete and edit lists come from an import-graph census of `main` @ `45d45473`, not a file inventory. This surfaced `narrateDiagnostics` (D1), eval trace (D2) and the legacy cluster (D4).
- **LL-128** — every path in the delete and edit lists was verified to exist on `45d45473`. Done-when 1 re-checks the absences.
- **LL-117** — the forbidden scope (Page, Focus and Flow runtime logic, the three G4 baselines, separation evidence) and the *Kept on purpose* list are decided up front.
- **LL-106** — the TTS IPC removal is three-way and in step: the `main/ipc/tts.js` handlers, the `preload.js` methods, and the `ElectronAPI` members plus the test stub.
- **LL-104** — the Flow surface guard `isScrolledSurfaceMode` is narrowed explicitly, and Flow follow behaviour is guarded by G4 (Done-when 11).
- **LL-121** — the saved-`narrate` fallback is a settings migration (v13), not an alias in a runtime hook (D6).
- **LL-138** — the v13 migration test is a positive control that fails on the base (Done-when 6).
- **LL-068** — large edits to `types.ts`, `constants.ts` and `ReaderContainer.tsx` are checked with `git diff --stat` for unexpected truncation before each commit.
- **LL-091** — the sprint is pre-split into three waves (A renderer; B legacy, main and tests; C verify, review, merge).
- **LL-135** — the pointer carries the reconciliation recipe through a committed path (this file on `main`).
- **LL-136** — the diff fence (Done-when 14) names the timing-log and staging-memo exemptions.
- **LL-141** — the owner's live smoke check (Done-when 15) covers what automation cannot reach.
- **LL-006** — the v13 migration writes through the existing atomic settings writer.

##### Rubric walk (v1.2; no project extensions)

U1 scope ✓ · U2 edit sites ✓ (census of `45d45473`; anchors named) · U3 tests ✓ (new tests named with assertions; modified assertions quoted) · U4 acceptance ✓ (15 rows, each with its command) · U5 prerequisites: wait encoded (reconciliation step 2) · U6 failure handling ✓ (cases, retry ceiling, rollback) · U7 source ✓ (no TBD) · U8 repository plan ✓ · U9 lessons ✓ (`lessons --check`) · U10 task list ✓ (`timing --rows-from-spec`)
