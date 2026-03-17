Add a new IPC handler to the Electron app.

The user will provide: a channel name and description of what it should do.

Follow this pattern for every new IPC handler:

1. **main.js**: Add `ipcMain.handle("$ARGUMENTS", ...)` inside `registerIPC()` with the implementation
2. **preload.js**: Add the method to `contextBridge.exposeInMainWorld("electronAPI", { ... })`
3. **useLibrary.js** (if it's a library operation) or create a new hook: Add a function that calls `api.newMethod()`
4. Report what was added and remind the user to wire it up in the component that needs it

Maintain the existing patterns:
- Async handlers use `async (_, ...args) =>`
- All file I/O uses `fs.promises` (never sync)
- Return values go through the preload bridge, not direct IPC
