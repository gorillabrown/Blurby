import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildScanIndex } from "../scripts/tts_engine_scan_index.mjs";

describe("tts engine scan index", () => {
  it("flags missing fixture outputs for an active candidate", async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "tts-scan-"));
    const registryPath = path.join(tmp, "candidate-registry.json");
    const fixtureManifestPath = path.join(tmp, "manifest.json");
    const artifactsRoot = path.join(tmp, "artifacts");

    fs.writeFileSync(
      registryPath,
      JSON.stringify({
        baseline: ["kokoro"],
        activeCandidates: [{ id: "moss-tts", track: "context" }],
        excluded: [],
      }),
    );

    fs.writeFileSync(
      fixtureManifestPath,
      JSON.stringify({
        fixtures: [{ id: "literary-punctuation", file: "literary-punctuation.txt" }],
      }),
    );

    fs.mkdirSync(path.join(artifactsRoot, "moss-tts"), { recursive: true });
    fs.writeFileSync(
      path.join(artifactsRoot, "moss-tts", "run-manifest.json"),
      JSON.stringify({
        candidateId: "moss-tts",
        outputs: [],
      }),
    );

    const index = await buildScanIndex({
      registryPath,
      fixtureManifestPath,
      artifactsRoot,
    });
    expect(index.candidates[0].missingFixtures).toContain("literary-punctuation");
  });
});
