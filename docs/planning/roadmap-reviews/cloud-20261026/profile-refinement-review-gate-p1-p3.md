# Profile refinement review gate — parent-relayed Brain P1–P3

Authority provenance: explicit parent relay from01a0cf7f-62f6-7450-abc9-5bb2750923f4 on2026-10-26. Reviewer01a17a3a-d94f-760e-8d37-5805cd713020 has no direct Brain thread or native local-machine access. No native capability fact is independently certified here.

Latest planner branch check remains identical to460cd25dd37dbfd92e628c4756a364a604bb6a04. No refined profile/folder revision is available at that check. Original proposal-quality APPROVE remains bounded to that exact revision, not execution readiness. New review must use the refined exact commit/hashes and the F1/F2 matrix in repair-blocker-review-16117282-and-folder-refinement-gate.md.

## Selected planning direction and required review

P1: Prefer Windows ETW file-I/O via WPR. Parent relays Brain's read-only local observation of System32 wpr.exe10.0.26100 listing FileIO and available tracerpt.exe. These observations do not qualify recording, decoding, parser or event-loss accounting. Procmon/WPA not being on PATH does not prove global absence. No install or trace start admitted.

Refined contract must name exact executable version/hash, profile/providers/event schema, parser/export/loss handling and actual availability evidence, or leave each unqualified detail an explicit entry gate. File-I/O event families cannot be inferred from generic DiskIO schema. Validate PID+start/executable/thread/file-object/path and rename correlation; complete write/create/replace/delete/flush/rename coverage. Owned equal-byte rewrite, atomic replacement and second-process sentinel must qualify recorder and parser under the same configuration. Never filter solely to scratch PID, which would omit another writer. Metadata/file identity includes tmp and both rename endpoints. Missing mapping/decoder/attribution/loss statistics is INCONCLUSIVE, not zero or PASS. Procmon alternative requires its own qualified availability/filter/parser/loss contract; no FileSystemWatcher substitute.

Primary Microsoft references supplied by Brain, to be read/verified when assessing the refined grounding:
- https://learn.microsoft.com/en-us/windows-hardware/test/wpt/sessions
- https://learn.microsoft.com/en-us/windows/win32/etw/fileio

P2: Separate observation-only owned scratch process and independent clean packaged counterpart under the same OS recorder. Use actual production modules/IPC/flush; record paths/arguments/PID/settlement without changing arguments/returns/errors/queue operations/payloads. Instrumented or inspector runs are not clean qualification. Every launch requires actual initialized getDataPath and queue destination before input through approved observation and/or directly attributed initialization I/O. Arguments/covers/forced standalone initialization/prior launch are insufficient. Missing readback capability stops for separately fenced observation proposal; no unrestricted IPC. Preserve genuine errors, no-call/equal-byte/different-value/flush controls, expected equal-byte mechanism and historical writer UNKNOWN.

P3:120seconds PER native observation from recorder start through launch/actions/graceful shutdown, with>=25seconds native survival. Instrumented and clean runs each require fresh owned profile, full pre-input identity and exclusive custody. Declare fixed phases that fit the bound. Timeout stops input; necessary owned cleanup stays recorded; overrun is FAIL/INCONCLUSIVE, not retroactive schedule shortening or retry-until-green. Maximum two harness repair passes.

Normal library/settings/queue content remains untouched: only metadata/hash/file identity readback. Published index covers exact normal/scratch targets, parents/tmp/rename and required process identity only, no payload/unrelated activity. Raw OS trace stays restricted in owned LOCAL storage with hashes, coverage and redaction limits. A broader raw footprint requires exact disclosure plus narrower configuration or explicit ruling BEFORE capture. Preserve event loss/failures. Unexpected normal-target write stops input, preserves attribution and permits safe shutdown of ONLY owned scratch process. No normal reset/restore/clear for controls.

## Admission boundary

Exact recorder/parser/harness contract, source pins, owner/custody, detector controls and independent review precede any experiment admission. Application repair fence remains EMPTY until culprit evidence and separate source admission. Unavailable dependency/native capabilities are not solved by prose. No recorder/harness/application writes or local capture are admitted by this planning ruling. No live Status/Seq/provider/main/release/terminal mutation.

## Current checkpoint

Folder F1/F2 selections and profile P1–P3 directions now have durable reviewer criteria. Refined exact reports remain unpublished at the branch check, so no new approval or finding against them is claimed. Repair blocker report16117282 has two recorded documentation corrections, not permission to implement. Quiet published-branch monitoring remains the supported surface.

Package WITHHOLD and all LOCAL QUALIFICATION HOLDS, original failed receipts, native ARM64/owner-machine, desktop/normal-profile custody, original full observer/census/four-mode/owned91-word/product-defaults/onboarding package routes and final Brain confirmation remain intact.
