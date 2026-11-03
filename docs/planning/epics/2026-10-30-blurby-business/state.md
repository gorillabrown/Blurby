---
epic: blurby-business
last_updated: 2026-11-03 UTC
updated_by: session 1 HB-6 task 3-W mocked checkpoint closeout
---

# State — single source of current truth

<!-- Rewrite freely; keep under ~80 lines. History belongs in journal.md; the route in
     plan.md; the contract in charter.md. Never end a work burst with this file stale —
     sessions die without warning, and the disk must be handoff-ready at all times. -->

## RESUME PROTOCOL — no memory of this epic? Do this first, in order

1. Read charter.md (the contract), then plan.md (the route), then all of this file, then
   the **last** entry of journal.md.
2. Distrust, then verify: these files are MEMORY; the repo/system is REALITY. Run the
   cheapest check that confirms the "Where we are" block below (usually the current
   phase's exit-gate command). On conflict: believe reality, fix this file, note the
   correction in journal.md.
3. If `done.md` exists in this directory, do not start work — re-verify its claims
   against the charter DoD and report.
4. If `last_updated` above is older than the newest journal entry, trust the journal and
   repair this file before working.
5. Append a session-start entry to journal.md, then continue from "Next actions".

## Where we are

```
phase:        P1 — Viewer
next_action:  close verified W mocked checkpoint under W-GIT-CLOSEOUT-20261102; then STOP
blockers:     none
session:      1 of ~40 budgeted; R accepted, W mocked source verified pending Git; HB-6 incomplete
dod:          D1–D21 unmet
```

## Next actions — max 5, near horizon only

1. [ ] Read the register through the rule 11a guard: confirm BLURBY-BUSINESS-1 is not
       terminal, and confirm the LIBRARY-COMPLETION-VISIBILITY-1 window is closed (start gate).
2. [x] GIT WORK, first session: worktree created on `eb/blurby-business-1`; locked
       dependency installation and HB-6 task 1 full baseline passed and Brain accepted.
3. [ ] Re-verify every location cited in `phase1-specs.md` against the base, and journal
       any that moved.
4. [x] HB-6 task 2 fixture generator: scoped verification and ordered reviews passed;
       accepted checkpoint `1bcceb0efede6d33df4bba232f75832247b3f851`.
5. [x] HB-6 task 3-R inert recent store: targeted red/green and ordered reviews passed;
       checkpoint only. STOP for Brain acceptance; W/I and activation require separate admission.

## Working set — verified facts this epic relies on

| Fact | Value | Verified how / when |
|------|-------|---------------------|
| Repository (execution) | `C:\Projects\bb-business`; common Git directory `C:/Users/estra/Projects/Blurby/.git` | Verified clean at creation, BB-2026-11-02-1 anchor correction; old bq-main untouched |
| Run branch | `eb/blurby-business-1` from `origin/main` at or after the packet commit (scaffold base `5d07b515`) | scaffold, 2026-10-30 |
| Remote | `origin` = github.com/gorillabrown/Blurby (private) · network operations granted (`policy.git.networkOperations: allow`) | `Virtuoso/workspace-layout.json`, 2026-10-30 |
| Branch created | `eb/blurby-business-1` from exact `ac19ea60b6cd8b4fff3e5413b111925b7ef78485` | S1; remote main equality and scaffold ancestry verified |
| Push quirk | refs can land under `EB/`; always push with `HEAD:refs/heads/eb/blurby-business-1` | memory, Rodney 2026-10 |
| Baseline suite | 181 files; 2,452 passed / 1 skipped / 0 failed on `a67045eaf3241a18adde990e502a90b56a8a2c68` | S1 exact full suite, exit 0, 2026-11-02 22:56:18–22:58:51 UTC; Brain accepted |
| pdfjs-dist | 5.4.296, transitive via pdf-parse 2.4.5 only | `node_modules`, Rodney, 2026-10-30 |
| Register | read only through the rule 11a guard (pinned helper `fcfa9295`, `python -I`); `docs/planning/roadmap-reviews/2026-10-27-registry-helper-repair.md` | 2026-10-30 |
| Technical authority | Blurby.Brain (rule 11); merge go: Blurby.Roadmap | CLAUDE.md, memory |

## Blockers

- (none)

## Tried and failed

- (none)

## Decision log — append; never silently re-litigate

| # | Date | Decision | Why | Charter authority |
|---|------|----------|-----|-------------------|
| 1 | 2026-10-30 | Nine phases (eight delivery + completion) | the owner approved eight phases (D20); completion is mandatory | scaffold |
| 2 | 2026-10-30 | One run branch for the epic instead of six stacked item branches | an epic runs on one branch; the HB item branches in `phase1-specs.md` are superseded by `eb/blurby-business-1` | scaffold (policy.git template `eb/{item-id}`) |

## Evidence

- Setup evidence: `C:/Projects/Blurby-artifacts/business-worktree-prep-20261102/`; initial tree `b08fdf6e354e191962ae158396e17d50b2afe785`. Frozen charter/storyboard/specs/matrix match their packet-add commit.
- Qualified helper relocated to `C:/Projects/Blurby-artifacts/registry-helper-20261102-business/virtuoso-dev/plugins/virtuoso`; original manifest SHA256 `86a0fb68619372d6e73cdc4dc1ad5e7fc4c55c62fc75e2a836c0084e895c8d47`, 220 raw/canonical/inventory checks and imports reverified. No global activation or helper command invoked.
- BB-2026-11-02-1 source window CLOSED by confirmed Notes-only provider readback (recovery `20261102T223205Z`); snapshot 202 rows at 22:33:39 UTC is parent-confirmed evidence, not a fresh SQL read here. Visibility remains In Flight.
- Brain coordinates execution; Roadmap owns canonical governance/closeout. Business owner is this S1 executor on RodneySR, isolated from CPU/A2. BB-2 theme export supplement consumed for future HB-6; not implemented. Native remains paused.
- Baseline wave `BLURBY-BUSINESS-1-S1-BASELINE-20261102` ran 22:53:00–22:59:13 UTC and closed at 39/40 aggregate tools. `npm ci --no-audit --no-fund` exited 0 (660 packages, 51.76 s); expected ONNX two-block patch verified; package/lock unchanged. `npm test -- --maxWorkers=1` exited 0 once (152.53 s), with process-local 2 GiB JavaScript heap limit; this is not a total RAM cap.
- Brain-accepted baseline evidence: `C:/Projects/Blurby-artifacts/business-s1-baseline-20261102/parent-verification.json`, SHA256 `3fad01eecec99db60a0268933a4145316fbc2847d4ab1dd6673aa24ee1555416`; worker `receipt.final.json`, SHA256 `a72f61e7287c503f2ceb682b4dd70f31388924a349e9d71aa37c9be08e94842c`. Frozen charter/storyboard/specs/matrix remain unchanged. Only generated `tests/perf-baseline-results.json` is dirty, preserved unstaged at SHA256 `4834fca0f41d7c89b83fa02677a9f23ac77cdebb3b14c8ad59ef16cdeebf3208`.
- HB-6 task 2 wave `BLURBY-BUSINESS-1-HB6-T2-SOURCE-20261102` consumed 23:20:58 UTC; deadline 2026-11-03 00:20:58 UTC, cap 40 aggregate tools. Final elapsed time/accounting and resulting commit belong to the external final receipt. Generator SHA256 `164943421fe6b9e8bdaa03b3ff68daee0ee9ec1b24594543a1e1ad0bb8e821a6`; PDF and retained hard-link temp SHA256 `b587c05f21a419b8af6860cc1d7d73f26f35b0fb5bc74d304ff3275995acdcdb`.
- Actual fixture verification: `C:/Projects/Blurby-artifacts/business-hb6-task2-20261102/verification-resume/tests.json`, SHA256 `81873f58434146b2cb5aac34308d4f33d3007b8d198f39bea916d34b83649cb2`. Syntax and exactly two production generations exited 0; six Letter pages, fixed metadata/content, shared inode, byte hashes and modification times verified. Both wrong-final and existing-temp preservation controls passed. Solon APPROVED, then Plato READY. The original external verifier's incorrect baseline-coordinate assertion and its evidence are retained; only the verifier was corrected, without repeating syntax or first generation.
- All 2,479 pre-existing tracked files matched before item-document updates; frozen charter/storyboard/specs/matrix remain unchanged. Package unchanged: package/lock and `build.files` are untouched, and scripts/tests are outside that package fence. Perf remains unstaged at its recorded hash; `report.pdf.tmp` is retained unstaged and excluded from the checkpoint.
- HB-6 and the epic remain incomplete; D1–D21 unmet. No native rendering/pixel proof, app execution, full-suite rerun, build or package verification occurred in task 2. Earlier unsupported-model and CP1252 failures remain preserved externally. No automatic successor; exact checkpoint commit and final accounting are external receipt evidence.
- Source wave closed at 40/40 tools with a preserved partial checkpoint: `receipt.final.partial.json`, SHA256 `922b11eb9c0e8810cf47ad962d57df899104ca99863fbdf630ad674fd598311c`, under the task evidence root. Brain ruling `BB-HB6-T2-PDF-XREF-20261102` preserves PDF fixed-width cross-reference trailing separators and permits normal text-file whitespace checks plus a PDF-only `git -c core.whitespace=-blank-at-eol diff --cached --check -- tests/fixtures/business/report.pdf`, with read-only 20-byte LF row and object-offset assertions. No PDF bytes may change to satisfy a text check. Separate Git/docs wave `BB-HB6-T2-GIT-CHECKPOINT-20261102` consumed 23:31:31 UTC, deadline 23:46:31 UTC, cap 15 aggregate tools; actual check results and Git identity belong in its external receipt. No generator execution, source change, tests, build or native action is admitted by that wave.
- Task 3-R admission `BLURBY-BUSINESS-1-HB6-T3-R-SOURCE-20261102` consumed 2026-11-03 00:24:21 UTC, deadline 01:24:21 UTC, cap 40 aggregate calls; final time/calls and checkpoint identity belong in the external final receipt. Exact source started at `1bcceb0efede6d33df4bba232f75832247b3f851`; only `main/business/recent.js`, the two approved constants and `tests/businessRecent.test.js` implement R.
- Actual combined targeted red exited 1: 15 intended missing-module assertions failed while all six unchanged JSON-store controls passed. Test-only local commit `7fab10b3c71553b819b7ef143c1760ca8b9cef34` preceded production implementation. Red receipt SHA256 `616b23fc207d330cc9e136c437468d403e898d83181b478cbbcf2f923e5785f6`; unchanged test SHA256 `04071db70ad2dd96f57eafc2ac403bbfcece2c41cf1a6c6d7ed6264f445161da`.
- Exact green command exited 0: two files, 21 tests passed, empty stderr. `C:/Projects/Blurby-artifacts/business-hb6-t3-r-20261102/green.receipt.json`, SHA256 `38578ab7106ad5a3aab261564399b331fb0db56bf0aa239db106596c47ac5ec9`, retains source pins, case directory/file identities and TEMP proof. Solon spec compliance APPROVED, then Plato quality READY. New R cases, red failures and logs remain retained; only unchanged jsonStore controls use their ordinary teardown of their own generated subdirectory inside the qualified owned os-temp parent.
- R is inert and unregistered: no window, IPC, actual profile or quit integration. Paths are lexical identities, not native canonical identity or document-read permission. Before later activation, integration must stop new Business operations, await store `close()`, then global `whenWritesSettled`; R's drain tests do not qualify that unwired integration.
- Package qualification is HELD because R changes `main/**`; this is not a package-unchanged checkpoint. HB-6 and D1–D21 remain unmet. No full suite, typecheck, build, app/native/model/profile or provider action occurred in R. Frozen inputs and accepted generator/PDF/temp remain pinned; known perf dirt remains preserved unstaged. STOP after the exact checkpoint; no automatic W/I or other successor.
- W admission `BLURBY-BUSINESS-1-HB6-T3-W-SOURCE-20261102` consumed 2026-11-03 01:29:29 UTC, deadline 02:29:29 UTC, cap 40 aggregate calls. Accepted R parent is `cc7e0018c66186d4a71041b62b7f5c1b14fa1bb2`. W is VERIFIED_MOCKED_SOURCE_PENDING_GIT, not an accepted or published checkpoint; final accounting and preserved worktree state belong in the external receipt.
- Actual W red collected all 16 controls: 15 intended missing-module assertion failures and the standalone w15 default-CSP pass. Test-only local commit `8d5c244f8245aeb48c740c299cdc8e35e69ba616` preceded production. Test SHA256 `2eeca601495973e238f7678bf0bf2861b4a3d7205824fe40c23104f42c6b133b` stayed unchanged through green. Both syntax checks exited 0 with empty output/error; targeted green passed 16/16 with empty stderr. Green receipt: `C:/Projects/Blurby-artifacts/business-hb6-t3-w-20261102/receipts/green.json`, SHA256 `d5cc1eda41df2f76473b532bb6db22b933f4aae874e35f1731bafdfb9cd868fb`; frozen candidate SHA256 `a20ed635d04ae0c5bcfee919854a421eb7b7b416d6fb513f7bb258e50af9d84a`.
- W compliance and quality reviewed the same frozen candidate concurrently under the published parallel-review amendment. Solon first withheld approval for truncated readback, then completed the scoped read and APPROVED; Plato READY was accepted only after that compliance pass. Four wrong observations are derived from unconditional assertions in passed groups: sandbox:false/w03/assertOptions, stale instance/w08/assertCurrent, mixed-case CSP/w12/assertHeaders, unprevented navigation/w13/assertDenied. Individual console-line delivery is not evidenced. The pre-child identifier-only driver failure is retained; no source/test repair or test retry occurred.
- W remains inert/unregistered and mock-only. `main/**` changes keep package qualification HELD; there is no actual Electron/window/session/profile activation, I/task4/IPC/preload/renderer/assets integration, full suite, typecheck, build, native qualification or fixture generation. HB-6 and D1–D21 remain unmet. Perf/temp, R, frozen packet and accepted fixture pins are preserved. The final source/docs checkpoint is not committed or pushed; red-test commit is local only. STOP at the source-wave cap for Brain's separate Git/docs disposition; no automatic successor.
- Fresh Git/docs closeout `W-GIT-CLOSEOUT-20261102` consumed 2026-11-03 01:54:31 UTC, deadline 02:09:31 UTC, cap 18 aggregate calls. The prior W source wave is CLOSED at 40/40; its source evidence remains unchanged. Its path-fence HOLD counted the already known excluded perf dirt, not a new source/test defect. Correct accounting requires exactly five cumulative paths from accepted R base through the final checkpoint, with only four current stage changes because the test is already in red-test parent `8d5c244f8245aeb48c740c299cdc8e35e69ba616`. Exclude only the separately raw-hash-verified unstaged perf file and untracked retained PDF temp; preserve both. Exact Git checks, final commit/tree/remote equality and actual outcome belong in `C:/Projects/Blurby-artifacts/business-hb6-t3-w-git-20261102/receipt.json`; no publication success is asserted before that receipt. All activation/package/native/HB-6/D1–D21 holds remain, and this closeout grants no successor.
