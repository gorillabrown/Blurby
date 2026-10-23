import { describe, it, expect, beforeAll, afterAll } from "vitest";

// CI-AUDIT-ALLOWLIST-1: scripts/ci/audit-gate.mjs fails CI on a new high or critical advisory, or on an allowlisted one
// past its review-by date, and passes the reviewed ones. Driven as CI drives it, as a child process, on saved inputs.

import os from "os";
import path from "path";
import fs from "fs/promises";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GATE = path.join(ROOT, "scripts", "ci", "audit-gate.mjs");
let dir;

function advisory(id, name, severity) {
  return { source: 1, name, dependency: name, title: `${name} ${id} title`, url: `https://github.com/advisories/${id}`, severity, range: "<9.9.9" };
}
function auditOf(...advisories) {
  const vulnerabilities = {};
  for (const a of advisories) {
    const v = (vulnerabilities[a.name] ||= { name: a.name, severity: a.severity, via: [] });
    v.via.push(a);
  }
  vulnerabilities["transitive-parent"] = { name: "transitive-parent", severity: "high", via: [advisories[0]?.name || "x"] }; // string via: skipped
  return { auditReportVersion: 2, vulnerabilities };
}
const ALLOW = [
  { id: "GHSA-aaaa-aaaa-aaaa", package: "alpha", reachability: "Not reached.", reviewBy: "2027-01-22" },
  { id: "GHSA-bbbb-bbbb-bbbb", package: "beta", reachability: "Not reached.", reviewBy: "2027-01-22" },
];
const REVIEWED = [advisory("GHSA-aaaa-aaaa-aaaa", "alpha", "high"), advisory("GHSA-bbbb-bbbb-bbbb", "beta", "high")];

async function run(audit, { allowlist = ALLOW, allowlistText, today = "2026-10-22" } = {}) {
  const input = path.join(dir, `audit-${Math.random().toString(36).slice(2)}.json`);
  const allow = path.join(dir, `allow-${Math.random().toString(36).slice(2)}.json`);
  await fs.writeFile(input, JSON.stringify(audit));
  await fs.writeFile(allow, allowlistText ?? JSON.stringify(allowlist));
  const r = spawnSync(process.execPath, [GATE, "--input", input, "--allowlist", allow, "--today", today], { encoding: "utf8" });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

beforeAll(async () => { dir = await fs.mkdtemp(path.join(os.tmpdir(), "blurby-audit-gate-")); });
afterAll(async () => { await fs.rm(dir, { recursive: true, force: true }); });

describe("CI audit gate (scripts/ci/audit-gate.mjs)", () => {
  it("(a) every high advisory allowlisted and in date: exit 0", async () => {
    const r = await run(auditOf(...REVIEWED));
    expect(r.code).toBe(0);
    expect(r.out).toContain("audit-gate: OK");
  });

  it("(b) a new high advisory: exit 1, naming it", async () => {
    const r = await run(auditOf(...REVIEWED, advisory("GHSA-cccc-cccc-cccc", "gamma", "high")));
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/not allowlisted: GHSA-cccc-cccc-cccc gamma \(high\)/);
  });

  it("(c) a new critical advisory: exit 1", async () => {
    const r = await run(auditOf(...REVIEWED, advisory("GHSA-dddd-dddd-dddd", "delta", "critical")));
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/not allowlisted: GHSA-dddd-dddd-dddd delta \(critical\)/);
  });

  it("(d) a new moderate advisory: exit 0", async () => {
    const r = await run(auditOf(...REVIEWED, advisory("GHSA-eeee-eeee-eeee", "epsilon", "moderate")));
    expect(r.code).toBe(0);
    expect(r.out).not.toContain("GHSA-eeee-eeee-eeee");
  });

  it("(e) an allowlisted advisory past its review-by date: exit 1", async () => {
    const r = await run(auditOf(...REVIEWED), { today: "2027-01-23" });
    expect(r.code).toBe(1);
    expect(r.out).toMatch(/review overdue \(reviewBy 2027-01-22\): GHSA-aaaa-aaaa-aaaa alpha/);
  });

  it("(f) an allowlisted advisory no longer reported: exit 0 with a stale: line", async () => {
    const r = await run(auditOf(REVIEWED[0]));
    expect(r.code).toBe(0);
    expect(r.out).toMatch(/^stale: GHSA-bbbb-bbbb-bbbb beta/m);
  });

  it("(g) a malformed allowlist: exit 2", async () => {
    const r = await run(auditOf(...REVIEWED), { allowlistText: "{ not json" });
    expect(r.code).toBe(2);
  });

  it("(h) a high advisory with no url fails closed: exit 2", async () => {
    const noUrl = { ...advisory("GHSA-ffff-ffff-ffff", "zeta", "high"), url: undefined };
    const r = await run(auditOf(...REVIEWED, noUrl));
    expect(r.code).toBe(2);
    expect(r.out).toContain("has no advisory url");
  });

  it("(i) an impossible reviewBy date or a duplicate id makes the allowlist malformed: exit 2", async () => {
    const badDate = await run(auditOf(...REVIEWED), { allowlist: [ALLOW[0], { ...ALLOW[1], reviewBy: "2027-13-45" }] });
    expect(badDate.code).toBe(2);
    const dup = await run(auditOf(...REVIEWED), { allowlist: [...ALLOW, ALLOW[0]] });
    expect(dup.code).toBe(2);
  });

  it("(j) npm's own error (no vulnerabilities map) exits 2 and shows it", async () => {
    const r = await run({ error: { code: "ECONNREFUSED", summary: "request to registry failed" } });
    expect(r.code).toBe(2);
    expect(r.out).toContain("request to registry failed");
  });

  it("control: the committed allowlist has the 9 reviewed entries, each with a reachability note and reviewBy 2027-01-22", async () => {
    const entries = JSON.parse(await fs.readFile(path.join(ROOT, ".github", "audit-allowlist.json"), "utf8"));
    expect(entries).toHaveLength(9);
    for (const e of entries) {
      expect(Object.keys(e).sort()).toEqual(["id", "package", "reachability", "reviewBy"]);
      expect(e.id).toMatch(/^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/);
      expect(e.reachability.length).toBeGreaterThan(20);
      expect(e.reviewBy).toBe("2027-01-22");
    }
    expect(entries.map((e) => e.package).sort()).toEqual(["adm-zip", "adm-zip", "adm-zip", "adm-zip", "adm-zip", "braces", "sharp", "sharp", "sharp"]);
  });
});
