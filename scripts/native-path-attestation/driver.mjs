import * as fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';

export const CAPABILITY = 'native-path-attestation/runtime-own-data/v1';
export const ARTIFACT_ROOT = 'C:/Projects/Blurby-artifacts/native-path-attestation-20261027';
export const TOOL_RELATIVE_ROOT = 'scripts/native-path-attestation';
export const FILES = Object.freeze([
  'README.md', 'collector.mjs', 'runtime-client.mjs', 'driver.mjs', 'static-controls.mjs',
  'fixture-entry.cjs', 'fixtures/main.cjs', 'fixtures/engine.cjs', 'fixtures/queue.cjs',
  'fixtures/foreign.cjs', 'fixtures/dummy.cjs', 'result.schema.json'
]);
export const REASONS = Object.freeze(["NONE","OWNERSHIP","ENDPOINT","IDENTITY_PID","IDENTITY_EXE","IDENTITY_VERSION","IDENTITY_ARCH","NONCE","TRANSPORT","PROTOCOL_SHAPE","CAP_OVERFLOW","DATA_DESCRIPTOR","MODULE_ROOT","MODULE_FILENAME","MODULE_LOADED","DIRECT_EDGE_MISSING","DIRECT_EDGE_AMBIGUOUS","CHILD_ARRAY_SHAPE","CHILD_SLOT_SHAPE","CHILD_DUPLICATE_IDENTITY","FUNCTION_LOCATION_MISSING","FUNCTION_LOCATION_MALFORMED","FUNCTION_LOCATION_AMBIGUOUS","FUNCTION_POSITION","FUNCTION_SCRIPT_FAMILY","PROBE_POSITION","PROBE_DATA_MISSING","SCOPE_SHAPE","SCOPE_BINDING_MISSING","SCOPE_BINDING_AMBIGUOUS","SCOPE_BINDING_OPTIMIZED","PATH_UNINITIALIZED","PATH_WRONG","PATH_ALIAS","PATH_NORMAL","REFERENCE_CHANGED","APP_PACKAGED","APP_USERDATA","EXCEPTION","STARTUP_EXHAUSTED","CONTROL_NOT_EXERCISED","DEADLINE","RELEASE","CLOSE","PROCESS_READY","PROCESS_EXIT","PROCESS_STOP","PROCESS_ABSENCE","RUNTIME_PARITY","INPUT_PIN","GRANT_INVALID","NORMAL_CHANGED","LOG_ERROR","DUMP_FOUND","OUTPUT_ROOT","STATIC_ASSERTION","HELPER","INTERNAL_ERROR"]);
export const CASE_CATALOG = Object.freeze([
  {
    "ordinal": 1,
    "caseId": "BASELINE",
    "expectedReason": "NONE",
    "nodeApplicable": true
  },
  {
    "ordinal": 2,
    "caseId": "DELAYED_INITIALIZATION",
    "expectedReason": "NONE",
    "nodeApplicable": true
  },
  {
    "ordinal": 3,
    "caseId": "MAX128",
    "expectedReason": "NONE",
    "nodeApplicable": true
  },
  {
    "ordinal": 4,
    "caseId": "FINAL_RESTORED",
    "expectedReason": "NONE",
    "nodeApplicable": true
  },
  {
    "ordinal": 5,
    "caseId": "PATH_DATA_NULL",
    "expectedReason": "PATH_UNINITIALIZED",
    "nodeApplicable": true
  },
  {
    "ordinal": 6,
    "caseId": "PATH_DATA_UNDEFINED",
    "expectedReason": "PATH_UNINITIALIZED",
    "nodeApplicable": true
  },
  {
    "ordinal": 7,
    "caseId": "PATH_DATA_MISSING",
    "expectedReason": "SCOPE_BINDING_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 8,
    "caseId": "PATH_DATA_AMBIGUOUS",
    "expectedReason": "SCOPE_BINDING_AMBIGUOUS",
    "nodeApplicable": true
  },
  {
    "ordinal": 9,
    "caseId": "PATH_DATA_WRONG",
    "expectedReason": "PATH_WRONG",
    "nodeApplicable": true
  },
  {
    "ordinal": 10,
    "caseId": "PATH_QUEUE_NULL",
    "expectedReason": "PATH_UNINITIALIZED",
    "nodeApplicable": true
  },
  {
    "ordinal": 11,
    "caseId": "PATH_QUEUE_UNDEFINED",
    "expectedReason": "PATH_UNINITIALIZED",
    "nodeApplicable": true
  },
  {
    "ordinal": 12,
    "caseId": "PATH_QUEUE_MISSING",
    "expectedReason": "SCOPE_BINDING_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 13,
    "caseId": "PATH_QUEUE_AMBIGUOUS",
    "expectedReason": "SCOPE_BINDING_AMBIGUOUS",
    "nodeApplicable": true
  },
  {
    "ordinal": 14,
    "caseId": "PATH_QUEUE_WRONG",
    "expectedReason": "PATH_WRONG",
    "nodeApplicable": true
  },
  {
    "ordinal": 15,
    "caseId": "PATH_SYNCSTATE_NULL",
    "expectedReason": "PATH_UNINITIALIZED",
    "nodeApplicable": true
  },
  {
    "ordinal": 16,
    "caseId": "PATH_SYNCSTATE_UNDEFINED",
    "expectedReason": "PATH_UNINITIALIZED",
    "nodeApplicable": true
  },
  {
    "ordinal": 17,
    "caseId": "PATH_SYNCSTATE_MISSING",
    "expectedReason": "SCOPE_BINDING_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 18,
    "caseId": "PATH_SYNCSTATE_AMBIGUOUS",
    "expectedReason": "SCOPE_BINDING_AMBIGUOUS",
    "nodeApplicable": true
  },
  {
    "ordinal": 19,
    "caseId": "PATH_SYNCSTATE_WRONG",
    "expectedReason": "PATH_WRONG",
    "nodeApplicable": true
  },
  {
    "ordinal": 20,
    "caseId": "FORBIDDEN_NORMAL_SURROGATE",
    "expectedReason": "PATH_NORMAL",
    "nodeApplicable": true
  },
  {
    "ordinal": 21,
    "caseId": "ALIAS_JUNCTION",
    "expectedReason": "PATH_ALIAS",
    "nodeApplicable": true
  },
  {
    "ordinal": 22,
    "caseId": "REPARSE_ANCESTOR",
    "expectedReason": "PATH_ALIAS",
    "nodeApplicable": true
  },
  {
    "ordinal": 23,
    "caseId": "ROOT_ABSENT",
    "expectedReason": "MODULE_ROOT",
    "nodeApplicable": true
  },
  {
    "ordinal": 24,
    "caseId": "ROOT_WRONG_FILENAME",
    "expectedReason": "MODULE_FILENAME",
    "nodeApplicable": true
  },
  {
    "ordinal": 25,
    "caseId": "ROOT_UNLOADED",
    "expectedReason": "MODULE_LOADED",
    "nodeApplicable": true
  },
  {
    "ordinal": 26,
    "caseId": "MAIN_MISSING",
    "expectedReason": "DIRECT_EDGE_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 27,
    "caseId": "MAIN_DUPLICATE_FILENAME",
    "expectedReason": "DIRECT_EDGE_AMBIGUOUS",
    "nodeApplicable": true
  },
  {
    "ordinal": 28,
    "caseId": "MAIN_WRONG_FILENAME",
    "expectedReason": "DIRECT_EDGE_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 29,
    "caseId": "MAIN_UNLOADED",
    "expectedReason": "MODULE_LOADED",
    "nodeApplicable": true
  },
  {
    "ordinal": 30,
    "caseId": "ENGINE_MISSING",
    "expectedReason": "DIRECT_EDGE_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 31,
    "caseId": "ENGINE_DUPLICATE_FILENAME",
    "expectedReason": "DIRECT_EDGE_AMBIGUOUS",
    "nodeApplicable": true
  },
  {
    "ordinal": 32,
    "caseId": "ENGINE_WRONG_FILENAME",
    "expectedReason": "DIRECT_EDGE_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 33,
    "caseId": "ENGINE_UNLOADED",
    "expectedReason": "MODULE_LOADED",
    "nodeApplicable": true
  },
  {
    "ordinal": 34,
    "caseId": "QUEUE_MISSING",
    "expectedReason": "DIRECT_EDGE_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 35,
    "caseId": "QUEUE_DUPLICATE_FILENAME",
    "expectedReason": "DIRECT_EDGE_AMBIGUOUS",
    "nodeApplicable": true
  },
  {
    "ordinal": 36,
    "caseId": "QUEUE_WRONG_FILENAME",
    "expectedReason": "DIRECT_EDGE_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 37,
    "caseId": "QUEUE_UNLOADED",
    "expectedReason": "MODULE_LOADED",
    "nodeApplicable": true
  },
  {
    "ordinal": 38,
    "caseId": "CHILD_DUPLICATE_IDENTITY",
    "expectedReason": "CHILD_DUPLICATE_IDENTITY",
    "nodeApplicable": true
  },
  {
    "ordinal": 39,
    "caseId": "CHILD_SPARSE",
    "expectedReason": "CHILD_ARRAY_SHAPE",
    "nodeApplicable": true
  },
  {
    "ordinal": 40,
    "caseId": "CHILD_SLOT_ACCESSOR",
    "expectedReason": "CHILD_SLOT_SHAPE",
    "nodeApplicable": true
  },
  {
    "ordinal": 41,
    "caseId": "CHILD_ARRAY_PROXY",
    "expectedReason": "CHILD_ARRAY_SHAPE",
    "nodeApplicable": true
  },
  {
    "ordinal": 42,
    "caseId": "CHILD_LENGTH_129",
    "expectedReason": "CHILD_ARRAY_SHAPE",
    "nodeApplicable": true
  },
  {
    "ordinal": 43,
    "caseId": "CHILD_EXTRA_NUMERIC",
    "expectedReason": "CHILD_ARRAY_SHAPE",
    "nodeApplicable": true
  },
  {
    "ordinal": 44,
    "caseId": "CHILD_PARENT_SHADOW",
    "expectedReason": "DIRECT_EDGE_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 45,
    "caseId": "DATA_PATH_ACCESSOR",
    "expectedReason": "DATA_DESCRIPTOR",
    "nodeApplicable": true
  },
  {
    "ordinal": 46,
    "caseId": "QUEUE_PATH_ACCESSOR",
    "expectedReason": "DATA_DESCRIPTOR",
    "nodeApplicable": true
  },
  {
    "ordinal": 47,
    "caseId": "ENGINE_EXPORT_ACCESSOR",
    "expectedReason": "DATA_DESCRIPTOR",
    "nodeApplicable": true
  },
  {
    "ordinal": 48,
    "caseId": "FOREIGN_initSyncEngine",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 49,
    "caseId": "FOREIGN_getSyncStatus",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 50,
    "caseId": "FOREIGN_stopAutoSync",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 51,
    "caseId": "FOREIGN_initSyncQueue",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 52,
    "caseId": "FOREIGN_getPendingOps",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 53,
    "caseId": "FOREIGN_getDeviceId",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 54,
    "caseId": "FOREIGN_getDataPath",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 55,
    "caseId": "FOREIGN_getLibrary",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 56,
    "caseId": "FOREIGN_saveHistory",
    "expectedReason": "FUNCTION_SCRIPT_FAMILY",
    "nodeApplicable": true
  },
  {
    "ordinal": 57,
    "caseId": "BOUND_WITNESS_MAIN",
    "expectedReason": "FUNCTION_LOCATION_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 58,
    "caseId": "BOUND_WITNESS_ENGINE",
    "expectedReason": "FUNCTION_LOCATION_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 59,
    "caseId": "BOUND_WITNESS_QUEUE",
    "expectedReason": "FUNCTION_LOCATION_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 60,
    "caseId": "WITNESS_REPLACED_WITH_TARGET_MAIN",
    "expectedReason": "PROBE_POSITION",
    "nodeApplicable": true
  },
  {
    "ordinal": 61,
    "caseId": "WITNESS_REPLACED_WITH_TARGET_ENGINE",
    "expectedReason": "PROBE_POSITION",
    "nodeApplicable": true
  },
  {
    "ordinal": 62,
    "caseId": "WITNESS_REPLACED_WITH_TARGET_QUEUE",
    "expectedReason": "PROBE_POSITION",
    "nodeApplicable": true
  },
  {
    "ordinal": 63,
    "caseId": "MISSING_DATA_WITNESS_MAIN",
    "expectedReason": "PROBE_DATA_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 64,
    "caseId": "MISSING_DATA_WITNESS_ENGINE",
    "expectedReason": "PROBE_DATA_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 65,
    "caseId": "MISSING_DATA_WITNESS_QUEUE",
    "expectedReason": "PROBE_DATA_MISSING",
    "nodeApplicable": true
  },
  {
    "ordinal": 66,
    "caseId": "WRONG_STATIC_POSITION_MAIN",
    "expectedReason": "FUNCTION_POSITION",
    "nodeApplicable": true
  },
  {
    "ordinal": 67,
    "caseId": "WRONG_STATIC_POSITION_ENGINE",
    "expectedReason": "FUNCTION_POSITION",
    "nodeApplicable": true
  },
  {
    "ordinal": 68,
    "caseId": "WRONG_STATIC_POSITION_QUEUE",
    "expectedReason": "FUNCTION_POSITION",
    "nodeApplicable": true
  },
  {
    "ordinal": 69,
    "caseId": "NEW_CTX_SAME_PATH",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 70,
    "caseId": "NEW_MODULE_SAME_FILENAME_ROOT",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 71,
    "caseId": "NEW_MODULE_SAME_FILENAME_MAIN",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 72,
    "caseId": "NEW_MODULE_SAME_FILENAME_ENGINE",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 73,
    "caseId": "NEW_MODULE_SAME_FILENAME_QUEUE",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 74,
    "caseId": "NEW_ARRAY_SAME_CONTENTS_ROOT",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 75,
    "caseId": "NEW_ARRAY_SAME_CONTENTS_ENGINE",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 76,
    "caseId": "NEW_FUNCTION_SAME_POSITION_MAIN",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 77,
    "caseId": "NEW_FUNCTION_SAME_POSITION_ENGINE",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 78,
    "caseId": "NEW_FUNCTION_SAME_POSITION_QUEUE",
    "expectedReason": "REFERENCE_CHANGED",
    "nodeApplicable": true
  },
  {
    "ordinal": 79,
    "caseId": "CHANGE_PATH_DATA",
    "expectedReason": "PATH_WRONG",
    "nodeApplicable": true
  },
  {
    "ordinal": 80,
    "caseId": "CHANGE_PATH_QUEUE",
    "expectedReason": "PATH_WRONG",
    "nodeApplicable": true
  },
  {
    "ordinal": 81,
    "caseId": "CHANGE_PATH_SYNCSTATE",
    "expectedReason": "PATH_WRONG",
    "nodeApplicable": true
  },
  {
    "ordinal": 82,
    "caseId": "WRONG_PID",
    "expectedReason": "IDENTITY_PID",
    "nodeApplicable": true
  },
  {
    "ordinal": 83,
    "caseId": "WRONG_EXE",
    "expectedReason": "IDENTITY_EXE",
    "nodeApplicable": true
  },
  {
    "ordinal": 84,
    "caseId": "WRONG_VERSION",
    "expectedReason": "IDENTITY_VERSION",
    "nodeApplicable": true
  },
  {
    "ordinal": 85,
    "caseId": "WRONG_ARCH",
    "expectedReason": "IDENTITY_ARCH",
    "nodeApplicable": true
  },
  {
    "ordinal": 86,
    "caseId": "WRONG_NONCE",
    "expectedReason": "NONCE",
    "nodeApplicable": true
  },
  {
    "ordinal": 87,
    "caseId": "APP_EXPECT_PACKAGED_TRUE",
    "expectedReason": "APP_PACKAGED",
    "nodeApplicable": false
  },
  {
    "ordinal": 88,
    "caseId": "APP_USERDATA_WRONG",
    "expectedReason": "APP_USERDATA",
    "nodeApplicable": false
  }
].map(Object.freeze));
export const CASE_ORDER = Object.freeze([...CASE_CATALOG.filter(row => row.ordinal !== 4), CASE_CATALOG[3]]);
export const BODIES = Object.freeze([
  'function(other){"use strict";return this===other;}',
  'function(){"use strict";for(let i=0;i<arguments.length;i++){for(let j=0;j<i;j++){if(arguments[i]===arguments[j])return false;}}return true;}',
  'function(){"use strict";return {userData:this.getPath("userData"),isPackaged:this.isPackaged};}'
]);
export const METHODS = Object.freeze(['Runtime.evaluate', 'Runtime.getProperties', 'Runtime.callFunctionOn', 'Runtime.releaseObjectGroup']);
export const LIMITS = Object.freeze({
  childArray:128, descriptors:512, internalProperties:32, scopes:8, scopeDescriptors:512,
  messageBytes:2097152, collectionBytes:67108864, pathUtf16:4096, nameUtf16:128,
  versionUtf16:64, scriptIdUtf16:128, objectIdUtf16:8192, inFlight:8, attempts:3,
  rpcElectron:1268, rpcNode:1266, matrixRuns:2, fixtureRoots:4, helpers:3,
  descendantsPerRoot:16, explicitCustodyRequests:10, matrixSnapshots:2500, canarySnapshots:45
});
export const DEADLINES = Object.freeze({
  collectionMs:10000, connectionMs:1000, rpcMs:2000, fixtureAckMs:1000,
  startupBackoffMs:Object.freeze([250,500]), bootMs:5000, populationChargedWorkMs:1200000,
  matrixWallMs:2450000, fixtureShutdownAckMs:1000, fixtureExitMs:3000, forcedStopMs:2000,
  absenceMs:5000, helperExitMs:2000, custodySnapshotIntervalMs:1000, custodyAckMs:1000,
  custodyAbsencePollMs:100, survivalMs:25000, observationEndMs:35000, canaryLifecycleMs:45000,
  metadataFinalizationMs:10000
});
export const REQUEST_SCHEDULE = Object.freeze({
  perSnapshot:Object.freeze({process:1,modules:4,childArrays:2,childModules:256,exports:2,
    targetMetadata:9,scopeLists:3,eligibleScopes:24,ctx:1,evaluate:1,versions:1}),
  perS0Probes:9,maxS0Attempts:3,s1Snapshots:1,releases:3,comparisonsElectron:17,
  comparisonsNode:16,tuples:4,appCallsElectron:1,appCallsNode:0,
  maxElectron:1268,maxNode:1266,oneAttemptMax128Electron:640,oneAttemptMax128Node:638
});
export const SOURCE_PINS = Object.freeze([
  Object.freeze({relativePath:'main.js',size:28993,sha256:'ae989d990786c87a0ced9ded8dd78c4f8f01776a5963bf8113e5e4386a227f8f'}),
  Object.freeze({relativePath:'main/sync-engine.js',size:42549,sha256:'50f28caf027b02eb4d9a4f07bd1d008ef472c65b59d653ad9109def0fb9020a3'}),
  Object.freeze({relativePath:'main/sync-queue.js',size:7009,sha256:'4837b6408eabfa4d34e009fc047655704f0b5c3813d860186542d260b87eabbd'})
]);
export const RUNTIME_PINS = Object.freeze({
  node:Object.freeze({executableCanonical:'C:/Program Files/nodejs/node.exe',sha256:'8c5fd45a4a1fd3cc4a6f07da8803b05194108906cb6fb7d962448a12582a5922',version:'24.14.0'}),
  electron:Object.freeze({sourceRoot:'C:/Projects/Blurby/.worktrees/foliate-display-lifetime-20261027/node_modules/electron/dist',destinationRoot:ARTIFACT_ROOT+'/runtime/electron-42.11.18-arm64',sha256:'a0563a17240cf1c2395ae723003d0132e9e8ff8f03262725d0f2dea36f903543',version:'42.11.18'}),
  canary:Object.freeze({executableCanonical:'C:/Projects/Blurby/.worktrees/foliate-display-lifetime-20261027/release/win-arm64-unpacked/Blurby.exe',sha256:'be49c8899ad3f476f70f1a7981e88cfa3bd78989f1363653d8015029a841a3d4',asarSha256:'b59071afd7816764b3132e3e959fa5b659cfc80b42d635572b2ce60b4adc2932',source:'e1c1c11ceac16e8cba808714172420942e8801fa',heldTip:'2df0f920a7963f8fa81ff2e68eeef352e4d8a418'}),
  distribution:Object.freeze([
    Object.freeze({path:'icudtl.dat',sha256:'bd8c145abdf3f8383276ce01dfa4ae48709bef9fef1c0711eb7c3fab4f6eb7c2'}),
    Object.freeze({path:'v8_context_snapshot.bin',sha256:'158cecc4f1d231b2548e2805fd435ae1efadc42171faa3b5ce00514a84d7fe8a'}),
    Object.freeze({path:'snapshot_blob.bin',sha256:'527443e39fcac50b4784283bc4be91b07394bbf154535584ce830cb824653d80'}),
    Object.freeze({path:'resources/default_app.asar',size:110862,sha256:'0eb2491b0a9ac94790389d39c09dd5005c6c1f0665842943829bbd0193f6cc4f'})
  ])
});
export const COMMAND_INTERFACES = Object.freeze({
  freeze:Object.freeze(['--input','--out']),
  'static-controls':Object.freeze(['--manifest','--inputs','--report']),
  'prepare-runtime':Object.freeze(['--admission','--inputs']),
  matrix:Object.freeze(['--admission','--inputs','--out']),
  canary:Object.freeze(['--admission','--inputs','--qualification','--out'])
});
export const PROBE_POLICY = Object.freeze({
  policies:Object.freeze(['D','F','P','B']),
  offsets:Object.freeze({D:'first async/function token',F:'function token',P:'parameter-opening parenthesis',B:'body-opening brace'}),
  sourceAlgorithm:'Strict UTF8, no BOM/NUL; tokenize declarations outside comments/strings/templates/regex; preserve original bytes and UTF16 offsets; zero-based LF line and offset-minus-one-minus-previous-LF column; all selected tokens after source line0.',
  qualification:'Exactly one policy must match every independent probe before target positions are accepted; targets are never position oracles.',
  fixtureProbes:Object.freeze(['probeSync','probeAsync','probeMultiline']),
  nativeProbes:Object.freeze({main:Object.freeze(['getSettingsPath','backupFile','recordReadingSession']),engine:Object.freeze(['sha256','setSyncStatus','loadSyncState']),queue:Object.freeze(['generateDeviceId','loadQueue','saveQueue'])}),
  probeBlock:'function probeSync(value) { return value; }\nasync function probeAsync(value) { return value; }\nfunction probeMultiline(\n  value\n) {\n  return value;\n}\n'
});

