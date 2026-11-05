#### DEPS-REFRESH-1 — Refresh the dependency advisories before the final test pass *(Seq 87.6; Full Spec 2026-11-05, measured against `origin/main` `14ce3d24`; Platform & Maintenance; release-gate rider, merges before gate (1); ruled by Blurby.Brain1 2026-11-05; rule 53 applies, because the lockfile ships)* <a id="deps-refresh-1"></a>

- **What:** take the advisory fixes that need no `--force`, and bring `docs/governance/DEPENDENCY_ADVISORIES.md` back to the truth.
  - **Outcome:** on the release line, `npm audit --omit=dev` reports nothing fixable without `--force`, and every high advisory has a current row in the advisories document.
  - **Out of scope:**
    - `npm audit fix --force`, and any major version bump (`adm-zip`, `exceljs`, `@azure/msal-node`);
    - moving `kokoro-js`, `onnxruntime-node` or `@huggingface/transformers`;
    - reopening DEPS-AUDIT-1, whose Done-when 4 and 5 are merge-time checks (Brain1, 2026-11-05);
    - any product code change.
- **Why (root cause, rule 6c):** the advisory database moves, and nothing re-runs the audit between merges. Release gate (3) exists for that risk. DEPS-AUDIT-1's own document says "The advisory database moves, so re-run before relying on a row".
- **Origin:** Findings F-032 and `C:\Projects\Blurby-artifacts\brain1-rulings\Brain1.post-halt-rulings.2026-11-05.md` section 1c.

##### Measured by the planner (2026-11-05, read-only, on a scratch copy of `14ce3d24`'s `package.json` and lockfile)

- **Before:** `npm audit --omit=dev` reports 9 (6 high, 3 moderate). All packages: 21 (8 high, 13 moderate).
- **`npm audit fix` changes 35 lockfile entries. One is production:** `undici` 7.30.0 to 7.30.2.
- **The 34 dev entries include the build chain:** `electron-builder`, `app-builder-lib`, `builder-util`, `dmg-builder` and `electron-publish` 26.15.3 to 26.18.1, plus `vitest` 4.1.11 to 4.1.12 and `vite` 6.4.4 to 6.4.5.
- **The Kokoro pins and `electron` do not move.**
- **After:** `npm audit --omit=dev` reports 8 (5 high, 3 moderate), with nothing fixable. All packages: 14 (5 high, 9 moderate), with `electron-builder-squirrel-windows` still fixable.

##### Design decisions

- **`npm audit fix`, never `--force`** (Brain1, 2026-11-05).
- **Package checks cover the installer, not only the app.** The fix moves the build chain, and `ELECTRON_BUILDER_7Z_FILTER=BCJ` for the ARM64 installer was proven against 26.15.3. See Blurby.Brain1 question Q1.

##### Blurby.Brain1 question Q1 (open; the item is not dispatch-ready until it is ruled)

Your ruling measured `fixable=1`. The trial shows `npm audit fix` also moves `electron-builder` by three minor versions on the release line. Either accept that with a re-proof of the ARM64 installer (681 of 681 files by path, `0xAA64`, native launch), or scope the fix to `npm update undici follow-redirects joi`, which takes the three named packages and leaves the build chain alone. **Planner recommendation:** the scoped update. It meets the ruling's purpose, and it costs no re-proof of a filter that took a diagnosis to find.

##### Edit sites

- `package-lock.json`: only as the ruled command writes it. `package.json` does not change.
- `docs/governance/DEPENDENCY_ADVISORIES.md`:
  - the base line (`:3`): new sha and audit date;
  - the result table: new counts;
  - `electron` row (`:45`): correct `41.10.7` to the shipped 42.11.18;
  - `undici` row (`:43`), `follow-redirects` row (`:50`), and a new `joi` row: each with its class and a reachability note. Reachability: `undici` is production, under `cheerio`; the `node-gyp` copy is install time; `follow-redirects` is dev, through `axios`; `joi` is dev.

##### Done when

