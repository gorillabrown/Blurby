import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import qwenEngineModule from "../main/qwen-engine";

const { createQwenEngineManager } = qwenEngineModule;

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "blurby-qwen-"));
}

async function writeMonoPcm16Wav(filePath, samples = [0, 1638, -1638, 0], sampleRate = 24000) {
  const channelCount = 1;
  const bitsPerSample = 16;
  const blockAlign = channelCount * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channelCount, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  samples.forEach((sample, index) => {
    buffer.writeInt16LE(sample, 44 + index * 2);
  });

  await fs.writeFile(filePath, buffer);
}

function createFakeQwenSidecar() {
  const commandCounts = {
    configure: 0,
    warmup: 0,
    status: 0,
    list_speakers: 0,
    generate_custom_voice: 0,
    shutdown: 0,
  };
  const emitter = new EventEmitter();
  const stdout = new EventEmitter();
  const stderr = new EventEmitter();
  let stdinBuffer = "";

  const child = Object.assign(emitter, {
    stdout,
    stderr,
    stdin: {
      write(chunk) {
        stdinBuffer += String(chunk);
        while (stdinBuffer.includes("\n")) {
          const newlineIndex = stdinBuffer.indexOf("\n");
          const line = stdinBuffer.slice(0, newlineIndex).trim();
          stdinBuffer = stdinBuffer.slice(newlineIndex + 1);
          if (!line) continue;
          void handle(JSON.parse(line));
        }
      },
      end() {},
    },
    kill: vi.fn(() => {
      queueMicrotask(() => emitter.emit("exit", 0, null));
      return true;
    }),
  });

  async function reply(message) {
    queueMicrotask(() => {
      stdout.emit("data", Buffer.from(`${JSON.stringify(message)}\n`, "utf8"));
    });
  }

  async function handle(message) {
    if (Object.prototype.hasOwnProperty.call(commandCounts, message.command)) {
      commandCounts[message.command] += 1;
    }

    if (message.command === "configure") {
      await reply({
        id: message.id,
        ok: true,
        configured: true,
      });
      return;
    }

    if (message.command === "warmup" || message.command === "status") {
      await reply({
        id: message.id,
        ok: true,
        status: "ready",
        detail: "Qwen runtime ready for live narration playback",
        reason: null,
        ready: true,
        loading: false,
        recoverable: false,
      });
      return;
    }

    if (message.command === "list_speakers") {
      await reply({
        id: message.id,
        ok: true,
        speakers: ["Ryan", "Aiden"],
      });
      return;
    }

    if (message.command === "generate_custom_voice") {
      await writeMonoPcm16Wav(message.outputPath);
      await reply({
        id: message.id,
        ok: true,
        outputPath: message.outputPath,
        sampleRate: 24000,
        durationMs: 50,
        wordTimestamps: null,
      });
      return;
    }

    if (message.command === "shutdown") {
      await reply({
        id: message.id,
        ok: true,
      });
      return;
    }

    await reply({
      id: message.id,
      ok: false,
      error: `Unsupported command: ${message.command}`,
      reason: "unsupported-command",
      recoverable: false,
    });
  }

  child.commandCounts = commandCounts;
  return child;
}

function createFakeQwenSidecarWithNoise() {
  const child = createFakeQwenSidecar();
  queueMicrotask(() => {
    child.stdout.emit("data", Buffer.from("Fetching 4 files...\n", "utf8"));
    child.stderr.emit("data", Buffer.from("Warning: Flash Attention 2 is not installed.\n", "utf8"));
    child.stderr.emit("data", Buffer.from("Warning: SoX is not installed, so only saved audio can be used for now.\n", "utf8"));
  });
  return child;
}

