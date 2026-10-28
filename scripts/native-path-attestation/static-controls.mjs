import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import { Fault, readOwnData, decodeLocation, derivePositions } from './collector.mjs';
import { selfCheckTransportState, selfCheckContextRestore, restoreOwnDescriptors } from './runtime-client.mjs';

// Author these assertions before the predicates; an absent predicate is a red, never a receipt.
export function runPureControls() {
  let forbiddenGetterCalls = 0;
  const F = () => { forbiddenGetterCalls += 1; throw new Error('forbidden'); };
  const V = { type: 'function', objectId: 'synthetic-value' };
  const U = { type: 'undefined' };
  const O = { name: 'target', value: V, isOwn: true };
  const L = { scriptId: 'synthetic-fixture-script', lineNumber: 12, columnNumber: 7 };
  const E = value => ({ name: '[[FunctionLocation]]', value: { value } });
  const namedCases = [];
  function test(id, label, checks) {
    let assertionsPassed = 0;
    for (const check of checks) {
      try { check(); assertionsPassed += 1; } catch (error) {
        if (!(error instanceof assert.AssertionError) && !(error instanceof Fault)) throw error;
      }
    }
    namedCases.push({ id, label, outcome: assertionsPassed === checks.length ? 'PASS' : 'FAIL', assertionsPassed, assertionsExpected: checks.length });
  }
  const equal = (actual, expected) => () => assert.deepStrictEqual(actual(), expected);
  const data = (descriptors, expected = V) => equal(() => readOwnData(descriptors, 'target'), expected);
  const fault = (fn, code) => () => assert.throws(fn, error => error instanceof Fault && error.code === code);
  const bad = (descriptors, code) => fault(() => readOwnData(descriptors, 'target'), code);
  test('D01', 'own data', [data([O]), data([{ ...O, value: { type: 'object', subtype: 'null', value: null } }], { type: 'object', subtype: 'null', value: null }), data([{ ...O, value: U }], U)]);
  test('D02', 'explicit undefined get/set', [data([{ ...O, get: U, set: U }]), bad([{ ...O, get: null }], 'MALFORMED_ACCESSOR_SHAPE'), bad([{ ...O, set: null }], 'MALFORMED_ACCESSOR_SHAPE')]);
  test('D03', 'explicit undefined get only', [data([{ ...O, get: U }])]);
  test('D04', 'explicit undefined set only', [data([{ ...O, set: U }])]);
  test('D05', 'actual getter function', [bad([{ name: 'target', get: F }], 'GETTER_NOT_ADMITTED')]);
  test('D06', 'actual setter function', [bad([{ name: 'target', set: F }], 'SETTER_NOT_ADMITTED')]);
  test('D07', 'remote function getter', [bad([{ name: 'target', get: { type: 'function', objectId: 'g' } }], 'GETTER_NOT_ADMITTED')]);
  test('D08', 'remote object setter', [bad([{ name: 'target', set: { type: 'object', objectId: 's' } }], 'SETTER_NOT_ADMITTED'), bad([{ name: 'target', get: { type: 'object', objectId: 'g' } }], 'GETTER_NOT_ADMITTED')]);
  test('D09', 'both callable accessors', [bad([{ name: 'target', get: F, set: F }], 'ACCESSORS_NOT_ADMITTED')]);
  test('D10', 'contradictory data and callable getter', [bad([{ ...O, get: F }], 'CONTRADICTORY_DATA_ACCESSOR')]);
  test('D11', 'contradictory data and object setter', [bad([{ ...O, set: { type: 'object', objectId: 's' } }], 'CONTRADICTORY_DATA_ACCESSOR')]);
  test('D12', 'malformed accessor shape', [bad([{ name: 'target', get: 3 }], 'MALFORMED_ACCESSOR_SHAPE'), bad([{ name: 'target', set: 3 }], 'MALFORMED_ACCESSOR_SHAPE')]);
  test('D13', 'undefined accessor with object handle', [bad([{ ...O, get: { type: 'undefined', objectId: 'bad' } }], 'MALFORMED_ACCESSOR_SHAPE')]);
  test('D14', 'missing own value', [bad([{ name: 'target' }], 'MISSING_OWN_VALUE')]);
  const inherited = Object.create({ value: V });
  inherited.name = 'target';
  test('D15', 'inherited value is not own', [bad([inherited], 'MISSING_OWN_VALUE')]);
  test('D16', 'malformed data value', [bad([{ name: 'target', value: {} }], 'MALFORMED_DATA_VALUE')]);
  test('D17', 'literal function is not a remote data value', [bad([{ name: 'target', value: F }], 'MALFORMED_DATA_VALUE')]);
  const hostAccessor = { ...O };
  Object.defineProperty(hostAccessor, 'get', { get: F });
  const valueAccessor = {};
  Object.defineProperty(valueAccessor, 'type', { get: F });
  const hostArray = [];
  Object.defineProperty(hostArray, '0', { get: F });
  test('D18', 'accessor on descriptor itself', [bad([hostAccessor], 'MALFORMED_DESCRIPTOR_SHAPE'), bad(hostArray, 'MALFORMED_DESCRIPTOR_SHAPE'), bad([{ name: 'target', value: valueAccessor }], 'MALFORMED_DATA_VALUE'), bad(null, 'MALFORMED_DESCRIPTOR_SHAPE')]);
  test('D19', 'malformed isOwn metadata', [bad([{ ...O, isOwn: 'yes' }], 'MALFORMED_DESCRIPTOR_SHAPE'), bad([{ ...O, isOwn: false }], 'MALFORMED_DESCRIPTOR_SHAPE')]);
  test('D20', 'missing matching property', [bad([], 'MISSING_DATA_PROPERTY')]);
  test('D21', 'identical matching duplicates', [bad([O, O], 'DUPLICATE_DATA_PROPERTY')]);
  test('D22', 'conflicting matching duplicates', [bad([O, { name: 'target', value: { type: 'number', value: 2 } }], 'DUPLICATE_DATA_PROPERTY')]);
  test('L01', 'valid singleton', [equal(() => decodeLocation([E(L)]), L), equal(() => decodeLocation([{ name: '[[FunctionLocation]]', value: { type: 'object', subtype: 'internal#location', value: L } }], { runtimeWrapper: true }), L), fault(() => decodeLocation([E(L)], { runtimeWrapper: true }), 'MALFORMED_FUNCTION_LOCATION')]);
  test('L02', 'missing', [fault(() => decodeLocation([]), 'MISSING_FUNCTION_LOCATION')]);
  test('L03', 'identical duplicate', [fault(() => decodeLocation([E(L), E({ ...L })]), 'AMBIGUOUS_FUNCTION_LOCATION')]);
  test('L04', 'conflicting duplicate', [fault(() => decodeLocation([E(L), E({ ...L, scriptId: 'other-synthetic-script' })]), 'AMBIGUOUS_FUNCTION_LOCATION')]);
  test('L05', 'missing payload', [fault(() => decodeLocation([{ name: '[[FunctionLocation]]' }]), 'MALFORMED_FUNCTION_LOCATION'), fault(() => decodeLocation([{ name: '[[FunctionLocation]]', value: { type: 'object', subtype: 'internal#location' } }], { runtimeWrapper: true }), 'MALFORMED_FUNCTION_LOCATION')]);
  test('L06', 'empty scriptId', [fault(() => decodeLocation([E({ ...L, scriptId: '' })]), 'MALFORMED_FUNCTION_LOCATION')]);
  test('L07', 'blank scriptId', [fault(() => decodeLocation([E({ ...L, scriptId: ' ' })]), 'MALFORMED_FUNCTION_LOCATION')]);
  test('L08', 'noninteger line', [fault(() => decodeLocation([E({ ...L, lineNumber: 1.5 })]), 'MALFORMED_FUNCTION_LOCATION')]);
  test('L09', 'negative line', [fault(() => decodeLocation([E({ ...L, lineNumber: -1 })]), 'MALFORMED_FUNCTION_LOCATION')]);
  test('L10', 'noninteger column', [fault(() => decodeLocation([E({ ...L, columnNumber: '7' })]), 'MALFORMED_FUNCTION_LOCATION')]);
  test('L11', 'negative column', [fault(() => decodeLocation([E({ ...L, columnNumber: -1 })]), 'MALFORMED_FUNCTION_LOCATION')]);
  assert.equal(namedCases.length, 33);
  assert.equal(forbiddenGetterCalls, 0);
  return { namedCases, forbiddenGetterCalls };
}

