---
epic: narrate-rebuild
last_updated: 2026-10-13 01:10
updated_by: session 1 (S1, P2 open)
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
phase:        P2 — Acoustic check, latency and the verdict (open; branch eb/narrate-rebuild-1-p2, base 7bbf6b20 = the P1 merge)
next_action:  P0-3 run (0.80/1.00/1.40/2.00 x both voices x both passages), P0-5 on Bella with a thread sweep, VERDICT.md, P2 gate, stop at G1
blockers:     none
session:      1 of ~14 budgeted
dod:          D1..D13 unmet. P1 merged (7bbf6b20): P0-1, P0-2, P0-4 PASS on both voices over 500 chunks; D13 holds for P1 (one --no-ff merge, trailer valid); D11 green in the P1 worktree
```

Prototype P0-3/P0-5 findings (Bella, 0.80x/1.00x, pre-fix tables) are in journal S1 20:55 and 00:15; P2 reruns everything on the merged tables and classifies the result in VERDICT.md.

## Next actions — max 5, near horizon only

1. [x] P1 gate: `p0-summary.mjs` exit 0 (514/514), `--break` exit 1, `p1-gate.ps1` 11/11 (`-SelfTest` records a FAIL); merged `7bbf6b20`
2. [ ] Open P2: branch, worktree, `npm ci`; first commit with the base trailer; `p0-acoustic.mjs` and `p0-latency.mjs` committed there
3. [ ] P0-3 run: `node scripts/narrate-rebuild/p0-acoustic.mjs` (4 rates x 2 voices x 2 passages; 40 ms control); `phase0/acoustic/`
4. [ ] P0-5 on Bella: thread sweep (`--threads 1/2/4/8 --warm 3 --cold 1`), then the full T7 run on the best setting; never alongside `npm test`
5. [ ] VERDICT.md (three parts, P0-5 beside them, every failure classified, both reference repairs stated); P2 gate; G1 BLOCKER(USER)

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository | `C:\Projects\Blurby`, remote `origin` (github.com/gorillabrown/Blurby), default `main` | `git remote -v`, scaffold 2026-10-12 |
| Phase branches | `eb/narrate-rebuild-1-p<n>` from `origin/main` at phase open; worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p<n>` | charter Constraints |
| Base at scaffold | `main` @ the packet merge recorded in journal S0 (parent `4254609b`) | scaffold |
| Network | push policy, fetch and push granted for the whole run (`policy.git`: push, networkOperations allow) | registry, scaffold |
| Branches created | P1 `eb/narrate-rebuild-1-p1`, session 1, base `25ba145d21aa6be0fddf96a561fa3d7560b4709e`, merged `7bbf6b20` 2026-10-13. P2 `eb/narrate-rebuild-1-p2`, session 1, base `7bbf6b20790c533c6688a71b0d509ad928771364`; worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p2` | `git worktree add`, S1 |
| Pinned model | `%APPDATA%\Blurby\models\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\model_q4.onnx`, 305,215,966 bytes, outputs only `waveform` — read only. sha256 `04cf570cf9c4153694f76347ed4b9a48c1b59ff1de0999e6605d123966b197c7` = `model-hashes.txt` (A1 holds) | S1 2026-10-12, `sha256sum` |
| Model copies (artifacts) | original copy `…\models\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\model_q4.onnx` sha256 `04cf570c…` (unchanged); exposed copy `…\models\local\kokoro-dur\onnx\model_q4.onnx` 305,216,050 bytes sha256 `2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad` = the audit's exposed copy (A2 holds); tokenizer/config files copied beside both | S1 2026-10-12, pwsh `Get-FileHash` |
| P1 baseline (worktree) | `npm ci` exit 0 (kokoro-js patch applied); `npm run typecheck` exit 0; `npm test` exit 0: 134 files, 1,955 passed / 1 skipped / 0 failed | S1 2026-10-12 |
| Corpus | `tests/fixtures/narrate-rebuild/`: `passage-a.txt` 165 words (Casaubon Book 1 §I + first sentence of §II, from `resources/sample-meditations.epub` sha `8be2ab1e…`), `passage-b.txt` 122 words (composite, blank-line section break), 16 legacy files byte-identical to base `612d03f5…`, `manifest.json`, `README.md` | S1 2026-10-12 (Hercules; sizes checked against `ls-tree -l`) |
| espeak fusion | `phonemizer.phonemize` fuses function words with no boundary mark ("on the"→`ɔnðə`, "to be"→`təbi`, "from the", "in the", "of the"); the API takes only `(text, lang)` | S1 2026-10-12 probe |
| Duration-exposure script | `docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/F2-producer-probe/f2-producer__expose_dur.cjs` — `node <script> <in.onnx> <out.onnx> <tensorName> <elemType 1\|7>`, pure Node | scaffold |
| Artifacts folder | `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` (models\, audio\) — outside repo and profile | owner 2026-10-12 |
| Kokoro facts | 600 samples per duration frame on every one of the 500 chunks; tokenizer wraps as `[0, ids, 0]` (one id per phoneme character; identity check on every chunk); kokoro-js truncates at 512 tokens, the harness caps chunks at 400 ids (largest tested 352) | P1 matrix, `summary.json`, S1 2026-10-13 |
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
- **P1 gate** (S1, 2026-10-13 00:51–01:00): `node scripts/narrate-rebuild/p0-summary.mjs` exit 0 — P0-1 PASS, P0-2 PASS, P0-4 PASS, 514/514 checks, factor 600 on all 500 chunks (2 passages × 2 voices × 25 rates), largest chunk 62 words / 352 tokens / 609,000 samples; `--break` exit 1. `p1-gate.ps1` 11/11 PASS (typecheck 0; `npm test` 134 files, 1,955 passed / 1 skipped / 0 failed); `-SelfTest` exit 1 with the deliberate FAIL recorded. Regenerated tables vs the first run: 500/500 chunks identical in audio sha256, phonemes, ids, durations and unit spans; only Emma's "for a" verdict changed (journal S1 00:15, 01:10).
- **P1 merge** (S1, 2026-10-13): `7bbf6b20790c533c6688a71b0d509ad928771364` “Merge eb/narrate-rebuild-1-p1: Producer and harness”, pushed to `main`; `merge-base --is-ancestor` exit 0; first-commit trailer `NARRATE-REBUILD-1-P1-Base: 25ba145d…` on `b03dfec4`.
