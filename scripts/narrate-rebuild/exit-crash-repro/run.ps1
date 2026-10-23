# ELECTRON-42-UPGRADE-1 C1: launch the minimal repro N times under a given Electron binary and count exit codes.
# Usage: pwsh -NoProfile -File scripts/narrate-rebuild/exit-crash-repro/run.ps1 -n 50 -electron <path\to\electron.exe> [-out <dir>]
# Prints "<tag> n=<N> codes=<hex:count ...> postqueued=<P> crashed=<C>"; writes each non-zero launch's output to <out>\<tag>.txt.
# Exit: 0 when no launch crashed, 1 when at least one did, 2 on bad arguments. Never touches a profile.
param([int]$n = 50, [string]$electron, [string]$tag = "run", [string]$out = (Join-Path ([IO.Path]::GetTempPath()) "exit-crash-repro"))
if (-not $electron -or -not (Test-Path $electron)) { Write-Error "-electron must name an electron.exe"; exit 2 }
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
if (-not $env:NARRATE_MODELS_ROOT) { $env:NARRATE_MODELS_ROOT = "C:/Projects/Blurby-artifacts/narrate-rebuild-1/models" }
New-Item -ItemType Directory -Force $out | Out-Null
$log = Join-Path $out "$tag.txt"; "" | Out-File $log
$codes = @{}; $pq = 0; $crashed = 0
for ($i = 0; $i -lt $n; $i++) {
  # Piping makes PowerShell wait for the GUI-subsystem electron.exe and set $LASTEXITCODE.
  $env:BLURBY_USER_DATA_DIR = Join-Path $out "profiles\$tag-$i-$([DateTime]::Now.Ticks)"
  $o = & $electron $PSScriptRoot 2>&1 | Out-String
  $c = ('{0:x}' -f $LASTEXITCODE); $codes[$c]++
  if ($o -match 'PostQueued') { $pq++ }
  if ($c -ne "0") { $crashed++; @("=== $i $c", $o) | Out-File -Append $log }
}
"$tag n=$n codes=$(($codes.GetEnumerator() | ForEach-Object { "$($_.Key):$($_.Value)" }) -join ' ') postqueued=$pq crashed=$crashed"
exit ([int]($crashed -gt 0))
