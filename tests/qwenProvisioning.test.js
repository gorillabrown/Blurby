import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

import qwenEngineModule from "../main/qwen-engine";

const { createQwenEngineManager } = qwenEngineModule;

async function makeTempDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "blurby-qwen-provision-"));
}

function createFakeQwenPreflightProcess(report) {
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
          queueMicrotask(() => {
            stdout.emit("data", Buffer.from(`${JSON.stringify(report)}\n`, "utf8"));
            emitter.emit("exit", 0, null);
          });
        }
      },
      end() {},
    },
    kill: vi.fn(() => {
      queueMicrotask(() => emitter.emit("exit", 0, null));
      return true;
    }),
  });

  return child;
}

describe("qwen provisioning preflight", () => {
  const tempDirs = [];

  afterEach(async () => {
    await Promise.all(tempDirs.map((dir) => fs.rm(dir, { recursive: true, force: true })));
    tempDirs.length = 0;
  });

  it("returns a structured ready report for CPU-backed configs", async () => {
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

    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath,
      spawnProcess: () => createFakeQwenPreflightProcess({
        ok: true,
        status: "ready",
        reason: null,
        detail: 'Qwen runtime preflight passed for configured device "cpu".',
        recoverable: false,
        supportedHost: true,
        requestedDevice: "cpu",
        pythonExe: process.execPath,
        modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
        configPath: path.join(configDir, "config.json"),
        checkedAt: "2026-04-20T12:00:00.000Z",
        checks: [
          { key: "host", status: "pass", detail: 'Configured Qwen runtime uses device "cpu". CPU-backed narration is allowed in this phase, but startup and synthesis will be slower than CUDA.' },
          { key: "cuda", status: "skip", detail: 'Configured device "cpu" does not require CUDA visibility checks.' },
        ],
      }),
    });

    await expect(manager.preflight()).resolves.toMatchObject({
      status: "ready",
      reason: null,
      supportedHost: true,
      requestedDevice: "cpu",
      checks: expect.arrayContaining([
        expect.objectContaining({
          key: "host",
          status: "pass",
        }),
      ]),
    });
  });

  it("surfaces probe results for a healthy CUDA-configured runtime", async () => {
    const projectRoot = await makeTempDir();
    tempDirs.push(projectRoot);
    const configDir = path.join(projectRoot, ".runtime", "qwen");
    const userDataPath = path.join(projectRoot, "userData");
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "config.json"),
      JSON.stringify({
        pythonExe: process.execPath,
        device: "cuda:0",
      }),
      "utf8",
    );

    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath,
      spawnProcess: () => createFakeQwenPreflightProcess({
        ok: true,
        status: "ready",
        reason: null,
        detail: "Qwen runtime preflight passed for configured device \"cuda:0\".",
        recoverable: false,
        supportedHost: true,
        requestedDevice: "cuda:0",
        pythonExe: process.execPath,
        modelId: "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice",
        configPath: path.join(configDir, "config.json"),
        checkedAt: "2026-04-20T12:00:00.000Z",
        checks: [
          { key: "python", status: "pass", detail: "Python executable found." },
          { key: "torch", status: "pass", detail: "PyTorch import succeeded." },
          { key: "qwen_tts", status: "pass", detail: "qwen_tts import succeeded." },
          { key: "cuda", status: "pass", detail: "CUDA device 0 is visible." },
          { key: "model", status: "pass", detail: "Model files are reachable locally." },
        ],
      }),
    });

    await expect(manager.preflight()).resolves.toMatchObject({
      status: "ready",
      reason: null,
      supportedHost: true,
      requestedDevice: "cuda:0",
      checks: expect.arrayContaining([
        expect.objectContaining({ key: "cuda", status: "pass" }),
        expect.objectContaining({ key: "model", status: "pass" }),
      ]),
    });
  });
});
