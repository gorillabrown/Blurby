#!/usr/bin/env python3
"""Resident JSON-lines app bridge for local MOSS-TTS-Nano ONNX.

Default mode is real runtime only. The synthetic tone path exists solely behind
--mock for protocol tests and must never be used as product readiness evidence.
"""

from __future__ import annotations

import argparse
import gc
import importlib
import json
import math
import os
import sys
import tempfile
import time
import wave
from array import array
from pathlib import Path
from typing import Any, Dict

import moss_nano_probe as nano


DEFAULT_SAMPLE_RATE = 24000
DEFAULT_DURATION_MS = 220
MODEL_SUBDIR = "MOSS-TTS-Nano-100M-ONNX"
TOKENIZER_SUBDIR = "MOSS-Audio-Tokenizer-Nano-ONNX"


def emit(message: Dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(message, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def tail(text: str, limit: int = 1200) -> str:
    text = str(text or "").strip()
    return text[-limit:] if len(text) > limit else text


def make_status(
    *,
    ok: bool,
    status: str,
    ready: bool,
    reason: str | None = None,
    detail: str | None = None,
    recoverable: bool = True,
    runtime: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "type": "ready",
        "ok": ok,
        "status": status,
        "ready": ready,
        "loading": False,
        "reason": reason,
        "detail": detail,
        "recoverable": recoverable,
        "runtime": runtime,
    }


def fail_check(key: str, detail: str, failure_class: str = "runtime-contract") -> dict[str, Any]:
    return {"key": key, "status": "fail", "detail": detail, "failureClass": failure_class}


def first_failure(checks: list[dict[str, Any]]) -> dict[str, Any] | None:
    for check in checks:
        if check.get("status") == "fail":
            return check
    return None


def resolve_model_root(model_dir: Path, tokenizer_dir: Path | None) -> Path:
    if model_dir.name == MODEL_SUBDIR:
        return model_dir.parent
    if tokenizer_dir and tokenizer_dir.name == TOKENIZER_SUBDIR and tokenizer_dir.parent == model_dir:
        return model_dir
    return model_dir


def validate_paths(repo_dir: Path, model_dir: Path, tokenizer_dir: Path | None) -> tuple[list[dict[str, Any]], Path]:
    checks: list[dict[str, Any]] = []
    if not repo_dir.is_dir():
        return [fail_check("sourceRepo", f"Nano source repo is missing at {repo_dir}.", "source-download")], model_dir
    if not any(repo_dir.rglob("*.py")):
        return [fail_check("sourceRepo", f"Nano source repo at {repo_dir} has no Python sources.", "source-download")], model_dir
    checks.append({"key": "sourceRepo", "status": "pass", "detail": f"Nano source repo is present at {repo_dir}."})

    if not model_dir.is_dir():
        return checks + [fail_check("modelDir", f"Nano model directory is missing at {model_dir}.", "asset-download")], model_dir
    if not any(model_dir.rglob("*.onnx")):
        return checks + [fail_check("modelDir", f"No ONNX files found in Nano model directory {model_dir}.", "asset-download")], model_dir
    checks.append({"key": "modelDir", "status": "pass", "detail": f"Nano model directory is present at {model_dir}."})

    if tokenizer_dir is None or not tokenizer_dir.is_dir():
        return checks + [fail_check("tokenizerDir", f"Nano tokenizer directory is missing at {tokenizer_dir}.", "asset-download")], model_dir
    if not any(tokenizer_dir.rglob("*.onnx")):
        return checks + [fail_check("tokenizerDir", f"No ONNX files found in Nano tokenizer directory {tokenizer_dir}.", "asset-download")], model_dir
    checks.append({"key": "tokenizerDir", "status": "pass", "detail": f"Nano tokenizer directory is present at {tokenizer_dir}."})

    model_root = resolve_model_root(model_dir, tokenizer_dir)
    probe_checks = nano.validate_local_runtime({"repoDir": str(repo_dir), "modelDir": str(model_root)})
    checks.extend(probe_checks)
    return checks, model_root


def wav_to_float_audio(path: Path) -> tuple[list[float], int, int]:
    with wave.open(str(path), "rb") as wav:
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        sample_rate = wav.getframerate()
        frame_count = wav.getnframes()
        raw = wav.readframes(frame_count)
    if sample_width != 2:
        raise ValueError(f"Unsupported Nano WAV sample width: {sample_width}")
    pcm = array("h")
    pcm.frombytes(raw)
    if sys.byteorder == "big":
        pcm.byteswap()
    if channels > 1:
        mono = [float(pcm[index]) / 32768.0 for index in range(0, len(pcm), channels)]
    else:
        mono = [float(sample) / 32768.0 for sample in pcm]
    duration_ms = round((len(mono) / sample_rate) * 1000) if sample_rate else 0
    return mono, sample_rate, duration_ms


def make_preview_audio(rate: float) -> array:
    total = max(1, int(DEFAULT_SAMPLE_RATE * (DEFAULT_DURATION_MS / 1000.0)))
    frequency = 440.0 * max(0.5, min(1.5, rate or 1.0))
    samples = array("f")
    for index in range(total):
        fade = min(1.0, index / 600.0, (total - index) / 600.0)
        samples.append(0.12 * fade * math.sin(2.0 * math.pi * frequency * index / DEFAULT_SAMPLE_RATE))
    return samples


def write_mock_wav(output_dir: Path, request_id: str, samples: array) -> str:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{request_id or 'nano-preview'}.wav"
    pcm = array("h", [max(-32767, min(32767, int(sample * 32767))) for sample in samples])
    with wave.open(str(output_path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(DEFAULT_SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())
    return str(output_path)


class MockNanoRuntime:
    def __init__(self, output_dir: Path) -> None:
        self.output_dir = output_dir
        self.status = make_status(
            ok=True,
            status="ready",
            ready=True,
            detail="MOSS Nano mock sidecar bridge ready.",
            recoverable=False,
            runtime={
                "backend": "mock-tone",
                "modelVariant": "synthetic-test-only",
                "syntheticAudio": True,
                "pid": os.getpid(),
            },
        )

    def synthesize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        samples = make_preview_audio(float(payload.get("rate") or 1.0))
        output_path = write_mock_wav(self.output_dir, str(payload.get("requestId") or "nano-preview"), samples)
        return {
            "type": "result",
            "ok": True,
            "status": "ready",
            "requestId": payload.get("requestId"),
            "ownerToken": payload.get("ownerToken"),
            "audio": list(samples),
            "sampleRate": DEFAULT_SAMPLE_RATE,
            "durationMs": round(len(samples) / DEFAULT_SAMPLE_RATE * 1000),
            "outputPath": output_path,
            "syntheticAudio": True,
            "runtime": self.status["runtime"],
        }


class RealNanoRuntime:
    def __init__(self, args: argparse.Namespace, output_dir: Path) -> None:
        self.repo_dir = Path(args.runtime_dir or nano.DEFAULT_REPO_DIR).resolve()
        self.model_dir = Path(args.model_dir or (Path(nano.DEFAULT_MODEL_DIR) / MODEL_SUBDIR)).resolve()
        self.tokenizer_dir = Path(args.tokenizer_dir or (Path(nano.DEFAULT_MODEL_DIR) / TOKENIZER_SUBDIR)).resolve()
        self.output_dir = output_dir
        self.thread_count = int(args.threads or nano.DEFAULT_THREADS)
        self.max_new_frames = int(args.max_new_frames or nano.DEFAULT_MAX_NEW_FRAMES)
        self.sample_mode = str(args.sample_mode or nano.DEFAULT_SAMPLE_MODE)
        self.voice = str(args.voice or nano.DEFAULT_VOICE)
        self.streaming = not bool(args.no_streaming)
        self.runtime: Any = None
        self.runtime_metadata: dict[str, Any] = {}

    def start(self) -> dict[str, Any]:
        checks, model_root = validate_paths(self.repo_dir, self.model_dir, self.tokenizer_dir)
        failed = first_failure(checks)
        if failed:
            return make_status(
                ok=False,
                status="blocked",
                ready=False,
                reason=str(failed.get("failureClass") or failed.get("key") or "runtime-blocked"),
                detail=str(failed.get("detail") or "MOSS Nano runtime validation failed."),
                runtime=self.metadata(extra={"checks": checks, "modelRoot": str(model_root)}),
            )

        if str(self.repo_dir) not in sys.path:
            sys.path.insert(0, str(self.repo_dir))

        try:
            onnx_tts_runtime = importlib.import_module("onnx_tts_runtime")
            ort_cpu_runtime = importlib.import_module("ort_cpu_runtime")
            ort = importlib.import_module("onnxruntime")
            resident = importlib.import_module("moss_nano_resident_probe")
            requested, applied, unsupported = resident.build_ort_contract({
                "threads": self.thread_count,
                "sampleMode": self.sample_mode,
            }, ort)
            restore_session_factory = resident.patch_ort_session_factory(ort_cpu_runtime, ort, applied)
            try:
                started = time.perf_counter()
                self.runtime = onnx_tts_runtime.OnnxTtsRuntime(
                    model_dir=str(model_root),
                    thread_count=self.thread_count,
                    max_new_frames=self.max_new_frames,
                    do_sample=self.sample_mode != "greedy",
                    sample_mode=self.sample_mode,
                    output_dir=str(self.output_dir),
                )
                session_create_ms = int(round((time.perf_counter() - started) * 1000))
            finally:
                restore_session_factory()
            self.runtime_metadata = self.metadata(extra={
                "modelRoot": str(model_root),
                "sessionCreateMs": session_create_ms,
                "ort": {
                    "requested": requested,
                    "applied": applied,
                    "unsupported": unsupported,
                    "liveMetadata": resident.live_session_metadata(self.runtime),
                },
                "runtimeIdentity": resident.runtime_identity(self.runtime),
            })
            return make_status(
                ok=True,
                status="ready",
                ready=True,
                detail="MOSS Nano real ONNX runtime ready.",
                recoverable=False,
                runtime=self.runtime_metadata,
            )
        except Exception as error:  # noqa: BLE001 - fail closed with structured status.
            failure_class = resident.classify_exception(error)
            return make_status(
                ok=False,
                status="blocked" if failure_class in {"python-env", "source-download", "asset-download"} else "failed",
                ready=False,
                reason=failure_class,
                detail=tail(str(error)),
                runtime=self.metadata(extra={"checks": checks, "modelRoot": str(model_root)}),
            )

    def metadata(self, extra: dict[str, Any] | None = None) -> dict[str, Any]:
        metadata = {
            "backend": "moss-nano-onnx",
            "modelVariant": "moss-tts-nano-onnx",
            "syntheticAudio": False,
            "repoDir": str(self.repo_dir),
            "modelDir": str(self.model_dir),
            "tokenizerDir": str(self.tokenizer_dir),
            "pythonExecutable": sys.executable,
            "pid": os.getpid(),
            "threadCount": self.thread_count,
            "maxNewFrames": self.max_new_frames,
            "sampleMode": self.sample_mode,
            "streaming": self.streaming,
        }
        if extra:
            metadata.update(extra)
        return metadata

    def synthesize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        if self.runtime is None:
            return {
                "type": "error",
                "ok": False,
                "status": "blocked",
                "reason": "runtime-not-ready",
                "detail": "MOSS Nano real runtime is not ready.",
                "requestId": payload.get("requestId"),
                "ownerToken": payload.get("ownerToken"),
            }
        request_id = str(payload.get("requestId") or f"nano-{int(time.time() * 1000)}")
        output_path = self.output_dir / f"{request_id}.wav"
        if output_path.exists():
            output_path.unlink()
        started = time.perf_counter()
        result = self.runtime.synthesize(
            text=str(payload.get("text") or "").strip(),
            voice=str(payload.get("voice") or self.voice),
            prompt_audio_path=None,
            output_audio_path=str(output_path),
            sample_mode=self.sample_mode,
            do_sample=self.sample_mode != "greedy",
            streaming=self.streaming,
            max_new_frames=self.max_new_frames,
            enable_wetext=not bool(nano.DEFAULT_DISABLE_WETEXT_PROCESSING),
            enable_normalize_tts_text=True,
        )
        total_ms = int(round((time.perf_counter() - started) * 1000))
        real_output_path = Path(str(result.get("audio_path") or output_path))
        audio, sample_rate, duration_ms = wav_to_float_audio(real_output_path)
        return {
            "type": "result",
            "ok": True,
            "status": "ready",
            "requestId": payload.get("requestId"),
            "ownerToken": payload.get("ownerToken"),
            "audio": audio,
            "sampleRate": sample_rate,
            "durationMs": duration_ms,
            "outputPath": str(real_output_path),
            "syntheticAudio": False,
            "runtime": {
                **self.runtime_metadata,
                "lastSynthesizeMs": total_ms,
                "audioDurationSec": round(duration_ms / 1000, 4) if duration_ms else None,
            },
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Blurby MOSS Nano app sidecar bridge")
    parser.add_argument("--runtime-dir", default=None)
    parser.add_argument("--model-dir", default=None)
    parser.add_argument("--tokenizer-dir", default=None)
    parser.add_argument("--output-dir", default=None)
    parser.add_argument("--threads", type=int, default=nano.DEFAULT_THREADS)
    parser.add_argument("--max-new-frames", type=int, default=nano.DEFAULT_MAX_NEW_FRAMES)
    parser.add_argument("--sample-mode", default=nano.DEFAULT_SAMPLE_MODE)
    parser.add_argument("--voice", default=nano.DEFAULT_VOICE)
    parser.add_argument("--no-streaming", action="store_true")
    parser.add_argument("--mock", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir or Path(tempfile.gettempdir()) / "blurby-moss-nano")
    output_dir.mkdir(parents=True, exist_ok=True)

    runtime = MockNanoRuntime(output_dir) if args.mock else RealNanoRuntime(args, output_dir)
    if isinstance(runtime, RealNanoRuntime):
        status = runtime.start()
    else:
        status = runtime.status
    emit(status)

    cancelled: set[str] = set()
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            payload = json.loads(line)
            command = payload.get("command")
            if command == "status":
                current = runtime.status if isinstance(runtime, MockNanoRuntime) else make_status(
                    ok=status.get("ok") is True,
                    status=str(status.get("status") or "blocked"),
                    ready=bool(status.get("ready")),
                    reason=status.get("reason"),
                    detail=status.get("detail"),
                    recoverable=bool(status.get("recoverable", True)),
                    runtime=status.get("runtime"),
                )
                current["type"] = "status"
                current["controlId"] = payload.get("controlId")
                emit(current)
            elif command == "cancel":
                request_id = payload.get("requestId")
                if request_id:
                    cancelled.add(str(request_id))
                emit({
                    "type": "cancelled",
                    "ok": True,
                    "cancelled": True,
                    "requestId": request_id,
                    "ownerToken": payload.get("ownerToken"),
                    "controlId": payload.get("controlId"),
                })
            elif command == "synthesize":
                request_id = str(payload.get("requestId") or "")
                if request_id in cancelled:
                    cancelled.discard(request_id)
                    emit({
                        "type": "error",
                        "ok": False,
                        "status": "failed",
                        "reason": "cancelled",
                        "detail": "MOSS Nano synthesize request was cancelled.",
                        "requestId": payload.get("requestId"),
                        "ownerToken": payload.get("ownerToken"),
                    })
                elif status.get("ready") is not True:
                    emit({
                        "type": "error",
                        "ok": False,
                        "status": status.get("status") or "blocked",
                        "reason": status.get("reason") or "runtime-not-ready",
                        "detail": status.get("detail") or "MOSS Nano runtime is not ready.",
                        "requestId": payload.get("requestId"),
                        "ownerToken": payload.get("ownerToken"),
                    })
                else:
                    emit(runtime.synthesize(payload))
            elif command == "shutdown":
                emit({
                    "type": "status",
                    "ok": True,
                    "status": "shutdown",
                    "ready": False,
                    "controlId": payload.get("controlId"),
                })
                runtime.runtime = None if isinstance(runtime, RealNanoRuntime) else getattr(runtime, "runtime", None)
                gc.collect()
                return 0
            else:
                emit({
                    "type": "error",
                    "ok": False,
                    "status": "failed",
                    "reason": "unknown-command",
                    "detail": f"Unknown MOSS Nano sidecar command: {command}",
                    "requestId": payload.get("requestId"),
                    "ownerToken": payload.get("ownerToken"),
                })
        except Exception as error:  # noqa: BLE001 - protocol errors should be structured.
            emit({
                "type": "error",
                "ok": False,
                "status": "failed",
                "reason": "sidecar-bridge-error",
                "detail": tail(str(error)),
            })
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
