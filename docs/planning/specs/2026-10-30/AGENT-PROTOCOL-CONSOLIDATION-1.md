#### AGENT-PROTOCOL-CONSOLIDATION-1 — Use standard Virtuoso agents with Blurby overlays *(Seq 67.75; Queued; Full Spec; authored 2026-10-30)*

- **What:** Blurby follows the Virtuoso plugin's skills and agents as written.
  - **What loads.** Every fresh session loads the plugin's standard agents, its `virtuoso` skill and its Zeus protocol (`skills/virtuoso/references/zeus.md`). Four registered Blurby overlays add only Blurby facts on top: commands, paths, fences, gates and host placement. No overlay changes the plugin's behaviour, order or stops.
  - **Archive.** The thirteen local protocol files move unchanged into `docs/planning/.Archive/agent-protocols-2026-10-30/`. These are the eleven `.claude/agents/*.md` files, `.claude/WORKFLOW_REFERENCE.md`, and the forked `.claude/skills/virtuoso/SKILL.md`.
  - **Pointers.** CLAUDE.md, AGENTS.md and ROADMAP.md point at the plugin and the overlays.
  - **Rules aligned to the plugin.** Blurby rules that changed plugin behaviour are amended to match it:
    - standing rules 7 and 9, and CLAUDE.md's review-order rule. There is no Quick-tier self-review.
    - "Dispatch sizing": the plugin's criteria replace the "5+ tasks" trigger. ROADMAP standing rule 10 is marked retired, and LL-091 gets a retired status record.
    - the MarcusAurelius efficiency rule.
  - **Added scope (owner-approved 2026-10-30):**
    - **Findings F-006.** The registry key `policy.roadmap.lanes` becomes `policy.roadmap.workstreams`, backed up. This clears preflight's standing `policy-renamed` warning.
    - **Seventh lane, "Blurby Business".** The rename also carries this owner-confirmed lane, for the Blurby Business epic at Seq 100.5. `policy-set roadmap.lanes` refuses that key, so this rename is the lane's only route into policy.
- **Out of scope:**
  - Shipped plugin files in any cache or the qualified helper root.
  - `~/.virtuoso`, `~/.claude` and `~/.codex` settings, and account-level skills.
  - The untracked `.codex/` and `.agents/` trees in the primary checkout. They stay untouched indefinitely while NATIVE-PATH-ATTESTATION-1 is parked.
  - The Notion register. Its Lane column keeps its name (LL-163). Adding the "Blurby Business" option there is the planner's separate registration.
  - Historical evidence, which keeps its agent names (LL-117).
  - The four WORKFLOW_REFERENCE rules the owner declined.
  - Application source.
- **Why:**
  - **Owner directive 2026-10-28:** "adopt Virtuoso's standard agent/protocol definitions, register additive Blurby-specific overlays and remove duplicated local protocols". The directive is quoted in the ROADMAP.md card on origin/main `80dbe938`.
  - **Owner ruling 2026-10-30:** "Always follow the plugin skills to the letter. We do not need to create local parallel versions of the virtuoso plugin."
  - **Duplicate rosters.** A session on this repo lists each agent twice (for example `Hermes (haiku/Messenger)` and `virtuoso:Hermes`). It also lists a spawnable `Zeus (Coordination Protocol)`, and both `virtuoso` and `virtuoso:virtuoso`.
  - **Classification of the local files.** The mapping below covers 235 items: 123 duplicate the plugin, 94 are stale or dropped, and only 6 are Blurby facts for overlays.
  - **F-006.** Preflight on `80dbe938` reports `virtuoso-status: warning` because of the old `lanes` key. The plugin reads that key for one more release only (`tools/governance/policy.py` `renamed_keys`).
- **Prerequisites:** none. NATIVE-PATH-ATTESTATION-1 is parked (R-2026-10-30-1). Its pin on `C:/Projects/Blurby/.codex/agents/zeus.toml` (sha256 `3BDBE188…`) stays valid until someone retires it on purpose. This item checks the pin before and after its work, and never touches it.
- **Lane / effort / host:** Platform & Maintenance; M.
  - **Execution host:** Rodney, the owner's everyday machine, in place. This is a short docs-and-config wave with no build, test matrix or long-running work, which CLAUDE.md rule 6b allows on the everyday computer. Nothing transfers to RodneySr.
  - **Host prerequisites:**
    - the primary checkout `C:\Projects\Blurby` (used only to cut worktrees);
    - the qualified helper root `C:/Projects/Blurby-artifacts/registry-helper-20261027/virtuoso-dev/plugins/virtuoso` @ `fcfa9295`;
    - `C:/Python314/python.exe`, PowerShell 7 and Git Bash.
- **Path:** dispatch.
- **Sequence, as the plugin states it:**
  - Plugin sources:
    - virtuoso `skills/virtuoso/SKILL.md` Rule 1 (no worktree edit of main governance documents), Rule 2/3 (staging memo) and Rule 4 (dispatch-closeout "Wave 2 Step 0 … Applies them to canonical main … After applying all fold-ins, deletes the staging file");
    - `skills/dispatch-closeout/SKILL.md` Step 2.
  - The plugin's phase stops apply as written: after each phase, print the gate block and wait for direction.

  1. **Dispatch (virtuoso), on branch `eb/agent-protocol-consolidation-1`.**
     - Make the 11 `.claude/agents/` moves, which the specification names as edit sites.
     - Write the staging memo. Make no other change under main governance.
     - Stay within the plugin's sizing: tool budget ≤ 40 and wall time ≤ 60 minutes (`skills/effort-levels/SKILL.md`, *This Is Additive*).
     - Reviews run in the plugin's order (`references/zeus.md` Parallelism Rules): spec compliance (MarcusAurelius), then quality (Plato).
  2. **Merge.** After D1–D9 pass and Blurby.Brain1 confirms package-unchanged, the branch merges `--no-ff` to `main` and is pushed (CLAUDE.md rule 5b).
  3. **Close-out (`/dispatch-closeout`), in the same session, right after the merge.**
     - Wave 2 Step 0 applies every memo fold-in to canonical main, through the writers below, then deletes the memo. The close-out report is the durable record.
     - CLAUDE.md requires branch-per-change. Step 0's commits therefore land through the short close-out branch `eb/agent-protocol-consolidation-1-closeout`, cut from `main` right after the merge and merged `--no-ff` in the same session.
     - Between the merge and Step 0, `main` holds the archived agent briefs without the new pointers. This is the plugin's accepted shape.
     - The C rows are verified on `main` after Step 0.

