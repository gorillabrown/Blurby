# CPU A1 dependency preparation ruling

Source: actual final response read from Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19d8a-4701-74e2-9867-d57cf1e1cd00`,2026-11-02. Preserved verbatim; execution requires a separate parent admission.

**Ruling R-2026-11-02-CPU-5: the reported preparation satisfies CPU-4’s competing-writer requirement for the reserved A1 lane. Separate dependency preparation is technically permitted, with the constraints below. No clock starts from this ruling.**

**Claude Desktop’s presence alone is not a conflicting writer.** Its unavailable internal task inventory does not block this newly created, exclusively reserved worktree when there is no observed overlapping writer or workload. Do not close Claude, resume historical jobs or claim their checkpoints reconciled. Recheck the reserved worktree and active workload immediately before preparation; an actual conflict requires STOP.

I accept the parent’s readback of preparation receipt SHA256 `ef77d8d885d9ce827be1c88d6624a9f2c1d524afaa5eca57d2d1c8e49f331bd1` as the reported evidence. My follow-up remote read failed because the host became unavailable; **I have not independently read that final receipt**.

**Approve dependency preparation as a separate, source-support wave**, prospectively **≤30 minutes / ≤20 tool uses**, ending with a receipt and STOP. CPU-3’s A1–A4 caps remain unchanged. The proposed 5–15 minutes remains an unmeasured estimate.

The allowed destination is exclusively:

`C:\Projects\wt-narrate-cpu-profile-1-a1`

Do not reuse or link the unqualified dependency tree from another checkout.

**Narrow the install procedure as follows:**

1. Verify the exact source HEAD, clean tracked state, package/lock hashes, effective npm configuration and Node/npm identities. No global configuration change.
2. If the complete dependency lifecycle inventory cannot be inspected beforehand, begin with **`npm ci --ignore-scripts --no-audit --no-fund`**. This downloads/unpacks the locked dependencies without authorizing their lifecycle scripts.
3. Inspect the installed packages’ applicable lifecycle scripts and their called code. Before enabling scripts, the parent must accept a finite command/package list and its output paths. **Do not subsequently run an unrestricted `npm rebuild`.**
4. Complete only the accepted dependency lifecycle operations and the root postinstall within the same preparation cap. If review cannot finish within that cap, preserve the installed partial tree and stop; no automatic continuation or reinstall.

The root postinstall at exact `c90d9e08` is indeed `patch-package && node scripts/patch-onnxruntime.js`. The [ONNX patch script](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/scripts/patch-onnxruntime.js:101) edits the dependency’s backend file; it does not launch Blurby. That does **not** qualify every dependency lifecycle script.

For clarity, dependency installation may require a native **tool** version check, such as esbuild’s installer validation. Such execution must appear explicitly in the accepted install list. Electron download/extraction is allowed; **Electron/Blurby launch, model inference, application smoke checks, builds, tests and profiling are excluded** from this preparation wave.

Allow writes only to this worktree’s dependency tree and explicitly recorded install cache/temp/log locations. No tracked source, package, lockfile, shared checkout, owner profile or global installation changes. Preserve logs and partial outputs on failure; **no automatic retry or cleanup**.

The preparation receipt must record commands, exit codes, lifecycle inventory, resulting dependency state and unchanged tracked/package/lock hashes. Patch warnings, missing required artifacts or incomplete scripts mean **dependencies unqualified**, even if npm exits zero.

After successful preparation review, the parent may issue the separately gated **A1-only** admission. Native remains paused.

No install, mutation or executor message occurred here. Final receipt inspection and lifecycle qualification remain outstanding.
