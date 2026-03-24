# Auto-Update End-to-End Test Procedure

## Purpose

Verify the complete auto-update pipeline works from tag creation through CI build, install, update detection, download, and application. This procedure tests the `electron-updater` integration (`autoUpdater.autoDownload = true`, `autoUpdater.autoInstallOnAppQuit = true`) and the two IPC channels exposed to the renderer: `check-for-updates` and `install-update`.

---

## Prerequisites

- GitHub repo access with push permissions (to create and push tags)
- Windows machine for testing (x64 or ARM64 — release.yml builds both)
- A clean install location; no previously installed Blurby version
- The draft release must be **published** before the updater will detect it — `electron-updater` does not detect draft releases
- `GH_TOKEN` / `GITHUB_TOKEN` is handled by GitHub Actions automatically; no local token needed for CI

---

## Architecture Notes (for context)

`setupAutoUpdater()` in `main/window-manager.js` runs 10 seconds after app launch. It sets `autoDownload = true` and `autoInstallOnAppQuit = true`, then calls `autoUpdater.checkForUpdates()`. When an update is found:

- Main process sends `update-available` IPC event to the renderer with the new version string
- Main process sends `update-downloaded` IPC event when the download completes

The renderer can also trigger a manual check via the `check-for-updates` IPC handle, and trigger immediate install via `install-update` (calls `autoUpdater.quitAndInstall()`). These are the channels wired in `main/ipc-handlers.js` (lines 879–894).

The publish provider is `github` (configured in `package.json` `build.publish`). Release assets are built to `release/` and include `.exe`, `.blockmap`, and `latest*.yml` files. Delta updates are supported via the `.blockmap` files.

