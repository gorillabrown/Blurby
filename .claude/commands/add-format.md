Add support for a new file format to Blurby.

The user will provide: the file extension(s) and any specific parsing library to use.

Steps:
1. **main.js**: Add the extension(s) to the `SUPPORTED_EXT` array
2. **main.js**: If the format needs a parser (e.g., EPUB, PDF), add a content extraction function:
   - Install the parsing library: `npm install <library>`
   - Create an async function that takes a filepath and returns plain text
   - Wire it into `scanFolderAsync()` and the `load-doc-content` handler
3. **DocCard.jsx**: The extension badge already shows `doc.ext`, so no change needed
4. **tests/**: Add a basic test for the new format's text extraction if applicable
5. Run `npm test` and `npm run build` to verify nothing broke
6. Report what was added and any caveats (e.g., "PDF extraction may not handle scanned documents")
