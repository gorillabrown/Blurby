#!/usr/bin/env bash
# Replays the REVISED NARRATE-REMOVE-1 reconciliation recipe (ROADMAP.md "Repository reconciliation — run this FIRST"
# steps 1-4, the walk-through, D14, and Staging plan Wave C integration, lines 623-697 of the worktree copy)
# against disposable repos. Derived from remediation/F6-resume-recipe/F6-remedy__control.sh: proposed() -> step3(),
# integrate() rewritten so each command and branch mirrors the final spec text.
# Usage: recipe_v3.sh <scratch-dir>
set -u
ROOT="$1"; RUNS="$ROOT/runs"; rm -rf "$RUNS"; mkdir -p "$RUNS/home"
export HOME="$RUNS/home" GIT_CONFIG_NOSYSTEM=1 GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
git config --global init.defaultBranch main
git config --global advice.detachedHead false
git config --global core.longpaths true # the scratch path is deep; the real C:/Projects/Blurby/.worktrees/... paths are short
B=eb/narrate-remove-1
PERF=tests/perf-baseline-results.json
CO=docs/governance/close-outs
TLOG=$CO/Timing.NARRATE-REMOVE-1.jsonl
MEMO=$CO/Memo.NARRATE-REMOVE-1.GovernanceStaging.2026-10-12.md
ctr=0

setup() {
  W="$RUNS/$1"; mkdir -p "$W"
  git init -q --bare -b main "$W/origin.git"
  git clone -q "$W/origin.git" "$W/own" 2>/dev/null
  mkdir -p "$W/own/tests" "$W/own/$CO"
  echo base > "$W/own/f"; echo '{}' > "$W/own/$PERF"; printf 'node_modules/\n.worktrees/\n' > "$W/own/.gitignore"
  echo x > "$W/own/$CO/CloseOut.OLD.md"
  git -C "$W/own" add f "$PERF" .gitignore "$CO/CloseOut.OLD.md"; git -C "$W/own" commit -qm "base"; git -C "$W/own" push -q origin main
  git clone -q "$W/origin.git" "$W/other" 2>/dev/null
  O="$W/own"; WT="$W/own/.worktrees/narrate-remove-1"; MW="$W/own/.worktrees/narrate-remove-1-merge"
  REG="$W/register"; printf 'TEST-TIMEOUT-HEADROOM-1 completed\nLIBRARY-SETTINGS-FIX-1 completed\nEINK-HOVER-FIX-1 completed\nNARRATE-REMOVE-1 Queued\n' > "$REG"
  NPMLOG="$W/npm.log"; : > "$NPMLOG"; TC_RC=0; TEST_RC=0; SMOKE=pass
}
advance() { # an unrelated commit lands on origin/main from another clone; $1 optional file to touch
  ctr=$((ctr+1)); local f=${1:-u$ctr}
  git -C "$W/other" pull -q --no-rebase origin main
  mkdir -p "$(dirname "$W/other/$f")"; echo "other $ctr" >> "$W/other/$f"; git -C "$W/other" add "$f"; git -C "$W/other" commit -qm "unrelated $ctr"
  git -C "$W/other" push -q origin main
}

# ---- npm stubs. npm test rewrites the tracked perf file, as tests/perf-baseline.test.ts:385-386 does.
npm_ci()        { mkdir -p "$1/node_modules"; echo x > "$1/node_modules/m"; echo "npm ci @$(basename "$1")" >> "$NPMLOG"; }
npm_typecheck() { echo "typecheck @$(basename "$1")" >> "$NPMLOG"; return $TC_RC; }
closure_dot()   { echo "closure . @$(basename "$1")" >> "$NPMLOG"; return 0; }
npm_test()      { echo "{\"run\":$RANDOM}" > "$1/$PERF"; echo "npm test @$(basename "$1")" >> "$NPMLOG"; return $TEST_RC; }
tlog()          { [ -d "$WT" ] && echo "{\"ev\":\"$1\"}" >> "$WT/$TLOG"; } # standing rule 41 time log, appended throughout

