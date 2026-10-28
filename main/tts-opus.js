// main/tts-opus.js — Opus encoding/decoding wrapper for TTS cache (NAR-4)
//
// Uses opusscript (Emscripten-compiled libopus) for PCM ↔ Opus conversion.
// Encoding runs in the main process after receiving PCM from the worker.
// Decoding runs in the main process before sending to the renderer.
//
// Storage format: custom binary (not OGG container)
//   Header: [magic 4B "BLOP"] [version 1B] [sampleRate 4B LE] [channels 1B] [frameCount 4B LE]
//   Frames: [frameSize 2B LE] [opusData frameSize B] × frameCount

"use strict";

const { KOKORO_SAMPLE_RATE } = require("./constants");

// Opus constants
const OPUS_FRAME_SIZE = 960; // 20ms at 48kHz (opusscript standard frame size)
const OPUS_SAMPLE_RATE = 48000; // Opus native sample rate
const OPUS_CHANNELS = 1;
const OPUS_APPLICATION = 2049; // OPUS_APPLICATION_AUDIO
const MAGIC = Buffer.from("BLOP"); // BLurby OPus
const FORMAT_VERSION = 1;

let OpusScript = null;

function getOpusScript() {
  if (!OpusScript) {
    OpusScript = require("opusscript");
  }
  return OpusScript;
}

/**
 * Resample Float32Array from one sample rate to another (linear interpolation).
 */
function resample(input, fromRate, toRate) {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outputLen = Math.round(input.length / ratio);
  const output = new Float32Array(outputLen);
  for (let i = 0; i < outputLen; i++) {
    const srcIdx = i * ratio;
    const idx = Math.floor(srcIdx);
    const frac = srcIdx - idx;
    const a = input[idx] || 0;
    const b = input[Math.min(idx + 1, input.length - 1)] || 0;
    output[i] = a + frac * (b - a);
  }
  return output;
}

/**
 * Convert Float32 PCM [-1, 1] to Int16 PCM [-32768, 32767].
 */
function float32ToInt16(f32) {
  const i16 = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    i16[i] = s < 0 ? s * 32768 : s * 32767;
  }
  return i16;
}

/**
 * Convert Int16 PCM to Float32 PCM.
 */
function int16ToFloat32(i16) {
  const f32 = new Float32Array(i16.length);
  for (let i = 0; i < i16.length; i++) {
    f32[i] = i16[i] / (i16[i] < 0 ? 32768 : 32767);
  }
  return f32;
}

/**
 * Encode Float32Array PCM (any sample rate, mono) to Opus binary format.
 * @param {Float32Array} pcm — mono PCM samples
 * @param {number} sampleRate — source sample rate (e.g., 24000)
 * @returns {Buffer} — compressed Opus binary
 */
function encode(pcm, sampleRate) {
  const OS = getOpusScript();

  // Resample to 48kHz (Opus native rate)
  const resampled = resample(pcm, sampleRate, OPUS_SAMPLE_RATE);

  // Convert to Int16
  const i16 = float32ToInt16(resampled);

  // Create encoder
  const encoder = new OS(OPUS_SAMPLE_RATE, OPUS_CHANNELS, OPUS_APPLICATION);
  encoder.setBitrate(64000); // 64kbps — good quality for speech

  // Encode in frames
  const frames = [];
  let offset = 0;
  while (offset < i16.length) {
    const remaining = i16.length - offset;
    let frameData;
    if (remaining >= OPUS_FRAME_SIZE) {
      frameData = i16.slice(offset, offset + OPUS_FRAME_SIZE);
    } else {
      // Pad last frame with silence
      frameData = new Int16Array(OPUS_FRAME_SIZE);
      frameData.set(i16.slice(offset));
    }
    const i16Buf = Buffer.from(frameData.buffer, frameData.byteOffset, frameData.byteLength);
    const encoded = encoder.encode(i16Buf, OPUS_FRAME_SIZE);
    frames.push(Buffer.from(encoded));
    offset += OPUS_FRAME_SIZE;
  }

  encoder.delete();

  // Build binary format
  const headerSize = 4 + 1 + 4 + 1 + 4; // magic + version + sampleRate + channels + frameCount
  const frameSizeHeaders = frames.length * 2; // 2 bytes per frame size
  const frameDataSize = frames.reduce((sum, f) => sum + f.length, 0);
  const totalSize = headerSize + frameSizeHeaders + frameDataSize;

  const buf = Buffer.alloc(totalSize);
  let pos = 0;

  // Header
  MAGIC.copy(buf, pos); pos += 4;
  buf.writeUInt8(FORMAT_VERSION, pos); pos += 1;
  buf.writeUInt32LE(sampleRate, pos); pos += 4; // original sample rate (for resampling back)
  buf.writeUInt8(OPUS_CHANNELS, pos); pos += 1;
  buf.writeUInt32LE(frames.length, pos); pos += 4;

  // Frame data
  for (const frame of frames) {
    buf.writeUInt16LE(frame.length, pos); pos += 2;
    frame.copy(buf, pos); pos += frame.length;
  }

  return buf;
}

/**
 * Decode Opus binary format back to Float32Array PCM.
 * @param {Buffer} data — compressed Opus binary
 * @returns {{ audio: Float32Array, sampleRate: number }}
 */
function decode(data) {
  const OS = getOpusScript();

  // Parse header
  let pos = 0;
  const magic = data.slice(pos, pos + 4); pos += 4;
  if (!magic.equals(MAGIC)) throw new Error("Invalid Opus cache format (bad magic)");

  const version = data.readUInt8(pos); pos += 1;
  if (version !== FORMAT_VERSION) throw new Error(`Unsupported Opus cache version: ${version}`);

  const originalSampleRate = data.readUInt32LE(pos); pos += 4;
  const channels = data.readUInt8(pos); pos += 1;
  const frameCount = data.readUInt32LE(pos); pos += 4;

  // Create decoder
  const decoder = new OS(OPUS_SAMPLE_RATE, channels, OPUS_APPLICATION);

  // Decode frames
  const pcmFrames = [];
  for (let i = 0; i < frameCount; i++) {
    const frameSize = data.readUInt16LE(pos); pos += 2;
    const frameData = data.slice(pos, pos + frameSize); pos += frameSize;
    const decoded = decoder.decode(frameData);
    // decoded is a Buffer containing Int16 samples
    const i16 = new Int16Array(decoded.buffer, decoded.byteOffset, decoded.byteLength / 2);
    pcmFrames.push(new Int16Array(i16)); // copy to own buffer
  }

  decoder.delete();

  // Concatenate all frames
  const totalSamples = pcmFrames.reduce((sum, f) => sum + f.length, 0);
  const allI16 = new Int16Array(totalSamples);
  let offset = 0;
  for (const frame of pcmFrames) {
    allI16.set(frame, offset);
    offset += frame.length;
  }

  // Convert to Float32
  const f32at48k = int16ToFloat32(allI16);

  // Resample back to original rate
  const f32 = resample(f32at48k, OPUS_SAMPLE_RATE, originalSampleRate);

  return { audio: f32, sampleRate: originalSampleRate };
}

module.exports = { encode, decode };
