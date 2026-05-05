import { describe, expect, it } from "vitest";
import type {
  QwenStreamStartResult,
  QwenStreamingDisabledStatus,
  QwenStreamingEngineStatus,
} from "../src/types/qwenStreaming";

const disabledStatus: QwenStreamingDisabledStatus = {
  status: "unavailable",
  reason: "qwen-disabled",
  recoverable: false,
  ready: false,
  model_loaded: false,
  device: "disabled",
  loading: false,
  error: "Qwen is retired for Desktop v2 and remains disabled.",
};

const disabledEngineStatus: QwenStreamingEngineStatus = disabledStatus;

const disabledStart: QwenStreamStartResult = {
  ok: false,
  error: "Qwen is retired for Desktop v2 and remains disabled.",
  status: "unavailable",
  reason: "qwen-disabled",
  recoverable: false,
};

describe("Qwen streaming disabled type contract", () => {
  it("keeps retired Qwen stream metadata explicit", () => {
    expect(disabledEngineStatus).toMatchObject({
      status: "unavailable",
      reason: "qwen-disabled",
      recoverable: false,
      model_loaded: false,
      device: "disabled",
    });
    expect(disabledStart).toMatchObject({
      ok: false,
      status: "unavailable",
      reason: "qwen-disabled",
      recoverable: false,
    });
  });
});
