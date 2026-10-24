# Dispatch Close-Out Governance Staging — RELEASE-RUNBOOK-1

Branch `eb/release-runbook-1` from `refs/remotes/origin/main` @ `6dc951ee` (ELECTRON-42-UPGRADE-1 merged at `331fb81b`). Worktree `C:\Projects\Blurby\.worktrees\release-runbook-1`. Machine: the owner's ARM64 Windows 11 machine. Tools: Electron 42.11.18, electron-builder 26.15.3, electron-updater 6.8.9, npm 11.9.0, gh 2.88.1 (authenticated as `gorillabrown`), PowerShell 7.6. The run wrote nothing to the register (standing rule 46) and published nothing.

## Rulings and directions during the run

1. **Done-when 3 → owner decision (B), 2026-10-22,** relayed by Blurby.Brain (tier 2), verbatim: "Yes, option B: release separate full installers for x64 and ARM64. The bigger download is fine; native ARM64 matters." The runbook builds one full NSIS installer per architecture with CLI overrides (`-c.win.target=nsis`, `-c.win.artifactName=${productName}-Setup-${version}-${arch}.${ext}`). `package.json` is untouched (still `nsis-web`).
   - Why not nsis-web: its single-architecture ARM64 stub has no package name to download (`installer.nsh` falls to the undefined `${APP_32_NAME}`). Its combined stub installs x64 unless an ia32 build is included.
2. **No versioning (owner direction, 2026-10-22, via Blurby.Roadmap), verbatim:** "We don't have to keep versioning. This is not released publicly. Drop this aspect." The Version bump section is removed. The build uses `package.json`'s version, and the tag is `build-<sha8>`.
   - The runbook therefore has **11** `## ` sections, not Done-when 1's 12. Blurby.Roadmap records that amendment.
   - Roadmap's question: electron-updater offers an update only when the version increases. The first published 1.75.1 build is offered once to the owner's 1.1.2 install; later builds at 1.75.1 are installed by hand. This is one line in Verify.
3. **Tier-1 rulings by Blurby.Brain:**
   - The `useZip` variant on the test identity: tried; it failed.
   - The Windhawk re-test: the owner exited Windhawk; it was ruled out.
   - The extraction capture.
   - The test identity used for every install test.

## Evidence by Done-when

| # | Result | Evidence |
|---|---|---|
| 1 | Met as amended (11) | Headings, in order: Inputs, Preflight, Build x64, Build ARM64, One `latest.yml` for both architectures, Checksums, Draft release and upload, Verify, Publish, Rollback, Unsigned builds. Version bump is removed (direction 2). |
| 2a | Met | x64 package (`release/win-unpacked`) holds `@img/sharp-win32-x64/lib/sharp-win32-x64.node`, `@napi-rs/canvas-win32-x64-msvc/skia.win32-x64-msvc.node` and `onnxruntime-node/bin/napi-v6/win32/x64/onnxruntime_binding.node`, because the x64 build runs `npm ci --os=win32 --cpu=x64` on this ARM64 host. ARM64 package holds `sharp-win32-arm64.node` and `onnxruntime-node/.../win32/arm64/onnxruntime_binding.node`. It has no canvas binding, because the lockfile pins only `canvas-win32-x64-msvc`; ARM64 PDF import uses pdf-parse's polyfills, which convert both owner test PDFs (PDF-IMPORT-DIAG-1). Both build sections now throw if these are wrong, and if `app-update.yml` lacks `provider`, `owner` or `repo`. |
| 2 | Met | The runbook's build sections, run verbatim at version `1.75.1`, each exit 0: `release/Blurby-Setup-1.75.1-x64.exe` 248,442,522 bytes and `.blockmap` 259,587; `release/Blurby-Setup-1.75.1-arm64.exe` 247,399,864 and `.blockmap` 259,814. `release/` is gitignored and untracked. |
| 3 | Met | The merge section produces `release/latest.yml` whose `files` lists `Blurby-Setup-1.75.1-x64.exe` then `-arm64.exe`, each with `sha512` and `size`. There is no `packages:` map, because full installers carry their app. Done-when 3's `^\s+(x64\|arm64):$` check is for the nsis-web layout, so the runbook checks the two `url:` lines. electron-updater's own `findFile(resolveFiles(...), "exe")`, run under x64 and under ARM64 Electron 42, picks the matching installer; sha512, size and blockmap were checked against the files. |
| 4 | Met | `gh release list -L 3` before and after: `v1.1.2` (Latest), `1.1.1`, `1.1.0`, identical with the same shell. `git ls-remote --tags origin`: 23 lines, identical. No draft exists. `gh release create/upload/edit/delete` appear only in the runbook. |
| 5 | Met | `git grep -n -F 'release workflow produces' -- docs/governance/TECHNICAL_REFERENCE.md` exits 1. The Auto-Updater and Version Tagging text now describe the manual per-architecture runbook, `1.75.1` and `v1.1.2`, and v1.1.2 offering ARM64 the x64 build. |
| 6 | Met | `git diff --name-status refs/remotes/origin/main...HEAD`: `A docs/governance/RELEASE_RUNBOOK.md`, `M docs/governance/TECHNICAL_REFERENCE.md`, plus this memo and the time log. The issue file below is a handoff record, staged for Roadmap's close-out. |
| 7 | Not this item's | No code changed. Each build section runs `npm run build` (exit 0). |

