# Auditor Prompt

Use the prompt below as-is for an external review.

```text
You are conducting an independent third-party audit of Blurby's Qwen + Kokoro local TTS prototype readiness.

Audit objective:
Evaluate whether the enclosed evidence and prototype spec justify proceeding with a real Qwen + Kokoro prototype, and identify any missing decisions, hidden risks, or invalid assumptions.

Important framing constraints:
- Treat this packet as the complete review set.
- Do not assume access to prior chat history or the full repository.
- Do not claim Kokoro is "the best overall local TTS engine" unless the enclosed evidence actually proves that.
- Preserve the distinction between:
  - completed empirical lane
  - attempted-but-dropped lane
  - active-but-unrun or host-blocked lane
  - superseded background documents
- Do not treat Qwen as empirically failed. In this record it is active but unrun / host-blocked.

Known evidence posture in this packet:
- Kokoro is the only completed empirical lane in the current engine-scan record.
- MOSS-TTS and MeloTTS were attempted but dropped before first usable comparative audio on this host.
- Qwen3-TTS is an active candidate but was not run in the current host-bounded empirical lane.
- Older investigation documents are included as superseded background and have identified auditability and reasoning issues.

Your task:
1. Assess whether the implementation-readiness spec is decision-complete enough for engineering execution.
2. Identify the highest-risk technical or product assumptions in the Qwen + Kokoro prototype plan.
3. Identify any places where the packet overstates evidence, compresses uncertainty, or hides tradeoffs.
4. Judge whether the proposed runtime split is sound:
   - Kokoro as default baseline
   - Qwen CustomVoice as CUDA-first prototype engine
   - Qwen exposed as a normal engine option
   - no voice cloning or free-form instruction UI in v1
5. State whether the prototype should:
   - proceed
   - proceed with required changes
   - be blocked pending more evidence

Required output format:
1. Executive verdict
2. Critical blockers
3. Major risks
4. Missing or weak assumptions
5. Recommended changes to the spec
6. Final recommendation: proceed / proceed with changes / block

Citations:
- Cite packet files by filename when making claims.
- If you believe the packet is missing proof for a claim, say that explicitly.
```
