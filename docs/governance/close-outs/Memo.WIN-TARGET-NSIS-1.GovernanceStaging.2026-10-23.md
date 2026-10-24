# Sprint Close-Out Governance Staging — WIN-TARGET-NSIS-1

Worktree-resident run (`eb/win-target-nsis-1`, `C:\Projects\Blurby\.claude\worktrees\unruffled-brattain-2ceca5`), dispatched by Blurby.Roadmap 2026-10-23 (Notion Seq 92, In Flight). Stage 8 build-and-hold: the branch is pushed and not merged; Blurby.Roadmap gives the merge go after the Stage 8 release is published and Blurby.Brain confirms the package. Nothing was published or uploaded.

## Gate evidence

### Setup (2026-10-23)
- `<base>` = `refs/remotes/origin/main` after `git fetch origin --prune` = **`d2a70ff1767f8c1f643a6d973a3a38572bc80133`**.
- No `.git/index.lock` (worktree or common dir); `refs/heads/eb/win-target-nsis-1` absent on origin; the spec (anchor `win-target-nsis-1-spec`) on HEAD; `npm ci` exit 0.
- Re-grep (standing rule 36) of `package.json`: `:31` `"publish"`, `:33` provider, `:56` target, `:58` artifactName, `:69` `runAfterFinish`, as specified. **Drift:** the `CLAUDE.md` line is `:373` (spec `:372`); content identical.

### Done-when 1 — red first (commit `d87f9e46`, the test file alone)
`npx vitest run tests/winTargetNsis.test.js`: **exit 1**, `Tests 1 failed | 3 passed (4)`.
- (w1) fails by assertion: `expected 'nsis-web' to be 'nsis'`, at `tests/winTargetNsis.test.js:41`.
- (w2), (w3), (w4) pass as controls.

### Done-when 2 — the change (commit `fd3da397`)
- `git diff d2a70ff1 -- package.json`: exactly three hunks (publish owner/repo; target and artifactName; `buildUniversalInstaller`).
- The `node -p` check prints `nsis | ${productName}-Setup-${version}-${arch}.${ext} | false | [{"provider":"github","owner":"gorillabrown","repo":"Blurby"}]`.
- `npx vitest run tests/winTargetNsis.test.js`: **exit 0**, 4 passed. electron-builder accepted `buildUniversalInstaller` (no schema error).

### Done-when 3 — base builds (detached `d2a70ff1`, runbook with `@Overrides`)
The runbook's Inputs, Build x64 and Build ARM64 code blocks were extracted from the checked-out `RELEASE_RUNBOOK.md` and run unchanged in one `pwsh` scope. Every `throw` check passed. 21:52–22:02. Copied to `C:\Projects\Blurby-artifacts\win-target-nsis\base\`. Log: `C:\Projects\Blurby-artifacts\wtn-base-build.log`.

### Done-when 4 — after builds (branch `fd3da397`, runbook with no overrides)
The same extraction from the edited runbook. Every `throw` check passed, including the three `app-update.yml` lines for both architectures. 22:02–22:10. Copied to `...\win-target-nsis\after\`. Log: `C:\Projects\Blurby-artifacts\wtn-after-build.log`.

| File | base | after |
|---|---|---|
| `Blurby-Setup-1.75.1-x64.exe` | 248,443,387 | 248,443,387 |
| `Blurby-Setup-1.75.1-arm64.exe` | 247,400,709 | 247,400,709 |
| `latest-x64.yml` / `latest-arm64.yml` | 352 / 356 | 352 / 356 |

The installers have equal sizes but are not byte-identical (build timestamps). `app-update.yml` (both architectures, both builds): `owner: gorillabrown`, `repo: Blurby`, `provider: github`, `updaterCacheDirName: blurby-updater`.

### Done-when 5 — artifacts match
The spec's script: **exit 0, `MATCH`**.

### Done-when 6 — the merged feed
The runbook's merge section, run unchanged with `release` a junction to `after\`: `latest.yml: Blurby-Setup-1.75.1-x64.exe, Blurby-Setup-1.75.1-arm64.exe`, and `Select-String` printed both `url:` lines. The spec's arch-selection check: `x64 -> Blurby-Setup-1.75.1-x64.exe`, `arm64 -> Blurby-Setup-1.75.1-arm64.exe`, **exit 0**. Merged `latest.yml`:

```yaml
version: 1.75.1
files:
  - url: Blurby-Setup-1.75.1-x64.exe
    sha512: IgkjfL1CpXOuc7B15bqru/KogOewaY3Q5BclihH0WvBQ9JyoVzJ2IW1UErYpVJnboE3qq3qjFLyGBYlCa6dZOg==
    size: 248443387
  - url: Blurby-Setup-1.75.1-arm64.exe
    sha512: adFpJPwUTDwIEJ2GaqwMuWvKHvLeLlZLdA19hM1GZIO0CEpVhheBOFIa/V9HvHu4HkilDzMwOdeVQgqwkyxrgQ==
    size: 247400709
