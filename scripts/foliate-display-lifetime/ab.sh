#!/usr/bin/env bash
# FOLIATE-DISPLAY-LIFETIME-1 RodneySr A/B (Brain ruling 2026-10-30): R1 x N then R2-R5 once, for one build.
# bash ab.sh <control|cand> <exe> <firstR1> <lastR1> [r1only]
set -u
w=$1; exe=$2; a=$3; b=$4; only=${5:-}
cd "$(dirname "$0")"
out='C:\Projects\Blurby-artifacts\foliate-display-lifetime-1'
export NARRATE_MODELS_ROOT='C:\Projects\Blurby-artifacts\narrate-quit-linger-1\models'
models() { sha256sum "$NARRATE_MODELS_ROOT/onnx-community/Kokoro-82M-v1.0-ONNX/onnx/model_q4.onnx" "$NARRATE_MODELS_ROOT/local/kokoro-dur/onnx/model_q4.onnx" | cut -c1-9 | tr '\n' ' '; echo; }
for i in $(seq $a $b); do
  node run.mjs --exe "$exe" --label $w-r1-session-$i --out "$out" --port $((9400 + i)) -- session.mjs '{ERRLOG}' '{OUT}\session.json'
done
[ -n "$only" ] && { echo "$w r1 $a-$b done"; exit 0; }
node run.mjs --exe "$exe" --label $w-r2-census --out "$out" --port 9422 -- census.mjs '{OUT}\census.json' --via-focus
echo "models before r3: $(models)"
node run.mjs --exe "$exe" --label $w-r3-modes-cycles --out "$out" --port 9423 -- route3.mjs '{OUT}'
node run.mjs --exe "$exe" --label $w-r4-owned91 --out "$out" --port 9424 --seed owned91 --fixture 'C:\Projects\fdl1-job\inputs\fixture-owned91' -- owned91.mjs '{OUT}'
node run.mjs --exe "$exe" --label $w-r5-defaults --out "$out" --port 9425 -- route5.mjs '{ERRLOG}' '{OUT}'
echo "$w done"
