# OutsideAudit.10 — Remediation Plan (D3)

**Status:** owner rulings R1–R12 approved as recommended (owner, 2026-10-11; §5). The proposed diff on branch `eb/outside-audit-10-remediation` applies them to ROADMAP.md, the held storyboard and the governance docs. Nothing merges, and the register and the code stay unchanged, until the auditor's review (D4) closes the loop (D5).

**Inputs:**
- `AuditReport.10.2026-10-11.md` (D2): verdict "partially flawed", calculated 5.2/10, milestone not authorized.
- The audit's scorecards and evidence bundle.
- `main` @ `b4335606`. Its source and ROADMAP.md are byte-identical to the audited `8ee49de3`.

**How this plan was tested:** every finding was checked by two independent reviewers, one trying to refute it and one tracing and reproducing it. A third designed the fix, and a final critic checked all the fixes against every section of the report. That was 34 agents in all. Their scripts and outputs are in `remediation/` (74 files, hashes in `remediation/HASHES.txt`). They ran read-only against the repository, and against copies of the model, never the owner's profile.

## 1. Management summary

1. **Every finding the audit raised is real.** No finding is rejected.
2. **Finding F2, the exact-word-table concern, is worse than the audit says.**
   - The installed Kokoro model (`model_q4.onnx`, sha256 `04cf570c…`) has one output, `waveform`. It has no duration output. The kokoro-js patch therefore never produces a word table.
   - Every Kokoro word table Narrate has ever used was a weighted estimate built by `segmentKokoroChunk.ts`, then labelled `word-native` and trusted by `audioScheduler.ts`. The cache confirms it: all 4,505 timing sidecars in the owner's cache are "heuristic" with no table, under a "word-native" label.
   - The "exact word table" has never existed on this install.
3. **This is a repairable gap, not evidence against Kokoro.**
   - With the model's internal duration tensor exposed in a scratch copy, waveform length = 600 × Σ(duration frames) exactly. That held at 0.80, 1.00, 1.40 and 2.00x, and in 5 of 5 sentences.
   - Kokoro's durations really do drive its audio. The local export just doesn't hand them out, and the patch reads them wrongly. Its defects:
     - a 256-sample hop (the measured value is 600);
     - two extra tokens counted per word;
     - a `RawAudio.data` field that doesn't exist;
     - per-word re-phonemization that cannot reproduce in-context merges.
4. **The removal (NARRATE-REMOVE-1) stays the right next step.** Its specification needs a docs-only revision before dispatch: findings F4–F7, plus four sequencing defects our review found. None of this changes what the removal deletes or keeps.
5. **The rebuild (NARRATE-REBUILD-1) gets a decision-quality Phase 0.**
   - Prove the producer: expose the durations, then the unit law, then the token-to-word identity.
   - Check the result against the waveform itself.
   - Measure latency in a scope the owner has defined.
   - Runtime behaviour (handoff, failures, overlap) moves into a "Core acceptance" block, because every candidate engine faces it equally.
6. **Independence.** The audit itself says it is internal and coordinated, not an independent sign-off. This plan recommends that the auditor's review of this response (D4) go to a **fresh, history-free reviewer**. That reviewer then serves as the "fresh review" the audit's minimum closure set requires.

## 2. Corrections to the audit report

These are places where verification found the report wrong, overstated or understated. The proposed edits follow these corrections, not the report text.