describe("qwen engine manager", () => {
  const tempDirs = [];

  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
  });

  it("reports unavailable when no development config is present", async () => {
    const projectRoot = await makeTempDir();
    tempDirs.push(projectRoot);

    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath: path.join(projectRoot, "userData"),
    });

    const status = await manager.getModelStatus();
    expect(status).toMatchObject({
      status: "unavailable",
      reason: "config-missing",
      ready: false,
      loading: false,
      recoverable: true,
    });
  });

  it("allows CPU-backed configs for live Qwen playback", async () => {
    const projectRoot = await makeTempDir();
    tempDirs.push(projectRoot);
    const configDir = path.join(projectRoot, ".runtime", "qwen");
    const userDataPath = path.join(projectRoot, "userData");
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "config.json"),
      JSON.stringify({
        pythonExe: process.execPath,
        device: "cpu",
        dtype: "float32",
        attnImplementation: "eager",
      }),
      "utf8",
    );

    const spawnProcess = vi.fn(() => createFakeQwenSidecar());
    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath,
      spawnProcess,
    });

    await expect(manager.getModelStatus()).resolves.toMatchObject({
      status: "ready",
      reason: null,
      ready: true,
      loading: false,
    });
    await expect(manager.preload()).resolves.toMatchObject({
      success: true,
    });
    await expect(manager.generate(
      "CPU-backed Qwen prototype check.",
      "Ryan",
      1.0,
      ["CPU-backed", "Qwen", "prototype", "check."],
    )).resolves.toMatchObject({
      sampleRate: 24000,
      durationMs: 50,
    });
    expect(spawnProcess).toHaveBeenCalled();
  });

  it("warms a configured runtime, lists truthful speakers, and generates cleanup-safe audio", async () => {
    const projectRoot = await makeTempDir();
    tempDirs.push(projectRoot);
    const configDir = path.join(projectRoot, ".runtime", "qwen");
    const userDataPath = path.join(projectRoot, "userData");
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "config.json"),
      JSON.stringify({
        pythonExe: process.execPath,
      }),
      "utf8",
    );

    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath,
      spawnProcess: () => createFakeQwenSidecar(),
    });

    const preloadResult = await manager.preload();
    expect(preloadResult).toMatchObject({
      success: true,
      timingMs: expect.any(Number),
      spikeWarningThresholdMs: expect.any(Number),
      spikeWarning: expect.any(Boolean),
    });

    const status = await manager.getModelStatus();
    expect(status).toMatchObject({
      status: "ready",
      ready: true,
      loading: false,
      recoverable: false,
      preloadTimingMs: expect.any(Number),
      statusTimingMs: expect.any(Number),
    });
    expect(status.detail).toContain("live narration playback");

    const voices = await manager.listVoices();
    expect(voices).toEqual(["Ryan", "Aiden"]);

    const generated = await manager.generate(
      "Blurby live Qwen playback check.",
      "Ryan",
      1.2,
      ["Blurby", "live", "Qwen", "playback", "check."],
    );
    expect(generated).toMatchObject({
      sampleRate: 24000,
      durationMs: 50,
      wordTimestamps: null,
      timingMs: expect.any(Number),
      spikeWarningThresholdMs: expect.any(Number),
      spikeWarning: expect.any(Boolean),
    });
    expect(generated.audio).toBeInstanceOf(Float32Array);
    expect(generated.audio.length).toBeGreaterThan(0);

    const requestsDir = path.join(userDataPath, "tts-qwen", "requests");
    await expect(fs.readdir(requestsDir)).resolves.toEqual([]);
  });

  it("ignores benign sidecar startup chatter while still reaching ready", async () => {
    const projectRoot = await makeTempDir();
    tempDirs.push(projectRoot);
    const configDir = path.join(projectRoot, ".runtime", "qwen");
    const runtimeErrors = [];
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "config.json"),
      JSON.stringify({
        pythonExe: process.execPath,
      }),
      "utf8",
    );

    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath: path.join(projectRoot, "userData"),
      spawnProcess: () => createFakeQwenSidecarWithNoise(),
      sendRuntimeError: (message) => runtimeErrors.push(message),
    });

    await expect(manager.preload()).resolves.toMatchObject({ success: true });
    await expect(manager.getModelStatus()).resolves.toMatchObject({
      status: "ready",
      ready: true,
    });
    expect(runtimeErrors).toEqual([]);
  });

  it("deduplicates concurrent warmups into a single sidecar warmup flight", async () => {
    const projectRoot = await makeTempDir();
    tempDirs.push(projectRoot);
    const configDir = path.join(projectRoot, ".runtime", "qwen");
    const userDataPath = path.join(projectRoot, "userData");
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "config.json"),
      JSON.stringify({
        pythonExe: process.execPath,
      }),
      "utf8",
    );

    const fakeSidecar = createFakeQwenSidecar();
    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath,
      spawnProcess: () => fakeSidecar,
    });

    const [first, second] = await Promise.all([
      manager.preload(),
      manager.preload(),
    ]);

    expect(first).toMatchObject({ success: true });
    expect(second).toMatchObject({ success: true });
    expect(fakeSidecar.commandCounts.warmup).toBe(1);
  });

  it("surfaces malformed config as an error snapshot", async () => {
    const projectRoot = await makeTempDir();
    tempDirs.push(projectRoot);
    const configDir = path.join(projectRoot, ".runtime", "qwen");
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "config.json"),
      "{ not-valid-json",
      "utf8",
    );

    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath: path.join(projectRoot, "userData"),
    });

    const status = await manager.getModelStatus();
    expect(status).toMatchObject({
      status: "error",
      reason: "config-invalid",
      ready: false,
      loading: false,
      recoverable: true,
    });
    expect(status.detail).toContain("config");
  });
});
