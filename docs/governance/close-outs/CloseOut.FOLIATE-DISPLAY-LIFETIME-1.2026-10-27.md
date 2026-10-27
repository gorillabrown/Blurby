# Foliate loading and retired-view ownership — held-dispatch report (FOLIATE-DISPLAY-LIFETIME-1)

**Goal:** Prevent loading/body-null layout failures and obsolete asynchronous display work from restoring a retired View while preserving four independent reading modes.
**Result:** Source e1c1c11ceac16e8cba808714172420942e8801fa and held documentation tip 2df0f920a7963f8fa81ff2e68eeef352e4d8a418 are published; portable and static package checks passed, collector qualification failed, and native acceptance routes did not run.
**Learned:** LL-169 — operation currentness and retained-resource lifetime require separate guards; LL-165 correctly prevented native input without actual profile proof.
**Recommend:** Retain the repair built and held; review a successor observation design and admit its qualification separately before resuming native verification.
**Bottom line:** This records an unsuccessful qualification attempt and a blocked item, not completed product work.

Date: 2026-10-27
Disposition: BUILT-AND-HELD / BLOCKED; non-terminal.
runtime: not measured (the local timing log has five unmeasured prospective rows).
Origin: registered roadmap item, Seq 68, Reader Engine; not a held-plan HB entry or combined epic.
Owner confirmation: user explicitly authorized this held report, Blocked status and lesson; no completion record or successor elevation.

## Acceptance contract and identities

The active full specification is on the held branch at ROADMAP.md#foliate-display-lifetime-1, with immutable v3 contract SHA256 5407201dae92574bb0655e7b9ec2f89334d4d1967edfc8532c81e277b15ded1d and independent contract review e00d0bae3281b0ecd7cf048789dedddbcb669d8d38365197a852665a2e87b823. Published Brain amendments govern the fixture accommodation, anchor-intent ownership and strictly bounded observer qualification. This report changes no acceptance criterion.

Source baseline: 4c9724e60cd6bbab79ad78b0f11b25f78ad31ab7, with approved main 85e6e5aaedccb0501c529dbc9f739e50a0689fd7.
Implementation: e1c1c11ceac16e8cba808714172420942e8801fa.
Held branch/documentation tip: 2df0f920a7963f8fa81ff2e68eeef352e4d8a418, eb/foliate-display-lifetime-1.
Local/tracking/authoritative remote source branch agree at that tip; main was independently read at 85e6e5aa before this governance-only crossing. The source-to-documentation-tip delta is solely Memo.FOLIATE-DISPLAY-LIFETIME-1.NativeHold.2026-10-27.md. No source branch is merged by this ceremony.

## Findings and dispositions

| Finding | Required | Observed | Disposition |
|---|---|---|---|
| Installed-production lifecycle detector | Identical base/candidate detector | Candidate 51 passes; base 35 behavior assertion failures and 16 active passes; four additional old-production rejections separately recorded | Accept portable evidence only |
| Full portable verification | Tests, typecheck and build | 185 files; 2,522 tests passed, two skipped, zero failed; typecheck/build exit 0 | Accept stated population; skipped tests are not passes |
| Static ARM64 package | Exact source/resource/architecture parity | 77 ASAR matches, two extra-resource files and eight selected native PE checks passed independent review | Accept static evidence only |
| Controlled observation collector | Qualified actual runtime identity/source-family/path matrix | Run 1 and Run 2 stopped at MODULE_CONSTRUCTOR; zero actual matrix controls completed | Capability HOLD; no product-regression conclusion |
| Run 2 defensive parsers | Separate synthetic controls | 22 descriptor and 11 location synthetic cases matched expectations | Accept synthetic parser evidence only |
| Native package acceptance | Actual initialized paths, native routes, protected-state checks, final Brain confirmation | All native Blurby launches/routes NOT RUN | Block completion and integration |
| Timing and cost | Measured bound records | All five local timing rows unmeasured; transcript dispatch binding and guardLog role absent | Runtime/cost not computable; no invented actual |
| Register | Truthful non-terminal state | Provider last read In Flight; approved target Blocked, same Seq 68 and no completion date | Apply set-status only after local persistence |

