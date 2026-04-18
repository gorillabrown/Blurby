import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_REGISTRY_PATH = "docs/research/tts-engine-scan/candidate-registry.json";
const DEFAULT_FIXTURE_MANIFEST_PATH = "tests/fixtures/narration/engine-scan/manifest.json";
const DEFAULT_ARTIFACTS_ROOT = "artifacts/tts-eval/engine-scan";

function toCandidateEntries(registry) {
  const baseline = Array.isArray(registry.baseline)
    ? registry.baseline.map((id) => ({ id, track: "baseline" }))
    : [];
  const active = Array.isArray(registry.activeCandidates)
    ? registry.activeCandidates.map((candidate) => ({
      id: candidate.id,
      track: candidate.track || "active",
    }))
    : [];

  return [...baseline, ...active];
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(path.resolve(filePath), "utf8"));
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2), "utf8");
  await fs.rename(tempPath, filePath);
}

function summarizeCandidate({
  candidate,
  requiredFixtureIds,
  manifest,
  manifestPath,
}) {
  if (!manifest) {
    return {
      candidateId: candidate.id,
      track: candidate.track,
      manifestPath,
      outputCount: 0,
      missingFixtures: [...requiredFixtureIds],
      unexpectedFixtures: [],
      status: "missing-run-manifest",
    };
  }

  const outputs = Array.isArray(manifest.outputs) ? manifest.outputs : [];
  const producedFixtureIds = new Set(
    outputs
      .map((output) => output?.fixtureId)
      .filter((fixtureId) => typeof fixtureId === "string" && fixtureId.length > 0),
  );
  const missingFixtures = requiredFixtureIds.filter((fixtureId) => !producedFixtureIds.has(fixtureId));
  const unexpectedFixtures = [...producedFixtureIds].filter(
    (fixtureId) => !requiredFixtureIds.includes(fixtureId),
  );

  return {
    candidateId: candidate.id,
    track: candidate.track,
    manifestPath,
    manifestCandidateId: manifest.candidateId || null,
    outputCount: outputs.length,
    missingFixtures,
    unexpectedFixtures,
    status: missingFixtures.length === 0 ? "complete" : "incomplete",
  };
}

export function formatScanIndex(index) {
  const lines = [
    "TTS engine scan index",
    `Generated at: ${index.generatedAt}`,
    `Artifacts root: ${index.artifactsRoot}`,
    `Required fixtures: ${index.requiredFixtures.join(", ")}`,
    "",
  ];

  for (const candidate of index.candidates) {
    lines.push(
      `${candidate.candidateId} [${candidate.track}] - ${candidate.status}; outputs=${candidate.outputCount}; missing=${candidate.missingFixtures.length}`,
    );
    if (candidate.missingFixtures.length) {
      lines.push(`  missing fixtures: ${candidate.missingFixtures.join(", ")}`);
    }
    if (candidate.unexpectedFixtures.length) {
      lines.push(`  unexpected fixtures: ${candidate.unexpectedFixtures.join(", ")}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export async function buildScanIndex({
  registryPath = DEFAULT_REGISTRY_PATH,
  fixtureManifestPath = DEFAULT_FIXTURE_MANIFEST_PATH,
  artifactsRoot = DEFAULT_ARTIFACTS_ROOT,
  generatedAt = null,
} = {}) {
  const [registry, fixtureManifest] = await Promise.all([
    readJson(registryPath),
    readJson(fixtureManifestPath),
  ]);

  const requiredFixtures = Array.isArray(fixtureManifest.fixtures)
    ? fixtureManifest.fixtures
      .map((fixture) => fixture?.id)
      .filter((fixtureId) => typeof fixtureId === "string" && fixtureId.length > 0)
    : [];
  const candidates = await Promise.all(
    toCandidateEntries(registry).map(async (candidate) => {
      const manifestPath = path.resolve(artifactsRoot, candidate.id, "run-manifest.json");
      const manifest = await readJsonIfExists(manifestPath);
      return summarizeCandidate({
        candidate,
        requiredFixtureIds: requiredFixtures,
        manifest,
        manifestPath,
      });
    }),
  );

  return {
    schemaVersion: "1.0",
    generatedAt: generatedAt || new Date().toISOString(),
    registryPath: path.resolve(registryPath),
    fixtureManifestPath: path.resolve(fixtureManifestPath),
    artifactsRoot: path.resolve(artifactsRoot),
    requiredFixtures,
    candidates,
  };
}

export async function writeScanIndex(index, artifactsRoot = DEFAULT_ARTIFACTS_ROOT) {
  const outDir = path.resolve(artifactsRoot, "index");
  await fs.mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, "summary.json");
  const textPath = path.join(outDir, "summary.txt");
  await writeJsonAtomic(jsonPath, index);
  await fs.writeFile(textPath, formatScanIndex(index), "utf8");
  return { jsonPath, textPath };
}

function parseArgs(argv) {
  const args = {
    registryPath: DEFAULT_REGISTRY_PATH,
    fixtureManifestPath: DEFAULT_FIXTURE_MANIFEST_PATH,
    artifactsRoot: DEFAULT_ARTIFACTS_ROOT,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--registry") {
      args.registryPath = argv[i + 1] || args.registryPath;
      i += 1;
      continue;
    }
    if (token === "--fixture-manifest") {
      args.fixtureManifestPath = argv[i + 1] || args.fixtureManifestPath;
      i += 1;
      continue;
    }
    if (token === "--artifacts-root") {
      args.artifactsRoot = argv[i + 1] || args.artifactsRoot;
      i += 1;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const index = await buildScanIndex(args);
  const { jsonPath, textPath } = await writeScanIndex(index, args.artifactsRoot);
  // eslint-disable-next-line no-console
  console.log(`Indexed ${index.candidates.length} candidates across ${index.requiredFixtures.length} fixtures.`);
  // eslint-disable-next-line no-console
  console.log(`Artifacts: ${jsonPath} | ${textPath}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    // eslint-disable-next-line no-console
    console.error("[tts_engine_scan_index] failed:", error.message);
    process.exitCode = 1;
  });
}