##### Classification of the 13 moves (main governance check)
The registry declares no role for `.claude/agents/**`, `.claude/WORKFLOW_REFERENCE.md` or `.claude/skills/**`; the only match for "agents" is `x-codexInstructions` → `AGENTS.md`. CLAUDE.md has no worktree-edit-prohibition list, so the plugin's default Rule 1 criteria apply:

| File(s) | Rule 1 criterion | Main governance? | Where it moves |
|---|---|---|---|
| `.claude/agents/{aristotle,athena,hercules,hermes,hippocrates,marcusaurelius,plato,readme,simonides,solon,zeus}.md` (11) | "project copies of agent briefs (`.claude/agents/`), unless the dispatch's own specification names the file as an edit site" | No, because this specification names each file as an edit site | On the dispatch branch (`git mv`, R100) |
| `.claude/WORKFLOW_REFERENCE.md` | "Spans multiple dispatches (… constitutions)"; not in the agent-brief exception | **Yes** | **Memo fold-in move**, applied at Step 0 |
| `.claude/skills/virtuoso/SKILL.md` | "Spans multiple dispatches"; the project's orchestration protocol; not in the agent-brief exception | **Yes** | **Memo fold-in move**, applied at Step 0 |

##### Writers
Checked against the plugin text and `Virtuoso/workspace-layout.json` allowedWriters on `80dbe938`:

| Target | When / writer | Basis |
|---|---|---|
| 11 `.claude/agents/` moves; staging memo; time log | Dispatch / the dispatch session (`virtuoso`) | Rule 1 named-edit-site exception; `closeOuts` allowedWriters include `virtuoso` |
| 2 memo moves (`.claude/WORKFLOW_REFERENCE.md`, `.claude/skills/virtuoso/SKILL.md`); memo deletion | Step 0 / `dispatch-closeout` | Rule 4; `closeOuts` allowedWriters include `dispatch-closeout`; no registry role covers the two moved paths |
| CLAUDE.md, AGENTS.md | Step 0 / `roadmap-review` | `x-agentInstructions` and `x-codexInstructions` allowedWriters are `[roadmap-review, governance-sweep]`. `dispatch-closeout` is not named, so it may not write them. |
| ROADMAP.md | Step 0 / `roadmap-review` | `roadmap` allowedWriters include `roadmap-review` |
| `docs/governance/LESSONS_LEARNED.md` (LL-091 status record) | Step 0 / `lessons --record-status --actor roadmap-review --apply` | `lessons` allowedWriters; `--actor virtuoso` refused (previewed) |
| `Virtuoso/overlays/**` | Step 0 / the repository operator, outside any ceremony actor, saving the memo's exact text | registry-contract *Project overlays* rule 2 (read-only, `allowedWriters: []`; "the operator's own redirect is the whole write"); project-profile Phase 5 |
| `Virtuoso/workspace-layout.json`: `roles.overlays`, `x-commands`, removal of `policy.roadmap.lanes` | Step 0 / the repository operator by hand | registry-contract *Opt-in roles*; `policy-set` refuses the undocumented `roadmap.lanes` |
| `policy.roadmap.workstreams`; `docs/governance/Change.Ledger.jsonl` | Step 0 / `policy-set --actor roadmap-review --apply` | registry-contract (roadmap-review writes `roadmap.workstreams` through `policy-set`); `changeLedger` allowedWriters include `roadmap-review` |

##### Guarded helper (CLAUDE.md rule 11a)
Every helper call has the form `pwsh -NoProfile -File $W <tool> ...`. Set these in each PowerShell 7 session:

```powershell
$WT = 'C:/Projects/Blurby/.worktrees/agent-protocol-consolidation-1'          # dispatch
$WC = 'C:/Projects/Blurby/.worktrees/agent-protocol-consolidation-1-closeout'  # Step 0, cut from main after the merge
$W  = 'C:\Users\estra\AppData\Local\Temp\claude\C--Projects-Blurby\c9ea3b78-2305-4553-92e6-fd54eff726db\scratchpad\vreg.ps1'
```

If `Test-Path $W` is false, re-create the wrapper in the executing session's scratchpad and point `$W` at it. The recipe is `docs/planning/roadmap-reviews/2026-10-27-registry-helper-repair.md` § *Exact guarded invocation example*:
- `guard.py` is that section's Python block, verbatim.
- `vreg.ps1` sits beside it:

```powershell
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$HelperArgs)
$ErrorActionPreference = 'Stop'
$env:PYTHONPATH = $null; $env:PYTHONHOME = $null
$env:VIRTUOSO_PLUGIN_ROOT = 'C:/Projects/Blurby-artifacts/registry-helper-20261027/virtuoso-dev/plugins/virtuoso'
& 'C:/Python314/python.exe' "$PSScriptRoot/guard.py"
if ($LASTEXITCODE -ne 0) { throw 'Qualified helper guard failed; no fallback invocation' }
& "C:/Users/estra/.virtuoso/bin/virtuoso.ps1" @HelperArgs
exit $LASTEXITCODE
```

Rules for every call:
- Use `C:/Python314/python.exe`, never `python3`.
- Each call prints `helper-root-guard: PASS fcfa92959b757828f29bdac6a54aa99015b2b525` first.
- Never pass `--help` through the wrapper.
- Use `--root` with `$WT` or `$WC`, never `C:/Projects/Blurby`.

