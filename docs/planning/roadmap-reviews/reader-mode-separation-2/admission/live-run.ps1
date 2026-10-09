# Test-only live-capture driver for A2/A3 (generalizes a1r-run.ps1, which stays as the A1-R record).
# One isolated B0 launch, several capture.mjs runs, graceful close, live-profile hash check.
# Usage (from the run worktree): pwsh -File <this> -B0 <archive> -Captures epub:flow,text:flow -Label a2
param(
  [Parameter(Mandatory)] [string]$B0,
  [Parameter(Mandatory)] [string[]]$Captures,
  [Parameter(Mandatory)] [ValidatePattern('^[a-z0-9]+$')] [string]$Label,
  [int]$CdpPort = 9335
)
$ErrorActionPreference = 'Stop'
$W = 'C:\Projects\Blurby\.worktrees\reader-mode-separation-2'
if ((Get-Location).Path -ne $W) { throw "Run from $W" }
$E = 'docs/planning/roadmap-reviews/reader-mode-separation-2/admission'
$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmssfff')
$runId = "blurby-reader-mode-separation-2-a1-$Label$stamp"   # launcher requires the a1- prefix
$tempRoot = (Resolve-Path $env:TEMP).Path
$profileDir = Join-Path $tempRoot $runId
$logs = Join-Path $tempRoot "$runId-logs"
if (Test-Path $profileDir) { throw "Refusing existing profile $profileDir" }
New-Item -ItemType Directory $logs | Out-Null
$live = 'C:\Users\estra\AppData\Roaming\blurby\blurby-data'
function LiveHashes { foreach ($f in 'library.json', 'settings.json', 'sync-queue.json') { [ordered]@{ file = $f; sha256 = (Get-FileHash -Algorithm SHA256 (Join-Path $live $f)).Hash.ToLower() } } }
$result = [ordered]@{ runId = $runId; label = $Label; profile = $profileDir; logs = $logs; b0 = $B0; head = (git rev-parse HEAD); startedAt = (Get-Date).ToUniversalTime().ToString('o'); steps = @() }
function Step($name, $data) { $script:result.steps += [ordered]@{ at = (Get-Date).ToUniversalTime().ToString('o'); step = $name; data = $data } }
function Cdp($js) { & node -e $js 2>&1 | Out-String }
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
  if (-not $ready) { throw 'Renderer identity not installed' }
  # Visibility probe: a hidden window throttles rAF/timers and would invalidate pacing observations.
  $probe = "const W=require('ws');fetch('http://127.0.0.1:$CdpPort/json/list').then(r=>r.json()).then(t=>{const p=t.find(x=>x.type==='page'&&x.url.startsWith('http://localhost:5173'));const s=new W(p.webSocketDebuggerUrl);s.on('open',()=>s.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression:'JSON.stringify({visibilityState:document.visibilityState,hidden:document.hidden,hasFocus:document.hasFocus(),inner:[innerWidth,innerHeight]})',returnByValue:true}})));s.on('message',m=>{console.log(JSON.parse(String(m)).result.result.value);s.close()})}).catch(e=>{console.log('probe-error '+e.message)})"
  Step 'visibility' @{ probe = (Cdp $probe).Trim() }
  foreach ($c in ($Captures -join ',').Split(',', [StringSplitOptions]::RemoveEmptyEntries)) {   # pwsh -File passes one string
    $fixture, $scenario = $c.Split(':')
    $run = "$Label-$fixture-$scenario"
    & node "$E/capture.mjs" "--profile=$profileDir" "--fixture=$fixture" "--scenario=$scenario" "--run=$run" *> "$logs\capture-$run.log"
    Step 'capture' @{ run = $run; exitCode = $LASTEXITCODE }
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
    if (-not $graceful) { Stop-Process -Id $el.Id -Force -ErrorAction SilentlyContinue }
    Step 'electron-close' @{ cdpCloseExit = $cdpExit; graceful = $graceful; exitCode = $(try { $el.ExitCode } catch { $null }) }
  } elseif ($el) { Step 'electron-close' @{ alreadyExited = $true; exitCode = $(try { $el.ExitCode } catch { $null }) } }
  if ($vite -and -not $vite.HasExited) { Stop-Process -Id $vite.Id -Force -ErrorAction SilentlyContinue; Step 'preview-stop' @{ pid = $vite.Id } }
  Start-Sleep -Seconds 2
  $result.leftoverProcesses = @(Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($runId) } | ForEach-Object { $_.ProcessId })
  $result.liveAfter = @(LiveHashes)
  $result.liveProfileUnchanged = (($result.liveBefore | ForEach-Object { $_.sha256 }) -join ',') -eq (($result.liveAfter | ForEach-Object { $_.sha256 }) -join ',')
  $result.finishedAt = (Get-Date).ToUniversalTime().ToString('o')
  $result | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 "$logs\result.json"
  $result | ConvertTo-Json -Depth 8
}
