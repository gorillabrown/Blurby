# Business Q2 — actual bounded deadline handoff ruling

Complete actual Brain message `exec-59343cca-b517-400d-b6f9-29327605d4a0`, read from chat `01a179e8-7a40-75c0-93f4-d3045ad99027`. Preserved verbatim. Planning only; no execution or new clock.

APPROVED: BUSINESS-Q2-DEADLINE-HANDOFF-20261102, planning only. Use the proposed on-disk handoff with unchanged outer argv [PYTHON,'-I','-B','-',mode] and stdin PIPE; no extra process/helper/argv probe.

After retaining the actual recorder Popen handle/PID, publish that mode/runId's exclusive started receipt BEFORE delivering any frozen program bytes through communicate(input=...). The Python interpreter has started, but this stdin program has not been delivered; do not claim interpreter startup itself was unobserved/nonexecuting. The inner program reads the exact mode-specific receipt, verifies its own PID, mode/runId, frozen recorder identity and closed deadline fields before spawning an operational child. Bind the exact finite receipt names/schema in the Ready/output manifest; don't invent more paths during execution.

Deadline hierarchy: outer hard deadline=min(existing150s ceiling, original phase deadline, actual returned slot deadline); outer work deadline=hard deadline minus its reserved<=2s. Inner hard deadline=min(existing120s ceiling, phase, slot, OUTER WORK deadline), with its own<=2s drain reserve INSIDE that bound. Anchor each local remaining-time calculation to monotonic time after reading the UTC deadline; never re-expand a budget or create extra time from the handoff. No positive execution time after reserves => STOP before operational spawn. Each retained inner child has its started PID receipt before communicate as proposed.

If started-receipt publication/validation fails after spawn, do NOT deliver the program. Preserve that primary failure, kill the retained known handle at most once, bounded drain/poll within remaining limits, STOP. No unconditional close/wait/context-manager finalizer. An outer timeout or absent inner terminal record leaves inner-child custody UNKNOWN/HOLD; outer return alone cannot release the slot. Both observed pipes and retained handles must satisfy the exact normal closure predicates. No descendant sweep, guessed PID, Native capability or full-tree absence claim.

This closes that technical choice. Keep the two JSON-native snapshot fixes, strict record equality, exact classifier/28 oracles/argv, current production hashes and all previous gates unchanged. Independent source review and new Ready/admission remain necessary; no current execution or clock is granted. LL178 will be prospective; old b145/fd54 and all earlier packets remain immutable.

Current merge-dependency ruling is also sent in the separate actual message: CPU is not a universal integration prerequisite; the first stack to qualify is observer→visibility→display lifetime, with fresh-main/Rule53/ARM64/per-branch merge go and same-RC gates retained. I have a narrow read-only ancestry/path-overlap investigation running in parallel to make that integration plan concrete; no merge/source window is open.

