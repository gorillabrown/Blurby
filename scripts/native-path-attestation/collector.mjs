import { createHash } from 'node:crypto';
import { types as utilTypes } from 'node:util';
import * as fs from 'node:fs/promises';
import { win32 as windowsPath } from 'node:path';

export class Fault extends Error {
  constructor(code) { super(code); this.name = 'Fault'; this.code = code; }
}
const fail = code => { throw new Fault(code); };
export const CAPS = Object.freeze({ children: 128, descriptors: 512, internalProperties: 32, scopes: 8, messageBytes: 2097152, receivedBytes: 67108864, path: 4096, name: 128, version: 64, scriptId: 128, objectId: 8192, inFlight: 8, nodeRequests: 1266, electronRequests: 1268 });
export const TARGETS = Object.freeze({ main: Object.freeze(['getDataPath', 'getLibrary', 'saveHistory']), engine: Object.freeze(['initSyncEngine', 'getSyncStatus', 'stopAutoSync']), queue: Object.freeze(['initSyncQueue', 'getPendingOps', 'getDeviceId']) });
export const PROBES = Object.freeze({ controlled: Object.freeze(['probeSync', 'probeAsync', 'probeMultiline']), main: Object.freeze(['getSettingsPath', 'backupFile', 'recordReadingSession']), engine: Object.freeze(['sha256', 'setSyncStatus', 'loadSyncState']), queue: Object.freeze(['generateDeviceId', 'loadQueue', 'saveQueue']) });
const own = (value, name) => Object.prototype.hasOwnProperty.call(value, name);
const text = (value, cap, nonblank = false) => typeof value === 'string' && value.length > 0 && value.length <= cap && (!nonblank || value.trim().length > 0);

function record(value, code) {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || utilTypes.isProxy(value)) fail(code);
  let descriptors;
  try { descriptors = Object.getOwnPropertyDescriptors(value); } catch { fail(code); }
  if (Reflect.ownKeys(descriptors).some(key => typeof key !== 'string' || !own(descriptors[key], 'value'))) fail(code);
  return Object.fromEntries(Object.entries(descriptors).map(([key, descriptor]) => [key, descriptor.value]));
}

function list(value, max, code) {
  if (!Array.isArray(value) || utilTypes.isProxy(value)) fail(code);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const length = descriptors.length?.value;
  if (!Number.isSafeInteger(length) || length < 0 || length > max || Reflect.ownKeys(descriptors).length !== length + 1) fail(code);
  const result = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = descriptors[String(index)];
    if (!descriptor || !own(descriptor, 'value')) fail(code);
    result.push(descriptor.value);
  }
  return result;
}

function handleToken(value) {
  return text(value, CAPS.objectId) || (value !== null && typeof value === 'object' && !utilTypes.isProxy(value) && Object.isFrozen(value) && Reflect.ownKeys(value).length === 0);
}

function remote(value, code = 'MALFORMED_DATA_VALUE') {
  const item = record(value, code);
  const allowed = ['type', 'subtype', 'className', 'value', 'unserializableValue', 'description', 'objectId'];
  if (Object.keys(item).some(key => !allowed.includes(key))) fail(code);
  for (const key of ['subtype', 'className', 'description', 'unserializableValue']) if (own(item, key) && typeof item[key] !== 'string') fail(code);
  const hasValue = own(item, 'value');
  const hasHandle = own(item, 'objectId');
  const hasSpecial = own(item, 'unserializableValue');
  if (hasHandle && !handleToken(item.objectId)) fail(code);
  switch (item.type) {
    case 'undefined': if (hasValue || hasHandle || hasSpecial || own(item, 'subtype')) fail(code); break;
    case 'string': if (!hasValue || typeof item.value !== 'string' || hasHandle || hasSpecial || own(item, 'subtype')) fail(code); break;
    case 'boolean': if (!hasValue || typeof item.value !== 'boolean' || hasHandle || hasSpecial || own(item, 'subtype')) fail(code); break;
    case 'number':
      if (hasHandle || own(item, 'subtype') || hasValue === hasSpecial || (hasValue && (typeof item.value !== 'number' || !Number.isFinite(item.value))) || (hasSpecial && !['NaN', 'Infinity', '-Infinity', '-0'].includes(item.unserializableValue))) fail(code);
      break;
    case 'bigint': if (hasHandle || hasValue || own(item, 'subtype') || !hasSpecial || !/^-?(0|[1-9][0-9]*)n$/.test(item.unserializableValue)) fail(code); break;
    case 'symbol': if (hasValue || hasSpecial || own(item, 'subtype') || !hasHandle) fail(code); break;
    case 'function': if (!hasHandle || hasValue || hasSpecial || own(item, 'subtype')) fail(code); break;
    case 'object':
      if (item.subtype === 'null') { if (!hasValue || item.value !== null || hasHandle || hasSpecial) fail(code); }
      else if (!hasHandle || hasValue || hasSpecial) fail(code);
      break;
    default: fail(code);
  }
  return value;
}

function descriptorRows(descriptors, max = CAPS.descriptors, code = 'MALFORMED_DESCRIPTOR_SHAPE') {
  return list(descriptors, max, code).map(value => {
    const row = record(value, code);
    if (!text(row.name, CAPS.name) || (own(row, 'isOwn') && row.isOwn !== true)) fail(code);
    for (const key of ['writable', 'enumerable', 'configurable', 'wasThrown']) if (own(row, key) && typeof row[key] !== 'boolean') fail(code);
    return row;
  });
}

function accessor(value) {
  if (typeof value === 'function') return true;
  const item = record(value, 'MALFORMED_ACCESSOR_SHAPE');
  if (item.type === 'undefined') {
    if (Object.keys(item).length !== 1) fail('MALFORMED_ACCESSOR_SHAPE');
    return false;
  }
  remote(value, 'MALFORMED_ACCESSOR_SHAPE');
  if (!['function', 'object'].includes(item.type) || item.subtype === 'null') fail('MALFORMED_ACCESSOR_SHAPE');
  return true;
}

