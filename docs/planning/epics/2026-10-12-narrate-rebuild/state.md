---
epic: narrate-rebuild
last_updated: 2026-10-13 00:15
updated_by: session 1 (S1, P1 open)
---

# State — single source of current truth

<!-- Rewrite freely; keep under ~80 lines. History belongs in journal.md; the route in
     plan.md; the contract in charter.md. Never end a work burst with this file stale. -->

## RESUME PROTOCOL — no memory of this epic? Do this first, in order

1. Read charter.md (the contract), then plan.md (the route), then all of this file, then
   the **last** entry of journal.md. Read ROADMAP.md § NARRATE-REBUILD-1 once per phase.
2. Distrust, then verify: these files are MEMORY; the repo/system is REALITY. Run the
   cheapest check that confirms the "Where we are" block below (usually the current
   phase's exit-gate command). On conflict: believe reality, fix this file, note the
   correction in journal.md.
3. If `done.md` exists in this directory, do not start work — re-verify its claims
   against the charter DoD and report.
4. If `last_updated` above is older than the newest journal entry, trust the journal and
   repair this file before working.
5. Append a session-start entry to journal.md, then continue from "Next actions".

## Where we are

```
phase:        P1 — Producer and harness (open; branch eb/narrate-rebuild-1-p1 @ 0c0ea56f, base 25ba145d)
next_action:  matrix regenerating with the P0-2 evidence fix (per-word syllables, en-gb linking r); then p0-summary exit 0 / --break exit 1, checkpoint, p1-gate.ps1, P1 merge, open P2
blockers:     none
session:      1 of ~14 budgeted
dod:          D1..D13 unmet (A1, A2 verified; P0-1 PASS; first matrix: P0-4 PASS, P0-2 FAIL on one Emma unit "for a" = evidence defect, fixed; regeneration running; baseline green)
```

Emerging P2 findings (Bella only, 0.80x and 1.00x, from `scripts/narrate-rebuild/p0-acoustic.mjs` — not yet the verdict): (1) the literal "pause k ↔ mark k" association drifts (Kokoro pauses without marks, skips pauses at dense commas, 60–80 ms stop closures register as pauses), so T4 is implemented as a monotone alignment on text-only priors (voiced ms per voiced phoneme char against the chunk mean), only pauses ≥ 120 ms ÷ rate may anchor a mark, and every anchor adjoining a count mismatch is unresolved (T4's own rule); (2) the table's word onset sits after the acoustic onset at 1% of peak by a mean +45 ms at 1.00x and +65 ms at 0.80x on passage A (22/24 and 16/24 anchors resolved, uncertainty ≤ 5.5 ms, worst 81 and 106 ms; energy is already at 30–80% of peak for 40–70 ms before the table's start, so the reference is sound) — beyond R4's 30 ms at 20 of 22 anchors; assigning the preceding space token's frames to the word centres the mean (−3 ms) but leaves a ±45 ms spread (6–7 of 22 beyond 30 ms); (3) passage B yields only 8 onset anchors at these rates (its dense punctuation is mostly unrealized as pauses) → INCONCLUSIVE under T5 after the two reference repairs (association method; offset anchors, which turned out not to be anchors: the table ends each word ~280–490 ms after the energy drops, because the pause's frames belong to the preceding phoneme); (4) warm generation of an 11–13-word chunk takes 3.7–7 s here (the audit's probe agrees), above R3's 2 s warm budget. P2 runs the full P0-3 (4 rates × 2 voices × 2 passages), P0-5 with thread settings tried, and classifies everything in the verdict.

## Next actions — max 5, near horizon only

1. [x] P1 opened; baseline green; A1/A2 verified; corpus; harness; identity PASS; policy; first matrix 21:44 (495 chunks, 0 generation errors; P0-2 FAIL on Emma "for a" = evidence defect, fixed in `lib/wordmap.mjs`)
2. [ ] Regenerate the matrix with the fixed evidence (running, `scratchpad/p0-generate-run2.log`); compare run 1 vs run 2 chunk by chunk (audio sha, phonemes, durations, spans); `p0-summary.mjs` exit 0 and `--break` exit 1
3. [ ] Checkpoint tables + summary; `scratchpad/p1-gate.ps1` (and `-SelfTest`); P1 merge per GIT WORK; Gate log + Evidence rows
4. [ ] Open P2; commit `p0-acoustic.mjs` / `p0-latency.mjs` there; P0-3 at 0.80/1.00/1.40/2.00 x both voices x both passages; P0-5 on Bella with a thread sweep first
5. [ ] VERDICT.md (three parts, P0-5 beside them, every failure classified, both reference repairs stated); P2 gate; G1 BLOCKER(USER)

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository | `C:\Projects\Blurby`, remote `origin` (github.com/gorillabrown/Blurby), default `main` | `git remote -v`, scaffold 2026-10-12 |
| Phase branches | `eb/narrate-rebuild-1-p<n>` from `origin/main` at phase open; worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p<n>` | charter Constraints |
| Base at scaffold | `main` @ the packet merge recorded in journal S0 (parent `4254609b`) | scaffold |
| Network | push policy, fetch and push granted for the whole run (`policy.git`: push, networkOperations allow) | registry, scaffold |
| Branch created | `eb/narrate-rebuild-1-p1`, session 1, base `25ba145d21aa6be0fddf96a561fa3d7560b4709e`; worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p1` | `git worktree add`, S1 2026-10-12 |
| Pinned model | `%APPDATA%\Blurby\models\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\model_q4.onnx`, 305,215,966 bytes, outputs only `waveform` — read only. sha256 `04cf570cf9c4153694f76347ed4b9a48c1b59ff1de0999e6605d123966b197c7` = `model-hashes.txt` (A1 holds) | S1 2026-10-12, `sha256sum` |
| Model copies (artifacts) | original copy `…\models\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\model_q4.onnx` sha256 `04cf570c…` (unchanged); exposed copy `…\models\local\kokoro-dur\onnx\model_q4.onnx` 305,216,050 bytes sha256 `2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad` = the audit's exposed copy (A2 holds); tokenizer/config files copied beside both | S1 2026-10-12, pwsh `Get-FileHash` |
| P1 baseline (worktree) | `npm ci` exit 0 (kokoro-js patch applied); `npm run typecheck` exit 0; `npm test` exit 0: 134 files, 1,955 passed / 1 skipped / 0 failed | S1 2026-10-12 |
| Corpus | `tests/fixtures/narrate-rebuild/`: `passage-a.txt` 165 words (Casaubon Book 1 §I + first sentence of §II, from `resources/sample-meditations.epub` sha `8be2ab1e…`), `passage-b.txt` 122 words (composite, blank-line section break), 16 legacy files byte-identical to base `612d03f5…`, `manifest.json`, `README.md` | S1 2026-10-12 (Hercules; sizes checked against `ls-tree -l`) |
| espeak fusion | `phonemizer.phonemize` fuses function words with no boundary mark ("on the"→`ɔnðə`, "to be"→`təbi`, "from the", "in the", "of the"); the API takes only `(text, lang)` | S1 2026-10-12 probe |
| Duration-exposure script | `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/F2-producer-probe/f2-producer__expose_dur.cjs` — `node <script> <in.onnx> <out.onnx> <tensorName> <elemType 1\|7>`, pure Node | scaffold |
| Artifacts folder | `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` (models\, audio\) — outside repo and profile | owner 2026-10-12 |
| Kokoro facts | 600 samples per duration frame; tokenizer wraps as `[0,…,0]`; kokoro-js truncates at 512 tokens (T2 caps chunks at ~400) | OutsideAudit.10 (HEARSAY until P1) |
| Runtime | Node v24.14.0, npm 11.9.0, kokoro-js 1.2.1 and onnxruntime-node in `node_modules`; `python` (not `python3`, which is the Store alias); no Python onnx module needed | scaffold 2026-10-12 |
| Baseline (main 4254609b) | `npm run typecheck` exit 0. Tracked suite at the removal close-out: 1,955 passed / 1 skipped / 0 failed (134 files). The primary checkout shows 4 extra failing files (moss*, kokoroPairBaseline) — untracked, locally excluded leftovers; measure the baseline in the phase worktree only | scaffold 2026-10-12 |
| Old fixtures | `git show 612d03f5bdadf861a875d76c6260fd8d3a7520aa:tests/fixtures/narration/<file>` | NARRATE-REMOVE-1 close-out |
| Gotchas from the removal | call `ttsCache.init` before any cache use; nothing at startup starts Kokoro; leftover `"narrate"` literals and `audio-truth` exist — census before relying on absence | NARRATE-REMOVE-1 close-out |

## Blockers

- (none)

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-12 | Model copy and audio in `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` | Keeps the owner profile untouched and audio out of the repo | Owner (epic answers) |
| 2 | 2026-10-12 | Merge each phase to `main` at its gate | Small, reviewable landings; later phases build on merged work | Owner (epic answers) |
| 3 | 2026-10-12 | Run as a local session with auto-accept edits | Owner-machine gates (LL-147); no approval stalls | Owner (epic answers) |
| 4 | 2026-10-12 | Expose `/encoder/Clip_output_0` (float, post-round, post-clamp) as `durations` with the audit's `f2-producer__expose_dur.cjs`, run from pwsh | The audit's tensor; the output hash reproduces its record byte for byte, so P0-1's edit is deterministic and hash-checked (R2) | Autonomy: repair/export of the producer |
| 5 | 2026-10-12 | Artifacts layout mirrors the audit's: `models\onnx-community\…` (original copy) and `models\local\kokoro-dur\…` (exposed copy), both outside the repo and the profile | Lets `KokoroTTS.from_pretrained("local/kokoro-dur")` load offline with `localModelPath` | Autonomy: harness structure |

## Evidence

- **A1** (S1, 2026-10-12): `sha256sum` of the pinned model = `04cf570cf9c4153694f76347ed4b9a48c1b59ff1de0999e6605d123966b197c7`; tokenizer.json `77a02c8e…`, tokenizer_config.json `be1cb066…`, config.json `df34b4f9…`, all equal to `remediation/d4-evidence/units/run-config.txt`.
- **A2** (S1, 2026-10-12): exposed copy sha256 `2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad` (305,216,050 bytes) = `model-hashes.txt`'s duration-exposed copy; original copy unchanged at `04cf570c…`.
- **P1 baseline** (S1): typecheck exit 0; `npm test` 134 files, 1,955 passed / 1 skipped / 0 failed.
