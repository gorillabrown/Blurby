---
epic: narrate-rebuild
charter: charter.md
---

# Phase Plan — Rebuild Narrate with the cursor attached to the playing word

<!-- The route, not the contract. The executor may reshape phases as reality teaches —
     log the replan in state.md → Decision log and journal.md. Exit gates may tighten,
     never loosen. Plan at phase altitude: intents and gates here; steps live inside the
     run. At every exit gate: re-read charter.md before opening the next phase. -->

Every phase runs on its own branch `eb/narrate-rebuild-1-p<n>` cut from `origin/main` when it opens, and lands through one `--no-ff` merge when its gate passes (charter → Constraints, launch.md → GIT WORK). Phase 0 of the ROADMAP entry is P1 + P2 here; its ~2-working-day limit spans both.

## Phases

### P1 — Producer and harness (ROADMAP Phase 0: P0-1, P0-2, P0-4)
- **Intent:** verify assumptions A1–A3; copy the pinned model into `C:\Projects\Blurby-artifacts\narrate-rebuild-1\models\` and expose its predicted-duration tensor there; build the offline Node harness under `scripts/narrate-rebuild/`; recover the Phase 0 corpus (T1 passage A from *Meditations* Book 1, passage B composite of the old fixtures, from `612d03f5…:tests/fixtures/narration/`) into `tests/fixtures/narrate-rebuild/`; prove token identity and the units law (frames × 600 = PCM samples) for every chunk at all 25 rates on af_bella and bf_emma; write the mapping policy (merged words, no proportional split). Every check script is first shown to record a failure (LL-151). Baseline the DoD commands in the phase worktree.
- **Exit gate:** `node scripts/narrate-rebuild/<p0 summary script>` (named in state.md when written) exits 0 and reports P0-1, P0-2 and P0-4 PASS for both voices, the hashes match the OutsideAudit.10 record, and a deliberately broken table makes the same script exit non-zero. Merged to `main` per GIT WORK.
- **Rough size:** 2–3 sessions.

### P2 — Acoustic check, latency and the verdict (P0-3, P0-5) → owner gate G1
- **Intent:** resolve anchors independently of the table (T3 onset detector, T4 pause-mark association, T5 ≥10 anchors per passage per rate, rates 0.80/1.00/1.40/2.00) with the 40 ms negative control; run the P0-5 latency harness on Bella (T6 voiced threshold, T7 trials); write `docs/studies/narrate-rebuild-1/phase0/VERDICT.md` in its three parts with each failure classified (R2). Then stop at **G1** with a BLOCKER(USER): continue on Kokoro or bake-off; merged-word display; the mode id.
- **Exit gate:** VERDICT.md exists with all three parts, the 40 ms control is detected, the harness summary exits 0 on PASS (or the failure classification is recorded), and the owner's G1 answers are adopted into state.md's Decision log. Merged to `main`.
- **Rough size:** 2–3 sessions plus the owner's G1 wait.

### P3 — Core engine (exact table, provenance, fail-closed, one sample clock)
- **Intent:** the new runtime's engine under `src/reader/modes/<id>/` and its main-process producer: generation per chunk with provenance from the model's actual output, the exact word table, no stretching, fresh audio only (R10), raw PCM scheduled on one `AudioContext` clock, cursor = table lookup at the current playback sample; F4 fail-closed paths; the structural no-estimate test and negative controls (D4); R6 silence hold. Opens only after G1 and, before any durable write, SETTINGS-WRITE-DURABLE-1 on `main` (A5).
- **Exit gate:** the named D4 and D5-engine suites exit 0, each negative control seen failing first; `npm run typecheck` exits 0. Merged to `main`.
- **Rough size:** 3–4 sessions.

### P4 — The mode (router, bottom bar, preload surface, F4/F5 UI, settings)
- **Intent:** register the fourth runtime behind the thin router (A5), the bottom bar entry, the minimal preload surface, the voice-loading state (F5) and pause notice (F4); retire or keep `normalizeReaderModes` per G1's mode id and rewrite (never delete) NARRATE-REMOVE-1's absence gates (D8, D9). Import census and selector census before moving or deleting anything (LL-139, LL-150).
- **Exit gate:** D7's tests, D8's boundary suites with the three baselines byte-identical, D9's rewritten settings tests, and `npm test` / `npm run build` exit 0 in the phase worktree. Merged to `main`.
- **Rough size:** 2–3 sessions.

### P5 — Speed, crossings, latency end to end, recorded output
- **Intent:** speed 0.80–2.00 in 0.05 steps generated at speed (R7: finish the word, new speed at the next word, coalescing, stated stale-job bound); section and chapter crossings (F2's Introduction → "HIS FIRST BOOK"); the in-app recorded-output log and its check script (D3); the end-to-end latency script (D6); D5's overlap/drop/repeat analysis.
- **Exit gate:** D3, D5 and D6 scripts exit 0 on the owner's machine over the stated sessions; the D10 grep exits 1. Merged to `main`.
- **Rough size:** 2–3 sessions.

### P6 — Owner gate G2 and completion
- **Intent:** production build for the owner; stop at **G2** for the listening sign-off (D12) and the owner-observed rows (D2, D7 F5); then re-run every DoD row fresh in one session and execute launch.md → Completion protocol.
- **Exit gate:** all D1–D15 pass with fresh evidence in state.md (D14 and D15 added by the 2026-10-15 amendment; P6b below runs first); done.md written and merged as the docs-only record.
- **Rough size:** 1–2 sessions plus the owner's G2 wait.

### P6b — Reconciliation fix, app-ICU tooling, then D3/D5 and D2 re-run (inside P6; Blurby.Brain rulings 2026-10-15, Decision #23)

- **Intent:** fix the text-side reconciliation defects behind the D2 stall at app word 3217. The producer failed closed (F4 `unreconciled`) on a chunk ending in a closing quote. The same causes affect 112 of Meditations' 3,588 planned chunks, and they let 36 wrong tables through unchecked.
  - Fixes F1–F5 go in `main/narrate/normalize.js` and `main/narrate/wordmap.js`.
  - `chunkPlan.ts` gets an abbreviation-aware sentence end.
  - A committed reconciliation sweep becomes the gate.
  - Every epic checker runs under the app's own Electron ICU and refuses plain Node.
  - Then D3/D5 re-run in Brain's quiet window, and D2 runs from app word 2970 "ancient" through 5480 "HIS FIRST BOOK" plus at least 2 minutes, checked by text.
  - Nothing in timing, scheduling, the engine's lookup, the producer's capture or the model changes. Every table is still the model's exact durations. F1–F5 change only which words are identified with which phoneme groups, and every decision still fails closed when its evidence costs more than 0.5.
- **Branch:** P6b commits on `eb/narrate-rebuild-1-p6` in the P6 worktree. It gets no new phase branch and no new base trailer: P6 is unmerged, and its one `--no-ff` merge (D13) carries P6b. The P6b start sha is the branch tip when wave A opens (the packet-amendment commit). Record it in state.md; the fence check diffs against it.
- **Exit gate:**
  - Wave A: every command in "Gate commands" exits with its stated code.
  - Wave B: the D3/D5 sessions pass the launcher and the recorded-output check. The D2 session passes the text-checked D2 checker.
  - Then the P6 completion protocol resumes (launch.md), with charter rows D1–D15 as amended 2026-10-15.
- **Rough size:**
  - Wave A: 1 session of about 25–30 tool uses. Machine time is about 17 minutes of text-only sweeps, plus the suite and build.
  - Wave B: one quiet window of about 45 minutes.
- **Reference tree:** the final versions of the product edits, scripts and tests were validated under the app's Electron on 2026-10-15. They are in the planning session's scratchpad: `C:\Users\estra\AppData\Local\Temp\claude\C--Projects-Blurby\bbe4b04a-f097-4f3e-ba25-221d3dcf13e9\scratchpad\p6b\` (`mirror\` at repo paths; `drafts\tests\narrate\`; `diffs.patch` against `2b78f1ca`). Copy from there while it exists. The spec below is sufficient without it.

#### WHERE — read order

1. charter.md (DoD, amended 2026-10-15), this phase, state.md, the journal entries for S5 and 2026-10-15.
2. `docs/governance/LESSONS_LEARNED.md`:
   - LL-136: the time-log exemption.
   - LL-138 / standing rule 43: positive controls first.
   - LL-142.
   - LL-143 / rule 44: exact exit codes in pwsh.
   - LL-151: every recorder shown to fail.
   - LL-153: no register writes.
3. `docs/studies/narrate-rebuild-1/phase0/MAPPING_POLICY.md`: the policy that F1–F5 amend.
4. `main/narrate/normalize.js`, `main/narrate/wordmap.js`; read only: `main/narrate/capture.js` and `main/narrate/producer-worker.js:92-130`, which the sweep mirrors.
5. `src/reader/modes/narrate/engine/chunkPlan.ts`, `src/constants.ts:35,42`; read only: `src/reader/modes/narrate/ModeRuntime.ts:213-219,649-657`.
6. `scripts/narrate-rebuild/d2-crossing-check.cjs`, `p5-latency-e2e.mjs:16-42,61,89-96`, `p5-recorded-output-check.mjs:148-150`, `p0-acoustic.mjs:230`, `main/narrate/trial.js:229-241`.
7. `tests/narrate/narrate.mode.test.ts:1-98`, `narrate.normalize.test.js`, `narrate.wordmap.test.js`.

#### Product edits (exact; base `2b78f1ca`, files unchanged by the 2026-10-15 merge of main)

**`main/narrate/normalize.js`**
- `:61`, F1. Before: `const wordsOf = (pieces) => pieces.flatMap((s) => s.trim().split(/\s+/).filter(Boolean));`. After:
  ```js
  // A token of apostrophes only is phonemized to nothing (no phoneme, no id, no frame): kokoro maps ‘ and ’ to ', which is
  // not in its punctuation set, so a closing quote after a stop ("heart.'") reaches espeak as a word of its own (P6b F1).
  const isSilentToken = (w) => /^'+$/.test(w);
  const wordsOf = (pieces) => pieces.flatMap((s) => s.trim().split(/\s+/).filter((w) => w && !isSilentToken(w)));
  ```
- `:64-74`, F2: `spokenCounts` becomes a real per-word count.
  ```js
  /**
   * How many spoken (normalized, punctuation-free) words each source word becomes, each normalized on its own: none for
   * punctuation or a closing quote, two for an em-dash join ("word—word"), several for a year or an amount (P6b F2).
   * The caller checks the sum against the spoken words of the whole chunk, so a context-dependent rule fails closed.
   */
  function spokenCounts(sourceWords) {
    return sourceWords.map((w) => spokenWordsOf(w).length);
  }
  ```
  `tests/narrate/narrate.normalize.test.js:43` (`[1, 1, 0, 2, 3, 2, 1, 1]`) still holds.
- `:137`: add `isSilentToken` to `module.exports`.

**`main/narrate/wordmap.js`**
- `:44-46` comment: "a linking r (en-gb "for a" carries an r that "for" alone, non-rhotic, has not; en-us "our own" carries ɹ after the r-coloured vowel of "our" alone)".
- `:58` comment tail: "A linking r is free in both languages (P6b F4)."
- `:63`, F4: `lev(A, B, lang === "b" ? LINKING_R : null)` becomes `lev(A, B, LINKING_R)`. Keep the `lang` parameter.
- `:67`, F3: replace the `MAX_FUSE` line with:
  ```js
  const MAX_FUSE = 4; // at most 4 source words in one group
  const MIN_SPLIT = 3; // one word may span max(3, its own isolated group count) groups (P6b F3)
  const { isSilentToken } = require("./normalize");
  ```
- `:69-71`, F3/F5: the new signature, with helpers before `const INF`:
  ```js
  // isoGroups[i]: word i's isolated phoneme groups, the evidence (syllables counted per group, P6b F3); spelled[i]: the
  // groups of an all-caps word read letter by letter, a second piece of evidence for a one-word unit, or null (P6b F5).
  function align(isoGroups, spelled, groupForms, lang) {
    const W = isoGroups.length, G = groupForms.length;
    const forms = (i, k) => isoGroups.slice(i, i + k).flat();
    const maxSplit = (i) => Math.max(MIN_SPLIT, isoGroups[i].length, spelled[i]?.length ?? 0);
    const cost = (i, k, gs) => {
      const c = relCost(forms(i, k), gs, lang);
      return k === 1 && spelled[i] ? Math.min(c, relCost(spelled[i], gs, lang)) : c;
    };
  ```
- `:79`: `relCost(wordForms.slice(i, i + k), [groupForms[j]], lang)` becomes `cost(i, k, [groupForms[j]])`.
- `:83-84`: `for (let g = 2; g <= 3 && i + 1 <= W && j + g <= G; g++)` becomes `for (let g = 2; i + 1 <= W && g <= maxSplit(i) && j + g <= G; g++)`, and `relCost([wordForms[i]], groupForms.slice(j, j + g), lang)` becomes `cost(i, 1, groupForms.slice(j, j + g))`.
- `:127`, F1: `.filter(Boolean)` becomes `.filter((w) => w && !isSilentToken(w)); // P6b F1`.
- `:140-141`, F3/F5: replace the two `iso` lines with:
  ```js
  const iso = [], isoGroups = [], spelled = [];
  const groupsOf = async (text) => kokoroPost((await isolated(text, rec.segments[0].lang)).join(" "), lang).split(" ").map(keep).filter(Boolean);
  for (const w of seg.words) {
    const gs = await groupsOf(w);
    isoGroups.push(gs); iso.push(gs.join(""));
    const letters = w.replace(/[^A-Za-z]/g, "");
    spelled.push(letters.length >= 2 && !/[a-z]/.test(w) ? await groupsOf([...letters].join(" ")) : null); // P6b F5
  }
  ```
  `iso[i]`'s value is unchanged; it still feeds the diagonal plan (`:144`) and `unit.isolated`.
- `:145`: `align(iso, groupTexts, lang)` becomes `align(isoGroups, spelled, groupTexts, lang)`.
- `:167`, F3, the latent hole: `u.k === 1 && u.g === 1 && !u.diagonal` becomes `u.k === 1 && !u.diagonal`, with the comment `// Every non-diagonal one-word unit is cost-checked, a split word too (P6b F3: a split was never checked).`

**`src/reader/modes/narrate/engine/chunkPlan.ts`** (rulings 3 and 4)
- After `:23` (`PAUSE_MARK`), insert:
  ```ts
  /**
   * Periods that do not end a sentence when a word follows that does not start one (P6b). The table is written for the
   * words this receives in the app: Electron's ICU segments "B.C." as "B." "C.", "i.e." as "i." "e." and
   * "www.gutenberg.org" as "www." "gutenberg." "org" (plain Node's ICU keeps them whole, so the whole forms are listed too).
   */
  const ABBREVIATIONS = new Set(["i.e.", "e.g.", "etc.", "vs.", "a.d.", "b.c."]);
  /** Titles are followed by a name, which is capitalised: they never end a sentence when any word follows (Brain, P6b). */
  const TITLES = new Set(["mr.", "mrs.", "ms.", "dr.", "st."]);
  const SINGLE_LETTER = /^[A-Za-z]\.$/;
  /** The next piece of a segmented dotted abbreviation ("C." after "B.", "e." after "i."). */
  const LETTER_PIECE = /^[A-Za-z](?:\.|$)/;
  const WEB_START = /^www\.$/i;
  const WEB_PIECE = /^[a-z0-9-]+\.$/i;
  const NEW_SENTENCE = /^["'“‘(\[]*[A-Z]/;

  function isAbbreviation(words: readonly string[], i: number): boolean {
    if (SINGLE_LETTER.test(words[i]) || ABBREVIATIONS.has(words[i].toLowerCase())) return true;
    for (let j = i; j >= 0 && WEB_PIECE.test(words[j]); j--) if (WEB_START.test(words[j])) return true;
    return false;
  }

  function isSentenceEnd(words: readonly string[], i: number): boolean {
    if (!SENTENCE_END.test(words[i])) return false;
    const next = words[i + 1];
    if (next === undefined) return true;
    if (TITLES.has(words[i].toLowerCase())) return false;
    if (!isAbbreviation(words, i)) return true;
    if (SINGLE_LETTER.test(words[i]) && LETTER_PIECE.test(next)) return false;
    return NEW_SENTENCE.test(next);
  }
  ```
- `:48`: `SENTENCE_END.test(words[i])` becomes `isSentenceEnd(words, i)`.
- Under Electron 41's ICU the extractor gives "B." "C.", "i." "e.", "U." "S." and "www." "gutenberg." "org", but keeps "Mr.", "Mrs.", "Ms.", "Dr." and "St." whole (measured 2026-10-15).

**`main/narrate/trial.js`** (the Brain-ruled driver fix; env-gated, loaded only with `BLURBY_NARRATE_TRIAL`)
- `:237-240`. Before: `await press(".rbb-play-btn"); await sleep(500); step("paused", { commits: …, notice: await js("window.__narrateTrial.notice()") });`. After:
  ```js
  // Read the notice before touching Play: after an F4 pause, Play starts a new request and the view shows "Voice loading…" (S5).
  const notice = await js("window.__narrateTrial.notice()");
  const wasPlaying = await js("window.__narrateTrial.playing()");
  if (wasPlaying) await press(".rbb-play-btn");
  await sleep(500);
  step("paused", { commits: await js('window.__narrateTrial.count("narrate-commit")'), notice, wasPlaying });
  ```

#### Scripts (tooling under the app's ICU; ruling 2)

- **New** `scripts/narrate-rebuild/lib/app-icu.cjs`:
  - `checkAppIcu({ versions, execPath, electronPath })` returns null only when `versions.electron` is set and `realpath(execPath)` equals `realpath(require("electron"))`. That is the repo's binary, `node_modules\electron\dist\electron.exe` (Electron 41.10.7, ICU 77.1); realpath keeps it correct through a junction.
  - `assertAppIcu()` writes `refused: …` to stderr and exits **3**.
  - It exports `checkAppIcu`, `assertAppIcu` and `APP_ELECTRON`.
- **New** `scripts/narrate-rebuild/lib/app-icu-guard.mjs`: a side-effect module that calls `assertAppIcu()`.
- **New** `scripts/narrate-rebuild/app-node.ps1`:
  - It resolves the binary from `node_modules/electron/path.txt`, sets `$env:ELECTRON_RUN_AS_NODE = '1'` (its own child shell only), runs `& $electron --no-warnings @args | Write-Output`, then `exit $LASTEXITCODE`.
  - Measured: called bare from pwsh, the GUI-subsystem `electron.exe` returns at once with no output and an empty `$LASTEXITCODE`; piped, pwsh waits and records the code.
  - `--no-warnings` drops Node's `MODULE_TYPELESS_PACKAGE_JSON` stderr line for `.ts` imports; otherwise rule 44 fails every row.
- **Guard placement:**
  - First line of the command-line-only scripts `p0-generate`, `p0-identity`, `p0-latency`, `p0-precision`, `p0-summary`, `p3-producer-check`, `p5-latency-e2e` and `reconcile-sweep`: `import "./lib/app-icu-guard.mjs"; // P6b: refuse plain Node (exit 3)`.
  - Main branch only of `p0-acoustic.mjs:230` and `p5-recorded-output-check.mjs:149`, because `tests/narrate/narrate.recordedOutput.test.ts:10`, `p0-latency` and `p3-producer-check` import them. Add `import { createRequire } from "node:module";` and `createRequire(import.meta.url)("./lib/app-icu.cjs").assertAppIcu();`.
  - First statement of `d2-crossing-check.cjs`.
  - `p0-latency.mjs:83` re-spawns `process.execPath` (Electron) with the variable inherited, so it is unaffected.
- **`p5-latency-e2e.mjs`** (launcher fixes approved by Brain):
  - `:40-41` comment: "8723 is 708 words before THE SECOND BOOK (word 9431 in the app's numbering, Electron 41's ICU; plain Node says 9423)". The default stays 8723.
  - `:61` CPU sampler: add `$_.Id -ne ${process.pid} -and`, so the launcher, itself an `electron.exe`, is not counted as Blurby.
  - `:89-90`: `const { ELECTRON_RUN_AS_NODE: _asNode, ...inherited } = process.env;` and `...inherited,` in place of `...process.env,`. Otherwise the app would start as Node.
- **`d2-crossing-check.cjs`**, rewritten:
  - Arguments: `<trace> <firstIdx> <firstText> <boundaryIdx> <boundaryText> [--min-past-s 120] [--break]`.
  - Check 0, new: both indices name their words by **text** (case and punctuation folded) in the app's numbering, from `extractWords` under the guard.
  - New: the first committed word's text is `firstText`.
  - Check 3, new: at least `--min-past-s` seconds of commits after the first commit at or past the boundary.
  - Checks 1–2 and the information block are as before, plus `icu`, `bookWords` and `pastBoundaryS`.
  - Exit 0/1, 2 for usage, 3 when refused.
- **New** `scripts/narrate-rebuild/reconcile-sweep.mjs`, about 210 lines:
  - What it runs: the producer's text side exactly as `producer-worker.js generate()` runs it, plus `verifyTable`, with a stub model (one frame per id, 600 zero samples per frame) and the committed tokenizer fixture. The fixture's sha is checked first; a mismatch exits 2.
  - Plan: `chunkPlan.ts` with `NARRATE_CHUNK_RAMP` and `NARRATE_STEADY_CHUNK_MAX_WORDS` from `src/constants.ts`, breaks as `ModeRuntime.chunkBreaks`.
  - Gate corpus: `passage-a`, `passage-b`, the 8 `legacy/*.txt`, `raven-1845.txt`, `resources/sample-meditations.epub`.
  - Modes:
    - `--gate`: exit 0 iff no chunk fails closed.
    - `--gate --control`: `normalize.js`/`wordmap.js` from `git show 2b78f1ca0eea9aeb1ca1e5397eb44ca35b3af9e7:…` into a temp dir; must exit 1.
    - `--gate --from W --to X`: the sample book planned as an epoch started at W; the D2 route pre-flight.
    - `--changed`: exit 0 iff every table that passes before and after but differs has, in its old version, a **wrong split unit**, and no chunk newly fails. A wrong split unit is a split-word unit with cost above 0 that the new table replaces (Brain, confirmed).
    - `--changed --break`: plants one changed correct table; must exit 1.
    - `--owner <dir>`: copies only; refuses `%APPDATA%\Blurby`; books named by `sha256(file name)[0:8]`; counts and word positions only. Exit 0 iff every failure is class E (token cap, NARRATE-TOKEN-CAP-1) or in `RULED_RESIDUALS`, keyed by `sha256(chunk text)[0:16]`. Today that holds one entry: `4e7915ce2410e10e`, NARRATE-RECONCILE-RESIDUAL-1.
    - `--check-tokenizer`: fixture = artifacts copy = pinned.
  - Recorder: chunks recorded must equal chunks planned, else exit 2.

#### Fixtures (rulings 3 and 5). Wave A's first commit carries all of them.

- `tests/fixtures/narrate-rebuild/kokoro-tokenizer/tokenizer.json`: byte copy of `C:\Projects\Blurby-artifacts\narrate-rebuild-1\models\local\kokoro-dur\tokenizer.json`. 3,497 bytes, sha256 `77a02c8e164413299b4b4c403b14f8e0e1c1b727db4d46a09d6327b861060a34`, equal to the artifacts' `onnx-community` copy.
- `…/kokoro-tokenizer/tokenizer_config.json`: byte copy, 113 bytes, sha256 `be1cb066d6ef6b074b3f15e6a6dd21ac88ff3cdaedf325f0aaed686c70f75d20`. `AutoTokenizer.from_pretrained` will not load without it (measured).
- `…/kokoro-tokenizer/LICENSE`: the Apache-2.0 text, copied from `node_modules/kokoro-js/LICENSE`.
- `…/kokoro-tokenizer/NOTICE.md`: "tokenizer.json and tokenizer_config.json: unmodified from onnx-community/Kokoro-82M-v1.0-ONNX (Hugging Face), Apache License 2.0 (LICENSE beside them); tokenizer.json sha256 77a02c8e…0a34, tokenizer_config.json be1cb066…5d20; pinned by tests/narrate/narrate.fixtures.test.js and `reconcile-sweep.mjs --check-tokenizer`."
- `tests/narrate/narrate.fixtures.test.js`: the equality check, in the same first commit.
  - It pins both shas and the LICENSE header.
  - It compares both files with the artifacts copy. That case uses `it.skipIf` when the artifacts folder is absent, which is never on the owner's machines; `reconcile-sweep.mjs --check-tokenizer` is the gate that cannot skip.
  - It passes as soon as the fixtures exist.
- `tests/fixtures/narrate-rebuild/raven-1845.txt`:
  - Edgar Allan Poe, "The Raven" (1845; public domain), written out directly with no download: all 18 stanzas, one blank line between stanzas, no title or apparatus.
  - It is a text fixture; the sweep's `.txt` loader treats each stanza as a paragraph.
  - Never the owner's library copy (`844e92e6`).
- `tests/fixtures/narrate-rebuild/README.md`: add `kokoro-tokenizer/` and `raven-1845.txt` with source, licence and hashes.

#### Tests — positive controls first (standing rule 43)

Write the tests **before** the product edits, run them on the base, and record each failure (Evidence → P6b controls).

1. `tests/narrate/narrate.reconcile.test.js` (new). The real kokoro normalizer, tokenizer fixture, espeak, capture, wordmap and normalize, with a stub model. 8 cases; each fails today for the reason its title names:
   - F1, the D2 chunk at app word 3217: `segment unalignable: '`
   - F1/F2 mid-chunk quote, Meditations "…a peaceable mind.' To this end…": `normalization changed the word count: 29 source words, 30 spoken, 29 expected`
   - F2 em-dash, "Wait—are we live?": `…3 source words, 4 spoken, 3 expected`
   - F3 number, "…A. D. 121.": `segment unalignable: 121`
   - F3 cost check, "…in 145 his betrothal…": the "his" units are `[["split-word","fˈaɪv hɪz"]]`; `[["word","hɪz"]]` is wanted
   - F4, "…to our email newsletter…": `unit evidence cost 1.00 > 0.5: our ~ ˌaʊɚɹ`
   - F1, "By no means.' XXIV.": `unit evidence cost 1.68 > 0.5: ' ~ ɹˌoʊmən`
   - F5, "HE WAS THE LAST OF HIS OWN KINDRED…": `unit evidence cost 1.82 > 0.5: OWN ~ ˌoʊdˌʌbəljˌuːˈɛn`

   Each was checked 2026-10-15 under plain Node and the app's Electron: base fails as named, the final edits pass. Turning one fix off at a time confirmed the attribution: A needs F1, F needs F2, C needs F3, F4's case F4, F5's case F5, and B either F1 or F2.
2. `tests/narrate/narrate.chunkPlan.test.ts` (new). 8 tests in in-app tokenization; 6 fail today:
   - "B. C. 50": 5, wanted 9.
   - "B. C. He": 3, wanted 4.
   - "i. e." / "U. S.": 3 / 2, wanted 6 / 5.
   - "www. gutenberg. org": 2, wanted 6.
   - Whole "B.C.": 3, wanted 6.
   - "Mr. Smith" (ruling 4): 3, wanted 7; with "Mrs. … Dr. … St.": 1, wanted 9.

   Two pass before and after: "in Section B. The next…" (Brain's guard) and "He called for the Dr." (a title at the end still ends). All expectations were checked against the final `chunkPlan.ts` under Electron.
3. `tests/narrate/narrate.appIcu.test.js` (new):
   - The guard's unit cases.
   - Plain `node` on `reconcile-sweep.mjs`, `d2-crossing-check.cjs`, `p5-recorded-output-check.mjs` and `p0-summary.mjs`: exit 3 and `refused: plain Node`.
   - It fails today: `lib/app-icu.cjs` is absent.
4. `tests/narrate/narrate.mode.test.ts`: add "an F4 pause mid-session shows F4's notice, not Voice loading" after `:98`.
   - `FakeProducer.nextControl("ok")` then `"missing-table"`; play words; tick until paused; assert the highlight is past 7 and the notice is `timing-missing`.
   - It passes on today's code. Control: delete `ModeRuntime.ts:216` (`if (s.failure) return {…}`); the test must fail with the notice `null`. Restore it; `git diff --exit-code -- src/reader/modes/narrate/ModeRuntime.ts` exits 0.
   - If the loop bound needs adjusting to the fake's word sizes, adjust the test, never the runtime.
5. Existing: `narrate.normalize.test.js`, `narrate.wordmap.test.js`, `p3-producer-check.mjs` and the P0 summary stay green. Passage A has 0 changed tables.

#### Execution sequence

**Wave A: this machine, light; about 25–30 tool uses**

- A0. Resume protocol and GIT WORK verification. Journal "S6 — session start". Record the P6b start sha.
- A1. Fixtures (all of the "Fixtures" list) and `narrate.fixtures.test.js`. `npx vitest run tests/narrate/narrate.fixtures.test.js` exits 0. **First commit** of wave A: `NARRATE-REBUILD-1-S6: P6b fixtures — Kokoro tokenizer (Apache-2.0), The Raven (1845)`. Push.
- A2. The four tests. On the base, `npx vitest run tests/narrate/narrate.reconcile.test.js tests/narrate/narrate.chunkPlan.test.ts tests/narrate/narrate.appIcu.test.js tests/narrate/narrate.mode.test.ts` must fail exactly as listed; record the failures. Run the mode test's mutation control.
- A3. Product edits (normalize, wordmap, chunkPlan) and `trial.js`.
- A4. Scripts: the guard libs, the wrapper, `reconcile-sweep.mjs`, the guard lines, the D2 checker, the launcher fixes.
- A5. `MAPPING_POLICY.md` (approved, same branch):
  - `:23`: quote-only tokens are not source words.
  - `:29`: one word spans up to max(3, its isolated group count) groups; now observed (numbers, Greek); cost-checked.
  - `:39`: syllables counted per isolated group.
  - `:40`: linking r free for en-us too.
  - `:42`: split units cost-checked.
  - New: the all-caps spelled-form evidence (F5).
  - Still no proportional split; spans come only from the captured pass.
  - Also update the fixtures README and this worklist.
- A6. `npx vitest run tests/narrate tests/readerModes/narrate.contract.test.ts` exits 0; `npm run typecheck` exits 0. Then every "Gate commands" row G1–G12, with outputs teed into `docs/studies/narrate-rebuild-1/phase6/reconcile-*.txt`. Measure the gate on the real Raven text here and record its counts.
- A7. Heavy, once, outside any GOG measurement window and never during wave B: `npm test` and `npm run build` exit 0 (LL-147, rule 48).
- A8. Fence check (G15), then commit (`NARRATE-REBUILD-1-S6: P6b wave A — reconciliation fix, app-ICU tooling, gates green`) and push. Stop for Brain's review and the quiet window, which Brain arranges with GOG.

**Wave B: Brain's quiet window on the reference machine**

- B0. `npm run build`, skipped if the tree equals A7's. Then the 1-minute launcher smoke (approved): `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only session --rates 1.0 --minutes 1 --out C:\Projects\Blurby-artifacts\narrate-rebuild-1\p6b-smoke`. It exits 1 on the 5-minute session minimum; it must show commits from an app started as Electron. This is the first launch of the launcher under the wrapper, which planning could not run.
- B1. D3/D5: `… p5-latency-e2e.mjs --only session --rates 1.0,2.0 --minutes 5 --out C:\Projects\Blurby-artifacts\narrate-rebuild-1\p6b-d3` must exit 0. Then `… p5-recorded-output-check.mjs <out>\traces\session-1-00.trace.json <out>\traces\session-2-00.trace.json --min-minutes 5` must exit 0, and the same with `--break` must exit 1. Rename the launcher's records to `phase5/recorded-output.p6b-1.json` and `latency-e2e.p6b-1.json`, and restore the committed `recorded-output.json` and `latency-e2e.json` with `git show HEAD:<path>`.
- B2. D2: `… p5-latency-e2e.mjs --only session --rates 1.0 --minutes 21 --position 2970 --out C:\Projects\Blurby-artifacts\narrate-rebuild-1\p6b-d2-ancient` must exit 0. 2970→5480 is 2,510 words, about 15 minutes at S5's pace of about 166 words per minute. Then `… d2-crossing-check.cjs <out>\traces\session-1-00.trace.json 2970 ancient 5480 HIS` must exit 0, and `--break` must exit 1. Commit the trace as `docs/studies/narrate-rebuild-1/phase6/d2-ancient-crossing.p6b.json`; restore the phase5 records as in B1.
- B3. Records: state.md Evidence, the Gate log row "P6b", the journal; commit and push. Then launch.md → Completion protocol (D1–D15 fresh). A fail in B1 or B2 is a BLOCKER(USER) to Brain; there is no second fix in the window.
- **D6 is not re-run in P6b** (Brain): the final-main D3/D6 run before release covers it.

#### Gate commands (pwsh 7, worktree root; every script through `pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 <script> …`)

| # | Command | Exit | Measured 2026-10-15 under Electron (reference tree, final code) |
|---|---------|------|------------------------------------------------------------------|
| G1 | `reconcile-sweep.mjs --check-tokenizer` | 0 | 0 |
| G2 | `reconcile-sweep.mjs --gate` | 0 | 0 fail-closed of 3,635 chunks (Meditations 80,493 words, 3,588 chunks); 124 s. The Raven was a 6-line stand-in; re-measure on the committed text |
| G3 | `reconcile-sweep.mjs --gate --control` | 1 | 114: Meditations 112 (A 53, B/F 43, C 8, D 8), passage-b 1, punctuation-dense 1 |
| G4 | `reconcile-sweep.mjs --changed` | 0 | 36 changed tables, each replacing a wrong split unit (all 36 over the 0.5 limit); 0 newly failing; 228 s |
| G5 | `reconcile-sweep.mjs --changed --break` | 1 | 1 (36 + 1 planted) |
| G6 | `reconcile-sweep.mjs --gate --from 2970 --to 6700` | 0 | 0 of 172 |
| G7 | `reconcile-sweep.mjs --gate --from 2970 --to 6700 --control` | 1 | 24 of 171, measured before the title rule (the first is the 3217 stall); re-measure |
| G8 | `reconcile-sweep.mjs --owner <scratchpad>\owner-epub-copy` | 0 | 0: 21 fail-closed of 11,030 chunks in 8 books = 18 class E + 3 ruled residual (one chunk, `4e7915ce2410e10e`, in three copies of one book); 346 s |
| G9 | `node scripts/narrate-rebuild/<guarded script> …` (plain Node) | 3 | 3 (`reconcile-sweep.mjs`, `d2-crossing-check.cjs`) |
| G10 | `d2-crossing-check.cjs docs/studies/narrate-rebuild-1/phase5/d2-ancient-crossing.json 2963 ancient 5480 HIS` | 1 | 1: "word 2963 is "the", want "ancient" (numbering)" |
| G11 | `d2-crossing-check.cjs C:\Projects\Blurby-artifacts\narrate-rebuild-1\p6-completion\traces\session-1-00.trace.json 8723 casting 9431 THE --min-past-s 30` | 0 | 0 (42.3 s past 9431) |
| G12 | G11 without `--min-past-s` / with `--break` / with boundary `9423` | 1 / 1 / 1 | 1 ("only 42.3 s past") / 1 / 1 ("word 9423 is "and"") |
| G13 | `npx vitest run tests/narrate tests/readerModes/narrate.contract.test.ts`; `npm run typecheck` | 0; 0 | to run in A6 |
| G14 | `npm test`; `npm run build` | 0; 0 | to run in A7 |
| G15 | `git diff --name-only <P6b start> HEAD`: only the fence paths | — | — |

**Changed tables against Brain's definition** (a split unit with cost above 0 that the new table replaces):
- Gate: 36 tables, all in Meditations. Each old table had such a unit over the 0.5 limit, e.g. "his ~ fˈaɪv hɪz" at cost 0.84.
- Owner library (prototype compare): 480 changed. 462 had an over-limit split. The other 18 were checked structurally: 6 + 6 in one book and its copy, 2 + 2 + 2 in another and its copies. Each old table held a split under the limit (cost 0.09–0.48) whose groups were not the word's own isolated phonemes. The new table gives each word its isolated groups at cost 0. None is a correct table changed.

#### Fences

- **Product code — only:** `main/narrate/normalize.js`, `main/narrate/wordmap.js`, `src/reader/modes/narrate/engine/chunkPlan.ts`, and (Brain ruling) `main/narrate/trial.js`.
- **Tests:** new `tests/narrate/narrate.{reconcile,fixtures,appIcu}.test.js` and `tests/narrate/narrate.chunkPlan.test.ts`; one added test in `tests/narrate/narrate.mode.test.ts`.
- **Scripts:**
  - New: `scripts/narrate-rebuild/{reconcile-sweep.mjs, app-node.ps1, lib/app-icu.cjs, lib/app-icu-guard.mjs}`.
  - Edited: `d2-crossing-check.cjs`, `p5-latency-e2e.mjs`.
  - Guard lines only: `p5-recorded-output-check.mjs`, `p0-acoustic.mjs`, `p0-generate.mjs`, `p0-identity.mjs`, `p0-latency.mjs`, `p0-precision.mjs`, `p0-summary.mjs`, `p3-producer-check.mjs`.
- **Fixtures:** `tests/fixtures/narrate-rebuild/{kokoro-tokenizer/tokenizer.json, kokoro-tokenizer/tokenizer_config.json, kokoro-tokenizer/LICENSE, kokoro-tokenizer/NOTICE.md, raven-1845.txt, README.md}`.
- **Docs:**
  - This packet (plan, state, journal; charter only as the owner amends it).
  - `docs/studies/narrate-rebuild-1/phase0/MAPPING_POLICY.md`; `docs/studies/narrate-rebuild-1/phase6/*`.
  - `phase5/*.p6b-1.json`.
  - LL-136 exemption: `docs/governance/close-outs/Timing.NARRATE-REBUILD-1-S6.jsonl` and `docs/governance/close-outs/Memo.NARRATE-REBUILD-1.GovernanceStaging.2026-10-13.md`.
- **Forbidden:**
  - Every other path, including `capture.js`, `producer*.js`, `narrateEngine.ts`, `wordTable.ts` and `ModeRuntime.ts` (only its transient mutation control, restored).
  - Page/Focus/Flow and the G4 baselines.
  - `%APPDATA%\Blurby`; the register (LL-153).
  - `tests/perf-baseline-results.json`.
- **Shared-core freeze set:** untouched.
- **Heavy gates:** none inside a measurement window.

#### Follow-ups (stubs for the next roadmap review; not this epic's work)

- **NARRATE-RECONCILE-RESIDUAL-1** (Brain, 2026-10-15): the owner-library chunk `4e7915ce2410e10e` still fails closed. It is a two-word capitalised name whose second word espeak reads [k] alone and [tʃ] in the phrase (fused cost 0.67). It is safe: it pauses and never guesses. The stub is for context-dependent pronunciation evidence.
- **NARRATE-TOKEN-CAP-1** (already registered): class E, 18 owner-library chunks over the 400-id cap.

## Gate log

| Date | Gate | Evidence |
|------|------|----------|
| 2026-10-13 | P1 — Producer and harness | `p0-summary.mjs` exit 0: P0-1, P0-2, P0-4 PASS on both voices (514/514, 500 chunks, factor 600); `--break` exit 1; `p1-gate.ps1` 11/11 with `-SelfTest` recording a FAIL; typecheck 0; `npm test` 1,955 passed / 1 skipped / 0 failed; merge `7bbf6b20` pushed, ancestor check exit 0 (state.md → Evidence) |
| 2026-10-13 | P2 — Acoustic check, latency and the verdict | VERDICT.md parts (i)–(iii), P0-5 and the precision addendum present; `p0-acoustic.mjs` exit 1 with the classification recorded (5 FAIL / 11 INCONCLUSIVE, 40 ms control caught); `p0-latency.mjs --threads 4`: T7 measurement exit 0 (worst warm 1,940 ms on a quiet host), the two gate reruns exit 1 under ordinary desktop load (2,297 / 2,451 ms) recorded, not waived (Decision #13); the owner's G1 answers adopted (Decision #8–#13); merge `d81aeb4b` pushed, ancestor check exit 0 (state.md → Evidence) |
| 2026-10-13 | P3 — Core engine | Fresh at `f4971196`: `npx vitest run tests/narrate/narrate.structural.test.ts tests/narrate/narrate.negativeControls.test.ts tests/narrate/narrate.engine.test.ts` exit 0 (19 tests; the planted-violation and gate-bypass positive controls inside); `npm run typecheck` exit 0; `npm test` 139 files, 1,984 passed / 1 skipped / 0 failed; `p3-producer-check.mjs` exit 0 and `--break` exit 1; merge `ef245815` pushed, ancestor check exit 0 (state.md → Evidence) |
| 2026-10-13 | P4 — The mode | Fresh at `5edbea58` (12:24–12:26): D7/D8/D9 — `npx vitest run tests/readerModes tests/narrate tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/settingsNarrateNormalization.test.js tests/readerBottomBarControls.test.tsx tests/readerKeyboard.test.tsx tests/useKeyboardShortcuts.test.ts` exit 0 (26 files, 207 tests; the D9 settings test seen failing 4/9 on the old code first); the three G4 baselines byte-identical (`git diff --stat ef245815 -- src/reader/modes/page src/reader/modes/focus src/reader/modes/flow` empty); `npm run typecheck` exit 0; `npm test` 141 files, 2,004 passed / 1 skipped / 0 failed; `npm run build` exit 0; merge `331f8313` pushed, ancestor check exit 0 (state.md → Evidence) |
| 2026-10-13 | P5 — Speed, crossings, latency end to end, recorded output | D3/D5: the final re-run on `769ae0ce` — both 5-minute sessions PASS at 1.00x and 2.00x (0 commits outside one frame, 0 drops / repeats / overlaps, mapping 0.11 ms; `recorded-output.final-2.json`). D6 under Decision #21 (charter row as amended by Decision #19): warm 1.00x 100 of 100 counting under 2 s and cold 40 of 40 under 8 s (`latency-e2e.final-1.json`, `b1dc43ff`), warm 2.00x 99 of 99 under 2 s, worst 698 ms (`latency-e2e.final-2-warm-2.00.json`, `769ae0ce`); recorder positive control `--break` exit 1. D10 grep exit 1. Fresh at `821857b9`: `npm test` 149 files, 2,048 passed / 1 skipped / 0 failed; typecheck 0; build 0. Defects fixed on the way: producer-worker freeze (`67631d26`), catch-up publish (`cc77f7d8`), the view runaway (`769ae0ce`). Merge `05a5480a` pushed, `merge-base --is-ancestor` exit 0 |

## Current-phase worklist

<!-- Owned by the executor. Regenerate when a phase opens. -->

- [x] P1 opened 2026-10-12, gate passed and merged `7bbf6b20` 2026-10-13.
- [x] P2 opened 2026-10-13 at `7bbf6b20`: P0-3, P0-5, VERDICT.md, G1 answered (Decision #8–#13), precision addendum, gate run 10:15 (latency reruns FAIL recorded, Decision #13); merged `d81aeb4b` 2026-10-13 10:50.
- [x] P3 opened 2026-10-13 10:52 at `d81aeb4b`; built and gate-passed 11:35; merged `ef245815` 2026-10-13 11:36. Its design record, kept for the next phases:
- [x] P3 design (2026-10-13 11:10; owner questions answered, Decision #14, #15). **Producer** in `main/narrate/` (CJS, packaged by `build.files`): `wordmap.js`, `chunker.js`, `capture.js` moved from the harness, which re-exports them (one implementation; provenance written only in `capture.synthesize`); `expose-durations.js` (Decision #4's graph edit as a function; `ensureExposedModel` with input and output hash checks and an atomic write; Decision #15); `producer-worker.js` + `producer.js` (4 intra-op threads, the exposed model, the capture seams, exact table + provenance, `NARRATE_MODELS_ROOT` override for this epic's runs); `main/ipc/narrate.js`. **Engine** in `src/reader/modes/narrate/engine/` (no React, no sibling imports): `chunkPlan.ts` (T2 bounds over book words: first chunk one sentence ≤ 15 words, packed sentences under the token estimate; the exact cap fails closed in the producer), `wordTable.ts` (verify: provenance native, integer frames, Σ frames × factor = PCM samples played, units cover the chunk's words in order; lookup by playback sample with R6 hold), `playbackClock.ts` (one `AudioContext` behind an `AudioOutput` seam; contiguous sample-accurate scheduling; leading-silence trim by a known sample count; `getOutputTimestamp` mapping for D3), `narrateEngine.ts` (epochs, prefetch of the next chunk, F4 fail-closed on any unverified chunk, R7 speed change finishing the word in progress with coalescing and a stale-job bound). **Suites named for the gate:** `tests/narrate/narrate.structural.test.ts` (D4 structural: no estimator path, provenance set in one place, no sibling-runtime import; with a planted-violation control), `tests/narrate/narrate.negativeControls.test.ts` (D4 through the full path: missing table; native-labelled table mismatching its words or its audio; fabricated weight-shaped table — each F4, each seen failing first), `tests/narrate/narrate.engine.test.ts` (D5-engine: one clock and one lookup, no overlapping voiced samples, no dropped or repeated word across pause/resume, mid-word click and speed changes, R6, R7, coalescing, stale bound), `tests/narrate/narrate.wordmap.test.js` and `tests/narrate/narrate.exposeDurations.test.js` (producer units). Producer = harness identity: `scripts/narrate-rebuild/p3-producer-check.mjs` exits 0 when the producer's table and PCM equal the P0 table for passage A chunk 0 at 1.00x.
- [x] Producer (main process, 2026-10-13 11:50): `main/narrate/{constants,capture,wordmap,chunker,expose-durations,producer-worker,producer}.js`, `main/ipc/narrate.js` (`narrate-generate`, `narrate-preload`, `narrate-status`; registered in `ipc-handlers.js`); the harness re-exports the shared code. `p3-producer-check.mjs` exit 0: at onnxruntime's default threads the table and the PCM sha256 equal Phase 0's; at Decision #7's 4 threads the table is identical, the first voiced sample and the T3 detector's onsets are the same to the millisecond, and the waveform differs only by rounding amplified through the decoder's harmonic phase (1 ms envelope within 3.7 % of peak); `--break` exit 1.
- [x] Engine (`src/reader/modes/narrate/engine/`, 2026-10-13 11:40): `chunkPlan.ts`, `wordTable.ts` (verify + lookup, R6), `playbackClock.ts` (AudioOutput seam, WebAudioOutput, T6 trim), `narrateEngine.ts` (epochs, prefetch, F4 fail-closed, R7 with coalescing and the stale-job bound). The preload surface, the runtime shell and the view are P4.
- [x] D4 and D5-engine suites (2026-10-13 11:45): `tests/narrate/narrate.structural.test.ts` (planted-violation control inside), `narrate.negativeControls.test.ts` (each control fails closed; the gate-bypass positive control shows the control would otherwise play), `narrate.engine.test.ts` (8 D5 cases), `narrate.wordmap.test.js`, `narrate.exposeDurations.test.js`: 29 passed; `npm run typecheck` exit 0; `npm test` 139 files, 1,984 passed / 1 skipped / 0 failed.
- [x] P3 gate 2026-10-13 11:35 (Gate log) → merged `ef245815`.
- [x] P4 opened 2026-10-13 11:36 at `ef245815` (branch `eb/narrate-rebuild-1-p4`, worktree `.worktrees/narrate-rebuild-1-p4`).
- [x] P4 census 2026-10-13 12:00 (LL-139, LL-150). **Registration seams:** `src/reader/modes/ReaderModeAdapter.ts` (`ReaderModeId` + `"narrate"`; `ReaderModeSpeed` gains `{ kind: "rate"; rate }`), `src/types.ts` (`ReaderMode`/`ReaderLastMode` + `"narrate"`; `ElectronAPI.narrateGenerate/narratePreload/narrateStatus`), `src/reader/useReaderModeOrchestrator.ts` (`READER_MODE_MODULES` + narrate; `select`/`handleSelectMode` accept `"narrate"`; `handleEnterNarrate`; the Shift+Space cycle stays Focus↔Flow), `src/components/ReaderContainer.tsx` (destructure `handleEnterNarrate`, `onEnterNarrate` to the bar, `enterNarrate` as the last `useReaderKeys` argument, `isScrolledSurfaceMode` includes narrate), `src/components/ReaderBottomBar.tsx` (fourth button "Narrate", `lastReadingMode` type, hint text, speed dialog mode), `src/components/ReaderSpeedDialog.tsx` (mode `"narrate"`: 0.80–2.00 in 0.05 steps from `KOKORO_UI_RATE_*`, value kind `rate`), `src/hooks/useKeyboardShortcuts.ts` (`enterNarrate` appended as the last parameter; bare N enters Narrate on every surface), `preload.js` (three channels), `src/test-harness/electron-api-stub.ts`. **Policy:** `census/boundary-policy.json` needs `"narrate"` in `modes`, the `helpers/foliateHelpers.ts` `BLOCK_TAGS` singleton and the narrate `privateCopyMap` entries exactly as at `612d03f5` (ModeState's `chunkVisualState` entry becomes `notCopied`); `ownership.json` differs from `612d03f5` only by the `"narrate"` members of `privateCopiesFor`, so it is restored wholesale. **main:** the three `normalizeReaderModes` runtime calls (`main/migrations.js` `loadSettingsData`, `main/sync-engine.js` `applyCloudSettings`, `main/ipc/state.js` `save-settings`) are removed; the function and migration v13 stay; no schema bump is needed because the migration runner skips files already at 13, so a `"narrate"` saved by the rebuilt mode survives. **Display:** the old Narrate view files (`FoliateView.tsx`, `helpers/*`, `mode.css`, `surface.ts`, `ModeState.ts`, `ModeView.tsx`, `useModeBindings.ts`, `index.ts`) are restored from `612d03f5` as display plumbing (they never touched audio; the chunk-visual props are fed `null`); the old audio-port `ModeRuntime.ts` is not restored — a new runtime over the P3 engine replaces it; the D4 structural scanner is scoped to the timing modules (`engine/`, `ModeRuntime.ts`, `ModeState.ts`, `useModeBindings.ts`, `main/narrate/**`). **Tests rewritten, never deleted (D8, D9):** `tests/readerBottomBarControls.test.tsx` (four buttons Page, Focus, Flow, Narrate; "Narrat" only in that button), `tests/useKeyboardShortcuts.test.ts` and `tests/readerKeyboard.test.tsx` (bare N enters Narrate), `tests/readerModeIsolation.test.ts` (REAL_MODULES, PRESENT_MODES, PLAYABLE and the D3 registry test list four modes), `tests/readerModeOwnership.test.ts` (per-owner counts and the dynamic loops include narrate), `tests/settingsNarrateNormalization.test.js` (the three ingresses keep `"narrate"`; v13 still maps a pre-13 file). **Suites named for the P4 gate:** D7 `tests/readerModes/narrate.contract.test.ts` (G2 contract over the real module with a fake producer and a fake AudioContext) and `tests/narrate/narrate.mode.test.ts` (F4 notice and F5 loading state through the runtime); D8 `tests/readerModeBoundaries.test.ts`, `tests/readerModeOwnership.test.ts`, `tests/readerModeIsolation.test.ts`, `tests/readerModes/` with the three G4 baselines byte-identical; D9 the two settings tests above.
- [x] (2026-10-13 12:10) Runtime shell `src/reader/modes/narrate/`: `index.ts` (module), `ModeRuntime.ts` + `ModeState.ts` over the P3 engine (ReaderModeRuntime v1 — select, start, pause, resume, stop, jumpToWord, exportHandoff; speed `{ kind: "rate" }`; `narrating` true while playing; `clockOwner: "audio-truth"` re-added with tests), `surface.ts`, `FoliateView.tsx` + `ModeView.tsx` (own Foliate element; the highlight follows the engine's cursor), `useModeBindings.ts` (the requestAnimationFrame tick; the D3 log hook point), the producer port over `window.electronAPI.narrate*`; F4 notice ("this passage couldn't be timed") and F5 voice-loading state.
- [x] (2026-10-13 12:20) Preload surface (`narrateGenerate`, `narratePreload`, `narrateStatus`) + `ElectronAPI` types; router registration (fourth module); bottom-bar Narrate entry and KeyN; speed dialog mode `narrate` (`rate` 0.80–2.00 in 0.05 steps, `KOKORO_UI_RATE_*` in `src/constants.ts`); voice and speed read from `ttsVoiceName`/`ttsRate` and written only through the existing fire-and-forget `saveSettings` (BUG-185: no acceptance criterion treats that as persistence until SETTINGS-WRITE-DURABLE-1).
- [x] (2026-10-13 12:20) Mode id `"narrate"` (Decision #10): `"narrate"` restored in `ReaderMode`/`ReaderLastMode`/`ReaderModeId`; the three `normalizeReaderModes` runtime calls (`loadSettingsData`, `applyCloudSettings`, the `save-settings` handler) removed — no schema step was needed (the census found the runner skips a schema-13 file, so a saved `narrate` survives; v13 still maps a pre-13 file once); migration v13, the function and its tests stay; NARRATE-REMOVE-1's absence assertions rewritten, never deleted (D8: bar, keys, isolation, ownership; D9: `tests/settingsNarrateNormalization.test.js`, seen failing 4/9 on the old code first). D7 suites written: `tests/readerModes/narrate.contract.test.ts` (fake host: `tests/narrate/harness/fakeNarrateHost.ts`) and `tests/narrate/narrate.mode.test.ts` (F5, F4 with a click restart, the rate grid, the generated speed, the view's two notices). The D4 structural scanner now covers `engine/`, `ModeRuntime.ts`, `ModeState.ts`, `useModeBindings.ts` and `main/narrate/**`.
- [x] P4 gate 2026-10-13 12:26 fresh at `5edbea58` (Gate log) → merged `331f8313` 12:27.
- [x] P5 opened 2026-10-13 12:27 at `331f8313` (branch `eb/narrate-rebuild-1-p5`, worktree `.worktrees/narrate-rebuild-1-p5`); the P4 merge records are its first commit (base trailer).
- [x] P5 census 2026-10-13 12:33–12:50 (LL-139, LL-150), recorded before any change. **D10 — the patch.** `patches/kokoro-js+1.2.1.patch` is one hunk replacing the minified `dist/kokoro.cjs` line; exploded statement by statement it adds 152 lines and changes 4, all timing: `computeWordTimestamps` (HOP 256 token walk, drift and monotone checks), `_alignWordsToTimestamps` (per-word re-phonemization and token counting), `generate(…, { words })` attaching a non-enumerable `wordTimestamps`, and `generate_from_ids` destructuring `durations` from the model output into a non-enumerable `_durations`. Nothing the rebuilt producer uses: `main/narrate/capture.js` wraps `tts.model` itself and reads the exposed model's `durations` from that call (`m.durations`), never `audio._durations`; `producer-worker.js` constructs `KokoroTTS` from the public classes. The only caller of the added surface is the dormant `main/tts-worker.js:157` (`generate(text, { voice, speed, words })`), whose result is unused by the rebuilt mode; `tests/tts-engine.test.js` and `tests/tts-worker.test.js` mock kokoro. Decision: delete the patch (D10 "removed"); `npm ci` then installs the pristine package (`postinstall` = `patch-package && node scripts/patch-onnxruntime.js` tolerates an absent patch); checks: the D10 grep exits 1, `p3-producer-check.mjs` exit 0 (table and PCM identical to Phase 0 at the default threads), the two mocked suites still pass. **R10 — the old cache.** `main/tts-cache.js` is read only by `main/tts-engine.js` / `tts-worker.js` (dormant; no preload path since NARRATE-REMOVE-1: `preload.js` exposes no `tts*` method — only the eval-trace bridge). The rebuilt mode reaches main only through `narrateGenerate` / `narratePreload` / `narrateStatus`; `producer.js` reads and writes no cache. **D3 — the log.** Hook point: `useModeBindings.ts` rAF tick → `NarrateModeRuntime.tick` → `NarrateEngine.tick` → `position(now)` → `publish(word)` → `events.onCursor` → `onEngineCursor` → `ports.diagnostics.trace({ kind: "word" … } as never)`. The playback clock pair is `AudioOutput.outputTimestamp()` (`WebAudioOutput` → `AudioContext.getOutputTimestamp()`). Transport that already leaves the profile alone: the eval-trace bridge — `preload.js` exposes `__BLURBY_TTS_EVAL_TRACE__` only when `BLURBY_TTS_EVAL_TRACE_DIR` is set, `ReaderContainer` wires `createWindowEvalTraceSink()` into the ports as `diagnostics.trace`, and `main.js` `setupTtsEvalTraceCapture` appends every event (no kind filter) and writes `<mode>.trace.json` into that directory on `flush()` or window close (`BLURBY_TTS_EVAL_TRACE_CONFIG` sets `mode` and `runId`). The event union (`src/types/eval.ts` `TtsEvalTraceEvent`) has no narrate kinds (the runtime's `as never` cast marks that); `validateTtsEvalTrace` ignores unknown kinds. Design: three new event kinds — `narrate-commit` (per published word: `t` = performance.now at the commit, `word`, `chunkStart`, `unit`, `boundaryCtx` = the unit's table boundary on the context clock, `nowCtx`, `otsCtx` / `otsPerf` from `getOutputTimestamp`, `frameDt` = the time since the previous tick, `speed`, `epoch`), `narrate-request` (`cause` play | resume | click | speed, `t`, `ctxAtRequest`, `word`, `speed`) and `narrate-first-voiced` (the first scheduled voiced sample after a request: `cause`, `requestT`, `startAt`, `ctxAtRequest`, `latencyS` = `startAt − ctxAtRequest`, `leadS`, `trimSamples`). The engine emits them through one optional `onTrace` event; the runtime forwards to `ports.diagnostics.trace` (the mode never touches `window`); the `"word"` event's `source` becomes `"audio"` and the cast goes. Check script `scripts/narrate-rebuild/p5-recorded-output-check.mjs`: per commit, the playback clock at the commit = `otsCtx + (t − otsPerf) / 1000`, lateness = that − `boundaryCtx`, must lie in [−1 ms, refresh + 1 ms] where refresh = the session's median `frameDt`; clock-mapping uncertainty = the spread of `otsCtx − otsPerf / 1000` over the session, ≤ 10 ms else INCONCLUSIVE (never a pass); D5 analysis over the same records: overlaps (two chunks sounding at once, from the first-voiced/schedule records), drops (a published word skipping an index inside a chunk), repeats (a word published twice without a request between); `--break` plants a late commit and must exit 1. **D6 — end to end.** No in-app driver exists; `main.js` has no `userData` override (`setPath` absent) and `isDev = !app.isPackaged` loads `http://localhost:5173` for any unpackaged `electron .`; on first run with an empty profile `main.js` inserts `resources/sample-meditations.epub` as doc id `sample-meditations` (Phase 4), and `main/window-manager.js` `openReaderWindow(docId)` opens a reader window at `#reader/<docId>` (`src/App.tsx` routes the hash). Design: three env-gated main-process levers, no behavior change without them (executor Decision #16): `BLURBY_USER_DATA_DIR` → `app.setPath("userData", …)` before ready (a scratch profile under the artifacts folder; `%APPDATA%\Blurby` untouched; the single-instance lock is per profile), `BLURBY_USE_DIST=1` → load `dist/` unpackaged (no Vite server, no BUG-189 dev slowness), `BLURBY_NARRATE_TRIAL=<json>` → `main/narrate/trial.js` (required only when set) waits for `sample-meditations`, opens its reader window and drives it through `webContents.executeJavaScript` — the bar's `[aria-label="Narrate mode"]` and `.rbb-play-btn`, synthetic `keydown` on `window` (Space, ArrowUp/ArrowDown for the 0.05 speed grid), a `click` on a `[data-word-index]` span inside the foliate section document (found by walking shadow roots to the iframe) — then flushes the trace and quits. Session kinds: `session` (D3: play for N minutes at a rate), `warm` (D6: 20 requests per type at a rate in one process), `cold` (D6: a fresh process per trial; the first generation reached through the type's entry path). Script `scripts/narrate-rebuild/p5-latency-e2e.mjs` launches `electron .` from the worktree with the four environment variables, collects the traces and reports every trial and the worst per type and rate (never a mean) against 2 s warm / 8 s cold, with the host-busy figure as in P0-5; the engine-only P0-5 harness stays as the component measurement. **D5 — crossings.** `NarrateModeRuntime.engineFor` passes `numberArrayToSet(document.paragraphBreaks)` as the chunk breaks, but those indices belong to `tokenWords` (the tokenized content) while the engine words are `bookWords.words` whenever `bookWords` exists — so a chunk can cross a section boundary today. Design: when the engine words are the book words, the breaks are the section ends (`bookWords.sections[i].endWordIdx − 1`); the view side already handles the crossing (`surface.highlight` returns false outside the loaded section → `pendingResume` + `surface.next()` → `onWordsReextracted` paints it; `syncSection` follows the spoken word's section through `goToSection`). Named tests `tests/narrate/narrate.crossings.test.ts`: the chunk plan never spans a section end; the producer requests at a boundary split there; the cursor continues across it and the view is asked for the next section and paints the pending word; adjacent and extreme speed changes (0.80 → 2.00 → 0.80 in consecutive words) keep one clock with no overlap, drop or repeat (engine level, FakeAudioOutput). The D3 analysis over a real session is the in-app half of D5.
- [x] (2026-10-13 12:45, S1; committed `238f47ec` S2) D10: the patch deleted (`git rm`); `npm ci` exit 0 with pristine kokoro-js; the grep exits 1 (exit 0 on the base: the patch); `p3-producer-check.mjs` pass on pristine kokoro-js; the two mocked tts suites pass. Was: the patch's timing code removed or replaced; `git grep -n -l -P '_alignWordsToTimestamps|computeWordTimestamps' -- src main scripts patches` exits 1; kokoro-js still loads in the producer (`p3-producer-check.mjs` exit 0 after `npm ci` re-applies the patch).
- [ ] D3 recorded-output log: every highlight commit paired with its frame timestamp and the playback sample via `AudioContext.getOutputTimestamp()`, written per session under the run's override folder (never the profile); `scripts/narrate-rebuild/p5-recorded-output-check.mjs` over a ≥ 5-minute session at 1.00x and at 2.00x exits 0 (0 commits outside one measured refresh interval; clock-mapping uncertainty ≤ 10 ms, else INCONCLUSIVE, never a pass), `--break` exit 1; the D5 analysis (0 overlaps, 0 drops, 0 repeats) in the same script.
- [x] (2026-10-13 14:12, S2, `573706ea`) D5 crossings: `tests/narrate/narrate.crossings.test.ts` 3 tests pass. Positive controls: section-end breaks disabled → the runtime crossing test fails (after it was made non-vacuous: section A now ends unpunctuated, so only the section end can stop a chunk); the speed-change stop removed → the speed test fails. Real defect found and fixed: `chunkBreaks` compared the engine words to `bookWords.words` by identity, but `start()` passes a copy, so chunks never broke at section ends in the product. Was: D5 crossings: section and chapter crossings (F2's Introduction → "HIS FIRST BOOK") with named tests (`tests/narrate/narrate.crossings.test.ts`: the chunk plan never crosses a section boundary, the cursor continues across it, the view follows the section); adjacent and extreme speed changes at the runtime seam.
- [ ] D6 repair (2026-10-13 14:08, S2, Decision #17, `238f47ec`) after the warm smoke FAIL (`phase5/latency-e2e.smoke-1.json`): two producer workers, chunk ramp [6, 12, 24], preload on entry, producer shutdown on quit, untimed warm-up in the warm trial. This is the charter's one repair attempt: a trial at or over budget after it is a BLOCKER(USER).
- [ ] D6 end-to-end latency: `scripts/narrate-rebuild/p5-latency-e2e.mjs` (or an in-app trial driver) per T7 — warm 20 per request type (Play, resume, word click, speed change) at 1.00x and at 2.00x, cold 5 per type from a fresh process — request → first voiced sample on the playback clock, on the owner's ordinary desktop (Decision #13) with the product's levers (leading-silence trim, first chunk ≤ 15 words, prefetch); the worst case reported, never a mean.
- [x] P5 gate 2026-10-13 21:10 fresh at `821857b9` (Gate log) → merged `05a5480a` 21:12.
- [x] P6 opened 2026-10-13 21:13 at `05a5480a` (branch `eb/narrate-rebuild-1-p6`, worktree `.worktrees/narrate-rebuild-1-p6`); the P5 merge records are its first commit (base trailer).
- [ ] P6: `npm ci` in this worktree; production build for the owner; stop at **G2** (D12 listening sign-off; D2 and D7 F5 owner-observed on that build).
- [ ] P6b wave A (Decision #23, plan § P6b): fixtures first commit (Kokoro tokenizer + Apache-2.0 LICENSE, The Raven 1845, the equality check); positive controls seen failing on base; F1–F5, the abbreviation- and title-aware sentence end, the trial driver; app-ICU tooling and the sweep gate; MAPPING_POLICY.md; G1–G15; checkpoint; stop for Brain's review and quiet window.
- [ ] P6b wave B in Brain's quiet window: the 1-minute launcher smoke; D3/D5 on the P6b build; D2 from 2970 "ancient" across 5480 "HIS FIRST BOOK" plus ≥ 2 min, text-checked; then the completion protocol (D1–D15).
