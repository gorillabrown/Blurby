# Sprint Close-Out Governance Staging — OVERLAY-THEME-SWEEP-1

Worktree-resident run (`eb/overlay-theme-sweep-1`, `C:\Projects\Blurby\.claude\worktrees\hopeful-bouman-e62757`, cut from `refs/remotes/origin/main` @ `d2a70ff1`), dispatched by Blurby.Roadmap 2026-10-23 (Notion Seq 90, In Flight). Build-and-hold under the Stage 8 freeze: pushed with `git push origin HEAD:refs/heads/eb/overlay-theme-sweep-1`, not merged. Artifacts: `C:\Projects\Blurby-artifacts\overlay-theme-sweep-1\`. Debug ports 9470 (CDP) and 10470 (inspector), checked free before use.

## Gate evidence

### Setup (2026-10-24 02:48Z)
- `.git/index.lock` absent; `eb/overlay-theme-sweep-1` absent on origin (`git ls-remote`, both cases); spec anchor `overlay-theme-sweep-1-spec` on HEAD; `npm ci` exit 0.
- Reconciliation recipe: `git switch -c eb/overlay-theme-sweep-1 refs/remotes/origin/main` → `d2a70ff1`; `git merge-base --is-ancestor 77929621 HEAD` exit 0.
- Re-grep (standing rule 36): every edit site matched the spec's line numbers (`HighlightsOverlay.tsx:92-115`, `QuickSettingsPopover.tsx:56-69`, the 24 `keyboard.css` lines, `page-reader.css:473`). No drift.
- Held-branch overlap: no `eb/*` branch on origin touches the four source files beyond EINK-CONTROLS-1's planned `QuickSettingsPopover.tsx:24-29` hunk (Merge order in the spec).

### Done-when 1 — base observation (packaged `d2a70ff1`)
`docs/studies/investigations/OVERLAY-THEME-SWEEP-1.base.2026-10-24.md`. Controls (c1) `#f5f3ef` → `#0f0f0f` and (c2) pass. (b1) and (b2): Escape exits the reader on the base. All five panels read `rgb(26, 26, 46)` in Blurby, Dark, Light and E-ink; the hovered mode button reads `rgb(68, 68, 68)`. No stop rule fired, so nothing was dropped. Live profile hashes unchanged.
- **Order note:** the red file (C1) was committed at 02:51:36Z, while the base package was building and before the base probe ran (02:57Z). The base package was built from `d2a70ff1` with no source change, and C1 adds only a test file, outside `build.files`.

### Done-when 2 — red (C1 `a5d67e66`, the test file alone)
`npx vitest run tests/overlayThemeSweep.test.tsx`: **exit 1**, `Tests 5 failed | 3 passed (8)`.
- (k1) and (k2): `exitReader` called once (`expected "vi.fn()" to not be called at all, but actually been called 1 times`).
- (t1): `--color-bg: expected true to be false`.
- (t2): `.goto-indicator {` block does not contain `background: var(--bg-raised)`.
- (t3): `.rbb-mode-btn:hover` reads `var(--color-border, #…`.
- Passing on the base: (k3) control, (k4) list navigation, (t4) control.
- Test notes: `window.electronAPI.getAllHighlights` is mocked; `Element.prototype.scrollIntoView` is stubbed because jsdom lacks it and the list scrolls the focused row.

### Done-when 3 — the change (C2 `7d044063`)
Four files, exactly as specified: the two listeners move to the capture phase with the spec's comment and `e.stopPropagation()` in the Escape branch; the 24 `keyboard.css` reads and `page-reader.css:473` move to `--bg-raised`, `--border`, `--text`, `--text-dim`, literal fallbacks dropped. `npx vitest run tests/overlayThemeSweep.test.tsx`: **exit 0**, 8/8. `tests/helpSurfaces.test.tsx` and `tests/componentStyleCleanup.test.ts` unedited, green (29/29 across the three files).

### Done-when 4 — source gates (pwsh)
- `(git grep -n -- "--color-" -- src/styles/keyboard.css | Measure-Object -Line).Lines` → `2` (`:128`, `:214`).
- `git grep -n -- "--color-bg" -- src` → exit 1.
- The capture-listener grep → exit 0, 4 lines.

### Done-when 5 — after observation (packaged tip `0379b6ca`)
`docs/studies/investigations/OVERLAY-THEME-SWEEP-1.after.2026-10-24.md`. (c1) and (c2) as the base; (b1) and (b2): overlay gone, reader open; 20 of 20 panel × theme rows match `--bg-raised`, `--border` and `--text`; the hovered mode button equals `--border` in all four themes, E-ink included. Live hashes unchanged. Repeated (`profile-tip-2`) with the same figures.

### Done-when 6 — suite, typecheck, build (on `0379b6ca`, local session on the owner's machine)
- `npm test`: 182 files, **2,459 passed / 2 skipped / 0 failed, exit 0**.
- `npm run typecheck`: **exit 0**.
- `npm run build`: **exit 0** (the vite step of the tip package build).

### Done-when 7 — fence
`git diff --name-status refs/remotes/origin/main...HEAD` lists the four source files (M), `A tests/overlayThemeSweep.test.tsx`, `A` the two investigation files and two `.txt` probes (`OVERLAY-THEME-SWEEP-1.probe.mjs.txt`, `.summarize.mjs.txt`), `M docs/governance/BUG_REPORT.md` (BUG-218, `RESOLVED in source (OVERLAY-THEME-SWEEP-1)`, no sha), this memo and the time log. Nothing in `main/`, `ThemeProvider.tsx`, `themes.css`, `base.css`, `types.ts`, `ReaderContainer.tsx` or `FlowScrollEngine.ts`; no `style=` added. `tests/perf-baseline-results.json` unstaged.
- BUG number: BUG-217 was the highest on `origin/main` @ `574f20ef` and on every `eb/*` branch on origin at 03:06Z. Other builders run in parallel, so re-check for a BUG-218 collision at merge.

### Done-when 8 — owner
Added to release gate (2)'s batched owner list (standing rule 45), not a separate run: in Light and E-ink, the highlights overlay, quick settings, snooze and tag pickers and the go-to badge read clearly; a hovered mode button is readable; Escape on `;` leaves you in the book. **Caveat for the owner list:** quick settings cannot be opened in the app (BUG-215), and the go-to badge does not appear on `g` (finding 2 below), so the owner can check only the highlights overlay, the two pickers and the hover until those are fixed.

## Package verification (standing rule 53)
- **(a)** `npx electron-builder --win --dir --arm64 -c.directories.output=release-tip` from `0379b6ca` (C2 with `origin/main` `574f20ef` merged in), in this worktree, into its own output folder (the base build stays in `release\`): exit 0. Copy: `C:\Projects\Blurby-artifacts\overlay-theme-sweep-1\tip-unpacked\`.
- **(b)** The built `main.js` contains `BLURBY_USER_DATA_DIR` (2 matches). `Blurby.exe` on a fresh scratch profile for 25 s, native arm64: alive at 25 s; no `error.log`, no `.dmp`; output holds only five `[ws-server] … EADDRINUSE 127.0.0.1:48924` lines, the port held by the owner's installed Blurby (`AppData\Local\Programs\blurby\Blurby.exe`, PID 16120), known noise. Live hashes unchanged. Record: `launch25.json`.
- **(c)** `npx asar extract` of `app.asar`: `dist/` is byte-identical to the worktree's `dist/` (`diff -r`, no output); no `main/` or `preload.js` file changed (`git diff --name-only d2a70ff1 HEAD -- main preload.js` empty). The bundled CSS has 0 `--color-bg` (base asar: 5) and contains `.rbb-mode-btn:hover{background:var(--border)}`.
- **(d)** Done-when 5 ran on this package (above).
- **(e)** Sent to Blurby.Brain with the package path, commit and logs. C3 (docs only) changes nothing under `build.files`: package unchanged from `0379b6ca`.

## Findings (outside this item's scope)
1. **Escape over the library.** On the base, the overlay left open after Escape exits the reader reappears over the library, because the library renders its own copy from the same `activeOverlay` state (`LibraryContainer.tsx:728`, `:734`). Fixed as a side effect: Escape no longer reaches the reader.
2. **The go-to badge never shows on `g`.** `GoToIndicator` mounts when `goToPending` turns true, after `startGoTo` has dispatched `blurby:goto-pending`, so it misses the event and stays hidden (all four themes, base and tip). For THEME-TOKEN-SWEEP-2 or its own stub; LOW.
3. **Quick settings has no route** (BUG-215, already filed): the probe opened it through the `activeOverlay` hook's own React dispatcher.
4. **Foliate paginator exception.** `TypeError: Cannot destructure property 'style' of 'r' as it is null.` from the `paginator` chunk during fast reader open/close rounds, on base and tip alike. Not filed: candidate for BUG-187's area or a new LOW bug.
5. The probe was refined between runs (settings flap opens on the reading queue; the leftover overlay covers the book card; exception logging adds the step name). Base runs 3 and 4 and tip runs 1 and 2 used the same flow; the committed `.txt` is the final version.

## Lessons
- **Applied:** LL-142 and LL-152 (base observed on a packaged build before the change, the after run on the same recipe); LL-165 (userData read back over the inspector before the first press; live hashes before and after every run); LL-166 (positive controls (c1) and (c2) seen first; every verdict read from computed state; presses made where the control should act, e.g. hovering a non-active mode button and reading `:hover` back); LL-167 / rule 53 (package verification above).
- **Added:** none. Candidate for the next roadmap review: a live probe should check that each route actually reaches its surface before a spec names it (two of this spec's routes, Ctrl+Shift+, and `g`, do not open their panels in the app).

## Commits
- C1 `a5d67e66` — red tests.
- C2 `7d044063` — the fix.
- `0379b6ca` — merge of `origin/main` `574f20ef` (rule 53 package base; ROADMAP and `Virtuoso/.recovery` only).
- C3 — investigation files, probes, BUG-218, this memo and the time log.
