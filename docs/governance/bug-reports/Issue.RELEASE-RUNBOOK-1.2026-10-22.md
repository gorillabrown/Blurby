# Issue — RELEASE-RUNBOOK-1 — the ARM64 NSIS installer drops its ARM64 executables on this machine

**1. tl;dr:** On this ARM64 machine, the option (B) ARM64 full installer installs every file except its 15 ARM64 PE files (`BlurbyRRTest.exe`, `ffmpeg.dll`, the other top-level DLLs, `onnxruntime-node/.../win32/arm64/*.dll`). The app cannot start. The x64 installer installs completely.

**2. Executive Summary:** Blurby.Brain asked for the owner-approved option (B) to be validated by installing the ARM64 installer here and confirming a native ARM64 launch. The ARM64 installer (electron-builder 26.15.3, test identity `com.blurby.rrtest`) exits 0 and registers, but leaves no executable. The same build's app archive, extracted with 7-Zip, contains all 681 files. So the loss happens in the installer's extraction step (`Nsis7z::Extract` into `$PLUGINSDIR\7z-out`, then `CopyFiles`), and only for ARM64 PE executables and DLLs. ARM64 `.node` files and x64 DLLs in the same tree arrive. Until the cause is known, (B)'s ARM64 path cannot be called validated, and (B) cannot be shipped for ARM64 on this evidence.

**3. Evidence of issue:**
- Three installs of `BlurbyRRTest-Setup-1.75.1-arm64.exe /S`: over an x64 nsis-web install, re-run over the top, and fresh after a full uninstall. Each exited 0, with one uninstall key at 1.75.1, and 666 files installed. Missing every time: `BlurbyRRTest.exe`, `ffmpeg.dll`, `d3dcompiler_47.dll`, `dxcompiler.dll`, `dxil.dll`, `libEGL.dll`, `libGLESv2.dll`, `resources/.../onnxruntime-node/bin/napi-v6/win32/arm64/{DirectML,dxcompiler,dxil,onnxruntime}.dll`, `@img/sharp-win32-arm64/lib/libvips*.dll`, `vk_swiftshader.dll` and similar. Present: all `.pak` and data files, `sharp-win32-arm64.node`, `onnxruntime-node/.../win32/arm64/onnxruntime_binding.node`, and `win32/x64/*.dll`.
- `$PLUGINSDIR\app-arm64.7z`, taken from the installer and extracted with 7-Zip into the scratchpad: 681 files, including `BlurbyRRTest.exe` (219,367,424 bytes) and every DLL; they were still present 20 s later.
- Control: the x64 full installer from the same identity and run, fresh install: 680 files, exe present (`0x8664`), `ffmpeg.dll` present.
- Earlier the same day: the unpacked ARM64 build (`release/win-arm64-unpacked`, `--dir` output) ran natively. The packaged-quit check committed 6 words with exit 0, both in ELECTRON-42-UPGRADE-1 and here. So the binaries themselves work, and only installation loses them.
- Machine: Windows 11 Home ARM64 (10.0.26300). Defender real-time protection is on and reported no detection in the last hour. Smart App Control is off (`VerifiedAndReputablePolicyState` 0). **Windhawk is running** (processes 5688 and 12004); it injects mod DLLs into processes, and CodeIntegrity logs its `arm64\windhawk.dll` injections into Chrome.
- Clean-up: the test install, its uninstall key and `%APPDATA%\blurby-rrtest` were removed. The owner's Blurby 1.1.2 key and `%APPDATA%\blurby` (last written 2026-10-14) are unchanged.

**4. Possible cause(s), ranked:**
1. **Something on this machine intercepts the x86 NSIS installer's file writes of ARM64 PE files**, most likely Windhawk's injection into the installer process. The selectivity (ARM64 PE images only, not `.node` files, not x64 DLLs) fits a hook on image or section handling better than a generic I/O failure. Machine-specific if so.
2. **An electron-builder / Nsis7z defect on Windows on ARM.** The x86 plugin, running under emulation, fails to write ARM64 PE images, or `CopyFiles` skips them. That would affect every ARM64 user. It would also mean ARM64 has never installed natively from any Blurby installer, which fits v1.1.2's ARM64 users running x64.
3. Defender quarantining or blocking unsigned ARM64 PE files written by an emulated process, without a logged detection. Less likely, since nothing was logged and the x64 files arrived.

