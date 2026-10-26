# Visibility + observer combined verification — build and hold

Source candidate: `aa5f1485eb023ca232b5a8f8234ad6fdea51f2bb`, branch `eb/visibility-observer-verification-20261026`. Admission was committed first as `486b3a72`; exact visibility successor `a8e31b7363da5c8dd1d8d059915081195d3cc3b6` and observer tip `5175927659228e2cf9c87cc74210e6d943371b41` merged without production conflicts. Primary checkout and original branches were preserved. Native managed worktree creation had failed against the absent old project path; the admission permits the verified ignored Git-worktree fallback.

**Overall clean-package decision: WITHHOLD.** The approved observer patch clears the full original loop route and the completed-book package route, but the independent four-mode route logs one non-enumerated `Cannot destructure property 'style' of 'r' as it is null` exception. This fails standing rule 53. No error waiver, mode repair, teardown-order change, main merge, terminal completion, installation or release is included.

## Source and automated checks

Application delta is exactly the existing LibraryView upper-bound removal, the existing two observer disconnects in `patches/foliate-js+1.0.1.patch`, and the two named regression tests. Current BUG_REPORT text was retained with the observer branch's existing BUG-187 status-line change. Package manifests, lockfile, runtime modes, ReaderContainer and types are unchanged. BUG-187 had documented packaged reproduction on 2026-10-23; this run is a verification window, not its discovery.

Fresh normal `npm ci` and `npx patch-package` both exit 0, with no dependency junction or installed-module hand edits. An actual unpatched installed-file control from the preserved visibility worktree finds both destroy methods without disconnect; `observer-base-control.json` records both expected failures. This is a direct installed-file assertion control, not a newly executed Vitest red run. The accepted original observer test history already contains the red test commit. The installed green detector passes both tests.

- `npx vitest run tests/foliateObserverPatch.test.js tests/libraryCompletionVisibility.test.tsx tests/readerModes tests/readerModeOwnership.test.ts`: 16 files, 105 tests passed.
- `npm test`: 183 files, 2,471 passed, 2 skipped, zero failures.
- `npx tsc --noEmit`, `npm run build`, and `npx electron-builder --win --arm64 --dir --publish never`: exit 0.
- The final visibility detector's controlled base-red/candidate-green evidence remains in the original visibility memo and artifacts: 12 exact missing-card failures / 6 controls passing on original LibraryView, all 18 passing on repaired source.

## Exact package and runtime receipts

Artifact directory: `C:/Projects/Blurby-artifacts/visibility-observer-verification-20261026`.

Package: `C:/Projects/Blurby/.worktrees/visibility-observer-verification-20261026/release/win-arm64-unpacked/Blurby.exe`.

- Executable SHA256: `cdbc080ccc68b50565d0b51151082ab46e710083703f3d778951a8bfa80e5ac2`.
- ASAR SHA256: `26e7cc8bcaaa5af5dec04a298ffdf408ce8e340e1d1abaf6722afe72cbaca01e`.
- PE architecture ARM64 (`0xaa64`); all 21 renderer files match dist/ASAR, main source/override match, both compiled destroy bodies contain disconnect. See `asar-parity.json`.

Every launch verified actual executable, PID, ARM64, isPackaged and fresh scratch userData before input. Every route survived at least 25 seconds and produced no crash dumps. Normal library/settings hashes before and after each launch stayed `1921551191807bb646f3567ffef07a0bec4487aecfdb6bc224ece9fb70573d1f` and `64483188e030adf062b7516389f69f5c0835649fc6f12bcf48c1b20042badfec` respectively. No normal profile was modified.

| Receipt | Actual survival | Result |
|---|---:|---|
| `session-receipt.json`, `session-result.json` | 329,236 ms | Full original uninstrumented route passes; 0 total error-log lines, 0 RO loops, 0 style errors, no captured CDP exception events. |
| `census-receipt.json`, `census-result.json` | 60,835 ms | Separate ro-wrap Page → Focus → Flow census passes: no disconnected targets or 0x0 body targets; 0 total/RO/style errors. |
| `modes-receipt.json`, `dw5-modes.json` | 40,079 ms | All four modes render actual Foliate content. **Package fails**: 1 style error in error.log and 1 corresponding captured CDP exception; 0 RO loops. |
| `candidate-combined-package-result.json` | 26,008 ms | Owned 91-word All/Archive grid/list, actual EPUB open/return/reopen pass; no error.log or captured CDP exception events. |

Full original route action and timing assertions passed: open-to-probe 15,013 ms, INTRODUCTION-to-Focus 8,023 ms, Focus paused-to-Flow 60,032 ms, Flow playing-to-pause 180,228 ms, final pause 60,011 ms. Actual Flow word indices advanced. No ro-wrap was injected into this run. The independent census uses ro-wrap intentionally. All own processes were stopped afterward.

Initial owned-fixture display preserves the position, archive and word-count fields. Reading and exiting the 91-word fixture produces position 90/91 and archived=true under the existing completion policy. This visibility fix does not implement the separate future confirmation design or claim those post-read fixture fields are unchanged.

## Reproducibility and comparability

`comparability.json` records exact paths, hashes and recovered original launch contents. The actual original launcher is `C:/Projects/Blurby-artifacts/foliate-observer-leak-1/launch.ps1`, SHA256 `96042b414e538b41519112c92764b835c34e38e6a397e37719fce20d681a7430`. It creates a fresh UUID temporary profile and starts the package with `BLURBY_USER_DATA_DIR`; it does not seed a personal book. The original first-card Meditations and 5,293-word INTRODUCTION match this route. The original temporary profile is no longer available. Both accepted observer tip and current base track resource blob `ffa271998c636c689761ac4eb5773dca92208bf0`. This is source/provenance comparability, not recovered original packaged-byte proof.

Current actual imported fixture `session-profile/blurby-data/sample-meditations.epub` and tracked `resources/sample-meditations.epub` have identical SHA256 `8be2ab1e681bbde194ded5ba05ffcad218533fd98abfefa8a3af7d699a6c2beb`. The whole extracted book contains 80,479 words. Original unchanged `C:/Projects/Blurby-artifacts/reader-visual-diag-1/session.mjs` SHA256 is `ffeac5f30f6a71547699e3d12464e244f945355a1d7e49a4ec7daff40b290556`. Fixture paths, driver hashes, raw logs, screenshots, identity receipts and route timings are retained in the artifact directory.

The original visibility-only candidate/base raw FAIL receipts remain untouched in `C:/Projects/Blurby-artifacts/library-completion-visibility-1-20261026`. The combined four-mode style failure is preserved here. Source/regression approval and observer-loop success do not authorize clean-package acceptance or release. Parent and Brain must review the final evidence and decide further admission.

## Documentation synchronization

After all runtime receipts were captured, the parent published approved documentation-only main `85e6e5aaedccb0501c529dbc9f739e50a0689fd7`. Merge `cb8d221735ea19a1e8f03d5a91791d166176d765` brings its 93 documentation/cache/recovery paths into this branch. The sole add/add conflict was one trailing blank line in the admission document; resolution matches the published main document exactly. `docs-sync-equality.json` records complete shipping/test/patch/dependency/resource/config/script input equality to qualified source `aa5f1485`, plus unchanged executable and ASAR hashes. No runtime gates were repeated for these verified documentation-only additions. The four-mode package failure remains WITHHOLD (BUG-222); subsequent diagnosis or repair requires its own scope.
