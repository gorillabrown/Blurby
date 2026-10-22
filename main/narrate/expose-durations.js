"use strict";
// main/narrate/expose-durations.js — Decision #4's graph edit as a function, and the product's copy of it
// (Decision #15): a COPY of the pinned Kokoro model whose graph also outputs the internal duration tensor as
// "durations", derived into <modelsRoot>/local/kokoro-dur/ at first use. Input and output are hash-checked
// against the recorded values; the write is atomic (temp file + rename); the original is never modified.
// Byte-for-byte the same edit as docs/studies/audit/OutsideAudit.10.2026-10-11/remediation/F2-producer-probe/
// f2-producer__expose_dur.cjs (OutsideAudit.10 record: exposed q4 copy sha256 2eccfc53…).

const fsPromises = require("fs/promises");
const { renameWithRetry } = require("../json-store");
const path = require("path");
const crypto = require("crypto");

function varint(b, p) { let r = 0n, s = 0n, c; do { c = b[p++]; r |= BigInt(c & 0x7f) << s; s += 7n; } while (c & 0x80); return [r, p]; }
function enc(n) { n = BigInt(n); const o = []; do { let x = Number(n & 0x7fn); n >>= 7n; if (n) x |= 0x80; o.push(x); } while (n); return Buffer.from(o); }
const key = (fn, wt) => enc((fn << 3) | wt);
const ld = (fn, payload) => Buffer.concat([key(fn, 2), enc(payload.length), payload]);
const s = (x) => Buffer.from(x, "utf8");

/**
 * Return a new ONNX ModelProto buffer whose graph carries an Identity node from `tensor` to a new graph
 * output "durations" of element type `elemType` (1 = float, 10 = float16, 7 = int64). Pure.
 */
function exposeDurations(buf, tensor, elemType) {
  // locate ModelProto.graph (field 7)
  let p = 0, gKeyStart = -1, gStart = -1, gEnd = -1;
  while (p < buf.length) {
    const ks = p; let k; [k, p] = varint(buf, p);
    const fn = Number(k >> 3n), wt = Number(k & 7n);
    if (wt === 0) { [, p] = varint(buf, p); }
    else if (wt === 2) { let len; [len, p] = varint(buf, p); if (fn === 7) { gKeyStart = ks; gStart = p; gEnd = p + Number(len); } p += Number(len); }
    else if (wt === 1) p += 8; else if (wt === 5) p += 4; else throw new Error("unsupported protobuf wire type " + wt);
  }
  if (gStart < 0) throw new Error("no graph (ModelProto field 7) in the model buffer");
  const node = ld(1, Buffer.concat([ld(1, s(tensor)), ld(2, s("durations")), ld(3, s("expose_durations")), ld(4, s("Identity"))]));
  const typeProto = ld(1, Buffer.concat([key(1, 0), enc(elemType)])); // TypeProto.tensor_type{elem_type}
  const output = ld(12, Buffer.concat([ld(1, s("durations")), ld(2, typeProto)]));
  const graph = Buffer.concat([buf.subarray(gStart, gEnd), node, output]);
  return Buffer.concat([buf.subarray(0, gKeyStart), key(7, 2), enc(graph.length), graph, buf.subarray(gEnd)]);
}

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

async function exists(p) { try { await fsPromises.stat(p); return true; } catch { return false; } }

/**
 * Ensure the duration-exposed copy exists under modelsRoot. Reads the original, checks its hash, derives the
 * copy, checks the result's hash, writes it atomically beside copies of config.json, tokenizer.json and
 * tokenizer_config.json. Returns { path, created, sha256 }. Throws, writing nothing, on any mismatch.
 */
async function ensureExposedModel({
  modelsRoot, originalId, exposedId, modelFile, tensor, elemType,
  originalSha256 = null, exposedSha256 = null, sideFiles = ["config.json", "tokenizer.json", "tokenizer_config.json"],
}) {
  const originalDir = path.join(modelsRoot, ...originalId.split("/"));
  const exposedDir = path.join(modelsRoot, ...exposedId.split("/"));
  const inPath = path.join(originalDir, "onnx", modelFile);
  const outPath = path.join(exposedDir, "onnx", modelFile);
  for (const f of sideFiles) {
    const dst = path.join(exposedDir, f);
    if (!(await exists(dst))) { await fsPromises.mkdir(exposedDir, { recursive: true }); await fsPromises.copyFile(path.join(originalDir, f), dst); }
  }
  if (await exists(outPath)) {
    const have = sha256(await fsPromises.readFile(outPath));
    if (!exposedSha256 || have === exposedSha256) return { path: outPath, created: false, sha256: have };
    throw new Error(`exposed model at ${outPath} has sha256 ${have}, expected ${exposedSha256}`);
  }
  const input = await fsPromises.readFile(inPath);
  const inSha = sha256(input);
  if (originalSha256 && inSha !== originalSha256) throw new Error(`pinned model ${inPath} has sha256 ${inSha}, expected ${originalSha256}`);
  const output = exposeDurations(input, tensor, elemType);
  const outSha = sha256(output);
  if (exposedSha256 && outSha !== exposedSha256) throw new Error(`derived model sha256 ${outSha} differs from the recorded ${exposedSha256}; nothing written`);
  await fsPromises.mkdir(path.dirname(outPath), { recursive: true });
  const tmp = `${outPath}.${process.pid}.${Date.now()}.tmp`;
  await fsPromises.writeFile(tmp, output);
  await renameWithRetry(tmp, outPath);
  return { path: outPath, created: true, sha256: outSha };
}

module.exports = { exposeDurations, ensureExposedModel, sha256 };
