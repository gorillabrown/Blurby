import type { QwenStatusSnapshot } from "../../types";

function normalizeQwenStatusDetail(detail: string): string {
  return detail
    .replaceAll("live Qwen prototype", "local Qwen runtime")
    .replaceAll("prototype playback", "live narration playback");
}

export function getQwenStatusPresentation(
  snapshot: QwenStatusSnapshot,
  runtimeError: string | null,
): { title: string; detail: string } {
  const rawDetail = normalizeQwenStatusDetail(snapshot.detail || runtimeError || "Qwen runtime is not ready.");

  if (snapshot.status === "warming") {
    return {
      title: "Qwen is warming up",
      detail: rawDetail,
    };
  }

  if (snapshot.reason === "config-missing") {
    return {
      title: "Qwen isn't set up on this machine yet",
      detail: `Blurby could not find the local Qwen runtime configuration. ${rawDetail}`,
    };
  }

  if (snapshot.reason === "python-missing") {
    return {
      title: "Qwen setup is incomplete",
      detail: rawDetail,
    };
  }

  if (
    snapshot.reason === "device-unsupported"
    || snapshot.reason === "cuda-unavailable"
    || snapshot.reason === "cuda-device-invalid"
    || snapshot.reason === "cuda-device-missing"
  ) {
    return {
      title: "Unsupported Qwen host",
      detail: rawDetail,
    };
  }

  if (
    snapshot.reason === "torch-missing"
    || snapshot.reason === "qwen-tts-missing"
    || snapshot.reason === "attention-backend-missing"
    || snapshot.reason === "model-unavailable"
  ) {
    return {
      title: "Qwen runtime is configured but broken",
      detail: rawDetail,
    };
  }

  if (snapshot.status === "error") {
    return {
      title: "Qwen runtime error",
      detail: rawDetail,
    };
  }

  return {
    title: "Qwen unavailable",
    detail: rawDetail,
  };
}