- **Done when.** Each row names its shell: PowerShell 7 from `$WT` for D rows, and from `$WC`/`main` for C rows, unless a row says Git Bash. A row passes only on its stated exit code and output. Every row was dry-run against the base on 2026-10-30 (standing rule 44).

  **D: the dispatch, verified on `eb/agent-protocol-consolidation-1` before the merge.**
  - **D1. Eleven agent briefs archived, not deleted.**
    - `git ls-files .claude/agents` prints nothing (base: 11).
    - For each of the 11 moves, `git diff --exit-code origin/main:<old> HEAD:<new>` exits 0.
    - `git diff -M --name-status origin/main...HEAD` shows each move as `R100`.
  - **D2. Nothing else under main governance changed on the branch (Rule 1).** `git diff --name-only origin/main...HEAD -- CLAUDE.md AGENTS.md ROADMAP.md Virtuoso docs/governance/LESSONS_LEARNED.md docs/governance/Change.Ledger.jsonl .claude/WORKFLOW_REFERENCE.md .claude/skills` prints nothing. `git ls-files .claude/WORKFLOW_REFERENCE.md .claude/skills` lists exactly those two files.
  - **D3. The memo is complete and applies cleanly.** `& 'C:/Python314/python.exe' -I <scratch>/check_memo.py <memo> origin/main` exits 0. The script checks that:
    - (a) Every fold-in's *Old* text occurs exactly once in its target on `origin/main`.
    - (b) Both memo moves name a source present on the branch and an archive destination absent there.
    - (c) Applying every fold-in in memory to `origin/main` plus the branch's 11 moves gives a tree that passes C5–C8 and C10.
    - (d) The four overlay blocks match neither `instead of|overrid|skip|do not stop|don't stop|rather than|in place of|reorder|parallel|supersed|regardless` (case-insensitive) nor `Athena|Simonides|Solon|AGENT_FINDINGS`.
    - (e) The manifest steps and the LL-091 command appear verbatim.
  - **D4. The plugin resolves, with no stale copy (Git Bash).** All three checks passed on 2026-10-30.
    - `python -I -c "import json,os;d=json.load(open(os.path.expanduser('~/.claude/plugins/installed_plugins.json'),encoding='utf-8'));v=d['plugins']['virtuoso@virtuoso-marketplace'][0]['version'];print(v);raise SystemExit(0 if v=='1.16.2' else 1)"` exits 0.
    - `for d in agents skills references; do diff -rq -x __pycache__ ~/.claude/plugins/cache/virtuoso-marketplace/virtuoso/1.16.2/$d /c/Projects/Blurby-artifacts/registry-helper-20261027/virtuoso-dev/plugins/virtuoso/$d || exit 1; done` exits 0 with no output.
    - The same loop over `agents skills` from `~/.codex/plugins/cache/virtuoso-marketplace/virtuoso/1.16.2` exits 0 with no output.
  - **D5. Pin untouched, before the first write and after the last.**
    - `(Get-FileHash C:/Projects/Blurby/.codex/agents/zeus.toml -Algorithm SHA256).Hash` equals `3BDBE18856EBCE3672870FA5F242DF532FD3C4ADC7BFF63608BB1A180C38335B`.
    - `git -C C:/Projects/Blurby status --porcelain -- .codex .agents` prints exactly `?? .agents/` and `?? .codex/`.
  - **D6. Reviews in the plugin's order.**
    - The memo records the spec-compliance verdict, then the quality verdict, each from a fresh session that neither wrote nor ran this item.
    - The spec-compliance verdict is `APPROVED`, with D1–D5 re-run and their outputs pasted. The quality verdict is `READY`.
    - `Select-String -Path <memo> -Pattern '^- Spec compliance: APPROVED','^- Code quality: READY'` returns 2 matches in that order.
  - **D7. LL-091 still live (standing rule 51).** `pwsh -NoProfile -File $W virtuoso_registry --root $WT lessons --open | Select-String 'LL-091'` returns a line. Base: live.
  - **D8. Package unchanged (standing rule 53).**
    - `git diff --name-only origin/main...HEAD -- main.js preload.js main dist assets/icon.ico assets/tray-icon.png` prints nothing; these are all the `package.json` `build.files` entries.
    - The memo records this.
    - Blurby.Brain1 confirms in writing before the merge go.
  - **D9. Fence (standing rule 41).** `git diff -M --name-status origin/main...HEAD` lists exactly the 11 `R100` moves and `A` the memo. The time log is exempt.

  **C: close-out, run by `/dispatch-closeout` and verified on `main` after Wave 2 Step 0 has merged.**
  - **C1. Registry ready.** `pwsh -NoProfile -File $W virtuoso_preflight --root $WC --mode check` exits 0. Its stdout:
    - includes `virtuoso-status: ready` and `writes: 0`;
    - includes a line matching `^overlays: 4 applied \(`;
    - has no `[warning]` line.

    Base: `warning`, `overlays: not registered`, and the lanes warning.
  - **C2. Exactly four overlays apply.**
    - `... virtuoso_registry --root $WC overlays` exits 0. It prints exactly four `applies` lines (`agents/Hippocrates.md`, `agents/MarcusAurelius.md`, `agents/Plato.md`, `skills/virtuoso/SKILL.md`), and no `inert` or `[` line.
    - For each mirror, `... overlays --for <mirror>` exits 0 and prints the case-exact path.
    - Each file is byte-equal to its memo block (memo content from the merged commit: `git show <merge>:<memo>`).
  - **C3. Manifest diff exact.** `& 'C:/Python314/python.exe' -I <scratch>/check_manifest.py` exits 0. Compared with `git show <pre-merge main>:Virtuoso/workspace-layout.json`, the only differences are:
    - (a) `roles.overlays` added, equal to the contract object in the manifest steps;
    - (b) top-level `x-commands` added;
    - (c) `policy.roadmap.lanes` absent;
    - (d) `policy.roadmap.workstreams` with **seven** entries: the six base lanes in order as `{"id": L, "name": L}`, then `{"id": "Blurby Business", "name": "Blurby Business"}`.

    Every other key is equal, including `policy.workRegister.fieldMappings.workstream == "Lane"`.
  - **C4. Policy write recorded.**
    - `git grep -c -F "roadmap.workstreams" HEAD -- docs/governance/Change.Ledger.jsonl` exits 0 (base: 0 lines).
    - `Virtuoso/.backups/` in `$WC` holds two `*-policy-set` sets (ignored).
    - `<scratch>/workspace-layout.base.json` hashes to the pre-merge `main` blob.
  - **C5. Live references migrated.** Each of these exits 1:
    - `git grep -n -E "\.claude/agents|\.codex/agents|zeus\.(md|toml)|WORKFLOW_REFERENCE|memory\.yaml|policy\.roadmap\.lanes|sprint-queue" HEAD -- CLAUDE.md AGENTS.md`. Base: 15 lines.
    - `git grep -n -E "Athena|Simonides|Solon|AGENT_FINDINGS" HEAD -- CLAUDE.md AGENTS.md .claude Virtuoso/overlays`. Base: CLAUDE.md 36, 129, 136, 140, 146, 152, 176, 180, 192, 235, 274; AGENTS.md 11 lines; `.claude/agents` 18.
    - `git grep -n -i -E "instead of|overrid|skip|do not stop|don't stop|rather than|in place of|reorder|parallel|supersed|regardless" HEAD -- Virtuoso/overlays`.
    - `git grep -n -E "Registry policy\.roadmap\.lanes|^[0-9]+\. \*\*.*Solon" HEAD -- ROADMAP.md`. Base: lines 22, 144, 147. The pattern skips line 1426's historical record and rule 37.
    - `git ls-files .claude/agents .claude/skills .claude/WORKFLOW_REFERENCE.md` prints nothing. For the two memo moves, `git diff --exit-code <pre-merge main>:<old> HEAD:<new>` exits 0.
  - **C6. Startup instructions name the plugin and overlays.**
    - `git grep -c -F "Virtuoso/overlays" HEAD -- CLAUDE.md AGENTS.md` is ≥ 1 for each file.
    - `git grep -l -F "skills/virtuoso/references/zeus.md" HEAD -- CLAUDE.md AGENTS.md` lists both files.

    Base: both exit 1.
  - **C7. Review and sizing rules match the plugin.**
    - `git grep -n -F "5+ implementation tasks" HEAD -- CLAUDE.md AGENTS.md` exits 1. Base: CLAUDE.md 231, AGENTS.md 233.
    - `git grep -n -F "Quick-tier sprints use Zeus self-review" HEAD -- CLAUDE.md AGENTS.md` exits 1. Base: CLAUDE.md 235, AGENTS.md 237.
    - `git grep -c -F "skills/effort-levels" HEAD -- CLAUDE.md AGENTS.md` is ≥ 1 for each file.
    - `git grep -n -E "^10\. \*\*Retired 2026-10-30" HEAD -- ROADMAP.md` exits 0. Its former text is quoted, not deleted.
  - **C8. Seven lanes.**
    - `git grep -c -F "seven product" HEAD -- CLAUDE.md AGENTS.md` is ≥ 1 for each file.
    - `git grep -n -E "^\| Blurby Business \|" HEAD -- ROADMAP.md` exits 0.
    - `git grep -n -F "six product domains" HEAD -- CLAUDE.md AGENTS.md` exits 1.

    Base: the first two exit 1; the third finds 1 line in each file.
  - **C9. LL-091 retired, not deleted.**
    - `... lessons --open | Select-String 'LL-091'` returns nothing.
    - `git grep -n -F "### LL-091 — status (AGENT-PROTOCOL-CONSOLIDATION-1" HEAD -- docs/governance/LESSONS_LEARNED.md` exits 0.
    - `git diff <pre-merge main> HEAD -- docs/governance/LESSONS_LEARNED.md` shows added lines only.
  - **C10. Size limits.**
    - `git cat-file -s HEAD:CLAUDE.md` ≤ 35000. Base: 34,982 bytes / 34,772 chars.
    - `git cat-file -s HEAD:AGENTS.md` ≤ 35353.
    - If either is over, Step 0 moves completed-sprint detail to `docs/planning/CLAUDE_md_archive_session2.md` (CLAUDE.md rule 7), then this row re-runs.
  - **C11. Memo deleted after every fold-in landed (Rule 4).**
    - `git ls-files 'docs/governance/close-outs/Memo.AGENT-PROTOCOL-CONSOLIDATION-1.*'` prints nothing.
    - The close-out report carries the D5, D6 and D8 receipts.
  - **C12. Step 0 did not touch the package.**
    - `git diff --name-only <merge> HEAD -- main.js preload.js main dist assets/icon.ico assets/tray-icon.png` prints nothing.
    - The close-out records "package unchanged" for Step 0, and Blurby.Brain1 confirms it before the close (standing rule 53).
  - **C13. Pin untouched.** D5 is re-run and passes.
  - **C14. Step 0 fence.** `git diff -M --name-status <merge> HEAD` lists exactly the Step 0 paths in the staging plan, plus `/dispatch-closeout`'s own artifacts.

