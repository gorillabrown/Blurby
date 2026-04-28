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
EXPECTED_MODEL_SUBDIRS = ("MOSS-TTS-Nano-100M-ONNX", "MOSS-Audio-Tokenizer-Nano-ONNX")
TAIL_LIMIT = 12000


def parse_args(argv: list[str]) -> dict[str, Any]:
    parser = argparse.ArgumentParser(description="Run a local CPU-only MOSS-TTS-Nano ONNX probe.")
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--config", dest="configPath")
    parser.add_argument("--run-id", dest="runId", default=DEFAULT_RUN_ID)
    parser.add_argument("--passage-id", "--passage", dest="passageId", default=DEFAULT_PASSAGE_ID)
    parser.add_argument("--passage-text", dest="passageText", default="")
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
    return merged


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


def run_command(command: list[str], cwd: str, output_wav: Path, streaming: bool) -> tuple[int, str, str, float | None, float]:
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
        "audioDurationSec": None,
        "rtf": None,
        "peakMemoryMb": get_peak_memory_mb(),
        "outputWavPath": str(wav_path),
        "stdoutTail": "",
        "stderrTail": "",
        "commandMetadata": None,
        "checks": [],
        "failureClass": None,
        "error": None,
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
        f"First audio seconds: {summary.get('firstAudioSec') if summary.get('firstAudioSec') is not None else 'unknown'}",
        f"Audio duration seconds: {summary.get('audioDurationSec') if summary.get('audioDurationSec') is not None else 'unknown'}",
        f"RTF: {summary.get('rtf') if summary.get('rtf') is not None else 'unknown'}",
        f"Peak memory: {summary.get('peakMemoryMb') if summary.get('peakMemoryMb') is not None else 'unknown'} MB",
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
    options = merge_config(command, config)
    summary = base_summary(options)
    out_dir = output_dir(options)
    out_dir.mkdir(parents=True, exist_ok=True)

    if config_error:
        summary["failureClass"] = "config-missing" if "not found" in config_error else "runtime-contract"
        summary["error"] = config_error
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
    cmd = configured_command(options, context)
    if not cmd:
        summary["failureClass"] = "runtime-contract"
        summary["error"] = "No local Nano ONNX entrypoint was found. Expected infer_onnx.py in the configured Nano source repo."
        summary["checks"].append(make_check("entrypoint", "fail", summary["error"], "runtime-contract"))
        write_summary(summary, out_dir)
        return summary

    executable = cmd[0] if Path(cmd[0]).is_file() else None
    if not executable:
        summary["failureClass"] = "runtime-contract"
        summary["error"] = f"Nano command executable was not found: {cmd[0]}"
        write_summary(summary, out_dir)
        return summary
    cmd[0] = executable
    summary["commandMetadata"] = {
        "executable": cmd[0],
        "argv": cmd[1:],
        "cwd": str(Path(str(options.get("repoDir") or DEFAULT_REPO_DIR)).resolve()),
        "requested": {
            "threads": command.get("threads"),
            "maxNewFrames": command.get("maxNewFrames"),
            "sampleMode": command.get("sampleMode"),
            "voice": command.get("voice"),
            "promptAudio": command.get("promptAudio"),
        },
        "effective": {
            "threads": context["threads"],
            "maxNewFrames": context["maxNewFrames"],
            "sampleMode": context["sampleMode"],
            "streaming": context["streaming"],
            "disableWetextProcessing": context["disableWetextProcessing"],
            "voice": context["voice"],
            "promptAudio": context["promptAudio"] or None,
        },
    }
    summary["checks"].append(make_check("entrypoint", "pass", f"Using local Nano command: {cmd[0]}."))

    try:
        code, stdout, stderr, first_audio_sec, total_sec = run_command(
            cmd,
            str(resolved_repo_dir),
            output_wav,
            bool(options.get("streaming", DEFAULT_STREAMING)),
        )
    except Exception as exc:
        summary["status"] = "failed"
        summary["failureClass"] = "runtime"
        summary["error"] = str(exc)
        summary["peakMemoryMb"] = get_peak_memory_mb()
        write_summary(summary, out_dir)
        return summary

    summary["stdoutTail"] = tail_text(stdout)
    summary["stderrTail"] = tail_text(stderr)
    summary["totalSec"] = total_sec
    summary["firstAudioSec"] = first_audio_sec
    summary["peakMemoryMb"] = get_peak_memory_mb()

    if code != 0:
        summary["status"] = "failed"
        summary["failureClass"] = "runtime"
        summary["error"] = tail_text(stderr or stdout or f"Nano command exited {code}.")
        summary["returnCode"] = code
        write_summary(summary, out_dir)
        return summary

    if not output_wav.is_file():
        summary["status"] = "failed"
        summary["failureClass"] = "runtime-contract"
        summary["error"] = f"Nano command completed but did not create {output_wav}."
        write_summary(summary, out_dir)
        return summary

    audio_duration = wav_duration_sec(output_wav)
    summary["audioDurationSec"] = audio_duration
    if summary["firstAudioSec"] is None and audio_duration:
        summary["firstAudioSec"] = total_sec
        summary["checks"].append(
            make_check(
                "firstAudio",
                "warn",
                "First audio was not observable from subprocess streaming; using totalSec because a valid output WAV was produced.",
            )
        )
    elif summary["firstAudioSec"] is None:
        summary["checks"].append(make_check("firstAudio", "warn", "First audio was not observable from the subprocess."))

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
