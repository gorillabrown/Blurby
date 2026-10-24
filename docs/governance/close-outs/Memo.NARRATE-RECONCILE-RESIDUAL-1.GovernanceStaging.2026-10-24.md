# Sprint Close-Out Governance Staging — NARRATE-RECONCILE-RESIDUAL-1

Branch `eb/narrate-reconcile-residual-1`, cut from `origin/main` @ `28ec48e2`; `origin/main` @ `b00287d7` merged in (docs only) before the package build. Build-and-hold under the Stage 8 freeze: pushed, not merged. No register or governance-document writes (worktree dispatch; every change below is a fold-in for the planner).

## Evidence

- **Done-when 1 (base, no code change).** Record: `docs/studies/investigations/NARRATE-RECONCILE-RESIDUAL-1.base.2026-10-24.md`. Base owner sweep on the P6b book set: exit 0, `D:ruled` at word 12529 in `dab1d9d7`, `58ed7188`, `3c6f42b3`; with `RULED_RESIDUALS` emptied in a scratch copy, exit 1 (3 `other`). Probe: isolated cost 0.667, **phrase cost 0.000** (also 0.000 at the three wider windows). Decision gate passed.
- **Done-when 2 (sweep extensions), `c5d6e0f9`.** `--base <sha>`; `--changed --owner <dir>` with no text in owner output. Unchanged tree: `--changed --base 28ec48e2` exit 0 (0 changed, 0 newly failing); with `--break` exit 1.
- **Done-when 3 (red first), `85a7e68a`.** `tests/narrate/narrate.reconcileResidual.test.js` alone. On the base: r1 fails by assertion with exactly `fused unit evidence cost 0.67 > 0.5: Ab Chy ~ æbtʃˈaɪ`; r2 and r3 pass. **r4 found an analog (`6c045f89`):** "La Jolla" through real espeak fails closed on the base (`fused unit evidence cost 1.09 > 0.5: La Jolla ~ lɐhˈɔɪə`, en-us and en-gb); the case is added to `tests/narrate/narrate.reconcile.test.js` and is red on the base, green after.
- **Done-when 4 (the change), `415fcba3`.** `main/narrate/wordmap.js` only: `align(…, phrase)`, a second pass for a segment whose first plan has a non-diagonal unit over 0.5, `evidence` on every unit and `phrase` when it won. `git diff 28ec48e2 -- main/narrate/wordmap.js`: no removed line contains `ACCEPT_UNIT_COST`, `SYLLABLE_WEIGHT`, `failures.push` or `const relCost`. `RULED_RESIDUALS` is now empty; MAPPING_POLICY.md §4 gains the rule and names `evidence` and `phrase`.
- **Done-when 5 (final tree `415fcba3`; records `docs/studies/narrate-rebuild-1/phase6/residual-*.txt`, stderr 0 bytes each).** `--gate` exit 0 (0 of 3,683). `--gate --control` exit 1. `--owner` (P6b set + one extra copy, 9 books) exit 0: `21 fail-closed chunks of 13593 in 9 books; 21 class E, 0 ruled residual, 0 other`. The class E count equals the base's 21 on the same copy (P6b's own copy had 18 in 8 books; the ninth book, `3c29f90d`, adds 3). `--check-tokenizer` exits 2 here ("artifacts copy missing": `C:ProjectsBlurby-artifacts
arrate-rebuild-1modelslocalkokoro-dur	okenizer.json` is absent on this machine), so its exit-0 row is **handed to Blurby.Brain** on the quiet machine: `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/reconcile-sweep.mjs --check-tokenizer`. Checked by hand instead: sha256 of the committed fixture, of the profile's `local/kokoro-dur/tokenizer.json` and `TOKENIZER_SHA256` are all `77a02c8e…60a34`. Nothing this item changes touches the tokenizer.
- **Done-when 6 (no passing table changes).** `--changed --base 28ec48e2` exit 0 (0 changed, 0 newly failing); `--break` exit 1; `--changed --base 28ec48e2 --owner <9 books>` exit 0 (0 changed, 0 newly failing). Beyond the spec: the whole library (111 epubs, 578,107 chunks, base vs final, chunk by chunk): **0 chunks newly fail or change class; 26 class D chunks that failed on the base now reconcile.** 117 class D and 3 `Z:unreconciled` chunks remain in other books, as on the base (see Follow-ups).
- **Done-when 7 (real model, run on this machine).** The profile's `local/kokoro-dur` copy was hash-checked (`model_q4.onnx` sha256 `2eccfc53…b95cad` = `NARRATE_EXPOSED_MODEL_SHA256`), copied to scratch and used as `NARRATE_MODELS_ROOT`. Probe `--real` on the residual chunk through `synthesize → buildWordMap → mapUnitsToSourceWords → verifyTable`: exit 0, `verifyTable` `{ ok: true }`, `provenance.source` `model-output`, frames 189–212, samples 113400–127200; `lookupUnit` returns the fused unit's index (9) at `sampleStart`, midpoint and `sampleEnd−1`, and 8 at `sampleStart−1`. Record `residual-real-model.txt`. Blurby.Brain may re-run it on the quiet machine; command in the probe's header.
- **Done-when 8.** `npx vitest run tests/narrate`: 22 files, all green, existing tests unedited except the appended r4 case. `npm test` exit 0 (182 files, 2,455 passed, 2 skipped, 0 failed); `npm run typecheck` exit 0; `npm run build` exit 0.
- **Done-when 10 (fence).** `git diff --name-status origin/main` lists exactly: `M main/narrate/wordmap.js`, `M scripts/narrate-rebuild/reconcile-sweep.mjs`, `M …/MAPPING_POLICY.md`, `A tests/narrate/narrate.reconcileResidual.test.js`, `M tests/narrate/narrate.reconcile.test.js` (r4), `A` the probe `.txt` and the base record, `A` `residual-*.txt` (7 files), this memo, the time log. Nothing in `src/`, `preload.js`, other `main/narrate/` files or the shared-core set. No owner-book text is committed: the two name words appear in no committed file.

