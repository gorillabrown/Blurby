// READER-MODE-SEPARATION-2 G1 — dependency boundaries.
// Reuses the Wave A census (buildImportGraph: installed TypeScript resolver + runtime/type-only edge
// classifier) and census/boundary-policy.json. Roots: every existing src/reader/modes/<mode>/index.ts
// plus the policy's shared contract/port/broker roots.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildImportGraph } from "../docs/planning/roadmap-reviews/reader-mode-separation-2/census/import-graph.mjs";
import policy from "../docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json";

interface Edge { readonly to: string; readonly typeOnly: boolean; readonly names?: readonly string[] }
interface Graph {
  readonly modules: readonly { readonly path: string; readonly edges: readonly Edge[] }[];
  readonly externalPackages: readonly { readonly name: string; readonly importedBy: readonly string[] }[];
}
interface BoundaryPolicy {
  readonly modesDirectory: string;
  readonly allowedShared: Readonly<Record<string, { readonly exports: readonly string[] }>>;
  readonly allowedExternal: readonly string[];
  readonly legacy: readonly string[];
}

const modeOf = (file: string, modesDirectory: string): string | null =>
  file.startsWith(`${modesDirectory}/`) ? (/^([^/]+)\//.exec(file.slice(modesDirectory.length + 1))?.[1] ?? null) : null;

/** Pure check shared by the real graph and the negative control. */
function checkBoundaries(graph: Graph, roots: readonly string[], rules: BoundaryPolicy) {
  const byPath = new Map(graph.modules.map((m) => [m.path, m]));
  const violations: string[] = [];
  const typeOnlyEdges: string[] = [];
  const hits = new Set<string>();
  let examinedEdges = 0;
  const closureFiles = new Set<string>();
  for (const root of roots) {
    const owner = modeOf(root, rules.modesDirectory);
    const seen = new Set<string>();
    const stack = [root];
    while (stack.length) {
      const file = stack.pop()!;
      if (seen.has(file)) continue;
      seen.add(file);
      closureFiles.add(file);
      const mod = byPath.get(file);
      if (!mod) { violations.push(`${root}: ${file} is missing from the graph`); continue; }
      for (const edge of mod.edges) {
        examinedEdges += 1;
        if (rules.allowedShared[edge.to]) hits.add(edge.to);
        if (edge.typeOnly) { typeOnlyEdges.push(`${file} -> ${edge.to}`); continue; }
        const target = modeOf(edge.to, rules.modesDirectory);
        if (target !== null) {
          if (target !== owner) violations.push(`${root}: ${file} -> ${edge.to} enters another mode directory`);
          else stack.push(edge.to);
        } else if (rules.legacy.includes(edge.to)) {
          violations.push(`${root}: ${file} -> ${edge.to} is a runtime edge into a legacy module`);
        } else if (rules.allowedShared[edge.to]) {
          const extra = (edge.names ?? ["*"]).filter((n) => !rules.allowedShared[edge.to].exports.includes(n));
          if (extra.length) violations.push(`${root}: ${file} -> ${edge.to} imports undeclared exports ${extra.join(", ")}`);
          stack.push(edge.to);
        } else {
          violations.push(`${root}: ${file} -> ${edge.to} is not a declared shared module`);
        }
      }
    }
  }
  for (const pkg of graph.externalPackages) {
    if (!rules.allowedExternal.includes(pkg.name) && pkg.importedBy.some((f) => closureFiles.has(f))) {
      violations.push(`external package ${pkg.name} is not allowed (imported by ${pkg.importedBy.filter((f) => closureFiles.has(f)).join(", ")})`);
    }
  }
  return { violations, typeOnlyEdges, hits, examinedEdges };
}

const modeRoots = policy.modes
  .map((mode) => `${policy.modesDirectory}/${mode}/index.ts`)
  .filter((file) => fs.existsSync(file));

// Closure rules still check only these roots. The cutover roots (orchestrator, src/main.tsx) join the graph so the
// E5 reachability rules below can see the production entry (Decision #20).
const checkedRoots = [...modeRoots, ...policy.sharedRoots];
const ENTRY = "src/main.tsx";
const APP = "src/App.tsx";
const SHELL = "src/components/ReaderContainer.tsx";
let graphMemo: Graph | undefined;
const productionGraph = (): Graph =>
  (graphMemo ??= buildImportGraph({ roots: [...checkedRoots, ...policy.rootsAfterCutover], withNames: true }) as unknown as Graph);

/** Runtime (non-type-only) closure of `starts`; edges into `skipTo` are not followed. */
function runtimeClosure(graph: Graph, starts: readonly string[], skipTo?: string): Set<string> {
  const byPath = new Map(graph.modules.map((m) => [m.path, m]));
  const seen = new Set<string>();
  const stack = [...starts];
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file) || !byPath.has(file)) continue;
    seen.add(file);
    for (const edge of byPath.get(file)!.edges) if (!edge.typeOnly && edge.to !== skipTo) stack.push(edge.to);
  }
  return seen;
}

