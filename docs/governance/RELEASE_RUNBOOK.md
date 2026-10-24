# Blurby Desktop Release Runbook (Windows, manual)

How to build, check, upload and publish a Blurby desktop release by hand. No workflow does this: `.github/workflows/release.yml` was deleted in `e9bbf56a` (2026-03-31) and `ci.yml` only tests. Written and validated by RELEASE-RUNBOOK-1 (2026-10-22) on `main` @ `6dc951ee` (Electron 42.11.18, electron-builder 26.15.3, electron-updater 6.8.9, npm 11.9.0, gh 2.88.1, PowerShell 7.6) on the owner's ARM64 Windows machine. The command-line overrides moved into `package.json` by WIN-TARGET-NSIS-1. Every build, merge, checksum and verification command below was run there without publishing (version `1.75.1`; output in `docs/governance/close-outs/Memo.RELEASE-RUNBOOK-1.GovernanceStaging.2026-10-22.md`). The commands that write to GitHub (`gh release create`, `upload`, `edit`, `delete`, and the `git push` of the release branch) are shown here and were never run by that item. The x64-host variants of the two `npm ci` lines were not validated, because only an ARM64 host was available.

**Release format: one full NSIS installer per architecture** (`Blurby-Setup-<version>-x64.exe`, `Blurby-Setup-<version>-arm64.exe`), set in `package.json`: `build.win.target` `nsis`, `build.win.artifactName`, `build.nsis.buildUniversalInstaller` `false` and `build.publish`. Owner decision, 2026-10-22, relayed by Blurby.Brain: "Yes, option B: release separate full installers for x64 and ARM64. The bigger download is fine; native ARM64 matters." The target is `nsis` because `nsis-web`, the web-installer stub that v1.1.2 shipped, cannot serve ARM64. Its single-architecture ARM64 stub has no package name to download, and its combined stub always installs x64 unless an ia32 build is included (`app-builder-lib/templates/nsis/include/installer.nsh`).

Run everything in PowerShell 7.3 or later (`pwsh`), from the root of a checkout of the release commit; a git worktree works. Who runs it: the owner, or Blurby.Roadmap on the owner's go, after release gate (2), the batched owner smoke, passes.

## Inputs

Set these values first; every later step reads them. After a shell restart, set them again.

```powershell
$SmokedSha = '<40-char sha>'      # the main commit the owner smoked in gate (2); the build is exactly that commit
$Tag       = "build-$($SmokedSha.Substring(0, 8))"   # GitHub release tag, one per build; electron-updater downloads from releases/download/<tag>/
$Notes     = '<path to release-notes.md>'
```

**No version bump** (owner direction, 2026-10-22: "We don't have to keep versioning. This is not released publicly. Drop this aspect."). The build uses `package.json`'s version as it stands on `$SmokedSha` and never changes it; Preflight reads it into `$Version`. Consequence for updates: see Verify.

**Why `package.json` names the owner and repo.** `build.publish` carries `owner` and `repo` as well as `provider`. `package.json` has no `repository` field, so electron-builder would otherwise read the GitHub owner from `.git/config`, which a git worktree does not have (its `.git` is a file). Without them, the installed app's `app-update.yml` has no `provider`, `owner` or `repo`, and the app can never find an update. Both build sections still check `app-update.yml` for the three lines.

## Preflight

```powershell
if ($PSVersionTable.PSVersion -lt [version]'7.3') { throw 'needs PowerShell 7.3 or later' }
"node arch: $(node -p process.arch)"                 # the host's npm installs this architecture's optional packages by default
gh auth status; if ($LASTEXITCODE) { throw 'gh is not authenticated' }
git fetch origin --prune --tags; if ($LASTEXITCODE) { throw 'fetch failed' }
git switch --detach $SmokedSha; if ($LASTEXITCODE) { throw 'cannot check out the smoked commit' }
if (git status --porcelain) { throw 'tree not clean' }
if ((git rev-parse HEAD) -ne $SmokedSha) { throw 'not on the smoked commit' }
git merge-base --is-ancestor $SmokedSha refs/remotes/origin/main; if ($LASTEXITCODE) { throw 'smoked commit is not on origin/main' }
if (git ls-remote --tags origin "refs/tags/$Tag") { throw "tag $Tag already exists (a bare tag with no release counts)" }
gh release view $Tag *> $null; if (-not $LASTEXITCODE) { throw "release $Tag already exists" }
if (-not (Test-Path $Notes)) { throw 'release notes missing' }
$Version = node -p "require('./package.json').version"; if ($LASTEXITCODE -or -not $Version) { throw 'cannot read the version' }
"building $Version at $SmokedSha as $Tag"
```

