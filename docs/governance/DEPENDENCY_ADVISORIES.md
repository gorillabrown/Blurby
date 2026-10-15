# Dependency Advisories

Base: `main` @ `8651d055` (= `origin/main`), with the lockfile written by DEPS-AUDIT-1 (`npm audit fix`, never `--force`). `npm audit` run 2026-10-14. The advisory database moves, so re-run before relying on a row.

Result after DEPS-AUDIT-1:

| Command | Before | After |
|---|---|---|
| `npm audit --omit=dev` | 25 (0 critical, 16 high, 9 moderate) | 13 (0 critical, 5 high, 8 moderate) |
| `npm audit` (all) | 53 (3 critical, 36 high, 13 moderate, 1 low) | 22 (0 critical, 9 high, 13 moderate, 0 low) |

`package.json` did not change. No direct dependency moved a major version. The Kokoro pins did not move.

## Remaining high advisories

| Package | Version | Scope | Advisories | Reached by Blurby? | Evidence | Revisit when |
|---|---|---|---|---|---|---|
| adm-zip | 0.5.18 | prod, direct | 8: GHSA-xcpc-8h2w-3j85, GHSA-7q85-xj36-vmfc, GHSA-rcw4-f5rp-g42v (allocation DoS); GHSA-vwc7-r8mq-g2x9, GHSA-j5f4-cc29-5x44, GHSA-p634-w6r4-rjp2 (extract); GHSA-c6fg-446q-cg94, GHSA-8238-w5pm-2374 (async) | Allocation DoS: not reached after this item. Extract and async: not reached. | Every entry read in `main/` goes through `main/zip-read.js` (caps: `ZIP_ENTRY_MAX_BYTES` 64 MiB, `ZIP_OPERATION_MAX_BYTES` 512 MiB; the declared size is checked first and zlib inflates with `maxOutputLength`), and no `getData`, `readAsText` or extract call remains in `main/` (`git grep` check, DEPS-AUDIT-1 Done-when 9). Tests: `tests/zipEntryCap.test.js`, `tests/zipRead.test.js`. No `extractAllTo`, `extractEntryTo` or async API is used. The cover is the only file written from an archive, at `covers/<docId><ext>` (an entry name never becomes a path). The copy under `onnxruntime-node` is install-time only (`script/install*.js`), and its win32 install metadata lists no downloads. | `onnxruntime-node` allows `adm-zip` ^0.6.1. A move to 0.6.x was rejected for this item (ruling Q1). |
| kokoro-js | 1.2.1 | prod, direct | none of its own; inherited from `@huggingface/transformers` | No | Pinned by NARRATE-REBUILD-1; the lockfile version is identical before and after (Done-when 6). 1.2.1 is the newest published. | NARRATE-REBUILD-1 closes and its pins can move. |
| @huggingface/transformers | 3.8.1 | prod | none of its own; inherited from `onnxruntime-node` and `sharp` | No | Same pin and check as kokoro-js. In Node its entry is `dist/transformers.node.cjs`, which requires only `onnxruntime-common` and `onnxruntime-node`. | NARRATE-REBUILD-1 closes. |
| onnxruntime-node | 1.24.3 | prod | inherited from `adm-zip` and `global-agent` | No (install time only) | Both are required only by `script/install.js` and `script/install-utils.js`; the runtime `dist/` loads neither. win32 x64 and arm64 list no downloads. The CPU inference path loads neither. `scripts/patch-onnxruntime.js` still applies (0 `setImmediate` in `dist/backend.js`; `tests/onnxruntime-patch.test.js`). | NARRATE-REBUILD-1 closes. |
| sharp | 0.34.5 | prod | GHSA-f88m-g3jw-g9cj (libvips), GHSA-rgj7-g3m4-5g8c (libheif), GHSA-wq5f-xc86-pv6w (librsvg) | No | transformers imports sharp for image processing only; Blurby runs text-to-speech, never an image pipeline. The packaged workers stub it when it is not found (`main/tts-worker.js`, `main/narrate/producer-worker.js`, `main/sharp-stub.js`). | NARRATE-REBUILD-1 closes. |
| patch-package | 8.0.1 | dev, install time | inherited from `find-yarn-workspace-root` | No | Runs at `postinstall` only, on patterns it builds itself, and no patch files exist (`patches/` has been gone since `238f47ec`). npm's only fix is a major downgrade to 6.0.7. Recorded and kept (ruling Q4). | The next patch is needed, or `patch-package` is removed. |
| braces | transitive | dev, install time | GHSA-vfj7-8cjw-p6xm (stack-exhaustion DoS on glob patterns) | No | Same chain as patch-package (patch-package > find-yarn-workspace-root > micromatch > braces). | With patch-package. |
| micromatch | transitive | dev, install time | inherited from `braces` | No | Same chain. | With patch-package. |
| find-yarn-workspace-root | transitive | dev, install time | inherited from `micromatch` | No | Same chain. | With patch-package. |

The `protobufjs` move (7.5.6 to 7.6.6) is inside the Kokoro subtree, under `onnxruntime-web`. It is not loaded in Node, because `transformers.node.cjs` requires neither `onnxruntime-web` nor `protobufjs`.

## Fixed by DEPS-AUDIT-1

| Package | Moved to | Scope |
|---|---|---|
| @xmldom/xmldom | 0.8.15 | prod (under mammoth, which moved to 1.13.0) |
| brace-expansion | 2.1.7 / 1.1.21 / 5.0.12 | prod |
| builder-util-runtime | 9.7.0 | prod (via electron-updater) |
| electron-updater | 6.8.9 | prod |
| form-data | 4.0.6 | prod (under jsdom) |
| js-yaml | 4.3.2 | prod (under electron-updater) |
| nanoid | 5.1.16 | prod (under docx) |
| protobufjs | 7.6.6 | prod (Kokoro subtree, not loaded) |
| tmp | 0.2.7 | prod (under exceljs) |
| undici | 7.30.0 | prod (under cheerio) |
| ws | 8.22.0 | prod (under jsdom) |
| electron | 41.10.7 | dev entry, but the shipped runtime |
| electron-builder, app-builder-lib | 26.15.3 | dev |
| concurrently | 9.2.5 | dev (was critical) |
| shell-quote | 1.12.0 | dev (was critical) |
| tar | 7.5.22 | dev (was critical) |

`electron-updater` <=6.8.8 could leak a `PRIVATE-TOKEN` or `Authorization` header on a cross-origin redirect (GHSA-p2f4-r6v6-j797). It was not exploitable here (Blurby sets no updater token or request headers) and is fixed anyway.

## Moderates left

None is reached, so no follow-up is filed (ruling Q5). If a later audit adds a reached moderate, it gets a follow-up stub.

| Package | Fix would need | Reachability |
|---|---|---|
| uuid (via @azure/msal-node, exceljs) | `@azure/msal-node` 7 or `exceljs` 3.4.0 (major) | Both call only `v4()` with no buffer. The advisory needs a caller-supplied buffer to v3, v5 or v6. |
| argparse, sprintf-js (via mammoth) | `mammoth` 0.3.29 (major downgrade) | Required only by `mammoth/bin/mammoth`, its command-line tool. |
| global-agent, roarr, sprintf-js (via onnxruntime-node, @electron/get) | none offered | `onnxruntime-node` install script only; `@electron/get` is the build-time Electron download. |
| @electron/get, app-builder-lib, dmg-builder, electron-builder, electron-builder-squirrel-windows | major (27 alpha) | Build tooling only; nothing ships in the app. |
