#!/usr/bin/env bash
# Final-command gate replay for ROADMAP.md NARRATE-REMOVE-1 (OutsideAudit.10 D4 follow-up). Read-only on the worktree.
# usage: bash run-gates-final.sh <worktree root, POSIX path> <fresh run directory, POSIX path>
set -u
S=$(cd "$(dirname "$0")" && pwd); WT=$1; RUN=$2
mkdir -p "$RUN" && cd "$RUN" || exit 2
mkdir -p out res trees base-blobs/main/ipc tmp
w() { cygpath -w "$1"; }
pwsh7() { pwsh -NoProfile -File "$(w "$1")" "${@:2}"; }
ps51() { powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$(w "$1")" "${@:2}"; }
{ echo "date: $(date -Iseconds)"; git --version; echo "pwsh $(pwsh -NoProfile -Command '$PSVersionTable.PSVersion.ToString()')";
  echo "powershell.exe $(powershell.exe -NoProfile -Command '$PSVersionTable.PSVersion.ToString()')"; bash --version | head -1; echo "node $(node --version)";
  echo "worktree HEAD $(git -C "$WT" rev-parse HEAD); refs/remotes/origin/main $(git -C "$WT" rev-parse refs/remotes/origin/main)";
  echo "code paths differing from b4335606 (src main main.js preload.js package.json .github tests): $(git -C "$WT" diff --name-only b4335606 -- src main main.js preload.js package.json .github tests | wc -l)"; } > out/environment.txt
cp "$WT/ROADMAP.md" ROADMAP.snapshot.md
H0=$(sha256sum ROADMAP.snapshot.md | cut -d' ' -f1)
# 1. inventory and parsers
node "$S/extract.cjs" ROADMAP.snapshot.md out
node -e 'const j=require("./out/commands.json");require("fs").writeFileSync("out/commands.raw.txt",j.rows.map(r=>r.raw).join("\n")+"\n")'
pwsh7 "$S/parse.ps1" -File "$(w out/commands.substituted.txt)" -Out "$(w "$RUN/out/parse.pwsh7.txt")"
ps51 "$S/parse.ps1" -File "$(w out/commands.substituted.txt)" -Out "$(w "$RUN/out/parse.ps51.txt")"
pwsh7 "$S/parse.ps1" -File "$(w out/commands.raw.txt)" -Out "$(w "$RUN/out/parse-raw-placeholders.pwsh7.txt")"
ps51 "$S/parse.ps1" -File "$(w out/commands.raw.txt)" -Out "$(w "$RUN/out/parse-raw-placeholders.ps51.txt")"
# 2. argv each shell delivers (programs replaced by an echo; nothing is executed)
node "$S/mkecho.cjs" out/commands.json "$(w "$S/echo.cjs")" "$S/echo.cjs" "$RUN"
pwsh7 echo.ps1 > out/argv.pwsh7.txt 2>&1; ps51 echo.ps1 > out/argv.ps51.txt 2>&1; bash echo.sh > out/argv.bash.txt 2>&1
{ diff out/argv.pwsh7.txt out/argv.ps51.txt >/dev/null && echo "pwsh7 vs ps51: identical argv for all $(wc -l < out/argv.pwsh7.txt) commands" || echo "pwsh7 vs ps51: DIFFERENT";
  echo "pwsh7 vs bash (differing ids):"; diff out/argv.pwsh7.txt out/argv.bash.txt | grep '^<' | cut -c3-5; } > out/argv.compare.txt
# 3. gate lists
node "$S/mkgates.cjs"
run3() { # gates.json cwdPosix resPrefix [utf8]
  for s in pwsh7 ps51 bash; do mkdir -p "res/$3$s"; node "$S/mkrunner.cjs" "$1" "$(w "$2")" "$2" "$(w "$RUN/res/$3$s")" "$RUN/res/$3$s" "run-$3$s" ${4:-}; done
  pwsh7 "run-$3pwsh7.ps1"; ps51 "run-$3ps51.ps1"; bash "run-$3bash.sh"; }
# 4. step 4 positive controls on the worktree (verbatim), then a UTF-8-console PowerShell rerun for byte comparison
run3 out/positive-controls.gates.json "$WT" pc-
for s in pwsh7 ps51; do mkdir -p "res/pcu-$s"; node "$S/mkrunner.cjs" out/positive-controls.gates.json "$(w "$WT")" "$WT" "$(w "$RUN/res/pcu-$s")" "$RUN/res/pcu-$s" "run-pcu-$s" utf8; done
pwsh7 run-pcu-pwsh7.ps1; ps51 run-pcu-ps51.ps1
node "$S/evalpc.cjs"; node "$S/evalpcu.cjs"
# 5. Done-when 7 wiring gates on scratch trees: base, prescribed Edit-site text, three wrong variants, supplementary variants
for f in main.js main/sync-engine.js main/ipc/state.js; do git -C "$WT" show "b4335606:$f" > "base-blobs/$f"; done
(cd base-blobs && sha256sum main.js main/sync-engine.js main/ipc/state.js) > out/base-blobs.sha256
node "$S/apply-variants.cjs" base-blobs trees
for d in trees/*/; do (cd "$d" && git init -q && git -c core.autocrlf=false -c core.safecrlf=false add main.js main/sync-engine.js main/ipc/state.js); done
for t in $(ls trees | grep -v variants.json); do run3 out/wiring.gates.json "$RUN/trees/$t" "w-$t-"; done
for t in $(ls trees | grep -v variants.json); do for f in main.js main/sync-engine.js main/ipc/state.js; do diff -U0 "base-blobs/$f" "trees/$t/$f" | sed -E "s|^--- base-blobs/|--- base/|; s|^[+]{3} trees/|+++ |; /^(---|[+]{3}) /s|\t.*$||"; done; done > out/variants.diff
cp trees/variants.json out/variants.json
node "$S/evalwiring.cjs"
# 6. supplementary statements: constants-family expansion, closure check, proposed adjacency gates
run3 out/constants-family.gates.json "$WT" k-
node "$S/evalsimple.cjs" out/constants-family.gates.json k- out/constants-family.result.txt ""
run3 out/gate-rule.gates.json "$WT" r-
node "$S/evalsimple.cjs" out/gate-rule.gates.json r- out/gate-rule.result.txt ""
for t in prescribed supp-main-no-save supp-state-misplaced; do run3 out/adjacency.gates.json "$RUN/trees/$t" "a-$t-"; done
node "$S/evalsimple.cjs" out/adjacency.gates.json a- out/adjacency-proposal.result.txt prescribed supp-main-no-save supp-state-misplaced
awk '/^<a id="narrate-remove-1"><\/a>$/{f=1} /^<a id="narrate-rebuild-1"><\/a>$/{f=0} f' ROADMAP.snapshot.md | awk '/^    ```js$/{f=1;next} /^    ```$/{f=0} f' | sed 's/^    //' > closure-check.mjs
cat > run-closure.ps1 <<PS
\$env:TEMP = '$(w "$RUN/tmp")'; \$env:TMP = '$(w "$RUN/tmp")'
Set-Location -LiteralPath '$(w "$WT")'
"PS " + \$PSVersionTable.PSVersion
node '$(w "$RUN/closure-check.mjs")' --self-test; "exit=\$LASTEXITCODE"
node '$(w "$RUN/closure-check.mjs")' .; "exit=\$LASTEXITCODE"
PS
{ echo "closure-check.mjs sha256 $(sha256sum closure-check.mjs | cut -d' ' -f1) ($(wc -l < closure-check.mjs) lines, extracted verbatim from the snapshot)"; pwsh7 run-closure.ps1 2>&1; ps51 run-closure.ps1 2>&1; } | tr -d '\r' > out/closure-check.txt
# 7. the ROADMAP must not have changed during the replay
H1=$(sha256sum "$WT/ROADMAP.md" | cut -d' ' -f1)
{ echo "ROADMAP.md sha256 at start $H0"; echo "ROADMAP.md sha256 at end   $H1"; [ "$H0" = "$H1" ] && echo "unchanged during the replay" || echo "CHANGED DURING THE REPLAY"; } > out/roadmap.sha256.txt
cat out/roadmap.sha256.txt
awk '/^<a id="narrate-remove-1"><\/a>$/{f=1} /^<a id="narrate-rebuild-1"><\/a>$/{f=0} f' ROADMAP.snapshot.md > out/roadmap-section.snapshot.txt
SEC=$(node -e 'const j=require("./out/commands.json");console.log(j.section.join("-"))')
echo "section text (ROADMAP lines $SEC) sha256 $(sha256sum out/roadmap-section.snapshot.txt | cut -d' ' -f1)" >> out/roadmap.sha256.txt
