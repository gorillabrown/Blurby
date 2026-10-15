// NARRATE-REBUILD-1 P6b — side-effect import, the first import of every command-line-only epic script: refuses plain
// Node (exit 3) before any other module loads. Scripts that are also imported (p0-acoustic, p5-recorded-output-check)
// call assertAppIcu() in their main branch instead, so the suite can still import them under Node.
import { createRequire } from "node:module";
createRequire(import.meta.url)("./app-icu.cjs").assertAppIcu();