export function checkTokenizer() {
  assert.equal(selfCheckTransportState(), true);
  assert.equal(selfCheckContextRestore(), true);
  const source = '// 😀\r\nconst a = "function target(){}";\r\nconst b = `function target(){} ${/function target\\(\\)\\{\\}/.source}`;\r\n/* function target(){} */\r\nasync function target(\r\n x = /[{}()]/\r\n) { return `${x}`; }\r\n';
  const result = derivePositions(Buffer.from(source), ['target']);
  assert.deepEqual(result.positions[0], { name: 'target', D: { line: 4, column: 0 }, F: { line: 4, column: 6 }, P: { line: 4, column: 21 }, B: { line: 6, column: 2 } });
  assert.deepEqual(derivePositions(Buffer.from('\n/*😀*/ async function target() {}'), ['target']).positions[0], { name: 'target', D: { line: 1, column: 7 }, F: { line: 1, column: 13 }, P: { line: 1, column: 28 }, B: { line: 1, column: 31 } });
  assert.equal(derivePositions(Buffer.from('\nfunction other(){} /function target\\(\\)\\{\\}/.test("");\nfunction target() {}'), ['target']).positions[0].D.line, 2);
  assert.throws(() => derivePositions(Buffer.from('\ufefffunction target() {}'), ['target']), error => error instanceof Fault && error.code === 'INPUT_PIN');
  assert.throws(() => derivePositions(Buffer.from('function target() {}\nfunction target() {}'), ['target']), error => error instanceof Fault && error.code === 'INPUT_PIN');
  assert.throws(() => derivePositions(Uint8Array.of(0xff), ['target']), error => error instanceof Fault && error.code === 'INPUT_PIN');
  return true;
}

export async function checkSourceInvariants() {
  const entrySource = await readFile(new URL('./fixture-entry.cjs', import.meta.url), 'utf8');
  assert.equal(entrySource.includes(restoreOwnDescriptors.toString()), true);
  return true;
}

export async function main(argv = process.argv.slice(2)) {
  // Driver owns closed input/schema, byte pins and exclusive atomic report publication.
  const { runStaticControls } = await import('./driver.mjs');
  return runStaticControls(argv, { runPureControls, checkTokenizer, checkSourceInvariants });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(code => { process.exitCode = code; }, () => { process.exitCode = 2; });
}
