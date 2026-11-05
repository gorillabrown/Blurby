# BLURBY-BUSINESS-1 — HB6 task3-W held component assessment

Date2026-11-02; execution timestamps below are2026-11-03 UTC. **Independent static assessment: PASS; no concrete W contract/source defect found.** Recommendation: retain the published, Brain-accepted mocked window component as a held source checkpoint. This is not manual dispatch closeout, real Business activation, whole HB-6/D1–D21 acceptance or a new successor admission. Brain alone coordinates execution; Root owns canonical governance.

## Evidence actually inspected

Read the complete window module, constants, new test, epic state and journal from actual local Git objects at:

- W checkpoint `a5d22ea7307c84e87e672f4d7749dbd1a0115acc`, tree `7ae79d5dd92c121a8bb50b2f0a761bcc84476764`.
- Its sole parent, red-test checkpoint `8d5c244f8245aeb48c740c299cdc8e35e69ba616`, tree `49bee28899b5574ef7e8288f1423a21b22ca6566`.
- Red-test checkpoint's sole parent, accepted R `cc7e0018c66186d4a71041b62b7f5c1b14fa1bb2` (accepted R tree `a5102932b37ca8f818da96bc150368f426ddd5f3`).

This ancestry and object/tree identity were independently read with standard read-only Git commands. Root reports fetching the actual source and verifying remote equality to W; this reviewer made no fetch/push, remote probe, worktree/index/ref change or independent remote-custody claim.

Read the full frozen draft and ruling from `7974da43d2b399ab57dfcb48b66d68bec4080887`, and the consumed readiness pointer carrying the explicit0176 parallel-review amendment. Independently recomputed raw immutable input hashes:

| Contract input | Commit | SHA256 |
|---|---|---|
| Draft.BLURBY-BUSINESS-1.HB6-T3-W.2026-11-02.md | 7974da43d2b399ab57dfcb48b66d68bec4080887 | 378ee3d32ceeb378b2145dda0a659aa43edc6cd370de7a7ec8b541070385310b |
| Brain.BLURBY-BUSINESS-1.HB6-T3-W.2026-11-02.md | same7974 commit | d6f2211d6177d3dd59f30cc5c7a0f924c31084ffcda2f60ff034bc0adfd07264 |
| Brain.PARALLEL-REVIEW-20261102.md | 0176f5ad8548ff8936508accce43e92643fd64c0 | c76ec6e7e29b647a3ba428565a40950502ec3222eda37f64383be9bb518ac022 |

The0176 amendment explicitly changes independent review reading to concurrent inspection of the SAME frozen candidate; compliance PASS is consumed first, quality accepted only afterward on identical bytes, then Marcus/docs/Git. It does not waive either review or enlarge source scope/allowance.

## Exact Git fence and raw blobs

The cumulative R→W diff is exactly FIVE paths below. R→red adds ONLY `tests/businessWindow.test.js`. Red→W changes exactly FOUR paths: window, constants, state and journal. The test's raw bytes are identical red→W, so no oracle change is hidden in the production checkpoint.

| Cumulative path | W Git blob | Raw bytes | Raw SHA256 |
|---|---|---:|---|
| main/business/window.js | aec3647067ef193693384f0e012959d838f11fdd | 5516 | 4f4f30f5ea2f5f898cd366ab5629510fe982dcf777b3ec680d9363c7c298e1d6 |
| main/constants.js | e15a022787da574e39379092679c7fc159a7e356 | 14900 | c77bc473d98194ed19f8d46f22eee830067e3a426cc834699419f7809ef05aec |
| tests/businessWindow.test.js | 532334cbb324235831f871a6d579bcb6adf21e6e | 24797 | 2eeca601495973e238f7678bf0bf2861b4a3d7205824fe40c23104f42c6b133b |
| docs/planning/epics/2026-10-30-blurby-business/state.md | ec196aec39428b6fef492982f61dd4ce0acd2cd9 | 14446 | 4bde9be5fe60f04a6505dc981f2543af3d02e9623d136bf3889073e7b8f28e88 |
| docs/planning/epics/2026-10-30-blurby-business/journal.md | 9588a03737c930e0a1c50da21f13cc113e7fab07 | 19345 | d0362c80e55a36523b7eebe1efada8bda7fff1a9a0440d3696bd2e92e67c4e77 |

Constants are exactly R bytes plus `const BUSINESS_PARTITION = "persist:blurby-business";` and its export insertion. This was independently checked as exact raw-byte reconstruction of those two insertions, not merely a two-line diffstat. R's existing constants and all other constant bytes remain intact. The old R journal is an exact raw prefix of W journal; W adds entries rather than rewriting history.

The cumulative fence shows no tracked change to the existing window manager, launchers, IPC/preload/renderer/assets, package/lock, R implementation/tests or frozen packet/fixture paths. Additional independent raw preservation witnesses (equal R→W):

