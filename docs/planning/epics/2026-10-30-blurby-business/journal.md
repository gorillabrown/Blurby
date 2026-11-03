# Journal — Blurby Business: a walled-off PDF viewer and editor

<!-- Append only. Never edit or delete an old entry — corrections get their own entry.
     One entry per session or work burst, newest last. Write as you go: after each
     finished item or surprising result, not just at session end. -->

## S0 — 2026-10-30 21:30 — scaffold

- **Did:** created the epic packet ([charter](charter.md), [plan](plan.md),
  [state](state.md), [launch](launch.md)) on Rodney from the roadmap item
  BLURBY-BUSINESS-1, its held storyboard, `phase1-specs.md` and the four-app matrix. No
  project work was performed.
- **Learned:** the charter accepts seven assumptions, each with a guard (RodneySr
  readiness, pdf-lib annotation fidelity, @signpdf and the certificate store, qpdf on arm64,
  partial text editing, `main` moving mid-run, Phase 1 spec drift). The preflight is in
  launch.md. RodneySr was not reachable from the scaffold machine, so its checks fall to
  the first session.
- **Git:** main @ `5d07b515` (scaffold base); the run branch `eb/blurby-business-1` is not
  created yet.
- **Next:** P1 per plan.md.

<!-- Entry template — copy for each session:

## S[N] — [YYYY-MM-DD HH:MM]

- **Did:** [what actually happened — name the things, no aggregates]
- **Learned:** [facts, surprises, dead ends worth not repeating]
- **Decisions:** [pointers to new Decision-log rows, if any]
- **Gate/DoD movement:** [status changes + evidence pointer, if any]
- **Git:** eb/blurby-business-1 @ [sha]; uncommitted: [exact paths, or none]
- **Next:** [where the following session should pick up]

-->


## S1 — 2026-11-02 22:52 UTC — isolated worktree setup

- **Did:** verified main and remote equality at `ac19ea60b6cd8b4fff3e5413b111925b7ef78485`, scaffold ancestry, frozen packet input equality, branch/destination absence; created `C:/Projects/bb-business` on `eb/blurby-business-1` through the real common repository. Initial checkout was clean.
- **Learned:** the packet's old bq-main anchor was an assumption corrected by BB-1; no old detached checkout, stash or evidence was changed. Qualified helper's 220 raw hashes, canonical blobs, inventory and import origins passed again; read-only policy permits explicit branch pushes. No registry/helper command or fresh SQL was invoked; parent-confirmed readback is labelled as such.
- **Decisions:** consumed Brain BB-1/BB-2 at governance `5378f87a50471f485d2ecfcf6d2db6f81663c462` without merging governance into source. Source window closure and separate Business/CPU ownership accepted. Theme export is future scope only.
- **Gate/DoD movement:** setup only; D1–D21 unmet. No npm installation, baseline suite, build, native or product source/test edits.
- **Tried and failed:** unsupported model failure remains preserved in the chat. Python CP1252 stdout failed printing charter U+2192 before worktree creation; partial receipt preserved, same-wave UTF-8 correction explicitly authorized by coordinator.
- **Git:** docs-only setup checkpoint on `eb/blurby-business-1`; exact resulting commit/remote equality recorded in the external final receipt. Only state.md and journal.md staged.
- **Evidence:** `C:/Projects/Blurby-artifacts/business-worktree-prep-20261102/`; helper acceptance `C:/Projects/Blurby-artifacts/business-helper-prep-20261102/acceptance.json`.
- **Next:** STOP for Brain setup acceptance; require a separately bounded dependency/baseline admission and resource reservation. No automatic HB-6 implementation.

## S1 — 2026-11-02 23:01 UTC — accepted baseline documentation checkpoint

- **Did:** recorded Brain's acceptance of `BLURBY-BUSINESS-1-S1-BASELINE-20261102`, consumed 22:53:00 UTC and closed 22:59:13 UTC at 39/40 aggregate tools. Locked `npm ci --no-audit --no-fund` exited 0 in 51.76 s (660 packages); expected ONNX two-block patch verified, package and lock unchanged. The exact full `npm test -- --maxWorkers=1` ran once, 22:56:18.596148–22:58:51.129438 UTC, exit 0 in 152.53 s: 181 files passed; 2,452 tests passed, 1 skipped, 0 failed. Process-local `NODE_OPTIONS=--max-old-space-size=2048` limits JavaScript heap, not total RAM.
- **Evidence:** `C:/Projects/Blurby-artifacts/business-s1-baseline-20261102/parent-verification.json`, SHA256 `3fad01eecec99db60a0268933a4145316fbc2847d4ab1dd6673aa24ee1555416`; `receipt.final.json`, SHA256 `a72f61e7287c503f2ceb682b4dd70f31388924a349e9d71aa37c9be08e94842c`. Raw logs, before/after tracked hashes and generated-output diff remain in that directory.
- **Preserved:** suite-generated `tests/perf-baseline-results.json` remains untouched and unstaged at SHA256 `4834fca0f41d7c89b83fa02677a9f23ac77cdebb3b14c8ad59ef16cdeebf3208`. Frozen charter/storyboard/phase1-specs/matrix remain unchanged against packet-add commit `0d705ae2f43f080056e7322c0480c5438cc2787e`. No source, build, typecheck, native or profile action occurred in the baseline wave.
- **Gate/DoD movement:** HB-6 task 1 baseline accepted; D1–D21 remain unmet. No product or architecture implementation accepted. Brain remains execution coordinator; canonical governance/register changes remain Roadmap's responsibility.
- **Git:** documentation starts from `eb/blurby-business-1` at `a67045eaf3241a18adde990e502a90b56a8a2c68`. Only epic state.md and journal.md are intended for the docs-only checkpoint; resulting commit and remote equality belong in the external checkpoint receipt. Generated performance output is excluded.
- **Next:** STOP after this docs checkpoint. HB-6 task 2 fixture generator requires its own ready contract and separate Brain admission; no automatic code wave.

