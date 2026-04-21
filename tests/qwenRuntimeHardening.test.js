import { EventEmitter } from "node:events";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import qwenEngineModule from "../main/qwen-engine";

const { createQwenEngineManager } = qwenEngineModule;

const tempDirs = [];

async function makeTempDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "blurby-qwen-harden-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => fs.rm(dir, { recursive: true, force: true })));
});

function createControlledSidecar(modeRef) {
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
    kill() {
      queueMicrotask(() => emitter.emit("exit", 0, null));
      return true;
    },
  });

  function reply(message) {
    queueMicrotask(() => {
      stdout.emit("data", Buffer.from(`${JSON.stringify(message)}\n`, "utf8"));
    });
  }

  async function handle(message) {
    if (message.command === "configure") {
      reply({ id: message.id, ok: true, configured: true });
      return;
    }

    if (message.command === "warmup") {
      if (modeRef.current === "hang-warmup") return;
      reply({
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

    if (message.command === "status") {
      reply({
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
      reply({ id: message.id, ok: true, speakers: ["Ryan"] });
      return;
    }

    if (message.command === "shutdown") {
      reply({ id: message.id, ok: true, shutdown: true });
    }
  }

  return child;
}

describe("qwen runtime hardening", () => {
  it("fails closed on warmup timeout and recovers on the next healthy preload", async () => {
    const projectRoot = await makeTempDir();
    const configDir = path.join(projectRoot, ".runtime", "qwen");
    const userDataPath = path.join(projectRoot, "userData");
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "config.json"),
      JSON.stringify({ pythonExe: process.execPath }),
      "utf8",
    );

    const modeRef = { current: "hang-warmup" };
    const manager = createQwenEngineManager({
      projectRoot,
      isPackaged: false,
      userDataPath,
      commandTimeoutMs: {
        warmup: 25,
        status: 25,
      },
      spawnProcess: () => createControlledSidecar(modeRef),
    });

    const firstAttempt = await Promise.race([
      manager.preload(),
      new Promise((resolve) => setTimeout(() => resolve("__timed-out-in-test__"), 80)),
    ]);

    expect(firstAttempt).not.toBe("__timed-out-in-test__");
    expect(firstAttempt).toMatchObject({
      error: expect.stringContaining("timed out"),
      reason: "warmup-timeout",
      recoverable: true,
      timingMs: expect.any(Number),
    });

    modeRef.current = "healthy";

    const secondAttempt = await Promise.race([
      manager.preload(),
      new Promise((resolve) => setTimeout(() => resolve("__timed-out-in-test__"), 80)),
    ]);

    expect(secondAttempt).not.toBe("__timed-out-in-test__");
    expect(secondAttempt).toMatchObject({
      success: true,
      timingMs: expect.any(Number),
    });

    const status = await manager.getModelStatus();
    expect(status).toMatchObject({
      status: "ready",
      ready: true,
      loading: false,
      recoverable: false,
    });
  });
});
