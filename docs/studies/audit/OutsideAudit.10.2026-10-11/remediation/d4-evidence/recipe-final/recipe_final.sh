#!/usr/bin/env bash
# recipe_final.sh - replays the FINAL NARRATE-REMOVE-1 reconciliation recipe and integration text against disposable
# git repositories. Source text (ROADMAP.md; sha256 in ROADMAP.sha256.txt): Done-when 15 and 16 (lines 303-316), D14
# (384-387), Staging plan incl. "Corrections after C4" and Wave C integration (623-651), Failure handling's exception
# rule (653), and "Repository reconciliation - run this FIRST" with its run-worktree rule, steps 1-4 and the scenario
# walk-through (666-715). This revision mirrors the fix-round-2 text: Wave C integration's folders (fetch, commit check
# and the merge worktree's existence check from the primary checkout, everything else in the merge worktree), the push
# from the merge worktree and its post-push check, the branch worktree's symbolic-ref check (run-worktree rule, and
# before every commit), the re-attach's non-zero exit route and npm ci, the hash-object match to <base>, the Smoke:
# line format, Done-when 15's Exception: line and `git rm -r` for a deleted directory. It also mirrors the Round 2
# check's text: a passing smoke reads the last Smoke: line per check (635, 690), the post-push check names the memo's
# integration merge sha (651), step 3 (B) lists dirt with git status --porcelain --untracked-files=all (687), the
# re-attach names the branch (686) and the "already matches <base>" test runs in the branch worktree (688). Every row
# asserts its outcome token against the token the spec text predicts, and every check asserts one fact; exit 0 only
# when all of them match.
#
# STUBS (they only log and return an exit code): npm ci, npm run typecheck, the Closure check, npm test, npm run build,
# the Task 6 reviews and the owner smoke (Done-when 16). npm test also emulates vitest discovery: a test file marked
# REQUIRES-NORMALIZE fails until main/sync-engine.js contains normalizeReaderModes, so the two C1 positive controls
# fail on the base and pass after C3. Git commands, the Done-when 15 fence check and the step-4 search positive
# controls are real. The spec runs the same git commands in PowerShell 7; this replay runs them in bash.
# Path model: the C1-C5 path sets and the Done-when 15 fence are small stand-ins for the real lists (see constants).
# Smoke record (635): a passing smoke on a sha means that, for each of (a)-(f), the last in-format Smoke: line for that
# sha reads pass; rows SM10, SP, SM11 and SM12 show it, with the earlier "six lines, all pass" reading as a control.
# Usage: ROADMAP=<path to ROADMAP.md> recipe_final.sh <scratch-dir>   (keep <scratch-dir> short on Windows)
set -u
[ -n "${1:-}" ] || { echo "usage: $0 <scratch-dir>"; exit 2; }
# short run names: the deepest memo path must stay under Windows MAX_PATH (260) for MSYS file writes
ROOT="$1"; RUNS="$ROOT/r"; rm -rf "$RUNS"; mkdir -p "$RUNS/home"
export HOME="$RUNS/home" GIT_CONFIG_NOSYSTEM=1 GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
git config --global init.defaultBranch main
git config --global advice.detachedHead false
git config --global core.longpaths true # the scratch path is deep; the real C:\Projects\Blurby\.worktrees paths are short
git config --global core.autocrlf false

B=eb/narrate-remove-1
SUBJ="Merge eb/narrate-remove-1: NARRATE-REMOVE-1 (Narrate removed, Kokoro dormant)"
PERF=tests/perf-baseline-results.json
CO=docs/governance/close-outs
TLOG=$CO/Timing.NARRATE-REMOVE-1.jsonl
MEMO=$CO/Memo.NARRATE-REMOVE-1.GovernanceStaging.2026-10-12.md
T1=tests/settingsMigrationV13.test.js
T2=tests/settingsNarrateNormalization.test.js
FIXD=tests/fixtures/narration/ # a Delete-list directory, removed with git rm -r (Staging plan)
# Staging plan path sets (stand-ins): C1 the two tests, C2 Wave A renderer, C3 main process, C4 tests, C5 memo + time log.
# An entry ending in / is a directory and covers every path under it.
C1P="$T1 $T2"
C2P="src/components/ReaderContainer.tsx src/hooks/useNarration.ts src/reader/modes/page/ModeRuntime.ts"
C3P="main/sync-engine.js"
C4P="tests/narrTiming.test.ts tests/foliate-bridge.test.ts $FIXD"
C5P="$MEMO $TLOG"
C6P="" # n = 5: no next commit, so any other dirt is outside C<n+1>
# Done-when 15 fence: D of Delete list, M of Edit sites, A of the two tests; the staging memo and the time log
DEL="src/hooks/useNarration.ts tests/narrTiming.test.ts $FIXD"
EDIT="src/components/ReaderContainer.tsx src/reader/modes/page/ModeRuntime.ts main/sync-engine.js tests/foliate-bridge.test.ts"
FENCE="$DEL $EDIT $T1 $T2 $MEMO $TLOG"
BASEFILES="src/components/ReaderContainer.tsx src/hooks/useNarration.ts src/reader/modes/page/ModeRuntime.ts src/reader/modes/page/view.ts main/sync-engine.js main/tts-engine.js tests/narrTiming.test.ts tests/foliate-bridge.test.ts tests/ok.test.ts tests/fixtures/narration/a.json tests/fixtures/narration/b.json docs/notes.md main.js preload.js package.json package-lock.json vite.config.js index.html"
ctr=0; ROWS=0; CHECKS=0; FAILS=0

setup() {
  ID=$1; W="$RUNS/$1"; mkdir -p "$W"
  git init -q --bare -b main "$W/origin.git"
  git clone -q "$W/origin.git" "$W/o" 2>/dev/null
  O="$W/o"; WT="$O/.worktrees/narrate-remove-1"; MW="$O/.worktrees/narrate-remove-1-merge"; BW="$O/.worktrees/narrate-remove-1-base"
  local f; for f in $BASEFILES; do mkdir -p "$O/$(dirname "$f")"; echo "base $f" > "$O/$f"; done
  echo '{}' > "$O/$PERF"; printf 'node_modules/\ndist/\n.worktrees/\n' > "$O/.gitignore"; mkdir -p "$O/$CO"; echo x > "$O/$CO/CloseOut.OLD.md"
  git -C "$O" add -A; git -C "$O" commit -qm base; git -C "$O" push -q origin main
  git clone -q "$W/origin.git" "$W/other" 2>/dev/null
  REG="$W/register"; printf 'TEST-TIMEOUT-HEADROOM-1 completed\nLIBRARY-SETTINGS-FIX-1 completed\nEINK-HOVER-FIX-1 completed\nNARRATE-REMOVE-1 Queued\nNARRATE-REBUILD-1 Queued\n' > "$REG"
  LOG="$W/npm.log"; : > "$LOG"
  CI_RC=0; TC_RC=0; TEST_RC=0; BUILD_RC=0; SMOKE=pass; SMOKE2=pass; C4_EXTRA=; QCOUNT=; BASE=; N=; MODE=; RES=; FAILED=
  CC=; WHY=; REATT_RC=; PUSH_RC=; PUSHDIR=
}
advance() { # an unrelated commit lands on origin/main from another clone; $1 optional path to change
  ctr=$((ctr+1)); local f=${1:-u$ctr.txt}
  git -C "$W/other" pull -q --no-rebase origin main
  mkdir -p "$(dirname "$W/other/$f")"; echo "other $ctr" >> "$W/other/$f"; git -C "$W/other" add "$f"; git -C "$W/other" commit -qm "unrelated $ctr"
  git -C "$W/other" push -q origin main
}
say() { RES="$*"; }
om() { git -C "$O" rev-parse refs/remotes/origin/main; }
remote_main() { git -C "$W/origin.git" rev-parse refs/heads/main; } # the true remote state
short() { git -C "$1" rev-parse --short=8 HEAD; }
inlist() { local x=$1 y; shift; for y in "$@"; do [ "$x" = "$y" ] && return 0; case $y in */) [ "${x#"$y"}" != "$x" ] && return 0;; esac; done; return 1; }
listed() { git -C "$O" worktree list | grep -qE "/$1[[:space:]]"; } # is a worktree with this basename registered
# run-worktree rule (preamble): git worktree list --porcelain lists the path, rev-parse --show-toplevel there prints it,
# and for the branch worktree symbolic-ref -q HEAD prints refs/heads/eb/narrate-remove-1. WHY names the check that failed.
is_run_wt() {
  local m; m=$(cygpath -m "$1"); WHY=
  git -C "$O" worktree list --porcelain | grep -qxF "worktree $m" || { WHY="git worktree list --porcelain does not list it"; return 1; }
  [ "$(git -C "$1" rev-parse --show-toplevel 2>/dev/null)" = "$m" ] || { WHY="rev-parse --show-toplevel prints another path"; return 1; }
  [ "$1" != "$WT" ] || [ "$(git -C "$1" symbolic-ref -q HEAD)" = "refs/heads/$B" ] || { WHY="symbolic-ref -q HEAD does not print refs/heads/$B"; return 1; }
}
branch_ok() { [ "$(git -C "$WT" symbolic-ref -q HEAD)" = "refs/heads/$B" ]; } # Staging plan: commit only while this holds
exc() { grep -qF "Exception: $1 — " "${EXCMEMO:-$WT/$MEMO}" 2>/dev/null; } # Failure handling: a path named on an Exception: line
dirty_except() { # $1 dir, rest: paths whose `git status --porcelain` lines are ignored; prints the remaining lines
  # UALL=1 lists each untracked file (--untracked-files=all), as step 3 (B)'s dirt rule does (687)
  local d=$1 l; shift
  while IFS= read -r l; do [ -z "$l" ] && continue; inlist "${l:3}" "$@" || printf '%s\n' "$l"; done <<< "$(git -C "$d" status --porcelain ${UALL:+--untracked-files=all})"
}
memo_merge() { sed -n 's/^Integration: \([0-9a-f]\{40\}\) — .*/\1/p' "$WT/$MEMO" 2>/dev/null | tail -1; } # the integration merge sha the memo records
matches_base() { # step 3 (B), unfinished C4 correction: the dirty path "already matches <base>" (688), in the branch worktree
  if git -C "$WT" cat-file -e "$BASE:$1" 2>/dev/null; then
    [ -f "$WT/$1" ] && [ "$(git -C "$WT" hash-object -- "$1")" = "$(git -C "$WT" rev-parse "$BASE:$1")" ]
  else [ ! -e "$WT/$1" ]; fi
}
old_matches_base() { git -C "$WT" cat-file -e "$BASE:$1" 2>/dev/null && git -C "$WT" diff --quiet "$BASE" -- "$1"; } # the replaced rule (controls only)

