// FOLIATE-DISPLAY-LIFETIME-1 RodneySr job: shared CDP page helpers for the two authored routes (cycles, owned91).
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export async function page(port) {
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const target = list.find((t) => t.type === "page" && !t.url.startsWith("devtools"));
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0; const pending = new Map();
  ws.onmessage = (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
  const click = (js) => ev(`(() => { const el = ${js}; if (!el) return false; el.click(); return true; })()`);
  const key = async (code, vk) => { for (const type of ["rawKeyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, code, key: code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }); };
  const shot = async (file) => { const fs = await import("node:fs"); const s = await send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(file, Buffer.from(s.result.data, "base64")); };
  await send("Page.enable");
  return { ws, send, ev, click, key, shot };
}