| Path | SHA256 |
|---|---|
| main/business/recent.js | 22761ecb0ae0d7addc8d4f14bc64e8035e1d0ba5bf98748ea5dd2e80313eb6dc |
| tests/businessRecent.test.js | 04071db70ad2dd96f57eafc2ac403bbfcece2c41cf1a6c6d7ed6264f445161da |
| main/window-manager.js | 5e2eb213c0d1aaa2d6fa9bdc91f8f3441be85a5b12eeb2d30100f2f13462472c |
| main/json-store.js | 7267157d1e6b21046a43a19e4d881b0f94a1cf3e85957e94d9be4322db4b7e58 |
| scripts/business-smoke/make-fixtures.mjs | 164943421fe6b9e8bdaa03b3ff68daee0ee9ec1b24594543a1e1ad0bb8e821a6 |
| tests/fixtures/business/report.pdf | b587c05f21a419b8af6860cc1d7d73f26f35b0fb5bc74d304ff3275995acdcdb |
| docs/planning/epics/2026-10-30-blurby-business/charter.md | 9ad1f08e85e7bb7db50cd222f3a30f96b6ea1b36b9fefb3f13b5af89057fefbb |

These are committed-object comparisons. They do not independently attest the remote working tree's untracked retained temp or unstaged performance output.

## Static specification compliance and quality

CommonJS exports are exactly `{ createBusinessWindow, getBusinessWindow }`. Import initializes only private state/requires and does not call create/session/timers/processes. The module remains unregistered: no launcher/IPC/other integration change exists in the cumulative fence. It reuses the unchanged window-manager's `getThemeColors(settings)`; it does not call that module's default-session CSP installer.

The create API validates boolean mode and app readiness before construction/session work, retains one pending creation, reuses/restores/shows/focuses a live instance, and fixes the first configured session mode across close/failure. The getter returns only a live current instance. Ownership/ready/close/denial handlers attach before the configured load. Matching-instance guards prevent old callbacks from clearing/showing newer windows. Close during load rejects its branded error; load rejection preserves the original error, clears only matching state and destroys only that owned live window. Settled old load handlers return without retrying or harming the next instance. No automatic retry or unobserved underlying load rejection is introduced by the visible Promise chain.

Constructor dimensions/theme/titlebar/icon match the existing contract, with title Blurby Business/show:false. Security preferences are exact: absolute preload-business.js, contextIsolation:true, nodeIntegration:false, sandbox:true, webviewTag:false, dedicated partition and webSecurity:true. Production loads repository-root dist/business.html; dev loads exactly http://localhost:5173/business.html. No placeholder/index/remote fallback is present. Static review does not establish those real assets exist or work.

The exact production CSP is:

```text
default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data: blob:; connect-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'none'; frame-src 'none'
```

Dev adds ONLY script unsafe-inline and connect ws://localhost:5173. Session configuration uses only `session.fromPartition(BUSINESS_PARTITION)` once after success, removes all case variants of CSP headers while preserving others, and inserts one canonical policy array/callback. Download, permission request/check, navigation, redirects, popups and webview attachment are denied through the prescribed callbacks. There is no shell external call/defaultSession access in Business source. The unchanged existing default-production CSP has its own independent mocked regression.

The code is narrow and ownership state is explicit. No concrete defect was found against the bounded W contract. Mock callback/state reasoning is not a Chromium enforcement, preload compatibility, worker/WASM, platform-titlebar/native lifecycle or real-window qualification.

## Sixteen controls and four opposing detectors inspected

Read all of the unchanged committed test; the following are static observations of its actual assertions, not locally executed results:

| Control | Actual covered mechanism |
|---|---|
| w01 | Import/getter null; no app readiness/session/default session/constructor/load/timer/process effects. |
| w02 | Not-ready and nonboolean refusal before session/window; default production and explicit dev positive cases. |
| w03 | Exact constructor/security options, prod path and handler-before-load registration; getter/return ownership. |
| w04 | Fresh prod/dev harnesses, exact routes/full policy literals and only approved policy deltas. |
| w05 | Two pending callers, one constructor/load/session registration, no early settlement; same resolved instance. |
| w06 | Minimized restore/show/focus; nonminimized omission of restore; no new constructor/load/registration. |
| w07 | Current ready event shows; replayed old ready callback cannot show closed/replacement instances. |
| w08 | Matching close clears; fresh explicit create; stale closed callback cannot clear newer instance. |
| w09 | Close while loading, branded rejection and later explicit create; old load resolve AND reject tested without harming newer instance. |
| w10 | Original chosen load Error identity, owned-only single destruction, later explicit retry and already-closed case. |
| w11 | Both mode directions refused during pending/closed/failed states, unchanged effect counters/policy registration. |
| w12 | Exact partition/once-only registrations, mixed-case CSP removal, preserved original input/non-CSP header; retry/reopen. |
| w13 | Explicit navigation/redirect/webview callbacks prevent once, popup deny for independent URLs, no shell/extra load. |
| w14 | Download and permissions deny for independent inputs, callback false once, default session untouched. |
| w15 | Separate existing-manager mocked installer produces exact unchanged default-production CSP. |
| w16 | Module._load and exact cache entry/absence restored after success AND deliberate failure; fresh later harness. |