| # | Criterion | Verify |
|---|---|---|
| 1 | The Kokoro pins and `electron` are unchanged | `git diff <base>...HEAD -- package-lock.json` has no hunk under `node_modules/kokoro-js`, `node_modules/onnxruntime-node`, `node_modules/@huggingface/transformers` or `node_modules/electron"` |
| 2 | `package.json` is unchanged | `git diff --quiet <base>...HEAD -- package.json` exits 0 |
| 3 | No production advisory is fixable without `--force` | `npm audit --omit=dev --json`: no entry has `fixAvailable` equal to `true` |
| 4 | Every high advisory has a row | Every name `npm audit --omit=dev --json` reports at high severity appears in `DEPENDENCY_ADVISORIES.md` |
| 5 | The document is re-dated and its Electron row is true | `git grep -n "42.11.18" -- docs/governance/DEPENDENCY_ADVISORIES.md` prints the row; `git grep -n "41.10.7" -- docs/governance/DEPENDENCY_ADVISORIES.md` prints nothing |
| 6 | Suite, typecheck and build pass | `npm test`, `npm run typecheck` and `npm run build` each exit 0 |
| 7 | Fence held | `git diff --name-only <base>...HEAD` lists only `package-lock.json`, the advisories document, the memo and the time log |
| 8 | Rule 53 package verification | The memo's "Package verification" section, with Blurby.Brain1's confirmation. If the build chain moved, it includes the ARM64 installer re-proof named in Q1 |

##### Failure handling

- **If a Kokoro pin or `electron` moves:** stop, do not commit, and report to Blurby.Brain1.
- **If a test or the package fails after the fix:** stop and report the failing package. Do not pin around it.
- **If a new high advisory appears between this spec and the run:** classify it in the document. A new production fixable entry takes the same command.
- **Retry ceiling:** one run. A second attempt needs Blurby.Brain1's ruling.
- **Rollback:** `git revert -m 1 <merge>`.

##### Repository plan and host (rule 6b)

- **Host:** RodneySr, in `<clone>\.worktrees\deps-refresh-1`, with `npm ci`. Brain1 confirms the host's inputs before launch. An ARM64 installer re-proof, if ruled, needs Rodney.
- **Branch:** `eb/deps-refresh-1` from `refs/remotes/origin/main` after BLOCK-TEXT-ORDER-1 merges (Brain1's merge order). Push with `HEAD:refs/heads/eb/deps-refresh-1`.
- **Staging:** exact paths: `package-lock.json`, `docs/governance/DEPENDENCY_ADVISORIES.md`, `docs/governance/close-outs/Memo.DEPS-REFRESH-1.GovernanceStaging.<date>.md` and `docs/governance/close-outs/Timing.DEPS-REFRESH-1.jsonl`. Never stage `tests/perf-baseline-results.json`.
- **Merge:** `--no-ff`, on Blurby.Brain1's package confirmation and Blurby.Roadmap's merge go.
- **Lane ownership:** surface D. **Forbidden during a parallel run:** every source file. **Shared-core touches:** none. **Merge order:** third in Brain1's release set, after the ERROR-LOG fix and BLOCK-TEXT-ORDER-1.

##### Task list

| # | Task | Class | Kind | Tier | Effort | Estimate | Timebox | Group |
|---|---|---|---|---|---|---|---|---|
| 1 | Advisory fix applied under the ruled command, pins unchanged | calculable | dependency-refresh | mechanical | low | 10m | — | — |
| 2 | Advisories document re-dated and classified | calculable | governance-doc | bounded | medium | 20m | — | — |
| 3 | Suite, typecheck and build pass | calculable | verify-gate | mechanical | low | 10m | — | — |
| 4 | Package verified | calculable | live-check | bounded | medium | 20m | — | — |
| 5 | Memo, time log and push | calculable | merge-and-docs | mechanical | low | 5m | — | — |

**Total:** chain 1h05m · sum 1h05m; 0 of 5 estimated tasks calibrated

##### Lessons applied

- **Standing rule 53:** the lockfile ships, so the item carries a package check.
- **LL-142:** the counts above were measured on a real run of the command, not taken from the ruling's figure.
