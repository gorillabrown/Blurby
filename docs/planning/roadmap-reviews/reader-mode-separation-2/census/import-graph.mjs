#!/usr/bin/env node
// READER-MODE-SEPARATION-2 Wave A census: transitive project import graph.
// Test-only harness. Reads source; writes only ../dependencies.json.
// Usage: node docs/planning/roadmap-reviews/reader-mode-separation-2/census/import-graph.mjs [--check]
//   --check : do not write; exit 1 if the regenerated graph differs from dependencies.json.
//
// Edge classification (per import/export declaration):
//   syntax "type"  : `import type`, `export type`, every specifier `type`-marked, or `import("x").T` type nodes.
//   elided         : value-syntax import whose every bound name resolves (checker) to a type-only symbol;
//                    esbuild/tsc drop it at emit, so it is not a runtime edge.
//   runtime edge   = syntax "value" and not elided (side-effect, namespace, dynamic import() always runtime).
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE = path.resolve(HERE, "..");
const ROOT = path.resolve(EVIDENCE, "../../../..");
const require = createRequire(path.join(ROOT, "package.json"));
const ts = require("typescript");
const POLICY = require(path.join(HERE, "mode-copy-policy.json"));

const rel = (abs) => path.relative(ROOT, abs).split(path.sep).join("/");
const abs = (r) => path.join(ROOT, r);
const sortU = (xs) => [...new Set(xs)].sort();

const paths = JSON.parse(fs.readFileSync(path.join(EVIDENCE, "paths.json"), "utf8"));
const roots = paths.existingSourcePaths;
const missingRoots = roots.filter((r) => !fs.existsSync(abs(r)));

const cfg = ts.readConfigFile(abs("tsconfig.json"), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, ROOT);
const options = parsed.options;
const host = ts.createCompilerHost(options, true);
// Program over every src/ file so importer analysis (who outside the graph imports a site) is complete.
const srcFiles = parsed.fileNames.filter((f) => rel(path.resolve(f)).startsWith("src/"));
const program = ts.createProgram(srcFiles, options, host);
const ENTRY = "src/main.tsx"; // index.html: <script type="module" src="/src/main.tsx">
const checker = program.getTypeChecker();

