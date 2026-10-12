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
| 2026-10-11 | storyboarded | storyboard | reopened for review G1-G8: F1 corrected (owner G2: saved Narrate preference becomes Flow; G6: rollback keeps flow) |
| 2026-10-11 | planned | write-plan | HB-1 revision 3: two adversarial reviews applied (G1-G8 + 7 follow-ups; D12-D15, Done-when 16); rubric v1.2 PASS (U9, U10 mechanical; closure check v2 self-test 7/7, 0 on main); prerequisites pending: LIBRARY-SETTINGS-FIX-1 close-out, EINK-HOVER-FIX-1; Rule 5a queue depth 2 |
| 2026-10-11 | absorbed | roadmap-review | as NARRATE-REMOVE-1 (queued, full-spec, from HB-1) and NARRATE-REBUILD-1 (Path: epic, blocked stub) |

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
| A1 Speech starts within 2 s of Play or a word click. A speed change takes effect within 2 s. No audible stall at chunk, section or chapter boundaries | confirmed (owner, 2026-10-11). Scope (OutsideAudit.10 owner ruling R3, 2026-10-11): 2 s once the voice is ready; a cold start is F5 and must speak within 8 s. |
| A2 Speed range stays 0.80–2.00x in 0.05 steps. Audio is generated at the chosen speed and never stretched afterwards, because stretching breaks the exact word table | confirmed |
| A3 The removal deletes no user data. Saved voice, speed, overrides and profiles stay in settings. The audio cache (up to 2 GB) and the Kokoro model stay on disk. A book saved in Narrate mode opens in Flow | confirmed |
| A4 The removal also retires the old TTS quality-gate CI job and its eval scripts; the rebuild brings its own checks | confirmed |
| A5 The new Narrate plugs into the mode framework from READER-MODE-SEPARATION-2. Page, Focus and Flow change only at registration and in the bottom bar | confirmed |
| A6 One voice to start (current default af_bella); the voice picker returns later | confirmed |
| A7 No hard deadline; the next roadmap review places a new finish line | confirmed |
| A8 Kokoro's word table can be exact for the audio it generates, because its predicted durations drive the synthesis. The installed model does not output those durations today (OutsideAudit.10 F3: outputs `waveform` only), so the table must first be produced | accepted, corrected after OutsideAudit.10. With `pred_dur` exposed in a scratch copy, waveform samples = 600 × Σpred_dur exactly. Guard: Rebuild Phase 0 (P0-1 to P0-5, ROADMAP NARRATE-REBUILD-1) produces and verifies it. Export, adapter, unit or mapping failures are repaired and rerun; only a failure under a verified contract sends the engine choice to a bake-off |

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
| Saved Narrate preference (review G2) | Flow is remembered: Page unchanged; click Flow, then Play | the owner | 2026-10-11 |
| Rollback of the v13 migration (review G6) | Keep "flow": a code revert keeps migrated preferences, and the settings backup is not restored | the owner | 2026-10-11 |
| Durations-bearing model (OutsideAudit.10 R2) | A deterministic, hash-checked local graph edit of the pinned `model_q4.onnx`, with no download, stored beside the untouched original. An export, adapter, unit, mapping or harness failure is repaired and Phase 0 reruns; only a failure under a verified P0-1/P0-2 contract goes to the bake-off | the owner | 2026-10-11 |
| Cold-start scope of the 2 s target (OutsideAudit.10 R3) | 2 s once the voice is ready; a cold start shows "voice loading" and must speak within 8 s of Play. Both numbers are fixed before measurement; a cold result above 8 s is a visible fail | the owner | 2026-10-11 |
| Boundary accuracy (OutsideAudit.10 R4) | Worst error at most 30 ms at every boundary the waveform-only reference resolves; reference uncertainty at most 10 ms, otherwise inconclusive; a 40 ms shifted-boundary control must be caught; no manual annotation | the owner | 2026-10-11 |
| Device output delay (OutsideAudit.10 R5) | No per-device delay calibration on day one; Phase 0 documents its output route and records the reported output latency with a one-off probe outside the offline harness (`AudioContext.baseLatency` and `outputLatency` in an Electron renderer on the owner's default device), and no Phase 0 pass rule depends on it; revisit only if the listening sign-off hears the cursor lead | the owner | 2026-10-11 |
| Cursor during silence (OutsideAudit.10 R6) | The last spoken word stays highlighted; the cursor never advances to the next word early | the owner | 2026-10-11 |
| Speed change mid-word (OutsideAudit.10 R7) | The current word finishes at the old speed; the new speed starts from the next word | the owner | 2026-10-11 |
| Old audio cache (OutsideAudit.10 R10) | Stays on disk untouched; version one plays freshly generated audio only and never plays the cache or reads its timing | the owner | 2026-10-11 |
| Phase 0 timing (OutsideAudit.10 R11) | Phase 0 code starts after the removal merges; the `/epic` charter (docs only) may be written while it runs | the owner | 2026-10-11 |

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
   - a saved Narrate preference becomes Flow: books still open in Page, Flow is marked as the last mode, clicking Flow opens it paused at the saved word, and Play starts it there;
   - your saved voice and speed are still in your settings, and nothing on disk is deleted.

   *(confirmed. Corrected by the owner on 2026-10-11, after the adversarial review's G2: books always open in Page, and Play does nothing in Page, so "opens in Flow" was replaced. The owner chose "Flow is remembered" over pulling UX-POLISH-1's Page change into the removal.)*
2. **F2 Main success.** Given the rebuilt Narrate on *Meditations*, when you click "ancient" mid-paragraph and press Play, then:
   - "ancient" is the first word heard, within 2 s once the voice is ready (a cold start is F5; OutsideAudit.10 owner ruling R3);
   - the highlight sits on each word exactly while it is spoken, and recorded output shows every cursor change on the word change;
   - it reads from the Introduction into "HIS FIRST BOOK" with no stall, and the highlight comes along.

   *(confirmed)*
3. **F3 Speed change.** Given narration at 1.00x, when you switch to 1.40x, then within 2 s the voice continues at 1.40x from the next word. There is no overlap, distortion or sentence restart, and the cursor stays attached. *(confirmed)*
4. **F4 Exact timing missing.** Given the engine returns a chunk whose word table is missing or does not match its audio, when that chunk would play, then:
   - narration pauses on the last exactly-timed word;
   - a short notice says the passage couldn't be timed, and a diagnostic is logged;
   - the chunk is never played with a guessed cursor.

   *(confirmed)*
5. **F5 Voice not ready.** Given the Kokoro model is still loading, when you press Play, then you see a clear "voice loading" state, and speech starts on your word once it is ready. It never hangs silently. Speech starts within 8 s of Play from a cold start (OutsideAudit.10 owner ruling R3). *(confirmed)*
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

> Superseded for Phase 0 and the core contract by ROADMAP.md NARRATE-REBUILD-1 (revised after OutsideAudit.10, 2026-10-11), which governs where the two differ.

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

**Revision 2 (2026-10-11), after an adversarial review** that found seven specification gaps (G1–G7) plus a launch gate (G8). Every finding was verified against the source before this revision:
- **G1:** retained diagnostics and trace depended on deleted files.
- **G2:** "Play enters Flow" contradicted Page.
- **G3:** cloud sync can persist `narrate` after v13.
- **G4:** Wave A could not meet its typecheck gate.
- **G5:** the reference gates false-failed, and test names did not resolve.
- **G6:** "revert restores everything" was false.
- **G7:** the recipe could not tell its own interrupted run from another run.
- **G8:** queue depth is 2.

The owner decided G2 ("Flow is remembered") and G6 ("keep 'flow'"); both are recorded in the storyboard above. The others are closed below with mechanical evidence.

**Revision 3 (2026-10-11), after a second review of revision 2.** Five blocking findings and two smaller ones, each verified against source:
- **R1, intake order:** the recipe required `planned`, but the `virtuoso` intake records `in-flight` *before* running it. The recipe now starts from `in-flight`, takes ownership from the intake and the owner, and works out the run's position from the repository (D14).
- **R2, startup binding:** `normalizeReaderModes` was never added to `main.js`'s `require` destructure. Startup now calls an imported `loadSettingsData`.
- **R3, stale census entry:** `src/types/narration.ts` becomes type-only, so it leaves `shellInfrastructure`.
- **R4, checker coverage:** the checker missed side-effect imports and exited 0 on findings. It is now TypeScript-scanner based, exits 1 on any finding, has a self-test (7 of 7 forms reported; a string and a comment ignored), and its baseline is 0.
- **R5, ingestion tests:** they reconstructed behaviour instead of exercising it. They now drive the production seams `loadSettingsData` and `applyCloudSettings`, with omission controls.
- **Smaller:** the `src/modes` scope now exempts `ModeInterface.ts`, and `tests/narrateDiagnostics.test.ts` keeps its store tests.

### Readiness

| Finding | Result |
|---|---|
| **Specification** | Rubric v1.2 U1–U4, U6, U7, U9 and U10: see *Rubric walk* under HB-1. No project extensions are declared. **Closure evidence (revision 3, rerun with TypeScript's import scanner and the revision 3 delete list):** a census of `45d45473` leaves 17 retained files importing a deleted file, and every one is a named edit site. For the Wave A slice alone, the source side is 8 files, all Wave A edit sites; the 141 test-side edges are allowed red until Wave B. The removal tree itself has not been typechecked, tested or built; Wave A's first typecheck is the first execution check. |
| **Prerequisites** | **Pending, with the wait encoded.** Reading-mode separation (READER-MODE-SEPARATION-2) is `completed`. The command-palette settings fix (LIBRARY-SETTINGS-FIX-1) has its code on `main` (`8c41095e`), but the register still reads `queued` until its close-out runs. The e-ink hover fix (EINK-HOVER-FIX-1) reads `queued`; it is an ordering point only, by the owner's placement. |
| **Repository** | `origin/main` carries this held plan. No worktree or branch is in flight on HB-1's edit sites (`git worktree list`, 2026-10-11). |
| **External register** | Readable: monday board 18432450217 via its connector snapshot, read-only. Nothing is written to it by this plan. **Queue depth is 2 queued items, below Rule 5a's minimum of 3.** Rule 5a pauses implementation until `/roadmap-review` backfills; that is governance work outside this plan. |
| **Execution environment** | Windows host with Node and npm; `npm ci`, `npm run typecheck`, `npm test` and `npm run build` all ran on this machine on 2026-10-11. No credentials or network services are needed. The owner is needed for the live smoke check (Done-when 16). |

**Not executable now.** Three conditions block it:
1. LIBRARY-SETTINGS-FIX-1 must read `completed` in the register.
2. EINK-HOVER-FIX-1 must read `completed` in the register, by the owner's placement.
3. The queue must be backfilled to at least 3 (Rule 5a).

### Roadmap placement

`Placement: after Stop the e-ink hover rule wiping overlay backgrounds (EINK-HOVER-FIX-1) and Fix command-palette settings routing and live New-dot clearing (LIBRARY-SETTINGS-FIX-1), before the Narrate rebuild (epic, this entry) and Remove the unused mode barrel and update structural tests (CLEANUP-MODE-BARREL-1) — Reader Engine lane (primary), TTS / Narration Engine (secondary); no declared deadline (mode-separation is met); placed by the owner 2026-10-11: removal right after the two small fixes.`

It runs ahead of nothing. CLEANUP-MODE-BARREL-1 follows it, because HB-1 deletes `src/hooks/useReadingModeInstance.ts`, the barrel's only importer. The four narration items (NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1, NARRATE-SUBSCRIBER-CURSOR-1 and KOKORO-EXPORT-1) are superseded; retiring them is the review's call.

### Pointer

```
Narrate removal (keep Kokoro dormant)  (HB-1)
Origin: held plan — 2026-10-11-narrate-rebuild (HB-1), not yet on the roadmap
Placement: after EINK-HOVER-FIX-1 and LIBRARY-SETTINGS-FIX-1, before the Narrate rebuild epic and CLEANUP-MODE-BARREL-1 — for the review to apply
Effort: high (3 waves)
Branch: eb/hb-1 from the current refs/remotes/origin/main (it carries this plan, revision 2)
Specification: docs/planning/holding/2026-10-11-narrate-rebuild.md#hb-1--narrate-removal-keep-kokoro-dormant
Status: planned — held | Prerequisites: READER-MODE-SEPARATION-2 met; LIBRARY-SETTINGS-FIX-1 pending close-out; EINK-HOVER-FIX-1 (ordering) pending; queue depth 2 (Rule 5a)
Readiness: specification ✓ · prerequisites ✗ (wait encoded) · repository ✓ · register ✓ (queue below 3) · environment ✓
```

### Repository reconciliation — run this FIRST

For the `virtuoso` skill. `policy.git` = `push`, network operations allowed, remote `origin`, default branch `main`, and the template `eb/{item-id}`. Run the commands from `C:\Projects\Blurby` unless noted, and write refs in full, because a `main/` directory exists.

**Where this recipe sits in the intake (revision 3).** The `virtuoso` skill's held-plan intake runs first, in this order:
1. It reads the entry state. `planned` → continue. `in-flight` → **stop and ask the owner**. The owner's confirmation that the `in-flight` run is this work's own interrupted run is the only ownership authority; without it, the run never reaches this recipe.
2. It runs the conflict check.
3. It records `in-flight` with the note `executing: eb/hb-1`.
4. It runs this recipe.

So this recipe always starts with the entry `in-flight` and the owner as the confirmed owner. Ownership is decided before the recipe; the recipe decides only *where in the work* the run is.

1. `git fetch origin --prune`.
2. **STOP unless** both of these read `completed` in `& "$HOME/.virtuoso/bin/virtuoso.ps1" virtuoso_registry --root . items --all --json`: LIBRARY-SETTINGS-FIX-1 and EINK-HOVER-FIX-1. Also stop unless the register shows at least 3 queued items (Rule 5a).
3. **Classify by repository state.** Check `git branch -a --list "*hb-1*"` and `git worktree list`:
   - **(A) Start:** there is no `eb/hb-1` branch (local or remote) and no `hb-1` worktree. This covers a fresh run *and* a run interrupted before its branch was created.
     - Run `git worktree add C:\Projects\Blurby\.worktrees\hb-1 -b eb/hb-1 refs/remotes/origin/main`.
     - The base is that `refs/remotes/origin/main` sha. Go to step 4.
   - **(B) Resume:** `eb/hb-1` exists, and all of these hold:
     - `base` = `git merge-base refs/heads/eb/hb-1 refs/remotes/origin/main`. If C1 exists, `base` equals the `HB-1-Base:` trailer in C1's message (`git log -1 --format=%B <C1 sha>`).
     - Every commit in `git log --reverse --format=%s <base>..refs/heads/eb/hb-1` starts with `HB-1 C<n>:`, numbered from 1 with no gaps.
     - If `C:\Projects\Blurby\.worktrees\hb-1` is missing, re-attach it with `git worktree add C:\Projects\Blurby\.worktrees\hb-1 eb/hb-1` (no `-b`).
     - Its `git status --porcelain` lists only paths that belong to the next commit, C<n+1>, in *Staging plan*. It ignores `tests/perf-baseline-results.json`, which every `npm test` rewrites and which is never staged.

     Then resume at C<n+1> in that worktree. If n = 0 (the branch was created but C1 was never committed), do step 4 first. If n = 5 (all commits made), the next step is Wave C's integration merge. First check `git merge-base --is-ancestor refs/heads/eb/hb-1 refs/remotes/origin/main`: if it succeeds, the work is already on `main`, so skip the merge and go to `/pointer-closeout`. Otherwise run the merge from a clean integration worktree.
   - **(C) Conflict:** anything else. Examples: a remote-only `eb/hb-1`, a branch whose commits lack the `HB-1 C<n>:` prefix, a base that does not match the C1 trailer, or dirt outside C<n+1>. **STOP.** Preserve every branch, worktree and file (no reset, clean, stash or delete), write an issue file, and use `/mid-dispatch-decision`.

   **Scenario walk-through:**
   - **Fresh start:** the intake moves the entry from `planned` to `in-flight` → (A).
   - **Interrupted before branch creation:** the next session's intake finds `in-flight` and asks; the owner confirms → (A).
   - **Interrupted after C2:** the owner confirms; the branch has C1 and C2, and the trailer matches → (B), resume at C3.
   - **Conflicting ownership:** the owner does not confirm, so the intake stops before this recipe; or the repository state fits neither (A) nor (B) → (C).
4. **Start only** ((A), or (B) with n = 0), in `C:\Projects\Blurby\.worktrees\hb-1`:
   - For (A), `git status --porcelain` must be empty.
   - Run `npm ci`.
   - **Base measurement** (red-base rule): record the exit codes of `npm run typecheck`, `npm test` and `npm run build`, and any failing node IDs.
   - Run the *Closure check* with `--self-test` (exit 0) and on `.` (it must print `dangling relative imports: 0` and exit 0).
   - Write all of these results into C1's commit body, ending with the trailer line `HB-1-Base: <base sha>`, so they survive an interruption.
   - A red base goes to an issue file, not into this sprint.

### Specifications

#### HB-1 — Narrate removal (keep Kokoro dormant)

- **What:** Remove the Narrate reading mode and all narration logic from Blurby:
  - Narrate's mode, view and helpers, and every narration hook, strategy and utility;
  - the narration types and constants, the TTS settings screens and CSS;
  - the Narrate button, shortcut, palette and settings entries;
  - the dormant MOSS-Nano, Pocket and Qwen engines, their IPC, sidecars and scripts;
  - the TTS evaluation scripts and the CI `quality-gate` job;
  - the legacy dead cluster that imports narration.

  Keep the Kokoro engine in the main process (`tts-engine`, `tts-worker`, the marathon worker, the cache and opus modules, and their IPC handlers), **unreachable**: there is no preload method and no `ElectronAPI` member, and it does not start at app launch.

  Normalize a saved `narrate` reading mode to `flow` everywhere settings enter the app: in migration v13, when an already-current settings file is loaded, and after each cloud-sync settings apply. Keep every other settings key and every file on disk.
- **Why:** Owner ruling #31 (`docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md`), and the aligned storyboard above. It clears the ground for the rebuild epic without touching Page, Focus or Flow.
- **Out of scope:**
  - Any change to Page, Focus or Flow behaviour, including Page Play/Space (that is UX-POLISH-1's job), and their committed G4 baselines.
  - Deleting user data (`settings.json` keys other than the two normalized values, `userData/tts-cache`, `userData/models`); restoring settings on rollback.
  - Removing Kokoro or its packaging (`kokoro-js`, the onnxruntime overrides and unpack entries, `patches/kokoro-js+1.2.1.patch`, `scripts/patch-onnxruntime.js`).
  - New narration; renaming `narrateDiagnostics`.
  - `src/modes/index.ts`, `src/modes/PageMode.ts`, `src/modes/FocusMode.ts` and `src/modes/FlowMode.ts` (CLEANUP-MODE-BARREL-1). The one exception is `src/modes/ModeInterface.ts`, which **is** edited: its three `tts*` fields are removed. Also out of scope: the `vite.config.js` `tts` manual chunk.
  - The Speed Reading settings' Kokoro note and Rhythm Pauses visibility.
  - Docs other than this sprint's staging fold-ins; BUG-168 and BUG-169 re-triage; the Flow band triage.
- **Prerequisites:**
  - Reading-mode separation (READER-MODE-SEPARATION-2): completed.
  - Command-palette settings fix (LIBRARY-SETTINGS-FIX-1): code on `main` (`8c41095e`); must read `completed`.
  - E-ink hover fix (EINK-HOVER-FIX-1): ordering only; must read `completed`.
  - Queue depth of at least 3 (Rule 5a).

  The wait is encoded in reconciliation step 2.
- **Done when:** run every command from the HB-1 worktree root.
    1. **F1, deleted paths absent:** `git ls-files src/reader/modes/narrate src/reader/modes/NarrateModeAdapter.ts src/hooks/useNarration.ts src/hooks/narration src/components/settings/TTSSettings.tsx src/styles/tts-settings.css src/components/FoliatePageView.tsx src/hooks/useReaderMode.ts main/qwen-engine.js main/python-sidecar-engine.js scripts/tts_eval_runner.mjs` prints nothing.
    2. **F1, registry is three modes:** `npm test -- tests/readerModeIsolation.test.ts` exits 0. Its registry test asserts `Object.keys(READER_MODE_MODULES).sort()` equals `["flow","focus","page"]`.
    3. **F1, bottom bar:** `npm test -- tests/readerBottomBarControls.test.tsx tests/readerModeControls.test.tsx` exits 0, with these new assertions:
       - the bar renders exactly the mode buttons Page, Focus and Flow;
       - no element's text contains `Narrat`;
       - with `readingMode="page"` and `lastReadingMode="flow"`, the Flow button has the class `rbb-mode-btn--last`.
    4. **F1, shortcuts:** `npm test -- tests/useKeyboardShortcuts.test.ts tests/readerKeyboard.test.tsx` exits 0. The mirror's KeyN rule is gone, and pressing `n` in Flow resolves to no action.
    5. **F1, settings and palette:** `npm test -- tests/commandPaletteRoutes.test.ts` exits 0, and `rg -n "\"tts\"|Narration \(TTS\)" src/components/SettingsMenu.tsx src/components/CommandPalette.tsx src/components/MenuFlap.tsx` prints nothing.
    6. **F1, migration v13** (positive control, LL-138): the new `tests/settingsMigrationV13.test.js` requires `../main/migrations.js` and asserts:
       - (a) v12 data `{readingMode:"narrate", lastReadingMode:"narrate"}` migrates to `"flow"`/`"flow"` with `schemaVersion` 13;
       - (b) v12 `readingMode:"page"`, `lastReadingMode:"focus"` are unchanged;
       - (c) `isNarrating`, `ttsEngine`, `ttsVoiceName`, `ttsRate`, `pronunciationOverrides` and `narrationProfiles` are deep-equal before and after. Take the "before" copy with `structuredClone` first, because the migrations mutate their input in place;
       - (d) repeat run: running the migrations again on the v13 result returns it deep-equal;
       - (e) **downgrade (G6):** `runMigrations(v13Result, settingsMigrations.slice(0, 12), 12)`, which simulates the reverted code's runner, returns it deep-equal, still `"flow"`.

       It fails on the base (recorded in the close-out), and `npm test -- tests/settingsMigrationV13.test.js` exits 0 after.
    7. **F1, normalization at the real ingestion seams (G3; revision 3):** the new `tests/settingsNarrateNormalization.test.js` exercises the two production functions every ingress now goes through, not a reconstruction of them:
       - (a) **Startup:** `loadSettingsData` (exported from `main/migrations.js`; `main.js` `loadState` calls it, then saves) is called with a **schema-13 object that still contains Narrate**: `{schemaVersion:13, readingMode:"narrate", lastReadingMode:"narrate", wpm:300}`. It returns `{schemaVersion:13, readingMode:"flow", lastReadingMode:"flow", wpm:300}`. A schema-12 input also returns schema 13 with `"flow"`.
       - (b) **Cloud apply:** `applyCloudSettings(ctx, data)` (exported from `main/sync-engine.js`; both apply paths call it) is called with a fake `ctx`, whose `getSettings()` returns `s = {schemaVersion:13, lastReadingMode:"flow", wpm:300}` and whose `saveSettings()` pushes `structuredClone(s)` into `saved`. The data is `{lastReadingMode:"narrate", fontSize:20}`. The result: `saved.length === 1` and `saved[0]` deep-equals `{schemaVersion:13, lastReadingMode:"flow", wpm:300, fontSize:20}`. That is the persisted value: normalized before the save, with unrelated keys kept.
       - (c) **Merge feeds apply:** `mergeSettings(local, cloud, ts)` with local `{schemaVersion:13, lastReadingMode:"flow", wpm:300}`, cloud `{schemaVersion:12, lastReadingMode:"narrate", fontSize:20}` and `ts = { settings: { "local:lastReadingMode": 1, "cloud:lastReadingMode": 2, "cloud:fontSize": 2 } }` returns `{schemaVersion:13, lastReadingMode:"narrate", wpm:300, fontSize:20}`: a cloud field wins only when its `cloud:` timestamp is newer, and the local `schemaVersion` is kept. Passing that through (b)'s `applyCloudSettings` persists `"flow"`.
       - (d) **`normalizeReaderModes`** maps only those two keys and returns `true` only when it changed something.

       It fails on the base. `npm test -- tests/settingsNarrateNormalization.test.js` exits 0 after.

       **Omission control:** with the `normalizeReaderModes(...)` line temporarily removed from `loadSettingsData`, (a) fails; with it removed from `applyCloudSettings`, (b) and (c) fail. Run both before C3 is committed, restore the line, and record the failing output in the close-out.

       **Wiring:**
       - `git grep -c "applyCloudSettings(ctx" -- main/sync-engine.js` prints `2`;
       - `git grep -n "Object.assign(settings" -- main/sync-engine.js` prints nothing;
       - `git grep -n "settings = loadSettingsData(rawSettings);" -- main.js` prints one line, followed in the source by `await saveSettingsFn();`.

       No end-to-end sync harness exists in the repository, so the paths are proven through these two shared seams. Each path cannot apply settings except through its seam.
    8. **F1, user data untouched:** `rg -n "scheduleBackgroundStartupTasks|runKokoroWarmup|ttsCache\.init|scheduleCleanupOrphans|runCacheCleanup" main.js` prints nothing, and `git diff --name-only refs/remotes/origin/main -- main/tts-cache.js main/tts-engine.js main/tts-worker.js main/tts-engine-marathon.js main/tts-opus.js` prints nothing.
    9. **Kokoro dormant and unreachable:**
       - `rg -n "kokoro|tts-kokoro|tts-cache|ttsCache|tts-qwen|tts-nano|tts-pocket" preload.js` prints nothing;
       - `rg -n "kokoroPreload|kokoroGenerate|ttsCache[A-Z]" src` prints nothing;
       - `npm test -- tests/tts-engine.test.js tests/tts-worker.test.js` exits 0, so the engine still loads in isolation.
    10. **Dormant engines gone (G5), checking files, registrations and packaging, not historical strings:**
        - `git ls-files main | rg "moss|pocket|qwen|sidecar"` prints nothing;
        - `rg -n "ipcMain\.handle\(\"tts-(nano|pocket|qwen)-" main` prints nothing;
        - `node -e "const b=require('./package.json').build;const s=JSON.stringify([b.files,b.asarUnpack]);process.exit(/moss_nano|pocket_tts|qwen_/.test(s)?1:0)"` exits 0.

        Historical engine names in `main/migrations.js` (the v10→v12 entries) and in eval-trace labels are allowed.
    11. **CI and scripts:** `rg -n "quality-gate|test:quality|tts:eval|tts:scan|moss:" .github/workflows/ci.yml package.json` prints nothing.
    12. **F6, Page, Focus and Flow unchanged:**
        - `npm test -- tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/readerModes/` exits 0;
        - `git diff --exit-code refs/remotes/origin/main -- docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/page.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/focus.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/flow.baseline.json` exits 0;
        - `git diff --name-only refs/remotes/origin/main -- src/reader/modes/page src/reader/modes/focus src/reader/modes/flow` prints exactly `src/reader/modes/focus/ModeRuntime.ts`, `src/reader/modes/flow/ModeRuntime.ts` and `src/reader/modes/page/ModeRuntime.ts`, each changed only at its *Edit sites* anchors.
    13. **No dangling references (G1, G5, LL-131), checking resolved imports, not identifiers:**
        - `npm run typecheck` exits 0;
        - the *Closure check* exits 0 with `--self-test` (7 of 7 missing-import forms reported; a lookalike string and comment ignored), and exits 0 on `.` with `dangling relative imports: 0`.

        It uses TypeScript's own import scanner, so string assertions such as `tests/fileHashesCleanup.test.ts:296` and the synthetic negative-control paths in `tests/readerModeBoundaries.test.ts` (for example the edge to `src/hooks/useNarration.ts` at line 232) are not imports. Those tests stay unchanged.

        Main-process JavaScript is outside `typecheck`. An unbound identifier there, such as a missing `require` destructure, is caught by Done-when 7's tests (which `require` and call the edited modules) and by its wiring checks.
    14. **Gate:** `npm test` exits 0, `npm run build` exits 0, and `git diff --check refs/remotes/origin/main` exits 0. `tests/perf-baseline-results.json` is never staged.
    15. **Diff fence:** every path in `git diff --name-status refs/remotes/origin/main...HEAD` is one of these:
        - a `D` of a path in *Delete list*;
        - an `M` of a path in *Edit sites*;
        - an `A` of `tests/settingsMigrationV13.test.js` or `tests/settingsNarrateNormalization.test.js`;
        - the sprint's staging memo or `docs/governance/close-outs/Timing.HB-1.jsonl` (LL-136 exemption).

        The close-out lists any exception with its reason.
    16. **Owner smoke** (SRL-053, SRL-058, LL-141): after `npm run build`, the owner starts the built app and records pass or fail per check in the close-out:
        - (a) the bottom bar shows Page, Focus and Flow only;
        - (b) N does nothing in any mode;
        - (c) Settings has no Narration page, and Ctrl+K has no narration entries;
        - (d) Page, Focus and Flow open, play and switch as before on *Meditations*;
        - (e) **with a profile whose `settings.json` has `lastReadingMode: "narrate"` and a book saved at a nonzero word:** the book opens in Page, the bar marks Flow as the last mode, clicking Flow opens it paused at that saved word, and Play starts there (G2, as decided).
        - (f) **mode cycle (D15):** in Page, Shift+Space enters Focus when the last mode was Flow, and Flow when it was Focus. Narrate is no longer in the cycle.
- **Effort:** high (cross-cutting; shared-core freeze set; about 30k source lines and 103 test files removed). Pre-split into 3 waves (LL-091, standing rule 10).
- **Owners:**
  - implementation agent;
  - reviewer for spec compliance and code quality, run in parallel (standing rule 7, SRL-012);
  - repository operator, who merges;
  - owner for Done-when 16.
- **Source:**
  - The held entry's alignment record: frames F1 (as corrected) and F6, assumptions A3–A5, and decisions "Removal depth", "Removal placement", "Saved Narrate preference" and "Rollback".
  - The adversarial review of 2026-10-11 (G1–G8, each verified here against source).
  - The resolved-import census of `45d45473`.
  - Code read directly:
    - `src/utils/narrateDiagnostics.ts` imports (lines 7–9) and exports;
    - `src/utils/ttsEvalTrace.ts` imports (`../types/eval` only);
    - `src/reader/modes/page/ModeRuntime.ts` `togglePlay` (line 260, a no-op);
    - `src/components/ReaderBottomBar.tsx` Play disabled in Page (line 302);
    - `src/reader/useReaderModeOrchestrator.ts` `getNextSelectableMode` (lines 91–95);
    - `main/sync-engine.js` `mergeSettings` (line 371; it skips `schemaVersion`) and its apply paths (`Object.assign(settings, …)` then `ctx.saveSettings()` at lines 814–815 and 1059–1060), with `mergeSettings` exported at line 1138;
    - `main/migrations.js` `runMigrations` (line 259, `while (version < currentVersion)`);
    - `main.js` `loadState` (lines 289–292, which backs up only on upgrade);
    - `src/components/FoliatePageView.tsx` imports (lines 64–66) and `src/hooks/useFlowScrollSync.ts` (line 11);
    - `tests/readerModeBoundaries.test.ts` negative control (lines 224–251);
    - `tests/fileHashesCleanup.test.ts` line 296.

    Line numbers are grep-verified against `main` @ `45d45473` on 2026-10-11 (standing rule 36); anchors govern.
- **Path:** dispatch (3 waves).
- **Origin:** held plan — 2026-10-11-narrate-rebuild (HB-1), not yet on the roadmap.
- **Review focus:**
  1. **A stale `"narrate"` from cloud sync or an already-current file.** Covered by Done-when 7.
  2. **G4 baseline byte stability.** `fixtureReplay.tsx` must keep emitting the same `isNarrating`/`audio` observation fields. Covered by Done-when 12.
  3. **A leftover renderer path to Kokoro.** Covered by Done-when 9.
  4. **Startup disk side effects.** Covered by Done-when 8.
  5. **The Flow surface guard after removing `narrate` (LL-104).** Covered by Done-when 12 (`flow.behavior`) and the updated `foliate-bridge` assertion.

##### Design decisions (planner, 2026-10-11; revision 2)

- **D1 (G1) — `src/utils/narrateDiagnostics.ts` keeps its event and snapshot store; the provider-dependent bundle goes.**
  - **Keep, unchanged:** `NarrateDiagSnapshot`, `NarrateDiagEvent`, `recordSnapshot`, `recordDiagEvent`, `getLatestSnapshot`, `getDiagEvents`, `getSnapshots` and `clearDiagnostics`. `recordDiagEvent` is imported by `ReaderContainer`, behind the diagnostics port that Page, Focus and Flow call through `ports.diagnostics.record`, and typed in `ReaderPorts`; `getLatestSnapshot`/`getDiagEvents` by `LibraryContainer`; and the tests `bugReportDiag` and `tts7j`/`k`/`l`/`m`.
  - **Delete** (no retained reader, by `git grep -w` on 2026-10-11):
    - the imports of `../types/ttsProvider` and `./ttsProviderRegistry`;
    - the bundle section from `TTS_DIAGNOSTICS_SCHEMA_VERSION` through `validateNarrationDiagnosticsBundle`;
    - `GlideDiagSummary`/`getGlideDiagSummary`, `checkBucketInvariant`, `checkCursorInvariant` and `checkExtractionHandoff`.
  - `LibraryContainer`, `bugReportState` and `BugReportModal` do not change.
- **D2 (G1) — The in-app eval-trace plumbing stays, including `src/utils/ttsEvalTrace.ts` and its test.** That file imports only `../types/eval`. The plumbing also covers `src/types/eval.ts`, `diagnostics.trace` in the ports, `main.js` `setupTtsEvalTraceCapture`, and the `preload.js` bridge at lines 3–31. It is opt-in (LL-096) and is used by Flow and the G6 live harness. A4 retires only the TTS eval *scripts* and the CI job.
- **D3 — "Dormant" means not started.** Remove `runKokoroWarmup` and the startup `ttsCache.init` and cleanup scheduling from `main.js`, so nothing loads the model or touches `userData` (A3). The Kokoro, marathon and cache IPC handlers stay registered, unreachable.
- **D4 (G4) — The legacy dead cluster is deleted in Wave A**, because it imports Wave A's deletions:
  - `src/components/FoliatePageView.tsx`;
  - `src/hooks/useReaderMode.ts`, `useFlowScrollSync.ts`, `useFoliateSync.ts`, `useReadingModeInstance.ts`, `useDocumentLifecycle.ts`.

  Their path strings **stay** in `boundary-policy.json` → `legacy`; that list is forbidden targets, and G1's synthetic negative control reads it. `src/modes/index.ts`, `PageMode.ts`, `FocusMode.ts` and `FlowMode.ts` stay for CLEANUP-MODE-BARREL-1; only `src/modes/ModeInterface.ts` is edited.
- **D5 — Every settings key and type stays.** That covers `tts*`, `isNarrating`, `narrationProfiles`, `pronunciationOverrides`, `PronunciationOverride`, `TtsEngine`, `NarrationProfile`, and `DEFAULT_SETTINGS` (A3). Focus and Flow keep `isNarrating: false` in their `settings.update` patches, so the G4 baselines stay byte-identical.
- **D6 — Drop `"narrate"` from the types.** It goes from `ReaderMode`, `ReaderLastMode` and `ReaderModeId`. Saved values are normalized only at the data ingress (D12), never by an alias in a runtime hook (LL-121).
- **D7 — `ReaderPortAccessError` and `infrastructureResources` stay.**
- **D8 — `useReaderKeys` loses its `toggleNarration` and `enterNarrate` parameters.** Both callers are updated: `ReaderContainer.tsx` `useReaderKeys(` and `tests/readerKeyboard.test.tsx`.
- **D9 — `extract-epub-words` stays in `main/ipc/tts.js`.**
- **D10 — F6 read precisely.** Page, Focus and Flow assertions are unchanged, and so are the three committed baselines. Narrate rows, cases and count shares are removed. For example, `readerModeIsolation` `crossings` becomes `toBeGreaterThanOrEqual(3)` if the router-to-index edges drop to 3.
- **D11 (G2, owner) — A saved Narrate preference becomes Flow, and Page is unchanged.** Books open in Page (`LibraryContainer.tsx:255`), and Play and Space do nothing there (`page/ModeRuntime.ts:260`, `ReaderBottomBar.tsx:302`). The bar marks Flow as the last mode; clicking Flow opens it paused at the saved word, and Play starts it. Entering the remembered mode straight from Page is UX-POLISH-1's job.
- **D12 (G3; revision 3) — Normalization happens at every settings ingress, through two testable seams.** `normalizeReaderModes(data)` in `main/migrations.js` maps `readingMode`/`lastReadingMode` from `"narrate"` to `"flow"` and returns whether it changed anything. It is reached by:
  - migration v13;
  - `loadSettingsData(raw)` (`main/migrations.js`: run the migrations, then normalize), which `main.js` `loadState` calls. It then saves, which covers an already-current schema-13 file;
  - `applyCloudSettings(ctx, data)` (`main/sync-engine.js`: assign, normalize, save), which both cloud apply paths call instead of a bare `Object.assign`.

  Done-when 7 tests both seams directly and proves that removing the normalize call from either one fails. The renderer cannot produce `"narrate"` once the types drop it. Known, harmless and out of scope: the forced-download path also copies the cloud's `schemaVersion` (`sync-engine.js:814`), so a v12 cloud file makes the next launch re-run v13 and re-take the pre-upgrade backup.
- **D13 (G6, owner) — Rollback keeps "flow".** `git revert -m 1 <merge sha>` restores the code. Migrated and normalized preferences stay `"flow"`, which the reverted code accepts. A schema-13 file is read unchanged by the reverted code's runner (`while (13 < 12)` does not run; Done-when 6e). The pre-upgrade copy that `loadState` writes through `backupFile` is **not** restored, so later settings changes are kept.
- **D14 (G7; revision 3) — Ownership comes from the intake, and position comes from the repository.**
  - The `virtuoso` intake records `in-flight` before the recipe and stops on an existing `in-flight` until the owner confirms the run is their own interrupted one. That is the single ownership authority.
  - Every commit subject starts `HB-1 C<n>:`, and C1's body ends with the trailer `HB-1-Base: <sha>` (plus the base measurement). The recipe's step 3 uses these and `git merge-base` to choose between start, resume at C<n+1>, or conflict.
  - On any mismatch, everything is preserved.
- **D15 — The mode cycle shrinks to Focus and Flow.** `getNextSelectableMode` becomes focus → flow → focus, so Page's Shift+Space (`handleCycleAndStart`, `useReaderModeOrchestrator.ts:156-161`) enters Focus when the last mode was Flow, where it used to enter Narrate. This is a direct consequence of the removal, not a Page behaviour change, and Done-when 16(f) observes it.

##### Implementation detail

- **Edit sites:**
  - **Delete list** (a `git rm` of exact paths):
    - **Wave A, renderer:**
      - **Narrate mode:** `src/reader/modes/narrate/` (all files, including `mode.css`, `index.ts` and `helpers/*`), `src/reader/modes/NarrateModeAdapter.ts`.
      - **Hooks:** `src/hooks/useNarration.ts`, `src/hooks/narration/` (6 strategies), `src/hooks/useNarrationCaching.ts`, `src/hooks/useNarrationSync.ts`, `src/hooks/useQwenPrototypeStatus.ts`.
      - **Utils:**
        - `src/utils/` `audioScheduler.ts`, `generationPipeline.ts`, `segmentNormalizer.ts`, `narrationPlanner.ts`, `backgroundCacher.ts`, `streamAccumulator.ts`, `ttsCache.ts`, `timingMetadataStore.ts`, `spokenWordFilter.ts`, `voiceSelection.ts`, `narratePerf.ts`, `narrationContinuity.ts`;
        - `ttsCacheIdentity.ts`, `qwenStatus.ts`, `ttsProviderRegistry.ts`, `narrationPortability.ts`, `audioPlayer.ts`, `kokoroStatus.ts`, `mediaSessionBridge.ts`, `highlightSyncController.ts`, `kokoroRatePlan.ts`, `pronunciationOverrides.ts`, `silenceAwareCursor.ts`;
        - `src/utils/audio/`.

        `ttsEvalTrace.ts` and `narrateDiagnostics.ts` are **not** deleted (D1, D2).
      - **Settings UI:** `src/components/settings/` `TTSSettings.tsx`, `CacheSizeDisplay.tsx`, `KokoroStatusSection.tsx`, `MossNanoStatusSection.tsx`, `NarrationDataSection.tsx`, `PauseSettingsSection.tsx`, `PocketTtsStatusSection.tsx`, `PronunciationOverridesEditor.tsx`, `QwenRuntimeSetupSection.tsx`, `QwenStatusSection.tsx`, `TtsEngineSelector.tsx`, `qwenStatusPresentation.ts`, `ttsPreview.ts`, `useKokoroSettingsStatus.ts`, `useMossNanoSettingsStatus.ts`, `usePocketTtsSettingsStatus.ts`; and `src/styles/tts-settings.css`.
      - **Types and harness:** `src/types/qwenStreaming.ts`, `src/types/ttsCache.ts`, `src/types/ttsProvider.ts`, `src/test-harness/mock-kokoro.ts`.
      - **Legacy cluster (D4):** `src/components/FoliatePageView.tsx`, `src/hooks/useReaderMode.ts`, `src/hooks/useFlowScrollSync.ts`, `src/hooks/useFoliateSync.ts`, `src/hooks/useReadingModeInstance.ts`, `src/hooks/useDocumentLifecycle.ts`.
    - **Wave B, main, scripts, fixtures and tests:**
      - **Main:** `main/moss-nano-engine.js`, `main/moss-nano-sidecar.js`, `main/pocket-tts-engine.js`, `main/pocket-tts-sidecar.js`, `main/python-sidecar-adapter.js`, `main/python-sidecar-engine.js`, `main/sidecar-paths.js`, `main/qwen-engine.js`, `main/qwen-streaming-engine.js`.
      - **Scripts:**
        - `scripts/moss_nano_app_sidecar.py`, `scripts/moss_nano_electron_live_driver.mjs`, `scripts/moss_nano_live_capture.mjs`, `scripts/moss_nano_probe.mjs`, `scripts/moss_nano_probe.py`, `scripts/moss_nano_resident_probe.py`, `scripts/moss_preflight.mjs`, `scripts/moss_runtime_shape_probe.mjs`;
        - `scripts/pocket_tts_sidecar.py`, `scripts/qwen_preflight.mjs`, `scripts/qwen_streaming_sidecar.py`;
        - `scripts/tts_engine_scan_index.mjs`, `scripts/tts_eval_gate.mjs`, `scripts/tts_eval_metrics.mjs`, `scripts/tts_eval_profiles.mjs`, `scripts/tts_eval_runner.mjs`.
      - **Fixtures:** `tests/fixtures/narration/` (35 files), `tests/fixtures/tts-normalization/` (1 file).
      - **Tests (103 files, full paths, each resolved against `45d45473`):**
        - **Audio and Kokoro:** `tests/audioGlide.test.ts`, `tests/audioPlayer.test.ts`, `tests/audioScheduler.test.ts`, `tests/audioSchedulerTempo.test.ts`, `tests/audioSchedulerUnderrun.test.ts`, `tests/calmNarrationBand.test.ts`, `tests/collapsingCursor.test.ts`, `tests/cursorNarrationSync.test.ts`, `tests/cursorSyncPauseBacklog.test.ts`, `tests/generationPipeline.test.ts`, `tests/heteronymDisambiguation.test.ts`, `tests/highlightSyncController.test.ts`, `tests/kokoroRateBuckets.test.ts`, `tests/kokoroRatePlan.test.ts`, `tests/kokoroStartupRecovery.test.ts`, `tests/kokoroStrategy.test.ts`, `tests/kokoroStrategyRateContinuity.test.ts`, `tests/mediaSessionBridge.test.ts`.
        - **MOSS:** `tests/mossNanoElectronLiveDriver.test.js`, `tests/mossNanoEngine.test.js`, `tests/mossNanoIpc.test.js`, `tests/mossNanoLiveCapture.test.js`, `tests/mossNanoProbe.test.js`, `tests/mossNanoStrategy.test.ts`, `tests/mossProvisioning.test.js`, `tests/mossRuntimeShapeProbe.test.js`.
        - **Narrate and narration:** `tests/namedPause.test.ts`, `tests/narrTiming.test.ts`, `tests/narrateA5RateReseed.test.ts`, `tests/narrateModeAdapter.test.ts`, `tests/narratePauseResumeUnify.test.ts`, `tests/narratePerf.test.ts`, `tests/narrateRuntime.test.ts`, `tests/narrationContinuity.test.ts`, `tests/narrationControlsPolish.test.ts`, `tests/narrationCursorPolish.test.ts`, `tests/narrationCursorTrackingDiag.test.ts`, `tests/narrationIntegration.test.ts`, `tests/narrationPipelineIntegration.test.ts`, `tests/narrationPlanner.test.ts`, `tests/narrationPortability.test.ts`, `tests/narrationProfiles.test.ts`, `tests/narrationReducer.test.ts`, `tests/narrLayer1bConsolidation.test.ts`, `tests/perBookOverrides.test.ts`.
        - **Pocket and sidecars:** `tests/pocketTtsEngine.test.js`, `tests/pocketTtsIpc.test.js`, `tests/pocketTtsStrategy.test.ts`, `tests/pronunciationOverrides.test.ts`, `tests/pythonSidecarAdapter.test.js`, `tests/pythonSidecarEngine.test.js`.
        - **Qwen:** `tests/qwenDefaultSettings.test.ts`, `tests/qwenEngine.test.js`, `tests/qwenPlaybackReliability.test.tsx`, `tests/qwenProvisioning.test.js`, `tests/qwenRuntimeHardening.test.js`, `tests/qwenStatusUi.test.tsx`, `tests/qwenStrategy.test.ts`, `tests/qwenStreaming.test.js`, `tests/qwenStreamingHardening.test.ts`, `tests/qwenStreamingStrategy.test.ts`, `tests/qwenStreamingTypeContract.test.ts`.
        - **Segments and cursor:** `tests/segmentKokoroChunk.test.ts`, `tests/segmentNormalizer.test.ts`, `tests/silenceAwareCursor.test.ts`, `tests/spokenWordFilter.test.ts`.
        - **TTS sprints:** `tests/tts-integration.test.ts`, `tests/tts7a-cacheCorrectness.test.ts`, `tests/tts7b-cursorContract.test.ts`, `tests/tts7c-throughput.test.ts`, `tests/tts7e-coldStart.test.ts`, `tests/tts7f-entryCacheCruiseWarm.test.ts`, `tests/tts7n-pause-semantics.test.ts`, `tests/tts7o-audible-pauses-smooth-cursor.test.ts`.
        - **TTS eval and settings:** `tests/ttsContinuityReadiness.test.ts`, `tests/ttsDiagnosticsBundle.test.ts`, `tests/ttsEngineScanCorpus.test.ts`, `tests/ttsEngineScanIndex.test.ts`, `tests/ttsEvalDiagnosticsBundle.test.ts`, `tests/ttsEvalGate.test.ts`, `tests/ttsEvalLifecycle.test.ts`, `tests/ttsEvalMatrixRunner.test.ts`, `tests/ttsParity.test.ts`, `tests/ttsPreviewTruth.test.ts`, `tests/ttsProviderRegistry.test.ts`, `tests/ttsSettingsDiagnosticsExport.test.tsx`, `tests/ttsSettingsKokoroTruth.test.tsx`, `tests/ttsSettingsMossNano.test.tsx`, `tests/ttsSettingsPocketTts.test.tsx`, `tests/ttsSettingsQwenPrototype.test.tsx`.
        - **useNarration:** `tests/useNarration.test.ts`, `tests/useNarrationCaching.test.tsx`, `tests/useNarrationMossNano.test.tsx`, `tests/useNarrationMount.test.tsx`, `tests/useNarrationQwen.test.tsx`, `tests/useNarrationRateUpdate.test.tsx`, `tests/webSpeechStrategy.test.ts`, `tests/wordTimingHeuristic.test.ts`.
        - **Legacy:** `tests/readerDecomposition.test.ts`, `tests/useReaderMode.test.ts`.
        - **Reader modes:** `tests/readerModes/narrate.behavior.test.tsx`, `tests/readerModes/narrate.contract.test.ts`, `tests/readerModes/narrateChunkCache.test.ts`.

        `tests/ttsEvalTrace.test.ts` is kept (D2). `tests/narrateDiagnostics.test.ts` is kept and edited (D1, revision 3).
      - **CI:** the `quality-gate:` job in `.github/workflows/ci.yml`.
  - **Edit sites** (anchors from the census of `45d45473`):
    - **Wave A:**
      - **`src/reader/useReaderModeOrchestrator.ts`:**
        - drop `import { narrateMode }` and `narrate: narrateMode` from `READER_MODE_MODULES`;
        - narrow the unions in `getNextSelectableMode` (the cycle becomes focus → flow → focus), `handleSelectMode` and `ReaderModeRouter.select`;
        - delete `handleEnterNarrate` and `handleToggleNarration`, and remove them from the returned object.
      - **`src/reader/modes/ReaderModeAdapter.ts`:** `ReaderModeId` drops `"narrate"`; the `{ kind: "rate" }` member of the speed union (`// Narrate`) is removed.
      - **`src/reader/ports/ReaderPorts.ts`:** remove the imports of `audioScheduler`, `highlightSyncController`, `mediaSessionBridge` and the narration types, the `ReaderAudio*` types, and `readonly audio: ReaderAudioPort;`. Keep `diagnostics.trace` (D2).
      - **`src/reader/ports/createReaderPorts.ts`:**
        - remove the audio entries of `READER_PORT_RELEASE_CALLS`, `PORT_METHODS.audio`, the audio keys in `CALLBACK_ARG`, `"audio.readState"` in `CACHED_READS`, the `audio.*` branches in `call()`, `throwingAudioPort`, the `key.mode === "narrate"` read-state seed, and the `audio:` group;
        - keep `ReaderPortAccessError` (D7) and `"trace"` (D2);
        - remove `"settings.update{isNarrating}"` only if no remaining caller needs it.
      - **`src/components/ReaderContainer.tsx`** (shared-core freeze set):
        - remove the imports of `useNarration`, `createBackgroundCacher`, `resolveKokoroRatePlan`, `mergeOverrides`/`overrideHash` and `ReaderAudioConfig`;
        - remove the "TTS infrastructure (DD-3)" block (`readingModeRef`, `narration`, `narrationRef`, `backgroundCacherRef`), `mediaSessionRequestRef`, and the infrastructure `audio: { … }` group;
        - remove `handleEnterNarrate`/`handleToggleNarration` from the destructure and from the `useReaderKeys(` call (D8), the `isNarrating` local, and `|| readingMode === "narrate"` in `isScrolledSurfaceMode`;
        - `modePlaying` becomes `toolbar?.playing ?? false`;
        - remove the `kokoroPreload` delayed prewarm along with its `clearTimeout(prewarmTimer)`, the "TTS infrastructure (useNarrationCaching effects 1–4)" region, the `kokoro-loading-toast` JSX, the bottom-bar props `isNarrating=`/`onToggleNarration=`/`ttsRate=`/`narrationWordIndex=`, and `!narration.speaking` in the `ReturnToReadingPill` condition;
        - keep `recordDiagEvent` (D1), `createWindowEvalTraceSink`, `evalTraceSink` and `evalTrace:` (D2), the "TTS-6O pre-extraction" effect, and every e-ink line `tests/einkFoundation.test.ts` reads.
      - **`src/utils/narrateDiagnostics.ts`:** per D1.
      - **`src/reader/modes/page/ModeRuntime.ts`:** remove the `KOKORO_UI_RATE_*`/`TTS_*_RATE` imports, `function stepKokoroUiSpeed`, the `if (settings.lastReadingMode === "narrate") { … }` branch in `adjustSpeed`, and `ttsRate`/`ttsEngine`/`ttsVoiceName` in `buildEngineConfig`.
      - **`src/reader/modes/focus/ModeRuntime.ts` and `src/reader/modes/flow/ModeRuntime.ts`:** remove `ttsRate:`/`ttsEngine:`/`ttsVoiceName:` in `startEngine`'s `ModeConfig`. Nothing else changes; the `isNarrating: false` patches stay (D5).
      - **`src/modes/ModeInterface.ts`:** remove the `ttsRate?`/`ttsEngine?`/`ttsVoiceName?` fields.
      - **`src/components/ReaderBottomBar.tsx`:**
        - remove the `TTS_RATE_BASELINE_WPM` import; the props `isNarrating`, `onToggleNarration`, `ttsRate` and `narrationWordIndex`; and `"narrate"` from the `lastReadingMode` union;
        - remove `"N narrate"` from the flow key hint;
        - `surfaceMode` uses `readingMode` directly;
        - remove the narration branches of `isNarrationSelected`/`effectiveWpm`, so `narrationWordIndex ?? wordIndex` becomes `wordIndex`;
        - remove the Narrate `<button>`, the `Narrating` span and the `"Narrating · "` prefix.
      - **`src/components/ReaderSpeedDialog.tsx`:** remove the `NARRATE_SPEED_*` imports, `"narrate"` from `SpeedDialogMode`, the rate branch of `range()`/`speedAt`/`speedHundredths`/`formatSpeedValueText`, and `MODE_LABEL.narrate`.
      - **`src/hooks/useKeyboardShortcuts.ts`:** remove `toggleNarration?`/`enterNarrate?` from the interface, `case "narrate":` in `getReaderKeyboardModeSurface`, both parameters and their `stateRef` copies (D8), the KeyN `enterNarrate` binding, and the `readerMode === "narrate"` block.
      - **Settings and palette:**
        - `src/components/CommandPalette.tsx`: remove the `"Narration (TTS)"` entry and the four `onOpenSettings("tts")` entries after the `TTS-7N (BUG-137)` comment, **and that comment line itself**: `// TTS-7N (BUG-137): TTS entries route to dedicated "tts" page, not "speed-reading"` contains `"tts"`, which Done-when 5's `rg` would match.
        - `src/components/SettingsMenu.tsx`: remove `import { TTSSettings }`, the `{ id: "tts", … }` item and the `activeSubPage === "tts"` block.
        - `src/components/MenuFlap.tsx`: remove `tts: "Narration (TTS)",` in `TITLES`.
        - `src/components/settings/HotkeyMapSettings.tsx`: remove the `"Toggle narration"` rows.
        - `src/components/HotkeyCoach.tsx`: remove the `narration:` entry.
      - **`src/styles/index.css`:** remove `@import "./tts-settings.css";`. Also remove `.kokoro-loading-toast` in `src/styles/page-reader.css`, now orphaned.
      - **`src/types.ts`:**
        - delete the Kokoro/Qwen/MossNano/PocketTts status, preflight and response types (from `export type KokoroEngineStatus` through the `PocketTts*` types);
        - delete the imports from `./types/qwenStreaming` and `./types/ttsCache`, and the `ElectronAPI` members from `kokoroPreload` through `ttsCacheInfo`; keep `extractEpubWords?`;
        - drop `"narrate"` from `ReaderMode`/`ReaderLastMode`;
        - keep every settings field and type (D5).
      - **`src/constants.ts`:**
        - **Keep:** `TTS_PAUSE_*`, `TTS_DIALOGUE_SENTENCE_THRESHOLD`, `TTS_FOOTNOTE_MODE`, `TTS_DEFAULT_ENGINE`, `TTS_DEFAULT_VOICE_NAME`.
        - **Delete:**
          - `NARRATE_SPEED_*`;
          - `TTS_CHUNK_SIZE`, `TTS_MAX_RATE`, `TTS_MIN_RATE`, `TTS_RATE_BASELINE_WPM`, `TTS_WPM_CAP`, `TTS_RATE_STEP`, `TTS_QUEUE_DEPTH`, `ENTRY_COVERAGE_TARGET_MS`, `TTS_COLD_START_CHUNK_WORDS`, `TTS_CRUISE_CHUNK_WORDS`, `TTS_CROSSFADE_MS`, `TTS_CURSOR_TRUTH_SYNC_INTERVAL`, `TTS_FORWARD_WORDS`, `TTS_PLANNER_*`;
          - `NARRATION_BAND_MIN_WIDTH_PX`, `NARRATION_CURSOR_LAG_MS`, `TTS_TRUSTED_CURSOR_LAG_MS`, `TTS_SILENCE_HOLD_THRESHOLD_MS`;
          - `QWEN_*`, `TTS_STREAM_*`, `NARRATE_*_BUDGET_MS`, `NARRATE_STEADY_STATE_BLOCK_MS`, `NARRATE_BG_EXTRACT_DELAY_MS`, `MAX_PRONUNCIATION_OVERRIDES`, `TTS_NORMALIZER_VERSION`, `TTS_CACHE_SCHEMA_VERSION`, `TTS_TIMING_SIDECAR_EXTENSION`, `MAX_NARRATION_PROFILES`;
          - `normalizeSelectableTtsEngine`, `createDefaultNarrationProfile`, `profileFromSettings`, `resolveNarrationProfile`;
          - `KOKORO_UI_RATE_*`, `KOKORO_RATE_BUCKETS`, `KokoroRateBucket`, `KOKORO_DEFAULT_RATE_BUCKET`, `KOKORO_LIVE_RATE_*`, `resolveKokoroBucket`, `stepKokoroBucket`, `KOKORO_MODEL_ID`, `KOKORO_MODEL_DTYPE`, `KOKORO_DEFAULT_VOICE`, `KOKORO_SAMPLE_RATE`, `KOKORO_VOICE_NAMES`;
          - `NARRATION_RENDER_WAIT_MS`, `TTS_RATE_RESTART_DEBOUNCE_MS`, `TTS_RATE_CONFIRMING_MS`, `TTS_RATE_SET_DISPLAY_MS`.

          Delete a name only when `git grep -w <NAME> -- src tests` shows no retained reader; otherwise keep it and list it in the close-out.
      - **`src/types/narration.ts`:** keep `SectionBoundary` only.
      - **`src/test-harness/electron-api-stub.ts`:** remove the `mock-kokoro` import, `stubTtsCache`, the Kokoro, Qwen and TTS-cache sections, and the `onKokoro*`/`onQwen*` listeners, in step with `ElectronAPI` (LL-106).
    - **Wave B:**
      - **`main.js`:**
        - delete `function scheduleBackgroundStartupTasks` (lines 443–492; it holds only `runKokoroWarmup` and `runCacheCleanup`) and its call `scheduleBackgroundStartupTasks({ mainWindow, settings });` at line 644, and remove the startup `ttsCache.init(…)` (D3);
        - in the destructure at lines 10–11 that ends `settingsMigrations, libraryMigrations, runMigrations } = require("./main/migrations");`, add `loadSettingsData` (keep `runMigrations`, which the library load at line 297 still uses);
        - in `loadState`, replace `settings = runMigrations(rawSettings, settingsMigrations, CURRENT_SETTINGS_SCHEMA);` with `settings = loadSettingsData(rawSettings);`, and keep the `await saveSettingsFn();` on the next line, which persists the normalized result (D12);
        - keep the eval-trace capture (D2).
      - **`preload.js`:** delete everything from `// Kokoro TTS` through `ttsCacheOpeningCoverage`. Keep `extractEpubWords` and the eval-trace bridge at lines 3–31.
      - **`main/ipc/tts.js`:** delete `QWEN_DISABLED_*`, `ENGINE_DORMANT_REASON`, `NANO_DORMANT_DETAIL`, `POCKET_DORMANT_DETAIL`, `qwenDisabled*`, `dormantStatus`/`dormantError`, `toNanoErrorResponse`/`toPocketErrorResponse`, and the `tts-nano-*`, `tts-pocket-*` and `tts-qwen-*` handlers. Keep the Kokoro, marathon, `tts-cache-*` and `extract-epub-words` handlers.
      - **`main/migrations.js`:**
        - `CURRENT_SETTINGS_SCHEMA` goes from `12` to `13`;
        - add an exported `normalizeReaderModes(data)`: for each of `readingMode` and `lastReadingMode` equal to `"narrate"`, set `"flow"`; return `true` if changed;
        - append after the `// v11 → v12` entry `// v12 → v13: Narrate removed (HB-1) — a saved narrate mode becomes flow` with `(data) => { normalizeReaderModes(data); data.schemaVersion = 13; return data; }`;
        - add an exported `loadSettingsData(raw)`: `const s = runMigrations(raw, settingsMigrations, CURRENT_SETTINGS_SCHEMA); normalizeReaderModes(s); return s;`. It covers an already-current schema-13 file that still holds `"narrate"`, because the runner skips current files;
        - export `normalizeReaderModes` and `loadSettingsData` alongside the existing exports;
        - `isNarrating` is untouched.
      - **`main/sync-engine.js`:**
        - add `const { normalizeReaderModes } = require("./migrations");`;
        - add `function applyCloudSettings(ctx, data) { const settings = ctx.getSettings(); Object.assign(settings, data); normalizeReaderModes(settings); ctx.saveSettings(); return settings; }` and export it in `module.exports`, next to `mergeSettings`;
        - replace lines 814–815 (`Object.assign(settings, settingsResult.data); ctx.saveSettings();`) with `applyCloudSettings(ctx, settingsResult.data);`. `settings` there is the same `ctx.getSettings()` object from line 804;
        - replace lines 1058–1060 (`const settings = ctx.getSettings(); Object.assign(settings, cloudSettings); ctx.saveSettings();`) with `applyCloudSettings(ctx, cloudSettings);`;
        - no other change. This persists the normalized value; it does not refresh an already-mounted settings UI, which is not in scope.
      - **`package.json`:**
        - remove `scripts/moss_nano_app_sidecar.py` and `scripts/pocket_tts_sidecar.py` from `build.files` and `build.asarUnpack`;
        - remove the scripts `moss:preflight`, `moss:nano:resident`, `tts:eval`, `tts:eval:matrix`, `tts:eval:matrix:gated`, `test:quality`, `tts:eval:soak:short`, `tts:eval:gates`, `tts:scan:index`, `tts:scan:validate`;
        - change no dependency.
      - **Census (`docs/planning/roadmap-reviews/reader-mode-separation-2/census/`):**
        - `boundary-policy.json`:
          - remove `"narrate"` from `modes`;
          - remove every `privateCopyMap` entry with `"mode": "narrate"`;
          - remove `src/reader/modes/narrate/helpers/foliateHelpers.ts` from `allowedModuleSingletons` and `src/reader/modes/NarrateModeAdapter.ts` from `legacyRetainedFiles`;
          - remove from `shellInfrastructure` every deleted file (`useNarration.ts`, the 6 strategies, `audioScheduler.ts`), **and `src/types/narration.ts`**. After the edits it holds only the `SectionBoundary` type, every remaining edge to it is type-only, and G1's runtime closure (`tests/readerModeBoundaries.test.ts:96`) skips type-only edges, so the exact-closure check would reject a stale declaration. Keep `ReaderContainer.tsx`, `ReaderBottomBar.tsx`, `useKeyboardShortcuts.ts`, `dualSourceDiag.ts` and `narrateDiagnostics.ts`, which `ReaderContainer` still reaches at runtime;
          - keep `legacy` unchanged (D4).
        - `docs/planning/roadmap-reviews/reader-mode-separation-2/ownership.json`: drop `"narrate"` from `privateCopiesFor`. This file is at the folder root, not under `census/`; `tests/readerModeOwnership.test.ts:16` reads it.
      - **Tests (mixed):** edit only the Narrate parts.
        - **Reader-mode suites:** `tests/readerModeIsolation.test.ts`, `tests/readerModeOwnership.test.ts`, `tests/readerModes/harness/fixtureReplay.tsx` (observation output byte-stable), `tests/readerModes/harness/fakePorts.ts`, `tests/readerModes/harness/contractAssertions.ts`, `tests/readerModes/flow.behavior.test.tsx`, `tests/readerModes/chunkVisualParity.test.tsx`, `tests/readerModes/foliateViewTeardown.test.tsx`, `tests/readerModes/arrivalCursor.test.ts`, `tests/readerModeAdapterContract.test.ts`. Two of these need exact instructions:
          - `tests/readerModeIsolation.test.ts`: re-point the generic broker tests (lines 43–187), which use `"narrate"` only as a session id, to `"flow"`. Delete the audio-port tests (`it("issues audio only to narrate…")` and the other `audio.*` cases).
          - `tests/readerModes/harness/contractAssertions.ts` lines 143 and 227: change `runtime.setSpeed({ kind: "rate", rate: 1.05 })` to `runtime.setSpeed({ kind: "rate", rate: 1.05 } as unknown as ReaderModeSpeed)`. This keeps the wrong-kind rejection check, so no Page/Focus/Flow assertion changes (D10).
        - **Foliate helpers:** `tests/foliateAnchorNavigation.test.ts`, `tests/foliateChunkHighlight.test.ts`, `tests/foliateWordHighlight.test.ts`, `tests/persistentReadingAnchor.test.ts`.
        - **Controls and shortcuts:** `tests/readerSpeedDialog.test.tsx`, `tests/readerBottomBarControls.test.tsx`, `tests/readerModeControls.test.tsx`, `tests/useKeyboardShortcuts.test.ts`, `tests/readerKeyboard.test.tsx`, `tests/wordAnchor.test.ts`.
        - **Source-text and structural suites:**
          - `tests/foliate-bridge.test.ts`: drop the top-level `FoliatePageView` read; the expected `isScrolledSurfaceMode` string drops `|| readingMode === "narrate"` and becomes `readingMode === "focus" || readingMode === "flow"`, matching `ReaderContainer.tsx:515` after the edit.
          - `tests/phase0Stabilization.test.ts`.
          - `tests/componentStyleCleanup.test.ts`.
          - `tests/perfAudit.test.ts`: `it("keeps Kokoro warm-up in a delayed background startup scheduler")` (lines 261–271) becomes `it("starts no Kokoro warm-up at app launch")`, asserting `expect(src).not.toContain("scheduleBackgroundStartupTasks")`, `expect(src).not.toContain("runKokoroWarmup")` and `expect(src).not.toMatch(/ttsEngine\.downloadModel/)`. The "voice sync useEffect" describe goes.
          - `tests/startupStabilization.test.ts`, `tests/packageReleaseTruth.test.js`, `tests/perf-baseline.test.ts`.
        - **Diagnostics and legacy:**
          - `tests/bugReportDiag.test.ts` (D1-kept parts stay);
          - `tests/tts7j-foliate-section-sync.test.ts`, `tests/tts7k-global-word-source.test.ts`, `tests/tts7l-exact-selection-mapping.test.ts`, `tests/tts7m-resume-anchor.test.ts` (only Narrate-specific describes go; the D1 store calls stay);
          - `tests/documentLifecycleModeRestore.test.ts` and `tests/useReadingModeInstance.test.ts` (drop the legacy describe; in `useReadingModeInstance.test.ts`, also drop the top-level `SRC`/`src` `readFileSync` of the deleted hook at lines 5–6, which would otherwise crash the file);
          - `tests/currentWordAnchor.test.ts` (drop `setActiveMode("narrate")`);
          - `tests/electronApiStubGoals.test.ts` (drop the Qwen compatibility test).

        `tests/readerModeBoundaries.test.ts` is **not** edited; its synthetic negative-control paths stay.
  - **Kept on purpose:**
    - `main/tts-engine.js`, `tts-worker.js`, `sharp-stub.js`, `tts-engine-marathon.js`, `tts-cache.js`, `tts-opus.js`, and the Kokoro constants in `main/constants.js`;
    - `scripts/kokoro_voice_mix_probe.mjs` and its test;
    - `scripts/check_reader_mode_evidence.mjs` and `fixtures/narrate.baseline.json`;
    - `vite.config.js`;
    - `src/utils/narrateDiagnostics.ts` (store), `src/utils/ttsEvalTrace.ts`, `src/utils/dualSourceDiag.ts`, `src/types/eval.ts`, `src/utils/pauseDetection.ts`, `src/utils/naturalChunks.ts`;
    - `tests/ttsEvalTrace.test.ts`;
    - `docs/testing/tts_*.json`.
  - **Closure check** (revision 3; the dangling-import gate for Done-when 13 and reconciliation step 4). Save this block outside the repository as `closure-check.mjs`, then run it from the worktree root: `node <file> --self-test` (negative controls) and `node <file> .` (the gate). It finds imports with TypeScript's own scanner (`ts.preProcessFile`: static, side-effect, type-only, dynamic `import()` and `require()`), so strings and comments never count. It also matches CSS `@import` and `vi.mock(...)`. It exits 1 on any dangling import. The baseline on `45d45473` is **0**, and the self-test reports 7 of 7 forms.
    ```js
    // HB-1 closure check v2: every relative import must resolve to an existing file. Exit 1 on any finding.
    // Usage: node closure-check.mjs <repoRoot> | node closure-check.mjs --self-test
    // Imports are found by TypeScript's own scanner (ts.preProcessFile: static, side-effect, type-only, dynamic import(),
    // require()), so strings and comments are never imports. CSS @import and vi.mock() are matched separately.
    import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { createRequire } from "node:module";
    // TypeScript is loaded once, resolved from the directory the check runs in (the repository root).
    const ts = createRequire(path.join(process.cwd(), "package.json"))("typescript");
    const check = (root) => {
      const rel = (p) => path.relative(root, p).replaceAll(path.sep, "/");
      const walk = (d, o = []) => { if (!fs.existsSync(d)) return o; for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === "node_modules" || e.name.startsWith(".")) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, o) : o.push(rel(p)); } return o; };
      const files = [...["src", "tests", "main", "scripts"].flatMap((d) => walk(path.join(root, d))), "main.js", "preload.js", "vite.config.js"]
        .filter((f) => fs.existsSync(path.join(root, f)) && /\.(m?[jt]sx?|cjs|css)$/.test(f));
      const exts = ["", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".json", "/index.ts", "/index.tsx", "/index.js"];
      const exists = (base) => exts.some((x) => { const p = path.join(root, base + x); return fs.existsSync(p) && fs.statSync(p).isFile(); });
      const bad = [];
      for (const f of files) {
        const text = fs.readFileSync(path.join(root, f), "utf8");
        const specs = f.endsWith(".css")
          ? [...text.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
          : [...ts.preProcessFile(text, true, true).importedFiles.map((i) => i.fileName), ...[...text.matchAll(/\bvi\.mock\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1])];
        for (const s of specs) if (s.startsWith(".") && !exists(path.posix.normalize(path.posix.join(path.posix.dirname(f), s)))) bad.push(`${f}: "${s}"`);
      }
      return bad;
    };
    if (process.argv[2] === "--self-test") { // negative controls: each missing-import form must be reported; a string must not
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb1-closure-"));
      try {
        fs.mkdirSync(path.join(dir, "src")); fs.mkdirSync(path.join(dir, "tests"));
        const w = (f, t) => fs.writeFileSync(path.join(dir, f), t);
        w("src/ok.ts", "export const ok = 1;\n");
        w("src/named.ts", 'import { a } from "./missing-named";\n');
        w("src/req.js", 'const x = require("./missing-require");\n');
        w("src/side.tsx", 'import "./missing-side.css";\n');
        w("src/dyn.ts", 'export const l = () => import("./missing-dynamic");\n');
        w("src/type.ts", 'import type { T } from "./missing-type";\n');
        w("src/style.css", '@import "./missing-at-import.css";\n');
        w("tests/mock.test.ts", 'vi.mock("../src/missing-mock");\n');
        w("src/string.ts", 'const s = "require(\'./missing-in-string\')"; // import "./missing-in-comment"\nimport { ok } from "./ok";\n');
        const got = check(dir).map((b) => b.split('"')[1]).sort();
        const want = ["../src/missing-mock", "./missing-at-import.css", "./missing-dynamic", "./missing-named", "./missing-require", "./missing-side.css", "./missing-type"].sort();
        const pass = JSON.stringify(got) === JSON.stringify(want);
        console.log(pass ? "self-test: 7/7 missing-import forms reported; string and comment ignored" : `self-test FAILED: got ${JSON.stringify(got)}`);
        process.exit(pass ? 0 : 1);
      } finally { fs.rmSync(dir, { recursive: true, force: true }); }
    }
    const bad = check(path.resolve(process.argv[2] ?? "."));
    console.log(`dangling relative imports: ${bad.length}`); bad.forEach((b) => console.log("  " + b));
    process.exit(bad.length ? 1 : 0);
    ```
- **Tests:**
  - **New:**
    - `tests/settingsMigrationV13.test.js` (Done-when 6);
    - `tests/settingsNarrateNormalization.test.js` (Done-when 7).

    Both follow the `require("../main/migrations.js")` pattern of `tests/ttsEngineDeactivation.test.js`. The second also loads `../main/sync-engine.js` for `mergeSettings` and `applyCloudSettings`, exactly as `tests/sync-hardening.test.js` does: the same mocks set up before it, then `await import("../main/sync-engine.js")` at its line 51. It drives `loadSettingsData` and `applyCloudSettings` directly (Done-when 7).
  - **New assertions** in `tests/readerBottomBarControls.test.tsx` (Done-when 3) and in the registry test of `tests/readerModeIsolation.test.ts` (Done-when 2).
  - **Modified:**
    - `tests/perfAudit.test.ts`: the four `toContain`/`toMatch` assertions of `it("keeps Kokoro warm-up in a delayed background startup scheduler")` (lines 267–270) are replaced by `not.toContain("scheduleBackgroundStartupTasks")`, `not.toContain("runKokoroWarmup")` and `not.toMatch(/ttsEngine\.downloadModel/)`, and the test is renamed `it("starts no Kokoro warm-up at app launch")`.
    - `tests/foliate-bridge.test.ts`: line 94's expected `isScrolledSurfaceMode` string drops `|| readingMode === "narrate"`.
- **Constants:** none added. `CURRENT_SETTINGS_SCHEMA` goes from 12 to 13.
- **Branch:** `eb/hb-1` from `refs/remotes/origin/main`, in worktree `C:\Projects\Blurby\.worktrees\hb-1`.
- **Staging plan:** exact paths only. Use `git rm <path>` for deletions and `git add <path>` for edits; never `git add -A`. Never stage `tests/perf-baseline-results.json`. Every commit subject starts `HB-1 C<n>:` (D14). Before each commit, run `git diff --cached --stat` and check for unexpected shrinkage in edited files (LL-068).
  - **Wave A:**
    - C1: `tests/settingsMigrationV13.test.js` and `tests/settingsNarrateNormalization.test.js` (positive controls, failing).
    - C2: every Wave A deletion and edit. **Gate before committing C2:** `npm run typecheck` has no error outside `tests/`, and the *Closure check* lists no file outside `tests/`.
  - **Wave B:**
    - C3: main, preload, `main/migrations.js`, `main/sync-engine.js`, `package.json`, CI, scripts and the census JSON. Gate: both new tests pass.
    - C4: the test deletions and edits. Gate: Done-when 1–14.
  - **Wave C:**
    - C5: the staging-memo fold-ins. Then the owner smoke check (Done-when 16).
    - Merge to `main` with `--no-ff` from a clean integration worktree, and push (Rule 5b).
- **Failure handling:**
  - **A typecheck or test error in a file outside *Edit sites* that only references a deleted module:** remove the reference and list the file in the close-out. If the error is in Page, Focus or Flow runtime logic beyond the named lines, **stop**: open an issue and use `/mid-dispatch-decision`.
  - **Any byte change to `page`, `focus` or `flow.baseline.json`, or a G4 replay diff:** **stop**, never rebaseline.
  - **A full-suite failure:** if it is only a 10 s timeout in the known-flaky node IDs (KF-2 and KF-3, as named in the separation close-out; KF-1's `tests/qwenStreaming.test.js` is deleted here) and the test passes alone, re-run once on a quiet machine. If it persists, raise a BLOCKER(USER) with the evidence. No self-waiver.
  - **A build failure from a dangling CSS `@import` or dynamic import:** fix that reference only.
  - **Interrupted run:** resume only through reconciliation step 3's verified-resumption branch. Otherwise stop and preserve everything.
  - **Retry ceiling:** two corrections per task, then BLOCKER(USER).
  - **Rollback (D13):** `git revert -m 1 <merge sha>` restores the code. Settings migrated or normalized to `"flow"` stay `"flow"` by owner decision, and the reverted code reads a schema-13 file unchanged (Done-when 6e). The pre-upgrade settings backup is not restored.
- **Lane ownership (parallel run):**
  - **Owned surfaces:** A, C and D.
  - **Shared-core freeze set:** owned for the duration; this sprint edits `ReaderContainer.tsx` and `types.ts`, and deletes `useNarration.ts` and `useFlowScrollSync.ts`.
  - **Forbidden during a parallel run:** nothing else may edit the freeze set, `src/reader/**`, `main/migrations.js` or `main/sync-engine.js`. The e-ink hover fix (`src/styles/themes.css`) is file-disjoint and may run in parallel.
  - **Merge order:** after the e-ink hover fix and the command-palette settings fix.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Base measured; migration and normalization positive-control tests committed and failing | calculable | positive control | mechanical | low | 40m (npm ci + base gate + two test files) | — | — |
| 2 | Renderer and legacy cluster free of Narrate (Wave A): deletions done; router, ports, container, diagnostics store, bottom bar, speed dialog, shortcuts and palette updated; typecheck clean outside tests | calculable | renderer removal | cross-cutting | high | 3h30m (about 26k lines deleted, 21 files edited) | — | — |
| 3 | Main process, preload, packaging, CI and census cleaned; Kokoro dormant; v13 migration and ingestion normalization green | calculable | main-process removal | bounded | medium | 1h45m (9 deletions, 16 scripts, 7 edits, 2 JSON) | — | — |
| 4 | Tests reconciled: 103 narration-only tests deleted, mixed tests edited, G1–G4 green with baselines byte-identical | calculable | test reconciliation | cross-cutting | high | 3h (103 deletions, about 31 edits) | — | — |
| 5 | Full gate and closure check green (typecheck, test, build, dangling imports, diff fence) | calculable | verify gate | mechanical | low | 45m (3 full runs plus the closure check) | — | — |
| 6 | Spec compliance and code quality reviewed | calculable | review | bounded | medium | 40m (two read-only reviews in parallel) | — | R |
| 7 | Owner smoke on the rebuilt app recorded | calculable | owner smoke | mechanical | low | 15m (5 live checks) | — | R |
| 8 | Staging fold-ins written; merged to main and pushed | calculable | merge and docs | mechanical | low | 40m (fold-ins plus one --no-ff merge) | — | — |

**Total:** chain 11h · sum 11h15m; 0 of 8 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- **LL-131** — the gates check resolved imports, registrations and packaging, not identifiers (Done-when 10, 13). Historical engine names in migrations and synthetic negative-control paths are explicitly allowed.
- **LL-139** — the delete and edit lists come from a resolved-import census of `45d45473`. The revision 2 closure run shows every retained importer is an edit site, and that each wave's source side is self-contained.
- **LL-128** — every delete path was verified to exist on `45d45473`, and every test path was resolved to its real filename (no short names).
- **LL-117** — the forbidden scope (Page, Focus and Flow runtime logic, the three G4 baselines, separation evidence) and the *Kept on purpose* list are decided up front.
- **LL-106** — the TTS IPC removal is three-way and in step: the `main/ipc/tts.js` handlers, the `preload.js` methods, and the `ElectronAPI` members plus the test stub.
- **LL-104** — the Flow surface guard `isScrolledSurfaceMode` is narrowed explicitly, and Flow follow behaviour is guarded by G4 (Done-when 12).
- **LL-121** — `narrate` is normalized at the data ingress (migration, load, sync apply), never by an alias in a runtime hook (D6, D12).
- **LL-138** — both new tests are positive controls that fail on the base (Done-when 6, 7).
- **LL-068** — large edits to `types.ts`, `constants.ts` and `ReaderContainer.tsx` are checked with `git diff --cached --stat` before each commit.
- **LL-091** — the sprint is pre-split into three waves, and each wave's gate is achievable (D4 moved the legacy cluster into Wave A).
- **LL-135** — the pointer carries the reconciliation recipe through a committed path (this file on `main`).
- **LL-136** — the diff fence (Done-when 15) names the timing-log and staging-memo exemptions.
- **LL-141** — the owner's live smoke check (Done-when 16) covers what automation cannot reach.
- **LL-006** — the v13 migration and the sync-apply normalization write through the existing atomic settings writer.

##### Rubric walk (v1.2; no project extensions; revision 3)

U1 scope ✓ · U2 edit sites ✓ (resolved-import census and closure run on `45d45473`; every retained importer named) · U3 tests ✓ (full paths; new tests' assertions concrete) · U4 acceptance ✓ (16 rows, each with its command; the closure gate is parser-based with a self-test and exits 1 on findings; ingestion is proven at production seams with omission controls) · U5 prerequisites: wait encoded, plus Rule 5a queue depth · U6 failure handling ✓ (cases, interrupted-run resumption, retry ceiling, migration-aware rollback) · U7 source ✓ (no deferred decisions; review findings cited) · U8 repository plan ✓ (aligned with the `virtuoso` intake: start, resume and conflict decided from repository state after owner-confirmed ownership) · U9 lessons ✓ (`lessons --check`) · U10 task list ✓ (`timing --rows-from-spec`)
