#!/usr/bin/env bash
# Disposable control for OutsideAudit.10 F6 (resume recipe, ROADMAP.md:609-637).
# Emulates step 3 (B) literally, plus a candidate fix, across scenarios.
set -u
W="$(cd "$(dirname "$0")" && pwd)/run"
rm -rf "$W"; mkdir -p "$W"; cd "$W"
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
g() { git -c init.defaultBranch=main -c core.autocrlf=false "$@"; }
BR=eb/narrate-remove-1

g init -q --bare origin.git
g clone -q origin.git main-co 2>/dev/null
cd main-co
echo base > f.txt; g add f.txt; g commit -q -m "base"; g push -q origin HEAD:refs/heads/main
g fetch -q origin --prune
BASE=$(g rev-parse refs/remotes/origin/main)

# Literal emulation of recipe step 3 (B). $1 = interpretation of "If C1 exists":
#   any   = C1 exists anywhere in branch history (git log --grep on branch)
#   range = C1 exists in <base>..branch (the only enumeration the recipe prescribes)
recipe_B() {
  local interp=$1
  g fetch -q origin --prune
  local mb; mb=$(g merge-base refs/heads/$BR refs/remotes/origin/main)
  local c1=""
  if [ "$interp" = any ]; then
    c1=$(g log --format=%H --grep="^NARRATE-REMOVE-1 C1:" refs/heads/$BR | tail -1)
  else
    c1=$(g log --reverse --format=%H "$mb..refs/heads/$BR" | head -1)
    if [ -n "$c1" ] && ! g log -1 --format=%s "$c1" | grep -q '^NARRATE-REMOVE-1 C1:'; then c1=""; fi
  fi
  local trailer=""
  if [ -n "$c1" ]; then
    trailer=$(g log -1 --format=%B "$c1" | sed -n 's/^NARRATE-REMOVE-1-Base: //p')
    if [ "$trailer" != "$mb" ]; then
      echo "mb=${mb:0:8} trailer=${trailer:0:8} -> (C) CONFLICT: base != C1 trailer"; return
    fi
  fi
  local i=0 ok=1
  while read -r s; do
    [ -z "$s" ] && continue
    i=$((i+1))
    case "$s" in "NARRATE-REMOVE-1 C$i:"*) ;; *) ok=0;; esac
  done < <(g log --reverse --format=%s "$mb..refs/heads/$BR")
  if [ $ok = 0 ]; then echo "mb=${mb:0:8} -> (C) CONFLICT: non-prefixed or gapped commit in range"; return; fi
  local n=$i
  if [ $n = 0 ]; then echo "mb=${mb:0:8} c1=${c1:0:8} n=0 -> (B) do step 4 (write C1)"; return; fi
  if [ $n = 5 ]; then
    if g merge-base --is-ancestor refs/heads/$BR refs/remotes/origin/main; then
      echo "mb=${mb:0:8} n=5 -> (B) ALREADY ON MAIN -> /pointer-closeout"
    else
      echo "mb=${mb:0:8} n=5 -> (B) run integration merge"
    fi
    return
  fi
  echo "mb=${mb:0:8} n=$n -> (B) resume at C$((n+1))"
}

# Candidate fix: base from C1 trailer, base ancestor of branch, chain check from trailer,
# publication recognized only when the full chain C1..C5 exists AND branch is in origin/main.
fix_B() {
  g fetch -q origin --prune
  local c1; c1=$(g log --format=%H --grep="^NARRATE-REMOVE-1 C1:" refs/heads/$BR | tail -1)
  local base
  if [ -n "$c1" ]; then
    base=$(g log -1 --format=%B "$c1" | sed -n 's/^NARRATE-REMOVE-1-Base: //p')
    g merge-base --is-ancestor "$base" refs/heads/$BR || { echo "fix: (C) trailer base not ancestor"; return; }
    [ "$(g rev-parse "$c1^")" = "$base" ] || { echo "fix: (C) C1 parent != trailer"; return; }
  else
    base=$(g rev-parse refs/heads/$BR)  # n=0: branch tip is the base
  fi
  local i=0 ok=1
  while read -r s; do [ -z "$s" ] && continue; i=$((i+1)); case "$s" in "NARRATE-REMOVE-1 C$i:"*) ;; *) ok=0;; esac; done < <(g log --reverse --format=%s "$base..refs/heads/$BR")
  [ $ok = 1 ] || { echo "fix: (C) non-prefixed commit in trailer-base range"; return; }
  local n=$i pub=no
  g merge-base --is-ancestor refs/heads/$BR refs/remotes/origin/main && pub=yes
  local naive="no"; [ $pub = yes ] && naive="PUBLISHED"
  if [ $n = 5 ] && [ $pub = yes ]; then echo "fix: n=5 published -> /pointer-closeout (naive is-ancestor-first says: $naive)"; return; fi
  echo "fix: n=$n published=$pub -> resume/merge as usual (naive is-ancestor-first says: $naive)"
}