**5. Likely solution(s):**
- Discriminate first. Either the owner pauses Windhawk (tray icon > exit, or disable its mods) and the ARM64 install is re-run (about 2 minutes); or the installer runs on another ARM64 Windows device. If it then installs fully, it is cause 1: (B) stands, and the runbook gains a line that the install test runs with injectors paused.
- If cause 2: check electron-builder's issues for ARM64 NSIS on Windows on ARM; try a newer electron-builder 26.x minor (allowed without a ruling); or try `-c.nsis.useZip=true` (`nsisunz` in place of Nsis7z). If nothing works, (B) cannot ship ARM64 yet, and the fallback is (A) with ARM64 running x64 emulated, which needs Brain and the owner again.
- The runbook (B text) is otherwise ready. Nothing is merged or published.

**Update (same evening):**
- **`-c.nsis.useZip=true` (nsisunz) fails on both architectures.** ARM64 over the top: the old version was uninstalled, then the installer exited 2 having installed 1 of 681 files. x64 fresh: it hung after writing 1 file (an invisible `decompressionFailed` box, process killed). Not usable.
- **Windhawk ruled out.** The owner exited Windhawk (`Get-Process *windhawk*` returned 0), and the fresh default ARM64 install still lost the same files. The path-by-path compare showed 681 expected, 666 installed, 17 missing. The missing files are every ARM64 binary in any format: the exe; the top-level DLLs; sharp-win32-arm64's libvips DLLs; onnxruntime's win32/arm64 DLLs; and onnxruntime's darwin/arm64 `.dylib` and linux/arm64 `.so`. ARM64 `.node` files and all x64 binaries arrived.
- **Remaining causes:** a filter that silently drops ARM64 machine code written by the emulated x86 installer, most likely Defender content inspection (nothing logged); or an electron-builder 26.15.3 / Nsis7z defect on Windows on ARM.
- **Next checks:** electron-builder 26.18.0 in a scratch build; the extraction folder inspected mid-install; or Defender real-time scanning paused, which is the owner's action.

**Resolved (same evening):**
- **Where the files are lost.** The installer's `$PLUGINSDIR\7z-out`, polled during an install, peaked at 664 files and never contained the 17, so the loss is at Nsis7z extraction.
- **Not an OS filter.** An x86 (SysWOW64) PowerShell copied an ARM64 DLL without trouble.
- **Root cause.** `7z l -slt` on `$PLUGINSDIR\app-arm64.7z` shows exactly the 17 missing entries as `Method = ARM64 LZMA2:20`, 7-Zip's newer ARM64 branch filter, which the installer's Nsis7z plugin cannot decode. x64 binaries are `BCJ2`.
- **Fix.** `ELECTRON_BUILDER_7Z_FILTER=BCJ` for the ARM64 build (`app-builder-lib/out/targets/archive.js`). All 681 entries become `BCJ LZMA2:20`.
- **Fresh install:** 681 of 681 files, byte-identical; exe `0xAA64`; `arm64 42.11.18` as Node; native launch voiced 6 words and quit 0; clean uninstall.
- **Over the top** from the x64 nsis-web 1.1.2 stand-in: 0 missing, exe `0xAA64`, one uninstall entry at 1.75.1, profile JSON byte-identical, native run on the kept profile voiced.
- The runbook's Build ARM64 section sets the variable (try/finally), and its Verify install test compares the installed tree against `release/win-arm64-unpacked`.

**Acceptance:**
- Blurby.Brain set the pass bar (681 files by path, `0xAA64`, a native launch with Narrate voicing, a clean uninstall, and the over-the-top migration with the profile kept) and ruled each diagnostic step (tier 1).
- The fix and its results, which meet every point of that bar, were reported to Blurby.Brain on 2026-10-22. Brain's reply had not arrived when this record was committed.
- Blurby.Roadmap gave the merge go on 2026-10-22, having checked `5a279805` (fence, 11 sections, the BCJ step in Build ARM64), and admitted this record to the fence.

**6. Confidence in cause and solution identification (1–10):** 9 (after resolution; 5 at filing). The loss is located precisely (installer extraction, ARM64 PE only, reproduced three times, with a clean x64 control and a clean 7-Zip control), but whether it is this machine (Windhawk) or the toolchain is untested, and that decides the remedy.