Harnesses use controlled deferred Promises and EventEmitter windows/contents, an Electron Module._load interception, observed load rejections, exact cache restoration and finally/afterEach cleanup. No real Electron import is delegated by the interception. The same assertions reject four deliberately wrong test-local observations: sandbox:false via assertOptions/w03; stale current instance via assertCurrent/w08; leftover mixed-case CSP via assertHeaders/w12; unprevented navigation via assertDenied/w13. Each wrong observation must throw inside its passing group, followed by the real source observation. No production negative switch or oracle mutation is used.

## Brain-accepted execution and separate Git closure — attributed

Root reports reading Brain's complete actual source acceptance and separate Git-closeout acceptance. This reviewer did not rerun commands, read remote receipt bytes, inspect remote locks/TEMP/custody or verify console delivery. The following remain explicitly attributed to Brain's accepted receipts and Root's actual acceptance read:

- W source receipt SHA256 `0ce08a2dc589b1c2d0c970235b2dfd449f1aa0f93a11d399be414eb8df999830`, CLOSED40/40 aggregate calls,01:29:29→01:44:25.748Z. All16 controls collected; base-red15 intended missing-module assertion failures plus the existing default-CSP w15 PASS. Candidate green16/16, four sensitive assertion-throws in those passed groups, and both Node syntax checks passed. No individual opposing console-line delivery is claimed.
- Accepted command scope was the frozen single-worker `node ./node_modules/vitest/vitest.mjs run tests/businessWindow.test.js --maxWorkers=1`, plus `node --check main/business/window.js` and `node --check main/constants.js`, on qualified quiet-host inputs with process-local2GiB JavaScript heap and owned TEMP/TMP. Exact runtime command/cwd/identity/exit/timing evidence belongs to the remote receipt; this memo's Git reads are not a rerun.
- Solon compliance and Plato quality read the same frozen candidate concurrently under0176. Initial compliance WITH_CONCERNS concerned truncated display; the additional scoped read completed controls and APPROVED. Plato READY was accepted after compliance on identical bytes, then Marcus documents. The pre-child identifier-only driver guard failure remains preserved and ran no child before correction. No source/test repair or test rerun followed the qualified evidence.
- At the source cap there was NO final source commit: checkpoint bookkeeping counted known pre-existing perf dirt despite its unchanged hash, producing a preserved bookkeeping HOLD. This was not a newly found source/test defect or permission to clean work.
- Separate W-GIT-CLOSEOUT-20261102 receipt SHA256 `ebc2e713a6aed96fa5b5b456deeb28f336e8a51928575bd8009d2535e7660587`, CLOSED13/18 calls,01:54:31→01:57:42.163123Z. Parent acceptance SHA256 `c279c4c5ffafec360111a4ed5cb4dc51958e224da8b375f7810d486f99565863`. It performed accurate exact staging/docs/checkpoint/ref push/readback without retest or source/test change. The two clocks remain separate closed admissions, not a borrowed source allowance.
- Known excluded unstaged performance output SHA256 `4834fca0f41d7c89b83fa02677a9f23ac77cdebb3b14c8ad59ef16cdeebf3208` and retained untracked PDF temp SHA256 `b587c05f21a419b8af6860cc1d7d73f26f35b0fb5bc74d304ff3275995acdcdb` were preserved. Their actual remote state/hash/namespace facts are receipt evidence, not this committed-object comparison.

Committed state/journal intentionally preserve the source-wave pending-Git outcome and separate Git-admission entry, deferring actual publication identity to the external closeout receipt. This memo now binds the actual inspected commit/tree; it does not rewrite those contemporaneous historical records or infer whole-epic completion from them.

## Remaining holds and non-claims

W is a published, accepted **mocked component source checkpoint only**. Main-process package files changed, so package qualification is HELD; “package unchanged” does not apply. Real Business creation remains behind Task4 primary-window retarget, complete I/typed IPC/preload/quit bridge, renderer/preload/assets, actual scratch custody and separately admitted native/package/owner qualification. No actual Business session/window/profile, dependency installation, fixture regeneration, full-suite rerun, typecheck, UI build, native/ARM64 package or main merge is evidenced by W.

HB-6, phase completion and D1–D21 remain unmet; no terminal/provider/Seq/status update or automatic successor follows. Existing charter, Stage8/source prerequisites, architecture/package/owner gates remain. This assessment authored only this new memo using read-only Git/file inspection and raw hashing. No production/test import, test/syntax/app/probe execution, source edit, Git mutation, helper/provider mutation or executor contact occurred.
