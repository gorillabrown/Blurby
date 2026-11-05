# Actual technical planning ruling

Complete actual Brain send-message argument `exec-7b433d9e-02fb-4a36-8788-a923d0aa30a2`. Preserved verbatim; planning/scope ruling only, no new process, active allowance or helper/API execution authority.

Exact publication successor snippets approved in CPU-T-CONTROL-REPAIR1-20261102; old file remainsimmutable. Replace persist()line22:

async function persist(p,document) {
  const tmp=p+'.tmp',b=Buffer.from(JSON.stringify(document)+'\n');
  let handle=null,closeAttempted=false,primary=null;
  try {
    await absent(tmp); await absent(p);
    handle=await fs.open(tmp,'wx');
    await handle.writeFile(b); await handle.sync();
  } catch(error) { primary=error; }
  if(handle && !closeAttempted) {
    closeAttempted=true;
    try { await handle.close(); }
    catch(error) {
      if(primary)primary.secondaryCloseError=error;
      else primary=error;
    }
  }
  if(primary)throw primary;
  if(!(await fs.readFile(tmp)).equals(b))throw new Error('TEMP_RECEIPT_READBACK');
  await fs.link(tmp,p);
  if(!(await fs.readFile(p)).equals(b))throw new Error('FINAL_RECEIPT_READBACK');
  return b;
}

Replace state()line52:
async function state(p) {
  try { await fs.lstat(p); }
  catch(error) { if(error.code==='ENOENT')return {exists:false}; throw error; }
  return {exists:true,hex:(await fs.readFile(p)).toString('hex')};
}

Add immediately after expectedTrace():
function expectedStates(spec,phase,hex) {
  const absentState={exists:false};
  const bytesState={exists:true,hex};
  const emptyState={exists:true,hex:''};
  const sentinelState={exists:true,hex:Buffer.from('original-sentinel').toString('hex')};
  if(spec.kind==='existing'||spec.kind==='symlink')
    return spec.which==='temp' ? {temp:sentinelState,final:absentState} : {temp:absentState,final:sentinelState};
  if(spec.kind==='race')return {temp:bytesState,final:{exists:true,hex:Buffer.from('race-sentinel').toString('hex')}};
  if(!phase)return {temp:bytesState,final:bytesState};
  if(['VALIDATE','INSPECT_TEMP','INSPECT_FINAL','OPEN_TEMP'].includes(phase))return {temp:absentState,final:absentState};
  if(phase==='WRITE_TEMP')return {temp:emptyState,final:absentState};
  if(['SYNC_TEMP','CLOSE_TEMP','READ_TEMP','VERIFY_TEMP','LINK_FINAL'].includes(phase))return {temp:bytesState,final:absentState};
  if(['READ_FINAL','VERIFY_FINAL'].includes(phase))return {temp:bytesState,final:bytesState};
  throw new Error('UNEXPECTED_PUBLICATION_PHASE');
}

After exercise()line97 two actualstate reads:
const diskExpected=expectedStates(spec,phase,expected.toString('hex'));
detect(diskExpected,{temp:tempState,final:finalState});

At exercise()line76 add symlinkLinkText=null; immediately after existing fs.symlink(...) set symlinkLinkText=await fs.readlink(p). After disk-state equality:
if(spec.kind==='symlink') {
  const link=spec.which==='temp'?path.join(dir,'temp.bin'):path.join(dir,'final.bin');
  if(!(await fs.lstat(link)).isSymbolicLink())throw new Error('SYMLINK_ENTRY_REPLACED');
  detect(symlinkLinkText,await fs.readlink(link));
}

Inside existing if(phase) rejectionbranch line94, AFTER code/message/phase equality:
if(spec.kind==='fault' && !['VERIFY_TEMP','VERIFY_FINAL'].includes(spec.phase) && error.cause!==injection.fault)throw new Error('PRIMARY_CAUSE_LOST');

Keep all existing success/sentinel/race/target-retention/one-close/secondaryCloseError assertions, case IDs and baseline boundaries. The strongerdisk equality makes weaker oldtemp-exists check redundant but it may remain; do not delete unrelated assertions. No actual tests/Node/import/APIexecution occurred in these reviews. This is a sourceboundplanningrecipe; newphaseReady/admissionmustpin successor/V3 root/finitepaths/actualSRunrunlabels beforecode.
