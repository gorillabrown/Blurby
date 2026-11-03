# EINK-DEVICE-SETTINGS-1 — specification

**Shape: (a) design settled; full specification.** Drafted 2026-11-03 against the release-candidate tip `70d64237` (checkout `C:\Projects\Blurby\.worktrees\rc-read`). Every file:line below is from that tree. Rule 36: re-grep at dispatch, because the RC merge to `main` may shift lines.

#### EINK-DEVICE-SETTINGS-1 — Remember E-ink preferences separately on each device

- **What:** The E-ink switch (`einkMode`) and its three sub-settings (`einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping`) become device-local. Cloud sync never uploads them, never downloads them and never merges them. So an E-ink device keeps E-ink on, and a computer or phone that has never turned E-ink on starts in regular mode. A legacy `theme: "eink"` value is also never carried between devices: before schema v15 it meant "E-ink on", and since v15 that meaning lives in the device-local switch.
- **Why:** Smoke R9 (owner): "I have an eink device, I want to always load blurby in eink mode. Otherwise, on my computer and phone, I always want regular mode to load." Smoke R2: "Ensure E-ink is off by default." The source default is already off (`main/migrations.js:327` `einkMode: false`, `src/constants.ts:334`). The defect is the sync path. `pickUserSettings(…, { crossDevice: true })` (`main/migrations.js:354-363`) passes `einkMode`, because `DEVICE_LOCAL_SETTINGS` (`:347`) holds only `launchAtLogin` and `libraryTab`. Every cloud upload (`main/sync-engine.js:816`, `:1043`), merge (`:817`) and download (`:395`, `:822`, `:1066`) therefore carries the E-ink device's switch to the other devices. A second gap: `theme` is shared. A cloud copy written by an older version can hold `theme: "eink"`. The v14→v15 migration (`main/migrations.js:191-199`) runs only when a file loads, not when cloud data is applied to a file already at v15. So a downloaded `"eink"` theme would give a computer the E-ink colours with the switch off (`src/components/ThemeProvider.tsx:188-191` resolves `"eink"` as a theme).
- **Scope in:** the device-local key set; the legacy-theme filter on the cross-device path; tests.
- **Scope out:** making any non-E-ink setting device-local (the owner's sentence could be read more widely; see "Owner note" below); the E-ink contrast key that EINK-APPEARANCE-2 adds (that item adds it to the same set); UI changes; migrations (no schema bump: existing local choices are kept as they are).
- **Outcome (one sentence):** A cloud upload, merge or download never moves `einkMode`, `einkWpmCeiling`, `einkRefreshInterval`, `einkPhraseGrouping` or a `theme: "eink"` value between devices, while each device's own saved values persist across restarts.
- **Prerequisites:** EINK-CONTROLS-1 (schema v15, the switch carries the colours), which is carried by the RC integration window (`docs/planning/specs/2026-11-03/RC-INTEGRATION-WINDOW.md`, tip 15). **Encoded wait:** dispatch only after the RC integration merge is on `origin/main`. Check: `git merge-base --is-ancestor 70d64237 origin/main` exits 0.
- **Done when:**
  1. **Red first (standing rule 43):** commit the test changes alone, before the change. On the base they fail by assertion (not by import or syntax error), and the failing output is recorded in the staging memo. The red set:
     - `tests/einkDeviceSettings.test.ts` (d1), (d2);
     - `tests/settingsKeyTrust.test.js` (g) new rows, (r1) with the seeded `einkMode`, and the new (r5).

     The controls (d3), (d4), (d5) and the unchanged (g) rows pass on the base.
  2. After the change, PowerShell: `npx vitest run tests/einkDeviceSettings.test.ts tests/settingsKeyTrust.test.js tests/settingsKeyTrustKeys.test.ts tests/appTabsSettings.test.js tests/settingsNarrateNormalization.test.js tests/settingsBandMigration.test.ts tests/settingsMigrationV15.test.js tests/einkControls.test.tsx` exits 0.
  3. PowerShell: `npm test` exits 0, with passed ≥ the base count + the new tests and 0 failed. `npm run typecheck` exits 0 (standing rule 48). `npm run build` is not required: nothing under `src/` changes, but it runs as part of rule 53 anyway.
  4. **Fence (standing rule 41):** `git diff --name-status <base>..HEAD -- . ':!docs'` lists exactly:
     - `M main/migrations.js`;
     - `A tests/einkDeviceSettings.test.ts`;
     - `M tests/settingsKeyTrust.test.js`.

     `src/types.ts`, `src/components/ReaderContainer.tsx`, `src/utils/FlowScrollEngine.ts` and `main/sync-engine.js` are untouched. The time log `docs/governance/close-outs/Timing.EINK-DEVICE-SETTINGS-1.jsonl` is exempt.
  5. **Package (standing rule 53):** the (a)–(e) evidence goes in the close-out's "Package verification" section. The packaged exe re-runs this live row (standing rule 54; LL-165 profile proof first):
     - Scratch profile A: turn the E-ink switch on in Settings → Theme, wait 1 s (the save-settings debounce, `main/ipc/state.js:41-47`), quit, relaunch. The root carries `data-eink="true"`, read through the inspector (LL-166).
     - No-action control on the same build: scratch profile B is never touched, and after relaunch has no `data-eink`.
     - The live `%APPDATA%\blurby\blurby-data\settings.json` and `library.json` hashes do not change.
  6. **Owner (gate (2) list, batched):** on the E-ink device, Blurby opens in E-ink. On the computer, after a sync, it opens in regular mode. This needs two devices and a cloud account, so it is owner-observed (standing rule 45); the unit rows (g), (r1) and (r5) are the automated proof.
- **Effort:** S.
- **Owners:** implementation agent (bounded, main-process scope); spec-compliance review, then quality review; Blurby.Brain1 for package confirmation; Blurby.Roadmap for the merge go; the owner at gate (2).
- **Source:** `docs/planning/roadmap-reviews/2026-10-26-smoke-triage.md:36`, `:48`, `:144-152` (R2, R9); ROADMAP.md `#eink-device-settings-1` stub (`ROADMAP.md:1880-1881` in the planning checkout).
- **Path:** dispatch.
- **Owner note (does not block):** R9 opens with "Settings should also be tied to a device, not an account". The stub's title and acceptance limit this item to E-ink preferences. If the owner wants other settings device-local too (theme, text sizes, library layout), that is a separate item with its own key list. This spec does not decide it.

##### Implementation detail

- **Edit sites (rc-read @ 70d64237):**
  - `main/migrations.js:345-347`: extend the comment and the set:
    `const DEVICE_LOCAL_SETTINGS = new Set(["launchAtLogin", "libraryTab", "einkMode", "einkWpmCeiling", "einkRefreshInterval", "einkPhraseGrouping"]);`
    The comment names EINK-DEVICE-SETTINGS-1: the E-ink switch and its sub-settings belong to the display, not the account.
  - `main/migrations.js:354-363` (`pickUserSettings`): after the existing `if (crossDevice && DEVICE_LOCAL_SETTINGS.has(key)) continue;` (`:359`), add
    `if (crossDevice && key === "theme" && input[key] === "eink") continue; // a pre-v15 theme value means "E-ink on", which is device-local`
    One line in the one function every cross-device path already calls. Why here: `main/sync-engine.js` needs no edit, because upload (`:816`, `:1043`), merge (`:817`) and download (`:395`) all go through `pickUserSettings(…, { crossDevice: true })`.
  - Nothing else. The local save path, `save-settings` (`main/ipc/state.js:35`), calls `pickUserSettings` without `crossDevice`, so local saves keep every E-ink key.
- **Tests:**
  - **New** `tests/einkDeviceSettings.test.ts`. It loads `main/migrations.js` with `createRequire` (the `tests/settingsKeyTrustKeys.test.ts:9-10` pattern) and imports `DEFAULT_SETTINGS` from `../src/constants`. Describe block: "EINK-DEVICE-SETTINGS-1 device-local E-ink settings".
    - (d1) `pickUserSettings({ einkMode: true, einkWpmCeiling: 200, einkRefreshInterval: 10, einkPhraseGrouping: false, wpm: 300 }, { crossDevice: true })` `toEqual({ wpm: 300 })`. Red on base: base returns all five keys.
    - (d2) `pickUserSettings({ theme: "eink", wpm: 300 }, { crossDevice: true })` `toEqual({ wpm: 300 })`, and `pickUserSettings({ theme: "dark" }, { crossDevice: true })` `toEqual({ theme: "dark" })`. Red on base for the first assertion.
    - (d3) Control: `pickUserSettings({ einkMode: true, einkWpmCeiling: 200, einkRefreshInterval: 10, einkPhraseGrouping: false })` (no `crossDevice`) `toEqual` its input. The local path keeps them.
    - (d4) Control: `SETTINGS_DEFAULTS.einkMode === false` and `DEFAULT_SETTINGS.einkMode === false`. A clean profile starts off.
    - (d5) Control, migration preserved:
      - `loadSettingsData({ schemaVersion: 15, theme: "dark", einkMode: true })` `toEqual({ schemaVersion: 15, theme: "dark", einkMode: true })`;
      - `loadSettingsData({ schemaVersion: 14, theme: "eink" })` gives `theme: "light"`, `einkMode: true`, `schemaVersion: 15`.
  - **Modified** `tests/settingsKeyTrust.test.js`:
    - `:137`: current
      `const FORBIDDEN_CLOUD_KEYS = ["_wsPairingToken", "sourceFolder", "recentFolders", "schemaVersion", "launchAtLogin"];`
      → intended: the same plus `"einkMode", "einkWpmCeiling", "einkRefreshInterval", "einkPhraseGrouping"`.
    - `:148-151` (`seedCloud`): add `einkMode: true` to the seeded cloud object. (r1)'s merge path then proves the merged upload drops it. Red on base.
    - `:235-241` (g) `it.each` rows: add
      - `["einkMode", () => true]`,
      - `["einkWpmCeiling", () => 120]`,
      - `["einkRefreshInterval", () => 5]`,
      - `["einkPhraseGrouping", () => false]`,
      - `["theme", () => "eink"]`.

      The existing assertion `expect(settings[key]).toEqual(before)` is unchanged. The local fixture (`:172`) has none of these keys, so `before` is `undefined`. Red on base.
    - New (r5), inside `describe("SETTINGS-KEY-TRUST-1 cloud upload attacks")` (`:266-304`): "(r5) an upload never carries this device's E-ink settings". It sets `settings.einkMode = true; settings.einkWpmCeiling = 200; settings.einkRefreshInterval = 10; settings.einkPhraseGrouping = false;`, then `await initSync(); await syncEngine.startSync();`. Assertion: `expect(["einkMode", "einkWpmCeiling", "einkRefreshInterval", "einkPhraseGrouping"].filter((k) => Object.hasOwn(cloud(), k))).toEqual([])`. Red on base.
    - `:338-342` (n): current
      `for (const [key, value] of Object.entries(UI_WRITES)) expect(settings[key]).toEqual(value);`
      → intended:
      `const DEVICE_LOCAL = ["einkMode", "einkWpmCeiling", "einkRefreshInterval", "einkPhraseGrouping"]; for (const [key, value] of Object.entries(UI_WRITES)) if (!DEVICE_LOCAL.includes(key)) expect(settings[key]).toEqual(value); for (const key of DEVICE_LOCAL) expect(Object.hasOwn(settings, key)).toBe(false);`
      The title becomes "(n) the cloud download applies every shared UI key and no device-local one". This is a pinned test named under standing rule 50: its old assertion encodes the defect. (m)'s count of 38 (`:330`) is unchanged.
- **Constants:** none.
- **Branch:** `eb/eink-device-settings-1` from `origin/main` after the RC integration merge.
- **Staging plan:** explicit paths only: `main/migrations.js`, `tests/einkDeviceSettings.test.ts`, `tests/settingsKeyTrust.test.js`. The red commit stages the two test paths alone. `tests/perf-baseline-results.json` stays unstaged. Never `git add -A` (LL-172: diff `git status --porcelain` against this list before each commit).
- **Failure handling:**
  - If (n) or another existing test fails for a reason other than the E-ink keys, stop and return it to Blurby.Brain1; do not widen the fence.
  - If `main/migrations.js` no longer has `DEVICE_LOCAL_SETTINGS` at dispatch (renamed by another merge), re-grep and stop if its meaning changed (rule 50: re-read the waiver against the new location).
  - If EINK-APPEARANCE-2 has already merged a new E-ink key, add that key to the set and say so in the memo.
  - Retry ceiling: two repair passes, then stop with an issue file.
  - Rollback: `git revert -m 1 <merge>`. The change is filter-only: reverting restores cross-device E-ink and loses no local data.
- **Execution host:** RodneySr, canonical clone `C:\Users\estra\Projects\Blurby`, worktree `C:\Users\estra\Projects\Blurby\.worktrees\eink-device-settings-1`. Create it with `git -C C:/Users/estra/Projects/Blurby worktree add -b eb/eink-device-settings-1 .worktrees/eink-device-settings-1 origin/main`, and confirm `git rev-parse --git-common-dir` before starting. Prerequisites: RodneySr reachable and idle, `npm ci` at the base. Push with `git push origin HEAD:refs/heads/eb/eink-device-settings-1` (LL-181).
- **Package verification:** standing rule 53. Build the `--dir` package on RodneySr (x64) from the final commit with `origin/main` merged in, and run the arm64 launch on Rodney before the merge go (the RC-window pattern). The live row is Done-when 5. `main/migrations.js` is under `build.files`, so "package unchanged" does not apply.
- **Lane ownership:** Lane D (Platform/Main Process). Product lane: Platform & Maintenance.
- **Forbidden during parallel run:** `main/sync-engine.js`, `main/ipc/state.js`, every `src/` file, `src/types.ts`, `ReaderContainer.tsx`, `FlowScrollEngine.ts`.
- **Shared-core touches:** none.
- **Merge order:** before EINK-APPEARANCE-2 (both edit `main/migrations.js` and `tests/settingsKeyTrust.test.js`). Independent of EINK-FLOW-VIEWPORT-1 and EINK-MODE-AVAILABILITY-1, which may run beside it.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Red tests (d1, d2, g rows, r1 seed, r5) committed alone and shown failing on the base; controls pass | repeat | positive-control | bounded | medium | 4m (median of 20 runs) | — | — |
| 2 | E-ink keys and a legacy E-ink theme never cross devices; local saves keep them | calculable | settings-filter | bounded | low | 10m | — | — |
| 3 | Named suites, full suite and typecheck green; fence matches exactly | calculable | verify | mechanical | low | 10m | — | — |
| 4 | Rule 53 package with the restart live row and its no-action control recorded | repeat | packaging-verify | bounded | medium | 12m (median of 4 runs) | — | — |

**Total:** chain 36m · sum 36m; 2 of 4 estimated tasks calibrated (priced by kind from the medians the timing tool printed for `ROADMAP.md:1866-1868` on 2026-11-03; rows 2–3 are this author's estimate: one two-line edit; one suite run of about 3m plus typecheck). Re-price at launch with `timing --rows-from-spec`.

##### Lessons applied

- **Standing rule 43 (LL-138):** the red commit precedes the change, with controls (d3)–(d5) that pass on the base.
- **Standing rule 44 (LL-143):** every gate names PowerShell and an exact exit code. **Owed before dispatch:** dry-run receipts for Done-when 2 and 4 against the base, the prescribed edit and one wrong variant (for example, only `einkMode` added). This planning pass ran nothing.
- **Standing rule 48 (LL-149):** `npm run typecheck` is in Done-when 3 because the new test is TypeScript.
- **Standing rule 50 (LL-156):** test (n)'s "applies every UI key" was effectively a waiver for the defect. It is brought into scope and restated.
- **Standing rule 53 (LL-167) and LL-165:** package verification with a scratch-profile proof and live-profile hashes.
- **Standing rule 54 (LL-158):** the restart row names its committing trigger (the save-settings debounce, then quit) and has a no-action control.
- **Standing rule 55 (LL-166):** the live verdict reads `data-eink` from the root, not a screenshot.
- **Standing rule 45 (LL-141):** the two-device check is owner-observed and batched into gate (2).
- **LL-172:** stage exact paths and check `git status --porcelain` before each commit.
- **LL-181:** worktree under the canonical clone's `.worktrees`; push with an explicit refspec.
- **Standing rule 51 (LL-164):** this spec appends no lesson-status line.
- **Considered, not applicable:** LL-120/LL-139/LL-174 (no reader runtime or callback chain), LL-142/LL-173 (no audio), LL-157/LL-159 (quit flush is unchanged and already merged), LL-169/LL-170 (no Foliate or word identity). Run the U9 check at dispatch: `virtuoso_registry --root . lessons --check <spec> --item EINK-DEVICE-SETTINGS-1`, under rule 11a's guard.