## The ARM64 installer defect, found and fixed in the runbook

Validating (B), the ARM64 installer exited 0 but installed no `Blurby.exe`. The record is `docs/governance/bug-reports/Issue.RELEASE-RUNBOOK-1.2026-10-22.md`.
- **Symptom.** 17 of 681 files were missing every time (fresh, re-run, and over the top). Each missing file was an ARM64 binary: the exe; `ffmpeg.dll` and the other top-level DLLs; sharp's libvips DLLs; onnxruntime's `win32/arm64` DLLs; and its darwin/linux arm64 libraries.
- **Ruled out.** Windhawk: the owner exited it, and the loss repeated. An OS filter: an x86 process copied ARM64 DLLs fine. The copy step: the installer's `$PLUGINSDIR\7z-out`, watched during an install, never contained the 17 files.
- **Root cause.** `7z l -slt` shows exactly those 17 entries compressed as `ARM64 LZMA2:20`, 7-Zip's newer ARM64 branch filter. The installer's Nsis7z plugin cannot decode it and skips the files silently. x64 binaries use `BCJ2`, which it decodes.
- **Fix.** `ELECTRON_BUILDER_7Z_FILTER=BCJ` for the ARM64 build only (`app-builder-lib/out/targets/archive.js`, `compute7zCompressArgs`). The archive is then 681 `BCJ LZMA2:20` entries, and the installer grows from 232.4 to 247.4 MB.
- **Validated on the test identity** (`com.blurby.rrtest`, product `BlurbyRRTest`, installed silently, with its own folder, registry key and profile):
  - Fresh ARM64 install: 681 of 681 files present and byte-identical; `BlurbyRRTest.exe` is `0xAA64`; as Node it reports `arm64 42.11.18`; a native launch voiced 6 Narrate words and quit with exit 0 and no dumps; a clean uninstall.
  - Over the top: from an x64 nsis-web 1.1.2 stand-in (`0x8664`) that had run on its default profile, to the ARM64 full installer. One uninstall entry, now 1.75.1; 0 files missing; exe `0xAA64`.
  - Profile check: `%APPDATA%\blurby-rrtest\blurby-data\*.json` byte-identical across the install. The native ARM64 run on that profile voiced and had the same library.
- **Untouched throughout.** The owner's real Blurby 1.1.2 install (uninstall key `3d1a7f75-…`) and `%APPDATA%\blurby` (last written 2026-10-14) were checked before and after each session. They were never installed over, because a release-identity install would replace them and its run-after-finish would open the real profile.
- **Also tried.** `-c.nsis.useZip=true` (nsisunz) failed on both architectures: ARM64 exit 2 with nothing installed; x64 hung. It is not used.
- **History.** Every ARM64 nsis-web package Blurby built had the same flaw, which fits ARM64 machines running the x64 build.

## Other findings that shaped the runbook

- **Worktree builds ship a broken updater without overrides.** `package.json` has no `repository`, and a worktree's `.git` is a file, so electron-builder finds no GitHub owner. `app-update.yml` then has only `updaterCacheDirName`. Every build therefore passes `-c.publish.provider/owner/repo` and checks the file. A `--dir` build writes no `app-update.yml` at all, which `setupAutoUpdater` already tolerates.
- **npm keeps only one `--cpu` value.** A combined `--x64 --arm64` build on one host cannot carry both architectures' natives, so each architecture gets its own `npm ci`.
- **Checksum files need LF.** `sha256sum -c` failed on `Set-Content`'s CRLF, which proved the check can fail. The runbook writes LF; `sha256sum -c` and its PowerShell check both pass.
- **Unsigned updates install without a prompt.** `NsisUpdater.verifySignature` returns null without a `publisherName`. Integrity is `latest.yml`'s `sha512`. First installs show SmartScreen's "Unknown publisher".
- **Drafts can be install-tested** with (B) full installers: they install from the downloaded file with no network fetch. That fixes the review's concern that the first install test came after the feed was live.
- **The smoke build (`47ae6e1f`).** Its only packaging-relevant change since `6dc951ee` is the dev-only `follow-redirects` 1.16.0 → 1.16.1 in the lockfile. That package is not shipped and has no native code, and `build` is identical, so this validation holds for it. The ARM64 install now works on this machine, so the smoke checklist's A1 (install ARM64, Task Manager shows ARM64) can run.

