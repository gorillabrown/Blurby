#!/usr/bin/env python3
"""Resident CPU-only MOSS-TTS-Nano ONNX probe.

This diagnostic path imports the upstream Nano ONNX runtime in-process, creates
one runtime instance, and reuses its ONNX sessions across warmup and measured
runs. It never downloads source or model assets.
"""

from __future__ import annotations

import importlib
import hashlib
import json
import math
import os
import sys
import time
import traceback
from pathlib import Path
from typing import Any, Callable

import moss_nano_probe as nano


DECODE_FULL_FIRST_AUDIO_SEC_MAX = 2.5
DECODE_FULL_MEMORY_GROWTH_MB_MAX = 80


def now_ms(start: float) -> int:
    return int(round((time.perf_counter() - start) * 1000))


def strip_resident_args(argv: list[str]) -> dict[str, Any]:
    filtered: list[str] = []
    runtime_mode = "resident"
    resident_options: dict[str, Any] = {}
    value_flags = {
        "--variant-id": "variantId",
        "--optimization-profile": "optimizationProfile",
        "--provider-variant": "providerVariant",
        "--book-like-warm-runs": "bookLikeWarmRuns",
        "--resident-decode-mode": "residentDecodeMode",
        "--stream-decode-frame-budget": "streamDecodeFrameBudget",
        "--adjacent-segment-count": "adjacentSegmentCount",
        "--adjacent-segment-source": "adjacentSegmentSource",
        "--adjacent-segment-rtf-trend-max": "adjacentSegmentRtfTrendMax",
    }
    boolean_flags = {
        "--reuse-tokenizer": "tokenizerReuseRequested",
        "--reuse-prompt": "promptReuseRequested",
        "--short-passage-overhead-reduction": "shortPassageOverheadReductionRequested",
    }
    index = 0
    while index < len(argv):
        arg = argv[index]
        if arg == "--runtime-mode":
            if index + 1 >= len(argv):
                raise ValueError("--runtime-mode requires a value")
            runtime_mode = argv[index + 1]
            index += 2
            continue
        if arg in value_flags:
            if index + 1 >= len(argv):
                raise ValueError(f"{arg} requires a value")
            value: Any = argv[index + 1]
            if arg in {"--book-like-warm-runs", "--stream-decode-frame-budget", "--adjacent-segment-count"}:
                value = int(value)
            elif arg == "--adjacent-segment-rtf-trend-max":
                value = float(value)
            resident_options[value_flags[arg]] = value
            index += 2
            continue
        if arg in boolean_flags:
            resident_options[boolean_flags[arg]] = True
            index += 1
            continue
        filtered.append(arg)
        index += 1
    command = nano.parse_args(filtered)
    command["runtimeMode"] = runtime_mode
    command.update(resident_options)
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


STAGE_KEYS = (
    "precomputeInputs",
    "runtimeStartup",
    "modelLoad",
    "tokenize",
    "prepareInputs",
    "onnxInference",
    "decode",
    "writeWav",
    "textNormalize",
    "promptAudioEncode",
    "textChunk",
    "buildRequestRows",
    "semanticAcousticGenerate",
    "streamDecode",
    "fullDecode",
    "internalFirstDecodedAudio",
)


def empty_stage_timings() -> dict[str, float | None]:
    return {key: None for key in STAGE_KEYS}


def finite_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(float(value))


def decode_full_threshold_evidence(first_audio_sec: Any, memory_growth_mb: Any) -> dict[str, Any]:
    first_audio_passed = finite_number(first_audio_sec) and float(first_audio_sec) <= DECODE_FULL_FIRST_AUDIO_SEC_MAX
    memory_passed = finite_number(memory_growth_mb) and float(memory_growth_mb) <= DECODE_FULL_MEMORY_GROWTH_MB_MAX
    passed = bool(first_audio_passed and memory_passed)
    reasons: list[str] = []
    if not finite_number(first_audio_sec):
        reasons.append("decode-full first audio is missing")
    elif not first_audio_passed:
        reasons.append(
            f"decode-full first audio {first_audio_sec}s exceeds {DECODE_FULL_FIRST_AUDIO_SEC_MAX}s"
        )
    if not finite_number(memory_growth_mb):
        reasons.append("decode-full memory growth is missing")
    elif not memory_passed:
        reasons.append(
            f"decode-full memory growth {memory_growth_mb}MB exceeds {DECODE_FULL_MEMORY_GROWTH_MB_MAX}MB"
        )
    return {
        "status": "passed" if passed else "failed",
        "firstAudioSec": first_audio_sec,
        "memoryGrowthMb": memory_growth_mb,
        "gates": {
            "firstAudioSecMax": DECODE_FULL_FIRST_AUDIO_SEC_MAX,
            "memoryGrowthMbMax": DECODE_FULL_MEMORY_GROWTH_MB_MAX,
            "firstAudioPassed": bool(first_audio_passed),
            "memoryGrowthPassed": bool(memory_passed),
        },
        "source": "resident-decode-mode-full",
        "reason": None if passed else "; ".join(reasons),
    }


