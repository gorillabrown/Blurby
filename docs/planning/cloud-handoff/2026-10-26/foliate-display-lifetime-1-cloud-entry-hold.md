# FOLIATE-DISPLAY-LIFETIME-1 cloud entry hold and portable harness design

## Disposition

BLOCKED at dependency/test capability entry, before corrective implementation. This report is a planning/receipt artifact only. No R1/L1–L7 execution, corrective patch, suite, typecheck, build, implementation review or package pass is claimed. Existing package remains WITHHOLD.

Execution owner: durable task 01a17a3a-7d81-71bf-93be-37c6ca352037. Parent relay: 01a0cf7f-62f6-7450-abc9-5bb2750923f4. Technical authority: Brain 01a179e8-7a40-75c0-93f4-d3045ad99027. No direct cross-chat read/send/monitor capability is exposed here. Parent relays; the independent reviewer can inspect this published branch.

## Exact custody and supplemental read

Actual local checkout HEAD remains 762d38ac53f22245a56f89e489ab367c905dcd91, clean at last status inspection. Shell clone and exact HEAD verification originally succeeded. A later environment policy blocks shell GitHub access. The f299675dd8251e550f06ab47abb7c4b6ff1889f2 descendant is readable through the connected GitHub API but was NOT fetched or merged locally.

Brain's subsequent ruling, relayed by the parent, permits exactly six connector-read protocol/owner files as a separate read-only scratch supplement. All six were retrieved at that exact descendant, written outside the checkout under cloud-protocol-supplement-f299675, and verified by independently computing Git SHA-1 over "blob <byte-length>\\0<UTF-8 bytes>". Every computed blob matches the approved identifier:

| Supplement file | Verified Git blob |
|---|---|
| .codex/agents/zeus.toml | 4d09128468c344952b986836000c2a92e419056e |
| .codex/agents/hermes.toml | 26bb98bf9d78824e13687b452f17b15344a79c1f |
| .codex/agents/hercules.toml | eb07284df28442b57af2f0a525ace9db380e0c4d |
| .codex/agents/athena.toml | 4cc6077ae10cfcbcc4e43cba550cd53c40d5cadd |
| docs/planning/cloud-handoff/2026-10-26/admission.json | a79fe8890e7ada0d24b258a6e6f9b0cec0bdb466 |
| docs/planning/cloud-handoff/2026-10-26/cloud-startup-addendum.md | 5d6bc8a754c92f79eb078be05a718d55c3b34d6f |

The supplement is context, not a staged repair or a claim of descendant ancestry. The remote report branch was created through the connected GitHub API from exact 762d38ac. This report is its only added file. No source/test/package/lock/build/protocol file is changed by this publication.

Immutable v3 SHA256 independently verified: 5407201dae92574bb0655e7b9ec2f89334d4d1967edfc8532c81e277b15ded1d.
Immutable independent review SHA256 independently verified: e00d0bae3281b0ecd7cf048789dedddbcb669d8d38365197a852665a2e87b823.

## Observed capability failure

- Shell git fetch origin eb/cloud-parallel-handoff-20261026 failed: Network access to "https://github.com:443" was blocked by policy.
- npm ping --fetch-retries=0 --fetch-timeout=10000 failed: Network access to "https://registry.npmjs.org:443" was blocked by policy.
- Node v24.22.1 and npm 11.9.0 are present.
- node_modules is absent.
- npm cache ls foliate-js vitest typescript vite electron jsdom returned no entries. This is a lookup for those dependencies, not a proof about every possible cache entry.
- No npm ci/postinstall/patch-package run or baseline test was possible/proved. The network ping is a capability observation, not an npm installation log.
- No proxy/tunnel, alternate network route, policy escalation, package/lock mutation, fabricated dependency source or copied algorithm was attempted.

Brain explicitly holds corrective implementation until an ordinary approved install/postinstall/patch-package and decisive actual-base controls work. Skipping Electron binary downloads alone cannot supply the blocked Foliate, test-runner, DOM and compiler dependencies. No binary-download adaptation is adopted.

## Portable harness design, unexecuted

This is an assertion and boundary plan, not a runnable harness or a feasibility pass. Read the installed production paginator.js/view.js after a legitimate install before committing to exact extraction boundaries. Existing tests/foliateObserverPatch.test.js is a source-text observer check, not sufficient behavioral proof for this item.

Only two new tests and the existing dependency patch are admitted. No helper source file, shared runtime, package or configuration change is assumed.

