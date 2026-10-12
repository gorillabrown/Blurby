Set-Location C:\Projects\Blurby
$global:LASTEXITCODE=$null; $o = git grep -n -P 'ipcMain\.handle(' -- main 2>&1; "badregex exit=$LASTEXITCODE out=$o"
$global:LASTEXITCODE=$null; $o = git grep -h -c 'Object.assign(settings' -- main/sync-engine.js 2>&1; "hc exit=$LASTEXITCODE out=[$o]"
$global:LASTEXITCODE=$null; $o = git grep -c 'Object.assign(settings' -- main/sync-engine.js 2>&1; "c exit=$LASTEXITCODE out=[$o]"
