# HOTFIX-1 [v1.0.1] — TypeScript Strict Build Errors

## KEY CONTEXT
v1.0.0 tagged and pushed. CI release #20 ran — 791 tests pass, but `tsc --noEmit` fails with 15 type errors in 4 test files + 1 stub file. The release .exe did not build. All errors are type annotation issues that Vitest ignores at runtime. Zero production code changes needed.

## PROBLEM
15 TypeScript strict-mode errors block the release build:

1. **`tests/modes.test.ts` (2 errors, lines 147, 202):** `callbacks.onWordAdvance.mockClear()` — `ModeCallbacks` types the field as `(wordIndex: number) => void`, erasing the `Mock` type. `.mockClear()` doesn't exist on the erased type.
2. **`tests/foliate-bridge.test.ts` (2 errors, lines 122, 146):** Same pattern — `onWordAdvance(idx)` inside callback wiring helpers typed as `ReturnType<typeof vi.fn>` which resolves to `Mock<Procedure | Constructable>`, not callable.
3. **`tests/useReadingModeInstance.test.ts` (6 errors, lines 93, 100, 101, 108, 122, 396):** Same — `onWordAdvance(idx)` and `jumpToWord(idx)` calls on `ReturnType<typeof vi.fn>`, plus `.mockClear()` on erased type.
4. **`tests/useReaderMode.test.ts` (4 errors, lines 154, 155, 168, 170):** String literal comparisons like `readingMode === "page"` where `readingMode` is typed as `"focus" as const` — TypeScript correctly says `"focus" === "page"` is always false.
5. **`src/test-harness/electron-api-stub.ts` (1 error, line 225):** `filepath: null` where type expects `string | undefined`.

## EVIDENCE OF PROBLEM
GitHub Actions Release #20 — Build (x64 + arm64) job failure. 15 errors listed in annotations. Tests: 791 pass, 0 fail. Build: FAIL (tsc --noEmit).

## HYPOTHESIZED SOLUTION

