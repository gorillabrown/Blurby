# Source Inventory

## Curated Package Contents

The curated package contains the new audit folder docs plus the following exact repo paths.

### New audit package docs

- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\AUDIT_ORIENTATION.md`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\EXECUTIVE_BRIEF.md`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\PROPOSAL_UNDER_REVIEW.md`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\EXTERNAL_FINDINGS.md`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\EVIDENCE_MATRIX.md`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\REVIEW_QUESTIONS.md`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\SOURCE_INVENTORY.md`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\PACKAGE_MANIFEST.md`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit\REVIEW_PROMPT.md`

### Existing audit and testing docs

- `C:\Users\estra\Projects\Blurby\docs\testing\TTS_ADVERSARIAL_REVIEW_CHECKLIST.md`
- `C:\Users\estra\Projects\Blurby\docs\testing\TTS_ITERATIVE_AUDIT_TRACE_CHECKLIST.md`
- `C:\Users\estra\Projects\Blurby\docs\testing\TTS_EVAL_MATRIX_RUNBOOK.md`
- `C:\Users\estra\Projects\Blurby\docs\testing\TTS_EVAL_RELEASE_CHECKLIST.md`
- `C:\Users\estra\Projects\Blurby\docs\testing\TTS_EVAL_BASELINE_POLICY.md`
- `C:\Users\estra\Projects\Blurby\docs\testing\tts_eval_baseline_v1.json`
- `C:\Users\estra\Projects\Blurby\docs\testing\tts_quality_gates.v1.json`
- `C:\Users\estra\Projects\Blurby\docs\testing\TTS_LIVE_BUG_SWEEP_CHECKLIST.md`

### Core source

- `C:\Users\estra\Projects\Blurby\src\hooks\useNarration.ts`
- `C:\Users\estra\Projects\Blurby\src\hooks\narration\kokoroStrategy.ts`
- `C:\Users\estra\Projects\Blurby\src\utils\audioScheduler.ts`
- `C:\Users\estra\Projects\Blurby\src\utils\generationPipeline.ts`
- `C:\Users\estra\Projects\Blurby\src\utils\kokoroRatePlan.ts`
- `C:\Users\estra\Projects\Blurby\src\utils\kokoroStatus.ts`
- `C:\Users\estra\Projects\Blurby\src\utils\audio\segmentKokoroChunk.ts`
- `C:\Users\estra\Projects\Blurby\src\components\settings\TTSSettings.tsx`
- `C:\Users\estra\Projects\Blurby\src\components\ReaderBottomBar.tsx`
- `C:\Users\estra\Projects\Blurby\src\types.ts`
- `C:\Users\estra\Projects\Blurby\main\tts-worker.js`
- `C:\Users\estra\Projects\Blurby\main\tts-engine.js`
- `C:\Users\estra\Projects\Blurby\main\tts-engine-marathon.js`
- `C:\Users\estra\Projects\Blurby\main\tts-cache.js`
- `C:\Users\estra\Projects\Blurby\main\ipc\tts.js`
- `C:\Users\estra\Projects\Blurby\preload.js`

### Relevant tests

- `C:\Users\estra\Projects\Blurby\tests\tts-engine.test.js`
- `C:\Users\estra\Projects\Blurby\tests\tts-worker.test.js`
- `C:\Users\estra\Projects\Blurby\tests\audioScheduler.test.ts`
- `C:\Users\estra\Projects\Blurby\tests\audioSchedulerTempo.test.ts`
- `C:\Users\estra\Projects\Blurby\tests\narrationContinuity.test.ts`
- `C:\Users\estra\Projects\Blurby\tests\useNarration.test.ts`
- `C:\Users\estra\Projects\Blurby\tests\useNarrationRateUpdate.test.tsx`
- `C:\Users\estra\Projects\Blurby\tests\ttsEvalTrace.test.ts`
- `C:\Users\estra\Projects\Blurby\tests\ttsEvalLifecycle.test.ts`
- `C:\Users\estra\Projects\Blurby\tests\ttsEvalMatrixRunner.test.ts`
- `C:\Users\estra\Projects\Blurby\tests\ttsEvalGate.test.ts`

### Governance and context

- `C:\Users\estra\Projects\Blurby\ROADMAP.md`
- `C:\Users\estra\Projects\Blurby\docs\governance\SPRINT_QUEUE.md`
- `C:\Users\estra\Projects\Blurby\docs\governance\LESSONS_LEARNED.md`
- `C:\Users\estra\Projects\Blurby\CLAUDE.md`

## Full-Source Supplement Contents

The full-source supplement is a broad repo snapshot rooted at:

- `C:\Users\estra\Projects\Blurby`

It includes all repo files under that root **except** the exclusions listed below.

### Exclusions

- `C:\Users\estra\Projects\Blurby\node_modules`
- `C:\Users\estra\Projects\Blurby\dist`
- `C:\Users\estra\Projects\Blurby\artifacts`
- `C:\Users\estra\Projects\Blurby\.git`
- `C:\Users\estra\Projects\Blurby\.idea`
- `C:\Users\estra\Projects\Blurby\.claude\skills\adversarial-review`
- `C:\Users\estra\Projects\Blurby\docs\audit\2026-04-18-vibevoice-proposal-third-party-audit`

The supplement exists so a reviewer can inspect broader architecture and surrounding code when the curated package is not sufficient.
