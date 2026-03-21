# Sprint 18A: Windows .exe Production Hardening — Design Spec

**Date:** 2026-03-21
**Status:** Approved design, pending implementation plan
**Prerequisite:** Sprint 17 complete (verified)
**Scope:** Production-ready Windows installer with auto-update, branding, and dual-architecture CI

---

## Goal

Ship a production-grade Windows installer for Blurby that auto-updates via GitHub Releases, supports both x64 and ARM64, and presents a branded installation experience. No code signing.

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Code signing | **Not doing** | Cost/complexity not justified at current stage. SmartScreen will warn on first install. |
| Update source | GitHub Releases + website download links | Auto-updater uses GitHub Releases; stable URLs work for future landing page |
| Architectures | x64 + ARM64 | ARM64 for Snapdragon/Copilot+ PCs; developer has ARM64 device for testing |
| Installer style | Branded NSIS (assisted mode) | Custom graphics, install directory picker, shortcut options |
| Delta updates | Enabled via blockmaps | ~10MB deltas vs ~100MB full; auto-fallback to full on failure |
| Release trigger | Git tag (`v*`) + manual workflow dispatch | Standard Electron practice; manual dispatch as escape hatch |
| Enterprise features | Out of scope | No silent install, no file associations, no per-machine option |

---

## Section 1: Build Matrix & CI

### Current State

- `release.yml` triggers on `v*` tags, builds x64 only on `windows-latest`
- `ci.yml` runs tests + build on push/PR (win + linux matrix) — unchanged by this sprint

### Changes

**Add `workflow_dispatch` trigger** to `release.yml` with a `version` string input. When triggered manually, the workflow uses this version; when triggered by tag, it extracts the version from the tag name.

**Expand build matrix** to `[x64, arm64]`:
- Both legs run on `windows-latest` (GitHub-hosted runner, x64)
- ARM64 cross-compiles via electron-builder's `--arch arm64` flag (no ARM64 runner needed)
- Each leg runs: `npm ci` → `npm run build` → `npx electron-builder --win --arch {arch}`

**Artifact collection**:
- Each matrix leg uploads its installer `.exe`, `.blockmap`, and `latest{-arm64}.yml` as workflow artifacts
- A `publish` job (runs after both builds complete) downloads all artifacts and creates/updates the GitHub Release

**SHA-256 checksums**:
- The `publish` job generates `checksums.sha256` covering all `.exe` and `.blockmap` files
- Published as an additional release asset

**Release notes**:
- Auto-generated from commits since the previous tag using GitHub's built-in release notes generation
- Release is created as a draft so notes can be edited before publishing (for manual dispatch; tag-triggered releases can also be draft for review)

### Files Affected

- `.github/workflows/release.yml` — major rewrite (matrix, dispatch, publish job)

---

## Section 2: Auto-Updater & Delta Updates

### Current State

- Sprint 6 wired `autoUpdater` events in `main/window-manager.js`
- `check-for-updates` IPC handler exists
- Settings > Help page has update check UI
- Not verified end-to-end with real GitHub Releases

### Changes

**Enable blockmaps** in `package.json` electron-builder config:
```json
{
  "build": {
    "publish": [{ "provider": "github" }],
    "nsis": {
      "differentialPackage": true
    }
  }
}
```

electron-builder auto-generates:
- `Blurby-Setup-{version}-x64.exe.blockmap` alongside x64 installer
- `Blurby-Setup-{version}-arm64.exe.blockmap` alongside ARM64 installer
- `latest.yml` (x64 manifest) and `latest-arm64.yml` (ARM64 manifest)

The auto-updater reads the correct manifest based on `process.arch`.

**Update flow** (verify existing Sprint 6 wiring):
1. App startup → delay 10 seconds → `autoUpdater.checkForUpdates()`
2. Update found → download delta in background (or full installer as fallback)
3. Download complete → emit `update-downloaded` event
4. Renderer shows notification banner: "Update ready — restart to apply"
5. User clicks → `autoUpdater.quitAndInstall()`

**Fallback**: if delta download fails or blockmap is missing, electron-updater automatically downloads the full installer. No custom code needed.