# ---- stubs (exit codes only)
npm_ci()        { mkdir -p "$1/node_modules"; echo x > "$1/node_modules/m"; echo "npm ci @$(basename "$1") rc=$CI_RC" >> "$LOG"; return $CI_RC; }
npm_typecheck() { echo "typecheck @$(basename "$1") rc=$TC_RC" >> "$LOG"; return $TC_RC; }
closure()       { echo "closure $2 @$(basename "$1") rc=0" >> "$LOG"; return 0; }
npm_build()     { mkdir -p "$1/dist"; echo built > "$1/dist/x"; echo "build @$(basename "$1") rc=$BUILD_RC" >> "$LOG"; return $BUILD_RC; }
npm_test() { # $1 dir, rest optional test files; rewrites the tracked perf file as tests/perf-baseline.test.ts does
  local d=$1 f files rc=$TEST_RC; shift; FAILED=
  if [ $# -gt 0 ]; then files="$*"; else files=$(cd "$d" && ls tests/*.test.* 2>/dev/null); fi
  for f in $files; do
    [ -f "$d/$f" ] || continue
    if grep -q REQUIRES-NORMALIZE "$d/$f" && ! grep -q normalizeReaderModes "$d/main/sync-engine.js"; then rc=1; FAILED="$FAILED $f"; fi
  done
  echo "{\"run\":$RANDOM}" > "$d/$PERF"
  echo "npm test${1:+ -- $*} @$(basename "$d") rc=$rc${FAILED:+ failed:$FAILED}" >> "$LOG"; return $rc
}
smoke()  { echo "smoke 16(a)-(f) @$(basename "$1") $2" >> "$LOG"; [ "$2" = pass ]; }
task6()  { echo "task6 reviews @$(basename "$1")" >> "$LOG"; }
tlog()   { [ -d "$WT" ] && echo "{\"ev\":\"$1\"}" >> "$WT/$TLOG"; } # standing rule 41 time log, appended throughout
dw15() { # Done-when 15, real: every path of `git diff --name-status refs/remotes/origin/main...HEAD` is inside the fence,
  # or an Exception: line of the staging memo names it (309)
  local d=$1 k p rc=0
  while IFS=$'\t' read -r k p; do
    [ -z "$k" ] && continue
    { inlist "$p" $MEMO $TLOG || case "$k" in D) inlist "$p" $DEL;; M) inlist "$p" $EDIT;; A) inlist "$p" $T1 $T2;; *) false;; esac; } || exc "$p" \
      || { echo "   Done-when 15: $k $p is outside the fence"; rc=1; }
  done <<< "$(git -C "$d" diff --name-status refs/remotes/origin/main...HEAD)"
  echo "dw15 @$(basename "$d") rc=$rc" >> "$LOG"; return $rc
}
dw15_noexc() { local EXCMEMO=/dev/null; dw15 "$WT"; } # control: the same diff with no Exception: line
dw1_14() { local d=$1; npm_typecheck "$d"; closure "$d" --self-test; closure "$d" .; npm_test "$d" && npm_build "$d"; }

# ---- "Where this recipe sits": step 2 (read-only), then the In Flight move
reg() { sed -n "s/^$1 //p" "$REG"; }
gate_and_claim() { # $1 = owner answer if asked (yes|no)
  local p
  for p in TEST-TIMEOUT-HEADROOM-1 LIBRARY-SETTINGS-FIX-1 EINK-HOVER-FIX-1; do
    [ "$(reg $p)" = completed ] || { say STOP2 "step 2 stops ($p=$(reg $p)); item stays $(reg NARRATE-REMOVE-1), nothing written"; return 1; }
  done
  if [ "$(reg NARRATE-REMOVE-1)" = "In Flight" ]; then
    [ "${1:-yes}" = yes ] || { say STOP-OWNER "In Flight and the owner does not confirm: stop before step 3"; return 1; }
  else
    QCOUNT=$(grep -c ' Queued$' "$REG"); sed -i 's/^NARRATE-REMOVE-1 .*/NARRATE-REMOVE-1 In Flight/' "$REG"
  fi
  return 0
}

# ---- the smoke record (Staging plan, Wave C): one memo line per check, `Smoke: <full sha> 16(<a-f>) <pass|fail>`;
# a passing smoke on a sha means that, for each of (a)-(f), the last such line for that sha reads pass (635)
smoke_ok() { # $1 sha, $2 memo text
  local x last; for x in a b c d e f; do last=$(printf '%s\n' "$2" | grep -E "^Smoke: $1 16\($x\) (pass|fail)\$" | tail -1); [ "${last##* }" = pass ] || return 1; done
}
smoke_ok_six() { # control only: the earlier reading, exactly six in-format lines for the sha, one per check, all pass
  local l; l=$(printf '%s\n' "$2" | grep -E "^Smoke: $1 16\([a-f]\) (pass|fail)\$")
  [ "$(printf '%s' "$l" | grep -c .)" = 6 ] && [ "$(printf '%s\n' "$l" | grep -c ' pass$')" = 6 ] \
    && [ "$(printf '%s\n' "$l" | sed -E 's/.* 16\(([a-f])\) .*/\1/' | sort -u | tr -d '\n')" = abcdef ]
}
smoke_lines() { local x v; for x in a b c d e f; do v=pass; [ $x = e ] && v=$2; echo "Smoke: $1 16($x) $v" >> "$WT/$MEMO"; done; } # $1 sha, $2 check (e)

# ---- step 3 (B)'s commit check, run from the primary checkout (step 3, and Wave C integration's first bullet, 638).
# Sets BASE and N; on a mismatch sets CC (the reason) and returns 1.
commit_check() {
  local c1 cnt T s; CC=
  c1=$(git -C "$O" log --format=%H --grep='^NARRATE-REMOVE-1 C1:' refs/heads/$B)
  cnt=$(printf '%s' "$c1" | grep -c .)
  if [ "$cnt" -gt 1 ]; then CC="two C1 commits"; return 1
  elif [ "$cnt" = 1 ]; then
    T=$(git -C "$O" log -1 --format='%(trailers:key=NARRATE-REMOVE-1-Base,valueonly)' "$c1" | tr -d '\n')
    { [ -n "$T" ] && [ "$(git -C "$O" rev-parse "$c1^")" = "$(git -C "$O" rev-parse "$T" 2>/dev/null)" ]; } || { CC="C1 parent is not its trailer sha"; return 1; }
    BASE=$T
  else
    [ -z "$(git -C "$O" rev-list refs/heads/$B ^refs/remotes/origin/main)" ] || { CC="no C1 but commits off origin/main"; return 1; }
    BASE=$(git -C "$O" rev-parse refs/heads/$B)
  fi
  N=0
  while IFS= read -r s; do
    [ -z "$s" ] && continue; N=$((N+1))
    case "$s" in "NARRATE-REMOVE-1 C$N:"*) ;; *) CC="chain #$N: $s"; return 1;; esac
  done <<< "$(git -C "$O" log --reverse --format=%s "$BASE"..refs/heads/$B)"
  [ $N -le 5 ] || { CC="n=$N, outside 0-5"; return 1; }
}

# ---- step 3 (ROADMAP 676-705). Sets RES (token + detail), BASE, N, MODE, FIX.
step3() {
  local brs lb rb wtx oc sd tip lines l p bad last ok REATT=""
  FIX=0
  brs=$(git -C "$O" branch -a --list "*narrate-remove-1*" | sed 's/^[*+ ] //')
  lb=$(printf '%s\n' "$brs" | grep -x "$B"); rb=$(printf '%s\n' "$brs" | grep -x "remotes/origin/$B")
  wtx=$(git -C "$O" worktree list | grep narrate-remove-1)
  oc=$(git -C "$O" log -1 --format=%H --grep='^NARRATE-REMOVE-1 C[1-5]:' refs/remotes/origin/main)
  sd=""; for p in "$WT" "$MW" "$BW"; do [ -d "$p" ] && sd="$sd $(basename "$p")"; done
  if [ -z "$lb$rb$wtx$oc$sd" ]; then # (A): also no directory at a run worktree path
    git -C "$O" worktree add -q "$WT" -b $B refs/remotes/origin/main
    BASE=$(om); N=0; MODE=A
    say A "start -> step 4 (base ${BASE:0:8})"; return
  fi
  [ -n "$lb" ] || { say C "[not (A) and no local branch: remote=${rb:+y} worktree=${wtx:+y} origin-C-commits=${oc:+y} dirs=${sd:- none}]"; return; }
  MODE=B
  commit_check || { say C "[$CC]"; return; }
  tip=$(git -C "$O" rev-parse refs/heads/$B)
  if [ $N = 5 ]; then
    if git -C "$O" merge-base --is-ancestor refs/heads/$B refs/remotes/origin/main; then
      lines=$(git -C "$O" log --merges --ancestry-path --format="%H %P" refs/heads/$B..refs/remotes/origin/main | grep " $tip\$")
      if [ "$(printf '%s' "$lines" | grep -c .)" = 1 ] && [ "$(printf '%s' "$lines" | wc -w)" = 3 ]; then say PUBLISHED "-> /pointer-closeout (merge ${lines:0:8})"; return; fi
      say C "[n=5 on origin/main without exactly one --no-ff publication merge]"; return
    fi
  elif [ $N -ge 1 ]; then
    git -C "$O" merge-base --is-ancestor refs/heads/$B refs/remotes/origin/main && { say C "[$N of 5 commits already on origin/main]"; return; }
  fi
  if [ ! -d "$WT" ]; then
    if listed narrate-remove-1; then say C "[branch worktree listed (prunable) but its directory is missing; no prune]"; return; fi
    git -C "$O" worktree add -q "$WT" $B 2>"$W/reattach.err"; REATT_RC=$?
    [ "$REATT_RC" = 0 ] || { say C "[re-attach exited $REATT_RC: $(grep -m1 -E 'fatal|error' "$W/reattach.err" | sed "s|$(cygpath -m "$W")|<run>|g")]"; return; }
    npm_ci "$WT"; REATT=" (re-attached; npm ci first)" # after a re-attach, npm ci in the worktree before any gate (686)
  elif ! is_run_wt "$WT"; then say C "[the directory at the branch worktree path is not that run worktree: $WHY]"; return
  fi
  # dirt (git status --porcelain --untracked-files=all, 687): only C<n+1> paths; the perf file, the time log and the
  # run's own staging memo are ignored
  bad=""
  while IFS= read -r l; do
    [ -z "$l" ] && continue; p=${l:3}
    eval "inlist \"\$p\" \$C$((N+1))P" || exc "$p" || bad="$bad $p"
  done <<< "$(UALL=1 dirty_except "$WT" "$PERF" "$TLOG" "$MEMO")"
  if [ $N = 4 ]; then # unfinished C4 correction (D4-02): the memo's last "C4 correction:" line names the current C4 (631, 688)
    last=$(grep '^C4 correction: ' "$WT/$MEMO" 2>/dev/null | tail -1)
    [ -n "$last" ] && [ "$(printf '%s' "$last" | cut -d' ' -f3)" = "$tip" ] && FIX=1
  fi
  if [ -n "$bad" ] && [ $FIX = 1 ]; then # its dirt is accepted inside the fence, on an Exception: line, or where it already matches <base>
    ok=1
    for p in $bad; do
      inlist "$p" $FENCE || exc "$p" || matches_base "$p" || { ok=0; echo "   step 3: $p is outside the fence and does not match <base>"; }
    done
    [ $ok = 1 ] && bad=""
  fi
  [ -z "$bad" ] || { say C "[branch worktree dirt outside C$((N+1)):$bad]"; return; }
  case $N in
    0) say B0 "n=0 -> step 4, then C1$REATT";;
    4) if [ $FIX = 1 ]; then say B4fix "n=4, unfinished C4 correction on ${tip:0:8} -> finish it (amend C4, Done-when 1-15, Task 6), then smoke, C5$REATT"
       elif smoke_ok "$tip" "$(cat "$WT/$MEMO" 2>/dev/null)"; then say B4smoked "n=4, passing smoke on the current C4 -> C5$REATT"
       else say B4 "n=4 -> Done-when 1-15 and Task 6 again, then smoke, then C5$REATT"; fi;;
    5) if smoke_ok "$(git -C "$O" rev-parse "$tip^")" "$(git -C "$O" show "$tip:$MEMO" 2>/dev/null)"; then say B5 "n=5 -> Wave C integration$REATT"
       else say C "[n=5 but C5's memo does not record a passing smoke on C5^: for some check of (a)-(f) the last Smoke: line is missing or reads fail]"; fi;;
    *) say B$N "resume C$((N+1))$REATT";;
  esac
}