| # | Report text | Correction (evidence) |
|---|---|---|
| C1 | F2: native timing "can" be relabelled | It **always** is on this install. The model outputs only `waveform` (onnxruntime `outputNames`, executed; 0 occurrences of "durations" in the file). All 10 executed generations returned `wordTimestamps: null`. `remediation/F2-producer-probe/` |
| C2 | F2: the scheduler labels telemetry `kokoro-duration-tensor` | The trust label is declared **before generation** by the cache identity (`kokoroStrategy.ts:368`; `generationPipeline.ts:523-525`) and defaulted at `audioScheduler.ts:491`. The telemetry string is development-only (`:495-508`). In production the mislabel is `isTrustedWordTiming`/`timingTruth`. A harness run: a null table came out as 12/12 trusted "word-native" advances. `remediation/F2-consumer-trust/` |
| C3 | F2: two "conditional" producer defects | Both are real on the installed artefacts. The tokenizer wraps every call as `[0,…,0]` ("cat" → `[0,53,156,72,62,0]`), and the hop is 600, not 256. The report missed three more: `_audio.data.length` (transformers 3.8.1 `RawAudio` has only `.audio`); per-word phonemization loses merges (e.g. "on the" → one group with no separator) and stress marks; unnormalized words are sent against normalized text. A fourth is inferred, not executed: an int64 durations output would throw outside any `try` |
| C4 | F4 severity High | **Medium** as a specification defect; **Low** at runtime. After the removal no retained renderer code can produce `"narrate"`: every mode write is a literal or the Focus/Flow cycle. The fix is still taken, because it is two lines |
| C5 | F5a: a correct implementation "necessarily" fails | A helper that renames `ctx`/`settings` passes the old gates. The gates reward rewording, which is worse. Also missed: `git grep -c` prints `path:N`, never a bare count, and a half-wired implementation passes line 249 |
| C6 | F5b: two commands misquoted | Wider than that. `rg` is not on PowerShell's PATH on the owner's machine, so **all seven** `rg` gates print nothing, a false pass. The report's single-quote fix still fails in Windows PowerShell 5.1 whenever the pattern contains `"`. `remediation/F5b-shell-gates/` |
| C7 | F5c: Page Shift+Space | Confirmed. Shift+Space in Page has been select-only since `92d6b220` (2026-03-27); stale help text misled D15. Missed: D8's removal of `toggleNarration` shifts the positional `useReaderKeys` slots. The shifted callbacks are all optional `() => void`, so a misaligned call type-checks. The corrected smoke catches it |
| C8 | F6: "moving main" breaks the base | The trigger is **publication itself**. Unrelated advances of `main` leave the merge-base unchanged. The report's fix is unsafe as written: a bare `is-ancestor` publication test sends an unstarted branch (n = 0) to close-out, because an empty branch is always an ancestor. Severity Medium (the failure is a safe STOP). 19-row disposable-repo control: `remediation/F6-resume-recipe/` |
| C9 | F7: make the writer awaitable | It is not a one-liner. Returning the promise makes a failed startup write reject `loadState` inside `app.whenReady().then(...)`, which has no `catch`. The window would never open |
| C10 | B/F: tempo "per-window shifts" | At 21 of the 22 non-bucket speeds the stretcher copies bucket-speed audio unchanged, then truncates or repeats its tail. Only 2.00x runs a real stretch. `getAudioProgress` (interpolated progress) is dead code after the separation. The live 450 ms lag sites are `audioScheduler.ts:587/619/631`, not `1007-1012` |
| C11 | E: Rule 5a after 5–7 close | Worse than stated. The recipe moves the item to In Flight *before* step 2 counts the queue, so a stop orphans it In Flight. Other defects: the removal deletes evaluation-harness assets but does not own lane B; Done-when 8 implicitly freezes the kept Kokoro files, which the forbidden list does not name; and "the e-ink fix may run in parallel" contradicts the item's own prerequisites |

## 3. Response matrix

Dispositions: **A** accept · **AN** accept with narrowing · **D** defer · **R** reject.