# ---- "Where this recipe sits": step 2 (read-only) then the In Flight move. Returns 0 when steps 1, 3, 4 may run.
reg() { sed -n "s/^$1 //p" "$REG"; }
gate_and_claim() { # $1 = owner answer if asked (yes|no)
  local p
  for p in TEST-TIMEOUT-HEADROOM-1 LIBRARY-SETTINGS-FIX-1 EINK-HOVER-FIX-1; do
    [ "$(reg $p)" = completed ] || { echo "STOP at step 2 ($p=$(reg $p)); item stays $(reg NARRATE-REMOVE-1), nothing written"; return 1; }
  done
  if [ "$(reg NARRATE-REMOVE-1)" = "In Flight" ]; then
    [ "${1:-yes}" = yes ] || { echo "STOP: In Flight, owner does not confirm (before step 3)"; return 1; }
  else
    QCOUNT=$(grep -c Queued "$REG"); sed -i 's/^NARRATE-REMOVE-1 .*/NARRATE-REMOVE-1 In Flight/' "$REG"
  fi
  return 0
}

trailer() { git -C "$O" log -1 --format='%(trailers:key=NARRATE-REMOVE-1-Base,valueonly)' "$1" | tr -d '\n'; }
listed() { git -C "$O" worktree list | grep -qE "/$1[[:space:]]"; } # is a worktree with this basename registered