## S1 — 2026-11-02 23:25 UTC — verified HB-6 task 2 fixture checkpoint

- **Admission:** `BLURBY-BUSINESS-1-HB6-T2-SOURCE-20261102`, consumed 23:20:58 UTC, deadline 2026-11-03 00:20:58 UTC, maximum 40 aggregate tools. Pinned pointer at governance `bc736ccda7e3ba77b52b52959eb4b437c01a8357`; source started at `7b198da942471bf7987dd72c8b78d5c5cb54331d`. Final time/call accounting and checkpoint identity are recorded in the external final receipt, not inferred here.
- **Did:** authored only `scripts/business-smoke/make-fixtures.mjs` and generated `tests/fixtures/business/report.pdf`. The six explicit Letter pages use Helvetica, fixed metadata/date, prescribed headings/page labels, page 2's Quarterly results and page 1's black rectangle. Generator SHA256 `164943421fe6b9e8bdaa03b3ff68daee0ee9ec1b24594543a1e1ad0bb8e821a6`; PDF and retained `.tmp` SHA256 `b587c05f21a419b8af6860cc1d7d73f26f35b0fb5bc74d304ff3275995acdcdb`.
- **Verification:** syntax check and exactly two production generations exited 0. Completed PDF structure/metadata/content passed; the second generation preserved both files' bytes, hashes, shared inode and modification times. Exact copied-generator wrong-final and existing-temp sentinel controls each exited 1 with empty stdout and preserved their existing entry, leaving the other entry absent. Child-only `NODE_PATH` resolved qualified Business-local PDFKit 0.18.0; Node verification used a process-local 2 GiB JavaScript heap limit, not a total RAM cap.
- **Evidence:** `C:/Projects/Blurby-artifacts/business-hb6-task2-20261102/verification-resume/tests.json`, SHA256 `81873f58434146b2cb5aac34308d4f33d3007b8d198f39bea916d34b83649cb2`. Original verifier failure and logs remain retained: it expected the wrong PDFKit text-baseline transform. The independent external verifier was corrected to the actual Letter-page transform; syntax and the first successful generation were not repeated, and generator bytes never changed. Solon spec compliance APPROVED, followed by Plato quality READY.
- **Preserved/package:** all 2,479 pre-existing tracked hashes matched before these item-document edits. Frozen charter/storyboard/specification/matrix unchanged. Package unchanged: package/lock and `build.files` untouched; scripts/tests are outside the package fence. `tests/perf-baseline-results.json` remains unstaged at SHA256 `4834fca0f41d7c89b83fa02677a9f23ac77cdebb3b14c8ad59ef16cdeebf3208`. Retained `report.pdf.tmp` stays unstaged and must not be deleted or included in the checkpoint.
- **Gate/DoD movement:** task 2's narrow source/structural controls verified; HB-6 and the epic are not complete, D1–D21 remain unmet. No app/native rendering or pixel claim, full suite, build, package, model, profile or dependency change in this wave. Canonical governance remains Roadmap's; Brain alone coordinates execution.
- **Git/next:** stage only the two task additions plus epic state/journal after review; final commit/parent/tree/remote equality belong in the external receipt. STOP after the checkpoint. HB-6 task 3 needs a separately ready contract and Brain admission; no automatic successor.

## S1 — 2026-11-02 23:31 UTC — PDF format ruling and separate Git checkpoint

