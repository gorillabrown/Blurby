"""
Qwen3-TTS streaming sidecar for Blurby (QWEN-STREAM-1 proof-of-concept).

Persistent Python process. Reads line-delimited JSON commands on stdin,
emits binary-framed messages on stdout:

    frame := <length: LE uint32><type: uint8><payload: length bytes>
    type 0x01 = JSON metadata/event (UTF-8 encoded JSON string)
    type 0x02 = PCM audio chunk (raw Float32 little-endian)

Commands: configure | warmup | status | list_speakers |
          start_stream | cancel_stream | shutdown

See docs/superpowers/specs/2026-04-20-qwen-streaming-kokoro-backup-design.md
"""

import json
import os
import struct
import sys
import threading
import time
import traceback
from typing import Any, Dict, Iterator, Optional

# Force stdout into binary mode so Float32 PCM bytes pass unmodified.
# On Windows, text-mode stdout would translate 0x0A -> 0x0D 0x0A and corrupt audio.
try:
    import msvcrt  # noqa: F401
    msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)
except ImportError:
    pass  # POSIX stdout is already byte-clean on fileno access.

STDOUT = sys.stdout.buffer

# Frame type constants.
FRAME_JSON = 0x01
FRAME_PCM = 0x02

# Stream parameter defaults (overridable via configure).
STREAM_PARAMS = {
    "EMIT_EVERY_FRAMES": 12,
    "DECODE_WINDOW_FRAMES": 80,
    "FIRST_CHUNK_EMIT_EVERY": 5,
    "FIRST_CHUNK_DECODE_WINDOW": 48,
    "FIRST_CHUNK_FRAMES": 48,
    "OVERLAP_SAMPLES": 512,
    "SAMPLE_RATE": 24000,
}

CONFIG: Optional[Dict[str, Any]] = None
MODEL = None
LOAD_ERROR: Optional[str] = None

# streamId -> threading.Event (set when cancelled)
CANCEL_FLAGS: Dict[str, threading.Event] = {}
CANCEL_LOCK = threading.Lock()

STDOUT_LOCK = threading.Lock()  # serialize frame writes across threads


def write_frame(frame_type: int, payload: bytes) -> None:
    """Write one binary frame to stdout atomically and flush."""
    header = struct.pack("<IB", len(payload), frame_type & 0xFF)
    with STDOUT_LOCK:
        STDOUT.write(header)
        STDOUT.write(payload)
        STDOUT.flush()


def emit_event(event: Dict[str, Any]) -> None:
    """Emit a JSON event as a type 0x01 frame."""
    payload = json.dumps(event).encode("utf-8")
    write_frame(FRAME_JSON, payload)


def emit_pcm(samples) -> None:
    """Emit a PCM chunk as a type 0x02 frame. `samples` must be Float32 numpy array."""
    import numpy as np
    arr = np.asarray(samples, dtype=np.float32).reshape(-1)
    write_frame(FRAME_PCM, arr.tobytes())


def log_stderr(msg: str) -> None:
    sys.stderr.write(msg + "\n")
    sys.stderr.flush()


def ensure_model():
    """Lazy-load the Qwen3-TTS model. Mirrors main/qwen-engine.js ensure_model()."""
    global MODEL, LOAD_ERROR
    if MODEL is not None:
        return MODEL
    if CONFIG is None:
        raise RuntimeError("sidecar not configured")
    if LOAD_ERROR is not None:
        raise RuntimeError(LOAD_ERROR)
    try:
        import torch
        from qwen_tts import Qwen3TTSModel
        dtype = getattr(torch, CONFIG.get("dtype", "bfloat16"))
        MODEL = Qwen3TTSModel.from_pretrained(
            CONFIG["modelId"],
            device_map=CONFIG["device"],
            dtype=dtype,
            attn_implementation=CONFIG.get("attnImplementation", "flash_attention_2"),
        )
        return MODEL
    except Exception as exc:
        LOAD_ERROR = f"{type(exc).__name__}: {exc}"
        raise


