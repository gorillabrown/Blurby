#!/usr/bin/env bash
# F6 trace: execute ROADMAP.md:604-637 step 3 literally in disposable repos, then the auditor's fix order and a refined order.
set -u
ROOT="$(cd "$(dirname "$0")" && pwd)"
RUN="$ROOT/run"
rm -rf "$RUN"; mkdir -p "$RUN"
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@example.invalid GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@example.invalid
export GIT_CONFIG_NOSYSTEM=1 HOME="$RUN"   # isolate from user config
git config --global init.defaultBranch main
git config --global advice.detachedHead false
BR=refs/heads/eb/narrate-remove-1
OM=refs/remotes/origin/main
P="NARRATE-REMOVE-1"
s() { git rev-parse --short "$1"; }

# --- fixture builders -------------------------------------------------------
new_world() {  # $1 = scenario dir; makes origin.git, clone (owner checkout), other (third party)
  local d="$RUN/$1"; mkdir -p "$d"; cd "$d"
  git init -q --bare origin.git
  git clone -q origin.git clone 2>/dev/null
  cd clone
  mkdir -p main src; echo a > main/x.js; echo r > src/r.ts   # a main/ dir exists, as in Blurby
  git add . && git commit -qm "base" && git push -q origin HEAD:refs/heads/main
  git fetch -q origin --prune
  cd "$d"; git clone -q origin.git other 2>/dev/null
  cd "$d/clone"
}
advance_main() {  # unrelated commit pushed by a third party, then owner fetches
  ( cd ../other && git pull -q origin main && echo "$1" >> unrelated.txt && git add unrelated.txt && git commit -qm "unrelated $1" && git push -q origin HEAD:refs/heads/main )
  git fetch -q origin --prune
}
start_branch() {  # step 3(A) literally
  git worktree add -q ../wt -b eb/narrate-remove-1 $OM
  BASE=$(git rev-parse $OM)
}
commit_c() {  # $1 = n
  ( cd ../wt
    echo "c$1" > "src/c$1.ts"; git add "src/c$1.ts"
    if [ "$1" = 1 ]; then
      git commit -q -F - <<EOF
$P C1: positive controls

typecheck=0 test=0 build=0 closure-self-test=0 dangling=0

$P-Base: $BASE
EOF
    else git commit -qm "$P C$1: work $1"; fi )
}
integration_merge() {  # $1 = push|nopush ; clean integration worktree detached at origin/main (main is checked out elsewhere)
  git worktree add -q --detach ../int $OM
  ( cd ../int && git merge -q --no-ff -m "Merge eb/narrate-remove-1" $BR && { [ "$1" = push ] && git push -q origin HEAD:refs/heads/main || true; } )
  git fetch -q origin --prune
}

# --- ROADMAP.md:612-624 step 3, literally ---------------------------------------
# c1mode=any   : C1 located anywhere in the branch history (what the auditor assumed)
# c1mode=range : C1 located inside the only enumeration the recipe defines, <base>..branch (line 619)
literal() {
  local c1mode=$1
  git fetch -q origin --prune                                        # step 1
  local loc rem wtn
  loc=$(git for-each-ref --format=x $BR); rem=$(git for-each-ref --format=x refs/remotes/origin/eb/narrate-remove-1)
  wtn=$(git worktree list --porcelain | grep -c 'narrate-remove-1$')
  if [ -z "$loc$rem" ] && [ "$wtn" = 0 ]; then echo "(A) START: create branch from origin/main and re-run the whole removal"; return; fi
  if [ -z "$loc" ]; then echo "(C) CONFLICT (no local branch)"; return; fi
  local base; base=$(git merge-base $BR $OM)                         # line 617
  local range; range=$(git log --reverse --format='%H %s' $base..$BR) # line 619
  local c1=""
  if [ "$c1mode" = any ]; then c1=$(git log --format='%H %s' $BR | awk -v p="$P" '$2==p && $3=="C1:"{print $1}' | tail -1)
  else c1=$(printf '%s\n' "$range" | awk -v p="$P" '$2==p && $3=="C1:"{print $1}'); fi
  local info="merge-base=$(s $base) tip=$(s $BR)"
  if [ -n "$c1" ]; then
    local tr; tr=$(git log -1 --format=%B "$c1" | sed -n "s/^$P-Base: //p")
    info="$info trailer=$(s $tr)"
    if [ "$tr" != "$base" ]; then echo "$info -> (C) CONFLICT: base != C1 trailer; STOP"; return; fi
  fi
  local n=0 subj
  while IFS= read -r line; do [ -z "$line" ] && continue
    subj=${line#* }
    case "$subj" in "$P C$((n+1)):"*) n=$((n+1));; *) echo "$info -> (C) CONFLICT: subject '$subj'"; return;; esac
  done <<< "$range"
  info="$info n=$n"
  if [ $n = 0 ]; then echo "$info -> (B) n=0: do step 4 (npm ci, base measurement, write C1 with trailer=$(s $base))"
  elif [ $n = 5 ]; then
    if git merge-base --is-ancestor $BR $OM; then echo "$info -> (B) n=5 already on main -> /pointer-closeout"
    else echo "$info -> (B) n=5 -> run integration merge"; fi
  else echo "$info -> (B) resume at C$((n+1))"; fi
}

