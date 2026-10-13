# Phase 0 verdict — NARRATE-REBUILD-1 (Kokoro, exposed-duration export)

Written 2026-10-13 by session S1 of the epic, phase P2 (`eb/narrate-rebuild-1-p2`, base `7bbf6b20`), from the harness under `scripts/narrate-rebuild/` and the records under `docs/studies/narrate-rebuild-1/phase0/`. Rulings R2–R11 and charter choices T1–T7 (ROADMAP § NARRATE-REBUILD-1; charter.md) govern the method; nothing below was measured in-app. Every number is from a committed JSON record named in its section; audio stays outside the repository (`C:\Projects\Blurby-artifacts\narrate-rebuild-1\audio`).

**What was tested.** `onnx-community/Kokoro-82M-v1.0-ONNX` `model_q4.onnx` as pinned in the owner profile (sha256 `04cf570c…`), with its predicted-duration tensor `/encoder/Clip_output_0` exposed as `durations` in a hash-checked copy (sha256 `2eccfc53…`, the OutsideAudit.10 record); kokoro-js 1.2.1 with the repository's patch, transformers 3.8.1, onnxruntime-node 1.24.3, phonemizer 1.2.1 (espeak), Node v24.14.0; voices af_bella (en-us) and bf_emma (en-gb); passages A (165 words, *Meditations* Book 1) and B (122 words, composite with dense punctuation and a section break); rates 0.80–2.00 in 0.05 steps. Host: the owner's machine — Snapdragon X Elite X1E80100 (12 cores, ARM64), Windows 11 10.0.26200, 63.5 GB; CPU execution provider, q4 weights. The addendum of 2026-10-13 (G1 route b) adds the fp32 and fp16 exports of the same model, downloaded with the owner's authorization, on passage A at 1.00x.

**Re-run (pwsh, from the phase worktree root; exact exit codes):**

```
node scripts/narrate-rebuild/p0-summary.mjs             # construction: exit 0
node scripts/narrate-rebuild/p0-summary.mjs --break     # positive control: exit 1
node scripts/narrate-rebuild/p0-acoustic.mjs            # P0-3: exit 1 (this verdict)
node scripts/narrate-rebuild/p0-latency.mjs --threads 4 # P0-5: see its section
node scripts/narrate-rebuild/p0-generate.mjs --dtype fp32 --passages passage-a --rates 1.00  # addendum: exit 0 (then --dtype fp16)
node scripts/narrate-rebuild/p0-acoustic.mjs --dtype fp32 --passages passage-a --rates 1.00  # addendum: exit 1 (then --dtype fp16)
node scripts/narrate-rebuild/p0-precision.mjs           # addendum comparison (report; exit 0)
```

## Summary

| Gate | Result | Classification (R2) |
|------|--------|---------------------|
| P0-1 producer identity | **PASS** both copies | — |
| P0-2 mapping law | **PASS** 500/500 chunks reconciled, both voices | one *harness* repair (identification evidence; no table, span or sample changed) |
| P0-4 rate capability | **PASS** 25 rates × 2 voices × 2 passages | — |
| P0-3 acoustic check | **FAIL** where conclusive (passage A at 0.80x and 1.00x on both voices, 1.40x on Bella); **INCONCLUSIVE** on passage B at every rate, at 2.00x on both passages, and at 1.40x on Emma | FAIL: *engine* — the model's predicted alignment sits late against its own rendered audio by a rate-dependent amount, under a verified P0-1/P0-2 contract; model precision **tried** (§ Addendum: fp32 and fp16 reproduce the error within 1 ms at every paired anchor), thread settings do not touch timing; the charter's bake-off condition is met. INCONCLUSIVE: *reference* coverage, after the two repairs the charter allows → owner (charter escalation trigger) |
| 40 ms negative control | **caught** (best anchor +17 ms → +57 ms) | — |
| P0-5 latency (beside the three parts) | **PASS** at 4 intra-op threads: 160 warm trials all < 2,000 ms (worst 1,940), 20 cold all < 8,000 ms (worst 3,032), generation outpaces playback at 2.00x (RTF 1.39). onnxruntime-node's default thread count **fails** (worst warm 4,507 ms) | thread settings tried (sweep of six); nothing waived |