# ---- step 3 (ROADMAP.md 659-675). Echoes the branch taken.
step3() {
  local brs lb rb wtx oc c1 cnt T s tip lines st
  brs=$(git -C "$O" branch -a --list "*narrate-remove-1*" | sed 's/^[*+ ] //')
  lb=$(printf '%s\n' "$brs" | grep -x "$B"); rb=$(printf '%s\n' "$brs" | grep -x "remotes/origin/$B")
  wtx=$(git -C "$O" worktree list | grep narrate-remove-1)
  oc=$(git -C "$O" log -1 --format=%H --grep='^NARRATE-REMOVE-1 C[1-5]:' refs/remotes/origin/main)
  if [ -z "$lb$rb$wtx$oc" ]; then # (A)
    git -C "$O" worktree add -q "$WT" -b $B refs/remotes/origin/main
    BASE=$(git -C "$O" rev-parse refs/remotes/origin/main); N=0
    echo "(A) start -> step 4 (base ${BASE:0:8})"; return
  fi
  [ -n "$lb" ] || { echo "(C) [no local branch: remote=${rb:+y} wt=${wtx:+y} origin-C-commits=${oc:+y}]"; return; }
  c1=$(git -C "$O" log --format=%H --grep='^NARRATE-REMOVE-1 C1:' refs/heads/$B)
  cnt=$(printf '%s' "$c1" | grep -c .)
  if [ "$cnt" -gt 1 ]; then echo "(C) [two C1]"; return
  elif [ "$cnt" = 1 ]; then
    T=$(trailer "$c1")
    if [ -z "$T" ] || [ "$(git -C "$O" rev-parse "$c1^")" != "$(git -C "$O" rev-parse "$T" 2>/dev/null)" ]; then echo "(C) [C1 parent != trailer]"; return; fi
    BASE=$T
  else
    [ -z "$(git -C "$O" rev-list refs/heads/$B ^refs/remotes/origin/main)" ] || { echo "(C) [no C1 but commits off origin/main]"; return; }
    BASE=$(git -C "$O" rev-parse refs/heads/$B)
  fi
  N=0
  while IFS= read -r s; do
    [ -z "$s" ] && continue; N=$((N+1))
    case "$s" in "NARRATE-REMOVE-1 C$N:"*) ;; *) echo "(C) [chain #$N: $s]"; return;; esac
  done <<< "$(git -C "$O" log --reverse --format=%s "$BASE"..refs/heads/$B)"
  [ $N -le 5 ] || { echo "(C) [n=$N, outside 0-5]"; return; }
  tip=$(git -C "$O" rev-parse refs/heads/$B)
  if [ $N = 5 ]; then
    if git -C "$O" merge-base --is-ancestor refs/heads/$B refs/remotes/origin/main; then
      lines=$(git -C "$O" log --merges --ancestry-path --format="%H %P" refs/heads/$B..refs/remotes/origin/main | grep " $tip\$")
      if [ "$(printf '%s' "$lines" | grep -c .)" = 1 ]; then echo "PUBLISHED -> /pointer-closeout (merge ${lines:0:8})"; return; fi
      echo "(C) [on origin/main without exactly one --no-ff merge]"; return
    fi
  elif [ $N -ge 1 ]; then
    git -C "$O" merge-base --is-ancestor refs/heads/$B refs/remotes/origin/main && { echo "(C) [1-4 commits on origin/main]"; return; }
  fi
  if [ ! -d "$WT" ]; then
    if listed narrate-remove-1; then echo "(C) [branch worktree missing but still listed (prunable); no prune]"; return; fi
    git -C "$O" worktree add -q "$WT" $B 2>"$W/reattach.err" || { echo "(?) re-attach failed: $(head -1 "$W/reattach.err")"; return; }
    REATT=" (re-attached)"
  else REATT=""; fi
  # dirt: only C<n+1> paths; perf file, time log and staging memo ignored
  st=$(git -C "$WT" status --porcelain | grep -vE " ($PERF|$TLOG|$CO/Memo\.NARRATE-REMOVE-1\.GovernanceStaging\..*\.md)\$" | grep -vE " c$((N+1))\$")
  [ -z "$st" ] || { echo "(C) [branch worktree dirt outside C$((N+1)): $(printf '%s' "$st" | tr '\n' ' ')]"; return; }
  case $N in
    0) echo "(B) n=0 -> step 4, then C1$REATT";;
    5) local m; m=$(git -C "$O" show "refs/heads/$B:$MEMO" 2>/dev/null)
       if [ "$(printf '%s\n' "$m" | grep -cE '^16\([a-f]\) pass$')" = 6 ]; then echo "(B) n=5 -> Wave C integration$REATT"
       else echo "(C) [n=5 but C5 memo does not record 16(a)-(f) pass]"; fi;;
    *) echo "(B) resume C$((N+1))$REATT";;
  esac
}

# ---- Wave C integration (ROADMAP.md 633-638). $1 stop point: full|after-merge|after-checks ; $2 race (advance origin before push)
integrate() {
  local stop=${1:-full} race=${2:-no} msg st a b c
  git -C "$O" fetch -q origin --prune
  if [ ! -d "$MW" ]; then
    if listed narrate-remove-1-merge; then echo "   integrate: (C) merge worktree listed but missing; no prune"; return; fi
    git -C "$O" worktree add -q --detach "$MW" refs/remotes/origin/main
  else
    st=$(git -C "$MW" status --porcelain | grep -v " $PERF\$")
    [ -z "$st" ] || { echo "   integrate: (C) merge worktree dirty: $(printf '%s' "$st" | tr '\n' ' ')"; return; }
  fi
  if git -C "$MW" merge-base --is-ancestor refs/heads/$B HEAD; then
    echo "   integrate: merge already made, skip to check"
  else
    git -C "$MW" switch -q --detach refs/remotes/origin/main
    if msg=$(git -C "$MW" merge --no-ff -m "Merge eb/narrate-remove-1: NARRATE-REMOVE-1 (Narrate removed, Kokoro dormant)" refs/heads/$B 2>&1); then
      echo "   integrate: merged $(git -C "$MW" rev-parse --short HEAD)"
    else
      echo "   integrate: merge stopped -> (C), worktree left as is: $(printf '%s' "$msg" | grep -m1 -E "CONFLICT|error|fatal")"; return
    fi
  fi
  [ "$stop" = after-merge ] && { echo "   integrate: interrupted after merge"; return; }
  if ! git -C "$MW" diff --quiet refs/heads/$B HEAD; then
    npm_ci "$MW"; npm_typecheck "$MW"; a=$?; closure_dot "$MW"; b=$?; npm_test "$MW"; c=$?
    echo "   integrate: integration-tree check ran (typecheck=$a closure=$b test=$c)"
    { [ $a = 0 ] && [ $b = 0 ] && [ $c = 0 ]; } || { echo "   integrate: check failed -> (C), no push, worktree left as is"; return; }
  else
    echo "   integrate: trees identical, check skipped"
  fi
  [ "$stop" = after-checks ] && { echo "   integrate: interrupted after check, before push"; return; }
  [ "$race" = race ] && advance
  if git -C "$MW" push -q origin HEAD:refs/heads/main 2>/dev/null; then echo "   integrate: pushed"; else echo "   integrate: push rejected -> (C), merge stays"; fi
}

