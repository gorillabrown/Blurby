# NARRATE-REBUILD-1 P6b — run an epic script under the app's own Electron as Node (its ICU numbers book words as the
# app does). Usage: pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 <script> [args]; exits with the script's code.
# electron.exe is a GUI-subsystem binary: called bare, PowerShell neither waits for it nor sets $LASTEXITCODE; piping
# its output makes PowerShell wait and record the exit code. The variable is set in this child shell only.
# Electron 42 no longer downloads its binary at install (ELECTRON-42-UPGRADE-1): install.js fetches it when path.txt,
# dist\version or the executable is missing, and returns at once when all are present. Any failure to have the binary
# exits 4, and a launch that never ran exits 5, so a checker's verdict is never a stale or default 0 (LL-151).
$electronDir = Join-Path $PSScriptRoot '..\..\node_modules\electron'
node (Join-Path $electronDir 'install.js') | Write-Host
if ($LASTEXITCODE -ne 0) { [Console]::Error.WriteLine("app-node: node_modules/electron/install.js exited $LASTEXITCODE (needs Node 22.12 or later on PATH)"); exit 4 }
$pathTxt = Join-Path $electronDir 'path.txt'
if (-not (Test-Path -LiteralPath $pathTxt)) { [Console]::Error.WriteLine("app-node: node_modules/electron/path.txt is missing after install.js; run npm ci, then node node_modules/electron/install.js"); exit 4 }
$electron = Join-Path $electronDir 'dist' | Join-Path -ChildPath (Get-Content -LiteralPath $pathTxt -Raw).Trim()
if (-not (Test-Path -LiteralPath $electron)) { [Console]::Error.WriteLine("app-node: $electron is missing after install.js"); exit 4 }
$env:ELECTRON_RUN_AS_NODE = '1'
$global:LASTEXITCODE = $null
& $electron --no-warnings @args | Write-Output
if ($null -eq $LASTEXITCODE) { [Console]::Error.WriteLine("app-node: $electron did not run"); exit 5 }
exit $LASTEXITCODE
