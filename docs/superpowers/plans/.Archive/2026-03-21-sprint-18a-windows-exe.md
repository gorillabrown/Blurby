# Sprint 18A: Windows .exe Production Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a production-grade Windows installer for Blurby with dual-architecture CI (x64 + ARM64), auto-update via delta downloads, and branded NSIS installer.

**Architecture:** Extend existing `release.yml` with build matrix and `workflow_dispatch`. Add `publish` provider config to `package.json` for electron-updater feed URL. Create branded installer assets (ICO + BMP). Verify auto-updater end-to-end.

**Tech Stack:** electron-builder 26, electron-updater 6, GitHub Actions, NSIS, softprops/action-gh-release

**Spec:** `docs/superpowers/specs/2026-03-21-sprint-18a-windows-exe-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `assets/icon.png` | Replace | High-res app icon (512x512 or 1024x1024 PNG) — **user must provide** |
| `assets/icon.ico` | Create | Multi-size ICO (16/32/48/64/128/256px) generated from icon.png |
| `assets/installer/installerHeader.bmp` | Create | 150x57px BMP — Blurby logo, white background |
| `assets/installer/installerSidebar.bmp` | Create | 164x314px BMP — Blurby branding, orange accent |
| `package.json` | Modify | NSIS config update, add `publish` provider, update `win.icon` to `.ico` |
| `.github/workflows/release.yml` | Rewrite | Matrix build (x64+arm64), workflow_dispatch, publish job, checksums |
| `main/window-manager.js` | Modify | Bump auto-update delay from 5s to 10s |

---

## Prerequisites

**BLOCKER: High-resolution app icon.** The current `assets/icon.png` is a 32x32px placeholder (118 bytes). A production installer needs a high-res source icon (at minimum 256x256, ideally 512x512 or 1024x1024) to generate the multi-size ICO and BMP assets. The user must provide this before Task 1 can begin.

---

## Task 0: Obtain High-Res Icon (User Action)

**Files:**
- Replace: `assets/icon.png` (currently 32x32 placeholder)

The user must supply a high-resolution Blurby app icon (PNG, 512x512px minimum). This is a prerequisite for all subsequent tasks.

- [ ] **Step 1: User provides high-res icon**

Place a high-res PNG (512x512 or larger) at `assets/icon.png`, replacing the current 32x32 placeholder. This will be the source for generating all installer artwork.

---

## Task 1: Generate Installer Assets

**Files:**
- Create: `assets/icon.ico`
- Create: `assets/installer/installerHeader.bmp`
- Create: `assets/installer/installerSidebar.bmp`

**Depends on:** Task 0 (high-res icon must exist)

- [ ] **Step 1: Create `assets/installer/` directory**

```bash
mkdir -p assets/installer
```

- [ ] **Step 2: Generate multi-size ICO from icon.png**

Use a PNG-to-ICO tool (e.g., `png-to-ico` npm package, ImageMagick, or online converter) to create `assets/icon.ico` containing sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256.

```bash
# Option A: Using ImageMagick (if available)
magick assets/icon.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico

# Option B: Using npm package
npx png-to-ico assets/icon.png > assets/icon.ico
```

Verify the ICO file is valid and contains multiple sizes (should be >10KB).

- [ ] **Step 3: Create installer header BMP (150x57px)**

Create `assets/installer/installerHeader.bmp`:
- Dimensions: exactly 150x57 pixels
- Format: 24-bit BMP (no alpha channel — NSIS requirement)
- Content: Blurby logo scaled to fit, white (#FFFFFF) background
- The logo should be right-aligned with ~8px padding

```bash
# Using ImageMagick:
magick assets/icon.png -resize 45x45 -gravity East -background white -extent 150x57 BMP3:assets/installer/installerHeader.bmp
```

- [ ] **Step 4: Create installer sidebar BMP (164x314px)**

Create `assets/installer/installerSidebar.bmp`:
- Dimensions: exactly 164x314 pixels
- Format: 24-bit BMP (no alpha channel)
- Content: Blurby logo at top (~80x80px), orange (#D04716) accent stripe (4px wide) running vertically below it, white (#FFFFFF) background

```bash
# Using ImageMagick:
magick -size 164x314 xc:white \
  \( assets/icon.png -resize 80x80 \) -gravity North -geometry +0+20 -composite \
  -fill "#D04716" -draw "rectangle 80,120 83,294" \
  BMP3:assets/installer/installerSidebar.bmp