function isProjectFile(file) {
  const r = rel(file);
  return !r.startsWith("..") && !r.includes("node_modules/");
}
function packageName(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

// Resolve a specifier from a containing file. Returns {project: relPath} | {external: pkg} | {unresolved}.
function resolve(spec, fromAbs) {
  const res = ts.resolveModuleName(spec, fromAbs, options, host).resolvedModule;
  if (res) {
    const file = path.resolve(res.resolvedFileName);
    if (!res.isExternalLibraryImport && isProjectFile(file)) return { project: rel(file) };
    return { external: packageName(spec) };
  }
  if (spec.startsWith(".")) {
    // Non-TS assets (css, json, svg...) that TS does not resolve: resolve on disk.
    const cand = path.resolve(path.dirname(fromAbs), spec);
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return { project: rel(cand) };
    return { unresolved: spec };
  }
  return { external: packageName(spec) };
}

// Symbols referenced in value positions anywhere in a file (outside import declarations).
const valueUseCache = new Map();
function inTypePosition(id) {
  for (let p = id.parent; p; p = p.parent) {
    if (ts.isExpressionWithTypeArguments(p) && p.parent && ts.isHeritageClause(p.parent))
      return !(p.parent.token === ts.SyntaxKind.ExtendsKeyword && ts.isClassLike(p.parent.parent));
    if (ts.isTypeNode(p) || ts.isTypeAliasDeclaration(p) || ts.isInterfaceDeclaration(p)) return true;
    if (ts.isStatement(p) || ts.isSourceFile(p)) return false;
  }
  return false;
}
function valueUsedSymbols(sf) {
  if (valueUseCache.has(sf)) return valueUseCache.get(sf);
  const used = new Set();
  const walk = (n) => {
    if (ts.isImportDeclaration(n)) return;
    if (ts.isIdentifier(n) && !inTypePosition(n)) {
      const sym = checker.getSymbolAtLocation(n) ?? (ts.isShorthandPropertyAssignment(n.parent) ? checker.getShorthandAssignmentValueSymbol(n.parent) : undefined);
      if (sym) used.add(sym);
    }
    ts.forEachChild(n, walk);
  };
  walk(sf);
  valueUseCache.set(sf, used);
  return used;
}
// True when a value-syntax import is dropped at emit: every binding is type-only (by symbol) or never
// referenced in a value position (tsc/esbuild unused-import elision; tsconfig has no
// verbatimModuleSyntax/preserveValueImports).
function importIsElided(node) {
  const clause = node.importClause;
  if (!clause) return false; // side-effect import
  const names = [];
  if (clause.name) names.push(clause.name);
  const nb = clause.namedBindings;
  if (nb && ts.isNamespaceImport(nb)) names.push(nb.name);
  if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) if (!el.isTypeOnly) names.push(el.name);
  if (names.length === 0) return true; // every specifier type-marked
  const used = valueUsedSymbols(node.getSourceFile());
  return names.every((id) => {
    const local = checker.getSymbolAtLocation(id);
    if (!local) return false;
    const target = local.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(local) : local;
    if (!(target.flags & ts.SymbolFlags.Value)) return true;
    return !used.has(local);
  });
}
function exportIsElided(node) {
  if (!node.exportClause || !ts.isNamedExports(node.exportClause)) return false; // export * keeps runtime
  const els = node.exportClause.elements.filter((e) => !e.isTypeOnly);
  if (els.length === 0) return true;
  return els.every((el) => {
    let sym = checker.getSymbolAtLocation(el.propertyName ?? el.name) ?? checker.getExportSpecifierLocalTargetSymbol(el);
    if (!sym) return false;
    if (sym.flags & ts.SymbolFlags.Alias) sym = checker.getAliasedSymbol(sym);
    return !(sym.flags & ts.SymbolFlags.Value);
  });
}

