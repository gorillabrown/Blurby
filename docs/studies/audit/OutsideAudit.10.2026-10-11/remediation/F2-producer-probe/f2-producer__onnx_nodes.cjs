// Minimal ONNX protobuf walker: list graph outputs and nodes of interest. Read-only.
const fs = require("fs");
const file = process.argv[2];
const buf = fs.readFileSync(file);

function varint(b, p) {
  let r = 0n, s = 0n, c;
  do { c = b[p++]; r |= BigInt(c & 0x7f) << s; s += 7n; } while (c & 0x80);
  return [r, p];
}
function* fields(b, start, end) {
  let p = start;
  while (p < end) {
    let key; [key, p] = varint(b, p);
    const fn = Number(key >> 3n), wt = Number(key & 7n);
    if (wt === 0) { let v; [v, p] = varint(b, p); yield { fn, wt, v }; }
    else if (wt === 2) { let len; [len, p] = varint(b, p); len = Number(len); yield { fn, wt, start: p, end: p + len }; p += len; }
    else if (wt === 1) { yield { fn, wt, start: p, end: p + 8 }; p += 8; }
    else if (wt === 5) { yield { fn, wt, start: p, end: p + 4 }; p += 4; }
    else throw new Error("wire type " + wt + " at " + p);
  }
}
const str = (f) => buf.toString("utf8", f.start, f.end);

let graph;
for (const f of fields(buf, 0, buf.length)) if (f.fn === 7) graph = f;
const nodes = [], outputs = [];
for (const f of fields(buf, graph.start, graph.end)) {
  if (f.fn === 1) {
    const n = { in: [], out: [], name: "", op: "" };
    for (const g of fields(buf, f.start, f.end)) {
      if (g.fn === 1) n.in.push(str(g));
      else if (g.fn === 2) n.out.push(str(g));
      else if (g.fn === 3) n.name = str(g);
      else if (g.fn === 4) n.op = str(g);
    }
    nodes.push(n);
  } else if (f.fn === 12) {
    for (const g of fields(buf, f.start, f.end)) if (g.fn === 1) outputs.push(str(g));
  }
}
console.log("graph outputs:", outputs, "node count:", nodes.length);
const want = new Set((process.argv[3] || "Round,Clip,Sigmoid,ReduceSum,Div,Cast,Squeeze,CumSum,Range").split(","));
const firstRound = nodes.findIndex((n) => n.op === "Round");
console.log("first Round index", firstRound);
const lo = Math.max(0, firstRound - 12), hi = Math.min(nodes.length, firstRound + 25);
for (let i = lo; i < hi; i++) { const n = nodes[i]; console.log(i, n.op, JSON.stringify(n.name), "in", JSON.stringify(n.in), "out", JSON.stringify(n.out)); }
console.log("op histogram (selected):", Object.fromEntries([...want].map((o) => [o, nodes.filter((n) => n.op === o).length])));
