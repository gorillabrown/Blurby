// READER-MODE-SEPARATION-2 G1 — dependency boundaries.
// Reuses the Wave A census (buildImportGraph: installed TypeScript resolver + runtime/type-only edge
// classifier) and census/boundary-policy.json. Roots: every existing src/reader/modes/<mode>/index.ts
// plus the policy's shared contract/port/broker roots.
import fs from "node:fs";
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

describe("reader mode boundaries (G1)", () => {
  it("production mode graphs share only declared data and ports", () => {
    const roots = [...modeRoots, ...policy.sharedRoots];
    const graph = buildImportGraph({ roots, withNames: true }) as unknown as Graph;
    const result = checkBoundaries(graph, roots, policy);

    // Not vacuous: real edges were classified even before any mode tree exists.
    expect(result.examinedEdges).toBeGreaterThan(0);
    expect(result.violations, `type-only edges (never failing): ${result.typeOnlyEdges.join("; ")}`).toEqual([]);

    if (modeRoots.length === 0) {
      // No mode tree yet: allowance coverage is recorded as unreachable, never as clean.
      const unreachable = Object.keys(policy.allowedShared).filter((p) => !result.hits.has(p));
      expect(unreachable.length).toBeGreaterThan(0);
    } else {
      const modeHits = checkBoundaries(graph, modeRoots, policy).hits;
      expect(Object.keys(policy.allowedShared).filter((p) => !modeHits.has(p)), "allowances never exercised by a mode").toEqual([]);
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
});
