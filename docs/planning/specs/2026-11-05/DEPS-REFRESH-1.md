#### DEPS-REFRESH-1 — Refresh the dependency advisories before the final test pass *(Seq 87.6; Full Spec 2026-11-05, measured against `origin/main` `14ce3d24`; Platform & Maintenance; release-gate rider, merges before gate (1); ruled by Blurby.Brain1 2026-11-05; rule 53 applies, because the lockfile ships)* <a id="deps-refresh-1"></a>

- **What:** update `undici`, `follow-redirects` and `joi`, and bring `docs/governance/DEPENDENCY_ADVISORIES.md` back to the truth.
  - **Outcome:** on the release line, `npm audit --omit=dev` reports nothing fixable without `--force`, and every high advisory has a current row in the advisories document.
  - **Out of scope:**
    - `npm audit fix` in any form, and any major version bump (`adm-zip`, `exceljs`, `@azure/msal-node`);
    - moving the build chain, which is BUILD-CHAIN-REFRESH-1, after the release;
    - moving `kokoro-js`, `onnxruntime-node` or `@huggingface/transformers`;
    - reopening DEPS-AUDIT-1, whose Done-when 4 and 5 are merge-time checks (Brain1, 2026-11-05);
    - any product code change.
- **Why (root cause, rule 6c):** the advisory database moves, and nothing re-runs the audit between merges. Release gate (3) exists for that risk. DEPS-AUDIT-1's own document says "The advisory database moves, so re-run before relying on a row".
- **Origin:** Findings F-032 and `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.post-halt-rulings.2026-11-05.md` section 1c.

##### Measured by the planner (2026-11-05, read-only, on a scratch copy of `14ce3d24`'s `package.json` and lockfile)

- **Before:** `npm audit --omit=dev` reports 9 (6 high, 3 moderate). All packages: 21 (8 high, 13 moderate).
- **`npm audit fix`, rejected:** it changes 35 lockfile entries, of which one is production (`undici` 7.30.0 to 7.30.2). The rest include `electron-builder`, `app-builder-lib`, `builder-util`, `dmg-builder` and `electron-publish` 26.15.3 to 26.18.1, plus `vitest` and `vite`.
- **`npm update undici follow-redirects joi`, the ruled command, changes exactly four entries:**
  - `node_modules/undici` 7.30.0 to 7.30.2 (production);
  - `node_modules/node-gyp/node_modules/undici` 6.29.0 to 6.29.1 (dev);
  - `node_modules/follow-redirects` 1.16.1 to 1.16.2 (dev);
  - `node_modules/joi` 18.2.9 to 18.3.2 (dev).
- **After it:** `package.json` is unchanged. `npm audit --omit=dev` reports 8 (5 high, 3 moderate), with nothing fixable. All packages: 18 (5 high, 13 moderate), with these fixable: `@vitest/mocker`, `electron-builder-squirrel-windows`, `fast-uri`, `vite` and `vitest`, all moderate and all dev or build chain.

##### Design decisions

- **The scoped update, never `--force`** (Blurby.Brain1, 2026-11-05, replacing "`npm audit fix`" in section 1c). `ELECTRON_BUILDER_7Z_FILTER=BCJ` for the ARM64 installer was proven on `electron-builder` 26.15.3 and cost a three-reproduction diagnosis. Moving that chain buys no production safety and would put the proof at risk just before release.
- **The deferred half has an owner:** BUILD-CHAIN-REFRESH-1, after the release, with the ARM64 installer re-proof.

##### Edit sites

- `package-lock.json`: only as `npm update undici follow-redirects joi` writes it. `package.json` does not change.
- `docs/governance/DEPENDENCY_ADVISORIES.md`:
  - the base line (`:3`): new sha and audit date;
  - the result table: new counts;
  - `electron` row (`:45`): correct `41.10.7` to the shipped 42.11.18;
  - `undici` row (`:43`), `follow-redirects` row (`:50`), and a new `joi` row: each with its class and a reachability note. Reachability: `undici` is production, under `cheerio`; the `node-gyp` copy is install time; `follow-redirects` is dev, through `axios`; `joi` is dev;
  - a row or note for each entry still fixable in the all-dependency audit, with its reachability.

##### Done when

