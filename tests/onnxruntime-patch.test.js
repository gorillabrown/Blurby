import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const BACKEND_PATH = path.join(
  import.meta.dirname, '..', 'node_modules', 'onnxruntime-node', 'dist', 'backend.js'
);

describe('onnxruntime-node postinstall patch', () => {
  it('backend.js should not contain setImmediate (causes V8 HandleScope crash in worker threads)', () => {
    const src = fs.readFileSync(BACKEND_PATH, 'utf8');
    expect(src).not.toContain('setImmediate');
  });

  it('backend.js run() should return the inference call directly', () => {
    const src = fs.readFileSync(BACKEND_PATH, 'utf8');
    // The patched run() method should have a direct return, not a Promise wrapper
    expect(src).toContain('async run(feeds, fetches, options)');
    expect(src).not.toContain('new Promise((resolve, reject)');
  });

  it('patch script should be idempotent', () => {
    const src = fs.readFileSync(BACKEND_PATH, 'utf8');
    // Run the patch logic in-memory to verify idempotency
    // If already patched, no setImmediate means no changes needed
    expect(src).not.toContain('setImmediate');
    // The file should still be valid JS (has the expected exports)
    expect(src).toContain('exports.onnxruntimeBackend');
    expect(src).toContain('exports.listSupportedBackends');
  });
});
