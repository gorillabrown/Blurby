# NARRATE-RECONCILE-RESIDUAL-1 — base measurement (no code change), 2026-10-24

Base: `origin/main` @ `28ec48e2` (wordmap.js, normalize.js and reconcile-sweep.mjs unchanged since P6b). No chunk text, word or phoneme form of the owner's books is recorded here; `git grep` of the two name words over this file is empty.

## 1. The residual reproduces

Owner copies: every `.epub` named in the live profile's `library.json` (111 files, 536 MB) copied read-only into the scratchpad. The three copies of the 16,718-word book exist only as converted epubs (`blurby-data\converted\converted`), which `library.json` no longer lists; they were copied from there into a 9-book set (`owner-p6b`: P6b's 8 books by sha256(file name)[0:8], plus `3c29f90d`). P6b's 8 book ids all match.

| Command (via `app-node.ps1`) | Exit | Result |
|---|---|---|
| `reconcile-sweep.mjs --owner owner-p6b` (base) | 0 | `OWNER: 24 fail-closed chunks of 13593 in 9 books; 21 class E, 3 ruled residual, 0 other`; `D:ruled` at word 12529 in each of `dab1d9d7`, `58ed7188`, `3c6f42b3` |
| same, `RULED_RESIDUALS` emptied in a scratch copy of the script only | 1 | the same 3 chunks counted `other` (`24 … 21 class E, 0 ruled residual, 3 other`): the gate can fail (LL-151) |

(P6b's copy had 18 class E in 8 books; this copy has 21 because `3c29f90d`, a ninth book, adds 3.)

## 2. Probe on the chunk (`sha256(text)[0:16] = 4e7915ce2410e10e`; probe stub-model mode, base tree)

Book `dab1d9d7`, chunk starts at word 12529, 28 words, one failure: the fused unit over the limit.

| Field | Value |
|---|---|
| unit kind, words k, groups | fused, 2, 1 |
| isolated evidence: consonants evidence / group | 2 / 3 |
| isolated evidence: edit distance, operations | 2: `+t, k→ʃ` |
| isolated evidence: syllable difference | 0 |
| isolated evidence: cost | 0.667 (limit 0.5) |
| phrase evidence (the unit's own words read together): consonants, edit distance, ops, syllable difference, cost | 3 / 3, 0, none, 0, **0.000** |
| phrase evidence, window one word wider left (k 3) | cost 0.000 |
| phrase evidence, window one word wider right (k 3) | cost 0.000 |
| phrase evidence, one wider on both sides (k 4) | cost 0.000 |

**Decision gate: phrase cost 0.000 ≤ 0.5 → pass; the item continues.** The planner's description (second word `k` alone, `tʃ` together) matches: the phrase and the group agree consonant for consonant.

## 3. Context: the whole library (extra, outside this item's Done-when)

The same sweep over all 111 `.epub` files of the live library (6 shards of about equal size), run on the base tree and again on the final tree, compared chunk by chunk (book id, class, word position):

| | chunks | class E (token cap) | class D | `Z:unreconciled` |
|---|---|---|---|---|
| base `28ec48e2` | 578,107 | 1,719 | 143 | 3 |
| final tree | 578,107 | 1,719 | 117 | 3 |

0 chunks newly fail or change class; 26 class D chunks no longer fail. 117 class D and 3 `Z:unreconciled` chunks (all in books outside P6b's eight) still fail closed, as they did on the base: the library-wide owner sweep still exits 1 and is not this item's gate (Done-when 5 uses the P6b book set). The residual chunk's book is no longer in `library.json`, so it is not among these counts. Wall time 5,475 s on 6 parallel shards (P6b: 462 s for 8 books on one process).
