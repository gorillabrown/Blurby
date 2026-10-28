# MOSS Runtime Shape Comparison

> Status: runtime-shape evidence recorded through MOSS-HOST-2.
> Current decision: `KEEP_PAUSED_HOST_CONFIRMED`; MOSS-3 remains blocked.

## x64-emulated Windows

The current known-working flagship path is the configured Windows x64 `llama-moss-tts.exe` binary under `.runtime/moss`. The runtime shape probe records this shape as:

- `available` when the configured binary exists and no shape command is configured.
- `passed` when an optional configured shape command exists and exits successfully.
- `blocked` when no configured binary can be found.
- `failed` when the configured shape command runs and exits unsuccessfully.

This shape must remain offline-only: the probe does not download models, fetch source, or install build tools.

## Native ARM64 Clang

The native ARM64 shape checks whether the host is ARM64 and whether `clang --version` reports an ARM64/AArch64 target. Missing clang, a non-ARM64 host, or a non-ARM64 clang target is recorded as `blocked`, not `failed`.

An optional configured shape command may be used later to verify a prebuilt native ARM64 runtime, but only after the toolchain is already present.

## WSL2/Linux

The WSL2 shape checks `wsl.exe --status` only. Missing `wsl.exe`, unavailable WSL, or output that does not confirm WSL2 is recorded as `blocked`, not `failed`. Windows may return NUL-padded status text; the probe normalizes that output before matching.

An optional configured shape command may be used later to verify a local Linux runtime inside an existing WSL2 environment. The probe must not install WSL, distributions, toolchains, or models.

## Observed MOSS-2B Results

Command:

`node scripts/moss_runtime_shape_probe.mjs --run-id moss2b-runtime-shapes --out artifacts/moss/moss2b-runtime-shapes --json`

Artifacts:

- `artifacts/moss/moss2b-runtime-shapes/summary.json`
- `artifacts/moss/moss2b-runtime-shapes/summary.txt`

| Runtime shape | Status | Blocker | Notes |
|---|---|---|---|
| x64-emulated Windows | `available` | none | Configured MOSS binary exists at `.runtime/moss/llama.cpp/build-vs-x64/bin/Release/llama-moss-tts.exe`. |
| native ARM64 clang | `blocked` | `clang-unavailable` | Probe detail: `spawn EPERM` in this execution context. Treat as unavailable, not failed. |
| WSL2/Linux | `blocked` | `wsl2-unavailable` | Probe detail: `spawn EPERM` in this execution context. Treat as unavailable, not failed. |

## Observed MOSS-SPEED-1 Task #8/#10b Supersession

Task #8c and task #10b remain historical evidence, but their segment comparison numbers are superseded by corrected task #10f artifacts because correct end-to-end `passageText` propagation is fixed.

## Observed MOSS-SPEED-1 Task #10g Corrected Results

Artifacts:

- `artifacts/moss/moss-speed-1-task-10f-single-x64/summary.json`
- `artifacts/moss/moss-speed-1-task-10f-single-x64/summary.txt`
- `artifacts/moss/moss-speed-1-task-10f-x64-matrix/summary.json`
- `artifacts/moss/moss-speed-1-task-10f-x64-matrix/summary.txt`
- `artifacts/moss/moss-speed-1-task-10f-rerun-first-sentence/summary.json`
- `artifacts/moss/moss-speed-1-task-10f-rerun-first-sentence/summary.txt`
- `artifacts/moss/moss-speed-1-task-10f-rerun-full-12-thread/summary.json`
- `artifacts/moss/moss-speed-1-task-10f-rerun-full-12-thread/summary.txt`
- `artifacts/moss/moss-speed-1-task-8-runtime-shapes-escalated/summary.json`
- `artifacts/moss/moss-speed-1-task-8-runtime-shapes-escalated/summary.txt`

| Runtime shape | Status | Blocker | Notes |
|---|---|---|---|
| x64-emulated Windows | `available`, non-viable and unstable timing | none | Corrected single proof RTF was `10.8613` with speed gate `KEEP_PAUSED`. Corrected matrix produced `24` cells, `16` timings, and `8` failures. Best observed RTF was `8.5593`; worst observed successful RTF was `11.1208`; successful first audio was `43973` to `56456` ms. First-sentence failed-cell rerun reproduced `rc=3221226356` in `5/6` cells; its lone success was RTF `43.7886`. Full 12-thread rerun passed `2/2` but stayed at RTF `13.7587` to `14.0669`. |
| native ARM64 clang | `blocked` | `clang-unavailable` | Escalated runtime-shape detail: `spawn clang ENOENT`. Missing clang blocks this shape; it is not a failed native ARM64 timing run. |
| WSL2/Linux | `blocked` | `wsl2-unavailable` | `wsl.exe --status` ran, but WSL2 availability was not confirmed. Treat as unconfirmed/blocked, not a failed Linux runtime. |

## Recommendation

Recommendation for MOSS-3 target runtime shape: none.

Do not promote MOSS-3 app-side sidecar work. Corrected task #10g evidence confirms that x64 Windows is available but too slow and unstable for live-book use, native ARM64 clang is blocked by missing clang, and WSL2 remains unconfirmed/blocked. MOSS-RCA-1 further confirms the current configured x64 path is batch-only, non-assertive for prior quant/thread/max-token labels, split between expensive raw-code generation and expensive ONNX decode, and intermittently unstable with at least one `0xC0000374` heap-corruption candidate in the child probe.

