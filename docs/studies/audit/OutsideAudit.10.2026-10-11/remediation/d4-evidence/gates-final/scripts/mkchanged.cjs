// Scratch repositories for the commands that changed since the previous replay, and per-shell gate lists that run each
// one verbatim (placeholders replaced by scratch values): Done-when 12's path order, git rm and git rm -r, the push and
// its post-push check on the memo's merge sha, the branch worktree's symbolic-ref check, step 3 (B)'s dirt listing
// (git status --porcelain --untracked-files=all) and the C4-correction match rule (cat-file, hash-object, rev-parse).
// Read-only on the worktree: content comes from the b4335606 blobs through git show.
// usage (from the run dir): node mkchanged.cjs <worktree, Windows path> <run dir, Windows path> <run dir, POSIX path>
const fs = require("fs"), path = require("path"), cp = require("child_process");
const [wtW, runW, runP] = process.argv.slice(2);
const BASE = "b4335606", SHELLS = ["pwsh7", "ps51", "bash"];
const SUBJECT = "Merge eb/narrate-remove-1: NARRATE-REMOVE-1 (Narrate removed, Kokoro dormant)";
const { rows } = JSON.parse(fs.readFileSync("out/commands.json", "utf8"));
const by = Object.fromEntries(rows.map((r) => [r.id, r]));
const spec = (id, raw) => { const r = by[id]; if (!r || r.raw !== raw) throw new Error(`inventory id ${id} is not ${raw}: ${r && r.raw}`); return r; };
// Fixed identity and dates, so every scratch sha is the same on every run.
const CFG = ["-c", "user.name=gate-replay", "-c", "user.email=gate-replay@example.invalid", "-c", "commit.gpgsign=false"];
const ENV = { ...process.env, GIT_AUTHOR_DATE: "2026-10-12T00:00:00Z", GIT_COMMITTER_DATE: "2026-10-12T00:00:00Z" };
const git = (cwd, ...a) => cp.execFileSync("git", [...CFG, ...a], { cwd, env: ENV, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const blob = (f) => cp.execFileSync("git", ["show", `${BASE}:${f}`], { cwd: wtW, maxBuffer: 1 << 26 });
const lsTree = (...p) => git(wtW, "ls-tree", "-r", "--name-only", BASE, "--", ...p).split("\n").filter(Boolean);
const put = (dir, f, data) => { const t = path.join(dir, f); fs.mkdirSync(path.dirname(t), { recursive: true }); fs.writeFileSync(t, data); };
const at = (...p) => ({ w: path.win32.join(runW, "chg", ...p), p: path.posix.join(runP, "chg", ...p), rel: ["chg", ...p].join("/") });
const ATTR = blob(".gitattributes"); // the repository's own (* text=auto eol=lf), so hashing and diffs see the same conversion
const repo = (dir) => { fs.mkdirSync(dir, { recursive: true }); git(dir, "init", "-q", "-b", "main"); put(dir, ".gitattributes", ATTR); return dir; };
const commitAll = (dir, msg) => { git(dir, "add", "-A"); git(dir, "commit", "-q", "-m", msg); return git(dir, "rev-parse", "HEAD"); };
const lists = Object.fromEntries(SHELLS.map((s) => [s, []])); const listing = [];
// One gate per shell; dirOf(shell) gives its working directory (the same tree for read-only gates, a copy per shell otherwise).
const add = (id, row, label, cmd, dirOf) => {
  for (const s of SHELLS) { const d = dirOf(s); lists[s].push({ id, inv: row.id, line: row.line, label, cmd, cwdW: d.w, cwdP: d.p }); }
  listing.push({ id, inv: row.id ?? null, line: row.line, label, cwd: dirOf("<shell>").rel, cmd: cmd.split(runW).join("<run>") });
};
const meta = {};

// 1. Done-when 12: the three ModeRuntime.ts files changed at their Edit-site anchors; git prints them in byte order.
const o = at("dw12", "repo"); repo(o.w);
for (const f of lsTree("src/reader/modes/page", "src/reader/modes/focus", "src/reader/modes/flow")) put(o.w, f, blob(f));
commitAll(o.w, "base: src/reader/modes/{page,focus,flow} at b4335606");
git(o.w, "update-ref", "refs/remotes/origin/main", "HEAD");
git(o.w, "switch", "-q", "-c", "eb/narrate-remove-1");
for (const m of ["page", "focus", "flow"]) { // Edit sites: drop the ttsRate/ttsEngine/ttsVoiceName config entries
  const f = path.join(o.w, "src/reader/modes", m, "ModeRuntime.ts"), t = fs.readFileSync(f, "utf8").split("\n");
  const u = t.filter((l) => !/^\s*tts(Rate|Engine|VoiceName):/.test(l));
  if (t.length - u.length !== 3) throw new Error(`expected 3 tts* config lines in ${m}/ModeRuntime.ts`);
  fs.writeFileSync(f, u.join("\n"));
}
commitAll(o.w, "NARRATE-REMOVE-1 C2: scratch");
const dw = spec(34, "git diff --name-only refs/remotes/origin/main -- src/reader/modes/page src/reader/modes/focus src/reader/modes/flow");
const snap = fs.readFileSync("ROADMAP.snapshot.md", "utf8").split("\n");
const said = /prints exactly (.*?), in that order/.exec(snap[dw.line - 1]);
if (!said) throw new Error("Done-when 12 statement not found at its line");
meta.dw12Stated = [...said[1].matchAll(/`([^`]+)`/g)].map((x) => x[1]);
add("o1", dw, "Done-when 12 diff after the Edit-site changes", dw.substituted, () => o);

// 2. Staging plan: git rm <path> for a deleted file, git rm -r <path> for a deleted directory (Delete-list paths at b4335606).
const DIRS = ["src/reader/modes/narrate/", "src/hooks/narration/", "src/utils/audio/", "tests/fixtures/narration/", "tests/fixtures/tts-normalization/"];
const FILES = ["src/hooks/useNarration.ts", "src/reader/modes/NarrateModeAdapter.ts"], KEEP = "src/utils/ttsEvalTrace.ts";
for (const s of SHELLS) {
  const d = at("rm", s, "repo"); repo(d.w);
  for (const f of [...lsTree(...DIRS.map((x) => x.slice(0, -1))), ...FILES, KEEP]) put(d.w, f, blob(f));
  commitAll(d.w, "base: Delete-list sample at b4335606");
}
meta.rmKeep = [".gitattributes", KEEP];
const rmd = (s) => at("rm", s, "repo");
const rm = spec(52, "git rm <path>"), rmr = spec(53, "git rm -r <path>"), lsf = spec(123, "git ls-files");
add("m1", rm, "control: git rm without -r on a Delete-list directory", rm.raw.replace("<path>", DIRS[2]), rmd);
FILES.forEach((f, i) => add(`m${2 + i}`, rm, "git rm of a Delete-list file", rm.raw.replace("<path>", f), rmd));
DIRS.forEach((x, i) => add(`m${4 + i}`, rmr, "git rm -r of a Delete-list directory", rmr.raw.replace("<path>", x), rmd));
add("m9", lsf, "check: what the index still lists", lsf.raw, rmd);

// 3. Integration: push from the merge worktree, then git fetch origin and the ancestor check on the integration merge sha
// the staging memo records. A local bare repository is the remote. ok = the prescribed run; wrongdir = the push (a no-op)
// and the post-push check run from the primary checkout; rejected = origin/main moved.
meta.push = {};
for (const s of SHELLS) for (const k of ["ok", "wrongdir", "rejected"]) {
  const d = at("push", s, k); fs.mkdirSync(d.w, { recursive: true });
  const origin = path.win32.join(d.w, "origin.git"), primary = path.win32.join(d.w, "primary"), merge = path.win32.join(d.w, "merge");
  git(d.w, "init", "-q", "--bare", "-b", "main", "origin.git");
  repo(primary); put(primary, "README.md", "base\n"); commitAll(primary, "base");
  git(primary, "remote", "add", "origin", origin.replace(/\\/g, "/"));
  git(primary, "push", "-q", "origin", "main"); git(primary, "fetch", "-q", "origin");
  git(primary, "switch", "-q", "-c", "eb/narrate-remove-1");
  for (let n = 1; n <= 5; n++) { put(primary, `c${n}.txt`, `C${n}\n`); commitAll(primary, `NARRATE-REMOVE-1 C${n}: scratch`); }
  git(primary, "switch", "-q", "main");
  git(primary, "worktree", "add", "-q", "--detach", merge, "refs/remotes/origin/main");
  git(merge, "merge", "-q", "--no-ff", "-m", SUBJECT, "refs/heads/eb/narrate-remove-1");
  if (k === "rejected") {
    git(d.w, "clone", "-q", origin, "other"); const other = path.win32.join(d.w, "other");
    put(other, "moved.txt", "main moved during the run\n"); commitAll(other, "main moved"); git(other, "push", "-q", "origin", "HEAD:refs/heads/main");
  }
  meta.push[`${s}/${k}`] = { origin, merge, mergeHead: git(merge, "rev-parse", "HEAD") };
}
const push = spec(79, "git push origin HEAD:refs/heads/main"), fetch = spec(80, "git fetch origin");
const anc = spec(81, "git merge-base --is-ancestor <merge sha> refs/remotes/origin/main");
// Fixed identity and dates make the scratch merge the same commit in every copy, so one command serves every shell.
const MS = [...new Set(Object.values(meta.push).map((x) => x.mergeHead))];
if (MS.length !== 1) throw new Error("scratch merge shas differ across copies: " + MS.join(", "));
meta.mergeSha = MS[0];
const ancCmd = anc.raw.replace("<merge sha>", MS[0]);
const OLDANC = "git merge-base --is-ancestor HEAD refs/remotes/origin/main"; // control: the form this revision replaced
const pd = (k, w) => (s) => at("push", s, k, w);
add("p1", push, "ok: push from the merge worktree", push.raw, pd("ok", "merge"));
add("p2", fetch, "ok: post-push fetch", fetch.raw, pd("ok", "merge"));
add("p3", anc, "ok: post-push check on the merge sha", ancCmd, pd("ok", "merge"));
add("p4", push, "wrongdir: push run from the primary checkout", push.raw, pd("wrongdir", "primary"));
add("p5", fetch, "wrongdir: post-push fetch, also from the primary checkout", fetch.raw, pd("wrongdir", "primary"));
add("p6", anc, "wrongdir: post-push check on the merge sha, from the primary checkout", ancCmd, pd("wrongdir", "primary"));
add("p6m", anc, "wrongdir: the same check in the merge worktree", ancCmd, pd("wrongdir", "merge"));
add("p6x", { id: null, line: anc.line }, "wrongdir: control, the replaced HEAD form run in the primary checkout", OLDANC, pd("wrongdir", "primary"));
add("p7", push, "rejected: push after origin/main moved", push.raw, pd("rejected", "merge"));
add("p8", fetch, "rejected: fetch", fetch.raw, pd("rejected", "merge"));
add("p9", anc, "rejected: post-push check on the merge sha", ancCmd, pd("rejected", "merge"));

// 4. Preamble: the branch worktree's symbolic-ref check, on a worktree on the branch, detached at its tip, and on another branch.
const sr = at("symref"), srRepo = path.win32.join(sr.w, "repo"); repo(srRepo); put(srRepo, "README.md", "base\n"); commitAll(srRepo, "base");
git(srRepo, "branch", "eb/narrate-remove-1"); git(srRepo, "branch", "eb/other");
const wt = (n) => path.win32.join(sr.w, n);
git(srRepo, "worktree", "add", "-q", wt("nr1-branch"), "eb/narrate-remove-1");
git(srRepo, "worktree", "add", "-q", "--detach", wt("nr1-detached"), "eb/narrate-remove-1");
git(srRepo, "worktree", "add", "-q", wt("nr1-other"), "eb/other");
const REAL = "C:\\Projects\\Blurby\\.worktrees\\narrate-remove-1";
const sym = spec(85, `git -C ${REAL} symbolic-ref -q HEAD`);
for (const [id, n, label] of [["s1", "nr1-branch", "on eb/narrate-remove-1"], ["s2", "nr1-detached", "detached at the branch tip"], ["s3", "nr1-other", "on eb/other"]])
  add(id, sym, `symbolic-ref check, worktree ${label}`, sym.raw.replace(REAL, () => wt(n)), () => sr);

// 5. Step 3 (B): the dirt listing (git status --porcelain --untracked-files=all) and the unfinished C4 correction's
// "already matches <base>" rule, one shape of correction per path. rdir/ is a directory C4 deleted and the correction
// restored untracked: the listing names its files one by one, and each is judged on its own.
const ho = at("hashobj", "repo"); repo(ho.w);
const B = (n) => `${n} base line 1\n${n} base line 2\n`;
const AT_BASE = ["keep.txt", "m.txt", "m2.txt", "m3.txt", "crlf.txt", "d.txt", "d2.txt", "x.txt"];
for (const n of AT_BASE) put(ho.w, n, B(n));
const RDIR = ["rdir/f1.txt", "rdir/f2.txt"]; // a directory deleted in C4 and restored untracked
for (const n of RDIR) put(ho.w, n, B(n));
meta.baseSha = commitAll(ho.w, "base");
for (const n of ["m.txt", "m2.txt", "m3.txt", "crlf.txt"]) put(ho.w, n, B(n) + "wrong C4 edit\n");
for (const n of ["d.txt", "d2.txt"]) fs.rmSync(path.join(ho.w, n));
fs.rmSync(path.join(ho.w, "rdir"), { recursive: true });
for (const n of ["a.txt", "a2.txt"]) put(ho.w, n, `${n} wrongly added in C4\n`);
meta.c4Sha = commitAll(ho.w, "NARRATE-REMOVE-1 C4: scratch");
put(ho.w, "m.txt", B("m.txt"));                                // modified in C4, restored, unstaged
put(ho.w, "m2.txt", B("m2.txt")); git(ho.w, "add", "m2.txt"); // modified in C4, restored, staged
put(ho.w, "crlf.txt", B("crlf.txt").replace(/\n/g, "\r\n"));   // modified in C4, restored with CRLF endings
put(ho.w, "d.txt", B("d.txt"));                                // deleted in C4, restored, untracked
put(ho.w, "d2.txt", B("d2.txt")); git(ho.w, "add", "d2.txt"); // deleted in C4, restored, staged
fs.rmSync(path.join(ho.w, "a.txt"));                           // added in C4, removed, unstaged
git(ho.w, "rm", "-q", "a2.txt");                               // added in C4, removed with git rm, staged
put(ho.w, "m3.txt", "m3.txt still wrong\n");                   // still differs from base
put(ho.w, "s.txt", "an untracked stray\n");                    // a new stray that base lacks
fs.rmSync(path.join(ho.w, "x.txt"));                           // a base file deleted in the work tree
for (const n of RDIR) put(ho.w, n, B(n));                      // the deleted directory restored, untracked
const PATHS = ["m.txt", "m2.txt", "crlf.txt", "d.txt", "d2.txt", "a.txt", "a2.txt", "m3.txt", "s.txt", "x.txt", ...RDIR];
// Ground truth, independent of git: the path as it stands equals its state at base (text compared after CRLF -> LF).
meta.hashobjDir = ho.w;
const same = (n) => fs.existsSync(path.join(ho.w, n)) && fs.readFileSync(path.join(ho.w, n), "utf8").replace(/\r\n/g, "\n") === B(n);
const IN_BASE = [...AT_BASE, ...RDIR];
meta.truth = Object.fromEntries(PATHS.map((p) => [p, IN_BASE.includes(p) ? same(p) : !fs.existsSync(path.join(ho.w, p))]));
meta.rdirTruth = RDIR.every(same) && fs.readdirSync(path.join(ho.w, "rdir")).length === RDIR.length; // rdir/ as a whole equals base
const cat = spec(110, "git cat-file -e <base>:<path>"), hob = spec(111, "git hash-object -- <path>"), rvp = spec(112, "git rev-parse <base>:<path>");
const st = spec(107, "git status --porcelain --untracked-files=all");
const fill = (raw, p) => raw.replace(/<base>/g, meta.baseSha).replace(/<path>/g, p);
const OLD = "git diff --quiet <base> -- <path>"; // control: the match rule round 2 replaced (round-1 inventory id 106)
const OLDST = "git status --porcelain"; // control: the dirt listing this revision replaced (an untracked directory is one entry)
add("h00", st, "check: the dirty paths, one per line", st.raw, () => ho);
add("h00x", { id: null, line: st.line }, "control: the replaced listing", OLDST, () => ho);
PATHS.forEach((p, i) => {
  const k = "h" + String(i + 1).padStart(2, "0");
  add(`${k}c`, cat, `${p}: cat-file`, fill(cat.raw, p), () => ho);
  add(`${k}h`, hob, `${p}: hash-object`, fill(hob.raw, p), () => ho);
  add(`${k}r`, rvp, `${p}: rev-parse`, fill(rvp.raw, p), () => ho);
  add(`${k}q`, { id: null, line: cat.line }, `${p}: control, the replaced diff --quiet rule`, fill(OLD, p), () => ho);
});
add("e01c", cat, "control rdir/, the replaced listing's entry: cat-file", fill(cat.raw, "rdir/"), () => ho);
add("e01h", hob, "control rdir/: hash-object", fill(hob.raw, "rdir/"), () => ho);
add("e01r", rvp, "control rdir/: rev-parse", fill(rvp.raw, "rdir/"), () => ho);

for (const s of SHELLS) fs.writeFileSync(`chg/gates.${s}.json`, JSON.stringify(lists[s], null, 2) + "\n");
fs.writeFileSync("out/changed.gates.json", JSON.stringify(listing, null, 2) + "\n");
fs.writeFileSync("chg/meta.json", JSON.stringify(meta, null, 2) + "\n");
console.log(`changed-command gates: ${listing.length} per shell`);
