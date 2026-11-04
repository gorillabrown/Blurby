# BLOCK-TEXT-ORDER-1 B5 (TQ-B2, LL-160): the Electron ICU checker. Proves the packaged exe's Electron and ICU equal this
# checker's own Electron (node_modules/electron), then certifies every section of resources/sample-meditations.epub that
# has a canonical slice, with each mode's renderer helpers, under that Electron (main.js).
# Usage: pwsh -NoProfile -File scripts/block-text-order/icu-certify/run.ps1 -packaged <path\to\x64 --dir Blurby.exe> [-control] [-out <dir>]
# -control drops the last canonical word of the largest section: that section must fail with extra-source-text (exit 1).
# Exit: 0 every copy certifies every section; 1 a section does not certify; 2 checker error; 3 Electron or ICU differ;
# 4 a binary is missing; 5 a launch never ran (LL-151: a verdict is never a stale or default 0).
# Launcher pattern: scripts/narrate-rebuild/app-node.ps1 and scripts/narrate-rebuild/exit-crash-repro/run.ps1.
# Electron's exes are GUI-subsystem binaries: piping their output makes PowerShell wait and set $LASTEXITCODE. APPDATA and
# LOCALAPPDATA point into the scratch folder for every launch, and main.js sets its own userData there too.
param([string]$packaged, [switch]$control, [string]$out = (Join-Path ([IO.Path]::GetTempPath()) "bto-icu-certify"))
if (-not $packaged -or -not (Test-Path -LiteralPath $packaged)) { [Console]::Error.WriteLine("icu-certify: -packaged must name the packaged Blurby.exe"); exit 4 }
$electronDir = Join-Path $PSScriptRoot '..\..\..\node_modules\electron'
node (Join-Path $electronDir 'install.js') | Write-Host
if ($LASTEXITCODE -ne 0) { [Console]::Error.WriteLine("icu-certify: node_modules/electron/install.js exited $LASTEXITCODE"); exit 4 }
$pathTxt = Join-Path $electronDir 'path.txt'
if (-not (Test-Path -LiteralPath $pathTxt)) { [Console]::Error.WriteLine("icu-certify: node_modules/electron/path.txt is missing"); exit 4 }
$electron = Join-Path $electronDir 'dist' | Join-Path -ChildPath (Get-Content -LiteralPath $pathTxt -Raw).Trim()
if (-not (Test-Path -LiteralPath $electron)) { [Console]::Error.WriteLine("icu-certify: $electron is missing"); exit 4 }

$tag = if ($control) { "control" } else { "live" }
$scratch = Join-Path $out "$tag-$([DateTime]::Now.Ticks)"
New-Item -ItemType Directory -Force $scratch | Out-Null
$env:APPDATA = Join-Path $scratch 'AppData\Roaming'
$env:LOCALAPPDATA = Join-Path $scratch 'AppData\Local'
New-Item -ItemType Directory -Force $env:APPDATA, $env:LOCALAPPDATA | Out-Null

# Step 1: the packaged exe's Electron and ICU, as Node (the build sets no fuses).
$env:ELECTRON_RUN_AS_NODE = '1'
$global:LASTEXITCODE = $null
$versions = (& $packaged -p "JSON.stringify({electron: process.versions.electron, icu: process.versions.icu})" 2>&1 | Out-String).Trim()
if ($null -eq $LASTEXITCODE) { [Console]::Error.WriteLine("icu-certify: $packaged did not run"); exit 5 }
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
Write-Host "packaged versions: $versions"

# Steps 2-5 in the checker's own Electron.
$env:BTO_PACKAGED_VERSIONS = $versions
$env:BTO_OUT = $scratch
if ($control) { $env:BTO_CONTROL = '1' } else { Remove-Item Env:BTO_CONTROL -ErrorAction SilentlyContinue }
$global:LASTEXITCODE = $null
& $electron $PSScriptRoot 2>&1 | Write-Output
if ($null -eq $LASTEXITCODE) { [Console]::Error.WriteLine("icu-certify: $electron did not run"); exit 5 }
exit $LASTEXITCODE
