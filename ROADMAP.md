# Blurby — Development Roadmap

**Last updated**: 2026-10-26, roadmap-review after approved PhasesA–C: five source-backed smoke specifications, a separate Narrate paused-click child, owner design choices recorded, unresolved diagnoses retained and release holds unchanged. Previous state is preserved in the dated pre-specification snapshot.
**Current state**: v1.75.1; Page, Focus, Flow and rebuilt Narrate are four independent runtimes (Narrate completed 2026-10-15). Kokoro is the sole narration engine. Source baseline main d8e44864 has the same production code as tested release36ac7466. That release passed quiet gate(1) on 2026-10-23; the owner smoke on 2026-10-26 is RED. See the current review and live Notion register for evidence/status; built/merged held work is not complete.
**Finish line**: the Stage8 release, only when all eleven gates hold on the approved exact candidate; no dated deadline. Gate(2) remains failed/partial after the 2026-10-26 owner smoke. This planning review does not grant a code integration window, merge go or release exception. Any changed candidate receives the applicable gates anew.
**Queue**: live Notion is authority. First-order governance deliverable GOV-SWEEP-FOLLOWTHROUGH-1 occupies0; its approved cleanup and deferred findings have explicit acceptance, while visibility remains the first app fix. The existing release-fix Seq1–6 and held merge train remain. This review specifies five smoke repairs, first LIBRARY-COMPLETION-VISIBILITY-1; the new paused-click child occupies117 and the residual Narrate visual diagnosis moves to124. Visibility now has an owner-approved exclusive implementation window; the remaining prerequisite, package, merge and release gates still apply. Specifications are not dispatches. The phase brief reports all five readiness findings separately.
**Last sprint**: SMOKE8-DIAG-1, UI-SWEEP-TRIAGE-1 and UI-SWEEP-1, all completed 2026-10-23 (TR-083, TR-082, TR-081; close-outs in `docs/governance/close-outs/`). Before them, READER-VISUAL-DIAG-1 (TR-080, 2026-10-23) and CI-AUDIT-ALLOWLIST-1 (TR-079, 2026-10-22).
**Queue source of truth**: [Blurby.Roadmap on Notion](https://www.notion.so/heyevanbrown/3f87c96cc31e800580cfe019c89a56ca), registered as workRegister in Virtuoso/workspace-layout.json. Sprint Code is the identity, Seq is order, and Status is live state. Use the provider's mutation-plan → connector → mutation-confirm flow and refresh the timestamped snapshot after changes. ROADMAP.md remains the specification store. The old workbook is retained solely as migration evidence.

> **Archives:** Completed sprint full specs across `docs/planning/.Archive/ROADMAP_legacy.md` (Phases 1-6), `docs/planning/.Archive/ROADMAP_2026-05-02.md`, `docs/planning/.Archive/ROADMAP_2026-05-14.md`, `docs/planning/.Archive/ROADMAP_2026-05-17.md` (TTS Architecture Completion phase + SK-HYG-2), and `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` (completed phase summaries, Track B Chrome Extension, Track C Android APK, Idea Themes). Closeouts in `docs/governance/close-outs/`. Roadmap review artifacts in `docs/planning/roadmap-reviews/`.
>
> **Git authority:** Resolve effective policy.git from Virtuoso/workspace-layout.json (policy=push, networkOperations=allow). Successful sprints auto-merge to `main` with `--no-ff` and push (CLAUDE.md Rule 5b) unless the spec opts out. Branch deletion stays maintenance. Preserve unrelated work, and update the live Notion register through the provider handshake.

---

## Work lanes

The owner requested product lanes on 2026-09-23. Each Notion record has one primary Lane; shared delivery dependencies remain in the spec and prerequisites. Registry policy.roadmap.lanes declares these six categories.

| Lane | Owns | Current / remaining disposition |
|---|---|---|
| UX polish | Controls, shortcuts, settings, themes, library presentation, accessibility | Controls, settings, appearance and accessibility. Smoke priorities include Focus word-only123 and prompt labels134; E-ink125–130 and UI feedback131–137 retain their approved decisions and specification gates. Existing built/merged items retain release or package holds. |
| TTS / Narration Engine | Synthesis, audio scheduling, spoken-word timing, voices, rate changes, audio pause/resume, audio export | Kokoro is the sole engine; Narrate rebuilt2026-10-15. Paused-click117 waits for its sentence-resume integration; band/viewport diagnosis124 remains separate. Held producer/runtime branches stay In Flight until actual package/merge/close-out gates pass. |
| Reader Engine | Independent Page/Focus/Flow/Narrate lifecycles, rendering, anchors, section handoff, highlighting and scroll-follow | Page, Focus, Flow and Narrate remain independent runtimes. Focus handoff118 is investigation-gated; Page input119 is specified; band/position/key stacks retain their integration order. No sibling-runtime imports or shared mutable mode store. |
| Chrome Extension | Browser capture and reader, pairing, transport/reconnect, desktop delivery of captured content | BROWSER-EXT-FINALIZE-1 remains Stage9 after APP-TABS-1. Pairing/token/security changes already built or merged keep their recorded release and verification holds; the source register decides status. |
| Library & Content | Import/extraction, format conversion, metadata, library persistence/search, reading-queue data | Visibility116 has the owner-approved exclusive LibraryView/test window, before APP-TABS source integration. Folder120 and profile121 diagnosis proceeds separately. Completion confirmation, duplicate presentation and content intake keep their own specification and ownership gates. |
| Platform & Maintenance | Electron process/window/IPC, packaging, builds, shared test infrastructure, project governance | GOV-SWEEP-FOLLOWTHROUGH-1 is the first governance deliverable; current cleanup preserves all held states. Stage8 gate(1) passed on36ac7466, owner smoke gate(2) is RED/partial; branch/package evidence does not grant completion or release. |

**Boundary:** TTS owns the audio/timing contract; Reader owns its visual and navigation consumers. The narration cursor/window work belongs primarily to TTS and requires Reader integration. UX owns presentation and command entry; Library owns the underlying content/data behavior. Tests stay with their feature lane; shared build/test tooling belongs to Platform & Maintenance.

Product lanes do not grant parallel edit permission. The existing execution-surface ownership and shared-core freeze still apply. Lane categorization itself admitted no work. The subsequent owner directive separately added mode separation as Seq 1 and blocked/resequenced its four dependent items.

Mobile/cross-device sync, RSS/news, reading goals/analytics, and social concepts remain deferred initiatives in their existing source documents. They can receive dedicated lanes when activated; the six current categories organize the present project.

See [lane mapping and verification](docs/planning/roadmap-reviews/2026-09-23-lanes.md).

---

## Completed Work Summary

[Preserved completed-work table](docs/planning/.Archive/ROADMAP_completed_summary_2026-10-26.md). No completion statuses changed.

**Superseded work:**
- `NARRATE-HEARD-CURSOR-1`, `NARRATE-APPLYRATECHANGE-COLLAPSE-1`, `NARRATE-SUBSCRIBER-CURSOR-1` — superseded 2026-10-11 by the Narrate rebuild (NARRATE-REBUILD-1; owner ruling #31). Stubs archived to `docs/planning/.Archive/ROADMAP_legacy.md`; [review](docs/planning/roadmap-reviews/2026-10-11-plan.md).
- `HYG-XLSX-DASHBOARD-RESTORE` — superseded 2026-09-23 by the owner's decision to use monday.com; no Excel restoration was performed. [Retained full specification](docs/planning/roadmap-reviews/2026-09-23-retired-specs.md); [migration evidence](docs/planning/roadmap-reviews/2026-09-23-monday-migration.md).

**Dissolved sprints:**
- `DEV-PERF-MEASURE-1` — dissolved 2026-10-14 into FOLDER-SCAN-PERF-1 (owner decision, roadmap review 2026-10-14): BUG-189's dev-mode slowness was measured on the owner's profile with the 120,000-file source folder that BUG-193 shows stalls every launch; FOLDER-SCAN-PERF-1 re-measures dev and production and closes BUG-189 if the slowness is gone. Terminal record TR-071.
- `KOKORO-EXPORT-1` — dissolved 2026-10-11: long-form export is outside the Narrate rebuild's day-one scope and returns later as a new item. Entry archived to `docs/planning/.Archive/ROADMAP_legacy.md`.
- `NARR-PAUSE-STATE-1` — historical reason-aware pause/resume design superseded by the TTS Quality + Reading Experience v2 conveyor on 2026-05-17; source disposition retained, exact terminal date unrecorded. Summary reconciled by owner approval 2026-09-23.
- `LEGACY-NARR-MEDIA-1-DISSOLVED` — historical duplicate proposal dissolved in favor of completed `NARR-MEDIA-1`; original duplicate Sprint Code retained in the register's Notes. Exact terminal date unrecorded. Summary reconciled by owner approval 2026-09-23.
- `TEST-HARNESS-1` — Nano probes irrelevant after Kokoro-only pivot (2026-05-15)
- `TTS-CANARY-1` — Sidecar engines dormant, canary probes unnecessary (2026-05-15)
- `TTS-REGISTRY-DISPATCH-1` — Single active engine, registry dispatch unnecessary (2026-05-15)
- `NARRATE-CLOSED-LOOP-CURSOR` — Half-step approach: introduced `getHeardPositionWordIndex()` oracle at `audioScheduler.ts:521,1036` but consumed it in only ONE call site (Kokoro re-entry seed). 2026-05-29 live-QA gate showed A4 FAIL ("play→pause→play restarts from book beginning") despite the oracle landing. ULTRATHINK 2026-05-29 (`docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md`) identified dual-source race (`cursorWordIndex` ⟷ `lastConfirmedAudioWordRef`) as root cause; Evan's two-cursor framing (subscriber + intent with explicit authority lifecycle) is the right destination. Superseded by `NARRATE-DUAL-SOURCE-DIAG-1` → `NARRATE-INTENT-CURSOR-1` → `NARRATE-PAUSE-RESUME-UNIFY-1` → `NARRATE-CURSOR-TRACKING-DIAG-1` → `NARRATE-APPLYRATECHANGE-COLLAPSE-1` → `NARRATE-SUBSCRIBER-CURSOR-1`. Branch preserved at `sprint/narrate-closed-loop-cursor` commit `0f1b2c8` for reference.

---

## Active & Remaining Sprint Skeletons

### Standing Rules All Skeletons Inherit

1. **PR-2 / PR-3 / POSTV2 type gate:** After any code change run `npm run typecheck` and `npm test`; after any UI/dependency change run `npm run build`.
2. **PR-7:** CSS custom properties for all theming — no inline styles.
3. **PR-10:** All JSON writes must be atomic (write-tmp + rename).
4. **PR-12:** Context for cross-cutting concerns (settings, toasts, theme); props for direct parent-child data.
5. **PR-17:** Never drive imperative DOM animations from React useEffect — use a plain class.
6. **PR-26:** Settings that control a runtime engine must have explicit sync bridges.
7. **SRL-012:** For Full-tier sprints, Solon and Plato tasks MUST be marked parallel-eligible.
8. **Queue depth >=3:** If queue drops below 3 after completion, stop and backfill before next dispatch.
    - *Status (2026-10-12):* after NARRATE-REMOVE-1 the dispatch-ready depth is 0 full specs plus one epic (excluded); this rule and CLAUDE.md Rule 5a stop the next dispatch until `/roadmap-review` backfills.
9. **Spec-compliance before quality:** Each task gets Solon check (does it match spec?) before Plato check (is it well-built?).
10. **Dispatch sizing:** 40 tool-use ceiling per wave. Sprints with 5+ implementation tasks must be pre-split into waves.
11. **SRL-046:** Cross-mode/shared-surface refactors must start with a preflight stabilization gate that locks exact-anchor, visual-follow, and mode-switch invariants.
12. **SRL-047:** Mode adapter specs must include lifecycle reset requirements for local visual refs, browse-away state, cursor baselines, and recenter affordances.
13. **Broad-suite-before-CI:** Do not dispatch CI gate wiring while default broad-suite failures are being waived as unrelated debt; first classify or fix them.
14. **Agent rename propagation:** Any agent rename must include a grep-and-replace pass across governing docs and workflow references before the rename sprint closes.
15. **SRL-053:** Foliate reader-mode runtime changes require screen-interaction manual QA before merge or roadmap advancement.
16. **SRL-054:** Reader-anchor specs must distinguish hard-selected anchor, last-read progress, live playback cursor, and temporary browse-away position.
17. **SRL-055:** Shared Foliate surface behavior needs at least one live UI gate for real layout movement, rendering, and follow behavior.
18. **SRL-056:** Hard-selected anchors must only be cleared by cause-aware lifecycle events that truly invalidate them.
19. **SRL-057:** Same-section and cross-section Foliate movement must be accepted separately.
20. **SRL-058:** Each reading mode needs its own active-render QA gate.
21. **SRL-059:** CSS-column word-position indexes need live rect validation before same-section movement decisions.
22. **SRL-060:** Narrate sync gates must verify heard audio, not only visual cursor position.
23. **SRL-061:** Cross-surface cursor visuals need one declared owner per mode.
24. **SRL-062:** Narrate timing repairs should be sized as investigation-heavy.
25. **SRL-063:** Fixed cursor-lag constants are provisional when audio output latency is hardware-dependent.
26. **SRL-064:** Narrate exact-start and continuous sync are separate acceptance gates.
27. **SRL-065:** Active retarget paths must have a single resync owner.
28. **SRL-066:** Downstream chunk dispatch must use resolved plan boundaries, not raw targets.
29. **SRL-067:** Visual and audio pipelines must not share raw word indexes unless they share tokenization.
30. **SRL-068:** Prefer canonical content alignment over tokenizer unification across renderer/source boundaries.
31. **SRL-069:** Prefetched audio boundaries must be source-owned before driving heard-audio cursors.
32. **SRL-070:** Narrate/sync QA gates require an audio-independent ground truth (Evan's ear, or a non-self-referential instrument such as schedule-vs-wallclock drift). Scheduler-derived metrics (boundary drift, scroll-follow, handoff index) are NOT sync evidence.
    - *Scope note (NARRATE-REMOVE-1, 2026-10-12):* rules 22–32 (SRL-060 to SRL-070) are Narrate-specific. Narrate is removed, so they have no code to govern today; they are kept, not deleted, and apply to NARRATE-REBUILD-1 (its charter restates the ones it adopts).
33. **SRL-073:** Adapter/anchor services that mutate active-owner state must include transition tests proving cleanup happens when ownership changes, plus no-op tests proving same-owner selection does not clear valid state.
34. **SRL-074:** Orchestrators route public lifecycle actions; ref-heavy teardown/truth-sync functions stay as building blocks in the owning hook until their adapter owns the relevant refs — do not force them across a boundary just to make an extraction look complete.
35. **SRL-079 — Source-fix verification needs rebuild gate.** Any bug whose disposition is "RESOLVED in source — production build needs rebuild" stays OPEN in BUG_REPORT.md until `npm run build` + a smoke-test pass against the bug's original reproducer confirms the rebuilt binary behaves correctly. The fix is not closed when the source diff lands; it is closed when the binary the user is actually running embodies the diff. **Why:** Five consecutive bugs drifted past close-out with the fix in source but the running binary stale (BUG-176/178/179/180/181), and the 2026-05-27 live-QA discovery sweep re-found BUG-181 as "F2" because rebuild had never happened. The pattern wastes downstream investigation cycles. **How to apply:** Any sprint with "verification blocked by stale production build" in close-out remains OPEN. Adopt rebuild+smoke as the explicit final acceptance step for source-fix-only sprints. (Promoted 2026-05-28 after the discovery sweep / rebuild verification pass.)
36. **SRL-086 + SRL-087 — Verify state before consequential action (umbrella).** Codebase facts must be grep-verified at the moment of consequence (SRL-086); environment state — current git branch, working directory, build version, file freshness — must be verified before edits or workflows that depend on it (SRL-087). SRL-079 (rebuild gate) and SRL-085 (smoke build-version gate) are concrete instances of the same principle. Umbrella: *accumulated context is not verified state; trust must be earned by an explicit verification step at the moment of consequence.* **Why:** Two occurrences in under one hour on 2026-05-29 of the trust-without-verify error: (a) the original ULTRATHINK + first roadmap-review fold-in propagated codex-parent's "~14 speakNextChunk call sites" without grep — actual count was 6 (SRL-086); (b) the same fold-in's "corrective" grep then ran against the dissolved branch instead of main because branch state wasn't verified — half the corrections were branch-specific and required a third commit (`cb6e894`) to reconcile against main's actual line numbers (SRL-087). Cost asymmetry: verify is cheap (seconds); recovery is expensive (~25 min of git handoff + amendment commits for the second occurrence). The rate of recurrence (two occurrences, two different verification axes, same day) is decisive evidence the principle is load-bearing, not theoretical. **How to apply:** Any Cowork workflow that produces dispatch-ready artifacts (`/roadmap-review`, `/write-spec`, sprint-spec amendments, adversarial-review fold-ins, Aristotle enumeration memos, Hercules instrumentation passes) MUST begin with explicit state verification — at minimum: `git status`, `git branch --show-current`, and confirm build version where the verdict depends on it. Spec citations for line-number-dependent claims MUST include branch + commit hash + grep date (format: *"lines X, Y, Z grep-verified against main @ HASH on DATE"*). Aristotle's enumeration memos remain authoritative at execution time — they re-grep from source then — but the pre-execution spec should be precise enough that the memo confirms rather than discovers. (Promoted 2026-05-29 jointly after two same-day occurrences of the verify-before-acting pattern across two different verification axes.)
37. **SRL-089 — Don't parallel-launch work that depends on an in-flight agent's output.** Worker agents dispatched in parallel onto a shared worktree must declare write-disjoint surfaces. Dependent workers — where worker B's correctness depends on worker A's output — must NEVER be dispatched in parallel onto the same tree; they must be serialized OR each operate in its own git worktree (`git worktree add`). **Why:** Two occurrences in two consecutive sprints — NARRATE-DUAL-SOURCE-DIAG-1 (2026-05-30) and NARRATE-INTENT-CURSOR-1 Task 3 (2026-05-31). Same naive fan-out pattern (parallel workers, shared tree, no isolation, B depends on A); ~90 min wasted compute per occurrence (3 hours total). Both occurrences caught at close-out and required clean redo from a serialized dispatch. Cost asymmetry: serialize/isolate is seconds of dispatch overhead; parallel-mis-dispatch is ~90 min wasted compute per occurrence. The rate of recurrence (two occurrences, two consecutive sprints, same orchestration pattern) is decisive evidence the rule is load-bearing. **How to apply:** Zeus (and any orchestrator) must include a dependency-and-tree-isolation check before parallelizing worker dispatches. The two safe patterns: (a) serialize workers when surfaces overlap or outputs feed each other; (b) `git worktree add` per worker when parallelism is required for latency reasons. Sprint Task tables that mark dependent tasks `parallel-eligible` are spec defects and must be caught at Plan-tier review. (Promoted 2026-05-31 after the 2nd occurrence in NARRATE-INTENT-CURSOR-1, per SRL-012's two-validated-occurrences promotion convention.)

38. **Compensation and measurement before optional perceptual rewrites (2026-06-01 decision).** Before changing cursor/reducer architecture to fix perceived audio lead, trace the current signal chain and use an audio-independent probe to test the residual. Do not assume compensation is missing: current main has trusted lag 450 ms and heuristic lag 350 ms, already consumed by scheduler paths. HEARD still gates conditional SUBSCRIBER work after mode isolation. This rule does not block the owner's distinct 2026-09-23 requirement to separate reading-mode runtimes first. Sources: [June sequencing decision](docs/planning/roadmap-reviews/2026-06-01-plan.md#key-design-decision-encoded), [LL-127](docs/governance/LESSONS_LEARNED.md), [review corrections](docs/planning/roadmap-reviews/2026-09-23-lessons-applied.md). The former SRL-090 label is withdrawn here because the close-out retrospective uses it for structured-file verification. **Superseded for NARRATE-REBUILD-1 (OutsideAudit.10, 2026-10-11):** the 450 ms "trusted" lag was applied to weighted estimates carrying a native label in the current code path; the source records it as tuned from QA listening (`src/constants.ts:131-135`), not derived from a measured acoustic offset. The rebuild forbids a hand-tuned lag constant (its charter inputs, item 1; LL-142).

39. **LL-112 — Characterize before extracting shared code.** A refactor that merges duplicated implementations into one shared module starts with a separate commit of characterization tests on the unmodified code, and the extraction must pass them unchanged (apart from any owner-approved behavior change, which flips exactly one expectation). **Why:** applied and held in TTS-SIDECAR-SHARED-1 and TTS-ENGINE-SHARED-1 (2026-10-10). (Promoted at the second 2026-10-10 roadmap review.)

40. **LL-130 — Plan an external register write only to execute it.** `mutation-plan` opens a durable recovery record, so it is not a dry run. Call it only when the connector write follows immediately, read the item back, then `mutation-confirm` (or `mutation-abandon`). **Why:** applied and held in three close-outs on 2026-10-09/10. (Promoted at the second 2026-10-10 roadmap review.)

41. **LL-136 — Exact-path fences exempt the time log.** Every Done-when row of the form "the diff lists exactly …" exempts `docs/governance/close-outs/Timing.<ITEM-ID>.jsonl`, and the registry must let the executing ceremony write it. **Why:** recurred three times (TERMINAL-BACKFILL-1, TTS-ENGINE-SHARED-1, READER-MODE-SEPARATION-2); each time no time log was kept and effort calibration stayed not computable. (Promoted at the 2026-10-11 roadmap review.)

42. **LL-135 — A dispatch carries its reconciliation recipe.** Every dispatch prompt pastes the filled repository-reconciliation recipe, or cites a committed path to it; a chat message is never an input. **Why:** applied and held in four close-outs (TERMINAL-BACKFILL-1 introduced it; EINK-HOVER-FIX-1, LIBRARY-SETTINGS-FIX-1, TEST-TIMEOUT-HEADROOM-1 and NARRATE-REMOVE-1 held it). (Promoted at the 2026-10-12 roadmap review.)

43. **LL-138 — A behaviour change needs a positive control.** Before a change is made, the test that guards it is committed and shown to fail on the unchanged code for the stated reason, and the failing output is recorded; a gate that cannot fail proves nothing. **Why:** held in TTS-ENGINE-SHARED-1, EINK-HOVER-FIX-1, LIBRARY-SETTINGS-FIX-1 and NARRATE-REMOVE-1 (where omission controls also proved each normalization seam). (Promoted at the 2026-10-12 roadmap review.)

44. **LL-143 — Dry-run every acceptance gate.** Every Done-when command names its shell and passes only on an exact exit code; any other code, any stderr text or a command that did not run fails it. Before dispatch, each gate is run against the base (a search gate must find its hits there) and against the prescribed edit. **Why:** OutsideAudit.10 found vacuous `rg` gates and miscounted wiring gates (F5a, F5b), and LIBRARY-SETTINGS-FIX-1's "no literal 1000" row could not pass as written: two occurrences. (Promoted at the 2026-10-12 roadmap review.)

45. **LL-141 — Live UI gates keep an owner-observed route.** A specification with live UI checks names up front which behaviours need a human (real input, perceptual checks) and keeps a short owner checklist for them; unattended live runs include a throttle or visibility check that voids results taken while the window was throttled. **Why:** held in READER-MODE-SEPARATION-2 and NARRATE-REMOVE-1 (whose Done-when 16 was owner-observed). (Promoted at the 2026-10-12 roadmap review.)

46. **LL-153 — A dispatch settles what the executing session may write to the register.** The dispatch names the register fields the run may write (if any); status moves, Seq and completion stay with the ceremonies (`/roadmap-review`, `/pointer-closeout`). **Why:** applied and held in HB-2 and HB-3 (2026-10-13): each run wrote only its stated text fields, and the mapped-column hash was unchanged. (Promoted at the 2026-10-13 roadmap review.)

47. **LL-147 — A gate defined on the owner's machine runs in a local session.** An item whose Done-when names the owner's machine (the full suite, load-dependent timeouts, live smoke, Windows paths) is dispatched to a local session on that machine, and the dispatch says so; a cloud session is used only when every gate is platform-neutral. **Why:** applied and held in four close-outs (TEST-TIMEOUT-HEADROOM-1 introduced it after two cloud runs could not meet their gates). (Promoted at the 2026-10-14 roadmap review.)

48. **LL-149 — Every Done-when list restates the type and build gates.** Every item that adds or edits TypeScript, test files included, lists "`npm run typecheck` exits 0" in its Done-when, and "`npm run build` exits 0" for any UI, styling or packaging change, next to `npm test`. A run gates on its Done-when, not on the standing rules it was told to read. **Why:** applied and held in four close-outs after LIBRARY-SETTINGS-FIX-1 merged with a type error its Done-when never checked. (Promoted at the 2026-10-14 roadmap review.)
49. **LL-148 — A file never names the merge that lands it.** No Done-when row or staging plan asks a committed file to carry the sha of the merge that brings it in. The in-change status line names the item (`RESOLVED in source (<ITEM-ID>)`), and the merge sha goes in what is written after the merge: the close-out, the register's evidence and the terminal ledger. **Why:** EINK-HOVER-FIX-1 merged twice for one XS item; the rule then held in four close-outs. (Promoted at the 2026-10-22 roadmap review.)
50. **LL-156 — A waiver moves with its code.** Before dispatch, every Out-of-scope line, waiver and known-failure entry is re-read against the specification's own edit sites. A waiver whose code the item moves, merges or replaces is brought into scope or restated against the new location. **Why:** SETTINGS-WRITE-DURABLE-1's KF-2 exclusion silently became an exclusion of its own new writer; the rule then held in two close-outs. (Promoted at the 2026-10-22 roadmap review.)
51. **LL-164 — A lesson status is never set back.** At dispatch and again before close-out, every lesson-status line a specification asks the run to append is compared with that lesson's current status (`lessons --open`). If the lesson was promoted or retired since the specification was written, the line becomes a plain outcome note naming the current status, or is dropped. Never append a status that ranks below the current one. **Why:** KF2-WAIVER-RETIRE-1's correct-per-spec append turned LL-156, promoted to rule 50 that same day, back into a live observation, and every Done-when still passed. The rule held in three close-outs. (Promoted at the 2026-10-23 roadmap review.)
52. **LL-146 — Evidence that looks like a test is a test.** A script or test copied into the repository as evidence or as a spec's red test is saved under a name the test runner does not collect (append `.txt`), until the run copies it into `tests/`. Before merging a docs commit that adds code-like files, confirm with `npx vitest list` that the collected set did not change. **Why:** two `*.test.*` evidence files under `docs/` broke `main`'s full suite on 2026-10-12, and two dispatches stopped or merged red on failures outside their scope. The rule held in two close-outs, and every spec carrying a red test since depends on it. (Promoted at the 2026-10-23 roadmap review.)
53. **LL-167 — No dispatch merges or closes until its packaged build is verified (owner directive, 2026-10-23, through Blurby.Brain).** (a) Build `npx electron-builder --win --dir` with an explicit arch flag (`--arm64` on this ARM64 machine, the build the owner runs; amended by Blurby.Brain 2026-10-23) from the final commit with `origin/main` merged in, in the dispatch's own worktree, never over another build. (b) Grep the built `main.js` for `BLURBY_USER_DATA_DIR` (builds before `238f47ec` open the live profile), then run `release\win-unpacked\Blurby.exe` on a fresh scratch profile for 25 s on the verifying machine's native arch (arm64 here, so the arm64 native modules in `app.asar.unpacked` load; an x64 build under emulation is optional extra evidence): it stays alive; stdout, stderr and `error.log` hold no error, unhandled-rejection or crash line; no crash dump appears. The live profile is untouched: the live files `%APPDATA%\blurby\blurby-data\library.json` and `%APPDATA%\blurby\blurby-data\settings.json` hash the same before and after, named exactly, never the profile root (amended by Blurby.Brain, 2026-10-25). Known noise in (b), recorded and not a failure: `Backup failed for …library.json: ENOENT` on a fresh profile's first launch (BUG-217, until fixed), and an `EADDRINUSE` on `127.0.0.1:48924` when the owner's installed Blurby (`AppData\Local\Programs\blurby`) is running; check the port's owner with `Get-NetTCPConnection -LocalPort 48924` and record it. (c) `npx asar list` shows each changed `main/` file, and the renderer bundle in `app.asar` matches `dist/`. (d) The automatable Done-when checks re-run against the packaged exe, not dev mode. (e) The outputs go in a "Package verification" section of the close-out; the dispatch sends Blurby.Brain the package path, commit and logs; Blurby.Roadmap gives the merge go only after Brain confirms. A dispatch that changes nothing under `package.json` `build.files` records "package unchanged" with `git diff --name-only` against the last verified commit. It applies to every item not yet closed, In Flight ones included. For a branch built before the rule (Blurby.Brain, 2026-10-23): an earlier packaged `--dir` live check counts toward (b) and (d) only if it was built from the exact commit that will merge, with current `origin/main` already merged in; otherwise rebuild and re-run (a)–(e). (c) and (e) are always required. A `release/` output is never deleted before its dispatch's package is verified.
54. **LL-158 — A live row names a trigger proven to commit the state it checks.** A live smoke or owner re-measure row that checks state persisted across an action (quit, reopen, sync, import) names the action that commits that state. Before the row is written, a no-action control on the base shows that state unchanged without the trigger, and the trace runs end to end at the real data size. **Why:** occurred twice, in rows unreachable for reasons in code the item did not change: SETTINGS-WRITE-DURABLE-1 and QUIT-FLUSH-1 Done-when 9(f), where Page turns never wrote a position (LL-158 status record). Promoted by roadmap review 2026-10-25.
55. **LL-151 + LL-166 — A verdict counts only from an instrument shown able to give the opposite verdict.** A gate recorder is shown to record a FAIL before its PASS is trusted (LL-151). A no-effect or null verdict needs a detector that reads state, and a press made where the control should act, shown to detect an effect on a case that has one (LL-166). Rule 43 covers this for tests; this rule covers recorders, sweeps and harnesses. **Why:** LL-151 applied and held in 3 close-outs; LL-166 is its second occurrence, on the null side (UI-SWEEP-1 and UI-SWEEP-TRIAGE-1). Promoted by roadmap review 2026-10-25.

**Rule provenance:** Existing numbered rules above retain their historical source labels; registry policy.standingRules.ids declares no additional IDs. Ref ownership in SRL-074 was an intermediate extraction boundary: this approved stage moves the refs together with the owning implementation. User-mandated complete mode separation governs the target architecture.

Deviation protocol: a skeleton may override a standing rule only by naming the rule and justifying the waiver in its spec.

> **Architecture context:** AD-1 through AD-4, Cross-Sprint Type-Flow Matrix, Dissolved Sprints, and all grounding evidence / implementation detail in [`docs/planning/.Archive/ROADMAP_SPECS.md`](docs/planning/.Archive/ROADMAP_SPECS.md) (archived 2026-10-13; describes the pre-NARRATE-REMOVE-1 pipeline).

---

### Phase: Reader Runtime Solidification

#### Stage 1 — Manual QA Repair Gate *(complete — archived)*

Persistent-anchor repair lane (Steps 3.1–3.6) closed by explicit disposition; S1/S4/S8/S12/S18 fixed, S5 accepted partial, S9 deferred. Full specs archived to `docs/planning/.Archive/ROADMAP_2026-05-25.md`. The residual S13 Narrate cursor/content sync moved to post-isolation `NARRATE-CLOSED-LOOP-CURSOR`.

#### Stage 2 — Reading-mode separation (owner-mandated step 1) *(complete — archived)*

The owner directed complete mode separation on 2026-09-23 because changes in one mode repeatedly disrupt others. This is the first mandatory delivery stage. Existing adapter extraction is historical groundwork; shared runtime ownership still has to be removed.

**Completed 2026-10-11:** READER-MODE-SEPARATION-2 — Page, Focus, Flow and Narrate run as independent runtimes behind a thin router (merge `d96d2f3f`, packet `ce740582`). Narrate listening checks were dropped by owner ruling #32, and Narrate is to be removed and rebuilt (#31). See the [close-out](docs/governance/close-outs/CloseOut.READER-MODE-SEPARATION-2.2026-10-11.md); the specification and its staging fold-ins are archived to `docs/planning/.Archive/ROADMAP_legacy.md`. <a id="reader-mode-separation-2"></a>

#### Stage 3 — Narration rebuild (owner ruling #31; finish line "Narration rebuilt")

The owner ruled on 2026-10-10 to remove Narrate and rebuild it from the ground up, disconnected from the other modes (READER-MODE-SEPARATION-2 Decision #31). The 2026-10-11 roadmap review absorbed the aligned storyboard and plan, held entry [`2026-10-11-narrate-rebuild`](docs/planning/holding/2026-10-11-narrate-rebuild.md), as the two items below.

The four earlier narration items were retired on 2026-10-11:
- NARRATE-HEARD-CURSOR-1, NARRATE-APPLYRATECHANGE-COLLAPSE-1 and NARRATE-SUBSCRIBER-CURSOR-1 are superseded by the rebuild;
- KOKORO-EXPORT-1 is dissolved.

Their stubs are archived to `docs/planning/.Archive/ROADMAP_legacy.md`. <a id="narrate-heard-cursor-1"></a><a id="narrate-applyratechange-collapse-1"></a><a id="narrate-subscriber-cursor-1"></a><a id="kokoro-export-1"></a>

NARRATE-REMOVE-1 completed 2026-10-12 (merge `386651fc`), so NARRATE-REBUILD-1 has no open prerequisite and `/epic` may start. The removal base is `612d03f5bdadf861a875d76c6260fd8d3a7520aa` (the `NARRATE-REMOVE-1-Base:` trailer of C1, `238e12e6`); the deleted fixtures and code are recoverable at that sha (`git show 612d03f5bdadf861a875d76c6260fd8d3a7520aa:<path>`).

**Completed 2026-10-12:** NARRATE-REMOVE-1 — the Narrate mode, its hooks, strategies, renderer UI, and the dormant MOSS-Nano, Pocket and Qwen engines are deleted; Kokoro stays dormant in the main process with no UI path; a v13 migration and three ingestion points turn a saved `narrate` reading mode into `flow`; the Page, Focus and Flow baselines are byte-identical (merge `386651fc`; [close-out](docs/governance/close-outs/CloseOut.NARRATE-REMOVE-1.2026-10-12.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). <a id="narrate-remove-1"></a>

<a id="narrate-rebuild-1"></a>

#### UX-POLISH-1 — Space resumes the last-used reading mode *(merged `e942e3fd` 2026-10-13; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `e942e3fd` on 2026-10-13. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#ux-polish-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

#### Stage 4 — Codebase simplification (owner-requested backlog)

Five additions requested on 2026-09-23. **Completed 2026-10-10:** CLOUD-RETRY-SHARED-1, TTS-SIDECAR-SHARED-1 and CLEANUP-LEGACY-PARSERS-1, run together as EPIC-MAIN-PROCESS-CLEANUP and merged to `main` (`dd3db29c`, `7a462bf7`, `b95dbb55`). See the [close-out](docs/governance/close-outs/CloseOut.EPIC-MAIN-PROCESS-CLEANUP.2026-10-10.md); the full specifications are preserved at `git show aafed6c4:ROADMAP.md`. <a id="cloud-retry-shared-1"></a><a id="tts-sidecar-shared-1"></a><a id="cleanup-legacy-parsers-1"></a> **Completed 2026-10-10:** TTS-ENGINE-SHARED-1 — `main/python-sidecar-engine.js` is the one MOSS/Pocket engine implementation (merge `8cedd0cc`; [close-out](docs/governance/close-outs/CloseOut.TTS-ENGINE-SHARED-1.2026-10-10.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). <a id="tts-engine-shared-1"></a> **Open follow-up (unscheduled):** `getSharedMossNanoEngine` / `getSharedPocketTtsEngine` with `{reset:true}` replace the singleton without shutting the old engine down; both engines are dormant. Remaining: CLEANUP-MODE-BARREL-1 (Full Spec, position 13; roadmap review 2026-10-12).

<a id="cleanup-mode-barrel-1"></a>

**Completed 2026-10-13:** CLEANUP-MODE-BARREL-1 — `src/modes/` holds only `ModeInterface.ts`; the legacy barrel and engines are deleted, `tests/perf-baseline.test.ts` imports the per-mode runtimes, the dead `NarrateMode` build rule is gone, and `tests/modeLegacyRetired.test.ts` guards their return (merge `03e218bd`; [close-out](docs/governance/close-outs/CloseOut.CLEANUP-MODE-BARREL-1.2026-10-13.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`). Stage 4 is done.

#### Stage 6 — Parallel polish (outside the separation fence)

Added by the second 2026-10-10 roadmap review. The owner asked for work that can run while READER-MODE-SEPARATION-2 waits on owner gate OS-1. Both items are file-disjoint from that branch's diff (331 files, merge base `aafbb1c9`), from each other, and from the shared-core freeze set. See the [plan](docs/planning/roadmap-reviews/2026-10-10-2-plan.md).

**Completed 2026-10-12. Stage 6 is done.** The three specifications are archived to `docs/planning/.Archive/ROADMAP_legacy.md`.

- <a id="test-timeout-headroom-1"></a>**TEST-TIMEOUT-HEADROOM-1** — the three load-sensitive tests carry 30 s timeouts (KF-3 retired), and `tests/seenBatcher.test.ts` types its mock (mid-dispatch amendment). The full suite passed twice on the owner's machine, and typecheck exits 0 (merge `072a65f3`; [close-out](docs/governance/close-outs/CloseOut.TEST-TIMEOUT-HEADROOM-1.2026-10-12.md)).
- <a id="eink-hover-fix-1"></a>**EINK-HOVER-FIX-1** — the e-ink hover rule is limited to interactive leaves, so overlays stay opaque (merge `61bad595`, sha record `1916d899`; [close-out](docs/governance/close-outs/CloseOut.EINK-HOVER-FIX-1.2026-10-12.md)). BUG-184 stays open until the owner's e-ink smoke after a rebuild.
- <a id="library-settings-fix-1"></a>**LIBRARY-SETTINGS-FIX-1** — every Ctrl+K settings entry opens a titled page, and a library card's "New" dot clears live (merge `8c41095e`; [close-out](docs/governance/close-outs/CloseOut.LIBRARY-SETTINGS-FIX-1.2026-10-12.md)).

#### Stage 7 — Platform health and reader polish (roadmap review 2026-10-12)

Added by the 2026-10-12 roadmap review to refill the dispatch buffer from real defects while the Narrate rebuild epic runs (owner decision: the epic first, these as the buffer). Each item states its lane ownership; it may run beside the epic only when its files are disjoint from the epic's current phase. See the [plan](docs/planning/roadmap-reviews/2026-10-12-plan.md).

<a id="parallel-run-plan-2026-10-13"></a>**Parallel run plan (roadmap review 2026-10-13; owner rulings the same day).** The epic is in P5 (Decision #18 latency repair round, then T7 trials and the P5 gate), then P6 (production build, owner gate G2). P5's branch owns `main.js`, `preload.js`, `src/types.ts` (shared-core), `src/constants.ts`, `main/narrate/**`, `main/ipc/narrate.js`, `src/reader/modes/narrate/**`, `tests/narrate/**`, `patches/kokoro-js+1.2.1.patch`, `scripts/narrate-rebuild/**` and the separation census `boundary-policy.json` (diff `331f8313..eb/narrate-rebuild-1-p5`, read 2026-10-13).

- **Measurement windows (owner, 2026-10-13).** File-disjoint items are implemented in parallel, but their heavy gates — full `npm test`, `npm run build`, `npm run dev` or production-app sessions — run only while the epic is not measuring. The epic's measurement windows are its D3 recorded-output runs and its D6/T7 latency trials. Before a heavy gate, the parallel run reads the epic's `state.md` *Where we are* block on `eb/narrate-rebuild-1-p5` (`git show refs/heads/eb/narrate-rebuild-1-p5:docs/planning/epics/2026-10-12-narrate-rebuild/state.md`) and asks the owner whether a trial is running; it waits while one is. The charter is unchanged. A heavy gate that overlapped a trial is reported to the owner, because that trial is then suspect. Targeted `npx vitest run <file>` runs and code edits are allowed at any time.
- **Run now:** TEST-BUDGET-WORDINDEX-1 and CLEANUP-MODE-BARREL-1 (both file-disjoint; CLEANUP amended below for the P4 `NarrateMode*` identifiers).
- **Run now, live sessions outside windows:** READER-VISUAL-DIAG-1 (docs only; its owner sessions and profiling load the machine).
- **Build now, merge after P5:** SETTINGS-WRITE-DURABLE-1 shares `main.js` with P5 (different hunks; see its amendment). It merges after P5 merges and before P6's production build, so G2 is heard on durable settings and P5's gate evidence is undisturbed. *Done 2026-10-13: merged `b728a3e8` after P5 (`05a5480a`), before P6's build.*
- **After P5 merges:** UX-POLISH-1 edits `src/components/ReaderContainer.tsx` while P5 edits `src/types.ts` (one shared-core sprint at a time). Re-authored below for the rebuilt Narrate.
- **Owner time:** P6's G2 listening session can carry UX-POLISH-1's and SETTINGS-WRITE-DURABLE-1's owner smokes on the same production build if both have merged by then.

<a id="test-budget-wordindex-1"></a>

**Completed 2026-10-13:** TEST-BUDGET-WORDINDEX-1 — the 5,000-span word-index test's budget is 1,000 ms with its coverage assertions kept; BUG-186 resolved (merge `76956729`; [close-out](docs/governance/close-outs/CloseOut.TEST-BUDGET-WORDINDEX-1.2026-10-13.md); specification archived to `docs/planning/.Archive/ROADMAP_legacy.md`).

<a id="settings-write-durable-1"></a>

**Completed 2026-10-13:** SETTINGS-WRITE-DURABLE-1 — per-file serialized JSON writes in `main/json-store.js` with a bounded rename retry, non-rejecting settings/history/site-cookie saves, the sync-queue on the same writer, and a settings flush at quit; no ENOENT in the owner smoke (merge `b728a3e8`; [close-out](docs/governance/close-outs/CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md); specification and staging memo archived to `docs/planning/.Archive/ROADMAP_legacy.md`). The quit flush is cut off at exit like the library flush (BUG-192, open; owner-authorized exclusion of Done-when 7(b)). BUG-185 closes after the P6 production build and the G2 smoke (standing rule 35).

<a id="reader-visual-diag-1"></a>

#### Stage 8 — Launch, quit and packaging defects found at G2 (roadmap review 2026-10-14)

Added by the 2026-10-14 roadmap review from the defects the epic's G2 preparation and the owner smokes surfaced. The finish line is still the epic; these are sideways fixes that make the G2 build and daily use sound. See the [plan](docs/planning/roadmap-reviews/2026-10-14-plan.md).

**Session routing (owner, 2026-10-14; corrected the same day by the owner to Blurby.Roadmap: "you coordinate all work but brain will stay coordinating the other machine").** Blurby.Roadmap coordinates all work: it dispatches, sequences and gives the merge go for items built on this machine (the implementation session blurby-05), and runs governance (ROADMAP.md, specifications, BUG_REPORT.md, LESSONS_LEARNED.md, the Notion register, `/pointer-closeout`). Blurby.Brain coordinates the second machine ("Quiet blurby test machine") and its run queue, and has the owner's delegated authority for all technical questions (owner ruling2026-10-26, [Blurby.Brain](thread://01a179e8-7a40-75c0-93f4-d3045ad99027?hostId=local)); design and functionality questions remain the owner's. Mixed questions retain owner design approval. This delegation alone changes no source-freeze, package or release gate.

**Release gate (Blurby.Brain, 2026-10-14, Rule 11 tier 1; widened the same day).** Stage 8 items merge on automated gates while the owner is away (option A): each stays In Flight with its close-out held, and nothing is released (no tag, no published build, no CI upload) until all five hold: (1) the batched quiet full suite on `main` passes on the second machine ("Quiet blurby test machine") after the last Stage 8 merge, together with a re-run of NARRATE-REBUILD-1's D3 and D6 on that final `main` (DEPS-AUDIT-1 moves the Electron runtime); (2) the batched owner smoke on one production build of that `main` passes, covering every deferred owner check (PACKAGING-FIX-1 Done-when 10, UX-POLISH-1 (c), (e), (f), UX-POLISH-2 Done-when 12, LIBRARY-READ-ALLOW-1, LARGE-FOLDER-SYNC-1's real-folder check, PAGE-POSITION-SAVE-1, IPC-PATH-TRUST-1, SAVE-LIBRARY-MERGE-1, a quit with Narrate playing and then paused showing no crash dialog and no crash dump (NARRATE-EXIT-CRASH-1; a crash makes it a release gate), FOLDER-UNREACHABLE-GUARD-1 Done-when 15 with its toast check (D), FOLDER-NOTICE-1's banner and one-press Retry check when it has merged, PDF-IMPORT-DIAG-1 Done-when 10 (open `DNC. May-20-2026` in Page mode with no new `conversion failed` line in `error.log`; added 2026-10-22), PAGE-POSITION-SAVE-2's optional touch-device swipe row (added 2026-10-22), the installed release build on the owner's ARM64 machine reports native `arm64` (RELEASE-RUNBOOK-1, owner decision B; added 2026-10-22), and the later items' deferred checks); (3) DEPS-AUDIT-1 is merged (a crafted EPUB can crash main through `adm-zip`); (4) SAVE-LIBRARY-TRUST-1 is merged; (5) IPC-PATH-TRUST-1 is merged (both close renderer-supplied paths that defeat `read-file-buffer`'s boundary). **Widened again (2026-10-14, Blurby.Brain):** (6) SAVE-LIBRARY-MERGE-1 is merged (SAVE-LIBRARY-TRUST-1 alone would lose a non-EPUB conversion, and a stale save drops tombstones, BUG-199); (7) SETTINGS-KEY-TRUST-1 is merged (the renderer can overwrite the extension pairing secret, and cloud sync carries it and folder paths); (8) FOLDER-UNREACHABLE-GUARD-1 is merged (BUG-195, and LARGE-FOLDER-SYNC-1's per-file remove deletes books on any read error). **Widened 2026-10-15 (Blurby.Brain):** (9) GET-STATE-SECRET-1 is merged (no secret reaches the renderer through `get-state` or the extension-pairing handlers; the renderer displays imported third-party HTML). (10) PAGE-SAVE-RESTAMP-GUARD-1 is merged or closed on evidence (PAGE-POSITION-SAVE-1 saves on every page turn, so a turn before the book's word numbers apply could save a position up to 91 words off; Blurby.Brain 2026-10-15). (11) ELECTRON-42-UPGRADE-1 is merged (the fix for NARRATE-EXIT-CRASH-1's upstream cause) and gate (1) re-runs with 0 crashed launches (gate (1) on 2026-10-15, main `1da81be2`, passed every measurement but 57 of 121 cold-trial launches exited 0x80000003 after the quit flush; Blurby.Brain). **Widened 2026-10-22 (Blurby.Brain):** (12) a written release runbook exists ([RELEASE-RUNBOOK-1](#release-runbook-1)): no workflow builds or uploads installers (`release.yml` was deleted in `e9bbf56a`), so the release is a manual step, and the runbook must exist before the batched owner smoke. Full-suite failures under load on this machine follow Brain's closed-list rule. KF-2 is retired (KF2-WAIVER-RETIRE-1, 2026-10-22): a failing test whose message reports a real rename error (`EPERM`, `EBUSY` or `EACCES` with `rename '<path>'`) is always a product failure, even under load, and goes to Blurby.Brain. The closed list admits exactly two load failures, each only when the test is outside the item's diff and passes twice when re-run alone: (1) `tests/folderWatcher.test.js`, the 50 ms budget in "a 1 MB read started 20 ms after startWatcher on a 3,000-file tree resolves within 50 ms, and no event-loop gap exceeds 250 ms in the next second"; (2) `tests/readerModeBoundaries.test.ts`, the 30 s timeout of "production mode graphs share only declared data and ports". `tests/jsonStore.test.js` left the list with JSONSTORE-TIMEOUT-1 (2026-10-22): any failure in it is a product failure. Every failing full run records each failing test's first error line. NARRATE-REBUILD-1's completion runs on the second machine after LARGE-FOLDER-SYNC-1 and PAGE-POSITION-SAVE-1 merge (both merged 2026-10-14: `0eb46e33`, `309f2390`), from the handoff package on `eb/narrate-rebuild-1-p6` (`second-machine.md`, hash-checked inputs).

**Release observation (Blurby.Brain, 2026-10-25; from WIN-TARGET-NSIS-1's x64 install check):** the packaged 1.75.1's updater reports "latest version: 1.1.2, downgrade is disallowed", because the `gorillabrown/Blurby` releases feed still names 1.1.2 as the latest release. It is not a bug in WIN-TARGET-NSIS-1, and it matters only once releases are published again: the release that publishes 1.75.1 (or later) makes it the feed's latest ([RELEASE_RUNBOOK](docs/governance/RELEASE_RUNBOOK.md)). Check the updater line again in the release's own smoke.

**Gate (1) result, 2026-10-23: PASSED (run 4, `36ac7466`; Blurby.Brain).** The quiet machine (i7-1185G7, 4 cores / 8 threads, D6's mainstream class) ran the full suite and the timed checks on the release-fix sha. Results:
- 0 of 51 launches crashed, so gate (11)'s re-run condition is met.
- The quiet suite passed: 2,452 passed, 1 skipped, 0 failed in 181 files, and typecheck exited 0.
- Both timed sessions passed. D3's mapping uncertainty was 0.64 and 0.68 ms, and D5 found 0 outside, 0 drops and 0 repeats.
- D6: the worst warm trial was 2,171 ms (under 2,500) and the worst cold trial 2,589 ms (under 8,000).
- Electron reported 42.11.18.
The cold-click attribution misses are listed, not judged, until NARRATE-HARNESS-COLDCLICK-1. Record: `docs/governance/close-outs/Gate1.STAGE8-RUN4.2026-10-23.md`. Gate (2)'s smoke re-check on the installers from this sha is still owed.

**Gate (2) result, 2026-10-23: FAILED.** The owner smoke on `47ae6e1f` (`docs/governance/close-outs/Smoke.STAGE8.2026-10-23.md`) passed 33 of 40 checks. It failed #8, BUG-201 (Page reopen position, a release blocker), and #28, BUG-202 (stale folder header, pending reproduction). The first ARM64 installer also failed (#1), and was fixed by RELEASE-RUNBOOK-1's BCJ build. [SMOKE8-DIAG-1](#smoke8-diag-1) diagnoses BUG-201 and BUG-202. The fixes land on `main` as the release fix. Then gate (1) and the failed and not-run smoke checks (#8, #9, #28–#30, and the owner's tray right-click on #1) re-run on the new sha. The freeze holds, moving to that sha.

**Freeze moved again, 2026-10-23: the release-fix sha is `36ac7466` (KEEP-FURTHEST-FIX-1, BUG-209, owner: Keep reopens on the furthest page).** The installers from `97527896` are superseded and are rebuilt from `36ac7466`. Gate (1) targets `36ac7466`. The smoke re-checks add the backtrack scenario: in Page, turn ahead several pages, go back, choose Keep at furthest, then reopen. The book should open on the furthest page. Checked and not gates (v1.28.0 bisects, 2026-10-23): the EPUB chapter buttons and `]` (dead at v1.28.0; JUMP-LANDING-SAVE-1), and the Focus/Flow navigation keys #92–95 and #100–103 (broken at v1.28.0; post-release). `de453e64` and later governance merges change no shipping file. **Freeze moved, 2026-10-23: the release-fix sha is `97527896`.** The release fix merged in this order: PAGE-REOPEN-CFI-1 (`34bec523`), BOOK-TEXT-COLOUR-1 (`c83c6553`), FOLDER-SWITCH-HEADER-1 (`ba591572`), NARRATE-START-STACK-1 (`a612b353`), BOOK-TYPE-SCALE-1 (`97527896`). Gate (1) and the smoke re-run now run on `97527896`, and the freeze holds from it on the same terms: docs-only merges, plus UI-SWEEP-1's non-shipping script and report. The smoke re-checks are:
- #8, #9 (reopen position, across a relaunch);
- #28–#30 (folder header);
- the tray right-click;
- BUG-208: E-ink on, with the dark theme and with the Blurby theme; the reader, library and menu are readable, and the Narrate highlight is visible;
- BOOK-TYPE-SCALE-1: book headings and body text in Page, Focus, Flow and Narrate, and the owner's usual book at the owner's usual text size, with the Narrate highlight on the spoken word.

Gate (1) also re-runs D3 and D5 on this sha (Blurby.Brain).

**Gate (1) sequencing and freeze (Blurby.Brain, 2026-10-22, tier 1).** **Freeze in force from `47ae6e1f` (CI-AUDIT-ALLOWLIST-1's merge, 2026-10-22); gate (1)'s target sha is `47ae6e1f`.** Gate (1) re-runs on the quiet machine once CI-AUDIT-ALLOWLIST-1 has merged, because its lockfile change ships in `node_modules` and the tested tree must be the shipped tree. JSONSTORE-TIMEOUT-1 merges before it. From CI-AUDIT-ALLOWLIST-1's merge, code and lockfile merges to `main` are frozen. The freeze holds until gate (1) passes and the owner's batched smoke is done on a build of that same sha. Docs-only merges (RELEASE-RUNBOOK-1) may still land. **Built during the freeze, merged after it lifts:** WS-TOKEN-REGEN-1 (`7a0d36d4`) and TOC-JUMP-SAVE-1 (`db03f2f5`). Their owner checks go to the next smoke batch, not gate (2), because gate (2) runs on a build of the frozen `47ae6e1f`. TOC-JUMP-SAVE-1's check: in Page mode, jump from the contents list to a later chapter, quit and reopen; it reopens on that chapter's page. READER-VISUAL-DIAG-1's owner-observed confirmation (standing rule 45): in Focus (paused) and Flow (playing for at least 1 minute) on *Meditations* from INTRODUCTION, does the bright band contain the underlined word? Before BAND-ALIGN-1 it should not; after it, it should. Owner decisions queued with it: BAND-ALIGN-1 Part A (tier 2: the band visibly grows toward the 5 lines the setting promises; recommendation: do it) and Part B (tier 3: in Focus, move the band or scroll the text? Recommendation: keep the band fixed and scroll the cursor's line into it).

**Order from roadmap review 2026-10-22.** The 17 merged Stage 8 items stay In Flight, each shown as a card whose full specification is in [`ROADMAP_snapshot_2026-10-22.md`](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md). Their close-outs wait for gates (1), (2) and (11). The belt's head is ELECTRON-42-UPGRADE-1 (8, gate 11), then [PDF-IMPORT-DIAG-1](#pdf-import-diag-1) (9, BUG-190; file-disjoint from 8, so it may run beside it), then READER-VISUAL-DIAG-1 (10, read-only). After them come PAGE-POSITION-SAVE-2 (27) and KF2-WAIVER-RETIRE-1 (28). Once gate (11) holds, gate (1) re-runs on the quiet machine. Then the batched owner smoke (gate (2)) runs on one production build of that `main`, after RELEASE-RUNBOOK-1 (position 7, gate (12)) has written the release steps down. That build also carries PDF-IMPORT-DIAG-1's Done-when 10 if it has merged.

**Order and parallel run.** FOLDER-SCAN-PERF-1 (completed 2026-10-14, merge `534b43d2`; spec archived) → QUIT-FLUSH-1 (completed 2026-10-14, merge `d21009b3`; spec archived) → READER-VISUAL-DIAG-1 (10, Stage 7) → PACKAGING-FIX-1 (11) → UX-POLISH-2 (13) → LARGE-FOLDER-SYNC-1 (14, technical half, Full Spec; QUIT-FLUSH-1 has merged, and its `stopNewWork` and quit step list are this item's to extend (LL-159); merges before FOLDER-UNREACHABLE-GUARD-1) → LIBRARY-READ-ALLOW-1 (15, BUG-196; after PACKAGING-FIX-1, same file) → PAGE-POSITION-SAVE-1 (16, BUG-197; after UX-POLISH-2 and LIBRARY-READ-ALLOW-1) → DEPS-AUDIT-1 (17, release gate; moves Electron to 41.10.7) → SAVE-LIBRARY-TRUST-1 (18, release gate; BUG-198) → IPC-PATH-TRUST-1 (19, release gate; after SAVE-LIBRARY-TRUST-1, same `keepMainPaths` line). FOLDER-SCAN-PERF-1, PACKAGING-FIX-1 and UX-POLISH-2 are file-disjoint and may be implemented in parallel; QUIT-FLUSH-1 shares `main.js` with FOLDER-SCAN-PERF-1 (different hunks) and merges after it. PACKAGING-FIX-1 and FOLDER-SCAN-PERF-1 both edit `package.json` (`build.files` against `dependencies`); the second to merge takes `refs/remotes/origin/main` in first. UX-POLISH-2 is the only item touching the shared-core set (`src/types.ts`, one comment line). NARRATE-REBUILD-1's P6 edits only its own docs, so none of these touches its files; the measurement windows (Stage 7, Parallel run plan) still govern heavy gates. Each item's production build is made in its own worktree and never overwrites the G2 build.

<a id="quit-flush-1"></a>

#### PACKAGING-FIX-1 — Ship the app's icons, quiet the updater in unpacked builds, and relink stale sample books *(merged `e476aed1` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `e476aed1` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#packaging-fix-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="ux-polish-2"></a>

#### UX-POLISH-2 — Keyboard and help-surface follow-ups after UX-POLISH-1 *(merged `77929621` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `77929621` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#ux-polish-2) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="large-folder-sync-1"></a>

#### LARGE-FOLDER-SYNC-1 — Live folder sync that scales to very large folders (technical half) *(merged `0eb46e33` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `0eb46e33` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#large-folder-sync-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="library-read-allow-1"></a>

#### LIBRARY-READ-ALLOW-1 — Let a library book open from its own file wherever it lives *(merged `037472c9` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `037472c9` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#library-read-allow-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="page-position-save-1"></a>

#### PAGE-POSITION-SAVE-1 — Page turns in Page mode save the first word of the page *(merged `309f2390` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `309f2390` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#page-position-save-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="deps-audit-1"></a>

#### DEPS-AUDIT-1 — Fix or account for every production dependency advisory *(merged `5d12e19a` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `5d12e19a` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (3) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#deps-audit-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="save-library-trust-1"></a>

#### SAVE-LIBRARY-TRUST-1 — The renderer cannot change where a library book's file is *(merged `fd1d266d` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `fd1d266d` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (4) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#save-library-trust-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="ipc-path-trust-1"></a>

#### IPC-PATH-TRUST-1 — Main decides which files and folders the renderer can reach *(merged `9b68ce38` 2026-10-14; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `9b68ce38` on 2026-10-14. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (5) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#ipc-path-trust-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="save-library-merge-1"></a>

#### SAVE-LIBRARY-MERGE-1 — A library save merges instead of replacing *(merged `682676b1` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `682676b1` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (6) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#save-library-merge-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="settings-key-trust-1"></a>

#### SETTINGS-KEY-TRUST-1 — The renderer and cloud sync can only set real user settings *(merged `051d004c` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `051d004c` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (7) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#settings-key-trust-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="folder-unreachable-guard-1"></a>

#### FOLDER-UNREACHABLE-GUARD-1 — Keep folder books when the source folder cannot be reached *(merged `89a5a95c` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `89a5a95c` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (8) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#folder-unreachable-guard-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="get-state-secret-1"></a>

#### GET-STATE-SECRET-1 — No secret reaches the renderer through state or settings reads *(merged `f4a2822d` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `f4a2822d` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (9) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#get-state-secret-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="large-folder-sync-2"></a>

#### LARGE-FOLDER-SYNC-2 — Follow-ups from LARGE-FOLDER-SYNC-1 *(merged `1f573bc2` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `1f573bc2` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#large-folder-sync-2) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="page-save-restamp-guard-1"></a>

#### PAGE-SAVE-RESTAMP-GUARD-1 — A page turn never saves a position before the book's word numbers apply *(merged `813ff38a` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `813ff38a` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1. It is release gate (10) itself.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#page-save-restamp-guard-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="page-save-restamp-2"></a>

#### PAGE-SAVE-RESTAMP-2 — A failed word count or a jump never loses or overwrites the reader's page *(merged `55a39a35` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `55a39a35` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#page-save-restamp-2) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="pdf-import-diag-1"></a>

#### PDF-IMPORT-DIAG-1 — PDFs convert again: the EPUB converter uses pdf-parse 2's API *(merged `7c518a30` 2026-10-22; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `7c518a30` 2026-10-22; In Flight, close-out held for the batched owner smoke, gate (2), by owner direction 2026-10-22; position 9 — Full Spec; authored 2026-10-22 on main @ `284c5695` by roadmap review 2026-10-22; fixes BUG-190; not a release gate
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#pdf-import-diag-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="electron-42-upgrade-1"></a>

#### ELECTRON-42-UPGRADE-1 — Upgrade Electron to 42 so a normal quit does not crash on x64 *(merged `331fb81b` 2026-10-22; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `331fb81b` 2026-10-22; In Flight, close-out held for Done-when 12, gate (1) on the quiet machine, and the batched owner smoke; position 8 — Full Spec; authored 2026-10-15 on main @ `7bb79f1e`; release gate (11), replacing NARRATE-EXIT-CRASH-1's fix
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#electron-42-upgrade-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="gov-notion-mapping-1"></a>
#### PAGE-POSITION-SAVE-2 — Follow-ups from PAGE-POSITION-SAVE-1 *(merged `82b05269` 2026-10-22; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `82b05269` 2026-10-22; In Flight, close-out held for the batched owner smoke, gate (2); position 27 — Full Spec; authored 2026-10-14 on main @ `0f285836`
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#page-position-save-2) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="kf2-waiver-retire-1"></a>

#### FOLDER-NOTICE-1 — Show when the source folder cannot be reached, with a one-press Retry *(merged `6ef5363a` 2026-10-15; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged into `main` at `6ef5363a` on 2026-10-15. The close-out waits for the Stage 8 release gate: gate (1), the quiet-machine suite on final `main`; gate (2), the batched owner smoke, which carries this item's deferred owner checks; and gate (11), ELECTRON-42-UPGRADE-1.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-22.md#folder-notice-1) (moved by roadmap review 2026-10-22; byte-identical to `ROADMAP.md` on `main` @ `284c5695`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="rename-retry-1"></a>

#### RELEASE-RUNBOOK-1 — Write the release runbook: build, sign, upload and verify the installers by hand *(merged `3872c6e8` 2026-10-23, release gate (12; In Flight, close-out held by the Stage 8 release gate)*

- **State:** merged `3872c6e8` 2026-10-23, release gate (12) met; In Flight, close-out held for the smoke's arm64 row; the ARM64 installer fix (`ELECTRON_BUILDER_7Z_FILTER=BCJ`) was accepted by Blurby.Brain 2026-10-23; position 7 — Full Spec; authored 2026-10-22 on main @ `e257c08a`; RELEASE GATE (12); created on Blurby.Brain's ruling
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#release-runbook-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="toc-jump-save-1"></a>

#### TOC-JUMP-SAVE-1 — A contents-list jump in Page mode saves the page it lands on *(built `db03f2f5` on `eb/toc-jump-save-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `db03f2f5` on `eb/toc-jump-save-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts (ROADMAP Stage 8, *Gate (1) sequencing and freeze*). Independent of the other three items specified with it.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#toc-jump-save-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ws-token-regen-1"></a>

#### WS-TOKEN-REGEN-1 — Regenerating the pairing code stores one encrypted token *(built `48c311f6` on `eb/ws-token-regen-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `48c311f6` on `eb/ws-token-regen-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#ws-token-regen-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-key-repeat-1"></a>

#### NARRATE-KEY-REPEAT-1 — Narrate's key forwarder keeps a held key's repeat flag *(built `8b5e9789` on `eb/narrate-key-repeat-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `8b5e9789` on `eb/narrate-key-repeat-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-key-repeat-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="rename-tmp-race-1"></a>

#### RENAME-TMP-RACE-1 — The sync-state and token saves use the serialized JSON writer *(built `b37d199b` on `eb/rename-tmp-race-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `b37d199b` on `eb/rename-tmp-race-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. If WS-TOKEN-REGEN-1 is open at the same time, the two share no file.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#rename-tmp-race-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="zip-read-followups-1"></a>

#### ZIP-READ-FOLLOWUPS-1 — Every EPUB archive is opened through one size-checked door *(built `29b3e7e5` on `eb/zip-read-followups-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `29b3e7e5` on `eb/zip-read-followups-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. No open branch shares its files. PDF-IMPORT-DIAG-1's `main/file-parsers.js` edits are already merged (`7c518a30`).
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#zip-read-followups-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="library-write-race-1"></a>

#### LIBRARY-WRITE-RACE-1 — Main-side library writers update the live record, never a copy *(built `3b7aaa6f` on `eb/library-write-race-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `3b7aaa6f` on `eb/library-write-race-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts, and after WS-TOKEN-REGEN-1 (`eb/ws-token-regen-1`, which edits `main/ws-server.js` from `:434` and `main/ipc/misc.js`'s regenerate handler) and WS-PAIR-LOG-1 (`main/ws-server.js:237-245`). Take `refs/remotes/origin/main` in and re-grep every cited line before merging.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#library-write-race-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="page-held-turn-fail-1"></a>

#### PAGE-HELD-TURN-FAIL-1 — A held page turn the word count cannot place is reported, not dropped *(built `7ca5a4b7` on `eb/page-held-turn-fail-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `7ca5a4b7` on `eb/page-held-turn-fail-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts, and after TOC-JUMP-SAVE-1 (same file). Take `refs/remotes/origin/main` in and re-grep `:586-593`, `:634` and `:674` before editing.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#page-held-turn-fail-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ws-pair-log-1"></a>

#### WS-PAIR-LOG-1 — Say why a pairing is not saved when OS encryption is unavailable *(built `4944def6` on `eb/ws-pair-log-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `4944def6` on `eb/ws-pair-log-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts, after WS-TOKEN-REGEN-1, and before LIBRARY-WRITE-RACE-1 (which also edits `main/ws-server.js`, at `:405-419`).
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#ws-pair-log-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-token-cap-1"></a>

#### NARRATE-TOKEN-CAP-1 — Digit-dense passages are planned under the 400-id token cap *(built `814ddc78` on `eb/narrate-token-cap-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `814ddc78` on `eb/narrate-token-cap-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. It overlaps none of the held branches. It merges before NARRATE-SENTENCE-RESUME-1, which also edits `chunkPlan.ts`.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-token-cap-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-trace-labels-1"></a>

#### NARRATE-TRACE-LABELS-1 — Narrate's eval traces say Kokoro, and the latency launcher rejects a bad rate *(built `08da0030` on `eb/narrate-trace-labels-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `08da0030` on `eb/narrate-trace-labels-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. No overlap with any held branch: none touches `main.js:180-193` or the launcher.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-trace-labels-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-sentence-resume-1"></a>

#### NARRATE-SENTENCE-RESUME-1 — Narrate starts at the beginning of the current sentence *(built `35716c5f` on `eb/narrate-sentence-resume-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `35716c5f` on `eb/narrate-sentence-resume-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. It comes after NARRATE-TOKEN-CAP-1 (`chunkPlan.ts`) and re-greps. It is independent of NARRATE-KEY-REPEAT-1, which edits a different file.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-sentence-resume-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="large-folder-sync-3"></a>

#### LARGE-FOLDER-SYNC-3 — Follow-ups from LARGE-FOLDER-SYNC-2 *(built `043ef79a` on `eb/large-folder-sync-3`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `043ef79a` on `eb/large-folder-sync-3`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#large-folder-sync-3) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="band-align-1"></a>

#### BAND-ALIGN-1 — The Focus/Flow reading band is sized from the real line step (Part A) *(built `105a07c1` on `eb/band-align-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `105a07c1` on `eb/band-align-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Owner OK, 2026-10-23 (tier 2):** yes, the band grows to the real line count. The Lines choice becomes 3, 5, 7 or Off (BAND-ALIGN-2, R5).
- **Merge order:** after the Stage 8 freeze lifts (the owner's tier-2 OK is given). It overlaps two Narrate items:
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#band-align-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="foliate-observer-leak-1"></a>

#### FOLIATE-OBSERVER-LEAK-1 — Leaked foliate View observers stop flooding error.log *(built `51759276` on `eb/foliate-observer-leak-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `51759276` on `eb/foliate-observer-leak-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. No held or in-flight branch touches `patches/` or this test.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#foliate-observer-leak-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="narrate-years-1"></a>

#### NARRATE-YEARS-1 — Narrate reads 1000–1099 as years too, and keeps comma numbers as counts *(built `7b36b836` on `eb/narrate-years-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `7b36b836` on `eb/narrate-years-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts. File-disjoint from every held or in-flight branch. It shares the reconcile sweep gate with NARRATE-TOKEN-CAP-1, whose fence excludes `normalize.js` and `capture.js`: whichever merges second re-runs Done-when 4 on the combined tree.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-years-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ui-sweep-1"></a>

#### Release fixes from the completed smoke diagnosis (2026-10-23)

The four items below, and BOOK-TYPE-SCALE-1 (owner, 2026-10-23), are the release fix. They land on `main` into the frozen release line, in this order, then gate (1) and the smoke re-run (#8, #9, #28–#30, the tray right-click, the BUG-208 checks, and book headings and body text in all four modes) run on the new sha. Source: `docs/studies/investigations/SMOKE8-DIAG-1.2026-10-23.md`.

<a id="page-reopen-cfi-1"></a>

#### PAGE-REOPEN-CFI-1 — Reopen from the cfi last saved, and save only the cfi on screen *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#page-reopen-cfi-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="folder-switch-header-1"></a>

#### FOLDER-SWITCH-HEADER-1 — The header follows the folder switch at once *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#folder-switch-header-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="book-text-colour-1"></a>

#### BOOK-TEXT-COLOUR-1 — Book text takes the theme's text colour *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#book-text-colour-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="keep-furthest-fix-1"></a>

#### KEEP-FURTHEST-FIX-1 — "Keep at furthest" in Page mode keeps the furthest page the reader reached *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#keep-furthest-fix-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="focus-keys-fix-1"></a>

#### FOCUS-KEYS-FIX-1 — Focus's word, sentence and paragraph keys move the reading word *(built `48203707` on `eb/focus-keys-fix-1`; In Flight; **rebuilt 2026-10-23 at `3bfb016e`, all gates and the live check pass**; merge held for the Stage 8 freeze)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#focus-keys-fix-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

<a id="flow-keys-fix-1"></a>

#### FLOW-KEYS-FIX-1 — Flow's line, word, sentence and paragraph keys move both pacers *(**rebuilt to its amendment 2026-10-23 at `1d2ee3a4`** on `eb/flow-keys-fix-1`, carrying FOCUS-KEYS-FIX-1 `3bfb016e` and `main`: k1 red `79909736`, fix `64c2c0b6` (`flow/helpers/flowBrowseKey.ts`); `npm test` 2,504 passed / 1 skipped / 0 failed, typecheck and build 0; live k2: every arrow key keeps playing, → and ← move the speed 300 → 325 → 300, Ctrl+↓ continues, PgDn still pauses and turns the page, against Ctrl+→ stopping at 192 on `60b86aff`; In Flight, merge held for the Stage 8 freeze, after FOCUS-KEYS-FIX-1)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#flow-keys-fix-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

<a id="band-align-2-spec"></a>

#### BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock *(**Built and held 2026-10-23 at `508be445` on `eb/band-align-2`**, base `f96552bd` = FLOW-PARA-KEYS-1 `100b41dd` + BAND-ALIGN-1 `105a07c1` + `main` `7c4a7a88`. Red first (`368dcc15`); `npm test` 2,542 passed / 1 skipped / 0 failed, typecheck and build 0. Live (scratch-profile `--dir` builds), base → tip: Flow's underline outside the band went from 99/178 to 0/178 at 100% and from 128/178 to 0/178 at 120%; the cursor is the band's middle line; the anchors are within 0.4 px; Lines 3, 5 and 7 show that many lines; Off removes the mask; e-ink keeps the cursor on screen for 1,361 of 1,361 samples. **Fixed in scope:** a defect that was already there. Foliate scrolls a closed shadow root, so the line pacer's `scrollTop` writes never moved the text; the pacer now scrolls through `renderer.containerPosition`. **Roadmap rulings (tier 1):**
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

<a id="flow-para-keys-1"></a>

#### FLOW-PARA-KEYS-1 — Flow's paragraph keys step over whole-book paragraph starts on an EPUB *(**re-checked 2026-10-23 at `100b41dd` with the amended FLOW-KEYS-FIX-1 `1d2ee3a4` taken in: `npm test` 2,511 passed / 1 skipped / 0 failed, typecheck, build and the x64 package 0; live Shift+→ paused 187 → 188 → 572 → 610 and back, playing 191 → 572 and keeps playing (572 to 579), Ctrl+→ and Ctrl+← keep playing, plain ←/→ change speed only, only PgDn pauses; held, merge order FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 → this item.** First built at `68504ba5` on `eb/flow-para-keys-1`, which carries FLOW-KEYS-FIX-1 `60b86aff` plus FOCUS-KEYS-FIX-1 `3bfb016e`: red first `16d2114f`, fix `5fb00ab5`, BUG-217; `npm test` 2,486 passed / 1 skipped / 0 failed, typecheck and build 0; live Shift+→ paused 187 → 188 → 572 → 610 and back, playing 191 → 572 with both pacers on 572, against 191 → 5290 on the base; merges after FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1**; Seq 84 — Full Spec; check settled red live 2026-10-23, amendment below; authored 2026-10-23 at the owner's request, from the FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 merge (`eec479ce`); after FLOW-KEYS-FIX-1; no shared-core touch)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#flow-para-keys-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

<a id="block-tag-case-1"></a>

#### BLOCK-TAG-CASE-1 — The renderer finds paragraph blocks in EPUB pages (case-insensitive tag checks) *(position 85 — Full Spec; authored 2026-10-23 by Blurby.Roadmap from the FOCUS-KEYS-FIX-1 live diagnostic; owner direction 2026-10-23: measure before and after, and the owner decides before it ships (tier 2); after FOCUS-KEYS-FIX-1 and FLOW-PARA-KEYS-1; post-release; no shared-core touch)*

- **Wave A built and held 2026-10-23 at `61cbbf7e` on `eb/block-tag-case-1`** (base `19658798` = `100b41dd` + `main` `644f01d2`; verified by Blurby.Roadmap: ancestry, unmerged, fence = the five `foliateHelpers.ts` copies, both `foliateParagraphStarts.ts`, the new test, measurement files, probe copies as `.txt`, memo and time log). Red: (t1) and (t2) fail by assertion on all five copies, (t3) control passes; targeted 356/356. Before/after: blocks and paragraph breaks *Meditations* 18 → 1,185, g0 2 → 62; wrapped words equal main's in every section before and after (the word-count hypothesis is not supported); Flow chunks and Narrate unchanged. **Found:** Flow and Focus place paragraph pauses with section-local word numbers while reading in whole-book numbers, so pauses land mid-sentence (base 1, after 27 in INTRODUCTION). **Owner tier-2 decision 2026-10-23: hold the merge; fix the pauses first ([FLOW-PARA-PAUSE-INDEX-1](#flow-para-pause-index-1)) and merge the two together.** Wave B (live, suite, typecheck, build, perf, BUG_REPORT entry) runs after that item is built. **Merge-train step (Blurby.Brain and Blurby.Roadmap, 2026-10-23):** `tests/readerModeOwnership.test.ts` fails once on this branch, because `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json` still pins the uppercase `BLOCK_TAGS` lines. FLOW-PARA-PAUSE-INDEX-1, which carries this branch and merges with it, updates those entries (rule 50 carry-over). Any re-stack keeps that fix, and the suite must be at 0 failures before the merge go. Both branches also need a rule 53 arm64 launch at merge, and expect a docs-only `BUG_REPORT.md` conflict against `main`.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### BLOCK-TAG-CASE-1`). The builder, the merge and the close-out read it there.

<a id="narrate-quit-linger-1-spec"></a>

#### NARRATE-QUIT-LINGER-1 — Pause stops new Kokoro work, and a relaunch during the quit linger reopens Blurby *(position 86 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### NARRATE-QUIT-LINGER-1`). The builder, the merge and the close-out read it there.
- **Re-scoped by Blurby.Brain (2026-10-25, relayed by Blurby.Roadmap): build (b), the relaunch takeover, only; drop (a).** The branch stops at `977bf209`, with work in progress at `f107a761` on `eb/narrate-quit-linger-1-tests`. Re-dispatch with these instructions:
  - Before finishing, run 3 base runs that pause with one generation in flight and a prefetch queued. If any run posts after the pause, (a) becomes its own item.
  - Drop Done-when 7's gap comparison.
  - Defer D6 to Brain's quiet-machine run.
  - Narrow the outcome sentence to (b): "a relaunch during the quit linger reopens Blurby".
  - Commit the harness.
  - **Finding for ELECTRON-42-UPGRADE-1's lane, not this item:** the teardown linger after Node's exit (up to 26.6 s, some runs over 45 s), pending a quiet-host re-measure.

<a id="overlay-theme-sweep-1-spec"></a>

#### OVERLAY-THEME-SWEEP-1 — Escape closes only the highlights and quick-settings overlays, and five panels and the mode-button hover use real theme tokens *(position 90 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### OVERLAY-THEME-SWEEP-1`). The builder, the merge and the close-out read it there.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** `0379b6ca`, tip `ec73f352`. Built and held for the Stage 8 freeze. **Bug-number collision (roadmap review 2026-10-25):** the branch files its bug as BUG-218, which READER-ARROW-GUARD-1 also uses. At merge it becomes **BUG-219** (rename the heading and every mention on the branch before the merge).

<a id="reader-arrow-guard-1-spec"></a>

#### READER-ARROW-GUARD-1 — Narrate and Page ignore modified arrows in their page-turn listeners *(position 91 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; from Blurby.Brain's FLOW-KEYS-FIX-1 diagnosis; copies FLOW-KEYS-FIX-1's amendment (`isFlowBrowseKey`, held tip `1d2ee3a4`); build-and-hold under the Stage 8 freeze; tier 2 for Page's Ctrl/Alt+←/→ (see Prerequisites); no shared-core touch)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### READER-ARROW-GUARD-1`). The builder, the merge and the close-out read it there.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** `59cffaa7`, tip `51202c1c`. Built and held for the Stage 8 freeze. Its BUG_REPORT hunk files BUG-218, which keeps that number (see BUG_REPORT.md, "Numbers reserved by held branches"). **Follow-up:** NARRATE-ARROW-PAUSE-1 (owner ruling 2026-10-25: Narrate pauses on a modified arrow).

<a id="win-target-nsis-1-spec"></a>

#### WIN-TARGET-NSIS-1 — `package.json` builds the full per-architecture NSIS installers the release uses, and the runbook drops its overrides *(position 92 — Full Spec; authored 2026-10-23 by roadmap review 2026-10-23-4 on main @ 644f01d2; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### WIN-TARGET-NSIS-1`). The builder, the merge and the close-out read it there.
- **Package verified in full (standing rule 53; Blurby.Brain, 2026-10-25): tip `d96435a1`.** (a)–(c) passed on arm64. (d) passed on the x64 quiet machine:
  - The NSIS installer's `app.asar` matches both the `--dir` build and the installed copy (sha256 `B8FE8246…`).
  - The silent install exits 0, places a PE `0x8664` exe and creates the "Blurby 1.75.1" HKCU uninstall key.
  - The 25 s scratch launch is clean. LL-165 was proved at +209 ms, and stderr holds only the BUG-217 line.
  - The silent uninstall removes the folder, both keys and the Start-menu folder, and the live hashes are unchanged.
  - Evidence: `C:\Projects\Blurby-artifacts\win-target-nsis-1\quiet-x64\` on the quiet machine.
  - **Lesson:** LL-168, an install test must export both of an older Blurby's registry keys first.

<a id="flow-para-pause-index-1-spec"></a>

#### FLOW-PARA-PAUSE-INDEX-1 — Flow and Focus paragraph pauses land at real paragraph ends *(position 108 — Full Spec; authored 2026-10-23 by Blurby.Roadmap on `eb/block-tag-case-1` @ `61cbbf7e`; owner tier-2 decision 2026-10-23: BLOCK-TAG-CASE-1 holds its merge until this lands, and the two merge together; build-and-hold now; not a release gate)*

- **Built and held 2026-10-23 at `b57b0925` on `eb/flow-para-pause-index-1`** (stacked on BLOCK-TAG-CASE-1 `61cbbf7e`, with `main` merged in). After the fix, 0 of 216 pauses fall off a paragraph end in Flow and Focus on both books, and in every loaded section the pauses equal the paragraphs. It carries the BLOCK-TAG-CASE-1 census fix (`boundary-policy.json` `BLOCK_TAGS` entries; rule 50). Suite 2,537 passed / 0 failed; typecheck 0. **Rule 53 package verification passed (Blurby.Brain, 2026-10-23)**, package `e41f6edc`, native arm64 launch included. Held for the Stage 8 release; it merges together with BLOCK-TAG-CASE-1 after BAND-ALIGN-2. A fresh rule 53 check is needed if `main` moves past docs before then.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### FLOW-PARA-PAUSE-INDEX-1`). The builder, the merge and the close-out read it there.

<a id="library-write-race-2-spec"></a>

#### LIBRARY-WRITE-RACE-2 — Library writes: the renderer-side and policy follow-ups *(built and held `c46e9332` on `eb/library-write-race-2`, stacked on LIBRARY-WRITE-RACE-1 `3b7aaa6f`; Seq 87, In Flight, merge held for the Stage 8 freeze; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-25.md) (moved by roadmap review 2026-10-25 to keep ROADMAP.md under its length ceiling; the item is In Flight). The branch's staging memo records the build.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** `a42c30af`, tip `c46e9332`. Its memo's W2 (Medium, BUG-223), N1 and N2 are specified as LIBRARY-WRITE-RACE-3.

<a id="narrate-arrow-pause-1"></a>

#### NARRATE-ARROW-PAUSE-1 — In Narrate, an arrow pressed with a modifier key pauses, and the cursor holds its word *(Seq 99 — Full Spec; authored 2026-10-25 by roadmap review 2026-10-25 on `origin/eb/reader-arrow-guard-1` @ `51202c1c`; owner ruling 2026-10-25 (tier 3), relayed by Blurby.Brain and Blurby.Roadmap; stacked on READER-ARROW-GUARD-1; build-and-hold under the Stage 8 freeze; not a release gate; no shared-core touch)*

- **What:** While Narrate is playing, ←/→ with Shift, Ctrl, Alt or Meta, or any combination of them, pauses playback. The cursor stays on the word it was on, and Space resumes from it. Plain ←/→ and PageUp/PageDown keep their current behaviour: browse away and turn the page.
- **Why:**
  - **Owner ruling, 2026-10-25:** "Narrate PAUSES on an arrow pressed with a modifier key."
  - READER-ARROW-GUARD-1 stopped modified arrows turning the page in Narrate (`isNarrateBrowseKey`, `src/reader/modes/narrate/helpers/narrateBrowseKey.ts:8-11` on `51202c1c`). Since then they do nothing.
    - `useReaderKeys` (`src/hooks/useKeyboardShortcuts.ts:229-230`, `:235-236`, `:286-287`) sends `seek-words` or `paragraph`.
    - `NarrateModeRuntime.handleCommand` drops both (`src/reader/modes/narrate/ModeRuntime.ts:463`).
    - Ctrl+Shift+←/→ sends no command at all.
  - Measured on READER-ARROW-GUARD-1's fix `59cffaa7` (its memo, k2): in all six modified rows `playing` stayed true and the engine word kept advancing.
  - Flow differs on purpose. Its modified arrows step the word and keep playing (FLOW-KEYS-FIX-1's owner ruling, 2026-10-23). Narrate has no word step to offer, so it pauses instead.
- **Design (tier 1, Blurby.Roadmap 2026-10-25):** one place, inside Narrate.
  - Add `isNarrateModifiedArrow(e)` to `narrateBrowseKey.ts`: true for `ArrowLeft` or `ArrowRight` with any of `shiftKey`, `ctrlKey`, `altKey` or `metaKey`.
  - In the keyboard effect of `src/reader/modes/narrate/FoliateView.tsx` (`:1420-1444`), before the `isNarrateBrowseKey` branch: when `isNarrateModifiedArrow(e)`, call a new `onModifiedArrow` prop and return. The effect is a window listener, and iframe keys are already forwarded to `window` with their modifiers (`:933-938`), so focus inside the book is covered.
  - Narrate's mode view wires `onModifiedArrow` to `runtime.pause()` (`ModeRuntime.ts:306-312`). That call is a no-op when not playing.
  - `handleCommand` is unchanged. Its drop of `seek-words` and `paragraph` stays, so there is no second effect.
  - Nothing outside `src/reader/modes/narrate/` changes. There are no sibling-runtime imports and no shared-adapter edit, which keeps reading-mode isolation.
- **Prerequisites:** READER-ARROW-GUARD-1 (built and held, tip `51202c1c`). Cut from that tip. It merges right after it, after the Stage 8 release. Re-grep every cited line at the cut (standing rule 36).
- **Done when** (PowerShell 7, `pwsh`, from the worktree root):
  1. **Red first (standing rule 43).** Commit the new tests alone. On the cut, `npx vitest run tests/readerModes/narrateBrowseKey.test.ts` exits 1, because `isNarrateModifiedArrow` is not exported (named through a variable so the file loads). The existing `isNarrateBrowseKey` cases pass. Record the output in the memo.
     - **(m1)** `it.each` over `["ArrowLeft","ArrowRight"]` × each of Shift, Ctrl, Alt, Meta and Ctrl+Shift: `isNarrateModifiedArrow` is true.
     - **(m2) control:** plain ←/→, PageUp/PageDown with or without a modifier, ↑/↓ with Ctrl, and Space give false.
  2. **The change.** `narrateBrowseKey.ts` (the helper), `src/reader/modes/narrate/FoliateView.tsx` (the branch and the prop) and Narrate's mode view (the wiring). `npx vitest run tests/readerModes/narrateBrowseKey.test.ts tests/narrate tests/readerModes` exits 0. The `isNarrateBrowseKey` cases are unchanged.
  3. `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 on the owner's machine (standing rules 47 and 48).
  4. **Live, packaged (standing rule 53(a), `--arm64`; a fresh scratch profile proved before the first input, LL-165).**
     - **Probe.** Copy READER-ARROW-GUARD-1's probe (`C:\Projects\Blurby-artifacts\reader-arrow-guard-1\arrow-guard-probe.mjs`) to `scripts/narrate-arrow-pause/probe.mjs` (standing rule 52; `scripts/` is not collected). Change it to record `playing`, the engine `cursor` and `highlightedWordIndex` right after each press and again 1 s later. Its `ensurePlaying()` (Space) runs only between rows, and "not playing" is a reading, not a probe failure.
     - **The route:** *Meditations*, a contents jump to INTRODUCTION, then Narrate mode.
     - **Pass mark.** For each of the six modified keys (Shift, Ctrl, Alt + ← and →), pressed while playing:
       - `playing` is false at both reads;
       - the engine cursor and `highlightedWordIndex` are the same at both reads;
       - `renderer.page` is unchanged and `isBrowsedAway` is false.
     - **Ctrl+Shift+→,** pressed while playing, does the same.
     - **Space after a pause** resumes: `playing` is true, and the first engine word after resuming is the held word or the word after it.
     - **Controls (standing rules 54 and 55):**
       - Plain → still browses away and turns the page.
       - The same probe on READER-ARROW-GUARD-1's packaged tip shows `playing` true after a modified arrow. That reading is k2's base, and it is what shows the probe can tell the two apart.
     - Record every row in the memo.
  5. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in. Blurby.Brain confirms.
  6. **Fence (standing rule 41):** `git diff --name-status <cut>` lists exactly `M src/reader/modes/narrate/helpers/narrateBrowseKey.ts`, `M src/reader/modes/narrate/FoliateView.tsx`, `M` Narrate's mode view, `M tests/readerModes/narrateBrowseKey.test.ts` and `A scripts/narrate-arrow-pause/probe.mjs`, plus the staging memo and the time log.
- **Effort:** S.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel (standing rule 9); Blurby.Brain for package verification.
- **Source:** the owner ruling of 2026-10-25; `docs/governance/close-outs/Memo.READER-ARROW-GUARD-1.GovernanceStaging.2026-10-23.md` (k0, k2) on `eb/reader-arrow-guard-1`; the code trace by roadmap review 2026-10-25 on `51202c1c`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** `narrateBrowseKey.ts:8-11`; `narrate/FoliateView.tsx:1420-1444` (the effect) and its props; Narrate's mode view, which renders the FoliateView with the runtime. Grep `src/reader/modes/narrate/ModeView.tsx` at the cut.
- **Standing rule 50:** READER-ARROW-GUARD-1's Done-when 5 (Narrate keeps playing on a modified arrow) is a live check on that item's own build, and stays true there. This item reverses that behaviour by ruling. Its memo names the reversal, and no committed test pins it.
- **Constants:** none.
- **Branch:** `eb/narrate-arrow-pause-1` from `origin/eb/reader-arrow-guard-1` @ `51202c1c`.
- **Staging plan:** stage the fence paths by exact path (policy.git: push). Hold for the Stage 8 freeze. Merge with `--no-ff` right after READER-ARROW-GUARD-1, once the package is verified.
- **Shared-core touches:** none.
- **Lane ownership:** TTS / Narration Engine (the Narrate view), with Reader Engine as the cross-lane owner of key routing. Execution surface C. **Forbidden during a parallel run:** `src/hooks/useKeyboardShortcuts.ts`, the Page, Focus and Flow runtimes, and `ReaderContainer.tsx`. **Merge order:** after READER-ARROW-GUARD-1.
- **Failure handling:**
  - **A modified arrow also reaches Narrate through `useReaderKeys` in a way that resumes or steps playback:** stop and report the path. Do not edit `useKeyboardShortcuts.ts`; that needs Blurby.Brain.
  - **The cursor moves by more than one word between the two reads after a pause:** the pause is not at the heard sample. Report the engine snapshot; this needs Blurby.Brain.
  - **Rollback:** `git revert -m 1 <merge>`.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red helper cases (m1, m2) committed alone, failure recorded | calculable | positive control | bounded | low | 15m | — | — |
| 2 | Modified arrow pauses Narrate from its own key listener | calculable | feature | bounded | low | 25m | — | — |
| 3 | Suite, typecheck, build | calculable | verify | bounded | low | 15m | — | — |
| 4 | Packaged probe of six modified keys plus Ctrl+Shift, controls, resume; rule 53; memo, time log, push | calculable | live verification | bounded | medium | 50m | — | — |

**Total:** 1h45m (estimate; the timing tool is not installed in this plugin version)

##### Lessons applied
- **LL-158 / standing rule 54:** the live row names its trigger (the key press), reads state at two times, and runs a control on the base build first.
- **LL-166 / standing rule 55:** the verdict reads runtime state through the probe. The base control (`playing` true) shows the probe can tell the two cases apart.
- **LL-165:** the scratch profile is proved before the first input.
- **LL-161:** "holds its word" is checked by the engine cursor and the highlighted index at two reads, not by a screenshot.
- **LL-138 / standing rule 43:** red first, with a control (m2).
- **LL-146 / standing rule 52:** the probe lives under `scripts/`, not as a collected test.
- **LL-149 / standing rule 48:** typecheck and build are restated.
- **LL-167 / standing rule 53:** not done until the packaged arm64 build is verified and Blurby.Brain confirms.
- **Standing rule 51:** this specification appends no lesson-status line.

<a id="library-write-race-3"></a>

#### LIBRARY-WRITE-RACE-3 — A library edit stamps only what the reader changed, a missing book fails the save, and a save answers only its own form *(Seq 89 — Full Spec; authored 2026-10-25 by roadmap review 2026-10-25 on `origin/eb/library-write-race-2` @ `c46e9332`, from that item's memo (W2, N1, N2) and Blurby.Brain's ruling relayed by Blurby.Roadmap 2026-10-25; must merge before BLURBY-SERVER-1's sync is on for anyone; not a Stage 8 release gate)*

- **What:**
  - **W2 (BUG-223, Medium).** The renderer's library edits send only the fields the reader edited, each with the value the renderer loaded (`from`) and the new value (`to`). Main applies and stamps a field only when its own value still equals `from`.
  - **N1.** `update-doc` on a missing or deleted id returns `{ error: "not-found" }`, and the Edit form treats that as a failed save.
  - **N2.** A save's result is applied only to the form that started it, using a request token.
- **Why:**
  - **W2.** `setEditedField` (`main/library-write.js:50-55` on the base) compares the incoming value with main's current value. So a stale renderer copy differs from a newer cloud value, gets stamped `editedAt = now`, and beats the cloud value in `mergeEditedFields` (`library-write.js:61-73`, used at `main/sync-engine.js:325-327`). All five whole-library `saveLibrary` callers (`src/components/LibraryContainer.tsx:264`, `:355`, `:426`, `:436`, `:449`) and the Edit form's `applyMetadataUpdates` (`src/components/LibraryView.tsx:301`, which sends both title and author, edited or not) expose it.
  - **N1.** `update-doc` (`main/ipc/library.js:154-168`) returns `undefined` on every path, so `useLibrary.addDoc` (`src/hooks/useLibrary.ts:40-46`) reads a missing id as success and the form closes.
  - **N2.** `handleAddDoc`'s success branches (`LibraryView.tsx:310`, `:327`) act on whatever form is showing. Cancel (`:664`) and `startEdit` (`:345-346`) neither reset `saving` nor invalidate the pending save.
- **Design (tier 1, Blurby.Roadmap 2026-10-25, inside Blurby.Brain's ruling):**
  - **A new channel** `edit-doc-fields(edits)`, where `edits` is `[{ docId, field, from, to }]`. `field` must be in `RENDERER_FIELDS` (`library.js:50`), and `to` must pass that field's `RENDERER_FIELD_VALID` check (`:53-58`).
    - For each edit, main skips a missing or deleted doc (it is reported in `missing`).
    - If main's value `sameValue`s `to`, the edit is a no-op.
    - If main's value `sameValue`s `from`, main sets the value with a stamp (`setEditedField`).
    - Otherwise main skips the edit, leaving its value and its stamp untouched, and reports it in `conflicts`.
    - It saves once and returns `{ applied, conflicts, missing }`, as counts plus the conflicting `{docId, field}` pairs.
  - **The five `LibraryContainer` callers** move to `editDocFields`. Each sends only the fields it changes, with the value it loaded as `from`. `handleOpenDocById`'s `lastReadAt` is not an edited field. It goes through `update-doc-progress`'s existing `lastReadAt` path, or stays on `save-library` if that path does not set it (record which in the memo).
  - **`save-library` stops stamping.** `mergeRendererEdits` (`library.js:63-82`) keeps applying valid renderer fields and `lastReadAt` as today, but no longer calls `setEditedField` for them. A stale whole-record save then carries no stamp, and the cloud's stamped value wins at the next sync. Nothing in the app calls it for edits after this item.
  - **`apply-metadata-updates`** (`library.js:730-766`) accepts an optional `base` per update: `{ docId, updates, base }`.
    - With `base`, it applies and stamps only keys whose `updates[key]` differs from `base[key]`, and only when main still equals `base[key]`. Other keys are reported in `conflicts`.
    - Without `base` (MetadataWizard, `src/components/MetadataWizard.tsx:112`), behaviour is unchanged, because the wizard's fields are explicit edits.
    - The Edit form keeps the loaded title and author as its base at `startEdit`, and sends only the edited keys with `base`. A form with nothing edited closes without a call.
  - **N1:** `update-doc` returns `{ error: "not-found" }` when `getDocById` finds nothing or the doc is `deleted`, and `{ ok: true }` otherwise. `useLibrary.addDoc` treats `result?.error` as a failure, so the form stays open with the part-2 inline alert ("Couldn't save — try again").
  - **N2:** `LibraryView` keeps `saveTokenRef`. Each save increments it and captures it. When the save resolves, the result is applied only if the token is still current and `editingId` is unchanged. Cancel and `startEdit` increment the token, reset `saving` and clear `saveFailed`. Cancel stays enabled (owner ruling 2026-10-23, "Stay open, inline retry"). A cancelled save may still land in main, and that is not shown.
- **Prerequisites:**
  - LIBRARY-WRITE-RACE-2 (`c46e9332`, held) and LIBRARY-WRITE-RACE-1 (`3b7aaa6f`, held) merge first, after the Stage 8 release.
  - APP-TABS-1 merges first too, because both touch `src/types.ts`.
  - Before BLURBY-SERVER-1 (Seq 104).
  - Cut from `main` once those three have merged. Re-grep every cited line at the cut (standing rule 36).
- **Done when** (PowerShell 7, `pwsh`, from the worktree root):
  1. **Red first (standing rule 43).** Commit the new tests alone. On the base, each listed failure appears and every control passes; record the output in the memo.
     - **`tests/libraryWriteRace3.test.js`** reuses `libraryWriteRace2.test.js`'s harness (`setup`, `seed`, `doc`, `call`, `copy`), copied into this file per standing rule 52 (it is not imported from a test file):
       - **(w1)** A cloud merge sets `tags` to `["b"]` with a stamp at T1. Then `edit-doc-fields` with `{from: ["a"], to: ["a","x"]}` leaves `tags` `["b"]` and its stamp T1, and returns one conflict. *Fails on the base: the channel does not exist (`call` rejects).*
       - **(w2)** With main at `["a"]`, the same edit applies `["a","x"]`, stamps `editedAt.tags`, and returns `applied: 1`.
       - **(w3)** A stale whole-library `save-library` that carries a differing `tags` writes no `editedAt.tags`. *Fails on the base: (t1)'s stamp.*
       - **(w4)** `apply-metadata-updates` with `base: {title:"A", author:"X"}` and `updates: {title:"B", author:"X"}`, while main's author is `"Y"` (a cloud change), stamps only `title` and leaves author `"Y"` unstamped. *Fails on the base: author is set to "X" and stamped.*
       - **(n1)** `update-doc` on an unknown id resolves `{ error: "not-found" }`; on a deleted doc too. *Fails on the base: `undefined`.*
       - **(c1) control:** `apply-metadata-updates` without `base` behaves as (t4)–(t7).
     - **`tests/editFormSave.test.tsx`**, a new describe `LIBRARY-WRITE-RACE-3`, reusing `deferred`, `renderLibrary`, `openEdit`, `save`, `panel` and `alert`:
       - **(ef8)** `updateDoc` resolves `{ error: "not-found" }`: the form stays open with the alert. *Fails on the base: the form closes.*
       - **(ef9)** Hold book A's metadata save with `deferred`, Cancel, open book B's form, then resolve A's save as success: B's form stays open with its typed values, and Save is enabled. *Fails on the base.*
       - **(ef10)** Editing only the title sends `updates: { title }` with `base: { title, author }`. *Fails on the base: both keys are sent and there is no base.*
       - **(ef11) control:** the (ef1)–(ef7) rows pass unchanged.
  2. **The change.** `main/ipc/library.js` (the new handler; `mergeRendererEdits` without stamping; `apply-metadata-updates` with `base`; `update-doc`'s return), `preload.js` (`editDocFields`, one line), `src/types.ts` (`editDocFields`, `updateDoc`'s return type and `applyMetadataUpdates`' `base`), `src/components/LibraryContainer.tsx` (the five callers), `src/components/LibraryView.tsx` (base, token, Cancel/startEdit reset), `src/hooks/useLibrary.ts` (`addDoc` reads `error`) and `src/test-harness/electron-api-stub.ts` (the stub gains `editDocFields`; `updateDoc` returns `{ ok: true }`).
  3. **Standing rule 50, named and updated in scope:**
     - `tests/libraryWriteRace2.test.js` (t1) and (t3) move from `save-library` to `edit-doc-fields`, with the same assertions on the stamps.
     - `tests/saveLibraryMerge.test.js`'s `renderer` object (`:118-130`) and (j1)–(j5) follow the callers' new payloads.
     - (o)'s source slice of `LibraryView.tsx` still finds `applyMetadataUpdates` between `"if (editMetaMode && editingId) {"` and the first `"return;"`. If the refactor moves it, update the slice markers and record that in the memo.
     - `tests/libraryWriteThrough.test.js:155`'s pinned `editedAt` stays green unchanged, because it calls `apply-metadata-updates` without `base`.
     - Run, unedited: `npx vitest run tests/saveLibraryTrust.test.js tests/ipcPathTrust.test.js tests/updateDocProgressLastRead.test.js tests/quitSequence.test.js tests/folderSync.test.js tests/folderUnreachableGuard.test.js`. Any failure is named in the memo and fixed in scope only if it pins the removed stamp.
  4. `npx vitest run tests/libraryWriteRace3.test.js tests/libraryWriteRace2.test.js tests/editFormSave.test.tsx tests/saveLibraryMerge.test.js tests/libraryWriteThrough.test.js` exits 0. `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 on the owner's machine (standing rules 47 and 48).
  5. **Live, packaged (standing rule 53(a), `--arm64`; a fresh scratch profile proved before the first input, LL-165).** The trigger that commits state is each edit's IPC save. The check reads `library.json` on the scratch profile after a 2 s settle (standing rule 54).
     - Toggle a tag on book A: `library.json` shows the tag and `editedAt.tags` only, with no `editedAt.title`.
     - Edit only book B's title in the Edit form: `editedAt.title` is set and `editedAt.author` is absent.
     - Toggle unread on book C: `unread` changes and `editedAt.unread` is set.
     - **Control on a base `--dir` build (standing rule 54):** B's edit also stamps `editedAt.author`. Recording that is what shows the check can see the difference (standing rule 55).
  6. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in. `npx asar list` shows `main/ipc/library.js`, `main/library-write.js` (if changed) and `preload.js`. Blurby.Brain confirms.
  7. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly the Done-when 2 files, `M main/library-write.js` (only if the stamp helper changes), the test files of Done-when 1 and 3, the staging memo and the time log.
- **Effort:** M.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel (standing rule 9); Blurby.Brain for package verification and any ruling on a failing pinned test.
- **Source:** `docs/governance/close-outs/Memo.LIBRARY-WRITE-RACE-2.GovernanceStaging.2026-10-24.md` (W2, N1, N2) on `eb/library-write-race-2`; BUG-223; the code trace by roadmap review 2026-10-25 on `c46e9332`.
- **Path:** dispatch.

##### Implementation detail
- **Edit sites:** the Done-when 2 list, with the base lines cited in Why. The helpers `sameValue`, `setEditedField` and `mergeEditedFields` (`main/library-write.js:44-73`) are reused unchanged.
- **Constants:** none. The error string `"not-found"` lives beside the handler as `UPDATE_DOC_NOT_FOUND`, exported for the renderer through the result only.
- **Branch:** `eb/library-write-race-3` from `main` after LIBRARY-WRITE-RACE-1, LIBRARY-WRITE-RACE-2 and APP-TABS-1 merge.
- **Staging plan:** stage the fence paths by exact path (policy.git: push). Merge with `--no-ff` (Rule 5b) once the package is verified.
- **Shared-core touches:** `src/types.ts`: the `ElectronAPI` members `editDocFields`, `updateDoc` and `applyMetadataUpdates`. It runs in its own integration window after APP-TABS-1. It must not run in parallel with any item that edits `src/types.ts`.
- **Lane ownership:** Library & Content; execution surfaces D (main and IPC) and C (the Edit form). **Forbidden during a parallel run:** `src/components/ReaderContainer.tsx`, `main/sync-engine.js` (read only), and the reader modes. **Merge order:** after APP-TABS-1; before BLURBY-SERVER-1.
- **Failure handling:**
  - **A pinned test outside Done-when 3's list fails because the stamp moved:** name it in the memo and ask Blurby.Brain before editing it.
  - **`lastReadAt` has no non-`save-library` path:** keep it on `save-library`, which no longer stamps, and record that.
  - **The live control does not stamp `editedAt.author` on the base:** the check cannot see the defect. Stop and report.
  - **Rollback:** `git revert -m 1 <merge>`. The stored data shape is unchanged (`editedAt` already exists from LIBRARY-WRITE-RACE-2).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests (w1–w4, n1, ef8–ef10) and controls committed alone, failures recorded | calculable | positive control | bounded | medium | 40m | — | — |
| 2 | edit-doc-fields channel; save-library stops stamping; metadata base; update-doc result | calculable | feature | bounded | medium | 50m | — | — |
| 3 | Renderer callers, Edit form base and request token, addDoc error | calculable | feature | bounded | medium | 45m | — | — |
| 4 | Rule 50 test updates; suite, typecheck, build | calculable | verify | bounded | medium | 35m | — | — |
| 5 | Packaged live stamp check with base control; rule 53 verification; memo, time log, push | calculable | live verification | bounded | medium | 50m | — | — |

**Total:** 3h40m (estimate; the timing tool is not installed in this plugin version)

##### Lessons applied
- **LL-158 / standing rule 54:** the live row names the commit trigger (each edit's IPC save) and runs a base control first.
- **LL-166 / standing rule 55:** the base control shows the detector sees the extra `editedAt.author` stamp.
- **LL-165:** the scratch profile is proved before the first input.
- **LL-138 / standing rule 43:** red first, with controls (c1, ef11).
- **LL-156 / standing rule 50:** the pinned tests that move with the stamp are named in scope, and the rest run unedited.
- **LL-146 / standing rule 52:** the harness is copied into the new test file, not imported across test files.
- **LL-149 / standing rule 48:** typecheck and build are restated in Done-when 4.
- **LL-167 / standing rule 53:** not done until the packaged arm64 build is verified and Blurby.Brain confirms.
- **The memo's lesson candidate (W2):** a spec that sends whole records says whether a stamp follows the renderer's edit or main's diff. This one says: the renderer's edit, with the value it loaded as `from`.
- **Standing rule 51:** this specification appends no lesson-status line.

<a id="word-index-unify-1-spec"></a>

#### WORD-INDEX-UNIFY-1 — One word numbering in every runtime *(position 43, Seq 88 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) from Blurby.Brain's tier-1 ruling of 2026-10-15; cut from `eb/flow-para-pause-index-1` @ `f61ae02d`; build-and-hold under the Stage 8 freeze; not a release gate)*

- **Hold cleared: Blurby.Brain ruling, 2026-10-25 (tier 1), option (b), two copies with a parity test.** Main stays CommonJS with no exception and no census entry. Brain's reason: the cited precedent cuts the other way. `main/tts-worker.js:65`'s `await import("kokoro-js")` is the dev-mode branch only. Packaged builds `require` the CommonJS builds (`:60-61`), so main has never loaded ESM in a packaged app. The TypeScript `src/utils/segmentWords.ts` is the source of truth. The CommonJS copy `main/word-segments.js` names it and the parity test in its header, and every edit goes to the TypeScript file first. Roadmap review 2026-10-25 applied Brain's five corrections below; the item is dispatch-ready.

- **What:**
  - The main-process extractor (`main/epub-word-extractor.js`) numbers a book's words the same way under every runtime: the app's Electron, plain Node and Vitest.
  - It segments whole blocks, so punctuation after an inline element stays on its word ("Imitation,"). It also joins adjacent word segments with no whitespace between them ("B.C.", "www.gutenberg.org"), through a CommonJS copy of the renderer's `segmentWordSpans` join, held to it by a parity test (Brain ruling 2026-10-25).
  - A guard makes any later change in word-break data (an Electron upgrade) fail loudly instead of silently moving saved places.
  - Every saved reading position in `library.json` is remapped once, so it names the same word after the change as before.
- **Why:**
  - The extractor segments each text node on its own (`main/epub-word-extractor.js:249`, inside the per-part loop `:236-267`). It attaches only trailing punctuation (`:255-263`) and never joins two word segments. So its numbering depends on the runtime's ICU.
  - The renderer's `segmentWordSpans` (`src/utils/segmentWords.ts:27-64`) joins word segments that touch (`:42-47`) over a whole block's text (`src/reader/modes/*/helpers/foliateHelpers.ts:153-155`).
  - LL-160: *Meditations* is 80,493 words under the app's Electron and 80,426 under plain Node. Electron's ICU splits "B.C." and web addresses.
  - **Planning measurement (Blurby.Roadmap, 2026-10-23, read-only, scratch script):** a prototype of the ruled extractor gives the same count under both runtimes. Every word index below is 0-based.

    | Runtime | Book | Today's extractor | Ruled extractor |
    |---|---|---|---|
    | Electron 41.1.0 as Node (ICU 77.1) | *Meditations* | 80,493 | **80,352** |
    | Node 24.14 (ICU 78.2) | *Meditations* | 80,426 | **80,352** |
    | both | g0 (`g0-converted-chapters.epub`) | 1,676 | 1,676 |

    - **App-numbering shift on *Meditations*:** 0 at the start, growing to 141 at the end.
    - **Anchors, old → new:** "ancient" 2970 → 2963; "HIS" (HIS FIRST BOOK) 5480 → 5473; "casting" 8723 → 8715; "THE" (THE SECOND BOOK) 9431 → 9423.
    - **Kinds of difference:**
      - dotted words joined: "B.C.", "A.D.", "i.e.", "www.gutenberg.org" (57 words);
      - punctuation after inline elements restored: "Title:", "Imitation,", "Criterion.";
      - 6 section numbers joined to the quoted word that follows them: "10]'What", "14]O". The renderer's Page spans already join these the same way (see owner question 1).
  - **Saved positions are in today's main numbering.** Page stamps its spans by aligning the extractor's words (`src/reader/modes/page/helpers/foliateWordWrapping.ts:84-115`, SRL-067). Focus, Flow and Narrate read `bookWords`. So the numbering change moves every saved position by 0–141 words in books with abbreviations, unless the positions are remapped.
  - **Citation correction:** the stub cites "LL-136's one-counter rule". LL-136 is the time-log fence lesson (standing rule 41). The one-numbering principle is standing rule 29 (SRL-067: visual and audio share raw indexes only when they share tokenization), together with LL-160.
- **The safeguard for saved places (decided, tier 1 inside the ruling):**
  - **The cfi is never rewritten.** Page reopens from it as today (`tests/pageReopenCfi.test.ts`). The word index is re-derived so it names the same word: "the word index rides with the cfi".
  - **How the index moves.** Take the saved index in today's numbering. Find that word's block and its character offset in the book. The new index is the word in the new numbering that contains that character.
  - **The cfi checks the move.** Its spine step (`/6/N!` → section `N/2 − 1`) must name the same section as the new index. A disagreement is recorded, not acted on.
  - **Why the cfi does not choose the word.** In Focus, Flow and Narrate the saved cfi is the last page relocation, not the word (`src/reader/modes/flow/helpers/usePersistentReadingAnchor.ts:99`, `options.cfi ?? state.cfi`). Choosing the word from the cfi would move those readers back to their page start.
  - **No other persisted state is word-indexed:**
    - Narrate keeps no audio cache (`main/narrate/producer.js:4-5`, R10).
    - The dormant Kokoro cache (`main/ipc/tts.js:180-222`, keyed by `startIdx`) has no preload path.
    - Highlights store their text, and their index is display-only (`main/ipc/reader.js:16-25`).
  - **Backup.** `main.js:281` already backs up `library.json` before any library schema migration. The schema step in this item triggers that backup, so the pre-remap file is kept.
- **Prerequisites:**
  - FLOW-PARA-PAUSE-INDEX-1 (held at `f61ae02d`, carrying BLOCK-TAG-CASE-1). This item stacks on it, because the parity check compares against the renderer's block grouping after BLOCK-TAG-CASE-1, and both items edit `boundary-policy.json`.
  - NARRATE-REBUILD-1 is complete.
- **Done when** (every command in `pwsh` from the worktree root; each passes only on the exit code named; "app-node" means `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1`, the app's Electron 42 as Node, LL-160):
  1. **Base measurement, no code change (LL-142).**
     - Commit the probe as `scripts/word-index-unify/measure.cjs`. Run it under app-node and under plain `node` on `resources/sample-meditations.epub` and `docs/planning/roadmap-reviews/reader-mode-separation-2/live/fixtures/g0-converted-chapters.epub`.
     - Record, per runtime and book: `process.versions` (electron, node, icu), total words, per-section counts, and the words at 2963, 2970, 5473, 5480, 8715, 8723, 9423 and 9431.
     - Expected at the base: app-node 80,493 and 1,676; node 80,426 and 1,676. A different base count stops the item until the planning numbers are re-derived.
     - Save the results to `docs/studies/investigations/WORD-INDEX-UNIFY-1.base.<date>.md`.
  2. **Characterize before extracting (standing rule 39).** Commit `tests/segmentWordsCharacterization.test.ts` on its own, green on the unmodified `segmentWordSpans`. It pins spans `{word, start, end}` for:
     - "B.C. 121", "A.D.", "i.e. nobly", "www.gutenberg.org.", "don't", "rock-and-roll", "3.14 and 1,000", "[10]'What words", "a\u200Bb", "a  b\n\nc", "", "   ";
     - an em-dash run, a CJK run and a soft hyphen.

     The refactor in step 4 passes it unedited.
  3. **Red first (standing rule 43).** Commit `tests/wordIndexUnify.test.js` on its own. It fails by assertion on the base, and the failing output is recorded.
     - **(u1)** `extractWords` on an in-memory EPUB whose section is `<p>About 121 B.C. the <i>Imitation</i>, he said.</p>` returns `["About", "121", "B.C.", "the", "Imitation,", "he", "said."]`. To make it ICU-independent, the test injects a segmenter stub that splits "B.C." the way Electron's ICU does, through the extractor's new optional `{ segmenter }` parameter.
     - **(u2)** For the same text and either segmenter (the real one and the stub), `extractWords(...).words` equals `segmentWords` of the block text.
     - **(u3)** Nested blocks never join: `<div>end.<p>Start</p></div>` gives `["end.", "Start"]`.
     - **(u4)** A footnote cue keeps its place: the existing Metaphysic fixture gives a cue `afterWordIdx` at "Metaphysic".
     - **(u5)** `remapPosition` maps a legacy index to the new word containing it. Under the stub, legacy "B." (index 2) and legacy "C." (index 3) both map to new "B.C." (index 2). Legacy "said." maps to new 6.
     - **(u6)** The library migration 6 → 7 marks `wordIndexRemap: "pending"` only on EPUB docs with `position > 0`, and running it twice changes nothing more.
     - **(u7)** `update-doc-progress` and `reset-progress` clear a pending mark.
     - **(u8)** `resolveLoadedDocResult` copies a numeric `position` from the payload into `activeDoc` and `libraryUpdates`.
     - **Controls (pass on the base):** a text-only block with no touching segments numbers the same before and after. A non-EPUB doc is never marked.

     Name new functions through a variable so the file loads on the base.
  4. **The numbering change:**
     - **The CommonJS copy.** Add `main/word-segments.js` (CommonJS), exporting `joinWordSegments(text, segments)`. It is `segmentWordSpans`'s loop (`src/utils/segmentWords.ts:31-63`), taking the segments as an argument instead of calling `segmenter.segment(text)` (`:28`). It copies the loop's whole dependency closure, so it has no ICU, Node or DOM dependency:
       - `TRAILING_PUNCT_RE`, `REAL_WHITESPACE_RE` and `STITCHABLE_GAP_RE` (`:2-4`);
       - `hasRealWhitespaceBoundary` (`:12-14`) and `shouldStitchWithoutWhitespace` (`:16-21`);
       - not `segmenter` (`:1`): the caller passes its own segments.
       - Its header comment reads: the source of truth is `src/utils/segmentWords.ts`; edit that file first, then this copy; `tests/wordSegmentsParity.test.ts` holds them equal.
     - **The renderer.** `src/utils/segmentWords.ts` is unchanged. It stays the source of truth.
     - **The extractor** (`main/epub-word-extractor.js`):
       - **Whole blocks.** `walkInline` (`:111-128`) pushes `{ type: "break" }` before and after a nested element whose tag is in `BLOCK_TAGS`.
       - **One run at a time.** In `extractWords` (`:236-268`), split each block plan at breaks into runs. Each run's text is the concatenation of its text parts, and footnote cues are kept with their character offsets.
       - **Segment and join.** Segment each run with `joinWordSegments(runText, Array.from(segmenter.segment(runText)))`. The copy is loaded with `require("./word-segments")`, as any main module.
       - **Cues.** A cue at offset `c` gets `afterWordIdx` = (book words before this run) + (run words whose start < `c`) − 1.
       - **Constant and tests.** Delete the local `TRAILING_PUNCT_RE` (`:18`). `extractBlockTexts` keeps its output, and `tests/epubWordExtractor.test.js` stays green and unedited.
     - **Optional segmenter.** `extractWords(epubPath, { segmenter } = {})` takes an optional segmenter, used for tests only. The default is today's `new Intl.Segmenter(undefined, { granularity: "word" })` (`:213`).
     - **Why two copies (tier 1, Blurby.Brain 2026-10-25).** One file cannot load in both runtimes without main loading ESM, which the CommonJS rule forbids. Two copies keep the rule. The parity test (step 9b) guards the copy.
  5. **The guard** (scope item (e)):
     - **The module.** `main/word-numbering.js` (CommonJS) exports:
       - `WORD_NUMBERING_PROBE`, a fixed list of probe strings (the step-2 cases plus "U.S.A.", "e.g.", "https://example.com/a?b=c", "naïve", "Mr. Smith");
       - `wordNumberingFingerprint(segmenter?)`, the sha256 of the JSON of every probe's joined words.
     - **Constants.** `main/constants.js` gains `WORD_NUMBERING_VERSION = 2` and `WORD_NUMBERING_FINGERPRINT`, the value measured under app-node in this step and recorded in the after-measurement file.
     - **Startup check.** `main.js` `loadState` (`:274-291`), after the library loads, computes the fingerprint. On a mismatch it writes `[word-numbering] fingerprint mismatch: expected … got …; saved positions were numbered by a different word-break table` to stderr and `error.log` through `logToFile`. It does not remap and does not exit. Under standing rule 53(b), that line fails any package verification, so an Electron upgrade that changes word breaks cannot merge silently.
     - **Test.** `tests/wordNumberingGuard.test.js`:
       - **(g1)** Under Vitest (plain Node), the fingerprint equals `WORD_NUMBERING_FINGERPRINT`, and `extractWords(resources/sample-meditations.epub).totalWords` is the step-6 count (expected 80,352).
       - **(g2)** It spawns the app's Electron binary (`require("electron")`, as `scripts/narrate-rebuild/lib/app-icu.cjs:7` resolves it) with `ELECTRON_RUN_AS_NODE=1` on `scripts/word-index-unify/fingerprint.cjs`. That run prints the same fingerprint and count. If the binary is missing, the test fails with the `install.js` instruction; it is never skipped.
       - **(g3) Control:** a segmenter stub that splits differently gives a different fingerprint.
  6. **After measurement on the two books (LL-152:** same probe, same runtimes as step 1):
     - app-node and node both report the same total for each book (expected *Meditations* 80,352, g0 1,676) and identical per-section counts.
     - The anchor words sit at their new indices: 2963 "ancient", 5473 "HIS", 8715 "casting", 9423 "THE".
     - The difference census (classes and counts, with no other book text) is recorded.

     Any runtime disagreement stops the item. Save the results to `docs/studies/investigations/WORD-INDEX-UNIFY-1.after.<date>.md`.
  7. **The one-time remap** (scope: saved positions):
     - **The migration.** `main/migrations.js`: `CURRENT_LIBRARY_SCHEMA` 6 → 7 (`:7`). A new v6 → v7 step after `:273` sets `doc.wordIndexRemap = "pending"` on each doc with `position > 0` and (`ext === ".epub"` or `convertedEpubPath`).
     - **`remapPosition(epubPath, legacyIndex, cfi)`** in `main/word-numbering.js`:
       - One parse of the book gives both numberings with each word's (section, block run, start, end).
       - The legacy numbering is a frozen copy of today's per-part loop (`main/epub-word-extractor.js:249-266`), kept only here and marked for removal by a later item.
       - It returns `{ newIndex, sameWord, cfiSection, indexSection }`. `sameWord` is true when the new word's text, read at the legacy word's character offsets, equals the legacy word.
       - A legacy index past the end clamps to the last word.
     - **The hook, `ensureWordNumbering(doc, ctx)`:** one promise per doc id. After the await, re-find the current record by id (the pattern at `main/ipc/library.js:185-186`). Write only while it is still pending, then:
       - set `position = newIndex`;
       - delete the mark;
       - `saveLibrary()` and `broadcastLibrary()`.

       Call it:
       - in `load-doc-content` (`main/ipc/library.js:162-176`) on both EPUB branches, before the return. When it changed the position, the return becomes `{ filepath, ext, position }`;
       - in `extract-epub-words` (`main/ipc/tts.js:162-174`) before extracting.
     - **The renderer.** `src/utils/loadDocResult.ts:17-25` adds `position` to `libraryUpdates` when `"position" in result && typeof result.position === "number"`. Every open awaits `load-doc-content` before it shows the book (`src/components/LibraryContainer.tsx:231-235`, `src/App.tsx:54`). `src/types.ts` is not edited; the narrowing is local.
     - **Fresh saves clear the mark.** `update-doc-progress` (`main/ipc/documents.js:15-31`), when it writes a position, and `reset-progress` (`:35-40`) delete `wordIndexRemap`. A position written by this build is already in the new numbering.
     - **Failure.** If the EPUB cannot be read or parsed, the position is untouched, the mark becomes `"failed"`, and one `error.log` line names the doc id.
  8. **Owner-library check, offline, on copies only:**
     - Copy `library.json` and every EPUB that a pending doc points to (`convertedEpubPath` or `filepath`) into `C:\Projects\Blurby-artifacts\word-index-unify-1\owner-copy\`. Write a manifest of doc id → copy. The live profile is only read, and its `library.json` and `settings.json` hashes are recorded before and after; they must be unchanged.
     - Run `scripts/word-index-unify/remap-check.cjs --library <copy> --manifest <manifest>` under app-node. It applies the v6 → v7 step and `remapPosition` to every pending doc. It prints only sha256(doc id)[0:8], the old and new index, the shift, `sameWord`, and cfi agreement, never book text. It exits 0 only if every doc has `sameWord: true`.
     - Record the counts (docs, shifted docs, largest shift, cfi agreements, disagreements, absent cfis) and the run time per book in `docs/studies/investigations/WORD-INDEX-UNIFY-1.remap.<date>.md`.
     - A `sameWord: false` stops the item with those hashed ids. A cfi disagreement is recorded, not a failure.
  9. **Parity sweep (LL-162).** `tests/wordIndexParity.test.ts` runs, under jsdom, on every section of *Meditations* and g0:
     - the renderer's own grouping, `collectBlockTextNodes` + `segmentWordSpans` from `src/reader/modes/page/helpers/foliateHelpers.ts`;
     - main's `extractWords` for that section.

     Their word lists are equal on both books (0 mismatched sections).

     The same file, with `WIU_OWNER_DIR` set to the copies' directory, reports the owner-copy counts of mismatched sections by cause. It prints counts only, and its exit code ignores them; the counts are recorded in the remap file. Without the variable, that case is `it.skip` with its reason in the name. It is the only skip the item adds.
  9b. **Copy parity (Blurby.Brain 2026-10-25).** `tests/wordSegmentsParity.test.ts` compares `segmentWordSpans(text)` with `joinWordSegments(text, Array.from(segmenter.segment(text)))` from `main/word-segments.js`, as exact `{word, start, end}` arrays, on three inputs:
      - the *Meditations* and g0 corpora, section by section;
      - a fixed edge-case list: straight and curly apostrophes, hyphens and dashes, ellipses, quotes after punctuation, numbers with separators, URLs, no-break and thin spaces, and one non-Latin line;
      - a seeded random-string case (a fixed seed, so it is repeatable).

      **Red to green (standing rule 43):** with one regex in the CommonJS copy mutated (`TRAILING_PUNCT_RE` without `,`), the file exits 1, naming a differing span. Restored, it exits 0. Record both outputs in the memo.

      **Under the packaged runtime (LL-160):** one vitest process catches drift between the copies, not drift between runtimes. So `scripts/word-index-unify/parity-app.cjs` runs the CommonJS copy over the same corpus under the packaged exe (`ELECTRON_RUN_AS_NODE=1` with the built `Blurby.exe`) and prints per-section word counts. Those equal the renderer's counts from step 9. This run is also standing rule 53 (d).
  10. **Live, packaged** (standing rule 53(a) recipe, `--arm64`; a fresh scratch profile proved before the first input, LL-165; live-profile hashes unchanged). Seed the scratch profile with a schema-6 `library.json` holding:
      - the sample *Meditations* at position 2970 (today's "ancient") with a cfi in section 2;
      - g0 at position 900 with a cfi in section 1.

      Launch, open *Meditations* in Focus, and read the runtime state through a probe (LL-166): the current word index is 2963 and its text is "ancient". Then check:
      - `library.json` shows position 2963, the same cfi string, no `wordIndexRemap`, `schemaVersion` 7, and the pre-migration backup file;
      - g0's position is unchanged at 900, and its mark is cleared on open;
      - Page reopens *Meditations* on the cfi's page;
      - stdout, stderr and `error.log` hold no `[word-numbering]` line.
  11. **Standing rule 50, named and updated in scope:**
      - `tests/zipEntryCap.test.js:106` (`80426` → the step-6 count; the same number now holds under every runtime);
      - `docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json`: no entry is expected, because `main/word-segments.js` is main-only. If `tests/readerModeBoundaries.test.ts` fails on it, add the entry it names, and record why in the memo;
      - any test that pins library schema 6 (re-grep: `git grep -n "CURRENT_LIBRARY_SCHEMA\|schemaVersion: 6" -- tests`).

      **Named, not edited:** the NARRATE-REBUILD-1 checkers pin today's numbering. These are `scripts/narrate-rebuild/d2-crossing-check.cjs` with the P6b trace `2970 ancient 5480 HIS`, `p5-latency-e2e.mjs:41` (8723 and 9431), and `reconcile-sweep.mjs` `--from 2970`.
      - Their recorded traces are historical evidence in the old numbering. The anchor table from step 6 is their translation, and the step-5 guard replaces `d2-crossing-check` as the numbering probe for upgrades.
      - `reconcile-sweep.mjs --gate` still runs under app-node and exits 0 (0 fail-closed chunks).
      - `sync-engine.js:339` (cloud merge takes the larger position) is named as a residual: Cloud Sync is deferred to BLURBY-SERVER-1.
  12. **Tests:**
      - `npx vitest run tests/segmentWordsCharacterization.test.ts tests/wordIndexUnify.test.js tests/wordNumberingGuard.test.js tests/wordIndexParity.test.ts tests/epubWordExtractor.test.js tests/segmentWords.test.ts tests/zipEntryCap.test.js tests/readerModeBoundaries.test.ts tests/pageReopenCfi.test.ts` exits 0.
      - `npx vitest run tests/readerModes tests/narrate` exits 0.
  13. `npm test`, `npm run typecheck` and `npm run build` exit 0 on the owner's machine (standing rules 47 and 48).
  14. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in.
      - (c) `npx asar list` shows `main/word-segments.js`, `main/word-numbering.js` and each changed `main/` file.
      - (d) re-runs step 6's count and step 9b's `parity-app.cjs` under the packaged exe as Node, plus step 10.
      - Blurby.Brain confirms.
  15. **Fence** (standing rule 41): `git diff --name-status <base>` lists exactly the following, plus the measurement files, staging memo and time log:
      - `A main/word-segments.js`, `A main/word-numbering.js`;
      - `M main/epub-word-extractor.js`;
      - `M main/migrations.js`, `M main/constants.js`, `M main.js`;
      - `M main/ipc/library.js`, `M main/ipc/tts.js`, `M main/ipc/documents.js`;
      - `M src/utils/loadDocResult.ts`;
      - `A scripts/word-index-unify/measure.cjs`, `A scripts/word-index-unify/fingerprint.cjs`, `A scripts/word-index-unify/remap-check.cjs`, `A scripts/word-index-unify/parity-app.cjs`;
      - `A tests/segmentWordsCharacterization.test.ts`, `A tests/wordIndexUnify.test.js`, `A tests/wordNumberingGuard.test.js`, `A tests/wordIndexParity.test.ts`, `A tests/wordSegmentsParity.test.ts`;
      - `M tests/zipEntryCap.test.js`, and the named schema-pin tests (`boundary-policy.json` only under step 11's condition).

      Nothing in `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts`, `src/reader/modes/**` or `scripts/narrate-rebuild/**`.
  16. **Owner (next smoke, added to gate (2)'s list):** a book left mid-way before this build reopens on the same word in Focus and on the same page in Page. In Focus, "B.C." shows as one word.
- **Effort:** L (two waves).
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel; Blurby.Brain for package verification; the owner at the next smoke.
- **Source:** Blurby.Brain's tier-1 ruling of 2026-10-15 (the offset diagnosis, LL-160); the stub at `#word-index-unify-1`; the planning measurement above.
- **Path:** dispatch.

##### Owner ruling (2026-10-23, roadmap review 2026-10-23-5): option (b), split them
- In the shared join function, a closing section bracket followed by an opening quote is a word boundary. "10]'What" becomes two words, in every runtime and in Page's spans. Rewrite the probe expectations and the step-6 counts to the split numbering, measured on the base and the tip. The six places are listed under Done-when. The remap carries saved positions across this change like any other boundary shift.

##### Owner questions
1. **Section numbers joined to the next word (6 places in *Meditations*: "10]'What", "14]O").** The ruled join puts a closing bracket and the quoted word that touches it into one word. Page's spans already join these, and the extractor now matches them, so Focus shows "10]'What" as one flash.
   - **(a) Accept it, as the ruling reads.** Recommended: it is rare, it already matches Page, and it keeps one rule in one function.
   - (b) Treat a closing bracket followed by an opening quote as a boundary in the join (the TypeScript source, then the CommonJS copy). This also changes Page's spans and the numbering again.
   - (c) Strip leading section-number brackets in Focus display only.

   The spec is dispatch-ready on (a). Choosing (b) changes only the probe expectations and the step-6 count.

##### Implementation detail
- **Edit sites** (grep-verified on `main` @ `d2a70ff1`, 2026-10-23; none of these files differs on `origin/eb/flow-para-pause-index-1` except `boundary-policy.json`; re-grep at the cut, standing rule 36):

  ```
  git grep -n -E "TRAILING_PUNCT_RE|function walkInline|segmenter.segment\(part.text\)|new Intl.Segmenter" -- main/epub-word-extractor.js
  git grep -n -E "export function segmentWordSpans|const segmenter" -- src/utils/segmentWords.ts
  git grep -n -E "load-doc-content|extract-epub-words|update-doc-progress|reset-progress" -- main/ipc
  git grep -n -E "CURRENT_LIBRARY_SCHEMA = |v5 → v6" -- main/migrations.js
  git grep -n -E "async function loadState|backupFile\(getLibraryPath" -- main.js
  ```
- **Tests:** listed in Done-when 2, 3, 5, 9 and 12. Existing extractor, segmenter, cfi-reopen and mode tests stay unedited, apart from the rule-50 list in step 11.
- **Constants:** `WORD_NUMBERING_VERSION = 2` and `WORD_NUMBERING_FINGERPRINT` in `main/constants.js`. `CURRENT_LIBRARY_SCHEMA` becomes 7 in `main/migrations.js:7`.
- **Branch:** `eb/word-index-unify-1`, cut from `origin/eb/flow-para-pause-index-1` (`f61ae02d` when written) with `origin/main` merged in. Push with `git push origin HEAD:refs/heads/eb/word-index-unify-1`, and do not merge (Stage 8 freeze).
- **Merge order:** after FLOW-PARA-PAUSE-INDEX-1 and BLOCK-TAG-CASE-1, in the post-freeze train (`docs/planning/roadmap-reviews/2026-10-23-plan.md`). It is a separate merge, and it needs a fresh rule 53 check if `main` has moved past docs.
- **Waves (dispatch sizing):**
  - **Wave A:** tasks 1–5, the numbering and its guard. It stops after step 6 with the counts recorded.
  - **Wave B:** tasks 6–9, the remap, sweeps, live check and package.

  Wave B starts only if Wave A's step 6 shows one count across runtimes.
- **Staging plan:** explicit paths only. Leave `tests/perf-baseline-results.json`, the Timing backfills, every owner-copy file and anything under `C:\Projects\Blurby-artifacts\` unstaged. Probes that look like tests are committed under `scripts/` as `.cjs`, never as `*.test.*` under `docs/` (standing rule 52).
- **Failure handling:**
  - **Runtimes disagree after the change (step 6):** stop. Record the words where they differ. Do not pin a fingerprint.
  - **`sameWord: false` for any owner doc (step 8):** stop and list the hashed ids. Do not ship the remap.
  - **The copies differ (step 9b) or the packaged run's counts differ from the renderer's:** stop. Record the first differing span, or the section and counts. Fix the CommonJS copy to match the TypeScript source; never edit the TypeScript file to match the copy without a ruling.
  - **Owner-copy remap time:** above 3 s for any single book, record it. The remap is lazy per book at open, so it never delays launch.
  - **Rollback:** `git revert -m 1 <merge>`. A library already migrated to schema 7 keeps positions in the new numbering, so a downgrade restores the `library.json` backup that `main.js:281` wrote.
- **Shared-core touches:** none. The `LoadedDocFilePayload` narrowing stays in `src/utils/loadDocResult.ts`.
- **Lane:** Reader Engine. Execution surfaces D (main process) and A (numbering). Cross-lane: Narrate reads `bookWords`; no Narrate file changes.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Base counts and anchors on both books under app-node and node, saved | calculable | measurement | bounded | medium | 35m | — | — |
| 2 | Characterization file for segmentWordSpans committed alone, green | calculable | positive control | bounded | low | 20m | — | — |
| 3 | Red file (u1–u8 and controls) committed alone, failures recorded | calculable | positive control | bounded | medium | 35m | — | — |
| 4 | CommonJS join copy; extractor on it; whole-block runs; after counts equal across runtimes | calculable | feature | cross-cutting | high | 1h15m | — | — |
| 5 | Numbering fingerprint, startup check and Electron-run guard test | calculable | feature | bounded | medium | 45m | — | — |
| 6 | Library schema 7, remapPosition, open-time remap hook, progress handlers clear the mark, loadDocResult | calculable | feature | cross-cutting | high | 1h30m | — | — |
| 7 | Owner-copy remap check, parity sweep and copy parity (with mutation control and packaged-runtime run) recorded | calculable | measurement | bounded | medium | 50m | — | — |
| 8 | Packaged live remap check on a seeded scratch profile, read from state | calculable | live verification | bounded | medium | 50m | — | — |
| 9 | Suite, typecheck, build; rule 53 package verification; memo, time log, push | calculable | verify | bounded | medium | 1h | — | — |

##### Lessons applied
- **LL-160:** the copy parity also runs under the packaged exe's runtime (step 9b), not only in vitest. Every count and fingerprint is measured under the app's Electron (app-node) and under plain Node. After the change they must agree, which is the item's purpose.
- **LL-142:** the counts and anchors were measured before this spec was written. The run measures them again before and after.
- **LL-152:** the before and after measurements use the same probe and runtimes, and the live check uses the rule 53 build recipe.
- **LL-161:** the remap and the live check compare word text at the position, not only the index.
- **LL-162:** the remap and parity are swept over the whole owner corpus offline, not a few sampled books.
- **LL-165:** the live launch proves its scratch profile before the first input, and the live-profile hashes stay unchanged.
- **LL-166:** the live verdict reads the runtime's current word, not a screenshot.
- **Standing rule 53:** the item is not done until the packaged arm64 build is verified and Blurby.Brain confirms.
- **Standing rule 29 (SRL-067):** the stub's "one-counter rule" is this rule, not standing rule 41 (the time-log fence exemption) that it cites.
- **Standing rule 39:** characterization goes first, before the CommonJS copy of `segmentWordSpans`'s loop is made.
- **Standing rule 43:** the red file goes first, with controls.
- **Standing rule 50:** the pinned count, census and schema tests are named, and the Narrate checkers are named, not edited.
- **Standing rule 52:** probes live under `scripts/` as `.cjs`.
- **Standing rule 36:** every cited line is re-grepped at the cut.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="narrate-reconcile-residual-1-spec"></a>

#### NARRATE-RECONCILE-RESIDUAL-1 — A two-word name that espeak reads differently on its own is identified by reading the two words together *(built and held `5000a60d` on `eb/narrate-reconcile-residual-1`, package verified; Seq 93, In Flight, merge held for the Stage 8 freeze; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-25.md) (moved by roadmap review 2026-10-25 to keep ROADMAP.md under its length ceiling; the item is In Flight). The branch's staging memo records the build.



<a id="narrate-harness-coldclick-1-spec"></a>

#### NARRATE-HARNESS-COLDCLICK-1 — Cold click is measured on mainstream hardware *(built and held `c90d9e08` on `eb/narrate-harness-coldclick-1`; its reference smoke ran short and was stopped and reported (see the branch's staging memo); Seq 94, In Flight, merge held for the Stage 8 freeze; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-25.md) (moved by roadmap review 2026-10-25 to keep ROADMAP.md under its length ceiling; the item is In Flight). The branch's staging memo records the build.
- **Package verification (standing rule 53; Blurby.Brain, 2026-10-25):** (a)–(c) pass for `0ca285e5`. Done-when 5, 6 and 10 wait on Brain's quiet-machine runs. The Done-when 5 shortfall on the loaded host is void because of the load, so it is not a stop.
- **Quiet-machine result and ruling (Blurby.Brain, 2026-10-25): outcome R4, on 240/240 trials across two hosts. Decision #22's question closes as R4.**
  - The run: x64, package `0ca285e5`, i7-1185G7.
    - 80/80 trials were lost-race, with 0 undelivered and 0 errors.
    - In 0/80 trials were the word spans ready before Play's first voice.
    - Medians at 1.00x: spans ready at 1,189 ms, first voice at 871 ms.
    - Medians at 2.00x: spans ready at 1,419 ms, first voice at 1,134 ms.
    - Foreign CPU averaged 14.3% and 11.5%.
    - Evidence: `C:\Projects\Blurby-artifacts\narrate-harness-coldclick-1\quiet-x64\` on the quiet machine.
  - **Done-when 5 and 6** close as "stopped: R4 measured", not pass. Done-when 6 was not run.
  - **Done-when 10** (rule 53) stays confirmed for `0ca285e5`.
  - **`second-machine.md:22`** stays unchanged, per Done-when 8.
  - **Cross-arch note:** the x64 asar is 1,424 bytes larger than the arm64 one (291,698,446 against 291,697,022), which is expected. Rule 53 compares each package with its own build only.
  - **Owner answer to question 1 (2026-10-25, tier 2): (B)**, put to the owner by Blurby.Brain with the quiet-run figures; the owner replied "agreed". On mainstream hardware, cold click is the first click in a fresh process made while playing, once the playing section's words are on screen, timed from its own request against 8,000 ms. It is already recorded as `clickLatencyMs`.
    - The quiet x64 result stands, with no re-run. Both rates pass. At 1.00x the median is 1,580 ms and the worst 1,609 ms (n = 4). At 2.00x the median is 1,298 ms and the worst 1,746 ms (n = 37).
    - The charter's D6 row (`docs/planning/epics/2026-10-12-narrate-rebuild/charter.md`) and `second-machine.md:22` now carry the (B) definition (roadmap review 2026-10-25, follow-up branch).
    - **Closing:** Blurby.Brain says close the item on this evidence. Its branch `c90d9e08` carries the harness change and is held for the Stage 8 freeze, so the dispatch close-out (the terminal record and Completed) runs when the branch merges in the post-release train.



<a id="narrate-cpu-profile-1-spec"></a>

#### NARRATE-CPU-PROFILE-1 — Where Narrate's CPU goes on a 4-core machine, and whether the thread count should follow the core count *(Seq 95 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) from the stub; stacks on NARRATE-HARNESS-COLDCLICK-1; build-and-hold under the Stage 8 freeze; measurement only, no product change; not a release gate)*

- **What:** a measured profile of the rebuilt Narrate's warm requests on the quiet machine (mainstream class). It records:
  - how much of the machine Blurby uses;
  - which process uses it;
  - how each request's latency splits into waiting, generation and delivery;
  - how latency and CPU change when onnxruntime's intra-op thread count per producer worker is 4 (today), 3, 2 or 1.

  A fixed decision rule turns the sweep into one of two verdicts: keep 4 threads, or adapt the thread count on hosts with fewer than 8 physical cores (to a measured value).
- **Why:**
  - The stub (ROADMAP.md, `narrate-cpu-profile-1`): on the quiet machine (i7-1185G7, 4 cores / 8 threads), Blurby alone drove the host to 78–84 % during warm D6 requests, and to 95–98 % with foreign load.
  - The committed mainstream record agrees (`docs/studies/narrate-rebuild-1/phase5/latency-e2e.completion-1.json`):
    - each warm run's own app share was 49–55 % of all 8 logical processors;
    - within click and speed trials the app share reached 89–94 %, and the host 100 %.
  - The reference Snapdragon record (`latency-e2e.completion-2-reference.json`) peaks at 61–65 %.
  - **The likely cause is measurable, not assumed (LL-142).** The producer runs `NARRATE_PRODUCER_WORKERS` = 2 workers (`main/narrate/constants.js:21`). Each opens an onnxruntime session with `NARRATE_INTRA_OP_THREADS` = 4 intra-op threads (`:17`, applied at `main/narrate/producer-worker.js:64-67`).
  - That count was chosen by Decision #7 (`docs/planning/epics/2026-10-12-narrate-rebuild/state.md:205`) from a sweep on the 12-core reference machine with one worker. The second worker came later (Decision #17, `:215`).
  - On 4 cores, a request generated while the other worker runs a prefetch asks for 8 compute threads at once.
  - The override already exists, so no product code is needed to sweep it: `NARRATE_INTRA_OP_THREADS` (`main/narrate/producer.js:29-35`) is read when each worker loads (`:128`).
- **Out of scope, with reasons:**
  - **Worker count is not swept.** One worker was the configuration Decision #17 replaced, after requests queued behind stale generations (`state.md:215`). Going back would re-test a measured failure.
  - **The chunk ramp `NARRATE_CHUNK_RAMP` is not swept.** It is a renderer constant (`src/constants.ts`) with no override, and it shapes first-chunk latency, which D6 owns. The profile still records generation time against chunk size, so a ramp effect can be computed from this item's data.
  - No product default changes here. A change, if the rule calls for one, is a separate follow-up item (Done-when 7).
- **Prerequisites:**
  - NARRATE-REBUILD-1 (completed 2026-10-15).
  - **NARRATE-HARNESS-COLDCLICK-1**, built and pushed. This item uses its trial labels (`trial-<label>.json`), the `--class auto` mainstream budget and the live-profile guard, and edits the same launcher. Until that branch exists, this item waits.
  - Blurby.Brain's quiet machine is free of release gate (1) and smoke work for about 90 minutes.
- **Done when** (every command in `pwsh` 7 from the worktree root; the launcher and the summary through `scripts/narrate-rebuild/app-node.ps1`, LL-160):
  1. **Red first (standing rule 43).** Commit `tests/narrate/narrate.cpuProfile.test.ts` on its own. Hold the module path in a variable and import it inside each test, so the file collects and fails by assertion on the base.
     - **(d1) Request breakdown.** `requestBreakdown(events)` is exported from `scripts/narrate-rebuild/lib/cpuprofile.mjs`. It is given a fixture with:
       - a `narrate-request` (cause `click`, `t` 1,000);
       - a `narrate-schedule` with `requestedT` 1,000, `genMs` 600, `chunkStart` 100, `chunkEnd` 106, `busyAtAssign.pool` 1, and `hops.stages` `{ queued: 5,000, posted: 5,040, received: 5,700 }`;
       - a `narrate-first-voiced` with `requestT` 1,000.

       It returns `{ cause: "click", waitMs: 40, genMs: 600, words: 6, genMsPerWord: 100, otherBusy: true }`.
     - **(d2) Decision: adapt.**
       - `profileDecision(configs)` gets a fixture with baselines `t4-1` and `t4-2`: worst per type 1,800 and 1,900 ms, and median app CPU 52 and 54 %.
       - The other configs: `t3` (worst 1,950, CPU 40 %), `t2` (worst 2,600, CPU 30 %) and `t1` (worst 3,400, CPU 18 %).
       - It returns `{ verdict: "adapt", threads: 3 }`. `t2` and `t1` are not admissible, because they go over 2,500.
     - **(d3) Decision: keep.** The same fixture with `t3` at CPU 46 % (not 10 points below 53) returns `{ verdict: "keep", threads: 4 }`.
     - **(d4) Decision: noisy.** Baselines whose worst trials differ by more than 500 ms in any type and rate return `{ verdict: "noisy" }`.

     On the base each test fails because the module does not exist. Record the failing output in the staging memo.
  2. **Per-process CPU in the launcher** (`scripts/narrate-rebuild/p5-latency-e2e.mjs`, on top of NARRATE-HARNESS-COLDCLICK-1):
     - **`--cpu-by-process`** extends the sampler (`:58-67`). Every 500 ms, one long-lived `pwsh` loop reads `Get-CimInstance Win32_Process` for the `electron.exe` processes whose `ExecutablePath` starts with the worktree root.
       - It sums `KernelModeTime + UserModeTime` (100 ns units) per type, read from `CommandLine`:
         - `--type=renderer` is `renderer`;
         - `--type=gpu-process` is `gpu`;
         - `--type=utility` with `audio` in the line is `audio`;
         - any other `--type=` is `other`;
         - no `--type=` is `main` (the main thread and both producer workers).
       - The series is saved with the run's CPU file (`:113`), and `cpuShare` (`:70-79`) gains a per-type share over the same window.
     - Without the flag, nothing changes.
     - **Thread label.** `report` (`:143`) records `intraOpThreads`: the `NARRATE_INTRA_OP_THREADS` value, or `"constant"` when it is unset.
     - **Proof the setting took effect (LL-166).** The warm trial's summary already records the producer status at "warm-up done" (`main/narrate/trial.js:253`, `runtime.threads`).
       - The launcher reads `trial-<label>.json` after each warm run and records `runtimeThreads`.
       - When `intraOpThreads` is set and differs from `runtimeThreads`, that is a failure: `threads <set> requested, <runtime> loaded`.
  3. **The summary** `scripts/narrate-rebuild/cpu-profile-summary.mjs <recordsDir> <artifactsRoot>` reads `<recordsDir>/latency-e2e.t<T>-<n>.json` and each run's traces and CPU files under `<artifactsRoot>/t<T>-<n>/`. It writes `<recordsDir>/cpu-profile.summary.json` and prints:
     - **per config, rate and request type:** worst counting warm latency, counting trials, and the median and maximum app CPU % over the counting trials' windows;
     - **per config:** run-level app CPU % (wall-weighted over the warm runs); the median per-process-type share; the median `waitMs`, `genMs` and `genMsPerWord` of request chunks; the fraction of requests with `otherBusy`; and `genMs` against chunk words (slope and intercept, least squares);
     - **the verdict of `profileDecision`**, with each config's admissibility and CPU gain.

     It exits 0 when a verdict is computed, and 1 when any record is invalid: `d6class` is not `mainstream`, a thread failure, or fewer than 20 counting trials in a cell. Run once with `--break`, which raises one baseline's worst click by 600 ms; it must print `noisy` and exit 1 (LL-151).
  4. **The sweep, quiet machine** (i7-1185G7; run by Blurby.Brain on the pushed branch after `npm ci` and `npm run build`; nothing else heavy running; the foreign-CPU ≤ 25 % rule and the 40-cycle cap unchanged):
     - Five configurations, in this order: T = 4, 3, 2, 1, 4. The two runs at 4 are baselines `t4-1` and `t4-2`, and their spread is the noise.
     - Each one is:

       ```
       $env:NARRATE_INTRA_OP_THREADS = '<T>'
       pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only warm --warm 20 --rates 1.0,2.0 --class auto --cpu-by-process --out C:\Projects\Blurby-artifacts\narrate-cpu-profile-1\t<T>-<n>
       Move-Item docs/studies/narrate-rebuild-1/phase5/latency-e2e.json docs/studies/narrate-rebuild-1/cpu-profile/latency-e2e.t<T>-<n>.json
       ```

     - Each record reads `d6class: "mainstream"` and `runtimeThreads` = T. The launcher's own exit code is recorded, not judged: T = 1 may exceed the budget, and the decision rule judges.
     - Afterwards `git status --porcelain -- docs/studies/narrate-rebuild-1/phase5` is empty, and the live-profile hashes are unchanged.
  5. **The decision rule** (`profileDecision`, applied to the five records):
     - **(N) Noisy:** if `t4-1` and `t4-2` differ by more than 500 ms in the worst counting trial of any type and rate, or either has a counting trial at or over 2,500 ms, the sweep is re-run once in full. If it is noisy again, stop and report to Blurby.Brain.
     - **Admissible:** a config T in {3, 2, 1} is admissible when, at both rates and for every type, its worst counting trial is under 2,500 ms. It must also be at most the larger baseline worst plus the larger of the baselines' spread and 100 ms.
     - **CPU gain:** T has a gain when its median app CPU %, pooled over every counting warm trial at both rates, is at least 10 percentage points below the mean of the two baselines' medians.
     - **(A) Adapt:** some admissible config has a gain. The verdict is `adapt` to the admissible T with the lowest median app CPU (on a tie, the larger T), on hosts with fewer than 8 physical cores. The reference class keeps 4, because it was not swept here and its D6 row stays as measured.
     - **(K) Keep:** otherwise the verdict is `keep` 4. The saturation is the cost of meeting the mainstream budget, recorded with its numbers.
  6. **Output file:** `docs/studies/narrate-rebuild-1/cpu-profile/NARRATE-CPU-PROFILE-1.<YYYY-MM-DD>.md` holds:
     - the summary's tables;
     - the baseline restated in the stub's terms: the host busy % and app CPU % over the warm request windows at T = 4, against the stub's 78–84 %;
     - the per-process split ("where the time goes");
     - the request breakdown and the `genMs` slope;
     - the verdict with the rule's arithmetic shown;
     - each command with its exit code.

     The five records and `cpu-profile.summary.json` sit beside it.
  7. **Follow-up by verdict:**
     - **On A:** Blurby.Roadmap registers a stub, NARRATE-THREADS-ADAPT-1: on hosts with fewer than 8 physical cores, `getThreads()` (`main/narrate/producer.js:29-35`) returns the measured T, and D6 re-runs on both classes before it merges. This is a tier 1 technical decision (Rule 11), ruled by Blurby.Brain. Latency stays inside the owner's mainstream budget and the reference class is unchanged.
     - **On K:** the item closes with no follow-up.

     Either way, the verdict line is quoted in the close-out.
  8. **Tests and gates.**
     - `npx vitest run tests/narrate` exits 0.
     - `npx vitest list` collects exactly one more file than on NARRATE-HARNESS-COLDCLICK-1's tip (standing rule 52).
     - `npm test` and `npm run typecheck` exit 0 on the owner's machine (standing rules 47 and 48). `npm run build` exits 0 too, because the launcher runs the built `dist`.
  9. **Package (standing rule 53):** nothing under `build.files` changes. `git diff --name-only origin/eb/narrate-harness-coldclick-1...HEAD` lists no `main.js`, `preload.js`, `main/` or `dist/` path. Record "package unchanged" with that output in the staging memo, against NARRATE-HARNESS-COLDCLICK-1's verified package.
  10. **Fence:** `git diff --name-status origin/eb/narrate-harness-coldclick-1...HEAD` lists exactly the following, plus the staging memo and time log (standing rule 41). It may also list the merge of `origin/main`, if one is made.
      - `M scripts/narrate-rebuild/p5-latency-e2e.mjs`;
      - `A scripts/narrate-rebuild/lib/cpuprofile.mjs`, `A scripts/narrate-rebuild/cpu-profile-summary.mjs`, `A tests/narrate/narrate.cpuProfile.test.ts`;
      - `A docs/studies/narrate-rebuild-1/cpu-profile/` (the five records, the summary JSON and the report).

      Nothing in `main/`, `src/`, `preload.js` or the shared-core set.
- **Effort:** S–M (scripts S; the sweep is about 90 minutes of quiet-machine time).
- **Owners:**
  - the implementation agent: Done-when 1–3 and 8–10;
  - Blurby.Brain: Done-when 4 on the quiet machine, and the A or K ruling;
  - spec-compliance and quality reviewers, in parallel;
  - Blurby.Roadmap: the follow-up stub on A.
- **Source:**
  - the stub; Decisions #7, #17 and #22 (`state.md:205`, `:215`, `:221`);
  - `latency-e2e.completion-1.json` (run-level app CPU 49–55 %, trial maxima 89–94 %) and `latency-e2e.completion-2-reference.json`;
  - `main/narrate/constants.js:17-21`; `main/narrate/producer.js:29-35`, `:128`.
- **Path:** dispatch.

##### Owner questions
None. The thread count is a back-end tuning value inside the owner's D6 budgets (Rule 11 tier 1). The hardware is the quiet machine, which Decision #22 names as the mainstream class. If the sweep showed that a lower thread count needs a looser budget, that would be tier 2, but the rule never selects such a config: admissibility requires the 2,500 ms budget.

##### Implementation detail
- **Edit sites** (grep-verified 2026-10-23 at `origin/main` `1937e999`; NARRATE-HARNESS-COLDCLICK-1 edits the same launcher, so re-grep on its tip at dispatch, standing rule 36):
  - `scripts/narrate-rebuild/p5-latency-e2e.mjs`:
    - `:29-39` (arguments);
    - `:58-67` (`startCpuSampler`);
    - `:70-79` (`cpuShare`);
    - `:112-115` (the CPU file and the run's share);
    - `:143` (`report`);
    - `:169-207` (warm block, where `runtimeThreads` is read after each run).
  - Read only:
    - `main/narrate/trial.js:248-253` (warm-up and the "warm-up done" status);
    - `main/narrate/producer-worker.js:64-75` (`runtime.threads`);
    - `src/reader/modes/narrate/engine/narrateEngine.ts:410-433` (`narrate-schedule` fields: `genMs`, `busyAtAssign`, `hops.stages`) and `:437-445` (`narrate-request`).

  ```
  git grep -n -E "function startCpuSampler|export function cpuShare|const report = |cpu.json|kind: \"narrate-schedule\"|threads: threads === null" -- scripts/narrate-rebuild/p5-latency-e2e.mjs main/narrate/producer-worker.js src/reader/modes/narrate/engine/narrateEngine.ts
  ```
- **Tests:** the new `tests/narrate/narrate.cpuProfile.test.ts` (d1–d4). Existing tests stay unedited.
- **Constants:** the rule's values are named constants at the top of `lib/cpuprofile.mjs`, each citing this specification:
  - `MAINSTREAM_WARM_BUDGET_MS = 2500` (Decision #22);
  - `NOISE_FLOOR_MS = 100`;
  - `NOISY_SPREAD_MS = 500`;
  - `CPU_GAIN_POINTS = 10`;
  - `SWEEP_THREADS = [4, 3, 2, 1]`.

  No product constant changes.
- **Branch:** `eb/narrate-cpu-profile-1`, cut from `origin/eb/narrate-harness-coldclick-1` with `origin/main` merged in. Push with `git push origin HEAD:refs/heads/eb/narrate-cpu-profile-1`. Do not merge (Stage 8 freeze). Merge order: NARRATE-HARNESS-COLDCLICK-1, then this branch.
- **Staging plan:** explicit paths only (the fence list). `tests/perf-baseline-results.json`, `docs/studies/narrate-rebuild-1/phase5/recorded-output.json` and any `phase5/latency-e2e.json` stay unstaged. Records are moved into `cpu-profile/`, not copied.
- **Failure handling:**
  - **Bad configuration.** A `runtimeThreads` mismatch, a `d6class` other than mainstream, or a live-profile change voids that configuration. Re-run it once; a second void stops the sweep and goes to Blurby.Brain.
  - **Too few counting trials.** A cell under 20 counting trials after 40 cycles (foreign load) gives the same verdict as the launcher's: ask for a quiet window, re-run that configuration once, then stop.
  - **Silent producer.** A worker stall like Decision #21's (`state.md`, the P5 final-run blocker) shows as a trial over 2,500 ms in a baseline. That makes the sweep noisy under (N). It is reported with the producer log (`NARRATE_PRODUCER_LOG=1` on the re-run), not explained away.
  - **The `--cpu-by-process` loop.** Its own CPU is counted as foreign, as the existing sampler's is. If its cost pushes foreign CPU over 25 % in more than a quarter of trials, the sweep drops the flag, and the per-process split is reported as not measured.
  - **Rollback:** revert the branch's commits; after a merge, `git revert -m 1 <merge>`.
- **Shared-core touches:** none.
- **Lane:** TTS / Narration Engine. Execution surface B (evaluation harness).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red file (d1–d4) committed alone, failures recorded | calculable | positive control | bounded | low | 25m | — | — |
| 2 | Launcher records CPU per process type, the thread label and the loaded thread count | calculable | harness script | bounded | medium | 40m | — | — |
| 3 | Profile library and summary, with the `--break` control | calculable | harness script | bounded | medium | 40m | — | — |
| 4 | Five-configuration thread sweep on the quiet machine, records moved | calculable | measurement | bounded | medium | 1h30m | — | — |
| 5 | Summary, verdict and report written; follow-up stub on A | calculable | measurement | bounded | medium | 35m | — | — |
| 6 | Targeted tests, suite, typecheck, build; package-unchanged record; memo, time log, push | calculable | verify | bounded | low | 35m | — | — |

##### Lessons applied
- **LL-142:** the stub's 78–84 % and the over-subscription cause are measured, not assumed. The baseline restates the stub's figure in a defined metric before any setting is judged.
- **LL-151:** the summary proves it can return a failing verdict (`--break` prints `noisy`, exit 1). The launcher's thread mismatch is a failure with its own message.
- **LL-152:** every configuration uses the same build, machine, start word, rates and trial schedule. The baseline runs twice, first and last, so drift during the sweep shows as noise rather than as an effect.
- **LL-160:** the launcher and the summary run under the app's Electron through `app-node.ps1`.
- **LL-165:** every run keeps NARRATE-HARNESS-COLDCLICK-1's profile proof (the driver's exit 4 and the launcher's live-profile hashes).
- **LL-166:** a configuration counts only when the loaded producer reports the thread count asked for (`runtime.threads`), read from state rather than inferred from the environment variable.
- **LL-162:** not applied. This is a live timing profile, not a correctness gate over a corpus.
- **Standing rule 43:** the red file goes first, with keep, adapt and noisy fixtures for the rule.
- **Standing rules 47 and 48:** suite, typecheck and build on the owner's machine; the timed sweep on the quiet machine, by Blurby.Brain.
- **Standing rule 52:** the records are `.json` and `.md` under `docs/`, and `npx vitest list` confirms one new collected file.
- **Standing rule 53:** no `build.files` path changes, so the package is recorded as unchanged against NARRATE-HARNESS-COLDCLICK-1's verified package.
- **Standing rule 36:** every cited line was grep-verified at `1937e999` and is re-grepped on the base branch at dispatch.
- **Standing rule 41:** the fence exempts the time log.
- **Standing rule 50:** the launcher's warm-budget waiver moved to NARRATE-HARNESS-COLDCLICK-1's class-aware budget, and this item judges against that, not against the old fixed 2,000 ms.
- **Standing rule 51:** this specification appends no lesson-status line.


<a id="chapter-step-cfi-1-spec"></a>

#### CHAPTER-STEP-CFI-1 — Contents jumps and chapter steps in Focus, Flow and Narrate save the landed word with the landed cfi, and Focus shows the chapter's first word as the reading word *(**In Flight; stopped 2026-10-23 at Done-when 1 (`796282c2` on `eb/chapter-step-cfi-1`): design 2's resolve order fails on the control. Awaits the dispatching session's mid-dispatch decision**; position 97 — Full Spec; absorbs FOCUS-TOC-JUMP-WORD-1 (position 99); authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on the stacked base `origin/eb/band-align-2` @ `85e32777` + `origin/eb/jump-landing-save-1` @ `8a7c9db6`, edit sites read on both; owner ruling 2026-10-23 (tier 3): "First word of chapter"; after JUMP-LANDING-SAVE-1 and BAND-ALIGN-2; build-and-hold; not a release gate)*

- **Full specification:** [`docs/planning/specs/2026-10-23-5/CHAPTER-STEP-CFI-1.md`](docs/planning/specs/2026-10-23-5/CHAPTER-STEP-CFI-1.md) (kept outside ROADMAP.md by roadmap review 2026-10-23-5 because it sits beyond the five-item dispatch buffer and the roadmap is at its length ceiling; it moves inline when it enters the buffer). Dispatch-ready: U9 and U10 pass.


<a id="restamp-rerun-race-1-spec"></a>

#### RESTAMP-RERUN-RACE-1 — Two re-stamp runs in a row on one section document: reproduce first, then fix or close as not reachable *(**built and held `79e1d9d0` on `eb/restamp-rerun-race-1`: red first `dd0b8524`, fix `b1f7097c` (W1, W2); In Flight, merge held for the Stage 8 freeze**; position 98 — Full Spec; authored 2026-10-23 by Blurby.Roadmap (roadmap review 2026-10-23-5) on `eb/jump-landing-save-1` @ `8a7c9db6`; build-and-hold under the Stage 8 freeze; not a release gate)*

- **Full specification:** [`docs/planning/specs/2026-10-23-5/RESTAMP-RERUN-RACE-1.md`](docs/planning/specs/2026-10-23-5/RESTAMP-RERUN-RACE-1.md) (kept outside ROADMAP.md by roadmap review 2026-10-23-5 because it sits beyond the five-item dispatch buffer and the roadmap is at its length ceiling; it moves inline when it enters the buffer). Dispatch-ready: U9 and U10 pass.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** tip `79e1d9d0`. It is stacked on TOC-JUMP-SAVE-1, then PAGE-SAVE-RESTAMP-3 Wave A, then JUMP-LANDING-SAVE-1, and it touches `src/components/ReaderContainer.tsx` through that stack. **Merge order:** after JUMP-LANDING-SAVE-1.


<a id="eink-controls-1"></a>

#### EINK-CONTROLS-1 — One E-ink switch: the theme is dropped and the switch carries its colours; Dark becomes pure black *(position 96 — Full Spec; authored 2026-10-23 by Blurby.Roadmap from the owner's decision of 2026-10-23 (tier 3); post-release; no shared-core touch)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-5.md) (moved by roadmap review 2026-10-23-5 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `574f20ef`; search for `#### EINK-CONTROLS-1`). The builder, the merge and the close-out read it there.
- **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** `8506bf0c`, tip `e6bf358c`. This is the rebuild with Blurby.Brain's ruling (A), a one-line fence widening at `main/ipc/state.js:37` (red `b60c330e`, green `a61752a3`). Built and held for the Stage 8 freeze.

<a id="narrate-start-stack-1"></a>

#### NARRATE-START-STACK-1 — Log the full stack when Narrate fails to start *(release fix, merged; In Flight, close-out held for the owner's smoke re-check (gate (1) passed 2026-10-23))*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-3.md#narrate-start-stack-1) (moved by roadmap review 2026-10-23-3). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="narrate-sentence-initials-1"></a>

#### NARRATE-SENTENCE-INITIALS-1 — A single-letter initial does not end a sentence *(built `c93f7c09` on `eb/narrate-sentence-initials-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `c93f7c09` on `eb/narrate-sentence-initials-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#narrate-sentence-initials-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="ui-sweep-triage-1"></a>

#### ERROR-LOG-CAP-1 — error.log is size-capped and rotated *(built `ae17d903` on `eb/error-log-cap-1`; In Flight, merge held for the Stage 8 freeze)*

- **State:** built and pushed at `ae17d903` on `eb/error-log-cap-1`; its staging memo records which pre-merge gates have run. It merges after the Stage 8 freeze lifts, in the post-freeze merge train ([plan](docs/planning/roadmap-reviews/2026-10-23-plan.md#post-freeze-merge-train-for-blurbyroadmap-merge-go-stays-with-it)).
- **Merge order:** after the Stage 8 freeze lifts.
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23.md#error-log-cap-1) (moved by roadmap review 2026-10-23; byte-identical to `ROADMAP.md` @ `6bd428e6`). Before merging, the run re-reads it there; the close-out moves it to `ROADMAP_legacy.md`.

<a id="book-type-scale-1"></a>

#### BOOK-TYPE-SCALE-1 — Books use one type scale for headers, sub-headers and body text *(merged; In Flight, close-out held by the Stage 8 release gate)*

- **State:** position 6.5 — Full Spec; authored 2026-10-23 on main @ `6dd452e4` from the owner's design decision; **in the release line, owner decision 2026-10-23 ("In this release")**; merges after BOOK-TEXT-COLOUR-1, which edits the same four files; adds smoke re-check: book headings and body text in Page, Focus, Flow and Narrate
- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md#book-type-scale-1) (moved by roadmap review 2026-10-23-2; byte-identical to `ROADMAP.md` @ `27efb3a0`). The close-out verifies its Done-when rows there and moves the section to `ROADMAP_legacy.md`.

<a id="smoke8-diag-1"></a>

#### PAGE-PAGES-READ-1 — Page turns count toward the pages-read goal *(Seq 113 — Full Spec; authored 2026-10-25 by roadmap review 2026-10-25 on `main` @ `97568b09`, from PAGE-SAVE-RESTAMP-3's Wave C re-scope (KEEP-FURTHEST-FIX-1 did the rest); post-release, in its own `ReaderContainer.tsx` integration window; not a release gate)*

- **What:** In Page mode, each forward page turn past the furthest mark adds its words to the reading goal's pages count, as Focus and Flow progress already do. Words carry over between turns, so a page under 250 words still counts once enough words add up.
- **Why:**
  - Page turns never reach the pages-read count. `onPageTurned` commits with `persist: true` (`src/reader/modes/page/ModeRuntime.ts:587`), which sets `resumeAnchor` (`page/helpers/usePersistentReadingAnchor.ts:64-65`). `onRelocate` then exits at `ModeRuntime.ts:477` (`shouldPersistRelocateProgress`, `page/helpers/persistentReadingAnchor.ts:92`). So `scheduleRelocateSave`, the only foliate caller of `recordPages` (`src/components/ReaderContainer.tsx:323-327`), never runs in Page mode.
  - Since KEEP-FURTHEST-FIX-1, the persistence port raises the furthest mark on each Page save (`ReaderContainer.tsx:311-316` → `noteHighWater`, `src/hooks/useProgressTracker.ts:160-164`). So even a relocate that reached `:325` would measure its delta from an already-raised mark, giving 0.
  - `calculateHighWaterPagesReadDelta` floors each delta on its own (`src/utils/readingGoals.ts:160-171`, `APPROX_WORDS_PER_PAGE = 250`, `src/constants.ts:162`). One turn's words are lost if they are under 250.
  - Found by the PAGE-SAVE-RESTAMP-3 investigation (probe PHW, `docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-2.md`), and re-traced on `97568b09` by roadmap review 2026-10-25.
- **Design (tier 1, Blurby.Roadmap, 2026-10-25):** the pages count has one owner: the furthest mark.
  - `noteHighWater` adds each rise (`wordIndex − previous mark`, when positive) to a carry, calls `onPagesRead(floor(carry / APPROX_WORDS_PER_PAGE))` when that is at least 1, and keeps the remainder.
  - `scheduleRelocateSave` (`ReaderContainer.tsx:323-327`) stops counting for itself and calls `live.noteHighWater(wordIndex, cfi)`. So Focus, Flow and Narrate count through the same mark.
  - Effects:
    - Page turns count.
    - Focus and Flow keep the remainder that per-relocate flooring dropped, so they count slightly more, which is correct.
    - A revisit below the mark counts nothing, as today.
    - A forward jump (a contents jump or a link) counts its words. That was the rule before KEEP-FURTHEST-FIX-1 moved the mark onto the port.
  - The carry resets when the book changes (the reseed effect, `useProgressTracker.ts:154-157`). The non-foliate path (`useProgressTracker.ts:224-240`) is unchanged.
- **Prerequisites:**
  - The Stage 8 release and the post-freeze merge train (`docs/planning/roadmap-reviews/2026-10-23-plan.md`).
  - KEEP-FURTHEST-FIX-1 is merged (`36ac7466`).
  - Cut from `main` after the merge train. At the cut, re-grep every cited line (standing rule 36).
- **Done when** (PowerShell 7, `pwsh`, from the worktree root):
  1. **Red first (standing rule 43).** Commit the new `describe("PAGE-PAGES-READ-1")` in `tests/keepFurthest.test.tsx` alone. Reuse `mountAt`, and pass `onPagesRead: vi.fn()` in the harness options. On the base, `npx vitest run tests/keepFurthest.test.tsx` exits 1: (pp1) and (pp2) fail with `expected "spy" to be called`. The controls (pp3) and (pp4) pass. Record the output in the memo.
     - **(pp1)** From the open at 1290: `noteHighWater` at 1390, 1490, then 1590. `onPagesRead` is called exactly once, with 1, after the third call (300 words).
     - **(pp2)** Then 1700 (carry 50 + 110 = 160) and 1800 (260): a second call, with 1.
     - **(pp3) control:** a fresh mount, then `noteHighWater` at 2000 (710 words over the open), then 1500 and 1900, both below the mark. `onPagesRead` is called exactly once, with 2.
     - **(pp4) control:** `handleKeepFurthest` still sends the furthest mark and its cfi. The three KEEP-FURTHEST-FIX-1 tests pass unchanged.
  2. **Fix.** Edit `src/hooks/useProgressTracker.ts`: add the carry ref, count in `noteHighWater`, and reset in the reseed effect. Edit `src/components/ReaderContainer.tsx:323-327`: drop `calculateHighWaterPagesReadDelta` and `recordPages` there, and call `live.noteHighWater(wordIndex, cfi)`. If the import goes unused, remove it. `npx vitest run tests/keepFurthest.test.tsx tests/useProgressTracker.test.ts tests/readingGoals.test.ts tests/useReadingGoals.test.tsx tests/readerModes/pagePositionSave.test.tsx` exits 0.
  3. **Focus and Flow keep counting (no regression).** Add (pp5) to the same describe: `scheduleRelocateSave`'s new body, called through a shell stub with relocates at 1290 + 260 and + 520, calls `onPagesRead` with 1 then 1. If that is hard to reach without mounting `ReaderContainer`, assert it at the hook level instead: two `noteHighWater` calls of 260-word rises give two calls of 1. Name in the memo which form was used.
  4. `npm test` exits 0, `npm run typecheck` exits 0 and `npm run build` exits 0 on the owner's machine (standing rules 47 and 48).
  5. **Live, packaged (standing rule 53(a), `--arm64`; a fresh scratch profile proved before the first input, LL-165).** The trigger that commits state is the settings save (`saveGoals` → `updateSettings` → `save-settings`, `main/ipc/state.js:30`). The check reads the renderer's goal state through a CDP probe, not a file (standing rule 54, LL-166).
     - Seed a goal of type "pages" on the scratch profile.
     - Open the sample *Meditations* in Page and turn forward 10 pages.
     - Read the goal's progress from the probe. It rose by floor((last landed word − open word) / 250).
     - **Control on a base `--dir` build (standing rule 54):** the same steps leave the goal at 0.
     - Record both values and the word indexes in the memo.
  6. **Package verification (standing rule 53):** (a)–(e) on the final commit with `origin/main` merged in, including `npx asar list` showing `dist/` rebuilt. Blurby.Brain confirms.
  7. **Fence (standing rule 41):** `git diff --name-status <base>` lists exactly `M src/hooks/useProgressTracker.ts`, `M src/components/ReaderContainer.tsx` and `M tests/keepFurthest.test.tsx`, plus the staging memo and the time log.
- **Effort:** S.
- **Owners:** the implementation agent; reviewers for spec compliance and quality, in parallel (standing rule 9); Blurby.Brain for package verification.
- **Source:** the PAGE-SAVE-RESTAMP-3 Wave C finding PHW and its re-scope note (ROADMAP.md, PAGE-SAVE-RESTAMP-3 card); KEEP-FURTHEST-FIX-1 `0cbcb04b`; the code trace by roadmap review 2026-10-25 on `97568b09`.
- **Path:** dispatch.
- **Origin:** split from PAGE-SAVE-RESTAMP-3 Wave C (Seq 80) by roadmap review 2026-10-25. The other Wave C leftover, saving the furthest mark across sessions, is FURTHEST-PERSIST-1 (stub, tier 2).

##### Implementation detail
- **Edit sites:** `src/hooks/useProgressTracker.ts:150-164` (the refs, the reseed effect and `noteHighWater`); `src/components/ReaderContainer.tsx:323-327` (`scheduleRelocateSave`).
- **Tests:** `tests/keepFurthest.test.tsx`, a new describe `PAGE-PAGES-READ-1` with (pp1)–(pp5).
- **Constants:** `APPROX_WORDS_PER_PAGE = 250` (`src/constants.ts:162`), unchanged. No new constant.
- **Branch:** `eb/page-pages-read-1` from `main` after the post-freeze merge train.
- **Staging plan:** stage the three fence paths, the memo and the time log by exact path (policy.git: push). Merge with `--no-ff` (Rule 5b) once the package is verified.
- **Shared-core touches:** `src/components/ReaderContainer.tsx` (five lines in `scheduleRelocateSave`). It runs in its own integration window after the merge train. It must not run in parallel with any item that edits `ReaderContainer.tsx`.
- **Lane ownership:** Reader Engine; execution surface C/A (progress hook). **Forbidden during a parallel run:** `src/types.ts`, `src/utils/FlowScrollEngine.ts`, the mode runtimes under `src/reader/modes/`. **Merge order:** after every held branch that edits `ReaderContainer.tsx`.
- **Failure handling:**
  - **An existing reading-goal or KEEP-FURTHEST test fails at step 2:** report it and stop. Do not edit the test (standing rule 50); the design needs Blurby.Brain.
  - **The base control in step 5 shows a non-zero count:** the trace is wrong. Stop and report. Some other path counts Page turns, and the fix would double-count.
  - **Rollback:** `git revert -m 1 <merge>`. No stored data changes shape.

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red describe (pp1–pp4) committed alone, failures recorded | calculable | positive control | bounded | low | 20m | — | — |
| 2 | Furthest mark owns the pages count; relocate save routes through it | calculable | feature | bounded | medium | 30m | — | — |
| 3 | Focus/Flow no-regression case (pp5) | calculable | test | bounded | low | 15m | — | — |
| 4 | Suite, typecheck, build | calculable | verify | bounded | low | 15m | — | — |
| 5 | Packaged live goal check with base control, read from state; rule 53 verification; memo, time log, push | calculable | live verification | bounded | medium | 50m | — | — |

**Total:** 2h10m (estimate; the timing tool is not installed in this plugin version)

##### Lessons applied
- **LL-158 / standing rule 54:** the live row names the trigger that commits the goal (the settings save), and a base control shows 0 first.
- **LL-166 / standing rule 55:** the live verdict reads the goal state through a probe, not a screenshot, and the base control proves the detector can see a difference.
- **LL-165:** the live launch proves its scratch profile before the first input.
- **LL-152:** the base and fixed builds use the same probe and the rule 53 build recipe.
- **LL-138 / standing rule 43:** red first, with controls (pp3, pp4).
- **LL-149 / standing rule 48:** typecheck and build are restated in step 4.
- **LL-167 / standing rule 53:** not done until the packaged arm64 build is verified and Blurby.Brain confirms.
- **LL-156 / standing rule 50:** no existing test is edited. The KEEP-FURTHEST-FIX-1 tests pass unchanged.
- **Standing rule 51:** this specification appends no lesson-status line.

<a id="auto-archive-1-spec"></a>

#### AUTO-ARCHIVE-1 — Confirm completion before archiving *(Seq111; Queued / Stub; owner amendment approved 2026-10-26)*
- **Outcome:** on assumed completion, Keep in Library or Archive; dismissal/default keeps it visible. Archive needs an affirmative action. Preserve compatible explicit Mark complete/Undo behavior; amended completion/history/prompt tests are required before Full Spec.
- **History:** the superseded automatic-on-exit design and its earlier assertions are preserved in [the dated snapshot](docs/planning/roadmap-reviews/2026-10-26-roadmap-before-specification.md#auto-archive-1-spec); they are not executable instructions. LIBRARY-COMPLETION-VISIBILITY-1 repairs the display independently.

#### Stubs beyond the buffer (roadmap review 2026-10-14)

- <a id="page-para-keys-1"></a>**PAGE-PARA-KEYS-1 — Page's paragraph keys move the highlight to a real paragraph start** *(Seq 115 — stub; added by roadmap review 2026-10-25 from Blurby.Brain's finding during package verification; BUG-220; not a release gate)*. In Page, with the highlight on word 187, Shift+→ moved it to −1 and Shift+← to 0, on a packaged build. The probable cause is the paragraph command's slice index. Specify after a trace of Page's paragraph command (Shift+←/→ through `useReaderKeys`) on the held key-fix stack: FOCUS-KEYS-FIX-1 → FLOW-KEYS-FIX-1 → FLOW-PARA-KEYS-1 → BLOCK-TAG-CASE-1. Those fixed the same keys in Focus and Flow. Prerequisites: READER-ARROW-GUARD-1 and BLOCK-TAG-CASE-1. Lane: Reader Engine.
- <a id="furthest-persist-1"></a>**FURTHEST-PERSIST-1 — The furthest page a reader reached is remembered across sessions** *(Seq 114 — stub; added by roadmap review 2026-10-25, split from PAGE-SAVE-RESTAMP-3 Wave C; tier 2: it changes what the backtrack prompt offers)*. Today the furthest mark lives only in memory for one open (`useProgressTracker.ts:150-164`). `update-doc-progress` (`main/ipc/documents.js:15-33`) saves only `position` and `cfi`, and `useLibrary.updateProgress` (`src/hooks/useLibrary.ts:158-163`) copies only those. `src/types.ts:108` declares `furthestPosition` with an out-of-date comment, has no `furthestCfi`, and main never writes either. So a reader who backs up and quits without the exit prompt loses the furthest page, and the next session's prompt measures from the saved position. A fix saves `furthestPosition` and `furthestCfi`, only when higher, through the progress IPC, and touches `src/types.ts` (shared core), `preload.js:54`, `main/ipc/documents.js`, `useLibrary.ts` and possibly the sync merge (`main/sync-engine.js:328-338`). **Owner ruling (2026-10-25, tier 2): the furthest page ever reached.** The backtrack prompt in a later session offers the furthest page the reader has ever reached in that book. It still needs a full specification (the edit sites above); it is beyond the buffer. Lane: Reader Engine.


Each stub needs investigation or an owner decision before it can be specified (Rule 6a).


- <a id="narrate-harness-coldclick-1"></a>**NARRATE-HARNESS-COLDCLICK-1** is now a full specification: [NARRATE-HARNESS-COLDCLICK-1](#narrate-harness-coldclick-1-spec) (roadmap review 2026-10-23-5).
- <a id="narrate-cpu-profile-1"></a>**NARRATE-CPU-PROFILE-1** is now a full specification: [NARRATE-CPU-PROFILE-1](#narrate-cpu-profile-1-spec) (roadmap review 2026-10-23-5).


- **LARGE-FOLDER-SYNC-1, design half — what Blurby does with a very large source folder** *(superseded by BLURBY-SERVER-1, roadmap review 2026-10-23-3; was an open owner decision, CLAUDE.md Rule 11 tier 3; split from the technical half, which is the Full Spec at position 14 above, 2026-10-14)*. On the owner’s 120,190-file Drive folder (120,166 EPUBs, mostly under `Books` and `BooksBooks`; a full scan takes 93.6 s), the startup sync would import every file the library lacks (about 120,000). The technical half makes that import safe (one sync at a time, progress saved every 30 s, nothing dropped) but does not limit it. Options to put to the owner: (1) import everything; (2) cap the import and say so; (3) ask the user to choose subfolders when a folder is very large. Related cost the choice must settle: `broadcastLibrary` sends the whole library to the renderer on every save. **Owner decision, 2026-10-23: no limit on the local import, and no subfolder picker.** Blurby is moving to a server-hosted model (storyboard opened 2026-10-23), and limits will come from future plan tiers (free and paid), not from the desktop import. So the design half is closed with no work item. Residual technical risk, for the server model to remove: `broadcastLibrary` sends the whole library on every save, which a very large local library makes slow. The owner keeps `sourceFolder` cleared until the technical half lands. Evidence: `docs/governance/close-outs/Memo.FOLDER-SCAN-PERF-1.GovernanceStaging.2026-10-14.md`. Lane: Library & Content.
- <a id="word-index-unify-1"></a>**WORD-INDEX-UNIFY-1** is now a full specification: [WORD-INDEX-UNIFY-1](#word-index-unify-1-spec) (roadmap review 2026-10-23-5).

<a id="page-save-restamp-3"></a>

#### PAGE-SAVE-RESTAMP-3 — Rare page-save edge cases after the restamp guard, and "Keep at furthest" *(**Wave A built and held 2026-10-23 at `c3510303` (code `88c1dae7`) on `eb/page-save-restamp-3`, cut from the TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 chain tip `7ca5a4b7` plus `main`: A1, A2 and A4; `npm test` 2,462 passed / 1 skipped / 0 failed, typecheck and build 0; live, both clicks save in order, each with its own cfi. Merge order: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → this branch. Wave B waits for JUMP-LANDING-SAVE-1. Wave C re-scoped by roadmap review 2026-10-25 into PAGE-PAGES-READ-1 (Seq 113) and FURTHEST-PERSIST-1 (Seq 114, stub), so this item ends at Wave B. KEEP-FURTHEST-FIX-1 did most of it; left over are page turns not adding to the pages-read count, and the furthest page's cfi not saved to `library.json`. The memo stages a follow-up stub, RESTAMP-RERUN-RACE-1, for the quality review's unreproduced races W1 and W2. Spec corrections: A-5's grep count is 3, not 4; A-6's pass mark is "both clicks saved, in order"**; Seq 80 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#page-save-restamp-3) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="narrate-reconcile-residual-1"></a>**NARRATE-RECONCILE-RESIDUAL-1** is now a full specification: [NARRATE-RECONCILE-RESIDUAL-1](#narrate-reconcile-residual-1-spec) (roadmap review 2026-10-23-5).
- <a id="folder-notice-2"></a>**FOLDER-NOTICE-2 — Follow-ups from FOLDER-NOTICE-1** *(dissolved, roadmap review 2026-10-23-3)*. The owner approved dissolving it: BLURBY-SERVER-1 retires the watched source folder in its Phase 2 (ruling Q2), so the banner it polished goes away. FOLDER-UNREACHABLE-GUARD-1 and FOLDER-NOTICE-1 are merged and still ship.
- <a id="narrate-exit-crash-1"></a>**NARRATE-EXIT-CRASH-1 — SUPERSEDED (roadmap review 2026-10-23-4, owner-approved): ELECTRON-42-UPGRADE-1 replaced its fix, and release gate (1) passed on Electron 42 with 0 of 51 launches crashing. The terminal record goes through /dispatch-closeout. Original stub follows.** A native crash on Narrate producer teardown under Electron** *(position 55 — stub; RELEASE GATE (11) since 2026-10-15)*. From NARRATE-REBUILD-1 P6b wave A (Blurby.Brain ruling 2026-10-15): `scripts/narrate-rebuild/p3-producer-check.mjs` prints `pass:true` under the app's Electron, then exits 0x40000015 at shutdown (twice; `--break` still exits 1). A native crash on producer teardown is close to the 0xC0000409 risk QUIT-FLUSH-1 guards. Check whether the real app crashes on quit while Narrate is playing and while it is paused (crash dialog, crash dump under the profile's Crashpad folder), find the teardown order that crashes, and fix it. **Confirmed 2026-10-15 (release gate (1) on the quiet machine, main `1da81be2`):** 57 of 121 launches exited 0x80000003 (STATUS_BREAKPOINT), all of them cold-trial launches, each after the measurement and after `flushed {ok:true}` (no data lost); the last log line in every crashed log and in no clean one is `PostQueuedCompletionStatus: (6) The handle is invalid.` Evidence in the owner's Drive, `Blurby-transfer\release-final-main\final-main-d3d6\`. Read-only diagnosis in progress (Blurby.Roadmap); the fix keeps QUIT-FLUSH-1's awaited producer shutdown; gate: 0 crashed launches on the quiet machine's full launcher run. Lane: TTS / Narration Engine. **Roadmap review 2026-10-22:** ELECTRON-42-UPGRADE-1 carries the fix (release gate (11)). When its Done-when 12 shows 0 crashed launches on the quiet machine, the next review retires this stub as superseded by ELECTRON-42-UPGRADE-1, with that run as the evidence. Until then it stays queued as the record of the defect.

<a id="jump-landing-save-1"></a>

#### JUMP-LANDING-SAVE-1 — Link, footnote and chapter jumps in Page mode save the page they land on *(**Built and held 2026-10-23 at `8a7c9db6` on `eb/jump-landing-save-1`**, cut from PAGE-SAVE-RESTAMP-3's tip `c3510303` plus `main` `7c4a7a88` (merge `075d10b0`). Red tests alone first (`d48f391e`: 7 failures as specified, controls green), then fixes A and C (`d031cc89`), and B (`6cdd51b9`). `npm test` 2,471 passed / 1 skipped / 0 failed; typecheck and build 0. Fence: the six spec files plus the memo and time log. Live, on scratch-profile `--dir` builds: the control fails a, b and c; fixed, link, chapter steps, quit and reopen, footnote and Focus chapter step all save the landing word and agree with `library.json`. Solon approved; Plato minor, none critical. **Roadmap ruling (tier 1):** (fr1n) in `pagePositionSave.test.tsx` now sets `explicitSelectionAnchor` directly instead of `runtime.navigateTo(4)`, which fix C makes a no-op on an EPUB; its assertion is unchanged and its mutation control stays red. Wave B note: fr1's negative branch is now only defensive on an EPUB. **Spec correction:** Done-when 3's third grep prints 4 lines, not 3: the base already had the chapter-label line (`:797`, now `:801`). Follow-ups in the memo: stub CHAPTER-STEP-CFI-1 (Focus's chapter step saves the entry's word with the old section's cfi); an attached CDP or `--inspect` client holds `app.quit()`, which answers PAGE-SAVE-RESTAMP-3's quit-flush risk. Merge order after the release: TOC-JUMP-SAVE-1 → PAGE-HELD-TURN-FAIL-1 → PAGE-SAVE-RESTAMP-3 → this branch, then PAGE-SAVE-RESTAMP-3 Wave B. Memo: `docs/governance/close-outs/Memo.JUMP-LANDING-SAVE-1.GovernanceStaging.2026-10-23.md` on the branch; position 63 — Full Spec; authored 2026-10-23 on main @ `48ce4db9`; pre-existing; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#jump-landing-save-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="win-target-nsis-1"></a>**WIN-TARGET-NSIS-1** is now a full specification: [WIN-TARGET-NSIS-1](#win-target-nsis-1-spec) (roadmap review 2026-10-23-4).
- <a id="library-write-race-2"></a>**LIBRARY-WRITE-RACE-2** is now a full specification: [LIBRARY-WRITE-RACE-2](#library-write-race-2-spec) (roadmap review 2026-10-23-5).

<a id="zip-async-read-1"></a>

#### ZIP-ASYNC-READ-1 — Read EPUB archives asynchronously *(**built `4e821a04` on `eb/zip-async-read-1`, stacked on ZIP-READ-FOLLOWUPS-1 `29b3e7e5`, 2026-10-23: red first `6ad30e42`, fix `16064a99`, `npm test` 2,439 passed / 1 skipped / 0 failed, typecheck and build 0; In Flight, merge held for the Stage 8 freeze, after ZIP-READ-FOLLOWUPS-1**; Seq 82 — Full Spec; authored 2026-10-23 on `eb/zip-read-followups-1` @ `29b3e7e5`, ZIP-READ-FOLLOWUPS-1's held tip; not a release gate)*

- **Full specification:** [snapshot](docs/planning/.Archive/ROADMAP_snapshot_2026-10-23-4.md#zip-async-read-1) (moved by roadmap review 2026-10-23-4 to keep ROADMAP.md under its length ceiling; byte-identical to `ROADMAP.md` @ `c4dc306c`). The builder, the merge and the close-out read it there.

- <a id="band-align-2"></a>**BAND-ALIGN-2 — The cursor word's line sits in the fixed band: Focus scrolls to it, Flow runs on one clock** *(position 83 — Full Spec, see [BAND-ALIGN-2](#band-align-2-spec); L, amended by the owner 2026-10-23; after BAND-ALIGN-1, FOCUS-KEYS-FIX-1 and FLOW-KEYS-FIX-1; post-release; not a release gate)*. Owner decision 2026-10-23 (BAND-ALIGN-1 Part B, tier 3): "keep band fixed". Lane: Reader Engine.
- <a id="narrate-quit-linger-1"></a>**NARRATE-QUIT-LINGER-1** is now a full specification: [NARRATE-QUIT-LINGER-1](#narrate-quit-linger-1-spec) (roadmap review 2026-10-23-4).
- <a id="reader-arrow-guard-1"></a>**READER-ARROW-GUARD-1** is now a full specification: [READER-ARROW-GUARD-1](#reader-arrow-guard-1-spec) (roadmap review 2026-10-23-4).
- <a id="chapter-step-cfi-1"></a>**CHAPTER-STEP-CFI-1** is now a full specification: [CHAPTER-STEP-CFI-1](#chapter-step-cfi-1-spec) (roadmap review 2026-10-23-5).
- <a id="restamp-rerun-race-1"></a>**RESTAMP-RERUN-RACE-1** is now a full specification: [RESTAMP-RERUN-RACE-1](#restamp-rerun-race-1-spec) (roadmap review 2026-10-23-5).
- <a id="focus-toc-jump-word-1"></a>**FOCUS-TOC-JUMP-WORD-1 — SUPERSEDED (roadmap review 2026-10-23-5):** folded into [CHAPTER-STEP-CFI-1](#chapter-step-cfi-1-spec). Both edit Focus's `navigateTo`, the `go-to-href` case and `onRelocate`, and the owner's "first word of chapter" ruling needs the landing hook that fix adds. The ruling is carried there.
- <a id="flow-toc-jump-word-1"></a>**FLOW-TOC-JUMP-WORD-1 — After a contents jump, Flow highlights the chapter's first word** *(position 110 — stub; owner ruling 2026-10-23: "Yes, as a follow-up" to CHAPTER-STEP-CFI-1; after CHAPTER-STEP-CFI-1)*. Flow gets the same paused cursor on the jumped-to chapter's first word that CHAPTER-STEP-CFI-1 gives Focus, using that item's landing hook. Specify it after CHAPTER-STEP-CFI-1's Done-when 1 has recorded what Flow shows today. Lane: Reader Engine.
- <a id="auto-archive-1"></a>**AUTO-ARCHIVE-1** requires a specification amendment: [confirmation-first owner direction](#auto-archive-1-spec), 2026-10-26. Queued, Stub; the earlier automatic-on-exit design is historical.
- <a id="flow-para-pause-index-1"></a>**FLOW-PARA-PAUSE-INDEX-1** is now a full specification: [FLOW-PARA-PAUSE-INDEX-1](#flow-para-pause-index-1-spec) (Blurby.Roadmap, 2026-10-23; dispatched the same day).
- <a id="overlay-theme-sweep-1"></a>**OVERLAY-THEME-SWEEP-1** is now a full specification: [OVERLAY-THEME-SWEEP-1](#overlay-theme-sweep-1-spec) (roadmap review 2026-10-23-4).
- **EINK-CONTROLS-1** is now a full specification: [EINK-CONTROLS-1](#eink-controls-1) (owner decision 2026-10-23).


<a id="blurby-server-1"></a>

#### BLURBY-SERVER-1 — One library on every device (blrby.app server) *(position 104 (97 until review 2026-10-23-4, then 100 until the owner moved Stage 9's tabs, feeds and extension ahead of it, 2026-10-23) — Path: epic; absorbed by roadmap review 2026-10-23-3 from held storyboard `2026-10-23-blurby-server`; after the Stage 8 release and the post-freeze merge train, ahead of the rest of Stage 9)*

- **What:** a Blurby server on Cloudflare (blrby.app) holds each account's books, reading positions, highlights, notes and settings.
  - The desktop gains sign-in (Google, Microsoft, Apple or email) and a drag-and-drop window, the only way books come in. The watched source folder stops importing (owner ruling Q2).
  - Plan limits (Free, Plus, Unlimited) are adjustable server data.
  - Payments follow, with no ads on the desktop: AdSense does not allow ads in software applications, so ads return later with the phone apps or a web reader.
  - Then Kokoro narration on the server (Kokoro only, no fallback engine).
- **Why:** one library across devices (owner, 2026-10-23: "remove barriers to access between devices"). It is the foundation the phone apps, Newsroom, Podcasts and the browser extension depend on, and it removes the local large-folder bottleneck (`broadcastLibrary` resends the whole library on every save).
- **Phases** (specified in the charter draft):
  1. Server foundation and plan limits (server-only; may open in parallel with the merge train once the release ships).
  2. Desktop sign-in, drag-and-drop, sync and offline books. It edits `src/types.ts`, so it needs a declared integration window.
  3. Payments only (Paddle or Stripe Managed Payments, chosen at the Phase 3 gate).
  4. Server narration on Kokoro: the speed-and-cost test, then hosting when the first phone app needs it.
- **Done when (epic level):** the storyboard's frames 1–6 hold, and blrby.app publishes terms of use and a takedown contact before uploads open. The full Definition of Done and per-phase rows are in the charter draft.
- **Owner rulings (2026-10-23, all closed):**
  - Kokoro-only server narration;
  - no desktop ads for now;
  - a 200 MB per-file upload cap;
  - drag-and-drop as the only intake;
  - a fourth device on Free gets Remove one, Upgrade or Cancel;
  - export-only highlights and notes files;
  - a downgrade deletes nothing;
  - at the Narrate limit, it pauses at the end of the sentence with Upgrade or Cancel;
  - the plan tiers as approved.

  See the alignment record.
- **Prerequisites:**
  - the Stage 8 release;
  - the post-freeze merge train, in particular the `main/ws-server.js` chain, RENAME-TMP-RACE-1 and LARGE-FOLDER-SYNC-3 (Phase 2's files).
- **Source:**
  - the held storyboard [`docs/planning/holding/2026-10-23-blurby-server.md`](docs/planning/holding/2026-10-23-blurby-server.md) (alignment record, frames, tiers, rulings);
  - the epic charter draft [`docs/planning/holding/2026-10-23-blurby-server/charter-draft.md`](docs/planning/holding/2026-10-23-blurby-server/charter-draft.md).
- **Effort:** max (epic). **Lane:** Platform & Maintenance (primary), Library & Content (secondary).
- **Path:** epic — four phases across many sessions, with owner gates between them (Cloudflare account, payment provider, Kokoro speed-and-cost). It cannot be one dispatch. `/next-dispatch` routes it to `/epic`, which turns the charter draft into the launched charter.
- **Effects on other items (applied by roadmap review 2026-10-23-3):**
  - CLOUD-CONNECTORS-1 is rescoped to book sources only, after this epic; its sync-target role moves here.
  - The deferred Cloud Sync lane is absorbed.
  - LARGE-FOLDER-SYNC-1's design half is superseded.
  - FOLDER-NOTICE-2 is dissolved.
  - APP-TABS-1, RSS-AGGREGATOR-1, PODCAST-SOURCE-1 and BROWSER-EXT-FINALIZE-1 gain sign-in and per-tab plan limits.
  - ANDROID-APP-1 and IOS-APP-1 sync through this server.

#### Stage 9 — Product expansion (owner direction, 2026-10-15)

**Re-sequenced by the owner 2026-10-23 (tier 3): "Move ahead of the server".** APP-TABS-1 (100), RSS-AGGREGATOR-1 (101), PODCAST-SOURCE-1 (102) and BROWSER-EXT-FINALIZE-1 (103) now come before BLURBY-SERVER-1 (104). They are built as desktop features without sign-in or plan limits, and adapted when the server lands. Their BLURBY-SERVER-1 prerequisite is removed; RSS, Podcasts and the extension still follow APP-TABS-1. ANDROID-APP-1, IOS-APP-1 and CLOUD-CONNECTORS-1 still wait for the server.

Added by Blurby.Roadmap at the owner's request. Every item is a stub: each needs investigation and owner design decisions before it can be specified (Rule 6a), and none is a Stage 8 release gate. Order follows the owner's list; Library and Newsroom are built first, Podcasts and Marketplace ship as "Coming Soon" banners.

- <a id="app-tabs-1"></a>**APP-TABS-1 — Four tabs: Library, Newsroom, Podcasts, Marketplace** *(position 100 — Full Spec, In Flight: Wave A built `54c0348c` on `eb/app-tabs-1` (review 2026-10-25); ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits)*. The app gets four top-level tabs. Library is the home for all books. Newsroom is the home for all articles and periodicals (saved articles, RSS feeds and the like). **Owner ruling 2026-10-23 (tier 3):** Podcasts is built now (PODCAST-SOURCE-1 fills it); only Marketplace shows a "Coming Soon" banner. Library, Newsroom and Podcasts are built now; this item is the tab shell, the Marketplace banner, an empty Podcasts tab that PODCAST-SOURCE-1 fills, and moving articles out of the book library into Newsroom without losing positions, highlights or sync state. Needs a design pass with the owner before it is specified: the tab bar's placement and look, what moves from the current library (Saved Articles, URL imports, the sources view), and where settings and search live. Lane: UX polish.
  - **Storyboarded with the owner 2026-10-23 — Aligned ("advance").** Alignment record, frames and the approved draft stub: [`docs/planning/specs/2026-10-23-5/APP-TABS-1.storyboard.md`](docs/planning/specs/2026-10-23-5/APP-TABS-1.storyboard.md). In short: the tab bar sits at the top, with filter (hover, click or Enter), search (covers every tab) and settings icons on its right. A per-item home field sends articles to Newsroom by default, with a manual "Move to" override. Podcasts shows an empty state and Marketplace "Coming soon". Next step: `/write-plan` turns it into a full specification.
  - **Full specification (Blurby.Roadmap, 2026-10-23): [`docs/planning/specs/2026-10-23-5/APP-TABS-1.md`](docs/planning/specs/2026-10-23-5/APP-TABS-1.md)**. It is dispatch-ready (U9 and U10 pass) and built in two waves. An item's home is worked out from its type and saved only when the user moves it, so the upgrade writes nothing to `library.json`. It touches the shared-core file `src/types.ts`, so it merges after the Stage 8 release in its own window. It is kept outside ROADMAP.md, beyond the buffer and at the length ceiling, and moves inline when it enters the buffer.
  - **Package verified (standing rule 53; Blurby.Brain, 2026-10-25):** package `48da10c8`, tip `8539ec4c` (pushed). The builder reports the full suite at 2,493 passed, 2 skipped and 0 failed in 186 files, with typecheck and build both 0. Built and held for the Stage 8 freeze. **Merge train (Blurby.Brain):** the branch touches the shared-core file `src/types.ts` in 3 lines (`BlurbyDoc.home`, `BlurbySettings.libraryTab` and the optional `ElectronAPI.setDocHome`). It also adds the preload method `setDocHome` → `set-doc-home`, which validates its input. In the post-release train, no other branch that edits `src/types.ts` merges around it without a rebase. LIBRARY-WRITE-RACE-3 merges after it, and every later branch gets a fresh rule 53 check.
- <a id="rss-aggregator-1"></a>**RSS-AGGREGATOR-1 — RSS feed aggregator for Newsroom** *(position 101 — stub; ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits)*. Subscribe to RSS and Atom feeds, fetch them on a schedule and on demand, and show new items in Newsroom as readable articles (the existing Readability extraction path). It supersedes the deferred Phase 8 RSS/News lane. After APP-TABS-1. Open questions for the owner: feed discovery (paste a URL, OPML import), refresh cadence, how long items are kept, and full-text fetch versus feed summary. Lane: Library & Content.
- <a id="podcast-source-1"></a>**PODCAST-SOURCE-1 — Podcast source service integration** *(position 102 — stub; ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits)*. After APP-TABS-1, replace the Podcasts tab's "Coming Soon" banner with directory search, show profiles, episode lists and built-in audio streaming. **Owner direction added 2026-10-15: use an aggregator API for discovery and metadata; stream episodes directly from the publisher's host.** Lane: Library & Content.

  **Provider strategy:** Evaluate [Podcast Index](https://podcastindex-org.github.io/docs-api/) first: an open podcast directory with free API access, show search, trending feeds and episode metadata. Access requires an API key/secret and signed requests; do not assume complete global coverage or unrestricted usage. Keep [Apple's iTunes Search API](https://performance-partners.apple.com/search-api) as an alternative for podcast discovery and RSS feed lookup (Apple documents approximately 20 calls per minute, subject to change). [Listen Notes / PodcastAPI.com](https://www.listennotes.com/api/) is the commercial alternative if its search capabilities justify the cost; check quotas, attribution and [caching terms](https://www.listennotes.com/api/terms/) before choosing it. These are candidates, not a requirement to integrate all three.

  **Content lifecycle:** `Directory API -> Blurby content service -> Podcasts tab -> built-in audio player -> publisher's audio host`. Search (for example, "True Crime") returns show titles, descriptions and artwork. Opening a show retrieves its episode list; resolve each playable episode's audio URL from the API's enclosure field or the show's RSS `<enclosure url="...">`. The player streams that URL directly from the publisher's host (for example, Buzzsprout or Libsyn); Blurby does not host or persist episode audio in this initial scope. Normal playback buffering still applies. A directory listing or platform page URL is not itself a playable audio URL; private, subscription-only or platform-exclusive episodes may be unavailable.

  **Desktop architecture direction:** Directory and RSS requests go through the main process and narrowly exposed IPC; credentials must stay out of renderer code, logs and committed files. A shared provider secret must not be embedded in a distributed desktop build: decide between user-supplied credentials and a backend credential service before specification. Audio streams directly to the player; a metadata service does not imply an audio proxy. Podcast playback must preserve reading-mode isolation and remain separate from Narrate's speech-generation runtime.

  **Before this stub becomes dispatch-ready:** Confirm provider and credential model, search/browse UI and playback controls, metadata refresh/cache policy within provider terms, and handling for empty searches, rate limits, offline state, unavailable feeds and broken audio links. Specify validation of remote URLs and untrusted feed descriptions. Acceptance must demonstrate search -> show -> episodes -> playback from a real public feed, with no hosted audio and no exposed secrets. Transcripts and offline downloads remain separate scope decisions. Full WHERE, tasks, execution sequence and test criteria still require investigation under Rule 6a. Provider documentation reviewed 2026-10-15; no authenticated podcast API or playback test executed.
- <a id="cloud-connectors-1"></a>**CLOUD-CONNECTORS-1 — Connections to the mainstream cloud services** *(position 51 — stub)*. **Rescoped by roadmap review 2026-10-23-3 (owner): book and article sources only, after BLURBY-SERVER-1.** Cross-device sync and the sync-target role belong to the server epic. Each import goes through the server intake and its plan limits (owner ruling Q2). Connect Google Drive, OneDrive, Box, Dropbox and iCloud as book and article sources. Builds on the existing Microsoft (@azure/msal-node) and Google (googleapis) auth and the deferred Phase 7 Cloud Sync lane, which it supersedes. Likely splits into one item per service. Open questions for the owner: source only, or sync too; which service first; and iCloud on Windows (no first-party API, so likely iCloud Drive's local folder). Lane: Platform & Maintenance. **Path:** epic — four providers, each with its own auth, sync and conflict design, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="android-app-1"></a>**ANDROID-APP-1 — Establish the Android app** *(position 52 — stub; after BLURBY-SERVER-1: syncs through BLURBY-SERVER-1 (not CLOUD-CONNECTORS-1) (roadmap review 2026-10-23-3))*. Stand up Blurby on Android: reading modes, library, and sync with the desktop app. Supersedes the deferred Track C (APK-0 to APK-4) lane, whose earlier specs are in docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md. Needs an architecture decision first (native, React Native, a Capacitor/WebView shell around the renderer, or another route) and depends on how sync is settled (CLOUD-CONNECTORS-1). Lane: Platform & Maintenance. **Path:** epic — a new platform build, packaging and release track, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="ios-app-1"></a>**IOS-APP-1 — Establish the iOS app** *(position 53 — stub; after BLURBY-SERVER-1: syncs through BLURBY-SERVER-1 (not CLOUD-CONNECTORS-1) (roadmap review 2026-10-23-3))*. Stand up Blurby on iOS and iPadOS: reading modes, library, and sync with the desktop app. Shares the architecture decision with ANDROID-APP-1; Apple's developer account, signing and App Store review are prerequisites. Lane: Platform & Maintenance. **Path:** epic — a new platform build, packaging and App Store track, over several sessions; it cannot be one dispatch (roadmap review 2026-10-22).
- <a id="car-audio-1"></a>**CAR-AUDIO-1 — Android Auto and Apple CarPlay compatibility** *(position 109 — stub; added 2026-10-23 at the owner's request; after ANDROID-APP-1 and IOS-APP-1)*. Narrated books (and, once they exist, podcasts) play through the car: a browsable library and now-playing screen in Android Auto and Apple CarPlay, with play, pause, skip and rate controls, and the reading position saved as it plays. Both platforms allow only their audio-app templates, so this is a listening surface, not a reader. Needs owner design decisions before specification: what the car shows (books, chapters, recently read), whether Kokoro runs on the phone or streams from the server, and Apple's CarPlay audio entitlement. Lane: TTS / Narration Engine.
- <a id="queue-sync-1"></a>**QUEUE-SYNC-1 — One reading queue and one listening queue, synced across every surface** *(position 112 — stub; added 2026-10-23 at the owner's request; after BLURBY-SERVER-1)*. Owner's request: "Android auto/carplay, mobile, etc. have synced reading and listening queues across all surfaces". The desktop already has a reading queue (`src/components/ReadingQueue.tsx`, `src/utils/queue.ts`; add and remove on `DocCard.tsx:146-157`; "G Q" shortcut). This item makes the queue order and contents sync through the blrby.app server to desktop, Android, iOS and the car surfaces, and adds a listening queue for narrated books and, later, podcasts. The car (CAR-AUDIO-1) plays from the listening queue. Needs owner design decisions: whether reading and listening are one queue with a mode per item or two queues; whether a podcast episode can sit in the listening queue; and how a conflict resolves when two devices reorder at once. Prerequisites: BLURBY-SERVER-1; consumed by ANDROID-APP-1, IOS-APP-1 and CAR-AUDIO-1. Lane: Library & Content.
- <a id="browser-ext-finalize-1"></a>**BROWSER-EXT-FINALIZE-1 — Finalize the Chrome and Firefox extensions** *(position 103 — stub; ahead of BLURBY-SERVER-1 by owner decision 2026-10-23, desktop-only until the server adds sign-in and plan limits; once the server lands, `add-article` goes through its intake (roadmap review 2026-10-23-3))*. Finish the browser extension for Chrome and port it to Firefox: save the current page to Blurby (the existing extension pairing and add-article path), packaging and store listings for both. Supersedes the deferred Track B lane (EXT-ENR-C and beyond). After APP-TABS-1, so saved pages land in Newsroom. Needs the owner's list of what "finalized" covers (features, store publishing, accounts). Lane: Chrome Extension.

---

### Active item index — source-backed pointers

These headings expose existing table/bullet items to the board parser; they do not create specifications or change live Status/Seq.

#### APP-TABS-1 — Four tabs: Library, Newsroom, Podcasts, Marketplace *(live Seq100; In Flight; Full Spec)*
- **Source:** docs/planning/specs/2026-10-23-5/APP-TABS-1.md; live register remains status authority.

#### RSS-AGGREGATOR-1 — RSS feed aggregator for Newsroom *(live Seq101; Queued; Stub)*
- **Source:** ROADMAP.md#rss-aggregator-1; live register remains status authority.

#### PODCAST-SOURCE-1 — Podcast source service integration *(live Seq102; Queued; Stub)*
- **Source:** ROADMAP.md#podcast-source-1; live register remains status authority.

#### BROWSER-EXT-FINALIZE-1 — Finalize the Chrome and Firefox extensions *(live Seq103; Queued; Stub)*
- **Source:** ROADMAP.md#browser-ext-finalize-1; live register remains status authority.

#### CLOUD-CONNECTORS-1 — Connections to the mainstream cloud services *(live Seq105; Queued; Stub)*
- **Source:** ROADMAP.md#cloud-connectors-1; live register remains status authority.

#### ANDROID-APP-1 — Establish the Android app *(live Seq106; Queued; Stub)*
- **Source:** ROADMAP.md#android-app-1; live register remains status authority.

#### IOS-APP-1 — Establish the iOS app *(live Seq107; Queued; Stub)*
- **Source:** ROADMAP.md#ios-app-1; live register remains status authority.

#### CAR-AUDIO-1 — Android Auto and Apple CarPlay compatibility *(live Seq109; Queued; Stub)*
- **Source:** ROADMAP.md#car-audio-1; live register remains status authority.

#### FLOW-TOC-JUMP-WORD-1 — After a contents jump, Flow highlights the chapter first word *(live Seq110; Queued; Stub)*
- **Source:** ROADMAP.md#flow-toc-jump-word-1; live register remains status authority.

#### QUEUE-SYNC-1 — One reading queue and one listening queue, synced across every surface *(live Seq112; Queued; Stub)*
- **Source:** ROADMAP.md#queue-sync-1; live register remains status authority.

#### FURTHEST-PERSIST-1 — The furthest page a reader reached is remembered across sessions *(live Seq114; Queued; Stub)*
- **Source:** ROADMAP.md#furthest-persist-1; live register remains status authority.

#### PAGE-PARA-KEYS-1 — Page paragraph keys move the highlight to a real paragraph start *(live Seq115; Queued; Stub)*
- **Source:** ROADMAP.md#page-para-keys-1; live register remains status authority.

### Smoke findings intake — 2026-10-26

### Verification contract for the five smoke-fix specifications
Every Done-when below includes these **unwaived** gates (standing rules43/47/48/53/54/55): decisive new tests committed red on the pinned execution base, applicable controls green, then the smallest fix; at most two bounded repair passes, otherwise stop with an issue. The full suite/typecheck/build run locally on the owner machine. A pre-existing unrelated failure is reported, not retuned or waived.
Build the final implementation with approved main integrated: npm run build; npx electron-builder --win --arm64 --dir --publish never. The output is release/win-arm64-unpacked/Blurby.exe. Before first input, launch with both BLURBY_USER_DATA_DIR and --user-data-dir pointing to a fresh owned profile, read back actual app userData/data path/PID/exe, and abort if normal profile. Hash exactly %APPDATA%/blurby/blurby-data/library.json and settings.json before/after. Preserve logs, build/asar hashes, package files and fixture hashes; source staging never includes personal books/audio.
Standing-rule53 requires 25-second native-ARM64 survival, no unhandled/crash/error beyond its enumerated known noise, unchanged live hashes, matching renderer bundle/asar inclusion, automatable checks rerun against the exact package, owner UI/heard-audio acceptance where named, and confirmation by the designated package verifier before merge. A missing capability or unavailable owner is an execution-environment hold, never a perceptual PASS. Use no install/uninstall operation for these reader/UI items; retain LL-168 if packaging scope later changes.
All five run **serially in approved integration windows**. No sibling mode imports or shared mutable mode store; do not widen the shared-core freeze set. This review creates no implementation branch or exception to the Stage8 freeze. Rollback is revert of the item's own implementation commits, never reset/restore of user data. The plan/repository must be committed and reachable from the execution base before any kickoff.


Owner-authorized targeted roadmap update from the Stage 8 smoke of release 36ac7466749688c9ba5e17de841224fab08d7bae (v1.75.1 ARM64). **Overall RED.** All 17 findings and 13 requests are traced in the [intake and priority report](docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md); defects are indexed in [Issue.SMOKE8-20261026](docs/governance/bug-reports/Issue.SMOKE8-20261026.2026-10-26.md) and BUG_REPORT.md. Notion remains live status authority. No code changes, dispatch, release waiver, completion, merge or new release-gate classification is implied.

**Priority recommendation:** (1) completion visibility/confirmation; (2) Narrate selection/start, paused Focus handoff and Page-entry input; (3) folder responsiveness and profile-isolation diagnosis; (4) verify held Flow/observer fixes and residual typography; (5) device-local E-ink behavior; (6) interaction clarity; (7) low-risk polish. Recheck smoke coverage after an approved candidate integration. These are proposed relative fix priorities, not a silent re-sequencing of the existing release and held merge train. The smoke-fix segment uses whole-number Seq116–139; this review inserts the focused Narrate child at117 and moves its residual parent to124. Five items now have full specifications; the rest remain stubs. No delivery date is assigned.

**Existing scope reconciled:** F5 stays with BUG-188 / BAND-ALIGN-1 and BAND-ALIGN-2; R4 removes only Focus's band in a separate follow-up, leaving Flow's fix intact. F15 stays with BUG-187 / FOLIATE-OBSERVER-LEAK-1 and existing log-cap work. EINK-CONTROLS-1 and BOOK-TYPE-SCALE-1 receive new evidence/directions without claiming their held or merged implementations satisfy them. AUTO-ARCHIVE-1 is amended above and loses its prior Full Spec readiness.

Five full specifications below define source-backed changes; the remaining stubs retain explicit investigation/design gates. Rule 6a applies before dispatch. Mode-owned implementations stay isolated, with no sibling-runtime imports or shared mutable stores.

#### GOV-SWEEP-FOLLOWTHROUGH-1 — Finish the approved governance sweep *(In Flight; Stub; first governance deliverable; Seq0; Platform & Maintenance)* <a id="gov-sweep-followthrough-1"></a>

- **What / deliverables:** Apply the approved16-action cleanup against the current baseline; reconcile held-work descriptions through an authorized register actor; individually own deferred findings; deliver preservation and closure evidence. [Scope, acceptance and action matrix](docs/planning/roadmap-reviews/2026-10-26-governance-deliverables.md).
- **State / order:** Discovery and approval complete; sweep implementation stopped on drift with no edits. Governance is first-order; visibility remains the first app repair and keeps its exclusive source window. Preserve all existing statuses/Seq, newer decisions, release gates and the sweep's commit-only boundary. Refresh and reconcile before execution; not dispatch-ready.

#### LIBRARY-COMPLETION-VISIBILITY-1 — Completed reads remain visible in the correct library tab *(In Flight; Full Spec; planning rank 1; Seq116; Library & Content)* <a id="library-completion-visibility-1"></a>

- **What:** Keep every record admitted by the existing tab/type/search filters visible exactly once in list and grid, including position at or beyond wordCount. Preserve the existing Reading Now / Not Started groups; do not silently archive, reset progress or change completion detection.
- **Why:** SMOKE-F14 / BUG-230: the 91/91-word read remains on disk/in the library but neither displayed group accepts it. The same partition also hides already-archived completed records from Archive.
- **Prerequisites:** No hard AUTO-ARCHIVE-1 or APP-TABS-1 dependency. Owner cleared the exclusive implementation/build-and-hold window on2026-10-26: visibility first, APP-TABS integration later; see [admission and handoff](docs/planning/roadmap-reviews/2026-10-26-library-visibility-admission.md). Start from published main containing that decision. Recheck source ownership at kickoff; code-merge/release and package gates remain.
- **Done when:**
  1. `tests/libraryCompletionVisibility.test.tsx` (new, file absent on the source baseline), rendered through the real LibraryView/LibraryContainer: `(lv1)` 91/91 unarchived appears once in All in list and grid, with 91/91 unchanged and no archive/progress callback; `(lv2)` archived 91/91 appears once in Archive and not All; `(lv3)` 91/91 and 92/91 remain reopenable via the existing card callback.
  2. `(lv4)` parameterizes positions missing/0/2/3/90/91/92 and known/unknown wordCount: every admitted doc appears once; `(lv5)` New/Favorites/type/search include/exclude controls remain correct; `(lv6)` live progress 90→91 and archive/unarchive transitions never create a missing or double card. The base must fail lv1/lv2 for missing cards, not a harness exception; incomplete and filter-exclusion controls pass.
  3. `npx vitest run tests/libraryCompletionVisibility.test.tsx tests/folderNoticeBanner.test.tsx tests/useLibrary.test.ts tests/saveLibraryMerge.test.js` exits0. New assertions inspect real `[data-doc-id]` cards, not a copied filter; copy the lawful mock/setup from folderNoticeBanner.test.tsx rather than importing a test file.
  4. `npm test`, `npm run typecheck`, `npm run build` each exit0 locally. The packaged ARM64 route in the verification contract below shows the owned 91-word text after return/reopen and a completed archived fixture in Archive. Record baseline failure and candidate success; original data is unchanged.
- **Effort:** S; default medium; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** [smoke intake](docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md#all-smoke-sources-mapped), F14/R12; 30-library-after-disappearance-172154.json in the smoke evidence directory; LibraryView.tsx on main d8e44864.
- **Path:** dispatch; owner-authorized isolated implementation is In Flight; package/code merge/release remain gated.

##### Implementation detail

- **Edit sites:** `src/components/LibraryView.tsx`, the readingNow/notStarted useMemo at source lines242–278: remove the upper wordCount bound from readingNow; keep its engagement threshold, sort and existing tab/type/search filters. A record below the threshold still routes to notStarted. No Card, runtime, progress-hook, IPC or schema edit is needed.
- **Tests:** New `tests/libraryCompletionVisibility.test.tsx`; real-root mock pattern from `tests/folderNoticeBanner.test.tsx:26–103`. Existing `tests/features.test.js` copies filter logic and is not the decisive test. Fixtures use stable unique IDs and both viewMode values.
- **Constants:** FOLIATE_MIN_ENGAGEMENT_POSITION is3 (`src/constants.ts:172`); retain it. No new constant, migration or persistence field.
- **Branch / baseline:** eb/library-completion-visibility-1 from published main containing the2026-10-26 admission decision; reviewed production source remains b8f2bf95/d8e44864. Integrate no held stack for this fix. Re-grep named symbols at kickoff; changed contracts return to the planner. APP-TABS-1 subsequently integrates the accepted visibility commit on an approved branch without rewriting published history.
- **Staging plan:** exact source/test fence src/components/LibraryView.tsx, tests/libraryCompletionVisibility.test.tsx; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.LIBRARY-COMPLETION-VISIBILITY-1.GovernanceStaging.2026-10-26.md and Timing.LIBRARY-COMPLETION-VISIBILITY-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** Exclusive LibraryView.tsx plus new tests/libraryCompletionVisibility.test.tsx window for this item; APP-TABS-1 waits on that source surface and retains its branch/evidence. Shared-core touches: none; no parallel code run. Forbidden: sibling runtimes, Card/IPC/types/progress edits, production data resets, terminal status/Seq changes and unrelated refactors. Implementation is admitted; merge only after standard package/designated confirmation and an explicit code-merge go. Later APP integration preserves home/tab filters and reruns real home/status grid/list controls.
- **Failure handling:** If a record still disappears after the partition becomes exhaustive, capture admitted IDs versus rendered IDs and stop; do not compensate by changing wordCount/position or auto-archiving. Two bounded repair passes maximum; an unrelated gate failure becomes an issue. Rollback is `git revert` of this item’s implementation commit(s) in reverse order; conflicts stop, never reset user data. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | renderer-fix | bounded | low | 2m (median of 5 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 18m · sum 18m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-090 — current tab and group paths are read directly; the test renders the production component.
- LL-030 — visibility must never create engagement, progress, history or automatic completion writes; LL-165 — prove actual scratch-profile identity and normal-profile hashes before input.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### NARRATE-PAUSED-CLICK-1 — Narrate resumes from the word explicitly selected while paused *(Queued; Full Spec; planning rank 2; Seq117; TTS / Narration Engine)* <a id="narrate-paused-click-1"></a>

- **What:** After a paused explicit word click, Play, Space and direct resume start at that exact word, including word0; preserve ordinary sentence-resume behavior. This fixes only F9; the parent NARRATE-SELECTION-START-1 retains F7/F8 band/viewport diagnosis.
- **Why:** The artifact-only production-runtime probe records pause8→select20→Play requesting8, then cursor9; the existing start-path control requests20 then21. An immediate snapshot still says20 and would falsely pass.
- **Prerequisites:** Wait for NARRATE-SENTENCE-RESUME-1 to integrate in the approved candidate: its held tip is35716c5fa8a494322766bb307b99002ec66e5f79 and its start() exempts explicit clicks from sentence rewind. Base starts from main d8e44864 plus that approved integration; no dependency on stopped CHAPTER-STEP-CFI-1. Freeze and package/owner gates remain.
- **Done when:**
  1. In existing `tests/narrate/narrate.mode.test.ts`, add `(ns1)` pause8→hardSelect20→togglePlay and `(ns2)` direct resume: assert latest narrate-request word20, producer text begins w20, scheduled/next timed cursor20→21 and no old8/9 voiced source after the new start; `(ns3)` click0; `(ns4)` two paused clicks, last wins. Tests fail the base for the actual request/clock mismatch, not just snapshot state.
  2. `(ns5)` hold old prefetch, select20, Play, release old result: old epoch never schedules; `(ns6)` no-selection resume retains the integrated sentence-start policy; `(ns7)` playing click retains existing click cause; `(ns8)` click before engine creation stays paused until Play; `(ns9)` stop/destroy suppresses late work. Existing timing-missing/voice-loading controls remain green.
  3. `npx vitest run tests/narrate/narrate.mode.test.ts tests/narrate/narrate.engine.test.ts tests/narrate/narrate.crossings.test.ts tests/narrate/narrate.trace.test.ts tests/readerModes/narrate.contract.test.ts` exits0; preserve engine timing and fail-closed table validation.
  4. `npm test`, `npm run typecheck`, `npm run build` exit0 locally. On the exact ARM64 package, the owner hears the clicked word first after pause/click/Play; repeat zero/two selections and ordinary resume. Record request word, heard text and timed cursor. F7/F8 are not accepted by these checks.
- **Effort:** S; default medium; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** F9 / BUG-227 in [smoke intake](docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md); narrate-paused-selection-probe-result.json and control-result.json; ModeRuntime.start/pause/resume/togglePlay/hardSelect on d8e44864 and held sentence-resume tip35716c5f.
- **Path:** dispatch; execution remains held, not launched.

##### Implementation detail

- **Edit sites:** `src/reader/modes/narrate/ModeRuntime.ts`, resume() at source314–319: after the alive/engine/not-playing and engine-paused guards, if `this.state.explicitSelectionAnchor != null`, call the existing `this.start({ cause: "play-button" })` and return; otherwise retain engine.resume(). Do not add engine state, a timer, shared types or producer changes.
- **Tests:** Extend only `tests/narrate/narrate.mode.test.ts`, using its open() and fake producer/audio clock. Diagnostic failure/control sources and results are in the smoke run as narrate-paused-selection-*.ts.txt/.json; they are source evidence, not collected tests or heard-audio proof.
- **Constants:** No new constant. `!= null` must honor index0. Preserve main’s NARRATE-START-STACK-1 logging when integrating the older sentence-resume branch.
- **Branch / baseline:** eb/narrate-paused-click-1 from approved main; source pin d8e44864708d40e2a472f3e6436d936e9ee96bfa plus only the explicitly awaited integrated stack. Re-grep every named symbol at the cut; a changed contract returns to the planner, never an improvised edit.
- **Staging plan:** exact source/test fence src/reader/modes/narrate/ModeRuntime.ts, tests/narrate/narrate.mode.test.ts; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.NARRATE-PAUSED-CLICK-1.GovernanceStaging.2026-10-26.md and Timing.NARRATE-PAUSED-CLICK-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** TTS / Narration Engine; source/test fence above. No parallel code run is authorized. Forbidden: sibling runtimes, production queue/settings resets, terminal status/Seq writes, unrelated refactors. Shared-core touches: none. Merge only in the prerequisite/owner-approved order, then recheck downstream specs.
- **Failure handling:** If the integrated base cannot reproduce the wrong request, stop and re-plan rather than weaken the test. If ordinary resume changes, preserve its approved sentence policy and stop. If hardSelect resolves the wrong global word, file that separate mapping failure; never patch with estimated timing. Two repair passes maximum; rollback implementation commits with git revert, stopping on conflicts. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 18m · sum 18m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-072 and LL-108 — assert exact occurrence/text and preserve word0; LL-073 — explicit selection persists until start consumes it.
- LL-031 and LL-109 — old async generation must never schedule after replacement/stop; LL-160 and LL-161 — packaged word checks use Electron numbering and text; LL-165 — actual scratch-profile proof.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### FOCUS-PAUSED-HANDOFF-1 — Focus shows the correct word immediately on entry *(Seq118; Queued / Stub; Reader Engine; proposed P1) <a id="focus-paused-handoff-1"></a>
Switching from Page to paused Focus initially shows the wrong word; Play corrects it. No evidence yet distinguishes stale display from stale position. The handoff word is correct before playback, remains correct after pause, and persists through reopen. Fix within Focus ownership; no sibling-mode imports or shared mutable mode state.
#### PAGE-ENTRY-KEYS-1 — Page receives section navigation keys before word wrapping completes *(Queued; Full Spec; planning rank 3; Seq119; Reader Engine)* <a id="page-entry-keys-1"></a>

- **What:** Install Page-owned native section key forwarding before asynchronous wrapping yields, with one listener per document and teardown cleanup. This repairs the proven forwarding gap; input before a paginator exists remains unchanged.
- **Why:** F3 / BUG-225: first PageDown failed until mouse Next. Page onSectionLoad awaits wrapWordsInSpans before installing its key forwarder, while mouse Next already reaches the parent handler. The gap is proven in source; the owner-session causal match still needs the exact control.
- **Prerequisites:** Wait for an approved integration window and serialize with held Page view/save/key edits. Preserve READER-ARROW-GUARD-1 (held51202c1c), PAGE-HELD-TURN-FAIL-1, PAGE-SAVE-RESTAMP-3, JUMP-LANDING-SAVE-1 and RESTAMP-RERUN-RACE-1 on the final cut. Re-read symbols/tests; these related stacks are not silently overwritten.
- **Done when:**
  1. Extend real-FoliateView `tests/readerModes/pagePositionSave.test.tsx`: `(ek1)` load60 block groups, hold first-wrap yield, send native section PageDown before release/mouse input and assert paginator.next once immediately; after canonical stamping, assert the landed text/CFI saved once. `(ek2)` PageUp similarly calls prev once. The base fails for absent forwarding; the existing `(u)` mouse-next control passes.
  2. `(ek3)` one physical key after wrapping gives one turn; `(ek4)` repeated load of the same document does not double forward; `(ek5)` retained section document after unmount forwards nothing to the parent. Retain modifier/repeat, held-turn persistence and stale-load controls; do not add replay-all-key behavior.
  3. `npx vitest run tests/readerModes/pagePositionSave.test.tsx tests/readerModes/foliateViewTeardown.test.tsx tests/readerModeBoundaries.test.ts tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts` exits0.
  4. `npm test`, `npm run typecheck`, `npm run build` exit0 locally. Exact-package owner check uses section focus, then PageDown/Left/Right before mouse navigation; compare real paginator/CFI changes during early wrapping and after settling. Record any residual pre-renderer no-op separately.
- **Effort:** S; default medium; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** F3 / BUG-225; [assessment](docs/planning/roadmap-reviews/2026-10-26-assessment.md#risk-and-planning-order); current Page onSectionLoad, wrapping and parent key handlers on d8e44864; held arrow guard51202c1c.
- **Path:** dispatch; execution remains held, not launched.

##### Implementation detail

- **Edit sites:** `src/reader/modes/page/FoliateView.tsx`: onSectionLoad at638–790 installs its section key forwarder synchronously before await wrapWordsInSpans at664. Keep existing forwarded fields, including repeat. Use a Page-effect-local per-document handler map and the named forwardSectionKeyDown registration before the await; dedupe repeated loads, guard canceled loads and remove all registered handlers in both effect cleanup exits. In docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json, change only the Page doc:keydown privateCopyMap copy.anchor from its anonymous registration to doc.addEventListener("keydown", forwardSectionKeyDown);. Preserve every other row and the historical ownership.json census.
- **Tests:** Extend `tests/readerModes/pagePositionSave.test.tsx`; retain its `(u) a turn while the section's first wrap is still running is held too (review W1)` assertions. Its60-paragraph fixture exceeds WRAP_BATCH_SIZE50 and provides a deterministic yield; add a deferred Promise if needed rather than an arbitrary sleep.
- **Constants:** WRAP_BATCH_SIZE is50 block groups (`page/helpers/foliateWordWrapping.ts:11,143–144`), not words. Parent page handler at1167–1189 returns before renderer existence; that policy stays unchanged.
- **Branch / baseline:** eb/page-entry-keys-1 from approved main; source pin d8e44864708d40e2a472f3e6436d936e9ee96bfa plus only the explicitly awaited integrated stack. Re-grep every named symbol at the cut; a changed contract returns to the planner, never an improvised edit.
- **Staging plan:** exact source/test/ownership-map fence src/reader/modes/page/FoliateView.tsx, tests/readerModes/pagePositionSave.test.tsx, docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.PAGE-ENTRY-KEYS-1.GovernanceStaging.2026-10-26.md and Timing.PAGE-ENTRY-KEYS-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** Reader Engine; source/test fence above. No parallel code run is authorized. Forbidden: sibling runtimes, production queue/settings resets, terminal status/Seq writes, unrelated refactors. Shared-core touches: none. Merge only in the prerequisite/owner-approved order, then recheck downstream specs.
- **Failure handling:** If the early-wrap test is not red on the integrated base for missing forwarding, stop for diagnosis; do not count a timer failure as proof. If modifier/persistence controls regress, stop and preserve held work. Two repair passes maximum; revert only this item’s commits on rollback, never a sibling runtime or user file. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | high | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | renderer-fix | bounded | medium | 2m (median of 5 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 18m · sum 18m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-031 — canceled/old loads cannot reattach; LL-080 — preserve input-target guards and native event semantics.
- LL-160 and LL-161 — saved word acceptance checks text under Electron numbering; LL-165 — fresh package profile identity; standing rules43/54/55 require a red forwarder control, actual committing turn and reliable detector.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### FOLDER-SWITCH-CONTENT-1 — Folder switching shows the correct books promptly *(Seq120; In Flight / Stub; Library & Content; proposed P1) <a id="folder-switch-content-1"></a>
The header follows selection, but old-folder cards remain during a long cancellation/scan gap. Readings records began arriving after about 93 seconds; this is eventual loading, not permanent failure. Measure loading and cancellation separately on small and large collections; prevent stale cards being presented as the new folder's books, keep the UI responsive, and preserve existing records/progress. No local import cap or subfolder picker is authorized.
#### PROFILE-QUEUE-ISOLATION-1 — Explain the normal-profile sync-queue change during isolated QA *(Seq121; In Flight / Stub; Platform & Maintenance; proposed P1) <a id="profile-queue-isolation-1"></a>
Normal library.json/settings.json hashes stayed unchanged, but sync-queue.json changed. Which process wrote it and whether isolation was breached are unresolved. Attribute the writer using bounded evidence, classify intended versus unintended writes, and fix a proven isolation defect if found. Preserve the queue and user data; do not call this data loss or attribute it to the scratch app without proof.
#### BOOK-TYPE-SCALE-2 — Diagnose residual uneven book typography on the release build *(Seq122; Queued / Stub; Reader Engine; proposed P2) <a id="book-type-scale-2"></a>
Mixed small caps/letter sizes and wide justified spacing remain on the exact release that includes BOOK-TYPE-SCALE-1. Publisher typography versus app overrides is unresolved. Compare the source EPUB and app styles, identify the responsible rule, then specify the smallest correction to the intended heading/body scale. Retain semantic emphasis and check all modes independently.
#### FOCUS-WORD-ONLY-1 — Focus retains its word cursor without a horizontal dimming band *(Queued; Full Spec; planning rank 4; Seq123; Reader Engine)* <a id="focus-word-only-1"></a>

- **What:** Remove only Focus’s visual reading-zone mask and Focus band-only controls, if any. Keep its word cursor, paused/playing selection, RSVP, speed/font settings and existing private scroll/follow geometry.
- **Why:** Owner R4 removes Focus’s horizontal highlight; F5 still requires Flow alignment. Held BAND-ALIGN-2 preserves Focus’s band and adds controls, so this follow-up must reconcile that stack explicitly.
- **Prerequisites:** Wait for BAND-ALIGN-2’s approved integration (held85e327775d1e09701b2bab52cd4e42a9698ae048), exclusive Focus/C-bottom-bar ownership and the release integration window. FOCUS-PAUSED-HANDOFF-1 remains a distinct diagnosis and is not certified fixed by mask removal.
- **Done when:**
  1. New `tests/readerModes/focusWordOnly.test.tsx`: `(fw1)` load real Focus CSS and assert both mask-image properties resolve none paused/playing; `(fw2)` selected span retains the existing cursor class and canonical/CFI state; `(fw3)` real bottom bar has neither Band position nor Band lines in Focus; `(fw4)` Flow retains both working groups and its mask; Narrate’s mask/Page remain unchanged. Base controls must demonstrate Focus mask/groups present.
  2. `npx vitest run tests/readerModes/focusWordOnly.test.tsx tests/readerModes/focus.contract.test.ts tests/readerModes/focus.behavior.test.tsx tests/readerModeIsolation.test.ts tests/readerModeOwnership.test.ts` exits0. A CSS-source regex is not computed-style/live proof; assert the final styles in the packaged renderer too.
  3. `npm test`, `npm run typecheck`, `npm run build` exit0 locally. Exact-package owner check selects a known Focus word, plays and pauses: underline remains, horizontal dimming is absent; Flow/Narrate still behave under their own contracts.
  4. Package/fence checks show only the two production files below plus this item’s tests/docs. No private zone/inset observer, follow offset, progress or sibling-mode helper is deleted just because it uses the historical word flow in its name.
- **Effort:** S; default medium; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** SMOKE-R4, focus-band-offset.png and focus-paused-cursor-band-offset.png; [approved plan](docs/planning/roadmap-reviews/2026-10-26-plan.md#macro-steps-in-the-agreed-priority-order); Focus mode.css on d8e44864 and BAND-ALIGN-2 held85e32777.
- **Path:** dispatch; execution remains held, not launched.

##### Implementation detail

- **Edit sites:** `src/reader/modes/focus/mode.css:34–56` on main sets the Focus view’s mask-image and -webkit-mask-image gradients; replace those visual masks with explicit none. On the integrated BAND-ALIGN-2 stack, `src/components/ReaderBottomBar.tsx` guards rbb-flow-zone-controls with focus||flow: narrow only those band groups to Flow.
- **Tests:** Create `tests/readerModes/focusWordOnly.test.tsx`; use real stylesheet/provider and real bottom bar, with a controlled Focus document based on readerModes/foliateViewTeardown.test.tsx. Capture computed masks in a real packaged renderer if jsdom lacks CSS support; do not mock the property under assertion.
- **Constants:** No new state/constant/schema. Retain Focus-owned layout/follow values and all shared-core types; no change to FlowScrollEngine or sibling mode copies.
- **Branch / baseline:** eb/focus-word-only-1 from approved main; source pin d8e44864708d40e2a472f3e6436d936e9ee96bfa plus only the explicitly awaited integrated stack. Re-grep every named symbol at the cut; a changed contract returns to the planner, never an improvised edit.
- **Staging plan:** exact source/test fence src/reader/modes/focus/mode.css, src/components/ReaderBottomBar.tsx, tests/readerModes/focusWordOnly.test.tsx; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.FOCUS-WORD-ONLY-1.GovernanceStaging.2026-10-26.md and Timing.FOCUS-WORD-ONLY-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** Reader Engine; source/test fence above. No parallel code run is authorized. Forbidden: sibling runtimes, production queue/settings resets, terminal status/Seq writes, unrelated refactors. Shared-core touches: none. Merge only in the prerequisite/owner-approved order, then recheck downstream specs.
- **Failure handling:** If the held stack removes/renames the mask or controls, re-read before editing and stop for a fence amendment if needed. If cursor/geometry changes, revert the visual-only change and investigate separately. Two repair passes maximum; rollback only this item’s commits with git revert. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-090 — inspect the real Focus mask and held bottom-bar controls; no assumed common mode root cause.
- LL-120 and LL-165 — keep mode-owned visual state and prove the actual package profile; standing rules37/43/53/55 require isolated ownership, red visual controls and exact-package verification.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### NARRATE-SELECTION-START-1 — Diagnose Narrate's paused band and start viewport *(Seq124; Queued / Stub; TTS / Narration Engine; P1 residual F7/F8)* <a id="narrate-selection-start-1"></a>
F9 moves to NARRATE-PAUSED-CLICK-1 at117. This parent keeps the separate paused-band mismatch and Play viewport jump. Owner policy approved 2026-10-26: keep the current viewport when the selected word is already visible, align its paused highlight, and follow only when it leaves the reading area or on explicit Jump back. Before a visual fix, record actual scroll writers/geometry with a known-failing control; no causal attribution to the click fix or other modes.

#### EINK-DEVICE-SETTINGS-1 — Remember E-ink preferences separately on each device *(Seq125; Queued / Stub; Platform & Maintenance; proposed P2) <a id="eink-device-settings-1"></a>
An unconfigured device should start in regular mode; an explicitly configured E-ink device remembers E-ink. The tested upgrade inherited einkMode=true; source defaults are already false. Classify device-local settings and exclude them from cross-device upload/apply. Clean-profile default is off; explicit on survives local restarts; computer/phone settings do not override the E-ink device. Preserve migration and existing choices.
#### EINK-APPEARANCE-2 — E-ink uses white-dominant grayscale and contrast-only appearance controls *(Seq126; Queued / Stub; UX polish; proposed P2) <a id="eink-appearance-2"></a>
Extend the held EINK-CONTROLS-1 direction with the owner's new grayscale/white appearance and contrast-only controls. E-ink surfaces are grayscale with white dominant; no E-ink theme chooser; contrast is the sole E-ink appearance option. Ordinary display themes remain available outside E-ink.
#### EINK-MODE-AVAILABILITY-1 — Focus is unavailable while E-ink is enabled *(Seq127; Queued / Stub; UX polish; proposed P2) <a id="eink-mode-availability-1"></a>
Hide Focus in E-ink, including entry via shortcuts and remembered-mode restore. Enabling E-ink while Focus is active needs a specified fallback. No route enters Focus while E-ink is enabled; decide and document the active-Focus transition before implementation. Regular displays retain Focus.
#### EINK-FLOW-VIEWPORT-1 — Flow advances a screen at a time on E-ink *(Seq128; Queued / Stub; Reader Engine; proposed P2) <a id="eink-flow-viewport-1"></a>
In E-ink, keep Flow's viewport stationary until its reading position reaches the bottom, then advance. Compare the held BAND-ALIGN-2 Flow stepping before prescribing residual work. Flow-owned implementation: correct word tracking throughout a stationary viewport, one advance at the bottom boundary, defined browse/clamp/chapter behavior, and regular-mode behavior unchanged. No Narrate-runtime dependency.
#### EINK-NARRATE-VIEWPORT-1 — Narrate advances a screen at a time on E-ink *(Seq129; Queued / Stub; TTS / Narration Engine; proposed P2) <a id="eink-narrate-viewport-1"></a>
In E-ink, keep Narrate's viewport stationary while the heard word advances, then move at the bottom boundary. Narrate-owned implementation retains exact audio-word timing, advances once per screen boundary, defines manual browsing and chapters, and leaves regular-mode behavior unchanged. Mirror the contract, not Flow's mutable runtime.
#### EINK-VIEW-REFRESH-1 — Refresh E-ink on view changes instead of elapsed time *(Seq130; Queued / Stub; UX polish; proposed P2) <a id="eink-view-refresh-1"></a>
Flashing is the existing E-ink ghosting overlay, confirmed absent when E-ink is off. No periodic timer defect was established. Owner wants view-change-driven refreshes. Page/screen advances, menu changes and book entry/exit trigger the declared refresh policy; idle time and per-word updates do not. Preserve finite flash cleanup/duration and avoid duplicate flashes for one transition.
#### FOLDER-RETRY-FEEDBACK-1 — Retry visibly reports checking and an unavailable folder *(Seq131; Queued / Stub; UX polish; proposed P2) <a id="folder-retry-feedback-1"></a>
The single Retry works and logs one null root result, but its unchanged UI leaves the reader unsure anything happened. FOLDER-NOTICE-2 is dissolved and is not reopened. Show an accessible checking state and a clear unavailable result after failure; successful retry clears the banner. Preserve single-click/single-request behavior and no repeated toast loop.
#### LIBRARY-UI-TEXT-SIZE-1 — Make library interface text comfortably readable *(Seq132; Queued / Stub; UX polish; proposed P2) <a id="library-ui-text-size-1"></a>
The owner requests larger library UI text; the warning banner and Retry screenshot make the problem especially clear. This is distinct from in-book typography. Specify a larger library UI type scale covering metadata, tabs, controls and notices; warning/Retry text is readable without clipping at tested display scaling. Do not silently restrict this to the banner.
#### DROPDOWN-DISMISS-1 — Dropdowns close on outside click and preserve the selection *(Seq133; Queued / Stub; UX polish; proposed P2) <a id="dropdown-dismiss-1"></a>
The Folder dropdown remains open after outside clicks. The owner requests consistent dismissal across all dropdowns; only Folder is observed failing. Inventory dropdowns, dismiss on outside click without selecting/changing a value, and preserve normal inside clicks and selection. Verify each supported menu rather than assume all are currently broken.
#### POSITION-PROMPT-COPY-1 — Keep Previous Position precedes Move Position in the save prompt *(Queued; Full Spec; planning rank 5; Seq134; UX polish)* <a id="position-prompt-copy-1"></a>

- **What:** Show first Keep Previous Position (pg{furthestPage}), then Move Position (pg{currentPage}); preserve existing handler meanings, primary focus, Enter/Escape and page calculations. This is copy/order only.
- **Why:** Owner R3 says Keep is the previous protected position and should be first; Save becomes Move. This does not redefine current/furthest anchors or implement the separately approved approximate page-counter feature.
- **Prerequisites:** KEEP-FURTHEST-FIX-1 is merged but In Flight until its existing close-out gate; encode that wait and the approved integration window. The prompt edit is independent of FURTHEST-PERSIST-1’s schema work; preserve future compatibility and re-grep at the cut.
- **Done when:**
  1. New `tests/backtrackPrompt.test.tsx`: `(bp1)` currentPage40/furthestPage53 renders exact buttons in order Keep Previous Position (pg53), Move Position (pg40); `(bp2)` first/second invokes only keep/save respectively once; `(bp3)` first autofocus is retained; `(bp4)` Enter/Escape invokes Keep once without propagation; `(bp5)` unmount removes the capture listener.
  2. `npx vitest run tests/backtrackPrompt.test.tsx tests/keepFurthest.test.tsx tests/useProgressTracker.test.ts` exits0. Preserve keepFurthest.test.tsx unchanged: Keep saves2673 with its CFI, Save saves displayed416 with its CFI; no handler swap or progress arithmetic change.
  3. `npm test`, `npm run typecheck`, `npm run build` exit0 locally. Exact-package owner route backtracks, checks labels/order and keyboard focus at normal/narrow widths, then separately exercises both choices and reopens at the corresponding saved word/CFI.
  4. The production diff is only BacktrackPrompt.tsx; no ReaderContainer, useProgressTracker, runtime, shared type, CSS or backend change is needed. Record any existing label overflow separately rather than widen the fence silently.
- **Effort:** XS; default low; positive-control task1 high for Narrate/Page, UI-only fix task2 low for visibility/Focus/copy. Durations are task-row estimates, not effort levels.
- **Owners:** planner; local implementation agent; spec/quality reviewers; repository operator; designated package verifier for standing-rule53.
- **Source:** SMOKE-R3,09-page-save-options.png; [approved smoke intake](docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md); BacktrackPrompt.tsx, useProgressTracker callbacks and unchanged tests/keepFurthest.test.tsx on d8e44864.
- **Path:** dispatch; execution remains held, not launched.

##### Implementation detail

- **Edit sites:** `src/components/BacktrackPrompt.tsx:32–48`: move the existing Keep button first, retain onKeepFurthest, primary class and autoFocus; rename it Keep Previous Position (pg{furthestPage}). Move existing Save second, retain onSaveAtCurrent/secondary class; rename Move Position (pg{currentPage}).
- **Tests:** Create `tests/backtrackPrompt.test.tsx` with real component/createRoot/act; inspect DOM button order and actual callback/focus behavior. Read the existing key listener at16–24 and reader wiring at ReaderContainer827–834, but do not edit either contract.
- **Constants:** No new constant. Existing prompt pages approximate250 words through useProgressTracker; the separate page-counter choice does not alter these calculations in this item.
- **Branch / baseline:** eb/position-prompt-copy-1 from approved main; source pin d8e44864708d40e2a472f3e6436d936e9ee96bfa plus only the explicitly awaited integrated stack. Re-grep every named symbol at the cut; a changed contract returns to the planner, never an improvised edit.
- **Staging plan:** exact source/test fence src/components/BacktrackPrompt.tsx, tests/backtrackPrompt.test.tsx; plus only this item’s own BUG_REPORT subcase, docs/governance/close-outs/Memo.POSITION-PROMPT-COPY-1.GovernanceStaging.2026-10-26.md and Timing.POSITION-PROMPT-COPY-1.jsonl. Preserve unrelated work; inspect cached paths before commit; commit/push only as policy and the merge hold permit.
- **Lane ownership / integration:** UX polish; source/test fence above. No parallel code run is authorized. Forbidden: sibling runtimes, production queue/settings resets, terminal status/Seq writes, unrelated refactors. Shared-core touches: none. Merge only in the prerequisite/owner-approved order, then recheck downstream specs.
- **Failure handling:** If the real integrated prompt has different callbacks, stop and re-anchor rather than relabel by intuition. If existing anchor tests regress, stop without updating their expectations. Two repair passes maximum; rollback this item’s commits via git revert, never restore an old library. Verification/package failure keeps the item In Flight and the release held; only closeout records terminal state.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Production-path regression controls distinguish the defect from the accepted behavior | repeat | positive-control | bounded | low | 4m (median of 20 runs) | — | — |
| 2 | The scoped reader/library behavior satisfies its approved contract | repeat | ui-fix | bounded | low | 5m (median of 3 runs) | — | — |
| 3 | Local gates, independent review and exact-package evidence are complete | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |
**Total:** chain 21m · sum 21m; 3 of 3 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate)

##### Lessons applied

- LL-073 — retain protected anchors and consume them only through existing actions; LL-090 — source verified callback association before changing wording.
- LL-165 — exact scratch-profile identity in package checks; standing rules43/48/53/54 require red order/callback tests, type/build gates and a real committing user choice.
- Standing rules36/43/47/48/50/51/52/53/54/55 apply: fresh sites, red controls, local type/build gates, no moved waiver/status downgrade, copied evidence uncollected, real committing triggers and package verification. All115 live lessons were reviewed; non-applicable ones are listed by ID/theme in this review’s lessons-applied record.

#### READER-PAGE-COUNTER-1 — Display the reading page near the remaining time *(Seq135; Queued / Stub; UX polish; proposed P3) <a id="reader-page-counter-1"></a>
Add a page display near reading time. This is distinct from PAGE-PAGES-READ-1's goal counter. Specify pagination semantics for reflowable books, PDFs and each mode; display the current page and an honest total where computable, with coherent resize/font-change behavior.
#### LIBRARY-FOOTER-REMOVE-1 — Remove the unused settings controls from the library footer *(Seq136; Queued / Stub; UX polish; proposed P3) <a id="library-footer-remove-1"></a>
Remove the footer speed/WPM slider, Start at login checkbox, Backup and Restore buttons shown by the owner. Remove those UI controls only. Preserve backup/restore capability, user data and login support elsewhere; decide placement only if needed. Do not conflate with completed LIBRARY-SETTINGS-FIX-1.
#### TRAY-ICON-SIZE-1 — Make the Windows tray icon legible at normal scaling *(Seq137; Queued / Stub; Platform & Maintenance; proposed P3) <a id="tray-icon-size-1"></a>
Existing BUG-203: tiny Windows tray icon recurs in this smoke. PACKAGING-FIX-1 shipped assets but did not fix the visual sizing. Inspect actual icon padding and Windows raster size/DPI handling, then verify legible tray rendering at normal and scaled displays with menu behavior intact.
#### LIBRARY-CONTENT-DEDUP-1 — Make identical books at different source paths understandable *(Seq138; Queued / Stub; Library & Content; proposed P3) <a id="library-content-dedup-1"></a>
Duplicate-looking cards came from different Books and Books\\Books paths; two sampled pairs had identical SHA256. No repeated exact filepath was found. Specify non-destructive content-identity detection/presentation, distinguish editions, and preserve progress/favorites. No source deletion, auto-merge or automatic hiding is authorized by this report.
#### SMOKE8-COVERAGE-RECHECK-1 — Close the remaining smoke coverage gaps on one candidate build *(Seq139; Queued / Stub; Platform & Maintenance; proposed P1) <a id="smoke8-coverage-recheck-1"></a>
The smoke is RED. Check31 visual deadlines/immediate quit, check32 active-scan overlap, check33 exact scenario, check35 disconnected quit, and earlier input/handoff gaps remain unverified. After candidate fixes and an approved release integration window, run the missing exact scenarios with owner-observed UI/audio where required; keep one build identity, per-check timing and before/after evidence. No partial is promoted to PASS and no release hold is lifted by backlog registration.

**Known gaps:** check 31 visual timing and immediate-quit sequence, check 32 active-scan overlap, check 33 exact scenario, check 35 disconnected quit, and earlier keyboard/handoff partials remain open. SMOKE8-COVERAGE-RECHECK-1 owns missing evidence; successful later checks do not close failed or partial ones.

**Evidence limits:** sampled duplicate-looking books had identical contents at distinct paths, not repeated exact paths; E-ink/on was inherited while defaults are off; the flash overlay is explained but a periodic timer fault is not established; the normal-profile sync queue changed without an attributed writer. No source deletion, automatic book merge, preference reset, data-loss claim or inferred shared root cause is authorized.

## Deferred Lanes

- **Long-form audio export** — KOKORO-EXPORT-1 dissolved 2026-10-11; returns as a new item after the Narrate rebuild.
- **Normalizer alignment map** — `normalizedToOriginalMap` transform contract. Revisit when word-position rendering needs original-text cross-reference.
- **Registry-driven strategy dispatch** — obsolete: the strategy registry is removed with Narrate (NARRATE-REMOVE-1).
- **Playback-buffered-seconds backpressure** — `scheduler.getBufferedSeconds()` throttle. Revisit if TTS-EVAL-3 soak run reveals buffer pressure.
- **Track B** — Chrome Extension (EXT-ENR-C and beyond): now BROWSER-EXT-FINALIZE-1 (Stage 9)
- **Track C** — Android APK (APK-0 through APK-4): now ANDROID-APP-1 (Stage 9)
- **Phase 7** — Cloud Sync: absorbed by BLURBY-SERVER-1 (2026-10-23-3); book sources remain CLOUD-CONNECTORS-1 (Stage 9)
- **Phase 8** — RSS/News: now RSS-AGGREGATOR-1 and APP-TABS-1's Newsroom (Stage 9)
- **Idea Themes A-K** — See `docs/governance/IDEAS.md`

See `docs/planning/.Archive/ROADMAP_deferred_2026-05-15.md` for full deferred specs.

---

## Notes

- TTS Architecture Complete finish line reached 2026-05-17. All decisions documented in `docs/governance/TTS_ARCHITECTURE_DECISIONS.md`.
- Desktop v2.0 shipped.
- New active stage established: Reader Runtime Solidification before Quality Gate Activation and UX polish (2026-05-22).
- SSML as internal format explicitly **rejected** per research consensus — structured text + normalizer trace is cleaner than SSML payload. (2026-05-17)

### Non-Blocking Follow-Ups (from 2026-07-02 roadmap-review)
- **Ads on Free (owner, 2026-10-23; from BLURBY-SERVER-1).** Deferred off the desktop: AdSense does not allow ads in software applications, and AdMob has no desktop SDK. Revisit with the phone apps (AdMob, in the library and between books only, never on the reading page or in Narrate) or a future web reader.
- **Unlimited trial for new users (owner, 2026-10-23: "Add to future roadmap, holding").** A time-limited Unlimited plan for new accounts. At expiry, it asks the user to remove books down to their plan's limit, or upgrade. After BLURBY-SERVER-1 Phase 3.
- **Lessons-source split (governance debt).** The registry resolves lessons to docs/governance/LESSONS_LEARNED.md; newer SRL evidence also lives in the registered close-outs directory. The 2026-09-23 review appended a cross-reference/correction note, disambiguated SRL-090 in the active roadmap, and preserved the pre-existing dirty retrospective. Physical consolidation remains a separate governance task.
- **Missing A5 close-out.** `NARRATE-A5-RATE-RESEED-1` merged (`145c385`) without a formal `CloseOut.*.md`; interim evidence is `docs/studies/investigations/NARRATE-A5-RATE-RESEED-liveqa-gate-report.md`. Author one via `/pointer-closeout` if a formal record is wanted.
- **Historical COLLAPSE scope.** The former 14-versus-6 path-count wording is preserved only in the archive. The current title describes the remaining behavior; re-specification follows mode separation.

<!-- Frontmatter:
loe_unit: t-shirt
last_review: 2026-10-14
review_status: complete; buffer at 4 after QUIT-FLUSH-1 completed (2026-10-14), below the target of 5
finish_line: "Narration rebuilt"
roadmap_doc: ROADMAP.md
work_register: notion:database/3f87c96cc31e800580cfe019c89a56ca
buffer_target: 5
buffer_actual_full_specs: 4
buffer_dispatch_readiness: 4 dispatch-ready (READER-VISUAL-DIAG-1, PACKAGING-FIX-1, UX-POLISH-2, LARGE-FOLDER-SYNC-1 technical half), below the target of 5; NARRATE-REBUILD-1 (epic, P6 at G2) and UX-POLISH-1 (merged, close-out after the G2 checks) are in flight and excluded
buffer_actual_stubs: 6 (FOLDER-UNREACHABLE-GUARD-1, PDF-IMPORT-DIAG-1, OVERLAY-THEME-SWEEP-1, EINK-CONTROLS-1, KF2-WAIVER-RETIRE-1, NARRATE-YEARS-1 [blocked on the epic])
ultrathink_artifact: docs/studies/investigations/NARRATE-DUAL-SOURCE-ULTRATHINK-2026-05-29.md
-->


#### FOLIATE-DISPLAY-LIFETIME-1 — Safe loading and retired-view ownership *(In Flight; Full Spec; Seq68; Reader Engine)* <a id="foliate-display-lifetime-1"></a>

Goal: repair active loading/body-null layout and obsolete asynchronous display publication without crossing reading-mode boundaries. Brain approved exact immutable v3 design/scope on2026-10-26; independent reviewer PASS on the same hash. Existing package remains WITHHOLD. Execution only after recorded provider/owner/publication/preflight conditions.
Baseline/branch: combined4c9724e60cd6bbab79ad78b0f11b25f78ad31ab7 with main85e6e5aaedccb0501c529dbc9f739e50a0689fd7; eb/foliate-display-lifetime-1. Named execution owner from2026-10-27: local chat01a17dcd-3e4d-7161-bb2f-d8c273de5afb (FOLIATE-DISPLAY-LIFETIME-1 — local repair), superseding the held cloud owner. See docs/planning/roadmap-reviews/2026-10-27-local-resume.md; actual local identity is recorded before source edits. Parent owns provider and planning integration.
WHERE/read order: AGENTS.md; .codex/agents/zeus.toml; docs/governance/LESSONS_LEARNED.md; this full spec; docs/studies/investigations/FOLIATE-STYLE-NULL.2026-10-26.md; patches/foliate-js+1.0.1.patch; installed foliate-js paginator.js/view.js at named sites.
Lane Ownership: Reader Engine, dependency patch plus two tests only. Shared-Core Touches: none. Forbidden During Parallel Run: sibling runtimes/shared core, app schema/settings/build/package/lock, owner data and unrelated changes. Merge Order: retained observer+visibility baseline -> this held repair -> later visibility/package confirmation -> separately authorized integration. No main merge/release/terminal completion.
Immutable technical contract SHA2565407201dae92574bb0655e7b9ec2f89334d4d1967edfc8532c81e277b15ded1d and independent review e00d0bae3281b0ecd7cf048789dedddbcb669d8d38365197a852665a2e87b823 are preserved in [cloud handoff](docs/planning/cloud-handoff/2026-10-26/README.md). Original proposal wording below is retained; dated Brain admission in that packet supersedes its prior withholding text without changing the technical contract.
##### Exact admitted-fence request
Propose ONLY `patches/foliate-js+1.0.1.patch` (paginator.js changes through normal patch-package), `tests/foliateViewReadiness.test.js`, `tests/foliateDisplayLifetime.test.js`, plus item-owned memo/timing/receipt. Retain both existing observer disconnect calls. No sibling runtime/shared core/ReaderContainer/types/view.js/teardown-order/helper algorithms/settings/defaults/manifest/lock/build/dependency change, no blanket null guard, filter, catch-all, timer/retry or navigation redesign. Unexpected required scope returns to Brain.
Installed-source line anchors refer to held `node_modules/foliate-js/paginator.js`: fields near417–441; View.load243–274/render277–282/destroy410–413; #createView660–673; #beforeRender697–772; #display1007–1036; #goTo/onLoad1041–1056; setStyles1136–1154; destroy1158–1164; anchor/scroll923–979. Existing `view.js:284–294` close calls renderer.destroy/remove; read only. Packaged native resolve is line1 column5135; #display postawait/postassignment are line97 columns11925/12046 (one-based), not line1. Actual breakpoint receipts govern.
##### Concrete ownership model
Use TWO separate authorities, not one obsolete display predicate everywhere:
- **Display-operation currentness `opCurrent(op)`**: paginator not closed and captured operation generation equals current generation. Capture/issue generation synchronously BEFORE first #display await; every newer display request invalidates older publication/scroll/focus operations. Destroy invalidates generation and closes lifetime BEFORE cleanup. A destroyed Paginator is not revived; normal app replacement creates another. Do not add reopen behavior.
- **Retained-View liveness `viewLive(record, doc?)`**: paginator not closed, this exact record is retained, #view equals captured View, View not disposed, and when a Document is supplied it equals both captured/current iframe Document. This is independent of the generation that originally loaded the View. Replacement/destroy invalidates the record. Src-less anchor navigation does NOT invalidate retained View's native load/font/resize/onExpand liveness.
Keep one retained View record containing View, section index, native-load promise/outcome, disposal state and overlay-publication state. No global/shared mode state. Operation record references the intended retained record. Successful native load outcome stays successful permanently; display operation can independently become stale.
###### 1. First await and same-View pending anchor
At #display entry issue op; do NOT cancel/dispose a retained loading View merely because op generation changes—the unresolved request may be src-less. After `await promise`, require opCurrent BEFORE #index/focus/#createView. For src-bearing result, create a new record: invalidate/dispose prior record exactly once, install new View, start its actual load. Only this real replacement invalidates old View liveness. If the section promise resolves after close/replacement by newer op, return inertly before any publication.
For src-less result, capture still-retained record and **adopt/wait for its existing native-load promise**. Do not cancel it, create another View, scroll body-null content or assume locking makes this impossible. If close/replacement occurs while waiting, opCurrent and viewLive both fail and this op returns inertly. If load succeeds and this op still owns publication, it proceeds with that same ready View. Old original display may now be stale, but retained load callbacks remain legitimate because viewLive is true. No stale original display may publish overlay or anchor afterward.
After adoption, use the retained record's real section index; do not publish an arbitrary src-less result's different index. Existing normal same-index anchor behavior is preserved. A mismatch outside that contract returns to Brain rather than silently designing cross-section navigation.
###### 2. Native load and exact cancellation semantics
Extend View.load internally with retained-View liveness/cancellation support; keep real native iframe callback. Store its pending listener/settler once. Check liveness at native callback entry, after afterLoad, after beforeRender, after actual render/expand and before observing/resolve. Invalidation removes that pending listener and resolves **still-pending** load once with an explicit internal canceled outcome. Never reject valid cancellation as an unhandled error or catch genuine invalid current document failures as success.
If native load already fulfilled when close happens before display resumes (the exact proved boundary), its fulfillment remains unchanged. opCurrent/viewLive reject the stale DISPLAY continuation separately; display settles inertly without claiming retroactive load cancellation. Clear only the pending cancel record on successful settlement; keep retained View lifetime for future font/resize/expand work. Font callback checks retained record/Document, not original display generation.
View.render retains absent-layout/Document no-op and additionally defers only actual `loading && !body`; complete/interactive body-null still throws via original algorithms. Native beforeRender computes current layout after pending resize/flow; never replay cached obsolete dimensions. Destroy samples own body once, unobserves only an actual present Element, ALWAYS disconnects existing observer, cancels pending load once, and is idempotent. This is precise observer-target validity, not a blanket layout/helper null guard.
###### 3. Load callbacks, #createView/onExpand and current layout
afterLoad/style injection/styleMap/onLoad effects require viewLive(record,doc) before each effect and after reentrant callback/event. beforeRender checks same retained record immediately before header/background/direction/layout updates and returns actual current layout; recheck afterward before continuing load. These are View-lifetime callbacks, so a src-less adopting op does not incorrectly disable them. Old/new record identity prevents replaced callbacks from mutating successor.
Explicitly change #createView's onExpand closure: capture its View record; BEFORE parent #scrollToAnchor effect require viewLive. For valid expansion, capture CURRENT applicable display/scroll generation when starting anchor work, combine it with viewLive, and pass that predicate through async scroll. Do not freeze onExpand to original load's generation. Expanding a live retained View after same-View src-less navigation must still update layout/anchor; close/replacement/newer anchor makes already-started old work inert.
Actual View ResizeObserver/font expand retain live View work; canceled/disposed Views cannot reobserve or invoke parent expand effects. All checks precede effects; a post-render check alone is insufficient.
###### 4. setStyles intended View/Document and deferred callbacks
Name setStyles1136–1154 in patch fence. Preserve public call behavior: update stored #styles as before; capture intended retained View+Document/style nodes for that invocation, rather than later dereferencing whichever #view happens to be current. Existing no-view style-storage behavior remains. Style-node writes and deferred RAF background/font expand require those captured objects still live/current. Normal calls and same-retained-View updates keep working; an anchor-only op generation change must not disable valid font/style work.
For onLoad -> setStyles, pass retained ownership context internally from #display/#goTo callback (without exposing a new user setting/schema or changing external load-event detail). Check context before old-section unload/style/event effects and after reentry. RAF uses captured View.docBackground only while that View+Doc retained; fonts.ready expands captured View only while live. Never finish an old callback through `this.#view` pointing to a successor. Tests cover public and display-owned paths; no global cancel-all RAF/font behavior.
###### 5. Overlay, publication and post-await writes
After successful load/adoption await require opCurrent AND viewLive before create-overlayer, #view write or anchor. Same retained View may be adopted by newer op: overlay publication belongs to current publication op, not necessarily original loader. Use record state/actual View.overlayer to avoid duplicate attachment. Already attached live overlay is retained. If a previous publication op became stale before attach, current adopting op may issue publication for that same ready View; stale closure never attaches. A dispatch record token distinguishes unpublished/publishing/attached ownership without waiting on its own synchronous event.
Attach closure checks publication op and retained View+Document at INVOCATION, including deferred attach. After synchronous create-overlayer dispatch recheck: listener can close/replace/start newer same-View op. No stale #view assignment or anchor follows. No callback may clear successor ownership or dispose it. Preserve real active overlay, text, selection and settlement. Require a reentrant same-View adoption control, not just close/replacement.
###### 6. Anchor, scroll, focus and disposal
Before function-anchor evaluation require opCurrent+viewLive; recheck after evaluation (it can reenter). Thread optional current predicate through this display's scrollToAnchor/#scrollToAnchor/#scrollToRect/#scrollToPage/#scrollTo. Guard #anchor, animation-frame/container writes, bounds and afterScroll/relocate, and focus after await. Default behavior for other callers stays intact; onExpand supplies its freshly captured applicable token. No new animation algorithm or global mode navigation policy.
Cancellation disposes only captured obsolete record/View/listener/element, once. If native load is live and same-View op adopts, do NOT dispose it. If newer record owns #view, old cleanup cannot clear/remove/disconnect it or mutate newer index/header/style/anchor. A canceled old record's late callbacks cannot restore anything. Disposed body-null cleanup must not unobserve(null), and repeated destroy must still be harmless. Genuine malformed CURRENT ready documents remain visible errors.
##### Concrete red/green tests (actual installed behavior)
Final detector version runs against original base and candidate, exact node IDs/raw logs; no harness exceptions counted as red. Tests execute actual installed View/helpers/Paginator public navigation+native continuation, not duplicated guard/#display algorithms. Unexported View extraction may expose unchanged source with provenance; do not stub scrolled/columnize into fake returns. Minimal constructor/layout shims disclose limits; actual Chromium package controls prove native continuation independently. Harness impossibility returns to Brain.
- R1: BOTH loading/body-null layouts fail base/defer candidate, same View/iframe/Document native load forwards original layout/styles/positive text; BOTH ready-body and loading-body-present forward; complete/interactive body-null BOTH still throw; absent layout/Document unchanged. Pending resize/flow uses current beforeRender layout.
- L1: delayed first section result after destroy/newer display cannot set#index/create. Active result still works.
- L2: real close/replacement inside afterLoad/onLoad/beforeRender/render prevents all later old callback/style/header/layout/observe effects; active retained load remains valid after src-less generation changes.
- L3: exact close-after-native-resolve/before-display-microtask: native outcome stays fulfilled, old display returns inertly, no resurrection/overlay/anchor/focus. Separate destroy-before-native-load pending case settles canceled exactly once without hanging.
- L4: actual same-Paginator replacement: old publication/cleanup cannot touch newer View/Doc/index/header/styleMap/overlay/anchor/scroll/observer. Paired newer active completion succeeds. Current evidence did not prove successor corruption; this is future acceptance.
- L5: onExpand valid after same-View anchor still scrolls using fresh token; old expand/scroll after close/replacement inert. Public and display-owned setStyles RAF/fonts: active same View updates; replaced/destroyed View cannot change newer background/expand; never dereference newer#view for old task.
- L6: same-View src-less anchor DURING native load adopts/waits without dispose/body-null scroll; original load may succeed, stale original display cannot publish; new op publishes overlay once/anchors correctly. Close/replacement while waiting settles inertly. Cover src-less reentry during overlay dispatch and delayed old attach.
- L7: event/anchor callback reentry, close/replacement during scroll/animation, deferred attach and after-await focus: old mutation blocked; active overlay/anchor/flow/resize/focus behavior unchanged. Old pending work settles; repeat destroy/cancel/body-null cleanup leaves no listener/observer leaks or double-disposal errors.
Instrumented causal controls are not clean-package passes. Deliberately closed0-word root uses specific negative assertions; never label ordinary four-mode route passed. Stop for unlisted required source or changed functional navigation semantics.
##### Bounded execution waves after separate admission
Parent must first complete real provider item/readback, full ROADMAP, owner/fence/branch/current-main admission. All waves target <40 tool uses; split before dispatch, never exceed ceiling to finish opportunistically.
A: read/pins/writer check, fresh isolated worktree, clean baseline, R1/L1–L7 final detector red controls. B: prescribed patch plus clean normal npm ci/postinstall/patch-package; installed behavioral green; exact source-fence review/commit. C: targeted suites/full npm test/typecheck/build; independent read-only Solon/Plato review (parallel eligible). D: exact final candidate+approved main ARM64 --dir packaging and byte/architecture/compiled-patch proof; serialized package routes with persisted intermediate receipts (split D1/D2 if tool ceiling). E: package completeness, independent final review, item-owned memo/timing/receipt and allowed normal nonforce build-and-hold branch publication. Parent owns governing/provider writes. No main merge, terminal completion, freeze lift, installation/distribution or release without separate Brain confirmation/go.
All original standing package gates remain: >=25s native survival; all dist renderer bytes match ASAR, actual main override/compiled dependency/source/resource/scripts/PE ARM64 verified; every run actual exe/PID/userData/arm64/isPackaged before input, fresh owned profile/distinct port, exclusive desktop window, normal hashes before/after, full stdout/stderr/window/Runtime errors/rejections/error.log/dump census, own process shutdown+absence. No installed-module hand edit/junction/retry-until-green/filter/Debugger/corrective wrapper on clean routes. Preserve all prior FAIL receipts.
Required independent exact-candidate routes: unmodified original329s session(open15s,INTRODUCTION8s,Focus paused60s,Flow playing180s,paused60s) with actions/timings/word advance; separate ro-wrap Page->Focus->Flow census no disconnected/0x0body targets; all4 roots/5293words plus5 fixed-delay Flow/Narrate cycles; actual owned91 All/Archive grid/list/open/return/reopen(initial fields preserved; existing90/91 archived=true exit policy distinguished); ADDED fresh PRODUCT-DEFAULTS unchanged full original session with NO library/settings/theme/mode/eink/text/zoom/rate seed/override, normal visible onboarding/built-in sample/effective-default capture; and native causal R1/L1–L7 controls. All clean routes zero non-enumerated errors/rejections/dumps. Inapplicable defaults route -> Brain, never silently adapt.
Fixture blob `ffa271998c636c689761ac4eb5773dca92208bf0`, SHA `8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb`; actual imported/package bytes compared. Original session SHA `ffeac5f30f6a71547699e3d12464e244f945355a1d7e49a4ec7daff40b290556`; original launcher `C:/Projects/Blurby-artifacts/foliate-observer-leak-1/launch.ps1` SHA `96042b414e538b41519112c92764b835c34e38e6a397e37719fce20d681a7430`. Source/default-profile provenance is not recovered original-profile-byte proof. Held baseline executable/ASAR SHA `cdbc080ccc68b50565d0b51151082ab46e710083703f3d778951a8bfa80e5ac2` / `26e7cc8bcaaa5af5dec04a298ffdf408ce8e340e1d1abaf6722afe72cbaca01e` remain unchanged.
##### Required next ruling
Independent reviewer checks THIS immutable final hash against all5 Brain amendments and full contract, then parent supplies live item/full ROADMAP/current pins. Brain admits or amends concrete design/test/source fence. No implementation approval, lifecycle-safety certification or package confirmation is supplied by this specification.

Cloud capability amendment from Brain: portable implementation/tests may run in cloud after entry gates; full native Windows ARM64, owner-machine required checks, desktop custody/default onboarding and final package confirmation remain local qualification holds. Cloud results cannot substitute for them. Two bounded repair passes maximum; unexpected scope/harness failure returns to Brain. Rollback is revert of this item only, never data reset.