| Finding | Disposition | Why | Next step | Lands in |
|---|---|---|---|---|
| **F1** package omitted the patch and lockfile | A | True. `build_package.py` took `package.json` but neither `patches/` nor `package-lock.json`; model, tokenizer and asset exclusions were not stated | The D4 package carries the patch (`9f1af5fd…`), lockfile (`76e4a436…`), model (`04cf570c…`) and tokenizer (`77a02c8e…`) hashes, the verification controls, and an exclusions statement. Future audit packages always include `patches/` and the lockfile | D4 package; package procedure (lesson) |
| **F2** estimated timing passes as native; the patch does not prove correspondence | AN | True and understated (C1–C3). Narrowed: **no removal code change**. The removal already deletes every consumer, the trust predicate, the pre-declared label and the tests that lock the masquerade in (Delete list). The kept patch is inert | Removal: one merged out-of-scope sentence plus decision D16. Rebuild: the provenance rule and the Phase 0 producer contract (§4 B-1, B-3). Docs: corrections to LL-089, BUG-161 and TECHNICAL_REFERENCE | Removal spec rev 4; rebuild stub; governance docs |
| **F3** Phase 0 cannot decide its question | AN | True. Narrowed: Phase 0 keeps P0-1…P0-5 (engine-deciding). P0-6 (atomic playback) and P0-7 (failure handling) move to a rebuild **Core acceptance** block: any engine faces them, so they cannot choose between engines. Nothing is dropped | Replace the stub's Phase 0 block; add Core acceptance; record the owner rulings on cold start, tolerance, silence and partial words | Rebuild stub; storyboard A1/A8/F5 |
| **F4** settings IPC bypasses normalization | A (re-rated Medium) | True (C4). Two lines make "every ingress" true by construction | Third normalization seam in `main/ipc/state.js`; Done-when 7 case (e) drives the **real registered handler**; omission control; wiring gate | Removal spec rev 4 (C1 test, C3 edit) |
| **F5a** count gates contradict the prescribed code | A | True (C5) | Four fixed-string counts, each expecting `main/sync-engine.js:1`, dry-run against the prescribed edit, the base and three wrong variants | Removal spec rev 4 |
| **F5b** invalid shell commands | A, wider (C6) | True and wider | One shell (PowerShell 7). `git grep -P` with single-quoted patterns (`\x22` for a quote). An exact-exit-code rule. No `rg`. A base positive control for every no-match gate | Removal spec rev 4; rebuild command convention |
| **F5c** Page Shift+Space smoke is wrong | A | True (C7). Keep Page behaviour | Rewrite D15 (two routes) and smoke 16(f) (Page stays; outline alternates); add a slot-alignment review item. Stale help text and replica tests become a note for UX-POLISH-1's re-authoring, not new scope | Removal spec rev 4; UX-POLISH-1 note |
| **F6** resume rejects published work | AN (re-rated Medium) | True (C8). Narrowed: one rule for an interrupted merge-before-push ("an unpushed merge of the branch tip already exists → push it"), in one merge worktree that is reused, so a merge made before an interrupted push is pushed, not repeated | Base from C1's trailer with `C1^ == base`. "Already published" only for n = 5 through one `--no-ff` merge. (A) checks `origin/main` for C-commits. New conflict cases and walk-through rows | Removal spec rev 4; rebuild charter carry-over |
| **F7** save submission presented as persistence | AN | True. Narrowed: the removal's invariant does not depend on completion, because every load and every cloud apply re-normalizes. Making the writer awaitable needs a startup failure policy (C9) | Reword "persists" to "submits"; add a D12 durability boundary; qualify D13 and its duplicate rollback and LL-006 lines; a gate checking the writer is unchanged. File **BUG-185** (Low, settings writer) | Removal spec rev 4; BUG_REPORT |
| **SEC** inherited architecture facts (B/F) | AN | Load-bearing facts hold; two descriptions are wrong (C10). No removal change: every mechanism is deleted or byte-frozen (Done-when 8) | Six corrected charter inputs: no fixed lag, provenance not a flag, no stretch, no overlapping joins, raw audio first, one clock | Rebuild stub |
| **GOV-1** Rule 5a stops the removal | A | True and worse (C11) | Read-only step 2 *before* the In Flight move (D14 aligned). Rule 5a per owner ruling R1 | Removal spec rev 4 |
| **GOV-2** parallel Phase 0 preparation | AN | Valid in principle. Narrowed: no parallel code item. Phase 0 starts after the removal merges (owner ruling R11); only docs-only charter drafting runs in parallel. The fence is made explicit: lanes A–D, the kept Kokoro files, the patch, `package.json`, CI and the Delete list | Lane ownership, forbidden list and merge order corrected | Removal spec rev 4 |
| **GOV-3** closure check counts lookalikes | A | True. A v2 check given the three new negative controls fails its own self-test | Closure check v3: `vi.mock` read from TypeScript's syntax tree, CSS comments stripped. Self-test 7/7; 0 on the tree; the same 70 `vi.mock` pairs as v2 | Removal spec rev 4 |
| **GOV-4** package closure fails on the icon | A (documentation only) | A package limit, not a source defect (the canonical tree scores 0) | State exclusions in the D4 and future package manifests | D4 package |
| **G6 / J2** no check of the integration tree | AN | Uncovered by the earlier remedies. Narrowed: only when `main` moved during the run | In the merge worktree, before the push: if the merged tree differs from the branch tree, run typecheck, the closure check and `npm test` there, and push only on exit 0 | Removal spec rev 4 (Wave C) |
| **A10** H1–H6 have no single proved cause | A (documentation) | True | The rebuild's Why line states that H1–H6 were observed on estimated timing and that no single mechanism is proved responsible | Rebuild stub |
| **Standing rule 38** "trusted lag 450 ms" | A | It ran on estimates, and it conflicts with "no fixed lag" | Qualify rule 38 as superseded for the rebuild | ROADMAP standing rules |
| **Independence** | A | The report says so itself | D4 by a fresh, history-free reviewer (R12). Record OutsideAudit.10 as "internal, coordinated; not independent" at D5 | D4; CLAUDE.md audit table |