export const CUSTODY_PROGRAM = String.raw`
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$script:sequence = 0L
$script:explicit = 0
$script:periodic = 0
$script:records = @{}
$script:roots = @{}
$script:stage = $env:NPA_CUSTODY_STAGE
function Fail([string]$reason) { throw $reason }
function Exact($value,[string[]]$expected) {
  if ($null -eq $value -or $value -isnot [System.Collections.IDictionary]) { Fail 'SHAPE' }
  $names = @($value.Keys)
  if ($names.Count -ne $expected.Count) { Fail 'SHAPE' }
  foreach ($name in $names) { if ($expected -cnotcontains $name) { Fail 'SHAPE' } }
}
# A key-stack scan runs before ConvertFrom-Json, which otherwise discards duplicate keys.
function Parse([string]$text) {
  if ($text.Length -gt 2097152 -or $text.Length -eq 0 -or [int]$text[0] -eq 65279) { Fail 'SHAPE' }
  $stack = [System.Collections.Generic.List[object]]::new()
  $i = 0
  while ($i -lt $text.Length) {
    $ch = $text[$i]
    if ($ch -eq '{') { $stack.Add([System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)); $i++; continue }
    if ($ch -eq '[') { $stack.Add($null); $i++; continue }
    if ($ch -eq '}' -or $ch -eq ']') { if ($stack.Count -eq 0) { Fail 'SHAPE' }; $stack.RemoveAt($stack.Count-1); $i++; continue }
    if ($ch -eq '"') {
      $start = $i
      $i++
      $ended = $false
      while ($i -lt $text.Length) {
        if ([int]$text[$i] -lt 32) { Fail 'SHAPE' }
        if ($text[$i] -eq '\') { $i += 2; continue }
        if ($text[$i] -eq '"') { $i++; $ended = $true; break }
        $i++
      }
      if (-not $ended) { Fail 'SHAPE' }
      $token = $text.Substring($start,$i-$start)
      $j = $i
      while ($j -lt $text.Length -and [char]::IsWhiteSpace($text[$j])) { $j++ }
      if ($j -lt $text.Length -and $text[$j] -eq ':') {
        if ($stack.Count -eq 0 -or $null -eq $stack[$stack.Count-1]) { Fail 'SHAPE' }
        $key = ConvertFrom-Json -InputObject $token
        if (-not $stack[$stack.Count-1].Add([string]$key)) { Fail 'SHAPE' }
      }
      continue
    }
    $i++
  }
  if ($stack.Count -ne 0) { Fail 'SHAPE' }
  $raw = ConvertFrom-Json -InputObject $text
  function Plain($v) {
    if ($null -eq $v) { return $null }
    if ($v -is [System.Management.Automation.PSCustomObject]) {
      $h = [ordered]@{}
      foreach ($p in $v.PSObject.Properties) { $h[$p.Name] = Plain $p.Value }
      return $h
    }
    if ($v -is [array]) { return ,@($v | ForEach-Object { Plain $_ }) }
    return $v
  }
  return Plain $raw
}
function Hash([string]$file) {
  $stream = [IO.File]::OpenRead($file)
  $hash = [Security.Cryptography.SHA256]::Create()
  try { return ([BitConverter]::ToString($hash.ComputeHash($stream))).Replace('-','').ToLowerInvariant() }
  finally { $hash.Dispose(); $stream.Dispose() }
}
function Canonical([string]$file) {
  if ($file -notmatch '^[A-Za-z]:[\\/]' -or $file -match '[\\/]\.\.?([\\/]|$)' -or $file -match '[. ]([\\/]|$)' -or $file -match '~[0-9]') { Fail 'OWNERSHIP' }
  $full = [IO.Path]::GetFullPath($file)
  $cursor = $full
  while ($cursor) {
    $item = Get-Item -LiteralPath $cursor -Force
    if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { Fail 'OWNERSHIP' }
    $parent = [IO.Path]::GetDirectoryName($cursor)
    if ($parent -eq $cursor) { break }
    $cursor = $parent
  }
  return $full.Replace('\','/')
}
$configPath = Canonical $env:NPA_CUSTODY_CONFIG
if ((Hash $configPath) -cne $env:NPA_CUSTODY_CONFIG_SHA256) { Fail 'CONFIG' }
$config = Parse ([IO.File]::ReadAllText($configPath,[Text.UTF8Encoding]::new($false,$true)))
Exact $config @('protocol','runNonce','allowedExecutables','allowedArtifactRoots','maxDescendantsPerRoot','maxPeriodicSnapshots','maxExplicitRequests')
if ($config.protocol -cne 'npa.custody.v1' -or $config.runNonce -cnotmatch '^[0-9a-f]{32}$' -or
    $config.maxDescendantsPerRoot -ne 16 -or $config.maxPeriodicSnapshots -ne 2500 -or $config.maxExplicitRequests -ne 10 -or
    @('matrix','canary') -cnotcontains $script:stage) { Fail 'CONFIG' }
$script:snapshotCap = 2500
if ($script:stage -ceq 'canary') { $script:snapshotCap = 45 }
$script:nonce = [string]$config.runNonce
$script:allowed = @{}
foreach ($pin in $config.allowedExecutables) {
  Exact $pin @('exeCanonical','sha256')
  $exe = Canonical $pin.exeCanonical
  if ($pin.sha256 -cnotmatch '^[0-9a-f]{64}$' -or $script:allowed.ContainsKey($exe.ToUpperInvariant())) { Fail 'CONFIG' }
  $script:allowed[$exe.ToUpperInvariant()] = $pin.sha256
}
foreach ($root in $config.allowedArtifactRoots) {
  $canonical = Canonical $root
  if (-not [string]::Equals($canonical,'C:/Projects/Blurby-artifacts/native-path-attestation-20261027',[StringComparison]::OrdinalIgnoreCase) -and
      -not $canonical.StartsWith('C:/Projects/Blurby-artifacts/native-path-attestation-20261027/',[StringComparison]::OrdinalIgnoreCase)) { Fail 'CONFIG' }
}
function Refresh($record) {
  $proc = $record.process
  if ($proc.HasExited) {
    if (-not $record.exited) { $record.exitTicks = $proc.ExitTime.ToUniversalTime().Ticks; $record.exited = $true }
    return
  }
  if ($proc.Id -ne $record.pid -or $proc.StartTime.ToUniversalTime().Ticks -ne $record.startTicks) { Fail 'OWNERSHIP' }
  $exe = Canonical $proc.MainModule.FileName
  if (-not [string]::Equals($exe,$record.exe,[StringComparison]::OrdinalIgnoreCase) -or (Hash $exe) -cne $record.hash) { Fail 'OWNERSHIP' }
}
function Acquire([int]$id,[int]$parent,[int]$root,[long]$candidateTicks) {
  $proc = [Diagnostics.Process]::GetProcessById($id)
  $handle = $proc.SafeHandle
  if ($handle.IsInvalid -or $proc.HasExited) { Fail 'OWNERSHIP' }
  $ticks = $proc.StartTime.ToUniversalTime().Ticks
  if ($candidateTicks -ne 0 -and $ticks -ne $candidateTicks) { Fail 'OWNERSHIP' }
  $exe = Canonical $proc.MainModule.FileName
  $key = $exe.ToUpperInvariant()
  if (-not $script:allowed.ContainsKey($key)) { Fail 'OWNERSHIP' }
  $hash = Hash $exe
  if ($hash -cne $script:allowed[$key]) { Fail 'OWNERSHIP' }
  if ($script:records.ContainsKey($id)) {
    $old = $script:records[$id]
    if ($old.startTicks -ne $ticks) { Fail 'OWNERSHIP' }
    return $old
  }
  $record = @{pid=$id;parent=$parent;root=$root;startTicks=$ticks;exitTicks=$null;exe=$exe;hash=$hash;process=$proc;handle=$handle;exited=$false}
  $script:records[$id] = $record
  return $record
}
function Snapshot {
  foreach ($record in @($script:records.Values)) { Refresh $record }
  $candidates = @(Get-CimInstance Win32_Process -Property ProcessId,ParentProcessId,CreationDate)
  $progress = $true
  while ($progress) {
    $progress = $false
    foreach ($candidate in $candidates) {
      $id = [int]$candidate.ProcessId
      $parentId = [int]$candidate.ParentProcessId
      if ($script:records.ContainsKey($id) -or -not $script:records.ContainsKey($parentId)) { continue }
      $parent = $script:records[$parentId]
      $created = $candidate.CreationDate.ToUniversalTime().Ticks
      if ($created -lt $parent.startTicks -or ($parent.exited -and $created -gt $parent.exitTicks)) { Fail 'OWNERSHIP' }
      $record = Acquire $id $parentId $parent.root $created
      if ($record.startTicks -lt $script:roots[$parent.root].startTicks) { Fail 'OWNERSHIP' }
      $count = @($script:records.Values | Where-Object { $_.root -eq $parent.root -and $_.pid -ne $parent.root -and -not $_.exited }).Count
      if ($count -gt 16) { Fail 'CAP' }
      $progress = $true
    }
  }
}
function Identities {
  return ,@($script:records.Values | Sort-Object pid | ForEach-Object {
    [ordered]@{pid=$_.pid;parentPid=$_.parent;startUtcTicks=$_.startTicks.ToString([Globalization.CultureInfo]::InvariantCulture);
      exeCanonical=$_.exe;exeSha256=$_.hash;rootPid=$_.root;exited=[bool]$_.exited}
  })
}
function Ack($message,[string]$status,[string]$reason) {
  $response = [ordered]@{protocol='npa.custody.v1';runNonce=$script:nonce;sequence=$message.sequence;operation=$message.operation;
    status=$status;identities=(Identities);reason=$reason}
  [Console]::Out.WriteLine(($response | ConvertTo-Json -Depth 12 -Compress))
  [Console]::Out.Flush()
}
[Console]::Out.WriteLine((@{protocol='npa.custody.v1';runNonce=$script:nonce;pid=$PID;status='READY'} | ConvertTo-Json -Compress))
[Console]::Out.Flush()
while ($null -ne ($line = [Console]::In.ReadLine())) {
  $message = $null
  try {
    $message = Parse $line
    $operation = [string]$message.operation
    if ($operation -ceq 'REGISTER') { Exact $message @('protocol','runNonce','sequence','operation','ownedRoots') }
    else { Exact $message @('protocol','runNonce','sequence','operation','ownedPids') }
    if ($message.protocol -cne 'npa.custody.v1' -or $message.runNonce -cne $script:nonce -or
        $message.sequence -isnot [long] -and $message.sequence -isnot [int] -or
        $message.sequence -le $script:sequence -or $message.sequence -gt 9007199254740991) { Fail 'SHAPE' }
    if (@('REGISTER','SNAPSHOT','STOP_OWNED','ABSENCE','EXIT') -cnotcontains $operation) { Fail 'OPERATION' }
    $script:sequence = [long]$message.sequence
    if ($operation -ceq 'SNAPSHOT') {
      $script:periodic++
      if ($script:periodic -gt $script:snapshotCap) { Fail 'CAP' }
    } else {
      $script:explicit++
      if ($script:explicit -gt 10) { Fail 'CAP' }
    }
    if ($operation -ceq 'REGISTER') {
      if ($message.ownedRoots -isnot [array] -or $message.ownedRoots.Count -lt 1 -or $message.ownedRoots.Count -gt 2) { Fail 'SHAPE' }
      foreach ($root in $message.ownedRoots) {
        Exact $root @('pid','spawnBracket','exeCanonical','exeSha256')
        Exact $root.spawnBracket @('beforeUtc','afterUtc','beforeMonotonicMs','afterMonotonicMs')
        if ($root.pid -le 0 -or $root.pid -gt [int]::MaxValue) { Fail 'SHAPE' }
        $candidate = @(Get-CimInstance Win32_Process -Filter ('ProcessId = ' + [int]$root.pid) -Property ProcessId,ParentProcessId,CreationDate)
        if ($candidate.Count -ne 1) { Fail 'OWNERSHIP' }
        $owned = Acquire ([int]$root.pid) ([int]$candidate[0].ParentProcessId) ([int]$root.pid) ($candidate[0].CreationDate.ToUniversalTime().Ticks)
        $before = [DateTime]::Parse($root.spawnBracket.beforeUtc,[Globalization.CultureInfo]::InvariantCulture,[Globalization.DateTimeStyles]::RoundtripKind).ToUniversalTime().Ticks
        $after = [DateTime]::Parse($root.spawnBracket.afterUtc,[Globalization.CultureInfo]::InvariantCulture,[Globalization.DateTimeStyles]::RoundtripKind).ToUniversalTime().Ticks
        if ($after -lt $before -or $root.spawnBracket.afterMonotonicMs -lt $root.spawnBracket.beforeMonotonicMs -or
            $owned.startTicks -lt $before -or $owned.startTicks -gt $after -or
            -not [string]::Equals($owned.exe,$root.exeCanonical,[StringComparison]::OrdinalIgnoreCase) -or $owned.hash -cne $root.exeSha256) { Fail 'OWNERSHIP' }
        $script:roots[$owned.pid] = $owned
      }
    } else {
      if ($message.ownedPids -isnot [array]) { Fail 'SHAPE' }
      $expected = @($script:roots.Keys | Sort-Object)
      $actual = @($message.ownedPids | Sort-Object -Unique)
      if (($expected -join ',') -cne ($actual -join ',') -or $actual.Count -ne $message.ownedPids.Count) { Fail 'OWNERSHIP' }
    }
    if ($operation -ceq 'SNAPSHOT' -or $operation -ceq 'STOP_OWNED' -or $operation -ceq 'ABSENCE') { Snapshot }
    if ($operation -ceq 'STOP_OWNED') {
      foreach ($record in @($script:records.Values | Sort-Object startTicks -Descending)) {
        if ($record.pid -eq $record.root -or $record.exited) { continue }
        Refresh $record
        if (-not $record.exited) { $record.process.Kill() }
      }
    }
    if ($operation -ceq 'ABSENCE') {
      $clock = [Diagnostics.Stopwatch]::StartNew()
      while (@($script:records.Values | Where-Object { -not $_.exited }).Count -gt 0 -and $clock.ElapsedMilliseconds -lt 5000) {
        Start-Sleep -Milliseconds 100
        Snapshot
      }
      if (@($script:records.Values | Where-Object { -not $_.exited }).Count -gt 0) { Fail 'OWNERSHIP' }
    }
    if ($operation -ceq 'EXIT') {
      foreach ($record in @($script:records.Values)) { Refresh $record; if (-not $record.exited) { Fail 'OWNERSHIP' } }
      Ack $message 'APPLIED' 'NONE'
      foreach ($record in @($script:records.Values)) { $record.process.Dispose() }
      exit 0
    }
    Ack $message 'APPLIED' 'NONE'
  } catch {
    $reason = [string]$_.Exception.Message
    if (@('SHAPE','CONFIG','OWNERSHIP','CAP','OPERATION') -cnotcontains $reason) { $reason='OWNERSHIP' }
    if ($null -ne $message -and $message.Contains('sequence') -and $message.Contains('operation')) { Ack $message 'REJECTED' $reason }
    else { exit 4 }
  }
}
exit 4
`;


