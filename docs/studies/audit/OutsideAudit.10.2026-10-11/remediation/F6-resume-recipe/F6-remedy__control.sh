#!/usr/bin/env bash
# F6 remedy control: runs the PROPOSED step-3 recipe and the CURRENT one (ROADMAP.md:613-623)
# against disposable repos. Usage: control.sh <scratch-dir>
set -u
ROOT="$1"; RUNS="$ROOT/runs"; rm -rf "$RUNS"; mkdir -p "$RUNS/home"
export HOME="$RUNS/home" GIT_CONFIG_NOSYSTEM=1 GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
git config --global init.defaultBranch main
git config --global advice.detachedHead false
B=eb/narrate-remove-1
ctr=0

setup() {
  W="$RUNS/$1"; mkdir -p "$W"
  git init -q --bare -b main "$W/origin.git"
  git clone -q "$W/origin.git" "$W/own" 2>/dev/null
  echo base > "$W/own/f"; git -C "$W/own" add f; git -C "$W/own" commit -qm "base"; git -C "$W/own" push -q origin main
  git clone -q "$W/origin.git" "$W/other" 2>/dev/null
  O="$W/own"; WT="$W/own-wt/nr"; MW="$W/own-wt/nr-merge"
}
advance() {
  ctr=$((ctr+1))
  git -C "$W/other" pull -q --no-rebase origin main
  echo "$ctr" > "$W/other/u$ctr"; git -C "$W/other" add "u$ctr"; git -C "$W/other" commit -qm "unrelated $ctr"
  git -C "$W/other" push -q origin main
}
start() {
  git -C "$O" fetch -q origin --prune
  git -C "$O" worktree add -q "$WT" -b $B refs/remotes/origin/main
  BASE=$(git -C "$O" rev-parse refs/remotes/origin/main)
}
commit() {
  echo "$1" > "$WT/c$1"; git -C "$WT" add "c$1"
  if [ "$1" = 1 ]; then
    git -C "$WT" commit -qm "NARRATE-REMOVE-1 C1: tests" -m "measurement: typecheck 0" -m "NARRATE-REMOVE-1-Base: $BASE"
  else
    git -C "$WT" commit -qm "NARRATE-REMOVE-1 C$1: step $1"
  fi
}
cs() { for i in $(seq 1 "$1"); do commit "$i"; done; }

# Proposed Staging-plan integration: fixed merge worktree, reuse, re-merge is a no-op, push.
integrate() {
  local push=${1:-push}
  git -C "$O" fetch -q origin --prune
  local merged=n
  if [ ! -d "$MW" ]; then
    git -C "$O" worktree add -q --detach "$MW" refs/remotes/origin/main
  else
    if [ -n "$(git -C "$MW" status --porcelain)" ]; then echo "   integrate: (C) dirty merge worktree"; return; fi
    if git -C "$MW" merge-base --is-ancestor refs/heads/$B HEAD; then merged=y; echo "   integrate: merge already made, skip"
    elif git -C "$MW" merge-base --is-ancestor HEAD refs/remotes/origin/main; then git -C "$MW" switch -q --detach refs/remotes/origin/main
    else echo "   integrate: (C) merge worktree holds other commits"; return; fi
  fi
  [ $merged = n ] && echo "   integrate: merge -> $(git -C "$MW" merge --no-ff -m "Merge $B: NARRATE-REMOVE-1" refs/heads/$B 2>&1 | head -1)"
  if [ "$push" = push ]; then
    if git -C "$MW" push -q origin HEAD:refs/heads/main 2>/dev/null; then echo "   integrate: pushed"; else echo "   integrate: push rejected -> (C)"; fi
  fi
}

trailer() { git -C "$O" log -1 --format=%B "$1" | sed -n 's/^NARRATE-REMOVE-1-Base: \([0-9a-f]*\).*/\1/p'; }

# PROPOSED step 3
proposed() {
  git -C "$O" fetch -q origin --prune
  if [ -z "$(git -C "$O" branch --list $B)" ]; then
    if [ -n "$(git -C "$O" branch -r --list '*narrate-remove-1*')$(git -C "$O" worktree list | grep narrate-remove-1)" ]; then echo "(C) remote-only branch or worktree without branch"; return; fi
    if [ -n "$(git -C "$O" log -1 --format=%H --grep='^NARRATE-REMOVE-1 C[1-5]:' refs/remotes/origin/main)" ]; then echo "(C) C-commits on origin/main but no branch"; return; fi
    echo "(A) START"; return
  fi
  local c1 cnt base T tip n=0 s anc lines
  c1=$(git -C "$O" log --format=%H --grep='^NARRATE-REMOVE-1 C1:' refs/heads/$B)
  cnt=$(printf '%s' "$c1" | grep -c .)
  if [ "$cnt" -gt 1 ]; then echo "(C) two C1"; return
  elif [ "$cnt" = 1 ]; then
    T=$(trailer "$c1")
    if [ -z "$T" ] || [ "$(git -C "$O" rev-parse "$c1^")" != "$(git -C "$O" rev-parse "$T")" ]; then echo "(C) C1 parent != trailer"; return; fi
    base=$T
  else
    if [ -n "$(git -C "$O" rev-list refs/heads/$B ^refs/remotes/origin/main)" ]; then echo "(C) commits but no C1"; return; fi
    base=$(git -C "$O" rev-parse refs/heads/$B)
  fi
  while IFS= read -r s; do
    [ -z "$s" ] && continue; n=$((n+1))
    case "$s" in "NARRATE-REMOVE-1 C$n:"*) ;; *) echo "(C) bad chain at #$n: $s"; return;; esac
  done <<< "$(git -C "$O" log --reverse --format=%s "$base"..refs/heads/$B)"
  tip=$(git -C "$O" rev-parse refs/heads/$B)
  if git -C "$O" merge-base --is-ancestor refs/heads/$B refs/remotes/origin/main; then anc=y; else anc=n; fi
  if [ $n = 5 ] && [ $anc = y ]; then
    lines=$(git -C "$O" log --merges --ancestry-path --format="%H %P" refs/heads/$B..refs/remotes/origin/main | grep " $tip\$")
    if [ "$(printf '%s' "$lines" | grep -c .)" = 1 ]; then echo "PUBLISHED -> /pointer-closeout (merge ${lines:0:8})"; return; fi
    echo "(C) on origin/main without exactly one --no-ff merge"; return
  fi
  if [ $n -ge 1 ] && [ $n -le 4 ] && [ $anc = y ]; then echo "(C) partial chain already on origin/main"; return; fi
  [ $n = 0 ] && { echo "(B) n=0 -> step 4"; return; }
  [ $n = 5 ] && { echo "(B) n=5 -> integration"; return; }
  echo "(B) resume C$((n+1))"
}

