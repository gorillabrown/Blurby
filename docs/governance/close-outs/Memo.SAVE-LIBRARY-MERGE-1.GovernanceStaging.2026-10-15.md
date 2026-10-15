# Sprint Close-Out Governance Staging — SAVE-LIBRARY-MERGE-1

Worktree-resident run (`eb/save-library-merge-1`, `C:\Projects\Blurby\.worktrees\save-library-merge-1`, from
`refs/remotes/origin/main` @ `167d64d1`). The one governance-document edit the specification names as an edit site
(Done-when 10: BUG-199's **Status** line) is made in the branch. Nothing is written to the register (standing rule 46).

## Gate evidence

### Setup (2026-10-15)
- `git fetch origin`; `refs/remotes/origin/main` = `167d64d1`, which contains SAVE-LIBRARY-TRUST-1 (`fd1d266d`) and
  IPC-PATH-TRUST-1 (`9b68ce38`). `npm ci` exited 0.
- Standing rule 36 re-read, no drift: `main/ipc/library.js:46-64` (the amended `keepMainPaths` and the handler) is
  byte-for-byte the spec's "Before" block; `:184` holds the write-through line; `tests/saveLibraryTrust.test.js:8-9`,
  `:221-227` and `:229-244` and `src/components/LibraryView.tsx:286-297` match the spec's line references and text.
  BUG-199 is filed in `docs/governance/BUG_REPORT.md` on this base.
- Wave A only: the full `npm test`, `npm run build`, electron-builder and any app launch wait for Blurby.Roadmap's go
  (another session's traced app session is running on this machine).

### Done-when 1 — positive control at C1
`npx vitest run tests/saveLibraryMerge.test.js tests/saveLibraryTrust.test.js` (pwsh, worktree root): **exit 1**;
`Tests 13 failed | 17 passed (30)`.
- merge (a): `expected [ 'd1', 'd2' ] to deeply equal [ '<added id>', 'd1', 'd2' ]` — the `add-manual-doc` document is gone.
- merge (b): `expected undefined to match object { deleted: true, deletedAt: +0, … }` (d2's tombstone is gone), and
  `merged.find(d2).deleted` `expected undefined to be true` (the real `mergeLibrary` brings d2 back alive, BUG-199).
- merge (c): `doc("d2").deleted` `expected undefined to be true` — d2 is alive again (the stale copy with `tags: ["x"]`).
- merge (d): received `position: 0`, `lastReadAt: 1234`, no `cfi`, no `modified` — the stale copy's values.
- merge (e): d1 lacks `favorite`, `archived`, `archivedAt`, `snoozedUntil`, `queuePosition` (`ext` `.epub` matches,
  pinned in both); `doc("d1").deleted` `expected true to be undefined`; d2 is `{ title: 'Two', … }`, not `Renamed`.
- merge (f): `tags`, `collection` and `seenAt` erased (`unread: false` matches).
- merge (g): `expected [ … ] to be [ … ] // Object.is equality` — `library` is a new array.
- merge (n): `{ title: 'Own', … }` does not match `{ title: 'Edited', author: 'Ann' }`.
- merge (o): `expected 'if (editMetaMode && editingId) {…' to contain 'applyMetadataUpdates'` (the main half passed).
- trust (i): `expected [ 'd2', 'd1' ] to deeply equal [ 'd1', 'd2' ]`.
- trust (j): `expected [ 'd1' ] to deeply equal [ 'd1', 'd2' ]`.
- trust (m): `{ title: 'Renamed', … }` does not match `{ title: 'Book', … }`.
- **Deviation — merge (i) also fails at C1**, which the spec lists as a control that passes there:
  `expected '9' to be 5000 // Object.is equality`. Its two later-value halves (main `null`, then 1000, saved with 5000)
  pass; its third half ("a non-number `"9"` leaves main's value") fails, because the replace handler stores any renderer
  `lastReadAt`. That half pins the `Number.isFinite` guard the C2 edit adds, so it cannot pass on the base. The test is
  kept exactly as specified; the spec's C1 classification of (i) is wrong for that one half. No other test differs
  from the spec's list.
- Passing at C1, as specified: merge (h), (j1)–(j5), (k); trust (a)–(h), (k), (l).
- Test-file note: in (b) and (e), the leading assertions use `expect.soft`, so every half of each test runs and is
  recorded at C1 (the test still fails on any half).

### Done-when 2 — after C2
`npx vitest run tests/saveLibraryMerge.test.js tests/saveLibraryTrust.test.js tests/ipcPathTrust.test.js
tests/readFileBufferLibrary.test.js tests/documentsOpenSource.test.js tests/sync-hardening.test.js tests/quitSequence.test.js`
(pwsh): **exit 0**; `Test Files 7 passed (7)`, `Tests 91 passed (91)`.

### Done-when 3–10 (pwsh, `git grep`, worktree root, on the C2 tree)
- 3: exit 1, no output. 4: `main/ipc/library.js:2`, exit 0. 5: `:47`, exit 0. 6: `:65`, exit 0; `main/ipc/library.js:1`, exit 0.
- 7: `main/ipc/library.js:1` and `main/ipc/library.js:1`, exit 0 each.
- 8: exit 1 (no output); `tests/saveLibraryTrust.test.js:240`, exit 0; exit 1; exit 1.
- 9: exit 1 (no output); `src/components/LibraryView.tsx:293`, exit 0.
- 10: `docs/governance/BUG_REPORT.md:1`, exit 0. The Status line reads exactly the Done-when 10 text (the base line's
  trailing "Lane: Library & Content." is not part of that text and went with the old line).

### Wave B (2026-10-15, on Blurby.Roadmap's go; the traced session had ended)
- `git fetch origin`: `refs/remotes/origin/main` is still `167d64d1`, the branch's base. `git merge --no-ff
  refs/remotes/origin/main`: "Already up to date.", exit 0, no merge commit (HEAD stayed `08ba65ab`).
- Done-when 2 re-run (pwsh): **exit 0**; `Test Files 7 passed (7)`, `Tests 91 passed (91)`.
- Done-when 3–10 re-run (pwsh): every gate gave the same output and exit code as listed above.

### Done-when 11 (pwsh, worktree root, this machine)
- `npm test`: **exit 0**; `Test Files 164 passed (164)`, `Tests 2204 passed | 1 skipped (2205)`. No failures, so the
  Stage 8 closed-list rule was not needed.
- `npm run typecheck`: **exit 0**.
- `npm run build`: **exit 0**.
- `tests/perf-baseline-results.json`, rewritten by the suite, is left unstaged.

### Done-when 13
Owner smoke deferred to batched smoke by Blurby Brain 2026-10-14 (Rule 11; owner is away).

### Remaining
- Blurby.Roadmap's review and the `--no-ff` merge to `main` (not done by this run).
- Done-when 13: the Stage 8 batched owner smoke, checks (a) and (b).