**Category 1 — Mock type erasure (10 errors in 3 files):**
- `modes.test.ts`: Cast callbacks in tests that need `.mockClear()`: `(callbacks.onWordAdvance as ReturnType<typeof vi.fn>).mockClear()`
- `foliate-bridge.test.ts` + `useReadingModeInstance.test.ts`: Change parameter type from `ReturnType<typeof vi.fn>` to `Mock<[number], void>` (Vitest's `Mock` generic). This makes the parameter callable AND mockable. Import `Mock` from vitest where needed.

**Category 2 — Impossible string comparisons (4 errors in 1 file):**
- `useReaderMode.test.ts`: The tests simulate runtime toggle logic by assigning `const readingMode = "flow" as const` then comparing to other modes. Fix: type the variable as `string` instead of using `as const`, since the test is exercising branch coverage, not type narrowing. E.g., `const readingMode: string = "flow"`.

**Category 3 — null vs undefined (1 error in 1 file):**
- `electron-api-stub.ts` line 225: Change `filepath: null` to `filepath: undefined`.

**Category 4 — CI Node.js deprecation (warning, not error):**
- `.github/workflows/release.yml`: Not blocking the build, but add `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` to env to suppress the warning before it becomes an error in June 2026.

## WHAT (Tasks to Complete)

| Step | Task | Agent | Model |
|------|------|-------|-------|
| 1 | Fix mock type erasure in `tests/modes.test.ts` — cast `.mockClear()` calls | renderer-fixer | sonnet |
| 2 | Fix mock callable type in `tests/foliate-bridge.test.ts` — change param type to `Mock<[number], void>` | renderer-fixer | sonnet |
| 3 | Fix mock callable type in `tests/useReadingModeInstance.test.ts` — same pattern (6 errors) | renderer-fixer | sonnet |
| 4 | Fix string literal comparisons in `tests/useReaderMode.test.ts` — widen type to `string` | renderer-fixer | sonnet |
| 5 | Fix null → undefined in `src/test-harness/electron-api-stub.ts` line 225 | renderer-fixer | sonnet |
| 6 | Add `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` to `.github/workflows/release.yml` env | electron-fixer | sonnet |
| 7 | Run `npx tsc --noEmit` — 0 errors | test-runner | haiku |
| 8 | Run `npm test` — 791+ tests pass, 0 fail | test-runner | haiku |
| 9 | Run `npm run build` — clean build | test-runner | haiku |
| 10 | Bump `package.json` to `1.0.1` | blurby-lead | opus |
| 11 | Git: commit on branch `hotfix/1-tsc-strict`, merge to main with `--no-ff`, tag `v1.0.1`, push with tags | blurby-lead | opus |
| 12 | Print terminal summary: errors fixed, test count, build status, tag pushed | blurby-lead | opus |

## WHERE (Read in This Order)

1. `CLAUDE.md` — Agent rules, standing rules, test policy
2. `docs/governance/HOTFIX-1-DISPATCH.md` — This dispatch (self-contained, do not read ROADMAP for this sprint)
3. `tests/modes.test.ts` — Lines 9-16 (`makeCallbacks`), 147, 202 (`.mockClear()` errors)
4. `tests/foliate-bridge.test.ts` — Lines 119, 122, 143, 146 (callable mock errors)
5. `tests/useReadingModeInstance.test.ts` — Lines 72-73, 82, 93, 100, 101, 108, 122, 396 (callable mock + `.mockClear()` errors)
6. `tests/useReaderMode.test.ts` — Lines 148-170 (string literal comparison errors)
7. `src/test-harness/electron-api-stub.ts` — Line 225 (null vs undefined)
8. `.github/workflows/release.yml` — CI env configuration

## HOW (Agent Assignments)

| Agent | Model | Responsibility |
|-------|-------|----------------|
| blurby-lead | opus | Read dispatch, dispatch renderer-fixer, verify tsc clean, git tag, push, summary |
| renderer-fixer | sonnet | All type fixes (steps 1-5) |
| electron-fixer | sonnet | CI workflow fix (step 6) |
| test-runner | haiku | tsc --noEmit + npm test + npm run build (steps 7-9) |

## WHEN (Execution Order)

```
[1-5] SEQUENTIAL (renderer-fixer — shared test infrastructure):
    [1] modes.test.ts mock casts
    [2] foliate-bridge.test.ts param types
    [3] useReadingModeInstance.test.ts param type
    [4] useReaderMode.test.ts string widenings
    [5] electron-api-stub.ts null→undefined
    ↓
[6] release.yml Node24 env (electron-fixer) — PARALLEL with [1-5]
    ↓ (all complete)
[7] npx tsc --noEmit (test-runner)
    ↓
[8] npm test (test-runner)
    ↓
[9] npm run build (test-runner)
    ↓
[10] Bump package.json to 1.0.1 (blurby-lead)
    ↓
[11] Git commit + merge + tag v1.0.1 + push --tags (blurby-lead)
    ↓
[12] Terminal summary (blurby-lead)
```

## ADDITIONAL GUIDANCE

- **Do NOT change any production source code.** All fixes are in test files, the dev-only stub, and CI config. If a fix seems to require production code changes, STOP and escalate.
- **Import `Mock` from vitest** where needed: `import { vi, Mock } from 'vitest'`
- **The `Mock<[number], void>` generic** means: mock of a function that takes `[number]` args and returns `void`. This matches `onWordAdvance`'s signature and preserves both callability and `.mockClear()`.
- **For string literal widening**, only widen the specific test variables that trigger the error. Do NOT change actual type definitions or runtime code.
- **Tag format:** `v1.0.1` — this triggers the release CI workflow (`on: push: tags: 'v*'`).
- **Delete the hotfix branch after merge.** `git branch -d hotfix/1-tsc-strict`
- **After push, verify** that GitHub Actions Release workflow triggers and passes. The terminal summary should include the run URL if `gh` CLI is available.

## SUCCESS CRITERIA

1. `npx tsc --noEmit` exits with 0 errors
2. `npm test` — 791+ tests pass, 0 failures
3. `npm run build` — clean exit
4. `package.json` version is `1.0.1`
5. `.github/workflows/release.yml` has `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true`
6. Zero production source files modified (only test files, stub, CI config)
7. Branch `hotfix/1-tsc-strict` merged to main with `--no-ff`, tag `v1.0.1` pushed
8. GitHub Actions Release workflow triggered by tag push
