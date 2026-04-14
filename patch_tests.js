const fs = require('fs');

// Patch epubWordExtractor.test.js
let content = fs.readFileSync('tests/epubWordExtractor.test.js', 'utf8');
content = content.replace(
  /const \{ segmentWords \} = require\("\.\.\/src\/utils\/segmentWords\.ts"\);/g,
  `import { segmentWords } from "../src/utils/segmentWords.ts";`
);
fs.writeFileSync('tests/epubWordExtractor.test.js', content);

// Patch metadata-wizard.test.js
let metadataTest = fs.readFileSync('tests/metadata-wizard.test.js', 'utf8');
// Fix Windows path test: "C:\\Books\\Author - Title.epub" -> parseFilenameMetadata should strip "C:\\Books\\"
// But `path.basename` in node behaves differently depending on process.platform!
// In vitest it runs on the platform (Ubuntu). On Ubuntu `path.basename("C:\\Books\\Author - Title.epub")` returns the whole string because it looks for `/`.
// We can modify the test to conditionally skip or use path.win32.basename in the code.
// Let's modify the code in main/metadata-utils.js instead, so it works cross-platform.
