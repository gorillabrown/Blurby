# Stage 8 smoke re-check (gate (2)) — installers for the release-fix sha

**Build sha:** `36ac7466749688c9ba5e17de841224fab08d7bae` (`main`, KEEP-FURTHEST-FIX-1's merge, the final release-fix sha). Version `1.75.1` (no version bump, per the runbook).

**Superseded:** the installers built from `97527896` (BOOK-TYPE-SCALE-1's merge) are **SUPERSEDED**. KEEP-FURTHEST-FIX-1 (BUG-209, release gate) moved the release-fix sha to `36ac7466`. Do not install them for the smoke. Their record is kept below for reference.

**How it was built:**
- Built on 2026-10-23 by blurby-f0 on the owner's ARM64 Windows 11 machine (PowerShell 7.6, node arm64), following `docs/governance/RELEASE_RUNBOOK.md` verbatim:
  - Preflight;
  - Build x64 (`npm ci --os=win32 --cpu=x64`);
  - Build ARM64 (`ELECTRON_BUILDER_7Z_FILTER=BCJ` inside the runbook's `try`/`finally`);
  - one `latest.yml`;
  - Checksums.
- **Worktree:** a fresh detached worktree, `C:\Projects\Blurby\.worktrees\rc-36ac7466`, with `npm ci`. The tree was clean at the build sha before and after.
- **Script and log:** `C:\Projects\Blurby-artifacts\rc-36ac7466\build.ps1` (the runbook's commands, in order) and `build.log`. Preflight's `$Notes` points at a placeholder file, because no draft is made.

**What was not done:**
- **Nothing was drafted, uploaded or published.** No tag `build-36ac7466` exists (checked after the build).
- **Nothing was written to the register** (standing rule 46).

**Runbook checks:** all passed.
- x64 package: `sharp-win32-x64`, `canvas-win32-x64-msvc` and onnxruntime `win32\x64` are present, and there is no ARM64 sharp.
- ARM64 package: `sharp-win32-arm64` and onnxruntime `win32\arm64` are present, and there is no x64 sharp.
- Both `app-update.yml` files name `provider: github`, `owner: gorillabrown` and `repo: Blurby`.
- `latest.yml` lists both installers.
- After copying, each file in the artifacts folder matches its line in the checksum files.

## Installers

Copied to `C:\Projects\Blurby-artifacts\rc-36ac7466\`. The binaries are not committed.

| File | Full path | Size (bytes) | SHA-256 |
|---|---|---|---|
| `Blurby-Setup-1.75.1-x64.exe` | `C:\Projects\Blurby-artifacts\rc-36ac7466\Blurby-Setup-1.75.1-x64.exe` | 248,443,386 | `2e6b0d499f1d1ea5ec4d642e3e1b28985cdcd0ea10255d39d9092674980c77b4` |
| `Blurby-Setup-1.75.1-arm64.exe` | `C:\Projects\Blurby-artifacts\rc-36ac7466\Blurby-Setup-1.75.1-arm64.exe` | 247,400,710 | `216219a1a73f32ed094aa51ae9ced9586e5b1d9116a180c14ba1ec614f12bd7c` |

The same folder holds both `.blockmap` files (x64 259,566 bytes; arm64 259,747 bytes), `checksums-x64.sha256`, `checksums-arm64.sha256` and `latest.yml`.

### `checksums-x64.sha256`

```
2e6b0d499f1d1ea5ec4d642e3e1b28985cdcd0ea10255d39d9092674980c77b4 *Blurby-Setup-1.75.1-x64.exe
bac0a91cdcbddb6481b5476117645538cefc260ddbc4321b68d60c5a53b01a72 *Blurby-Setup-1.75.1-x64.exe.blockmap
```

### `checksums-arm64.sha256`

```
216219a1a73f32ed094aa51ae9ced9586e5b1d9116a180c14ba1ec614f12bd7c *Blurby-Setup-1.75.1-arm64.exe
83e63992273976062d01f0c5271d7907a25b25d5766d89a24721c5acbd867377 *Blurby-Setup-1.75.1-arm64.exe.blockmap
```

## Install test (Verify, step 2): what it proves and what it does not

The real installers carry the app's own identity. They install per-user into `%LOCALAPPDATA%\Programs\blurby`, which holds the owner's installed Blurby 1.1.2. So the build machine's install test used **option (B)** (Blurby.Roadmap, tier 1): the same sha, rebuilt for ARM64 with the RRTest identity (`appId com.blurby.rrtest`, `productName BlurbyRRTest`, `extraMetadata.name blurby-rrtest`), with the same overrides and the BCJ filter. Script and log: `C:\Projects\Blurby-artifacts\rc-36ac7466\rrtest.ps1` and `rrtest.log`.

- **Install:** `BlurbyRRTest-Setup-1.75.1-arm64.exe /S /D=C:\Projects\Blurby-artifacts\rc-36ac7466\rrtest-install` exited 0.
- **File check:** the reference package (`rrtest-build\win-arm64-unpacked`) has 681 files, and **0 are missing** from the install (683 installed, including the uninstaller).
- **Key files present:**
  - `BlurbyRRTest.exe`;
  - `ffmpeg.dll`;
  - onnxruntime `napi-v6\win32\arm64`: 4 DLLs;
  - sharp/libvips `win32-arm64`: 3 `.dll`/`.node` files.
- **Native ARM64:** the installed exe's PE machine type is `0xAA64`.
- **Launch, on a proven scratch profile:**
  - The app was started with `BLURBY_USER_DATA_DIR` and `--user-data-dir` both set to `rrtest-profile`, plus `--inspect`.
  - Before anything else, the main process's `app.getPath('userData')` read `C:\Projects\Blurby-artifacts\rc-36ac7466\rrtest-profile`, not `%APPDATA%\blurby`.
  - It was alive after 10 s, with a window titled "Blurby", and it wrote its profile. It was then closed.
- **Uninstall:** silent, exit 0. The install folder is gone, and no RRTest uninstall entry is left.
- **The owner's install and profile are untouched:**
  - its uninstall entry (`3d1a7f75-29ad-505c-9015-d9a83f11b281`, Blurby 1.1.2) is the same before and after;
  - its `Blurby.exe` SHA-256 is unchanged (`bdb31690…c684e`);
  - the live profile's library.json and settings.json hashes are unchanged before and after;
  - its running instance was never closed.

**This proves the BCJ packaging at this sha, not these exact installer bytes.** The RRTest installer differs in identity and so in bytes. The exact real installer bytes are tested by check #1 below.

## The owner's re-check list

**#1 (do this first). Install the exact ARM64 installer.**
- Before running it, check its SHA-256: `(Get-FileHash 'C:\Projects\Blurby-artifacts\rc-36ac7466\Blurby-Setup-1.75.1-arm64.exe' -Algorithm SHA256).Hash` must equal `216219A1A73F32ED094AA51AE9CED9586E5B1D9116A180C14BA1EC614F12BD7C`.
- Then run it. It replaces Blurby 1.1.2 in place by design; the profile is kept.
- `Blurby.exe` must launch. Task Manager's Details tab should show it as ARM64.

Then the re-checks from ROADMAP Stage 8, "Freeze moved, 2026-10-23" (on `main` @ `62c0c903`), copied verbatim:

- #8, #9 (reopen position, across a relaunch);
- #28–#30 (folder header);
- the tray right-click;
- BUG-208: E-ink on, with the dark theme and with the Blurby theme; the reader, library and menu are readable, and the Narrate highlight is visible;
- BOOK-TYPE-SCALE-1: book headings and body text in Page, Focus, Flow and Narrate, and the owner's usual book at the owner's usual text size, with the Narrate highlight on the spoken word.

Added for KEEP-FURTHEST-FIX-1 (BUG-209; ROADMAP Stage 8, the item's release effect):

- **Backtrack, Keep at furthest:** in Page, open a book, turn ahead several pages, then go back. When the prompt asks, choose **Keep at page N** (the furthest page). Close the book and reopen it: it opens on the furthest page.

Gate (1) also re-runs D3 and D5 on this sha (Blurby.Brain).

## SUPERSEDED: installers for `97527896` (built 2026-10-23 by blurby-6b)

Do not use these for the smoke. Kept for the record.

- **Build sha:** `97527896e7f8466fc0611ada17236d3aba875e98` (BOOK-TYPE-SCALE-1's merge). Same runbook steps; worktree `C:\Projects\Blurby\.worktrees\rc-97527896`. Nothing drafted, uploaded or published; no tag `build-97527896`.
- **Install test (option B)** at that sha: 681 reference files, 0 missing; native `0xAA64`; launched on a scratch profile; uninstalled; the owner's install untouched.

| File | Full path | Size (bytes) | SHA-256 |
|---|---|---|---|
| `Blurby-Setup-1.75.1-x64.exe` | `C:\Projects\Blurby-artifacts\rc-97527896\Blurby-Setup-1.75.1-x64.exe` | 248,443,319 | `c96d9eb11202bc5876740747455c7bfdef4dbaccab98a4aa3dc672fd7de0ad6b` |
| `Blurby-Setup-1.75.1-arm64.exe` | `C:\Projects\Blurby-artifacts\rc-97527896\Blurby-Setup-1.75.1-arm64.exe` | 247,400,583 | `78da9b994cc1d626dc8cefdc1af6deacb8410ad80bfd0a7017baf55c0977e4ef` |

```
c96d9eb11202bc5876740747455c7bfdef4dbaccab98a4aa3dc672fd7de0ad6b *Blurby-Setup-1.75.1-x64.exe
fbc119f589357f06317b3583199f668370d8ed48f081cec5c4d5f933d683b0b0 *Blurby-Setup-1.75.1-x64.exe.blockmap
78da9b994cc1d626dc8cefdc1af6deacb8410ad80bfd0a7017baf55c0977e4ef *Blurby-Setup-1.75.1-arm64.exe
92d3fb391cb596668f7d41e00b0036fce9205aed907aba05f84b36e9f201f41c *Blurby-Setup-1.75.1-arm64.exe.blockmap
```
