# NARRATE-REBUILD-1 completion window. Serial; never two heavy steps at once. Each step logs its exit code (UTC).
# Usage (pwsh 7, quiet machine, nothing else heavy running):
#   pwsh -File scripts\narrate-rebuild\epic-window.ps1 -MainWorktree <clean checkout of main> [-P6Worktree <repo root>]
#        [-ArtifactsRoot C:\Projects\Blurby-artifacts\narrate-rebuild-1] [-OutDir <logs>] [-ModelsRoot <models>]
# Run the manifest hash check (docs\planning\epics\2026-10-12-narrate-rebuild\second-machine.md) first.
# Exit 10 = step 0 (npm test on main) failed. Otherwise exit 0 means the script ran; read each logged exit code.
param(
  [Parameter(Mandatory = $true)][string]$MainWorktree,
  [string]$P6Worktree = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)),
  [string]$ArtifactsRoot = 'C:\Projects\Blurby-artifacts\narrate-rebuild-1',
  [string]$OutDir,
  [string]$ModelsRoot
)
$ErrorActionPreference = 'Continue'
if (-not $ModelsRoot) { $ModelsRoot = Join-Path $ArtifactsRoot 'models' }
if (-not $OutDir) { $OutDir = Join-Path $ArtifactsRoot 'epic-window' }
New-Item -ItemType Directory -Force $OutDir | Out-Null
$env:NARRATE_MODELS_ROOT = $ModelsRoot
$env:NARRATE_REBUILD_ARTIFACTS = $ArtifactsRoot
$log = Join-Path $OutDir 'window.log'
function Note($m) { "$((Get-Date).ToUniversalTime().ToString('yyyy-MM-dd HH:mm:ssZ')) $m" | Tee-Object -FilePath $log -Append }
function Cpu { (Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average }
function Counts($file) { (Select-String -Path $file -Pattern 'Test Files|Tests ' | ForEach-Object { $_.Line.Trim() }) -join ' / ' }

Note "START cpu=$(Cpu) main=$MainWorktree p6=$P6Worktree artifacts=$ArtifactsRoot models=$ModelsRoot out=$OutDir"

# Step 0: full suite on main in a clean checkout (needs no assets).
Set-Location $MainWorktree
Note "step0 HEAD=$(git rev-parse --short HEAD)"
npm test *> (Join-Path $OutDir 'step0-main-npm-test.txt'); $e0 = $LASTEXITCODE
Note "step0 main npm test exit=$e0 :: $(Counts (Join-Path $OutDir 'step0-main-npm-test.txt'))"
if ($e0 -ne 0) { Note 'STOP: step0 failed; send to Blurby.Brain before touching the epic'; exit 10 }

# P6 tree
Set-Location $P6Worktree
Note "P6 HEAD=$(git rev-parse --short HEAD) tree=$(git rev-parse 'HEAD^{tree}')"
npm run build *> (Join-Path $OutDir 'p6-build-1.txt'); Note "P6 build (for the launcher) exit=$LASTEXITCODE"

# D3 / D5 / D6: one launcher run (5-minute sessions at 1.00x and 2.00x, warm 20, cold 5).
$out = Join-Path $ArtifactsRoot 'p6-completion'
Note "launcher start cpu=$(Cpu)"
node scripts/narrate-rebuild/p5-latency-e2e.mjs --minutes 5 --warm 20 --cold 5 --rates 1.0,2.0 --out $out *> (Join-Path $OutDir 'launcher.txt'); $eL = $LASTEXITCODE
Note "launcher exit=$eL (expect 0)"
Get-Content (Join-Path $OutDir 'launcher.txt') -Tail 40 | Out-File (Join-Path $OutDir 'launcher-tail.txt')

# Keep the launcher's records: rename both to *.completion-N.json, then restore the committed recorded-output.json
# from HEAD (git show through cmd keeps the bytes; never git checkout or reset).
$phase5 = 'docs/studies/narrate-rebuild-1/phase5'
$n = 1; while (Test-Path "$phase5/latency-e2e.completion-$n.json") { $n++ }
if (Test-Path "$phase5/latency-e2e.json") { Move-Item "$phase5/latency-e2e.json" "$phase5/latency-e2e.completion-$n.json"; Note "renamed latency-e2e.json -> latency-e2e.completion-$n.json" } else { Note 'WARN: latency-e2e.json not written' }
if (Test-Path "$phase5/recorded-output.json") {
  Move-Item "$phase5/recorded-output.json" "$phase5/recorded-output.completion-$n.json"; Note "renamed recorded-output.json -> recorded-output.completion-$n.json"
  cmd /c "git show HEAD:$phase5/recorded-output.json > $phase5\recorded-output.json"
  git diff --quiet HEAD -- "$phase5/recorded-output.json"; Note "recorded-output.json restored from HEAD, git diff exit=$LASTEXITCODE (expect 0)"
} else { Note 'WARN: recorded-output.json not written' }

# D11: project gates, after the timed rows.
npm test *> (Join-Path $OutDir 'p6-npm-test.txt'); Note "D11 npm test exit=$LASTEXITCODE :: $(Counts (Join-Path $OutDir 'p6-npm-test.txt'))"
npm run typecheck *> (Join-Path $OutDir 'p6-typecheck.txt'); Note "D11 typecheck exit=$LASTEXITCODE"
npm run build *> (Join-Path $OutDir 'p6-build-2.txt'); Note "D11 build exit=$LASTEXITCODE"
Note "TIMED ROWS AND FULL SUITE DONE cpu=$(Cpu)"

# D1
node scripts/narrate-rebuild/p0-summary.mjs --quiet *> (Join-Path $OutDir 'd1-summary.txt'); Note "D1 p0-summary exit=$LASTEXITCODE (expect 0)"
# p0-summary rewrites the tracked phase0/summary.json (new recordedAt): keep that copy as evidence, then restore the tracked
# file from HEAD so the run leaves no tracked file changed (git show through cmd keeps the bytes; launch.md forbids checkout/reset).
$sum = 'docs/studies/narrate-rebuild-1/phase0/summary.json'
Copy-Item $sum (Join-Path $OutDir 'd1-summary.json')
cmd /c "git show HEAD:$sum > docs\studies\narrate-rebuild-1\phase0\summary.json"
git diff --quiet HEAD -- $sum; Note "D1 summary.json saved to OutDir and restored from HEAD, git diff exit=$LASTEXITCODE (expect 0)"
node scripts/narrate-rebuild/p0-summary.mjs --break --quiet *> (Join-Path $OutDir 'd1-summary-break.txt'); Note "D1 p0-summary --break exit=$LASTEXITCODE (expect 1)"
# D4 + D5 engine/crossings/trace + D7 suites
npx vitest run tests/narrate tests/readerModes/narrate.contract.test.ts *> (Join-Path $OutDir 'd4-d5-d7-suites.txt'); Note "D4/D5/D7 narrate suites exit=$LASTEXITCODE :: $(Counts (Join-Path $OutDir 'd4-d5-d7-suites.txt'))"
# D8
npx vitest run tests/readerModeBoundaries.test.ts tests/readerModeOwnership.test.ts tests/readerModeIsolation.test.ts tests/readerModes/ *> (Join-Path $OutDir 'd8-suites.txt'); Note "D8 suites exit=$LASTEXITCODE"
git diff --exit-code 05a5480a -- docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/page.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/focus.baseline.json docs/planning/roadmap-reviews/reader-mode-separation-2/fixtures/flow.baseline.json *> (Join-Path $OutDir 'd8-baselines.txt'); Note "D8 baselines diff vs 05a5480a exit=$LASTEXITCODE (expect 0)"
# D9
npx vitest run tests/settingsNarrateNormalization.test.js tests/settingsMigrationV13.test.js *> (Join-Path $OutDir 'd9-suites.txt'); Note "D9 suites exit=$LASTEXITCODE"
# D10
git grep -n -l -P '_alignWordsToTimestamps|computeWordTimestamps' -- src main scripts patches *> (Join-Path $OutDir 'd10-grep.txt'); Note "D10 grep exit=$LASTEXITCODE (expect 1: no match is the absence check passing)"
# D3 recorder positive control (offline), on a produced session trace
$rec = Get-ChildItem $out -Recurse -Filter '*.trace.json' | Where-Object { $_.FullName -match 'session' } | Select-Object -First 1
if ($rec) { node scripts/narrate-rebuild/p5-recorded-output-check.mjs $rec.FullName --min-minutes 0 --break *> (Join-Path $OutDir 'd3-break.txt'); Note "D3 check --break exit=$LASTEXITCODE (expect 1) on $($rec.Name)" }
else { Note 'WARN: no session trace found for the D3 --break control' }
Note 'END'