def resident_stage_profile(enabled: bool, timings: dict[str, float | None] | None = None) -> dict[str, Any]:
    stages = empty_stage_timings()
    if timings:
        stages.update(timings)
    return {
        "enabled": bool(enabled),
        "supported": True,
        "limitations": "Resident probe reports diagnostic stage timings around exposed runtime boundaries; upstream Nano does not expose every lower-level prepared-input hook separately.",
        "stagesSec": stages,
    }


def base_resident_summary(options: dict[str, Any], out_dir: Path) -> dict[str, Any]:
    summary = nano.base_summary(options)
    requested_ort = requested_ort_options(options)
    optimization_fields = initial_optimization_fields(options)
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
            "stageProfile": resident_stage_profile(bool(options.get("profileStages"))),
            **optimization_fields,
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


def resident_decode_contract(options: dict[str, Any]) -> dict[str, Any]:
    requested_mode = options.get("residentDecodeMode")
    requested_budget = options.get("streamDecodeFrameBudget")
    applied_mode = None
    if requested_mode:
        normalized_mode = str(requested_mode).strip().lower()
        if normalized_mode in {"stream", "streaming"}:
            applied_mode = "stream"
        elif normalized_mode in {"full", "non-streaming", "nonstreaming"}:
            applied_mode = "full"
    return {
        "requestedMode": requested_mode,
        "appliedMode": applied_mode,
        "streamDecodeFrameBudgetRequested": requested_budget,
        "streamDecodeFrameBudgetApplied": None,
        "streamDecodeFrameBudgetSupported": False if requested_budget is not None else None,
        "reason": "Upstream resident synthesize() does not expose an independent stream decode frame budget."
        if requested_budget is not None
        else None,
    }