export class Hold extends Error {
  constructor(reason, exitCode=2) { super(reason); this.name='Hold'; this.reason=reason; this.exitCode=exitCode; }
}
const fail = reason => { throw new Hold(reason); };
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function plain(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
export function closed(value, keys, reason='PROTOCOL_SHAPE') {
  if (!plain(value)) fail(reason);
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const actual = Reflect.ownKeys(descriptors);
  if (actual.length !== keys.length || actual.some(key => typeof key !== 'string' || !keys.includes(key) || !Object.hasOwn(descriptors[key],'value'))) fail(reason);
  return value;
}
export function canonicalJson(value) {
  const seen = new Set();
  function sort(item) {
    if (item === null || typeof item === 'string' || typeof item === 'boolean') return item;
    if (typeof item === 'number') { if (!Number.isFinite(item)) fail('PROTOCOL_SHAPE'); return item; }
    if (typeof item !== 'object' || seen.has(item)) fail('PROTOCOL_SHAPE');
    seen.add(item);
    let result;
    if (Array.isArray(item)) {
      const own = Object.getOwnPropertyDescriptors(item);
      if (Reflect.ownKeys(own).length !== item.length+1) fail('PROTOCOL_SHAPE');
      result = [];
      for (let i=0;i<item.length;i++) {
        const descriptor=own[String(i)];
        if (!descriptor || !Object.hasOwn(descriptor,'value')) fail('PROTOCOL_SHAPE');
        result.push(sort(descriptor.value));
      }
    } else {
      if (!plain(item)) fail('PROTOCOL_SHAPE');
      const own = Object.getOwnPropertyDescriptors(item);
      result = Object.create(null);
      for (const key of Reflect.ownKeys(own).sort()) {
        if (typeof key !== 'string' || !Object.hasOwn(own[key],'value')) fail('PROTOCOL_SHAPE');
        result[key]=sort(own[key].value);
      }
    }
    seen.delete(item);
    return result;
  }
  return JSON.stringify(sort(value))+'\n';
}
export function parseArguments(argv, interfaces=COMMAND_INTERFACES) {
  if (!Array.isArray(argv) || !argv.length || !Object.hasOwn(interfaces,argv[0])) fail('GRANT_INVALID');
  const command=argv[0], allowed=interfaces[command], options=Object.create(null);
  for (let i=1;i<argv.length;i+=2) {
    const key=argv[i], value=argv[i+1];
    if (!allowed.includes(key) || Object.hasOwn(options,key) || typeof value!=='string' || !value || value.startsWith('--')) fail('GRANT_INVALID');
    options[key]=value;
  }
  if (Object.keys(options).length!==allowed.length) fail('GRANT_INVALID');
  return {command,options};
}
export function canonicalWindows(value) {
  if (typeof value!=='string' || value.length<3 || value.length>LIMITS.pathUtf16 ||
      !/^[A-Za-z]:[\\/]/u.test(value) || /[\u0000-\u001f<>:"|?*]/u.test(value.slice(2))) fail('PATH_ALIAS');
  const parts=value.slice(3).split(/[\\/]/u);
  if (parts.some(part=>!part || part==='.' || part==='..' || /[. ]$/u.test(part) || /~[0-9]/u.test(part))) fail('PATH_ALIAS');
  const normalized=path.win32.normalize(value).replaceAll('\\','/');
  if (normalized.endsWith('/')) fail('PATH_ALIAS');
  return normalized;
}
export function samePath(left,right) {
  return canonicalWindows(left).toUpperCase()===canonicalWindows(right).toUpperCase();
}
export function descendantOf(value,root) {
  const candidate=canonicalWindows(value).toUpperCase(), parent=canonicalWindows(root).toUpperCase();
  return candidate.startsWith(parent+'/');
}
async function exists(target) {
  try { await fs.lstat(target); return true; }
  catch(error) { if(error.code==='ENOENT') return false; throw error; }
}
export async function verifyPath(target,{allowMissing=false}={}) {
  // Narrow link/realpath checks do not prove FILE_ATTRIBUTE_REPARSE_POINT clear for every component.
  const canonical=canonicalWindows(target);
  const win=path.win32;
  let cursor=canonical,missing=false;
  for (;;) {
    try {
      const stat=await fs.lstat(cursor);
      if(stat.isSymbolicLink()) fail('PATH_ALIAS');
      const real=canonicalWindows(await fs.realpath(cursor));
      if(!samePath(real,cursor)) fail('PATH_ALIAS');
    } catch(error) {
      if(error.code!=='ENOENT' || !allowMissing) throw error;
      missing=true;
    }
    const parent=win.dirname(cursor).replaceAll('\\','/');
    if(parent===cursor || /^[A-Za-z]:\/$/u.test(parent)) {
      const rootStat=await fs.lstat(parent);
      if(rootStat.isSymbolicLink()) fail('PATH_ALIAS');
      break;
    }
    cursor=parent;
  }
  if(!allowMissing && missing) fail('PATH_ALIAS');
  return canonical;
}
export async function freshOutputRoot(root) {
  const canonical=canonicalWindows(root);
  if(!descendantOf(canonical,ARTIFACT_ROOT)) fail('OUTPUT_ROOT');
  await verifyPath(path.win32.dirname(canonical).replaceAll('\\','/'));
  if(await exists(canonical)) fail('OUTPUT_ROOT');
  await fs.mkdir(canonical,{recursive:false});
  return verifyPath(canonical);
}
export async function publishBytes(destination,bytes) {
  const canonical=canonicalWindows(destination);
  if(!descendantOf(canonical,ARTIFACT_ROOT)) fail('OUTPUT_ROOT');
  const parent=path.win32.dirname(canonical).replaceAll('\\','/');
  await verifyPath(parent);
  if(await exists(canonical)) fail('OUTPUT_ROOT');
  const temporary=canonical+'.pending-'+randomBytes(16).toString('hex');
  const handle=await fs.open(temporary,'wx');
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally { await handle.close(); }
  if(await exists(canonical)) fail('OUTPUT_ROOT');
  await fs.rename(temporary,canonical);
  const stored=await fs.readFile(canonical);
  if(!stored.equals(Buffer.from(bytes))) fail('INPUT_PIN');
  return sha256(stored);
}
export async function readJson(file) {
  await verifyPath(file);
  const bytes=await fs.readFile(file);
  if(bytes.length>LIMITS.messageBytes || bytes[0]===0xef&&bytes[1]===0xbb&&bytes[2]===0xbf) fail('PROTOCOL_SHAPE');
  let text;
  try { text=new TextDecoder('utf-8',{fatal:true}).decode(bytes); }
  catch { fail('PROTOCOL_SHAPE'); }
  const {parseClosedJson}=await import('./runtime-client.mjs');
  const value=parseClosedJson(text);
  return {bytes,value,sha256:sha256(bytes)};
}
export async function hashFile(file) {
  await verifyPath(file);
  const bytes=await fs.readFile(file);
  return {size:bytes.length,sha256:sha256(bytes)};
}
export async function verifyPe(file,expectedSha256) {
  const bytes=await fs.readFile(await verifyPath(file));
  if(sha256(bytes)!==expectedSha256 || bytes.length<64 || bytes.readUInt16LE(0)!==0x5a4d) fail('INPUT_PIN');
  const offset=bytes.readUInt32LE(0x3c);
  if(offset>bytes.length-24 || bytes.readUInt32LE(offset)!==0x00004550 || bytes.readUInt16LE(offset+4)!==0xaa64) fail('IDENTITY_ARCH');
  return expectedSha256;
}
export async function directoryManifest(root) {
  await verifyPath(root);
  const records=[];
  async function walk(relative) {
    const directory=relative?path.win32.join(root,relative):root;
    const entries=await fs.readdir(directory,{withFileTypes:true});
    entries.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);
    for(const entry of entries) {
      const name=relative?relative+'/'+entry.name:entry.name;
      const full=path.win32.join(root,name);
      if(entry.isSymbolicLink()) fail('PATH_ALIAS');
      await verifyPath(full);
      if(entry.isDirectory()) await walk(name);
      else if(entry.isFile()) records.push({path:name,...await hashFile(full)});
      else fail('INPUT_PIN');
    }
  }
  await walk('');
  return records;
}
export async function appendBudget(journal,record) {
  if(!descendantOf(journal,ARTIFACT_ROOT)) fail('OUTPUT_ROOT');
  await verifyPath(path.win32.dirname(journal).replaceAll('\\','/'));
  if(await exists(journal)) await verifyPath(journal);
  const line=canonicalJson(record).replaceAll('\n','')+'\n';
  const handle=await fs.open(journal,'a+');
  try {
    const before=await handle.stat({bigint:true});
    await handle.writeFile(line,'utf8');
    await handle.sync();
    const bytes=await fs.readFile(journal);
    if(BigInt(bytes.length)!==before.size+BigInt(Buffer.byteLength(line)) || !bytes.subarray(Number(before.size)).equals(Buffer.from(line))) fail('GRANT_INVALID');
  } finally { await handle.close(); }
}

export function validateResultSchema(value,schema) {
  function check(data,rule) {
    if(rule===true) return true;
    if(rule===false) return false;
    if(rule.$ref) return check(data,schema.$defs[rule.$ref.slice('#/$defs/'.length)]);
    if(rule.const!==undefined && canonicalJson(data)!==canonicalJson(rule.const)) return false;
    if(rule.enum && !rule.enum.some(item=>canonicalJson(data)===canonicalJson(item))) return false;
    if(rule.type) {
      const valid={null:data===null,object:plain(data),array:Array.isArray(data),string:typeof data==='string',boolean:typeof data==='boolean',number:typeof data==='number'&&Number.isFinite(data),integer:Number.isSafeInteger(data)};
      if(!valid[rule.type]) return false;
    }
    if(typeof data==='number') {
      if(rule.minimum!==undefined&&data<rule.minimum || rule.maximum!==undefined&&data>rule.maximum) return false;
    }
    if(typeof data==='string') {
      const length=[...data].length;
      if(rule.minLength!==undefined&&length<rule.minLength || rule.maxLength!==undefined&&length>rule.maxLength) return false;
      if(rule.pattern && !new RegExp(rule.pattern,'u').test(data)) return false;
      if(rule.format==='date-time' && !Number.isFinite(Date.parse(data))) return false;
    }
    if(plain(data)) {
      if(rule.required?.some(key=>!Object.hasOwn(data,key))) return false;
      if(rule.additionalProperties===false && Object.keys(data).some(key=>!Object.hasOwn(rule.properties??{},key))) return false;
      for(const [key,child] of Object.entries(rule.properties??{})) if(Object.hasOwn(data,key)&&!check(data[key],child)) return false;
    }
    if(Array.isArray(data)) {
      if(rule.minItems!==undefined&&data.length<rule.minItems || rule.maxItems!==undefined&&data.length>rule.maxItems) return false;
      const prefix=rule.prefixItems??[];
      for(let i=0;i<data.length;i++) {
        if(i<prefix.length) { if(!check(data[i],prefix[i])) return false; }
        else if(rule.items!==undefined&&!check(data[i],rule.items)) return false;
      }
    }
    if(rule.not&&check(data,rule.not)) return false;
    if(rule.allOf&&!rule.allOf.every(branch=>check(data,branch))) return false;
    if(rule.anyOf&&!rule.anyOf.some(branch=>check(data,branch))) return false;
    if(rule.oneOf&&rule.oneOf.filter(branch=>check(data,branch)).length!==1) return false;
    if(rule.if) {
      const branch=check(data,rule.if)?rule.then:rule.else;
      if(branch&&!check(data,branch)) return false;
    }
    return true;
  }
  return check(value,schema);
}
export async function writeResult(destination,result) {
  const schema=await readJson(path.join(path.dirname(fileURLToPath(import.meta.url)),'result.schema.json'));
  if(!validateResultSchema(result,schema.value)) fail('PROTOCOL_SHAPE');
  if(result.cleanup.groupsAcked>result.cleanup.groupsAttempted) fail('PROTOCOL_SHAPE');
  if(result.kind==='collection'&&result.spawnBracket && (
    result.spawnBracket.afterMonotonicMs<result.spawnBracket.beforeMonotonicMs ||
    Date.parse(result.spawnBracket.afterUtc)<Date.parse(result.spawnBracket.beforeUtc))) fail('PROTOCOL_SHAPE');
  if(result.kind==='static'&&result.namedCases.some(row=>row.assertionsPassed>row.assertionsExpected || row.outcome==='PASS'&&row.assertionsPassed!==row.assertionsExpected)) fail('STATIC_ASSERTION');
  return publishBytes(destination,Buffer.from(canonicalJson(result),'utf8'));
}
function equalJson(left,right) { return canonicalJson(left)===canonicalJson(right); }
export async function verifyBundle(manifestPath) {
  const document=await readJson(manifestPath), manifest=document.value;
  closed(manifest,['schemaVersion','capability','files','methods','bodies','caps','deadlines','caseCatalog','probePolicy','commandInterfaces'],'INPUT_PIN');
  if(manifest.schemaVersion!=='npa.bundle.v1' || manifest.capability!==CAPABILITY ||
    !equalJson(manifest.methods,METHODS)||!equalJson(manifest.bodies,BODIES)||
    !equalJson(manifest.caps,LIMITS)||!equalJson(manifest.deadlines,DEADLINES)||
    !equalJson(manifest.caseCatalog,CASE_CATALOG)||!equalJson(manifest.commandInterfaces,COMMAND_INTERFACES)||
    !equalJson(manifest.probePolicy,PROBE_POLICY)||
    !Array.isArray(manifest.files)||manifest.files.length!==FILES.length) fail('INPUT_PIN');
  const root=path.dirname(manifestPath);
  for(let i=0;i<FILES.length;i++) {
    const record=closed(manifest.files[i],['path','size','sha256'],'INPUT_PIN');
    if(record.path!==FILES[i]||!Number.isSafeInteger(record.size)||record.size<0||!/^[0-9a-f]{64}$/u.test(record.sha256)) fail('INPUT_PIN');
    const actual=await hashFile(path.join(root,record.path));
    if(actual.size!==record.size||actual.sha256!==record.sha256) fail('INPUT_PIN');
  }
  const names=(await fs.readdir(root,{recursive:true,withFileTypes:true})).filter(entry=>entry.isFile())
    .map(entry=>path.relative(root,path.join(entry.parentPath,entry.name)).replaceAll('\\','/')).sort();
  if(!equalJson(names,[...FILES,'bundle-manifest.json'].sort())) fail('INPUT_PIN');
  return document;
}
export async function verifyStaticInputs({manifest,inputs}) {
  const bundle=await verifyBundle(manifest), document=await readJson(inputs), value=document.value;
  closed(value,['schemaVersion','capability','bundleManifestSha256','toolCommit','sourcePins','runtimePins','custodyPins','generatedFiles','cases','requestSchedule','modeConfigs','normalProtectionPlan'],'INPUT_PIN');
  if(value.schemaVersion!=='npa.inputs.v1'||value.capability!==CAPABILITY||value.bundleManifestSha256!==bundle.sha256||
    !/^[0-9a-f]{40}$/u.test(value.toolCommit)||!equalJson(value.cases,CASE_CATALOG)) fail('INPUT_PIN');
  const source=await readJson(value.sourcePins.manifestCanonical);
  if(source.sha256!==value.sourcePins.manifestSha256) fail('INPUT_PIN');
  if(source.value.asarSha256!==RUNTIME_PINS.canary.asarSha256||!Array.isArray(source.value.sources)) fail('INPUT_PIN');
  for(const expected of SOURCE_PINS) {
    const records=source.value.sources.filter(item=>item.path===expected.relativePath);
    if(records.length!==1||records[0].size!==expected.size||records[0].sha256!==expected.sha256) fail('INPUT_PIN');
    const file=value.sourcePins.families.find(item=>item.relativePath===expected.relativePath);
    if(!file||file.sha256!==expected.sha256) fail('INPUT_PIN');
    const actual=await hashFile(file.sourceCanonical);
    if(actual.size!==expected.size||actual.sha256!==expected.sha256) fail('INPUT_PIN');
  }
  const schedule=await readJson(value.requestSchedule.manifestCanonical);
  if(schedule.sha256!==value.requestSchedule.manifestSha256||!equalJson(schedule.value,REQUEST_SCHEDULE)) fail('INPUT_PIN');
  const subtotal=Object.values(REQUEST_SCHEDULE.perSnapshot).reduce((sum,n)=>sum+n,0);
  if(subtotal!==304||4*subtotal+27+3+17+4+1!==1268||4*subtotal+27+3+16+4!==1266) fail('STATIC_ASSERTION');
  if(!Array.isArray(value.generatedFiles)) fail('INPUT_PIN');
  for(const record of value.generatedFiles) {
    closed(record,['path','size','sha256','requireEdges'],'INPUT_PIN');
    if(typeof record.path!=='string'||record.path.startsWith('/')||record.path.split('/').some(part=>!part||part==='..'||part==='.')||
       !Array.isArray(record.requireEdges)) fail('INPUT_PIN');
    const generated=path.win32.join(path.win32.dirname(inputs),record.path);
    const actual=await hashFile(generated);
    if(actual.size!==record.size||actual.sha256!==record.sha256) fail('INPUT_PIN');
  }
  return {bundleManifestSha256:bundle.sha256,inputManifestSha256:document.sha256,
    sourceManifestSha256:source.sha256,requestScheduleSha256:schedule.sha256,toolCommit:value.toolCommit,
    inputs:value};
}
export async function runStaticControls(argv,{runPureControls,checkTokenizer,checkSourceInvariants}) {
  requireAllReparseProof();
  const {options}=parseArguments(['static',...argv],{static:['--manifest','--inputs','--report']});
  const startedUtc=new Date().toISOString(),start=performance.now();
  const pins=await verifyStaticInputs({manifest:options['--manifest'],inputs:options['--inputs']});
  const custodyConfig=await readJson(pins.inputs.custodyPins.configCanonical);
  if(custodyConfig.sha256!==pins.inputs.custodyPins.configSha256) fail('INPUT_PIN');
  const controls=runPureControls();
  checkTokenizer();
  await checkSourceInvariants();
  const tokenizer=await import('./collector.mjs');
  for(const family of pins.inputs.sourcePins.families) {
    const bytes=await fs.readFile(await verifyPath(family.sourceCanonical));
    const positions=tokenizer.derivePositions(bytes,family.positions.map(item=>item.name));
    if(positions.sha256!==family.sha256||!equalJson(positions.positions,family.positions)) fail('STATIC_ASSERTION');
  }
  const passed=controls.namedCases.length===33&&controls.forbiddenGetterCalls===0&&
    controls.namedCases.every(row=>row.outcome==='PASS'&&row.assertionsPassed===row.assertionsExpected);
  const result={
    schemaVersion:'npa.result.v1',kind:'static',runId:randomUUID(),runNonce:custodyConfig.value.runNonce,
    bundleManifestSha256:pins.bundleManifestSha256,toolCommit:pins.toolCommit,inputManifestSha256:pins.inputManifestSha256,
    startedUtc,elapsedMs:performance.now()-start,outcome:passed?'PASS':'FAIL',reason:passed?'NONE':'STATIC_ASSERTION',
    stage:passed?'COMPLETE':'PRECHECK',custody:null,
    cleanup:{groupsAttempted:0,groupsAcked:0,socketCloseAck:false,forcedStop:false,absenceProved:true,overrunMs:0},
    namedCases:controls.namedCases,forbiddenGetterCalls:controls.forbiddenGetterCalls,
    sourceManifestSha256:pins.sourceManifestSha256,requestScheduleSha256:pins.requestScheduleSha256
  };
  await writeResult(options['--report'],result);
  return passed?0:3;
}


const ADMISSION_KEYS = Object.freeze(['schemaVersion','grantId','stage','ownerThread','toolCommit',
  'bundleManifestSha256','inputManifestSha256','allowedRoots','modeSet','runNumber','maxFixtureRoots',
  'maxRuntimeDescendants','maxCustodyHelpers','custodyPins','deadlineMs','issuedUtc','expiresUtc',
  'desktopAllocation','qualificationDispositionSha256']);
const CUSTODY_PIN_KEYS = Object.freeze(['protocol','executableCanonical','executableSha256','programSha256','configCanonical','configSha256']);
export const custodyProgramSha256 = () => sha256(Buffer.from(CUSTODY_PROGRAM,'utf16le'));

export async function readAdmission(file,stage,pins) {
  const document=await readJson(file),grant=closed(document.value,ADMISSION_KEYS,'GRANT_INVALID');
  const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;
  const now=Date.now();
  if(grant.schemaVersion!=='npa.admission.v1'||grant.stage!==stage||!uuid.test(grant.grantId)||
    !uuid.test(grant.ownerThread)||grant.toolCommit!==pins.toolCommit||
    grant.bundleManifestSha256!==pins.bundleManifestSha256||grant.inputManifestSha256!==pins.inputManifestSha256||
    !Number.isFinite(Date.parse(grant.issuedUtc))||!Number.isFinite(Date.parse(grant.expiresUtc))||
    Date.parse(grant.issuedUtc)>now||Date.parse(grant.expiresUtc)<=now||Date.parse(grant.issuedUtc)>=Date.parse(grant.expiresUtc)||
    !Array.isArray(grant.allowedRoots)||new Set(grant.allowedRoots.map(canonicalWindows)).size!==grant.allowedRoots.length||
    grant.allowedRoots.some(root=>!descendantOf(root,ARTIFACT_ROOT))) fail('GRANT_INVALID');
  if(stage==='prep') {
    if(grant.maxFixtureRoots!==0||grant.maxRuntimeDescendants!==0||grant.maxCustodyHelpers!==0||
      !equalJson(grant.modeSet,[])||grant.runNumber!==null||grant.custodyPins!==null||
      grant.qualificationDispositionSha256!==null||grant.desktopAllocation!==null||
      !Number.isSafeInteger(grant.deadlineMs)||grant.deadlineMs<=0) fail('GRANT_INVALID');
  } else {
    closed(grant.custodyPins,CUSTODY_PIN_KEYS,'GRANT_INVALID');
    const frozen={...pins.inputs.custodyPins};delete frozen.maxHelpersTotal;
    if(!equalJson(grant.custodyPins,frozen)||grant.custodyPins.protocol!=='npa.custody.v1'||
      grant.custodyPins.programSha256!==custodyProgramSha256()||
      grant.maxCustodyHelpers!==1||grant.maxRuntimeDescendants!==16) fail('GRANT_INVALID');
    if(stage==='matrix') {
      if(grant.maxFixtureRoots!==2||![1,2].includes(grant.runNumber)||
        !equalJson(grant.modeSet,['node-fixture-core','electron-fixture'])||
        grant.deadlineMs!==DEADLINES.matrixWallMs||
        grant.runNumber===1&&grant.qualificationDispositionSha256!==null||
        grant.runNumber===2&&!/^[0-9a-f]{64}$/u.test(grant.qualificationDispositionSha256)) fail('GRANT_INVALID');
    } else if(stage==='canary') {
      if(grant.maxFixtureRoots!==0||grant.runNumber!==null||!equalJson(grant.modeSet,['native-package'])||
        grant.deadlineMs!==DEADLINES.canaryLifecycleMs||!grant.desktopAllocation||
        !/^[0-9a-f]{64}$/u.test(grant.qualificationDispositionSha256)) fail('GRANT_INVALID');
    } else fail('GRANT_INVALID');
  }
  return {grant,sha256:document.sha256};
}
export function admitOutput(grant,output) {
  if(!grant.allowedRoots.some(root=>samePath(root,output))) fail('GRANT_INVALID');
  return canonicalWindows(output);
}
export async function verifyDistribution(root,expected) {
  if(!Array.isArray(expected)||expected.length===0) fail('INPUT_PIN');
  const seen=new Set();
  for(const record of expected) {
    closed(record,['path','size','sha256'],'INPUT_PIN');
    if(typeof record.path!=='string'||record.path.startsWith('/')||record.path.split('/').some(part=>!part||part==='.'||part==='..')||
      seen.has(record.path)||!Number.isSafeInteger(record.size)||record.size<0||!/^[0-9a-f]{64}$/u.test(record.sha256)) fail('INPUT_PIN');
    seen.add(record.path);
  }
  const actual=await directoryManifest(root);
  if(!equalJson(actual,expected)) fail('RUNTIME_PARITY');
  return actual;
}
export async function prepareRuntime({admission,inputs,manifest}) {
  requireAllReparseProof();
  const pins=await verifyStaticInputs({manifest,inputs});
  const {grant}=await readAdmission(admission,'prep',pins);
  const source=RUNTIME_PINS.electron.sourceRoot,destination=RUNTIME_PINS.electron.destinationRoot;
  admitOutput(grant,destination);
  const expected=pins.inputs.runtimePins.electron.files;
  const before=await verifyDistribution(source,expected);
  await verifyPe(path.win32.join(source,'electron.exe'),RUNTIME_PINS.electron.sha256);
  for(const record of RUNTIME_PINS.distribution) {
    const actual=before.find(item=>item.path===record.path);
    if(!actual||actual.sha256!==record.sha256||record.size!==undefined&&record.size!==actual.size) fail('RUNTIME_PARITY');
  }
  await freshOutputRoot(destination);
  const directories=new Set();
  for(const record of before) {
    const parts=record.path.split('/');
    for(let i=1;i<parts.length;i++) directories.add(parts.slice(0,i).join('/'));
  }
  for(const relative of [...directories].sort((a,b)=>a.split('/').length-b.split('/').length||(a<b?-1:a>b?1:0))) {
    const dir=path.win32.join(destination,relative);
    if(await exists(dir)) fail('OUTPUT_ROOT');
    await fs.mkdir(dir,{recursive:false});
    await verifyPath(dir);
  }
  const deadline=performance.now()+grant.deadlineMs;
  for(const record of before) {
    if(performance.now()>=deadline) fail('DEADLINE');
    const from=await verifyPath(path.win32.join(source,record.path));
    const to=path.win32.join(destination,record.path);
    const sourceHandle=await fs.open(from,'r'),targetHandle=await fs.open(to,'wx');
    try {
      const buffer=Buffer.alloc(1024*1024);
      for(;;) {
        if(performance.now()>=deadline) fail('DEADLINE');
        const {bytesRead}=await sourceHandle.read(buffer,0,buffer.length,null);
        if(!bytesRead) break;
        let written=0;
        while(written<bytesRead) {
          const result=await targetHandle.write(buffer,written,bytesRead-written,null);
          if(result.bytesWritten<=0) fail('RUNTIME_PARITY');
          written+=result.bytesWritten;
        }
      }
      await targetHandle.sync();
    } finally { await Promise.allSettled([sourceHandle.close(),targetHandle.close()]); }
  }
  await verifyDistribution(source,before);
  await verifyDistribution(destination,before);
  await verifyPe(path.win32.join(destination,'electron.exe'),RUNTIME_PINS.electron.sha256);
  return {sourceBefore:before,sourceAfter:before,destination:before};
}
function remaining(deadline,cap,reason='DEADLINE') {
  const ms=Math.min(cap,deadline-performance.now());
  if(ms<=0) fail(reason);
  return ms;
}
async function bounded(promise,milliseconds,deadline,reason='DEADLINE') {
  const duration=remaining(deadline,milliseconds,reason);
  let timer;
  try {
    return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Hold(reason,3)),duration);})]);
  } finally { clearTimeout(timer); }
}
function sleepBounded(milliseconds,deadline) {
  if(milliseconds>deadline-performance.now()) fail('DEADLINE');
  return new Promise(resolve=>setTimeout(resolve,milliseconds));
}
export async function consumeStageBudget(grant,pins,journal,runId) {
  const {parseClosedJson}=await import('./runtime-client.mjs');
  let records=[];
  if(await exists(journal)) {
    await verifyPath(journal);
    const bytes=await fs.readFile(journal);
    const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
    if(!text.endsWith('\n')) fail('GRANT_INVALID');
    records=text.slice(0,-1).split('\n').map(line=>parseClosedJson(line));
  }
  const sums={fixtures:0,helpers:0,matrices:0,native:0};
  const grants=new Set();
  for(let i=0;i<records.length;i++) {
    const row=closed(records[i],['sequence','grantId','runId','stage','runNumber','fixtureRoots','custodyHelpers','nativeRoots','spentUtc','toolCommit','inputManifestSha256'],'GRANT_INVALID');
    if(row.sequence!==i+1||grants.has(row.grantId)||!['matrix','canary'].includes(row.stage)||
      ![0,2].includes(row.fixtureRoots)||row.custodyHelpers!==1||![0,1].includes(row.nativeRoots)||
      row.stage==='matrix'&&(row.nativeRoots!==0||row.fixtureRoots!==2||row.runNumber!==sums.matrices+1)||
      row.stage==='canary'&&(row.nativeRoots!==1||row.fixtureRoots!==0||row.runNumber!==null)) fail('GRANT_INVALID');
    grants.add(row.grantId);sums.fixtures+=row.fixtureRoots;sums.helpers+=row.custodyHelpers;
    sums.native+=row.nativeRoots;sums.matrices+=row.stage==='matrix'?1:0;
  }
  if(grants.has(grant.grantId)||grant.stage==='matrix'&&grant.runNumber!==sums.matrices+1) fail('GRANT_INVALID');
  const next={sequence:records.length+1,grantId:grant.grantId,runId,stage:grant.stage,runNumber:grant.runNumber,
    fixtureRoots:grant.stage==='matrix'?2:0,custodyHelpers:1,nativeRoots:grant.stage==='canary'?1:0,
    spentUtc:new Date().toISOString(),toolCommit:pins.toolCommit,inputManifestSha256:pins.inputManifestSha256};
  if(sums.fixtures+next.fixtureRoots>4||sums.helpers+1>3||sums.matrices+(grant.stage==='matrix'?1:0)>2||sums.native+next.nativeRoots>1) fail('GRANT_INVALID');
  await appendBudget(journal,next);
  return next;
}


