# NARRATE-REBUILD-1 P6b — run an epic script under the app's own Electron as Node (its ICU numbers book words as the
# app does). Usage: pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 <script> [args]; exits with the script's code.
# electron.exe is a GUI-subsystem binary: called bare, PowerShell neither waits for it nor sets $LASTEXITCODE; piping
# its output makes PowerShell wait and record the exit code. The variable is set in this child shell only.
$electron = Join-Path $PSScriptRoot '..\..\node_modules\electron\dist' | Join-Path -ChildPath (Get-Content (Join-Path $PSScriptRoot '..\..\node_modules\electron\path.txt') -Raw).Trim()
$env:ELECTRON_RUN_AS_NODE = '1'
& $electron --no-warnings @args | Write-Output
exit $LASTEXITCODE
