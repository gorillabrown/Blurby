# Blurby Desktop Release Runbook (Windows, manual)

How to build, check, upload and publish a Blurby desktop release by hand. No workflow does this: `.github/workflows/release.yml` was deleted in `e9bbf56a` (2026-03-31) and `ci.yml` only tests. Written and validated by RELEASE-RUNBOOK-1 (2026-10-22) on `main` @ `6dc951ee` (Electron 42.11.18, electron-builder 26.15.3, electron-updater 6.8.9, npm 11.9.0) on the owner's ARM64 Windows machine. Every build, merge and checksum command below was run there without publishing (version `1.75.1`, output listed in `docs/governance/close-outs/Memo.RELEASE-RUNBOOK-1.GovernanceStaging.2026-10-22.md`). The commands that write to GitHub (`gh release create`, `gh release upload`, `gh release edit`, `gh release delete`) are shown here and were never run by that item.

Run everything in PowerShell 7 (`pwsh`), from the root of a checkout of the release commit. A git worktree works, because the build passes the GitHub repository explicitly (see Build x64). Who runs it: the owner, or Blurby.Roadmap on the owner's go, after release gate (2), the batched owner smoke, passes.

## Inputs

Set these three values first; every later step reads them.

```powershell
$Version   = '<x.y.z>'            # the release version: the owner decides it at release time
$Tag       = "v$Version"          # GitHub release tag; electron-updater compares versions, not tag names
$SmokedSha = '<40-char sha>'      # the main commit the owner smoked in gate (2); the build is that commit plus the version bump only
```

The version must be greater than the version installed on users' machines (the last published release is `v1.1.2`; `main`'s `package.json` says `1.75.1`), or electron-updater offers nothing.

## Preflight

```powershell
git fetch origin --prune
git switch --detach $SmokedSha                       # or a fresh worktree: git worktree add --detach <dir> $SmokedSha
if (git status --porcelain) { throw 'tree not clean' }
if ((git rev-parse HEAD) -ne $SmokedSha) { throw 'not on the smoked commit' }
git merge-base --is-ancestor $SmokedSha refs/remotes/origin/main; if ($LASTEXITCODE) { throw 'smoked commit is not on origin/main' }
gh auth status                                       # must show the account with write access to gorillabrown/Blurby
gh release view $Tag 2>$null; if (-not $LASTEXITCODE) { throw "$Tag already exists" }
```

The full suite, typecheck and build must already be green on `$SmokedSha`. That evidence comes from release gate (1) (the quiet-machine run) and gate (2) (the owner smoke on a production build of that commit). Do not re-run them here as a substitute: the runbook builds what was proven, it does not prove it.

## Version bump

The only change between the smoked commit and the build is the version.

```powershell
git switch -c "eb/release-$Version"
npm version $Version --no-git-tag-version            # edits package.json and package-lock.json only
git diff --name-only $SmokedSha                      # must print exactly: package-lock.json, package.json
git commit -am "Release $Version" ; $ReleaseSha = git rev-parse HEAD
git push origin "HEAD:refs/heads/eb/release-$Version"
```

Merge `eb/release-$Version` into `main` with `--no-ff` after Publish succeeds, so `main` carries the published version. GitHub creates the tag `$Tag` at `$ReleaseSha` when the draft is published (Publish), so do not create the tag by hand.

## Build x64

**Host architecture.** `npm ci` installs only the host's optional native packages. On an ARM64 machine an ordinary `npm ci` leaves out the x64 builds of `sharp` and `@napi-rs/canvas`, so an x64 package built after it would carry ARM64 natives and no PDF canvas binding (PDF import would fall back to pdf-parse's polyfills). On an x64 host, a plain `npm ci` is enough. On an ARM64 host, install the x64 optional packages explicitly, as below. npm keeps only one `--cpu` value, so each architecture gets its own `npm ci`, and a single `--x64 --arm64` electron-builder run is never used (validated: its x64 package was 237.6 MB with ARM64 natives).

