# Dispatch Close-Out Governance Staging — RELEASE-RUNBOOK-1

Branch `eb/release-runbook-1` from `refs/remotes/origin/main` @ `6dc951ee` (ELECTRON-42-UPGRADE-1 merged at `331fb81b`). Worktree `C:\Projects\Blurby\.worktrees\release-runbook-1`. Machine: the owner's ARM64 Windows machine. Tools: Electron 42.11.18, electron-builder 26.15.3, electron-updater 6.8.9, npm 11.9.0, gh authenticated as `gorillabrown`. The run wrote nothing to the register (standing rule 46) and published nothing.

## Evidence by Done-when

| # | Result | Evidence |
|---|---|---|
| 1 | Met | `docs/governance/RELEASE_RUNBOOK.md` has 12 `## ` headings in the specified order: Inputs, Preflight, Version bump, Build x64, Build ARM64, One `latest.yml` for both architectures, Checksums, Draft release and upload, Verify, Publish, Rollback, Unsigned builds. `Select-String … -Pattern '^## ' \| Measure-Object` reports 12. |
| 2a | Met | x64: `npm ci --os=win32 --cpu=x64` installs `@img/sharp-win32-x64` and `@napi-rs/canvas-win32-x64-msvc` on this ARM64 host. The x64 package (`release/win-unpacked/resources/app.asar.unpacked`) holds `@img/sharp-win32-x64/lib/sharp-win32-x64.node`, `@napi-rs/canvas-win32-x64-msvc/skia.win32-x64-msvc.node` and `onnxruntime-node/bin/napi-v6/win32/x64/onnxruntime_binding.node` (plus onnxruntime's other platform binaries, shipped in every build). ARM64, after a plain `npm ci`: `@img/sharp-win32-arm64/lib/sharp-win32-arm64.node` and `onnxruntime-node/bin/napi-v6/win32/arm64/onnxruntime_binding.node`; no `@napi-rs/canvas` binding, because the lockfile pins only `canvas-win32-x64-msvc`. That is accepted: ARM64 PDF import uses pdf-parse's polyfills, which convert both owner test PDFs (PDF-IMPORT-DIAG-1's probe under ARM64 Electron 42). The runbook installs the x64 optional packages on an ARM64 host and says how. |
| 2 | Met | Following the runbook's two build sections, with version `1.75.1` (unchanged), produced, each run exiting 0: `release/nsis-web/Blurby-Web-Setup-1.75.1-x64.exe` 1,022,462 bytes; `blurby-1.75.1-x64.nsis.7z` 247,805,050; `Blurby-Web-Setup-1.75.1-arm64.exe` 1,021,671; `blurby-1.75.1-arm64.nsis.7z` 231,699,268. Separate per-architecture invocations (`--win --x64`, then `--win --arm64`), each after its own `npm ci`. `release/` is gitignored and stays untracked. |
| 3 | Met | The runbook's merge command produces one `release/nsis-web/latest.yml` (950 bytes) with `files` holding both stubs and `packages` holding `x64:` (`size` 247805050, `path` `blurby-1.75.1-x64.nsis.7z`) and `arm64:` (`size` 231699268, `path` `blurby-1.75.1-arm64.nsis.7z`), each with `sha512` and `blockMapSize`. `Select-String -Pattern '^\s+(x64|arm64):$'` prints `latest.yml:10:  x64:` and `latest.yml:16:  arm64:`. Re-derived independently: every `sha512` and `size` matches the files on disk (a scratch check under both architectures' Electron). Brain's ruling was not needed: Done-when 3's trigger is "cannot list both", and it can. How each architecture updates is in the runbook (below). |
| 4 | Met | `gh release list -L 3` before and after: `v1.1.2` (Latest), `1.1.1`, `1.1.0`, identical (compared with the same shell; an earlier comparison differed only by CRLF). `git ls-remote --tags origin`: identical, 23 lines. No draft exists (`gh release list --json isDraft` lists none). `gh release create`, `upload`, `edit` and `delete` appear only in the runbook. |
| 5 | Met | `git grep -n -F 'release workflow produces' -- docs/governance/TECHNICAL_REFERENCE.md` exits 1. The Auto-Updater paragraph and the Version Tagging lines now say there is no release workflow, give `1.75.1` and `v1.1.2`, and point to the runbook. |
| 6 | Met | `git diff --name-status refs/remotes/origin/main...HEAD`: `A docs/governance/RELEASE_RUNBOOK.md`, `M docs/governance/TECHNICAL_REFERENCE.md`, plus this memo and the time log. `package.json`, the lockfile, `.github/**`, `scripts/**` and all source are untouched. |
| 7 | Not this item's | No code changed. Each build section runs `npm run build` (exit 0 both times). |

## Findings that shaped the runbook

1. **A worktree build ships a broken updater.** `package.json` has no `repository` field, so electron-builder reads the GitHub owner from `.git/config`, which a worktree lacks (`.git` is a file). The first x64 build failed in `WebInstallerTarget` (`Cannot read properties of null (reading 'provider')`). The `win-unpacked` it left had an `app-update.yml` holding only `updaterCacheDirName`, so an updater built that way could never find a release. Fix in the runbook, without touching `package.json`: `-c.publish.provider=github -c.publish.owner=gorillabrown -c.publish.repo=Blurby` on every build, and a check that `app-update.yml` names all three. (A `--dir` build writes no `app-update.yml` at all, and `setupAutoUpdater` skips the check when it is absent; only the installer target writes one, so this affects release builds.)
2. **npm keeps only one `--cpu` value.** `npm ci --os=win32 --cpu=x64 --cpu=arm64` installed only the ARM64 natives. So one combined `--x64 --arm64` build cannot carry the right natives for both architectures on one host: its x64 package was 237,567,759 bytes with ARM64 `sharp` and no canvas. Its ARM64 package was byte-identical to the per-architecture one (same `sha512`), which confirms the builds are deterministic. The runbook builds each architecture after its own `npm ci`.
3. **How electron-updater picks an architecture** (6.8.9, `NsisUpdater` → `findFile(provider.resolveFiles(info), "exe")`). `findFile` takes the `files` entry whose name contains `process.arch`, and `resolveFiles` attaches `packages[process.arch]` to `files[0]` only. Simulated with electron-updater's own functions under x64 and ARM64 Electron 42:
   - Merged per-architecture `latest.yml` (the runbook's): x64 picks the x64 stub and package, a web-installer download checked by `sha512`. ARM64 picks the ARM64 stub, which downloads the ARM64 package and checks it against its built-in `APP_ARM64_HASH` (`app-builder-lib/templates/nsis/include/installer.nsh`).
   - electron-builder's own combined output: both architectures take the stub path.
   - v1.1.2: ARM64 got no update at all.
   The runbook's layout is the best of the three on this host.
4. **Drafts cannot be installed or updated from.** The stubs and electron-updater fetch from the public release URL, so the install and update checks in Verify run right after Publish, with Rollback ready. Before publishing, Verify checks the draft's assets, `latest.yml` and checksums through `gh`, which authenticates.
5. **Checksum files need LF.** `Set-Content` writes CRLF, and `sha256sum -c` then fails "No such file or directory". Seen here, which shows the check can fail. The runbook writes with `WriteAllText` and LF, as v1.1.2's files are, and verifies in PowerShell. Both `sha256sum -c` and the PowerShell check passed on the validated files.
6. **Unsigned updates install without a prompt.** `NsisUpdater.verifySignature` returns null when `app-update.yml` has no `publisherName`, so integrity rests on the `sha512` (x64) and the stub's package hash (ARM64). First-time installs show SmartScreen's "Unknown publisher".
7. **Electron 42's `npm ci` removes the Electron binary** (it downloads on first use). Packaging is unaffected, because electron-builder fetches its own Electron per architecture. Scripts that run the app's Electron need `node node_modules/electron/install.js` after each `npm ci` (ELECTRON-42-UPGRADE-1).

## Lessons

- **Applied:** standing rule 44 (LL-143), every command run on the release's `main`, none written from the old workflow; LL-142, the two-architecture `latest.yml` claim proved by building it, and the reference text that claimed it corrected; LL-160, validated on Electron 42; standing rules 41 and 46.
- **Proposed (provisional label, reassign at fold-in):**
  - *LL-new — Build-time repository inference fails in a git worktree.* electron-builder (and any tool that reads `.git/config` directly) finds no repository in a worktree, where `.git` is a file, and silently produces an `app-update.yml` without its provider. A release build either runs from a full clone, or passes the repository explicitly, and checks `app-update.yml` before shipping.

## Target: CLAUDE.md

### Fold-in 1 — Release procedure pointer
Section: §Current System State, the CI line (as amended by ELECTRON-42-UPGRADE-1's fold-in 2)
Action: Insert after
Content:
`- Releases: built and uploaded by hand following \`docs/governance/RELEASE_RUNBOOK.md\` (RELEASE-RUNBOOK-1, 2026-10-22): one build per architecture, each after its own \`npm ci\` (\`--os=win32 --cpu=x64\` on an ARM64 host), with \`-c.publish.provider/owner/repo\` set explicitly, and one merged \`latest.yml\` listing both packages.`

## Target: docs/governance/LESSONS_LEARNED.md

### Fold-in 1 — LL-new (worktree repository inference)
Section: end of file
Action: Append row
Content: the proposed entry under "Lessons" above, numbered at fold-in.

## Open items for the close-out

- Release gate (12) is met when this merges. The runbook itself runs after gate (2) passes, by the owner or Blurby.Roadmap on the owner's go, with the owner's version number.
- Not this item's: the lockfile has no `@napi-rs/canvas-win32-arm64-msvc`, so ARM64 PDF import runs on polyfills. A future dependency item could add it.