export const NATIVE_POSITIONS = Object.freeze({
  main:Object.freeze([
    ['getDataPath',[40,0],[40,0],[40,20],[40,23]],
    ['getLibrary',[107,0],[107,0],[107,19],[107,22]],
    ['saveHistory',[137,0],[137,0],[137,20],[137,23]],
    ['getSettingsPath',[49,0],[49,0],[49,24],[49,27]],
    ['backupFile',[56,0],[56,6],[56,25],[56,36]],
    ['recordReadingSession',[382,0],[382,0],[382,29],[382,68]]
  ]),
  engine:Object.freeze([
    ['initSyncEngine',[977,0],[977,6],[977,29],[977,38]],
    ['getSyncStatus',[961,0],[961,0],[961,22],[961,25]],
    ['stopAutoSync',[944,0],[944,0],[944,21],[944,24]],
    ['sha256',[54,0],[54,0],[54,15],[54,22]],
    ['setSyncStatus',[58,0],[58,0],[58,22],[58,31]],
    ['loadSyncState',[65,0],[65,6],[65,28],[65,31]]
  ]),
  queue:Object.freeze([
    ['initSyncQueue',[152,0],[152,6],[152,28],[152,57]],
    ['getPendingOps',[186,0],[186,0],[186,22],[186,25]],
    ['getDeviceId',[31,0],[31,0],[31,20],[31,23]],
    ['generateDeviceId',[25,0],[25,0],[25,25],[25,28]],
    ['loadQueue',[41,0],[41,6],[41,24],[41,27]],
    ['saveQueue',[52,0],[52,6],[52,24],[52,27]]
  ])
});
const FIXTURE_TARGETS = Object.freeze({
  main:Object.freeze(['getDataPath','getLibrary','saveHistory']),
  engine:Object.freeze(['initSyncEngine','getSyncStatus','stopAutoSync']),
  queue:Object.freeze(['initSyncQueue','getPendingOps','getDeviceId'])
});
const FIXTURE_PROBES = Object.freeze(['probeSync','probeAsync','probeMultiline']);
const STATIC_SOURCE_ROOT = 'C:/Projects/Blurby-artifacts/native-spec-finalization-20261027/static-inputs';
export const FREEZE_AUTHOR_KEYS = Object.freeze(['schemaVersion','toolCommit','runNumber','systemRoot','normalDataRoot','custodyExecutableSha256']);

