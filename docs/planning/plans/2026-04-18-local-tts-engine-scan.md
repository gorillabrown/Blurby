# Local TTS Engine Scan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run a Blurby-specific, commercially gated local TTS engine scan that compares Kokoro against MOSS-TTS, Qwen3-TTS, Chatterbox Turbo, and MeloTTS using a fixed corpus, reproducible artifact layout, candidate dossiers, and a final recommendation memo without changing Blurby's shipping runtime until a winner earns a separate prototype lane.

**Architecture:** Keep the scan isolated from product/runtime code. Reuse the repo's existing fixture/manifests/artifact culture, but add a separate research workspace under `docs/studies/research/tts-engine-scan/`, a separate corpus under `tests/fixtures/narration/engine-scan/`, and a lightweight artifact indexer so the current release-gate harness (`scripts/tts_eval_runner.mjs`) and live Kokoro integration (`main/tts-engine.js`, `main/ipc/tts.js`, `src/hooks/useNarration.ts`) stay stable during the scan.

**Tech Stack:** Markdown, JSON manifests, Node.js helper scripts, Vitest validation tests, PowerShell, and optional candidate-specific Python virtualenvs for offline synthesis.

---

## Guardrails

- This lane is research, not product integration. Do not modify `main/tts-engine.js`, `main/ipc/tts.js`, `src/hooks/useNarration.ts`, `src/types.ts`, or `scripts/tts_eval_runner.mjs`.
- Use official model/vendor/license sources first for every candidate. Treat unclear commercial posture as a fail until proven otherwise.
- Keep all scan text fixtures self-authored or public-domain. Do not paste copyrighted book passages into the repo.
- Keep large audio artifacts out of git. Commit docs, manifests, scripts, and tests only.
- If a candidate only works in a CUDA-heavy or Linux-only shape that is implausible for Blurby's current desktop target, record that fact in the dossier and do not contort the product runtime to make it fit.

## File Structure

**Create**

- `docs/studies/research/tts-engine-scan/README.md`
- `docs/studies/research/tts-engine-scan/RUN_LOG.md`
- `docs/studies/research/tts-engine-scan/EVALUATION_RUBRIC.md`
- `docs/studies/research/tts-engine-scan/REVIEW_TEMPLATE.md`
- `docs/studies/research/tts-engine-scan/SCREENING_SUMMARY.md`
- `docs/studies/research/tts-engine-scan/SHORTLIST.md`
- `docs/studies/research/tts-engine-scan/FINAL_RECOMMENDATION.md`
- `docs/studies/research/tts-engine-scan/candidate-registry.json`
- `docs/studies/research/tts-engine-scan/candidates/KOKORO.md`
- `docs/studies/research/tts-engine-scan/candidates/MOSS-TTS.md`
- `docs/studies/research/tts-engine-scan/candidates/QWEN3-TTS.md`
- `docs/studies/research/tts-engine-scan/candidates/CHATTERBOX-TURBO.md`
- `docs/studies/research/tts-engine-scan/candidates/MELOTTS.md`
- `tests/fixtures/narration/engine-scan/manifest.json`
- `tests/fixtures/narration/engine-scan/literary-punctuation.txt`
- `tests/fixtures/narration/engine-scan/long-sentence-cadence.txt`
- `tests/fixtures/narration/engine-scan/dialogue-attribution.txt`
- `tests/fixtures/narration/engine-scan/heading-short-lines.txt`
- `tests/fixtures/narration/engine-scan/continuous-chapter-passage.txt`
- `tests/fixtures/narration/engine-scan/transition-reentry.txt`
- `scripts/tts_engine_scan_index.mjs`
- `tests/ttsEngineScanCorpus.test.ts`
- `tests/ttsEngineScanIndex.test.ts`
- `artifacts/tts-eval/engine-scan/README.md`

**Modify**

- `.gitignore`
- `package.json`

**Leave Unchanged In This Lane**

- `main/tts-engine.js`
- `main/ipc/tts.js`
- `src/hooks/useNarration.ts`
- `src/types.ts`
- `scripts/tts_eval_runner.mjs`
- `tests/fixtures/narration/manifest.json`
- `tests/fixtures/narration/matrix.manifest.json`

### Task 1: Scaffold the Research Lane and Keep Binary Artifacts Out of Git

**Files:**

- Create: `docs/studies/research/tts-engine-scan/README.md`
- Create: `docs/studies/research/tts-engine-scan/RUN_LOG.md`
- Create: `artifacts/tts-eval/engine-scan/README.md`
- Modify: `.gitignore`

- [ ] **Step 1: Create the research and artifact directories**

```powershell
New-Item -ItemType Directory -Force `
  'docs/studies/research/tts-engine-scan', `
  'docs/studies/research/tts-engine-scan/candidates', `
  'artifacts/tts-eval/engine-scan' | Out-Null
