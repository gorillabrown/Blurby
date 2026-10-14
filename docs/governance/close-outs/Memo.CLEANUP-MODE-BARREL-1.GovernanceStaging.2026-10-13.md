# Sprint Close-Out Governance Staging — CLEANUP-MODE-BARREL-1

Base `05a5480a`. Branch `eb/cleanup-mode-barrel-1`. No register writes (standing rule 46).

## Evidence

Dry-runs on the base match the spec: `git ls-files src/modes` lists five files; the gate 2/3 pattern hits only `tests/perf-baseline.test.ts:27`, `:28` and `vite.config.js:49`.

### Done-when 4 — positive control at C1

`npx vitest run tests/modeLegacyRetired.test.ts` → exit 1, 2 failed / 1 passed:

- × (a) src/modes/ holds only ModeInterface.ts — received `FlowMode.ts`, `FocusMode.ts`, `PageMode.ts`, `index.ts` beside `ModeInterface.ts`
- × (b) vite.config.js has no legacy NarrateMode chunk rule — the config contains `src/modes/NarrateMode`
- ✓ (c) no src file imports a legacy src/modes engine or barrel. No `src` importer exists on the base; the only importer is `tests/perf-baseline.test.ts`, which is outside `src/`.
