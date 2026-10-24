// @vitest-environment jsdom
// NARRATE-HARNESS-COLDCLICK-1 — the cold-click trial's attribution (c1), the driver's span helpers (c2) and the
// unchanged clickWord control (c3). Module paths are held in variables and imported inside each test, so the file
// collects on a base without the classifier and fails there by assertion (standing rule 43).
import { describe, it, expect, beforeAll, afterEach } from "vitest";

const CLASSIFIER = "../../scripts/narrate-rebuild/lib/coldclick.mjs";
const TRIAL = "../../main/narrate/trial.js";

type Ev = { kind: string; cause?: string; ts: number; word?: number };
const step = (t: number) => ({ t, name: "clicked while playing", detail: { clicked: 8783, voicedBeforeClick: false } });

async function classifier(): Promise<((x: { events: Ev[]; step: unknown }) => string) | null> {
  const mod = await import(/* @vite-ignore */ CLASSIFIER).catch(() => null);
  return mod && typeof mod.classifyColdClick === "function" ? mod.classifyColdClick : null;
}

describe("c1: classifyColdClick", () => {
  it("attributed: the click is requested and the first voiced sample answers it", async () => {
    const classify = await classifier();
    expect(classify).toBeTypeOf("function");
    const events: Ev[] = [
      { kind: "narrate-request", cause: "play", ts: 400, word: 8723 },
      { kind: "narrate-request", cause: "click", ts: 1000, word: 8783 },
      { kind: "narrate-first-voiced", cause: "click", ts: 1900, word: 8783 },
    ];
    expect(classify!({ events, step: step(990) })).toBe("attributed");
  });

  it("lost-race: Play's first voiced sample came before the click", async () => {
    const classify = await classifier();
    expect(classify).toBeTypeOf("function");
    const events: Ev[] = [
      { kind: "narrate-request", cause: "play", ts: 400, word: 8723 },
      { kind: "narrate-first-voiced", cause: "play", ts: 900, word: 8723 },
    ];
    expect(classify!({ events, step: step(1000) })).toBe("lost-race");
  });

  it("undelivered: the click went in before the first voice and was never requested", async () => {
    const classify = await classifier();
    expect(classify).toBeTypeOf("function");
    const events: Ev[] = [
      { kind: "narrate-request", cause: "play", ts: 400, word: 8723 },
      { kind: "narrate-first-voiced", cause: "play", ts: 1800, word: 8723 },
    ];
    expect(classify!({ events, step: step(1000) })).toBe("undelivered");
  });

  it("no-voice: no first voiced sample", async () => {
    const classify = await classifier();
    expect(classify).toBeTypeOf("function");
    const events: Ev[] = [
      { kind: "narrate-request", cause: "play", ts: 400, word: 8723 },
      { kind: "narrate-request", cause: "click", ts: 1000, word: 8783 },
    ];
    expect(classify!({ events, step: step(990) })).toBe("no-voice");
  });
});

// One section document with word spans 8723–8800 behind a foliate-view's renderer.getContents(), as the app's
// FoliateView exposes it (data-word-index is the global book index).
type TrialApi = {
  clickWord: (offset: number) => number | null;
  hasWord?: (w: number) => boolean;
  clickWordAt?: (target: number) => number | null;
};

describe("c2/c3: the driver's helpers against a loaded section", () => {
  let sectionDoc: Document;

  beforeAll(async () => {
    const { HELPERS } = await import(/* @vite-ignore */ TRIAL);
    sectionDoc = document.implementation.createHTMLDocument("section");
    for (let w = 8723; w <= 8800; w++) {
      const span = sectionDoc.createElement("span");
      span.setAttribute("data-word-index", String(w));
      span.textContent = `w${w} `;
      sectionDoc.body.appendChild(span);
    }
    const fv = document.createElement("foliate-view") as HTMLElement & { renderer?: unknown };
    fv.renderer = { getContents: () => [{ doc: sectionDoc, index: 3 }] };
    document.body.appendChild(fv);
    // jsdom has no layout: scrollIntoView is a no-op here.
    (Element.prototype as unknown as { scrollIntoView: () => void }).scrollIntoView = () => {};
    (0, eval)(HELPERS);
  });

  const api = () => (window as unknown as { __narrateTrial: TrialApi }).__narrateTrial;
  const listeners: Array<() => void> = [];
  afterEach(() => { while (listeners.length) listeners.pop()!(); });
  const countClicks = (w: number) => {
    const el = sectionDoc.querySelector(`[data-word-index="${w}"]`)!;
    const hits = { n: 0 };
    const on = () => { hits.n += 1; };
    el.addEventListener("click", on);
    listeners.push(() => el.removeEventListener("click", on));
    return hits;
  };

  it("c2: hasWord reports whether a loaded document holds the word", () => {
    expect(typeof api().hasWord).toBe("function");
    expect(api().hasWord!(8723)).toBe(true);
    expect(api().hasWord!(9000)).toBe(false);
  });

  it("c2: clickWordAt clicks the word itself when it is loaded", () => {
    expect(typeof api().clickWordAt).toBe("function");
    const hits = countClicks(8783);
    expect(api().clickWordAt!(8783)).toBe(8783);
    expect(hits.n).toBe(1);
  });

  it("c2: clickWordAt past the document's end clicks its highest word", () => {
    expect(typeof api().clickWordAt).toBe("function");
    const hits = countClicks(8800);
    expect(api().clickWordAt!(8900)).toBe(8800);
    expect(hits.n).toBe(1);
  });

  it("c3 (control): clickWord(60) still clicks the 61st span", () => {
    const hits = countClicks(8783);
    expect(api().clickWord(60)).toBe(8783);
    expect(hits.n).toBe(1);
  });
});