The full suite, typecheck and build must already be green on `$SmokedSha`. That evidence is release gate (1), the quiet-machine run, and gate (2), the owner smoke on a production build of that commit. This runbook builds what was proven; it does not re-prove it. GitHub creates the tag `$Tag` at `$SmokedSha` when the draft is published, so never create it by hand.

## Build x64

**Host architecture.** `npm ci` installs only the host's optional native packages. On an ARM64 host an ordinary `npm ci` would give the x64 build ARM64 `sharp` and no `@napi-rs/canvas` binding, and PDF import would fall back to pdf-parse's polyfills. So the x64 build gets its own `npm ci` with `--cpu=x64`. npm keeps only one `--cpu` value, so a single `--x64 --arm64` electron-builder run cannot carry the right natives for both, and this runbook never uses one.

```powershell
Remove-Item -Recurse -Force release, dist -ErrorAction SilentlyContinue      # both are gitignored build output
npm ci --os=win32 --cpu=x64; if ($LASTEXITCODE) { throw 'npm ci (x64) failed' }          # on an x64 host: npm ci
npm run build; if ($LASTEXITCODE) { throw 'renderer build failed' }
npx electron-builder --win --x64 --publish never; if ($LASTEXITCODE) { throw 'x64 build failed' }
Move-Item -Force release/latest.yml release/latest-x64.yml                    # the ARM64 build writes its own
$natives = (Get-ChildItem release/win-unpacked/resources/app.asar.unpacked -Recurse -Filter *.node).FullName -join "`n"
foreach ($need in '@img\sharp-win32-x64\', '@napi-rs\canvas-win32-x64-msvc\', 'onnxruntime-node\bin\napi-v6\win32\x64\') { if (-not $natives.Contains($need)) { throw "x64 package lacks $need" } }
if ($natives.Contains('@img\sharp-win32-arm64\')) { throw 'x64 package carries ARM64 sharp: the x64 npm ci did not run' }
$upd = Get-Content -Raw release/win-unpacked/resources/app-update.yml
foreach ($line in 'provider: github', 'owner: gorillabrown', 'repo: Blurby') { if ($upd -notmatch "(?m)^$line\r?$") { throw "app-update.yml lacks '$line'" } }
```

Expected: `release/Blurby-Setup-$Version-x64.exe` (about 248 MB) and `release/Blurby-Setup-$Version-x64.exe.blockmap`, the blockmap that lets electron-updater download only the changed blocks. Every package also carries onnxruntime's binaries for the other platforms; that is normal.

## Build ARM64

```powershell
npm ci; if ($LASTEXITCODE) { throw 'npm ci (arm64) failed' }                   # on an x64 host: npm ci --os=win32 --cpu=arm64
npm run build; if ($LASTEXITCODE) { throw 'renderer build failed' }
$env:ELECTRON_BUILDER_7Z_FILTER = 'BCJ'                                         # required for ARM64: see below
try { npx electron-builder --win --arm64 --publish never; if ($LASTEXITCODE) { throw 'ARM64 build failed' } }
finally { Remove-Item Env:ELECTRON_BUILDER_7Z_FILTER -ErrorAction SilentlyContinue }
Move-Item -Force release/latest.yml release/latest-arm64.yml
$natives = (Get-ChildItem release/win-arm64-unpacked/resources/app.asar.unpacked -Recurse -Filter *.node).FullName -join "`n"
foreach ($need in '@img\sharp-win32-arm64\', 'onnxruntime-node\bin\napi-v6\win32\arm64\') { if (-not $natives.Contains($need)) { throw "ARM64 package lacks $need" } }
if ($natives.Contains('@img\sharp-win32-x64\')) { throw 'ARM64 package carries x64 sharp' }
$upd = Get-Content -Raw release/win-arm64-unpacked/resources/app-update.yml
foreach ($line in 'provider: github', 'owner: gorillabrown', 'repo: Blurby') { if ($upd -notmatch "(?m)^$line\r?$") { throw "app-update.yml lacks '$line'" } }
```

**Why `ELECTRON_BUILDER_7Z_FILTER=BCJ`.** Without it, electron-builder's 7-Zip compresses every ARM64 executable and DLL with 7-Zip's newer `ARM64` branch filter. The installer's own extractor (the Nsis7z plugin) cannot decode that filter and silently skips those files. The installer then exits 0 with no `Blurby.exe`, no `ffmpeg.dll`, and none of onnxruntime's or sharp's ARM64 DLLs (17 files; RELEASE-RUNBOOK-1 issue file, 2026-10-22). Forcing the `BCJ` filter, which Nsis7z supports, installs all 681 files. The x64 build needs nothing, because its filter is `BCJ2`. Leave the variable unset for x64. The `try`/`finally` above removes it again. The install test in Verify (step 2) catches a regression.

Expected: `release/Blurby-Setup-$Version-arm64.exe` (about 232 MB) and its `.blockmap`, beside the x64 files. There is no `@napi-rs/canvas` ARM64 binding, because the lockfile pins only `@napi-rs/canvas-win32-x64-msvc`. So PDF import on ARM64 uses pdf-parse's polyfills, which convert both owner test PDFs (PDF-IMPORT-DIAG-1). That is accepted until the lockfile gains the ARM64 package.

## One `latest.yml` for both architectures

Each build writes a `latest.yml` for its own architecture only. That is why v1.1.2's `latest.yml` listed only x64, and ARM64 machines were offered the x64 build. Merge the two with electron-builder's own YAML library:

```powershell
$merge = @'
const y = require("js-yaml"), fs = require("fs");
const [xa, xb, out] = process.argv.slice(1);
const a = y.load(fs.readFileSync(xa, "utf8")), b = y.load(fs.readFileSync(xb, "utf8"));
if (a.version !== b.version) throw new Error(`version mismatch: ${a.version} vs ${b.version}`);
const has = (f, arch) => f.files.length === 1 && f.files[0].url.endsWith(`-${arch}.exe`);
if (!has(a, "x64") || !has(b, "arm64")) throw new Error("expected one x64 installer in the first file and one arm64 installer in the second");
const m = { version: a.version, files: [...a.files, ...b.files], path: a.path, sha512: a.sha512, releaseDate: b.releaseDate };
fs.writeFileSync(out, y.dump(m, { lineWidth: -1 }));
console.log(`latest.yml: ${m.files.map((f) => f.url).join(", ")}`);
'@
node -e $merge release/latest-x64.yml release/latest-arm64.yml release/latest.yml; if ($LASTEXITCODE) { throw 'merge failed' }
Select-String -Path release/latest.yml -Pattern "url: Blurby-Setup-$([regex]::Escape($Version))-(x64|arm64)\.exe$"   # must print both
```

**How electron-updater picks an architecture** (6.8.9). `NsisUpdater` calls `findFile(provider.resolveFiles(info), "exe")` (`electron-updater/out/providers/Provider.js`), and `findFile` takes the `files` entry whose name contains `process.arch`:
- an x64 Blurby downloads `Blurby-Setup-$Version-x64.exe`;
- an ARM64 Blurby downloads `Blurby-Setup-$Version-arm64.exe`.

Each download is checked against that entry's `sha512`, and fetched differentially through its `.blockmap` where the installed version has one. The x64 installer stays first, and top-level `path` and `sha512` stay x64's, for older clients. Simulated with electron-updater's own functions under x64 and ARM64 Electron (RELEASE-RUNBOOK-1 memo).

**What existing installs get.** Machines on v1.1.2 run the x64 app. That includes ARM64 machines, because v1.1.2 offered them the x64 build, which runs under emulation. Since `process.arch` is `x64` in that app, they update to the x64 installer and stay on x64. To move an ARM64 machine to native, install the ARM64 installer over the top (Verify, step 4); the profile is kept.

## Checksums

One SHA-256 file per architecture, in the `sha256sum` format with LF line endings that earlier releases used:

```powershell
foreach ($a in 'x64', 'arm64') {
  $lines = @(Get-ChildItem release -File | Where-Object { $_.Name -match "-$a\.exe(\.blockmap)?$" } |
    ForEach-Object { "$((Get-FileHash $_.FullName -Algorithm SHA256).Hash.ToLower()) *$($_.Name)" })
  if ($lines.Count -ne 2) { throw "expected 2 $a files, found $($lines.Count)" }
  [IO.File]::WriteAllText((Join-Path $PWD "release/checksums-$a.sha256"), ($lines -join "`n") + "`n")
}
```

`Set-Content` writes CRLF, which `sha256sum -c` cannot read, so keep `WriteAllText` with an LF (`` "`n" ``) separator.

## Draft release and upload

Seven assets: two installers, two blockmaps, two checksum files and `latest.yml`. Never re-run the upload after Publish: `--clobber` deletes before it re-uploads.

```powershell
if ((git rev-parse HEAD) -ne $SmokedSha -or (git status --porcelain)) { throw 'tree moved since Preflight; rebuild' }
$Assets = @("release/Blurby-Setup-$Version-x64.exe", "release/Blurby-Setup-$Version-x64.exe.blockmap",
            "release/Blurby-Setup-$Version-arm64.exe", "release/Blurby-Setup-$Version-arm64.exe.blockmap",
            'release/checksums-x64.sha256', 'release/checksums-arm64.sha256', 'release/latest.yml')
$Assets | ForEach-Object { if (-not (Test-Path $_)) { throw "missing $_" } }
gh release create $Tag --draft --target $SmokedSha --title "Blurby $Version ($Tag)" --notes-file $Notes; if ($LASTEXITCODE) { throw 'create failed' }
gh release upload $Tag @Assets --clobber; if ($LASTEXITCODE) { throw 'upload failed' }
if (git ls-remote --tags origin "refs/tags/$Tag") { throw 'a draft must not create the tag' }
```

A draft is invisible to users and to electron-updater, and creates no tag.

## Verify

**Before publishing**, using the draft (gh authenticates, so draft assets download):

```powershell
gh release view $Tag --json isDraft,tagName,targetCommitish,assets --jq '{isDraft, tagName, targetCommitish, assets: [.assets[] | {name, size}]}'
$Check = Join-Path $env:TEMP "blurby-release-$Version"; Remove-Item -Recurse -Force $Check -ErrorAction SilentlyContinue
gh release download $Tag -D $Check; if ($LASTEXITCODE) { throw 'download failed' }
$YamlLib = Join-Path (Get-Location).Path 'node_modules/js-yaml'
Push-Location $Check
try {
  foreach ($f in 'checksums-x64.sha256', 'checksums-arm64.sha256') { foreach ($l in Get-Content $f) { $h, $n = $l -split ' \*', 2; if ((Get-FileHash $n -Algorithm SHA256).Hash.ToLower() -ne $h) { throw "checksum mismatch: $n" } } }
  $info = node -e "process.stdout.write(JSON.stringify(require(process.argv[1]).load(require('fs').readFileSync('latest.yml','utf8'))))" $YamlLib | ConvertFrom-Json
  if ($info.version -ne $Version -or $info.files.Count -ne 2) { throw 'latest.yml is not this version with two installers' }
  foreach ($e in $info.files) {
    $sha = [Convert]::ToBase64String([Convert]::FromHexString((Get-FileHash $e.url -Algorithm SHA512).Hash))
    if ($sha -ne $e.sha512 -or (Get-Item $e.url).Length -ne $e.size) { throw "latest.yml does not match $($e.url)" }
  }
} finally { Pop-Location }
```

Run it from the repo root (it reads `js-yaml` from the repo's `node_modules`). Expect: `isDraft` true, `targetCommitish` = `$SmokedSha`, the seven assets, matching checksums, and `latest.yml` entries matching both installers.

**Install tests, still before publishing.** Use the installers in `$Check`, on test machines, or a test user account, without the real profile you care about. Each installer installs per-user into `%LOCALAPPDATA%\Programs\blurby` and keeps the profile in `%APPDATA%\blurby\blurby-data`.
1. On x64: run `Blurby-Setup-$Version-x64.exe`. Blurby starts, opens a book, and Narrate voices a word.
2. On ARM64: run `Blurby-Setup-$Version-arm64.exe`, with the same checks. Confirm the app is native: Task Manager's Details tab shows `Blurby.exe` with architecture ARM64. Or check the installed `Blurby.exe`'s PE machine type: `0xAA64`, not `0x8664`. Confirm nothing was dropped (the `ELECTRON_BUILDER_7Z_FILTER` failure). On the build machine, every file of `release/win-arm64-unpacked` must exist under the install folder:
   ```powershell
   $ref = (Resolve-Path release/win-arm64-unpacked).Path; $inst = "$env:LOCALAPPDATA\Programs\blurby"
   $lost = @(Get-ChildItem $ref -Recurse -File | Where-Object { -not (Test-Path ($inst + $_.FullName.Substring($ref.Length))) })
   if ($lost.Count) { $lost.FullName; throw "$($lost.Count) files missing from the ARM64 install" }
   ```
3. Signature prompt: both installers are unsigned (Unsigned builds).
4. **Moving an ARM64 machine from the emulated x64 app to native**, on an ARM64 test machine with the previous release installed and a profile in use: run `Blurby-Setup-$Version-arm64.exe` over it. The installer replaces the x64 app in place, with one uninstall entry now at `$Version`. Validated by RELEASE-RUNBOOK-1 on a test identity: from an x64 nsis-web install, as v1.1.2 is, to the ARM64 full installer. The profile (`%APPDATA%\blurby\blurby-data`: library, settings, positions) is untouched, and the next launch is native ARM64.

**Versions and updates:** electron-updater offers an update only when `latest.yml`'s version is higher than the installed one. The first build published at `package.json`'s version (1.75.1, above the installed 1.1.2) is offered once; every later build at that unchanged version is not, so it is installed by hand from its installer.

**Right after publishing** (update checks only see published releases): on an x64 machine and an ARM64 machine, each with the previous release installed, open Blurby and wait 10 seconds. The updater checks 10 s after launch (`main/window-manager.js` `setupAutoUpdater`), or use Settings > Help > Check for updates. Each must offer `$Version`, download it and install on quit, and the version shown afterwards must be `$Version`. If any check fails, go to Rollback.

## Publish

```powershell
gh release edit $Tag --draft=false --latest; if ($LASTEXITCODE) { throw 'publish failed' }
git fetch origin --tags
if ((git rev-parse "$Tag^{commit}") -ne $SmokedSha) { throw "tag $Tag does not point at $SmokedSha: go to Rollback" }
```

Publishing creates the tag at `$SmokedSha`, makes the release visible, and makes `latest.yml` the update feed for every installed copy. Then run Verify's "Right after publishing" checks. Nothing is merged: the build changed no file.

## Rollback

- **Before publishing:** delete the draft with `gh release delete $Tag --yes`. Nothing reached users, and no tag exists.
- **After publishing:** never edit a published `latest.yml` in place, because installs that already fetched it would hold a different file from the one now served. Stop the rollout first: `gh release edit $Tag --prerelease`. With `allowPrerelease` off (Blurby's default), electron-updater's GitHub provider follows GitHub's Latest release (`GitHubProvider.getLatestTagName`), and a prerelease is never Latest. Update checks therefore fall back to the previous release and stop offering `$Tag`. Check that `gh release list -L 3` shows the previous release as Latest. If it does not, run `gh release edit <previous tag> --latest`. If `$Tag` is still Latest after that, `gh release edit $Tag --draft=true` takes it out of every listing. Then ship the fix as a new, higher version through this whole runbook. Machines that already updated stay on `$Tag` until that release reaches them.
- Never delete a published release's assets while it is Latest, and never reuse a tag.

## Unsigned builds

The installers are not code-signed: `package.json`'s `build` has no certificate, no `signtoolOptions` and no `CSC_LINK`. The build log's `signing with signtool.exe` line applies no certificate, and the files report `NotSigned`.

- **What users see:** when they run a downloaded `Blurby-Setup-*.exe`, Windows SmartScreen shows "Windows protected your PC", with Publisher "Unknown publisher". They continue through **More info** then **Run anyway**. Browsers may also warn on download. Say so on the release page.
- **Updates:** electron-updater checks an update's signature only when `app-update.yml` names a `publisherName` (`NsisUpdater.verifySignature`), and Blurby's names none. Updates therefore install without a SmartScreen prompt, and their integrity check is the `sha512` in `latest.yml`.
- Signing is a separate item if wanted. Adding it later changes what electron-updater checks: once a `publisherName` is set, every later update must be signed by that publisher.