# ---- step 4 (ROADMAP 706-715), for (A) or (B) with n = 0. Sets RES: MEASURED | REUSED | RED | C
step4() {
  local d st a b c s1 s2 g1 g2 res rec
  if [ "$MODE" = A ]; then
    st=$(dirty_except "$WT" "$TLOG" "$MEMO"); [ -z "$st" ] || { say C "[(A) branch worktree not clean: $(printf '%s' "$st" | tr '\n' ' ')]"; return; }
    d=$WT
  else
    rec=$(grep "^Base measurement: $BASE " "$WT/$MEMO" 2>/dev/null | tail -1)
    if [ -n "$rec" ]; then # reuse, do not re-measure; the red-base rule (715) still reads the reused results
      if printf '%s' "$rec" | grep -qE ' typecheck=0 test=0 build=0 closure-self-test=0 closure=0 positive-controls=[1-9][0-9]*,[1-9]'; then
        say REUSED "memo holds the base measurement for ${BASE:0:8}; not re-measured"
      else say RED "[reused base record is red: ${rec#*— }] -> issue file"; fi
      return
    fi
    if [ ! -d "$BW" ]; then
      if listed narrate-remove-1-base; then say C "[base worktree listed, directory missing; no prune]"; return; fi
      git -C "$O" worktree add -q --detach "$BW" "$BASE"
    else
      is_run_wt "$BW" || { say C "[the directory at the base worktree path is not that run worktree: $WHY]"; return; }
      [ "$(git -C "$BW" rev-parse HEAD)" = "$BASE" ] || { say C "[base worktree sits at another sha]"; return; }
      st=$(dirty_except "$BW" "$PERF"); [ -z "$st" ] || { say C "[base worktree dirty: $(printf '%s' "$st" | tr '\n' ' ')]"; return; }
    fi
    d=$BW
  fi
  npm_ci "$d"; npm_typecheck "$d"; a=$?; npm_test "$d"; b=$?; npm_build "$d"; c=$?
  closure "$d" --self-test; s1=$?; closure "$d" .; s2=$?
  g1=$(git -C "$d" ls-files src/hooks/useNarration.ts tests/narrTiming.test.ts | grep -c .)
  g2=$(git -C "$d" grep -n -P 'useNarration|narrTiming' -- src tests | grep -c .)
  res="typecheck=$a test=$b build=$c closure-self-test=$s1 closure=$s2 positive-controls=$g1,$g2"
  echo "Base measurement: $BASE — $res" >> "$WT/$MEMO" # written as soon as they finish (713), before the red-base rule
  { [ "$a$b$c$s1$s2" = 00000 ] && [ "$g1" -gt 0 ] && [ "$g2" -gt 0 ]; } || { say RED "[red base or empty positive control in $(basename "$d"): $res] -> issue file"; return; }
  say MEASURED "in $(basename "$d"): $res"
}
c1gate() { # C1's own gate, in the branch worktree before C1 is committed; (B) runs npm ci there first (714)
  [ "$MODE" = B ] && npm_ci "$WT"
  npm_test "$WT" $T1 $T2; local rc=$?
  [ $rc = 1 ] && [[ " $FAILED " == *" $T1 "* ]] && [[ " $FAILED " == *" $T2 "* ]]
}

# ---- simulated work in the spec's own commit format (D14, step 4, Staging plan)
write_tests() { local t; for t in $T1 $T2; do printf '// REQUIRES-NORMALIZE positive control\n' > "$WT/$t"; done; }
commit_c() { # the work of C<n>, then the Staging plan's symbolic-ref check, then the commit
  local k q
  case $1 in
    1) write_tests; c1gate || { echo "   C1 gate did not fail as required"; return 1; }
       git -C "$WT" add $T1 $T2;;
    2) echo "C2 edit" >> "$WT/src/components/ReaderContainer.tsx"; echo "C2 edit" >> "$WT/src/reader/modes/page/ModeRuntime.ts"
       git -C "$WT" rm -q src/hooks/useNarration.ts; git -C "$WT" add src/components/ReaderContainer.tsx src/reader/modes/page/ModeRuntime.ts
       npm_typecheck "$WT"; closure "$WT" .;;
    3) echo "normalizeReaderModes(settings);" >> "$WT/main/sync-engine.js"; git -C "$WT" add main/sync-engine.js
       npm_test "$WT" $T1 $T2 || { echo "   C3 gate failed"; return 1; };;
    4) git -C "$WT" rm -q tests/narrTiming.test.ts; git -C "$WT" rm -r -q "$FIXD" # git rm -r for a deleted directory
       echo "C4 edit" >> "$WT/tests/foliate-bridge.test.ts"; git -C "$WT" add tests/foliate-bridge.test.ts
       if [ -n "$C4_EXTRA" ]; then k=${C4_EXTRA%%:*}; q=${C4_EXTRA#*:} # a stray C4 change: M edit, D delete, A add, R delete a directory
         case $k in M) echo "stray C4 edit" >> "$WT/$q"; git -C "$WT" add "$q";; D) git -C "$WT" rm -q "$q";; A) echo "stray C4 file" > "$WT/$q"; git -C "$WT" add "$q";; R) git -C "$WT" rm -r -q "$q";; esac
       fi
       dw1_14 "$WT" || { echo "   C4 gate failed"; return 1; };;
    5) git -C "$WT" add "$MEMO" "$TLOG";;
  esac
  branch_ok || { say C "[symbolic-ref check fails before C$1's commit: nothing committed]"; return 1; }
  case $1 in
    1) git -C "$WT" commit -qm "NARRATE-REMOVE-1 C1: positive controls" -m "$(grep '^Base measurement:' "$WT/$MEMO" | tail -1)" -m "NARRATE-REMOVE-1-Base: $BASE
