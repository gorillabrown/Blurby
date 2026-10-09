// READER-MODE-SEPARATION-2 Wave A census: mutable-resource ownership.
// Test-only harness. Mechanically extracts every mutable resource from the census scope with the
// installed TypeScript AST, joins it with the hand-authored judgments in ownership-rules.json,
// and writes ../ownership.json.
// Usage: node docs/planning/roadmap-reviews/reader-mode-separation-2/census/resource-census.mjs [--check]
//   --check : do not write; exit 1 if regenerated output differs from ownership.json or any
//             resource is unclassified / any rule is unused (the G1 ownership test can reuse this).
// Library: `import { extractResources } from "./resource-census.mjs"` (no side effects; the CLI runs only when executed).
//
// Resource identity = (file, kind, symbol, enclosing, anchor[, anchorOccurrence]). Anchor is a verbatim
// fragment of the file: the first line of the resource's statement, widened to the whole statement when
// the first line repeats; anchorOccurrence (1-based) disambiguates the residual verbatim duplicates.
import { createRequire } from "node:module";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EVIDENCE = path.resolve(HERE, "..");
const ROOT = path.resolve(EVIDENCE, "../../../..");
const require = createRequire(path.join(ROOT, "package.json"));
const ts = require("typescript");
const RULES = JSON.parse(fs.readFileSync(path.join(HERE, "ownership-rules.json"), "utf8"));
const abs = (r) => path.join(ROOT, r);
const LF = String.fromCharCode(10);
const CRLF = String.fromCharCode(13) + LF;

const MODES = ["page", "focus", "flow", "narrate", "shell"];
const OWNERS = [...MODES, "infrastructure-port", "per-mode"];
const PRIVATE_MODES = ["page", "focus", "flow", "narrate"];
const scope = RULES.scope.include;
const missing = scope.filter((f) => !fs.existsSync(abs(f)));

const TIMER_FNS = new Set(["setTimeout", "setInterval", "requestAnimationFrame", "requestIdleCallback", "queueMicrotask"]);
const OBSERVERS = new Set(["ResizeObserver", "MutationObserver", "IntersectionObserver", "AbortController", "AudioContext", "Worker", "BroadcastChannel"]);

