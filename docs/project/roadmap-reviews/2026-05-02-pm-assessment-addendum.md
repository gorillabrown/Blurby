# Roadmap Review — Phase B Assessment ADDENDUM (2026-05-02 PM)

> Scope redirect during the Phase B → C handoff. The user expanded Desktop v2.0 to include rescoping and implementation of MOSS. This addendum revises the % remaining, pace, and verdict numbers from `2026-05-02-pm-assessment.md` to reflect the new finish line.

## What Changed

| Item | Before redirect | After redirect |
|------|----------------|----------------|
| Desktop v2.0 finish line | EINK-6B + GOALS-6B + POLISH-1 + RELEASE-1 (~10 LOE remaining) | + MOSS-NANO-13 track (rescoped per audits) → ~32 LOE remaining |
| MOSS-NANO classification | Deferred lane / sideways | **On critical path** |
| Verdict | AT RISK (improving) | AT RISK (scope expanded) |

## MOSS-NANO-13 Rescope — Audit-Mandated Additions

Both third-party audits ("proceed only with scope changes") converge on three blocking changes plus four required scope additions and two governance hygiene items. The original AUDIT_MEMO.md sketch of MOSS-NANO-13 (capture booleans across four modes, feed to existing gate) cannot produce evidence that defends a `NANO_RECOMMENDED_OPT_IN` promotion because the gate is structurally unverifiable, the integrated sidecar is a stub, and several declared invariants aren't actually enforced by the code.

### Blocking changes (must be sequenced before live capture)

1. **Real sidecar adapter** — `main/moss-nano-sidecar.js` is a stub returning `sidecar-adapter-not-configured`. Replace with a real Python subprocess adapter (spawn, stdin/stdout framing, PID tracking, zombie reaping). Wire to a productized version of `scripts/moss_nano_resident_probe.py`.
2. **Live evidence schema with provenance** — Replace the hand-authored boolean JSON with a machine-produced schema requiring quantitative observations (`nanoSegmentLatencyMs.{p50,p95,min,max}`, `nanoCache.{hits,misses,hitRate}`, `nanoPrefetch.{ready,stale,cancelled}`, `recycleObservations`) plus provenance (`runArtifactPath`, `traceEventCount`, `recordedAt`, `appCommit`, `evidenceProducerVersion`).
3. **Evidence producer** — A new tool that exercises the integrated app, records real `nano-segment` events from `mossNanoStrategy.onSegmentTrace`, and emits the sealed live-evidence JSON.

### Required scope additions

4. **Engine hardening** — Enforce `synthesizeTimeoutMs` / `commandTimeoutMs` via `Promise.race`. Fix `setContinuityScope` to bump `generationId` (so in-flight `speakChunk` requests are invalidated on scope change). Upgrade `hashText` (32-bit) — either include text length in the cache key or upgrade to a 64-bit non-cryptographic hash.
5. **Adversarial cross-section coverage** — Add test for `speakChunk` mid-flight + scope change → late synthesize result is NOT scheduled.
6. **Audit memo reframing around Qwen as default** — Update `AUDIT_MEMO.md`, `AUDIT_ORIENTATION.md`, manifest's `kokoroAvailable` field. The current memo frames Nano vs Kokoro; the actual default is Qwen, so the comparison must be Nano vs Qwen with Kokoro acknowledged as deprecated legacy.
7. **Recycle UX capture** — Per 6F evidence, ~99 in-process recycles per 1800s soak (one every ~18s, ~287ms p95 first-audio penalty). Live evidence must record user-perceptible recycle count and worst-case mid-utterance recycle gap.

### Governance hygiene

8. **Pre-register MOSS-NANO-13 in SPRINT_QUEUE.md, MOSS_DECISION_LOG.md, ROADMAP.md** — currently exists only in AUDIT_MEMO.md. The sprint cannot dispatch from a memo bullet.

## Revised Desktop v2.0 LOE

