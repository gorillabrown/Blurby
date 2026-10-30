// Rule 53 (b): hold the app open 25 s with no input. node wait25.mjs <port>
await new Promise((r) => setTimeout(r, 25000));