Co-Authored-By: Claude <noreply@anthropic.com>";;
    2) git -C "$WT" commit -qm "NARRATE-REMOVE-1 C2: Wave A renderer removal";;
    3) git -C "$WT" commit -qm "NARRATE-REMOVE-1 C3: main process";;
    4) git -C "$WT" commit -qm "NARRATE-REMOVE-1 C4: tests reconciled";;
    5) git -C "$WT" commit -qm "NARRATE-REMOVE-1 C5: staging memo, smoke record, time log";;
  esac
  tlog "C$1"
}
smoke_record() { # Wave C: owner smoke on the build of the final C4 tree, one memo line per check on C4's full sha
  local s; s=$(git -C "$WT" rev-parse HEAD); npm_build "$WT"; smoke "$WT" "$SMOKE"; smoke_lines "$s" "$SMOKE"
}
post_c4() { dw15 "$WT" && task6 "$WT"; } # Task 5's diff fence and the Task 6 reviews after C4
cs() { local i; for i in $(seq 1 "$1"); do [ "$i" = 5 ] && { post_c4; smoke_record; }; commit_c "$i" || return 1; done; }
correct_c4() { # "Corrections after C4": the memo line first, then the edit ($1 path, $2 edit|restore, $3 finding, $4 staged)
  echo "C4 correction: $(git -C "$WT" rev-parse HEAD) — ${3:-Task 6 finding}" >> "$WT/$MEMO"
  if [ "$2" != restore ]; then echo "correction" >> "$WT/$1"
  elif git -C "$WT" cat-file -e "$BASE:$1" 2>/dev/null; then git -C "$WT" show "$BASE:$1" > "$WT/$1" # its content at <base>
  elif [ "${4:-}" = staged ]; then git -C "$WT" rm -q "$1"; return # or removed, if <base> lacks it
  else rm -f "$WT/$1"; fi
  if [ "${4:-}" = staged ]; then git -C "$WT" add "$1"; fi
}
amend_c4() { [ $# = 0 ] || git -C "$WT" add "$@"; branch_ok || { say C "[symbolic-ref check fails before the C4 amend]"; return 1; }; git -C "$WT" commit -q --amend --no-edit; }
start() { # fresh run: step 2 + In Flight, step 3 (A), queued count into the memo, step 4 (unless $1 = nomeasure)
  gate_and_claim yes; git -C "$O" fetch -q origin --prune; step3
  [ "${RES%% *}" = A ] || { echo "   start: unexpected $RES"; return 1; }
  echo "Queued at start: $QCOUNT" > "$WT/$MEMO"; tlog start
  [ "${1:-}" = nomeasure ] && return 0
  step4; [ "${RES%% *}" = MEASURED ] || echo "   start step 4: $RES"
}

# ---- Wave C integration (ROADMAP 637-651). $1 stop point: full|after-merge|after-checks ; $2 race (origin moves before
# the push); PUSHDIR=<dir> replays a push run outside the merge worktree, CHECKDIR=<dir> a post-push check run outside it
smoke_trigger() { printf '%s\n' "$1" | grep -qvE '^(docs/|tests/)|^[^/]*\.md$'; } # any path not under docs/ or tests/ and not a root-level *.md (646)
integrate() {
  local stop=${1:-full} race=${2:-no} st msg rc a b c d e names rec m ms pdir=${PUSHDIR:-$MW} cdir=${CHECKDIR:-$MW}; local -a P
  # from the primary checkout: git fetch origin --prune, the commit check, the merge worktree's existence check and creation
  git -C "$O" fetch -q origin --prune
  { commit_check && [ "$N" = 5 ]; } || { say C "[integration: step 3 (B)'s commit check on refs/heads/$B gives ${CC:-n = $N}, not n = 5]"; return; }
  if [ ! -d "$MW" ]; then
    if listed narrate-remove-1-merge; then say C "[merge worktree listed, directory missing; no prune]"; return; fi
    git -C "$O" worktree add -q --detach "$MW" refs/remotes/origin/main
  else
    is_run_wt "$MW" || { say C "[the directory at the merge worktree path is not that run worktree: $WHY]"; return; }
    st=$(dirty_except "$MW" "$PERF"); [ -z "$st" ] || { say C "[merge worktree dirty: $(printf '%s' "$st" | tr '\n' ' ')]"; return; }
  fi
  # every other command in the merge worktree
  read -r -a P <<< "$(git -C "$MW" rev-list --parents -n 1 HEAD)"
  if [ ${#P[@]} = 3 ] && [ "${P[2]}" = "$(git -C "$MW" rev-parse refs/heads/$B)" ] && [ "${P[1]}" = "$(git -C "$MW" rev-parse refs/remotes/origin/main)" ] \
     && [ "$(git -C "$MW" log -1 --format=%s HEAD)" = "$SUBJ" ]; then
    echo "   integrate: HEAD ${P[0]:0:8} is a valid earlier merge -> reused"
  elif git -C "$MW" merge-base --is-ancestor HEAD refs/remotes/origin/main; then
    git -C "$MW" switch -q --detach refs/remotes/origin/main || { say C "[switch failed]"; return; }
    if msg=$(git -C "$MW" merge --no-ff -m "$SUBJ" refs/heads/$B 2>&1); then echo "   integrate: no merge yet -> merged $(short "$MW")"
    else say C "[merge failed, worktree left as is: $(printf '%s' "$msg" | grep -m1 -E 'CONFLICT|error|fatal')]"; return; fi
  else
    say C "[merge worktree HEAD $(short "$MW") is neither a valid earlier merge nor on origin/main: $((${#P[@]}-1)) parent(s), subject '$(git -C "$MW" log -1 --format=%s HEAD)']"; return
  fi
  [ "$stop" = after-merge ] && { say INTERRUPTED "after the merge, before the integration-tree check"; return; }
  m=$(git -C "$MW" rev-parse HEAD)
  git -C "$MW" diff --quiet refs/heads/$B HEAD; rc=$?
  case $rc in # each result goes into the staging memo in the branch worktree as it finishes (649)
    0) rec="trees identical; branch evidence (Done-when 12-16) covers it"; echo "Integration: $m — $rec" >> "$WT/$MEMO";;
    1) npm_ci "$MW"; a=$?; npm_typecheck "$MW"; b=$?; closure "$MW" .; c=$?; npm_test "$MW"; d=$?; npm_build "$MW"; e=$?
       rec="npm ci=$a typecheck=$b closure=$c test=$d build=$e"; echo "Integration: $m — $rec" >> "$WT/$MEMO"
       [ "$a$b$c$d$e" = 00000 ] || { say C "[integration-tree check failed ($rec); no push, worktree left as is]"; return; }
       names=$(git -C "$MW" diff --name-only refs/heads/$B HEAD)
       if smoke_trigger "$names"; then # the owner repeats Done-when 16 (a)-(f) in the merge worktree; one Smoke: line per check
         smoke "$MW" "$SMOKE2"; smoke_lines "$m" "$SMOKE2"; rec="$rec renewed-smoke=$SMOKE2"
         [ "$SMOKE2" = pass ] || { say C "[renewed smoke failed ($rec); no push, worktree left as is]"; return; }
       fi;;
    *) say C "[git diff --quiet exited $rc]"; return;;
  esac
  echo "   integrate: $rec"
  [ "$stop" = after-checks ] && { say INTERRUPTED "after the integration-tree check, before the push"; return; }
  [ "$race" = race ] && advance
  git -C "$pdir" push origin HEAD:refs/heads/main > "$W/push.out" 2>&1; PUSH_RC=$? # the text: in the merge worktree
  [ "$PUSH_RC" = 0 ] || { say C "[push rejected; the merge stays in the merge worktree]"; return; }
  # post-push check (651): git fetch origin, then the ancestor check on the integration merge sha the memo records; it
  # names the merge, not HEAD, so it gives the same answer in any folder (the text runs it in the merge worktree)
  ms=$(memo_merge); git -C "$cdir" fetch -q origin
  if git -C "$cdir" merge-base --is-ancestor "$ms" refs/remotes/origin/main; then say PUSHED "${ms:0:8} to origin/main; post-push check passes"
  else say C "[post-push check: the memo's merge ${ms:0:8} is not on origin/main (push run in $(basename "$pdir"), check in $(basename "$cdir"))]"; fi
}

# ---- row harness: every row asserts its token
report() { # $1 id, $2 expected text, $3 expected token
  local tok=${RES%% *} v=PASS; ROWS=$((ROWS+1)); [ "$tok" = "$3" ] || { v=FAIL; FAILS=$((FAILS+1)); }
  printf '== %s\n   expected (spec): %s [%s]\n   actual         : %s\n   %s\n' "$1" "$2" "$3" "$RES" "$v"
}
session() { gate_and_claim "${1:-yes}" || return 0; git -C "$O" fetch -q origin --prune; step3
  case "${RES%% *}" in B*) [ -f "$WT/$MEMO" ] || echo "Queued at start: not recorded: the first run stopped before the memo existed" > "$WT/$MEMO";; esac; }
row()   { session "${4:-yes}"; report "$1" "$2" "$3"; }
integ() { integrate "${4:-full}" "${5:-no}"; report "$1" "$2" "$3"; }
check() { # $1 description, rest: command whose exit 0 means the check holds
  local dsc=$1 v=PASS; shift; CHECKS=$((CHECKS+1)); "$@" >/dev/null 2>&1 || { v=FAIL; FAILS=$((FAILS+1)); }
  printf '   check: %s -> %s\n' "$dsc" "$v"
}
logged() { grep -qF "$1" "$LOG"; }
not()    { ! "$@"; }
main_is() { [ "$(remote_main)" = "$1" ]; }
hashes() { (cd "$WT" && sha256sum $T1 $T2 2>/dev/null); }
smk() { # SM rows: the memo before the smoke plus six lines from the printf format $1 (%s = the check letter)
  local x; cp "$W/memo0" "$WT/$MEMO"; for x in a b c d e f; do printf "$1\n" "$x" >> "$WT/$MEMO"; done
}

