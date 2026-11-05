# POSITION-PROMPT-COPY-1 — PP1 held component assessment

Date: 2026-11-02. **Static component assessment: PASS; no concrete source or test-contract defect found.** Recommendation: preserve the accepted local held candidate and carry the later gates forward. This is a component checkpoint memo, not manual dispatch closeout, whole Seq134 completion, source integration, package acceptance or a new admission. Brain alone coordinates execution.

## Independently inspected bytes and immutable contract

Read both complete courier files, without importing or executing either, only from `C:/Projects/Blurby-artifacts/position-prompt-copy-1-courier-planning-20261102/`:

| Courier file | Raw bytes | Independently computed SHA256 |
|---|---:|---|
| `BacktrackPrompt.tsx` | 1303 | `46e1d8488a28aba707771decce976a626bfef3cd391de49207843e3c9ee7afce` |
| `backtrackPrompt.test.tsx` | 6911 | `fb691512badff6b4df15a2de21c141701732347b90272f67819861a908d45d11` |

Read the full immutable draft and planning check at Git object `090c6872d0a2bc98d5c9cf86f34ae59a89f21f33`, plus the preserved source-separation ruling and current consumed-readiness pointer under `docs/governance/bug-reports/`. Independently recomputed immutable raw hashes:

- `Draft.POSITION-PROMPT-COPY-1.2026-11-02.md`: `e1b953e32762a7197d64e0865f72ce6616d41503bb43a3d82727b7e67abe9b74`.
- `Check.POSITION-PROMPT-COPY-1.PP1.2026-11-02.json`: `20d001c34121283f4f166cecb16693c815c5cd6a1ca93b8254746959c09baf63`.
- `Brain.POSITION-PROMPT-COPY-1.source-separation.2026-11-02.md`: `0172112dfad61f97b2f2da1a6f1292c619f7ee475b0f950d4d136c4260a52dd2`.

Read-only `git show` obtained actual base `ac19ea60b6cd8b4fff3e5413b111925b7ef78485:src/components/BacktrackPrompt.tsx`: 1284 raw bytes, SHA256 `093c55759598d32036c6ba984a0411184f9d5f3bba190985cf9658ee6e6d2627`. The complete base/courier diff contains only the prescribed JSX button relocation and two label changes. Bytes before the JSX return and after the closing dialog are identical.

## Static specification compliance and quality

The first button is `Keep Previous Position (pg{furthestPage})`, with `onKeepFurthest`, primary class, `autoFocus` and type button. The second is `Move Position (pg{currentPage})`, with `onSaveAtCurrent`, secondary class and type button. The approved order/copy changes preserve the original page-value/action/class/focus associations. Props, dialog role and aria-label, callback signature, Enter/Escape capture handling, prevent-default/stop-propagation behavior and listener cleanup are unchanged. No arithmetic, hook, router, CSS or reading-runtime change appears in the supplied component.

All six prescribed named controls exist in the supplied new test:

| Control | Literal mechanism inspected |
|---|---|
| bp1 | Exactly two ordered texts pg53/pg40 from current40/furthest53; button types and dialog label also checked. |
| bp2 | Independent fresh mounts prove first Keep1/Move0 and second Move1/Keep0, with primary/secondary class assertions. |
| bp3 | Attached DOM proves first Keep owns focus and Move lacks autofocus. |
| bp4 | Separate Enter/Escape cases use bubbling, cancelable native events; Keep1/Move0, default prevented and downstream observer0. |
| bp5 | Unmount precedes both key events; neither callback changes. |
| bp6 | Rerender with current7/furthest19 and fresh callbacks proves exact pg19/pg7 labels, current action association and old spies0. |

The test-only `PP1_NEGATIVE_CONTROL` rejects unknown nonempty variants. Wrong-order swaps rendered DOM buttons; wrong-value replaces Keep text with currentPage; wrong-wire installs capture click interceptors calling the opposite current spy with `preventDefault` and `stopImmediatePropagation`, preserving labels/order. Injection cleanup runs before rerender and disposal; injected listeners and the downstream key observer are removed, roots unmounted and containers removed. No production negative prop or source mutation implements these controls. Environment restoration across processes belongs to the external command wrapper; the test does not itself set the environment variable.

Static quality review finds the change narrow and the six controls tied to the actual component. Their jsdom scope does not establish packaged autofocus, visual layout or persisted-position reopening. This review did not execute controls or inspect a remote execution wrapper.

## Separately accepted remote evidence — attributed, not rerun

Root reports reading Brain's complete actual acceptance. The following facts are Brain/courier evidence relayed by Root, rather than independently executed or remotely probed by this reviewer:

- Local held checkpoint `5a660ff9ff3215cd674bd88c430385dc33be0045`, tree `68d84ee3723bd1c8041fcbd4556a1ca1c0cfd92f`, parent `ac19ea60b6cd8b4fff3e5413b111925b7ef78485`, on the admitted quiet-host source path/branch. The courier supplies two raw files, not local Git-object or repository-ancestry proof for that candidate.
- Accepted final receipt SHA256 `9f7a0e449eefcee0e13e93453cb66c15423f55319aee80bd0a32802a6cfbe7b1`, 16292 bytes, with retained hard-linked temporary name. The closed PP1 clock used39/40 aggregate calls, `01:12:06Z` through `01:22:33.153250Z`; one failed session poll is included. This reviewer did not read the remote receipt bytes or verify hard-link identity.
- Target command: `npx vitest run tests/backtrackPrompt.test.tsx tests/keepFurthest.test.tsx tests/useProgressTracker.test.ts`.
- Six qualified runs after an external classifier-only repair: base-red had four causal assertion failures and37 passing cases; candidate-green41 passed; wrong-order failed bp1 order, wrong-value failed bp1 value, wrong-wire failed bp2 association; final-green41 passed. The37 base passes are a mixed passing total, **not**37 pre-existing tests.
- Actual target invocation count was seven: the initial valid base-red was retained, but its classifier expected passed filenames hidden by the reporter; the six-run sequence was then rerun after fixing only that external classification. No component, test or assertion oracle changed in this repair. The six qualified records do not erase the initial invocation or its resource cost.
- Ordered review was MarcusAurelius specification approval, then Plato quality READY for the bounded phase, then external documentation and the local two-file commit. Brain reports2478 pre-existing tracked files byte-identical. Neither this remote whole-tree equality claim nor cumulative commit fence was independently established by the two-file courier inspection.

The consumed-readiness pointer separately records prior dependency/input receipts, exact two-file source fence, isolated source exception and no terminal state promotion. Its phase-only READY was not acceptance of KEEP-FURTHEST-FIX-1 or permission for later integration. This memo does not issue a successor dispatch.

## Remaining acceptance checks and limits

The courier component matches the expected patch and its hashes bind the independently inspected material. Establishing actual candidate Git-object ancestry, complete two-file cumulative fence, old tracked-file equality and remote receipt publication remains dependent on Brain's accepted remote evidence; do not recast this static inspection as an independent repository or host attestation.

No tests, source imports, app launch, native probes, full suite, typecheck, build, package verification, Git mutation, provider mutation or executor contact occurred in this assessment. Only this new memo was authored. No source push or merge is claimed.

KEEP-FURTHEST-FIX-1's existing acceptance wait remains. Separately admitted PP2 full-suite/typecheck/UI-build evidence, authorized integration, final ARM64 package/native route and exact-package owner acceptance remain held. This targeted source checkpoint neither substitutes x64 evidence for ARM64 nor supports “package unchanged.” Seq134 terminal completion and any provider/status/order change remain outside this memo.