##### Implementation detail
- **The memo.** The dispatch writes `docs/governance/close-outs/Memo.AGENT-PROTOCOL-CONSOLIDATION-1.GovernanceStaging.<date>.md`. It follows Rule 3's structure: `## Target: <document>` → `### Fold-in N`, with Section, Action, a fenced **Old** block (copied exactly from `origin/main`) and a fenced **New** block. It holds the following.
  1. **Memo moves.** Rule 3 lists Remove as an action. Each of these Removes preserves the file: Step 0 runs `git mv` to the archive path and leaves the content byte-identical.
     - `.claude/WORKFLOW_REFERENCE.md` → `docs/planning/.Archive/agent-protocols-2026-10-30/WORKFLOW_REFERENCE.md`
     - `.claude/skills/virtuoso/SKILL.md` → `docs/planning/.Archive/agent-protocols-2026-10-30/claude-skills-virtuoso-SKILL.md`
  2. **Four overlay blocks**, each a complete file. Each starts from the read-only scaffold `pwsh -NoProfile -File $W virtuoso_registry --root $WT overlays --scaffold --for <mirror>`. Every line is a KEEP row from the Zeus-additions table and points to where Blurby states it.
     - **`Virtuoso/overlays/skills/virtuoso/SKILL.md`:**
       - (1) **Commands.** The suite commands are the registered `x-commands`. The packaged-build commands are standing rule 53's `npx electron-builder --win --dir` with the explicit architecture flags named there and in its temporary-placement note.
       - (2) **Project gate.** No dispatch merges or closes until standing rule 53 passes and Blurby.Brain1 confirms in writing. When nothing under `package.json` `build.files` changed, record "package unchanged" with the diff. The Stage 8 source freeze and the release gates stand as CLAUDE.md and ROADMAP.md state them.
       - (3) **Fences.** The shared-core freeze set (CLAUDE.md *Shared-Core Freeze Set*). The main process stays CommonJS; the renderer stays ESM/TypeScript. Reading-mode isolation (CLAUDE.md *Reading-mode isolation*).
       - (4) **Lessons.** A lesson cited by number (`LL-NNN`) is read before the first edit.
       - (5) **Host.** CLAUDE.md rule 6b, and standing rule 53's temporary-placement note (RodneySr for builds and x64 checks). Helper calls follow CLAUDE.md rule 11a.
       - (6) **Git.** Branches follow `policy.git.branchNameTemplate` `eb/{item-id}`, in an isolated worktree. Push with `HEAD:refs/heads/eb/<name>`.
     - **`Virtuoso/overlays/agents/Hippocrates.md`:**
       - (1) The suite is Vitest through npm. Commands come from `x-commands` (`test`, `typecheck`, `build`, `perf`).
       - (2) Gates: `npm test` 0 failed; `npm run typecheck` exits 0; `npm run build` exits 0 when UI, styling or packaging changed (standing rules 1 and 48).
       - (3) The expected count is the latest gate close-out's, as cited on CLAUDE.md's *Current System State* suite line.
       - (4) Gates defined on the owner's machine run there (standing rule 47).
     - **`Virtuoso/overlays/agents/Plato.md`:**
       - (1) Blurby's architecture rules fill the shipped `[CUSTOMIZE]` table: CLAUDE.md *Standing Rules*, *Reading-mode isolation* and *Shared-Core Freeze Set*, and ROADMAP.md *Standing Rules All Skeletons Inherit*.
     - **`Virtuoso/overlays/agents/MarcusAurelius.md`:**
       - (1) Blurby specs name acceptance *Done when*; older specs say *SUCCESS CRITERIA*.
       - (2) Documents: CLAUDE.md *Document Lifecycle* steps 1–6, `docs/governance/BUG_REPORT.md`, `docs/governance/TECHNICAL_REFERENCE.md`.
       - (3) ROADMAP.md: `✅ COMPLETED` tags (CLAUDE.md rule 3), `docs/planning/.Archive/ROADMAP_legacy.md`, and the Sprint Status table.
       - (4) Notion text is read as SQL plain text and written under `x-notion.textRules`.
  3. **Manifest steps for `Virtuoso/workspace-layout.json`.** These follow Blurby.Brain1's condition 2. The operator does the hand edits, and `roadmap-review` runs `policy-set`.
     - (a) Byte-copy the file to `<scratch>/workspace-layout.base.json` and record its SHA-256.
     - (b) Save the four overlays. Then hand-add `roles.overlays` = `{"path": "Virtuoso/overlays", "provider": "directory", "authority": "reference", "mutability": "read-only", "allowedWriters": [], "validation": "exists", "classification": "active", "origin": "authored"}`.
     - (c) Hand-add top-level `x-commands` with four entries. Each entry has `run`, `workingDirectory: "."`, `requires: ["node_modules from npm ci"]` and `produces`. The `run` values match `package.json` on `80dbe938`:
       - `test`: `npm test`
       - `typecheck`: `npm run typecheck`
       - `build`: `npm run build`
       - `perf`: `npm run perf`
     - (d) Write the seven workstreams: preview `pwsh -NoProfile -File $W virtuoso_registry --root $WC --actor roadmap-review policy-set roadmap.workstreams --value-json '<the six base lanes in order, then Blurby Business, as {id,name}>'`, then run it with `--apply`.
     - (e) Hand-delete only `policy.roadmap.lanes`.
     - (f) Re-run (d) with `--apply` and the same value. This validates and backs up the whole manifest.
     - (g) Run preflight. C1 must pass.
  4. **CLAUDE.md fold-ins.** AGENTS.md gets the same fold-ins in its own wording. It keeps its Codex text and points at the Codex plugin cache's `virtuoso` skill.
     - (E1) Division of Labor item 6: replace `AGENT_FINDINGS.md` with `docs/governance/Findings.md (registered findings role)`.
     - (E2) *Product lanes*: replace "The Notion Lane field uses the six product domains declared in registry policy.roadmap.lanes: …" with "The Notion Lane field uses the seven product domains declared in registry `policy.roadmap.workstreams` (Findings F-006): UX polish; TTS / Narration Engine; Reader Engine; Chrome Extension; Library & Content; Platform & Maintenance; Blurby Business." The rest of the paragraph is unchanged.
     - (E3) Session-start step 2 becomes: "The Virtuoso plugin's Zeus protocol — the `virtuoso` skill and `skills/virtuoso/references/zeus.md` — followed as written, plus Blurby's facts in `Virtuoso/overlays/` (list them with the rule-11a-guarded `virtuoso_registry --root . overlays`). There is no local copy; never create one."
     - (E4) *Agent Definition Files*: replace both roster tables with two lines.
       - "Agents are the plugin's (`virtuoso:` roster), selected by its Zeus protocol."
       - The four overlay paths.
     - (E5) *How Dispatches Work*: keep the first paragraph. Replace the routing tree with "Zeus routes and orders work as the plugin's `references/zeus.md` states."
     - (E6) *Agent Scope Labels*: keep the code-scope labels. Delete the specialist and orchestration tables.
     - (E7) Post-Completion Checklist: replace "(Solon pass)" with "(the plugin's spec-compliance review)".
     - (E8) *Mandatory MarcusAurelius Pass*, including the efficiency rule: replace with one line pointing to *Document Lifecycle* and `Virtuoso/overlays/agents/MarcusAurelius.md`.
     - (E9) Standing rule "Spec-compliance review before quality review…" becomes: "**Spec-compliance review before quality review.** Every dispatch gets the plugin's spec-compliance review and then its quality review, by the agents and in the order `skills/virtuoso/references/zeus.md` names. No dispatch tier omits either review (SRL-012 amended 2026-10-30)."
     - (E10) Standing rule "Dispatch sizing: 40 tool-use ceiling per wave…" becomes: "**Dispatch sizing.** Waves are sized and split by the Virtuoso plugin's criteria (`skills/effort-levels/SKILL.md`, *This Is Additive*): tool budget ≤40, wall time ≤60 minutes, and a split when effort levels are significantly mixed. Each wave is a separate dispatch."
     - (E11) Other References: point "Agent Definitions" at the plugin and `Virtuoso/overlays/`.
  5. **ROADMAP.md fold-ins:**
     - Line 22: "Registry policy.roadmap.lanes declares these six categories." → "Registry `policy.roadmap.workstreams` declares these seven workstreams (the Notion Lane column)."
     - Work lanes table: after Platform & Maintenance, add `| Blurby Business | The Blurby Business epic and its items (owner-confirmed lane, 2026-10-30) | Epic registered at Seq 100.5 (2026-10-30). |`
     - Standing rule 7 → "**SRL-012 (amended 2026-10-30):** reviews follow the Virtuoso plugin's order — spec compliance passes before the quality review."
     - Standing rule 9 → "**Spec-compliance before quality:** each task's spec-compliance review passes before its quality review, as the plugin's Zeus protocol orders them."
     - Standing rule 10 → "**Retired 2026-10-30 (AGENT-PROTOCOL-CONSOLIDATION-1):** dispatch sizing is the Virtuoso plugin's (`skills/effort-levels/SKILL.md`, *This Is Additive*: tool budget ≤40, wall time ≤60 minutes, mixed-effort split). Former text: \"Dispatch sizing: 40 tool-use ceiling per wave. Sprints with 5+ implementation tasks must be pre-split into waves.\""
  6. **LL-091 record** (written by `roadmap-review`; previewed 2026-10-30 and accepted):
     `pwsh -NoProfile -File $W virtuoso_registry --root $WC --actor roadmap-review lessons --record-status LL-091 --status "Retired — superseded by the Virtuoso plugin's wave sizing (skills/effort-levels: tool budget <=40, wall time <=60 minutes, mixed-effort split); AGENT-PROTOCOL-CONSOLIDATION-1" --item AGENT-PROTOCOL-CONSOLIDATION-1 --apply`