# --- auditor's fix order, taken literally (F6 'Fix') ------------------------------
# trailer base from C1, verify ancestor of branch, recognize publication FIRST, then classify unfinished work.
auditor_fix() {
  git fetch -q origin --prune
  [ -z "$(git for-each-ref --format=x $BR)" ] && { echo "branch absent -> (A) START"; return; }
  local c1 t
  c1=$(git log --first-parent --format='%H %s' $BR | awk -v p="$P" '$2==p && $3=="C1:"{print $1}')
  t=$([ -n "$c1" ] && git log -1 --format=%B "$c1" | sed -n "s/^$P-Base: //p")
  if git merge-base --is-ancestor $BR $OM; then echo "publication check FIRST says PUBLISHED -> /pointer-closeout (c1=${c1:+yes}${c1:-none})"; return; fi
  [ -z "$c1" ] && { echo "no C1 -> n=0 step 4"; return; }
  git merge-base --is-ancestor "$t" $BR || { echo "(C) trailer base not ancestor"; return; }
  local n=0 subj
  while IFS= read -r line; do [ -z "$line" ] && continue; subj=${line#* }
    case "$subj" in "$P C$((n+1)):"*) n=$((n+1));; *) echo "(C) CONFLICT: subject '$subj' in trailer-base range"; return;; esac
  done <<< "$(git log --first-parent --reverse --format='%H %s' $t..$BR)"
  [ $n = 5 ] && echo "n=5 -> run integration merge" || echo "resume at C$((n+1))"
}