export function readOwnData(descriptors, name) {
  if (!text(name, CAPS.name)) fail('MALFORMED_DESCRIPTOR_SHAPE');
  const rows = descriptorRows(descriptors);
  const matches = rows.filter(row => row.name === name);
  if (matches.length > 1) fail('DUPLICATE_DATA_PROPERTY');
  if (matches.length === 0) fail('MISSING_DATA_PROPERTY');
  const row = matches[0];
  const getter = own(row, 'get') ? accessor(row.get) : false;
  const setter = own(row, 'set') ? accessor(row.set) : false;
  if (own(row, 'value') && (getter || setter)) fail('CONTRADICTORY_DATA_ACCESSOR');
  if (getter && setter) fail('ACCESSORS_NOT_ADMITTED');
  if (getter) fail('GETTER_NOT_ADMITTED');
  if (setter) fail('SETTER_NOT_ADMITTED');
  if (!own(row, 'value')) fail('MISSING_OWN_VALUE');
  return remote(row.value);
}

export function decodeLocation(internalProperties, { runtimeWrapper = false } = {}) {
  const rows = descriptorRows(internalProperties, CAPS.internalProperties, 'MALFORMED_FUNCTION_LOCATION');
  const matches = rows.filter(row => row.name === '[[FunctionLocation]]');
  if (matches.length > 1) fail('AMBIGUOUS_FUNCTION_LOCATION');
  if (matches.length === 0) fail('MISSING_FUNCTION_LOCATION');
  const wrapper = record(matches[0].value, 'MALFORMED_FUNCTION_LOCATION');
  if (runtimeWrapper && (wrapper.type !== 'object' || wrapper.subtype !== 'internal#location' || Object.keys(wrapper).some(key => !['type', 'subtype', 'value', 'description'].includes(key)))) fail('MALFORMED_FUNCTION_LOCATION');
  const location = record(wrapper.value, 'MALFORMED_FUNCTION_LOCATION');
  if (Object.keys(location).length !== 3 || !text(location.scriptId, CAPS.scriptId, true) || !Number.isSafeInteger(location.lineNumber) || location.lineNumber < 0 || !Number.isSafeInteger(location.columnNumber) || location.columnNumber < 0) fail('MALFORMED_FUNCTION_LOCATION');
  return { scriptId: location.scriptId, lineNumber: location.lineNumber, columnNumber: location.columnNumber };
}

function tokenize(source) {
  const tokens = [];
  let index = 0;
  const identifierStart = character => character !== undefined && /[\p{ID_Start}_$]/u.test(character);
  const identifierPart = character => character !== undefined && /[\p{ID_Continue}$\u200c\u200d]/u.test(character);
  const regexPrefix = new Set(['(', '[', '{', '=', ':', ',', ';', '!', '?', '+', '-', '*', '/', '%', '<', '>', '&', '|', '^', '~', '&&', '||', '??', '...', 'return', 'throw', 'case', 'delete', 'void', 'typeof', 'yield', 'await', 'else', 'do', 'in', 'of', '=>']);
  function quoted(quote) {
    index += 1;
    while (index < source.length) {
      const character = source[index++];
      if (character === quote) return;
      if (character === '\\') { if (source[index] === '\r' && source[index + 1] === '\n') index += 2; else index += 1; }
      else if (character === '\n' || character === '\r') fail('INPUT_PIN');
    }
    fail('INPUT_PIN');
  }
  function regularExpression() {
    index += 1;
    let inClass = false;
    while (index < source.length) {
      const character = source[index++];
      if (character === '\\') { index += 1; continue; }
      if (character === '\r' || character === '\n') fail('INPUT_PIN');
      if (character === '[') inClass = true;
      else if (character === ']') inClass = false;
      else if (character === '/' && !inClass) {
        while (identifierPart(source[index])) index += source.codePointAt(index) > 0xffff ? 2 : 1;
        return;
      }
    }
    fail('INPUT_PIN');
  }
  function template() {
    index += 1;
    while (index < source.length) {
      const character = source[index++];
      if (character === '\\') { index += 1; continue; }
      if (character === '`') return;
      if (character === '$' && source[index] === '{') {
        index += 1;
        scan(true, false);
      }
    }
    fail('INPUT_PIN');
  }
  function scan(interpolation = false, emit = true) {
    let depth = 0;
    let previous = null;
    let beforePrevious = null;
    let functionHeader = null;
    let bodyKind = null;
    const parens = [];
    const braces = [];
    while (index < source.length) {
      const start = index;
      const character = source[index];
      if (/\s/u.test(character)) { index += 1; continue; }
      if (character === '/' && source[index + 1] === '/') { index += 2; while (index < source.length && !['\r', '\n'].includes(source[index])) index += 1; continue; }
      if (character === '/' && source[index + 1] === '*') {
        index = source.indexOf('*/', index + 2);
        if (index < 0) fail('INPUT_PIN');
        index += 2; continue;
      }
      let value;
      if (character === '"' || character === "'") { quoted(character); value = '<literal>'; }
      else if (character === '`') { template(); value = '<literal>'; }
      else if (character === '/' && (previous === null || regexPrefix.has(previous))) { regularExpression(); value = '<literal>'; }
      else if (identifierStart(String.fromCodePoint(source.codePointAt(index)))) {
        index += source.codePointAt(index) > 0xffff ? 2 : 1;
        while (index < source.length && identifierPart(String.fromCodePoint(source.codePointAt(index)))) index += source.codePointAt(index) > 0xffff ? 2 : 1;
        value = source.slice(start, index);
      } else if (/[0-9]/.test(character)) {
        index += 1;
        while (index < source.length && /[\w.]/u.test(source[index])) index += 1;
        value = '<literal>';
      } else {
        value = source.slice(index, index + 3) === '...' ? source.slice(index, index += 3) : ['=>', '++', '--', '?.', '&&', '||', '??', '**'].includes(source.slice(index, index + 2)) ? source.slice(index, index += 2) : source[index++];
      }
      if (value === 'function') {
        const before = previous === 'async' ? beforePrevious : previous;
        functionHeader = { declaration: before === null || [';', '{', '}', 'export', 'default'].includes(before) };
      }
      if (value === '{') {
        depth += 1;
        braces.push(bodyKind ?? ((previous === null || [';', 'else', 'try', 'finally', 'do', ')'].includes(previous)) ? 'block' : 'expression'));
        bodyKind = null;
      }
      let afterBlock = false;
      if (value === '}') {
        if (interpolation && depth === 0) return;
        depth -= 1;
        if (depth < 0) fail('INPUT_PIN');
        afterBlock = braces.pop() === 'block';
      }
      if (value === '(') {
        parens.push(functionHeader ?? { control: ['if', 'while', 'for', 'with', 'switch', 'catch'].includes(previous) });
        functionHeader = null;
      }
      const parenthesis = value === ')' ? parens.pop() : null;
      if (parenthesis && own(parenthesis, 'declaration')) bodyKind = parenthesis.declaration ? 'block' : 'expression';
      if (emit) tokens.push({ value, offset: start });
      beforePrevious = previous;
      previous = parenthesis?.control || afterBlock ? ';' : value;
    }
    if (interpolation) fail('INPUT_PIN');
  }
  scan();
  return tokens;
}

