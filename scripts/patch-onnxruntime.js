/**
 * Postinstall patch for onnxruntime-node.
 *
 * Removes setImmediate wrappers from backend.js that cause fatal V8 HandleScope
 * crashes when onnxruntime-node runs inside Electron Worker threads.
 *
 * Upstream: https://github.com/microsoft/onnxruntime/issues/20084
 *
 * Idempotent — safe to run multiple times. Prints a warning (but does not fail)
 * if the file structure doesn't match expectations.
 */

const fs = require('fs');
const path = require('path');

const BACKEND_PATH = path.join(
  __dirname, '..', 'node_modules', 'onnxruntime-node', 'dist', 'backend.js'
);

function getVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(__dirname, '..', 'node_modules', 'onnxruntime-node', 'package.json'), 'utf8')
    );
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Remove all setImmediate Promise wrappers from the source.
 *
 * The pattern in onnxruntime-node v1.x backend.js is:
 *
 *   <indent>return new Promise((resolve, reject) => {
 *       <indent+4>setImmediate(() => {
 *           <indent+8>try {
 *               <indent+12>resolve(EXPR);
 *           <indent+8>}
 *           <indent+8>catch (e) {
 *               <indent+12>// reject if any error is thrown
 *               <indent+12>reject(e);
 *           <indent+8>}
 *       <indent+4>});
 *   <indent>});
 *
 * We replace the whole thing with:
 *   <indent>return EXPR;
 */
function patch(src) {
  let result = src;
  let count = 0;

  // Find each "setImmediate" and work outward to replace the enclosing Promise block
  while (result.includes('setImmediate')) {
    const siIdx = result.indexOf('setImmediate');

    // Walk backward to find "return new Promise((resolve, reject) => {"
    const before = result.lastIndexOf('return new Promise((resolve, reject) => {', siIdx);
    if (before === -1) break;

    // Find "resolve(" after setImmediate
    const resolveIdx = result.indexOf('resolve(', siIdx);
    if (resolveIdx === -1) break;

    // Extract resolve argument with balanced parens
    const argStart = resolveIdx + 'resolve('.length;
    let depth = 1;
    let i = argStart;
    while (i < result.length && depth > 0) {
      if (result[i] === '(') depth++;
      else if (result[i] === ')') depth--;
      i++;
    }
    const resolveArg = result.slice(argStart, i - 1);

    // Find the indentation of the "return" line
    let lineStart = before;
    while (lineStart > 0 && result[lineStart - 1] !== '\n') lineStart--;
    const indent = result.slice(lineStart, before);

    // Find the end of the Promise block: look for the closing "});" at the same indent level
    // The pattern closes with:  <indent>});
    // We need to find this AFTER the resolve call
    const closingPattern = '\n' + indent + '});';
    const closeIdx = result.indexOf(closingPattern, resolveIdx);
    if (closeIdx === -1) break;

    const blockEnd = closeIdx + closingPattern.length;
    const replacement = indent + 'return ' + resolveArg + ';';
    result = result.slice(0, lineStart) + replacement + result.slice(blockEnd);
    count++;

    if (count > 10) break; // safety valve
  }

  return { result, count };
}

function main() {
  const version = getVersion();

  if (!fs.existsSync(BACKEND_PATH)) {
    console.log(`[patch-onnxruntime] onnxruntime-node not found — skipping.`);
    return;
  }

  const src = fs.readFileSync(BACKEND_PATH, 'utf8');

  if (!src.includes('setImmediate')) {
    console.log(`[patch-onnxruntime] v${version} — already patched. No changes needed.`);
    return;
  }

  const { result, count } = patch(src);

  if (count === 0) {
    console.warn(`[patch-onnxruntime] WARNING: v${version} — setImmediate found but patch pattern didn't match. File structure may have changed. Manual review needed.`);
    return;
  }

  fs.writeFileSync(BACKEND_PATH, result, 'utf8');

  // Verify
  const verify = fs.readFileSync(BACKEND_PATH, 'utf8');
  if (verify.includes('setImmediate')) {
    console.warn(`[patch-onnxruntime] WARNING: v${version} — patch applied but setImmediate still present (${count} blocks replaced). Partial match — manual review needed.`);
  } else {
    console.log(`[patch-onnxruntime] v${version} — patched successfully (${count} blocks). Removed all setImmediate wrappers.`);
  }
}

main();
