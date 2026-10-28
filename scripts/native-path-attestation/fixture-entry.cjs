'use strict';
// This entry is future fixture source. Static authoring must never load it.
const fs = require('node:fs/promises');
const path = require('node:path');
const protocol = 'npa.ipc.v1';
const families = ['main', 'engine', 'queue'];
const members = {
  main: ['getDataPath', 'getLibrary', 'saveHistory'],
  engine: ['initSyncEngine', 'getSyncStatus', 'stopAutoSync'],
  queue: ['initSyncQueue', 'getPendingOps', 'getDeviceId'],
};
const pathCases = ['DATA', 'QUEUE', 'SYNCSTATE'].flatMap(cell => ['NULL', 'UNDEFINED', 'MISSING', 'AMBIGUOUS', 'WRONG'].map(kind => `PATH_${cell}_${kind}`));
const graphCases = [
  'ROOT_ABSENT', 'ROOT_WRONG_FILENAME', 'ROOT_UNLOADED',
  ...['MAIN', 'ENGINE', 'QUEUE'].flatMap(role => ['MISSING', 'DUPLICATE_FILENAME', 'WRONG_FILENAME', 'UNLOADED'].map(kind => `${role}_${kind}`)),
  'CHILD_DUPLICATE_IDENTITY', 'CHILD_SPARSE', 'CHILD_SLOT_ACCESSOR', 'CHILD_ARRAY_PROXY',
  'CHILD_LENGTH_129', 'CHILD_EXTRA_NUMERIC', 'CHILD_PARENT_SHADOW',
];
const betweenCases = [
  'NEW_CTX_SAME_PATH', ...['ROOT', 'MAIN', 'ENGINE', 'QUEUE'].map(role => `NEW_MODULE_SAME_FILENAME_${role}`),
  ...['ROOT', 'ENGINE'].map(role => `NEW_ARRAY_SAME_CONTENTS_${role}`),
  ...['MAIN', 'ENGINE', 'QUEUE'].map(role => `NEW_FUNCTION_SAME_POSITION_${role}`),
  ...['DATA', 'QUEUE', 'SYNCSTATE'].map(cell => `CHANGE_PATH_${cell}`),
];
const cases = new Set([
  'BASELINE', 'DELAYED_INITIALIZATION', 'MAX128', 'FINAL_RESTORED', ...pathCases,
  'FORBIDDEN_NORMAL_SURROGATE', 'ALIAS_JUNCTION', 'REPARSE_ANCESTOR', ...graphCases,
  'DATA_PATH_ACCESSOR', 'QUEUE_PATH_ACCESSOR', 'ENGINE_EXPORT_ACCESSOR',
  ...['engine', 'queue', 'main'].flatMap(role => members[role].map(member => `FOREIGN_${member}`)),
  ...['BOUND_WITNESS', 'WITNESS_REPLACED_WITH_TARGET', 'MISSING_DATA_WITNESS', 'WRONG_STATIC_POSITION'].flatMap(kind => ['MAIN', 'ENGINE', 'QUEUE'].map(role => `${kind}_${role}`)),
  ...betweenCases, 'WRONG_PID', 'WRONG_EXE', 'WRONG_VERSION', 'WRONG_ARCH', 'WRONG_NONCE',
  'APP_EXPECT_PACKAGED_TRUE', 'APP_USERDATA_WRONG',
]);
const commands = new Set(['RESTORE', 'SELECT_PATH_CASE', 'SELECT_GRAPH_CASE', 'FORWARD_NAMED_EXPORT', 'BIND_NAMED_WITNESS', 'REPLACE_WITNESS_WITH_TARGET', 'REPLACE_CTX_SAME_PATH', 'REPLACE_SELECTED_MODULE_SAME_FILENAME', 'REPLACE_FUNCTION_SAME_POSITION', 'CHANGE_PATH', 'ALLOW_DELAYED_INITIALIZATION', 'SHUTDOWN']);
const own = (object, name) => Object.prototype.hasOwnProperty.call(object, name);
const fail = code => { throw Object.assign(new Error(code), { code }); };
function closed(object, names) {
  if (!object || typeof object !== 'object' || Array.isArray(object)) fail('INPUT_PIN');
  const descriptors = Object.getOwnPropertyDescriptors(object);
  if (Object.keys(descriptors).length !== names.length || names.some(name => !own(descriptors, name) || !own(descriptors[name], 'value'))) fail('INPUT_PIN');
}
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value);
}
function absolute(value) {
  if (typeof value !== 'string' || !value.length || value.length > 4096 || !path.isAbsolute(value)) fail('INPUT_PIN');
}
function restoreOwnDescriptors(target, descriptors) {
  for (const key of Reflect.ownKeys(target)) if (!Object.prototype.hasOwnProperty.call(descriptors, key)) delete target[key];
  Object.defineProperties(target, descriptors);
}

