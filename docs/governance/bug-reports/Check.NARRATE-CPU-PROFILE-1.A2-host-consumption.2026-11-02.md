# A2 host consumption — initial CPU-8 inputs

Actual completed RodneySR chat turn `01a19e14-b96b-7ab3-891a-9a4d36a49438` was read, including raw command outputs and final receipt, rather than inferred from transport acknowledgement. At2026-11-02T21:06:21.732843Z host consumed governance commit `2f8239628184135a20b5c78fbd93cc03269433e1`.

Remote receipt: `C:/Projects/Blurby-artifacts/cpu-a2-readiness-20261102/receipt.final-input.cpu8.json`; host-reported raw SHA256 `b6ccb288cff59f5a0053e06673629a51db0c1bba5aa9f0edb14eeb44a77de3c6`. This document is a readback assessment, not a byte-identical copy of that JSON.

Input Git blobs match local published objects: ROADMAP `fcd8c327c9a6819ddfc9cb8961cc4aaccf1fe174`; A2 enrichment `4f0d1e3b4e5663d40f2ff3a452ad69368e51ec51`; CPU-8 `1fb365d3cd4c8702e89313d4fd3b0476ad2be019`; amendment `8a25e122fbf3fab1a375b579dcfe66e83b0a8930`. Actual complete card/files read; external host copies preserve each SHA256. Enrichment SHA256 matches independent reviewer `ff173daa2c779bb6554d9871ce5a4947587dd20f745b7dc831af335684b43552`.

Checked Git outputs: HEAD `9dc0f386863b612955f4ed0b3b6cf57a659538ba`; branch `eb/narrate-cpu-profile-1`; commonGitDir `C:/Users/estra/Projects/Blurby/.git`; origin `https://github.com/gorillabrown/Blurby.git`; defaultref `refs/remotes/origin/main`; all exit0/empty stderr. Index/worktree empty, both common/worktree index locks absent, two MJS candidates absent, A2 child artifact root absent. Source was not switched or merged.

A1 test SHA256 `839c528c0a1d109703e29fd2568717308b3a359ab91e33a01f7850e9170b0aea` unchanged. Retained tool hashes: Node `58e74bf02fc5bbacc41dcb8bef089961cd5bddd37830b87784e4fc624d145d1f`, esbuild `cae1bbc86f4df800b01d99e28aea0a154b02243de6797e98f48a9b88a64a7be0`, Vitest entry `39db22f579acf5639bbb17a261408debbde03f4692c0c439e77e7f13aeba74d6`. Installed CLI `node_modules/vitest/dist/chunks/cac.uFydS1Z4.js` line927 statically declares maxWorkers; SHA256 `27cc9365d180bee3da005fe6c4d485868caf9d8f54280759eea28842836af549`. No discovery/version/test command was run.

Process inventory exit0/empty results; no competing worker found, prior workers complete, historical jobs paused/unreconciled. Electron remains unqualified. No A2 execution or clock started.

Subsequent U9 semantic review found atomic/exclusive artifact-persistence requirements (LL-006/097). Brain ruling and revised immutable input consumption must resolve that gap before final Ready; this initial receipt does not accept a future revision.
