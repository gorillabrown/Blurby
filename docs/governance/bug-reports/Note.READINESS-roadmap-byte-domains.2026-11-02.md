# Planning roadmap hashes — explicit byte domains

Paired-domain provenance clarification for the admitted IC-T, T-CONTROL-AUTHOR and F0 packets. Root independently read the published ROADMAP Git blob and reproduced the exact EOL-only mapping; Brain independently checked all three named planning commits and issued PLAN-ROADMAP-EOL-20261102. No source/helper/runtime/cap/clock change, historical receipt rewrite or arbitrary normalization is authorized.

| Domain | Exact SHA256 |
|---|---|
| Published LF ROADMAP Git bytes at b3df6f1b8b06f4a0d80aca86a10de73c3572b56d, d17eb94176c3ed9df2baa589e34ca0654eb912ba, a9ea196261999d2725f47e4ec80c11ab7ea21085 | `f83418c457fbdb96b16d055779d0a443deb6b46540e493680f68fe1c85b85ecc` |
| Planning worktree CRLF ROADMAP bytes, as preserved in current IC/T/F0 U9/U10 Checks | `022253f56437951472c9069cf1f09edf613249508f312c08a392c39479f3c4ac` |

Reproduction reads `git show a9ea196261999d2725f47e4ec80c11ab7ea21085:ROADMAP.md` as raw bytes; published bytes contain no CR. Replacing ONLY each LF byte with CRLF gives exactly022253… and equals the ROADMAP entry in each of the three current protected Check JSON files. Other protected inputs match their published raw bytes; each new packet file was compared working-tree→index byte-for-byte before commit. Source identity, semantic spec content and actual source witnesses are unchanged by the proven EOL mapping.

Those Checks are honest WORKTREE before/after-preservation receipts, not a claim that every protected hash is its published Git-blob hash. Their result/output/current draft hashes remain unchanged. Raw domains must be stated when using them; use f83418… for actual published ROADMAP bytes. Root initially relayed the older f446 worktree value fbdca762… by mistake, corrected it immediately after inspecting current Check rows, and preserves this explicit correction rather than rewriting the old message or frozen files. fbdca762… is NOT this current pair.

Brain's disposition: exact EOL projection closes the discrepancy for these named packets; append the bounded clarification to active-phase accounting/final provenance, preserving original clocks/calls, rather than replaying controls or stopping phases solely for it. No broad reread or new authority. Future checks should explicitly record worktree and published domains. Root's subsequent ordinary B0 component-fold edit is a new roadmap version and will be published with LF; it does not retrospectively alter any named input commit.

Verification command was a read-only Python/hash/Git operation; no module import, application execution or provider mutation. Closed Check JSONs and actual execution receipts remain untouched. The local board report is regenerated after the new ordinary roadmap edit.
