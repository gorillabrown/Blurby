# Test-only A1-R driver (ROADMAP amendment 2026-10-08, item 1). Run from the run worktree with pwsh.
# Owns the preview and Electron lifecycles: restart preview on B0, launch Hidden with fresh persistent
# stdout/stderr redirects, one 10-second observe capture, graceful close (CDP Browser.close + Wait-Process),
# stop preview, then re-hash the live profile. Never deletes or reuses a profile; never writes the live profile.
param(
  [Parameter(Mandatory)] [string]$B0,
  [int]$CdpPort = 9335
)
$ErrorActionPreference = 'Stop'
$W = 'C:\Projects\Blurby\.worktrees\reader-mode-separation-2'
if ((Get-Location).Path -ne $W) { throw "Run from $W" }
$E = 'docs/planning/roadmap-reviews/reader-mode-separation-2/admission'
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmssfff')
$runId = "blurby-reader-mode-separation-2-a1-r$stamp"
$tempRoot = (Resolve-Path $env:TEMP).Path
$profileDir = Join-Path $tempRoot $runId
$logs = Join-Path $tempRoot "$runId-logs"   # sibling of the profile: the launcher refuses an existing profile
if (Test-Path $profileDir) { throw "Refusing existing profile $profileDir" }
New-Item -ItemType Directory $logs | Out-Null
$live = 'C:\Users\estra\AppData\Roaming\blurby\blurby-data'
function LiveHashes { foreach ($f in 'library.json', 'settings.json', 'sync-queue.json') { [ordered]@{ file = $f; sha256 = (Get-FileHash -Algorithm SHA256 (Join-Path $live $f)).Hash.ToLower() } } }
$result = [ordered]@{ runId = $runId; profile = $profileDir; logs = $logs; b0 = $B0; head = (git rev-parse HEAD); startedAt = (Get-Date).ToUniversalTime().ToString('o'); steps = @() }
function Step($name, $data) { $script:result.steps += [ordered]@{ at = (Get-Date).ToUniversalTime().ToString('o'); step = $name; data = $data } }
$result.liveBefore = @(LiveHashes)
$vite = $null; $el = $null
try {
  $vite = Start-Process -FilePath node -ArgumentList @('node_modules/vite/bin/vite.js', 'preview', '--port', '5173', '--strictPort', '--outDir', $B0) -WorkingDirectory $W -WindowStyle Hidden -PassThru -RedirectStandardOutput "$logs\preview.out.log" -RedirectStandardError "$logs\preview.err.log"
  $deadline = (Get-Date).AddSeconds(30); $up = $false
  while ((Get-Date) -lt $deadline -and -not $vite.HasExited) {
    try { if ((Invoke-WebRequest -UseBasicParsing http://localhost:5173/ -TimeoutSec 2).StatusCode -eq 200) { $up = $true; break } } catch {}
    Start-Sleep -Milliseconds 500
  }
  Step 'preview' @{ pid = $vite.Id; up = $up }
  if (-not $up) { throw 'Preview did not serve B0 on :5173' }

  $electron = Join-Path $W 'node_modules\electron\dist\electron.exe'
  $el = Start-Process -FilePath $electron -ArgumentList @("$E/isolated-launch.cjs", "--profile=$profileDir", "--cdp-port=$CdpPort", "--build-dir=$B0") -WorkingDirectory $W -WindowStyle Hidden -PassThru -RedirectStandardOutput "$logs\electron.out.log" -RedirectStandardError "$logs\electron.err.log"
  $result.electronPid = $el.Id
  $deadline = (Get-Date).AddSeconds(90); $ready = $false
  while ((Get-Date) -lt $deadline -and -not $el.HasExited) {
    if (Test-Path "$profileDir\isolation.json") {
      try { $m = Get-Content -Raw "$profileDir\isolation.json" | ConvertFrom-Json; if ($m.readyIsolationVerifiedAt -and $m.rendererIdentityInstalledAt) { $ready = $true; break } } catch {}
    }
    Start-Sleep -Milliseconds 500
  }
  Step 'renderer-ready' @{ ready = $ready; electronExited = $el.HasExited }
  if ($ready) {
    & node "$E/capture.mjs" "--profile=$profileDir" --scenario=observe --run=a1r-observe *> "$logs\capture.log"
    Step 'capture' @{ exitCode = $LASTEXITCODE }
  }
} catch {
  Step 'error' @{ message = $_.Exception.Message }
} finally {
  if ($el -and -not $el.HasExited) {
    $close = "const W=require('ws');fetch('http://127.0.0.1:$CdpPort/json/version').then(r=>r.json()).then(v=>{const s=new W(v.webSocketDebuggerUrl);s.on('open',()=>s.send(JSON.stringify({id:1,method:'Browser.close'})));s.on('error',e=>{console.error(e.message);process.exit(1)});s.on('close',()=>process.exit(0))}).catch(e=>{console.error(e.message);process.exit(1)})"
    & node -e $close *> "$logs\close.log"
    $graceful = $true
    try { Wait-Process -Id $el.Id -Timeout 45 -ErrorAction Stop } catch { $graceful = $false; Stop-Process -Id $el.Id -Force -ErrorAction SilentlyContinue }
    Step 'electron-close' @{ cdpCloseExit = $LASTEXITCODE; graceful = $graceful; exitCode = $(try { $el.ExitCode } catch { $null }) }
  } elseif ($el) { Step 'electron-close' @{ alreadyExited = $true; exitCode = $(try { $el.ExitCode } catch { $null }) } }
  if ($vite -and -not $vite.HasExited) { Stop-Process -Id $vite.Id -Force -ErrorAction SilentlyContinue; Step 'preview-stop' @{ pid = $vite.Id } }
  Start-Sleep -Seconds 2
  $leftover = @(Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($runId) } | ForEach-Object { $_.ProcessId })
  $result.leftoverProcesses = $leftover
  $result.liveAfter = @(LiveHashes)
  $result.liveProfileUnchanged = (($result.liveBefore | ForEach-Object { $_.sha256 }) -join ',') -eq (($result.liveAfter | ForEach-Object { $_.sha256 }) -join ',')
  $dataDir = Join-Path $profileDir 'userData\blurby-data'
  $result.profileWrites = @(if (Test-Path $dataDir) { Get-ChildItem $dataDir -File | ForEach-Object { [ordered]@{ file = $_.Name; bytes = $_.Length; modifiedUtc = $_.LastWriteTimeUtc.ToString('o') } } })
  $result.finishedAt = (Get-Date).ToUniversalTime().ToString('o')
  $result | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 "$logs\a1r-result.json"
  $result | ConvertTo-Json -Depth 8
}
