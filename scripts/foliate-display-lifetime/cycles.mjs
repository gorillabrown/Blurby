// FOLIATE-DISPLAY-LIFETIME-1 RodneySr job, route 3 second half: exactly 5 fixed-delay Flow/Narrate cycles, run right
// after modes.mjs in the same launch. Timing AUTHORED, SPEC SILENT (the investigator script that defined the original
// delays was not supplied; Blurby.Brain 2026-10-30): per mode, select 5 s, Play 20 s, Pause 2 s. No retry, no adaptation.
// node cycles.mjs <port> <outJson>
import fs from "node:fs";
import { page, sleep } from "./cdp.mjs";
const [port, outJson] = process.argv.slice(2);
const p = await page(port);
const byLabel = (l) => `document.querySelector('[aria-label="${l}"]')`;
const state = () => p.ev(`(() => { const root = document.querySelector("[class*='rm-'][class*='-root']"); const fv = document.querySelector("foliate-view");
  const words = (fv?.renderer?.getContents?.() || []).reduce((n, c) => n + (c.doc?.querySelectorAll?.("[data-word-index]")?.length || 0), 0);
  return { root: root ? root.className.split(" ").find((c) => /^rm-.*-root$/.test(c)) : null, foliateView: !!fv, words }; })()`);
const out = { timing: "authored, spec silent: select 5 s, Play 20 s, Pause 2 s per mode", cycles: [] };
for (let i = 1; i <= 5; i++) {
  const c = { cycle: i };
  for (const mode of ["Flow", "Narrate"]) {
    const r = { selected: await p.click(byLabel(`${mode} mode`)) };
    await sleep(5000); r.entered = await state();
    r.play = await p.click(byLabel("Play")); await sleep(20000); r.playing = await state();
    r.pause = await p.click(byLabel("Pause")); await sleep(2000); r.paused = await state();
    c[mode] = r;
  }
  out.cycles.push(c); console.log(JSON.stringify(c));
}
fs.writeFileSync(outJson, JSON.stringify(out, null, 2));
p.ws.close();
