// NARRATE-REBUILD-1 P3 — main/narrate/expose-durations.js: the graph edit on a hand-built ModelProto, and
// ensureExposedModel's hash checks and atomic write (Decision #15). No real model is read here.
import { createRequire } from "module";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { exposeDurations, ensureExposedModel, sha256 } = require("../../main/narrate/expose-durations.js");

// Minimal protobuf helpers for the fixture (mirrors the writer; the test asserts structure, not bytes).
const enc = (n) => { n = BigInt(n); const o = []; do { let x = Number(n & 0x7fn); n >>= 7n; if (n) x |= 0x80; o.push(x); } while (n); return Buffer.from(o); };
const key = (fn, wt) => enc((fn << 3) | wt);
const ld = (fn, payload) => Buffer.concat([key(fn, 2), enc(payload.length), payload]);
const str = (fn, x) => ld(fn, Buffer.from(x, "utf8"));

/** ModelProto: ir_version=7 (field 1), graph (field 7) with name "g" and one node, producer_name after it (field 2). */
function tinyModel() {
  const node = ld(1, Buffer.concat([str(1, "x"), str(2, "y"), str(3, "n0"), str(4, "Relu")]));
  const graph = Buffer.concat([str(2, "g"), node]);
  return Buffer.concat([key(1, 0), enc(7), ld(7, graph), str(2, "test")]);
}

function readGraph(buf) {
  let p = 0;
  const varint = (b, q) => { let r = 0n, s = 0n, c; do { c = b[q++]; r |= BigInt(c & 0x7f) << s; s += 7n; } while (c & 0x80); return [r, q]; };
  while (p < buf.length) {
    let k; [k, p] = varint(buf, p);
    const fn = Number(k >> 3n), wt = Number(k & 7n);
    if (wt === 0) { [, p] = varint(buf, p); continue; }
    let len; [len, p] = varint(buf, p);
    if (fn === 7) return buf.subarray(p, p + Number(len));
    p += Number(len);
  }
  return null;
}

const tmpDirs = [];
afterEach(async () => { for (const d of tmpDirs.splice(0)) await fs.rm(d, { recursive: true, force: true }); });

describe("exposeDurations (Decision #4's graph edit as a function)", () => {
  it("appends an Identity node and a durations output inside the graph and leaves everything else in place", () => {
    const input = tinyModel();
    const out = exposeDurations(input, "/encoder/Clip_output_0", 1);
    expect(out.length).toBeGreaterThan(input.length);
    expect(out.subarray(0, 2)).toEqual(input.subarray(0, 2)); // ir_version untouched
    expect(out.subarray(out.length - 6).toString("utf8")).toBe(input.subarray(input.length - 6).toString("utf8")); // producer_name after the graph untouched
    const g = readGraph(out).toString("latin1");
    expect(g.startsWith(readGraph(input).toString("latin1"))).toBe(true);
    expect(g).toContain("/encoder/Clip_output_0");
    expect(g).toContain("expose_durations");
    expect(g).toContain("Identity");
    expect(g.lastIndexOf("durations")).toBeGreaterThan(g.indexOf("expose_durations")); // the output comes after the node
    // Deterministic: the same input gives the same bytes; a different element type gives different bytes.
    expect(sha256(exposeDurations(input, "/encoder/Clip_output_0", 1))).toBe(sha256(out));
    expect(sha256(exposeDurations(input, "/encoder/Clip_output_0", 10))).not.toBe(sha256(out));
  });

  it("refuses a buffer with no graph", () => {
    expect(() => exposeDurations(Buffer.concat([key(1, 0), enc(7)]), "/x", 1)).toThrow(/no graph/);
  });
});

describe("ensureExposedModel (Decision #15: derived at first use, hash-checked, atomic)", () => {
  async function fixture() {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "narrate-models-"));
    tmpDirs.push(root);
    const original = path.join(root, "onnx-community", "Kokoro-82M-v1.0-ONNX");
    await fs.mkdir(path.join(original, "onnx"), { recursive: true });
    const model = tinyModel();
    await fs.writeFile(path.join(original, "onnx", "model_q4.onnx"), model);
    for (const f of ["config.json", "tokenizer.json", "tokenizer_config.json"]) await fs.writeFile(path.join(original, f), `{"f":"${f}"}`);
    return { root, model, original };
  }
  const args = (root, extra = {}) => ({ modelsRoot: root, originalId: "onnx-community/Kokoro-82M-v1.0-ONNX", exposedId: "local/kokoro-dur", modelFile: "model_q4.onnx", tensor: "/encoder/Clip_output_0", elemType: 1, ...extra });

  it("derives the copy once, copies the side files, and is idempotent", async () => {
    const { root, model } = await fixture();
    const expected = sha256(exposeDurations(model, "/encoder/Clip_output_0", 1));
    const first = await ensureExposedModel(args(root, { originalSha256: sha256(model), exposedSha256: expected }));
    expect(first).toMatchObject({ created: true, sha256: expected });
    expect(await fs.readFile(path.join(root, "local", "kokoro-dur", "config.json"), "utf8")).toBe('{"f":"config.json"}');
    expect(sha256(await fs.readFile(first.path))).toBe(expected);
    expect(await fs.readdir(path.dirname(first.path))).toEqual(["model_q4.onnx"]); // no temp file left behind
    const second = await ensureExposedModel(args(root, { exposedSha256: expected }));
    expect(second).toMatchObject({ created: false, sha256: expected, path: first.path });
    // The original is untouched.
    expect(sha256(await fs.readFile(path.join(root, "onnx-community", "Kokoro-82M-v1.0-ONNX", "onnx", "model_q4.onnx")))).toBe(sha256(model));
  });

  it("writes nothing when the pinned model's hash is not the recorded one", async () => {
    const { root } = await fixture();
    await expect(ensureExposedModel(args(root, { originalSha256: "00".repeat(32) }))).rejects.toThrow(/expected 0000/);
    expect(await fs.stat(path.join(root, "local", "kokoro-dur", "onnx")).catch(() => null)).toBeNull();
  });

  it("writes nothing when the derived copy's hash is not the recorded one", async () => {
    const { root } = await fixture();
    await expect(ensureExposedModel(args(root, { exposedSha256: "11".repeat(32) }))).rejects.toThrow(/nothing written/);
    expect(await fs.stat(path.join(root, "local", "kokoro-dur", "onnx")).catch(() => null)).toBeNull();
  });

  it("refuses an existing copy whose hash is not the recorded one", async () => {
    const { root } = await fixture();
    await fs.mkdir(path.join(root, "local", "kokoro-dur", "onnx"), { recursive: true });
    await fs.writeFile(path.join(root, "local", "kokoro-dur", "onnx", "model_q4.onnx"), "stale");
    await expect(ensureExposedModel(args(root, { exposedSha256: "22".repeat(32) }))).rejects.toThrow(/has sha256/);
  });
});
