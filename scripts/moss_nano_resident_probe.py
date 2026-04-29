#!/usr/bin/env python3
"""Resident CPU-only MOSS-TTS-Nano ONNX probe.

This diagnostic path imports the upstream Nano ONNX runtime in-process, creates
one runtime instance, and reuses its ONNX sessions across warmup and measured
runs. It never downloads source or model assets.
"""

from __future__ import annotations

import importlib
import json
import os
import sys
import time
import traceback
from pathlib import Path
from typing import Any, Callable

import moss_nano_probe as nano


def now_ms(start: float) -> int:
    return int(round((time.perf_counter() - start) * 1000))


def strip_resident_args(argv: list[str]) -> dict[str, Any]:
    filtered: list[str] = []
    runtime_mode = "resident"
    index = 0
    while index < len(argv):
        arg = argv[index]
        if arg == "--runtime-mode":
            if index + 1 >= len(argv):
                raise ValueError("--runtime-mode requires a value")
            runtime_mode = argv[index + 1]
            index += 2
            continue
        filtered.append(arg)
        index += 1
    command = nano.parse_args(filtered)
    command["runtimeMode"] = runtime_mode
    return command


class EventRecorder:
    def __init__(self, events_path: Path | None) -> None:
        self.start = time.perf_counter()
        self.events_path = events_path
        self.events: list[dict[str, Any]] = []

    def record(self, event: str, **payload: Any) -> dict[str, Any]:
        item = {
            "event": event,
            "ts": round(time.time(), 6),
            "elapsedMs": now_ms(self.start),
            **payload,
        }
        self.events.append(item)
        if self.events_path:
            self.events_path.parent.mkdir(parents=True, exist_ok=True)
            with self.events_path.open("a", encoding="utf-8") as handle:
                handle.write(json.dumps(item, separators=(",", ":")) + "\n")
        return item


def base_resident_summary(options: dict[str, Any], out_dir: Path) -> dict[str, Any]:
    summary = nano.base_summary(options)
    requested_ort = requested_ort_options(options)
    summary.update(
        {
            "runtimeMode": "resident",
            "processMode": options.get("processMode") or nano.DEFAULT_PROCESS_MODE,
            "firstAudioSource": "internal-decoded-audio",
            "internalFirstDecodedAudioMs": None,
            "firstAudioObservedSec": None,
            "firstAudioObservation": {
                "kind": "internal-first-decoded-audio",
                "sourceEvent": "firstDecodedAudio",
                "internalFirstDecodedAudioMs": None,
                "internalFirstDecodedAudioSec": None,
                "internalFirstDecodedAudioSupported": True,
                "fileObservedAudioSec": None,
                "fileResetBeforeRun": True,
                "outputFileExistedBeforeRun": False,
                "reusedExistingOutputFile": False,
                "fieldAliases": ["firstAudioSec"],
            },
            "outputWavPath": str(out_dir / "output.wav"),
            "outputPath": str(out_dir / "output.wav"),
            "runtimeIdentity": None,
            "events": [],
            "ort": {
                "requested": requested_ort,
                "applied": None,
                "unsupported": {},
                "directSessionConfiguration": True,
                "status": "pending-runtime-import",
            },
            "ortOptionsRequested": requested_ort,
            "ortOptionsApplied": None,
            "ortOptionsUnsupported": {},
            "ortLiveMetadata": None,
            "stageProfile": {
                "enabled": bool(options.get("profileStages")),
                "supported": True,
                "limitations": "Resident probe emits import/session/inference events when local source and assets are available.",
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
            },
        }
    )
    summary["benchmark"].update(
        {
            "runtimeReuseRequested": True,
            "runtimeReuseSupported": True,
            "runtimeReuseActual": False,
        }
    )
    return summary