- **Callers census** (`git grep` on `80dbe938`):
  - **Live, changing:** CLAUDE.md (16 lines), AGENTS.md (17), ROADMAP.md 22/144/147/148 and the Work lanes table, and `.claude/agents/readme.md`.
  - **Already resolve to the plugin, unchanged:** ROADMAP.md 935/978 and `docs/governance/DEVELOPMENT_SYNC.md` 40/157.
  - **Historical, exempt (LL-117):** `docs/governance/close-outs/**`, `docs/governance/bug-reports/**`, `docs/governance/LESSONS_LEARNED.md` (except the appended record), `docs/planning/roadmap-reviews/**`, `docs/planning/epics/**`, `docs/planning/specs/**`, `docs/studies/**` and `docs/planning/.Archive/**`.
- **Scratch scripts (never committed):**
  - `check_memo.py` parses the memo's fenced Old/New blocks and move lines. It loads targets from `git show origin/main:<target>` as UTF-8 (LL-137) and runs D3 (a)–(e).
  - `check_manifest.py` loads the pre-merge and Step 0 manifests as UTF-8 and asserts C3.
- **Tests:** none (test tier None: docs and config only). Nothing under `tests`, `scripts`, `.github` or `package.json` reads these files.
- **Constants:** none.
- **Branches:**
  - **Dispatch:** `eb/agent-protocol-consolidation-1`, cut from `origin/main` at its tip (≥ `80dbe938`) in `$WT`.
  - **Close-out:** `eb/agent-protocol-consolidation-1-closeout`, cut from `main` right after the dispatch merge, in `$WC`.
  - **Push:** both use the explicit refspec `HEAD:refs/heads/<branch>`.
