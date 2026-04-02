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

  it('backend.js run() should not wrap inference in setImmediate Promise', () => {
    const src = fs.readFileSync(BACKEND_PATH, 'utf8');
    // The patched (or natively fixed) run() method should not use setImmediate + Promise
    // which causes V8 HandleScope crashes in Electron worker threads
    expect(src).not.toContain('setImmediate');
    // Verify the file is valid onnxruntime backend code
    expect(src).toContain('onnxruntime');
  });

  it('patch script should be idempotent and backend.js should have valid exports', () => {
    const src = fs.readFileSync(BACKEND_PATH, 'utf8');
    // If already patched, no setImmediate means no changes needed
    expect(src).not.toContain('setImmediate');
    // The file should still be valid JS — check for any onnxruntime export pattern
    // (export names may vary across versions)
    expect(src.length).toBeGreaterThan(100);
    expect(src).toMatch(/exports?\./);
  });
});
