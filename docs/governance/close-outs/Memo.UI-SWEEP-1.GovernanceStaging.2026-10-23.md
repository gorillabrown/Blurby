# Dispatch Close-Out Governance Staging — UI-SWEEP-1 (parked)

**Status:** parked on 2026-10-23 at Blurby.Roadmap's priority change, because the release fixes come first. The full live run is not complete. This memo records how far the run got, so it can resume from here.

- **Branch:** `eb/ui-sweep-1`.
  - The script and self-test were already pushed at `3ce8ed88` on 2026-10-22.
  - This session added the harness fixes `21222650`, `6f6e8adc` and `cbe5a9d1`.
- **Build:** a `--dir` package of `47ae6e1f`.
  - It is built in the detached worktree `C:\Projects\Blurby\.worktrees\ui-sweep-build-47ae6e1f`, for x64. That worktree's earlier package was ARM64 only, and this machine is AMD64.
  - The sweep runs from a copy at `C:\Projects\Blurby-artifacts\ui-sweep-1\build-47ae6e1f-x64\`, because of BUG-194.
- **Seeds** (copies in `C:\Projects\Blurby-artifacts\ui-sweep-1\seeds\`): the bundled sample, plus `g0-converted-text.epub`, `Superhuman_Keyboard_Shortcuts.pdf` and `prose-basic.txt`. All three are tracked repository files.
  - The repository has no EPUB or PDF under `tests/fixtures`.
- **Runner:** `C:\Projects\Blurby-artifacts\ui-sweep-1\run-sweep.ps1 -Label <name> -TimeboxMin 120 -Live`.
  - It uses debug port 9370 and a fresh scratch profile under `%TEMP%`.
  - The live profile is only hashed, never opened.

## How far it got

1. **Harness fixes found by trial runs.** These are all committed; none changes product code.
   - **Hang after the first press (`21222650`).** The native-dialog watcher's pwsh helper writes CRLF, so the `@@END\n` marker never matched. The marker now matches `\r?\n`, and a helper call times out after 20 s.
   - **Seeds missing from the library (`21222650`).** Imports made over CDP show only after a reload. Every import is stored as `<id>.epub`, so each seed is now matched by its own file name.
   - **One surface's failure ended the whole run (`6f6e8adc`).** A failing surface now records UNREACHABLE with its reason, and the run continues. The Hotkey Map rows are read once, up front. A lingering onboarding tour is skipped on the way home.
   - **Three reach faults (`cbe5a9d1`).**
     - "Archive document" archived the sample in the main pass, so 23 later routes through its card failed. Archive now runs with the destructive pass, on a fresh copy.
     - Settings items begin with an icon, so a match on the text start never fired. The match now skips leading symbols.
     - The clipboard write needs focus, so focus emulation is now on.
2. **Full run 2** (before `cbe5a9d1`, 16.4 min) reached 19 of the 57 planned surfaces. It covered 112 controls: 69 OK, 5 ERROR, 23 NO-EFFECT, 5 SKIPPED-SAFETY and 10 UNREACHABLE.
   - The positive control failed only because the Flow surfaces were not reached (the archived sample).
   - The live profile's sha256 values were equal before and after:
     - `library.json`: `d4b884bd…cffbdf6`
     - `settings.json`: `1a4a40c6…818debd4`
   - Its report is not committed. It is superseded by the next run.
3. **Full run 3** (with all the fixes) was stopped after the seed and the prefetch ("prefetched hotkey rows", so the settings-pane route now works). It reached the first surface when the priority changed. Its partial log is `C:\Projects\Blurby-artifacts\ui-sweep-1\full3.log`.

## To resume

Run `pwsh -NoProfile -File C:\Projects\Blurby-artifacts\ui-sweep-1\run-sweep.ps1 -Label full4 -TimeboxMin 120 -Live`. Then check four things:
1. The positive control: at least one Flow ERROR row carries BUG-187's ResizeObserver message. If none does, stop (Done-when 2).
2. The coverage per surface.
3. The live-profile hashes.
4. Write the report's bug candidates, and commit the report with the script.

## Lessons

- **Applied:** standing rule 43 (the positive control gates the run); LL-142; LL-146 (the scripts stay out of collectable test names); standing rule 46 (nothing is written to the register).
- **Added:** none yet.
