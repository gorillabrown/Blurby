# NARRATE-FRAME-GATE-1 (F-036): hold the display on for as long as this process lives. Calls
# kernel32!SetThreadExecutionState(ES_CONTINUOUS | ES_DISPLAY_REQUIRED) and sleeps until killed. It changes no power
# setting; the request ends with the process. It does not wake a panel already off (the display probe catches that).
$ErrorActionPreference = "Stop"
Add-Type -Namespace Blurby -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
$ES_CONTINUOUS = [uint32]"0x80000000"
$ES_DISPLAY_REQUIRED = [uint32]"0x00000002"
$prev = [Blurby.Power]::SetThreadExecutionState($ES_CONTINUOUS -bor $ES_DISPLAY_REQUIRED)
if ($prev -eq 0) { [Console]::Error.WriteLine("display-hold: SetThreadExecutionState failed"); exit 1 }
[Console]::Out.WriteLine("display-hold: held (pid $PID)")
while ($true) { Start-Sleep -Seconds 30 }