- **Preserved:** source wave closed at 40/40 aggregate tools without a commit or push. Its partial receipt, `C:/Projects/Blurby-artifacts/business-hb6-task2-20261102/receipt.final.partial.json`, SHA256 `922b11eb9c0e8810cf47ad962d57df899104ca99863fbdf630ad674fd598311c`, retains the successful fixture verification, ordered reviews and cached-diff diagnostic. The diagnostic concerns PDF cross-reference trailing separators; generator, PDF, retained temp and unstaged perf bytes remain pinned.
- **Ruling:** Brain's `BB-HB6-T2-PDF-XREF-20261102` prohibits trimming or reformatting the PDF. It permits normal cached whitespace checking for the generator and two epic text documents, and only for `tests/fixtures/business/report.pdf`, `git -c core.whitespace=-blank-at-eol diff --cached --check -- tests/fixtures/business/report.pdf`, together with read-only assertions of fixed 20-byte cross-reference rows including LF and offsets pointing to their actual objects. This is no global configuration, attributes or hook exemption. Actual check results are recorded by the repository operator in the external checkpoint receipt; this entry does not claim they have run.
- **Admission:** fresh `BB-HB6-T2-GIT-CHECKPOINT-20261102`, consumed 23:31:31 UTC, deadline 23:46:31 UTC, maximum 15 aggregate calls, Git/docs/receipt only. No generator or verifier edit/execution, test rerun, build or native action. Exact four-path stage fence remains; perf and temp remain excluded.
- **Gate/next:** HB-6 task 2 remains a narrow verified fixture checkpoint; HB-6/epic are incomplete and D1–D21 remain unmet. Final commit, remote equality, format-check evidence and actual accounting belong in the external receipt. STOP after that checkpoint; no automatic successor.

## S1 — 2026-11-03 UTC — verified HB-6 task 3-R storage foundation

- **Admission:** `BLURBY-BUSINESS-1-HB6-T3-R-SOURCE-20261102`, consumed 00:24:21 UTC, deadline 01:24:21 UTC, maximum 40 aggregate calls including all workers/reviews/docs/Git/receipts. Source base `1bcceb0efede6d33df4bba232f75832247b3f851`; immutable R draft at governance `090c6872d0a2bc98d5c9cf86f34ae59a89f21f33`, raw SHA256 `817c972e376d317bfe1d4aa342d11fa946641e666e6b9ec25de23b6b675d234f`. Final time/calls and checkpoint identity belong in the external final receipt.
- **Did:** authored the new retained-case test while a separate doer prepared the implementation externally. Production files stayed untouched until actual red and test-only local commit `7fab10b3c71553b819b7ef143c1760ca8b9cef34`. Then added inert CommonJS `main/business/recent.js` and only `BUSINESS_DATA_DIR` / `BUSINESS_RECENT_MAX` declarations and exports in `main/constants.js`.
- **Red evidence:** exact combined targeted Vitest command exited 1 at 00:27:49 UTC, with all 15 new cases failing intended missing-module assertions, all six unchanged JSON-store controls passing and successful collection. `red.receipt.json` SHA256 `616b23fc207d330cc9e136c437468d403e898d83181b478cbbcf2f923e5785f6`. Test bytes stayed SHA256 `04071db70ad2dd96f57eafc2ac403bbfcece2c41cf1a6c6d7ed6264f445161da` through green.
- **Green evidence:** the same `node ./node_modules/vitest/vitest.mjs run tests/businessRecent.test.js tests/jsonStore.test.js --maxWorkers=1` exited 0 at 00:29:23 UTC: two files, 21 tests passed, empty stderr. `C:/Projects/Blurby-artifacts/business-hb6-t3-r-20261102/green.receipt.json`, SHA256 `38578ab7106ad5a3aab261564399b331fb0db56bf0aa239db106596c47ac5ec9`, records source and unchanged-control hashes, retained fixtures and exact command/environment. No test retry or oracle change.
- **Scope proved:** r01–r15 cover inert factory/root snapshot, strict path/data admission and Windows lexical comparison, no-write reads/removals, cap/order, observable native/mkdir/write errors, complete queued transactions, defensive disk-authoritative returns and same-Promise close/drain. Solon APPROVED actual final bytes/evidence, then Plato READY. No native alias, document permission or whole-application claim follows.
- **Custody/preservation:** red/green data and os-temp are separate owned external directories; actual child `os.tmpdir()` confinement was proved as current namespace only. All new R cases/logs/red evidence remain retained. The unchanged JSON-store test alone performs its existing teardown of its own generated temporary tree inside the owned os-temp parent. Frozen charter/storyboard/seed/matrix, accepted generator/report/temp, dependencies and known unstaged perf bytes remain protected; no cleanup/reset/stash or workspace deletion.
- **Package/integration holds:** `main/**` changed, so package qualification is HELD, not package unchanged. No window/IPC/quit wiring, actual Business profile activation, full suite, typecheck, build, native/model/app or provider action occurred. Later activation must stop new store operations, await store `close()`, then global `whenWritesSettled`; R does not wire or qualify that sequence. HB-6 and D1–D21 remain unmet.
- **Git/next:** retain red-test commit ancestry and checkpoint only the exact approved R source/test/constants and two epic documents; final parent/tree/blob/remote evidence belongs in the external final receipt. STOP for Brain acceptance; W/I or any source successor requires a separate named admission.
