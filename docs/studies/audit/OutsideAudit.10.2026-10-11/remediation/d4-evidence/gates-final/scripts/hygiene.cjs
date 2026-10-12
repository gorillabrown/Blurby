// Check files: valid UTF-8, LF only, no trailing whitespace, final newline. usage: node hygiene.cjs <files...>
const fs = require("fs"); let bad = 0;
for (const f of process.argv.slice(2)) {
  const b = fs.readFileSync(f); const t = b.toString("utf8");
  const probs = [];
  if (Buffer.compare(Buffer.from(t, "utf8"), b) !== 0) probs.push("not UTF-8");
  if (t.includes("\r")) probs.push("CR");
  if (t.charCodeAt(0) === 0xfeff) probs.push("BOM");
  const ws = t.split("\n").map((l, i) => (/[ \t]+$/.test(l) ? i + 1 : 0)).filter(Boolean);
  if (ws.length) probs.push(`trailing whitespace at lines ${ws.slice(0, 5).join(",")}${ws.length > 5 ? "..." : ""}`);
  if (t.length && !t.endsWith("\n")) probs.push("no final newline");
  if (probs.length) { bad++; console.log(`${f}: ${probs.join("; ")}`); }
}
console.log(bad ? `${bad} files with problems` : "hygiene ok");