```

- [ ] **Step 5: Verify all assets exist and have correct dimensions**

```bash
ls -la assets/icon.ico assets/installer/installerHeader.bmp assets/installer/installerSidebar.bmp
# icon.ico should be >10KB (multi-size)
# installerHeader.bmp should be ~25KB (150x57 24-bit)
# installerSidebar.bmp should be ~150KB (164x314 24-bit)
```

- [ ] **Step 6: Commit assets**

```bash
git add assets/icon.ico assets/installer/
git commit -m "assets: add ICO and branded NSIS installer graphics"
```

---

## Task 2: Update package.json — NSIS Config & Publish Provider

**Files:**
- Modify: `package.json:16-51` (build config section)

- [ ] **Step 1: Update the `build` section in package.json**

Replace the current `build` section with the updated config. Key changes:
- Add `"publish"` array with GitHub provider (tells electron-updater where to find updates)
- Update `"win.icon"` from `.png` to `.ico`
- Replace NSIS config: remove `installerHeaderIcon` (invalid key), add `installerHeader`, `installerSidebar`, `installerIcon`, `uninstallerIcon`, `menuCategory`, `runAfterFinish`; change `createDesktopShortcut` from `true` to `"always"`; keep `shortcutName`

The full `build` section should become:

```json
{
  "build": {
    "appId": "com.blurby.app",
    "productName": "Blurby",
    "publish": [
      {
        "provider": "github"
      }
    ],
    "files": [
      "main.js",
      "preload.js",
      "main/**/*",
      "dist/**/*"
    ],
    "directories": {
      "output": "release"
    },
    "win": {
      "target": "nsis",
      "icon": "assets/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerHeader": "assets/installer/installerHeader.bmp",
      "installerSidebar": "assets/installer/installerSidebar.bmp",
      "installerIcon": "assets/icon.ico",
      "uninstallerIcon": "assets/icon.ico",
      "createDesktopShortcut": "always",
      "createStartMenuShortcut": true,
      "shortcutName": "Blurby",
      "menuCategory": true,
      "runAfterFinish": true
    },
    "mac": {
      "target": "dmg",
      "icon": "assets/icon.png",
      "category": "public.app-category.productivity"
    },
    "linux": {
      "target": "AppImage",
      "icon": "assets/icon.png",
      "category": "Utility"
    }
  }
}
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 3: Run tests to verify no regressions**

```bash
npm test
```

Expected: 293 tests pass

- [ ] **Step 4: Run build to verify electron-builder accepts new config**

```bash
npm run build
```

Expected: Vite build succeeds (this only builds the renderer; the full electron-builder packaging runs in CI)

- [ ] **Step 5: Commit**

```bash
git add package.json
git commit -m "config: update NSIS branding, add publish provider for auto-updater"
```

---

## Task 3: Update Auto-Updater Delay

**Files:**
- Modify: `main/window-manager.js:171-173`

The current auto-update check runs after 5 seconds. The spec calls for 10 seconds to avoid blocking app startup.

- [ ] **Step 1: Change the setTimeout delay from 5000 to 10000**

In `main/window-manager.js`, line 171, change:

```javascript
// Before:
setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch (err) {
  console.log("Auto-update check failed:", err.message);
} }, 5000);

// After:
setTimeout(() => { try { autoUpdater.checkForUpdates(); } catch (err) {
  console.log("Auto-update check failed:", err.message);
} }, 10000);
```

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: 293 tests pass

- [ ] **Step 3: Commit**

```bash
git add main/window-manager.js
git commit -m "config: increase auto-update check delay to 10s"
```

---

## Task 4: Rewrite Release Workflow

**Files:**
- Rewrite: `.github/workflows/release.yml`

This is the largest task — transforms the single-job workflow into a matrix build with a separate publish job.

- [ ] **Step 1: Replace `.github/workflows/release.yml` with the new workflow**

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release (e.g., 1.0.1)'
        required: true
        type: string

permissions:
  contents: write