export function derivePositions(sourceBytes, names) {
  if (!(sourceBytes instanceof Uint8Array) || !Array.isArray(names) || names.length === 0 || new Set(names).size !== names.length || names.some(name => !text(name, CAPS.name))) fail('INPUT_PIN');
  let source;
  try { source = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(sourceBytes); } catch { fail('INPUT_PIN'); }
  if (source.charCodeAt(0) === 0xfeff || source.includes('\0')) fail('INPUT_PIN');
  const tokens = tokenize(source);
  const closes = new Map();
  const stack = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const value = tokens[index].value;
    if (['(', '[', '{'].includes(value)) stack.push(index);
    else if ([')', ']', '}'].includes(value)) {
      const open = stack.pop();
      if (open === undefined || ['(', '[', '{'].indexOf(tokens[open].value) !== [')', ']', '}'].indexOf(value)) fail('INPUT_PIN');
      closes.set(open, index);
    }
  }
  if (stack.length > 0) fail('INPUT_PIN');
  function coordinate(offset) {
    let line = 0;
    let previousLF = -1;
    for (let index = 0; index < offset; index += 1) if (source[index] === '\n') { line += 1; previousLF = index; }
    if (line === 0) fail('INPUT_PIN');
    return { line, column: offset - 1 - previousLF };
  }
  const positions = names.map(name => {
    const candidates = [];
    for (let index = 0; index < tokens.length; index += 1) {
      if (tokens[index].value !== 'function' || tokens[index + 1]?.value !== name || tokens[index + 2]?.value !== '(') continue;
      const async = tokens[index - 1]?.value === 'async' && !/[\r\n]/.test(source.slice(tokens[index - 1].offset + 5, tokens[index].offset));
      const d = async ? index - 1 : index;
      const preceding = tokens[d - 1]?.value;
      if (preceding !== undefined && ![';', '{', '}', 'export', 'default'].includes(preceding)) continue;
      const body = closes.get(index + 2) + 1;
      if (!Number.isSafeInteger(body) || tokens[body]?.value !== '{' || !closes.has(body)) fail('INPUT_PIN');
      candidates.push({ name, D: coordinate(tokens[d].offset), F: coordinate(tokens[index].offset), P: coordinate(tokens[index + 2].offset), B: coordinate(tokens[body].offset) });
    }
    if (candidates.length !== 1) fail('INPUT_PIN');
    return candidates[0];
  });
  return { sha256: createHash('sha256').update(sourceBytes).digest('hex'), positions };
}

