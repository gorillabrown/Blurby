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
Queue depth: 6 — GREEN
Next sprint: HOTFIX-13 (reader core fixes — narration band, focus mode, word selection, flow layout)
Health: GREEN — Two hotfixes then three priority tracks queued.
```

---

## Queue

| # | Sprint ID | Version | Branch | Tier | CLI Ready? | Blocker |
|---|-----------|---------|--------|------|-----------|---------|
| 1 | HOTFIX-13 | v1.37.2 | `hotfix/13-reader-core` | Quick | **PARTIAL** | BUG-151/152 CLI-ready. BUG-153 needs design spec. BUG-154 needs live verification. |
| 2 | HOTFIX-14 | v1.37.3 | `hotfix/14-import-connection` | Quick | **PARTIAL** | BUG-157/158 CLI-ready. BUG-155/156 need Cowork investigation. |
| 3 | FLOW-INF-A | v1.38.0 | `sprint/flow-inf-a-reading-zone` | Full | **NO** | Cowork: reading zone overlay prototyping (shadow DOM feasibility) |
| 4 | EXT-ENR-A | v1.39.0 | `sprint/ext-enr-a-resilient` | Quick | **NO** | Cowork: locate extension source, trace client lifecycle in ws-server |
| 5 | FLOW-INF-B | v1.40.0 | `sprint/flow-inf-b-timer-cursor` | Full | **NO** | Blocked on FLOW-INF-A results |
| 6 | EXT-ENR-B | v1.41.0 | `sprint/ext-enr-b-auto-discovery` | Full | **NO** | Blocked on EXT-ENR-A results |

**Dispatch status:** Queue depth 6 — GREEN. HOTFIX-13 is partially CLI-ready (BUG-151 + BUG-152 have confirmed root causes and exact fix specs). Can dispatch as a 2-bug fix now, or wait for BUG-153 design spec to bundle all four.

**Next Cowork action:** Design spec for BUG-153 (word selection contract), then live verification for BUG-154.

---

## Deferred Sprints

| Sprint ID | Disposition |
|-----------|-------------|
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
| HOTFIX-12 | 2026-04-05 | PASS | Bug report triage fixes. BUG-146/147/148/149/150 resolved. 17 new tests (1,546 total). v1.37.1. |
| TTS-7R | 2026-04-05 | PASS | Calm narration band & cursor ownership fix. BUG-145a/b/c resolved. 25 new tests. v1.37.0. |
| TTS-7Q | 2026-04-05 | PASS* | True glide & audio-aligned narration cursor. BUG-143/144 resolved. 25 new tests. v1.36.1. |
| TTS-7P | 2026-04-05 | PASS | Rolling pause-boundary planner. BUG-140 resolved. 33 new tests. v1.36.0. |
| EXT-5C | 2026-04-05 | PASS | Rich article capture & hero image cards. BUG-141/142 resolved. 24 new tests. v1.35.0. |