def enable_streaming_optimizations() -> None:
    """Call the streaming fork's optimizer hook if present. CUDA-only no-op on CPU."""
    if MODEL is None:
        return
    fn = getattr(MODEL, "enable_streaming_optimizations", None)
    if fn is None:
        return
    try:
        fn(use_compile=True, use_cuda_graphs=True)
    except Exception as exc:
        log_stderr(f"enable_streaming_optimizations failed (non-fatal): {exc}")


def normalize_speakers(raw) -> list:
    if isinstance(raw, dict):
        return [str(k) for k in raw.keys()]
    if isinstance(raw, (list, tuple, set)):
        return [str(x) for x in raw]
    return []


def lookup_speaker_embedding(model, speaker_name: str):
    """Resolve a named speaker to its embedding tensor on the model.

    Qwen3-TTS CustomVoice exposes speakers via `get_supported_speakers()` and
    stores embeddings in `model.speaker_embeddings` (a dict-like)."""
    emb_dict = getattr(model, "speaker_embeddings", None)
    if emb_dict is not None and speaker_name in emb_dict:
        return emb_dict[speaker_name]
    # Some fork variants expose a helper.
    getter = getattr(model, "get_speaker_embedding", None)
    if callable(getter):
        return getter(speaker_name)
    raise RuntimeError(f"speaker embedding not found for '{speaker_name}'")


def stream_generate_custom_voice(
    text: str, speaker_name: str, rate: float, cancel_flag: threading.Event
) -> Iterator:
    """Yield Float32 PCM chunks for `text` using `speaker_name`.

    Prefers a true streaming method on the model. Falls back to full-generate
    and yields the result as a single chunk so the protocol still works end-to-end.
    """
    model = ensure_model()
    speaker_emb = lookup_speaker_embedding(model, speaker_name)

    # Prefer a streaming method if the fork exposes one.
    stream_fn = (
        getattr(model, "stream_generate_custom_voice", None)
        or getattr(model, "stream_generate", None)
    )

    if callable(stream_fn):
        gen = stream_fn(
            text=text,
            speaker_embedding=speaker_emb,
            rate=rate,
            emit_every_frames=STREAM_PARAMS["EMIT_EVERY_FRAMES"],
            decode_window_frames=STREAM_PARAMS["DECODE_WINDOW_FRAMES"],
            first_chunk_emit_every=STREAM_PARAMS["FIRST_CHUNK_EMIT_EVERY"],
            first_chunk_decode_window=STREAM_PARAMS["FIRST_CHUNK_DECODE_WINDOW"],
            first_chunk_frames=STREAM_PARAMS["FIRST_CHUNK_FRAMES"],
            overlap_samples=STREAM_PARAMS["OVERLAP_SAMPLES"],
        )
        for chunk in gen:
            if cancel_flag.is_set():
                return
            yield chunk
        return

    # STREAMING-TODO: The `rekuenkdr/Qwen3-TTS-streaming` fork implements
    # `stream_generate_voice_clone` on the Base model. CustomVoice (speaker
    # embedding) streaming is not exposed yet on this model class. Falling
    # back to full-generate so the binary protocol still round-trips. Replace
    # this path with a true incremental generator once the CustomVoice stream
    # method lands upstream.
    wavs, _sample_rate = model.generate_custom_voice(
        text=text, language="Auto", speaker=speaker_name
    )
    if cancel_flag.is_set():
        return
    chunk = wavs[0] if isinstance(wavs, (list, tuple)) else wavs
    yield chunk


def run_stream(stream_id: str, text: str, speaker: str, rate: float) -> None:
    """Execute one stream. Runs on a dedicated worker thread."""
    cancel_flag = threading.Event()
    with CANCEL_LOCK:
        CANCEL_FLAGS[stream_id] = cancel_flag

    emit_event({"event": "stream_started", "streamId": stream_id})

    total_chunks = 0
    cancelled = False
    try:
        for chunk in stream_generate_custom_voice(text, speaker, rate, cancel_flag):
            if cancel_flag.is_set():
                cancelled = True
                break
            emit_pcm(chunk)
            total_chunks += 1

        if cancel_flag.is_set():
            cancelled = True
    except Exception as exc:
        emit_event({
            "event": "stream_error",
            "streamId": stream_id,
            "error": f"{type(exc).__name__}: {exc}",
        })
        log_stderr(traceback.format_exc())
        with CANCEL_LOCK:
            CANCEL_FLAGS.pop(stream_id, None)
        return

    with CANCEL_LOCK:
        CANCEL_FLAGS.pop(stream_id, None)

    if cancelled:
        emit_event({"event": "stream_cancelled", "streamId": stream_id})
    else:
        emit_event({
            "event": "stream_finished",
            "streamId": stream_id,
            "total_chunks": total_chunks,
        })


