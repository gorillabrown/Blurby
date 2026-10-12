// Judge the changed-command gates (mkchanged.cjs) per shell against the ROADMAP's statements; dump every raw result.
const fs = require("fs"), path = require("path"), cp = require("child_process");
const read = require("./readres.cjs");
const SHELLS = ["pwsh7", "ps51", "bash"], PS = ["pwsh7", "ps51"];
const meta = JSON.parse(fs.readFileSync("chg/meta.json", "utf8"));
const gates = JSON.parse(fs.readFileSync("out/changed.gates.json", "utf8"));
const R = Object.fromEntries(SHELLS.map((s) => [s, Object.fromEntries(gates.map((g) => [g.id, read(`res/chg-${s}`, g.id)]))]));
const L = []; let checks = 0, problems = 0;
const judge = (label, ok) => { checks++; if (!ok) problems++; L.push(`  ${ok ? "MATCH" : "MISMATCH"} ${label}`); };
const first = (e) => (e ? JSON.stringify(e.split(/\r?\n/).find((l) => l.trim()) ?? "") : "empty");
const fmt = (r) => `exit=${r.exit} stdout=${JSON.stringify(r.out)} stderr=${first(r.err)}`;
// Windows PowerShell 5.1 wraps native stderr in error records, so stderr is compared as empty or not.
const key = (r) => JSON.stringify([r.exit, r.out, r.err === ""]);
const identical = (id, shells) => shells.every((s) => key(R[s][id]) === key(R[shells[0]][id]));
const each = (fn) => SHELLS.forEach((s) => fn(s, R[s]));
const head = (dir, ref) => cp.execFileSync("git", ["-C", dir, "rev-parse", ref], { encoding: "utf8" }).trim();

L.push("== Done-when 12 path order (ROADMAP states, in that order: " + meta.dw12Stated.join(", ") + ")");
each((s, r) => judge(`${s} o1 ${fmt(r.o1)}`, r.o1.exit === 0 && r.o1.err === "" && JSON.stringify(r.o1.out) === JSON.stringify(meta.dw12Stated)));
judge("o1 identical in all three shells", identical("o1", SHELLS));

