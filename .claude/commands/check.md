Run a full project health check.

1. Run `npm run build` — verify Vite build succeeds
2. Run `npm test` — verify all tests pass
3. Check for any `console.log` statements left in source files (not tests)
4. Check for any TODO/FIXME/HACK comments in source files
5. Verify `preload.js` and `main.js` IPC handlers are symmetric (every handler in main.js has a matching entry in preload.js)
6. Report a summary:
   - Build: pass/fail
   - Tests: X passed, Y failed
   - Console.logs found: list locations
   - TODOs found: list locations
   - IPC sync: any mismatches