The current candidate has no established in-scope product regression from this qualification attempt. The failing population is an evidence-collection capability/admission failure: the admitted data-only constructor anchor cannot be traversed in the controlled Node process. Run 2 exposed an immediate-prototype getter; invoking it was prohibited and did not occur. This neither explains Run 1's exact descriptor nor establishes Electron's behavior. The collector's empty actual-runtime arrays cannot prove initialized Blurby data or queue paths.

Infrastructure and harness failures retained in the source receipt (initial Electron extraction race, initial jsdom iframe setup, serializer development failures and Windows ASAR path-driver mismatch) remain separately classified. They are not behavioral red controls or hidden native passes. No new exclusion or acceptance waiver is granted here.

## Mid-Dispatch Decisions

- Brain approved dedicated real jsdom iframe Document/Window fixtures while retaining actual production listeners/methods; synthetic load delivery was explicitly not native Chromium evidence.
- Brain approved separate anchor-intent ownership and the one-call test-only private-scroll forwarder; neither changes the shipped dependency API or sibling modes.
- Artifact-only read-only observer design was restricted to actual owned process identity and non-invoking data-descriptor traversal, with independent static reviews and two controlled matrix attempts.
- Run 2's narrow descriptor-classification correction was separately reviewed and admitted against exact hashes. Both attempts are now consumed; unused child slots do not authorize retries.
- Brain's final disposition and independent evidence review agree: collector NOT QUALIFIED / continued capability HOLD; qualification stopped and custody released. A successor requires separately reviewed design and explicit new qualification budget/custody.
- Owner confirmed this non-completion recording on 2026-10-27. No terminal ledger append, completion date, successor elevation, main source merge, release or install.

## Exact evidence

Primary evidence remains in the held branch:
- docs/governance/close-outs/Memo.FOLIATE-DISPLAY-LIFETIME-1.Local.2026-10-27.md
- docs/governance/close-outs/Receipt.FOLIATE-DISPLAY-LIFETIME-1.Portable.2026-10-27.json (includes preserved raw logs; accepted final full-suite log reviewed without rerun).
- docs/governance/close-outs/Memo.FOLIATE-DISPLAY-LIFETIME-1.NativeHold.2026-10-27.md

External evidence retained at C:/Projects/Blurby-artifacts/foliate-display-lifetime-20261027/:
- attestation-prescribed-run1-434adfe8-14af-43b0-a7e9-49dd84f9ab81/receipt.json — SHA256 999bf5062e7743bf9978c62ab99cc38562c3e436e2e7c6ce40f4cc29072c4e76.
- attestation-prescribed-run2-adf57dba-23f0-4af1-afc5-589a874104aa/receipt.json — SHA256 e2815173d54fc205c9b051c8eba89631121db8a9b9766488810277e48fabbf26.
- attestation-prescribed-run2-correction.json — executed correction SHA256 e6e7030fa1770420791954fe5ac02a2bb6ddb0e7c939843d8aaaa2818109dfec; later review-status-only metadata is separately preserved.
- attestation-final-disposition.2026-10-27.md and both shutdown proofs; release/close ACKs recorded, PID57364/port65390 and PID68732/port58069 absent.
- Exact executable SHA256 be49c8899ad3f476f70f1a7981e88cfa3bd78989f1363653d8015029a841a3d4; ASAR SHA256 b59071afd7816764b3132e3e959fa5b659cfc80b42d635572b2ce60b4adc2932. These hashes do not imply native acceptance.

Independent reviews at C:/Projects/Blurby-artifacts/local-resume-20261027/review/:
foliate-final-source-review.md; foliate-package-static-review.md; attestation-run2-static-review.md; attestation-run2-evidence-review.md.
The final hold summary is approved for bounded accuracy only, not collector qualification.

## Lessons

- LL-169 is appended to the registered LESSONS_LEARNED.md as an Observation: operation currentness and retained-resource lifetime are distinct; newer same-View intent must retire obsolete publication/scroll/focus without destroying valid retained loading/font/resize work.
- LL-165 status is appended: its profile-proof gate held by preventing all native application input when actual initialized data/queue paths could not be proved.
- Related applied guards LL-029, LL-031 and LL-109 held in the accepted portable stale-callback/retained-resource tests; native behavior remains unverified. LL-142 and LL-143 are respected by preserving installed-source provenance and identical base/candidate controls; synthetic collector/parser outputs are not promoted to runtime qualification.
- No standing-rule promotion or architecture documentation claiming accepted integration is made.