def initial_optimization_fields(options: dict[str, Any]) -> dict[str, Any]:
    short_requested = bool(options.get("shortPassageOverheadReductionRequested"))
    book_like_requested = int(options.get("bookLikeWarmRuns") or 0)
    precompute_requested = bool(options.get("precomputeInputs"))
    precompute_blocker = "NO_PRECOMPUTE_REQUEST_ROWS_HOOK" if precompute_requested else None
    fields = {
        "optimizationVariant": options.get("variantId"),
        "optimizationProfile": options.get("optimizationProfile"),
        "providerVariant": options.get("providerVariant"),
        "tokenizerReuseActual": False if options.get("tokenizerReuseRequested") else None,
        "promptReuseActual": False if options.get("promptReuseRequested") else None,
        "shortPassageOverheadReduction": {
            "requested": short_requested,
            "actual": False,
            "strategy": None,
            "reason": "Resident runtime reuse has not been proven yet.",
        },
        "bookLikeRunStats": {
            "requestedWarmRuns": book_like_requested,
            "completedWarmRuns": 0,
            "internalFirstDecodedAudioFreshRuns": 0,
            "staleOutputReuseCount": 0,
            "internalFirstDecodedAudioMs": [],
        },
        "optimizationEvidence": {
            "status": "requested" if any(
                (
                    options.get("variantId"),
                    options.get("optimizationProfile"),
                    options.get("providerVariant"),
                    options.get("tokenizerReuseRequested"),
                    options.get("promptReuseRequested"),
                    short_requested,
                    book_like_requested,
                    options.get("residentDecodeMode"),
                    options.get("streamDecodeFrameBudget") is not None,
                    options.get("precomputeInputs"),
                )
            )
            else "not-requested",
            "variantId": options.get("variantId"),
            "profile": options.get("optimizationProfile"),
            "providerVariant": options.get("providerVariant"),
            "requestedOnly": True,
            "stale": False,
            "evidenceRunId": options.get("runId"),
            "evidenceGeneratedAt": None,
        },
        "promotionClass": False,
        "promotionMetrics": None,
        "residentDecode": resident_decode_contract(options),
        "precomputeInputsRequested": precompute_requested,
        "precomputeInputsActual": False,
        "precomputeInputsPartial": False,
        "precomputeInputsBlocker": precompute_blocker,
        "precomputeInputsEvidence": {
            "requested": precompute_requested,
            "actual": False,
            "status": "blocked" if precompute_requested else "not-requested",
            "blocker": precompute_blocker,
            "components": {
                "textNormalize": False,
                "promptAudioCodes": False,
                "textChunk": False,
                "tokenize": False,
                "semanticInputs": False,
                "acousticInputs": False,
                "buildRequestRows": False,
            },
            "reason": "Upstream resident synthesize() does not expose reusable prepared request rows that can be consumed by the measured run.",
        },
        "tokenizerIdentity": None,
        "promptAudioCodesEvidence": {
            "status": "not-requested",
            "hits": 0,
            "misses": 0,
            "cacheKey": None,
            "source": None,
            "reusedAcrossSegments": False,
        },
        "decodeFullEvidence": None,
        "acceptedDecodeStrategy": None,
        "crossSegmentStateBlocker": None,
        "adjacentSegmentStats": None,
        "segments": [],
        "promotionTarget": None,
        "promotionThresholds": None,
        "promotionDecision": {
            "promote": False,
            "target": None,
            "decision": "ITERATE_NANO_RESIDENT_RUNTIME",
        },
    }
    fields["optimization"] = {
        "variantId": fields["optimizationVariant"],
        "profile": fields["optimizationProfile"],
        "providerVariant": fields["providerVariant"],
        "tokenizerReuseRequested": bool(options.get("tokenizerReuseRequested")),
        "promptReuseRequested": bool(options.get("promptReuseRequested")),
        "tokenizerReuseActual": fields["tokenizerReuseActual"],
        "promptReuseActual": fields["promptReuseActual"],
        "shortPassageOverheadReduction": fields["shortPassageOverheadReduction"],
        "bookLikeRunStats": fields["bookLikeRunStats"],
        "precomputeInputsRequested": fields["precomputeInputsRequested"],
        "precomputeInputsActual": fields["precomputeInputsActual"],
        "precomputeInputsPartial": fields["precomputeInputsPartial"],
        "precomputeInputsBlocker": fields["precomputeInputsBlocker"],
        "precomputeInputsEvidence": fields["precomputeInputsEvidence"],
        "tokenizerIdentity": fields["tokenizerIdentity"],
        "promptAudioCodesEvidence": fields["promptAudioCodesEvidence"],
        "evidence": fields["optimizationEvidence"],
        "residentDecode": fields["residentDecode"],
    }
    return fields


def runtime_attr_identity(runtime: Any, names: tuple[str, ...]) -> str | None:
    for name in names:
        value = getattr(runtime, name, None)
        if value is not None:
            return f"{name}:{id(value)}"
    return None


def runtime_attr_value(runtime: Any, names: tuple[str, ...]) -> tuple[str, Any] | tuple[None, None]:
    for name in names:
        value = getattr(runtime, name, None)
        if value is not None:
            return name, value
    return None, None


def tokenizer_identity(runtime: Any) -> dict[str, Any] | None:
    name, value = runtime_attr_value(runtime, ("tokenizer", "sp_model", "sp", "sentencepiece", "text_tokenizer"))
    if value is None:
        return None
    model_path = getattr(value, "model_file", None) or getattr(value, "model_path", None)
    return {
        "attribute": name,
        "objectIdentity": f"{name}:{id(value)}",
        "modelPath": str(model_path) if model_path else None,
        "sessionIdentity": runtime_attr_identity(runtime, ("audio_tokenizer_session", "audioTokenizer", "codec_session")),
        "vocabularyHash": None,
    }


