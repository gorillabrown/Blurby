# FOLIATE-DISPLAY-LIFETIME-1 — source approved; native qualification held

Owner: local repair chat `01a17dcd-3e4d-7161-bb2f-d8c273de5afb`.
Parent: `01a0cf7f-62f6-7450-abc9-5bb2750923f4`.
Technical authority: Blurby.Brain `01a179e8-7a40-75c0-93f4-d3045ad99027`.

## Confirmed source result

Source commit `e1c1c11ceac16e8cba808714172420942e8801fa` is published without force on `eb/foliate-display-lifetime-1`. It contains exactly the dependency patch, two named tests, the source-stage memo and portable receipt. Approved main `85e6e5aaedccb0501c529dbc9f739e50a0689fd7` is an ancestor. Independent reviewer verified actual committed bytes and exact five-file scope. Source/spec/quality and portable execution are approved; this is not native/package acceptance.

Canonical source inputs: patch SHA256 `9e9c4ea2303c3a7d9705878e381153d347fc0e0b9635f75ffd9a34d75c4c34ca`; readiness test `aa174c378c6490fdc8b3afe6458e6157e2433362d099233150121bb804a17623`; lifetime test `742bf47d586488a6b3cf482dc4a7d8aa027e0d442737f5df068c47b19fcc944f`; installed production paginator `a2dc11ade7c5e5980ebf11db3edda5aaa0673b0672c0a2563c3410ded735d43b`.

Identical canonical detector: candidate51 PASS; original base35 behavior assertion failures and16 passing controls, with four additional separately classified old-production null-expand rejections. Final full suite185 files,2522 passed/two skipped/zero failed; typecheck/build exit0. Exact logs and provenance are in the committed portable receipt. Source review: `C:/Projects/Blurby-artifacts/local-resume-20261027/review/foliate-final-source-review.md`.

## Static package result

Ordinary native Windows ARM64 `--dir` build from exact source commit/current approved main exits0. No package, lock, build configuration, version or dependency graph change.

- Executable: `C:/Projects/Blurby/.worktrees/foliate-display-lifetime-20261027/release/win-arm64-unpacked/Blurby.exe`, SHA256 `be49c8899ad3f476f70f1a7981e88cfa3bd78989f1363653d8015029a841a3d4`.
- ASAR SHA256 `b59071afd7816764b3132e3e959fa5b659cfc80b42d635572b2ce60b4adc2932`.
- 77 exact ASAR source/dist/icon byte matches; both declared extra-resource files match. Main override present; PE machine0xAA64. The separately shipped dependency paginator matches installed source. Compiled paginator `paginator-CJN_w8Zg.js`,28770 bytes, SHA256 `64701df995b30530628f7a0ca6fe9ca550b72df2b67870ec2b7868f2c6ca4b5f`; no test facade ships.
- Sample EPUB blob `ffa271998c636c689761ac4eb5773dca92208bf0`, SHA256 `8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb`; workbook resource also byte-checked.
- Selected win32/arm64 ONNX and sharp binaries: eight actual PE images, all machine0xAA64. This does not claim all bundled cross-platform binaries are ARM64 or that native runtime execution passed.

Artifact root: `C:/Projects/Blurby-artifacts/foliate-display-lifetime-20261027/`. Current worker-authored `package-preflight.json` SHA256 `2ab9de1c4724b0de052ccb75c307505b496c8a378576254f8d54670d8a573f0c`, actor/time2026-10-27T15:21:46.923Z; `native-resource-census.json` records selected native binaries. Independent static review: `C:/Projects/Blurby-artifacts/local-resume-20261027/review/foliate-package-static-review.md`.

The first ASAR lookup failed for forward-slash nested paths on the Windows API. Actual archive enumeration and paired backslash extraction proved a lookup-harness failure, not absent bytes. The artifact driver alone was corrected with `path.normalize`; no package rebuild/source/configuration change. Original driver is retained as `package-preflight.pre-path-normalize.mjs`.

The reviewer accidentally reran the writing preflight helper, changing the receipt timestamp but not binary/parity values. That reviewer run is preserved and attributed separately as `package-preflight.reviewer-rerun-151839.json`, SHA256 `bf045e18304912787f30779d9c7f719739603b67a6a07d30a6b7a87e32ca9fe4`. The later worker receipt includes the expanded icon/resource census. No restoration/deletion/history rewrite.

