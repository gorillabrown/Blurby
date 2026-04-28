#!/usr/bin/env python3
"""CPU-only MOSS-TTS-Nano ONNX probe.

This runner validates only local source and model assets, then tries a local
Nano ONNX entrypoint if one is present. It never downloads code or weights.
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import queue
import re
import shlex
import subprocess
import sys
import threading
import time
import wave
from pathlib import Path
from typing import Any


DEFAULT_RUN_ID = "moss-nano-1-probe"
DEFAULT_PASSAGE_ID = "short-smoke"
BUILT_IN_PASSAGES = {
    "short-smoke": "The little probe spoke once, paused, and finished cleanly.",
    "punctuation-heavy-mid": "Wait... really? Yes: commas, semicolons; dashes, quotes, and parentheses all need a calm voice.",
    "dialogue-switches": '"Are you ready?" she asked. "Ready," he said. The narrator waited, then the room answered.',
    "long-form-3min": " ".join(
        [
            "This is a longer Nano passage for local MOSS smoke testing.",
            "It is intentionally plain, steady, and paragraph shaped so the runtime can exercise batching, punctuation, and continuity.",
            "The probe should not fetch model assets or repair the runtime automatically.",
            "It should only use the configured local paths, generate audio when local assets are ready, and report a concise summary.",
        ]
    ),
}
PASSAGE_ALIASES = {
    "short": "short-smoke",
    "punctuation": "punctuation-heavy-mid",
}
DEFAULT_BACKEND = "moss-nano-onnx"
DEFAULT_DEVICE = "cpu"
DEFAULT_MODEL_VARIANT = "moss-tts-nano-onnx"
DEFAULT_REPO_DIR = Path(".runtime") / "moss" / "MOSS-TTS-Nano"
DEFAULT_MODEL_DIR = Path(".runtime") / "moss" / "weights" / "MOSS-TTS-Nano-ONNX"
DEFAULT_OUTPUT_ROOT = Path("artifacts") / "moss"
DEFAULT_THREADS = 4
DEFAULT_SAMPLE_RATE = 48000
DEFAULT_MAX_NEW_FRAMES = 375
DEFAULT_SAMPLE_MODE = "fixed"
DEFAULT_STREAMING = True
DEFAULT_DISABLE_WETEXT_PROCESSING = True
DEFAULT_VOICE = "Junhao"
DEFAULT_PROCESS_MODE = "cold"
DEFAULT_ITERATIONS = 1
DEFAULT_WARMUP_RUNS = 0
DEFAULT_PREWARM = "none"
DEFAULT_SEGMENT_POLICY = "none"
DEFAULT_SEGMENT_SOURCE = "raw"
EXPECTED_MODEL_SUBDIRS = ("MOSS-TTS-Nano-100M-ONNX", "MOSS-Audio-Tokenizer-Nano-ONNX")
TAIL_LIMIT = 12000
SEGMENT_POLICIES = ("none", "first-sentence", "natural-break", "token-window", "char-window")
ORT_GRAPH_OPTIMIZATION_LEVELS = ("disable", "basic", "extended", "all")


def parse_args(argv: list[str]) -> dict[str, Any]:
    parser = argparse.ArgumentParser(description="Run a local CPU-only MOSS-TTS-Nano ONNX probe.")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--config", dest="configPath")
    parser.add_argument("--run-id", dest="runId", default=DEFAULT_RUN_ID)
    parser.add_argument("--passage-id", "--passage", dest="passageId", default=DEFAULT_PASSAGE_ID)
    parser.add_argument("--passage-text", dest="passageText", default="")
    parser.add_argument("--allow-empty-passage", dest="allowEmptyPassage", action="store_true")
    parser.add_argument("--output-dir", "--out", dest="outputDir", default="")
    parser.add_argument("--repo-dir", dest="repoDir", default=str(DEFAULT_REPO_DIR))
    parser.add_argument("--model-dir", dest="modelDir", default=str(DEFAULT_MODEL_DIR))
    parser.add_argument("--threads", dest="threads", type=int, default=DEFAULT_THREADS)
    parser.add_argument("--max-new-frames", dest="maxNewFrames", type=int, default=DEFAULT_MAX_NEW_FRAMES)
    parser.add_argument("--sample-mode", dest="sampleMode", default=DEFAULT_SAMPLE_MODE)
    parser.add_argument("--voice", dest="voice", default=DEFAULT_VOICE)
    parser.add_argument("--prompt-audio", dest="promptAudio")
    parser.add_argument("--disable-wetext-processing", dest="disableWetextProcessing", action="store_true", default=None)
    parser.add_argument("--enable-wetext-processing", dest="disableWetextProcessing", action="store_false")
    parser.add_argument("--process-mode", choices=("cold", "warm"), dest="processMode", default=DEFAULT_PROCESS_MODE)
    parser.add_argument("--iterations", dest="iterations", type=int, default=DEFAULT_ITERATIONS)
    parser.add_argument("--warmup-runs", dest="warmupRuns", type=int, default=DEFAULT_WARMUP_RUNS)
    parser.add_argument("--prewarm", choices=("none", "ort-sessions", "synthetic-synth"), dest="prewarm", default=DEFAULT_PREWARM)
    parser.add_argument("--profile-stages", dest="profileStages", action="store_true")
    parser.add_argument("--profile-events-jsonl", dest="profileEventsJsonl")
    parser.add_argument("--segment-policy", choices=SEGMENT_POLICIES, dest="segmentPolicy", default=DEFAULT_SEGMENT_POLICY)
    parser.add_argument("--segment-max-tokens", dest="segmentMaxTokens", type=int)
    parser.add_argument("--segment-max-chars", dest="segmentMaxChars", type=int)
    parser.add_argument("--segment-min-chars", dest="segmentMinChars", type=int)
    parser.add_argument("--segment-source", choices=("raw", "prepared"), dest="segmentSource", default=DEFAULT_SEGMENT_SOURCE)
    parser.add_argument("--write-segment-wavs", dest="writeSegmentWavs", action="store_true")
    parser.add_argument("--ort-providers", dest="ortProviders")
    parser.add_argument("--ort-intra-op-threads", dest="ortIntraOpThreads", type=int)
    parser.add_argument("--ort-inter-op-threads", dest="ortInterOpThreads", type=int)
    parser.add_argument("--ort-execution-mode", choices=("sequential", "parallel"), dest="ortExecutionMode")
    parser.add_argument("--ort-graph-optimization", choices=ORT_GRAPH_OPTIMIZATION_LEVELS, dest="ortGraphOptimization")
    parser.add_argument("--ort-enable-cpu-mem-arena", dest="ortEnableCpuMemArena", action=argparse.BooleanOptionalAction)
    parser.add_argument("--ort-enable-mem-pattern", dest="ortEnableMemPattern", action=argparse.BooleanOptionalAction)
    parser.add_argument("--ort-enable-mem-reuse", dest="ortEnableMemReuse", action=argparse.BooleanOptionalAction)
    parser.add_argument("--ort-use-per-session-threads", dest="ortUsePerSessionThreads", action=argparse.BooleanOptionalAction)
    parser.add_argument("--precompute-inputs", dest="precomputeInputs", action="store_true")
    return vars(parser.parse_args(argv))


def load_config(path_value: str | None) -> tuple[dict[str, Any], str | None]:
    if not path_value:
        return {}, None
    target = Path(path_value)
    try:
        with target.open("r", encoding="utf-8") as handle:
            payload = json.load(handle)
    except FileNotFoundError:
        return {}, f"Nano config was not found at {target}."
    except json.JSONDecodeError as exc:
        return {}, f"Nano config at {target} is invalid JSON: {exc.msg}."
    except OSError as exc:
        return {}, f"Nano config at {target} could not be read: {exc}."
    if not isinstance(payload, dict):
        return {}, f"Nano config at {target} must be a JSON object."
    payload["_configPath"] = str(target)
    return payload, None


def merge_config(command: dict[str, Any], config: dict[str, Any]) -> dict[str, Any]:
    merged = dict(config)
    for key, value in command.items():
        if key in {"json"}:
            continue
        if value not in (None, ""):
            merged[key] = value
    merged.setdefault("runId", DEFAULT_RUN_ID)
    merged.setdefault("passageId", DEFAULT_PASSAGE_ID)
    merged.setdefault("repoDir", str(DEFAULT_REPO_DIR))
    merged.setdefault("modelDir", str(DEFAULT_MODEL_DIR))
    merged.setdefault("threads", DEFAULT_THREADS)
    merged.setdefault("sampleRate", DEFAULT_SAMPLE_RATE)
    merged.setdefault("maxNewFrames", DEFAULT_MAX_NEW_FRAMES)
    merged.setdefault("sampleMode", DEFAULT_SAMPLE_MODE)
    merged.setdefault("streaming", DEFAULT_STREAMING)
    merged.setdefault("disableWetextProcessing", DEFAULT_DISABLE_WETEXT_PROCESSING)
    merged.setdefault("voice", DEFAULT_VOICE)
    merged.setdefault("backend", DEFAULT_BACKEND)
    merged.setdefault("device", DEFAULT_DEVICE)
    merged.setdefault("modelVariant", DEFAULT_MODEL_VARIANT)
    merged.setdefault("processMode", DEFAULT_PROCESS_MODE)
    merged.setdefault("iterations", DEFAULT_ITERATIONS)
    merged.setdefault("warmupRuns", DEFAULT_WARMUP_RUNS)
    merged.setdefault("prewarm", DEFAULT_PREWARM)
    merged.setdefault("profileStages", False)
    merged.setdefault("segmentPolicy", DEFAULT_SEGMENT_POLICY)
    merged.setdefault("segmentSource", DEFAULT_SEGMENT_SOURCE)
    merged.setdefault("writeSegmentWavs", False)
    merged.setdefault("precomputeInputs", False)
    merged.setdefault("allowEmptyPassage", False)
    return merged


def resolve_passage_id(passage_id: str | None) -> str:
    value = passage_id or DEFAULT_PASSAGE_ID
    return PASSAGE_ALIASES.get(value, value)


def resolve_passage_options(options: dict[str, Any]) -> dict[str, Any]:
    resolved = dict(options)
    passage_id = resolve_passage_id(str(resolved.get("passageId") or DEFAULT_PASSAGE_ID))
    resolved["passageId"] = passage_id
    if not str(resolved.get("passageText") or ""):
        resolved["passageText"] = BUILT_IN_PASSAGES.get(passage_id, "")
    return resolved


def output_dir(options: dict[str, Any]) -> Path:
    run_id = str(options.get("runId") or DEFAULT_RUN_ID)
    root = Path(str(options.get("outputDir") or DEFAULT_OUTPUT_ROOT))
    if root.resolve().name == run_id:
        return root.resolve()
    return (root / run_id).resolve()


def make_check(key: str, status: str, detail: str, failure_class: str | None = None) -> dict[str, Any]:
    return {"key": key, "status": status, "detail": detail, "failureClass": failure_class}


def first_failure(checks: list[dict[str, Any]]) -> dict[str, Any] | None:
    for check in checks:
        if check.get("status") == "fail":
            return check
    return None


def tail_text(value: str, limit: int = TAIL_LIMIT) -> str:
    text = (value or "").strip()
    return text if len(text) <= limit else text[-limit:]


def get_peak_memory_mb() -> float | None:
    try:
        import resource  # type: ignore

        value = float(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)
        if sys.platform == "darwin":
            return round(value / (1024 * 1024), 2)
        return round(value / 1024, 2)
    except Exception:
        pass
    try:
        import psutil  # type: ignore

        return round(float(psutil.Process(os.getpid()).memory_info().rss) / (1024 * 1024), 2)
    except Exception:
        return None


def wav_duration_sec(path: Path) -> float | None:
    if not path.is_file():
        return None
    try:
        with wave.open(str(path), "rb") as wav:
            rate = wav.getframerate()
            if rate <= 0:
                return None
            return round(float(wav.getnframes()) / float(rate), 4)
    except Exception:
        return None


def percentile(values: list[float], pct: float) -> float | None:
    if not values:
        return None
    ordered = sorted(float(value) for value in values)
    if len(ordered) == 1:
        return round(ordered[0], 4)
    rank = (len(ordered) - 1) * pct
    lower = int(rank)
    upper = min(lower + 1, len(ordered) - 1)
    weight = rank - lower
    return round(ordered[lower] * (1 - weight) + ordered[upper] * weight, 4)


def compact_stats(values: list[float | None]) -> dict[str, float | None]:
    numeric = [float(value) for value in values if isinstance(value, (int, float))]
    return {
        "min": round(min(numeric), 4) if numeric else None,
        "max": round(max(numeric), 4) if numeric else None,
        "p50": percentile(numeric, 0.5),
        "p95": percentile(numeric, 0.95),
    }


def split_passage(text: str, options: dict[str, Any]) -> list[dict[str, Any]]:
    policy = str(options.get("segmentPolicy") or DEFAULT_SEGMENT_POLICY)
    max_tokens = int(options.get("segmentMaxTokens") or 0)
    max_chars = int(options.get("segmentMaxChars") or 0)
    min_chars = int(options.get("segmentMinChars") or 0)
    stripped = text.strip()
    if not stripped:
        return [{"index": 0, "text": "", "charCount": 0, "wordCount": 0}]
    if policy == "none":
        parts = [stripped]
    elif policy == "first-sentence":
        match = re.search(r".+?[.!?](?:\s|$)", stripped)
        parts = [match.group(0).strip() if match else stripped]
    elif policy == "natural-break":
        candidates = [part.strip() for part in re.split(r"(?<=[.!?])\s+|\n{2,}", stripped) if part.strip()]
        parts = []
        current = ""
        limit = max_chars if max_chars > 0 else 0
        for candidate in candidates:
            proposed = f"{current} {candidate}".strip() if current else candidate
            if current and limit and len(proposed) > limit and len(current) >= min_chars:
                parts.append(current)
                current = candidate
            else:
                current = proposed
        if current:
            parts.append(current)
    elif policy == "token-window":
        words = stripped.split()
        window = max_tokens if max_tokens > 0 else max(1, len(words))
        parts = [" ".join(words[index : index + window]) for index in range(0, len(words), window)]
    elif policy == "char-window":
        window = max_chars if max_chars > 0 else len(stripped)
        parts = [stripped[index : index + window].strip() for index in range(0, len(stripped), window)]
    else:
        parts = [stripped]

    return [
        {
            "index": index,
            "text": part,
            "charCount": len(part),
            "wordCount": len(part.split()),
        }
        for index, part in enumerate(part for part in parts if part)
    ] or [{"index": 0, "text": stripped, "charCount": len(stripped), "wordCount": len(stripped.split())}]


def ort_metadata(options: dict[str, Any]) -> dict[str, Any]:
    requested = {
        "providers": [item.strip() for item in str(options.get("ortProviders") or "").split(",") if item.strip()],
        "intraOpThreads": options.get("ortIntraOpThreads"),
        "interOpThreads": options.get("ortInterOpThreads"),
        "executionMode": options.get("ortExecutionMode"),
        "graphOptimization": options.get("ortGraphOptimization"),
        "enableCpuMemArena": options.get("ortEnableCpuMemArena"),
        "enableMemPattern": options.get("ortEnableMemPattern"),
        "enableMemReuse": options.get("ortEnableMemReuse"),
        "usePerSessionThreads": options.get("ortUsePerSessionThreads"),
    }
    any_requested = any(value not in (None, [], "") for value in requested.values())
    return {
        "requested": requested,
        "available": {
            "directSessionConfiguration": False,
            "reason": "Probe executes the repo-local Nano CLI as a subprocess and cannot safely mutate its ONNX Runtime SessionOptions.",
        },
        "appliedToCommand": False,
        "unsupported": any_requested,
    }


def stage_profile_template(enabled: bool) -> dict[str, Any]:
    return {
        "enabled": bool(enabled),
        "supported": False,
        "limitations": "Probe observes subprocess wall time and output WAV file growth only; internal tokenize/prepare/ORT/decode stage timings are unavailable without runtime instrumentation.",
        "stagesSec": {
            "precomputeInputs": None,
            "runtimeStartup": None,
            "modelLoad": None,
            "tokenize": None,
            "prepareInputs": None,
            "onnxInference": None,
            "decode": None,
            "writeWav": None,
            "internalFirstDecodedAudio": None,
        },
    }


def append_event(events_path: Path | None, event: dict[str, Any]) -> None:
    if not events_path:
        return
    events_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"ts": round(time.time(), 6), **event}
    with events_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(payload, separators=(",", ":")) + "\n")


def validate_local_runtime(options: dict[str, Any]) -> list[dict[str, Any]]:
    checks: list[dict[str, Any]] = []
    repo_dir = Path(str(options.get("repoDir") or DEFAULT_REPO_DIR))
    model_dir = Path(str(options.get("modelDir") or DEFAULT_MODEL_DIR))

    if sys.version_info < (3, 9):
        version = ".".join(str(part) for part in sys.version_info[:3])
        checks.append(make_check("pythonVersion", "fail", f"Python {version} is below required 3.9.", "python-env"))
        return checks
    checks.append(make_check("pythonVersion", "pass", f"Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro} is supported."))

    if not repo_dir.is_dir():
        checks.append(make_check("sourceRepo", "fail", f"Nano source repo is missing at {repo_dir}.", "source-download"))
        return checks
    if not any(repo_dir.rglob("*.py")):
        checks.append(make_check("sourceRepo", "fail", f"Nano source repo at {repo_dir} has no Python sources.", "source-download"))
        return checks
    checks.append(make_check("sourceRepo", "pass", f"Nano source repo is present at {repo_dir}."))

    if not model_dir.is_dir():
        checks.append(make_check("modelRoot", "fail", f"Nano ONNX model root is missing at {model_dir}.", "asset-download"))
        return checks
    checks.append(make_check("modelRoot", "pass", f"Nano ONNX model root is present at {model_dir}."))

    for subdir in EXPECTED_MODEL_SUBDIRS:
        candidate = model_dir / subdir
        if not candidate.is_dir():
            checks.append(make_check("modelSubdir", "fail", f"Expected model subdir is missing: {candidate}.", "asset-download"))
            return checks
        onnx_files = sorted(candidate.rglob("*.onnx"))
        if not onnx_files:
            checks.append(make_check("onnxAssets", "fail", f"No ONNX files found in expected subdir: {candidate}.", "asset-download"))
            return checks
        checks.append(make_check("onnxAssets", "pass", f"Found {len(onnx_files)} ONNX file(s) in {candidate}."))

    if options.get("promptAudio") and not Path(str(options["promptAudio"])).is_file():
        checks.append(make_check("promptAudio", "fail", f"Prompt audio was not found at {options['promptAudio']}.", "asset-download"))
        return checks
    if options.get("promptAudio"):
        checks.append(make_check("promptAudio", "pass", f"Prompt audio is present at {options['promptAudio']}."))

    required_modules = ("onnxruntime", "numpy", "sentencepiece", "torch", "torchaudio")
    for module in required_modules:
        if importlib.util.find_spec(module) is None:
            checks.append(make_check("pythonDependency", "fail", f"Python dependency is missing: {module}.", "python-env"))
            return checks
    checks.append(make_check("pythonDependency", "pass", f"Required Python dependencies {', '.join(required_modules)} are importable."))

    return checks


def format_command_part(value: str, context: dict[str, Any]) -> str:
    return value.format(**context)


def configured_command(options: dict[str, Any], context: dict[str, Any]) -> list[str] | None:
    for key in ("probeCommand", "generateCommand", "nanoCommand", "inferCommand"):
        value = options.get(key)
        if isinstance(value, list) and value:
            return [format_command_part(str(part), context) for part in value]
        if isinstance(value, str) and value.strip():
            return [format_command_part(part, context) for part in shlex.split(value, posix=(os.name != "nt"))]

    repo_dir = Path(str(options.get("repoDir") or DEFAULT_REPO_DIR))
    infer_candidates = [
        repo_dir / "infer_onnx.py",
        repo_dir / "examples" / "infer_onnx.py",
        repo_dir / "scripts" / "infer_onnx.py",
    ]
    for script in infer_candidates:
        if script.is_file():
            cmd = [
                sys.executable,
                str(script.resolve()),
                "--text",
                context["passageText"],
                "--output-audio-path",
                context["outputWavPath"],
                "--model-dir",
                context["modelDir"],
                "--cpu-threads",
                str(context["threads"]),
                "--max-new-frames",
                str(context["maxNewFrames"]),
                "--sample-mode",
                context["sampleMode"],
                "--voice",
                context["voice"],
                "--realtime-streaming-decode",
                "1" if context["streaming"] else "0",
            ]
            if context.get("promptAudio"):
                cmd.extend(["--prompt-audio-path", context["promptAudio"]])
            if context.get("disableWetextProcessing"):
                cmd.append("--disable-wetext-processing")
            return cmd

    return None


def reader_thread(stream: Any, name: str, events: "queue.Queue[tuple[str, bytes]]") -> None:
    try:
        while True:
            chunk = stream.readline()
            if not chunk:
                break
            events.put((name, chunk))
    finally:
        try:
            stream.close()
        except Exception:
            pass


def run_command(command: list[str], cwd: str, output_wav: Path, streaming: bool) -> tuple[int, str, str, float | None, float, bool]:
    output_wav.unlink(missing_ok=True)
    file_reset_before_run = True
    start = time.perf_counter()
    events: "queue.Queue[tuple[str, bytes]]" = queue.Queue()
    proc = subprocess.Popen(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        stdin=subprocess.DEVNULL,
    )
    threads = [
        threading.Thread(target=reader_thread, args=(proc.stdout, "stdout", events), daemon=True),
        threading.Thread(target=reader_thread, args=(proc.stderr, "stderr", events), daemon=True),
    ]
    for thread in threads:
        thread.start()

    stdout_chunks: list[bytes] = []
    stderr_chunks: list[bytes] = []
    first_audio_sec: float | None = None
    while proc.poll() is None:
        try:
            name, chunk = events.get(timeout=0.05)
            if name == "stdout":
                stdout_chunks.append(chunk)
            else:
                stderr_chunks.append(chunk)
        except queue.Empty:
            pass
        if first_audio_sec is None and output_wav.is_file() and output_wav.stat().st_size > 44:
            first_audio_sec = round(time.perf_counter() - start, 4)

    for thread in threads:
        thread.join(timeout=1)
    while True:
        try:
            name, chunk = events.get_nowait()
            if name == "stdout":
                stdout_chunks.append(chunk)
            else:
                stderr_chunks.append(chunk)
        except queue.Empty:
            break

    total_sec = round(time.perf_counter() - start, 4)
    if first_audio_sec is None and streaming and output_wav.is_file() and output_wav.stat().st_size > 44:
        first_audio_sec = total_sec

    return (
        int(proc.returncode or 0),
        b"".join(stdout_chunks).decode("utf-8", errors="replace"),
        b"".join(stderr_chunks).decode("utf-8", errors="replace"),
        first_audio_sec,
        total_sec,
        file_reset_before_run,
    )


def base_summary(options: dict[str, Any]) -> dict[str, Any]:
    out_dir = output_dir(options)
    wav_path = out_dir / "output.wav"
    passage_text = str(options.get("passageText") or "")
    return {
        "ok": False,
        "status": "blocked",
        "runId": options.get("runId") or DEFAULT_RUN_ID,
        "passageId": options.get("passageId") or DEFAULT_PASSAGE_ID,
        "backend": options.get("backend") or DEFAULT_BACKEND,
        "device": options.get("device") or DEFAULT_DEVICE,
        "modelVariant": options.get("modelVariant") or DEFAULT_MODEL_VARIANT,
        "pythonExecutable": sys.executable,
        "threads": options.get("threads") or DEFAULT_THREADS,
        "sampleRate": options.get("sampleRate") or DEFAULT_SAMPLE_RATE,
        "maxNewFrames": options.get("maxNewFrames") or DEFAULT_MAX_NEW_FRAMES,
        "sampleMode": options.get("sampleMode") or DEFAULT_SAMPLE_MODE,
        "streaming": bool(options.get("streaming", DEFAULT_STREAMING)),
        "voice": options.get("voice") or DEFAULT_VOICE,
        "repoDir": str(options.get("repoDir") or DEFAULT_REPO_DIR),
        "modelDir": str(options.get("modelDir") or DEFAULT_MODEL_DIR),
        "expectedModelSubdirs": list(EXPECTED_MODEL_SUBDIRS),
        "promptAudio": options.get("promptAudio"),
        "wordCount": len(passage_text.split()),
        "totalSec": None,
        "firstAudioSec": None,
        "firstAudioObservedSec": None,
        "firstAudioObservation": {
            "kind": "file-observed-wav-bytes",
            "thresholdBytes": 44,
            "fileResetBeforeRun": None,
            "fieldAliases": ["firstAudioSec"],
            "internalFirstDecodedAudioSec": None,
            "internalFirstDecodedAudioSupported": False,
        },
        "audioDurationSec": None,
        "rtf": None,
        "peakMemoryMb": get_peak_memory_mb(),
        "outputWavPath": str(wav_path),
        "outputPath": str(wav_path),
        "segmentOutputWavPaths": [],
        "stdoutTail": "",
        "stderrTail": "",
        "commandMetadata": None,
        "checks": [],
        "failureClass": None,
        "error": None,
        "benchmark": {
            "processMode": options.get("processMode") or DEFAULT_PROCESS_MODE,
            "iterationsRequested": int(options.get("iterations") or DEFAULT_ITERATIONS),
            "warmupRunsRequested": int(options.get("warmupRuns") or DEFAULT_WARMUP_RUNS),
            "prewarm": options.get("prewarm") or DEFAULT_PREWARM,
            "runtimeReuseRequested": (options.get("processMode") == "warm"),
            "runtimeReuseSupported": False,
            "runtimeReuseActual": False,
            "precomputeInputsRequested": bool(options.get("precomputeInputs")),
        },
        "segmentation": {
            "policy": options.get("segmentPolicy") or DEFAULT_SEGMENT_POLICY,
            "source": options.get("segmentSource") or DEFAULT_SEGMENT_SOURCE,
            "maxTokens": options.get("segmentMaxTokens"),
            "maxChars": options.get("segmentMaxChars"),
            "minChars": options.get("segmentMinChars"),
            "writeSegmentWavs": bool(options.get("writeSegmentWavs")),
            "segments": [],
        },
        "ort": ort_metadata(options),
        "stageProfile": stage_profile_template(bool(options.get("profileStages"))),
        "iterations": [],
        "warmups": [],
        "aggregate": None,
    }


def summary_text(summary: dict[str, Any]) -> str:
    lines = [
        "MOSS Nano Probe",
        "===============",
        f"Status: {summary.get('status', 'unknown')}",
        f"Failure class: {summary.get('failureClass') or 'none'}",
        f"Run ID: {summary.get('runId', 'unknown')}",
        f"Passage: {summary.get('passageId', 'unknown')}",
        f"Backend: {summary.get('backend', 'unknown')}",
        f"Device: {summary.get('device', 'unknown')}",
        f"Output WAV: {summary.get('outputWavPath') or 'none'}",
        f"Total seconds: {summary.get('totalSec') if summary.get('totalSec') is not None else 'unknown'}",
        f"First WAV bytes seconds: {summary.get('firstAudioObservedSec') if summary.get('firstAudioObservedSec') is not None else 'unknown'}",
        f"Internal first decoded seconds: {summary.get('firstAudioObservation', {}).get('internalFirstDecodedAudioSec') if summary.get('firstAudioObservation', {}).get('internalFirstDecodedAudioSec') is not None else 'unsupported'}",
        f"Audio duration seconds: {summary.get('audioDurationSec') if summary.get('audioDurationSec') is not None else 'unknown'}",
        f"RTF: {summary.get('rtf') if summary.get('rtf') is not None else 'unknown'}",
        f"Peak memory: {summary.get('peakMemoryMb') if summary.get('peakMemoryMb') is not None else 'unknown'} MB",
        f"Process mode: {summary.get('benchmark', {}).get('processMode', 'unknown')}",
        f"Runtime reuse actual: {summary.get('benchmark', {}).get('runtimeReuseActual', 'unknown')}",
        f"Prewarm: {summary.get('benchmark', {}).get('prewarm', 'unknown')}",
        f"Iterations: {summary.get('aggregate', {}).get('iterations') if summary.get('aggregate') else len(summary.get('iterations', [])) or 'unknown'}",
    ]
    if summary.get("error"):
        lines.append(f"Error: {summary['error']}")
    return "\n".join(lines) + "\n"


def write_summary(summary: dict[str, Any], out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    (out_dir / "summary.txt").write_text(summary_text(summary), encoding="utf-8")


def classify_performance(summary: dict[str, Any]) -> None:
    duration = summary.get("audioDurationSec")
    total = summary.get("totalSec")
    if isinstance(duration, (int, float)) and isinstance(total, (int, float)) and duration > 0:
        rtf = round(float(total) / float(duration), 4)
        summary["rtf"] = rtf
        if rtf > 10:
            summary["ok"] = False
            summary["status"] = "failed"
            summary["failureClass"] = "performance"
            summary["error"] = f"Probe completed but RTF {rtf} exceeded the performance guardrail of 10."


def run_probe(command: dict[str, Any]) -> dict[str, Any]:
    config, config_error = load_config(command.get("configPath"))
    options = resolve_passage_options(merge_config(command, config))
    summary = base_summary(options)
    out_dir = output_dir(options)
    out_dir.mkdir(parents=True, exist_ok=True)

    if config_error:
        summary["failureClass"] = "config-missing" if "not found" in config_error else "runtime-contract"
        summary["error"] = config_error
        write_summary(summary, out_dir)
        return summary

    if not options.get("allowEmptyPassage") and not str(options.get("passageText") or "").strip():
        summary["failureClass"] = "runtime-contract"
        summary["error"] = "Passage text is empty. Provide --passage-text, use a built-in passage ID, or pass --allow-empty-passage for diagnostics."
        write_summary(summary, out_dir)
        return summary

    checks = validate_local_runtime(options)
    summary["checks"] = checks
    failed = first_failure(checks)
    if failed:
        summary["failureClass"] = failed.get("failureClass") or "runtime"
        summary["error"] = failed.get("detail")
        write_summary(summary, out_dir)
        return summary

    output_wav = out_dir / "output.wav"
    resolved_repo_dir = Path(str(options.get("repoDir") or DEFAULT_REPO_DIR)).resolve()
    resolved_model_dir = Path(str(options.get("modelDir") or DEFAULT_MODEL_DIR)).resolve()
    resolved_prompt_audio = ""
    if options.get("promptAudio"):
        resolved_prompt_audio = str(Path(str(options["promptAudio"])).resolve())
    context = {
        **options,
        "outputDir": str(out_dir),
        "outputWavPath": str(output_wav),
        "passageText": str(options.get("passageText") or ""),
        "repoDir": str(resolved_repo_dir),
        "modelDir": str(resolved_model_dir),
        "threads": int(options.get("threads") or DEFAULT_THREADS),
        "maxNewFrames": int(options.get("maxNewFrames") or DEFAULT_MAX_NEW_FRAMES),
        "sampleMode": str(options.get("sampleMode") or DEFAULT_SAMPLE_MODE),
        "streaming": bool(options.get("streaming", DEFAULT_STREAMING)),
        "disableWetextProcessing": bool(options.get("disableWetextProcessing", DEFAULT_DISABLE_WETEXT_PROCESSING)),
        "voice": str(options.get("voice") or DEFAULT_VOICE),
        "promptAudio": resolved_prompt_audio,
    }
    iterations = int(options.get("iterations") or DEFAULT_ITERATIONS)
    warmup_runs = int(options.get("warmupRuns") or DEFAULT_WARMUP_RUNS)
    if iterations <= 0:
        summary["failureClass"] = "runtime-contract"
        summary["error"] = "--iterations must be a positive integer."
        write_summary(summary, out_dir)
        return summary
    if warmup_runs < 0:
        summary["failureClass"] = "runtime-contract"
        summary["error"] = "--warmup-runs must be zero or greater."
        write_summary(summary, out_dir)
        return summary

    segments = split_passage(str(options.get("passageText") or ""), options)
    summary["segmentation"]["segments"] = [
        {key: value for key, value in segment.items() if key != "text"} for segment in segments
    ]
    if len(segments) > 1:
        summary["outputWavPath"] = None
        summary["outputPath"] = None
    events_path = Path(str(options["profileEventsJsonl"])).resolve() if options.get("profileEventsJsonl") else None
    if events_path:
        summary["profileEventsJsonlPath"] = str(events_path)

    probe_cmd = configured_command(options, context)
    if not probe_cmd:
        summary["failureClass"] = "runtime-contract"
        summary["error"] = "No local Nano ONNX entrypoint was found. Expected infer_onnx.py in the configured Nano source repo."
        summary["checks"].append(make_check("entrypoint", "fail", summary["error"], "runtime-contract"))
        write_summary(summary, out_dir)
        return summary

    executable = probe_cmd[0] if Path(probe_cmd[0]).is_file() else None
    if not executable:
        summary["failureClass"] = "runtime-contract"
        summary["error"] = f"Nano command executable was not found: {probe_cmd[0]}"
        write_summary(summary, out_dir)
        return summary
    probe_cmd[0] = executable
    summary["commandMetadata"] = {
        "executable": probe_cmd[0],
        "argv": probe_cmd[1:],
        "cwd": str(Path(str(options.get("repoDir") or DEFAULT_REPO_DIR)).resolve()),
        "requested": {
            "threads": command.get("threads"),
            "maxNewFrames": command.get("maxNewFrames"),
            "sampleMode": command.get("sampleMode"),
            "voice": command.get("voice"),
            "promptAudio": command.get("promptAudio"),
            "processMode": command.get("processMode"),
            "iterations": command.get("iterations"),
            "warmupRuns": command.get("warmupRuns"),
            "prewarm": command.get("prewarm"),
            "profileStages": command.get("profileStages"),
            "segmentPolicy": command.get("segmentPolicy"),
            "segmentMaxTokens": command.get("segmentMaxTokens"),
            "segmentMaxChars": command.get("segmentMaxChars"),
            "segmentMinChars": command.get("segmentMinChars"),
            "segmentSource": command.get("segmentSource"),
            "writeSegmentWavs": command.get("writeSegmentWavs"),
            "precomputeInputs": command.get("precomputeInputs"),
        },
        "effective": {
            "threads": context["threads"],
            "maxNewFrames": context["maxNewFrames"],
            "sampleMode": context["sampleMode"],
            "streaming": context["streaming"],
            "disableWetextProcessing": context["disableWetextProcessing"],
            "voice": context["voice"],
            "promptAudio": context["promptAudio"] or None,
            "processMode": options.get("processMode") or DEFAULT_PROCESS_MODE,
            "iterations": iterations,
            "warmupRuns": warmup_runs,
            "prewarm": options.get("prewarm") or DEFAULT_PREWARM,
            "profileStages": bool(options.get("profileStages")),
            "segmentPolicy": options.get("segmentPolicy") or DEFAULT_SEGMENT_POLICY,
            "segmentSource": options.get("segmentSource") or DEFAULT_SEGMENT_SOURCE,
            "writeSegmentWavs": bool(options.get("writeSegmentWavs")),
            "precomputeInputs": bool(options.get("precomputeInputs")),
        },
    }
    summary["checks"].append(make_check("entrypoint", "pass", f"Using local Nano command: {probe_cmd[0]}."))
    if options.get("processMode") == "warm":
        summary["checks"].append(
            make_check(
                "runtimeReuse",
                "warn",
                "Warm process mode was requested, but the probe can only launch the repo-local Nano CLI subprocess per segment/run.",
            )
        )
    if options.get("prewarm") == "ort-sessions":
        summary["checks"].append(
            make_check(
                "prewarm",
                "warn",
                "ORT session prewarm is unsupported from the probe subprocess boundary; no runtime sessions were reused.",
            )
        )

    def command_for(segment: dict[str, Any], wav_path: Path) -> list[str] | None:
        segment_context = {
            **context,
            "outputWavPath": str(wav_path),
            "passageText": str(segment["text"]),
        }
        built = configured_command(options, segment_context)
        if not built:
            return None
        built[0] = executable
        return built

    def run_one(iteration_index: int, segment: dict[str, Any], measured: bool, wav_path: Path) -> dict[str, Any]:
        cmd = command_for(segment, wav_path)
        if not cmd:
            raise RuntimeError("No local Nano ONNX entrypoint was found while preparing a segment run.")
        append_event(
            events_path,
            {
                "event": "run-start",
                "measured": measured,
                "iterationIndex": iteration_index,
                "segmentIndex": segment["index"],
                "wavPath": str(wav_path),
            },
        )
        code, stdout, stderr, first_audio_sec, total_sec, file_reset_before_run = run_command(
            cmd,
            str(resolved_repo_dir),
            wav_path,
            bool(options.get("streaming", DEFAULT_STREAMING)),
        )
        audio_duration = wav_duration_sec(wav_path)
        if first_audio_sec is None and audio_duration:
            first_audio_sec = total_sec
        result = {
            "iterationIndex": iteration_index,
            "segmentIndex": segment["index"],
            "measured": measured,
            "returnCode": code,
            "totalSec": total_sec,
            "firstAudioObservedSec": first_audio_sec,
            "firstAudioSec": first_audio_sec,
            "firstAudioObservation": {
                "kind": "file-observed-wav-bytes",
                "thresholdBytes": 44,
                "fileResetBeforeRun": file_reset_before_run,
                "internalFirstDecodedAudioSec": None,
                "internalFirstDecodedAudioSupported": False,
            },
            "audioDurationSec": audio_duration,
            "rtf": round(float(total_sec) / float(audio_duration), 4) if audio_duration else None,
            "wavPath": str(wav_path),
            "stdoutTail": tail_text(stdout),
            "stderrTail": tail_text(stderr),
            "stageProfile": stage_profile_template(bool(options.get("profileStages"))),
        }
        append_event(
            events_path,
            {
                "event": "run-end",
                "measured": measured,
                "iterationIndex": iteration_index,
                "segmentIndex": segment["index"],
                "returnCode": code,
                "totalSec": total_sec,
                "firstAudioObservedSec": first_audio_sec,
                "audioDurationSec": audio_duration,
            },
        )
        return result

    try:
        if warmup_runs:
            for warmup_index in range(warmup_runs):
                warmup_wav = out_dir / f"warmup_{warmup_index + 1:03d}.wav"
                warmup = run_one(warmup_index, segments[0], False, warmup_wav)
                summary["warmups"].append(warmup)
                if warmup["returnCode"] != 0:
                    summary["status"] = "failed"
                    summary["failureClass"] = "runtime"
                    summary["error"] = tail_text(warmup["stderrTail"] or warmup["stdoutTail"] or f"Nano warmup exited {warmup['returnCode']}.")
                    summary["returnCode"] = warmup["returnCode"]
                    write_summary(summary, out_dir)
                    return summary

        for iteration_index in range(iterations):
            segment_results = []
            for segment in segments:
                if len(segments) == 1:
                    wav_path = output_wav
                elif options.get("writeSegmentWavs"):
                    wav_path = out_dir / f"iteration_{iteration_index + 1:03d}_segment_{segment['index'] + 1:03d}.wav"
                else:
                    wav_path = out_dir / f"segment_probe_{iteration_index + 1:03d}_{segment['index'] + 1:03d}.wav"
                segment_result = run_one(iteration_index, segment, True, wav_path)
                segment_results.append(segment_result)
                if segment_result["returnCode"] != 0:
                    summary["status"] = "failed"
                    summary["failureClass"] = "runtime"
                    summary["error"] = tail_text(segment_result["stderrTail"] or segment_result["stdoutTail"] or f"Nano command exited {segment_result['returnCode']}.")
                    summary["returnCode"] = segment_result["returnCode"]
                    summary["stdoutTail"] = segment_result["stdoutTail"]
                    summary["stderrTail"] = segment_result["stderrTail"]
                    write_summary(summary, out_dir)
                    return summary
            total_sec = round(sum(float(item["totalSec"]) for item in segment_results), 4)
            audio_duration = round(sum(float(item["audioDurationSec"] or 0) for item in segment_results), 4) or None
            first_audio = segment_results[0].get("firstAudioObservedSec")
            segment_output_wav_paths = [item["wavPath"] for item in segment_results]
            iteration_summary = {
                "iterationIndex": iteration_index,
                "processMode": options.get("processMode") or DEFAULT_PROCESS_MODE,
                "runtimeReuseActual": False,
                "segmentCount": len(segment_results),
                "totalSec": total_sec,
                "firstAudioObservedSec": first_audio,
                "firstAudioSec": first_audio,
                "audioDurationSec": audio_duration,
                "rtf": round(total_sec / audio_duration, 4) if audio_duration else None,
                "outputWavPath": str(output_wav) if len(segment_results) == 1 else None,
                "outputPath": str(output_wav) if len(segment_results) == 1 else None,
                "segmentOutputWavPaths": segment_output_wav_paths,
                "segments": segment_results,
            }
            summary["iterations"].append(iteration_summary)
    except Exception as exc:
        summary["status"] = "failed"
        summary["failureClass"] = "runtime"
        summary["error"] = str(exc)
        summary["peakMemoryMb"] = get_peak_memory_mb()
        write_summary(summary, out_dir)
        return summary

    if not summary["iterations"]:
        summary["status"] = "failed"
        summary["failureClass"] = "runtime-contract"
        summary["error"] = "No measured iterations were executed."
        write_summary(summary, out_dir)
        return summary

    representative = summary["iterations"][-1]
    summary["stdoutTail"] = tail_text("\n".join(segment["stdoutTail"] for segment in representative["segments"]))
    summary["stderrTail"] = tail_text("\n".join(segment["stderrTail"] for segment in representative["segments"]))
    summary["totalSec"] = representative["totalSec"]
    summary["firstAudioSec"] = representative["firstAudioObservedSec"]
    summary["firstAudioObservedSec"] = representative["firstAudioObservedSec"]
    summary["firstAudioObservation"]["fileResetBeforeRun"] = all(
        bool(segment.get("firstAudioObservation", {}).get("fileResetBeforeRun"))
        for segment in representative["segments"]
    )
    summary["peakMemoryMb"] = get_peak_memory_mb()
    summary["audioDurationSec"] = representative["audioDurationSec"]
    summary["rtf"] = representative["rtf"]
    summary["segmentOutputWavPaths"] = list(representative.get("segmentOutputWavPaths") or [])
    if representative.get("segmentCount") == 1:
        summary["outputWavPath"] = representative.get("outputWavPath")
        summary["outputPath"] = representative.get("outputPath")
    else:
        summary["outputWavPath"] = None
        summary["outputPath"] = None

    if len(segments) == 1 and not output_wav.is_file():
        summary["status"] = "failed"
        summary["failureClass"] = "runtime-contract"
        summary["error"] = f"Nano command completed but did not create {output_wav}."
        write_summary(summary, out_dir)
        return summary

    if summary["firstAudioSec"] is None and summary["audioDurationSec"]:
        summary["firstAudioSec"] = summary["totalSec"]
        summary["firstAudioObservedSec"] = summary["totalSec"]
        summary["checks"].append(
            make_check(
                "firstAudio",
                "warn",
                "First audio was not observable from subprocess streaming; using totalSec because valid output WAV data was produced.",
            )
        )
    elif summary["firstAudioSec"] is None:
        summary["checks"].append(make_check("firstAudio", "warn", "First audio was not observable from the subprocess."))

    summary["aggregate"] = {
        "iterations": len(summary["iterations"]),
        "warmupsExcluded": len(summary["warmups"]),
        "totalSec": compact_stats([item.get("totalSec") for item in summary["iterations"]]),
        "firstAudioObservedSec": compact_stats([item.get("firstAudioObservedSec") for item in summary["iterations"]]),
        "audioDurationSec": compact_stats([item.get("audioDurationSec") for item in summary["iterations"]]),
        "rtf": compact_stats([item.get("rtf") for item in summary["iterations"]]),
    }

    summary["ok"] = True
    summary["status"] = "ok"
    summary["failureClass"] = None
    summary["error"] = None
    classify_performance(summary)
    write_summary(summary, out_dir)
    return summary


def main(argv: list[str]) -> int:
    try:
        command = parse_args(argv)
        summary = run_probe(command)
    except Exception as exc:
        summary = {
            "ok": False,
            "status": "failed",
            "failureClass": "runtime-contract",
            "error": str(exc),
        }
    sys.stdout.write(json.dumps(summary, separators=(",", ":")) + "\n")
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
