# ERROR-LOG cap fix: memo (2026-11-05)

Dispatch: Blurby.Brain1, 2026-11-05 (Job 2). Branch `eb/error-log-cap-fix` from `origin/main` `14ce3d24`. Host: RodneySr.

## Problem
ERROR-LOG-CAP-1 made `main/error-log.js` the one error.log appender, with a 10 MB cap that rotates to `error.log.1`. `main/library-write.js` kept a private `logToFile` that appended straight to `errorLogPath`, so the failed-unlink log in `writeConversionResult` bypassed the cap.

## Change
- `main/library-write.js`: the local `logToFile` is removed; `const { logToFile } = require("./error-log");` replaces it. `fsPromises` stays for `unlink`.
- `tests/errorLogSingleAppender.test.js` (red first, commit `5fd9c0e5`):
  - (a) walks every file under `main/` and fails on any `appendFile(errorLogPath` outside `main/error-log.js`;
  - (b) with `error.log` one byte under the cap, `writeConversionResult`'s failed-unlink path rotates it to `error.log.1` and starts a new file holding only that line.

## Evidence (C:\Projects\Blurby-artifacts\error-log-cap-fix\)
- Red on the base: both rows fail (`red-base.txt`).
- Green: targeted 2/2 (`green-targeted.txt`); `npm test` 233 files, 3,050 passed / 1 skipped / 0 failed (`npm-test.txt`); `npm run typecheck` exit 0; `npm run build` exit 0.
- `tests/perf-baseline-results.json` was rewritten by the suite and is not committed.

## Package verification
See the rule 53 x64 pair section below (added after the package run).