# --- refined order (what this trace recommends) ------------------------------------
refined() {
  git fetch -q origin --prune
  local onmain; onmain=$(git log $OM --format='%H' --grep="^$P C5:" | head -1)
  if [ -z "$(git for-each-ref --format=x $BR)" ]; then
    [ -n "$onmain" ] && { echo "branch absent but C5 is on origin/main -> PUBLISHED -> /pointer-closeout"; return; }
    echo "branch absent, nothing on main -> (A) START"; return
  fi
  local c1 t
  c1=$(git log --first-parent --format='%H %s' $BR | awk -v p="$P" '$2==p && $3=="C1:"{print $1}')
  if [ -z "$c1" ]; then   # n=0: tip must be an ancestor of origin/main with no commits of its own
    [ -z "$(git rev-list $BR ^$OM)" ] && { echo "n=0, base=$(s $BR) -> step 4"; return; }
    echo "(C) branch has commits but no C1"; return
  fi
  t=$(git log -1 --format=%B "$c1" | sed -n "s/^$P-Base: //p")
  [ "$(git rev-parse "$c1^")" = "$t" ] || { echo "(C) C1 parent != trailer base"; return; }
  git merge-base --is-ancestor "$t" $OM || { echo "(C) trailer base not on origin/main (main rewritten?)"; return; }
  local n=0 subj
  while IFS= read -r line; do [ -z "$line" ] && continue; subj=${line#* }
    case "$subj" in "$P C$((n+1)):"*) n=$((n+1));; *) echo "(C) CONFLICT: '$subj' on first-parent trailer-base range"; return;; esac
  done <<< "$(git log --first-parent --reverse --format='%H %s' $t..$BR)"
  if git merge-base --is-ancestor $BR $OM; then
    [ $n = 5 ] && { echo "n=5, trailer=$(s $t) -> PUBLISHED -> /pointer-closeout"; return; }
    echo "(C) partial work (n=$n) on origin/main"; return
  fi
  if [ $n = 5 ]; then
    local m; m=$(git for-each-ref --format='%(objectname)' refs/heads/main; git worktree list --porcelain | sed -n 's/^HEAD //p')
    for h in $m; do
      if [ "$h" != "$(git rev-parse $BR)" ] && git merge-base --is-ancestor $BR "$h" && git merge-base --is-ancestor $OM "$h"; then
        echo "n=5 -> unpushed merge $(s $h) found -> push it, then /pointer-closeout"; return; fi
    done
    echo "n=5 -> run integration merge"; return
  fi
  echo "resume at C$((n+1)) (trailer=$(s $t))"
}

report() {
  echo "== $1"
  echo "   literal[C1 anywhere]: $(literal any)"
  echo "   literal[C1 in range]: $(literal range)"
  echo "   auditor fix order   : $(auditor_fix)"
  echo "   refined order       : $(refined)"
}

# Scenarios ------------------------------------------------------------------------
new_world S0; start_branch;                                          report "S0  branch created, C1 never committed (n=0)"
new_world S1; start_branch; commit_c 1; commit_c 2;                  report "S1  interrupted after C2 (spec walk-through)"
new_world S2; start_branch; commit_c 1; commit_c 2; advance_main u1; report "S2  interrupted after C2, main advanced (unrelated)"
new_world S3; start_branch; for i in 1 2 3 4 5; do commit_c $i; done; advance_main u1
                                                                     report "S3  C1..C5 made, main advanced, not merged"
new_world S4; start_branch; for i in 1 2 3 4 5; do commit_c $i; done; advance_main u1; integration_merge nopush
                                                                     report "S4  merge made in integration worktree, NOT pushed"
new_world S5; start_branch; for i in 1 2 3 4 5; do commit_c $i; done; advance_main u1; integration_merge push
                                                                     report "S5  PUBLISHED: --no-ff merge pushed (main had advanced)"
echo "   control: is-ancestor(branch, origin/main)=$(git merge-base --is-ancestor $BR $OM && echo yes || echo no); merge-base==tip: $([ "$(git merge-base $BR $OM)" = "$(git rev-parse $BR)" ] && echo yes || echo no); base..branch count with merge-base: $(git rev-list --count $(git merge-base $BR $OM)..$BR); recorded base=$(s $BASE)"
new_world S5b; start_branch; for i in 1 2 3 4 5; do commit_c $i; done; integration_merge push
                                                                     report "S5b PUBLISHED with main NOT advanced first"
new_world S6; start_branch; for i in 1 2 3 4 5; do commit_c $i; done; advance_main u1; integration_merge push; advance_main closeout-doc
                                                                     report "S6  PUBLISHED, close-out interrupted after a further main commit"
new_world S7; start_branch; for i in 1 2 3 4 5; do commit_c $i; done; advance_main u1; integration_merge push
git worktree remove ../wt; git branch -q -D eb/narrate-remove-1   # maintenance branch deletion (disposable repo only)
                                                                     report "S7  PUBLISHED, branch later deleted by maintenance, close-out unfinished"
new_world S8; start_branch; commit_c 1; commit_c 2; advance_main u1; ( cd ../wt && git merge -q --no-ff -m "Merge origin/main into branch" $OM )
                                                                     report "S8  integration INTO branch after C2 (back-merge of origin/main)"
