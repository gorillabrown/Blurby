# Stage 8 smoke re-check (gate (2)) — installers for the release-fix sha

**Build sha:** `97527896e7f8466fc0611ada17236d3aba875e98` (`main`, BOOK-TYPE-SCALE-1's merge, the last of the release fix). Version `1.75.1` (no version bump, per the runbook).

**How it was built:**
- Built on 2026-10-23 by blurby-6b on the owner's ARM64 Windows 11 machine, following `docs/governance/RELEASE_RUNBOOK.md` verbatim:
  - Preflight;
  - Build x64 (`npm ci --os=win32 --cpu=x64`);
  - Build ARM64 (`ELECTRON_BUILDER_7Z_FILTER=BCJ` inside the runbook's `try`/`finally`);
  - one `latest.yml`;
  - Checksums.
- **Worktree:** a fresh detached worktree, `C:\Projects\Blurby\.worktrees\rc-97527896`, with `npm ci`. The tree was clean at the build sha before and after.

**What was not done:**
- **Nothing was drafted, uploaded or published.** No tag `build-97527896` exists.
- **Nothing was written to the register** (standing rule 46).

**Runbook checks:** all passed.
- x64 package: `sharp-win32-x64`, `canvas-win32-x64-msvc` and onnxruntime `win32\x64` are present, and there is no ARM64 sharp.
- ARM64 package: `sharp-win32-arm64` and onnxruntime `win32\arm64` are present, and there is no x64 sharp.
- Both `app-update.yml` files name `provider: github`, `owner: gorillabrown` and `repo: Blurby`.
- `latest.yml` lists both installers.

## Installers

Copied to `C:\Projects\Blurby-artifacts\rc-97527896\`. The binaries are not committed.

| File | Full path | Size (bytes) | SHA-256 |
|---|---|---|---|
| `Blurby-Setup-1.75.1-x64.exe` | `C:\Projects\Blurby-artifacts\rc-97527896\Blurby-Setup-1.75.1-x64.exe` | 248,443,319 | `c96d9eb11202bc5876740747455c7bfdef4dbaccab98a4aa3dc672fd7de0ad6b` |
| `Blurby-Setup-1.75.1-arm64.exe` | `C:\Projects\Blurby-artifacts\rc-97527896\Blurby-Setup-1.75.1-arm64.exe` | 247,400,583 | `78da9b994cc1d626dc8cefdc1af6deacb8410ad80bfd0a7017baf55c0977e4ef` |

The same folder holds both `.blockmap` files, `checksums-x64.sha256`, `checksums-arm64.sha256` and `latest.yml`.

### `checksums-x64.sha256`

```
c96d9eb11202bc5876740747455c7bfdef4dbaccab98a4aa3dc672fd7de0ad6b *Blurby-Setup-1.75.1-x64.exe
fbc119f589357f06317b3583199f668370d8ed48f081cec5c4d5f933d683b0b0 *Blurby-Setup-1.75.1-x64.exe.blockmap
```

### `checksums-arm64.sha256`

```
78da9b994cc1d626dc8cefdc1af6deacb8410ad80bfd0a7017baf55c0977e4ef *Blurby-Setup-1.75.1-arm64.exe
92d3fb391cb596668f7d41e00b0036fce9205aed907aba05f84b36e9f201f41c *Blurby-Setup-1.75.1-arm64.exe.blockmap
```

## Install test (Verify, step 2): what it proves and what it does not

The real installers carry the app's own identity. They install per-user into `%LOCALAPPDATA%\Programs\blurby`, which holds the owner's installed Blurby 1.1.2. So the build machine's install test used **option (B)** (Blurby.Roadmap, tier 1): the same sha, rebuilt for ARM64 with the RRTest identity (`appId com.blurby.rrtest`, `productName BlurbyRRTest`, `extraMetadata.name blurby-rrtest`), with the same overrides and the BCJ filter.

- **Install:** `BlurbyRRTest-Setup-1.75.1-arm64.exe /S /D=C:\Projects\Blurby-artifacts\rc-97527896\rrtest-install` exited 0.
- **File check:** the reference package has 681 files, and **0 are missing** from the install (683 installed, including the uninstaller).
- **Key files present:**
  - `BlurbyRRTest.exe`;
  - `ffmpeg.dll`;
  - onnxruntime `win32\arm64` DLL (1);
  - sharp/libvips ARM64 files (6).
- **Native ARM64:** the installed exe's PE machine type is `0xAA64`.
- **Launch:** on a scratch profile (`BLURBY_USER_DATA_DIR`), the app was alive after 10 s with a window titled "Blurby", and it wrote its profile. It was then closed.
- **Uninstall:** silent, exit 0; the install folder is gone.
- **The owner's install is untouched:**
  - its uninstall entry (`3d1a7f75-…`, Blurby 1.1.2) is the same before and after;
  - its `Blurby.exe` SHA-256 is unchanged (`bdb31690…c684e`);
  - its running instance was never closed.

**This proves the BCJ packaging at this sha, not these exact installer bytes.** The RRTest installer differs in identity and so in bytes. The exact real installer bytes are tested by check #1 below.

## The owner's re-check list

**#1 (do this first). Install the exact ARM64 installer.**
- Before running it, check its SHA-256: `(Get-FileHash 'C:\Projects\Blurby-artifacts\rc-97527896\Blurby-Setup-1.75.1-arm64.exe' -Algorithm SHA256).Hash` must equal `78DA9B994CC1D626DC8CEFDC1AF6DEACB8410AD80BFD0A7017BAF55C0977E4EF`.
- Then run it. It replaces Blurby 1.1.2 in place by design; the profile is kept.
- `Blurby.exe` must launch. Task Manager's Details tab should show it as ARM64.

Then the re-checks from ROADMAP Stage 8, "Freeze moved, 2026-10-23" (on `main` @ `62c0c903`), copied verbatim:

- #8, #9 (reopen position, across a relaunch);
- #28–#30 (folder header);
- the tray right-click;
- BUG-208: E-ink on, with the dark theme and with the Blurby theme; the reader, library and menu are readable, and the Narrate highlight is visible;
- BOOK-TYPE-SCALE-1: book headings and body text in Page, Focus, Flow and Narrate, and the owner's usual book at the owner's usual text size, with the Narrate highlight on the spoken word.

Gate (1) also re-runs D3 and D5 on this sha (Blurby.Brain).