This verdict does not by itself send the engine to a bake-off. The charter's precondition for one — precision and thread settings tried under a verified contract — is met by the addendum of 2026-10-13 (fp32 and fp16); whether to take it is the owner's choice at G1 (§ Decisions).

## Part (i) — Construction (P0-1, P0-2, P0-4)

Construction evidence is reported here and never counted as acoustic evidence (R2).

- **P0-1.** `identity.json`: 7/7 checks. The pinned model's sha256 equals the OutsideAudit.10 record; the original copy in the artifacts folder is unchanged; the exposed copy's sha256 equals the audit's duration-exposed copy byte for byte; tokenizer and voice files match; the original export lists `waveform` only, the exposed copy lists `durations` beside it.
- **P0-2.** `summary.json` (514/514 checks): on every one of the 500 chunks the exposed tensor is float32 with integer values, one per input id; the input ids are `[0, one id per phoneme character, 0]`; Σ frames × 600 = PCM samples exactly (the single factor on every chunk, so every frame is 25 ms at 24 kHz); the phonemizer's per-segment output, post-processed as kokoro-js does, equals the final phoneme string group for group; and every source word maps to a token span by `MAPPING_POLICY.md` with the identification evidence within its limit. Largest chunk: 62 words, 352 ids, 609,000 samples (passage B, Bella, 0.80x). Coverage of fused runs (words espeak fuses with no boundary mark): passage A 20 of 165 words in 10 runs (12.1 %), passage B 6 of 123 in 3 runs (4.9 %), identical on both voices and at every rate. **No fused run carries a word-boundary mark inside it** (`fusedRunsSplitExact` = 0), so the split option's coverage is zero; the only split-free display of these words is one unit per run.
- **Harness repair (stated per R2).** The first full matrix failed P0-2 on one unit at all 25 rates — Emma's "for a" ~ `fəɹə`, evidence cost 0.84 > 0.5 — because the evidence compared the joined isolated forms (`fɔː`+`eɪ`, losing a syllable at the vowel junction) and British espeak drops the r of isolated "for" that the connected form carries (linking r). The evidence function now counts syllables per word and allows an en-gb linking `ɹ` at no cost (`MAPPING_POLICY.md` §4). The whole matrix was regenerated with the fixed code: all 500 chunks are byte-identical to the first run in audio sha256, phonemes, ids, durations and unit spans; only that unit's verdict changed (journal S1 00:15, 01:10).
- **P0-4.** All 25 rates generated on both voices with the law and the mapping holding; the speed tensor is float32, so rates are compared after `Math.fround`.

## Part (ii) — Acoustic error and uncertainty at independently associated anchors (P0-3)

