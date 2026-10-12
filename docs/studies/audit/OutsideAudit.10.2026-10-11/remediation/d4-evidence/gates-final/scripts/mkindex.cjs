// Write INDEX.txt for the gates-final evidence folder (run from that folder, after copying a run's out/ here).
// Every count below is read from the outputs, so the index cannot drift from them.
const fs = require("fs"), c = require("crypto"), p = require("path");
const files = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) { const f = p.posix.join(d, e.name); e.isDirectory() ? walk(f) : files.push(f); } };
walk("scripts"); walk("out");
const h = (f) => c.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const rd = (f) => fs.readFileSync(f, "utf8"), lines = (f) => rd(f).trim().split("\n"), last = (f) => lines(f).pop();
const id3 = (r) => String(r.id).padStart(3, "0");
const inv = JSON.parse(rd("out/commands.json")), sec = inv.section.join("-");
const nPh = inv.rows.filter((r) => r.placeholder).length, nRef = inv.rows.filter((r) => r.reference).length;
const parsed = (f) => { const m = /^SUMMARY (\S+) (\S+): (\d+) commands, (\d+) parse errors, (\d+) not single-command$/.exec(last(f)); if (!m) throw new Error("no SUMMARY in " + f); return { ver: m[2], n: +m[3], err: +m[4], multi: +m[5] }; };
const p7 = parsed("out/parse.pwsh7.txt"), p5 = parsed("out/parse.ps51.txt"), r7 = parsed("out/parse-raw-placeholders.pwsh7.txt"), r5 = parsed("out/parse-raw-placeholders.ps51.txt");
const argv = lines("out/argv.compare.txt"), argvN = (/identical argv for all (\d+) commands/.exec(argv[0]) || [])[1] ?? "NOT all", argvIds = argv.slice(2);
const bs = inv.rows.filter((r) => /C:\\/.test(r.raw)).map(id3), amp = inv.rows.filter((r) => r.raw.startsWith("& ")).map(id3);
const argvOnlyBs = argvIds.length === bs.length && argvIds.every((x) => bs.includes(x));
const env = rd("out/environment.txt"), head = /worktree HEAD ([0-9a-f]{40})/.exec(env)[1], origin = /origin\/main ([0-9a-f]{40})/.exec(env)[1];
const codeDiff = /\(src main main\.js preload\.js package\.json \.github tests\): (\d+)/.exec(env)[1];
const vers = { pwsh: /^pwsh (.*)$/m.exec(env)[1], ps: /^powershell\.exe (.*)$/m.exec(env)[1], bash: /^GNU bash, version (\S+)/m.exec(env)[1], git: /^git version (.*)$/m.exec(env)[1], node: /^node (.*)$/m.exec(env)[1] };
const pc = lines("out/positive-controls.result.txt").filter((l) => /stated=\d+/.test(l));
const pcCounts = pc.map((l) => /bash exit=\d+ lines=(\d+)/.exec(l)[1]);
const pcAll = pc.every((l) => /; MATCH$/.test(l)) ? "exit 0, empty stderr, the stated counts, in all three shells" : "MISMATCH (see the result file)";
const wiring = lines("out/wiring.result.txt"), verdicts = wiring.filter((l) => /^ {2}VERDICT /.test(l)).map((l) => l.trim().replace(/^VERDICT /, ""));
const chg = lines("out/changed.result.txt"), chgSum = chg.pop(), sections = [];
for (const l of chg) { if (l.startsWith("== ")) sections.push({ t: l.slice(3), m: 0, x: 0 }); else if (/^ {2}MATCH /.test(l)) sections.at(-1).m++; else if (/^ {2}MISMATCH /.test(l)) sections.at(-1).x++; }
const controls = chg.filter((l) => /^ {2}control: /.test(l)).map((l) => l.trim());
const delta = lines("out/commands.delta.txt"), dPrev = /sha256 ([0-9a-f]{8})[0-9a-f]{56}, (\d+) commands/.exec(delta[0]);
const dNow = /; (\d+ unchanged, \d+ added, \d+ removed)$/.exec(delta[1]);
const closure = lines("out/closure-check.txt"), closureOk = closure.filter((l) => l === "exit=0").length === 4 && closure.filter((l) => /^self-test: 7\/7/.test(l)).length === 2 && closure.filter((l) => l === "dangling relative imports: 0").length === 2;
const desc = {
  "scripts/run-gates-final.sh": "driver: bash run-gates-final.sh <worktree> <fresh run dir>; reproduces every file under out/ (read-only on the worktree)",
  "scripts/extract.cjs": "extracts every inline-code command from the NARRATE-REMOVE-1 section; substitutes placeholders",
  "scripts/parse.ps1": "PowerShell parser check (run under pwsh 7 and Windows PowerShell 5.1)",
  "scripts/echo.cjs": "prints the argv a shell delivers (programs replaced, nothing executed)",
  "scripts/mkecho.cjs": "builds the per-shell argv-echo scripts",
  "scripts/mkgates.cjs": "builds the gate lists from the inventory ids",
  "scripts/mkrunner.cjs": "writes per-shell runners that execute each gate verbatim, capturing stdout, stderr and exit (a gate may name its own directory)",
  "scripts/readres.cjs": "decodes captures (UTF-8, or UTF-16LE from Windows PowerShell 5.1)",
  "scripts/evalpc.cjs": "judges step 4 positive controls against the stated counts",
  "scripts/evalpcu.cjs": "byte comparison of UTF-8-console PowerShell reruns with bash",
  "scripts/apply-variants.cjs": "scratch application of the Edit-site text to the b4335606 blobs: base, prescribed, three wrong variants, five supplementary variants",
  "scripts/evalwiring.cjs": "judges Done-when 7 wiring gates against the stated outputs and the dry-run paragraph",
  "scripts/evalsimple.cjs": "tabulates the supplementary gate lists",
  "scripts/mkchanged.cjs": "scratch repos (b4335606 blobs, fixed commit dates) and per-shell gate lists for the commands changed since the previous replay",
  "scripts/evalchanged.cjs": "judges the changed-command gates against the ROADMAP's statements, per shell",
  "scripts/delta.cjs": "inventory delta against the previous replay (its commands.json as committed at HEAD)",
  "scripts/hygiene.cjs": "UTF-8 / LF / trailing-whitespace check",
  "scripts/mkindex.cjs": "writes this index; every count in it is read from out/",
  "out/environment.txt": "tool versions, worktree HEAD and origin/main",
  "out/roadmap.sha256.txt": "sha256 of ROADMAP.md at the start and end of the replay, and of the section text",
  "out/roadmap-section.snapshot.txt": `the NARRATE-REMOVE-1 section text replayed (ROADMAP.md lines ${sec})`,
  "out/commands.json": `command inventory: ${inv.count} inline-code commands with line, zone, raw and substituted text`,
  "out/commands.tsv": "command inventory (tabular)",
  "out/commands.raw.txt": "raw commands, one per line",
  "out/commands.substituted.txt": "commands with placeholders substituted, one per line",
  "out/commands.delta.txt": "commands added and removed since the previous replay, and the gates that run each added one",
  "out/parse.pwsh7.txt": `parse result, PowerShell ${p7.ver}: ${p7.n} commands, ${p7.err} errors, ${p7.multi} not a single command`,
  "out/parse.ps51.txt": `parse result, Windows PowerShell ${p5.ver}: ${p5.n} commands, ${p5.err} errors, ${p5.multi} not a single command`,
  "out/parse-raw-placeholders.pwsh7.txt": `control: unsubstituted <placeholders> give ${r7.err} parse errors (the < operator)`,
  "out/parse-raw-placeholders.ps51.txt": `control: the same in Windows PowerShell 5.1 (${r5.err})`,
  "out/argv.pwsh7.txt": `argv delivered by pwsh 7 for ${argvN} commands (the & call excluded)`,
  "out/argv.ps51.txt": "argv delivered by Windows PowerShell 5.1",
  "out/argv.bash.txt": "argv delivered by bash",
  "out/argv.compare.txt": `pwsh 7 = 5.1 for all ${argvN}; bash differs only on ${argvIds.join(", ")}${argvOnlyBs ? ", the backslash worktree paths, which run in pwsh only" : " (NOT exactly the backslash worktree paths)"}`,
  "out/positive-controls.gates.json": "step 4 positive controls (8) plus 4 informational Done-when checks",
  "out/positive-controls.result.txt": `${pcCounts.length} positive controls: ${pcCounts.join(", ")} lines; ${pcAll}`,
  "out/positive-controls.stdout.pwsh7.txt": "verbatim pwsh 7 stdout (JSON lines; non-ASCII shows the default console decoding)",
  "out/positive-controls.stdout.ps51.txt": "verbatim Windows PowerShell 5.1 stdout (JSON lines)",
  "out/positive-controls.stdout.bash.txt": "bash stdout (JSON lines)",
  "out/positive-controls.utf8-console-check.txt": "with a UTF-8 console encoding, PowerShell stdout is byte-identical to bash",
  "out/base-blobs.sha256": "sha256 of the b4335606 blobs used as the base",
  "out/variants.json": "variant definitions",
  "out/variants.diff": "each scratch tree against the base (diff -U0)",
  "out/wiring.gates.json": "Done-when 7 wiring gates g1-g7 plus two controls without -w",
  "out/wiring.result.txt": "per-tree verdicts: base matches the dry-run paragraph; prescribed prints every stated line; every wrong variant fails at least one gate",
  "out/wiring.raw-by-shell.txt": "every wiring gate result per tree and shell",
  "out/changed.gates.json": "the changed-command gates: inventory id, ROADMAP line, scratch directory and command (scratch root shown as <run>)",
  "out/changed.result.txt": "per-shell verdicts for the changed commands against the ROADMAP's statements",
  "out/changed.raw-by-shell.txt": "every changed-command gate result per shell (scratch root shown as <run>)",
  "out/constants-family.gates.json": "constants-family statements (src/constants.ts paragraph of Edit sites)",
  "out/constants-family.result.txt": "literal NARRATE_SPEED_* exits 1; the expansion lists 3 names; ReaderSpeedDialog.tsx:8-9 import two of them",
  "out/closure-check.txt": "the spec closure check, extracted verbatim: self-test 7/7 and dangling relative imports: 0, exit 0, in pwsh 7 and 5.1",
  "out/gate-rule.gates.json": "gate-rule exit-semantics controls",
  "out/gate-rule.result.txt": "no-match grep exits 1; empty ls-files/diff exit 0; bad pattern and bad ref exit 128 with stderr; same exits in all shells",
  "out/adjacency.gates.json": "control: g5 and g7 without -A1/-B1 (the earlier one-line forms)",
  "out/adjacency-proposal.result.txt": "control: the one-line forms print one line on the prescribed tree and on both adjacency variants alike; only the -A1/-B1 forms the spec uses show the adjacency",
};
const miss = files.filter((f) => !desc[f]);
if (miss.length) throw new Error("undescribed: " + miss.join(", "));
const L = [
  "OutsideAudit.10 D4 follow-up: final-command gate replay for ROADMAP.md NARRATE-REMOVE-1",
  "",
  ...lines("out/roadmap.sha256.txt"),
  `Worktree: eb/outside-audit-10-remediation @ ${head.slice(0, 8)} plus uncommitted docs; ${codeDiff} code paths differ from b4335606. refs/remotes/origin/main is ${origin.slice(0, 8)},`,
  "which differs from b4335606 only in ROADMAP.md. The wiring and changed-command trees are built from the b4335606 blobs.",
  `Shells: PowerShell ${vers.pwsh}, Windows PowerShell ${vers.ps}, GNU bash ${vers.bash} (msys); git ${vers.git}; node ${vers.node}.`,
  "Scope: read-only on the worktree. No npm ci, typecheck, test or build ran; the npm and smoke commands were parsed and argv-echoed only.",
  "The wiring and changed-command gates ran on scratch git repositories outside the repository; git commit, merge, push and fetch ran only",
  "there, with a local bare repository standing in for origin. Nothing used the network.",
  "",
  "Results",
  `1. Inventory: ${inv.count} inline-code commands in the section (${nPh} with placeholders; ${nRef} prose reference with an ellipsis).`,
  `   Against the previous replay (ROADMAP ${dPrev[1]}, ${dPrev[2]} commands): ${dNow[1]}; out/commands.delta.txt names each and the gates that run it.`,
  `2. Parsers: ${p7.err} parse errors and ${p7.n - p7.multi} single commands of ${p7.n} in PowerShell ${p7.ver}; ${p5.err} and ${p5.n - p5.multi} of ${p5.n} in Windows PowerShell ${p5.ver}`,
  `   (placeholders substituted). Unsubstituted, ${r7.err} (pwsh 7) and ${r5.err} (5.1) fail on the < operator, as the spec warns.`,
  `3. Argv: pwsh 7 and 5.1 deliver identical argv for all ${argvN} runnable commands (step 2's & call, ${amp.join(", ")}, is not echoed); bash differs on`,
  `   ${argvIds.join(", ")}: ${argvOnlyBs ? `exactly the ${bs.length} backslash worktree paths, which run in pwsh only` : `NOT exactly the backslash worktree paths (${bs.join(", ")})`}.`,
  `4. Step 4 positive controls on the worktree: ${pcCounts.join(", ")} lines; ${pcAll}.`,
  `5. Done-when 7 wiring gates (${last("out/wiring.result.txt").replace(/^SUMMARY wiring: /, "")}):`,
  ...verdicts.map((v) => `   - ${v}`),
  "   Base and prescribed outputs, per gate: out/wiring.result.txt. Without -w the renamed helper would pass g1 and g2 (controls x1, x2).",
  `6. Commands changed since the previous replay, run verbatim in all three shells on scratch repositories (${chgSum.replace(/^SUMMARY changed commands: /, "")}):`,
  ...sections.map((s) => `   - ${s.t}: ${s.m} match${s.x ? `, ${s.x} MISMATCH` : ""}`),
  ...controls.map((c) => `   - ${c}`),
  `7. Supplementary: closure check ${closureOk ? "self-test 7/7 and 0 dangling imports, exit 0, in pwsh 7 and 5.1" : "NOT as stated (see out/closure-check.txt)"}; the constants-family statements and`,
  "   the gate-rule exit codes: out/constants-family.result.txt and out/gate-rule.result.txt.",
  "",
  "Observations (not stated outputs)",
  ...(chg.filter((l) => /^ {2}info bash s\d exit=128 /.test(l)).length === 3
    ? ["- In bash the symbolic-ref check's backslash path is mangled and git exits 128 (s1-s3); the recipe runs that check in pwsh."]
    : chg.filter((l) => /^ {2}info bash s\d /.test(l)).map((l) => "- " + l.trim())),
  "- The earlier one-line forms of g5 and g7 print a single line on supp-main-no-save and supp-state-misplaced as on the prescribed tree",
  "  (out/adjacency-proposal.result.txt); the -A1/-B1 forms the spec uses show the adjacency in their output.",
  "- With PowerShell's default console encoding, non-ASCII hit lines display as mojibake; exit codes and counts are unaffected.",
  "- Windows PowerShell 5.1 wraps redirected native stderr in error records; exit codes are unaffected.",
  "",
  "Files (sha256)",
  ...files.map((f) => `${h(f)}  ${f}  ${desc[f]}`),
];
fs.writeFileSync("INDEX.txt", L.join("\n") + "\n");
console.log(`INDEX.txt: ${files.length} files`);