/** 6a: the shell's runtime closure meets the legacy list in exactly the declared shell infrastructure. */
function checkShellClosure(graph: Graph, legacy: readonly string[], declared: readonly string[]) {
  const reached = [...runtimeClosure(graph, [SHELL])].filter((f) => legacy.includes(f));
  const violations = [
    ...reached.filter((f) => !declared.includes(f)).map((f) => `${f} is a legacy module reached from ${SHELL} but is not declared shell infrastructure`),
    ...declared.filter((f) => !reached.includes(f)).map((f) => `${f} is declared shell infrastructure but ${SHELL} no longer reaches it`),
  ];
  return { violations, reached: reached.length };
}

/** 6b: the App.tsx standalone window is outside the shell; the only legacy files main reaches are shell + standalone. */
function checkStandaloneWindow(graph: Graph, legacy: readonly string[], standalone: readonly string[], declaredShell: readonly string[]) {
  const shell = runtimeClosure(graph, [SHELL]);
  const full = runtimeClosure(graph, [ENTRY]);
  const withoutApp = runtimeClosure(graph, [ENTRY], APP);
  const violations: string[] = [];
  for (const f of standalone) {
    if (shell.has(f)) violations.push(`${f} is in the runtime closure of ${SHELL}`);
    if (!full.has(f)) violations.push(`${f} is not reachable from ${ENTRY} (stale standalone-window entry)`);
    if (withoutApp.has(f)) violations.push(`${f} is reachable from ${ENTRY} without ${APP} on the path`);
  }
  for (const f of [...full].filter((x) => legacy.includes(x))) {
    if (!standalone.includes(f) && !declaredShell.includes(f)) violations.push(`${f} is a legacy module reachable from ${ENTRY} outside the shell and the standalone window`);
  }
  return { violations, examined: standalone.length };
}

/** 7: no dead view is reachable from the production entry (absent files are unreachable by construction). */
function checkDeadViews(graph: Graph, dead: readonly string[]) {
  const full = runtimeClosure(graph, [ENTRY]);
  return {
    violations: dead.filter((f) => full.has(f)).map((f) => `${f} is a dead view but is reachable from ${ENTRY}`),
    absent: dead.filter((f) => !fs.existsSync(f)).length,
  };
}

const walkFiles = (dir: string, pattern: RegExp): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = `${dir}/${e.name}`;
    return e.isDirectory() ? walkFiles(p, pattern) : pattern.test(e.name) ? [p] : [];
  });

/** Files whose import / @import line resolves to `target`. */
function importersOf(target: string, files: readonly string[]): string[] {
  return files.filter((f) =>
    fs.readFileSync(f, "utf8").split(/\r?\n/).some((line) => {
      const spec = /^\s*(?:import|@import)\b.*["']([^"']+)["']/.exec(line)?.[1];
      return !!spec && spec.startsWith(".") && path.posix.normalize(path.posix.join(path.posix.dirname(f), spec)) === target;
    }),
  );
}

/** Selectors and keyframe names of a stylesheet; @-rule blocks other than @keyframes are descended into. */
function cssRules(css: string): { selectors: string[]; keyframes: string[] } {
  const selectors: string[] = [];
  const keyframes: string[] = [];
  const stack: ("rule" | "keyframes" | "at")[] = [];
  let prelude = "";
  for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
    if (ch === "{") {
      const head = prelude.trim();
      if (head.startsWith("@")) {
        const name = /^@keyframes\s+([\w-]+)/.exec(head)?.[1];
        if (name) keyframes.push(name);
        stack.push(name ? "keyframes" : "at");
      } else {
        if (!stack.includes("keyframes")) {
          let depth = 0;
          let start = 0;
          for (let i = 0; i <= head.length; i += 1) {
            const c = head[i];
            if (c === "(" || c === "[") depth += 1;
            else if (c === ")" || c === "]") depth -= 1;
            else if ((c === "," && depth === 0) || i === head.length) { selectors.push(head.slice(start, i).trim()); start = i + 1; }
          }
        }
        stack.push("rule");
      }
      prelude = "";
    } else if (ch === "}") { stack.pop(); prelude = ""; }
    else if (ch === ";") prelude = "";
    else prelude += ch;
  }
  return { selectors, keyframes };
}