**Repository.** `package.json` has no `repository` field, and electron-builder otherwise reads the GitHub owner from `.git/config`, which a worktree does not have (its `.git` is a file). Without the three `-c.publish.*` overrides the web-installer build fails (`Cannot read properties of null (reading 'provider')`) and `app-update.yml` would ship without `provider`, `owner` and `repo`, which breaks updates. Always pass them.

```powershell
Remove-Item -Recurse -Force release -ErrorAction SilentlyContinue      # release/ is gitignored build output
npm ci --os=win32 --cpu=x64                          # on an x64 host: npm ci
npm run build                                        # the renderer bundle (dist/), architecture-independent
npx electron-builder --win --x64 --publish never -c.publish.provider=github -c.publish.owner=gorillabrown -c.publish.repo=Blurby
if ($LASTEXITCODE) { throw 'x64 build failed' }
Move-Item release/nsis-web/latest.yml release/latest-x64.yml           # the ARM64 build writes its own latest.yml
Get-ChildItem release/win-unpacked/resources/app.asar.unpacked -Recurse -Filter *.node | ForEach-Object FullName
Get-Content release/win-unpacked/resources/app-update.yml               # must show provider: github, owner: gorillabrown, repo: Blurby
```

Expected: `release/nsis-web/Blurby-Web-Setup-$Version-x64.exe` (the web-installer stub, about 1 MB) and `release/nsis-web/blurby-$Version-x64.nsis.7z` (the app package, about 248 MB). The native binaries listed must include `@img/sharp-win32-x64/lib/sharp-win32-x64.node`, `@napi-rs/canvas-win32-x64-msvc/skia.win32-x64-msvc.node` and `onnxruntime-node/bin/napi-v6/win32/x64/onnxruntime_binding.node`. If the two x64 natives are missing or ARM64 ones appear instead, the x64 `npm ci` did not run: start this section again.

## Build ARM64

```powershell
npm ci                                               # on an ARM64 host; on an x64 host: npm ci --os=win32 --cpu=arm64
npm run build
npx electron-builder --win --arm64 --publish never -c.publish.provider=github -c.publish.owner=gorillabrown -c.publish.repo=Blurby
if ($LASTEXITCODE) { throw 'ARM64 build failed' }
Move-Item release/nsis-web/latest.yml release/latest-arm64.yml
Get-ChildItem release/win-arm64-unpacked/resources/app.asar.unpacked -Recurse -Filter *.node | ForEach-Object FullName
Get-Content release/win-arm64-unpacked/resources/app-update.yml
```

Expected: `release/nsis-web/Blurby-Web-Setup-$Version-arm64.exe` (about 1 MB) and `release/nsis-web/blurby-$Version-arm64.nsis.7z` (about 232 MB), beside the x64 files. Natives: `@img/sharp-win32-arm64/lib/sharp-win32-arm64.node` and `onnxruntime-node/bin/napi-v6/win32/arm64/onnxruntime_binding.node`. There is no `@napi-rs/canvas` ARM64 binding: the lockfile pins only `@napi-rs/canvas-win32-x64-msvc`, so PDF import on ARM64 uses pdf-parse's polyfills, as it does in development on this machine (both owner test PDFs convert that way, PDF-IMPORT-DIAG-1). That is accepted until the lockfile gains the ARM64 package.

## One `latest.yml` for both architectures

Each build writes a `latest.yml` for its own architecture only. That is why v1.1.2's `latest.yml` listed only x64, and ARM64 installs never saw an update. Merge the two into one with electron-builder's own YAML library:

```powershell
$merge = @'
const y = require("js-yaml"), fs = require("fs");
const [xa, xb, out] = process.argv.slice(1);
const a = y.load(fs.readFileSync(xa, "utf8")), b = y.load(fs.readFileSync(xb, "utf8"));
if (a.version !== b.version) throw new Error(`version mismatch: ${a.version} vs ${b.version}`);
if (!a.packages?.x64 || !b.packages?.arm64) throw new Error("expected x64 in the first file and arm64 in the second");
const m = { version: a.version, files: [...a.files, ...b.files], path: a.path, sha512: a.sha512,
  packages: { ...a.packages, ...b.packages }, releaseDate: b.releaseDate };
fs.writeFileSync(out, y.dump(m, { lineWidth: -1 }));
console.log(`latest.yml: ${m.files.length} files, packages ${Object.keys(m.packages).join(", ")}`);
'@
node -e $merge release/latest-x64.yml release/latest-arm64.yml release/nsis-web/latest.yml
if ($LASTEXITCODE) { throw 'merge failed' }
Select-String -Path release/nsis-web/latest.yml -Pattern '^\s+(x64|arm64):$'      # must print both keys
```

The x64 stub stays first in `files`, and top-level `path` and `sha512` stay x64's, as older clients expect.

**How electron-updater picks an architecture** (6.8.9: `NsisUpdater` calls `findFile(provider.resolveFiles(info), "exe")`; `resolveFiles` and `findFile` in `electron-updater/out/providers/Provider.js`):
- `findFile` chooses the `files` entry whose name contains `process.arch`, so x64 machines pick `Blurby-Web-Setup-$Version-x64.exe` and ARM64 machines pick `Blurby-Web-Setup-$Version-arm64.exe`.
- `resolveFiles` attaches the package for `process.arch` (from `packages`) to the first `files` entry only.
- **x64 machines** get the web-installer path: electron-updater downloads `blurby-$Version-x64.nsis.7z` itself, differentially where it can, and checks its `sha512`.
- **ARM64 machines** download their own stub, which then downloads `blurby-$Version-arm64.nsis.7z` from this release and checks it against the hash built into the stub (`APP_ARM64_HASH`). It is a full download rather than a differential one, and it installs the ARM64 package.
- Both were simulated with electron-updater's own functions under x64 and ARM64 Electron (RELEASE-RUNBOOK-1 memo). electron-builder's own combined `--x64 --arm64` output lists a universal stub first and behaves the same way for ARM64, and for x64 as well.

## Checksums

One SHA-256 file per architecture, in the `sha256sum` format (LF line endings) the earlier releases used:

```powershell
foreach ($a in 'x64', 'arm64') {
  $lines = Get-ChildItem release/nsis-web -File | Where-Object { $_.Name -match "-$a\.(exe|nsis\.7z)$" } |
    ForEach-Object { "$((Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower()) *$($_.Name)" }
  [IO.File]::WriteAllText((Join-Path $PWD "release/nsis-web/checksums-$a.sha256"), ($lines -join "`n") + "`n")
}
Push-Location release/nsis-web
foreach ($f in 'checksums-x64.sha256', 'checksums-arm64.sha256') { foreach ($l in Get-Content $f) { $h, $n = $l -split ' \*', 2; if ((Get-FileHash $n -Algorithm SHA256).Hash.ToLower() -ne $h) { throw "checksum mismatch: $n" } } }
Pop-Location
```

`Set-Content` would write CRLF, which `sha256sum -c` cannot read; keep `WriteAllText` with `"`n"`.

## Draft release and upload

Seven assets, the same set as v1.1.2: two stubs, two packages, two checksum files and `latest.yml`.

```powershell
$Assets = @(
  "release/nsis-web/Blurby-Web-Setup-$Version-x64.exe",   "release/nsis-web/blurby-$Version-x64.nsis.7z",
  "release/nsis-web/Blurby-Web-Setup-$Version-arm64.exe", "release/nsis-web/blurby-$Version-arm64.nsis.7z",
  'release/nsis-web/checksums-x64.sha256', 'release/nsis-web/checksums-arm64.sha256', 'release/nsis-web/latest.yml')
$Assets | ForEach-Object { if (-not (Test-Path $_)) { throw "missing $_" } }
gh release create $Tag --draft --target $ReleaseSha --title "Blurby $Version" --notes-file <release-notes.md>
gh release upload $Tag @Assets --clobber
```

A draft is invisible to users and to electron-updater, and creates no tag. Uploading `latest.yml` last matters only once the release is published, so the order above is safe.