def requested_ort_options(options: dict[str, Any]) -> dict[str, Any]:
    return {
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


def graph_optimization_value(ort: Any, requested: str | None) -> tuple[Any, str]:
    normalized = str(requested or "all").strip().lower()
    mapping = {
        "disable": ("ORT_DISABLE_ALL", "disable"),
        "basic": ("ORT_ENABLE_BASIC", "basic"),
        "extended": ("ORT_ENABLE_EXTENDED", "extended"),
        "all": ("ORT_ENABLE_ALL", "all"),
    }
    attr_name, applied_name = mapping.get(normalized, mapping["all"])
    return getattr(ort.GraphOptimizationLevel, attr_name), applied_name


def execution_mode_value(ort: Any, requested: str | None) -> tuple[Any, str]:
    normalized = str(requested or "sequential").strip().lower()
    if normalized == "parallel":
        return getattr(ort.ExecutionMode, "ORT_PARALLEL"), "parallel"
    return getattr(ort.ExecutionMode, "ORT_SEQUENTIAL"), "sequential"


def build_ort_contract(options: dict[str, Any], ort: Any) -> tuple[dict[str, Any], dict[str, Any], dict[str, Any]]:
    requested = requested_ort_options(options)
    unsupported: dict[str, Any] = {}
    available_providers = list(ort.get_available_providers()) if hasattr(ort, "get_available_providers") else []
    requested_providers = requested["providers"] or ["CPUExecutionProvider"]
    applied_providers = [provider for provider in requested_providers if provider in available_providers]
    if not applied_providers:
        applied_providers = ["CPUExecutionProvider"] if "CPUExecutionProvider" in available_providers else requested_providers[:1]
    missing_providers = [provider for provider in requested_providers if provider not in applied_providers]
    if missing_providers:
        unsupported["providers"] = {
            "requested": requested_providers,
            "applied": applied_providers,
            "reason": f"Provider(s) unavailable in this onnxruntime build: {', '.join(missing_providers)}.",
        }

    _graph_value, graph_name = graph_optimization_value(ort, requested.get("graphOptimization"))
    _execution_value, execution_name = execution_mode_value(ort, requested.get("executionMode"))
    applied = {
        "providers": applied_providers,
        "availableProviders": available_providers,
        "intraOpThreads": int(requested.get("intraOpThreads") or options.get("threads") or nano.DEFAULT_THREADS),
        "interOpThreads": int(requested.get("interOpThreads") or 1),
        "executionMode": execution_name,
        "graphOptimization": graph_name,
        "enableCpuMemArena": True if requested.get("enableCpuMemArena") is None else bool(requested.get("enableCpuMemArena")),
        "enableMemPattern": True if requested.get("enableMemPattern") is None else bool(requested.get("enableMemPattern")),
        "enableMemReuse": True if requested.get("enableMemReuse") is None else bool(requested.get("enableMemReuse")),
    }
    if requested.get("usePerSessionThreads") is not None:
        unsupported["usePerSessionThreads"] = {
            "requested": bool(requested.get("usePerSessionThreads")),
            "reason": "The resident runtime owns one process-level runtime instance; this diagnostic does not mutate global ORT thread-pool policy.",
        }
    return requested, applied, unsupported


def patch_ort_session_factory(ort_cpu_runtime: Any, ort: Any, applied: dict[str, Any]) -> Callable[[], None]:
    original_session = ort_cpu_runtime.OrtCpuRuntime._session
    graph_value, _graph_name = graph_optimization_value(ort, applied.get("graphOptimization"))
    execution_value, _execution_name = execution_mode_value(ort, applied.get("executionMode"))

    def resident_session(self: Any, path_value: Path) -> Any:
        session_options = ort.SessionOptions()
        session_options.graph_optimization_level = graph_value
        session_options.execution_mode = execution_value
        session_options.intra_op_num_threads = int(applied["intraOpThreads"])
        session_options.inter_op_num_threads = int(applied["interOpThreads"])
        session_options.enable_cpu_mem_arena = bool(applied["enableCpuMemArena"])
        session_options.enable_mem_pattern = bool(applied["enableMemPattern"])
        session_options.enable_mem_reuse = bool(applied["enableMemReuse"])
        return ort.InferenceSession(
            str(path_value),
            sess_options=session_options,
            providers=list(applied["providers"]),
        )

    ort_cpu_runtime.OrtCpuRuntime._session = resident_session

    def restore() -> None:
        ort_cpu_runtime.OrtCpuRuntime._session = original_session

    return restore


def runtime_identity(runtime: Any) -> dict[str, Any]:
    sessions = getattr(runtime, "sessions", {}) or {}
    return {
        "pythonProcessIdentity": f"python-pid:{os.getpid()}",
        "runtimeObjectIdentity": f"{runtime.__class__.__name__}:{id(runtime)}",
        "loadedSessionIdentities": {
            str(name): f"{name}-session:{id(session)}" for name, session in sorted(sessions.items())
        },
    }


def _round_mb(byte_count: int | float | None) -> float | None:
    if byte_count is None:
        return None
    return round(float(byte_count) / (1024 * 1024), 2)


class ResidentMemorySampler:
    def __init__(self) -> None:
        self._unsupported_reason: str | None = None

    def sample(self) -> dict[str, Any]:
        for sampler in (self._sample_windows_process_memory, self._sample_resource_peak, self._sample_psutil_rss):
            sample = sampler()
            if sample.get("supported"):
                return sample
        return {
            "supported": False,
            "method": None,
            "rssMb": None,
            "peakMemoryMb": None,
            "reason": self._unsupported_reason or "No resident memory sampler is available in this Python environment.",
        }

    def _remember_unsupported(self, reason: str) -> dict[str, Any]:
        self._unsupported_reason = reason if self._unsupported_reason is None else f"{self._unsupported_reason}; {reason}"
        return {"supported": False, "reason": reason}

    def _sample_windows_process_memory(self) -> dict[str, Any]:
        if os.name != "nt":
            return self._remember_unsupported("Windows process memory counters are unavailable on this platform.")
        try:
            import ctypes
            from ctypes import wintypes

            class ProcessMemoryCounters(ctypes.Structure):
                _fields_ = [
                    ("cb", wintypes.DWORD),
                    ("PageFaultCount", wintypes.DWORD),
                    ("PeakWorkingSetSize", ctypes.c_size_t),
                    ("WorkingSetSize", ctypes.c_size_t),
                    ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                    ("PagefileUsage", ctypes.c_size_t),
                    ("PeakPagefileUsage", ctypes.c_size_t),
                ]

            counters = ProcessMemoryCounters()
            counters.cb = ctypes.sizeof(ProcessMemoryCounters)
            psapi = ctypes.WinDLL("Psapi.dll")
            kernel32 = ctypes.WinDLL("Kernel32.dll")
            kernel32.GetCurrentProcess.restype = wintypes.HANDLE
            psapi.GetProcessMemoryInfo.argtypes = [
                wintypes.HANDLE,
                ctypes.POINTER(ProcessMemoryCounters),
                wintypes.DWORD,
            ]
            psapi.GetProcessMemoryInfo.restype = wintypes.BOOL
            process = kernel32.GetCurrentProcess()
            ok = psapi.GetProcessMemoryInfo(process, ctypes.byref(counters), counters.cb)
            if not ok:
                return self._remember_unsupported("GetProcessMemoryInfo returned no process memory counters.")
            return {
                "supported": True,
                "method": "windows-psapi.GetProcessMemoryInfo",
                "rssMb": _round_mb(counters.WorkingSetSize),
                "peakMemoryMb": _round_mb(counters.PeakWorkingSetSize),
                "currentMemorySupported": True,
                "peakMemorySupported": True,
            }
        except Exception as exc:
            return self._remember_unsupported(f"Windows process memory counters failed: {exc}")

    def _sample_resource_peak(self) -> dict[str, Any]:
        try:
            import resource  # type: ignore

            value = float(resource.getrusage(resource.RUSAGE_SELF).ru_maxrss)
            peak_mb = round(value / (1024 * 1024), 2) if sys.platform == "darwin" else round(value / 1024, 2)
            return {
                "supported": True,
                "method": "resource.getrusage",
                "rssMb": None,
                "peakMemoryMb": peak_mb,
                "currentMemorySupported": False,
                "peakMemorySupported": True,
                "reason": "resource.getrusage exposes peak RSS, not current resident RSS.",
            }
        except Exception as exc:
            return self._remember_unsupported(f"resource.getrusage unavailable: {exc}")

    def _sample_psutil_rss(self) -> dict[str, Any]:
        try:
            import psutil  # type: ignore

            info = psutil.Process(os.getpid()).memory_info()
            peak_wset = getattr(info, "peak_wset", None)
            return {
                "supported": True,
                "method": "psutil.Process.memory_info",
                "rssMb": _round_mb(getattr(info, "rss", None)),
                "peakMemoryMb": _round_mb(peak_wset) if peak_wset is not None else None,
                "currentMemorySupported": getattr(info, "rss", None) is not None,
                "peakMemorySupported": peak_wset is not None,
                "reason": None if peak_wset is not None else "psutil did not expose a peak working set field on this platform.",
            }
        except Exception as exc:
            return self._remember_unsupported(f"psutil memory_info unavailable: {exc}")


def memory_delta_mb(before: float | None, after: float | None) -> float | None:
    if before is None or after is None:
        return None
    return round(after - before, 2)


def run_memory_fields(before: dict[str, Any], after: dict[str, Any]) -> dict[str, Any]:
    supported = bool(before.get("supported") and after.get("supported"))
    before_mb = before.get("rssMb") if supported else None
    after_mb = after.get("rssMb") if supported else None
    peak_mb = after.get("peakMemoryMb") if supported else None
    evidence = {
        "supported": supported,
        "method": after.get("method") or before.get("method"),
        "currentMemorySupported": bool(before.get("currentMemorySupported") and after.get("currentMemorySupported")),
        "peakMemorySupported": bool(before.get("peakMemorySupported") or after.get("peakMemorySupported")),
        "reason": None if supported else after.get("reason") or before.get("reason"),
        "before": before,
        "after": after,
    }
    if supported and not evidence["currentMemorySupported"] and evidence["reason"] is None:
        evidence["reason"] = "Sampler did not expose current RSS, so memoryBeforeMb/memoryAfterMb/memoryDeltaMb are null."
    return {
        "memoryBeforeMb": before_mb,
        "memoryAfterMb": after_mb,
        "memoryDeltaMb": memory_delta_mb(before_mb, after_mb),
        "peakMemoryMb": peak_mb,
        "memoryEvidence": evidence,
    }


def aggregate_memory_fields(records: list[dict[str, Any]]) -> dict[str, Any]:
    if not records:
        return {
            "memoryGrowthAcrossRunsMb": None,
            "memoryEvidence": {"supported": False, "reason": "No resident runs were executed."},
        }
    evidence_records = [record.get("memoryEvidence") or {} for record in records]
    supported = any(bool(evidence.get("supported")) for evidence in evidence_records)
    current_supported = any(bool(evidence.get("currentMemorySupported")) for evidence in evidence_records)
    after_values = [record.get("memoryAfterMb") for record in records if record.get("memoryAfterMb") is not None]
    growth = memory_delta_mb(after_values[0], after_values[-1]) if len(after_values) >= 2 else None
    reason = None
    if not supported:
        reason = next((evidence.get("reason") for evidence in evidence_records if evidence.get("reason")), None)
    elif not current_supported:
        reason = "Memory sampler exposed peak RSS only; current resident growth across runs is unavailable."
    elif growth is None:
        reason = "At least two current RSS samples are required to calculate resident growth across runs."
    return {
        "memoryGrowthAcrossRunsMb": growth,
        "memoryEvidence": {
            "supported": supported,
            "currentMemorySupported": current_supported,
            "peakMemorySupported": any(bool(evidence.get("peakMemorySupported")) for evidence in evidence_records),
            "reason": reason,
            "runCount": len(records),
        },
        "memoryAfterMb": nano.compact_stats([record.get("memoryAfterMb") for record in records]),
        "memoryDeltaMb": nano.compact_stats([record.get("memoryDeltaMb") for record in records]),
        "peakMemoryMb": nano.compact_stats([record.get("peakMemoryMb") for record in records]),
    }


def live_session_metadata(runtime: Any) -> dict[str, Any]:
    sessions = getattr(runtime, "sessions", {}) or {}
    live_sessions: dict[str, Any] = {}
    for name, session in sorted(sessions.items()):
        metadata: dict[str, Any] = {"identity": f"{name}-session:{id(session)}"}
        for attr_name, output_key in (
            ("get_providers", "providers"),
            ("get_provider_options", "providerOptions"),
        ):
            method = getattr(session, attr_name, None)
            if callable(method):
                try:
                    metadata[output_key] = method()
                except Exception as exc:
                    metadata[output_key] = {"error": str(exc)}
        live_sessions[str(name)] = metadata
    return {
        "sessionCount": len(live_sessions),
        "sessions": live_sessions,
    }


def install_first_audio_probe(runtime: Any, recorder: EventRecorder, run_start: float, run_payload: dict[str, Any]) -> Callable[[], dict[str, Any]]:
    observation: dict[str, Any] = {
        "kind": "internal-first-decoded-audio",
        "sourceEvent": "firstDecodedAudio",
        "internalFirstDecodedAudioMs": None,
        "internalFirstDecodedAudioSec": None,
        "internalFirstDecodedAudioSupported": True,
        "fileObservedAudioSec": None,
        "fileResetBeforeRun": True,
        "outputFileExistedBeforeRun": bool(run_payload.get("outputFileExistedBeforeRun")),
        "reusedExistingOutputFile": False,
        "fieldAliases": ["firstAudioSec"],
    }
    streaming_session = getattr(runtime, "codec_streaming_session", None)
    original_run_frames = getattr(streaming_session, "run_frames", None)
    original_decode_full_audio_safe = getattr(runtime, "decode_full_audio_safe", None)

    def note_first_audio(source: str, audio_length: int | None = None) -> None:
        if observation["internalFirstDecodedAudioMs"] is not None:
            return
        elapsed_ms = now_ms(run_start)
        observation["internalFirstDecodedAudioMs"] = elapsed_ms
        observation["internalFirstDecodedAudioSec"] = round(elapsed_ms / 1000, 4)
        recorder.record(
            "firstDecodedAudio",
            source=source,
            internalFirstDecodedAudioMs=elapsed_ms,
            internalFirstDecodedAudioSec=observation["internalFirstDecodedAudioSec"],
            audioLengthSamples=audio_length,
            **run_payload,
        )

    if callable(original_run_frames):

        def wrapped_run_frames(frame_rows: list[list[int]]) -> Any:
            decoded = original_run_frames(frame_rows)
            if decoded is not None:
                try:
                    _audio, audio_length = decoded
                    length_value = int(audio_length)
                except Exception:
                    length_value = None
                if length_value is None or length_value > 0:
                    note_first_audio("codec_streaming_session.run_frames", length_value)
            return decoded

        streaming_session.run_frames = wrapped_run_frames

    if callable(original_decode_full_audio_safe):

        def wrapped_decode_full_audio_safe(generated_frames: list[list[int]]) -> Any:
            waveform = original_decode_full_audio_safe(generated_frames)
            try:
                sample_count = int(getattr(waveform, "shape", [0])[0])
            except Exception:
                sample_count = None
            if sample_count is None or sample_count > 0:
                note_first_audio("decode_full_audio_safe", sample_count)
            return waveform

        runtime.decode_full_audio_safe = wrapped_decode_full_audio_safe

    def restore_and_get() -> dict[str, Any]:
        if callable(original_run_frames):
            streaming_session.run_frames = original_run_frames
        if callable(original_decode_full_audio_safe):
            runtime.decode_full_audio_safe = original_decode_full_audio_safe
        return observation

    return restore_and_get


def mark_blocked(summary: dict[str, Any], out_dir: Path, message: str, *, key: str = "residentContract") -> dict[str, Any]:
    summary["ok"] = False
    summary["status"] = "blocked"
    summary["failureClass"] = "runtime-contract"
    summary["error"] = message
    summary.setdefault("checks", []).append(nano.make_check(key, "fail", message, "runtime-contract"))
    nano.write_summary(summary, out_dir)
    return summary


def classify_exception(exc: BaseException, default: str = "runtime") -> str:
    text = f"{exc.__class__.__name__}: {exc}".lower()
    if isinstance(exc, ModuleNotFoundError):
        missing = str(getattr(exc, "name", "") or "")
        if missing in {"onnx_tts_runtime", "ort_cpu_runtime", "moss_tts_nano"}:
            return "source-download"
        return "python-env"
    if isinstance(exc, FileNotFoundError):
        if "manifest" in text or "onnx" in text or "model" in text or "audio" in text:
            return "asset-download"
        return "source-download"
    if "onnxruntime" in text or "sentencepiece" in text or "torch" in text or "torchaudio" in text:
        return "python-env"
    if "browser_onnx" in text or "model assets" in text or "prompt audio" in text:
        return "asset-download"
    return default


def run_probe(command: dict[str, Any]) -> dict[str, Any]:
    config, config_error = nano.load_config(command.get("configPath"))
    options = nano.resolve_passage_options(nano.merge_config(command, config))
    out_dir = nano.output_dir(options)
    out_dir.mkdir(parents=True, exist_ok=True)
    summary = base_resident_summary(options, out_dir)
    events_path = Path(str(options["profileEventsJsonl"])).resolve() if options.get("profileEventsJsonl") else None
    recorder = EventRecorder(events_path)
    memory_sampler = ResidentMemorySampler()
    initial_memory_sample = memory_sampler.sample()
    summary["profileEventsJsonlPath"] = str(events_path) if events_path else None
    summary["memoryEvidence"] = {
        "supported": bool(initial_memory_sample.get("supported")),
        "method": initial_memory_sample.get("method"),
        "currentMemorySupported": bool(initial_memory_sample.get("currentMemorySupported")),
        "peakMemorySupported": bool(initial_memory_sample.get("peakMemorySupported")),
        "reason": initial_memory_sample.get("reason"),
        "initial": initial_memory_sample,
    }

    if command.get("runtimeMode") != "resident":
        return mark_blocked(summary, out_dir, "--runtime-mode must be resident for moss_nano_resident_probe.py.")

    if config_error:
        summary["failureClass"] = "config-missing" if "not found" in config_error else "runtime-contract"
        summary["error"] = config_error
        nano.write_summary(summary, out_dir)
        return summary

    if not options.get("allowEmptyPassage") and not str(options.get("passageText") or "").strip():
        return mark_blocked(
            summary,
            out_dir,
            "Passage text is empty. Provide --passage-text, use a built-in passage ID, or pass --allow-empty-passage for diagnostics.",
        )

    iterations = int(options.get("iterations") or nano.DEFAULT_ITERATIONS)
    warmup_runs = int(options.get("warmupRuns") or nano.DEFAULT_WARMUP_RUNS)
    if iterations <= 0:
        return mark_blocked(summary, out_dir, "--iterations must be a positive integer.")
    if warmup_runs < 0:
        return mark_blocked(summary, out_dir, "--warmup-runs must be zero or greater.")

    checks = nano.validate_local_runtime(options)
    summary["checks"] = checks
    failed = nano.first_failure(checks)
    if failed:
        summary["status"] = "blocked"
        summary["failureClass"] = failed.get("failureClass") or "runtime"
        summary["error"] = failed.get("detail")
        nano.write_summary(summary, out_dir)
        return summary

    repo_dir = Path(str(options.get("repoDir") or nano.DEFAULT_REPO_DIR)).resolve()
    model_dir = Path(str(options.get("modelDir") or nano.DEFAULT_MODEL_DIR)).resolve()
    prompt_audio_path = Path(str(options["promptAudio"])).resolve() if options.get("promptAudio") else None
    if str(repo_dir) not in sys.path:
        sys.path.insert(0, str(repo_dir))

    try:
        recorder.record("importStart", repoDir=str(repo_dir))
        onnx_tts_runtime = importlib.import_module("onnx_tts_runtime")
        ort_cpu_runtime = importlib.import_module("ort_cpu_runtime")
        ort = importlib.import_module("onnxruntime")
        recorder.record("importEnd", repoDir=str(repo_dir))

        requested, applied, unsupported = build_ort_contract(options, ort)
        summary["ortOptionsRequested"] = requested
        summary["ortOptionsApplied"] = applied
        summary["ortOptionsUnsupported"] = unsupported
        summary["ort"] = {
            "requested": requested,
            "applied": applied,
            "unsupported": unsupported,
            "directSessionConfiguration": True,
            "status": "configured",
        }

        restore_session_factory = patch_ort_session_factory(ort_cpu_runtime, ort, applied)
        try:
            recorder.record("assetLoadStart", modelDir=str(model_dir))
            session_create_started = time.perf_counter()
            runtime = onnx_tts_runtime.OnnxTtsRuntime(
                model_dir=str(model_dir),
                thread_count=int(options.get("threads") or nano.DEFAULT_THREADS),
                max_new_frames=int(options.get("maxNewFrames") or nano.DEFAULT_MAX_NEW_FRAMES),
                do_sample=str(options.get("sampleMode") or nano.DEFAULT_SAMPLE_MODE) != "greedy",
                sample_mode=str(options.get("sampleMode") or nano.DEFAULT_SAMPLE_MODE),
                output_dir=str(out_dir),
            )
            recorder.record(
                "sessionCreateEnd",
                modelDir=str(model_dir),
                sessionCreateMs=now_ms(session_create_started),
                runtimeIdentity=runtime_identity(runtime),
            )
        finally:
            restore_session_factory()
    except Exception as exc:
        summary["status"] = "blocked" if classify_exception(exc) in {"python-env", "source-download", "asset-download"} else "failed"
        summary["failureClass"] = classify_exception(exc)
        summary["error"] = str(exc)
        summary["stderrTail"] = nano.tail_text(traceback.format_exc())
        summary["events"] = recorder.events
        nano.write_summary(summary, out_dir)
        return summary

    summary["runtimeIdentity"] = runtime_identity(runtime)
    summary["ortLiveMetadata"] = live_session_metadata(runtime)
    summary["ort"]["liveMetadata"] = summary["ortLiveMetadata"]
    summary["events"] = recorder.events

    prewarm = str(options.get("prewarm") or nano.DEFAULT_PREWARM)
    if prewarm == "ort-sessions":
        try:
            recorder.record("prewarmStart", prewarm=prewarm)
            runtime.warmup()
            recorder.record("prewarmEnd", prewarm=prewarm)
        except Exception as exc:
            summary["status"] = "failed"
            summary["failureClass"] = classify_exception(exc, "runtime")
            summary["error"] = str(exc)
            summary["stderrTail"] = nano.tail_text(traceback.format_exc())
            summary["events"] = recorder.events
            nano.write_summary(summary, out_dir)
            return summary
    elif prewarm == "synthetic-synth":
        summary["checks"].append(
            nano.make_check(
                "prewarm",
                "warn",
                "synthetic-synth is accepted by the shared CLI but resident synthetic prewarm is not distinct from warmup runs.",
            )
        )

    enable_wetext = not bool(options.get("disableWetextProcessing", nano.DEFAULT_DISABLE_WETEXT_PROCESSING))
    enable_normalize_tts_text = True
    run_records_for_reuse: list[dict[str, Any]] = []

    def run_one(run_index: int, measured: bool, wav_path: Path, phase: str) -> dict[str, Any]:
        existed_before = wav_path.exists()
        if existed_before:
            wav_path.unlink()
        run_payload = {
            "phase": phase,
            "measured": measured,
            "iterationIndex": run_index,
            "wavPath": str(wav_path),
            "outputFileExistedBeforeRun": existed_before,
        }
        memory_before = memory_sampler.sample()
        recorder.record("inferenceStart", memorySample=memory_before, **run_payload)
        run_start = time.perf_counter()
        restore_probe = install_first_audio_probe(runtime, recorder, run_start, run_payload)
        try:
            result = runtime.synthesize(
                text=str(options.get("passageText") or ""),
                voice=str(options.get("voice") or nano.DEFAULT_VOICE),
                prompt_audio_path=None if prompt_audio_path is None else str(prompt_audio_path),
                output_audio_path=str(wav_path),
                sample_mode=str(options.get("sampleMode") or nano.DEFAULT_SAMPLE_MODE),
                do_sample=str(options.get("sampleMode") or nano.DEFAULT_SAMPLE_MODE) != "greedy",
                streaming=bool(options.get("streaming", nano.DEFAULT_STREAMING)),
                max_new_frames=int(options.get("maxNewFrames") or nano.DEFAULT_MAX_NEW_FRAMES),
                enable_wetext=enable_wetext,
                enable_normalize_tts_text=enable_normalize_tts_text,
            )
        finally:
            first_audio_observation = restore_probe()
        total_sec = round(time.perf_counter() - run_start, 4)
        recorder.record("wavWriteEnd", totalSec=total_sec, **run_payload)
        memory_after = memory_sampler.sample()
        memory_fields = run_memory_fields(memory_before, memory_after)
        duration = nano.wav_duration_sec(wav_path)
        identity = runtime_identity(runtime)
        internal_ms = first_audio_observation.get("internalFirstDecodedAudioMs")
        record = {
            "iterationIndex": run_index,
            "phase": phase,
            "measured": measured,
            "processMode": options.get("processMode") or nano.DEFAULT_PROCESS_MODE,
            "runtimeReuseActual": False,
            "runtimeIdentity": identity,
            "totalSec": total_sec,
            "firstAudioSec": first_audio_observation.get("internalFirstDecodedAudioSec"),
            "firstAudioObservedSec": None,
            "internalFirstDecodedAudioMs": internal_ms,
            "firstAudioSource": "internal-decoded-audio",
            "firstAudioObservation": first_audio_observation,
            "audioDurationSec": duration,
            "rtf": round(total_sec / duration, 4) if duration else None,
            "outputWavPath": str(result.get("audio_path") or wav_path),
            "outputPath": str(result.get("audio_path") or wav_path),
            "segmentCount": 1,
            "segmentOutputWavPaths": [str(result.get("audio_path") or wav_path)],
            "segments": [],
            **memory_fields,
            "stageProfile": {
                "enabled": bool(options.get("profileStages")),
                "supported": True,
                "limitations": "Resident probe reports import/session/inference events and internal first decoded audio; upstream does not expose every ORT substage separately.",
                "stagesSec": {
                    "precomputeInputs": None,
                    "runtimeStartup": None,
                    "modelLoad": None,
                    "tokenize": None,
                    "prepareInputs": None,
                    "onnxInference": None,
                    "decode": None,
                    "writeWav": None,
                    "internalFirstDecodedAudio": first_audio_observation.get("internalFirstDecodedAudioSec"),
                },
            },
        }
        recorder.record(
            "runEnd",
            totalSec=total_sec,
            audioDurationSec=duration,
            memoryBeforeMb=memory_fields["memoryBeforeMb"],
            memoryAfterMb=memory_fields["memoryAfterMb"],
            memoryDeltaMb=memory_fields["memoryDeltaMb"],
            peakMemoryMb=memory_fields["peakMemoryMb"],
            memoryEvidence=memory_fields["memoryEvidence"],
            **run_payload,
        )
        run_records_for_reuse.append(record)
        return record

    try:
        for warmup_index in range(warmup_runs):
            summary["warmups"].append(run_one(-(warmup_index + 1), False, out_dir / f"warmup_{warmup_index + 1:03d}.wav", "warmup"))
        for iteration_index in range(iterations):
            wav_name = "output.wav" if iterations == 1 else f"output_{iteration_index + 1:03d}.wav"
            summary["iterations"].append(run_one(iteration_index, True, out_dir / wav_name, "iteration"))
    except Exception as exc:
        summary["status"] = "failed"
        summary["failureClass"] = classify_exception(exc, "runtime")
        summary["error"] = str(exc)
        summary["stderrTail"] = nano.tail_text(traceback.format_exc())
        summary["events"] = recorder.events
        nano.write_summary(summary, out_dir)
        return summary

    measured_iterations = summary["iterations"]
    if not measured_iterations:
        return mark_blocked(summary, out_dir, "No measured resident iterations were executed.")

    for record in measured_iterations:
        if record.get("internalFirstDecodedAudioMs") is None:
            record["firstAudioObservation"]["internalFirstDecodedAudioSupported"] = False
            return mark_blocked(
                summary,
                out_dir,
                "Resident success requires internal first decoded audio timing before WAV close.",
                key="firstDecodedAudio",
            )

    if len(run_records_for_reuse) < 2:
        return mark_blocked(
            summary,
            out_dir,
            "Resident success requires at least two warmup/measured runs to prove runtime reuse identity.",
            key="runtimeReuse",
        )

    first_identity = run_records_for_reuse[0].get("runtimeIdentity")
    reuse_ok = all(record.get("runtimeIdentity") == first_identity for record in run_records_for_reuse)
    if not reuse_ok:
        return mark_blocked(
            summary,
            out_dir,
            "Resident runtime reuse could not be proven because process/session identity changed across runs.",
            key="runtimeReuse",
        )

    for record in run_records_for_reuse:
        record["runtimeReuseActual"] = True
    summary["benchmark"]["runtimeReuseActual"] = True

    representative = measured_iterations[-1]
    summary["totalSec"] = representative["totalSec"]
    summary["firstAudioSec"] = representative["firstAudioSec"]
    summary["internalFirstDecodedAudioMs"] = representative["internalFirstDecodedAudioMs"]
    summary["firstAudioObservation"] = representative["firstAudioObservation"]
    summary["audioDurationSec"] = representative["audioDurationSec"]
    summary["rtf"] = representative["rtf"]
    summary["outputWavPath"] = representative["outputWavPath"]
    summary["outputPath"] = representative["outputPath"]
    summary["segmentOutputWavPaths"] = [item["outputWavPath"] for item in measured_iterations]
    summary["memoryBeforeMb"] = representative.get("memoryBeforeMb")
    summary["memoryAfterMb"] = representative.get("memoryAfterMb")
    summary["memoryDeltaMb"] = representative.get("memoryDeltaMb")
    summary["peakMemoryMb"] = representative.get("peakMemoryMb") or nano.get_peak_memory_mb()
    summary["memoryEvidence"] = representative.get("memoryEvidence")
    summary["stageProfile"] = representative["stageProfile"]
    memory_aggregate = aggregate_memory_fields(run_records_for_reuse)
    summary["aggregate"] = {
        "iterations": len(measured_iterations),
        "warmupsExcluded": len(summary["warmups"]),
        "totalSec": nano.compact_stats([item.get("totalSec") for item in measured_iterations]),
        "internalFirstDecodedAudioMs": nano.compact_stats([item.get("internalFirstDecodedAudioMs") for item in measured_iterations]),
        "audioDurationSec": nano.compact_stats([item.get("audioDurationSec") for item in measured_iterations]),
        "rtf": nano.compact_stats([item.get("rtf") for item in measured_iterations]),
        "memoryGrowthAcrossRunsMb": memory_aggregate["memoryGrowthAcrossRunsMb"],
        "memoryEvidence": memory_aggregate["memoryEvidence"],
        "memoryAfterMb": memory_aggregate["memoryAfterMb"],
        "memoryDeltaMb": memory_aggregate["memoryDeltaMb"],
        "peakMemoryMb": memory_aggregate["peakMemoryMb"],
    }
    summary["events"] = recorder.events
    summary["ok"] = True
    summary["status"] = "ok"
    summary["failureClass"] = None
    summary["error"] = None
    nano.classify_performance(summary)
    nano.write_summary(summary, out_dir)
    return summary


def main(argv: list[str]) -> int:
    try:
        summary = run_probe(strip_resident_args(argv))
    except Exception as exc:
        summary = {
            "ok": False,
            "status": "failed",
            "runtimeMode": "resident",
            "failureClass": "runtime-contract",
            "error": str(exc),
            "stderrTail": nano.tail_text(traceback.format_exc()),
        }
    sys.stdout.write(json.dumps(summary, separators=(",", ":")) + "\n")
    sys.stdout.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