```

- [ ] **Step 2: Update `.gitignore` so scan audio stays local-only**

```gitignore
artifacts/tts-eval/engine-scan/**
!artifacts/tts-eval/engine-scan/README.md
```

- [ ] **Step 3: Write the lane index in `docs/studies/research/tts-engine-scan/README.md`**

```markdown
# Local TTS Engine Scan

## Scope
- Approved spec: `docs/planning/specs/2026-04-18-local-tts-engine-scan-design.md`
- Baseline: Kokoro
- In-scope challengers: MOSS-TTS, Qwen3-TTS, Chatterbox Turbo, MeloTTS
- Excluded from active lane: VibeVoice, Voxtral-4B-TTS-2603, Irodori-TTS-500M-v2

## Deliverables
- Candidate dossiers
- Fixed corpus
- Audio artifacts in `artifacts/tts-eval/engine-scan/`
- Shortlist table
- Final recommendation memo

## Guardrails
- No runtime integration work in `main/` or `src/`
- Official-source verification only for shipping posture
- Keep audio artifacts out of git
```

- [ ] **Step 4: Write `docs/studies/research/tts-engine-scan/RUN_LOG.md`**

```markdown
# Local TTS Engine Scan Run Log

| Date | Candidate | Host | Runtime shape | Command | Outcome | Notes |
|---|---|---|---|---|---|---|
| 2026-04-18 | kokoro | windows-cpu | node/onnx | recorded-in-dossier | baseline-control | first full-corpus baseline |
```

- [ ] **Step 5: Write `artifacts/tts-eval/engine-scan/README.md` with the artifact contract**

```markdown
# Engine Scan Artifacts

Each candidate gets its own folder:

artifacts/tts-eval/engine-scan/kokoro/
  run-manifest.json
  audio/literary-punctuation.wav
  notes/literary-punctuation.md

Repeat the same layout for `moss-tts`, `qwen3-tts`, `chatterbox-turbo`, and `melotts`.

`run-manifest.json` must list:
- `candidateId`
- `generatedAt`
- `runtime.shape`
- `runtime.device`
- `runtime.host`
- `outputs[]` with `fixtureId`, `audioFile`, `notesFile`, `wallSeconds`, and `usableWindowChars`
```

- [ ] **Step 6: Verify the ignore rule works before generating any audio**

Run: `git check-ignore -v artifacts/tts-eval/engine-scan/example.wav`

Expected: output points at `.gitignore` and the path is treated as ignored.

- [ ] **Step 7: Commit the scaffold**

```bash
git add .gitignore docs/studies/research/tts-engine-scan artifacts/tts-eval/engine-scan/README.md
git commit -m "docs: scaffold local tts engine scan lane"
```

### Task 2: Build a Real Long-Form Corpus and Research-Specific Review Rubric

**Files:**

- Create: `tests/fixtures/narration/engine-scan/manifest.json`
- Create: `tests/fixtures/narration/engine-scan/literary-punctuation.txt`
- Create: `tests/fixtures/narration/engine-scan/long-sentence-cadence.txt`
- Create: `tests/fixtures/narration/engine-scan/dialogue-attribution.txt`
- Create: `tests/fixtures/narration/engine-scan/heading-short-lines.txt`
- Create: `tests/fixtures/narration/engine-scan/continuous-chapter-passage.txt`
- Create: `tests/fixtures/narration/engine-scan/transition-reentry.txt`
- Create: `docs/studies/research/tts-engine-scan/EVALUATION_RUBRIC.md`
- Create: `docs/studies/research/tts-engine-scan/REVIEW_TEMPLATE.md`
- Test: `tests/ttsEngineScanCorpus.test.ts`

- [ ] **Step 1: Write the failing corpus-validation test**

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve("tests/fixtures/narration/engine-scan");
const manifestPath = path.join(root, "manifest.json");

describe("tts engine scan corpus", () => {
  it("covers the required fixture classes", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const ids = manifest.fixtures.map((fixture: { id: string }) => fixture.id);

    expect(ids).toEqual(expect.arrayContaining([
      "literary-punctuation",
      "long-sentence-cadence",
      "dialogue-attribution",
      "heading-short-lines",
      "continuous-chapter-passage",
      "transition-reentry",
    ]));
  });

  it("contains a continuous passage that is large enough for 5+ minutes of narration", () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const fixture = manifest.fixtures.find((item: { id: string }) => item.id === "continuous-chapter-passage");
    const text = fs.readFileSync(path.join(root, fixture.file), "utf8");
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

    expect(wordCount).toBeGreaterThanOrEqual(1000);
  });
});
```

- [ ] **Step 2: Run the new test to prove the corpus does not exist yet**

Run: `npx vitest run tests/ttsEngineScanCorpus.test.ts`

Expected: FAIL because `tests/fixtures/narration/engine-scan/manifest.json` and the new text files are missing.

- [ ] **Step 3: Create `tests/fixtures/narration/engine-scan/manifest.json`**

```json
{
  "schemaVersion": "1.0",
  "fixtures": [
    {
      "id": "literary-punctuation",
      "title": "Literary Punctuation Stress",
      "file": "literary-punctuation.txt",
      "sourceType": "prose",
      "goals": ["punctuation-prosody", "phrase-shaping"]
    },
    {
      "id": "long-sentence-cadence",
      "title": "Long Sentence Cadence",
      "file": "long-sentence-cadence.txt",
      "sourceType": "prose",
      "goals": ["long-sentence-cadence", "breath-grouping"]
    },
    {
      "id": "dialogue-attribution",
      "title": "Dialogue and Attribution",
      "file": "dialogue-attribution.txt",
      "sourceType": "dialogue",
      "goals": ["dialogue-phrasing", "attribution-prosody"]
    },
    {
      "id": "heading-short-lines",
      "title": "Headings and Short Lines",
      "file": "heading-short-lines.txt",
      "sourceType": "layout",
      "goals": ["short-line-reset", "heading-tone"]
    },
    {
      "id": "continuous-chapter-passage",
      "title": "Continuous Chapter Passage",
      "file": "continuous-chapter-passage.txt",
      "sourceType": "long-form",
      "goals": ["continuity", "seam-audibility", "voice-fatigue"]
    },
    {
      "id": "transition-reentry",
      "title": "Transition Re-entry",
      "file": "transition-reentry.txt",
      "sourceType": "transition",
      "goals": ["section-reentry", "restart-naturalness"]
    }
  ]
}
```

- [ ] **Step 4: Author the text fixtures**

Create the six `.txt` files listed above using self-authored or public-domain prose only.

Required content constraints:

- `literary-punctuation.txt`: punctuation-heavy literary-style prose
- `long-sentence-cadence.txt`: multiple long sentences with subordinate clauses
- `dialogue-attribution.txt`: alternating dialogue, quotes, and speaker tags
- `heading-short-lines.txt`: headings, subheads, and short standalone lines
- `continuous-chapter-passage.txt`: at least 1000 words of continuous prose suitable for 5-10 minutes of narration
- `transition-reentry.txt`: paragraph and section break material that reveals restart awkwardness

- [ ] **Step 5: Write the research scoring rubric in `docs/studies/research/tts-engine-scan/EVALUATION_RUBRIC.md`**

```markdown
# Engine Scan Evaluation Rubric

## Hard Gates
- Commercial / product-use posture
- Local / offline viability
- No audible disclaimer / watermark behavior

## Audio Scores (1-5)
- Punctuation prosody
- Long-sentence cadence
- Dialogue handling
- Long-form continuity
- Seam audibility
- Voice fatigue over time

## Product-Fit Scores (1-5)
- Consumer hardware realism
- Runtime complexity
- Timing metadata compatibility
- Speed-control compatibility
- Packaging/distribution burden
```

- [ ] **Step 6: Write `docs/studies/research/tts-engine-scan/REVIEW_TEMPLATE.md`**

```markdown
# Engine Scan Review Template

## Run Metadata
- Candidate:
- Fixture:
- Host:
- Runtime shape:
- Audio file:

## Hard Gates
- Commercial posture:
- Local/offline:
- Disclaimer/watermark risk:

## Scoring (1-5)
- Punctuation prosody:
- Long-sentence cadence:
- Dialogue handling:
- Long-form continuity:
- Seam audibility:
- Voice fatigue:
- Runtime practicality:

## Notes
- What sounded natural:
- What broke:
- Did it beat Kokoro here:
```

- [ ] **Step 7: Re-run the corpus-validation test**

Run: `npx vitest run tests/ttsEngineScanCorpus.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit the corpus and rubric**

```bash
git add tests/fixtures/narration/engine-scan docs/studies/research/tts-engine-scan/EVALUATION_RUBRIC.md docs/studies/research/tts-engine-scan/REVIEW_TEMPLATE.md tests/ttsEngineScanCorpus.test.ts
git commit -m "test: add local tts engine scan corpus"
```

### Task 3: Create the Candidate Registry, Hard-Gate Summary, and Dossier Set

**Files:**

- Create: `docs/studies/research/tts-engine-scan/candidate-registry.json`
- Create: `docs/studies/research/tts-engine-scan/SCREENING_SUMMARY.md`
- Create: `docs/studies/research/tts-engine-scan/candidates/KOKORO.md`
- Create: `docs/studies/research/tts-engine-scan/candidates/MOSS-TTS.md`
- Create: `docs/studies/research/tts-engine-scan/candidates/QWEN3-TTS.md`
- Create: `docs/studies/research/tts-engine-scan/candidates/CHATTERBOX-TURBO.md`
- Create: `docs/studies/research/tts-engine-scan/candidates/MELOTTS.md`

- [ ] **Step 1: Create the registry of included and excluded engines**

```json
{
  "baseline": ["kokoro"],
  "activeCandidates": [
    { "id": "moss-tts", "track": "context" },
    { "id": "qwen3-tts", "track": "context" },
    { "id": "chatterbox-turbo", "track": "practical" },
    { "id": "melotts", "track": "practical" }
  ],
  "excluded": [
    { "id": "vibevoice", "reason": "production-posture-and-watermark-risk" },
    { "id": "voxtral-4b-tts-2603", "reason": "non-commercial-license" },
    { "id": "irodori-tts-500m-v2", "reason": "language-scope-mismatch" }
  ]
}
```

- [ ] **Step 2: Create the five candidate dossiers with the same section structure**

Use these headings in each file:

```markdown
# Candidate Name

## Snapshot
- Track:
- Current verdict:
- Last verified:

## Official Sources
- Primary repo/model page:
- License page:
- Runtime docs:

## Hard-Gate Screen
- Commercial posture:
- Local/offline viability:
- Audible disclaimer/watermark risk:

## Runtime Shape
- Host OS:
- CPU path:
- GPU path:
- Python / Node / ONNX / other:
- Weight size:

## Blurby-Relevant Questions
- Long usable inference window:
- Punctuation prosody expectation:
- Timing metadata availability:
- Exact-speed compatibility risk:
- Packaging/distribution burden:

## Commands Used
- Smoke synthesis:
- Full-corpus synthesis:

## Findings
- Wins over Kokoro:
- Losses versus Kokoro:
- Open concerns:
```

- [ ] **Step 3: Source-verify every active candidate using official sources only**

For each active candidate:

- record the official page and license
- record the exact verification date
- write a plain-language commercial-use verdict
- write a plain-language local/offline verdict
- note whether the runtime is consumer-laptop-plausible, workstation-only, or watchlist-only
- record the exact smoke/full-corpus commands that will be used later in Task 5

- [ ] **Step 4: Write `docs/studies/research/tts-engine-scan/SCREENING_SUMMARY.md`**

```markdown
# Screening Summary

| Candidate | Track | Commercial gate | Local/offline gate | Runtime posture | Status |
|---|---|---|---|---|---|
| Kokoro | baseline | pass | pass | shipping baseline | keep |
| MOSS-TTS | context | pending-verification | pending-verification | to-be-verified | pending |
| Qwen3-TTS | context | pending-verification | pending-verification | to-be-verified | pending |
| Chatterbox Turbo | practical | pending-verification | pending-verification | to-be-verified | pending |
| MeloTTS | practical | pending-verification | pending-verification | to-be-verified | pending |
```

- [ ] **Step 5: Verify the dossier set is complete before generating any audio**

Run:

```powershell
Get-ChildItem 'docs/studies/research/tts-engine-scan/candidates' -File | Select-Object -ExpandProperty Name
Get-Content -Raw 'docs/studies/research/tts-engine-scan/candidate-registry.json'
```

Expected:

- one dossier each for Kokoro, MOSS-TTS, Qwen3-TTS, Chatterbox Turbo, and MeloTTS
- excluded engines listed in the registry and not treated as active audio-generation targets

- [ ] **Step 6: Commit the registry and dossiers**

```bash
git add docs/studies/research/tts-engine-scan/candidate-registry.json docs/studies/research/tts-engine-scan/SCREENING_SUMMARY.md docs/studies/research/tts-engine-scan/candidates
git commit -m "docs: add tts engine scan dossiers"
```

### Task 4: Add a Lightweight Artifact Indexer Instead of Reusing the Release Gate Harness

**Files:**

- Create: `scripts/tts_engine_scan_index.mjs`
- Create: `tests/ttsEngineScanIndex.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing test for the artifact indexer**

```ts
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildScanIndex } from "../scripts/tts_engine_scan_index.mjs";

describe("tts engine scan index", () => {
  it("flags missing fixture outputs for an active candidate", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tts-scan-"));
    const registryPath = path.join(tmp, "candidate-registry.json");
    const fixtureManifestPath = path.join(tmp, "manifest.json");
    const artifactsRoot = path.join(tmp, "artifacts");

    fs.writeFileSync(registryPath, JSON.stringify({
      baseline: ["kokoro"],
      activeCandidates: [{ id: "moss-tts", track: "context" }],
      excluded: []
    }));

    fs.writeFileSync(fixtureManifestPath, JSON.stringify({
      fixtures: [{ id: "literary-punctuation", file: "literary-punctuation.txt" }]
    }));

    fs.mkdirSync(path.join(artifactsRoot, "moss-tts"), { recursive: true });
    fs.writeFileSync(path.join(artifactsRoot, "moss-tts", "run-manifest.json"), JSON.stringify({
      candidateId: "moss-tts",
      outputs: []
    }));

    const index = await buildScanIndex({ registryPath, fixtureManifestPath, artifactsRoot });
    expect(index.candidates[0].missingFixtures).toContain("literary-punctuation");
  });
});
```

- [ ] **Step 2: Run the test and confirm the helper does not exist yet**

Run: `npx vitest run tests/ttsEngineScanIndex.test.ts`

Expected: FAIL because `scripts/tts_engine_scan_index.mjs` does not yet export `buildScanIndex`.

- [ ] **Step 3: Implement `scripts/tts_engine_scan_index.mjs`**

The script must:

- read `docs/studies/research/tts-engine-scan/candidate-registry.json`
- read `tests/fixtures/narration/engine-scan/manifest.json`
- inspect `artifacts/tts-eval/engine-scan/kokoro/run-manifest.json` and the same file in each challenger folder
- verify that every active candidate has one output per required fixture
- write:
  - `artifacts/tts-eval/engine-scan/index/summary.json`
  - `artifacts/tts-eval/engine-scan/index/summary.txt`
- expose `buildScanIndex()` for the test file

- [ ] **Step 4: Add package scripts**

```json
{
  "scripts": {
    "tts:scan:index": "node scripts/tts_engine_scan_index.mjs",
    "tts:scan:validate": "vitest run tests/ttsEngineScanCorpus.test.ts tests/ttsEngineScanIndex.test.ts"
  }
}
```

- [ ] **Step 5: Re-run the validation tests**

Run: `npm run tts:scan:validate`

Expected: PASS.

- [ ] **Step 6: Dry-run the indexer against the empty real artifact tree**

Run: `npm run tts:scan:index -- --artifacts-root artifacts/tts-eval/engine-scan`

Expected:

- `artifacts/tts-eval/engine-scan/index/summary.json` is created
- active candidates show missing outputs until Task 5 populates them

- [ ] **Step 7: Commit the helper and tests**

```bash
git add scripts/tts_engine_scan_index.mjs tests/ttsEngineScanIndex.test.ts package.json
git commit -m "feat: add tts engine scan artifact indexer"
```

### Task 5: Capture the Kokoro Baseline First, Then Run Only the Surviving Challengers

**Files:**

- Update: `docs/studies/research/tts-engine-scan/RUN_LOG.md`
- Update: `docs/studies/research/tts-engine-scan/candidates/KOKORO.md`
- Update: `docs/studies/research/tts-engine-scan/candidates/MOSS-TTS.md`
- Update: `docs/studies/research/tts-engine-scan/candidates/QWEN3-TTS.md`
- Update: `docs/studies/research/tts-engine-scan/candidates/CHATTERBOX-TURBO.md`
- Update: `docs/studies/research/tts-engine-scan/candidates/MELOTTS.md`
- Create/Update (ignored): `artifacts/tts-eval/engine-scan/kokoro/run-manifest.json` and the matching per-candidate files for each challenger
- Create/Update (ignored): `artifacts/tts-eval/engine-scan/kokoro/audio/*.wav` and the matching per-candidate audio folders for each challenger
- Create/Update (ignored): `artifacts/tts-eval/engine-scan/kokoro/notes/*.md` and the matching per-candidate notes folders for each challenger
- Create: `docs/studies/research/tts-engine-scan/SHORTLIST.md`

- [ ] **Step 1: Run the Kokoro baseline across the full engine-scan corpus**

Use the exact commands recorded in `docs/studies/research/tts-engine-scan/candidates/KOKORO.md`.

Required outputs:

- one `.wav` file per engine-scan fixture
- `artifacts/tts-eval/engine-scan/kokoro/run-manifest.json`
- one notes file per fixture under `artifacts/tts-eval/engine-scan/kokoro/notes/`
- a `RUN_LOG.md` entry with host, command, and outcome

- [ ] **Step 2: Review Kokoro before touching any challenger**

Use `docs/studies/research/tts-engine-scan/REVIEW_TEMPLATE.md` and fill notes for:

- punctuation prosody
- long-sentence cadence
- seam audibility on the continuous passage
- exact-speed behavior limitations already known in Blurby

- [ ] **Step 3: For each candidate that passed Task 3 hard gates, run a smoke pass before the full corpus**

For `moss-tts`, `qwen3-tts`, `chatterbox-turbo`, and `melotts`:

- run the exact smoke command recorded in the dossier
- confirm the engine produces offline local audio
- if the smoke pass fails or exposes disqualifying runtime posture, mark the candidate `reject` or `watchlist` in the dossier and stop there

- [ ] **Step 4: Run the full corpus for each surviving challenger**

For each surviving candidate:

- generate the six fixture outputs
- write `run-manifest.json` with per-fixture `audioFile`, `notesFile`, `wallSeconds`, and `usableWindowChars`
- update `RUN_LOG.md`
- add reviewer notes to the candidate dossier

- [ ] **Step 5: Run the artifact indexer after every candidate batch**

Run: `npm run tts:scan:index -- --artifacts-root artifacts/tts-eval/engine-scan`

Expected:

- `summary.json` and `summary.txt` reflect which candidates are complete
- missing fixtures or partial runs are obvious before the final ranking is written

- [ ] **Step 6: Write `docs/studies/research/tts-engine-scan/SHORTLIST.md`**

Use this structure:

```markdown
# Shortlist

## Ranking Table
| Candidate | Track | Audio upside | Runtime cost | Product-fit risk | Verdict |
|---|---|---|---|---|---|

## Strongest Long-Form Opportunity Under Current Evidence

## Strongest Practical Opportunity Under Current Evidence

## Most Defensible Next Step Under Current Evidence

## Rejected / Watchlist Notes
```

- [ ] **Step 7: Commit the docs and helper updates, but not the audio**

```bash
git add docs/studies/research/tts-engine-scan
git commit -m "docs: record local tts engine scan findings"
```

### Task 6: Write the Final Recommendation and Gate Any Follow-On Prototype Work

**Files:**

- Create: `docs/studies/research/tts-engine-scan/FINAL_RECOMMENDATION.md`
- Update: `docs/studies/research/tts-engine-scan/SHORTLIST.md`

- [ ] **Step 1: Draft the final memo**

Use this structure:

```markdown
# Final Recommendation

## Executive Answer

## What The Scan Demonstrated

## What The Scan Did Not Demonstrate

## Recommendation
- retain Kokoro as the default for now
- prototype one candidate
- prototype two candidates
- watchlist only

## Consequences for Blurby
- runtime integration shape
- timing-truth implications
- speed-control implications
- packaging/distribution implications
```

- [ ] **Step 2: Make the decision explicit**

Pick exactly one outcome:

- `retain-kokoro-default`
- `prototype-one-candidate`
- `prototype-two-candidates`
- `watchlist-only`

If the answer is not a prototype, say why in plain language and name the highest-value Kokoro-side follow-up.
If the answer is `retain-kokoro-default`, make it explicit that this means "best-supported default under current evidence," not "proven best overall TTS engine."

When writing the recommendation, classify every challenger into one of these buckets and keep them separate:

- `completed-empirical-lane` — the candidate completed the planned corpus and can be compared directly
- `attempted-but-dropped` — the candidate was actually run, but failed smoke or full-corpus execution
- `active-but-host-blocked` — the candidate belongs in the active empirical lane, but the current host could not satisfy its runtime requirements
- `not-run-by-design` — the candidate was intentionally not executed because Dispatch A/Dispatch B constraints excluded it

Do not describe `not-run-by-design` candidates as empirical failures.
Do not describe `attempted-but-dropped` candidates as evidence that Kokoro is better on narration quality; they only establish that the challenger did not clear the current execution gate in this environment.
Do not describe `active-but-host-blocked` candidates as empirical failures or as evidence that Kokoro is better on narration quality; they only establish that the required host class was unavailable.

- [ ] **Step 3: If and only if a prototype is justified, open a new design doc instead of editing runtime code in this lane**

Create a follow-on spec at:

- `docs/planning/specs/2026-04-19-tts-enablement-watchlist-design.md`

That follow-on spec is where `main/tts-engine.js`, `main/ipc/tts.js`, `src/hooks/useNarration.ts`, `src/types.ts`, and packaging/runtime decisions may be reconsidered.

- [ ] **Step 4: Verify this lane stayed isolated from the live runtime**

Run:

```powershell
git diff --name-only -- main src
git diff --name-only -- scripts/tts_eval_runner.mjs tests/fixtures/narration/manifest.json tests/fixtures/narration/matrix.manifest.json
```

Expected:

- no changes in `main/` or `src/`
- no changes to the current release-gate harness or its baseline fixture manifests

- [ ] **Step 5: Run the validation suite one last time**

Run: `npm run tts:scan:validate`

Expected: PASS.

- [ ] **Step 6: Commit the final recommendation**

```bash
git add docs/studies/research/tts-engine-scan/FINAL_RECOMMENDATION.md docs/studies/research/tts-engine-scan/SHORTLIST.md
git commit -m "docs: finalize local tts engine scan recommendation"
```

## Spec Coverage Check

- Approved scope preserved: the plan evaluates Kokoro, MOSS-TTS, Qwen3-TTS, Chatterbox Turbo, and MeloTTS only.
- Local-first + commercial-first preserved: Task 3 hard-gates every candidate before audio generation.
- Long-form continuity problem preserved: Task 2 adds a real 5-10 minute corpus item instead of relying on the short existing matrix fixtures.
- Deliverables preserved: candidate dossiers, shortlist table, audio artifact structure, and final recommendation memo are all explicitly created.
- Non-goals preserved: no product runtime integration work happens in this lane.

## Dispatch Breakdown

Use three separate CLI dispatches, not one long-running sprint.

### Dispatch A: Lane Setup, Corpus, Screening, and Tooling

**Covers:**

- Task 1: research lane scaffold + `.gitignore`
- Task 2: engine-scan corpus + rubric + corpus validation test
- Task 3: candidate registry + dossiers + official-source screening
- Task 4: artifact indexer + validation tests

**Do not do in this dispatch:**

- do not generate candidate audio artifacts
- do not write `SHORTLIST.md`
- do not write `FINAL_RECOMMENDATION.md`
- do not modify `main/`, `src/`, `scripts/tts_eval_runner.mjs`, `tests/fixtures/narration/manifest.json`, or `tests/fixtures/narration/matrix.manifest.json`

**Exit condition:**

- `npm run tts:scan:validate` passes
- the dossiers exist and contain commands for later empirical runs
- the screening summary clearly marks which candidates are active, rejected, or watchlist-only

### Dispatch B: Empirical Baseline and Challenger Runs

**Covers:**

- Task 5 only

**Prerequisites:**

- Dispatch A completed
- candidate dossiers contain source-verified runtime commands
- hard-gate screening is already written down

**Do not do in this dispatch:**

- do not rewrite the corpus/tooling architecture
- do not modify live runtime code in `main/` or `src/`
- do not write `FINAL_RECOMMENDATION.md`

**Exit condition:**

- Kokoro baseline is captured
- surviving challengers have smoke/full-corpus results recorded
- `SHORTLIST.md` exists
- `npm run tts:scan:index -- --artifacts-root artifacts/tts-eval/engine-scan` reflects complete or intentionally incomplete candidate runs

### Dispatch C: Decision Memo and Prototype Gate

**Covers:**

- Task 6 only

**Prerequisites:**

- Dispatch B completed
- `SHORTLIST.md` exists
- the run log, dossiers, and artifact index reflect the actual results

**Do not do in this dispatch:**

- do not run new model experiments unless the prior artifacts are clearly incomplete
- do not modify live runtime code
- do not prototype inside this lane

**Exit condition:**

- `FINAL_RECOMMENDATION.md` exists
- one explicit recommendation is chosen
- if a prototype is warranted, a new design spec is opened instead of editing the runtime here

## CLI Hand-Off Extracts

Copy/paste one block at a time into CLI.

### Dispatch A Prompt

```text
Execute Dispatch A for the Blurby local TTS engine scan in C:\Users\estra\Projects\Blurby.

Read and follow this plan exactly:
C:\Users\estra\Projects\Blurby\docs\superpowers\plans\2026-04-18-local-tts-engine-scan.md

Scope for this dispatch:
- Execute Task 1, Task 2, Task 3, and Task 4 only.

Hard constraints:
- Do not execute Task 5 or Task 6.
- Do not modify main/, src/, scripts/tts_eval_runner.mjs, tests/fixtures/narration/manifest.json, or tests/fixtures/narration/matrix.manifest.json.
- Keep large audio artifacts out of git.
- Use official sources only for candidate licensing/commercial/runtime verification.
- If a candidate's commercial posture is unclear, mark it as blocked/pending or reject/watchlist it; do not guess.

Required outputs by the end of this dispatch:
- docs/studies/research/tts-engine-scan/README.md
- docs/studies/research/tts-engine-scan/RUN_LOG.md
- docs/studies/research/tts-engine-scan/EVALUATION_RUBRIC.md
- docs/studies/research/tts-engine-scan/REVIEW_TEMPLATE.md
- docs/studies/research/tts-engine-scan/SCREENING_SUMMARY.md
- docs/studies/research/tts-engine-scan/candidate-registry.json
- docs/studies/research/tts-engine-scan/candidates/KOKORO.md
- docs/studies/research/tts-engine-scan/candidates/MOSS-TTS.md
- docs/studies/research/tts-engine-scan/candidates/QWEN3-TTS.md
- docs/studies/research/tts-engine-scan/candidates/CHATTERBOX-TURBO.md
- docs/studies/research/tts-engine-scan/candidates/MELOTTS.md
- tests/fixtures/narration/engine-scan/*
- scripts/tts_engine_scan_index.mjs
- tests/ttsEngineScanCorpus.test.ts
- tests/ttsEngineScanIndex.test.ts

Required verification before stopping:
- npm run tts:scan:validate
- npm run tts:scan:index -- --artifacts-root artifacts/tts-eval/engine-scan

Close out with:
1. What changed
2. Validation results
3. Which candidates survived screening
4. Anything blocking Dispatch B
```

### Dispatch B Prompt

```text
Execute Dispatch B for the Blurby local TTS engine scan in C:\Users\estra\Projects\Blurby.

Read and follow this plan exactly:
C:\Users\estra\Projects\Blurby\docs\superpowers\plans\2026-04-18-local-tts-engine-scan.md

Scope for this dispatch:
- Execute Task 5 only.

Pre-flight checks:
- Confirm Dispatch A outputs exist.
- Read docs/studies/research/tts-engine-scan/SCREENING_SUMMARY.md.
- Read all active candidate dossiers under docs/studies/research/tts-engine-scan/candidates/.
- If the dossiers do not contain concrete runtime commands, stop and report that Dispatch A is incomplete.

Hard constraints:
- Do not modify main/ or src/.
- Do not rewrite the corpus/tooling architecture unless a critical bug prevents Task 5 from running.
- Do not write docs/studies/research/tts-engine-scan/FINAL_RECOMMENDATION.md in this dispatch.
- Keep audio artifacts local-only and out of git.
- Run Kokoro first as the control.
- Only run challengers that actually passed or remained active after Dispatch A screening.
- Treat Qwen3-TTS as an active challenger, not a watchlist-only lane.
- If the current host cannot satisfy Qwen3-TTS runtime requirements, record it as `active-but-host-blocked`, not `not-run-by-design`.

Required outputs by the end of this dispatch:
- updated docs/studies/research/tts-engine-scan/RUN_LOG.md
- updated active candidate dossiers with empirical findings
- docs/studies/research/tts-engine-scan/SHORTLIST.md
- artifacts/tts-eval/engine-scan/<candidate>/run-manifest.json for each run candidate
- artifacts/tts-eval/engine-scan/index/summary.json
- artifacts/tts-eval/engine-scan/index/summary.txt

Required verification before stopping:
- npm run tts:scan:index -- --artifacts-root artifacts/tts-eval/engine-scan

Close out with:
1. Which candidates were actually run
2. Which candidates were dropped after smoke tests and why
3. Which candidates were host-blocked and why
4. The current shortlist ranking
5. Anything blocking Dispatch C
```

### Dispatch C Prompt

```text
Execute Dispatch C for the Blurby local TTS engine scan in C:\Users\estra\Projects\Blurby.

Read and follow this plan exactly:
C:\Users\estra\Projects\Blurby\docs\superpowers\plans\2026-04-18-local-tts-engine-scan.md

Scope for this dispatch:
- Execute Task 6 only.

Pre-flight checks:
- Confirm docs/studies/research/tts-engine-scan/SHORTLIST.md exists.
- Read docs/studies/research/tts-engine-scan/RUN_LOG.md.
- Read docs/studies/research/tts-engine-scan/SCREENING_SUMMARY.md.
- Read all updated candidate dossiers and the artifact index summary.
- If the empirical record is incomplete, stop and report what Dispatch B still owes.

Hard constraints:
- Do not modify main/ or src/.
- Do not prototype any runtime integration in this dispatch.
- If a prototype is justified, open a new spec under docs/planning/specs/ instead of changing runtime code here.
- Pick exactly one final recommendation outcome.
- Preserve the distinction between:
  - completed empirical lanes
  - attempted-but-dropped lanes
  - active-but-host-blocked lanes
  - not-run-by-design lanes
- Do not treat a candidate that was read but intentionally not run under Dispatch B constraints as a failed runtime experiment.
- Do not treat an active Qwen3-TTS lane that could not run on the current host as a policy exclusion or as evidence that Kokoro has beaten Qwen on quality.
- Do not claim Kokoro is the best overall engine unless the written evidence actually supports that stronger statement.
- If Kokoro remains the recommendation, frame it as the best-supported default under current evidence and current host constraints.

Required outputs by the end of this dispatch:
- docs/studies/research/tts-engine-scan/FINAL_RECOMMENDATION.md
- updated docs/studies/research/tts-engine-scan/SHORTLIST.md if needed
- if warranted, a new prototype design spec under docs/planning/specs/

Required verification before stopping:
- npm run tts:scan:validate
- git diff --name-only -- main src
- git diff --name-only -- scripts/tts_eval_runner.mjs tests/fixtures/narration/manifest.json tests/fixtures/narration/matrix.manifest.json

Close out with:
1. The final recommendation
2. The clearest reason for that recommendation
3. Whether a prototype spec was opened
4. Confirmation that the live runtime lane stayed untouched
```

## Execution Handoff

Plan complete and saved to `docs/planning/plans/2026-04-18-local-tts-engine-scan.md`.

Two execution options:

**1. Subagent-Driven (recommended)** - dispatch a fresh worker per task, review between tasks, and keep the research lane isolated.

**2. Inline Execution** - execute the tasks in one session, batching the doc/script/corpus work before the external candidate runs.
