const esbuild = require("C:/Projects/Blurby/node_modules/esbuild");
const path = require("path");
esbuild.build({
  entryPoints: [path.join(__dirname, "harness.ts")],
  bundle: true, platform: "node", format: "cjs", target: "node20",
  outfile: path.join(__dirname, "out", "harness.cjs"),
  define: { "import.meta.env": '{"DEV":true,"MODE":"development","PROD":false}', "import.meta.env.DEV": "true" },
  logLevel: "warning",
}).then(() => console.log("built")).catch((e) => { console.error(e.message); process.exit(1); });