# ---- simulated work in the spec's own commit format (D14, step 4, Staging plan)
start() { gate_and_claim yes >/dev/null; git -C "$O" fetch -q origin --prune; step3 >/dev/null; tlog start; echo "queued: $QCOUNT" > "$WT/$MEMO"; }
commit() {
  echo "$1" > "$WT/c$1"; git -C "$WT" add "c$1"
  if [ "$1" = 1 ]; then
    git -C "$WT" commit -qm "NARRATE-REMOVE-1 C1: positive controls" -m "base measurement: typecheck 0, test 0, build 0" -m "NARRATE-REMOVE-1-Base: $BASE
Co-Authored-By: Claude <noreply@anthropic.com>"
  elif [ "$1" = 5 ]; then
    printf '16(%s) %s\n' a pass b pass c pass d pass e "$SMOKE" f pass >> "$WT/$MEMO"
    git -C "$WT" add "$MEMO" "$TLOG"; git -C "$WT" commit -qm "NARRATE-REMOVE-1 C5: staging memo, smoke record, time log"
  else
    git -C "$WT" commit -qm "NARRATE-REMOVE-1 C$1: step $1"
  fi
  npm_test "$WT" >/dev/null; tlog "C$1"
}
cs() { for i in $(seq 1 "$1"); do commit "$i"; done; }

session() { local r; r=$(gate_and_claim "${1:-yes}") || { echo "$r"; return; }; git -C "$O" fetch -q origin --prune; step3; }
row() { echo "== $1"; echo "   expected (spec): $2"; echo "   actual         : $(session "${3:-yes}")"; }

