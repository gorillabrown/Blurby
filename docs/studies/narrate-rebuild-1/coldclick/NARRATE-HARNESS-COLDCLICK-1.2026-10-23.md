# NARRATE-HARNESS-COLDCLICK-1 — cold click on the D6 harness (2026-10-23)

Spec: ROADMAP.md, anchor `narrate-harness-coldclick-1-spec`. Branch `eb/narrate-harness-coldclick-1` (built and held, Stage 8 freeze). Every row below is read from engine traces and the driver's summary step "clicked while playing" (`scripts/narrate-rebuild/lib/coldclick.mjs`); nothing is estimated.

Classes: `attributed` (the first voiced sample answers the click), `lost-race` (Play's first voiced sample came at or before the click, or the click was requested only after Play's first chunk was scheduled), `undelivered` (click sent before the first voice, never requested), `no-voice`, `no-click` (a voice but no click step: the trial errored before its click).

## Base classification (Done-when 2) — gate (1) run 4, quiet machine

*To be filled by Blurby.Brain:* `docs/studies/narrate-rebuild-1/coldclick/base-run4.classification.txt` (command, exit code, stderr bytes, and the `--break` control's exit 1).

## Reference smoke (Done-when 5) — this machine, Snapdragon X Elite, 12 cores

Command (pwsh 7, worktree root, after `npm run build`; `NARRATE_MODELS_ROOT=C:\Projects\Blurby-artifacts\narrate-quit-linger-1\models`, the duration-exposed copy):

```
pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only cold --types click --cold 3 --rates 1.0,2.0 --out C:\Projects\Blurby-artifacts\narrate-harness-coldclick-1\reference      # exit 1, 03:56–04:32Z
pwsh -NoProfile -File scripts/narrate-rebuild/app-node.ps1 scripts/narrate-rebuild/p5-latency-e2e.mjs --only cold --types click --cold 3 --rates 1.0,2.0 --out C:\Projects\Blurby-artifacts\narrate-harness-coldclick-1\reference-2    # exit 1, 04:35–04:58Z (the one re-run)
```

**Outcome: short — stop and report (spec, failure handling).** Both runs: every launch exited 0; 160 of 160 trials `lost-race`, none `undelivered`, every click became an engine `click` request (`clickRequested` 160/160); 0 `attributed` at each rate (pass needs 3). The live profile was unchanged (run 2's hashes cover `blurby-data/settings.json` and `library.json`; run 1 hashed only the profile root, where neither file lives — fixed in `580d4050`).

What the traces show: the view opens on the book's cover (24 characters, no word spans). Play starts the engine and steps the view to word 8723's section; the section's spans exist only after Play's first voiced sample (run 2 median: spans ready 1,217 ms after Play's request at 1.00x, first voice 983 ms; 2.00x 1,194 vs 1,010). This is the R4 shape. The host carried 50–100 % foreign CPU from parallel builders throughout (medians 53–64 %), so these numbers do not say what an idle reference-class machine does; none of these trials counts under the foreign-CPU rule.

The smoke's stop condition for a wrong driver (`undelivered`) did not occur. The shortfall's rule ("re-run once; still short, stop and report") is met; whether Done-when 6 proceeds is Blurby.Roadmap's and Blurby.Brain's call (recommendation in the staging memo).

### Reference smoke 1 (reference)

Host: Snapdragon(R) X 12-core X1E80100 @ 3.40 GHz, 12 physical cores, d6class `reference`; Electron 42.11.18; generated 2026-10-24T03:56:27.833Z. Verdict FAIL.

Live profile (`C:\Users\estra\AppData\Roaming\blurby`): settings.json absent→absent; library.json absent→absent.

**1.00x:** 40 launches, 0 counting; classes lost-race 40; clickRequested 40/40. spansReadyMs median 2114, worst 7527; Play's first voice (latencyMs) median 1873, worst 7281; clickLatencyMs median 1422, worst 1743; foreign CPU median 64.3 %.

| label | class | play word | spansReadyMs | voiced before click | clickRequested | latency ms (cause) | clickLatencyMs | foreign CPU % | counts |
|---|---|---|---|---|---|---|---|---|---|
| cold-click-1.00-1 | lost-race | 8723 | 1600 | true | true | 1380 (play) | null | 64.3 | false |
| cold-click-1.00-2 | lost-race | 8723 | 1216 | true | true | 979 (play) | null | 58.4 | false |
| cold-click-1.00-3 | lost-race | 8723 | 1240 | true | true | 991 (play) | null | 57.8 | false |
| cold-click-1.00-4 | lost-race | 8723 | 1319 | true | true | 1080 (play) | null | - | false |
| cold-click-1.00-5 | lost-race | 8723 | 1366 | true | true | 1115 (play) | null | 58.7 | false |
| cold-click-1.00-6 | lost-race | 8723 | 2148 | true | true | 1919 (play) | null | 69.9 | false |
| cold-click-1.00-7 | lost-race | 8723 | 2148 | true | true | 1912 (play) | 1422 | 51.7 | false |
| cold-click-1.00-8 | lost-race | 8723 | 1335 | true | true | 1087 (play) | 1743 | 56.2 | false |
| cold-click-1.00-9 | lost-race | 8723 | 2114 | true | true | 1873 (play) | null | 74.6 | false |
| cold-click-1.00-10 | lost-race | 8723 | 1561 | true | true | 1330 (play) | null | 72 | false |
| cold-click-1.00-11 | lost-race | 8723 | 2088 | true | true | 1870 (play) | 1503 | 53 | false |
| cold-click-1.00-12 | lost-race | 8723 | 1343 | true | true | 1111 (play) | null | 56.6 | false |
| cold-click-1.00-13 | lost-race | 8723 | 3848 | true | true | 3609 (play) | null | 80 | false |
| cold-click-1.00-14 | lost-race | 8723 | 2079 | true | true | 1846 (play) | null | 53.6 | false |
| cold-click-1.00-15 | lost-race | 8723 | 1839 | true | true | 1614 (play) | null | 64.2 | false |
| cold-click-1.00-16 | lost-race | 8723 | 2152 | true | true | 1922 (play) | null | 68.9 | false |
| cold-click-1.00-17 | lost-race | 8723 | 1993 | true | true | 1767 (play) | null | 70.5 | false |
| cold-click-1.00-18 | lost-race | 8723 | 3319 | true | true | 3089 (play) | null | 78.8 | false |
| cold-click-1.00-19 | lost-race | 8723 | 1385 | true | true | 1122 (play) | null | 58.3 | false |
| cold-click-1.00-20 | lost-race | 8723 | 2361 | true | true | 2115 (play) | null | 72.4 | false |
| cold-click-1.00-21 | lost-race | 8723 | 2874 | true | true | 2627 (play) | null | 72.1 | false |
| cold-click-1.00-22 | lost-race | 8723 | 3143 | true | true | 2887 (play) | null | 73.3 | false |
| cold-click-1.00-23 | lost-race | 8723 | 2528 | true | true | 2274 (play) | null | 70.5 | false |
| cold-click-1.00-24 | lost-race | 8723 | 1375 | true | true | 1144 (play) | null | 58.8 | false |
| cold-click-1.00-25 | lost-race | 8723 | 1242 | true | true | 1002 (play) | null | 58.8 | false |
| cold-click-1.00-26 | lost-race | 8723 | 1831 | true | true | 1597 (play) | null | 65.9 | false |
| cold-click-1.00-27 | lost-race | 8723 | 2687 | true | true | 2409 (play) | null | 54.6 | false |
| cold-click-1.00-28 | lost-race | 8723 | 1546 | true | true | 1322 (play) | null | 62.8 | false |
| cold-click-1.00-29 | lost-race | 8723 | 3840 | true | true | 3596 (play) | 1420 | 60.1 | false |
| cold-click-1.00-30 | lost-race | 8723 | 2313 | true | true | 2069 (play) | null | 74.3 | false |
| cold-click-1.00-31 | lost-race | 8723 | 1243 | true | true | 1003 (play) | null | 59.7 | false |
| cold-click-1.00-32 | lost-race | 8723 | 3191 | true | true | 2955 (play) | null | 68.2 | false |
| cold-click-1.00-33 | lost-race | 8723 | 1480 | true | true | 848 (play) | 1355 | - | false |
| cold-click-1.00-34 | lost-race | 8723 | 3571 | true | true | 2575 (play) | 1394 | 72.4 | false |
| cold-click-1.00-35 | lost-race | 8723 | 3151 | true | true | 2918 (play) | null | 85.4 | false |
| cold-click-1.00-36 | lost-race | 8723 | 2515 | true | true | 2254 (play) | 1439 | 54.4 | false |
| cold-click-1.00-37 | lost-race | 8723 | 3948 | true | true | 3714 (play) | null | 60.5 | false |
| cold-click-1.00-38 | lost-race | 8723 | 7527 | true | true | 7281 (play) | null | 84.8 | false |
| cold-click-1.00-39 | lost-race | 8723 | 1409 | true | true | 1172 (play) | 1531 | - | false |
| cold-click-1.00-40 | lost-race | 8723 | 4550 | true | true | 4315 (play) | 1233 | 65.9 | false |

**2.00x:** 40 launches, 0 counting; classes lost-race 40; clickRequested 40/40. spansReadyMs median 1675, worst 3877; Play's first voice (latencyMs) median 1466, worst 3593; clickLatencyMs median 879, worst 1127; foreign CPU median 60.6 %.

| label | class | play word | spansReadyMs | voiced before click | clickRequested | latency ms (cause) | clickLatencyMs | foreign CPU % | counts |
|---|---|---|---|---|---|---|---|---|---|
| cold-click-2.00-1 | lost-race | 8723 | 1932 | true | true | 1746 (play) | 941 | 60.1 | false |
| cold-click-2.00-2 | lost-race | 8723 | 1391 | true | true | 1211 (play) | null | 72 | false |
| cold-click-2.00-3 | lost-race | 8723 | 3272 | true | true | 3094 (play) | 880 | 60.6 | false |
| cold-click-2.00-4 | lost-race | 8723 | 1642 | true | true | 1466 (play) | null | 74.5 | false |
| cold-click-2.00-5 | lost-race | 8723 | 2625 | true | true | 2449 (play) | 869 | 62.5 | false |
| cold-click-2.00-6 | lost-race | 8723 | 3371 | true | true | 3182 (play) | 877 | 61.7 | false |
| cold-click-2.00-7 | lost-race | 8723 | 1193 | true | true | 1010 (play) | 899 | 52.9 | false |
| cold-click-2.00-8 | lost-race | 8723 | 1509 | true | true | 1333 (play) | null | 74.1 | false |
| cold-click-2.00-9 | lost-race | 8723 | 2111 | true | true | 1937 (play) | null | 71.8 | false |
| cold-click-2.00-10 | lost-race | 8723 | 1236 | true | true | 1055 (play) | 857 | 67.6 | false |
| cold-click-2.00-11 | lost-race | 8723 | 2004 | true | true | 1701 (play) | 892 | 56.7 | false |
| cold-click-2.00-12 | lost-race | 8723 | 1174 | true | true | 939 (play) | 893 | 45.2 | false |
| cold-click-2.00-13 | lost-race | 8723 | 937 | true | true | 744 (play) | 815 | 54 | false |
| cold-click-2.00-14 | lost-race | 8723 | 784 | true | true | 597 (play) | 972 | 64.7 | false |
| cold-click-2.00-15 | lost-race | 8723 | 1353 | true | true | 1111 (play) | 887 | 50.1 | false |
| cold-click-2.00-16 | lost-race | 8723 | 2246 | true | true | 2054 (play) | 838 | 60.4 | false |
| cold-click-2.00-17 | lost-race | 8723 | 1837 | true | true | 1532 (play) | 922 | 59 | false |
| cold-click-2.00-18 | lost-race | 8723 | 3877 | true | true | 3593 (play) | 834 | 64.2 | false |
| cold-click-2.00-19 | lost-race | 8723 | 714 | true | true | 528 (play) | 994 | 60.1 | false |
| cold-click-2.00-20 | lost-race | 8723 | 1325 | true | true | 1129 (play) | 873 | 53.5 | false |
| cold-click-2.00-21 | lost-race | 8723 | 844 | true | true | 557 (play) | 858 | 50.9 | false |
| cold-click-2.00-22 | lost-race | 8723 | 2254 | true | true | 2069 (play) | 885 | 57.6 | false |
| cold-click-2.00-23 | lost-race | 8723 | 1957 | true | true | 1763 (play) | 876 | 54.7 | false |
| cold-click-2.00-24 | lost-race | 8723 | 1710 | true | true | 1440 (play) | null | 78.4 | false |
| cold-click-2.00-25 | lost-race | 8723 | 2232 | true | true | 2038 (play) | null | 65.8 | false |
| cold-click-2.00-26 | lost-race | 8723 | 1025 | true | true | 839 (play) | 895 | 48.4 | false |
| cold-click-2.00-27 | lost-race | 8723 | 1254 | true | true | 1077 (play) | null | 71.4 | false |
| cold-click-2.00-28 | lost-race | 8723 | 3214 | true | true | 3022 (play) | null | 85.7 | false |
| cold-click-2.00-29 | lost-race | 8723 | 2177 | true | true | 1980 (play) | null | 58.8 | false |
| cold-click-2.00-30 | lost-race | 8723 | 1831 | true | true | 1654 (play) | null | 66.9 | false |
| cold-click-2.00-31 | lost-race | 8723 | 1247 | true | true | 1050 (play) | 879 | 48.7 | false |
| cold-click-2.00-32 | lost-race | 8723 | 818 | true | true | 570 (play) | 862 | 46.2 | false |
| cold-click-2.00-33 | lost-race | 8723 | 1229 | true | true | 1057 (play) | null | 73.7 | false |
| cold-click-2.00-34 | lost-race | 8723 | 1429 | true | true | 1197 (play) | 882 | 41.4 | false |
| cold-click-2.00-35 | lost-race | 8723 | 3125 | true | true | 2927 (play) | 848 | 61.7 | false |
| cold-click-2.00-36 | lost-race | 8723 | 2136 | true | true | 1954 (play) | 865 | 56.2 | false |
| cold-click-2.00-37 | lost-race | 8723 | 2411 | true | true | 2217 (play) | 850 | 59.5 | false |
| cold-click-2.00-38 | lost-race | 8723 | 1675 | true | true | 1498 (play) | null | 74.4 | false |
| cold-click-2.00-39 | lost-race | 8723 | 1474 | true | true | 1295 (play) | null | 71.3 | false |
| cold-click-2.00-40 | lost-race | 8723 | 1114 | true | true | 561 (play) | 1127 | 69 | false |

### Reference smoke 2, the re-run (reference-2)

Host: Snapdragon(R) X 12-core X1E80100 @ 3.40 GHz, 12 physical cores, d6class `reference`; Electron 42.11.18; generated 2026-10-24T04:35:02.880Z. Verdict FAIL.

Live profile (`C:\Users\estra\AppData\Roaming\blurby`): settings.json absent→absent; library.json absent→absent; blurby-data/settings.json 2e1d5245→2e1d5245; blurby-data/library.json d4b884bd→d4b884bd.

**1.00x:** 40 launches, 0 counting; classes lost-race 40; clickRequested 40/40. spansReadyMs median 1217, worst 2500; Play's first voice (latencyMs) median 983, worst 2271; clickLatencyMs median 1460, worst 1746; foreign CPU median 57.5 %.

| label | class | play word | spansReadyMs | voiced before click | clickRequested | latency ms (cause) | clickLatencyMs | foreign CPU % | counts |
|---|---|---|---|---|---|---|---|---|---|
| cold-click-1.00-1 | lost-race | 8723 | 1211 | true | true | 970 (play) | null | 57.5 | false |
| cold-click-1.00-2 | lost-race | 8723 | 1871 | true | true | 1651 (play) | null | 66.5 | false |
| cold-click-1.00-3 | lost-race | 8723 | 1253 | true | true | 1016 (play) | null | 58.3 | false |
| cold-click-1.00-4 | lost-race | 8723 | 1212 | true | true | 999 (play) | null | 57.3 | false |
| cold-click-1.00-5 | lost-race | 8723 | 2209 | true | true | 1953 (play) | null | 70.2 | false |
| cold-click-1.00-6 | lost-race | 8723 | 1883 | true | true | 1593 (play) | 1432 | 50.9 | false |
| cold-click-1.00-7 | lost-race | 8723 | 2161 | true | true | 1931 (play) | 1460 | 53.8 | false |
| cold-click-1.00-8 | lost-race | 8723 | 1174 | true | true | 944 (play) | null | - | false |
| cold-click-1.00-9 | lost-race | 8723 | 2209 | true | true | 1984 (play) | null | 74.6 | false |
| cold-click-1.00-10 | lost-race | 8723 | 1086 | true | true | 857 (play) | null | 58 | false |
| cold-click-1.00-11 | lost-race | 8723 | 1211 | true | true | 828 (play) | null | 65.8 | false |
| cold-click-1.00-12 | lost-race | 8723 | 1076 | true | true | 844 (play) | null | 61.3 | false |
| cold-click-1.00-13 | lost-race | 8723 | 2500 | true | true | 2271 (play) | null | 74.5 | false |
| cold-click-1.00-14 | lost-race | 8723 | 1274 | true | true | 1049 (play) | null | 58.7 | false |
| cold-click-1.00-15 | lost-race | 8723 | 1126 | true | true | 873 (play) | null | 55.2 | false |
| cold-click-1.00-16 | lost-race | 8723 | 1217 | true | true | 989 (play) | null | 58.3 | false |
| cold-click-1.00-17 | lost-race | 8723 | 1262 | true | true | 1045 (play) | null | 66 | false |
| cold-click-1.00-18 | lost-race | 8723 | 1180 | true | true | 951 (play) | null | 54.7 | false |
| cold-click-1.00-19 | lost-race | 8723 | 2398 | true | true | 2189 (play) | null | 72.3 | false |
| cold-click-1.00-20 | lost-race | 8723 | 1985 | true | true | 1758 (play) | null | 70.8 | false |
| cold-click-1.00-21 | lost-race | 8723 | 2104 | true | true | 1874 (play) | null | 74.5 | false |
| cold-click-1.00-22 | lost-race | 8723 | 1486 | true | true | 966 (play) | 1486 | 63.5 | false |
| cold-click-1.00-23 | lost-race | 8723 | 1148 | true | true | 919 (play) | null | 59.4 | false |
| cold-click-1.00-24 | lost-race | 8723 | 1203 | true | true | 962 (play) | null | 56.2 | false |
| cold-click-1.00-25 | lost-race | 8723 | 1173 | true | true | 945 (play) | null | 57 | false |
| cold-click-1.00-26 | lost-race | 8723 | 1134 | true | true | 839 (play) | null | 53.6 | false |
| cold-click-1.00-27 | lost-race | 8723 | 1878 | true | true | 1650 (play) | null | 67.4 | false |
| cold-click-1.00-28 | lost-race | 8723 | 1168 | true | true | 924 (play) | null | 55.6 | false |
| cold-click-1.00-29 | lost-race | 8723 | 1271 | true | true | 1033 (play) | 1746 | 57.4 | false |
| cold-click-1.00-30 | lost-race | 8723 | 1113 | true | true | 884 (play) | null | 54.9 | false |
| cold-click-1.00-31 | lost-race | 8723 | 1849 | true | true | 1607 (play) | 1404 | 52.7 | false |
| cold-click-1.00-32 | lost-race | 8723 | 1178 | true | true | 952 (play) | 1731 | 55.7 | false |
| cold-click-1.00-33 | lost-race | 8723 | 1452 | true | true | 1213 (play) | 1292 | 52.9 | false |
| cold-click-1.00-34 | lost-race | 8723 | 1071 | true | true | 838 (play) | null | 57.1 | false |
| cold-click-1.00-35 | lost-race | 8723 | 1271 | true | true | 1034 (play) | null | 58.3 | false |
| cold-click-1.00-36 | lost-race | 8723 | 1164 | true | true | 919 (play) | null | 56 | false |
| cold-click-1.00-37 | lost-race | 8723 | 1134 | true | true | 908 (play) | null | 56.5 | false |
| cold-click-1.00-38 | lost-race | 8723 | 1193 | true | true | 976 (play) | null | 59 | false |
| cold-click-1.00-39 | lost-race | 8723 | 1220 | true | true | 983 (play) | null | 53.6 | false |
| cold-click-1.00-40 | lost-race | 8723 | 1073 | true | true | 821 (play) | null | 54 | false |

**2.00x:** 40 launches, 0 counting; classes lost-race 40; clickRequested 40/40. spansReadyMs median 1194, worst 2120; Play's first voice (latencyMs) median 1010, worst 1927; clickLatencyMs median 902, worst 1280; foreign CPU median 52.7 %.

| label | class | play word | spansReadyMs | voiced before click | clickRequested | latency ms (cause) | clickLatencyMs | foreign CPU % | counts |
|---|---|---|---|---|---|---|---|---|---|
| cold-click-2.00-1 | lost-race | 8723 | 1236 | true | true | 1053 (play) | 873 | 53.7 | false |
| cold-click-2.00-2 | lost-race | 8723 | 2079 | true | true | 1828 (play) | 877 | 56.7 | false |
| cold-click-2.00-3 | lost-race | 8723 | 2120 | true | true | 1927 (play) | 852 | 55.6 | false |
| cold-click-2.00-4 | lost-race | 8723 | 801 | true | true | 535 (play) | 864 | 64.5 | false |
| cold-click-2.00-5 | lost-race | 8723 | 1415 | true | true | 1236 (play) | 943 | 48.6 | false |
| cold-click-2.00-6 | lost-race | 8723 | 1454 | true | true | 1270 (play) | 919 | - | false |
| cold-click-2.00-7 | lost-race | 8723 | 1281 | true | true | 1085 (play) | 837 | 47.2 | false |
| cold-click-2.00-8 | lost-race | 8723 | 958 | true | true | 534 (play) | 902 | 55.6 | false |
| cold-click-2.00-9 | lost-race | 8723 | 1675 | true | true | 1080 (play) | 952 | 51.3 | false |
| cold-click-2.00-10 | lost-race | 8723 | 743 | true | true | 549 (play) | 1045 | 58.8 | false |
| cold-click-2.00-11 | lost-race | 8723 | 1287 | true | true | 1118 (play) | 913 | 52.3 | false |
| cold-click-2.00-12 | lost-race | 8723 | 1311 | true | true | 1120 (play) | 887 | 38.4 | false |
| cold-click-2.00-13 | lost-race | 8723 | 1222 | true | true | 1031 (play) | 867 | 47.6 | false |
| cold-click-2.00-14 | lost-race | 8723 | 754 | true | true | 551 (play) | 887 | 61.3 | false |
| cold-click-2.00-15 | lost-race | 8723 | 733 | true | true | 542 (play) | 981 | 54.9 | false |
| cold-click-2.00-16 | lost-race | 8723 | 738 | true | true | 555 (play) | 993 | 61.4 | false |
| cold-click-2.00-17 | lost-race | 8723 | 885 | true | true | 538 (play) | 824 | 48.3 | false |
| cold-click-2.00-18 | lost-race | 8723 | 1209 | true | true | 1032 (play) | 868 | 48.3 | false |
| cold-click-2.00-19 | lost-race | 8723 | 722 | true | true | 535 (play) | 1061 | 44.5 | false |
| cold-click-2.00-20 | lost-race | 8723 | 854 | true | true | 551 (play) | 906 | 55.6 | false |
| cold-click-2.00-21 | lost-race | 8723 | 794 | true | true | 540 (play) | 919 | 55.3 | false |
| cold-click-2.00-22 | lost-race | 8723 | 839 | true | true | 569 (play) | 830 | 53.6 | false |
| cold-click-2.00-23 | lost-race | 8723 | 813 | true | true | 531 (play) | 878 | 47.8 | false |
| cold-click-2.00-24 | lost-race | 8723 | 822 | true | true | 536 (play) | 872 | 49.6 | false |
| cold-click-2.00-25 | lost-race | 8723 | 726 | true | true | 531 (play) | 1009 | 45.9 | false |
| cold-click-2.00-26 | lost-race | 8723 | 1910 | true | true | 1709 (play) | 874 | 51 | false |
| cold-click-2.00-27 | lost-race | 8723 | 725 | true | true | 540 (play) | 1013 | 50 | false |
| cold-click-2.00-28 | lost-race | 8723 | 1285 | true | true | 1021 (play) | 857 | 55.1 | false |
| cold-click-2.00-29 | lost-race | 8723 | 1194 | true | true | 1010 (play) | 862 | 49.2 | false |
| cold-click-2.00-30 | lost-race | 8723 | 1133 | true | true | 549 (play) | 920 | 54.1 | false |
| cold-click-2.00-31 | lost-race | 8723 | 874 | true | true | 544 (play) | 857 | 47.8 | false |
| cold-click-2.00-32 | lost-race | 8723 | 853 | true | true | 546 (play) | 950 | 63.9 | false |
| cold-click-2.00-33 | lost-race | 8723 | 1400 | true | true | 1211 (play) | 1198 | 58.4 | false |
| cold-click-2.00-34 | lost-race | 8723 | 1749 | true | true | 1447 (play) | 1280 | 49.4 | false |
| cold-click-2.00-35 | lost-race | 8723 | 1618 | true | true | 1426 (play) | 1034 | 43.6 | false |
| cold-click-2.00-36 | lost-race | 8723 | 811 | true | true | 551 (play) | 910 | 60.4 | false |
| cold-click-2.00-37 | lost-race | 8723 | 1386 | true | true | 1178 (play) | 877 | 52.7 | false |
| cold-click-2.00-38 | lost-race | 8723 | 1696 | true | true | 1522 (play) | 884 | 52.9 | false |
| cold-click-2.00-39 | lost-race | 8723 | 1225 | true | true | 1048 (play) | 852 | 34 | false |
| cold-click-2.00-40 | lost-race | 8723 | 717 | true | true | 538 (play) | 997 | 68.2 | false |

## Mainstream run (Done-when 6) — quiet machine, i7-1185G7

*To be filled by Blurby.Brain:* the per-launch table (label, class, play word, `spansReadyMs`, voiced-before-click, `clickRequested`, latency, `clickLatencyMs`, foreign CPU %, counts), the outcome R1–R4 per rate, and the command with its exit code. Record: `latency-e2e.mainstream-1.json`.
