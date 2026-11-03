# FOLIATE-OBSERVER-LEAK-1 live runner (scratch; not committed). Scratch profile only; the owner's profile is never used.
param([string]$Label, [string]$Script, [string]$ScriptArgList = "", [int]$Port = 9351)
$ScriptArgs = if ($ScriptArgList) { $ScriptArgList -split "\|" } else { @() }
$wt = "C:\Projects\Blurby\.worktrees\foliate-observer-leak-1"
$out = "C:\Projects\Blurby-artifacts\foliate-observer-leak-1"
$root = Join-Path $env:TEMP ("blurby-fol1-$Label-" + [guid]::NewGuid())
$env:BLURBY_USER_DATA_DIR = $root
$errLog = Join-Path $root "blurby-data\error.log"
$p = Start-Process -FilePath "$wt\release\win-unpacked\Blurby.exe" -ArgumentList "--remote-debugging-port=$Port" -PassThru
for ($i = 0; $i -lt 60; $i++) { try { Invoke-RestMethod "http://127.0.0.1:$Port/json/list" | Out-Null; break } catch { Start-Sleep -Milliseconds 500 } }
Start-Sleep -Seconds 4
$args2 = @($ScriptArgs | ForEach-Object { $_.Replace("{ERRLOG}", $errLog).Replace("{OUT}", $out) })
node $Script $Port @args2
"script exit $LASTEXITCODE"
Get-Process -Id $p.Id -ErrorAction SilentlyContinue | ForEach-Object { $_.CloseMainWindow() | Out-Null }
Start-Sleep -Seconds 6
Get-Process -Name Blurby -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "$wt*" } | Stop-Process -Force -ErrorAction SilentlyContinue
"profile: $root"
$settings = Join-Path $root "blurby-data\settings.json"
if (Test-Path $settings) { "sourceFolder: " + ((Get-Content $settings -Raw | ConvertFrom-Json).sourceFolder | ConvertTo-Json -Compress) }
if (Test-Path $errLog) {
  "error.log ResizeObserver loop lines: " + (Select-String -Path $errLog -Pattern "ResizeObserver loop" -SimpleMatch | Measure-Object).Count
  "error.log destructure 'style' lines: " + (Select-String -Path $errLog -Pattern "Cannot destructure property 'style'" -SimpleMatch | Measure-Object).Count
  "error.log total lines: " + (Get-Content $errLog | Measure-Object).Count
} else { "error.log: none written" }
