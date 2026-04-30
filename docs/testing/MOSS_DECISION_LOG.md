# MOSS Decision Log

**Sprint:** MOSS-1 through MOSS-NANO-5C
**Initial status:** `INVESTIGATE`
**Current status:** `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`
**Last updated:** 2026-04-30

## Status Values

| Status | Meaning |
|---|---|
| `INVESTIGATE` | Gather setup, runtime, and feasibility evidence. No product claim yet. |
| `ITERATE` | Continue the flagship lane after a classified failure or incomplete gate. |
| `ITERATE_RUNTIME_SHAPE` | Continue flagship only by resolving runtime-shape uncertainty and missing baseline evidence; app-side MOSS-3 work remains blocked. |
| `PROMOTE_TO_APP_PROTOTYPE` | Flagship MOSS has enough evidence to enter app integration/prototype work. |
| `DEMOTE_TO_NANO` | Flagship MOSS failed after the documented demotion criteria were satisfied; Nano may enter as fallback runtime. |
| `PAUSE_FLAGSHIP_MOSS` | Stop flagship MOSS product-path work because paired baseline evidence does not justify more runtime effort. |
| `PAUSE_FLAGSHIP_MOSS_RUNTIME_UNSTABLE` | Stop flagship MOSS product-path work because corrected speed rescue evidence remains too slow and repeats failed-cell instability. |
| `KEEP_PAUSED_ROOT_CAUSE_CONFIRMED` | Keep flagship MOSS product-path work paused because root-cause evidence explains the current configured runtime as batch-only, non-assertive for prior quant/thread labels, too slow in raw generation plus ONNX decode, and intermittently unstable in `llama.cpp`. |
| `CONTINUE_RUNTIME_RESCUE` | Continue bounded flagship runtime rescue because truthful evidence shows a plausible viable path still exists. |
| `CONTINUE_FLAGSHIP_HOST_RESCUE` | Continue flagship host/runtime rescue because native ARM64 or WSL2/Linux bring-up produced a plausible non-x64 path that needs more timing evidence. |
| `PROMOTE_TO_MOSS_3_CANDIDATE` | Reopen MOSS-3 sidecar/app-integration only after truthful runtime evidence shows a plausible live or precache candidate. |
| `KEEP_PAUSED_RUNTIME_CONFIRMED` | Keep flagship MOSS product-path work paused after truthful runtime rescue confirms the best available local path remains too slow or unstable, with exact runtime-shape blockers recorded. |
| `KEEP_PAUSED_HOST_CONFIRMED` | Keep flagship MOSS product-path work paused after host/runtime evidence confirms that the best available native ARM64 or WSL2/Linux MOSS shape is either unavailable or still non-viable. |
| `ITERATE_NANO_RUNTIME` | Continue bounded Nano runtime iteration because Nano ONNX CPU can generate local audio, but timing evidence is not yet good enough for app prototype or promotion. |
| `ITERATE_NANO_RESIDENT_RUNTIME` | Continue resident Nano runtime tuning/soak/perf only because true reuse and internal first-decoded timing are proven, but promotion thresholds and memory-soak confidence are not met. |
| `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE` | Promote Nano only to the next runtime soak/package gate because segment-first product-path evidence passed; this is not app prototype promotion and does not unlock app integration. |
| `KEEP_KOKORO_ONLY` | Keep Kokoro as the only integrated engine after bounded Nano runtime rescue fails to produce viable live-app timing; Nano is not rejected permanently, but app prototype work stays closed until new runtime evidence changes the decision. |
| `REJECT` | MOSS is unsuitable for this lane because of quality, licensing, runtime, or maintainability blockers. |

## Current MOSS-1 Evidence

| Evidence item | Status | Notes |
|---|---|---|
| Upstream source facts | Verified 2026-04-26 | MOSS flagship, GGUF, ONNX tokenizer, CPU-only config, first-class `llama.cpp` branch, and Nano fallback facts recorded in `MOSS_FLAGSHIP_FEASIBILITY.md`. |
| Runtime setup contract | Drafted | Config paths, config shape, required assets, Windows ARM64 notes, and no-silent-fallback rule recorded in `MOSS_RUNTIME_SETUP.md`. |
| Preflight command | Present | `npm run moss:preflight` is the documented validation command. |
| Probe command | Present | `npm run moss:probe` is documented in `MOSS_RUNTIME_SETUP.md` and writes classified probe artifacts. |
| Native Windows Node probe: short smoke | Blocked | `npm run moss:probe -- --run-id moss1-native-short --passage short-smoke --out artifacts/moss/probe --json` exited `1` with `ok: false`, status `blocked`, and failure class `config-missing`. Evidence: `artifacts/moss/probe/moss1-native-short/summary.json`, `artifacts/moss/probe/moss1-native-short/summary.txt`. |
| Native Windows Node probe: punctuation-heavy | Blocked | `npm run moss:probe -- --run-id moss1-native-punctuation --passage punctuation-heavy-mid --out artifacts/moss/probe --json` exited `1` with `ok: false`, status `blocked`, and failure class `config-missing`. Evidence: `artifacts/moss/probe/moss1-native-punctuation/summary.json`, `artifacts/moss/probe/moss1-native-punctuation/summary.txt`. |
| Config-missing behavior | Verified classified blocker | Probe ran on native Windows Node host (`win32 arm64`) and produced classified failure artifacts under `<out>/<run-id>/summary.*` when `.runtime/moss/config.json` was missing. |
| Windows x64-emulated flagship smoke | Passed | `npm run moss:probe -- --run-id moss1-smoke-win-direct-decode --passage short-smoke --json` exited `0` with `ok: true`, firstAudioMs `70202`, generationMs `70989`, audioDurationMs `4080`, and RTF `17.3993`. Evidence: `artifacts/moss/moss1-smoke-win-direct-decode/summary.json`, `artifacts/moss/moss1-smoke-win-direct-decode/summary.txt`, `artifacts/moss/moss1-smoke-win-direct-decode/short-smoke.wav`. |
| Flagship runtime evidence | First audio reached | MOSS flagship Q4 first-class GGUF produced a WAV through `llama.cpp` raw-code generation plus direct Python ONNX decode. This proves local synthesis can run; it does not prove live-book viability. |
| Native ARM64 vs WSL2 vs x64-emulation comparison | Partial | x64-emulated Windows binary works. Native ARM64 MSVC/Ninja build hit upstream ggml's MSVC ARM unsupported path and still needs a clang-based attempt before classification. WSL2/Linux x64 is not yet attempted. |
| Quant/thread tuning evidence | Pending | Required before demotion if backend runs. |
| Real book passage evidence | Pending | Required before promotion or demotion. |

## MOSS-1 Decision

Decision: `ITERATE`.

Reason: MOSS-1 now has first-audio evidence from a runnable flagship path, but the first run is far too limited to promote into app integration. Continue the flagship-first lane with warm-run measurements, quant/thread tuning, punctuation-heavy and real-book passages, and a native ARM64/WSL2 shape check before judging live-book viability.

Non-decisions:

- Do not `PROMOTE_TO_APP_PROTOTYPE`: one slow smoke WAV is not enough app-integration evidence.
- Do not `DEMOTE_TO_NANO`: the program-level demotion gate is not satisfied. A valid flagship runtime shape has now run, and no quant/thread profile, warm-run profile, or real book passage evidence exists.
- Do not treat native ARM64 or WSL2/Linux x64 as failed. Native ARM64 still needs a clang-based attempt; WSL2/Linux x64 is not yet attempted.

## Initial MOSS-2 Evidence

Run id: `moss2-initial-escalated`.

Artifact paths:

- Run summary: `artifacts/moss/moss2-initial-escalated/summary.json`.
- Case artifacts: `artifacts/moss/moss2-initial-escalated/cases/*/summary.json`, `artifacts/moss/moss2-initial-escalated/cases/*/summary.txt`, and successful `*.wav` outputs.
- Runtime crash evidence: `artifacts/moss/moss2-initial-escalated/cases/moss2-initial-escalated-warm-Q4_K_M-t12-punctuation-heavy-mid-r1/summary.json`.