def prompt_audio_cache_key(prompt_audio_path: Path | None) -> str | None:
    if prompt_audio_path is None:
        return None
    digest = hashlib.sha256(str(prompt_audio_path.resolve()).encode("utf-8")).hexdigest()[:16]
    return f"prompt-audio:{digest}"


def finalize_optimization_fields(
    summary: dict[str, Any],
    options: dict[str, Any],
    runtime: Any,
    run_records: list[dict[str, Any]],
    reuse_ok: bool,
) -> None:
    tokenizer_object_identity = runtime_attr_identity(runtime, ("tokenizer", "sp_model", "sp", "sentencepiece", "text_tokenizer"))
    prompt_identity = runtime_attr_identity(runtime, ("prompt_cache", "prompt_embedding", "prompt_audio"))
    tokenizer_requested = bool(options.get("tokenizerReuseRequested"))
    prompt_requested = bool(options.get("promptReuseRequested"))
    precompute_requested = bool(options.get("precomputeInputs"))
    short_requested = bool(options.get("shortPassageOverheadReductionRequested"))
    book_like_requested = int(options.get("bookLikeWarmRuns") or 0)
    measured = [record for record in summary.get("iterations", []) if record.get("measured")]
    book_like_records = measured[:book_like_requested] if book_like_requested > 0 else []
    fresh_internal = [
        record for record in book_like_records
        if record.get("internalFirstDecodedAudioMs") is not None
        and not bool(record.get("firstAudioObservation", {}).get("reusedExistingOutputFile"))
        and not bool(record.get("firstAudioObservation", {}).get("outputFileExistedBeforeRun"))
    ]
    stale_count = sum(
        1 for record in book_like_records
        if bool(record.get("firstAudioObservation", {}).get("reusedExistingOutputFile"))
        or bool(record.get("firstAudioObservation", {}).get("outputFileExistedBeforeRun"))
    )
    stats = {
        "requestedWarmRuns": book_like_requested,
        "completedWarmRuns": len(book_like_records),
        "internalFirstDecodedAudioFreshRuns": len(fresh_internal),
        "staleOutputReuseCount": stale_count,
        "internalFirstDecodedAudioMs": [record.get("internalFirstDecodedAudioMs") for record in book_like_records],
    }
    summary["bookLikeRunStats"] = stats
    summary["tokenizerIdentity"] = tokenizer_identity(runtime)
    summary["tokenizerReuseActual"] = bool(tokenizer_requested and reuse_ok and tokenizer_object_identity)
    prompt_codes_reused = bool(summary.get("promptAudioCodesEvidence", {}).get("reusedAcrossSegments"))
    summary["promptReuseActual"] = bool(prompt_requested and reuse_ok and prompt_codes_reused)
    summary["shortPassageOverheadReduction"] = {
        "requested": short_requested,
        "actual": bool(short_requested and reuse_ok),
        "strategy": "resident-runtime-reuse" if short_requested and reuse_ok else None,
        "reason": None if short_requested and reuse_ok else "Requested short-passage overhead reduction was not proven by resident reuse.",
    }
    summary["promotionMetrics"] = {
        "shortRtf": summary.get("rtf"),
        "firstDecodedAudioSec": summary.get("firstAudioSec"),
        "internalFirstDecodedAudioMs": summary.get("internalFirstDecodedAudioMs"),
        "shortMemoryGrowthMb": summary.get("memoryDeltaMb"),
        "representativeMemoryGrowthMb": summary.get("memoryDeltaMb"),
        "memoryGrowthAcrossRunsMb": (summary.get("aggregate") or {}).get("memoryGrowthAcrossRunsMb"),
        "peakMemoryMb": summary.get("peakMemoryMb"),
    }
    decode_full_evidence = summary.get("decodeFullEvidence") or {}
    if decode_full_evidence:
        summary["promotionMetrics"].update(
            {
                "decodeFullFirstAudioSec": decode_full_evidence.get("firstAudioSec"),
                "decodeFullMemoryGrowthMb": decode_full_evidence.get("memoryGrowthMb"),
            }
        )
    actual_flags = [
        bool(precompute_requested and summary.get("precomputeInputsActual")),
        summary["tokenizerReuseActual"],
        summary["promptReuseActual"],
        summary["shortPassageOverheadReduction"]["actual"],
        bool(book_like_requested and stats["completedWarmRuns"] >= book_like_requested and stats["internalFirstDecodedAudioFreshRuns"] >= book_like_requested and stats["staleOutputReuseCount"] == 0),
    ]
    unsupported_requested = [
        label
        for label, requested, actual in (
            ("precomputeInputs", precompute_requested, summary.get("precomputeInputsActual")),
            ("tokenizerReuse", tokenizer_requested, summary["tokenizerReuseActual"]),
            ("promptReuse", prompt_requested, summary["promptReuseActual"]),
            ("shortPassageOverheadReduction", short_requested, summary["shortPassageOverheadReduction"]["actual"]),
            (
                "bookLikeWarmRuns",
                book_like_requested > 0,
                stats["completedWarmRuns"] >= book_like_requested
                and stats["internalFirstDecodedAudioFreshRuns"] >= book_like_requested
                and stats["staleOutputReuseCount"] == 0,
            ),
        )
        if requested and not actual
    ]
    requested_any = summary.get("optimizationEvidence", {}).get("status") != "not-requested"
    applied_any = any(actual_flags) or bool(summary.get("providerVariant"))
    summary["optimizationEvidence"] = {
        **dict(summary.get("optimizationEvidence") or {}),
        "status": "partial" if applied_any and unsupported_requested else ("applied" if applied_any else ("requested" if requested_any else "not-requested")),
        "requestedOnly": bool(requested_any and not applied_any),
        "stale": False,
        "evidenceGeneratedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "runtimeReuseActual": reuse_ok,
        "tokenizerIdentity": tokenizer_object_identity,
        "promptIdentity": prompt_identity,
        "unsupportedRequestedOptimizations": unsupported_requested,
    }
    summary["optimization"] = {
        **dict(summary.get("optimization") or {}),
        "tokenizerReuseActual": summary["tokenizerReuseActual"],
        "promptReuseActual": summary["promptReuseActual"],
        "shortPassageOverheadReduction": summary["shortPassageOverheadReduction"],
        "bookLikeRunStats": summary["bookLikeRunStats"],
        "precomputeInputsRequested": precompute_requested,
        "precomputeInputsActual": summary.get("precomputeInputsActual"),
        "precomputeInputsPartial": summary.get("precomputeInputsPartial"),
        "precomputeInputsBlocker": summary.get("precomputeInputsBlocker"),
        "precomputeInputsEvidence": summary.get("precomputeInputsEvidence"),
        "tokenizerIdentity": summary.get("tokenizerIdentity"),
        "promptAudioCodesEvidence": summary.get("promptAudioCodesEvidence"),
        "evidence": summary["optimizationEvidence"],
    }


