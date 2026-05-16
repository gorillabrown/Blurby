# Roadmap Review — Phase D Lessons Applied (2026-05-02)

## Lessons Checklist (by theme)

### CSS & Theming
- **PR-7:** CSS custom properties for all theming — no inline styles.
  - EINK-6A: ✅ Embodied — spec explicitly requires `[data-eink]` CSS attribute selector, CSS custom properties for e-ink behavioral overrides.
  - GOALS-6B: ✅ Widget styling through global.css, no inline styles.

### React Patterns
- **PR-12:** Context for cross-cutting concerns; props for direct parent-child data.
  - EINK-6A: ✅ `einkMode` wired through SettingsContext.
  - GOALS-6B: ✅ Goals stored in settings, accessed via SettingsContext.
- **PR-17:** Never drive imperative DOM animations from React useEffect — use a plain class.
  - EINK-6B: ⚠️ Stepped Flow mode adds chunk-based advance timing. Spec references existing FlowScrollEngine (plain class), not useEffect. OK.
  - GOALS-6B: N/A — no animations.

### Data Integrity
- **PR-10:** All JSON writes must be atomic (write-tmp + rename).
  - GOALS-6B: ✅ Goal progress stored in settings JSON (inherits existing atomic write path).

### Settings & Runtime
- **PR-26:** Settings that control a runtime engine must have explicit sync bridges.
  - EINK-6A: ✅ `einkMode` setting controls WPM cap and refresh overlay — spec explicitly updates `useEinkController` to check `settings.einkMode`.
  - GOALS-6B: N/A — goals don't control a runtime engine.

### Test & Build
- **PR-2 / PR-3:** After code change → `npm test`; after UI change → `npm run build`.
  - All sprints: ✅ SUCCESS CRITERIA include `npm test` passes and `npm run build` succeeds.

### Dispatch Sizing
- **SRL-012:** Solon and Plato parallel-eligible for Full-tier sprints.
  - EINK-6A: ✅ Tasks 8 (Solon) and implicit quality review are post-implementation.
  - EINK-6B: ✅ Same pattern.
  - GOALS-6B: ✅ Same pattern.

## Standing Rules Updates

New `### Standing Rules All Skeletons Inherit` section added to ROADMAP.md with 10 rules drawn from the Persistent Rules table in LESSONS_LEARNED.md. All universally applicable rules captured. Sprint-specific lessons (e.g., foliate word-span rendering, pagination boundary math) are NOT standing rules — they apply only to sprints touching those subsystems.

## Skeletons Reviewed

### Newly Written
- **SK-HYG-1:** Governance-only sprint. No code changes beyond brand commit. Lessons N/A (no implementation).

### Existing (already in ROADMAP.md)
- **EINK-6A:** All relevant lessons embodied. No updates needed.
- **EINK-6B:** All relevant lessons embodied. Stepped Flow uses FlowScrollEngine (plain class per PR-17). No updates needed.
- **GOALS-6B:** All relevant lessons embodied. Goal data inherits atomic writes via settings JSON. No updates needed.

## Summary

| Skeleton | Lessons Checked | Applied | Flagged | N/A |
|----------|----------------|---------|---------|-----|
| SK-HYG-1 | 10 | 0 | 0 | 10 (governance only) |
| EINK-6A | 10 | 6 | 0 | 4 |
| EINK-6B | 10 | 5 | 0 | 5 |
| GOALS-6B | 10 | 5 | 0 | 5 |
