'use strict';
const fixtureConfig = module.parent.exports.fixtureConfig;
module.exports.fixtureConfig = fixtureConfig;
const queueModule = require(fixtureConfig.variants.queue.baseline);
function preloadDummies() { for (const filename of fixtureConfig.engineDummies) require(filename); }
function probeSync(value) { return value; }
async function probeAsync(value) { return value; }
function probeMultiline(
  value
) {
  return value;
}
const originalProbeSync = probeSync;
/*NPA_OUTER_BINDING*/ function holdOuter() { return null; }
function createFamily() {
  let ctx = null;
  let syncStatePath = null;
  async function initSyncEngine(appCtx) {
    void [probeSync, probeAsync, probeMultiline, getSyncStatus, stopAutoSync, holdOuter];
    ctx = appCtx;
    syncStatePath = require('node:path').join(ctx.getDataPath(), 'sync-state.json');
    await queueModule.initSyncQueue(ctx.getDataPath());
  }
  function getSyncStatus() { return 'idle'; }
  function stopAutoSync() { return true; }
  function setContext(value) { ctx = value; }
  function setPath(value) { syncStatePath = value; }
  function setProbe(kind) { probeSync = kind === 'bound' ? probeSync.bind(null) : initSyncEngine; }
  function restoreProbe() { probeSync = originalProbeSync; }
  return { initSyncEngine, getSyncStatus, stopAutoSync, setContext, setPath, setProbe, restoreProbe };
}
module.exports = { fixtureConfig, queueModule, preloadDummies, createFamily, ...createFamily() };