## Time, cost and guards

Timing.FOLIATE-DISPLAY-LIFETIME-1-LOCAL-20261027.jsonl has complete=false and notMeasured=[1,2,3,4,5]. Its printed estimate/actual pricing fields are not measured execution time. No estimate/actual is submitted to a completion record.
Cost: not computable, missing transcript dispatch binding. Guard catches: not computable, no registered guardLog role. No runtime was reconstructed from chat timestamps.
No parked timing rows were reported.

## Files Created and retained footprint

The item source commit creates/changes exactly its dependency patch, two tests, local memo and portable receipt; the later held tip adds the NativeHold memo. Those published bytes are retained.

The created-files guard against the specified base reports 287 committed files, 65 temporary-classified paths, four untracked files and 12 uncommitted changes. Most additional committed paths belong to the published cloud handoff/admission. Its .log labels do not override their unique evidence classification or the owner's preservation instruction; NONE are removed.

Four untracked execution-tree files are retained pending later maintenance: docs/governance/close-outs/Timing.FOLIATE-DISPLAY-LIFETIME-1-LOCAL-20261027.jsonl; foliate-base-local-20261027.js; foliate-patch-generation-local-20261027.py; timing-rows-local-20261027.json.
Historical timing backfills, Change.Ledger.jsonl and tests/perf-baseline-results.json remain unstaged and excluded. The close-out refresh also generated a current provider snapshot in the execution tree; it is retained as a mirror, not acceptance evidence. Unrelated primary IDE/settings/retrospective/check-in/investigation changes are untouched.

- **Footprint:** Retain C:/Projects/Blurby/.worktrees/foliate-display-lifetime-20261027, its unpublished local evidence, both external artifact roots and reviewed planning worktree. No archive/removal/deletion. The helper's default-name matcher found zero candidates and could not read 23 system/temp folders; it does not establish an empty footprint. Free space at read-only scan was 52,155 MiB; no reclaimed-space claim and no cleanup performed.

## Confirmed recording plan and recovery

This is a non-terminal held-dispatch crossing, explicitly authorized by the owner:
1. Persist this report, the linked issue, append-only lesson/status entry and the minimal ROADMAP held-state note using exact-path Git publication.
2. Plan one external set-status mutation at the fresh register revision; set Blocked and refresh evidence/notes without changing Seq, Started, Completed or other rows.
3. Read back through the provider, refresh the full 194-item snapshot and confirm the recovery handshake only after exact field verification.
4. Persist resolved recovery/snapshot and regenerate the registered board. Verify lesson gate, unchanged terminal-ledger bytes and every item's sequence.
5. On any partial failure retain its durable recovery record naming what landed; do not retry the whole crossing or report completion.

No terminal append or successor elevation is part of this plan. The issue remains open for separately admitted observation design and native qualification.

## Recording verification - 2026-10-27

Owner-confirmed non-terminal recording completed: live Notion readback is Blocked at Seq68, with Completed unset. All194 live item identities and sequence values match the pre-write census; only this item's Status, Notes, Deliverable and Evidence changed. Exact SQL plain-text field readback passed. Recovery20261027T190211Z-external-set-status-FOLIATE-DISPLAY-LIFETIME-1 is resolved at revision538dcb86dc4bedf3cd37edbcb807567c21e3f18d75302ffad6724baf5381ac6b; registry recovery reports no outstanding records.

Report, issue, LL-169 and LL-165 status were first published in governance-only commitcbfbe8b2 before the external write. The fresh full snapshot and resolved recovery record are persisted in the following governance-only commit. The registered ignored board was regenerated locally. The lesson gate passed and all pre-existing lesson bytes remain an identical prefix. Terminal ledger SHA256 remains f80cbaa4980cecf023d9f2d37bd153b75bd73c60d86ba132e5f3a8875929ce1c: no record appended or altered. No successor elevation, completion date, application source merge, native launch, installation or release occurred. Source branch remains2df0f920a7963f8fa81ff2e68eeef352e4d8a418. This hold does not drain the completion buffer.