echo "ROADMAP.md replayed: sha256 $(sha256sum < "${ROADMAP:-/dev/null}" | cut -d' ' -f1) (set ROADMAP=<path>)"
echo "STUBS: npm ci, npm run typecheck, the Closure check, npm test, npm run build, the Task 6 reviews and the owner smoke only log and return an exit code; git commands, the Done-when 15 fence and the step-4 search positive controls are real; bash, not pwsh"
echo
echo "######## Earlier rows (recipe-v3), replayed against the final text"
setup FRESH; session; report "FRESH register Queued, prerequisites completed" "step 2 passes, item -> In Flight, (A)" A
check "register reads In Flight" test "$(reg NARRATE-REMOVE-1)" = "In Flight"
setup GATE; sed -i 's/^EINK-HOVER-FIX-1 .*/EINK-HOVER-FIX-1 Queued/' "$REG"; h0=$(md5sum < "$REG"); r0=$(git -C "$O" for-each-ref | md5sum)
row "GATE prerequisite not completed" "step 2 stops; item stays Queued; nothing written" STOP2
check "register unchanged" test "$h0" = "$(md5sum < "$REG")"; check "refs unchanged" test "$r0" = "$(git -C "$O" for-each-ref | md5sum)"
check "no worktree added" test "$(git -C "$O" worktree list | wc -l)" = 1
setup S11; row "S11 fresh, no branch" "(A)" A
setup IBC; gate_and_claim yes; row "IBC interrupted before branch creation (In Flight, owner confirms)" "(A)" A
setup OWN; gate_and_claim yes; row "OWN In Flight, owner does not confirm" "stop at the In Flight move, before step 3" STOP-OWNER no
setup S0; start; row "S0 branch, no C1, main static (time log + memo untracked)" "(B) n=0 -> step 4" B0
setup S0b; start; advance; row "S0b branch, no C1, main advanced" "(B) n=0 -> step 4" B0
setup S1; start; cs 2; row "S1 after C2 (time log + memo uncommitted, perf dirty)" "(B) resume C3" B2
setup S1T; start; cs 2; echo partial >> "$WT/main/sync-engine.js"; row "S1T after C2 with C3 work in progress + time log + memo" "(B) resume C3" B2
setup S1X; start; cs 2; echo stray > "$WT/stray"; row "S1X after C2 with a stray file outside C3" "(C) dirt outside C3" C
setup S2; start; cs 2; advance; row "S2 after C2, main advanced" "(B) resume C3" B2
setup S3; start; cs 5; advance; row "S3 C1-C5 unmerged, main advanced" "(B) n=5 -> integration" B5
integ "S3 integration" "no merge yet -> merge; tree differs -> five checks; push; post-push check" PUSHED
check "build ran in the merge worktree" logged "build @narrate-remove-1-merge rc=0"
row "S3 after integrate" "already published" PUBLISHED
setup S4; start; cs 5; integ "S4 merged, interrupted before the check" "merge made, run stops" INTERRUPTED after-merge
row "S4 next session (main static)" "(B) n=5 -> integration" B5
m0=$(git -C "$MW" rev-parse HEAD); integ "S4 integration" "valid earlier merge reused; trees identical; push" PUSHED
check "the pushed merge is the earlier merge (not repeated)" main_is "$m0"
row "S4 after re-integrate" "already published" PUBLISHED
setup S4b; start; cs 5; integ "S4b merged, interrupted" "merge made" INTERRUPTED after-merge; advance; m0=$(remote_main)
row "S4b next session, main advanced after the merge" "(B) n=5 -> integration" B5
integ "S4b integration" "merge onto an older main: first parent is not origin/main -> (C) (walk-through 702)" C
check "origin/main unchanged" main_is "$m0"
row "S4b next session again" "(B) n=5 -> integration" B5
integ "S4b integration again" "still a merge onto an older main -> (C)" C
setup S4c; start; cs 5; git -C "$O" worktree add -q --detach "$MW" refs/remotes/origin/main; advance
row "S4c merge worktree created at the old main, no merge, main advanced" "(B) n=5 -> integration" B5
integ "S4c integration" "HEAD is an ancestor of origin/main -> no merge yet -> switch, merge, five checks, push" PUSHED
row "S4c after integrate" "already published" PUBLISHED
setup S4d; start; cs 5; advance; integ "S4d main moved; merged + check ran; interrupted before the push" "merge + check" INTERRUPTED after-checks
row "S4d next session" "(B) n=5 -> integration" B5
: > "$LOG"; integ "S4d integration" "valid earlier merge reused; check runs again; push" PUSHED
check "check reran (build logged again)" logged "build @narrate-remove-1-merge rc=0"
row "S4d after re-integrate" "already published" PUBLISHED
setup S5; start; cs 5; integrate; row "S5 published, main static" "already published" PUBLISHED
setup S5b; start; cs 5; advance; integrate; advance; advance; row "S5b published, main advanced before and after" "already published" PUBLISHED
setup S6; start; cs 5; integrate; advance "$CO/CloseOut.NARRATE-REMOVE-1.2026-10-12.md"; row "S6 published + partial close-out on main" "already published" PUBLISHED
setup S7; start; cs 5; integrate; git -C "$O" worktree remove --force "$WT"; git -C "$O" worktree remove --force "$MW"; git -C "$O" branch -qD $B
row "S7 published, then branch and worktrees removed" "(C), not (A)" C
setup S7b; start; cs 5; integrate; git -C "$O" worktree remove --force "$WT"; git -C "$O" branch -qD $B
row "S7b published, branch removed, merge worktree kept" "(C)" C
setup S7c; start; cs 5; integrate; git -C "$O" worktree remove --force "$WT"; row "S7c published, branch worktree removed, branch kept" "already published (before re-attach)" PUBLISHED
setup S8; start; cs 2; advance; git -C "$O" fetch -q; git -C "$WT" merge -q --no-ff -m "Merge origin/main" refs/remotes/origin/main
row "S8 main merged into the branch" "(C)" C
setup S9; start; cs 5; git -C "$O" push -q origin refs/heads/$B:refs/heads/main; row "S9 fast-forward publication (no --no-ff)" "(C)" C
setup S10; start; cs 2; git -C "$O" push -q origin refs/heads/$B:refs/heads/main; row "S10 C1-C2 already on main" "(C)" C
setup IMP; start; cs 5; row "IMP n=5 before the merge" "(B) n=5 -> integration" B5
integ "IMP merge, interrupted before the push" "merge made" INTERRUPTED after-merge
row "IMP next session (main static)" "(B) n=5 -> integration" B5
integ "IMP integration" "valid earlier merge reused, pushed (walk-through 702)" PUSHED
row "IMP after re-integrate" "already published" PUBLISHED
setup PR; start; cs 5; integ "PR push rejected (origin/main moves between fetch and push)" "rejected push -> (C); merge stays" C full race
check "merge worktree HEAD is the merge (contains the branch)" git -C "$MW" merge-base --is-ancestor refs/heads/$B HEAD
row "PR next session" "(B) n=5 -> integration" B5
integ "PR integration" "the stale merge's first parent is not origin/main -> (C)" C
setup MAR; start; cs 5; advance; row "MAR main advanced during the run" "(B) n=5 -> integration" B5
: > "$LOG"; integ "MAR integration" "five checks (npm ci, typecheck, closure, test, build); a root-level file changed, so the smoke is renewed; push" PUSHED
echo "   npm log: $(tr '\n' ';' < "$LOG")"
check "renewed smoke (a root-level u*.txt is not under docs/ or tests/ and not a *.md)" logged "smoke 16(a)-(f) @narrate-remove-1-merge pass"
row "MAR after integrate" "already published" PUBLISHED
setup MARF; start; cs 5; advance; TEST_RC=1; integ "MARF main advanced, integration-tree check fails" "no push; (C)" C
TEST_RC=0; row "MARF next session (after the decision allows a rerun)" "(B) n=5 -> integration" B5
integ "MARF integration" "valid earlier merge reused; check reruns; push" PUSHED
row "MARF after re-integrate" "already published" PUBLISHED
setup MCF; start; cs 5; advance src/components/ReaderContainer.tsx
row "MCF main advanced with a conflicting change" "(B) n=5 -> integration" B5
integ "MCF integration" "merge conflict -> (C), worktree left as is" C
row "MCF next session" "(B) n=5 -> integration" B5
integ "MCF integration again" "dirty merge worktree -> (C)" C
setup S12; git -C "$W/other" push -q origin refs/heads/main:refs/heads/$B; row "S12 remote-only branch" "(C)" C
setup S13; start; cs 2; rm -rf "$WT"; row "S13 branch worktree directory deleted by hand (still listed)" "(C), no prune" C
setup S14; start; cs 2; git -C "$O" worktree remove --force "$WT"; : > "$LOG"; row "S14 branch worktree removed with git worktree remove" "(B) re-attach, npm ci, resume C3" B2
check "re-attached on the branch" test "$(git -C "$WT" symbolic-ref -q HEAD)" = "refs/heads/$B"
check "npm ci ran in the re-attached worktree before any gate (first logged command)" test "$(head -1 "$LOG")" = "npm ci @narrate-remove-1 rc=0"
setup S15; start; cs 5; integrate after-merge; rm -rf "$MW"; row "S15 merge worktree directory deleted by hand after the merge" "(B) n=5 -> integration" B5
integ "S15 integration" "merge worktree listed but missing -> (C), no prune" C
setup S15b; start; cs 5; integrate after-merge; git -C "$O" worktree remove --force "$MW"
row "S15b merge worktree removed with git worktree remove after the merge" "(B) n=5 -> integration" B5
integ "S15b integration" "fresh merge worktree at origin/main -> merge redone -> push" PUSHED
row "S15b after integrate" "already published" PUBLISHED
setup SMF; SMOKE=fail; start; cs 5; row "SMF C5 memo records 16(e) fail" "(C)" C
setup S6N; start; cs 5; echo 6 > "$WT/c6"; git -C "$WT" add c6; git -C "$WT" commit -qm "NARRATE-REMOVE-1 C6: extra"; row "S6N a sixth C commit" "(C), n outside 0-5" C
setup S1F; start; cs 2; git -C "$WT" commit -q --amend -m "NARRATE-REMOVE-1 C2: Wave A renderer removal (amended)"; row "S1F C2 amended (still one C2)" "(B) resume C3" B2
setup FRESHM; gate_and_claim yes; git -C "$O" fetch -q origin --prune; step3; report "FRESHM fresh start" "(A)" A
echo "Queued at start: $QCOUNT" > "$WT/$MEMO"; tlog open
step4; report "FRESHM step 4 with the memo and time log present" "(A)'s status check exempts the memo and time log; measure in the branch worktree" MEASURED
check "memo holds the base measurement line" grep -q "^Base measurement: $BASE " "$WT/$MEMO"

echo; echo "######## D4-01: authenticate a recovered integration merge"
setup M1; start; cs 5; m0=$(remote_main); git -C "$O" worktree add -q --detach "$MW" refs/heads/$B
row "M1 clean merge worktree parked with HEAD = C5" "(B) n=5 -> integration" B5
check "(control) the old ancestry predicate would have accepted it" git -C "$MW" merge-base --is-ancestor refs/heads/$B HEAD
integ "M1 integration" "2 shas, not a merge; not an ancestor of origin/main -> anything else -> (C)" C
check "origin/main unchanged (no fast-forward of C5)" main_is "$m0"
setup M2; start; cs 5; m0=$(remote_main); git -C "$O" worktree add -q --detach "$MW" refs/heads/$B; echo d > "$MW/desc.txt"; git -C "$MW" add desc.txt; git -C "$MW" commit -qm "unreviewed descendant of C5"
row "M2 merge worktree at an unrelated descendant of C5" "(B) n=5 -> integration" B5
integ "M2 integration" "-> (C)" C; check "origin/main unchanged" main_is "$m0"
setup M3; start; cs 5; integrate after-merge; m0=$(remote_main); echo d > "$MW/desc.txt"; git -C "$MW" add desc.txt; git -C "$MW" commit -qm "unreviewed descendant of the merge"
row "M3 merge worktree at an unrelated descendant of a valid merge" "(B) n=5 -> integration" B5
integ "M3 integration" "one parent, wrong subject; not on origin/main -> (C)" C; check "origin/main unchanged" main_is "$m0"
setup M4; start; cs 5; git -C "$O" worktree add -q --detach "$MW" refs/remotes/origin/main; echo f > "$MW/foreign.txt"; git -C "$MW" add foreign.txt; git -C "$MW" commit -qm "foreign unpublished commit"; m0=$(remote_main)
row "M4 merge worktree at an unrelated commit on top of origin/main" "(B) n=5 -> integration" B5
integ "M4 integration" "not on origin/main -> (C); the commit is not switched away from" C
check "merge worktree still at the foreign commit" test "$(git -C "$MW" log -1 --format=%s HEAD)" = "foreign unpublished commit"
check "origin/main unchanged" main_is "$m0"
setup M5; start; cs 5; integrate after-merge; m0=$(git -C "$MW" rev-parse HEAD)
row "M5 valid interrupted merge (main static)" "(B) n=5 -> integration" B5
: > "$LOG"; integ "M5 integration" "three shas, second parent = branch, first parent = origin/main, exact subject -> reused; check; push" PUSHED
check "the pushed commit is the recovered merge" main_is "$m0"
check "no new merge was made (HEAD unchanged)" test "$(git -C "$MW" rev-parse HEAD)" = "$m0"
row "M5 after integrate" "already published" PUBLISHED
setup M6; start; cs 5; integrate after-merge; advance; m0=$(remote_main)
row "M6 merge onto an older main (origin/main advanced after the merge)" "(B) n=5 -> integration" B5
integ "M6 integration" "first parent is not the current origin/main -> (C)" C; check "origin/main unchanged" main_is "$m0"
setup M7; start; cs 5; git -C "$O" worktree add -q --detach "$MW" refs/remotes/origin/main; git -C "$MW" merge -q --no-ff -m "Merge branch eb/narrate-remove-1" refs/heads/$B; m0=$(remote_main)
row "M7 merge with the right parents and a different subject" "(B) n=5 -> integration" B5
integ "M7 integration" "subject differs -> (C)" C; check "origin/main unchanged" main_is "$m0"
setup M8; start; cs 5; integrate after-merge; git -C "$WT" commit -q --amend -m "NARRATE-REMOVE-1 C5: staging memo, smoke record, time log" -m "re-created after the merge"; m0=$(remote_main)
row "M8 merge of an older C5 (C5 re-created after the merge)" "(B) n=5 -> integration" B5
integ "M8 integration" "second parent is not the branch -> (C)" C; check "origin/main unchanged" main_is "$m0"

