# POSTV2 Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the post-v2 audit findings into a clean, packaged, typechecked, posture-consistent desktop baseline without changing the Desktop v2 engine decision.

**Architecture:** This plan is split into three sequential sprints. `POSTV2-REL-1` fixes release truth and packaged sidecar viability. `POSTV2-ENGINE-1` closes engine posture drift across Qwen, Pocket, defaults, and TypeScript contracts. `POSTV2-NARR-1` fixes narration/highlighting, security, artifact hygiene, and the highest-value structural debt.

**Tech Stack:** Electron main/preload IPC, Vite/React/TypeScript renderer, Vitest, electron-builder, local Python/Node sidecars, repo governance docs.

---

## Non-Negotiable Product Posture

- Kokoro remains default and available.
- MOSS-Nano remains recommended opt-in.
- Pocket TTS remains available opt-in; upstream synthesis adapter work is not expanded unless explicitly scoped.
- Qwen remains retired/disabled for Desktop v2. No task may reactivate Qwen, expose Qwen as selectable, or use Qwen as a fallback/default.
- No sprint may use generated artifact cleanup as evidence deletion. Preserve canonical summaries needed by release docs, but stop tracking bulky generated audio outputs.

## Consolidated Findings Registry

| ID | Severity | Finding | Primary Coordinates | Owner Sprint |
|----|----------|---------|---------------------|--------------|
| F01 | P1 | Typecheck is red but not part of the release gate. | `package.json:15`; failing `npm run typecheck` | POSTV2-ENGINE-1 |
| F02 | P2 | Browser ElectronAPI stub is stale relative to required qwen stream methods. | `src/test-harness/electron-api-stub.ts:265`; `src/types.ts:613-616` | POSTV2-ENGINE-1 |
| F03 | P2 | `DEFAULT_SETTINGS` is not a complete `BlurbySettings` object. | `src/constants.ts:505`; `src/types.ts:374` | POSTV2-ENGINE-1 |
| F04 | P2 | Generated audio artifacts are effectively part of the repo. | `.gitignore:24`; `artifacts/moss/**`; `artifacts/tts-eval/**` | POSTV2-NARR-1 |
| F05 | P2 | Package version trails closed release state. | `package.json:3`; `package-lock.json:3`; `package-lock.json:9`; `ROADMAP.md` | POSTV2-REL-1 |
| F06 | Critical | Packaged MOSS/Pocket likely fail outside dev checkout. | `package.json:28`; `main/moss-nano-sidecar.js:7`; `main/moss-nano-engine.js:13`; Pocket sidecar equivalents | POSTV2-REL-1 |
| F07 | High | Qwen is retired in product posture but still live at IPC/preload/runtime boundaries. | `main/ipc/tts.js:210`; `preload.js:184`; Qwen runtime modules | POSTV2-ENGINE-1 |
| F08 | High | EPUB Narrate likely misses per-word highlighting. | `src/components/FoliatePageView.tsx:1297` | POSTV2-NARR-1 |
| F09 | High | Governance docs contradict release posture. | `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md:7`; `CLAUDE.md:338` | POSTV2-ENGINE-1 |
| F10 | High | Release/version/update state is inconsistent; update UI can install before download completes. | `package.json:3`; `ROADMAP.md`; release notes; update UI/update service files | POSTV2-REL-1 |
| F11 | High | Evidence/artifact hygiene is leaky; local exclude carries repo policy. | `.gitignore`; `.git/info/exclude`; dirty generated summaries/perf results | POSTV2-NARR-1 |
| F12 | Medium-high | Profile portability is stale: allows qwen and omits pocket-tts. | `src/utils/narrationPortability.ts:71` | POSTV2-ENGINE-1 |
| F13 | Medium | Pocket errors are stored as Nano errors. | `src/hooks/useNarration.ts:371` | POSTV2-ENGINE-1 |
| F14 | Medium-high | `open-doc-source` lacks URL protocol validation. | `main/ipc/documents.js:100` | POSTV2-NARR-1 |
| F15 | Medium | Structural debt slows safe changes. | `src/hooks/useNarration.ts`; `src/components/FoliatePageView.tsx`; `src/components/ReaderContainer.tsx`; `scripts/moss_nano_probe.mjs`; `tests/mossNanoProbe.test.js`; `main/legacy-parsers.js:1` | POSTV2-NARR-1 |
| F16 | P2 | Segment metadata types drift between Kokoro chunk segmentation and scheduler consumers. | `src/utils/audio/segmentKokoroChunk.ts:114`; `src/utils/audioScheduler.ts:225` | POSTV2-ENGINE-1 |
| F17 | P2 | ES lib mismatch: code/tests use `replaceAll` while TS lib remains ES2020. | `tsconfig.json`; `src/components/settings/qwenStatusPresentation.ts:3` | POSTV2-ENGINE-1 |

