// Scratch (not committed): BAND-ALIGN-2 R6. Open the sample Meditations at its cover, switch to Focus or Flow, and
// read state (LL-166): each loaded section's stamped words, the cursor span, and the zone host's --flow-zone-top /
// --flow-zone-bottom, class list and computed mask. Then step forward until a section with stamped words shows and
// read again. Pattern: keys-fix/word-probe.mjs.
// node cover-probe.mjs <sweep.mjs dir> <exe> <profile (fresh copy)> <Focus|Flow> <port> <out.json>
import fs from "node:fs";
import path from "node:path";
const [sweepDir, exe, profile, mode, portArg, outJson] = process.argv.slice(2);
const { Session, blurbyPlan, enter, runSteps, sleep, hashLive } = await import("file:///" + path.join(sweepDir, "sweep.mjs").replace(/\\/g, "/"));
const live = path.join(process.env.APPDATA, "blurby", "blurby-data");
const liveBefore = hashLive(live);
const s = new Session({ exe, profile, port: Number(portArg), liveProfile: live });
await s.start();
const out = { exe, mode, userData: s.userData, preflight: "passed (Session.profilePreflight)", liveBefore, reads: [] };
console.log("preflight OK, userData:", s.userData);
const plan = blurbyPlan({});
await enter(s, plan, plan.surfaces.find((x) => x.name === "Reader — Page"));
await sleep(2500);
const m = mode.toLowerCase();

const READ = `(() => {
  const fv = document.querySelector("foliate-view");
  const host = document.querySelector(".rm-${m}-view");
  const sections = [];
  let cursor = null;
  try { for (const c of fv.renderer.getContents()) {
    const doc = c.doc; const words = [...doc.querySelectorAll("[data-word-index]")];
    const fr = doc.defaultView && doc.defaultView.frameElement ? doc.defaultView.frameElement.getBoundingClientRect() : null;
    sections.push({ index: c.index, stampedWords: words.length, firstWords: words.slice(0, 8).map((e) => e.textContent),
      firstIndex: words.length ? Number(words[0].getAttribute("data-word-index")) : null,
      images: doc.querySelectorAll("img, svg image, image").length, text: (doc.body?.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 160),
      frame: fr ? { top: Math.round(fr.top), height: Math.round(fr.height) } : null });
    const cs = doc.querySelector(".page-word--highlighted, .page-word--flow-cursor");
    if (cs && !cursor) { const r = cs.getBoundingClientRect(); cursor = { section: c.index, word: cs.textContent, index: Number(cs.getAttribute("data-word-index")), cls: cs.className, top: Math.round(r.top + (fr ? fr.top : 0)), height: Math.round(r.height) }; }
  } } catch (e) { sections.push({ err: String(e) }); }
  const cs = host ? getComputedStyle(host) : null;
  let band = null;
  if (host && host.style.getPropertyValue("--flow-zone-top")) {
    const hr = host.getBoundingClientRect(); const f = (v) => hr.top + (parseFloat(v) / 100) * hr.height;
    band = { top: Math.round(f(host.style.getPropertyValue("--flow-zone-top"))), bottom: Math.round(f(host.style.getPropertyValue("--flow-zone-bottom"))) };
    if (cursor) cursor.inBand = cursor.top >= band.top && cursor.top + cursor.height <= band.bottom;
  }
  return { band,
    chapter: document.querySelector(".rbb-chapter-name")?.innerText.trim() || "",
    root: !!document.querySelector(".rm-${m}-root"),
    host: host ? { className: host.className, inlineTop: host.style.getPropertyValue("--flow-zone-top") || null,
      inlineBottom: host.style.getPropertyValue("--flow-zone-bottom") || null,
      computedTop: cs.getPropertyValue("--flow-zone-top").trim(), computedBottom: cs.getPropertyValue("--flow-zone-bottom").trim(),
      mask: cs.getPropertyValue("mask-image") || cs.getPropertyValue("-webkit-mask-image"), height: Math.round(host.getBoundingClientRect().height) } : null,
    dimmed: host ? ((getComputedStyle(host).getPropertyValue("mask-image") || "none") !== "none") : null,
    cursor, sections,
  };
})()`;
const read = async (label) => { const r = await s.cdp.eval(READ); r.label = label; out.reads.push(r); console.log(label, JSON.stringify({ band: r.band, chapter: r.chapter, host: r.host && { inlineTop: r.host.inlineTop, inlineBottom: r.host.inlineBottom, cls: r.host.className }, dimmed: r.dimmed, cursor: r.cursor, sections: r.sections.map((x) => [x.index, x.stampedWords, x.images]) })); return r; };
const shot = async (n) => { const r = await s.cdp.send("Page.captureScreenshot", { format: "png" }); const f = outJson.replace(/\.json$/, `-${n}.png`); fs.writeFileSync(f, Buffer.from(r.data, "base64")); return path.basename(f); };

out.pageRead = await s.cdp.eval(`(() => { const fv = document.querySelector("foliate-view"); const r = []; try { for (const c of fv.renderer.getContents()) r.push({ index: c.index, stamped: c.doc.querySelectorAll("[data-word-index]").length, text: (c.doc.body?.innerText || "").replace(/\\s+/g, " ").trim().slice(0, 160), images: c.doc.querySelectorAll("img, image").length }); } catch (e) { r.push(String(e)); } return { chapter: document.querySelector(".rbb-chapter-name")?.innerText.trim(), sections: r }; })()`);
console.log("page:", JSON.stringify(out.pageRead));
for (let n = 0; n < Number(process.env.PRE_PAGEDOWN || 0); n++) { await s.key("PageDown"); await sleep(1500); }
await runSteps(s, [{ click: `[aria-label="${mode} mode"]`, sleep: 5000 }]);
const a = await read("cover, after switch");
out.shotCover = await shot("cover");
// If the switch started playback, record a second read while playing, then pause.
const playing = await s.cdp.eval(`!!document.querySelector('[aria-label="Pause"], .rbb-play-btn[aria-pressed="true"]')`);
out.playingAfterSwitch = playing;
// Step forward until a section with stamped words carries the cursor: PageDown in either mode, up to 6 presses.
for (let n = 1; n <= 6; n++) {
  await s.key(process.env.STEP_KEY || "PageDown"); await sleep(2500);
  const r = await read(`after ${process.env.STEP_KEY || "PageDown"} ${n}`);
  if (r.cursor) {
    // Space played Focus: pause it, then read again (the band on the paused cursor line).
    if ((process.env.STEP_KEY || "PageDown") === "Space") { await s.key("Space"); await sleep(2000); await read("paused on text"); }
    out.shotText = await shot("text");
    if (process.env.AFTER) for (const k of process.env.AFTER.split(",")) { await s.key(k); await sleep(2500); await read(`then ${k}`); }
    out.shotAfter = await shot("after"); break;
  }
}
await s.stop();
out.liveAfter = hashLive(live);
out.liveUnchanged = JSON.stringify(out.liveBefore) === JSON.stringify(out.liveAfter);
fs.writeFileSync(outJson, JSON.stringify(out, null, 2));
console.log("liveUnchanged", out.liveUnchanged);
process.exit(0);