No finding is rejected or deferred outright. The two deferrals inside the narrowings (UX-POLISH-1 cleanups, BUG-185) are recorded with their placement.

## 4. Roadmap rewrite actions (applied after the rulings, as one ordered diff)

The verified per-finding designs gave old → new text for each line. They overlapped: several edited the same lines, and some contradicted each other. This plan resolves each conflict once, below, and the proposed diff applies the result in a single pass anchored on old text, not line numbers.

### Package R — NARRATE-REMOVE-1 specification revision 4 (docs only; before dispatch)

| ID | Change | Resolves |
|---|---|---|
| R-1 | **Settings IPC seam.** Covers the What sentence, D12 (three seams, rationale), Done-when 7 case (e), the omission control, wiring, Review focus 1, the Wave B edit site (`main/ipc/state.js`: `require` plus `normalizeReaderModes(settings);` directly after `Object.assign`), Tests, C3 staging and LL-121 applied | F4 |
| R-2 | **Wiring gates.** Four `git grep -cF` counts (`-w` on the two call-site counts), each expecting `main/sync-engine.js:1`, single-quoted per R-3. A dry-run note covers *all* new wiring gates, F4's and F7's included | F5a, critic |
| R-3 | **Shell and exit-code rule.** The Done-when header names PowerShell 7 and the gate rule. The seven `rg` gates become `git grep -P`; `ls-files` loses its pipe; the `:453` constants rule is fixed; the recipe preamble names `pwsh`; step 4 adds base positive controls (35, 9, 11, 51, 68, 9, 18, 12 lines on `b4335606`; the second Done-when 9 search excludes the kept `ttsCacheEnabled` field) | F5b |
| R-4 | **Shift+Space.** D15 rewritten (Page: `cycleMode`, select-only; Focus/Flow: `cycleAndStart`); smoke 16(f) rewritten; Review focus 6 added (slot alignment after D8); task row 7 updated | F5c |
| R-5 | **Resume recipe.** Base from C1's trailer with `C1^ == base`; at most one C1; the n = 0 rule; the "already published" exit (n = 5, one `--no-ff` merge whose second parent is the branch tip); (A) checks `origin/main`; new (C) examples; walk-through rows; D14 rewritten. Wave C: an existing unpushed merge is pushed, not repeated; the integration-tree check (G6) runs before the push | F6, G6 |
| R-6 | **Durability boundary.** "Persists" becomes "submits to the settings save" (Done-when 7 a–c, Wave B edit sites). D12 gets a durability-boundary paragraph. D13 and the duplicate claims at Rollback and LL-006 are qualified. A gate checks the writer is unchanged; `applyCloudSettings` stays synchronous | F7 |
| R-7 | **Gate order and fences.** Step 2 is read-only and runs before the In Flight move, aligned in D14, the preamble and the walk-through (adds "Gate not met: the item stays Queued"). The queued count is recorded in the close-out, not in C1's body. Rule 5a per R1. Owned surfaces A–D. One merged forbidden list: the freeze set, `src/reader/**`, `main/migrations.js`, `main/sync-engine.js`, `main/ipc/state.js`, the Delete list, the kept Kokoro files, the patch, `package.json` and `ci.yml`. "May run in parallel" is removed; the merge order adds the timeout fix | GOV-1, GOV-2 |
| R-8 | **Closure check v3** in the code block, the self-test (three new lookalike controls), Done-when 13 and the prose | GOV-3 |
| R-9 | **Inert patch.** One merged out-of-scope sentence: Kokoro and its packaging are neither removed **nor repaired**; the patch's timing code is inert on the installed model and is not evidence of exact timing; repairing it is rebuild Phase 0. D16 records the evidence; its provenance is the planner's verification probes, not the audit's. No close-out obligation is added | F2, F3 |
| R-10 | **Rubric walk** U5 and U9/U10 re-run on the revised text; the "revision 4 (OutsideAudit.10)" marker is set | all |

What does **not** change: the Delete list, the kept files, the waves, the 16 Done-when rows (only wording and gates inside them change), the owner smoke's scope, and the Page/Focus/Flow baselines.