def adjacent_segment_texts(options: dict[str, Any]) -> list[str]:
    count = int(options.get("adjacentSegmentCount") or 0)
    if count <= 0:
        return []
    source = str(options.get("adjacentSegmentSource") or "raw")
    text = str(options.get("passageText") or "")
    if source == "book-like":
        text = nano.BUILT_IN_PASSAGES.get("long-form-3min", text)
    words = [word for word in text.strip().split() if word]
    if not words:
        return []
    window = max(1, (len(words) + count - 1) // count)
    segments = [" ".join(words[index : index + window]).strip() for index in range(0, len(words), window)]
    return [segment for segment in segments if segment][:count]


def summarize_adjacent_segments(segments: list[dict[str, Any]], requested_count: int, trend_max: float | None) -> dict[str, Any]:
    rtfs = [float(segment["rtf"]) for segment in segments if isinstance(segment.get("rtf"), (int, float))]
    rtf_trend = None
    if len(rtfs) >= 2 and rtfs[0] > 0:
        rtf_trend = round((max(rtfs) - rtfs[0]) / rtfs[0], 4)
    return {
        "requestedSegments": requested_count,
        "completedSegments": len(segments),
        "freshSegments": sum(1 for segment in segments if not segment.get("staleOutputReuse") and not segment.get("empty")),
        "emptySegments": sum(1 for segment in segments if segment.get("empty")),
        "staleOutputReuseCount": sum(1 for segment in segments if segment.get("staleOutputReuse")),
        "sessionRestartCount": sum(1 for segment in segments if segment.get("sessionRestarted")),
        "rtfTrendRatio": rtf_trend,
        "rtfTrendMax": trend_max,
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
    if prompt_audio_path is not None:
        summary["promptAudioCodesEvidence"] = {
            "status": "miss",
            "hits": 0,
            "misses": 1,
            "cacheKey": prompt_audio_cache_key(prompt_audio_path),
            "source": str(prompt_audio_path),
            "reusedAcrossSegments": False,
        }
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
    resident_decode = summary.get("residentDecode") or {}
    effective_streaming = bool(options.get("streaming", nano.DEFAULT_STREAMING))
    if resident_decode.get("appliedMode") == "stream":
        effective_streaming = True
    elif resident_decode.get("appliedMode") == "full":
        effective_streaming = False
    run_records_for_reuse: list[dict[str, Any]] = []

    def run_one(run_index: int, measured: bool, wav_path: Path, phase: str, text: str | None = None) -> dict[str, Any]:
        existed_before = wav_path.exists()
        if existed_before:
            wav_path.unlink()
        passage_text = str(options.get("passageText") if text is None else text or "")
        run_payload = {
            "phase": phase,
            "measured": measured,
            "iterationIndex": run_index,
            "wavPath": str(wav_path),
            "outputFileExistedBeforeRun": existed_before,
        }
        memory_before = memory_sampler.sample()
        recorder.record("inferenceStart", memorySample=memory_before, **run_payload)
        text_normalize_started = time.perf_counter()
        normalized_text = passage_text.strip()
        text_normalize_sec = round(time.perf_counter() - text_normalize_started, 4)
        text_chunk_started = time.perf_counter()
        text_chunk_sec = round(time.perf_counter() - text_chunk_started, 4)
        run_start = time.perf_counter()
        restore_probe = install_first_audio_probe(runtime, recorder, run_start, run_payload)
        try:
            result = runtime.synthesize(
                text=normalized_text,
                voice=str(options.get("voice") or nano.DEFAULT_VOICE),
                prompt_audio_path=None if prompt_audio_path is None else str(prompt_audio_path),
                output_audio_path=str(wav_path),
                sample_mode=str(options.get("sampleMode") or nano.DEFAULT_SAMPLE_MODE),
                do_sample=str(options.get("sampleMode") or nano.DEFAULT_SAMPLE_MODE) != "greedy",
                streaming=effective_streaming,
                max_new_frames=int(options.get("maxNewFrames") or nano.DEFAULT_MAX_NEW_FRAMES),
                enable_wetext=enable_wetext,
                enable_normalize_tts_text=enable_normalize_tts_text,
            )
        finally:
            first_audio_observation = restore_probe()
        total_sec = round(time.perf_counter() - run_start, 4)
        write_started = time.perf_counter()
        recorder.record("wavWriteEnd", totalSec=total_sec, **run_payload)
        write_sec = round(time.perf_counter() - write_started, 4)
        memory_after = memory_sampler.sample()
        memory_fields = run_memory_fields(memory_before, memory_after)
        duration = nano.wav_duration_sec(wav_path)
        identity = runtime_identity(runtime)
        internal_ms = first_audio_observation.get("internalFirstDecodedAudioMs")
        stage_timings = {
            "textNormalize": text_normalize_sec,
            "textChunk": text_chunk_sec,
            "semanticAcousticGenerate": total_sec,
            "streamDecode": total_sec if effective_streaming else None,
            "fullDecode": total_sec if not effective_streaming else None,
            "decode": total_sec,
            "writeWav": write_sec,
            "internalFirstDecodedAudio": first_audio_observation.get("internalFirstDecodedAudioSec"),
        }
        record = {
            "iterationIndex": run_index,
            "phase": phase,
            "measured": measured,
            "text": normalized_text,
            "textHash": hashlib.sha256(normalized_text.encode("utf-8")).hexdigest(),
            "empty": not bool(normalized_text),
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
            "stageProfile": resident_stage_profile(bool(options.get("profileStages")), stage_timings),
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
        adjacent_texts = adjacent_segment_texts(options)
        if adjacent_texts:
            first_adjacent_identity: dict[str, Any] | None = None
            requested_adjacent_count = int(options.get("adjacentSegmentCount") or len(adjacent_texts))
            adjacent_segments: list[dict[str, Any]] = []
            for segment_index, segment_text in enumerate(adjacent_texts):
                record = run_one(
                    segment_index,
                    True,
                    out_dir / f"adjacent_segment_{segment_index + 1:03d}.wav",
                    "adjacent-segment",
                    segment_text,
                )
                identity = record.get("runtimeIdentity")
                if first_adjacent_identity is None:
                    first_adjacent_identity = identity
                output_wav_path = str(record.get("outputWavPath") or "")
                segment = {
                    "index": segment_index,
                    "passageId": f"adjacent-segment-{segment_index + 1}",
                    "text": segment_text,
                    "textHash": record.get("textHash"),
                    "empty": record.get("empty"),
                    "runtimeReuseActual": record.get("runtimeReuseActual"),
                    "runtimeIdentity": identity,
                    "firstAudioObservation": record.get("firstAudioObservation"),
                    "staleOutputReuse": bool(record.get("firstAudioObservation", {}).get("reusedExistingOutputFile"))
                    or bool(record.get("firstAudioObservation", {}).get("outputFileExistedBeforeRun")),
                    "sessionRestarted": bool(first_adjacent_identity is not None and identity != first_adjacent_identity),
                    "outputWavPath": output_wav_path,
                    "audioDurationSec": record.get("audioDurationSec"),
                    "totalSec": record.get("totalSec"),
                    "rtf": record.get("rtf"),
                    "memoryBeforeMb": record.get("memoryBeforeMb"),
                    "memoryAfterMb": record.get("memoryAfterMb"),
                    "memoryDeltaMb": record.get("memoryDeltaMb"),
                    "peakMemoryMb": record.get("peakMemoryMb"),
                    "freshness": {
                        "outputFileExistedBeforeRun": bool(record.get("firstAudioObservation", {}).get("outputFileExistedBeforeRun")),
                        "reusedExistingOutputFile": bool(record.get("firstAudioObservation", {}).get("reusedExistingOutputFile")),
                    },
                    "stageProfile": record.get("stageProfile"),
                }
                adjacent_segments.append(segment)
            summary["segments"] = adjacent_segments
            summary["adjacentSegmentStats"] = summarize_adjacent_segments(
                adjacent_segments,
                requested_adjacent_count,
                options.get("adjacentSegmentRtfTrendMax"),
            )
            summary["crossSegmentStateBlocker"] = "NO_CROSS_SEGMENT_MODEL_STATE_HOOK"
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
    for segment in summary.get("segments", []):
        segment["runtimeReuseActual"] = True
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
    if resident_decode.get("appliedMode") == "full":
        summary["decodeFullEvidence"] = decode_full_threshold_evidence(
            representative.get("firstAudioSec"),
            representative.get("memoryDeltaMb"),
        )
        decode_full_passed = summary["decodeFullEvidence"]["status"] == "passed"
        summary["acceptedDecodeStrategy"] = {
            "strategy": "decode-full",
            "accepted": decode_full_passed,
            "replacementForDecodeFull": False,
            "reason": None if decode_full_passed else summary["decodeFullEvidence"].get("reason"),
        }
    elif resident_decode.get("appliedMode") == "stream":
        summary["acceptedDecodeStrategy"] = {
            "strategy": "streaming",
            "accepted": True,
            "replacementForDecodeFull": True,
        }
    if prompt_audio_path is not None:
        prompt_identity = runtime_attr_identity(runtime, ("prompt_cache", "prompt_embedding", "prompt_audio"))
        reused_prompt_codes = bool(prompt_identity and len(summary.get("segments") or []) > 1)
        summary["promptAudioCodesEvidence"] = {
            **dict(summary.get("promptAudioCodesEvidence") or {}),
            "status": "actual" if reused_prompt_codes else "miss",
            "hits": max(0, len(summary.get("segments") or []) - 1) if reused_prompt_codes else 0,
            "misses": 1,
            "cacheKey": prompt_audio_cache_key(prompt_audio_path),
            "source": str(prompt_audio_path),
            "promptIdentity": prompt_identity,
            "reusedAcrossSegments": reused_prompt_codes,
        }
        summary["promptReuseActual"] = reused_prompt_codes
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
    finalize_optimization_fields(summary, options, runtime, run_records_for_reuse, reuse_ok)
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