- **Staging plan** (`policy.git`: push, network allow; exact paths only, never `git add -A`):
  - **Dispatch commit:**
    - R100 `.claude/agents/{aristotle,athena,hercules,hermes,hippocrates,marcusaurelius,plato,readme,simonides,solon,zeus}.md` → `docs/planning/.Archive/agent-protocols-2026-10-30/claude-agents/<same name>`
    - A `docs/governance/close-outs/Memo.AGENT-PROTOCOL-CONSOLIDATION-1.GovernanceStaging.<date>.md`
    - The time log is exempt.
  - **Dispatch merge** `--no-ff` to `main`, then push.
  - **Step 0 commits** on the close-out branch:
    - R100 `.claude/WORKFLOW_REFERENCE.md` → `docs/planning/.Archive/agent-protocols-2026-10-30/WORKFLOW_REFERENCE.md`
    - R100 `.claude/skills/virtuoso/SKILL.md` → `docs/planning/.Archive/agent-protocols-2026-10-30/claude-skills-virtuoso-SKILL.md`
    - A `Virtuoso/overlays/skills/virtuoso/SKILL.md`, `Virtuoso/overlays/agents/{Hippocrates,Plato,MarcusAurelius}.md`
    - M `Virtuoso/workspace-layout.json`, `docs/governance/Change.Ledger.jsonl`, `docs/governance/LESSONS_LEARNED.md`, `CLAUDE.md`, `AGENTS.md`, `ROADMAP.md`
    - D the memo
    - `/dispatch-closeout`'s own artifacts
    - `docs/planning/CLAUDE_md_archive_session2.md`, only if C10 requires it
  - **Close-out merge** `--no-ff` to `main`, then push.
  - **Never staged:** `Virtuoso/.backups/`, `.codex/`, `.agents/` and `.claude/launch.json`.
  - **Register:** the dispatch writes no register field (standing rule 46). `/dispatch-closeout` owns status, Seq and completion.
- **Lane Ownership:** Platform & Maintenance; execution surface E.
- **Forbidden During Parallel Run:** application source, `package.json`, `tests/`, the Notion register, and other items' ROADMAP sections.
- **Shared-Core Touches:** none.
- **Merge Order:** first, ahead of any governance item that edits CLAUDE.md, AGENTS.md or `Virtuoso/workspace-layout.json`. Those items rebase onto the close-out merge.
- **Failure handling:**
  - **Guard HOLD, or a helper error before its own output:** stop. Do not fall back or make an unguarded call. Report to Blurby.Brain1.
  - **D4 fails (the plugin moved):** HOLD before any edit. Blurby.Brain1 rules on the intended version.
  - **D5 or C13 fails (pin changed):** stop and report to Blurby.Brain1. Never repin, copy or restore.
  - **D3 fails:** fix the memo, never the targets on the branch, then re-run.
  - **A fold-in no longer matches `main` at Step 0:** surface the reconciliation prompt (Rule 4 *Discrepancy handling*). Never overwrite silently.
  - **Manifest (Blurby.Brain1 condition 2):** this covers `policy-set --apply` refusing at (d) or (f), and C1 failing for a registry reason.
    - Restore `<scratch>/workspace-layout.base.json` byte-for-byte over `Virtuoso/workspace-layout.json` and verify its SHA-256.
    - Stop and report to Blurby.Brain1. Never hand-patch around a refusal.
    - If a ledger line was already appended, leave it (append-only) and record it in the close-out.
  - **The lessons record is refused, or LL-091 is no longer live:** do not force it. Write a plain outcome line in the close-out (standing rule 51) and route it to Blurby.Brain1.
  - **Overlay finding at preflight:** fix the named file from its memo block.
  - **C5 or D3(d) hit that changes plugin behaviour:** delete the line. Any Blurby need behind it becomes a question to Blurby.Brain1.
  - **Retry ceiling:** two attempts per gate, then an issue to Blurby.Brain1.
  - **Rollback:**
    - Before the dispatch merge: leave the branch and worktree in place (CLAUDE.md rule 10).
    - After a merge: `git revert -m 1 <merge>` for each merge, close-out first. The lanes warning returns.
    - The LL-091 record stays, because lessons are append-only. Append a new status record if the revert must be reflected.