## Package verification (standing rule 53; for Blurby.Brain)

Final commit plus `origin/main` merged (docs only).
- (a) Built `npx electron-builder --win --dir --arm64` (exit 0, `release\win-arm64-unpacked`) and `--dir --x64` (exit 0, `release\win-unpacked`; this machine is x64, so the native-arch launch uses it).
- (b) `main.js` in both `app.asar` files contains `BLURBY_USER_DATA_DIR` (3 hits each; source line 29 sets `userData` from it).
- (c) Launched `release\win-unpacked\Blurby.exe` natively for 25 s on a scratch profile (`BLURBY_USER_DATA_DIR`): still running at 25 s, no crash, no dump or `.dmp`, no error/rejection line except one stderr line, `Backup failed for …\launch-profile\blurby-data\library.json: ENOENT … library.json.bak` — the fresh-profile first-run backup of a library file that does not exist yet. stdout: `[ws-server] Listening`. The live profile's `library.json` hash and `error.log` mtime were identical before and after (profile proved untouched, LL-165). I did not launch a base package to show the line is pre-existing; this change touches only `main/narrate/wordmap.js`, which launch never loads.
- (d) `app.asar` carries `main\narrate\wordmap.js` byte-identical to the tree (extracted from the scratchpad) in both builds, and it contains the phrase-evidence code.
- (e) The automatable Done-when on the packaged exe: the packaged build ships the same file; the sweeps and the real-model row are not run inside the packaged exe (they are scripts under `app-node.ps1`, the app's own Electron). The packaged check that remains is the human one below.

## Owner listening check (add to release gate (2)'s list; standing rule 45)

In the owner's book (the private note names it), start Narrate a sentence before word 12529 on the packaged build. Pass when: it plays through with no "This passage couldn't be timed" notice; both words of the name are highlighted together while the name is heard, and not before; the highlight moves to the next word as the name ends. Not run: it needs a human ear and eye.

## Follow-ups (not fixed here; for the planner)

1. **The whole library has 117 class D and 3 `Z:unreconciled` chunks the base also fails closed on** (base 143 D; this item resolves 26). They are in books outside P6b's sweep, so the library-wide `--owner` sweep exits 1 on base and after. Worth a diagnosis item (Aristotle-style): sample the shapes first; some may be the same fused-name effect with other cost terms, some may be different.
2. The three ruled chunks' book (`dab1d9d7` and copies) exists only as converted epubs in `blurby-data\converted\converted`; `library.json` no longer lists them.
3. Merge order: before NARRATE-TOKEN-CAP-1, NARRATE-SENTENCE-RESUME-1, NARRATE-SENTENCE-INITIALS-1 and NARRATE-YEARS-1 (the spec's recommendation); whichever merges later re-runs Done-when 5's owner sweep on the combined tree.
4. Cost note: the second pass adds at most 3·W espeak calls for a failing segment and none elsewhere. The owner sweep over 111 books took 5,475 s on 6 parallel shards.

## Fold-ins

### Fold-in 1 — ROADMAP.md, NARRATE-RECONCILE-RESIDUAL-1
Section: §NARRATE-RECONCILE-RESIDUAL-1
Action: Insert after (status line)
Content: `✅ COMPLETED 2026-10-24 (built and held under the Stage 8 freeze): branch eb/narrate-reconcile-residual-1, tip per the push record; r4 analog found ("La Jolla"); Done-when 11 (owner listening check) goes to gate (2).`

### Fold-in 2 — CLAUDE.md, active guardrails / operational state
Section: Current operational state
Action: Append row
Content: The word map identifies a fused unit by its isolated forms, and, as a second pass only, by its own words read together (`evidence`: `isolated`, `spelled` or `phrase`); `RULED_RESIDUALS` is empty. A fused unit's phrase form decides which words the group holds and never supplies a span.
