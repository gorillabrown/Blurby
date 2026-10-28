'use strict';
// Frozen generator marker: replace all _dataPath tokens only for the missing-cell variant.
const fixtureConfig = module.parent.exports.fixtureConfig;
const app = fixtureConfig.mode === 'electron-fixture' ? require('electron').app : null;
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
  let _dataPath = null;
  function getDataPath() {
    void [probeSync, probeAsync, probeMultiline, app, getLibrary, saveHistory, holdOuter];
    return _dataPath;
  }
  function getLibrary() { return []; }
  function saveHistory() { return true; }
  function setPath(value) { _dataPath = value; }
  function setProbe(kind) { probeSync = kind === 'bound' ? probeSync.bind(null) : getDataPath; }
  function restoreProbe() { probeSync = originalProbeSync; }
  return { getDataPath, getLibrary, saveHistory, setPath, setProbe, restoreProbe };
}
module.exports = { fixtureConfig, createFamily, ...createFamily() };
