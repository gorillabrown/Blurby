# Stall diagnosis: warm-2.00, 19:42:49 to 19:43:16 (2026-10-13, UTC-05:00)

NARRATE-REBUILD-1 P5, time-log row 59. Read-only. Informs the owner; gates nothing (Decision #21).
Working directory confirmed: `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p5`, branch `eb/narrate-rebuild-1-p5`.

## Answer in one paragraph

The stall started with a host event: the laptop was undocked. At 19:42:48.28 the USB4 dock dropped off the bus, taking three external monitors (DEL4162, DEL404D, SAM030F), a USB hub, audio endpoints and a PCIe tree with it. At 19:42:49.011 the machine switched to battery (`AcOnline=false`, 80 % charge), and the Surface firmware driver applied battery power limits at 19:42:49.19 and 19:42:49.36. From 19:42:50.3 to 19:43:15.1, host CPU sat at 32.9 to 35.5 %, which is 4.0 of 12 logical processors. That flat run is the only one in the 5.5-minute series, and every thread we can observe was starved during it. The starved threads include threads in processes other than Blurby, and Blurby threads that had no work to do. Usable CPU capacity at the host fell to about 4 cores while the other 8 sat idle. **Cause of the 4-core cap: not resolved.** Core or cluster parking and a firmware power limit are both consistent with the data, and no enabled log records either one. **Nothing points inside Blurby's process.** Blurby did amplify the slowdown: 2 workers x 4 onnxruntime intra-op threads were running concurrently on about 1.5 cores, so generation slowed by about 25x when its CPU share fell by only about 2.7x. That is sensitivity to lost capacity, not a cause, so Decision #21's bug-and-hold clause is not triggered.

## 1. What Windows recorded, 19:42:30 to 19:43:30

The sweep covered every enabled log written since 19:42:30 (32 logs) and found 238 events. Nothing was recorded between 19:42:30 and 19:42:48.28.

| Time | Log / source | Id | Meaning |
|---|---|---|---|
| 19:42:48.280 | Kernel-PnP/Device Management | 1010 | USB hub `VID_0BDA&PID_2172` (Realtek) surprise-removed, missing on bus |
| 19:42:48.299 | Kernel-PnP/Device Management | 1010 | Qualcomm USB role-switch controller `URS\...0C8C` surprise-removed |
| 19:42:48.371, .402 | Audio/Operational | 65 | Audio endpoint state changed (repeats at 58.548, 58.905, 59.169, 59.600) |
| 19:42:48.372 | Kernel-PnP/Device Management | 1010 | External display DELL S2419HM (`QCASD\DynamicEnumExternalDisplay...`) surprise-removed |
| 19:42:48.425 to 19:43:19.602 | Store/Operational | 8001/8002/8011/8012 (60) | License-manager online checks for Dolby Access (triggered by the audio device change); hr 0x800703f0. No downloads or updates |
| 19:42:48.427 | Kernel-PnP/Device Management | 1010 | Monitor `DISPLAY\DEL4162` surprise-removed |
| 19:42:48.481, .483 | Client-Licensing-Platform/Admin | 100, 101 | ClipSVC trigger-started |
| 19:42:48.780 | WMI-Activity/Operational | 5857 | WMIProv provider started (wmiprvse 7464) |
| 19:42:48.885 | Kernel-PnP/Device Management | 1010 | USB device `VID_1D5C&PID_5801` (dock component) surprise-removed |
| **19:42:49.011** | **System / Kernel-Power** | **105** | **Power source change: `AcOnline=false`, 42,696 of 53,370 mWh** |
| 19:42:49.183 | UniversalTelemetryClient | 60 | "Is device on battery power: true" |
| 19:42:49.188 | TaskScheduler/Maintenance | 800 | Maintenance state changed to 1 (maintenance reacts to the AC loss; no task start is recorded, and TaskScheduler/Operational is disabled) |
| 19:42:49.189 (x2) | PushNotification-Platform | 1025 | ACPowerChange event fired |
| **19:42:49.191** | **System / Microsoft-Surface-SmfCpuClientDriver** | **4** | **Power limits applied: CAP 100000, BAP 78000** |
| 19:42:49.216, .217 | Application / IntelTelemetryAgent, IntelCollectorService | 257 | "system power changed" |
| 19:42:49.219 | Wcmsvc/Operational | 1005 | Power change processed |
| **19:42:49.358** | **System / SmfCpuClientDriver** | **4** | **CAP 100000, BAP 55000** |
| 19:42:51.482, .484 | Kernel-PnP/Device Management | 1010 | Monitors `DISPLAY\DEL404D` and `DISPLAY\SAM030F` surprise-removed |
| 19:42:51.487 | Kernel-PnP/Device Management | 1010 | Second USB role-switch controller `URS\...0C8B` surprise-removed |
| 19:42:51.604 | Kernel-PnP/Device Management | 1010 | USB4 device `USB4\QCOM0CD10001` (the dock) surprise-removed |
| 19:42:51.725 to 19:42:58.827 | PCI/Operational | 1 (64) | Nine PCIe buses tunnelled over USB4 (buses 1 to a) go STARTED to SURPRISE_REMOVED to REMOVED |
| 19:42:54.609 | Kernel-PnP/Driver Watchdog | 900 | PnP device-event-queue thread for the USB4 dock (`Usb4HostRouter`) had been running 3,005 ms |
| 19:42:57.789 | Kernel-PnP/Driver Watchdog | 901 | That thread completed after 6,186 ms |
| 19:42:58.272, .273 | System / SmfCpuClientDriver | 4 | Power limits re-applied: CAP 100000, BAP 55000 |
| 19:42:58.448 | Kernel-PnP/Device Management | 1010 | PCI device `VEN_17CB&DEV_0111` (Qualcomm PCIe port) surprise-removed |
| 19:42:58.692 | Audio/PlaybackManager | 23 | Exclusive-mode resource released |
| 19:42:58.955 to 19:42:59.667 | MF-FrameServer (Camera_FrameServer, Camera_DeviceMFT) (45) | 2 to 62 | Camera frame server re-initialised the internal camera (`QCOM_AVStream_8380`) after the device change; all hr 0x0 |
| 19:42:59.770 | AppModel-Runtime/Admin | 211 | Process 21060 started in the AppX container for `Microsoft.SurfaceHub` (the Surface app, reacting to the dock) |
| 19:43:10.860 | WMI-Activity/Operational | 5857 | CIMWin32 provider started (wmiprvse 28736); caller unknown, and the launcher's sampler uses Get-Process, not CIM |
| *19:43:15.0* | *(nothing recorded)* | | *Capacity returns (see section 2); no Windows event marks it* |
| 19:43:19.650/.651 | AppXDeploymentServer | 8100/8106/8101 | Trust-label check on WebpImageExtension (something loaded a WebP codec) |
| 19:43:24.916 to .934 | Security-LessPrivilegedAppContainer | 1 (15) | Access denied for a less-privileged app container (sandboxed process) |

Named channels with **no events** in the window: Windows Defender/Operational (last write 19:33:01), Resource-Exhaustion-Detector/Operational (last write 18:43:01, so no low-memory event), Kernel-Power/Thermal-Operational (last write 2026-10-10, so no thermal event), WindowsUpdateClient/Operational, Kernel-Boot/Operational. These were not available: TaskScheduler/Operational (disabled), Kernel-Processor-Power/Diagnostic (an analytic log, disabled), Diagnostics-Performance/Operational (not present on this machine).

The dock came back after the window: at 19:44:13.913 Kernel-Power 105 logged `AcOnline=true`, and SmfCpu raised BAP to 80000 and then 100000.

Was the undock a person pulling the cable, or a dock or link fault? The logs cannot say. All events are "surprise removed". AC was off for 85 s, which fits a manual unplug and replug as well as a dock reset.

## 2. Host or Blurby? The data, second by second

All CPU figures come from `warm-2-00.cpu.json`, 500 ms intervals.

| Interval (local) | Host busy | Blurby app tree (of 12 cores) | Foreign | Notes |
|---|---|---|---|---|
| 19:42:37 to 19:42:48.7 | 3.9 to 85.5 %, fluctuating | 31 to 55 % while generating (about 4 cores, which matches 2 workers x 4 intra-op threads) | small | normal |
| 19:42:49.255 to .995 | 56 % | 20.8 % | | **The launcher's own Node timer fired 740 ms late (500 ms nominal).** |
| 19:42:49.17 to 19:42:51.45 | | | | **The pwsh sampler, a separate process, produced no reading for 2,277 ms.** |
| 19:42:50.3 to 19:43:15.1 (48 samples) | **32.9 to 35.5 %, standard deviation < 1 point** | 6.5 to 23 % (mean about 12 %, about 1.5 cores) | 14 to 26 % (about 2.6 cores) | **The only flat run in the whole 19:40:01 to 19:45:26 series. The sampler's intervals stretched to 550 to 1,068 ms (normal is 505 to 520).** |
| 19:43:15.1 | 43.9 % then **99.2 %** | 23 % | 60 to 76 % | **The sampler returns to 515 ms intervals at 19:43:15.129.** |
| 19:43:15.6 to 19:43:20.6 | 77 to 100 % | 23 to 60 % | large | all 12 cores busy, still on battery |
| 19:43:21 onward | 26 to 69 %, fluctuating | 28 to 46 % | | normal, still on battery until 19:44:13 |

Producer log, in the same window:
- 19:42:49.199: post 162 (w1, 7 words). w2 is idle; its last result was 19:42:47.880.
- 19:42:50.457: **`lag w2 632 ms gen 0 free 632`**. Idle w2's event loop was 632 ms late with no generation running.
- 19:42:50.458: `lag main 912 ms`. 19:42:50.782: `lag main 275 ms`.
- 19:42:53.541: post 163 (w2, 3 words). From here both workers generate together, 8 ORT compute threads in all (`threads: 4` per worker in this run's log; `main/narrate/constants.js:18-19` sets intra 4 and inter 1).
- 19:43:04.574: result 162, gen 14,999 ms. Then the now-idle w1 shows `free` lags of 224, 349 and 284 ms (19:43:04.8 to 19:43:05.6), and the main thread shows 228, 337, 235 and 236 ms.
- 19:43:07.858: result 163, gen 14,193 ms. Then post 164 (w1, 9 words) at 19:43:07.867 and post 165 (w2, 4 words) at 19:43:10.912.
- **19:43:15.136 and 19:43:15.202: results 164 (7,184 ms) and 165 (4,245 ms) arrive 66 ms apart**, in the same half-second in which host CPU jumps from 34 % to 99 % and the sampler recovers.
- 19:43:16.683: result 166, 12 words in 1,458 ms. Normal again.
- The workers' `ext` stayed at 21 MB and RSS at 1,205 to 1,211 MB throughout.

Trial records (`latency-e2e.final-1.json`): `warm["2.00"].play.trials[11]` has latency 14,406 ms with cpu host 33.8 / app 11.4 / foreign 22.4. `resume.trials[11]` has latency 4,371 ms with cpu host 34.9 / app 19.0 / foreign 15.9. Neighbouring trials 10 and 12 read app 20 to 35 % and latency 73 to 703 ms.

### Hypothesis (a): a host event that slows threads without consuming CPU

**Verdict: shown for the trigger and the mechanism class. The exact way capacity was removed is plausible but not shown.**

- **Predicts:** threads in every process slow at once; idle threads wake late; host busy % does not rise in proportion; the event lines up with a logged host event.
- **Data:**
  - At least three other processes slowed with the same onset: the launcher's Node timer was 240 ms late, the pwsh sampler lost 2.3 s and then ran 10 to 100 % slow for 25 s, and the 99 % burst after recovery was foreign CPU.
  - Threads with no work were late: w2 by 632 ms with `gen 0`, and w1 after its job by 224 to 349 ms.
  - The onset at 19:42:48.3 to 19:42:49.4 coincides with the undock, the AC loss and the BAP power limits.
  - **Host busy was pinned at exactly 4 of 12 logical processors.** Runnable threads waited while 8 processors counted as idle. A scheduler with 12 usable processors does not allow that. It means 8 processors were unavailable: parked, or held in an idle state by power management.
  - The X1E80100 has 3 clusters of 4 cores, so one cluster fits exactly.
  - The current Balanced plan permits parking down to CPMINCORES = 25 % on both AC and DC (CPMAXCORES 100, MODULEUNPARKPOLICY 2, DC EPP 50 vs AC 33). Normal unpark heuristics (CPINCREASETIME 1, CPOVERUTIL 85) should have unparked within about one evaluation interval under 100 % load. That they did not for 25 s suggests either that the parking engine was held during the USB4/PCIe surprise-removal teardown (the PnP queue thread ran 6.2 s; PCI removals finished at 19:42:58.8), or that a firmware-level limit was imposed.
  - Battery alone is ruled out as the sustaining cause: from 19:43:15 to 19:44:13 the machine was still on battery with all 12 cores usable.
  - Nothing is logged at 19:43:15 to explain the recovery. The owner's Claude desktop activity at about that time would fire a latency-sensitivity hint (LATENCYHINTUNPARK = 100 %, which unparks all cores on user input). That fits the timing, but it cannot be placed precisely, so it is not shown.
- **Sub-hypotheses:**

| Sub-hypothesis | Verdict | Reason |
|---|---|---|
| Memory compression or paging | Ruled out as the cause | RSS and ext were flat. There was no Resource-Exhaustion event and the machine has 63.5 GB RAM. Paging stalls lower host busy irregularly; they do not pin it at exactly 4.0 cores. |
| Defender scan | Ruled out | No Defender events; a scan would show as foreign CPU above the cap anyway. Real-time scanning is not logged, but it consumes visible CPU. |
| Scheduled task | Not shown | The maintenance state change at 19:42:49.188 is a reaction to the AC loss. TaskScheduler/Operational is disabled, so a task start cannot be excluded, but a task consumes CPU and foreign stayed at about 2.6 cores. |
| Thermal | Ruled out | No Thermal-Operational event. |
| Display / desktop | Shown as a contributor | Three monitors were removed, the camera frame server re-initialised and the Surface app started. This is likely part of the 2.6 cores of foreign load and of the 912 ms main-thread stall. Blurby registers no `screen` or `powerMonitor` handlers (grep found none), so any work Electron did on the display change was framework work, not Blurby code. |
| Power / processor management | Plausible, best fit | It is the only mechanism that explains "8 cores idle while threads wait". It is not recorded, because Kernel-Processor-Power/Diagnostic is disabled. |

### Hypothesis (b): something inside Blurby blocking both worker threads together

**Verdict: ruled out as the cause.**

- **Predicts:** only Blurby threads slow, other processes run on time, and host busy drops, because Blurby blocks rather than computes.
- **Data:**
  - Other processes slowed with the same onset and recovered at the same moment as Blurby: the sampler at 19:43:15.129, the workers at 19:43:15.136 and .202. Blurby code cannot delay a separate pwsh process or the launcher's Node timer.
  - Host busy did not drop. It pinned at a fixed capacity.
  - The stall monitor charged the slow time to generation (`free` at most 49 ms), with ORT threads running, not waiting on a Blurby lock.
  - Memory was flat, so this is not the earlier 291 MB freeze.
  - Generation and lag recovered on their own, with no Blurby action, at the instant host capacity returned.

**Inside-process amplification (recorded, not a cause):**
- Blurby normally uses about 4 cores while generating (app 31 to 35 %). During the event it got about 1.5 cores, a 2.7x reduction, yet a 7-word generation went from 0.3 to 0.6 s to 15.0 s, a 25 to 50x slowdown.
- The excess fits onnxruntime's spin-waiting intra-op thread pool under oversubscription. From 19:42:53.5 to 19:43:04.6, 8 compute threads (2 workers x `intraOpNumThreads` 4) were contending for about 1.5 cores, and a preempted thread stalls each parallel op's barrier.
- This is a robustness property of the producer under lost CPU capacity. It is not something Blurby did to the host. The owner may want it noted. A candidate for later, untested, is fewer intra-op threads or spinning disabled when the two workers overlap.

## 3. Can the foreign-CPU ceiling see such an event?

No, not reliably. The ceiling computes foreign = host busy - app, which measures CPU consumed, not CPU available. When the host loses capacity (parking, power or frequency limits) or threads wait without computing (I/O, hard faults, kernel locks), host busy falls or stays flat, so foreign stays low. Here the host was pinned at 33.8 % and Blurby got squeezed to 11.4 %, which left the foreign figure at 22.4 % for play trial 11 and 15.9 % for resume trial 11. Both are under the 25 % ceiling, so both trials counted as valid measurements while the machine was crippled. The ceiling only tripped on the 99 % burst after capacity returned. To catch this class of event, a guard has to measure what the run could get, not what others took. Three options:
- a per-trial check that the sampler's own interval and the idle workers' lag stayed near nominal (a free canary already in the data: a sampler gap over 800 ms or an idle `free` lag over 200 ms flags the trial);
- the `\Processor Information(_Total)\% Processor Performance` and `Parking Status` counters (frequency and parked cores);
- `\System\Processor Queue Length`.

## Cause and what would resolve it next time

- **Trigger: shown.** The USB4 dock dropped at 19:42:48.28, with three monitors, AC power and the PCIe tunnels, and the Surface battery power limits were applied at 19:42:49.19 to .36.
- **Mechanism: shown at the level of capacity.** For 24.8 s only about 4 of 12 logical processors were usable.
- **Exact cause of the cap (parking engine vs firmware power limit) and of the 19:43:15 recovery: not resolved.**

To resolve it next time, all read-only or low-cost, enabled before a run:
1. Log `\Processor Information(*)\Parking Status`, `% Processor Performance`, `Processor Frequency` and `\System\Processor Queue Length` at 1 s with `typeperf`, alongside the run. `typeperf` is lightweight; logman is an alternative.
2. Enable the Microsoft-Windows-Kernel-Processor-Power/Diagnostic log for the run window (this is a system setting change, so it needs the owner's approval). Or, for a definitive answer, a short WPR `CPU` + `Power` profile capture, which is not allowed during measured runs under this dispatch's rules.
3. Keep the machine docked and on AC for measured runs, and have the launcher record `Kernel-Power 105` / `powercfg /getactivescheme` before and after each block, so that an AC-source change marks the affected trials automatically.
4. Add the sampler-gap and idle-lag canary from section 3 to the launcher's validity rules.

**Decision #21:** no cause is shown inside Blurby's process, so no bug is filed and nothing holds the merge. The one Blurby-side property, onnxruntime oversubscription that amplifies lost capacity, is a robustness note for the owner, not the cause.

## Commands run (all read-only)

1. PowerShell: `(Get-Location).Path`; `git --no-optional-locks branch --show-current` (with `GIT_OPTIONAL_LOCKS=0`); `New-Item -ItemType Directory ... scratchpad\stall`; `Get-Date`.
2. PowerShell: `Get-WinEvent -ListLog *` (enabled logs with `LastWriteTime >= 19:42:30`, 32 logs), then `Get-WinEvent -FilterHashtable @{LogName; StartTime=19:42:30; EndTime=19:43:30}` for each; output written to `scratchpad\stall\events-window.txt`.
3. PowerShell: grouped counts of that file; a filtered listing without Store and Camera events.
4. PowerShell: `Get-WinEvent` on System (19:30 to 20:10) for Kernel-Power, SmfCpu, Kernel-Processor, PnP and power providers; Kernel-Power 105 event data.
5. PowerShell: Kernel-Power 105 XML data (19:40 to 19:45); Kernel-PnP/Driver Watchdog XML data; Kernel-PnP/Device Management 19:40 to 19:46; Kernel-PnP/Configuration (no events; the query returned exit 1).
6. Grep `p5-latency-e2e.mjs` for the sampler; PowerShell `Get-Content` lines 50 to 81 of it.
7. Bash and node: wrote `scratchpad\stall\cpu.mjs`, ran it against `warm-2-00.cpu.json` and saved the output to `scratchpad\stall\cpu-window.txt`.
8. PowerShell: `Select-String` on `warm-2-00.log` for epoch stamps 1791938555000 to 1791938605000; saved to `scratchpad\stall\producer-window.txt`.
9. PowerShell: `powercfg /getactivescheme`; `powercfg /qh SCHEME_CURRENT SUB_PROCESSOR` (query only, nothing changed).
10. Bash and node: wrote `scratchpad\stall\trials.mjs`, read trials 10 to 12 for play and resume, scanned the whole CPU series for flat 33 % runs and sampler gaps.
11. Grep `main/`, `src/` and `preload.js` for `display-removed|display-metrics-changed|powerMonitor|screen.on(|on-battery|on-ac` (no matches).
12. PowerShell: per-channel event counts for System, Application, Defender, TaskScheduler/Operational, Resource-Exhaustion-Detector, Kernel-Power/Thermal-Operational, Kernel-Processor-Power/Diagnostic, Diagnostics-Performance, WindowsUpdateClient, Store, Dwm-Core, Kernel-Boot and Kernel-Memory.
13. PowerShell: time ranges of the Store, Camera and AppContainer event groups.
14. Grep `main/` for the ORT thread options; grep `main/narrate` for the thread constants; `Select-String` for `threads` in `warm-2-00.log` and `INTRA_OP` in the launcher (no match).

## Files read

- `C:\Projects\Blurby-artifacts\narrate-rebuild-1\p5-final\logs\warm-2-00.log` (window lines, `threads` line)
- `C:\Projects\Blurby-artifacts\narrate-rebuild-1\p5-final\logs\warm-2-00.cpu.json`
- `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p5\scripts\narrate-rebuild\p5-latency-e2e.mjs` (lines 50 to 81, grep)
- `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p5\docs\studies\narrate-rebuild-1\phase5\latency-e2e.final-1.json` (warm 2.00 play/resume trials 10 to 12)
- `C:\Projects\Blurby\.worktrees\narrate-rebuild-1-p5\main\narrate\producer-worker.js:67`, `main\narrate\producer.js:28-34`, `main\narrate\constants.js:18-19` (grep hits)
- Windows event logs listed above

Scratch files (all under `C:\Users\estra\AppData\Local\Temp\claude\C--Projects-Blurby\ce36ca3b-fb66-4920-a83d-626e17e3da01\scratchpad\stall\`): `events-window.txt`, `cpu.mjs`, `cpu-window.txt`, `producer-window.txt`, `trials.mjs`, `stall-diagnosis.md`. No tracked file was touched.
