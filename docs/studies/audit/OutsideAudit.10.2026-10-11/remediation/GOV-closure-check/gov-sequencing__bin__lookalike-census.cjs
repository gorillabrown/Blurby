// Read-only census: where does the closure checker's raw vi.mock / CSS @import regex fire inside comments or strings,
// and which mock-API forms does it not see? Usage: node lookalike-census.cjs <repoRoot>
const fs = require("fs"), path = require("path");
const ts = require("C:/Projects/Blurby/node_modules/typescript");
const root = path.resolve(process.argv[2]);
const rel = (p) => path.relative(root, p).replaceAll(path.sep, "/");
const walk = (d, o = []) => { if (!fs.existsSync(d)) return o; for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === "node_modules" || e.name.startsWith(".")) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, o) : o.push(rel(p)); } return o; };
const files = [...["src", "tests", "main", "scripts"].flatMap((d) => walk(path.join(root, d))), "main.js", "preload.js", "vite.config.js"]
  .filter((f) => fs.existsSync(path.join(root, f)) && /\.(m?[jt]sx?|cjs|css)$/.test(f));
const out = { filesScanned: files.length, viMockRegexHits: 0, viMockInCommentOrString: [], cssImportInComment: [], otherMockForms: [] };
const MOCK = /\bvi\.mock\(\s*['"]([^'"]+)['"]/g;
const OTHER = /\bvi\.(doMock|unmock|doUnmock|importActual|importMock)\s*(?:<[^>]*>)?\(\s*['"`]([^'"`]+)['"`]|\bvi\.mock\(\s*`([^`]+)`|\brequire\.resolve\(\s*['"`]([^'"`]+)['"`]/g;
for (const f of files) {
  const text = fs.readFileSync(path.join(root, f), "utf8");
  if (f.endsWith(".css")) {
    const comments = [...text.matchAll(/\/\*[\s\S]*?\*\//g)].map((m) => [m.index, m.index + m[0].length]);
    for (const m of text.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)) if (comments.some(([a, b]) => m.index >= a && m.index < b)) out.cssImportInComment.push(`${f}: ${m[1]}`);
    continue;
  }
  const kind = /\.tsx$|\.jsx$/.test(f) ? ts.ScriptKind.TSX : /\.ts$|\.mts$/.test(f) ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const sf = ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true, kind);
  const ranges = [];
  const visit = (n) => {
    for (const r of ts.getLeadingCommentRanges(text, n.pos) ?? []) ranges.push([r.pos, r.end, "comment"]);
    for (const r of ts.getTrailingCommentRanges(text, n.end) ?? []) ranges.push([r.pos, r.end, "comment"]);
    if (ts.isStringLiteralLike(n) || n.kind === ts.SyntaxKind.TemplateHead || n.kind === ts.SyntaxKind.TemplateMiddle || n.kind === ts.SyntaxKind.TemplateTail || ts.isJsxText(n)) ranges.push([n.getStart(sf), n.end, "string"]);
    ts.forEachChild(n, visit);
  };
  visit(sf);
  for (const r of ts.getLeadingCommentRanges(text, sf.endOfFileToken.pos) ?? []) ranges.push([r.pos, r.end, "comment"]);
  for (const m of text.matchAll(MOCK)) {
    out.viMockRegexHits++;
    const hit = ranges.find(([a, b]) => m.index >= a && m.index < b);
    if (hit) out.viMockInCommentOrString.push(`${f}:${text.slice(0, m.index).split("\n").length} [${hit[2]}] ${m[1]}`);
  }
  for (const m of text.matchAll(OTHER)) {
    const spec = m[2] ?? m[3] ?? m[4];
    if (spec && spec.startsWith(".")) out.otherMockForms.push(`${f}:${text.slice(0, m.index).split("\n").length} ${m[1] ?? (m[3] ? "vi.mock(`template`)" : "require.resolve")} ${spec}`);
  }
}
console.log(JSON.stringify(out, null, 1));
