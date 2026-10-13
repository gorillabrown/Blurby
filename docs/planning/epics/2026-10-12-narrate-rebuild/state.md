---
epic: narrate-rebuild
last_updated: 2026-10-13 09:10
updated_by: session 1 (S1, P2 waiting at G1 for the route after the precision trial)
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
phase:        P2 — Acoustic check, latency and the verdict (open; branch eb/narrate-rebuild-1-p2, base 7bbf6b20; VERDICT.md and its precision addendum written; WAITING AT G1 for the route)
next_action:  owner answers the route question in Blockers (a or c) → adopt into the Decision log → P2 gate (merge per GIT WORK) → route
blockers:     G1 BLOCKER(USER) route, raised 2026-10-13 09:10 (see Blockers); nothing else
session:      1 of ~14 budgeted
dod:          D1 awaits the route answer (verdict parts i–iii, P0-5 and the precision addendum written; P0-1/P0-2/P0-4 PASS, P0-3 FAIL where conclusive / INCONCLUSIVE elsewhere and unchanged by precision, P0-5 PASS at 4 threads); D13 holds for P1; D2–D12 unmet
```

Verdict (`docs/studies/narrate-rebuild-1/phase0/VERDICT.md`, 2026-10-13): P0-1, P0-2, P0-4 PASS on both voices (500 chunks); P0-3 FAIL where conclusive (passage A at 0.80x/1.00x on both voices, 1.40x on Bella: at interior onsets the table is late by ≈ 50 ms ÷ rate; the first word of every chunk is late at ≤ 1.00x and early at ≥ 1.40x, −147 to +139 ms, because the rendered leading silence of ≈ 360–500 ms does not follow the BOS token) and INCONCLUSIVE elsewhere (passage B at every rate, 2.00x on both passages, 1.40x on Emma) after the two reference repairs the charter allows; the 40 ms control is caught; P0-5 PASS at 4 intra-op threads (worst warm 1,940 ms, worst cold 3,032 ms; default threads fail at 4,507 ms). Classification: P0-3 FAIL = engine property under a verified contract; INCONCLUSIVE = reference coverage → owner. Addendum (2026-10-13, G1 route b): the fp32 and fp16 exports, with the same edit, reproduce the q4 error within 1 ms at every paired anchor on passage A at 1.00x (both voices) — precision is not the cause, and the charter's bake-off condition is met.

## Next actions — max 5, near horizon only

1. [x] P2 opened at `7bbf6b20`; P0-3 run (`phase0/acoustic/`); P0-5 thread sweep and T7 run (`phase0/latency*.json`); VERDICT.md; records and close-out committed on `eb/narrate-rebuild-1-p2`
2. [x] **G1 (owner):** answered 2026-10-13 in session — route (b), one unit per fused run, mode id `"narrate"`, R4 as written → Decision log #8–#11
3. [x] Precision trial on this branch (2026-10-13 08:57–09:05): fp32/fp16 downloaded and hash-checked, durations exposed by Decision #4's edit, `p0-generate.mjs` / `p0-acoustic.mjs --dtype fp32|fp16 --passages passage-a --rates 1.00`, `p0-precision.mjs`; VERDICT.md § Addendum: error unchanged within 1 ms → G1 re-raised for the route
4. [ ] **G1 (owner):** answer the route question in Blockers — (a) continue on Kokoro or (c) bake-off; the next burst adopts it into the Decision log with its date
5. [ ] P2 gate after the route answer: `node scripts/narrate-rebuild/p0-acoustic.mjs` (exit 1, classification recorded in VERDICT.md), `node scripts/narrate-rebuild/p0-latency.mjs --threads 4` (exit 0), VERDICT.md's three parts and addendum present → merge per GIT WORK → plan.md Gate log → (a) open P3 once SETTINGS-WRITE-DURABLE-1 is on `main` (A5), or (c) bake-off per `docs/studies/research/tts-engine-scan/SHORTLIST.md` against these gates, planned by the planner. The staging memo's observations go to the planner's close-out, never folded in from this run

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository | `C:\Projects\Blurby`, remote `origin` (github.com/gorillabrown/Blurby), default `main` | `git remote -v`, scaffold 2026-10-12 |
| Phase branches | `eb/narrate-rebuild-1-p<n>` from `origin/main` at phase open; worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p<n>` | charter Constraints |
| Network | push policy, fetch and push granted for the whole run (`policy.git`: push, networkOperations allow) | registry, scaffold |
| Branches created | P1 `eb/narrate-rebuild-1-p1`, session 1, base `25ba145d21aa6be0fddf96a561fa3d7560b4709e`, merged `7bbf6b20` 2026-10-13. P2 `eb/narrate-rebuild-1-p2`, session 1, base `7bbf6b20790c533c6688a71b0d509ad928771364`; worktree `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p2` | `git worktree add`, S1 |
| Pinned model | `%APPDATA%\Blurby\models\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\model_q4.onnx`, 305,215,966 bytes, outputs only `waveform` — read only. sha256 `04cf570cf9c4153694f76347ed4b9a48c1b59ff1de0999e6605d123966b197c7` = `model-hashes.txt` (A1 holds) | S1 2026-10-12, `sha256sum` |
| Model copies (artifacts) | original copy `…\models\onnx-community\Kokoro-82M-v1.0-ONNX\onnx\model_q4.onnx` sha256 `04cf570c…` (unchanged); exposed copy `…\models\local\kokoro-dur\onnx\model_q4.onnx` 305,216,050 bytes sha256 `2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad` = the audit's exposed copy (A2 holds); tokenizer/config files copied beside both. Precision-trial copies (2026-10-13, owner-authorized download): originals `onnx/model.onnx` sha256 `8fbea51e…` (325,532,232 B) and `onnx/model_fp16.onnx` `ba4527a8…` (163,234,740 B) = Hub LFS oids; exposed `local/kokoro-dur/onnx/model.onnx` `9336bfc9…` (325,532,316 B, durations declared float) and `model_fp16.onnx` `72715098…` (163,234,824 B, declared float16) | S1 2026-10-12, pwsh `Get-FileHash`; S1 2026-10-13 |
| P1 baseline (worktree) | `npm ci` exit 0 (kokoro-js patch applied); `npm run typecheck` exit 0; `npm test` exit 0: 134 files, 1,955 passed / 1 skipped / 0 failed | S1 2026-10-12 |
| Corpus | `tests/fixtures/narrate-rebuild/`: `passage-a.txt` 165 words (Casaubon Book 1 §I + first sentence of §II, from `resources/sample-meditations.epub` sha `8be2ab1e…`), `passage-b.txt` 122 words (composite, blank-line section break), 16 legacy files byte-identical to base `612d03f5…`, `manifest.json`, `README.md` | S1 2026-10-12 (Hercules; sizes checked against `ls-tree -l`) |
| espeak fusion | `phonemizer.phonemize` fuses function words with no boundary mark ("on the"→`ɔnðə`, "to be"→`təbi`, "from the", "in the", "of the"); the API takes only `(text, lang)` | S1 2026-10-12 probe |
| Artifacts folder | `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` (models\, audio\) — outside repo and profile | owner 2026-10-12 |
| Kokoro facts | 600 samples per duration frame on every one of the 500 chunks; tokenizer wraps as `[0, ids, 0]` (one id per phoneme character; identity check on every chunk); kokoro-js truncates at 512 tokens, the harness caps chunks at 400 ids (largest tested 352) | P1 matrix, `summary.json`, S1 2026-10-13 |
| Runtime | Node v24.14.0, npm 11.9.0, kokoro-js 1.2.1 and onnxruntime-node in `node_modules`; `python` (not `python3`, which is the Store alias); no Python onnx module needed | scaffold 2026-10-12 |
| Gotchas from the removal | call `ttsCache.init` before any cache use; nothing at startup starts Kokoro; leftover `"narrate"` literals and `audio-truth` exist — census before relying on absence | NARRATE-REMOVE-1 close-out |

