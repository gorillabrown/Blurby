// @vitest-environment jsdom
// (the mode views touch window at module load; the static checks are unaffected)
// READER-MODE-SEPARATION-2 G1 — mutable-resource ownership.
// Reuses the Wave A census extractor (extractResources) and census/boundary-policy.json.
// Static (post-cutover, E5): every file under src/reader/** except the explicitly listed legacy-retained
// files, plus the shell files (src/components/ReaderContainer.tsx and the orchestrator). Mode directories hold
// mode-owned resources, shell files hold shell-owned ones, shared value files hold none, the broker holds
// declared infrastructure. Q-E: per-mode census resources live in a private copy in every listed mode.
// Dynamic: sessions issued in turn through the broker (only the active key's calls reach infrastructure), and
// four runtimes created from one handoff and one settings object share no mutable object identity.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { extractResources } from "../docs/planning/roadmap-reviews/reader-mode-separation-2/census/resource-census.mjs";
import policy from "../docs/planning/roadmap-reviews/reader-mode-separation-2/census/boundary-policy.json";
import ownership from "../docs/planning/roadmap-reviews/reader-mode-separation-2/ownership.json";
import type { ReaderModeModule } from "../src/reader/modes/ReaderModeAdapter";
import { createInitialHandoff } from "../src/reader/document/ReaderDocumentSnapshot";
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
  readonly shellFiles: readonly string[];
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
    } else if (rules.shellFiles.includes(r.file)) {
      owners.set(ownerKey(r), "shell");
      if (r.kind === "module-let" || r.kind === "module-mutable-literal") violations.push(`${resourceId(r)}: module-level mutable state in a shell file`);
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

const READER_DIR = "src/reader";
const legacyRetained = policy.legacyRetainedFiles.map((e) => e.file);
const readerFiles = listFiles(READER_DIR);
// Post-separation scope: everything under src/reader/** (minus the explicit legacy-retained list) plus the shell files.
const ownershipScope = [...new Set([...policy.shellFiles, ...readerFiles.filter((f) => !legacyRetained.includes(f))])];

const norm = (s: string) => s.replace(/\r\n/g, "\n");
interface PerModeResource { readonly file: string; readonly kind: string; readonly symbol: string; readonly anchor: string; readonly privateCopiesFor: readonly string[] }

/** Q-E: each per-mode resource's verbatim anchor appears in a file of every listed mode directory and in no shared file. */
function checkPerModeCopies(resources: readonly PerModeResource[], modeTexts: Readonly<Record<string, readonly string[]>>, sharedTexts: Readonly<Record<string, string>>) {
  const missing: string[] = [];
  const inShared: string[] = [];
  for (const r of resources) {
    const anchor = norm(r.anchor);
    const id = `${r.file} ${r.kind} ${r.symbol}`;
    for (const mode of r.privateCopiesFor) {
      if (!(modeTexts[mode] ?? []).some((text) => norm(text).includes(anchor))) missing.push(`${id}: anchor not found in ${mode} :: ${anchor}`);
    }
    for (const [file, text] of Object.entries(sharedTexts)) if (norm(text).includes(anchor)) inShared.push(`${id}: anchor found in shared file ${file}`);
  }
  return { missing, inShared };
}

// Q-E presence half: the explicit private-copy map (boundary-policy.json privateCopyMap), one entry per
// (per-mode census resource, privateCopiesFor mode) pair.
const COPY_REASONS = ["dead-OC-9", "dead-design-B5", "cross-owner-removed-Q-F", "not-used-by-mode"] as const;
interface PrivateCopyEntry {
  readonly resourceId: string;
  readonly occurrence?: number;
  readonly mode: string;
  readonly copy?: { readonly file: string; readonly anchor: string };
  readonly notCopied?: { readonly reason: string; readonly cite: string };
}
/** Census resources can share an id (two ResizeObservers in one function): the ordinal among equal ids disambiguates. */
const pairKey = (id: string, occurrence: number, mode: string) => `${id}#${occurrence} | ${mode}`;

function expectedCopyPairs(resources: readonly PerModeResource[]): string[] {
  const seen = new Map<string, number>();
  const keys: string[] = [];
  for (const r of resources) {
    const id = resourceId(r as unknown as Resource);
    const occurrence = seen.get(id) ?? 0;
    seen.set(id, occurrence + 1);
    for (const mode of r.privateCopiesFor) keys.push(pairKey(id, occurrence, mode));
  }
  return keys;
}

/** Pure check shared by the real map and the negative control: coverage, copy presence and notCopied validity. */
function checkPrivateCopyMap(expected: readonly string[], map: readonly PrivateCopyEntry[], readText: (file: string) => string | null) {
  const problems: string[] = [];
  const have = new Map<string, number>();
  for (const e of map) {
    const key = pairKey(e.resourceId, e.occurrence ?? 0, e.mode);
    have.set(key, (have.get(key) ?? 0) + 1);
    if (!!e.copy === !!e.notCopied) problems.push(`${key}: exactly one of copy / notCopied is required`);
    if (e.copy) {
      if (!e.copy.file.startsWith(`${policy.modesDirectory}/${e.mode}/`)) problems.push(`${key}: copy file ${e.copy.file} is not inside ${policy.modesDirectory}/${e.mode}/`);
      const text = readText(e.copy.file);
      const anchor = e.copy.anchor;
      if (anchor === "" || anchor !== anchor.trim() || anchor.includes("\n")) problems.push(`${key}: anchor must be one non-empty trimmed line`);
      else if (text === null || !norm(text).split("\n").some((line) => line.trim() === anchor)) problems.push(`${key}: anchor not found in ${e.copy.file} :: ${anchor}`);
    }
    if (e.notCopied) {
      if (!(COPY_REASONS as readonly string[]).includes(e.notCopied.reason)) problems.push(`${key}: bad notCopied reason ${e.notCopied.reason}`);
      if (e.notCopied.cite.trim().length === 0) problems.push(`${key}: notCopied cite is empty`);
    }
  }
  for (const key of expected) if (!have.has(key)) problems.push(`${key}: missing from privateCopyMap`);
  const want = new Set(expected);
  for (const [key, n] of have) {
    if (!want.has(key)) problems.push(`${key}: extra entry (not a per-mode resource / privateCopiesFor mode)`);
    if (n > 1) problems.push(`${key}: duplicate entry (${n})`);
  }
  return problems;
}

/** Dynamic identity: every non-frozen object reachable from `root` (own props incl. non-enumerable, Map/Set entries, arrays). */
function mutableIdentities(root: unknown): Set<object> {
  const found = new Set<object>();
  const visited = new WeakSet<object>();
  const stack: unknown[] = [root];
  while (stack.length) {
    const value = stack.pop();
    // Functions' closures are not walkable; primitives carry no identity.
    if (typeof value !== "object" || value === null || visited.has(value)) continue;
    visited.add(value);
    // Frozen objects are never recorded (deep-frozen values may be shared) but are still descended: a
    // shallow-frozen holder must not hide a mutable child.
    if (!Object.isFrozen(value)) found.add(value);
    if (value instanceof Map) for (const [k, v] of value) stack.push(k, v);
    else if (value instanceof Set) for (const v of value) stack.push(v);
    for (const key of Reflect.ownKeys(value)) {
      const desc = Object.getOwnPropertyDescriptor(value, key);
      if (desc && "value" in desc) stack.push(desc.value); // never invoke getters
    }
  }
  return found;
}

/** Pairs of graph labels that share at least one non-frozen object identity. */
function sharedIdentityPairs(graphs: Readonly<Record<string, Set<object>>>): string[] {
  const labels = Object.keys(graphs);
  const out: string[] = [];
  for (let i = 0; i < labels.length; i += 1) {
    for (let j = i + 1; j < labels.length; j += 1) {
      const shared = [...graphs[labels[i]]].filter((o) => graphs[labels[j]].has(o)).length;
      if (shared > 0) out.push(`${labels[i]} / ${labels[j]}: ${shared} shared`);
    }
  }
  return out;
}

describe("reader mode ownership (G1)", () => {
  it("every mutable resource has one active owner", () => {
    const scope = ownershipScope;
    const resources: Resource[] = scope.flatMap((file) => extractResources(file));
    const { violations, owners } = checkOwnership(resources, policy);

    // Not vacuous: every scoped file was parsed and real resources were classified, per owner class.
    expect(scope.every((file) => fs.existsSync(path.resolve(file)))).toBe(true);
    expect(policy.modes.every((mode) => fs.existsSync(`${policy.modesDirectory}/${mode}/index.ts`))).toBe(true);
    expect([...policy.shellFiles, ...policy.sharedValueFiles, ...policy.infrastructureFiles].every((file) => scope.includes(file))).toBe(true);
    // Legacy-retained files are excluded explicitly, never silently: each exists under src/reader/** with a reason.
    expect(policy.legacyRetainedFiles.length).toBeGreaterThan(0);
    for (const entry of policy.legacyRetainedFiles) {
      expect(readerFiles, `${entry.file} is a src/reader file`).toContain(entry.file);
      expect(entry.reason.length, `${entry.file} has a reason`).toBeGreaterThan(0);
      expect(scope).not.toContain(entry.file);
    }
    const byOwner: Record<string, number> = {};
    for (const owner of owners.values()) byOwner[owner] = (byOwner[owner] ?? 0) + 1;
    console.info(`[G1 ownership] files in scope: ${scope.length}; resources: ${resources.length}; by owner: ${JSON.stringify(byOwner)}`);
    expect(resources.length).toBeGreaterThan(0);
    for (const owner of ["page", "focus", "flow", "narrate", "shell", "infrastructure"]) expect(byOwner[owner], `resources owned by ${owner}`).toBeGreaterThan(0);
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

  it("shell resources are owned by the shell and may not be module-level mutable state (negative control)", () => {
    const shell = policy.shellFiles[0];
    const synthetic: Resource[] = [
      { file: shell, kind: "useRef", symbol: "docRef", enclosing: "Shell" },
      { file: shell, kind: "setTimeout", symbol: "timerRef.current", enclosing: "Shell" },
      { file: shell, kind: "module-let", symbol: "current", enclosing: "<module>" },
      { file: shell, kind: "module-mutable-literal", symbol: "cache", enclosing: "<module>" },
    ];
    const { violations, owners } = checkOwnership(synthetic, policy);
    expect([...owners.values()]).toEqual(["shell", "shell", "shell", "shell"]);
    expect(violations.filter((v) => !v.includes("declared infrastructure resource not found"))).toEqual([
      `${shell} module-let current @<module>: module-level mutable state in a shell file`,
      `${shell} module-mutable-literal cache @<module>: module-level mutable state in a shell file`,
    ]);
  });

  it("per-mode census resources are not text-present in shared files (Q-E, shared half)", () => {
    const perMode = (ownership.resources as readonly (PerModeResource & { readonly proposedOwner: string })[]).filter((r) => r.proposedOwner === "per-mode");
    const modeTexts = Object.fromEntries(
      policy.modes.map((mode) => [mode, listFiles(`${policy.modesDirectory}/${mode}`).map((f) => fs.readFileSync(f, "utf8"))]),
    );
    const sharedTexts = Object.fromEntries([...policy.sharedValueFiles, ...policy.infrastructureFiles].map((f) => [f, fs.readFileSync(f, "utf8")]));
    const { missing, inShared } = checkPerModeCopies(perMode, modeTexts, sharedTexts);
    const pairs = perMode.reduce((n, r) => n + r.privateCopiesFor.length, 0);
    console.info(`[G1 Q-E] per-mode resources examined: ${perMode.length}; (resource, mode) pairs: ${pairs}; census anchors not verbatim in a mode copy: ${missing.length} (informational, the copies were rewritten: presence is asserted through privateCopyMap); anchors in shared files: ${inShared.length}`);
    expect(perMode.length).toBeGreaterThan(0);
    expect(pairs).toBeGreaterThan(0);
    expect(inShared).toEqual([]);
  });

  it("every (per-mode resource, mode) pair has an explicit private copy in that mode or a justified notCopied (Q-E, presence half)", () => {
    const perMode = (ownership.resources as readonly (PerModeResource & { readonly proposedOwner: string })[]).filter((r) => r.proposedOwner === "per-mode");
    const map = (policy as unknown as { privateCopyMap: readonly PrivateCopyEntry[] }).privateCopyMap;
    const expected = expectedCopyPairs(perMode);
    const problems = checkPrivateCopyMap(expected, map, (file) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null));
    expect(expected.length).toBeGreaterThan(0);
    expect(map.length).toBe(expected.length);
    expect(problems).toEqual([]);

    // No copy anchor appears in any shared value / infrastructure file.
    const shared = [...policy.sharedValueFiles, ...policy.infrastructureFiles].map((f) => [f, norm(fs.readFileSync(f, "utf8"))] as const);
    const leaked = map.flatMap((e) => (e.copy ? shared.filter(([, text]) => text.includes(e.copy!.anchor)).map(([f]) => `${e.resourceId} | ${e.mode}: anchor in shared file ${f} :: ${e.copy!.anchor}`) : []));
    expect(leaked).toEqual([]);

    const copied = map.filter((e) => e.copy);
    const notCopied = map.filter((e) => e.notCopied);
    const byReason: Record<string, number> = {};
    for (const e of notCopied) byReason[e.notCopied!.reason] = (byReason[e.notCopied!.reason] ?? 0) + 1;
    const byMode: Record<string, { copied: number; notCopied: number }> = {};
    for (const e of map) {
      byMode[e.mode] ??= { copied: 0, notCopied: 0 };
      byMode[e.mode][e.copy ? "copied" : "notCopied"] += 1;
    }
    console.info(`[G1 Q-E] privateCopyMap: ${map.length} pairs; copied ${copied.length}; notCopied ${notCopied.length} by reason ${JSON.stringify(byReason)}; by mode ${JSON.stringify(byMode)}`);
    expect(copied.length + notCopied.length).toBe(expected.length);
    expect(copied.length).toBeGreaterThan(0);
  });

  it("detects a missing pair, an absent anchor, a wrong-mode file, a bad reason, an extra and a duplicate entry (negative control, Q-E presence)", () => {
    const dir = (m: string) => `${policy.modesDirectory}/${m}`;
    const texts: Record<string, string> = { [`${dir("page")}/A.ts`]: "x\r\n  const aRef = useRef(0);\r\ny", [`${dir("focus")}/A.ts`]: "const bRef = useRef(0);" };
    const read = (f: string) => texts[f] ?? null;
    const expected = ["r#0 | page", "r#0 | focus", "r#0 | flow"];
    const good: PrivateCopyEntry = { resourceId: "r", mode: "page", copy: { file: `${dir("page")}/A.ts`, anchor: "const aRef = useRef(0);" } };
    expect(checkPrivateCopyMap(expected, [good, { resourceId: "r", mode: "focus", notCopied: { reason: "not-used-by-mode", cite: "B0 condition" } }, { resourceId: "r", mode: "flow", notCopied: { reason: "dead-OC-9", cite: "x" } }], read)).toEqual([]);
    expect(checkPrivateCopyMap(expected, [good], read)).toEqual(["r#0 | focus: missing from privateCopyMap", "r#0 | flow: missing from privateCopyMap"]);
    expect(checkPrivateCopyMap(["r#0 | focus"], [{ resourceId: "r", mode: "focus", copy: { file: `${dir("focus")}/A.ts`, anchor: "const aRef = useRef(0);" } }], read)).toEqual([
      `r#0 | focus: anchor not found in ${dir("focus")}/A.ts :: const aRef = useRef(0);`,
    ]);
    expect(checkPrivateCopyMap(["r#0 | focus"], [{ resourceId: "r", mode: "focus", copy: { file: `${dir("page")}/A.ts`, anchor: "const aRef = useRef(0);" } }], read)).toEqual([
      `r#0 | focus: copy file ${dir("page")}/A.ts is not inside ${dir("focus")}/`,
    ]);
    expect(checkPrivateCopyMap(["r#0 | focus"], [{ resourceId: "r", mode: "focus", notCopied: { reason: "because", cite: " " } }], read)).toEqual([
      "r#0 | focus: bad notCopied reason because",
      "r#0 | focus: notCopied cite is empty",
    ]);
    expect(checkPrivateCopyMap(["r#0 | page"], [good, good, { resourceId: "other", mode: "page", notCopied: { reason: "not-used-by-mode", cite: "c" } }], read)).toEqual([
      "r#0 | page: duplicate entry (2)",
      "other#0 | page: extra entry (not a per-mode resource / privateCopiesFor mode)",
    ]);
  });

  it("detects a missing private copy and a private resource leaked into a shared file (negative control, Q-E)", () => {
    const resource: PerModeResource = { file: "src/components/X.tsx", kind: "useRef", symbol: "aRef", anchor: "const aRef = useRef(0);", privateCopiesFor: ["page", "focus"] };
    expect(checkPerModeCopies([resource], { page: ["const aRef = useRef(0);\r\n"], focus: ["const bRef = useRef(0);"] }, { "src/shared.ts": "const aRef = useRef(0);" })).toEqual({
      missing: ["src/components/X.tsx useRef aRef: anchor not found in focus :: const aRef = useRef(0);"],
      inShared: ["src/components/X.tsx useRef aRef: anchor found in shared file src/shared.ts"],
    });
    expect(checkPerModeCopies([resource], { page: ["const aRef = useRef(0);"], focus: ["x const aRef = useRef(0); y"] }, {})).toEqual({ missing: [], inShared: [] });
  });

  it("four runtimes created from one handoff and one settings object share no mutable object identity (dynamic)", async () => {
    const fake = createFakeInfrastructure();
    const broker = createReaderPorts(fake.infra);
    const document = fake.infra.document.snapshot();
    const settings = fake.infra.settings.read();
    const handoff = createInitialHandoff(document, document.wordCount);
    broker.openDocument(document.documentId);
    // Each mode is imported only through its index.ts.
    const modules: Record<string, ReaderModeModule> = {
      page: (await import("../src/reader/modes/page/index")).pageMode,
      focus: (await import("../src/reader/modes/focus/index")).focusMode,
      flow: (await import("../src/reader/modes/flow/index")).flowMode,
      narrate: (await import("../src/reader/modes/narrate/index")).narrateMode,
    };
    const graphs: Record<string, Set<object>> = {};
    let previous: ReaderSessionKey | null = null;
    for (const mode of ["page", "focus", "flow", "narrate"] as ReaderModeId[]) {
      // The broker admits one active session; the earlier runtime objects stay alive and inspectable.
      if (previous) broker.invalidate(previous);
      const { key, ports } = broker.issue(mode);
      previous = key;
      const runtime = modules[mode].createRuntime({ key, ports, document, settings, handoff, arrival: "silent" });
      graphs[mode] = mutableIdentities(runtime);
    }
    console.info(`[G1 identity] non-frozen objects per runtime: ${JSON.stringify(Object.fromEntries(Object.entries(graphs).map(([m, g]) => [m, g.size])))}`);
    for (const [mode, graph] of Object.entries(graphs)) expect(graph.size, `${mode} runtime graph is non-empty`).toBeGreaterThan(0);
    expect(sharedIdentityPairs(graphs)).toEqual([]);
  });

  it("detects a mutable object shared between two runtime graphs (negative control, dynamic)", () => {
    const sharedMutable = { count: 0 };
    const sharedFrozen = Object.freeze({ count: 0 });
    const a = { map: new Map([["k", { inner: [sharedMutable] }]]), frozen: sharedFrozen, fn: () => sharedMutable };
    const b = Object.defineProperty({ set: new Set([{ deep: { other: 1 } }]), frozen: sharedFrozen, fn: () => sharedMutable }, "hidden", { value: [sharedMutable], enumerable: false });
    const c = { own: { count: 0 }, frozen: sharedFrozen, cycle: null as unknown };
    c.cycle = c;
    // Shared through a Map entry in one graph and a non-enumerable property in the other; frozen sharing, closures and cycles are fine.
    expect(sharedIdentityPairs({ a: mutableIdentities(a), b: mutableIdentities(b), c: mutableIdentities(c) })).toEqual(["a / b: 1 shared"]);
    // A shared object reachable only through a closure is not walkable, so nothing is reported.
    expect(sharedIdentityPairs({ a: mutableIdentities({ fn: a.fn }), b: mutableIdentities({ fn: b.fn }) })).toEqual([]);
    // A shallow-frozen holder does not hide a shared mutable child.
    expect(sharedIdentityPairs({ a: mutableIdentities(Object.freeze({ child: sharedMutable })), b: mutableIdentities({ child: sharedMutable }) })).toEqual(["a / b: 1 shared"]);
  });
});