path: Blurby-Setup-1.75.1-x64.exe
sha512: IgkjfL1CpXOuc7B15bqru/KogOewaY3Q5BclihH0WvBQ9JyoVzJ2IW1UErYpVJnboE3qq3qjFLyGBYlCa6dZOg==
releaseDate: '2026-10-24T03:09:51.035Z'
```

### Done-when 7 — runbook has no overrides
On the branch: **exit 1**, empty. On the base it printed `:5`, `:17`, `:18`, `:53`, `:70`. **Drift:** the spec expected the `:23` heading; that heading reads "publish overrides" in lower case and does not match the case-sensitive pattern, while `:5` matches on `-c.win.target`.

**Deviation (recorded, tier 1):** the spec's header sentence "Overrides moved into `package.json` by WIN-TARGET-NSIS-1." would itself match `Overrides` and fail this gate. It was written "The command-line overrides moved into `package.json` by WIN-TARGET-NSIS-1.", which keeps the meaning and passes. No sha is named (standing rule 49).

### Done-when 8 — no stale name
On the branch: **exit 1**, empty. On the base: `CLAUDE.md:373`, `docs/testing/auto-update-e2e.md:54`, `package.json:58`. The runbook keeps nsis-web only as history (`:5`'s reason for `nsis`, `:174` v1.1.2 install).

### Done-when 9 — suite, typecheck, build, collection
- First `npm test` (on `fd3da397`): exit 1, `1 failed | 2454 passed | 2 skipped`. The one failure was `tests/epub-2b-pipeline.test.js` "returns contentHtml field alongside content", a 30 s timeout under load (four other builders on the machine). The file touches nothing this item changes. Alone, it passed 16 of 16.
- **Final `npm test` on tip `25cab87c`: exit 0, `Test Files 182 passed (182)`, `Tests 2455 passed | 2 skipped (2457)`.**
- `npm run typecheck`: exit 0. `npm run build`: exit 0 (on `fd3da397` and again on `25cab87c`).
- `npx vitest list --filesOnly`: base 181 files, branch 182; the only addition is `tests/winTargetNsis.test.js` (standing rule 52).
- `tests/packageReleaseTruth.test.js` and `tests/packagingFix.test.js` green and unedited (standing rule 50).

### Done-when 10 — fence
Tip `25cab87c` merges `origin/main` @ `e4925762` (roadmap review 2026-10-23-5: ROADMAP, register recovery files, planning docs; nothing under `build.files`) for rule 53. The item's own diff, `git diff --name-status refs/remotes/origin/main...HEAD`:

```
M	CLAUDE.md
M	docs/governance/RELEASE_RUNBOOK.md
M	docs/governance/TECHNICAL_REFERENCE.md
M	docs/testing/auto-update-e2e.md
M	package.json
A	tests/winTargetNsis.test.js
```

plus this memo and `Timing.WIN-TARGET-NSIS-1.jsonl`. Nothing in `package-lock.json`, `main/`, `src/`, `.github/` or the shared-core set. `release/`, `dist/` and `tests/perf-baseline-results.json` (modified by `npm test`) stay unstaged.

## Package verification (standing rule 53)
- **(a)** `npx electron-builder --win --dir --arm64 --publish never` on tip `25cab87c` (with `origin/main` merged in), in this worktree: exit 0. Package `C:\Projects\Blurby\.claude\worktrees\unruffled-brattain-2ceca5\release\win-arm64-unpacked\`. `Blurby.exe` PE machine `0xAA64`. Log `C:\Projects\Blurby-artifacts\win-target-nsis\rule53-dir-arm64.log`.
- **(b)** Packaged `main.js` contains `BLURBY_USER_DATA_DIR`. Launched native ARM64 on scratch profile `%TEMP%\wtn1-profile-20261023221537` for 25 s: alive; no `error.log`; 0 crash dumps; no error, unhandled-rejection or crash line except five `[ws-server] ... EADDRINUSE ... 127.0.0.1:48924`, the known noise. The port is owned by pid 16120, `C:\Users\estra\AppData\Local\Programs\blurby\Blurby.exe` (the owner's installed Blurby). Logs: `C:\Projects\Blurby-artifacts\win-target-nsis\rule53\`.
- **(c)** No `main/` file changed (`git diff --name-only d2a70ff1 HEAD -- main main.js preload.js src assets` is empty). In `app.asar`: all 21 `dist/` files present with matching SHA-256, none extra; `main.js` and `preload.js` match the tree.
- **(d)** The automatable Done-when checks ran on packaged output: Done-when 4's `throw` checks, 5 and 6 read the after builds' installers, `latest-*.yml` and `win-*-unpacked\resources\app-update.yml`. A `--dir` build writes no `app-update.yml` (electron-builder writes it with an installer target only), so (d) rests on the after builds, built from `fd3da397`, whose `build` block and runbook equal the tip's.
- **(e)** This section; the package path, commit and logs were sent to Blurby.Brain. The merge go waits for Brain's confirmation.

## Reviews
Run in parallel, read-only, on `25cab87c`.
- Spec compliance (Solon): **APPROVED_WITH_CONCERNS.** Every edit site and (w1)–(w4) PASS; it re-ran the test (4/4) and gates 7 and 8 (exit 1, empty). It judged the header-sentence deviation justified. Minor concern: the spec does not say where in the header line the sentence goes; it sits after the validation sentences. Not changed.
- Code quality (Plato): **READY_WITH_NOTES**, no blocking defects. `process.arch` restore safe; the ARM64 BCJ `try`/`finally` intact. Notes: the test imports electron-updater internals (`out/providers/Provider`), so a major upgrade fails it at import, which is loud. Pre-existing drift: `CLAUDE.md`'s line still opens "CI/CD active via GitHub Actions" although no workflow releases. Out of scope for this item; a candidate follow-up.

## Lessons
- **Applied:** standing rules 36, 41, 43, 44, 46 (no register writes), 47, 48, 49, 50, 52, 53; LL-142 (claims proved by building); LL-152 (same recipe, same machine, base and after).
- **Added:** none. The gate 7 self-collision is a spec-authoring slip, recorded above.

## Merge-train notes
Before the post-freeze merge: take `refs/remotes/origin/main` in, then re-run Done-when 1, 2, 7, 8 and 9. Re-run builds 3–6 only if `package.json`'s `build` block or the runbook's Build sections changed on `main`.