## Sprint Order

1. `POSTV2-REL-1`: Packaged Release Truth
2. `POSTV2-ENGINE-1`: Engine Retirement, Persistence, and Type Contracts
3. `POSTV2-NARR-1`: Narrate Contract, Security, Artifact Hygiene, and Debt Map

This order is intentional. Packaging/version truth must define what is being shipped before engine boundaries are changed. Engine contract cleanup should land before narration/security cleanup because it makes `npm run typecheck` meaningful as a final gate.

---

## POSTV2-REL-1: Packaged Release Truth

**Goal:** A packaged app can launch the promised engines from packaged paths, reports the correct version, and cannot offer update installation before the update is downloaded.

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `main/moss-nano-sidecar.js`
- Modify: `main/moss-nano-engine.js`
- Modify: Pocket sidecar/engine files discovered by `git grep -n "pocket" main preload.js src`
- Modify: update service/UI files discovered by `git grep -n "downloaded\\|install\\|autoUpdater\\|update" main src preload.js`
- Modify: `docs/project/desktop-v2.0-release-notes.md`
- Modify: `docs/project/desktop-v2.0-release-checklist.md`
- Modify: `ROADMAP.md`
- Test: existing packaging/build tests plus new path resolver tests if no coverage exists

### Task 1: Package Sidecar Asset Inventory

- [ ] **Step 1: Identify every sidecar runtime path.**

Run:

```powershell
git grep -n -E "moss|nano|pocket|\\.runtime|scripts|process\\.resourcesPath|app\\.isPackaged" main preload.js src scripts package.json
```

Expected: a complete list of hardcoded dev-checkout path assumptions and existing packaged path helpers.

- [ ] **Step 2: Write an inventory note inside the sprint closeout draft.**

Record each runtime dependency as one of:

```text
packaged resource
generated temp output
developer-only diagnostic
not needed in packaged app
```

Expected: no runtime dependency remains unclassified.

### Task 2: Add Packaged Resource Inclusion

- [ ] **Step 1: Update electron-builder files.**

Modify `package.json` `build.files` and/or `build.extraResources` so packaged builds include only the runtime assets required by MOSS-Nano and Pocket TTS. Do not include generated `artifacts/**`, `.tmp/**`, or full repo scripts that are diagnostic-only.

Expected shape:

```json
"extraResources": [
  {
    "from": ".runtime/<required-engine-runtime>",
    "to": ".runtime/<required-engine-runtime>",
    "filter": ["**/*"]
  },
  {
    "from": "scripts/<required-sidecar-entry>",
    "to": "scripts/<required-sidecar-entry>"
  }
]
```

- [ ] **Step 2: Run package metadata validation.**

Run:

```powershell
npm run build
npm run typecheck
```

Expected: build passes; typecheck may still fail only for issues owned by `POSTV2-ENGINE-1`. Document any remaining failures.

### Task 3: Make Sidecar Path Resolution Package-Aware

- [ ] **Step 1: Add or reuse one resolver for dev vs packaged paths.**

Preferred behavior:

```js
const basePath = app.isPackaged ? process.resourcesPath : path.join(__dirname, "..");
```

Use that resolver in MOSS-Nano and Pocket sidecar launch paths instead of direct repo-root assumptions.

- [ ] **Step 2: Add fail-closed diagnostics.**

When packaged resources are missing, status should report a blocked/diagnostic state with the missing packaged path. It must not silently fall back to a developer checkout path.

Expected status fields:

```js
{
  ready: false,
  blocked: true,
  reason: "missing-packaged-runtime",
  path: resolvedPath
}
```

### Task 4: Reconcile Version Truth

- [ ] **Step 1: Choose one version source for this baseline.**

Use the release governance state to set the app version consistently across:

```text
package.json
package-lock.json root package version
package-lock.json packages[""].version
ROADMAP.md current-state copy
desktop-v2.0 release notes/checklist copy
```