function edgesOfTs(fileRel) {
  const sf = program.getSourceFile(abs(fileRel)) ?? ts.createSourceFile(abs(fileRel), fs.readFileSync(abs(fileRel), "utf8"), ts.ScriptTarget.Latest, true);
  const out = [];
  const add = (spec, kind, syntax, elided) => out.push({ spec, kind, syntax, elided });
  const visit = (n) => {
    if (ts.isImportDeclaration(n) && ts.isStringLiteral(n.moduleSpecifier)) {
      const c = n.importClause;
      const typeSyntax = !!c && (c.isTypeOnly || (!c.name && c.namedBindings && ts.isNamedImports(c.namedBindings) && c.namedBindings.elements.length > 0 && c.namedBindings.elements.every((e) => e.isTypeOnly)));
      const el = typeSyntax ? false : importIsElided(n);
      add(n.moduleSpecifier.text, c ? "import" : "side-effect", typeSyntax ? "type" : "value", el);
    } else if (ts.isExportDeclaration(n) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) {
      const typeSyntax = n.isTypeOnly || (n.exportClause && ts.isNamedExports(n.exportClause) && n.exportClause.elements.length > 0 && n.exportClause.elements.every((e) => e.isTypeOnly));
      add(n.moduleSpecifier.text, "re-export", typeSyntax ? "type" : "value", typeSyntax ? false : exportIsElided(n));
    } else if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) {
      add(n.arguments[0].text, "dynamic-import", "value", false);
    } else if (ts.isImportTypeNode(n) && ts.isLiteralTypeNode(n.argument) && ts.isStringLiteral(n.argument.literal)) {
      add(n.argument.literal.text, "import-type-node", "type", false);
    } else if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "require" && n.arguments[0] && ts.isStringLiteralLike(n.arguments[0])) {
      add(n.arguments[0].text, "require", "value", false);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return out;
}
function edgesOfCss(fileRel) {
  const src = fs.readFileSync(abs(fileRel), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  for (const m of src.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']/g)) out.push({ spec: m[1], kind: "css-import", syntax: "value", elided: false });
  return out;
}

// Edge cache for any project file (TS or CSS).
const edgeCache = new Map();
const externals = new Map(); // pkg -> Set(importer) (graph members only, filled below)
const unresolvedAll = new Map(); // file -> [spec]
function edgesOf(f) {
  if (edgeCache.has(f)) return edgeCache.get(f);
  const raw = f.endsWith(".css") ? edgesOfCss(f) : /\.(tsx?|jsx?|mjs|cjs)$/.test(f) ? edgesOfTs(f) : [];
  const edges = [], ext = [], unres = [];
  for (const e of raw) {
    const r = resolve(e.spec, abs(f));
    if (r.project) edges.push({ to: r.project, kind: e.kind, typeOnly: e.syntax === "type" || e.elided, ...(e.elided ? { elidedValueSyntax: true } : {}) });
    else if (r.external) ext.push(r.external);
    else unres.push(e.spec);
  }
  edges.sort((a, b) => (a.to + a.kind).localeCompare(b.to + b.kind));
  const v = { edges, ext, unres };
  edgeCache.set(f, v);
  return v;
}
// BFS over all edges (runtime + type) from every root.
const modules = new Map(); // rel -> {edges}
const unresolved = [];
const queue = roots.filter((r) => fs.existsSync(abs(r)));
while (queue.length) {
  const f = queue.shift();
  if (modules.has(f)) continue;
  const { edges, ext, unres } = edgesOf(f);
  for (const e of edges) if (!modules.has(e.to)) queue.push(e.to);
  for (const p of ext) { if (!externals.has(p)) externals.set(p, new Set()); externals.get(p).add(f); }
  for (const u of unres) unresolved.push({ from: f, spec: u });
  modules.set(f, { edges });
}
// Whole-src importer index + production reachability from the renderer entry (runtime edges only).
const srcRel = sortU([...srcFiles.map((f) => rel(path.resolve(f))), ...[...modules.keys()]]);
const srcImporters = new Map();
for (const f of srcRel) for (const e of edgesOf(f).edges) {
  if (!srcImporters.has(e.to)) srcImporters.set(e.to, []);
  srcImporters.get(e.to).push({ from: f, typeOnly: e.typeOnly });
}
const prodReachable = new Set();
{ const st = [ENTRY]; while (st.length) { const f = st.pop(); if (prodReachable.has(f) || !fs.existsSync(abs(f))) continue; prodReachable.add(f); for (const e of edgesOf(f).edges) if (!e.typeOnly) st.push(e.to); } }
const importedBy = new Map();
for (const [f, m] of modules) for (const e of m.edges) {
  if (!importedBy.has(e.to)) importedBy.set(e.to, new Set());
  importedBy.get(e.to).add(f);
}
// A module pair is a runtime edge if ANY declaration between them is runtime.
const runtimeOf = (f) => sortU(modules.get(f).edges.filter((e) => !e.typeOnly).map((e) => e.to));
const typeOnlyOf = (f) => { const rt = new Set(runtimeOf(f)); return sortU(modules.get(f).edges.filter((e) => e.typeOnly && !rt.has(e.to)).map((e) => e.to)); };

function runtimeClosure(starts) {
  const seen = new Set();
  const st = [...starts];
  while (st.length) { const f = st.pop(); if (seen.has(f) || !modules.has(f)) continue; seen.add(f); st.push(...runtimeOf(f)); }
  return seen;
}
const runtimeReachable = runtimeClosure(roots.filter((r) => modules.has(r)));
const rootSet = new Set(roots);
const helpersOutside = sortU([...runtimeReachable].filter((f) => !rootSet.has(f)));
const typeOnlyReachableOutside = sortU([...modules.keys()].filter((f) => !rootSet.has(f) && !runtimeReachable.has(f)));

// ---- Mode copy proposal (policy file holds the judgment; script expands to exact paths) ----
const MODES = ["page", "focus", "flow", "narrate"];
const policyFiles = new Set([...Object.keys(POLICY.modeEntrypoints).flatMap((m) => POLICY.modeEntrypoints[m]), ...Object.keys(POLICY.allowedShared), ...Object.keys(POLICY.shellOnly), ...Object.keys(POLICY.narrateTtsPort), ...Object.keys(POLICY.retireNotCopy)]);
const policyGaps = sortU([...runtimeReachable].filter((f) => !policyFiles.has(f) && !POLICY.modeHelperUsers[f]));
const stopAt = new Set([...Object.keys(POLICY.allowedShared), ...Object.keys(POLICY.shellOnly), ...Object.keys(POLICY.narrateTtsPort), ...Object.keys(POLICY.retireNotCopy)]);
const proposedModeCopies = {};
for (const mode of MODES) {
  // Walk runtime edges from the mode's entrypoints; stop at shared/shell/port modules.
  const seen = new Set();
  const st = [...POLICY.modeEntrypoints[mode]];
  while (st.length) {
    const f = st.pop();
    if (seen.has(f) || stopAt.has(f) || !modules.has(f)) continue;
    seen.add(f);
    st.push(...runtimeOf(f));
  }
  const helpers = sortU([...seen].filter((f) => {
    const users = POLICY.modeHelperUsers[f];
    return !users || users.includes(mode);
  }));
  const absorbed = POLICY.layoutAbsorption[mode] ?? {};
  proposedModeCopies[mode] = helpers.filter((f) => !absorbed[f]).map((f) => ({
    source: f,
    destination: `src/reader/modes/${mode}/helpers/${path.posix.basename(f)}`,
    sourceIsExistingSite: rootSet.has(f),
    liveInProduction: prodReachable.has(f),
    ...(POLICY.copyNotes[f] ? { note: POLICY.copyNotes[f] } : {}),
  }));
}
// Destination basename collisions within one mode would make the exact-path rule ambiguous.
const destinationCollisions = {};
for (const mode of MODES) {
  const by = {};
  for (const c of proposedModeCopies[mode]) (by[c.destination] ??= []).push(c.source);
  const col = Object.entries(by).filter(([, v]) => v.length > 1);
  if (col.length) destinationCollisions[mode] = Object.fromEntries(col);
}

let sourceCommit = "unknown";
try { sourceCommit = execSync("git rev-parse HEAD", { cwd: ROOT }).toString().trim(); } catch {}
const out = {
  generatedBy: "docs/planning/roadmap-reviews/reader-mode-separation-2/census/import-graph.mjs",
  typescriptVersion: ts.version,
  sourceCommit,
  edgeSemantics: "runtimeImports: at least one non-type, non-elided import/re-export/dynamic import()/side-effect/css @import edge. typeOnlyImports: only `import type`/`export type`/type-only specifiers/import(\"x\").T type nodes, or value-syntax imports whose every binding resolves to a type-only symbol or is never referenced in a value position (elidedValueSyntax: tsc/esbuild drop these at emit because tsconfig sets neither verbatimModuleSyntax nor preserveValueImports). Project-owned = resolved inside the repo, outside node_modules.",
  roots,
  missingRoots,
  counts: {
    modules: modules.size,
    runtimeEdges: [...modules.keys()].reduce((n, f) => n + runtimeOf(f).length, 0),
    typeOnlyEdges: [...modules.keys()].reduce((n, f) => n + typeOnlyOf(f).length, 0),
    runtimeReachable: runtimeReachable.size,
    liveInProductionFromEntry: [...modules.keys()].filter((f) => prodReachable.has(f)).length,
    transitiveHelpersOutsideExistingSites: helpersOutside.length,
    typeOnlyReachableOutsideExistingSites: typeOnlyReachableOutside.length,
    externalPackages: externals.size,
  },
  modules: sortU([...modules.keys()]).map((f) => ({
    path: f,
    existingSite: rootSet.has(f),
    liveInProduction: prodReachable.has(f),
    reachableAtRuntime: runtimeReachable.has(f),
    runtimeImports: runtimeOf(f),
    typeOnlyImports: typeOnlyOf(f),
    importedBy: sortU([...(importedBy.get(f) ?? [])]),
    edges: modules.get(f).edges,
  })),
  externalPackages: sortU([...externals.keys()]).map((p) => ({ name: p, importedBy: sortU([...externals.get(p)]) })),
  unresolved: unresolved.sort((a, b) => (a.from + a.spec).localeCompare(b.from + b.spec)),
  productionEntry: ENTRY,
  existingSitesNotReachableFromProductionEntry: roots.filter((r) => !prodReachable.has(r)).map((r) => ({
    path: r,
    runtimeImportersInSrc: sortU((srcImporters.get(r) ?? []).filter((i) => !i.typeOnly).map((i) => i.from)),
    typeOnlyImportersInSrc: sortU((srcImporters.get(r) ?? []).filter((i) => i.typeOnly).map((i) => i.from)),
  })),
  importersOutsideGraph: sortU([...modules.keys()]).map((f) => ({ path: f, importers: sortU((srcImporters.get(f) ?? []).map((i) => i.from).filter((x) => !modules.has(x))) })).filter((x) => x.importers.length),
  transitiveHelpersOutsideExistingSites: helpersOutside,
  typeOnlyReachableOutsideExistingSites: typeOnlyReachableOutside,
  proposedModeCopies: {
    policySource: "docs/planning/roadmap-reviews/reader-mode-separation-2/census/mode-copy-policy.json",
    method: "For each mode, walk runtime edges from its policy entrypoints, stopping at allowed-shared, shell-only and Narrate TTS-port modules; keep a helper only if modeHelperUsers lists the mode (or it is unlisted). Destination = src/reader/modes/<mode>/helpers/<basename> (spec item 2). Planned layout files (ModeRuntime.ts, FoliateView.tsx, ...) absorb existing-site bodies per the edit-site table; helper copies are listed here regardless so every touched source has an exact destination.",
    policyGaps,
    destinationCollisions,
    ...proposedModeCopies,
    layoutAbsorption: Object.fromEntries(Object.entries(POLICY.layoutAbsorption).map(([m, v]) => [m, Object.entries(v).sort().map(([source, into]) => ({ source, destination: `src/reader/modes/${m}/${into.split(" ")[0]}`, ...(into.includes(" ") ? { note: into.slice(into.indexOf(" ") + 1) } : {}) }))])),
  },
  retireNotCopy: Object.entries(POLICY.retireNotCopy).sort().map(([p, v]) => ({ path: p, liveInProduction: prodReachable.has(p), justification: v })),
  allowedShared: Object.entries(POLICY.allowedShared).sort().map(([p, v]) => ({ path: p, category: v.category, justification: v.justification, ...(v.confidence ? { confidence: v.confidence, reason: v.reason } : {}) })),
  shellOnly: Object.entries(POLICY.shellOnly).sort().map(([p, v]) => ({ path: p, justification: v })),
  narrateTtsPort: Object.entries(POLICY.narrateTtsPort).sort().map(([p, v]) => ({ path: p, justification: v })),
};
const text = JSON.stringify(out, null, 2) + "\n";
const target = path.join(EVIDENCE, "dependencies.json");
if (process.argv.includes("--check")) {
  const prev = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
  const strip = (s) => s.replace(/"sourceCommit": "[^"]*"/, "");
  if (strip(prev) !== strip(text)) { console.error("dependencies.json is stale"); process.exit(1); }
  console.log("dependencies.json up to date");
} else {
  fs.writeFileSync(target, text);
  console.log(JSON.stringify(out.counts), "policyGaps:", policyGaps.length, "collisions:", JSON.stringify(destinationCollisions));
}
