# PP2 locked dependency sources — bounded static investigation

Planning evidence only. No dependency activation, package import, native execution, test, install, model operation, child probe or readiness admission occurred. This supplements the PP2 installer audit; it does not amend its execution recipe or authorize D0, D1 or V.

## Identity and custody

Input root: `C:/Projects/Blurby-artifacts/pp2-locked-source-planning-20261102`.

The complete `receipt.json` has SHA-256 `011281571d18058a8a33c4c1347b78bba45f0f98f0046243039e4d85cf57689d`. Its lock identity is commit `ac19ea60b6cd8b4fff3e5413b111925b7ef78485`, lock SHA-256 `a5a5dc7c8683e6a53e35532b974c6b98792c72ef3c2d7b757aac87839b8c5b54`.

I independently checked the receipt hash, complete archive SHA-512 SRI for all three archives against the receipt, and all five member byte counts/SHA-256 values. The receipt attributes the quiet-machine comparisons to the earlier collector; those comparisons were not repeated remotely by this reviewer. This establishes source identity, not installation, ABI compatibility or successful execution.

| Locked archive | Bytes | Exact public registry URL |
|---|---:|---|
| onnxruntime-node 1.24.3 | 85,987,774 | `https://registry.npmjs.org/onnxruntime-node/-/onnxruntime-node-1.24.3.tgz` |
| esbuild 0.25.12 | 30,947 | `https://registry.npmjs.org/esbuild/-/esbuild-0.25.12.tgz` |
| phonemizer 1.2.1 | 1,369,002 | `https://registry.npmjs.org/phonemizer/-/phonemizer-1.2.1.tgz` |

| Exact archive member | Bytes | SHA-256 |
|---|---:|---|
| `package/script/install-utils.js` (ORT) | 9,726 | `b8890f3eb40b50b5e4ca61d6b6b328d017660319ee326ca3db00709de1218579` |
| `package/script/install-metadata.js` (ORT) | 1,788 | `2cfbb2fcf1f170d5da564c0be3222821050bcbd282c9e0493e9433649ac2f130` |
| `package/bin/esbuild` | 9,351 | `3d1037d9a128440856daec17f4358ebb465b73823858a88a5fe1ce702cc17944` |
| `package/lib/main.js` (esbuild) | 88,706 | `0d1241812c443111d39475dfc66836003e9ef8b87e54d990dd67df29d20010e1` |
| `package/dist/phonemizer.cjs` | 1,322,383 | `24d24f118e44dc60af797881617415be24d84de53c1fc1a8f7f9974ab52531cc` |

The four mode-0644 members were read as verified regular data copies. The mode-0755 esbuild shim was read directly in memory using Python standard-library `tarfile`, selecting only the exact regular member `package/bin/esbuild`; no executable member was extracted or written, and no member was evaluated. No `extractall` was used.

Binding planning authority remains `Brain.POSITION-PROMPT-COPY-1.PP2-minimal-activation.2026-11-02.md` (actual message `exec-1e9fddd5-f091-4230-8dec-7c6e24e54d16`): minimal required activation, Sharp prebuilt-only, ORT CPU-only, exact esbuild optional binary or HOLD, and bounded Electron preparation before full tests. This investigation grants none of those future actions.

## Read scope and limits

- Read both ORT files and the entire 9,351-byte esbuild shim as text.
- Read/hash the complete esbuild main file as data and inspected its binary resolution, Node initialization, service/worker, sync API and temporary-file effects. Relevant sections include lines 1596–1786, 1787–1875 and 1972–2242, plus transform temporary-file handling at 735–777. This is a targeted effect review, not a semantic audit of every bundler/protocol/plugin function.
- Hash/scanned the complete ASCII phonemizer bundle as data. Semantic context review covered zero-based half-open byte ranges `[0,3715)`, `[622500,624700)`, `[1262300,1264000)`, `[1285700,1288200)`, `[1289500,1292700)`, `[1301000,1305500)`, `[1310000,1311500)`, the final 1,600 bytes, and immediate surrounding contexts for the large data strings below. The generated program and its embedded data were not fully semantically audited or executed/decompressed. Byte offsets equal character offsets because the body is ASCII.

