// FOLIATE-DISPLAY-LIFETIME-1 RodneySr job, route 3: the supplied modes.mjs (all four roots), then cycles.mjs, in one launch.
// node route3.mjs <port> <outDir>
import { spawnSync } from "node:child_process";
import path from "node:path";
const [port, outDir] = process.argv.slice(2);
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
for (const [s, a] of [["modes.mjs", outDir], ["cycles.mjs", path.join(outDir, "cycles.json")]]) {
  const r = spawnSync(process.execPath, [path.join(here, s), port, a], { stdio: "inherit" });
  console.log(`${s} exit ${r.status}`);
}
