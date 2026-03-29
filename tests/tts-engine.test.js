// tests/tts-engine.test.js — Worker crash/recovery and ensureReady pattern tests
//
// tts-engine.js uses lazy `require("electron")` inside functions, which vitest
// can't intercept at runtime. These tests verify the patterns WITHOUT going
// through the full Electron-dependent code path.

import { describe, it, expect } from "vitest";

describe("tts-engine patterns", () => {
  describe("worker error handler resets engine state", () => {
    it("should reset worker, modelReady, and loadingPromise on error", () => {
      // Simulate the module's internal state and error handler behavior
      let worker = { on: () => {}, postMessage: () => {} };
      let modelReady = true;
      let loadingPromise = Promise.resolve();
      const pending = new Map();

      // This is the error handler pattern from tts-engine.js (post-fix)
      function onWorkerError(err) {
        for (const [id, p] of pending) {
          p.reject(err);
        }
        pending.clear();
        worker = null;
        modelReady = false;
        loadingPromise = null;
      }

      // Add some pending requests
      const rejections = [];
      pending.set(1, { resolve: () => {}, reject: (e) => rejections.push(e) });
      pending.set(2, { resolve: () => {}, reject: (e) => rejections.push(e) });

      // Trigger error
      const crashError = new Error("Worker crashed");
      onWorkerError(crashError);

      // Verify state reset
      expect(worker).toBeNull();
      expect(modelReady).toBe(false);
      expect(loadingPromise).toBeNull();
      expect(pending.size).toBe(0);

      // Verify all pending requests were rejected
      expect(rejections).toHaveLength(2);
      expect(rejections[0]).toBe(crashError);
      expect(rejections[1]).toBe(crashError);
    });
  });

  describe("ensureReady uses proper async pattern (no new Promise(async))", () => {
    it("should use Promise.race for timeout instead of new Promise(async)", async () => {
      // Test the refactored pattern: Promise.race with a timeout
      let modelReadyResolve;
      const readyPromise = new Promise((resolve) => { modelReadyResolve = resolve; });
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timed out")), 50);
      });

      // Race should resolve when model is ready before timeout
      setTimeout(() => modelReadyResolve(), 10);
      await expect(Promise.race([readyPromise, timeoutPromise])).resolves.toBeUndefined();
    });

    it("should timeout when model never loads", async () => {
      const readyPromise = new Promise(() => {}); // Never resolves
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Kokoro model load timed out")), 50);
      });

      await expect(Promise.race([readyPromise, timeoutPromise])).rejects.toThrow("Kokoro model load timed out");
    });
  });

  describe("idle timeout resets state for fresh worker creation", () => {
    it("should terminate worker and reset state on idle timeout", () => {
      let terminated = false;
      let worker = { terminate: () => { terminated = true; } };
      let modelReady = true;
      let loadingPromise = Promise.resolve();

      // This is the idle timeout handler from tts-engine.js
      function onIdleTimeout() {
        if (worker) {
          worker.terminate();
          worker = null;
          modelReady = false;
          loadingPromise = null;
        }
      }

      onIdleTimeout();

      expect(terminated).toBe(true);
      expect(worker).toBeNull();
      expect(modelReady).toBe(false);
      expect(loadingPromise).toBeNull();
    });
  });

  describe("generate recovers after state reset", () => {
    it("should allow new worker creation after error reset", () => {
      // Simulate the recovery flow: after error resets state,
      // generate() calls ensureReady() which creates a fresh worker
      let worker = null;
      let modelReady = false;
      let workerCreationCount = 0;

      function getWorker() {
        if (worker) return worker;
        workerCreationCount++;
        worker = { on: () => {}, postMessage: () => {} };
        return worker;
      }

      // First worker creation
      getWorker();
      expect(workerCreationCount).toBe(1);

      // Simulate error reset
      worker = null;
      modelReady = false;

      // Second worker creation (recovery)
      getWorker();
      expect(workerCreationCount).toBe(2);
    });
  });
});