User data lives in `%APPDATA%\blurby` (Electron's `app.getPath('userData')`). Data files (`settings.json`, `library.json`, `history.json`) must survive the update.

---

## Test Procedure

### Step 1: Build and Install the Base Version

1. Check out a clean state of the branch you want to test from.
2. Set a test version in `package.json` — use a version that will not conflict with real releases, e.g. `0.9.9-test`.
3. Commit the version bump:
   ```
   git add package.json
   git commit -m "chore: bump version to 0.9.9-test for update E2E test"
   ```
4. Create and push the tag:
   ```
   git tag v0.9.9-test
   git push origin v0.9.9-test
   ```
5. Wait for the `Release` workflow to complete in GitHub Actions (both `Build (x64)` and `Build (arm64)` jobs, then the `Publish Release` job). Expected: approximately 10–15 minutes.
6. In GitHub, find the draft release created for `v0.9.9-test`. **Publish it** (remove draft status). The auto-updater checks published releases only.
7. Download `Blurby-Setup-0.9.9-test.exe` (x64 or ARM64 to match your test machine) from the release assets.
8. Run the installer on the test machine. Accept defaults or choose a custom directory — NSIS allows directory selection (`allowToChangeInstallationDirectory: true`).
9. Launch Blurby. Navigate to **Settings > Help**.
10. Expected: version shown is `0.9.9-test`.
11. Add a book to the library and record its title — you will verify it survives the update in Step 5.

---

### Step 2: Build the Update Version

1. On the development machine, bump `package.json` version to `0.9.10-test`.
2. Commit and tag:
   ```
   git add package.json
   git commit -m "chore: bump version to 0.9.10-test for update E2E test"
   git tag v0.9.10-test
   git push origin v0.9.10-test
   ```
3. Wait for the `Release` workflow to complete.
4. In GitHub, find the draft release for `v0.9.10-test` and **publish it**. This is the step that makes the update detectable.

---

### Step 3: Verify Automatic Update Detection

1. On the test machine (running the installed `0.9.9-test` build), wait up to 15 seconds after launch. The auto-updater fires `checkForUpdates()` 10 seconds after startup.
2. Expected: an "Update available" notification or banner appears in **Settings > Help** (driven by the `update-available` IPC event sent from main to renderer with the new version string).
3. If the notification does not appear within 30 seconds, trigger a manual check: in Settings > Help, click the **Check for updates** button (which calls the `check-for-updates` IPC handle).
4. Expected: the UI reports that version `0.9.10-test` is available.

---

### Step 4: Verify Download and Apply

1. Because `autoDownload = true`, the download begins automatically when the update is detected. Expected: a download progress indicator appears in the UI.
2. When download completes, the main process sends `update-downloaded` to the renderer. Expected: a "Restart to update" button (or equivalent prompt) appears in Settings > Help.
3. Click **Restart to update**. This calls the `install-update` IPC handle, which invokes `autoUpdater.quitAndInstall()`.
   - Alternatively, quit and relaunch the app — `autoInstallOnAppQuit = true` means the update applies on the next quit.
4. Expected: the app closes and the NSIS installer runs silently to apply the update, then relaunches Blurby.

---

### Step 5: Verify Post-Update State

1. After the app relaunches, navigate to **Settings > Help**.
2. Expected: version shows `0.9.10-test`.
3. Open the Library. Expected: the book added in Step 1 is still present — data in `%APPDATA%\blurby` was not removed by the update.
4. Verify settings are intact (theme, WPM, any customizations made before the update).
5. Open a document and verify reading progress is preserved.

---

### Step 6: Verify Delta Update (Optional)

1. In the GitHub release for `v0.9.10-test`, check the release assets. Expected: both a full `.exe` installer and a `.blockmap` file are present for each architecture.
2. The `.blockmap` file enables `electron-updater` to download only the changed blocks rather than the full installer. To verify delta was used, check the electron-updater log file:
   - Path: `%APPDATA%\blurby\logs\updater.log` (or check Electron's log output)
   - Look for log entries indicating a partial/delta download rather than a full download.
3. Expected: the download size is smaller than the full installer size shown in the release assets.

---

## Cleanup

After the test is complete, remove the test tags and releases to keep the repository clean.

**Delete tags locally and remotely:**
```
git tag -d v0.9.9-test
git push --delete origin v0.9.9-test
git tag -d v0.9.10-test
git push --delete origin v0.9.10-test
```

**Delete draft/published releases from GitHub:**
Navigate to the Releases page, find `v0.9.9-test` and `v0.9.10-test`, and delete them.

**Revert the version bump in package.json:**
```
git revert <commit-hash-of-version-bump>
```
Or manually restore `package.json` to the correct production version and commit.

**Uninstall the test build from the test machine:**
Use Add/Remove Programs or the uninstaller created by NSIS (Start Menu > Blurby > Uninstall).

---

## Expected Results

| Step | Check | Expected | Pass/Fail |
|------|-------|----------|-----------|
| 1 | CI workflow completes for v0.9.9-test | Both x64 and arm64 builds succeed; release published | |
| 1 | Install base version | Installer runs, app launches | |
| 1 | Version in Settings > Help | Shows `0.9.9-test` | |
| 3 | Auto-update detection (within 15s of launch) | "Update available" notification for `0.9.10-test` | |
| 3 | Manual check fallback | `check-for-updates` IPC returns `0.9.10-test` | |
| 4 | Download progress | Progress indicator shown during download | |
| 4 | Download complete | `update-downloaded` event triggers "Restart to update" prompt | |
| 4 | Apply update | App quits and relaunches after `quitAndInstall()` | |
| 5 | Post-update version | Settings > Help shows `0.9.10-test` | |
| 5 | Library preserved | Books added before update still present | |
| 5 | Settings preserved | Theme, WPM, and other settings intact | |
| 5 | Reading progress preserved | Progress markers intact for open documents | |
| 6 | Delta update (optional) | Download size smaller than full installer | |

---

## Troubleshooting

**Update not detected after 30 seconds:**
- Confirm the release is published (not draft). The auto-updater ignores draft releases.
- Check that `latest.yml` (or `latest-arm64.yml`) was uploaded to the release assets — this file is what `electron-updater` reads to determine the latest version.
- Check the updater log at `%APPDATA%\blurby\logs\` for error messages.
- Confirm the test machine has internet access and can reach `github.com`.

**Download fails:**
- Verify release assets include both `.exe` and `.blockmap` files for the correct architecture.
- Check Windows Firewall or proxy settings.
- Check the updater log for HTTP error codes.

**Apply fails (app does not relaunch after quitAndInstall):**
- Check Windows Event Viewer (Application log) for NSIS errors.
- Try the `autoInstallOnAppQuit` path instead: quit the app normally and relaunch manually.
- Verify the installer was not blocked by antivirus (unsigned installer warning is expected — code signing is an explicit non-goal for this project).

**Data lost after update:**
- Check that `%APPDATA%\blurby` still contains `library.json`, `settings.json`, `history.json`.
- NSIS updates should not touch the user data directory; if data was lost, file a bug against the NSIS uninstall/reinstall behavior.
- The migration framework in `main/migrations.js` runs on startup and handles schema changes — check its output if settings appear reset to defaults.

**Version in Settings > Help still shows old version after restart:**
- Confirm `autoUpdater.quitAndInstall()` was actually called (check logs).
- Try a full uninstall and clean install of the `0.9.10-test` version as a fallback verification.

---

## Notes

- This is a **manual** test procedure. The two-build requirement (one installed base, one live update) cannot be automated in a single CI run without a dedicated test environment.
- Run this procedure before each major release (i.e., before tagging `v1.0.0` and before any `v1.x.y` release thereafter).
- Use version numbers with a `-test` suffix (e.g., `0.9.9-test`, `0.9.10-test`) to avoid polluting the real release history. These will be treated as prerelease by `softprops/action-gh-release` only if they contain `-beta` or `-rc` — `-test` suffixes produce standard releases, so be sure to delete them promptly.
- The release workflow runs tests (`npm test`) and typechecks (`npm run typecheck`) only on the x64 matrix job. Both matrix jobs must succeed before the publish job runs.
- Estimated total time for one full run of this procedure: 45–60 minutes (dominated by two CI build cycles of ~15 minutes each).
