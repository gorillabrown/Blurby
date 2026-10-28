#!/usr/bin/env node
// Bundles @mozilla/readability into a standalone IIFE for the Chrome extension.
// Run: node chrome-extension/bundle-readability.js

const fs = require("fs");
const path = require("path");

const readabilityPath = path.join(__dirname, "..", "node_modules", "@mozilla", "readability", "Readability.js");
const src = fs.readFileSync(readabilityPath, "utf-8");

const bundle = `// @mozilla/readability — bundled for Chrome extension
// License: Apache-2.0
(function(global) {
${src}
  if (typeof module !== "undefined" && module.exports) {
    // This shouldn't run in a content script, but just in case
    module.exports = { Readability };
  } else {
    global.Readability = Readability;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this);
`;

const outPath = path.join(__dirname, "readability.js");
fs.writeFileSync(outPath, bundle, "utf-8");
console.log(`Bundled Readability.js to ${outPath} (${(Buffer.byteLength(bundle) / 1024).toFixed(1)} KB)`);
