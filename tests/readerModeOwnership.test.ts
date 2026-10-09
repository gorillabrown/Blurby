// READER-MODE-SEPARATION-2 G1 — mutable-resource ownership.
// Reuses the Wave A census extractor (extractResources) and census/boundary-policy.json.
// Static: every file under src/reader/modes/<mode>/ (only modes whose index.ts exists), the shared value
// files and the broker. Dynamic: sessions issued in turn through the broker; only the active key's
// calls reach infrastructure.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractResources } from "../docs/planning/roadmap-reviews/reader-mode-separation-2/census/resource-census.mjs";
import policy from "../docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json";
import { createReaderPorts } from "../src/reader/ports/createReaderPorts";
import type { ReaderModeId } from "../src/reader/modes/ReaderModeAdapter";
import type { ReaderPorts } from "../src/reader/ports/ReaderPorts";
import type { ReaderSessionKey } from "../src/reader/document/ReaderDocumentSnapshot";
import { createFakeInfrastructure } from "./readerModes/harness/fakePorts";

interface Resource { readonly file: string; readonly kind: string; readonly symbol: string; readonly enclosing: string }
interface OwnershipPolicy {
  readonly modesDirectory: string;
  readonly sharedValueFiles: readonly string[];
  readonly infrastructureFiles: readonly string[];
  readonly infrastructureResources: readonly Resource[];
  readonly allowedModuleSingletons: readonly { readonly file: string; readonly symbol: string }[];
}

const resourceId = (r: Resource) => `${r.file} ${r.kind} ${r.symbol} @${r.enclosing}`;
// Owner-map identity also carries the verbatim anchor: one function can hold two distinct
// resources with the same symbol (e.g. two ResizeObservers both named `observer`).
const ownerKey = (r: Resource) => {
  const x = r as Resource & { anchor?: string; anchorOccurrence?: number };
  return `${resourceId(r)} :: ${x.anchor ?? ""} #${x.anchorOccurrence ?? 0}`; // census identity: anchor + occurrence
};

/** Pure check shared by the real census and the negative control. */
function checkOwnership(resources: readonly Resource[], rules: OwnershipPolicy) {
  const violations: string[] = [];
  const owners = new Map<string, string>();
  for (const r of resources) {
    const modeDir = r.file.startsWith(`${rules.modesDirectory}/`) ? r.file.slice(rules.modesDirectory.length + 1).split("/") : [];
    if (modeDir.length > 1) {
      owners.set(ownerKey(r), modeDir[0]);
      if (r.kind === "module-let" || r.kind === "module-mutable-literal") violations.push(`${resourceId(r)}: module-level mutable state in a mode directory`);
      if (r.kind === "module-singleton" && !rules.allowedModuleSingletons.some((s) => s.file === r.file && s.symbol === r.symbol)) {
        violations.push(`${resourceId(r)}: undeclared module singleton in a mode directory`);
      }
    } else if (rules.sharedValueFiles.includes(r.file)) {
      violations.push(`${resourceId(r)}: shared value files hold no mutable resources`);
    } else if (rules.infrastructureFiles.includes(r.file)) {
      owners.set(ownerKey(r), "infrastructure");
      if (r.kind.startsWith("module-")) violations.push(`${resourceId(r)}: module-level state in infrastructure`);
      if (!rules.infrastructureResources.some((d) => resourceId(d) === resourceId(r))) violations.push(`${resourceId(r)}: undeclared infrastructure resource`);
    } else {
      violations.push(`${resourceId(r)}: outside the G1 ownership scope`);
    }
  }
  const found = new Set(resources.map(resourceId));
  for (const d of rules.infrastructureResources) {
    if (!found.has(resourceId(d))) violations.push(`${resourceId(d)}: declared infrastructure resource not found`);
  }
  return { violations, owners };
}

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = `${dir}/${e.name}`;
    return e.isDirectory() ? listFiles(p) : /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

const modeFiles = policy.modes
  .filter((mode) => fs.existsSync(`${policy.modesDirectory}/${mode}/index.ts`))
  .flatMap((mode) => listFiles(`${policy.modesDirectory}/${mode}`));

describe("reader mode ownership (G1)", () => {
  it("every mutable resource has one active owner", () => {
    const scope = [...modeFiles, ...policy.sharedValueFiles, ...policy.infrastructureFiles];
    const resources: Resource[] = scope.flatMap((file) => extractResources(file));
    const { violations, owners } = checkOwnership(resources, policy);

    // Not vacuous: every scoped file was parsed and real resources were classified.
    expect(scope.every((file) => fs.existsSync(path.resolve(file)))).toBe(true);
    expect(resources.length).toBeGreaterThan(0);
    expect(violations).toEqual([]);
    expect(owners.size).toBe(resources.length);

    // Dynamic: issue every mode in turn; earlier sessions' ports cannot reach infrastructure.
    const fake = createFakeInfrastructure();
    const broker = createReaderPorts(fake.infra);
    broker.openDocument("doc-1");
    const issued: { mode: ReaderModeId; key: ReaderSessionKey; ports: ReaderPorts }[] = [];
    for (const mode of ["page", "focus", "flow", "narrate"] as ReaderModeId[]) {
      const previous = issued.at(-1);
      if (previous) {
        broker.invalidate(previous.key);
        broker.teardown(previous.key, () => {});
      }
      issued.push({ mode, ...broker.issue(mode) });
      for (const { mode: owner, ports: p } of issued) p.persistence.updateProgress("doc-1", owner.length);
    }
    expect(fake.effects.map((c) => c.args[1])).toEqual(["page", "focus", "flow", "narrate"].map((m) => m.length));
    expect(broker.stats.rejected["persistence.updateProgress"]).toBe(1 + 2 + 3);
  });

  it("rejects resources in shared files, module state in modes and undeclared infrastructure (negative control)", () => {
    const synthetic: Resource[] = [
      { file: "src/reader/document/ReaderDocumentSnapshot.ts", kind: "useRef", symbol: "anchorRef", enclosing: "useAnchor" },
      { file: "src/reader/modes/page/ModeState.ts", kind: "module-let", symbol: "current", enclosing: "<module>" },
      { file: "src/reader/modes/focus/helpers/synthetic.ts", kind: "module-singleton", symbol: "SYNTHETIC_UNDECLARED", enclosing: "<module>" },
      { file: "src/reader/ports/createReaderPorts.ts", kind: "setTimeout", symbol: "(unassigned)", enclosing: "createReaderPorts" },
      { file: "src/hooks/useReaderMode.ts", kind: "useRef", symbol: "modeRef", enclosing: "useReaderMode" },
    ];
    const { violations } = checkOwnership(synthetic, policy);
    expect(violations).toEqual([
      "src/reader/document/ReaderDocumentSnapshot.ts useRef anchorRef @useAnchor: shared value files hold no mutable resources",
      "src/reader/modes/page/ModeState.ts module-let current @<module>: module-level mutable state in a mode directory",
      "src/reader/modes/focus/helpers/synthetic.ts module-singleton SYNTHETIC_UNDECLARED @<module>: undeclared module singleton in a mode directory",
      "src/reader/ports/createReaderPorts.ts setTimeout (unassigned) @createReaderPorts: undeclared infrastructure resource",
      "src/hooks/useReaderMode.ts useRef modeRef @useReaderMode: outside the G1 ownership scope",
      "src/reader/ports/createReaderPorts.ts class-field method @ReaderPortAccessError>constructor: declared infrastructure resource not found",
      "src/reader/ports/createReaderPorts.ts class-field mode @ReaderPortAccessError>constructor: declared infrastructure resource not found",
    ]);
  });
});