| Sprint | LOE | Status |
|--------|-----|--------|
| SK-HYG-1 | S (1) | ✅ complete |
| EINK-6A | M (3) | ✅ complete (today) |
| EINK-6B | M (3) | dispatch-ready |
| GOALS-6B | M (3) | dispatch-ready |
| **MOSS-NANO-13a** (sidecar adapter) | L (8) | **new — Phase D will spec** |
| **MOSS-NANO-13b** (engine hardening + strategy invariants) | M (3) | **new — Phase D will spec** |
| **MOSS-NANO-13c** (evidence schema + producer + gate validation) | L (8) | **new — Phase D will spec** |
| **MOSS-NANO-13d** (audit memo reframe around Qwen-default) | S (1) | **new — Phase D will spec** |
| **MOSS-NANO-13e** (live capture run + decision) | M (3) | **new — Phase D will spec** |
| POLISH-1 | M (3) | stub |
| RELEASE-1 | S (1) | stub |

- **New Desktop v2.0 total LOE:** ~37
- **LOE remaining:** ~32 (everything except SK-HYG-1 and EINK-6A)
- **% remaining:** ~86%

## Revised Pace

Pace metrics from morning still hold (~31.8 LOE/week burst, but realistic ~10–15 LOE/week sustained for design-heavy work). 32 LOE remaining at sustained pace ≈ **2–4 weeks of focused execution**. Including design loops on the evidence schema, the sidecar adapter implementation, and the live capture run with decision integration, **realistic finish: 4–6 weeks**.

## Risk Factors (revised)

1. **Sidecar adapter is real systems work.** Spawning Python subprocesses from Electron main, framing stdin/stdout, handling crashes, lifecycle on app shutdown, zombie reaping — this is the largest discrete unknown in the new conveyor. Estimate L (8) but could expand.
2. **Evidence producer needs to be designed before it can be built.** Trace event format, sealing mechanism (signature or hash chain), how to invoke the integrated app in capture mode, where to store run artifacts. Phase D should write the schema + producer interface before the producer implementation.
3. **MOSS-NANO-13c gate validation may break existing matrix simulator tests.** `tests/ttsEvalMatrixRunner.test.ts:709-767` currently relies on a hand-authored boolean JSON passing the gate. Tightening the gate will require updating that test and possibly disabling the simulator's gate path.
4. **Possible decision: PAUSE_NANO_PRODUCTIZATION.** The gate has three outcomes. If live capture surfaces a critical fault (`noUnderlineRace`, `noStalePlayback`, `explicitFallback`, `sidecarLifecycleStable`, or `segmentProgressUnderstandable` failing), MOSS is paused indefinitely. This is a real possibility — the audits flag the recycle-cadence UX and Narrate-mode segment-following as plausible blockers. Phase C should plan for this branch.
5. **POLISH-1 / RELEASE-1 still stubs.** Now sequenced after MOSS lands. Stub hardening can be deferred to Stage 3 close-out without immediate harm, since the conveyor has a clear next-up (EINK-6B → GOALS-6B → MOSS sub-sprints).

## Verdict (revised): **AT RISK**

### Reasoning

1. Execution velocity remains strong; conveyor mechanism is working.
2. Scope just expanded by ~22 LOE (more than doubled the post-EINK-6A remaining work). This is forward-direction expansion — MOSS now advances the finish line — but it's still expansion.
3. The MOSS sub-sprints carry meaningful design risk (sidecar adapter is real systems work; evidence producer is a new tool category; the gate may need to disable a simulator path).
4. **Improving** is no longer the right modifier. Verdict reverts to plain **AT RISK** until at least one MOSS sub-sprint lands and we can measure execution velocity on the new track.

### Recommendation for Phase C

1. Hold the morning's sequence for in-flight items (EINK-6B → GOALS-6B). They're spec'd and don't depend on MOSS.
2. Insert the MOSS-NANO-13 track in dependency order: 13a (adapter) → 13b (hardening) → 13c (schema + producer) → 13d (audit memo reframe, parallel-safe) → 13e (live capture + decision).
3. Sequence POLISH-1 and RELEASE-1 after MOSS-NANO-13e.
4. Phase D writes eager skeletons for 13a, 13b, and 13c (hard dependencies). 13d, 13e, POLISH-1, RELEASE-1 stay as stubs to be hardened at the next phase pause.