echo; echo "######## D4-02: a resumable post-C4 correction"
setup K1; start; cs 4; post_c4; c4a=$(git -C "$WT" rev-parse HEAD); correct_c4 src/components/ReaderContainer.tsx edit "Task 6: useReaderKeys slot order"
row "K1 interrupted mid-correction after C4 (memo names the current C4 sha; Edit-sites file changed)" "(B), finish the correction (walk-through 700)" B4fix
amend_c4 src/components/ReaderContainer.tsx
check "amend keeps the C4 subject" test "$(git -C "$WT" log -1 --format=%s HEAD)" = "NARRATE-REMOVE-1 C4: tests reconciled"
check "C4 sha changed" test "$(git -C "$WT" rev-parse HEAD)" != "$c4a"
row "K1 interrupted after the amend, before its reruns" "(B); Done-when 1-15 and Task 6 again, then smoke (walk-through 701)" B4
: > "$LOG"; dw1_14 "$WT"; post_c4; check "Done-when 1-15 and Task 6 reran" logged "task6 reviews @narrate-remove-1"
smoke_record; row "K1 smoke recorded on the amended C4" "(B) n=4, passing smoke on the current C4 -> C5" B4smoked
commit_c 5; row "K1 after C5" "(B) n=5 -> integration" B5
integ "K1 integration" "no merge yet -> merge -> identical -> push" PUSHED
row "K1 after integrate" "already published" PUBLISHED
setup K2; start; cs 4; post_c4; echo "correction" >> "$WT/src/components/ReaderContainer.tsx"
row "K2 n=4 with correction dirt but no memo line" "(C)" C
setup K3; start; cs 4; post_c4; correct_c4 src/components/ReaderContainer.tsx edit; amend_c4 src/components/ReaderContainer.tsx; echo "second" >> "$WT/main/sync-engine.js"
row "K3 n=4 dirt; the memo's last correction line names an older C4 sha" "(C)" C
setup K4; start; cs 4; post_c4; correct_c4 src/reader/modes/page/view.ts edit
row "K4 n=4 memo names the current C4; a dirty path outside the fence that differs from <base>" "(C)" C
setup K5; start; cs 3; C4_EXTRA=M:src/reader/modes/page/view.ts; commit_c 4
check "(control) Done-when 15 fails on C4 (view.ts outside the fence)" not dw15 "$WT"
correct_c4 src/reader/modes/page/view.ts restore "failed Done-when 15"
row "K5 correction returns the out-of-fence path to its <base> content" "(B) unfinished correction (hash-object equals <base>)" B4fix
amend_c4 src/reader/modes/page/view.ts; check "Done-when 15 passes after the amend" dw15 "$WT"
row "K5 after the amend" "(B) n=4, reruns then smoke" B4
setup K6; start; cs 4; post_c4; correct_c4 src/components/ReaderContainer.tsx edit; echo stray > "$WT/src/reader/modes/page/stray.ts"
row "K6 memo names the current C4; untracked stray outside the fence" "git cat-file -e <base>:<path> fails and the path exists in the working tree, so it does not match <base> -> (C)" C
check "(control) git diff --quiet <base> -- <untracked path> alone exits 0" git -C "$WT" diff --quiet "$BASE" -- src/reader/modes/page/stray.ts
setup K11; start; cs 4; post_c4; echo "C4 correction: $(git -C "$WT" rev-parse HEAD) — Task 6 finding" >> "$WT/$MEMO"
row "K11 memo line written, interrupted before any edit (no dirt)" "(B); the correction is unfinished while the memo names the current C4 -> finish it first (631, 688, 690)" B4fix
setup K8; start; cs 4; post_c4; smoke_record; row "K8 n=4 with a passing smoke on the current C4" "(B) -> C5 without repeating the smoke" B4smoked
setup K9; start; cs 4; post_c4; smoke_record; correct_c4 src/components/ReaderContainer.tsx edit
row "K9 correction started after the smoke" "(B) unfinished correction" B4fix
amend_c4 src/components/ReaderContainer.tsx; row "K9 after the amend" "(B); the smoke on the older C4 sha is void -> reruns and smoke" B4
commit_c 5; row "K9 C5 committed without repeating the smoke" "(C): no passing smoke on C5^" C
setup K10; start; cs 4; post_c4; s=$(git -C "$WT" rev-parse HEAD); for i in 1 2 3 4 5 6; do echo "Smoke: $s 16(a) pass" >> "$WT/$MEMO"; done; commit_c 5
row "K10 C5 memo with six duplicate 16(a) pass lines" "(C)" C

echo; echo "######## D4-03: keep the base measurement clean at n = 0"
setup Z1; start; write_tests
row "Z1 n=0, both C1 tests written, memo holds the base record" "(B) n=0 (walk-through 697)" B0
: > "$LOG"; step4; report "Z1 step 4" "reuse the base record; do not re-measure" REUSED
check "no base worktree created" not listed narrate-remove-1-base
check "nothing measured" not grep -qE '^(typecheck|build) |^npm test @' "$LOG"
commit_c 1; check "C1's own gate: npm ci in the branch worktree" logged "npm ci @narrate-remove-1 rc=0"
check "C1's own gate: both new tests fail (exit 1)" grep -qF "npm test -- $T1 $T2 @narrate-remove-1 rc=1 failed: $T1 $T2" "$LOG"
check "C1 trailer is the base" test "$(git -C "$WT" log -1 --format='%(trailers:key=NARRATE-REMOVE-1-Base,valueonly)' HEAD | tr -d '\n')" = "$BASE"
row "Z1 after C1" "(B) resume C2" B1
setup Z2; start nomeasure; write_tests; h0=$(hashes); s0=$(git -C "$WT" status --porcelain)
row "Z2 n=0, C1 tests written, no base record" "(B) n=0" B0
: > "$LOG"; step4; report "Z2 step 4" "measured in a detached base worktree, green" MEASURED
check "base worktree is detached at the base" test "$(git -C "$BW" rev-parse HEAD)" = "$BASE"
check "full suite ran in the base worktree only" not grep -qF "npm test @narrate-remove-1 rc" "$LOG"
check "C1 test files untouched" test "$h0" = "$(hashes)"
check "branch worktree status unchanged except the memo" test "$s0" = "$(git -C "$WT" status --porcelain)"
check "memo holds the base measurement line" grep -q "^Base measurement: $BASE " "$WT/$MEMO"
check "(control) measuring in the branch worktree would be red" not npm_test "$WT"
commit_c 1; row "Z2 after C1" "(B) resume C2" B1
setup Z3; start nomeasure; write_tests; git -C "$O" worktree add -q --detach "$BW" "$(om)"
row "Z3 n=0, existing clean base worktree at the base" "(B) n=0" B0
step4; report "Z3 step 4" "reuse the base worktree and measure there (a detached HEAD is right for it)" MEASURED
setup Z4; start nomeasure; write_tests; advance; git -C "$O" fetch -q; git -C "$O" worktree add -q --detach "$BW" refs/remotes/origin/main
row "Z4 n=0, base worktree at another sha" "(B) n=0" B0
step4; report "Z4 step 4" "(C)" C
setup Z5; start nomeasure; write_tests; git -C "$O" worktree add -q --detach "$BW" "$(om)"; echo dirt >> "$BW/docs/notes.md"
row "Z5 n=0, dirty base worktree" "(B) n=0" B0
step4; report "Z5 step 4" "(C)" C
setup Z6; start nomeasure; write_tests; git -C "$O" worktree add -q --detach "$BW" "$(om)"; rm -rf "$BW"
row "Z6 n=0, base worktree listed, directory missing" "(B) n=0" B0
step4; report "Z6 step 4" "(C), no prune" C
setup Z7; start nomeasure; echo "Base measurement: 0000000000000000000000000000000000000000 — typecheck=0" >> "$WT/$MEMO"; write_tests
row "Z7 n=0, memo holds a base record for another sha only" "(B) n=0" B0
step4; report "Z7 step 4" "the record is not for this base sha -> measure in the base worktree" MEASURED
setup Z10; start nomeasure; echo "Base measurement: $(om) — typecheck=0 test=1 build=0 closure-self-test=0 closure=0 positive-controls=2,3" >> "$WT/$MEMO"; write_tests
row "Z10 n=0, memo holds a red base record for this sha" "(B) n=0" B0
: > "$LOG"; step4; report "Z10 step 4" "reuse it (no re-measure); a red base goes to an issue file (715)" RED
check "nothing measured" not grep -qE '^(typecheck|build) |^npm test @' "$LOG"
setup Z11; start nomeasure; TEST_RC=1; write_tests
row "Z11 n=0, no record, the base itself is red" "(B) n=0" B0
step4; report "Z11 step 4" "measured in the base worktree; the line is written, then the red-base rule stops" RED
check "the red results were written to the memo first (713)" grep -q "^Base measurement: $BASE — typecheck=0 test=1 " "$WT/$MEMO"
setup Z8; git -C "$O" worktree add -q --detach "$BW" refs/remotes/origin/main
row "Z8 leftover base worktree, no branch" "not (A) (no narrate-remove-1-base worktree allowed) -> (C)" C
setup Z9; start; cs 2; echo other > "$WT/$CO/Memo.NARRATE-REMOVE-1.GovernanceStaging.2026-10-13.md"
row "Z9 a second staging memo" "(C): exactly one memo; the second is dirt outside C3" C

echo; echo "######## D4-04: verify a different integration tree fully"
setup I1; start; cs 5; advance src/other.ts; row "I1 main moved with a src/ change" "(B) n=5 -> integration" B5
: > "$LOG"; integ "I1 integration" "five checks, renewed smoke (src/ changed), push" PUSHED
check "build ran in the merge worktree" logged "build @narrate-remove-1-merge rc=0"
check "renewed smoke on the merge build" logged "smoke 16(a)-(f) @narrate-remove-1-merge pass"
check "the staging memo binds the merge sha to the five exit codes (649)" grep -qxF "Integration: $(remote_main) — npm ci=0 typecheck=0 closure=0 test=0 build=0" "$WT/$MEMO"
check "the renewed smoke is recorded as Smoke: lines on the merge sha, the last for each check reading pass (649)" smoke_ok "$(remote_main)" "$(cat "$WT/$MEMO")"
check "the integration lines stay uncommitted after C5 (memo modified, not committed)" test "$(git -C "$WT" status --porcelain -- "$MEMO")" = " M $MEMO"
setup I2; start; cs 5; advance package-lock.json; row "I2 main moved with a package-lock.json change" "(B) n=5 -> integration" B5
: > "$LOG"; integ "I2 integration" "five checks, renewed smoke, push" PUSHED; check "renewed smoke" logged "smoke 16(a)-(f)"
setup I3; start; cs 5; advance docs/other.md; row "I3 main moved, docs only" "(B) n=5 -> integration" B5
: > "$LOG"; integ "I3 integration" "five checks, no renewed smoke, push" PUSHED
check "build ran" logged "build @narrate-remove-1-merge"; check "no renewed smoke" not logged "smoke"
setup I4; start; cs 5; advance src/other.ts; BUILD_RC=1; m0=$(remote_main); row "I4 main moved with a src/ change; build fails" "(B) n=5 -> integration" B5
integ "I4 integration" "build exit 1 -> no push -> (C)" C; check "origin/main unchanged" main_is "$m0"
setup I5; start; cs 5; advance main/other.js; SMOKE2=fail; m0=$(remote_main); row "I5 main moved with a main/ change; renewed smoke fails" "(B) n=5 -> integration" B5
integ "I5 integration" "renewed smoke fails -> no push -> (C)" C; check "origin/main unchanged" main_is "$m0"
check "the memo records 16(e) fail on the merge sha" grep -qxF "Smoke: $(git -C "$MW" rev-parse HEAD) 16(e) fail" "$WT/$MEMO"
setup I6; start; cs 5; row "I6 main static" "(B) n=5 -> integration" B5
: > "$LOG"; integ "I6 integration" "trees identical -> no checks, push" PUSHED; check "nothing ran" not grep -qE "@narrate-remove-1-merge" "$LOG"
echo "== I7 (informational) renewed-smoke trigger, path by path (the text: any path not under docs/ or tests/ and not a root-level *.md)"
for p in src/a.ts main/b.js main.js preload.js package.json package-lock.json docs/a.md tests/a.test.ts README.md docs/x/CHANGELOG.md vite.config.js index.html public/x.png resources/icon.png tsconfig.json patches/kokoro-js+1.2.1.patch scripts/patch-onnxruntime.js .github/workflows/ci.yml mainx.js; do
  smoke_trigger "$p" && t=yes || t=no; printf '   %-34s renewed smoke: %s\n' "$p" "$t"