report() { echo "== $1"; echo -n "   literal[any]  : "; recipe_B any; echo -n "   literal[range]: "; recipe_B range; echo -n "   "; fix_B; }

commitC() { # $1 n
  echo "c$1" > "c$1.txt"; g add "c$1.txt"
  if [ "$1" = 1 ]; then g commit -q -m "NARRATE-REMOVE-1 C1: positive controls" -m "base measurement..." -m "NARRATE-REMOVE-1-Base: $BASE"
  else g commit -q -m "NARRATE-REMOVE-1 C$1: work"; fi
}
advance_main() { # other work lands on origin/main via a separate clone
  ( cd "$W" && rm -rf other && g clone -q origin.git other 2>/dev/null && cd other && echo "$1" > "$1.txt" && g add "$1.txt" && g commit -q -m "other: $1" && g push -q origin HEAD:refs/heads/main )
}

g worktree add -q "$W/wt" -b $BR refs/remotes/origin/main
report "S0 n=0: branch created, no C1, main unchanged"
advance_main other0
report "S0b n=0: branch created, no C1, main advanced"
cd "$W/wt"; commitC 1; commitC 2; cd "$W/main-co"
report "S1 interrupted after C2"
advance_main other1
report "S2 after C2, origin/main advanced by unrelated merge"
cd "$W/wt"; commitC 3; commitC 4; commitC 5; cd "$W/main-co"
report "S3 C1..C5 made, not merged"
# Integration worktree, detached at origin/main, --no-ff merge, NOT pushed
g worktree add -q --detach "$W/integ" refs/remotes/origin/main
( cd "$W/integ" && g merge -q --no-ff -m "Merge $BR" refs/heads/$BR )
report "S4 merge-before-push (merge made in integration worktree, not pushed)"
( cd "$W/integ" && g push -q origin HEAD:refs/heads/main )
report "S5 PUBLISHED (merge pushed), close-out interrupted"
echo "   is-ancestor(branch, origin/main): $(g merge-base --is-ancestor refs/heads/$BR refs/remotes/origin/main && echo yes || echo no)"
echo "   merge-base == branch tip: $( [ "$(g merge-base refs/heads/$BR refs/remotes/origin/main)" = "$(g rev-parse refs/heads/$BR)" ] && echo yes || echo no)"
echo "   git log base..branch (with mb) count: $(g rev-list --count "$(g merge-base refs/heads/$BR refs/remotes/origin/main)..refs/heads/$BR")"
advance_main other2
report "S6 PUBLISHED then main advanced further"

# S7: unprescribed back-merge of origin/main into the branch (separate repo state: replay quickly)
echo "== S7 (separate history) back-merge of main into an unfinished branch"
cd "$W"; rm -rf s7 && mkdir s7 && cd s7
g init -q --bare origin.git; g clone -q origin.git co 2>/dev/null; cd co
echo base > f.txt; g add f.txt; g commit -q -m base; g push -q origin HEAD:refs/heads/main; g fetch -q origin
BASE=$(g rev-parse refs/remotes/origin/main)
g switch -q -c $BR
commitC 1; commitC 2
( cd .. && g clone -q origin.git other 2>/dev/null && cd other && echo x > x.txt && g add x.txt && g commit -q -m "other: x" && g push -q origin HEAD:refs/heads/main )
g fetch -q origin; g merge -q --no-ff -m "Merge origin/main into $BR" refs/remotes/origin/main
echo -n "   literal[any]  : "; recipe_B any
echo -n "   "; fix_B
