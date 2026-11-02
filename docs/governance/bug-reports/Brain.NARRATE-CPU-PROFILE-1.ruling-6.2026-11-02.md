# CPU A1 test-tool subset ruling

Source: actual final response read from Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19d90-71f8-7f80-a34f-561fc7743e3b`,2026-11-02. Preserved verbatim; parent separately accepted only the two checks within the existing setup clock and tool cap.

**Ruling R-2026-11-02-CPU-6: permit A1-only test-tool preparation. Leave Electron, ONNX, sharp and the remaining application/build dependencies unqualified.**

This explicitly narrows CPU-5: **root postinstall is unnecessary for A1 and must remain unrun.** Do not enable dependency lifecycle hooks, rebuild packages, download fallback binaries or reuse another dependency tree.

After the parent accepts the actual raw receipt, it may admit only these two sequential checks from `C:\Projects\wt-narrate-cpu-profile-1-a1`:

```text
node_modules\@esbuild\win32-x64\esbuild.exe --version
<receipted absolute Node executable> node_modules\vitest\vitest.mjs --version
```

Require exit **0** and versions matching the pinned lockfile: **esbuild 0.25.12**, **Vitest 4.1.11**. Use direct installed paths—no `npx`, installer script or fallback command. A missing binary, mismatch or failure means STOP.

Preserve stdout, stderr and exit codes in fresh files under:

`C:\Projects\Blurby-artifacts\cpu-a1-readiness-20261102\a1-toolchain-subset\`

Record the Node identity, executable/entry-file hashes, unchanged package/lock hashes and clean tracked state in the resulting receipt. Never overwrite existing evidence.

**These checks remain inside the current preparation window:** deadline **19:06:50 UTC**, original **20-tool ceiling**, with only the actually remaining calls available. Batch the two checks and receipt capture if needed; no extension or automatic retry.

Successful results establish **“A1 test tools prepared; targeted test execution pending,”** not a fully qualified dependency installation. A1’s separately admitted red-test run must still collect d1–d4 and fail through their intended assertions—not startup, configuration, transform or dependency errors. I inspected the pinned `vite.config.js` and `tests/setup.js`; they introduce no Electron/model launch requirement.

No test, build, installation or lifecycle script was executed here. All later-wave dependency requirements and Native’s pause remain intact.
