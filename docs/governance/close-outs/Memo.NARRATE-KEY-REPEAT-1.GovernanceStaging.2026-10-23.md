# Dispatch Close-Out Governance Staging — NARRATE-KEY-REPEAT-1

Worktree-resident dispatch, built during the Stage 8 code/lockfile freeze. `eb/narrate-key-repeat-1` was cut from `refs/remotes/origin/main` @ `77f1502c`. It merges after the freeze lifts, on Blurby.Roadmap's go.

## Re-grep at dispatch (standing rule 36)

On `77f1502c`, Narrate's section-document key forwarder is at `src/reader/modes/narrate/FoliateView.tsx:934`, and it lacks `repeat: ke.repeat`. Flow (`:880`), Focus (`:805`) and Page (`:787`) already forward it. `READER_MODES` in `tests/foliate-bridge.test.ts:10` is `["page", "focus", "flow"]`.

## Evidence

- **Done-when 1 (C1 `ea149851`, test alone, base source):** `npx vitest run tests/foliate-bridge.test.ts -t "narrate FoliateView forwards"` exited 1 with `Tests 1 failed | 6 skipped (7)`. The failure was `AssertionError: expected '/**\n * Narrate\'s private copy of Fo…' to contain 'repeat: ke.repeat'`.
- **Fix (`2a80b163`):** `repeat: ke.repeat,` is appended to Narrate's forwarder line, which is now byte-identical to Flow's.
- **Done-when 2:** `npx vitest run tests/foliate-bridge.test.ts` gave `Tests 7 passed (7)`, exit 0. `READER_MODES` is unchanged.
- **Done-when 3:** `git grep -c -F 'repeat: ke.repeat' -- 'src/reader/modes/*/FoliateView.tsx'` printed flow, focus, narrate and page, each `:1`, exit 0. On the base it printed three lines, without Narrate.
- **Failure-handling check:** `tests/readerModeBoundaries.test.ts`, `tests/readerModeIsolation.test.ts` and `tests/readerModeOwnership.test.ts` passed 50/50, so the mode-isolation census does not flag the edit.
- **Done-when 4 (owner's machine, `2a80b163`):** `npm test` gave `Test Files 177 passed (177)`, `Tests 2431 passed | 1 skipped (2432)`, exit 0. `npm run typecheck` exited 0, and `npm run build` exited 0.
- **Done-when 5:** the merge-base diff lists exactly `M src/reader/modes/narrate/FoliateView.tsx` and `M tests/foliate-bridge.test.ts`, plus this memo. No time log was kept. `tests/perf-baseline-results.json` is unstaged.

## Review (independent, read-only, `2a80b163`)

Approved; its two concerns were procedural only (the unstaged perf-baseline file, and the memo not yet committed).

- The forwarder line is byte-identical to Flow's, and the new test reads Narrate's real file, so it is not vacuous.
- No behaviour depends on `repeat` being false for forwarded events. The only reader of `.repeat` in `src` is the shell's held-Space guard (`useKeyboardShortcuts.ts:243`), so holding Space in Narrate now fires once, as intended. Narrate's own `handleKey` never reads `repeat`, so held arrow and PageUp/PageDown keys still act on every repeat.
