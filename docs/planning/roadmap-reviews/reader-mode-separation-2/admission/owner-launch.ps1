# Owner-run launcher for the B0 baseline (heard-audio observations and manual checklists).
# Opens the isolated baseline app (fresh test profile, seeded Kokoro model) and waits until you close
# its window, then stops the preview server and verifies the live profile was not written.
# Usage, in PowerShell 7:
#   cd C:\Projects\Blurby\.worktrees\reader-mode-separation-2
#   pwsh -File docs\planning\roadmap-reviews\reader-mode-separation-2\admission\owner-launch.ps1
param(
  [string]$B0 = 'C:\Projects\Blurby-artifacts\rms2-baseline-build',
  [ValidatePattern('^[a-z0-9]+$')] [string]$Label = 'owner'
)
$ErrorActionPreference = 'Stop'
$W = 'C:\Projects\Blurby\.worktrees\reader-mode-separation-2'
Set-Location $W
$E = 'docs/planning/roadmap-reviews/reader-mode-separation-2/admission'
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmssfff')
$runId = "blurby-reader-mode-separation-2-a1-$Label$stamp"
$tempRoot = (Resolve-Path $env:TEMP).Path
$profileDir = Join-Path $tempRoot $runId
$logs = Join-Path $tempRoot "$runId-logs"
New-Item -ItemType Directory $logs | Out-Null
$live = 'C:\Users\estra\AppData\Roaming\blurby\blurby-data'
function LiveHashes { foreach ($f in 'library.json', 'settings.json', 'sync-queue.json') { (Get-FileHash -Algorithm SHA256 (Join-Path $live $f)).Hash.ToLower() } }
$before = (LiveHashes) -join ','
$vite = Start-Process -FilePath node -ArgumentList @('node_modules/vite/bin/vite.js', 'preview', '--port', '5173', '--strictPort', '--outDir', $B0) -WorkingDirectory $W -WindowStyle Hidden -PassThru -RedirectStandardOutput "$logs\preview.out.log" -RedirectStandardError "$logs\preview.err.log"
try {
  $deadline = (Get-Date).AddSeconds(30)
  while ((Get-Date) -lt $deadline) { try { if ((Invoke-WebRequest -UseBasicParsing http://localhost:5173/ -TimeoutSec 2).StatusCode -eq 200) { break } } catch {}; Start-Sleep -Milliseconds 500 }
  $electron = Join-Path $W 'node_modules\electron\dist\electron.exe'
  $el = Start-Process -FilePath $electron -ArgumentList @("$E/isolated-launch.cjs", "--profile=$profileDir", '--cdp-port=9336', "--build-dir=$B0", '--seed-kokoro=1') -WorkingDirectory $W -PassThru -RedirectStandardOutput "$logs\electron.out.log" -RedirectStandardError "$logs\electron.err.log"
  Write-Host "Baseline (B0) app is open. Profile: $profileDir"
  Write-Host "Follow the checklist, then close the Blurby window. This script waits."
  $el.WaitForExit()
} finally {
  if (-not $vite.HasExited) { Stop-Process -Id $vite.Id -Force }
}
$after = (LiveHashes) -join ','
$ok = $before -eq $after
Write-Host "Live profile unchanged: $ok"
Write-Host "Profile (keep it; do not delete): $profileDir"
Write-Host "Logs: $logs"
[ordered]@{ runId = $runId; profile = $profileDir; logs = $logs; liveProfileUnchanged = $ok; electronExitCode = $el.ExitCode; closedAt = (Get-Date).ToUniversalTime().ToString('o') } | ConvertTo-Json | Set-Content -Encoding utf8 "$logs\owner-run.json"