| Evidence item | Status | Notes |
|---|---|---|
| Generated audio | Partial | `7/8` cases generated audio; the warm `Q4_K_M`, 12-thread, `punctuation-heavy-mid` case failed before audio output. |
| Runtime stability | Crashed once | One runtime crash recorded: `llama-moss-tts raw-code generation failed with rc=3221225477`. |
| Real-time factor | Too slow for live-book proof | Successful cases ranged from RTF `14.721` to `21.8858`. |
| First-audio latency | Too slow for live-book proof | Successful cases ranged from about `62.5s` to `93.8s` first audio. |
| Kokoro/listening comparison | Missing live data | Harness recorded Kokoro status `missing-live-data`; listening comparison is placeholder-only. |

## MOSS-2 Decision

Decision: `ITERATE`.

Harness category: `needs-more-evidence`.

Reason: MOSS-2 adds useful initial quant/thread and warm/cold evidence, including longer punctuation-heavy coverage, but it does not yet prove live-book viability. The successful cases are far slower than live playback needs, one runtime shape crashed, and there is no paired live Kokoro or listening-quality comparison.

Non-decisions:

- Do not `PROMOTE_TO_APP_PROTOTYPE`: MOSS-2 has no paired Kokoro/listening evidence and no viable first-audio or RTF profile yet.
- Do not `DEMOTE_TO_NANO`: the documented demotion gate is not satisfied because paired Kokoro/listening and runtime-shape follow-up evidence is still missing.
- Do not start MOSS-3 until paired Kokoro/listening evidence and the runtime-shape follow-up are complete.

## MOSS-2B Evidence

Run ids:

- Paired required gate: `moss2b-paired-comparison`.
- Optional missing-Kokoro artifact: `moss2b-paired-missing-kokoro`.
- Runtime shape probe: `moss2b-runtime-shapes`.

Artifact paths:

- Required paired summary: `artifacts/moss/moss2b-paired-comparison/summary.json`.
- Optional paired summary: `artifacts/moss/moss2b-paired-missing-kokoro/summary.json`.
- Failed-case repeat summary: `artifacts/moss/moss2b-failed-repeat/summary.json`.
- Listening review scaffold: `artifacts/moss/moss2b-paired-missing-kokoro/listening-review.md`.
- Runtime shape summary: `artifacts/moss/moss2b-runtime-shapes/summary.json`.
- Runtime shape comparison doc: `docs/testing/MOSS_RUNTIME_SHAPE_COMPARISON.md`.

| Evidence item | Status | Notes |
|---|---|---|
| Paired Kokoro gate | Blocked | `--require-kokoro` exits nonzero with `failureClass: kokoro-comparison-missing`, `comparisonStatus: missing-live-data`, and promotion blockers `kokoro-live-data-missing` plus `listening-review-missing`. |
| Optional paired artifact | Recorded, still non-promoting | Optional paired mode writes comparison/listening artifacts with `comparisonStatus: missing-live-data`; the imported MOSS summary still has `status: failed` because the known punctuation case failed. |
| Failed-case classification | More precise | The warm `Q4_K_M`, 12-thread, `punctuation-heavy-mid` crash is now classified as `windows-process-crash-access-violation-candidate` from `rc=3221225477`. |
| Failed-case repeat | Failed 3/3 with a different precise blocker | Re-running the warm `Q4_K_M`, 12-thread, `punctuation-heavy-mid` case three times produced no WAV artifacts. Each repeat is classified as `runtime-contract`, with generation times `71553`, `73578`, and `92768` ms. |
| Runtime shape: x64 Windows | Available | Configured binary exists at `.runtime/moss/llama.cpp/build-vs-x64/bin/Release/llama-moss-tts.exe`. This is the only proven runnable shape so far. |
| Runtime shape: native ARM64 clang | Blocked | Probe recorded `blocked`, blocker `clang-unavailable`, detail `spawn EPERM` in this execution context. This is not a native ARM64 failure. |
| Runtime shape: WSL2/Linux | Blocked | Probe recorded `blocked`, blocker `wsl2-unavailable`, detail `spawn EPERM` in this execution context. This is not a WSL2 runtime failure. |
| MOSS-3 readiness | Blocked | No paired Kokoro baseline, no completed human listening review, one classified Windows process crash candidate, and successful MOSS cases remain far too slow for live playback. |

## MOSS-2B Decision

Decision: `ITERATE_RUNTIME_SHAPE`.

Reason: MOSS-2B tightened the harness and classification, but it did not produce the evidence needed to promote sidecar/IPC work. The only available runtime shape remains x64 Windows, the paired Kokoro/listening gate is still missing live data, the original warm punctuation failure is a Windows process crash/access-violation candidate, and three repeat attempts failed as `runtime-contract` because no WAV artifact was produced. Continue the flagship lane only by testing runtime shape alternatives and obtaining a real Kokoro/listening baseline. Do not start MOSS-3.

Non-decisions:

- Do not `PROMOTE_TO_APP_PROTOTYPE`: paired Kokoro evidence and listening review are still missing, and MOSS-3 is explicitly blocked.
- Do not `DEMOTE_TO_NANO`: the evidence still does not distinguish x64-emulated runtime shape from flagship model viability.
- Do not `PAUSE_FLAGSHIP`: the quality comparison has not happened yet; pausing before listening evidence would be premature.
- Do not treat native ARM64 clang or WSL2/Linux as failed: both are blocked/unavailable in the current execution context, not proven bad runtime shapes.

## MOSS-2C Evidence

Run ids:

- Kokoro live baseline: `moss2c-kokoro-baseline`.
- Paired listening artifact: `moss2c-paired-listening`.

Artifact paths:

- Kokoro summary: `artifacts/moss/moss2c-kokoro-baseline/summary.json`.
- Kokoro audio: `artifacts/moss/moss2c-kokoro-baseline/short-smoke.wav`, `artifacts/moss/moss2c-kokoro-baseline/punctuation-heavy-mid.wav`.
- Paired summary: `artifacts/moss/moss2c-paired-listening/summary.json`.
- Paired listening worksheet: `artifacts/moss/moss2c-paired-listening/listening-review.md`.

| Evidence item | Status | Notes |
|---|---|---|
| Real Kokoro baseline | Generated | Kokoro produced audio for the same `short-smoke` and `punctuation-heavy-mid` passages used by the available MOSS evidence. |
| Kokoro timing | Viable baseline | Kokoro recorded first-audio/generation `1385` ms with RTF `0.3337` for `short-smoke`, and `5616` ms with RTF `0.7414` for `punctuation-heavy-mid`. |
| Paired MOSS/Kokoro artifact | Generated | Pairing succeeded with `comparisonStatus: paired`; the harness still blocks promotion with `listening-review-missing`. |
| MOSS timing and stability | Still non-viable | Imported MOSS evidence remains `7/8` audio generated, one failed warm punctuation case, first-audio about `62.5s` to `93.8s`, and RTF `14.721` to `21.8858`. |
| Human listening review | Not completed | No subjective listener notes were fabricated. The quality-first gate has no evidence that MOSS clearly beats Kokoro. |

## MOSS-2C Decision

Decision: `PAUSE_FLAGSHIP_MOSS`.

Reason: MOSS-2C generated the missing real Kokoro baseline and paired it against the available MOSS artifacts. The objective evidence strongly favors Kokoro for live-book feasibility, while MOSS remains slow, fragile, and unproven on subjective quality. Because the human listening review has not shown that MOSS clearly beats Kokoro, further runtime-shape work is not justified now.

Non-decisions:

- Do not start MOSS-3: sidecar, IPC, and app integration work remain blocked.
- Do not continue native ARM64, WSL2, or other runtime-shape work unless a later human listening review shows MOSS clearly beats Kokoro.
- Do not record `DEMOTE_TO_NANO`: this decision pauses flagship MOSS; it does not promote Nano as the next runtime.
- Keep Kokoro as the operational floor.

## MOSS-SPEED-1 Task #8/#10b Supersession

