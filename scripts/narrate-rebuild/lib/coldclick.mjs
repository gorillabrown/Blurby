// NARRATE-HARNESS-COLDCLICK-1 — what a D6 cold-click trial measured, read from engine state (the traced requests and
// the first voiced sample's cause), never from the driver's belief that it clicked (LL-166). Pure: no file access,
// no runtime guard, so the suite imports it under Node and the launcher and the attribution CLI share it.
//   attributed   the process's first voiced sample answers the click
//   lost-race    Play's first voiced sample came at or before the click went in, or the click was requested only
//                after Play's first chunk was scheduled (the engine voices the request it holds when a chunk lands)
//   undelivered  the click went in before the first voice and no click request was ever traced: a driver or
//                product defect (R1)
//   no-voice     no first voiced sample at all
//   no-click     a voice but no "clicked while playing" step (the trial errored before its click)

/**
 * @param {{ events: Array<{kind: string, cause?: string, ts?: number}>, step?: {t: number, detail?: any} | null }} input
 * @returns {"attributed" | "lost-race" | "undelivered" | "no-voice" | "no-click"}
 */
export function classifyColdClick({ events, step }) {
  const ev = Array.isArray(events) ? events : [];
  const voiced = ev.find((e) => e.kind === "narrate-first-voiced");
  if (!voiced) return "no-voice";
  if (voiced.cause === "click") return "attributed";
  if (!step || typeof step.t !== "number") return "no-click";
  if (step.detail && step.detail.voicedBeforeClick === true) return "lost-race";
  if (typeof voiced.ts === "number" && voiced.ts <= step.t) return "lost-race";
  const clickRequest = ev.find((e) => e.kind === "narrate-request" && e.cause === "click");
  return clickRequest ? "lost-race" : "undelivered";
}

/** The summary step the driver writes for a cold-click trial. */
export const CLICK_STEP = "clicked while playing";
export const clickStepOf = (summary) => (summary && Array.isArray(summary.steps) ? summary.steps.find((s) => s.name === CLICK_STEP) ?? null : null);

/** One row's facts beside its class: the play word, the clicked word, and the ms from Play's request to the click. */
export function describeColdClick({ events, step }) {
  const ev = Array.isArray(events) ? events : [];
  const play = ev.find((e) => e.kind === "narrate-request" && e.cause === "play") ?? null;
  const d = (step && step.detail) || {};
  return {
    class: classifyColdClick({ events: ev, step }),
    playWord: typeof d.playWord === "number" ? d.playWord : play ? play.word ?? null : null,
    clicked: d.clicked ?? null,
    voicedBeforeClick: typeof d.voicedBeforeClick === "boolean" ? d.voicedBeforeClick : null,
    playToClickMs: step && play && typeof play.ts === "number" ? step.t - play.ts : null,
    spansReadyMs: typeof d.spansReadyMs === "number" ? d.spansReadyMs : null,
    clickRequested: typeof d.clickRequested === "boolean" ? d.clickRequested : null,
  };
}