def handle_command(msg: Dict[str, Any]) -> bool:
    """Return False to exit the main loop (shutdown only)."""
    global CONFIG
    cmd = msg.get("cmd")

    if cmd == "configure":
        CONFIG = {
            "modelId": msg.get("modelId", "Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice"),
            "device": msg.get("device", "cuda:0"),
            "dtype": msg.get("dtype", "bfloat16"),
            "attnImplementation": msg.get("attnImplementation", "flash_attention_2"),
            "speakers": msg.get("speakers", []),
        }
        # Allow callers to override stream tuning via configure.
        for key in list(STREAM_PARAMS.keys()):
            if key in msg:
                STREAM_PARAMS[key] = msg[key]
        emit_event({"event": "configured"})
        return True

    if cmd == "warmup":
        t0 = time.monotonic()
        try:
            ensure_model()
            enable_streaming_optimizations()
            elapsed_ms = int((time.monotonic() - t0) * 1000)
            emit_event({"event": "warmup_complete", "elapsed_ms": elapsed_ms})
        except Exception as exc:
            emit_event({
                "event": "warmup_error",
                "error": f"{type(exc).__name__}: {exc}",
            })
            log_stderr(traceback.format_exc())
        return True

    if cmd == "status":
        device = CONFIG["device"] if CONFIG else "unconfigured"
        emit_event({
            "event": "status",
            "ready": MODEL is not None and LOAD_ERROR is None,
            "model_loaded": MODEL is not None,
            "device": device,
        })
        return True

    if cmd == "list_speakers":
        try:
            model = ensure_model()
            speakers = normalize_speakers(model.get_supported_speakers())
            emit_event({"event": "speakers", "speakers": speakers})
        except Exception as exc:
            emit_event({
                "event": "speakers_error",
                "error": f"{type(exc).__name__}: {exc}",
            })
            log_stderr(traceback.format_exc())
        return True

    if cmd == "start_stream":
        stream_id = msg.get("streamId")
        text = msg.get("text", "")
        speaker = msg.get("speaker", "")
        rate = float(msg.get("rate", 1.0))
        if not stream_id:
            emit_event({"event": "stream_error", "streamId": None,
                        "error": "missing streamId"})
            return True
        worker = threading.Thread(
            target=run_stream,
            args=(stream_id, text, speaker, rate),
            name=f"qwen-stream-{stream_id}",
            daemon=True,
        )
        worker.start()
        return True

    if cmd == "cancel_stream":
        stream_id = msg.get("streamId")
        with CANCEL_LOCK:
            flag = CANCEL_FLAGS.get(stream_id)
        if flag is not None:
            flag.set()
        return True

    if cmd == "shutdown":
        # Signal any in-flight streams to stop.
        with CANCEL_LOCK:
            for flag in CANCEL_FLAGS.values():
                flag.set()
        emit_event({"event": "shutdown"})
        return False

    emit_event({"event": "error", "error": f"unknown command: {cmd}"})
    return True


def main() -> int:
    # Line-buffered text stdin.
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
        except Exception as exc:
            emit_event({"event": "error",
                        "error": f"invalid json: {type(exc).__name__}: {exc}"})
            continue
        try:
            if not handle_command(msg):
                return 0
        except Exception as exc:
            emit_event({"event": "error",
                        "error": f"{type(exc).__name__}: {exc}"})
            log_stderr(traceback.format_exc())
    return 0


if __name__ == "__main__":
    sys.exit(main())