Task #8c and task #10b remain historical runtime rescue evidence, but their segment comparison numbers are superseded by corrected MOSS-SPEED-1 task #10f artifacts because correct end-to-end `passageText` propagation is fixed. Do not use task #8 or task #10b artifacts for current full-vs-first-sentence conclusions.

## MOSS-SPEED-1 Task #10g Failed-Cell Confirmation Evidence

Run ids:

- Corrected single x64 timing check: `moss-speed-1-task-10f-single-x64`.
- Corrected x64 timing matrix: `moss-speed-1-task-10f-x64-matrix`.
- Failed-cell first-sentence rerun: `moss-speed-1-task-10f-rerun-first-sentence`.
- Full 12-thread rerun: `moss-speed-1-task-10f-rerun-full-12-thread`.
- Runtime-shape escalated artifacts from task #8: `moss-speed-1-task-8-runtime-shapes-escalated`, `moss-speed-1-task-8-escalated`.

Artifact paths:

- Corrected single x64 summary: `artifacts/moss/moss-speed-1-task-10f-single-x64/summary.json`, `artifacts/moss/moss-speed-1-task-10f-single-x64/summary.txt`.
- Corrected x64 matrix summary: `artifacts/moss/moss-speed-1-task-10f-x64-matrix/summary.json`, `artifacts/moss/moss-speed-1-task-10f-x64-matrix/summary.txt`.
- Failed-cell first-sentence rerun summary: `artifacts/moss/moss-speed-1-task-10f-rerun-first-sentence/summary.json`, `artifacts/moss/moss-speed-1-task-10f-rerun-first-sentence/summary.txt`.
- Full 12-thread rerun summary: `artifacts/moss/moss-speed-1-task-10f-rerun-full-12-thread/summary.json`, `artifacts/moss/moss-speed-1-task-10f-rerun-full-12-thread/summary.txt`.
- Escalated runtime shape summary: `artifacts/moss/moss-speed-1-task-8-runtime-shapes-escalated/summary.json`, `artifacts/moss/moss-speed-1-task-8-runtime-shapes-escalated/summary.txt`.

| Evidence item | Status | Notes |
|---|---|---|
| Corrected propagation | Fixed | Correct end-to-end `passageText` propagation is fixed. Earlier task #8 and task #10b segment comparisons are superseded by task #10f. |
| Corrected x64 single proof | Non-viable | `Q4_K_M`, 8-thread, `short-smoke/first-sentence` recorded firstAudioMs `43857` and RTF `10.8613`; speed gate stayed `KEEP_PAUSED`. |
| Corrected x64 matrix timing | Non-viable | Matrix produced `24` cells, `16` timings, and `8` failures. Best observed RTF was `8.5593`; worst observed successful RTF was `11.1208`. Successful cells still took first audio from `43973` to `56456` ms. |
| Corrected x64 matrix stability | Unstable | Eight cells failed: two with `rc=3221225477` and six with `rc=3221226356`. |
| Failed-cell first-sentence rerun | Runtime instability reproduced | Punctuation-heavy first-sentence rerun covered `6` cells with `1` timing and `5` failures. `rc=3221226356` reproduced across the failed cells; the lone success was RTF `43.7886`. |
| Full 12-thread rerun | Too slow despite passing | Full punctuation-heavy 12-thread rerun passed `2/2`, but successful RTF remained `13.7587` to `14.0669`. |
| Native ARM64 clang | Blocked | Escalated task #8 runtime-shape evidence records `blocked`, blocker `clang-unavailable`, detail `spawn clang ENOENT`. This is not a failed native ARM64 timing run. |
| WSL2/Linux | Blocked/unconfirmed | Escalated task #8 runtime-shape evidence records `blocked`, blocker `wsl2-unavailable`; `wsl.exe --status` ran, but WSL2 availability was not confirmed. |
| MOSS-3 readiness | Blocked | Failed-cell confirmation plus non-viable timing produced no reason to reopen sidecar, IPC, or app integration work. |
| Nano demotion | Not recorded | There is still no Nano timing evidence, so `DEMOTE_TO_NANO` remains unsupported. |

## MOSS-SPEED-1 Task #10g Decision

Decision among `CONTINUE` / `PAUSE` / `NANO`: `PAUSE`.

Decision status: `PAUSE_FLAGSHIP_MOSS_RUNTIME_UNSTABLE`.

Reason: The corrected task #10f artifacts preserve the pause conclusion after fixing end-to-end `passageText` propagation and add failed-cell confirmation evidence. The only runnable x64 shape remains too slow across successful cells, the first-sentence failed-cell rerun reproduced `rc=3221226356` in `5/6` cells, the lone first-sentence success was RTF `43.7886`, the full 12-thread rerun passed but stayed at RTF `13.7587` to `14.0669`, native ARM64 clang is blocked by missing clang, and WSL2 remains unconfirmed/blocked. MOSS-3 remains blocked.

Follow-up RCA caveat: the task #10f matrix proves the current configured x64 batch path is slow and unstable, but it must not be treated as final proof about all quant/thread alternatives. Follow-up inspection found that the configured generation command hardcodes the first-class Q4 GGUF and does not pass thread count to `llama-moss-tts`, while the matrix labels still vary quant/thread. `MOSS-RCA-1` is therefore the next approved diagnostic sprint: fix or clearly classify matrix-label truth, separate batch latency from raw-code generation and ONNX decode, classify native return codes, and explain the punctuation-heavy instability before any MOSS app-integration work resumes.

Non-decisions:

- Do not start MOSS-3: sidecar, IPC, and app integration work remain blocked.
- Do not continue product-path runtime-shape rescue work without root-cause evidence that changes the runtime availability or quality tradeoff. `MOSS-RCA-1` is allowed because it is diagnostic and explicitly does not reopen MOSS-3.
- Do not record `DEMOTE_TO_NANO`: no Nano timing evidence exists.
- Do not reopen MOSS-3: failed-cell confirmation and corrected speed evidence do not justify app-integration work.
- Keep Kokoro as the operational floor.

## MOSS-RCA-1 Evidence

Run ids:

- Short configured-path truth audit: `moss-rca-1-short-truth-audit`.
- Punctuation first-sentence repeats: `moss-rca-1-punctuation-first-repeat`, `moss-rca-1-punctuation-first-repeat-2`, `moss-rca-1-punctuation-first-repeat-3`.

Artifact paths:

- `artifacts/moss/moss-rca-1-short-truth-audit/summary.json`, `stage-timings.json`, and per-run child `summary.json`.
- `artifacts/moss/moss-rca-1-punctuation-first-repeat-2/summary.json` and child probe summary under `runs/*/summary.json`.
- `artifacts/moss/moss-rca-1-punctuation-first-repeat-3/summary.json`, `stage-timings.json`, and per-run child `summary.json`.

| Evidence item | Status | Notes |
|---|---|---|
| Matrix-label truth | Corrected | The RCA harness now records `runtimeInputTruth`. Current `.runtime/moss/config.json` does not consume `{quant}`, `{threads}`, or `{maxNewTokens}` in the configured command, so those labels are marked non-assertive instead of treated as proven runtime inputs. Historical MOSS-SPEED-1 quant/thread comparisons remain valid only as configured-path repeats, not as true quant/thread sweeps. |
| Configured-path short timing | Non-viable | `moss-rca-1-short-truth-audit` produced non-empty stage timing with firstAudioMs `107184`, generationMs `107949`, audioDurationMs `4080`, and RTF `26.4581`. Stage split: raw-code generation `53656` ms and ONNX decode `53093` ms. |
| Batch first-audio semantics | Confirmed | First audio is only available after raw-code generation and ONNX decode complete; this configured path is batch-only, not streaming-first-audio. |
| Punctuation first-sentence repeat | Intermittent instability plus non-viable successes | `moss-rca-1-punctuation-first-repeat-2` failed in the child probe as `llama-cpp` with native return code `0xC0000374` (`heap-corruption-candidate`) extracted from wrapper stderr. Adjacent repeats passed but were still non-viable: RTF `60.8977` and `57.8307` for 880 ms of audio. |
| Native return-code truth | Corrected | Probe summaries now preserve return code, hex code, return-code name, wrapper return code when applicable, command metadata, and bounded stdout/stderr tails. |
| Max-token sweep | Blocked by current config truth | The harness can vary `--max-new-tokens`, but the current configured command hardcodes `--max-new-tokens 128` and does not consume `{maxNewTokens}`. RCA therefore records max-token labels as non-assertive until the local runtime config is changed to consume that placeholder. |
| MOSS-3 readiness | Blocked | Root cause confirms no basis to start sidecar, IPC, renderer, timing-truth integration, or app work. |
| Nano demotion | Not recorded | RCA collected no Nano timing evidence, so `DEMOTE_TO_NANO` remains unsupported. |