/** 5: mode.css is imported only by its own ModeView.tsx, scoped to .rm-<mode>-, and no global stylesheet uses rm-. */
function checkModeCss(mode: string, css: string, importers: readonly string[], globalSheets: Readonly<Record<string, string>>) {
  const violations: string[] = [];
  const own = `${policy.modesDirectory}/${mode}/ModeView.tsx`;
  for (const importer of importers) if (importer !== own) violations.push(`${mode}/mode.css is imported by ${importer}, not only ${own}`);
  if (!importers.includes(own)) violations.push(`${mode}/mode.css is not imported by ${own}`);
  // Theme-attribute ancestors ([data-…], :root[…], html[…]) may precede the mode-prefixed class.
  const scoped = new RegExp(`^(?::root|html)?(?:\\[data-[\\w-]+(?:=["'][^"']*["'])?\\]\\s+)*\\.rm-${mode}-[\\w-]+`);
  const { selectors, keyframes } = cssRules(css);
  for (const s of selectors) if (!scoped.test(s)) violations.push(`${mode}/mode.css selector \`${s}\` does not start with .rm-${mode}-`);
  for (const k of keyframes) if (!k.startsWith(`rm-${mode}-`)) violations.push(`${mode}/mode.css keyframes ${k} does not start with rm-${mode}-`);
  for (const [file, text] of Object.entries(globalSheets)) if (/(?<![\w-])rm-/.test(text)) violations.push(`${file} contains rm-`);
  return { violations, selectors: selectors.length };
}