## Review

The reviewer re-read every command against Done-when 2–4.
- **Blocker:** the nsis-web ARM64 stub. Resolved by (B) and the BCJ fix.
- **Should-fix items, all applied:**
  - S1: v1.1.2 offered ARM64 the x64 build.
  - S2: Preflight checks the tag with `ls-remote` and enforces `gh auth status`.
  - S3: `npm ci`/`npm run build` exit guards, and `dist/` cleared.
  - S4: native and `app-update.yml` checks enforced.
  - S5: tree and sha re-asserted before upload.
  - S6: `latest.yml` sha512 and size checked before publishing.
  - S7: Rollback fallbacks.
- **Nits applied:** N1–N9, and N11. N10 is applied by labelling the x64-host `npm ci` lines unvalidated. **Left:** N12, stale TECHNICAL_REFERENCE lines outside Done-when 5 (artifact naming and "Non-one-click"), recorded below.

## Lessons

- **Applied:** standing rule 44 (LL-143), every command run on the release's `main`; LL-142, the two-architecture claims proved by building and installing; LL-160, validated on Electron 42; LL-151, every check shown failing first (the CRLF checksum, a planted `latest.yml` size, the 17-file compare); standing rules 41 and 46.
- **Proposed (provisional labels; reassign at fold-in):**
  - *LL-new-a — An installer that exits 0 has not installed anything.* The ARM64 installer reported success while dropping its executable. An install check compares the installed tree, path by path, against the unpacked build, and launches the result.
  - *LL-new-b — 7-Zip's ARM64 branch filter breaks the NSIS installer's extractor.* electron-builder's 7-Zip compresses ARM64 binaries with the `ARM64` filter, which Nsis7z skips silently. ARM64 builds set `ELECTRON_BUILDER_7Z_FILTER=BCJ` until electron-builder or Nsis7z handles it. Revisit on any electron-builder upgrade.
  - *LL-new-c — Repository inference fails in a git worktree.* Tools that read `.git/config` find nothing in a worktree, so release builds pass the repository explicitly and check `app-update.yml`.

## Target: CLAUDE.md

### Fold-in 1 — Release procedure pointer
Section: §Current System State, the CI line (as amended by ELECTRON-42-UPGRADE-1's fold-in 2)
Action: Insert after
Content:
`- Releases: built and uploaded by hand following \`docs/governance/RELEASE_RUNBOOK.md\` (RELEASE-RUNBOOK-1, 2026-10-22): one full NSIS installer per architecture (owner decision B), each after its own \`npm ci\` (\`--os=win32 --cpu=x64\` on an ARM64 host), \`-c.win.target=nsis\` and \`-c.publish.provider/owner/repo\` on the command line, \`ELECTRON_BUILDER_7Z_FILTER=BCJ\` for ARM64, one merged \`latest.yml\`; no version bump (owner, 2026-10-22).`

## Target: docs/governance/LESSONS_LEARNED.md

### Fold-in 1 — LL-new-a, LL-new-b, LL-new-c
Section: end of file
Action: Append row
Content: the three proposed entries under "Lessons", numbered at fold-in.

## Target: docs/governance/TECHNICAL_REFERENCE.md

### Fold-in 1 — Stale packaging lines (review N12, outside Done-when 5)
Section: the packaging or installer lines naming `Blurby-Setup-{version}-{arch}.exe` and "Non-one-click"
Action: Replace
Content: point both at the runbook; the installer is one-click (`nsis.oneClick: true`).

## Open items for the close-out

- File the follow-up Blurby.Brain asked for: move `package.json`'s `build.win.target` to `nsis` and its `artifactName` to `${productName}-Setup-${version}-${arch}.${ext}` (and add `repository`), so config and runbook agree; then drop the runbook's overrides.
- The lockfile has no `@napi-rs/canvas-win32-arm64-msvc`, so ARM64 PDF import runs on polyfills. A dependency item could add it.
- Release gate (12) is met when this merges. The runbook itself runs after gate (2).