async function boot() {
  if (cases.size !== 88 || typeof process.send !== 'function' || !process.connected) fail('PROCESS_READY');
  const args = process.argv.filter(arg => arg.startsWith('--npa-config='));
  if (args.length !== 1) fail('INPUT_PIN');
  const configFile = args[0].slice('--npa-config='.length);
  absolute(configFile);
  const bytes = await fs.readFile(configFile);
  if (bytes.length > 2097152 || bytes[0] === 0xef) fail('INPUT_PIN');
  const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const config = JSON.parse(text);
  if (canonical(config) + '\n' !== text) fail('INPUT_PIN');
  closed(config, ['protocol', 'runNonce', 'mode', 'userData', 'dataRoot', 'forbiddenNormalRoot', 'aliasRoot', 'reparseAncestorRoot', 'variants', 'foreign', 'rootDummies', 'engineDummies']);
  if (config.protocol !== protocol || !/^[0-9a-f]{32}$/.test(config.runNonce) || config.runNonce !== process.env.NPA_RUN_NONCE || !['node-fixture-core', 'electron-fixture'].includes(config.mode)) fail('INPUT_PIN');
  for (const key of ['userData', 'dataRoot', 'forbiddenNormalRoot', 'aliasRoot', 'reparseAncestorRoot']) absolute(config[key]);
  closed(config.variants, families); closed(config.foreign, families);
  for (const role of families) {
    closed(config.variants[role], ['baseline', 'missing', 'ambiguous', 'missingWitness']);
    for (const filename of Object.values(config.variants[role])) absolute(filename);
    absolute(config.foreign[role]);
  }
  for (const name of ['rootDummies', 'engineDummies']) {
    if (!Array.isArray(config[name]) || config[name].length > 128 || new Set(config[name]).size !== config[name].length) fail('INPUT_PIN');
    config[name].forEach(absolute);
  }
  if (config.mode === 'electron-fixture') require('electron').app.setPath('userData', config.userData);
  module.exports.fixtureConfig = config;
  // These are ordinary requires: the entry owns main+engine, engine owns queue.
  const main = require(config.variants.main.baseline);
  const engine = require(config.variants.engine.baseline);
  const queue = engine.queueModule;
  const root = module;
  const moduleFor = filename => {
    const resolved = path.resolve(filename);
    const found = require.cache[resolved];
    if (!found || found.loaded !== true || found.filename !== resolved) fail('INPUT_PIN');
    return found;
  };
  const baselineModules = { root, main: moduleFor(config.variants.main.baseline), engine: moduleFor(config.variants.engine.baseline), queue: moduleFor(config.variants.queue.baseline) };
  const rootArray = root.children, engineArray = baselineModules.engine.children;
  const baselineRootChildren = [...rootArray], baselineEngineChildren = [...engineArray];
  const variants = {}, foreign = {};
  for (const role of families) {
    variants[role] = {};
    for (const [variant, filename] of Object.entries(config.variants[role])) variants[role][variant] = require(filename);
    foreign[role] = require(config.foreign[role]);
  }
  for (const filename of config.rootDummies) require(filename);
  engine.preloadDummies();
  const maximumRootChildren = [...root.children], maximumEngineChildren = [...baselineModules.engine.children];
  if (maximumRootChildren.length !== 128 || maximumEngineChildren.length !== 128 || new Set(maximumRootChildren).size !== 128 || new Set(maximumEngineChildren).size !== 128) fail('INPUT_PIN');
  const dummies = config.rootDummies.map(moduleFor);
  if (dummies.length < 2) fail('INPUT_PIN');
  const allModules = [...new Set([root, ...Object.values(config.variants).flatMap(group => Object.values(group)).map(moduleFor), ...Object.values(config.foreign).map(moduleFor), ...dummies, ...config.engineDummies.map(moduleFor)])];
  const originals = new Map(allModules.map(item => [item, { filename: item.filename, loaded: item.loaded, exports: item.exports, children: item.children, contents: [...item.children], exportDescriptors: Object.getOwnPropertyDescriptors(item.exports) }]));
  const baselineCtx = { getDataPath: main.getDataPath, getLibrary: main.getLibrary, saveHistory: main.saveHistory };
  const baselineCtxDescriptors = Object.getOwnPropertyDescriptors(baselineCtx);
  main.setPath(config.dataRoot);
  await engine.initSyncEngine(baselineCtx);
  let active = { main, engine, queue }, activeCtx = baselineCtx;
  let sequence = 0, generation = 0, forbiddenGetterCalls = 0, selected = null, restored = false, pendingMutation = null, delayedArmed = false, delayedTimer = null;
  const forbidden = () => { forbiddenGetterCalls++; fail('DATA_DESCRIPTOR'); };
  async function restore() {
    if (forbiddenGetterCalls !== 0) fail('DATA_DESCRIPTOR');
    if (delayedTimer !== null) { clearTimeout(delayedTimer); delayedTimer = null; }
    process.mainModule = root;
    for (const [item, original] of originals) {
      item.filename = original.filename; item.loaded = original.loaded; item.exports = original.exports; item.children = original.children;
      Object.defineProperty(item.children, 'length', { value: original.contents.length, writable: true });
      for (const key of Object.keys(item.children)) delete item.children[key];
      item.children.splice(0, item.children.length, ...original.contents);
      restoreOwnDescriptors(item.exports, original.exportDescriptors);
    }
    root.children = rootArray; rootArray.splice(0, rootArray.length, ...baselineRootChildren);
    baselineModules.engine.children = engineArray; engineArray.splice(0, engineArray.length, ...baselineEngineChildren);
    for (const role of families) for (const family of Object.values(variants[role])) { family.restoreProbe(); family.setPath(role === 'main' ? config.dataRoot : path.join(config.dataRoot, role === 'engine' ? 'sync-state.json' : 'sync-queue.json')); }
    for (const role of families) { foreign[role].restoreProbe(); foreign[role].setPath(role === 'main' ? config.dataRoot : path.join(config.dataRoot, role === 'engine' ? 'sync-state.json' : 'sync-queue.json')); }
    restoreOwnDescriptors(baselineCtx, baselineCtxDescriptors);
    active = { main, engine, queue }; activeCtx = baselineCtx;
    engine.setContext(baselineCtx);
    selected = null; pendingMutation = null; delayedArmed = false; restored = true;
  }
  function chooseVariant(role, variant) {
    const replacement = moduleFor(config.variants[role][variant]);
    if (role === 'queue') engineArray.splice(engineArray.indexOf(baselineModules.queue), 1, replacement);
    else rootArray.splice(rootArray.indexOf(baselineModules[role]), 1, replacement);
    active[role] = replacement.exports;
    activeCtx = { getDataPath: active.main.getDataPath, getLibrary: active.main.getLibrary, saveHistory: active.main.saveHistory };
    active.engine.setContext(activeCtx);
    active.engine.setPath(path.join(config.dataRoot, 'sync-state.json'));
    active.queue.setPath(path.join(config.dataRoot, 'sync-queue.json'));
  }
  function setCell(cell, value) { active[cell === 'DATA' ? 'main' : cell === 'QUEUE' ? 'queue' : 'engine'].setPath(value); }
  function replaceModule(role) {
    const original = role === 'root' ? root : baselineModules[role], replacement = dummies[0];
    replacement.filename = original.filename; replacement.loaded = true; replacement.children = original.children; replacement.exports = original.exports;
    if (role === 'root') process.mainModule = replacement;
    else {
      const array = role === 'queue' ? engineArray : rootArray;
      array.splice(array.indexOf(original), 1, replacement);
    }
  }
  function graphCase(caseId) {
    if (caseId === 'ROOT_ABSENT') { process.mainModule = undefined; return; }
    const match = /^(ROOT|MAIN|ENGINE|QUEUE)_(MISSING|DUPLICATE_FILENAME|WRONG_FILENAME|UNLOADED)$/.exec(caseId);
    if (match) {
      const role = match[1].toLowerCase(), target = baselineModules[role];
      const array = role === 'queue' ? engineArray : rootArray;
      if (match[2] === 'MISSING') array.splice(array.indexOf(target), 1);
      if (match[2] === 'DUPLICATE_FILENAME') { dummies[0].filename = target.filename; array.push(dummies[0]); }
      if (match[2] === 'WRONG_FILENAME') target.filename += '.wrong';
      if (match[2] === 'UNLOADED') target.loaded = false;
      return;
    }
    switch (caseId) {
      case 'CHILD_DUPLICATE_IDENTITY': rootArray.push(dummies[0], dummies[0]); break;
      case 'CHILD_SPARSE': rootArray.length++; break;
      case 'CHILD_SLOT_ACCESSOR': Object.defineProperty(rootArray, String(rootArray.length), { get: forbidden, configurable: true, enumerable: true }); break;
      case 'CHILD_ARRAY_PROXY': root.children = new Proxy(rootArray, {}); break;
      case 'CHILD_LENGTH_129': rootArray.length = 129; break;
      case 'CHILD_EXTRA_NUMERIC': Object.defineProperty(rootArray, '4294967295', { value: dummies[0], configurable: true, enumerable: true }); break;
      case 'CHILD_PARENT_SHADOW': rootArray.splice(rootArray.indexOf(baselineModules.engine), 1); baselineModules.main.children.push(baselineModules.engine); break;
      default: fail('INPUT_PIN');
    }
  }
  function between(caseId) {
    if (caseId === 'NEW_CTX_SAME_PATH') { active.engine.setContext({ ...activeCtx }); return; }
    if (caseId.startsWith('NEW_MODULE_SAME_FILENAME_')) { replaceModule(caseId.split('_').at(-1).toLowerCase()); return; }
    if (caseId.startsWith('NEW_ARRAY_SAME_CONTENTS_')) {
      const role = caseId.endsWith('_ROOT') ? 'root' : 'engine'; baselineModules[role].children = [...baselineModules[role].children]; return;
    }
    if (caseId.startsWith('NEW_FUNCTION_SAME_POSITION_')) {
      const role = caseId.split('_').at(-1).toLowerCase(), member = members[role][0];
      const replacement = active[role].createFamily();
      replacement.setPath(role === 'main' ? config.dataRoot : path.join(config.dataRoot, role === 'engine' ? 'sync-state.json' : 'sync-queue.json'));
      if (role === 'engine') replacement.setContext(activeCtx);
      active[role][member] = replacement[member];
      if (role === 'main') activeCtx.getDataPath = replacement.getDataPath;
      return;
    }
    if (caseId.startsWith('CHANGE_PATH_')) { setCell(caseId.split('_').at(-1), path.join(config.dataRoot, 'changed')); return; }
    fail('INPUT_PIN');
  }
  async function select(caseId, command) {
    if (!restored || selected !== null) fail('INPUT_PIN');
    selected = caseId; restored = false;
    if (betweenCases.includes(caseId)) { pendingMutation = caseId; return; }
    if (caseId === 'DELAYED_INITIALIZATION') { main.setPath(null); engine.setContext(null); engine.setPath(null); queue.setPath(null); return; }
    if (caseId === 'MAX128') { rootArray.splice(0, rootArray.length, ...maximumRootChildren); engineArray.splice(0, engineArray.length, ...maximumEngineChildren); return; }
    const cell = /^PATH_(DATA|QUEUE|SYNCSTATE)_(NULL|UNDEFINED|MISSING|AMBIGUOUS|WRONG)$/.exec(caseId);
    if (cell) {
      const role = cell[1] === 'DATA' ? 'main' : cell[1] === 'QUEUE' ? 'queue' : 'engine';
      if (cell[2] === 'MISSING' || cell[2] === 'AMBIGUOUS') chooseVariant(role, cell[2].toLowerCase());
      else setCell(cell[1], cell[2] === 'NULL' ? null : cell[2] === 'UNDEFINED' ? undefined : path.join(config.dataRoot, 'wrong'));
      return;
    }
    const pathRoot = { FORBIDDEN_NORMAL_SURROGATE: 'forbiddenNormalRoot', ALIAS_JUNCTION: 'aliasRoot', REPARSE_ANCESTOR: 'reparseAncestorRoot' }[caseId];
    if (pathRoot) { main.setPath(config[pathRoot]); return; }
    if (graphCases.includes(caseId)) { graphCase(caseId); return; }
    if (caseId.startsWith('FOREIGN_')) {
      const member = caseId.slice('FOREIGN_'.length), role = families.find(candidate => members[candidate].includes(member));
      active[role][member] = foreign[role][member];
      if (role === 'main') activeCtx[member] = foreign.main[member];
      return;
    }
    if (/^(BOUND_WITNESS|WITNESS_REPLACED_WITH_TARGET)_/.test(caseId)) {
      const role = caseId.split('_').at(-1).toLowerCase(); active[role].setProbe(caseId.startsWith('BOUND_') ? 'bound' : 'target'); return;
    }
    if (caseId.startsWith('MISSING_DATA_WITNESS_')) { chooseVariant(caseId.split('_').at(-1).toLowerCase(), 'missingWitness'); return; }
    // These cases change frozen expected inputs in the host, never observed fields.
    if (caseId.startsWith('WRONG_STATIC_POSITION_') || caseId.startsWith('WRONG_') || caseId.startsWith('APP_') || ['BASELINE', 'FINAL_RESTORED'].includes(caseId)) return;
    const accessorTarget = {
      DATA_PATH_ACCESSOR: [activeCtx, 'getDataPath'],
      QUEUE_PATH_ACCESSOR: [active.queue, 'initSyncQueue'],
      ENGINE_EXPORT_ACCESSOR: [active.engine, 'initSyncEngine'],
    }[caseId];
    if (accessorTarget) {
      const [target, member] = accessorTarget;
      const original = Object.getOwnPropertyDescriptor(target, member);
      if (!original || !own(original, 'value')) fail('INPUT_PIN');
      Object.defineProperty(target, member, { get: forbidden, enumerable: original.enumerable, configurable: true });
      return;
    }
    fail('INPUT_PIN');
  }
  function selectionCommand(caseId) {
    if (caseId.startsWith('PATH_') || ['FORBIDDEN_NORMAL_SURROGATE', 'ALIAS_JUNCTION', 'REPARSE_ANCESTOR'].includes(caseId)) return 'SELECT_PATH_CASE';
    if (caseId.startsWith('FOREIGN_')) return 'FORWARD_NAMED_EXPORT';
    if (caseId.startsWith('BOUND_WITNESS_')) return 'BIND_NAMED_WITNESS';
    if (caseId.startsWith('WITNESS_REPLACED_WITH_TARGET_')) return 'REPLACE_WITNESS_WITH_TARGET';
    return 'SELECT_GRAPH_CASE';
  }
  function mutationCommand(caseId) {
    if (caseId === 'NEW_CTX_SAME_PATH') return 'REPLACE_CTX_SAME_PATH';
    if (caseId.startsWith('NEW_MODULE_')) return 'REPLACE_SELECTED_MODULE_SAME_FILENAME';
    if (caseId.startsWith('NEW_FUNCTION_')) return 'REPLACE_FUNCTION_SAME_POSITION';
    if (caseId.startsWith('CHANGE_PATH_')) return 'CHANGE_PATH';
    return 'SELECT_GRAPH_CASE';
  }
  async function command(message) {
    try { closed(message, ['protocol', 'runNonce', 'pid', 'sequence', 'command', 'caseId']); }
    catch { return; }
    if (message.protocol !== protocol || message.runNonce !== config.runNonce || message.pid !== process.pid || !Number.isSafeInteger(message.sequence) || message.sequence <= sequence || !commands.has(message.command) || !cases.has(message.caseId)) return;
    if (message.command !== 'RESTORE' && message.command !== 'SHUTDOWN' && message.command !== 'ALLOW_DELAYED_INITIALIZATION' && (selected === null ? message.command !== selectionCommand(message.caseId) : pendingMutation !== message.caseId || message.command !== mutationCommand(message.caseId))) return;
    if (message.command === 'ALLOW_DELAYED_INITIALIZATION' && (selected !== 'DELAYED_INITIALIZATION' || message.caseId !== selected || delayedArmed)) return;
    if (forbiddenGetterCalls !== 0) fail('DATA_DESCRIPTOR');
    sequence = message.sequence;
    if (message.command === 'RESTORE') await restore();
    else if (message.command === 'SHUTDOWN') {
      if (delayedTimer !== null) clearTimeout(delayedTimer);
    } else if (message.command === 'ALLOW_DELAYED_INITIALIZATION') {
      delayedArmed = true;
      delayedTimer = setTimeout(() => {
        delayedTimer = null; main.setPath(config.dataRoot);
        engine.initSyncEngine(baselineCtx).catch(() => { process.exitCode = 1; process.disconnect(); });
      }, 250);
    } else if (pendingMutation === message.caseId) { between(message.caseId); pendingMutation = null; }
    else await select(message.caseId, message.command);
    if (forbiddenGetterCalls !== 0) fail('DATA_DESCRIPTOR');
    generation++;
    await new Promise((resolve, reject) => process.send({ ...message, status: 'APPLIED', generation, forbiddenGetterCalls }, error => error ? reject(error) : resolve()));
    if (message.command === 'SHUTDOWN') {
      process.disconnect();
      if (config.mode === 'electron-fixture') require('electron').app.exit(0);
      else process.exitCode = 0;
    }
  }
  await restore();
  let stream = Promise.resolve();
  process.on('message', message => {
    stream = stream.then(() => command(message)).catch(() => { process.stderr.write('PROCESS_READY\n'); process.exitCode = 1; if (process.connected) process.disconnect(); });
  });
  process.send({ protocol, runNonce: config.runNonce, pid: process.pid, sequence: 0, status: 'READY' });
}
boot().catch(() => { process.stderr.write('PROCESS_READY\n'); process.exitCode = 1; if (process.connected) process.disconnect(); });