describe("reader mode boundaries (G1)", () => {
  it("production mode graphs share only declared data and ports", () => {
    const roots = checkedRoots;
    const graph = productionGraph();
    expect(graph.modules.some((m) => m.path === ENTRY), "src/main.tsx is a graph root").toBe(true);
    const result = checkBoundaries(graph, roots, policy);

    // Not vacuous: real edges were classified even before any mode tree exists.
    expect(result.examinedEdges).toBeGreaterThan(0);
    expect(result.violations, `type-only edges (never failing): ${result.typeOnlyEdges.join("; ")}`).toEqual([]);

    const modeHits = checkBoundaries(graph, modeRoots, policy).hits;
    const unexercised = Object.keys(policy.allowedShared).filter((p) => !modeHits.has(p));
    // Partial set of mode trees (Waves B–D): allowances a later mode will use are reported as
    // unreachable, never as clean. Full coverage is enforced once every mode tree exists (D2 on F).
    if (modeRoots.length === policy.modes.length) {
      expect(unexercised, "allowances never exercised by a mode").toEqual([]);
    } else if (unexercised.length > 0) {
      console.info(`[G1] unreachable until all mode trees exist: ${unexercised.join(", ")}`);
    }
  });

  it("rejects sibling, legacy, undeclared-module, undeclared-export and external violations (negative control)", () => {
    const synthetic: Graph = {
      modules: [
        {
          path: "src/reader/modes/page/index.ts",
          edges: [
            { to: "src/reader/modes/page/ModeRuntime.ts", typeOnly: false, names: ["createPageRuntime"] },
            { to: "src/reader/modes/focus/ModeRuntime.ts", typeOnly: false, names: ["FocusMode"] },
            { to: "src/hooks/useNarration.ts", typeOnly: true, names: ["useNarration"] },
          ],
        },
        {
          path: "src/reader/modes/page/ModeRuntime.ts",
          edges: [
            { to: "src/hooks/useReaderMode.ts", typeOnly: false, names: ["useReaderMode"] },
            { to: "src/utils/somethingShared.ts", typeOnly: false, names: ["x"] },
            { to: "src/constants.ts", typeOnly: false, names: ["NOT_A_CONSTANT"] },
          ],
        },
        { path: "src/reader/modes/focus/ModeRuntime.ts", edges: [] },
        { path: "src/constants.ts", edges: [] },
      ],
      externalPackages: [{ name: "lodash", importedBy: ["src/reader/modes/page/ModeRuntime.ts"] }],
    };
    const { violations, typeOnlyEdges } = checkBoundaries(synthetic, ["src/reader/modes/page/index.ts"], policy);
    expect(violations).toEqual([
      "src/reader/modes/page/index.ts: src/reader/modes/page/index.ts -> src/reader/modes/focus/ModeRuntime.ts enters another mode directory",
      "src/reader/modes/page/index.ts: src/reader/modes/page/ModeRuntime.ts -> src/hooks/useReaderMode.ts is a runtime edge into a legacy module",
      "src/reader/modes/page/index.ts: src/reader/modes/page/ModeRuntime.ts -> src/utils/somethingShared.ts is not a declared shared module",
      "src/reader/modes/page/index.ts: src/reader/modes/page/ModeRuntime.ts -> src/constants.ts imports undeclared exports NOT_A_CONSTANT",
      "external package lodash is not allowed (imported by src/reader/modes/page/ModeRuntime.ts)",
    ]);
    expect(typeOnlyEdges).toEqual(["src/reader/modes/page/index.ts -> src/hooks/useNarration.ts"]);
  });

  it("shell closure: ReaderContainer reaches exactly the declared shell infrastructure among legacy modules (E5 6a)", () => {
    const declared = Object.keys(policy.shellInfrastructure);
    const { violations, reached } = checkShellClosure(productionGraph(), policy.legacy, declared);
    console.info(`[G1 6a] legacy modules reached from ${SHELL}: ${reached}; declared: ${declared.length}`);
    expect(reached).toBeGreaterThan(0);
    expect(violations).toEqual([]);
  });

  it("App.tsx standalone window: useReader, ReaderView and PausedTextView are outside the shell and reachable only through App.tsx (E5 6b)", () => {
    const { violations, examined } = checkStandaloneWindow(productionGraph(), policy.legacy, policy.appStandaloneWindow, Object.keys(policy.shellInfrastructure));
    console.info(`[G1 6b] standalone-window files examined: ${examined}`);
    expect(examined).toBe(policy.appStandaloneWindow.length);
    expect(violations).toEqual([]);
  });

  it("dead views are unreachable from src/main.tsx (E5 7)", () => {
    const { violations, absent } = checkDeadViews(productionGraph(), policy.deadViews);
    console.info(`[G1 7] dead views examined: ${policy.deadViews.length} (${absent} already deleted, ${policy.deadViews.length - absent} still on disk)`);
    expect(policy.deadViews.length).toBeGreaterThan(0);
    expect(violations).toEqual([]);
  });

  it("mode.css is private to its ModeView, scoped to .rm-<mode>-, and absent from global stylesheets (E5 5)", () => {
    const srcFiles = walkFiles("src", /\.(tsx?|css)$/);
    const globalSheets = Object.fromEntries(walkFiles("src/styles", /\.css$/).map((f) => [f, fs.readFileSync(f, "utf8")]));
    let selectors = 0;
    for (const mode of policy.modes) {
      const cssPath = `${policy.modesDirectory}/${mode}/mode.css`;
      expect(fs.existsSync(cssPath), `${cssPath} exists`).toBe(true);
      const result = checkModeCss(mode, fs.readFileSync(cssPath, "utf8"), importersOf(cssPath, srcFiles), globalSheets);
      selectors += result.selectors;
      expect(result.violations).toEqual([]);
    }
    console.info(`[G1 5] selectors examined: ${selectors}; global stylesheets scanned: ${Object.keys(globalSheets).length}`);
    expect(selectors).toBeGreaterThan(0);
    expect(Object.keys(globalSheets).length).toBeGreaterThan(0);
  });

  it("rejects shell-closure, standalone-window, dead-view and CSS violations (negative control, E5)", () => {
    const mod = (p: string, ...to: string[]) => ({ path: p, edges: to.map((t) => ({ to: t, typeOnly: false })) });
    const NARRATION = "src/hooks/useNarration.ts";
    const READER = "src/hooks/useReader.ts";
    const FOLIATE_SYNC = "src/hooks/useFoliateSync.ts";
    const VIEW = "src/components/ReaderView.tsx";
    const DEAD = "src/components/PageReaderView.tsx";
    const declared = [SHELL, NARRATION];
    const legacy = [...declared, FOLIATE_SYNC, READER, VIEW, DEAD];
    const graph = (...modules: ReturnType<typeof mod>[]): Graph => ({ modules, externalPackages: [] });
    const ok = graph(mod(ENTRY, APP), mod(APP, SHELL, READER), mod(SHELL, NARRATION), mod(NARRATION), mod(READER));
    // The unchanged synthetic graph is clean, so each failure below is caused by its one change.
    expect(checkShellClosure(ok, legacy, declared).violations).toEqual([]);
    expect(checkStandaloneWindow(ok, legacy, [READER], declared).violations).toEqual([]);
    expect(checkDeadViews(ok, [DEAD]).violations).toEqual([]);

    // 6a: an extra legacy file in the shell closure; a declared file the shell no longer reaches.
    const extra = graph(mod(ENTRY, APP), mod(APP, SHELL, READER), mod(SHELL, NARRATION, FOLIATE_SYNC), mod(NARRATION), mod(READER), mod(FOLIATE_SYNC));
    expect(checkShellClosure(extra, legacy, declared).violations).toEqual([
      `${FOLIATE_SYNC} is a legacy module reached from ${SHELL} but is not declared shell infrastructure`,
    ]);
    const missing = graph(mod(ENTRY, APP), mod(APP, SHELL, READER), mod(SHELL), mod(NARRATION), mod(READER));
    expect(checkShellClosure(missing, legacy, declared).violations).toEqual([
      `${NARRATION} is declared shell infrastructure but ${SHELL} no longer reaches it`,
    ]);

    // 6b: useReader reachable from the shell, and from main without App.tsx.
    const leaked = graph(mod(ENTRY, APP, READER), mod(APP, SHELL, READER), mod(SHELL, NARRATION, READER), mod(NARRATION), mod(READER));
    expect(checkStandaloneWindow(leaked, legacy, [READER], declared).violations).toEqual([
      `${READER} is in the runtime closure of ${SHELL}`,
      `${READER} is reachable from ${ENTRY} without ${APP} on the path`,
    ]);
    // 6b: a legacy file reachable from main that is neither shell nor standalone window.
    const stray = graph(mod(ENTRY, APP), mod(APP, SHELL, READER, VIEW), mod(SHELL, NARRATION), mod(NARRATION), mod(READER), mod(VIEW));
    expect(checkStandaloneWindow(stray, legacy, [READER], declared).violations).toEqual([
      `${VIEW} is a legacy module reachable from ${ENTRY} outside the shell and the standalone window`,
    ]);

    // 7: a dead view reachable by a runtime edge; a type-only edge does not count; absent files are fine.
    const dead = graph(mod(ENTRY, APP), mod(APP, SHELL, DEAD), mod(SHELL), mod(DEAD));
    expect(checkDeadViews(dead, [DEAD, "src/components/gone.tsx"]).violations).toEqual([`${DEAD} is a dead view but is reachable from ${ENTRY}`]);
    const typeOnly = graph(mod(ENTRY, APP), { path: APP, edges: [{ to: DEAD, typeOnly: true }, { to: SHELL, typeOnly: false }] }, mod(SHELL), mod(DEAD));
    expect(checkDeadViews(typeOnly, [DEAD]).violations).toEqual([]);

    // 5: second importer, unscoped and foreign-prefix selectors, foreign keyframes, rm- in a global sheet
    // (and `confirm-` in a global sheet is not a false positive).
    const css = [
      ".rm-page-root { color: red; }",
      '[data-theme="eink"] .rm-page-root .rm-page-word, :root[data-eink="true"] .rm-page-x { color: black; }',
      "@media (max-width: 600px) { .rm-page-a { top: 0; } .plain-class { top: 0; } }",
      "@keyframes rm-page-pulse { from { opacity: 0; } to { opacity: 1; } }",
      "@keyframes pulse { 0% { opacity: 0; } }",
      ".rm-focus-root { color: blue; }",
      ".leak { color: green; }",
    ].join("\n");
    expect(
      checkModeCss("page", css, ["src/reader/modes/page/ModeView.tsx", "src/reader/modes/focus/ModeView.tsx"], {
        "src/styles/base.css": ".delete-confirm-yes {}",
        "src/styles/x.css": ".rm-page-root {}",
      }).violations,
    ).toEqual([
      "page/mode.css is imported by src/reader/modes/focus/ModeView.tsx, not only src/reader/modes/page/ModeView.tsx",
      "page/mode.css selector `.plain-class` does not start with .rm-page-",
      "page/mode.css selector `.rm-focus-root` does not start with .rm-page-",
      "page/mode.css selector `.leak` does not start with .rm-page-",
      "page/mode.css keyframes pulse does not start with rm-page-",
      "src/styles/x.css contains rm-",
    ]);
    expect(checkModeCss("page", ".rm-page-a{}", [], {}).violations).toEqual(["page/mode.css is not imported by src/reader/modes/page/ModeView.tsx"]);
  });
});