## ORT: Windows CPU installer route is now source-backed

`install-metadata.js` declares empty default requirements for both `win32/x64` and `win32/arm64`. The only nonempty default requirement in this file is Linux x64 CUDA 12. Its explicit file manifest contains the Linux CUDA `.so` files; it is not a Windows CPU runtime-file manifest.

Together with the previously read `script/install.js`, the ordinary Windows default selection therefore has no supplemental package requirement to download. This supports Brain's CPU-only direction; it does not prove that the native loader or CPU binary is present and usable. The separate actual loader/native-file proof remains necessary.

The installer utilities are capable of much broader effects if invoked: HTTPS feed/index/package requests, NuGet URL resolution, a generated `os.tmpdir()` directory, ZIP extraction of selected members, copies to installation targets and recursive removal of that generated temporary directory. Deprecated CUDA selection can call `nvcc --version`. These are defined capabilities, not approved PP2 work. The installer entry also bootstraps its proxy helper before its skip logic, so an environment skip flag is not a substitute for omitting an unneeded installer.

`install-metadata.js` requires `./install-metadata-versions.js`, whose body is not included here. Because the selected prospective Windows CPU recipe omits the supplemental installer, its feed-version source and the unused proxy/NuGet closure need not be couriered merely to replay an omitted hook. If Brain instead requires invoking that hook, its startup closure must be resolved first; this audit does not silently authorize it.

## esbuild: exact binary, subprocess and temporary-file boundaries

The shim selects `@esbuild/win32-x64/esbuild.exe` on ordinary Windows x64. It also contains an `ESBUILD_BINARY_PATH` override, an installer-produced downloaded-binary path and a PnP ZIP-to-cache copy/chmod branch. The approved route requires the actual locked optional Windows binary and its identity; it must not fall back to these alternatives after a missing-input failure. Ordinary npm installation does not require the PnP cache branch.

The shim forwards all arguments through `execFileSync` to the selected native binary with inherited stdio. `--version` is not a harmless JavaScript-only branch: the real native tool handles it. This is not an Electron application launch, but it is still a native child operation requiring an explicit future fence.

The Node API imports built-in modules and reads environment/current working directory during import. On an ordinary main-thread import it does not immediately start the service. Calling asynchronous build/context/transform APIs or `initialize()` starts the selected binary with `--service=0.25.12 --ping`, piped stdin/stdout and inherited stderr. The service has stop/ref/unref handling; stop destroys the pipes and kills the child.

Synchronous APIs can lazily start an internal Node worker thread, which in turn starts that native service. Without that route they invoke the native service through `execFileSync`, using an input protocol buffer and a default 16 MiB max buffer (environment-adjustable). A Vitest single-worker flag consequently does not establish a single-process or zero-tool-worker execution claim. D1/V must account for the actual esbuild tool child and any internal worker; no unruled worker environment override is proposed here.

Large transform input (over 1 MiB) may use generated `os.tmpdir()/esbuild-<random hex>` files. Returned code/map files are read and unlinked through sync/async helpers. Fresh owned process-local TEMP/TMP confinement therefore matters even when the intended command is a renderer build. These are library-owned scratch operations, not permission to remove previous PP1 inputs, dependency trees or evidence.

## phonemizer: eager initialization, embedded data and dormant network code

This CommonJS bundle is not import-inert. Its Node startup registers `uncaughtException` and `unhandledRejection` handlers. It begins asynchronous initialization, decodes embedded base64 data, uses `Blob`, `DecompressionStream("gzip")` and typed arrays, populates an in-memory eSpeak filesystem, initializes the translated engine and prepares the voice list used by its public API.

The reviewed initialization uses a JavaScript implementation of the module/instance/memory interface and embedded translated engine code. No external `.wasm` filename or eager WASM fetch was found in the reviewed route. This is source evidence about this exact body, not proof that every generated engine path is correct or that Node 24 executes it successfully.

Large quoted data spans were treated as opaque data, not omitted silently:

