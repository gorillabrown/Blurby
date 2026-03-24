# Agent Findings Intake Queue — Blurby

This is the centralized intake queue for findings from Blurby specialist agents. Agents write raw findings here; the user and Cowork triage them into `ROADMAP.md` for scoping and implementation.

## Workflow

1. **Agent writes finding** — after investigation, audit, or QA pass
2. **User + Cowork triage** — review findings, assign severity, scope effort, decide priority
3. **Promote to Roadmap** — accepted items get a sprint assignment in `ROADMAP.md`
4. **Mark as triaged** — change status from `NEW` to `TRIAGED → Sprint N` or `DEFERRED` or `WONTFIX`

## Finding Template

```markdown
### [FINDING-ID] Short Title
- **Status**: NEW | TRIAGED → Sprint N | DEFERRED | WONTFIX
- **Source Agent**: agent-name
- **Date**: YYYY-MM-DD
- **Severity**: CRITICAL | SIGNIFICANT | MODERATE | LOW
- **Category**: Electron | React | Format | UX | Performance | Build | Data | Documentation
- **Root Cause**: [Brief root cause or "investigation needed"]
- **Files Affected**: [file1:lineN, file2:lineN]
- **Fix Spec**: [Brief description of required change]
- **Test Impact**: None | New tests needed | Existing tests affected
- **Effort Estimate**: Trivial (<30 min) | Small (1-2 hr) | Medium (half day) | Large (full day+)
```

---

## Active Findings

### AF-001: Extract Hardcoded Constants to Dedicated Constants File
- **Status**: NEW
- **Source Agent**: cowork (workflow integration review)
- **Date**: 2026-03-24
- **Severity**: MODERATE
- **Category**: Electron | React | Data
- **Root Cause**: Tunable behavioral values are scattered across main process modules and renderer components as inline literals. This makes them hard to find, adjust, and audit.
- **Files Affected**: Multiple — requires codebase audit. Known examples include:
  - Default WPM value (likely in settings defaults or reader hooks)
  - Default word count per flow page (ScrollReaderView or related)
  - Snooze intervals (SnoozePickerOverlay — 1h, 8PM, 8AM, Sat 9AM, Mon 8AM)
  - Toast auto-dismiss duration (ToastContext — 5s for undo)
  - Coaching toast display limit (HotkeyCoach — show-once tracking)
  - LRU cache sizes (main process — cover image cache, etc.)
  - Sync intervals and retry counts (sync-engine.js)
  - Tombstone TTL (sync-engine.js — 30 days)
  - Reconciliation period (sync-engine.js — 7 days)
  - Staging cleanup threshold (sync-engine.js — 24 hours)
  - G-sequence timeout (useKeyboardShortcuts — 2 seconds)
  - Bottom bar fade opacity (ReaderBottomBar — ~8%)
  - Page transition duration (PageReaderView — 100ms)
  - Image minimum dimensions (url-extractor — 200x200)
  - Cover compression target (sync-engine — 200KB)
  - Metered connection thresholds
- **Fix Spec**: Create `src/constants.ts` (renderer) and `main/constants.js` (main process). Extract all hardcoded behavioral values into named exports. Group by domain (reader, sync, library, UI). CSS custom properties for theming remain in `global.css` (exempt). Main process constants stay CommonJS; renderer constants stay ESM/TypeScript.
- **Test Impact**: Existing tests affected — imports change. No new tests needed beyond verifying values match originals.
- **Effort Estimate**: Medium (half day) — codebase audit + extraction + test updates

---

## Resolved Findings

*(None yet.)*
