// NARRATE-REMOVE-1 closure check v3: every relative import must resolve to an existing file. Exit 1 on any finding.
// Usage: node closure-check.mjs <repoRoot> | node closure-check.mjs --self-test
// Imports are found by TypeScript's own scanner (ts.preProcessFile: static, side-effect, type-only, dynamic import(),
// require()), so strings and comments are never imports. vi.mock() calls come from the syntax tree, and CSS @import
// is matched after CSS comments are stripped, so lookalikes in strings and comments never count for those forms either.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { createRequire } from "node:module";
// TypeScript is loaded once, resolved from the directory the check runs in (the repository root).
const ts = createRequire(path.join(process.cwd(), "package.json"))("typescript");
// shortcut: only vi.mock is matched, not vi.doMock/importActual; none survives the removal (tests/ttsContinuityReadiness.test.ts is deleted).
const mocks = (f, text, out = []) => { const visit = (n) => { if (ts.isCallExpression(n) && n.expression.getText() === "vi.mock" && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) out.push(n.arguments[0].text); ts.forEachChild(n, visit); }; visit(ts.createSourceFile(f, text, ts.ScriptTarget.Latest, true)); return out; };
const check = (root) => {
  const rel = (p) => path.relative(root, p).replaceAll(path.sep, "/");
  const walk = (d, o = []) => { if (!fs.existsSync(d)) return o; for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === "node_modules" || e.name.startsWith(".")) continue; const p = path.join(d, e.name); e.isDirectory() ? walk(p, o) : o.push(rel(p)); } return o; };
  const files = [...["src", "tests", "main", "scripts"].flatMap((d) => walk(path.join(root, d))), "main.js", "preload.js", "vite.config.js"]
    .filter((f) => fs.existsSync(path.join(root, f)) && /\.(m?[jt]sx?|cjs|css)$/.test(f));
  const exts = ["", ".ts", ".tsx", ".js", ".mjs", ".cjs", ".css", ".json", "/index.ts", "/index.tsx", "/index.js"];
  const exists = (base) => exts.some((x) => { const p = path.join(root, base + x); return fs.existsSync(p) && fs.statSync(p).isFile(); });
  const bad = [];
  for (const f of files) {
    const text = fs.readFileSync(path.join(root, f), "utf8");
    const specs = f.endsWith(".css")
      ? [...text.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
      : [...ts.preProcessFile(text, true, true).importedFiles.map((i) => i.fileName), ...mocks(f, text)];
    for (const s of specs) if (s.startsWith(".") && !exists(path.posix.normalize(path.posix.join(path.posix.dirname(f), s)))) bad.push(`${f}: "${s}"`);
  }
  return bad;
};
if (process.argv[2] === "--self-test") { // negative controls: each missing-import form must be reported; a string must not
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hb1-closure-"));
  try {
    fs.mkdirSync(path.join(dir, "src")); fs.mkdirSync(path.join(dir, "tests"));
    const w = (f, t) => fs.writeFileSync(path.join(dir, f), t);
    w("src/ok.ts", "export const ok = 1;\n");
    w("src/named.ts", 'import { a } from "./missing-named";\n');
    w("src/req.js", 'const x = require("./missing-require");\n');
    w("src/side.tsx", 'import "./missing-side.css";\n');
    w("src/dyn.ts", 'export const l = () => import("./missing-dynamic");\n');
    w("src/type.ts", 'import type { T } from "./missing-type";\n');
    w("src/style.css", '@import "./missing-at-import.css";\n');
    w("tests/mock.test.ts", 'vi.mock("../src/missing-mock");\n');
    w("tests/lookalike.test.ts", '// vi.mock("../src/missing-mock-in-comment")\nconst m = \'vi.mock("../src/missing-mock-in-string")\';\n');
    w("src/commented.css", '/* @import "./missing-in-css-comment.css"; */\n');
    w("src/string.ts", 'const s = "require(\'./missing-in-string\')"; // import "./missing-in-comment"\nimport { ok } from "./ok";\n');
    const got = check(dir).map((b) => b.split('"')[1]).sort();
    const want = ["../src/missing-mock", "./missing-at-import.css", "./missing-dynamic", "./missing-named", "./missing-require", "./missing-side.css", "./missing-type"].sort();
    const pass = JSON.stringify(got) === JSON.stringify(want);
    console.log(pass ? "self-test: 7/7 missing-import forms reported; lookalike strings and comments ignored" : `self-test FAILED: got ${JSON.stringify(got)}`);
    process.exit(pass ? 0 : 1);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const bad = check(path.resolve(process.argv[2] ?? "."));
console.log(`dangling relative imports: ${bad.length}`); bad.forEach((b) => console.log("  " + b));
process.exit(bad.length ? 1 : 0);
