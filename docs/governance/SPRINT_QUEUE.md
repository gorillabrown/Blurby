BLURBY

# Sprint Queue

**Purpose:** Conveyor belt of ready-to-dispatch sprint specs. Pull the top pointer, read the referenced Roadmap section, then execute from the full spec. After completion, remove it, log it, backfill to ≥3.

**Queue rules:** FIFO — top sprint executes next. ≥3 depth maintained at all times. If depth drops below 3 after completion: Cluade Code investigates bottlenecks and issues; Cowork brainstorms and drafts specs (if next work is known) or stops to discuss (if not); Claude CLI performs work/receives dispatches. 

No dispatch fires until ≥3 pointers exist with full specs in the Roadmap, and no code-changing pointer is dispatch-ready unless its referenced spec names explicit edit-site coordinates.

**How to use:**
1. Pull the top pointer block
2. Open the Roadmap section listed on the `Read:` line — that's the full dispatch spec
3. Confirm the full spec includes explicit edit-site coordinates for every planned code change: file, function/method, approximate live anchor, and exact modification type. If any code-changing step lacks coordinates, stop and harden the spec before dispatch.
4. Execute from the Roadmap spec under `gog-lead` orchestration with the named sub-agent roster
5. After completion: doc-keeper marks the Roadmap section COMPLETED, removes the pointer, logs to completed table
6. Cowork prints the next pointer and checks queue depth


---

```
SPRINT QUEUE STATUS:
Queue depth: 4 — GREEN
Next sprint: EXT-ENR-A (Resilient Extension Connection)
Health: GREEN — HOTFIX-14 complete (v1.38.2). EXT-ENR-A investigation done, needs spec hardening.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | CLI Ready? | Blocker |
|---|-----------|---------|--------|------|-----------|---------|
| 1 | EXT-ENR-A | v1.39.0 | `sprint/ext-enr-a-resilient` | Quick | **INVESTIGATION DONE** | Cowork has full analysis (ws-server.js + service-worker.js traced). Needs spec hardening with edit-site coordinates. |
| 2 | FLOW-INF-A | v1.40.0 | `sprint/flow-inf-a-reading-zone` | Full | **NO** | Cowork: reading zone overlay prototyping (shadow DOM feasibility). SELECTION-1 anchor contract now available. |
| 3 | FLOW-INF-B | v1.41.0 | `sprint/flow-inf-b-timer-cursor` | Full | **NO** | Blocked on FLOW-INF-A results |
| 4 | EXT-ENR-B | v1.42.0 | `sprint/ext-enr-b-auto-discovery` | Full | **NO** | Blocked on EXT-ENR-A results |

**Dispatch status:** Queue depth 4 — GREEN. **EXT-ENR-A is next.** Full investigation done — convert analysis to edit-site coordinates before dispatch.

**Next Cowork actions:**
1. Write full EXT-ENR-A spec (investigation already done — convert analysis to edit-site coordinates)
2. FLOW-INF-A prototype (shadow DOM overlay feasibility)
3. Backfill queue to ≥3 if any depth drop occurs

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
| HOTFIX-13 | **Dissolved.** BUG-151/152/153 absorbed into SELECTION-1. BUG-154 parked (likely not a bug — needs live verification). |
| EINK-6A | Parked. Fully spec'd in ROADMAP.md. Re-queue when e-ink becomes priority. |
| EINK-6B | Parked. Fully spec'd in ROADMAP.md. Depends on EINK-6A. |
| GOALS-6B | Parked. Fully spec'd in ROADMAP.md. Independent — can run anytime. |
| EXT-ENR-C | Documented but deferred. In-browser reader is lower priority than connection fixes. |
| APK-0 | Roadmapped, not yet execution-ready. Needs detailed WHERE/Tasks/SUCCESS CRITERIA. |
| APK-1–4 | Roadmapped, not yet execution-ready. Depend on APK-0. |

---

## Completed Sprints (Recent History)

| Sprint ID | Completed | Outcome | Key Result |
|-----------|-----------|---------|------------|
| HOTFIX-14 | 2026-04-06 | PASS | URL extraction fetchWithBrowser fallback (BUG-155), authenticated-only client count + 5s polling + 15s heartbeat (BUG-156). 12 new tests (1,575 total across 88 files). v1.38.2. |
| SELECTION-1 | 2026-04-06 | PASS | Word anchor contract: soft/hard/resume tiers, mode start resolution chain. BUG-151/152/153 resolved. 17 new tests (1,563 total). v1.38.0. |
| HOTFIX-12 | 2026-04-05 | PASS | Bug report triage fixes. BUG-146/147/148/149/150 resolved. 17 new tests (1,546 total). v1.37.1. |
| TTS-7R | 2026-04-05 | PASS | Calm narration band & cursor ownership fix. BUG-145a/b/c resolved. 25 new tests. v1.37.0. |
| TTS-7Q | 2026-04-05 | PASS* | True glide & audio-aligned narration cursor. BUG-143/144 resolved. 25 new tests. v1.36.1. |
| TTS-7P | 2026-04-05 | PASS | Rolling pause-boundary planner. BUG-140 resolved. 33 new tests. v1.36.0. |
| EXT-5C | 2026-04-05 | PASS | Rich article capture & hero image cards. BUG-141/142 reso