## MOSS-RCA-1 Decision

Decision: `KEEP_PAUSED_ROOT_CAUSE_CONFIRMED`.

Reason: MOSS-RCA-1 explains the current failure shape without reopening product-path work. The configured x64 Windows path is batch-only, not a streaming first-audio path; raw-code generation and ONNX decode are both large latency contributors; the current local command hardcodes the first-class Q4 GGUF and does not consume quant/thread/max-token placeholders, so earlier matrix labels cannot be treated as true quant/thread/max-token sweeps; and punctuation-heavy first-sentence repeats show intermittent `llama.cpp` heap-corruption candidate behavior alongside successful runs that are still far too slow for live use. MOSS-3 remains blocked.

Non-decisions:

- Do not start MOSS-3: sidecar, IPC, renderer integration, and app-visible MOSS work remain blocked.
- Do not change Kokoro production behavior: Kokoro remains the operational floor.
- Do not record `DEMOTE_TO_NANO`: no Nano evidence was collected.
- Do not treat current quant/thread/max-token labels as assertive until a local runtime command consumes the corresponding placeholders and the artifact records that truth.

## MOSS-RUNTIME-1 Evidence

Run ids:

- Runtime-shape attempt: `moss-runtime-1-shapes-attempt-escalated`.
- Truthful short rescue: `moss-runtime-1-truthful-single-q4-tokens128b`.
- Truthful punctuation minimized rescue: `moss-runtime-1-truthful-punctuation-first-q4-tokens128c`.

Artifact paths:

- `artifacts/moss/moss-runtime-1-shapes-attempt-escalated/summary.json`.
- `artifacts/moss/moss-runtime-1-truthful-single-q4-tokens128b/summary.json`, `stage-timings.json`, and `first-audio-architecture.json`.
- `artifacts/moss/moss-runtime-1-truthful-punctuation-first-q4-tokens128c/summary.json` and `stage-timings.json`.

| Evidence item | Status | Notes |
|---|---|---|
| Runtime-input truth | Corrected | The speed-forensics runner can use an in-memory first-class assertive command overlay without editing `.runtime/moss/config.json`. It propagates `{modelGguf}` and `{maxNewTokens}` to the wrapper/native executable, but marks `threads` non-assertive/unsupported because this local `llama-moss-tts` target rejects `--threads`. |
| Quant truth | Partially assertive | First-class `Q4_K_M` exists and is assertive. The local first-class directory does not contain first-class Q5/Q6 GGUF files, so those quants are blocked as `quant-missing` rather than represented as tested. |
| Runtime shape | Blocked beyond x64 | Escalated shape evidence records x64 Windows available, native ARM64 clang blocked by `spawn clang ENOENT`, and WSL2/Linux blocked because `wsl.exe --status` ran but did not confirm WSL2 availability. |
| Short truthful timing | Non-viable | `Q4_K_M`, x64 Windows, `maxNewTokens=128`, short smoke succeeded with firstAudioMs `81438`, generationMs `82110`, audioDurationMs `4080`, and RTF `20.125`. Stage split: generation-ref `1208` ms, raw-code generation `53354` ms, ONNX decode `27291` ms. |
| First-audio architecture | Batch-bound | `first-audio-architecture.json` classifies the current first-audio path as `batch-raw-code-plus-onnx-decode`; no partial raw-code or partial audio stream was observed through the configured first-class wrapper. |
| Punctuation minimized instability | Reproduced | `punctuation-heavy-mid/first-sentence` (`Wait...`) with truthful Q4/max-token labels failed as `llama-cpp` with native `0xC0000374` (`heap-corruption-candidate`). Partial timing preserved generation-ref `761` ms and raw-code generation `25973` ms before crash; no ONNX decode or WAV stage occurred. |
| Max-token rescue | Failed to rescue | `maxNewTokens=16` and `maxNewTokens=128` both showed native instability in truthful x64 runs; the successful `128` short case remained far outside live viability. |
| MOSS-3 readiness | Blocked | No truthful runtime evidence supports reopening sidecar, IPC, renderer, timing-truth integration, or app-visible MOSS work. |
| Nano demotion | Not recorded | MOSS-RUNTIME-1 collected no Nano timing evidence, so `DEMOTE_TO_NANO` remains unsupported. |

## MOSS-RUNTIME-1 Decision

Decision: `KEEP_PAUSED_RUNTIME_CONFIRMED`.

Reason: MOSS-RUNTIME-1 made the flagship runtime evidence fairer and still did not produce a viable local flagship path. The only available local runtime shape remains x64 Windows; native ARM64 clang is blocked by missing clang and WSL2 is unconfirmed. Truthful first-class Q4/max-token propagation works, but thread count is unsupported by this native target and Q5/Q6 first-class quants are unavailable locally. The best truthful short run still took `81438` ms to first audio with RTF `20.125`, and the measured first-audio architecture is batch-bound on raw-code generation plus ONNX decode. The minimized punctuation input `Wait...` reproduced native heap-corruption candidate `0xC0000374`. MOSS-3 remains blocked.

Non-decisions:

- Do not start MOSS-3: sidecar, IPC, renderer integration, and app-visible MOSS work remain blocked.
- Do not change Kokoro production behavior: Kokoro remains the operational floor.
- Do not record `DEMOTE_TO_NANO`: no Nano timing evidence was collected.
- Do not call Q5/Q6 or thread sweeps tested under the current first-class path; those labels are blocked or non-assertive unless a future runtime adds real support.

## MOSS-HOST-1 Evidence

Run ids:

- Runtime-shape attempt after WSL parser fix: `moss-host-1-shapes-attempt-after-wsl-fix`.
- LLVM install attempt: `moss-host-1-llvm-install-attempt`.
- WSL usability check: `moss-host-1-wsl-usability`.

Artifact paths:

- `artifacts/moss/moss-host-1-shapes-attempt-after-wsl-fix/summary.json`.
- `artifacts/moss/moss-host-1-llvm-install-attempt/summary.json`.
- `artifacts/moss/moss-host-1-wsl-usability/summary.json`.

| Evidence item | Status | Notes |
|---|---|---|
| Runtime-shape probe truth | Corrected | `scripts/moss_runtime_shape_probe.mjs` now normalizes NUL-padded `wsl.exe --status` output before matching, so Windows WSL status output is not misread as unavailable. |
| Native ARM64 clang locate/install | Blocked | `clang`, `clang-cl`, and `ninja` were not found on PATH or in common Visual Studio/LLVM locations. `choco install llvm -y --no-progress` was attempted but failed because the current shell could not obtain Chocolatey package-lock access under `C:\ProgramData\chocolatey\lib` or create `C:\ProgramData\chocolatey\lib-bad`. |
| Native ARM64 build | Blocked before configure | The guarded `arm64-windows-llvm-release` configure/build would run through CMake, but `clang` remains unavailable, so no native ARM64 `llama-moss-tts.exe` was produced. |
| WSL2 presence | Present | Escalated `wsl.exe --status` reports Default Version `2`, and the fixed shape probe records WSL2 as `available`. |
| WSL2 Linux runtime usability | Blocked | Installed distros are Docker Desktop internals only. `docker-desktop-data` cannot execute `/bin/sh`; `docker-desktop` can run `uname` and reports `aarch64`, but Blurby repo/runtime paths are not mounted and `git`, `cmake`, `gcc`, `g++`, `make`, `ninja`, and `python3` are missing. |
| Non-x64 truthful Q4/Wait rerun | Not runnable | No native ARM64 or usable WSL2/Linux MOSS runtime exists on this host state, so rerunning short Q4 and minimized `Wait...` under a non-x64 shape is blocked rather than failed. |
| MOSS-3 readiness | Blocked | MOSS-HOST-1 produced no non-x64 timing or stability evidence that could reopen sidecar, IPC, renderer, timing-truth integration, or app-visible MOSS work. |
| Nano demotion | Not recorded | MOSS-HOST-1 collected no Nano timing evidence, so `DEMOTE_TO_NANO` remains unsupported. |

