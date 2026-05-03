# Source Inventory

The audit zip preserves repo-relative paths.

## Audit Documents

- `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/AUDIT_MEMO.md`
- `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/AUDIT_ORIENTATION.md`
- `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/EVIDENCE_MATRIX.md`
- `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/REVIEW_QUESTIONS.md`
- `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/REVIEW_PROMPT.md`
- `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/SOURCE_INVENTORY.md`
- `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/PACKAGE_MANIFEST.md`
- `docs/audit/2026-05-02-moss-nano-productization-third-party-audit/README.md`

## Governing Documents

- `ROADMAP.md`
- `docs/governance/SPRINT_QUEUE.md`
- `docs/testing/MOSS_DECISION_LOG.md`
- `docs/testing/MOSS_RUNTIME_SETUP.md`
- `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- `docs/testing/TTS_EVAL_MATRIX_RUNBOOK.md`
- `docs/testing/TTS_EVAL_RELEASE_CHECKLIST.md`
- `docs/testing/TTS_ADVERSARIAL_REVIEW_CHECKLIST.md`
- `docs/testing/TTS_ITERATIVE_AUDIT_TRACE_CHECKLIST.md`

## Runtime, Sidecar, IPC, And Settings Source

- `main/moss-nano-engine.js`
- `main/moss-nano-sidecar.js`
- `main/ipc/tts.js`
- `preload.js`
- `src/hooks/narration/mossNanoStrategy.ts`
- `src/hooks/useNarration.ts`
- `src/components/settings/TTSSettings.tsx`
- `src/components/settings/MossNanoStatusSection.tsx`
- `src/components/settings/useMossNanoSettingsStatus.ts`
- `src/components/settings/ttsPreview.ts`
- `src/types.ts`
- `src/types/eval.ts`
- `src/utils/ttsEvalTrace.ts`

## Scripts And Package Metadata

- `scripts/moss_nano_probe.mjs`
- `scripts/moss_nano_probe.py`
- `scripts/moss_nano_resident_probe.py`
- `scripts/tts_eval_runner.mjs`
- `package.json`
- `package-lock.json`

## Tests And Fixtures

- `tests/mossNanoEngine.test.js`
- `tests/mossNanoIpc.test.js`
- `tests/mossNanoStrategy.test.ts`
- `tests/useNarrationMossNano.test.tsx`
- `tests/ttsSettingsMossNano.test.tsx`
- `tests/mossNanoProbe.test.js`
- `tests/ttsEvalMatrixRunner.test.ts`
- `tests/ttsEvalTrace.test.ts`
- `tests/fixtures/narration/matrix.manifest.json`

## Evidence Artifacts

- `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/promotion-confirmation.json`
- `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/summary.json`
- `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/summary.txt`
- `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/lifecycle-proof/clean/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2-lifecycle-clean/summary.json`
- `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/lifecycle-proof/clean/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2-lifecycle-clean/summary.txt`
- `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/lifecycle-proof/restart-clean/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2-lifecycle-restart-clean/summary.json`
- `artifacts/moss/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2/lifecycle-proof/restart-clean/moss-nano-6f-full-bounded-soak-promotion-confirmation-v2-lifecycle-restart-clean/summary.txt`
- `artifacts/tts-eval/moss-nano-11-product-gate-shape/summary.json`
- `artifacts/tts-eval/moss-nano-11-product-gate-shape/summary.txt`
- `artifacts/tts-eval/moss-nano-11-product-gate-shape/aggregate-summary.json`
- `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.json`
- `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/summary.txt`
- `artifacts/tts-eval/moss-nano-12-live-four-mode-evidence/aggregate-summary.json`

## Exclusions

- `.git/`
- `.idea/`
- `.tmp/`
- `.runtime/`
- `node_modules/`
- `dist/`
- `release/`
- `.claude/skills/governance-sweep/`
- Generated `.wav` files
- Broad untracked MOSS runtime artifact directories not named above
