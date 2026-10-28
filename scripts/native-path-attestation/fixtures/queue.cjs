'use strict';
const fixtureConfig = module.parent.exports.fixtureConfig;
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
  let queuePath = null;
  async function initSyncQueue(dataPath) {
    void [probeSync, probeAsync, probeMultiline, getPendingOps, getDeviceId, holdOuter];
    queuePath = require('node:path').join(dataPath, 'sync-queue.json');
  }
  function getPendingOps() { return []; }
  function getDeviceId() { return 'fixture-device'; }
  function setPath(value) { queuePath = value; }
  function setProbe(kind) { probeSync = kind === 'bound' ? probeSync.bind(null) : initSyncQueue; }
  function restoreProbe() { probeSync = originalProbeSync; }
  return { initSyncQueue, getPendingOps, getDeviceId, setPath, setProbe, restoreProbe };
}
module.exports = { fixtureConfig, createFamily, ...createFamily() };
