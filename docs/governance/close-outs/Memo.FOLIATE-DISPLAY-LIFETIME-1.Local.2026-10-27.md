# FOLIATE-DISPLAY-LIFETIME-1 local execution receipt — in progress

Local execution owner: `01a17dcd-3e4d-7161-bb2f-d8c273de5afb`.
Parent: `01a0cf7f-62f6-7450-abc9-5bb2750923f4`; independent reviewer: `01a17dce-1533-7d32-9532-c6a5b0123fb0`.
Worktree: `C:/Projects/Blurby/.worktrees/foliate-display-lifetime-20261027`.
Branch: `eb/foliate-display-lifetime-1`.

## Entry

Preserved original report-only cloud tip `161172823c1c0840ac3ada4bf4873582f00d6f68` and merged approved protocol/admission `f299675dd8251e550f06ab47abb7c4b6ff1889f2`, then fresh local admission `d3f8dd42598e9868370cdb13ad3c9b4827bffbd6`. Source remains held combined `4c9724e60cd6bbab79ad78b0f11b25f78ad31ab7`; approved main/origin-main `85e6e5aaedccb0501c529dbc9f739e50a0689fd7`.

Immutable specification SHA256 `5407201dae92574bb0655e7b9ec2f89334d4d1967edfc8532c81e277b15ded1d` and independent review SHA256 `e00d0bae3281b0ecd7cf048789dedddbcb669d8d38365197a852665a2e87b823` verified from the published handoff. Parent confirmed fresh provider revision `4f7447a3a886db221d7835945617e2acc91e6bcf012ad405c7be165a9040b3b8`, In Flight/local owner, 194 items and nine Queued Full Spec items. Parent supplied source-entry GO after local metadata integration.

Read-only Virtuoso preflight: zero writes, registry usable; missing generated board in isolated checkout and legacy lanes alias warning. No registry repair performed.

## Baseline evidence

Raw logs are preserved in this worktree (ignored `.log` files):

- `npm-ci-local-20261027.log`: ordinary `npm ci`, root postinstall/patch-package applies `foliate-js@1.0.1` and ONNX patch; exit 0, 658 packages installed. Node 24.14.0/npm 11.9.0/native arm64.
- `baseline-typecheck-local-20261027.log`: exit 0.
- `baseline-build-local-20261027.log`: exit 0, original paginator bundle `paginator-DVT_4TtX.js`.
- `baseline-test-local-20261027.log`: preserved initial FAIL, 181 suites pass and two fail before tests due to concurrent lazy Electron download/extraction (`default_app.asar`/`libEGL.dll` already exist). This is not a source regression or green baseline.
- `baseline-test-second-local-20261027.log`: one justified rerun after ordinary package's lazy binary installation completed. PASS 183 files, 2471 tests passed, two skipped, zero failed, 23.33 seconds. No deletion, installed-module edit, environment override or dependency graph change.

The test suite generated `tests/perf-baseline-results.json`; it is preserved unstaged and excluded from corrective staging.

## Timing infrastructure side effect

Opening this item's timing log through the shipped Virtuoso helper automatically cost-backfilled ten historical timing logs and `docs/governance/Change.Ledger.jsonl` in this isolated tree. This was unexpected outside the item-owned write fence. Parent was notified and explicitly directed preservation unstaged, exclusion from exact source commit, and no reset/revert/delete or further helper backfill. Primary checkout remains untouched. New own timing log contains prospective rows; it is not evidence those tasks ran. No fabricated start/end times are supplied.

## Detector development and current boundary

`tests/foliateViewReadiness.test.js` exposes actual unchanged installed View/helper source. Geometry/observer infrastructure is shimmed, layout algorithms are not replaced. First detector version records two intended base loading/no-body failures (scrolled and columnized), eleven active/malformed/absent controls pass. Native same-document continuation after the failing assertion remains unexecuted on that base run; no recovery pass claimed. Final detector must still run on base and candidate with exact IDs/raw logs.

`tests/foliateDisplayLifetime.test.js` evaluates the complete actual Paginator module with only export syntax removed, and uses public navigation and real event-listener continuations. Initial harness fails because jsdom does not initialize iframe browsing contexts inside the production closed shadow root (`contentDocument === null`). These are harness errors, not counted as base-red evidence. Raw `lifetime-base-first-local-20261027.log` retains all errors and unhandled rejections. No corrective dependency patch change has occurred.

The precise limitation and proposed minimal iframe constructor DOM shim were sent to Blurby.Brain and parent. Adaptation/source work waits on technical ruling. Repair passes used: zero. Independent source review, final controls/full suite/build/typecheck and package qualification remain outstanding.

## Package verification

NOT RUN. No app launch or desktop custody granted. Existing package remains WITHHOLD. All native exact-candidate routes, main/process/profile/ARM64/isPackaged proofs, dist/ASAR/source/fixture parity, full errors/rejections/dumps, shutdown and Brain confirmation remain required.

Normal library/settings and normal sync-queue require read-only metadata/hash preservation before/after future launches. No queue payload inspection, reset, restore or writer-attribution inference is authorized. The visibility fixture is the owned **91-WORD EPUB fixture**; the cloud report's “91-book” wording is incorrect. Four independent reading modes and both existing disconnects remain mandatory.

No main merge, freeze lift, release, installation/distribution or terminal completion is claimed or authorized.

## Source-stage update — 2026-10-27, supersedes initial detector-development status above