## Verify

**Before publishing**, from the draft (gh authenticates, so draft assets download):

```powershell
gh release view $Tag --json isDraft,tagName,targetCommitish,assets --jq '{isDraft, tagName, targetCommitish, assets: [.assets[] | {name, size}]}'
$Check = Join-Path $env:TEMP "blurby-release-$Version"; New-Item -ItemType Directory -Force $Check | Out-Null
gh release download $Tag -D $Check --clobber
Get-Content "$Check/latest.yml"; Select-String -Path "$Check/latest.yml" -Pattern '^\s+(x64|arm64):$'
Push-Location $Check
foreach ($f in 'checksums-x64.sha256', 'checksums-arm64.sha256') { foreach ($l in Get-Content $f) { $h, $n = $l -split ' \*', 2; if ((Get-FileHash $n -Algorithm SHA256).Hash.ToLower() -ne $h) { throw "checksum mismatch: $n" } } }
Pop-Location
```

Expect: `isDraft` true, `targetCommitish` = `$ReleaseSha`, exactly the seven assets with the sizes from the build, `latest.yml` with `version: $Version` and both `x64:` and `arm64:` packages, and every checksum matching.

**Right after publishing** (a draft cannot be installed or updated from: the stubs and electron-updater fetch from the public release URL):
1. On an x64 Windows machine with the previous published release installed, open Blurby and wait 10 seconds (the updater checks 10 s after launch, `main/window-manager.js` `setupAutoUpdater`), or use Settings > Help > Check for updates. It must offer `$Version`, download it, and install on quit. The version shown afterwards must be `$Version`.
2. The same on an ARM64 machine. (Builds before this runbook never offered ARM64 an update, so an ARM64 machine on v1.1.2 shows the fix for the first time.)
3. A fresh install from each stub on the release page, on a machine without Blurby: it downloads its package and starts.

If any of these fails, go to Rollback.

## Publish

```powershell
gh release edit $Tag --draft=false --latest
git fetch origin --tags; git rev-parse "$Tag^{commit}"                 # must equal $ReleaseSha
```

Publishing creates the tag at `$ReleaseSha`, makes the release visible, and makes `latest.yml` the update feed for every installed copy. Then run Verify's "Right after publishing" checks, and merge `eb/release-$Version` into `main` with `--no-ff` and push.

## Rollback

- **Before publishing:** delete the draft. Nothing reached users. `gh release delete $Tag --yes` (no tag exists yet).
- **After publishing:** a published `latest.yml` is never edited in place, because installs that already fetched it would hold a different file from the one now served. Stop the rollout first: `gh release edit $Tag --prerelease`. With `allowPrerelease` off (Blurby's default), electron-updater's GitHub provider follows GitHub's Latest release (`GitHubProvider.getLatestTagName`), and a prerelease is never Latest, so update checks fall back to the previous release and stop offering `$Tag`. Check it: `gh release list -L 3` must show the previous release as Latest. Then ship the fix as a new, higher version through this whole runbook. Machines that already updated stay on `$Tag` until that release reaches them.
- Never delete a published release's assets while it is marked latest, and never reuse a version number.

## Unsigned builds

The installers are not code-signed: `package.json`'s `build` has no certificate, no `signtoolOptions` and no `CSC_LINK` (the build log shows `signing with signtool.exe` but no certificate is applied).

- **What users see:** when they run a downloaded `Blurby-Web-Setup-*.exe`, Windows SmartScreen shows "Windows protected your PC" with Publisher "Unknown publisher". They continue through **More info** then **Run anyway**. Browsers may also warn on download. Tell users this on the release page.
- **Updates:** electron-updater verifies an update's signature only when `app-update.yml` names a `publisherName`, and Blurby's does not. Updates therefore install without a SmartScreen prompt; the integrity check is the `sha512` in `latest.yml` (x64) and the stub's built-in package hash (ARM64).
- Signing is a separate item if wanted. Adding it later changes what electron-updater checks: once a `publisherName` is set, every later update must be signed by that publisher.
