# NARRATE-REBUILD-1 P5 — the producer-worker freeze fix, verified in the app (Decision #19 step 3)

Three in-app launches of ≥ 3 minutes each with `NARRATE_PRODUCER_LOG=1` (the env-gated worker stall monitor: every event-loop
stall over 250 ms per producer worker, with the part spent inside an onnxruntime generation run — which blocks the worker's
loop for its whole duration by design — and the rest, the free part; a freeze is a free stall). Decision #19's criterion:
no producer-worker stall > 1 s that is not generation, across the three launches. The traces' D3 analyses are the
`recorded-output.freeze-launch-N.json` files beside this record; the full logs and CPU samples are under
`C:\Projects\Blurby-artifacts\narrate-rebuild-1\p5-freeze\launch-N\` (launch 1's log was copied there from the main
`p5\logs\` folder; its trace was erased by the start of a launch that died with session S2, so its analysis file is its record).

Cause (Aristotle, S2 time-log row 51; reproduction in the S2 scratchpad `freeze/`): transformers.js 3.8.1's local-file path
(`FileResponse`) streams the whole model file into a `ReadableStream` nothing reads, then reads it again — 4,658 chunks of
64 KB, 291 MB of garbage per producer worker; freeing it in Electron stalled both workers 4–16 s about 30 s after load
(base reproduction 3/3 stalls; with the custom cache 0/2 over 80 s and 180 s). Fix: `main/narrate/local-file-cache.js`, a
transformers.js custom cache that serves an existing local file by one `fs.promises.readFile` and misses on URLs, missing
paths and directories, so local-only loading and its errors are unchanged.

| launch | start | rate | minutes | exit | D3 verdict | CPU % foreign / app / host | stall lines | max total ms | max gen ms | max free ms | free > 1 s | main max ms | ext MB first → min |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| launch 1 | 23:13:37Z | 1.00 | 3.55 | 0 | PASS | 17.3 / 11 / 28.3 | 32 | 3495 | 3500 | **622** | **0** | 299 | 315 → 21 |
| launch 2 | 23:53:23Z | 2.00 | 3.55 | 0 | FAIL | 15.1 / 11.6 / 26.7 | 57 | 1838 | 1830 | **562** | **0** | 328 | 314 → 21 |
| launch 3 | 23:57:04Z | 1.00 | 3.53 | 0 | FAIL | 17.5 / 9.9 / 27.5 | 32 | 3210 | 3238 | **685** | **0** | 0 | 315 → 21 |

### launch 1 — 1.00x, log `C:/Projects/Blurby-artifacts/narrate-rebuild-1/p5-freeze/launch-1/logs/session-1-00.log`

Worker stall lines over 1,000 ms (every one, with its generation / free split; a free part over 1,000 ms would be a freeze):

| at (UTC) | worker | total ms | gen ms | free ms | memory |
|---|---|---|---|---|---|
| 23:13:44.516Z | w1 | 1908 | 1953 | 0 | heap 21/28 ext 21 ab 19 rss 1670 |
| 23:13:46.533Z | w1 | 1966 | 2007 | 0 | heap 24/28 ext 21 ab 19 rss 1713 |
| 23:13:53.026Z | w1 | 3495 | 3500 | 0 | heap 26/29 ext 21 ab 20 rss 1768 |
| 23:14:03.854Z | w1 | 3374 | 3379 | 0 | heap 20/23 ext 21 ab 21 rss 1770 |
| 23:14:17.739Z | w1 | 3090 | 3112 | 0 | heap 18/19 ext 21 ab 18 rss 1136 |
| 23:14:28.060Z | w1 | 3253 | 3269 | 0 | heap 19/20 ext 21 ab 19 rss 1134 |
| 23:14:38.057Z | w1 | 2060 | 2081 | 0 | heap 19/20 ext 21 ab 20 rss 1134 |
| 23:14:45.976Z | w1 | 2934 | 2983 | 0 | heap 19/21 ext 21 ab 21 rss 1135 |
| 23:14:55.629Z | w1 | 2336 | 2336 | 0 | heap 19/21 ext 21 ab 22 rss 1139 |
| 23:15:02.727Z | w1 | 1483 | 1487 | 0 | heap 19/22 ext 21 ab 18 rss 1140 |
| 23:15:07.779Z | w1 | 1567 | 1556 | 11 | heap 19/21 ext 21 ab 18 rss 1142 |
| 23:15:13.873Z | w1 | 2356 | 2381 | 0 | heap 19/22 ext 21 ab 19 rss 1142 |
| 23:15:22.682Z | w1 | 2948 | 2985 | 0 | heap 19/21 ext 21 ab 20 rss 1143 |
| 23:15:32.267Z | w1 | 2713 | 2742 | 0 | heap 19/20 ext 21 ab 18 rss 1141 |
| 23:15:41.357Z | w1 | 2943 | 2930 | 13 | heap 19/21 ext 21 ab 19 rss 1144 |
| 23:15:51.180Z | w1 | 3016 | 3064 | 0 | heap 19/21 ext 21 ab 20 rss 1143 |
| 23:16:01.709Z | w1 | 3159 | 3201 | 0 | heap 20/21 ext 21 ab 21 rss 1147 |
| 23:16:11.825Z | w1 | 3055 | 3083 | 0 | heap 19/22 ext 21 ab 18 rss 1156 |
| 23:16:21.999Z | w1 | 2790 | 2806 | 0 | heap 19/22 ext 21 ab 19 rss 1158 |
| 23:16:31.437Z | w1 | 2697 | 2729 | 0 | heap 19/21 ext 21 ab 20 rss 1159 |
| 23:16:40.159Z | w1 | 2171 | 2185 | 0 | heap 19/21 ext 21 ab 21 rss 1159 |
| 23:16:48.264Z | w1 | 3042 | 3038 | 4 | heap 19/21 ext 21 ab 18 rss 1157 |
| 23:16:57.901Z | w1 | 2201 | 2211 | 0 | heap 20/21 ext 21 ab 19 rss 1156 |
| 23:17:05.626Z | w1 | 2494 | 2484 | 10 | heap 20/21 ext 21 ab 20 rss 1159 |
| 23:17:14.623Z | w1 | 3078 | 3116 | 0 | heap 19/22 ext 21 ab 21 rss 1160 |

Free stalls over 1,000 ms: 0

### launch 2 — 2.00x, log `C:/Projects/Blurby-artifacts/narrate-rebuild-1/p5-freeze/launch-2/logs/session-2-00.log`

Worker stall lines over 1,000 ms (every one, with its generation / free split; a free part over 1,000 ms would be a freeze):

| at (UTC) | worker | total ms | gen ms | free ms | memory |
|---|---|---|---|---|---|
| 23:53:29.815Z | w1 | 1175 | 1221 | 0 | heap 21/31 ext 21 ab 18 rss 1625 |
| 23:53:30.873Z | w1 | 1008 | 1051 | 0 | heap 23/31 ext 21 ab 19 rss 1634 |
| 23:53:32.560Z | w1 | 1636 | 1679 | 0 | heap 26/32 ext 21 ab 19 rss 1681 |
| 23:53:37.363Z | w1 | 1763 | 1799 | 0 | heap 28/33 ext 21 ab 20 rss 1687 |
| 23:53:44.913Z | w1 | 1534 | 1579 | 0 | heap 23/34 ext 21 ab 20 rss 1693 |
| 23:53:50.441Z | w1 | 1735 | 1743 | 0 | heap 25/35 ext 21 ab 21 rss 1692 |
| 23:53:55.774Z | w1 | 1118 | 1125 | 0 | heap 26/37 ext 21 ab 18 rss 1367 |
| 23:54:00.057Z | w1 | 1610 | 1608 | 2 | heap 18/19 ext 21 ab 18 rss 1049 |
| 23:54:05.249Z | w1 | 1239 | 1251 | 0 | heap 18/20 ext 21 ab 18 rss 1054 |
| 23:54:15.276Z | w1 | 1269 | 1293 | 0 | heap 19/21 ext 21 ab 19 rss 1053 |
| 23:54:19.903Z | w1 | 1505 | 1522 | 0 | heap 19/20 ext 21 ab 20 rss 1054 |
| 23:54:25.066Z | w1 | 1352 | 1386 | 0 | heap 18/20 ext 21 ab 17 rss 1050 |
| 23:54:29.994Z | w1 | 1557 | 1561 | 0 | heap 18/21 ext 21 ab 18 rss 1052 |
| 23:54:35.384Z | w1 | 1605 | 1651 | 0 | heap 19/20 ext 21 ab 18 rss 1053 |
| 23:54:41.020Z | w1 | 1609 | 1606 | 3 | heap 19/20 ext 21 ab 19 rss 1055 |
| 23:54:46.612Z | w1 | 1568 | 1597 | 0 | heap 18/21 ext 21 ab 17 rss 1052 |
| 23:54:52.104Z | w1 | 1526 | 1539 | 0 | heap 18/21 ext 21 ab 18 rss 1052 |
| 23:54:57.275Z | w1 | 1433 | 1461 | 0 | heap 18/21 ext 21 ab 18 rss 1053 |
| 23:55:01.778Z | w1 | 1146 | 1148 | 0 | heap 19/20 ext 21 ab 19 rss 1052 |
| 23:55:06.109Z | w1 | 1717 | 1709 | 8 | heap 19/20 ext 21 ab 17 rss 1053 |
| 23:55:11.459Z | w1 | 1180 | 1229 | 0 | heap 19/21 ext 21 ab 18 rss 1051 |
| 23:55:15.732Z | w1 | 1351 | 1346 | 5 | heap 19/20 ext 21 ab 18 rss 1051 |
| 23:55:20.592Z | w1 | 1632 | 1640 | 0 | heap 19/22 ext 21 ab 19 rss 1053 |
| 23:55:26.131Z | w1 | 1553 | 1549 | 4 | heap 19/21 ext 21 ab 19 rss 1054 |
| 23:55:31.464Z | w1 | 1529 | 1550 | 0 | heap 19/21 ext 21 ab 17 rss 1052 |
| 23:55:36.760Z | w1 | 1500 | 1511 | 0 | heap 19/20 ext 21 ab 18 rss 1055 |
| 23:55:44.306Z | w1 | 1623 | 1640 | 0 | heap 19/21 ext 21 ab 19 rss 1056 |
| 23:55:49.941Z | w1 | 1497 | 1517 | 0 | heap 20/22 ext 21 ab 17 rss 1057 |
| 23:55:54.924Z | w1 | 1376 | 1374 | 2 | heap 20/21 ext 21 ab 18 rss 1059 |
| 23:55:59.521Z | w1 | 1489 | 1524 | 0 | heap 20/22 ext 21 ab 18 rss 1057 |
| 23:56:05.517Z | w1 | 1745 | 1734 | 11 | heap 20/21 ext 21 ab 19 rss 1058 |
| 23:56:10.834Z | w1 | 1141 | 1187 | 0 | heap 20/21 ext 21 ab 17 rss 1057 |
| 23:56:15.412Z | w1 | 1838 | 1830 | 8 | heap 20/21 ext 21 ab 18 rss 1058 |
| 23:56:21.035Z | w1 | 1150 | 1151 | 0 | heap 20/21 ext 21 ab 18 rss 1057 |
| 23:56:25.291Z | w1 | 1569 | 1592 | 0 | heap 20/22 ext 21 ab 19 rss 1057 |
| 23:56:30.208Z | w1 | 1048 | 1078 | 0 | heap 20/22 ext 21 ab 19 rss 1058 |
| 23:56:34.066Z | w1 | 1314 | 1353 | 0 | heap 20/22 ext 21 ab 17 rss 1056 |
| 23:56:39.028Z | w1 | 1793 | 1829 | 0 | heap 21/22 ext 21 ab 18 rss 1057 |
| 23:56:44.685Z | w1 | 1277 | 1271 | 6 | heap 21/23 ext 21 ab 18 rss 1060 |
| 23:56:51.973Z | w1 | 1283 | 1292 | 0 | heap 20/22 ext 21 ab 19 rss 1070 |
| 23:57:02.911Z | w1 | 1644 | 1664 | 0 | heap 20/21 ext 21 ab 18 rss 1061 |

Free stalls over 1,000 ms: 0

### launch 3 — 1.00x, log `C:/Projects/Blurby-artifacts/narrate-rebuild-1/p5-freeze/launch-3/logs/session-1-00.log`

Worker stall lines over 1,000 ms (every one, with its generation / free split; a free part over 1,000 ms would be a freeze):

| at (UTC) | worker | total ms | gen ms | free ms | memory |
|---|---|---|---|---|---|
| 23:57:11.104Z | w1 | 1823 | 1866 | 0 | heap 22/28 ext 21 ab 19 rss 1672 |
| 23:57:13.054Z | w1 | 1900 | 1937 | 0 | heap 24/28 ext 21 ab 19 rss 1713 |
| 23:57:18.706Z | w1 | 3210 | 3238 | 0 | heap 26/29 ext 21 ab 20 rss 1768 |
| 23:57:29.535Z | w1 | 3139 | 3133 | 6 | heap 22/32 ext 21 ab 21 rss 1771 |
| 23:57:43.409Z | w1 | 2866 | 2856 | 10 | heap 18/19 ext 21 ab 18 rss 1137 |
| 23:57:53.852Z | w1 | 3089 | 3136 | 0 | heap 19/20 ext 21 ab 19 rss 1136 |
| 23:58:03.913Z | w1 | 2013 | 2010 | 3 | heap 18/20 ext 21 ab 20 rss 1137 |
| 23:58:11.814Z | w1 | 2860 | 2876 | 0 | heap 19/21 ext 21 ab 21 rss 1137 |
| 23:58:21.491Z | w1 | 2271 | 2268 | 3 | heap 19/21 ext 21 ab 18 rss 1138 |
| 23:58:28.696Z | w1 | 1502 | 1529 | 0 | heap 19/20 ext 21 ab 18 rss 1141 |
| 23:58:33.775Z | w1 | 1589 | 1625 | 0 | heap 19/21 ext 21 ab 19 rss 1143 |
| 23:58:39.824Z | w1 | 2360 | 2399 | 0 | heap 19/21 ext 21 ab 20 rss 1142 |
| 23:58:48.514Z | w1 | 2872 | 2882 | 0 | heap 19/21 ext 21 ab 18 rss 1144 |
| 23:58:58.018Z | w1 | 2556 | 2566 | 0 | heap 19/22 ext 21 ab 19 rss 1143 |
| 23:59:07.132Z | w1 | 2747 | 2774 | 0 | heap 19/21 ext 21 ab 20 rss 1143 |
| 23:59:16.941Z | w1 | 2867 | 2884 | 0 | heap 19/21 ext 21 ab 21 rss 1145 |
| 23:59:27.294Z | w1 | 2839 | 2860 | 0 | heap 20/21 ext 21 ab 18 rss 1146 |
| 23:59:37.582Z | w1 | 2872 | 2878 | 0 | heap 20/21 ext 21 ab 19 rss 1158 |
| 23:59:47.771Z | w1 | 2608 | 2647 | 0 | heap 20/22 ext 21 ab 20 rss 1160 |
| 23:59:57.274Z | w1 | 2643 | 2640 | 3 | heap 20/22 ext 21 ab 18 rss 1159 |
| 00:00:05.984Z | w1 | 2065 | 2080 | 0 | heap 20/21 ext 21 ab 19 rss 1159 |
| 00:00:14.084Z | w1 | 2937 | 2926 | 11 | heap 19/21 ext 21 ab 20 rss 1158 |
| 00:00:23.711Z | w1 | 2080 | 2109 | 0 | heap 20/21 ext 21 ab 20 rss 1158 |
| 00:00:31.446Z | w1 | 2350 | 2374 | 0 | heap 20/21 ext 21 ab 21 rss 1161 |
| 00:00:40.363Z | w1 | 2937 | 2928 | 9 | heap 20/22 ext 21 ab 18 rss 1160 |

Free stalls over 1,000 ms: 0
