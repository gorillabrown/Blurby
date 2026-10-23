#!/usr/bin/env node
// scripts/ci/audit-gate.mjs — CI's dependency audit gate (CI-AUDIT-ALLOWLIST-1).
// Fails on any high or critical advisory that .github/audit-allowlist.json does not list, or whose review-by date has
// passed. Moderate and lower are ignored (docs/governance/DEPENDENCY_ADVISORIES.md tracks them).
// Exit codes: 0 every high/critical advisory is allowlisted and in date; 1 one or more are not; 2 unparsable input.
// Options: --input <file> (saved `npm audit --json`; otherwise runs npm), --allowlist <file>, --today <YYYY-MM-DD>.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const GATED = new Set(["high", "critical"]);

function option(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : fallback;
}

function fail(message) {
  console.error(`audit-gate: ${message}`);
  process.exit(2);
}

function readAudit(input) {
  if (input) return readFileSync(input, "utf8");
  try {
    return execFileSync(process.platform === "win32" ? "npm.cmd" : "npm", ["audit", "--json"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      shell: process.platform === "win32", // npm.cmd needs a shell on Windows
    });
  } catch (err) {
    if (typeof err.stdout === "string" && err.stdout.trim()) return err.stdout; // npm audit exits 1 when it finds any
    fail(`npm audit did not run: ${err.message}`);
  }
}

const allowlistPath = option("--allowlist", ".github/audit-allowlist.json");
const today = option("--today", new Date().toISOString().slice(0, 10));
if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) fail(`--today must be YYYY-MM-DD, got ${today}`);

let allowlist;
try {
  allowlist = JSON.parse(readFileSync(allowlistPath, "utf8"));
} catch (err) {
  fail(`cannot read allowlist ${allowlistPath}: ${err.message}`);
}
if (!Array.isArray(allowlist) || !allowlist.every((e) => e && typeof e.id === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.reviewBy || ""))) {
  fail(`allowlist ${allowlistPath} must be an array of { id, package, reachability, reviewBy: "YYYY-MM-DD" }`);
}
const allowed = new Map(allowlist.map((e) => [e.id, e]));

let audit;
try {
  audit = JSON.parse(readAudit(option("--input")));
} catch (err) {
  fail(`cannot parse npm audit output: ${err.message}`);
}
if (!audit || typeof audit.vulnerabilities !== "object" || audit.vulnerabilities === null) fail("npm audit output has no vulnerabilities map");

// Every high or critical advisory, keyed by the GHSA ID at the end of its url.
const found = new Map();
for (const [pkg, vuln] of Object.entries(audit.vulnerabilities)) {
  for (const via of vuln.via || []) {
    if (!via || typeof via !== "object" || !GATED.has(via.severity) || typeof via.url !== "string") continue;
    const id = via.url.split("/").pop();
    if (!found.has(id)) found.set(id, { id, package: via.name || pkg, severity: via.severity, title: via.title || "" });
  }
}

const problems = [];
for (const adv of found.values()) {
  const entry = allowed.get(adv.id);
  if (!entry) problems.push(`not allowlisted: ${adv.id} ${adv.package} (${adv.severity}) ${adv.title}`);
  else if (entry.reviewBy < today) problems.push(`review overdue (reviewBy ${entry.reviewBy}): ${adv.id} ${adv.package} (${adv.severity}) ${adv.title}`);
}
for (const entry of allowlist) {
  if (!found.has(entry.id)) console.log(`stale: ${entry.id} ${entry.package || ""} is allowlisted but no longer reported`);
}

if (problems.length) {
  for (const p of problems) console.log(p);
  console.log(`audit-gate: FAIL, ${problems.length} high/critical advisory(ies) need review`);
  process.exit(1);
}
console.log(`audit-gate: OK, ${found.size} high/critical advisory(ies), all allowlisted and in date (today ${today})`);
process.exit(0);