## MOSS-HOST-1 Decision

Decision: `KEEP_PAUSED_HOST_CONFIRMED`.

Reason: MOSS-HOST-1 tried the remaining host-shape escape hatch and did not produce a runnable non-x64 flagship path. Native ARM64 clang remains blocked because LLVM/clang is not installed and the attempted Chocolatey install failed on host permissions. WSL2 is present after fixing NUL-padded status parsing, but the only installed WSL2 distributions are Docker Desktop internals and are not usable for MOSS runtime build/run: the default data distro has no usable shell, and the runnable Docker distro lacks repo mounts and build/runtime tools. Because no native ARM64 or WSL2/Linux MOSS runtime could run, the truthful Q4 short and minimized `Wait...` evidence could not be rerun outside x64 Windows. MOSS-3 remains blocked.

Non-decisions:

- Do not start MOSS-3: sidecar, IPC, renderer integration, and app-visible MOSS work remain blocked.
- Do not change Kokoro production behavior: Kokoro remains the operational floor.
- Do not record `DEMOTE_TO_NANO`: no Nano evidence was collected.
- Do not call native ARM64 or WSL2/Linux performance failed; they are host/tooling blocked in this environment.

## MOSS-HOST-2 Evidence

Run ids:

- Shape gate: `moss-host-2-wsl-ready`.
- Short WSL Q4 tokens128: `moss-host-2-wsl-short-q4-tokens128`.
- Punctuation WSL Q4 tokens128: `moss-host-2-wsl-punctuation-q4-tokens128`.

Artifact paths:

- `artifacts/moss/moss-host-2-wsl-ready/summary.json`.
- `artifacts/moss/moss-host-2-wsl-short-q4-tokens128/summary.json`.
- `artifacts/moss/moss-host-2-wsl-punctuation-q4-tokens128/summary.json`.

Fresh WSL ARM64 binary:

- `/mnt/c/Users/estra/Projects/Blurby/.runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts`.

Build flags:

- `GGML_NATIVE=OFF`
- `GGML_CPU_ARM_ARCH=armv8.6-a+dotprod+i8mm+nosve`
- `CMAKE_BUILD_TYPE=Release`

| Evidence item | Status | Notes |
|---|---|---|
| Shape gate | Available | `artifacts/moss/moss-host-2-wsl-ready/summary.json` records `shapes.wsl2Linux.status=available`, `machine=aarch64`, an Ubuntu-24.04 shell gate, and the fresh host2 binary path `/mnt/c/Users/estra/Projects/Blurby/.runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts`. |
| Fresh binary provenance | Confirmed | MOSS-HOST-2 used the fresh WSL ARM64 host2 binary, not stale evidence from earlier x64 or blocked host-shape attempts. |
| Short WSL Q4 tokens128 | Runnable but non-viable | `artifacts/moss/moss-host-2-wsl-short-q4-tokens128/summary.json` records raw `57.84s`, decode `63.38s`, total `121.22s`, RTF `42.0902777777778`, and WAV `180524` bytes. |
| Punctuation WSL Q4 tokens128 | Runnable but non-viable | `artifacts/moss/moss-host-2-wsl-punctuation-q4-tokens128/summary.json` records raw `52.93s`, decode `73.26s`, total `126.19s`, RTF `16.2615979381443`, and WAV `372524` bytes. |
| MOSS-3 readiness | Blocked | Fresh WSL ARM64 evidence proves the shape can run, but the measured runtime is still far outside live app-integration viability. Do not reopen sidecar, IPC, renderer, timing-truth integration, or app-visible MOSS work. |
| Nano demotion | Not recorded | MOSS-HOST-2 collected no Nano timing evidence and does not record `DEMOTE_TO_NANO`. |

## MOSS-HOST-2 Decision

Decision: `KEEP_PAUSED_HOST_CONFIRMED`.

Reason: MOSS-HOST-2 closed the stale-evidence gap by using a fresh WSL ARM64 host2 binary at `/mnt/c/Users/estra/Projects/Blurby/.runtime/moss/llama.cpp/build-wsl-arm64-host2/bin/llama-moss-tts`, built with `GGML_NATIVE=OFF`, `GGML_CPU_ARM_ARCH=armv8.6-a+dotprod+i8mm+nosve`, and `CMAKE_BUILD_TYPE=Release`. The Ubuntu-24.04 WSL shape gate is available on `aarch64`, but the runnable Q4 tokens128 probes remain non-viable: short took total `121.22s` at RTF `42.0902777777778`, and punctuation took total `126.19s` at RTF `16.2615979381443`. MOSS-3 remains paused.

Non-decisions:

- Do not start MOSS-3: sidecar, IPC, renderer integration, timing-truth integration, and app-visible MOSS work remain blocked.
- Do not change Kokoro production behavior: Kokoro remains the operational floor.
- Do not record `DEMOTE_TO_NANO`: no Nano timing evidence was collected.

## MOSS-NANO-1 Evidence

Run ids:

- Provisioning evidence: `moss-nano-1-provisioning`.
- Runtime-contract blocker evidence before fix: `moss-nano-1-provisioning-blocked`.
- Live short probe after fix: `moss-nano-1-short`.
- Live punctuation probe after fix: `moss-nano-1-punctuation`.

Artifact paths:

- Provisioning logs: `artifacts/moss/moss-nano-1-provisioning/`.
- Initial blocker artifacts: `artifacts/moss/moss-nano-1-provisioning-blocked/` and provisioning logs under `artifacts/moss/moss-nano-1-provisioning/`. The canonical `moss-nano-1-short` summary now holds successful post-fix evidence.
- Short live summary/audio: `artifacts/moss/moss-nano-1-short/summary.json`, `artifacts/moss/moss-nano-1-short/output.wav`.
- Punctuation live summary/audio: `artifacts/moss/moss-nano-1-punctuation/summary.json`, `artifacts/moss/moss-nano-1-punctuation/output.wav`.

Local runtime assets:

- Source: `.runtime/moss/MOSS-TTS-Nano`.
- ONNX assets: `.runtime/moss/weights/MOSS-TTS-Nano-ONNX/MOSS-TTS-Nano-100M-ONNX` and `.runtime/moss/weights/MOSS-TTS-Nano-ONNX/MOSS-Audio-Tokenizer-Nano-ONNX`.
- Python venv: `.runtime/moss/.venv-nano`, Python `3.13`.
- Installed packages: `numpy`, `soundfile`, `onnxruntime`, `sentencepiece`, `torch==2.7.0`, `torchaudio==2.7.0`.