## Blockers

### BLOCKER(USER) — G1, the route after the precision trial (raised 2026-10-13 09:10 by S1). P2 cannot merge and nothing opens until answered.

The precision trial (VERDICT.md § Addendum) is done: the fp32 and fp16 exports, with the same duration-exposing edit, reproduce the q4 error within 1 ms at every paired anchor (passage A at 1.00x, both voices; 21 and 10 anchors; leading silence identical to the millisecond). The failure is the model's alignment, not its quantization, and the charter's bake-off condition (precision and thread settings tried under a verified contract) is met. Choose the route and write it inline; the next burst adopts it.

- **(a) Continue on Kokoro** with this error profile and R4 as written (Decision #11, no correction): the exact table marks each interior word about 45 ms after the audio starts it at 1.00x (≈ 50 ms ÷ rate), and the first word of every chunk up to ≈ 150 ms off at the rate extremes. P3 opens after SETTINGS-WRITE-DURABLE-1 is on `main`.
- **(c) Start the bake-off** on `docs/studies/research/tts-engine-scan/SHORTLIST.md`, every engine against these same gates. plan.md has no bake-off phase, so this goes back to the planner (`/write-plan`, or a charter amendment by the owner) before any engine is run.
   Answer:

### G1, Phase 0 verdict — answered 2026-10-13 (raised 01:35 by S1); kept for the record, adopted as Decision log #8–#11.

Read `docs/studies/narrate-rebuild-1/phase0/VERDICT.md` (Summary, Part ii, § Decisions). In one line: the table is exact and lawful (P0-1/P0-2/P0-4 PASS on 500 chunks), but wherever the reference resolves an anchor the audio starts the word before the table says so by about 50 ms ÷ rate, and the first word of every chunk is off by −147 to +139 ms because the rendered leading silence (≈ 360–500 ms) does not follow the BOS token's scaled duration; passage B and 2.00x are inconclusive after two reference repairs; P0-5 passes at 4 threads and fails at the default. Write each answer inline; the next session adopts it.

1. **Route.** (a) continue on Kokoro with this error profile; (b) precision trial first — authorize downloading the fp32 and fp16 exports, expose their durations by the same hash-checked edit, rerun P0-3 on passage A at 1.00x; (c) start the bake-off on `docs/studies/research/tts-engine-scan/SHORTLIST.md`, every engine against these same gates. Executor's reading: both error components look like properties of the model's learned alignment and a different quantization is unlikely to move them, but the charter's bake-off condition is unmet until precision is tried.
   Answer: **(b) precision trial first** — download of the fp32 and fp16 exports authorized (owner, 2026-10-13, in session). Decision #8. The choice between (a) and (c) returns with the addendum.
2. **Merged-word display.** Split coverage is 0 % (no fused run carries a word-boundary mark; passage A has 10 runs / 20 words, passage B 3 runs / 6 words). One unit per fused run, approving the wording change to F2, F3, R7 and Done-when 3 (word → unit)? Or something else?
   Answer: **one unit per fused run**; the wording change to F2, F3, R7 and Done-when 3 (word → unit) is approved (owner, 2026-10-13). Decision #9.
3. **Mode id.** `"narrate"` (retire the three `normalizeReaderModes` runtime calls) or another id?
   Answer: **`"narrate"`**, retiring the three `normalizeReaderModes` runtime calls (owner, 2026-10-13). Decision #10.
4. **Measured offset.** May a measured model-timing correction (≈ 2 native frames ÷ rate at interior onsets; a leading-silence floor at chunk starts, both with ≤ 10 ms reference uncertainty) be admitted by charter amendment, or does R4's "no estimated timing" keep it out? The executor will not apply one without the amendment.
   Answer: **keep it out — R4 as written**; revisit only after the precision trial, and only by amendment (owner, 2026-10-13). Decision #11.

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-12 | Model copy and audio in `C:\Projects\Blurby-artifacts\narrate-rebuild-1\` | Keeps the owner profile untouched and audio out of the repo | Owner (epic answers) |
| 2 | 2026-10-12 | Merge each phase to `main` at its gate | Small, reviewable landings; later phases build on merged work | Owner (epic answers) |
| 3 | 2026-10-12 | Run as a local session with auto-accept edits | Owner-machine gates (LL-147); no approval stalls | Owner (epic answers) |
| 4 | 2026-10-12 | Expose `/encoder/Clip_output_0` (float, post-round, post-clamp) as `durations` with the audit's `f2-producer__expose_dur.cjs`, run from pwsh | The audit's tensor; the output hash reproduces its record byte for byte, so P0-1's edit is deterministic and hash-checked (R2) | Autonomy: repair/export of the producer |
| 6 | 2026-10-13 | P0-3 reference repairs: (1) T4 pairing is a monotone alignment of pauses ≥ 120 ms ÷ rate to marks on text-only priors, every neighbour of a count mismatch unresolved; (2) word offsets before pauses tried as anchors, found invalid, kept as a side report | The literal pause-k ↔ mark-k rule drifted (pauses without marks, marks without pauses, stop closures); offsets measure the pause token, not the word | Autonomy: repair of the reference (R2); two repairs = the charter's limit before the owner |
| 7 | 2026-10-13 | P0-5's T7 measurement runs at 4 intra-op threads after a sweep of default/1/2/4/8/12 | the charter asks for thread settings tried; 4 was best (worst warm 2,014 ms in the sweep), the default worst (4,507 ms) | Autonomy: harness structure |
| 5 | 2026-10-12 | Artifacts layout mirrors the audit's: `models\onnx-community\…` (original copy) and `models\local\kokoro-dur\…` (exposed copy), both outside the repo and the profile | Lets `KokoroTTS.from_pretrained("local/kokoro-dur")` load offline with `localModelPath` | Autonomy: harness structure |
| 8 | 2026-10-13 | G1 route: **(b) precision trial** before choosing between continuing on Kokoro (a) and the bake-off (c) — the fp32 and fp16 exports are downloaded (owner-authorized) beside the q4 original, their durations exposed by Decision #4's edit, P0-3 rerun on passage A at 1.00x, and VERDICT.md gets an addendum. The trial runs on the open P2 branch so one merge carries the complete verdict (GIT WORK names only phase branches) | The charter's bake-off condition needs precision tried; the two error components are expected to be model properties, which the trial settles either way | Owner (G1 answer 1, 2026-10-13) |
| 9 | 2026-10-13 | Merged-word display: one unit per fused run; the wording change word → unit in F2, F3, R7 and Done-when 3 is approved. charter.md is edited by the owner or the planner, never by the executor | Split coverage is 0 %; any split would be estimated timing (R4, R10) | Owner (G1 answer 2, 2026-10-13) |
| 10 | 2026-10-13 | Mode id `"narrate"`; P4 retires the three `normalizeReaderModes` runtime calls with a settings-schema step so a saved `narrate` survives | The id the product already had; the v13 narrate → flow normalization must not swallow the new mode | Owner (G1 answer 3, 2026-10-13) |
| 11 | 2026-10-13 | No measured timing correction: R4 stands as written, the cursor uses the model's table only; revisit after the precision trial, by charter amendment only | A correction would be timing that does not come from the table | Owner (G1 answer 4, 2026-10-13) |

## Evidence

- **A1** (S1, 2026-10-12): `sha256sum` of the pinned model = `04cf570cf9c4153694f76347ed4b9a48c1b59ff1de0999e6605d123966b197c7`; tokenizer.json `77a02c8e…`, tokenizer_config.json `be1cb066…`, config.json `df34b4f9…`, all equal to `remediation/d4-evidence/units/run-config.txt`.
- **A2** (S1, 2026-10-12): exposed copy sha256 `2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad` (305,216,050 bytes) = `model-hashes.txt`'s duration-exposed copy; original copy unchanged at `04cf570c…`.
- **P1 baseline** (S1): typecheck exit 0; `npm test` 134 files, 1,955 passed / 1 skipped / 0 failed.
- **P1 gate** (S1, 2026-10-13 00:51–01:00): `node scripts/narrate-rebuild/p0-summary.mjs` exit 0 — P0-1 PASS, P0-2 PASS, P0-4 PASS, 514/514 checks, factor 600 on all 500 chunks (2 passages × 2 voices × 25 rates), largest chunk 62 words / 352 tokens / 609,000 samples; `--break` exit 1. `p1-gate.ps1` 11/11 PASS (typecheck 0; `npm test` 134 files, 1,955 passed / 1 skipped / 0 failed); `-SelfTest` exit 1 with the deliberate FAIL recorded. Regenerated tables vs the first run: 500/500 chunks identical in audio sha256, phonemes, ids, durations and unit spans; only Emma's "for a" verdict changed (journal S1 00:15, 01:10).
- **P1 merge** (S1, 2026-10-13): `7bbf6b20790c533c6688a71b0d509ad928771364` “Merge eb/narrate-rebuild-1-p1: Producer and harness”, pushed to `main`; `merge-base --is-ancestor` exit 0; first-commit trailer `NARRATE-REBUILD-1-P1-Base: 25ba145d…` on `b03dfec4`.
- **P0-3** (S1, 2026-10-13 00:56): `node scripts/narrate-rebuild/p0-acoustic.mjs` exit 1 over 16 runs — FAIL A/Bella 0.80 (16/24 resolved, worst +106, mean +64.9), A/Bella 1.00 (22/24, +81, +45.0), A/Bella 1.40 (15/24, −53, +15.7), A/Emma 0.80 (10/24, +139, +85.2), A/Emma 1.00 (10/24, +58, +44.4); INCONCLUSIVE the other eleven (2–8 resolved of 24/31); every uncertainty ≤ 9.5 ms; control +17 → +57 ms caught. Records `phase0/acoustic/*.json`; table in VERDICT.md Part ii.
- **P0-5** (S1, 2026-10-13 01:12): `node scripts/narrate-rebuild/p0-latency.mjs --threads 4` exit 0 — 160 warm trials all < 2,000 ms (worst 1,940, speed change at 1.00x), 20 cold all < 8,000 ms (worst 3,032), RTF 1.82/1.73/1.50/1.39 at 0.80/1.00/1.40/2.00x; sweep `latency.sweep.threads-*.json` (default 4,507 / 5,495 worst warm/cold; 1: 3,727 / 4,606; 2: 2,414 / 3,073; 4: 2,014 / 2,897; 8: 3,062 / 4,630; 12: 4,522 / 6,491).
- **Precision trial** (S1, 2026-10-13 08:57–09:05; G1 route b): download sha256 = Hub LFS oids (`8fbea51e…` fp32, `ba4527a8…` fp16); exposed copies `9336bfc9…` (fp32, output declared float) and `72715098…` (fp16, declared float16 — onnxruntime refuses the float declaration at session creation). `p0-generate.mjs --dtype fp32|fp16 --passages passage-a --rates 1.00` exit 0 each: 10 chunks per precision, ids identical to q4, law ×600, all reconciled, durations differing from q4 at 6–37 positions per chunk by 1–6 frames. `p0-acoustic.mjs --dtype fp32|fp16 --passages passage-a --rates 1.00` exit 1 each — A/Bella FAIL 21/24 resolved, worst +73, mean +43.6 (fp32) / +43.8 (fp16) against q4's +45.0; A/Emma FAIL 11/24, worst +62 / +63, mean +43.9 against +44.4; paired anchors (21 Bella, 10 Emma) change by −0.9 / −0.8 and −0.4 / −0.5 ms, range −15…+10; control caught (+16 → +56, +15 → +55). Records `phase0/tables-fp32`, `tables-fp16`, `acoustic-fp32`, `acoustic-fp16`; comparison `scripts/narrate-rebuild/p0-precision.mjs`.