export function extractResources(fileRel) {
  const text = fs.readFileSync(abs(fileRel), "utf8");
  const sf = ts.createSourceFile(fileRel, text, ts.ScriptTarget.Latest, true, fileRel.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const out = [];
  const classNames = new Set();
  const projectHooks = new Set(); // hook names imported from project modules
  for (const st of sf.statements) {
    if (ts.isClassDeclaration(st) && st.name) classNames.add(st.name.text);
    if (ts.isImportDeclaration(st) && ts.isStringLiteral(st.moduleSpecifier) && st.moduleSpecifier.text.startsWith(".") && st.importClause && !st.importClause.isTypeOnly) {
      const c = st.importClause;
      if (c.name && /^use[A-Z]/.test(c.name.text)) projectHooks.add(c.name.text);
      if (c.namedBindings && ts.isNamedImports(c.namedBindings)) for (const el of c.namedBindings.elements) if (/^use[A-Z]/.test(el.name.text)) projectHooks.add(el.name.text);
    }
  }
  // Same-file custom hooks are also instances when called from another function.
  ts.forEachChild(sf, function f(n) { if ((ts.isFunctionDeclaration(n) && n.name && /^use[A-Z]/.test(n.name.text))) projectHooks.add(n.name.text); });

  function enclosingName(n) {
    const names = [];
    for (let p = n.parent; p; p = p.parent) {
      let nm = null;
      if ((ts.isFunctionDeclaration(p) || ts.isClassDeclaration(p) || ts.isMethodDeclaration(p)) && p.name) nm = p.name.getText(sf);
      else if (ts.isConstructorDeclaration(p)) nm = "constructor";
      else if ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && ts.isVariableDeclaration(p.parent) && ts.isIdentifier(p.parent.name)) nm = p.parent.name.text;
      else if ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && ts.isCallExpression(p.parent) && ts.isVariableDeclaration(p.parent.parent) && ts.isIdentifier(p.parent.parent.name)) nm = p.parent.parent.name.text; // useCallback/forwardRef wrappers
      else if (ts.isPropertyAssignment(p) && (ts.isArrowFunction(p.initializer) || ts.isFunctionExpression(p.initializer))) nm = p.name.getText(sf);
      else if ((ts.isArrowFunction(p) || ts.isFunctionExpression(p)) && p.parent && ts.isJsxExpression(p.parent) && p.parent.parent && ts.isJsxAttribute(p.parent.parent)) nm = `jsx:${p.parent.parent.name.getText(sf)}`;
      else if ((ts.isGetAccessor(p) || ts.isSetAccessor(p)) && p.name) nm = p.name.getText(sf);
      if (nm) names.unshift(nm);
    }
    return names.length ? names.join(">") : "<module>";
  }
  function stmtOf(n) {
    let p = n;
    while (p.parent && !ts.isSourceFile(p.parent) && !ts.isBlock(p.parent) && !ts.isClassLike(p.parent) && !ts.isCaseClause(p.parent) && !ts.isDefaultClause(p.parent)) p = p.parent;
    return p;
  }
  function anchorOf(n) {
    // Shortest verbatim prefix (whole lines, first line trimmed of indentation) of the statement that is unique in the file.
    const node = stmtOf(n);
    const full = text.slice(node.getStart(sf), node.getEnd());
    const eol = full.includes(CRLF) ? CRLF : LF;
    const lines = full.split(eol);
    const count = (s) => text.split(s).length - 1;
    for (let k = 1; k <= lines.length; k++) {
      const cand = lines.slice(0, k).join(eol).trimEnd();
      if (cand.trim().length >= 8 && count(cand) === 1) return { anchor: cand };
    }
    // Residual verbatim duplicate: number occurrences of the first line in file order.
    const first = lines[0].trimEnd();
    let idx = -1, k = 0; const at = node.getStart(sf);
    while ((idx = text.indexOf(first, idx + 1)) !== -1) { k++; if (idx >= at) break; }
    return { anchor: first, anchorOccurrence: k };
  }
  function targetText(n) {
    // What the resource handle is stored in.
    const p = n.parent;
    if (p && ts.isVariableDeclaration(p)) return p.name.getText(sf);
    if (p && ts.isBinaryExpression(p) && p.operatorToken.kind === ts.SyntaxKind.EqualsToken && p.right === n) return p.left.getText(sf);
    if (p && ts.isPropertyAssignment(p)) return p.name.getText(sf);
    if (p && ts.isPropertyDeclaration(p)) return p.name.getText(sf);
    return null;
  }
  const push = (n, kind, symbol, extra = {}) => out.push({ file: fileRel, kind, symbol, enclosing: enclosingName(n), ...anchorOf(n), ...extra });

  function calleeName(call) {
    const e = call.expression;
    if (ts.isIdentifier(e)) return e.text;
    if (ts.isPropertyAccessExpression(e)) return e.name.text;
    return null;
  }
  function visit(n) {
    if (ts.isCallExpression(n)) {
      const name = calleeName(n);
      const e = n.expression;
      const qualifier = ts.isPropertyAccessExpression(e) ? e.expression.getText(sf) : "";
      const globalish = !qualifier || ["window", "globalThis", "self", "React"].includes(qualifier);
      if ((name === "useRef") && globalish) push(n, "useRef", targetText(n) ?? "(unbound)");
      else if ((name === "useState" || name === "useReducer") && globalish) {
        const p = n.parent;
        const sym = p && ts.isVariableDeclaration(p) && ts.isArrayBindingPattern(p.name) && p.name.elements[0] && !ts.isOmittedExpression(p.name.elements[0]) ? p.name.elements[0].name.getText(sf) : targetText(n) ?? "(unbound)";
        push(n, name, sym);
      } else if (name && TIMER_FNS.has(name) && globalish) push(n, name, targetText(n) ?? "(unassigned)");
      else if (name === "addEventListener") {
        const ev = n.arguments[0] && ts.isStringLiteralLike(n.arguments[0]) ? n.arguments[0].text : n.arguments[0]?.getText(sf) ?? "?";
        push(n, "addEventListener", `${qualifier}:${ev}`);
      } else if (name && /^on[A-Z]\w*$/.test(name) && /electronAPI|\bapi\b/.test(qualifier)) push(n, "ipc-subscription", `${qualifier}.${name}`, { handle: targetText(n) });
      else if (name === "subscribe" || name === "addListener") push(n, "subscription", `${qualifier}.${name}`, { handle: targetText(n) });
      else if (name && projectHooks.has(name) && ts.isIdentifier(e) && enclosingName(n) !== "<module>") push(n, "hook-instance", `${name}()`, { handle: targetText(n) });
    } else if (ts.isNewExpression(n) && ts.isIdentifier(n.expression)) {
      const c = n.expression.text;
      if (OBSERVERS.has(c)) push(n, "observer", `new ${c}`, { handle: targetText(n) });
      else if (/(Engine|Controller|Mode|Adapter|Scheduler|Cacher|Player|Index|Pipeline)$/.test(c) && !classNames.has("__none__")) push(n, "engine-instance", `new ${c}`, { handle: targetText(n) });
    } else if (ts.isPropertyDeclaration(n) && ts.isClassLike(n.parent) && !(ts.getCombinedModifierFlags(n) & ts.ModifierFlags.Static && n.initializer && ts.isArrowFunction(n.initializer))) {
      const ro = !!(ts.getCombinedModifierFlags(n) & ts.ModifierFlags.Readonly);
      const isFn = n.initializer && (ts.isArrowFunction(n.initializer) || ts.isFunctionExpression(n.initializer));
      if (!isFn) push(n, "class-field", n.name.getText(sf), { readonly: ro });
    } else if (ts.isParameter(n) && ts.isConstructorDeclaration(n.parent) && ts.getCombinedModifierFlags(n) & (ts.ModifierFlags.Private | ts.ModifierFlags.Public | ts.ModifierFlags.Protected | ts.ModifierFlags.Readonly)) {
      push(n, "class-field", n.name.getText(sf), { readonly: !!(ts.getCombinedModifierFlags(n) & ts.ModifierFlags.Readonly), parameterProperty: true });
    } else if (ts.isVariableStatement(n) && ts.isSourceFile(n.parent)) {
      const isLet = !(n.declarationList.flags & ts.NodeFlags.Const);
      for (const d of n.declarationList.declarations) {
        const init = d.initializer;
        if (isLet) push(d, "module-let", d.name.getText(sf));
        else if (init && (ts.isNewExpression(init) || (ts.isCallExpression(init) && /^create[A-Z]\w*(Store|Bus|Registry|Context)$|^createContext$/.test(init.expression.getText(sf)))))
          push(d, "module-singleton", d.name.getText(sf));
        else if (init && (ts.isArrayLiteralExpression(init) || ts.isObjectLiteralExpression(init)) && !/^[A-Z0-9_]+$/.test(d.name.getText(sf)) && !(init.parent && n.getText(sf).includes("as const")))
          push(d, "module-mutable-literal", d.name.getText(sf), { confidence: "low", reason: "module-level object/array literal; mutable only if written at runtime" });
      }
    }
    ts.forEachChild(n, visit);
  }
  visit(sf);
  return out;
}

