# Journal — Rebuild Narrate with the cursor attached to the playing word

<!-- Append only. Never edit or delete an old entry — corrections get their own entry.
     One entry per session or work burst, newest last. -->

## S0 — 2026-10-12 21:00 — scaffold

- **Did:** epic packet created ([charter](charter.md), [plan](plan.md), [state](state.md),
  [launch](launch.md)) by `/epic NARRATE-REBUILD-1`. No project work performed yet.
- **Learned:** assumptions A1–A5 accepted at launch (charter → Assumptions). Preflight in
  launch.md: typecheck exit 0 on `main` 4254609b; the primary checkout's full suite shows 4
  failing untracked, locally excluded test files, so every baseline is measured in a phase
  worktree.
- **Git:** `main` @ 4254609b plus the packet merge; phase branch `eb/narrate-rebuild-1-p1` not created yet.
- **Next:** P1 per plan.md.

## S1 — 2026-10-12 20:25 — session start (P1 opens)

- **Did:** resume protocol run (charter, plan, state, journal S0, launch; ROADMAP § NARRATE-REBUILD-1; LL-142..LL-153). Conflict check: upstream ✓ (NARRATE-REMOVE-1 completed, merge `386651fc`) · in flight ✓ (register: nothing In Flight; no `eb/narrate-rebuild-1*` branch existed) · roadmap order ✓ (head, position 9) · downstream 3 flagged, informational (UX-POLISH-1 touches `ReaderContainer.tsx` and must not overlap the Core phase; CLEANUP-MODE-BARREL-1 retires the leftover `"narrate"`/`"audio-truth"` literals the rebuild may reuse; SETTINGS-WRITE-DURABLE-1 must merge before Core) · drift ✓ (all P1 edit sites are new paths). P1 opened per GIT WORK: `eb/narrate-rebuild-1-p1` cut from `origin/main` at `25ba145d21aa6be0fddf96a561fa3d7560b4709e`, worktree `.worktrees/narrate-rebuild-1-p1`; `npm ci` 17 s with the kokoro-js patch applied; baseline `npm run typecheck` exit 0, `npm test` exit 0 (134 files, 1,955 passed / 1 skipped / 0 failed). A1: pinned `model_q4.onnx` sha256 `04cf570c…` matches `model-hashes.txt`. A2: graph edit of a copy (tensor `/encoder/Clip_output_0`, float) wrote the exposed copy, sha256 `2eccfc53…` = the audit's exposed copy, byte for byte; the original copy is unchanged. Corpus recovered (Hercules worker): `passage-a.txt` 165 words (Casaubon Book 1 §I + first sentence of §II, from `resources/sample-meditations.epub` sha `8be2ab1e…`), `passage-b.txt` 122 words composite with a blank-line section break, 16 legacy files byte-identical to base `612d03f5…`. Time log `Timing.NARRATE-REBUILD-1-S1.jsonl` opened with 18 rows.
- **Learned:** Git Bash's MSYS path conversion turned the tensor argument `/encoder/Clip_output_0` into `C:/Program Files/Git/encoder/Clip_output_0`; the first exposed copy hashed wrong and was deleted. Every charter command runs in pwsh (standing rule 44) — this is why. espeak fuses function words into neighbours with no boundary mark of any kind: "on the"→`ɔnðə`, "to be"→`təbi`, "from the"→`fɹʌmðə`, "in the"→`ɪnðɪ`, "of the"→`ʌvðə`; `phonemizer.phonemize(text, lang)` has no option to emit one. The suite rewrites `tests/perf-baseline-results.json` in the worktree; it is never staged. The `epics` registry role lists only `epic` as a writer; this run edits the packet files on the packet's own instruction (launch.md), noted for the planner.
- **Decisions:** state.md Decision log #4 (tensor and element type), #5 (artifacts layout mirrors the audit's).
- **Gate/DoD movement:** none yet (A1, A2 verified; P1 gate not run).
- **Git:** eb/narrate-rebuild-1-p1 @ 25ba145d (no phase commit yet); uncommitted: `tests/fixtures/narrate-rebuild/**`, `docs/governance/close-outs/Timing.NARRATE-REBUILD-1-S1.jsonl`, packet `state.md`, `journal.md`.
- **Next:** first checkpoint commit with the base trailer; harness library; P0-1 identity script; P0-2 mapping policy.

<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things, no aggregates]
- **Learned:** [facts, surprises, dead ends worth not repeating]
- **Decisions:** [pointers to new Decision-log rows, if any]
- **Gate/DoD movement:** [status changes + evidence pointer, if any]
- **Git:** eb/narrate-rebuild-1-p<n> @ [sha]; uncommitted: [exact paths, or none]
- **Next:** [where the following session should pick up]

-->
