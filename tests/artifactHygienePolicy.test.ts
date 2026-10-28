import { describe, expect, it } from "vitest";
import * as fs from "fs";
import * as path from "path";

const repoRoot = path.resolve(__dirname, "..");
const gitignore = fs.readFileSync(path.join(repoRoot, ".gitignore"), "utf-8");
const releaseChecklist = fs.readFileSync(
  path.join(repoRoot, "docs/planning/desktop-v2.0-release-checklist.md"),
  "utf-8",
);

describe("POSTV2 artifact hygiene policy", () => {
  it("ignores bulky generated audio, temp evidence, traces, and profiles while leaving summaries eligible", () => {
    expect(gitignore).toContain("artifacts/**/*.wav");
    expect(gitignore).toContain("artifacts/**/tmp/**");
    expect(gitignore).toContain("artifacts/**/traces/**");
    expect(gitignore).toContain("artifacts/**/*profile*.json");

    expect(gitignore).not.toContain("artifacts/**/summary.json");
    expect(gitignore).not.toContain("artifacts/**/summary.txt");
    expect(gitignore).not.toContain("artifacts/**/promotion-confirmation.json");
  });

  it("documents that generated evidence defaults stay out of release commits unless promoted to canonical summaries", () => {
    expect(releaseChecklist).toContain("Generated audio, traces, profiles, and temp evidence remain untracked by default.");
    expect(releaseChecklist).toContain("Canonical release summaries stay reviewable");
  });
});