| # | Criterion | Verify |
|---|---|---|
| 1 | The Kokoro pins and `electron` are unchanged | `git diff <base>...HEAD -- package-lock.json` has no hunk under `node_modules/kokoro-js`, `node_modules/onnxruntime-node`, `node_modules/@huggingface/transformers` or `node_modules/electron"` |
| 2 | `package.json` is unchanged | `git diff --quiet <base>...HEAD -- package.json` exits 0 |
| 2a | The lockfile moves only the three named packages, plus anything they strictly need, each named in the memo | Comparing `version` per path in `package-lock.json` between base and `HEAD` lists the four entries above, and any extra entry is named in the memo with the reason |
| 2b | The build chain does not move | `git diff <base>...HEAD -- package-lock.json` has no hunk under `electron-builder`, `app-builder-lib`, `builder-util`, `dmg-builder`, `electron-publish`, `vitest` or `vite` |
| 3 | No production advisory is fixable without `--force` | `npm audit --omit=dev --json`: no entry has `fixAvailable` equal to `true` |
| 3a | Anything left fixable in the all-dependency audit is dev or build chain, with a reachability note | Every name with `fixAvailable` equal to `true` in `npm audit --json` appears in `DEPENDENCY_ADVISORIES.md` |
| 4 | Every high advisory has a row | Every name `npm audit --omit=dev --json` reports at high severity appears in `DEPENDENCY_ADVISORIES.md` |
| 5 | The document is re-dated and its Electron row is true | `git grep -n "42.11.18" -- docs/governance/DEPENDENCY_ADVISORIES.md` prints the row; `git grep -n "41.10.7" -- docs/governance/DEPENDENCY_ADVISORIES.md` prints nothing |
| 6 | Suite, typecheck and build pass | `npm test`, `npm run typecheck` and `npm run build` each exit 0 |
| 7 | Fence held | `git diff --name-only <base>...HEAD` lists only `package-lock.json`, the advisories document, the memo and the time log |
| 8 | Rule 53 package verification | The memo's "Package verification" section, with Blurby.Brain1's confirmation |

##### Failure handling

- **If a Kokoro pin, `electron` or the build chain moves:** stop, do not commit, and report to Blurby.Brain1.
- **If a test or the package fails after the fix:** stop and report the failing package. Do not pin around it.
- **If a new high advisory appears between this spec and the run:** classify it in the document. A new production fixable entry is a STOP to Blurby.Brain1, because the command names its packages.
- **Retry ceiling:** one run. A second attempt needs Blurby.Brain1's ruling.
- **Rollback:** `git revert -m 1 <merge>`.

##### Repository plan and host (rule 6b)

- **Host:** RodneySr, in `<clone>\.worktrees\deps-refresh-1`, with `npm ci`. Brain1 confirms the host's inputs before launch.
- **Branch:** `eb/deps-refresh-1` from `refs/remotes/origin/main` now, not after BLOCK-TEXT-ORDER-1 (Blurby.Brain1, 2026-11-05), because the lockfile and advisories document share no files with it. Done-when 1 to 7 run now, and then it holds. Done-when 8 (rule 53) runs on the merged tip after BLOCK-TEXT-ORDER-1. Merge order is unchanged: third. Push with `HEAD:refs/heads/eb/deps-refresh-1`.
- **Staging:** exact paths: `package-lock.json`, `docs/governance/DEPENDENCY_ADVISORIES.md`, `docs/governance/close-outs/Memo.DEPS-REFRESH-1.GovernanceStaging.<date>.md` and `docs/governance/close-outs/Timing.DEPS-REFRESH-1.jsonl`. Never stage `tests/perf-baseline-results.json`.
- **Merge:** `--no-ff`, on Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go.
- **Lane ownership:** surface D. **Forbidden during a parallel run:** every source file. **Shared-core touches:** none. **Merge order:** third in Brain1's release set, after the ERROR-LOG fix and BLOCK-TEXT-ORDER-1.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Scoped update applied, pins and build chain unchanged | calculable | dependency-refresh | mechanical | low | 10m | — | — |
| 2 | Advisories document re-dated and classified | calculable | governance-doc | bounded | medium | 20m | — | — |
| 3 | Suite, typecheck and build pass | calculable | verify-gate | mechanical | low | 10m | — | — |
| 4 | Package verified | calculable | live-check | bounded | medium | 20m | — | — |
| 5 | Memo, time log and push | calculable | merge-and-docs | mechanical | low | 5m | — | — |

**Total:** chain 1h05m · sum 1h05m; 0 of 5 estimated tasks calibrated

##### Lessons applied

- **Standing rule 53:** the lockfile ships, so the item carries a package check.
- **LL-142:** the counts above were measured on a real run of each command, which is how the build-chain move was found.