| Evidence item | Status | Notes |
|---|---|---|
| Probe scripts | Added | `scripts/moss_nano_probe.mjs` and `scripts/moss_nano_probe.py` run direct upstream Nano ONNX inference and collect summary/audio artifacts. |
| Probe tests | Passed | `tests/mossNanoProbe.test.js` focused test passed `8/8` after sandbox `EPERM` required an escalated rerun. |
| Runtime contract | Fixed | Upstream `infer_onnx.py` requires `--output-audio-path` and `--cpu-threads`, not `--output`/`--threads`; prompt audio uses `--prompt-audio-path`. Direct `infer_onnx.py` is preferred over `moss-tts-nano` CLI for this probe. |
| Short Nano ONNX CPU probe | Runnable but not realtime | `status: ok`; `output.wav` size `706604`; firstAudioSec `15.5075`; totalSec `16.1921`; audioDurationSec `3.68`; RTF `4.4`; peakMemoryMb `null`. |
| Punctuation Nano ONNX CPU probe | Runnable but not realtime | `status: ok`; `output.wav` size `2257964`; firstAudioSec `18.7613`; totalSec `19.4349`; audioDurationSec `11.76`; RTF `1.6526`; peakMemoryMb `null`. |
| Kokoro comparison | Still favors Kokoro for live default | Prior Kokoro baseline remains much faster: `1385` ms / RTF `0.3337` for short smoke and `5616` ms / RTF `0.7414` for punctuation-heavy. Nano is operationally far better than flagship but still misses live first-audio and realtime promotion thresholds. |
| Flagship comparison | Nano is the better MOSS runtime candidate | Previous flagship evidence remains non-viable despite fresh WSL ARM64 proof: MOSS-HOST-2 short total `121.22s` / RTF `42.0902777777778`, punctuation total `126.19s` / RTF `16.2615979381443`. Nano ONNX CPU generates local audio faster and more reliably than flagship, but not fast enough for app integration. |
| MOSS app integration | Still blocked | No sidecar, renderer, selectable engine, IPC, timing-truth, cache, or productization work is approved from this evidence. |

## MOSS-NANO-1 Decision

Decision: `ITERATE_NANO_RUNTIME`.

Reason: Nano ONNX CPU generated local audio for both short and punctuation-heavy passages and is operationally far better than flagship on this host, but the observed first-audio times (`15.5075s`, `18.7613s`) and RTF (`4.4`, `1.6526`) miss live realtime and promotion thresholds. Keep Kokoro as the app default and only integrated engine for now. Nano remains worth runtime iteration, not rejection and not app promotion.

Next actions:

- Optimize Python cold start and imports in the Nano probe path.
- Measure streaming first-audio truth separately from full-file completion.
- Explore CPU thread and model/runtime options that could improve first audio and RTF.
- Define packaging/provisioning shape only after timing improves enough to justify app prototype work.

Non-decisions:

- Do not record `PROMOTE_NANO_TO_APP_PROTOTYPE`: Nano is not ready for app integration.
- Do not reject Nano: it generates local audio and is materially better than flagship operationally.
- Do not start MOSS-3 or any Nano app-side sidecar, IPC, renderer, timing-truth, cache, or productization work.
- Do not change Kokoro behavior: Kokoro remains the app default and only integrated engine.
- Do not record `DEMOTE_TO_NANO`: the current decision is bounded Nano runtime iteration, not a product-lane demotion/promotion.

## MOSS-NANO-2 Evidence

Run ids:

- Superseded wrong-interpreter runs: `moss-nano-2-cold-short`, `moss-nano-2-warm-short`, `moss-nano-2-cold-punctuation`, `moss-nano-2-warm-punctuation`.
- Superseded venv-but-empty-alias runs: `moss-nano-2-cold-short-venv`, `moss-nano-2-warm-short-venv`, `moss-nano-2-cold-punctuation-venv`, `moss-nano-2-warm-punctuation-venv`.
- Superseded non-v2 real-text runs: `moss-nano-2-cold-short-realtext`, `moss-nano-2-warm-short-realtext`, `moss-nano-2-cold-punctuation-realtext`, `moss-nano-2-warm-punctuation-realtext`.
- Superseded non-v2 segmentation runs: `moss-nano-2-segment-first-sentence-short`, `moss-nano-2-segment-natural-punctuation`, `moss-nano-2-segment-token-window-punctuation`, `moss-nano-2-segment-char-window-punctuation`.
- Canonical v2 real-text runs: `moss-nano-2-cold-short-realtext-v2`, `moss-nano-2-warm-short-realtext-v2`, `moss-nano-2-cold-punctuation-realtext-v2`, `moss-nano-2-warm-punctuation-realtext-v2`.
- Canonical v2 segmentation runs: `moss-nano-2-segment-token-window-punctuation-v2`, `moss-nano-2-segment-char-window-punctuation-v2`.
- ORT option runs: `moss-nano-2-ort-cpu-default-short`, `moss-nano-2-ort-cpu-threads2-short`, `moss-nano-2-ort-azure-cpu-short`.
- Prewarm/cache runs: `moss-nano-2-prewarm-none-short`, `moss-nano-2-prewarm-ort-sessions-short`, `moss-nano-2-prewarm-synthetic-short`.

MOSS-NANO-2 scope: runtime optimization and evidence only. It did not add app integration, sidecar IPC, renderer integration, selectable engine behavior, cache/continuity integration, timing-truth UI integration, or Kokoro behavior changes.

Harness changes:

- Added stage/profile fields, cold/warm modes, segmentation/window modes, ORT option request metadata, prewarm metadata, and Python interpreter selection with this precedence: explicit `--python`, then `PYTHON` environment variable, then repo-local `.runtime/moss/.venv-nano`, then system `python`.
- Added passage aliases `short` -> `short-smoke` and `punctuation` -> `punctuation-heavy-mid`.
- Added a fail-closed empty passage guard so shorthand resolution mistakes cannot produce wordCount `0` "success" evidence.
- Focused tests passed `23/23` after a known sandbox Vite/esbuild `spawn EPERM` and escalated rerun.

Superseded artifacts:

- `moss-nano-2-cold-short`, `warm-short`, `cold-punctuation`, and `warm-punctuation` are superseded and non-canonical because they were blocked by the wrong system Python before the corrected interpreter precedence was documented and enforced.
- `moss-nano-2-*-venv` artifacts are superseded and non-canonical because they used the venv but shorthand passage aliases still resolved empty, producing wordCount `0`; the alias and empty-passage guard fixes supersede them.
- Non-v2 real-text and segmentation artifacts are superseded by the v2 reruns after the first-audio/output path contract fix.

Canonical v2 real-text metrics:

| Run | Passage | Words | First observed | Total | Audio | RTF | WAV bytes | Runtime reuse |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `moss-nano-2-cold-short-realtext-v2` | `short-smoke` | 9 | `13.9036s` | `14.4591s` | `3.68s` | `3.9291` | `706604` | n/a |
| `moss-nano-2-warm-short-realtext-v2` | `short-smoke` | 9 | `15.2025s` | `15.8170s` | `3.68s` | `4.2981` | `706604` | `runtimeReuseActual: false` |
| `moss-nano-2-cold-punctuation-realtext-v2` | `punctuation-heavy-mid` | 14 | `20.0393s` | `20.6641s` | `11.76s` | `1.7572` | `2257964` | n/a |
| `moss-nano-2-warm-punctuation-realtext-v2` | `punctuation-heavy-mid` | 14 | `18.6516s` | `19.2688s` | `11.76s` | `1.6385` | `2257964` | `runtimeReuseActual: false` |

Timing-truth caveat: v2 `firstAudioObservedSec` is based on reset file observation with `fileResetBeforeRun: true`, so it is no longer the old reused-output artifact, but it is still not internal first decoded audio. Internal first decoded audio remains unavailable without runtime instrumentation.

Segmented v2 output-path contract:

| Run | Total | RTF | Output contract |
|---|---:|---:|---|
| `moss-nano-2-segment-token-window-punctuation-v2` | `52.8842s` | `2.7204` | `outputWavPath: null`, `outputPath: null`, `segmentOutputWavPaths` present |
| `moss-nano-2-segment-char-window-punctuation-v2` | `51.2033s` | `3.2002` | `outputWavPath: null`, `outputPath: null`, `segmentOutputWavPaths` present |

Optimization evidence:

| Attempt | Result |
|---|---|
| Segmentation/windowing | Did not help. Non-v2 segmented artifacts are superseded by v2. Canonical v2 token-window punctuation was total `52.8842s` / RTF `2.7204`; canonical v2 char-window punctuation was total `51.2033s` / RTF `3.2002`. Both record `outputWavPath` / `outputPath` as `null` and preserve per-segment paths in `segmentOutputWavPaths`. |
| ORT options | Did not help/apply. CPU default short `16.846s` / RTF `4.5777`; CPU threads2 `17.4572s` / RTF `4.7438`; Azure+CPU `20.3399s` / RTF `5.5271`. Options were recorded as requested metadata but did not apply through the subprocess boundary. |
| Prewarm/cache | Did not help/apply. No-prewarm `16.8044s` / RTF `4.5664`; ORT prewarm `18.6696s` / RTF `5.0733`; synthetic `18.4332s` / RTF `5.0090`; `runtimeReuseActual` stayed `false`. |

Comparison:

- Kokoro remains far ahead: short `1385ms` / RTF `0.3337`; punctuation `5616ms` / RTF `0.7414`.
- Nano remains better than flagship WSL: flagship short `121.22s` / RTF `42.09`; flagship punctuation `126.19s` / RTF `16.26`.
- Nano is still not viable for a live app prototype on this evidence.

## MOSS-NANO-2 Decision

Decision: `KEEP_KOKORO_ONLY`.

Reason: MOSS-NANO-2 corrected the Nano probe evidence path and tested the plausible bounded rescue levers, but the canonical real-text timings still miss live-app viability by a wide margin, and the attempted optimizations did not produce true runtime reuse, applied ORT/session options, or trustworthy internal first-decoded timing. Kokoro remains far faster on the same short and punctuation passages. Keep Kokoro as the only integrated engine.

Decision framing: `KEEP_KOKORO_ONLY` means no Nano app prototype now. It is not a permanent Nano model rejection. Future Nano work should reopen only with in-process runtime instrumentation, true session reuse, trustworthy internal first-decoded timing, and applied ORT/session options.

## MOSS-NANO-3 Decision

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`.

Reason: MOSS-NANO-3 proved the meaningful part of the reopen hypothesis: Nano can run through a resident in-process runtime with true runtime reuse and internal first decoded audio timing. However, the canonical short resident run still recorded RTF `1.7005`, missing the promotion threshold `<=1.5`, and memory growth across resident runs needs soak/tuning before any app-prototype decision. Iterate resident runtime tuning/soak/perf only rather than promote.

Runtime path:

- Resident runtime: `scripts/moss_nano_resident_probe.py`.
- Wrapper: `scripts/moss_nano_probe.mjs --runtime-mode resident`.
- Package script: `npm run moss:nano:resident`.

Verification:

- Focused tests: `npm test -- tests/mossNanoProbe.test.js` => `28/28` pass after known sandbox `EPERM` escalated rerun.
- Full tests: `npm test` => `150` files, `2268` tests pass.
- Build: `npm run build` passes with the existing circular chunk warning.

Canonical refreshed artifacts:

| Artifact | Evidence |
|---|---|
| `artifacts/moss/moss-nano-3-short-resident/summary.json` | `internalFirstDecodedAudioMs` `513`, RTF `1.7005`, `runtimeReuseActual: true`, `memoryGrowthAcrossRunsMb` `36.59`. |
| `artifacts/moss/moss-nano-3-punctuation-resident/summary.json` | `internalFirstDecodedAudioMs` `541`, RTF `1.2042`, `runtimeReuseActual: true`, `memoryGrowthAcrossRunsMb` `62.92`. |
| `artifacts/moss/moss-nano-3-ort-session-resident/summary.json` | Requested/applied ORT split recorded; CPU provider, `intraOp` `2`, and `interOp` `1` applied; `usePerSessionThreads` truthfully unsupported; `internalFirstDecodedAudioMs` `516`; RTF `1.0962`; `runtimeReuseActual: true`. |
| `artifacts/moss/moss-nano-3-stale-output-guard/summary.json` | Clean fresh-output evidence: `outputFileExistedBeforeRun: false`, `reusedExistingOutputFile: false`, memory evidence present. |

Comparison: MOSS-NANO-2 v2 had observed first audio `13.9036s` / `15.2025s` short and `20.0393s` / `18.6516s` punctuation with `runtimeReuseActual: false`. Kokoro baseline remains `1385ms` / RTF `0.3337` short and `5616ms` / RTF `0.7414` punctuation.

Non-decision: MOSS-NANO-3 does not reopen MOSS-3 through MOSS-7. Sidecar IPC, renderer integration, selectable engine behavior, cache/continuity integration, timing-truth UI integration, Kokoro behavior changes, and Kokoro retirement remain forbidden until a separate promotion decision is recorded.

Non-decisions:

- Do not start MOSS-3 through MOSS-7 unless a new explicit promotion decision is recorded.
- Do not add Nano sidecar IPC, renderer integration, selectable engine behavior, timing-truth UI integration, cache/prewarm/continuity integration, or productization work from this evidence.
- Do not change Kokoro behavior: Kokoro remains the app default and only integrated engine.
- Do not treat superseded wrong-interpreter or empty-passage artifacts as current timing evidence.
- Do not reject Nano permanently; require better runtime instrumentation and actual reuse before reconsidering.

## MOSS-NANO-4 Decision

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`.

