# NARRATE-REBUILD-1 P6b — run an epic script under the app's own Electron as Node (its ICU numbers book words as the
# app does). Usage: pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 <script> [args]; exits with the script's code.
# electron.exe is a GUI-subsystem binary: called bare, PowerShell neither waits for it nor sets $LASTEXITCODE; piping
# its output makes PowerShell wait and record the exit code. The variable is set in this child shell only.
# Electron 42 no longer downloads its binary at install, so after a fresh `npm ci` path.txt is absent until the first
# download: fetch it once, and refuse rather than guess a binary if it is still missing.
$pathTxt = Join-Path $PSScriptRoot '..\..\node_modules\electron\path.txt'
if (-not (Test-Path $pathTxt)) { node (Join-Path $PSScriptRoot '..\..\node_modules\electron\install.js') | Write-Host }
if (-not (Test-Path $pathTxt)) { Write-Error "app-node: node_modules/electron/path.txt is missing after install.js; run npm ci, then node node_modules/electron/install.js"; exit 4 }
$electron = Join-Path $PSScriptRoot '..\..\node_modules\electron\dist' | Join-Path -ChildPath (Get-Content $pathTxt -Raw).Trim()
$env:ELECTRON_RUN_AS_NODE = '1'
& $electron --no-warnings @args | Write-Output
exit $LASTEXITCODE