| Byte span, including quotes | Bytes | Span SHA-256 | Role observed in surrounding code |
|---|---:|---|---|
| `[3715,606749)` | 603,034 | `6b7f4e0dfa50cf33ba7d9d29f8cf86496672e5922027d6ecbb0d11c3c76e1413` | Base64 gzip eSpeak data; decoded into an ArrayBuffer and copied to virtual files |
| `[1060910,1120220)` | 59,310 | `0f3ce37663619f7bc757cc525cc7b4e2c12f7d73805b33d9169213e2faa8960f` | Embedded translated-engine memory data |
| `[1120374,1168048)` | 47,674 | `e9f5f75f69f181cbfde7838dd41d04091681f13ca2c22f6ddc14ae4a65cfefec` | Embedded translated-engine memory data |
| `[1170762,1183952)` | 13,190 | `c1971f53484c0ac53e16d0cfafd3825e0a784098962e29883d152b7c678e9343` | Embedded translated-engine memory data |

Paths such as `/usr/share/espeak-ng-data`, `/tmp`, `/home`, `/dev` and `/proc` are virtual filesystem paths in the reviewed initialization, not evidence of writes to corresponding host paths. The IPA operation creates, reads and unlinks a generated virtual temporary file. The package's `remote_package_size` metadata labels embedded package data; that label alone does not mean a remote download.

There is dormant XMLHttpRequest-based lazy-file code, including HEAD/GET and range-request handling, guarded for a worker/browser environment. No eager invocation was found in the reviewed startup. Consequently the defensible finding is "embedded initialization with a dormant network-capable helper," not "no network code." A whole-body lexical scan found no `require`, `fetch`, HTTP URL, `child_process`, `NODEFS`, `WORKERFS` or `WebAssembly` spelling; lexical absence is not a proof of all reachable effects.

This closes the specific missing phonemizer body question at the stated review depth. It does not justify a multi-megabyte transitive ML audit or a phonemizer execution probe during planning. Brain can decide whether this exact locked route plus existing qualified receipts is sufficient for the prospective Node test preparation, with actual initialization effects retained in its admitted fence.

## Narrow remaining inputs and decisions

1. Read the already identified `node_modules/@electron/get/dist/index.js` body. Follow only its actual bounded downloader/cache/checksum/extractor startup seams. The Electron index's missing-binary auto-download path must be resolved before V; no test-run discovery or Electron app/CLI launch is permitted.
2. Recover the already copied `node_modules/onnxruntime-node/package.json` and `node_modules/sharp/package.json` fields (`main`, `exports`, dependencies/optional dependencies) and the already copied Electron extractor package metadata. Use those actual fields to name their precise loader bodies and required Windows native/prebuilt files. Do not guess a main filename or repeat a broad live package walk. The extractor's exact identity/entry must come from the existing projection or actual `@electron/get`/Electron installer chain.
3. Obtain exact host readback for the selected ORT CPU native files, Sharp prebuilt package/native loader files and locked esbuild optional Windows executable. The present source files do not prove any of these are installed. Missing files mean HOLD, not a fallback downloader, source build, CUDA activation, shared-dependency copy or arbitrary rebuild.
4. Compile Brain's final D1 argv/environment/network/write/child fence from those actual inputs: include esbuild native version/service and owned temporary files, bounded Electron download/extraction, and the original root ORT patch outcome checks. Preserve the approved omission of unrelated hooks and the original PP1 partial dependency tree. No new dependency-preparation budget is supplied by this audit.

The earlier five missing body inputs are now available and examined within the explicit limits above. The next body is the exact Electron downloader entry, followed only by filenames resolved from actual existing metadata/code. No blanket ML-bundle closure, unused patch-package startup closure or unused ORT supplemental-feed closure is requested.

## Disposition

Static identity and bounded source-effect investigation complete for the five selected bodies. PP2 remains **PREPARED / HELD**, with actual loader/native/dependency custody, final bounded activation recipe, independent reviews, publication and separate admissions still required. No Ready, package, native, owner acceptance, merge or whole-item completion claim is made.