function buildOwnership() {
  const resources = scope.filter((f) => fs.existsSync(abs(f))).flatMap(extractResources);
  resources.sort((a, b) => [a.file, a.enclosing, a.kind, a.symbol, a.anchor].join("\u0000").localeCompare([b.file, b.enclosing, b.kind, b.symbol, b.anchor].join("\u0000")) || (a.anchorOccurrence ?? 0) - (b.anchorOccurrence ?? 0));

  // ---- Join with judgments ----
  // Rule precedence: override (file + symbol, optional kind/enclosing/anchorIncludes) > enclosing rule > file default.
  const used = new Set();
  const matchOverride = (r) => {
    let best = null, bestScore = -1;
    RULES.overrides.forEach((o, i) => {
      if (o.file !== r.file) return;
      if (o.symbol !== undefined && o.symbol !== r.symbol) return;
      if (o.symbolPrefix !== undefined && !r.symbol.startsWith(o.symbolPrefix)) return;
      if (o.kind !== undefined && o.kind !== r.kind) return;
      if (o.enclosing !== undefined && o.enclosing !== r.enclosing) return;
      if (o.enclosingPrefix !== undefined && !r.enclosing.startsWith(o.enclosingPrefix)) return;
      if (o.anchorIncludes !== undefined && !r.anchor.includes(o.anchorIncludes)) return;
      const score = (o.symbol !== undefined ? 8 : 0) + (o.symbolPrefix !== undefined ? 4 : 0) + (o.anchorIncludes !== undefined ? 4 : 0) + (o.enclosing !== undefined ? 2 : 0) + (o.enclosingPrefix !== undefined ? 1 : 0) + (o.kind !== undefined ? 1 : 0);
      if (score > bestScore) { best = [i, o]; bestScore = score; }
    });
    return best;
  };
  const unclassified = [];
  const entries = resources.map((r) => {
    const ov = matchOverride(r);
    let j = null;
    if (ov) { used.add(`o${ov[0]}`); j = ov[1]; }
    else if (RULES.fileDefaults[r.file]) { used.add(`f:${r.file}`); j = RULES.fileDefaults[r.file]; }
    if (!j) { unclassified.push(r); return { ...r, currentUsers: [], proposedOwner: "UNCLASSIFIED", rationale: "no rule" }; }
    const e = { ...r, currentUsers: [...j.currentUsers].sort((a, b) => MODES.indexOf(a) - MODES.indexOf(b)), proposedOwner: j.proposedOwner, ...(j.privateCopiesFor ? { privateCopiesFor: [...j.privateCopiesFor].sort((a, b) => MODES.indexOf(a) - MODES.indexOf(b)) } : {}), rationale: j.rationale };
    const conf = j.confidence ?? r.confidence;
    if (conf) { e.confidence = conf; e.reason = j.confidence ? j.reason : r.reason; }
    return e;
  });
  const badValues = entries.filter((e) => e.proposedOwner !== "UNCLASSIFIED" && (!OWNERS.includes(e.proposedOwner) || e.currentUsers.some((u) => !MODES.includes(u)) || ((e.proposedOwner === "per-mode") !== Boolean(e.privateCopiesFor?.length)) || (e.privateCopiesFor ?? []).some((m) => !PRIVATE_MODES.includes(m))));
  const unusedRules = [
    ...RULES.overrides.map((o, i) => (used.has(`o${i}`) ? null : { override: o })).filter(Boolean),
    ...Object.keys(RULES.fileDefaults).filter((f) => !used.has(`f:${f}`) && scope.includes(f) && resources.some((r) => r.file === f)).map((f) => ({ fileDefaultNeverApplied: f })),
  ];

  const count = (key) => entries.reduce((m, e) => ((m[e[key]] = (m[e[key]] ?? 0) + 1), m), {});
  const perFile = {};
  for (const e of entries) {
    const p = (perFile[e.file] ??= { total: 0, byKind: {}, byProposedOwner: {} });
    p.total++; p.byKind[e.kind] = (p.byKind[e.kind] ?? 0) + 1; p.byProposedOwner[e.proposedOwner] = (p.byProposedOwner[e.proposedOwner] ?? 0) + 1;
  }
  const modeUsers = (e) => e.currentUsers.filter((u) => u !== "shell");
  const sharedMutableToday = entries.filter((e) => modeUsers(e).length > 1).map((e) => ({ file: e.file, kind: e.kind, symbol: e.symbol, enclosing: e.enclosing, anchor: e.anchor, ...(e.anchorOccurrence ? { anchorOccurrence: e.anchorOccurrence } : {}), currentUsers: e.currentUsers, proposedOwner: e.proposedOwner }));

  let sourceCommit = "unknown";
  try { sourceCommit = execSync("git rev-parse HEAD", { cwd: ROOT }).toString().trim(); } catch {}
  const out = {
    generatedBy: "docs/planning/roadmap-reviews/reader-mode-separation-2/census/resource-census.mjs",
    rulesSource: "docs/planning/roadmap-reviews/reader-mode-separation-2/census/ownership-rules.json",
    typescriptVersion: ts.version,
    sourceCommit,
    semantics: {
      kinds: "useRef | useState | useReducer | setTimeout | setInterval | requestAnimationFrame | requestIdleCallback | queueMicrotask | addEventListener | ipc-subscription (window.electronAPI/api .onX) | subscription (.subscribe/.addListener) | observer (new ResizeObserver/MutationObserver/IntersectionObserver/AbortController/AudioContext/Worker/BroadcastChannel) | engine-instance (new *Engine/*Controller/*Mode/*Adapter/*Scheduler/*Cacher/*Player/*Index/*Pipeline) | hook-instance (call of a project-owned use* hook: the callee instantiates its own refs/timers per call site) | class-field (non-function instance/static field or constructor parameter property) | module-let | module-singleton | module-mutable-literal",
      symbol: "Variable/field the resource is stored in; timers use the handle target (e.g. rafRef.current) or (unassigned); listeners use target:event.",
      currentUsers: "Modes whose runtime path reads or writes the resource today (shell = document shell/toolbar/library chrome, mode-independent).",
      proposedOwner: "page|focus|flow|narrate = that mode alone owns it; shell = router/document shell; infrastructure-port = narrow settings/persistence/document/audio/diagnostics port behind the broker; per-mode = the resource lives in code every listed mode copies (privateCopiesFor), so each mode instance owns an independent copy and no instance is shared.",
      sharedMutableToday: "Resources whose currentUsers contain more than one of page/focus/flow/narrate — the separation targets.",
    },
    scope,
    excludedFromScope: RULES.scope.excluded,
    missingScopeFiles: missing,
    counts: {
      resources: entries.length,
      byProposedOwner: count("proposedOwner"),
      byKind: count("kind"),
      sharedMutableToday: sharedMutableToday.length,
      unclassified: unclassified.length,
      lowConfidence: entries.filter((e) => e.confidence === "low").length,
    },
    perFile,
    unusedRules,
    invalidValues: badValues.map((e) => ({ file: e.file, symbol: e.symbol, proposedOwner: e.proposedOwner, currentUsers: e.currentUsers })),
    sharedMutableToday,
    resources: entries,
  };
  return { out, unclassified, badValues, unusedRules };
}

const isMain = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const { out, unclassified, badValues, unusedRules } = buildOwnership();
  const textOut = JSON.stringify(out, null, 2) + "\n";
  const target = path.join(EVIDENCE, "ownership.json");
  if (process.argv.includes("--check")) {
    const prev = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : "";
    const strip = (s) => s.replace(/"sourceCommit": "[^"]*"/, "");
    const problems = [];
    if (strip(prev) !== strip(textOut)) problems.push("ownership.json is stale");
    if (unclassified.length) problems.push(`${unclassified.length} unclassified`);
    if (badValues.length) problems.push(`${badValues.length} invalid owner/user values`);
    if (problems.length) { console.error(problems.join("; ")); process.exit(1); }
    console.log("ownership.json up to date; all resources classified");
  } else {
    fs.writeFileSync(target, textOut);
    console.log(JSON.stringify(out.counts), "unusedRules:", unusedRules.length, "invalid:", badValues.length);
  }
}
