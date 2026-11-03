# IC-T repair1 — exact approved test replacements

Actual complete Brain message `exec-bf634acd-bfdd-435b-af0d-916ed81d7219`, preserved as supplied; planning only. No code execution or production edit occurs here.

Exact reviewed replacement for IC-T repair1 lines147–167, approved by IC-T-REPAIR-1-20261102 (still planning only):

afterEach(async () => {
  const allowedCleanupErrors = new Set(expectedCleanupErrors);
  let cleanup = [];
  try {
    for (const gate of gates) gate.resolve();
    await Promise.all(pending);
    cleanup = await Promise.allSettled(
      controllers.map(controller =>
        Promise.resolve().then(() => controller.shutdown()))
    );
  } finally {
    try {
      vi.restoreAllMocks();
    } finally {
      try {
        if (moduleLoaded) {
          delete require.cache[modulePath];
          if (originalModuleRecord)
            require.cache[modulePath] = originalModuleRecord;
        }
      } finally {
        controllers.length = 0;
        gates.length = 0;
        pending.length = 0;
        expectedCleanupErrors.clear();
        moduleLoaded = false;
        originalModuleRecord = undefined;
      }
    }
  }
  for (const result of cleanup) {
    if (result.status === 'rejected')
      expect(allowedCleanupErrors.has(result.reason?.code)).toBe(true);
  }
});

Exact bc11 replacement tail approved, preserving preceding existing failure/ID assertions:
await rejectCode(a.open('relative', a.getGeneration()), 'INVALID_REQUEST');
io.queue.push(fakeHandle());
let next = await open(a);
expect(next.id).toBe(last + 1);
last = next.id;
const old = a.getGeneration();
await a.invalidate();
for (const token of [old, b.getGeneration(), {}]) {
  const opensBefore = io.open.mock.calls.length;
  await rejectCode(a.open(FILE, token), 'DOCUMENT_STALE');
  expect(io.open).toHaveBeenCalledTimes(opensBefore);
  io.queue.push(fakeHandle());
  next = await open(a);
  expect(next.id).toBe(last + 1);
  last = next.id;
}

Remove only admissionBefore declaration/accumulation/assertion in AST detector and add the stated static/functional scope comment; retain all guard/private/noreset/reservation-beforequeue checks. This exact technical ruling supplies the source-bound directions so CLI need not diagnose. Same full28 initial missing-module boundary and later Q behavior limits remain. New correction Ready must bind actual source40k/recorderV2/reviews/oldpartial receipt, distinct fresh evidence root, exact narrow recorder-root-only version change if needed, fixed controls and<=30m/30calls.
