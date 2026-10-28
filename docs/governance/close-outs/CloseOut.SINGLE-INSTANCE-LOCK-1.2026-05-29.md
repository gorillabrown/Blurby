# Close-Out: SINGLE-INSTANCE-LOCK-1 — Electron Main-Process Single-Instance Gate

**Date:** 2026-05-29
**Branch:** `sprint/single-instance-lock-1`
**Baseline:** clean main at v1.75.1
**Result:** Complete

## Summary

Added the standard Electron single-instance lock pattern to `main.js`. A second launcher invocation now focuses the existing window instead of spawning a duplicate. The fix is ~10 LOC: `app.requestSingleInstanceLock()` gate before `app.whenReady()`, with a `second-instance` event handler that restores/focuses the existing window.

## Root Cause

No single-instance lock was implemented. Each `main.js` invocation independently called `app.whenReady()` and created a new `BrowserWindow`. Confirmed by Evan 2026-05-28: "Two windows opened successfully" from two Start menu launches.

## Deliverables

1. **`main.js`** — Three changes:
   - `app.requestSingleInstanceLock()` gate: if lock not acquired, `app.quit()` immediately
   - `app.on("second-instance")` handler: restores minimized window, brings to focus
   - All lifecycle handlers (`whenReady`, `window-all-closed`, `will-quit`) wrapped inside the `else` block so they only execute in the primary instance

## Validation

- `npm test` green: 3,014 tests pass (0 new — behavior verified by manual smoke)
- `npm run build` green (pre-existing `Circular chunk` warning is BUG-182, not from this sprint)
- Manual smoke test PASS (Evan confirmed post-merge): launch once, launch again from Start menu, only one window remains and the existing window focuses/restores.

## Files Changed

- `main.js` — single-instance lock gate + second-instance handler
- `CLAUDE.md` — queue depth, most recent sprint
- `ROADMAP.md` — header, completed table, spec removed, positions renumbered
- `docs/planning/.Archive/ROADMAP_legacy.md` — archived SINGLE-INSTANCE-LOCK-1 spec