Expected: no active release doc says `1.75.0` while the roadmap says `1.75.1`, and no active doc calls the closed release only a candidate.

- [ ] **Step 2: Verify metadata grep.**

Run:

```powershell
git grep -n -E "1\\.75\\.0|1\\.75\\.1|closeout candidate|release candidate|Desktop v2\\.0" package.json package-lock.json ROADMAP.md docs/project docs/governance
```

Expected: version mentions are either intentionally historical or aligned with the chosen baseline.

### Task 5: Gate Update Install Until Downloaded

- [ ] **Step 1: Locate update state owner.**

Run:

```powershell
git grep -n -E "downloaded|download-progress|install|autoUpdater|quitAndInstall|update" main src preload.js
```

- [ ] **Step 2: Add an explicit downloaded-only install state.**

The renderer must not expose or enable install until main has emitted an update-downloaded state. Before download completion, the UI may show checking, available, downloading, or error.

Expected state model:

```ts
type UpdateInstallState = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";
```

- [ ] **Step 3: Add focused tests.**

Add or update tests so `install` is disabled for every non-`downloaded` state and enabled only for `downloaded`.

Run:

```powershell
npm test -- update
```

Expected: focused update tests pass.

### Task 6: POSTV2-REL-1 Verification

- [ ] **Step 1: Run release truth gates.**

Run:

```powershell
npm run typecheck
npm test
npm run build
git diff --check
npm audit --audit-level=high
```

Expected: all pass, except existing moderate-only `uuid` audit findings remain acceptable if still present and no high-severity findings appear.

- [ ] **Step 2: Record package smoke evidence.**

Run the available package/smoke command if one exists; otherwise record the exact blocker and add a follow-up to create one.

Expected: packaged path diagnostics are validated in either an automated smoke test or an explicit no-smoke blocker.

---

## POSTV2-ENGINE-1: Engine Retirement, Persistence, and Type Contracts

**Goal:** Engine posture is enforced at UI, persistence, IPC, preload, type, test harness, and governance layers; `npm run typecheck` becomes a required green gate.

**Files:**
- Modify: `package.json`
- Modify: `src/types.ts`
- Modify: `src/constants.ts`
- Modify: `src/test-harness/electron-api-stub.ts`
- Modify: `preload.js`
- Modify: `main/ipc/tts.js`
- Modify: `src/utils/narrationPortability.ts`
- Modify: `src/hooks/useNarration.ts`
- Modify: `src/components/settings/qwenStatusPresentation.ts`
- Modify: `src/utils/audio/segmentKokoroChunk.ts`
- Modify: `src/utils/audioScheduler.ts`
- Modify: `src/utils/qwenStatus.ts`
- Modify: `docs/governance/QWEN_SUPPORTED_HOST_POLICY.md`
- Modify: `CLAUDE.md`
- Test: focused settings/TTS/narration portability/audio scheduler/Qwen-disable tests

### Task 1: Make Typecheck a Release Gate

- [ ] **Step 1: Add typecheck to the documented final gate.**

Update release/governance docs so the standard final gate is:

```powershell
npm run typecheck
npm test
npm run build
git diff --check
npm audit --audit-level=high
```

- [ ] **Step 2: Keep `package.json` script unchanged unless a composite gate exists.**

If adding a composite script, use:

```json
"verify": "npm run typecheck && npm test && npm run build && npm audit --audit-level=high"
```

Expected: `typecheck` is not a hidden optional check.

### Task 2: Close Qwen IPC and Preload Boundaries

- [ ] **Step 1: Decide API shape.**

Choose one of two valid implementations:

```text
Option A: Keep qwen IPC/preload methods present but fail-closed with retired/disabled status.
Option B: Make qwen methods optional in ElectronAPI and remove renderer assumptions.
```

Preferred for compatibility: Option A.

- [ ] **Step 2: Guard main IPC handlers.**

At `main/ipc/tts.js`, Qwen handlers should return disabled/retired state and should not start a runtime process when `QWEN_TTS_DISABLED` posture applies.

Expected response shape:

```js
{
  ok: false,
  disabled: true,
  reason: "qwen-retired-desktop-v2"
}
```

- [ ] **Step 3: Guard preload exposure.**

At `preload.js`, qwen methods may remain exposed for compatibility, but calls must route to fail-closed IPC. Do not expose new Qwen selection paths.

- [ ] **Step 4: Update tests.**

Focused tests must assert:

```text
Qwen cannot be selected from settings.
Persisted qwen settings normalize to Kokoro.
Qwen IPC/preload calls fail closed and do not start runtime.
```

Run:

```powershell
npm test -- qwen ttsSettings
```

### Task 3: Refresh ElectronAPI Stub

- [ ] **Step 1: Add fail-closed qwen methods to `electronAPIStub`.**

At `src/test-harness/electron-api-stub.ts`, add the required methods if Option A was chosen:

```ts
qwenStreamStart: async () => ({ ok: false, disabled: true, reason: "qwen-retired-desktop-v2" }),
qwenStreamCancel: async () => ({ ok: true }),
qwenStreamStatus: async () => ({ ready: false, disabled: true, reason: "qwen-retired-desktop-v2" }),
onQwenStreamAudio: () => () => {},
```

Adjust property names to the exact `QwenStreamStartResult` and `QwenStreamingEngineStatus` types in `src/types.ts`.

- [ ] **Step 2: Run typecheck.**

Run:

```powershell
npm run typecheck
```

Expected: ElectronAPI stub errors are gone.

### Task 4: Complete Default Settings and Persistence

- [ ] **Step 1: Add missing required settings to `DEFAULT_SETTINGS`.**

At `src/constants.ts`, add:

```ts
flowCursorStyle: "underline",
```

Use the exact existing default already assumed by runtime fallbacks.

- [ ] **Step 2: Add or update a settings shape test.**

Test that `DEFAULT_SETTINGS satisfies BlurbySettings` or equivalent compile-time/runtime coverage exists.

Expected: future required settings cannot be omitted silently.

### Task 5: Fix Narration Portability Engine Set

- [ ] **Step 1: Update allowed imported engine values.**

At `src/utils/narrationPortability.ts`, remove `qwen` as an allowed persisted target and add `pocket-tts`.

Expected behavior:

```text
qwen -> kokoro
nano -> nano
pocket-tts -> pocket-tts
unknown -> kokoro
```

- [ ] **Step 2: Add portability tests.**

Run:

```powershell
npm test -- narrationPortability
```

Expected: stale qwen profiles normalize to Kokoro; Pocket profiles survive import/export.

### Task 6: Separate Pocket and Nano Errors

- [ ] **Step 1: Split Pocket failure state from Nano failure state.**

At `src/hooks/useNarration.ts`, stop routing Pocket failures into `setNanoError`. Use an engine-neutral error state or a dedicated Pocket error state that settings/status UI can label correctly.

Expected user-facing labels:

```text
MOSS-Nano errors are Nano errors.
Pocket TTS errors are Pocket errors.
Kokoro errors remain Kokoro/general playback errors.
```

- [ ] **Step 2: Add focused narration error tests.**

Run:

```powershell
npm test -- useNarration pocket nano
```

Expected: Pocket failure assertions do not inspect Nano error state.

### Task 7: Fix Audio Segment Metadata Types

- [ ] **Step 1: Align `SegmentedChunk` and scheduler metadata.**

At `src/utils/audio/segmentKokoroChunk.ts` and `src/utils/audioScheduler.ts`, define a single typed metadata contract for:

```ts
parentChunkStartIdx
parentChunkWordCount
segmentIndex
isFinalSegment
```

The scheduler should narrow the fields through a type guard before using them.

- [ ] **Step 2: Add/refresh tests.**

Run:

```powershell
npm test -- segmentKokoroChunk audioScheduler
```

Expected: segment metadata is typed and runtime behavior is unchanged.

### Task 8: Resolve ES Lib and Nullable Type Errors

- [ ] **Step 1: Pick one ES compatibility strategy.**

Preferred: set TS lib high enough for the project APIs already in use:

```json
"lib": ["ES2022", "ES2022.Intl", "DOM", "DOM.Iterable"]
```

Alternative: replace `replaceAll`/`.at` usage with ES2020-compatible helpers.

- [ ] **Step 2: Fix nullable narrowing.**

At `src/utils/qwenStatus.ts`, avoid using optional chaining as a narrowing proof. Assign local variables before `Number.isFinite`.

Expected pattern:

```ts
const statusTimingMs = snapshot?.statusTimingMs;
if (typeof statusTimingMs === "number" && Number.isFinite(statusTimingMs)) {
  normalized.statusTimingMs = statusTimingMs;
}
```

### Task 9: Governance Posture Cleanup

