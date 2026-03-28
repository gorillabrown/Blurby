// Stub for 'sharp' — optional dependency of @huggingface/transformers
// used for image processing. Not needed for Kokoro TTS (text-to-speech only).
// This stub prevents "Cannot find module 'sharp'" when loading the CJS bundle
// in the packaged Electron app's worker thread.
module.exports = {};