## Actual gate: passive initialized-path collector qualification

Brain requires actual initialized cached `_dataPath`, `queuePath` and independent `syncStatePath` readback before native input. UserData, covers, arguments and derived strings alone are insufficient. Brain admitted a bounded artifact-local unpaused Runtime descriptor collector and controlled fixtures, with no new source hook, IPC/export, Debugger domain/pause, formatter/getter invocation, queue initialization, OS recording, corrective wrapper or queue payload expansion. Raw descriptor responses can contain unrelated values transiently; they must remain ephemeral and never be logged/persisted. Only allowlisted primitive paths and minimum identity/location provenance may be saved.

Two owned Node-fixture attempts failed before any control completed. Each receipt has an empty control list and `EVALUATION_FAILED`/`Uncaught`. Neither is a control pass or proof of application observation capability. Both known spawned fixture PIDs were stopped. The saved failures do not prove which inspector context was observed; historical endpoint ownership remains unproved. Current read-only OS metadata found no listener on19461 and no Blurby.exe process, which does not recover historical ownership.

- `attestation-controls.attempt1-fail.json`, SHA256 `483e861719e8fd48968f04bae3fd16c0de186eb05d820ea1bb7106892d37b2b3`.
- `attestation-controls.attempt2-fail.json`, SHA256 `1e1621c8d006d40782c7ddf5818ebea34c093a6d9f8ed3b31eefc60ed7c32aaa`.
- Artifact-only code: `attestation-helper.mjs`, `attestation-controls.mjs`, `attestation-controlled-fixtures.cjs`. These are unqualified and must not be used on the app merely because their files exist.

After two failures, repair/probing stopped and exact code/receipts were routed to Brain. No third diagnostic launch or application launch occurred. Parent explicitly permits only static read-only analysis while awaiting a prescribed ruling. Static findings to carry forward:

1. Enforce owned PID/executable/port/readiness before any module or scope traversal; validating identity after collection is insufficient.
2. First draft used nonexistent `process.mainModule.require.cache`; artifact-only second draft uses a Module constructor `_cache` data descriptor, still not qualified. Do not guess another entry or load a substitute module.
3. Require actual loaded-module identity/`module.loaded` and function-origin/location enforcement. The current `moduleSourceSha256` value is supplied static provenance, not an observed runtime source hash. Label external ASAR verification honestly rather than treating it as independent observation.
4. Add bounded request/close handling and narrowly allowlisted failure stage/type/location diagnostics. Generic `Uncaught` does not locate the failure; no raw scopes/CDP responses may be persisted to repair that gap.
5. A genuinely missing-cell fixture needs a getter lexically outside the factory context; otherwise V8 may expose the shared `_dataPath` context despite the getter not using it. An actual foreign module/function fixture must test origin; changing only expected metadata is insufficient.

## Remaining work and custody

No Blurby application launch or native route has run. The original329-second observer session, separate census, four modes plus five bounded cycles, owned91-WORD EPUB visibility route, separate fresh product-defaults329-second route, native causal controls, >=25-second survival, actual per-launch identity/path proofs, complete errors/rejections/dumps, profile/normal library/settings/sync-queue custody and owned shutdown remain **NOT RUN**.

Future launches need per-run content-free before/after hashes and metadata for exact normal library/settings/sync-queue paths, explicit missing states, canonical scratch paths and no alias into normal data. Do not inspect/export queue payloads, reset/restore owner data, force queue initialization, infer writer attribution or reuse another PID's attestation. Native input stays held until the same collector's meaningful opposite controls and an actual fresh preflight-only receipt independently pass, followed by parent continuation acknowledgement. Parent owns desktop scheduling; any reservation is conditional, not evidence of a pass.

Historical timing/ledger backfills, generated perf results, original base/generator helpers and prospective unstarted timing rows remain preserved unstaged in this worktree. No broad staging, cleanup, reset, stash, deletion, force push or unrelated edit.

Item remains In Flight. Package acceptance remains WITHHOLD. Brain's exact-package confirmation and separate integration go are still required. No main merge, freeze lift, release, installation/distribution or terminal completion.