##### Mapping table — local definitions to destination
Classes:
- (A) duplicates the plugin → archived;
- (B) Blurby fact → overlay; every B passed the KEEP test;
- (C) project-wide → stays in CLAUDE.md/AGENTS.md;
- (D) stale, or changes plugin behaviour → dropped.

Line numbers are from `80dbe938`. "Standard" is the qualified root `fcfa9295`, whose `agents/`, `skills/` and `references/` are byte-identical to installed 1.16.2.

| Local file ↔ standard | A | B | C | D | B → overlay | Archive route |
|---|---|---|---|---|---|---|
| `.claude/agents/zeus.md` ↔ `skills/virtuoso/references/zeus.md` | 20 | 2 (package commands and Brain gate 249–255; "package unchanged" 256) | 1 (auto-merge 257–260 = rule 5b) | 7 (spawnable frontmatter; Athena/Solon hierarchy; local routing/tier tables 57–199; PROGRESS banner; in-place `git checkout main` 378–396) | SKILL (1), (2) | branch |
| `.claude/WORKFLOW_REFERENCE.md` ↔ `references/WORKFLOW_REFERENCE.md` | 9 | 0 | 6 (already in CLAUDE.md) | 19 (15 stale; 4 declined by the owner) | — | **memo move** |
| `.claude/skills/virtuoso/SKILL.md` ↔ plugin skill | 20 | 0 | 0 | 7 (forked name; 4 effort levels; `codex-parent`; model tiers; Solon roster; EXECUTION-RULES overlays) | — | **memo move** |
| `hermes.md` ↔ `agents/Hermes.md` | 7 | 0 | 0 | 4 (tier vocabulary) | — | branch |
| `hercules.md` ↔ `agents/Hercules.md` | 9 | 0 | 0 | 5 (tier vocabulary; Athena/Solon routes) | — | branch |
| `athena.md` ↔ `agents/Aristotle.md` Mode 2 | 9 | 0 | 1 (escalation 135 = rule 11) | 11 (frontmatter; split; generic extras; example) | — | branch |
| `aristotle.md` ↔ `agents/Aristotle.md` Mode 1 | 10 | 0 | 0 | 2 (name, Model line) | — | branch |
| `hippocrates.md` ↔ `agents/Hippocrates.md` | 8 | 1 (npm test/typecheck/build gates) | 0 | 5 (name; Model; CUSTOMIZE pytest block; examples ×2) | Hippocrates (1)–(4) | branch |
| `plato.md` ↔ `agents/Plato.md` | 8 | 0 (overlay line written from CLAUDE.md facts) | 0 | 5 (name; Model; unfilled Known Traps; examples ×2) | — | branch |
| `solon.md` ↔ spec compliance (`references/zeus.md` 109: MarcusAurelius) | 10 (incl. contradiction stop = issue contract) | 1 (acceptance naming) | 0 | 4 (name; Model; example; "never assume future fixes" 435, a behaviour change) | MarcusAurelius (1) | branch |
| `marcusaurelius.md` ↔ `agents/MarcusAurelius.md` | 9 | 2 (Blurby doc pass 3; ROADMAP row 39) | 1 (doc index) | 13 (sprint-queue; AGENT_FINDINGS; CUSTOMIZE; templates; lesson archiving; examples; pre-composed diffs 309, a behaviour change) | MarcusAurelius (2)–(4) | branch |
| `simonides.md` ↔ `references/agent-memory-guide.md` | 4 | 0 | 0 | 12 (never-created YAML stores forbidden by the guide; YAML findings queue; scenarios) | — | branch |
| `readme.md` | 0 | 0 | 3 | 0 | — | branch |
| **Total (13 files, 235 items)** | **123** | **6** | **12** | **94** | | 11 branch, 2 memo |

Not counted, untouched: `.codex/agents/*.toml` (including the pinned `zeus.toml`) and `.agents/skills/*`.

**Zeus additions: KEEP/DROP test (Blurby.Brain1, OQ-4).**
- **KEEP:** the line supplies a value or fact the plugin leaves to the project.
- **DROP:** the line changes the plugin's behaviour, order or stops.

| # | Addition (source) | Test result | Decision → where |
|---|---|---|---|
| Z1 | electron-builder `--dir` with an explicit arch, 25 s scratch launch, asar check, Done-when on the packaged exe (zeus.md 249–255; rule 53) | commands and a project gate | KEEP → SKILL (1), (2) |
| Z2 | "No merge until Brain confirms" | project gate | KEEP → SKILL (2) |
| Z3 | "Package unchanged" record | project gate | KEEP → SKILL (2) |
| Z4 | Stage 8 freeze and release gates | project gate | KEEP → SKILL (2) |
| Z5 | Shared-core freeze set; CommonJS main / ESM renderer; mode isolation | paths and fences | KEEP → SKILL (3); Plato (1) |
| Z6 | Read a lesson cited by number | project gate | KEEP → SKILL (4) |
| Z7 | Rule 6b; rule 53 temporary note (RodneySr); rule 11a guard | host and command facts | KEEP → SKILL (5) |
| Z8 | `eb/{item-id}` worktree branches; push `HEAD:refs/heads/eb/<name>` | branch template and refspec | KEEP → SKILL (6) |
| Z9 | Routing tree and agent tables with Athena, Solon and model tiers | replaces the plugin's agent selection with a local one | DROP; E4, E5 |
| Z10 | "Solon… then Plato"; "MUST be parallel-eligible" | mandates parallel review and reorders it | DROP; E9, rules 7 and 9 |
| Z11 | In-place `git checkout main` | changes the git flow | DROP |
| Z12 | PROGRESS banner | replaces the timing header | DROP |
| Z13 | Tool-budget audit at 70% / 85% | same as plugin `zeus.md` 640–659 | A |
| Z14 | "40 tool-use ceiling per wave" | the plugin defines sizing (≤40 tools, ≤60 min, mixed effort) | A; E10 points to the plugin |
| Z15 | "Sprints with 5+ implementation tasks MUST be pre-split" | a split trigger the plugin does not list | DROP (Blurby.Brain1); E10, rule 10 retired, LL-091 record |
| Z16 | MarcusAurelius efficiency rule | changes how Zeus delegates documentation work | DROP; E8 |
| Z17 | "Quick-tier sprints use Zeus self-review" | leaves out the plugin's quality review | DROP (Blurby.Brain1); E9 |
| Z18 | Technical questions → Blurby.Brain1, design → owner (rule 11) | project-wide, already in CLAUDE.md | C; no overlay line |
| Z19 | "Merge automatically unless the spec says otherwise" | project git policy, already rule 5b | C; no overlay line |