done

echo; echo "######## Publication check: exactly three fields (the merge and its two parents)"
setup O1; start; cs 5; git -C "$O" pull -q --no-rebase origin main; git -C "$O" branch -q side; echo s > "$W/side.txt"
git -C "$O" switch -q side; cp "$W/side.txt" "$O/side.txt"; git -C "$O" add side.txt; git -C "$O" commit -qm side; git -C "$O" switch -q main
git -C "$O" merge -q --no-ff -m "octopus" side refs/heads/$B; git -C "$O" push -q origin main
row "O1 published through an octopus merge whose last parent is C5" "the line ending with the tip has four fields, not three -> (C)" C

echo; echo "######## Run-worktree rule (preamble): listed by git worktree list --porcelain and its own toplevel"
setup W1; mkdir -p "$WT"; echo locked > "$WT/locked.tmp"
row "W1 no branch; a stray directory at the branch worktree path" "not (A): a directory at a run worktree path -> (C)" C
check "(control) git in the stray directory acts on the primary checkout" test "$(git -C "$WT" rev-parse --show-toplevel)" = "$(cygpath -m "$O")"
check "no worktree added" test "$(git -C "$O" worktree list | wc -l)" = 1
setup W2; start; cs 2; git -C "$O" worktree remove --force "$WT"; mkdir -p "$WT"; echo locked > "$WT/locked.tmp"
row "W2 n=2; branch worktree unregistered, a stray directory left at its path" "not a run worktree -> (C), no re-attach" C
check "the stray directory is untouched" test -f "$WT/locked.tmp"
setup W3; start; cs 5; m0=$(remote_main); mkdir -p "$MW"; echo locked > "$MW/locked.tmp"
row "W3 n=5; a stray directory at the merge worktree path" "(B) n=5 -> integration" B5
check "(control) without the rule, HEAD there is the primary checkout's and an ancestor of origin/main" git -C "$MW" merge-base --is-ancestor HEAD refs/remotes/origin/main
integ "W3 integration" "not a run worktree -> (C); nothing switched, merged or pushed" C
check "origin/main unchanged" main_is "$m0"
check "the primary checkout is still on main" test "$(git -C "$O" symbolic-ref -q HEAD)" = refs/heads/main
setup W4; start nomeasure; write_tests; mkdir -p "$BW"; echo locked > "$BW/locked.tmp"
row "W4 n=0; a stray directory at the base worktree path" "(B) n=0" B0
step4; report "W4 step 4" "not a run worktree -> (C)" C

echo; echo "######## Exception: lines (Failure handling) and the staging memo"
setup X1; start; cs 2; echo "Exception: tests/ok.test.ts — imports a deleted module" >> "$WT/$MEMO"; echo "reference removed" >> "$WT/tests/ok.test.ts"
row "X1 after C2; an out-of-C3 file named on an Exception: line" "(B) resume C3; the Exception: line accepts it" B2
setup X2; start; cs 2; echo "reference removed" >> "$WT/tests/ok.test.ts"
row "X2 after C2; the same file with no Exception: line" "(C) dirt outside C3" C
setup X3; start; cs 4; post_c4; echo "Exception: tests/ok.test.ts — imports a deleted module" >> "$WT/$MEMO"; correct_c4 tests/ok.test.ts edit "Done-when 14: tests/ok.test.ts imports a deleted module"
row "X3 n=4; correction of a file named on an Exception: line" "(B) unfinished correction" B4fix
amend_c4 tests/ok.test.ts; check "Done-when 15 holds after the amend (the exception is listed)" dw15 "$WT"
setup K12; start; cs 4; post_c4; echo "C4 correction: $(git -C "$WT" rev-parse --short HEAD) — Task 6 finding" >> "$WT/$MEMO"; echo "correction" >> "$WT/src/components/ReaderContainer.tsx"
row "K12 the memo names the current C4 by a short sha" "not the full 40-character sha, so no unfinished correction -> (C)" C
setup MM1; gate_and_claim yes; git -C "$O" fetch -q origin --prune; step3; report "MM1 fresh start; the run stops before writing the memo" "(A)" A
row "MM1 next session (In Flight, owner confirms)" "(B) n=0; a memo is created with the count not recorded" B0
check "memo created with the count not recorded (step 2)" grep -qx "Queued at start: not recorded: the first run stopped before the memo existed" "$WT/$MEMO"
step4; report "MM1 step 4" "no base record -> measured in the base worktree" MEASURED
setup F1; start; cs 3; git -C "$WT" rm -q -n "$FIXD" > /dev/null 2>&1; rc=$?; git -C "$WT" rm -r -q "$FIXD"
row "F1 after C3; the fixture directory deletion (git rm -r) is in progress" "(B) resume C4 (C4 owns the fixture deletions)" B3
check "(control) git rm without -r on the Delete-list directory exits 128" test "$rc" = 128
setup Z12; start; cs 2; advance; git -C "$O" fetch -q; git -C "$O" worktree add -q --detach "$BW" refs/remotes/origin/main
row "Z12 n=2; a leftover base worktree at another sha" "(B) resume C3: with n >= 1 the base worktree is not consulted" B2

echo; echo "######## Renewed smoke after a moved main (any path not under docs/ or tests/ and not a root-level *.md)"
setup I8; start; cs 5; advance vite.config.js; row "I8 main moved with a vite.config.js change" "(B) n=5 -> integration" B5
: > "$LOG"; integ "I8 integration" "five checks, renewed smoke, push" PUSHED; check "renewed smoke" logged "smoke 16(a)-(f) @narrate-remove-1-merge pass"
setup I9; start; cs 5; advance tests/other.test.ts; row "I9 main moved with a tests/ change only" "(B) n=5 -> integration" B5
: > "$LOG"; integ "I9 integration" "five checks, no renewed smoke, push" PUSHED; check "build ran" logged "build @narrate-remove-1-merge"; check "no renewed smoke" not logged "smoke"

echo; echo "######## Fix round 2 and the Round 2 check: Wave C integration's folders; the push and its post-push check on the memo's merge sha (637, 651)"
setup P1; start; cs 5; m0=$(remote_main)
PUSHDIR=$O; CHECKDIR=$O; integ "P1 the push and the post-push check both run from the primary checkout (on main at origin/main), not the merge worktree" "the push exits 0 and publishes nothing; the check on the memo's merge sha exits 1 there -> (C)" C; PUSHDIR=; CHECKDIR=
check "(control) that push exited 0" test "$PUSH_RC" = 0
check "(control) it printed 'Everything up-to-date'" grep -q "Everything up-to-date" "$W/push.out"
check "origin/main unchanged" main_is "$m0"
check "the same check in the merge worktree also exits 1 (its answer does not depend on the folder)" not git -C "$MW" merge-base --is-ancestor "$(memo_merge)" refs/remotes/origin/main
check "(control) the replaced HEAD form, run in the primary checkout, would pass (its HEAD is origin/main)" git -C "$O" merge-base --is-ancestor HEAD refs/remotes/origin/main
row "P1 next session" "(B) n=5, not on origin/main -> integration" B5
integ "P1 integration, push from the merge worktree" "valid earlier merge reused; trees identical; push; post-push check passes" PUSHED
row "P1 after integrate" "already published" PUBLISHED
setup P2; start; cs 5; CHECKDIR=$O
integ "P2 the push from the merge worktree; the post-push check run from the primary checkout" "the merge landed, and the check on the memo's merge sha passes there too" PUSHED; CHECKDIR=
check "origin/main is the memo's merge" main_is "$(memo_merge)"
row "P2 after integrate" "already published" PUBLISHED

echo; echo "######## Fix round 2: the branch worktree's symbolic-ref check (preamble 670, Staging plan 623, integration 638)"
setup D1; start; cs 2; git -C "$WT" switch -q --detach
row "D1 n=2; the branch worktree switched to a detached HEAD at the branch tip, status clean" "listed and its own toplevel, but symbolic-ref -q HEAD prints nothing -> not a run worktree -> (C)" C
check "(control) git worktree list --porcelain lists it" eval 'git -C "$O" worktree list --porcelain | grep -qxF "worktree $(cygpath -m "$WT")"'
check "(control) rev-parse --show-toplevel there prints its own path" test "$(git -C "$WT" rev-parse --show-toplevel)" = "$(cygpath -m "$WT")"
check "(control) its status is clean apart from the memo and time log" test -z "$(dirty_except "$WT" "$PERF" "$TLOG" "$MEMO")"
setup D2; start; cs 2; c2=$(git -C "$WT" rev-parse HEAD); git -C "$WT" switch -q --detach
commit_c 3; report "D2 the branch worktree detached during the run, before C3's commit" "commit only while the symbolic-ref check holds -> (C), nothing committed" C
check "no commit: HEAD and refs/heads/eb/narrate-remove-1 are still C2" test "$(git -C "$WT" rev-parse HEAD) $(git -C "$O" rev-parse refs/heads/$B)" = "$c2 $c2"
setup D3; start; cs 2; git -C "$WT" switch -q --detach; m0=$(remote_main)
for i in 3 4 5; do echo "C$i" >> "$WT/main/sync-engine.js"; git -C "$WT" add main/sync-engine.js; git -C "$WT" commit -qm "NARRATE-REMOVE-1 C$i: on a detached HEAD"; done
check "(control) refs/heads/eb/narrate-remove-1 is still C2; C3-C5 sit on the detached HEAD" test "$(git -C "$O" log -1 --format=%s refs/heads/$B)" = "NARRATE-REMOVE-1 C2: Wave A renderer removal"
integ "D3 C3-C5 committed on a detached HEAD (the earlier text had no symbolic-ref check); the uninterrupted run reaches integration" "the commit check gives n = 2, not 5 -> (C) before any merge worktree" C
check "origin/main unchanged" main_is "$m0"
check "no merge worktree created" not listed narrate-remove-1-merge

echo; echo "######## Fix round 2: a re-attach that exits non-zero goes to (C); a re-attach runs npm ci first (686; S14); the text names the branch, because the full ref detaches (R3)"
setup R1; start; cs 2; git -C "$O" worktree remove --force "$WT"; git -C "$O" switch -q $B
row "R1 n=2; branch worktree removed; the branch is checked out in the primary checkout" "git worktree add exits 128 (already used by a worktree) -> (C)" C
check "the re-attach exited 128" test "$REATT_RC" = 128
check "no branch worktree registered" not listed narrate-remove-1
setup R2; start; cs 2; git -C "$O" worktree remove --force "$WT"; git -C "$O" worktree add -q "$O/.worktrees/other" $B
row "R2 n=2; branch worktree removed; the branch is checked out in another worktree" "git worktree add exits 128 -> (C)" C
check "the re-attach exited 128" test "$REATT_RC" = 128
setup R3; start; cs 2; git -C "$O" worktree remove --force "$WT"; git -C "$O" worktree add -q "$WT" refs/heads/$B; rc=$?; npm_ci "$WT"
check "(control) a re-attach written with the full ref refs/heads/eb/narrate-remove-1, against the text (686 names the branch), exits 0" test "$rc" = 0
check "(control) and leaves a detached HEAD" not branch_ok
commit_c 3; report "R3 that re-attach (exit 0, detached HEAD); the run goes on to C3" "the Staging plan's symbolic-ref check refuses C3's commit -> (C)" C
row "R3 next session" "the directory fails the run-worktree rule (symbolic-ref) -> (C)" C