jobs:
  build:
    strategy:
      matrix:
        arch: [x64, arm64]
    runs-on: windows-latest
    name: Build (${{ matrix.arch }})

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        if: matrix.arch == 'x64'
        run: npm test

      - name: Typecheck
        if: matrix.arch == 'x64'
        run: npm run typecheck

      - name: Build renderer
        run: npm run build

      - name: Package Windows installer (${{ matrix.arch }})
        run: npx electron-builder --win --arch ${{ matrix.arch }}
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: blurby-${{ matrix.arch }}
          path: |
            release/*.exe
            release/*.blockmap
            release/latest*.yml
          if-no-files-found: error

  publish:
    needs: build
    runs-on: ubuntu-latest
    name: Publish Release

    steps:
      - name: Download x64 artifacts
        uses: actions/download-artifact@v4
        with:
          name: blurby-x64
          path: artifacts/

      - name: Download arm64 artifacts
        uses: actions/download-artifact@v4
        with:
          name: blurby-arm64
          path: artifacts/

      - name: Generate SHA-256 checksums
        run: |
          cd artifacts
          sha256sum *.exe *.blockmap > checksums.sha256
          cat checksums.sha256

      - name: Determine version
        id: version
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "tag=v${{ github.event.inputs.version }}" >> $GITHUB_OUTPUT
          else
            echo "tag=${{ github.ref_name }}" >> $GITHUB_OUTPUT
          fi

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.version.outputs.tag }}
          files: |
            artifacts/*.exe
            artifacts/*.blockmap
            artifacts/latest*.yml
            artifacts/checksums.sha256
          generate_release_notes: true
          draft: true
          prerelease: ${{ contains(steps.version.outputs.tag, '-beta') || contains(steps.version.outputs.tag, '-rc') }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Key design decisions in this workflow:
- **Tests and typecheck only run on x64 leg** — no need to run them twice since code is identical, only the packaging differs
- **Build jobs run in parallel** (x64 and arm64 simultaneously)
- **Publish job runs on `ubuntu-latest`** (cheaper, faster — only downloads artifacts and creates release)
- **`sha256sum`** generates checksums on Linux (available by default)
- **Draft releases** — allows reviewing release notes before publishing
- **`workflow_dispatch`** creates the tag name from the version input

- [ ] **Step 2: Validate YAML syntax**

```bash
node -e "const yaml=require('yaml'); yaml.parse(require('fs').readFileSync('.github/workflows/release.yml','utf8')); console.log('Valid YAML')" 2>/dev/null || python -c "import yaml; yaml.safe_load(open('.github/workflows/release.yml')); print('Valid YAML')"
```

If neither works (no yaml parser available), visually inspect indentation. The workflow syntax will be validated by GitHub on push.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: dual-architecture release workflow with delta updates

Add x64 + ARM64 build matrix, workflow_dispatch trigger,
SHA-256 checksums, and draft releases via softprops/action-gh-release.
Blockmaps and latest.yml manifests uploaded for auto-updater."
```

---

## Task 5: Update ROADMAP.md — Remove Code Signing from Sprint 18A

**Files:**
- Modify: `ROADMAP.md` (Sprint 18A section)

The user explicitly decided not to do code signing. Update the roadmap to reflect this.

- [ ] **Step 1: Update Sprint 18A spec in ROADMAP.md**

In the Sprint 18A section (around line 1213), update:
- Remove 18A-1 (code signing certificate) entirely
- Update the goal statement to remove "signed" language
- Update acceptance criteria: remove signing-related items, add ARM64 and delta updates
- Update agent assignments to reflect actual tasks

- [ ] **Step 2: Commit**

```bash
git add ROADMAP.md
git commit -m "docs: update Sprint 18A roadmap — remove code signing, add ARM64 + deltas"
```

---

## Task 6: Verify End-to-End (Manual)

This task is performed manually by the user after all code changes are pushed.

- [ ] **Step 1: Push all changes to GitHub**

```bash
git push origin master
```

- [ ] **Step 2: Verify CI passes on push**

Check that `ci.yml` passes (tests + build) on the push.

- [ ] **Step 3: Tag and push a test release**

```bash
# Ensure package.json version matches
git tag v1.0.0
git push origin v1.0.0
```

- [ ] **Step 4: Monitor the release workflow**

Go to GitHub Actions and verify:
- Both x64 and arm64 build legs complete successfully
- Artifacts are uploaded (`.exe`, `.blockmap`, `latest*.yml`)
- Publish job creates a draft release with all artifacts + `checksums.sha256`

- [ ] **Step 5: Download and install the x64 build**

Download the x64 `.exe` from the draft release, install it, launch Blurby, verify it runs.

- [ ] **Step 6: Test auto-update**

1. Bump version in `package.json` to `1.0.1`
2. Commit, tag `v1.0.1`, push
3. Wait for CI to complete and publish
4. Open the installed v1.0.0 Blurby — it should detect the update within 10 seconds
5. Verify the "Update ready" notification appears
6. Click to install — app should restart with v1.0.1

- [ ] **Step 7: Test ARM64 build on ARM64 device**

Download the arm64 `.exe` from the release, install on ARM64 device, verify it runs natively.

---

## Summary

| Task | What | Depends On | Parallelizable |
|------|------|-----------|----------------|
| 0 | User provides high-res icon | — | — |
| 1 | Generate installer assets (ICO + BMP) | Task 0 | — |
| 2 | Update package.json (NSIS + publish) | Task 1 (needs icon.ico) | — |
| 3 | Update auto-updater delay | — | Yes (with Task 1-2) |
| 4 | Rewrite release workflow | — | Yes (with Task 1-3) |
| 5 | Update ROADMAP.md | — | Yes (with Task 1-4) |
| 6 | End-to-end verification (manual) | Tasks 1-5 pushed | — |

**Tasks 3, 4, and 5 have no dependencies on Tasks 1-2 and can be done in parallel.**