**Reference, as fixed before measurement and as repaired.** T3: a 1 ms RMS envelope of each chunk's PCM; a pause is a run below 1 % of the passage's peak envelope of at least 60 ms (35 ms at 2.00x); an onset after a pause is the first 1 ms window at 1 % with the 3 % crossing as the second detector; uncertainty = spread + 0.5 ms; a spread above 9.5 ms is unresolved. T4 as written ("pause k ↔ k-th mark") could not be used: Kokoro realizes pauses where there is no mark, skips marks at dense commas, and 60–80 ms stop closures register as pauses. **Repair 1:** pauses of at least 120 ms ÷ rate are aligned monotonically to the pause-making marks of the normalized text with text-only priors (voiced ms per voiced phoneme character against the chunk mean); a pair is resolved only when both adjoining stretches are within 0.3 of the mean in log rate, both spans hold at least 6 voiced characters, and no mark or pause was skipped next to it (every neighbour of a count mismatch is unresolved, T4's own rule). **Repair 2:** word *ends* before pauses were tried as additional anchors to raise coverage and found not to be anchors — the table ends a word 160–570 ms after its energy decays because the pause's frames belong to the preceding phoneme's token — so they are kept as a side report only. Chunk starts (leading silence → first word) are anchors with no association step at all. The table's claim for a word onset is the first frame of its first phoneme character (policy §2); the alternative that assigns the preceding space token's frames to the word ("space rule") is reported beside it.

**Result per run** (`acoustic/<passage>.<voice>.json`, `acoustic-summary.json`; error = table onset − acoustic onset, ms; positive = the table is late):

| Passage / voice / rate | Verdict | Resolved / anchors | Max uncertainty | Worst | Signed mean | p50 \|e\| | \|e\| > 30 |
|---|---|---|---|---|---|---|---|
| A / Bella / 0.80 | FAIL | 16 / 24 | 3.5 | +106 | +64.9 | 61 | 15 |
| A / Bella / 1.00 | FAIL | 22 / 24 | 5.5 | +81 | +45.0 | 43 | 20 |
| A / Bella / 1.40 | FAIL | 15 / 24 | 6.5 | −53 | +15.7 | 38 | 11 |
| A / Bella / 2.00 | INCONCLUSIVE | 8 / 24 | 9.5 | −147 | −55.4 | 53 | 4 |
| A / Emma / 0.80 | FAIL | 10 / 24 | 3.5 | +139 | +85.2 | 84 | 9 |
| A / Emma / 1.00 | FAIL | 10 / 24 | 6.5 | +58 | +44.4 | 46 | 9 |
| A / Emma / 1.40 | INCONCLUSIVE | 8 / 24 | 8.5 | +47 | +1.9 | 23 | 3 |
| A / Emma / 2.00 | INCONCLUSIVE | 8 / 24 | 9.5 | −97 | −39.4 | 55 | 5 |
| B / Bella / 0.80 | INCONCLUSIVE | 8 / 31 | 5.5 | +126 | +88.8 | 77 | 8 |
| B / Bella / 1.00 | INCONCLUSIVE | 8 / 31 | 7.5 | +71 | +46.6 | 48 | 6 |
| B / Bella / 1.40 | INCONCLUSIVE | 6 / 31 | 9.5 | +57 | +10.2 | 43 | 4 |
| B / Bella / 2.00 | INCONCLUSIVE | 4 / 31 | 6.5 | −133 | −40.8 | 90 | 3 |
| B / Emma / 0.80 | INCONCLUSIVE | 6 / 31 | 9.5 | +125 | +83.2 | 86 | 6 |
| B / Emma / 1.00 | INCONCLUSIVE | 7 / 31 | 9.5 | +74 | +50.0 | 61 | 6 |
| B / Emma / 1.40 | INCONCLUSIVE | 2 / 31 | 5.5 | +53 | +30.5 | 53 | 1 |
| B / Emma / 2.00 | INCONCLUSIVE | 5 / 31 | 6.5 | −100 | −66.2 | 50 | 5 |

Every resolved anchor has uncertainty ≤ 9.5 ms (R4's 10 ms holds), so the errors above are measurements, not noise. No conclusive run has its worst error within 30 ms.

**Two components, both systematic.** Splitting the anchors by kind (scratchpad `chunk-start-bias.mjs`, from the same records):

| Rate | Interior anchors (word after a pause), signed mean ms: A/Bella · A/Emma · B/Bella · B/Emma | Chunk-start anchors (first word after the leading silence): A/Bella · A/Emma · B/Bella · B/Emma |
|---|---|---|
| 0.80 | +63 · +62 · +68 · +65 | +81 · +120 · +101 · +101 |
| 1.00 | +47 · +44 · +49 · +62 | +39 · +45 · +45 · +45 |
| 1.40 | +36 · +28 · +50 · +53 | −40 · −24 · −10 · +8 |
| 2.00 | +9 · +15 · +30 · (none) | −119 · −72 · −112 · −66 |

- *Interior onsets:* the table is late by about two native frames divided by the speed (≈ 50 ms ÷ rate: 62 → 50 → 36 → 25 ms predicted; 63–68 → 44–62 → 28–53 → 9–30 measured). The audio starts the word before the alignment says it does, by an amount that scales with the predicted duration.
- *Chunk starts:* the audio's leading silence does not follow the BOS token. The table's lead scales with 1/speed (Bella A: 575 ms at 0.80x, 450–475 at 1.00x, 325 at 1.40x, 225 at 2.00x) while the rendered silence stays at roughly 360–500 ms at every rate (485–504, 410–433, 344–378, 278–372 ms). The first word of every chunk is therefore late in the table at ≤ 1.00x and early at ≥ 1.40x, by up to 147 ms. In the product this is the first word after every Play, resume, click and sentence-group boundary.
- *The space rule does not rescue it:* assigning the preceding space frames to the word centres passage A on Bella at ≤ 1.00x (means −3.9, −2.7 ms) but leaves a ±45 ms spread and swings to −21 and −68 ms at 1.40x and 2.00x, and to +43 / +19 / −17 / −49 ms on Emma. No fixed assignment of the separator frames aligns the table with the audio across rates.

**Why this is not the reference.** The onset detector's two thresholds agree within 9.5 ms at every resolved anchor and the energy rises from below 1 % to 30–80 % of peak within a few milliseconds at the sentence-boundary anchors inspected (journal S1 20:55); chunk-start anchors involve no association at all and show the largest and sign-changing errors; a threshold or association artifact cannot change sign with speaking rate. The same records on a second passage and a second voice reproduce both components. The table itself is proven exact against the model's own output (Part i). What remains is the relation between the model's predicted alignment and the audio its decoder renders from it — an engine property of this export.

**Negative control (R4).** Shifting the best-agreeing anchor's table onset by +40 ms moves its error from +17 to +57 ms and is caught by the 30 ms limit (`acoustic-summary.json` → `control`).

**Classification.** FAIL (five conclusive runs): engine, under a verified P0-1/P0-2 contract. The charter's bake-off condition also asks for model precision and thread settings to have been tried: thread count is a compute setting that cannot move a duration frame; precision was tried after G1 answer 1 (§ Addendum): the fp32 and fp16 exports, with the same edit, reproduce both components within 1 ms, so the error is a property of the model, not of its quantization. INCONCLUSIVE (eleven runs): reference coverage, after two repairs — passage B's dense punctuation is mostly not realized as pauses (12–21 marks per run with no pause at all), and at 2.00x both passages lose their pauses; this is the charter's "inconclusive after two repairs" trigger, which goes to the owner rather than to a third repair.

## Part (iii) — Unresolved interiors

Boundaries the reference cannot anchor, listed by cause per run (`acoustic/<passage>.<voice>.json` → `unresolved`; counts from scratchpad `unresolved-hist.mjs`):

| Cause | Passage A (per voice × rate) | Passage B (per voice × rate) |
|---|---|---|
| Fused-run interior (no pause can exist inside a fused run) | 10 at every rate | 3 at every rate |
| Mark with no realized pause | 0–1 (Bella 0.80–1.40), 6 (Bella 2.00), 6–8 (Emma) | 12–14 at ≤ 1.40x, 19–21 at 2.00x |
| Neighbour of a count mismatch (T4) | 1–3 (Bella ≤ 1.40x), 7 (Bella 2.00; Emma all) | 5–7 |
| Association cost > 0.3 in an adjoining stretch | 1–4 (Bella), 0 (Emma) | 0–4 |
| Onset spread > 9.5 ms | 0–3 | 0–4 |

- **Fused runs.** Passage A's ten runs and passage B's three are the same on both voices at every rate (listed in § Fused units below). None contains a word-boundary mark, so every interior boundary of a fused run is unresolved by construction and the split option has no coverage anywhere (Part i). Under the merged-unit display these interiors do not exist as cursor boundaries.
- **Word ends (side report, never anchors).** Where a pause follows a word, the table's end of that word lies 160–570 ms after the energy decays (means per run +161 to +569 ms, 1–11 per run), because the pause's frames belong to the token of the preceding phoneme. For the cursor this is R6's behaviour (hold the last spoken word through the silence) built into the table; it is reported so no one reads the word-end column as a timing claim.
- **Everything else** (word boundaries inside a phrase with no pause) is unresolved under this reference, as the charter expects; Part (i)'s construction evidence stands beside these rows and is not acoustic evidence.

### Fused units (identical on both voices and at every rate)

Passage A, 10 runs / 20 words: "to be" ×3 (`təbi`), "of the" ×3 (`ʌvðə` / Emma `ɒvðə`), "in the" ×2 (`ɪnðə`, `ɪnðɪ`), "From the" (`fɹʌmðə`), "as is" (`ˌæzˌɪz` / Emma `ˌazˌɪz`). Passage B, 3 runs / 6 words: "in the" (`ɪnðə`), "for a" (`fɚɹə` / Emma `fəɹə`), "than a" (`ðˌænə` / Emma `ðˌanə`). Each run is one token span in the table; its words are identified from isolated phonemes by consonant skeleton and syllable count only (policy §4), never timed from them.

## P0-5 — Latency, one component of the Latency budget (R3; T6, T7)

**Method (T6, T7).** Harness time = request → first voiced PCM sample: `synthesize` (normalization, phonemization, synthesis, duration capture on the production `generate()` path) plus the leading silence before the first 1 ms window whose RMS reaches 1 % of the chunk's peak 1 ms RMS (T6). Request texts were fixed before measurement from passage A (Play: 11 words / 66 ids; resume: 10 words; word click: 8 words; speed change: 11 words generated at the new speed). Warm: 20 trials per request type at 1.00x and at 2.00x after one untimed warm-up per rate; cold: 5 per type, each in a freshly started Node process, model load included. Voice af_bella. Host: Snapdragon X Elite X1E80100, 12 cores, ARM64 Windows 11, 63.5 GB, nothing else running (host busy 35–37 % during the trials). **Thread settings were tried first** with a short sweep (3 warm / 1 cold per type; `latency.sweep.threads-*.json`), worst warm / worst cold totals in ms: onnxruntime-node's default 4,507 / 5,495; 1 thread 3,727 / 4,606; 2 threads 2,414 / 3,073; **4 threads 2,014 / 2,897**; 8 threads 3,062 / 4,630; 12 threads 4,522 / 6,491. The measurement ran at 4 intra-op threads (`--threads 4`).

**Result (`latency.json`, exit 0): PASS.** Every warm trial below 2,000 ms, every cold trial below 8,000 ms, generation outpaces playback at 2.00x. Worst cases, never means, decide; means are shown for scale.

| Request | Rate | Warm trials | Worst total (gen + lead) | Mean total | Cold trials | Worst cold total (load + gen + lead) |
|---|---|---|---|---|---|---|
| Play | 1.00 | 20 | **1,813** (1,380 + 433) | 1,651 | 5 | **2,876** (974 + 1,469 + 433) |
| Play | 2.00 | 20 | 1,079 (713 + 366) | 1,059 | — | — |
| Resume | 1.00 | 20 | **1,855** (1,422 + 433) | 1,648 | 5 | **2,921** (1,139 + 1,349 + 433) |
| Resume | 2.00 | 20 | 1,008 (673 + 335) | 994 | — | — |
| Word click | 1.00 | 20 | **1,580** (1,152 + 427) | 1,451 | 5 | **2,552** (1,003 + 1,123 + 427) |
| Word click | 2.00 | 20 | 888 (601 + 287) | 874 | — | — |
| Speed change | 1.00 | 20 | **1,940** (1,504 + 436) | 1,794 | 5 | **3,032** (1,188 + 1,408 + 436) |
| Speed change | 2.00 | 20 | 1,644 (1,358 + 286) | 1,091 | — | — |

Model load in a fresh process: 694–1,188 ms. Real-time factor from the generation tables (audio seconds per generation second over every chunk at that rate; measured with onnxruntime's default threads while the matrix ran, varying chunk shapes): 1.82 at 0.80x, 1.73 at 1.00x, 1.50 at 1.40x, 1.39 at 2.00x. Per chunk, the smallest 11–12-word chunks at 2.00x fall to 0.92–1.16 (passage B's first chunk on Bella: 2,178 ms to generate 2,000 ms of audio), so with default threads a short chunk at 2.00x does not individually outpace its own playback.

**Observations that bear on the Latency budget (Core acceptance), not on this gate:**

1. onnxruntime-node's default thread count misses the warm budget by more than 2× on this host (worst 4.5 s) and 12 threads is as bad; the product must set the session's intra-op thread count explicitly (4 here), and the right value on other hosts is unknown.
2. The leading silence is 287–436 ms of every total — the engine's leading-silence floor of Part (ii) — 22–27 % of the 2 s budget at 1.00x. Trimming it at playback is exact (the trimmed sample count is known) but does not repair the first word's table claim.
3. The harness repeats one text, so every trial after the first has the model warm for that input shape. With the default thread count the first generation at a new shape took 3.2–4.1 s against 1.7–1.8 s for its repeats (sweep, default and 1 thread); at 4 threads no first-trial penalty appeared (first three Play trials 1.77, 2.01, 1.63 s). Production chunks change shape on every request; the generation tables, where every chunk followed one of a different size, show 2.1–4.4 s for the same 11-word text with default threads. Core acceptance's end-to-end measurement must cover changing shapes at the chosen thread count.
4. Warm totals at 1.00x sit at 1.45–1.94 s, 3–27 % under the budget, before any renderer, IPC, worker-thread or audio-output component is added; P0-5 passing does not pass the budget (D6 measures the total).

**Classification.** PASS; nothing to classify. The failing thread settings are recorded above, not waived.

## Addendum (2026-10-13) — Precision trial, G1 route (b)

**Why.** G1 answer 1 (state.md Decision #8): try model precision before choosing between continuing on Kokoro and the bake-off, because the charter admits a bake-off only once precision and thread settings have been tried under a verified P0-1/P0-2 contract.

**What was done.** With the owner's authorization the fp32 and fp16 exports of the same model were downloaded from `onnx-community/Kokoro-82M-v1.0-ONNX` into the artifacts folder beside the q4 original: `onnx/model.onnx` 325,532,232 bytes, sha256 `8fbea51ea711f2af382e88c833d9e288c6dc82ce5e98421ea61c058ce21a34cb`; `onnx/model_fp16.onnx` 163,234,740 bytes, sha256 `ba4527a874b42b21e35f468c10d326fdff3c7fc8cac1f85e9eb6c0dfc35c334a` — both equal to the Hub's LFS records. Each received the same graph edit as the q4 copy (Decision #4: `f2-producer__expose_dur.cjs`, tensor `/encoder/Clip_output_0`, run from pwsh), declaring the exposed output as float for fp32 (exposed copy 325,532,316 bytes, sha256 `9336bfc9997f011849f68c306814c91c8a8aae60daa6ac0e08c6f8ab49a9c9fa`) and as float16 for fp16, whose graph carries that tensor in half precision (163,234,824 bytes, sha256 `72715098ccf04fda3cb0d3ac5ed8395bbd872629064605403d9fb8675b093065`; declared as float, onnxruntime refuses the session: "Type (tensor(float)) of output arg (durations) of node (expose_durations) does not match expected type (tensor(float16))"). `p0-generate.mjs --dtype fp32|fp16` and `p0-acoustic.mjs --dtype fp32|fp16` run the unchanged harness against them and write `tables-<dtype>/` and `acoustic-<dtype>/` beside the q4 records (audio under `audio\<dtype>\`), at onnxruntime's default thread count as for the q4 tables. Scope, per the answer: passage A at 1.00x on both voices (5 chunks each).

**Construction for the trial copies (P0-1, P0-2).** Both exposed copies list `waveform` and `durations`. On all 10 chunks per precision the ids are identical to q4's, the durations are one integer per id (float32 for fp32, float16 for fp16 — Node 24's `Float16Array` carries them exactly), Σ frames × 600 = PCM samples, and every unit reconciles. The duration tables are not identical to q4's: 6–37 positions per chunk differ by 1–6 frames (chunk totals move by −18 to +9 frames), and the rendered audio moves with them.

**Result** (`acoustic-fp32/`, `acoustic-fp16/`; `p0-precision.mjs`; error = table onset − acoustic onset, ms; q4 rows repeated from Part ii):

| Passage A, 1.00x | Verdict | Resolved | Worst | Signed mean | p50 \|e\| | \|e\| > 30 | Chunk-start mean | Interior mean | Rendered leading silence, 5 chunks (ms) |
|---|---|---|---|---|---|---|---|---|---|
| Bella q4 | FAIL | 22 / 24 | +81 | +45.0 | 43 | 20 | +38.6 | +46.9 | 433 · 421 · 415 · 410 · 428 |
| Bella fp32 | FAIL | 21 / 24 | +73 | +43.6 | 42 | 19 | +38.0 | +45.4 | 434 · 422 · 414 · 410 · 430 |
| Bella fp16 | FAIL | 21 / 24 | +73 | +43.8 | 43 | 19 | +38.0 | +45.6 | 434 · 422 · 415 · 410 · 429 |
| Emma q4 | FAIL | 10 / 24 | +58 | +44.4 | 46 | 9 | +44.8 | +44.0 | 278 · 303 · 307 · 306 · 307 |
| Emma fp32 | FAIL | 11 / 24 | +62 | +43.9 | 44 | 10 | +44.6 | +43.3 | 278 · 303 · 308 · 306 · 307 |
| Emma fp16 | FAIL | 11 / 24 | +63 | +43.9 | 44 | 10 | +44.8 | +43.2 | 278 · 303 · 307 · 306 · 307 |

Anchor by anchor (the same chunk, mark and word resolved under both precisions): 21 common anchors on Bella and 10 on Emma. The error changes by a mean of −0.9 ms (fp32) and −0.8 ms (fp16) on Bella and by −0.4 and −0.5 ms on Emma, within −15…+10 ms at every anchor. Where the table moved (by up to 475 ms at a late word, as frame differences accumulate), the acoustic onset moved with it to within a frame: the relation between the table and the audio is unchanged. The 40 ms control is caught under both precisions (+16 → +56 ms; +15 → +55 ms). Max uncertainty 3.5–9.5 ms.

**Classification.** Both components of the P0-3 failure — interior onsets late by ≈ 2 frames at 1.00x, and a leading silence that does not follow the BOS token — are reproduced by the fp32 and fp16 exports within 1 ms. The failure is a property of the model's learned alignment, not of its quantization. With precision and thread settings tried under a verified contract, the charter's condition for a bake-off is met; taking it is the owner's choice (route (a) or (c)).

**Not done.** Other rates and passage B were not run under fp32/fp16 (the answer scoped the trial to passage A at 1.00x); the q8 and uint8 exports were not tried (less precision than q4's weights is not the question); P0-5 was not re-measured for fp32/fp16 (at default threads generation took 1.0× and 1.4–1.8× the q4 time).

## Decisions for the owner at G1 (charter → Owner gates)

The executor stops here. State.md carries the BLOCKER(USER) with the same questions and an `Answer:` slot each; answers are adopted into state.md's Decision log with their date. **Answered 2026-10-13** (state.md Decision log #8–#11): 1 → (b), done above, the choice between (a) and (c) is re-raised; 2 → one unit per fused run, wording change approved; 3 → `"narrate"`; 4 → R4 as written.

1. **Route.** (a) Continue on Kokoro with this verdict's error profile; (b) authorize the precision trial the charter names before any bake-off — download the fp32 and fp16 exports, expose their duration tensors by the same hash-checked edit, rerun P0-3 on passage A at 1.00x; (c) start the bake-off on `docs/studies/research/tts-engine-scan/SHORTLIST.md`, every engine against these same gates. The executor's reading of the data: the two components are properties of the model's learned alignment, and a different quantization is unlikely to move them, but the charter's condition is unmet until it is tried.
2. **Merged-word display.** The split option has zero coverage (no fused run carries a boundary mark). The choices are therefore one unit per fused run, or an estimated split, which R4/R10 forbid. If one unit is chosen, the owner approves the wording change to F2, F3, R7 and Done-when 3 (word → unit).
3. **The rebuilt mode's id** (`"narrate"` or another).
4. **A measured offset is not on the table unless the owner puts it there.** A fixed correction of the table (e.g. two native frames ÷ rate at interiors, a leading-silence floor at chunk starts) would be measured, not estimated, but it is timing that does not come from the table and the charter forbids it; only an amendment by the owner could admit it.

## Records

- `identity.json`, `summary.json`, `tables/<passage>.<voice>.json` (Part i; P1, merge `7bbf6b20`)
- `acoustic/<passage>.<voice>.json`, `acoustic/acoustic-summary.json` (Parts ii–iii)
- `latency.json` (T7 measurement), `latency.sweep.threads-*.json` (thread sweep) (P0-5)
- `tables-fp32/`, `tables-fp16/`, `acoustic-fp32/`, `acoustic-fp16/` (passage A at 1.00x; Addendum), compared by `scripts/narrate-rebuild/p0-precision.mjs`
- `MAPPING_POLICY.md` (P0-2 policy, with the §4 evidence rules)
- Epic packet: `docs/planning/epics/2026-10-12-narrate-rebuild/` (state.md Evidence, journal S1 entries of 2026-10-12/13)