# CURRENT step 3, C1 searched anywhere on the branch (natural reading of ROADMAP.md:617)
current() {
  [ -z "$(git -C "$O" branch --list $B)" ] && { echo "(A) START"; return; }
  local base c1 T n=0 s
  base=$(git -C "$O" merge-base refs/heads/$B refs/remotes/origin/main)
  c1=$(git -C "$O" log --format=%H --grep='^NARRATE-REMOVE-1 C1:' refs/heads/$B)
  if [ -n "$c1" ]; then
    T=$(trailer "$c1")
    if [ "$base" != "$T" ]; then echo "(C) base ${base:0:8} != trailer ${T:0:8}"; return; fi
  fi
  while IFS= read -r s; do
    [ -z "$s" ] && continue; n=$((n+1))
    case "$s" in "NARRATE-REMOVE-1 C$n:"*) ;; *) echo "(C) chain"; return;; esac
  done <<< "$(git -C "$O" log --reverse --format=%s "$base"..refs/heads/$B)"
  if [ $n = 5 ]; then
    if git -C "$O" merge-base --is-ancestor refs/heads/$B refs/remotes/origin/main; then echo "PUBLISHED"; else echo "(B) n=5 -> integration"; fi; return
  fi
  [ $n = 0 ] && { echo "(B) n=0 -> step 4"; return; }
  echo "(B) resume C$((n+1))"
}

show() { echo "== $1 | expected: $2"; echo "   current : $(current)"; echo "   proposed: $(proposed)"; }

setup S11; show "S11 fresh, no branch" "(A)"
setup S0; start; show "S0 branch, no C1, main static" "n=0 step 4"
setup S0b; start; advance; show "S0b branch, no C1, main advanced" "n=0 step 4"
setup S1; start; cs 2; show "S1 after C2" "resume C3"
setup S2; start; cs 2; advance; show "S2 after C2, main advanced" "resume C3"
setup S3; start; cs 5; advance; show "S3 C1-C5 unmerged, main advanced" "integration"
setup S4; start; cs 5; integrate nopush; show "S4 merged, not pushed" "integration (reuse)"; integrate; show "S4 after re-integrate" "PUBLISHED"
setup S4b; start; cs 5; integrate nopush; advance; show "S4b merged, not pushed, main advanced" "integration"; integrate; show "S4b after rejected push" "n=5 integration, push already reported (C)"
setup S4c; start; cs 5; git -C "$O" worktree add -q --detach "$MW" refs/remotes/origin/main; advance; show "S4c merge worktree created, no merge, main advanced" "integration"; integrate; show "S4c after integrate" "PUBLISHED"
setup S5; start; cs 5; integrate; show "S5 published, main static" "PUBLISHED"
setup S5b; start; cs 5; advance; integrate; advance; advance; show "S5b published, main advanced before and after" "PUBLISHED"
setup S6; start; cs 5; integrate
git -C "$W/other" pull -q --no-rebase origin main; echo x > "$W/other/closeout"; git -C "$W/other" add closeout
git -C "$W/other" commit -qm "docs(closeout): NARRATE-REMOVE-1 partial"; git -C "$W/other" push -q origin main
show "S6 published + partial close-out on main" "PUBLISHED"
setup S7; start; cs 5; integrate; git -C "$O" worktree remove "$WT"; git -C "$O" worktree remove "$MW"; git -C "$O" branch -qD $B
show "S7 published then branch+worktrees removed" "(C), not (A)"
setup S8; start; cs 2; advance; git -C "$O" fetch -q; git -C "$WT" merge -q --no-ff -m "Merge origin/main" refs/remotes/origin/main
show "S8 main merged into branch" "(C)"
setup S9; start; cs 5; git -C "$O" push -q origin refs/heads/$B:refs/heads/main; show "S9 fast-forward publication (no --no-ff)" "(C)"
setup S10; start; cs 2; git -C "$O" push -q origin refs/heads/$B:refs/heads/main; show "S10 C1-C2 already on main" "(C)"