const MODES = ['node-fixture-core', 'electron-fixture', 'native-package'];
const FAMILIES = ['main', 'engine', 'queue'];
const VERSION_NAMES = ['node', 'electron', 'chrome', 'v8', 'icu', 'modules'];
const samePath = (left, right) => pathKey(left) === pathKey(right);
function pathKey(value) {
  return windowsPath.normalize(value).replaceAll('/', '\\').split('').map(character => {
    const upper = character.toUpperCase();
    return upper.length === 1 ? upper : character;
  }).join('');
}
function syntaxPath(value, reason = 'PATH_ALIAS') {
  if (!text(value, CAPS.path) || !/^[A-Za-z]:[\\/]/.test(value) || value.startsWith('\\\\') || value.includes('\0')) fail(reason);
  const components = value.slice(3).split(/[\\/]/);
  if (components.some(component => !component || component === '.' || component === '..' || /[. ]$/.test(component) || /[<>:"|?*]/.test(component))) fail(reason);
  return windowsPath.normalize(value);
}

async function hostCanonical(value) {
  const normalized = syntaxPath(value);
  const root = windowsPath.parse(normalized).root;
  let cursor = root;
  let missing = false;
  for (const component of normalized.slice(root.length).split('\\')) {
    cursor = windowsPath.join(cursor, component);
    if (missing) continue;
    let status;
    try { status = await fs.lstat(cursor); } catch (error) {
      if (error?.code === 'ENOENT') { missing = true; continue; }
      fail('PATH_ALIAS');
    }
    if (status.isSymbolicLink()) fail('PATH_ALIAS');
    let actual;
    try { actual = await fs.realpath(cursor); } catch { fail('PATH_ALIAS'); }
    if (!samePath(actual, cursor)) fail('PATH_ALIAS');
  }
  return normalized;
}

async function moduleCanonical(value, expected, native) {
  if (native) {
    const expectedNormalized = syntaxPath(expected, 'MODULE_FILENAME');
    const boundary = expectedNormalized.indexOf('\\app.asar\\');
    if (boundary < 0) fail('INPUT_PIN');
    const archive = expectedNormalized.slice(0, boundary + '\\app.asar'.length);
    const suffix = expectedNormalized.slice(boundary + '\\app.asar\\'.length);
    if (!['main.js', 'main\\sync-engine.js', 'main\\sync-queue.js'].includes(suffix)) fail('INPUT_PIN');
    const observed = syntaxPath(value, 'MODULE_FILENAME');
    if (observed.slice(boundary + '\\app.asar\\'.length) !== suffix || !samePath(observed.slice(0, boundary + '\\app.asar'.length), archive)) fail('MODULE_FILENAME');
    await hostCanonical(archive);
    return observed;
  }
  const observed = syntaxPath(value, 'MODULE_FILENAME');
  if (!samePath(observed, expected)) fail('MODULE_FILENAME');
  return hostCanonical(observed);
}

function asHandle(value, reason, requiredType = 'object', subtype = null) {
  const item = record(value, reason);
  if (item.type !== requiredType || !own(item, 'objectId') || !handleToken(item.objectId) || item.subtype === 'proxy' || (subtype !== null && item.subtype !== subtype)) fail(reason);
  return value;
}
const uninitialized = value => value?.type === 'undefined' || (value?.type === 'object' && value?.subtype === 'null');
function primitive(value, type, reason) {
  const item = record(value, reason);
  if (item.type !== type || !own(item, 'value') || typeof item.value !== type) fail(reason);
  return item.value;
}
function data(descriptors, name, reason = 'DATA_DESCRIPTOR') {
  try { return readOwnData(descriptors, name); } catch (error) {
    if (error instanceof Fault) fail(reason);
    throw error;
  }
}
function metadataLocation(packet) {
  try { return decodeLocation(packet.internalProperties, { runtimeWrapper: true }); } catch (error) {
    const mapping = { MISSING_FUNCTION_LOCATION: 'FUNCTION_LOCATION_MISSING', AMBIGUOUS_FUNCTION_LOCATION: 'FUNCTION_LOCATION_AMBIGUOUS', MALFORMED_FUNCTION_LOCATION: 'FUNCTION_LOCATION_MALFORMED' };
    if (error instanceof Fault) fail(mapping[error.code] ?? 'FUNCTION_LOCATION_MALFORMED');
    throw error;
  }
}

function closed(value, keys, code = 'INPUT_PIN') {
  const item = record(value, code);
  if (Object.keys(item).length !== keys.length || keys.some(key => !own(item, key))) fail(code);
  return item;
}

function validateConfig(config, barriers) {
  closed(config, ['mode', 'caseId', 'runId', 'runNonce', 'bundleManifestSha256', 'toolCommit', 'inputManifestSha256', 'identity', 'modulePaths', 'sourceFamilies', 'paths', 'normalRootCanonical', 'startup', 'deadline', 'startedUtc']);
  if (!MODES.includes(config.mode) || !text(config.caseId, CAPS.name) || !/^[0-9a-f]{32}$/.test(config.runNonce) || !/^[0-9a-f]{40}$/.test(config.toolCommit) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(config.runId) || !Number.isFinite(config.deadline) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(config.startedUtc)) fail('INPUT_PIN');
  for (const name of ['bundleManifestSha256', 'inputManifestSha256']) if (!/^[0-9a-f]{64}$/.test(config[name])) fail('INPUT_PIN');
  const identity = closed(config.identity, ['pid', 'spawnBracket', 'exeCanonical', 'exeSha256', 'resourcesCanonical', 'versions']);
  if (!Number.isSafeInteger(identity.pid) || identity.pid < 1 || !/^[0-9a-f]{64}$/.test(identity.exeSha256)) fail('INPUT_PIN');
  syntaxPath(identity.exeCanonical, 'INPUT_PIN');
  closed(config.modulePaths, ['root', 'main', 'engine', 'queue']);
  for (const value of Object.values(config.modulePaths)) syntaxPath(value, 'INPUT_PIN');
  closed(config.paths, ['dataCanonical', 'queueCanonical', 'syncStateCanonical', 'userDataCanonical']);
  for (const value of Object.values(config.paths)) syntaxPath(value, 'INPUT_PIN');
  if (config.normalRootCanonical !== null) syntaxPath(config.normalRootCanonical, 'INPUT_PIN');
  if (typeof config.startup !== 'boolean' || (config.startup && !['native-package'].includes(config.mode) && config.caseId !== 'DELAYED_INITIALIZATION')) fail('INPUT_PIN');
  if (config.mode === 'native-package' && barriers !== undefined && Reflect.ownKeys(barriers).length !== 0) fail('GRANT_INVALID');
  if (barriers !== undefined) {
    const entries = record(barriers, 'GRANT_INVALID');
    if (Object.keys(entries).some(key => !['S0_COMPLETE', 'STARTUP_PENDING'].includes(key) || typeof entries[key] !== 'function')) fail('GRANT_INVALID');
  }
  const families = list(config.sourceFamilies, 3, 'INPUT_PIN');
  if (families.length !== 3) fail('INPUT_PIN');
  for (let index = 0; index < 3; index += 1) {
    const family = closed(families[index], ['role', 'relativePath', 'sha256', 'positions']);
    const probeNames = config.mode === 'native-package' ? PROBES[family.role] : PROBES.controlled;
    if (family.role !== FAMILIES[index] || !text(family.relativePath, CAPS.path) || !/^[0-9a-f]{64}$/.test(family.sha256)) fail('INPUT_PIN');
    const names = [...TARGETS[family.role], ...probeNames];
    if (!Array.isArray(family.positions) || family.positions.length !== 6 || names.some(name => family.positions.filter(position => position.name === name).length !== 1)) fail('INPUT_PIN');
    for (const position of family.positions) {
      closed(position, ['name', 'D', 'F', 'P', 'B']);
      for (const policy of ['D', 'F', 'P', 'B']) {
        closed(position[policy], ['line', 'column']);
        if (!Number.isSafeInteger(position[policy].line) || position[policy].line < 1 || !Number.isSafeInteger(position[policy].column) || position[policy].column < 0) fail('INPUT_PIN');
      }
    }
  }
}

// All configuration is assembled from frozen pins by the driver; it grants no process or path authority.
export async function collect(config, client, barriers) {
  const receipt = {
    schemaVersion: 'npa.result.v1', kind: 'collection', runId: config.runId, runNonce: config.runNonce,
    bundleManifestSha256: config.bundleManifestSha256, toolCommit: config.toolCommit, inputManifestSha256: config.inputManifestSha256,
    startedUtc: config.startedUtc, elapsedMs: 0, outcome: 'FAIL', reason: 'INTERNAL_ERROR', stage: 'PRECHECK', custody: null,
    cleanup: { groupsAttempted: 0, groupsAcked: 0, socketCloseAck: false, forcedStop: false, absenceProved: false, overrunMs: 0 },
    mode: config.mode, caseId: config.caseId, pid: config.identity?.pid ?? null, spawnBracket: config.identity?.spawnBracket ?? null, identity: null,
    counts: { rpcSent: 0, maxInFlight: 0, s0Attempts: 0, rootChildren: null, engineChildren: null, forbiddenGetterCalls: 0 },
    positions: { policy: null, families: [], externalSourceHashes: [] },
    graph: { rootCanonical: null, mainFamilyCanonical: null, engineCanonical: null, queueCanonical: null, nativeRootAlias: null, selectedEdgesValid: null, loadedFlagsValid: null, tupleDistinct: [] },
    paths: { dataCanonical: null, queueCanonical: null, syncStateCanonical: null }, comparisons: [], appRead: null,
  };
  const groups = new Map();
  let policy = null;
  let pendingCount = 0;
  const node = config.mode === 'node-fixture-core';
  const native = config.mode === 'native-package';
  function deadline() { if (performance.now() >= config.deadline) fail('DEADLINE'); }
  async function checked(operation) { deadline(); const value = await operation(); deadline(); return value; }
  async function pause(duration) {
    deadline();
    if (performance.now() + duration >= config.deadline) fail('DEADLINE');
    await new Promise(resolve => setTimeout(resolve, duration));
    deadline();
  }
  function pending(code) {
    if (config.startup && receipt.stage !== 'S1') { const error = new Fault(code); error.pending = true; throw error; }
    fail(code);
  }
  async function release(group) {
    if (groups.get(group) !== 'live') return;
    groups.set(group, 'sent');
    if (await client.releaseGroup(group) !== true) fail('RELEASE');
    groups.set(group, 'acked');
  }
  async function batches(items, callback) {
    const results = [];
    for (let index = 0; index < items.length; index += CAPS.inFlight) {
      const batch = await Promise.allSettled(items.slice(index, index + CAPS.inFlight).map(callback));
      const rejected = batch.find(item => item.status === 'rejected');
      if (rejected) throw rejected.reason;
      results.push(...batch.map(item => item.value));
    }
    return results;
  }
  async function snapshot(group, second) {
    let memo = new Map();
    const snapshotFacts = { modules: {}, arrays: {}, functions: {}, locations: {}, bindings: {}, paths: {}, versions: {} };
    async function properties(handle) {
      asHandle(handle, 'PROTOCOL_SHAPE', handle.type === 'function' ? 'function' : 'object');
      if (!memo.has(handle.objectId)) memo.set(handle.objectId, checked(() => client.getOwnProperties(handle)));
      return memo.get(handle.objectId);
    }
    function required(rows, name, missing = 'DATA_DESCRIPTOR') { return data(rows, name, missing); }
    const processHandle = await checked(() => { groups.set(group, 'live'); return client.evaluateProcess(group); });
    const processProperties = await properties(processHandle);
    receipt.stage = 'IDENTITY';
    receipt.identity = { exeCanonical: null, exeSha256: null, arch: null, versions: {}, resourcesCanonical: null };
    const actualPid = primitive(required(processProperties.result, 'pid'), 'number', 'IDENTITY_PID');
    if (!Number.isSafeInteger(actualPid) || actualPid < 1 || actualPid !== config.identity.pid) fail('IDENTITY_PID');
    receipt.pid = actualPid;
    const exe = primitive(required(processProperties.result, 'execPath'), 'string', 'IDENTITY_EXE');
    receipt.identity.exeCanonical = exe;
    if (!samePath(syntaxPath(exe, 'IDENTITY_EXE'), config.identity.exeCanonical)) fail('IDENTITY_EXE');
    await hostCanonical(exe);
    receipt.identity.exeSha256 = config.identity.exeSha256;
    const arch = primitive(required(processProperties.result, 'arch'), 'string', 'IDENTITY_ARCH');
    receipt.identity.arch = arch;
    if (arch !== 'arm64') fail('IDENTITY_ARCH');
    const versions = await properties(asHandle(required(processProperties.result, 'versions'), 'IDENTITY_VERSION'));
    for (const name of VERSION_NAMES) {
      let value;
      try { value = readOwnData(versions.result, name); } catch (error) {
        if (error instanceof Fault && error.code === 'MISSING_DATA_PROPERTY' && node && ['electron', 'chrome'].includes(name)) continue;
        fail('IDENTITY_VERSION');
      }
      const observed = primitive(value, 'string', 'IDENTITY_VERSION');
      if (!text(observed, CAPS.version)) fail('IDENTITY_VERSION');
      receipt.identity.versions[name] = observed;
      snapshotFacts.versions[name] = observed;
      if (own(config.identity.versions, name) && config.identity.versions[name] !== observed) fail('IDENTITY_VERSION');
    }
    if (node && (snapshotFacts.versions.node !== '24.14.0' || own(snapshotFacts.versions, 'electron') || own(snapshotFacts.versions, 'chrome'))) fail('IDENTITY_VERSION');
    if (!node && snapshotFacts.versions.electron !== '42.11.18') fail('IDENTITY_VERSION');
    let resources;
    try { resources = readOwnData(processProperties.result, 'resourcesPath'); } catch (error) {
      if (!(node && error instanceof Fault && error.code === 'MISSING_DATA_PROPERTY')) fail('IDENTITY_EXE');
    }
    if (node) { if (resources !== undefined) fail('IDENTITY_EXE'); }
    else {
      const observed = primitive(resources, 'string', 'IDENTITY_EXE');
      receipt.identity.resourcesCanonical = observed;
      if (!samePath(syntaxPath(observed, 'IDENTITY_EXE'), config.identity.resourcesCanonical)) fail('IDENTITY_EXE');
      await hostCanonical(observed);
    }
    receipt.stage = second ? 'S1' : 'GRAPH';
    let root;
    try { root = readOwnData(processProperties.result, 'mainModule'); } catch (error) {
      if (error instanceof Fault && error.code === 'MISSING_DATA_PROPERTY') pending('MODULE_ROOT');
      fail('DATA_DESCRIPTOR');
    }
    if (uninitialized(root)) pending('MODULE_ROOT');
    asHandle(root, 'MODULE_ROOT');
    async function moduleFacts(handle, role, packet) {
      const propertiesPacket = packet ?? await properties(asHandle(handle, 'MODULE_ROOT'));
      const filename = primitive(required(propertiesPacket.result, 'filename'), 'string', 'MODULE_FILENAME');
      const loaded = primitive(required(propertiesPacket.result, 'loaded'), 'boolean', 'MODULE_LOADED');
      if (!loaded) pending('MODULE_LOADED');
      const canonical = await moduleCanonical(filename, config.modulePaths[role], native);
      snapshotFacts.modules[role] = { handle, canonical, loaded, packet: propertiesPacket };
      const field = { root: 'rootCanonical', main: 'mainFamilyCanonical', engine: 'engineCanonical', queue: 'queueCanonical' }[role];
      receipt.graph[field] = canonical;
      return snapshotFacts.modules[role];
    }
    const rootFacts = await moduleFacts(root, 'root');
    async function children(module, role, selectedRoles) {
      const array = asHandle(required(module.packet.result, 'children'), 'CHILD_ARRAY_SHAPE', 'object', 'array');
      const packet = await properties(array);
      const length = primitive(data(packet.result, 'length', 'CHILD_ARRAY_SHAPE'), 'number', 'CHILD_ARRAY_SHAPE');
      if (!Number.isSafeInteger(length) || length < 0 || length > CAPS.children) fail('CHILD_ARRAY_SHAPE');
      receipt.counts[role === 'root' ? 'rootChildren' : 'engineChildren'] = length;
      const rows = descriptorRows(packet.result);
      const numeric = rows.filter(row => /^-?[0-9]+(?:\.[0-9]+)?$/.test(row.name));
      if (numeric.length !== length || numeric.some(row => !/^(0|[1-9][0-9]*)$/.test(row.name) || Number(row.name) >= length)) fail('CHILD_ARRAY_SHAPE');
      const handles = [];
      for (let index = 0; index < length; index += 1) handles.push(asHandle(data(packet.result, String(index), 'CHILD_SLOT_SHAPE'), 'CHILD_SLOT_SHAPE'));
      const packets = await batches(handles, properties);
      const scanned = packets.map((child, index) => ({ handle: handles[index], packet: child, filename: primitive(required(child.result, 'filename'), 'string', 'MODULE_FILENAME'), loaded: primitive(required(child.result, 'loaded'), 'boolean', 'MODULE_LOADED') }));
      if (scanned.some(child => !text(child.filename, CAPS.path))) fail('MODULE_FILENAME');
      if (scanned.some(child => !child.loaded && !selectedRoles.some(selectedRole => samePath(child.filename, config.modulePaths[selectedRole])))) fail('MODULE_LOADED');
      const selected = {};
      for (const selectedRole of selectedRoles) {
        const matches = scanned.filter(child => samePath(child.filename, config.modulePaths[selectedRole]));
        if (matches.length === 0) pending('DIRECT_EDGE_MISSING');
        if (matches.length > 1) fail('DIRECT_EDGE_AMBIGUOUS');
        selected[selectedRole] = matches[0];
        if (!matches[0].loaded) pending('MODULE_LOADED');
      }
      if (scanned.some(child => !child.loaded)) fail('MODULE_LOADED');
      snapshotFacts.arrays[role] = { handle: array, handles, length };
      return selected;
    }
    const rootSelected = await children(rootFacts, 'root', native ? ['engine'] : ['main', 'engine']);
    if (native) snapshotFacts.modules.main = { ...rootFacts };
    else await moduleFacts(rootSelected.main.handle, 'main', rootSelected.main.packet);
    if (native) receipt.graph.mainFamilyCanonical = rootFacts.canonical;
    receipt.graph.nativeRootAlias = native;
    const engineFacts = await moduleFacts(rootSelected.engine.handle, 'engine', rootSelected.engine.packet);
    const engineSelected = await children(engineFacts, 'engine', ['queue']);
    const queueFacts = await moduleFacts(engineSelected.queue.handle, 'queue', engineSelected.queue.packet);
    receipt.graph.selectedEdgesValid = true;
    receipt.graph.loadedFlagsValid = true;
    const exportsPackets = await batches([engineFacts, queueFacts], async module => properties(asHandle(required(module.packet.result, 'exports'), 'DATA_DESCRIPTOR')));
    async function targets(role, descriptors) {
      const handles = TARGETS[role].map(name => asHandle(required(descriptors, name), 'DATA_DESCRIPTOR', 'function'));
      const packets = await batches(handles, properties);
      const locations = packets.map(metadataLocation);
      if (new Set(locations.map(location => location.scriptId)).size !== 1) fail('FUNCTION_SCRIPT_FAMILY');
      snapshotFacts.functions[role] = handles;
      snapshotFacts.locations[role] = locations;
      return packets;
    }
    const engineTargets = await targets('engine', exportsPackets[0].result);
    const queueTargets = await targets('queue', exportsPackets[1].result);
    if (snapshotFacts.locations.engine[0].scriptId === snapshotFacts.locations.queue[0].scriptId) fail('FUNCTION_SCRIPT_FAMILY');
    if (!second) receipt.stage = 'SCOPES';
    async function bindings(packet, requiredNames, probeNames) {
      const internal = descriptorRows(packet.internalProperties, CAPS.internalProperties, 'SCOPE_SHAPE');
      const matches = internal.filter(row => row.name === '[[Scopes]]');
      if (matches.length !== 1) fail('SCOPE_SHAPE');
      const scopeList = asHandle(data(internal, '[[Scopes]]', 'SCOPE_SHAPE'), 'SCOPE_SHAPE');
      const scopePacket = await properties(scopeList);
      const rows = descriptorRows(scopePacket.result, CAPS.descriptors, 'SCOPE_SHAPE');
      const numeric = rows.filter(row => /^-?[0-9]+(?:\.[0-9]+)?$/.test(row.name));
      if (numeric.length > CAPS.scopes || numeric.some(row => !/^(0|[1-9][0-9]*)$/.test(row.name) || Number(row.name) >= numeric.length)) fail('SCOPE_SHAPE');
      if (rows.some(row => row.name === 'length')) {
        const length = primitive(data(scopePacket.result, 'length', 'SCOPE_SHAPE'), 'number', 'SCOPE_SHAPE');
        if (length !== numeric.length) fail('SCOPE_SHAPE');
      }
      const scopes = [];
      for (let index = 0; index < numeric.length; index += 1) {
        const handle = asHandle(data(scopePacket.result, String(index), 'SCOPE_SHAPE'), 'SCOPE_SHAPE');
        const description = handle.description;
        if (description === 'Global') continue;
        if (!text(description, CAPS.name + 10) || !/^(?:Closure(?: \([^\r\n]{1,128}\))?|Script|Block(?: \([^\r\n]{1,128}\))?)$/.test(description)) fail('SCOPE_SHAPE');
        scopes.push(handle);
      }
      const eligible = await batches(scopes, properties);
      const found = {};
      for (const name of [...requiredNames, ...probeNames]) {
        const values = [];
        for (const scope of eligible) {
          try { values.push(readOwnData(scope.result, name)); } catch (error) {
            if (!(error instanceof Fault && error.code === 'MISSING_DATA_PROPERTY')) fail('DATA_DESCRIPTOR');
          }
        }
        if (values.length === 0) fail(probeNames.includes(name) ? 'PROBE_DATA_MISSING' : 'SCOPE_BINDING_MISSING');
        if (values.length > 1) fail('SCOPE_BINDING_AMBIGUOUS');
        found[name] = values[0];
      }
      return found;
    }
    const probeNames = role => second ? [] : native ? PROBES[role] : PROBES.controlled;
    const engineBindings = await bindings(engineTargets[0], ['ctx', 'syncStatePath'], probeNames('engine'));
    const queueBindings = await bindings(queueTargets[0], ['queuePath'], probeNames('queue'));
    if (uninitialized(engineBindings.ctx)) pending('PATH_UNINITIALIZED');
    const ctx = asHandle(engineBindings.ctx, 'SCOPE_BINDING_OPTIMIZED');
    snapshotFacts.ctx = ctx;
    const ctxPacket = await properties(ctx);
    const mainTargets = await targets('main', ctxPacket.result);
    if (new Set(FAMILIES.map(role => snapshotFacts.locations[role][0].scriptId)).size !== 3) fail('FUNCTION_SCRIPT_FAMILY');
    const mainBindings = await bindings(mainTargets[0], node ? ['_dataPath'] : ['_dataPath', 'app'], probeNames('main'));
    snapshotFacts.bindings = { main: mainBindings, engine: engineBindings, queue: queueBindings };
    if (!node) snapshotFacts.app = asHandle(mainBindings.app, 'SCOPE_BINDING_OPTIMIZED');
    const selectedPaths = { dataCanonical: mainBindings._dataPath, queueCanonical: queueBindings.queuePath, syncStateCanonical: engineBindings.syncStatePath };
    for (const [name, value] of Object.entries(selectedPaths)) {
      if (uninitialized(value)) pending('PATH_UNINITIALIZED');
      const observed = primitive(value, 'string', 'PATH_WRONG');
      receipt.paths[name] = observed;
      const normalized = syntaxPath(observed);
      if (config.normalRootCanonical !== null) {
        const normalKey = pathKey(config.normalRootCanonical);
        if (pathKey(normalized) === normalKey || pathKey(normalized).startsWith(normalKey + '\\')) fail('PATH_NORMAL');
      }
      await hostCanonical(observed);
      if (!samePath(normalized, config.paths[name])) fail('PATH_WRONG');
      snapshotFacts.paths[name] = normalized;
    }
    if (!second) receipt.stage = 'GRAMMAR';
    const familyProofs = [];
    for (const role of FAMILIES) {
      const locations = snapshotFacts.locations[role];
      const proof = { role, scriptId: locations[0].scriptId, targetPositions: [], probePositions: [] };
      for (let index = 0; index < 3; index += 1) proof.targetPositions.push({ name: TARGETS[role][index], line: locations[index].lineNumber, column: locations[index].columnNumber });
      if (!second) {
        const names = probeNames(role);
        const handles = names.map(name => asHandle(snapshotFacts.bindings[role][name], 'PROBE_DATA_MISSING', 'function'));
        const packets = await batches(handles, properties);
        const probeLocations = packets.map(metadataLocation);
        if (probeLocations.some(location => location.scriptId !== proof.scriptId)) fail('FUNCTION_SCRIPT_FAMILY');
        proof.probePositions = names.map((name, index) => ({ name, line: probeLocations[index].lineNumber, column: probeLocations[index].columnNumber }));
        familyProofs.push(proof);
        receipt.positions.families = familyProofs.slice();
      }
    }
    if (!second) {
      const candidates = ['D', 'F', 'P', 'B'].filter(candidate => familyProofs.every(proof => proof.probePositions.every(position => {
        const expected = config.sourceFamilies.find(family => family.role === proof.role).positions.find(entry => entry.name === position.name)[candidate];
        return position.line === expected.line && position.column === expected.column;
      })));
      if (candidates.length !== 1) fail('PROBE_POSITION');
      policy = candidates[0];
      receipt.positions.policy = policy;
      // Source tables are static evidence. Never project host tokens or raw inspector packets.
      receipt.positions.families = familyProofs;
    }
    for (const role of FAMILIES) {
      const source = config.sourceFamilies.find(family => family.role === role);
      snapshotFacts.locations[role].forEach((location, index) => {
        const expected = source.positions.find(entry => entry.name === TARGETS[role][index])[policy];
        if (location.lineNumber !== expected.line || location.columnNumber !== expected.column) fail('FUNCTION_POSITION');
      });
    }
    memo = null;
    return snapshotFacts;
  }
  try {
    validateConfig(config, barriers);
    receipt.positions.externalSourceHashes = config.sourceFamilies.map(({ relativePath, sha256 }) => ({ relativePath, sha256 }));
    deadline();
    let first;
    let activeGroup;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      activeGroup = `npa-${config.runNonce}-${attempt}`;
      receipt.counts.s0Attempts = attempt;
      try { first = await snapshot(activeGroup, false); break; } catch (error) {
        if (!(error instanceof Fault && error.pending)) throw error;
        pendingCount += 1;
        await checked(() => release(activeGroup));
        if (attempt === 3) fail('STARTUP_EXHAUSTED');
        if (config.caseId === 'DELAYED_INITIALIZATION' && attempt === 1) {
          if (typeof barriers?.STARTUP_PENDING !== 'function') fail('CONTROL_NOT_EXERCISED');
          await checked(() => barriers.STARTUP_PENDING());
        }
        await pause(attempt === 1 ? 250 : 500);
      }
    }
    if (config.caseId === 'DELAYED_INITIALIZATION' && (pendingCount < 1 || receipt.counts.s0Attempts < 2)) fail('CONTROL_NOT_EXERCISED');
    async function tuples(capture) {
      for (const role of ['root', 'engine']) {
        const equal = await checked(() => client.callAllowed(2, capture.modules[role].handle, capture.arrays[role].handles, activeGroup));
        if (typeof equal !== 'boolean') fail('PROTOCOL_SHAPE');
        receipt.graph.tupleDistinct.push(equal);
        if (!equal) fail('CHILD_DUPLICATE_IDENTITY');
      }
    }
    await tuples(first);
    receipt.stage = 'S0_COMPLETE';
    if (barriers?.S0_COMPLETE) await checked(() => barriers.S0_COMPLETE());
    if (!node) {
      receipt.stage = 'APP_READ';
      const pair = closed(await checked(() => client.callAllowed(3, first.app, [], activeGroup)), ['userData', 'isPackaged'], 'PROTOCOL_SHAPE');
      if (typeof pair.userData !== 'string' || typeof pair.isPackaged !== 'boolean') fail('PROTOCOL_SHAPE');
      receipt.appRead = { userDataCanonical: pair.userData, isPackaged: pair.isPackaged };
      if (pair.isPackaged !== native) fail('APP_PACKAGED');
      if (!samePath(syntaxPath(pair.userData, 'APP_USERDATA'), config.paths.userDataCanonical)) fail('APP_USERDATA');
      await hostCanonical(pair.userData);
    }
    receipt.stage = 'S1';
    const second = await snapshot(activeGroup, true);
    await tuples(second);
    receipt.stage = 'COMPARE';
    const comparisons = [
      ...['root', 'main', 'engine', 'queue'].map(role => [role === 'main' ? 'main-family' : role, first.modules[role].handle, second.modules[role].handle]),
      ...['root', 'engine'].map(role => [role + 'Array', first.arrays[role].handle, second.arrays[role].handle]),
      ['ctx', first.ctx, second.ctx],
      ...['engine', 'queue', 'main'].flatMap(role => TARGETS[role].map((name, index) => [role + '/' + name, first.functions[role][index], second.functions[role][index]])),
      ...(!node ? [['app', first.app, second.app]] : []),
    ];
    for (const [role, receiver, other] of comparisons) {
      const equal = await checked(() => client.callAllowed(1, receiver, [other], activeGroup));
      if (typeof equal !== 'boolean') fail('PROTOCOL_SHAPE');
      receipt.comparisons.push({ role, equal });
      if (!equal) fail('REFERENCE_CHANGED');
    }
    for (const role of ['root', 'main', 'engine', 'queue']) if (!samePath(first.modules[role].canonical, second.modules[role].canonical) || first.modules[role].loaded !== second.modules[role].loaded) fail('REFERENCE_CHANGED');
    for (const role of ['root', 'engine']) if (first.arrays[role].length !== second.arrays[role].length) fail('REFERENCE_CHANGED');
    if (JSON.stringify(first.versions) !== JSON.stringify(second.versions) || JSON.stringify(first.locations) !== JSON.stringify(second.locations) || JSON.stringify(first.paths) !== JSON.stringify(second.paths)) fail('REFERENCE_CHANGED');
    receipt.outcome = 'PASS';
    receipt.reason = 'NONE';
    receipt.stage = 'COMPLETE';
  } catch (error) {
    const detailedDataFaults = ['MALFORMED_DESCRIPTOR_SHAPE', 'DUPLICATE_DATA_PROPERTY', 'MISSING_DATA_PROPERTY', 'MALFORMED_ACCESSOR_SHAPE', 'CONTRADICTORY_DATA_ACCESSOR', 'ACCESSORS_NOT_ADMITTED', 'GETTER_NOT_ADMITTED', 'SETTER_NOT_ADMITTED', 'MISSING_OWN_VALUE', 'MALFORMED_DATA_VALUE'];
    receipt.reason = error instanceof Fault ? (detailedDataFaults.includes(error.code) ? 'DATA_DESCRIPTOR' : error.code) : (typeof error?.code === 'string' && ['DEADLINE', 'TRANSPORT', 'PROTOCOL_SHAPE', 'CAP_OVERFLOW', 'RELEASE', 'CLOSE', 'EXCEPTION'].includes(error.code) ? error.code : 'INTERNAL_ERROR');
    receipt.outcome = ['INPUT_PIN', 'GRANT_INVALID', 'OWNERSHIP', 'ENDPOINT'].includes(receipt.reason) ? 'HOLD' : 'FAIL';
  } finally {
    let cleanupReason = null;
    for (const [group, state] of groups) if (state === 'live') {
      try { await release(group); } catch { cleanupReason ??= 'RELEASE'; }
    }
    try { if (await client.close() !== true) cleanupReason ??= 'CLOSE'; } catch (error) {
      cleanupReason ??= ['TRANSPORT', 'PROTOCOL_SHAPE', 'CAP_OVERFLOW', 'DEADLINE', 'CLOSE'].includes(error?.code) ? error.code : 'CLOSE';
    }
    const stats = client.stats();
    if (['TRANSPORT', 'PROTOCOL_SHAPE', 'CAP_OVERFLOW', 'DEADLINE'].includes(stats.terminalFailure)) cleanupReason = stats.terminalFailure;
    receipt.counts.rpcSent = stats.rpcSent;
    receipt.counts.maxInFlight = stats.maxInFlight;
    receipt.cleanup.groupsAttempted = stats.groupsAttempted;
    receipt.cleanup.groupsAcked = stats.groupsAcked;
    receipt.cleanup.socketCloseAck = stats.socketCloseAck;
    receipt.elapsedMs = Math.max(0, performance.now() - (config.deadline - 10000));
    receipt.cleanup.overrunMs = Math.max(0, performance.now() - config.deadline);
    if (stats.rpcSent > (node ? CAPS.nodeRequests : CAPS.electronRequests) || stats.maxInFlight > CAPS.inFlight) cleanupReason ??= 'CAP_OVERFLOW';
    if (receipt.cleanup.overrunMs > 0) cleanupReason ??= 'DEADLINE';
    // A transport-tainted rejection cannot qualify as its expected causal negative.
    if (cleanupReason !== null && (receipt.outcome === 'PASS' || ['TRANSPORT', 'PROTOCOL_SHAPE', 'CAP_OVERFLOW', 'DEADLINE'].includes(stats.terminalFailure))) { receipt.outcome = 'FAIL'; receipt.reason = cleanupReason; receipt.stage = 'CLEANUP'; }
  }
  return receipt;
}
