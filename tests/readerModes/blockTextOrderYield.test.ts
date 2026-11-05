// @vitest-environment jsdom
// BLOCK-TEXT-ORDER-1 amendment 1 (Brain1 Job 2c, 2026-11-05), red first on d3184d0b: the certified stamp yields by time
// (WRAP_STAMP_SLICE_MS) between nodes, a text node changed during a real yield still stops stamping as dom-changed, and a
// run superseded by a later wrap or unwrap of its document stops with no report (row 5).
import { afterEach, describe, expect, it, vi } from "vitest";
import * as pageWrap from "../../src/reader/modes/page/helpers/foliateWordWrapping";
import * as focusWrap from "../../src/reader/modes/focus/helpers/foliateWordWrapping";
import * as flowWrap from "../../src/reader/modes/flow/helpers/foliateWordWrapping";
import * as narrateWrap from "../../src/reader/modes/narrate/helpers/foliateWordWrapping";

const XHTML = (body: string) =>
  `<?xml version="1.0" encoding="utf-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>t</title></head><body>${body}</body></html>`;
const parse = (body: string): Document => new DOMParser().parseFromString(XHTML(body), "application/xhtml+xml");
const spansIn = (root: ParentNode) =>
  Array.from(root.querySelectorAll("[data-word-index]")).map((el) => ({ text: el.textContent, index: Number(el.getAttribute("data-word-index")) }));
const flushMicrotasks = async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); };

/** A clock that passes the slice budget on every read, so every node ends a slice. */
function slowClock() {
  let t = 0;
  vi.spyOn(performance, "now").mockImplementation(() => (t += 100));
}

const COPIES: Array<[string, any]> = [["page", pageWrap], ["focus", focusWrap], ["flow", flowWrap], ["narrate", narrateWrap]];
const BODY = "<p>alpha beta</p><p>gamma</p><p>delta epsilon</p><p>zeta</p>";
const CANONICAL = ["alpha", "beta", "gamma", "delta", "epsilon", "zeta"];

afterEach(() => { vi.restoreAllMocks(); });

describe.each(COPIES)("BLOCK-TEXT-ORDER-1 amendment 1 yield: %s copy", (_name, W) => {
  it("(y1) the certified stamp yields: some nodes unstamped after the report and a microtask flush, all after timers", async () => {
    slowClock();
    const doc = parse(BODY);
    const reports: unknown[] = [];
    const done = W.wrapWordsInSpans(doc, 0, 100, [], CANONICAL, (r: unknown) => reports.push(r));
    expect(reports).toEqual([{ ok: true }]);
    await flushMicrotasks();
    const ps = doc.querySelectorAll("p");
    expect(spansIn(ps[ps.length - 1])).toEqual([]);
    expect(spansIn(doc.body).length).toBeLessThan(CANONICAL.length);
    expect(await done).toBe(100 + CANONICAL.length);
    expect(reports).toEqual([{ ok: true }]);
    expect(spansIn(doc.body)).toEqual(CANONICAL.map((text, i) => ({ text, index: 100 + i })));
  });

  it("(y2) a text node changed during a real yield: dom-changed second, stamping stops, no span at a stale offset", async () => {
    slowClock();
    const doc = parse(BODY);
    const reports: unknown[] = [];
    const done = W.wrapWordsInSpans(doc, 0, 100, [], CANONICAL, (r: unknown) => reports.push(r));
    await flushMicrotasks();
    const last = doc.querySelectorAll("p")[3].firstChild as Text;
    expect(last.data).toBe("zeta");
    last.data = "zeta changed";
    await done;
    expect(reports).toEqual([{ ok: true }, { ok: false, reason: "dom-changed" }]);
    expect(spansIn(doc.querySelectorAll("p")[3])).toEqual([]);
    const stamped = spansIn(doc.body);
    expect(stamped.length).toBeGreaterThan(0);
    for (const s of stamped) expect(s.text).toBe(CANONICAL[s.index - 100]);
  });

  it("(y-control) a fast clock stamps every node in one slice, before the first await settles", async () => {
    vi.spyOn(performance, "now").mockReturnValue(0);
    const doc = parse(BODY);
    const done = W.wrapWordsInSpans(doc, 0, 100, [], CANONICAL);
    await flushMicrotasks();
    expect(spansIn(doc.body)).toEqual(CANONICAL.map((text, i) => ({ text, index: 100 + i })));
    await done;
  });
  it("(y5) a superseded certified run makes no report and stamps no further node", async () => {
    slowClock();
    const doc = parse(BODY);
    const reportsA: unknown[] = [];
    const a = W.wrapWordsInSpans(doc, 0, 100, [], CANONICAL, (r: unknown) => reportsA.push(r));
    await flushMicrotasks();
    (doc.querySelectorAll("p")[3].firstChild as Text).data = "zeta changed"; // would give A a dom-changed report
    W.unwrapWordSpans(doc);
    await a;
    expect(reportsA, "only the report made before it was superseded").toEqual([{ ok: true }]);
    expect(spansIn(doc.body), "A stamped nothing after the unwrap").toEqual([]);
  });

  it("(y5) a superseded legacy run makes no report and stamps no further group", async () => {
    const n = 120; // > WRAP_BATCH_SIZE: the legacy loop yields after 50 groups
    const doc = parse(Array.from({ length: n }, (_, i) => `<p>w${i}</p>`).join(""));
    const reportsA: unknown[] = [];
    const a = W.wrapWordsInSpans(doc, 0, 0, [], undefined, (r: unknown) => reportsA.push(r));
    await flushMicrotasks();
    expect(spansIn(doc.body).length, "parked at its first yield").toBe(50);
    W.unwrapWordSpans(doc);
    await a;
    expect(reportsA, "only the report made before it was superseded").toEqual([{ ok: false, reason: "no-canonical-slice" }]);
    expect(spansIn(doc.body), "A stamped nothing after the unwrap").toEqual([]);
  });
});
