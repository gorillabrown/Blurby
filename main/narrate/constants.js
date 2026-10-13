"use strict";
// main/narrate/constants.js — tunable values of the rebuilt Narrate's producer (NARRATE-REBUILD-1 P3).

module.exports = {
  /** The pinned export the app already caches (main/constants.js KOKORO_MODEL_ID) and its q4 file. */
  NARRATE_ORIGINAL_MODEL_ID: "onnx-community/Kokoro-82M-v1.0-ONNX",
  NARRATE_MODEL_FILE: "model_q4.onnx",
  NARRATE_MODEL_DTYPE: "q4",
  /** The duration-exposed copy derived beside it (Decision #15); loaded by this id through transformers' local model path. */
  NARRATE_EXPOSED_MODEL_ID: "local/kokoro-dur",
  /** Decision #4: the predicted-duration tensor (post-round, post-clamp) exposed as "durations", a float tensor. */
  NARRATE_DURATION_TENSOR: "/encoder/Clip_output_0",
  NARRATE_DURATION_ELEM_TYPE: 1,
  /** OutsideAudit.10 record (model-hashes.txt): the pinned q4 model and its exposed copy. */
  NARRATE_PINNED_MODEL_SHA256: "04cf570cf9c4153694f76347ed4b9a48c1b59ff1de0999e6605d123966b197c7",
  NARRATE_EXPOSED_MODEL_SHA256: "2eccfc53272a6d9b302320cf522a0f3cd6201cd29f0c872fad9433c207b95cad",
  /** Decision #7: onnxruntime intra-op threads for Kokoro on this host class; the default was the slowest setting. */
  NARRATE_INTRA_OP_THREADS: 4,
  NARRATE_INTER_OP_THREADS: 1,
  /** Decision #17: producer workers, so a request never queues behind a stale generation (each holds one model session). */
  NARRATE_PRODUCER_WORKERS: 2,
  /** Environment override of the models root (this epic's runs point it at the artifacts folder; Decision #15). */
  NARRATE_MODELS_ROOT_ENV: "NARRATE_MODELS_ROOT",
  NARRATE_DEFAULT_VOICE: "af_bella",
  NARRATE_WARMUP_TEXT: "Hello.",
  NARRATE_LOAD_TIMEOUT_MS: 120000,
  NARRATE_IDLE_UNLOAD_MS: 10 * 60 * 1000,
};
