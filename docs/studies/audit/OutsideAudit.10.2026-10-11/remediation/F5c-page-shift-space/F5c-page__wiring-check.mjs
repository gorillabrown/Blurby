// Read-only: map ReaderContainer's positional useReaderKeys args onto the hook's parameter names.
import { readFileSync } from "node:fs";
const root = process.argv[2];
const hook = readFileSync(`${root}/src/hooks/useKeyboardShortcuts.ts`, "utf8");
const sig = hook.match(/export function useReaderKeys\(([\s\S]*?)\)\s*\{/)[1];
const params = sig.split(",").map((p) => p.trim().split(/[?:]/)[0].trim()).filter(Boolean);
const lines = readFileSync(`${root}/src/components/ReaderContainer.tsx`, "utf8").split(/\r?\n/);
const idx = lines.findIndex((l) => l.includes("useReaderKeys("));
const call = lines[idx].match(/useReaderKeys\((.*)\);/)[1];
const args = call.split(",").map((a) => a.trim());
console.log(`call at ReaderContainer.tsx:${idx + 1}; params=${params.length} args=${args.length}`);
params.forEach((p, i) => { if (/cycle|togglePlay|readerMode|enterFocus|enterFlow/i.test(p)) console.log(`  #${i + 1} ${p} <- ${args[i]}`); });
