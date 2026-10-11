# Test-only G6 live-QA driver (fork of admission/live-run.ps1 + owner-launch.ps1, for both targets).
# Live-profile hashes before -> vite preview of the served build (target root's vite, :5173 strictPort) ->
# isolated electron launch (target root's electron.exe, fresh g6 profile) -> matrix-g6.mjs per fixture (or, with
# -Owner, wait for the owner to close the window) -> graceful close (poll HasExited) -> stop preview ->
# live-profile hashes after (must match) -> run summary json.
# Usage (PowerShell 7):
#   pwsh -File <W>\docs\planning\roadmap-reviews\reader-mode-separation-2\live\live-run-g6.ps1 -Target b0 -Label b0g6
#   pwsh -File ...\live-run-g6.ps1 -Target candidate -Candidate <40-hex> -Fixtures epub,chapters -Label candg6
#   pwsh -File ...\live-run-g6.ps1 -Target b0 -Owner -Label owner
param(
  [Parameter(Mandatory)] [ValidateSet('b0', 'candidate')] [string]$Target,
  [ValidatePattern('^([0-9a-f]{40})?$')] [string]$Candidate = '',
  [string]$BuildDir = '',
  [string[]]$Fixtures = @('epub', 'chapters'),
  [Parameter(Mandatory)] [ValidatePattern('^[a-z0-9]+$')] [string]$Label,
  [switch]$Owner,
  [int]$CdpPort = 9335,
  [string]$Only = ''
)
$ErrorActionPreference = 'Stop'
$W = 'C:\Projects\Blurby\.worktrees\reader-mode-separation-2'
$Live = Join-Path $W 'docs\planning\roadmap-reviews\reader-mode-separation-2\live'
$Root = @{ b0 = 'C:\Projects\Blurby-artifacts\rms2-b0-checkout'; candidate = $W }[$Target]
if ($Target -eq 'candidate' -and -not $Candidate) { throw '-Candidate <full sha> is required for -Target candidate' }
if (-not $BuildDir) {
  $BuildDir = if ($Target -eq 'b0') { 'C:\Projects\Blurby-artifacts\rms2-baseline-build' } else { "C:\Projects\Blurby-artifacts\rms2-candidate-$($Candidate.Substring(0, 12))\dist" }
}
$BuildDir = (Resolve-Path $BuildDir).Path
$FixtureList = @(($Fixtures -join ',').Split(',', [StringSplitOptions]::RemoveEmptyEntries))   # pwsh -File passes one string
foreach ($f in $FixtureList) { if ($f -notin 'epub', 'chapters', 'text') { throw "Unknown fixture $f" } }
Push-Location $W   # node -e below resolves 'ws' from W's node_modules
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmssfff')
$runId = "blurby-reader-mode-separation-2-g6-$Label$stamp"
$tempRoot = (Resolve-Path $env:TEMP).Path
$profileDir = Join-Path $tempRoot $runId
$logs = Join-Path $tempRoot "$runId-logs"
if (Test-Path $profileDir) { throw "Refusing existing profile $profileDir" }
New-Item -ItemType Directory $logs | Out-Null
$livePath = 'C:\Users\estra\AppData\Roaming\blurby\blurby-data'
function LiveHashes { foreach ($f in 'library.json', 'settings.json', 'sync-queue.json') { [ordered]@{ file = $f; sha256 = (Get-FileHash -Algorithm SHA256 (Join-Path $livePath $f)).Hash.ToLower() } } }
$result = [ordered]@{ runId = $runId; label = $Label; target = $Target; candidate = $Candidate; root = $Root; buildDir = $BuildDir; mode = $(if ($Owner) { 'owner' } else { 'matrix' }); profile = $profileDir; logs = $logs; startedAt = (Get-Date).ToUniversalTime().ToString('o'); steps = @(); captures = @() }
function Step($name, $data) { $script:result.steps += [ordered]@{ at = (Get-Date).ToUniversalTime().ToString('o'); step = $name; data = $data } }
$result.liveBefore = @(LiveHashes)
$vite = $null; $el = $null
try {
  if (Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue) { throw 'Port 5173 is already in use; refusing to attach to a server this run did not start' }
  $vite = Start-Process -FilePath node -ArgumentList @("`"$Root\node_modules\vite\bin\vite.js`"", 'preview', '--port', '5173', '--strictPort', '--outDir', "`"$BuildDir`"") -WorkingDirectory $Root -WindowStyle Hidden -PassThru -RedirectStandardOutput "$logs\preview.out.log" -RedirectStandardError "$logs\preview.err.log"
  $null = $vite.Handle
  $deadline = (Get-Date).AddSeconds(30); $up = $false
  while ((Get-Date) -lt $deadline -and -not $vite.HasExited) {
    try { $resp = Invoke-WebRequest -UseBasicParsing http://localhost:5173/ -TimeoutSec 2; if ($resp.StatusCode -eq 200) { $up = $true; break } } catch {}
    Start-Sleep -Milliseconds 500
  }
  # The served index.html must be the build's own (guards against another server on :5173).
  $servedIndex = if ($up) { $resp.Content } else { $null }
  $buildIndex = Get-Content -Raw -Encoding utf8 (Join-Path $BuildDir 'index.html')
  $indexMatches = $up -and -not $vite.HasExited -and ($servedIndex -eq $buildIndex)
  Step 'preview' @{ pid = $vite.Id; up = $up; servedIndexMatchesBuild = $indexMatches }
  if (-not $indexMatches) { throw 'Preview is not serving the requested build on :5173' }
  $electron = Join-Path $Root 'node_modules\electron\dist\electron.exe'
  $launchArgs = @("`"$Live\isolated-launch-g6.cjs`"", "--target=$Target", "--profile=`"$profileDir`"", "--cdp-port=$CdpPort", "--build-dir=`"$BuildDir`"", '--seed-kokoro=1')
  if ($Target -eq 'candidate') { $launchArgs += "--candidate=$Candidate" }
  $startArgs = @{ FilePath = $electron; ArgumentList = $launchArgs; WorkingDirectory = $Root; PassThru = $true; RedirectStandardOutput = "$logs\electron.out.log"; RedirectStandardError = "$logs\electron.err.log" }
  if (-not $Owner) { $startArgs.WindowStyle = 'Hidden' }
  $el = Start-Process @startArgs
  $null = $el.Handle   # keeps ExitCode readable after exit
  $result.electronPid = $el.Id
  $deadline = (Get-Date).AddSeconds(90); $ready = $false
  while ((Get-Date) -lt $deadline -and -not $el.HasExited) {
    if (Test-Path "$profileDir\isolation.json") {
      try { $m = Get-Content -Raw "$profileDir\isolation.json" | ConvertFrom-Json; if ($m.readyIsolationVerifiedAt -and $m.rendererIdentityInstalledAt) { $ready = $true; break } } catch {}
    }
    Start-Sleep -Milliseconds 500
  }
  Step 'renderer-ready' @{ ready = $ready; electronExited = $el.HasExited }
  if (-not $ready) { throw "Renderer identity not installed (see $logs\electron.err.log)" }
  $result.isolation = [ordered]@{ head = $m.head; candidate = $m.candidate; buildManifestSha256 = $m.buildManifestSha256; fixtures = @($m.fixtures | ForEach-Object { [ordered]@{ id = $_.id; documentKind = $_.documentKind; sha256 = $_.sha256 } }) }
  if ($Owner) {
    Write-Host "G6 $Target app is open (profile $profileDir). Follow the checklist, then close the Blurby window. Waiting..."
    while (-not $el.HasExited) { Start-Sleep -Milliseconds 500 }
    Step 'owner-closed' @{ exitCode = $el.ExitCode }
  } else {
    foreach ($fixture in $FixtureList) {
      $run = "$Label-$fixture"
      $extra = @(); if ($Only) { $extra = @("--only=$Only") }
      & node "$Live\matrix-g6.mjs" "--profile=$profileDir" "--fixture=$fixture" "--run=$run" @extra *> "$logs\matrix-$run.log"
      $matrixExit = $LASTEXITCODE
      $casesFile = Join-Path $profileDir "captures\$run\g6-cases.json"
      $summary = $null
      if (Test-Path $casesFile) { $cj = Get-Content -Raw $casesFile | ConvertFrom-Json; $summary = [ordered]@{ cases = @($cj.cases).Count; pass = @($cj.cases | Where-Object result -eq 'pass').Count; fail = @($cj.cases | Where-Object result -eq 'fail').Count } }
      $result.captures += [ordered]@{ run = $run; fixture = $fixture; exitCode = $matrixExit; casesFile = $casesFile; summary = $summary; log = "$logs\matrix-$run.log" }
      Step 'matrix' @{ run = $run; exitCode = $matrixExit }
    }
  }
} catch {
  Step 'error' @{ message = $_.Exception.Message }
} finally {
  if ($el -and -not $el.HasExited) {
    $close = "const W=require('ws');fetch('http://127.0.0.1:$CdpPort/json/version').then(r=>r.json()).then(v=>{const s=new W(v.webSocketDebuggerUrl);s.on('open',()=>s.send(JSON.stringify({id:1,method:'Browser.close'})));s.on('error',e=>{console.error(e.message);process.exit(1)});s.on('close',()=>process.exit(0))}).catch(e=>{console.error(e.message);process.exit(1)})"
    & node -e $close *> "$logs\close.log"
    $cdpExit = $LASTEXITCODE
    $deadline = (Get-Date).AddSeconds(45)
    while ((Get-Date) -lt $deadline -and -not $el.HasExited) { Start-Sleep -Milliseconds 250 }
    $graceful = $el.HasExited
    if (-not $graceful) { Stop-Process -Id $el.Id -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 1 }
    Step 'electron-close' @{ cdpCloseExit = $cdpExit; graceful = $graceful; exitCode = $(if ($el.HasExited) { $el.ExitCode } else { $null }) }
  } elseif ($el) { Step 'electron-close' @{ alreadyExited = $true; exitCode = $el.ExitCode } }
  if ($vite -and -not $vite.HasExited) { Stop-Process -Id $vite.Id -Force -ErrorAction SilentlyContinue; Step 'preview-stop' @{ pid = $vite.Id } }
  Start-Sleep -Seconds 2
  $result.leftoverProcesses = @(Get-CimInstance Win32_Process | Where-Object { $_.Name -in 'electron.exe', 'node.exe' -and $_.CommandLine -and $_.CommandLine.Contains($runId) } | ForEach-Object { $_.ProcessId })
  $result.liveAfter = @(LiveHashes)
  $result.liveProfileUnchanged = (($result.liveBefore | ForEach-Object { $_.sha256 }) -join ',') -eq (($result.liveAfter | ForEach-Object { $_.sha256 }) -join ',')
  $result.finishedAt = (Get-Date).ToUniversalTime().ToString('o')
  $result | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 "$logs\result.json"
  Pop-Location
  $result | ConvertTo-Json -Depth 8
  if (-not $result.liveProfileUnchanged) { Write-Error 'LIVE PROFILE CHANGED' }
}