### Files Affected

- `package.json` — electron-builder `publish` and `nsis` config
- `main/window-manager.js` — verify existing auto-updater wiring, adjust if needed

---

## Section 3: NSIS Installer Branding

### Current State

- Basic NSIS config in `package.json`
- No custom installer graphics
- Default electron-builder NSIS behavior

### Changes

**Branded graphics** in `assets/installer/`:

| Asset | Dimensions | Format | Content |
|-------|-----------|--------|---------|
| `installerHeader.bmp` | 150x57px | BMP | Blurby logo on white background, shown top-right during wizard steps |
| `installerSidebar.bmp` | 164x314px | BMP | Blurby branding with orange (#D04716) accent, shown on welcome and finish pages |

**NSIS config** in `package.json`:
```json
{
  "build": {
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerHeader": "assets/installer/installerHeader.bmp",
      "installerSidebar": "assets/installer/installerSidebar.bmp",
      "installerIcon": "assets/icon.ico",
      "uninstallerIcon": "assets/icon.ico",
      "createDesktopShortcut": "always",
      "createStartMenuShortcut": true,
      "menuCategory": true,
      "runAfterFinish": true
    }
  }
}
```

**Installer behavior**:
- Assisted mode (not one-click) — user sees install directory picker and shortcut options
- Desktop shortcut checkbox (opt-in via `createDesktopShortcut: "always"` which shows the checkbox)
- Start Menu entry created automatically
- "Launch Blurby" checkbox on finish page
- App icon shown on the installer `.exe` itself

**Uninstaller**:
- Removes all application files, registry entries, Start Menu and desktop shortcuts
- **Preserves** user data directory (`%APPDATA%/Blurby`) — library, settings, history survive uninstall/reinstall
- This is electron-builder's default NSIS behavior (only uninstalls app directory)

### Files Affected

- `package.json` — NSIS config section
- New: `assets/installer/installerHeader.bmp`
- New: `assets/installer/installerSidebar.bmp`

---

## Section 4: Release Artifacts

Each release on GitHub Releases contains:

| Artifact | Purpose |
|----------|---------|
| `Blurby-Setup-{version}-x64.exe` | x64 NSIS installer |
| `Blurby-Setup-{version}-x64.exe.blockmap` | Delta update data for x64 |
| `Blurby-Setup-{version}-arm64.exe` | ARM64 NSIS installer |
| `Blurby-Setup-{version}-arm64.exe.blockmap` | Delta update data for ARM64 |
| `latest.yml` | Auto-updater manifest for x64 |
| `latest-arm64.yml` | Auto-updater manifest for ARM64 |
| `checksums.sha256` | SHA-256 hashes of all `.exe` and `.blockmap` files |

**Website download links**: GitHub's stable URL pattern `https://github.com/{owner}/{repo}/releases/latest/download/{filename}` always points to the most recent release. A landing page links directly to these — no separate file hosting needed.

---

## Section 5: Testing & Verification

**CI verification**: Both matrix legs must produce installers successfully. Workflow fails if either architecture fails to build.

**End-to-end auto-update test** (manual, one-time after pipeline is built):
1. Bump version to `0.1.0`, tag and push → CI builds and publishes
2. Install x64 build on a Windows machine
3. Bump version to `0.1.1`, tag and push → CI builds and publishes
4. Confirm installed app detects update, downloads delta, applies after restart
5. Repeat steps 2-4 for ARM64 on ARM64 device

**Regression**: `npm test` (293 tests) and `npm run build` must pass before any release tag is pushed. The existing `ci.yml` gates this on push/PR.

**No new unit tests needed**: This sprint is CI config, electron-builder config, and asset creation. The auto-updater code already exists from Sprint 6.

---

## Out of Scope

- Code signing (explicit decision — not doing)
- Portable .exe (only NSIS installer)
- `.blurby` file association
- Silent install (`/S` flag)
- Per-user vs per-machine install option
- Landing page (just ensuring URLs are stable for one)
- Linux builds (CI runs linux for tests but doesn't produce installers)