export async function readToolHead() {
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
  let gitdir=path.join(root,'.git');
  const initial=await fs.lstat(gitdir);
  if(initial.isFile()) {
    const marker=await fs.readFile(gitdir,'utf8');
    const match=/^gitdir: ([^\r\n]+)\r?\n?$/u.exec(marker);
    if(!match) fail('INPUT_PIN');
    gitdir=path.resolve(root,match[1]);
  } else if(!initial.isDirectory()) fail('INPUT_PIN');
  const head=(await fs.readFile(path.join(gitdir,'HEAD'),'utf8')).trim();
  if(/^[0-9a-f]{40}$/u.test(head)) return head;
  const reference=/^ref: (refs\/[A-Za-z0-9._/-]+)$/u.exec(head)?.[1];
  if(!reference||reference.split('/').some(part=>part==='.'||part==='..')) fail('INPUT_PIN');
  let common=gitdir;
  try { common=path.resolve(gitdir,(await fs.readFile(path.join(gitdir,'commondir'),'utf8')).trim()); }
  catch(error) { if(error.code!=='ENOENT') throw error; }
  for(const directory of [...new Set([gitdir,common])]) {
    try {
      const value=(await fs.readFile(path.join(directory,reference),'utf8')).trim();
      if(!/^[0-9a-f]{40}$/u.test(value)) fail('INPUT_PIN');
      return value;
    } catch(error) { if(error.code!=='ENOENT') throw error; }
  }
  const packed=await fs.readFile(path.join(common,'packed-refs'),'utf8');
  const matches=packed.split(/\r?\n/u).filter(line=>line.endsWith(' '+reference));
  if(matches.length!==1||!/^[0-9a-f]{40} /u.test(matches[0])) fail('INPUT_PIN');
  return matches[0].slice(0,40);
}
export async function readFreezeAuthor(file) {
  const {value}=await readJson(file),input=closed(value,FREEZE_AUTHOR_KEYS,'INPUT_PIN');
  if(input.schemaVersion!=='npa.freeze-author.v1'||!/^[0-9a-f]{40}$/u.test(input.toolCommit)||
    ![1,2].includes(input.runNumber)||!/^[0-9a-f]{64}$/u.test(input.custodyExecutableSha256)) fail('INPUT_PIN');
  if(input.toolCommit!==await readToolHead()) fail('INPUT_PIN');
  const systemRoot=await verifyPath(input.systemRoot);
  const admittedSystem=process.env.SystemRoot??process.env.SYSTEMROOT;
  if(!admittedSystem||!samePath(systemRoot,admittedSystem)) fail('INPUT_PIN');
  const normalRoot=canonicalWindows(input.normalDataRoot);
  if(!process.env.APPDATA||!samePath(normalRoot,path.win32.join(process.env.APPDATA,'blurby','blurby-data'))) fail('INPUT_PIN');
  const custodyExe=canonicalWindows(path.win32.join(systemRoot,'System32','WindowsPowerShell','v1.0','powershell.exe'));
  const custody=await hashFile(custodyExe);
  if(custody.sha256!==input.custodyExecutableSha256) fail('INPUT_PIN');
  return {...input,systemRoot,normalDataRoot:normalRoot,custodyExecutableCanonical:custodyExe};
}
function positionsFromRows(rows) {
  return rows.map(([name,...pairs])=>({name,...Object.fromEntries(['D','F','P','B'].map((policy,i)=>[policy,{line:pairs[i][0],column:pairs[i][1]}]))}));
}
function tokenRename(text,from,to) {
  return text.replace(new RegExp('\\b'+from+'\\b','gu'),to);
}
function fixtureVariant(source,role,variant) {
  if(variant==='baseline') return source;
  const cells={main:['_dataPath','missingDataPath'],engine:['syncStatePath','missingSyncStatePath'],queue:['queuePath','missingQueuePath']};
  if(variant==='missing') return tokenRename(source,...cells[role]);
  if(variant==='missingWitness') return tokenRename(source,'probeSync','missingProbeSync')+
    '\nfunction missingWitnessHolder(){function probeSync(value){return value;} return probeSync;}\n';
  if(variant==='ambiguous') {
    const marker='/*NPA_OUTER_BINDING*/ function holdOuter() { return null; }';
    if(source.split(marker).length!==2) fail('INPUT_PIN');
    return source.replace(marker,'let '+cells[role][0]+' = null; function holdOuter() { return '+cells[role][0]+'; }');
  }
  fail('INPUT_PIN');
}
function plannedPopulation(freezeRoot,runNumber,mode,runNonce) {
  const leaf=mode==='node-fixture-core'?'node':'electron';
  const codeRoot=freezeRoot+'/populations/run'+runNumber+'/'+leaf;
  const runtimeRoot=ARTIFACT_ROOT+'/populations/run'+runNumber+'/'+leaf;
  return {mode,codeRoot,runtimeRoot,resultRoot:ARTIFACT_ROOT+'/run'+runNumber,
    entryCanonical:codeRoot+'/fixture-entry.cjs',configCanonical:codeRoot+'/population-config.json',
    cwd:runtimeRoot+'/cwd',userData:runtimeRoot+'/user-data',dataRoot:runtimeRoot+'/user-data/blurby-data',
    roaming:runtimeRoot+'/roaming',local:runtimeRoot+'/local',home:runtimeRoot+'/home',temp:runtimeRoot+'/temp',
    controls:runtimeRoot+'/controls',runNonce};
}
function normalProtectionPlan(rootCanonical) {
  return {rootCanonical,filenames:['library.json','settings.json','sync-queue.json'],
    adjacentPolicy:'EXACT_BAK_OR_BASENAME_DOT_PREFIX',
    optionalMetadataDirectories:['Crashpad/reports','crashes'],optionalErrorLog:'error.log',
    mtimeUnit:'UNIX_EPOCH_NANOSECONDS_DECIMAL',identityFields:['dev','ino'],
    observationStage:'canary-only'};
}
export async function freeze({input,out,manifest}) {
  requireAllReparseProof();
  const author=await readFreezeAuthor(input);
  const bundle=await verifyBundle(manifest);
  const freezeRoot=canonicalWindows(out);
  const populations=['node-fixture-core','electron-fixture'].map(mode=>plannedPopulation(freezeRoot,author.runNumber,mode,''));
  const canaryRuntimeRoot=ARTIFACT_ROOT+'/populations/canary1';
  const planned=[...populations.map(pop=>pop.runtimeRoot),populations[0].resultRoot,canaryRuntimeRoot,ARTIFACT_ROOT+'/canary1'];
  if(planned.some(root=>!descendantOf(root,ARTIFACT_ROOT)||descendantOf(root,freezeRoot)||descendantOf(freezeRoot,root)||samePath(root,freezeRoot))) fail('INPUT_PIN');
  for(const root of planned) if(await exists(root)) fail('OUTPUT_ROOT');
  const {derivePositions}=await import('./collector.mjs');
  const tools=path.dirname(fileURLToPath(import.meta.url));
  const sourceManifest=await readJson(STATIC_SOURCE_ROOT+'/package-source-manifest.json');
  if(sourceManifest.value.asarSha256!==RUNTIME_PINS.canary.asarSha256) fail('INPUT_PIN');
  const staticSources=[];
  for(let i=0;i<SOURCE_PINS.length;i++) {
    const pin=SOURCE_PINS[i],role=['main','engine','queue'][i];
    const bytes=await fs.readFile(await verifyPath(STATIC_SOURCE_ROOT+'/package/'+pin.relativePath+'.txt'));
    if(bytes.length!==pin.size||sha256(bytes)!==pin.sha256) fail('INPUT_PIN');
    const table=derivePositions(bytes,NATIVE_POSITIONS[role].map(row=>row[0]));
    if(!equalJson(table.positions,positionsFromRows(NATIVE_POSITIONS[role]))) fail('INPUT_PIN');
    staticSources.push({role,pin,bytes,positions:table.positions});
  }
  const packageJsonBytes=await fs.readFile(await verifyPath(STATIC_SOURCE_ROOT+'/package/package.json.txt'));
  const packagePin=sourceManifest.value.sources.find(item=>item.path==='package.json');
  if(!packagePin||packageJsonBytes.length!==packagePin.size||sha256(packageJsonBytes)!==packagePin.sha256) fail('INPUT_PIN');
  const electronFiles=await directoryManifest(RUNTIME_PINS.electron.sourceRoot);
  const packageRoot=path.win32.dirname(RUNTIME_PINS.canary.executableCanonical).replaceAll('\\','/');
  const packageFiles=await directoryManifest(packageRoot);
  await verifyPe(RUNTIME_PINS.node.executableCanonical,RUNTIME_PINS.node.sha256);
  await verifyPe(RUNTIME_PINS.electron.sourceRoot+'/electron.exe',RUNTIME_PINS.electron.sha256);
  await verifyPe(RUNTIME_PINS.canary.executableCanonical,RUNTIME_PINS.canary.sha256);
  const asar=packageFiles.find(record=>record.path==='resources/app.asar');
  if(!asar||asar.sha256!==RUNTIME_PINS.canary.asarSha256) fail('INPUT_PIN');
  for(const pin of RUNTIME_PINS.distribution) {
    const found=electronFiles.find(record=>record.path===pin.path);
    if(!found||found.sha256!==pin.sha256||pin.size!==undefined&&found.size!==pin.size) fail('INPUT_PIN');
  }
  const templates={};
  for(const name of ['fixture-entry.cjs','fixtures/main.cjs','fixtures/engine.cjs','fixtures/queue.cjs','fixtures/foreign.cjs','fixtures/dummy.cjs']) {
    const bytes=await fs.readFile(await verifyPath(path.join(tools,name)));
    try { templates[name]=new TextDecoder('utf-8',{fatal:true}).decode(bytes); } catch { fail('INPUT_PIN'); }
  }
  const nonce=randomBytes(16).toString('hex'),generatedFiles=[];
  await freshOutputRoot(freezeRoot);
  async function mkdirRelative(relative) {
    if(!relative) return;
    const components=relative.split('/');
    for(let i=1;i<=components.length;i++) {
      const directory=freezeRoot+'/'+components.slice(0,i).join('/');
      if(!await exists(directory)) await fs.mkdir(directory,{recursive:false});
      await verifyPath(directory);
    }
  }
  async function emit(relative,bytes,requireEdges=[]) {
    if(relative.split('/').some(part=>!part||part==='.'||part==='..')) fail('INPUT_PIN');
    await mkdirRelative(path.posix.dirname(relative)==='.'?'':path.posix.dirname(relative));
    const destination=freezeRoot+'/'+relative;
    const digest=await publishBytes(destination,bytes);
    generatedFiles.push({path:relative,size:Buffer.byteLength(bytes),sha256:digest,requireEdges});
    return {manifestCanonical:destination,manifestSha256:digest};
  }
  const sourceManifestPin=await emit('static/package-source-manifest.json',sourceManifest.bytes);
  const families=[];
  for(const source of staticSources) {
    const relative='static/package/'+source.pin.relativePath+'.txt';
    await emit(relative,source.bytes);
    families.push({role:source.role,relativePath:source.pin.relativePath,sourceCanonical:freezeRoot+'/'+relative,
      sha256:source.pin.sha256,positions:source.positions});
  }
  await emit('static/package/package.json.txt',packageJsonBytes);
  const requestSchedule=await emit('request-schedule.json',Buffer.from(canonicalJson(REQUEST_SCHEDULE)));
  const modeConfigs=[];
  for(const population of populations) {
    population.runNonce=nonce;
    const relative=path.posix.relative(freezeRoot,population.codeRoot);
    const variants={},foreign={},sourceTables={};
    for(const role of ['main','engine','queue']) {
      variants[role]={};sourceTables[role]={};
      for(const variant of ['baseline','missing','ambiguous','missingWitness']) {
        const file='fixtures/'+role+(variant==='baseline'?'':'.'+variant)+'.cjs';
        const text=fixtureVariant(templates['fixtures/'+role+'.cjs'],role,variant),bytes=Buffer.from(text);
        const table=derivePositions(bytes,[...FIXTURE_TARGETS[role],...FIXTURE_PROBES]);
        const edges=role==='engine'?[population.codeRoot+'/fixtures/queue.cjs']:[];
        await emit(relative+'/'+file,bytes,edges);
        variants[role][variant]=population.codeRoot+'/'+file;
        sourceTables[role][variant]={role,relativePath:file,sha256:table.sha256,positions:table.positions};
      }
      const foreignFile='fixtures/'+role+'.foreign.cjs',bytes=Buffer.from(templates['fixtures/'+role+'.cjs']);
      await emit(relative+'/'+foreignFile,bytes,role==='engine'?[population.codeRoot+'/fixtures/queue.cjs']:[]);
      foreign[role]=population.codeRoot+'/'+foreignFile;
    }
    const rootDummies=[],engineDummies=[];
    for(const [kind,count,destinations] of [['root',113,rootDummies],['engine',127,engineDummies]]) {
      for(let i=0;i<count;i++) {
        const filename='fixtures/dummies/'+kind+'-'+String(i).padStart(3,'0')+'.cjs';
        await emit(relative+'/'+filename,Buffer.from(templates['fixtures/dummy.cjs']));
        destinations.push(population.codeRoot+'/'+filename);
      }
    }
    const fixtureConfig={protocol:'npa.ipc.v1',runNonce:nonce,mode:population.mode,userData:population.userData,
      dataRoot:population.dataRoot,forbiddenNormalRoot:population.controls+'/forbidden-normal',
      aliasRoot:population.controls+'/alias',reparseAncestorRoot:population.controls+'/reparse-ancestor',
      variants,foreign,rootDummies,engineDummies};
    const entryEdges=[...Object.values(variants).flatMap(group=>Object.values(group)),...Object.values(foreign),...rootDummies];
    await emit(relative+'/fixture-entry.cjs',Buffer.from(templates['fixture-entry.cjs']),entryEdges);
    await emit(relative+'/population-config.json',Buffer.from(canonicalJson(fixtureConfig)));
    modeConfigs.push({...population,variants,foreign,sourceTables,
      modulePaths:{root:population.entryCanonical,main:variants.main.baseline,engine:variants.engine.baseline,queue:variants.queue.baseline},
      paths:{dataCanonical:population.dataRoot,queueCanonical:population.dataRoot+'/sync-queue.json',
        syncStateCanonical:population.dataRoot+'/sync-state.json',userDataCanonical:population.userData}});
  }
  const allowedExecutables=[
    {exeCanonical:RUNTIME_PINS.node.executableCanonical,sha256:RUNTIME_PINS.node.sha256},
    {exeCanonical:RUNTIME_PINS.electron.destinationRoot+'/electron.exe',sha256:RUNTIME_PINS.electron.sha256},
    {exeCanonical:RUNTIME_PINS.canary.executableCanonical,sha256:RUNTIME_PINS.canary.sha256}
  ];
  const custodyConfig={protocol:'npa.custody.v1',runNonce:nonce,allowedExecutables,
    allowedArtifactRoots:[ARTIFACT_ROOT],maxDescendantsPerRoot:16,maxPeriodicSnapshots:2500,maxExplicitRequests:10};
  const custodyConfigPin=await emit('custody-config.json',Buffer.from(canonicalJson(custodyConfig)));
  const custodyPins={protocol:'npa.custody.v1',executableCanonical:author.custodyExecutableCanonical,
    executableSha256:author.custodyExecutableSha256,programSha256:custodyProgramSha256(),
    configCanonical:custodyConfigPin.manifestCanonical,configSha256:custodyConfigPin.manifestSha256,maxHelpersTotal:3};
  const canary={mode:'native-package',runtimeRoot:canaryRuntimeRoot,resultRoot:ARTIFACT_ROOT+'/canary1',
    cwd:canaryRuntimeRoot+'/cwd',userData:canaryRuntimeRoot+'/user-data',dataRoot:canaryRuntimeRoot+'/user-data/blurby-data',
    roaming:canaryRuntimeRoot+'/roaming',local:canaryRuntimeRoot+'/local',home:canaryRuntimeRoot+'/home',temp:canaryRuntimeRoot+'/temp',
    controls:canaryRuntimeRoot+'/controls',runNonce:nonce,
    modulePaths:{root:packageRoot+'/resources/app.asar/main.js',main:packageRoot+'/resources/app.asar/main.js',
      engine:packageRoot+'/resources/app.asar/main/sync-engine.js',queue:packageRoot+'/resources/app.asar/main/sync-queue.js'},
    sourceFamilies:families.map(({role,relativePath,sha256,positions})=>({role,relativePath,sha256,positions})),
    paths:{dataCanonical:canaryRuntimeRoot+'/user-data/blurby-data',queueCanonical:canaryRuntimeRoot+'/user-data/blurby-data/sync-queue.json',
      syncStateCanonical:canaryRuntimeRoot+'/user-data/blurby-data/sync-state.json',userDataCanonical:canaryRuntimeRoot+'/user-data'}};
  const sourcePins={...sourceManifestPin,families,packageJson:{sourceCanonical:freezeRoot+'/static/package/package.json.txt',size:packagePin.size,sha256:packagePin.sha256}};
  generatedFiles.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);
  const frozen={schemaVersion:'npa.inputs.v1',capability:CAPABILITY,bundleManifestSha256:bundle.sha256,toolCommit:author.toolCommit,
    sourcePins,runtimePins:{systemRoot:author.systemRoot,node:RUNTIME_PINS.node,
      electron:{sourceRoot:RUNTIME_PINS.electron.sourceRoot,destinationRoot:RUNTIME_PINS.electron.destinationRoot,files:electronFiles},
      package:{root:packageRoot,files:packageFiles}},custodyPins,generatedFiles,cases:CASE_CATALOG,requestSchedule,
    modeConfigs:{matrix:{runNumber:author.runNumber,resultRoot:populations[0].resultRoot,populations:modeConfigs},canary},
    normalProtectionPlan:normalProtectionPlan(author.normalDataRoot)};
  await publishBytes(freezeRoot+'/inputs.json',Buffer.from(canonicalJson(frozen)));
  return {inputManifestSha256:sha256(Buffer.from(canonicalJson(frozen))),bundleManifestSha256:bundle.sha256};
}

function requireAllReparseProof() {
  // Brain's 2026-10-27 binding ruling: no admitted authoritative per-component Windows attribute reader exists.
  throw new Hold('INPUT_PIN',2);
}

// The required host-path proof is unavailable; source imports stay pure and commands cannot publish accepted inputs.
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  process.stderr.write('HOLD INPUT_PIN PRECHECK: authoritative per-component reparse evidence is unavailable.\n');
  process.exitCode=2;
}
