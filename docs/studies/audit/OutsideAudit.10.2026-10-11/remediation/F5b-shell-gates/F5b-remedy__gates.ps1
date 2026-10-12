Set-Location C:\Projects\Blurby
function Run($label, [scriptblock]$sb) {
  $global:LASTEXITCODE = $null
  $out = & $sb 2>&1
  $err = @($out | Where-Object { $_ -is [System.Management.Automation.ErrorRecord] })
  $std = @($out | Where-Object { $_ -isnot [System.Management.Automation.ErrorRecord] })
  "{0}`texit={1}`tstdout_lines={2}`tstderr_lines={3}`tfirst={4}" -f $label, $LASTEXITCODE, $std.Count, $err.Count, ($std | Select-Object -First 1)
}
Run 'DW1'  { git ls-files src/reader/modes/narrate src/reader/modes/NarrateModeAdapter.ts src/hooks/useNarration.ts src/hooks/narration src/components/settings/TTSSettings.tsx src/styles/tts-settings.css src/components/FoliatePageView.tsx src/hooks/useReaderMode.ts main/qwen-engine.js main/python-sidecar-engine.js scripts/tts_eval_runner.mjs }
Run 'DW5'  { git grep -n -P '\x22tts\x22|Narration \(TTS\)' -- src/components/SettingsMenu.tsx src/components/CommandPalette.tsx src/components/MenuFlap.tsx }
Run 'DW8a' { git grep -n -P 'scheduleBackgroundStartupTasks|runKokoroWarmup|ttsCache\.init|scheduleCleanupOrphans|runCacheCleanup' -- main.js }
Run 'DW9a' { git grep -n -P 'kokoro|tts-kokoro|tts-cache|ttsCache|tts-qwen|tts-nano|tts-pocket' -- preload.js }
Run 'DW9b' { git grep -n -P 'kokoroPreload|kokoroGenerate|ttsCache[A-Z]' -- src }
Run 'DW10a' { git ls-files -- 'main/*moss*' 'main/*pocket*' 'main/*qwen*' 'main/*sidecar*' }
Run 'DW10b' { git grep -n -P 'ipcMain\.handle\(\x22tts-(nano|pocket|qwen)-' -- main }
Run 'DW11' { git grep -n -P 'quality-gate|test:quality|tts:eval|tts:scan|moss:' -- .github/workflows/ci.yml package.json }
Run 'NEG_nomatch' { git grep -n -P 'ipcMain\.handle\(\x22tts-(nano|pocket|qwen)-' -- preload.js }
Run 'NEG_badregex' { git grep -n -P 'ipcMain\.handle\(' -- main }
Run 'NEG_missingpath' { git grep -n -P 'tts' -- src/components/NoSuchFile.tsx }
Run 'NEG_lsfiles_nomatch' { git ls-files -- 'main/*zzznomatch*' }
Run 'DW249h' { git grep -h -c 'applyCloudSettings(ctx' -- main/sync-engine.js }
