// NARRATE-REBUILD-1 P6b — the committed Kokoro tokenizer fixture (tests/fixtures/narrate-rebuild/kokoro-tokenizer/) is the
// pinned, unmodified onnx-community/Kokoro-82M-v1.0-ONNX tokenizer (Apache-2.0), and still equals the artifacts copy the
// producer's exposed model loads beside. The artifacts folder exists only on the owner's machines; elsewhere that one case
// is skipped by name, and `reconcile-sweep.mjs --check-tokenizer` (exit 1 when the copy is absent or differs) is the gate.
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const DIR = path.resolve(__dirname, "../fixtures/narrate-rebuild/kokoro-tokenizer");
const ARTIFACTS = "C:/Projects/Blurby-artifacts/narrate-rebuild-1/models/local/kokoro-dur";
const PINNED = {
  "tokenizer.json": "77a02c8e164413299b4b4c403b14f8e0e1c1b727db4d46a09d6327b861060a34",
  "tokenizer_config.json": "be1cb066d6ef6b074b3f15e6a6dd21ac88ff3cdaedf325f0aaed686c70f75d20",
};
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");

describe("Kokoro tokenizer fixture (P6b)", () => {
  it("is the pinned tokenizer, with its Apache-2.0 licence beside it", () => {
    for (const [name, hash] of Object.entries(PINNED)) expect(sha256(path.join(DIR, name))).toBe(hash);
    expect(fs.readFileSync(path.join(DIR, "LICENSE"), "utf8")).toMatch(/Apache License\s+Version 2\.0, January 2004/);
  });
  it.skipIf(!fs.existsSync(ARTIFACTS))("equals the artifacts copy (owner machines only)", () => {
    for (const name of Object.keys(PINNED)) expect(sha256(path.join(DIR, name))).toBe(sha256(path.join(ARTIFACTS, name)));
  });
});
