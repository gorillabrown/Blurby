// Write a COPY of the model whose graph also outputs the internal duration tensor as "durations".
// usage: node expose_dur.cjs <in.onnx> <out.onnx> <tensorName> <elemType:1=float,7=int64>
const fs = require("fs");
const [, , inFile, outFile, tensor, elemTypeStr] = process.argv;
const elemType = Number(elemTypeStr);
const buf = fs.readFileSync(inFile);

function varint(b, p) { let r = 0n, s = 0n, c; do { c = b[p++]; r |= BigInt(c & 0x7f) << s; s += 7n; } while (c & 0x80); return [r, p]; }
function enc(n) { n = BigInt(n); const o = []; do { let x = Number(n & 0x7fn); n >>= 7n; if (n) x |= 0x80; o.push(x); } while (n); return Buffer.from(o); }
const key = (fn, wt) => enc((fn << 3) | wt);
const ld = (fn, payload) => Buffer.concat([key(fn, 2), enc(payload.length), payload]);
const s = (x) => Buffer.from(x, "utf8");

// locate ModelProto.graph (field 7)
let p = 0, gKeyStart = -1, gStart = -1, gEnd = -1;
while (p < buf.length) {
  const ks = p; let k; [k, p] = varint(buf, p);
  const fn = Number(k >> 3n), wt = Number(k & 7n);
  if (wt === 0) { [, p] = varint(buf, p); }
  else if (wt === 2) { let len; [len, p] = varint(buf, p); if (fn === 7) { gKeyStart = ks; gStart = p; gEnd = p + Number(len); } p += Number(len); }
  else if (wt === 1) p += 8; else if (wt === 5) p += 4; else throw new Error("wt " + wt);
}
const node = ld(1, Buffer.concat([ld(1, s(tensor)), ld(2, s("durations")), ld(3, s("expose_durations")), ld(4, s("Identity"))]));
const typeProto = ld(1, Buffer.concat([key(1, 0), enc(elemType)])); // TypeProto.tensor_type{elem_type}
const output = ld(12, Buffer.concat([ld(1, s("durations")), ld(2, typeProto)]));
const graph = Buffer.concat([buf.subarray(gStart, gEnd), node, output]);
const out = Buffer.concat([buf.subarray(0, gKeyStart), key(7, 2), enc(graph.length), graph, buf.subarray(gEnd)]);
fs.writeFileSync(outFile, out);
console.log("wrote", outFile, out.length, "bytes; exposed", tensor, "as durations elemType", elemType);
