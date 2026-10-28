#!/usr/bin/env python3
"""Resident JSON-lines bridge for local Pocket TTS.

Pocket is available as an explicit opt-in engine. The optional reference WAV is
accepted at the protocol layer for runtime work, but no v2.0 renderer UX exposes
voice cloning controls.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import sys
import wave
from array import array
from pathlib import Path
from typing import Any, Dict


DEFAULT_SAMPLE_RATE = 24000
DEFAULT_DURATION_MS = 220


def emit(message: Dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(message, separators=(",", ":")) + "\n")
    sys.stdout.flush()


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


def make_preview_audio(rate: float) -> array:
    total = max(1, int(DEFAULT_SAMPLE_RATE * (DEFAULT_DURATION_MS / 1000.0)))
    frequency = 392.0 * max(0.5, min(1.5, rate or 1.0))
    samples = array("f")
    for index in range(total):
        fade = min(1.0, index / 600.0, (total - index) / 600.0)
        samples.append(0.12 * fade * math.sin(2.0 * math.pi * frequency * index / DEFAULT_SAMPLE_RATE))
    return samples


def write_wav(output_dir: Path, request_id: str, samples: array) -> str:
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{request_id or 'pocket-preview'}.wav"
    pcm = array("h", [max(-32767, min(32767, int(sample * 32767))) for sample in samples])
    with wave.open(str(output_path), "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(DEFAULT_SAMPLE_RATE)
        wav.writeframes(pcm.tobytes())
    return str(output_path)


class MockPocketRuntime:
    def __init__(self, output_dir: Path, reference_wav: str | None) -> None:
        self.output_dir = output_dir
        self.reference_wav = reference_wav
        self.status = make_status(
            ok=True,
            status="ready",
            ready=True,
            detail="Pocket TTS mock sidecar bridge ready.",
            recoverable=False,
            runtime={
                "backend": "mock-tone",
                "modelVariant": "synthetic-test-only",
                "syntheticAudio": True,
                "pid": os.getpid(),
                "referenceWavAccepted": bool(reference_wav),
            },
        )

    def synthesize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        samples = make_preview_audio(float(payload.get("rate") or 1.0))
        output_path = write_wav(self.output_dir, str(payload.get("requestId") or "pocket-preview"), samples)
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


class RealPocketRuntime:
    def __init__(self, args: argparse.Namespace, output_dir: Path) -> None:
        self.runtime_dir = Path(args.runtime_dir or ".runtime/pocket-tts").resolve()
        self.model_dir = Path(args.model_dir or self.runtime_dir / "model").resolve()
        self.reference_wav = str(Path(args.reference_wav).resolve()) if args.reference_wav else None
        self.output_dir = output_dir
        self.runtime_metadata = {
            "backend": "pocket-tts",
            "modelVariant": "pocket-tts-local",
            "syntheticAudio": False,
            "pid": os.getpid(),
            "referenceWavAccepted": bool(self.reference_wav),
        }

    def start(self) -> dict[str, Any]:
        if not self.runtime_dir.is_dir():
            return make_status(
                ok=False,
                status="blocked",
                ready=False,
                reason="runtime-missing",
                detail=f"Pocket TTS runtime directory is missing at {self.runtime_dir}.",
                runtime=self.runtime_metadata,
            )
        if not self.model_dir.exists():
            return make_status(
                ok=False,
                status="blocked",
                ready=False,
                reason="model-missing",
                detail=f"Pocket TTS model path is missing at {self.model_dir}.",
                runtime=self.runtime_metadata,
            )
        if self.reference_wav and not Path(self.reference_wav).is_file():
            return make_status(
                ok=False,
                status="blocked",
                ready=False,
                reason="reference-wav-missing",
                detail=f"Pocket TTS reference WAV is missing at {self.reference_wav}.",
                runtime=self.runtime_metadata,
            )

        try:
            import pocket_tts  # type: ignore  # noqa: F401
        except Exception as error:
            return make_status(
                ok=False,
                status="unavailable",
                ready=False,
                reason="dependency-missing",
                detail=f"Pocket TTS Python package is unavailable: {error}",
                runtime=self.runtime_metadata,
            )

        return make_status(
            ok=True,
            status="ready",
            ready=True,
            detail="Pocket TTS runtime ready.",
            recoverable=False,
            runtime=self.runtime_metadata,
        )

    def synthesize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "type": "error",
            "ok": False,
            "status": "failed",
            "requestId": payload.get("requestId"),
            "ownerToken": payload.get("ownerToken"),
            "reason": "runtime-adapter-not-configured",
            "detail": "Pocket TTS runtime is present, but no concrete synthesize adapter is configured in this build.",
            "recoverable": True,
        }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Pocket TTS app sidecar")
    parser.add_argument("--runtime-dir")
    parser.add_argument("--model-dir")
    parser.add_argument("--output-dir", default=str(Path(".tmp/pocket-tts-sidecar")))
    parser.add_argument("--reference-wav")
    parser.add_argument("--mock", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    output_dir = Path(args.output_dir).resolve()
    runtime: Any = MockPocketRuntime(output_dir, args.reference_wav) if args.mock else RealPocketRuntime(args, output_dir)
    status = runtime.status if args.mock else runtime.start()
    emit(status)

    if not status.get("ready"):
        return 0

    for raw_line in sys.stdin:
        if not raw_line.strip():
            continue
        try:
            payload = json.loads(raw_line)
            command = payload.get("command")
            if command == "status":
                next_status = dict(status)
                next_status["type"] = "status"
                next_status["controlId"] = payload.get("controlId")
                emit(next_status)
            elif command == "synthesize":
                emit(runtime.synthesize(payload))
            elif command == "cancel":
                emit({
                    "type": "cancelled",
                    "ok": True,
                    "cancelled": True,
                    "requestId": payload.get("requestId"),
                    "ownerToken": payload.get("ownerToken"),
                    "controlId": payload.get("controlId"),
                    "recoverable": True,
                })
            elif command == "shutdown":
                emit({
                    "type": "status",
                    "ok": True,
                    "status": "shutdown",
                    "ready": False,
                    "loading": False,
                    "controlId": payload.get("controlId"),
                })
                return 0
            else:
                emit({
                    "type": "error",
                    "ok": False,
                    "status": "failed",
                    "reason": "unknown-command",
                    "detail": f"Unknown Pocket TTS sidecar command: {command}",
                    "requestId": payload.get("requestId"),
                    "ownerToken": payload.get("ownerToken"),
                })
        except Exception as error:
            emit({
                "type": "error",
                "ok": False,
                "status": "failed",
                "reason": "sidecar-exception",
                "detail": str(error),
            })
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