echo; echo "######## Fix round 2: an unfinished C4 correction's path that already matches <base> (cat-file -e, then hash-object; 632, 688)"
setup H1; start; cs 3; C4_EXTRA=D:tests/ok.test.ts; commit_c 4
check "(control) Done-when 15 fails on C4: D tests/ok.test.ts is outside the fence" not dw15 "$WT"
correct_c4 tests/ok.test.ts restore "Done-when 15: D tests/ok.test.ts"
row "H1 C4 deleted tests/ok.test.ts by mistake; restored to its <base> content, not staged (untracked)" "cat-file -e exits 0 and hash-object equals rev-parse <base>:<path> -> unfinished correction" B4fix
check "(control) the replaced rule rejects it: git diff --quiet <base> -- <path> exits 1 on the untracked file" not old_matches_base tests/ok.test.ts
amend_c4 tests/ok.test.ts; check "Done-when 15 passes after the amend" dw15 "$WT"
row "H1 after the amend" "(B) n=4 -> Done-when 1-15 and Task 6 again, then smoke" B4
setup H2; start; cs 3; C4_EXTRA=D:tests/ok.test.ts; commit_c 4; correct_c4 tests/ok.test.ts restore "Done-when 15: D tests/ok.test.ts" staged
row "H2 the same deletion; restored and staged with git add" "hash-object equals <base> -> unfinished correction" B4fix
amend_c4; check "Done-when 15 passes after the amend" dw15 "$WT"
setup H3; start; cs 3; C4_EXTRA=A:src/reader/modes/page/stray.ts; commit_c 4
check "(control) Done-when 15 fails on C4: A src/reader/modes/page/stray.ts is outside the fence" not dw15 "$WT"
correct_c4 src/reader/modes/page/stray.ts restore "Done-when 15: A src/reader/modes/page/stray.ts"
row "H3 C4 added src/reader/modes/page/stray.ts by mistake; removed (absent from <base>), not staged" "cat-file -e exits non-zero and the path is absent from the working tree -> unfinished correction" B4fix
check "(control) the replaced rule rejects it: git cat-file -e <base>:<path> exits non-zero" not old_matches_base src/reader/modes/page/stray.ts
amend_c4 src/reader/modes/page/stray.ts; check "Done-when 15 passes after the amend" dw15 "$WT"
row "H3 after the amend" "(B) n=4 -> Done-when 1-15 and Task 6 again, then smoke" B4
setup H4; start; cs 3; C4_EXTRA=A:src/reader/modes/page/stray.ts; commit_c 4; correct_c4 src/reader/modes/page/stray.ts restore "Done-when 15: A src/reader/modes/page/stray.ts" staged
row "H4 the same addition; removed with git rm (staged)" "path absent -> unfinished correction" B4fix
check "(control) the replaced rule rejects it" not old_matches_base src/reader/modes/page/stray.ts
amend_c4; check "Done-when 15 passes after the amend" dw15 "$WT"
setup H5; start; cs 3; C4_EXTRA=D:tests/ok.test.ts; commit_c 4; correct_c4 tests/ok.test.ts edit "Done-when 15: D tests/ok.test.ts"
row "H5 the same deletion; the file re-created with other content" "hash-object differs from rev-parse <base>:<path> -> (C)" C
check "(control) run from the primary checkout, the recipe's default folder, instead of the branch worktree the text names (688), hash-object hashes that checkout's copy, which equals <base>" test "$(git -C "$O" hash-object -- tests/ok.test.ts)" = "$(git -C "$O" rev-parse "$BASE:tests/ok.test.ts")"

echo; echo "######## Round 2 check: a directory a C4 correction restores is listed file by file (687) and each file matches <base> (688)"
setup H6; advance src/reader/modes/page/parts/a.ts; advance src/reader/modes/page/parts/b.ts; start; cs 3
C4_EXTRA=R:src/reader/modes/page/parts; commit_c 4
check "(control) Done-when 15 fails on C4: the deleted directory src/reader/modes/page/parts/ is outside the fence" not dw15 "$WT"
echo "C4 correction: $(git -C "$WT" rev-parse HEAD) — Done-when 15: D src/reader/modes/page/parts/" >> "$WT/$MEMO"
mkdir -p "$WT/src/reader/modes/page/parts"; for f in a.ts b.ts; do git -C "$WT" show "$BASE:src/reader/modes/page/parts/$f" > "$WT/src/reader/modes/page/parts/$f"; done
row "H6 C4 deleted the directory src/reader/modes/page/parts/ by mistake; its two files restored to their <base> content by writing them, not staged" "git status --porcelain --untracked-files=all lists each file, and each hash-object equals rev-parse <base>:<path> -> unfinished correction" B4fix
check "(control) git status --porcelain without --untracked-files=all lists the directory as one entry" test "$(git -C "$WT" status --porcelain -- src/reader/modes/page/parts)" = "?? src/reader/modes/page/parts/"
check "(control) hash-object fails on that entry, so judged as one entry it would not match <base> (a false (C))" not git -C "$WT" hash-object -- src/reader/modes/page/parts/
amend_c4 src/reader/modes/page/parts; check "Done-when 15 passes after the amend" dw15 "$WT"
row "H6 after the amend" "(B) n=4 -> Done-when 1-15 and Task 6 again, then smoke" B4

echo; echo "######## Fix round 2: the smoke record, one line per check: Smoke: <full sha> 16(<a-f>) <pass|fail> (635, 649)"
setup SM; start; cs 4; post_c4; s=$(git -C "$WT" rev-parse HEAD); cp "$WT/$MEMO" "$W/memo0"
smk "Smoke: $s 16(%s) pass"; row "SM1 n=4; six in-format lines on the current C4, all pass" "a passing smoke -> C5 without repeating it" B4smoked
smk "Smoke: ${s:0:8} 16(%s) pass"; row "SM2 n=4; six lines with an 8-character sha" "not the full sha -> no passing smoke -> reruns, then the smoke again" B4
smk "Smoke: $s 16(%s) PASS"; row "SM3 n=4; six lines reading PASS" "out of format -> no passing smoke" B4
smk "Smoke: $s 16%s pass"; row "SM4 n=4; six lines without the parentheses (16a)" "out of format -> no passing smoke" B4
smk "Smoke: $s 16(%s) pass — owner"; row "SM5 n=4; six lines with trailing text" "out of format -> no passing smoke" B4
cp "$W/memo0" "$WT/$MEMO"; echo "Smoke: $s 16(a–f) pass" >> "$WT/$MEMO"; row "SM6 n=4; one summary line, 16(a–f) pass" "16(a–f) names no single check, so no in-format line for any of (a)-(f) -> no passing smoke" B4
smk "Smoke: $s 16(a) pass"; row "SM7 n=4; six in-format lines, all for 16(a)" "not one line per check (a)-(f) -> no passing smoke" B4
smk "Smoke: $s 16(%s) pass"; sed -i '/ 16(f) pass$/d' "$WT/$MEMO"; row "SM8 n=4; five in-format lines, 16(f) missing" "-> no passing smoke" B4
smk "Smoke: $s 16(%s) pass"; sed -i 's/ 16(e) pass$/ 16(e) fail/' "$WT/$MEMO"; row "SM9 n=4; six in-format lines, 16(e) fail" "not all pass -> no passing smoke" B4
cp "$W/memo0" "$WT/$MEMO"; for x in a b c; do echo "Smoke: $s 16($x) pass" >> "$WT/$MEMO"; done; for x in a b c d e f; do echo "Smoke: $s 16($x) pass" >> "$WT/$MEMO"; done
row "SM10 n=4; an interrupted smoke (a-c), then its complete repeat on the same sha: nine in-format lines, all pass" "the last line for each of (a)-(f) reads pass -> a passing smoke -> C5 without repeating it" B4smoked
check "(control) the earlier reading ('six such lines for it, all pass') rejects the same memo: nine lines, not six" not smoke_ok_six "$s" "$(cat "$WT/$MEMO")"
cp "$W/memo0" "$WT/$MEMO"; smoke_lines "$s" pass; echo "Smoke: $s 16(a) pass" >> "$WT/$MEMO"; echo "Smoke: $s 16(b) fail" >> "$WT/$MEMO"
row "SM11 n=4; a passing smoke, then a repeat stopped after 16(b) fail" "the last 16(b) line reads fail -> no passing smoke" B4
cp "$W/memo0" "$WT/$MEMO"; smoke_lines "$s" fail; smoke_lines "$s" pass
row "SM12 n=4; a smoke with 16(e) fail, then its complete repeat, all pass" "the last line for each check reads pass -> a passing smoke (a completed repeat)" B4smoked
setup SN; start; cs 4; post_c4; s=$(git -C "$WT" rev-parse HEAD); for x in a b c d e f; do echo "Smoke: ${s:0:8} 16($x) pass" >> "$WT/$MEMO"; done; commit_c 5
row "SN n=5; C5's memo records the smoke with an 8-character sha" "no in-format line for C5^ -> (C)" C
setup SP; start; cs 4; post_c4; s=$(git -C "$WT" rev-parse HEAD); for x in a b c; do echo "Smoke: $s 16($x) pass" >> "$WT/$MEMO"; done; smoke_record; commit_c 5
row "SP n=5; C5's memo holds an interrupted smoke (a-c) and its complete repeat on C5^ (nine lines, all pass)" "the last line per check reads pass -> (B) n=5 -> integration" B5
check "(control) the earlier reading ('six such lines') would give (C)" not smoke_ok_six "$(git -C "$O" rev-parse "refs/heads/$B^")" "$(git -C "$O" show "refs/heads/$B:$MEMO")"
integ "SP integration" "no merge yet -> merge -> identical -> push" PUSHED

echo; echo "######## Fix round 2: Done-when 15 passes a path that an Exception: line of the staging memo names (309)"
setup E1; start; cs 3; echo "Exception: tests/ok.test.ts — imports a deleted module" >> "$WT/$MEMO"; C4_EXTRA=M:tests/ok.test.ts; commit_c 4
check "Done-when 15 passes: its one out-of-fence path (M tests/ok.test.ts) is named on an Exception: line" dw15 "$WT"
check "(control) the same commit fails Done-when 15 when the memo has no Exception: line" not dw15_noexc
row "E1 n=4 after C4, which edits an Exception-named file outside Edit sites" "(B) n=4 -> Done-when 1-15 and Task 6 again, then smoke" B4

echo; echo "rows: $ROWS  checks: $CHECKS  mismatches: $FAILS"
[ $FAILS = 0 ]
