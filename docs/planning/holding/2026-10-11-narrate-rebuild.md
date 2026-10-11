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

<!-- Filled by write-plan: readiness, roadmap placement, pointer, repository
     reconciliation, and one specification per draft-stub item, each headed
     `#### HB-<n> — Title`. Empty until then. An epic-scale entry is never planned here.
     Only the virtuoso skill executes the plan, and it records the run in the trail. -->