Brain approved the per-iframe constructor accommodation: each actual iframe gets a dedicated real jsdom Document/Window; its actual EventTarget/listener registration and all production View/Paginator methods execute. Realms are closed after error/rejection checks and controlled task/RAF/font settlement. Initial shadow-iframe failure is preserved as a harness failure, never base-red evidence. Synthetic DOM load-event delivery is not native Chromium loading, layout or timing evidence.

Brain's later scroll clarification adds a separate per-Paginator anchor-intent generation. Public anchor calls issue it synchronously; display-owned anchor work captures it before function-anchor evaluation; internal chaining does not self-invalidate. Expansion captures the currently applicable token and retained View. Ordinary public next/prev/snap animation behavior is preserved. The approved test-only facade is exactly `__testScroll(...args) { return this.#scrollTo(...args) }`: a one-call forwarder inserted only into the evaluated test class, identical on base and candidate. It exercises the real private animation with controlled RAF timestamps; it never ships or changes the dependency API. Normal public navigation and token composition are tested separately.

The dependency patch now implements distinct display currentness, retained-View liveness and anchor intent; pending load cancellation; permanent successful load outcomes; same-View pending-load adoption; captured style/font/RAF ownership; guarded overlay dispatch/deferred attachment; guarded anchor/scroll/focus; and idempotent captured-only disposal. Both observer disconnects remain. No helper-layout algorithm, sibling runtime, main-process file, setting/schema, package/version/lock/graph/build change.

Final detector inputs are recorded in `Receipt.FOLIATE-DISPLAY-LIFETIME-1.Portable.2026-10-27.json` with raw logs. Candidate **51/51 PASS**, zero extra errors. Identical final detector on actual original installed base: **35 behavior assertion failures and 16 passing active/opposite controls**, plus **four additional actual old-production font callbacks dereferencing null `#view.expand`**. Those extra rejections are recorded separately and never counted as additional valid red cases. Prior serializer-error runs remain failures; final accepted-input logs have no serializer/opaque-origin/setup error counted as red.

The final full suite passes **185 files; 2,522 tests passed, two skipped, zero failed**. Typecheck and build exit 0. Built paginator is `paginator-CJN_w8Zg.js`. Tests print original production and detector hashes. The baseline source SHA256 is `7845a3faaddcffeccea1de5e0a846b1bbd2f192be688e0e31c6bcb5531389dbe`; installed candidate SHA256 is `a2dc11ade7c5e5980ebf11db3edda5aaa0673b0672c0a2563c3410ded735d43b`.

Replacement-reentry rows start actual public navigation from synchronous callbacks, then prove retirement after the subsequent public-navigation microtask establishes replacement. They do **not** claim synchronous replacement before `goTo`'s initial await. Separate actual synchronous-close controls cover those immediate callback boundaries. The initial public snap fixture targeted an invalid previous-section edge and emitted a preserved production `undefined.load` rejection; the positive control was corrected to an interior snap. No source repair or algorithm change was made for that out-of-scope edge.

One implementation pass and Brain's separately approved anchor-intent clarification were applied through patch generation plus ordinary clean npm ci/postinstall. Candidate failures due to incomplete fixture root creation, incorrect geometry expectation and DOM-graph assertion serialization are preserved as test-development failures, not application-red proofs. No retry-until-green package run has occurred.

### Governance fold-in intent for parent

Target: AGENTS.md / TECHNICAL_REFERENCE.md, relevant Foliate lifecycle description. After accepted integration, describe per-instance display, retained View and anchor-intent ownership in the dependency patch; four mode runtimes remain independent. Do not mark package/release acceptance from portable tests.

Target: LESSONS_LEARNED.md, append a provisionally unnumbered observation: operation currentness and retained resource lifetime are different authorities. A newer same-View anchor must cancel obsolete publication/scroll/focus while preserving native load/font/resize work; cancel only pending loads, never rewrite fulfilled outcomes. Evidence: this item's exact patch, 51-case identical base/candidate detector and future required native receipts. Parent assigns any lesson number against the current catalog.

Target: ROADMAP.md / live register: keep this item In Flight and package WITHHOLD until all native routes and Brain's exact-package confirmation/separate integration go. No completion marker or terminal write is justified at this source stage.

### Remaining qualification

Independent reviewer reports no material static source/spec/quality finding; final hash-bound verdict and exact staged/commit inspection remain pending. Native package verification is **NOT RUN**. Parent retains desktop scheduling; no app has been launched by this chat. All original native routes and custody/profile/sync-queue/provenance gates remain required.

### Publication byte gate — caught before commit

The initial exact-path stage exposed `text=auto`/`eol=lf` normalization in the owned lifetime test and receipt. A premature message claiming all five staged blobs matched raw bytes was immediately corrected to reviewer and parent; the actual check had stopped at the first mismatch. No commit or launch occurred. Original raw files were preserved under `C:/Projects/Blurby-artifacts/foliate-display-lifetime-20261027/source-pre-lf/`. Parent explicitly authorized LF-only correction within the owned test/receipt fence. No attributes, unrelated file, algorithm or policy changed.

The canonical LF lifetime test SHA256 is `742bf47d586488a6b3cf482dc4a7d8aa027e0d442737f5df068c47b19fcc944f`; R1 remains `aa174c378c6490fdc8b3afe6458e6157e2433362d099233150121bb804a17623`. Both LF-publication detector logs print those identical exact inputs: candidate51 PASS, base35 behavior assertion failures/16 PASS plus four separately recorded old-production null-expand rejections. Full suite reran on canonical LF files; the portable receipt preserves both evidence generations. Commit still requires renewed reviewer LF-hash and all-five raw/staged-blob readback. Desktop reservation is conditional on that gate, final source commit and package preflight.