- [ ] **Step 1: Update active governance docs.**

`docs/governance/QWEN_SUPPORTED_HOST_POLICY.md` and `CLAUDE.md` must describe current posture:

```text
Kokoro default/available.
MOSS-Nano recommended opt-in.
Pocket TTS available opt-in.
Qwen retired/disabled for Desktop v2.
```

Historical sections may remain if clearly marked historical.

- [ ] **Step 2: Grep for contradictions.**

Run:

```powershell
git grep -n -i -E "qwen-first|kokoro legacy|kokoro deprecated|qwen default|active conveyor|closeout candidate"
```

Expected: active contradictions are gone; historical mentions are explicitly historical.

### Task 10: POSTV2-ENGINE-1 Verification

- [ ] **Step 1: Run focused gates.**

Run:

```powershell
npm run typecheck
npm test -- qwen ttsSettings narrationPortability useNarration segmentKokoroChunk audioScheduler settings
```

Expected: focused gates pass.

- [ ] **Step 2: Run full gates.**

Run:

```powershell
npm test
npm run build
git diff --check
npm audit --audit-level=high
```

Expected: all pass with only already accepted moderate `uuid` audit findings if still present.

---

## POSTV2-NARR-1: Narrate Contract, Security, Artifact Hygiene, and Debt Map

**Goal:** Narrate mode behavior is explicit and tested, document-source opening is protocol-safe, generated evidence no longer dirties the repo by default, and structural debt has a concrete extraction map.

**Files:**
- Modify: `src/components/FoliatePageView.tsx`
- Modify: narration mode tests covering EPUB Narrate highlighting
- Modify: `main/ipc/documents.js`
- Modify: document IPC tests
- Modify: `.gitignore`
- Modify: artifact-producing scripts under `scripts/`
- Modify: artifact docs under `docs/testing/` and `docs/project/`
- Modify or create: `docs/audit/postv2-structural-debt-map.md`
- Review: `src/hooks/useNarration.ts`
- Review: `src/components/ReaderContainer.tsx`
- Review: `scripts/moss_nano_probe.mjs`
- Review: `tests/mossNanoProbe.test.js`
- Review: `main/legacy-parsers.js`

### Task 1: Define EPUB Narrate Highlighting Contract

- [ ] **Step 1: Decide supported behavior.**

Choose and document one behavior:

```text
Option A: EPUB Narrate supports per-word highlight when word anchors exist and falls back to section/paragraph highlight otherwise.
Option B: EPUB Narrate intentionally has no per-word highlight and UI copy/tests make that explicit.
```

Preferred: Option A if existing Foliate word anchor data is reliable enough; otherwise Option B with explicit user-facing truth.

- [ ] **Step 2: Add failing tests before implementation.**

Test at least:

```text
Narrate passes highlight events into Foliate when word anchors exist.
Flow still preserves existing literal-flow highlight behavior.
Missing word anchors do not crash Narrate.
```

Run:

```powershell
npm test -- FoliatePageView narrate
```

Expected before implementation: the new Narrate highlight test fails.

### Task 2: Implement Narrate Highlight Path

- [ ] **Step 1: Update `FoliatePageView.tsx`.**

Near the existing highlight dispatch around `src/components/FoliatePageView.tsx:1297`, route Narrate highlight events through the same safe anchor resolution path used by literal Flow, or explicitly through the new fallback behavior chosen in Task 1.

Expected invariants:

```text
No regression to Flow highlighting.
No highlight crash on section transition.
No stale highlight retained after narration stop.
```

- [ ] **Step 2: Run focused tests.**

Run:

```powershell
npm test -- FoliatePageView narrate flow
```

Expected: focused tests pass.

### Task 3: Validate `open-doc-source` Protocols

- [ ] **Step 1: Match safer browser-open allowlist.**

At `main/ipc/documents.js`, validate `doc.sourceUrl` before opening. Allow only protocols that are intentionally supported, such as:

```text
https:
http:
file: only if the app already treats the path as trusted local content
```

Block protocols such as:

```text
javascript:
data:
vbscript:
```

- [ ] **Step 2: Add IPC tests.**

Test that unsafe protocols return an error and do not call shell/open handlers.

Run:

```powershell
npm test -- documents open-doc-source
```

Expected: unsafe protocol tests pass.

### Task 4: Move Artifact Hygiene Into Repo Policy

- [ ] **Step 1: Update `.gitignore`.**