##### F-006 rename and the seventh lane
1. **Who reads the key.**
   - The helper falls back to `lanes` for one release and warns (`tools/governance/policy.py` 562–577; `registry.py` 435).
   - The board reads only `workstreams` (`roadmap_visualizer/board.py` 197–203; `generate.py` 110–128). It will group the board by workstream, which the owner accepted.
   - Text that changes: CLAUDE.md 60, AGENTS.md 60, ROADMAP.md 22 and the Work lanes table.
   - Unchanged: historical records; the Notion Lane column; `fieldMappings.workstream = "Lane"` (LL-163).
2. **Previews (2026-10-30; nothing written).**
   - `policy-set --actor roadmap-review roadmap.workstreams` with seven `{id,name}` objects is accepted and affects only `Virtuoso/workspace-layout.json`.
   - `policy-set roadmap.lanes` is refused as "not a documented key".
3. **Apply** through manifest steps (a)–(g) at Step 0.
4. **Close-out.** `/dispatch-closeout` appends F-006's `fixed` disposition to `docs/governance/Findings.md`, then regenerates the board under the guard.

##### Rulings folded in
- **Owner, 2026-10-30:**
  - OQ-5: follow the plugin skills to the letter; overlays only add Blurby facts.
  - OQ-8: the four WORKFLOW_REFERENCE rules are not added.
  - OQ-11: `.codex/` and `.agents/` stay untouched while NATIVE is parked.
  - OQ-12: the board's workstream grouping is accepted.
  - A seventh lane, "Blurby Business", is added through this rename.
- **Blurby.Brain1, 2026-10-30:**
  - OQ-1: planner-run.
  - OQ-2: retire Athena (→ `virtuoso:Aristotle`) and Simonides (→ the memory guide and Findings).
  - OQ-3: retire Solon; reviews follow the plugin; amend rules 7 and 9 and the CLAUDE.md/AGENTS.md text.
  - OQ-4: overlays carry facts only (the KEEP/DROP table).
  - OQ-6: register `x-commands`.
  - OQ-7: hand-delete `lanes` after the workstreams write, with a byte copy and re-validation.
  - OQ-9: drop athena.md's generic extras.
  - OQ-10: no Aristotle overlay.
  - Z15: drop the "5+ tasks" trigger; retire rule 10 with a pointer; record LL-091.
  - Spec compliance and quality are routed exactly as `zeus.md` says.
  - Z17: every dispatch gets the quality review.
  - The plugin's sequence is followed to the letter: Rule 1 limits the branch; the branch merges; `/dispatch-closeout` applies the memo to main as Wave 2 Step 0 and deletes it (Rule 4).
  - Main governance documents go through the memo. That is why the two `.claude` files outside `.claude/agents/` are memo moves.
  - Conditions applied: the stale-name grep (C5); the 35k limit (C10); the manifest order and restore steps; the pin checked before and after (D5, C13).

##### Task list
| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Worktree cut; guarded wrapper ready; base receipts recorded (preflight, overlays, pin hash, plugin diff, grep gates, LL-091 live) | repeat | setup | bounded | low | 10m | — | — |
| 2 | Eleven agent briefs archived byte-identical on the branch | calculable | governance-docs | bounded | low | 10m | — | — |
| 3 | Staging memo holds exact fold-ins, two memo moves, four fact-only overlays, manifest steps and the LL-091 record, and applies cleanly in memory | calculable | governance-docs | bounded | medium | 60m | — | — |
| 4 | Independent spec-compliance review of the dispatch | repeat | review | bounded | medium | 15m | — | — |
| 5 | Independent quality review, after spec compliance passes | repeat | review | bounded | medium | 15m | — | — |
| 6 | Dispatch gates (plugin resolution, pin, package unchanged confirmed by Brain1, fence); branch merged and pushed | repeat | merge-and-verify | bounded | medium | 15m | — | — |
| 7 | Close-out Wave 2 Step 0 applies the memo to main through its assigned writers and deletes it; registry ready; lanes, review and sizing rules aligned; Step 0 merged and pushed | repeat | governance-closeout | bounded | medium | 45m | — | — |

**Total:** chain 17m · sum 17m; 7 of 7 estimated tasks calibrated (priced by kind, then tier and effort, then the task's own estimate) — as `timing --rows-from-spec` printed on 2026-10-30. The written estimates sum to 2h50m.

##### Lessons applied
- **LL-068:** D1 and C5 prove each move byte-identical, and C10 bounds both instruction files. Every fold-in is an exact old/new replacement; no file is rebuilt from line ranges.
- **LL-117:** historical-evidence families are exempt up front. The grep gates cover only live instruction files, `.claude` and the overlays.
- **LL-129:** the label census came first (CLAUDE.md 16 lines, AGENTS.md 17, ROADMAP 22/144/147/148). D3 proves each *Old* text occurs exactly once.
- **LL-131:** the census matches path references as well as role names, and names the callers that already resolve to the plugin.
- **LL-150:** the B facts reach overlays through the memo before the files leave live use, and every archive copy is byte-identical.
- **LL-163:** the canonical key is renamed while the Notion Lane column and `fieldMappings.workstream = "Lane"` stay untouched (C3).
- **LL-171:** no register or sequence write. Every helper call goes through the rule 11a guard on the qualified root.
- **LL-137:** both check scripts read UTF-8 explicitly.
- **LL-143:** every row names its shell and exit code, and was dry-run against the base on 2026-10-30.
- **LL-091:** retired by a status record at Step 0, checked live first (D7) and after (C9). It is not deleted.
- **Standing rule 14 (agent rename propagation):** C5–C8 are the grep-and-replace pass.
- **Standing rule 41 (exact-path fences):** D9 and C14 exempt the time log.
- **Standing rule 46 (register fields):** the dispatch writes no register field.
- **Standing rule 51 (lesson status):** LL-091's status is compared with its current status at dispatch (D7) and before the record (C9). If it was promoted or retired in the meantime, the record becomes a plain outcome line.
- **Standing rule 53 (packaged build):** the package is shown unchanged by a diff over `build.files` at the merge (D8) and after Step 0 (C12), and Blurby.Brain1 confirms both.
