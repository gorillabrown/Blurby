# PDF-CANVAS-ARM64-1 — PDF text reads natively on Windows arm64

*Authored 2026-11-03 by Blurby.Roadmap (planner) from Findings F-012 and Blurby.Brain1's technical ruling of 2026-11-03. Register: Seq 123.5, Queued, Full Spec, lane Platform & Maintenance. Effort: low. Path: dispatch.*

## Goal

The Windows arm64 install reads PDFs with the native `@napi-rs/canvas` binding (PDF.js's `DOMMatrix`, `ImageData` and `Path2D`) instead of the polyfills in `main/pdf-text.js`. Today both installers are built from a lockfile that pins `@napi-rs/canvas` 0.1.80, and that release has no `win32-arm64` package.

## Problem (verified)

- `pdf-parse` 2.4.5 is the latest release and Blurby's pin (`^2.4.5`). It depends on `@napi-rs/canvas` at exactly `0.1.80`. `pdfjs-dist` 5.4.296 asks for `^0.1.80`.
- The `optionalDependencies` of `@napi-rs/canvas@0.1.80` list `@napi-rs/canvas-win32-x64-msvc`, but no win32-arm64 package. `@napi-rs/canvas@0.1.100` lists both `canvas-win32-x64-msvc` and `canvas-win32-arm64-msvc` (npm registry, read 2026-11-03). The arm64 package first shipped in 0.1.85.
- `package-lock.json` at `c5bb507f` locks `node_modules/@napi-rs/canvas-win32-x64-msvc` and no arm64 package (line 2134).
- `main/pdf-text.js:9` loads the binding lazily. When the load fails, `ensurePdfGlobals()` (lines 12–26) logs `Note: @napi-rs/canvas not available, using polyfills…` and installs stub classes.
- `docs/governance/RELEASE_RUNBOOK.md` line 80 records the gap as accepted "until the lockfile gains the ARM64 package". PDF-IMPORT-DIAG-1 found that the polyfills still converted both owner test PDFs. The stub `Path2D` and identity `DOMMatrix` are untested on vector-heavy pages.

## Design decisions (Blurby.Brain1 ruling, 2026-11-03)

1. Add `"@napi-rs/canvas": "0.1.100"` to `package.json` `overrides`, beside the existing `"onnxruntime-node": "1.24.3"`. 0.1.100 is the last 0.1.x release, so it stays inside `pdfjs-dist`'s `^0.1.80`. Do not take 1.x, which is a major bump past both declared ranges.
2. Regenerate the lockfile with `npm install`. Never hand-edit `package-lock.json`.
3. No source change. `main/pdf-text.js` keeps its fallback for platforms without a binding.
4. Part (b) of F-012 (measuring whether the polyfill degrades extraction) is not measured separately. Done-when D3 covers it, because the fix removes the polyfill path on both Windows architectures.

## Baseline

`origin/main` at the cut, a descendant of `c5bb507f` (the RC integration merge). Record the cut SHA in the close-out. Release gate (2) item (v), "PDF opens and reads on the arm64 install", stays as written until this ships.

## Execution host (rule 6b)

- **Implementation, suite, x64 package:** RodneySr (the quiet machine, x64), in worktree `C:\Users\estra\Projects\Blurby\.worktrees\pdf-canvas-arm64-1`, branch `eb/pdf-canvas-arm64-1`. Create it with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/pdf-canvas-arm64-1 .worktrees/pdf-canvas-arm64-1 origin/main`. Push with `git push origin HEAD:refs/heads/eb/pdf-canvas-arm64-1` (LL-181).
- **arm64 package and native arm64 launch:** Rodney (owner's ARM64 machine), from the pushed branch tip, in `C:\Projects\Blurby\.worktrees\pdf-canvas-arm64-1`. This is the runbook's validated arm64 path: an ordinary `npm ci` on the ARM64 host. Rule 53 requires the native arm64 launch, and only Rodney is native arm64.
- **Prerequisites to verify before launch:** both hosts have npm ≥ 10 (for `--cpu`/`--os`) and network access to the npm registry. Rodney has room for a second `node_modules`.

## WHERE (read order)

1. `docs/governance/Findings.md` — F-012.
2. `package.json` — `overrides` (line 99), `build.asarUnpack` (line 46, which unpacks `node_modules/@napi-rs/**`).
3. `package-lock.json` — the `node_modules/@napi-rs/canvas*` entries (lines 1966–2150 at `c5bb507f`).
4. `main/pdf-text.js` — lines 1–40 (`getCanvas`, `ensurePdfGlobals`). Read only.
5. `tests/epub-converter.test.js:546` — the existing `ensurePdfGlobals` import. Read only. The new test must not depend on its order.
6. `docs/governance/RELEASE_RUNBOOK.md` — lines 45–80: *Host architecture*, *Build x64* native checks, *Build ARM64* native checks, and the line-80 note.
7. `docs/governance/LESSONS_LEARNED.md` — LL-165 (inspector read-back), LL-167 (package verification), LL-181 (push refspec).

## Tasks

| # | Task | Files | Effort | Notes |
|---|---|---|---|---|
| T1 | Add the override and regenerate the lockfile. | `package.json`, `package-lock.json` | low | Add `"@napi-rs/canvas": "0.1.100"` under `overrides`, then run `npm install` (RodneySr). `npm ls @napi-rs/canvas` must show only 0.1.100, deduped, with no `invalid` or `ELSPROBLEMS`. The lockfile must carry `node_modules/@napi-rs/canvas-win32-x64-msvc` and `node_modules/@napi-rs/canvas-win32-arm64-msvc`, both `0.1.100`, and `node_modules/@napi-rs/canvas` at `0.1.100`. |
| T2 | Add a native-canvas PDF test. | `tests/pdfCanvasNative.test.js` (new) | low | See *Test design* below. |
| T3 | Update the release runbook. | `docs/governance/RELEASE_RUNBOOK.md` | low | Make both build checks require that architecture's canvas binding (see *Runbook edits* below). |
| T4 | Run the suite, typecheck and build. | — | low | `npm test`, `npm run typecheck`, `npm run build` on RodneySr. |
| T5 | Package verification on both architectures (rule 53). | close-out only | low | See D1–D4. |

### Test design (T2)

The fixture is generated in the test with `pdfkit`, which is already a dependency. No binary fixture is committed.

- Page 1 has two lines in two standard fonts: `Helvetica` "Blurby arm64 canvas check" and `Times-Roman` "Second font line 2026".
- Page 2 has a vector drawing (`moveTo`/`lineTo`/`bezierCurveTo`, a filled rectangle and a stroked circle) plus the text "Vector page text".

The test calls `extractPdfText(buffer)` from `main/pdf-text.js`. It asserts that the extracted text contains all three strings, in order. Where a binding for the host platform resolves (`require("@napi-rs/canvas")` succeeds), it also asserts `globalThis.DOMMatrix === require("@napi-rs/canvas").DOMMatrix` after the call. That proves the native path ran rather than the polyfill.

Isolation: vitest runs each file in its own context. Do not set or delete `globalThis.DOMMatrix` before the call. If the context already has `DOMMatrix` (a future Node), skip the identity assertion and say so in the test name; the text assertions still run.

### Runbook edits (T3)

- *Build x64* native check: also require `@napi-rs\canvas-win32-x64-msvc\` in the x64 package's `app.asar.unpacked` `.node` list, and reject `@napi-rs\canvas-win32-arm64-msvc\`.
- *Build ARM64* line 72: add `'@napi-rs\canvas-win32-arm64-msvc\'` to the `foreach ($need …)` list. Add a guard that rejects `@napi-rs\canvas-win32-x64-msvc\`.
- Line 80: replace the "There is no `@napi-rs/canvas` ARM64 binding … accepted until the lockfile gains the ARM64 package" sentences. The new text says both packages carry their own architecture's binding since PDF-CANVAS-ARM64-1 (override `0.1.100`; F-012).

## Execution sequence

T1 → T2 → T3 (T2 and T3 may run in parallel) → T4 → spec-compliance review → quality review → T5 (D2, D3, D3b, D4) → documentation pass → close-out. This is one wave, well under the tool budget.

## Done when (SUCCESS CRITERIA)

- **D1. Lockfile.** `package-lock.json` has `node_modules/@napi-rs/canvas`, `…/canvas-win32-x64-msvc` and `…/canvas-win32-arm64-msvc`, all at `0.1.100`. `npm ls @napi-rs/canvas` exits 0 and shows only 0.1.100. `git diff --name-only <cut>..HEAD` lists only `package.json`, `package-lock.json`, `tests/pdfCanvasNative.test.js`, `docs/governance/RELEASE_RUNBOOK.md` and close-out or documentation-pass files.
- **D2. Packaged natives.** Each package carries only its own architecture's binding under `resources/app.asar.unpacked/node_modules/@napi-rs/`:
  - the x64 package (built on RodneySr) has `canvas-win32-x64-msvc/*.node` and no arm64 one;
  - the arm64 package (built on Rodney) has `canvas-win32-arm64-msvc/*.node` and no x64 one.

  Record evidence from the runbook's updated `.node` scans, not from `asar list`. `asarUnpack` puts the bindings outside the asar.
- **D3. Native extraction in the packaged app, both architectures.** Write the T2 fixture to a file. Run this extraction check inside each packaged build:

  `ELECTRON_RUN_AS_NODE=1 <unpacked>\Blurby.exe <check.cjs> <unpacked>\resources\app.asar <fixture.pdf>`

  The check script loads `<app.asar>/main/pdf-text.js` and calls `extractPdfText`. It prints the text and whether `globalThis.DOMMatrix` is the canvas binding's. The check script stays in the close-out evidence folder, not the repo.

  Pass requires all of these:
  - all three fixture strings, in order;
  - native `DOMMatrix` true;
  - no `@napi-rs/canvas not available` line in stdout or stderr;
  - the same extracted text on x64 and arm64.

  If `ELECTRON_RUN_AS_NODE` is refused by the packaged exe, stop and report it to Blurby.Brain1. Do not substitute a plain-Node run.
- **D3b. In-app import, both architectures (Blurby.Brain1, 2026-11-03).** `main/pdf-text.js` loads the binding only when a PDF is parsed, so a plain launch proves nothing. Steps:
  1. In each packaged build, on a scratch profile with the LL-165 profile proof, import the T2 fixture PDF through the app's own import path.
  2. Check stdout, stderr and the profile's `error.log`. Each must have 0 lines matching `@napi-rs/canvas not available`.
  3. Check that the imported doc's extracted text equals the fixture's text.
  4. **Positive control:** the same import on an arm64 package built from `c5bb507f` on Rodney must show that line at least once. That proves the detector can see the failure.

  Record the outputs of all four steps in the close-out.
- **D4. Rule 53.** Build `--dir` for both architectures from the final commit and from `origin/main`. Then run a 25 s native-arm64 scratch-profile launch of the arm64 build on Rodney (the `launch25.mjs` pattern; LL-165), with no error or crash. Check the asar contents against `origin/main`'s: the only difference is the canvas package set. Write a "Package verification" section in the close-out, and get Blurby.Brain1's package confirmation before the merge go.
- **D5. Suite.** `npm test` is green, at least 2,452 passed plus the new test, 0 failed, run on RodneySr. `npm run typecheck` exits 0. `npm run build` exits 0. The existing PDF tests (`tests/pdfLoadDocContent.test.js`, `tests/pdf-export.test.js` and the `ensurePdfGlobals` case in `tests/epub-converter.test.js`) all pass.
- **D6. Runbook.** The three edits in T3 are present. The x64 and arm64 native checks fail when a package lacks its canvas binding. Prove this by running each check's `if` expression against a list with that line removed, and quote the output in the close-out.
- **D7. Findings and gate.** In the close-out: F-012's disposition is recorded as resolved by this item, with evidence D2 and D3. Gate (2) item (v) stays in the smoke checklist for the release smoke; this item does not remove it.

## Lane ownership / parallel fences

- **Owns:** execution surfaces D (Platform: `package.json`, `package-lock.json`) and E (the runbook). Product lane: Platform & Maintenance.
- **Forbidden during a parallel run:** any `main/`, `src/` or `preload.js` file, and any other `package.json` field than `overrides`.
- **Shared-core touches:** none.
- **Merge order:** the dispatch runs one at a time in Seq order (Blurby.Brain1 ruling), after FOCUS-WORD-ONLY-1 (123). Any sprint that changes `package-lock.json` later must rebase on this one.

## Out of scope

- `@napi-rs/canvas` 1.x.
- Upgrading `pdf-parse` or `pdfjs-dist`.
- Changing the polyfill code in `main/pdf-text.js`.
- macOS and Linux packaging.
- Removing gate (2) item (v).

## Prerequisites

None in the register. The RC integration merge (`c5bb507f`) is already on `main`. By Seq order this runs after the five post-RC items, with no technical dependency on them.

## Lessons applied

- **Standing rule 53 (promoted from LL-167):** the item is not done until both packages are verified. D2–D4 check natives by architecture, D3 extracts text inside each packaged exe, and Blurby.Brain1 confirms the package before the merge go.
- **LL-165:** the native arm64 launch proves which profile it opened (scratch profile, inspector read-back) before acting.
- **LL-181:** the worktree sits under each canonical clone's `.worktrees`, and pushes use the explicit `eb/` refspec.
- **LL-089:** the dependency is changed by an npm `overrides` entry and a regenerated lockfile, never by a patched or hand-edited copy.

## Roadmap card

ROADMAP.md is at its 2,000-line ceiling. Its card is added in the same change that archives the 21 RC items' cards at their close-out. Until then, this file plus the register row's Spec Reference are the specification.
