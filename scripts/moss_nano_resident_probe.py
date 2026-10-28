#!/usr/bin/env python3
"""Resident CPU-only MOSS-TTS-Nano ONNX probe.

This diagnostic path imports the upstream Nano ONNX runtime in-process, creates
one runtime instance, and reuses its ONNX sessions across warmup and measured
runs. It never downloads source or model assets.
"""

from __future__ import annotations

import importlib
import gc
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
        "--soak-duration-sec": "soakDurationSec",
        "--soak-sample-interval-sec": "soakSampleIntervalSec",
        "--recycle-after-segments": "recycleAfterSegments",
        "--recycle-rss-threshold-mb": "recycleRssThresholdMb",
    }
    boolean_flags = {
        "--reuse-tokenizer": "tokenizerReuseRequested",
        "--reuse-prompt": "promptReuseRequested",
        "--short-passage-overhead-reduction": "shortPassageOverheadReductionRequested",
        "--nano6-soak": "nano6Soak",
        "--shutdown-restart-evidence": "shutdownRestartEvidence",
        "--shutdown-evidence": "shutdownRestartEvidence",
        "--restart-evidence": "shutdownRestartEvidence",
        "--bounded-lifecycle": "boundedLifecycle",
        "--measure-restart-cost": "measureRestartCost",
        "--warm-spare": "warmSpare",
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
            if arg in {"--book-like-warm-runs", "--stream-decode-frame-budget", "--adjacent-segment-count", "--soak-duration-sec", "--soak-sample-interval-sec", "--recycle-after-segments"}:
                value = int(value)
            elif arg in {"--adjacent-segment-rtf-trend-max", "--recycle-rss-threshold-mb"}:
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
            "preparedBeforeRun": False,
            "consumedByMeasuredRun": False,
            "requestRowCount": 0,
            "textHash": None,
            "chunkHashes": [],
            "components": {
                "textNormalization": False,
                "promptCodes": False,
                "tokenization": False,
                "requestRowsBuild": False,
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
        "crossSegmentStateActual": False,
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
    precompute_evidence = dict(summary.get("precomputeInputsEvidence") or {})
    precompute_components = dict(precompute_evidence.get("components") or {})
    text_hash = measured[-1].get("textHash") if measured else None
    chunk_hashes = [
        segment.get("textHash")
        for segment in summary.get("segments", [])
        if segment.get("textHash")
    ]
    precompute_components.update(
        {
            "textNormalization": bool(measured),
            "promptCodes": bool(prompt_codes_reused),
            "tokenization": False,
            "requestRowsBuild": False,
            "textNormalize": bool(measured),
            "promptAudioCodes": bool(prompt_codes_reused),
            "textChunk": bool(summary.get("segments")),
            "tokenize": False,
            "semanticInputs": False,
            "acousticInputs": False,
            "buildRequestRows": False,
        }
    )
    summary["precomputeInputsActual"] = False
    summary["precomputeInputsPartial"] = bool(precompute_requested and (measured or prompt_codes_reused or chunk_hashes))
    summary["precomputeInputsBlocker"] = "NO_PRECOMPUTE_REQUEST_ROWS_HOOK" if precompute_requested else None
    summary["precomputeInputsEvidence"] = {
        **precompute_evidence,
        "requested": precompute_requested,
        "actual": False,
        "status": "blocked" if precompute_requested else "not-requested",
        "blocker": summary["precomputeInputsBlocker"],
        "preparedBeforeRun": False,
        "consumedByMeasuredRun": False,
        "requestRowCount": 0,
        "textHash": text_hash,
        "chunkHashes": chunk_hashes,
        "components": precompute_components,
        "reason": "Upstream resident synthesize() does not expose reusable prepared request rows that can be consumed by the measured run.",
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


def book_like_adjacent_segment_texts(count: int, seed_text: str = "") -> list[str]:
    seed_words = [word.strip(".,;:!?\"'()[]{}") for word in seed_text.split() if word.strip(".,;:!?\"'()[]{}")]
    seed_hint = " ".join(seed_words[:6]) if seed_words else "the diagnostic passage"
    return [
        (
            f"Adjacent book-like segment {index + 1} follows {seed_hint} with "
            f"plain punctuation, fresh wording, and enough context for a real synthesis run."
        )
        for index in range(count)
    ]


def adjacent_segment_texts(options: dict[str, Any]) -> list[str]:
    count = int(options.get("adjacentSegmentCount") or 0)
    if count <= 0:
        return []
    source = str(options.get("adjacentSegmentSource") or "raw").strip().lower()
    text = str(options.get("passageText") or "")
    if source in {"book-like", "book_like"}:
        return book_like_adjacent_segment_texts(count, text)
    words = [word for word in text.strip().split() if word]
    if not words:
        return book_like_adjacent_segment_texts(count, text)
    window = max(1, (len(words) + count - 1) // count)
    segments = [" ".join(words[index : index + window]).strip() for index in range(0, len(words), window)]
    non_empty_segments = [segment for segment in segments if segment][:count]
    if len(non_empty_segments) < count:
        return book_like_adjacent_segment_texts(count, text)
    return non_empty_segments


def median(values: list[float]) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    middle = len(ordered) // 2
    if len(ordered) % 2:
        return ordered[middle]
    return (ordered[middle - 1] + ordered[middle]) / 2


def summarize_adjacent_segments(segments: list[dict[str, Any]], requested_count: int, trend_max: float | None) -> dict[str, Any]:
    rtfs = [float(segment["rtf"]) for segment in segments if isinstance(segment.get("rtf"), (int, float))]
    rtf_trend = None
    if len(rtfs) >= 2 and rtfs[0] > 0:
        rtf_trend = round((max(rtfs) - rtfs[0]) / rtfs[0], 4)
    fair_rtf_trend = None
    first_two = median(rtfs[:2])
    last_two = median(rtfs[-2:])
    if first_two is not None and last_two is not None and first_two > 0:
        fair_rtf_trend = round(abs(last_two - first_two) / first_two, 4)
    fair_trend_max = 0.15 if trend_max is None else trend_max
    token_counts = [
        int(segment.get("tokenCount"))
        for segment in segments
        if isinstance(segment.get("tokenCount"), int)
    ]
    audio_durations = [
        segment.get("audioDurationSec")
        for segment in segments
        if isinstance(segment.get("audioDurationSec"), (int, float))
    ]
    return {
        "requestedSegments": requested_count,
        "completedSegments": len(segments),
        "freshSegments": sum(1 for segment in segments if not segment.get("staleOutputReuse") and not segment.get("empty")),
        "emptySegments": sum(1 for segment in segments if segment.get("empty")),
        "staleOutputReuseCount": sum(1 for segment in segments if segment.get("staleOutputReuse")),
        "sessionRestartCount": sum(1 for segment in segments if segment.get("sessionRestarted")),
        "rtfTrendRatio": rtf_trend,
        "rtfTrendMax": fair_trend_max,
        "diagnosticRtfTrendMethod": "max-vs-first",
        "rtfTrendMethod": "first-two-vs-last-two-median",
        "fairRtfTrendRatio": fair_rtf_trend,
        "fairRtfTrendMax": fair_trend_max,
        "balancedSegments": len(token_counts) == len(segments) and (max(token_counts) - min(token_counts) <= max(1, round(max(token_counts) * 0.25)) if token_counts else False),
        "tokenBudgetedSegments": len(token_counts) == len(segments),
        "tokenCounts": token_counts,
        "audioDurationSecBySegment": audio_durations,
        "stableTrendGate": {
            "method": "first-two-vs-last-two-median",
            "ratio": fair_rtf_trend,
            "max": fair_trend_max,
            "stable": bool(fair_rtf_trend is not None and fair_rtf_trend <= fair_trend_max),
        },
        "crossSegmentStateActual": False,
    }


def percentile(values: list[Any], percentile_value: float) -> float | None:
    numeric = sorted(float(value) for value in values if isinstance(value, (int, float)) and math.isfinite(float(value)))
    if not numeric:
        return None
    index = max(0, min(len(numeric) - 1, math.ceil((percentile_value / 100) * len(numeric)) - 1))
    return round(numeric[index], 4)


def linear_regression_slope_mb_per_min(samples: list[dict[str, Any]]) -> float | None:
    points = [
        (float(sample.get("elapsedSec")), float(sample.get("rssMb")))
        for sample in samples
        if isinstance(sample, dict)
        and isinstance(sample.get("elapsedSec"), (int, float))
        and isinstance(sample.get("rssMb"), (int, float))
        and math.isfinite(float(sample.get("elapsedSec")))
        and math.isfinite(float(sample.get("rssMb")))
    ]
    if len(points) < 2:
        return None
    mean_x = sum(point[0] for point in points) / len(points)
    mean_y = sum(point[1] for point in points) / len(points)
    denominator = sum((point[0] - mean_x) ** 2 for point in points)
    if denominator <= 0:
        return None
    slope_mb_per_sec = sum((point[0] - mean_x) * (point[1] - mean_y) for point in points) / denominator
    return round(max(0.0, slope_mb_per_sec * 60), 4)


def endpoint_slope_mb_per_min(samples: list[dict[str, Any]], duration_sec: float) -> tuple[float | None, float | None]:
    if len(samples) < 2:
        return None, None
    first_rss = samples[0].get("rssMb")
    last_rss = samples[-1].get("rssMb")
    if not isinstance(first_rss, (int, float)) or not isinstance(last_rss, (int, float)):
        return None, None
    growth = round(float(last_rss) - float(first_rss), 4)
    duration_min = max(float(duration_sec) / 60, 1 / 60)
    return growth, round(max(0.0, growth) / duration_min, 4)


def phase_memory_fields(samples: list[dict[str, Any]], measured_duration_sec: float) -> dict[str, Any]:
    endpoint_growth, endpoint_slope = endpoint_slope_mb_per_min(samples, measured_duration_sec)
    initial_samples = [
        sample for sample in samples
        if str(sample.get("label") or "").startswith(("iteration-", "adjacent-segment-"))
    ]
    hold_samples = [
        sample for sample in samples
        if str(sample.get("label") or "") in {"pre-soak-hold", "soak-hold", "soak-complete"}
    ]
    post_warmup_samples = samples[1:] if len(samples) > 1 else samples
    initial_expansion = None
    if len(samples) >= 2:
        first_rss = samples[0].get("rssMb")
        second_rss = samples[1].get("rssMb")
        if isinstance(first_rss, (int, float)) and isinstance(second_rss, (int, float)):
            initial_expansion = round(max(0.0, float(second_rss) - float(first_rss)), 4)
    inference_slope = linear_regression_slope_mb_per_min(initial_samples)
    post_warmup_slope = linear_regression_slope_mb_per_min(post_warmup_samples)
    hold_slope = linear_regression_slope_mb_per_min(hold_samples)
    if inference_slope is None:
        inference_slope = post_warmup_slope
    if hold_slope is None:
        hold_slope = 0.0 if len(hold_samples) == 1 else post_warmup_slope
    readiness_slope = post_warmup_slope
    return {
        "initialExpansionMb": initial_expansion,
        "endpointGrowthMb": endpoint_growth,
        "endpointGrowthMbPerMin": endpoint_slope,
        "diagnosticEndpointSlopeMbPerMin": endpoint_slope,
        "postWarmupSlopeMbPerMin": post_warmup_slope,
        "inferenceSlopeMbPerMin": inference_slope,
        "holdSlopeMbPerMin": hold_slope,
        "readinessMemorySlopeMbPerMin": readiness_slope,
        "readinessMemorySlopeMethod": "post-warmup-phase-regression",
        "memoryGrowthSlopeMethod": "endpoint-diagnostic-only",
        "phaseMemoryMethod": "least-squares-regression-over-post-warmup-phase-windows",
    }


def add_nano6_lifecycle_evidence(
    summary: dict[str, Any],
    options: dict[str, Any],
    run_records: list[dict[str, Any]],
    lifecycle_context: dict[str, Any] | None = None,
) -> None:
    nano6_requested = bool(options.get("nano6Soak"))
    shutdown_requested = bool(options.get("shutdownRestartEvidence"))
    if not nano6_requested and not shutdown_requested:
        return

    lifecycle_context = lifecycle_context or {}
    requested_duration_sec = int(options.get("soakDurationSec") or 1800)
    sample_interval_sec = int(options.get("soakSampleIntervalSec") or 30)
    measured_duration_sec = round(float(lifecycle_context.get("measuredDurationSec") or 0), 4)
    if measured_duration_sec <= 0:
        measured_duration_sec = round(
            sum(
                float(record.get("totalSec") or 0)
                for record in run_records
                if bool(record.get("measured")) and record.get("phase") != "warmup"
            ),
            4,
        )
    rss_sample_records = list(lifecycle_context.get("rssSamples") or [])
    rss_samples = [
        float(sample.get("rssMb"))
        for sample in rss_sample_records
        if isinstance(sample, dict) and isinstance(sample.get("rssMb"), (int, float)) and math.isfinite(float(sample.get("rssMb")))
    ]
    if not rss_samples:
        rss_samples = [
            value
            for record in run_records
            for value in (record.get("memoryAfterMb"), record.get("peakMemoryMb"))
            if isinstance(value, (int, float)) and math.isfinite(float(value))
        ]
    if not rss_samples:
        rss_samples = [float(nano.get_peak_memory_mb())]
    first_rss = float(rss_samples[0])
    last_rss = float(rss_samples[-1])
    duration_min = max(measured_duration_sec / 60, 1 / 60)
    slope = round(max(0.0, last_rss - first_rss) / duration_min, 4)
    phase_memory = phase_memory_fields(rss_sample_records, measured_duration_sec)
    segments = list(summary.get("segments") or [])
    stale_count = sum(1 for segment in segments if segment.get("staleOutputReuse"))
    empty_count = sum(1 for segment in segments if segment.get("empty") or not str(segment.get("text") or "").strip())
    restart_count = sum(1 for segment in segments if segment.get("sessionRestarted"))

    summary["lifecycleEvidence"] = {
        "status": "partial",
        "requestedOnly": False,
        "stale": False,
        "runId": summary.get("runId"),
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "mode": "resident-runtime-diagnostic",
        "reason": "Resident probe measured runtime/soak process execution, but forced-kill, zombie, restart, and in-flight shutdown lifecycle exercises are not implemented.",
    }
    summary["residentSoak"] = {
        "durationSec": measured_duration_sec,
        "measuredDurationSec": measured_duration_sec,
        "requestedDurationSec": requested_duration_sec,
        "warmupExcluded": True,
        "warmupEndAt": lifecycle_context.get("warmupEndAt") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "sampleIntervalSec": sample_interval_sec,
        "rssSamples": rss_samples,
        "rssSampleDetails": rss_sample_records,
        "currentRssMb": rss_samples[-1],
        "memoryGrowthSlopeMbPerMin": slope,
        "memoryGrowthMethod": "wall-clock-current-rss-samples",
        **phase_memory,
        "crashCount": 0,
        "staleOutputReuseCount": stale_count,
        "sessionRestartCount": restart_count,
    }

    if segments:
        internal_first_ms = [
            (segment.get("firstAudioObservation") or {}).get("internalFirstDecodedAudioMs")
            for segment in segments
        ]
        rtfs = [segment.get("rtf") for segment in segments]
        punctuation_rtfs = [segment.get("punctuationRtf", segment.get("rtf")) for segment in segments]
        summary["bookLikeAdjacentRun"] = {
            "requestedSegments": int(options.get("adjacentSegmentCount") or len(segments)),
            "completedSegments": len(segments),
            "freshSegments": sum(1 for segment in segments if not segment.get("staleOutputReuse") and not segment.get("empty")),
            "emptySegments": empty_count,
            "staleOutputReuseCount": stale_count,
            "sessionRestartCount": restart_count,
            "p95InternalFirstDecodedAudioMs": percentile(internal_first_ms, 95),
            "p95FinalRtf": percentile(rtfs, 95),
            "p95PunctuationRtf": percentile(punctuation_rtfs, 95),
        }

    if shutdown_requested or nano6_requested:
        classifications = [
            "clean-shutdown",
            "forced-kill",
            "zombie-process",
            "restart-clean",
            "restart-failed",
            "inflight-rejected",
        ]
        summary["shutdownClassifications"] = classifications
        summary["shutdownEvidence"] = {
            "cleanShutdown": {
                "classification": "clean-shutdown",
                "observed": False,
                "status": "not-observed",
                "evidenceSource": "not-implemented",
                "reason": "Resident probe did not exercise a separate measured clean shutdown check.",
            },
            "forcedKill": {
                "classification": "forced-kill",
                "observed": False,
                "status": "not-observed",
                "evidenceSource": "not-implemented",
                "reason": "Resident probe did not force-kill the runtime process.",
            },
            "zombieProcess": {
                "classification": "zombie-process",
                "observed": False,
                "status": "not-observed",
                "evidenceSource": "not-implemented",
                "reason": "Resident probe did not perform zombie-process detection after a forced kill.",
            },
            "restartClean": {
                "classification": "restart-clean",
                "observed": False,
                "status": "not-observed",
                "evidenceSource": "not-implemented",
                "reason": "Resident probe did not restart a fresh runtime after shutdown.",
            },
            "restartFailed": {
                "classification": "restart-failed",
                "observed": False,
                "status": "not-observed",
                "evidenceSource": "not-implemented",
                "reason": "Resident probe did not exercise a failed restart path.",
            },
            "inflightShutdown": {
                "classification": "inflight-rejected",
                "observed": False,
                "status": "not-observed",
                "evidenceSource": "not-implemented",
                "rejected": False,
                "succeeded": False,
                "wavReused": False,
                "reason": "Resident probe did not attempt shutdown while synthesis was in flight.",
            },
        }

    if nano6_requested:
        thresholds = {
            "soakDurationSecMin": 1800,
            "memoryGrowthSlopeMbPerMinMax": 1.5,
            "adjacentRequiredSegments": 100,
            "adjacentP95InternalFirstDecodedAudioMsMax": 1500,
            "adjacentP95FinalRtfMax": 1.5,
            "adjacentP95PunctuationRtfMax": 1.45,
            "staleOutputReuseMax": 0,
            "emptySegmentMax": 0,
            "sessionRestartMax": 0,
            "crashCountMax": 0,
        }
        adjacent = summary.get("bookLikeAdjacentRun") or {}
        metrics = {
            "soakDurationSec": measured_duration_sec,
            "requestedSoakDurationSec": requested_duration_sec,
            "memoryGrowthSlopeMbPerMin": slope,
            "diagnosticEndpointSlopeMbPerMin": phase_memory.get("diagnosticEndpointSlopeMbPerMin"),
            "postWarmupSlopeMbPerMin": phase_memory.get("postWarmupSlopeMbPerMin"),
            "inferenceSlopeMbPerMin": phase_memory.get("inferenceSlopeMbPerMin"),
            "holdSlopeMbPerMin": phase_memory.get("holdSlopeMbPerMin"),
            "readinessMemorySlopeMbPerMin": phase_memory.get("readinessMemorySlopeMbPerMin"),
            "crashCount": 0,
            "staleOutputReuseCount": stale_count,
            "sessionRestartCount": restart_count,
            "adjacentRequestedSegments": adjacent.get("requestedSegments"),
            "adjacentCompletedSegments": adjacent.get("completedSegments"),
            "adjacentFreshSegments": adjacent.get("freshSegments"),
            "adjacentEmptySegments": adjacent.get("emptySegments"),
            "adjacentStaleOutputReuseCount": adjacent.get("staleOutputReuseCount"),
            "adjacentSessionRestartCount": adjacent.get("sessionRestartCount"),
            "adjacentP95InternalFirstDecodedAudioMs": adjacent.get("p95InternalFirstDecodedAudioMs"),
            "adjacentP95FinalRtf": adjacent.get("p95FinalRtf"),
            "adjacentP95PunctuationRtf": adjacent.get("p95PunctuationRtf"),
        }
        shutdown_ready = all(
            bool((summary.get("shutdownEvidence") or {}).get(key, {}).get("observed"))
            and (summary.get("shutdownEvidence") or {}).get(key, {}).get("evidenceSource") == "measured-lifecycle-check"
            for key in (
                "cleanShutdown",
                "forcedKill",
                "zombieProcess",
                "restartClean",
                "restartFailed",
                "inflightShutdown",
            )
        )
        bounded = summary.get("boundedLifecycle") or {}
        bounded_ready = (
            bool(options.get("boundedLifecycle"))
            and bounded.get("actual") is True
            and bounded.get("evidenceSource") == "measured-bounded-lifecycle"
            and isinstance(bounded.get("recycleCount"), (int, float))
            and bounded.get("recycleCount") > 0
            and isinstance(bounded.get("recycleReasons"), list)
            and len(bounded.get("recycleReasons")) > 0
            and isinstance(bounded.get("segmentsPerRuntime"), list)
            and len(bounded.get("segmentsPerRuntime")) > 1
            and isinstance(bounded.get("p50RestartCostMs"), (int, float))
            and isinstance(bounded.get("p95RestartCostMs"), (int, float))
            and isinstance(bounded.get("p50PrewarmCostMs"), (int, float))
            and isinstance(bounded.get("p95PrewarmCostMs"), (int, float))
            and isinstance((bounded.get("tailEvidence") or {}).get("postRecycleSegmentIndices"), list)
            and len((bounded.get("tailEvidence") or {}).get("postRecycleSegmentIndices")) > 0
            and isinstance((bounded.get("tailEvidence") or {}).get("p95PostRecycleFirstAudioMs"), (int, float))
            and isinstance((bounded.get("tailEvidence") or {}).get("p95PostRecycleRtf"), (int, float))
            and bounded.get("staleOutputClean") is True
        )
        restart_ok = bounded_ready if bool(options.get("boundedLifecycle")) else restart_count == 0
        ready = (
            measured_duration_sec >= 1800
            and isinstance(phase_memory.get("readinessMemorySlopeMbPerMin"), (int, float))
            and phase_memory.get("readinessMemorySlopeMbPerMin") <= 1.5
            and stale_count == 0
            and empty_count == 0
            and restart_ok
            and shutdown_ready
            and adjacent.get("requestedSegments") == 100
            and adjacent.get("completedSegments") == 100
            and adjacent.get("freshSegments") == 100
            and isinstance(adjacent.get("p95InternalFirstDecodedAudioMs"), (int, float))
            and adjacent.get("p95InternalFirstDecodedAudioMs") <= 1500
            and isinstance(adjacent.get("p95FinalRtf"), (int, float))
            and adjacent.get("p95FinalRtf") <= 1.5
            and isinstance(adjacent.get("p95PunctuationRtf"), (int, float))
            and adjacent.get("p95PunctuationRtf") <= 1.45
        )
        summary["promotionTarget"] = "app-prototype" if ready else None
        summary["promotionThresholds"] = thresholds
        summary["promotionMetrics"] = metrics
        summary["promotionDecision"] = {
            "promote": bool(ready),
            "target": "app-prototype" if ready else None,
            "decision": (
                "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE_WITH_BOUNDED_LIFECYCLE"
                if ready and bounded_ready
                else "PROMOTE_NANO_TO_APP_PROTOTYPE_CANDIDATE"
                if ready
                else "ITERATE_NANO_RESIDENT_RUNTIME"
            ),
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

        def create_resident_runtime(reason: str) -> tuple[Any, int]:
            restore_session_factory = patch_ort_session_factory(ort_cpu_runtime, ort, applied)
            try:
                recorder.record("assetLoadStart", modelDir=str(model_dir), lifecycleReason=reason)
                session_create_started = time.perf_counter()
                runtime_obj = onnx_tts_runtime.OnnxTtsRuntime(
                    model_dir=str(model_dir),
                    thread_count=int(options.get("threads") or nano.DEFAULT_THREADS),
                    max_new_frames=int(options.get("maxNewFrames") or nano.DEFAULT_MAX_NEW_FRAMES),
                    do_sample=str(options.get("sampleMode") or nano.DEFAULT_SAMPLE_MODE) != "greedy",
                    sample_mode=str(options.get("sampleMode") or nano.DEFAULT_SAMPLE_MODE),
                    output_dir=str(out_dir),
                )
                session_create_ms = now_ms(session_create_started)
                recorder.record(
                    "sessionCreateEnd",
                    modelDir=str(model_dir),
                    sessionCreateMs=session_create_ms,
                    lifecycleReason=reason,
                    runtimeIdentity=runtime_identity(runtime_obj),
                )
                return runtime_obj, session_create_ms
            finally:
                restore_session_factory()

        runtime, _initial_session_create_ms = create_resident_runtime("initial")
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
    soak_start_perf: float | None = None
    soak_warmup_end_at: str | None = None
    soak_memory_samples: list[dict[str, Any]] = []
    cleanup_evidence: list[dict[str, Any]] = []
    bounded_lifecycle_requested = bool(options.get("boundedLifecycle"))
    recycle_after_segments = int(options.get("recycleAfterSegments") or 0)
    recycle_rss_threshold_mb = options.get("recycleRssThresholdMb")
    measure_restart_cost = bool(options.get("measureRestartCost"))
    warm_spare_requested = bool(options.get("warmSpare"))
    recycle_events: list[dict[str, Any]] = []
    restart_cost_ms: list[int] = []
    prewarm_cost_ms: list[int] = []
    segments_per_runtime: list[int] = [0]
    post_recycle_segment_indices: list[int] = []
    post_recycle_first_audio_ms: list[float] = []
    post_recycle_rtfs: list[float] = []

    def record_soak_memory_sample(label: str) -> None:
        if soak_start_perf is None:
            return
        sample = memory_sampler.sample()
        rss_mb = sample.get("rssMb")
        if not isinstance(rss_mb, (int, float)) or not math.isfinite(float(rss_mb)):
            rss_mb = sample.get("peakMemoryMb")
        if isinstance(rss_mb, (int, float)) and math.isfinite(float(rss_mb)):
            soak_memory_samples.append(
                {
                    "label": label,
                    "elapsedSec": round(time.perf_counter() - soak_start_perf, 4),
                    "rssMb": round(float(rss_mb), 2),
                    "sample": sample,
                }
            )

    def complete_requested_soak() -> None:
        if not bool(options.get("nano6Soak")) or soak_start_perf is None:
            return
        requested_duration_sec = int(options.get("soakDurationSec") or 1800)
        sample_interval_sec = int(options.get("soakSampleIntervalSec") or 30)
        record_soak_memory_sample("pre-soak-hold")
        while True:
            elapsed_sec = time.perf_counter() - soak_start_perf
            remaining_sec = requested_duration_sec - elapsed_sec
            if remaining_sec <= 0:
                break
            time.sleep(min(sample_interval_sec, remaining_sec))
            record_soak_memory_sample("soak-hold")
        record_soak_memory_sample("soak-complete")

    def record_cleanup_evidence(label: str) -> None:
        before = memory_sampler.sample()
        collected = gc.collect()
        after = memory_sampler.sample()
        before_rss = before.get("rssMb")
        after_rss = after.get("rssMb")
        delta = None
        if isinstance(before_rss, (int, float)) and isinstance(after_rss, (int, float)):
            delta = round(float(after_rss) - float(before_rss), 4)
        cleanup_evidence.append(
            {
                "label": label,
                "method": "gc.collect-after-adjacent-run",
                "collectedObjects": collected,
                "rssBeforeMb": before_rss,
                "rssAfterMb": after_rss,
                "rssDeltaMb": delta,
                "before": before,
                "after": after,
            }
        )

    def recycle_reasons_for_next_segment() -> list[str]:
        if not bounded_lifecycle_requested:
            return []
        reasons: list[str] = []
        if recycle_after_segments > 0 and segments_per_runtime[-1] >= recycle_after_segments:
            reasons.append("segment-limit")
        if isinstance(recycle_rss_threshold_mb, (int, float)):
            sample = memory_sampler.sample()
            rss_mb = sample.get("rssMb")
            if isinstance(rss_mb, (int, float)) and math.isfinite(float(rss_mb)) and float(rss_mb) >= float(recycle_rss_threshold_mb):
                reasons.append("rss-threshold")
        return reasons

    def recycle_runtime(reasons: list[str], next_segment_index: int) -> None:
        nonlocal runtime
        if not reasons:
            return
        before_sample = memory_sampler.sample()
        before_identity = runtime_identity(runtime)
        reset_started = time.perf_counter()
        runtime = None
        gc.collect()
        runtime, _session_create_ms = create_resident_runtime("bounded-lifecycle-recycle")
        restart_ms = int(round((time.perf_counter() - reset_started) * 1000))
        after_identity = runtime_identity(runtime)
        prewarm_ms = None
        if measure_restart_cost:
            prewarm_started = time.perf_counter()
            try:
                runtime.warmup()
            finally:
                prewarm_ms = int(round((time.perf_counter() - prewarm_started) * 1000))
        after_sample = memory_sampler.sample()
        restart_cost_ms.append(restart_ms)
        if prewarm_ms is not None:
            prewarm_cost_ms.append(prewarm_ms)
        recycle_events.append(
            {
                "index": len(recycle_events),
                "nextSegmentIndex": next_segment_index,
                "reason": reasons[0] if len(reasons) == 1 else "+".join(reasons),
                "reasons": reasons,
                "mode": "in-process-runtime-reset",
                "processRestartActual": False,
                "runtimeIdentityChanged": before_identity != after_identity,
                "runtimeIdentityBefore": before_identity,
                "runtimeIdentityAfter": after_identity,
                "restartCostMs": restart_ms,
                "prewarmCostMs": prewarm_ms,
                "rssBeforeMb": before_sample.get("rssMb"),
                "rssAfterMb": after_sample.get("rssMb"),
                "rssBefore": before_sample,
                "rssAfter": after_sample,
            }
        )
        recorder.record(
            "boundedLifecycleRecycle",
            nextSegmentIndex=next_segment_index,
            reasons=reasons,
            restartCostMs=restart_ms,
            prewarmCostMs=prewarm_ms,
            processRestartActual=False,
            runtimeIdentityChanged=before_identity != after_identity,
        )
        segments_per_runtime.append(0)
        post_recycle_segment_indices.extend([next_segment_index, next_segment_index + 1])

    def record_unmeasured_bounded_lifecycle(reason: str) -> None:
        if not bounded_lifecycle_requested:
            return
        summary["boundedLifecycle"] = {
            "actual": False,
            "status": "not-measured",
            "evidenceSource": "not-measured",
            "mode": "in-process-runtime-reset",
            "processRestartActual": False,
            "processRestartUnsupportedReason": "Resident probe recycles the in-process runtime object; it does not claim child-process restart proof.",
            "recycleAfterSegments": recycle_after_segments or None,
            "recycleRssThresholdMb": recycle_rss_threshold_mb,
            "measureRestartCost": measure_restart_cost,
            "warmSpare": {
                "requested": warm_spare_requested,
                "actual": False,
                "unsupported": bool(warm_spare_requested),
                "reason": "Warm spare runtime handoff is not implemented safely in the resident probe.",
            },
            "p50RestartCostMs": None,
            "p95RestartCostMs": None,
            "p50PrewarmCostMs": None,
            "p95PrewarmCostMs": None,
            "recycleCount": len(recycle_events),
            "recycleReasons": [],
            "segmentsPerRuntime": segments_per_runtime,
            "recycleEvents": recycle_events,
            "tailEvidence": {
                "postRecycleSegmentIndices": [],
                "p95PostRecycleFirstAudioMs": None,
                "p95PostRecycleRtf": None,
            },
            "staleOutputReuseCount": None,
            "staleOutputClean": None,
            "reason": reason,
        }

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
        result_audio_path = str(result.get("audio_path") or wav_path)
        result = None
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
            "outputWavPath": result_audio_path,
            "outputPath": result_audio_path,
            "segmentCount": 1,
            "segmentOutputWavPaths": [result_audio_path],
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
        soak_start_perf = time.perf_counter()
        soak_warmup_end_at = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        record_soak_memory_sample("warmup-end")
        for iteration_index in range(iterations):
            wav_name = "output.wav" if iterations == 1 else f"output_{iteration_index + 1:03d}.wav"
            summary["iterations"].append(run_one(iteration_index, True, out_dir / wav_name, "iteration"))
            record_soak_memory_sample(f"iteration-{iteration_index + 1}")
        adjacent_texts = adjacent_segment_texts(options)
        requested_adjacent_count = int(options.get("adjacentSegmentCount") or 0)
        if requested_adjacent_count > 0 and len(adjacent_texts) < requested_adjacent_count:
            blocked_reason = f"Adjacent segment source generated {len(adjacent_texts)} non-empty segments, fewer than the requested {requested_adjacent_count}."
            record_unmeasured_bounded_lifecycle(blocked_reason)
            return mark_blocked(
                summary,
                out_dir,
                blocked_reason,
                key="bookLikeAdjacentRun",
            )
        if adjacent_texts:
            first_adjacent_identity: dict[str, Any] | None = None
            requested_adjacent_count = int(options.get("adjacentSegmentCount") or len(adjacent_texts))
            adjacent_segments: list[dict[str, Any]] = []
            for segment_index, segment_text in enumerate(adjacent_texts):
                recycle_runtime(recycle_reasons_for_next_segment(), segment_index)
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
                    "tokenCount": len([word for word in segment_text.split() if word]),
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
                if bounded_lifecycle_requested:
                    segments_per_runtime[-1] += 1
                    if segment_index in post_recycle_segment_indices:
                        internal_ms = segment.get("firstAudioObservation", {}).get("internalFirstDecodedAudioMs")
                        if isinstance(internal_ms, (int, float)) and math.isfinite(float(internal_ms)):
                            post_recycle_first_audio_ms.append(float(internal_ms))
                        rtf = segment.get("rtf")
                        if isinstance(rtf, (int, float)) and math.isfinite(float(rtf)):
                            post_recycle_rtfs.append(float(rtf))
                record_soak_memory_sample(f"adjacent-segment-{segment_index + 1}")
                record_cleanup_evidence(f"adjacent-segment-{segment_index + 1}")
            summary["segments"] = adjacent_segments
            summary["adjacentSegmentStats"] = summarize_adjacent_segments(
                adjacent_segments,
                requested_adjacent_count,
                options.get("adjacentSegmentRtfTrendMax"),
            )
            summary["crossSegmentStateBlocker"] = "NO_CROSS_SEGMENT_MODEL_STATE_HOOK"
        complete_requested_soak()
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
    if not reuse_ok and not bounded_lifecycle_requested:
        return mark_blocked(
            summary,
            out_dir,
            "Resident runtime reuse could not be proven because process/session identity changed across runs.",
            key="runtimeReuse",
        )

    for record in run_records_for_reuse:
        record["runtimeReuseActual"] = reuse_ok
    for segment in summary.get("segments", []):
        segment["runtimeReuseActual"] = reuse_ok
    summary["benchmark"]["runtimeReuseActual"] = reuse_ok

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
    summary["cleanupEvidence"] = {
        "status": "actual" if cleanup_evidence else "not-run",
        "boundedCleanupAfterAdjacentRuns": bool(cleanup_evidence),
        "method": "release-local-refs-and-gc-collect",
        "samples": cleanup_evidence,
    }
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
    if bounded_lifecycle_requested:
        adjacent_stats = summary.get("adjacentSegmentStats") or {}
        recycle_reasons = sorted({reason for event in recycle_events for reason in event.get("reasons", [])})
        rss_after_values = [
            event.get("rssAfterMb")
            for event in recycle_events
            if isinstance(event.get("rssAfterMb"), (int, float))
        ]
        post_recycle_slope = None
        if len(rss_after_values) >= 2:
            post_recycle_slope = round(max(0.0, float(rss_after_values[-1]) - float(rss_after_values[0])), 4)
        bounded_actual = len(recycle_events) > 0
        summary["boundedLifecycle"] = {
            "actual": bounded_actual,
            "status": "actual" if bounded_actual else "not-measured",
            "evidenceSource": "measured-bounded-lifecycle" if bounded_actual else "not-measured",
            "mode": "in-process-runtime-reset",
            "residentIdentityReuseActual": reuse_ok,
            "boundedRuntimeReuseActual": bounded_actual,
            "processRestartActual": False,
            "processRestartUnsupportedReason": "Resident probe recycles the in-process runtime object; it does not claim child-process restart proof.",
            "recycleAfterSegments": recycle_after_segments or None,
            "recycleRssThresholdMb": recycle_rss_threshold_mb,
            "measureRestartCost": measure_restart_cost,
            "warmSpare": {
                "requested": warm_spare_requested,
                "actual": False,
                "unsupported": bool(warm_spare_requested),
                "reason": "Warm spare runtime handoff is not implemented safely in the resident probe.",
            },
            "p50RestartCostMs": percentile(restart_cost_ms, 50),
            "p95RestartCostMs": percentile(restart_cost_ms, 95),
            "p50PrewarmCostMs": percentile(prewarm_cost_ms, 50),
            "p95PrewarmCostMs": percentile(prewarm_cost_ms, 95),
            "recycleCount": len(recycle_events),
            "recycleReasons": recycle_reasons,
            "segmentsPerRuntime": segments_per_runtime,
            "recycleEvents": recycle_events,
            "rssBeforeAfterRecycle": [
                {
                    "rssBeforeMb": event.get("rssBeforeMb"),
                    "rssAfterMb": event.get("rssAfterMb"),
                    "reason": event.get("reason"),
                    "nextSegmentIndex": event.get("nextSegmentIndex"),
                }
                for event in recycle_events
            ],
            "postRecycleSlopeMb": post_recycle_slope,
            "tailEvidence": {
                "postRecycleSegmentIndices": sorted(set(index for index in post_recycle_segment_indices if index < len(summary.get("segments") or []))),
                "p95PostRecycleFirstAudioMs": percentile(post_recycle_first_audio_ms, 95),
                "p95PostRecycleRtf": percentile(post_recycle_rtfs, 95),
            },
            "staleOutputReuseCount": adjacent_stats.get("staleOutputReuseCount", 0),
            "staleOutputClean": adjacent_stats.get("staleOutputReuseCount", 0) == 0 if adjacent_stats else None,
            "reason": None if bounded_actual else "Bounded lifecycle was requested, but no recycle trigger fired before the run completed.",
            "lifecycleClasses": {
                "runtimeRecycle": {
                    "classification": "in-process-runtime-reset",
                    "observed": bounded_actual,
                    "evidenceSource": "measured-bounded-lifecycle" if bounded_actual else "not-measured",
                    "processRestartActual": False,
                }
            },
        }
    finalize_optimization_fields(summary, options, runtime, run_records_for_reuse, reuse_ok)
    lifecycle_context = {
        "measuredDurationSec": round(time.perf_counter() - soak_start_perf, 4) if soak_start_perf is not None else None,
        "warmupEndAt": soak_warmup_end_at,
        "rssSamples": soak_memory_samples,
    }
    add_nano6_lifecycle_evidence(summary, options, run_records_for_reuse, lifecycle_context)
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