### Package B — NARRATE-REBUILD-1 stub and storyboard (charter inputs; docs only)

| ID | Change | Resolves |
|---|---|---|
| B-1 | **Phase 0 block replaced (P0-1…P0-5).** P0-1 records identity and makes the durations available, per R2. P0-2 is the identity and unit law: word spans come from the exact `input_ids` sent; strip the two special tokens; one phonemization pass; a written policy for merges, expansions and punctuation; no proportional split; frames × samples-per-frame = PCM length on every chunk, with the factor measured (600 observed). P0-3 is the waveform-only reference, per R4. P0-4: all 25 rates. P0-5: latency, per R3, naming exactly which segments are timed, with the largest chunk tested recorded. **Harness route:** a new script calls kokoro-js directly, never through `main/tts-worker.js`, which returns no token or duration data. The patch's alignment and `narrTiming` tests are never reused. **Timing:** after the removal merges (R11). **Evidence:** scripts and redacted numbers in the repo; audio outside both the repo and the profile. **Verdict:** per R2 | F3, F2, critic contradictions 1–4 |
| B-2 | **Core acceptance block** (the charter's DoD before the core build). One sample-and-word clock drives the cursor, handoffs and resume. A speed change fixes the last played sample and the next unplayed word; partial words follow R7; it also fixes the epoch, the largest allowed gap, coalescing and a bound on stale jobs. No overlap, drop or repeat. Silence follows R6. The failure list ends in F4/F5. The transport and playback-start remainder is measured against the 2 s budget | F3 (P0-6/7), critic |
| B-3 | **Provenance rule.** The engine adapter records provenance from what the model actually returned, and nothing declares it in advance. Structure never confers trust. F4 covers missing, unverified and non-native tables. Done-when 4 adds negative controls on the full path | F2 |
| B-4 | **Cache rule, stated once.** Version one plays freshly generated audio only. The old cache (4,505 sidecars, 4,861 `.opus` files) stays untouched and is never played or read for timing. A future cache needs a stored sample count, a pre-skip trim and a check of decoded PCM against the table (R10) | F2, SEC, critic |
| B-5 | **Charter inputs (SEC, corrected):** no fixed lag constant; no time-stretch; no overlapping voiced joins; one clock. Device delay follows R5 | SEC |
| B-6 | **Settings.** If the rebuilt mode's id is `narrate`, retire the three runtime `narrate → flow` seams; draft Done-when 7 (the saved mode survives load, cloud apply and the IPC); settings durability rests on BUG-185 | F4, F7 |
| B-7 | **Carry-overs.** The acceptance-command convention (F5b); the resume base comes from the phase's own trailer (F6); `/epic` estimates and timeboxes Phase 0 | F5b, F6, critic |
| B-8 | **Why line.** H1–H6 were observed on estimated timing labelled trusted, and no single mechanism is proved responsible | F2, A10 |
| B-9 | **Done-when 3 and 5.** Tolerance per R4, with an "inconclusive, not a pass" rule; the Phase 0 verdict records each failure's classification | F3 |
| B-10 | **Storyboard.** The A8 row rewritten once; A1/F5 cold scope per R3; the Decisions table gets the new rulings; the draft stub is not mirrored: a note above it says ROADMAP.md NARRATE-REBUILD-1 governs for Phase 0 and the core contract | F2, F3 |

### Package G — governance corrections (docs only)

- **LESSONS_LEARNED** gets three entries, numbered sequentially after LL-141's status records:
  - **LL-142** "A timing label is a declaration; prove a producer by executing it against the installed artefact." Covers F2, F3, the package custody gap F1, and the patch whose timing path never ran.
  - **LL-143** "Dry-run every gate against the prescribed edit and the base; name the shell; pass only on an exact exit code." Covers F5a and F5b.
  - **LL-144** "Take a resume base from the first commit's trailer; never recompute it against the publication target." Covers F6.
  - LL-089 also gets a one-line correction.
- **BUG_REPORT:** one correction line on BUG-161, plus **BUG-185** (Low, Platform & Maintenance, unscheduled). BUG-185 covers the settings writer: it is fire-and-forget, its `.tmp` path is shared, and no flush runs at quit. History and site-cookie writes follow the same pattern; that part is flagged unverified. The `.tmp` race was seen only in Node, not reproduced under Electron.
- **TECHNICAL_REFERENCE:** one correction note above the NARR-TIMING section. It is added now and is not a removal close-out obligation.
- **ROADMAP standing rule 38:** qualified as superseded for the rebuild by "no fixed lag".
- **CLAUDE.md:** the open-bug count becomes 3. At D5, add an OutsideAudit.10 row to External Audit Outcomes, marked "internal, coordinated; not independent".
- **Register:** one combined mutation on NARRATE-REMOVE-1 (notes: "spec revision 4, OutsideAudit.10"; status and Seq unchanged) after the merged diff lands. Then read it back and refresh the snapshot (standing rule 40).

## 5. Owner rulings (2026-10-11: all approved as recommended)

Each was approved as recommended on 2026-10-11; the proposed diff uses these values.

| # | Decision | Recommended |
|---|---|---|
| R1 | Rule 5a (queue depth ≥ 3) will stop the removal once items 5–7 close: every other open item is blocked on the removal itself. Waive it **for this one dispatch**, re-armed at the removal's close-out, where `/roadmap-review` backfills? | **Yes, waive for this dispatch only.** Backfilling means writing three unrelated specs that can't run alongside a shared-core sprint. The waiver names both places the stop is written, CLAUDE.md Rule 5a and ROADMAP standing rule 8, and covers no other dispatch |
| R2 | May Phase 0 (and the shipped rebuild) use a Kokoro model that exposes its predicted durations? It would be made by a deterministic, hash-checked **local** edit of the pinned model, with no download, kept beside the original, which stays untouched. And does an export, adapter, unit or mapping failure count as a repair, not a bake-off trigger? | **Yes to both.** Verified offline: exposing the internal tensor gives 600 × Σ = PCM length exactly. The gap is in the export, not in Kokoro |
| R3 | The 2-second start target (A1): does it cover a cold start, meaning the first Play after launch or after the 5-minute idle unload? | **2 s once the voice is ready; a cold start shows "voice loading" and must speak within 8 s.** The 8 s is fixed now, before measurement, so it can fail. Cold load measured about 5 s in plain Node (indicative only) |
| R4 | Boundary accuracy: worst error ≤ 30 ms at every boundary the waveform-only reference resolves, with reference uncertainty ≤ 10 ms (otherwise "inconclusive"), plus a 40 ms negative control. Interior boundaries with no pause rely on the model's frame-exact construction and P0-2's mapping coverage, with no manual annotation | **Accept as proposed.** The fallback option adds a small owner-annotated interior sample |
| R5 | Device output delay: keep your earlier ruling, "no per-device delay calibration" on day one. Phase 0 documents its output route; revisit only if your listening sign-off hears the cursor lead | **Keep the earlier ruling** |
| R6 | During a pause between words, what does the cursor show? | **The last spoken word stays highlighted.** It never jumps to the next word early |
| R7 | A speed change arrives mid-word: finish that word at the old speed, or cut it? | **Finish the current word, then switch from the next word.** This matches storyboard F3 |
| R8 | Page Shift+Space stays select-only: it moves the remembered Focus/Flow choice and opens nothing, as shipped since 2026-03-27. Any change belongs to UX-POLISH-1 | **Yes** |
| R9 | D13 (your rollback ruling) gets qualified: "stays Flow once a settings save has completed". The writer fix is filed as BUG-185 (Low), not added to the removal | **Yes** |
| R10 | The old audio cache stays on disk untouched; the rebuild's first version never plays it or reads its timing | **Yes** |
| R11 | Does Phase 0 code run in parallel with the removal, or after it merges? | **After it merges.** The `/epic` charter (docs only) can be written while the removal runs |
| R12 | Who reviews this response (D4)? | **A fresh, history-free session.** It also serves as the fresh review the audit requires |

## 6. Testing and validation plan

**Before D4 (planner, on the proposed diff):**
1. Parse every command in the revised removal section with the PowerShell 7 and Windows PowerShell 5.1 parsers: zero errors.
2. Run every revised no-match gate on the base. Each must find hits, at the reference counts above.
3. Run the wiring gates against a scratch application of the prescribed edits. Each prints `main/sync-engine.js:1`, plus F4's and F7's lines. The base and the three wrong variants each fail at least one gate.
4. Replay the F6 control against the final recipe text: 19 of 19 rows give the expected outcome.
5. Closure check v3: self-test 7/7, and 0 dangling imports on the tree.
6. Run F4 case (e) as a scratch control: it fails on the base and passes with the two-line edit.
7. Check every code citation in the revised stub against `b4335606`.

**Results on the proposed diff (2026-10-11).** A second verification run applied the edits and checked them with seven independent checks: gates, recipe replay, closure check, settings-IPC control, spec compliance, an executor's read and citations. One fix round followed, then a re-check; the planner applied the final fixes. Outputs are in `remediation/post-apply/`.
- **Gates:** every command parses in PowerShell 7 and 5.1. The base positive controls give 35, 9, 11, 51, 68, 9, 18 and 12 lines. Every wiring gate prints its stated line on the prescribed edits, and each wrong variant fails at least one.
- **Recipe:** 52 scenario rows replayed in disposable repositories. Every row gives the outcome the spec text predicts, including published work, a merge made before an interrupted push, `main` moving during the run, and a removed branch.
- **Closure check v3:** the ROADMAP code block is byte-identical to the verified checker. Its self-test reports 7/7, and it finds 0 dangling imports on the tree.
- **Case (e):** written exactly as specified and run with vitest. It fails on the base, passes with the two-line edit, and fails again when the normalize line is omitted.
- **Spec compliance:** all 31 merge-brief items are applied, and nothing else changed in the removal's scope. The lessons gate passes for both items.
- **Executor's read:** of the 23 ambiguities found in the first read, all are resolved. Of the issues raised in the re-read, the last two majors, standing rule 8 and a commit slot for fixes after C4, were fixed by the planner afterwards.

**At removal execution:** the revised Done-when, which are unchanged in scope. Then the integration-tree check before the push (R-5).

**At Phase 0:** P0-1…P0-5 per the charter. The verdict classifies each failure as repaired adapter or engine limit.

## 7. Corrected execution order

1. **Done (2026-10-11):** owner rulings R1–R12, all as recommended.
2. **Done (2026-10-11):** proposed diff on `eb/outside-audit-10-remediation` (Packages R, B, G), the §6 dry-runs, and the D4 package (`AuditResponse.10.2026-10-11.zip`).
3. **D4:** a fresh reviewer gets the D4 package and the Step 3 prompt, and answers line by line.
4. **D5:** apply the final decisions; merge; one register mutation; CLAUDE.md audit row; lessons.
5. **Not blocked by this audit, in parallel now:** TEST-TIMEOUT-HEADROOM-1 (5) ∥ EINK-HOVER-FIX-1 (6), then the LIBRARY-SETTINGS-FIX-1 close-out (7).
6. **NARRATE-REMOVE-1 (8)** dispatches after D5, on spec revision 4, once 5–7 read Completed (Rule 5a per R1).
7. **NARRATE-REBUILD-1 (9):** `/epic` writes the charter while the removal runs; Phase 0 starts after the removal merges.
8. CLEANUP-MODE-BARREL-1 (10) and UX-POLISH-1 (11) follow the removal.

## 8. Conclusion

Proceed. The removal-then-rebuild plan is right and correctly ordered. The removal needs a docs-only revision of its checks, not of its scope. The rebuild's central premise, an exact word table, is **not yet true but is repairable**: Kokoro computes the durations that drive its audio, and Blurby's local setup never received them. Phase 0's first job is to obtain them and prove them against the waveform. Only a failure under that verified contract should send the engine choice to a bake-off.

## Evidence index

- `remediation/HASHES.txt`: sha256 of every copied control.
- `remediation/F2-producer-probe/`: model outputs, tokenizer wrap, duration exposure, the 600-sample law.
- `remediation/F2-consumer-trust/`: the harness showing estimated tables trusted as native.
- `remediation/F3-phase0-units/`: the unit law across rates; the silence/onset reference probe.
- `remediation/F4-settings-ipc/`: the registered-handler reproduction and the two-line fix.
- `remediation/F5a-count-gates/`, `remediation/F5b-shell-gates/`: gate dry-runs in pwsh 7, PowerShell 5.1 and bash.
- `remediation/F5c-page-shift-space/`: Shift+Space wiring control.
- `remediation/F6-resume-recipe/`: 19-row disposable-repo control.
- `remediation/F7-settings-writer/`: deferred and rejecting writer controls.
- `remediation/GOV-closure-check/`: closure check v3 and its lookalike census.
- `remediation/SEC-old-pipeline/`: Opus round-trip, tempo identity, trust and truth-sync controls.

No model binaries, audio, decoded book content or user-profile files are included.