Explicit non-decision: not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`.

Scope: MOSS-NANO-4 was runtime optimization plus promotion retest only. It did not add app integration, sidecar IPC, renderer integration, selectable engine behavior, MOSS-3 reopening, or Kokoro behavior changes.

Evidence:

| Evidence item | Result |
|---|---|
| Best short resident ORT run | `moss-nano-4-short-resident-ort-intra2` recorded true reuse; ORT applied CPU `intraOp 2`, `interOp 1`, sequential execution, and graph optimization all; first decoded `659ms`; final RTF `1.3734`; p50/p95 `1.3734`/`1.4329`; memory growth about `42.57MB`. |
| Baseline short | RTF `1.7116`, first decoded `565ms`. |
| Best punctuation | First decoded `944ms`, final RTF `1.6540`. |
| Best bookwarm | Long-form built-in substitute; `3/3` fresh internal first decoded warm runs; stale output reuse `0`; first decoded `727ms`; RTF `1.1252`. |
| Decode-full caveat | Disqualified/caveated for promotion framing: first decoded `6099ms`, memory growth about `103.16MB`. |
| Precompute truth | Precompute was requested but `precomputeInputsActual=false`; no false reuse/precompute claim is valid. |
| False-promotion hardening | Promotion-class summaries now require numeric thresholds/metrics and block requested-vs-actual contradictions. |
| Focused verification | Focused tests passed `42/42`; full verification is reserved for Hippocrates. |

Reason: The best short resident ORT run improved throughput and proves applied ORT settings with true reuse, but punctuation RTF remains above the promotion target and decode-full/bookwarm caveats prevent a safe app-prototype promotion. Continue resident runtime tuning/soak/perf only.

Non-decisions:

- Do not start MOSS-3 through MOSS-7 unless a new explicit promotion decision is recorded.
- Do not add Nano app integration, sidecar IPC, renderer integration, selectable engine behavior, timing-truth UI integration, cache/prewarm/continuity integration, or productization work from this evidence.
- Do not change Kokoro behavior: Kokoro remains the app default and only integrated engine.
- Do not claim precompute reuse when `precomputeInputsActual=false`.

## MOSS-NANO-5B Decision

Decision: `ITERATE_NANO_RESIDENT_RUNTIME`.

Explicit non-decisions: not `PROMOTE_NANO_TO_SOAK_CANDIDATE`, not `KEEP_KOKORO_ONLY`, not `REJECT_NANO_LOCAL_CPU`, and not `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE`.

Scope: MOSS-NANO-5B was runtime-only precompute + adjacent continuity closure. It did not add app integration, renderer integration, sidecar IPC, selectable engine behavior, cache integration, continuity integration in the app, Kokoro behavior changes, or `.runtime/**` commits.

Focused verification:

- `python -m py_compile scripts\moss_nano_resident_probe.py` passed.
- `npm test -- tests/mossNanoProbe.test.js` passed `75/75` after the known sandbox `EPERM` escalated rerun.

Canonical refreshed artifacts:

| Evidence item | Result |
|---|---|
| Short resident ORT | `moss-nano-5b-short-resident-ort-intra2`: ok; first audio `0.340s`; RTF `0.6440`; p50/p95 `0.6440`/`0.6610`; memory delta `5.81MB`; stale `false`. |
| Decode full | `moss-nano-5b-short-resident-decode-full`: runtime ok but gate failed; first audio `2.963s` > `2.5s`; RTF `0.7142`; p50/p95 `0.6969`/`0.7142`; memory delta `5.60MB`; stale `false`. |
| Precompute request rows | `moss-nano-5b-short-resident-precompute-requestrows`: runtime ok but precompute blocked; first audio `0.418s`; RTF `0.7183`; p50/p95 `0.7882`/`0.8012`; memory delta `6.15MB`; `requested=true`, `actual=false`, `partial=true`; blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`; `preparedBeforeRun=false`; `consumedByMeasuredRun=false`; `requestRowCount=0`. |
| Adjacent segments stable | `moss-nano-5b-adjacent-segments-resident-stable`: ok; first audio `0.428s`; RTF `0.6003`; p50/p95 `0.5996`/`0.6003`; memory delta `8.14MB`; stale `false`; `5/5` fresh; fair trend ratio `0.0081` <= `0.15`; `crossSegmentStateActual=false`; blocker `NO_CROSS_SEGMENT_MODEL_STATE_HOOK`. |

False-evidence hardening:

- Preserve top-level `crossSegmentStateActual`.
- Explicit decode-full re-threshold evidence is supported.
- The fair adjacent trend metric is separate from true cross-segment/prosody state.
- Precompute row-consumption evidence is required for promotion.

Reason: Do not record `PROMOTE_NANO_TO_SOAK_CANDIDATE` because decode-full misses the first-audio gate and precompute request rows are still not consumed. Adjacent fair trend improved and clears the runtime stability metric, but it does not prove true cross-segment model state.

Non-decisions:

- This 5B closeout did not dispatch MOSS-NANO-6; 5C later superseded the soak-gate blocker with a segment-first runtime-only gate.
- Do not add Nano app integration, sidecar IPC, renderer integration, selectable engine behavior, cache/continuity integration, timing-truth UI integration, or productization work from this evidence.
- Do not change Kokoro behavior: Kokoro remains the app default and only integrated engine.
- Do not commit `.runtime/**`.

## MOSS-NANO-5C Decision

Decision: `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`.

Explicit framing: this is a runtime-only soak-candidate gate, not app prototype promotion. It does not add or approve app integration, renderer integration, sidecar IPC, selectable engine/cache changes, Kokoro behavior changes, MOSS-3 reopening, or `.runtime/**` committed edits.

Final artifact:

- `artifacts/moss/moss-nano-5c-segment-first-soak-gate-final2/summary.json`

Canonical final2 evidence:

| Evidence item | Result |
|---|---|
| Status | `ok`. |
| Promote | `true`. |
| Decision | `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`. |
| First decoded metric | `0.449s <= 0.5s`. |
| Segment-first short RTF | `0.6513 <= 1.5`. |
| Adjacent fair RTF trend | `0.0105 <= 0.15`. |
| Fresh segments | `5 >= 5`. |
| Stale output reuse | `0`. |
| Session restarts | `0`. |
| Precompute classification | `non-product-required`, status `not-required`. |
| Decode-full classification | `diagnostic-only-non-product-path`. |

Supporting diagnostics:

- `moss-nano-5c-short-resident-decode-full-diagnostic`: decode-full diagnostic path measured, but decode-full remains diagnostic-only/non-product for 5C and is not product latency proof.
- `moss-nano-5c-short-resident-precompute-requestrows-rca`: precompute was requested but actual remained false with blocker `NO_PRECOMPUTE_REQUEST_ROWS_HOOK`. RCA: the current high-level path lacks prepared-row consumption, but the lower ONNX path has build/request rows and generate frames, so future runtime work may implement it.

Reason: The segment-first product-path gate passed all final2 numeric thresholds with fresh outputs and no session restarts. Precompute is non-product-required for this gate, so no precompute success is claimed. Decode-full is diagnostic-only/non-product, so it is not a product blocker or product latency proof for 5C.

Next actions:

- `MOSS-NANO-6` may dispatch as resident soak + packaging readiness because 5C earned a runtime-only soak-candidate gate.
- App integration remains gated until a later explicit `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE` or stricter decision is recorded.

Non-decisions:

- Do not add Nano app integration, sidecar IPC, renderer integration, selectable engine behavior, cache/continuity integration, timing-truth UI integration, or productization work from this evidence.
- Do not reopen MOSS-3.
- Do not change Kokoro behavior: Kokoro remains the app default and only integrated engine.
- Do not commit `.runtime/**`.
- Do not claim precompute success.
- Do not use decode-full as product latency proof for 5C.

## Nano Onboarding Roadmap Gate

Roadmap status: `MOSS-NANO-5B` through `MOSS-NANO-11` are specified as the Nano onboarding lane. `MOSS-NANO-5C` earned the runtime-only segment-first soak-candidate gate.

Allowed next work:

- `MOSS-NANO-6`: runtime/package soak gate, dispatch-ready after `PROMOTE_NANO_TO_SOAK_CANDIDATE_WITH_SEGMENT_FIRST_GATE`. It may record `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE` only if latency, memory, shutdown, packaging, provisioning, and long-session evidence all pass.
- `MOSS-NANO-7` through `MOSS-NANO-11`: conditional app onboarding path. These must not dispatch until `PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE` is recorded.

Forbidden until promotion:

- Nano sidecar IPC in the app.
- Renderer engine selection.
- `TtsEngine` production expansion to make Nano user-selectable.
- Narration strategy integration.
- Cache/prefetch/continuity integration.
- Timing-truth UI integration.
- Kokoro behavior changes or Kokoro retirement work.

## Decision Notes

- Flagship MOSS-TTS was the first target and remains paused for app-integration/product-path work.
- MOSS-TTS-Nano is promoted only to runtime soak candidacy after `MOSS-NANO-5C`. It must not enter app integration or replace Kokoro without a later explicit app-prototype promotion decision. `MOSS-NANO-6` may dispatch as resident soak + packaging readiness.
- The Windows-safe first-class wrapper intentionally avoids the upstream inner `std::system(...)` ONNX decoder call. It asks `llama-moss-tts` for raw codes, then invokes the Python decoder directly with an argument array.
- Kokoro retirement remains paused. Kokoro stays the operational floor and only integrated engine until a successor proves live-book playback, timing truth, and user-visible reliability.
- Legacy flagship MOSS-3 through MOSS-7 stay paused/superseded unless a new explicit flagship promotion decision is recorded. Nano app onboarding now uses MOSS-NANO-7 through MOSS-NANO-11 after promotion.
- No silent fallback is allowed when MOSS is selected. Unsupported MOSS state must remain visible and actionable.

## Evidence Links

- Runtime setup: `docs/testing/MOSS_RUNTIME_SETUP.md`
- Feasibility policy: `docs/testing/MOSS_FLAGSHIP_FEASIBILITY.md`
- Preflight script: `scripts/moss_preflight.mjs`
- Probe script: `scripts/moss_flagship_probe.mjs`
- Benchmark script: `scripts/moss_kokoro_benchmark.mjs`
- Kokoro baseline script: `scripts/kokoro_pair_baseline.mjs`
- Runtime shape probe: `scripts/moss_runtime_shape_probe.mjs`
- Speed forensics script: `scripts/moss_speed_forensics.mjs`
- Windows first-class wrapper: `scripts/moss_firstclass_windows_e2e.py`
- Nano probe scripts: `scripts/moss_nano_probe.mjs`, `scripts/moss_nano_probe.py`
- Provisioning tests: `tests/mossProvisioning.test.js`
- Probe tests: `tests/mossFlagshipProbe.test.js`
- Nano probe tests: `tests/mossNanoProbe.test.js`
- Benchmark tests: `tests/mossBenchmark.test.js`
- Kokoro baseline tests: `tests/kokoroPairBaseline.test.js`
- Runtime shape tests: `tests/mossRuntimeShapeProbe.test.js`