## Observed MOSS-RUNTIME-1 Results

Artifacts:

- `artifacts/moss/moss-runtime-1-shapes-attempt-escalated/summary.json`
- `artifacts/moss/moss-runtime-1-truthful-single-q4-tokens128b/summary.json`
- `artifacts/moss/moss-runtime-1-truthful-single-q4-tokens128b/first-audio-architecture.json`
- `artifacts/moss/moss-runtime-1-truthful-punctuation-first-q4-tokens128c/summary.json`

| Runtime shape | Status | Blocker | Notes |
|---|---|---|---|
| x64-emulated Windows | `available`, truthful Q4/max-token path still non-viable and unstable | none | The in-memory rescue overlay makes first-class Q4 model selection and `maxNewTokens` assertive. A short Q4/maxNewTokens=128 run succeeded but recorded firstAudioMs `81438` and RTF `20.125`; first-audio is batch-bound on raw-code generation `53354` ms plus ONNX decode `27291` ms. Punctuation minimized `Wait...` failed with native `0xC0000374` after partial raw-code timing. |
| native ARM64 clang | `blocked` | `clang-unavailable` | Escalated detail: `spawn clang ENOENT`. The guarded configure/build would use CMake preset `arm64-windows-llvm-release`, but clang is missing. |
| WSL2/Linux | `blocked` | `wsl2-unavailable` | `wsl.exe --status` ran, but WSL2 availability was not confirmed. |

Decision: `KEEP_PAUSED_RUNTIME_CONFIRMED`. This is a pause decision, not a Nano demotion; no Nano timing evidence was collected.

## Observed MOSS-HOST-1 Results

Artifacts:

- `artifacts/moss/moss-host-1-shapes-attempt-after-wsl-fix/summary.json`
- `artifacts/moss/moss-host-1-llvm-install-attempt/summary.json`
- `artifacts/moss/moss-host-1-wsl-usability/summary.json`

| Runtime shape | Status | Blocker | Notes |
|---|---|---|---|
| x64-emulated Windows | `available`, previous truthful evidence remains non-viable and unstable | none | No new x64 timing was needed; MOSS-HOST-1 was scoped to escaping the x64 batch shape. MOSS-RUNTIME-1 remains the latest truthful x64 timing evidence. |
| native ARM64 clang | `blocked` | `clang-unavailable` plus `chocolatey-permission-denied` | `clang`, `clang-cl`, and `ninja` were not found. `choco install llvm -y --no-progress` was attempted but could not obtain package-lock access under `C:\ProgramData\chocolatey\lib` or create `C:\ProgramData\chocolatey\lib-bad`. The guarded CMake preset `arm64-windows-llvm-release` therefore remains blocked before configure/build. |
| WSL2/Linux | WSL2 present, MOSS runtime path blocked | `docker-internal-no-repo-or-toolchain` | After NUL-padded `wsl.exe --status` output normalization, WSL2 is detected as present. The only installed distros are Docker Desktop internals: `docker-desktop-data` has no usable `/bin/sh`, while `docker-desktop` can run `uname` but cannot see the Blurby repo/runtime path and lacks `git`, `cmake`, `gcc`, `g++`, `make`, `ninja`, and `python3`. |

Decision: `KEEP_PAUSED_HOST_CONFIRMED`. This is a pause decision, not a Nano demotion; no Nano timing evidence was collected. Native ARM64 and WSL2/Linux are blocked by host/tooling state, not by failed MOSS performance under those shapes.

## Observed MOSS-HOST-2 Results

Artifacts:

- `artifacts/moss/moss-host-2-wsl-ready/summary.json`
- `artifacts/moss/moss-host-2-wsl-short-q4-tokens128/summary.json`
- `artifacts/moss/moss-host-2-wsl-punctuation-q4-tokens128/summary.json`

Fresh WSL ARM64 binary: `/mnt/c/Users/estra/Projects/Blurby/.runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts`.

Build flags: `GGML_NATIVE=OFF`, `GGML_CPU_ARM_ARCH=armv8.6-a+dotprod+i8mm+nosve`, `CMAKE_BUILD_TYPE=Release`.

| Runtime shape | Status | Blocker | Notes |
|---|---|---|---|
| WSL2/Linux ARM64 | `available`, runnable but non-viable | none | Shape gate records `shapes.wsl2Linux.status=available`, `machine=aarch64`, Ubuntu-24.04 shell gate, and the fresh host2 binary path. This is fresh MOSS-HOST-2 evidence, not stale HOST-1/x64 evidence. |
| Short WSL Q4 tokens128 | `available`, non-viable timing | none | Raw `57.84s`, decode `63.38s`, total `121.22s`, RTF `42.0902777777778`, WAV `180524` bytes. |
| Punctuation WSL Q4 tokens128 | `available`, non-viable timing | none | Raw `52.93s`, decode `73.26s`, total `126.19s`, RTF `16.2615979381443`, WAV `372524` bytes. |

Decision: `KEEP_PAUSED_HOST_CONFIRMED`. The WSL ARM64 host2 path is available and runnable, but timing remains too slow for MOSS-3 app integration. This is a pause decision, not a Nano demotion; no Nano timing evidence was collected, and Kokoro remains unchanged.
