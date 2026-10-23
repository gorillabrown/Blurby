# Dispatch Close-Out Governance Staging — KF2-WAIVER-RETIRE-1

Worktree-resident, docs-only dispatch (`eb/kf2-waiver-retire-1` from `refs/remotes/origin/main` @ `40c01ceb`). Test tier None: no suite, typecheck or build.

## Edits (C1 `d2f400f7`)

- **`ROADMAP.md`, the Stage 8 release-gate line:**
  - Re-read on the base; gate (12) and the order paragraph were already present.
  - The specified sentence, dated 2026-10-22, was inserted right after `Full-suite failures under load on this machine follow Brain's closed-list rule.`, and the paragraph's following text was kept.
  - The three quoted test names were checked against their files: `tests/jsonStore.test.js:24`, `tests/folderWatcher.test.js:263`, and `tests/readerModeBoundaries.test.ts:203`, whose timeout `30_000` is at `:222`.
- **`docs/governance/LESSONS_LEARNED.md`:** the `### LL-156 — status (KF2-WAIVER-RETIRE-1, 2026-10-22)` entry was appended at the end of the file.

## Run of the run

1. On `d2f400f7`, Done-when 1–7 and 9 passed. Done-when 8 exited 1 on three lines added after the specification was written:
   - standing rule 50's text (`:188`);
   - RENAME-RETRY-1's Prerequisites (`:1326`) and Lessons applied (`:1386`).

   Their fence forbids editing them, so the run stopped and reported to Blurby.Roadmap.
2. RENAME-RETRY-1's close-out archived its specification, which removed `:1326` and `:1386`.
3. Taking in `bf48dda0` conflicted on the Stage 8 line, because main had added "PAGE-POSITION-SAVE-2's optional touch-device swipe row (added 2026-10-22), " to the smoke list.
   - Resolved by taking main's line and re-inserting the sentence after the same anchor.
   - The merged line minus the sentence is byte-equal to main's line (merge `ed6be25a`).
4. Blurby.Brain approved option (a) with a condition: the exemption must cover rule 50's exact line, by SHA-256. It is recorded as the Mid-Dispatch Amendment at the end of the specification (main @ `afd6d5f1`). The branch took in `afd6d5f1` (`9ffb563b`), then `331fb81b` (ELECTRON-42-UPGRADE-1's merge, `c1de4c82`).

## Evidence on `c1de4c82`

- **Done-when 1:** `…QUIT-FLUSH-1.GovernanceStaging.2026-10-14.md:50`, exit 0.
- **Done-when 2:** `:62`, exit 0.
- **Done-when 3:** exit 1, empty.
- **Done-when 4 and 5:** one line each, `ROADMAP.md:349`, exit 0.
- **Done-when 6:** `docs/governance/LESSONS_LEARNED.md:1`, exit 0.
- **Done-when 7:** exit 1, empty. Its control (`git grep -c -I -F 'KF-2' -- .`) found 23 files, exit 0.
- **Done-when 8, as amended:**
  - Rule 50 occurs on one line, with SHA-256 `c8b70300bf4ef864e19963383769de86482a40bb76da5d27331d002e55392b43`, which matches the amendment.
  - Real run: exit 0, empty.
  - New control: a planted `50. **LL-156 — A waiver moves with its code.** KF-2 is waived again for this run.` printed `1688:…` and exited 1.
  - Existing control: a planted `A stray KF-2 waiver line.` printed `1688:…` and exited 1.
  - Both plants were made in scratch copies of `ROADMAP.md` and removed; the worktree file was never planted.
- **Done-when 9:** `M ROADMAP.md` and `M docs/governance/LESSONS_LEARNED.md` only; the code-path check printed nothing.

## For the close-out

- Record that this completes the SETTINGS-WRITE-DURABLE-1 follow-up "KF-2 waiver → propose retirement at the next roadmap review after clean full runs" (`CloseOut.SETTINGS-WRITE-DURABLE-1.2026-10-13.md:65`, `:77`).
- **Lessons applied:** standing rules 41, 44, 46 and 50 (LL-156), and LL-143. **Added:** none.