L.push("== Staging plan: git rm <path> for a file, git rm -r <path> for a directory (a copy of the scratch repo per shell)");
each((s, r) => {
  judge(`${s} m1 control, git rm without -r on a directory: exit 128 with 'recursively without -r' (${fmt(r.m1)})`, r.m1.exit === 128 && /recursively without -r/.test(r.m1.err));
  for (const id of ["m2", "m3", "m4", "m5", "m6", "m7", "m8"]) judge(`${s} ${id} exit 0, ${r[id].out.length} rm lines (${gates.find((g) => g.id === id).cmd})`, r[id].exit === 0 && r[id].out.length > 0);
  judge(`${s} m9 the index lists only ${meta.rmKeep.join(", ")} (${fmt(r.m9)})`, r.m9.exit === 0 && JSON.stringify(r.m9.out) === JSON.stringify(meta.rmKeep));
});
for (const id of ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"]) judge(`${id} identical in all three shells`, identical(id, SHELLS));

L.push("== Integration push and post-push check on the memo's merge sha (a local bare repository as origin; a copy per shell and case)");
each((s, r) => {
  const ok = meta.push[`${s}/ok`], wd = meta.push[`${s}/wrongdir`], rj = meta.push[`${s}/rejected`];
  judge(`${s} ok: push exit ${r.p1.exit}, fetch exit ${r.p2.exit}, check exit ${r.p3.exit}; origin main = the merge: ${head(ok.origin, "refs/heads/main") === ok.mergeHead}`,
    r.p1.exit === 0 && r.p2.exit === 0 && r.p3.exit === 0 && head(ok.origin, "refs/heads/main") === ok.mergeHead);
  judge(`${s} wrongdir: push from the primary checkout exit ${r.p4.exit} (${first(r.p4.err)}); the check exits ${r.p6.exit} there and ${r.p6m.exit} in the merge worktree -> (C) from either folder; origin main = the merge: ${head(wd.origin, "refs/heads/main") === wd.mergeHead}`,
    r.p4.exit === 0 && /Everything up-to-date/.test(r.p4.err) && r.p5.exit === 0 && r.p6.exit === 1 && r.p6m.exit === 1 && head(wd.origin, "refs/heads/main") !== wd.mergeHead);
  judge(`${s} wrongdir control: the replaced HEAD form, run in the primary checkout, exits ${r.p6x.exit}, a false pass the merge sha removes`, r.p6x.exit === 0);
  judge(`${s} rejected: push exit ${r.p7.exit} (${/rejected/.test(r.p7.err) ? "rejected" : first(r.p7.err)}) -> (C); fetch exit ${r.p8.exit}; check exit ${r.p9.exit}`,
    r.p7.exit === 1 && /rejected/.test(r.p7.err) && r.p8.exit === 0 && r.p9.exit === 1 && head(rj.origin, "refs/heads/main") !== rj.mergeHead);
});
for (const id of ["p1", "p2", "p3", "p4", "p5", "p6", "p6m", "p6x", "p7", "p8", "p9"]) judge(`${id} exit and stdout identical in all three shells`, identical(id, SHELLS));

L.push("== Preamble symbolic-ref check (the recipe runs it in pwsh; the backslash path does not survive bash)");
PS.forEach((s) => {
  const r = R[s];
  judge(`${s} s1 on the branch prints refs/heads/eb/narrate-remove-1 (${fmt(r.s1)})`, r.s1.exit === 0 && r.s1.err === "" && JSON.stringify(r.s1.out) === '["refs/heads/eb/narrate-remove-1"]');
  judge(`${s} s2 detached prints nothing, exit 1 -> fails the check (${fmt(r.s2)})`, r.s2.exit === 1 && r.s2.err === "" && r.s2.out.length === 0);
  judge(`${s} s3 another branch prints ${JSON.stringify(r.s3.out)} -> fails the check`, r.s3.exit === 0 && r.s3.err === "" && JSON.stringify(r.s3.out) === '["refs/heads/eb/other"]');
});
for (const id of ["s1", "s2", "s3"]) judge(`${id} identical in pwsh 7 and 5.1`, identical(id, PS));
for (const id of ["s1", "s2", "s3"]) L.push(`  info bash ${id} ${fmt(R.bash[id])} (backslash path, pwsh only as stated)`);

L.push("== Step 3 (B) dirt listing and the unfinished C4 correction's 'already matches <base>' (base " + meta.baseSha + ")");
L.push("  dirty paths (h00, git status --porcelain --untracked-files=all): " + JSON.stringify(R.bash.h00.out));
const PATHS = Object.keys(meta.truth); const oldMisses = new Set();
// The listing names every corrected path on its own line, rdir/'s two files included, and no directory entry.
const listed = (r) => r.out.map((l) => l.slice(3));
each((s, r) => judge(`${s} h00 exit ${r.h00.exit}: each of the ${PATHS.length} dirty paths on its own line, no directory entry`,
  r.h00.exit === 0 && r.h00.err === "" && JSON.stringify([...listed(r.h00)].sort()) === JSON.stringify([...PATHS].sort()) && !listed(r.h00).some((p) => p.endsWith("/"))));
each((s, r) => PATHS.forEach((p, i) => {
  const k = "h" + String(i + 1).padStart(2, "0"), c = r[`${k}c`], h = r[`${k}h`], v = r[`${k}r`], q = r[`${k}q`];
  const exists = fs.existsSync(path.join(meta.hashobjDir, p));
  const rule = c.exit === 0 ? exists && h.exit === 0 && v.exit === 0 && h.out.length === 1 && h.out[0] === v.out[0] : !exists;
  const old = c.exit === 0 && q.exit === 0;
  if (old !== meta.truth[p]) oldMisses.add(p);
  judge(`${s} ${p}: cat-file exit ${c.exit}; hash-object ${h.exit === 0 ? h.out[0].slice(0, 12) : "exit " + h.exit}; rev-parse ${v.exit === 0 ? v.out[0].slice(0, 12) : "exit " + v.exit}; exists=${exists} -> rule says ${rule ? "matches" : "does not match"}; truth ${meta.truth[p] ? "matches" : "does not match"}${h.err ? "; hash-object stderr " + first(h.err) : ""}`, rule === meta.truth[p]);
}));
for (const g of gates.filter((x) => /^[he]\d/.test(x.id))) judge(`${g.id} identical in all three shells`, identical(g.id, SHELLS));
L.push(`  control: the replaced rule (cat-file -e, then diff --quiet) misclassifies ${[...oldMisses].join(", ") || "nothing"}`);
// Control: the replaced listing (no --untracked-files=all) prints rdir/ as one entry, which the rule cannot hash.
let falseConflict = 0;
each((s, r) => {
  const c = r.e01c, h = r.e01h, entry = r.h00x.out.find((x) => x.slice(3) === "rdir/");
  const ok = r.h00x.exit === 0 && entry === "?? rdir/" && !r.h00x.out.some((x) => x.slice(3).startsWith("rdir/f")) && c.exit === 0 && h.exit === 128 && meta.rdirTruth;
  if (ok) falseConflict++;
  judge(`${s} control: git status --porcelain lists ${JSON.stringify(entry ?? "no rdir/ entry")}; for it cat-file exits ${c.exit} and hash-object ${h.exit} (${first(h.err)}), so the rule says no match although rdir/ equals base`, ok);
});
if (falseConflict === SHELLS.length) L.push("  control: without --untracked-files=all, git status --porcelain lists a restored directory as one entry (?? rdir/) and hash-object exits 128 on it, so the rule would send it to a false (C)");

L.push(`SUMMARY changed commands: ${gates.length} gates x ${SHELLS.length} shells; ${checks} checks; problems=${problems}`);
// The run directory in every spelling git and the shells print (native, JSON-escaped, forward-slash, msys, bash-mangled).
const rw = fs.realpathSync(".");
const forms = [rw.replace(/\\/g, "\\\\"), rw, rw.replace(/\\/g, "/"), "/" + rw[0].toLowerCase() + rw.slice(2).replace(/\\/g, "/"), rw.replace(/\\/g, "")];
const scrub = (t) => forms.reduce((a, f) => a.split(f).join("<run>"), t);
fs.writeFileSync("out/changed.result.txt", scrub(L.join("\n")) + "\n"); console.log(L.join("\n"));
// Windows PowerShell 5.1 decorates redirected native stderr as error records and wraps it mid-line, so its stderr is
// dumped as empty or nonempty; where a verdict reads stderr text, the check above ran on the full capture.
const dump = [];
for (const s of SHELLS) for (const g of gates) { const r = R[s][g.id]; dump.push(`${s} ${g.id} exit=${r.exit} stderr=${!r.err ? "empty" : s === "ps51" ? "nonempty" : JSON.stringify(r.err)} stdout=${JSON.stringify(r.out)}`); }
fs.writeFileSync("out/changed.raw-by-shell.txt", scrub(dump.join("\n")) + "\n");