# ======== scenarios
setup FRESH; echo "== FRESH register Queued, prerequisites completed"; echo "   expected (spec): step 2 passes, item -> In Flight, (A)"
echo "   actual         : $(session) | register: $(reg NARRATE-REMOVE-1)"
setup GATE; sed -i 's/^EINK-HOVER-FIX-1 .*/EINK-HOVER-FIX-1 Queued/' "$REG"; h0=$(md5sum < "$REG"); r0=$(git -C "$O" for-each-ref | md5sum)
echo "== GATE prerequisite not completed"; echo "   expected (spec): step 2 stops; item stays Queued; nothing written"
echo "   actual         : $(session) | register: $(reg NARRATE-REMOVE-1), reg unchanged=$([ "$h0" = "$(md5sum < "$REG")" ] && echo y || echo n), refs unchanged=$([ "$r0" = "$(git -C "$O" for-each-ref | md5sum)" ] && echo y || echo n), worktrees=$(git -C "$O" worktree list | wc -l)"
setup S11; row "S11 fresh, no branch" "(A)"
setup IBC; gate_and_claim yes >/dev/null; row "IBC interrupted before branch creation (In Flight, owner confirms)" "(A)"
setup OWN; gate_and_claim yes >/dev/null; row "OWN In Flight, owner does not confirm" "stop at the In Flight move, before step 3" no
setup S0; start; row "S0 branch, no C1, main static (time log + memo untracked)" "(B) n=0 -> step 4"
setup S0b; start; advance; row "S0b branch, no C1, main advanced" "(B) n=0 -> step 4"
setup S1; start; cs 2; row "S1 after C2 (time log + memo uncommitted, perf dirty)" "(B) resume C3"
setup S1T; start; cs 2; echo partial > "$WT/c3"; row "S1T after C2 with C3 work in progress + time log + memo" "(B) resume C3 (prev issue 2)"
setup S1X; start; cs 2; echo stray > "$WT/stray"; row "S1X after C2 with a stray file outside C3" "(C) dirt outside C3"
setup S2; start; cs 2; advance; row "S2 after C2, main advanced" "(B) resume C3"
setup S3; start; cs 5; advance; row "S3 C1-C5 unmerged, main advanced (integration-tree check triggers)" "(B) n=5 -> integration"
integrate; row "S3 after integrate" "PUBLISHED"; echo "   npm log: $(tr '\n' ';' < "$NPMLOG")"
setup S4; start; cs 5; integrate after-merge; row "S4 merged, not pushed (main static)" "(B) n=5 -> integration reuses the merge"
integrate; row "S4 after re-integrate" "PUBLISHED"
setup S4b; start; cs 5; integrate after-merge; advance; row "S4b merged, not pushed, main advanced after the merge" "(B) n=5 -> integration; push rejected -> (C)"
integrate; row "S4b after the rejected push" "(B) n=5 again; integration reuses and is rejected again -> (C)"
setup S4c; start; cs 5; git -C "$O" worktree add -q --detach "$MW" refs/remotes/origin/main; advance; row "S4c merge worktree created, no merge, main advanced" "(B) n=5 -> integration"
integrate; row "S4c after integrate" "PUBLISHED"
setup S4d; start; cs 5; advance; integrate after-checks; row "S4d main moved; merged + check ran (perf dirty in merge wt); interrupted before push" "(B) n=5 -> integration reuses merge, check reruns, push (prev issue 1)"
integrate; row "S4d after re-integrate" "PUBLISHED"
setup S5; start; cs 5; integrate; row "S5 published, main static" "PUBLISHED"
setup S5b; start; cs 5; advance; integrate; advance; advance; row "S5b published, main advanced before and after" "PUBLISHED"
setup S6; start; cs 5; integrate; advance "$CO/CloseOut.NARRATE-REMOVE-1.2026-10-12.md"; row "S6 published + partial close-out on main" "PUBLISHED"
setup S7; start; cs 5; integrate; git -C "$O" worktree remove --force "$WT"; git -C "$O" worktree remove --force "$MW"; git -C "$O" branch -qD $B
row "S7 published then branch + worktrees removed" "(C), not (A)"
setup S7b; start; cs 5; integrate; git -C "$O" worktree remove --force "$WT"; git -C "$O" branch -qD $B
row "S7b published, branch removed, merge worktree kept" "(C)"
setup S7c; start; cs 5; integrate; git -C "$O" worktree remove --force "$WT"; row "S7c published, branch worktree removed, branch kept" "PUBLISHED (before re-attach)"
setup S8; start; cs 2; advance; git -C "$O" fetch -q; git -C "$WT" merge -q --no-ff -m "Merge origin/main" refs/remotes/origin/main
row "S8 main merged into branch" "(C)"
setup S9; start; cs 5; git -C "$O" push -q origin refs/heads/$B:refs/heads/main; row "S9 fast-forward publication (no --no-ff)" "(C)"
setup S10; start; cs 2; git -C "$O" push -q origin refs/heads/$B:refs/heads/main; row "S10 C1-C2 already on main" "(C)"
setup IMP; start; cs 5; row "IMP n=5 before merge" "(B) n=5 -> integration"
integrate after-merge; row "IMP interrupted between merge and push (main static)" "(B) n=5 -> integration finds the merge and pushes it"
integrate; row "IMP after re-integrate" "PUBLISHED"
setup PR; start; cs 5; echo "== PR push rejected (origin/main moves between fetch and push)"; echo "   expected (spec): rejected push -> (C); merge stays in the merge worktree"; integrate full race
echo "   merge worktree HEAD contains the branch: $(git -C "$MW" merge-base --is-ancestor refs/heads/$B HEAD && echo y || echo n)"
row "PR next session" "(B) n=5 -> integration reuses the stale merge -> rejected again -> (C)"; integrate
setup MAR; start; cs 5; advance; row "MAR main advanced during the run" "(B) n=5 -> integration; integration-tree check: npm ci, typecheck, closure, npm test; push"
integrate; echo "   npm log: $(tr '\n' ';' < "$NPMLOG")"; row "MAR after integrate" "PUBLISHED"
setup MARF; start; cs 5; advance; TEST_RC=1; echo "== MARF main advanced, integration-tree check fails"; echo "   expected (spec): no push; (C) (prev issue 3)"; integrate
TEST_RC=0; row "MARF next session (after the decision allows a rerun)" "(B) n=5 -> integration reuses merge, reruns check"; integrate
row "MARF after re-integrate" "PUBLISHED"
setup MCF; start; echo "own" > "$WT/f"; git -C "$WT" add f; cs 5; advance f
row "MCF main advanced with a conflicting change" "(B) n=5 -> integration"; integrate
echo "   merge worktree state: $(git -C "$MW" status --porcelain | tr '\n' ' ')"
row "MCF next session" "(B) n=5 -> integration -> (C) dirty merge worktree (prev issue 3)"; integrate
setup S12; git -C "$W/other" push -q origin refs/heads/main:refs/heads/$B; row "S12 remote-only branch" "(C)"
setup S13; start; cs 2; rm -rf "$WT"; row "S13 branch worktree dir deleted by hand (still listed)" "(C), no prune (prev issue 4)"
setup S14; start; cs 2; git -C "$O" worktree remove --force "$WT"; row "S14 branch worktree removed with git worktree remove" "(B) re-attach, resume C3"
echo "   re-attached HEAD: $(git -C "$WT" symbolic-ref -q HEAD)"
setup S15; start; cs 5; integrate after-merge; rm -rf "$MW"; row "S15 merge worktree dir deleted by hand after the merge (still listed)" "(B) n=5 -> integration"
integrate; echo "   expected (spec): integration -> (C), no prune (prev issue 4)"
setup S15b; start; cs 5; integrate after-merge; git -C "$O" worktree remove --force "$MW"; row "S15b merge worktree removed with git worktree remove after merge" "(B) n=5 -> integration"
integrate; row "S15b after integrate (fresh merge worktree, merge redone)" "PUBLISHED"
setup SMF; SMOKE=fail; start; cs 5; row "SMF C5 memo records 16(e) fail" "(C)"
setup S6N; start; cs 5; echo 6 > "$WT/c6"; git -C "$WT" add c6; git -C "$WT" commit -qm "NARRATE-REMOVE-1 C6: extra"; row "S6N a sixth C commit" "(C) (n outside 0-5)"
setup S1F; start; cs 2; git -C "$WT" commit -q --amend -m "NARRATE-REMOVE-1 C2: step 2 (amended)"; row "S1F C2 amended (still one C2)" "(B) resume C3"
setup FRESHM; echo "== FRESHM fresh start; step 2's queued count written to the memo 'once the worktree exists', then step 4"
echo "   expected (spec): (A), then step 4 'For (A), git status --porcelain must be empty' (no route if not)"
echo "   actual         : $(session); memo written; step 4 status: [$(echo "queued: $QCOUNT" > "$WT/$MEMO"; tlog open; git -C "$WT" status --porcelain | tr '\n' ' ')]"
