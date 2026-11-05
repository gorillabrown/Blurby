# Business helper relocation and theme export supplement

Actual final ruling read from owner-delegated Codex Blurby.Brain, chat `01a179e8-7a40-75c0-93f4-d3045ad99027`, turn `01a19e67-cf0f-7d42-ade6-2df386d00ad6`. Preserved verbatim. This technical supplement does not edit the frozen charter or seed specification.

**Ruling BB-2026-11-02-2: approve a separately bounded relocation of the existing qualified helper, and prescribe the one-line theme export correction.** A2 is unaffected.

I read Business’s actual discovery turn: main `ac19ea60`, Business branch/worktree absent, source-gate readback consumed, and no installation or source edits performed. The two reported gaps are real.

**Qualified helper setup**

The parent may admit a **≤30-minute / ≤20-tool-use preparation wave**, with its own consumed receipt. This does not extend or reset an existing Business wave.

Use a fresh, retained location:

```text
Repository:
C:\Projects\Blurby-artifacts\registry-helper-20261102-business\virtuoso-dev

Plugin root:
<repository>\plugins\virtuoso
```

1. Require the destination to be absent. Do not overwrite, clean or reuse an unidentified checkout.
2. Clone the private repository `https://github.com/gorillabrown/virtuoso-dev`, selecting only named branch `eb/registry-sequence-precision-20261027`. Check out **detached at exactly** `fcfa92959b757828f29bdac6a54aa99015b2b525`. A moved branch does not change that pin.
3. Use checkout-local/process-local Windows line-ending settings consistent with the qualified source: `core.autocrlf=true`. Do not change global Git settings. No plugin installation, cache replacement or global environment change.
4. Transfer the **unaltered** qualified manifest. Require SHA256:
   `86a0fb68619372d6e73cdc4dc1ad5e7fc4c55c62fc75e2a836c0084e895c8d47`.
5. Verify:
   - exact HEAD and expected parent;
   - clean checkout;
   - exactly the manifest’s **220 tracked plugin paths**;
   - every actual file’s byte length and raw SHA256;
   - every pinned tree entry’s Git blob identity against `canonicalGitBlob`.

**Both raw and canonical checks must pass.** Canonical agreement alone does not authorize accepting different runtime bytes. On mismatch, preserve the checkout, report exact differing paths and STOP; do not regenerate the manifest or normalize files to manufacture a match.

The manifest retains its original machine paths. Record a separate relocation receipt binding its hash to the new repository/plugin roots. Adapt **only those location bindings** in the invocation guard; preserve all commit, inventory, raw-hash and import checks.

Use an existing, identified Python interpreter with `-I -B`; insert only the verified plugin root into that process’s import path. Verify the actual imported `tools.*` modules originate under that root. Set `VIRTUOSO_PLUGIN_ROOT` only in the dedicated child process. Missing Python, authentication, source pin or provenance means HOLD—no installed-helper fallback.

After those checks, the parent may accept the relocated root for guarded Business registry operations. Existing mutation permissions and the timing-write restrictions remain unchanged. No helper regression-suite rerun or source modification is required for an exact-byte relocation.

**HB-6 theme correction**

The [specification](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/docs/planning/holding/2026-10-30-blurby-business-tier1/phase1-specs.md:93) requires importing `themes`, but [ThemeProvider.tsx](C:/Users/estra/.codex/worktrees/blurby-roadmap-review-20261102/Blurby/src/components/ThemeProvider.tsx:27) currently declares it without exporting it.

The exact implementation change is:

```diff
-const themes: Record<string, Record<string, string>> = {
+export const themes: Record<string, Record<string, string>> = {
```

ThemeProvider is already permitted by the Business boundary contract, but omitted from HB-6’s edit/staging list. **This ruling explicitly adds only that declaration change to HB-6’s source fence.** The parent must record and transfer this technical supplement before execution; do not silently broaden the fence or edit the frozen charter/storyboard/specification documents.

Business imports `{ themes }` and treats the map as read-only. Preserve every palette value, existing export, hook and ThemeProvider behavior. No duplicated palette, provider mounting, extraction or refactor.

Verification must show the one-line shared-file diff, unchanged palette content, the prescribed Business boundary controls and relevant theme-application assertions within the Business test fence.

**Next:** finish helper preparation and its acceptance receipt, establish the isolated Business worktree under the prior ruling, then release the applicable bounded implementation wave. Native remains paused.

No setup, transfer, source edit or executor message occurred here. Remote raw-byte/import qualification remains unverified.