Ignore generated evidence by default while preserving curated documentation and canonical summaries that are intentionally tracked.

Expected ignore policy:

```gitignore
.tmp/
artifacts/moss/**
artifacts/tts-eval/**/traces/**
artifacts/tts-eval/**/summaries/**
artifacts/tts-eval/**/*.wav
artifacts/tts-eval/**/electron-profile/**
tests/perf-baseline-results.json
```

Add negations only for intentionally tracked README or canonical summary files.

- [ ] **Step 2: Remove repo-policy reliance on `.git/info/exclude`.**

If `.git/info/exclude` contains patterns that should apply to every checkout, move those patterns into `.gitignore`.

- [ ] **Step 3: Untrack bulky generated audio only after confirmation.**

Use `git rm --cached` for generated artifacts only when the implementation sprint explicitly approves it. Do not delete local evidence files.

Expected command shape:

```powershell
git rm --cached -- "artifacts/moss/<generated-file-or-dir>"
```

### Task 5: Add Artifact Output Discipline to Scripts

- [ ] **Step 1: Route generated output to ignored directories by default.**

Audit scripts that write under `artifacts/` and ensure their default output path is ignored unless the caller passes an explicit canonical output path.

Run:

```powershell
git grep -n -E "artifacts/|perf-baseline-results|summary\\.json|trace\\.json|\\.wav" scripts tests main src
```

- [ ] **Step 2: Add docs for canonical evidence promotion.**

Document the rule:

```text
Generated raw traces/audio stay ignored.
Canonical release summaries may be copied/promoted deliberately with a doc note.
No local-only exclude file carries shared repo policy.
```

### Task 6: Structural Debt Map

- [ ] **Step 1: Create `docs/audit/postv2-structural-debt-map.md`.**

For each hotspot, record current responsibility, extraction boundary, tests to protect behavior, and risk:

```text
src/hooks/useNarration.ts
src/components/FoliatePageView.tsx
src/components/ReaderContainer.tsx
scripts/moss_nano_probe.mjs
tests/mossNanoProbe.test.js
main/legacy-parsers.js
```

- [ ] **Step 2: Mark `main/legacy-parsers.js` disposition.**

Choose one:

```text
keep: still referenced by active parser fallback
deprecate: retained for historical import compatibility only
remove: no active references, covered by file parser tests
```

Do not remove it in this sprint unless tests prove it is unreachable and the owner approves the deletion.

### Task 7: POSTV2-NARR-1 Verification

- [ ] **Step 1: Run focused gates.**

Run:

```powershell
npm run typecheck
npm test -- FoliatePageView narrate flow documents open-doc-source
git status --short
```

Expected: focused tests pass; generated outputs do not appear as new tracked dirty files.

- [ ] **Step 2: Run full gates.**

Run:

```powershell
npm test
npm run build
git diff --check
npm audit --audit-level=high
```

Expected: all pass with only already accepted moderate `uuid` audit findings if still present.

---

## Final Acceptance Criteria

- `npm run typecheck` passes and is included in the documented release gate.
- `npm test` passes.
- `npm run build` passes with no new warning beyond the known `settings -> tts -> settings` circular chunk warning unless that warning is fixed.
- `git diff --check` passes.
- `npm audit --audit-level=high` passes with no high-severity findings.
- Packaged sidecar paths do not depend on `C:\Users\estra\Projects\Blurby` or any developer checkout path.
- Version metadata is consistent across app metadata and active release docs.
- Qwen IPC/preload/runtime boundaries are fail-closed or optional by type, and Qwen cannot become selected/default through migration/import.
- Pocket profile portability works and Pocket errors are not reported as Nano errors.
- EPUB Narrate highlight behavior is either supported and tested or explicitly documented as unsupported with a safe fallback.
- `open-doc-source` blocks unsafe URL protocols.
- Generated raw audio/traces/perf outputs are ignored by repo policy; canonical evidence promotion is deliberate.
- Structural debt follow-up map exists and names safe extraction boundaries.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-04-postv2-audit-remediation.md`. Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh worker per task, review between tasks, fastest for the cross-system pieces.
2. **Inline Execution** - execute tasks in this session using `superpowers:executing-plans`, with checkpoints after each sprint.

Recommended dispatch order is sequential: `POSTV2-REL-1`, then `POSTV2-ENGINE-1`, then `POSTV2-NARR-1`.