| Family | Planned actual-production boundary | Active/opposite assertions |
|---|---|---|
| R1 | Evaluate unchanged installed View and its actual helper/layout code; use controlled Document readiness/body and explicit layout inputs | Both loading/no-body layouts defer only on candidate; same View/iframe/Document actual load recovers with real styles/text. Both ready-body and loading/body-present forward. Complete/interactive no-body still throw. Missing layout/Document retain original no-op. Pending resize/flow is reflected in beforeRender's current layout. |
| L1 | Public Paginator navigation with a deliberately deferred section result | Close/newer request before first resolution cannot create or publish obsolete state; active paired request succeeds. |
| L2 | Actual iframe load continuation plus callback/event reentry | Close/replacement at each callback boundary blocks subsequent old effects; src-less generation change preserves retained native load callbacks. |
| L3 | Actual native load resolver boundary and display microtask scheduling | Fulfilled load stays fulfilled when close precedes display resume; old display settles inertly. Separate pre-load destroy settles explicit cancellation once and removes pending listener. |
| L4 | Two real Views successively retained by the same Paginator | Old continuations/disposal cannot change successor identity, document, section, style/header, overlay, anchor or observer. Newer active completion succeeds. This is future acceptance, not previously proved successor corruption. |
| L5 | Captured View onExpand, public/display-owned setStyles, controlled RAF/fonts continuations | Retained View still expands after same-View navigation with fresh scroll authority. Replaced/closed tasks cannot mutate newer background or expand a successor. |
| L6 | Src-less public navigation while actual native load is pending; overlay dispatch/attach reentry | Same retained load is adopted without disposal/body-null scrolling. Original loader may fulfill while stale display cannot publish. Current operation publishes once and anchors using retained section. Close/replacement while waiting settles inertly. Same-View reentry and delayed old attach are negative controls. |
| L7 | Actual anchor callback, scroll/animation and post-await focus boundaries; real destroy paths | Reentrant retirement blocks old writes/focus/relocation; active overlay/anchor/flow/resize/focus still work. Repeated destroy and body-null cleanup are idempotent, without listener/observer resurrection or successor disposal. |

Harness requirements:
1. Read the installed production source and disclose any unchanged-source extraction/export shim with exact source provenance. Do not reproduce private display/guard algorithms in tests.
2. Constructor/platform shims may supply absent environment primitives, but cannot replace scrolled/columnize, native continuation or publication with fake successful returns.
3. Preserve callback/event reentry and Promise microtask ordering. A test-side deferred section result or controlled RAF release is an input schedule, not permission to replace production operations.
4. Use the exact final detector on actual baseline and candidate. Record named test IDs, raw outputs and assertions; a module-import, missing dependency or harness exception cannot count as red.
5. Require active/opposite controls for every cancellation fence; a suppress-all implementation must fail.
6. If actual installed behavior cannot be exercised within the admitted two test files and allowed shims, stop with the exact infeasible boundary for Brain. No additional dependency/config/source fence is assumed.
7. jsdom/extraction controls cannot certify native Chromium loading/layout timing. Those package controls remain local, even if a portable behavioral suite later passes.

Potential feasibility checks await installation: custom-element/shadow DOM construction, iframe contentDocument/load delivery, Range/geometry methods required by real columnize/scrolled, ResizeObserver instrumentation that preserves meaningful calls, font/RAF scheduling and ability to drive the exact fulfilled-load/display-resume boundary without copying its algorithm. None is currently proved or ruled impossible.

## Resume prerequisites and preserved holds

The next executable gate requires legitimate ordinary dependency access/provisioning; it does not require more personal/local source uploads. Then complete the remaining full session reads and source reads, fresh remote/source/writer/lane/provider checks, normal install/postinstall/patch-package and actual-base controls before corrective edits. Supplement approval does not waive those gates.

After that gate, keep each wave below 40 tool uses, at most two bounded repair passes, exact source fence, both observer disconnects and four independent mode runtimes. Obtain independent implementation/spec/quality review before publication of corrective changes. No main merge, terminal completion, freeze lift, release, installation or distribution is admitted.

LOCAL QUALIFICATION HOLDS remain: owner-machine native Windows ARM64 exact-final package and approved-main integration, executable/ASAR/dist/compiled-source parity, desktop custody/process identity/shutdown, normal library/settings hashes, original full observer session, observer route/census, all four modes and fixed cycles, owned 91-book visibility, unchanged effective product defaults and visible onboarding, native R1/L1–L7 controls, and final Brain package confirmation. Existing diagnostic FAIL receipts remain failures. No portable result substitutes for these.

Repair passes used: 0. Corrective source/test files changed: 0. Tests executed: 0. Implementation approval: absent. Package verdict: WITHHOLD.
