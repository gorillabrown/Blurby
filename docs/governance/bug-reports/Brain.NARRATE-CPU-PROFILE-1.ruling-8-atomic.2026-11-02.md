# CPU-8 atomic publication amendment

Source: actual final response read from owner-delegated Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19e15-df96-7dd1-8135-41eab727017f`,2026-11-02. Preserved verbatim. No execution admission.

**CPU-8 atomic-publication amendment:** **yes, atomic publication is required**, including synthetic summaries. [LL-006](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/governance/LESSONS_LEARNED.md:1767) protects persistent JSON, and [LL-097](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/governance/LESSONS_LEARNED.md:2343) expressly covers harness artifacts. Generated evidence receives no exemption.

Use **completed temporary file → exclusive hard-link publication**, instead of overwrite-capable rename. This is the bounded implementation of those atomic-write requirements while preserving CPU-8’s no-overwrite contract. Node provides asynchronous [`fsPromises.link`](https://nodejs.org/docs/latest-v24.x/api/fs.html#fspromiseslinkexistingpath-newpath); Windows hard links reference the same file and require a supported same-volume filesystem. [Microsoft’s contract](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-createhardlinkw).

**Exact algorithm**

Within the admitted, exclusively owned records directory, use these deterministic names:

```text
Temporary: cpu-profile.summary.json.tmp
Final:     cpu-profile.summary.json
```

1. If either name already exists—including a symlink—stop with `OUTPUT_WRITE_FAILED`, exit1, empty stdout. Do not remove, truncate or reuse either entry. Only `ENOENT` permits proceeding; other inspection errors stop.
2. Fully serialize the completed valid/noisy/invalid document in memory.
3. Open the temporary name with **`wx`**. Write all UTF-8 bytes, await the file handle’s **`sync()`**, then close it. Await every operation. On failure, close any owned handle and stop.
4. Read back the temporary file and require byte equality with the serialized buffer.
5. Publish with **`await fs.link(temporaryPath, finalPath)`**. This operation—not the preliminary existence check—enforces exclusive destination creation. If the destination appeared meanwhile, or hard-link creation is unsupported/refused, stop. **No rename, copy or direct-write fallback.**
6. Read back the final name and require byte equality with the same buffer. Only then print the JSON and return CPU-8’s semantic exit code.

Do not reopen either name for writing after publication. **Retain the temporary name on success and failure.** On success it is a second hard link to the completed file; editing either name would alter the same content. This grants no unlink, deletion, cleanup or retry authority.

On any write/publication/readback failure: emit `OUTPUT_WRITE_FAILED` on stderr, exit1, empty stdout; preserve every existing/new artifact and report the failure phase. A final file that exists after a failed readback is **not accepted evidence**.

This narrowly replaces CPU-8’s “write only the final file” wording with permission for **these two exact output names**. The two-MJS source fence, schemas, thresholds and prospective caps remain unchanged.

Add two bounded external controls: a pre-existing final sentinel and a pre-existing temporary sentinel must each remain byte-identical after refusal. Normal fixture runs must confirm that both resulting names contain the expected complete JSON. No runtime/helper qualification follows.

No implementation or filesystem probe ran here. This specifies complete-file publication; it does not claim protection against arbitrary storage failure or power loss.
